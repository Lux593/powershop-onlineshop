/* ==========================================================================
   Power Shop – Intro / Einlass (Startseite). Markup: snippets/intro.liquid, Stile: assets/intro.css, Doku: docs/intro.md.
   Läuft nur, wenn das Head-Skript (layout/theme.liquid) html.intro-on gesetzt hat. Ablauf:
     build   Film „Aufbau“ läuft, das Logo zeichnet sich aus Linien
     ready   Überschrift und Button sind eingestiegen, warten auf den Klick
     zoom    Klick: Texte steigen aus, Film „Zoom“ fährt durch den Balken auf die Startseite
     done    Überzug blendet aus, Seite wird frei (Event ps:introdone, hero.js startet dann seinen Film)
   Jeder Fehlerfall führt nach done: ohne laufenden Film (Autoplay gesperrt, Netz zu langsam) steht das Standbild des Logos mit
   den Texten, nach dem Klick blendet der Überzug direkt aus. Der Besuch wird erst bei done als gesehen gemerkt.
   ========================================================================== */
(function () {
  'use strict';
  var doc = document, html = doc.documentElement;
  var root = doc.querySelector('[data-intro-root]');
  if (!root) return;

  var T_TEXT = 3.3;     // s im Aufbau-Film: die Linien treffen sich, ab hier steigen die Texte ein
  var state = 'build';
  var textShown = false, fallback = false;
  var inerted = [], timers = [];
  function later(fn, ms) { var t = setTimeout(fn, ms); timers.push(t); return t; }

  // Das Head-Skript wollte keinen Intro (schon gesehen, Datensparen, Bot …): Überzug samt Film-Adressen verwerfen
  if (!html.classList.contains('intro-on')) { root.remove(); return; }
  var variant = html.getAttribute('data-intro-variant') === 'portrait' ? 'portrait' : 'landscape';
  var S;
  try { S = JSON.parse(root.getAttribute('data-sources'))[variant]; } catch (e) { S = null; }
  var build = root.querySelector('.intro__video--build');
  var zoom = root.querySelector('.intro__video--zoom');
  var frame = root.querySelector('.intro__frame');
  var text = root.querySelector('[data-intro-text]');
  var tpl = root.querySelector('[data-intro-tpl]');
  var skip = root.querySelector('[data-intro-skip]');
  // Seite kam mitten aus dem Scrollen zurück (Neuladen, Zurück-Taste): dort gehört kein Intro hin
  if (!S || !build || !zoom || !tpl || (window.pageYOffset || 0) > 80) { finish(true); return; }
  html.setAttribute('data-intro-ready', ''); // Failsafe im Head: ohne dieses Zeichen gibt er die Seite nach 6 s frei

  /* ---------------- Seite dahinter sperren ---------------- */
  [].forEach.call(doc.body.children, function (el) {
    if (el === root || /^(SCRIPT|STYLE|LINK|TEMPLATE)$/.test(el.tagName) || el.hasAttribute('inert')) return;
    el.setAttribute('inert', '');
    inerted.push(el);
  });
  if (window.PS && PS.lenis && PS.lenis.stop) PS.lenis.stop();
  root.focus({ preventScroll: true });

  /* ---------------- Filme ---------------- */
  function pick(v, s) {
    // WebM nur wenn sicher abspielbar (wie hero.js), sonst MP4
    return s.webm && v.canPlayType('video/webm; codecs="vp9"') === 'probably' ? s.webm : s.mp4;
  }
  build.muted = zoom.muted = true;
  build.src = pick(build, S.build);
  zoom.src = pick(zoom, S.zoom);

  function showFrame() {
    // Notlösung: Standbild des fertigen Logos, Texte sofort
    if (fallback || state === 'done') return;
    fallback = true;
    if (variant === 'portrait') { frame.width = 1080; frame.height = 1920; }
    frame.src = S.frame;
    frame.hidden = false;
    root.classList.add('is-fallback');
    build.pause();
    showText();
  }

  var started = later(showFrame, 5000); // der Film kommt in 5 s nicht in Gang
  build.addEventListener('playing', function () {
    clearTimeout(started);
    build.classList.add('is-on');
    watch();
  }, { once: true });
  build.addEventListener('error', showFrame);
  build.addEventListener('ended', showText);
  var p = build.play();
  if (p && p.catch) p.catch(function (e) { if (e && e.name !== 'AbortError') showFrame(); });
  // Zurück im Tab: ein vom Browser angehaltener Film läuft weiter
  doc.addEventListener('visibilitychange', function () {
    if (!doc.hidden && state === 'build' && !fallback && build.paused && !build.ended) { var q = build.play(); if (q && q.catch) q.catch(function () {}); }
  });

  function watch() {
    // currentTime ist genauer als timeupdate (alle 250 ms)
    (function tick() {
      if (state !== 'build' || textShown) return;
      if (build.currentTime >= T_TEXT) { showText(); return; }
      requestAnimationFrame(tick);
    })();
  }

  /* ---------------- Texte ---------------- */
  function showText() {
    if (textShown || state === 'done') return;
    textShown = true;
    state = 'ready';
    text.appendChild(tpl.content.cloneNode(true));
    var enter = text.querySelector('[data-intro-enter]');
    enter.addEventListener('click', go);
    // Die Bewegungsschicht startet die neuen Elemente selbst (MutationObserver, motion.js). Kommt sie nicht (Skript fehlt, Fenster zu
    // niedrig für die Beobachtungsgrenze), zeigt dieser Failsafe die Texte nach 1,8 s trotzdem.
    later(function () {
      [].forEach.call(text.querySelectorAll('[data-split],[data-reveal]'), function (el) { el.classList.add('is-in', 'is-split'); });
    }, 1800);
  }

  /* ---------------- Klick: Zoom ---------------- */
  function go() {
    if (state !== 'ready') return;
    state = 'zoom';
    root.classList.add('is-leaving');
    if (fallback) { later(finish, 520); return; }

    zoom.addEventListener('ended', finish);
    zoom.addEventListener('error', finish);
    zoom.addEventListener('playing', function () {
      // Erstes Bild des Zoom-Films ≈ letztes Bild des Aufbaus: Überblenden fällt nicht auf. Erst zeigen, wenn es gemalt wird.
      var on = function () { zoom.classList.add('is-on'); build.pause(); };
      if (zoom.requestVideoFrameCallback) zoom.requestVideoFrameCallback(on); else on();
      tick();
    }, { once: true });
    // play() gleich im Klick: iOS lädt Filme erst auf Abruf, ein Warten auf canplay käme dort nie
    var q = zoom.play();
    if (q && q.catch) q.catch(function () { finish(); });
    later(function () { if (!zoom.classList.contains('is-on')) finish(); }, 2500); // Film läuft nach 2,5 s nicht: direkt überblenden
    later(finish, 7000); // Notausstieg: der Film ist 3 s lang
  }
  function tick() {
    if (state !== 'zoom') return;
    // Etwas vor dem letzten Bild überblenden: die letzten Bilder des Films sind das Bild der Startseite
    if (zoom.ended || (zoom.duration && zoom.currentTime >= zoom.duration - 0.12)) { finish(); return; }
    requestAnimationFrame(tick);
  }

  /* ---------------- Ende ---------------- */
  function finish(instant) {
    if (state === 'done') return;
    state = 'done';
    timers.forEach(clearTimeout);
    html.classList.remove('intro-on');
    inerted.forEach(function (el) { el.removeAttribute('inert'); });
    if (window.PS && PS.lenis && PS.lenis.start) PS.lenis.start();
    // Als gesehen merken (Speicher kann gesperrt sein: Safari privat, Cookies aus)
    try { sessionStorage.setItem('ps-intro', '1'); } catch (e) {}
    try { localStorage.setItem('ps-intro', String(Date.now())); } catch (e) {}
    var main = doc.getElementById('main');
    if (main && instant !== true) {
      main.setAttribute('tabindex', '-1');
      main.focus({ preventScroll: true });
      main.addEventListener('blur', function () { main.removeAttribute('tabindex'); }, { once: true });
    }
    // Ab jetzt laufen die Seitenanimationen (Hero-Überschrift …), weil intro-on weg ist; hero.js startet seinen Film
    doc.dispatchEvent(new Event('ps:introdone'));
    if (instant === true) { root.remove(); return; }
    root.classList.add('is-out');
    setTimeout(function () { root.remove(); }, 900);
  }

  /* ---------------- Überspringen ---------------- */
  skip.addEventListener('click', function () { finish(); });
  doc.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && state !== 'done') finish();
    // Enter betritt, auch ohne Fokus auf dem Button (der Fokus bleibt auf dem Überzug, damit kein Ring am noch einsteigenden Button hängt)
    else if (e.key === 'Enter' && state === 'ready' && !e.target.closest('button')) go();
  });
})();
