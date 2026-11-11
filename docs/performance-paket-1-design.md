# Design: Performance Paket 1 („nichts sichtbar nachladen“)

Stand 11.11.2026. Grundlage ist die Performance-Analyse vom selben Tag: Messungen im Live-Shop (Chrome im Browser-Pane, Mac mit
120 Hz und Handy-Emulation 375 px) und eine Code-Prüfung von `main` (`1e0bf7b`). Der Nutzer hat Paket 1 freigegeben („Ja, Paket 1“).
Ein Plan für den Einbau folgt erst, wenn dieses Dokument abgenommen ist.

Mit „Claudes Entscheidung“ markierte Punkte hat der Nutzer nicht selbst entschieden. Er soll sie beim Lesen prüfen.

## 1. Worum es geht

Der Shop lädt schon schnell (Hero-Bild nach ca. 1 s, kein Layout-Springen, Scrollen am Mac mit 120 Bildern/s ohne Ruckler). Der Nutzer
hat keinen konkreten Fehler bemerkt. Er will das Gesamterlebnis verbessern: Beim Scrollen, beim schnellen Wischen durch den Showroom und
beim Hinzufügen in den Warenkorb soll man nie sehen, dass etwas lädt. Im besten Fall gibt es keine Ladezustände.

Warum gerade so: Die Animationen und Effekte machen den Shop aus. Deshalb geht es nicht ums Weglassen, sondern darum, Dinge früher,
gezielter oder mit weniger Netz-Runden zu holen.

Was die Messung gezeigt hat (Ausgangswerte für den Vorher-Nachher-Vergleich):

| Moment | Heute gemessen | Ursache im Code |
|---|---|---|
| Schnelles Wischen im Showroom | 23 von 26 Bike-Bildern beim Sichtbarwerden noch nicht geladen. Die Anfrage startet erst, wenn die Karte sichtbar ist (Vorlauf 0 ms). Zu sehen ist die anthrazitfarbene Fläche, dann blendet das Foto in 600 ms ein. | Native Lazy-Load wirkt in horizontalen Schienen erst beim Hereinrutschen, weil der Vorlauf des Browsers nur fürs Fenster gilt. Für Safari steht das schon im Kommentar `assets/product.js:123–124`, in Chrome so gemessen. Gelöst ist es nur in der Produktgalerie (`product.js:125–128`) und auf Über uns. |
| „In den Warenkorb“ | 0,56–0,96 s vom Klick bis zum offenen Drawer, danach lädt noch das Vorschaubild. Davon 0,39–0,81 s Shopify-Server für `/cart/add.js`, danach 0,13 s für `/cart.js`. | `assets/cart.js:146–164` (`addNow`): Nach dem Hinzufügen kommt eine zweite Anfrage nur für `item_count`, obwohl das fertige Drawer-HTML schon mitkam. Das Zeilenbild ist `loading="lazy"` im geschlossenen Dialog (`snippets/cart-line.liquid:29`). |
| Zügiges Scrollen, Fotos unter Reveals | Chrome fordert Lazy-Bilder ca. 1250 px vorher an, bei 2500 px/s also ca. 0,5 s vorher. Safari ist dafür nicht gemessen. | Der Reveal startet bei 8 % im Bild (`assets/motion.js:189`) ohne eigenen Vorlauf. Fotos unter Clip-Reveals (Bento, Türen, Besuchskarte, Statement) können mitten im Zoom hineinspringen. |
| Kollektionsseiten am Handy | Jede Produktkarte lädt auch das Hover-Zweitbild. | `snippets/product-card.liquid:61–67`: Das Zweitbild ist nur durchsichtig (`assets/components.css`, `.pcard__img--alt { opacity: 0 }`) und erscheint nur bei `(hover: hover) and (min-width: 1024px)`. |
| Seitenwechsel | Das Theme lädt keine Seite vorab. | Es gibt kein `speculationrules` und kein prefetch im Theme. |

## 2. Ziele, Nicht-Ziele, Anti-Ziele

**Ziele**
1. In Schienen (Showroom, Events-Schiene der Startseite, Bike-Schiene und „Ähnliche Artikel“ auf der Produktseite, Neuheiten der
   Startseite) sind die Bilder fertig, bevor ihre Karte beim Wischen oder per Pfeil sichtbar wird. Das gilt auch nach einem Umschalter
   (Neu/Gebraucht im Showroom, Reiter bei den Neuheiten).
