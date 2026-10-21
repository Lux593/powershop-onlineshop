/* ==========================================================================
   Power Shop – Startseite (nur index): Statement-Scrub, Tab-Indikator, Schienen-Fortschritt.
   Reveals, Parallax und Count-up liefert assets/motion.js über data-Attribute (docs/motion-api.md),
   Aufräumen übernimmt PS.motion.track/add. Jedes Modul hängt sich über PS.on ein (auch nach Section-Reload).
   ========================================================================== */
(function () {
  var PS = (window.PS = window.PS || {});
  var M = PS.motion;

  /* ---------------- Statement: Wörter leuchten beim Scrollen nacheinander auf ---------------- */
  // Der Splitter (data-split) arbeitet nach document.fonts.ready: erst dann gibt es Wörter. Läuft ScrollTrigger nicht,
  // bleibt es beim Hochgleiten der Wörter aus motion.css, kein Wort bleibt gedimmt.
  // Die Gebäudezeichnung dahinter zeichnet sich über denselben Fortschritt ein (--draw, Maske in home.css).
  // Überschrift und Aussage (beide data-split) leuchten als eine Folge auf: erst die Überschrift, dann die Aussage.
  PS.on('[data-statement]', function (sec) {
    var parts = [].slice.call(sec.querySelectorAll('[data-split]')), drawing = sec.querySelector('.statement__drawing');
    var first = parts[0], text = parts[parts.length - 1];
    if (!text || !M.scroll) return;
    function ready() { return parts.every(function (p) { return p.classList.contains('is-split'); }); }
    function go() {
      var words = sec.querySelectorAll('[data-split] .ps-wi'), lit = -1;
      if (!words.length) return;
      M.add(text, function (gsap, ST) {
        function paint(self) {
          if (drawing) drawing.style.setProperty('--draw', self.progress.toFixed(3));
          var n = Math.round(self.progress * words.length);
          if (n === lit) return;
          lit = n;
          for (var i = 0; i < words.length; i++) words[i].classList.toggle('is-lit', i < n);
        }
        // Dimmen erst nach gelungenem create (sonst bliebe der Text bei einem Fehler grau)
        var st = ST.create({ trigger: first, endTrigger: text, start: 'top 85%', end: 'bottom 45%', onUpdate: paint, onRefresh: paint });
        sec.classList.add('is-scrub');
        return [st, function () {
          sec.classList.remove('is-scrub');
          if (drawing) drawing.style.removeProperty('--draw');
        }];
      });
    }
    if (ready()) return go();
    var mo = new MutationObserver(function () {
      if (!ready()) return;
      mo.disconnect();
      go();
    });
    parts.forEach(function (p) { mo.observe(p, { attributes: true, attributeFilter: ['class'] }); });
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
