/* ==========================================================================
   Prüfgerüst für die Über-uns-Seite (Entwurf H). Wird nicht ausgeliefert, liegt nur zum Prüfen im Repo.

   Benutzung: Inhalt dieser Datei plus `await UU.run('…')` in EINEM Aufruf von javascript_tool schicken, mit der Vorschau
   (http://127.0.0.1:9293/pages/ueber-uns) im Vordergrund (tabs_select). Nach jedem Neuladen, auch durch `theme dev`, neu einspielen.
   Die Datei darf beliebig oft laufen: sie ersetzt `window.UU` und die Hilfen, nichts doppelt.

   UU.add(name, fn, when?)   fn gibt Fehlertexte zurück (string[] oder Promise davon), leer heißt bestanden.
                             when gibt einen Grund zum Überspringen zurück (z. B. 'nur ab 900 px Breite'), leer heißt: läuft.
   UU.run(prefix?)           führt alle Prüfungen, deren Name mit prefix beginnt, nacheinander aus, schreibt eine Zeile pro
                             Prüfung in die Konsole und gibt { name, fails, skipped? }[] zurück.
                             Scheitert sofort bei document.hidden ('Tab im Hintergrund'): dort stehen requestAnimationFrame,
                             GSAP und header.js still. Wartet, bis die Seite 3 s geladen ist (header.js hält die Kopfleiste
                             nach dem Neuladen so lange still, assets/header.js:146–150). Gibt die Bühne nach jeder Prüfung
                             mit st.enable() frei: das misst neu und scrubbt zurück.

   Hilfen (global): px(el, prop), rect(sel), wait(ms), frames(n = 2), go(y), story(), at(p)
   Benennung der Prüfungen: 'bereich.was', z. B. 'kopf.hoehe'. So wählt UU.run('kopf') den ganzen Bereich.
   ========================================================================== */
