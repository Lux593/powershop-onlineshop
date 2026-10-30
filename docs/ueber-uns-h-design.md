# Design: Über-uns-Seite nach Entwurf H

Stand 30.10.2026. Entwurf H ist vom Nutzer freigegeben („ist freigegeben“, 30.10.2026). Dieses Dokument beschreibt, was ins Shopify-Theme
übernommen wird. Ein Plan für den Einbau folgt erst, wenn dieses Dokument abgenommen ist.

Mit „Claudes Entscheidung“ markierte Punkte hat der Nutzer nicht selbst entschieden. Er soll sie beim Lesen prüfen.

## 1. Worum es geht

Die Seite `/pages/ueber-uns` ist live, zeigt aber nur einen Seitenkopf (Vorlage `templates/page.ueber-uns.json`, Section `service-page`
mit der Überschrift „Über uns“). Sie ist im Hauptmenü unter Service › Über uns verlinkt. Sie soll die Geschichte des Power Shop als
Familienbetrieb erzählen, das Team zeigen und zum Besuch einladen.

Warum: Der Power Shop ist ein Harley-Davidson-Vertragshändler in zweiter Generation. Was ihn von einem anonymen Shop unterscheidet, sind
die Familie, die Werkstatt und der Ort. Die alte Website hatte dazu nur Textseiten. Über mehrere Entwürfe (A bis H) hat der Nutzer
ausgewählt, wie das wirken soll. H verbindet das helle Bild-neben-Text-Layout aus F mit der Vollbild-Bewegung aus E.

## 2. Referenz

| Was | Wo |
|---|---|
| Quelle des Entwurfs (maßgeblich) | `entwuerfe/ueber-uns/h-vollbild.html`, dazu `shared/base.css`, `shared/karten.css`, `shared/team.js`, `shared/team-spotlight.js` |
| Veröffentlichte Fassung | https://claude.ai/artifact/FWXNW7qJETMbhTA5cYKdGB, Version 37 |
| Lokale Vorschau | launch-Eintrag `entwuerfe-ueber-uns`, Port 8765, Seite `h-vollbild.html` |
| Bilder | `entwuerfe/ueber-uns/bilder/` |

Aussehen und Bewegung der Referenz gelten, wo dieses Dokument nichts anderes sagt. Abweichen darf der Einbau nur in den Punkten aus
Abschnitt 6 (Anpassungen an das Theme).

## 3. Ziele, Nicht-Ziele, Anti-Ziele

**Ziele**
- Die Seite sieht am Desktop und am Handy aus und bewegt sich wie H, Version 37.
- Alle Texte, Bilder und Personen sind im Theme-Editor pflegbar, wie bei Werkstatt und Dienstleistungen.
- Ohne Bewegung (Setting aus, reduzierte Bewegung, Theme-Editor, Datensparen) ist alles sichtbar und lesbar.
- Die Seite hält die Regeln des Themes ein (Abschnitt 5).

**Nicht-Ziele**
- Keine neuen Inhalte und keine neuen Fakten über den Händler. Texte kommen aus dem Entwurf oder vom Nutzer.
- Kein Umbau anderer Seiten. Service, Werkstatt, Dienstleistungen und die Startseite bleiben, wie sie sind.
- Keine Arbeit an den Entwürfen A bis G.
- Keine sichtbaren Änderungen aus der Design-Kritik vom 30.10. (`powershop-onlineshop/.impeccable/critique/`, Ordner über dem Theme-Repo). Die leere Linie des Balkens bleibt so hell wie
  in V37, ebenso die zwei orangen Knöpfe in „Komm vorbei“ und die Flächen am Tablet und bei 3440 px. Das kann eine spätere Runde mit dem
  Nutzer werden. Unsichtbare Korrekturen stehen in Abschnitt 6.

**Anti-Ziele (wäre ein Fehlschlag, auch wenn es technisch läuft)**
- Fotos, die beim Umblättern zoomen, wachsen oder im Rahmen gleiten. Das hat dem Nutzer am 30.10. „fast schlecht“ gemacht.
- Ein Ruck, ein weißes Aufblitzen oder ein springender Fortschrittsbalken beim Scrollen durch die Etappen.
- Erfundene Jahreszahlen, Namen, Rollen oder Aussagen.
- Ein Push auf `main` ohne ausdrückliches Okay. Ein Push auf `main` geht sofort live.

