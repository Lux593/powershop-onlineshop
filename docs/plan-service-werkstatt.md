# Plan: Service-Bereich mit Werkstatt und Umbau-Buch

Stand 2026-10-27. Richtung gewählt: **B – Garagen-Boxen**, im Prototyp in vier Runden verfeinert. Etappe 1 (Werkstatt-Seite) ist gebaut.
Recherche und Messwerte: [`docs/research/werkstatt-umbau-buch.md`](research/werkstatt-umbau-buch.md).

## 1. Neue Gliederung

| Seite | URL | Vorlage | Inhalt |
|---|---|---|---|
| Service (Übersicht) | `/pages/service` | `page.service.json` (umgebaut) | Werkstatt als erste, große Bühne (ein Umbau, Link zur Werkstatt). Darunter Kacheln zu den Seiten. Events und Standort & Kontakt bleiben hier. |
| Werkstatt | `/pages/werkstatt` | `page.werkstatt.json` (neu) | Umbau-Buch (Garagen-Boxen), darunter Leistungen (Inspektion, Einbau, Custom-Umbau, Abnahme & Eintragung) und „Werkstatt-Termin anfragen“. |
| Über uns | `/pages/ueber-uns` | `page.ueber-uns.json` (neu) | Team mit Einzelporträts, Name, Rolle und ein, zwei Sätzen. Dazu Teamfoto, Gebäude, Geschichte des Hauses. |
| Probefahrt & Inzahlungnahme | `/pages/probefahrt` | `page.probefahrt.json` (neu) | Heutige Blöcke Probefahrt und Inzahlungnahme mit Kontaktbox. |
| Finanzierung & Versicherung | `/pages/finanzierung` | `page.finanzierung.json` (neu) | Heutige Partner-Blöcke Finanzierung und Versicherung. |

- Auf allen Service-Seiten steht eine Service-Unternavigation unter dem Header:
  Werkstatt · Über uns · Probefahrt & Inzahlungnahme · Finanzierung & Versicherung · Events · Standort & Kontakt.
  Die aktuelle Seite ist orange unterstrichen, wie im Prototyp.
- Alte Links wie `/pages/service#probefahrt` funktionieren weiter. Die Übersicht leitet die alten Anker per Skript auf die neue Seite
  weiter, ohne Skript führt der Anker zur passenden Kachel.

## 2. Umsetzung im Theme

**Neu**
- `sections/service-subnav.liquid`: Unternavigation. Die Links kommen als Blöcke, die aktuelle Seite wird über `page.handle` erkannt.
- `sections/build-book.liquid` mit `assets/build-book.css` und `assets/build-book.js`: das Umbau-Buch.
  - Je Umbau ein Block „Umbau“ mit Name, Basis-Modell, Umbau-Liste (eine Position pro Zeile) und Bildern (Dateinamen aus `assets/`, ein Bild pro Zeile).
  - Ohne Skript stehen alle Umbauten untereinander. Mit Skript: Boxen als Paneele, die sich nur per transform verschieben.
    Diese Fassung hält in der Messung 74–75 fps bei 3440 × 1440.
  - Am Handy liegen die Boxen untereinander, eine ist offen.
  - Tastatur: Tore sind Buttons mit `aria-expanded`, die Pfeiltasten blättern Bilder. Bei `prefers-reduced-motion` gibt es keine Fahrt.
- `sections/team.liquid`: „Über uns“ mit Block „Person“ (Foto, Name, Rolle, Text). Dazu Abschnitte für Teamfoto, Gebäude und Geschichte.
- Vier neue Seitenvorlagen (Tabelle oben). Probefahrt und Finanzierung nutzen die bestehende Section `service-page` mit ihren Blöcken weiter.

**Ändern**
- `templates/page.service.json` wird zur Übersicht. Die Inhalte wandern in die neuen Vorlagen und gehen dabei nicht verloren.
- Links `/pages/service#…` zeigen auf die neuen Seiten. Betroffen sind:
  - `sections/header-group.json`
  - `templates/index.json`
  - `sections/statement.liquid`
  - `sections/service-tiles.liquid`
  - `sections/collection.liquid`
  - `sections/product.liquid`
