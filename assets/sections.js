/* ==========================================================================
   Power Shop – Sections (global): Showroom und Quick-Add.
   Der Hero steht seit M1b in hero.js (nur Startseite). Jedes Modul hängt sich über PS.on ein
   und funktioniert damit auch nach einem Section-Reload im Theme-Editor.
   ========================================================================== */
(function () {
  var PS = (window.PS = window.PS || {});

  /* ---------------- Showroom: Neu / Gebraucht ---------------- */
  PS.on('[data-showroom]', function (section) {
    var buttons = Array.prototype.slice.call(section.querySelectorAll('[data-showroom-mode]'));
    var rail = section.querySelector('.rail');
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        buttons.forEach(function (b) { b.setAttribute('aria-pressed', b === button ? 'true' : 'false'); });
        section.dataset.showroomState = button.dataset.showroomMode;
        if (rail) {
          rail.scrollLeft = 0;
          rail.dispatchEvent(new Event('scroll'));
        }
      });
    });
  });

  /* ---------------- Produktkarte: „+“ öffnet die Größenauswahl (Touch) ---------------- */
  document.addEventListener('click', function (e) {
    var toggle = e.target.closest('[data-quick-toggle]');
    if (!toggle) return;
    var card = toggle.closest('.pcard');
    if (!card) return;
    var open = !card.classList.contains('is-quick-open');
    document.querySelectorAll('.pcard.is-quick-open').forEach(function (c) { c.classList.remove('is-quick-open'); });
    card.classList.toggle('is-quick-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
})();