2. „In den Warenkorb“ (Formular auf der Produktseite und Quick-Add auf Karten): Der Drawer öffnet eine Netz-Runde früher. Das
   Vorschaubild der neuen Zeile ist beim Öffnen schon da.
3. Fotos in Elementen mit Reveal (`[data-reveal]`) sind geladen und dekodiert, bevor ihr Reveal startet, auch bei zügigem Scrollen am
   iPhone.
4. Auf Geräten ohne Hover und unter 1024 px lädt die Produktkarte ihr Zweitbild nicht mehr.
5. In Chrome und Edge holt der Browser eine Seite vorab, wenn ein Link wahrscheinlich geklickt wird: mit der Maus nach kurzem Zeigen,
   am Touch-Gerät beim Fingerauflegen. Eine vorab geholte Seite zeigt nie einen veralteten Warenkorb.

**Nicht-Ziele (nicht Teil von Paket 1)**
- Paket 2. Es wird erst am iPhone gemessen und enthält:
  - Menübilder am Handy später und mit niedriger Priorität laden;
  - `--cover` auf Über uns und Werkstatt sowie `--header-shown` am `html` als CSS-Variablen;
  - mehrfache ScrollTrigger-Refreshs beim Laden;
  - Werkstatt-Fotos, Warten auf Schriften, Kollektionsbanner am Handy, Besuchsfilm;
  - CSS minifizieren oder aufteilen.
- Drawer schon beim Klick öffnen (optimistisch). Das entscheidet der Nutzer erst, nachdem Ziel 2 umgesetzt und gemessen ist.
- Die Reveal-Staffel beim Umschalten Neu/Gebraucht bzw. Baureihe im Showroom neu zählen (offene Entscheidung des Nutzers, ändert das
  Timing).
- Die Platzhalterfarbe der Bike-Karte (anthrazit oder hell). Auch das ist eine offene Entscheidung des Nutzers.
- Shopify-Anteile, die das Theme nicht steuert:
  - die Serverzeit von `/cart/add.js`;
  - das Checkout-Vorladen (181 Dateien, ca. 0,8 MB);
  - Plattform-Skripte wie Pixel, Shop Pay, Cookie-Banner und Kundenkonto.

**Anti-Ziele (wäre ein Fehlschlag, auch wenn es technisch läuft)**
- Eine Animation oder ein Effekt fällt weg, wird kürzer oder länger oder sieht anders aus. Das gilt ausdrücklich für:
  - die Reveals (`data-reveal`, Staffel, Clip-Zoom);
  - Scroll-Scrub, Pinnen, Parallax, Filme und View Transitions;
  - das 600-ms-Einblenden der Kartenbilder. Lädt ein Bild beim Sichtbarwerden noch, blendet es weiter ein.
- Kein Anti-Ziel: Lade-Anzeigen, die an der Wartezeit hängen (z. B. das Lade-Band am Warenkorb-Knopf), laufen kürzer, weil die
  Wartezeit kürzer wird. Künstlich verlängert wird nichts.
- Die ersten Karten einer Kollektion starten weiterhin nie versteckt (Kommentar `assets/shop.css:501–502`, möglicher LCP).
- Mehr Daten beim Seitenaufruf, die mit dem Hero-Film oder sichtbaren Bildern konkurrieren. Alle neuen Vorlader starten erst nach
  `load` plus Leerlauf (Muster `afterLoad` in `assets/product.js`), vorher übernimmt das Lazy-Loading des Browsers. Danach wird erst
  beim Annähern oder bei einer Absicht (Zeigen, Fokus, Fingerauflegen) vorgeladen.
- Vorladen bei Datensparen oder langsamer Verbindung (`saveData`, 2G/3G). Dafür gibt es das Muster `slow()` in
  `assets/product.js:118`. Safari kennt `navigator.connection` nicht, am iPhone greift diese Bremse also nie. Deshalb bleiben die
  vorgeladenen Mengen klein, und vorgeladen wird erst beim Annähern oder bei einer Absicht.
- Bilder versteckter Inhalte (`display: none`, `hidden`, geschlossene Dialoge, Megamenü, inaktive Reiter) werden durch die neuen
  Vorlader auf `eager` gestellt. Das ist ein Fehlschlag, denn `eager` lädt auch ohne Box, und das würde alles auf einmal holen. Bewusste
  Ausnahmen sind die ersten Karten hinter einem Umschalter (Showroom und Neuheiten-Reiter, 4.1) und die Zeilenbilder des Drawers (4.2).
