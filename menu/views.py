from django.shortcuts import render, get_object_or_404, redirect
from django.urls import reverse
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.db import transaction
from django.http import HttpResponseForbidden, JsonResponse
from django.contrib.auth.models import User
from .models import Category, MenuItem, Order, OrderItem, CafeTable


THEME_CONFIGS = {
    1: {
        'code': 'hot-coffee',
        'badge': 'قهوه‌های داغ و اسپرسوبار',
        'badge_en': 'HOT SPECIALTY COFFEE',
        'icon': '☕',
        'image': 'images/hot_coffee_cup.webp',
        'banner_image': 'images/hot_coffee_header_banner.webp',
        'accent': '#E07A3F',
        'accent_light': '#FFD2B3',
        'accent_glow': 'rgba(224, 122, 63, 0.45)',
        'hero_bg': 'linear-gradient(135deg, #241108 0%, #140905 50%, #0d0503 100%)',
        'card_bg': 'linear-gradient(145deg, rgba(82, 38, 19, 0.90) 0%, rgba(36, 17, 9, 0.95) 100%)',
        'scroll_target': 390,
    },
    2: {
        'code': 'cold-coffee',
        'badge': 'قهوه سرد، آیس‌کافی و کلدبرو',
        'badge_en': 'COLD BREW & ICED COFFEE',
        'icon': '🧊',
        'image': 'images/cold_coffee_cup.webp',
        'banner_image': 'images/cold_coffee_header_banner.webp',
        'accent': '#E5A93C',
        'accent_light': '#FDE68A',
        'accent_glow': 'rgba(229, 169, 60, 0.45)',
        'hero_bg': 'linear-gradient(135deg, #c49d74 0%, #b2885d 50%, #986f45 100%)',
        'card_bg': 'linear-gradient(145deg, rgba(62, 45, 30, 0.90) 0%, rgba(32, 22, 14, 0.95) 100%)',
        'scroll_target': 640,
    },
    3: {
        'code': 'herbal-tea',
        'badge': 'دمنوش و چای اصیل طبیعی',
        'badge_en': 'HERBAL TEA',
        'icon': '🍵',
        'image': 'images/tea_cup_herbal_hd.webp',
        'banner_image': 'images/herbal_tea_header_banner_desktop.webp',
        'banner_mobile': 'images/herbal_tea_header_banner.webp',
        'accent': '#84CC16',
        'accent_light': '#DCFCE7',
        'accent_glow': 'rgba(132, 188, 82, 0.45)',
        'hero_bg': 'linear-gradient(135deg, #1d3319 0%, #101c0e 50%, #060e05 100%)',
        'card_bg': 'linear-gradient(145deg, rgba(32, 56, 30, 0.90) 0%, rgba(14, 26, 13, 0.95) 100%)',
        'scroll_target': 840,
    },
    4: {
        'code': 'mojito',
        'badge': 'موهیتو و موکتل‌های بار سرد',
        'badge_en': 'SIGNATURE REFRESHING MOCKTAILS',
        'icon': '🍹',
        'image': 'images/mocktail_glass_hd.webp',
        'banner_image': 'images/mocktail_header_banner.webp',
        'banner_mobile': 'images/mocktail_header_banner.webp',
        'accent': '#8EA869',
        'accent_light': '#E3ECCE',
        'accent_glow': 'rgba(142, 168, 105, 0.50)',
        'hero_bg': 'linear-gradient(155deg, #c4d7b2 0%, #b2c99b 50%, #9cb585 100%)',
        'card_bg': 'linear-gradient(145deg, rgba(32, 42, 28, 0.90) 0%, rgba(16, 22, 14, 0.95) 100%)',
        'scroll_target': 1050,
    },
    5: {
        'code': 'shisha',
        'badge': 'قلیان',
        'badge_en': 'HOOKAH',
        'icon': '💨',
        'image': 'images/shisha_part_bowl.webp',
        'banner_image': 'images/shisha_header_banner_desktop.webp',
        'banner_mobile': 'images/shisha_header_banner_mobile.webp',
        'accent': '#2563EB',
        'accent_light': '#93C5FD',
        'accent_glow': 'rgba(37, 99, 235, 0.55)',
        'hero_bg': 'linear-gradient(155deg, #0a0d10 0%, #030406 50%, #000000 100%)',
        'card_bg': 'linear-gradient(145deg, rgba(14, 24, 48, 0.90) 0%, rgba(6, 12, 24, 0.95) 100%)',
        'scroll_target': 1420,
    },
}


