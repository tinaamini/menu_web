import datetime
from django import forms
from django.db import models
from django.contrib import admin, messages
from django.shortcuts import redirect
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import AdminPasswordChangeForm, UserChangeForm, ReadOnlyPasswordHashField, ReadOnlyPasswordHashWidget
from django.contrib.auth.hashers import identify_hasher, UNUSABLE_PASSWORD_PREFIX
from django.contrib.auth.models import User, Group
from django.utils.html import format_html, format_html_join, mark_safe
from .models import Category, SubCategory, MenuItem, Order, OrderItem, CafeTable
from .jalali import to_jalali_str, to_jalali_display, parse_jalali_str, get_discount_status

# تنظیم عناوین پنل مدیریت به نام کافه گاردو
admin.site.site_header = "کافه گاردو | پنل مدیریت"
admin.site.site_title = "مدیریت کافه گاردو"
admin.site.index_title = "داشبورد مدیریت و کنترل کافه"


class PersianDateField(forms.CharField):
    """فیلد فرم اختصاصی تاریخ شمسی برای پنل ادمین با اعتبارسنجی خودکار"""
    def __init__(self, *args, **kwargs):
        kwargs.setdefault('required', False)
        kwargs.setdefault('widget', forms.TextInput(attrs={
            'placeholder': '۱۴۰۳/۰۸/۲۵',
            'class': 'vTextField persian-date-input',
            'autocomplete': 'off',
            'style': 'direction: ltr; text-align: center; font-weight: 700; width: 140px;',
        }))
        super().__init__(*args, **kwargs)

    def prepare_value(self, value):
        if isinstance(value, (datetime.date, datetime.datetime)):
            return to_jalali_str(value)
        return value or ''

    def to_python(self, value):
        if not value:
            return None
        try:
            return parse_jalali_str(value)
        except ValueError as err:
            raise forms.ValidationError(str(err))


class CategoryAdminForm(forms.ModelForm):
    discount_start_date = PersianDateField(
        label='تاریخ شروع تخفیف (شمسی)',
        help_text='اختیاری - مثال: ۱۴۰۳/۰۸/۲۵ (اگر خالی بماند، تخفیف بلافاصله اعمال می‌شود)'
    )
    discount_end_date = PersianDateField(
        label='تاریخ پایان تخفیف (شمسی)',
        help_text='اختیاری - مثال: ۱۴۰۳/۰۸/۳۰ (پس از این تاریخ تخفیف کلی دسته‌بندی به طور خودکار غیرفعال خواهد شد)'
    )

    class Meta:
        model = Category
        fields = '__all__'

    def clean(self):
        cleaned_data = super().clean()
        start = cleaned_data.get('discount_start_date')
        end = cleaned_data.get('discount_end_date')
        if start and end and start > end:
            raise forms.ValidationError('تاریخ شروع تخفیف نمی‌تواند پس از تاریخ پایان تخفیف باشد.')
        return cleaned_data


class MenuItemAdminForm(forms.ModelForm):
    discount_start_date = PersianDateField(
        label='تاریخ شروع تخفیف (شمسی)',
        help_text='اختیاری - مثال: ۱۴۰۳/۰۸/۲۵ (اگر خالی بماند، تخفیف بلافاصله اعمال می‌شود)'
    )
    discount_end_date = PersianDateField(
        label='تاریخ پایان تخفیف (شمسی)',
        help_text='اختیاری - مثال: ۱۴۰۳/۰۸/۳۰ (پس از این تاریخ تخفیف تکی آیتم به صورت خودکار پایان می‌یابد)'
    )

    class Meta:
        model = MenuItem
        fields = '__all__'

    def clean(self):
        cleaned_data = super().clean()
        start = cleaned_data.get('discount_start_date')
        end = cleaned_data.get('discount_end_date')
        if start and end and start > end:
            raise forms.ValidationError('تاریخ شروع تخفیف نمی‌تواند پس از تاریخ پایان تخفیف باشد.')
        return cleaned_data


class SubCategoryInline(admin.TabularInline):
    """نمایش و افزودن سریع زیرمجموعه‌ها (مانند دورچین و ...) مستقیماً در صفحه دسته‌بندی"""
    model = SubCategory
    extra = 0
    classes = ['collapse']
    fields = ['name', 'name_en', 'description', 'order', 'is_active']
    ordering = ['order', 'name']
    formfield_overrides = {
        models.TextField: {
            'widget': forms.TextInput(attrs={
                'style': 'width: 220px; height: 28px;',
                'placeholder': 'توضیحات کوتاه این بخش...'
            })
        },
    }

    def has_add_permission(self, request, obj=None):
        return request.user.is_staff

    def has_change_permission(self, request, obj=None):
        return request.user.is_staff

    def has_delete_permission(self, request, obj=None):
        return request.user.is_staff


