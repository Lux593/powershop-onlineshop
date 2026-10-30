/* ==========================================================================
   Header: Megamenü (Maus, Tastatur, Touch), Überlagerung über dem Hero, Ausblenden beim Scrollen.
   Listener an document und window hängen an einem AbortController: ein Section-Reload im Theme-Editor räumt die alten ab.
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
      // Jedes Öffnen beginnt mit zugeklappten Kacheln. Das Menü rendert dann noch nicht (header.css), es klappt also nichts sichtbar zu.
      var groups = li.querySelector('[data-mega-groups]');
      if (open && groups && !li.classList.contains('is-open')) showGroup(groups, null);
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
      // Safari fokussiert Knöpfe beim Klick nicht: ein Klick auf eine Kachel, während ein Link im Menü den Fokus hat, meldet
      // focusout ohne Ziel. Unter der Maus bleibt das Menü offen, mouseleave schließt es.
      li.addEventListener('focusout', function (e) { if (!li.contains(e.relatedTarget) && !li.matches(':hover')) setOpen(li, false); });
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

    // Kacheln im Megamenü (snippets/mega-menu.liquid): alle Gruppen sind zu, ein Klick klappt die Links der Kachel unter der Reihe
    // auf und die offene zu, ein Klick auf die offene schließt sie. Die Gruppen liegen übereinander, is-active blendet über, is-closed
    // klappt den Bereich ein. showGroup(mega, null) schließt alle.
    function showGroup(mega, tile) {
      mega.querySelectorAll('.mega-tile[aria-controls]').forEach(function (other) {
        var on = other === tile;
        other.setAttribute('aria-expanded', on);
        document.getElementById(other.getAttribute('aria-controls')).classList.toggle('is-active', on);
      });
      mega.querySelector('.mega__drawer').classList.toggle('is-closed', !tile);
    }
    header.querySelectorAll('[data-mega-groups]').forEach(function (mega) {
      mega.querySelectorAll('.mega-tile[aria-controls]').forEach(function (tile) {
        tile.addEventListener('click', function () {
          showGroup(mega, tile.getAttribute('aria-expanded') === 'true' ? null : tile);
        });
      });
    });

    // Das geschlossene Menü rendert nicht (header.css): seine lazy Bilder laden nicht von selbst. Nach Load plus Idle holen, ohne
    // Datensparen; ein Hover davor lädt sie ohnehin sofort. Ohne Megamenü (Handy) dieselben Fotos für die Bildstreifen im Handy-Menü:
    // in der geschlossenen Schublade und zugeklappten Gruppen kämen sie sonst erst beim Aufklappen. Ein Tipp aufs Menü-Symbol holt
    // sie auch bei Datensparen, bevor die erste Gruppe aufgeht.
    var drawer = document.getElementById('mobile-menu');
    function eager(scope) {
      if (scope) scope.querySelectorAll('img[loading="lazy"]').forEach(function (img) { img.loading = 'eager'; });
    }
    function warm() {
      var con = navigator.connection || {};
      if (con.saveData || /(^|-)[23]g$/.test(con.effectiveType || '')) return;
      if (items.length && items[0].getClientRects().length) header.querySelectorAll('.mega').forEach(eager);
      else eager(drawer);
    }
    var burger = header.querySelector('[data-open="mobile-menu"]');
    if (burger) ['pointerdown', 'click'].forEach(function (type) { burger.addEventListener(type, function () { eager(drawer); }); });
    function later() { (window.requestIdleCallback || function (f) { setTimeout(f, 300); })(warm, { timeout: 3000 }); }
    if (document.readyState === 'complete') later();
    else window.addEventListener('load', later, { once: true, signal: ctrl.signal });

    /* ---------------- Überlagerung (Startseite) und Ausblenden beim Scrollen ----------------
       is-solid: Header schwarz statt transparent über dem Hero (ab 40 px Scroll, bei offenem Menü); ob der Hero darunter liegt,
       entscheidet header.css. is-away: ab 400 px Tiefe beim Runterscrollen weggeschoben, --header-shown (1/0) lenkt die
       Sticky-Offsets. Nie bei Menü, Dialog oder Fokus im Header (WCAG 2.4.11), nicht während Tab-Sprung oder Anker scrollen
       (der einfahrende Header verdeckte das Ziel). Ausblenden nur mit html.has-motion. PS.headerHold(true) hält ihn eingefahren
       (Über uns: solange die Bühne gepinnt ist). */
    var wrap = header.closest('.site-header-wrap') || header;
    var over = document.body.hasAttribute('data-header-overlay');
    var shown = true, lastY = window.scrollY, quiet = 0, held = false, queued = false, accountOpen = false;
    // Gezieltes Scrollen aus anderen Modulen (z. B. Umbau-Buch am Handy): Header bleibt für ms so, wie er gerade ist
    PS.headerQuiet = function (ms) { quiet = Math.max(quiet, Date.now() + (ms || 1600)); };
    // Festhalten (Über uns, solange die Bühne gepinnt ist): mit true fährt der Header ein und bleibt auch beim Runterscrollen, mit false
    // gilt wieder das normale Verhalten. Kein Zähler: Das letzte Wort gilt, mehrfaches true ändert nichts.
    PS.headerHold = function (on) { held = !!on; queue(); };

    function show(on) {
      if (on === shown) return;
      shown = on;
      wrap.classList.toggle('is-away', !on);
      html.style.setProperty('--header-shown', on ? 1 : 0);
    }
    function update() {
      queued = false;
      var y = window.scrollY, d = y - lastY;
      var menu = accountOpen || !!header.querySelector('.mainnav__item.is-open');
      header.classList.toggle('is-solid', over && (y >= 40 || menu));
      if (!html.classList.contains('has-motion') || y < 400 || menu || held || document.body.classList.contains('is-locked') ||
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
    // Anker: Header bleibt, wie er ist (scroll-padding-top passt dazu)
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href*="#"]');
      if (a && a.hash.length > 1) quiet = Date.now() + 1600;
    }, sig);
    // Direktaufruf mit Anker und Neuladen/Zurück mit wiederhergestellter Position: der Browser springt selbst, das ist kein Runterscrollen
    var nav = window.performance && performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
    if (location.hash.length > 1 || (nav && (nav.type === 'reload' || nav.type === 'back_forward'))) {
      quiet = Date.now() + 1600;
      window.addEventListener('load', function () { quiet = Math.max(quiet, Date.now() + 1000); }, { once: true, signal: ctrl.signal });
    }
    // Zurück aus dem bfcache: ein per Hover geöffnetes Megamenü bliebe sonst über dem Hero offen
    window.addEventListener('pageshow', function (e) {
      if (e.persisted) items.forEach(function (li) { setOpen(li, false); });
      queue();
    }, sig);
    // Reduced-Motion zur Laufzeit: motion.js entfernt has-motion, ein weggeschobener Header kommt zurück
    var rm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)');
    if (rm && rm.addEventListener) rm.addEventListener('change', queue, sig);
    /* ---------------- Konto-Fenster (shopify-account) ----------------
       Lage des Fensters (header.css): Oberkante = Unterkante des Headers (oben liegt die Ankündigungsleiste darüber, nach dem Scrollen
       nicht mehr), rechter Rand = rechte Inhaltskante. Gemessen vor und beim Öffnen; die Komponente hält dabei den Platz des
       Scrollbalkens frei (scrollbar-gutter: stable), mit Scrollbalken bleibt die Inhaltskante, wo sie war. Offen zählt das Fenster wie ein offenes
       Megamenü: Header schwarz über dem Hero, nie weggeschoben (Ereignisse open/close der Komponente). */
    var account = header.querySelector('[data-account]');
    if (account) {
      var bar = header.querySelector('.header__bar');
      var measure = function () {
        var r = bar.getBoundingClientRect();
        var edge = r.right - parseFloat(getComputedStyle(bar).paddingRight);
        account.style.setProperty('--account-top', Math.round(header.getBoundingClientRect().bottom) + 'px');
        // Breite von html statt clientWidth: mit freigehaltenem Scrollbalken-Platz meldet Chrome clientWidth samt diesem Platz
        account.style.setProperty('--account-right', Math.max(0, Math.round(html.getBoundingClientRect().width - edge)) + 'px');
      };
      // Tasten und Klicks im offenen Fenster (E-Mail-Feld) laufen ebenfalls hier durch: dann nicht messen
      account.addEventListener('pointerdown', function () { if (!accountOpen) measure(); }, sig);
      account.addEventListener('keydown', function (e) { if (!accountOpen && (e.key === 'Enter' || e.key === ' ')) measure(); }, sig);
      // Beim Öffnen noch einmal: auf Seiten ohne Scrollbalken kommt erst jetzt der freigehaltene Platz dazu
      account.addEventListener('open', function () { accountOpen = true; account.classList.add('is-open'); measure(); update(); }, sig);
      account.addEventListener('close', function () { accountOpen = false; account.classList.remove('is-open'); update(); }, sig);
      // Zurück aus dem bfcache: Zustand am Fenster selbst ablesen, falls dabei kein close kam
      window.addEventListener('pageshow', function (e) {
        if (!e.persisted) return;
        accountOpen = !!(account.shadowRoot && account.shadowRoot.querySelector('dialog[open]'));
        account.classList.toggle('is-open', accountOpen);
      }, sig);
      window.addEventListener('resize', measure, { passive: true, signal: ctrl.signal });
    }

    // Header im Editor entfernt
    document.addEventListener('shopify:section:unload', function (e) { if (e.target.contains(header)) ctrl.abort(); }, sig);
    update();
  });
})();