## 4. Die Seite, von oben nach unten

### 4.1 Service-Unternavigation

Bleibt wie heute über dem Seitenkopf: `service-subnav`, dunkel, nicht klebend. **Claudes Entscheidung**, weil Werkstatt und
Dienstleistungen sie auch haben. Der Entwurf zeigt sie nicht.

### 4.2 Seitenkopf „Halle, dunkel“

- Schwarz (`on-dark`). Links die Überschrift „Seit 1985 in *Familienhand.*“ („Familienhand.“ orange) und der Satz „Offizieller
  Harley-Davidson-Vertragshändler in Weil am Rhein, in zweiter Generation.“
- Rechts das Crew-Foto (`bilder/foto/crew-auf-bikes-quer.jpg`, Wunsch des Nutzers vom 30.10., vorher Hallenfoto `softail-licht.jpg`) bis an den rechten Rand. Seine linke Kante liegt genau über der Teilung der
  Etappen darunter (Spalten 1.08fr | 1fr, also `calc(108% / 2.08)`).
- Der Kopf füllt den ersten Bildschirm: Er endet beim Laden an der Unterkante des Fensters (Fenster minus Ankündigung, Kopfleiste und
  Service-Leiste). Wunsch des Nutzers vom 30.10., vorher `clamp(440px, 38vw, 640px)`. Überschrift `clamp(44px, 5.8vw, 92px)`.
- Am Handy hat der Kopf unter dem Text einen schwarzen Saum von 120 px (`--about-head-skirt`). Safari am iPhone zeigt die Seite auch
  hinter seiner Leiste unten, beim Laden 98 px unter der gemeldeten Fensterhöhe. Ohne Saum lagen dort die weiße Etappe und der Balken
  frei (Meldung des Nutzers vom 30.10., „beim Laden der Seite ist der untere Bereich schon sichtbar“).
- Am Handy (unter 900 px) steht das Foto oben über die volle Breite und nimmt den Platz über dem Text ein (mindestens 34svh), darunter
  der Text. Die Überschrift ist dort `clamp(44px, 12.8vw, 56px)` groß.
- Beim Laden setzt sich das Foto aus 1,08 auf 1 (1,8 s, expo.out).
- Auftritt der Geschichte (Wunsch des Nutzers vom 30.10.): Die Bühne liegt von Anfang an hinter dem Kopf und pinnt an der
  Kopfleiste. Der Kopf scrollt über ihr weg, seine Unterkante deckt sie von unten nach oben auf wie ein Rolltor: zuerst den Balken,
  dann die erste Etappe. Jahreszahl und Text steigen dabei um 40 px auf und blenden ein, der Kopf dunkelt bis 0,75 ab. Erst danach
  blättert die Bühne um. Die Bühne steht dabei wirklich still (Pin). Eine erste Fassung führte sie per Skript der Scrollposition nach,
  sie sprang dabei bei jedem Scrollen auf und ab. Fotos zoomen nicht.
- Kein Bar & Shield und kein Power-Shop-Signet im Kopf.

### 4.3 Die Geschichte: vier Etappen auf einer Bühne

**Ohne Bewegung:** Die Etappen stehen untereinander. Jede ist ein Block mit Foto und Text (Desktop: Foto links, Text rechts; Handy: Foto
oben, Text unten). Es gibt keinen Fortschrittsbalken.

**Mit Bewegung:** Die Bühne bleibt stehen (gepinnt), während man scrollt. Jede Etappe füllt die ganze Bühne.
- Bühnenhöhe: Bildschirmhöhe minus Kopfleiste, mindestens 520 px. Am Handy reicht sie bis `100lvh`, also bis unter die eingeklappte
  Leiste von Safari. Foto und Text jeder Etappe enden trotzdem an `100svh` (Innenabstand unten `100lvh - 100svh`), darunter bleibt
  es weiß.
- **Am Handy unten immer weiß (Meldung des Nutzers vom 30.10., „unten ist sehr viel schwarzer Leerraum“):** Safari 26 färbt den
  Streifen hinter seiner Leiste nach dem festen Inhalt am unteren Rand, auf der gepinnten Bühne also nach Bühne und Etappe. Seiten-
  und Abstandshalter-Farbe wirken dort nicht. Grund der Bühne und Abstandshalter des Pinnens sind am Handy darum weiß, am Desktop
  schwarz. Im iOS-Simulator (iPhone 17 Pro) geprüft, eingeklappt wie ausgeklappt.
