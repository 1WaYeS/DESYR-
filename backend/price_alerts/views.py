"""Small JSON API for the existing magazine frontend; session auth and CSRF stay enabled."""
import json
from functools import wraps
from django.conf import settings
from django.contrib.auth import authenticate, login, logout
from django.core.cache import cache
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_http_methods
from .models import AlertIdentity, CatalogProduct, PriceAlert, PriceNotification
from .services import DomainError, create_alert, edit_alert, update_price

def cents(value):
    return int(value * 100)

def product_data(product):
    return {'id':product.external_id,'name':product.name,'brandId':product.brand_id,'url':product.product_url,'image':product.image_url,'referenceCents':cents(product.reference_price),'currentCents':cents(product.current_price),'isLive':product.is_live}

def alert_data(alert):
    return {'id':str(alert.pk),'productId':alert.product.external_id,'product':product_data(alert.product),'discount':alert.discount,'referenceCents':cents(alert.reference_price),'targetCents':cents(alert.target_price),'currentCents':cents(alert.product.current_price),'status':alert.status,'createdAt':alert.created_at.isoformat()}

def notification_data(note):
    return {'id':str(note.pk),'alertId':str(note.alert_id),'productId':note.alert.product.external_id,'referenceCents':cents(note.reference_price),'targetCents':cents(note.target_price),'sellingCents':cents(note.selling_price),'discount':note.discount,'deliveryStatus':note.delivery_status,'createdAt':note.created_at.isoformat(),'deliveredAt':note.delivered_at.isoformat() if note.delivered_at else None}

def body(request):
    try:
        data = json.loads(request.body or b'{}')
    except (ValueError, UnicodeDecodeError):
        raise DomainError('Use a valid JSON object.')
    if not isinstance(data, dict):
        raise DomainError('Use a valid JSON object.')
    return data

def limit(request, scope, count):
    # Redis uses atomic cache increments in production; development uses LocMem.
    owner = str(request.user.pk) if request.user.is_authenticated else request.META.get('REMOTE_ADDR','unknown')
    key = f'price-alerts:{scope}:{owner}'
    cache.add(key,0,300)
    if cache.incr(key) > count:
        raise DomainError('Too many requests. Please try again in a few minutes.',429)

def api(methods, auth=True):
    def decorator(fn):
        @require_http_methods(methods)
        @wraps(fn)
        def wrapped(request,*args,**kwargs):
            try:
                if auth and not request.user.is_authenticated:
                    raise DomainError('Sign in to manage your price alerts.',401)
                limit(request,'read' if request.method == 'GET' else 'write',300 if request.method == 'GET' else 60)
                return fn(request,*args,**kwargs)
            except DomainError as error:
                return JsonResponse({'error':str(error)},status=error.status)
        return wrapped
    return decorator

def session_data(request):
    user = request.user
    return {'csrfToken':get_token(request),'user':{'username':user.get_username(),'email':user.email,'emailVerified':AlertIdentity.verified_for(user)} if user.is_authenticated else None,'mode':'live' if not settings.DEBUG and settings.PRICE_ALERT_DELIVERY_MODE == 'smtp' else 'backend-preview'}

@ensure_csrf_cookie
@api(['GET'],auth=False)
def session(request):
    return JsonResponse(session_data(request))

@api(['POST'],auth=False)
def sign_in(request):
    limit(request,'login',10)
    data = body(request)
    username, password = data.get('username'), data.get('password')
    if not isinstance(username,str) or not isinstance(password,str) or len(username)>150 or len(password)>1024:
        raise DomainError('Enter your account username and password.')
    user = authenticate(request,username=username,password=password)
    if not user:
        raise DomainError('The username or password is incorrect.',401)
    login(request,user)
    return JsonResponse(session_data(request))

@api(['POST'])
def sign_out(request):
    logout(request)
    return JsonResponse(session_data(request))

@api(['GET'],auth=False)
def products(request):
    return JsonResponse({'products':[product_data(p) for p in CatalogProduct.objects.all()]})

@api(['GET','POST'])
def alerts(request):
    if request.method == 'POST':
        data = body(request)
        alert = create_alert(request.user,data.get('productId'),data.get('discount'),data.get('requestId'))
        return JsonResponse({'alert':alert_data(alert)},status=201)
    return JsonResponse({'alerts':[alert_data(a) for a in PriceAlert.objects.filter(customer=request.user).select_related('product').order_by('-created_at')], 'notifications':[notification_data(n) for n in PriceNotification.objects.filter(alert__customer=request.user).select_related('alert__product').order_by('-created_at')]})

@api(['POST'])
def alert_action(request,alert_id):
    data = body(request)
    return JsonResponse({'alert':alert_data(edit_alert(request.user,alert_id,data.get('action'),data.get('discount')))})

@api(['POST'])
def official_price(request,product_id):
    data = body(request)
    event = update_price(request.user,product_id,data.get('kind'),data.get('price'),data.get('reason'))
    return JsonResponse({'eventId':str(event.pk) if event else None})
