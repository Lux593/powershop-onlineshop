/* ==========================================================================
   Header: Megamenü (Maus, Tastatur, Touch), Überlagerung über dem Hero, Ausblenden beim Scrollen.
   Alle Listener außerhalb des Headers hängen an einem AbortController: ein Section-Reload im Theme-Editor
   (PS.on startet für den neuen Header erneut) räumt die alten ab.
   ========================================================================== */
(function () {
  var PS = window.PS;
  var html = document.documentElement;
  var lastPointer = 'mouse';
  var ctrl;
  document.addEventListener('pointerdown', function (e) { lastPointer = e.pointerType; }, true);

  PS.on('[data-header]', function (header) {
    if (ctrl) ctrl.abort();
    ctrl = new AbortController();
    var sig = { signal: ctrl.signal };
    var items = header.querySelectorAll('.mainnav__item[data-mega]');
    var timers = new WeakMap();

    /* ---------------- Megamenü ---------------- */
    function setOpen(li, open) {
      if (open) items.forEach(function (other) { if (other !== li) setOpen(other, false); });
      li.classList.toggle('is-open', open);
      li.querySelector('.mainnav__toggle').setAttribute('aria-expanded', open);
      update();
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
    }, sig);

    /* ---------------- Überlagerung (Startseite) und Ausblenden beim Scrollen ----------------
       is-over: oben transparent mit Verlauf (nur Startseite mit Hero), nach 40 px solid schwarz plus Blur.
       is-away: Header weggeschoben, ab 400 px Tiefe beim Runterscrollen. --header-shown (1/0) steuert die Sticky-Offsets
       (--header-offset in tokens.css). Nie bei offenem Menü oder Dialog, nie bei Fokus im Header (WCAG 2.4.11), und
       nicht während ein Tab-Sprung oder ein Anker scrollt: sonst verdeckt der einfahrende Header das Ziel.
       Ausblenden ist Bewegung: nur unter html.has-motion, sonst bleibt der Header stehen. */
    var wrap = header.closest('.site-header-wrap') || header;
    var over = document.body.hasAttribute('data-header-overlay') && !!document.querySelector('[data-hero]');
    var shown = true, lastY = window.scrollY, quiet = 0, queued = false;

    function show(on) {
      if (on === shown) return;
      shown = on;
      wrap.classList.toggle('is-away', !on);
      html.style.setProperty('--header-shown', on ? 1 : 0);
    }
    function update() {
      queued = false;
      var y = window.scrollY, d = y - lastY;
      var menu = !!header.querySelector('.mainnav__item.is-open');
      header.classList.toggle('is-over', over && y < 40 && !menu);
      if (!html.classList.contains('has-motion') || y < 400 || menu || document.body.classList.contains('is-locked') ||
          header.contains(document.activeElement)) {
        lastY = y;
        show(true);
      } else if (Date.now() < quiet) {
        lastY = y;
      } else if (Math.abs(d) > 4) {
        lastY = y;
        show(d < 0);
      }
    }
    function queue() { if (!queued) { queued = true; requestAnimationFrame(update); } }

    window.addEventListener('scroll', queue, { passive: true, signal: ctrl.signal });
    header.addEventListener('focusin', function () { show(true); });
    header.addEventListener('focusout', queue);
    document.addEventListener('keydown', function (e) { if (e.key === 'Tab') quiet = Date.now() + 700; }, sig);
    // Anker: der Header bleibt, wie er ist (scroll-padding-top passt dazu), bis das Scrollen vorbei ist
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href*="#"]');
      if (a && a.hash.length > 1) quiet = Date.now() + 1600;
    }, sig);
    window.addEventListener('pageshow', queue, sig);
    // Header-Section entfernt (Theme-Editor): Listener abbauen
    document.addEventListener('shopify:section:unload', function (e) { if (e.target.contains(header)) ctrl.abort(); }, sig);
    update();
  });
})();
