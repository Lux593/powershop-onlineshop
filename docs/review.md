# Review – Konto-Fenster im Header

Unabhängiger Review (eigener Agent, nur lesend) der Änderungen in `sections/header.liquid`, `assets/header.css`, `assets/header.js` und `assets/base.css`, Stand 26.10.2026. Jeder Befund wurde danach im Entwicklungs-Theme nachgeprüft.

## CRITICAL

Keine.

## MEDIUM

1. **`assets/header.css`: Symbol blitzt unter 490 px auf** (bestätigt). `.header__account:not(:defined)` (0,2,0) schlug `display: none` (0,1,0). Bis Shopifys Skript geladen war, stand das Symbol im Handy-Header und verschwand dann; ohne Skript blieb es tot stehen.
   **Behoben:** Die Ausblende-Regel deckt `:not(:defined)` ab.
   **Test:** 390 px mit blockiertem Skript, Symbol unsichtbar, Symbolreihe 284/90 wie live. 768 px zeigt den Platzhalter mit 44×44.
2. **Lenis scrollt hinter dem offenen Fenster** (unbelegt). Gilt nur bei geschlossenem Shadow Root, und der ist offen.
   **Test:** Mausrad bei offenem Fenster, scrollY 0 → 0, mit aktivem Lenis. **Keine Änderung.**

## LOW

3. **`assets/header.js`: Seiten ohne Scrollbalken.** Der rechte Rand wurde nur vor dem Öffnen gemessen.
   **Behoben:** Er wird auch beim Öffnen (`open`) gemessen. Dabei zeigte sich, dass Chrome nach dem Öffnen `clientWidth` samt freigehaltenem Scrollbalken-Platz meldet. Gemessen wird deshalb mit der Breite von `html`.
   **Test:** Warenkorb, Service und Startseite bei 1440 und 3440 px, mit und ohne Scrollbalken: Fenster und Inhaltskante liegen höchstens 0,5 px auseinander, der Header verschiebt sich um 0 px.
4. **`assets/header.js`: Messung bei jedem Tastendruck im E-Mail-Feld.**
   **Behoben:** Gemessen wird nur bei geschlossenem Fenster, Tasten nur Enter und Leertaste.
   **Test:** 0 Messungen beim Tippen.
5. **`assets/header.css`: Handy ins Hochformat drehen, während das Fenster offen ist.** Der Host verschwand per `display: none`, die Seite blieb gesperrt.
   **Behoben:** Die Klasse `is-open` hält das Fenster sichtbar, bis es geschlossen wird.
   **Test:** Erst 844×390, dann 390×844: Fenster offen und sichtbar; nach Esc ausgeblendet.
6. **`assets/header.js`: `accountOpen` bleibt nach dem bfcache hängen.**
   **Behoben:** Bei `pageshow` (persisted) wird der Zustand am Dialog im Shadow Root abgelesen.
   **Test:** Der Dialog ist direkt im Shadow Root auffindbar.
7. **Veraltete Kommentare** in `assets/motion.js` und `assets/motion.css` (body `overflow-x: hidden`).
   **Behoben:** Die Kommentare beschreiben jetzt den früheren und den heutigen Stand.
8. **`sections/header.liquid`, Info-Text der Einstellung** war ungenau.
   **Behoben:** „Voreingestellt ist das Menü der Kontoseiten.“
9. **Unter 490 px kein Konto-Fenster** (Shopify empfiehlt es auch mobil). Das ist bewusst so: Neben dem mittigen Logo (156 px) fehlt der Platz, gemessen bei 320 bis 489 px. Das Handy nutzt den Knopf im Menü. **Bleibt so.**

## Bekannt, kein Fehler

Auf der Startseite ändert sich scrollY beim Öffnen um 5 px. Die Hero-Überschrift in `vw` wird durch `scrollbar-gutter: stable` etwa 1 % kleiner, das Scroll-Anchoring gleicht das aus. Sichtbare Elemente bleiben auf ±0,1 px stehen (`proof3.mjs`).

CONFIDENCE: 8/10
