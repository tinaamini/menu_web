from django.urls import path
from . import views

app_name = 'menu'

urlpatterns = [
    path('', views.menu_home, name='home'),
    path('category/<int:pk>/', views.category_detail, name='category'),
    path('menu/category/<int:pk>/', views.category_detail),
    # کدهای مربوط به پرسنل و پنل سفارش‌گیر (گارسون، آشپزخانه و صندوق) فعلاً کامنت شدند
    # path('waiter/', views.waiter_panel, name='waiter_panel'),
    # path('waiter/order/<int:order_id>/edit/', views.waiter_order_edit, name='waiter_order_edit'),
    # path('waiter/order/<int:order_id>/status/', views.waiter_order_status_update, name='waiter_order_status'),
    # path('waiter/order/<int:order_id>/payment/', views.waiter_order_payment_update, name='waiter_order_payment'),
    # path('waiter/order/<int:order_id>/delete/', views.waiter_order_delete, name='waiter_order_delete'),
    # path('waiter/api/notifications/', views.waiter_notifications_api, name='waiter_notifications_api'),
]
