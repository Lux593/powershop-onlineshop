# Übergabe: Power Shop Theme mit Video-Hero und Motion

Stand: 3. Oktober 2026. Dieser Stand liegt auf GitHub in `main` (und im Branch `claude/laughing-brahmagupta-fldc3b`).
Weil `main` mit dem Shopify-Theme verbunden ist, ist er **live**, sobald die Integration ihn eingespielt hat.

## Was neu ist

- **Startseite**: Vollbild-Hero mit Film (Loop aus einem Road-Glide-Foto, KI-erzeugt, siehe `docs/hero-clip.md`), Modell-Tabs mit Wechsel und Pause-Taste,
  Header transparent über dem Hero. Darunter Service-Kacheln, Neuheiten, Statement, Bento, Showroom und Story mit Einblend-Effekten.
- **Header**: Logo und H-D-Icon führen gemeinsam zur Startseite, der Header blendet beim Runterscrollen aus und beim Hochscrollen wieder ein.
  Das Megamenü ist einfarbig schwarz.
- **Kollektion und Produkt**: Karten mit quadratischem Bild (4 Spalten ab 900 px, 5 ab 1280 px), Produktseite mit Slide-Galerie, Zoom und Kaufleiste auf dem Handy.
- **Warenkorb und Suche**: animierter Drawer, Versandbalken, Statusmeldungen für Screenreader; Seitenübergänge mit kurzem Fade (nicht auf Warenkorb und Kasse).
- **Barrierefreiheit**: Pause für alles, was länger als 5 Sekunden läuft; Reduced-Motion, Windows-Kontrastmodus, Fokus nie verdeckt; angehobene Formularrahmen.

## Notaus im Theme-Editor

*Theme-Einstellungen → Animationen*: **Animationen aktivieren**, **Weiches Scrollen** und **Header auf der Startseite über dem Hero**.
Mit ausgeschaltetem „Animationen aktivieren“ ist die Seite statisch: keine Einblend-Effekte, kein Scrub, der Film startet nicht von selbst (Standbild mit Play-Taste), alles bleibt sichtbar und bedienbar.

## Film und Bilder austauschen

Die Dateien kommen aus `assets/` und lassen sich unter **demselben Namen** ersetzen:

| Datei | Zweck |
|---|---|
| `hero-loop.mp4`, `hero-loop-720.mp4`, `hero-loop.webm` | Film (Desktop, mobil, Alternative); 16:9, ohne Ton, loopfähig |
| `hero-poster.webp`, `hero-poster-960.webp` | Standbild (erstes Bild des Loops), LCP-Bild |
| `hero-ride-road.jpg`, `hero-ride-street.jpg`, `hero-ride-cvo.jpg` | Fotos der Tabs 1 bis 3 |

Im Theme-Editor kann pro Modell stattdessen ein eigener Film und ein Standbild gewählt werden. Weitere Details: `docs/hero-clip.md`, `docs/bildliste.md`.

## Messwerte (Harness mit Testdaten, nicht der echte Shop)

| | Startseite Desktop | Startseite Handy | Kollektion | Produkt |
|---|---|---|---|---|
| JavaScript (Brotli) | 67,4 KiB | 62,2 KiB | 22 bis 27 KiB | 22 bis 28 KiB |
| CLS | unter 0,004 | 0 | unter 0,004 | unter 0,004 |

axe (WCAG 2.1 A/AA) in 42 Läufen ohne Verstoß; 181 Fixture-Tests, 10 Harness-Abläufe und `theme check` ohne Befund.
Das ursprüngliche Ziel von ca. 60 KB JavaScript auf der Startseite ist mit Maus und weichem Scrollen knapp verfehlt (GSAP, ScrollTrigger und Lenis machen ca. 46 KiB aus).

## Ladezeit mobil (Lighthouse): was gemessen wurde

Lighthouse mobil (Moto G Power, Slow 4G, CPU 4x) schwankt auf der Startseite stark: in 29 Läufen gegen den Live-Shop liegt der Median bei Score 95, FCP 2,0 s, LCP 2,6 s.
Läufe, in denen Chrome den ersten Frame um etwa eine Sekunde verzögert (beobachteter FCP 1,2 bis 1,5 s statt 0,3 s), kommen auf Score 55 bis 75 und LCP 5 bis 7 s. Der Hero ist dabei nicht schuld:
das Poster ist im HTML auffindbar, `fetchpriority="high"`, nie ausgeblendet und der Hauptthread ist in der Wartezeit leer. Im Nachbau mit HTTP/2 und Brotli trat die Verzögerung nur unter CPU-Last auf und verschwand
mit dem Chrome-Flag `--disable-features=PaintHolding,PaintHoldingCrossOrigin` (0 von 8 statt 7 von 8). Der Effekt ist ein Mess- und Browserverhalten, kein belegter Theme-Defekt. Vermutung aus der Spurauswertung: Lighthouse
rechnet bei spätem LCP alle bis dahin geladenen Skripte in den simulierten Wert ein (überwiegend Shopify-Plattformskripte, nicht änderbar).

