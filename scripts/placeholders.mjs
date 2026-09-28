// Erzeugt alle Platzhalter-Bilder (JPG) für das Mockup und die Bildliste docs/bildliste.md.
// Jede Datei zeigt Dateiname, Motiv und Format. Echte Fotos einfach unter demselben
// Dateinamen (gleiches Seitenverhältnis) in assets/img/ ablegen – fertig.
//
// Aufruf: node scripts/placeholders.mjs           (erzeugt nur fehlende Dateien)
//         node scripts/placeholders.mjs --force   (überschreibt alle Platzhalter – Vorsicht bei echten Fotos!)
// Benötigt Playwright (Chromium). Nutzt die self-hosted Schriften aus assets/fonts/.
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
let playwright;
try {
  playwright = require('playwright');
} catch {
  const globalRoot = execSync('npm root -g').toString().trim();
  playwright = require(join(globalRoot, 'playwright'));
}

// ---------------------------------------------------------------------------
// Bildliste: [Dateiname, Breite, Höhe, Ton, Icon, Motiv, Einsatz]
// Ton: dark = Lifestyle/Marke (dunkle Sektionen), stone = Freisteller auf Hellgrau
// ---------------------------------------------------------------------------
const IMAGES = [
  // Hero
  ['hero-1-motorraeder.jpg', 1600, 1200, 'dark', 'motorbike', 'Neues Touring-Modell auf der Landstraße, Sonnenuntergang, Fahrer in Bewegung', 'Homepage · Hero-Slide 1'],
  ['hero-2-kollektion.jpg', 1600, 1200, 'dark', 'shirt', 'Paar in Lederjacken am Bike, warmes Herbstlicht, urbane Kulisse', 'Homepage · Hero-Slide 2'],
  ['hero-3-custom-parts.jpg', 1600, 1200, 'dark', 'wrench', 'Custom-Umbau in der Werkstatt, Detail Chrom-Auspuff, Funken/Werkzeug', 'Homepage · Hero-Slide 3'],
  // Bento
  ['bento-motorraeder.jpg', 1400, 1000, 'dark', 'motorbike', 'Bike-Reihe im Showroom, dramatisches Licht', 'Homepage · Kategorie-Kachel Motorräder'],
  ['bento-herren.jpg', 800, 600, 'dark', 'shirt', 'Fahrer in Lederjacke, Oberkörper, Werkstatt-Hintergrund', 'Homepage · Kategorie-Kachel Herren'],
  ['bento-damen.jpg', 800, 600, 'dark', 'shirt', 'Fahrerin in Motorradjacke am Bike, Straße', 'Homepage · Kategorie-Kachel Damen'],
  ['bento-accessoires.jpg', 800, 500, 'dark', 'hard-hat', 'Helm, Handschuhe und Sonnenbrille auf Sitzbank', 'Homepage · Kategorie-Kachel Accessoires'],
  ['bento-teile.jpg', 800, 1000, 'dark', 'cog', 'Motor-Detail Milwaukee-Eight, Chrom und Schwarz', 'Homepage · Kategorie-Kachel Teile & Zubehör'],
  // Kategorie-Banner
  ['banner-motorraeder.jpg', 1200, 600, 'dark', 'motorbike', 'Touring-Bike im Profil, dunkler Hintergrund', 'Kategorieseite · Banner Motorräder'],
  ['banner-herren.jpg', 1200, 600, 'dark', 'shirt', 'Herren-Lederjacken nebeneinander, Detail', 'Kategorieseite · Banner Herren'],
  ['banner-damen.jpg', 1200, 600, 'dark', 'shirt', 'Damen-Kollektion, Jacken und Shirts auf Kleiderstange', 'Kategorieseite · Banner Damen'],
  ['banner-teile.jpg', 1200, 600, 'dark', 'cog', 'Teile auf Werkbank: Auspuff, Luftfilter, Griffe', 'Kategorieseite · Banner Teile & Zubehör'],
  ['banner-accessoires.jpg', 1200, 600, 'dark', 'glasses', 'Accessoires-Flatlay: Cap, Geldbörse, Sonnenbrille, Schlüsselanhänger', 'Kategorieseite · Banner Accessoires'],
  ['banner-neuheiten.jpg', 1200, 600, 'dark', 'sparkles', 'Neue Kollektion, Mix aus Bekleidung und Teilen', 'Kategorieseite · Banner Neuheiten'],
  ['banner-sale.jpg', 1200, 600, 'dark', 'tag', 'Sale-Motiv, Bekleidung mit Preisschild', 'Kategorieseite · Banner Sale'],
  // Megamenü
  ['familie-cruiser.jpg', 600, 400, 'dark', 'motorbike', 'Cruiser (z. B. Fat Boy / Street Bob) Seitenansicht', 'Megamenü Motorräder · Kachel Cruiser'],
  ['familie-touring.jpg', 600, 400, 'dark', 'motorbike', 'Grand American Touring (z. B. Street Glide) Seitenansicht', 'Megamenü Motorräder · Kachel Touring'],
  ['familie-sport.jpg', 600, 400, 'dark', 'motorbike', 'Sport (z. B. Nightster / Sportster S) Seitenansicht', 'Megamenü Motorräder · Kachel Sport'],
  ['familie-adventure.jpg', 600, 400, 'dark', 'mountain', 'Adventure Touring (Pan America) im Gelände', 'Megamenü Motorräder · Kachel Adventure Touring'],
  ['familie-trike.jpg', 600, 400, 'dark', 'motorbike', 'Trike (z. B. Tri Glide Ultra) Seitenansicht', 'Megamenü Motorräder · Kachel Trike'],
  ['familie-cvo.jpg', 600, 400, 'dark', 'award', 'CVO-Modell, Premium-Lackierung im Detail', 'Megamenü Motorräder · Kachel CVO'],
  ['mega-herren.jpg', 600, 750, 'dark', 'shirt', 'Neue Herren-Kollektion, Model in Lederjacke', 'Megamenü Herren · Teaser'],
  ['mega-damen.jpg', 600, 750, 'dark', 'shirt', 'Neue Damen-Kollektion, Model in Jacke', 'Megamenü Damen · Teaser'],
  ['mega-teile.jpg', 600, 750, 'dark', 'wrench', 'Custom-Umbau vorher/nachher', 'Megamenü Teile · Teaser Custom-Umbauten'],
  ['mega-accessoires.jpg', 600, 750, 'dark', 'gift', 'Geschenkideen: Gutschein, Tasse, Cap', 'Megamenü Accessoires · Teaser'],
  // Story, Events, Team
  ['story-werkstatt.jpg', 1200, 900, 'dark', 'wrench', 'Mechaniker bei der Arbeit in der Werkstatt, echtes Team', 'Homepage · Storytelling „Über uns“'],
  ['event-1.jpg', 800, 500, 'dark', 'route', 'Gruppenausfahrt auf Landstraße', 'Homepage/Service · Event-Kachel 1'],
  ['event-2.jpg', 800, 500, 'dark', 'users', 'Bike Night im Hof, Lichterketten, Community', 'Homepage/Service · Event-Kachel 2'],
  ['event-3.jpg', 800, 500, 'dark', 'coffee', 'Winter-Check in der Werkstatt, Kunden mit Kaffee', 'Homepage/Service · Event-Kachel 3'],
  ['team-verkauf.jpg', 400, 400, 'dark', 'users', 'Porträt Verkaufsberater, freundlich, im Showroom', 'Kontakt-Box · Ansprechpartner'],
  // Service-Seite
  ['service-probefahrt.jpg', 1200, 800, 'dark', 'route', 'Kunde bei Probefahrt, Übergabe am Showroom', 'Service · Probefahrt'],
  ['service-finanzierung.jpg', 1200, 800, 'dark', 'banknote', 'Beratungsgespräch am Tisch, Bike im Hintergrund', 'Service · Finanzierung'],
  ['service-werkstatt.jpg', 1200, 800, 'dark', 'wrench', 'Bike auf Hebebühne, Mechaniker', 'Service · Werkstatt'],
  ['service-inzahlungnahme.jpg', 1200, 800, 'dark', 'handshake', 'Handschlag vor Gebrauchtbike', 'Service · Inzahlungnahme'],
  ['service-standort.jpg', 1200, 800, 'dark', 'store', 'Außenansicht Power Shop mit Logo, Abendstimmung', 'Service · Standort'],
  // Größentabelle
  ['messanleitung.jpg', 800, 600, 'stone', 'ruler', 'Illustration: Messpunkte Brust, Taille, Hüfte, Innenbeinlänge', 'Größentabellen-Popup'],
];

