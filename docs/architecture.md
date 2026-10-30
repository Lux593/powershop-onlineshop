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

Keine Bibliothek: Die Seitenvorlagen Werkstatt und Service laden kein GSAP (nur die Startseite und die Über-uns-Seite, siehe Etappe 3). Bewegung läuft über CSS-Übergänge und die Web Animations API, und zwar nur über `transform` und `opacity`. Die Box-Paneele verschieben sich, statt ihre Breite zu ändern, denn die Breiten-Animation fiel bei 3440 × 1440 auf 50 fps.

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

## Etappe 3: Über uns (Entwurf H)

Stand 2026-10-30, gebaut in `claude/ueber-uns-h`, noch nicht gepusht. Entwurf, Spec und Plan: [`ueber-uns-h-design.md`](ueber-uns-h-design.md),
[`plan-ueber-uns-h.md`](plan-ueber-uns-h.md). Gleiche Bauweise wie bisher (Sections, `PS.on`, Tokens), dazu erstmals **Section-Blöcke** für
Etappen und Personen (keine Theme-Blöcke: Balken und Bühne lesen dieselben Blöcke zweimal, Theme-Blöcke nutzt das Theme nur zum Verschachteln)
und als zweite Seite nach der Startseite **GSAP und ScrollTrigger** für die Bühne.

```
templates/page.ueber-uns.json
├─ sections/service-subnav.liquid      Unternavigation (Untermenü „Service“)
├─ sections/about-head.liquid          Seitenkopf „Halle, dunkel“: h1, Satz, Crew-Foto bis an den Rand
├─ sections/about-story.liquid         Geschichte, Blöcke „Etappe“ (stage): Foto, große Jahreszahl, Titel, Text, Ort, bis zu drei
│                                      weitere Fotos (Weiteres Foto 2–4 oder Zeilen „Weitere Fotos im Theme“). Ab zwei Fotos Vorschau
│                                      unter dem Text (leaf--gallery). Ab zwei Etappen auf dieser Vorlage Bühne (Klasse
│                                      about-story--stage), dazu der Balken mit den Jahren und das Symbol Bar & Shield (symbol
│                                      i-barshield, nachgezogen aus assets/hd-bar-shield.png)
├─ sections/about-team.liquid          Team als Spotlight, Blöcke „Person“ (person, höchstens acht)
└─ sections/about-visit.liquid         „Komm vorbei“ als Etappe: Karte, Adresse, Route, Anrufen, WhatsApp, E-Mail, Lieferhinweis
    └─ snippets/visit-map.liquid       Karte des Dreiländerecks mit Pin und Schild, auch von sections/visit.liquid benutzt

assets/about-head.css                  Kopf, Setzen des Fotos beim Laden (Animation, nur mit Bewegung)
assets/about-story.css, about-story.js Etappen, Vorstufe der Bühne, Bühne (pinnen, umblättern ohne Einrasten, Balken, Übergang zum
                                       Team), Fotogalerie je Etappe (Web Animations API, auch ohne Bühne)
assets/about-team.css, about-team.js   Spotlight: Foto, Text, Vorschau-Raster, Pfeile, Wischen
assets/about-visit.css                 „Komm vorbei“ und die Abweichungen der Karte unter .about-visit (kein Skript)
assets/header.js                       + PS.headerHold(on): hält die Kopfleiste eingefahren (siehe motion-api.md)
assets/tokens.css                      + --c-orange-on-light, --c-hd-orange, --photo-grade
```

**Datenfluss**
- **Inhalte** liegen in `templates/page.ueber-uns.json` als Section- und Block-Einstellungen. Der Händler pflegt sie im Theme-Editor:
  Etappen und Personen hinzufügen, verschieben, ändern. Die Teamtexte außer Gerhard und Ingrid sind Platzhalter, bis der Händler sie liefert.
- **Händlerdaten** (Adresse, Telefon, WhatsApp, E-Mail) kommen nur aus den Theme-Einstellungen. Links setzen `snippets/contact-href.liquid` und
  `assets/contact.js` (WhatsApp und E-Mail mit Gruß an den Laden); die Route baut `about-visit.liquid` wie `visit.liquid` aus der Adresse.
  Nichts davon steht fest im Markup.
- **Fotos:**
  - Gewählt im Bildfeld: CDN mit `image_url`.
  - Sonst die Standarddatei aus `assets/` (`ueber-uns-*.jpg`, Herkunft in `bildliste.md`). Das CDN skaliert sie nicht, darum gibt es vorab
    skalierte Fassungen. Die Sections kennen Maße und srcset der mitgelieferten Dateien, eine andere Standarddatei steht ohne srcset.
  - Team: ein quadratisches Foto je Person (Handy, Vorschau) und optional ein breiter Ausschnitt 3 : 2 für den Desktop.
