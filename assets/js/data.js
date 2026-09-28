/* ==========================================================================
   Mock-Daten für das Mockup. Alle Firmen- und Kontaktdaten sind PLATZHALTER.
   In Shopify kommen Produkte, Metafelder und Metaobjekte an diese Stelle.
   ========================================================================== */
window.PS = window.PS || {};

PS.shop = {
  // --- Von euch zu liefern (Platzhalter) ---
  name: 'Power Shop',
  company: 'Power Shop GmbH (Platzhalter)',
  address: 'Musterstraße 1, 12345 Musterstadt',
  phone: '+49 000 1234567',
  phoneHref: '+490001234567',
  whatsapp: '490001234567',
  email: 'verkauf@power-shop.example',
  hours: [
    { label: 'Mo–Fr', text: '09:00–18:00 Uhr', days: [1, 2, 3, 4, 5], from: 9, to: 18 },
    { label: 'Sa', text: '09:00–14:00 Uhr', days: [6], from: 9, to: 14 },
  ],
  contactPerson: { name: 'Max Mustermann', role: 'Verkaufsberater Motorräder', img: 'assets/img/team-verkauf.jpg' },
  freeShipping: 100,       // Versandkostenfrei ab (€)
  shippingCost: 4.95,      // Versandkosten darunter (€)
  deliveryTime: '2–4 Werktage',
  returnDays: 30,          // freiwillige Rückgabefrist (gesetzl. Widerruf: 14 Tage)
  reservation: { fee: 250, hours: 48 },
  newsletterDiscount: 10,
};

PS.families = ['Cruiser', 'Grand American Touring', 'Sport', 'Adventure Touring', 'Trike', 'CVO'];
PS.familySlug = { 'Cruiser': 'cruiser', 'Grand American Touring': 'touring', 'Sport': 'sport', 'Adventure Touring': 'adventure', 'Trike': 'trike', 'CVO': 'cvo' };

PS.models = {
  'Cruiser': ['Street Bob', 'Fat Bob', 'Low Rider S', 'Low Rider ST', 'Breakout', 'Fat Boy', 'Heritage Classic', 'Softail Standard'],
  'Grand American Touring': ['Street Glide', 'Road Glide', 'Road King Special', 'Ultra Limited'],
  'Sport': ['Nightster', 'Sportster S'],
  'Adventure Touring': ['Pan America 1250 Special'],
  'Trike': ['Tri Glide Ultra', 'Freewheeler', 'Road Glide 3'],
  'CVO': ['CVO Street Glide', 'CVO Road Glide'],
};

PS.colors = {
  schwarz: { name: 'Schwarz', hex: '#141414' },
  braun: { name: 'Braun', hex: '#6b4226' },
  grau: { name: 'Grau', hex: '#8a8a8a' },
  oliv: { name: 'Oliv', hex: '#5b5e3a' },
  weiss: { name: 'Weiß', hex: '#f4f4f2' },
  orange: { name: 'Orange', hex: '#f26722' },
  rot: { name: 'Bordeaux', hex: '#7d1f24' },
  blau: { name: 'Denim', hex: '#3d5a80' },
  sand: { name: 'Sand', hex: '#c8b79a' },
  chrom: { name: 'Chrom', hex: '#c9ccd1' },
};

PS.subcats = {
  herren: { oberbekleidung: 'Oberbekleidung', motorradbekleidung: 'Motorradbekleidung', hosen: 'Hosen', stiefel: 'Stiefel & Schuhe' },
  damen: { oberbekleidung: 'Oberbekleidung', motorradbekleidung: 'Motorradbekleidung', hosen: 'Hosen', stiefel: 'Stiefel & Schuhe' },
  teile: { motor: 'Motor & Performance', auspuff: 'Auspuff', fahrwerk: 'Fahrwerk & Bremsen', beleuchtung: 'Beleuchtung', lenker: 'Lenker & Bedienelemente', sitze: 'Sitze', gepaeck: 'Gepäck & Taschen', raeder: 'Räder', elektronik: 'Elektronik & Audio', wartung: 'Wartung & Pflege' },
  accessoires: { helme: 'Helme & Brillen', taschen: 'Taschen & Rucksäcke', caps: 'Caps & Mützen', leder: 'Gürtel & Geldbörsen', schmuck: 'Schmuck & Uhren', home: 'Home & Garage', gutscheine: 'Geschenkgutscheine' },
};

