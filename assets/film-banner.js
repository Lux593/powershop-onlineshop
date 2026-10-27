/* ==========================================================================
   Power Shop – Seitenkopf mit Filmfenster (.page-banner--film, Regeln in shop.css): Kategorieseiten Herren, Damen,
   Motorräder (sections/collection.liquid) und die Werkstatt (sections/build-book.liquid). Lädt nur mit einem solchen Kopf.
   Film: Start nach Load und Leerlauf, Pause-Knopf, Anhalten außerhalb des Bildes. Mobil rutscht das Fenster hinter den
   stehenden Text, ab 768 px gibt --film-depth dem Kopf Tiefe. Ohne Film (nur Standbild) läuft nur die Tiefe.
   ========================================================================== */
(function () {
  var PS = (window.PS = window.PS || {});

  /* ---------- Film: Start nach Load und Leerlauf, nie bei Datensparen oder reduzierter Bewegung ---------- */
  function initFilm(film, toggle) {
    var conn = navigator.connection;
    var userPaused = false;
    var started = false;
    var visible = false;

    // Schalter folgt den echten Ereignissen, nicht dem Klick
    function sync() {
      if (!toggle) return;
      toggle.dataset.state = film.paused ? 'paused' : 'playing';
      toggle.setAttribute('aria-label', film.paused ? 'Film abspielen' : 'Film pausieren');
    }
    function play() {
      var pending = film.play();
      if (pending && pending.catch) pending.catch(sync); // z. B. iOS-Stromsparmodus: Poster bleibt
    }
    ['play', 'pause', 'ended'].forEach(function (name) { film.addEventListener(name, sync); });
    // Film erst über dem Poster einblenden, wenn er wirklich läuft (vorher bliebe die Fläche beim Laden kurz leer)
    film.addEventListener('playing', function () { film.parentNode.classList.add('is-playing'); }, { once: true });
    if (toggle) {
      toggle.hidden = false;
      toggle.addEventListener('click', function () {
        userPaused = !film.paused;
        if (film.paused) play(); else film.pause();
      });
    }
    sync();

    // Tab im Hintergrund: anhalten, beim Zurückkehren nur fortsetzen, was dieses Modul angehalten hat (nicht, was von Hand pausiert wurde).
    // Wie im Hero; steht vor der Bewegungsprüfung, denn auch ein von Hand gestarteter Film soll im Hintergrund nicht weiterlaufen.
    var hiddenPaused = false;
    var ac = new AbortController();
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        if (!film.paused) { hiddenPaused = true; film.pause(); }
      } else if (hiddenPaused) {
        hiddenPaused = false;
        if (film.paused && !userPaused && (!io || visible)) play();
      }
    }, { signal: ac.signal });
    // Section-Reload im Theme-Editor: der Film wird ersetzt, der Listener geht mit
    document.addEventListener('shopify:section:unload', function (e) { if (e.target.contains(film)) ac.abort(); }, { signal: ac.signal });

    var io = null;
    // PS.filmsWanted statt PS.motion.enabled: Der Film läuft auch nach dem Failsafe (Skripte zu spät), dann eben später
    if (!PS.filmsWanted() || (conn && conn.saveData) || !('IntersectionObserver' in window)) return;

    // Außerhalb des Bildes anhalten, danach nur fortsetzen, wenn nicht von Hand angehalten. Mehrere Stufen: Hält der Browser
    // den Film von sich aus an (iOS beim Scrollen), läuft er bei der nächsten Stufe weiter, nicht erst nach ganz raus und rein.
    io = new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible && started && !userPaused && film.paused) play();
      else if (!visible && !film.paused) film.pause();
    }, { threshold: [0.2, 0.5, 1] });
    io.observe(film);
    // Zurück-Taste: Die Seite kommt aus dem Zurück-Speicher (bfcache). Hielt der Browser den Film schon vor visibilitychange an,
    // greift hiddenPaused nicht; dann hier fortsetzen.
    window.addEventListener('pageshow', function (e) {
      if (e.persisted && io && started && visible && !userPaused && film.paused) play();
    }, { signal: ac.signal });
    var idle = window.requestIdleCallback ? function (fn) { window.requestIdleCallback(fn, { timeout: 2000 }); } : function (fn) { setTimeout(fn, 300); };
    function go() { idle(function () { started = true; if (visible && !userPaused) play(); }); }
    if (document.readyState === 'complete') go(); else window.addEventListener('load', go, { once: true });
    // Bewegung zur Laufzeit abgeschaltet: anhalten
    PS.motion.track(film, function () { io.disconnect(); io = null; started = false; film.pause(); });
  }

  /* ---------- Film mobil: Pause-Knopf ausblenden, sobald der Film hinter den Text rutscht (Ablauf per sticky in shop.css) ----------
     Nur ein Schalter (.is-behind), das Ausblenden selbst ist eine CSS-Überblendung. Nicht, solange der Knopf den Fokus hat. */
  function initBehind(text, frame, toggle) {
    if (!PS.motion.enabled || !text || !toggle) return;
    var mq = window.matchMedia('(max-width: 767px)');
    var queued = false;
    function update() {
      queued = false;
      var behind = mq.matches && toggle !== document.activeElement && frame.getBoundingClientRect().top < text.getBoundingClientRect().bottom;
      toggle.classList.toggle('is-behind', behind);
    }
    function queue() { if (!queued) { queued = true; requestAnimationFrame(update); } }
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    update();
    // Bewegung zur Laufzeit abgeschaltet oder Section entfernt: Listener weg, Knopf wieder sichtbar
    PS.motion.track(frame, function () {
      window.removeEventListener('scroll', queue);
      window.removeEventListener('resize', queue);
      toggle.classList.remove('is-behind');
    });
  }

  /* ---------- Ab 768 px: Tiefe beim Scrollen (Regeln in shop.css) ----------
     Setzt nur --film-depth am Banner: 0 oben, 1 wenn um die Bannerhöhe gescrollt. Darunter läuft der mobile Ablauf. */
  function initDepth(banner) {
    if (!PS.motion.enabled || !banner) return;
    var mq = window.matchMedia('(min-width: 768px)');
    var height = 1;
    var queued = false;
    function update() {
      queued = false;
      if (!mq.matches) { banner.style.removeProperty('--film-depth'); return; }
      banner.style.setProperty('--film-depth', Math.round(Math.min(1, Math.max(0, window.scrollY / height)) * 1000) / 1000);
    }
    function queue() { if (!queued) { queued = true; requestAnimationFrame(update); } }
    function measure() { height = banner.offsetHeight || 1; queue(); }
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', measure);
    measure();
    // Bewegung zur Laufzeit abgeschaltet oder Section entfernt: Listener weg, Banner wieder ruhig
    PS.motion.track(banner, function () {
      window.removeEventListener('scroll', queue);
      window.removeEventListener('resize', measure);
      banner.style.removeProperty('--film-depth');
    });
  }

  // Das Skript-Tag steht in der Section und läuft deshalb vor theme.js (beide defer). PS.on gibt es erst danach:
  // spätestens bei DOMContentLoaded sind alle defer-Skripte gelaufen (wie in build-book.js).
  function start() {
    if (!PS.on) return;
    PS.on('.page-banner--film', function (banner) {
      var film = banner.querySelector('[data-film]');
      if (film) {
        var toggle = banner.querySelector('[data-film-toggle]');
        initFilm(film, toggle);
        initBehind(banner.querySelector('.page-banner__text'), film.parentNode, toggle);
      }
      initDepth(banner);
    });
  }
  if (PS.on) start();
  else document.addEventListener('DOMContentLoaded', start, { once: true });
})();
