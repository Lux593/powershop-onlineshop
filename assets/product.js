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
    // instant: ohne Gleiten (nach einem Gruppenwechsel liefe es sonst über Bilder der neuen Gruppe, die noch laden)
    function showSlide(i, instant) {
      if (!track || !slides[i]) return;
      holdUntil = Date.now() + 700;
      mark(i);
      track.scrollTo({ left: slides[i].offsetLeft, behavior: instant ? 'auto' : behavior() });
    }
    function showImageById(id, instant) {
      if (!id) return;
      for (var i = 0; i < slides.length; i++) if (slides[i].dataset.mediaId == id) { if (i !== active || instant) showSlide(i, instant); return; }
    }

    /* Bilder je Variante: Ein Variantenbild beginnt eine Gruppe, die bis zum nächsten Variantenbild reicht; Bilder davor
       gehören allen (gleiche Regel wie in pdp-gallery.liquid, das beim Laden schon passend ausblendet). */
    var groups = (function () {
      var node = $('[data-product-json]');
      if (!node || slides.length < 2) return null;
      var starts = {};
      JSON.parse(node.textContent).variants.forEach(function (v) { if (v.image) starts[v.image] = true; });
      var group = null;
      return slides.map(function (s) {
        if (starts[s.dataset.mediaId]) group = s.dataset.mediaId;
        return group;
      });
    })();
    var gallery = $('[data-gallery]');
    var shownGroup = null; // Gruppe, die gerade zu sehen ist (beim Laden die vom Server gewählte)
    if (groups) slides.some(function (s, k) { if (!s.hidden && groups[k] !== null) { shownGroup = groups[k]; return true; } return false; });
    var switching = 0;     // Zähler der Wechsel: Ein älterer, noch ladender Wechsel greift nicht mehr

    /* Vorladen, ohne alles zu laden: Die Bilder versteckter Gruppen tragen loading="lazy" und kämen sonst erst nach der Wahl
       (leere Fläche). warm() holt das erste Bild einer Gruppe (das Variantenbild) und ihre Vorschaubilder, mit all
       alle Bilder der Gruppe. Die Größe wählt der Browser wie sonst aus srcset. */
    function warm(id, all) {
      if (!groups || !id) return;
      var g = String(id);
      slides.forEach(function (s, k) {
        if (groups[k] !== g) return;
        var img = s.querySelector('img');
        if (img && (all || s.dataset.mediaId === g)) img.loading = 'eager';
        var t = thumbs[k] && thumbs[k].querySelector('img');
        if (t) t.loading = 'eager';
      });
    }
    var idle = window.requestIdleCallback || function (fn) { return setTimeout(fn, 1200); };
    function slow() { var c = navigator.connection; return !!(c && (c.saveData || /2g|3g/.test(c.effectiveType || ''))); }
    function afterLoad(fn) {
      if (document.readyState === 'complete') idle(fn);
      else window.addEventListener('load', function () { idle(fn); }, { once: true });
    }
    // Alle sichtbaren Bilder nach dem Laden holen: Safari lädt lazy Bilder rechts in der Schiene erst, wenn sie ins Bild rutschen
    // (der Vorlauf gilt nur fürs Fenster), beim Wischen und Blättern stand sonst kurz eine leere Fläche
    afterLoad(function () {
      if (slow()) return;
      slides.forEach(function (s) { var img = !s.hidden && s.querySelector('img'); if (img) img.loading = 'eager'; });
    });
    function swapGroup(group) {
      var shown = 0;
      slides.forEach(function (s, k) {
        var on = groups[k] === null || groups[k] === group;
        s.hidden = !on;
        if (thumbs[k]) thumbs[k].hidden = !on;
        if (on) shown++;
      });
      var n = 0;
      thumbs.forEach(function (b) { if (!b.hidden) b.setAttribute('aria-label', 'Bild ' + (++n) + ' von ' + shown); });
      if (thumbRow) thumbRow.hidden = shown < 2;
      shownGroup = group;
    }
    // Die neue Gruppe erscheint erst, wenn ihr erstes Bild geladen ist; bis dahin bleibt das alte Bild leicht abgeblendet stehen
    // (.gallery.is-switching), höchstens 5 s (sehr langsame Verbindung).
    function showVariantImages(id) {
      if (!id) return;
      var group = String(id);
      var token = ++switching;
      var done = function () {
        if (token !== switching) return;
        if (gallery) gallery.classList.remove('is-switching');
        var swap = groups && groups.indexOf(group) > -1 && group !== shownGroup;
        if (swap) swapGroup(group);
        showImageById(id, swap);
      };
      if (!groups || groups.indexOf(group) === -1 || group === shownGroup) return done();
      var lead = slides[groups.indexOf(group)].querySelector('img');
      if (lead) lead.fetchPriority = 'high'; // versteckte Bilder lädt der Browser sonst nachrangig
      warm(group, true);
      if (!lead || (lead.complete && lead.naturalWidth)) return done();
      if (gallery) gallery.classList.add('is-switching');
      var ready = lead.decode ? lead.decode() : new Promise(function (r) {
        lead.addEventListener('load', r, { once: true });
        lead.addEventListener('error', r, { once: true });
      });
      Promise.race([ready.catch(function () {}), new Promise(function (r) { setTimeout(r, 5000); })]).then(done);
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

    /* ---------- Varianten ----------
       Bekleidung und Teile wählen im Kaufformular, Motorräder ohne Formular: dort folgen Preis, Fakten und Anfrage der Auswahl. */
    var jsonNode = $('[data-product-json]');
    var rows = $$('[data-option-row]');
    var form = $('[data-product-form]');

    if (jsonNode) {
      var data = JSON.parse(jsonNode.textContent);
      var idField = form && $('[data-variant-id]', form);
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
      // Bild der Variante, die ein Klick auf diesen Wert in Zeile i ergäbe
      var imageFor = function (i, value) {
        var probe = selected.slice();
        probe[i] = value;
        var v = matching(probe).filter(function (x) { return x.image; })[0];
        return v && v.image;
      };

      /* Vorladen: für jede mit einem Klick erreichbare Variante Variantenbild und Vorschaubilder (nach dem Laden im Leerlauf und
         nach jeder Wahl), dazu die Option unter Zeiger oder Fokus. Nicht bei Datensparmodus oder langsamer Verbindung. */
      var reachable = function () {
        if (slow()) return;
        rows.forEach(function (row, i) {
          $$('[data-option-value]', row).forEach(function (b) { warm(imageFor(i, b.dataset.optionValue)); });
        });
      };
      if (groups) {
        afterLoad(reachable);
        var intent = function (event) {
          var b = event.target.closest('[data-option-value]');
          if (b) warm(imageFor(rows.indexOf(event.currentTarget), b.dataset.optionValue));
        };
        rows.forEach(function (row) {
          row.addEventListener('pointerover', intent);
          row.addEventListener('focusin', intent);
        });
      }

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
        var price = $('[data-pdp-dynamic="price"] .price__now') || $('[data-pdp-dynamic="bike-price"] strong');
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
            // Kontakt-Box (Motorräder): Der Betreff nennt die gewählte Ausführung, Links neu setzen
            $$('[data-contact]').forEach(function (box) {
              var fresh = box.id && doc.getElementById(box.id);
              if (!fresh || fresh.dataset.subject === box.dataset.subject) return;
              box.dataset.subject = fresh.dataset.subject;
              if (PS.refreshContact) PS.refreshContact(box);
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
        // Bilder schon bei unvollständiger Auswahl (Farbe gewählt, Größe noch nicht): die erste passende Variante mit Bild
        var pictured = variant && variant.image ? variant : matching(selected).filter(function (v) { return v.image; })[0];
        if (pictured) showVariantImages(pictured.image);
        if (groups) idle(reachable);
        if (variant) {
          if (errorNode) errorNode.textContent = '';
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
      if (form) form.addEventListener('submit', function (event) {
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
      // Bilder passend zur Vorauswahl (z. B. erste Farbe), falls der Server eine andere Variante zugrunde gelegt hat
      var preset = matching(selected).filter(function (v) { return v.image; })[0];
      if (preset) showVariantImages(preset.image);
    }

    /* ---------- Kompatibilitätstabelle durchsuchen ----------
       Die Tabelle ist nach Modellfamilie gruppiert (ein tbody je Familie): ein Treffer im Familiennamen zeigt die ganze
       Gruppe, Gruppen ohne Treffer verschwinden samt Überschrift. */
    var compat = $('[data-compat-q]');
    if (compat) {
      compat.addEventListener('input', function () {
        var query = compat.value.toLowerCase().trim();
        var shown = 0;
        $$('[data-compat-rows] tbody').forEach(function (group) {
          var groupHit = (group.dataset.group || '').toLowerCase().indexOf(query) > -1;
          var visible = 0;
          $$('tr[data-family]', group).forEach(function (tr) {
            var on = groupHit || tr.textContent.toLowerCase().indexOf(query) > -1;
            tr.hidden = !on;
            if (on) visible++;
          });
          group.hidden = visible === 0;
          shown += visible;
        });
        var empty = $('[data-compat-empty]');
        if (empty) empty.hidden = shown > 0;
      });
    }

    /* ---------- „Werkstatt-Termin anfragen“: zur Kontakt-Box unten, Thema „Einbau“ gleich gewählt ----------
       Den Sprung selbst macht der Anker (motion.js gleitet), hier nur der Chip über den Klick-Weg von contact.js. */
    root.addEventListener('click', function (event) {
      var link = event.target.closest('a[data-contact-topic]');
      if (!link || !link.hash) return;
      var target = document.getElementById(link.hash.slice(1));
      var chip = target && target.querySelector('[data-topic="' + link.dataset.contactTopic + '"]');
      if (chip && chip.getAttribute('aria-pressed') !== 'true') chip.click();
    });

    /* ---------- Passt-Check: passt das Teil zu deinem Motorrad? ----------
       Drei Quellen, in dieser Reihenfolge:
       1. Gemerktes Motorrad (localStorage ps-motorrad: Baujahr, Familie, Modellcode, Name), gesetzt im Fenster #passt-check.
          Genau: Es passt, wenn eine Zeile der Modellliste (part.kompatibilitaet) diesen Modellcode und das Baujahr abdeckt
          (ohne Code: Familie und Name). Gilt auch, wenn man aus einer gefilterten Liste kommt, die dieses Motorrad enthält.
       2. Filter der Kollektion oder Suche, aus der man kommt (Modellfamilie + Baujahr; Referrer, auch nach dem AJAX-Filtern,
          sonst für die Sitzung gemerkt): nur auf Ebene der Familie. Mit der Fahrzeugliste heißt es „alle“ oder „3 von 8“
          Modellen, dazu „Modell genau prüfen“ (Fenster mit Jahr und Familie vorausgewählt).
       3. Nichts bekannt: die Box „Passt das zu deinem Motorrad?“ mit „Jetzt prüfen“, so wie sie aus dem Theme kommt.
       Die Fahrzeugliste (alle H-D Modelle je Baujahr, Shop-Metafeld passform.fahrzeuge, monatlich von n8n) lädt erst, wenn
       das Fenster aufgeht oder ein Filter gesetzt ist. Werte aus Adresse und Speicher landen nur als Text im Dokument. */
    var fit = $('[data-compat-fit]');
    var fitBox = fit && fit.closest('[data-compat]');
    if (fit && fitBox) {
      var BIKE_KEY = 'ps-motorrad';
      var PICK_KEY = 'ps-fahrzeug';
      var universal = fitBox.hasAttribute('data-compat-universal');
      var pcRows = $$('[data-compat-rows] tr[data-family]');
      var fitButton = $('[data-pc-open]', fit);
      var fitTitle = $('[data-compat-fit-title]', fit);
      var fitLead = $('[data-compat-fit-lead]', fit);
      var fitBikes = $('[data-compat-fit-bikes]', fit);
      var fitNote = $('[data-compat-fit-text]', fit);
      var askLead = fitLead ? fitLead.textContent : '';
      var pcDialog = document.getElementById('passt-check');
      var openWith = null; // Vorauswahl für das Fenster, je nach Zustand der Box

      var readBike = function () {
        try {
          var b = JSON.parse(window.localStorage.getItem(BIKE_KEY) || 'null');
          if (b && +b.y > 0 && b.f && (b.c || b.m)) return { y: +b.y, f: String(b.f), c: String(b.c || ''), m: String(b.m || b.c) };
        } catch (e) {}
        return null;
      };
      var writeBike = function (b) {
        try {
          if (b) window.localStorage.setItem(BIKE_KEY, JSON.stringify({ v: 1, y: b.y, f: b.f, c: b.c, m: b.m }));
          else window.localStorage.removeItem(BIKE_KEY);
        } catch (e) {}
      };

      // Filter der Liste, aus der man kommt
      var pick = null;
      try {
        var ref = document.referrer ? new URL(document.referrer) : null;
        var fromList = ref && ref.origin === window.location.origin &&
          /^(\/[a-z]{2}(-[a-z]{2})?)?\/(collections|search)(\/|$)/i.test(ref.pathname) && ref.pathname.indexOf('/products/') === -1;
        if (fromList) {
          pick = { f: ref.searchParams.getAll('filter.p.m.part.modellfamilien'), y: ref.searchParams.getAll('filter.p.m.part.baujahre_filter') };
          if (pick.f.length || pick.y.length) window.sessionStorage.setItem(PICK_KEY, JSON.stringify(pick));
          else window.sessionStorage.removeItem(PICK_KEY);
        } else {
          pick = JSON.parse(window.sessionStorage.getItem(PICK_KEY) || 'null');
        }
      } catch (e) { pick = null; }
      var fams = pick && Array.isArray(pick.f) ? pick.f.filter(Boolean) : [];
      var yrs = pick && Array.isArray(pick.y) ? pick.y.map(Number).filter(function (n) { return n > 0; }) : [];
      yrs.sort(function (a, b) { return a - b; });

      // Fahrzeugliste: { jahre: [...], modelle: [[Familie, Code, Name, von, bis], ...] }
      var catalog = null;
      var catalogLoading = null;
      var loadCatalog = function () {
        var src = pcDialog && pcDialog.getAttribute('data-pc-src');
        if (!src) return Promise.reject(new Error('keine Quelle'));
        if (!catalogLoading) {
          catalogLoading = fetch(src, { credentials: 'same-origin', headers: { Accept: 'application/json' } })
            .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
            .then(function (d) {
              if (!d || !Array.isArray(d.jahre) || !Array.isArray(d.modelle) || !d.modelle.length) throw new Error('leer');
              catalog = d;
              return d;
            })
            .catch(function (e) { catalogLoading = null; throw e; });
        }
        return catalogLoading;
      };

      var covers = function (tr, year) { return +tr.dataset.from <= year && year <= +tr.dataset.to; };
      var rowName = function (tr) { return tr.cells[0] ? tr.cells[0].textContent.trim() : ''; };
      // Zeilen der Modellliste für ein Motorrad: Modellcode + Baujahr (ohne Code: Familie + Name)
      var bikeRows = function (b) {
        return pcRows.filter(function (tr) {
          var same = b.c && tr.dataset.code ? tr.dataset.code === b.c : (tr.dataset.family === b.f && rowName(tr) === b.m);
          return same && covers(tr, b.y);
        });
      };
      var familyRows = function (f, y) { return pcRows.filter(function (tr) { return tr.dataset.family === f && covers(tr, y); }); };
      var countKeys = function (list, key) { var seen = {}; list.forEach(function (x) { seen[key(x)] = true; }); return Object.keys(seen).length; };
      // Modelle einer Familie in einem Jahr: laut Fahrzeugliste (alle) und laut Modellliste des Teils (passend)
      var familyCount = function (f, y) {
        if (!catalog) return null;
        var all = countKeys(catalog.modelle.filter(function (m) { return m[0] === f && m[3] <= y && y <= m[4]; }), function (m) { return m[1] || m[2]; });
        var fitting = countKeys(familyRows(f, y), function (tr) { return tr.dataset.code || rowName(tr); });
        return all ? { all: all, fitting: Math.min(fitting, all) } : null;
      };
      var familyWord = function (f, ending) { return f.replace(/\s+/g, '-') + '-' + ending; }; // „Revolution-Max-Modellen“

      // Kacheln wie die Fakten der Motorrad-Seiten (.bike-facts)
      var tiles = function (facts, hit) {
        var dl = document.createElement('dl');
        dl.className = 'bike-facts compat__vehicle' + (hit ? '' : ' is-miss');
        facts.forEach(function (fact) {
          var cell = document.createElement('div');
          var dt = document.createElement('dt');
          dt.innerHTML = '<svg class="icon" aria-hidden="true" focusable="false"><use href="#i-' + fact[0] + '"></use></svg>';
          dt.appendChild(document.createTextNode(fact[1]));
          var dd = document.createElement('dd');
          dd.textContent = fact[2];
          cell.appendChild(dt);
          cell.appendChild(dd);
          dl.appendChild(cell);
        });
        return dl;
      };
      var labelled = function (label, list, hit) {
        var row = document.createElement('div');
        row.className = 'compat__bikes';
        var l = document.createElement('span');
        l.className = 'compat__bikes-label';
        l.textContent = label;
        row.appendChild(l);
        list.forEach(function (el) { row.appendChild(el); });
        return row;
      };
      var familyTiles = function (list, hit) {
        var order = [];
        var by = {};
        list.forEach(function (c) {
          if (!by[c.f]) { by[c.f] = []; order.push(c.f); }
          by[c.f].push(c.y);
        });
        return order.map(function (f) {
          return tiles([['motorbike', 'Modellfamilie', f], ['calendar', by[f].length > 1 ? 'Baujahre' : 'Baujahr', by[f].join(', ')]], hit);
        });
      };

      var markRows = function (test) { pcRows.forEach(function (tr) { tr.classList.toggle('is-match', !!test(tr)); }); };
      var show = function (state, title, o) {
        fit.dataset.state = state;
        fitTitle.textContent = title;
        if (fitLead) { fitLead.textContent = o.lead || ''; fitLead.hidden = !o.lead; }
        fitBikes.textContent = '';
        (o.blocks || []).forEach(function (el) { fitBikes.appendChild(el); });
        fitNote.textContent = o.note || '';
        fitNote.hidden = !o.note;
        if (fitButton) {
          fitButton.textContent = o.button;
          fitButton.className = o.link ? 'text-link compat__fit-change' : 'btn btn--secondary btn--sm compat__fit-btn';
          fitButton.hidden = !pcDialog;
        }
        fit.hidden = false;
      };

      var renderPick = function () {
        var hits = [];
        var misses = [];
        fams.forEach(function (f) {
          yrs.forEach(function (y) { (universal || familyRows(f, y).length ? hits : misses).push({ f: f, y: y }); });
        });
        var first = hits[0] || misses[0];
        openWith = { y: first.y, f: first.f };
        var o = { note: universal ? 'Universell einsetzbar' : '', button: 'Modell genau prüfen' };
        var state;
        var title;
        if (fams.length === 1 && yrs.length === 1) {
          var f = fams[0];
          var y = yrs[0];
          var count = universal ? null : familyCount(f, y);
          if (!hits.length) {
            state = 'no';
            title = 'Passt laut Hersteller zu keinem ' + familyWord(f, 'Modell') + ' von ' + y + '!';
            o.button = 'Anderes Motorrad prüfen';
          } else if (universal || (count && count.fitting >= count.all)) {
            state = 'ok';
            title = 'Passt zu allen ' + familyWord(f, 'Modellen') + ' von ' + y + '!';
          } else if (count) {
            state = 'partial';
            title = 'Passt zu ' + count.fitting + ' von ' + count.all + ' ' + familyWord(f, 'Modellen') + ' von ' + y + '!';
          } else {
            state = 'partial';
            title = 'Passt zu ' + familyWord(f, 'Modellen') + ' von ' + y + '!';
          }
          o.blocks = familyTiles(hits.length ? hits : misses, state !== 'no');
        } else if (!misses.length) {
          state = 'partial';
          title = 'Passt zu Modellen deiner Auswahl!';
          o.blocks = familyTiles(hits, true);
        } else if (hits.length) {
          state = 'partial';
          title = 'Passt zu einem Teil deiner Auswahl!';
          o.blocks = [labelled('Passt', familyTiles(hits, true)), labelled('Passt nicht', familyTiles(misses, false))];
        } else {
          state = 'no';
          title = 'Passt laut Hersteller zu keinem Motorrad deiner Auswahl!';
          o.blocks = familyTiles(misses, false);
          o.button = 'Anderes Motorrad prüfen';
        }
        show(state, title, o);
        markRows(function (tr) { return fams.indexOf(tr.dataset.family) > -1 && yrs.some(function (y) { return covers(tr, y); }); });
      };

      var render = function () {
        var bike = readBike();
        var picked = fams.length > 0 && yrs.length > 0;
        if (bike && (!picked || (fams.indexOf(bike.f) > -1 && yrs.indexOf(bike.y) > -1))) {
          var hit = bikeRows(bike);
          var ok = universal || hit.length > 0;
          openWith = bike;
          show(ok ? 'ok' : 'no', ok ? 'Passt zu deinem Motorrad!' : 'Passt laut Hersteller nicht zu deinem Motorrad!', {
            blocks: [tiles([['motorbike', 'Modell', bike.m], ['calendar', 'Baujahr', String(bike.y)]], ok)],
            note: universal ? 'Universell einsetzbar' : '',
            button: 'Anderes Motorrad',
            link: true
          });
          markRows(function (tr) { return hit.indexOf(tr) > -1; });
          return;
        }
        if (picked) {
          renderPick();
          // Mit der Fahrzeugliste genauer: „alle“ oder „3 von 8“ Modellen
          if (!catalog && !universal && fams.length === 1 && yrs.length === 1) loadCatalog().then(render, function () {});
          return;
        }
        openWith = null;
        markRows(function () { return false; });
        if (universal) { fit.hidden = true; return; }
        show('ask', 'Passt das zu deinem Motorrad?', { lead: askLead, button: 'Jetzt prüfen' });
      };
      render();

      /* ---------- Fenster „Passt es zu deinem Motorrad?“ (snippets/passt-check.liquid) ---------- */
      if (pcDialog) {
        var selYear = $('[data-pc-year]', pcDialog);
        var selFamily = $('[data-pc-family]', pcDialog);
        var selModel = $('[data-pc-model]', pcDialog);
        var pcResult = $('[data-pc-result]', pcDialog);
        var pcResultTitle = $('[data-pc-result-title]', pcDialog);
        var pcError = $('[data-pc-error]', pcDialog);
        var pcSave = $('[data-pc-save]', pcDialog);
        var pcForget = $('[data-pc-forget]', pcDialog);
        var models = []; // Modelle in der Auswahlliste (Wert = Index)
        var prefill = null;

        var option = function (value, text) {
          var o = document.createElement('option');
          o.value = value;
          o.textContent = text;
          return o;
        };
        var fill = function (select, placeholder, items) {
          select.textContent = '';
          select.appendChild(option('', placeholder));
          items.forEach(function (it) { select.appendChild(option(it.value, it.text)); });
          select.disabled = !items.length;
        };
        var chosen = function () { return selModel.value === '' ? null : models[+selModel.value] || null; };
        var showResult = function () {
          var m = chosen();
          pcSave.disabled = !m;
          if (!m) { pcResult.hidden = true; return; }
          var b = { y: +selYear.value, f: selFamily.value, c: m.c, m: m.n };
          var ok = universal || bikeRows(b).length > 0;
          pcResult.dataset.state = ok ? 'ok' : 'no';
          pcResultTitle.textContent = (ok ? 'Passt zu deiner ' : 'Passt laut Hersteller nicht zu deiner ') + m.n + ' ' + b.y + '!';
          pcResult.hidden = false;
        };
        var fillModels = function () {
          models = [];
          var y = +selYear.value;
          var f = selFamily.value;
          if (y && f) {
            var seen = {};
            catalog.modelle.forEach(function (m) {
              if (m[0] !== f || m[3] > y || y > m[4]) return;
              var k = m[1] + '|' + m[2];
              if (seen[k]) return;
              seen[k] = true;
              models.push({ c: m[1], n: m[2] });
            });
            models.sort(function (a, b) { return a.n.localeCompare(b.n, 'de'); });
          }
          if (f) fill(selModel, 'Modell wählen', models.map(function (m, i) { return { value: i, text: m.n }; }));
          else fill(selModel, 'Erst Modellfamilie wählen', []);
          showResult();
        };
        var fillFamilies = function () {
          var y = +selYear.value;
          var list = [];
          if (y) {
            var seen = {};
            catalog.modelle.forEach(function (m) { if (m[3] <= y && y <= m[4] && !seen[m[0]]) { seen[m[0]] = true; list.push(m[0]); } });
            list.sort(function (a, b) { return a.localeCompare(b, 'de'); });
            fill(selFamily, 'Modellfamilie wählen', list.map(function (f) { return { value: f, text: f }; }));
          } else {
            fill(selFamily, 'Erst Baujahr wählen', []);
          }
          fillModels();
        };
        var applyPick = function (p) {
          var years = catalog.jahre.slice().sort(function (a, b) { return b - a; });
          fill(selYear, 'Baujahr wählen', years.map(function (y) { return { value: y, text: y }; }));
          if (p && years.indexOf(+p.y) > -1) selYear.value = String(p.y);
          fillFamilies();
          if (p && p.f && selYear.value) {
            selFamily.value = p.f;
            if (selFamily.value !== p.f) selFamily.value = '';
            fillModels();
            if (selFamily.value && (p.c || p.m)) {
              var i = -1;
              models.some(function (m, n) { if ((p.c && m.c === p.c && (!p.m || m.n === p.m)) || (!p.c && m.n === p.m)) { i = n; return true; } return false; });
              if (i < 0 && p.c) models.some(function (m, n) { if (m.c === p.c) { i = n; return true; } return false; });
              if (i > -1) selModel.value = String(i);
              showResult();
            }
          }
        };

        selYear.addEventListener('change', fillFamilies);
        selFamily.addEventListener('change', fillModels);
        selModel.addEventListener('change', showResult);

        // Vorauswahl: gemerktes Motorrad bzw. Familie + Jahr aus dem Filter (Zustand der Box beim Klick)
        root.addEventListener('click', function (event) {
          if (event.target.closest('[data-pc-open]')) prefill = openWith;
        });
        pcDialog.addEventListener('ps:open', function () {
          var p = prefill || readBike();
          prefill = null;
          pcError.hidden = true;
          if (pcForget) pcForget.hidden = !readBike();
          if (catalog) { applyPick(p); return; }
          fill(selYear, 'Lädt …', []);
          fill(selFamily, 'Erst Baujahr wählen', []);
          fill(selModel, 'Erst Modellfamilie wählen', []);
          pcResult.hidden = true;
          pcSave.disabled = true;
          loadCatalog().then(function () { applyPick(p); }, function () {
            fill(selYear, 'Nicht verfügbar', []);
            pcError.hidden = false;
          });
        });

        pcSave.addEventListener('click', function () {
          var m = chosen();
          if (!m) return;
          writeBike({ y: +selYear.value, f: selFamily.value, c: m.c, m: m.n });
          // Die eigene Wahl gilt vor dem Filter der Liste, aus der man kam
          fams = [];
          yrs = [];
          try { window.sessionStorage.removeItem(PICK_KEY); } catch (e) {}
          pcDialog.close();
          render();
        });
        if (pcForget) {
          pcForget.addEventListener('click', function () {
            writeBike(null);
            pcDialog.close();
            render();
          });
        }
      }
    }

    /* ---------- Mobile Kaufleiste (Teile, Bekleidung, Motorräder): sichtbar, sobald der Kaufbereich oben aus dem Bild ist ---------- */
    var sticky = $('[data-sticky-buy]');
    var buyBox = $('.pdp__buy');
    if (sticky && buyBox && 'IntersectionObserver' in window) {
      var past = false;
      var atFooter = false;
      var atBox = false;
      var sync = function () { sticky.classList.toggle('is-shown', past && !atFooter && !atBox); };
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
      // „Jetzt anfragen“ (Anfrage-Artikel, Motorräder): ausgeblendet, solange die Kontakt-Box, zu der er springt, im Bild ist – sonst doppelt
      var askLink = sticky.querySelector('a[href^="#"]');
      var askBox = askLink && document.getElementById(askLink.hash.slice(1));
      if (askBox) {
        new IntersectionObserver(function (en) { atBox = en[en.length - 1].isIntersecting; sync(); }).observe(askBox);
      }
    }

    /* ---------- Sprung zur Kontakt-Box (Motorräder) ---------- */
    if (window.location.hash === '#kontakt') {
      setTimeout(function () {
        var box = document.getElementById('kontakt');
        if (box) box.scrollIntoView();
      }, 50);
    }
  });
})();
