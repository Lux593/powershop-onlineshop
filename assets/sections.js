/* ==========================================================================
   Power Shop – Sections (global): Showroom und Quick-Add.
   Der Hero steht in hero.js (nur Startseite). Jedes Modul hängt sich über PS.on ein
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

  /* ---------------- Produktkarte: „+“ öffnet die Größenauswahl (Touch, schmale Fenster) ----------------
     Zustand = .is-quick-open + aria-expanded des „+“ (nur PS.quick setzt beides). Das CSS koppelt die Sichtbarkeit des
     Panels daran. Am Desktop (Hover, ab 1024 px) zeigt Hover oder Tastaturfokus es, dort gibt es kein „+“. */
  PS.quick = function (card, open) {
    var toggle = card.querySelector('[data-quick-toggle]');
    card.classList.toggle('is-quick-open', open);
    if (toggle) toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    return toggle;
  };
  document.addEventListener('click', function (e) {
    var toggle = e.target.closest('[data-quick-toggle]');
    var card = toggle && toggle.closest('.pcard');
    if (!card) return;
    var open = !card.classList.contains('is-quick-open');
    document.querySelectorAll('.pcard.is-quick-open').forEach(function (c) { PS.quick(c, false); });
    PS.quick(card, open);
  });
  document.addEventListener('keydown', function (e) {
    var card = e.key === 'Escape' && e.target.closest && e.target.closest('.pcard.is-quick-open');
    var toggle = card && PS.quick(card, false);
    if (toggle) toggle.focus();
  });
})();
