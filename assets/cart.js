/* ==========================================================================
   Warenkorb: Shopify Cart-API plus Section-Rendering für den Drawer.
   Der Drawer wird vom Server gerendert (sections/cart-drawer.liquid).
   ========================================================================== */
(function () {
  var PS = window.PS;
  var SECTION = 'cart-drawer';

  function drawer() { return document.getElementById('cart-drawer'); }

  // Versandbalken: Der Drawer wird bei jedem Austausch neu gerendert, eine CSS-Transition hätte keinen Startwert.
  // Darum den alten Stand vor dem Austausch merken und danach vom alten zum neuen Wert fahren (nur transform).
  var barFrom = null; // Stand vor dem letzten Austausch, wenn der Drawer dabei zu war (läuft beim Öffnen)
  function barValue() {
    var bar = drawer() && drawer().querySelector('.progress__bar');
    return bar ? +bar.getAttribute('aria-valuenow') || 0 : 0;
  }
  function fillBar(start) {
    var bar = drawer() && drawer().querySelector('.progress__bar');
    var fill = bar && bar.firstElementChild;
    if (!fill || !PS.motion.enabled) return;
    var end = +bar.getAttribute('aria-valuenow') || 0;
    fill.style.setProperty('--p', start / 100);
    void fill.offsetWidth; // Startwert festschreiben, sonst gibt es keine Transition
    requestAnimationFrame(function () { fill.style.setProperty('--p', end / 100); });
  }

  function applySections(sections, itemCount) {
    var html = sections && sections[SECTION];
    var counter = document.querySelector('[data-cart-count]');
    var previous = counter ? +counter.dataset.count || 0 : 0;
    var before = barValue();
    var current = drawer();
    if (html) {
      var doc = new DOMParser().parseFromString(html, 'text/html');
      var fresh = doc.querySelector('dialog');
      if (fresh && current) {
        current.innerHTML = fresh.innerHTML;
        current.classList.remove('is-entering'); // Zeilen-Stagger nur beim Öffnen, nicht bei jeder Mengenänderung
        if (current.open) fillBar(before); else barFrom = before;
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

  // Drawer geht auf: Zeilen laufen gestaffelt ein (CSS, .is-entering), der Versandbalken fährt zum Stand
  PS.on('[data-cart-drawer]', function (d) {
    d.addEventListener('ps:open', function () {
      d.classList.add('is-entering');
      setTimeout(function () { d.classList.remove('is-entering'); }, 1200);
      fillBar(barFrom == null ? 0 : barFrom);
      barFrom = null;
    });
  });

  // Warenkorb-Symbol wippt, wenn Artikel dazukommen (nicht beim Verringern oder Entfernen)
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
        return cart;
      });
    }
  };

  function fail(err) { PS.toast(err.message, 'circle-alert'); }

  // Warenkorb-Seite: nach jeder Änderung den Seiteninhalt neu vom Server holen
  document.addEventListener('ps:cart', function () {
    var page = document.querySelector('[data-cart-page]');
    if (!page) return;
    fetch(window.location.pathname + '?section_id=' + encodeURIComponent(page.dataset.sectionId))
      .then(function (res) { return res.text(); })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var fresh = doc.querySelector('[data-cart-page]');
        if (fresh) page.innerHTML = fresh.innerHTML;
      });
  });

  // Menge ändern / Position entfernen (Buttons im Drawer und auf der Warenkorb-Seite)
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-cart-change]');
    if (!btn) return;
    e.preventDefault();
    btn.disabled = true;
    PS.cart.change(+btn.dataset.line, +btn.dataset.quantity).catch(fail).then(function () { btn.disabled = false; });
  });
  document.addEventListener('change', function (e) {
    var input = e.target.closest('[data-cart-qty]');
    if (!input) return;
    var qty = Math.max(0, parseInt(input.value, 10) || 0);
    PS.cart.change(+input.dataset.line, qty).catch(fail);
  });

  // Produktformulare und Schnell-Hinzufügen: Drawer öffnet sich als Rückmeldung.
  // Das Formular kann weitere Absenden-Buttons außerhalb haben (Sticky-Leiste, form="…"): alle sperren und markieren.
  document.addEventListener('submit', function (e) {
    var form = e.target.closest('form[data-product-form]');
    if (!form) return;
    e.preventDefault();
    var buttons = Array.prototype.filter.call(form.elements, function (el) { return el.type === 'submit'; });
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
        mark(false, true); // Haken bleibt kurz stehen: Rückmeldung hinter dem Drawer und nach dem Schließen
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
        // Fokus geht beim Schließen zurück: auf Touch und schmal zum „+“, am Desktop (dort ohne „+“) zur Größe
        var card = add.closest('.pcard');
        var plus = card && PS.quick && PS.quick(card, false);
        PS.openDialog('cart-drawer', plus && plus.offsetParent ? plus : add);
      })
      .catch(fail)
      .then(function () { add.disabled = false; });
  });
})();
