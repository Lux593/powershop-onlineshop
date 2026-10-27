/* ==========================================================================
   Power Shop – Umbau-Buch der Werkstatt (sections/build-book.liquid). Lädt nur mit der Section.
   Liquid rendert alle Umbauten offen untereinander; dieses Modul macht daraus Boxen:
   - Desktop: gleich breite Paneele, die sich überlappen und nur per transform verschieben. Alle zu = schmale Paneele
     (180 bis 260 px) mittig, eins offen = Infos + Bildblock, die anderen 110 bis 220 px.
   - Handy: Streifen untereinander, ein offener Umbau klappt auf, die Seite scrollt ihn genau unter den Header.
   - Bildblock: Kacheln durch wiederholtes Teilen eines Rechtecks, jedes Foto behält sein Format (kein Beschnitt).
   - Vollbild: <dialog>, Foto wächst aus der Kachel, Wischen, Pfeiltasten, Bildleiste.
   - Infos scrollen nie: Die Box bekommt die Höhe bis zum Bildschirmrand, --fit verkleinert Schrift und Abstände
     gleichmäßig (höchstens auf 62 %); reicht das nicht, wird die Box höher.
   ========================================================================== */
(function () {
  var PS = window.PS;
  if (!PS || !PS.on) return;

  var CW_MIN = 110, CW_MAX = 220, MAX_TILES = 7;
  var EASE = 'cubic-bezier(.16,1,.3,1)';
  var mqMobile = window.matchMedia('(max-width: 1023px)');

  /* ---------------- Bildblock: Teilungen des Rechtecks ----------------
     Jedes Foto behält sein Seitenverhältnis. Nebeneinander addieren sich die Seitenverhältnisse, übereinander die Kehrwerte.
     Gesucht wird die Teilung, die das Ziel-Seitenverhältnis trifft, Abwechslung in den Größen hat und das erste Foto groß zeigt. */
  function trees(ars, i, j, memo) {
    var key = i + ':' + j;
    if (memo[key]) return memo[key];
    var out = [];
    if (j - i === 1) out.push({ a: ars[i], leaf: i });
    else {
      for (var k = i + 1; k < j; k++) {
        var L = trees(ars, i, k, memo), R = trees(ars, k, j, memo);
        for (var x = 0; x < L.length; x++) {
          for (var y = 0; y < R.length; y++) {
            out.push({ a: L[x].a + R[y].a, dir: 'h', l: L[x], r: R[y] });
            out.push({ a: 1 / (1 / L[x].a + 1 / R[y].a), dir: 'v', l: L[x], r: R[y] });
          }
        }
      }
    }
    memo[key] = out;
    return out;
  }
  function rects(t, x, y, w, h, out) {
    if (t.leaf !== undefined) { out.push({ i: t.leaf, x: x, y: y, w: w, h: h }); return out; }
    if (t.dir === 'h') { var wl = h * t.l.a; rects(t.l, x, y, wl, h, out); rects(t.r, x + wl, y, w - wl, h, out); }
    else { var hl = w / t.l.a; rects(t.l, x, y, w, hl, out); rects(t.r, x, y + hl, w, h - hl, out); }
    return out;
  }
  function rowOnly(t, dir) { return t.leaf !== undefined || (t.dir === dir && rowOnly(t.l, dir) && rowOnly(t.r, dir)); }
  function bento(ars, target, minEdge) {
    var n = ars.length, base = ars.map(function (_, i) { return i; });
    var tall = base.filter(function (i) { return i && ars[i] < 1; }), wide = base.filter(function (i) { return i && ars[i] >= 1; });
    var orders = [base, [0].concat(tall, wide), [0].concat(wide, tall)];
    var best = null;
    orders.forEach(function (ord) {
      var a2 = ord.map(function (i) { return ars[i]; });
      trees(a2, 0, n, {}).forEach(function (t) {
        var r = rects(t, 0, 0, t.a, 1, []);
        var areas = r.map(function (q) { return q.w * q.h; });
        var big = Math.max.apply(null, areas), small = Math.min.apply(null, areas);
        var edge = Math.min.apply(null, r.map(function (q) { return Math.min(q.w, q.h); })) / Math.max(1, t.a / target);
        var score = Math.abs(Math.log(t.a / target));
        if (n > 2 && (rowOnly(t, 'h') || rowOnly(t, 'v'))) score += 0.6;
        if (n > 2 && big / small < 1.6) score += 0.35;
        if (big / small > 7) score += 0.4 * Math.log(big / small / 7);
        if (edge < minEdge) score += (minEdge - edge) * 4;
        var hero = r.filter(function (q) { return ord[q.i] === 0; })[0];
        if (hero && hero.w * hero.h >= big - 1e-6) score -= 0.15;
        if (!best || score < best.score) best = { score: score, a: t.a, tiles: r.map(function (q) { return { i: ord[q.i], x: q.x, y: q.y, w: q.w, h: q.h }; }) };
      });
    });
    return best;
  }

  PS.on('[data-build-book]', function (root) {
    var bays = root.querySelector('[data-bb-bays]');
    var all = [].slice.call(root.querySelectorAll('[data-bb-bay]'));
    var design = !!window.Shopify && !!window.Shopify.designMode;
    // Umbauten ohne Foto bleiben im Shop weg, im Theme-Editor sichtbar (dort steht ein Hinweis)
    var els = all.filter(function (el) {
      var has = !!el.querySelector('[data-bb-photo]');
      if (!has && !design) el.hidden = true;
      return has || design;
    });
    if (!bays || !els.length) return;

    var ctrl = new AbortController(), sig = { signal: ctrl.signal };
    var live = root.querySelector('[data-bb-live]');
    var html = document.documentElement;
    var reduce = PS.prefersReducedMotion();
    var open = -1, plans = [], layoutCache = {};

    var data = els.map(function (el) {
      var items = [].slice.call(el.querySelectorAll('[data-bb-photo]'));
      return {
        name: (el.querySelector('.bb-name') || {}).textContent || '',
        base: el.getAttribute('data-base') || '',
        items: items,
        photos: items.map(function (it) {
          var img = it.querySelector('img');
          return { w: +it.getAttribute('data-w') || 4, h: +it.getAttribute('data-h') || 3, full: it.getAttribute('data-full'), img: img, alt: img ? img.alt : '' };
        })
      };
    });

    var count = root.querySelector('[data-bb-count]');
    if (count) count.textContent = els.length + (els.length === 1 ? ' Umbau' : ' Umbauten');

    // Mehr als 7 Fotos: der Bildblock zeigt 7 Kacheln, die letzte mit „+N“, das Vollbild alle
    data.forEach(function (d) {
      d.items.forEach(function (it, i) { it.classList.toggle('is-extra', i >= MAX_TILES); });
      if (d.items.length > MAX_TILES) {
        var more = document.createElement('span');
        more.className = 'bb-more';
        more.textContent = '+' + (d.items.length - MAX_TILES + 1);
        d.items[MAX_TILES - 1].appendChild(more);
      }
    });

    function mobile() { return mqMobile.matches; }
    function say(t) { if (live) live.textContent = t; }

    /* ---------------- Bildblock planen und setzen ---------------- */
    function planBlock(bi, maxW, maxH, isMobile) {
      var d = data[bi], n = Math.min(d.photos.length, MAX_TILES);
      if (!n) return { a: 1, tiles: [], S: 0, W: 0, n: 0 };
      var ars = d.photos.slice(0, n).map(function (p) { return p.w / p.h; });
      var target = isMobile ? 1.05 : Math.max(0.9, Math.min(1.2, maxW / maxH));
      var key = [bi, n, target.toFixed(2), isMobile].join('|');
      var lay = layoutCache[key] || (layoutCache[key] = bento(ars, target, isMobile ? 0.22 : 0.16));
      var S = isMobile ? Math.min(maxW / lay.a, maxW * 1.35) : Math.min(maxH, maxW / lay.a, maxH * 1.3 / lay.a);
      return { a: lay.a, tiles: lay.tiles, S: S, W: lay.a * S, n: n };
    }
    function renderGallery(bi) {
      var plan = plans[bi], d = data[bi];
      var box = els[bi].querySelector('.bb-bento');
      if (!plan || !box) return;
      var gap = mobile() ? 6 : 10, S = plan.S;
      box.style.width = plan.W + 'px';
      box.style.height = S + 'px';
      plan.tiles.forEach(function (q) {
        var it = d.items[q.i];
        it.style.left = (q.x * S + gap / 2).toFixed(1) + 'px';
        it.style.top = (q.y * S + gap / 2).toFixed(1) + 'px';
        it.style.width = (q.w * S - gap).toFixed(1) + 'px';
        it.style.height = (q.h * S - gap).toFixed(1) + 'px';
      });
    }

    /* ---------------- Platzieren ---------------- */
    function cssPx(name, el) { return parseFloat(getComputedStyle(el || root).getPropertyValue(name)) || 0; }
    function neededInfo() {
      return Math.max.apply(null, els.map(function (el) {
        var head = el.querySelector('.bb-head-box'), inf = el.querySelector('.bb-info');
        var kids = [].slice.call(inf.children), cs = getComputedStyle(inf);
        return Math.ceil(head.offsetHeight + kids.reduce(function (s, k) { return s + k.offsetHeight; }, 0) +
          parseFloat(cs.rowGap || 0) * (kids.length - 1) + parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom) + 4);
      }));
    }
    function place() {
      root.classList.toggle('has-open', open >= 0);
      if (mobile()) {
        els.forEach(function (el) { el.style.transform = ''; });
        bays.style.height = '';
        root.style.setProperty('--fit', 1);
        var Wm = bays.clientWidth - 32;
        plans = data.map(function (_, bi) { return planBlock(bi, Wm, Infinity, true); });
        return;
      }
      var total = bays.clientWidth, n = els.length;
      var info = Math.round(Math.min(520, Math.max(360, innerWidth * 0.27)));
      var pad = Math.round(Math.min(32, Math.max(18, innerWidth * 0.015)));
      root.style.setProperty('--info-w', info + 'px');
      root.style.setProperty('--g-pad', pad + 'px');

      // Höhe bis zum Bildschirmrand; die Infos werden eingepasst, erst danach wächst die Box
      var top = bays.getBoundingClientRect().top + window.scrollY;
      var BH = Math.max(560, Math.min(1100, innerHeight - top - 16));
      root.style.setProperty('--fit', 1);
      if (neededInfo() > BH) {
        var lo = 0.62, hi = 1;
        for (var k = 0; k < 7; k++) {
          var mid = (lo + hi) / 2;
          root.style.setProperty('--fit', mid);
          if (neededInfo() <= BH) lo = mid; else hi = mid;
        }
        root.style.setProperty('--fit', lo);
        BH = Math.max(BH, neededInfo());
      }
      bays.style.height = BH + 'px';

      var H = BH - 2 * pad, maxW = total - (n - 1) * CW_MIN - info - 2 * pad;
      plans = data.map(function (_, bi) { return planBlock(bi, maxW, H, false); });
      function cwFor(b) { return Math.max(CW_MIN, Math.min(CW_MAX, (total - (info + 2 * pad + plans[b].W)) / Math.max(1, n - 1))); }
      var cwAll = Math.round(Math.min(260, Math.max(180, innerWidth * 0.14)));
      var cw = cwFor(open >= 0 ? open : 0), ow = total - cw * (n - 1);
      var cws = els.map(function (_, b) { return cwFor(b); });
      var coverW = Math.max.apply(null, [cwAll].concat(cws));
      var panelW = Math.max.apply(null, [coverW].concat(cws.map(function (c) { return total - c * (n - 1); })));
      var vis = open < 0 ? cwAll : cw, offset = open < 0 ? Math.max(0, (total - cwAll * n) / 2) : 0;
      root.style.setProperty('--open-w', panelW + 'px');
      root.style.setProperty('--closed-w', vis + 'px');
      root.style.setProperty('--wide-w', coverW + 'px');
      root.style.setProperty('--cover-x', -Math.max(0, (coverW - vis) / 2) + 'px');
      els.forEach(function (el, i) {
        el.style.zIndex = i + 1;
        var x = open < 0 ? offset + i * cwAll : (i <= open ? i * cw : ow + (i - 1) * cw);
        el.style.transform = 'translateX(' + x + 'px)';
      });
    }
    function fitMobile(bi) {
      if (!mobile() || bi < 0) return;
      els[bi].style.setProperty('--open-h', els[bi].querySelector('.bb-room').scrollHeight + 'px');
    }
    function layoutAll() {
      place();
      els.forEach(function (_, bi) { renderGallery(bi); });
      fitMobile(open);
    }

    /* ---------------- Öffnen und Schließen ---------------- */
    function setState() {
      els.forEach(function (el, i) {
        var on = i === open;
        el.classList.toggle('is-open', on);
        el.querySelector('.bb-door').setAttribute('aria-expanded', on);
        el.querySelector('.bb-room').inert = !on;
      });
    }
    function scrollMobile(bi) {
      // Ziel selbst berechnen: Lage des Umbaus, wenn alle anderen zugeklappt sind, direkt unter dem Header.
      // scrollIntoView ließe den Abstand aus scroll-padding-top stehen, und der Umbau darüber blitzte durch.
      var closedH = cssPx('--closed-h') || 136;
      var shown = parseFloat(getComputedStyle(html).getPropertyValue('--header-shown'));
      var headerH = cssPx('--header-h', html) * (isNaN(shown) ? 1 : shown);
      var y = els[0].getBoundingClientRect().top + window.scrollY + bi * closedH - headerH;
      if (PS.headerQuiet) PS.headerQuiet(1600);
      window.scrollTo({ top: Math.max(0, Math.round(y)), behavior: reduce ? 'auto' : 'smooth' });
    }
    function openBay(bi, fromEditor) {
      if (bi === open) return;
      open = bi;
      eager(bi);
      setState();
      place();
      renderGallery(bi);
      fitMobile(bi);
      if (mobile()) scrollMobile(bi);
      if (!reduce) {
        var parts = els[bi].querySelectorAll('.bb-head-box > *, .bb-info > *'), items = els[bi].querySelectorAll('.bb-item:not(.is-extra)');
        [].forEach.call(parts, function (n, k) { n.animate([{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: 600, delay: 280 + k * 60, easing: EASE, fill: 'backwards' }); });
        [].forEach.call(items, function (n, k) { n.animate([{ opacity: 0, transform: 'scale(.94)' }, { opacity: 1, transform: 'none' }], { duration: 700, delay: 360 + k * 70, easing: EASE, fill: 'backwards' }); });
      }
      if (!fromEditor) setTimeout(function () { els[bi].querySelector('.bb-close').focus({ preventScroll: true }); }, reduce ? 0 : 400);
      say('Umbau ' + data[bi].name + ' geöffnet, Basis ' + data[bi].base + ', ' + data[bi].photos.length + ' Bilder');
    }
    function closeBay() {
      if (open < 0) return;
      var prev = open;
      open = -1;
      setState();
      place();
      els[prev].querySelector('.bb-door').focus({ preventScroll: true });
      say('Alle Umbauten geschlossen');
    }
    // Fotos eines Umbaus laden, sobald er gleich gebraucht wird (Zeiger auf dem Paneel, Fokus, Öffnen)
    function eager(bi) {
      data[bi].photos.forEach(function (p) {
        if (p.img && p.img.loading === 'lazy') { p.img.loading = 'eager'; if (p.img.decode) p.img.decode().catch(function () {}); }
      });
    }

    els.forEach(function (el, bi) {
      var door = el.querySelector('.bb-door');
      door.addEventListener('click', function () { openBay(bi); }, sig);
      door.addEventListener('pointerenter', function () { eager(bi); }, sig);
      door.addEventListener('focus', function () { eager(bi); }, sig);
      el.querySelector('.bb-close').addEventListener('click', closeBay, sig);
      var allBtn = el.querySelector('[data-bb-all]');
      if (allBtn) allBtn.addEventListener('click', function () { viewer.open(bi, 0, data[bi].photos[0] && data[bi].photos[0].img); }, sig);
      data[bi].items.forEach(function (it, pi) {
        it.addEventListener('click', function () { viewer.open(bi, pi, data[bi].photos[pi].img); }, sig);
      });
    });
    root.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && open >= 0 && !viewer.isOpen()) closeBay();
    }, sig);

    /* ---------------- Vollbild ---------------- */
    var viewer = (function () {
      var dlg = root.querySelector('[data-bb-viewer]');
      if (!dlg) return { open: function () {}, isOpen: function () { return false; } };
      var stage = dlg.querySelector('.bb-viewer__stage'), img = dlg.querySelector('.bb-viewer__img');
      var title = dlg.querySelector('.bb-viewer__title'), cnt = dlg.querySelector('.bb-viewer__count');
      var caption = dlg.querySelector('.bb-viewer__caption'), thumbs = dlg.querySelector('.bb-viewer__thumbs');
      var bi = 0, pi = 0, opener = null, busy = false;

      function photo() { return data[bi].photos[pi]; }
      function show(i) {
        var list = data[bi].photos;
        pi = (i + list.length) % list.length;
        var p = list[pi], first = p.img ? (p.img.currentSrc || p.img.src) : p.full;
        img.src = first;
        img.alt = p.alt;
        if (p.full && p.full !== first) {
          var big = new Image();
          big.src = p.full;
          (big.decode ? big.decode() : Promise.resolve()).then(function () { if (photo() === p) img.src = p.full; }).catch(function () {});
        }
        cnt.textContent = 'Bild ' + (pi + 1) + ' von ' + list.length;
        caption.textContent = p.alt;
        [].forEach.call(thumbs.children, function (t, k) { t.setAttribute('aria-current', k === pi); });
        [1, -1].forEach(function (d) { var n = list[(pi + d + list.length) % list.length]; if (n.full) new Image().src = n.full; });
      }
      function go(d, fromX) {
        if (busy || data[bi].photos.length < 2) return;
        if (reduce) { show(pi + d); say(data[bi].name + ', ' + cnt.textContent); return; }
        busy = true;
        img.animate([{ transform: 'translateX(' + (fromX || 0) + 'px)', opacity: 1 }, { transform: 'translateX(' + (-d * 60) + '%)', opacity: 0 }], { duration: 220, easing: 'cubic-bezier(.4,0,1,1)' }).finished.then(function () {
          img.style.transform = '';
          show(pi + d);
          return img.animate([{ transform: 'translateX(' + (d * 30) + '%)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 420, easing: EASE }).finished;
        }).then(function () { busy = false; say(data[bi].name + ', ' + cnt.textContent); }, function () { busy = false; });
      }
      // Foto wächst aus der Kachel ins Vollbild (nur transform)
      function morph(from, to, reverse) {
        var t0 = 'translate(' + (from.left - to.left) + 'px, ' + (from.top - to.top) + 'px) scale(' + from.width / to.width + ', ' + from.height / to.height + ')';
        img.style.transformOrigin = '0 0';
        var frames = [{ transform: t0 }, { transform: 'none' }];
        if (reverse) frames.reverse();
        return img.animate(frames, { duration: reverse ? 380 : 560, easing: EASE, fill: reverse ? 'forwards' : 'none' }).finished.then(function () { img.style.transformOrigin = ''; });
      }
      function openAt(b, i, fromImg) {
        bi = b;
        opener = document.activeElement;
        title.textContent = data[bi].name;
        thumbs.innerHTML = '';
        data[bi].photos.forEach(function (p, k) {
          var t = document.createElement('button');
          t.type = 'button';
          t.setAttribute('aria-label', 'Bild ' + (k + 1));
          var ti = document.createElement('img');
          ti.src = p.img ? (p.img.currentSrc || p.img.src) : p.full;
          ti.alt = '';
          t.appendChild(ti);
          t.addEventListener('click', function () { if (k !== pi) { show(k); say(data[bi].name + ', ' + cnt.textContent); } });
          thumbs.appendChild(t);
        });
        show(i);
        html.style.overflow = 'hidden';
        dlg.showModal();
        if (!reduce) {
          dlg.animate([{ backgroundColor: 'rgba(6,6,6,0)' }, { backgroundColor: 'rgba(6,6,6,1)' }], { duration: 300, easing: EASE });
          [dlg.querySelector('.bb-viewer__bar'), dlg.querySelector('.bb-viewer__foot')].forEach(function (n) { n.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: 200, fill: 'backwards' }); });
          var vis = fromImg && fromImg.getBoundingClientRect();
          if (vis && vis.width) {
            var run = function () { morph(vis, img.getBoundingClientRect()); };
            if (img.complete) run(); else img.addEventListener('load', run, { once: true });
          }
        }
      }
      function close() {
        var done = function () {
          dlg.getAnimations({ subtree: true }).forEach(function (a) { a.cancel(); });
          dlg.close();
          html.style.overflow = '';
          if (opener && opener.focus) opener.focus({ preventScroll: true });
        };
        var target = photo() && photo().img;
        var r = target && target.getBoundingClientRect();
        if (reduce || !r || !r.width || r.bottom < 0 || r.top > innerHeight) return done();
        dlg.animate([{ backgroundColor: 'rgba(6,6,6,1)' }, { backgroundColor: 'rgba(6,6,6,0)' }], { duration: 380, easing: EASE, fill: 'forwards' });
        [dlg.querySelector('.bb-viewer__bar'), dlg.querySelector('.bb-viewer__foot')].forEach(function (n) { n.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 150, fill: 'forwards' }); });
        morph(r, img.getBoundingClientRect(), true).then(done, done);
      }
      dlg.addEventListener('cancel', function (e) { e.preventDefault(); close(); }, sig);
      dlg.querySelector('[data-bb-close-viewer]').addEventListener('click', close, sig);
      dlg.querySelector('[data-bb-prev]').addEventListener('click', function () { go(-1); }, sig);
      dlg.querySelector('[data-bb-next]').addEventListener('click', function () { go(1); }, sig);
      dlg.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') go(1);
        if (e.key === 'ArrowLeft') go(-1);
      }, sig);

      // Wischen: Foto folgt Finger oder Maus, ab 60 px oder schnellem Schwung kommt das nächste
      var drag = null;
      stage.addEventListener('pointerdown', function (e) {
        if (e.target.closest('button') || busy) return;
        drag = { x0: e.clientX, y0: e.clientY, t0: performance.now(), dx: 0, on: false, id: e.pointerId };
      }, sig);
      stage.addEventListener('pointermove', function (e) {
        if (!drag || e.pointerId !== drag.id) return;
        drag.dx = e.clientX - drag.x0;
        if (!drag.on && Math.abs(drag.dx) > 6 && Math.abs(drag.dx) > Math.abs(e.clientY - drag.y0)) {
          drag.on = true;
          stage.setPointerCapture(e.pointerId);
          stage.classList.add('is-dragging');
        }
        if (drag.on) img.style.transform = 'translateX(' + drag.dx + 'px)';
      }, sig);
      function end(e) {
        if (!drag || e.pointerId !== drag.id) return;
        var d = drag;
        drag = null;
        stage.classList.remove('is-dragging');
        if (!d.on) return;
        var v = Math.abs(d.dx) / (performance.now() - d.t0);
        img.style.transform = '';
        if (Math.abs(d.dx) > 60 || v > 0.45) go(d.dx < 0 ? 1 : -1, d.dx);
        else if (!reduce) img.animate([{ transform: 'translateX(' + d.dx + 'px)' }, { transform: 'none' }], { duration: 300, easing: EASE });
      }
      stage.addEventListener('pointerup', end, sig);
      stage.addEventListener('pointercancel', end, sig);
      return { open: openAt, isOpen: function () { return dlg.open; } };
    })();

    /* ---------------- Start, Größenänderung, Theme-Editor ---------------- */
    root.classList.add('is-ready');
    setState();
    layoutAll();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(layoutAll);
    var rt;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(layoutAll, 120); }, sig);
    mqMobile.addEventListener('change', layoutAll, sig);

    document.addEventListener('shopify:block:select', function (e) {
      if (!root.contains(e.target)) return;
      var bay = e.target.closest('[data-bb-bay]');
      var bi = els.indexOf(bay);
      if (bi >= 0) openBay(bi, true);
    }, sig);
    document.addEventListener('shopify:section:unload', function (e) {
      if (e.target.contains(root)) ctrl.abort();
    }, sig);
  });
})();
