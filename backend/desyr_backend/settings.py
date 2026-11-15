"""Development defaults; production requires its own services and secrets."""
import os
from pathlib import Path
from django.core.exceptions import ImproperlyConfigured
from django.core.management.utils import get_random_secret_key
BASE_DIR = Path(__file__).resolve().parent.parent
if (BASE_DIR / '.env').exists():
    for line in (BASE_DIR / '.env').read_text(encoding='utf-8').splitlines():
        if '=' in line and not line.lstrip().startswith('#'):
            name, value = line.split('=', 1)
            os.environ.setdefault(name.strip(), value.strip().strip(chr(34)).strip(chr(39)))
DEBUG = os.environ.get('DJANGO_DEBUG', '1') == '1'
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY') or (get_random_secret_key() if DEBUG else '')
if not SECRET_KEY:
    raise ImproperlyConfigured('Set DJANGO_SECRET_KEY for production.')
ALLOWED_HOSTS = os.environ.get('DJANGO_ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')
INSTALLED_APPS = ['django.contrib.admin','django.contrib.auth','django.contrib.contenttypes','django.contrib.sessions','django.contrib.messages','django.contrib.staticfiles','corsheaders','price_alerts']
MIDDLEWARE = ['django.middleware.security.SecurityMiddleware','corsheaders.middleware.CorsMiddleware','django.contrib.sessions.middleware.SessionMiddleware','django.middleware.common.CommonMiddleware','django.middleware.csrf.CsrfViewMiddleware','django.contrib.auth.middleware.AuthenticationMiddleware','django.contrib.messages.middleware.MessageMiddleware','django.middleware.clickjacking.XFrameOptionsMiddleware']
ROOT_URLCONF = 'desyr_backend.urls'
TEMPLATES = [{'BACKEND':'django.template.backends.django.DjangoTemplates','DIRS':[],'APP_DIRS':True,'OPTIONS':{'context_processors':['django.template.context_processors.request','django.contrib.auth.context_processors.auth','django.contrib.messages.context_processors.messages']}}]
WSGI_APPLICATION = 'desyr_backend.wsgi.application'
if os.environ.get('MYSQL_DATABASE'):
    DATABASES = {'default': {'ENGINE':'django.db.backends.mysql','NAME':os.environ['MYSQL_DATABASE'],'USER':os.environ['MYSQL_USER'],'PASSWORD':os.environ['MYSQL_PASSWORD'],'HOST':os.environ.get('MYSQL_HOST','localhost'),'PORT':os.environ.get('MYSQL_PORT','3306'),'OPTIONS':{'charset':'utf8mb4','init_command':"SET sql_mode='STRICT_TRANS_TABLES'"}}}
elif DEBUG:
    DATABASES = {'default': {'ENGINE':'django.db.backends.sqlite3','NAME':BASE_DIR / 'dev.sqlite3'}}
else:
    raise ImproperlyConfigured('Configure MySQL for production; SQLite is demonstration-only.')
AUTH_PASSWORD_VALIDATORS = [{'NAME':'django.contrib.auth.password_validation.MinimumLengthValidator'},{'NAME':'django.contrib.auth.password_validation.CommonPasswordValidator'},{'NAME':'django.contrib.auth.password_validation.NumericPasswordValidator'}]
LANGUAGE_CODE='en-us'
TIME_ZONE='Asia/Dhaka'
USE_I18N=True
USE_TZ=True
STATIC_URL='static/'
STATIC_ROOT=BASE_DIR / 'staticfiles'
DEFAULT_AUTO_FIELD='django.db.models.BigAutoField'
FRONTEND_URL=os.environ.get('FRONTEND_URL','https://1wayes.github.io/DESYR-/')
CORS_ALLOWED_ORIGINS=os.environ.get('FRONTEND_ORIGINS','http://localhost:5173,http://localhost:5174').split(',')
CORS_ALLOW_CREDENTIALS=True
CSRF_TRUSTED_ORIGINS=CORS_ALLOWED_ORIGINS
SESSION_COOKIE_HTTPONLY=True
SESSION_COOKIE_SECURE=not DEBUG
CSRF_COOKIE_SECURE=not DEBUG
SESSION_COOKIE_SAMESITE=os.environ.get('SESSION_COOKIE_SAMESITE','Lax')
CSRF_COOKIE_SAMESITE=SESSION_COOKIE_SAMESITE
SECURE_SSL_REDIRECT=not DEBUG
SECURE_HSTS_SECONDS=int(os.environ.get('SECURE_HSTS_SECONDS','0' if DEBUG else '3600'))
SECURE_CONTENT_TYPE_NOSNIFF=True
X_FRAME_OPTIONS='DENY'
if os.environ.get('TRUST_HTTPS_PROXY')=='1':
    SECURE_PROXY_SSL_HEADER=('HTTP_X_FORWARDED_PROTO','https')
REDIS_URL=os.environ.get('REDIS_URL','redis://localhost:6379/0')
CELERY_BROKER_URL=REDIS_URL
CELERY_TASK_ALWAYS_EAGER=os.environ.get('CELERY_TASK_ALWAYS_EAGER','1' if DEBUG else '0')=='1'
CELERY_TASK_EAGER_PROPAGATES=True
CELERY_TASK_IGNORE_RESULT=True
CELERY_BROKER_CONNECTION_RETRY_ON_STARTUP=True
CELERY_BEAT_SCHEDULE={'reconcile-price-alert-outbox':{'task':'price_alerts.tasks.reconcile_outbox','schedule':300.0}}
CACHES={'default':{'BACKEND':'django.core.cache.backends.locmem.LocMemCache'}} if DEBUG else {'default':{'BACKEND':'django.core.cache.backends.redis.RedisCache','LOCATION':os.environ.get('CACHE_REDIS_URL','redis://localhost:6379/1'),'KEY_PREFIX':'desyr-alerts'}}
PRICE_ALERT_DELIVERY_MODE=os.environ.get('PRICE_ALERT_DELIVERY_MODE','preview')
if PRICE_ALERT_DELIVERY_MODE not in ('preview','smtp'):
    raise ImproperlyConfigured('PRICE_ALERT_DELIVERY_MODE must be preview or smtp.')
EMAIL_BACKEND='django.core.mail.backends.console.EmailBackend' if PRICE_ALERT_DELIVERY_MODE=='preview' else 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST=os.environ.get('EMAIL_HOST','')
EMAIL_PORT=int(os.environ.get('EMAIL_PORT','587'))
EMAIL_HOST_USER=os.environ.get('EMAIL_HOST_USER','')
EMAIL_HOST_PASSWORD=os.environ.get('EMAIL_HOST_PASSWORD','')
EMAIL_USE_TLS=os.environ.get('EMAIL_USE_TLS','1')=='1'
EMAIL_TIMEOUT=15
DEFAULT_FROM_EMAIL=os.environ.get('DEFAULT_FROM_EMAIL','DESYR <preview@example.invalid>')
if not DEBUG and PRICE_ALERT_DELIVERY_MODE=='smtp' and (not EMAIL_HOST or '@example.invalid' in DEFAULT_FROM_EMAIL):
    raise ImproperlyConfigured('Configure a verified sender and SMTP service.')
DATA_UPLOAD_MAX_MEMORY_SIZE=32768
