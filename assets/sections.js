/* ==========================================================================
   Power Shop – Sections (global): Showroom und Quick-Add.
   Der Hero steht in hero.js (nur Startseite). Jedes Modul hängt sich über PS.on ein
   und funktioniert damit auch nach einem Section-Reload im Theme-Editor.
   ========================================================================== */
(function () {
  var PS = (window.PS = window.PS || {});

  /* ---------------- Showroom: Neu / Gebraucht und Kategorie ----------------
     Der Zustand läuft über data-showroom-state und CSS (theme.css), die Kategorie über hidden an den Karten
     (data-categories, sections/showroom.liquid). Chips ohne Fahrzeug im gewählten Zustand verschwinden; war einer davon
     gewählt, gilt wieder „Alle“. So zeigt die Schiene nie eine leere Auswahl. */
  PS.on('[data-showroom]', function (section) {
    var buttons = Array.prototype.slice.call(section.querySelectorAll('[data-showroom-mode]'));
    var chips = Array.prototype.slice.call(section.querySelectorAll('[data-showroom-cat]'));
    var group = section.querySelector('[data-showroom-cats]');
    var rail = section.querySelector('.rail');
    var cards = rail ? Array.prototype.slice.call(rail.querySelectorAll('.bcard')) : [];
    var category = '';
    function inState(card) {
      return (card.dataset.zustand === 'neu') === (section.dataset.showroomState === 'neu');
    }
    function inCategory(card, id) {
      return !id || (' ' + (card.dataset.categories || '') + ' ').indexOf(' ' + id + ' ') > -1;
    }
    function update() {
      var shown = 0;
      chips.forEach(function (chip) {
        var id = chip.dataset.showroomCat;
        if (!id) return;
        chip.hidden = !cards.some(function (card) { return inState(card) && inCategory(card, id); });
        if (chip.hidden && id === category) category = '';
        if (!chip.hidden) shown++;
      });
      if (group) group.hidden = shown === 0;
      chips.forEach(function (chip) { chip.setAttribute('aria-pressed', chip.dataset.showroomCat === category ? 'true' : 'false'); });
      cards.forEach(function (card) { card.hidden = !inCategory(card, category); });
      if (rail) {
        rail.scrollLeft = 0;
        rail.dispatchEvent(new Event('scroll'));
      }
    }
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        buttons.forEach(function (b) { b.setAttribute('aria-pressed', b === button ? 'true' : 'false'); });
        section.dataset.showroomState = button.dataset.showroomMode;
        update();
      });
    });
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        category = chip.dataset.showroomCat;
        update();
      });
    });
    if (chips.length) update();
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

  /* ---------------- Motorrad-Karte: Farben ----------------
     Die Farbfelder (snippets/bike-card.liquid) zeigen das Bild ihrer Farbe in der Karte: mit der Maus als Vorschau, per Klick
     oder Tippen fest. Die Wahl führt Bild, Titel, Details und Anfrage zur Variante dieser Farbe. Das Bild wechselt erst, wenn
     es geladen ist (wie die Galerie der Motorrad-Seite), damit die Karte nie leer aufblitzt; ein späterer Wechsel gewinnt. */
  function bikeColor(card, swatch) {
    var img = card.querySelector('.bcard__media img');
    var name = card.querySelector('[data-bcard-color]');
    if (img && !card._bcardOrig) card._bcardOrig = { src: img.getAttribute('src'), srcset: img.getAttribute('srcset') };
    if (name) name.textContent = swatch ? swatch.getAttribute('aria-label') : name.dataset.default;
    var target = swatch && swatch.dataset.src ? { src: swatch.dataset.src, srcset: swatch.dataset.srcset } : card._bcardOrig;
    if (!img || !target || img.getAttribute('src') === target.src) return;
    var token = (card._bcardToken = (card._bcardToken || 0) + 1);
    var next = new Image();
    next.sizes = img.sizes;
    next.srcset = target.srcset || '';
    next.src = target.src;
    (next.decode ? next.decode() : Promise.resolve()).then(function () {
      if (card._bcardToken !== token) return;
      img.srcset = target.srcset || '';
      img.src = target.src;
    }, function () {});
  }
  document.addEventListener('click', function (e) {
    var swatch = e.target.closest && e.target.closest('[data-bcard-swatch]');
    var card = swatch && swatch.closest('.bcard');
    if (!card) return;
    card.querySelectorAll('[data-bcard-swatch]').forEach(function (s) { s.setAttribute('aria-pressed', s === swatch ? 'true' : 'false'); });
    card.querySelectorAll('[data-bcard-link]').forEach(function (a) { a.href = swatch.dataset.url + a.dataset.bcardLink; });
    bikeColor(card, swatch);
  });
  document.addEventListener('pointerover', function (e) {
    var swatch = e.pointerType === 'mouse' && e.target.closest && e.target.closest('[data-bcard-swatch]');
    if (swatch) bikeColor(swatch.closest('.bcard'), swatch);
  });
  document.addEventListener('pointerout', function (e) {
    var group = e.pointerType === 'mouse' && e.target.closest && e.target.closest('[data-bcard-swatches]');
    if (!group || group.contains(e.relatedTarget)) return;
    var card = group.closest('.bcard');
    bikeColor(card, card.querySelector('[data-bcard-swatch][aria-pressed="true"]'));
  });

  /* ---------------- Tooltip: Escape schließt die Blase (WCAG 1.4.13) ----------------
     Escape blendet die offene Blase aus, Fokus und Zeiger bleiben. Sie kommt wieder, sobald beide die Info verlassen haben. */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('.tip').forEach(function (tip) {
      if (tip.matches(':hover, :focus-within')) tip.classList.add('is-dismissed');
    });
  });
  function rearm(e, other) {
    var tip = e.target.closest && e.target.closest('.tip.is-dismissed');
    if (tip && !tip.contains(e.relatedTarget) && !tip.matches(other)) tip.classList.remove('is-dismissed');
  }
  document.addEventListener('mouseout', function (e) { rearm(e, ':focus-within'); });
  document.addEventListener('focusout', function (e) { rearm(e, ':hover'); });
})();