- Vorab geholte Links mit Nebenwirkung: Abmelden, Warenkorb, Kasse, Rabatt-Links.
- Eine bestehende Entscheidung des Nutzers wird zurückgedreht, z. B.:
  - die Menübilder als JPG;
  - das Vorladen von Megamenü und Schublade;
  - die Produktgalerie mit weißem Grund.

## 3. Rahmen

- Shopify-Theme, Repo `Lux593/powershop-onlineshop`. Ein Push auf `main` geht per GitHub-Integration sofort live.
  - Gepusht wird nur mit ausdrücklichem Okay des Nutzers.
  - Nie `shopify theme push` aufs Live-Theme.
- Vorschau und Test:
  - Die Vorschau läuft über `shopify theme dev` mit eigenem Entwicklungs- bzw. unveröffentlichtem Theme. So überschreibt sich nichts mit
    anderen Sitzungen, die parallel `theme dev` auf Port 9292 nutzen. Muster ist der launch-Eintrag `ueber-uns-vorschau` mit `--theme`.
  - Für den Test am iPhone gibt es einen Vorschau-Link.
- Der Nutzer testet oft im Live-Shop. Bei jeder Rückmeldung ist klar zu sagen, ob etwas schon live ist oder nur in der Vorschau.
- Code-Stil wie im Theme:
  - Vanilla JS im bestehenden Stil (`PS.on`, kein Build-Schritt, keine neue Bibliothek);
  - Kommentare auf Deutsch, mit Begründung bei bewussten Entscheidungen.
- Theme Check bleibt grün.
- Wichtigster Browser ist Safari auf dem iPhone (iOS 26), der Nutzer testet dort. Dazu kommen Chrome und Firefox am Desktop.

## 4. Was entschieden ist

### 4.1 Schienen vorladen (Ziel 1)

- Der Code kommt zentral zu den Schienen in `assets/theme.js` (`PS.on('.rail', …)`), als eigener Block. Der bestehende Block bricht ab,
  wenn eine Schiene keine Pfeile hat. Das Vorladen soll für jede Schiene gelten:
  - `.rail`: Showroom (`sections/showroom.liquid:83`), Events (`sections/story-events.liquid:92`), Bike-Schiene und „Ähnliche Artikel“
    auf der Produktseite (`sections/product.liquid:337`, `snippets/product-rail.liquid:41`);
  - `.product-grid--rail`: die Neuheiten der Startseite (`sections/product-tabs.liquid:49`). Das ist keine `.rail`. Unter 1024 px ist
    es eine Schiene mit gut 1,5 sichtbaren Karten (`assets/home.css:124–130`), am Desktop ein normales Raster. Dort bleibt nur Schritt 1.
