/* ==========================================================================
   Power Shop – Startseite (nur index): Statement-Scrub, Tab-Indikator, Schienen-Fortschritt.
   Reveals, Parallax und Count-up liefert assets/motion.js über data-Attribute (docs/motion-api.md),
   Aufräumen übernimmt PS.motion.track/add. Jedes Modul hängt sich über PS.on ein (auch nach Section-Reload).
   ========================================================================== */
(function () {
  var PS = (window.PS = window.PS || {});
  var M = PS.motion;

  /* ---------------- Kachel-Filme (Herren, Damen) ----------------
     Wie der Kategorie-Film (collection.js): kein autoplay im Markup, Start nach Load im Leerlauf und nur im Bild, nicht bei
     Datensparen oder reduzierter Bewegung (dann bleibt das Standbild, der Knopf startet den Film von Hand). Außerhalb des Bildes
     und im Hintergrund-Tab angehalten; fortgesetzt wird nur, was nicht von Hand angehalten wurde. Der Knopf erfüllt WCAG 2.2.2. */
  PS.on('[data-bento-film]', function (wrap) {
    var film = wrap.querySelector('video'), toggle = wrap.querySelector('[data-film-toggle]');
    if (!film || !toggle) return;
    var name = toggle.dataset.name || '';
    var conn = navigator.connection;
    var userPaused = false, started = false, visible = false, hiddenPaused = false, io = null;

    function sync() {
      toggle.dataset.state = film.paused ? 'paused' : 'playing';
      toggle.setAttribute('aria-label', (film.paused ? 'Film abspielen: ' : 'Film pausieren: ') + name);
    }
    function play() {
      var pending = film.play();
      if (pending && pending.catch) pending.catch(sync); // z. B. iOS-Stromsparmodus: Standbild bleibt
    }
    ['play', 'pause', 'ended'].forEach(function (n) { film.addEventListener(n, sync); });
    film.addEventListener('playing', function () { film.parentNode.classList.add('is-playing'); }, { once: true });
    toggle.hidden = false;
    toggle.addEventListener('click', function () {
      userPaused = !film.paused;
      if (film.paused) play(); else film.pause();
    });
    sync();

    // Hintergrund-Tab: steht vor der Bewegungsprüfung, auch ein von Hand gestarteter Film soll dort nicht weiterlaufen
    var ac = new AbortController();
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        if (!film.paused) { hiddenPaused = true; film.pause(); }
      } else if (hiddenPaused) {
        hiddenPaused = false;
        if (film.paused && !userPaused && (!io || visible)) play();
      }
    }, { signal: ac.signal });
    // Section-Reload im Theme-Editor: die Kachel wird ersetzt, der Listener geht mit
    document.addEventListener('shopify:section:unload', function (e) { if (e.target.contains(wrap)) ac.abort(); }, { signal: ac.signal });

    if (!M.enabled || (conn && conn.saveData) || !('IntersectionObserver' in window)) return;
    io = new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible && started && !userPaused && film.paused) play();
      else if (!visible && !film.paused) film.pause();
    }, { threshold: 0.2 });
    io.observe(film);
    var idle = window.requestIdleCallback ? function (fn) { window.requestIdleCallback(fn, { timeout: 2000 }); } : function (fn) { setTimeout(fn, 300); };
    function go() { idle(function () { started = true; if (visible && !userPaused) play(); }); }
    if (document.readyState === 'complete') go(); else window.addEventListener('load', go, { once: true });
    // Bewegung zur Laufzeit abgeschaltet: anhalten (das Standbild darunter bleibt)
    M.track(film, function () { io.disconnect(); io = null; started = false; film.pause(); });
  });

  /* ---------------- Statement: Wörter leuchten beim Scrollen nacheinander auf ---------------- */
  // Der Splitter (data-split) arbeitet nach document.fonts.ready: erst dann gibt es Wörter. Läuft ScrollTrigger nicht,
  // bleibt es beim Hochgleiten der Wörter aus motion.css, kein Wort bleibt gedimmt.
  PS.on('[data-statement]', function (sec) {
    var text = sec.querySelector('[data-split]');
    if (!text || !M.scroll) return;
    function go() {
      var words = text.querySelectorAll('.ps-wi'), lit = -1;
      if (!words.length) return;
      M.add(text, function (gsap, ST) {
        function paint(self) {
          var n = Math.round(self.progress * words.length);
          if (n === lit) return;
          lit = n;
          for (var i = 0; i < words.length; i++) words[i].classList.toggle('is-lit', i < n);
        }
        // Dimmen erst nach gelungenem create (sonst bliebe der Text bei einem Fehler grau)
        var st = ST.create({ trigger: text, start: 'top 85%', end: 'bottom 45%', onUpdate: paint, onRefresh: paint });
        sec.classList.add('is-scrub');
        return [st, function () { sec.classList.remove('is-scrub'); }];
      });
    }
    if (text.classList.contains('is-split')) return go();
    var mo = new MutationObserver(function () {
      if (!text.classList.contains('is-split')) return;
      mo.disconnect();
      go();
    });
    mo.observe(text, { attributes: true, attributeFilter: ['class'] });
    M.track(text, mo);
  });

  /* ---------------- Produkt-Tabs: gleitender Indikator, Richtung des Panel-Wechsels ---------------- */
  // Nur mit Bewegung. Ohne sie (oder bis hierher) bleibt der Unterstrich am aktiven Tab (components.css).
  PS.on('.tabs--slide', function (list) {
    if (!M.enabled) return;
    var tabs = [].slice.call(list.querySelectorAll('[role="tab"]')), prev = 0;
    function place() {
      var t = list.querySelector('[aria-selected="true"]');
      if (!t || !t.offsetWidth) return;
      list.style.setProperty('--ind-x', t.offsetLeft);
      list.style.setProperty('--ind-w', t.offsetWidth);
      list.classList.add('has-ind');
      // Erst nach dem ersten Platzieren gleiten, sonst fährt der Strich beim Laden von links ein
      requestAnimationFrame(function () { list.classList.add('is-ready'); });
    }
    tabs.forEach(function (t, i) { if (t.getAttribute('aria-selected') === 'true') prev = i; });
    list.addEventListener('ps:tab', function (e) {
      var i = tabs.indexOf(e.detail);
      if (i < 0) return;
      if (i !== prev) {
        list.classList.toggle('is-fwd', i > prev);
        list.classList.toggle('is-back', i < prev);
      }
      prev = i;
      place();
      M.refresh(); // Panelhöhe geändert
    });
    var ro = window.ResizeObserver && new ResizeObserver(place); // Größe der Leiste und Schriftwechsel
    if (ro) { ro.observe(list); tabs.forEach(function (t) { ro.observe(t); }); }
    else place();
    M.track(list, [ro, function () { list.classList.remove('has-ind', 'is-ready', 'is-fwd', 'is-back'); }]);
  });

  /* ---------------- Showroom-Schiene: Fortschritt und Kantenmaske ---------------- */
  // Kein Bewegungszustand, sondern Orientierung: gilt auch ohne has-motion. sections.js stößt nach dem Umschalten
  // Neu/Gebraucht ein scroll-Ereignis an, daher reicht dieser Listener.
  PS.on('.showroom .rail', function (rail) {
    var bar = rail.parentElement.querySelector('.rail-progress');
    function update() {
      var w = rail.clientWidth, all = rail.scrollWidth, x = rail.scrollLeft, fit = all - w <= 2;
      rail.classList.toggle('has-edge', !fit);
      rail.classList.toggle('is-start', x <= 2);
      rail.classList.toggle('is-end', x >= all - w - 2);
      if (!bar) return;
      if (bar.hidden !== fit) { bar.hidden = fit; M.refresh(); }
      bar.style.setProperty('--rail-progress', fit ? 1 : (x + w) / all);
    }
    rail.addEventListener('scroll', update, { passive: true });
    var ro = window.ResizeObserver && new ResizeObserver(function () { update(); M.refresh(); });
    if (ro) ro.observe(rail); else window.addEventListener('resize', update);
    update();
    M.track(rail, ro);
  });
})();
