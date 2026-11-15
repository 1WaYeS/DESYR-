"""Idempotent price processing and delivery with explicit ambiguous SMTP handling."""
import smtplib
from email.utils import parseaddr
from decimal import Decimal, ROUND_HALF_UP
from celery import shared_task
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.db import transaction, OperationalError
from django.template.loader import render_to_string
from django.utils import timezone
from .models import AlertIdentity, PriceNotification
from .services import evaluate_event

@shared_task(autoretry_for=(OperationalError,), retry_backoff=True, max_retries=4)
def evaluate_price_event(event_id):
    evaluate_event(event_id)

@shared_task(bind=True, max_retries=4)
def deliver_price_notification(self, notification_id):
    # Commit the delivery claim before talking to SMTP. Other workers cannot resend it.
    with transaction.atomic():
        note = PriceNotification.objects.select_for_update().select_related('alert__customer').get(pk=notification_id)
        if note.delivery_status not in ('PENDING','RETRY'):
            return
        user = note.alert.customer
        if user.email != note.recipient or not AlertIdentity.verified_for(user):
            note.delivery_status = 'FAILED'
            note.error = 'Account email is no longer verified or has changed.'
            note.save(update_fields=['delivery_status','error'])
            return
        note.delivery_status = 'SENDING'
        note.attempts += 1
        note.attempted_at = timezone.now()
        note.save(update_fields=['delivery_status','attempts','attempted_at'])
    actual = ((note.reference_price - note.selling_price) / note.reference_price * Decimal(100)).quantize(Decimal('.01'), rounding=ROUND_HALF_UP)
    context = {'note':note, 'actual_discount':actual, 'alerts_url':settings.FRONTEND_URL + '#/price-alerts'}
    sender_domain = parseaddr(settings.DEFAULT_FROM_EMAIL)[1].rsplit('@',1)[-1]
    message = EmailMultiAlternatives('DESYR: your price target has been reached', render_to_string('price_alerts/email.txt',context), settings.DEFAULT_FROM_EMAIL, [note.recipient], headers={'Message-ID':f'<desyr-price-alert-{note.pk}@{sender_domain}>'})
    message.attach_alternative(render_to_string('price_alerts/email.html',context), 'text/html')
    try:
        if not note.live_delivery or settings.PRICE_ALERT_DELIVERY_MODE != 'smtp':
            # Preview events are recorded honestly; they are never labelled sent.
            PriceNotification.objects.filter(pk=note.pk).update(delivery_status='PREVIEW', error='Email preview only; no live delivery configured.')
            return
        sent = message.send(fail_silently=False)
        if sent != 1:
            raise smtplib.SMTPConnectError(421, 'Email service did not accept the message.')
    except (smtplib.SMTPConnectError, smtplib.SMTPAuthenticationError, smtplib.SMTPRecipientsRefused, smtplib.SMTPDataError, ConnectionRefusedError) as exc:
        # These failures reject the message, so retries are safe.
        code = getattr(exc, 'smtp_code', None)
        temporary = isinstance(exc, ConnectionRefusedError) or (isinstance(code, int) and 400 <= code < 500)
        if isinstance(exc, smtplib.SMTPRecipientsRefused):
            temporary = any(400 <= value[0] < 500 for value in exc.recipients.values())
        retry = temporary and note.attempts < 5
        PriceNotification.objects.filter(pk=note.pk).update(delivery_status='RETRY' if retry else 'FAILED', error=type(exc).__name__)
        if retry:
            raise self.retry(exc=exc, countdown=min(60 * 2 ** (note.attempts-1), 900))
        return
    except Exception as exc:
        # SMTP can lose the connection after accepting DATA. Blind retrying could
        # send two emails. Keep UNKNOWN for provider/admin reconciliation instead.
        PriceNotification.objects.filter(pk=note.pk).update(delivery_status='UNKNOWN', error=type(exc).__name__)
        return
    PriceNotification.objects.filter(pk=note.pk).update(delivery_status='SENT', delivered_at=timezone.now(), error='')

@shared_task
def reconcile_outbox():
    # This checks recorded jobs, not product websites or arbitrary customer prices.
    from django.core.management import call_command
    call_command('reconcile_price_alerts')
