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

  // Die laufende Bühne: das Element mit data-story trägt __story = { st, guard, last, revert } (assets/about-story.js).
  // st pinnt und trägt die Zeitleiste als st.animation. Ohne Bühne auf der Seite undefined.
  function story() {
    var e = document.querySelector('[data-story]');
    return e ? e.__story : undefined;
  }
  function stageTrigger() {
    var s = story();
    return s && s.st;
  }

  // Hält die Bühne an und setzt ihren Fortschritt auf p (0 bis 1). Werte danach lesen.
  // Die Bühne bleibt angehalten, bis UU.run sie freigibt (oder story().st.enable() aufgerufen wird).
  function at(p) {
    var st = stageTrigger();
    if (!st || !st.animation) throw new Error('at(): keine Bühne auf der Seite (kein [data-story] mit __story.st.animation)');
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
          var st = stageTrigger();
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

  // ---- Task 3: Geschichte, statisch ----
  var sec = function () { return document.querySelector('[data-story]'); };
  var shown = function (e) { return !!e && getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().height > 0; };
  // Farbe eines Tokens, so wie der Browser sie ausrechnet (zum Vergleich mit berechneten Werten)
  var tokenColor = function (prop, token) {
    var probe = document.body.appendChild(document.createElement('i'));
    probe.style[prop] = 'var(' + token + ')';
    var c = getComputedStyle(probe)[prop]; probe.remove();
    return c;
  };

  UU.add('story:static', function () {
    var f = [], s = sec();
    if (!s) return ['.about-story fehlt'];
    var leaves = s.querySelectorAll('ol > li.leaf');
    if (leaves.length !== 4) f.push(leaves.length + ' li.leaf in einem ol statt 4');
    s.querySelectorAll('.leaf__year').forEach(function (y, i) {
      if (y.getAttribute('aria-hidden') !== 'true') f.push('Jahreszahl ' + (i + 1) + ' ohne aria-hidden="true"');
    });
    s.querySelectorAll('.leaf h3').forEach(function (h, i) {
      var first = h.firstElementChild, year = (s.querySelectorAll('.leaf__year')[i] || {}).textContent || '';
      year = year.replace(/\.$/, '').trim();
      if (!first || !first.classList.contains('sr-only') || h.firstChild !== first) f.push('h3 ' + (i + 1) + ' beginnt nicht mit .sr-only');
      else if (first.textContent.indexOf(year + ':') !== 0) f.push('h3 ' + (i + 1) + ': .sr-only ist „' + first.textContent + '“, erwartet „' + year + ': “');
    });
    var h2 = s.querySelector('h2');
    if (!h2 || h2.textContent.trim() !== 'Unsere Geschichte' || !h2.classList.contains('sr-only')) f.push('h2 „Unsere Geschichte“ (.sr-only) fehlt');
    if (shown(s.querySelector('[data-rail]'))) f.push('Balken ist sichtbar');
    if (cw() >= 900) {
      leaves.forEach(function (li, i) {
        var m = li.querySelector('.leaf__media').getBoundingClientRect(), b = li.querySelector('.leaf__body').getBoundingClientRect();
        var share = m.width / li.getBoundingClientRect().width * 100;
        if (!(m.right <= b.left + 1)) f.push('Etappe ' + (i + 1) + ': Foto steht nicht links vom Text');
        if (!near(share, 108 / 2.08, .5)) f.push('Etappe ' + (i + 1) + ': Fotospalte ' + share.toFixed(1) + ' % statt 51,9 %');
      });
    }
    s.querySelectorAll('.leaf__media img').forEach(function (img, i) {
      if (img.getAttribute('loading') !== 'lazy') f.push('Etappenfoto ' + (i + 1) + ' hat loading="' + img.getAttribute('loading') + '"');
    });
    return f;
  }, function () { var s = sec(); return s && s.classList.contains('is-live') ? 'nur ohne is-live' : ''; });

  // Ablauf: Vorlage um einen Block mit dem Schlüssel „ohne-foto“ ohne Bild und ohne Standarddatei ergänzen, hochladen lassen, neu laden
  UU.add('story:noimage', function () {
    var f = [], li = document.getElementById('etappe-ohne-foto'), media = li && li.querySelector('.leaf__media');
    if (!media) return ['Etappe ohne Foto hat keine Fotofläche'];
    if (media.querySelector('img')) f.push('Etappe ohne Foto rendert ein img-Element');
    var bg = getComputedStyle(media).backgroundColor, soll = tokenColor('backgroundColor', '--c-anthracite');
    if (bg !== soll) f.push('Fotofläche hat ' + bg + ' statt --c-anthracite (' + soll + ')');
    return f;
  }, function () { return document.getElementById('etappe-ohne-foto') ? '' : 'nur mit Block „ohne-foto“ in der Vorlage'; });

  // ---- Task 4: Geschichte, Bühne und Umblättern ----
  // Alle außer story:short und story:count laufen nur mit Bühne. Den Fortschritt stellen sie mit at(p) ein und lesen sofort.
  var live = function () { return story() ? '' : '__story fehlt'; };
  var G = function (e, prop) { return window.gsap.getProperty(e, prop); };
  var leavesOf = function () { return Array.prototype.slice.call(sec().querySelectorAll('.leaf')); };
  var bitsOf = function (leaf) { return [leaf.querySelector('.leaf__year')].concat(Array.prototype.slice.call(leaf.querySelectorAll('.leaf__text > *'))); };
  var opacity = function (e) { return parseFloat(getComputedStyle(e).opacity); };
  var away = function () { return document.querySelector('.site-header-wrap').classList.contains('is-away'); };
  // Fotos zoomen oder gleiten nie: weder das Bild noch sein Rahmen tragen einen transform
  var photoMoves = function () {
    return Array.prototype.slice.call(sec().querySelectorAll('.leaf__media, .leaf__media img')).filter(function (e) {
      return getComputedStyle(e).transform !== 'none' || G(e, 'scale') !== 1;
    }).length;
  };

  UU.add('story:turn', function () {
    var f = [], L = leavesOf(), last = story().last;
    if (last !== L.length - 1) f.push('story().last ist ' + last + ' bei ' + L.length + ' Etappen');
    var moves = 0;
    at(0); moves += photoMoves();
    if (G(L[0], 'xPercent') !== 0) f.push('p = 0: Etappe 1 bei xPercent ' + G(L[0], 'xPercent'));
    L.slice(1).forEach(function (l, i) {
      if (G(l, 'xPercent') !== 100 || G(l, 'x') !== 120) f.push('p = 0: Etappe ' + (i + 2) + ' bei xPercent ' + G(l, 'xPercent') + ', x ' + G(l, 'x') + ' statt 100 / 120');
    });
    // halbe Strecke des ersten Wechsels (bei vier Etappen p = 0,1)
    at(0.3 / last); moves += photoMoves();
    if (!near(G(L[1], 'xPercent'), 50, 2)) f.push('p = ' + (0.3 / last).toFixed(3) + ': Etappe 2 bei xPercent ' + G(L[1], 'xPercent').toFixed(1) + ' statt 50');
    if (opacity(L[1].querySelector('.leaf__year')) !== 0) f.push('p = ' + (0.3 / last).toFixed(3) + ': Jahreszahl von Etappe 2 schon sichtbar');
    at(0.5 / last); moves += photoMoves();
    at(1 / last); moves += photoMoves();
    if (G(L[1], 'xPercent') !== 0 || G(L[1], 'x') !== 0) f.push('p = 1/' + last + ': Etappe 2 nicht bei 0');
    bitsOf(L[1]).forEach(function (b, i) {
      if (opacity(b) !== 1 || G(b, 'x') !== 0) f.push('p = 1/' + last + ': Textteil ' + (i + 1) + ' von Etappe 2 bei Deckkraft ' + opacity(b) + ', x ' + G(b, 'x'));
    });
    [0.6, 0.85, 1].forEach(function (p) { at(p); moves += photoMoves(); });
    if (moves) f.push(moves + '-mal hatte ein Foto oder Fotorahmen einen transform (Zoom oder Gleiten)');
    return f;
  }, live);

  UU.add('story:rail', function () {
    var f = [], s = sec(), last = story().last, links = s.querySelectorAll('[data-jump]');
    at(1 / last);
    var sx = G(s.querySelector('[data-fill]'), 'scaleX');
    if (!near(sx, 1 / last, .01)) f.push('p = 1/' + last + ': Balken bei scaleX ' + sx.toFixed(3) + ' statt ' + (1 / last).toFixed(3));
    if (links[1].getAttribute('aria-current') !== 'step') f.push('p = 1/' + last + ': „' + links[1].textContent + '“ ohne aria-current="step"');
    if (!links[1].classList.contains('is-passed')) f.push('p = 1/' + last + ': „' + links[1].textContent + '“ ohne is-passed');
    if (s.querySelectorAll('[data-jump][aria-current]').length !== 1) f.push('p = 1/' + last + ': nicht genau eine Zahl mit aria-current');
    at(1);
    if (links[last].getAttribute('aria-current') !== 'step') f.push('p = 1: letzte Zahl ohne aria-current="step"');
    Array.prototype.forEach.call(links, function (a) {
      var h = a.getBoundingClientRect().height;
      if (h < 44) f.push('Link „' + a.textContent + '“ ist ' + h.toFixed(1) + ' px hoch');
    });
    return f;
  }, live);

  UU.add('story:hint', function () {
    var f = [], hint = sec().querySelector('.about-story__hint');
    if (!hint) return ['.about-story__hint fehlt'];
    if (cw() < 900) {
      if (getComputedStyle(hint).display !== 'none') f.push('Hinweis unter 900 px Breite sichtbar');
      return f;
    }
    at(0);
    if (!shown(hint) || hint.classList.contains('is-gone')) f.push('p = 0: Hinweis nicht sichtbar');
    at(0.05);
    if (!hint.classList.contains('is-gone')) f.push('p = 0,05: Hinweis ohne is-gone');
    return f;
  }, live);

  UU.add('story:eager', async function () {
    var f = [], imgs = Array.prototype.slice.call(sec().querySelectorAll('.leaf__media img'));
    imgs.forEach(function (img, i) {
      if (img.getAttribute('loading') !== 'eager') f.push('Etappenfoto ' + (i + 1) + ' hat loading="' + img.getAttribute('loading') + '"');
    });
    var ok = function () { return imgs.every(function (img) { return img.complete && img.naturalWidth > 0; }); };
    for (var t = 0; t < 50 && !ok(); t++) await wait(100);
    imgs.forEach(function (img, i) {
      if (!(img.complete && img.naturalWidth > 0)) f.push('Etappenfoto ' + (i + 1) + ' nach 5 s nicht geladen');
    });
    return f;
  }, live);

  UU.add('story:snap', async function () {
    var st = story().st, last = story().last;
    await go(st.start + (st.end - st.start) * 0.4 / last);
    await wait(2500);
    var p = st.progress, k = Math.round(p * last);
    return near(p, k / last, .005) ? [] : ['Fortschritt steht nach 2,5 s bei ' + p.toFixed(4) + ', kein Vielfaches von 1/' + last];
  }, live);

  UU.add('story:jump', async function () {
    var f = [], st = story().st, links = sec().querySelectorAll('[data-jump]');
    await go(st.start); await wait(300);
    var seen = [st.progress];
    links[links.length - 1].click();
    for (var t = 0; t < 30; t++) { await wait(100); seen.push(st.progress); }
    for (var i = 1; i < seen.length; i++) {
      if (seen[i] < seen[i - 1] - .0005) { f.push('Fortschritt sinkt bei ' + (i * 100) + ' ms: ' + seen[i - 1].toFixed(3) + ' → ' + seen[i].toFixed(3)); break; }
    }
    if (!near(seen[seen.length - 1], 1, .001)) f.push('Nach 3 s Fortschritt ' + seen[seen.length - 1].toFixed(3) + ' statt 1');
    return f;
  }, live);

  UU.add('story:header', async function () {
    var f = [], st = story().st, y = st.start - 170;
    await go(0); await go(y / 3); await go(2 * y / 3); await go(y); await wait(100);
    if (!away()) f.push('Vorbedingung: Kopfleiste bei ' + Math.round(y) + ' px nicht weggefahren');
    await go(st.start - 100); await wait(400);
    if (away()) f.push('150 px vor dem Pinnen: Kopfleiste nicht eingefahren');
    await go(st.start + 600); await wait(100);
    if (away()) f.push('Gepinnt und nach unten gescrollt: Kopfleiste fährt weg');
    var spacer = sec().querySelector('.pin-spacer');
    if (!spacer) f.push('Kein .pin-spacer');
    else if (getComputedStyle(spacer).backgroundColor !== tokenColor('backgroundColor', '--c-black')) f.push('.pin-spacer hat ' + getComputedStyle(spacer).backgroundColor + ' statt --c-black');
    // Teil 2 (Task 6): Die Kopfleiste bleibt bis zum Ende des Übergangs zum Team stehen, danach gilt wieder das normale Verhalten
    var t = teamEl();
    if (!t) {
      f.push('Teil 2: [data-about-team] fehlt');
    } else {
      var end = toTeamEnd();
      await go(st.end); await go((st.end + end) / 2); await wait(100);
      if (away()) f.push('Halbe Strecke des Übergangs zum Team: Kopfleiste weggefahren');
      await go(end + 200); await go(end + 400); await go(end + 600); await wait(100);
      if (!away()) f.push('600 px unter dem Ende des Übergangs: Kopfleiste nicht weggefahren');
      sec().querySelector('[data-jump]').click();
      await wait(3000);
      if (away()) f.push('Klick auf die erste Zahl: Kopfleiste nach 3 s weggefahren');
      if (!near(st.progress, 0, .001)) f.push('Klick auf die erste Zahl: Fortschritt nach 3 s ' + st.progress.toFixed(3) + ' statt 0');
    }
    await go(0);
    return f;
  }, function () {
    var s = story();
    if (!s) return '__story fehlt';
    return s.st.start - 170 < 405 ? 'Bühne beginnt zu weit oben (header.js zeigt die Kopfleiste oberhalb von 400 px immer)' : '';
  });

  UU.add('story:short', async function () {
    var f = [], s = sec();
    if (s.classList.contains('is-live')) f.push('is-live unter 600 px Höhe');
    if (s.querySelector('.pin-spacer')) f.push('pin-spacer unter 600 px Höhe');
    leavesOf().forEach(function (l, i) {
      bitsOf(l).forEach(function (b) { if (opacity(b) !== 1) f.push('Etappe ' + (i + 1) + ': Textteil mit Deckkraft ' + opacity(b)); });
    });
    await go(0); await go(500); await go(1000); await wait(100);
    if (!away()) f.push('Nach 1000 px nach unten ist die Kopfleiste nicht weggefahren');
    await go(0);
    return f;
  }, function () { return innerHeight < 600 ? '' : 'nur unter 600 px Fensterhöhe'; });

  // Ablauf story:count: Vorlage auf 2, 5 und 1 Etappe ändern, je hochladen lassen, neu laden, story:count und story:snap
  UU.add('story:count', function () {
    var f = [], s = sec(), n = leavesOf().length, rail = s.querySelector('[data-rail]');
    if (n === 1) {
      if (s.classList.contains('is-live')) f.push('is-live bei einer Etappe');
      if (shown(rail)) f.push('Balken sichtbar bei einer Etappe');
      return f;
    }
    var cols = getComputedStyle(rail.querySelector('ol')).gridTemplateColumns.split(' ').length;
    if (cols !== n) f.push('Balken hat ' + cols + ' Spalten bei ' + n + ' Etappen');
    if (story().last !== n - 1) f.push('story().last ist ' + story().last + ' bei ' + n + ' Etappen');
    return f;
  }, function () { var s = sec(); return s && (s.querySelectorAll('.leaf').length === 1 || story()) ? '' : 'nur mit Bühne oder einer Etappe'; });

  // ---- Task 6: Übergang von der Bühne zum Team ----
  // Steht vor story:revert, damit UU.run('story') sie noch mit Bühne ausführt.
  // Ende des Übergangs: Die Oberkante des Teams erreicht die Unterkante der stehenden Kopfleiste (--header-h).
  var toTeamEnd = function () {
    var hh = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 0;
    return teamEl().getBoundingClientRect().top + window.scrollY - hh;
  };
  UU.add('story:toteam', async function () {
    var f = [], s = sec(), st = story().st, t = teamEl();
    if (!t) return ['[data-about-team] fehlt'];
    var vp = s.querySelector('[data-viewport]'), stage = s.querySelector('[data-stage]'), rail = s.querySelector('[data-rail]');
    var end = toTeamEnd(), mid = (st.end + end) / 2;
    await go(st.end); await go(mid); await wait(100);
    var sc = G(vp, 'scale'), y = G(vp, 'y'), cover = parseFloat(getComputedStyle(stage).getPropertyValue('--cover'));
    if (!near(sc, .96, .01)) f.push('Halbe Strecke: Bühne bei scale ' + sc.toFixed(3) + ' statt 0,96');
    if (!(y > 0)) f.push('Halbe Strecke: Bühne nicht nach unten versetzt (y = ' + y + ')');
    if (!near(cover, .375, .02)) f.push('Halbe Strecke: --cover ' + cover + ' statt 0,375');
    var rb = rect(rail).bottom, tt = rect(t).top;
    if (!near(rb, tt, 1)) f.push('Halbe Strecke: Balken endet bei ' + rb.toFixed(1) + ', das Team beginnt bei ' + tt.toFixed(1));
    var zr = getComputedStyle(rail).zIndex, zc = getComputedStyle(stage, '::after').zIndex, zt = getComputedStyle(t).zIndex;
    if (zr !== '5') f.push('Balken mit z-index ' + zr + ' statt 5');
    if (!(+zr > +zc)) f.push('Balken (z-index ' + zr + ') liegt nicht über der Abdunkelung (z-index ' + zc + ')');
    if (zt !== '4') f.push('Team mit z-index ' + zt + ' statt 4');
    // Unterkante der stehenden Kopfleiste, auf halber Strecke gemessen: Genau am Ende gibt guard sie frei, beim Weiterscrollen fährt sie weg.
    // Ohne ihre 1-px-Linie unten (.site-header ist --header-h plus Linie hoch): Die Linie liegt über dem Inhalt darunter, wie beim Pinnen.
    var hb = rect('.site-header').bottom - px('.site-header', 'borderBottomWidth');
    await go(end); await frames(2);
    rb = rect(rail).bottom;
    if (!near(rb, hb, 1)) f.push('Ende: Balken endet bei ' + rb.toFixed(1) + ', die stehende Kopfleiste bei ' + hb.toFixed(1));
    if (!near(G(vp, 'scale'), .92, .005)) f.push('Ende: Bühne bei scale ' + G(vp, 'scale').toFixed(3) + ' statt 0,92');
    await go(0);
    return f;
  }, live);

  // Läuft als letzte (danach neu laden): so baut auch motion.js ab, wenn jemand zur Laufzeit reduzierte Bewegung einschaltet
  UU.add('story:revert', async function () {
    var f = [], s = sec(), L = leavesOf();
    await go(0); await wait(800); // st.enable() der vorigen Prüfung scrubbt noch zurück
    var before = L[0].getBoundingClientRect();
    story().revert();
    await frames(2);
    if (s.classList.contains('is-live')) f.push('is-live nach revert');
    if (s.querySelector('.pin-spacer')) f.push('pin-spacer nach revert');
    if (story()) f.push('__story nach revert');
    L.forEach(function (l, i) {
      [l].concat(bitsOf(l)).forEach(function (e) {
        var name = e.className || e.tagName.toLowerCase();
        if (e.style.transform || getComputedStyle(e).transform !== 'none') f.push('Etappe ' + (i + 1) + ': ' + name + ' hat noch transform');
        if (opacity(e) !== 1) f.push('Etappe ' + (i + 1) + ': ' + name + ' mit Deckkraft ' + opacity(e));
      });
    });
    var after = L[0].getBoundingClientRect();
    if (!near(after.top, before.top, 1) || !near(after.height, before.height, 1)) {
      f.push('Etappe 1 vorher ' + before.top.toFixed(1) + ' / ' + before.height.toFixed(1) + ', nachher ' + after.top.toFixed(1) + ' / ' + after.height.toFixed(1) + ' (Oberkante / Höhe)');
    }
    await go(0); await go(600); await go(1200); await wait(100);
    if (!away()) f.push('Nach revert fährt die Kopfleiste beim Runterscrollen nicht weg');
    await go(0);
    return f;
  }, live);

  // ---- Task 5: Team ----
  // Fehlt die Section, scheitern alle team:*-Prüfungen mit „[data-about-team] fehlt“ (nicht überspringen).
  var teamEl = function () { return document.querySelector('[data-about-team]'); };
  var T = function (fn) { return function () { var t = teamEl(); return t ? fn(t) : ['[data-about-team] fehlt']; }; };
  var TEAM = ['Richard Link', 'Falk Link', 'Franziska Link', 'Gerhard Link', 'Ingrid Link', 'Jean-Nicolas Kibler', 'Aaron Klosterhuber', 'Jürgen Scheurer'];
  var squish = function (s) { return String(s == null ? '' : s).replace(/\s+/g, ' ').trim(); };
  var cardsOf = function (t) { return Array.prototype.slice.call(t.querySelectorAll('.spot__card')); };
  // Name auf der sichtbaren Karte (genau eine darf sichtbar sein)
  var shownName = function (t) {
    var vis = cardsOf(t).filter(function (c) { return getComputedStyle(c).visibility === 'visible'; });
    return vis.length === 1 ? squish(vis[0].querySelector('h3').textContent) : vis.length + ' Karten sichtbar';
  };
  // Person i wählen und den Wechsel abwarten (Foto 0,75 s, Text bis 1 s, davor bis 400 ms aufs Dekodieren)
  var pickAt = async function (t, i) {
    var b = t.querySelectorAll('[data-pick]')[i];
    if (b && !b.hasAttribute('aria-current')) { b.click(); await wait(1500); }
  };
  var desk = function () { return cw() >= 900 ? '' : 'nur ab 900 px Breite'; };
  var hand = function () { return cw() < 900 ? '' : 'nur unter 900 px Breite'; };
  var rows = function (els) {
    return new Set(Array.prototype.map.call(els, function (e) { return Math.round(e.getBoundingClientRect().top); })).size;
  };

  UU.add('team:markup', T(function (t) {
    var f = [], picks = t.querySelectorAll('.spot__pick');
    if (picks.length !== 8) f.push(picks.length + ' .spot__pick statt 8');
    Array.prototype.forEach.call(picks, function (b, i) {
      var name = squish(b.getAttribute('aria-label'));
      if (b.getAttribute('data-pick') !== String(i)) f.push('Knopf ' + (i + 1) + ' hat data-pick="' + b.getAttribute('data-pick') + '"');
      if (TEAM[i] && name !== TEAM[i]) f.push('Knopf ' + (i + 1) + ' heißt „' + name + '“ statt „' + TEAM[i] + '“');
    });
    if (picks[0] && !picks[0].hasAttribute('aria-current')) f.push('Erster Knopf ohne aria-current');
    var text = squish(t.textContent);
    TEAM.forEach(function (name) { if (text.indexOf(name) < 0) f.push('„' + name + '“ fehlt im Text der Section'); });
    if (!t.classList.contains('is-ready')) f.push('is-ready fehlt');
    return f;
  }));

  // Vor team:select und team:wide: Die laden Fotos selbst, danach sagte die Prüfung nichts mehr
  UU.add('team:preload', T(async function (t) {
    var f = [];
    await go(Math.max(0, t.getBoundingClientRect().top + window.scrollY - 1.5 * innerHeight));
    await wait(300);
    t.querySelectorAll('img').forEach(function (img, i) {
      if (img.getAttribute('loading') !== 'eager') f.push('Foto ' + (i + 1) + ' (' + img.src.split('/').pop().split('?')[0] + ') hat loading="' + img.getAttribute('loading') + '"');
    });
    await go(0);
    return f;
  }));

  UU.add('team:select', T(async function (t) {
    var f = [], picks = t.querySelectorAll('[data-pick]');
    try {
      picks[2].click();
      await wait(1000);
      if (shownName(t).indexOf('Franziska') < 0) f.push('Sichtbare Karte nach 1 s: ' + shownName(t));
      var st = squish(t.querySelector('[data-status]').textContent);
      if (st.indexOf('Franziska Link') < 0) f.push('[data-status]: „' + st + '“');
      if (!picks[2].hasAttribute('aria-current')) f.push('Dritter Knopf ohne aria-current');
      if (t.querySelectorAll('[data-pick][aria-current]').length !== 1) f.push('Nicht genau ein Knopf mit aria-current');
    } finally {
      await pickAt(t, 0);
    }
    return f;
  }));

  UU.add('team:arrows', T(async function (t) {
    var f = [], next = t.querySelector('[data-next]'), prev = t.querySelector('[data-prev]');
    if (!next || !prev) return ['Pfeile fehlen'];
    if (cw() < 900) return shown(next) || shown(prev) ? ['Pfeile unter 900 px sichtbar'] : [];
    if (!shown(next) || !shown(prev)) f.push('Pfeile ab 900 px nicht sichtbar');
    try {
      await pickAt(t, 0);
      next.click(); await wait(1500);
      if (shownName(t) !== 'Falk Link') f.push('[data-next] führt von Richard zu „' + shownName(t) + '“');
      await pickAt(t, 0);
      prev.click(); await wait(1500);
      if (shownName(t) !== 'Jürgen Scheurer') f.push('[data-prev] führt von Richard zu „' + shownName(t) + '“');
    } finally {
      await pickAt(t, 0);
    }
    return f;
  }));

  UU.add('team:wide', T(async function (t) {
    var f = [];
    await pickAt(t, 0);
    await go(t.getBoundingClientRect().top + window.scrollY - 100);
    var shot = t.querySelector('.spot__shot.is-active'), img = shot && shot.querySelector('img');
    if (!img || getComputedStyle(shot).visibility !== 'visible') return ['Kein sichtbares Foto'];
    for (var k = 0; k < 50 && !(img.complete && img.currentSrc); k++) await wait(100);
    if (!/breit/.test(img.currentSrc)) f.push('Foto von Richard: currentSrc „' + img.currentSrc.split('/').pop() + '“ ohne „breit“');
    var g = t.querySelector('.spot__grid'), right = g.getBoundingClientRect().right - px(g, 'paddingRight'), r = rect(t.querySelector('.spot__photo'));
    if (!near(r.width / r.height, 1.5, .01)) f.push('Fotofeld ' + r.width.toFixed(1) + ' × ' + r.height.toFixed(1) + ' (' + (r.width / r.height).toFixed(3) + ') statt 3 : 2');
    if (r.right > right + 1) f.push('Fotofeld endet bei ' + r.right.toFixed(1) + ' px, der Container bei ' + right.toFixed(1));
    await go(0);
    return f;
  }), desk);

  UU.add('team:nowide', T(function (t) {
    var i = cardsOf(t).findIndex(function (c) { return squish(c.textContent).indexOf('Ingrid') === 0; });
    var shot = t.querySelectorAll('.spot__shot')[i], img = shot && shot.querySelector('img'), f = [];
    if (!img) return ['Foto von Ingrid fehlt'];
    if (shot.querySelector('source')) f.push('Ingrid hat einen breiten Ausschnitt (source)');
    if (getComputedStyle(img).objectFit !== 'contain') f.push('Foto von Ingrid mit object-fit ' + getComputedStyle(img).objectFit + ' statt contain');
    return f;
  }), desk);

  UU.add('team:layout', T(function (t) {
    var f = [], roster = t.querySelector('.spot__roster'), photo = t.querySelector('.spot__photo'), nav = t.querySelector('.spot__nav');
    if (!roster) return ['.spot__roster fehlt'];
    var cols = getComputedStyle(roster).gridTemplateColumns.split(' ').length, n = rows(t.querySelectorAll('.spot__pick'));
    var rr = rect(roster), pr = rect(photo), grid = cols + ' × ' + n;
    if (cw() >= 1280) {
      if (grid !== '4 × 2') f.push('Raster ' + grid + ' statt 4 × 2');
      if (rr.top < rect(nav).bottom - 1) f.push('Raster beginnt bei ' + rr.top.toFixed(1) + ', die Pfeile enden bei ' + rect(nav).bottom.toFixed(1));
      if (rr.right > pr.left + 1) f.push('Raster ragt ins Foto');
    } else if (cw() >= 900) {
      if (grid !== '8 × 1') f.push('Raster ' + grid + ' statt 8 × 1');
      if (rr.top < pr.bottom - 1) f.push('Raster beginnt bei ' + rr.top.toFixed(1) + ', das Foto endet bei ' + pr.bottom.toFixed(1));
    } else {
      if (grid !== '4 × 2') f.push('Raster ' + grid + ' statt 4 × 2');
      if (!near(pr.width, pr.height, 1)) f.push('Foto ' + pr.width.toFixed(1) + ' × ' + pr.height.toFixed(1) + ' nicht quadratisch');
      if (rr.top < pr.bottom - 1) f.push('Raster steht nicht unter dem Foto');
    }
    if (cw() >= 900) {
      var s = t.querySelectorAll('.spot__card.is-active h3 span');
      if (s.length !== 2) f.push('Name der Karte hat ' + s.length + ' span statt 2');
      else if (s[1].getBoundingClientRect().top < s[0].getBoundingClientRect().bottom - 1) f.push('Nachname steht nicht unter dem Vornamen');
    }
    return f;
  }));

  UU.add('team:swipe', T(async function (t) {
    var f = [], photo = t.querySelector('.spot__photo');
    try {
      await pickAt(t, 0);
      photo.dispatchEvent(new PointerEvent('pointerdown', { clientX: 300, bubbles: true }));
      photo.dispatchEvent(new PointerEvent('pointerup', { clientX: 200, bubbles: true }));
      await wait(1500);
      if (shownName(t) !== 'Falk Link') f.push('Nach dem Wischen nach links sichtbar: „' + shownName(t) + '“');
      if (getComputedStyle(photo).touchAction !== 'pan-y') f.push('.spot__photo mit touch-action ' + getComputedStyle(photo).touchAction);
    } finally {
      await pickAt(t, 0);
    }
    return f;
  }), hand);

  // Auf Wunsch des Nutzers entfernt: Zähler „01 / 08“, WhatsApp-Knopf „Nachricht an …“, Notiz zum Team
  UU.add('team:gone', T(function (t) {
    var f = [], text = t.textContent, m = text.match(/\d+\s*\/\s*\d+/);
    if (m) f.push('Zähler im Text: „' + m[0] + '“');
    if (/whatsapp/i.test(text) || t.querySelector('a[href*="wa.me"], a[href*="whatsapp"], [data-wa]')) f.push('WhatsApp-Knopf in der Section');
    if (t.querySelector('a')) f.push('Link in der Section');
    if (t.querySelector('[class*="note"], [class*="notiz"]')) f.push('Notiz in der Section');
    return f;
  }));

  // Ablauf team:one: Vorlage auf eine Person kürzen, hochladen lassen, neu laden, team:one, Konsole ohne Fehler, Vorlage zurück
  UU.add('team:one', T(function (t) {
    var f = [], card = t.querySelector('.spot__card');
    if (t.querySelector('[data-prev], [data-next]')) f.push('Pfeile bei einer Person');
    if (t.querySelector('.spot__roster, [data-pick]')) f.push('Raster bei einer Person');
    if (!card || getComputedStyle(card).visibility !== 'visible') f.push('Die Karte der Person ist nicht sichtbar');
    return f;
  }), function () { var t = teamEl(); return t && t.querySelectorAll('.spot__card').length === 1 ? '' : 'nur mit einer Person in der Vorlage'; });
})();