def menu_home(request):
    """صفحه اصلی منو - نمایش همه دسته‌بندی‌ها و آیتم‌ها"""
    categories = Category.objects.filter(is_active=True).prefetch_related('items')
    special_items = MenuItem.objects.filter(is_special=True, is_available=True)
    
    # فیلتر بر اساس دسته‌بندی انتخابی
    selected_category = request.GET.get('category')
    if selected_category:
        items = MenuItem.objects.filter(
            category__id=selected_category,
            is_available=True
        )
    else:
        items = None

    context = {
        'categories': categories,
        'special_items': special_items,
        'selected_category': selected_category,
        'items': items,
    }
    return render(request, 'menu/home.html', context)


def category_detail(request, pk):
    """صفحه جزئیات و منوی هر بخش همراه با تم اختصاصی و زیرمجموعه‌ها (مثل دورچین قلیان)"""
    category = get_object_or_404(Category, pk=pk, is_active=True)
    categories = Category.objects.filter(is_active=True).order_by('order', 'id')
    items = category.items.filter(is_available=True).order_by('order', 'id')
    subcategories = category.subcategories.filter(is_active=True).prefetch_related('items').order_by('order', 'id')
    unassigned_items = category.items.filter(is_available=True, subcategory__isnull=True).order_by('order', 'id')

    theme = THEME_CONFIGS.get(category.id, {
        'code': 'default',
        'badge': category.name,
        'badge_en': category.name_en or 'GARDOO MENU',
        'icon': category.icon or '☕',
        'accent': '#D4A574',
        'accent_light': '#E5C39E',
        'accent_glow': 'rgba(212, 165, 116, 0.40)',
        'hero_bg': 'linear-gradient(135deg, rgba(28, 22, 17, 0.95) 0%, rgba(12, 9, 7, 0.98) 100%)',
        'scroll_target': 0,
    })

    # آماده‌سازی دسته‌بندی‌ها با تصاویر اسلاید و رنگ‌های پس‌زمینه اختصاصی
    categories_with_themes = []
    for cat in categories:
        cat_theme = THEME_CONFIGS.get(cat.id, {
            'code': 'default',
            'badge': cat.name,
            'badge_en': cat.name_en or 'GARDOO',
            'icon': cat.icon or '☕',
            'image': 'images/hot_coffee_cup.webp',
            'accent': '#D4A574',
            'accent_light': '#E5C39E',
            'hero_bg': 'linear-gradient(135deg, rgba(28, 22, 17, 0.95) 0%, rgba(12, 9, 7, 0.98) 100%)',
            'card_bg': 'linear-gradient(145deg, rgba(40, 32, 26, 0.90) 0%, rgba(20, 16, 13, 0.95) 100%)',
            'scroll_target': 0,
        })
        categories_with_themes.append({
            'category': cat,
            'theme': cat_theme,
            'is_current': cat.id == category.id,
        })

    context = {
        'category': category,
        'categories': categories,
        'categories_with_themes': categories_with_themes,
        'subcategories': subcategories,
        'unassigned_items': unassigned_items,
        'items': items,
        'theme': theme,
    }
    return render(request, 'menu/category.html', context)


# ============================================================
# بخش سفارش‌گیر اختصاصی و لمسی گارسون (Waiter Order Panel)
# ============================================================

DEFAULT_TABLE_CHIPS = [
    'میز ۱', 'میز ۲', 'میز ۳', 'میز ۴',
    'میز ۵', 'میز ۶', 'میز ۷', 'میز ۸',
    'VIP ۱', 'VIP ۲', 'تراس ۱', 'تراس ۲', 'بار'
]


