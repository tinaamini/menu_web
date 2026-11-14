from django.db import models
from django.utils import timezone


class Category(models.Model):
    """دسته‌بندی اصلی منو (هماهنگ با ۵ اسلاید صفحه اصلی)"""
    name = models.CharField(max_length=100, verbose_name='نام دسته‌بندی')
    name_en = models.CharField(max_length=100, blank=True, verbose_name='نام انگلیسی')
    icon = models.CharField(max_length=50, blank=True, verbose_name='آیکون')
    description = models.TextField(blank=True, verbose_name='توضیحات بخش')
    discount_percent = models.PositiveIntegerField(
        default=0,
        verbose_name='تخفیف کلی دسته‌بندی (٪)',
        help_text='درصد تخفیف اعمال‌شده روی تمامی آیتم‌های این دسته‌بندی (مثلاً ۲۰ برای ۲۰٪ تخفیف)'
    )
    discount_start_date = models.DateField(
        null=True, blank=True,
        verbose_name='تاریخ شروع تخفیف',
        help_text='تاریخ شروع تخفیف به شمسی (مثال: ۱۴۰۳/۰۸/۲۵)'
    )
    discount_end_date = models.DateField(
        null=True, blank=True,
        verbose_name='تاریخ پایان تخفیف',
        help_text='تاریخ پایان تخفیف به شمسی (مثال: ۱۴۰۳/۰۸/۳۰). پس از این تاریخ تخفیف به صورت خودکار پایان می‌یابد.'
    )
    order = models.PositiveIntegerField(default=0, verbose_name='ترتیب نمایش')
    is_active = models.BooleanField(default=True, verbose_name='فعال')

    class Meta:
        verbose_name = 'دسته‌بندی اصلی'
        verbose_name_plural = 'دسته‌بندی‌های اصلی'
        ordering = ['order', 'name']

    def __str__(self):
        if self.is_discount_active:
            return f"{self.name} ({self.discount_percent}٪ تخفیف فعال)"
        return self.name

    @property
    def is_discount_active(self):
        """بررسی فعال بودن تخفیف بر اساس درصد و تاریخ شمسی روز"""
        if self.discount_percent <= 0:
            return False
        today = timezone.localdate()
        if self.discount_start_date and today < self.discount_start_date:
            return False
        if self.discount_end_date and today > self.discount_end_date:
            return False
        return True

    @property
    def has_discount(self):
        return self.is_discount_active

    @property
    def effective_discount_percent(self):
        return self.discount_percent if self.is_discount_active else 0


class SubCategory(models.Model):
    """زیرمجموعه / بخش اختصاصی هر دسته‌بندی منو (مثلاً: دورچین برای قلیان، قهوه دمی، ...)"""
    category = models.ForeignKey(
        Category, on_delete=models.CASCADE,
        related_name='subcategories', verbose_name='دسته‌بندی اصلی'
    )
    name = models.CharField(
        max_length=100, verbose_name='نام زیرمجموعه',
        help_text='مثال: دورچین، قلیان ویژه، دمی و چکه‌ای'
    )
    name_en = models.CharField(
        max_length=100, blank=True, verbose_name='نام انگلیسی',
        help_text='مثال: Dorchin & Accompaniments, Exclusive Shisha'
    )
    description = models.TextField(
        blank=True, verbose_name='توضیحات این بخش',
        help_text='توضیح کوتاه درباره این زیرمجموعه (اختیاری)'
    )
    order = models.PositiveIntegerField(default=0, verbose_name='ترتیب نمایش')
    is_active = models.BooleanField(default=True, verbose_name='فعال (نمایش در منو)')

    class Meta:
        verbose_name = 'زیرمجموعه'
        verbose_name_plural = 'زیرمجموعه‌های منو'
        ordering = ['category__order', 'order', 'name']

    def __str__(self):
        return f"{self.category.name} > {self.name}"


