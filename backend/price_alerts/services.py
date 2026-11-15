"""Business rules shared by the API, administrator and official price adapters."""
import logging
import uuid
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP
from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.db import IntegrityError, transaction
from django.utils import timezone
from .models import AlertIdentity, CatalogProduct, DISCOUNTS, PriceAlert, PriceEvent, PriceNotification

logger = logging.getLogger(__name__)

class DomainError(Exception):
    def __init__(self, message, status=400):
        super().__init__(message)
        self.status = status

def money(value):
    """Use Decimal and half-up rounding, never binary floats, for BDT amounts."""
    try:
        if isinstance(value, (float, bool)):
            raise ValueError
        amount = Decimal(str(value))
        if not amount.is_finite() or amount < 0 or amount > Decimal('9999999999.99'):
            raise ValueError
        return amount.quantize(Decimal('.01'), rounding=ROUND_HALF_UP)
    except (InvalidOperation, ValueError, TypeError):
        raise DomainError('Use a nonnegative price string with at most 10 integer digits.')

def percentage(value):
    if type(value) is not int or value not in DISCOUNTS:
        raise DomainError('Choose 10%, 20%, 30%, 40% or 50%.')
    return value

def target_price(reference, discount):
    return money(money(reference) * (Decimal(100) - percentage(discount)) / Decimal(100))

def verified_customer(customer):
    try:
        validate_email(customer.email)
    except ValidationError:
        raise DomainError('Your account needs a valid verified email address.', 403)
    if not AlertIdentity.verified_for(customer):
        raise DomainError('Verify your account email before creating price alerts.', 403)

def dispatch_event(event_id):
    # The database outbox survives a Redis outage. Never discard a price event.
    from .tasks import evaluate_price_event
    try:
        evaluate_price_event.delay(str(event_id))
    except Exception:
        logger.warning('Price evaluation is queued in the database; run reconciliation when the broker recovers.')

def dispatch_notification(notification_id):
    from .tasks import deliver_price_notification
    try:
        deliver_price_notification.delay(str(notification_id))
    except Exception:
        logger.warning('Email remains in the database outbox; run reconciliation when the broker recovers.')

def check_alert(alert):
    event = PriceEvent.objects.create(product=alert.product, kind='CHECK', old_price=alert.product.current_price, new_price=alert.product.current_price, selling_price=alert.product.current_price, scope_alert=alert, actor=alert.customer)
    transaction.on_commit(lambda: dispatch_event(event.id))

def create_alert(customer, external_id, discount, request_id):
    verified_customer(customer)
    if not isinstance(external_id, str) or not external_id or len(external_id) > 80:
        raise DomainError('Choose a valid product.')
    discount = percentage(discount)
    try:
        request_key = f'{customer.pk}:{uuid.UUID(str(request_id))}'
    except (ValueError, TypeError, AttributeError):
        raise DomainError('Provide a valid requestId to prevent duplicate submissions.')
    try:
        with transaction.atomic():
            existing = PriceAlert.objects.filter(request_key=request_key).first()
            if existing:
                return existing
            product = CatalogProduct.objects.select_for_update().get(external_id=external_id)
            existing = PriceAlert.objects.filter(request_key=request_key).first()
            if existing:
                return existing
            if not product.is_live and not settings.DEBUG:
                raise DomainError('This product does not have an official live price source yet.', 409)
            key = f'{customer.pk}:{product.pk}'
            if PriceAlert.objects.filter(open_key=key).exists():
                raise DomainError('You already have an active or paused alert for this product. Edit it from My Price Alerts.', 409)
            if PriceAlert.objects.filter(customer=customer, status__in=['ACTIVE','PAUSED']).count() >= 1000:
                raise DomainError('Please remove unused alerts before creating more.', 429)
            alert = PriceAlert.objects.create(customer=customer, product=product, discount=discount, reference_price=product.reference_price, target_price=target_price(product.reference_price, discount), open_key=key, request_key=request_key)
            check_alert(alert)
        alert.refresh_from_db()
        return alert
    except CatalogProduct.DoesNotExist:
        raise DomainError('Product not found.', 404)
    except IntegrityError:
        existing = PriceAlert.objects.filter(request_key=request_key).first()
        if existing:
            return existing
        raise DomainError('An alert for this product already exists.', 409)

