/**
 * Cafe Gardoo - Shopping Cart & Order Invoice System
 * سیستم سبد خرید لوکس و صدور فاکتور کافه گاردو
 */

(function () {
  'use strict';

  const CART_STORAGE_KEY = 'gardoo_cart_items_v1';

  class GardooCart {
    constructor() {
      this.items = this.loadCart();
      this.initDOMElements();
      this.bindEvents();
      this.syncUI();
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
    saveCart(changedId = null) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.items));
      } catch (e) {}
      this.syncUI(changedId);
    }

    initDOMElements() {
      // نوار شناور سبد خرید در پایین صفحه
      this.floatingBar = document.getElementById('floatingCartBar');
      this.cartCountEl = document.getElementById('cartTotalCount');
      this.cartBarTotalEl = document.getElementById('cartBarTotal');
      this.checkoutBarBtn = document.getElementById('checkoutBarBtn');
      this.openCartBtn = document.getElementById('openCartBtn');

      // مودال فاکتور سبد خرید
      this.cartModal = document.getElementById('cartInvoiceModal');
      this.closeCartModalBtn = document.getElementById('closeCartModalBtn');
      this.cartItemsList = document.getElementById('cartItemsList');
      this.invoiceGrandTotalEl = document.getElementById('invoiceGrandTotal');
    }

    bindEvents() {
      const self = this;

      // هندل کردن دکمه‌های درون کارت‌ها (افزودن و استپر + / -)
      document.addEventListener('click', (e) => {
        const addBtn = e.target.closest('.btn-card-add') || (e.target.classList.contains('card-cart-btn-wrap') && !e.target.classList.contains('has-qty') ? e.target : null);
        if (addBtn) {
          e.stopPropagation();
          const wrap = addBtn.closest('.card-cart-btn-wrap') || addBtn;
          if (wrap && !wrap.classList.contains('has-qty')) {
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
            
            const closeBtn = document.getElementById('modalCloseBtn');
            if (closeBtn) closeBtn.click();
          }
        });
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
      this.saveCart(id);
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
        this.saveCart(id);
        this.playHapticFeedback();
      }
    }

    // حذف یک قلم از فاکتور
    removeItem(id) {
      this.items = this.items.filter((item) => item.id !== id);
      this.saveCart(id);
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
    syncCardSteppers(changedId = null) {
      const self = this;
      const wraps = document.querySelectorAll('.card-cart-btn-wrap');
      wraps.forEach((wrap) => {
        const id = parseInt(wrap.dataset.itemId);
        const item = self.items.find((it) => it.id === id);
        const addBtn = wrap.querySelector('.btn-card-add');
        const stepper = wrap.querySelector('.card-qty-stepper');
        const valEl = wrap.querySelector('.stepper-val');

        // اطمینان از رفع هرگونه استایل اینلاین قدیمی
        if (addBtn && addBtn.style.display) addBtn.style.display = '';
        if (stepper && stepper.style.display) stepper.style.display = '';

        if (item && item.quantity > 0) {
          const wasActive = wrap.classList.contains('has-qty');
          wrap.classList.add('has-qty');
          if (valEl) {
            const oldVal = valEl.textContent;
            valEl.textContent = item.quantity;
            if (wasActive && oldVal !== String(item.quantity) && (changedId === null || changedId === id)) {
              valEl.classList.remove('bump');
              void valEl.offsetWidth; // شروع مجدد انیمیشن تپش
              valEl.classList.add('bump');
            }
          }
        } else {
          wrap.classList.remove('has-qty');
          if (valEl) valEl.textContent = '0';
        }
      });
    }

    // همگام‌سازی کلی واسط کاربری (نوار شناور، فاکتور و کارت‌ها)
    syncUI(changedId = null) {
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

      this.syncCardSteppers(changedId);
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
        return;
      }

      let html = '';
      this.items.forEach((item) => {
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