/* ==========================================================================
   Suche: Vorschläge über die Shopify Predictive-Search-API (Section-Rendering)
   ========================================================================== */
(function () {
  var PS = window.PS;

  PS.on('#search', function (dialog) {
    var input = dialog.querySelector('[data-search-input]');
    var results = dialog.querySelector('[data-search-results]');
    if (!input || !results) return;

    var start = results.innerHTML;
    var timer = null;
    var controller = null;

    function render(html) { results.innerHTML = html; }

    function query() {
      var q = input.value.trim();
      // Eine laufende Anfrage endet mit dem Begriff: Ihre Antwort käme sonst nach dem Leeren des Feldes und zeigte Treffer zu einem
      // Begriff, der nicht mehr im Feld steht
      if (controller) { controller.abort(); controller = null; }
      if (!q) { render(start); return; }
      controller = new AbortController();
      var url = PS.routes.predictiveSearch +
        '?q=' + encodeURIComponent(q) +
        '&section_id=predictive-search' +
        '&resources[type]=product,collection,page,article' +
        '&resources[limit]=6' +
        '&resources[options][unavailable_products]=last' +
        '&resources[options][fields]=title,product_type,variants.sku,variants.title,vendor,tag';
      fetch(url, { signal: controller.signal })
        .then(function (res) { if (!res.ok) throw new Error('search'); return res.text(); })
        .then(function (html) {
          var doc = new DOMParser().parseFromString(html, 'text/html');
          var section = doc.querySelector('.shopify-section') || doc.body;
          render(section.innerHTML);
        })
        .catch(function (err) { if (err.name !== 'AbortError') render('<p class="search__hint">Die Suche ist gerade nicht erreichbar.</p>'); });
    }

    input.addEventListener('input', function () {
      clearTimeout(timer);
      timer = setTimeout(query, 220);
    });

    results.addEventListener('click', function (e) {
      var s = e.target.closest('[data-suggest]');
      // Der Chip ist ein Link auf die Suchseite (Rückfall ohne Skript): mit Skript füllt er das Feld, Strg/Cmd/Mittelklick öffnen ihn normal
      if (!s || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      input.value = s.dataset.suggest;
      query();
      input.focus();
    });

    dialog.addEventListener('ps:open', function () { setTimeout(function () { input.focus(); }, 30); });

    // Lädt das Skript erst beim ersten Öffnen nach (theme.js, data-lazy-script), ist ps:open schon gefeuert und eine
    // Eingabe davor ohne Vorschläge geblieben
    if (dialog.open) {
      setTimeout(function () { input.focus(); }, 30);
      if (input.value.trim()) query();
    }
  });
})();
