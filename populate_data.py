"""
اسکریپت اضافه کردن داده‌های نمونه به کافه گاردو
اجرا: python populate_data.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cafe_menu.settings')
django.setup()

from menu.models import Category, MenuItem

print("در حال اضافه کردن داده‌های نمونه...")

# دسته‌بندی‌ها
categories_data = [
    {'name': 'قهوه‌های گرم', 'name_en': 'Hot Coffee', 'icon': '☕', 'order': 1},
    {'name': 'قهوه‌های سرد', 'name_en': 'Cold Coffee', 'icon': '🧊', 'order': 2},
    {'name': 'چای و دمنوش', 'name_en': 'Tea & Herbal', 'icon': '🍵', 'order': 3},
    {'name': 'نوشیدنی‌های سرد', 'name_en': 'Cold Drinks', 'icon': '🥤', 'order': 4},
    {'name': 'کیک و شیرینی', 'name_en': 'Cakes & Pastry', 'icon': '🍰', 'order': 5},
    {'name': 'ساندویچ و خوراکی', 'name_en': 'Sandwiches & Snacks', 'icon': '🥪', 'order': 6},
]

categories = {}
for data in categories_data:
    cat, created = Category.objects.get_or_create(
        name=data['name'],
        defaults=data
    )
    categories[data['name']] = cat
    status = 'ایجاد شد' if created else 'موجود بود'
    print(f"  {data['icon']} {data['name']}: {status}")

# آیتم‌های منو
items_data = [
    # قهوه‌های گرم
    {'category': 'قهوه‌های گرم', 'name': 'اسپرسو', 'name_en': 'Espresso', 'price': 35000, 'description': 'اسپرسوی تک شات با دانه‌های اعلا', 'order': 1},
    {'category': 'قهوه‌های گرم', 'name': 'اسپرسو دابل', 'name_en': 'Double Espresso', 'price': 50000, 'description': 'اسپرسوی دو شات پرقدرت', 'order': 2},
    {'category': 'قهوه‌های گرم', 'name': 'لته', 'name_en': 'Latte', 'price': 65000, 'description': 'اسپرسو با شیر بخارپز شده و کف ظریف', 'order': 3},
    {'category': 'قهوه‌های گرم', 'name': 'کاپوچینو', 'name_en': 'Cappuccino', 'price': 60000, 'description': 'اسپرسو با شیر و کف پرحجم', 'order': 4},
    {'category': 'قهوه‌های گرم', 'name': 'آمریکانو', 'name_en': 'Americano', 'price': 45000, 'description': 'اسپرسو رقیق شده با آب گرم', 'order': 5},
    {'category': 'قهوه‌های گرم', 'name': 'فلت وایت', 'name_en': 'Flat White', 'price': 70000, 'description': 'اسپرسو با میکرو فوم شیر', 'order': 6},
    {'category': 'قهوه‌های گرم', 'name': 'ماکیاتو', 'name_en': 'Macchiato', 'price': 55000, 'description': 'اسپرسو با کمی شیر', 'order': 7},
    {'category': 'قهوه‌های گرم', 'name': 'موکا', 'name_en': 'Mocha', 'price': 75000, 'description': 'لته با شکلات داغ', 'order': 8, 'is_special': True},

    # قهوه‌های سرد
    {'category': 'قهوه‌های سرد', 'name': 'آیس لته', 'name_en': 'Iced Latte', 'price': 75000, 'description': 'لته سرد با یخ', 'order': 1},
    {'category': 'قهوه‌های سرد', 'name': 'کلد برو', 'name_en': 'Cold Brew', 'price': 80000, 'description': '۱۲ ساعت دم‌کرده در دمای پایین', 'order': 2, 'is_special': True},
    {'category': 'قهوه‌های سرد', 'name': 'فرپوچینو', 'name_en': 'Frappuccino', 'price': 90000, 'description': 'اسموتی قهوه با بستنی', 'order': 3},
    {'category': 'قهوه‌های سرد', 'name': 'آیس آمریکانو', 'name_en': 'Iced Americano', 'price': 55000, 'description': 'آمریکانو سرد با یخ', 'order': 4},

    # چای و دمنوش
    {'category': 'چای و دمنوش', 'name': 'چای ایرانی', 'name_en': 'Persian Tea', 'price': 25000, 'description': 'چای سنتی با نبات', 'order': 1},
    {'category': 'چای و دمنوش', 'name': 'چای ماسالا', 'name_en': 'Masala Tea', 'price': 45000, 'description': 'چای هندی با ادویه و شیر', 'order': 2},
    {'category': 'چای و دمنوش', 'name': 'دمنوش بابونه', 'name_en': 'Chamomile', 'price': 40000, 'description': 'آرامش‌بخش و لطیف', 'order': 3},
    {'category': 'چای و دمنوش', 'name': 'چای سبز', 'name_en': 'Green Tea', 'price': 35000, 'description': 'چای سبز مرغوب ژاپنی', 'order': 4},

    # نوشیدنی‌های سرد
    {'category': 'نوشیدنی‌های سرد', 'name': 'موهیتو', 'name_en': 'Mojito', 'price': 65000, 'description': 'نعناع، لیمو و سودا', 'order': 1},
    {'category': 'نوشیدنی‌های سرد', 'name': 'لیموناد', 'name_en': 'Lemonade', 'price': 50000, 'description': 'لیموناد تازه با نعناع', 'order': 2},
    {'category': 'نوشیدنی‌های سرد', 'name': 'آب‌میوه طبیعی', 'name_en': 'Fresh Juice', 'price': 55000, 'description': 'آب‌میوه تازه روز', 'order': 3},
    {'category': 'نوشیدنی‌های سرد', 'name': 'شیک شکلاتی', 'name_en': 'Chocolate Shake', 'price': 85000, 'description': 'شیک با شکلات بلژیکی', 'order': 4},

    # کیک و شیرینی
    {'category': 'کیک و شیرینی', 'name': 'کیک شکلاتی', 'name_en': 'Chocolate Cake', 'price': 55000, 'description': 'کیک خانگی با خامه شکلاتی', 'order': 1, 'is_special': True},
    {'category': 'کیک و شیرینی', 'name': 'چیز کیک', 'name_en': 'Cheesecake', 'price': 65000, 'description': 'چیز کیک نیویورکی', 'order': 2},
    {'category': 'کیک و شیرینی', 'name': 'تیرامیسو', 'name_en': 'Tiramisu', 'price': 70000, 'description': 'دسر ایتالیایی با قهوه', 'order': 3},
    {'category': 'کیک و شیرینی', 'name': 'مافین بلوبری', 'name_en': 'Blueberry Muffin', 'price': 40000, 'description': 'مافین تازه با بلوبری', 'order': 4},
    {'category': 'کیک و شیرینی', 'name': 'کروآسان', 'name_en': 'Croissant', 'price': 45000, 'description': 'کروآسان فرانسوی ترد', 'order': 5},

    # ساندویچ
    {'category': 'ساندویچ و خوراکی', 'name': 'باگت مرغ', 'name_en': 'Chicken Baguette', 'price': 95000, 'description': 'مرغ گریل با سبزیجات', 'order': 1},
    {'category': 'ساندویچ و خوراکی', 'name': 'پانینی', 'name_en': 'Panini', 'price': 85000, 'description': 'نان فوکاچیا با پنیر ذوب شده', 'order': 2},
    {'category': 'ساندویچ و خوراکی', 'name': 'سالاد سزار', 'name_en': 'Caesar Salad', 'price': 75000, 'description': 'سالاد با سس سزار خانگی', 'order': 3},
]

for data in items_data:
    cat_name = data.pop('category')
    data['category'] = categories[cat_name]
    item, created = MenuItem.objects.get_or_create(
        name=data['name'],
        category=data['category'],
        defaults=data
    )
    status = 'ایجاد شد' if created else 'موجود بود'
    print(f"  - {data['name']}: {status}")

print("\n✅ داده‌های نمونه با موفقیت اضافه شدند!")
print("🌐 سایت را در http://127.0.0.1:8000 مشاهده کنید")
print("🔐 پنل ادمین: http://127.0.0.1:8000/admin/")