(function () {
  'use strict';

  // ---------------- Hilfen ----------------
  function el(x) {
    var e = typeof x === 'string' ? document.querySelector(x) : x;
    if (!e) throw new Error('Nichts gefunden für ' + x);
    return e;
  }

  // Berechneter Wert als Zahl (Pixel bei Längen); el ist ein Element oder ein Selektor. NaN bei 'auto' und Ähnlichem.
  function px(x, prop) {
    return parseFloat(getComputedStyle(el(x))[prop]);
  }

  function rect(sel) { return el(sel).getBoundingClientRect(); }

  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  // Wartet n Animation-Frames (im Hintergrund-Tab kommen keine, siehe UU.run)
  function frames(n) {
    n = n == null ? 2 : n;
    return new Promise(function (resolve) {
      (function tick() { if (n-- <= 0) resolve(); else requestAnimationFrame(tick); })();
    });
  }

  // base.css:6 setzt scroll-behavior: smooth, ein einfaches scrollTo(0, y) gleitet. Hier springt es sofort.
  function go(y) {
    window.scrollTo({ top: y, behavior: 'instant' });
    return frames(2);
  }

  // Der ScrollTrigger der Bühne: das Element mit data-story trägt ihn als __story. Ohne Bühne auf der Seite undefined.
  function story() {
    var e = document.querySelector('[data-story]');
    return e ? e.__story : undefined;
  }

  // Hält die Bühne an und setzt ihren Fortschritt auf p (0 bis 1). Werte danach lesen.
  // Die Bühne bleibt angehalten, bis UU.run sie freigibt (oder story().enable() aufgerufen wird).
  function at(p) {
    var st = story();
    if (!st || !st.animation) throw new Error('at(): keine Bühne auf der Seite (kein [data-story] mit __story.animation)');
    st.disable(false, true);
    st.animation.progress(p);
  }

  // ---------------- Gerüst ----------------
  var UU = {
    checks: {},

    add: function (name, fn, when) {
      UU.checks[name] = { fn: fn, when: when };
    },

    run: async function (prefix) {
      if (document.hidden) throw new Error('Tab im Hintergrund');
      // 3 s nach dem Laden (fehlt der Zeitstempel noch, ab Navigationsbeginn), sonst fährt die Kopfleiste noch ein
      var nav = performance.getEntriesByType('navigation')[0];
      var bereit = nav && nav.loadEventEnd > 0 ? nav.loadEventEnd + 3000 : 3000;
      if (performance.now() < bereit) await wait(bereit - performance.now());

      var out = [];
      var names = Object.keys(UU.checks).filter(function (n) { return n.indexOf(prefix || '') === 0; });
      for (var i = 0; i < names.length; i++) {
        var name = names[i], c = UU.checks[name], res = { name: name, fails: [] };
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
        } finally {
          var st = story();
          if (st && st.enable) st.enable();
        }
        console.log(res.skipped ? 'ÜBERSPRUNGEN ' + name + ' (' + res.skipped + ')'
          : res.fails.length ? 'FEHLER        ' + name + '\n  - ' + res.fails.join('\n  - ')
          : 'OK            ' + name);
        out.push(res);
      }
      return out;
    }
  };

  window.UU = UU;
  window.px = px;
  window.rect = rect;
  window.wait = wait;
  window.frames = frames;
  window.go = go;
  window.story = story;
  window.at = at;

  // ---------------- Prüfungen ----------------
  // Die Prüfungen der einzelnen Tasks kommen hierher: UU.add('bereich.was', function () { … return fehlertexte; }, wann?)

  var motion = function () { return document.documentElement.classList.contains('has-motion') ? '' : 'nur mit has-motion'; };

  // ---- Task 1: Grundlagen (Tokens, GSAP auf der Seite, Kopfleiste festhalten) ----
  UU.add('base:gsap', function () {
    return document.documentElement.classList.contains('has-motion') && !(window.gsap && PS.motion.scroll) ? ['GSAP fehlt auf Über uns'] : [];
  });
  UU.add('base:tokens', function () {
    return ['--c-orange-on-light', '--c-hd-orange', '--photo-grade']
      .filter(function (t) { return !getComputedStyle(document.documentElement).getPropertyValue(t).trim(); })
      .map(function (t) { return 'Token fehlt: ' + t; });
  });
  // Die Seite ist am Anfang kürzer als der Bildschirm: die Prüfung macht sie kurz länger.
  UU.add('base:hold', async function () {
    if (typeof PS.headerHold !== 'function') return ['PS.headerHold fehlt'];
    var wrap = document.querySelector('.site-header-wrap'), away = function () { return wrap.classList.contains('is-away'); }, f = [];
    var pad = document.body.appendChild(Object.assign(document.createElement('div'), { style: 'height:4000px' }));
    try {
      await go(0); await go(1200); await go(1600);
      if (!away()) f.push('Vorbedingung: Kopfleiste fährt beim Runterscrollen nicht weg');
      PS.headerHold(true); await wait(400);
      if (away()) f.push('Kopfleiste fährt bei Hold nicht ein');
      await go(2200); await go(2800);
      if (away()) f.push('Kopfleiste fährt trotz Hold weg');
      PS.headerHold(false); await go(3400);
      if (!away()) f.push('Kopfleiste fährt nach Hold nicht mehr weg');
    } finally {
      PS.headerHold(false); pad.remove(); await go(0);
    }
    return f;
  }, motion);

  // ---- Task 2: Seitenkopf „Halle, dunkel“ ----
  // Breite des Inhalts ohne Scrollbalken. vw-Werte in CSS rechnen dagegen mit innerWidth (Scrollbalken zählt mit).
  var cw = function () { return document.documentElement.clientWidth; };
  var vw = function () { return window.innerWidth / 100; };
  var clamp = function (lo, v, hi) { return Math.min(hi, Math.max(lo, v)); };
  var near = function (a, b, tol) { return Math.abs(a - b) <= tol; };

  UU.add('head:desktop', function () {
    var f = [], head = document.querySelector('.about-head'), photo = document.querySelector('.about-head__photo');
    if (!head || !photo) return ['.about-head fehlt'];
    var r = photo.getBoundingClientRect(), left = cw() * 1.08 / 2.08;
    if (!near(r.left, left, 2)) f.push('Fotokante bei ' + r.left.toFixed(1) + ' px statt ' + left.toFixed(1));
    if (!near(r.right, cw(), 1)) f.push('Foto endet bei ' + r.right.toFixed(1) + ' px, nicht am rechten Rand (' + cw() + ')');
    var h = head.getBoundingClientRect().height, hSoll = clamp(440, 38 * vw(), 640);
    if (!near(h, hSoll, 1)) f.push('Höhe des Kopfs ' + h.toFixed(1) + ' px statt ' + hSoll.toFixed(1));
    var h1 = document.querySelector('.about-head h1'), fs = px(h1, 'fontSize'), fsSoll = clamp(44, 5.8 * vw(), 92);
    if (!near(fs, fsSoll, .5)) f.push('h1 ist ' + fs.toFixed(1) + ' px groß statt ' + fsSoll.toFixed(1));
    var em = h1.querySelector('em'), probe = document.body.appendChild(document.createElement('i'));
    probe.style.color = 'var(--c-orange)';
    var orange = getComputedStyle(probe).color; probe.remove();
    if (!em) f.push('Kein em in der h1');
    else if (getComputedStyle(em).color !== orange) f.push('em in der h1 hat ' + getComputedStyle(em).color + ' statt --c-orange (' + orange + ')');
    return f;
  }, function () { return cw() >= 900 ? '' : 'nur ab 900 px Breite'; });

  UU.add('head:mobile', function () {
    var f = [], head = document.querySelector('.about-head'), photo = document.querySelector('.about-head__photo');
    if (!head || !photo) return ['.about-head fehlt'];
    var r = photo.getBoundingClientRect(), t = rect('.about-head__text');
    if (r.bottom > t.top + 1) f.push('Foto steht nicht über dem Text (Foto endet bei ' + r.bottom.toFixed(1) + ', Text beginnt bei ' + t.top.toFixed(1) + ')');
    var soll = Math.min(r.width * .75, .52 * innerHeight);
    if (!near(r.height, soll, 1)) f.push('Foto ist ' + r.width.toFixed(1) + ' × ' + r.height.toFixed(1) + ', Soll-Höhe ' + soll.toFixed(1) + ' (4 : 3, höchstens 52 % der Fensterhöhe)');
    var fs = px('.about-head h1', 'fontSize'), fsSoll = clamp(44, 12.8 * vw(), 56);
    if (!near(fs, fsSoll, .5)) f.push('h1 ist ' + fs.toFixed(1) + ' px groß statt ' + fsSoll.toFixed(1));
    if (innerWidth === 375 && !near(fs, 48, .5)) f.push('h1 bei 375 px nicht 48 px');
    return f;
  }, function () { return cw() < 900 ? '' : 'nur unter 900 px Breite'; });

  UU.add('head:settle', function () {
    var img = document.querySelector('.about-head__photo img'), html = document.documentElement, f = [];
    if (!img) return ['Foto im Kopf fehlt'];
    var name = function () { return getComputedStyle(img).animationName; };
    if (html.classList.contains('has-motion')) {
      if (name() !== 'about-head-settle') f.push('Mit has-motion fehlt die Animation about-head-settle (animation-name: ' + name() + ')');
      html.classList.remove('has-motion');
      if (name() !== 'none') f.push('Ohne has-motion läuft trotzdem eine Animation: ' + name());
      html.classList.add('has-motion');
    } else if (name() !== 'none') {
      f.push('Ohne has-motion läuft eine Animation: ' + name());
    }
    return f;
  });

  UU.add('head:a11y', function () {
    var f = [], h1s = document.querySelectorAll('h1'), img = document.querySelector('.about-head__photo img');
    if (h1s.length !== 1) f.push(h1s.length + ' h1 auf der Seite statt 1');
    if (!img) f.push('Foto im Kopf fehlt');
    else if (!(img.getAttribute('alt') || '').trim()) f.push('Foto im Kopf ohne Alt-Text');
    return f;
  });
})();
