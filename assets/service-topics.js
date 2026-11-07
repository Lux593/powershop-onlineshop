/* ==========================================================================
   Dienstleistungen: Themen (sections/service-topics.liquid). Verbindet die Themen mit der Kontakt-Box daneben:
   - Öffnet sich ein Thema, stellt die Box dieses Thema ein (Chip gedrückt, Links über PS.refreshContact aus contact.js), still:
     kein Aufleuchten der Box (wirkte beim Nutzer wie Flackern, 7.11.2026). Am Desktop, wo die Box daneben steht, sagt eine
     Live-Region den Wechsel für Screenreader an.
   - „Kontaktiere uns“ in einem Thema (data-ask) stellt das Thema ein; der Link springt zur Box (#kontakt).
   - Sprungziel in der Adresse (#finanzierung aus Menü oder Service-Leiste): Das Thema öffnet sich, ohne Ansage. Das Scrollen
     dorthin übernehmen Browser, Lenis und about-head.js (Rolltor), hier wird nur geöffnet.
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

    function openHash() {
      var id = '';
      try { id = decodeURIComponent(location.hash.slice(1)); } catch (err) { return; }
      if (!id) return;
      var d = document.getElementById(id);
      if (!d || !root.contains(d) || !d.hasAttribute('data-service-topic')) return;
      if (!d.open) { d.setAttribute('data-still', ''); d.open = true; }
      pick(id, false);
    }
    window.addEventListener('hashchange', openHash);
    openHash();

    // Theme-Editor: gewählter Block = sein Thema offen
    document.addEventListener('shopify:block:select', function (e) {
      var d = e.target && e.target.closest && e.target.closest('details[data-service-topic]');
      if (d && root.contains(d)) { d.setAttribute('data-still', ''); d.open = true; }
    });
  }

  if (typeof PS.on === 'function') PS.on('[data-topics]', init);
  else document.querySelectorAll('[data-topics]').forEach(init);
})();