- Ablauf:
  1. **Annähern.** Kommt die Schiene in die Nähe des Fensters (Richtwert: 1 Fensterhöhe Vorlauf), stellen sich die Bilder der sichtbaren
     Karten plus der nächsten 2–3 Karten rechts davon auf `eager`. Der Beobachter startet erst nach `load` (Anti-Ziele).
  2. **Wischen und Pfeile.** Ein zweiter Beobachter mit der Schiene selbst als Bezugsrahmen (root) und seitlichem Rand stellt die
     nächsten Karten rechtzeitig auf `eager`. Ein großer Rand am Fenster reicht nicht, weil die Schiene abschneidet.
     - Richtwert für den Rand: 1 Schienenbreite, aber mindestens 3 Karten. Am Handy zeigt die Showroom-Schiene nur gut 1 Karte, eine
       Schienenbreite wäre dort beim zügigen Wischen zu knapp.
     - Dieser Beobachter startet erst, wenn Schritt 1 die Schiene meldet. Mit der Schiene als root sieht er nicht, wo die Schiene auf
       der Seite liegt. Gleich beim Start würde er die ersten Karten jeder Schiene laden, auch ganz unten auf der Seite.
  3. **Ausgeblendete Karten** im Showroom (anderer Zustand per `display: none`, andere Baureihe per `hidden`) überspringen die Beobachter.
     Wird eine Karte sichtbar, greift Schritt 2.
  4. **Umschalter.** Der Showroom (`assets/sections.js`, ohne neuen Reveal) und die Neuheiten-Reiter (`PS.selectTab` in
     `assets/theme.js`) zeigen nach dem Umschalten gleich die neuen Karten. Ihre Bilder müssen also vorher da sein. Am iPhone gibt es kein Zeigen, und Safari fokussiert Knöpfe beim Tippen nicht (`assets/header.js:65`).
     Ein Vorladen erst beim Tippen käme dort nur einen Sekundenbruchteil vor dem Umschalten.
     - **Neu / Gebraucht & Vorführer:** Sind die Bilder der sichtbaren Karten fertig, stellen sich im Leerlauf die Bilder der ersten
       3 Karten des anderen Zustands auf `eager`. Der andere Zustand ist per `display: none` versteckt (`assets/theme.css:7–8`).
       *Claudes Entscheidung.*
     - **Baureihen-Chips:** erst bei Absicht (Zeigen mit der Maus, Fingerauflegen per `pointerdown`, Tastaturfokus), dann die ersten
       3 Karten dieser Baureihe. Alle Baureihen vorab zu laden wäre zu viel. Am iPhone kann nach dem Tippen auf einen Chip kurz das
       Einblenden zu sehen sein, wie heute. *Claudes Entscheidung.*
     - **Neuheiten-Reiter** (3 Reiter mit je 4 Karten, die anderen per `hidden`): Mit der Maus beim Zeigen auf einen Reiter oder bei
       Tastaturfokus die Karten dieses Reiters. Am Touch-Gerät im Leerlauf, sobald der Abschnitt nah ist, die ersten 2 Karten jedes
       anderen Reiters. Am Handy sind nach dem Wechsel gut 1,5 Karten zu sehen. *Claudes Entscheidung.*
  5. Bei `saveData` und 2G/3G passiert nichts davon.
- **Das Einblenden bleibt.** Heute hängt die Regel in `assets/shop.css:503–504` am Attribut `[loading="lazy"]`. Stellt das Skript ein
  Bild auf `eager`, griffe die Regel nicht mehr, und ein noch ladendes Bild erschiene ohne Einblenden.
  - Deshalb setzt Liquid an genau die Bilder, die heute lazy ausgegeben werden, ein eigenes Merkmal (Vorschlag: `data-fade`). Die
    Regel hängt dann an diesem Merkmal. Betroffen sind das Bild der Bike-Karte und das Hauptbild der Produktkarte.
  - Eager ausgegebene Erstblick-Karten bekommen das Merkmal nicht.
  - *Vom Nutzer entschieden (11.11.):* Ein vorgeladenes Bild ist beim Sichtbarwerden fertig und erscheint ohne sichtbares Einblenden,
    so wie heute schon ein Bild aus dem Cache. Das Einblenden bleibt im Code und greift weiter, wenn ein Bild doch spät kommt. Die
    Reveals der Karten (`data-reveal`, Staffel) laufen unverändert.
  - Das gilt auch außerhalb der Schienen. Auf Kollektions- und Suchseiten haben die Karten ab der fünften `data-reveal` und ein lazy
    Bild (`sections/collection.liquid:141–145`, `sections/search.liquid:61–63`). Der Vorlader aus 4.3 lädt ihre Bilder vor, sie sind
    beim Reveal fertig.
- Gilt für alle Schienen-Bilder, auch in den Events- und Produkt-Schienen, die kein `data-fade` haben.

### 4.2 Warenkorb (Ziel 2)

- `addNow` in `assets/cart.js` holt kein `/cart.js` mehr.
  - Die Stückzahl kommt aus dem mitgelieferten Drawer-HTML. `sections/cart-drawer.liquid` gibt sie maschinenlesbar mit, z. B. als
    `data-count="{{ cart.item_count }}"` am `<dialog>` (Zeile 44). `applySections` liest sie dort.
  - Fehlt die Section in der Antwort, holt der Code wie bisher `/cart.js`.
- Die beiden Aufrufer von `PS.cart.add` (`assets/cart.js:237` und `:250`) nutzen den Rückgabewert nicht. Was `add` künftig zurückgibt,
  entscheidet der Builder.
