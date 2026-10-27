# Werkstatt: Umbau-Buch – Recherche

Stand 2026-10-26. Grundlage für den Plan in [`docs/plan-service-werkstatt.md`](../plan-service-werkstatt.md).

## Findings

### Muster auf 21st.dev (geprüfte Seiten, Quelltechnik in den öffentlichen Quellen der Autoren nachgelesen)

| Familie | Komponente | URL | Technik | Portierung nach Vanilla-JS + GSAP |
|---|---|---|---|---|
| Story je Umbau | Sticky Content Wrapper (Hyperiux) | https://21st.dev/@hyperiux/components/sticky-content-wrapper | GSAP-Timeline mit ScrollTrigger, Bild-Wischen per clip-path, Stapel-Fallback am Handy | leicht, ist schon GSAP |
| Story je Umbau | Stacking Cards (Fancy Components) | https://21st.dev/@danielpetho/components/stacking-cards | Karten kleben oben, nächste schiebt sich darüber, nur transform | leicht |
| Kartenstapel | Card Deck Carousel | https://21st.dev/@kedhareswer/components/card-deck-carousel | Stapel, oberste Karte wird weggeschnippt | mittel |
| Leiste zum Aufklappen | Spine Accordion (Crafter UI) | https://21st.dev/@crafterui/components/spine-accordion | senkrechte Rücken mit Titel, einer öffnet sich, ohne Abhängigkeiten | leicht |
| Leiste zum Aufklappen | Hover Expand (SmoothUI) | https://21st.dev/@educalvolpz/components/hover-expand | flex-grow-Animation, Hover nur bei feinem Zeiger, Tippen am Touch | leicht |
| Bilder in einem Umbau | Shared Element Gallery | https://21st.dev/@jahed/components/shared-element-gallery | angetipptes Bild wird zur Großansicht (Flip), Wegziehen schließt | mittel |

Insgesamt 18 Komponenten in fünf Familien geprüft. Die vollständige Liste mit Hinweisen zu Hover-Fallen und teuren Effekten
liegt in den Session-Notizen; die Tabelle enthält die Muster, aus denen die drei Vorschläge gebaut sind.

Aussortiert für diesen Zweck:
- Cursor-Spuren und Focus Cards reagieren nur auf Hover und funktionieren am Handy nicht.
- WebGL-Galerien und Weichzeichner-Hintergründe sind auf 3440 px mit Intel-Grafik zu teuer.
- Buch-Blättern (Page Flip) ist bei 390 px zu fummelig.

### Technik und Plattform

- GSAP 3.15.0 liegt im Theme (`assets/gsap.min.js`). Seit 3.13 sind Flip, SplitText, Observer und Draggable frei nutzbar:
  https://gsap.com/blog/3-13/. Flip-Doku: https://gsap.com/docs/v3/Plugins/Flip/. Im Theme liegen heute nur gsap und
  ScrollTrigger. Vorschlag C braucht zusätzlich `Flip.min.js` als Asset.
- `layout/theme.liquid` lädt GSAP nur bei aktiver Einstellung „Animationen aktivieren“, Lenis nie auf Touch-Geräten. Das Umbau-Buch
  muss ohne beide vollständig bedienbar sein (Grundzustand: alle Umbauten untereinander).
- Seitenwechsel mit Übergang wären über View Transitions zwischen Dokumenten möglich:
  https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API und
  https://developer.mozilla.org/en-US/docs/Web/CSS/@view-transition. Für den Plan nicht nötig, weil jedes Umbau-Buch auf einer Seite bleibt.
- Shopify: eigene Seiten brauchen Seitenvorlagen `templates/page.<name>.json`, die der Seite im Admin zugewiesen werden:
  https://shopify.dev/docs/storefronts/themes/architecture/templates und
  https://shopify.dev/docs/storefronts/themes/architecture/templates/alternate-templates.
  Section-Blöcke mit Einstellungen: https://shopify.dev/docs/storefronts/themes/architecture/sections/section-schema.
  Verschachtelte Blöcke (ein Umbau mit beliebig vielen Bild-Blöcken) gehen über Theme-Blöcke:
  https://shopify.dev/docs/storefronts/themes/architecture/blocks/theme-blocks.
- Dateien in `assets/` liefert Shopify unverändert aus; das CDN skaliert sie nicht (`snippets/media.liquid`). Für ein srcset braucht jedes
  Umbau-Foto vorab skalierte Dateien (zum Beispiel 720, 1600 und 2560 px).

## Key Data

| Messung (Prototyp, Chrome, Intel-Grafik) | 1440 × 900 | 3440 × 1440 |
|---|---|---|
| A: Karte wegwischen (nur transform) | 75 fps, 0 lange Frames | 75 fps, 0 lange Frames |
| B: Tor öffnen, erste Fassung (Breiten-Animation) | 75 fps | 50 fps, 29 von 74 Frames über 25 ms |
| B: Tor öffnen, Paneele nur per transform | 75 fps | 74 fps, 1 von 74 Frames über 25 ms |
| C: Umbau wählen (Flip) | 75 fps | 74 fps, 1 von 74 Frames über 25 ms |
| C: Lupe öffnen (Flip) | 75 fps | 74 fps, 1 von 74 Frames über 25 ms |

Bilder: 8 Fotos in `pics_to_use/custom-*`.
- 6 davon sind HEIC vom iPhone als 512er-Kachelraster mit 4032 × 3024 px (Low Rider ST 1: 4284 × 5712 px).
- 3 davon (falk3, falk4, police1) sind ohne Drehung gespeichert und müssen um 90° gedreht werden.
- ffmpeg 8.1 setzt die Kacheln nicht von selbst zusammen. Das Umwandeln braucht ein xstack-Raster über alle Kachel-Streams.

## Image Sources

- Umbau-Fotos: vom Händler geliefert (`pics_to_use/custom-falk`, `custom-lowriderst`, `custom-police`).
- Team und Gebäude: Einzel-, Team- und Gebäudefotos liegen beim Händler, noch nicht im Repo.
- Teamfoto-Collage `assets/powershop-team.webp` (bereits im Theme).

## UNVERIFIED Items

- UNVERIFIED: Basis-Modelle der Umbauten. In den Prototypen stehen Softail Standard, Low Rider ST und Electra Glide, aus den Fotos abgelesen.
- UNVERIFIED: Die Umbau-Listen in den Prototypen sind aus den Fotos abgelesen und müssen durch die Angaben des Händlers ersetzt werden.

## UNKNOWNS

- Ob Besitzer und Personen auf den Fotos (falk2) der Veröffentlichung zugestimmt haben.
- Ob das teilweise lesbare Kennzeichen auf falk3 unkenntlich gemacht werden soll.
- Texte für „Über uns“ (Geschichte, Rollen, Sätze je Person).

CONFIDENCE: 8/10
