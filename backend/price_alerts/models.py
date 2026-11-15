"""Price-alert data only. CatalogProduct mirrors the team's external catalog."""
import uuid
from django.conf import settings
from django.db import models
from django.db.models import Q
from django.utils import timezone

DISCOUNTS = (10, 20, 30, 40, 50)

class CatalogProduct(models.Model):
    external_id = models.CharField(max_length=80, unique=True)
    name = models.CharField(max_length=240)
    brand_id = models.CharField(max_length=50)
    product_url = models.URLField(max_length=600)
    image_url = models.URLField(max_length=600, blank=True)
    reference_price = models.DecimalField(max_digits=12, decimal_places=2)
    current_price = models.DecimalField(max_digits=12, decimal_places=2)
    is_live = models.BooleanField(default=False, help_text='Only enable after connecting an authorized official price source.')
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        constraints = [models.CheckConstraint(condition=Q(reference_price__gt=0), name='positive_reference_price'), models.CheckConstraint(condition=Q(current_price__gte=0), name='nonnegative_selling_price')]
    def __str__(self):
        return self.name

class AlertIdentity(models.Model):
    # Reuse Django's user model instead of creating a second authentication system.
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    email_verified = models.BooleanField(default=False)
    verified_email = models.EmailField(blank=True, editable=False)
    def save(self,*args,**kwargs):
        # Confirmation belongs to a specific address, not just a user account.
        if not self.email_verified:
            self.verified_email = ''
        elif not self.verified_email:
            self.verified_email = self.user.email.strip().casefold()
        if kwargs.get('update_fields') is not None:
            kwargs['update_fields'] = set(kwargs['update_fields']) | {'verified_email'}
        super().save(*args,**kwargs)
    @classmethod
    def verified_for(cls,user):
        return cls.objects.filter(user=user,email_verified=True,verified_email__iexact=user.email.strip()).exists()
    def __str__(self):
        return str(self.user)

class PriceAlert(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    product = models.ForeignKey(CatalogProduct, on_delete=models.PROTECT)
    discount = models.PositiveSmallIntegerField(choices=[(v, str(v)) for v in DISCOUNTS])
    reference_price = models.DecimalField(max_digits=12, decimal_places=2)
    target_price = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=12, default='ACTIVE', choices=[(s, s) for s in ('ACTIVE','PAUSED','TRIGGERED','CANCELLED')])
    # Nullable unique keys work in MySQL; partial unique indexes do not.
    # A paused alert also reserves its customer's product slot.
    open_key = models.CharField(max_length=160, unique=True, null=True, editable=False)
    request_key = models.CharField(max_length=160, unique=True, null=True, editable=False)
    eligible_after = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        indexes = [models.Index(fields=['product','status']), models.Index(fields=['customer','status'])]
        constraints = [models.CheckConstraint(condition=Q(discount__in=DISCOUNTS), name='valid_alert_discount'), models.CheckConstraint(condition=Q(reference_price__gt=0) & Q(target_price__gte=0), name='valid_alert_prices'), models.CheckConstraint(condition=(Q(status__in=['ACTIVE','PAUSED'],open_key__isnull=False) | Q(status__in=['TRIGGERED','CANCELLED'],open_key__isnull=True)), name='valid_alert_lifecycle')]

class PriceEvent(models.Model):
    """Immutable price snapshots also form the recoverable task outbox."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(CatalogProduct, on_delete=models.PROTECT)
    kind = models.CharField(max_length=12, choices=[(s,s) for s in ('SELLING','REFERENCE','CHECK')])
    old_price = models.DecimalField(max_digits=12, decimal_places=2)
    new_price = models.DecimalField(max_digits=12, decimal_places=2)
    selling_price = models.DecimalField(max_digits=12, decimal_places=2)
    scope_alert = models.ForeignKey(PriceAlert, null=True, blank=True, on_delete=models.PROTECT)
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL)
    reason = models.CharField(max_length=240, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    processed_at = models.DateTimeField(null=True, blank=True)
    class Meta:
        indexes = [models.Index(fields=['processed_at','kind'])]

class PriceNotification(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    alert = models.OneToOneField(PriceAlert, on_delete=models.PROTECT)
    price_event = models.ForeignKey(PriceEvent, on_delete=models.PROTECT)
    reference_price = models.DecimalField(max_digits=12, decimal_places=2)
    target_price = models.DecimalField(max_digits=12, decimal_places=2)
    selling_price = models.DecimalField(max_digits=12, decimal_places=2)
    discount = models.PositiveSmallIntegerField()
    recipient = models.EmailField()
    product_name = models.CharField(max_length=240)
    product_url = models.URLField(max_length=600)
    image_url = models.URLField(max_length=600, blank=True)
    delivery_status = models.CharField(max_length=16, default='PENDING', choices=[(s,s) for s in ('PENDING','SENDING','RETRY','SENT','PREVIEW','FAILED','UNKNOWN')])
    attempts = models.PositiveSmallIntegerField(default=0)
    created_at = models.DateTimeField(default=timezone.now)
    attempted_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    error = models.CharField(max_length=300, blank=True)
    live_delivery = models.BooleanField(default=False)
    class Meta:
        indexes = [models.Index(fields=['delivery_status','attempted_at'])]