class MenuItemInline(admin.TabularInline):
    """نمایش و افزودن سریع آیتم‌های منو مستقیماً در صفحه هر دسته‌بندی"""
    model = MenuItem
    form = MenuItemAdminForm
    extra = 0
    classes = ['collapse']
    show_change_link = True
    fields = [
        'image_preview', 'name', 'name_en', 'subcategory', 'price',
        'discount_percent', 'discount_start_date', 'discount_end_date',
        'is_available', 'order'
    ]
    readonly_fields = ['image_preview']
    ordering = ['order', 'name']

    def has_add_permission(self, request, obj=None):
        return request.user.is_staff

    def has_change_permission(self, request, obj=None):
        return request.user.is_staff

    def has_delete_permission(self, request, obj=None):
        return request.user.is_staff

    @admin.display(description='تصویر')
    def image_preview(self, obj):
        if obj and obj.image:
            return format_html(
                '<img src="{}" style="width: 44px; height: 44px; object-fit: cover; border-radius: 6px; border: 1px solid #555;" />',
                obj.image.url
            )
        return '—'


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    form = CategoryAdminForm
    list_display = [
        'id', 'name', 'name_en', 'icon',
        'discount_percent', 'discount_status_display',
        'get_subcategories_count', 'get_items_count', 'is_active'
    ]
    list_display_links = ['id']
    list_editable = ['name', 'name_en', 'discount_percent', 'is_active']
    search_fields = ['name', 'name_en', 'description']
    fieldsets = (
        ('مشخصات اصلی دسته‌بندی', {
            'fields': ('name', 'name_en', 'icon', 'description', 'is_active')
        }),
        ('تنظیمات تخفیف کلی و بازه زمانی (شمسی)', {
            'classes': ('collapse',),
            'fields': ('discount_percent', 'discount_start_date', 'discount_end_date'),
            'description': 'با تعیین درصد و تاریخ شروع و پایان شمسی، تخفیف به طور خودکار در بازه فعال بوده و پس از پایان تاریخ به صورت هوشمند غیرفعال می‌شود.'
        }),
    )
    inlines = [SubCategoryInline, MenuItemInline]

    @admin.display(description='وضعیت تخفیف دسته‌بندی')
    def discount_status_display(self, obj):
        _, _, badge = get_discount_status(obj.discount_percent, obj.discount_start_date, obj.discount_end_date)
        return badge

    @admin.display(description='زیرمجموعه‌ها')
    def get_subcategories_count(self, obj):
        count = obj.subcategories.count()
        if count > 0:
            sub_names = ", ".join(obj.subcategories.values_list('name', flat=True)[:3])
            return format_html('<span style="color: #d4a574; font-weight: 600;">{} بخش</span> <small style="color: #999;">({})</small>', count, sub_names)
        return '—'

    @admin.display(description='تعداد آیتم‌ها')
    def get_items_count(self, obj):
        return obj.items.count()

    def has_module_permission(self, request):
        return request.user.is_staff

    def has_add_permission(self, request):
        """دسته‌بندی‌های اصلی ثابت هستند و امکان افزودن دسته جدید نیست"""
        return False

    def has_change_permission(self, request, obj=None):
        return request.user.is_staff

    def has_delete_permission(self, request, obj=None):
        return False

    def has_view_permission(self, request, obj=None):
        return request.user.is_staff


@admin.register(SubCategory)
class SubCategoryAdmin(admin.ModelAdmin):
    """مدیریت کامل زیرمجموعه‌ها"""
    list_display = ['id', 'name', 'name_en', 'category', 'get_items_count', 'order', 'is_active']
    list_display_links = ['id']
    list_editable = ['name', 'name_en', 'order', 'is_active']
    list_filter = ['category', 'is_active']
    search_fields = ['name', 'name_en', 'description', 'category__name']
    ordering = ['category__order', 'order', 'name']
    fields = ['category', 'name', 'name_en', 'description', 'order', 'is_active']

    @admin.display(description='تعداد آیتم‌ها')
    def get_items_count(self, obj):
        count = obj.items.count()
        return format_html('<b style="color: #10b981;">{} آیتم</b>', count)

    def has_module_permission(self, request):
        return request.user.is_staff

    def has_add_permission(self, request):
        return request.user.is_staff

    def has_change_permission(self, request, obj=None):
        return request.user.is_staff

    def has_delete_permission(self, request, obj=None):
        return request.user.is_staff

    def has_view_permission(self, request, obj=None):
        return request.user.is_staff


