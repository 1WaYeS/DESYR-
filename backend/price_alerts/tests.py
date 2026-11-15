import smtplib
import uuid
from decimal import Decimal
from unittest import skipUnless
from unittest.mock import patch
from django.contrib.auth import get_user_model
from django.core import mail
from django.core.cache import cache
from django.db import IntegrityError,connection,transaction,close_old_connections
from django.test import Client,TestCase,TransactionTestCase,override_settings
from .models import AlertIdentity,CatalogProduct,PriceAlert,PriceEvent,PriceNotification
from .services import DomainError,create_alert,edit_alert,evaluate_event,money,target_price,update_price
from .tasks import deliver_price_notification

@override_settings(PRICE_ALERT_DELIVERY_MODE='smtp',EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
class PriceAlertTests(TestCase):
    def setUp(self):
        cache.clear()
        users=get_user_model()
        self.user=users.objects.create_user('customer','customer@example.invalid','test-only-password')
        self.other=users.objects.create_user('other','other@example.invalid','test-only-password')
        self.admin=users.objects.create_superuser('admin','admin@example.invalid','test-only-password')
        AlertIdentity.objects.create(user=self.user,email_verified=True)
        AlertIdentity.objects.create(user=self.other,email_verified=True)
        self.product=CatalogProduct.objects.create(external_id='gg-210906',name='Test polo',brand_id='gorur-ghash',product_url='https://gorurghash.com/product/test/',image_url='https://example.invalid/image.jpg',reference_price='2000',current_price='2000',is_live=True)

    def create(self,discount=20,user=None,request_id=None,product=None):
        return create_alert(user or self.user,(product or self.product).external_id,discount,request_id or uuid.uuid4())

    def price(self,value,process=True,kind='selling'):
        event=update_price(self.admin,self.product.external_id,kind,value,'Test authorized price event')
        if event and process:
            evaluate_event(event.pk)
        return event

    def trigger(self):
        alert=self.create()
        self.price('1600')
        return alert,PriceNotification.objects.get(alert=alert)

    def test_all_discount_options_and_rounding(self):
        for value in (10,20,30,40,50):
            self.assertEqual(target_price('2000',value),Decimal(2000*(100-value)//100))
        self.assertEqual(target_price('10.05',50),Decimal('5.03'))
        self.assertEqual(target_price('1899',30),Decimal('1329.30'))
        for value in (0,15,100,True,'20'):
            with self.assertRaises(DomainError): target_price('2000',value)
        for value in (float('nan'),10.05,'NaN','Infinity','-1'):
            with self.assertRaises(DomainError): money(value)

    def test_duplicate_active_and_paused_alerts_blocked(self):
        alert=self.create()
        with self.assertRaises(DomainError):self.create(30)
        edit_alert(self.user,alert.pk,'pause')
        with self.assertRaises(DomainError):self.create(40)

    def test_request_idempotency_survives_triggered_status(self):
        key=uuid.uuid4();first=self.create(request_id=key)
        self.price('1600')
        repeated=self.create(request_id=key)
        self.assertEqual(first.pk,repeated.pk)
        self.assertEqual(PriceAlert.objects.count(),1)

    def test_independent_products_and_fixed_reference_on_edit(self):
        second=CatalogProduct.objects.create(external_id='second',name='Second',brand_id='guzel',product_url='https://example.invalid/p',reference_price='3000',current_price='3000',is_live=True)
        first=self.create(20);other=self.create(50,product=second)
        edit_alert(self.user,first.pk,'edit',40)
        first.refresh_from_db();other.refresh_from_db()
        self.assertEqual(first.reference_price,Decimal('2000'))
        self.assertEqual(first.target_price,Decimal('1200'))
        self.assertEqual(other.discount,50)
        self.assertEqual(other.target_price,Decimal('1500'))

    def test_unauthorized_price_update_rejected(self):
        with self.assertRaises(DomainError):update_price(self.user,self.product.external_id,'selling','1000','Unauthorized')
        self.product.refresh_from_db();self.assertEqual(self.product.current_price,Decimal('2000'))

    def test_authorized_reference_recalculates_without_notification(self):
        first=self.create(20);paused=self.create(40,user=self.other)
        edit_alert(self.other,paused.pk,'pause')
        self.price('3000',kind='reference')
        first.refresh_from_db();paused.refresh_from_db()
        self.assertEqual(first.target_price,Decimal('2400'));self.assertEqual(paused.target_price,Decimal('1800'))
        self.assertEqual(first.discount,20);self.assertEqual(paused.status,'PAUSED')
        for event in PriceEvent.objects.filter(processed_at__isnull=True):evaluate_event(event.pk)
        self.assertFalse(PriceNotification.objects.exists())
        self.assertEqual(PriceEvent.objects.filter(kind='REFERENCE').count(),1)

    def test_equal_or_below_threshold_only_qualifying_customer(self):
        first=self.create(20);other=self.create(50,user=self.other)
        self.price('1700');self.assertFalse(PriceNotification.objects.exists())
        self.price('1600');self.assertEqual(PriceNotification.objects.count(),1)
        self.assertEqual(PriceNotification.objects.get().alert_id,first.pk)
        self.price('900');self.assertEqual(PriceNotification.objects.count(),2)
        other.refresh_from_db();self.assertEqual(other.status,'TRIGGERED')

    def test_further_drops_rebounds_and_edits_never_reactivate(self):
        alert,note=self.trigger()
        self.price('1200');self.price('1900');self.price('1000')
        edit_alert(self.user,alert.pk,'edit',50)
        alert.refresh_from_db();note.refresh_from_db()
        self.assertEqual(alert.status,'TRIGGERED');self.assertEqual(note.target_price,Decimal('1600'))
        self.assertEqual(PriceNotification.objects.count(),1)
        with self.assertRaises(DomainError):edit_alert(self.user,alert.pk,'resume')
        new=self.create(30)
        self.assertNotEqual(new.pk,alert.pk)

    def test_pause_resume_delete(self):
        alert=self.create();edit_alert(self.user,alert.pk,'pause');self.price('1000')
        self.assertFalse(PriceNotification.objects.exists())
        edit_alert(self.user,alert.pk,'resume')
        evaluate_event(PriceEvent.objects.filter(scope_alert=alert).latest('created_at').pk)
        self.assertEqual(PriceNotification.objects.count(),1)
        edit_alert(self.user,alert.pk,'delete');alert.refresh_from_db()
        self.assertEqual(alert.status,'CANCELLED');self.assertEqual(PriceNotification.objects.count(),1)

    def test_cancelled_waiting_alert_never_triggers(self):
        alert=self.create();edit_alert(self.user,alert.pk,'delete');self.price('1000')
        self.assertFalse(PriceNotification.objects.exists())

    def test_duplicate_event_processing_is_idempotent(self):
        self.create();event=self.price('1600',process=False)
        evaluate_event(event.pk);evaluate_event(event.pk)
        self.assertEqual(PriceNotification.objects.count(),1)

    def test_price_snapshot_survives_fast_rebound(self):
        self.create();low=self.price('1600',process=False);high=self.price('1900',process=False)
        evaluate_event(high.pk);evaluate_event(low.pk)
        self.assertEqual(PriceNotification.objects.get().selling_price,Decimal('1600'))

    def test_unverified_email_cannot_create(self):
        AlertIdentity.objects.filter(user=self.user).update(email_verified=False)
        with self.assertRaises(DomainError):self.create()

    def test_email_change_requires_a_new_confirmation(self):
        _,note=self.trigger()
        self.user.email='changed@example.invalid';self.user.save(update_fields=['email'])
        with self.assertRaises(DomainError):self.create()
        with patch('price_alerts.tasks.EmailMultiAlternatives.send') as send:
            deliver_price_notification.run(str(note.pk));send.assert_not_called()
        identity=AlertIdentity.objects.get(user=self.user)
        identity.email_verified=False;identity.save()
        identity.email_verified=True;identity.save()
        self.assertTrue(AlertIdentity.verified_for(self.user))

    @override_settings(DEBUG=False)
    def test_nonlive_product_cannot_create_production_alert(self):
        self.product.is_live=False;self.product.save()
        with self.assertRaises(DomainError):self.create()

    def test_delivery_plain_and_html_once(self):
        _,note=self.trigger()
        deliver_price_notification.run(str(note.pk));deliver_price_notification.run(str(note.pk))
        self.assertEqual(len(mail.outbox),1)
        self.assertEqual(len(mail.outbox[0].alternatives),1)
        self.assertIn('BDT 1600.00',mail.outbox[0].body)
        note.refresh_from_db();self.assertEqual(note.delivery_status,'SENT')

    def test_safe_email_failure_retries_existing_event(self):
        _,note=self.trigger()
        with patch('price_alerts.tasks.EmailMultiAlternatives.send',side_effect=smtplib.SMTPConnectError(421,'Connection rejected')):
            with self.assertRaises(smtplib.SMTPConnectError):deliver_price_notification.run(str(note.pk))
        note.refresh_from_db();self.assertEqual(note.delivery_status,'RETRY')
        deliver_price_notification.run(str(note.pk));note.refresh_from_db()
        self.assertEqual(note.attempts,2);self.assertEqual(note.delivery_status,'SENT');self.assertEqual(PriceNotification.objects.count(),1)

    def test_ambiguous_email_is_not_blindly_resent(self):
        _,note=self.trigger()
        with patch('price_alerts.tasks.EmailMultiAlternatives.send',side_effect=smtplib.SMTPServerDisconnected('Ambiguous acceptance')) as send:
            deliver_price_notification.run(str(note.pk));deliver_price_notification.run(str(note.pk))
            self.assertEqual(send.call_count,1)
        note.refresh_from_db();self.assertEqual(note.delivery_status,'UNKNOWN')

    def test_permanent_rejection_is_not_retried(self):
        _,note=self.trigger()
        with patch('price_alerts.tasks.EmailMultiAlternatives.send',side_effect=smtplib.SMTPAuthenticationError(535,'Rejected')) as send:
            deliver_price_notification.run(str(note.pk));deliver_price_notification.run(str(note.pk))
            self.assertEqual(send.call_count,1)
        note.refresh_from_db();self.assertEqual(note.delivery_status,'FAILED')

    @override_settings(PRICE_ALERT_DELIVERY_MODE='preview')
    def test_preview_never_sends_or_claims_sent(self):
        _,note=self.trigger()
        with patch('price_alerts.tasks.EmailMultiAlternatives.send') as send:
            deliver_price_notification.run(str(note.pk));send.assert_not_called()
        note.refresh_from_db();self.assertEqual(note.delivery_status,'PREVIEW')

    def test_customer_ownership_and_csrf(self):
        alert=self.create();self.client.force_login(self.other)
        response=self.client.post(f'/api/price-alerts/alerts/{alert.pk}/',data={'action':'delete'},content_type='application/json')
        self.assertEqual(response.status_code,404)
        self.assertEqual(self.client.get('/api/price-alerts/alerts/').json()['alerts'],[])
        client=Client(enforce_csrf_checks=True);client.force_login(self.user)
        self.assertEqual(client.post('/api/price-alerts/alerts/',data={},content_type='application/json').status_code,403)
        token=client.get('/api/price-alerts/session/').json()['csrfToken']
        response=client.post('/api/price-alerts/alerts/',data={'productId':self.product.external_id,'discount':15,'referenceCents':1,'requestId':str(uuid.uuid4())},content_type='application/json',HTTP_X_CSRFTOKEN=token)
        self.assertEqual(response.status_code,400)

    def test_client_prices_are_ignored_and_invalid_product_is_rejected(self):
        self.client.force_login(self.user)
        response=self.client.post('/api/price-alerts/alerts/',data={'productId':self.product.external_id,'discount':20,'referenceCents':1,'targetCents':1,'requestId':str(uuid.uuid4())},content_type='application/json')
        self.assertEqual(response.status_code,201);self.assertEqual(response.json()['alert']['targetCents'],160000)
        response=self.client.post('/api/price-alerts/alerts/',data={'productId':{},'discount':20,'requestId':str(uuid.uuid4())},content_type='application/json')
        self.assertEqual(response.status_code,400)

    def test_duplicate_constraint_enforced(self):
        alert=self.create()
        with self.assertRaises(IntegrityError),transaction.atomic():
            PriceAlert.objects.create(customer=self.user,product=self.product,discount=20,reference_price=2000,target_price=1600,open_key=alert.open_key)

@skipUnless(connection.vendor=='mysql','MySQL concurrency checks require the production database service.')
class MySQLConcurrencyTests(TransactionTestCase):
    def test_two_workers_record_only_one_notification(self):
        from concurrent.futures import ThreadPoolExecutor
        from threading import Barrier
        user=get_user_model().objects.create_user('race','race@example.invalid','test-only-password')
        AlertIdentity.objects.create(user=user,email_verified=True)
        product=CatalogProduct.objects.create(external_id='race',name='Race',brand_id='guzel',product_url='https://example.invalid/p',reference_price='2000',current_price='2000',is_live=True)
        with patch('price_alerts.services.dispatch_event'),patch('price_alerts.services.dispatch_notification'):
            create_alert(user,product.external_id,20,uuid.uuid4())
            event=PriceEvent.objects.create(product=product,kind='SELLING',old_price=2000,new_price=1600,selling_price=1600)
            barrier=Barrier(2)
            def run():
                close_old_connections();barrier.wait()
                try:evaluate_event(event.pk)
                finally:close_old_connections()
            with ThreadPoolExecutor(max_workers=2) as pool:list(pool.map(lambda _:run(),range(2)))
        self.assertEqual(PriceNotification.objects.count(),1)
