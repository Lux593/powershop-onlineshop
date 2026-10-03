# Power Shop – Shopify-Theme

Shopify-Theme für den Harley-Davidson-Onlineshop **Power Shop**: eine deutsche Firma und offizieller H-D-Vertragshändler.

Das Theme liegt im Wurzelverzeichnis dieses Repositorys – so verlangt es die
[Shopify-GitHub-Integration](https://help.shopify.com/manual/online-store/themes/github). Es ist in sich
geschlossen: eigene Assets, Schriften und Icons, kein Build-Step.

- **Briefing & Komponenten:** [`docs/briefing.md`](docs/briefing.md)
- **Bildliste (Shotlist):** [`docs/bildliste.md`](docs/bildliste.md)
- **Übergabe (Stand, Test-Checkliste, Offenes):** [`docs/uebergabe.md`](docs/uebergabe.md)
- **Motion-Schicht (Vertrag, Datei-Aufteilung):** [`docs/motion-api.md`](docs/motion-api.md)
- **Hero-Clip (Herkunft, offene Rechtsfragen):** [`docs/hero-clip.md`](docs/hero-clip.md)
- **Freigabeliste (Zahlen, Zusagen, Texte, Rechtliches, Bildrechte des Händlers):** [`docs/freigaben.md`](docs/freigaben.md)

## Shopify-Anbindung

Der Branch `main` ist im Shopify-Admin unter **Onlineshop → Themes → Theme verbinden** angebunden.
Jeder Push auf `main` aktualisiert das verbundene Theme automatisch.

> Die Theme-Ordner müssen im Repo-Root liegen – Shopify kann kein Unterverzeichnis ansteuern.
> Zusätzliche Ordner wie `docs/` und `pics_to_use/` stören nicht, sie werden ignoriert.

## Entwickeln

```bash
shopify theme dev
# Vorschau: http://127.0.0.1:9292
```

Die Vorschau lädt Änderungen an Liquid, CSS und JavaScript automatisch nach.

| Befehl | Zweck |
|---|---|
| `shopify theme dev` | Lokale Vorschau mit Live-Reload |
| `shopify theme check` | Theme auf Liquid- und Schema-Fehler prüfen |
| `shopify theme push` | Theme in den Store hochladen |
| `shopify theme pull` | Änderungen aus dem Theme-Editor zurückholen |

Bei verbundenem GitHub-Repo genügt in der Regel ein `git push` auf `main` – `shopify theme push` ist
nur für Tests in ein separates, nicht verbundenes Theme nötig.

## Struktur

```
layout/     theme.liquid · password.liquid
templates/  index · collection (+ .motorrad) · product (+ .motorrad, .teil) · page (+ .service) · cart · search · blog · article ·
            list-collections · 404 · password · gift_card
sections/   Startseite: hero · service-tiles · product-tabs · statement · category-bento · showroom · story-events
            Shop: collection · collections · product · cart · cart-drawer · search · predictive-search
            Seiten: page · service-page · blog · article · 404 · password
            Rahmen: header · announcement-bar · footer, dazu header-group.json und footer-group.json
snippets/   Karten (product-card, bike-card, result-card, event-card, bento-tile), Produktseite (pdp-gallery, pdp-buy, pdp-sticky-buy,
            pdp-usp, pdp-shipping, pdp-gpsr, size-guide, swatch, rating, price), Shop-Bausteine (results-toolbar, filter-controls,
            active-filters, pagination, cart-line, contact-box, search-dialog, mega-menu, accordion), Kleinteile (icon, icons-sprite,
            media, is-placeholder, number-de, opening-hours, payments, bike-badge), Kopfbereich (meta-tags, fonts)
assets/     CSS, JS, Bilder, Videos, Schriften (flach, Shopify kennt keine Unterordner in assets/), Details unten
config/     settings_schema.json · settings_data.json
locales/    de.default.json
docs/       Briefing, Bildliste, Freigabeliste, Händlerfragen, Motion-API, Hero-Clip, Auftrag Motion
pics_to_use/ Quellbilder für Kategorien und Team
```

### assets/

| Datei | Inhalt |
|---|---|
| `tokens.css` · `base.css` · `components.css` | Design-Tokens, Reset und Typografie, wiederverwendbare Bausteine (Karten, Buttons, Tabs, Schienen) |
| `sections.css` | geteilte Reste: Events (Raster, Karten), Service-Seite |
| `theme.css` | Ergänzungen fürs Shopify-Theme, Kontrastmodus (`forced-colors`) für gewählte Zustände |
| `motion.css` · `motion.js` | Motion-Schicht: Einblenden beim Scrollen, Wort-Splitter, Zahlen-Zählen, Parallax, weiches Scrollen |
| `gsap.min.js` · `ScrollTrigger.min.js` | Bibliotheken der Motion-Schicht (Scrub, Parallax), self-hosted, nur auf der Startseite |
| `lenis.min.js` | weiches Scrollen, self-hosted, lädt nach (Head-Skript plus `motion.js`), nur auf Startseite, Kollektion und Produkt und nur für Maus und Trackpad |
| `header.css` · `header.js` | Ankündigungsleiste, Header, Megamenü, Mobile-Menü, Such-Dialog |
| `hero.css` · `hero.js` | Hero mit Modell-Tabs (beide laden nur auf der Startseite) |
| `home.css` · `home.js` | Startseiten-Bereiche: Service-Leiste, Produkt-Tabs, Kategorie-Bento, Showroom, Story |
| `footer.css` | Footer |
| `shop.css` | Kategorieseite, Produktseite, Warenkorb und Drawer |
| `theme.js` · `header.js` · `cart.js` · `sections.js` | JS-Module auf allen Seiten: Kern (Dialoge, Tabs), Header, Warenkorb, Showroom und Quick-Add |
| `search.js` | Suchvorschläge, lädt erst beim ersten Öffnen des Such-Dialogs nach |
| `contact.js` | Kontakt-Box, lädt auf Produkt- und Seiten-Templates (im Theme-Editor immer) |
| `collection.js` · `product.js` | JS nur auf Kollektion und Suche bzw. Produktseite |
| `*.jpg` · `*.png` · `*.webp` · `*.mp4` · `*.webm` · `*.woff2` | Bilder, Videos und Schriften ([`docs/bildliste.md`](docs/bildliste.md), [`docs/hero-clip.md`](docs/hero-clip.md)) |

Alle CSS-Dateien laden auf jeder Seite des Shops, die Reihenfolge in `layout/theme.liquid` ist die Kaskade (Passwortseite und Geschenkgutschein laden nur
sechs davon). Farben stehen nur in `tokens.css`, die übrigen Stylesheets verwenden Tokens. Welche Klasse in welcher Datei liegt
und was beim Ändern geteilter Klassen zu beachten ist, steht in [`docs/motion-api.md`](docs/motion-api.md) unter „Dateiaufteilung“.

## Bewegung

Einblenden beim Scrollen, Parallax, Zahlen-Zählen und weiches Scrollen kommen aus `assets/motion.js`. Im Theme-Editor unter
**Theme-Einstellungen → Animationen** gibt es drei Schalter:

- **Animationen aktivieren** ist der Notaus: Ausgeschaltet erscheint alles sofort und ohne Bewegung.
- **Weiches Scrollen** schaltet nur das gleitende Mausrad ab.
- **Header auf der Startseite über dem Hero** schaltet den transparenten Header ein oder aus.

Ohne JavaScript, bei „Bewegung reduzieren“ im Betriebssystem, im Datensparmodus und im Theme-Editor ist der Shop immer statisch.
Wer neue Bereiche mit Bewegung baut, findet Attribute und Regeln in [`docs/motion-api.md`](docs/motion-api.md).

## Händlerdaten pflegen

Telefon, WhatsApp, E-Mail, Öffnungszeiten, Versandschwelle und Reservierungsgebühr sind Theme-Einstellungen
(`config/settings_schema.json`) und lassen sich im Shopify-Theme-Editor ändern – kein Eingriff im Code nötig.

Firmenname, Adresse, Telefon, WhatsApp, E-Mail und Ansprechperson haben **keine Beispielwerte**. Ein leeres Feld bleibt im Shop
unsichtbar: Die Kontaktbox zeigt nur Kanäle, die eingetragen sind, und erscheint ohne jeden Kanal gar nicht (im Theme-Editor steht dann
ein Hinweis). Die Öffnungszeiten erscheinen erst, wenn **„Öffnungszeiten anzeigen“** eingeschaltet ist. Ohne Firmenname steht im Footer der Shop-Name.

Diese Einstellungen haben noch **Beispielwerte** und erscheinen so im Shop (Ankündigungsleiste, Produktseiten, Warenkorb, Newsletter, Bike-Seite).
Vor dem Livegang prüfen und anpassen:

| Einstellung | Beispielwert |
|---|---|
| Versandkostenfrei ab | 100 € |
| Versandkosten darunter | 4,95 € |
| Lieferzeit | 2–4 Werktage |
| Freiwillige Rückgabefrist | 30 Tage |
| Reservierungsgebühr Gebrauchtfahrzeug | 250 € |
| Reservierung gilt | 48 Stunden |
| Newsletter-Rabatt | 10 % |
| Zahlarten | PayPal, Klarna, Visa, Mastercard, Apple Pay, Google Pay |
| Öffnungszeiten (erscheinen erst mit „Öffnungszeiten anzeigen“) | Mo bis Fr 9 bis 18 Uhr, Sa 9 bis 14 Uhr |

Ein leerer oder 0-Wert erzeugt im Shop keine Aussage („ab 0 €“ oder „ Tage Rückgabe“ stehen nie dort). Dazu kommen Beispieltexte in den
Templates (Kennzahlen, Events, Hero-Modelle mit Preisen, Service-Texte): sie stehen mit Fundstelle in der Freigabeliste.

Alles, was der Händler freigeben muss (diese Werte, kontakt- und rechtsrelevante Texte, Kennzahlen, Events, Zusicherungen, Bildrechte), steht mit
Fundstelle in [`docs/freigaben.md`](docs/freigaben.md).

Die Rechtslinks im Footer kommen aus den Shopify-Menüs `footer`, `customer-service` und `legal`: **vor dem Livegang im Admin anlegen**.
Fehlt ein Rechtstext dort, verlinkt der Footer ersatzweise die Richtlinien aus Einstellungen > Richtlinien (Schalter im Footer-Abschnitt).
Der Link „Cookie-Einstellungen“ wirkt nur mit aktivem Shopify-Cookie-Banner.

## Bilder austauschen

Fotos unter **demselben Dateinamen** und im gleichen Seitenverhältnis nach `assets/` legen.
Motiv und Format stehen in [`docs/bildliste.md`](docs/bildliste.md).

Dateien, die noch Platzhalter sind, stehen in den Theme-Einstellungen unter **Platzhalterbilder**. Im Shop bleiben sie unsichtbar
(im Theme-Editor sind sie zu sehen). **Nach dem Austausch den Dateinamen aus dieser Liste streichen**, sonst bleibt das neue Foto ausgeblendet.
Ein im Theme-Editor gewähltes Bild hat immer Vorrang und braucht keinen Eintrag.

Die Hero-Fotos liegen als `assets/hero-ride-road.jpg`, `hero-ride-street.jpg` und `hero-ride-cvo.jpg`, das Teamfoto als `assets/powershop-team.webp`
(Quelle: `pics_to_use/powershop-team.png`). Ein Ersatz darf eine andere Dateiendung haben, dann den Dateinamen in der Section (`image_asset`) und in
`templates/index.json` anpassen.

Das H-D Bar & Shield liegt als `assets/hd-bar-shield.png`: 190 × 154 px mit transparentem Hintergrund, rund das 2,75-Fache der größten
Darstellung (Footer, ca. 69 × 56 px). Das ist scharf für 2-fache Displays und auf 3-fachen (bräuchten ca. 207 px) minimal weich.
Ein Ersatz aus dem Händlerportal am besten als PNG mit Transparenz im Seitenverhältnis 1024 : 830 (ca. 1,234) auf etwa diese Größe skalieren:
Header und Footer messen die Breite aus dem Seitenverhältnis der Datei, ein anderes Verhältnis verschiebt dort die Navigation um Bruchteile
eines Pixels. Größere Dateien kosten nur Ladezeit.

Der Hero-Clip (`assets/hero-loop*` und `assets/hero-poster.webp`) ist KI-generiert. Herkunft, Dateien und die vor dem Livegang zu klärenden
Rechtsfragen stehen in [`docs/hero-clip.md`](docs/hero-clip.md). Er lässt sich unter denselben Dateinamen ersetzen.
