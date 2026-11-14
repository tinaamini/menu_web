"""
ماژول اختصاصی و کاملاً بومی تبدیل تقویم شمسی (جلالی) و میلادی
طراحی‌شده ویژه پنل مدیریت کافه گاردو بدون وابستگی به کتابخانه‌های جانبی
"""
import datetime
from django.utils import timezone
from django.utils.html import mark_safe

PERSIAN_TO_ENGLISH_DIGITS = str.maketrans('۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩', '01234567890123456789')
ENGLISH_TO_PERSIAN_DIGITS = str.maketrans('0123456789', '۰۱۲۳۴۵۶۷۸۹')


def normalize_digits(text):
    """تبدیل تمام ارقام فارسی یا عربی به ارقام انگلیسی لاتین"""
    return text.translate(PERSIAN_TO_ENGLISH_DIGITS) if text else ''


def to_persian_digits(text):
    """تبدیل ارقام انگلیسی لاتین به ارقام فارسی زیبا"""
    return str(text).translate(ENGLISH_TO_PERSIAN_DIGITS) if text is not None else ''


def gregorian_to_jalali(gy, gm, gd):
    """الگوریتم دقیق ریاضی تبدیل میلادی به جلالی (شمسی)"""
    g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]
    if gy > 1600:
        jy = 979
        gy -= 1600
    else:
        jy = 0
        gy -= 621
    gy2 = gy + 1 if gm > 2 else gy
    days = (365 * gy) + ((gy2 + 3) // 4) - ((gy2 + 99) // 100) + ((gy2 + 399) // 400) - 80 + gd + g_d_m[gm - 1]
    jy += 33 * (days // 12053)
    days %= 12053
    jy += 4 * (days // 1461)
    days %= 1461
    if days > 365:
        jy += (days - 1) // 365
        days = (days - 1) % 365
    if days < 186:
        jm = 1 + (days // 31)
        jd = 1 + (days % 31)
    else:
        jm = 7 + ((days - 186) // 30)
        jd = 1 + ((days - 186) % 30)
    return jy, jm, jd


def jalali_to_gregorian(jy, jm, jd):
    """الگوریتم دقیق ریاضی تبدیل جلالی (شمسی) به میلادی"""
    if jy > 979:
        gy = 1600
        jy -= 979
    else:
        gy = 621
    days = (365 * jy) + ((jy // 33) * 8) + (((jy % 33) + 3) // 4) + 78 + jd + (
        (jm - 1) * 31 if jm < 7 else ((jm - 7) * 30) + 186
    )
    gy += 400 * (days // 146097)
    days %= 146097
    if days > 36524:
        days -= 1
        gy += 100 * (days // 36524)
        days %= 36524
        if days >= 365:
            days += 1
    gy += 4 * (days // 1461)
    days %= 1461
    if days > 365:
        gy += (days - 1) // 365
        days = (days - 1) % 365
    gd = days + 1
    sal_a = [0, 31, 29 if ((gy % 4 == 0 and gy % 100 != 0) or gy % 400 == 0) else 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    gm = 0
    while gm < 13 and gd > sal_a[gm]:
        gd -= sal_a[gm]
        gm += 1
    return gy, gm, gd


def to_jalali_str(d):
    """تبدیل آبجکت تاریخ پایتون به رشته تاریخ شمسی استاندارد (1403/08/25)"""
    if not d:
        return ''
    jy, jm, jd = gregorian_to_jalali(d.year, d.month, d.day)
    return f"{jy:04d}/{jm:02d}/{jd:02d}"


def to_jalali_display(d):
    """تبدیل آبجکت تاریخ به رشته شمسی با ارقام فارسی (۱۴۰۳/۰۸/۲۵)"""
    if not d:
        return ''
    return to_persian_digits(to_jalali_str(d))


def parse_jalali_str(s):
    """
    پارس کردن ورودی کاربر فارسی یا انگلیسی و تبدیل به datetime.date میلادی
    پشتیبانی از فرمت‌های 1403/08/25 و 1403-08-25 با ارقام فارسی یا انگلیسی
    """
    if not s:
        return None
    cleaned = normalize_digits(str(s).strip().replace('-', '/'))
    if not cleaned:
        return None
    parts = cleaned.split('/')
    if len(parts) != 3:
        raise ValueError('فرمت تاریخ باید به صورت سال/ماه/روز باشد (مثال: ۱۴۰۳/۰۸/۲۵)')
    try:
        jy, jm, jd = int(parts[0]), int(parts[1]), int(parts[2])
    except ValueError:
        raise ValueError('اعداد وارد شده برای تاریخ شمسی نامعتبر هستند.')
    if not (1300 <= jy <= 1500):
        raise ValueError('سال شمسی باید بین ۱۳۰۰ تا ۱۵۰۰ باشد.')
    if not (1 <= jm <= 12):
        raise ValueError('ماه شمسی باید بین ۱ تا ۱۲ باشد.')
    max_days = 31 if jm <= 6 else (30 if jm <= 11 else 30)
    if not (1 <= jd <= max_days):
        raise ValueError(f'روز برای ماه {jm} باید بین ۱ تا {max_days} باشد.')
    gy, gm, gd = jalali_to_gregorian(jy, jm, jd)
    return datetime.date(gy, gm, gd)


def current_jalali_date():
    """تاریخ امروز به صورت شمسی استاندارد"""
    today = timezone.localdate()
    return to_jalali_str(today)


def get_discount_status(percent, start_date, end_date, today=None):
    """
    بررسی دقیق وضعیت تخفیف بر اساس درصد و تاریخ شمسی:
    خروجی یک تاپل شامل: (is_active: bool, status_text: str, badge_html: str)
    """
    if not percent or percent <= 0:
        return False, "بدون تخفیف", mark_safe('<span style="color: #6b7280;">—</span>')

    if today is None:
        today = timezone.localdate()

    # اگر تاریخ شروع تعیین شده ولی هنوز فرانرسیده
    if start_date and today < start_date:
        start_j = to_jalali_display(start_date)
        text = f"شروع از {start_j}"
        badge = mark_safe(
            f'<span style="background: rgba(59, 130, 246, 0.16); color: #93c5fd; border: 1px solid rgba(59, 130, 246, 0.35); padding: 2px 8px; border-radius: 6px; font-size: 0.80rem; font-weight: 600;">⏳ {text} ({percent}٪)</span>'
        )
        return False, text, badge

    # اگر تاریخ پایان تعیین شده و گذشته است (منقضی شده)
    if end_date and today > end_date:
        end_j = to_jalali_display(end_date)
        text = f"منقضی شده ({end_j})"
        badge = mark_safe(
            f'<span style="background: rgba(239, 68, 68, 0.16); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.35); padding: 2px 8px; border-radius: 6px; font-size: 0.80rem; font-weight: 600;">❌ منقضی شده ({end_j})</span>'
        )
        return False, text, badge

    # تخفیف در حال حاضر فعال است
    if end_date:
        end_j = to_jalali_display(end_date)
        text = f"فعال تا {end_j}"
        badge = mark_safe(
            f'<span style="background: rgba(16, 185, 129, 0.18); color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.4); padding: 2px 8px; border-radius: 6px; font-size: 0.80rem; font-weight: 700;">✓ فعال تا {end_j} ({percent}٪)</span>'
        )
        return True, text, badge
    elif start_date:
        start_j = to_jalali_display(start_date)
        text = f"فعال (از {start_j})"
        badge = mark_safe(
            f'<span style="background: rgba(16, 185, 129, 0.18); color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.4); padding: 2px 8px; border-radius: 6px; font-size: 0.80rem; font-weight: 700;">✓ فعال از {start_j} ({percent}٪)</span>'
        )
        return True, text, badge
    else:
        text = "فعال همیشگی"
        badge = mark_safe(
            f'<span style="background: rgba(234, 179, 8, 0.18); color: #fde047; border: 1px solid rgba(234, 179, 8, 0.4); padding: 2px 8px; border-radius: 6px; font-size: 0.80rem; font-weight: 700;">✓ فعال همیشگی ({percent}٪)</span>'
        )
        return True, text, badge
