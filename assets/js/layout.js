/* ==========================================================================
   Layout: Header, Megamenüs, Suche, Mobile-Menü, Warenkorb/Merkliste,
   Größentabelle, Footer, Cookie-Banner, Toast – auf jeder Seite gleich.
   ========================================================================== */
(function () {
  var I = PS.icon, esc = PS.esc, shop = PS.shop;
  var params = new URLSearchParams(location.search);

  /* ---------------- Speicher (localStorage immer abgesichert) ---------------- */
  function load(key, fallback) {
    try { var v = JSON.parse(localStorage.getItem('ps-' + key)); return v == null ? fallback : v; } catch (e) { return fallback; }
  }
  function save(key, val) { try { localStorage.setItem('ps-' + key, JSON.stringify(val)); } catch (e) { /* z. B. privater Modus */ } }
  function emit(name) { document.dispatchEvent(new CustomEvent(name)); }

  PS.store = {
    cart: load('cart', []),
    wish: load('wish', []),
    recent: load('recent', []),
    addToCart: function (id, size, qty) {
      var line = this.cart.find(function (l) { return l.id === id && l.size === (size || null); });
      if (line) line.qty += qty || 1; else this.cart.push({ id: id, size: size || null, qty: qty || 1 });
      save('cart', this.cart); emit('ps:cart');
    },
    setQty: function (i, qty) {
      if (qty < 1) this.cart.splice(i, 1); else this.cart[i].qty = Math.min(qty, 9);
      save('cart', this.cart); emit('ps:cart');
    },
    cartCount: function () { return this.cart.reduce(function (n, l) { return n + l.qty; }, 0); },
    cartTotal: function () { return this.cart.reduce(function (s, l) { var p = PS.findProduct(l.id); return s + (p ? p.price * l.qty : 0); }, 0); },
    isWished: function (id) { return this.wish.indexOf(id) > -1; },
    toggleWish: function (id) {
      var i = this.wish.indexOf(id);
      if (i > -1) this.wish.splice(i, 1); else this.wish.push(id);
      save('wish', this.wish); emit('ps:wish');
      return i === -1;
    },
    addRecent: function (id) {
      this.recent = [id].concat(this.recent.filter(function (r) { return r !== id; })).slice(0, 8);
      save('recent', this.recent);
    },
    consent: load('consent', null),
    setConsent: function (c) { this.consent = c; save('consent', c); },
  };

  /* ---------------- Toast ---------------- */
  var toastWrap = document.createElement('div');
  toastWrap.className = 'toast-wrap';
  toastWrap.setAttribute('role', 'status');
  toastWrap.setAttribute('aria-live', 'polite');
  document.body.appendChild(toastWrap);
  PS.toast = function (msg, icon) {
    var t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = I(icon || 'circle-check') + '<span>' + msg + '</span>';
    toastWrap.appendChild(t);
    setTimeout(function () { t.remove(); }, 3600);
  };

  /* ---------------- Megamenü-Inhalte ---------------- */
  function links(list, cls) {
    return '<ul class="mega__links' + (cls ? ' ' + cls : '') + '">' + list.map(function (l) {
      return '<li><a href="' + l[1] + '"' + (l[2] ? ' class="is-strong"' : '') + (l[3] ? ' ' + l[3] : '') + '>' + l[0] + '</a></li>';
    }).join('') + '</ul>';
  }
  function tile(img, label, href) {
    return '<a class="mega-tile" href="' + href + '"><img src="assets/img/' + img + '" alt="" width="600" height="400" loading="lazy"><span>' + label + '</span></a>';
  }
  function subLinks(kat) {
    return Object.keys(PS.subcats[kat]).map(function (k) { return [PS.subcats[kat][k], 'kollektion.html?kat=' + kat + '&typ=' + k]; });
  }
  var K = 'kollektion.html?kat=';

  var MENU = [
    { key: 'motorraeder', label: 'Motorräder', href: K + 'motorraeder', mega: function () {
      return '<div class="container mega__inner mega__inner--bikes"><div><p class="mega__title">Fahrzeuge</p>' +
        links([['Neufahrzeuge', K + 'motorraeder&zustand=neu'], ['Gebrauchtfahrzeuge', K + 'motorraeder&zustand=gebraucht'], ['Vorführfahrzeuge', K + 'motorraeder&zustand=vorfuehrer'], ['Alle Motorräder', K + 'motorraeder', true]]) +
        '</div><div><p class="mega__title">Modellfamilien</p><div class="mega__families">' +
        PS.families.map(function (f) { return tile('familie-' + PS.familySlug[f] + '.jpg', f, K + 'motorraeder&familie=' + PS.familySlug[f]); }).join('') +
        '</div></div><div class="mega__cta"><p>Persönliche Beratung, Probefahrt und Finanzierung – direkt bei uns im Showroom.</p>' +
        '<a class="btn btn--primary btn--sm" href="service.html#probefahrt">' + I('route') + 'Probefahrt anfragen</a>' +
        '<a class="btn btn--outline-light btn--sm" href="service.html#finanzierung">' + I('banknote') + 'Finanzierung anfragen</a></div></div>';
    } },
    { key: 'herren', label: 'Herren', href: K + 'herren', mega: function () { return apparelMega('herren', 'Herren'); } },
    { key: 'damen', label: 'Damen', href: K + 'damen', mega: function () { return apparelMega('damen', 'Damen'); } },
    { key: 'teile', label: 'Teile & Zubehör', href: K + 'teile', mega: function () {
      return '<div class="container mega__inner mega__inner--cols"><div><p class="mega__title">Kategorien</p>' +
        links(subLinks('teile').concat([['Alle Teile & Zubehör', K + 'teile', true]]), 'mega__links--2col') +
        '</div><div><p class="mega__title">Nach Modellfamilie</p>' +
        links(PS.families.map(function (f) { return [f, K + 'teile&familie=' + PS.familySlug[f]]; })) +
        '</div><div class="mega__teasers">' + tile('mega-teile.jpg', 'Custom-Umbauten', 'service.html#werkstatt') + tile('bento-teile.jpg', 'Performance-Teile', K + 'teile&typ=motor') + '</div></div>';
    } },
    { key: 'accessoires', label: 'Accessoires', href: K + 'accessoires', mega: function () {
      return '<div class="container mega__inner mega__inner--cols"><div><p class="mega__title">Kategorien</p>' +
        links(subLinks('accessoires').concat([['Alle Accessoires', K + 'accessoires', true]])) +
        '</div><div><p class="mega__title">Entdecken</p>' +
        links([['Neuheiten', K + 'neuheiten&bereich=accessoires'], ['Sale', K + 'sale&bereich=accessoires'], ['Geschenkgutscheine', K + 'accessoires&typ=gutscheine']]) +
        '</div><div class="mega__teasers">' + tile('mega-accessoires.jpg', 'Geschenkideen', K + 'accessoires&typ=gutscheine') + tile('bento-accessoires.jpg', 'Helme & Brillen', K + 'accessoires&typ=helme') + '</div></div>';
    } },
    { key: 'service', label: 'Service', href: 'service.html', mega: function () {
      return '<div class="container mega__inner mega__inner--cols"><div><p class="mega__title">Service</p>' +
        links(PS.servicePages.map(function (s) { return [s.title, s.url]; }).concat([['Kontakt', 'service.html#standort']])) +
        '</div><div><p class="mega__title">Direkter Draht</p><ul class="mega__links">' +
        '<li><a href="tel:' + shop.phoneHref + '">' + I('phone', 'icon--sm') + '&nbsp;' + shop.phone + '</a></li>' +
        '<li><a href="mailto:' + shop.email + '">' + I('mail', 'icon--sm') + '&nbsp;' + shop.email + '</a></li>' +
        shop.hours.map(function (h) { return '<li><a href="service.html#standort">' + h.label + ': ' + h.text + '</a></li>'; }).join('') +
        '</ul></div><div class="mega__teasers">' + tile('service-probefahrt.jpg', 'Probefahrt', 'service.html#probefahrt') + tile('service-werkstatt.jpg', 'Werkstatt', 'service.html#werkstatt') + '</div></div>';
    } },
  ];

  function apparelMega(kat, label) {
    return '<div class="container mega__inner mega__inner--cols"><div><p class="mega__title">Kategorien</p>' +
      links(subLinks(kat).concat([['Alle ' + label, K + kat, true]])) +
      '</div><div><p class="mega__title">Entdecken</p>' +
      links([['Neuheiten', K + 'neuheiten&bereich=' + kat], ['Sale', K + 'sale&bereich=' + kat], ['Größentabelle', '#', false, 'data-open="sizeguide"']]) +
      '</div><div class="mega__teasers">' + tile('mega-' + kat + '.jpg', 'Neue Kollektion', kat === 'herren' ? K + 'herren' : K + kat + '&kollektion=' + encodeURIComponent('Herbst/Winter')) + tile('bento-' + kat + '.jpg', 'Riding Gear', kat === 'herren' ? K + 'herren&typ=motorradbekleidung' : K + kat + '&kollektion=' + encodeURIComponent('Riding Gear')) + '</div></div>';
  }

  /* ---------------- Header ---------------- */
  var page = document.body.dataset.page;
  var currentKat = page === 'collection' ? params.get('kat') : (document.body.dataset.kat || (page === 'service' ? 'service' : null));
  if (page === 'pdp' && !currentKat) { var pp = PS.findProduct(params.get('id') || 'h1'); if (pp) currentKat = pp.kat; }

  var headerHtml =
    '<div class="announce" role="region" aria-label="Aktuelle Hinweise"><div class="container announce__inner"><p>Versandkostenfrei ab ' + PS.moneyInt(shop.freeShipping) + '*<span class="announce__extra"> · ' + shop.returnDays + ' Tage Rückgabe</span> · <a href="service.html#probefahrt">Probefahrt anfragen</a></p></div></div>' +
    '<header class="site-header" id="top">' +
      '<div class="container header__bar">' +
        '<button class="icon-btn header__burger" type="button" data-open="mobile-menu" aria-label="Menü öffnen">' + I('menu') + '</button>' +
        '<a class="brand" href="index.html" aria-label="Power Shop – zur Startseite"><span class="wordmark">Power<span>Shop</span></span></a>' +
        '<span class="brand__divider" aria-hidden="true"></span>' +
        '<img class="brand__hd" src="assets/brand/hd-bar-shield.png" alt="Harley-Davidson – offizieller Vertragshändler" width="49" height="40">' +
        '<nav class="mainnav" aria-label="Hauptnavigation"><ul class="mainnav__list">' +
          MENU.map(function (m) {
            return '<li class="mainnav__item" data-mega="' + m.key + '">' +
              '<a class="mainnav__link" href="' + m.href + '"' + (currentKat === m.key ? ' aria-current="page"' : '') + '>' + m.label + '</a>' +
              '<button class="mainnav__toggle" type="button" aria-expanded="false" aria-controls="mega-' + m.key + '" aria-label="Untermenü ' + m.label + '">' + I('chevron-down') + '</button>' +
              '<div class="mega on-dark" id="mega-' + m.key + '">' + m.mega() + '</div></li>';
          }).join('') +
          '<li class="mainnav__item"><a class="mainnav__link mainnav__link--sale" href="' + K + 'sale"' + (currentKat === 'sale' ? ' aria-current="page"' : '') + '>Sale</a></li>' +
        '</ul></nav>' +
        '<div class="header__icons">' +
          '<button class="icon-btn" type="button" data-open="search" aria-label="Suche öffnen">' + I('search') + '</button>' +
          '<a class="icon-btn hide-mobile" href="#" data-todo="Kundenkonto" aria-label="Kundenkonto">' + I('user') + '</a>' +
          '<button class="icon-btn hide-mobile" type="button" data-open="wish-drawer" aria-label="Merkliste">' + I('heart') + '<span class="count" data-wish-count></span></button>' +
          '<button class="icon-btn" type="button" data-open="cart-drawer" aria-label="Warenkorb">' + I('shopping-bag') + '<span class="count" data-cart-count></span></button>' +
        '</div>' +
      '</div>' +
    '</header>';

  /* ---------------- Mobile-Menü ---------------- */
  var mobileHtml = '<dialog class="drawer drawer--left mobile-menu" id="mobile-menu" aria-label="Menü">' +
    '<div class="drawer__head"><span class="wordmark">Power<span>Shop</span></span><button class="icon-btn" type="button" data-close aria-label="Menü schließen">' + I('x') + '</button></div>' +
    '<div class="drawer__body" style="padding:0">' +
      MENU.map(function (m) {
        var tmp = document.createElement('div'); tmp.innerHTML = m.mega();
        var items = Array.prototype.map.call(tmp.querySelectorAll('.mega__links a, .mega-tile, .mega__cta a'), function (a) {
          return '<a href="' + a.getAttribute('href') + '"' + (a.dataset.open ? ' data-open="' + a.dataset.open + '"' : '') + '>' + (a.querySelector('span') && a.classList.contains('mega-tile') ? a.querySelector('span').textContent : a.textContent) + '</a>';
        });
        return '<details class="acc"><summary>' + m.label + I('plus') + '</summary><div class="acc__body">' +
          '<a href="' + m.href + '"><strong>Alle anzeigen</strong></a>' + items.filter(function (v, i, arr) { return arr.indexOf(v) === i; }).join('') + '</div></details>';
      }).join('') +
      '<a class="mobile-menu__direct mobile-menu__direct--sale" href="' + K + 'sale">Sale' + I('arrow-right') + '</a>' +
      '<div class="mobile-menu__foot">' +
        '<a href="#" data-todo="Kundenkonto">' + I('user') + 'Kundenkonto</a>' +
        '<a href="#" data-open="wish-drawer">' + I('heart') + 'Merkliste</a>' +
        '<a href="tel:' + shop.phoneHref + '">' + I('phone') + shop.phone + '</a>' +
        '<div class="mobile-menu__hd"><img src="assets/brand/hd-bar-shield.png" alt="" width="49" height="40"><span>Offizieller Harley-Davidson Vertragshändler</span></div>' +
      '</div>' +
    '</div></dialog>';

  /* ---------------- Suche ---------------- */
  var searchHtml = '<dialog class="search-dialog" id="search" aria-label="Suche"><div class="container">' +
    '<form class="search__bar" role="search" action="kollektion.html">' + I('search', 'icon--lg') +
      '<input type="hidden" name="kat" value="suche">' +
      '<label class="sr-only" for="search-input">Suche nach Produkt, Modell oder Teilenummer</label>' +
      '<input class="search__input" id="search-input" name="q" type="search" autocomplete="off" placeholder="Produkt, Modell oder Teilenummer …">' +
      '<button class="icon-btn" type="button" data-close aria-label="Suche schließen">' + I('x') + '</button>' +
    '</form><div class="search__results" id="search-results" aria-live="polite"></div></div></dialog>';

  /* ---------------- Drawer ---------------- */
  var drawersHtml =
    '<dialog class="drawer" id="cart-drawer" aria-labelledby="cart-title"><div class="drawer__head"><h2 class="h4" id="cart-title">Warenkorb</h2><button class="icon-btn" type="button" data-close aria-label="Warenkorb schließen">' + I('x') + '</button></div><div class="drawer__body" data-cart-body></div><div class="drawer__foot" data-cart-foot></div></dialog>' +
    '<dialog class="drawer" id="wish-drawer" aria-labelledby="wish-title"><div class="drawer__head"><h2 class="h4" id="wish-title">Merkliste</h2><button class="icon-btn" type="button" data-close aria-label="Merkliste schließen">' + I('x') + '</button></div><div class="drawer__body" data-wish-body></div></dialog>';

  /* ---------------- Größentabelle ---------------- */
  function sizeGuideHtml() {
    var keys = Object.keys(PS.sizeCharts);
    return '<dialog class="modal" id="sizeguide" aria-labelledby="sg-title"><div class="modal__inner">' +
      '<div class="modal__head"><h2 class="h3" id="sg-title">Größentabelle</h2><button class="icon-btn" type="button" data-close aria-label="Größentabelle schließen">' + I('x') + '</button></div>' +
      '<div class="modal__body"><div class="tabs tabs--left" role="tablist" aria-label="Produktart">' +
        keys.map(function (k, i) { return '<button class="tab" role="tab" type="button" id="sgt-' + k + '" aria-controls="sgp-' + k + '" aria-selected="' + (i === 0) + '"' + (i ? ' tabindex="-1"' : '') + '>' + PS.sizeCharts[k].label + '</button>'; }).join('') +
      '</div>' +
      keys.map(function (k, i) {
        var c = PS.sizeCharts[k];
        return '<div role="tabpanel" id="sgp-' + k + '" aria-labelledby="sgt-' + k + '"' + (i ? ' hidden' : '') + '><div class="size-table-wrap"><table class="size-table"><thead><tr>' +
          c.head.map(function (h) { return '<th scope="col">' + h + '</th>'; }).join('') + '</tr></thead><tbody>' +
          c.rows.map(function (r) { return '<tr><th scope="row">' + r[0] + '</th>' + r.slice(1).map(function (v) { return '<td>' + v + '</td>'; }).join('') + '</tr>'; }).join('') +
          '</tbody></table></div></div>';
      }).join('') +
      '<div class="howto"><img src="assets/img/messanleitung.jpg" alt="Illustration der Messpunkte Brust, Taille, Hüfte und Innenbeinlänge" width="800" height="600" loading="lazy">' +
        '<dl><div><dt>Brust</dt><dd>Waagerecht an der breitesten Stelle unter den Achseln messen.</dd></div>' +
        '<div><dt>Taille</dt><dd>An der schmalsten Stelle, locker über der Unterwäsche.</dd></div>' +
        '<div><dt>Innenbein</dt><dd>Vom Schritt bis zum Boden, ohne Schuhe.</dd></div>' +
        '<div><dt>Zwischen zwei Größen?</dt><dd>Lederjacken sitzen eng und weiten sich – im Zweifel die größere Größe für Protektoren wählen.</dd></div></dl></div>' +
      '</div></div></dialog>';
  }

  /* ---------------- Footer ---------------- */
  function col(title, list) {
    return '<div><h2>' + title + '</h2><ul>' + list.map(function (l) { return '<li><a href="' + (l[1] || '#') + '"' + (l[2] ? ' ' + l[2] : (l[1] ? '' : ' data-todo="' + l[0] + '"')) + '>' + l[0] + '</a></li>'; }).join('') + '</ul></div>';
  }
  var footerHtml = '<footer class="site-footer on-dark">' +
    '<div class="container footer__news"><div><h2 class="h2">' + shop.newsletterDiscount + ' % auf deine erste Bestellung</h2>' +
      '<p>News zu neuen Modellen, Events und Kollektionen. Der Gutschein gilt für Bekleidung, Teile und Accessoires – nicht für Motorräder.</p></div>' +
      '<form class="news-form" data-newsletter novalidate><label class="sr-only" for="news-mail">E-Mail-Adresse</label>' +
        '<div class="news-form__row"><input class="input" id="news-mail" type="email" required placeholder="Deine E-Mail-Adresse" autocomplete="email"><button class="btn btn--primary" type="submit">Anmelden</button></div>' +
        '<small>Du erhältst eine E-Mail zur Bestätigung (Double-Opt-in). Abmeldung jederzeit möglich. Mehr in der <a href="#" data-todo="Datenschutzerklärung">Datenschutzerklärung</a>.</small></form></div>' +
    '<div class="container footer__cols">' +
      col('Power Shop', [['Über uns'], ['Standort & Öffnungszeiten', 'service.html#standort'], ['Events & Ausfahrten', 'service.html#events'], ['Karriere']]) +
      col('Kundenservice', [['Hilfe & FAQ'], ['Versand & Lieferung'], ['Rückgabe & Umtausch'], ['Größentabelle', '#', 'data-open="sizeguide"'], ['Kontakt', 'service.html#standort']]) +
      col('Rechtliches', [['Impressum'], ['Datenschutz'], ['AGB'], ['Widerrufsbelehrung'], ['Cookie-Einstellungen', '#', 'data-cookie-settings'], ['Barrierefreiheitserklärung']]) +
      col('Folge uns', [['Instagram'], ['Facebook'], ['YouTube'], ['TikTok']]) +
      '<div class="footer__dealer"><img src="assets/brand/hd-bar-shield.png" alt="Harley-Davidson Bar & Shield" width="69" height="56" loading="lazy"><p><strong>Offizieller Vertragshändler</strong>Harley-Davidson Neufahrzeuge, Original-Teile, MotorClothes und Werkstatt-Service.</p></div>' +
    '</div>' +
    '<div class="footer__bottom"><div class="container"><ul class="payments" aria-label="Zahlarten">' +
      ['PayPal', 'Klarna', 'Visa', 'Mastercard', 'Apple Pay', 'Google Pay', 'DHL'].map(function (p) { return '<li>' + p + '</li>'; }).join('') +
      '</ul><p>© 2026 ' + esc(shop.company) + ' · * Alle Preise inkl. MwSt., zzgl. <a href="#" data-todo="Versandkosten">Versandkosten</a></p></div></div>' +
  '</footer>';

  /* ---------------- Einfügen ---------------- */
  var headerSlot = document.getElementById('site-header');
  var footerSlot = document.getElementById('site-footer');
  if (headerSlot) headerSlot.outerHTML = headerHtml;
  if (footerSlot) footerSlot.outerHTML = footerHtml;
  document.body.insertAdjacentHTML('beforeend', mobileHtml + searchHtml + drawersHtml + sizeGuideHtml());

  /* ---------------- Dialoge öffnen/schließen ---------------- */
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
  document.addEventListener('click', function (e) {
    var opener = e.target.closest('[data-open]');
    if (opener) {
      e.preventDefault();
      if (opener.dataset.open === 'sizeguide' && opener.dataset.type) PS.selectTab(document.getElementById('sgt-' + opener.dataset.type));
      PS.openDialog(opener.dataset.open, opener);
      return;
    }
    if (e.target.closest('[data-close]')) { e.target.closest('dialog').close(); return; }
    // Klick auf den Hintergrund schließt
    if (e.target.tagName === 'DIALOG') {
      var r = e.target.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) e.target.close();
    }
    var todo = e.target.closest('[data-todo]');
    if (todo) { e.preventDefault(); PS.toast('„' + todo.dataset.todo + '“ ist nicht Teil des Mockups – folgt im Shopify-Shop.', 'info'); }
  });
  // „close“ blubbert nicht – daher Capture auf document (gilt auch für später eingefügte Dialoge)
  document.addEventListener('close', function (e) {
    if (e.target.tagName !== 'DIALOG') return;
    if (!document.querySelector('dialog[open]')) document.body.classList.remove('is-locked');
    if (lastTrigger && document.contains(lastTrigger) && lastTrigger.focus) lastTrigger.focus();
  }, true);

  /* ---------------- Tabs (ARIA, wiederverwendbar) ---------------- */
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
    next.focus(); PS.selectTab(next);
  });

  /* ---------------- Megamenü ---------------- */
  var items = document.querySelectorAll('.mainnav__item[data-mega]');
  var timers = new WeakMap();
  var lastPointer = 'mouse';
  function setOpen(li, open) {
    if (open) items.forEach(function (o) { if (o !== li) setOpen(o, false); });
    li.classList.toggle('is-open', open);
    li.querySelector('.mainnav__toggle').setAttribute('aria-expanded', open);
  }
  document.addEventListener('pointerdown', function (e) { lastPointer = e.pointerType; }, true);
  items.forEach(function (li) {
    li.addEventListener('mouseenter', function () { if (lastPointer !== 'mouse') return; clearTimeout(timers.get(li)); timers.set(li, setTimeout(function () { setOpen(li, true); }, 90)); });
    li.addEventListener('mouseleave', function () { if (lastPointer !== 'mouse') return; clearTimeout(timers.get(li)); timers.set(li, setTimeout(function () { setOpen(li, false); }, 160)); });
    li.querySelector('.mainnav__toggle').addEventListener('click', function () { setOpen(li, !li.classList.contains('is-open')); });
    // Touch: erster Tipp öffnet, zweiter navigiert
    li.querySelector('.mainnav__link').addEventListener('click', function (e) {
      if (lastPointer === 'touch' && !li.classList.contains('is-open')) { e.preventDefault(); setOpen(li, true); }
    });
    li.addEventListener('focusout', function (e) { if (!li.contains(e.relatedTarget)) setOpen(li, false); });
    li.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && li.classList.contains('is-open')) { setOpen(li, false); li.querySelector('.mainnav__toggle').focus(); }
    });
  });
  document.addEventListener('click', function (e) { if (!e.target.closest('.mainnav')) items.forEach(function (li) { setOpen(li, false); }); });

  // Header wird beim Scrollen kompakter
  var header = document.querySelector('.site-header');
  var onScroll = function () { header.classList.toggle('is-compact', window.scrollY > 40); };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------------- Suche ---------------- */
  var sInput = document.getElementById('search-input');
  var sResults = document.getElementById('search-results');
  PS.searchAll = function (q) {
    q = q.trim().toLowerCase();
    if (!q) return { products: [], bikes: [], pages: [] };
    var terms = q.split(/\s+/);
    var match = function (text) { text = text.toLowerCase(); return terms.every(function (t) { return text.indexOf(t) > -1; }); };
    return {
      products: PS.products.filter(function (p) { return match([p.name, p.partNo || '', p.brand || '', PS.catLabel(p), (p.families || []).join(' ')].join(' ')); }),
      bikes: PS.bikes.filter(function (b) { return match([b.name, b.family, PS.zustandLabel[b.zustand], 'motorrad bike'].join(' ')); }),
      pages: PS.servicePages.concat(Object.keys(PS.categories).filter(function (k) { return k !== 'suche'; }).map(function (k) { return { title: PS.categories[k].title, url: K + k }; }))
        .filter(function (s) { return match(s.title); }),
    };
  };
  function hl(text, q) {
    var t = q.trim().split(/\s+/)[0];
    if (!t) return esc(text);
    var i = text.toLowerCase().indexOf(t.toLowerCase());
    return i < 0 ? esc(text) : esc(text.slice(0, i)) + '<mark>' + esc(text.slice(i, i + t.length)) + '</mark>' + esc(text.slice(i + t.length));
  }
  function renderSearch() {
    var q = sInput.value;
    if (!q.trim()) {
      sResults.innerHTML = '<div class="search__group"><h2>Beliebte Suchen</h2><div class="chip-row">' +
        ['Lederjacke', 'Street Glide', 'Auspuff', '64900-24', 'Helm', 'Gebraucht'].map(function (t) { return '<button class="chip" type="button" data-suggest="' + t + '">' + t + '</button>'; }).join('') +
        '</div><p class="search__hint" style="margin-top:16px">Tipp: Du kannst direkt nach der Teilenummer suchen.</p></div>';
      return;
    }
    var r = PS.searchAll(q);
    var total = r.products.length + r.bikes.length;
    var left = '<div class="search__group"><h2>Seiten &amp; Kategorien</h2>' + (r.pages.length ? '<div class="search__list">' +
      r.pages.slice(0, 6).map(function (s) { return '<a href="' + s.url + '"><span class="search__name">' + hl(s.title, q) + '</span></a>'; }).join('') + '</div>' : '<p class="search__hint">Keine Treffer.</p>') + '</div>';
    var list = r.bikes.slice(0, 3).map(function (b) {
      return '<a href="' + b.url + '"><img src="' + b.image + '" alt="" width="48" height="60"><span><span class="search__name">' + hl(b.name, q) + '</span><br><span class="search__meta">Motorrad · ' + PS.zustandLabel[b.zustand] + ' · ' + PS.moneyInt(b.price) + '</span></span></a>';
    }).concat(r.products.slice(0, 6).map(function (p) {
      return '<a href="' + p.url + '"><img src="' + p.image + '" alt="" width="48" height="60"><span><span class="search__name">' + hl(p.name, q) + '</span><br><span class="search__meta">' + esc(PS.catLabel(p)) + (p.partNo ? ' · Art.-Nr. ' + hl(p.partNo, q) : '') + ' · ' + PS.money(p.price) + '</span></span></a>';
    }));
    var right = '<div class="search__group"><h2>Produkte &amp; Bikes (' + total + ')</h2>' + (list.length ? '<div class="search__list">' + list.join('') + '</div>' +
      (r.products.length ? '<p style="margin-top:16px"><a class="btn btn--secondary btn--sm" href="' + K + 'suche&q=' + encodeURIComponent(q) + '">' + (r.products.length === 1 ? '1 Produkt' : 'Alle ' + r.products.length + ' Produkte') + ' anzeigen' + I('arrow-right') + '</a></p>' : '') :
      '<p class="search__hint">Keine Produkte gefunden. Versuch es mit einem anderen Begriff oder einer Teilenummer.</p>') + '</div>';
    sResults.innerHTML = left + right;
  }
  sInput.addEventListener('input', renderSearch);
  sResults.addEventListener('click', function (e) {
    var s = e.target.closest('[data-suggest]');
    if (s) { sInput.value = s.dataset.suggest; renderSearch(); sInput.focus(); }
  });
  document.getElementById('search').addEventListener('ps:open', function () { if (page === 'collection' && params.get('q')) sInput.value = params.get('q'); renderSearch(); setTimeout(function () { sInput.focus(); }, 30); });

  /* ---------------- Warenkorb & Merkliste ---------------- */
  var cartBody = document.querySelector('[data-cart-body]');
  var cartFoot = document.querySelector('[data-cart-foot]');
  function renderCart() {
    var s = PS.store, count = s.cartCount(), total = s.cartTotal();
    document.querySelectorAll('[data-cart-count]').forEach(function (el) { el.textContent = count || ''; el.dataset.count = count; });
    document.querySelectorAll('[data-open="cart-drawer"]').forEach(function (el) { el.setAttribute('aria-label', 'Warenkorb, ' + count + ' Artikel'); });
    document.getElementById('cart-title').textContent = 'Warenkorb (' + count + ')';
    if (!s.cart.length) {
      cartBody.innerHTML = '<div class="drawer__empty">' + I('shopping-bag') + '<p>Dein Warenkorb ist noch leer.</p><a class="btn btn--secondary" href="' + K + 'neuheiten">Neuheiten entdecken</a></div>';
      cartFoot.hidden = true;
      return;
    }
    cartFoot.hidden = false;
    var missing = Math.max(0, shop.freeShipping - total);
    var pct = Math.min(100, Math.round(total / shop.freeShipping * 100));
    var upsell = PS.products.filter(function (p) { return !p.sizes && p.kat !== 'teile' && !s.cart.some(function (l) { return l.id === p.id; }); }).slice(0, 2);
    cartBody.innerHTML =
      '<div class="progress"><span>' + (missing ? 'Noch <strong>' + PS.money(missing) + '</strong> bis zum kostenlosen Versand' : '<strong>Glückwunsch!</strong> Dein Versand ist kostenlos.') + '</span>' +
      '<div class="progress__bar" role="progressbar" aria-label="Fortschritt bis zum kostenlosen Versand" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '"><span style="width:' + pct + '%"></span></div></div>' +
      s.cart.map(function (l, i) {
        var p = PS.findProduct(l.id); if (!p) return '';
        return '<div class="line-item"><img src="' + p.image + '" alt="" width="88" height="110"><div>' +
          '<div class="line-item__top"><div><a class="line-item__name" href="' + p.url + '">' + esc(p.name) + '</a><p class="line-item__meta">' + (l.size ? 'Größe ' + l.size + ' · ' : '') + (p.partNo ? 'Art.-Nr. ' + p.partNo + ' · ' : '') + PS.money(p.price) + '</p></div>' +
          '<button class="remove-btn" type="button" data-remove="' + i + '" aria-label="' + esc(p.name) + ' entfernen">' + I('trash-2') + '</button></div>' +
          '<div class="line-item__bottom"><div class="qty"><button type="button" data-qty="' + i + '" data-delta="-1" aria-label="Menge verringern">' + I('minus', 'icon--sm') + '</button>' +
          '<input type="number" value="' + l.qty + '" min="1" max="9" aria-label="Menge" data-qty-input="' + i + '"><button type="button" data-qty="' + i + '" data-delta="1" aria-label="Menge erhöhen">' + I('plus', 'icon--sm') + '</button></div>' +
          '<strong>' + PS.money(p.price * l.qty) + '</strong></div></div></div>';
      }).join('') +
      (upsell.length ? '<div class="upsell"><h3>Passt dazu</h3>' + upsell.map(function (p) {
        return '<div class="upsell__item"><img src="' + p.image + '" alt="" width="56" height="70"><div><a href="' + p.url + '" class="small">' + esc(p.name) + '</a><p class="caption muted">' + PS.money(p.price) + '</p></div><button class="icon-btn" type="button" data-add="' + p.id + '" aria-label="' + esc(p.name) + ' hinzufügen" style="border:1px solid var(--c-line)">' + I('plus') + '</button></div>';
      }).join('') + '</div>' : '');
    cartFoot.innerHTML = '<div class="subtotal"><span>Zwischensumme</span><strong>' + PS.money(total) + '</strong></div>' +
      '<p class="caption muted">inkl. MwSt., zzgl. ' + (missing ? PS.money(shop.shippingCost) + ' ' : '') + 'Versand' + (missing ? '' : ' (kostenlos)') + ' · Lieferzeit ' + shop.deliveryTime + '</p>' +
      '<a class="btn btn--primary btn--block" href="#" data-todo="Checkout (Shopify-Standard)">Zur Kasse' + I('arrow-right') + '</a>' +
      '<button class="btn btn--text" type="button" data-close style="justify-self:center">Weiter einkaufen</button>' +
      '<ul class="payments" aria-label="Zahlarten" style="justify-content:center">' + ['PayPal', 'Klarna', 'Visa', 'Mastercard', 'Apple Pay'].map(function (p) { return '<li style="color:var(--c-muted);border-color:var(--c-line)">' + p + '</li>'; }).join('') + '</ul>';
  }
  var wishBody = document.querySelector('[data-wish-body]');
  function renderWish() {
    var s = PS.store, n = s.wish.length;
    document.querySelectorAll('[data-wish-count]').forEach(function (el) { el.textContent = n || ''; el.dataset.count = n; });
    document.querySelectorAll('[data-open="wish-drawer"]').forEach(function (el) { if (el.classList.contains('icon-btn')) el.setAttribute('aria-label', 'Merkliste, ' + n + ' Artikel'); });
    document.getElementById('wish-title').textContent = 'Merkliste (' + n + ')';
    document.querySelectorAll('[data-wish]').forEach(function (b) { b.setAttribute('aria-pressed', s.isWished(b.dataset.wish)); });
    wishBody.innerHTML = n ? s.wish.map(function (id) {
      var p = PS.findProduct(id); if (!p) return '';
      return '<div class="line-item"><img src="' + p.image + '" alt="" width="88" height="110"><div><div class="line-item__top"><div><a class="line-item__name" href="' + p.url + '">' + esc(p.name) + '</a><p class="line-item__meta">' + PS.money(p.price) + '</p></div>' +
        '<button class="remove-btn" type="button" data-wish="' + p.id + '" aria-label="' + esc(p.name) + ' von der Merkliste entfernen">' + I('x') + '</button></div>' +
        '<div class="line-item__bottom">' + (p.sizes ? '<a class="btn btn--outline-dark btn--sm" href="' + p.url + '">Größe wählen</a>' : '<button class="btn btn--secondary btn--sm" type="button" data-add="' + p.id + '">In den Warenkorb</button>') + '</div></div></div>';
    }).join('') : '<div class="drawer__empty">' + I('heart') + '<p>Noch nichts gemerkt. Tippe auf das Herz, um Produkte zu speichern.</p></div>';
  }
  document.addEventListener('ps:cart', renderCart);
  document.addEventListener('ps:wish', renderWish);
  renderCart(); renderWish();

  document.addEventListener('click', function (e) {
    var add = e.target.closest('[data-add]');
    if (add) {
      var p = PS.findProduct(add.dataset.add);
      var size = add.dataset.size || null;
      if (p.sizes && !size) { location.href = p.url; return; }
      PS.store.addToCart(p.id, size, 1);
      var card = add.closest('.pcard'); if (card) card.classList.remove('is-quick-open');
      // Der geöffnete Warenkorb ist die Rückmeldung (kein zusätzlicher Toast hinter dem Dialog)
      PS.openDialog('cart-drawer', add);
      return;
    }
    var w = e.target.closest('[data-wish]');
    if (w) {
      var on = PS.store.toggleWish(w.dataset.wish);
      PS.toast(on ? 'Auf der Merkliste gespeichert.' : 'Von der Merkliste entfernt.', 'heart');
      return;
    }
    var rm = e.target.closest('[data-remove]');
    if (rm) { PS.store.setQty(+rm.dataset.remove, 0); return; }
    var q = e.target.closest('[data-qty]');
    if (q) { var i = +q.dataset.qty; PS.store.setQty(i, PS.store.cart[i].qty + (+q.dataset.delta)); }
  });
  document.addEventListener('change', function (e) {
    if (e.target.matches('[data-qty-input]')) PS.store.setQty(+e.target.dataset.qtyInput, parseInt(e.target.value, 10) || 1);
  });

  /* ---------------- Newsletter ---------------- */
  document.addEventListener('submit', function (e) {
    if (!e.target.matches('[data-newsletter]')) return;
    e.preventDefault();
    var input = e.target.querySelector('input[type="email"]');
    if (!input.checkValidity()) { input.setAttribute('aria-invalid', 'true'); PS.toast('Bitte gib eine gültige E-Mail-Adresse ein.', 'circle-alert'); input.focus(); return; }
    input.removeAttribute('aria-invalid');
    PS.toast('Fast geschafft: Bitte bestätige deine Anmeldung in der E-Mail (Double-Opt-in).', 'mail');
    e.target.reset();
  });

  /* ---------------- Cookie-Banner ---------------- */
  function cookieBanner(showSettings) {
    var old = document.querySelector('.cookie'); if (old) old.remove();
    var c = PS.store.consent || {};
    var el = document.createElement('section');
    el.className = 'cookie'; el.setAttribute('aria-label', 'Cookie-Einstellungen');
    el.innerHTML = '<h2 class="h4">Wir respektieren deine Privatsphäre</h2>' +
      '<p>Wir nutzen notwendige Cookies für den Shop. Statistik und Marketing nur mit deiner Einwilligung – du kannst sie jederzeit im Footer ändern. <a href="#" data-todo="Datenschutzerklärung">Datenschutz</a></p>' +
      '<div class="cookie__settings"' + (showSettings ? '' : ' hidden') + '>' +
        '<label class="check"><input type="checkbox" checked disabled> Notwendig (immer aktiv)</label>' +
        '<label class="check"><input type="checkbox" name="stats"' + (c.stats ? ' checked' : '') + '> Statistik</label>' +
        '<label class="check"><input type="checkbox" name="marketing"' + (c.marketing ? ' checked' : '') + '> Marketing</label></div>' +
      '<div class="cookie__actions"><button class="btn btn--outline-light btn--sm" type="button" data-consent="none">Ablehnen</button>' +
      '<button class="btn btn--outline-light btn--sm" type="button" data-consent="all">Alle akzeptieren</button></div>' +
      '<button class="cookie__more" type="button" data-consent="' + (showSettings ? 'save' : 'settings') + '">' + (showSettings ? 'Auswahl speichern' : 'Einstellungen') + '</button>';
    document.body.appendChild(el);
    el.addEventListener('click', function (e) {
      var b = e.target.closest('[data-consent]'); if (!b) return;
      var v = b.dataset.consent;
      if (v === 'settings') { cookieBanner(true); return; }
      if (v === 'all') PS.store.setConsent({ stats: true, marketing: true });
      if (v === 'none') PS.store.setConsent({ stats: false, marketing: false });
      if (v === 'save') PS.store.setConsent({ stats: el.querySelector('[name="stats"]').checked, marketing: el.querySelector('[name="marketing"]').checked });
      el.remove();
      PS.toast('Deine Cookie-Auswahl wurde gespeichert.');
    });
  }
  // Banner erscheint kurz nach dem Laden, damit die Seite zuerst sichtbar ist
  if (!PS.store.consent && !/[?&]nocookie/.test(location.search)) setTimeout(function () { if (!PS.store.consent) cookieBanner(false); }, 1200);
  document.addEventListener('click', function (e) { if (e.target.closest('[data-cookie-settings]')) { e.preventDefault(); cookieBanner(true); } });
})();