def user_can_access_waiter(user):
    """بررسی دسترسی پرسنل (گارسون، صندوق‌دار، باریستا یا مدیر) به بخش ثبت سفارش"""
    if not user.is_authenticated:
        return False
    if user.is_staff or user.is_superuser:
        return True
    return user.groups.filter(name__icontains='گارسون').exists()


def user_can_manage_payment(user):
    """بررسی دسترسی به تسویه حساب و تعیین روش پرداخت (فقط صندوق‌دار یا مدیر کافه)"""
    if not user.is_authenticated:
        return False
    if user.is_superuser:
        return True
    return user.groups.filter(name__icontains='صندوق').exists()


def user_can_manage_kitchen(user):
    """بررسی دسترسی به کنترل و تغییر وضعیت آماده‌سازی سفارش (آشپزخانه و بار یا مدیر کافه)"""
    if not user.is_authenticated:
        return False
    if user.is_superuser:
        return True
    return user.groups.filter(name__icontains='آشپزخانه').exists() or user.groups.filter(name__icontains='بار').exists()


def user_can_create_order(user):
    """بررسی دسترسی به ثبت سفارش جدید و ویرایش فاکتور (فقط گارسون‌ها یا مدیر کل کافه)"""
    if not user.is_authenticated:
        return False
    if user.is_superuser:
        return True
    # پرسنل آشپزخانه و بار اجازه ثبت سفارش جدید ندارند
    if user.groups.filter(name__icontains='آشپزخانه').exists() or user.groups.filter(name__icontains='بار').exists():
        return False
    # صندوق‌دار به تنهایی (بدون نقش گارسون) سفارش جدید ثبت نمی‌کند
    if user.groups.filter(name__icontains='صندوق').exists() and not user.groups.filter(name__icontains='گارسون').exists():
        return False
    return user.has_perm('menu.add_order') or user.groups.filter(name__icontains='گارسون').exists()


