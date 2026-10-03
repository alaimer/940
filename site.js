/* غلاف موقع 940: تنقل بالـhash بلا إعادة تحميل، والبرنامج يبقى حيًّا داخل iframe. بلا تخزين وبلا اتصالات. */
(function () {
  'use strict';
  var root = document.documentElement;
  var stage = document.getElementById('main');
  var frame = document.getElementById('appFrame');
  var pages = document.getElementById('pages');
  var links = Array.prototype.slice.call(document.querySelectorAll('[data-route]'));
  var articles = Array.prototype.slice.call(document.querySelectorAll('.page[data-page]'));
  var menuBtn = document.getElementById('menuBtn');
  var railBtn = document.getElementById('railBtn');
  var scrim = document.getElementById('scrim');
  var mobile = window.matchMedia('(max-width: 900px)');
  var known = { home: 1, about: 1, what: 1, goal: 1, vision: 1, mission: 1, contact: 1, privacy: 1 };
  var appLoaded = false;

  function routeFromHash() {
    var r = (location.hash || '').replace(/^#\/?/, '').split(/[?&]/)[0] || 'home';
    return known[r] ? r : 'home';
  }
  function loadApp() { if (!appLoaded) { appLoaded = true; frame.src = 'app.html'; } }

  function setDrawer(open) {
    root.setAttribute('data-drawer', open ? 'open' : 'closed');
    scrim.hidden = !open;
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuBtn.setAttribute('aria-label', open ? 'إغلاق القائمة' : 'فتح القائمة');
  }
  function setRail(rail) {
    root.setAttribute('data-nav', rail ? 'rail' : 'open');
    railBtn.setAttribute('aria-expanded', rail ? 'false' : 'true');
  }

  function show(route, focus) {
    var isHome = route === 'home';
    links.forEach(function (a) {
      if (a.getAttribute('data-route') === route) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    if (isHome) loadApp();
    stage.classList.toggle('show-pages', !isHome);
    pages.hidden = isHome;
    var target = null;
    articles.forEach(function (art) {
      var on = art.getAttribute('data-page') === route;
      art.hidden = !on;
      if (on) target = art;
    });
    if (!isHome) pages.scrollTop = 0;
    // سطح المكتب: البرنامج يأخذ كامل العرض (شريط ضيق)، والصفحات تعرض القائمة كاملة
    if (!mobile.matches) setRail(isHome);
    setDrawer(false);
    if (focus) {
      if (target) target.focus({ preventScroll: true });
      else { try { frame.focus(); } catch (e) { /* لا شيء */ } }
    }
  }

  window.addEventListener('hashchange', function () { show(routeFromHash(), true); });
  // نقر رابط الصفحة الحالية لا يطلق hashchange: أغلق الدرج وحدّث العرض يدويًا
  Array.prototype.slice.call(document.querySelectorAll('.nav-list a, .brand')).forEach(function (a) {
    a.addEventListener('click', function () {
      var h = (a.getAttribute('href') || '').replace(/^#\/?/, '') || 'home';
      if ((known[h] ? h : 'home') === routeFromHash()) show(routeFromHash(), true);
    });
  });
  menuBtn.addEventListener('click', function () {
    var open = root.getAttribute('data-drawer') !== 'open';
    setDrawer(open);
    if (open) { var f = document.querySelector('.nav-list a'); if (f) f.focus(); }
  });
  scrim.addEventListener('click', function () { setDrawer(false); menuBtn.focus(); });
  railBtn.addEventListener('click', function () { setRail(root.getAttribute('data-nav') !== 'rail'); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && root.getAttribute('data-drawer') === 'open') { setDrawer(false); menuBtn.focus(); }
  });
  var onMq = function () { setDrawer(false); if (!mobile.matches) setRail(routeFromHash() === 'home'); };
  if (mobile.addEventListener) mobile.addEventListener('change', onMq); else mobile.addListener(onMq);

  // نافذة الملاحظات: لا شبكة ولا تخزين؛ الزر رابط mailto يفتح تطبيق البريد فقط
  var fbModal = document.getElementById('fbModal');
  var fbCard = fbModal.querySelector('.fb-card');
  var fbOpener = null;
  function fbOpen(opener) {
    fbOpener = opener || null;
    setDrawer(false);
    fbModal.hidden = false;
    fbCard.focus();
  }
  function fbClose() {
    fbModal.hidden = true;
    if (fbOpener && fbOpener.offsetParent !== null) fbOpener.focus();
  }
  Array.prototype.slice.call(document.querySelectorAll('[data-feedback]')).forEach(function (b) {
    b.addEventListener('click', function () { fbOpen(b); });
  });
  fbModal.addEventListener('click', function (e) {
    if (e.target === fbModal || e.target.closest('[data-fb-close]')) fbClose();
  });
  document.addEventListener('keydown', function (e) {
    if (fbModal.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); fbClose(); return; }
    if (e.key === 'Tab') {
      var f = Array.prototype.slice.call(fbModal.querySelectorAll('button,a[href]'));
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === fbCard)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  setDrawer(false);
  show(routeFromHash(), false);
})();
