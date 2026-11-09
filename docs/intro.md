# Intro / Einlass (Startseite)

Vollbild-Überzug beim ersten Aufruf der Startseite. Das Logo (H-D Bar & Shield) zeichnet sich im Film aus Linien, darüber steigen
„Willkommen im Power Shop“ und der Button „Klicke zum Betreten“ ein. Klick: Texte steigen aus, das Logo (Vektor, live gezeichnet)
fährt durch den Balken auf die **echte** Startseite, die durch das Fenster im Balken scheint. Das Endbild ist die Seite selbst, in
jedem Seitenverhältnis (Handy hoch, Desktop, Ultrawide); es gibt keinen Film, dessen letztes Bild zur Seite passen müsste.

## Dateien

| Datei | Aufgabe |
| --- | --- |
| `snippets/intro.liquid` | Markup des Überzugs (Aufbau-Film, Texte als `<template>`), Filmadressen als JSON |
| `assets/intro.css` | Stile. Bühne in Filmformat (cover), Text in Prozent der Bühne unter dem Logo |
| `assets/intro.js` | Ablauf: `build` → `ready` → `zoom` → `done`, Fehler- und Notfälle. Enthält das Logo als Vektor (Pfad `LOGO.d`) und die Kamerafahrt |
| `layout/theme.liquid` | Head-Skript (setzt `html.intro-on` vor dem ersten Bild), `intro.css`, Snippet am Anfang des Body, `intro.js` nach `motion.js` |
| `assets/hero.js` | Film und Rotation des Hero warten, bis `html.intro-on` weg ist (Event `ps:introdone`) |
| `assets/intro-build-16x9` / `-9x16` (.mp4, .webm) | Aufbau-Film, 4,4 s. Letztes Bild = Logo auf dunklem Grund; die Vektor-SVG stimmt auf dieses Bild |

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
- Überspringen: Link oben rechts, Escape. Enter betritt, ebenso ein Klick oder Tipp aufs Logo (unsichtbare Fläche `.intro__logo-hit`
  über dem Logo, ab dem Einstieg der Texte; nur für Maus und Touch, mit der Maus darüber zeigt der Button seinen Hover-Zustand). Danach Fokus auf `#main`.
- Texte nutzen die Bewegungsschicht des Themes (`data-split="words"`, `data-reveal="up"`) und steigen wie die Überschriften der Startseite ein.
  Der Abgang (Wörter nach oben aus der Maske, Button blendet aus) steht in `intro.css`.
- Hero-Animationen (Überschrift, Ken-Burns, Reveals) sind per `animation-play-state: paused` angehalten, bis die Seite frei ist. Das
  passiert bei 60 % der Kamerafahrt (`RELEASE_AT`), wenn das Fenster den Bildschirm fast füllt: Hero-Überschrift steigt ein, während
  sich das Fenster ganz öffnet; der Rest der Fahrt lässt Klicks durch (`.is-released`). Event `ps:introdone` kommt zu diesem Zeitpunkt.
- Notlösungen: Film startet nicht binnen 5 s oder Autoplay gesperrt → das Logo steht als SVG mit den Texten, der Zoom fährt nach dem
  Klick trotzdem. Kein SVG möglich → Überzug blendet nach dem Klick nur aus. Skript fehlt → Head-Skript gibt die Seite nach 6 s frei.

## Header

Header und Ankündigungsleiste sind während des Intros unsichtbar (`html.intro-on`, `opacity: 0`) und gleiten beim Freigeben der Seite
leicht ein (800 ms, `opacity` + 10 px `translate`, `html.intro-in` für 1,5 s, Regeln in `intro.css`). Sie ändern dabei weder Größe noch
Lage; das Einblenden läuft nur nach einem Intro, bei normalen Seitenaufrufen steht der Header wie immer sofort da.

## Wie der Zoom zur Seite passt

- Die SVG (`.intro__zoom`) liegt in der Bühne und rechnet in denselben Einheiten wie der Film (1920 × 1080 bzw. 1080 × 1920). Ihr erstes
  Bild (Logo, dunkler Grund, verdunkeltes Fenster) deckt sich mit dem letzten Bild des Aufbau-Films.
- Der Grund ist ein Pfad mit einem Loch genau im Fenster des Balkens; das Loch wandert und wächst mit dem Logo. Das Fenster ist
  anfangs von einer dunklen Fläche bedeckt, die in den ersten 30 % der Fahrt aufklart.
- `measure()` rechnet den Bildschirm in Bühnen-Einheiten um und wählt die Endvergrößerung so, dass das Fenster den Bildschirm um 12 %
  überragt. Dadurch passt das Ende in jedem Seitenverhältnis; das Endbild ist die lebende Seite (mit Header, Verlauf und Hero-Text).
- Bewegungsunschärfe des früheren Films gibt es nicht mehr; der Schein um das Logo ist aus acht übereinanderliegenden Strichen genähert.

## Aufbau-Film ersetzen

Der Aufbau-Film ist deterministisch aus dem Logo gerechnet (Linien-Aufbau). Das Format entscheidet
die Bühne: Querformat 1920 × 1080, Hochformat 1080 × 1920; der Text sitzt bei 74 % (quer) / 64 % (hoch) der Bühnenhöhe
(`--ty` in `intro.css`), das Logo endet bei 65,8 % / 56,9 %. Wird der Hochformat-Film ersetzt (er ist vorerst ein Zuschnitt
des Querformats), das Logo dort so setzen, dass es über `--ty` endet, sonst `--ty` anpassen. Der Zeitpunkt, ab dem die Texte
einsteigen, ist `T_TEXT` in `intro.js` (3,3 s, wenn sich die Linien treffen). Ein neuer Aufbau-Film muss auf dem letzten Bild das Logo
an derselben Stelle zeigen wie die SVG (`LAYOUT` in `intro.js`: Breite `lw`, Position `lx` / `ly` in Bühnen-Einheiten) und denselben
dunklen Grund haben; sonst springt das Bild beim Klick. Ein neues Logo braucht eine neue Spur (Pfad `LOGO.d`, Fenster `LOGO.win`).