@login_required
def waiter_panel(request):
    """پنل لمسی و سریع ثبت و مشاهده سفارش‌های میز برای گارسون‌ها و ادمین"""
    if not user_can_access_waiter(request.user):
        return HttpResponseForbidden("شما دسترسی لازم برای پنل گارسون را ندارید.")

    can_create = user_can_create_order(request.user)
    can_manage_pay = user_can_manage_payment(request.user)
    can_manage_kit = user_can_manage_kitchen(request.user)

    if request.method == 'POST':
        # پرسنل آشپزخانه و بار اجازه ثبت سفارش جدید ندارند
        if not can_create:
            return HttpResponseForbidden("پرسنل آشپزخانه و بار اجازه ثبت سفارش جدید ندارند.")

        table_id = request.POST.get('table_id')
        notes = request.POST.get('notes', '').strip()
        selected_items = request.POST.getlist('selected_items')
        payment_status = request.POST.get('payment_status', 'unpaid')
        payment_method = request.POST.get('payment_method', 'unspecified')
        waiter_id = request.POST.get('waiter_id')

        # تعیین گارسون: فقط ادمین اصلی (سوپریوزر) حق تعیین/تغییر گارسون را دارد
        waiter_user = request.user
        if request.user.is_superuser and waiter_id:
            w = User.objects.filter(id=waiter_id, is_staff=True).first()
            if w:
                waiter_user = w

        # اعتبارسنجی قطعی میز: میز باید فقط و فقط از میزهای رسمی کافه (CafeTable) انتخاب شده باشد
        if not table_id:
            messages.error(request, 'لطفاً یکی از میزهای رسمی کافه را انتخاب کنید (امکان ثبت میز دستی یا غیررسمی وجود ندارد).')
            return redirect('menu:waiter_panel')

        cafe_table = CafeTable.objects.filter(id=table_id, is_active=True).first()
        if not cafe_table:
            messages.error(request, 'میز انتخاب‌شده نامعتبر یا غیرفعال است. لطفاً فقط از میزهای تعریف‌شده کافه انتخاب نمایید.')
            return redirect('menu:waiter_panel')

        table_number = cafe_table.name

        if not selected_items:
            messages.error(request, 'حداقل یک قلم از منو را برای ثبت سفارش انتخاب کنید.')
            return redirect('menu:waiter_panel')

        can_manage_pay = user_can_manage_payment(request.user)
        if can_manage_pay:
            final_payment_status = payment_status if payment_status in dict(Order.PAYMENT_CHOICES) else 'unpaid'
            final_payment_method = payment_method if payment_method in dict(Order.PAYMENT_METHOD_CHOICES) else 'unspecified'
        else:
            final_payment_status = 'unpaid'
            final_payment_method = 'unspecified'

        with transaction.atomic():
            order = Order.objects.create(
                table=cafe_table,
                table_number=table_number,
                waiter=waiter_user,
                status='pending',
                payment_status=final_payment_status,
                payment_method=final_payment_method,
                notes=notes
            )
            created_count = 0
            for item_id_str in selected_items:
                try:
                    item_id = int(item_id_str)
                    qty = int(request.POST.get(f'qty_{item_id}', 1))
                    if qty < 1:
                        qty = 1
                    item_notes = request.POST.get(f'item_notes_{item_id}', '').strip()
                    menu_item = MenuItem.objects.get(id=item_id, is_available=True)
                    OrderItem.objects.create(
                        order=order,
                        item=menu_item,
                        quantity=qty,
                        unit_price=menu_item.final_price,
                        notes=item_notes
                    )
                    created_count += 1
                except (ValueError, MenuItem.DoesNotExist):
                    continue

        if created_count > 0:
            messages.success(
                request,
                f'سفارش شماره #{order.id} برای «{order.table_number}» با مبلغ {order.total_price_formatted()} تومان ثبت شد.'
            )
        else:
            order.delete()
            messages.error(request, 'هیچ قلم معتبری برای سفارش یافت نشد.')

        return redirect(f"{reverse('menu:waiter_panel')}?tab=orders")

    # GET
    categories = Category.objects.filter(is_active=True).prefetch_related('items')
    all_items = MenuItem.objects.filter(is_available=True).select_related('category').order_by('category__order', 'order', 'name')
    orders_qs = Order.objects.all().select_related('waiter', 'table').prefetch_related('items__item').order_by('-created_at')

    can_manage_pay = user_can_manage_payment(request.user)
    can_manage_kit = user_can_manage_kitchen(request.user)

    # فیلترهای اختیاری بر اساس پرمیشن‌های کاربر
    filter_status = request.GET.get('status', '')
    filter_payment = request.GET.get('payment', '')
    filter_waiter = request.GET.get('waiter', '')

    if filter_status in dict(Order.STATUS_CHOICES):
        orders_qs = orders_qs.filter(status=filter_status)
    # فیلتر تسویه فقط در صورتی اعمال می‌شود که کاربر صندوق‌دار یا سوپرادمین باشد
    if can_manage_pay and filter_payment in dict(Order.PAYMENT_CHOICES):
        orders_qs = orders_qs.filter(payment_status=filter_payment)
    if filter_waiter == 'me':
        orders_qs = orders_qs.filter(waiter=request.user)

    orders = list(orders_qs[:80])
    tables = CafeTable.objects.filter(is_active=True).order_by('order', 'name')
    waiters = User.objects.filter(is_staff=True).order_by('first_name', 'username')

    active_tab = request.GET.get('tab')
    if not active_tab:
        active_tab = 'new' if can_create else 'orders'
    elif active_tab == 'new' and not can_create:
        active_tab = 'orders'

    context = {
        'categories': categories,
        'all_items': all_items,
        'orders': orders,
        'tables': tables,
        'waiters': waiters,
        'active_tab': active_tab,
        'status_choices': Order.STATUS_CHOICES,
        'payment_status_choices': Order.PAYMENT_CHOICES,
        'payment_method_choices': Order.PAYMENT_METHOD_CHOICES,
        'filter_status': filter_status,
        'filter_payment': filter_payment if can_manage_pay else '',
        'filter_waiter': filter_waiter,
        'is_edit': False,
        'can_create_order': can_create,
        'can_create_order': can_create,
        'can_manage_payment': can_manage_pay,
        'can_manage_kitchen': can_manage_kit,
    }
    return render(request, 'menu/waiter_panel.html', context)


