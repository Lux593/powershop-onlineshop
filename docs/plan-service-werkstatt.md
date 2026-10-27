# Plan: Service-Bereich mit Werkstatt, Über uns und Kaufweg

Stand 2026-10-27.
- Etappe 1 (Werkstatt-Seite mit Umbau-Buch) ist live.
- Etappe 2 ist gebaut, aber noch nicht gepusht: Service-Seite als Kaufweg, Sektion „Komm vorbei“ und die Kontakt-Vorlage.
- Umbau vom 27.10. abends (gebaut, nicht gepusht): Service ist nur noch Übersicht mit drei Türen. Der Kaufweg zieht auf die
  eigene Seite Dienstleistungen, Über uns hat eine leere Seite, die Inhalte folgen.
- Recherche und Messwerte zum Umbau-Buch: [`docs/research/werkstatt-umbau-buch.md`](research/werkstatt-umbau-buch.md).

## 1. Gliederung (entschieden am 27.10.2026)

| Seite | URL | Vorlage | Inhalt |
|---|---|---|---|
| Werkstatt | `/pages/werkstatt` | `page.werkstatt.json` | Umbau-Buch (Garagen-Boxen), „Werkstatt-Termin anfragen“ |
| Dienstleistungen | `/pages/dienstleistungen` | `page.dienstleistungen.json` (neu) | Kaufweg in fünf Schritten, Leiste klebt mit Scrollspy |
| Über uns | `/pages/ueber-uns` | `page.ueber-uns.json` (neu) | Vorerst nur der Seitenkopf. Baut später auf Entwurf D auf: Roadbook-Zeitleiste, Team-Kartenband, „Komm vorbei“. |
| Service | `/pages/service` | `page.service.json` | Übersicht: drei Türen untereinander (Werkstatt, Dienstleistungen, Über uns), darunter Standort & Kontakt |
| Kontakt | `/pages/contact` | `page.contact.json` (neu) | Seitenkopf und „Komm vorbei“ |

- **Kaufweg:** 01 Probefahrt, 02 Inzahlungnahme, 03 Finanzierung, 04 Versicherung, 05 Anmeldung & Lieferung.
- **Keine eigenen Seiten** für Finanzierung und Versicherung, die Entscheidung vom 21.10. gilt weiter. Die früher geplanten Seiten
  „Probefahrt & Inzahlungnahme“ und „Finanzierung & Versicherung“ entfallen.
- **Eine Navigation:** die Service-Leiste (`sections/service-subnav.liquid`), gespeist aus dem Hauptmenü.
  - Auf Service bleibt sie beim Scrollen unter dem Header stehen und markiert den Abschnitt, den man gerade liest.
  - Auf Werkstatt scrollt sie mit weg, sonst läge ein geöffneter Umbau unter der Leiste.
- **Menü „Service“** (im Shop umgestellt am 27.10., nachmittags): drei Bereiche, im Megamenü drei Foto-Kacheln.
  - **Werkstatt** (Link auf `/pages/werkstatt`)
  - **Dienstleistungen** (Gruppe, klappt auf): Probefahrt · Inzahlungnahme · Finanzierung · Versicherung, in dieser Reihenfolge
    (Header-Einstellung „Gruppen in eigener Reihenfolge“). Die Gruppe zeigt auf die Seite `/pages/dienstleistungen`, die
    Unterpunkte auf `/pages/dienstleistungen#…` (umgestellt am 27.10. abends nach dem Push).
  - **Über uns** (Link) zeigt auf die Seite `/pages/ueber-uns`.
  - Events und Standort & Kontakt stehen nicht mehr im Menü. Events gibt es nur noch auf der Startseite (ohne „Alle Events“-Link,
    die Karten sind reine Infokarten).
  - Die Service-Leiste zeigt statt der Gruppe ihre Unterpunkte: Werkstatt · Probefahrt · Inzahlungnahme · Finanzierung ·
    Versicherung · Über uns.
  - „Lieferung“ (`/pages/dienstleistungen#lieferung`) kommt unter Dienstleistungen dazu, wenn Schritt 05 live ist.
- **Alte Links bleiben gültig:** `/pages/service#probefahrt`, `#inzahlungnahme`, `#finanzierung`, `#versicherung` und `#lieferung`
  leitet die Tür „Dienstleistungen“ an denselben Abschnitt auf `/pages/dienstleistungen` weiter (Einstellung „Alte Anker
  weiterleiten“), beim Laden und beim Klick innerhalb der Seite. `#werkstatt` landet auf der Werkstatt-Tür, `#standort` bleibt.

