/**
 * اسکریپت تقویم شمسی بومی و کامپکت ویژه پنل ادمین کافه گاردو
 * دکمه‌های سریع داخل پاپ‌آپ تقویم قرار دارند تا ابعاد جداول و اینپوت‌ها کاملاً فشرده و مرتب باقی بماند.
 */
(function() {
  'use strict';

  var JALALI_MONTH_NAMES = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ];

  var WEEKDAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

  var PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

  function toPersianDigits(n) {
    return String(n).replace(/\d/g, function(d) {
      return PERSIAN_DIGITS[parseInt(d, 10)];
    });
  }

  function normalizeDigits(s) {
    if (!s) return '';
    return String(s)
      .replace(/[۰-۹]/g, function(w) { return String.fromCharCode(w.charCodeAt(0) - 1728); })
      .replace(/[٠-٩]/g, function(w) { return String.fromCharCode(w.charCodeAt(0) - 1584); });
  }

  function gregorianToJalali(gy, gm, gd) {
    var g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    var jy = (gy > 1600) ? 979 : 0;
    gy -= (gy > 1600) ? 1600 : 621;
    var gy2 = (gm > 2) ? (gy + 1) : gy;
    var days = (365 * gy) + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400) - 80 + gd + g_d_m[gm - 1];
    jy += 33 * Math.floor(days / 12053);
    days %= 12053;
    jy += 4 * Math.floor(days / 1461);
    days %= 1461;
    if (days > 365) {
      jy += Math.floor((days - 1) / 365);
      days = (days - 1) % 365;
    }
    var jm = (days < 186) ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
    var jd = (days < 186) ? 1 + (days % 31) : 1 + ((days - 186) % 30);
    return [jy, jm, jd];
  }

  function jalaliToGregorian(jy, jm, jd) {
    var gy = (jy > 979) ? 1600 : 621;
    jy -= (jy > 979) ? 979 : 0;
    var days = (365 * jy) + (Math.floor(jy / 33) * 8) + Math.floor(((jy % 33) + 3) / 4) + 78 + jd + ((jm < 7) ? (jm - 1) * 31 : ((jm - 7) * 30) + 186);
    gy += 400 * Math.floor(days / 146097);
    days %= 146097;
    if (days > 36524) {
      days--;
      gy += 100 * Math.floor(days / 36524);
      days %= 36524;
      if (days >= 365) days++;
    }
    gy += 4 * Math.floor(days / 1461);
    days %= 1461;
    if (days > 365) {
      gy += Math.floor((days - 1) / 365);
      days = (days - 1) % 365;
    }
    var gd = days + 1;
    var sal_a = [0, 31, (((gy % 4 === 0 && gy % 100 !== 0) || (gy % 400 === 0)) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    var gm = 0;
    while (gm < 13 && gd > sal_a[gm]) {
      gd -= sal_a[gm];
      gm++;
    }
    return [gy, gm, gd];
  }

  function formatJalali(jy, jm, jd) {
    var mm = (jm < 10 ? '0' : '') + jm;
    var dd = (jd < 10 ? '0' : '') + jd;
    return jy + '/' + mm + '/' + dd;
  }

  function getTodayJalali() {
    var now = new Date();
    return gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
  }

  function addDaysToJalali(jy, jm, jd, daysToAdd) {
    var g = jalaliToGregorian(jy, jm, jd);
    var d = new Date(g[0], g[1] - 1, g[2]);
    d.setDate(d.getDate() + daysToAdd);
    return gregorianToJalali(d.getFullYear(), d.getMonth() + 1, d.getDate());
  }

  function getJalaliMonthDays(jy, jm) {
    if (jm <= 6) return 31;
    if (jm <= 11) return 30;
    var g = jalaliToGregorian(jy, 12, 30);
    var j = gregorianToJalali(g[0], g[1], g[2]);
    return (j[1] === 12 && j[2] === 30) ? 30 : 29;
  }

  function getJalaliFirstDayOfWeek(jy, jm) {
    var g = jalaliToGregorian(jy, jm, 1);
    var d = new Date(g[0], g[1] - 1, g[2]);
    var dayOfWeek = d.getDay();
    return (dayOfWeek + 1) % 7;
  }

  function parseInputValue(val) {
    if (!val) return null;
    var cleaned = normalizeDigits(val).replace(/-/g, '/').trim();
    var parts = cleaned.split('/');
    if (parts.length === 3) {
      var y = parseInt(parts[0], 10);
      var m = parseInt(parts[1], 10);
      var d = parseInt(parts[2], 10);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d) && y >= 1300 && y <= 1500 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
        return [y, m, d];
      }
    }
    return null;
  }

  function initPersianDatePicker(input) {
    if (input.dataset.jalaliInit === 'true') return;
    input.dataset.jalaliInit = 'true';
    input.classList.add('persian-date-input');

    var wrap = document.createElement('div');
    wrap.className = 'persian-date-wrap';
    input.parentNode.insertBefore(wrap, input);

    var row = document.createElement('div');
    row.className = 'persian-date-input-row';
    wrap.appendChild(row);
    row.appendChild(input);

    var toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'persian-cal-toggle-btn';
    toggleBtn.title = 'انتخاب از تقویم شمسی';
    toggleBtn.innerHTML = '📅';
    row.appendChild(toggleBtn);

    // پاپ‌آپ تقویم متصل مستقیم به Body (برای شناوری روی همه‌چیز بدون برش)
    var popup = document.createElement('div');
    popup.className = 'persian-cal-popup';
    document.body.appendChild(popup);

    var currentViewYear, currentViewMonth;
    var today = getTodayJalali();

    function positionPopup() {
      var rect = toggleBtn.getBoundingClientRect();
      var popupHeight = 310;
      var popupWidth = 250;
      var spaceBelow = window.innerHeight - rect.bottom;

      if (spaceBelow >= popupHeight || rect.top < popupHeight) {
        popup.style.top = (rect.bottom + 4) + 'px';
      } else {
        popup.style.top = Math.max(8, rect.top - popupHeight - 4) + 'px';
      }

      var rightPos = window.innerWidth - rect.right;
      if (rightPos < 8) rightPos = 8;
      if (rightPos + popupWidth > window.innerWidth) {
        rightPos = Math.max(8, window.innerWidth - popupWidth - 8);
      }
      popup.style.right = rightPos + 'px';
      popup.style.left = 'auto';
    }

    function renderCalendar() {
      popup.innerHTML = '';

      var header = document.createElement('div');
      header.className = 'persian-cal-header';

      var prevBtn = document.createElement('button');
      prevBtn.type = 'button';
      prevBtn.className = 'persian-cal-nav-btn';
      prevBtn.innerHTML = '‹';
      prevBtn.title = 'ماه قبل';
      prevBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        currentViewMonth--;
        if (currentViewMonth < 1) {
          currentViewMonth = 12;
          currentViewYear--;
        }
        renderCalendar();
      });

      var title = document.createElement('span');
      title.className = 'persian-cal-title';
      title.textContent = JALALI_MONTH_NAMES[currentViewMonth - 1] + ' ' + toPersianDigits(currentViewYear);

      var nextBtn = document.createElement('button');
      nextBtn.type = 'button';
      nextBtn.className = 'persian-cal-nav-btn';
      nextBtn.innerHTML = '›';
      nextBtn.title = 'ماه بعد';
      nextBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        currentViewMonth++;
        if (currentViewMonth > 12) {
          currentViewMonth = 1;
          currentViewYear++;
        }
        renderCalendar();
      });

      header.appendChild(prevBtn);
      header.appendChild(title);
      header.appendChild(nextBtn);
      popup.appendChild(header);

      var weekdaysRow = document.createElement('div');
      weekdaysRow.className = 'persian-cal-weekdays';
      WEEKDAYS.forEach(function(w) {
        var el = document.createElement('div');
        el.textContent = w;
        weekdaysRow.appendChild(el);
      });
      popup.appendChild(weekdaysRow);

      var daysGrid = document.createElement('div');
      daysGrid.className = 'persian-cal-days-grid';

      var firstDay = getJalaliFirstDayOfWeek(currentViewYear, currentViewMonth);
      var totalDays = getJalaliMonthDays(currentViewYear, currentViewMonth);
      var selectedVal = parseInputValue(input.value);

      for (var empty = 0; empty < firstDay; empty++) {
        var emptyCell = document.createElement('div');
        emptyCell.className = 'persian-cal-day is-empty';
        daysGrid.appendChild(emptyCell);
      }

      for (var d = 1; d <= totalDays; d++) {
        var dayCell = document.createElement('div');
        dayCell.className = 'persian-cal-day';
        dayCell.textContent = toPersianDigits(d);

        if (currentViewYear === today[0] && currentViewMonth === today[1] && d === today[2]) {
          dayCell.classList.add('is-today');
        }

        if (selectedVal && selectedVal[0] === currentViewYear && selectedVal[1] === currentViewMonth && selectedVal[2] === d) {
          dayCell.classList.add('is-selected');
        }

        (function(dayNum) {
          dayCell.addEventListener('click', function(e) {
            e.stopPropagation();
            input.value = formatJalali(currentViewYear, currentViewMonth, dayNum);
            var evt = new Event('change', { bubbles: true });
            input.dispatchEvent(evt);
            closePopup();
          });
        })(d);

        daysGrid.appendChild(dayCell);
      }

      popup.appendChild(daysGrid);

      // دکمه‌های سریع در فوتر پاپ‌آپ تقویم
      var quickFooter = document.createElement('div');
      quickFooter.className = 'persian-cal-quick-footer';

      function createQuickBtn(label, days) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'persian-quick-btn' + (days === null ? ' btn-clear' : '');
        btn.textContent = label;
        btn.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          if (days === null) {
            input.value = '';
          } else {
            var target = days === 0 ? today : addDaysToJalali(today[0], today[1], today[2], days);
            input.value = formatJalali(target[0], target[1], target[2]);
          }
          var evt = new Event('change', { bubbles: true });
          input.dispatchEvent(evt);
          closePopup();
        });
        return btn;
      }

      quickFooter.appendChild(createQuickBtn('امروز', 0));
      quickFooter.appendChild(createQuickBtn('+۷ روز', 7));
      quickFooter.appendChild(createQuickBtn('+۱۴ روز', 14));
      quickFooter.appendChild(createQuickBtn('+۳۰ روز', 30));
      quickFooter.appendChild(createQuickBtn('پاک کردن', null));
      popup.appendChild(quickFooter);
    }

    function openPopup() {
      document.querySelectorAll('.persian-cal-popup.is-open').forEach(function(p) {
        if (p !== popup) p.classList.remove('is-open');
      });

      var val = parseInputValue(input.value);
      if (val) {
        currentViewYear = val[0];
        currentViewMonth = val[1];
      } else {
        currentViewYear = today[0];
        currentViewMonth = today[1];
      }
      renderCalendar();
      positionPopup();
      popup.classList.add('is-open');
    }

    function closePopup() {
      popup.classList.remove('is-open');
    }

    toggleBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      if (popup.classList.contains('is-open')) {
        closePopup();
      } else {
        openPopup();
      }
    });

    // بستن با کلیک بیرون
    document.addEventListener('click', function(e) {
      if (!wrap.contains(e.target) && !popup.contains(e.target)) {
        closePopup();
      }
    });

    window.addEventListener('scroll', function() {
      if (popup.classList.contains('is-open')) {
        positionPopup();
      }
    }, true);

    window.addEventListener('resize', function() {
      if (popup.classList.contains('is-open')) {
        positionPopup();
      }
    });
  }

  function initCollapsibleSections() {
    var collapsibleDetails = document.querySelectorAll('fieldset.collapse details');
    collapsibleDetails.forEach(function(det) {
      // اگر درون این بخش خطایی ثبت شده باشد، به طور خودکار باز می‌شود
      if (det.querySelector('.errors, .errorlist, .errornote, .field-box.errors')) {
        det.open = true;
      }
    });
  }

  function initAll() {
    var inputs = document.querySelectorAll(
      'input[name="discount_start_date"], input[name="discount_end_date"], ' +
      'input[name$="-discount_start_date"], input[name$="-discount_end_date"], ' +
      '.persian-date-input'
    );
    inputs.forEach(initPersianDatePicker);
    initCollapsibleSections();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  document.addEventListener('formset:added', function() {
    setTimeout(initAll, 100);
  });
})();
