# QA Report: Startseiten-Hero „Band“ (Scroll-Übergang ohne Skalieren)

Geprüft: `assets/hero.js` (Scrub „Band“) und `assets/hero.css` (will-change, Fokus-Rückholung) im Repo-Stand.
Laufzeit: Live-Shop https://powershop-online.myshopify.com/ in Chrome (Playwright 1.64, headed). hero.js und hero.css wurden
nur im Test-Browser per Netzwerk-Umleitung durch den Repo-Stand ersetzt; der Shop selbst ist unverändert.
Gerät wie beim Nutzer: 3440 × 1300 Viewport, DPR 1, Intel-Grafik, Monitor 75 Hz. Lenis und ScrollTrigger aktiv.
Scroll per Mausrad (80 px alle 40 ms) durch Hero, Willkommensblock und Bento. Ruckler = Bild länger als 20 ms.

## Test Evidence

Live, je 3 Läufe (Mittel), Spalten fps / Ruckler / p95:

| Stand | Hero | Willkommensblock | Bento |
|---|---|---|---|
| live heute (Durchfahrt mit Zoom) | 10–15 fps / 44–49 / 107–213 ms | 39–61 fps / 5–13 / 23–67 ms | 69–72 fps / 3–7 |
| Repo „Band“ | 72 fps / 2 / 13 ms | 74 fps / 1 / 14 ms | 74 fps / 1 / 13 ms |

Willkommensblock einzeln abgeschaltet (Band-Prototyp, live, 3 Läufe): ohne Masken-Einzeichnen 71 fps, ohne Wort-Übergang 69,
ohne Zeichnungs-Parallax 73, ganz ohne Scrub 69, mit allem 74. Kein Effekt des Willkommensblocks bremst messbar.
Mit 4-fach gedrosselter CPU liegen alle Varianten bei 19–34 fps (Hauptthread ausgelastet von Lenis, GSAP, ScrollTrigger und
Rendering, in allen Bereichen gleich); eine Sparvariante des Willkommensblocks brachte in der Wiederholung keinen stabilen Gewinn.

Hauptthread live mit Band (1 Lauf, ms Arbeit je Sekunde): requestAnimationFrame 91, Layerize 76, Style 74, scroll-Ereignisse 60,
Paint 52, ScrollTrigger 49, GSAP 21; header.js 3 (ein erster Lauf mit 41 war ein Ausreißer).

Screenshots (docs/qa/screenshots/): hero-band-uw-0_2/0_4/0_6 (3440 px, halbiert), hero-band-lap-0_2/0_4 (1440 px),
hero-band-mob-0/0_4 (390 px, iPhone-Emulation). Zu jeder Ultrawide-Aufnahme protokolliert: Headline-Versatz −76 / −360 / −792 px,
Deckkraft der Textebene 0,92 / 0,62 / 0,10.

## Test Results

[pass] PASS: Hero-Übergang flüssig auf Nutzer-Hardware — 72 fps statt 10–15, p95 13 ms statt 107–213 ms (live, 3 Läufe)
[pass] PASS: Willkommensblock flüssig — 74 fps statt 39–61; das Ruckeln dort kam vom Hero, nicht von Parallax, Maske oder Wörtern
[pass] PASS: Drei Ebenen mit eigener Geschwindigkeit — Headline schneller als Unterzeile, Tabs am langsamsten (Screenshots 3440 und 1440 px)
[pass] PASS: Wege auf 1440 px gedeckelt — bei 3440 px fliegt die Unterzeile nicht weiter als die Headline (−792 px Headline bei 60 %)
[pass] PASS: Tastaturfokus mitten im Scroll (35 %) holt die Textebene zurück — opacity 1, Headline-Transform none (3440, 1440, 390 px)
[pass] PASS: Handy unverändert — 390 px: Film steht, Willkommensblock schiebt sich darüber, kein Scrub-Skript (Screenshots mob)
[pass] PASS: Keine Konsolenfehler und keine GSAP-Warnungen (pageerror und console beobachtet, alle drei Größen)
[pass] PASS: Einzelnes Modell ohne Tab-Leiste — `row || []` verhindert eine GSAP-Warnung für ein fehlendes Ziel
[warn] WARN: Nur Chrome unter Windows gemessen — Safari und Firefox nicht geprüft
[warn] WARN: Ein erster Ultrawide-Screenshot zeigte den Text unbewegt — Aufnahmefehler (Fenster kleiner als Viewport, Resize setzte ScrollTrigger kurz zurück); mit passender Fenstergröße und protokollierten Werten bestätigt
[warn] WARN: Kategorie-Filme der Kollektionsseiten zoomen ebenfalls einen laufenden Film beim Scrollen (shop.css, 1,1 → 1) — vermutlich dieselbe Ursache, nicht Teil dieses Auftrags

## Quality Rubric

CODE_QUALITY:     8/10 — kleine, gezielte Änderung im bestehenden Muster (PS.motion.add, matchMedia, invalidateOnRefresh), Fokus- und Leerfall abgesichert
ARCHITECTURE:     8/10 — Verhalten in hero.js, Ebenen und Fokus in hero.css, Vertrag in docs/motion-api.md nachgezogen
UX_DESIGN:        6/10 — gedeckelt, bis der Nutzer Band live gesehen hat (Lernmuster: UX erst nach Sichtung höher)
COMPLETENESS:     8/10 — Ursache gemessen, Band eingebaut, Willkommensblock geprüft und begründet unverändert gelassen
PRODUCTION_READY: 8/10 — live gegen echte Seite gemessen; noch nicht deployt (Push auf main nur nach Freigabe)

COMPOSITE: 7.6/10
LOWEST: UX_DESIGN — Sichtung durch den Nutzer steht aus

## Definition of Done Checklist

- [x] Funktioniert mit Tastatur (Fokus holt Textebene zurück)
- [x] Reduzierte Bewegung: Scrub läuft nur mit PS.motion.scroll (motion.js baut bei prefers-reduced-motion ab)
- [x] Keine Konsolenfehler oder -warnungen
- [x] Klare Hierarchie im Übergang (Headline führt)
- [x] Keine Sackgassen (Pfeil und Pause-Taste unverändert)

CONFIDENCE: 8/10
VERDICT: APPROVED WITH NOTES
