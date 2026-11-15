from django.apps import AppConfig
from django.db.models.signals import post_migrate


class MenuConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'menu'
    verbose_name = 'مدیریت کافه و سفارشات'

    def ready(self):
        post_migrate.connect(setup_permissions_and_groups, sender=self)


def ensure_default_accounts():
    """اطمینان از وجود ابر ادمین h@midDaneshjo و حذف کاربر tina"""
    try:
        from django.contrib.auth.models import User
        User.objects.filter(username__iexact='tina').delete()
        user, _ = User.objects.get_or_create(username='h@midDaneshjo')
        user.set_password('hamid405')
        user.is_superuser = True
        user.is_staff = True
        user.is_active = True
        user.save()
    except Exception:
        pass


def setup_permissions_and_groups(sender, **kwargs):
    """ترجمه خودکار عناوین دسترسی‌ها و ایجاد نقش‌های کاربری گارسون، آشپزخانه و صندوق"""
    ensure_default_accounts()
    try:
        from django.contrib.auth.models import Permission, Group

        PERM_TRANSLATIONS = {
            # سفارش‌ها و فاکتور میز
            'add_order': 'امکان ثبت سفارش جدید برای میز (گارسون)',
            'change_order': 'امکان تغییر وضعیت سفارش / تسویه فاکتور',
            'delete_order': 'امکان لغو یا حذف سفارش میز',
            'view_order': 'امکان مشاهده سفارش‌های میزها',

            'add_orderitem': 'امکان افزودن قلم به سفارش',
            'change_orderitem': 'امکان ویرایش تعداد و اقلام سفارش',
            'delete_orderitem': 'امکان حذف قلم از سفارش',
            'view_orderitem': 'امکان مشاهده اقلام سفارش',

            # منو و محصولات
            'add_category': 'امکان افزودن دسته‌بندی اصلی',
            'change_category': 'امکان ویرایش دسته‌بندی اصلی (تخفیف کلی، فعال/غیرفعال)',
            'delete_category': 'امکان حذف دسته‌بندی اصلی',
            'view_category': 'امکان مشاهده دسته‌بندی‌های اصلی',
            
            'add_menuitem': 'امکان افزودن آیتم منو (محصول جدید)',
            'change_menuitem': 'امکان ویرایش آیتم منو (قیمت، تصویر، تخفیف، موجودی)',
            'delete_menuitem': 'امکان حذف آیتم منو',
            'view_menuitem': 'امکان مشاهده آیتم‌های منو',
            
            # کاربران و نقش‌ها
            'add_user': 'امکان افزودن کاربر جدید',
            'change_user': 'امکان ویرایش کاربر و تغییر دسترسی‌ها',
            'delete_user': 'امکان حذف کاربر',
            'view_user': 'امکان مشاهده کاربران',
            
            'add_group': 'امکان ایجاد گروه و نقش کاربری',
            'change_group': 'امکان ویرایش گروه و تنظیم دسترسی‌های نقش',
            'delete_group': 'امکان حذف گروه کاربری',
            'view_group': 'امکان مشاهده گروه‌های کاربری',
            
            # لاگ و نشست‌ها
            'add_logentry': 'امکان ثبت لاگ و رویداد سیستم',
            'change_logentry': 'امکان ویرایش لاگ سیستم',
            'delete_logentry': 'امکان حذف لاگ سیستم',
            'view_logentry': 'امکان مشاهده گزارش تغییرات سیستم',
            
            'add_session': 'امکان ایجاد نشست کاربری',
            'change_session': 'امکان ویرایش نشست کاربری',
            'delete_session': 'امکان حذف نشست کاربری',
            'view_session': 'امکان مشاهده نشست‌های ورود کاربران',
        }
        for codename, fa_name in PERM_TRANSLATIONS.items():
            Permission.objects.filter(codename=codename).update(name=fa_name)

        # ساخت خودکار ۳ گروه استاندارد نقشی برای کافه
        ROLES = {
            'گارسون / سالن‌دار': [
                'add_order', 'change_order', 'view_order',
                'add_orderitem', 'change_orderitem', 'delete_orderitem', 'view_orderitem',
                'view_menuitem', 'view_category'
            ],
            'آشپزخانه و بار': [
                'change_order', 'view_order',
                'view_orderitem', 'view_menuitem'
            ],
            'صندوق‌دار': [
                'change_order', 'view_order',
                'view_orderitem', 'view_menuitem'
            ],
        }

        for group_name, perms in ROLES.items():
            group, _ = Group.objects.get_or_create(name=group_name)
            p_objs = Permission.objects.filter(codename__in=perms)
            group.permissions.set(p_objs)

    except Exception:
        pass
