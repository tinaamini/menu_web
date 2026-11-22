// ============================================
// کافه گاردو - Coffee Scroll & Bean Physics Animation
// ============================================

// ضریب افزایش مسافت اسکرول و تنظیم سرعت نرم در دستگاه‌های مختلف (موبایل، تبلت و دسکتاپ)
function getGlobalScrollFactor() {
  if (window.innerWidth <= 480) return 1.8; // موبایل‌های با عرض کم: مسافت اسکرول متوازن، روان و بدون خستگی دست
  if (window.innerWidth <= 768) return 1.5; // تبلت‌ها و موبایل‌های بزرگ
  return 1.0; // دسکتاپ
}

document.addEventListener('DOMContentLoaded', function () {

  // ============ COFFEE HERO SCROLL & BEANS ============
  initCoffeeHero();

  // ============ SLIDE NAVIGATION DOCK (< > +) ============
  initSlideNavDock();

  // ============ CARD ANIMATIONS ============
  initCardAnimations();

  // ============ SMOOTH SCROLL ============
  initSmoothScroll();

  // ============ CATEGORY DETAIL PAGE & MODAL ============
  initCategoryDetailPage();
});


// ----- انیمیشن اصلی Hero (سقوط آزاد و سرازیر شدن دانه‌های واقعی قهوه روی کل صفحه با اسکرول) -----
function initCoffeeHero() {
  const section    = document.getElementById('coffee-hero');
  const canvas     = document.getElementById('heroBeansCanvas');
  const heroCanvas = document.getElementById('heroCanvas');
  const scrollLogo = document.getElementById('heroScrollLogo');
  const heroScrollIndicator = document.getElementById('heroScrollIndicator');
  const hotBanner  = document.getElementById('hotCoffeeBanner');
  const hotCup     = document.getElementById('hotCupBanner');
  const coldWrap   = document.getElementById('coldCoffeeWrap');
  const iceCubes   = Array.from(document.querySelectorAll('.ice-cube'));
  const iceText    = document.getElementById('iceTextWrap');
  const teaCup     = document.getElementById('teaCupWrap');
  const teaArch    = document.getElementById('teaArchBackdrop');
  const teaArchInner = document.getElementById('teaArchInner');
  const teaArchDarkOverlay = document.getElementById('teaArchDarkOverlay');
  const herbElements = [
    { el: document.getElementById('herbLemon'),      startX: -160, startY: -160, startRot: -65, endRot: -15, exitX: -65, exitY: -65, exitRot: -45, scale: 1.05, phase: 0.0, ampY: 6.0, ampX: 0.0, ampRot: 0.0, speed: 0.0028 },
    { el: document.getElementById('herbLeaf1'),      startX:   80, startY: -170, startRot: -50, endRot:  15, exitX:  45, exitY: -65, exitRot:  35, scale: 1.00, phase: 0.9, ampY: 5.5, ampX: 0.0, ampRot: 0.0, speed: 0.0026 },
    { el: document.getElementById('herbLeaf2'),      startX:  -80, startY:  170, startRot:  60, endRot: -18, exitX: -45, exitY:  65, exitRot: -35, scale: 0.95, phase: 3.6, ampY: 5.8, ampX: 0.0, ampRot: 0.0, speed: 0.0030 },
    { el: document.getElementById('herbAnise'),      startX: -110, startY: -150, startRot:  55, endRot:  18, exitX: -45, exitY: -65, exitRot:  40, scale: 1.00, phase: 5.1, ampY: 5.0, ampX: 0.0, ampRot: 0.0, speed: 0.0024 },
    { el: document.getElementById('herbAniseLarge'), startX:  180, startY:   90, startRot:  75, endRot:  22, exitX:  70, exitY:  25, exitRot:  50, scale: 1.15, phase: 2.2, ampY: 6.8, ampX: 0.0, ampRot: 0.0, speed: 0.0022 },
  ];

  // عناصر صحنه ادیتوریال موهیتو (سایه برگ‌های نخل، قاب استیج موهیتو و تایپوگرافی موکتل)
  const mojitoLeafShadow  = document.getElementById('mojitoLeafShadow');
  const mocktailWrap      = document.getElementById('mocktailWrap');
  const mocktailBgText    = document.getElementById('mocktailBgText');

  // عناصر استیج انفجاری سری قلیان لوکس و دود غلیظ (فصل ۵)
  const shishaStage         = document.getElementById('shishaStage');
  const shishaSmokeBg       = document.getElementById('shishaSmokeBg');
  const shishaSmokeBackdrop = document.getElementById('shishaSmokeBackdrop');
  const shishaPartCoals     = document.getElementById('shishaPartCoals');
  const shishaPartHmd       = document.getElementById('shishaPartHmd');
  const shishaPartTobacco   = document.getElementById('shishaPartTobacco');
  const shishaPartBowl      = document.getElementById('shishaPartBowl');
  const shishaNeonSign      = document.getElementById('shishaNeonSign');

  if (!section || !canvas) return;

  // توقف قطعی اسکرول در انتهای فصل ۵ (استقرار کامل قلیان لوکس و تابلوی نئونی)
  const MAX_PAGE_SCROLL = 1540;

  // ضریب افزایش مسافت اسکرول و آرام‌تر کردن سرعت تعامل فقط در گوشی (موبایل)
  function getScrollFactor() {
    return getGlobalScrollFactor();
  }

  function adjustPageEnd() {
    const pageContent = document.getElementById('pageContent');
    const hero = document.getElementById('coffee-hero');
    const totalMaxScroll = MAX_PAGE_SCROLL * getScrollFactor();
    if (hero) {
      hero.style.height = '100vh';
      hero.style.height = '100dvh';
    }
    if (pageContent) {
      pageContent.style.minHeight = '0px';
      pageContent.style.height = `${totalMaxScroll}px`;
      pageContent.style.padding = '0';
      pageContent.style.margin = '0';
    }
  }
  adjustPageEnd();
  window.addEventListener('resize', adjustPageEnd);

  // کلیک روی فلش‌های راهنما جهت اسکرول نرم به بخش بعدی (آرام‌تر در گوشی)
  if (heroScrollIndicator) {
    heroScrollIndicator.addEventListener('click', () => {
      const isMobile = window.innerWidth <= 768;
      const factor = getScrollFactor();
      const duration = isMobile ? 1200 : 650;
      if (typeof window.smoothScrollToSlide === 'function') {
        window.smoothScrollToSlide(320 * factor, duration);
      } else {
        window.scrollTo({ top: 320 * factor, behavior: 'smooth' });
      }
    });
  }

  // ذرات ملایم محیطی پس‌زمینه
  if (heroCanvas) initParticles(heroCanvas);

  const ctx = canvas.getContext('2d');
  const beanPrefix = canvas.dataset.beanPrefix || '/static/images/bean_';

  // بارگذاری ۶ اسپریت باکیفیت و شفاف دانه‌های قهوه (WebP)
  const beanImages = [];
  for (let i = 0; i < 6; i++) {
    const img = new Image();
    img.src = `${beanPrefix}${i}.webp`;
    beanImages.push(img);
  }

  // تعریف صورت‌فلکی غنی و پرحجم دانه‌های قهوه (۴۴ دانه واقعی) با ریزش ممتد، آبشاری و مداوم از بالا در طول اسکرول
  const NUM_BEANS = 44;
  const beansData = [];
  for (let i = 0; i < NUM_BEANS; i++) {
    const col = (i % 11) / 11.0; // توزیع در ۱۱ ستون در سراسر عرض صفحه
    const jitter = Math.sin(i * 3.7) * 0.035;
    const xRatio = Math.max(0.04, Math.min(0.96, 0.05 + col * 0.90 + jitter));
    const imgIdx = i % 6;

    // شروع سقوط تدریجی و پیوسته دانه‌ها با اسکرول (از p = 0.01 تا 0.68) - ورود ممتد دانه از بالا
    const startP = 0.01 + (i / (NUM_BEANS - 1)) * 0.68;
    // مدت زمان سقوط هر دانه تا استقرار کامل
    const durationP = 0.24 + ((i * 7) % 5) * 0.035;
    // توزیع عمودی دانه‌ها در سراسر صفحه از بالا تا انتهای پایین کادر (از ۲۲٪ تا ۹۴٪ ارتفاع صفحه)
    const targetYRatio = 0.22 + (((i * 17) % 23) / 22.0) * 0.72;

    // ابعاد استاندارد، پرحجم و طبیعی قهوه بر اساس اندازه مورد تایید
    const depth = 0.65 + ((i * 11) % 6) * 0.08;
    const scale = 0.24 + depth * 0.16; // بین ۰.۳۴ تا ۰.۴۶
    const alpha = Math.min(1, 0.75 + depth * 0.25);

    const drift = (Math.sin(i * 2.1) * 45);
    const startRot = (i * 1.4) % (Math.PI * 2);
    const rotSpeed = (i % 2 === 0 ? 1 : -1) * (2.2 + ((i * 13) % 4) * 0.8);
    const idlePhase = i * 0.9;

    beansData.push({
      imgIdx,
      xRatio,
      startP,
      durationP,
      targetYRatio,
      scale,
      alpha,
      drift,
      startRot,
      rotSpeed,
      idlePhase,
    });
  }

  let cachedCoverScale = 5.5;
  let cachedCanvasWidth = 1200;
  let cachedCanvasHeight = 800;
  let beansCleared = false;

  function updateWindowMetrics() {
    const winW = window.innerWidth || document.documentElement.clientWidth || 1200;
    const winH = window.innerHeight || document.documentElement.clientHeight || 800;
    cachedCoverScale = Math.max(winW / 320, winH / 440) * 1.55;
    cachedCanvasWidth = canvas.offsetWidth || winW;
    cachedCanvasHeight = canvas.offsetHeight || winH;
  }

  function resizeCanvas() {
    updateWindowMetrics();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width  = cachedCanvasWidth * dpr;
    canvas.height = cachedCanvasHeight * dpr;
    beansCleared = false;
  }

  const BEAN_FREEZE_SCROLL = 360; // ریزش ممتد و نرم دانه‌ها تا زمان ورود و استقرار کامل هات‌کافی
  const FREEZE_P = 1.0;          // استقرار کامل دانه‌ها در سراسر کادر تا انتهای پایین صفحه
  const HOT_START = 180;         // شروع ورود HOT COFFEE دقیقاً بلافاصله پس از محو شدن نشان سه بعدی لوگو در ۱۸۰
  const HOT_END   = 260;         // استقرار کامل هات‌کافی در مرکز تصویر در ۲۶۰
  const EXIT_START = 310;        // شروع خروج هات‌کافی و ورود سریع آیس‌کافی با یک اسکرول کوچک در ۳۱۰
  const EXIT_END   = 390;        // پوشش کامل صفحه با رنگ کرم در ۳۹۰
  const COLD_START = 330;        // شروع ظهور قهوه سرد در مرکز تصویر بلافاصله با اسکرول کوچک در ۳۳۰
  const COLD_END   = 410;        // استقرار کامل قهوه سرد در مرکز تصویر در ۴۱۰
  const ICE_START  = 370;        // شروع پرتاب تکه‌های یخ از پشت لیوان در اسکرول ۳۷۰
  const ICE_END    = 440;        // استقرار کامل تکه‌های یخ در اطراف لیوان در ۴۴۰
  const TEXT_START = 390;        // شروع ظهور متن یخی ICE COFFEE روی لیوان در اسکرول ۳۹۰
  const TEXT_END   = 460;        // استقرار کامل متن یخی در ۴۶۰
  const FINAL_EXIT_START = 540;  // شروع خروج روان آیس‌کافی پس از نمایش کامل در ۵۴۰
  const FINAL_EXIT_END   = 660;  // خروج کامل آیس‌کافی در ۶۶۰
  const TEA_START        = 620;  // شروع ورود باشکوه فنجان دمنوش و گیاهان معطر در ۶۲۰
  const TEA_SETTLE       = 740;  // استقرار کامل دمنوش در مرکز صفحه در ۷۴۰
  const TEA_EXIT_START   = 840;  // شروع خروج فنجان دمنوش و بزرگ‌شدن طاق سبز در ۸۴۰
  const TEA_EXIT_END     = 980;  // خروج کامل دمنوش و پوشش ۱۰۰٪ پس‌زمینه ماچایی در ۹۸۰
  const MOJITO_START     = 950;  // شروع ورود موهیتو و موکتل در ۹۵۰
  const MOJITO_SETTLE    = 1070; // استقرار کامل موهیتو در ۱۰۷۰
  const RED_TRANS_START  = 1170; // شروع خروج موهیتو و تغییر زمینه به سمت فضای دارک لوکس در ۱۱۷۰
  const RED_TRANS_END    = 1310; // استقرار نهایی پس‌زمینه در ۱۳۱۰
  const SHISHA_START     = 1270; // شروع ورود قطعات قلیان و دود غلیظ در ۱۲۷۰
  const SHISHA_ASSEMBLE  = 1480; // استقرار کامل قطعات انفجاری قلیان در ۱۴۸۰

  const iceCubesConfig = [
    { dx: -28, dy: -29, rot: -50, scale: 1.15, maxO: 0.95, phase: 0.0, speed: 0.0016, ampY: 8.5, ampX: 5.0, ampRot: 3.5 },  // بالا چپ ۱
    { dx: -34, dy: -10, rot: -75, scale: 0.95, maxO: 0.90, phase: 2.5, speed: 0.0019, ampY: 7.0, ampX: 4.5, ampRot: 3.0 },  // بالا چپ ۲
    { dx:  27, dy:  26, rot:  45, scale: 1.10, maxO: 0.92, phase: 4.8, speed: 0.0014, ampY: 8.5, ampX: 4.8, ampRot: 3.5 },  // پایین راست
  ];

  let targetProgress = 0;
  let currentProgress = 0;

  function onScroll() {
    const actualScrollY  = window.scrollY || window.pageYOffset || 0;
    const factor         = getGlobalScrollFactor();
    const virtualSy      = actualScrollY / factor;

    // دانه‌ها از ۰ تا ۲۸۳ پیکسل حرکت کرده و در ۲۸۳ روی ۰.۶۴۸ فریز کامل می‌مانند
    const normBeanScroll = Math.min(1, Math.max(0, virtualSy / BEAN_FREEZE_SCROLL));
    targetProgress       = normBeanScroll * FREEZE_P;
  }

  // حلقه رندر روان ۶۰ فریم بر ثانیه
  let startTime = performance.now();
  let animSy = 0;
  let hasInitAnimSy = false;

  function renderLoop() {
    const isMobile = window.innerWidth <= 768;
    const factor = getGlobalScrollFactor();
    const actualSy = window.scrollY || window.pageYOffset || 0;
    const targetSy = actualSy / factor;

    if (!hasInitAnimSy) {
      animSy = targetSy;
      hasInitAnimSy = true;
    }

    // سرعت اسکرول و انتقال انیمیشن‌ها در گوشی بسیار آرام‌تر و پیوسته‌تر (Lerp ملایم‌تر)
    const lerpSpeed = isMobile ? 0.088 : 0.18;
    animSy += (targetSy - animSy) * lerpSpeed;
    if (Math.abs(targetSy - animSy) < 0.03) {
      animSy = targetSy;
    }
    const sy = animSy;

    // فیزیک روان و پاسخگوی سقوط دانه‌های قهوه در گوشی بدون تاخیر
    const beanLerp = isMobile ? 0.12 : 0.14;
    currentProgress += (targetProgress - currentProgress) * beanLerp;
    const p = Math.min(FREEZE_P, currentProgress);

    // سرعت متوازن و زنده انیمیشن‌های متناوب و شناور در گوشی
    const timeScale = isMobile ? 0.85 : 1.0;
    const now = (performance.now() - startTime) * timeScale;

    // انیمیشن موج پیوسته کرم: ورود از چپ برای Hot Coffee (انحنا دار)، ادامه حرکت به راست برای رنگ‌آمیزی کامل صفحه، و میزبانی Ice Coffee (صاف و یکدست)
    let hotPct = 0;
    if (hotBanner || hotCup) {
      if (sy <= HOT_START) {
        // قبل از ۲۸۳: کاملاً خارج از کادر در سمت چپ
        if (hotBanner) {
          hotBanner.style.opacity = '0';
          hotBanner.style.transform = 'translateX(-165vw)';
        }
        if (hotCup) {
          hotCup.style.opacity = '0';
          hotCup.style.transform = 'translate(100%, -50%)';
        }
        hotPct = 0;
      } else if (sy > HOT_START && sy < HOT_END) {
        // فاز ورود روان موج کرم از چپ (۲۸۳ تا ۳۸۲) - انحنای موج وارد صفحه می‌شود
        const raw   = (sy - HOT_START) / (HOT_END - HOT_START);
        const eased = easeOutCubic(raw);
        hotPct      = (raw * 100).toFixed(0);

        if (hotBanner) {
          const transX = (-165 + eased * 65).toFixed(1);
          hotBanner.style.opacity = '1';
          hotBanner.style.transform = `translateX(${transX}vw)`;
        }
        if (hotCup) {
          const cupTransX = ((1 - eased) * 100).toFixed(1);
          hotCup.style.opacity = eased.toFixed(3);
          hotCup.style.transform = `translate(${cupTransX}%, -50%)`;
        }
      } else if (sy >= HOT_END && sy < EXIT_START) {
        // فاز استقرار کامل Hot Coffee (۳۸۲ تا ۴۱۴): انحنای موج در صفحه نشسته و فنجان در راست
        if (hotBanner) {
          hotBanner.style.opacity = '1';
          hotBanner.style.transform = 'translateX(-100vw)';
        }
        if (hotCup) {
          hotCup.style.opacity = '1';
          hotCup.style.transform = 'translate(0%, -50%)';
        }
        hotPct = 100;
      } else if (sy >= EXIT_START && sy < EXIT_END) {
        // فاز ادامه حرکت موج به سمت راست و رنگ‌آمیزی کامل صفحه با رنگ کرم (۴۱۴ تا ۵۱۳)
        // انحنای موج از لبه راست صفحه خارج می‌شود و بدنه صاف کرم کل صفحه را پر می‌کند
        const exitRaw   = (sy - EXIT_START) / (EXIT_END - EXIT_START);
        const exitEased = easeOutCubic(exitRaw);
        hotPct          = ((1 - exitRaw) * 100).toFixed(0);

        if (hotBanner) {
          const transX = (-100 + exitEased * 100).toFixed(1);
          hotBanner.style.opacity = '1';
          hotBanner.style.transform = `translateX(${transX}vw)`;
        }
        if (hotCup) {
          const cupTransX = (exitEased * 100).toFixed(1);
          hotCup.style.opacity = (1 - exitEased).toFixed(3);
          hotCup.style.transform = `translate(${cupTransX}%, -50%)`;
        }
      } else if (sy >= EXIT_END && sy < TEA_EXIT_START) {
        // از ۵۱۳ تا ۸۵۵: صفحه کاملاً کرمِ صاف و یکدست مانده و بستر قهوه سرد (Ice Coffee) و دمنوش (Herbal Tea) می‌شود
        if (hotBanner) {
          hotBanner.style.opacity = '1';
          hotBanner.style.transform = 'translateX(0vw)';
        }
        if (hotCup) {
          hotCup.style.opacity = '0';
          hotCup.style.transform = 'translate(100%, -50%)';
        }
        hotPct = 0;
      } else if (sy >= TEA_EXIT_START && sy < TEA_EXIT_END) {
        // در اسکرول خروج فنجان دمنوش، پس‌زمینه کرم به آرامی محو شده و تم برای موکتل آماده می‌شود
        const fRaw   = (sy - TEA_EXIT_START) / (TEA_EXIT_END - TEA_EXIT_START);
        const fEased = easeInOutCubic(fRaw);
        if (hotBanner) {
          hotBanner.style.opacity = Math.max(0, 1 - fEased).toFixed(3);
          hotBanner.style.transform = 'translateX(0vw)';
        }
        if (hotCup) {
          hotCup.style.opacity = '0';
          hotCup.style.transform = 'translate(100%, -50%)';
        }
        hotPct = 0;
      } else {
        // پس از ۹۲۸: کاملاً خارج از صفحه و مخفی
        if (hotBanner) {
          hotBanner.style.opacity = '0';
          hotBanner.style.transform = 'translateX(-165vw)';
        }
        if (hotCup) {
          hotCup.style.opacity = '0';
          hotCup.style.transform = 'translate(100%, -50%)';
        }
        hotPct = 0;
      }
    }

    // انیمیشن ظهور قهوه سرد (Cold Coffee) از مرکز تصویر در اسکرول ۴۴۲ و خروج در ۶۶۲
    let coldPct = 0;
    if (coldWrap) {
      if (sy < COLD_START) {
        coldWrap.style.opacity = '0';
        coldWrap.style.transform = 'translate(-50%, -50%) scale(0.8)';
        coldPct = 0;
      } else if (sy >= COLD_START && sy < COLD_END) {
        const cRaw   = (sy - COLD_START) / (COLD_END - COLD_START);
        const cEased = easeOutCubic(cRaw);
        coldPct      = (cRaw * 100).toFixed(0);

        const scale = (0.8 + cEased * 0.62).toFixed(3);
        coldWrap.style.opacity = cEased.toFixed(3);
        coldWrap.style.transform = `translate(-50%, -50%) scale(${scale})`;
      } else if (sy >= COLD_END && sy < FINAL_EXIT_START) {
        coldWrap.style.opacity = '1';
        coldWrap.style.transform = 'translate(-50%, -50%) scale(1.42)';
        coldPct = 100;
      } else if (sy >= FINAL_EXIT_START && sy < FINAL_EXIT_END) {
        // خروج هم‌زمان لیوان قهوه سرد از تصویر در اسکرول ۶۶۲
        const fRaw   = (sy - FINAL_EXIT_START) / (FINAL_EXIT_END - FINAL_EXIT_START);
        const fEased = easeOutCubic(fRaw);
        coldPct      = ((1 - fRaw) * 100).toFixed(0);

        const cupScale  = (1.42 - fEased * 0.42).toFixed(3);
        const cupTransY = (-50 + fEased * 30).toFixed(1);
        coldWrap.style.opacity = Math.max(0, 1 - fEased).toFixed(3);
        coldWrap.style.transform = `translate(-50%, ${cupTransY}%) scale(${cupScale})`;
      } else {
        // پس از ۷۶۰: کاملاً خارج از صفحه و مخفی
        coldWrap.style.opacity = '0';
        coldPct = 0;
      }
    }

    // انیمیشن پرتاب تکه‌های یخ از پشت لیوان در اسکرول ۴۹۷
    let icePct = 0;
    if (iceCubes.length > 0) {
      if (sy < ICE_START) {
        // کاملاً مخفی و جمع شده پشت لیوان
        iceCubes.forEach(cube => {
          cube.style.opacity = '0';
          cube.style.transform = 'translate(-50%, -50%) scale(0.2)';
        });
        icePct = 0;
      } else if (sy >= ICE_START && sy < ICE_END) {
        const iRaw   = (sy - ICE_START) / (ICE_END - ICE_START);
        const iEased = easeOutCubic(iRaw);
        icePct       = (iRaw * 100).toFixed(0);

        iceCubes.forEach((cube, idx) => {
          const cfg = iceCubesConfig[idx % iceCubesConfig.length];
          const floatY = Math.sin(now * (cfg.speed || 0.0016) + (cfg.phase || 0)) * (cfg.ampY || 8) * iEased;
          const floatX = Math.cos(now * (cfg.speed || 0.0016) * 0.8 + (cfg.phase || 0)) * (cfg.ampX || 5) * iEased;
          const floatRot = Math.sin(now * (cfg.speed || 0.0016) * 0.7 + (cfg.phase || 0)) * (cfg.ampRot || 3.5) * iEased;

          const curX = (cfg.dx * iEased).toFixed(1);
          const curY = (cfg.dy * iEased).toFixed(1);
          const curRot = (cfg.rot * iEased + floatRot).toFixed(1);
          const curScale = (0.2 + (cfg.scale - 0.2) * iEased).toFixed(2);
          const curOpacity = (cfg.maxO * Math.min(1, iRaw * 3)).toFixed(2);

          cube.style.opacity = curOpacity;
          cube.style.transform = `translate(calc(-50% + ${curX}vw + ${floatX.toFixed(1)}px), calc(-50% + ${curY}vh + ${floatY.toFixed(1)}px)) rotate(${curRot}deg) scale(${curScale})`;
        });
      } else if (sy >= ICE_END && sy < FINAL_EXIT_START) {
        // فاز استقرار و شناوری ارگانیک و زنده یخ‌ها در اطراف لیوان قهوه سرد (۶۳۰ تا ۶۶۲)
        iceCubes.forEach((cube, idx) => {
          const cfg = iceCubesConfig[idx % iceCubesConfig.length];
          const floatY = (Math.sin(now * (cfg.speed || 0.0016) + (cfg.phase || 0)) * (cfg.ampY || 8)).toFixed(1);
          const floatX = (Math.cos(now * (cfg.speed || 0.0016) * 0.8 + (cfg.phase || 0)) * (cfg.ampX || 5)).toFixed(1);
          const floatRot = (cfg.rot + Math.sin(now * (cfg.speed || 0.0016) * 0.7 + (cfg.phase || 0)) * (cfg.ampRot || 3.5)).toFixed(1);

          cube.style.opacity = cfg.maxO;
          cube.style.transform = `translate(calc(-50% + ${cfg.dx}vw + ${floatX}px), calc(-50% + ${cfg.dy}vh + ${floatY}px)) rotate(${floatRot}deg) scale(${cfg.scale})`;
        });
        icePct = 100;
      } else if (sy >= FINAL_EXIT_START && sy < FINAL_EXIT_END) {
        // فاز خروج تکه‌های یخ از تصویر در اسکرول ۶۶۲
        const fRaw   = (sy - FINAL_EXIT_START) / (FINAL_EXIT_END - FINAL_EXIT_START);
        const fEased = easeOutCubic(fRaw);
        icePct       = ((1 - fRaw) * 100).toFixed(0);

        iceCubes.forEach((cube, idx) => {
          const cfg = iceCubesConfig[idx % iceCubesConfig.length];
          const floatY = (Math.sin(now * (cfg.speed || 0.0016) + (cfg.phase || 0)) * (cfg.ampY || 8) * (1 - fEased)).toFixed(1);
          const floatX = (Math.cos(now * (cfg.speed || 0.0016) * 0.8 + (cfg.phase || 0)) * (cfg.ampX || 5) * (1 - fEased)).toFixed(1);

          const curX = (cfg.dx * (1 + fEased * 1.5)).toFixed(1);
          const curY = (cfg.dy * (1 + fEased * 1.5)).toFixed(1);
          const curRot = (cfg.rot + fEased * 85).toFixed(1);
          const curAlpha = (cfg.maxO * Math.max(0, 1 - fEased)).toFixed(2);
          const curScale = (cfg.scale * (1 - fEased * 0.35)).toFixed(2);

          cube.style.opacity = curAlpha;
          cube.style.transform = `translate(calc(-50% + ${curX}vw + ${floatX}px), calc(-50% + ${curY}vh + ${floatY}px)) rotate(${curRot}deg) scale(${curScale})`;
        });
      } else {
        // پس از ۷۶۰: کاملاً خارج از صفحه
        iceCubes.forEach(cube => {
          cube.style.opacity = '0';
        });
        icePct = 0;
      }
    }

    // انیمیشن ظهور متن یخی ICE COFFEE روی لیوان در اسکرول ۵۴۳ و خروج در ۶۶۲
    let textPct = 0;
    if (iceText) {
      if (sy < TEXT_START) {
        iceText.style.opacity = '0';
        iceText.style.transform = 'translate(-50%, -50%) scale(0.60)';
        textPct = 0;
      } else if (sy >= TEXT_START && sy < TEXT_END) {
        iceText.style.zIndex = '12'; // روی لیوان
        const tRaw   = (sy - TEXT_START) / (TEXT_END - TEXT_START);
        const tEased = easeOutCubic(tRaw);
        textPct      = (tRaw * 100).toFixed(0);

        const scale = (0.60 + tEased * 0.22).toFixed(3);
        iceText.style.opacity = tEased.toFixed(3);
        iceText.style.transform = `translate(-50%, -50%) scale(${scale})`;
      } else if (sy >= TEXT_END && sy < FINAL_EXIT_START) {
        // فاز استقرار کامل روی لیوان (۶۳۰ تا ۶۶۲)
        iceText.style.zIndex = '12';
        iceText.style.opacity = '1';
        iceText.style.transform = 'translate(-50%, -50%) scale(0.82)';
        textPct = 100;
      } else if (sy >= FINAL_EXIT_START && sy < FINAL_EXIT_END) {
        // فاز خروج متن در اسکرول ۶۶۲
        const fRaw   = (sy - FINAL_EXIT_START) / (FINAL_EXIT_END - FINAL_EXIT_START);
        const fEased = easeOutCubic(fRaw);
        textPct      = ((1 - fRaw) * 100).toFixed(0);

        const curScale = (0.82 - fEased * 0.28).toFixed(3);
        const curTransY = (-50 - fEased * 35).toFixed(1);
        iceText.style.opacity = Math.max(0, 1 - fEased).toFixed(3);
        iceText.style.transform = `translate(-50%, ${curTransY}%) scale(${curScale})`;
      } else {
        // پس از ۷۶۰: کاملاً خارج از صفحه
        iceText.style.opacity = '0';
        textPct = 0;
      }
    }

    // کنترل سخت‌افزاری و روان GPU گذار پس‌زمینه از سبز ماتچایی به مشکی لوکس با تغییر opacity لایه overlay
    if (teaArchDarkOverlay) {
      if (sy < RED_TRANS_START) {
        teaArchDarkOverlay.style.opacity = '0';
      } else if (sy >= RED_TRANS_START && sy <= RED_TRANS_END) {
        const rRaw = (sy - RED_TRANS_START) / (RED_TRANS_END - RED_TRANS_START);
        teaArchDarkOverlay.style.opacity = rRaw.toFixed(3);
      } else {
        teaArchDarkOverlay.style.opacity = '1';
      }
    }

    // انیمیشن طاق سبز ماچایی ملایم دمنوش (مربع با بالای نیم‌دایره): ورود از پایین، استقرار زیر دمنوش، و سپس بزرگ‌شدن تا پوشش کامل صفحه با خروج فنجان
    if (teaArch) {
      const startY = 85; // موقعیت شروع در ۸۵vh زیر مرکز کادر (خارج از کادر پایین صفحه)
      if (sy < TEA_START) {
        teaArch.style.opacity = '0';
        teaArch.style.transform = `translate(-50%, calc(-50% + ${startY}vh)) scale(0.80)`;
        teaArch.style.borderColor = 'rgba(255, 255, 255, 0.65)';
        teaArch.style.boxShadow = '0 25px 50px rgba(130, 150, 105, 0.25)';
        if (teaArchInner) {
          teaArchInner.style.opacity = '1';
        }
      } else if (sy >= TEA_START && sy < TEA_SETTLE) {
        // فاز بالا آمدن باشکوه از پایین صفحه به مرکز کادر (۷۳۰ تا ۸۱۵)
        const aRaw   = (sy - TEA_START) / (TEA_SETTLE - TEA_START);
        const aEased = easeOutCubic(aRaw);
        const curY   = (startY * (1 - aEased)).toFixed(1);
        const scale  = (0.80 + aEased * 0.20).toFixed(3);
        const alpha  = Math.min(1, aRaw * 1.8).toFixed(3);

        teaArch.style.opacity = alpha;
        teaArch.style.transform = `translate(-50%, calc(-50% + ${curY}vh)) scale(${scale})`;
        teaArch.style.borderColor = 'rgba(255, 255, 255, 0.65)';
        teaArch.style.boxShadow = '0 25px 50px rgba(130, 150, 105, 0.25)';
        if (teaArchInner) {
          teaArchInner.style.opacity = '1';
        }
      } else if (sy >= TEA_SETTLE && sy < TEA_EXIT_START) {
        // فاز استقرار کامل زیر فنجان دمنوش در مرکز صفحه (۸۱۵ تا ۸۶۵)
        teaArch.style.opacity = '1';
        teaArch.style.transform = 'translate(-50%, -50%) scale(1.00)';
        teaArch.style.borderColor = 'rgba(255, 255, 255, 0.65)';
        teaArch.style.boxShadow = '0 25px 50px rgba(130, 150, 105, 0.25)';
        if (teaArchInner) {
          teaArchInner.style.opacity = '1';
        }
      } else if (sy >= TEA_EXIT_START && sy < TEA_EXIT_END) {
        // فاز خروج فنجان دمنوش و بزرگ‌شدن طاق سبز تا پوشش ۱۰۰٪ کل صفحه
        const exitRaw   = (sy - TEA_EXIT_START) / (TEA_EXIT_END - TEA_EXIT_START);
        const exitEased = easeInOutCubic(exitRaw);

        const curScale    = (1.00 + exitEased * (cachedCoverScale - 1.00)).toFixed(3);
        const borderAlpha = Math.max(0, 0.65 * (1 - exitEased * 1.8)).toFixed(3);

        teaArch.style.opacity = '1';
        teaArch.style.transform = `translate(-50%, -50%) scale(${curScale})`;
        teaArch.style.borderColor = borderAlpha > 0.05 ? `rgba(255, 255, 255, ${borderAlpha})` : 'transparent';
        teaArch.style.boxShadow = 'none';
        if (teaArchInner) {
          teaArchInner.style.opacity = Math.max(0, 1 - exitEased * 1.8).toFixed(3);
        }
      } else {
        // پس از اتمام انبساط: طاق سبز کاملاً بزرگ شده و کل صفحه را به عنوان پس‌زمینه موهیتو پوشانده است
        teaArch.style.opacity = '1';
        teaArch.style.transform = `translate(-50%, -50%) scale(${cachedCoverScale.toFixed(3)})`;
        teaArch.style.borderColor = 'transparent';
        teaArch.style.boxShadow = 'none';
        if (teaArchInner) {
          teaArchInner.style.opacity = '0';
        }
      }
    }

    // انیمیشن ورود فنجان دمنوش از جنوب غربی (پایین-چپ) به مرکز صفحه در اسکرول ۷۳۰
    let teaPct = 0;
    if (teaCup) {
      const startX = -65; // جنوب مغرب: چپ (-65vw)
      const startY = 65;  // جنوب مغرب: پایین (+65vh)
      const startRot = -35;
      const startScale = 0.50;
      const targetScale = 1.00;

      if (sy < TEA_START) {
        teaCup.style.opacity = '0';
        teaCup.style.transform = `translate(calc(-50% + ${startX}vw), calc(-50% + ${startY}vh)) rotate(${startRot}deg) scale(${startScale})`;
        teaPct = 0;
      } else if (sy >= TEA_START && sy < TEA_SETTLE) {
        const teaRaw   = (sy - TEA_START) / (TEA_SETTLE - TEA_START);
        const teaEased = easeOutCubic(teaRaw);
        teaPct         = (teaRaw * 100).toFixed(0);

        const curX = (startX * (1 - teaEased)).toFixed(1);
        const curY = (startY * (1 - teaEased)).toFixed(1);
        const curRot = (startRot * (1 - teaEased)).toFixed(1);
        const curScale = (startScale + (targetScale - startScale) * teaEased).toFixed(3);
        const curAlpha = Math.min(1, teaRaw * 1.6).toFixed(3);

        teaCup.style.opacity = curAlpha;
        teaCup.style.transform = `translate(calc(-50% + ${curX}vw), calc(-50% + ${curY}vh)) rotate(${curRot}deg) scale(${curScale})`;
      } else if (sy >= TEA_SETTLE && sy < TEA_EXIT_START) {
        // فاز استقرار کامل در مرکز (۸۱۵ تا ۸۶۵)
        teaCup.style.opacity = '1';
        teaCup.style.transform = `translate(-50%, -50%) rotate(0deg) scale(${targetScale})`;
        teaPct = 100;
      } else if (sy >= TEA_EXIT_START && sy < TEA_EXIT_END) {
        // فاز خروج فنجان دمنوش از تصویر با منحنی نرم S-Curve
        const exitRaw   = (sy - TEA_EXIT_START) / (TEA_EXIT_END - TEA_EXIT_START);
        const exitEased = easeInOutCubic(exitRaw);
        teaPct          = ((1 - exitRaw) * 100).toFixed(0);

        const curScale  = (targetScale - exitEased * 0.35).toFixed(3);
        const curTransY = (exitEased * 60).toFixed(1);
        const curTransX = (-exitEased * 35).toFixed(1);
        const curAlpha  = Math.max(0, 1 - exitEased).toFixed(3);

        teaCup.style.opacity = curAlpha;
        teaCup.style.transform = `translate(calc(-50% + ${curTransX}vw), calc(-50% + ${curTransY}vh)) rotate(${(-exitEased * 25).toFixed(1)}deg) scale(${curScale})`;
      } else {
        // پس از ۹۴۰: کاملاً خارج از صفحه و مخفی
        teaCup.style.opacity = '0';
        teaPct = 0;
      }
    }

    if (herbElements && herbElements.length > 0) {
      if (sy < TEA_START) {
        herbElements.forEach(h => {
          if (!h.el) return;
          h.el.style.opacity = '0';
          h.el.style.transform = `translate(${h.startX}px, ${h.startY}px) rotate(${h.startRot}deg) scale(0.5)`;
        });
      } else if (sy >= TEA_START && sy < TEA_SETTLE) {
        const hRaw   = (sy - TEA_START) / (TEA_SETTLE - TEA_START);
        const hEased = easeOutCubic(hRaw);

        herbElements.forEach(h => {
          if (!h.el) return;
          const floatY = Math.sin(now * (h.speed || 0.0026) + (h.phase || 0)) * (h.ampY || 5.5) * hEased;

          const curX = (h.startX * (1 - hEased)).toFixed(1);
          const curY = (h.startY * (1 - hEased) + floatY).toFixed(1);
          const curRot = (h.startRot + (h.endRot - h.startRot) * hEased).toFixed(1);
          const curScale = (0.5 + (h.scale - 0.5) * hEased).toFixed(2);

          h.el.style.opacity = hEased.toFixed(3);
          h.el.style.transform = `translate(${curX}px, ${curY}px) rotate(${curRot}deg) scale(${curScale})`;
        });
      } else if (sy >= TEA_SETTLE && sy < TEA_EXIT_START) {
        // فاز استقرار و شناوری ارگانیک گیاهان در کادر - حرکت خالص، نرم و آرام بالا و پایین بدون هیچ لرزش چپ و راست
        herbElements.forEach(h => {
          if (!h.el) return;
          const floatY = (Math.sin(now * (h.speed || 0.0026) + (h.phase || 0)) * (h.ampY || 5.5)).toFixed(1);

          h.el.style.opacity = '1';
          h.el.style.transform = `translate(0px, ${floatY}px) rotate(${h.endRot}deg) scale(${h.scale})`;
        });
      } else if (sy >= TEA_EXIT_START && sy < TEA_EXIT_END) {
        // فاز خروج گیاهان معطر (لیمو، بادیان و برگ‌ها) با شتاب‌گیری و توقف سینمایی
        const exitRaw   = (sy - TEA_EXIT_START) / (TEA_EXIT_END - TEA_EXIT_START);
        const exitEased = easeInOutCubic(exitRaw);

        herbElements.forEach(h => {
          if (!h.el) return;
          const floatY = (Math.sin(now * (h.speed || 0.0026) + (h.phase || 0)) * (h.ampY || 5.5) * (1 - exitEased)).toFixed(1);

          const curRot = (h.endRot + (h.exitRot || 40) * exitEased).toFixed(1);
          const curScale = (h.scale * (1 - exitEased * 0.35)).toFixed(2);
          const curAlpha = Math.max(0, 1 - exitEased).toFixed(3);

          h.el.style.opacity = curAlpha;
          h.el.style.transform = `translate(${(h.exitX * exitEased).toFixed(1)}vw, calc(${floatY}px + ${(h.exitY * exitEased).toFixed(1)}vh)) rotate(${curRot}deg) scale(${curScale})`;
        });
      } else {
        // پس از ۹۲۸: کاملاً خارج از صفحه و مخفی
        herbElements.forEach(h => {
          if (!h.el) return;
          h.el.style.opacity = '0';
        });
      }
    }

    // ============ فصل ۴: صحنه ادیتوریال موهیتو گاردو (سایه برگ‌های نخل، لیوان شیک، لیموها و نعناع) ============
    let mojitoPct = 0;

    // سایه ارگانیک برگ‌های نخل استوایی روی پس‌زمینه ماتچایی (کم‌رنگ، ملایم و بدون کوچک‌ترین لرزش)
    if (mojitoLeafShadow) {
      if (sy < MOJITO_START) {
        mojitoLeafShadow.style.opacity = '0';
        mojitoLeafShadow.style.transform = 'translate3d(0, -15px, 0)';
      } else if (sy >= MOJITO_START && sy < MOJITO_SETTLE) {
        const sRaw   = (sy - MOJITO_START) / (MOJITO_SETTLE - MOJITO_START);
        const sEased = easeInOutCubic(sRaw);
        const sAlpha = (sEased * 0.32).toFixed(3); // سایه کم‌رنگ و ملایم
        const sY     = (-15 * (1 - sEased)).toFixed(1);
        mojitoLeafShadow.style.opacity = sAlpha;
        mojitoLeafShadow.style.transform = `translate3d(0, ${sY}px, 0)`;
      } else if (sy >= MOJITO_SETTLE && sy < RED_TRANS_START) {
        // استقرار کامل و پایدار در مرکز صفحه بدون محو شدن یا لرزش
        mojitoLeafShadow.style.opacity = '0.32';
        mojitoLeafShadow.style.transform = 'translate3d(0, 0, 0)';
      } else if (sy >= RED_TRANS_START && sy <= RED_TRANS_END) {
        // خروج برگ‌ها به سمت بالا با اسکرول کاربر
        const lRaw      = (sy - RED_TRANS_START) / (RED_TRANS_END - RED_TRANS_START);
        const lEased    = easeInQuad(lRaw);
        const leafY     = (-lEased * 115).toFixed(1); // حرکت به سمت بالا تا -115vh (خروج کامل از صفحه)
        const leafAlpha = Math.max(0, 0.32 * (1 - lRaw * 1.15)).toFixed(3);

        mojitoLeafShadow.style.opacity = leafAlpha;
        mojitoLeafShadow.style.transform = `translate3d(0, ${leafY}vh, 0)`;
      } else {
        // پس از اتمام گذار: خروج کامل برگ‌ها از بالای کادر و محو شدن
        mojitoLeafShadow.style.opacity = '0';
        mojitoLeafShadow.style.transform = 'translate3d(0, -115vh, 0)';
      }
    }

    // تایپوگرافی ادیتوریال موکتل به رنگ سبز لیمو پشت لیوان
    if (mocktailBgText) {
      if (sy < MOJITO_START) {
        mocktailBgText.style.opacity = '0';
        mocktailBgText.style.transform = 'translate(-50%, calc(-50% - 22vh))';
        mocktailBgText.style.color = '#1c4418';
      } else if (sy >= MOJITO_START && sy < MOJITO_SETTLE) {
        const mRaw   = (sy - MOJITO_START) / (MOJITO_SETTLE - MOJITO_START);
        const mEased = easeInOutCubic(mRaw);
        const textY  = (-22 * (1 - mEased)).toFixed(2);
        mocktailBgText.style.opacity   = mEased.toFixed(3);
        mocktailBgText.style.transform = `translate(-50%, calc(-50% + ${textY}vh))`;
        mocktailBgText.style.color     = '#1c4418';
      } else if (sy >= MOJITO_SETTLE && sy < RED_TRANS_START) {
        mocktailBgText.style.opacity   = '1';
        mocktailBgText.style.transform = 'translate(-50%, -50%)';
        mocktailBgText.style.color     = '#1c4418';
      } else if (sy >= RED_TRANS_START && sy <= RED_TRANS_END) {
        // خروج متن موکتل از سمت راست صفحه با اسکرول کاربر دقیقاً از اسکرول ۱۱۰۰ تا ۱۲۴۰
        const rRaw      = (sy - RED_TRANS_START) / (RED_TRANS_END - RED_TRANS_START);
        const exitEased = easeInCubic(rRaw);
        const exitX     = (exitEased * 105).toFixed(1); // حرکت به سمت راست تا ۱۰۵vw
        const exitAlpha = Math.max(0, 1 - rRaw * 1.35).toFixed(3);

        mocktailBgText.style.opacity   = exitAlpha;
        mocktailBgText.style.transform = `translate(calc(-50% + ${exitX}vw), -50%)`;

        // هماهنگی رنگ حین خروج به سمت مشکی
        const tr = Math.round(28 + rRaw * (18 - 28));
        const tg = Math.round(68 + rRaw * (17 - 68));
        const tb = Math.round(24 + rRaw * (16 - 24));
        mocktailBgText.style.color = `rgb(${tr}, ${tg}, ${tb})`;
      } else {
        // پس از ۱۲۴۰: خروج کامل از سمت راست صفحه و محو
        mocktailBgText.style.opacity   = '0';
        mocktailBgText.style.transform = 'translate(100vw, -50%)';
        mocktailBgText.style.color     = 'rgb(18, 17, 16)';
      }
    }

    // ورود و استقرار لیوان موهیتو و سپس خروج هماهنگ به سمت پایین همراه با خروج برگ‌ها و متن
    if (mocktailWrap) {
      if (sy < MOJITO_START) {
        mocktailWrap.style.opacity = '0';
        mocktailWrap.style.transform = 'translate(-50%, -50%) scale(0.60)';
        mojitoPct = 0;
      } else if (sy >= MOJITO_START && sy < MOJITO_SETTLE) {
        // پدیدار شدن با زوم نرم به سمت جلو در مرکز کادر
        const mRaw   = (sy - MOJITO_START) / (MOJITO_SETTLE - MOJITO_START);
        const mEased = easeInOutCubic(mRaw);
        mojitoPct    = (mRaw * 100).toFixed(0);

        const scale = (0.60 + mEased * 0.40).toFixed(3);
        mocktailWrap.style.opacity = mEased.toFixed(3);
        mocktailWrap.style.transform = `translate(-50%, -50%) scale(${scale})`;
      } else if (sy >= MOJITO_SETTLE && sy < RED_TRANS_START) {
        // استقرار کامل و باوقار در مرکز کادر بدون محو شدن یا پرش (۱۰۱۰ تا ۱۱۰۰)
        mocktailWrap.style.opacity = '1';
        mocktailWrap.style.transform = 'translate(-50%, -50%) scale(1.00)';
        mojitoPct = 100;
      } else if (sy >= RED_TRANS_START && sy <= RED_TRANS_END) {
        // خروج هم‌زمان لیوان به سمت پایین همراه با کنار رفتن برگ‌ها (به بالا) و متن (به راست) از ۱۱۰۰ تا ۱۲۴۰
        const gRaw       = (sy - RED_TRANS_START) / (RED_TRANS_END - RED_TRANS_START);
        const gEased     = easeInQuad(gRaw);
        const glassY     = (gEased * 115).toFixed(1); // حرکت به سمت پایین تا +115vh (خروج کامل از پایین صفحه)
        const glassAlpha = Math.max(0, 1 - gRaw * 1.25).toFixed(3);

        mocktailWrap.style.opacity = glassAlpha;
        mocktailWrap.style.transform = `translate(-50%, calc(-50% + ${glassY}vh)) scale(1.00)`;
        mojitoPct = Math.round(Math.max(0, (1 - gRaw) * 100));
      } else {
        // پس از اسکرول ۱۲۴۰: خروج کامل از پایین صفحه و محو
        mocktailWrap.style.opacity = '0';
        mocktailWrap.style.transform = 'translate(-50%, 115vh) scale(1.00)';
        mojitoPct = 0;
      }
    }

    // ============ فصل ۵: استیج انفجاری سری قلیان لوکس و دود غلیظ گاردو ============
    let shishaPct = 0;
    if (shishaPartCoals && shishaPartBowl && shishaSmokeBg) {
      if (sy < SHISHA_START) {
        // قبل از ۱۴۵۰: کاملاً پنهان و خارج از کادر
        shishaSmokeBg.style.opacity = '0';
        shishaSmokeBg.style.transform = 'translate(-50%, calc(-50% - 20vh)) scale(0.92)';

        if (shishaNeonSign) {
          shishaNeonSign.style.opacity = '0';
          shishaNeonSign.style.transform = 'translate(calc(-50% - 35px), -50%) scale(0.94)';
        }

        // ۱. ذغال‌ها بیرون در بالا
        shishaPartCoals.style.opacity = '0';
        shishaPartCoals.style.transform = 'translateY(-85vh)';

        // ۲. کلاهک HMD بیرون در راست
        shishaPartHmd.style.opacity = '0';
        shishaPartHmd.style.transform = 'translate(85vw, 0) rotate(22deg)';

        // ۳. تنباکو بیرون در چپ
        shishaPartTobacco.style.opacity = '0';
        shishaPartTobacco.style.transform = 'translate(-85vw, 0) rotate(-25deg)';

        // ۴. سری سرامیکی بیرون در پایین
        shishaPartBowl.style.opacity = '0';
        shishaPartBowl.style.transform = 'translateY(85vh)';

        shishaPct = 0;
      } else if (sy >= SHISHA_START && sy <= SHISHA_ASSEMBLE) {
        // فاز ورود پیوسته و هماهنگ از جهات مختلف با اسکرول کاربر (۱۴۵۰ تا ۱۹۲۰)
        const sRaw   = (sy - SHISHA_START) / (SHISHA_ASSEMBLE - SHISHA_START);
        const sEased = easeOutCubic(sRaw);
        shishaPct    = Math.round(sRaw * 100);

        // دود بالای ذغال‌ها: پدیدار شدن تدریجی همراه با مقیاس
        shishaSmokeBg.style.opacity = Math.min(1.0, sRaw * 1.5).toFixed(3);
        const smokeScale = (0.92 + sEased * 0.08).toFixed(3);
        const smokeY = ((1 - sEased) * 4).toFixed(1);
        shishaSmokeBg.style.transform = `translate(-50%, calc(-50% - 24vh + ${smokeY}vh)) scale(${smokeScale})`;

        // تابلو نئون عمودی HOOKAH: ورود نرم از سمت چپ با درخشش نور نئونی آبی
        if (shishaNeonSign) {
          const neonX     = (-(1 - sEased) * 35).toFixed(1);
          const neonScale = (0.94 + sEased * 0.06).toFixed(3);
          const neonAlpha = Math.min(1.0, sRaw * 1.5).toFixed(3);
          shishaNeonSign.style.opacity   = neonAlpha;
          shishaNeonSign.style.transform = `translate(calc(-50% + ${neonX}px), -50%) scale(${neonScale})`;
        }

        // ۱. ذغال‌های مکعبی گداخته از بالا
        const coalsY     = (-(1 - sEased) * 85).toFixed(1);
        const coalsAlpha = Math.min(1.0, sRaw * 1.6).toFixed(3);
        shishaPartCoals.style.opacity   = coalsAlpha;
        shishaPartCoals.style.transform = `translateY(${coalsY}vh)`;

        // ۲. کلاهک فلزی HMD لوتوس از سمت راست
        const hmdX     = ((1 - sEased) * 85).toFixed(1);
        const hmdRot   = ((1 - sEased) * 22).toFixed(1);
        const hmdAlpha = Math.min(1.0, sRaw * 1.6).toFixed(3);
        shishaPartHmd.style.opacity   = hmdAlpha;
        shishaPartHmd.style.transform = `translate(${hmdX}vw, 0) rotate(${hmdRot}deg)`;

        // ۳. تنباکوی معسل طعم‌دار از سمت چپ
        const tobX     = (-(1 - sEased) * 85).toFixed(1);
        const tobRot   = (-(1 - sEased) * 25).toFixed(1);
        const tobAlpha = Math.min(1.0, sRaw * 1.6).toFixed(3);
        shishaPartTobacco.style.opacity   = tobAlpha;
        shishaPartTobacco.style.transform = `translate(${tobX}vw, 0) rotate(${tobRot}deg)`;

        // ۴. سری سرامیکی و دسته چوبی با حلقه دود از پایین
        const bowlY     = ((1 - sEased) * 85).toFixed(1);
        const bowlAlpha = Math.min(1.0, sRaw * 1.6).toFixed(3);
        shishaPartBowl.style.opacity   = bowlAlpha;
        shishaPartBowl.style.transform = `translateY(${bowlY}vh)`;
      } else {
        // پس از ۱۹۲۰: استقرار نهایی در کادر بدون هیچ‌گونه لرزش و حرکت، کاملاً ثابت و ایستا
        shishaPct = 100;

        shishaSmokeBg.style.opacity   = '1';
        shishaSmokeBg.style.transform = 'translate(-50%, calc(-50% - 24vh)) scale(1.00)';

        if (shishaNeonSign) {
          shishaNeonSign.style.opacity   = '1';
          shishaNeonSign.style.transform = 'translate(-50%, -50%) scale(1.00)';
        }

        shishaPartCoals.style.opacity   = '1';
        shishaPartCoals.style.transform = 'translateY(0)';

        shishaPartHmd.style.opacity   = '1';
        shishaPartHmd.style.transform = 'translate(0, 0) rotate(0deg)';

        shishaPartTobacco.style.opacity   = '1';
        shishaPartTobacco.style.transform = 'translate(0, 0) rotate(0deg)';

        shishaPartBowl.style.opacity   = '1';
        shishaPartBowl.style.transform = 'translateY(0)';
      }
    }

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = cachedCanvasWidth;
    const h = cachedCanvasHeight;

    // حذف کامل دانه‌های قهوه به محض پر شدن و پوشش کامل صفحه توسط پس‌زمینه هات‌کافی (اسکرول ۵۱۳)
    if (sy >= EXIT_END) {
      if (!beansCleared) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        beansCleared = true;
      }
    } else {
      beansCleared = false;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // رندر دانه‌های قهوه با فیزیک سقوط آزاد ممتد، چرخش و رانش باد (۴۴ دانه پیوسته از بالا)
      beansData.forEach((b) => {
        const bImg = beanImages[b.imgIdx];
        if (!bImg || !bImg.complete || bImg.naturalWidth === 0) return;

        let curX, curY, curRot, curAlpha = b.alpha;

        // تثبیت در نقطه توقف تایید شده (p = 1.0)
        const animP = p;

        // ابعاد پرحجم و طبیعی قهوه (همان اندازه تایید شده)
        const bw = bImg.naturalWidth * b.scale;
        const bh = bImg.naturalHeight * b.scale;

        const driftAmount = b.drift * (isMobile ? 0.40 : 1.0);

        if (animP < b.startP) {
          // قبل از سقوط: شناور بودن ملایم در بالای کادر تا رسیدن نوبت ورود
          const idleWave = Math.sin(now * 0.0018 + b.idlePhase) * (isMobile ? 6 : 10);
          curX = w * b.xRatio;
          curY = -45 + idleWave - (b.startP - animP) * 200;
          curRot = b.startRot + Math.sin(now * 0.001 + b.idlePhase) * 0.2;
          curAlpha *= Math.max(0, 1 - (b.startP - animP) * 4);
        } else {
          // حین سقوط و استقرار دانه‌ها در سراسر کادر تا پایین صفحه
          const normP = Math.min(1, (animP - b.startP) / b.durationP);
          const easedP = Math.pow(normP, 1.30);

          // شناوری زنده و ارگانیک پس از استقرار
          const floatIdleY = Math.sin(now * 0.0012 + b.idlePhase) * (isMobile ? 3.2 : 4.5) * easedP;
          const floatIdleX = Math.cos(now * 0.0010 + b.idlePhase) * (isMobile ? 1.8 : 3.0) * easedP;

          curX = w * b.xRatio + Math.sin(normP * Math.PI) * driftAmount + floatIdleX;
          // دانه‌ها مدام از بالای کادر (-45px) سرازیر شده و در سراسر کادر مستقر می‌شوند
          curY = -45 + (h * b.targetYRatio + 45) * easedP + floatIdleY;
          curRot = b.startRot + normP * b.rotSpeed * Math.PI;
        }

        // جلوگیری از خروج دانه‌ها از لبه‌های چپ و راست صفحه
        const edgePad = bw * 0.5 + 4;
        curX = Math.max(edgePad, Math.min(w - edgePad, curX));

        // خروج دانه‌های قهوه هم‌زمان با پر شدن صفحه توسط پس‌زمینه هات‌کافی (۴۱۴ تا ۵۱۳)
        if (sy >= EXIT_START && sy < EXIT_END) {
          const bExitRaw = (sy - EXIT_START) / (EXIT_END - EXIT_START);
          curAlpha *= Math.max(0, 1 - bExitRaw);
          curY += bExitRaw * 40;
        } else if (sy >= EXIT_END) {
          curAlpha = 0;
        }

        if (curAlpha <= 0.005) return;

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, curAlpha));
        ctx.translate(curX, curY);
        ctx.rotate(curRot);

        // سایه ملایم و سبک قهوه با رندر بهینه در موبایل (جلوگیری از افت فریم)
        ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
        ctx.shadowBlur = isMobile ? 6 : 14;
        ctx.shadowOffsetY = isMobile ? 4 : 8;

        ctx.drawImage(bImg, -bw / 2, -bh / 2, bw, bh);
        ctx.restore();
      });
    }

    // نشان سه بعدی طلایی گاردو: اول صفحه نمایان با شناوری زنده ۳بعدی، چرخش سینمایی طبیعی با اسکرول (بدون نازک شدن یا وارونگی) و محو شدن تدریجی تا اسکرول ۱۸۰
    if (scrollLogo) {
      if (p <= 0.02) {
        // شناوری آرام، زنده و ارگانیک نشان طلایی در مرکز کادر هنگام توقف
        const idleFloatY = Math.sin(now * 0.0014) * (isMobile ? 3.5 : 5.0);
        const idleRotY = Math.sin(now * 0.0011) * (isMobile ? 2.5 : 3.5);
        const idleRotX = Math.cos(now * 0.0009) * (isMobile ? 1.5 : 2.0);
        scrollLogo.style.opacity = '1';
        scrollLogo.style.transform = `translate(-50%, calc(-50% + ${idleFloatY.toFixed(1)}px)) perspective(1000px) rotateY(${idleRotY.toFixed(1)}deg) rotateX(${idleRotX.toFixed(1)}deg) scale(1)`;
      } else if (p > 0.02 && p <= 0.50) {
        const t = (p - 0.02) / 0.48;
        const easeT = easeOutCubic(t);
        // چرخش ۳بعدی پرستیژ و لوکس (حداکثر ۳۲ درجه در موبایل) - ضخامت و شکوه حفظ می‌شود و وارونه نمی‌شود
        const maxRotY = isMobile ? 32 : 38;
        const rotY = (t * maxRotY).toFixed(1);
        const rotX = (Math.sin(t * Math.PI) * (isMobile ? 10 : 14)).toFixed(1);
        const scale = (1 - easeT * 0.15).toFixed(3);
        const translateY = (easeT * (isMobile ? 24 : 32)).toFixed(1);

        // محو شدن روان هم‌زمان با پایین آمدن دانه‌های قهوه تا استقرار در نقطه ۱۸۰
        const fadeStart = 0.18;
        let opacity = 1;
        if (t > fadeStart) {
          const fadeP = (t - fadeStart) / (1 - fadeStart);
          opacity = Math.max(0, 1 - Math.pow(fadeP, 1.35));
        }

        scrollLogo.style.opacity = opacity.toFixed(3);
        scrollLogo.style.transform = `translate(-50%, calc(-50% + ${translateY}px)) perspective(1000px) rotateY(${rotY}deg) rotateX(${rotX}deg) scale(${scale})`;
      } else {
        const maxRotY = isMobile ? 32 : 38;
        scrollLogo.style.opacity = '0';
        scrollLogo.style.transform = `translate(-50%, calc(-50% + 24px)) perspective(1000px) rotateY(${maxRotY}deg) rotateX(0deg) scale(0.85)`;
      }
    }

    // راهنمای متحرک اسکرول به پایین (مخفی شده به درخواست کاربر)
    if (heroScrollIndicator) {
      heroScrollIndicator.style.display = 'none';
      heroScrollIndicator.style.opacity = '0';
      heroScrollIndicator.style.pointerEvents = 'none';
    }

    if (window.updateSlideNavDock) {
      window.updateSlideNavDock(sy);
    }

    requestAnimationFrame(renderLoop);
  }

  resizeCanvas();
  onScroll();
  requestAnimationFrame(renderLoop);

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => {
    resizeCanvas();
    adjustPageEnd();
    onScroll();
  });
}

