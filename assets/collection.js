/* ==========================================================================
   Power Shop – Kollektion und Suche: Filter, Sortierung, Seiten ohne Neuladen.
   Die Filter selbst kommen von Shopify (Storefront Filtering). Dieses Modul
   holt die Section nach jeder Änderung neu (Section Rendering API) und tauscht
   Ergebnisse und Filterfelder aus. Ohne JavaScript funktionieren Links und
   Formulare als normale Seitenaufrufe. Der Austausch läuft in einer View Transition (nur [data-results]),
   solange Bewegung aktiv ist; neu eingefügtes HTML startet die Motion-Schicht selbst.
   ========================================================================== */
(function () {
  var PS = (window.PS = window.PS || {});
  var current = null; // aktive Kollektion; ein Section-Reload im Theme-Editor ersetzt sie

  // Dokument-Listener einmal auf Modulebene (in PS.on summierten sie sich bei jedem Section-Reload)
  document.addEventListener('click', function (event) { if (current) current.outside(event); });
  window.addEventListener('popstate', function () { if (current) current.back(); });

  PS.on('[data-collection]', function (root) {
    var sectionId = root.dataset.sectionId;
    var cols = null;
    var controller = null;
    var timer = null;
    var busyTimer = null;
    var seq = 0;   // Zähler der Ladevorgänge: nur der jüngste darf austauschen
    var vt = null; // laufende View Transition
    var last = window.location.pathname + window.location.search; // jüngste angeforderte Adresse (nicht erst die angewendete)

    function $(sel, ctx) { return (ctx || root).querySelector(sel); }
    function $$(sel, ctx) { return Array.prototype.slice.call((ctx || root).querySelectorAll(sel)); }

    /* ---------- Spaltenwahl: fünf Spalten gibt es erst ab 1280 px ----------
       Darunter zeigt das Raster vier, der Fünf-Knopf ist ausgeblendet und der Vier-Knopf trägt den Zustand (aria-pressed, nicht nur
       die Farbe). Die Wahl „fünf“ merkt sich data-five-held und kehrt mit dem Fenster zurück. */
    var wide = window.matchMedia('(min-width: 1280px)');
    function syncCols() {
      var group = $('.grid-toggle');
      var five = group && $('[data-cols="5"]', group);
      var four = group && $('[data-cols="4"]', group);
      if (!five || !four) return;
      if (wide.matches) {
        if (!group.hasAttribute('data-five-held')) return;
        group.removeAttribute('data-five-held');
        four.setAttribute('aria-pressed', 'false');
        five.setAttribute('aria-pressed', 'true');
      } else if (five.getAttribute('aria-pressed') === 'true') {
        group.setAttribute('data-five-held', '');
        five.setAttribute('aria-pressed', 'false');
        four.setAttribute('aria-pressed', 'true');
      }
    }
    syncCols();
    wide.addEventListener('change', syncCols);
    document.addEventListener('shopify:section:unload', function gone(e) {
      if (!e.target.contains(root)) return;
      wide.removeEventListener('change', syncCols);
      document.removeEventListener('shopify:section:unload', gone);
    });

    /* ---------- Sortierung: zwei Auswahlgruppen (Desktop-Menü, mobiles Sheet) mit einem Stand ---------- */
    function syncSort(value) {
      var label = '';
      $$('[data-sort]').forEach(function (radio) {
        radio.checked = radio.value === value;
        if (radio.checked) label = radio.parentNode.textContent.replace(/\s+/g, ' ').trim();
      });
      $$('[data-sort-label]').forEach(function (el) { el.textContent = label; });
    }
    // Nur eine Wahl per Zeiger schließt Menü und Sheet; mit den Pfeiltasten bleibt beides offen (jede Taste wählt schon)
    var sortByPointer = false;
    root.addEventListener('pointerdown', function (event) { sortByPointer = !!event.target.closest('[data-sort-group]'); });
    function closeSort(input) {
      var drop = input.closest('.fdrop');
      if (drop) {
        var own = $('.fdrop__btn', drop);
        own.setAttribute('aria-expanded', 'false');
        own.nextElementSibling.hidden = true;
        own.focus();
      }
      var sheet = input.closest('dialog');
      if (sheet && sheet.open) sheet.close();
    }

    /* ---------- URL aus einem Filterformular ---------- */
    function urlFromForm(form) {
      var params = new URLSearchParams();
      new FormData(form).forEach(function (value, key) {
        if (value !== '') params.append(key, value);
      });
      var sort = $('[data-sort]:checked');
      if (sort) params.set('sort_by', sort.value);
      var query = params.toString();
      return form.getAttribute('action') + (query ? '?' + query : '');
    }

    /* ---------- Ladezustand: aria-busy sofort, sichtbarer Hinweis erst nach 160 ms ---------- */
    function busy(on) {
      var results = $('[data-results]');
      clearTimeout(busyTimer);
      if (!results) return;
      if (on) {
        results.setAttribute('aria-busy', 'true');
        busyTimer = setTimeout(function () { results.classList.add('is-loading'); }, 160);
      } else {
        results.removeAttribute('aria-busy');
        results.classList.remove('is-loading');
      }
    }

    /* ---------- Austausch, wenn möglich als View Transition ---------- */
    function swap(update, animate) {
      var results = $('[data-results]');
      var html = document.documentElement;
      // Kein Übergang, solange ein Fenster offen ist (Filter- oder Sortier-Sheet, Warenkorb): Die Momentaufnahmen der
      // View Transition liegen über der obersten Ebene, Ergebnisse und Header schoben sich sonst über das offene Sheet
      var dialogOpen = !!document.querySelector('dialog[open]');
      if (!animate || dialogOpen || !results || !document.startViewTransition || !PS.motion.enabled) { update(false); return; }
      results.classList.add('is-vt');
      html.classList.add('is-vt-results');
      var transition = vt = document.startViewTransition(function () { update(true); });
      // Nur die jüngste Überblendung räumt auf: eine übersprungene darf die Klassen der nächsten nicht vorzeitig entfernen
      var done = function () { if (vt !== transition) return; vt = null; results.classList.remove('is-vt'); html.classList.remove('is-vt-results'); };
      // übersprungene Übergänge melden sonst „Uncaught (in promise)“
      transition.ready.catch(function () {});
      transition.updateCallbackDone.catch(function () {});
      transition.finished.then(done, done);
    }

    /* ---------- Section nachladen und austauschen ---------- */
    function load(url, options) {
      options = options || {};
      var target = new URL(url, window.location.origin);
      var request = new URL(target.href);
      request.searchParams.set('section_id', sectionId);
      var mine = ++seq;
      last = target.pathname + target.search; // sofort: ein schnelles Zurück/Vor bricht diesen Ladevorgang dann ab

      if (controller) controller.abort();
      controller = new AbortController();

      busy(true);
      var active = document.activeElement;
      var focusId = active && active.id;
      var hadFocus = active && active !== document.body && root.contains(active);

      fetch(request.pathname + request.search, { signal: controller.signal })
        .then(function (response) {
          if (!response.ok) throw new Error('HTTP ' + response.status);
          return response.text();
        })
        .then(function (html) {
          if (mine !== seq) return; // ein jüngerer Ladevorgang hat übernommen
          // <template> statt DOMParser: ein geparstes Dokument mit <video> (Film-Kollektionen) bliebe in Chrome je Austausch im Speicher
          var tpl = document.createElement('template');
          tpl.innerHTML = html;
          var doc = tpl.content;
          var next = doc.querySelector('[data-collection]');
          if (!next) throw new Error('Section nicht gefunden');

          busy(false); // vor dem Austausch: der alte Stand geht nicht abgedunkelt in die Überblendung
          // Beim Blättern (Scrollen) keine Überblendung, die Karten laufen über ihre Reveals ein
          swap(function (viaTransition) {
            if (mine !== seq) return; // die Überblendung startet verzögert: inzwischen kann ein jüngerer Ladevorgang laufen
            try {
              apply(next, doc, viaTransition);
              // Adresse erst mit dem neuen Stand
              if (options.push !== false) window.history.pushState({}, '', target.pathname + target.search);
              var again = focusId && document.getElementById(focusId);
              if (again) again.focus();
              else if (hadFocus && document.activeElement === document.body) {
                // Das fokussierte Element ist mit dem Austausch verschwunden (Seitenlink, Filter-Chip): Fokus auf die Überschrift der Ergebnisse
                var head = $('[data-results] h2');
                if (head) { head.tabIndex = -1; head.focus({ preventScroll: true }); }
              }
              if (options.scroll) {
                var bar = $('[data-filterbar]');
                if (bar) bar.scrollIntoView({ behavior: PS.prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
              }
            } catch (e) {
              window.location.href = target.pathname + target.search; // in der Überblendung gibt es kein äußeres catch
            }
          }, !options.scroll);
        })
        .catch(function (error) {
          if (error.name === 'AbortError') return;
          busy(false);
          // Im Zweifel normal navigieren, dann stimmt der Stand auf jeden Fall
          window.location.href = target.pathname + target.search;
        });
    }

    function apply(next, doc, viaTransition) {
      // Ergebnisse
      var results = $('[data-results]');
      var nextResults = $('[data-results]', next);
      if (results && nextResults) {
        // Die Überblendung bewegt: kein zusätzlicher Reveal-Stagger
        if (viaTransition) $$('[data-reveal]', nextResults).forEach(function (el) { el.removeAttribute('data-reveal'); });
        // Die Trefferzahl sagt die Live-Region [data-live] außerhalb an: eine mit ersetzte Region würde nicht verlässlich gelesen
        var count = $('.active-filters__count', nextResults);
        var live = $('[data-live]');
        if (live && count) {
          live.textContent = '';
          setTimeout(function () { live.textContent = count.textContent.replace(/\s+/g, ' ').trim(); }, 60);
        }
        results.innerHTML = nextResults.innerHTML;
        var grid = $('[data-grid]', results);
        if (grid && cols) grid.dataset.cols = cols;
      }

      // Filterfelder: nur den Inhalt tauschen, damit offene Menüs offen bleiben
      var existing = $$('[data-fdrop]');
      var incoming = $$('[data-fdrop]', next);
      if (existing.length === incoming.length) {
        existing.forEach(function (el, i) {
          var fresh = incoming[i];
          var panel = $('.fdrop__panel, .acc__body', el);
          var freshPanel = $('.fdrop__panel, .acc__body', fresh);
          if (panel && freshPanel) panel.innerHTML = freshPanel.innerHTML;
          var dot = $('[data-dot]', el);
          var freshDot = $('[data-dot]', fresh);
          if (dot && freshDot) {
            dot.innerHTML = freshDot.innerHTML; // Zahl samt Screenreader-Zusatz („ausgewählt“)
            dot.hidden = freshDot.hidden;
          }
        });
      }
      var dotAll = $('[data-dot-all]');
      var freshDotAll = $('[data-dot-all]', next);
      if (dotAll && freshDotAll) {
        dotAll.innerHTML = freshDotAll.innerHTML; // Zahl samt Screenreader-Zusatz
        dotAll.hidden = freshDotAll.hidden;
      }
      var show = $('[data-show-count]');
      var freshShow = $('[data-show-count]', next);
      if (show && freshShow) show.textContent = freshShow.textContent;

      var freshSort = $('[data-sort]:checked', next);
      if (freshSort) syncSort(freshSort.value);
      initPrice();

      var title = doc.querySelector('title');
      var text = title ? title.textContent.replace(/\s+/g, ' ').trim() : '';
      if (text) document.title = text;
    }

    /* ---------- Preis: Doppelregler und Zahlenfelder gleichen sich ab ----------
       Die Felder tragen die Filterwerte, die Regler (0–1000, ohne name) nur die Lage. Die Skala ist quadratisch: die
       ersten 10 % des Wegs decken 1 % der Preisspanne ab, so lassen sich günstige Teile fein eingrenzen. Ganz links bzw.
       rechts bleibt das Feld leer (keine Grenze). Geladen wird erst beim Loslassen (change), siehe unten. */
    var STEPS = 1000;
    function toPrice(pos, max) {
      if (pos >= STEPS) return max;
      var v = max * Math.pow(pos / STEPS, 2);
      var step = v < 100 ? 1 : v < 1000 ? 10 : 50;
      return Math.min(max, Math.round(v / step) * step);
    }
    function toPos(price, max) {
      if (!max) return 0;
      return Math.round(Math.sqrt(Math.min(Math.max(price, 0), max) / max) * STEPS);
    }
    function priceParts(slider) {
      var frange = slider.closest('.frange');
      return {
        lo: $('[data-price-lo]', slider),
        hi: $('[data-price-hi]', slider),
        nmin: frange && $('[data-price-min]', frange),
        nmax: frange && $('[data-price-max]', frange),
        max: +slider.dataset.max || 0
      };
    }
    function paintPrice(slider, p) {
      slider.style.setProperty('--lo', p.lo.value / STEPS);
      slider.style.setProperty('--hi', p.hi.value / STEPS);
      // Liegen beide Knöpfe aufeinander, muss der passende oben liegen: rechts der untere Wert (zieht nach links), links der obere
      p.lo.style.zIndex = +p.lo.value > STEPS / 2 ? '3' : '';
      p.lo.setAttribute('aria-valuetext', toPrice(+p.lo.value, p.max) + ' €');
      p.hi.setAttribute('aria-valuetext', toPrice(+p.hi.value, p.max) + ' €');
    }
    // Regler aus den Feldern stellen: beim Start und nach jedem Austausch der Filterfelder
    function initPrice() {
      $$('[data-price-slider]').forEach(function (slider) {
        var p = priceParts(slider);
        if (!p.lo || !p.hi || !p.nmin || !p.nmax || !p.max) return;
        var x = p.nmin.value === '' ? 0 : toPos(+p.nmin.value || 0, p.max);
        var y = p.nmax.value === '' ? STEPS : toPos(+p.nmax.value || 0, p.max);
        p.lo.value = Math.min(x, y);
        p.hi.value = y;
        paintPrice(slider, p);
        slider.hidden = false;
      });
    }
    initPrice();

    root.addEventListener('input', function (event) {
      var el = event.target;
      var frange = el.closest('.frange');
      var slider = frange && $('[data-price-slider]', frange);
      if (!slider) return;
      var p = priceParts(slider);
      if (!p.lo || !p.hi || !p.nmin || !p.nmax) return;
      if (el === p.lo || el === p.hi) {
        if (+p.lo.value > +p.hi.value) {
          if (el === p.lo) p.lo.value = p.hi.value; else p.hi.value = p.lo.value;
        }
        var a = toPrice(+p.lo.value, p.max);
        var b = toPrice(+p.hi.value, p.max);
        p.nmin.value = a > 0 ? a : '';
        p.nmax.value = +p.hi.value < STEPS ? b : '';
      } else if (el === p.nmin || el === p.nmax) {
        var x = p.nmin.value === '' ? 0 : toPos(+p.nmin.value || 0, p.max);
        var y = p.nmax.value === '' ? STEPS : toPos(+p.nmax.value || 0, p.max);
        p.lo.value = Math.min(x, y);
        p.hi.value = y;
      } else {
        return;
      }
      paintPrice(slider, p);
    });

    /* ---------- Eingaben ---------- */
    root.addEventListener('change', function (event) {
      var input = event.target;
      var form = input.closest('[data-filter-form]');
      if (form) {
        clearTimeout(timer);
        // Zahlenfelder: Tippen abwarten; Regler: kurz warten, damit Pfeiltasten nicht je Schritt laden
        var wait = input.type === 'number' ? 600 : input.type === 'range' ? 250 : 0;
        timer = setTimeout(function () { load(urlFromForm(form)); }, wait);
        return;
      }
      if (input.matches('[data-sort]')) {
        syncSort(input.value);
        if (sortByPointer) closeSort(input);
        sortByPointer = false;
        var anyForm = $('[data-filter-form]');
        var url = anyForm ? urlFromForm(anyForm) : window.location.pathname + '?sort_by=' + encodeURIComponent(input.value);
        // Ohne Filterformular: aktuelle Adresse behalten und nur die Sortierung setzen
        if (!anyForm) {
          var now = new URL(window.location.href);
          now.searchParams.set('sort_by', input.value);
          now.searchParams.delete('page');
          url = now.pathname + now.search;
        }
        load(url);
      }
    });

    root.addEventListener('submit', function (event) {
      var form = event.target.closest('[data-filter-form]');
      if (!form) return;
      event.preventDefault();
      clearTimeout(timer);
      load(urlFromForm(form));
      var sheet = form.closest('dialog');
      if (sheet && sheet.open) sheet.close();
    });

    root.addEventListener('click', function (event) {
      var link = event.target.closest('a[data-filter-link]');
      if (link && link.href) {
        event.preventDefault();
        var sheet = link.closest('dialog');
        if (sheet && sheet.open) sheet.close();
        load(link.href, { scroll: !!link.closest('[data-pagination]') });
        return;
      }

      // Spaltenwahl
      var colsButton = event.target.closest('.grid-toggle [data-cols]');
      if (colsButton) {
        cols = colsButton.dataset.cols;
        var toggleGroup = colsButton.closest('.grid-toggle');
        if (toggleGroup) toggleGroup.removeAttribute('data-five-held'); // eine eigene Wahl ersetzt die gemerkte
        $$('.grid-toggle [data-cols]').forEach(function (b) { b.setAttribute('aria-pressed', b === colsButton ? 'true' : 'false'); });
        var grid = $('[data-grid]');
        if (grid) grid.dataset.cols = cols;
        return;
      }

      // Filter-Menüs (Desktop)
      var button = event.target.closest('.fdrop__btn');
      $$('.fdrop').forEach(function (drop) {
        var own = $('.fdrop__btn', drop);
        var panel = $('.fdrop__panel', drop);
        var open = button === own
          ? own.getAttribute('aria-expanded') !== 'true'
          : (drop.contains(event.target) && own.getAttribute('aria-expanded') === 'true');
        own.setAttribute('aria-expanded', open ? 'true' : 'false');
        panel.hidden = !open;
      });
    });

    root.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return;
      var open = $('.fdrop__btn[aria-expanded="true"]');
      if (open) {
        open.setAttribute('aria-expanded', 'false');
        open.nextElementSibling.hidden = true;
        open.focus();
      }
    });

    current = {
      // Klick außerhalb schließt offene Filter-Menüs
      outside: function (event) {
        if (root.contains(event.target)) return;
        $$('.fdrop__btn[aria-expanded="true"]').forEach(function (own) {
          own.setAttribute('aria-expanded', 'false');
          own.nextElementSibling.hidden = true;
        });
      },
      // Vor und zurück; nur der Anker (#main) geändert: nicht neu laden
      back: function () {
        var here = window.location.pathname + window.location.search;
        if (here === last) return;
        load(here, { push: false });
      }
    };
  });
})();
