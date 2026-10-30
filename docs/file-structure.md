# Dateistruktur: Service-Bereich

Wer welche Datei verantwortet. Plan: [`plan-service-werkstatt.md`](plan-service-werkstatt.md), für Etappe 3 [`plan-ueber-uns-h.md`](plan-ueber-uns-h.md).

## Etappe 1: Werkstatt-Seite (live)

| Datei | Neu / geändert | Schritt |
|---|---|---|
| `sections/build-book.liquid` | neu | implement:werkstatt-build-book |
| `blocks/build.liquid` | neu | implement:werkstatt-build-book |
| `blocks/build-photo.liquid` | neu | implement:werkstatt-build-book |
| `assets/build-book.css` | neu | implement:werkstatt-build-book |
| `assets/build-book.js` | neu | implement:werkstatt-build-book |
| `assets/umbau-*.jpg` (16 Fotos × 2–3 Größen) | neu | implement:werkstatt-build-book |
| `sections/service-subnav.liquid` | neu | implement:service-ia-nav |
| `sections/workshop-services.liquid` | neu | implement:werkstatt-build-book |
| `templates/page.werkstatt.json` | neu | implement:werkstatt-build-book |
| `assets/header.js` | geändert (nur `PS.headerQuiet`) | implement:service-ia-nav |
| `docs/bildliste.md`, `docs/plan-service-werkstatt.md` | geändert | implement:werkstatt-build-book |

## Etappe 2: Service-Seite, „Komm vorbei“, Kontakt (gebaut, nicht gepusht)

| Datei | Neu / geändert | Inhalt |
|---|---|---|
| `sections/service-page.liquid` | geändert | Türen, Kaufweg mit Schritt-Nummern, Anfrage-Zeilen, Events mit Hinweis; Chip-Leiste und Block „Standort“ entfernt |
| `templates/page.service.json` | geändert | Sektionen `subnav` (klebend), `main`, `standort`; Blöcke `tuer_werkstatt` und `lieferung` neu, `werkstatt` und `standort` entfernt |
| `sections/visit.liquid` | neu | „Komm vorbei“: Karte, Adresse, Route, Öffnungszeiten, Kontakt-Box |
| `templates/page.contact.json` | neu | Seitenkopf und „Komm vorbei“ für `/pages/contact` |
| `snippets/step-no.liquid` | neu | Schritt-Nummer mit Text für Screenreader |
| `assets/karte-dreilaendereck-{800,1200,1600}.webp` | neu | Karte des Dreiländerecks (OpenStreetMap) |
| `snippets/contact-box.liquid`, `assets/contact.js` | geändert | Variante `compact`, `hours: false`, Thema „Lieferung“ |
| `sections/service-subnav.liquid`, `assets/pages.js` | geändert | Einstellung „Kleben“, Scrollspy, Verlauf am Rand, aktueller Crumb |
| `assets/pages.css` | geändert | Service-Seite, Türen, Leiste, „Komm vorbei“ (aus `sections.css` hierher verschoben) |
| `assets/sections.css` | geändert | alter Service-Block entfernt |
| `assets/header.css` | geändert | Übergang der klebenden Leiste beim Ein- und Ausblenden des Headers |
| `assets/shop.css` | geändert | Anfrage-Zeile (`.contact-row`) |
| `snippets/bento-tile.liquid`, `assets/home.css` | geändert | optionale `id`, `sizes`, `srcset`, Bildausschnitt; helle Schrift auch auf hellem Grund |
| `snippets/partner-offer.liquid` | geändert | Schritt-Nummer, Ersatzlink `fallback_url` |
| `snippets/mega-menu.liquid` | geändert | „… im Überblick“ unter flachen Listen |
| `sections/page.liquid` | geändert | keine leere Fläche ohne Seitentext |
| `sections/build-book.liquid`, `assets/build-book.css`, `assets/build-book.js`, `templates/page.werkstatt.json` | geändert | Seitenkopf wie die Bekleidungsseiten statt eigenem Kopf; Termin-Link und Zählung entfernt |
| `sections/workshop-services.liquid`, `assets/home.css` | geändert | Leistungen als Service-Kacheln; Kacheln ohne Link ohne Hover |
| `snippets/contact-box.liquid` | geändert | Parameter `number`, `bare`, `class`, `dark` |
| `snippets/partner-offer.liquid`, `sections/service-page.liquid` | geändert | Stichpunkte, Kontakt-Karte des Shops, Fotoausschnitt; Ablauf (steps) und Checkliste |
| `assets/pages.css`, `assets/shop.css` | geändert | Ablauf, Checkliste, Crumb „SERVICE“, Brotkrumen unter 1024 px aus |
| `assets/film-banner.js` | neu | Seitenkopf mit Film (Start, Pause, Tiefe), vorher in `collection.js`; lädt aus `sections/collection.liquid` und `sections/build-book.liquid` |
| `assets/collection.js` | geändert | Film-Code nach `film-banner.js` verschoben |
| `assets/werkstatt-intro.mp4`, `assets/werkstatt-intro-poster.jpg` | neu | Film im Werkstatt-Kopf (Ping-Pong-Schleife) |
| `blocks/build.liquid` | geändert | Knopf „Alle Bilder ansehen“ hell auf dem schwarzen Info-Feld |
| `sections/build-book.liquid`, `assets/build-book.css` | geändert | Einleitungsband in der Schrift des Willkommensblocks (`.statement__title`/`__text` aus `home.css`), ohne Scrub, knappe Abstände |
| `layout/theme.liquid` | nur Kommentare | Ladeorte von `pages.css` und `pages.js` |
| `docs/*.md`, `PRODUCT.md` | geändert | Plan, Freigaben, Händlerfragen, Motion-API, Architektur |
| Shopify-Admin: Menü `main-menu` | geändert (live) | Service-Unterpunkte umsortiert, Werkstatt vorn |