// Hilfsfunktion für kompakte Produktdefinitionen
function P(o) { return Object.assign({ rating: 4.6, reviews: 12, isNew: false, sale: false }, o); }

PS.products = [
  // ---------------- Herren ----------------
  // h1–h5: Neuheiten von harley-davidson.com/ch (Herren). Preise in CHF, im Mockup als € formatiert. Größen standen auf der Liste nicht.
  P({ id: 'h1', kat: 'herren', typ: 'oberbekleidung', name: 'Vintage Plaid Short Sleeve Shirt für Herren', partNo: '96196-26VM', price: 108, colors: ['orange'], sizes: ['S', 'M', 'L', 'XL', 'XXL'], sizeType: 'oberteile', collection: 'Neuheiten', img: 'hd1', img2: 'hd1b', isNew: true, rating: 0, reviews: 0 }),
  P({ id: 'h2', kat: 'herren', typ: 'oberbekleidung', name: 'Idyll winddichte Softshell-Jacke für Herren', partNo: '97410-26RM', price: 201, colors: ['oliv'], sizes: ['S', 'M', 'L', 'XL', 'XXL'], sizeType: 'oberteile', collection: 'Neuheiten', img: 'hd2', img2: 'hd2b', isNew: true, rating: 0, reviews: 0 }),
  P({ id: 'h3', kat: 'herren', typ: 'oberbekleidung', name: 'Harley-Davidson x Realtree Idyll Jacke für Herren', partNo: '97417-26VM', price: 230, colors: ['oliv'], sizes: ['S', 'M', 'L', 'XL', 'XXL'], sizeType: 'oberteile', collection: 'Neuheiten', img: 'hd3', img2: 'hd3b', isNew: true, rating: 0, reviews: 0 }),
  P({ id: 'h4', kat: 'herren', typ: 'oberbekleidung', name: 'H-D American Classic Railroad Stripe Shirt für Herren', partNo: '96537-26VM', price: 122, colors: ['schwarz'], sizes: ['S', 'M', 'L', 'XL', 'XXL'], sizeType: 'oberteile', collection: 'Neuheiten', img: 'hd4', img2: 'hd4b', isNew: true, rating: 0, reviews: 0 }),
  P({ id: 'h5', kat: 'herren', typ: 'oberbekleidung', name: 'H-D American Classic Eagle Long Sleeve Graphic Tee für Herren', partNo: '96498-26VM', price: 65, colors: ['schwarz'], sizes: ['S', 'M', 'L', 'XL', 'XXL'], sizeType: 'oberteile', collection: 'Neuheiten', img: 'hd5', img2: 'hd5b', isNew: true, rating: 0, reviews: 0 }),
  // h6–h8: Sommer-Motorradausrüstung von harley-davidson.com/ch. Preise in CHF.
  P({ id: 'h6', kat: 'herren', typ: 'motorradbekleidung', name: 'Men\'s Willie G Skull Mesh Riding Jacket', partNo: '97131-26VM', price: 338, colors: ['schwarz'], sizes: ['S', 'M', 'L', 'XL', 'XXL'], sizeType: 'oberteile', collection: 'Sommer', img: 'hd6', img2: 'hd6b', isNew: true, rating: 0, reviews: 0 }),
  P({ id: 'h7', kat: 'herren', typ: 'motorradbekleidung', name: 'Men\'s Willie G Skull Soft Shell Riding Jacket', partNo: '97122-26VM', price: 311, colors: ['grau'], sizes: ['S', 'M', 'L', 'XL', 'XXL'], sizeType: 'oberteile', collection: 'Sommer', img: 'hd7', img2: 'hd7b', isNew: true, rating: 0, reviews: 0 }),
  P({ id: 'h8', kat: 'herren', typ: 'motorradbekleidung', name: 'Men\'s Willie G Skull Riding Chore Jacket', partNo: '97123-26VM', price: 406, colors: ['grau'], sizes: ['S', 'M', 'L', 'XL', 'XXL'], sizeType: 'oberteile', collection: 'Sommer', img: 'hd8', img2: 'hd8b', isNew: true, rating: 0, reviews: 0 }),

  // ---------------- Damen ----------------
  P({ id: 'd1', kat: 'damen', typ: 'oberbekleidung', name: 'Damen Lederjacke „Midnight“', price: 399.95, colors: ['schwarz', 'rot'], sizes: ['XS', 'S', 'M', 'L', 'XL'], soldOut: ['XS'], sizeType: 'oberteile', collection: 'Herbst/Winter', img: 1, img2: 6, isNew: true, rating: 4.9, reviews: 38 }),
  P({ id: 'd2', kat: 'damen', typ: 'oberbekleidung', name: 'T-Shirt „Wings“ Slim Fit', price: 34.95, colors: ['schwarz', 'weiss', 'orange', 'grau'], sizes: ['XS', 'S', 'M', 'L', 'XL'], sizeType: 'oberteile', collection: 'Essentials', img: 2, img2: 5, isNew: true, rating: 4.6, reviews: 74 }),
  P({ id: 'd3', kat: 'damen', typ: 'oberbekleidung', name: 'Cropped Hoodie „Open Road“', price: 79.95, compareAt: 94.95, colors: ['schwarz', 'sand'], sizes: ['XS', 'S', 'M', 'L', 'XL'], sizeType: 'oberteile', collection: 'Custom Garage', img: 3, img2: 2, sale: true, rating: 4.5, reviews: 19 }),
  P({ id: 'd4', kat: 'damen', typ: 'hosen', name: 'Riding-Jeans „Skyline“ mit Protektoren', price: 169.95, colors: ['blau', 'schwarz'], sizes: ['26', '28', '30', '32', '34'], sizeType: 'hosen', collection: 'Riding Gear', img: 4, img2: 1, rating: 4.5, reviews: 16 }),
  P({ id: 'd5', kat: 'damen', typ: 'oberbekleidung', name: 'Bluse „Liberty“ Print', price: 64.95, colors: ['schwarz', 'weiss'], sizes: ['XS', 'S', 'M', 'L', 'XL'], sizeType: 'oberteile', collection: 'Herbst/Winter', img: 5, img2: 2, isNew: true, rating: 4.3, reviews: 8 }),
  P({ id: 'd6', kat: 'damen', typ: 'oberbekleidung', name: 'Lederweste „Rebel“', price: 199.95, colors: ['schwarz'], sizes: ['XS', 'S', 'M', 'L', 'XL'], sizeType: 'oberteile', collection: 'Custom Garage', img: 6, img2: 1, rating: 4.7, reviews: 12 }),
  P({ id: 'd7', kat: 'damen', typ: 'motorradbekleidung', name: 'Textiljacke „Wanderlust“', price: 299.95, colors: ['schwarz', 'grau'], sizes: ['XS', 'S', 'M', 'L', 'XL'], sizeType: 'oberteile', collection: 'Riding Gear', img: 1, img2: 3, isNew: true, rating: 4.6, reviews: 21 }),
  P({ id: 'd8', kat: 'damen', typ: 'stiefel', name: 'Bikerstiefel „Lexington“', price: 189.95, compareAt: 219.95, colors: ['schwarz', 'braun'], sizes: ['36', '37', '38', '39', '40', '41'], sizeType: 'stiefel', collection: 'Riding Gear', img: 4, img2: 6, sale: true, rating: 4.4, reviews: 17 }),
  P({ id: 'd9', kat: 'damen', typ: 'motorradbekleidung', name: 'Handschuhe „Road Queen“', price: 59.95, colors: ['schwarz'], sizes: ['XS', 'S', 'M', 'L'], sizeType: 'handschuhe', collection: 'Riding Gear', img: 6, img2: 2, rating: 4.5, reviews: 23 }),
  P({ id: 'd10', kat: 'damen', typ: 'oberbekleidung', name: 'Sweatshirt „Since 1903“', price: 69.95, colors: ['grau', 'schwarz', 'rot'], sizes: ['XS', 'S', 'M', 'L', 'XL'], sizeType: 'oberteile', collection: 'Essentials', img: 3, img2: 5, rating: 4.6, reviews: 30 }),
  P({ id: 'd11', kat: 'damen', typ: 'oberbekleidung', name: 'Tanktop „Freedom“', price: 29.95, colors: ['schwarz', 'weiss'], sizes: ['XS', 'S', 'M', 'L', 'XL'], sizeType: 'oberteile', collection: 'Essentials', img: 2, img2: 4, rating: 4.2, reviews: 11 }),
  P({ id: 'd12', kat: 'damen', typ: 'hosen', name: 'Leggings „Moto“ mit Stretch', price: 59.95, colors: ['schwarz'], sizes: ['XS', 'S', 'M', 'L', 'XL'], sizeType: 'hosen', collection: 'Herbst/Winter', img: 4, img2: 3, isNew: true, rating: 4.4, reviews: 9 }),

  // ---------------- Teile & Zubehör ----------------
  P({ id: 't1', kat: 'teile', typ: 'auspuff', name: 'Slip-On Auspuff „Street Cannon“ Chrom', brand: 'Screamin’ Eagle', partNo: '64900-24', price: 1149.00, families: ['Grand American Touring'], years: [2017, 2024], approval: 'abe', stock: 'lager', img: 1, img2: 4, isNew: true, rating: 4.8, reviews: 19, colors: ['chrom'] }),
  P({ id: 't2', kat: 'teile', typ: 'motor', name: 'Heavy Breather Luftfilter-Kit', brand: 'Screamin’ Eagle', partNo: '29400-42', price: 489.00, families: ['Cruiser', 'Grand American Touring'], years: [2018, 2024], approval: 'eintragung', stock: 'lager', img: 2, img2: 1, rating: 4.7, reviews: 64 }),
  P({ id: 't3', kat: 'teile', typ: 'beleuchtung', name: 'Daymaker LED-Scheinwerfer 7″', brand: 'H-D Original', partNo: '67700-35', price: 529.00, families: ['Cruiser', 'Grand American Touring', 'Trike'], years: [2014, 2025], approval: 'abe', stock: 'lager', img: 3, img2: 2, isNew: true, rating: 4.9, reviews: 88 }),
  P({ id: 't4', kat: 'teile', typ: 'lenker', name: 'Mini-Ape Lenker 12″ Schwarz', brand: 'H-D Original', partNo: '55800-86', price: 379.00, families: ['Cruiser'], years: [2018, 2024], approval: 'eintragung', stock: 'bestellung', img: 4, img2: 5, rating: 4.5, reviews: 23 }),
  P({ id: 't5', kat: 'teile', typ: 'sitze', name: 'Solo-Sitz „Brawler“ Leder', brand: 'H-D Original', partNo: '52000-11', price: 449.00, families: ['Cruiser'], years: [2018, 2024], approval: 'abe', stock: 'lager', img: 5, img2: 4, rating: 4.6, reviews: 15 }),
  P({ id: 't6', kat: 'teile', typ: 'wartung', name: 'Motoröl SYN3 20W-50, 1 l', brand: 'H-D Original', partNo: '62600-01', price: 21.95, unit: { amount: 1, label: 'l' }, families: ['Cruiser', 'Grand American Touring', 'Sport', 'Trike', 'CVO'], years: [2017, 2026], approval: 'none', stock: 'lager', img: 6, img2: 6, rating: 4.9, reviews: 211 }),
  P({ id: 't7', kat: 'teile', typ: 'auspuff', name: 'Race-Auspuffanlage 2-in-1 „Track Only“', brand: 'Zubehör', partNo: '64700-77', price: 1690.00, families: ['Sport'], years: [2021, 2026], approval: 'keine', stock: 'bestellung', img: 1, img2: 2, rating: 4.4, reviews: 6 }),
  P({ id: 't8', kat: 'teile', typ: 'gepaeck', name: 'Tour-Pak Gepäckträger Chrom', brand: 'H-D Original', partNo: '50300-27', price: 319.00, compareAt: 369.00, families: ['Grand American Touring'], years: [2014, 2024], approval: 'abe', stock: 'lager', img: 5, img2: 3, sale: true, rating: 4.6, reviews: 29 }),
  P({ id: 't9', kat: 'teile', typ: 'fahrwerk', name: 'Premium Federbein-Kit, einstellbar', brand: 'H-D Original', partNo: '54000-48', price: 1249.00, families: ['Grand American Touring'], years: [2017, 2024], approval: 'abe', stock: 'bestellung', img: 2, img2: 4, isNew: true, rating: 4.8, reviews: 12 }),
  P({ id: 't10', kat: 'teile', typ: 'raeder', name: 'Gussrad „Prodigy“ 19″ vorne', brand: 'H-D Original', partNo: '43300-58', price: 899.00, families: ['Cruiser'], years: [2018, 2024], approval: 'eintragung', stock: 'bestellung', img: 4, img2: 1, rating: 4.3, reviews: 5 }),
  P({ id: 't11', kat: 'teile', typ: 'elektronik', name: 'Boom! Audio Lautsprecher-Kit Stage II', brand: 'H-D Original', partNo: '76000-93', price: 749.00, families: ['Grand American Touring', 'CVO'], years: [2014, 2024], approval: 'abe', stock: 'lager', img: 3, img2: 5, rating: 4.7, reviews: 31 }),
  P({ id: 't12', kat: 'teile', typ: 'wartung', name: 'Pflegeset „Chrom & Leder“', brand: 'H-D Original', partNo: '93600-12', price: 39.95, compareAt: 44.95, unit: { amount: 0.5, label: 'l' }, families: ['Cruiser', 'Grand American Touring', 'Sport', 'Adventure Touring', 'Trike', 'CVO'], years: [2000, 2026], approval: 'none', stock: 'lager', img: 6, img2: 2, sale: true, rating: 4.8, reviews: 57 }),

  // ---------------- Accessoires ----------------
  P({ id: 'a1', kat: 'accessoires', typ: 'helme', name: 'Jethelm „Outrider“ mit Sonnenblende', price: 279.95, colors: ['schwarz', 'weiss'], sizes: ['S', 'M', 'L', 'XL'], sizeType: 'helme', img: 1, img2: 2, isNew: true, rating: 4.7, reviews: 26, gpsrNote: 'ECE 22.06 geprüft' }),
  P({ id: 'a2', kat: 'accessoires', typ: 'helme', name: 'Sonnenbrille „Night Rider“ polarisiert', price: 119.95, colors: ['schwarz'], img: 2, img2: 1, rating: 4.5, reviews: 18 }),
  P({ id: 'a3', kat: 'accessoires', typ: 'caps', name: 'Trucker Cap „Bar & Shield“', price: 34.95, colors: ['schwarz', 'oliv', 'orange'], img: 3, img2: 5, isNew: true, rating: 4.6, reviews: 45 }),
  P({ id: 'a4', kat: 'accessoires', typ: 'leder', name: 'Biker-Geldbörse mit Kette', price: 89.95, compareAt: 99.95, colors: ['schwarz', 'braun'], img: 4, img2: 3, sale: true, rating: 4.7, reviews: 33 }),
  P({ id: 'a5', kat: 'accessoires', typ: 'home', name: 'Emaille-Tasse „Garage“', price: 19.95, colors: ['schwarz', 'weiss'], img: 5, img2: 6, rating: 4.8, reviews: 62 }),
  P({ id: 'a6', kat: 'accessoires', typ: 'taschen', name: 'Rucksack „Commuter“ wasserabweisend', price: 129.95, colors: ['schwarz'], img: 6, img2: 4, isNew: true, rating: 4.6, reviews: 14 }),
  P({ id: 'a7', kat: 'accessoires', typ: 'leder', name: 'Ledergürtel „Buckle“', price: 59.95, colors: ['schwarz', 'braun'], img: 4, img2: 1, rating: 4.4, reviews: 21 }),
  P({ id: 'a8', kat: 'accessoires', typ: 'schmuck', name: 'Siegelring „Skull“ Edelstahl', price: 49.95, colors: ['chrom'], img: 2, img2: 4, rating: 4.3, reviews: 10 }),
  P({ id: 'a9', kat: 'accessoires', typ: 'caps', name: 'Beanie „Winter Ride“', price: 29.95, colors: ['schwarz', 'grau', 'orange'], img: 3, img2: 2, isNew: true, rating: 4.7, reviews: 16 }),
  P({ id: 'a10', kat: 'accessoires', typ: 'gutscheine', name: 'Geschenkgutschein (25–500 €)', price: 25.00, fromPrice: true, img: 5, img2: 3, rating: 5.0, reviews: 40 }),
];

