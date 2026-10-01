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

## Bilder austauschen

Fotos unter **demselben Dateinamen** und im gleichen Seitenverhältnis nach `assets/` legen.
Motiv und Format stehen in [`docs/bildliste.md`](docs/bildliste.md).

Das H-D Bar & Shield liegt als `assets/hd-bar-shield.png` (Seitenverhältnis ca. 1446 × 1174).