// توابع کمکی Easing
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
function easeInQuad(t) { return t * t; }
function easeInCubic(t) { return t * t * t; }
function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
function easeInOutQuad(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }


// ----- ذرات canvas (بخار/نقطه‌های درخشان پس‌زمینه) -----
function initParticles(canvas) {
  const ctx = canvas.getContext('2d');
  let w, h, particles;

  function resize() {
    w = canvas.width  = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
  }

  function createParticles() {
    const isMobile = window.innerWidth <= 768;
    const count = isMobile ? 32 : 55;
    const speedMult = isMobile ? 0.55 : 1.0;
    particles = Array.from({ length: count }, () => ({
      x:     Math.random() * w,
      y:     Math.random() * h,
      r:     Math.random() * 1.8 + 0.3,
      alpha: Math.random() * 0.6 + 0.1,
      speed: (Math.random() * 0.4 + 0.1) * speedMult,
      drift: (Math.random() - 0.5) * 0.3 * speedMult,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    const isMobile = window.innerWidth <= 768;
    const alphaDecay = isMobile ? 0.00045 : 0.0008;
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212, 150, 80, ${p.alpha})`;
      ctx.fill();

      p.y     -= p.speed;
      p.x     += p.drift;
      p.alpha -= alphaDecay;

      if (p.y < -5 || p.alpha <= 0) {
        p.x     = Math.random() * w;
        p.y     = h + 5;
        p.alpha = Math.random() * 0.5 + 0.15;
      }
    });
    requestAnimationFrame(draw);
  }

  resize();
  createParticles();
  draw();
  window.addEventListener('resize', () => { resize(); createParticles(); });
}


// ----- انیمیشن آبشاری و جذاب ورود منو و کارت‌ها هنگام اسکرول به پایین -----
function initCardAnimations() {
  const cards = document.querySelectorAll('.item-card');
  const titles = document.querySelectorAll('.section-title, .categories-tabs');
  const isMobile = window.innerWidth <= 768;

  // انیمیشن تایتل‌ها و تب‌ها
  const titleObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        titleObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  titles.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    const dur = isMobile ? '1.1s' : '0.7s';
    el.style.transition = `opacity ${dur} cubic-bezier(0.16, 1, 0.3, 1), transform ${dur} cubic-bezier(0.16, 1, 0.3, 1)`;
    titleObserver.observe(el);
  });

  // انیمیشن آبشاری کارت‌ها با تأخیر استَگِر (آرام‌تر در گوشی)
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const index = Array.from(cards).indexOf(entry.target);
        const delay = (index % 4) * (isMobile ? 125 : 85);
        setTimeout(() => {
          entry.target.classList.add('animated-in');
        }, delay);
        cardObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  cards.forEach(card => {
    cardObserver.observe(card);
  });
}


// ----- Smooth Scroll برای لینک‌های # -----
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}


// ========================================================
// ناوبری یکپارچه اسلایدهای گاردو (< > وسط پایین صفحه با رنگ‌های انیمیشنی)
// ========================================================
function initSlideNavDock() {
  const dock = document.getElementById('slideNavDock');
  const prevBtn = document.getElementById('navPrevBtn');
  const nextBtn = document.getElementById('navNextBtn');
  const plusBtn = document.getElementById('navPlusBtn');
  if (!dock) return;

  const slides = [
    { id: 0, name: 'هیرو گاردو', scrollY: 0, url: '/category/1/' },
    { id: 1, name: 'نوشیدنی‌های گرم', scrollY: 260, url: '/category/1/' },
    { id: 2, name: 'قهوه سرد و آیس کافی', scrollY: 480, url: '/category/2/' },
    { id: 3, name: 'دمنوش و چای طبیعی', scrollY: 790, url: '/category/3/' },
    { id: 4, name: 'موهیتو و موکتل', scrollY: 1120, url: '/category/4/' },
    { id: 5, name: 'قلیان‌های ویژه لوکس', scrollY: 1480, url: '/category/5/' }
  ];

  // پالت رنگ‌های هماهنگ با تم هر اسلاید برای تغییر نرم و انیمیشنی داک
  const slideThemes = [
    // اسلاید ۰: هیرو گاردو - قهوه تلخ دارک و نشان طلایی سه بعدی
    {
      fill: 'rgba(28, 22, 17, 0.88)',
      border: 'rgba(212, 165, 116, 0.60)',
      icon: '#E5C39E',
      glow: 'rgba(212, 165, 116, 0.40)'
    },
    // اسلاید ۱: نوشیدنی‌های گرم - موج کرم و قهوه کاراملی داغ برشته
    {
      fill: 'rgba(74, 34, 18, 0.90)',
      border: 'rgba(235, 130, 60, 0.70)',
      icon: '#FFE4D4',
      glow: 'rgba(235, 130, 60, 0.50)'
    },
    // اسلاید ۲: قهوه سرد و آیس کافی - هماهنگ با کارامل طلایی، کلدبرو و کهربایی
    {
      fill: 'rgba(46, 30, 18, 0.92)',
      border: 'rgba(229, 169, 60, 0.85)',
      icon: '#FDE68A',
      glow: 'rgba(229, 169, 60, 0.55)'
    },
    // اسلاید ۳: دمنوش و چای طبیعی - سبز ماتچایی آرامش‌بخش و نعناع ارگانیک
    {
      fill: 'rgba(24, 42, 22, 0.90)',
      border: 'rgba(132, 188, 82, 0.75)',
      icon: '#DCFCE7',
      glow: 'rgba(132, 188, 82, 0.50)'
    },
    // اسلاید ۴: موهیتو و موکتل - سبز ماتچایی/مریم‌گلی هماهنگ با پس‌زمینه
    {
      fill: 'rgba(28, 38, 24, 0.92)',
      border: 'rgba(178, 193, 146, 0.85)',
      icon: '#E3ECCE',
      glow: 'rgba(142, 168, 105, 0.60)'
    },
    // اسلاید ۵: قلیان‌های ویژه لوکس - هماهنگ با رنگ آبی نئونی تابلو HOOKAH
    {
      fill: 'rgba(10, 18, 36, 0.92)',
      border: 'rgba(59, 130, 246, 0.85)',
      icon: '#93C5FD',
      glow: 'rgba(37, 99, 235, 0.65)'
    }
  ];

  function getSlideIndex(sy) {
    if (sy < 180) return 0;
    if (sy < 330) return 1;
    if (sy < 620) return 2;
    if (sy < 950) return 3;
    if (sy < 1270) return 4;
    return 5;
  }

  function smoothScrollTo(targetY, duration = 650) {
    const startY = window.scrollY || window.pageYOffset || 0;
    const diff = targetY - startY;
    if (Math.abs(diff) < 2) return;
    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // easeInOutCubic
      const ease = progress < 0.5 
        ? 4 * progress * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      window.scrollTo(0, startY + diff * ease);
      updateDockState();
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }
    requestAnimationFrame(step);
  }

  let currentThemeIdx = -1;
  let lastDockScrollY = -9999;
  function updateDockState(customSy) {
    const factor = getGlobalScrollFactor();
    const sy = (typeof customSy === 'number') ? customSy : ((window.scrollY || window.pageYOffset || 0) / factor);
    if (Math.abs(sy - lastDockScrollY) < 1) return;
    lastDockScrollY = sy;
    const idx = getSlideIndex(sy);
    const currentSlide = slides[idx];

    // اعمال تغییر انیمیشنی رنگ‌ها و لینک‌ها فقط هنگام تغییر اسلاید فعال
    if (idx !== currentThemeIdx) {
      currentThemeIdx = idx;

      // به روز رسانی لینک دکمه + جهت هدایت مستقیم به دسته‌بندی همان اسلاید
      if (plusBtn && currentSlide) {
        plusBtn.href = currentSlide.url;
        plusBtn.title = `مشاهده منوی ${currentSlide.name}`;
        plusBtn.setAttribute('aria-label', `مشاهده منوی ${currentSlide.name}`);
      }

      const theme = slideThemes[idx] || slideThemes[0];
      dock.style.setProperty('--dock-fill', theme.fill);
      dock.style.setProperty('--dock-border', theme.border);
      dock.style.setProperty('--dock-icon', theme.icon);
      dock.style.setProperty('--dock-glow', theme.glow);
      dock.setAttribute('data-active-slide', idx);

      if (prevBtn) {
        prevBtn.classList.toggle('is-disabled', idx === 0);
      }
      if (nextBtn) {
        nextBtn.classList.toggle('is-disabled', idx === slides.length - 1);
      }
    }
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const isMobile = window.innerWidth <= 768;
      const factor = getGlobalScrollFactor();
      const sy = (window.scrollY || window.pageYOffset || 0) / factor;
      const idx = getSlideIndex(sy);
      const targetIdx = Math.max(0, idx - 1);
      const duration = isMobile ? 1200 : 650;
      smoothScrollTo(slides[targetIdx].scrollY * factor, duration);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const isMobile = window.innerWidth <= 768;
      const factor = getGlobalScrollFactor();
      const sy = (window.scrollY || window.pageYOffset || 0) / factor;
      const idx = getSlideIndex(sy);
      const targetIdx = Math.min(slides.length - 1, idx + 1);
      const duration = isMobile ? 1200 : 650;
      smoothScrollTo(slides[targetIdx].scrollY * factor, duration);
    });
  }

  window.smoothScrollToSlide = smoothScrollTo;
  window.updateSlideNavDock = updateDockState;
  window.addEventListener('scroll', () => updateDockState(), { passive: true });
  updateDockState();

  // بررسی پارامترهای URL برای اسکرول مستقیم به اسلاید در زمان بازگشت از صفحه Detail
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const scrollTarget = urlParams.get('scroll');
    const slideTarget = urlParams.get('slide');
    const isMobile = window.innerWidth <= 768;
    const factor = getGlobalScrollFactor();
    const duration = isMobile ? 1200 : 550;
    if (scrollTarget !== null) {
      const sy = parseInt(scrollTarget, 10);
      if (!isNaN(sy) && sy >= 0) {
        setTimeout(() => {
          smoothScrollTo(sy * factor, duration);
        }, 150);
      }
    } else if (slideTarget !== null) {
      const sIdx = parseInt(slideTarget, 10);
      if (!isNaN(sIdx) && slides[sIdx]) {
        setTimeout(() => {
          smoothScrollTo(slides[sIdx].scrollY * factor, duration);
        }, 150);
      }
    }
  } catch (err) {
    // صرف‌نظر در صورت عدم پشتیبانی مرورگرهای قدیمی
  }
}


// ========================================================
// تعاملات صفحه جزئیات منو و مودال آیتم‌ها (Category Detail & Modal)
// ========================================================
function initCategoryDetailPage() {
  const modal = document.getElementById('itemDetailModal');
  const closeBtn = document.getElementById('modalCloseBtn');
  const confirmBtn = document.getElementById('modalConfirmBtn');
  const cards = document.querySelectorAll('.lux-card');
  const filterPills = document.querySelectorAll('.subcat-filter-pills .filter-pill');
  const groupWrappers = document.querySelectorAll('.subcat-group-wrapper');

  if (!modal && cards.length === 0) return;

  function openModal(card) {
    if (!modal || !card) return;
    const name = card.dataset.itemName || '';
    const nameEn = card.dataset.itemNameEn || '';
    const desc = card.dataset.itemDesc || 'ترکیبات به زودی اضافه خواهد شد.';
    const price = card.dataset.itemPrice || '۰';
    const subName = card.dataset.subName || '';

    const titleEl = document.getElementById('modalItemTitle');
    const enEl = document.getElementById('modalItemEn');
    const descEl = document.getElementById('modalItemDesc');
    const priceEl = document.getElementById('modalItemPrice');
    const subEl = document.getElementById('modalSubName');
    const photoWrap = document.getElementById('modalPhotoWrap');
    const photoImg = document.getElementById('modalItemPhoto');
    const imgUrl = card.dataset.itemImage || '';

    if (titleEl) titleEl.textContent = name;
    if (enEl) enEl.textContent = nameEn;
    if (descEl) descEl.textContent = desc || 'آیتم ویژه و دست‌ساز کافه گاردو، تهیه شده از مرغوب‌ترین مواد اولیه.';
    if (subEl && subName) subEl.textContent = subName;

    // اعمال تخفیف در صورت فعال بودن
    const isDiscounted = card.dataset.itemIsDiscounted === 'true';
    const oldPrice = card.dataset.itemPrice || '۰';
    const finalPrice = card.dataset.itemFinalPrice || oldPrice;
    const discountVal = card.dataset.itemDiscount || '۰';
    const discountPill = document.getElementById('modalDiscountPill');
    const discountText = document.getElementById('modalDiscountText');
    const priceOldEl = document.getElementById('modalItemPriceOld');

    if (isDiscounted && discountPill && discountText && priceOldEl) {
      discountText.textContent = `${discountVal}٪ تخفیف`;
      discountPill.style.display = 'inline-flex';
      priceOldEl.textContent = oldPrice;
      priceOldEl.style.display = 'inline-block';
      if (priceEl) priceEl.textContent = finalPrice;
    } else {
      if (discountPill) discountPill.style.display = 'none';
      if (priceOldEl) priceOldEl.style.display = 'none';
      if (priceEl) priceEl.textContent = oldPrice;
    }

    if (photoWrap && photoImg) {
      if (imgUrl) {
        photoImg.src = imgUrl;
        photoImg.alt = name;
        photoWrap.style.display = 'block';
      } else {
        photoImg.src = '';
        photoWrap.style.display = 'none';
      }
    }

    const cartWrap = card.querySelector('.card-cart-btn-wrap');
    const itemId = (cartWrap && cartWrap.dataset.itemId) || card.dataset.itemId || '';
    const itemName = (cartWrap && cartWrap.dataset.itemName) || name;
    const itemPrice = (cartWrap && cartWrap.dataset.itemPrice) || card.dataset.itemFinalPrice || '0';
    const itemImg = (cartWrap && cartWrap.dataset.itemImg) || imgUrl;

    modal.dataset.itemId = itemId;
    modal.dataset.itemName = itemName;
    modal.dataset.itemPrice = itemPrice;
    modal.dataset.itemImg = itemImg;

    const modalCartWrap = document.getElementById('modalCartBtnWrap');
    if (modalCartWrap) {
      modalCartWrap.dataset.itemId = itemId;
      modalCartWrap.dataset.itemName = itemName;
      modalCartWrap.dataset.itemPrice = itemPrice;
      modalCartWrap.dataset.itemImg = itemImg;
    }

    if (window.cartManager) {
      window.cartManager.syncCardSteppers();
    }

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    const photoImg = document.getElementById('modalItemPhoto');
    if (photoImg) photoImg.src = '';
    const modalCartWrap = document.getElementById('modalCartBtnWrap');
    if (modalCartWrap) {
      modalCartWrap.dataset.itemId = '';
      modalCartWrap.classList.remove('has-qty');
      const valEl = modalCartWrap.querySelector('.stepper-val');
      if (valEl) valEl.textContent = '0';
    }
  }

  // باز کردن مودال با کلیک روی کارت یا دکمه ترکیبات (به جز کلیک روی دکمه سبد خرید و استپر)
  cards.forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.card-cart-btn-wrap') || e.target.closest('.card-qty-stepper') || e.target.closest('.btn-card-add')) {
        return;
      }
      openModal(card);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (confirmBtn) confirmBtn.addEventListener('click', closeModal);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('is-open')) {
      closeModal();
    }
  });

  // فیلتر آنی و نرم زیرمجموعه‌ها در صورت حضور در حالت "همه موارد"
  if (filterPills.length > 0) {
    filterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        filterPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const filterVal = pill.getAttribute('data-filter');
        groupWrappers.forEach(wrap => {
          if (filterVal === 'all' || wrap.id === filterVal) {
            wrap.style.display = '';
            wrap.style.opacity = '1';
          } else {
            wrap.style.display = 'none';
          }
        });
      });
    });
  }

  // افکت پارالاکس و حرکت نرم کانتینر روی بنر هدر در اسکرول
  const headerHero = document.querySelector('.cat-header-hero');
  const bannerVisual = document.querySelector('.hero-custom-banner-wrap, .hero-center-visual');
  if (headerHero && bannerVisual) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const sy = window.scrollY || window.pageYOffset || 0;
          const isMobile = window.innerWidth <= 768;
          if (sy <= 600) {
            const speed = isMobile ? 0.12 : 0.22;
            const decay = isMobile ? 0.0014 : 0.0022;
            bannerVisual.style.transform = `translateY(${(sy * speed).toFixed(1)}px)`;
            bannerVisual.style.opacity = Math.max(0.15, 1 - sy * decay).toFixed(3);
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // ناوبری اسکرولی دسته‌بندی‌ها (اسکرول خودکار به تب فعال در موبایل و درگ ماوس در صورت اسکرول)
  const navTrack = document.getElementById('catNavTrack');
  if (navTrack) {
    const activePill = navTrack.querySelector('.cat-nav-pill.is-active');
    if (activePill && window.innerWidth <= 768) {
      setTimeout(() => {
        if (navTrack.scrollWidth > navTrack.clientWidth) {
          activePill.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
        }
      }, 150);
    }

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let hasMoved = false;

    navTrack.addEventListener('mousedown', (e) => {
      if (navTrack.scrollWidth <= navTrack.clientWidth + 5) return;
      isDown = true;
      hasMoved = false;
      navTrack.classList.add('is-dragging');
      startX = e.pageX - navTrack.offsetLeft;
      scrollLeft = navTrack.scrollLeft;
    });

    window.addEventListener('mouseup', () => {
      if (isDown) {
        isDown = false;
        navTrack.classList.remove('is-dragging');
      }
    });

    navTrack.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - navTrack.offsetLeft;
      const walk = (x - startX) * 1.5;
      if (Math.abs(walk) > 5) {
        hasMoved = true;
      }
      navTrack.scrollLeft = scrollLeft - walk;
    });

    // جلوگیری از ثبت کلیک اشتباه در صورت درگ واقعی
    navTrack.addEventListener('click', (e) => {
      if (hasMoved) {
        e.preventDefault();
        e.stopPropagation();
        hasMoved = false;
      }
    }, true);
  }
}
