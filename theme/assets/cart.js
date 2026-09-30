/* ==========================================================================
   Warenkorb: Shopify Cart-API plus Section-Rendering für den Drawer.
   Der Drawer wird vom Server gerendert (sections/cart-drawer.liquid).
   ========================================================================== */
(function () {
  var PS = window.PS;
  var SECTION = 'cart-drawer';

  function drawer() { return document.getElementById('cart-drawer'); }

  function applySections(sections, itemCount) {
    var html = sections && sections[SECTION];
    if (html) {
      var doc = new DOMParser().parseFromString(html, 'text/html');
      var fresh = doc.querySelector('dialog');
      var current = drawer();
      if (fresh && current) current.innerHTML = fresh.innerHTML;
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
    document.dispatchEvent(new CustomEvent('ps:cart'));
  }

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

  // Produktformulare und Schnell-Hinzufügen: Drawer öffnet sich als Rückmeldung
  document.addEventListener('submit', function (e) {
    var form = e.target.closest('form[data-product-form]');
    if (!form) return;
    e.preventDefault();
    var submit = form.querySelector('[type="submit"]');
    if (submit) submit.disabled = true;
    PS.cart.add(new FormData(form))
      .then(function () { PS.openDialog('cart-drawer', submit); })
      .catch(fail)
      .then(function () { if (submit) submit.disabled = false; });
  });
  document.addEventListener('click', function (e) {
    var add = e.target.closest('[data-add-variant]');
    if (!add) return;
    e.preventDefault();
    add.disabled = true;
    PS.cart.add([{ id: +add.dataset.addVariant, quantity: 1 }])
      .then(function () {
        var card = add.closest('.pcard');
        if (card) card.classList.remove('is-quick-open');
        PS.openDialog('cart-drawer', add);
      })
      .catch(fail)
      .then(function () { add.disabled = false; });
  });
})();