// Bildpfade, Varianten-Standardwerte und Kompatibilität ergänzen
(function () {
  var pool = { herren: 'herren', damen: 'damen', teile: 'teile', accessoires: 'acc' };
  PS.products.forEach(function (p, i) {
    var k = pool[p.kat];
    p.image = 'assets/img/p-' + k + '-' + p.img + '.jpg';
    p.image2 = 'assets/img/p-' + k + '-' + p.img2 + '.jpg';
    p.colors = (p.colors || []).map(function (c) { return Object.assign({ key: c }, PS.colors[c]); });
    p.soldOut = p.soldOut || [];
    p.date = 100 - i; // Sortierung „Neuheiten“
    p.url = (p.kat === 'teile' ? 'produkt-teil.html' : 'produkt-bekleidung.html') + '?id=' + p.id;
    if (p.kat === 'teile') {
      p.compat = [];
      p.families.forEach(function (f) {
        PS.models[f].forEach(function (m) { p.compat.push({ family: f, model: m, from: p.years[0], to: p.years[1] }); });
      });
      p.fits = p.families.length > 2 ? p.families.length + ' Modellfamilien' : p.families.join(', ');
      p.fits += ' ' + p.years[0] + '–' + p.years[1];
    }
  });
})();

// ---------------- Motorräder ----------------
// Katalog 2026 von harley-davidson.com/ch/de/motorcycles/touring.html. Preise sind CHF-Ab-Preise, im Mockup als € formatiert.
PS.bikes = [
  { id: 'b1', name: 'Street Glide', family: 'Grand American Touring', zustand: 'neu', year: 2026, ez: null, km: 0, kw: null, ps: null, ccm: null, color: 'Blau', price: 31500, tax: 'regel', hu: null, fzgNr: 'M75B', img: 1, ab: true, heroPoster: 'Street Glide', heroBlurb: 'Die tiefe Scheibe für die offene Strasse.', heroLine: 'Touring', heroColor: 'Schwarz', heroAlt: 'Zwei Fahrer auf einer Street Glide, unterwegs auf der Autobahn', heroImage: 'assets/img/hero-ride-street.png' },
  { id: 'b2', name: 'Road Glide', family: 'Grand American Touring', zustand: 'neu', year: 2026, ez: null, km: 0, kw: null, ps: null, ccm: null, color: 'Türkis', price: 31500, tax: 'regel', hu: null, fzgNr: 'M79B', img: 2, ab: true, heroPoster: 'Road Glide', heroBlurb: 'Die feste Verkleidung für lange Strecken.', heroLine: 'Touring', heroColor: 'Violett', heroAlt: 'Zwei Fahrer auf einer violetten Road Glide, unterwegs auf der Autobahn', heroImage: 'assets/img/hero-ride-road.png' },
  { id: 'b3', name: 'Street Glide Limited', family: 'Grand American Touring', zustand: 'neu', year: 2026, ez: null, km: 0, kw: null, ps: null, ccm: null, color: 'Schwarz', price: 33900, tax: 'regel', hu: null, fzgNr: 'M04B', img: 3, ab: true },
  { id: 'b4', name: 'Road Glide Limited', family: 'Grand American Touring', zustand: 'neu', year: 2026, ez: null, km: 0, kw: null, ps: null, ccm: null, color: 'Dunkelblau', price: 33900, tax: 'regel', hu: null, fzgNr: 'M76', img: 4, ab: true },
  { id: 'b5', name: 'CVO Street Glide ST', family: 'CVO', zustand: 'neu', year: 2026, ez: null, km: 0, kw: null, ps: null, ccm: null, color: 'Grau', price: 48300, tax: 'regel', hu: null, fzgNr: 'M67B', img: 5, ab: true },
  { id: 'b6', name: 'CVO Road Glide ST', family: 'CVO', zustand: 'neu', year: 2026, ez: null, km: 0, kw: null, ps: null, ccm: null, color: 'Orange', price: 48300, tax: 'regel', hu: null, fzgNr: 'M65B', img: 6, ab: true, heroPoster: 'CVO', heroBlurb: 'Die CVO-Ausstattung für die grosse Tour.', heroLine: 'CVO', heroColor: 'Grau', heroAlt: 'Fahrer auf einer grauen CVO Road Glide, unterwegs auf einer Landstrasse', heroImage: 'assets/img/hero-ride-cvo.png' },
];
PS.bikes.forEach(function (b, i) {
  b.status = b.status || 'verfuegbar';
  b.image = 'assets/img/bike-' + b.img + '.jpg';
  b.gallery = [b.image];
  b.url = 'motorrad.html?id=' + b.id;
  b.date = 100 - i;
  b.equipment = ['Ausstattung hängt von der Konfiguration ab. Wir beraten dich im Showroom.'];
});

