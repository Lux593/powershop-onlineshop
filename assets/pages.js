/* ==========================================================================
   Power Shop – Inhaltsseiten (nur Vorlagen page.*): Tiefe im Seitenkopf, Scrub der Aussagen.
   Auf Seiten laden weder GSAP noch ScrollTrigger: Beides läuft hier mit einem gedrosselten Scroll-Listener (rAF) und setzt
   nur CSS-Variablen und Klassen (Regeln in shop.css und pages.css). Nur mit Bewegung (PS.motion.enabled); Aufräumen über
   PS.motion.track, wenn die Bewegung zur Laufzeit abgeschaltet oder die Section im Editor ersetzt wird.
   ========================================================================== */
(function () {
  var PS = (window.PS = window.PS || {});
  var M = PS.motion;

  // Ein Scroll- und Resize-Listener pro Modul, je Frame höchstens ein Update
  function onScroll(update, measure) {
    var queued = false;
    function frame() { queued = false; update(); }
    function queue() { if (!queued) { queued = true; requestAnimationFrame(frame); } }
    function resize() { if (measure) measure(); queue(); }
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', resize);
    resize();
    return function () {
      window.removeEventListener('scroll', queue);
      window.removeEventListener('resize', resize);
    };
  }

  /* ---------------- Seitenkopf ab 768 px: Tiefe beim Scrollen ----------------
     Wie der Kategorie-Kopf (initDepth in collection.js, das auf Seiten nicht lädt): --film-depth am Banner, 0 oben bis 1,
     wenn um die Bannerhöhe gescrollt ist. Darunter läuft der mobile Ablauf (Text bleibt kleben, nur CSS). */
  PS.on('[data-depth]', function (banner) {
    if (!M.enabled) return;
    var mq = window.matchMedia('(min-width: 768px)');
    var height = 1;
    var stop = onScroll(function () {
      if (!mq.matches) { banner.style.removeProperty('--film-depth'); return; }
      banner.style.setProperty('--film-depth', Math.round(Math.min(1, Math.max(0, window.scrollY / height)) * 1000) / 1000);
    }, function () { height = banner.offsetHeight || 1; });
    M.track(banner, function () { stop(); banner.style.removeProperty('--film-depth'); });
  });

  /* ---------------- Aussagen: Wörter leuchten beim Scrollen nacheinander auf ----------------
     Wie der Willkommensblock der Startseite (home.js): Start, wenn die Oberkante 85 % der Fensterhöhe erreicht, fertig, wenn
     die Unterkante bei 45 % steht. Der Splitter (data-split) arbeitet erst nach document.fonts.ready; bis dahin und ohne
     Bewegung bleibt es beim Hochgleiten der Wörter aus motion.css, kein Wort bleibt gedimmt. */
  PS.on('[data-scrub]', function (el) {
    if (!M.enabled || !el.hasAttribute('data-split')) return;
    function go() {
      var words = el.querySelectorAll('.ps-wi'), lit = -1;
      if (!words.length) return;
      var stop = onScroll(function () {
        var r = el.getBoundingClientRect(), vh = window.innerHeight;
        var p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (vh * 0.4 + r.height)));
        var n = Math.round(p * words.length);
        if (n === lit) return;
        lit = n;
        for (var i = 0; i < words.length; i++) words[i].classList.toggle('is-lit', i < n);
      });
      el.classList.add('is-scrub');
      M.track(el, function () {
        stop();
        el.classList.remove('is-scrub');
        [].forEach.call(words, function (w) { w.classList.remove('is-lit'); });
      });
    }
    if (el.classList.contains('is-split')) return go();
    var mo = new MutationObserver(function () {
      if (!el.classList.contains('is-split')) return;
      mo.disconnect();
      go();
    });
    mo.observe(el, { attributes: true, attributeFilter: ['class'] });
    M.track(el, mo);
  });
})();
