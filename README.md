# Power Shop – Shopify-Theme

Shopify-Theme für den Harley-Davidson-Onlineshop **Power Shop**: eine deutsche Firma und offizieller H-D-Vertragshändler.

Das Theme liegt im Wurzelverzeichnis dieses Repositorys – so verlangt es die
[Shopify-GitHub-Integration](https://help.shopify.com/manual/online-store/themes/github). Es ist in sich
geschlossen: eigene Assets, Schriften und Icons, kein Build-Step.

- **Briefing & Komponenten:** [`docs/briefing.md`](docs/briefing.md)
- **Bildliste (Shotlist):** [`docs/bildliste.md`](docs/bildliste.md)
- **Motion-Schicht (Vertrag, Datei-Aufteilung):** [`docs/motion-api.md`](docs/motion-api.md)
- **Hero-Clip (Herkunft, offene Rechtsfragen):** [`docs/hero-clip.md`](docs/hero-clip.md)

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
templates/  index · collection (+ .motorrad) · product (+ .motorrad, .teil) · page (+ .service) · cart · search · blog · article · 404
sections/   hero · service-tiles · product-tabs · category-bento · showroom · story-events · header · footer · collection · product · cart-drawer …
snippets/   Karten, Preis, Galerie, Megamenü, Filter, Größentabelle, Bild-Snippet `media` …
assets/     CSS, JS, Bilder, Videos, Schriften (flach, Shopify kennt keine Unterordner in assets/), Details unten
config/     settings_schema.json · settings_data.json
locales/    de.default.json
docs/       Briefing, Bildliste, Motion-API, Hero-Clip, Auftrag Motion
pics_to_use/ Quellbilder für Kategorien und Team
```

### assets/

| Datei | Inhalt |
|---|---|
| `tokens.css` · `base.css` · `components.css` | Design-Tokens, Reset und Typografie, wiederverwendbare Bausteine (Karten, Buttons, Tabs, Schienen) |
| `sections.css` | geteilte Reste: Events, Service-Seite |
| `theme.css` | Ergänzungen fürs Shopify-Theme |
| `motion.css` · `motion.js` | Motion-Schicht: Einblenden beim Scrollen, Wort-Splitter, Zahlen-Zählen, Lauftext, Parallax, weiches Scrollen |
| `gsap.min.js` · `ScrollTrigger.min.js` · `lenis.min.js` | Bibliotheken der Motion-Schicht, self-hosted, nur auf Startseite, Kollektion und Produkt |
| `header.css` · `header.js` | Ankündigungsleiste, Header, Megamenü, Mobile-Menü, Such-Dialog |
| `hero.css` · `hero.js` | Hero mit Modell-Tabs (`hero.js` lädt nur auf der Startseite) |
| `home.css` · `home.js` | Startseiten-Bereiche: Service-Leiste, Produkt-Tabs, Kategorie-Bento, Showroom, Story |
| `footer.css` | Footer und Cookie-Banner |
| `shop.css` | Kategorieseite, Produktseite, Warenkorb und Drawer |
| `theme.js` · `cart.js` · `search.js` · `contact.js` · `sections.js` | JS-Module auf allen Seiten: Kern (Dialoge, Tabs), Warenkorb, Suche, Kontakt-Box, Showroom und Quick-Add |
| `collection.js` · `product.js` | JS nur auf Kollektion und Suche bzw. Produktseite |
| `*.jpg` · `*.png` · `*.webp` · `*.mp4` · `*.webm` · `*.woff2` | Bilder, Videos und Schriften ([`docs/bildliste.md`](docs/bildliste.md), [`docs/hero-clip.md`](docs/hero-clip.md)) |

Alle CSS-Dateien laden auf jeder Seite, die Reihenfolge in `layout/theme.liquid` ist die Kaskade. Welche Klasse in welcher Datei liegt
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

Versandschwelle, Rückgabefrist, Newsletter-Rabatt und Reservierungsgebühr haben noch **Beispielwerte** und erscheinen so im Shop
(Ankündigungsleiste, Warenkorb, Newsletter, Bike-Seite). Vor dem Livegang prüfen und anpassen.

## Bilder austauschen

Fotos unter **demselben Dateinamen** und im gleichen Seitenverhältnis nach `assets/` legen.
Motiv und Format stehen in [`docs/bildliste.md`](docs/bildliste.md).

Dateien, die noch Platzhalter sind, stehen in den Theme-Einstellungen unter **Platzhalterbilder**. Im Shop bleiben sie unsichtbar
(im Theme-Editor sind sie zu sehen). **Nach dem Austausch den Dateinamen aus dieser Liste streichen**, sonst bleibt das neue Foto ausgeblendet.
Ein im Theme-Editor gewähltes Bild hat immer Vorrang und braucht keinen Eintrag.

Das H-D Bar & Shield liegt als `assets/hd-bar-shield.png`: 190 × 154 px mit transparentem Hintergrund, rund das 2,75-Fache der größten
Darstellung (Footer, ca. 69 × 56 px). Das ist scharf für 2-fache Displays und auf 3-fachen (bräuchten ca. 207 px) minimal weich.
Ein Ersatz aus dem Händlerportal am besten als PNG mit Transparenz im Seitenverhältnis 1024 : 830 (ca. 1,234) auf etwa diese Größe skalieren:
Header und Footer messen die Breite aus dem Seitenverhältnis der Datei, ein anderes Verhältnis verschiebt dort die Navigation um Bruchteile
eines Pixels. Größere Dateien kosten nur Ladezeit.

Der Hero-Clip (`assets/hero-loop*` und `assets/hero-poster.webp`) ist KI-generiert. Herkunft, Dateien und die vor dem Livegang zu klärenden
Rechtsfragen stehen in [`docs/hero-clip.md`](docs/hero-clip.md). Er lässt sich unter denselben Dateinamen ersetzen.