## 2. Umsetzung im Theme

**Etappe 1 (live)**
- `sections/build-book.liquid` mit `blocks/build.liquid`, `assets/build-book.css` und `assets/build-book.js`: das Umbau-Buch.
  Ohne Skript stehen alle Umbauten untereinander, mit Skript verschieben sich die Boxen nur per transform (74–75 fps bei 3440 × 1440).

**Etappe 2 (gebaut, nicht gepusht)**
- `sections/service-page.liquid`
  - Neuer Block „Tür zu einer Seite“: bis zu zwei Bildkarten, gesammelt als eine Reihe unter dem Banner.
  - Themenblöcke und Partner-Angebote zählen als Schritte 01, 02, … (`snippets/step-no.liquid`, abschaltbar).
  - Der Themenblock hat keine Kontaktspalte mehr. Er endet in einer schlanken Anfrage-Zeile mit festem Thema.
  - Stichpunkte der Form „Label: Text“ bekommen ein fettes Label. Tragen alle eins, stehen sie als Spalten nebeneinander.
  - Der Abschnitt „Events“ (`#events`) steht immer da, ohne anstehenden Termin mit einem kurzen Hinweis. Die Karten stehen direkt
    auf dem hellen Grund, ein einzelner Termin bleibt eine Karte statt eines Balkens im dunklen Band.
  - Chip-Leiste und Block „Standort“ sind entfernt. Der Standort steht jetzt in „Komm vorbei“.
- `sections/visit.liquid` („Komm vorbei“)
  - Karte des Dreiländerecks als vorskaliertes WebP (`assets/karte-dreilaendereck-{800,1200,1600}.webp`), dazu Adresse,
    „Route planen“ (Google Maps, neues Fenster), Öffnungszeiten und die Kontakt-Box.
  - Auf Service heißt sie „Standort & Kontakt“ (`#standort`), auf Kontakt und später Über uns „Komm vorbei.“.
  - Die Überschrift steht vor der Karte. Handy und Tablet hochkant: alles untereinander.
    iPad quer: die Karte über die volle Breite, darunter Angaben und Kontakt-Box.
    Ab 1280 px: die Karte links, so hoch wie die Spalte daneben.
- `snippets/contact-box.liquid` und `assets/contact.js`: Variante `compact` (Anfrage-Zeile), Parameter `hours: false`, Thema „Lieferung“.
- Leiste: `sections/service-subnav.liquid`, `assets/pages.js`, `assets/pages.css`, `assets/header.css`
  - Einstellung „Kleben“; bei höchstens 540 px Bildschirmhöhe klebt die Leiste nie.
  - Scrollspy mit `aria-current="location"`, auch ohne Animationen.
  - Verlauf am Rand der wischbaren Leiste.
  - `scroll-padding-top` auf `html` rechnet Header und Leiste ein, Anker landen frei darunter.
- `snippets/bento-tile.liquid`: optionale `id`, `sizes`, `srcset` und Bildausschnitt (für die Türen).
- `snippets/partner-offer.liquid`: Schritt-Nummer über der Aussage, Ersatzlink ohne Kontaktdaten auf `#standort`.
- `snippets/mega-menu.liquid`: flache Listen enden mit „… im Überblick“ wie im Handy-Menü.
- `sections/page.liquid`: Seiten ohne eigenen Text lassen keine leere Fläche stehen.

**Nach deinem Feedback vom 27.10. (gebaut, nicht gepusht)**
- Werkstatt
  - Seitenkopf wie auf den Bekleidungsseiten: Banner mit Bildfenster (Falk), Tiefe beim Scrollen ab 768 px (`assets/pages.js`).
    Ohne Link zum Termin und ohne Zählung „4 Umbauten“.
  - Leistungen als Service-Kacheln wie auf der Startseite. Kacheln ohne Link haben keinen Hover.
  - In der Termin-Box steht „Anrufen“ ohne Nummer (`contact-box`, Parameter `number: false`).
- Probefahrt (01) ist aufgebaut wie Versicherung (04): Partner-Block ohne Logo, Text, Häkchen-Liste, Knopf „Motorräder ansehen“,
  rechts eine Kontakt-Karte des Shops mit Foto, Adresse und Anrufen · WhatsApp · E-Mail.
- Inzahlungnahme (02): Ablauf in drei nummerierten Schritten (ab 768 px nebeneinander, mit oranger Linie verbunden) und die
  Checkliste „Das brauchen wir von dir“.
