/* ==========================================================================
   Warenkorb: Shopify Cart-API plus Section-Rendering für den Drawer.
   Der Drawer wird vom Server gerendert (sections/cart-drawer.liquid).
   ========================================================================== */
(function () {
  var PS = window.PS;
  var SECTION = 'cart-drawer';

  function drawer() { return document.getElementById('cart-drawer'); }

  // Versandbalken: Der Drawer wird bei jedem Austausch neu gerendert (keine Transition ohne Startwert): alten Stand merken,
  // danach vom alten zum neuen Wert fahren. War der Drawer dabei zu, läuft es beim Öffnen (barFrom).
  var barFrom = null;
  function bar() { var d = drawer(); return d && d.querySelector('.progress__bar'); }
  function fillBar(start) {
    var b = bar(), fill = b && b.firstElementChild;
    if (!fill || !PS.motion.enabled) return;
    fill.style.setProperty('--p', start / 100);
    void fill.offsetWidth; // Startwert festschreiben
    requestAnimationFrame(function () { fill.style.setProperty('--p', (+b.getAttribute('aria-valuenow') || 0) / 100); });
  }

  // Fokus: der bediente Knopf wird mit dem HTML ersetzt. Danach zurück auf den gleichen (Zeile + Beschriftung), sonst auf „Schließen“.
  var spot;
  function remember(el) { spot = [el.dataset.line, el.getAttribute('aria-label')]; }
  function restore(box) {
    var s = spot;
    spot = null;
    var el = s && ([].filter.call(box.querySelectorAll('[data-line]'), function (e) { return e.dataset.line === s[0] && e.getAttribute('aria-label') === s[1]; })[0] || box.querySelector('[data-close],a.btn,button'));
    if (el) el.focus({ preventScroll: true });
  }

  // Statusmeldung (4.1.3): eigene Live-Region außerhalb des Drawers. Dessen Inhalt wird bei jeder Änderung ersetzt, eine mit
  // ersetzte Region würde nicht verlässlich gelesen. Die Region entsteht beim Start, damit sie vor der ersten Meldung schon im Baum steht.
  var live;
  function liveRegion() {
    if (live || !document.body) return live;
    live = document.createElement('div');
    live.className = 'sr-only';
    live.setAttribute('role', 'status');
    live.setAttribute('aria-live', 'polite');
    live.setAttribute('aria-atomic', 'true');
    document.body.appendChild(live);
    return live;
  }
  function announce(text) {
    var region = liveRegion();
    if (!region) return;
    region.textContent = '';
    setTimeout(function () { region.textContent = text; }, 60); // leeren, dann füllen: gleiche Meldungen werden erneut gelesen
  }
  // Nach Mengenänderung oder Entfernen: Stückzahl und Zwischensumme (Text aus dem frisch gerenderten Drawer, schon formatiert)
  function announceCart(cart) {
    var count = cart && cart.item_count;
    if (typeof count !== 'number') return;
    var d = drawer();
    var sub = d && d.querySelector('.subtotal strong');
    announce(count > 0
      ? 'Warenkorb aktualisiert: ' + (count === 1 ? '1 Artikel' : count + ' Artikel') + (sub ? ', Zwischensumme ' + sub.textContent.replace(/\s+/g, ' ').trim() : '') + '.'
      : 'Warenkorb aktualisiert: leer.');
  }
  if (document.body) liveRegion(); else document.addEventListener('DOMContentLoaded', liveRegion, { once: true });

  function applySections(sections, itemCount) {
    var html = sections && sections[SECTION];
    var counter = document.querySelector('[data-cart-count]');
    var previous = counter ? +counter.dataset.count || 0 : 0;
    var d = drawer(), b = bar(), before = b ? +b.getAttribute('aria-valuenow') || 0 : 0;
    if (html) {
      var fresh = new DOMParser().parseFromString(html, 'text/html').querySelector('dialog');
      if (fresh && d) {
        d.innerHTML = fresh.innerHTML;
        d.classList.remove('is-entering'); // Zeilen-Stagger nur beim Öffnen, nicht bei jeder Mengenänderung
        if (d.open) { fillBar(before); restore(d); } else barFrom = before;
      }
    }
    if (typeof itemCount === 'number') {
      document.querySelectorAll('[data-cart-count]').forEach(function (el) {
        el.textContent = itemCount || '';
        el.dataset.count = itemCount;
      });
      document.querySelectorAll('[data-cart-trigger]').forEach(function (el) {
        el.setAttribute('aria-label', 'Warenkorb, ' + itemCount + ' Artikel');
      });
    }
    document.dispatchEvent(new CustomEvent('ps:cart', { detail: { count: typeof itemCount === 'number' ? itemCount : previous, previous: previous } }));
  }

  // Öffnen: Zeilen laufen gestaffelt ein (CSS .is-entering), der Balken fährt zum Stand
  PS.on('[data-cart-drawer]', function (d) {
    d.addEventListener('ps:open', function () {
      d.classList.add('is-entering');
      setTimeout(function () { d.classList.remove('is-entering'); }, 1200);
      fillBar(barFrom || 0);
      barFrom = null;
    });
  });

  // Symbol wippt nur bei Zunahme
  document.addEventListener('ps:cart', function (e) {
    var d = e.detail;
    if (!d || !(d.count > d.previous) || !PS.motion.enabled) return;
    document.querySelectorAll('[data-cart-trigger]').forEach(function (el) {
      el.classList.remove('is-bump');
      void el.offsetWidth;
      el.classList.add('is-bump');
      setTimeout(function () { el.classList.remove('is-bump'); }, 700);
    });
  });

  function request(url, options) {
    return fetch(url, options).then(function (res) {
      return res.json().then(function (data) {
        if (!res.ok) throw new Error(data.description || data.message || 'Der Warenkorb konnte nicht aktualisiert werden.');
        return data;
      });
    });
  }

  function refresh() {
    return fetch(PS.routes.root + '?sections=' + SECTION)
      .then(function (res) { return res.json(); })
      .then(function (sections) { applySections(sections); });
  }

  PS.cart = {
    refresh: refresh,

    /* items: [{ id: variantId, quantity: n, properties: {...} }] oder FormData */
    add: function (payload) {
      var body;
      var headers = { Accept: 'application/json' };
      if (payload instanceof FormData) {
        payload.append('sections', SECTION);
        payload.append('sections_url', window.location.pathname);
        body = payload;
      } else {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify({ items: payload, sections: SECTION, sections_url: window.location.pathname });
      }
      return request(PS.routes.cartAdd + '.js', { method: 'POST', headers: headers, body: body })
        .then(function (data) {
          return fetch('/cart.js').then(function (r) { return r.json(); }).then(function (cart) {
            applySections(data.sections, cart.item_count);
            return cart;
          });
        });
    },

    change: function (line, quantity) {
      return request(PS.routes.cartChange + '.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ line: line, quantity: quantity, sections: SECTION, sections_url: window.location.pathname })
      }).then(function (cart) {
        applySections(cart.sections, cart.item_count);
        announceCart(cart);
        return cart;
      });
    }
  };

  // Eigene und API-Meldungen (Error) bleiben stehen. Netzwerkfehler (TypeError: „Failed to fetch“) oder ein ungültiges Antwortformat
  // (SyntaxError) zeigen einen deutschen Satz statt der rohen Browsermeldung.
  function fail(err) {
    var own = err && err.name === 'Error' && err.message;
    PS.toast(own ? err.message : 'Das hat nicht geklappt. Bitte versuch es noch einmal.', 'circle-alert');
  }

  // Warenkorb-Seite: nach jeder Änderung den Seiteninhalt neu vom Server holen
  document.addEventListener('ps:cart', function () {
    var page = document.querySelector('[data-cart-page]');
    if (!page) return;
    fetch(window.location.pathname + '?section_id=' + encodeURIComponent(page.dataset.sectionId))
      .then(function (res) { return res.text(); })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var fresh = doc.querySelector('[data-cart-page]');
        if (fresh) { page.innerHTML = fresh.innerHTML; restore(page); }
      });
  });

  // Menge ändern / Position entfernen (Buttons im Drawer und auf der Warenkorb-Seite)
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-cart-change]');
    if (!btn) return;
    e.preventDefault();
    remember(btn);
    btn.disabled = true;
    PS.cart.change(+btn.dataset.line, +btn.dataset.quantity).catch(fail).then(function () { btn.disabled = false; });
  });
  document.addEventListener('change', function (e) {
    var input = e.target.closest('[data-cart-qty]');
    if (!input) return;
    var qty = Math.max(0, parseInt(input.value, 10) || 0);
    if (document.activeElement === input) remember(input); // nicht beim Wegtabben
    PS.cart.change(+input.dataset.line, qty).catch(fail);
  });

  // Produktformulare und Schnell-Hinzufügen: Drawer öffnet sich als Rückmeldung. Auch Buttons außerhalb (form="…", Sticky-Leiste) sperren
  document.addEventListener('submit', function (e) {
    var form = e.target.closest('form[data-product-form]');
    if (!form) return;
    e.preventDefault();
    var buttons = [].filter.call(form.elements, function (el) { return el.type === 'submit'; });
    var submit = e.submitter || buttons[0];
    function mark(busy, added) {
      buttons.forEach(function (b) {
        b.disabled = busy;
        b.classList.toggle('is-busy', busy);
        b.classList.toggle('is-added', added);
      });
    }
    mark(true, false);
    PS.cart.add(new FormData(form))
      .then(function () {
        mark(false, true);
        setTimeout(function () { mark(false, false); }, 1400);
        PS.openDialog('cart-drawer', submit);
      })
      .catch(function (err) { mark(false, false); fail(err); });
  });
  document.addEventListener('click', function (e) {
    var add = e.target.closest('[data-add-variant]');
    if (!add) return;
    e.preventDefault();
    add.disabled = true;
    PS.cart.add([{ id: +add.dataset.addVariant, quantity: 1 }])
      .then(function () {
        // Fokusrückgabe: „+“ (Touch, schmal), am Desktop (kein „+“) die Größe
        var card = add.closest('.pcard');
        var plus = card && PS.quick && PS.quick(card, false);
        PS.openDialog('cart-drawer', plus && plus.offsetParent ? plus : add);
      })
      .catch(fail)
      .then(function () { add.disabled = false; });
  });
})();
