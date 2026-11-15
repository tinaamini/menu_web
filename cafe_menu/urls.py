from pathlib import Path
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.views.static import serve as django_static_serve
from django.http import Http404

# دریافت مسیر امن پنل مدیریت از تنظیمات (پیش‌فرض: gardoo-panel/)
admin_path = getattr(settings, 'ADMIN_URL', 'gardoo-panel/')


def smart_media_serve(request, path):
    """
    سرویس‌دهی هوشمند فایل‌های تصاویر و مدیا از تمامی مسیرهای معتبر:
    (MEDIA_ROOT جاری، دیسک ماندگار لیارا، حافظه موقت /tmp و پوشه رسانه اولیه پروژه)
    """
    candidate_roots = [
        getattr(settings, 'MEDIA_ROOT', None),
        getattr(settings, 'DATA_DIR', Path('/usr/src/app/data')) / 'media',
        settings.BASE_DIR / 'data' / 'media',
        Path('/tmp/media'),
        settings.BASE_DIR / 'media',
    ]
    seen = set()
    for root in candidate_roots:
        if not root:
            continue
        try:
            root_path = Path(root).resolve()
        except Exception:
            continue
        if root_path in seen:
            continue
        seen.add(root_path)
        file_path = root_path / path
        if file_path.exists() and file_path.is_file():
            return django_static_serve(request, path, document_root=str(root_path))
    raise Http404("فایل رسانه یافت نشد.")


urlpatterns = [
    path(admin_path, admin.site.urls),
    path('', include('menu.urls')),
    re_path(r'^media/(?P<path>.*)$', smart_media_serve, name='media_serve'),
]
