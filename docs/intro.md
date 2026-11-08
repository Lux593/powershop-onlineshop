# Intro / Einlass (Startseite)

Vollbild-Überzug beim ersten Aufruf der Startseite. Das Logo (H-D Bar & Shield) zeichnet sich im Film aus Linien, darüber steigen
„Willkommen im Power Shop“ und der Button „Klicke zum Betreten“ ein. Klick: Texte steigen aus, der Film fährt durch den Balken des
Logos auf die Startseite, der Überzug blendet in den echten Hero über.

## Dateien

| Datei | Aufgabe |
| --- | --- |
| `snippets/intro.liquid` | Markup des Überzugs (Filme, Standbild, Texte als `<template>`), Filmadressen als JSON |
| `assets/intro.css` | Stile. Bühne in Filmformat (cover), Text in Prozent der Bühne unter dem Logo |
| `assets/intro.js` | Ablauf: `build` → `ready` → `zoom` → `done`, Fehler- und Notfälle |
| `layout/theme.liquid` | Head-Skript (setzt `html.intro-on` vor dem ersten Bild), `intro.css`, Snippet am Anfang des Body, `intro.js` nach `motion.js` |
| `assets/hero.js` | Film und Rotation des Hero warten, bis `html.intro-on` weg ist (Event `ps:introdone`) |
| `assets/intro-build-16x9` / `-9x16` (.mp4, .webm) | Aufbau-Film, 4,4 s. Letztes Bild = Logo auf dunklem Grund |
| `assets/intro-zoom-16x9` / `-9x16` (.mp4, .webm) | Zoom-Film, 3 s. Erstes Bild = Logo, letztes Bild = Startseite |
| `assets/intro-frame-16x9.webp` / `-9x16.webp` | Standbild des fertigen Logos (Notlösung, wenn der Film nicht startet) |

## Einstellungen (Theme-Einstellungen > Intro (Startseite))

- **Intro auf der Startseite zeigen** (an/aus, Notaus)
- **Wann erscheint er?** Einmal pro Besuch (Standard), einmal pro Tag, nur beim allerersten Besuch, bei jedem Aufruf (zum Testen)
- Überschrift, Button-Text, Text des Überspringen-Links

Er erscheint nur, wenn auch „Animationen aktivieren“ an ist.

## Wann er NICHT erscheint

Reduzierte Bewegung im Betriebssystem, Datensparen, 2G, Theme-Editor, Anker-Links (`/#…`), Suchmaschinen und Prüfroboter
(Bot-Kennungen, `navigator.webdriver`), ohne JavaScript, und wenn der Besuch laut Einstellung schon gezeigt wurde
(`sessionStorage` / `localStorage`, Schlüssel `ps-intro`, gesetzt erst beim Betreten oder Überspringen).

Testen: `?intro=1` an die Adresse der Startseite hängen erzwingt ihn (auch für Roboter und trotz „schon gesehen“), `?intro=0`
unterdrückt ihn. Im Theme-Editor selbst läuft er nie; dort über den Vorschau-Link mit `?intro=1` prüfen.

## Verhalten und Barrierefreiheit

- `role="dialog"`, `aria-modal`. Die Seite dahinter ist während des Intros `inert` und gesperrt (kein Scrollen, Lenis pausiert).
- Überspringen: Link oben rechts, Escape. Enter betritt. Danach Fokus auf `#main`.
- Texte nutzen die Bewegungsschicht des Themes (`data-split="words"`, `data-reveal="up"`) und steigen wie die Überschriften der Startseite ein.
  Der Abgang (Wörter nach oben aus der Maske, Button blendet aus) steht in `intro.css`.
- Hero-Animationen (Überschrift, Ken-Burns, Reveals) sind per `animation-play-state: paused` angehalten, bis der Überzug ausblendet.
- Notlösungen: Film startet nicht binnen 5 s oder Autoplay gesperrt → Standbild mit Texten, Klick blendet direkt über. Zoom-Film
  läuft nach 2,5 s nicht → direkt überblenden. Skript fehlt → Head-Skript gibt die Seite nach 6 s frei.

## Filme ersetzen

Die Filme sind deterministisch aus dem Logo gerechnet (Linien-Aufbau, Zoom durch das Fenster des Balkens). Das Format entscheidet
die Bühne: Querformat 1920 × 1080, Hochformat 1080 × 1920; der Text sitzt bei 74 % (quer) / 64 % (hoch) der Bühnenhöhe
(`--ty` in `intro.css`), das Logo endet bei 65,8 % / 56,9 %. Wird der Hochformat-Film ersetzt (er ist vorerst ein Zuschnitt
des Querformats), das Logo dort so setzen, dass es über `--ty` endet, sonst `--ty` anpassen. Der Zeitpunkt, ab dem die Texte
einsteigen, ist `T_TEXT` in `intro.js` (3,3 s, wenn sich die Linien treffen). Der Zoom-Film muss auf dem letzten Bild des Aufbau-Films beginnen
und auf dem Bild der Startseite enden; das Standbild des Hero ist `hero-poster.webp`.
