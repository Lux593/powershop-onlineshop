/* ==========================================================================
   Power Shop – Produktseite: Galerie, Varianten, Menge, Kompatibilität.
   Preis, Lagerhinweis und Artikelnummer holt das Modul nach jeder Auswahl
   vom Server (Section Rendering API), damit alles gleich formatiert bleibt.
   ========================================================================== */
(function () {
  var PS = (window.PS = window.PS || {});
  var footerIO; // ein Beobachter für die Fußzeile: ein Section-Reload im Editor ersetzt ihn, statt weitere anzuhäufen

  PS.on('[data-pdp]', function (root) {
    var sectionId = root.dataset.sectionId;
    var $ = function (sel, ctx) { return (ctx || root).querySelector(sel); };
    var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || root).querySelectorAll(sel)); };

    /* ---------- Galerie: Slides mit Scroll-Snap ----------
       Die Schiene scrollt nativ (wischen, Pfeiltasten). Vorschaubilder und Variantenbild springen per scrollTo,
       aria-current der Vorschaubilder folgt dem sichtbaren Slide. */
    var track = $('[data-gallery-track]');
    var slides = $$('[data-slide]');
    var thumbs = $$('[data-thumb]');
    var thumbRow = $('.gallery__thumbs');
    var active = 0;
    var holdUntil = 0; // beim Sprung melden die Zwischen-Slides nichts

    function behavior() { return PS.prefersReducedMotion() ? 'auto' : 'smooth'; }
    function mark(i) {
      active = i;
      thumbs.forEach(function (b, k) { b.setAttribute('aria-current', k === i ? 'true' : 'false'); });
      var b = thumbs[i];
      // nur die Vorschau-Zeile scrollen (scrollIntoView spränge auch vertikal). Lage über die Rechtecke: offsetLeft bezöge sich auf den
      // offsetParent (hier body) und läge um den Seitenabstand der Zeile daneben
      if (b && thumbRow) {
        var inRow = b.getBoundingClientRect().left - thumbRow.getBoundingClientRect().left + thumbRow.scrollLeft;
        thumbRow.scrollTo({ left: inRow - (thumbRow.clientWidth - b.offsetWidth) / 2, behavior: behavior() });
      }
    }
    function showSlide(i) {
      if (!track || !slides[i]) return;
      holdUntil = Date.now() + 700;
      mark(i);
      track.scrollTo({ left: slides[i].offsetLeft, behavior: behavior() });
    }
    function showImageById(id) {
      if (!id) return;
      for (var i = 0; i < slides.length; i++) if (slides[i].dataset.mediaId == id) { if (i !== active) showSlide(i); return; }
    }
    if (track && slides.length > 1 && 'IntersectionObserver' in window) {
      var seen = new IntersectionObserver(function (entries) {
        if (Date.now() < holdUntil) return;
        entries.forEach(function (en) { if (en.isIntersecting) mark(slides.indexOf(en.target)); });
      }, { root: track, threshold: 0.6 });
      slides.forEach(function (s) { seen.observe(s); });
    }

    /* ---------- Lightbox: hochauflösende Quelle, Zoom per Klick/Tippen, Schwenken mit Maus, Finger oder Pfeiltasten ---------- */
    var stage = $('[data-lightbox-stage]');
    var big = $('[data-lightbox-img]');
    var zoomToggle = $('[data-zoom-toggle]');
    var at = [50, 50]; // Zoompunkt in Prozent des Bildes
    function zoom(on, event) {
      if (!stage) return;
      on = on == null ? !stage.classList.contains('is-zoomed') : on;
      stage.classList.toggle('is-zoomed', on);
      if (zoomToggle) zoomToggle.setAttribute('aria-pressed', on);
      if (!on) { big.style.transformOrigin = ''; return; }
      if (event) pan(event); else move(50, 50); // ohne Zeiger (Schalter) die Mitte
    }
    function move(x, y) {
      at = [Math.min(Math.max(x, 0), 100), Math.min(Math.max(y, 0), 100)];
      big.style.transformOrigin = at[0] + '% ' + at[1] + '%';
    }
    // Zoompunkt folgt dem Zeiger
    function pan(event) {
      var r = stage.getBoundingClientRect();
      move((event.clientX - r.left - big.offsetLeft) / big.offsetWidth * 100, (event.clientY - r.top - big.offsetTop) / big.offsetHeight * 100);
    }
    if (stage && big) {
      stage.addEventListener('click', function (e) { zoom(null, e); });
      stage.addEventListener('pointermove', function (e) {
        if (stage.classList.contains('is-zoomed') && (e.pointerType === 'mouse' || e.buttons)) pan(e);
      });
      if (zoomToggle) zoomToggle.addEventListener('click', function () { zoom(); });
      var box = stage.closest('dialog');
      box.addEventListener('close', function () { zoom(false); });
      // Tastatur: Pfeiltasten schwenken das gezoomte Bild (Schalter und Schließen-Knopf nutzen sie nicht)
      box.addEventListener('keydown', function (e) {
        var k = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
        if (!k || !stage.classList.contains('is-zoomed')) return;
        e.preventDefault();
        move(at[0] + k[0] * 12, at[1] + k[1] * 12);
      });
    }

    root.addEventListener('click', function (event) {
      var thumb = event.target.closest('[data-thumb]');
      if (thumb) { showSlide(thumbs.indexOf(thumb)); return; }

      if (event.target.closest('[data-zoom]')) {
        var slide = slides[active];
        if (big && slide) {
          big.src = slide.dataset.full; // 2400 px statt der 600 bis 1200w des Slides
          big.alt = slide.querySelector('img').alt;
        }
        PS.openDialog('lightbox', event.target.closest('[data-zoom]'));
        return;
      }

      // Menge
      var step = event.target.closest('[data-q]');
      if (step) {
        var input = $('[data-q-input]');
        if (input) input.value = Math.max(1, Math.min(9, (parseInt(input.value, 10) || 1) + parseInt(step.dataset.q, 10)));
        return;
      }

      // Teilenummer kopieren
      var copy = event.target.closest('[data-copy]');
      if (copy) {
        // Erfolg nur melden, wenn das Kopieren geklappt hat (fehlende Berechtigung, unsicherer Kontext, altes System)
        var done = function () { PS.toast('Teilenummer ' + copy.dataset.copy + ' kopiert.', 'copy'); };
        var failed = function () { PS.toast('Kopieren hat nicht geklappt. Bitte markiere die Nummer von Hand.', 'circle-alert'); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(copy.dataset.copy).then(done, failed);
        else failed();
      }
    });

    /* ---------- Varianten ---------- */
    var jsonNode = $('[data-product-json]');
    var rows = $$('[data-option-row]');
    var form = $('[data-product-form]');

    if (jsonNode && form) {
      var data = JSON.parse(jsonNode.textContent);
      var idField = $('[data-variant-id]', form);
      var errorNode = $('[data-option-error]', form);
      // Kaufbutton und Text gibt es auch in der Sticky-Leiste (außerhalb, per form="…")
      var buyButtons = $$('[data-buy]');
      var buyTexts = $$('[data-buy-text]');
      var request = null;

      var selected = rows.map(function (row) {
        var pressed = $('[aria-pressed="true"]', row);
        return pressed ? pressed.dataset.optionValue : null;
      });

      var matching = function (optionValues) {
        return data.variants.filter(function (v) {
          return optionValues.every(function (value, i) { return value == null || v.options[i] === value; });
        });
      };
      var current = function () {
        if (selected.some(function (v) { return v == null; })) return null;
        return matching(selected)[0] || null;
      };

      // Das versteckte Feld „id“ trägt immer die gewählte Variante: auch beim Start (Farbe als einzige Option ist schon gewählt)
      // und unmittelbar vor dem Absenden, nicht nur nach einem Klick auf eine Option
      var syncId = function (variant) {
        if (idField) idField.value = variant ? variant.id : '';
      };

      var refreshAvailability = function () {
        rows.forEach(function (row, i) {
          $$('[data-option-value]', row).forEach(function (button) {
            var probe = selected.slice();
            probe[i] = button.dataset.optionValue;
            var available = matching(probe).some(function (v) { return v.available; });
            var isChip = button.classList.contains('size-chip');
            button.classList.toggle('is-soldout', !available);
            if (isChip) {
              if (available) button.removeAttribute('aria-disabled');
              else button.setAttribute('aria-disabled', 'true');
            }
          });
        });
      };

      var refreshBuy = function (variant) {
        var can = variant ? variant.available : data.variants.some(function (v) { return v.available; });
        buyButtons.forEach(function (b) { b.disabled = !can; });
        buyTexts.forEach(function (t) { t.textContent = can ? 'In den Warenkorb' : 'Ausverkauft'; });
      };

      // Statusmeldung (4.1.3): Preis und Verfügbarkeit tauschen sich per innerHTML aus, ohne dass ein Screenreader es bemerkt.
      // Eine eigene Live-Region (entsteht beim Start) sagt nach der Auswahl Variante, Preis und Verfügbarkeit an.
      var live = document.createElement('div');
      live.className = 'sr-only';
      live.setAttribute('role', 'status');
      live.setAttribute('aria-live', 'polite');
      live.setAttribute('aria-atomic', 'true');
      root.appendChild(live);
      var announceVariant = function (variant) {
        var price = $('[data-pdp-dynamic="price"] .price__now');
        var text = [variant.options.join(' / '), price && price.textContent.replace(/\s+/g, ' ').trim(), variant.available ? '' : 'ausverkauft']
          .filter(Boolean).join(', ');
        live.textContent = '';
        setTimeout(function () { live.textContent = text; }, 60); // leeren, dann füllen: gleiche Meldungen werden erneut gelesen
      };

      var refreshDynamic = function (variant) {
        if (!variant) return;
        if (request) request.abort();
        request = new AbortController();
        var url = data.url + '?variant=' + variant.id + '&section_id=' + encodeURIComponent(sectionId);
        fetch(url, { signal: request.signal })
          .then(function (r) { return r.text(); })
          .then(function (html) {
            var doc = new DOMParser().parseFromString(html, 'text/html');
            $$('[data-pdp-dynamic]').forEach(function (node) {
              var fresh = doc.querySelector('[data-pdp-dynamic="' + node.dataset.pdpDynamic + '"]');
              if (fresh) node.innerHTML = fresh.innerHTML;
            });
            announceVariant(variant);
          })
          .catch(function (error) { if (error.name !== 'AbortError') { /* Preis bleibt stehen */ } });
      };

      var apply = function () {
        var variant = current();
        syncId(variant);
        refreshAvailability();
        refreshBuy(variant);
        if (variant) {
          if (errorNode) errorNode.textContent = '';
          showImageById(variant.image);
          refreshDynamic(variant);
          try {
            var url = new URL(window.location.href);
            url.searchParams.set('variant', variant.id);
            window.history.replaceState({}, '', url.pathname + url.search);
          } catch (e) { /* z. B. in eingebetteten Ansichten */ }
        }
      };

      rows.forEach(function (row, i) {
        row.addEventListener('click', function (event) {
          var button = event.target.closest('[data-option-value]');
          if (!button || button.getAttribute('aria-disabled') === 'true') return;
          selected[i] = button.dataset.optionValue;
          $$('[data-option-value]', row).forEach(function (b) { b.setAttribute('aria-pressed', b === button ? 'true' : 'false'); });
          var label = $('[data-option-name]', row);
          if (label) label.textContent = button.dataset.optionValue;
          apply();
        });
      });

      // Vor dem Warenkorb-Handler: ohne vollständige Auswahl nichts abschicken
      form.addEventListener('submit', function (event) {
        var variant = current();
        if (!variant) {
          event.preventDefault();
          event.stopImmediatePropagation();
          var missing = rows.filter(function (row, i) { return selected[i] == null; })[0];
          if (errorNode && missing) errorNode.textContent = 'Bitte wähle zuerst: ' + missing.dataset.optionLabel + '.';
          var first = missing && $('[data-option-value]:not([aria-disabled="true"])', missing);
          if (first) first.focus();
          return;
        }
        if (!variant.available) {
          event.preventDefault();
          event.stopImmediatePropagation();
          return;
        }
        syncId(variant);
      }, true);

      syncId(current());
      refreshAvailability();
      refreshBuy(current());
    }

    /* ---------- Kompatibilitätstabelle durchsuchen ---------- */
    var compat = $('[data-compat-q]');
    if (compat) {
      compat.addEventListener('input', function () {
        var query = compat.value.toLowerCase();
        var shown = 0;
        $$('[data-compat-rows] tr').forEach(function (tr) {
          var on = tr.textContent.toLowerCase().indexOf(query) > -1;
          tr.hidden = !on;
          if (on) shown++;
        });
        var empty = $('[data-compat-empty]');
        if (empty) empty.hidden = shown > 0;
      });
    }

    /* ---------- Mobile Kaufleiste (Teile, Bekleidung): sichtbar, sobald der Kaufbereich oben aus dem Bild ist ---------- */
    var sticky = $('[data-sticky-buy]');
    var buyBox = $('.pdp__buy');
    if (sticky && buyBox && 'IntersectionObserver' in window) {
      var past = false;
      var atFooter = false;
      var sync = function () { sticky.classList.toggle('is-shown', past && !atFooter); };
      // Wurzel = Streifen über dem Bild: ein Sprung über den Kaufbereich (Anker) würde sonst nie gemeldet
      new IntersectionObserver(function (en) {
        past = en[en.length - 1].boundingClientRect.bottom <= 0;
        sync();
      }, { rootMargin: '9999px 0px -100% 0px', threshold: [0, 1] }).observe(buyBox);
      // am Seitenende nicht über der Fußzeile
      var footer = document.querySelector('.site-footer');
      if (footer) {
        if (footerIO) footerIO.disconnect();
        footerIO = new IntersectionObserver(function (en) { atFooter = en[0].isIntersecting; sync(); });
        footerIO.observe(footer);
      }
    }

    /* ---------- Mobile Kontaktleiste (Motorräder) ---------- */
    if ($('[data-sticky-contact]')) document.body.classList.add('has-sticky-contact');
    if (window.location.hash === '#kontakt') {
      setTimeout(function () {
        var box = document.getElementById('kontakt');
        if (box) box.scrollIntoView();
      }, 50);
    }
  });
})();
