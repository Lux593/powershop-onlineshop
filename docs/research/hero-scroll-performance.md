# Hero-Scroll-Übergang: Performance-Recherche

Anlass: Der Übergang vom Startseiten-Hero in den Willkommensblock ruckelt am Desktop (Text wächst nach oben rechts hinaus);
sobald der Hero weggescrollt ist, läuft die Seite flüssig. Betroffen ist nur der Desktop-Scrub in `assets/hero.js`
(`PS.motion.add`, ab 768 px). Am Handy gibt es kein Skript, dort steht der Film fest (`hero.css`).

## Messaufbau

Kein Store-Login für `shopify theme dev`, daher ein statischer Nachbau von Hero, Header (is-solid, Blur) und Willkommensblock
mit den echten Theme-Dateien (CSS, hero.js, motion.js, home.js, GSAP, ScrollTrigger, Lenis, Filme). Chrome (headed) über
Playwright 1.64, 1440 × 900, DPR 1,5, Monitor 75 Hz. Mausrad-Scroll über die Hero-Höhe (Phase „Hero“), dann gleiche Strecke
weiter (Phase „danach“). Gemessen: Bildabstände per requestAnimationFrame und Chrome-Trace (RasterTask je Sekunde).
Je Variante 2–3 Läufe, Mittelwerte. Ruckler = Bild länger als 1,5 × 13,3 ms.

## Befund

| Variante | fps Hero | Ruckler | p95 | Raster ms/s | fps danach |
|---|---|---|---|---|---|
| heute | 32 | 40 | 76 ms | 360 | 68 |
| nur `will-change: transform` | 48 | 20 | 60 ms | 14 | 71 |
| Film ohne Zoom (Text ohne will-change) | 39 | 54 | 73 ms | 637 | 72 |
| Film ohne Zoom + will-change | 74 | 1 | 13 ms | 18 | 75 |
| Header ohne Blur | 15 | 55 | 160 ms | 364 | 62 |

Zwei Ursachen, beide nötig für flüssiges Scrollen:

1. **Film-Zoom (scale 1 → 1,4) bei laufendem Video** lässt Bilder ausfallen. Ohne Video (nur Poster) läuft derselbe Zoom flüssig.
2. **Text-Scale (1 → 1,45)**: Chrome rastert Inhalte bei jeder Scale-Änderung neu, bis zu 60-mal pro Sekunde
   ([Chrome: Re-rastering composited layers on scale change](https://developer.chrome.com/blog/re-rastering-composite)).
   Ergebnis: rund 300 ms Rasterarbeit pro Sekunde. Mit `will-change: transform` bleibt die Rasterung fest (Text wird beim
   Vergrößern leicht weich), die Last fällt auf 14 ms/s.

Der Header-Blur ist nicht die Ursache: Ohne ihn wird es in diesem Aufbau sogar langsamer (vermutlich andere Video-Komposition).
Der Wort-Scrub des Willkommensblocks läuft auch danach und bleibt flüssig.

## Alternativen (nur translate und opacity auf festen Ebenen)

| Variante | Idee | fps Hero | Ruckler | p95 |
|---|---|---|---|---|
| Fix | heutige Durchfahrt, Film ohne Zoom (nur Parallax), Text mit will-change | 72 | 3 | 18 ms |
| Band | Text zieht in drei Ebenen nach links hinaus (Headline am schnellsten), wie beim Modellwechsel; Film-Parallax; ins Helle | 74 | 1 | 13 ms |
| Band + Neiger | wie Band, Headline neigt sich beim Hinausziehen (skewX 14°) | 70 | 5 | 22 ms |
| Rolltor | Film steht (wie heute am Handy), Willkommensblock fährt mit Schatten darüber, Text hebt ab, Film dunkelt ab | 74 | 1 | 13 ms |
| Fenster | einfarbige Rahmenleisten schieben sich herein, der Film wird zum Bildfenster in der hellen Wand | 70 | 6 | 18 ms |
| Fenster (clip-path) | wie Fenster, aber per clip-path inset | 63 | 11 | 31 ms |

`clip-path` auf der Filmebene zeichnet bei jedem Bild neu; Chrome arbeitet an Compositor-Animationen für clip-path, per Skript
gesetzte Werte profitieren davon nicht ([Chromium: CompositeClipPathAnimation](https://chromium.googlesource.com/chromium/src/+/2046e4fa2793ed86558e61a8c4e2e597fcb24f0c%5E%21)).
Rahmenleisten (einfarbige Flächen, nur verschoben) sind günstiger.

Option für später: CSS-Scroll-Animationen (`animation-timeline: view()`) laufen ohne Main-Thread und bleiben auch bei
schwerem JavaScript flüssig ([Chrome: Scroll-driven animations performance case study](https://developer.chrome.com/blog/scroll-animation-performance-case-study)).
Mit Lenis setzt allerdings der Main-Thread die Scrollposition; der Vorteil wäre kleiner als ohne Lenis. Nicht gemessen.

## UNVERIFIED

- UNVERIFIED: Warum Film-Zoom nur mit laufendem Video Bilder verliert (Vermutung: Video-Ebene wird pro Bild neu skaliert und
  zusammengesetzt, bei Windows ggf. Overlay-Wechsel). Gemessen ist nur das Verhalten, nicht der Mechanismus.
- Nur Chrome/Windows gemessen. Safari und Firefox nicht.

## UNKNOWNS

- Verhalten auf schwächeren Laptops (integrierte Grafik) und 120-Hz-Monitoren.

CONFIDENCE: 8/10