Ebenfalls lokal offen, aber nicht Teil von Etappe 2: Farbfelder der Motorrad-Karten und die Links auf die Werkstatt-Seite
(`snippets/bike-card.liquid`, `sections/header-group.json`, `templates/index.json`, `sections/statement.liquid`, `sections/service-tiles.liquid`,
`sections/product.liquid`, `assets/components.css`, `assets/sections.js`, `assets/theme.css`).

## Etappe 3: Über uns, Entwurf H (gebaut in `claude/ueber-uns-h`, nicht gepusht)

| Datei | Neu / geändert | Inhalt |
|---|---|---|
| `templates/page.ueber-uns.json` | neu | Vorlage: `subnav`, `head`, `story` (vier Etappen), `team` (acht Personen), `visit` |
| `sections/about-head.liquid`, `assets/about-head.css` | neu | Seitenkopf „Halle, dunkel“ mit Crew-Foto; das Foto setzt sich beim Laden |
| `sections/about-story.liquid`, `assets/about-story.css` | neu | Geschichte: Blöcke „Etappe“, Balken mit Bar & Shield, Vorstufe und Rückfall der Bühne |
| `assets/about-story.js` | neu | Bühne: pinnen, umblättern, Balken, Einrasten, Übergang zum Team, Kopfleiste halten |
| `sections/about-team.liquid`, `assets/about-team.css`, `assets/about-team.js` | neu | Team-Spotlight: Blöcke „Person“, Foto-Wechsel, Raster, Pfeile, Wischen |
| `sections/about-visit.liquid`, `assets/about-visit.css` | neu | „Komm vorbei“ als Etappe: Karte, Adresse, Route, Anrufen, WhatsApp, E-Mail, Lieferhinweis |
| `snippets/visit-map.liquid` | neu | Karte des Dreiländerecks mit Pin und Schild, aus `sections/visit.liquid` herausgelöst (dort unverändert im Ergebnis); Parameter `sizes`, `ring`, `logo`, `reveal`, `address_lines` |
| `sections/visit.liquid` | geändert | Karte über `{% render 'visit-map' %}`, Ausgabe Zeichen für Zeichen gleich |
| `assets/header.js` | geändert | `PS.headerHold(on)` neben `PS.headerQuiet` |
| `assets/tokens.css` | geändert | `--c-orange-on-light`, `--c-hd-orange`, `--photo-grade` |
| `layout/theme.liquid` | geändert | GSAP und ScrollTrigger auch auf `page` mit Suffix `ueber-uns` |
| `assets/ueber-uns-*.jpg` (24 Dateien) | neu | Kopf (Crew), Etappen (1985 Gerhard, 1991 Haus, 2016 Vorplatz, Heute Theke), acht Teamfotos, vier breite Teamausschnitte, Herkunft in `bildliste.md` |
| `docs/ueber-uns-h-design.md`, `docs/plan-ueber-uns-h.md` | neu | Spec (Kopie von `entwuerfe/ueber-uns/design-ueber-uns-h.md`) und Plan |
| `docs/qa/ueber-uns-checks.js`, `docs/qa/karte-ausschneiden.py` | neu | Prüfgerüst für die Vorschau (`UU.run`) und Vergleich der Karte vor und nach dem Umbau des Snippets. Werden nicht ausgeliefert |
| `docs/architecture.md`, `docs/motion-api.md`, `docs/file-structure.md`, `docs/bildliste.md` | geändert | Etappe 3, Skript-Tabelle und `PS.headerHold`, diese Tabelle, Bildliste |