- **Achtung:** `templates/index.json` und `sections/statement.liquid` hat gerade eine andere Session offen. Diese Links stelle ich erst
  um, wenn deren Änderungen committet sind.

**Entscheidung zum Inhaltsmodell (ADR, aktualisiert 2026-10-26):** Die Umbauten kommen mit dem Theme (Standardbilder in `assets/`) und
sind im Theme-Editor pflegbar: Block „Umbau“ mit Kind-Blöcken „Umbau-Bild“ (Theme-Blöcke in `blocks/`). Texte, Tabelle und Fotos ändert der
Händler dort selbst; ein neuer Umbau ist ein neuer Block. Metaobjekte im Admin bleiben die Option, falls es sehr viele Umbauten werden.
Umgesetzt in Etappe 1, Aufbau: `docs/architecture.md`, Dateien: `docs/file-structure.md`.

## 3. Bilder

- Die HEIC-Fotos vom iPhone werden in JPG umgewandelt: Kacheln zusammensetzen, drei Fotos um 90° drehen.
- Jedes Foto bekommt drei Größen (720, 1600 und 2560 px) für ein srcset. Auf dem 3440er-Monitor braucht die offene Box die großen Dateien.
- **Metadaten entfernen:** iPhone-Fotos enthalten GPS-Position und Gerätedaten. Diese Daten werden vor dem Hochladen gelöscht.
- Dateinamen nach dem Muster `umbau-falk-1-1600.jpg`, in `docs/bildliste.md` nachgetragen.

## 4. Schritte im Shopify-Admin (du, oder mit Zugang ich)

1. Unter Onlineshop → Seiten vier Seiten anlegen: Werkstatt, Über uns, Probefahrt & Inzahlungnahme, Finanzierung & Versicherung.
   Jeder die passende Vorlage zuweisen.
2. Unter Navigation → main-menu die Service-Unterpunkte auf die neuen Seiten umstellen.

Erst danach stelle ich die Links im Theme um. Vorher würden sie ins Leere führen.

## 5. Was ich von dir brauche

- Deine Änderungswünsche an Variante B.
- Je Umbau: Name, Basis-Modell (gern mit Baujahr) und Umbau-Liste.
  In den Prototypen stehen bisher Beispiele, die ich aus den Fotos abgelesen habe.
- „Über uns“:
  - Einzelfotos, Teamfotos und Gebäudefotos
  - je Person Name, Rolle und ein, zwei Sätze
  - ein paar Sätze zur Geschichte des Hauses
- Freigaben für die Freigabeliste:
  - Ist die Person auf dem Hallen-Foto von Falk mit der Veröffentlichung einverstanden?
  - Soll das teilweise lesbare Kennzeichen auf falk3 unkenntlich gemacht werden?

## 6. Reihenfolge

1. Feinschliff an B im Prototyp, bis du zufrieden bist.
2. Bilder umwandeln, skalieren und Metadaten entfernen.
3. `build-book` als Section und Werkstatt-Seite bauen.
4. Unternavigation, Übersicht und Weiterleitung der alten Anker.
5. Über uns.
6. Seiten Probefahrt & Inzahlungnahme sowie Finanzierung & Versicherung.
7. Admin-Schritte (Abschnitt 4), danach Links im Theme umstellen.
8. Testen: 1440 × 900, 3440 × 1440, 390 px am Handy, nur Tastatur, ohne Animationen, `shopify theme check`.
9. Deine Freigabe, dann Push auf `main` (geht sofort live).

## 7. Offene Entscheidungen

- **Viele Umbauten:** Ab etwa sechs Umbauten werden die geschlossenen Tore auf 1440 px schmal. Möglich sind eine zweite Reihe oder
  ein seitlich scrollbarer Rand.
- **Übersichtsseite:** Welcher Umbau steht als Bühne oben? Fest gewählt oder wechselnd?