- **Liquid → JS:** Liquid rendert alles vollständig, ohne Skript steht die Seite untereinander. Das Skript der Geschichte (`data-story`,
  `data-stage`, `data-viewport`, `data-rail`) und das des Teams (`data-about-team`, `data-pick`, `data-prev`, `data-next`) lesen nur dieses
  Markup. Sie starten wie `assets/build-book.js`: sofort, wenn `PS.on` da ist, sonst bei `DOMContentLoaded` (ein Skript in der Section läuft
  vor `theme.js`).
- **Zustand:** Nur im JS und in Klassen: `about-story--stage` (Liquid, Bühne vorgesehen), `is-live` (Bühne läuft), `is-static` (Rückfall),
  `is-ready` (Team ist ein Spotlight), `is-in` am Pin (gelandet). Die Bühne hängt `__story = { st, guard, last, revert }` an `[data-story]`.
  Galerie: `leaf--gallery` (Liquid, ab zwei Fotos), `aria-pressed` an den Vorschauknöpfen, `hidden` an weiteren großen Fotos und
  `aria-hidden` am ersten, solange sie nicht gewählt sind, `is-coming` am Foto, das gerade hereinschiebt. `__gallery = { finish }` an
  `[data-story]` beendet laufende Wechsel (Abbau der Bühne).
- **Kopfleiste:** Die Bühne ruft `PS.headerHold(true)` ab 150 px vor dem Pinnen bis eine Kopfleistenhöhe nach dem Übergang zum Team (ohne Team:
  bis zum Ende des Pinnens), danach `PS.headerHold(false)`. Dazwischen fährt die Leiste nicht weg.
- **GSAP:** `layout/theme.liquid` lädt `gsap.min.js` und `ScrollTrigger.min.js` auf `index` und auf `page` mit Suffix `ueber-uns`, nie im
  Theme-Editor und nur mit dem Setting „Animationen aktivieren“. `sections/about-story.liquid` prüft dieselbe Bedingung für `about-story--stage`:
  ändert sich eine, muss die andere mit.
- **Karte:** Das Snippet `visit-map` gibt die Karte aus. Ohne Parameter ist es genau die Karte von `sections/visit.liquid` (Zeichen für Zeichen
  gleich, Vergleich mit `docs/qa/karte-ausschneiden.py`). `about-visit.liquid` ruft es mit `ring: false, logo: true, reveal: ''` und den
  Adresszeilen auf. Dann hat die Karte kein `data-reveal`, kein Ring läuft aus, im Schild steht Bar & Shield (und am Handy die Adresse),
  und der Pin trägt `data-reveal`: `motion.js` setzt `is-in`, sobald er ins Bild kommt, und er landet einmal (`about-visit.css`).
  Alle Abweichungen von `pages.css` stehen unter `.about-visit`, so bleibt die Karte auf der Service-Seite unverändert.

**Randfälle**

