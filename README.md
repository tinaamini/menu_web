# 🏠 راهنمای راه‌اندازی - کافه گاردو

## نصب و راه‌اندازی

### ۱. نصب وابستگی‌ها
```bash
pip install -r requirements.txt
```

### ۲. اجرای migration‌ها
```bash
python manage.py makemigrations
python manage.py migrate
```

### ۳. ساخت superuser برای پنل ادمین
```bash
python manage.py createsuperuser
```

### ۴. اضافه کردن داده‌های نمونه (اختیاری)
```bash
python populate_data.py
```

### ۵. اجرای سرور
```bash
python manage.py runserver
```

### ۶. مشاهده سایت
- 🌐 **سایت:** http://127.0.0.1:8000
- 🔐 **پنل ادمین:** http://127.0.0.1:8000/admin/

---

## ساختار پروژه

```
gardoo/
├── cafe_menu/          # تنظیمات اصلی Django
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── menu/               # اپلیکیشن منو
│   ├── models.py       # مدل‌های Category و MenuItem
│   ├── views.py        # ویو‌ها
│   ├── urls.py         # آدرس‌ها
│   └── admin.py        # پنل ادمین
├── templates/          # قالب‌های HTML
│   ├── base.html
│   └── menu/
│       ├── home.html
│       └── category.html
├── static/             # فایل‌های استاتیک
│   ├── css/style.css
│   └── js/main.js
├── media/              # تصاویر آپلود شده
├── manage.py
├── requirements.txt
└── populate_data.py    # داده‌های نمونه
```

## امکانات

- ✅ صفحه اصلی با تمام دسته‌بندی‌ها
- ✅ پیشنهاد ویژه روز
- ✅ فیلتر بر اساس دسته‌بندی
- ✅ پنل ادمین کامل
- ✅ پشتیبانی از تصاویر محصول
- ✅ طراحی ریسپانسیو (موبایل-فرندلی)
- ✅ زبان فارسی / RTL
- ✅ فونت وزیرمتن