// Produkt-Pool (Freisteller 4:5) – echte Produktbilder kommen später aus Shopify
const POOL = [
  ['herren', 'shirt', ['Lederjacke', 'T-Shirt mit Print', 'Hoodie', 'Jeans', 'Flanellhemd', 'Textiljacke']],
  ['damen', 'shirt', ['Lederjacke', 'T-Shirt', 'Hoodie', 'Jeans', 'Bluse', 'Weste']],
  ['teile', 'cog', ['Auspuffanlage', 'Luftfilter', 'LED-Scheinwerfer', 'Lenker', 'Sitzbank', 'Motoröl 1 l']],
  ['acc', 'glasses', ['Helm', 'Sonnenbrille', 'Cap', 'Geldbörse', 'Tasse', 'Rucksack']],
];
POOL.forEach(([kat, icon, motive]) => {
  motive.forEach((m, i) => {
    IMAGES.push([`p-${kat}-${i + 1}.jpg`, 800, 1000, 'stone', icon, `Freisteller: ${m}`, `Produktbild-Pool ${kat}`]);
  });
});
for (let i = 1; i <= 8; i++) {
  IMAGES.push([`bike-${i}.jpg`, 1600, 1000, 'dark', 'motorbike', `Fahrzeugfoto ${i}: Bike 3/4-Ansicht im Showroom`, 'Bike-Karte / Bike-PDP']);
}
for (let i = 1; i <= 4; i++) {
  const m = ['Seitenansicht links', 'Cockpit/Tacho', 'Motor-Detail', 'Heck & Auspuff'][i - 1];
  IMAGES.push([`bike-detail-${i}.jpg`, 1600, 1000, 'dark', 'motorbike', `Galerie: ${m}`, 'Bike-PDP · Galerie']);
}

