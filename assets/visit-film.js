/* ==========================================================================
   Power Shop – Karte als Film in „Komm vorbei“ (snippets/visit-map.liquid mit film, sections/visit.liquid). Seit dem 2.11.
   Lädt nur mit der Section und eingeschaltetem Film. Styles in assets/pages.css (.visit__film …).
   Ablauf: Karte → Klick auf Bar & Shield oder „Power Shop“ → Film vorwärts bis zum Laden, das letzte Bild bleibt stehen →
   „Zurück zur Karte“ → umgedrehter Film (eigene Datei, rückwärts abspielen kann Chrome nicht) → Karte.
   - Unten liegt immer ein Standbild (.visit__still: Anfang oder Ende des Films), darüber die beiden Filme. Sichtbar ist nur der, der
     gerade läuft oder am Ende steht (is-shown). So gibt es beim Umschalten keinen Sprung: Bild 0 des einen Films ist das letzte des
     anderen bzw. das Standbild.
   - Laden: beide Filme, sobald die Karte in die Nähe des Bildschirms kommt (halbe Bildschirmhöhe vorher), am Handy (bis 767 px) die
     720er. Bei Datensparen oder 2G erst beim Klick, wie die Filme im Hero (assets/hero.js). Kein Ton (die Dateien haben keine Tonspur).
   - Ohne Bewegung (html.has-motion fehlt, reduzierte Bewegung, Theme-Editor) und wenn play() abgelehnt wird (iPhone im Stromsparmodus)
     oder die Filme nicht laden: harter Wechsel zwischen den Standbildern, mit denselben Knöpfen.
   - Fokus: Nach dem Hinflug steht er auf „Zurück zur Karte“, nach dem Rückflug wieder auf der Klickfläche. Das Standbild trägt jeweils
     den passenden Alternativtext (Karte bzw. Laden).
   Am Laden trägt die Karte is-there (Ausschnitt rückt nach oben, Quellenangabe blendet aus), während eines Flugs is-busy.
   ========================================================================== */