- Scrollweg: eine Bildschirmhöhe pro Etappenwechsel.
- Kein Einrasten (Wunsch des Nutzers vom 30.10., vorher snap auf 1/(Anzahl−1)). Die Lage der Etappen hängt nur vom Scrollen ab. Wer
  zwischen zwei Etappen anhält, bleibt dort stehen. Der Scrub (0,6) zieht nur hinter der Scrollposition her.

**Umblättern (Version 36, Idee des Nutzers):** Die Etappen liegen übereinander, spätere oben. Pro Wechsel eine Zeiteinheit:
1. 0 bis 0,6: Die nächste Etappe schiebt sich als Ganzes von rechts über die aktuelle (power2.inOut). Die aktuelle bleibt stehen. Am
   Desktop fährt dabei zuerst das neue Foto über Jahreszahl und Text der alten Etappe. Dahinter folgt die weiße Textspalte der neuen
   Etappe, noch leer. Diese kurze Leere will der Nutzer ausdrücklich.
2. Ab 0,5: Jahreszahl, Überschrift, Text und Ort der neuen Etappe gleiten nacheinander von rechts herein und blenden ein. Sie starten
   22 % der Bühnenbreite weiter rechts, am Handy 40 %. Je Teil 0,3 lang, 0,05 versetzt, power3.out. Bis dahin ist keines davon zu
   sehen: Am 30.10. standen Überschrift, Text, Ort und Vorschau schon beim Hereinfahren da, verschwanden kurz und kamen dann ein zweites
   Mal („die Texte laden doppelt“). Ursache war ein gestaffeltes Einblenden, das vorab nur das erste Teil versteckt.
3. An der linken Kante der hereinfahrenden Etappe liegt ein weicher Schatten. Wartende Etappen stehen weit genug außerhalb, dass ihr
   Schatten nicht ins Bild ragt.
4. Rückwärts läuft alles genau umgekehrt.

Kein Foto zoomt, wächst oder verschiebt sich im eigenen Rahmen.

**Fotogalerie je Etappe (Wunsch des Nutzers vom 30.10.):**
- Eine Etappe kann bis zu vier Fotos haben: das Hauptfoto und bis zu drei weitere. Die weiteren liefert der Nutzer.
- Ab zwei Fotos steht unter dem Text (nach dem Ort) eine Reihe kleiner Vorschaubilder, 3 : 2. Nicht gewählte sind schwarz-weiß, das gewählte
  ist farbig und hat einen orangen Strich unten, wie die Namensliste im Team.
- Ein Klick schiebt das große Foto über das bisherige, das stehen bleibt (0,6 s, power2.inOut, nur waagerecht, kein Zoom).
- Richtung laut Nutzer: Liegt das neue Foto in der Vorschau links vom bisherigen, bewegt es sich von rechts nach links. Liegt es rechts,
  bewegt es sich von links nach rechts.
- Ohne Bewegung, bei reduzierter Bewegung und im Editor wechselt das Foto sofort. Die Galerie hängt nicht an GSAP.

**Fortschrittsbalken** am Desktop am Fuß der Bühne, am Handy oben auf der Bühne direkt unter der Kopfleiste (Wunsch des Nutzers vom
30.10.: „mach den Zeitstrahl in der mobilen Ansicht oben“). Unten verdeckte ihn sonst die ausgeklappte Leiste von Safari:
- Schwarzer Balken mit den Jahren in gleich breiten Spalten (heute vier: 1985, 1991, 2016, Heute).
- Eine graue Linie läuft von der Mitte der ersten bis zur Mitte der letzten Zahl. Sie füllt sich stufenlos orange und folgt dabei der
  Lage der Etappen, nicht dem rohen Scrollwert.