PS.heroBikes = ['b2', 'b1', 'b6'];

PS.zustandLabel = { neu: 'Neu', gebraucht: 'Gebraucht', vorfuehrer: 'Vorführer' };

PS.events = [
  { date: '2026-10-11', title: 'Saisonabschluss-Ausfahrt', place: 'Start: Power Shop, 10:00 Uhr', img: 'assets/img/event-1.jpg' },
  { date: '2026-10-24', title: 'Bike Night & Custom Show', place: 'Power Shop Hof, ab 18:00 Uhr', img: 'assets/img/event-2.jpg' },
  { date: '2026-11-14', title: 'Winter-Check-Tag', place: 'Werkstatt, 09:00–14:00 Uhr', img: 'assets/img/event-3.jpg' },
];

// ---------------- Kategorien (Banner, Filter) ----------------
PS.categories = {
  motorraeder: { title: 'Motorräder', intro: 'Neufahrzeuge, geprüfte Gebrauchte und Vorführer – Probefahrt und Finanzierung direkt bei uns.', banner: 'banner-motorraeder.jpg', type: 'bikes',
    filters: ['zustand', 'familie', 'modell', 'baujahr', 'preis', 'km', 'farbe'] },
  herren: { title: 'Herren', intro: 'Lederjacken, Riding Gear und Streetwear – gemacht für Asphalt und Alltag.', banner: 'banner-herren.jpg', filters: ['typ', 'groesse', 'farbe', 'kollektion', 'preis'] },
  damen: { title: 'Damen', intro: 'Starke Styles für Fahrerinnen – von der Lederjacke bis zum Lieblingsshirt.', banner: 'banner-damen.jpg', filters: ['typ', 'groesse', 'farbe', 'kollektion', 'preis'] },
  teile: { title: 'Teile & Zubehör', intro: 'Original-Teile und Screamin’ Eagle Performance – mit Kompatibilitäts-Check und Einbau-Service.', banner: 'banner-teile.jpg', filters: ['typ', 'familie', 'baujahr1', 'marke', 'zulassung', 'preis', 'lager'] },
  accessoires: { title: 'Accessoires', intro: 'Helme, Caps, Leder und Geschenkideen für alle, die Benzin im Blut haben.', banner: 'banner-accessoires.jpg', filters: ['typ', 'farbe', 'preis'] },
  neuheiten: { title: 'Neuheiten', intro: 'Frisch eingetroffen: die neuesten Styles, Teile und Accessoires.', banner: 'banner-neuheiten.jpg', filters: ['bereich', 'preis'] },
  sale: { title: 'Sale', intro: 'Reduzierte Bekleidung, Teile und Accessoires – solange der Vorrat reicht.', banner: 'banner-sale.jpg', filters: ['bereich', 'preis'] },
  suche: { title: 'Suchergebnisse', intro: '', banner: 'banner-neuheiten.jpg', filters: ['bereich', 'preis'] },
};