(function () {
  // Das Skript-Tag steht in der Section und läuft deshalb vor theme.js (beide defer): PS.on gibt es erst danach
  if (window.PS && window.PS.on) start();
  else document.addEventListener('DOMContentLoaded', start, { once: true });

  function start() {
    var PS = window.PS;
    if (!PS || !PS.on) return;
    PS.on('[data-visit-film]', function (map) { setup(PS, map); });
  }

  function setup(PS, map) {
    if (map.__film) return;
    var hin = map.querySelector('[data-film="hin"]');
    var back = map.querySelector('[data-film="zurueck"]');
    var still = map.querySelector('.visit__still');
    var fly = map.querySelector('.visit__fly');
    var ret = map.querySelector('.visit__back');
    if (!hin || !back || !still || !fly || !ret) return;

    var con = navigator.connection || {};
    var slow = con.saveData || /(^|-)2g$/.test(con.effectiveType || '');
    var mobile = window.matchMedia('(max-width: 767px)').matches;
    var startSrcset = still.getAttribute('srcset'), startAlt = still.getAttribute('alt');
    var state = 'map'; // map | hin | shop | zurueck
    var loaded = false, io = null;
    map.__film = true;

    function calm() {
      var reduce = PS.prefersReducedMotion ? PS.prefersReducedMotion() : window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      return !document.documentElement.classList.contains('has-motion') || reduce || !!(window.Shopify && window.Shopify.designMode);
    }

    function load() {
      if (loaded) return;
      loaded = true;
      if (io) { io.disconnect(); io = null; }
      [hin, back].forEach(function (v) {
        v.muted = true;
        v.src = mobile ? v.getAttribute('data-src-m') || v.getAttribute('data-src') : v.getAttribute('data-src');
        v.preload = 'auto';
        v.load();
      });
    }

    // Wartet, bis der Film abspielbereit ist, höchstens 5 s. false heißt: nicht geladen, harter Wechsel.
    function ready(v) {
      return new Promise(function (resolve) {
        if (v.readyState >= 3) { resolve(true); return; }
        var t = setTimeout(function () { done(false); }, 5000);
        function ok() { done(true); }
        function bad() { done(false); }
        function done(r) {
          clearTimeout(t);
          v.removeEventListener('canplay', ok);
          v.removeEventListener('error', bad);
          resolve(r);
        }
        v.addEventListener('canplay', ok);
        v.addEventListener('error', bad);
      });
    }

    function show(v) {
      hin.classList.toggle('is-shown', v === hin);
      back.classList.toggle('is-shown', v === back);
    }
    function setStill(end) {
      if (end) still.setAttribute('srcset', still.getAttribute('data-end-srcset'));
      else still.setAttribute('srcset', startSrcset);
      still.setAttribute('alt', end ? still.getAttribute('data-alt-end') : startAlt);
    }
    function rewind() {
      try { hin.pause(); back.pause(); hin.currentTime = 0; back.currentTime = 0; } catch (e) { /* noch ohne Quelle */ }
    }

    // Am Laden angekommen (oder per hartem Wechsel dorthin)
    function atShop() {
      state = 'shop';
      map.classList.remove('is-busy');
      map.classList.add('is-there');
      setStill(true); // hinter dem stehenden Film liegt jetzt das Endbild
      fly.hidden = true;
      ret.hidden = false;
      ret.focus({ preventScroll: true });
    }
    // Zurück auf der Karte
    function atMap() {
      state = 'map';
      setStill(false);
      show(null);
      rewind();
      map.classList.remove('is-busy', 'is-there');
      ret.hidden = true;
      fly.hidden = false;
      fly.focus({ preventScroll: true });
    }
    function jump(toShop) {
      map.classList.add('is-calm');
      show(null);
      rewind();
      if (toShop) atShop(); else atMap();
    }

    function toShop() {
      if (state !== 'map') return;
      if (calm()) { jump(true); return; }
      map.classList.remove('is-calm');
      state = 'hin';
      map.classList.add('is-busy');
      load();
      ready(hin).then(function (ok) {
        if (state !== 'hin') return;
        if (!ok) { jump(true); return; }
        show(hin); // Bild 0 = Standbild, kein Sprung
        map.classList.add('is-there'); // Schwenk des Ausschnitts, beginnt mit Verzögerung (pages.css)
        fly.hidden = true;
        var p = hin.play();
        if (p && p.catch) p.catch(function () { if (state === 'hin') jump(true); });
      });
    }
    hin.addEventListener('ended', function () { if (state === 'hin') atShop(); });

    function toMap() {
      if (state !== 'shop') return;
      if (calm() || !loaded || map.classList.contains('is-calm')) { jump(false); return; }
      state = 'zurueck';
      ret.hidden = true;
      map.classList.add('is-busy');
      ready(back).then(function (ok) {
        if (state !== 'zurueck') return;
        if (!ok) { jump(false); return; }
        try { back.currentTime = 0; } catch (e) { /* ignorieren */ }
        show(back); // Bild 0 des Rückwärtsfilms = letztes Bild des Hinflugs
        map.classList.remove('is-there');
        var p = back.play();
        if (p && p.catch) p.catch(function () { if (state === 'zurueck') jump(false); });
      });
    }
    back.addEventListener('ended', function () { if (state === 'zurueck') atMap(); });

    fly.addEventListener('click', toShop);
    ret.addEventListener('click', toMap);
    // Zeiger oder Fokus auf dem Logo: Filme sofort holen, dann startet der Flug ohne Wartezeit
    fly.addEventListener('pointerenter', function () { if (!calm()) load(); });
    fly.addEventListener('focus', function () { if (!calm()) load(); });

    if (!slow && !calm() && 'IntersectionObserver' in window) {
      io = new IntersectionObserver(function (entries) {
        if (entries.some(function (e) { return e.isIntersecting; })) load();
      }, { rootMargin: '50% 0px' });
      io.observe(map);
    }

    fly.hidden = false; // ohne Skript bleibt die Klickfläche verborgen, sie täte nichts
  }
})();