@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    """مدیریت آیتم‌های منو"""
    form = MenuItemAdminForm
    list_display = [
        'image_preview', 'name', 'category', 'subcategory', 'price',
        'discount_percent', 'discount_status_display',
        'get_final_price_display', 'is_available', 'order'
    ]
    list_display_links = ['image_preview', 'name']
    list_editable = ['price', 'discount_percent', 'is_available', 'order']
    list_filter = ['category', 'subcategory', 'is_available']
    search_fields = ['name', 'name_en', 'description', 'category__name', 'subcategory__name']
    list_per_page = 30
    ordering = ['category__order', 'order', 'name']
    readonly_fields = ['image_preview_large', 'get_final_price_display']
    fieldsets = (
        ('مشخصات و دسته‌بندی آیتم', {
            'fields': (
                'category', 'subcategory', 'name', 'name_en', 'price',
                'image', 'image_preview_large',
                'description', 'is_available', 'is_special', 'order'
            )
        }),
        ('تنظیمات تخفیف تکی و بازه زمانی (شمسی)', {
            'classes': ('collapse',),
            'fields': (
                'discount_percent', 'discount_start_date', 'discount_end_date', 'get_final_price_display'
            ),
            'description': 'در صورت تعیین تخفیف تکی، این تخفیف بر تخفیف کلی دسته‌بندی اولویت دارد. با گذشتن از تاریخ پایان شمسی، تخفیف به طور خودکار منقضی می‌شود.'
        }),
    )

    @admin.display(description='وضعیت تخفیف آیتم')
    def discount_status_display(self, obj):
        if obj.discount_percent > 0:
            _, _, badge = get_discount_status(obj.discount_percent, obj.discount_start_date, obj.discount_end_date)
            return badge
        elif obj.category and obj.category.is_discount_active:
            return format_html(
                '<span style="background: rgba(16, 185, 129, 0.12); color: #6ee7b7; border: 1px dashed rgba(16, 185, 129, 0.4); padding: 2px 7px; border-radius: 6px; font-size: 0.78rem;">ارث‌بری از دسته ({}٪)</span>',
                obj.category.discount_percent
            )
        return mark_safe('<span style="color: #6b7280;">—</span>')

    def has_module_permission(self, request):
        return request.user.is_staff

    def has_add_permission(self, request):
        return request.user.is_staff

    def has_change_permission(self, request, obj=None):
        return request.user.is_staff

    def has_delete_permission(self, request, obj=None):
        return request.user.is_staff

    def has_view_permission(self, request, obj=None):
        return request.user.is_staff

    @admin.display(description='تصویر')
    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="width: 48px; height: 48px; object-fit: cover; border-radius: 8px; border: 1px solid #444;" />',
                obj.image.url
            )
        return 'بدون تصویر'

    @admin.display(description='قیمت نهایی با تخفیف')
    def get_final_price_display(self, obj):
        if not obj or not obj.price:
            return '—'
        if obj.is_discounted:
            return format_html(
                '<span style="text-decoration: line-through; color: #888; font-size: 0.9em;">{} تومان</span> '
                '<b style="color: #10b981; font-size: 1.05em;">{} تومان ({}٪ تخفیف)</b>',
                obj.price_formatted(),
                obj.final_price_formatted(),
                obj.effective_discount_percent
            )
        return f"{obj.price_formatted()} تومان"

    @admin.display(description='پیش‌نمایش تصویر فعلی')
    def image_preview_large(self, obj):
        if obj.image:
            return format_html(
                '<div style="margin-top: 6px;">'
                '<img src="{}" style="max-width: 180px; max-height: 180px; object-fit: cover; border-radius: 12px; border: 2px solid #555; box-shadow: 0 4px 12px rgba(0,0,0,0.35);" />'
                '</div>',
                obj.image.url
            )
        return 'هنوز تصویری برای این آیتم آپلود نشده است.'


# ============================================================
# کدهای مربوط به سفارش‌ها، میزها و پرسنل (گارسون، آشپزخانه، صندوق)
# طبق نظر کارفرما، این بخش‌ها کامنت شدند تا پنل ادمین منحصراً
# برای سوپرادمین جهت ثبت و نمایش منو، محصولات و زیرمجموعه‌ها در سایت باشد.
# ============================================================

