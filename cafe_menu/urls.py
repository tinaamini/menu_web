from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

# دریافت مسیر امن پنل مدیریت از تنظیمات (پیش‌فرض: gardoo-panel/)
admin_path = getattr(settings, 'ADMIN_URL', 'gardoo-panel/')

urlpatterns = [
    path(admin_path, admin.site.urls),
    path('', include('menu.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
