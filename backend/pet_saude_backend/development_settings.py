"""Local-only mode: SQLite and console e-mail; never use for deployment."""
from .settings import *  # noqa: F403

DEBUG = True
ALLOWED_HOSTS = ['localhost', '127.0.0.1']
DATABASES = {'default': {'ENGINE': 'django.db.backends.sqlite3', 'NAME': BASE_DIR / 'db.sqlite3'}}
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
DEFAULT_FROM_EMAIL = 'PET Saúde <dev@localhost>'
FRONTEND_URL = 'http://localhost:3000'
CORS_ALLOW_ALL_ORIGINS = True
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False
SECURE_SSL_REDIRECT = False
SECURE_PROXY_SSL_HEADER = None