# class OrderItemInline(admin.TabularInline):
#     """اقلام داخل فاکتور سفارش میز"""
#     model = OrderItem
#     extra = 1
#     fields = ['item', 'quantity', 'unit_price', 'notes', 'get_subtotal_display']
#     readonly_fields = ['get_subtotal_display']
# 
#     @admin.display(description='جمع این قلم')
#     def get_subtotal_display(self, obj):
#         if not obj or not obj.id:
#             return '—'
#         return format_html('<b>{} تومان</b>', obj.subtotal_formatted())


# @admin.register(CafeTable)
# class CafeTableAdmin(admin.ModelAdmin):
#     """مدیریت کامل میزهای کافه توسط ادمین اصلی (افزودن، ویرایش، حذف و تغییر ظرفیت و بخش)"""
#     list_display = ['name', 'section', 'capacity', 'order', 'is_active', 'active_orders_count']
#     list_display_links = ['name']
#     list_editable = ['order', 'is_active']
#     list_filter = ['section', 'is_active']
#     search_fields = ['name', 'section']
#     ordering = ['order', 'name']
#     fields = ['name', 'section', 'capacity', 'order', 'is_active']
# 
#     @admin.display(description='سفارش‌های فعال')
#     def active_orders_count(self, obj):
#         count = obj.orders.filter(status__in=['pending', 'preparing', 'ready']).count()
#         if count > 0:
#             return format_html(
#                 '<b style="color: #f59e0b; background: rgba(245, 158, 11, 0.15); padding: 3px 8px; border-radius: 6px;">{} سفارش فعال</b>',
#                 count
#             )
#         return '—'
# 
#     def has_module_permission(self, request):
#         """فقط ادمین اصلی (سوپریوزر) بخش مدیریت میزها را در منوی ادمین مشاهده می‌کند"""
#         return request.user.is_superuser
# 
#     def has_add_permission(self, request):
#         """فقط ادمین اصلی مجاز به افزودن میز جدید است"""
#         return request.user.is_superuser
# 
#     def has_change_permission(self, request, obj=None):
#         """فقط ادمین اصلی مجاز به ویرایش میزها است"""
#         return request.user.is_superuser
# 
#     def has_delete_permission(self, request, obj=None):
#         """فقط ادمین اصلی مجاز به حذف کامل میز است"""
#         return request.user.is_superuser
# 
#     def has_view_permission(self, request, obj=None):
#         """فقط ادمین اصلی مجاز به مشاهده پنل مدیریت میزها است"""
#         return request.user.is_superuser
# 
# 
# @admin.register(Order)
# class OrderAdmin(admin.ModelAdmin):
#     """مدیریت سفارش‌های میزها، آماده‌سازی در بار/آشپزخانه و تسویه در صندوق"""
#     list_display = [
#         'order_number',
#         'table_badge',
#         'status_badge',
#         'payment_badge',
#         'items_summary',
#         'total_price_display',
#         'waiter_display',
#         'created_time',
#     ]
#     list_display_links = ['order_number', 'table_badge']
#     list_filter = ['status', 'payment_status', 'payment_method', 'created_at']
#     search_fields = ['table_number', 'notes', 'items__item__name', 'waiter__username']
#     list_per_page = 25
#     inlines = [OrderItemInline]
# 
#     def get_list_filter(self, request):
#         """تنظیم فیلترها بر اساس نقش و پرمیشن‌های کاربر: گارسون دسترسی به فیلترهای روش پرداخت و تسویه ندارد"""
#         if request.user.is_superuser:
#             return ['status', 'payment_status', 'payment_method', 'waiter', 'table', 'created_at']
# 
#         is_cashier = request.user.groups.filter(name__icontains='صندوق').exists()
#         is_kitchen = request.user.groups.filter(name__icontains='آشپزخانه').exists() or request.user.groups.filter(name__icontains='بار').exists()
# 
#         if is_cashier and not is_kitchen:
#             return ['payment_status', 'payment_method', 'status', 'created_at']
# 
#         if is_kitchen and not is_cashier:
#             return ['status', 'created_at']
# 
#         # برای گارسون سالن: فقط فیلتر وضعیت سفارش (آماده‌سازی/تحویل)، میز و تاریخ
#         # فیلترهای روش پرداخت و تسویه که به صندوق مربوطند از دید گارسون حذف می‌شوند
#         return ['status', 'table', 'created_at']
#     fields = [
#         'table', 'table_number', 'status',
#         'payment_status', 'payment_method',
#         'waiter', 'notes',
#         'total_price_display',
#     ]
#     readonly_fields = ['total_price_display']
#     actions = [
#         'mark_as_preparing',
#         'mark_as_ready',
#         'mark_as_delivered',
#         'mark_as_paid_pos',
#         'mark_as_paid_cash',
#     ]
# 
#     def get_actions(self, request):
#         actions = super().get_actions(request)
#         # برای گارسون (و پرسنل عادی که صندوق‌دار یا آشپزخانه نیستند)، کل نوار اقدامات حذف می‌شود
#         # تا گارسون هیچ امکانی برای تغییر دسته‌جمعی وضعیت آماده‌سازی، تسویه یا حذف سفارش نداشته باشد
#         if not request.user.is_superuser:
#             is_cashier = request.user.groups.filter(name__icontains='صندوق').exists()
#             is_kitchen = request.user.groups.filter(name__icontains='آشپزخانه').exists() or request.user.groups.filter(name__icontains='بار').exists()
# 
#             if not (is_cashier or is_kitchen):
#                 return {}
# 
#             if is_cashier and not is_kitchen:
#                 actions.pop('mark_as_preparing', None)
#                 actions.pop('mark_as_ready', None)
# 
#             if is_kitchen and not is_cashier:
#                 actions.pop('mark_as_paid_pos', None)
#                 actions.pop('mark_as_paid_cash', None)
#                 actions.pop('mark_as_delivered', None)
# 
#             actions.pop('delete_selected', None)
# 
#         return actions
# 
#     def save_model(self, request, obj, form, change):
#         # اگر گارسون مشخص نشده بود، کاربری که سفارش را ثبت می‌کند به عنوان گارسون ذخیره می‌شود
#         if not obj.waiter and request.user.is_authenticated:
#             obj.waiter = request.user
#         super().save_model(request, obj, form, change)
# 
#     def get_readonly_fields(self, request, obj=None):
#         readonly = list(super().get_readonly_fields(request, obj))
#         # اگر کاربر در گروه آشپزخانه بود، نباید به وضعیت پرداخت دسترسی داشته باشد
#         if request.user.groups.filter(name='آشپزخانه و بار').exists() and not request.user.is_superuser:
#             readonly.extend(['payment_status', 'payment_method'])
#         # اگر کاربر گارسون بود، نباید سرخود تسویه حساب کند (صندوق باید تسویه کند)
#         if request.user.groups.filter(name='گارسون / سالن‌دار').exists() and not request.user.is_superuser:
#             readonly.extend(['payment_status', 'payment_method'])
#         return readonly
# 
#     def has_add_permission(self, request):
#         if request.user.is_superuser:
#             return True
#         # پرسنل آشپزخانه و بار اجازه افزودن سفارش جدید ندارند
#         if request.user.groups.filter(name__icontains='آشپزخانه').exists() or request.user.groups.filter(name__icontains='بار').exists():
#             return False
#         # صندوق‌دار به تنهایی اجازه افزودن سفارش ندارد
#         if request.user.groups.filter(name__icontains='صندوق').exists() and not request.user.groups.filter(name__icontains='گارسون').exists():
#             return False
#         return super().has_add_permission(request)
# 
#     def add_view(self, request, form_url='', extra_context=None):
#         """هدایت یکپارچه به پنل سفارش‌گیر جهت ثبت سریع سفارش میز با تیک زدن و جمع زنده قیمت"""
#         return redirect('menu:waiter_panel')
# 
#     def change_view(self, request, object_id, form_url='', extra_context=None):
#         """هدایت یکپارچه به پنل ویرایش سفارش تا همه اقلام، قیمت، وضعیت میز و تسویه کاملاً هماهنگ باشند"""
#         return redirect('menu:waiter_order_edit', order_id=object_id)
# 
#     @admin.display(description='شماره سفارش', ordering='id')
#     def order_number(self, obj):
#         return format_html('<span style="font-weight: 800; color: #d4a574; font-size: 0.95rem; white-space: nowrap;">#{}</span>', obj.id)
# 
#     @admin.display(description='شماره میز', ordering='table_number')
#     def table_badge(self, obj):
#         name = obj.table.name if obj.table else obj.table_number
#         return format_html(
#             '<span class="badge-table">{}</span>',
#             name or '—'
#         )
# 
#     @admin.display(description='وضعیت آماده‌سازی', ordering='status')
#     def status_badge(self, obj):
#         badge_styles = {
#             'pending': ('#f59e0b', 'rgba(245, 158, 11, 0.12)', 'در صف انتظار'),
#             'preparing': ('#f97316', 'rgba(249, 115, 22, 0.15)', 'در حال آماده‌سازی'),
#             'ready': ('#10b981', 'rgba(16, 185, 129, 0.18)', 'حاضر شد'),
#             'delivered': ('#3b82f6', 'rgba(59, 130, 246, 0.14)', 'تحویل سر میز'),
#             'cancelled': ('#ef4444', 'rgba(239, 68, 68, 0.14)', 'لغو شده'),
#         }
#         color, bg, text = badge_styles.get(obj.status, ('#888', 'transparent', obj.get_status_display()))
#         extra_class = f' badge-status-{obj.status}'
#         if obj.status == 'ready':
#             extra_class += ' badge-pulse-ready'
#         return format_html(
#             '<span class="badge-status{}" data-status="{}" style="color: {}; background: {}; border: 1.5px solid {};">{}</span>',
#             extra_class, obj.status, color, bg, color, text
#         )
# 
#     @admin.display(description='وضعیت تسویه', ordering='payment_status')
#     def payment_badge(self, obj):
#         if obj.payment_status == 'paid':
#             method_desc = f" ({obj.get_payment_method_display()})" if obj.payment_method != 'unspecified' else ""
#             return format_html(
#                 '<span class="badge-payment-paid">تسویه شد{}</span>',
#                 method_desc
#             )
#         return mark_safe('<span class="badge-payment-unpaid">تسویه نشده</span>')
# 
#     @admin.display(description='اقلام سفارش')
#     def items_summary(self, obj):
#         items = list(obj.items.all()[:4])
#         if not items:
#             return mark_safe('<span style="color: #888;">بدون قلم</span>')
#         summary = "، ".join([f"{it.quantity}× {it.item.name}" for it in items])
#         more = f" و {obj.items.count() - 4} قلم دیگر" if obj.items.count() > 4 else ""
#         return format_html('<span style="font-weight: 600; font-size: 0.9rem; white-space: nowrap;">{}{}</span>', summary, more)
# 
#     @admin.display(description='مبلغ فاکتور')
#     def total_price_display(self, obj):
#         if not obj or not obj.id:
#             return '—'
#         return format_html(
#             '<b style="color: #10b981; font-size: 0.98rem; white-space: nowrap;">{} تومان</b>',
#             obj.total_price_formatted()
#         )
# 
#     @admin.display(description='گارسون')
#     def waiter_display(self, obj):
#         if obj.waiter:
#             full_name = obj.waiter.get_full_name() or obj.waiter.username
#             return format_html('<span style="white-space: nowrap;">{}</span>', full_name)
#         return '—'
# 
#     @admin.display(description='زمان ثبت', ordering='created_at')
#     def created_time(self, obj):
#         return format_html('<span style="white-space: nowrap; font-size: 0.88rem; color: #aaa;">{}</span>', obj.created_at.strftime('%H:%M'))
# 
#     # ---- اکشن‌های سریع بالای جدول ----
#     @admin.action(description='تغییر وضعیت به: در حال آماده‌سازی')
#     def mark_as_preparing(self, request, queryset):
#         if not (request.user.is_superuser or request.user.groups.filter(name__icontains='آشپزخانه').exists() or request.user.groups.filter(name__icontains='بار').exists()):
#             self.message_user(request, "گارسون اجازه تغییر وضعیت آماده‌سازی را ندارد.", level=messages.ERROR)
#             return
#         updated = queryset.update(status='preparing')
#         self.message_user(request, f"{updated} سفارش به وضعیت «در حال آماده‌سازی» تغییر یافت.")
# 
#     @admin.action(description='تغییر وضعیت به: حاضر شد (آماده تحویل به گارسون)')
#     def mark_as_ready(self, request, queryset):
#         if not (request.user.is_superuser or request.user.groups.filter(name__icontains='آشپزخانه').exists() or request.user.groups.filter(name__icontains='بار').exists()):
#             self.message_user(request, "گارسون اجازه تغییر وضعیت آماده‌سازی را ندارد.", level=messages.ERROR)
#             return
#         updated = queryset.update(status='ready')
#         self.message_user(request, f"{updated} سفارش به وضعیت «حاضر شد» تغییر یافت.")
# 
#     @admin.action(description='تغییر وضعیت به: تحویل سر میز')
#     def mark_as_delivered(self, request, queryset):
#         if not (request.user.is_superuser or request.user.groups.filter(name__icontains='گارسون').exists()):
#             self.message_user(request, "پرسنل آشپزخانه اجازه ثبت تحویل سر میز را ندارند. این اقدام مختص گارسون است.", level=messages.ERROR)
#             return
#         updated = queryset.update(status='delivered')
#         self.message_user(request, f"{updated} سفارش به وضعیت «تحویل سر میز» تغییر یافت.")
# 
#     @admin.action(description='تسویه فاکتور با کارتخوان (POS)')
#     def mark_as_paid_pos(self, request, queryset):
#         if not (request.user.is_superuser or request.user.groups.filter(name__icontains='صندوق').exists()):
#             self.message_user(request, "گارسون دسترسی به تسویه حساب ندارد.", level=messages.ERROR)
#             return
#         updated = queryset.update(payment_status='paid', payment_method='pos')
#         self.message_user(request, f"فاکتور {updated} میز با کارتخوان تسویه شد.")
# 
#     @admin.action(description='تسویه فاکتور به صورت نقدی')
#     def mark_as_paid_cash(self, request, queryset):
#         if not (request.user.is_superuser or request.user.groups.filter(name__icontains='صندوق').exists()):
#             self.message_user(request, "گارسون دسترسی به تسویه حساب ندارد.", level=messages.ERROR)
#             return
#         updated = queryset.update(payment_status='paid', payment_method='cash')
#         self.message_user(request, f"فاکتور {updated} میز به صورت نقدی تسویه شد.")
# 
# 
# ============================================================
# سفارشی‌سازی مدیریت پرسنل و کاربران کافه (User Admin)
# ============================================================