@login_required
def waiter_order_edit(request, order_id):
    """ویرایش سفارش ثبت‌شده: تغییر اقلام، شماره میز، وضعیت آماده‌سازی، وضعیت پرداخت و روش تسویه"""
    if not user_can_access_waiter(request.user):
        return HttpResponseForbidden("شما دسترسی لازم برای پنل گارسون را ندارید.")

    order = get_object_or_404(Order.objects.prefetch_related('items__item'), id=order_id)
    can_create = user_can_create_order(request.user)
    can_manage_pay = user_can_manage_payment(request.user)
    can_manage_kit = user_can_manage_kitchen(request.user)

    # پرسنل آشپزخانه اجازه ویرایش اقلام و ثبت فاکتور ندارند؛ وضعیت را مستقیماً از لیست سفارش‌ها تغییر می‌دهند
    if not can_create and not request.user.is_superuser:
        messages.error(request, 'پرسنل آشپزخانه فقط امکان تغییر وضعیت آماده‌سازی سفارش از لیست را دارند و مجاز به ویرایش فاکتور نیستند.')
        return redirect(f"{reverse('menu:waiter_panel')}?tab=orders")

    if request.method == 'POST':
        table_id = request.POST.get('table_id')
        notes = request.POST.get('notes', '').strip()
        status = request.POST.get('status', order.status)
        payment_status = request.POST.get('payment_status', order.payment_status)
        payment_method = request.POST.get('payment_method', order.payment_method)
        waiter_id = request.POST.get('waiter_id')
        selected_items = request.POST.getlist('selected_items')

        # اعتبارسنجی قطعی میز: میز باید فقط و فقط از میزهای رسمی کافه باشد
        if not table_id:
            messages.error(request, 'لطفاً یکی از میزهای رسمی کافه را انتخاب کنید.')
            return redirect('menu:waiter_order_edit', order_id=order.id)

        cafe_table = CafeTable.objects.filter(id=table_id, is_active=True).first()
        if not cafe_table:
            messages.error(request, 'میز انتخاب‌شده نامعتبر یا غیرفعال است.')
            return redirect('menu:waiter_order_edit', order_id=order.id)

        table_number = cafe_table.name

        if not selected_items:
            messages.error(request, 'سفارش باید حداقل شامل یک قلم باشد.')
            return redirect('menu:waiter_order_edit', order_id=order.id)

        with transaction.atomic():
            order.table = cafe_table
            order.table_number = table_number
            order.notes = notes
            # وضعیت آماده‌سازی توسط ادمین کافه یا پرسنل آشپزخانه/بار امکان تغییر دارد؛ برای گارسون فقط نمایش است
            if (request.user.is_superuser or can_manage_kit) and status in dict(Order.STATUS_CHOICES):
                order.status = status

            # وضعیت و روش تسویه فقط توسط صندوق‌دار یا سوپرادمین قابل تغییر است
            if can_manage_pay:
                if payment_status in dict(Order.PAYMENT_CHOICES):
                    order.payment_status = payment_status
                if payment_method in dict(Order.PAYMENT_METHOD_CHOICES):
                    order.payment_method = payment_method

            # تغییر گارسون فقط توسط سوپریوزر (ادمین اصلی) مجاز است
            if request.user.is_superuser and waiter_id:
                w = User.objects.filter(id=waiter_id, is_staff=True).first()
                if w:
                    order.waiter = w

            order.save()

            existing_items_map = {oi.item_id: oi for oi in order.items.all()}
            selected_ids = set()
            for s in selected_items:
                try:
                    selected_ids.add(int(s))
                except ValueError:
                    pass

            # حذف اقلامی که تیک آن‌ها برداشته شده
            for item_id, oi in existing_items_map.items():
                if item_id not in selected_ids:
                    oi.delete()

            # بروزرسانی یا افزودن اقلام تیک‌خورده
            for item_id in selected_ids:
                try:
                    qty = int(request.POST.get(f'qty_{item_id}', 1))
                    if qty < 1:
                        qty = 1
                    item_notes = request.POST.get(f'item_notes_{item_id}', '').strip()
                    menu_item = MenuItem.objects.get(id=item_id)

                    if item_id in existing_items_map:
                        oi = existing_items_map[item_id]
                        oi.quantity = qty
                        oi.notes = item_notes
                        if not oi.unit_price:
                            oi.unit_price = menu_item.final_price
                        oi.save()
                    else:
                        OrderItem.objects.create(
                            order=order,
                            item=menu_item,
                            quantity=qty,
                            unit_price=menu_item.final_price,
                            notes=item_notes
                        )
                except (ValueError, MenuItem.DoesNotExist):
                    continue

        messages.success(
            request,
            f'سفارش شماره #{order.id} ({order.table_number}) با مبلغ جدید {order.total_price_formatted()} تومان بروزرسانی شد.'
        )
        return redirect(f"{reverse('menu:waiter_panel')}?tab=orders")

    # GET
    categories = Category.objects.filter(is_active=True).prefetch_related('items')
    all_items = MenuItem.objects.filter(is_available=True).select_related('category').order_by('category__order', 'order', 'name')
    orders = Order.objects.all().select_related('waiter', 'table').prefetch_related('items__item').order_by('-created_at')[:80]
    tables = CafeTable.objects.filter(is_active=True).order_by('order', 'name')
    waiters = User.objects.filter(is_staff=True).order_by('first_name', 'username')

    order_items_map = {
        oi.item_id: {
            'quantity': oi.quantity,
            'notes': oi.notes or '',
            'unit_price': oi.unit_price or oi.item.final_price,
        }
        for oi in order.items.all()
    }

    context = {
        'categories': categories,
        'all_items': all_items,
        'orders': orders,
        'tables': tables,
        'waiters': waiters,
        'active_tab': 'new',
        'is_edit': True,
        'editing_order': order,
        'order_items_map': order_items_map,
        'status_choices': Order.STATUS_CHOICES,
        'payment_status_choices': Order.PAYMENT_CHOICES,
        'payment_method_choices': Order.PAYMENT_METHOD_CHOICES,
        'can_create_order': can_create,
        'can_manage_payment': can_manage_pay,
        'can_manage_kitchen': can_manage_kit,
    }
    return render(request, 'menu/waiter_panel.html', context)


