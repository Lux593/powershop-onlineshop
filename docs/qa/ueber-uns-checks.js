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
})();
