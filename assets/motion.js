/* ==========================================================================
   Power Shop – Motion-Schicht: Reveals, Wort-Splitter, Count-up, Parallax, Smooth-Scroll.
   Lädt auf allen Templates (defer, nach theme.js, vor header.js). GSAP und ScrollTrigger kommen nur auf der Startseite
   dazu (nur dort gibt es Scrub und Parallax), nur mit Setting und nie im Theme-Editor. Lenis (weiches Scrollen) lädt
   nach, nur auf index, collection und product und nur für Maus und Trackpad. Ohne sie läuft die Schicht im
   Fallback (Reveals per IntersectionObserver, Count-up, Splitter).

   Vertrag (Attribute, Zustände, Hilfs-API): docs/motion-api.md – daran bauen Hero, Startseite und Shop.
   ========================================================================== */
(function () {
  var PS = (window.PS = window.PS || {});
  var doc = document;
  var html = doc.documentElement;
  function noop() {}
  var M = (PS.motion = PS.motion || { enabled: false, scroll: false, add: noop, track: noop, refresh: noop });
  var reg = new WeakMap(); // Section -> [{ e: Element, c: Aufräumer }]
  var live = [];           // Sections mit Aufräumern (WeakMap ist nicht iterierbar)
  var wait = new Set();    // beobachtet, noch nicht gezeigt
  var started = new WeakSet();
  var io, mo, lenis, tick, timer;

  function off() { html.classList.remove('has-motion', 'has-smooth'); }
  function ready() { PS.motionReady = true; doc.dispatchEvent(new Event('ps:motionready')); }

  // Ohne Bewegungswunsch, im Theme-Editor oder ohne Kern/IntersectionObserver: statisch lassen
  if (typeof PS.on !== 'function' || !html.classList.contains('has-motion') || !('IntersectionObserver' in window) ||
      (window.Shopify && window.Shopify.designMode)) {
    off(); ready(); return;
  }
  M.enabled = true;

  /* ---------------- Aufräumen ---------------- */
  function slot(el) { return (el && el.closest && el.closest('.shopify-section')) || html; }
  function run(c) {
    try {
      if (Array.isArray(c)) c.forEach(run);
      else if (typeof c === 'function') c();
      else if (c && c.kill) c.kill();
      else if (c && c.disconnect) c.disconnect();
    } catch (e) { /* Aufräumen darf nie werfen */ }
  }
  function track(el, c) {
    if (!c) return;
    var k = slot(el), l = reg.get(k);
    if (!l) { reg.set(k, (l = [])); live.push(k); }
    l.push({ e: el, c: c });
  }
  function free(k) {
    var l = reg.get(k), i = live.indexOf(k);
    if (l) { l.forEach(function (x) { run(x.c); }); reg.delete(k); }
    if (i > -1) live.splice(i, 1);
  }
  function drop(el) { io.unobserve(el); if (el._box && !wait.has(el._box)) io.unobserve(el._box); wait.delete(el); }
  // Entferntes HTML (Drawer, AJAX): Beobachtungen und Aufräumer freigeben
  function sweep() {
    wait.forEach(function (el) { if (!el.isConnected) drop(el); });
    live.slice().forEach(function (k) {
      var l = reg.get(k);
      if (!k.isConnected) { free(k); return; }
      for (var i = l ? l.length : 0; i--;) if (!l[i].e.isConnected) run(l.splice(i, 1)[0].c);
    });
  }
  M.track = track;
  M.add = function (el, fn) {
    if (!M.scroll) return;
    try { track(el, fn(window.gsap, window.ScrollTrigger)); } catch (e) { /* Section bleibt statisch */ }
  };
  M.refresh = function () {
    if (!M.scroll && !lenis) return;
    clearTimeout(timer);
    timer = setTimeout(function () {
      try { if (M.scroll) window.ScrollTrigger.refresh(); if (lenis) lenis.resize(); } catch (e) { /* ignorieren */ }
    }, 150);
  };

  /* ---------------- Gesamtabbau (Laufzeitwechsel prefers-reduced-motion) ---------------- */
  function stopLenis() {
    try {
      if (tick) window.gsap.ticker.remove(tick);
      if (lenis) { lenis.destroy(); if (tick) window.gsap.ticker.lagSmoothing(500, 33); }
    } catch (e) { /* ignorieren */ }
    lenis = PS.lenis = tick = null;
  }
  function stopScroll() {
    stopLenis();
    try { if (M.scroll) window.ScrollTrigger.getAll().forEach(function (t) { t.kill(); }); } catch (e) { /* ignorieren */ }
    M.scroll = false;
  }
  function teardown() {
    M.enabled = false;
    off();
    live.slice().forEach(free);
    stopScroll();
    io.disconnect();
    mo.disconnect();
    wait.clear();
  }
  var rm = window.matchMedia('(prefers-reduced-motion: reduce)');
  function onRm(e) { if (e.matches) teardown(); }
  if (rm.addEventListener) rm.addEventListener('change', onRm); else if (rm.addListener) rm.addListener(onRm);

  /* ---------------- GSAP + ScrollTrigger (optional, nur Startseite) ---------------- */
  try {
    if (window.gsap && window.ScrollTrigger) {
      window.gsap.registerPlugin(window.ScrollTrigger);
      M.scroll = true;
    }
  } catch (e) { stopScroll(); }

  /* ---------------- Lenis (optional, nur Maus und Trackpad) ----------------
     Das Head-Skript (theme.liquid) setzt PS.lenisSrc nur mit Setting „Weiches Scrollen“ und feinem Zeiger und lädt die Datei vor.
     Mit GSAP (Startseite) gibt dessen Ticker den Takt und ScrollTrigger folgt Lenis; ohne GSAP (Kollektion, Produkt) läuft Lenis allein. */
  function smooth() {
    if (lenis || !M.enabled || !window.Lenis) return;
    try {
      var gsap = M.scroll && window.gsap;
      // Scrollbare Vorfahren und Dialoge ohne data-lenis-prevent (Cookie-Einstellungen, App-Overlays) scrollen
      // selbst, nicht die Seite dahinter. Lenis' allowNestedScroll taugt hier nicht: body{overflow-x:hidden}
      // macht den body zum „Scroller“ und hielte das Wheel überall an.
      lenis = PS.lenis = new window.Lenis({
        autoRaf: !gsap,
        prevent: function (n) {
          if (n.matches('dialog[open],[role=dialog],[aria-modal=true],[id^=shopify-pc__]')) return true;
          return n !== doc.body && n.scrollHeight > n.clientHeight + 1 && /^(auto|scroll|overlay)$/.test(getComputedStyle(n).overflowY);
        }
      });
      if (gsap) {
        lenis.on('scroll', window.ScrollTrigger.update);
        tick = function (t) { lenis.raf(t * 1000); };
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);
      }
      // Ein Dialog, der sich vor dem Start geöffnet hat, hält die Seite dahinter fest
      if (doc.body.classList.contains('is-locked')) lenis.stop();
    } catch (e) { stopLenis(); html.classList.remove('has-smooth'); } // Scrub und Parallax laufen weiter, nur das Gleiten entfällt
  }
  if (html.classList.contains('has-smooth') && PS.lenisSrc) {
    if (window.Lenis) smooth();
    else {
      var ls = doc.createElement('script');
      ls.src = PS.lenisSrc;
      ls.onload = smooth;
      ls.onerror = function () { html.classList.remove('has-smooth'); };
      doc.head.appendChild(ls);
    }
  }
  // Lenis ignoriert native Scrolls beim Gleiten (Tastatur, Tab-Fokus): vorher abbrechen
  doc.addEventListener('keydown', function (e) {
    if (lenis && !e.defaultPrevented && /^(Tab|Home|End|Page(Up|Down)| |Arrow(Up|Down))$/.test(e.key)) lenis.reset();
  }, true);

  // Anker per Lenis (Header-Abstand = scroll-padding-top). Fokus setzen, damit Skip-Link und Tab-Reihenfolge stimmen.
  doc.addEventListener('click', function (e) {
    var a = lenis && !lenis.isStopped && !e.defaultPrevented && !e.button && !(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) &&
      e.target.closest && e.target.closest('a[href*="#"]');
    if (!a || a.target || a.hash.length < 2 || a.origin !== location.origin || a.pathname !== location.pathname || a.search !== location.search) return;
    var t;
    try { t = doc.getElementById(decodeURIComponent(a.hash.slice(1))); } catch (err) { return; }
    if (!t || !t.getClientRects().length) return; // Ziel fehlt oder ist nicht gerendert: nativ
    e.preventDefault();
    lenis.scrollTo(t); // zieht scroll-padding-top selbst ab
    if (location.hash !== a.hash) history.pushState(null, '', a.hash);
    if (!t.hasAttribute('tabindex') && !/^(A|BUTTON|INPUT|SELECT|TEXTAREA|SUMMARY)$/.test(t.tagName)) {
      t.setAttribute('tabindex', '-1');
      t.setAttribute('data-ps-anchor', '');
      t.addEventListener('blur', function () { t.removeAttribute('tabindex'); t.removeAttribute('data-ps-anchor'); }, { once: true });
    }
    t.focus({ preventScroll: true });
  });

  /* ---------------- Reveals: ein gemeinsamer Observer ---------------- */
  function reveal(el) {
    el.classList.add('is-in');
    if (el.hasAttribute('data-stagger')) {
      [].forEach.call(el.children, function (c) { if (c.hasAttribute('data-reveal')) c.classList.add('is-in'); });
    }
    if (el._count) el._count();
  }
  function seen(el) { drop(el); reveal(el); }
  io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      // Bereits oberhalb des Bildes (Reload mit Scrollposition, Anker) zählt als gesehen
      if (!en.isIntersecting && en.boundingClientRect.top >= 0) return;
      var t = en.target, p = t._for;
      if (wait.has(t)) seen(t);
      if (p && wait.has(p)) seen(p);
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  function watch(el) {
    // display:contents hat keine Box (z. B. .bento__col mobil, auch erst nach einem Resize): das erste Kind zeigt stellvertretend
    var b = el.firstElementChild;
    if (b) { el._box = b; b._for = el; io.observe(b); }
    io.observe(el);
    wait.add(el);
  }
  // Der 8-%-Rand schluckt den untersten Streifen, wenn nicht weiter gescrollt werden kann: dort alles zeigen
  function tail() {
    if (innerHeight + scrollY < doc.documentElement.scrollHeight - 4) return;
    wait.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (!r.width && !r.height && el._box) r = el._box.getBoundingClientRect();
      if (r.bottom > 0 && r.top < innerHeight) seen(el);
    });
  }
  // Fokus auf ein noch verstecktes Element (Tab, Skip-Link): sofort zeigen
  doc.addEventListener('focusin', function (e) { wait.forEach(function (el) { if (el.contains(e.target)) seen(el); }); });
  window.addEventListener('scroll', tail, { passive: true });
  window.addEventListener('resize', tail);
  window.addEventListener('load', tail);

  /* ---------------- Wort-Splitter ---------------- */
  function split(el) {
    // Links/Buttons im Text verlören bei aria-hidden-Wörtern ihren Namen: nicht zerlegen, den Block als Ganzes einblenden
    if (el.querySelector('a,button,[role=button],[role=link],[tabindex]')) {
      if (!el.hasAttribute('data-reveal')) el.setAttribute('data-reveal', '');
      el.classList.add('is-split');
      return;
    }
    var fonts = (doc.fonts && doc.fonts.ready) || Promise.resolve();
    Promise.race([fonts, new Promise(function (r) { setTimeout(r, 1500); })]).then(function () {
      if (!M.enabled || !el.isConnected || el.classList.contains('is-split')) return;
      var walk = doc.createTreeWalker(el, NodeFilter.SHOW_TEXT), nodes = [], n = 0, t;
      while ((t = walk.nextNode())) nodes.push(t);
      var text = nodes.map(function (x) { return x.nodeValue; }).join(' ').replace(/\s+/g, ' ').trim();
      nodes.forEach(function (node) {
        var frag = doc.createDocumentFragment();
        // Nur echte Leerzeichen trennen: U+00A0 hält Wörter zusammen
        node.nodeValue.split(/([ \t\r\n\f]+)/).forEach(function (part) {
          if (!part) return;
          if (/^[ \t\r\n\f]+$/.test(part)) { frag.appendChild(doc.createTextNode(' ')); return; }
          var w = doc.createElement('span'), i = doc.createElement('span');
          w.className = 'ps-w';
          w.setAttribute('aria-hidden', 'true');
          i.className = 'ps-wi';
          i.style.setProperty('--i', Math.min(n++, 20));
          i.textContent = part;
          w.appendChild(i);
          frag.appendChild(w);
        });
        node.parentNode.replaceChild(frag, node);
      });
      var sr = doc.createElement('span');
      sr.className = 'sr-only';
      sr.textContent = text;
      el.insertBefore(sr, el.firstChild);
      el.classList.add('is-split');
    }).catch(function () { el.classList.add('is-split'); });
  }

  /* ---------------- Count-up ---------------- */
  function countup(el) {
    var src = el.textContent.trim();
    var m = src.match(/^(\D*?)(\d(?:[\d.,]*\d)?)([\s\S]*)$/);
    if (!m) return;
    var s = m[2], comma = s.indexOf(',') > -1, dot = s.indexOf('.') > -1;
    var grp = comma ? dot : dot && /^\d{1,3}(\.\d{3})+$/.test(s);
    var dec = comma ? s.length - s.indexOf(',') - 1 : dot && !grp ? s.length - s.indexOf('.') - 1 : 0;
    var end = parseFloat(comma ? s.replace(/\./g, '').replace(',', '.') : grp ? s.replace(/\./g, '') : s);
    if (isNaN(end)) return;
    function fmt(v) {
      return m[1] + v.toLocaleString('de-DE', { minimumFractionDigits: dec, maximumFractionDigits: dec, useGrouping: grp }) + m[3];
    }
    var vis = doc.createElement('span'), sr = doc.createElement('span'), raf;
    vis.setAttribute('aria-hidden', 'true');
    vis.textContent = fmt(0);
    sr.className = 'sr-only';
    sr.textContent = src;
    el.textContent = '';
    el.appendChild(vis);
    el.appendChild(sr);
    function fin() { cancelAnimationFrame(raf); vis.textContent = src; }
    el._fin = fin;
    el._count = function () {
      var dur = parseInt(el.getAttribute('data-countup'), 10) || 1400, t0;
      raf = requestAnimationFrame(function step(t) {
        t0 = t0 || t;
        var p = Math.min((t - t0) / dur, 1);
        vis.textContent = fmt(end * (1 - Math.pow(1 - p, 3)));
        if (p < 1) raf = requestAnimationFrame(step); else vis.textContent = src;
      });
    };
    track(el, fin);
  }
  // Druck: Zähler auf Endwert
  window.addEventListener('beforeprint', function () {
    doc.querySelectorAll('[data-countup]').forEach(function (el) { if (el._fin) el._fin(); });
  });

  /* ---------------- Parallax ---------------- */
  function parallax(el) {
    if (!M.scroll) return;
    var v = parseFloat(el.getAttribute('data-parallax')) || 0.15;
    var tw = window.gsap.fromTo(el, { yPercent: -v * 50 }, {
      yPercent: v * 50, ease: 'none',
      scrollTrigger: { trigger: el.parentElement || el, start: 'top bottom', end: 'bottom top', scrub: true }
    });
    track(el, [tw.scrollTrigger, tw, function () { window.gsap.set(el, { clearProps: 'transform' }); }]);
  }

  /* ---------------- Start: ein Modul für alle Attribute (läuft auch nach Section-Reload und PS.scan) ---------------- */
  function init(el) {
    if (!M.enabled) return;
    var d = el.getAttribute('data-reveal-delay'), has = el.hasAttribute.bind(el), watched = false;
    if (d) el.style.setProperty('--rd', parseInt(d, 10) + 'ms');
    if (has('data-stagger')) {
      var step = parseInt(el.getAttribute('data-stagger'), 10);
      if (step) el.style.setProperty('--step', step + 'ms');
      [].forEach.call(el.children, function (c, i) { c.style.setProperty('--i', Math.min(i, 7)); });
      watched = true;
    }
    if (has('data-countup')) { countup(el); watched = true; }
    if (has('data-split')) { split(el); watched = true; }
    if (has('data-reveal') && !(el.parentElement && el.parentElement.hasAttribute('data-stagger'))) watched = true;
    if (watched) watch(el);
    if (has('data-parallax')) parallax(el);
  }
  var SEL = '[data-reveal],[data-stagger],[data-split],[data-countup],[data-parallax]';
  function start(el) {
    // Jedes Element nur einmal (PS.on, PS.scan, Observer)
    if (started.has(el)) return;
    started.add(el);
    try { init(el); } catch (e) { el.classList.add('is-in', 'is-split'); }
  }
  function scan(root) {
    if (root.matches(SEL)) start(root);
    [].forEach.call(root.querySelectorAll(SEL), start);
  }
  PS.on(SEL, start);
  // Per JS eingefügtes HTML selbst starten (sonst bliebe data-reveal unsichtbar), Entferntes freigeben
  mo = new MutationObserver(function (list) {
    var gone = false;
    list.forEach(function (m) {
      [].forEach.call(m.removedNodes, function (n) { if (n.nodeType === 1) gone = true; });
      [].forEach.call(m.addedNodes, function (n) { if (n.nodeType === 1) scan(n); });
    });
    if (gone) sweep();
  });
  mo.observe(html, { childList: true, subtree: true });

  /* ---------------- Theme-Editor, Fonts, bfcache ---------------- */
  doc.addEventListener('shopify:section:unload', function (e) { free(e.target); M.refresh(); });
  doc.addEventListener('shopify:section:load', M.refresh);
  doc.addEventListener('shopify:section:reorder', M.refresh);
  window.addEventListener('load', M.refresh);
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(M.refresh);
  window.addEventListener('pageshow', function (e) { if (e.persisted) M.refresh(); });

  ready();
})();