@login_required
def waiter_order_payment_update(request, order_id):
    """تسویه سریع فاکتور میز با کارتخوان یا نقدی مستقیماً از پنل"""
    if not user_can_access_waiter(request.user):
        return HttpResponseForbidden("شما دسترسی لازم برای پنل گارسون را ندارید.")

    if not user_can_manage_payment(request.user):
        return HttpResponseForbidden("فقط صندوق‌دار یا مدیر اصلی کافه امکان تسویه فاکتور و ثبت روش پرداخت را دارند.")

    if request.method == 'POST':
        order = get_object_or_404(Order, id=order_id)
        payment_status = request.POST.get('payment_status', 'paid')
        payment_method = request.POST.get('payment_method', 'pos')
        if payment_status in dict(Order.PAYMENT_CHOICES):
            order.payment_status = payment_status
        if payment_method in dict(Order.PAYMENT_METHOD_CHOICES):
            order.payment_method = payment_method
        order.save()
        method_desc = f" ({order.get_payment_method_display()})" if order.payment_status == 'paid' else ''
        messages.success(request, f'وضعیت فاکتور سفارش #{order.id} به «{order.get_payment_status_display()}{method_desc}» تغییر یافت.')

    return redirect(f"{reverse('menu:waiter_panel')}?tab=orders")


