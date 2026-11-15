from .settings import *  # noqa: F403

# Test-only overrides; the production password hasher and SMTP config are untouched.
SECURE_SSL_REDIRECT = False
PASSWORD_HASHERS = ['django.contrib.auth.hashers.MD5PasswordHasher']
EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'
CELERY_TASK_ALWAYS_EAGER = True
CACHES = {'default': {'BACKEND': 'django.core.cache.backends.locmem.LocMemCache'}}
