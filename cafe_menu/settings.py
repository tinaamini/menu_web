"""
Django settings for cafe_menu project.
"""

import os
import shutil
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-change-this-in-production-!!!'

DEBUG = True

ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'menu',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'cafe_menu.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'cafe_menu.wsgi.application'

# ==============================================================================
# پیکربندی هوشمند و خودکار دیتابیس SQLite برای محیط سرور (لیارا) و لوکال
# رفع قطعی خطای: OperationalError: attempt to write a readonly database
# ==============================================================================
import shutil

DATA_DIR = BASE_DIR / 'data'
TMP_DIR = Path('/tmp')
ORIG_DB = BASE_DIR / 'db.sqlite3'
ORIG_MEDIA = BASE_DIR / 'media'

# اولویت ۱: دیسک ماندگار متصل‌شده در لیارا (پوشه data)
if DATA_DIR.exists() and os.access(DATA_DIR, os.W_OK):
    DB_PATH = DATA_DIR / 'db.sqlite3'
    if not DB_PATH.exists() and ORIG_DB.exists():
        try:
            shutil.copy2(ORIG_DB, DB_PATH)
        except Exception:
            pass
    MEDIA_ROOT = DATA_DIR / 'media'
    try:
        MEDIA_ROOT.mkdir(parents=True, exist_ok=True)
        if ORIG_MEDIA.exists():
            shutil.copytree(ORIG_MEDIA, MEDIA_ROOT, dirs_exist_ok=True)
    except Exception:
        pass
# اولویت ۲: محیط محلی (Local) یا سرور استاندارد با دسترسی کامل نوشتن
elif os.access(BASE_DIR, os.W_OK) and (not ORIG_DB.exists() or os.access(ORIG_DB, os.W_OK)):
    DB_PATH = ORIG_DB
    MEDIA_ROOT = BASE_DIR / 'media'
# اولویت ۳: سرور ابری با فایل‌سیستم Read-Only (مانند کانتینر پیش‌فرض لیارا تا قبل از اتصال دیسک)
elif TMP_DIR.exists() and os.access(TMP_DIR, os.W_OK):
    DB_PATH = TMP_DIR / 'db.sqlite3'
    if not DB_PATH.exists() and ORIG_DB.exists():
        try:
            shutil.copy2(ORIG_DB, DB_PATH)
        except Exception:
            pass
    MEDIA_ROOT = TMP_DIR / 'media'
    try:
        MEDIA_ROOT.mkdir(parents=True, exist_ok=True)
        if ORIG_MEDIA.exists():
            shutil.copytree(ORIG_MEDIA, MEDIA_ROOT, dirs_exist_ok=True)
    except Exception:
        pass
else:
    DB_PATH = ORIG_DB
    MEDIA_ROOT = BASE_DIR / 'media'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': DB_PATH,
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'fa-ir'
TIME_ZONE = 'Asia/Tehran'
USE_I18N = True
USE_TZ = True
LOCALE_PATHS = [
    BASE_DIR / 'locale',
]

STATIC_URL = '/static/'
STATICFILES_DIRS = [BASE_DIR / 'static']
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = '/media/'
# MEDIA_ROOT در بخش بالا به صورت هوشمند و متناسب با دیسک/سرور تعریف شده است

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ==============================================================================
# تنظیمات امنیتی HTTPS و SSL (ریدایرکت خودکار HTTP به HTTPS)
# ==============================================================================
import os

# هدر تشخیص پروتکل پشت Reverse Proxy (مانند Nginx، Cloudflare، ابرآروان و ...)
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# ریدایرکت خودکار تمام درخواست‌های HTTP به HTTPS
# در محیط سرور/پروداکشن (یا با تنظیم متغیر محیطی) خودکار فعال است
SECURE_SSL_REDIRECT = os.environ.get('SECURE_SSL_REDIRECT', 'True' if not DEBUG else 'False') == 'True'

if SECURE_SSL_REDIRECT:
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = 31536000  # ۱ سال
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True

CSRF_TRUSTED_ORIGINS = [
    'https://gardoo.site',
    'https://www.gardoo.site',
    'https://gardo-site.liara.run',
    'http://localhost:8000',
    'http://127.0.0.1:8000',
]

# ==============================================================================
# مسیر اختصاصی و امن پنل مدیریت ادمین (جلوگیری از اسکن و حملات Brute-Force روی admin/)
# قابل تغییر از طریق متغیر محیطی DJANGO_ADMIN_URL یا پیش‌فرض gardoo-panel/
# ==============================================================================
ADMIN_URL = os.environ.get('DJANGO_ADMIN_URL', 'gardoo-panel/')
if not ADMIN_URL.endswith('/'):
    ADMIN_URL += '/'
if ADMIN_URL.startswith('/'):
    ADMIN_URL = ADMIN_URL[1:]

LOGIN_URL = 'admin:login'