class MenuItem(models.Model):
    """آیتم منو متعلق به یک دسته‌بندی و اختیاری متعلق به یک زیرمجموعه (مثل دورچین)"""
    category = models.ForeignKey(
        Category, on_delete=models.CASCADE,
        related_name='items', verbose_name='دسته‌بندی'
    )
    subcategory = models.ForeignKey(
        SubCategory, on_delete=models.SET_NULL,
        blank=True, null=True,
        related_name='items', verbose_name='زیرمجموعه / بخش',
        help_text='زیرمجموعه این آیتم (مثلاً دورچین برای اقلام دورچین قلیان). اختیاری است.'
    )
    name = models.CharField(max_length=200, verbose_name='نام آیتم')
    name_en = models.CharField(max_length=200, blank=True, verbose_name='نام انگلیسی')
    price = models.PositiveIntegerField(verbose_name='قیمت اصلی (تومان)')
    discount_percent = models.PositiveIntegerField(
        default=0,
        verbose_name='تخفیف تکی آیتم (٪)',
        help_text='درصد تخفیف اختصاصی این آیتم. در صورت صفر بودن، از تخفیف کلی دسته‌بندی استفاده می‌شود.'
    )
    discount_start_date = models.DateField(
        null=True, blank=True,
        verbose_name='تاریخ شروع تخفیف',
        help_text='تاریخ شروع تخفیف به شمسی (مثال: ۱۴۰۳/۰۸/۲۵)'
    )
    discount_end_date = models.DateField(
        null=True, blank=True,
        verbose_name='تاریخ پایان تخفیف',
        help_text='تاریخ پایان تخفیف به شمسی (مثال: ۱۴۰۳/۰۸/۳۰). پس از این تاریخ تخفیف آیتم به طور خودکار پایان می‌یابد.'
    )
    image = models.FileField(
        upload_to='products/', blank=True, null=True,
        verbose_name='تصویر / عکس آیتم'
    )
    description = models.TextField(
        blank=True,
        verbose_name='توضیحات و ترکیبات (چیا توش داره)'
    )
    is_available = models.BooleanField(default=True, verbose_name='موجود')
    is_special = models.BooleanField(default=False, verbose_name='پیشنهاد ویژه')
    order = models.PositiveIntegerField(default=0, verbose_name='ترتیب نمایش')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاریخ ایجاد')

    class Meta:
        verbose_name = 'آیتم منو'
        verbose_name_plural = 'آیتم‌های منو'
        ordering = ['order', 'name']

    def __str__(self):
        return f"{self.name} ({self.category.name}) - {self.price:,} تومان"

    @property
    def is_item_discount_active(self):
        """بررسی فعال بودن تخفیف تکی خود آیتم با در نظر گرفتن بازه تاریخ شمسی"""
        if self.discount_percent <= 0:
            return False
        today = timezone.localdate()
        if self.discount_start_date and today < self.discount_start_date:
            return False
        if self.discount_end_date and today > self.discount_end_date:
            return False
        return True

    @property
    def effective_discount_percent(self):
        """محاسبه درصد تخفیف موثر با رعایت بازه تاریخی: اولویت با تخفیف تکی آیتم، در غیر این صورت تخفیف کلی دسته‌بندی"""
        if self.is_item_discount_active:
            return min(self.discount_percent, 100)
        if self.category and self.category.is_discount_active:
            return min(self.category.discount_percent, 100)
        return 0

    @property
    def is_discounted(self):
        return self.effective_discount_percent > 0

    @property
    def final_price(self):
        """قیمت نهایی پس از کسر تخفیف"""
        disc = self.effective_discount_percent
        if disc > 0:
            val = self.price * (100 - disc) / 100
            return int(round(val))
        return self.price

    def price_formatted(self):
        return f"{self.price:,}"

    def final_price_formatted(self):
        return f"{self.final_price:,}"


class CafeTable(models.Model):
    """میزهای کافه که توسط ادمین اصلی تعریف و مدیریت می‌شوند"""
    name = models.CharField(
        max_length=50,
        unique=True,
        verbose_name='نام یا شماره میز',
        help_text='مثال: میز ۱، میز ۲، VIP، تراس ۱'
    )
    section = models.CharField(
        max_length=50,
        blank=True,
        verbose_name='بخش / سالن',
        help_text='مثال: سالن اصلی، تراس، VIP، حیاط'
    )
    capacity = models.PositiveIntegerField(
        default=4,
        blank=True,
        null=True,
        verbose_name='ظرفیت (تعداد صندلی)'
    )
    order = models.PositiveIntegerField(default=0, verbose_name='ترتیب نمایش')
    is_active = models.BooleanField(default=True, verbose_name='فعال (قابل سفارش‌گیری)')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاریخ ایجاد')

    class Meta:
        verbose_name = 'میز کافه'
        verbose_name_plural = 'میزهای کافه'
        ordering = ['order', 'name']

    def __str__(self):
        if self.section:
            return f"{self.name} ({self.section})"
        return self.name


