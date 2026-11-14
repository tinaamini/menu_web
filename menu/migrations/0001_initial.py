import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Category',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, verbose_name='نام دسته‌بندی')),
                ('name_en', models.CharField(blank=True, max_length=100, verbose_name='نام انگلیسی')),
                ('icon', models.CharField(blank=True, max_length=50, verbose_name='آیکون (emoji یا CSS class)')),
                ('order', models.PositiveIntegerField(default=0, verbose_name='ترتیب نمایش')),
                ('is_active', models.BooleanField(default=True, verbose_name='فعال')),
            ],
            options={
                'verbose_name': 'دسته‌بندی',
                'verbose_name_plural': 'دسته‌بندی‌ها',
                'ordering': ['order', 'name'],
            },
        ),
        migrations.CreateModel(
            name='MenuItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200, verbose_name='نام')),
                ('name_en', models.CharField(blank=True, max_length=200, verbose_name='نام انگلیسی')),
                ('description', models.TextField(blank=True, verbose_name='توضیحات')),
                ('price', models.PositiveIntegerField(verbose_name='قیمت (تومان)')),
                ('image', models.FileField(blank=True, null=True, upload_to='products/', verbose_name='تصویر')),
                ('is_available', models.BooleanField(default=True, verbose_name='موجود')),
                ('is_special', models.BooleanField(default=False, verbose_name='پیشنهاد ویژه')),
                ('order', models.PositiveIntegerField(default=0, verbose_name='ترتیب نمایش')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='تاریخ ایجاد')),
                ('category', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='items', to='menu.category', verbose_name='دسته‌بندی')),
            ],
            options={
                'verbose_name': 'آیتم منو',
                'verbose_name_plural': 'آیتم‌های منو',
                'ordering': ['order', 'name'],
            },
        ),
    ]
