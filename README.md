# Power Shop – klickbares UI-Mockup

Mockup für den Harley-Davidson-Onlineshop **Power Shop**: eine deutsche Firma, offizieller H-D-Vertragshändler, Umsetzung auf Shopify.
Das Mockup ist statisches HTML, CSS und JavaScript. Es gibt keinen Build-Step und keine externen Abhängigkeiten.

- **Briefing & Komponenten:** [`docs/briefing.md`](docs/briefing.md)
- **Bildliste (Shotlist):** [`docs/bildliste.md`](docs/bildliste.md)
- **Komponenten-Übersicht im Browser:** `styleguide.html`

## Starten

```bash
python3 -m http.server 8000
# dann im Browser öffnen: http://localhost:8000
```

Alternativ geht auch `npx serve .`. Bitte immer über einen lokalen Server öffnen, damit Schriften und Icons zuverlässig laden.

## Seiten

| Seite | Beispiel-URL |
|---|---|
| Homepage | `index.html` |
| Kategorieseite | `kollektion.html?kat=herren` (auch `damen`, `teile`, `accessoires`, `motorraeder`, `neuheiten`, `sale`) |
| Mit Vorfilter | `kollektion.html?kat=motorraeder&familie=touring` · `kollektion.html?kat=herren&typ=jacken` |
| Suche | `kollektion.html?kat=suche&q=auspuff` (oder Such-Icon im Header, auch Teilenummer z. B. `64900-24`) |
| PDP Bekleidung | `produkt-bekleidung.html?id=h1` |
| PDP Teile | `produkt-teil.html?id=t1` (ABE) · `?id=t2` (eintragungspflichtig) · `?id=t7` (ohne Straßenzulassung) |
| PDP Motorrad | `motorrad.html?id=b3` (gebraucht, reservierbar) · `?id=b1` (neu) · `?id=b4` (reserviert) |
| Service | `service.html` |
| Styleguide | `styleguide.html` |

Klickbar sind unter anderem:
- Megamenüs (Maus, Tastatur, Touch) und Mobile-Menü
- Hero-Slider mit Pause-Button und Neuheiten-Tabs
- Filter, Sortierung und Pagination
- Warenkorb- und Merkliste-Drawer
- Größentabelle und Kontakt-Box (WhatsApp- und E-Mail-Text wird vorausgefüllt)
- Suche und Cookie-Banner

Links, die nicht zum Mockup gehören (Checkout, Konto, Rechtstexte …), zeigen einen Hinweis „folgt im Shopify-Shop“.

Warenkorb, Merkliste und Cookie-Wahl werden nur lokal im Browser gespeichert (`localStorage`).
Mit `?nocookie` in der URL erscheint das Cookie-Banner nicht.

## Struktur

```
index.html, kollektion.html, produkt-*.html, motorrad.html, service.html, styleguide.html
assets/css/   tokens.css (Design-Tokens) · base.css · components.css · sections.css
assets/js/    icons.js (generiert) · data.js (Mock-Daten + Platzhalter-Firmendaten) · cards.js · layout.js · main.js
assets/fonts/ Inter + Barlow Condensed (self-hosted, OFL)
assets/icons/ Lucide-Icons (ISC)
assets/img/   Platzhalter-Bilder
assets/brand/ H-D-Logo (Platzhalter), Power-Shop-Signet (Favicon)
scripts/      build-icons.mjs · placeholders.mjs
docs/         briefing.md · bildliste.md
```

## Bilder & Logo austauschen

- **Fotos:** Unter **demselben Dateinamen** und im gleichen Seitenverhältnis nach `assets/img/` legen. Die Liste mit Motiv und Format steht in `docs/bildliste.md`.
- **H-D Bar & Shield:** Die offizielle Datei als `assets/brand/hd-bar-shield.png` ablegen. Seitenverhältnis ca. 1446 × 1174.
  - Als SVG: Pfad in `assets/js/layout.js` und `styleguide.html` anpassen.
- **Firmendaten:** Telefon, WhatsApp, E-Mail, Öffnungszeiten, Versandschwelle, Reservierungsgebühr usw. stehen oben in `assets/js/data.js` (`PS.shop`).

Platzhalter neu erzeugen (nutzt Playwright/Chromium):

```bash
node scripts/placeholders.mjs          # erzeugt nur fehlende Bilder + docs/bildliste.md (echte Fotos/Logo bleiben)
node scripts/placeholders.mjs --force  # alle Platzhalter neu erzeugen (überschreibt Bilder in assets/img!)
node scripts/build-icons.mjs    # nach dem Hinzufügen von Icons in assets/icons/
```
