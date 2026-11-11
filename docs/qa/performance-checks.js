/* ==========================================================================
   Prüfgerüst Performance Paket 1 (docs/plan-performance-paket-1.md). Wird nicht ausgeliefert, liegt nur im Repo.

   Benutzung: den Inhalt dieser Datei plus `await PK.run('bereich')` in einem Aufruf von javascript_tool schicken. Nach jedem
   Neuladen neu einspielen. Die Datei darf mehrfach laufen: alles steht in der IIFE, PK wird jedes Mal neu angelegt.

   PK = { checks, m, add(name, fn, when?), run(prefix?) }
     fn gibt Fehlertexte als string[] zurück (leer = bestanden), when einen Grund zum Überspringen ('' = ausführen).
     run und die Messungen scheitern sofort bei document.hidden ('Tab im Hintergrund'), bei einem Fenster ohne Größe oder
     wenn requestAnimationFrame in 1,2 s weniger als 60-mal kommt oder eine Lücke über 250 ms hat ('Pane verdeckt'): Dann stehen
     Bilder, GSAP und header.js zeitweise still und jede Messung lügt. Danach wartet run, bis die Seite 3 s geladen ist
     (header.js hält die Kopfleiste so lange still).
     Benennung der Prüfungen: 'bereich.was', z. B. 'rail.far'. So wählt PK.run('rail') den ganzen Bereich.

   Hilfen (global): wait, frames, go, until, near, into, imgs, ready, pre, mouse, entries, room, inState, neu, needMotion, fresh
   Messungen (vorher und nachher gleich benutzt): PK.m.swipe, add, reveals, cardImages, jank, beforeLoad
   ========================================================================== */