- **Vorschaubild beim Klick vorladen.** Beim Klick auf „In den Warenkorb“ (Formular) und auf Quick-Add (`[data-add-variant]`) lädt der
  Code das Bild, das die neue Warenkorb-Zeile zeigen wird, per `new Image()` vor.
  - Das Bild ist das der Variante, sonst das des Produkts, wie `item.image` in `cart-line.liquid`.
  - Die URL muss genau so aussehen wie in `cart-line.liquid` (`image_url: width: 176`), sonst trifft der Cache nicht. Deshalb entsteht
    sie in Liquid mit demselben Filter:
    - auf der Produktseite pro Variante im Produkt-JSON (`snippets/pdp-options.liquid:69–84`);
    - beim Quick-Add als Attribut am Knopf (`snippets/product-card.liquid:106` und `:114`).
  - `image_tag` setzt zusätzlich ein `srcset`. Bei 176 px enthält es laut Shopify-Doku nur diese eine Breite, die URL ist also
    dieselbe. Ob das stimmt, zeigt das Netzwerk: Das Drawer-Bild muss aus dem Cache kommen.
- **Zeilenbilder des Drawers nach Laden plus Leerlauf auf `eager`.** Das sind kleine 176-px-Bilder (Muster: `assets/header.js`).
  Bewusste Ausnahme vom Anti-Ziel „nichts Verstecktes auf eager“: Es sind wenige, kleine Bilder, und erst nach `load`.
  *Claudes Entscheidung.*
- Ablauf, Lade-Band am Knopf, „Hinzugefügt“-Zustand, Warteschlange, Fokusrückgabe und Zeilen-Staffel beim Öffnen bleiben unverändert.

### 4.3 Vorlader für Reveals (Ziel 3)

- Der Code kommt zentral in `assets/motion.js`, neben den gemeinsamen Reveal-Observer.
- Ein zusätzlicher IntersectionObserver aufs Fenster mit großem Rand nach unten (Richtwert 150 % der Fensterhöhe; `about-team.js:60`
  nutzt 100 %) beobachtet `[data-reveal]`-Elemente, in denen lazy Bilder stecken.
  - Er startet erst nach `load` (Anti-Ziele). Sonst kämen beim Seitenaufruf die Reveal-Bilder der ersten anderthalb Bildschirme dazu.
  - Er hängt sich an `watch()` in `assets/motion.js`. So erfasst er auch Karten, die später eingefügt werden (Filter, Section-Reload).
    Die startet heute schon der MutationObserver in `assets/motion.js:356`.
  - Beim Eintritt stellen sich deren Bilder auf `eager` und werden per `decode()` dekodiert. Danach beobachtet er das Element nicht
    mehr.
  - Bilder in Schienen fasst er nicht an, die gehören zu 4.1. Sonst würde ein Reveal um eine Schiene alle Showroom-Bilder auf einmal
    laden.
  - Bilder ohne Box (versteckt) fasst er ebenfalls nicht an. Ebenso Bilder, die ein eigenes Skript lädt (Hero, Über uns, Werkbuch,
    Menü, Produktgalerie). Deren Reihenfolge ist dort bewusst gewählt.
- Der Vorlader läuft nur, wenn Bewegung an ist (`html.has-motion`), denn nur dann gibt es Reveals. Bei `saveData` und 2G/3G läuft er
  nicht.
- Die Reveal-Animation selbst bleibt gleich: Auslöser, Rand, Dauer, Staffel und Clip.

### 4.4 Zweitbild der Produktkarte (Ziel 4)

- In `assets/components.css` ist `.pcard__img--alt` nur noch unter `(hover: hover) and (min-width: 1024px)` vorhanden. Sonst steht es
  auf `display: none`. Ein Lazy-Bild ohne Box lädt nicht.
- Sichtbar ändert sich nichts. Das Bild ist absolut positioniert und außerhalb dieser Bedingung ohnehin unsichtbar.
- Mit Maus am Desktop bleiben Hover- und Fokus-Wechsel genau wie heute.

### 4.5 Seiten vorab holen (Ziel 5)

- In `layout/theme.liquid` (head) kommen Speculation Rules: nur `prefetch`, nur gleiche Herkunft, nicht im Theme-Editor
  (`request.design_mode`). Shopify selbst setzt in diesem Shop keine (Live-HTML vom 11.11. geprüft).
