/* ==========================================================================
   Dienstleistungen: Themen (sections/service-topics.liquid). Verbindet die Themen mit der Kontakt-Box daneben:
   - Öffnet sich ein Thema, stellt die Box dieses Thema ein (Chip gedrückt, Links über PS.refreshContact aus contact.js), still:
     kein Aufleuchten der Box (wirkte beim Nutzer wie Flackern, 7.11.2026). Am Desktop, wo die Box daneben steht, sagt eine
     Live-Region den Wechsel für Screenreader an.
   - „Kontaktiere uns“ in einem Thema (data-ask) stellt das Thema ein; der Link springt zur Box (#kontakt).
   - Sprungziel in der Adresse (#finanzierung, von einer anderen Seite aus Megamenü oder Handy-Menü): Das Thema öffnet sich, ohne
     Ansage. Das Scrollen dorthin übernehmen Browser, Lenis und about-head.js, hier wird nur geöffnet.
   - Klick auf einen Link zu einem Thema dieser Seite (Megamenü, Handy-Menü, Service-Leiste, Hinweisleiste): ebenso. Das muss am
     Klick selbst passieren: Am Desktop gleitet motion.js (Lenis) hin und setzt die Adresse per pushState, ein hashchange kommt dann
     nicht; und ein zweiter Klick auf denselben Anker (Thema inzwischen zugeklappt) ändert die Adresse gar nicht.
   - Theme-Editor: Ein gewählter Block öffnet sein Thema.
   ========================================================================== */
(function () {
  var PS = (window.PS = window.PS || {});
  var wide = window.matchMedia('(min-width: 1024px)');

  function init(root) {
    var box = root.querySelector('.contact-box');
    var live = box && box.querySelector('[data-topic-live]');

    // announce: Thema wurde über ein Thema der Liste gewählt (nicht über die Chips der Box selbst)
    function pick(key, announce) {
      if (!box) return;
      var chosen = null;
      box.querySelectorAll('[data-topic]').forEach(function (c) {
        var on = c.getAttribute('data-topic') === key;
        c.setAttribute('aria-pressed', on ? 'true' : 'false');
        if (on) chosen = c;
      });
      if (typeof PS.refreshContact === 'function') PS.refreshContact(box);
      if (!announce || !chosen || !wide.matches) return;
      if (live) live.textContent = 'Kontakt-Box: Thema ' + chosen.textContent.trim() + ' gewählt';
    }

    root.querySelectorAll('details[data-service-topic]').forEach(function (d) {
      d.addEventListener('toggle', function () {
        var still = d.hasAttribute('data-still');
        d.removeAttribute('data-still');
        if (d.open) pick(d.getAttribute('data-service-topic'), !still);
      });
    });
    root.addEventListener('click', function (e) {
      var ask = e.target.closest('[data-ask]');
      if (ask) pick(ask.getAttribute('data-ask'), false);
    });

    // hash: „#finanzierung“ aus Adresse oder Link
    function openTopic(hash) {
      var id = '';
      try { id = decodeURIComponent((hash || '').slice(1)); } catch (err) { return; }
      if (!id) return;
      var d = document.getElementById(id);
      if (!d || !root.contains(d) || !d.hasAttribute('data-service-topic')) return false;
      if (!d.open) { d.setAttribute('data-still', ''); d.open = true; }
      pick(id, false);
      return true;
    }
    function openHash() { openTopic(location.hash); }
    window.addEventListener('hashchange', openHash);
    openHash();

    // Capture: vor motion.js und dem Browser-Sprung, das Ziel steht also schon offen da. Das Öffnen verschiebt das Ziel selbst nicht,
    // aber Lenis rechnet danach mit alten Werten: mit der alten Seitenlänge (Ziel weiter unten bliebe zu kurz stehen) und, liegt das
    // Thema über dem Bildschirm, mit der Scrollposition von vor der Scroll-Verankerung des Browsers (der hält beim Aufklappen darüber
    // den sichtbaren Inhalt fest und verschiebt dafür die Position; Lenis landete Hunderte Pixel daneben). resize() gleicht beides ab.
    document.addEventListener('click', function (e) {
      if (e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest && e.target.closest('a[href*="#"]');
      if (!a || a.target || a.hash.length < 2 || a.origin !== location.origin || a.pathname !== location.pathname ||
        a.search !== location.search) return;
      if (openTopic(a.hash) && PS.lenis && !PS.lenis.isStopped) PS.lenis.resize();
    }, true);

    // Theme-Editor: gewählter Block = sein Thema offen
    document.addEventListener('shopify:block:select', function (e) {
      var d = e.target && e.target.closest && e.target.closest('details[data-service-topic]');
      if (d && root.contains(d)) { d.setAttribute('data-still', ''); d.open = true; }
    });
  }

  if (typeof PS.on === 'function') PS.on('[data-topics]', init);
  else document.querySelectorAll('[data-topics]').forEach(init);
})();
