/* ==========================================================================
   Power Shop – Kern: Modul-Starter, Dialoge, Tabs, Toast, Hilfsfunktionen.
   Alles Weitere (Header, Warenkorb, Suche, Seiten) hängt sich über PS.on ein.
   ========================================================================== */
(function () {
  var PS = (window.PS = window.PS || {});

  /* ---------------- Modul-Starter ----------------
     PS.on('[data-foo]', function (el) { ... }) läuft für jedes passende Element
     beim Laden, nach jedem Section-Reload im Theme-Editor und für nachgeladenes HTML
     (PS.scan(root)). Jedes Element wird pro Modul nur einmal gestartet.
     Bewegung (Reveals, Parallax, Smooth-Scroll) hängt sich aus motion.js ein. */
  var modules = [];
  PS.on = function (selector, init) {
    var mod = { selector: selector, init: init, done: new WeakSet() };
    modules.push(mod);
    if (document.readyState !== 'loading') run(mod, document);
  };
  function run(mod, root) {
    var list = [];
    if (root.matches && root.matches(mod.selector)) list.push(root);
    root.querySelectorAll(mod.selector).forEach(function (el) { list.push(el); });
    list.forEach(function (el) {
      if (mod.done.has(el)) return;
      mod.done.add(el);
      mod.init(el);
    });
  }
  PS.scan = function (root) { modules.forEach(function (mod) { run(mod, root || document); }); };
  document.addEventListener('DOMContentLoaded', function () { PS.scan(document); });
  document.addEventListener('shopify:section:load', function (e) { PS.scan(e.target); });

  /* ---------------- Hilfen ---------------- */
  PS.esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  PS.prefersReducedMotion = function () {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  };

  // Bewegung: No-op-Stub, motion.js ersetzt ihn (Vertrag dort). Fehlt es, bleiben Aufrufe harmlos.
  function noop() {}
  PS.motion = PS.motion || { enabled: false, scroll: false, add: noop, track: noop, refresh: noop };
  // Lenis lädt nach theme.js und darf den Dialog nie blockieren
  function lenis(act) { try { PS.lenis && PS.lenis[act](); } catch (e) { /* Dialog geht vor */ } }

  /* ---------------- Toast ---------------- */
  PS.toast = function (msg, icon) {
    var wrap = document.querySelector('[data-toast-wrap]');
    if (!wrap) return;
    var t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML =
      '<svg class="icon" aria-hidden="true" focusable="false"><use href="#i-' + (icon || 'circle-check') + '"></use></svg>' +
      '<span>' + PS.esc(msg) + '</span>';
    wrap.appendChild(t);
    setTimeout(function () { t.remove(); }, 3600);
  };

  /* ---------------- Dialoge (Drawer, Modal, Suche) ---------------- */
  var lastTrigger = null;
  // data-lazy-script am Dialog: das Skript dazu lädt erst beim ersten Öffnen (Suche). Schlägt es fehl, versucht es das nächste Öffnen erneut.
  // Ein Skript lädt nur einmal: nach einem Section-Reload im Theme-Editor startet PS.scan das schon registrierte Modul für den neuen Dialog.
  var lazyLoaded = {};
  function lazyScript(d) {
    var src = d.getAttribute('data-lazy-script');
    if (!src) return;
    d.removeAttribute('data-lazy-script');
    if (lazyLoaded[src]) return;
    lazyLoaded[src] = true;
    var s = document.createElement('script');
    s.src = src;
    s.onerror = function () { lazyLoaded[src] = false; d.setAttribute('data-lazy-script', src); s.remove(); };
    document.head.appendChild(s);
  }
  PS.openDialog = function (id, trigger) {
    var d = document.getElementById(id);
    if (!d) return;
    document.querySelectorAll('dialog[open]').forEach(function (o) { if (o !== d) o.close(); });
    lastTrigger = trigger || document.activeElement;
    if (!d.open) d.showModal();
    document.body.classList.add('is-locked');
    lenis('stop');
    lazyScript(d);
    d.dispatchEvent(new CustomEvent('ps:open'));
  };
  PS.closeDialog = function (id) {
    var d = document.getElementById(id);
    if (d && d.open) d.close();
  };

  document.addEventListener('click', function (e) {
    var opener = e.target.closest('[data-open]');
    if (opener) {
      e.preventDefault();
      if (opener.dataset.open === 'sizeguide' && opener.dataset.type) {
        PS.selectTab(document.getElementById('sgt-' + opener.dataset.type));
      }
      PS.openDialog(opener.dataset.open, opener);
      return;
    }
    if (e.target.closest('[data-close]')) {
      var owner = e.target.closest('dialog');
      if (owner) owner.close();
      return;
    }
    // Klick auf den Hintergrund schließt
    if (e.target.tagName === 'DIALOG') {
      var r = e.target.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) e.target.close();
    }
    var cookie = e.target.closest('[data-cookie-settings]');
    if (cookie) {
      e.preventDefault();
      showCookieSettings();
    }
  });

  // „close“ blubbert nicht – daher Capture auf document (gilt auch für später eingefügte Dialoge)
  document.addEventListener('close', function (e) {
    if (e.target.tagName !== 'DIALOG') return;
    if (!document.querySelector('dialog[open]')) {
      document.body.classList.remove('is-locked');
      lenis('start');
    }
    // preventScroll: sonst scrollt focus() die Seite wegen scroll-padding-top nach oben, wenn der Auslöser im sticky Header liegt
    if (lastTrigger && document.contains(lastTrigger) && lastTrigger.focus) lastTrigger.focus({ preventScroll: true });
  }, true);

  /* ---------------- Tabs (ARIA) ---------------- */
  PS.selectTab = function (tab) {
  // Cookie-Einstellungen öffnen. Das Cookie-Banner von Shopify bringt window.privacyBanner mit (showPreferences), die Customer Privacy API
  // (Shopify.customerPrivacy) lädt dagegen erst nach der Einwilligung. Beide sind Schnittstellen von Shopify, das Theme baut nichts nach.
  // Ist keine da (Banner aus, Skript noch nicht geladen), lädt loadFeatures die Customer Privacy API nach; scheitert auch das,
  // steht eine Rückmeldung statt eines stummen Klicks.
  function showCookieSettings() {
    var pb = window.privacyBanner;
    if (pb && typeof pb.showPreferences === 'function') { pb.showPreferences(); return; }
    function viaApi() {
      var cp = window.Shopify && window.Shopify.customerPrivacy;
      if (cp && typeof cp.showPreferences === 'function') { cp.showPreferences(); return true; }
      return false;
    }
    if (viaApi()) return;
    function fail() { PS.toast('Die Cookie-Einstellungen sind gerade nicht verfügbar. Bitte lade die Seite neu.', 'circle-alert'); }
    var S = window.Shopify;
    if (S && typeof S.loadFeatures === 'function') {
      try {
        S.loadFeatures([{ name: 'consent-tracking-api', version: '0.1' }], function (error) { if (error || !viaApi()) fail(); });
      } catch (err) { fail(); }
    } else fail();
  }

    if (!tab) return;
    var list = tab.closest('[role="tablist"]');
    var activePanel = document.getElementById(tab.getAttribute('aria-controls'));
    list.querySelectorAll('[role="tab"]').forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel && panel !== activePanel) panel.hidden = true;
    });
    if (activePanel) activePanel.hidden = false;
    list.dispatchEvent(new CustomEvent('ps:tab', { detail: tab }));
  };
  document.addEventListener('click', function (e) {
    var tab = e.target.closest('[role="tab"]');
    if (tab) PS.selectTab(tab);
  });
  document.addEventListener('keydown', function (e) {
    var tab = e.target.closest && e.target.closest('[role="tab"]');
    var keys = ['ArrowRight', 'ArrowLeft', 'Home', 'End'];
    if (!tab || keys.indexOf(e.key) < 0 || e.altKey || e.ctrlKey || e.metaKey) return;
    var tabs = Array.prototype.slice.call(tab.closest('[role="tablist"]').querySelectorAll('[role="tab"]'));
    var next;
    if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault(); // sonst scrollt die Seite nach oben/unten
      next = tabs[e.key === 'Home' ? 0 : tabs.length - 1];
    } else {
      next = tabs[(tabs.indexOf(tab) + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
    }
    next.focus();
    PS.selectTab(next);
  });

  /* ---------------- Schienen (horizontale Karussells) ---------------- */
  PS.on('.rail', function (rail) {
    var id = rail.id;
    if (!id) return;
    var prev = document.querySelector('[data-rail-prev="' + id + '"]');
    var next = document.querySelector('[data-rail-next="' + id + '"]');
    if (!prev || !next) return;
    function step() {
      var first = rail.firstElementChild;
      return first ? first.getBoundingClientRect().width + parseFloat(getComputedStyle(rail).columnGap || 0) : rail.clientWidth;
    }
    function update() {
      prev.disabled = rail.scrollLeft <= 4;
      next.disabled = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 4;
    }
    prev.addEventListener('click', function () { rail.scrollBy({ left: -step(), behavior: PS.prefersReducedMotion() ? 'auto' : 'smooth' }); });
    next.addEventListener('click', function () { rail.scrollBy({ left: step(), behavior: PS.prefersReducedMotion() ? 'auto' : 'smooth' }); });
    rail.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  });
})();
