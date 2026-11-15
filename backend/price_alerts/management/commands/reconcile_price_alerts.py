from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from price_alerts.models import PriceEvent,PriceNotification
from price_alerts.services import dispatch_event,dispatch_notification

class Command(BaseCommand):
    help = 'Requeue persisted events and safe email retries; ambiguous SMTP attempts need review.'
    def handle(self,*args,**options):
        PriceNotification.objects.filter(delivery_status='SENDING',attempted_at__lt=timezone.now()-timedelta(minutes=10)).update(delivery_status='UNKNOWN',error='Delivery claim expired; verify with email provider before retrying.')
        for pk in PriceEvent.objects.filter(processed_at__isnull=True).exclude(kind='REFERENCE').values_list('pk',flat=True):
            dispatch_event(pk)
        for pk in PriceNotification.objects.filter(delivery_status__in=['PENDING','RETRY']).values_list('pk',flat=True):
            dispatch_notification(pk)
        self.stdout.write('Reconciliation queued. UNKNOWN deliveries were not resent.')
