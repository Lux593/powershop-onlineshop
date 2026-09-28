/* ==========================================================================
   Karten & Formatierung – eine Quelle für Produkt- und Bike-Karten
   ========================================================================== */
(function () {
  var fmt = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
  var fmtInt = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
  var num = new Intl.NumberFormat('de-DE');

  PS.money = function (v) { return fmt.format(v); };
  PS.moneyInt = function (v) { return fmtInt.format(v); };
  PS.num = function (v) { return num.format(v); };
  PS.esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  };
  PS.findProduct = function (id) { return PS.products.find(function (p) { return p.id === id; }); };
  PS.findBike = function (id) { return PS.bikes.find(function (b) { return b.id === id; }); };

  PS.stars = function (rating, count) {
    var html = '<span class="rating"><span class="rating__stars" aria-hidden="true">';
    for (var i = 1; i <= 5; i++) html += PS.icon('star', i <= Math.round(rating) ? 'is-full' : '');
    html += '</span><span class="sr-only">' + String(rating).replace('.', ',') + ' von 5 Sternen, </span>(' + count + ')</span>';
    return html;
  };

  // Preisblock mit Streichpreis (§ 11 PAngV: niedrigster Preis der letzten 30 Tage) und Grundpreis
  PS.priceBlock = function (p, opts) {
    opts = opts || {};
    var html = '<p class="price">';
    html += '<span class="price__now">' + (p.fromPrice ? 'ab ' : '') + PS.money(p.price) + (opts.long ? '' : '*') + '</span>';
    if (p.compareAt) html += '<s class="price__old"><span class="sr-only">Vorher </span>' + PS.money(p.compareAt) + '</s>';
    if (p.unit) html += '<span class="price__unit">(' + PS.money(p.price / p.unit.amount) + ' / 1 ' + p.unit.label + ')</span>';
    if (opts.long) {
      html += '<span class="price__note">inkl. MwSt., zzgl. <a class="text-link" href="#" data-todo="Versandkosten">Versandkosten</a>';
      if (p.compareAt) html += ' · Streichpreis = niedrigster Preis der letzten 30 Tage';
      html += '</span>';
    }
    return html + '</p>';
  };

  PS.catLabel = function (p) {
    var sub = (PS.subcats[p.kat] || {})[p.typ];
    return PS.categories[p.kat].title + (sub ? ' · ' + sub : '');
  };

  PS.productCard = function (p) {
    var wished = PS.store && PS.store.isWished(p.id);
    var badges = '';
    if (p.isNew) badges += '<span class="badge">Neu</span>';
    if (p.compareAt) badges += '<span class="badge badge--sale">-' + Math.round((1 - p.price / p.compareAt) * 100) + ' %</span>';

    var quick;
    if (p.sizes && p.sizes.length) {
      quick = '<p class="pcard__quick-label">Größe wählen &amp; in den Warenkorb</p><div class="size-grid">' +
        p.sizes.map(function (s) {
          var out = p.soldOut.indexOf(s) > -1;
          return '<button class="size-chip' + (out ? ' is-soldout' : '') + '" type="button" data-add="' + p.id + '" data-size="' + s + '"' +
            (out ? ' disabled aria-label="Größe ' + s + ' ausverkauft"' : ' aria-label="Größe ' + s + ' in den Warenkorb"') + '>' + s + '</button>';
        }).join('') + '</div>';
    } else {
      quick = '<button class="btn btn--secondary btn--block btn--sm" type="button" data-add="' + p.id + '">' + PS.icon('shopping-bag') + 'In den Warenkorb</button>';
    }

    var extra = '';
    if (p.kat === 'teile') {
      extra = '<p class="pcard__fits">' + PS.icon('check') + 'Passt für: ' + PS.esc(p.fits) + '</p>';
    } else if (p.colors.length > 1) {
      extra = '<ul class="swatches" aria-label="' + p.colors.length + ' Farben">' +
        p.colors.slice(0, 4).map(function (c) { return '<li class="swatch" style="background:' + c.hex + '" title="' + c.name + '"></li>'; }).join('') +
        (p.colors.length > 4 ? '<li class="swatches__more">+' + (p.colors.length - 4) + '</li>' : '') + '</ul>';
    }

    return '<article class="pcard" data-id="' + p.id + '">' +
      '<div class="pcard__media">' +
        '<a href="' + p.url + '" tabindex="-1" aria-hidden="true">' +
          '<img class="pcard__img" src="' + p.image + '" alt="" width="800" height="1000" loading="lazy">' +
          '<img class="pcard__img pcard__img--alt" src="' + p.image2 + '" alt="" width="800" height="1000" loading="lazy">' +
        '</a>' +
        (badges ? '<div class="pcard__badges">' + badges + '</div>' : '') +
        '<button class="wish-btn" type="button" data-wish="' + p.id + '" aria-pressed="' + !!wished + '" aria-label="' + PS.esc(p.name) + ' merken">' + PS.icon('heart') + '</button>' +
        '<div class="pcard__quick">' + quick + '</div>' +
        '<button class="pcard__plus" type="button" data-quick-toggle aria-expanded="false" aria-label="Schnell hinzufügen: ' + PS.esc(p.name) + '">' + PS.icon('plus') + '</button>' +
      '</div>' +
      '<div class="pcard__body">' +
        '<p class="caption muted">' + PS.esc(p.kat === 'teile' ? p.brand : PS.catLabel(p)) + '</p>' +
        '<h3 class="pcard__title"><a href="' + p.url + '">' + PS.esc(p.name) + '</a></h3>' +
        PS.stars(p.rating, p.reviews) +
        PS.priceBlock(p) +
        extra +
      '</div>' +
    '</article>';
  };

  PS.taxNote = function (b) {
    return b.tax === '25a' ? 'MwSt. nicht ausweisbar (Differenzbesteuerung § 25a UStG)' : 'inkl. 19 % MwSt.';
  };

  PS.bikeBadge = function (b) {
    if (b.status === 'reserviert') return '<span class="badge badge--reserved">' + PS.icon('clock') + 'Reserviert</span>';
    if (b.zustand === 'neu') return '<span class="badge">Neu</span>';
    if (b.zustand === 'vorfuehrer') return '<span class="badge badge--demo">Vorführer</span>';
    return '<span class="badge badge--used">Gebraucht</span>';
  };

  PS.bikeCard = function (b) {
    var first = b.zustand === 'neu' ? 'Modelljahr ' + b.year : 'EZ ' + b.ez;
    return '<article class="bcard' + (b.status === 'reserviert' ? ' is-reserved' : '') + '">' +
      '<a class="bcard__media" href="' + b.url + '" tabindex="-1" aria-hidden="true">' +
        '<img src="' + b.image + '" alt="" width="1600" height="1000" loading="lazy">' + PS.bikeBadge(b) +
      '</a>' +
      '<div class="bcard__body">' +
        '<p class="eyebrow">' + PS.esc(b.family) + '</p>' +
        '<h3 class="bcard__title"><a href="' + b.url + '">' + PS.esc(b.name) + '</a></h3>' +
        '<ul class="facts">' +
          '<li>' + PS.icon('calendar') + first + '</li>' +
          '<li>' + PS.icon('gauge') + PS.num(b.km) + ' km</li>' +
          '<li>' + PS.icon('zap') + b.kw + ' kW (' + b.ps + ' PS)</li>' +
        '</ul>' +
        '<div class="bcard__price"><strong>' + PS.moneyInt(b.price) + '</strong>' +
          '<span class="caption muted">' + (b.zustand === 'neu' ? 'Gesamtpreis inkl. Überführung · ' : '') + PS.taxNote(b) + '</span></div>' +
        '<div class="bcard__actions">' +
          '<a class="btn btn--outline-dark btn--sm" href="' + b.url + '">Details</a>' +
          '<a class="btn btn--primary btn--sm" href="' + b.url + '#kontakt">Anfragen</a>' +
        '</div>' +
      '</div>' +
    '</article>';
  };
})();