- **Eagerness je nach Gerät.** *Claudes Entscheidung.*
  - Mit Maus (`(hover: hover) and (pointer: fine)`): `moderate`, in Chrome nach ca. 200 ms Zeigen.
  - Am Touch-Gerät: `conservative`, also beim Fingerauflegen. Grund: Seit Chrome 138 löst `moderate` auf Android schon aus, wenn ein
    Link ins Bild kommt (Viewport-Heuristik, blink-dev-Hinweis „mobile moderate eagerness improvements“). Beim Scrollen durch eine
    Kollektion würden laufend Seiten vorab geholt, mit Datenverbrauch am Handy.
  - JSON kennt keine Media Query. Deshalb setzt ein kleines Inline-Skript die passende Regel ein.
- **Kein `prerender`.** Sonst liefen Intro, Hero-Film und Animationen unsichtbar vorab, und die Statistik würde zu früh zählen.
- **Nie vorab holen**, nach dem Prinzip „nur Seiten ohne Nebenwirkung“:
  - Warenkorb und Kasse (`/cart…`, `/checkout…`, `/checkouts/…`);
  - Konto und Anmelden/Abmelden (`/account…`, `/customer_authentication/…`);
  - Rabatt-Links (`/discount/…`), Passwort- und Challenge-Seite;
  - App-Proxy-Pfade (`/apps/…`, `/a/…`, `/tools/…`, `/community/…`): Dort antworten Apps, Nebenwirkungen sind möglich;
  - Filter- und Sortierlinks der Kollektion (`[data-filter-link]`, laufen per fetch);
  - `target="_blank"`, `download`, `rel~=nofollow` und ein eigenes Abschalt-Merkmal (z. B. `data-no-prefetch`).
- **Der Warenkorb darf nie veraltet erscheinen.** Zähler und Drawer rendert Shopify in jede Seite. Eine Seite, die vor einem Hinzufügen
  vorab geholt wurde, zeigte danach den alten Stand. Beispiel: Produktkarte zeigen (Prefetch), Quick-Add, dann die Karte anklicken. Das
  Warenkorb-Cookie ändert sich ab dem zweiten Artikel nicht, der Browser merkt es also nicht selbst. Deshalb:
  - Nach jeder Warenkorb-Änderung (`ps:cart`) wird die Regel entfernt und neu eingesetzt. Laut Chrome-Blog („Improvements to the
    Speculation Rules API“) bricht Chrome entfernte Spekulationen ab. Ob das auch fertige Prefetches verwirft, zeigt der Test.
  - Sicherheitsnetz für jeden Browser: Der Drawer gibt einen Fingerabdruck des Warenkorbs mit (Menge, Summe, Positionen). Der Code
    merkt sich den letzten Stand im `sessionStorage`. Weicht der Fingerabdruck beim Seitenaufruf oder bei `pageshow` ab, holt er Drawer
    und Zähler einmal neu (Section Rendering wie `applySections`).
  - Das behebt nebenbei einen bestehenden Fehler: Nach „Zurück“ zeigt die Seite aus dem bfcache heute den alten Zähler
    (`assets/cart.js` hat keinen `pageshow`-Handler). *Claudes Entscheidung.*
- Safari ignoriert die Regel heute. Ab Safari 26.2 gibt es Prefetch nur hinter einer Entwickler-Einstellung, und `moderate` gilt dort als
  `conservative` (MDN-Kompatibilitätsdaten). Firefox ignoriert sie ebenfalls. Am iPhone bringt Ziel 5 also vorerst nichts.
- Die View Transitions (`layout/theme.liquid:110–137`) bleiben unverändert.

## 5. Prüfung und woran Erfolg gemessen wird

Messung vorher und nachher, mit denselben Methoden wie in der Analyse:
- im Browser-Pane mit Chrome;
- vorher die rAF-Rate prüfen: Ist der Pane versteckt oder das Fenster verdeckt, drosselt Chrome auf ca. 1,5 Bilder/s;
- für Lazy-Messungen ein neuer Tab gegen den Memory-Cache.

Dazu kommt eine Sichtprüfung in Safari im iOS-Simulator und über den Vorschau-Link am iPhone des Nutzers.

1. **Showroom:** Schnelles Wischen (Desktop 4000 px/s, Handy-Emulation 3000 px/s): Fast alle sichtbar werdenden Karten haben ihr Bild
   fertig (heute 3 von 26). Auch nach dem Umschalten Neu/Gebraucht sind die ersten Karten da, auch am iPhone. Im Simulator: keine
   dunklen Kästen beim Wischen und nach dem Umschalten. Nach einem Baureihen-Chip darf am iPhone kurz das Einblenden zu sehen sein.
   Neuheiten: Am Handy durch die Schiene wischen und den Reiter wechseln, die Bilder sind da. Gemessen wird über die Verbindung des Mac.
   Über Mobilfunk kann bei sehr schnellem Wischen vereinzelt noch ein Bild spät kommen. Dann blendet es wie heute ein.
