# Power Shop – Shopify-Theme

Shopify-Theme für den Harley-Davidson-Onlineshop **Power Shop**: eine deutsche Firma und offizieller H-D-Vertragshändler.

Das Theme liegt in [`theme/`](theme) und ist in sich geschlossen – eigene Assets, Schriften und Icons, kein Build-Step.

- **Briefing & Komponenten:** [`docs/briefing.md`](docs/briefing.md)
- **Bildliste (Shotlist):** [`docs/bildliste.md`](docs/bildliste.md)

## Entwickeln

```bash
shopify theme dev --path theme
# Vorschau: http://127.0.0.1:9292
```

Die Vorschau lädt Änderungen an Liquid, CSS und JavaScript automatisch nach.

| Befehl | Zweck |
|---|---|
| `shopify theme dev --path theme` | Lokale Vorschau mit Live-Reload |
| `shopify theme check --path theme` | Theme auf Liquid- und Schema-Fehler prüfen |
| `shopify theme push --path theme` | Theme in den Store hochladen |
| `shopify theme pull --path theme` | Änderungen aus dem Theme-Editor zurückholen |

## Struktur

```
theme/layout/     theme.liquid · password.liquid
theme/templates/  index · collection (+ .motorrad) · product (+ .motorrad, .teil) · page (+ .service) · cart · search · blog · article · 404
theme/sections/   24 Sections, u. a. hero · category-bento · service-tiles · showroom · story-events · header · footer
theme/snippets/   Karten, Preis, Galerie, Megamenü, Filter, Größentabelle …
theme/assets/     tokens.css (Design-Tokens) · base.css · components.css · sections.css · theme.css · JS-Module · Bilder · Schriften
theme/config/     settings_schema.json · settings_data.json
theme/locales/    de.default.json
docs/             briefing.md · bildliste.md
pics_to_use/      Quellbilder für Kategorien und Team
shopify-theme/    Referenzkopie des Horizon-Basisthemes (nur zum Nachschauen)
```

## Händlerdaten pflegen

Telefon, WhatsApp, E-Mail, Öffnungszeiten, Versandschwelle und Reservierungsgebühr sind Theme-Einstellungen
(`theme/config/settings_schema.json`) und lassen sich im Shopify-Theme-Editor ändern – kein Eingriff im Code nötig.

## Bilder austauschen

Fotos unter **demselben Dateinamen** und im gleichen Seitenverhältnis nach `theme/assets/` legen.
Motiv und Format stehen in [`docs/bildliste.md`](docs/bildliste.md).

Das H-D Bar & Shield liegt als `theme/assets/hd-bar-shield.png` (Seitenverhältnis ca. 1446 × 1174).
