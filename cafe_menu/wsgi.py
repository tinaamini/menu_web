"""
WSGI config for cafe_menu project.
"""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cafe_menu.settings')
application = get_wsgi_application()

try:
    from menu.apps import ensure_default_accounts
    ensure_default_accounts()
except Exception:
    pass