// ---------------------------------------------------------------------------
// Schriften als data:-URL einbetten (file://-Schriften würden im leeren Dokument blockiert)
const font = (f) => `data:font/woff2;base64,${readFileSync(join(root, 'assets/fonts', f)).toString('base64')}`;
const icons = Object.fromEntries(
  [...new Set(IMAGES.map((i) => i[4]).concat('ruler'))].map((n) => {
    const p = join(root, 'assets/icons', `${n}.svg`);
    return [n, existsSync(p) ? readFileSync(p, 'utf8').replace(/<!--[\s\S]*?-->/g, '') : ''];
  })
);

function html([file, w, h, tone, icon, motiv]) {
  const dark = tone === 'dark';
  const s = Math.min(w, h) / 600; // Skalierung für Typo
  const ratio = (() => {
    const g = (a, b) => (b ? g(b, a % b) : a);
    const d = g(w, h);
    return `${w / d}:${h / d}`;
  })();
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Barlow;src:url(${font('barlow-condensed-latin-700-normal.woff2')})}
@font-face{font-family:Inter;src:url(${font('inter-latin-500-normal.woff2')})}
*{margin:0;box-sizing:border-box}
body{width:${w}px;height:${h}px;overflow:hidden;font-family:Inter;position:relative;
${dark
    ? 'background:radial-gradient(ellipse at 72% 28%,rgba(242,103,34,.22),transparent 55%),radial-gradient(ellipse at 20% 90%,rgba(255,255,255,.06),transparent 50%),linear-gradient(160deg,#262626,#0c0c0c);color:#e9e6e1'
    : 'background:radial-gradient(ellipse at 50% 88%,rgba(0,0,0,.10),transparent 42%),#EDEBE7;color:#3a3a3a'}}
