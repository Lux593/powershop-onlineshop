# Architektur: Werkstatt-Seite mit Umbau-Buch

Stand 2026-10-26. Etappe 1 aus [`plan-service-werkstatt.md`](plan-service-werkstatt.md). Entschieden mit dem Händler:
- Variante B „Garagen-Boxen“, im Prototyp in vier Runden verfeinert
- Pflege im Theme-Editor
- Test direkt auf `main`

Recherche und Messwerte: [`research/werkstatt-umbau-buch.md`](research/werkstatt-umbau-buch.md).

## Technik

Das Theme ist ein Shopify-Liquid-Theme ohne Build-Step. Es gilt dieselbe Bauweise wie im übrigen Theme:
- Sections mit Blöcken
- JS-Module über `PS.on` (`assets/theme.js`)
- Farben, Schrift und Abstände aus `assets/tokens.css`

Neu ist nur, dass erstmals **Theme-Blöcke** (`blocks/`) genutzt werden. Ein Umbau enthält beliebig viele Bild-Blöcke, und das geht nur mit verschachtelten Theme-Blöcken (https://shopify.dev/docs/storefronts/themes/architecture/blocks/theme-blocks/schema).

Keine Bibliothek: Die Seitenvorlagen laden kein GSAP. Bewegung läuft über CSS-Übergänge und die Web Animations API, und zwar nur über `transform` und `opacity`. Die Box-Paneele verschieben sich, statt ihre Breite zu ändern, denn die Breiten-Animation fiel bei 3440 × 1440 auf 50 fps.

## Bausteine

```
templates/page.werkstatt.json
├─ sections/service-subnav.liquid      Unternavigation der Service-Seiten (Untermenü „Service“ aus main-menu)
├─ sections/build-book.liquid          Umbau-Buch: Kopf, Box-Reihe, Vollbild-Dialog
│   └─ blocks/build.liquid             ein Umbau: Paneel (Titelbild, Name hochkant), Raum (Infos auf Creme, Bildblock)
│       └─ blocks/build-photo.liquid   ein Foto: Bildfeld oder Standarddatei aus assets/, Maße, Alt-Text
└─ sections/workshop-services.liquid   Werkstatt-Leistungen (Liste, am Handy 2 × 2 Kacheln) + Termin-Box (snippets/contact-box)

assets/build-book.css   Darstellung (lädt nur mit der Section)
assets/build-book.js    Verhalten: Paneele, Bildblock-Layout, Vollbild, Einpassen der Infos, Handy-Scroll
assets/header.js        + PS.headerQuiet(ms): Header bleibt beim gezielten Scrollen stehen
```

## Datenfluss

- **Inhalte** liegen in `templates/page.werkstatt.json` als Block-Einstellungen. Der Händler ändert sie im Theme-Editor. Die vier Umbauten mit je vier Fotos sind dort vorbelegt.
- **Fotos:**
  - Gewählt im Bildfeld: CDN mit `image_url` und srcset.
  - Sonst die Standarddatei aus `assets/`. Das CDN skaliert sie nicht, deshalb gibt es je Foto vorab skalierte Dateien (720 / 1280 / 1920 px) und ein srcset aus den Einstellungen.
- **Liquid → JS:** Liquid rendert das vollständige Markup, ohne Skript stehen alle Umbauten untereinander mit ihren Fotos. Jedes Foto trägt `data-w`, `data-h` und `data-full`. Daraus berechnet das JS den Bildblock und das Vollbild.
- **Zustand:** Er lebt nur im JS-Modul (welcher Umbau offen ist, Paneelbreiten). Nichts wird gespeichert.

## Fehler und Randfälle

| Fall | Verhalten |
|---|---|
| Kein Skript | Alle Umbauten stehen untereinander, Fotos als einfaches Raster, nichts ist versteckt. |
| `prefers-reduced-motion` | Keine Fahrten und kein Morphing, Zustände wechseln sofort. |
| Umbau ohne Fotos | Das Paneel erscheint ohne Bild. Im Theme-Editor steht ein Hinweis, im Shop wird der Umbau ausgelassen. |
| Mehr als 7 Fotos | Der Bildblock zeigt 7 Kacheln, die letzte mit „+N“. Das Vollbild enthält alle Fotos. |
| Langer Text | Die Infos werden eingepasst (`--fit`, mindestens 62 %). Reicht das nicht, wird die Box höher, sie scrollt aber nie. |
| Theme-Editor | `PS.on` startet nach jedem Section-Reload neu. Ein ausgewählter Block öffnet seinen Umbau (`shopify:block:select`). |
| Header blendet aus | `PS.headerQuiet` hält ihn beim Öffnen am Handy, und das Scroll-Ziel wird aus dem Header-Zustand berechnet. |

## Fitness Functions

1. **Neuer Umbau:** Kein Code. Im Theme-Editor wird ein Block „Umbau“ mit Bild-Blöcken angelegt (0 Dateien). Bei fest eingebauten Standardbildern ändern sich nur `assets/` und die Vorlage.
2. **Externe API:** Keine. Die Kontaktwege kommen aus den Theme-Einstellungen (Händlerdaten) über das bestehende `snippets/contact-box.liquid`.
3. **Neues Aussehen:** `assets/build-book.css` und `assets/tokens.css`, also 1 bis 2 Dateien.
4. **Isoliert testbar:** Jede Section rendert für sich. Das JS-Modul hängt nur an `PS.on` und braucht keine andere Section.

CONFIDENCE: 8/10
