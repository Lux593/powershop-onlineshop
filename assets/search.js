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
      if (!q) { render(start); return; }
      if (controller) controller.abort();
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
      if (s) { input.value = s.dataset.suggest; query(); input.focus(); }
    });

    dialog.addEventListener('ps:open', function () { setTimeout(function () { input.focus(); }, 30); });
  });
})();
