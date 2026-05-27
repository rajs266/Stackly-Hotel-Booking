/**
 * Stackly Hotel — Vanilla JS app (components + interactions + 404 guard)
 */
(function () {
  'use strict';

  /* ── Config ─────────────────────────────────────────────── */
  const VALID_PAGES = new Set([
    'index.html',
    'rooms.html',
    'booking.html',
    'services.html',
    'blog.html',
    'about.html',
    'contact.html',
    '404.html',
    'login.html',
    'signup.html',
    'dashboard-guest.html',
    'dashboard-staff.html'
  ]);

  const StacklyApp = {
    guestCount: 2,
    overlayOpen: false,
    viewers: 54
  };

  /* ── Utilities ──────────────────────────────────────────── */
  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function $$(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  }

  function formatDateParts(iso) {
    if (!iso) return { day: '—', month: '—', year: '—' };
    const d = new Date(iso + 'T12:00:00');
    const y = d.getFullYear();
    const shortYear =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(max-width: 768px)').matches;
    return {
      day: String(d.getDate()).padStart(2, '0'),
      month: d.toLocaleString('en-US', { month: 'short' }),
      year: shortYear ? String(y).slice(-2) : String(y)
    };
  }

  function fmtISO(d) {
    return d.toISOString().split('T')[0];
  }

  function showToast(message, type) {
    const container = $('#toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast toast--' + (type || 'info');
    toast.textContent = message;
    container.appendChild(toast);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        toast.classList.add('show');
      });
    });
    setTimeout(function () {
      toast.classList.remove('show');
      setTimeout(function () {
        toast.remove();
      }, 400);
    }, 3500);
  }

  /* ── 404 redirect (broken / placeholder links) ─────────── */
  function init404Guard() {
    document.addEventListener('click', function (e) {
      const a = e.target.closest('a[href]');
      if (!a) return;
      const href = (a.getAttribute('href') || '').trim();
      if (
        !href ||
        href === '#' ||
        href.startsWith('javascript:') ||
        href.startsWith('http') ||
        href.startsWith('tel:') ||
        href.startsWith('mailto:')
      ) {
        if (href === '#' || href === '') {
          e.preventDefault();
          window.location.href = '404.html';
        }
        return;
      }
      const base = href.split('?')[0].split('#')[0];
      if (base && !VALID_PAGES.has(base)) {
        e.preventDefault();
        window.location.href = '404.html';
      }
    });
  }

  /* ── Page loader ───────────────────────────────────────── */
  function initLoader() {
    const loader = $('#pageLoader');
    if (!loader) return;
    window.addEventListener('load', function () {
      setTimeout(function () {
        loader.classList.add('loaded');
      }, 280);
    });
  }

  /* ── Scroll: progress, navbar, back-to-top ─────────────── */
  function initScroll() {
    const progressBar = $('#scrollProgress');
    const navbar = $('#navbar');
    const backToTop = $('#backToTop');
    let ticking = false;

    function onScroll() {
      const scrollTop = window.scrollY;
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      if (progressBar && docH > 0) {
        progressBar.style.width = ((scrollTop / docH) * 100).toFixed(2) + '%';
      }
      if (navbar) {
        if (navbar.classList.contains('navbar--static')) return;
        if (scrollTop > 60) {
          navbar.classList.remove('transparent');
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.add('transparent');
          navbar.classList.remove('scrolled');
        }
      }
      if (backToTop) {
        backToTop.classList.toggle('visible', scrollTop > 400);
      }
    }

    window.addEventListener(
      'scroll',
      function () {
        if (!ticking) {
          requestAnimationFrame(function () {
            onScroll();
            ticking = false;
          });
          ticking = true;
        }
      },
      { passive: true }
    );
    onScroll();
    if (backToTop) {
      backToTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  /* ── Mobile nav overlay ─────────────────────────────────── */
  function initNavOverlay() {
    const burgerBtn = $('#burgerBtn');
    const navOverlay = $('#navOverlay');
    if (!burgerBtn || !navOverlay) return;

    // Build overlay content if empty (first load)
    if (!navOverlay.querySelector('.nav-overlay__header')) {
      navOverlay.setAttribute('role', 'dialog');
      navOverlay.setAttribute('aria-modal', 'true');
      navOverlay.setAttribute('aria-label', 'Navigation menu');
      navOverlay.innerHTML =
        '<div class="nav-overlay__header">' +
        '<button type="button" class="nav-overlay__close" id="overlayCloseBtn" aria-label="Close menu">' +
        '<span></span><span></span><span></span>' +
        '</button>' +
        '<a href="index.html" class="nav-overlay__brand">' +
        '<img src="assets/logo.webp" alt="Stackly" width="130" height="42" />' +
        '</a>' +
        '</div>' +
        '<nav>' +
        '<ul class="nav-overlay__list">' +
        '<li class="nav-overlay__item"><a href="index.html" class="nav-overlay__link">Home <span>01</span></a></li>' +
        '<li class="nav-overlay__item"><a href="rooms.html" class="nav-overlay__link">Rooms <span>02</span></a></li>' +
        '<li class="nav-overlay__item"><a href="services.html" class="nav-overlay__link">Services <span>03</span></a></li>' +
        '<li class="nav-overlay__item"><a href="blog.html" class="nav-overlay__link">Blog <span>04</span></a></li>' +
        '<li class="nav-overlay__item"><a href="about.html" class="nav-overlay__link">About <span>05</span></a></li>' +
        '<li class="nav-overlay__item"><a href="contact.html" class="nav-overlay__link">Contact <span>06</span></a></li>' +
        '</ul>' +
        '</nav>' +
        '<div class="nav-overlay__footer">' +
        '<a href="booking.html" class="btn btn--primary">Book Now</a>' +
        '</div>';
    }

    function toggleOverlay(force) {
      StacklyApp.overlayOpen =
        typeof force === 'boolean' ? force : !StacklyApp.overlayOpen;
      burgerBtn.classList.toggle('open', StacklyApp.overlayOpen);
      navOverlay.classList.toggle('open', StacklyApp.overlayOpen);
      burgerBtn.setAttribute('aria-expanded', StacklyApp.overlayOpen);
      document.body.classList.toggle('nav-menu-open', StacklyApp.overlayOpen);
      document.body.style.overflow = StacklyApp.overlayOpen ? 'hidden' : '';
    }

    burgerBtn.addEventListener('click', function () {
      toggleOverlay();
    });

    var overlayCloseBtn = $('#overlayCloseBtn');
    if (overlayCloseBtn) {
      overlayCloseBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleOverlay(false);
      });
    }

    // Close overlay when any nav link or header logo is clicked
    $$('.nav-overlay__link, .nav-overlay__brand', navOverlay).forEach(function (link) {
      link.addEventListener('click', function () {
        toggleOverlay(false);
      });
    });

    // Close overlay on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && StacklyApp.overlayOpen) toggleOverlay(false);
    });

    // Close overlay when clicking outside the menu content
    navOverlay.addEventListener('click', function (e) {
      if (e.target === navOverlay) {
        toggleOverlay(false);
      }
    });

    // Reset overlay when switching to desktop
    window.addEventListener('resize', function() {
      if (window.innerWidth > 1024 && StacklyApp.overlayOpen) {
        toggleOverlay(false);
      }
    });
  }

  /* ── Scroll-triggered animations ────────────────────────── */
  function initScrollAnimations() {
    const animEls = $$('.fade-up, .fade-left, .fade-right, .fade-in, .slide-in');
    if (!animEls.length) return;
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -32px 0px' }
    );
    animEls.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ── Hero slideshow ─────────────────────────────────────── */
  function initHeroSlideshow() {
    const slides = $$('.hero-slideshow__slide');
    if (slides.length < 2) return;
    let i = 0;
    setInterval(function () {
      slides[i].classList.remove('active');
      i = (i + 1) % slides.length;
      slides[i].classList.add('active');
    }, 5000);
  }

  function initPromoSlider() {
    const slider = $('[data-promo-slider]');
    if (!slider) return;
    const slides = $$('.promo-card__img', slider);
    const dots = $$('.promo-dot', slider);
    if (slides.length < 2 || !dots.length) return;
    let current = 0;
    let timer;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function restart() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(current + 1);
      }, 3600);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function (e) {
        e.stopPropagation();
        show(i);
        restart();
      });
    });
    restart();
  }

  /* ── Hero booking dates & guests ──────────────────────── */
  function initHeroBooking() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const ciInput = $('#heroCheckin');
    const coInput = $('#heroCheckout');
    const ciDay = $('#heroCheckinDay');
    const ciMonth = $('#heroCheckinMonth');
    const ciYear = $('#heroCheckinYear');
    const coDay = $('#heroCheckoutDay');
    const coMonth = $('#heroCheckoutMonth');
    const coYear = $('#heroCheckoutYear');
    const openCi = $('#openHeroCheckin');
    const openCo = $('#openHeroCheckout');
    const guestVal = $('#heroGuestVal');
    const guestHidden = $('#heroGuests');

    function syncCheckin() {
      if (!ciInput) return;
      const p = formatDateParts(ciInput.value);
      if (ciDay) ciDay.textContent = p.day;
      if (ciMonth) ciMonth.textContent = p.month;
      if (ciYear) ciYear.textContent = p.year;
    }

    function syncCheckout() {
      if (!coInput) return;
      const p = formatDateParts(coInput.value);
      if (coDay) coDay.textContent = p.day;
      if (coMonth) coMonth.textContent = p.month;
      if (coYear) coYear.textContent = p.year;
    }

    if (ciInput) {
      ciInput.value = fmtISO(today);
      ciInput.min = fmtISO(today);
      syncCheckin();
      ciInput.addEventListener('change', function () {
        syncCheckin();
        const min = new Date(ciInput.value + 'T12:00:00');
        min.setDate(min.getDate() + 1);
        if (coInput) {
          coInput.min = fmtISO(min);
          if (coInput.value <= ciInput.value) {
            coInput.value = fmtISO(min);
            syncCheckout();
          }
        }
      });
    }

    if (coInput) {
      coInput.value = fmtISO(tomorrow);
      coInput.min = fmtISO(tomorrow);
      syncCheckout();
      coInput.addEventListener('change', syncCheckout);
    }

    if (openCi && ciInput) {
      openCi.addEventListener('click', function () {
        if (ciInput.showPicker) ciInput.showPicker();
        else ciInput.focus();
      });
    }
    if (openCo && coInput) {
      openCo.addEventListener('click', function () {
        if (coInput.showPicker) coInput.showPicker();
        else coInput.focus();
      });
    }

    if (window.matchMedia) {
      var mq = window.matchMedia('(max-width: 768px)');
      var onMq = function () {
        syncCheckin();
        syncCheckout();
      };
      if (mq.addEventListener) mq.addEventListener('change', onMq);
      else if (mq.addListener) mq.addListener(onMq);
    }

    function updateGuests() {
      const n = StacklyApp.guestCount;
      if (guestVal) guestVal.textContent = n;
      if (guestHidden) guestHidden.value = n;
    }

    const minus = $('#heroGuestMinus');
    const plus = $('#heroGuestPlus');
    if (minus) {
      minus.addEventListener('click', function () {
        if (StacklyApp.guestCount > 1) {
          StacklyApp.guestCount--;
          updateGuests();
        }
      });
    }
    if (plus) {
      plus.addEventListener('click', function () {
        if (StacklyApp.guestCount < 10) {
          StacklyApp.guestCount++;
          updateGuests();
        }
      });
    }
    updateGuests();
  }

  /* ── Standard booking bar (if present) ──────────────────── */
  function initBookingBar() {
    const ciEl = $('#checkin');
    const coEl = $('#checkout');
    if (!ciEl) return;

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    ciEl.value = fmtISO(today);
    ciEl.min = fmtISO(today);
    coEl.value = fmtISO(tomorrow);
    coEl.min = fmtISO(tomorrow);

    const guestVal = $('#guestVal');
    const guestPlus = $('#guestPlus');
    const guestMinus = $('#guestMinus');
    let count = 2;

    function updateGuest() {
      if (guestVal) {
        guestVal.textContent = count + (count === 1 ? ' Guest' : ' Guests');
      }
    }

    if (guestPlus) {
      guestPlus.addEventListener('click', function () {
        if (count < 10) {
          count++;
          updateGuest();
        }
      });
    }
    if (guestMinus) {
      guestMinus.addEventListener('click', function () {
        if (count > 1) {
          count--;
          updateGuest();
        }
      });
    }
    updateGuest();

    ciEl.addEventListener('change', function () {
      const min = new Date(ciEl.value);
      min.setDate(min.getDate() + 1);
      coEl.min = fmtISO(min);
      if (coEl.value <= ciEl.value) coEl.value = fmtISO(min);
    });
  }

  /* ── Room tabs ──────────────────────────────────────────── */
  function initRoomTabs() {
    const tabBtns = $$('.tab-btn');
    const roomCards = $$('#roomsGrid .room-card, #roomsGrid .room-tile');
    if (!tabBtns.length) return;

    tabBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        tabBtns.forEach(function (b) {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        const filter = btn.dataset.tab;
        roomCards.forEach(function (card) {
          const match = filter === 'all' || card.dataset.category === filter;
          card.style.display = match ? '' : 'none';
        });
      });
    });
  }

  /* ── Wishlist ───────────────────────────────────────────── */
  function initWishlist() {
    $$('.room-card__wishlist').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const active = btn.classList.toggle('active');
        btn.textContent = active ? '♥' : '♡';
        btn.setAttribute('aria-pressed', active);
        showToast(
          active ? 'Added to wishlist' : 'Removed from wishlist',
          active ? 'success' : 'info'
        );
      });
    });
  }

  /* ── Urgency ticker ─────────────────────────────────────── */
  function initTicker() {
    const ticker = $('#urgencyTicker');
    const tickerClose = $('#tickerClose');
    const tickerCount = $('#tickerCount');
    if (ticker) {
      ticker.addEventListener('click', function (e) {
        if (tickerClose && (e.target === tickerClose || tickerClose.contains(e.target))) return;
        window.location.href = '404.html';
      });
      ticker.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          window.location.href = '404.html';
        }
      });
    }
    if (tickerClose && ticker) {
      tickerClose.addEventListener('click', function (e) {
        e.stopPropagation();
        ticker.style.display = 'none';
      });
    }
    if (tickerCount) {
      setInterval(function () {
        const delta = Math.floor(Math.random() * 5) - 2;
        StacklyApp.viewers = Math.max(30, Math.min(99, StacklyApp.viewers + delta));
        tickerCount.textContent = StacklyApp.viewers + ' people viewing now';
      }, 4000);
    }
  }

  /* ── Forms ──────────────────────────────────────────────── */
  function initForms() {
    const contactSubmit = $('#contactSubmit');
    if (contactSubmit) {
      contactSubmit.addEventListener('click', function () {
        const name = ($('#contactName') || {}).value || '';
        const email = ($('#contactEmail') || {}).value || '';
        const msg = ($('#contactMsg') || {}).value || '';
        if (!name.trim() || !email.trim() || !msg.trim()) {
          showToast('Please fill in all fields.', 'error');
          return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          showToast('Please enter a valid email.', 'error');
          return;
        }
        // Successful submit should redirect to 404 page (no popup/toast).
        window.location.href = '404.html';
        return;
      });
    }

    const newsletterSubmit = $('#newsletterSubmit');
    if (newsletterSubmit) {
      newsletterSubmit.addEventListener('click', function () {
        const emailEl = $('#newsletterEmail');
        const email = emailEl ? emailEl.value.trim() : '';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          showToast('Please enter a valid email.', 'error');
          return;
        }
        // Successful subscribe should redirect to 404 page (no popup/toast).
        window.location.href = '404.html';
        return;
      });
    }
  }

  /* ── Counter animation (Elementor-style) ────────────────── */
  function initCounters() {
    const counters = $$('[data-counter]');
    if (!counters.length) return;
    const obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = parseInt(el.dataset.counter, 10) || 0;
          const duration = 1800;
          const start = performance.now();
          function step(now) {
            const t = Math.min((now - start) / duration, 1);
            const ease = 1 - Math.pow(1 - t, 3);
            el.textContent = Math.floor(ease * target) + (el.dataset.suffix || '');
            if (t < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
          obs.unobserve(el);
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach(function (c) {
      obs.observe(c);
    });
  }

  /* ── Auth nav (Sign in / Get started / Dashboard) ─────── */
  function initAuthNav() {
    var guestBtns = $('#navAuthGuest');
    var userBox = $('#navAuthUser');
    if (userBox) {
      userBox.classList.remove('visible');
      userBox.style.display = 'none';
    }
    if (guestBtns) {
      guestBtns.style.display = '';
      if (!guestBtns.querySelector('a[href="booking.html"]')) {
        var bookLink = document.createElement('a');
        bookLink.href = 'booking.html';
        bookLink.className = 'btn btn--primary btn--sm';
        bookLink.textContent = 'Book Now';
        guestBtns.appendChild(bookLink);
      }
    }

    var overlayAuth = $('#overlayAuthLinks');
    if (overlayAuth) {
      overlayAuth.remove();
    }
  }

  /* ── Stagger + scale observers ──────────────────────────── */
  function initExtraAnimations() {
    var stagger = $$('.stagger-children, .scale-in');
    if (!stagger.length) return;
    var obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    stagger.forEach(function (el) {
      obs.observe(el);
    });
  }

  /* ── Boot ───────────────────────────────────────────────── */
  function init() {
    init404Guard();
    initLoader();
    initScroll();
    initNavOverlay();
    initScrollAnimations();
    initExtraAnimations();
    initHeroSlideshow();
    initPromoSlider();
    initHeroBooking();
    initBookingBar();
    initRoomTabs();
    initWishlist();
    initTicker();
    initForms();
    initCounters();
    initAuthNav();
    var nav = $('#navbar');
    if (nav && nav.classList.contains('transparent')) {
      nav.classList.add('animate-in');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.StacklyApp = StacklyApp;
  window.StacklyToast = showToast;
})();
