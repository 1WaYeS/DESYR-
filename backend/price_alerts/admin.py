from django.contrib import admin
from django.core.exceptions import ValidationError
from .models import AlertIdentity,CatalogProduct,PriceAlert,PriceEvent,PriceNotification
from .services import update_price,DomainError

@admin.register(CatalogProduct)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('external_id','name','reference_price','current_price','is_live')
    search_fields = ('external_id','name')
    def save_model(self,request,obj,form,change):
        if not change:
            super().save_model(request,obj,form,change)
            return
        try:
            update_price(request.user,obj.external_id,'reference',obj.reference_price,'Authorized Django admin update')
            update_price(request.user,obj.external_id,'selling',obj.current_price,'Authorized Django admin update')
            CatalogProduct.objects.filter(pk=obj.pk).update(name=obj.name,brand_id=obj.brand_id,product_url=obj.product_url,image_url=obj.image_url,is_live=obj.is_live)
        except DomainError as exc:
            raise ValidationError(str(exc))

@admin.register(AlertIdentity)
class IdentityAdmin(admin.ModelAdmin):
    list_display = ('user','email_verified','verified_email')
    readonly_fields = ('verified_email',)

class ReadOnlyAdmin(admin.ModelAdmin):
    def has_add_permission(self,request):
        return False
    def has_change_permission(self,request,obj=None):
        return False
    def has_delete_permission(self,request,obj=None):
        return False

@admin.register(PriceAlert)
class AlertAdmin(ReadOnlyAdmin):
    list_display = ('id','customer','product','discount','reference_price','target_price','status')
    list_filter = ('status',)

@admin.register(PriceEvent)
class EventAdmin(ReadOnlyAdmin):
    list_display = ('id','product','kind','old_price','new_price','created_at','processed_at')

@admin.register(PriceNotification)
class NotificationAdmin(ReadOnlyAdmin):
    list_display = ('id','alert','delivery_status','attempts','created_at')
