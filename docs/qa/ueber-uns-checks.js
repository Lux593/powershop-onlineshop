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

  // ---- Task 5: Team, Vorladen (steht vor allen anderen Prüfungen) ----
  // Im Gesamtlauf zuerst: base:hold, die Bühne und team:select/team:wide scrollen am Team vorbei oder laden seine Fotos selbst, danach
  // sagte die Prüfung nichts mehr. teamEl, T und imgsOf stehen deshalb hier und nicht bei den übrigen Team-Prüfungen.
  // Gegenprobe zuerst: Oben, mehr als zwei Bildschirme vom Team entfernt, ist noch mindestens ein Foto lazy. Hat ein früherer Schritt
  // das Team schon nahe gebracht, sind alle eager und die Prüfung bewiese nichts: dann übersprungen (nach dem Neuladen oben einzeln laufen lassen).
  var teamEl = function () { return document.querySelector('[data-about-team]'); };
  var T = function (fn) { return function () { var t = teamEl(); return t ? fn(t) : ['[data-about-team] fehlt']; }; };
  var imgsOf = function (t) { return Array.prototype.slice.call(t.querySelectorAll('img')); };
  UU.add('team:preload', T(async function (t) {
    var f = [];
    await go(0); await wait(300);
    var far = t.getBoundingClientRect().top + window.scrollY > 2 * innerHeight;
    if (!far) f.push('Gegenprobe: Das Team liegt oben schon weniger als zwei Bildschirme entfernt');
    else if (!imgsOf(t).some(function (img) { return img.getAttribute('loading') === 'lazy'; })) f.push('Gegenprobe: Oben, weit vom Team, ist kein Foto mehr lazy');
    await go(Math.max(0, t.getBoundingClientRect().top + window.scrollY - 1.5 * innerHeight));
    await wait(300);
    t.querySelectorAll('img').forEach(function (img, i) {
      if (img.getAttribute('loading') !== 'eager') f.push('Foto ' + (i + 1) + ' (' + img.src.split('/').pop().split('?')[0] + ') hat loading="' + img.getAttribute('loading') + '"');
    });
    await go(0);
    return f;
  }), function () {
    var t = teamEl();
    return t && imgsOf(t).every(function (img) { return img.getAttribute('loading') === 'eager'; })
      ? 'alle Fotos schon eager (das Team war schon nah), nach dem Neuladen oben einzeln laufen lassen' : '';
  });

  // ---- Task 1: Grundlagen (Tokens, GSAP auf der Seite, Kopfleiste festhalten) ----
  UU.add('base:gsap', function () {
    return window.gsap && PS.motion.scroll ? [] : ['GSAP fehlt auf Über uns'];
  }, function () { return motion(); });
  UU.add('base:tokens', function () {
    return ['--c-orange-on-light', '--c-hd-orange', '--photo-grade']
      .filter(function (t) { return !getComputedStyle(document.documentElement).getPropertyValue(t).trim(); })
      .map(function (t) { return 'Token fehlt: ' + t; });
  });
  // Ein Abstandshalter am Seitenende gibt Platz zum Scrollen. Geprüft wird unterhalb jedes Halte-Bereichs: Die Bühne hält die Kopfleiste
  // selbst (guard, bis zum Ende des Übergangs zum Team), dort sagte die Prüfung nichts über headerHold. Ohne Bühne ab 0.
  // headerHold zählt nicht mit: Nach zweimal true reicht einmal false, danach fährt die Kopfleiste wieder weg.
  UU.add('base:hold', async function () {
    if (typeof PS.headerHold !== 'function') return ['PS.headerHold fehlt'];
    var wrap = document.querySelector('.site-header-wrap'), away = function () { return wrap.classList.contains('is-away'); }, f = [];
    var s = story(), y = s && s.guard ? Math.ceil(s.guard.end) + 200 : 0;
    var pad = document.body.appendChild(Object.assign(document.createElement('div'), { style: 'height:' + (y + 4000) + 'px' }));
    try {
      await go(y); await go(y + 1200); await go(y + 1600);
      if (!away()) f.push('Vorbedingung: Kopfleiste fährt bei ' + (y + 1600) + ' px beim Runterscrollen nicht weg');
      PS.headerHold(true); await wait(400);
      if (away()) f.push('Kopfleiste fährt bei Hold nicht ein');
      PS.headerHold(true);
      await go(y + 2200); await go(y + 2800);
      if (away()) f.push('Kopfleiste fährt trotz Hold weg');
      PS.headerHold(false); await go(y + 3400);
      if (!away()) f.push('Kopfleiste fährt nach zweimal true und einmal false nicht wieder weg');
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
    // Nur das erste Foto je Etappe: Weitere Fotos einer Galerie lädt das Skript vor, sobald ihre Etappe ins Bild kommt (Task 9)
    s.querySelectorAll('.leaf__media > img:first-child').forEach(function (img, i) {
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

  // Das erste Foto jeder Etappe und die Vorschaubilder (Task 9) laden sofort. Weitere große Fotos der Galerie erst, wenn ihre Etappe die
  // aktuelle wird oder ein Knopf Hover oder Fokus bekommt (story:gallery lädt sie selbst).
  UU.add('story:eager', async function () {
    var f = [], imgs = Array.prototype.slice.call(sec().querySelectorAll('.leaf__media > img:first-child, .leaf__thumb img'));
    imgs.forEach(function (img, i) {
      if (img.getAttribute('loading') !== 'eager') f.push('Etappenfoto ' + (i + 1) + ' (' + img.src.split('/').pop().split('?')[0] + ') hat loading="' + img.getAttribute('loading') + '"');
    });
    var ok = function () { return imgs.every(function (img) { return img.complete && img.naturalWidth > 0; }); };
    for (var t = 0; t < 50 && !ok(); t++) await wait(100);
    imgs.forEach(function (img, i) {
      if (!(img.complete && img.naturalWidth > 0)) f.push('Etappenfoto ' + (i + 1) + ' nach 5 s nicht geladen');
    });
    return f;
  }, live);

  // Kein Einrasten (Task 9): Mitten zwischen zwei Etappen anhalten. Danach bewegt sich nichts mehr von selbst: Scrollposition und
  // Fortschritt bleiben stehen, und die Zeitleiste zieht nur bis zum Fortschritt nach (scrub), nicht weiter zu einer Etappe.
  UU.add('story:nosnap', async function () {
    var f = [], st = story().st, last = story().last, k = Math.min(1, last - 1), soll = (k + 0.4) / last;
    if (st.vars.snap) f.push('Der pinnende ScrollTrigger hat noch snap');
    await go(st.start + (st.end - st.start) * soll); await wait(100);
    var y = window.scrollY, p = st.progress;
    await wait(1500);
    if (!near(window.scrollY, y, 1)) f.push('scrollY nach 1,5 s ' + window.scrollY + ' statt ' + y);
    if (!near(st.progress, p, .005)) f.push('Fortschritt nach 1,5 s ' + st.progress.toFixed(4) + ' statt ' + p.toFixed(4));
    var a = st.animation.progress();
    if (!near(a, p, .005)) f.push('Zeitleiste nach 1,5 s bei ' + a.toFixed(4) + ', Fortschritt ' + p.toFixed(4) + ' (eingerastet?)');
    return f;
  }, live);

  // Der Sprung über den Balken erreicht das Ziel ohne Halt: Unterwegs sinkt der Fortschritt nie und steht nie länger als 300 ms still,
  // bevor er das Ziel erreicht. Am Ziel bleibt er stehen.
  UU.add('story:jump', async function () {
    var f = [], st = story().st, links = sec().querySelectorAll('[data-jump]');
    await go(st.start); await wait(300);
    var seen = [st.progress];
    links[links.length - 1].click();
    for (var t = 0; t < 30; t++) { await wait(100); seen.push(st.progress); }
    for (var i = 1; i < seen.length; i++) {
      if (seen[i] < seen[i - 1] - .0005) { f.push('Fortschritt sinkt bei ' + (i * 100) + ' ms: ' + seen[i - 1].toFixed(3) + ' → ' + seen[i].toFixed(3)); break; }
    }
    for (var k = 1, run = 0; k < seen.length && seen[k] < 1 - .001; k++) {
      run = near(seen[k], seen[k - 1], .0005) ? run + 1 : 0;
      if (run >= 3) { f.push('Halt bei ' + (k * 100) + ' ms: Fortschritt steht seit 300 ms bei ' + seen[k].toFixed(3)); break; }
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
      // Sie hält eine Kopfleistenhöhe über das Ende des Übergangs hinaus: Bis dahin liegen Balken und Bühnenrest noch hinter ihr
      var end = toTeamEnd(), hh = headerH(), rail = sec().querySelector('[data-rail]'), gEnd = story().guard.end;
      if (!(Math.abs(gEnd - (end + hh)) < 1)) f.push('guard endet bei ' + gEnd.toFixed(1) + ' statt ' + (end + hh).toFixed(1) + ' (Ende des Übergangs plus Kopfleistenhöhe)');
      await go(st.end); await go((st.end + end) / 2); await wait(100);
      if (away()) f.push('Halbe Strecke des Übergangs zum Team: Kopfleiste weggefahren');
      await go(end + hh / 2); await wait(100);
      if (away()) f.push('Eine halbe Kopfleistenhöhe nach dem Ende des Übergangs: Kopfleiste weggefahren (Balken und Bühne lägen frei)');
      await go(end + hh + 200); await go(end + hh + 400); await go(end + hh + 600); await wait(100);
      if (!away()) f.push('600 px unter dem Ende des Haltens: Kopfleiste nicht weggefahren');
      if (rect(rail).bottom > 0) f.push('600 px unter dem Ende des Haltens: Balken endet noch bei ' + rect(rail).bottom.toFixed(1) + ' px, im Bild');
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

  // Ablauf story:count: Vorlage auf 2, 5 und 1 Etappe ändern, je hochladen lassen, neu laden, story:count und story:nosnap
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

  // ---- Task 9: Fotogalerie je Etappe ----
  // Ablauf: Vorlage vorübergehend ändern, alle vier Etappen mit Galerie: Jede bekommt per „assets_more“ zwei weitere vorhandene
  // Dateien, z. B. "ueber-uns-vorplatz-1280.jpg | Vorplatz\nueber-uns-theke-1280.jpg | Theke" (1991 hat den längsten Text, bei „Heute“
  // bricht der Ort am kleinen Handy um). Hochladen lassen, neu laden, prüfen bei 1440 × 900, 1280 × 620, 1100 × 800, 1024 × 640,
  // 375 × 812 und 320 × 640, danach git restore templates/page.ueber-uns.json. Ohne Etappe mit zwei und mehr Fotos werden die
  // Prüfungen übersprungen.
  var galleries = function () { return Array.prototype.slice.call(sec().querySelectorAll('.leaf--gallery')); };
  var withGallery = function () {
    var s = sec();
    return s && s.querySelector('.leaf__thumbs') ? '' : 'nur mit einer Etappe mit zwei und mehr Fotos (Vorlage vorübergehend ändern)';
  };
  // Große Fotos einer Etappe in der Reihenfolge der Vorschau
  var shotsOf = function (leaf) {
    return Array.prototype.filter.call(leaf.querySelector('.leaf__media').children, function (e) { return e.tagName === 'IMG'; });
  };
  var shownShot = function (img) { return !img.hidden && img.getAttribute('aria-hidden') !== 'true' && getComputedStyle(img).visibility === 'visible'; };
  // Waagerechte Verschiebung aus dem berechneten transform (WAAPI-Animationen stehen nicht im style-Attribut)
  var tx = function (e) { var t = getComputedStyle(e).transform; return t === 'none' ? 0 : new DOMMatrixReadOnly(t).m41; };
  // Etappe k auf der Bühne zeigen (mit Bühne), Werte danach lesen
  var showLeaf = function (leaf) { var s = story(); if (s) at(leavesOf().indexOf(leaf) / s.last); };

  // Vorschau nur ab zwei Fotos, ein Knopf je Foto, genau einer gewählt, 44 px Klickfläche, nichts ragt aus der Etappe. Die Maße bei
  // 1440 × 900 und 1280 × 620, am Handy bei 375 × 812 und 320 × 640 prüfen (resize_window, neu laden).
  UU.add('story:thumbs', function () {
    var f = [];
    leavesOf().forEach(function (leaf, i) {
      var shots = shotsOf(leaf), box = leaf.querySelector('.leaf__thumbs'), btns = leaf.querySelectorAll('.leaf__thumb'), n = 'Etappe ' + (i + 1);
      if (shots.length < 2) {
        if (box || btns.length) f.push(n + ': Vorschau bei ' + shots.length + ' Foto');
        if (leaf.classList.contains('leaf--gallery')) f.push(n + ': leaf--gallery bei ' + shots.length + ' Foto');
        return;
      }
      if (!box) { f.push(n + ': ' + shots.length + ' Fotos, aber keine Vorschau'); return; }
      if (!leaf.classList.contains('leaf--gallery')) f.push(n + ': ohne leaf--gallery');
      if (box.getAttribute('role') !== 'group' || !/^Fotos zu /.test(box.getAttribute('aria-label') || '')) f.push(n + ': .leaf__thumbs ohne role="group" und aria-label „Fotos zu …“');
      if (box.parentElement !== leaf.querySelector('.leaf__text') || box !== box.parentElement.lastElementChild) f.push(n + ': Vorschau steht nicht am Ende von .leaf__text');
      if (btns.length !== shots.length) f.push(n + ': ' + btns.length + ' Knöpfe bei ' + shots.length + ' Fotos');
      if (leaf.querySelectorAll('.leaf__thumb[aria-pressed="true"]').length !== 1) f.push(n + ': nicht genau ein Knopf mit aria-pressed="true"');
      var visible = shots.filter(shownShot);
      if (visible.length !== 1) f.push(n + ': ' + visible.length + ' große Fotos sichtbar statt 1');
      shots.forEach(function (img, k) {
        if (!img.hasAttribute('alt')) f.push(n + ': großes Foto ' + (k + 1) + ' ohne alt');
        if (k && !img.hidden && !shownShot(img)) f.push(n + ': weiteres Foto ' + (k + 1) + ' weder hidden noch sichtbar');
      });
      showLeaf(leaf);
      var lr = leaf.getBoundingClientRect();
      Array.prototype.forEach.call(btns, function (b, k) {
        var r = b.getBoundingClientRect(), img = b.querySelector('img');
        if (b.type !== 'button') f.push(n + ': Knopf ' + (k + 1) + ' ohne type="button"');
        if (!new RegExp('^Foto ' + (k + 1) + ' von ' + btns.length + '(: |$)').test(b.getAttribute('aria-label') || '')) f.push(n + ': Knopf ' + (k + 1) + ' heißt „' + b.getAttribute('aria-label') + '“');
        if (!img || img.getAttribute('alt') !== '') f.push(n + ': Vorschaubild ' + (k + 1) + ' ohne alt=""');
        if (r.height < 44) f.push(n + ': Knopf ' + (k + 1) + ' ist ' + r.height.toFixed(1) + ' px hoch');
        if (!near(r.width / r.height, 1.5, .02)) f.push(n + ': Knopf ' + (k + 1) + ' ist ' + r.width.toFixed(1) + ' × ' + r.height.toFixed(1) + ' statt 3 : 2');
      });
      var br = box.getBoundingClientRect();
      if (br.bottom > lr.bottom + .5) f.push(n + ': Vorschau endet bei ' + br.bottom.toFixed(1) + ', die Etappe bei ' + lr.bottom.toFixed(1) + ' (' + innerWidth + ' × ' + innerHeight + ')');
      if (br.right > lr.right + .5) f.push(n + ': Vorschau ragt rechts aus der Etappe (' + innerWidth + ' × ' + innerHeight + ')');
    });
    return f;
  }, withGallery);

  // Klick auf Foto 3 (rechts vom gewählten): Es kommt von links (translateX < 0). Klick zurück auf Foto 1 (links): Es kommt von rechts
  // (translateX > 0). Nach 700 ms kein transform mehr, aria-pressed umgesprungen, das alte Foto ausgeblendet. Ein Klick während des
  // Schiebens beendet das laufende sofort. scrollY bleibt. Ohne has-motion wechselt das Foto sofort.
  UU.add('story:gallery', async function () {
    var f = [], leaf = galleries().filter(function (l) { return shotsOf(l).length >= 3; })[0];
    if (!leaf) return ['Keine Etappe mit drei Fotos (Vorlage: 1985 mit zwei weiteren Dateien)'];
    var btns = leaf.querySelectorAll('.leaf__thumb'), shots = shotsOf(leaf), html = document.documentElement;
    var pressed = function (k) { return btns[k].getAttribute('aria-pressed') === 'true'; };
    // Alle Fotos vorher laden, sonst wartet der Wechsel aufs Dekodieren und die 100 ms stimmen nicht
    shots.forEach(function (img) { img.loading = 'eager'; });
    await Promise.all(shots.map(function (img) { return img.decode().catch(function () {}); }));
    // Mit laufender Bühne, ohne at() und ohne disable: Etappe anscrollen, Scrub ausklingen lassen, klicken. Weder scrollY noch der
    // Fortschritt dürfen sich ändern.
    var s0 = story();
    if (s0) {
      var st0 = s0.st;
      await go(st0.start + (st0.end - st0.start) * leavesOf().indexOf(leaf) / s0.last + 1); await wait(900);
      var y0 = window.scrollY, p0 = st0.progress, a0 = st0.animation.progress();
      btns[1].click(); await wait(800); btns[0].click(); await wait(800);
      if (!near(window.scrollY, y0, .5)) f.push('Laufende Bühne: scrollY nach Klicks ' + window.scrollY + ' statt ' + y0);
      if (!near(st0.progress, p0, .0005)) f.push('Laufende Bühne: Fortschritt nach Klicks ' + st0.progress.toFixed(4) + ' statt ' + p0.toFixed(4));
      if (!near(st0.animation.progress(), a0, .0005)) f.push('Laufende Bühne: Zeitleiste nach Klicks ' + st0.animation.progress().toFixed(4) + ' statt ' + a0.toFixed(4));
    }
    showLeaf(leaf);
    if (!pressed(0)) { btns[0].click(); await wait(800); }
    var y = window.scrollY;
    try {
      btns[2].click(); await wait(100);
      var t = tx(shots[2]);
      if (!(t < 0)) f.push('100 ms nach Klick auf Foto 3: translateX ' + t.toFixed(1) + ', erwartet < 0 (von links)');
      if (!shownShot(shots[0])) f.push('Während des Schiebens ist Foto 1 nicht mehr sichtbar (soll stehen bleiben)');
      await wait(600);
      if (getComputedStyle(shots[2]).transform !== 'none') f.push('700 ms nach Klick auf Foto 3: transform ' + getComputedStyle(shots[2]).transform);
      if (!pressed(2) || pressed(0)) f.push('700 ms nach Klick auf Foto 3: aria-pressed nicht umgesprungen');
      if (!shownShot(shots[2]) || shownShot(shots[0])) f.push('700 ms nach Klick auf Foto 3: Foto 3 nicht allein sichtbar');
      btns[0].click(); await wait(100);
      t = tx(shots[0]);
      if (!(t > 0)) f.push('100 ms nach Klick auf Foto 1: translateX ' + t.toFixed(1) + ', erwartet > 0 (von rechts)');
      await wait(600);
      if (getComputedStyle(shots[0]).transform !== 'none') f.push('700 ms nach Klick auf Foto 1: transform ' + getComputedStyle(shots[0]).transform);
      if (!pressed(0) || pressed(2)) f.push('700 ms nach Klick auf Foto 1: aria-pressed nicht umgesprungen');
      if (!shots[2].hidden) f.push('700 ms nach Klick auf Foto 1: Foto 3 nicht hidden');
      // Klick während des Schiebens: Das laufende springt sofort ans Ende
      btns[1].click(); await wait(100);
      btns[2].click();
      if (getComputedStyle(shots[1]).transform !== 'none' || shots[1].getAnimations().length) f.push('Zweiter Klick während des Schiebens: Foto 2 läuft weiter');
      await wait(700);
      if (!pressed(2) || !shownShot(shots[2]) || shownShot(shots[1])) f.push('Nach zwei schnellen Klicks steht nicht Foto 3');
      if (!near(window.scrollY, y, .5)) f.push('scrollY nach den Klicks ' + window.scrollY + ' statt ' + y);
      // Ohne has-motion: sofort, ohne transform
      html.classList.remove('has-motion');
      btns[0].click();
      if (!pressed(0) || !shownShot(shots[0]) || shownShot(shots[2])) f.push('Ohne has-motion: Foto 1 nicht sofort da');
      if (getComputedStyle(shots[0]).transform !== 'none') f.push('Ohne has-motion: Foto 1 mit transform');
    } finally {
      html.classList.add('has-motion');
      if (!pressed(0)) { btns[0].click(); await wait(800); }
    }
    return f;
  }, function () {
    return motion() || withGallery() || (matchMedia('(prefers-reduced-motion: reduce)').matches ? 'nur ohne reduzierte Bewegung' : '');
  });

  // Mit laufender Bühne sind nur die Vorschauknöpfe der aktuellen Etappe per Tab erreichbar (tabindex -1 an allen übrigen)
  UU.add('story:thumbs-tab', function () {
    var f = [], L = leavesOf(), last = story().last;
    galleries().forEach(function (leaf) {
      var k = L.indexOf(leaf), other = k < last ? k + 1 : k - 1, btns = Array.prototype.slice.call(leaf.querySelectorAll('.leaf__thumb'));
      at(other / last);
      if (btns.some(function (b) { return b.tabIndex >= 0; })) f.push('Aktuelle Etappe ' + (other + 1) + ': Vorschauknöpfe von Etappe ' + (k + 1) + ' per Tab erreichbar');
      at(k / last);
      if (btns.some(function (b) { return b.tabIndex < 0; })) f.push('Aktuelle Etappe ' + (k + 1) + ': eigene Vorschauknöpfe nicht per Tab erreichbar');
      if (k < last) at((k + 0.4) / last);
      if (k < last && btns.some(function (b) { return b.tabIndex >= 0; })) f.push('Mitten im Wechsel nach Etappe ' + (k + 1) + ': deren Vorschauknöpfe noch per Tab erreichbar');
    });
    // Fokus (Tab, Suche im Browser) verschiebt nichts seitlich: auch nicht auf einem Knopf einer wartenden Etappe außerhalb des Bilds
    var s = sec(), boxes = [s.querySelector('[data-stage]'), s.querySelector('[data-viewport]'), s.querySelector('.about-story__track')].concat(L);
    var y = window.scrollY;
    at(0);
    galleries().forEach(function (leaf) {
      leaf.querySelectorAll('.leaf__thumb').forEach(function (b) { b.focus({ preventScroll: false }); });
    });
    boxes.forEach(function (e) {
      if (e.scrollLeft || e.scrollTop) f.push((e.id || e.className) + ': nach Fokus verschoben (scrollLeft ' + e.scrollLeft + ', scrollTop ' + e.scrollTop + ')');
    });
    if (getComputedStyle(L[0]).overflowX !== 'clip') f.push('.leaf mit overflow ' + getComputedStyle(L[0]).overflowX + ' statt clip');
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    window.scrollTo({ top: y, behavior: 'instant' });
    return f;
  }, function () { return live() || withGallery(); });

  // ---- Task 6: Übergang von der Bühne zum Team ----
  // Steht vor story:revert, damit UU.run('story') sie noch mit Bühne ausführt.
  // Ende des Übergangs: Die Oberkante des Teams erreicht die Unterkante der stehenden Kopfleiste (--header-h).
  var headerH = function () { return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 0; };
  var toTeamEnd = function () {
    return teamEl().getBoundingClientRect().top + window.scrollY - headerH();
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
    // Unterkante der stehenden Kopfleiste, auf halber Strecke gemessen. Am Ende steht sie noch: guard gibt sie erst eine Kopfleistenhöhe
    // später frei (toTeam.end + hh, story:header Teil 2).
    // Ohne ihre 1-px-Linie unten (.site-header ist --header-h plus Linie hoch): Die Linie liegt über dem Inhalt darunter, wie beim Pinnen.
    var hb = rect('.site-header').bottom - px('.site-header', 'borderBottomWidth');
    await go(end); await frames(2);
    if (away()) f.push('Ende des Übergangs (von oben kommend): Kopfleiste weggefahren');
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

  // Rückfall ohne Bühne (Fix I1): Steht html.has-motion, kommt die Bühne aber nicht (GSAP fehlt, Skript lädt nicht oder bricht ab), hebt
  // is-static die Vorstufe auf. Läuft nach story:revert, dann steht die Section wie vor dem Skript da. Die Prüfung führt about-story.js
  // mit einem PS ohne ScrollTrigger aus (PS.motion.scroll falsch), wie auf einer Seite, auf der GSAP nicht geladen hat.
  var STAGE_Q = '(prefers-reduced-motion: no-preference) and (min-height: 600px)';
  UU.add('story:fallback', async function () {
    var f = [], s = sec(), L = leavesOf(), stageEl = s.querySelector('[data-stage]');
    var heights = function () { return L.map(function (l) { return l.getBoundingClientRect().height; }); };
    // Soll: die Höhen ohne Vorstufe (ohne about-story--stage greift sie nicht), synchron gemessen
    s.classList.remove('about-story--stage'); var soll = heights(); s.classList.add('about-story--stage');
    // Vorbedingung: Die Vorstufe greift. Erkennbar am Rand unter Etappe 1 (Platz für den Balken, --rail-h). Die Höhe taugt dafür nicht:
    // Bei 1440 × 900 ohne Scrollbalken ist die statische Etappe zufällig genauso hoch wie die Vorstufe (749 px).
    if (!(px(L[0], 'marginBottom') > 0)) f.push('Vorbedingung: Etappe 1 ohne Rand unten, die Vorstufe greift nicht');
    var src = await (await fetch(document.querySelector('script[src*="about-story.js"]').src, { cache: 'no-store' })).text();
    var added = 0;
    try {
      new Function('window', src)({ PS: { on: function (sel, init) { init(s); }, motion: { scroll: false, add: function () { added++; } } } });
      if (!s.classList.contains('is-static')) f.push('about-story.js setzt ohne ScrollTrigger kein is-static');
      if (added) f.push('PS.motion.add trotz PS.motion.scroll = false aufgerufen');
      heights().forEach(function (h, i) {
        if (!near(h, soll[i], 1)) f.push('Etappe ' + (i + 1) + ' ist ' + h.toFixed(1) + ' px hoch statt ' + soll[i].toFixed(1) + ' (statisch)');
      });
      if (px(L[0], 'marginBottom') !== 0) f.push('Etappe 1 hat unten ' + px(L[0], 'marginBottom') + ' px Abstand (schwarzer Streifen)');
      if (getComputedStyle(stageEl).backgroundColor === tokenColor('backgroundColor', '--c-black')) f.push('Bühnengrund ist schwarz');
      L.forEach(function (l, i) {
        var r = l.getBoundingClientRect();
        if (i && !near(r.top, L[i - 1].getBoundingClientRect().bottom, 1)) f.push('Etappe ' + (i + 1) + ' steht nicht direkt unter Etappe ' + i);
        if (!(r.height > 0) || opacity(l) !== 1 || getComputedStyle(l).transform !== 'none') f.push('Etappe ' + (i + 1) + ' nicht sichtbar');
      });
      if (shown(s.querySelector('[data-rail]'))) f.push('Balken ist sichtbar');
    } finally {
      s.classList.remove('is-static');
    }
    return f;
  }, function () {
    var s = sec();
    if (!s || !s.classList.contains('about-story--stage')) return 'nur mit about-story--stage';
    if (story()) return 'nur ohne laufende Bühne (läuft nach story:revert)';
    if (!document.documentElement.classList.contains('has-motion') || !matchMedia(STAGE_Q).matches) return 'nur mit Bewegung ab 600 px Fensterhöhe';
    return '';
  });

  // ---- Task 5: Team ----
  // Fehlt die Section, scheitern alle team:*-Prüfungen mit „[data-about-team] fehlt“ (nicht überspringen).
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

  // ---- Task 7: Komm vorbei ----
  // Vergleich der Karte (Bash, kein Browser), damit der Umbau von sections/visit.liquid nichts ändert:
  //   curl -s http://127.0.0.1:9293/pages/service | python3 -I docs/qa/karte-ausschneiden.py > "$Q/karte-nachher.html"
  //   diff "$Q/karte-vorher.html" "$Q/karte-nachher.html"     (keine Ausgabe heißt gleich)
  var visitEl = function () { return document.querySelector('.about-visit'); };
  var V = function (fn) { return function () { var v = visitEl(); return v ? fn(v) : ['.about-visit fehlt']; }; };
  var vq = function (v, sel) { return v.querySelector(sel); };
  // Telefon, WhatsApp, E-Mail aus den Händlerdaten wie snippets/contact-href sie bereinigt
  var shop = function () { return (window.PS && PS.shop) || {}; };
  var telOf = function (x) { return 'tel:' + String(x || '').replace(/[ \-()\/.]/g, ''); };
  var waOf = function (x) { return 'https://wa.me/' + encodeURIComponent(String(x || '').replace(/[ +\-()\/.]/g, '')); };
  var mailOf = function (x) { return 'mailto:' + String(x || '').replace(/\s/g, ''); };

  UU.add('visit:about', V(function (v) {
    var f = [], map = vq(v, '.visit__map'), body = vq(v, '.about-visit__body'), route = vq(v, '.about-visit__route');
    var tel = vq(v, '[data-cb="tel"]'), wa = vq(v, '[data-cb="wa"]'), mail = vq(v, '[data-cb="mail"]'), box = vq(v, '.about-visit__contact');
    if (!map || !body || !route || !tel || !wa || !mail || !box) return ['Teile fehlen: ' + [!map && '.visit__map', !body && '.about-visit__body', !route && '.about-visit__route', !tel && 'Anrufen', !wa && 'WhatsApp', !mail && 'E-Mail', !box && '.about-visit__contact'].filter(Boolean).join(', ')];
    var has = function (e, c) { return e.classList.contains(c); };
    if (!has(route, 'btn--primary')) f.push('„Route planen“ ist nicht btn--primary');
    if (!has(tel, 'btn--primary')) f.push('„Anrufen“ ist nicht btn--primary');
    if (!has(wa, 'btn--outline-dark')) f.push('WhatsApp ist nicht btn--outline-dark');
    if (!has(mail, 'btn--outline-dark')) f.push('E-Mail ist nicht btn--outline-dark');
    if (squish(route.textContent).indexOf('Route planen') !== 0) f.push('Routenknopf heißt „' + squish(route.textContent) + '“');
    if (squish(wa.textContent).indexOf('WhatsApp') !== 0) f.push('WhatsApp-Knopf heißt „' + squish(wa.textContent) + '“');
    if (squish(mail.textContent) !== 'E-Mail') f.push('E-Mail-Knopf heißt „' + squish(mail.textContent) + '“');
    var phone = String(shop().phone || '');
    if (!phone) f.push('PS.shop.phone ist leer, die Nummer lässt sich nicht prüfen');
    else if (squish(tel.textContent).indexOf(squish(phone)) < 0) f.push('„Anrufen“ enthält nicht die Nummer „' + phone + '“: „' + squish(tel.textContent) + '“');
    // nicht gewollt: Ring, Einblenden der ganzen Karte, Kontakt-Box mit Themen
    if (v.querySelector('.visit__ring')) f.push('.visit__ring vorhanden');
    if (map.hasAttribute('data-reveal')) f.push('Karte hat data-reveal');
    if (v.querySelector('.contact-box, .contact-box__topics, [data-topic], .chip')) f.push('Kontakt-Box oder Themen-Chips vorhanden');
    if (/schreib uns/i.test(v.textContent)) f.push('„Schreib uns“ im Text');
    var w = cw(), mr = map.getBoundingClientRect(), br = body.getBoundingClientRect(), tr = tel.getBoundingClientRect(), ar = box.getBoundingClientRect();
    var n = rows(box.children);
    if (w >= 900) {
      if (mr.right > br.left + 1) f.push('Karte (bis ' + mr.right.toFixed(1) + ') und Text (ab ' + br.left.toFixed(1) + ') überlappen');
      if (mr.left > 1) f.push('Karte beginnt bei ' + mr.left.toFixed(1) + ' px, nicht am linken Rand');
      if (!near(tr.width, ar.width, 1)) f.push('„Anrufen“ ist ' + tr.width.toFixed(1) + ' px breit, die Knopfreihe ' + ar.width.toFixed(1));
      if (n !== 2) f.push(n + ' Reihen Knöpfe statt 2 (Anrufen, darunter WhatsApp und E-Mail)');
      else if (!near(wa.getBoundingClientRect().top, mail.getBoundingClientRect().top, 1)) f.push('WhatsApp und E-Mail stehen nicht nebeneinander');
      if (!shown(vq(v, '.about-visit__phone'))) f.push('Nummer neben „Anrufen“ ab 900 px nicht sichtbar');
      if (rect(route).left < br.left - 1) f.push('Routenknopf links vom Textblock');
    } else if (w >= 640) {
      if (n !== 1) f.push(n + ' Reihen Knöpfe statt 1 (Anrufen, WhatsApp und E-Mail in einer Reihe)');
    } else if (n !== 3) {
      f.push(n + ' Reihen Knöpfe statt 3 (untereinander)');
    }
    if (w < 900 && shown(vq(v, '.about-visit__phone'))) f.push('Nummer neben „Anrufen“ unter 900 px sichtbar');
    return f;
  }));

  UU.add('visit:mobile', V(function (v) {
    var f = [], map = vq(v, '.visit__map'), pin = vq(v, '.visit__pin'), tag = vq(v, '.visit__tag');
    if (!map || !pin || !tag) return ['Karte, Pin oder Schild fehlt'];
    var mr = map.getBoundingClientRect(), pr = pin.getBoundingClientRect(), w = cw();
    if (!near(mr.width, w, 1) || mr.left > 1) f.push('Karte ' + mr.width.toFixed(1) + ' px breit ab ' + mr.left.toFixed(1) + ', nicht über die volle Breite (' + w + ')');
    var soll = Math.min(560, Math.max(300, .88 * w));
    if (!near(mr.height, soll, 1)) f.push('Karte ' + mr.height.toFixed(1) + ' px hoch statt ' + soll.toFixed(1));
    var label = function (name) {
      return Array.prototype.filter.call(v.querySelectorAll('.visit__label'), function (l) { return squish(l.textContent) === name; })[0];
    };
    ['Frankreich', 'Schweiz'].forEach(function (name) {
      var l = label(name);
      if (!l) f.push('Beschriftung „' + name + '“ fehlt im Markup');
      else if (getComputedStyle(l).display !== 'none') f.push('„' + name + '“ ist nicht ausgeblendet');
    });
    var de = label('Deutschland');
    if (!de || !shown(de)) f.push('„Deutschland“ nicht sichtbar');
    var sizes = Array.prototype.filter.call(v.querySelectorAll('.visit__label'), shown).map(function (l) { return px(l, 'fontSize'); });
    sizes.forEach(function (sz) { if (sz !== 10) f.push('Kartenschrift ' + sz + ' px statt 10'); });
    var lines = Array.prototype.map.call(v.querySelectorAll('.about-visit__address > span'), function (s) { return squish(s.textContent); });
    var addr = vq(tag, '.visit__addr'), text = squish(tag.textContent);
    if (!lines.length) f.push('Adresse im Textblock fehlt');
    if (!addr || !shown(addr)) f.push('Adresse im Schild nicht sichtbar');
    lines.forEach(function (l) { if (text.indexOf(l) < 0) f.push('Schild enthält nicht „' + l + '“: „' + text + '“'); });
    if (text.indexOf('Power Shop') < 0) f.push('Schild ohne „Power Shop“');
    var logo = vq(tag, 'img.visit__logo');
    if (!logo || !/hd-bar-shield/.test(logo.src)) f.push('Bar & Shield fehlt im Schild');
    var cx = mr.left + mr.width / 2;
    if (Math.abs(pr.left - cx) > 2) f.push('Pin bei x = ' + pr.left.toFixed(1) + ', Mitte der Karte ' + cx.toFixed(1));
    // Der Textblock ist nur noch für Screenreader da, die Reihenfolge ist Überschrift, Karte, Route, Kontakt, Lieferhinweis
    var place = vq(v, '.about-visit__place');
    if (place && shown(place) && place.getBoundingClientRect().width > 2) f.push('Adressblock ist neben dem Schild noch sichtbar');
    var tops = ['.about-visit__title', '.visit__map', '.about-visit__route', '.about-visit__contact', '.about-visit__foot'].map(function (sel) {
      var e = vq(v, sel); return e ? e.getBoundingClientRect().top : NaN;
    });
    for (var i = 1; i < tops.length; i++) if (!(tops[i] >= tops[i - 1])) f.push('Reihenfolge am Handy: Teil ' + (i + 1) + ' steht über Teil ' + i);
    return f;
  }), hand);

  UU.add('visit:land', V(async function (v) {
    var f = [], pin = vq(v, '.visit__pin'), map = vq(v, '.visit__map');
    if (!pin || !map) return ['Pin oder Karte fehlt'];
    if (!pin.hasAttribute('data-reveal')) f.push('Pin hat kein data-reveal');
    var fresh = !pin.classList.contains('is-in');
    // Vorher: versetzt und unsichtbar (bei schon gelandetem Pin die Klasse kurz abnehmen und zurücksetzen)
    if (!fresh) pin.classList.remove('is-in');
    var cs = getComputedStyle(pin), op = cs.opacity, tr = cs.translate;
    if (op !== '0') f.push('Pin vor dem Einblenden hat opacity ' + op + ' statt 0');
    if (!tr || tr === 'none' || /^0(px)? 0(px)?$/.test(tr)) f.push('Pin vor dem Einblenden ist nicht versetzt (translate ' + tr + ')');
    if (!fresh) { pin.classList.add('is-in'); await wait(1000); }
    // Landen: genau eine Animation, auch wenn man weg- und zurückscrollt
    var starts = 0, on = function (e) { if (e.target === pin) starts++; };
    pin.addEventListener('animationstart', on);
    try {
      var top = function () { return pin.getBoundingClientRect().top + window.scrollY - innerHeight * .5; };
      await go(top()); await wait(1300);
      if (!pin.classList.contains('is-in')) f.push('Pin hat nach dem Hinscrollen kein is-in');
      cs = getComputedStyle(pin);
      if (cs.opacity !== '1') f.push('Pin nach dem Landen hat opacity ' + cs.opacity);
      if (cs.translate !== 'none') f.push('Pin nach dem Landen ist noch versetzt (translate ' + cs.translate + ')');
      var mr = map.getBoundingClientRect(), pr = pin.getBoundingClientRect();
      if (Math.abs(pr.left - (mr.left + mr.width / 2)) > 2) f.push('Pin steht bei x = ' + pr.left.toFixed(1) + ' statt ' + (mr.left + mr.width / 2).toFixed(1));
      if (Math.abs(pr.top - (mr.top + .3997 * mr.height)) > 2) f.push('Pin steht bei y = ' + pr.top.toFixed(1) + ' statt ' + (mr.top + .3997 * mr.height).toFixed(1));
      await go(0); await wait(400);
      await go(top()); await wait(1300);
      var soll = fresh ? 1 : 0;
      if (starts !== soll) f.push(starts + ' Landeanimationen statt ' + soll + (fresh ? '' : ' (der Pin war schon gelandet)'));
      if (getComputedStyle(pin).opacity !== '1') f.push('Pin ist nach dem Zurückscrollen nicht sichtbar');
    } finally {
      pin.removeEventListener('animationstart', on);
      await go(0);
    }
    return f;
  }), motion);

  UU.add('visit:data', V(function (v) {
    var f = [], s = shop();
    var tel = vq(v, '[data-cb="tel"]'), wa = vq(v, '[data-cb="wa"]'), mail = vq(v, '[data-cb="mail"]'), route = vq(v, '.about-visit__route');
    var is = function (name, actual, soll) { if (actual !== soll) f.push(name + ': „' + actual + '“ statt „' + soll + '“'); };
    if (!tel || !wa || !mail || !route) return ['Anrufen, WhatsApp, E-Mail oder Route fehlt'];
    // contact-href gibt vor und nach der Adresse einen Zeilenumbruch aus (wie in der Kontakt-Box), ein Browser ignoriert ihn im href
    is('Anrufen', String(tel.getAttribute('href')).trim(), telOf(s.phone));
    // WhatsApp: contact.js hängt ?text=… an (assets/contact.js:38), davor steht die Adresse aus contact-href
    var w = String(wa.getAttribute('href') || '').trim();
    is('WhatsApp (vor ?text=)', w.split('?')[0], waOf(s.whatsapp));
    if (w.indexOf('?text=') < 0) f.push('WhatsApp-Link ohne ?text= (contact.js hat ihn nicht gesetzt): „' + w + '“');
    var m = String(mail.getAttribute('href') || '').trim();
    is('E-Mail (vor ?subject=)', m.split('?')[0], mailOf(s.email));
    if (m.indexOf('?subject=') < 0) f.push('E-Mail-Link ohne ?subject= (contact.js hat ihn nicht gesetzt): „' + m + '“');
    var u = new URL(route.href), lines = Array.prototype.map.call(v.querySelectorAll('.about-visit__address > span'), function (e) { return squish(e.textContent); });
    is('Route (Ziel)', u.searchParams.get('destination'), lines.join(', '));
    if (u.origin + u.pathname !== 'https://www.google.com/maps/dir/') f.push('Route führt nach ' + u.origin + u.pathname);
    if (u.searchParams.get('api') !== '1') f.push('Route ohne api=1');
    if (route.target !== '_blank' || !/noopener/.test(route.rel)) f.push('Route öffnet nicht mit target=_blank und rel=noopener');
    if (wa.target !== '_blank' || !/noopener/.test(wa.rel)) f.push('WhatsApp öffnet nicht mit target=_blank und rel=noopener');
    return f;
  }));
})();