- Leiste: Punkte links, der Crumb heißt „SERVICE ›“ in der Schrift der Punkte. Unter 1024 px zeigen die Seitenköpfe keine
  Brotkrumen, weil die Leiste den Weg schon zeigt.
- Werkstatt, zweite Runde
  - Im Seitenkopf läuft der Film `werkstatt-intro.mp4` wie auf Herren, Damen und Motorräder (Standbild, Pause-Knopf, Tiefe).
    Er läuft vor und zurück und bremst an beiden Enden weich ab, damit die Schleife nicht hart springt.
  - Der Film-Code liegt jetzt in `assets/film-banner.js` und lädt nur mit einem Seitenkopf mit Film (Kategorie oder Werkstatt).
  - Einleitung des Seitenkopfs allgemein für die Werkstatt.
  - Die Umbauten bekommen ein helles Band in der Schrift des Willkommensblocks der Startseite: große Überschrift, darunter
    zwei Sätze. Ohne Bar & Shield, Gebäudezeichnung und Aufleuchten beim Scrollen (das Band ist beim Laden schon im Bild).
    Abstände knapp: 48 px oben und unten, ab 1024 px 64 px. Ein großer Satz zwischen Überschrift und Text ist im Editor
    möglich („Aussage“), steht aber leer.
  - Das Info-Feld der Umbauten ist schwarz wie die Boxen.

**Umbau vom 27.10. abends: eigene Seiten (gebaut, nicht gepusht)**
- `sections/service-page.liquid` trägt alle drei Seiten:
  - Türen: bis zu drei, untereinander über die volle Breite (16:9 auf dem Handy, ab 1024 px 300–420 px hoch).
  - Neue Einstellungen: „Übergeordnete Seite“ (Brotkrumen Home › Service › …), „Standard-Bannerbild im Theme“ und je Tür
    „Alte Anker weiterleiten“.
  - Events erscheinen nur, wenn die Seite Event-Blöcke hat. Service hat keine mehr.
- Türbilder `assets/tuer-dienstleistungen-{720,1280,1920}.webp` und `assets/tuer-ueber-uns-{720,1280,1600}.webp`.
- Alle Theme-Links auf den Kaufweg zeigen auf `/pages/dienstleistungen#…`: Hinweisleiste, Megamenü-Knöpfe bei Motorräder,
  Startseite (Hero, Finanzierungs-Kachel), Probefahrt-Link der Kollektionsfilme, Vorlagen von `statement` und `service-tiles`.
- `snippets/link-order.liquid`: Die eigene Reihenfolge galt nur für den ersten Titel der Liste (Schleifenvariable überschrieben).
  Nach dem Push stehen Modellfamilien und Kollektionen in der Reihenfolge des Menüs.

**Startseite, 27.10. abends**
- „Mehr als ein Shop“ (`sections/story-events.liquid`) ohne Teamfoto: Text oben, darunter die drei Türen wie auf Service
  (Blocktyp „Bereich“, Regeln `.doors` jetzt in `assets/home.css`, das überall lädt), darunter die Kennzahlen.
- „Bikes im Showroom“: Kopf neu geordnet. Ab 768 px steht der Titel allein, „Alle Motorräder“ und die Pfeile rechts daneben,
  darunter Neu / Gebraucht und die Baureihen. Am Handy: Titel, Neu / Gebraucht, Baureihen, „Alle Motorräder“ mit Pfeilen.
  Der Leerzustand verlinkt die Probefahrt jetzt auf `/pages/dienstleistungen#probefahrt`.
- Die Seiten Dienstleistungen und Über uns sind seit dem 27.10. abends veröffentlicht (auf Wunsch, damit die Vorschau sie zeigt).

**Etappe 3: Über uns** (Seite und Tür stehen, Inhalt wartet auf deine Idee)
- Sektionen `about-hero`, `roadbook` (Blöcke „Etappe“), `team` (Blöcke „Person“), optional `video`, dazu `visit`.
- Bauweise wie das Umbau-Buch: Blöcke im Editor, Ersatzbilder in `assets/`, CSS und JS nur mit der Sektion,
  ohne JS alles sichtbar, reduzierte Bewegung respektiert.

**Entscheidung zum Inhaltsmodell (ADR, aktualisiert 2026-10-26):** Die Umbauten kommen mit dem Theme (Standardbilder in `assets/`) und
sind im Theme-Editor pflegbar: Block „Umbau“ mit Kind-Blöcken „Umbau-Bild“ (Theme-Blöcke in `blocks/`). Texte, Tabelle und Fotos ändert der
Händler dort selbst; ein neuer Umbau ist ein neuer Block. Metaobjekte im Admin bleiben die Option, falls es sehr viele Umbauten werden.
Aufbau: `docs/architecture.md`, Dateien: `docs/file-structure.md`.

