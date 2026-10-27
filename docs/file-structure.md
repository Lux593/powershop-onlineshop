# Dateistruktur: Werkstatt-Seite (Etappe 1)

Wer welche Datei verantwortet. Keine Datei gehört zwei Schritten.

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

## Nicht angefasst (Etappe 2 und fremde Arbeit)

- `templates/page.service.json`, `sections/service-page.liquid`: die Service-Gliederung kommt in Etappe 2.
- `templates/index.json`, `sections/statement.liquid`, `assets/sections.js`, `assets/shop.css`, `docs/freigaben.md`: hier liegen nicht committete Änderungen einer anderen Session. Die Links auf die neue Werkstatt-Seite stelle ich erst in Etappe 2 um.
- `layout/theme.liquid`: Die Section lädt ihr CSS und JS selbst, das Layout bleibt unverändert.