// Service-Seiten für Suche/Navigation
PS.servicePages = [
  { title: 'Probefahrt anfragen', url: 'service.html#probefahrt' },
  { title: 'Finanzierung & Leasing', url: 'service.html#finanzierung' },
  { title: 'Werkstatt-Termin', url: 'service.html#werkstatt' },
  { title: 'Inzahlungnahme', url: 'service.html#inzahlungnahme' },
  { title: 'Events & Ausfahrten', url: 'service.html#events' },
  { title: 'Standort & Öffnungszeiten', url: 'service.html#standort' },
];

// Größentabellen (Metaobjekt „Größentabelle“ in Shopify)
PS.sizeCharts = {
  oberteile: { label: 'Oberteile & Jacken', head: ['Größe', 'Brust (cm)', 'Taille (cm)', 'Ärmel (cm)'], rows: [['S', '88–96', '76–84', '62'], ['M', '96–104', '84–92', '63'], ['L', '104–112', '92–100', '64'], ['XL', '112–120', '100–108', '65'], ['XXL', '120–128', '108–116', '66'], ['3XL', '128–136', '116–124', '67']] },
  hosen: { label: 'Hosen & Jeans', head: ['Weite', 'Taille (cm)', 'Hüfte (cm)', 'Innenbein (cm)'], rows: [['30', '76–78', '94–96', '81'], ['32', '81–83', '99–101', '81'], ['34', '86–88', '104–106', '84'], ['36', '91–93', '109–111', '84'], ['38', '96–98', '114–116', '86']] },
  handschuhe: { label: 'Handschuhe', head: ['Größe', 'Handumfang (cm)', 'Handlänge (cm)'], rows: [['S', '18–20', '17–18'], ['M', '20–22', '18–19'], ['L', '22–24', '19–20'], ['XL', '24–26', '20–21'], ['XXL', '26–28', '21–22']] },
  helme: { label: 'Helme', head: ['Größe', 'Kopfumfang (cm)'], rows: [['S', '55–56'], ['M', '57–58'], ['L', '59–60'], ['XL', '61–62']] },
  stiefel: { label: 'Stiefel', head: ['EU', 'UK', 'US', 'Fußlänge (cm)'], rows: [['40', '6,5', '7', '25,5'], ['41', '7', '8', '26'], ['42', '8', '9', '27'], ['43', '9', '10', '27,5'], ['44', '9,5', '10,5', '28'], ['45', '10,5', '11,5', '29'], ['46', '11', '12', '29,5']] },
};