class PersianAdminPasswordChangeForm(AdminPasswordChangeForm):
    usable_password_help_text = (
        'مشخص می‌کند که آیا کاربر می‌تواند با رمز عبور وارد شود یا خیر. در صورت غیرفعال بودن، ورود فقط از طریق سایر سامانه‌ها امکان‌پذیر است.'
        '<ul id="id_unusable_warning" class="messagelist"><li class="warning">'
        'در صورت غیرفعال شدن، گذرواژه فعلی این کاربر حذف خواهد شد.'
        '</li></ul>'
    )


KEY_TRANSLATIONS = {
    'algorithm': 'الگوریتم',
    'iterations': 'تکرار',
    'salt': 'نمک امنیتی (salt)',
    'hash': 'کد هش امنیتی (hash)',
    'work factor': 'ضریب پردازش',
    'checksum': 'چک‌سام',
}


class PersianReadOnlyPasswordHashWidget(ReadOnlyPasswordHashWidget):
    def render(self, name, value, attrs=None, renderer=None):
        if not value or value.startswith(UNUSABLE_PASSWORD_PREFIX):
            summary_html = mark_safe('<p><strong style="color: #ef4444;">هیچ رمز عبوری برای این کاربر تنظیم نشده است.</strong></p>')
        else:
            try:
                hasher = identify_hasher(value)
                summary = hasher.safe_summary(value)
                items = [
                    (KEY_TRANSLATIONS.get(k, k), v)
                    for k, v in summary.items()
                ]
                formatted_items = [
                    format_html(
                        '<strong style="color: #d4a574;">{}</strong>: <bdi style="direction: ltr; display: inline-block; font-family: monospace; background: rgba(0,0,0,0.35); padding: 2px 7px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.08);">{}</bdi>',
                        k, v
                    )
                    for k, v in items
                ]
                joined_items = mark_safe(' &nbsp;|&nbsp; ').join(formatted_items)
                summary_html = mark_safe(f'<p style="line-height: 2.1; font-size: 0.93rem; color: #e5e7eb;">{joined_items}</p>')
            except ValueError:
                summary_html = mark_safe('<p><strong style="color: #ef4444;">فرمت گذرواژه نامعتبر است یا الگوریتم هش ناشناخته می‌باشد.</strong></p>')

        btn_html = (
            '<p style="margin-top: 10px;">'
            '<a role="button" class="button" href="../password/" '
            'style="background: #d4a574; color: #1c140e; font-weight: 700; padding: 6px 14px; border-radius: 6px; text-decoration: none; display: inline-block;">'
            'تغییر گذرواژه این کاربر'
            '</a>'
            '</p>'
        )

        return mark_safe(f'<div id="id_{name}" class="readonly-password-box">{summary_html}{btn_html}</div>')


