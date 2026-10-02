/* ==========================================================================
   Power Shop – Hero (nur Startseite): Modell-Tabs wechseln das Hintergrundbild.
   Aus sections.js verschoben (M1b), Code unverändert. Hängt sich über PS.on ein und
   funktioniert damit auch nach einem Section-Reload im Theme-Editor.
   ========================================================================== */
(function () {
  var PS = (window.PS = window.PS || {});

  /* ---------------- Hero: Modell-Tabs wechseln das Hintergrundbild ---------------- */
  PS.on('[data-hero]', function (hero) {
    var tabs = hero.querySelector('[data-hero-tabs]');
    var frames = Array.prototype.slice.call(hero.querySelectorAll('.hero__bg'));
    if (!tabs || frames.length < 2) return;

    tabs.addEventListener('ps:tab', function (e) {
      var index = parseInt(e.detail.dataset.index, 10) || 0;
      frames.forEach(function (img, k) {
        img.classList.toggle('is-active', k === index);
        if (k === index) img.loading = 'eager';
      });
    });

    // Restliche Bilder im Leerlauf vorladen, damit der Wechsel ohne Ruckeln läuft
    var idle = window.requestIdleCallback || function (fn) { setTimeout(fn, 280); };
    idle(function () {
      frames.forEach(function (img) { img.loading = 'eager'; });
    });
  });
})();
