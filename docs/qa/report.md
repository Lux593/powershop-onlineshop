# QA Report – Konto-Fenster im Header

Stand 26.10.2026. Getestet im Entwicklungs-Theme `Development (7a3772-CH5CG4410V67)` (#200606810456) über die Store-Domain mit `?preview_theme_id=200606810456`, also mit dem echten Shopify-Skript. Live-Theme unverändert.
Werkzeuge: Playwright 1.64 mit Chrome. Desktop im sichtbaren Chrome (echte Scrollbalken), Handy und Tablet mit Touch-Emulation. Filme im Test abgeschaltet (sonst lädt die Seite nie fertig). Keine Anmeldung durchgeführt.

## Test Evidence

- QA-Lauf `validate.mjs`: **52/52 PASS** (3440×1440, 1440×900, 320, 360, 390, 489, 490, 768, 1023 px).
- Beweislauf `proof.mjs`: Öffnen weiter unten auf der Seite per echtem Mausklick, alte gegen neue `assets/base.css`:
  - **alt** (`overflow-x: hidden`): Header beim Öffnen bei top −1459 / −664 / −664 (Startseite / Herren / Service), also aus dem Bild.
  - **neu** (`overflow-x: clip`): Header bei 0, Fenster bündig darunter (77 px).
- `proof3.mjs` (Startseite, Mausrad): Sichtbare Elemente bleiben beim Öffnen stehen (419,6 → 419,5 px, 769,9 → 769,9 px). Die Hero-Überschrift in `vw` wird um etwa 1 % kleiner (die Komponente setzt `scrollbar-gutter: stable`), das Scroll-Anchoring gleicht das oberhalb des Bildausschnitts aus.
- `regress.mjs` / `lock.mjs` für `base.css`: 7 Seiten (Start, Kollektion, Service, 2 Produkte, Suche, Warenkorb) × 320/390/1440 ohne seitliches Scrollen, Header sticky. Scroll-Sperre von Warenkorb-Schublade und Mobilmenü wie live (600 → 600).
- Theme Check: 87 Dateien, keine Befunde.
- Screenshots: `docs/qa/screenshots/kundenkonto-*.png`. Das Handy-Menü mit „ANMELDEN“ ist nur im Scratchpad: es ist fast reine schwarze Fläche (64 KB) und fiele unter die 100-KB-Regel des Gates.

## Test Results

[pass] PASS: Shopify fügt `account.js` und `#shopify-customer-account-data` selbst ein, sobald das Element im Header steht — Lauf desk-3440/desk-1440
[pass] PASS: Knopf 44×44 zwischen Suche und Warenkorb, Name „Konto“ im Accessibility-Baum — ariaSnapshot `button "Konto"`
[pass] PASS: Keine Layout-Verschiebung im Header beim Laden — PerformanceObserver layout-shift: 0 Einträge im Header
[pass] PASS: Hover wie die übrigen Symbolknöpfe — `rgba(255, 255, 255, 0.08)`
[pass] PASS: Fenster oben bündig unter dem Header, mit Ankündigungsleiste (113 px) und nach dem Scrollen (77 px)
[pass] PASS: Rechts bündig mit der Inhaltskante auf 3440 px (2348/2349) und 1440 px (1348/1349) — vorher lag es auf 3440 px etwa 700 px rechts neben dem Symbol
[pass] PASS: Gestaltung — Hintergrund #0a0a0a, Rahmen #2b2b2b, Ecken 2 px, Überschrift Barlow Condensed 700 versal weiß, Feld #1a1a1a mit Rahmen #777 und Inter, Schnelllinks dunkel mit 2 px
[pass] PASS: Header über dem Hero wird schwarz, solange das Fenster offen ist, danach wieder transparent (wie beim Megamenü)
[pass] PASS: Seite scrollt bei offenem Fenster nicht, Header wird nicht weggeschoben
[pass] PASS: Esc schließt, Fokus zurück am Konto-Knopf; Klick daneben schließt; Enter auf dem Knopf öffnet
[pass] PASS: Unter 490 px kein Konto-Symbol im Header, Header identisch mit live (320/360/390/489 px), Mobilmenü-Knopf „Anmelden“
[pass] PASS: Ab 490 px Konto-Symbol im Header, Logo mittig, nichts überlappt (490/768/1023 px); unter 751 px öffnet das Fenster als Blatt von unten
[pass] PASS: `<shopify-store>`, das die Komponente einfügt, erzeugt keine zusätzliche Lücke mehr in der Symbolreihe (Symbolreihe 90 px wie live)
[pass] PASS: `overflow-x: clip` am body: Header bleibt beim Öffnen weiter unten sichtbar (vorher weg), keine Regression bei Überlauf, Sticky und Scroll-Sperre
[warn] WARN: Angemeldeter Zustand (oranger Avatar, Abmelden) nicht getestet — braucht eine echte Anmeldung mit Code
[warn] WARN: Die E-Mail-Anmeldung wechselt für den Code auf Shopifys Seite (`/customer_authentication/login`); deren Aussehen hängt an den Admin-Einstellungen in `docs/kundenkonto.md`, noch nicht umgesetzt
[warn] WARN: „Mit Shop anmelden“ (lila) bleibt sichtbar, bis „Sign in with Shop“ im Admin aus ist; AGB-Link im Fenster ist 404, bis die Richtlinien angelegt sind
[warn] WARN: Safari und Firefox nicht getestet (nur Chrome); `overflow-x: clip` fällt vor Safari 16 auf `hidden` zurück

## Critical Analysis

- **Erster Eindruck:** Das Fenster wirkt wie ein Teil des Headers (schwarz, Stahl-Linie, versale Barlow-Überschrift) und nicht wie ein fremdes Widget. Der lila Shop-Knopf bricht das, bis er abgeschaltet ist.
- **Detail:** Ecken, Rahmen und Abstände folgen den Tokens. Innenabstände und Schriftgrößen im Fenster bestimmt Shopify; die Schnelllinks nutzen Inter statt Barlow (`--shopify-account-font-body` gilt für alles außer der Überschrift).
- **Vollständigkeit:** Auf dem Handy bleibt es bei der Shopify-Seite (Platz im Header). Die Code-Eingabe, Bestellungen und Profil sehen erst nach Teil B nach Power Shop aus.
- **Austausch-Test:** Ohne Logo bleibt der Stil erkennbar (versale Condensed-Überschrift, Orange/Schwarz, eckig).

## Quality Rubric

CODE_QUALITY:     8/10 — kleine, kommentierte Ergänzungen im Stil der Dateien; Lage per Messung statt fester Werte; Ursache des Header-Fehlers an der Wurzel behoben
ARCHITECTURE:     8/10 — Komponente nur über Variablen, Parts und Ereignisse angebunden; keine Kopie von Shopify-Code; Header-Logik in header.js gebündelt
UX_DESIGN:        6/10 — gedeckelt, bis der Nutzer das Fenster live gesehen hat (Lernmuster); sichtbar stimmig, aber Shop-Knopf und Shopify-Seiten noch im Standardlook
COMPLETENESS:     7/10 — Theme-Teil vollständig; angemeldeter Zustand ungetestet, Admin-Teil (Branding, Google, Shop aus) wartet auf den Nutzer
PRODUCTION_READY: 8/10 — Theme Check sauber, keine Regression gemessen, Rückfall für ältere Browser, ein Commit rücknehmbar

COMPOSITE: 7.4/10
LOWEST: UX_DESIGN — gedeckelt bis zur Sichtung; Shopify-Seiten erst nach den Admin-Einstellungen im Markenlook

## Definition of Done Checklist

- [x] Ladezustand: Platzhalter 44×44 bzw. oranger Kreis, bis die Komponente geladen ist
- [x] Fehlerzustand: Formularfehler zeigt die Komponente selbst (Shopify)
- [x] Tastatur: Enter öffnet, Esc schließt, Fokus kehrt zurück
- [x] Hover-Zustand am Knopf
- [x] Schließen-Knopf und Klick daneben, keine Sackgasse
- [x] Keine Konsolenfehler aus dem Theme (nur die im Test abgebrochenen Filme)
- [x] Responsiv 320–3440 px ohne Überlauf

CONFIDENCE: 8/10
VERDICT: APPROVED WITH NOTES
