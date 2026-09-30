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
     Hier hängen später auch Motion- und Parallax-Module ein. */
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
  PS.openDialog = function (id, trigger) {
    var d = document.getElementById(id);
    if (!d) return;
    document.querySelectorAll('dialog[open]').forEach(function (o) { if (o !== d) o.close(); });
    lastTrigger = trigger || document.activeElement;
    if (!d.open) d.showModal();
    document.body.classList.add('is-locked');
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
      var cp = window.Shopify && window.Shopify.customerPrivacy;
      if (cp && typeof cp.showPreferences === 'function') cp.showPreferences();
    }
  });

  // „close“ blubbert nicht – daher Capture auf document (gilt auch für später eingefügte Dialoge)
  document.addEventListener('close', function (e) {
    if (e.target.tagName !== 'DIALOG') return;
    if (!document.querySelector('dialog[open]')) document.body.classList.remove('is-locked');
    if (lastTrigger && document.contains(lastTrigger) && lastTrigger.focus) lastTrigger.focus();
  }, true);

  /* ---------------- Tabs (ARIA) ---------------- */
  PS.selectTab = function (tab) {
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
    if (!tab || (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft')) return;
    var tabs = Array.prototype.slice.call(tab.closest('[role="tablist"]').querySelectorAll('[role="tab"]'));
    var next = tabs[(tabs.indexOf(tab) + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
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
