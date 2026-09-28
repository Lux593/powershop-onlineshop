/* ==========================================================================
   Seitenfunktionen: Hero-Slider, Neuheiten, Showroom, Kategorieseite
   (Filter/Sortierung/Pagination), PDPs, Kontakt-Box, Service, Styleguide
   ========================================================================== */
(function () {
  var I = PS.icon, esc = PS.esc, shop = PS.shop;
  var params = new URLSearchParams(location.search);
  var page = document.body.dataset.page;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ======================================================================
     Allgemein
     ====================================================================== */

  // Quick-Add auf Touch-Geräten („+“ öffnet die Größenauswahl)
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-quick-toggle]');
    if (!t) return;
    var card = t.closest('.pcard');
    var open = !card.classList.contains('is-quick-open');
    $$('.pcard.is-quick-open').forEach(function (c) { c.classList.remove('is-quick-open'); });
    card.classList.toggle('is-quick-open', open);
    t.setAttribute('aria-expanded', open);
  });

  // Horizontale Schienen mit Pfeilen
  function initRail(rail) {
    if (rail.dataset.railInit) return;
    rail.dataset.railInit = '1';
    var id = rail.id;
    var prev = $('[data-rail-prev="' + id + '"]'), next = $('[data-rail-next="' + id + '"]');
    if (!prev || !next) return;
    var step = function () { var c = rail.firstElementChild; return c ? c.getBoundingClientRect().width + 24 : 300; };
    var update = function () {
      prev.disabled = rail.scrollLeft < 4;
      next.disabled = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 4;
    };
    prev.onclick = function () { rail.scrollBy({ left: -step(), behavior: reduceMotion ? 'auto' : 'smooth' }); };
    next.onclick = function () { rail.scrollBy({ left: step(), behavior: reduceMotion ? 'auto' : 'smooth' }); };
    rail.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  // Öffnungszeiten-Status
  PS.openState = function () {
    var now = new Date(), d = now.getDay(), h = now.getHours() + now.getMinutes() / 60;
    var today = shop.hours.find(function (x) { return x.days.indexOf(d) > -1; });
    if (today && h >= today.from && h < today.to) return { open: true, text: 'Jetzt geöffnet – bis ' + String(today.to).padStart(2, '0') + ':00 Uhr' };
    return { open: false, text: 'Gerade geschlossen – schreib uns, wir melden uns.' };
  };

  /* ---------------- Kontakt-Box (Anrufen · WhatsApp · E-Mail) ---------------- */
  var TOPICS = {
    probefahrt: { label: 'Probefahrt', subj: 'Probefahrt', text: function (x) { return 'ich möchte gerne eine Probefahrt' + (x ? ' mit der ' + x : '') + ' vereinbaren. Wann passt es euch?'; } },
    finanzierung: { label: 'Finanzierung', subj: 'Finanzierung', text: function (x) { return 'ich interessiere mich für eine Finanzierung' + (x ? ' der ' + x : '') + '. Könnt ihr mir ein Angebot machen?'; } },
    inzahlungnahme: { label: 'Inzahlungnahme', subj: 'Inzahlungnahme', text: function (x) { return 'ich möchte mein aktuelles Motorrad in Zahlung geben' + (x ? ' und interessiere mich für die ' + x : '') + '. Mein Bike: Modell …, Baujahr …, km-Stand …'; } },
    reservierung: { label: 'Reservierung', subj: 'Reservierungsanfrage', text: function (x) { return 'ich möchte die ' + x + ' für ' + shop.reservation.hours + ' Stunden reservieren. Bitte schickt mir den Zahlungslink für die Reservierungsgebühr (' + PS.moneyInt(shop.reservation.fee) + ').'; } },
    werkstatt: { label: 'Werkstatt', subj: 'Werkstatt-Termin', text: function () { return 'ich hätte gerne einen Werkstatt-Termin. Mein Bike: Modell …, Baujahr …, Anliegen: …'; } },
    kompatibilitaet: { label: 'Passt es?', subj: 'Frage zur Kompatibilität', text: function (x) { return 'passt ' + x + ' an mein Motorrad? Modell …, Baujahr …'; } },
    einbau: { label: 'Einbau', subj: 'Einbau-Anfrage', text: function (x) { return 'könnt ihr ' + x + ' bei mir einbauen? Mein Bike: Modell …, Baujahr …'; } },
    frage: { label: 'Frage', subj: 'Frage', text: function (x) { return 'ich habe eine Frage' + (x ? ' zur ' + x : '') + ': …'; } },
  };
  PS.contactBox = function (o) {
    o = o || {};
    var id = 'cb-' + Math.random().toString(36).slice(2, 7);
    var topics = o.topics || ['probefahrt', 'finanzierung', 'inzahlungnahme', 'frage'];
    var active = o.topic || topics[0];
    var st = PS.openState();
    return '<section class="contact-box" id="' + (o.anchor || id) + '" data-contact="' + id + '" data-subject="' + esc(o.subject || '') + '" data-ref="' + esc(o.ref || '') + '" aria-labelledby="' + id + '-t">' +
      '<h2 class="h3" id="' + id + '-t">' + (o.title || 'Interesse? Sprich mit uns') + '</h2>' +
      (o.intro ? '<p class="small muted">' + o.intro + '</p>' : '') +
      '<fieldset class="contact-box__topics"><legend>Worum geht’s?</legend><div class="chip-row">' +
        topics.map(function (t) { return '<button class="chip" type="button" data-topic="' + t + '" aria-pressed="' + (t === active) + '">' + TOPICS[t].label + '</button>'; }).join('') +
      '</div></fieldset>' +
      '<div class="contact-box__buttons">' +
        '<a class="btn btn--primary" data-cb="tel" href="tel:' + shop.phoneHref + '">' + I('phone') + '<span>Anrufen</span><span class="contact-box__phone hide-mobile">· ' + shop.phone + '</span></a>' +
        '<a class="btn btn--outline-dark" data-cb="wa" href="#" target="_blank" rel="noopener">' + I('message-circle') + 'WhatsApp</a>' +
        '<a class="btn btn--outline-dark" data-cb="mail" href="#">' + I('mail') + 'E-Mail</a>' +
      '</div>' +
      '<p class="caption muted">Nachricht wird mit deinem Anliegen' + (o.subject ? ' und dem Fahrzeug/Artikel' : '') + ' vorausgefüllt – du kannst sie vor dem Senden anpassen.</p>' +
      (o.extra || '') +
      '<div class="contact-box__person"><img src="' + shop.contactPerson.img + '" alt="" width="56" height="56" loading="lazy"><div><strong>' + shop.contactPerson.name + '</strong><span>' + shop.contactPerson.role + '</span></div></div>' +
      '<p class="open-state' + (st.open ? ' is-open' : '') + '">' + st.text + '</p>' +
      '<p class="hours">' + shop.hours.map(function (h) { return h.label + ' ' + h.text; }).join(' · ') + '</p>' +
    '</section>';
  };
  function updateContact(box) {
    var t = ($('[data-topic][aria-pressed="true"]', box) || {}).dataset;
    var topic = TOPICS[(t && t.topic) || 'frage'];
    var subject = box.dataset.subject, ref = box.dataset.ref;
    var msg = 'Hallo Power-Shop-Team, ' + topic.text(subject) + (ref ? '\n\n' + ref : '') + '\n\nViele Grüße';
    var subj = topic.subj + (subject ? ': ' + subject : '');
    $('[data-cb="wa"]', box).href = 'https://wa.me/' + shop.whatsapp + '?text=' + encodeURIComponent(msg);
    $('[data-cb="mail"]', box).href = 'mailto:' + shop.email + '?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(msg);
    // Sticky-Bar (mobil) spiegelt die Links der Haupt-Box
    if (box.dataset.primary !== undefined) {
      $$('[data-sticky="wa"]').forEach(function (a) { a.href = $('[data-cb="wa"]', box).href; });
      $$('[data-sticky="mail"]').forEach(function (a) { a.href = $('[data-cb="mail"]', box).href; });
    }
  }
  PS.initContactBoxes = function (root) { $$('[data-contact]', root).forEach(updateContact); };
  document.addEventListener('click', function (e) {
    var chip = e.target.closest('[data-topic]');
    if (!chip) return;
    var box = chip.closest('[data-contact]');
    $$('[data-topic]', box).forEach(function (c) { c.setAttribute('aria-pressed', c === chip); });
    updateContact(box);
  });

  /* ======================================================================
     Homepage
     ====================================================================== */
  function initHero() {
    var hero = $('.hero'); if (!hero) return;
    var slides = $$('.hero__slide', hero), dots = $$('.hero__dot', hero), pauseBtn = $('.hero__pause', hero);
    var i = 0, timer = null, playing = !reduceMotion, hovering = false;
    function go(n) {
      i = (n + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.classList.toggle('is-active', k === i); s.setAttribute('aria-hidden', k !== i); s.inert = k !== i; });
      dots.forEach(function (d, k) { d.setAttribute('aria-current', k === i); });
    }
    function tick() { clearInterval(timer); if (playing && !hovering) timer = setInterval(function () { go(i + 1); }, 6000); }
    function setPlaying(p) {
      playing = p;
      pauseBtn.innerHTML = I(p ? 'pause' : 'play');
      pauseBtn.setAttribute('aria-label', p ? 'Automatischen Wechsel anhalten' : 'Automatischen Wechsel starten');
      $('.hero__track', hero).setAttribute('aria-live', p ? 'off' : 'polite');
      tick();
    }
    $('.hero__arrow--prev', hero).onclick = function () { go(i - 1); tick(); };
    $('.hero__arrow--next', hero).onclick = function () { go(i + 1); tick(); };
    dots.forEach(function (d, k) { d.onclick = function () { go(k); tick(); }; });
    pauseBtn.onclick = function () { setPlaying(!playing); };
    hero.addEventListener('mouseenter', function () { hovering = true; tick(); });
    hero.addEventListener('mouseleave', function () { hovering = false; tick(); });
    hero.addEventListener('focusin', function () { hovering = true; tick(); });
    hero.addEventListener('focusout', function (e) { if (!hero.contains(e.relatedTarget)) { hovering = false; tick(); } });
    // Swipe
    var x0 = null;
    hero.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') x0 = e.clientX; });
    hero.addEventListener('pointerup', function (e) {
      if (x0 === null) return;
      var dx = e.clientX - x0; x0 = null;
      if (Math.abs(dx) > 40) { go(i + (dx < 0 ? 1 : -1)); tick(); }
    });
    go(0); setPlaying(playing);
  }

  function initNews() {
    var grid = $('[data-news]'); if (!grid) return;
    var groups = { bekleidung: function (p) { return p.kat === 'herren' || p.kat === 'damen'; }, teile: function (p) { return p.kat === 'teile'; }, accessoires: function (p) { return p.kat === 'accessoires'; } };
    function render(key) {
      var list = PS.products.filter(groups[key]).sort(function (a, b) { return (b.isNew - a.isNew) || (b.date - a.date); }).slice(0, 4);
      grid.innerHTML = list.map(PS.productCard).join('');
      grid.setAttribute('aria-labelledby', 'news-tab-' + key);
      $('[data-news-all]').href = 'kollektion.html?kat=neuheiten' + (key === 'bekleidung' ? '' : '&bereich=' + key);
    }
    $('[data-news-tabs]').addEventListener('ps:tab', function (e) { render(e.detail.dataset.key); });
    render('bekleidung');
  }

  function initShowroom() {
    var rail = $('[data-showroom]'); if (!rail) return;
    function render(mode) {
      var list = PS.bikes.filter(function (b) { return mode === 'neu' ? b.zustand === 'neu' : b.zustand !== 'neu'; });
      rail.innerHTML = list.map(PS.bikeCard).join('');
      rail.scrollLeft = 0;
      rail.dispatchEvent(new Event('scroll'));
    }
    $$('[data-showroom-mode]').forEach(function (b) {
      b.onclick = function () {
        $$('[data-showroom-mode]').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
        render(b.dataset.showroomMode);
      };
    });
    render('neu');
    initRail(rail);
  }

  function renderEvents() {
    var box = $('[data-events]'); if (!box) return;
    var months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
    box.innerHTML = PS.events.map(function (ev) {
      var d = new Date(ev.date + 'T12:00:00');
      return '<a class="event-card" href="service.html#events"><div class="event-card__media"><img src="' + ev.img + '" alt="" width="800" height="500" loading="lazy">' +
        '<span class="date-badge"><strong>' + d.getDate() + '</strong><span>' + months[d.getMonth()] + '</span></span></div>' +
        '<div class="event-card__body"><h3>' + esc(ev.title) + '</h3><p>' + I('map-pin') + esc(ev.place) + '</p></div></a>';
    }).join('');
  }

  /* ======================================================================
     Kategorieseite
     ====================================================================== */
  function initCollection() {
    var main = $('[data-collection]'); if (!main) return;
    var kat = params.get('kat') || 'herren';
    if (!PS.categories[kat]) kat = 'herren';
    var cat = PS.categories[kat];
    var isBikes = cat.type === 'bikes';
    var q = params.get('q') || '';
    var PER_PAGE = 12;
    var bereichLabel = { herren: 'Herren', damen: 'Damen', teile: 'Teile & Zubehör', accessoires: 'Accessoires' };
    var approvalLabel = { abe: 'Mit ABE / EG-Genehmigung', eintragung: 'Eintragungspflichtig', keine: 'Ohne Straßenzulassung', none: 'Keine Zulassung nötig' };
    var stockLabel = { lager: 'Sofort lieferbar', bestellung: 'Lieferbar in 5–7 Tagen' };

    // Basis-Menge
    var base;
    if (isBikes) base = PS.bikes.slice();
    else if (kat === 'neuheiten') base = PS.products.filter(function (p) { return p.isNew; });
    else if (kat === 'sale') base = PS.products.filter(function (p) { return p.compareAt; });
    else if (kat === 'suche') base = PS.searchAll(q).products;
    else base = PS.products.filter(function (p) { return p.kat === kat; });

    // Filterdefinitionen
    function uniq(arr) { return arr.filter(function (v, i) { return v != null && arr.indexOf(v) === i; }); }
    var DEF = {
      typ: { label: 'Kategorie', get: function (p) { return [p.typ]; }, opts: function () { return uniq(base.map(function (p) { return p.typ; })).map(function (k) { return [k, (PS.subcats[kat] || {})[k] || k]; }); } },
      groesse: { label: 'Größe', get: function (p) { return p.sizes || []; }, opts: function () { var order = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']; return uniq([].concat.apply([], base.map(function (p) { return p.sizes || []; }))).sort(function (a, b) { var ia = order.indexOf(a), ib = order.indexOf(b); return (ia > -1 && ib > -1) ? ia - ib : (ia > -1 ? -1 : ib > -1 ? 1 : a - b); }).map(function (s) { return [s, s]; }); } },
      farbe: isBikes
        ? { label: 'Farbe', get: function (b) { return [b.color]; }, opts: function () { return uniq(base.map(function (b) { return b.color; })).sort().map(function (c) { return [c, c]; }); } }
        : { label: 'Farbe', swatch: true, get: function (p) { return p.colors.map(function (c) { return c.key; }); }, opts: function () { return uniq([].concat.apply([], base.map(function (p) { return p.colors.map(function (c) { return c.key; }); }))).map(function (k) { return [k, PS.colors[k].name, PS.colors[k].hex]; }); } },
      kollektion: { label: 'Kollektion', get: function (p) { return [p.collection]; }, opts: function () { return uniq(base.map(function (p) { return p.collection; })).map(function (c) { return [c, c]; }); } },
      zustand: { label: 'Zustand', get: function (b) { return [b.zustand]; }, opts: function () { return [['neu', 'Neu'], ['gebraucht', 'Gebraucht'], ['vorfuehrer', 'Vorführer']]; } },
      familie: { label: 'Modellfamilie', get: function (x) { return isBikes ? [x.family] : x.families; }, opts: function () { return PS.families.filter(function (f) { return base.some(function (x) { return (isBikes ? [x.family] : x.families).indexOf(f) > -1; }); }).map(function (f) { return [f, f]; }); } },
      modell: { label: 'Modell', get: function (b) { return [b.name]; }, opts: function () { return uniq(base.map(function (b) { return b.name; })).sort().map(function (m) { return [m, m]; }); } },
      marke: { label: 'Marke', get: function (p) { return [p.brand]; }, opts: function () { return uniq(base.map(function (p) { return p.brand; })).map(function (m) { return [m, m]; }); } },
      zulassung: { label: 'Zulassung', get: function (p) { return [p.approval]; }, opts: function () { return uniq(base.map(function (p) { return p.approval; })).map(function (a) { return [a, approvalLabel[a]]; }); } },
      lager: { label: 'Verfügbarkeit', get: function (p) { return [p.stock]; }, opts: function () { return uniq(base.map(function (p) { return p.stock; })).map(function (s) { return [s, stockLabel[s]]; }); } },
      bereich: { label: 'Bereich', get: function (p) { return [p.kat]; }, opts: function () { return uniq(base.map(function (p) { return p.kat; })).map(function (k) { return [k, bereichLabel[k]]; }); } },
      baujahr1: { label: 'Baujahr', single: true, get: function (p) { return p.years; }, opts: function () { var o = []; for (var y = 2026; y >= 2014; y--) o.push([String(y), String(y)]); return o; } },
      preis: { label: 'Preis', range: true, unit: '€', get: function (x) { return x.price; } },
      baujahr: { label: 'Baujahr', range: true, get: function (b) { return b.year; } },
      km: { label: 'km-Stand', range: true, unit: 'km', get: function (b) { return b.km; } },
    };

    // Zustand aus der URL
    var state = { f: {}, r: {}, sort: 'relevanz', page: 1, cols: isBikes ? '3' : '4' };
    cat.filters.forEach(function (k) { if (!DEF[k].range) state.f[k] = []; });
    if (params.get('typ') && state.f.typ) state.f.typ = params.get('typ').split(',');
    if (params.get('zustand') && state.f.zustand) state.f.zustand = params.get('zustand').split(',');
    if (params.get('kollektion') && state.f.kollektion) state.f.kollektion = params.get('kollektion').split(',');
    if (params.get('bereich') && state.f.bereich) state.f.bereich = params.get('bereich').split(',');
    if (params.get('familie') && state.f.familie) {
      state.f.familie = params.get('familie').split(',').map(function (s) { return Object.keys(PS.familySlug).find(function (f) { return PS.familySlug[f] === s; }) || s; });
    }

    function matches(x, skip) {
      return Object.keys(state.f).every(function (k) {
        if (k === skip || !state.f[k].length) return true;
        if (DEF[k].single) { var y = +state.f[k][0]; return x.years[0] <= y && y <= x.years[1]; }
        var vals = DEF[k].get(x) || [];
        return state.f[k].some(function (v) { return vals.indexOf(v) > -1; });
      }) && Object.keys(state.r).every(function (k) {
        var r = state.r[k], v = DEF[k].get(x);
        return (r[0] === '' || v >= +r[0]) && (r[1] === '' || v <= +r[1]);
      });
    }
    var SORTS = isBikes
      ? { relevanz: ['Neueste zuerst', function (a, b) { return b.date - a.date; }], preis_auf: ['Preis aufsteigend', function (a, b) { return a.price - b.price; }], preis_ab: ['Preis absteigend', function (a, b) { return b.price - a.price; }], baujahr: ['Baujahr (neueste)', function (a, b) { return b.year - a.year; }], km: ['km-Stand (niedrigste)', function (a, b) { return a.km - b.km; }] }
      : { relevanz: ['Relevanz', function (a, b) { return (b.rating * Math.log(b.reviews + 1)) - (a.rating * Math.log(a.reviews + 1)); }], neu: ['Neuheiten', function (a, b) { return (b.isNew - a.isNew) || (b.date - a.date); }], preis_auf: ['Preis aufsteigend', function (a, b) { return a.price - b.price; }], preis_ab: ['Preis absteigend', function (a, b) { return b.price - a.price; }] };

    // ---- Markup ----
    var title = kat === 'suche' ? 'Suche: „' + esc(q) + '“' : cat.title;
    main.innerHTML =
      '<section class="page-banner on-dark textured"><div class="container page-banner__inner"><div class="page-banner__text">' +
        '<nav class="breadcrumb" aria-label="Brotkrumen"><ol><li><a href="index.html">Home</a></li><li><span aria-current="page">' + (kat === 'suche' ? 'Suche' : cat.title) + '</span></li></ol></nav>' +
        '<h1>' + title + '</h1>' + (cat.intro ? '<p>' + cat.intro + '</p>' : '') +
      '</div><div class="page-banner__media"><img src="assets/img/' + cat.banner + '" alt="" width="1200" height="600"></div></div></section>' +
      '<div class="container">' +
        '<div class="filterbar"><span class="filterbar__label">Filtern nach</span>' +
          cat.filters.map(function (k) { return '<div class="fdrop" data-fdrop="' + k + '"><button class="fdrop__btn" type="button" aria-expanded="false" aria-controls="fp-' + k + '">' + DEF[k].label + '<span class="dot" data-dot="' + k + '" hidden></span>' + I('chevron-down') + '</button><div class="fdrop__panel" id="fp-' + k + '" hidden>' + filterControls(k, 'd') + '</div></div>'; }).join('') +
          '<button class="btn btn--outline-dark btn--sm filterbar__mobile" type="button" data-open="filter-sheet">' + I('sliders-horizontal') + 'Filter<span class="dot" data-dot-all hidden></span></button>' +
          '<div class="filterbar__right"><label class="sort"><span class="hide-mobile">Sortieren:</span><select class="select" data-sort aria-label="Sortieren">' +
            Object.keys(SORTS).map(function (k) { return '<option value="' + k + '">' + SORTS[k][0] + '</option>'; }).join('') + '</select></label>' +
            '<div class="grid-toggle" role="group" aria-label="Spalten">' + (isBikes ? ['2', '3'] : ['2', '3', '4']).map(function (c) { return '<button type="button" data-cols="' + c + '" aria-pressed="' + (c === state.cols) + '" aria-label="' + c + ' Spalten">' + colsIcon(+c) + '</button>'; }).join('') + '</div>' +
          '</div></div>' +
        '<div class="active-filters" data-active aria-live="polite"></div>' +
        '<h2 class="sr-only">' + (isBikes ? 'Fahrzeuge' : 'Produkte') + '</h2>' +
        '<div class="product-grid' + (isBikes ? ' product-grid--bikes' : '') + '" data-grid data-cols="' + state.cols + '"></div>' +
        '<nav class="pagination" data-pagination aria-label="Seiten"></nav>' +
      '</div>' +
      '<div class="section--tight"></div>';

    // Mobile Filter-Sheet
    document.body.insertAdjacentHTML('beforeend', '<dialog class="modal filter-sheet" id="filter-sheet" aria-labelledby="fs-title"><div class="modal__inner">' +
      '<div class="modal__head"><h2 class="h3" id="fs-title">Filter</h2><button class="icon-btn" type="button" data-close aria-label="Filter schließen">' + I('x') + '</button></div>' +
      '<div class="modal__body">' + cat.filters.map(function (k) { return '<details class="acc"><summary>' + DEF[k].label + I('plus') + '</summary><div class="acc__body">' + filterControls(k, 'm') + '</div></details>'; }).join('') + '</div>' +
      '<div class="modal__foot"><button class="btn btn--text" type="button" data-reset>Zurücksetzen</button><button class="btn btn--primary" type="button" data-close data-show-count>Ergebnisse anzeigen</button></div></div></dialog>');

    // Spalten-Icon wie im Template: n senkrechte Balken
    function colsIcon(n) {
      var w = 20, gap = 2, bw = (w - gap * (n - 1)) / n, r = '';
      for (var i = 0; i < n; i++) r += '<rect x="' + (i * (bw + gap)) + '" y="0" width="' + bw + '" height="16" rx="1"/>';
      return '<svg viewBox="0 0 20 16" aria-hidden="true" focusable="false">' + r + '</svg>';
    }
    function filterControls(k, prefix) {
      var d = DEF[k];
      if (d.range) {
        var vals = base.map(d.get), min = Math.min.apply(null, vals), max = Math.max.apply(null, vals);
        return '<div class="frange"><div class="field"><label for="' + prefix + k + '-min">von' + (d.unit ? ' (' + d.unit + ')' : '') + '</label><input class="input" type="number" inputmode="numeric" id="' + prefix + k + '-min" data-range="' + k + '" data-end="0" placeholder="' + Math.floor(min) + '"></div><span>–</span>' +
          '<div class="field"><label for="' + prefix + k + '-max">bis' + (d.unit ? ' (' + d.unit + ')' : '') + '</label><input class="input" type="number" inputmode="numeric" id="' + prefix + k + '-max" data-range="' + k + '" data-end="1" placeholder="' + Math.ceil(max) + '"></div></div>';
      }
      if (d.single) {
        return '<label class="field"><span class="label">Baujahr deines Motorrads</span><select class="select" data-single="' + k + '"><option value="">Alle Baujahre</option>' + d.opts().map(function (o) { return '<option value="' + o[0] + '">' + o[1] + '</option>'; }).join('') + '</select></label>';
      }
      return '<div class="fgroup">' + d.opts().map(function (o) {
        var n = base.filter(function (x) { return (d.get(x) || []).indexOf(o[0]) > -1; }).length;
        return '<label class="check"><input type="checkbox" data-filter="' + k + '" value="' + esc(o[0]) + '">' + (o[2] ? '<span class="fgroup__swatch" style="background:' + o[2] + '"></span>' : '') + esc(o[1]) + '<span class="fgroup__count">' + n + '</span></label>';
      }).join('') + '</div>';
    }

    var grid = $('[data-grid]', main), pag = $('[data-pagination]', main), active = $('[data-active]', main);

    function labelFor(k, v) { var o = (DEF[k].opts ? DEF[k].opts() : []).find(function (x) { return x[0] === v; }); return o ? o[1] : v; }

    function syncControls() {
      $$('[data-filter]').forEach(function (cb) { cb.checked = state.f[cb.dataset.filter].indexOf(cb.value) > -1; });
      $$('[data-single]').forEach(function (s) { s.value = state.f[s.dataset.single][0] || ''; });
      $$('[data-range]').forEach(function (inp) { var r = state.r[inp.dataset.range]; inp.value = r ? r[+inp.dataset.end] : ''; });
      var total = 0;
      cat.filters.forEach(function (k) {
        var n = DEF[k].range ? (state.r[k] ? 1 : 0) : state.f[k].length;
        total += n;
        $$('[data-dot="' + k + '"]').forEach(function (d) { d.textContent = n; d.hidden = !n; });
      });
      $$('[data-dot-all]').forEach(function (d) { d.textContent = total; d.hidden = !total; });
    }

    function syncUrl() {
      var u = new URLSearchParams(); u.set('kat', kat); if (q) u.set('q', q);
      Object.keys(state.f).forEach(function (k) {
        if (!state.f[k].length) return;
        var v = k === 'familie' ? state.f[k].map(function (f) { return PS.familySlug[f] || f; }) : state.f[k];
        if (['typ', 'zustand', 'kollektion', 'bereich', 'familie'].indexOf(k) > -1) u.set(k, v.join(','));
      });
      history.replaceState(null, '', location.pathname + '?' + u.toString());
    }

    function render() {
      var list = base.filter(function (x) { return matches(x); }).sort(SORTS[state.sort][1]);
      var pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
      state.page = Math.min(state.page, pages);
      var slice = list.slice((state.page - 1) * PER_PAGE, state.page * PER_PAGE);
      grid.dataset.cols = state.cols;
      grid.innerHTML = slice.length ? slice.map(isBikes ? PS.bikeCard : PS.productCard).join('') :
        '<div class="empty" style="grid-column:1/-1">' + I('search', 'icon--lg') + '<h2 class="h3">Keine Treffer</h2><p class="muted">Passe die Filter an oder setze sie zurück.</p><button class="btn btn--secondary" type="button" data-reset>Filter zurücksetzen</button></div>';

      // aktive Filter als Chips
      var chips = [];
      Object.keys(state.f).forEach(function (k) {
        state.f[k].forEach(function (v) { chips.push('<button class="chip" type="button" data-unset="' + k + '" data-value="' + esc(v) + '">' + DEF[k].label + ': ' + esc(labelFor(k, v)) + I('x') + '<span class="sr-only"> entfernen</span></button>'); });
      });
      Object.keys(state.r).forEach(function (k) {
        var r = state.r[k], u = DEF[k].unit ? ' ' + DEF[k].unit : '';
        chips.push('<button class="chip" type="button" data-unset-range="' + k + '">' + DEF[k].label + ': ' + (r[0] || '…') + '–' + (r[1] || '…') + u + I('x') + '<span class="sr-only"> entfernen</span></button>');
      });
      active.innerHTML = '<span class="active-filters__count"><strong>' + list.length + '</strong> ' + (isBikes ? (list.length === 1 ? 'Motorrad' : 'Motorräder') : (list.length === 1 ? 'Artikel' : 'Artikel')) + '</span>' +
        chips.join('') + (chips.length ? '<button class="reset" type="button" data-reset>Alle zurücksetzen</button>' : '');
      $$('[data-show-count]').forEach(function (b) { b.textContent = list.length + ' Ergebnisse anzeigen'; });

      // Pagination
      if (pages > 1) {
        var h = '<button type="button" data-goto-page="' + (state.page - 1) + '"' + (state.page === 1 ? ' disabled' : '') + ' aria-label="Vorherige Seite">' + I('chevron-left') + '</button>';
        for (var n = 1; n <= pages; n++) h += '<button type="button" data-goto-page="' + n + '"' + (n === state.page ? ' aria-current="page"' : '') + ' aria-label="Seite ' + n + '">' + n + '</button>';
        h += '<button type="button" data-goto-page="' + (state.page + 1) + '"' + (state.page === pages ? ' disabled' : '') + ' aria-label="Nächste Seite">' + I('chevron-right') + '</button>';
        pag.innerHTML = h; pag.hidden = false;
      } else { pag.innerHTML = ''; pag.hidden = true; }

      syncControls(); syncUrl();
    }

    // ---- Interaktion ----
    document.addEventListener('change', function (e) {
      var t = e.target;
      if (t.matches('[data-filter]')) {
        var arr = state.f[t.dataset.filter], i = arr.indexOf(t.value);
        if (t.checked && i < 0) arr.push(t.value); if (!t.checked && i > -1) arr.splice(i, 1);
      } else if (t.matches('[data-single]')) {
        state.f[t.dataset.single] = t.value ? [t.value] : [];
      } else if (t.matches('[data-range]')) {
        var k = t.dataset.range, r = state.r[k] || ['', ''];
        r[+t.dataset.end] = t.value;
        if (r[0] === '' && r[1] === '') delete state.r[k]; else state.r[k] = r;
      } else if (t.matches('[data-sort]')) {
        state.sort = t.value;
      } else return;
      state.page = 1; render();
    });
    document.addEventListener('click', function (e) {
      var b;
      if ((b = e.target.closest('[data-unset]'))) { var a = state.f[b.dataset.unset]; a.splice(a.indexOf(b.dataset.value), 1); state.page = 1; render(); return; }
      if ((b = e.target.closest('[data-unset-range]'))) { delete state.r[b.dataset.unsetRange]; render(); return; }
      if (e.target.closest('[data-reset]')) { Object.keys(state.f).forEach(function (k) { state.f[k] = []; }); state.r = {}; state.page = 1; render(); return; }
      if ((b = e.target.closest('[data-goto-page]'))) { state.page = +b.dataset.gotoPage; render(); $('.filterbar').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }); return; }
      if ((b = e.target.closest('.grid-toggle [data-cols]'))) { state.cols = b.dataset.cols; $$('.grid-toggle [data-cols]').forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); render(); return; }
      // Dropdowns
      var btn = e.target.closest('.fdrop__btn');
      $$('.fdrop').forEach(function (fd) {
        var own = fd.querySelector('.fdrop__btn'), panel = fd.querySelector('.fdrop__panel');
        var open = btn === own ? own.getAttribute('aria-expanded') !== 'true' : (fd.contains(e.target) && own.getAttribute('aria-expanded') === 'true');
        own.setAttribute('aria-expanded', open); panel.hidden = !open;
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      var open = $('.fdrop__btn[aria-expanded="true"]');
      if (open) { open.setAttribute('aria-expanded', 'false'); open.nextElementSibling.hidden = true; open.focus(); }
    });

    document.title = (kat === 'suche' ? 'Suche' : cat.title) + ' – Power Shop';
    render();
  }

  /* ======================================================================
     Produktdetailseiten
     ====================================================================== */
  function breadcrumb(items) {
    return '<nav class="breadcrumb" aria-label="Brotkrumen"><ol>' + items.map(function (it, i) {
      return '<li>' + (i === items.length - 1 ? '<span aria-current="page">' + esc(it[0]) + '</span>' : '<a href="' + it[1] + '">' + esc(it[0]) + '</a>') + '</li>';
    }).join('') + '</ol></nav>';
  }
  function gallery(images, opts) {
    opts = opts || {};
    return '<div class="gallery' + (opts.wide ? ' gallery--wide' : '') + '" data-gallery>' +
      '<div class="gallery__main"><img src="' + images[0] + '" alt="' + esc(opts.alt || '') + '" width="' + (opts.wide ? 1600 : 800) + '" height="1000" data-gallery-main>' +
        (opts.badges ? '<div class="gallery__badges">' + opts.badges + '</div>' : '') +
        '<button class="gallery__zoom" type="button" data-zoom aria-label="Bild vergrößern">' + I('maximize-2') + '</button></div>' +
      '<div class="gallery__thumbs" role="group" aria-label="Weitere Bilder">' + images.map(function (src, i) {
        return '<button type="button" data-thumb="' + src + '" aria-current="' + (i === 0) + '" aria-label="Bild ' + (i + 1) + ' von ' + images.length + '"><img src="' + src + '" alt="" width="160" height="200" loading="lazy"></button>';
      }).join('') + '</div></div>' +
      '<dialog class="modal lightbox" id="lightbox" aria-label="Bildansicht"><div class="modal__inner"><div class="modal__head"><span class="small">' + esc(opts.alt || '') + '</span><button class="icon-btn" type="button" data-close aria-label="Schließen">' + I('x') + '</button></div><img src="' + images[0] + '" alt="' + esc(opts.alt || '') + '" data-lightbox-img></div></dialog>';
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-thumb]');
    if (t) {
      var g = t.closest('[data-gallery]');
      $('[data-gallery-main]', g).src = t.dataset.thumb;
      $$('[data-thumb]', g).forEach(function (x) { x.setAttribute('aria-current', x === t); });
      return;
    }
    if (e.target.closest('[data-zoom]')) {
      var gal = e.target.closest('[data-gallery]');
      $('[data-lightbox-img]').src = $('[data-gallery-main]', gal).src;
      PS.openDialog('lightbox', e.target.closest('[data-zoom]'));
    }
  });
  function usp() {
    return '<ul class="usp">' +
      '<li>' + I('truck') + 'Lieferzeit ' + shop.deliveryTime + ' · versandkostenfrei ab ' + PS.moneyInt(shop.freeShipping) + '</li>' +
      '<li>' + I('rotate-ccw') + shop.returnDays + ' Tage Rückgabe (gesetzliches Widerrufsrecht: 14 Tage)</li>' +
      '<li>' + I('store') + 'Abholung im Power Shop möglich</li></ul>';
  }
  function acc(title, body, open) { return '<details class="acc"' + (open ? ' open' : '') + '><summary>' + title + I('plus') + '</summary><div class="acc__body">' + body + '</div></details>'; }
  function gpsr(p) {
    return acc('Herstellerinformationen', '<p><strong>Hersteller:</strong> ' + (p.brand === 'Zubehör' ? 'Zubehör-Hersteller GmbH (Platzhalter), Musterweg 2, 12345 Musterstadt' : 'Harley-Davidson Motor Company, 3700 W Juneau Ave, Milwaukee, WI 53208, USA') + '</p>' +
      '<p><strong>Verantwortliche Person in der EU:</strong> Harley-Davidson Europe (Platzhalter – Angaben laut Hersteller)</p>' +
      '<p><strong>Sicherheitshinweise:</strong> ' + (p.gpsrNote ? p.gpsrNote + '. ' : '') + 'Bitte Pflege- und Gebrauchshinweise beachten. Produktsicherheitsangaben gemäß GPSR (EU 2023/988).</p>');
  }
  function productRail(list, id, title) {
    if (!list.length) return '';
    return '<section class="section--tight"><div class="section-head"><h2>' + title + '</h2><div class="rail-nav"><button type="button" data-rail-prev="' + id + '" aria-label="Zurück">' + I('chevron-left') + '</button><button type="button" data-rail-next="' + id + '" aria-label="Weiter">' + I('chevron-right') + '</button></div></div>' +
      '<div class="rail" id="' + id + '" style="grid-auto-columns:minmax(220px, calc((100% - 72px) / 4))">' + list.map(PS.productCard).join('') + '</div></section>';
  }
  function afterRender(root) {
    $$('.rail', root).forEach(initRail);
    PS.initContactBoxes(root);
  }

  function initApparel() {
    var main = $('[data-pdp="apparel"]'); if (!main) return;
    var p = PS.findProduct(params.get('id')) || PS.findProduct('h1');
    if (p.kat === 'teile') { location.replace(p.url); return; }
    PS.store.addRecent(p.id);
    var cat = PS.categories[p.kat], sub = PS.subcats[p.kat][p.typ];
    var images = [p.image, p.image2].concat(PS.products.filter(function (x) { return x.kat === p.kat && x.image !== p.image && x.image !== p.image2; }).map(function (x) { return x.image; }).filter(function (v, i, a) { return a.indexOf(v) === i; }).slice(0, 2));
    var color = p.colors[0];
    var badges = (p.isNew ? '<span class="badge">Neu</span>' : '') + (p.compareAt ? '<span class="badge badge--sale">Sale</span>' : '');
    document.title = p.name + ' – Power Shop';

    main.innerHTML = '<div class="container">' +
      '<div style="padding-top:20px">' + breadcrumb([['Home', 'index.html'], [cat.title, 'kollektion.html?kat=' + p.kat], [sub, 'kollektion.html?kat=' + p.kat + '&typ=' + p.typ], [p.name]]) + '</div>' +
      '<div class="pdp">' + gallery(images, { alt: p.name, badges: badges }) +
      '<div class="pdp__info">' +
        '<p class="eyebrow">' + esc(PS.catLabel(p)) + (p.collection ? ' · ' + esc(p.collection) : '') + '</p>' +
        '<h1 class="pdp__title">' + esc(p.name) + '</h1>' +
        '<div class="pdp__meta">' + PS.stars(p.rating, p.reviews) + '<a class="text-link small" href="#bewertungen">Bewertungen lesen</a></div>' +
        '<div class="pdp__price">' + PS.priceBlock(p, { long: true }) + '</div>' +
        (p.colors.length ? '<div class="pdp__row"><div class="pdp__row-head"><span><strong>Farbe:</strong> <span data-color-name>' + color.name + '</span></span></div><div class="swatches" role="group" aria-label="Farbe wählen">' +
          p.colors.map(function (c, i) { return '<button class="swatch-btn" type="button" data-color="' + c.name + '" aria-pressed="' + (i === 0) + '" aria-label="' + c.name + '"><span class="swatch" style="background:' + c.hex + '"></span></button>'; }).join('') + '</div></div>' : '') +
        (p.sizes ? '<div class="pdp__row"><div class="pdp__row-head"><span id="size-label"><strong>Größe:</strong> <span data-size-name>bitte wählen</span></span>' +
          '<button class="text-link small" type="button" data-open="sizeguide" data-type="' + (p.sizeType || 'oberteile') + '">' + I('ruler', 'icon--sm') + ' Größentabelle</button></div>' +
          '<div class="size-grid" role="group" aria-labelledby="size-label">' + p.sizes.map(function (s) {
            var out = p.soldOut.indexOf(s) > -1;
            return '<button class="size-chip' + (out ? ' is-soldout' : '') + '" type="button" data-pick-size="' + s + '" aria-pressed="false"' + (out ? ' aria-disabled="true" aria-label="Größe ' + s + ' – ausverkauft"' : '') + '>' + s + '</button>';
          }).join('') + '</div>' +
          (p.soldOut.length ? '<p class="small muted">Größe ' + p.soldOut.join(', ') + ' ausverkauft – <button class="text-link" type="button" data-todo="Benachrichtigung bei Verfügbarkeit">benachrichtige mich</button></p>' : '') +
          '<p class="small" data-size-error role="alert" style="color:var(--c-error)"></p></div>' : '') +
        '<div class="pdp__buy"><div class="qty"><button type="button" data-q="-1" aria-label="Menge verringern">' + I('minus', 'icon--sm') + '</button><input type="number" value="1" min="1" max="9" aria-label="Menge" data-q-input><button type="button" data-q="1" aria-label="Menge erhöhen">' + I('plus', 'icon--sm') + '</button></div>' +
          '<button class="btn btn--primary" type="button" data-buy>' + I('shopping-bag') + 'In den Warenkorb</button>' +
          '<button class="wish-btn" type="button" data-wish="' + p.id + '" aria-pressed="' + PS.store.isWished(p.id) + '" aria-label="Merken">' + I('heart') + '</button></div>' +
        usp() +
        '<div>' +
          acc('Beschreibung', '<p>Robust, bequem und mit dem typischen Harley-Look: Dieses Teil begleitet dich vom ersten Kilometer an. Hochwertige Materialien, sauber verarbeitete Details und eine Passform, die auf dem Bike und im Alltag funktioniert.</p><ul><li>Offizielle Harley-Davidson MotorClothes</li><li>Robuste Nähte und Metall-Hardware</li><li>Innentasche mit Reißverschluss</li></ul>', true) +
          acc('Material & Pflege', '<p>' + (p.material || 'Obermaterial: 100 % Baumwolle') + '</p><p>Pflege: Siehe Etikett. Leder mit geeigneter Lederpflege behandeln, nicht in den Trockner.</p>') +
          acc('Passform', '<p><strong>Fällt normal aus.</strong> Das Model ist 1,85 m groß und trägt Größe M.</p><p>Unsicher? Wirf einen Blick in die <button class="text-link" type="button" data-open="sizeguide" data-type="' + (p.sizeType || 'oberteile') + '">Größentabelle</button>.</p>') +
          acc('Versand & Rückgabe', '<p>Lieferzeit ' + shop.deliveryTime + '. Versandkostenfrei ab ' + PS.moneyInt(shop.freeShipping) + ', darunter ' + PS.money(shop.shippingCost) + '. ' + shop.returnDays + ' Tage kostenlose Rückgabe; dein gesetzliches Widerrufsrecht (14 Tage) bleibt unberührt.</p>') +
          gpsr(p) +
        '</div>' +
      '</div></div>' +
      '<section class="section--tight" id="bewertungen"><div class="section-head"><h2>Bewertungen</h2>' + PS.stars(p.rating, p.reviews) + '</div>' +
        '<div class="note">' + I('badge-check') + '<div><strong>Geprüfte Bewertungen</strong><br>Bewertungen stammen nur von Kund:innen, die das Produkt bei uns gekauft haben (Pflichthinweis nach UWG). Im Shop übernimmt das eine Bewertungs-App.</div></div></section>' +
      productRail(PS.products.filter(function (x) { return x.kat === p.kat && x.id !== p.id; }).slice(0, 8), 'rail-similar', 'Das könnte dir auch gefallen') +
      productRail(PS.store.recent.filter(function (id) { return id !== p.id; }).map(PS.findProduct).filter(Boolean), 'rail-recent', 'Zuletzt angesehen') +
    '</div>';

    var size = null;
    main.addEventListener('click', function (e) {
      var c = e.target.closest('[data-color]');
      if (c) { $$('[data-color]', main).forEach(function (x) { x.setAttribute('aria-pressed', x === c); }); $('[data-color-name]', main).textContent = c.dataset.color; }
      var s = e.target.closest('[data-pick-size]');
      if (s && s.getAttribute('aria-disabled') !== 'true') {
        size = s.dataset.pickSize;
        $$('[data-pick-size]', main).forEach(function (x) { x.setAttribute('aria-pressed', x === s); });
        $('[data-size-name]', main).textContent = size; $('[data-size-error]', main).textContent = '';
      }
      var q = e.target.closest('[data-q]');
      if (q) { var inp = $('[data-q-input]', main); inp.value = Math.max(1, Math.min(9, (+inp.value || 1) + (+q.dataset.q))); }
      if (e.target.closest('[data-buy]')) {
        if (p.sizes && !size) { $('[data-size-error]', main).textContent = 'Bitte wähle zuerst eine Größe.'; $('[data-pick-size]:not([aria-disabled="true"])', main).focus(); return; }
        PS.store.addToCart(p.id, size, +$('[data-q-input]', main).value || 1);
        PS.openDialog('cart-drawer', e.target.closest('[data-buy]'));
      }
    });
    afterRender(main);
  }

  function initPart() {
    var main = $('[data-pdp="part"]'); if (!main) return;
    var p = PS.findProduct(params.get('id')) || PS.findProduct('t1');
    if (p.kat !== 'teile') { location.replace(p.url); return; }
    PS.store.addRecent(p.id);
    var sub = PS.subcats.teile[p.typ];
    var images = [p.image, p.image2, 'assets/img/p-teile-' + ((p.img % 6) + 1) + '.jpg'];
    var approval = {
      abe: ['badge--abe', 'shield-check', 'Mit ABE / EG-Genehmigung', 'Darf ohne Eintragung verbaut werden. Die ABE bzw. EG-Genehmigung liegt bei und muss mitgeführt werden.'],
      eintragung: ['badge--eintragung', 'circle-alert', 'Eintragungspflichtig', 'Nach dem Einbau ist eine Abnahme (z. B. TÜV/DEKRA) und Eintragung in die Fahrzeugpapiere nötig. Wir erledigen das auf Wunsch für dich.'],
      keine: ['badge--keine', 'circle-alert', 'Ohne Straßenzulassung', 'Nur für den Einsatz auf abgesperrten Strecken (Rennsport). Im öffentlichen Straßenverkehr nicht zulässig.'],
    }[p.approval];
    var families = p.families.join(', ');
    document.title = p.name + ' – Power Shop';

    main.innerHTML = '<div class="container">' +
      '<div style="padding-top:20px">' + breadcrumb([['Home', 'index.html'], ['Teile & Zubehör', 'kollektion.html?kat=teile'], [sub, 'kollektion.html?kat=teile&typ=' + p.typ], [p.name]]) + '</div>' +
      '<div class="pdp">' + gallery(images, { alt: p.name, badges: (p.isNew ? '<span class="badge">Neu</span>' : '') + (p.compareAt ? '<span class="badge badge--sale">Sale</span>' : '') }) +
      '<div class="pdp__info">' +
        '<p class="eyebrow">' + esc(p.brand) + ' · ' + esc(sub) + '</p>' +
        '<h1 class="pdp__title">' + esc(p.name) + '</h1>' +
        '<div class="pdp__meta"><span class="partno">Art.-Nr. <code data-partno>' + p.partNo + '</code><button type="button" data-copy="' + p.partNo + '" aria-label="Teilenummer kopieren">' + I('copy', 'icon--sm') + '</button></span>' + PS.stars(p.rating, p.reviews) + '</div>' +
        '<div class="pdp__price">' + PS.priceBlock(p, { long: true }) + '<p class="stock' + (p.stock === 'bestellung' ? ' stock--order' : '') + '">' + (p.stock === 'lager' ? 'Auf Lager – Lieferzeit ' + shop.deliveryTime : 'Lieferbar in 5–7 Werktagen') + '</p></div>' +
        // Kompatibilität
        '<div class="compat"><div class="compat__head">' + I('circle-check') + '<div><strong>Passt für: ' + esc(families) + ' ' + p.years[0] + '–' + p.years[1] + '</strong><p>' + p.compat.length + ' kompatible Modelle · Angaben laut Hersteller</p></div></div>' +
          '<details><summary>Alle kompatiblen Modelle anzeigen' + I('chevron-down', 'icon--sm') + '</summary><div class="compat__table">' +
            '<label class="sr-only" for="compat-q">Modell suchen</label><input class="input" id="compat-q" type="search" placeholder="Modell suchen, z. B. Street Glide" data-compat-q>' +
            '<div class="compat__scroll"><table><thead><tr><th scope="col">Modellfamilie</th><th scope="col">Modell</th><th scope="col">Baujahre</th></tr></thead><tbody data-compat-rows>' +
              p.compat.map(function (c) { return '<tr><td>' + c.family + '</td><td>' + c.model + '</td><td>' + c.from + '–' + c.to + '</td></tr>'; }).join('') +
            '</tbody></table></div><p class="small muted" data-compat-empty hidden>Kein passendes Modell gefunden – frag uns kurz, wir prüfen das für dich.</p></div></details>' +
          '<div class="compat__foot"><span>Unsicher? Frag unsere Werkstatt:</span><a class="btn btn--text" href="tel:' + shop.phoneHref + '">' + I('phone', 'icon--sm') + 'Anrufen</a><a class="btn btn--text" href="#werkstatt-kontakt">' + I('message-circle', 'icon--sm') + 'WhatsApp / E-Mail</a></div></div>' +
        (approval ? '<div class="approval"><span class="badge ' + approval[0] + '">' + I(approval[1]) + approval[2] + '</span><span class="tip"><button class="tip__btn" type="button" aria-describedby="tip-approval" aria-label="Was bedeutet das?">' + I('info') + '</button><span class="tip__bubble" role="tooltip" id="tip-approval">' + approval[3] + '</span></span></div>' : '') +
        '<div class="note">' + I('wrench') + '<div>Einbau durch Fachwerkstatt empfohlen. <a class="text-link" href="service.html#werkstatt">Werkstatt-Termin anfragen</a></div></div>' +
        '<div class="pdp__buy"><div class="qty"><button type="button" data-q="-1" aria-label="Menge verringern">' + I('minus', 'icon--sm') + '</button><input type="number" value="1" min="1" max="9" aria-label="Menge" data-q-input><button type="button" data-q="1" aria-label="Menge erhöhen">' + I('plus', 'icon--sm') + '</button></div>' +
          '<button class="btn btn--primary" type="button" data-buy>' + I('shopping-bag') + 'In den Warenkorb</button>' +
          '<button class="wish-btn" type="button" data-wish="' + p.id + '" aria-pressed="' + PS.store.isWished(p.id) + '" aria-label="Merken">' + I('heart') + '</button></div>' +
        usp() +
        '<div>' +
          acc('Beschreibung', '<p>Original-Qualität für deine Harley: passgenau gefertigt, langlebig und mit dem Look, der zu deinem Bike passt. Ideal für den Custom-Umbau oder als Ersatz.</p>', true) +
          acc('Technische Daten', '<table class="spec-table"><tbody><tr><th>Art.-Nr.</th><td>' + p.partNo + '</td></tr><tr><th>Marke</th><td>' + esc(p.brand) + '</td></tr><tr><th>Material</th><td>Stahl, verchromt (Beispiel)</td></tr><tr><th>Zulassung</th><td>' + (approval ? approval[2] : 'Keine Zulassung nötig') + '</td></tr></tbody></table>') +
          acc('Lieferumfang', '<ul><li>1 × ' + esc(p.name) + '</li><li>Montagematerial</li>' + (p.approval === 'abe' ? '<li>ABE / EG-Genehmigung</li>' : '') + '</ul>') +
          acc('Einbauanleitung', '<p><a class="text-link" href="#" data-todo="Einbauanleitung (PDF)">Einbauanleitung als PDF herunterladen</a> · Einbauzeit ca. 1–2 Stunden.</p>') +
          gpsr(p) +
          acc('Versand', '<p>Lieferzeit ' + (p.stock === 'lager' ? shop.deliveryTime : '5–7 Werktage') + '. Versandkostenfrei ab ' + PS.moneyInt(shop.freeShipping) + '. Sperrgut kann gesondert berechnet werden.</p>') +
        '</div>' +
      '</div></div>' +
      productRail(PS.products.filter(function (x) { return x.kat === 'teile' && x.id !== p.id; }).slice(0, 8), 'rail-bundle', 'Wird oft zusammen gekauft') +
      '<section class="section--tight"><div style="max-width:560px">' + PS.contactBox({ anchor: 'werkstatt-kontakt', title: 'Fragen zum Einbau?', intro: 'Unsere Werkstatt hilft dir bei Kompatibilität, Einbau und Eintragung.', topics: ['kompatibilitaet', 'einbau', 'frage'], subject: p.name + ' (Art.-Nr. ' + p.partNo + ')', ref: location.href }) + '</div></section>' +
    '</div>';

    main.addEventListener('input', function (e) {
      if (!e.target.matches('[data-compat-q]')) return;
      var v = e.target.value.toLowerCase(), shown = 0;
      $$('[data-compat-rows] tr', main).forEach(function (tr) { var on = tr.textContent.toLowerCase().indexOf(v) > -1; tr.hidden = !on; if (on) shown++; });
      $('[data-compat-empty]', main).hidden = shown > 0;
    });
    main.addEventListener('click', function (e) {
      var c = e.target.closest('[data-copy]');
      if (c) {
        var done = function () { PS.toast('Teilenummer ' + c.dataset.copy + ' kopiert.', 'copy'); };
        if (navigator.clipboard) navigator.clipboard.writeText(c.dataset.copy).then(done, done); else done();
      }
      var q = e.target.closest('[data-q]');
      if (q) { var inp = $('[data-q-input]', main); inp.value = Math.max(1, Math.min(9, (+inp.value || 1) + (+q.dataset.q))); }
      if (e.target.closest('[data-buy]')) {
        PS.store.addToCart(p.id, null, +$('[data-q-input]', main).value || 1);
        PS.openDialog('cart-drawer', e.target.closest('[data-buy]'));
      }
    });
    afterRender(main);
  }

  function initBike() {
    var main = $('[data-pdp="bike"]'); if (!main) return;
    var b = PS.findBike(params.get('id')) || PS.findBike('b3');
    var isNew = b.zustand === 'neu', reserved = b.status === 'reserviert';
    var canReserve = !isNew && !reserved;
    var sub = isNew ? ['Neufahrzeuge', 'neu'] : b.zustand === 'vorfuehrer' ? ['Vorführfahrzeuge', 'vorfuehrer'] : ['Gebrauchtfahrzeuge', 'gebraucht'];
    var label = b.name + ' (' + (isNew ? 'Modelljahr ' + b.year : 'EZ ' + b.ez) + ', Fzg.-Nr. ' + b.fzgNr + ')';
    var topics = ['probefahrt', 'finanzierung', 'inzahlungnahme'].concat(canReserve ? ['reservierung'] : [], ['frage']);
    document.title = b.name + ' – ' + PS.zustandLabel[b.zustand] + ' – Power Shop';
    document.body.classList.add('has-sticky-contact');

    var reserveNote = canReserve ? '<div class="reserve-note"><strong>' + I('clock') + 'Reservierung möglich</strong>' +
      '<p>' + shop.reservation.hours + ' h Reservierung gegen ' + PS.moneyInt(shop.reservation.fee) + ' Gebühr – wird beim Kauf angerechnet, sonst erstattet.</p>' +
      '<ol><li>Wähle oben „Reservierung“ und schreib uns per WhatsApp oder E-Mail.</li><li>Wir prüfen die Verfügbarkeit und senden dir einen Zahlungslink.</li><li>Nach Zahlung ist das Bike für dich reserviert.</li></ol></div>' : '';

    main.innerHTML = '<div class="container">' +
      '<div style="padding-top:20px">' + breadcrumb([['Home', 'index.html'], ['Motorräder', 'kollektion.html?kat=motorraeder'], [sub[0], 'kollektion.html?kat=motorraeder&zustand=' + sub[1]], [b.name]]) + '</div>' +
      '<div class="pdp">' +
        '<div>' + gallery(b.gallery, { wide: true, alt: b.name, badges: PS.bikeBadge(b) }) + '</div>' +
        '<div class="pdp__info">' +
          '<p class="eyebrow">' + esc(b.family) + ' · Fzg.-Nr. ' + b.fzgNr + '</p>' +
          '<h1 class="pdp__title">' + esc(b.name) + '</h1>' +
          '<div class="bike-price"><strong>' + PS.moneyInt(b.price) + '</strong><p>' + (isNew ? 'Gesamtpreis inkl. Überführung und Nebenkosten · ' : '') + PS.taxNote(b) + (isNew ? '' : ' · zzgl. Zulassung') + '</p></div>' +
          '<dl class="bike-facts">' +
            [['calendar', isNew ? 'Modelljahr' : 'Erstzulassung', isNew ? b.year : b.ez], ['gauge', 'km-Stand', PS.num(b.km) + ' km'], ['zap', 'Leistung', b.kw + ' kW (' + b.ps + ' PS)'], ['cog', 'Hubraum', PS.num(b.ccm) + ' cm³'], ['palette', 'Farbe', b.color], ['shield-check', 'HU bis', b.hu || 'neu']]
              .map(function (f) { return '<div><dt>' + I(f[0]) + f[1] + '</dt><dd>' + f[2] + '</dd></div>'; }).join('') +
          '</dl>' +
          (reserved ? '<div class="reserved-banner">' + I('clock') + '<span><strong>Reserviert bis ' + b.reservedUntil + '.</strong> Du kannst uns trotzdem kontaktieren – wir melden uns, falls das Bike wieder frei wird.</span></div>' : '') +
          PS.contactBox({ anchor: 'kontakt', title: 'Interesse an diesem Bike?', topics: topics, subject: label, ref: location.href, extra: reserveNote }) +
        '</div>' +
      '</div>' +
      '<div class="pdp-sections">' +
        acc('Ausstattung & Extras', '<ul class="equip">' + b.equipment.map(function (e) { return '<li>' + I('check') + e + '</li>'; }).join('') + '</ul>', true) +
        acc('Technische Daten', '<table class="spec-table"><tbody>' + [['Modellfamilie', b.family], ['Modell', b.name], ['Modelljahr', b.year], ['Hubraum', PS.num(b.ccm) + ' cm³'], ['Leistung', b.kw + ' kW (' + b.ps + ' PS)'], ['Farbe', b.color], ['Fahrzeugnummer', b.fzgNr]].map(function (r) { return '<tr><th>' + r[0] + '</th><td>' + r[1] + '</td></tr>'; }).join('') + '</tbody></table>') +
        acc('Fahrzeughistorie', isNew ? '<p>Neufahrzeug mit voller Herstellergarantie.</p>' : '<ul><li>' + (b.owners === 0 ? 'Vorführfahrzeug aus unserem Haus' : b.owners + ' Vorbesitzer') + '</li><li>Scheckheftgepflegt bei Harley-Davidson Vertragspartnern</li><li>Unfallfrei laut Vorbesitzer</li><li>Frische Inspektion vor Übergabe</li></ul>') +
        acc('Finanzierung', '<p>Wir erstellen dir ein individuelles Finanzierungs- oder Leasingangebot – passend zu Anzahlung, Laufzeit und Schlussrate. Wähle in der Kontakt-Box „Finanzierung“ und schick uns deine Anfrage.</p><p class="small muted">Hinweis fürs Livegehen: Werden Monatsraten angezeigt, ist ein repräsentatives Beispiel nach § 17 PAngV Pflicht.</p>') +
        acc('Standort & Übergabe', '<p>Besichtigung und Probefahrt im Power Shop, ' + shop.address + '. Der Kaufvertrag wird bei uns vor Ort abgeschlossen. Zulassung und Überführung übernehmen wir auf Wunsch.</p>') +
      '</div>' +
      '<section class="section--tight"><div class="section-head"><h2>Ähnliche Bikes</h2><div class="rail-nav"><button type="button" data-rail-prev="rail-bikes" aria-label="Zurück">' + I('chevron-left') + '</button><button type="button" data-rail-next="rail-bikes" aria-label="Weiter">' + I('chevron-right') + '</button></div></div>' +
        '<div class="rail showroom-rail" id="rail-bikes" style="grid-auto-columns:minmax(280px, calc((100% - 48px) / 3))">' + PS.bikes.filter(function (x) { return x.id !== b.id; }).sort(function (x, y) { return (y.family === b.family) - (x.family === b.family); }).slice(0, 6).map(PS.bikeCard).join('') + '</div></section>' +
    '</div>' +
    '<div class="sticky-contact" aria-label="Schnellkontakt"><a class="btn btn--primary" href="tel:' + shop.phoneHref + '">' + I('phone') + 'Anrufen</a><a class="btn btn--outline-light" data-sticky="wa" href="#" target="_blank" rel="noopener">' + I('message-circle') + 'WhatsApp</a><a class="btn btn--outline-light" data-sticky="mail" href="#">' + I('mail') + 'E-Mail</a></div>';

    $('#kontakt', main).dataset.primary = '';
    afterRender(main);
    if (location.hash === '#kontakt') setTimeout(function () { $('#kontakt').scrollIntoView(); }, 50);
  }

  /* ======================================================================
     Service & Styleguide
     ====================================================================== */
  function initService() {
    $$('[data-contact-slot]').forEach(function (slot) {
      var t = slot.dataset.contactSlot;
      slot.outerHTML = PS.contactBox({
        title: slot.dataset.title || 'Jetzt anfragen',
        topic: t,
        topics: t === 'werkstatt' ? ['werkstatt', 'einbau', 'frage'] : ['probefahrt', 'finanzierung', 'werkstatt', 'inzahlungnahme', 'frage'],
      });
    });
    PS.initContactBoxes(document);
  }

  function initStyleguide() {
    var cards = $('[data-sg-cards]');
    if (cards) cards.innerHTML = [PS.findProduct('h1'), PS.findProduct('d3'), PS.findProduct('t1'), PS.findProduct('a5')].map(PS.productCard).join('');
    var bikes = $('[data-sg-bikes]');
    if (bikes) bikes.innerHTML = [PS.findBike('b1'), PS.findBike('b3'), PS.findBike('b4')].map(PS.bikeCard).join('');
    var cb = $('[data-sg-contact]');
    if (cb) { cb.innerHTML = PS.contactBox({ title: 'Interesse an diesem Bike?', subject: 'Road Glide (EZ 04/2023, Fzg.-Nr. PS-23108)', topics: ['probefahrt', 'finanzierung', 'inzahlungnahme', 'reservierung', 'frage'] }); PS.initContactBoxes(cb); }
  }

  /* ---------------- Start ---------------- */
  initHero(); initNews(); initShowroom(); renderEvents();
  initCollection(); initApparel(); initPart(); initBike();
  if (page === 'service') initService();
  if (page === 'styleguide') initStyleguide();
  $$('.rail[id]').forEach(initRail);
})();