## 3. Bilder

- HEIC-Fotos vom iPhone werden zu JPG oder WebP, gedreht und in mehreren Breiten für ein srcset abgelegt.
- **Metadaten entfernen:** iPhone-Fotos enthalten GPS-Position und Gerätedaten. Diese Daten werden vor dem Hochladen gelöscht.
- Neue, noch nicht freigegebene Bilddateien kommen in die Platzhalterliste (Theme-Einstellungen), so bleiben sie live aus.
- Dateinamen und Herkunft stehen in `docs/bildliste.md`.

## 4. Schritte im Shopify-Admin

1. Service-Menü umsortiert, Werkstatt vorn (erledigt 27.10.).
2. Nach dem Push: Die Seite „Kontakt“ (`/pages/contact`) bekommt die Vorlage `contact`. Vorher zeigt die Vorschau sie unter `?view=contact`.
3. Nach dem OK: Telefon, WhatsApp und E-Mail in den Theme-Einstellungen eintragen. Das schaltet überall den direkten Draht frei.
4. Go-live der eigenen Seiten, alles zusammen:
   - Seiten „Dienstleistungen“ (`dienstleistungen`, Vorlage `dienstleistungen`) und „Über uns“ (`ueber-uns`, Vorlage `ueber-uns`)
     sind am 27.10. angelegt und abends veröffentlicht (erledigt).
   - Theme auf `main` gepusht (`c47f358`, 27.10. abends, erledigt).
   - Menü: Dienstleistungen auf die Seite, Unterpunkte auf `/pages/dienstleistungen#…`, Über uns auf die Seite (erledigt).
5. Etappe 4: Footer-Menü, SEO-Titel und -Beschreibungen, Megamenü-Teaser, strukturierte Daten (`MotorcycleDealer`).

## 5. Was ich von dir brauche

- Kontaktdaten bestätigen: Telefon +49 7621 62022, WhatsApp +49 174 3201879, E-Mail info@powershop-weil.com
  (von der alten Website). Dazu, ob die Öffnungszeiten mit „Jetzt geöffnet“ erscheinen sollen.
- Freigabe der neuen Texte (Liste in `docs/freigaben.md`): Inzahlungnahme und Anmeldung & Lieferung.
- Deine Idee für Über uns.
- Je Umbau: Name, Basis-Modell (gern mit Baujahr) und Umbau-Liste.

## 6. Reihenfolge

| | Was | Ergebnis |
|---|---|---|
| A | Kontaktdaten eintragen (nach OK), Menü umsortieren | Direkter Draht live, Werkstatt vorn |
| B | Service-Seite umbauen, „Komm vorbei“, Kontakt-Vorlage, Leiste mit Scrollspy | Service aufgeräumt, keine Dublette |
| C | Über uns: Idee aufnehmen und bauen (Seite, Tür und Menü stehen schon), dann Home-Knopf und Footer | Über uns live |
| D | Teaser, Footer-Menü, SEO, strukturierte Daten | Alles verbunden |

Vor jedem Push: Screenshots aller Seiten in den Prüfgrößen (Handy 360–430 px und quer, Tablet 768–1180 px, Desktop 1280–3440 px,
320 px Breite und 200 % Zoom), `shopify theme check`, nur Tastatur, ohne Animationen. Push auf `main` geht sofort live.

## 7. Offene Punkte

- **Viele Umbauten:** Ab etwa sechs Umbauten werden die geschlossenen Tore auf 1440 px schmal. Möglich sind eine zweite Reihe oder
  ein seitlich scrollbarer Rand.
- **Events:** stehen nur noch auf der Startseite, ohne Seite „Alle Events“. Kommt eine Event-Seite (z. B. unter Über uns),
  bekommen die Karten und „Alle Events“ dort ihren Link.
- **Footer:** Das Menü „Rechtliches“ enthält nur „Cookie-Einstellungen“. Weil der Block den Link zusätzlich anhängt, steht er in der
  Fußzeile doppelt. Wird mit dem Footer-Menü in Etappe D bereinigt.
- **Alte Domain:** Zieht powershop-weil.com auf den Shop um, brauchen `/werkstatt`, `/unser-team`, `/finanzierung---versicherung`,
  `/verkauf---lieferung--ch/-fr/-de` und `/hog` Weiterleitungen.
