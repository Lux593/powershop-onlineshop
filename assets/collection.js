/* ==========================================================================
   Power Shop – Kollektion und Suche: Filter, Sortierung, Seiten ohne Neuladen.
   Die Filter selbst kommen von Shopify (Storefront Filtering). Dieses Modul
   holt die Section nach jeder Änderung neu (Section Rendering API) und tauscht
   Ergebnisse und Filterfelder aus. Ohne JavaScript funktionieren Links und
   Formulare als normale Seitenaufrufe.
   ========================================================================== */
(function () {
  var PS = (window.PS = window.PS || {});

  PS.on('[data-collection]', function (root) {
    var sectionId = root.dataset.sectionId;

    var film = root.querySelector('[data-film]');
    if (film) {
      var toggle = root.querySelector('[data-film-toggle]');
      var reduceMotion = PS.prefersReducedMotion();

      function setPlaying(playing) {
        if (!toggle) return;
        toggle.dataset.state = playing ? 'playing' : 'paused';
        toggle.setAttribute('aria-label', playing ? 'Film pausieren' : 'Film abspielen');
      }
      function playFilm() {
        var pending = film.play();
        if (pending && pending.catch) pending.catch(function () { setPlaying(false); });
        setPlaying(true);
      }
      function pauseFilm(remember) {
        if (remember && !film.paused) film.dataset.resume = 'true';
        film.pause();
        if (!remember) setPlaying(false);
      }

      if (reduceMotion) {
        film.removeAttribute('autoplay');
        film.autoplay = false;
        pauseFilm(false);
      } else {
        setPlaying(true);
      }

      if (toggle) {
        toggle.addEventListener('click', function () {
          if (film.paused) playFilm();
          else pauseFilm(false);
        });
      }

      if ('IntersectionObserver' in window) {
        var filmObserver = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              if (film.dataset.resume === 'true') {
                film.dataset.resume = '';
                playFilm();
              }
            } else if (!film.paused) {
              pauseFilm(true);
            }
          });
        }, { threshold: 0.2 });
        filmObserver.observe(film);
      }
    }
    var cols = null;
    var controller = null;
    var timer = null;

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

    /* ---------- Section nachladen und austauschen ---------- */
    function load(url, options) {
      options = options || {};
      var target = new URL(url, window.location.origin);
      var request = new URL(target.href);
      request.searchParams.set('section_id', sectionId);

      if (controller) controller.abort();
      controller = new AbortController();

      var results = $('[data-results]');
      if (results) results.classList.add('is-loading');
      var focusId = document.activeElement && document.activeElement.id;

      fetch(request.pathname + request.search, { signal: controller.signal })
        .then(function (response) {
          if (!response.ok) throw new Error('HTTP ' + response.status);
          return response.text();
        })
        .then(function (html) {
          var doc = new DOMParser().parseFromString(html, 'text/html');
          var next = doc.querySelector('[data-collection]');
          if (!next) throw new Error('Section nicht gefunden');
          apply(next, doc);

          if (options.push !== false) {
            window.history.pushState({}, '', target.pathname + target.search);
          }
          if (focusId) {
            var again = document.getElementById(focusId);
            if (again) again.focus();
          }
          if (options.scroll) {
            var bar = $('[data-filterbar]');
            if (bar) bar.scrollIntoView({ behavior: PS.prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
          }
        })
        .catch(function (error) {
          if (error.name === 'AbortError') return;
          // Im Zweifel normal navigieren, dann stimmt der Stand auf jeden Fall
          window.location.href = target.pathname + target.search;
        });
    }

    function apply(next, doc) {
      // Ergebnisse
      var results = $('[data-results]');
      var nextResults = $('[data-results]', next);
      if (results && nextResults) {
        results.innerHTML = nextResults.innerHTML;
        results.classList.remove('is-loading');
        var grid = $('[data-grid]', results);
        if (grid && cols) grid.dataset.cols = cols;
      }

      // Filterfelder: nur den Inhalt tauschen, damit offene Menüs offen bleiben
      var current = $$('[data-fdrop]');
      var incoming = $$('[data-fdrop]', next);
      if (current.length === incoming.length) {
        current.forEach(function (el, i) {
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
          var current = new URL(window.location.href);
          current.searchParams.set('sort_by', input.value);
          current.searchParams.delete('page');
          url = current.pathname + current.search;
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

    // Klick außerhalb schließt offene Filter-Menüs
    document.addEventListener('click', function (event) {
      if (root.contains(event.target)) return;
      $$('.fdrop__btn[aria-expanded="true"]').forEach(function (own) {
        own.setAttribute('aria-expanded', 'false');
        own.nextElementSibling.hidden = true;
      });
    });

    // Vor und zurück im Browser
    window.addEventListener('popstate', function () {
      load(window.location.pathname + window.location.search, { push: false });
    });
  });
})();
