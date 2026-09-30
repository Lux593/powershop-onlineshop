/* ==========================================================================
   Power Shop – Produktseite: Galerie, Varianten, Menge, Kompatibilität.
   Preis, Lagerhinweis und Artikelnummer holt das Modul nach jeder Auswahl
   vom Server (Section Rendering API), damit alles gleich formatiert bleibt.
   ========================================================================== */
(function () {
  var PS = (window.PS = window.PS || {});

  PS.on('[data-pdp]', function (root) {
    var sectionId = root.dataset.sectionId;
    var $ = function (sel, ctx) { return (ctx || root).querySelector(sel); };
    var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || root).querySelectorAll(sel)); };

    /* ---------- Galerie ---------- */
    var main = $('[data-gallery-main]');

    function showImage(button) {
      if (!main || !button) return;
      main.src = button.dataset.thumb;
      if (button.dataset.thumbSrcset) main.srcset = button.dataset.thumbSrcset;
      if (button.dataset.thumbAlt) main.alt = button.dataset.thumbAlt;
      $$('[data-thumb]').forEach(function (b) { b.setAttribute('aria-current', b === button ? 'true' : 'false'); });
    }
    function showImageById(id) {
      if (!id) return;
      showImage($('[data-media-id="' + id + '"]'));
    }

    root.addEventListener('click', function (event) {
      var thumb = event.target.closest('[data-thumb]');
      if (thumb) { showImage(thumb); return; }

      if (event.target.closest('[data-zoom]')) {
        var lightbox = $('[data-lightbox-img]');
        if (lightbox && main) lightbox.src = main.currentSrc || main.src;
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
        var done = function () { PS.toast('Teilenummer ' + copy.dataset.copy + ' kopiert.', 'copy'); };
        if (navigator.clipboard) navigator.clipboard.writeText(copy.dataset.copy).then(done, done);
        else done();
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
      var buyButton = $('[data-buy]', form);
      var buyText = $('[data-buy-text]', form);
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
        if (!buyButton) return;
        var can = variant ? variant.available : data.variants.some(function (v) { return v.available; });
        buyButton.disabled = !can;
        if (buyText) buyText.textContent = can ? 'In den Warenkorb' : 'Ausverkauft';
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
          })
          .catch(function (error) { if (error.name !== 'AbortError') { /* Preis bleibt stehen */ } });
      };

      var apply = function () {
        var variant = current();
        if (idField) idField.value = variant ? variant.id : '';
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
        }
      }, true);

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
