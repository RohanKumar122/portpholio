/* Rohan Kumar · Portfolio interactions (no dependencies) */
(function () {
  'use strict';

  var root = document.documentElement;
  var EMAIL = 'rk399504@gmail.com';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Theme toggle ---------- */
  var themeBtn = document.querySelector('.theme-toggle');
  var darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

  function currentTheme() {
    return root.getAttribute('data-theme') || (darkQuery.matches ? 'dark' : 'light');
  }

  function syncThemeButton() {
    var dark = currentTheme() === 'dark';
    themeBtn.querySelector('i').className = 'bx ' + (dark ? 'bx-sun' : 'bx-moon');
    themeBtn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
  }

  if (themeBtn) {
    syncThemeButton();
    themeBtn.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) { /* storage unavailable */ }
      syncThemeButton();
    });
    if (darkQuery.addEventListener) darkQuery.addEventListener('change', syncThemeButton);
  }

  /* ---------- Mobile navigation ---------- */
  var header = document.querySelector('.site-header');
  var nav = document.getElementById('site-nav');
  var navToggle = document.querySelector('.nav-toggle');

  function setNav(open) {
    nav.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    navToggle.querySelector('i').className = 'bx ' + (open ? 'bx-x' : 'bx-menu');
  }

  navToggle.addEventListener('click', function () {
    setNav(!nav.classList.contains('is-open'));
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) setNav(false);
  });
  document.addEventListener('click', function (e) {
    if (nav.classList.contains('is-open') && !header.contains(e.target)) setNav(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      setNav(false);
      navToggle.focus();
    }
  });

  /* ---------- Header border once scrolled ---------- */
  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Highlight the nav link for the section in view ---------- */
  var navLinks = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]'));
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          var active = link.getAttribute('href') === '#' + entry.target.id;
          link.classList.toggle('is-active', active);
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    document.querySelectorAll('main > section[id]').forEach(function (section) {
      spy.observe(section);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    root.classList.add('reveal-on');
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    reveals.forEach(function (el) {
      // Stagger siblings in the same grid a little
      var index = Array.prototype.indexOf.call(el.parentNode.children, el);
      el.style.setProperty('--delay', Math.min(index, 5) * 60 + 'ms');
      revealer.observe(el);
    });
  }

  /* ---------- Years of experience (kept current automatically) ---------- */
  var start = new Date(document.body.getAttribute('data-career-start'));
  if (!isNaN(start)) {
    var years = (Date.now() - start.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    var label = (Math.floor(years * 10) / 10).toFixed(1);
    document.querySelectorAll('[data-years]').forEach(function (el) {
      el.textContent = label;
    });
  }

  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Certificate filters ---------- */
  var filters = Array.prototype.slice.call(document.querySelectorAll('.filter'));
  var certs = Array.prototype.slice.call(document.querySelectorAll('.cert'));

  filters.forEach(function (btn) {
    var key = btn.getAttribute('data-filter');
    var matches = function (cert) {
      return key === 'all' || cert.getAttribute('data-category') === key;
    };
    var count = btn.querySelector('.count');
    if (count) count.textContent = certs.filter(matches).length;

    btn.addEventListener('click', function () {
      filters.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
      certs.forEach(function (cert) { cert.hidden = !matches(cert); });
    });
  });

  /* ---------- Certificate viewer ---------- */
  var dialog = document.getElementById('lightbox');
  if (dialog && typeof dialog.showModal === 'function') {
    var lbImg = dialog.querySelector('figure img');
    var lbTitle = dialog.querySelector('figcaption strong');
    var lbMeta = dialog.querySelector('figcaption span');
    var visible = [];
    var current = 0;

    var show = function (i) {
      current = (i + visible.length) % visible.length;
      var card = visible[current];
      lbImg.src = card.getAttribute('href');
      lbImg.alt = card.querySelector('img').alt;
      lbTitle.textContent = card.querySelector('.cert-title').textContent;
      lbMeta.textContent = card.querySelector('.cert-meta').textContent;
    };

    document.querySelectorAll('.cert-card').forEach(function (card) {
      card.addEventListener('click', function (e) {
        e.preventDefault();
        visible = Array.prototype.slice.call(document.querySelectorAll('.cert:not([hidden]) .cert-card'));
        show(visible.indexOf(card));
        dialog.showModal();
      });
    });

    dialog.querySelector('.prev').addEventListener('click', function () { show(current - 1); });
    dialog.querySelector('.next').addEventListener('click', function () { show(current + 1); });
    dialog.querySelector('.lightbox-close').addEventListener('click', function () { dialog.close(); });
    dialog.addEventListener('click', function (e) {
      // Clicking anywhere outside the image, caption or buttons closes the viewer
      if (!e.target.closest('img, figcaption, button')) dialog.close();
    });
    dialog.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });
  }

  /* ---------- Copy email ---------- */
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!navigator.clipboard) {
        window.location.href = 'mailto:' + EMAIL;
        return;
      }
      navigator.clipboard.writeText(btn.getAttribute('data-copy')).then(function () {
        var icon = btn.querySelector('i');
        btn.classList.add('is-copied');
        btn.setAttribute('aria-label', 'Email address copied');
        icon.className = 'bx bx-check';
        setTimeout(function () {
          btn.classList.remove('is-copied');
          btn.setAttribute('aria-label', 'Copy email address');
          icon.className = 'bx bx-copy';
        }, 1800);
      });
    });
  });

  /* ---------- Contact form: compose an email (GitHub Pages has no backend) ---------- */
  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var body = data.get('body') + '\n\n— ' + data.get('name') + ' (' + data.get('email') + ')';
      window.location.href = 'mailto:' + EMAIL +
        '?subject=' + encodeURIComponent(data.get('subject')) +
        '&body=' + encodeURIComponent(body);
      form.querySelector('.form-status').textContent =
        'Opening your email app… If nothing happens, email me directly at ' + EMAIL + '.';
    });
  }
})();
