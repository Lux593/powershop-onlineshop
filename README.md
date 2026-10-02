# Power Shop – Shopify-Theme

Shopify-Theme für den Harley-Davidson-Onlineshop **Power Shop**: eine deutsche Firma und offizieller H-D-Vertragshändler.

Das Theme liegt im Wurzelverzeichnis dieses Repositorys – so verlangt es die
[Shopify-GitHub-Integration](https://help.shopify.com/manual/online-store/themes/github). Es ist in sich
geschlossen: eigene Assets, Schriften und Icons, kein Build-Step.

- **Briefing & Komponenten:** [`docs/briefing.md`](docs/briefing.md)
- **Bildliste (Shotlist):** [`docs/bildliste.md`](docs/bildliste.md)

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
sections/   24 Sections, u. a. hero · category-bento · service-tiles · showroom · story-events · header · footer
snippets/   Karten, Preis, Galerie, Megamenü, Filter, Größentabelle …
assets/     tokens.css (Design-Tokens) · base.css · components.css · sections.css · theme.css · JS-Module · Bilder · Schriften
config/     settings_schema.json · settings_data.json
locales/    de.default.json
docs/       briefing.md · bildliste.md
pics_to_use/ Quellbilder für Kategorien und Team
```

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

Das H-D Bar & Shield liegt als `assets/hd-bar-shield.png` (Seitenverhältnis ca. 1446 × 1174).