2. **Warenkorb:**
   - Im Netzwerk nur noch eine Anfrage pro Hinzufügen.
   - Klick bis Drawer offen um diese Runde kürzer (heute 0,56–0,96 s).
   - Das Vorschaubild ist beim Öffnen sichtbar und kommt aus dem Cache, ohne zweite Anfrage.
   - Menge ändern und Entfernen funktionieren wie bisher (0,36 s).
3. **Reveals:** Beim Scrollen mit 2500 px/s sind die Bilder unter `[data-reveal]` geladen, wenn der Reveal startet.
4. **Kollektion am Handy:** etwa halb so viele Kartenbild-Anfragen. Am Desktop mit Maus unverändert, auch der Hover-Wechsel.
5. **Vorab holen:**
   - Mit der Maus: Zeigen auf einen Produktlink löst einen Prefetch aus (`Sec-Purpose: prefetch`), der Seitenwechsel nutzt ihn.
   - In der Handy-Emulation steht die `conservative`-Regel im Dokument.
   - Kein Prefetch für die Ausnahmen aus 4.5.
   - Warenkorb-Test: Produktkarte zeigen, Quick-Add, dann die Karte anklicken. Zähler und Drawer der neuen Seite stimmen. Ebenso nach
     „Zurück“ (bfcache).

Immer zusätzlich:
- Alle Animationen und Effekte sehen aus wie vorher (Sichtvergleich am Desktop und am Handy): Startseite, Showroom, Kollektion,
  Produktseite, Drawer, Über uns.
- Scrollen am Mac bleibt bei p99 < 10 ms pro Bild.
- Bis `load` kommen beim Seitenaufruf keine zusätzlichen Anfragen dazu.
- Theme Check grün.

## 6. Dem Builder überlassen

- Exakte Ränder und Zahlen innerhalb der Richtwerte: Vorlauf, Anzahl vorgeladener Karten, `fetchpriority` der Vorlader.
- Name und Form des Einblend-Merkmals und die Struktur der Funktionen.
- Wie die 176-px-URL ins Produkt-JSON bzw. an den Quick-Add-Knopf kommt.
- Die genaue Ausnahmeliste der Speculation Rules, nach dem Prinzip aus 4.5.
- Die Form des Warenkorb-Fingerabdrucks und wie die Regel nach einer Warenkorb-Änderung neu eingesetzt wird.
- Ob `sizes` der Bike-Karte an die echte Kartenbreite angepasst wird: Am Handy ist die Karte ca. 293–310 px breit, `sizes` sagt 86vw,
  geladen wird heute 1200w. Das nur, wenn das Bild auf dem iPhone (3×) gleich scharf bleibt.
- Die Aufteilung in Commits und die Reihenfolge der fünf Teile. Sie hängen nicht voneinander ab.

## 7. Claudes Entscheidungen auf einen Blick

- Alle neuen Vorlader starten erst nach `load` plus Leerlauf.
- Schienen laden beim Annähern vor und beim Wischen mindestens 3 Karten voraus.
- Showroom: Die ersten 3 Karten des anderen Zustands (Neu bzw. Gebraucht) laden im Leerlauf vor, sobald die sichtbaren fertig sind.
  Baureihen-Chips laden erst bei Absicht vor.
- Neuheiten-Reiter: mit der Maus beim Zeigen, am Touch-Gerät die ersten 2 Karten jedes Reiters im Leerlauf.
- Bei `saveData` und 2G/3G wird nirgends vorgeladen.
- Das Einblenden hängt an einem eigenen Merkmal statt am `loading`-Attribut, damit es für noch ladende Bilder erhalten bleibt.
- Die Zeilenbilder des Drawers laden nach `load` plus Leerlauf.
- Seiten werden nur per `prefetch` vorab geholt, kein `prerender`: mit Maus `moderate`, am Touch-Gerät `conservative`.
- Der Warenkorb-Abgleich beim Seitenaufruf behebt auch den alten Zähler nach „Zurück“.