(function () {
  'use strict';

  // Resource Timing hält sonst nur 250 Einträge. Ist der Puffer voll, fallen neue weg, und entries() fände sie nicht.
  try { performance.setResourceTimingBufferSize(5000); } catch (e) { /* älterer Browser */ }

  // ---------------- Hilfen ----------------
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  // Wartet n Animation-Frames (im Hintergrund-Tab kommen keine, siehe PK.run)
  function frames(n) {
    n = n == null ? 2 : n;
    return new Promise(function (resolve) {
      (function tick() { if (n-- <= 0) resolve(); else requestAnimationFrame(tick); })();
    });
  }

  // base.css setzt scroll-behavior: smooth, ein einfaches scrollTo(0, y) gleitet. Hier springt es sofort, auch mit Lenis
  // (weiches Scrollen, nur mit feinem Zeiger und Setting): force, sonst ignoriert ein angehaltenes Lenis den Sprung.
  function jump(y) {
    window.pkMoved = true;
    if (window.PS && window.PS.lenis) {
      try { window.PS.lenis.scrollTo(y, { immediate: true, force: true }); } catch (e) { /* nativ reicht */ }
    }
    window.scrollTo({ top: y, behavior: 'instant' });
  }
  function go(y) { jump(y); return frames(2); }

  function pageTop(el) { return el.getBoundingClientRect().top + window.scrollY; }

  // el eine halbe Fensterhöhe unter den unteren Fensterrand, dann 1500 ms warten (Vorlader und Lazy-Loading arbeiten lassen)
  function near(el) {
    jump(Math.max(0, pageTop(el) - 1.5 * window.innerHeight));
    return frames(2).then(function () { return wait(1500); });
  }

  // el 100 px unter den oberen Fensterrand
  function into(el) {
    jump(Math.max(0, pageTop(el) - 100));
    return frames(2);
  }

  // Fragt fn() alle 100 ms ab: true, sobald fn() wahr ist, sonst nach ms false. Eine Ausnahme in fn zählt als „noch nicht“.
  async function until(fn, ms) {
    var end = performance.now() + (ms == null ? 6000 : ms);
    for (;;) {
      try { if (fn()) return true; } catch (e) { /* weiter warten */ }
      if (performance.now() >= end) return false;
      await wait(100);
    }
  }

  // Bilder einer Karte (oder eines Reveals) ohne das Hover-Zweitbild der Produktkarte
  function imgs(card) {
    return [].filter.call(card.querySelectorAll('img'), function (img) { return !img.classList.contains('pcard__img--alt'); });
  }

  function ready(img) { return img.complete && img.naturalWidth > 0; }

  // data-pre="why ms" (Task 2): Grund und Zeitpunkt (performance.now()) des Vorladens
  function pre(img) {
    var v = (img.getAttribute('data-pre') || '').trim();
    if (!v) return null;
    var m = /^(\S+)\s+(\d+(?:\.\d+)?)$/.exec(v);
    return m ? { why: m[1], at: +m[2] } : { why: v, at: NaN };
  }

  function mouse() { return window.matchMedia('(hover: hover) and (pointer: fine)').matches; }

  function entries(re) {
    return performance.getEntriesByType('resource').filter(function (e) { return re.test(e.name); });
  }

  function box(el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; }

  // Showroom: Section, Schiene, alle Karten (auch die versteckten)
  function room() {
    var s = document.querySelector('[data-showroom]');
    var rail = s && s.querySelector('.rail');
    return rail ? { s: s, rail: rail, cards: [].slice.call(rail.querySelectorAll('.bcard')) } : null;
  }

  // wie assets/sections.js:20–22
  function inState(card) {
    var s = card.closest('[data-showroom]');
    return (card.dataset.zustand === 'neu') === (!!s && s.dataset.showroomState === 'neu');
  }

  // Die Reiter-Liste, deren Panels Produktkarten enthalten (Neuheiten, sections/product-tabs.liquid). Hero und Größentabelle
  // haben auch Reiter, aber ohne .pcard.
  function neu() {
    function panel(tab) { return document.getElementById(tab.getAttribute('aria-controls')); }
    var lists = document.querySelectorAll('[role="tablist"]');
    for (var i = 0; i < lists.length; i++) {
      var tabs = [].slice.call(lists[i].querySelectorAll('[role="tab"]'));
      if (tabs.some(function (t) { var p = panel(t); return p && p.querySelector('.pcard'); })) {
        return { list: lists[i], tabs: tabs, panel: panel };
      }
    }
    return null;
  }

  // Gründe zum Überspringen (für when)
  function needMotion() { return document.documentElement.classList.contains('has-motion') ? '' : 'nur mit has-motion'; }
  function fresh() { return !window.pkMoved && window.scrollY === 0 ? '' : 'nur frisch geladen'; }

  // Zählt die requestAnimationFrame-Aufrufe über ms und misst die längste Lücke (auch die bis zum ersten Aufruf). Der erste Aufruf
  // nach Ablauf zählt mit. Kommt gar keiner, endet es nach ms + 1000 mit dem Stand.
  function rafProbe(ms) {
    return new Promise(function (resolve) {
      var n = 0, gap = 0, last = null, done = false, t0 = performance.now();
      function stop() {
        if (done) return;
        done = true;
        resolve({ n: n, gap: Math.max(gap, last == null ? performance.now() - t0 : 0) });
      }
      setTimeout(stop, ms + 1000);
      requestAnimationFrame(function tick() {
        if (done) return;
        var now = performance.now();
        gap = Math.max(gap, now - (last == null ? t0 : last));
        last = now;
        n++;
        if (now - t0 >= ms) stop(); else requestAnimationFrame(tick);
      });
    });
  }

  // Ist der Pane wirklich sichtbar? Versteckt läuft er in Schüben (ca. 250 ms Bilder, dann 1 s Pause), und document.hidden
  // bleibt dabei false. Eine Zählung über 500 ms fiele dann womöglich in einen Schub. Darum 1,2 s mit Blick auf die Lücken.
  async function paneOk() {
    if (document.hidden) throw new Error('Tab im Hintergrund');
    if (!window.innerWidth || !window.innerHeight) {
      throw new Error('Pane verdeckt (Fenster ' + window.innerWidth + ' × ' + window.innerHeight + ')');
    }
    var p = await rafProbe(1200);
    if (p.n < 60 || p.gap > 250) {
      throw new Error('Pane verdeckt (' + p.n + '× requestAnimationFrame in 1,2 s, längste Lücke ' + Math.round(p.gap) + ' ms)');
    }
  }

  // 3 s nach dem Laden (fehlt der Zeitstempel noch, warten wir auf ihn)
  async function settle() {
    await until(function () { var n = performance.getEntriesByType('navigation')[0]; return n && n.loadEventEnd > 0; }, 30000);
    var nav = performance.getEntriesByType('navigation')[0];
    var bereit = nav && nav.loadEventEnd > 0 ? nav.loadEventEnd + 3000 : 3000;
    if (performance.now() < bereit) await wait(bereit - performance.now());
  }

  function shortText(el, n) { return (el ? el.textContent : '').replace(/\s+/g, ' ').trim().slice(0, n || 40); }
  function cardLabel(card, i) { return i + ' ' + shortText(card.querySelector('.bcard__title, .pcard__title') || card); }
  function revealLabel(el) {
    var sec = el.closest('.shopify-section');
    return (sec ? sec.id.replace('shopify-section-', '') : '?') + ' ' + el.tagName.toLowerCase() + '.' + (el.classList[0] || '') +
      (el.hasAttribute('data-stagger') ? '[stagger]' : '');
  }

  function round(x) { return Math.round(x * 10) / 10; }

  // Scrollt das Fenster per rAF mit speed px/s von der aktuellen Stelle bis ganz unten. Gibt die Abstände der Bilder in ms.
  // Die Seite kann dabei wachsen (nachgeladene Sections): unten ist, was beim jeweiligen Bild unten ist. Spätestens nach 30 s Schluss.
  function scrollDown(speed, onFrame) {
    return new Promise(function (resolve) {
      var y0 = window.scrollY, t0 = null, last = null, gaps = [];
      requestAnimationFrame(function tick(t) {
        if (t0 == null) t0 = t;
        if (last != null) gaps.push(t - last);
        last = t;
        var bottom = document.documentElement.scrollHeight - window.innerHeight;
        var y = Math.min(bottom, y0 + (t - t0) / 1000 * speed);
        jump(y);
        if (onFrame) onFrame();
        if (y >= bottom - 1 || t - t0 > 30000) resolve(gaps); else requestAnimationFrame(tick);
      });
    });
  }

  function isImage(e) {
    if (e.initiatorType === 'img') return true;
    try { return /\.(avif|webp|jpe?g|png|gif|svg)$/i.test(new URL(e.name).pathname); } catch (err) { return false; }
  }

  async function cartJson() {
    var res = await fetch('/cart.js', { cache: 'no-store', headers: { Accept: 'application/json' } });
    return res.json();
  }

  // ---------------- Gerüst ----------------
  var PK = {
    checks: {},
    m: {},

    add: function (name, fn, when) {
      PK.checks[name] = { fn: fn, when: when };
    },

    run: async function (prefix) {
      await paneOk();
      await settle();

      var out = [];
      var names = Object.keys(PK.checks).filter(function (x) { return x.indexOf(prefix || '') === 0; });
      for (var i = 0; i < names.length; i++) {
        var name = names[i], c = PK.checks[name], res = { name: name, fails: [] };
        try {
          var why = c.when ? c.when() : '';
          if (why) {
            res.skipped = why;
          } else {
            var f = await c.fn();
            if (!Array.isArray(f)) res.fails.push('Prüfung gab keine Liste von Fehlertexten zurück (' + typeof f + ')');
            else res.fails = f.map(String);
          }
        } catch (e) {
          res.fails.push('Ausnahme: ' + (e && e.message ? e.message : e));
        }
        console.log(res.skipped ? 'ÜBERSPRUNGEN ' + name + ' (' + res.skipped + ')'
          : res.fails.length ? 'FEHLER        ' + name + '\n  - ' + res.fails.join('\n  - ')
          : 'OK            ' + name);
        out.push(res);
      }
      return out;
    }
  };
  PK.settle = settle;
  PK.paneOk = paneOk;

  // ---------------- Messungen ----------------

  // Wischt rail mit speed px/s bis zum Ende (Scroll-Snap aus). Jede Karte mit Box zählt einmal, sobald ihre linke Kante im
  // sichtbaren Bereich der Schiene ist, und gilt als fertig, wenn dann alle imgs(card) geladen sind.
  // maxGap: längste Lücke zwischen zwei Bildern in ms. Über 250 ms war der Pane zwischendurch gebremst: Lauf verwerfen.
  PK.m.swipe = async function (rail, speed) {
    await paneOk();
    await settle();
    await into(rail);
    var cards = [].filter.call(rail.querySelectorAll('.bcard, .pcard'), box);
    var snap = rail.style.scrollSnapType, behavior = rail.style.scrollBehavior;
    rail.style.scrollSnapType = 'none';
    rail.style.scrollBehavior = 'auto';
    var counted = [], seen = 0, ok = 0, late = [], maxGap = 0;
    function look() {
      var r = rail.getBoundingClientRect();
      cards.forEach(function (card, i) {
        if (counted.indexOf(card) > -1) return;
        var left = card.getBoundingClientRect().left;
        if (left < r.left - 1 || left >= r.right) return;
        counted.push(card);
        seen++;
        if (imgs(card).every(ready)) ok++; else late.push(cardLabel(card, i));
      });
    }
    try {
      rail.scrollLeft = 0;
      await frames(1);
      look();
      var max = rail.scrollWidth - rail.clientWidth;
      await new Promise(function (resolve) {
        var t0 = null, last = null;
        requestAnimationFrame(function tick(t) {
          if (t0 == null) t0 = t;
          if (last != null) maxGap = Math.max(maxGap, t - last);
          last = t;
          var x = Math.min(max, (t - t0) / 1000 * speed);
          rail.scrollLeft = x;
          look();
          if (x >= max || t - t0 > max / speed * 1000 + 3000) resolve(); else requestAnimationFrame(tick);
        });
      });
      await frames(1);
      look();
    } finally {
      rail.style.scrollSnapType = snap;
      rail.style.scrollBehavior = behavior;
      rail.scrollLeft = 0;
    }
    return { seen: seen, ready: ok, late: late, maxGap: Math.round(maxGap) };
  };

  // In den Warenkorb legen und messen, bis der Drawer offen ist. trigger: Knopf [data-add-variant] (Klick) oder
  // form[data-product-form] (requestSubmit). Danach die alte Menge per PS.cart.change zurück und den Drawer schließen.
  // thumbPreloaded: true/false nach dem Resource-Timing-Eintrag des Zeilenbilds seit dem Klick; null, wenn es keinen gibt
  // (Bild kam aus dem Speicher-Cache des Tabs, dann sagt der Wert nichts: die Messung in einem neuen Tab wiederholen).
  PK.m.add = async function (trigger) {
    await paneOk();
    await settle();
    var form = trigger.matches('form') ? trigger : null;
    var id = form ? +(form.elements.id && form.elements.id.value) : +trigger.dataset.addVariant;
    if (!id) throw new Error('add(): keine Varianten-ID am Auslöser');
    var d = document.getElementById('cart-drawer');
    if (!d) throw new Error('add(): kein #cart-drawer');
    if (d.open) { window.PS.closeDialog('cart-drawer'); await frames(2); }

    var before = await cartJson();
    var q0 = before.items.filter(function (it) { return it.variant_id === id; })
      .reduce(function (sum, it) { return sum + it.quantity; }, 0);

    var events = 0, eventsAtOpen = null, opened = null, thumbReady = null, thumb = null;
    function onCart() { events++; }
    document.addEventListener('ps:cart', onCart);
    var mo = new MutationObserver(function () {
      if (!d.open || opened != null) return;
      opened = performance.now();
      eventsAtOpen = events;
      var key = d.querySelector('[data-key^="' + id + ':"]');
      var row = key && key.closest('.line-item');
      thumb = row && row.querySelector('img');
      thumbReady = !!thumb && ready(thumb);
    });
    mo.observe(d, { attributes: true, attributeFilter: ['open'] });

    var t0 = performance.now();
    try {
      if (form) form.requestSubmit(); else trigger.click();
      await until(function () { return opened != null; }, 10000);
      await wait(500); // Einträge, deren Antwort gerade noch läuft
    } finally {
      mo.disconnect();
      document.removeEventListener('ps:cart', onCart);
    }

    function since(re) { return entries(re).filter(function (e) { return e.startTime >= t0; }); }
    var adds = since(/\/cart\/add\.js(\?|$)/), carts = since(/\/cart\.js(\?|$)/);
    var src = thumb && (thumb.currentSrc || thumb.src);
    var thumbEntry = src ? performance.getEntriesByName(src, 'resource').filter(function (e) { return e.startTime >= t0; })[0] : null;
    var thumbPreloaded = thumbEntry && adds[0] ? thumbEntry.startTime < adds[0].responseEnd : null;

    var after = await cartJson();
    var counter = document.querySelector('[data-cart-count]');
    var result = {
      ms: opened != null ? Math.round(opened - t0) : null,
      adds: adds.length,
      cartJs: carts.length,
      events: eventsAtOpen != null ? eventsAtOpen : events,
      thumbReady: thumbReady,
      thumbPreloaded: thumbPreloaded,
      count: counter ? +counter.dataset.count : NaN,
      serverCount: after.item_count
    };

    // Aufräumen: alte Menge der Variante, Drawer zu
    var line = after.items.filter(function (it) { return it.variant_id === id; })[0];
    if (line && line.quantity !== q0) await window.PS.cart.change(line.key, q0);
    window.PS.closeDialog('cart-drawer');
    await frames(2);
    return result;
  };

  // Scrollt mit speed px/s von oben bis unten. Jedes [data-reveal] oder [data-stagger] mit Bildern (mit Box) zählt, sobald es
  // .is-in bekommt, und gilt als fertig, wenn seine Bilder mit Box dann geladen sind. maxGap wie bei swipe.
  PK.m.reveals = async function (speed) {
    await paneOk();
    await settle();
    await go(0);
    var counted = [], revealed = 0, ok = 0, late = [];
    function look() {
      var els = document.querySelectorAll('[data-reveal], [data-stagger]');
      for (var i = 0; i < els.length; i++) {
        var el = els[i];
        if (!el.classList.contains('is-in') || counted.indexOf(el) > -1) continue;
        counted.push(el);
        var list = imgs(el).filter(box);
        if (!list.length) continue; // ohne sichtbare Bilder zählt es nicht
        revealed++;
        if (list.every(ready)) ok++; else late.push(revealLabel(el) + ' ' + list.filter(function (img) { return !ready(img); }).length + '/' + list.length);
      }
    }
    look();
    var gaps = await scrollDown(speed, look);
    await frames(1);
    look();
    return { revealed: revealed, ready: ok, late: late, maxGap: Math.round(Math.max.apply(null, gaps.concat(0))) };
  };

  // .pcard__img mit currentSrc (angefordert), getrennt nach Haupt- und Zweitbild. Nach einem Lauf von reveals benutzen.
  PK.m.cardImages = function () {
    var all = [].slice.call(document.querySelectorAll('.pcard__img'));
    function count(alt) {
      return all.filter(function (img) { return img.classList.contains('pcard__img--alt') === alt && !!img.currentSrc; }).length;
    }
    return { main: count(false), alt: count(true) };
  };

  // Abstände der Animation-Frames in ms beim Scrollen von oben bis unten mit speed px/s
  PK.m.jank = async function (speed) {
    await paneOk();
    await settle();
    await go(0);
    await frames(5);
    var gaps = await scrollDown(speed);
    if (!gaps.length) return { p99: NaN, max: NaN, frames: 0 };
    gaps.sort(function (a, b) { return a - b; });
    return { p99: round(gaps[Math.floor(0.99 * (gaps.length - 1))]), max: round(gaps[gaps.length - 1]), frames: gaps.length };
  };

  // Resource-Timing-Einträge, die vor dem Ende von load begannen. total = alle Einträge (250 hieße: Puffer war voll)
  PK.m.beforeLoad = function () {
    var nav = performance.getEntriesByType('navigation')[0];
    var end = nav && nav.loadEventEnd;
    if (!end) throw new Error('beforeLoad(): load ist noch nicht durch');
    var all = performance.getEntriesByType('resource');
    var list = all.filter(function (e) { return e.startTime < end; });
    var img = list.filter(isImage).length;
    return { img: img, other: list.length - img, total: all.length };
  };

  window.PK = PK;
  window.wait = wait;
  window.frames = frames;
  window.go = go;
  window.until = until;
  window.near = near;
  window.into = into;
  window.imgs = imgs;
  window.ready = ready;
  window.pre = pre;
  window.mouse = mouse;
  window.entries = entries;
  window.room = room;
  window.inState = inState;
  window.neu = neu;
  window.needMotion = needMotion;
  window.fresh = fresh;

  // ---------------- Prüfungen ----------------
  // Je Task ein Abschnitt: PK.add('bereich.was', function () { … return fehlertexte; }, wann?)

  // ---- Task 1: Einblenden am eigenen Merkmal (fade-on-load statt loading="lazy") ----
  PK.add('fade.rule', () => {
    const box = document.body.appendChild(document.createElement('div')), f = [];
    box.innerHTML = '<div class="pcard"><img class="pcard__img fade-on-load" loading="eager"><img class="pcard__img" loading="lazy"></div>' +
      '<div class="bcard"><div class="bcard__media"><img class="fade-on-load" loading="eager"></div></div>';
    const [a, b, c] = box.querySelectorAll('img'), op = (i) => getComputedStyle(i).opacity;
    box.querySelectorAll('img').forEach((i) => { i.style.transition = 'none'; });
    if (op(a) !== '0' || op(c) !== '0') f.push('fade-on-load ohne is-loaded ist nicht versteckt (auch bei eager)');
    if (op(b) !== '1') f.push('Regel hängt noch an loading="lazy"');
    a.classList.add('is-loaded');
    if (op(a) !== '1') f.push('is-loaded zeigt das Bild nicht');
    box.remove();
    return f;
  }, needMotion);
  PK.add('fade.marker', () => [...document.querySelectorAll('.pcard__img, .bcard__media img')].flatMap((i) => {
    const has = i.classList.contains('fade-on-load');
    if (i.classList.contains('pcard__img--alt')) return has ? ['Zweitbild mit fade-on-load'] : [];
    const lazy = i.getAttribute('loading') === 'lazy' || !!pre(i); // so von Liquid ausgegeben
    return lazy === has ? [] : [(has ? 'eager mit' : 'lazy ohne') + ' fade-on-load: ' + i.src.slice(-50)];
  }));

  // ---- Task 2: Vorlade-Hilfen und Schienen ----
  // Ablauf: neuer Tab, erst PK.run('rail.far') (frisch geladen), dann PK.run('rail') und PK.run('pre').
  // rail.swipe zählt nur in einem eigenen neuen Tab (Memory-Cache): PK.run('rail.swipe').
  PK.add('rail.api', () => ['slowNet', 'afterLoad', 'eager', 'eagerCards', 'whenLoaded']
    .filter((k) => typeof PS[k] !== 'function').map((k) => 'PS.' + k + ' fehlt'));
  PK.add('rail.slownet', () => {
    const f = [];
    try {
      [[{ saveData: true }, true], [{ effectiveType: '3g' }, true], [{ effectiveType: 'slow-2g' }, true],
       [{ effectiveType: '4g' }, false], [undefined, false]].forEach(([c, want]) => {
        Object.defineProperty(navigator, 'connection', { configurable: true, value: c });
        if (PS.slowNet() !== want) f.push(JSON.stringify(c) + ' ergibt ' + !want);
      });
    } finally { delete navigator.connection; }
    return f;
  });
  PK.add('rail.far', async () => {
    await wait(1500);
    return [...document.querySelectorAll('.rail, .product-grid--rail')]
      .filter((r) => r.getBoundingClientRect().top > 2.5 * innerHeight && r.querySelector('img[data-pre]'))
      .map((r) => 'zu früh vorgeladen: ' + (r.id || r.className));
  }, fresh);
  PK.add('rail.ahead', async () => {
    const f = [];
    for (const rail of [...document.querySelectorAll('.rail')].filter((r) => r.getClientRects().length)) {
      await near(rail);
      const right = rail.getBoundingClientRect().right;
      const cards = [...rail.children].filter((c) => c.getClientRects().length && imgs(c).length);
      const vis = cards.filter((c) => c.getBoundingClientRect().left < right).length;
      const eager = cards.filter((c) => imgs(c).every((i) => i.loading === 'eager')).length;
      const want = Math.min(cards.length, vis + 3);
      if (eager < want) f.push(`#${rail.id}: ${eager} Karten vorgeladen, erwartet mindestens ${want}`);
      if (cards.length > vis + 8 && eager === cards.length) f.push(`#${rail.id}: alle ${eager} Karten auf einmal`);
    }
    return f;
  });
  PK.add('rail.neuheiten', async () => {
    const grid = document.querySelector('[role="tabpanel"]:not([hidden]) .product-grid--rail');
    await near(grid);
    const cards = [...grid.children], eager = cards.filter((c) => imgs(c).every((i) => i.loading === 'eager')).length;
    return eager >= Math.min(cards.length, 4) ? [] : [`Neuheiten: ${eager} Karten vorgeladen`];
  }, () => innerWidth >= 1024 ? 'nur unter 1024 px' : document.querySelector('.product-grid--rail') ? '' : 'keine Neuheiten');
  // Ausgenommen: Karten, die toggle.state selbst kurz sichtbar gemacht hat (window.pkShown). Die Schiene lädt sie dann zu Recht
  // vor, nach dem Zurückschalten sind sie wieder versteckt.
  PK.add('pre.hidden', () => [...document.querySelectorAll('img[data-pre]')]
    .filter((i) => !i.getClientRects().length && !['state', 'tab', 'chip', 'drawer'].includes(pre(i).why) &&
      !(pre(i).why === 'rail' && window.pkShown && window.pkShown.has(i.closest('.bcard'))))
    .map((i) => `verstecktes Bild vorgeladen (${pre(i).why}): ${i.src.slice(-50)}`));
  PK.add('rail.afterload', () => {
    const end = performance.getEntriesByType('navigation')[0].loadEventEnd;
    return [...document.querySelectorAll('img[data-pre]')].filter((i) => pre(i).at < end).map((i) => 'vor load: ' + i.src.slice(-50));
  });
  // Kopie der Showroom-Schiene: einmal mit saveData, einmal ohne als Gegenprobe. Die Kopie bekommt keine Bildquellen: Ein
  // geklontes Bild lädt sofort (noch nicht im Dokument, lazy greift nicht) und legte alle Bikes in den Speicher-Cache.
  PK.add('rail.slow', async () => {
    const probe = async (save) => {
      const rail = room().rail, clone = rail.cloneNode(true);
      clone.id = rail.id + '-pk';
      clone.querySelectorAll('img').forEach((i) => {
        i.removeAttribute('srcset'); i.removeAttribute('src'); i.setAttribute('loading', 'lazy'); i.removeAttribute('data-pre');
      });
      if (save) Object.defineProperty(navigator, 'connection', { configurable: true, value: { saveData: true } });
      try {
        rail.after(clone); PS.scan(clone); await near(clone); await wait(1500);
        return !!clone.querySelector('img[data-pre]');
      } finally { clone.remove(); delete navigator.connection; }
    };
    const f = [];
    if (await probe(true)) f.push('bei saveData vorgeladen');
    if (!await probe(false)) f.push('Gegenprobe: die Kopie lädt auch ohne saveData nicht vor, die Prüfung greift nicht');
    return f;
  }, () => room() ? '' : 'kein Showroom');
  PK.add('rail.swipe', async () => { // nur frisch geladen (Memory-Cache), also in einem eigenen neuen Tab
    const { rail } = room();
    await near(rail);
    const r = await PK.m.swipe(rail, mouse() ? 4000 : 3000);
    return r.ready >= 0.9 * r.seen ? [] : [`nur ${r.ready} von ${r.seen} Karten fertig: ${r.late.slice(0, 3).join(', ')}`];
  }, () => !room() ? 'kein Showroom' : fresh());

  // ---- Task 3: Umschalter: Showroom und Neuheiten-Reiter ----
  // Ablauf: neuer Tab auf /?view=pk-test (dort hat die Startseite Neuheiten, siehe Ruling Task 0), PK.run('toggle') und
  // PK.run('pre'). toggle.chip zählt nur, solange die Chip-Karten noch lazy sind (frisch geladen).
  PK.add('toggle.state', async () => {
    const { s, rail, cards } = room(), f = [], other = cards.filter((c) => !inState(c));
    await near(rail);
    if (!await until(() => other.slice(0, 3).every((c) => imgs(c).every((i) => i.loading === 'eager')), 8000)) f.push('erste 3 Karten des anderen Zustands nicht vorgeladen');
    if (other[3] && imgs(other[3]).some((i) => i.loading === 'eager')) f.push('mehr als 3 Karten des anderen Zustands vorgeladen');
    await until(() => other.slice(0, 3).every((c) => imgs(c).every(ready)), 6000);
    await into(rail);
    window.pkShown = window.pkShown || new WeakSet(); // für pre.hidden: diese Karten macht die Prüfung selbst sichtbar
    other.forEach((c) => window.pkShown.add(c));
    s.querySelector('[data-showroom-mode][aria-pressed="false"]').click(); await frames(2);
    if (!other.filter((c) => c.getClientRects().length).slice(0, 2).every((c) => imgs(c).every(ready))) f.push('nach dem Umschalten nicht fertig');
    s.querySelector('[data-showroom-mode][aria-pressed="false"]').click(); await frames(2);
    return f;
  }, () => room() && room().cards.some((c) => !inState(c)) ? '' : 'kein Showroom mit zwei Zuständen');
  PK.add('toggle.chip', async () => {
    const { s, cards } = room(), has = (c, id) => (' ' + (c.dataset.categories || '') + ' ').includes(' ' + id + ' ');
    const want = (ch) => cards.filter((c) => inState(c) && has(c, ch.dataset.showroomCat)).slice(0, 3);
    const chip = [...s.querySelectorAll('[data-showroom-cat]')].find((ch) => ch.dataset.showroomCat && !ch.hidden &&
      want(ch).some((c) => imgs(c).some((i) => i.loading === 'lazy')));
    if (!chip) return []; // alle Chip-Karten schon geladen (z. B. nach rail.swipe): frisch laden, dann zählt die Prüfung
    chip.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch' }));
    await frames(1);
    return want(chip).every((c) => imgs(c).every((i) => i.loading === 'eager')) ? [] : ['Fingerauflegen auf einen Chip lädt nicht vor'];
  }, () => room() ? '' : 'kein Showroom');
  PK.add('toggle.tabs-mouse', async () => {
    const { tabs, panel } = neu(), tab = tabs.find((t) => t.getAttribute('aria-selected') === 'false');
    tab.dispatchEvent(new PointerEvent('pointerenter', { pointerType: 'mouse' }));
    await frames(1);
    const cards = [...panel(tab).querySelectorAll('.pcard')];
    return cards.length && cards.every((c) => imgs(c).every((i) => i.loading === 'eager')) ? [] : ['Zeigen auf einen Reiter lädt seine Karten nicht vor'];
  }, () => !mouse() ? 'nur mit Maus' : neu() ? '' : 'keine Neuheiten-Reiter');
  PK.add('toggle.tabs-touch', async () => {
    const { list, tabs, panel } = neu(), hidden = tabs.map(panel).filter((p) => p.hidden), f = [];
    const first = (p, n) => [...p.querySelectorAll('.pcard')].slice(0, n);
    await near(list);
    if (!await until(() => hidden.every((p) => first(p, 2).every((c) => imgs(c).every((i) => i.loading === 'eager'))), 6000)) f.push('erste 2 Karten der anderen Reiter nicht vorgeladen');
    if (hidden.some((p) => first(p, 3)[2] && imgs(first(p, 3)[2]).some((i) => i.loading === 'eager'))) f.push('mehr als 2 Karten je Reiter');
    return f;
  }, () => mouse() ? 'nur am Touch-Gerät' : neu() ? '' : 'keine Neuheiten-Reiter');

  // ---- Task 4: Warenkorb: eine Runde weniger, Vorschaubild vorab, Abgleich ----
  // Ablauf: PK.run('cart') auf der Kollektion bzw. einer Bekleidungs-Produktseite. cart.lines braucht einen Artikel im
  // Warenkorb und ein Neuladen danach.
  const quick = () => document.querySelector('[data-add-variant]:not([disabled])');
  const addFails = (r) => [
    r.cartJs && `${r.cartJs}× /cart.js nach dem Hinzufügen`, r.adds !== 1 && `${r.adds}× /cart/add.js`,
    r.events !== 1 && `${r.events}× ps:cart`, !r.thumbPreloaded && 'Vorschaubild nicht beim Klick geholt (andere URL?)',
    !r.thumbReady && 'Vorschaubild beim Öffnen nicht fertig', r.count !== r.serverCount && `Zähler ${r.count}, Warenkorb ${r.serverCount}`
  ].filter(Boolean);
  PK.add('cart.attrs', () => {
    const d = document.getElementById('cart-drawer'), f = [];
    const n = (d.querySelector('#cart-title').textContent.match(/\((\d+)\)/) || [])[1];
    if (d.dataset.count !== n) f.push(`data-count ${d.dataset.count} statt ${n}`);
    if (!/^[0-9a-f]{32}$/.test(d.dataset.sig || '')) f.push('data-sig fehlt');
    if (quick() && !quick().dataset.addThumb) f.push('Quick-Add ohne data-add-thumb');
    return f;
  });
  PK.add('cart.add', async () => addFails(await PK.m.add(quick())), () => quick() ? '' : 'kein Quick-Add auf der Seite');
  // Ohne vorgewählte Variante („bitte wählen“) wählt die Prüfung wie eine Kundin je Option den ersten freien Wert
  // (product.js setzt dann [data-variant-id]).
  async function pickVariant(form) {
    const id = form.elements.namedItem('id');
    if (!id || id.value) return;
    document.querySelectorAll('[data-pdp] [data-option-row]').forEach((row) => {
      if (row.querySelector('[data-option-value][aria-pressed="true"]')) return;
      const btn = row.querySelector('[data-option-value]:not(.is-soldout):not([disabled])');
      if (btn) btn.click();
    });
    await until(() => !!id.value, 4000);
  }
  PK.add('cart.form', async () => {
    const form = document.querySelector('form[data-product-form]');
    await pickVariant(form);
    return addFails(await PK.m.add(form));
  },
    () => document.querySelector('form[data-product-form] [type="submit"]:not([disabled])') ? '' : 'kein kaufbares Produktformular');
  PK.add('cart.fallback', async () => { // Antwort ohne Drawer-Section
    const orig = window.fetch;
    window.fetch = (u, o) => orig(u, o).then((res) => !String(u).includes('/cart/add') ? res : res.clone().json().then((j) => {
      delete j.sections;
      return new Response(JSON.stringify(j), { status: res.status, headers: { 'Content-Type': 'application/json' } });
    }));
    try {
      const r = await PK.m.add(quick());
      return [r.cartJs !== 1 && 'kein Rückfall auf /cart.js', r.events !== 1 && `${r.events}× ps:cart`,
        r.count !== r.serverCount && 'Zähler falsch'].filter(Boolean);
    } finally { window.fetch = orig; }
  }, () => quick() ? '' : 'kein Quick-Add auf der Seite');
  PK.add('cart.change', async () => {
    const id = +quick().dataset.addVariant, f = [], sel = `#cart-drawer [data-cart-qty][data-key^="${id}:"]`;
    const qty = () => +(document.querySelector(sel) || { value: 0 }).value, key = () => document.querySelector(sel).dataset.key;
    await PS.cart.add([{ id, quantity: 1 }]);
    const q = qty();
    await PS.cart.change(key(), q + 1);
    if (qty() !== q + 1) f.push('Menge ändern wirkt nicht');
    await PS.cart.change(key(), q - 1); // Stand vor der Prüfung, bei 0 entfernt
    if (qty() !== q - 1) f.push('Zurücksetzen oder Entfernen wirkt nicht');
    if (document.querySelector('[data-cart-count]').dataset.count !== document.getElementById('cart-drawer').dataset.count) f.push('Zähler und data-count uneinig');
    return f;
  }, () => quick() ? '' : 'kein Quick-Add auf der Seite');
  PK.add('cart.lines', () => [...document.querySelectorAll('#cart-drawer .line-item img')].some((i) => i.loading !== 'eager') ? ['Drawer-Bilder nach load noch lazy'] : [],
    () => document.querySelector('#cart-drawer .line-item img') ? '' : 'Warenkorb leer: einen Artikel hinzufügen, neu laden');
  PK.add('cart.sync', async () => {
    const d = document.getElementById('cart-drawer'), f = [];
    const show = () => window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
    let t = performance.now();
    sessionStorage.setItem('ps:cart-sig', 'veraltet'); show();
    if (!await until(() => sessionStorage.getItem('ps:cart-sig') === d.dataset.sig, 4000)) f.push('kein Abgleich nach pageshow');
    if (!entries(/sections=cart-drawer/).some((e) => e.startTime > t)) f.push('Drawer nicht neu geholt');
    t = performance.now(); show(); await wait(1500);
    if (entries(/sections=cart-drawer/).some((e) => e.startTime > t)) f.push('Abruf trotz gleichem Stand');
    return f;
  });

  // ---- Task 5: Vorlader für Reveals ----
  // Ablauf: neuer Tab, PK.run('reveal') (reveal.ahead nur frisch geladen, reveal.ready scrollt die ganze Seite), dann
  // PK.run('pre'). NO_PRELOAD ist dieselbe Liste wie in assets/motion.js.
  const NO_PRELOAD = '.rail, .product-grid--rail, [data-hero], [data-story], [data-about-team], [data-build-book], [data-header], [data-pdp], [data-no-preload]';
  const revealImgs = () => [...document.querySelectorAll('[data-reveal] img, [data-stagger] img')].filter((i) =>
    !i.classList.contains('pcard__img--alt') && !i.closest(NO_PRELOAD) && i.getClientRects().length && (i.getAttribute('loading') === 'lazy' || pre(i)));
  PK.add('reveal.ahead', async () => {
    await wait(1500);
    const f = [], h = innerHeight;
    revealImgs().forEach((i) => {
      const top = i.getBoundingClientRect().top;
      if (top > h && top < 2.4 * h && i.loading !== 'eager') f.push('nicht vorgeladen: ' + i.src.slice(-50));
      if (top > 2.6 * h && pre(i)) f.push('zu früh vorgeladen: ' + i.src.slice(-50));
    });
    return f;
  }, () => needMotion() || fresh());
  PK.add('reveal.excl', () => [...document.querySelectorAll('img[data-pre]')]
    .filter((i) => pre(i).why === 'reveal' && (i.closest(NO_PRELOAD) || i.classList.contains('pcard__img--alt')))
    .map((i) => 'Ausnahme vorgeladen: ' + i.src.slice(-50)));
  PK.add('reveal.ready', async () => { // neuer Tab (Memory-Cache)
    const r = await PK.m.reveals(2500);
    return !r.revealed || r.ready >= 0.9 * r.revealed ? [] : [`${r.ready} von ${r.revealed} Reveals mit fertigem Bild: ${r.late.slice(0, 3).join(', ')}`];
  }, needMotion);

  // ---- Sicherheits-Nachtrag zu Task 4: Abgleich nur vom eigenen Shop ----
  // Beginnt der Pfad mit „//“ (https://shop//fremd.example/ zeigt die 404-Seite samt cart.js), wäre location.pathname + '?…'
  // für fetch eine fremde Adresse, deren Antwort applySections per innerHTML einsetzte. Die Prüfung stellt so einen Pfad her,
  // fängt fetch ab (nichts geht hinaus) und löst den Abgleich aus.
  PK.add('cart.path', async () => {
    const orig = window.fetch, href = location.href, d = document.getElementById('cart-drawer'), urls = [];
    window.fetch = (u) => { urls.push(String(u)); return Promise.reject(new TypeError('pk: abgefangen')); };
    try {
      history.replaceState(history.state, '', location.origin + '//pk-fremd.invalid/x');
      sessionStorage.setItem('ps:cart-sig', 'veraltet');
      window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
      await until(() => urls.length > 0, 3000);
    } finally {
      window.fetch = orig;
      history.replaceState(history.state, '', href);
      if (d && d.dataset.sig) sessionStorage.setItem('ps:cart-sig', d.dataset.sig);
    }
    if (!urls.length) return ['kein Abruf ausgelöst, die Prüfung greift nicht'];
    return urls.filter((u) => new URL(u, location.href).origin !== location.origin).map((u) => 'fremde Adresse: ' + u);
  }, () => document.getElementById('cart-drawer') && document.getElementById('cart-drawer').dataset.sig ? '' : 'Drawer ohne data-sig');

  // Dasselbe Muster auf der Warenkorb-Seite: https://shop//cart liefert sie (200), ihr Abruf nach einer Änderung ginge dann an den
  // Host „cart“. Fremd steuerbar ist der Host dort nicht (der Pfad muss zur Warenkorb-Seite führen), der Abruf scheitert aber, und
  // die Seite bliebe nach einer Mengenänderung auf dem alten Stand. Die leere Antwort lässt die Seite unberührt.
  PK.add('cart.page-path', async () => {
    const orig = window.fetch, href = location.href, urls = [];
    window.fetch = (u) => { urls.push(String(u)); return Promise.resolve(new Response('', { status: 200 })); };
    try {
      history.replaceState(history.state, '', location.origin + '//cart' + location.search);
      document.dispatchEvent(new CustomEvent('ps:cart', { detail: { count: 0, previous: 0 } }));
      await until(() => urls.length > 0, 3000);
    } finally {
      window.fetch = orig;
      history.replaceState(history.state, '', href);
    }
    if (!urls.length) return ['kein Abruf ausgelöst, die Prüfung greift nicht'];
    return urls.filter((u) => new URL(u, location.href).origin !== location.origin).map((u) => 'fremde Adresse: ' + u);
  }, () => document.querySelector('[data-cart-page]') ? '' : 'keine Warenkorb-Seite');

  // ---- Task 6: Zweitbild der Produktkarte nur mit Hover ab 1024 px ----
  const hoverWide = () => matchMedia('(hover: hover) and (min-width: 1024px)').matches;
  const hasAlt = () => document.querySelector('.pcard__img--alt') ? '' : 'keine Karte mit Zweitbild';
  PK.add('alt.touch', () => [...document.querySelectorAll('.pcard__img--alt')]
    .filter((i) => getComputedStyle(i).display !== 'none' || i.currentSrc).map((i) => 'Zweitbild da oder geladen: ' + i.src.slice(-50)),
    () => hoverWide() ? 'nur ohne Hover oder unter 1024 px' : hasAlt());
  PK.add('alt.desktop', async () => {
    const alt = document.querySelector('.pcard__img--alt'), f = [];
    alt.style.transition = 'none'; alt.closest('.pcard').querySelector('a').focus(); await frames(2);
    if (getComputedStyle(alt).display === 'none') f.push('Zweitbild am Desktop ausgeblendet');
    // :focus-within greift nur, wenn das Fenster den Fokus hat
    if (document.hasFocus() && getComputedStyle(alt).opacity !== '1') f.push('Fokus zeigt das Zweitbild nicht');
    document.activeElement.blur(); alt.style.transition = '';
    return f;
  }, () => hoverWide() ? hasAlt() : 'nur mit Hover ab 1024 px');

  // ---- Task 7: Seiten vorab holen (Speculation Rules) ----
  const rules = () => { const s = document.getElementById('ps-speculation'); return s && JSON.parse(s.textContent); };
  const specOk = () => HTMLScriptElement.supports && HTMLScriptElement.supports('speculationrules') ? '' : 'Browser ohne Speculation Rules';
  PK.add('spec.rule', () => {
    const r = rules(), f = [];
    if (!r || !r.prefetch) return ['keine Regel im Dokument'];
    if (r.prerender) f.push('prerender in der Regel');
    if (r.prefetch[0].eagerness !== (mouse() ? 'moderate' : 'conservative')) f.push('eagerness ' + r.prefetch[0].eagerness);
    return f;
  }, specOk);
  // Prüft auch die Muster selbst: Ein ungültiges Muster wirft in new URLPattern und erscheint als Fehler (Chrome verwürfe sonst
  // still die ganze Regel).
  PK.add('spec.where', () => {
    const w = rules().prefetch[0].where, f = [];
    const hit = (x, a) => x.and ? x.and.every((y) => hit(y, a)) : x.or ? x.or.some((y) => hit(y, a)) : x.not ? !hit(x.not, a)
      : x.href_matches ? [].concat(x.href_matches).some((p) => new URLPattern(p, location.origin).test(a.href))
      : [].concat(x.selector_matches).some((sel) => a.matches(sel));
    const link = (href, attr = '') => Object.assign(document.createElement('div'), { innerHTML: `<a href="${href}" ${attr}>x</a>` }).firstChild;
    ['/cart', '/cart/add', '/de/cart', '/checkout', '/checkouts/c/123', '/account', '/account/login', '/customer_authentication/login',
     '/discount/WINTER', '/password', '/challenge', '/apps/x', '/a/x', '/tools/x', '/community/x', '/services/login_with_shop',
     '/12345/orders/abc', 'https://example.com/products/x'].forEach((h) => { if (hit(w, link(h))) f.push('würde vorab holen: ' + h); });
    ['/', '/products/helm', '/de/products/helm', '/collections/herren', '/collections/herren?page=2', '/pages/ueber-uns', '/search?q=helm']
      .forEach((h) => { if (!hit(w, link(h))) f.push('holt nicht vorab: ' + h); });
    ['target="_blank"', 'download', 'rel="nofollow"', 'data-no-prefetch', 'data-filter-link']
      .forEach((a) => { if (hit(w, link('/products/helm', a))) f.push('würde vorab holen mit ' + a); });
    return f;
  }, () => specOk() || (window.URLPattern && rules() ? '' : 'keine Regel oder kein URLPattern'));
  // Chrome verwirft fertige Prefetches nur, wenn es die Regel ohne Kandidaten sieht: Kommt sie im selben Task wieder, sieht es
  // dieselben Kandidaten und behält sie (Probe performance-qa/cdp/spec-probe-a.js, 11.11.2026: PrefetchResponseUsed). Darum muss
  // die alte Regel direkt nach ps:cart fort sein und die neue erst später kommen, auch bei zwei ps:cart kurz nacheinander nur einmal.
  PK.add('spec.cart', async () => {
    const f = [];
    const a = document.getElementById('ps-speculation');
    const cart = () => document.dispatchEvent(new CustomEvent('ps:cart', { detail: { count: 0, previous: 0 } }));
    cart();
    if (a.isConnected || document.getElementById('ps-speculation')) f.push('Regel im selben Task wieder da (fertige Prefetches bleiben)');
    cart();
    await wait(150);
    const all = document.querySelectorAll('#ps-speculation'), b = all[0];
    if (all.length !== 1) f.push(all.length + ' Regeln nach zwei ps:cart');
    if (!b || b === a || b.textContent !== a.textContent) f.push('Regel nach ps:cart nicht neu eingesetzt');
    return f;
  }, () => specOk() || (rules() ? '' : 'keine Regel'));
})();