class Order(models.Model):
    """سفارش میز کافه"""
    STATUS_CHOICES = [
        ('pending', 'در صف انتظار'),
        ('preparing', 'در حال آماده‌سازی'),
        ('ready', 'حاضر شد'),
        ('delivered', 'تحویل داده شد'),
        ('cancelled', 'لغو شده'),
    ]

    PAYMENT_CHOICES = [
        ('unpaid', 'پرداخت نشده'),
        ('paid', 'تسویه شده'),
    ]

    PAYMENT_METHOD_CHOICES = [
        ('pos', 'کارتخوان (POS)'),
        ('cash', 'نقدی'),
        ('transfer', 'کارت‌به‌کارت'),
        ('unspecified', 'تعیین‌نشده'),
    ]

    table = models.ForeignKey(
        CafeTable,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='orders',
        verbose_name='میز کافه'
    )
    table_number = models.CharField(
        max_length=50,
        verbose_name='شماره / نام میز',
        help_text='مثال: میز ۱، میز ۷، تراس ۲، VIP'
    )
    waiter = models.ForeignKey(
        'auth.User',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='taken_orders',
        verbose_name='گارسون ثبت‌کننده'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        verbose_name='وضعیت سفارش'
    )
    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_CHOICES,
        default='unpaid',
        verbose_name='وضعیت پرداخت'
    )
    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES,
        default='unspecified',
        verbose_name='روش پرداخت'
    )
    notes = models.TextField(
        blank=True,
        verbose_name='یادداشت سفارش میز',
        help_text='توضیحات خاص مشتری (مثلاً: بدون شکر، آب ولرم، اول دمنوش بعد قلیان)'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='زمان ثبت سفارش')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='آخرین بروزرسانی')

    class Meta:
        verbose_name = 'سفارش میز'
        verbose_name_plural = 'سفارش‌های میزها'
        ordering = ['-created_at']

    def __str__(self):
        return f"سفارش شماره {self.id} - {self.table_number} ({self.get_status_display()})"

    def save(self, *args, **kwargs):
        if self.table and not self.table_number:
            self.table_number = self.table.name
        super().save(*args, **kwargs)

    @property
    def total_price(self):
        """جمع کل مبلغ فاکتور میز"""
        return sum(item.subtotal for item in self.items.all())

    def total_price_formatted(self):
        return f"{self.total_price:,}"

    @property
    def total_items_count(self):
        return sum(item.quantity for item in self.items.all())


class OrderItem(models.Model):
    """اقلام ثبت‌شده داخل سفارش"""
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name='سفارش'
    )
    item = models.ForeignKey(
        MenuItem,
        on_delete=models.PROTECT,
        verbose_name='آیتم منو'
    )
    quantity = models.PositiveIntegerField(default=1, verbose_name='تعداد')
    unit_price = models.PositiveIntegerField(
        null=True, blank=True,
        verbose_name='قیمت واحد (تومان)',
        help_text='در صورت خالی بودن، قیمت نهایی محصول در لحظه ثبت ذخیره می‌شود'
    )
    notes = models.CharField(
        max_length=200,
        blank=True,
        verbose_name='یادداشت تکی این قلم',
        help_text='مثال: دبل‌شات، شیر بادام، یخ زیاد'
    )

    class Meta:
        verbose_name = 'قلم سفارش'
        verbose_name_plural = 'اقلام سفارش'

    def save(self, *args, **kwargs):
        # ثبت قیمت محصول در لحظه سفارش تا با تغییر بعدی قیمت منو، فاکتور دست‌نخورده بماند
        if not self.unit_price and self.item:
            self.unit_price = self.item.final_price
        super().save(*args, **kwargs)

    @property
    def subtotal(self):
        price = self.unit_price if self.unit_price is not None else (self.item.final_price if self.item else 0)
        return (self.quantity or 1) * price

    def subtotal_formatted(self):
        return f"{self.subtotal:,}"

    def __str__(self):
        return f"{self.quantity}x {self.item.name} ({self.subtotal_formatted()} تومان)"
