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

  /* ---------- Kategorie-Film: Start nach Load und Leerlauf, nie bei Datensparen oder reduzierter Bewegung ---------- */
  function initFilm(film, toggle) {
    var conn = navigator.connection;
    var userPaused = false;
    var started = false;
    var visible = false;

    // Schalter folgt den echten Ereignissen, nicht dem Klick
    function sync() {
      if (!toggle) return;
      toggle.dataset.state = film.paused ? 'paused' : 'playing';
      toggle.setAttribute('aria-label', film.paused ? 'Film abspielen' : 'Film pausieren');
    }
    function play() {
      var pending = film.play();
      if (pending && pending.catch) pending.catch(sync); // z. B. iOS-Stromsparmodus: Poster bleibt
    }
    ['play', 'pause', 'ended'].forEach(function (name) { film.addEventListener(name, sync); });
    if (toggle) {
      toggle.hidden = false;
      toggle.addEventListener('click', function () {
        userPaused = !film.paused;
        if (film.paused) play(); else film.pause();
      });
    }
    sync();

    if (!PS.motion.enabled || (conn && conn.saveData) || !('IntersectionObserver' in window)) return;

    // Außerhalb des Bildes anhalten, danach nur fortsetzen, wenn nicht von Hand angehalten
    var io = new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible && started && !userPaused && film.paused) play();
      else if (!visible && !film.paused) film.pause();
    }, { threshold: 0.2 });
    io.observe(film);
    var idle = window.requestIdleCallback ? function (fn) { window.requestIdleCallback(fn, { timeout: 2000 }); } : function (fn) { setTimeout(fn, 300); };
    function go() { idle(function () { started = true; if (visible && !userPaused) play(); }); }
    if (document.readyState === 'complete') go(); else window.addEventListener('load', go, { once: true });
    // Bewegung zur Laufzeit abgeschaltet: anhalten
    PS.motion.track(film, function () { io.disconnect(); started = false; film.pause(); });
  }

  PS.on('[data-collection]', function (root) {
    var sectionId = root.dataset.sectionId;
    var film = root.querySelector('[data-film]');
    if (film) initFilm(film, root.querySelector('[data-film-toggle]'));

    var cols = null;
    var controller = null;
    var timer = null;
    var busyTimer = null;
    var seq = 0;   // Zähler der Ladevorgänge: nur der jüngste darf austauschen
    var vt = null; // laufende View Transition
    var last = window.location.pathname + window.location.search; // jüngste angeforderte Adresse (nicht erst die angewendete)

    function $(sel, ctx) { return (ctx || root).querySelector(sel); }
    function $$(sel, ctx) { return Array.prototype.slice.call((ctx || root).querySelectorAll(sel)); }

    /* ---------- URL aus einem Filterformular ---------- */
    function urlFromForm(form) {
      var params = new URLSearchParams();
      new FormData(form).forEach(function (value, key) {
        if (value !== '') params.append(key, value);
      });
      var sort = $('[data-sort]');
      if (sort && sort.value) params.set('sort_by', sort.value);
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
      if (!animate || !results || !document.startViewTransition || !PS.motion.enabled) { update(false); return; }
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
          var doc = new DOMParser().parseFromString(html, 'text/html');
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
        var own = $('[data-active]', nextResults);
        var count = $('.active-filters__count', nextResults);
        var live = $('[data-live]');
        if (own) own.removeAttribute('aria-live');
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
            dot.textContent = freshDot.textContent;
            dot.hidden = freshDot.hidden;
          }
        });
      }
      var dotAll = $('[data-dot-all]');
      var freshDotAll = $('[data-dot-all]', next);
      if (dotAll && freshDotAll) {
        dotAll.textContent = freshDotAll.textContent;
        dotAll.hidden = freshDotAll.hidden;
      }
      var show = $('[data-show-count]');
      var freshShow = $('[data-show-count]', next);
      if (show && freshShow) show.textContent = freshShow.textContent;

      var sort = $('[data-sort]');
      var freshSort = $('[data-sort]', next);
      if (sort && freshSort) sort.value = freshSort.value;

      if (doc.title) document.title = doc.title;
    }

    /* ---------- Eingaben ---------- */
    root.addEventListener('change', function (event) {
      var input = event.target;
      var form = input.closest('[data-filter-form]');
      if (form) {
        clearTimeout(timer);
        var wait = input.type === 'number' ? 600 : 0;
        timer = setTimeout(function () { load(urlFromForm(form)); }, wait);
        return;
      }
      if (input.matches('[data-sort]')) {
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