@login_required
def waiter_order_status_update(request, order_id):
    """تغییر سریع وضعیت سفارش (مثلاً تحویل داده شد یا حاضر شد)"""
    if not user_can_access_waiter(request.user):
        return HttpResponseForbidden("شما دسترسی لازم برای پنل گارسون را ندارید.")

    if request.method == 'POST':
        order = get_object_or_404(Order, id=order_id)
        new_status = request.POST.get('status')
        if new_status in dict(Order.STATUS_CHOICES):
            is_super = request.user.is_superuser
            is_kitchen = user_can_manage_kitchen(request.user)

            if not is_super:
                if is_kitchen:
                    if new_status not in ['preparing', 'ready']:
                        return HttpResponseForbidden("پرسنل آشپزخانه و بار فقط امکان تغییر وضعیت به «در حال آماده‌سازی» یا «حاضر شد» را دارند.")
                else:
                    if new_status != 'delivered':
                        return HttpResponseForbidden("گارسون فقط امکان ثبت تحویل سفارش سر میز را دارد.")

            order.status = new_status
            order.save()
            messages.success(request, f'وضعیت سفارش #{order.id} ({order.table_number}) به «{order.get_status_display()}» تغییر یافت.')

    return redirect(f"{reverse('menu:waiter_panel')}?tab=orders")


@login_required
def waiter_order_delete(request, order_id):
    """لغو یا حذف سفارش میز"""
    if not user_can_access_waiter(request.user):
        return HttpResponseForbidden("شما دسترسی لازم برای پنل گارسون را ندارید.")

    if request.method == 'POST':
        if not (request.user.is_superuser or user_can_create_order(request.user)):
            return HttpResponseForbidden("پرسنل آشپزخانه و بار اجازه حذف سفارش را ندارند.")

        order = get_object_or_404(Order, id=order_id)
        oid = order.id
        tnum = order.table_number
        order.delete()
        messages.info(request, f'سفارش شماره #{oid} مربوط به {tnum} حذف گردید.')

    return redirect(f"{reverse('menu:waiter_panel')}?tab=orders")


@login_required
def waiter_notifications_api(request):
    """اندپوینت API جهت بررسی لحظه‌ای وضعیت سفارش‌ها و ارسال نوتیفیکیشن آماده‌سازی و تحویل به گارسون"""
    if not user_can_access_waiter(request.user):
        return HttpResponseForbidden("دسترسی غیرمجاز")

    # واکشی سفارش‌های فعال
    active_orders = Order.objects.filter(
        status__in=['pending', 'preparing', 'ready', 'delivered']
    ).select_related('table', 'waiter').prefetch_related('items__item').order_by('-updated_at')[:40]

    orders_data = []
    for o in active_orders:
        items_list = [f"{oi.quantity}× {oi.item.name}" for oi in o.items.all()]
        items_summary = "، ".join(items_list[:4])
        if len(items_list) > 4:
            items_summary += f" و {len(items_list) - 4} قلم دیگر"

        orders_data.append({
            'id': o.id,
            'table_number': o.table_number,
            'status': o.status,
            'status_label': o.get_status_display(),
            'is_ready': (o.status == 'ready'),
            'is_preparing': (o.status == 'preparing'),
            'waiter_id': o.waiter_id,
            'waiter_name': o.waiter.get_full_name() or o.waiter.username if o.waiter else 'نامشخص',
            'is_my_order': (o.waiter_id == request.user.id),
            'total_price': o.total_price_formatted(),
            'items_summary': items_summary or 'بدون قلم',
            'updated_at': o.updated_at.strftime('%H:%M:%S'),
            'updated_timestamp': int(o.updated_at.timestamp()),
        })

    return JsonResponse({
        'status': 'ok',
        'current_user_id': request.user.id,
        'orders': orders_data,
        'ready_orders': [o for o in orders_data if o['is_ready']],
        'preparing_orders': [o for o in orders_data if o['is_preparing']],
        'total_ready': sum(1 for o in orders_data if o['is_ready']),
        'total_preparing': sum(1 for o in orders_data if o['is_preparing']),
    })