| Fall | Verhalten |
|---|---|
| Kein Skript, GSAP lädt nicht, Aufbau der Bühne bricht ab | Das Skript setzt `is-static`, ein `onerror` am Skript-Tag tut es bei einem Ladefehler: Die Vorstufe aus `about-story.css` fällt weg, die Etappen stehen untereinander, kein schwarzer Streifen. Die Galerie braucht kein GSAP, nur `about-story.js`: Ohne Skript steht je Etappe das erste Foto, die Vorschau wechselt nicht. |
| `prefers-reduced-motion`, Setting aus, Theme-Editor | Keine Bühne und keine Fahrten, alles steht untereinander und ist sichtbar. Der Balken ist ausgeblendet, die Jahreszahlen sind Anker (`#etappe-<Block-ID>`). Der Pin landet nicht, er steht schon da. Team-Fotos wechseln sofort. |
| Fenster niedriger als 600 px (Handy quer) | Die Bühne wird nicht gepinnt (`gsap.matchMedia`: reduzierte Bewegung ausgenommen, mindestens 600 px Höhe), die Etappen stehen untereinander. 600 = Kopfleiste (bis 77 px) plus 520 px Mindesthöhe der Bühne. Team-Fotowechsel und der Pin gelten für jede Höhe. |
| Eine Etappe | Keine Bühne, kein Balken. Das Skript lädt nur, wenn die Etappe eine Galerie hat. |
| Mehr oder weniger Etappen | Der Balken teilt sich auf die Anzahl auf, der Scrollweg rechnet mit ihr (eine Bildschirmhöhe je Wechsel). Ohne Etappen steht außerhalb des Editors nichts da. |
| Weitere Fotos einer Etappe | Reihenfolge: Foto oben, dann Weiteres Foto 2–4, nur wenn keins davon gewählt ist die Zeilen „Weitere Fotos im Theme“ (`datei | Beschreibung`). Höchstens vier. Ab zwei Fotos Vorschau unter dem Text, mit einem Foto Markup wie bisher. Ein Klick schiebt das gewählte Foto über das alte: Liegt es in der Vorschau links vom bisherigen, kommt es von rechts, sonst von links. Ohne Bewegung sofort. Ein Klick ändert nie die Scrollposition. Auf der Bühne sind nur die Vorschauknöpfe der Etappe per Tab erreichbar, die gerade ganz da ist (`tabindex="-1"` an den übrigen, auch während des Umblätterns). Weitere große Fotos laden bei Hover, Fokus oder Klick, auf der Bühne zusätzlich, wenn ihre Etappe die aktuelle wird, sonst sobald die Etappe einen halben Bildschirm vor dem Fenster ist (IntersectionObserver). |
| Wenig Höhe mit Vorschau | Auf der Bühne ist jede Etappe so hoch wie das Bühnenfenster. Bis 800 px Höhe (Desktop) bzw. 760 px (Handy) bekommen Etappen mit Vorschau knappere Abstände, Überschrift und Vorschaubilder wachsen weniger mit der Höhe (Vorschau 3 : 2, Breite aus Fensterbreite und -höhe, Desktop 72 bis 156 px, Handy 66 bis 90 px), am Handy nimmt ihr Foto 34 % statt 46 % ein. Unter 700 px Höhe am Handy nimmt das Foto jeder Etappe 42 % ein. Gemessen mit Vorschau in allen vier Etappen bei 1440 × 900, 1280 × 620, 1100 × 800, 1024 × 640, 375 × 812 und 320 × 640 (die beiden Handy-Größen auch in WebKit), dazu 1024 × 600 und 900 × 600. „Heute“ hat den längsten Text, die knappste Luft unter ihm sind 4,9 px bei 320 × 640. |
| Team folgt nicht direkt auf die Geschichte | Kein Übergang zum Team, die Kopfleiste wird bis zum Ende des Pinnens gehalten. |
| Eine Person im Team | Keine Pfeile und kein Raster, die Karte steht da. Höchstens acht Personen (Raster 4 × 2 bzw. 8 × 1). |
| Person ohne Foto oder ohne breiten Ausschnitt | Ohne Foto eine dunkle Fläche. Ohne breiten Ausschnitt steht das quadratische Foto am Desktop ganz und mittig im Rahmen (`contain`). |
| Team weniger als einen Bildschirm entfernt | Alle Teamfotos laden sofort (`eager`), ein Wechsel wartet auf das Dekodieren, höchstens 400 ms. |
| Keine Händlerdaten | „Komm vorbei“ erscheint im Shop nicht, im Editor steht ein Hinweis. Ohne Adresse fehlt „Route planen“, ohne einen Kanal der zugehörige Knopf. |
| Adressleiste am Handy | `ScrollTrigger.config({ ignoreMobileResize: true })`: kein Neumessen mitten im Umblättern. |
| Anker und Klick auf eine Jahreszahl | Solange die Bühne läuft, steht `html` auf `scroll-behavior: auto` (`about-story.css`), sonst glitte die Seite auch dorthin, wo ScrollTrigger die Scrollposition beim Neuberechnen selbst setzt. Ein Klick scrollt weich zur Etappe. Die Bühne rastet nie ein, ihre Lage hängt nur vom Scrollen ab. |
| Theme-Editor | Immer statisch. Ein gewählter Teamblock zeigt seine Person sofort. |
| Tastatur | Die Reihenfolge ist Vorschauknöpfe der Etappe, Balken, Team, Kontakt. Auf der laufenden Bühne sind nur die Vorschauknöpfe der Etappe tabbar, die gerade ganz da ist; während des Umblätterns keine. Ohne Bühne sind alle in ihrer Reihenfolge erreichbar. Fokus auf einem Knopf scrollt den Ausschnitt nie (`overflow: clip` an Bühne, Fenster und Etappe). Die Pfeiltasten wechseln die Person nur, solange der Fokus auf einem Knopf des Teams liegt. Der Fokusrahmen folgt dem Theme (`base.css` blendet ihn auf Wunsch des Händlers aus, offen in `freigaben.md`). |

**Fitness Functions**

1. **Neue Etappe oder Person:** Kein Code, nur ein Block im Theme-Editor.
2. **Externe API:** Keine. Karte und Kontaktwege kommen aus dem Theme und den Händlerdaten.
3. **Neues Aussehen:** je Section eine CSS-Datei und `assets/tokens.css`.
4. **Isoliert testbar:** Jede Section rendert für sich. Die Prüfungen laufen mit `docs/qa/ueber-uns-checks.js` in der Vorschau.

CONFIDENCE: 8/10