.noise{position:absolute;inset:0;opacity:${dark ? '.35' : '.18'};background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.5'/%3E%3C/svg%3E")}
.frame{position:absolute;inset:${Math.round(18 * s)}px;border:${Math.max(1, Math.round(2 * s))}px dashed ${dark ? 'rgba(255,255,255,.14)' : 'rgba(0,0,0,.12)'}}
.icon{position:absolute;left:50%;top:34%;transform:translate(-50%,-50%);width:${Math.round(170 * s)}px;height:${Math.round(170 * s)}px;color:${dark ? 'rgba(255,255,255,.10)' : 'rgba(0,0,0,.10)'}}
.icon svg{width:100%;height:100%;stroke-width:.75}
.txt{position:absolute;left:12%;right:12%;top:52%;text-align:center}
.tag{font-size:${Math.round(15 * s)}px;letter-spacing:.14em;text-transform:uppercase;color:${dark ? '#F26722' : '#8a847b'};margin-bottom:${Math.round(10 * s)}px}
.motiv{font-family:Barlow;font-size:${Math.round(32 * s)}px;line-height:1.05;text-transform:uppercase;letter-spacing:.02em;margin-inline:auto}
.meta{margin-top:${Math.round(10 * s)}px;font-size:${Math.round(15 * s)}px;opacity:.7}
</style></head><body><div class="noise"></div><div class="frame"></div>
<div class="icon">${icons[icon] || ''}</div>
<div class="txt"><div class="tag">Platzhalter · ${file}</div><div class="motiv">${motiv}</div>
<div class="meta">${w} × ${h} px · ${ratio}</div></div></body></html>`;
}

function logoHtml(w, h) {
  // Markierter Platzhalter für das offizielle H-D Bar & Shield (wird NICHT nachgebaut)
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Barlow;src:url(${font('barlow-condensed-latin-800-normal.woff2')})}
*{margin:0}body{width:${w}px;height:${h}px;background:transparent;display:grid;place-items:center;font-family:Barlow}
div{width:${w - 16}px;height:${h - 16}px;border:10px dashed #F26722;display:grid;place-items:center;text-align:center;color:#F26722;font-size:${Math.round(h / 4.2)}px;line-height:.95;text-transform:uppercase}
small{display:block;font-size:.34em;letter-spacing:.08em;margin-top:.4em}
</style></head><body><div><span>H-D<small>Logo-Datei<br>einsetzen</small></span></div></body></html>`;
}

const browser = await playwright.chromium.launch();
const page = await browser.newPage();
mkdirSync(join(root, 'assets/img'), { recursive: true });
const force = process.argv.includes('--force');
let created = 0;
for (const img of IMAGES) {
  const [file, w, h] = img;
  if (!force && existsSync(join(root, 'assets/img', file))) continue; // echte Fotos nie überschreiben
  await page.setViewportSize({ width: w, height: h });
  await page.setContent(html(img), { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: join(root, 'assets/img', file), type: 'jpeg', quality: 72 });
  created++;
}

// Logo-Platzhalter nur erzeugen, wenn noch keine echte Datei da ist
const logoPath = join(root, 'assets/brand/hd-bar-shield.png');
if (!existsSync(logoPath)) {
  const w = 482, h = 391; // Seitenverhältnis des gelieferten Logos (1446 × 1174)
  await page.setViewportSize({ width: w, height: h });
  await page.setContent(logoHtml(w, h), { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: logoPath, omitBackground: true });
}
await browser.close();

// Bildliste für Fotograf/Bildrecherche
const rows = IMAGES.map(([f, w, h, tone, , motiv, einsatz]) => `| \`${f}\` | ${w} × ${h} | ${tone === 'dark' ? 'Lifestyle/Marke' : 'Freisteller'} | ${motiv} | ${einsatz} |`);
writeFileSync(
  join(root, 'docs/bildliste.md'),
  `# Bildliste (Shotlist)

Automatisch erzeugt von \`scripts/placeholders.mjs\`. Echte Fotos unter **demselben Dateinamen** und im **gleichen Seitenverhältnis** in \`assets/img/\` ablegen – das Mockup nutzt sie sofort.

- **Lifestyle/Marke:** dunkle Tonalität, warmes Licht, echte Fahrer (siehe Briefing, Bildsprache)
- **Freisteller:** Produkt auf einheitlichem Hellgrau \`#EDEBE7\`, gleicher Ausschnitt
- Produktbilder sind im Mockup nur ein kleiner Pool je Kategorie; im Shop kommen sie aus Shopify

| Datei | Format (px) | Typ | Motiv | Einsatz |
|---|---|---|---|---|
${rows.join('\n')}
`
);
console.log(`${created} von ${IMAGES.length} Platzhaltern erzeugt (vorhandene Dateien übersprungen), Bildliste geschrieben.`);
