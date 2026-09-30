/* ==========================================================================
   Header: Megamenü (Maus, Tastatur, Touch)
   ========================================================================== */
(function () {
  var PS = window.PS;
  var lastPointer = 'mouse';
  document.addEventListener('pointerdown', function (e) { lastPointer = e.pointerType; }, true);

  PS.on('[data-header]', function (header) {
    var items = header.querySelectorAll('.mainnav__item[data-mega]');
    var timers = new WeakMap();

    function setOpen(li, open) {
      if (open) items.forEach(function (other) { if (other !== li) setOpen(other, false); });
      li.classList.toggle('is-open', open);
      li.querySelector('.mainnav__toggle').setAttribute('aria-expanded', open);
    }

    items.forEach(function (li) {
      li.addEventListener('mouseenter', function () {
        if (lastPointer !== 'mouse') return;
        clearTimeout(timers.get(li));
        timers.set(li, setTimeout(function () { setOpen(li, true); }, 90));
      });
      li.addEventListener('mouseleave', function () {
        if (lastPointer !== 'mouse') return;
        clearTimeout(timers.get(li));
        timers.set(li, setTimeout(function () { setOpen(li, false); }, 160));
      });
      li.querySelector('.mainnav__toggle').addEventListener('click', function () {
        setOpen(li, !li.classList.contains('is-open'));
      });
      // Touch: erster Tipp öffnet, zweiter navigiert
      li.querySelector('.mainnav__link').addEventListener('click', function (e) {
        if (lastPointer === 'touch' && !li.classList.contains('is-open')) { e.preventDefault(); setOpen(li, true); }
      });
      li.addEventListener('focusout', function (e) { if (!li.contains(e.relatedTarget)) setOpen(li, false); });
      li.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && li.classList.contains('is-open')) {
          setOpen(li, false);
          li.querySelector('.mainnav__toggle').focus();
        }
      });
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('.mainnav')) items.forEach(function (li) { setOpen(li, false); });
    });
  });
})();
