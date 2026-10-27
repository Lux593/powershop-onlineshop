# Architektur: Service-Bereich (Werkstatt, Service-Seite, Kontakt)

Stand 2026-10-26. Etappe 1 aus [`plan-service-werkstatt.md`](plan-service-werkstatt.md). Entschieden mit dem Händler:
- Variante B „Garagen-Boxen“, im Prototyp in vier Runden verfeinert
- Pflege im Theme-Editor
- Test direkt auf `main`

Recherche und Messwerte: [`research/werkstatt-umbau-buch.md`](research/werkstatt-umbau-buch.md).

## Technik

Das Theme ist ein Shopify-Liquid-Theme ohne Build-Step. Es gilt dieselbe Bauweise wie im übrigen Theme:
- Sections mit Blöcken
- JS-Module über `PS.on` (`assets/theme.js`)
- Farben, Schrift und Abstände aus `assets/tokens.css`

Neu ist nur, dass erstmals **Theme-Blöcke** (`blocks/`) genutzt werden. Ein Umbau enthält beliebig viele Bild-Blöcke, und das geht nur mit verschachtelten Theme-Blöcken (https://shopify.dev/docs/storefronts/themes/architecture/blocks/theme-blocks/schema).

Keine Bibliothek: Die Seitenvorlagen laden kein GSAP. Bewegung läuft über CSS-Übergänge und die Web Animations API, und zwar nur über `transform` und `opacity`. Die Box-Paneele verschieben sich, statt ihre Breite zu ändern, denn die Breiten-Animation fiel bei 3440 × 1440 auf 50 fps.

## Bausteine

```
templates/page.werkstatt.json
├─ sections/service-subnav.liquid      Unternavigation der Service-Seiten (Untermenü „Service“ aus main-menu)
├─ sections/build-book.liquid          Umbau-Buch: Seitenkopf mit Film wie die Bekleidungsseiten (assets/film-banner.js), helles
│                                      Einleitungsband in der Schrift des Willkommensblocks (ohne Scrub), Box-Reihe
│                                      (Info-Feld schwarz), Vollbild-Dialog
│   └─ blocks/build.liquid             ein Umbau: Paneel (Titelbild, Name hochkant), Raum (Infos auf Schwarz, Bildblock)
│       └─ blocks/build-photo.liquid   ein Foto: Bildfeld oder Standarddatei aus assets/, Maße, Alt-Text
└─ sections/workshop-services.liquid   Werkstatt-Leistungen als Service-Kacheln (snippets/service-tile) + Termin-Box (contact-box, „Anrufen“ ohne Nummer)

assets/build-book.css   Darstellung (lädt nur mit der Section)
assets/build-book.js    Verhalten: Paneele, Bildblock-Layout, Vollbild, Einpassen der Infos, Handy-Scroll
assets/header.js        + PS.headerQuiet(ms): Header bleibt beim gezielten Scrollen stehen
```

## Datenfluss

- **Inhalte** liegen in `templates/page.werkstatt.json` als Block-Einstellungen. Der Händler ändert sie im Theme-Editor. Die vier Umbauten mit je vier Fotos sind dort vorbelegt.
- **Fotos:**
  - Gewählt im Bildfeld: CDN mit `image_url` und srcset.
  - Sonst die Standarddatei aus `assets/`. Das CDN skaliert sie nicht, deshalb gibt es je Foto vorab skalierte Dateien (720 / 1280 / 1920 px) und ein srcset aus den Einstellungen.
- **Liquid → JS:** Liquid rendert das vollständige Markup, ohne Skript stehen alle Umbauten untereinander mit ihren Fotos. Jedes Foto trägt `data-w`, `data-h` und `data-full`. Daraus berechnet das JS den Bildblock und das Vollbild.
- **Zustand:** Er lebt nur im JS-Modul (welcher Umbau offen ist, Paneelbreiten). Nichts wird gespeichert.

## Fehler und Randfälle

| Fall | Verhalten |
|---|---|
| Kein Skript | Alle Umbauten stehen untereinander, Fotos als einfaches Raster, nichts ist versteckt. |
| `prefers-reduced-motion` | Keine Fahrten und kein Morphing, Zustände wechseln sofort. |
| Umbau ohne Fotos | Das Paneel erscheint ohne Bild. Im Theme-Editor steht ein Hinweis, im Shop wird der Umbau ausgelassen. |
| Mehr als 7 Fotos | Der Bildblock zeigt 7 Kacheln, die letzte mit „+N“. Das Vollbild enthält alle Fotos. |
| Langer Text | Die Infos werden eingepasst (`--fit`, mindestens 62 %). Reicht das nicht, wird die Box höher, sie scrollt aber nie. |
| Theme-Editor | `PS.on` startet nach jedem Section-Reload neu. Ein ausgewählter Block öffnet seinen Umbau (`shopify:block:select`). |
| Header blendet aus | `PS.headerQuiet` hält ihn beim Öffnen am Handy, und das Scroll-Ziel wird aus dem Header-Zustand berechnet. |

## Fitness Functions

1. **Neuer Umbau:** Kein Code. Im Theme-Editor wird ein Block „Umbau“ mit Bild-Blöcken angelegt (0 Dateien). Bei fest eingebauten Standardbildern ändern sich nur `assets/` und die Vorlage.
2. **Externe API:** Keine. Die Kontaktwege kommen aus den Theme-Einstellungen (Händlerdaten) über das bestehende `snippets/contact-box.liquid`.
3. **Neues Aussehen:** `assets/build-book.css` und `assets/tokens.css`, also 1 bis 2 Dateien.
4. **Isoliert testbar:** Jede Section rendert für sich. Das JS-Modul hängt nur an `PS.on` und braucht keine andere Section.

## Etappe 2: Service-Seite, „Komm vorbei“, Kontakt

Stand 2026-10-27, gebaut, noch nicht gepusht. Gleiche Bauweise: Sections mit Blöcken, `PS.on`, keine Bibliothek. Stile und Skript liegen in
`assets/pages.css` und `assets/pages.js`, die nur auf Seitenvorlagen laden.

```
templates/page.service.json
├─ sections/service-subnav.liquid      Leiste aus dem Untermenü „Service“, hier klebend (Einstellung), mit Scrollspy (pages.js)
├─ sections/service-page.liquid        Banner, Türen, Kaufweg, Events
│   ├─ Block „door“                    Bildkarte zu einer Seite (snippets/bento-tile), bis zu zwei, als eine Reihe ausgegeben
│   ├─ Block „service“                 Schritt: Nummer (snippets/step-no), Text, Stichpunkte oder Ablauf (steps), Checkliste, Bild, Anfrage-Zeile
│   ├─ Block „partner“                 Schritt: Partner-Angebot (snippets/partner-offer) mit Kontakt-Box, Ansprechpartner oder Kontakt-Karte
│   │                                  des Shops (Probefahrt: ohne Logo, mit Häkchen-Liste)
│   └─ Block „event“                   Karten (snippets/event-card), gesammelt im Abschnitt #events
└─ sections/visit.liquid               „Standort & Kontakt“ (#standort): Karte, Adresse, Route, Öffnungszeiten, Kontakt-Box

templates/page.contact.json
├─ sections/page.liquid                Seitenkopf, Seitentext nur, wenn vorhanden
└─ sections/visit.liquid               „Komm vorbei.“
```

**Datenfluss**
- Texte und Reihenfolge liegen in den Vorlagen und sind im Theme-Editor pflegbar. Die Schritt-Nummern zählt Liquid aus der Blockreihenfolge.
- Adresse, Telefon, WhatsApp, E-Mail und Öffnungszeiten kommen aus den Theme-Einstellungen (Händlerdaten), wie überall im Theme.
- Die Leiste liest das Untermenü „Service“ aus `main-menu`. Punkte mit Anker auf derselben Seite bekommen `data-spy`, nur sie markiert der Scrollspy.
- Die Karte ist ein Bild im Theme mit srcset. Pin und Beschriftungen stehen in Prozent der Kartendatei; Container-Einheiten halten den
  Pin bei jedem Seitenverhältnis im Bild. Container ist ein absolut über die Karte gelegter Rahmen (`.visit__frame`). Seine Größe steht
  immer fest, auch wenn sich die Karte nach der Nachbarspalte streckt. Mit `height: auto` am Container rechnet Chrome `cqh` sonst mit 0.
- Aufbau „Komm vorbei“: Die Überschrift steht immer vor der Karte.
  - Bis 1023 px steht alles untereinander.
  - Von 1024 bis 1279 px (iPad quer) läuft die Karte über die volle Breite, darunter stehen Angaben und Kontakt-Box nebeneinander.
  - Ab 1280 px steht die Karte links und ist so hoch wie die rechte Spalte, höchstens 0,9 : 1. Ist sie noch schmaler, fiele
    „Deutschland“ aus dem Bild.

**Randfälle**

| Fall | Verhalten |
|---|---|
| Keine Kontaktdaten | Anfrage-Zeilen und Kontakt-Boxen fehlen im Shop, im Editor steht ein Hinweis. Finanzierung zeigt „Kontakt aufnehmen“ auf `#standort`. |
| Keine Adresse, Kanäle und Öffnungszeiten | „Komm vorbei“ erscheint im Shop nicht. |
| Kein anstehendes Event | Der Abschnitt `#events` bleibt mit einem kurzen Hinweis stehen, die Leiste führt nie ins Leere. |
| Nur ein Event | Die Karte bleibt eine Karte: Spalten ab 320 px Breite statt fester Drei, ohne dunkles Band. Die Karte bringt ihre Fläche selbst mit. |
| Themenblock ohne Bild | Der Text läuft auf Lesebreite, Stichpunkte mit Label stehen ab 1024 px als Spalten nebeneinander. |
| Niedriger Bildschirm (höchstens 540 px) | Die Leiste klebt nicht, Anker rechnen nur den Header ein. |
| Kein Skript | Alles sichtbar, die Leiste wischt, nur die Markierung des aktuellen Abschnitts fehlt. |
| Theme-Editor | Beim Neuladen der Leiste räumt `shopify:section:unload` Listener und Markierung ab. |
| Alte Links | Alle Anker `/pages/service#…` bestehen weiter, `#werkstatt` ist die ID der Werkstatt-Tür. |

CONFIDENCE: 8/10