class PersianReadOnlyPasswordHashField(ReadOnlyPasswordHashField):
    widget = PersianReadOnlyPasswordHashWidget

    def __init__(self, *args, **kwargs):
        kwargs.setdefault('label', 'گذرواژه کاربر')
        kwargs.setdefault(
            'help_text',
            'رمزهای عبور به صورت خام در دیتابیس ذخیره نمی‌شوند و به دلایل امنیتی امکان مشاهده رمز کاربر وجود ندارد. '
            'برای تغییر گذرواژه می‌توانید از <a href="../password/">این فرم تغییر رمز عبور</a> استفاده کنید.'
        )
        super().__init__(*args, **kwargs)


class PersianUserChangeForm(UserChangeForm):
    password = PersianReadOnlyPasswordHashField()


# حذف ثبت پیش‌فرض User و جایگزینی با پنل شکیل و کاملاً فارسی کافه
try:
    admin.site.unregister(User)
except admin.sites.NotRegistered:
    pass

# حذف مدل گروه‌ها (Groups) از پنل ادمین جهت خلوت و ساده‌سازی منوی مدیریت
try:
    admin.site.unregister(Group)
except admin.sites.NotRegistered:
    pass


@admin.register(User)
class CustomUserAdmin(BaseUserAdmin):
    """مدیریت هوشمند پرسنل کافه (گارسون، باریستا/آشپزخانه، صندوق‌دار و مدیران)"""
    form = PersianUserChangeForm
    change_password_form = PersianAdminPasswordChangeForm

    def has_module_permission(self, request):
        return request.user.is_superuser

    list_display = [
        'username',
        'full_name_display',
        'role_badge',
        'is_staff_badge',
        'is_active_badge',
    ]
    list_filter = ['groups', 'is_staff', 'is_superuser', 'is_active']
    search_fields = ['username', 'first_name', 'last_name', 'email']
    ordering = ['-is_superuser', 'username']

    @admin.display(description='نام و نام خانوادگی')
    def full_name_display(self, obj):
        name = obj.get_full_name()
        return name if name else mark_safe('<span style="color: #888;">—</span>')

    @admin.display(description='نقش / وظیفه پرسنل')
    def role_badge(self, obj):
        if obj.is_superuser:
            return mark_safe(
                '<span style="background: rgba(220, 38, 38, 0.18); color: #f87171; border: 1px solid rgba(220, 38, 38, 0.4); padding: 3px 9px; border-radius: 6px; font-weight: 700; font-size: 0.82rem;">مدیر کل کافه</span>'
            )
        groups = list(obj.groups.values_list('name', flat=True))
        if not groups:
            return mark_safe('<span style="color: #9ca3af; font-size: 0.82rem;">(بدون نقش)</span>')
        badges = []
        for g in groups:
            if 'گارسون' in g:
                badges.append('<span style="background: rgba(37, 99, 235, 0.16); color: #93c5fd; border: 1px solid rgba(37, 99, 235, 0.35); padding: 3px 9px; border-radius: 6px; font-size: 0.82rem; font-weight: 600;">گارسون / سالن‌دار</span>')
            elif 'آشپزخانه' in g:
                badges.append('<span style="background: rgba(234, 88, 12, 0.16); color: #fdba74; border: 1px solid rgba(234, 88, 12, 0.35); padding: 3px 9px; border-radius: 6px; font-size: 0.82rem; font-weight: 600;">آشپزخانه و بار</span>')
            elif 'صندوق' in g:
                badges.append('<span style="background: rgba(5, 150, 105, 0.16); color: #6ee7b7; border: 1px solid rgba(5, 150, 105, 0.35); padding: 3px 9px; border-radius: 6px; font-size: 0.82rem; font-weight: 600;">صندوق‌دار</span>')
            else:
                badges.append(format_html('<span style="background: rgba(75, 85, 99, 0.2); color: #d1d5db; border: 1px solid rgba(75, 85, 99, 0.4); padding: 3px 9px; border-radius: 6px; font-size: 0.82rem;">{}</span>', g))
        return mark_safe(' '.join(badges))

    @admin.display(description='دسترسی ورود به پنل (Staff)', boolean=True)
    def is_staff_badge(self, obj):
        return obj.is_staff

    @admin.display(description='حساب فعال', boolean=True)
    def is_active_badge(self, obj):
        return obj.is_active