Geprüft und **ohne Gewinn** (keine Änderung am Theme): alle 11 Stylesheets zu einer Datei (FCP 1909 statt 1833 ms, LCP im Rauschen), Schrift-Preloads weglassen, Bewegung aus, Seitenübergänge aus,
Körnung und Header-Blur weglassen, GSAP weglassen (im Rauschen). Die Warenkorb-Überschrift hat im Repo und live kein `data-reveal`. Nicht geprüft: kritisches CSS inline, GSAP-Stack erst nach Idle laden.

## Vor weiteren Änderungen: Preview-Theme verbinden

Änderungen am Branch `main` gehen sofort live. Zum Testen vorher ein zweites, **unveröffentlichtes** Theme anlegen:

1. Shopify-Admin → *Onlineshop → Themes → Theme hinzufügen → Aus GitHub verbinden*.
2. Repository `Lux593/powershop-onlineshop` wählen und den Branch `claude/laughing-brahmagupta-fldc3b` (oder einen eigenen Test-Branch) verbinden.
3. Im Preview prüfen (Checkliste unten), erst danach den Branch nach `main` mergen.

## Checkliste im Preview-Theme (nur dort prüfbar)

- Theme-Editor: Sections hinzufügen, entfernen, neu laden; Hero-Einstellungen; Notaus-Schalter.
- Kollektion: Filter, Sortierung, Seitenwechsel, 5-Spalten-Umschalter.
- Produkt: Varianten, Galerie, Zoom, „In den Warenkorb“, Kaufleiste auf dem Handy.
- Warenkorb-Drawer, Warenkorb-Seite, **Checkout-Branding** und der Weg dorthin (Seitenübergänge dürfen nicht stören).
- iPhone/Safari: Film startet (im Stromsparmodus bleibt das Standbild mit Play-Taste), Header-Verhalten, Handy-Menü.
- Film über das Shopify-CDN (Range-Anfragen), Bilder in richtiger Größe (srcset), echtes mobiles Lighthouse.
- Cookie-Banner und „Cookie-Einstellungen“ im Footer: Der Link öffnet zuerst `window.privacyBanner.showPreferences()` (so live gefunden), dann die Customer Privacy API. Im Preview prüfen, dass der Dialog mit den Schaltern erscheint.
- Prüfen, dass die Bilder der Hero-Tabs und des Teamfotos erscheinen. Falls im Theme-Editor eigene Werte gesetzt wurden, die noch auf die alten Dateinamen
  (`hero-ride-*.png`, `powershop-team.png`) zeigen, dort die neuen Dateien (`.jpg`, `.webp`) wählen.

## Offen beim Händler und im Shopify-Admin (kein Code)

- Fragenliste: `docs/haendler-fragen.md`; Fundstellen und Status: `docs/freigaben.md`.
- Besonders wichtig vor Werbung und Verkauf: Kontaktdaten, Rechtstexte und Menüs (`footer`, `customer-service`, `legal`), Versand/Rückgabe/Zahlarten (heute Beispielwerte),
  Zusicherungen auf Bike-Seiten, Kennzahlen und Events auf der Startseite, Hero-Preise, Größentabellen, Bewertungen.
- Seite `/pages/service` (Vorlage `page.service`) anlegen; sie wird vielfach verlinkt.
- Produkte den Kollektionen zuordnen (heute sind alle leer); Cookie-Banner aktivieren.
- Rechte: Bildquellen, Einwilligungen für Personen auf Teamfoto und Film-Intros, KI-Kennzeichnung des Hero-Films, Händlervertrag.

## Bekannte Abweichung: Lenis

`assets/lenis.min.js` ist nicht byteidentisch zu npm `lenis@1.3.26`: Es ist das Original plus eingefügtem Lizenzkopf, ohne die letzte Zeile `//# sourceMappingURL=lenis.min.js.map`
(Original-SHA-256 `Uxlcl5fnznv51/qSQrCCCeV/Rt5MnawSamSU+ngOM0Y=` laut Sicherheitsprüfung, hier nicht erneut gegen npm abgeglichen). `gsap.min.js` und `ScrollTrigger.min.js` (3.15.0) sind byteidentisch zum npm-Paket.

## Wenn etwas schiefgeht

- Vorheriger Stand von `main` vor dieser Arbeit: Commit `a4d8926`. Zurücksetzen bedeutet, das Live-Theme auf den alten Stand zu setzen; das ist ein
  Force-Push und wird nur auf ausdrückliche Anweisung gemacht.
- Schneller und ohne Git: Im Theme-Editor **Animationen aktivieren** ausschalten, oder ein früheres Theme in Shopify wieder veröffentlichen, falls noch eines vorhanden ist.
- Technische Hintergründe: `docs/motion-api.md` (Motion-Schicht und Dateiaufteilung), `README.md`.
