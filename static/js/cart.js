/**
 * Cafe Gardoo - Luxury Shopping Cart & Live Order Tracking System
 * سیستم سبد خرید، صدور فاکتور و پیگیری لحظه‌ای سفارش‌های ثبت‌شده کافه گاردو
 */

(function () {
  'use strict';

  // کلیدهای ذخیره‌سازی محلی در مرورگر کاربر
  const CART_STORAGE_KEY = 'gardoo_cart_items_v1';
  const ORDERS_STORAGE_KEY = 'gardoo_submitted_orders_v1';
  const CURRENT_APP_VERSION = '329.0';

  class GardooCart {
    constructor() {
      this.items = this.loadCart();
      this.submittedOrderIds = this.loadOrderIds();
      this.initDOMElements();
      this.bindEvents();
      this.syncUI();
      this.initVersionChecker();
      this.updateMyOrdersBadge();
    }

    // بارگذاری اقلام سبد خرید از حافظه مرورگر
    loadCart() {
      try {
        const raw = localStorage.getItem(CART_STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        return [];
      }
    }

    // ذخیره‌سازی اقلام در حافظه محلی
    saveCart() {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.items));
      } catch (e) {}
      this.syncUI();
    }

    // بارگذاری شناسه‌های سفارش‌های ثبت‌شده کاربر
    loadOrderIds() {
      try {
        const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        return [];
      }
    }

    // ذخیره شناسه سفارش جدید در حافظه محلی
    saveOrderId(id) {
      if (!this.submittedOrderIds.includes(id)) {
        this.submittedOrderIds.unshift(id);
        try {
          localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(this.submittedOrderIds));
        } catch (e) {}
      }
      this.updateMyOrdersBadge();
    }

    initDOMElements() {
      // نوار شناور سبد خرید در پایین صفحه
      this.floatingBar = document.getElementById('floatingCartBar');
      this.cartCountEl = document.getElementById('cartTotalCount');
      this.cartBarTotalEl = document.getElementById('cartBarTotal');
      this.checkoutBarBtn = document.getElementById('checkoutBarBtn');
      this.openCartBtn = document.getElementById('openCartBtn');
      this.openMyOrdersBtn = document.getElementById('openMyOrdersBtn');
      this.myOrdersCountBadge = document.getElementById('myOrdersCount');

      // مودال فاکتور سبد خرید
      this.cartModal = document.getElementById('cartInvoiceModal');
      this.closeCartModalBtn = document.getElementById('closeCartModalBtn');
      this.cartItemsList = document.getElementById('cartItemsList');
      this.invoiceGrandTotalEl = document.getElementById('invoiceGrandTotal');
      this.tableInput = document.getElementById('cartTableInput');
      this.notesInput = document.getElementById('cartNotesInput');
      this.tableChips = document.querySelectorAll('.table-chip');
      this.submitOrderBtn = document.getElementById('submitOrderBtn');

      // مودال سفارش‌های ثبت‌شده من
      this.myOrdersModal = document.getElementById('myOrdersModal');
      this.closeMyOrdersBtn = document.getElementById('closeMyOrdersBtn');
      this.refreshOrdersBtn = document.getElementById('refreshOrdersBtn');
      this.myOrdersContainer = document.getElementById('myOrdersContainer');
      this.headerMyOrdersBtn = document.getElementById('headerMyOrdersBtn');

      // دکمه‌های افزودن در هر کارت
      this.cardWrappers = document.querySelectorAll('.card-cart-btn-wrap');
    }

    bindEvents() {
      const self = this;

      // هندل کردن دکمه‌های درون کارت‌ها
      document.addEventListener('click', (e) => {
        const addBtn = e.target.closest('.btn-card-add');
        if (addBtn) {
          e.stopPropagation();
          const wrap = addBtn.closest('.card-cart-btn-wrap');
          if (wrap) {
            const id = parseInt(wrap.dataset.itemId);
            const name = wrap.dataset.itemName;
            const price = parseInt(wrap.dataset.itemPrice) || 0;
            const img = wrap.dataset.itemImg || '';
            self.addItem(id, name, price, img);
          }
          return;
        }

        const plusBtn = e.target.closest('.stepper-btn-plus');
        if (plusBtn) {
          e.stopPropagation();
          const wrap = plusBtn.closest('.card-cart-btn-wrap');
          if (wrap) {
            const id = parseInt(wrap.dataset.itemId);
            self.updateQuantity(id, 1);
          }
          return;
        }

        const minusBtn = e.target.closest('.stepper-btn-minus');
        if (minusBtn) {
          e.stopPropagation();
          const wrap = minusBtn.closest('.card-cart-btn-wrap');
          if (wrap) {
            const id = parseInt(wrap.dataset.itemId);
            self.updateQuantity(id, -1);
          }
          return;
        }
      });

      // دکمه‌های باز و بستن مودال فاکتور
      if (this.checkoutBarBtn) {
        this.checkoutBarBtn.addEventListener('click', () => self.openCartModal());
      }
      if (this.openCartBtn) {
        this.openCartBtn.addEventListener('click', () => self.openCartModal());
      }
      if (this.closeCartModalBtn) {
        this.closeCartModalBtn.addEventListener('click', () => self.closeCartModal());
      }
      if (this.cartModal) {
        this.cartModal.addEventListener('click', (e) => {
          if (e.target === self.cartModal) self.closeCartModal();
        });
      }

      // دکمه‌های باز و بستن مودال سفارش‌های من
      if (this.openMyOrdersBtn) {
        this.openMyOrdersBtn.addEventListener('click', () => self.openMyOrdersModal());
      }
      if (this.headerMyOrdersBtn) {
        this.headerMyOrdersBtn.addEventListener('click', () => self.openMyOrdersModal());
      }
      if (this.closeMyOrdersBtn) {
        this.closeMyOrdersBtn.addEventListener('click', () => self.closeMyOrdersModal());
      }
      if (this.refreshOrdersBtn) {
        this.refreshOrdersBtn.addEventListener('click', () => self.fetchAndRenderMyOrders());
      }
      if (this.myOrdersModal) {
        this.myOrdersModal.addEventListener('click', (e) => {
          if (e.target === self.myOrdersModal) self.closeMyOrdersModal();
        });
      }

      // انتخاب سریع شماره میز با چیپ‌ها
      if (this.tableChips) {
        this.tableChips.forEach((chip) => {
          chip.addEventListener('click', () => {
            self.tableChips.forEach((c) => c.classList.remove('active'));
            chip.classList.add('active');
            if (self.tableInput) {
              self.tableInput.value = chip.dataset.table;
              self.tableInput.focus();
            }
          });
        });
      }

      // دکمه افزودن از درون مودال جزئیات آیتم
      const modalAddBtn = document.getElementById('modalAddCartBtn');
      if (modalAddBtn) {
        modalAddBtn.addEventListener('click', () => {
          const m = document.getElementById('itemDetailModal');
          if (m && m.dataset.itemId) {
            const id = parseInt(m.dataset.itemId);
            const name = m.dataset.itemName || '';
            const price = parseInt(m.dataset.itemPrice) || 0;
            const img = m.dataset.itemImg || '';
            self.addItem(id, name, price, img);
            
            // بستن مودال پس از افزودن
            const closeBtn = document.getElementById('modalCloseBtn');
            if (closeBtn) closeBtn.click();
          }
        });
      }

      // دکمه ثبت نهایی سفارش
      if (this.submitOrderBtn) {
        this.submitOrderBtn.addEventListener('click', () => self.submitOrder());
      }
    }

    // افزودن آیتم به سبد
    addItem(id, name, price, img) {
      const existing = this.items.find((item) => item.id === id);
      if (existing) {
        existing.quantity += 1;
      } else {
        this.items.push({
          id: id,
          name: name,
          price: price,
          image: img,
          quantity: 1,
        });
      }
      this.saveCart();
      this.playHapticFeedback();
    }

    // تغییر تعداد قلم
    updateQuantity(id, delta) {
      const idx = this.items.findIndex((item) => item.id === id);
      if (idx !== -1) {
        this.items[idx].quantity += delta;
        if (this.items[idx].quantity <= 0) {
          this.items.splice(idx, 1);
        }
        this.saveCart();
        this.playHapticFeedback();
      }
    }

    // حذف یک قلم از فاکتور
    removeItem(id) {
      this.items = this.items.filter((item) => item.id !== id);
      this.saveCart();
    }

    // پاک کردن کامل سبد
    clearCart() {
      this.items = [];
      this.saveCart();
    }

    // محاسبه جمع کل فاکتور
    getTotalPrice() {
      return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }

    // محاسبه تعداد کل اقلام
    getTotalCount() {
      return this.items.reduce((sum, item) => sum + item.quantity, 0);
    }

    formatPrice(amount) {
      return (amount || 0).toLocaleString('fa-IR');
    }

    playHapticFeedback() {
      if (navigator.vibrate) {
        navigator.vibrate(25);
      }
    }

    // همگام‌سازی استپرهای روی هر کارت با دیتای سبد
    syncCardSteppers() {
      const self = this;
      const wraps = document.querySelectorAll('.card-cart-btn-wrap');
      wraps.forEach((wrap) => {
        const id = parseInt(wrap.dataset.itemId);
        const item = self.items.find((it) => it.id === id);
        const addBtn = wrap.querySelector('.btn-card-add');
        const stepper = wrap.querySelector('.card-qty-stepper');
        const valEl = wrap.querySelector('.stepper-val');

        if (item && item.quantity > 0) {
          if (addBtn) addBtn.style.display = 'none';
          if (stepper) stepper.style.display = 'inline-flex';
          if (valEl) valEl.textContent = item.quantity;
        } else {
          if (addBtn) addBtn.style.display = 'inline-flex';
          if (stepper) stepper.style.display = 'none';
          if (valEl) valEl.textContent = '0';
        }
      });
    }

    // همگام‌سازی کلی واسط کاربری (نوار شناور، فاکتور و کارت‌ها)
    syncUI() {
      const totalCount = this.getTotalCount();
      const totalPrice = this.getTotalPrice();

      // نوار شناور سبد در پایین
      if (this.floatingBar) {
        if (totalCount > 0) {
          this.floatingBar.style.display = 'flex';
          setTimeout(() => this.floatingBar.classList.add('is-visible'), 10);
        } else {
          this.floatingBar.classList.remove('is-visible');
          setTimeout(() => {
            if (this.getTotalCount() === 0) this.floatingBar.style.display = 'none';
          }, 250);
        }
      }

      if (this.cartCountEl) {
        this.cartCountEl.textContent = totalCount;
      }
      if (this.cartBarTotalEl) {
        this.cartBarTotalEl.textContent = `${this.formatPrice(totalPrice)} تومان`;
      }
      if (this.invoiceGrandTotalEl) {
        this.invoiceGrandTotalEl.textContent = `${this.formatPrice(totalPrice)} تومان`;
      }

      this.syncCardSteppers();
      this.renderCartModalItems();
    }

    // باز کردن مودال فاکتور
    openCartModal() {
      if (!this.cartModal) return;
      this.renderCartModalItems();
      this.cartModal.style.display = 'flex';
      setTimeout(() => this.cartModal.classList.add('is-open'), 10);
      document.body.style.overflow = 'hidden';
    }

    // بستن مودال فاکتور
    closeCartModal() {
      if (!this.cartModal) return;
      this.cartModal.classList.remove('is-open');
      setTimeout(() => {
        this.cartModal.style.display = 'none';
        document.body.style.overflow = '';
      }, 250);
    }

    // رندر سطرهای فاکتور در مودال
    renderCartModalItems() {
      if (!this.cartItemsList) return;
      const self = this;

      if (this.items.length === 0) {
        this.cartItemsList.innerHTML = `
          <div class="cart-empty-state">
            <svg viewBox="0 0 24 24" width="46" height="46" stroke="rgba(212, 165, 116, 0.4)" stroke-width="1.6" fill="none"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            <p style="margin-top: 10px; color: rgba(255, 255, 255, 0.7); font-weight: 500;">سبد خرید شما خالی است</p>
            <p style="font-size: 0.85rem; color: rgba(255, 255, 255, 0.4);">آیتم‌های دلخواهتان را با زدن دکمه «افزودن» به فاکتور اضافه کنید.</p>
          </div>
        `;
        if (this.submitOrderBtn) this.submitOrderBtn.disabled = true;
        return;
      }

      if (this.submitOrderBtn) this.submitOrderBtn.disabled = false;

      let html = '';
      this.items.forEach((item) => {
        const itemSubtotal = item.price * item.quantity;
        html += `
          <div class="cart-item-row" data-id="${item.id}">
            <div class="cart-item-info">
              ${item.image ? `<img src="${item.image}" alt="${item.name}" class="cart-item-thumb">` : `<div class="cart-item-thumb-placeholder">☕</div>`}
              <div class="cart-item-text">
                <h4 class="cart-item-title">${item.name}</h4>
                <span class="cart-item-unit-price">${self.formatPrice(item.price)} تومان</span>
              </div>
            </div>
            <div class="cart-item-ctrls">
              <div class="modal-stepper">
                <button type="button" class="m-stepper-btn m-minus" data-id="${item.id}">−</button>
                <span class="m-stepper-val">${item.quantity}</span>
                <button type="button" class="m-stepper-btn m-plus" data-id="${item.id}">+</button>
              </div>
              <span class="cart-item-subtotal">${self.formatPrice(itemSubtotal)} T</span>
              <button type="button" class="cart-item-del-btn" data-id="${item.id}" title="حذف قلم">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
        `;
      });

      this.cartItemsList.innerHTML = html;

      // اتصال رویدادهای دکمه‌های فاکتور
      this.cartItemsList.querySelectorAll('.m-plus').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const id = parseInt(e.target.dataset.id);
          self.updateQuantity(id, 1);
        });
      });
      this.cartItemsList.querySelectorAll('.m-minus').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const id = parseInt(e.target.dataset.id);
          self.updateQuantity(id, -1);
        });
      });
      this.cartItemsList.querySelectorAll('.cart-item-del-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const btnEl = e.target.closest('.cart-item-del-btn');
          const id = parseInt(btnEl.dataset.id);
          self.removeItem(id);
        });
      });
    }

    // ارسال نهایی سفارش به سرور
    async submitOrder() {
      if (this.items.length === 0) {
        alert('سبد خرید شما خالی است.');
        return;
      }

      const tableNumber = this.tableInput ? this.tableInput.value.trim() : '';
      if (!tableNumber) {
        alert('لطفاً شماره یا نام میز را انتخاب یا وارد نمایید.');
        if (this.tableInput) this.tableInput.focus();
        return;
      }

      const notes = this.notesInput ? this.notesInput.value.trim() : '';
      const payload = {
        table_number: tableNumber,
        notes: notes,
        items: this.items.map((it) => ({
          id: it.id,
          quantity: it.quantity,
          notes: '',
        })),
      };

      // حالت لودینگ دکمه
      const btn = this.submitOrderBtn;
      const btnText = btn.querySelector('.btn-submit-text');
      const loader = btn.querySelector('.spinner-loader');
      btn.disabled = true;
      if (btnText) btnText.style.display = 'none';
      if (loader) loader.style.display = 'inline-block';

      try {
        const response = await fetch('/api/order/submit/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          const order = data.order;
          this.saveOrderId(order.id);
          this.clearCart();
          this.closeCartModal();
          this.showOrderSuccess(order);
        } else {
          alert(data.error || 'خطایی در ثبت سفارش رخ داد.');
        }
      } catch (err) {
        alert('خطا در برقراری ارتباط با سرور. لطفاً اتصال اینترنت را بررسی کنید.');
      } finally {
        btn.disabled = false;
        if (btnText) btnText.style.display = 'inline';
        if (loader) loader.style.display = 'none';
      }
    }

    // نمایش پاپ‌آپ موفقیت ثبت سفارش
    showOrderSuccess(order) {
      const self = this;
      let itemsListHtml = '';
      if (order.items && order.items.length) {
        itemsListHtml = order.items.map((it) => `<li>${it.quantity}× ${it.name} (${self.formatPrice(it.subtotal)} T)</li>`).join('');
      }

      const overlay = document.createElement('div');
      overlay.className = 'order-success-modal-backdrop';
      overlay.innerHTML = `
        <div class="order-success-card">
          <div class="success-icon-badge">✓</div>
          <h3 class="success-title">سفارش شما با موفقیت ثبت شد 🎉</h3>
          <p class="success-subtitle">سفارش بلافاصله برای بار و آشپزخانه کافه گاردو ارسال گردید.</p>
          
          <div class="success-order-box">
            <div class="success-row">
              <span class="s-label">شماره سفارش:</span>
              <span class="s-val" style="color: #d4a574; font-weight: 800;">#${order.id}</span>
            </div>
            <div class="success-row">
              <span class="s-label">شماره میز:</span>
              <span class="s-val">${order.table_number}</span>
            </div>
            <div class="success-row">
              <span class="s-label">زمان ثبت:</span>
              <span class="s-val">${order.created_time}</span>
            </div>
            <div class="success-row">
              <span class="s-label">وضعیت:</span>
              <span class="s-badge-pending">⏳ ${order.status_display}</span>
            </div>
            <div class="success-divider"></div>
            <ul class="success-items-list">
              ${itemsListHtml}
            </ul>
            <div class="success-divider"></div>
            <div class="success-row success-total-row">
              <span class="s-label">جمع کل فاکتور:</span>
              <span class="s-val-total">${order.total_price_formatted} تومان</span>
            </div>
          </div>

          <div class="success-actions">
            <button type="button" class="btn-success-close" id="btnSuccessClose">بستن و ادامه</button>
            <button type="button" class="btn-success-track" id="btnSuccessTrack">مشاهده پیگیری سفارش‌ها</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
      setTimeout(() => overlay.classList.add('is-open'), 10);

      document.getElementById('btnSuccessClose').addEventListener('click', () => {
        overlay.classList.remove('is-open');
        setTimeout(() => overlay.remove(), 250);
      });

      document.getElementById('btnSuccessTrack').addEventListener('click', () => {
        overlay.classList.remove('is-open');
        setTimeout(() => {
          overlay.remove();
          self.openMyOrdersModal();
        }, 250);
      });
    }

    // به‌روزرسانی نشانگر سفارش‌های من
    updateMyOrdersBadge() {
      const count = this.submittedOrderIds.length;
      if (this.myOrdersCountBadge) {
        if (count > 0) {
          this.myOrdersCountBadge.textContent = count;
          this.myOrdersCountBadge.style.display = 'inline-flex';
        } else {
          this.myOrdersCountBadge.style.display = 'none';
        }
      }
    }

    // باز کردن مودال رهگیری سفارش‌های من
    openMyOrdersModal() {
      if (!this.myOrdersModal) return;
      this.myOrdersModal.style.display = 'flex';
      setTimeout(() => this.myOrdersModal.classList.add('is-open'), 10);
      document.body.style.overflow = 'hidden';
      this.fetchAndRenderMyOrders();
    }

    // بستن مودال سفارش‌های من
    closeMyOrdersModal() {
      if (!this.myOrdersModal) return;
      this.myOrdersModal.classList.remove('is-open');
      setTimeout(() => {
        this.myOrdersModal.style.display = 'none';
        document.body.style.overflow = '';
      }, 250);
    }

    // دریافت و نمایش وضعیت لحظه‌ای سفارش‌های ثبت‌شده
    async fetchAndRenderMyOrders() {
      if (!this.myOrdersContainer) return;
      const self = this;

      if (this.submittedOrderIds.length === 0) {
        this.myOrdersContainer.innerHTML = `
          <div class="cart-empty-state">
            <svg viewBox="0 0 24 24" width="46" height="46" stroke="rgba(212, 165, 116, 0.4)" stroke-width="1.6" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <p style="margin-top: 10px; color: rgba(255, 255, 255, 0.7); font-weight: 500;">هنوز سفارشی از این دستگاه ثبت نشده است</p>
            <p style="font-size: 0.85rem; color: rgba(255, 255, 255, 0.4);">پس از تایید سبد خرید، وضعیت فاکتور و آماده‌سازی میز در این بخش نمایش داده می‌شود.</p>
          </div>
        `;
        return;
      }

      this.myOrdersContainer.innerHTML = `
        <div style="text-align: center; padding: 30px; color: #d4a574;">
          <div class="spinner-loader" style="display: inline-block; width: 24px; height: 24px; border-width: 3px;"></div>
          <p style="margin-top: 10px; font-size: 0.9rem;">در حال دریافت آخرین وضعیت سفارش‌ها...</p>
        </div>
      `;

      try {
        const idsParam = this.submittedOrderIds.join(',');
        const response = await fetch(`/api/orders/my/?ids=${idsParam}`);
        const data = await response.json();

        if (response.ok && data.orders && data.orders.length > 0) {
          let html = '';
          data.orders.forEach((ord) => {
            let statusBadgeClass = 'status-pending';
            let statusIcon = '⏳';
            if (ord.status === 'preparing') {
              statusBadgeClass = 'status-preparing';
              statusIcon = '☕';
            } else if (ord.status === 'ready') {
              statusBadgeClass = 'status-ready';
              statusIcon = '✅';
            } else if (ord.status === 'delivered') {
              statusBadgeClass = 'status-delivered';
              statusIcon = '🍽️';
            } else if (ord.status === 'cancelled') {
              statusBadgeClass = 'status-cancelled';
              statusIcon = '❌';
            }

            const itemsRows = ord.items.map((it) => `
              <div class="my-order-item-row">
                <span class="m-it-qty">${it.quantity}×</span>
                <span class="m-it-name">${it.name}</span>
                <span class="m-it-price">${self.formatPrice(it.subtotal)} T</span>
              </div>
            `).join('');

            html += `
              <div class="my-order-card">
                <div class="my-order-card-header">
                  <div class="m-ord-meta">
                    <span class="m-ord-id">سفارش #${ord.id}</span>
                    <span class="m-ord-table">${ord.table_number}</span>
                    <span class="m-ord-time">${ord.created_time}</span>
                  </div>
                  <div class="m-ord-status-pill ${statusBadgeClass}">
                    <span>${statusIcon} ${ord.status_display}</span>
                  </div>
                </div>

                <div class="my-order-items-box">
                  ${itemsRows}
                </div>

                ${ord.notes ? `<div class="my-order-notes"><span style="color: #d4a574;">یادداشت:</span> ${ord.notes}</div>` : ''}

                <div class="my-order-card-footer">
                  <span class="footer-label">جمع کل فاکتور:</span>
                  <span class="footer-total-price">${ord.total_price_formatted} تومان</span>
                </div>
              </div>
            `;
          });
          self.myOrdersContainer.innerHTML = html;
        } else {
          self.myOrdersContainer.innerHTML = `
            <div class="cart-empty-state">
              <p style="color: rgba(255, 255, 255, 0.7);">سفارشی یافت نشد یا ممکن است تسویه شده باشد.</p>
            </div>
          `;
        }
      } catch (err) {
        self.myOrdersContainer.innerHTML = `
          <div style="text-align: center; padding: 25px; color: #ef4444;">
            خطا در دریافت وضعیت سفارش‌ها. لطفاً دوباره تلاش کنید.
          </div>
        `;
      }
    }

    // بررسی خودکار نسخه جدید جهت اعلام به کاربران قبلی
    initVersionChecker() {
      const checkVersion = async () => {
        try {
          const res = await fetch('/api/version/', { cache: 'no-store' });
          if (res.ok) {
            const data = await res.json();
            if (data.version && data.version !== CURRENT_APP_VERSION) {
              this.showUpdateBanner(data.version);
            }
          }
        } catch (e) {}
      };

      // بررسی در ابتدای لود و تکرار هر ۵ دقیقه یکبار
      setTimeout(checkVersion, 6000);
      setInterval(checkVersion, 300000);
    }

    // نمایش نوار اعلان به‌روزرسانی منو
    showUpdateBanner(newVersion) {
      if (document.getElementById('gardooUpdateBanner')) return;

      const banner = document.createElement('div');
      banner.id = 'gardooUpdateBanner';
      banner.className = 'gardoo-update-banner';
      banner.innerHTML = `
        <div class="update-banner-content">
          <span class="update-star">✨</span>
          <span>نسخه جدید منوی کافه گاردو بارگذاری شد.</span>
          <button type="button" class="btn-update-reload" onclick="window.location.reload(true);">به‌روزرسانی</button>
        </div>
      `;
      document.body.appendChild(banner);
      setTimeout(() => banner.classList.add('is-visible'), 50);
    }
  }

  // راه‌اندازی پس از بارگذاری DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.cartManager = new GardooCart();
    });
  } else {
    window.cartManager = new GardooCart();
  }
})();
