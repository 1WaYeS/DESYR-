from django.urls import path
from . import views

urlpatterns = [path('session/',views.session),path('login/',views.sign_in),path('logout/',views.sign_out),path('products/',views.products),path('alerts/',views.alerts),path('alerts/<uuid:alert_id>/',views.alert_action),path('products/<str:product_id>/price/',views.official_price)]