def edit_alert(customer, alert_id, action, discount=None):
    with transaction.atomic():
        try:
            alert = PriceAlert.objects.select_for_update().select_related('product').get(pk=alert_id, customer=customer)
        except (PriceAlert.DoesNotExist, ValidationError, ValueError):
            raise DomainError('Alert not found.', 404)
        if alert.status == 'CANCELLED':
            raise DomainError('This alert was deleted.', 409)
        if action == 'edit':
            alert.discount = percentage(discount)
            # Customer edits never read a new reference price from the product.
            alert.target_price = target_price(alert.reference_price, alert.discount)
        elif action == 'pause' and alert.status == 'ACTIVE':
            alert.status = 'PAUSED'
        elif action == 'resume' and alert.status == 'PAUSED':
            verified_customer(customer)
            alert.status = 'ACTIVE'
        elif action == 'delete':
            alert.status = 'CANCELLED'
            alert.open_key = None
        else:
            raise DomainError('This action is not allowed for the alert’s current status.', 409)
        alert.eligible_after = timezone.now()
        alert.save()
        if alert.status == 'ACTIVE' and action in ('edit','resume'):
            check_alert(alert)
    alert.refresh_from_db()
    return alert

def update_price(actor, external_id, kind, value, reason):
    if not actor.has_perm('price_alerts.change_catalogproduct'):
        raise DomainError('Only authorized price administrators can update official prices.', 403)
    if kind not in ('selling','reference') or not isinstance(reason, str) or not reason.strip():
        raise DomainError('Choose selling/reference and provide an audit reason.')
    price = money(value)
    if kind == 'reference' and price <= 0:
        raise DomainError('Reference price must be positive.')
    with transaction.atomic():
        try:
            product = CatalogProduct.objects.select_for_update().get(external_id=external_id)
        except CatalogProduct.DoesNotExist:
            raise DomainError('Product not found.', 404)
        field = 'current_price' if kind == 'selling' else 'reference_price'
        old = getattr(product, field)
        if old == price:
            return None
        setattr(product, field, price)
        product.save(update_fields=[field,'updated_at'])
        now = timezone.now()
        event = PriceEvent.objects.create(product=product, kind=kind.upper(), old_price=old, new_price=price, selling_price=product.current_price, actor=actor, reason=reason.strip()[:240], processed_at=now if kind == 'reference' else None)
        if kind == 'reference':
            # A reference-only update recalculates open alerts, but never emails.
            for alert in PriceAlert.objects.select_for_update().filter(product=product, status__in=['ACTIVE','PAUSED']).order_by('id'):
                alert.reference_price = price
                alert.target_price = target_price(price, alert.discount)
                alert.eligible_after = now
                alert.save(update_fields=['reference_price','target_price','eligible_after','updated_at'])
        else:
            transaction.on_commit(lambda: dispatch_event(event.id))
    return event

def evaluate_event(event_id):
    """Check immutable price snapshots, even if a price rebounds before a worker runs."""
    with transaction.atomic():
        event = PriceEvent.objects.select_for_update().select_related('product').get(pk=event_id)
        if event.processed_at or event.kind == 'REFERENCE':
            return
        alerts = PriceAlert.objects.select_for_update().select_related('customer','product').filter(product=event.product, status='ACTIVE', eligible_after__lte=event.created_at).order_by('id')
        if event.scope_alert_id:
            alerts = alerts.filter(pk=event.scope_alert_id)
        for alert in alerts:
            if event.selling_price > alert.target_price:
                continue
            # Row locks, a compare-and-set and the OneToOne constraint prevent duplicates.
            changed = PriceAlert.objects.filter(pk=alert.pk, status='ACTIVE').update(status='TRIGGERED', open_key=None, updated_at=timezone.now())
            if not changed:
                continue
            note, created = PriceNotification.objects.get_or_create(alert=alert, defaults={'price_event':event, 'reference_price':alert.reference_price, 'target_price':alert.target_price, 'selling_price':event.selling_price, 'discount':alert.discount, 'recipient':alert.customer.email, 'product_name':alert.product.name, 'product_url':alert.product.product_url, 'image_url':alert.product.image_url, 'live_delivery':alert.product.is_live and settings.PRICE_ALERT_DELIVERY_MODE == 'smtp'})
            if created:
                transaction.on_commit(lambda note_id=note.pk: dispatch_notification(note_id))
        event.processed_at = timezone.now()
        event.save(update_fields=['processed_at'])