- Eine Zahl wird orange, sobald der orange Balken sie erreicht.
- An der Spitze des Balkens fährt das H-D Bar & Shield mit (Kontur, #f3692b, auf schwarzem Grund). Erreicht es eine Zahl, blendet die
  Zahl samt ihrem schwarzen Grund aus und hinter dem Zeichen wieder ein.
- Desktop: Zahlen `clamp(20px, 1.45vw, 26px)`, Linie 3 px, Zeichen `clamp(30px, 2.2vw, 40px)`. Handy: Zahlen 15 px, Zeichen 20 px.
- Die Zahlen sind Links. Ein Klick scrollt zur Etappe, ohne Bewegung führt der Anker direkt hin. Die aktuelle trägt
  `aria-current="step"`.
- Rechts unten auf der Bühne steht „Weiterscrollen“ mit Pfeil. Der Hinweis verschwindet nach den ersten 3 % des Wegs. Am Handy gibt es
  ihn nicht.

**Übergang zum Team:** Nach „Heute“ bleibt die Bühne gepinnt stehen, und der dunkle Team-Bereich schiebt sich von unten über sie, eine
Bühnenhöhe Scrollweg lang. Das ist der Auftritt aus dem Kopf in umgekehrter Richtung. Dabei passiert Folgendes:
- Die Etappe „Heute“ bleibt, wie sie ist. Sie wird nicht verkleinert und nicht hinausgeschoben, sie dunkelt nur bis 0,75 ab.
- Das Team deckt am Desktop zuerst den Fortschrittsbalken zu, dann die Etappe, und wirft dabei einen weichen Schatten auf sie. Am
  Handy steht der Balken oben und wird als Letztes zugedeckt.
- Am Handy steht während des Übergangs ein schwarzer Streifen fest am unteren Rand, ganz unter der Leiste von Safari
  (`.about-story__edge`, vom Skript eingesetzt und nach dem Pinnen wieder entfernt). Sonst nähme Safari dort die weiße Etappe, und
  unter dem schwarzen Team läge ein weißer Streifen. Den Grund der Bühne umzufärben wirkt nicht, die Etappe liegt darüber (im
  iOS-Simulator geprüft, 30.10.). Nach dem Pinnen ist nichts mehr fest, Safari zeigt dann die Seite selbst hinter der Leiste.
- Am Ende erreicht die Oberkante des Teams die Kopfleiste, das Pinnen endet, und die Bühne liegt genau hinter dem Team. Das Team ist
  dafür mindestens so hoch wie die Bühne, der Inhalt steht dann mittig.
- Geschichte (Meldungen des Nutzers vom 30.10.): Bis dahin sank die Etappe halb so schnell, wie die Seite scrollte, und wurde auf 0,92
  kleiner, der Balken fuhr auf der Oberkante des Teams hinaus. Das Skript schob die Etappe dafür gegen das Scrollen nach unten und kam
  am iPhone nicht hinterher („der Übergang zu dem Team ist ruckelig“). Die Verkleinerung fand der Nutzer unnötig: „Das Team soll die
  Karte Heute überdecken und nicht oben rausschieben.“

### 4.4 Das Team

Dunkler Bereich mit Körnung (`on-dark textured`), Titel „Das Team“.
- **Desktop ab 900 px:**
  - Links der Titel hochkant.
  - Daneben Name, Rolle und Text der gewählten Person, darunter zwei Pfeile.
  - Rechts ein großes Foto im Format 3:2. Es zeigt den breiten Ausschnitt mit dem ganzen Motorrad. Fehlt der breite Ausschnitt, steht
    das quadratische Foto vollständig darin (`contain`), auf Schwarz.
  - Das Raster mit allen acht kleinen Vorschauen steht von 900 bis 1279 px in einer Reihe unter dem Foto, ab 1280 px als 4×2 in der
    Textspalte unter den Pfeilen.
  - Der Nachname steht unter dem Vornamen.
- **Handy:**
  - Quadratisches Foto, das Raster mit 2×4 Vorschauen. Keine Pfeile.
  - Man wechselt per Klick auf eine Vorschau oder durch Wischen auf dem Foto.
- **Wechsel:**
  - Das Foto wechselt senkrecht: Das neue fährt von oben oder unten herein und setzt sich dabei aus 1,12 auf 1, das alte fährt 35 % im
    Rahmen weiter und blendet aus (0,75 s, `shared/team-spotlight.js`). Das bleibt wie in V37. **Claudes Entscheidung**: Der Nutzer hat
    das so abgenommen und nie bemängelt. Das Verbot von Zoom und Gleiten in Abschnitt 3 gilt für das Umblättern der Etappen.
  - Der Text wird ausgetauscht.
  - Alle Texte liegen übereinander in derselben Zelle, deshalb springt die Höhe nicht.
  - Eine Live-Region sagt die neue Person an.
- **Vorschauen:** schwarz-weiß. Die gewählte und die unter dem Zeiger sind farbig, die gewählte hat einen orangen Rand.
- **Entfernt auf Wunsch des Nutzers, also nicht wieder einbauen:** Zähler „01 / 08“, WhatsApp-Knopf „Nachricht an …“, Notiz zum Team.
- **Ohne Skript:** Alle Personen stehen mit Foto, Name, Rolle und Text da. Das Markup kommt aus Liquid, das Skript ordnet nur um und
  blendet aus. Im Entwurf baut das Skript das Markup aus `team.js`, das ändert sich im Theme.

### 4.5 Komm vorbei

Aufgebaut wie eine Etappe.
- **Links:** die dunkle Karte des Dreiländerecks (OpenStreetMap) mit orangem Pin. Am Pin hängt ein weißes Schild mit Bar & Shield und
  „Power Shop“. Der Pin landet einmal, wenn die Karte ins Bild kommt. Es gibt keinen auslaufenden Ring.
- **Rechts auf Weiß:**
  - „Komm vorbei.“, der Punkt im Akzent-Orange `--c-orange` wie bei „HEUTE.“.
  - Adresse und der Satz „Im Stadtteil Haltingen, mitten im Dreiländereck.“
  - „Route planen“.
  - Drei Knöpfe: „Anrufen“ in Orange, ab 900 px mit Nummer, dazu WhatsApp und E-Mail mit 2 px schwarzer Kontur.
  - Der Lieferhinweis: „Zu weit für einen Besuch? Wir liefern Motorräder auf Wunsch in ganz Deutschland, in die Schweiz und nach
    Frankreich und übernehmen Export und Verzollung.“
- **Knöpfe nach Breite:** Am Desktop steht „Anrufen“ über die ganze Breite und darunter die anderen zwei. Von 640 bis 899 px stehen alle
  drei nebeneinander, am Handy untereinander.
- **Am Handy:**
  - Die Karte läuft randlos über die volle Breite und zoomt näher heran.
  - Frankreich und Schweiz sind ausgeblendet.
  - Das Schild zeigt zusätzlich die Adresse, der Adressblock daneben ist dann nur für Screenreader da.
  - Die Kartenschrift bleibt 10 px (Wunsch des Nutzers).
- **Nicht gewünscht:** keine Kontaktkarte mit Themen-Chips, kein „Schreib uns“. Das hat der Nutzer am 27.10. abgelehnt.

## 5. Rahmen aus dem Theme

Das Theme hat feste Regeln (`docs/architecture.md`, `docs/motion-api.md`, `docs/file-structure.md` im Theme-Repo). Für diese Seite
heißt das:
- **Sections mit Blöcken.** Alles ist im Theme-Editor pflegbar. Etappen und Personen sind Blöcke, die man hinzufügen, sortieren und
  entfernen kann.
- **Farben nur aus `assets/tokens.css`.** Die Hex-Werte des Entwurfs werden Tokens, darunter #f3692b für das Bar & Shield, das Orange
  auf Hell (`--orange-on-light`) und die Bildfarbe (`--grade`). Kontraste nachrechnen.
- **Bewegung nur unter `html.has-motion`.** Der Theme-Editor ist immer statisch.
- **GSAP und ScrollTrigger** laden heute nur auf der Startseite mit dem Setting „Animationen aktivieren“, nie im Theme-Editor. Diese
  Seite braucht beides, also Pinnen, Scrub, Einrasten und die Zeitleiste. Das Laden wird auf die Vorlage `ueber-uns` erweitert, mit
  denselben Bedingungen. **Claudes Entscheidung**: Ohne GSAP müsste das Pinnen samt Einrasten neu gebaut werden, und genau dieses
  Verhalten hat der Nutzer abgenommen. `docs/architecture.md` sagt heute „Die Seitenvorlagen laden kein GSAP“ (gemeint war die
  Werkstatt) und `docs/motion-api.md` nennt nur die Startseite. Beide werden mit dem Einbau angepasst.
- **Skripte über `PS.on` und `PS.motion.add`**, damit Section-Neuladen und Abbau im Editor aufräumen.
- **Bilder:** Ein Bildfeld je Bild (CDN mit `image_url` und srcset). Ist das Feld leer, gilt eine vorab skalierte Standarddatei aus
  `assets/`, wie bei der Werkstatt.
- **Händlerdaten** (Adresse, Telefon, WhatsApp, E-Mail) kommen aus den Theme-Einstellungen, nie fest im Code.
- **Arbeiten und Freigabe:**
  - Gebaut wird auf einem eigenen Branch, nicht im Haupt-Checkout. Dort läuft teils `shopify theme dev` des Nutzers, also nur lesen.
  - Geprüft wird in einem eigenen unveröffentlichten Vorschau-Theme auf 127.0.0.1:9293. Das Entwicklungs-Theme auf 9292 gehört der
    Vorschau des Nutzers.
  - Live geht es nur per Push auf `main` und nur nach ausdrücklichem Okay des Nutzers.
  - Bei jeder Rückmeldung sagen, ob etwas schon live ist.

## 6. Anpassungen an das Theme (hier darf der Einbau vom Entwurf abweichen)

1. **Kopfleiste:** Im Theme fährt die Kopfleiste ab 400 px beim Runterscrollen weg (`is-away`). Die Bühne im Entwurf sitzt unter einer
   stehenden Kopfleiste. **Claudes Entscheidung:** Solange die Bühne gepinnt ist und bis das Team oben angekommen ist, bleibt die
   Kopfleiste stehen. Kommt man mit weggefahrener Kopfleiste an der Bühne an, fährt sie ein. Das Ende des Team-Übergangs ist an der
   stehenden Kopfleiste gemessen, und so laufen nie zwei Bewegungen zugleich. Das ist am Handy zu prüfen.
2. **Kopfleiste, Ankündigungsleiste, Footer** kommen aus dem Layout des Themes, nicht aus dem Entwurf.
3. **Team-Markup aus Liquid** statt aus `team.js` (siehe 4.4).
4. **Anzahl der Etappen:** Der Entwurf hat genau vier. Im Editor können es mehr oder weniger werden.
   - Der Balken teilt sich auf die Anzahl auf, Einrasten und Scrollweg rechnen damit.
   - Bei nur einer Etappe gibt es keine Bühne, sie steht als Block da.
   - Wo die Grenze nach oben liegt, entscheidet der Builder. Die Jahre müssen am Handy in eine Zeile passen.
5. **Niedrige Bildschirme:** Ist das Fenster weniger als 600 px hoch (Handy quer), wird die Bühne nicht gepinnt. Die Etappen stehen
   untereinander wie ohne Bewegung. Sonst wäre die Bühne (mindestens 520 px plus Kopfleiste) höher als der Bildschirm, und Balken und
   Textende lägen außerhalb (Kopfleiste bis 77 px plus 520 px ergibt 597 px). Das Theme macht es bei der Service-Leiste ähnlich (klebt nicht unter 540 px Höhe). **Claudes Entscheidung.**
6. **Einrasten:** entfällt seit dem 30.10. (siehe 4.3). Vorher: Einrasten ohne Schwung, kein Einrasten während eines Sprungs.
7. **Bar & Shield:** Der Reiter auf dem Balken ist im Entwurf eine nachgezogene Vektorfassung von `assets/hd-bar-shield.png`. Laut
   Briefing soll das Logo unverändert aus dem Händlerportal kommen. Die Form bleibt deshalb unverändert. Kommt die offizielle SVG,
   ersetzt sie die nachgezogene Fassung.

## 7. Inhalte

Alle Fakten stammen aus der alten Website oder vom Händler. Nichts davon wird ergänzt oder umformuliert, ohne dass der Nutzer es sagt.

**Etappen** (Jahr, Überschrift, Text, Ort, Foto):

| Jahr | Überschrift | Ort | Foto | Hinweis |
|---|---|---|---|---|
| 1985 | Gründung auf der Schusterinsel | Weil-Friedlingen | Gerhard Link (Teamfoto, schwarz-weiß) | |
| 1991 | Ein eigenes Haus | Weil-Haltingen | altes Farbfoto `power-shop-frueher.jpg` | nur 678 × 510 px. Wo das Haus steht, ist nicht bestätigt, der Nutzer will es trotzdem hier. Nicht mehr nachfragen. |
| 2016 | Die zweite Generation übernimmt | Umbau und neuer Showroom | Falk, Franziska und Richard Link auf dem Vorplatz (`vorplatz-team.jpg`, schwarz-weiß wie 1985) | Foto vom Nutzer am 30.10. |
| Heute | Showroom trifft Werkstatt | Burghölzle 15, Weil am Rhein | Showroom-Theke | „HEUTE.“ in Versalien wie im Balken, der Punkt im Akzent-Orange `--c-orange` (#f26722, nicht das dunklere Orange für Text auf Hell). Wunsch des Nutzers vom 30.10. Bis 30.10. stand hier die Crew, die jetzt im Kopf ist. |

Die Texte stehen wörtlich in `h-vollbild.html`.

**Team** in dieser Reihenfolge (vom Händler festgelegt): Richard, Falk, Franziska, Gerhard, Ingrid, Jean-Nicolas, Aaron, Jürgen.
- Namen und Rollen stehen in `shared/team.js`, Quelle ist die alte Website, vom Händler am 17.10.2026 bestätigt.
- Quadratische Fotos 720 px in `bilder/team/`. Breite 3:2-Ausschnitte (1600 × 1067) in `bilder/team/breit/` für Gerhard, Falk,
  Franziska und Richard.
- **Die Texte sind bis auf Gerhard und Ingrid Platzhalter**, nur aus Rolle und Zeitleiste abgeleitet. Der Nutzer will sie selbst noch
  verfeinern. Sie gehen so in die Vorlage, dass er sie im Editor ändern kann.

**Fotos, die neu ins Theme kommen:** Crew-Foto für den Kopf, die vier Etappenfotos, acht Teamfotos, vier breite Teamausschnitte. Die Karte
(`karte-dreilaendereck-*.webp`) und `hd-bar-shield.png` liegen schon in `assets/`. Neue Dateien kommen mit Herkunft in
`docs/bildliste.md`.

## 8. Barrierefreiheit

Übernommen aus dem Entwurf, im Einbau zu halten:
- **Etappen:** Eine geordnete Liste. Die große Jahreszahl ist `aria-hidden`, die Überschrift trägt das Jahr unsichtbar vorne („1985:
  …“). Über der Bühne steht die unsichtbare Überschrift „Unsere Geschichte“.
- **Fortschrittsbalken:** `nav` mit der Bezeichnung „Etappen“. Die Links haben mindestens 44 px Zielgröße.
- **Team:**
  - Das Vorschau-Raster ist eine Gruppe von Knöpfen mit Namen, die gewählte Person trägt `aria-current`.
  - Die Pfeile heißen „Vorherige Person“ und „Nächste Person“.
  - Eine Live-Region sagt den Wechsel an.
  - Das Foto ist dekorativ, der Name steht im Text.
- **Fokus:** wie im ganzen Theme. `base.css` blendet den Fokusrahmen auf Wunsch des Händlers aus (offen in `docs/freigaben.md`),
  diese Seite weicht nicht davon ab. Die Reihenfolge beim Tabben bleibt sinnvoll.
- **Reduzierte Bewegung:** Es gibt keine Bühne, alles steht untereinander. Der Pin landet nicht, er steht schon.

## 9. Was der Builder entscheidet

- Aufteilung in Sections und Blöcke. Vorschlag: Seitenkopf, Geschichte (Blöcke „Etappe“), Team (Blöcke „Person“) und „Komm vorbei“.
  „Komm vorbei“ kommt als zweite Darstellung von `sections/visit.liquid` oder als eigene Section.
- Dateinamen, CSS- und JS-Aufteilung im Rahmen von `docs/motion-api.md`. Ob die Seite eigene Dateien bekommt oder in
  `pages.css`/`pages.js` lebt.
- Bildgrößen der Standarddateien und Ausschnitte (`object-position`), solange es aussieht wie im Entwurf.
- Wie die Kopfleiste während der Bühne festgehalten wird (siehe 6.1).
- Tests und Prüfwege. Mindestens nötig: Desktop 1440 × 900 und Handy 375 × 812 in der Vorschau, Handy quer (unter 600 px Höhe),
  iOS Safari im Simulator, Theme Check grün, reduzierte Bewegung, Theme-Editor statisch, Bedienung nur mit der Tastatur.

## 10. Offen beim Nutzer, blockiert den Einbau nicht

- Die endgültigen Teamtexte. Bis dahin gelten die Platzhalter.
- Die offizielle SVG des Bar & Shield aus dem Händlerportal (steht schon im Briefing, `docs/briefing.md` im Theme-Repo).
