# Bildliste (Shotlist)

Alle Bilder und Videos liegen flach in `assets/` (Shopify kennt dort keine Unterordner). Echte Fotos unter **demselben Dateinamen** und im
**gleichen Seitenverhältnis** dort ablegen, das Theme nutzt sie sofort.

Dateien, die noch Platzhalter sind, stehen in den Theme-Einstellungen unter **Platzhalterbilder** und bleiben im Shop unsichtbar. Nach dem
Austausch den Dateinamen aus der Liste streichen (siehe `README.md`).

- **Status:** `echt` = Foto liegt in `assets/` und steht nicht in der Platzhalterliste, die Spalte Motiv beschreibt dann das tatsächliche Bild.
  `Platzhalter` = steht in der Platzhalterliste (`config/settings_schema.json`, `placeholder_assets`), die Spalte Motiv ist dann das Soll-Motiv für das
  Ersatzfoto
- **Lifestyle/Marke:** dunkle Tonalität, warmes Licht, echte Fahrer (siehe Briefing, Bildsprache)
- **Freisteller:** Produkt auf einheitlichem Hellgrau `#EDEBE7`, gleicher Ausschnitt (die beiden vorhandenen Freisteller `bento-accessoires.jpg` und
  `mega-herren.jpg` liegen auf Weiß)
- Produktfotos, Fahrzeugfotos der Bike-Karten und die Bilder der Modellfamilien-Kacheln im Megamenü kommen aus Shopify (Produkt- und Kollektionsbilder), nicht aus `assets/`

## Bilder im Theme

| Datei | Format (px) | Typ | Status | Motiv | Einsatz |
|---|---|---|---|---|---|
| `hero-ride-road.jpg` | 1024 × 576 | Lifestyle/Marke | echt | Zwei Fahrer auf einer Road Glide, unterwegs auf einer Landstraße mit gelber Doppellinie (Startbild des Hero-Clips, siehe `docs/hero-clip.md`) | Homepage · Hero, Modell Road Glide |
| `hero-ride-street.jpg` | 1024 × 576 | Lifestyle/Marke | echt | Zwei Fahrer auf einer Street Glide, unterwegs auf einer Landstraße mit gelber Doppellinie | Homepage · Hero, Modell Street Glide |
| `hero-ride-cvo.jpg` | 1500 × 1000 | Lifestyle/Marke | echt | Fahrer auf einer CVO Road Glide, unterwegs auf einer Landstraße | Homepage · Hero, Modell CVO |
| `bento-motorraeder.jpg` | 1400 × 1000 | Lifestyle/Marke | echt | Fahrer auf einer CVO Road Glide in voller Fahrt auf einer Landstraße, Hügel im Hintergrund | Homepage · Kategorie-Kachel Motorräder · Megamenü Motorräder · Kachel Fahrzeuge |
| `bento-herren.jpg` | 736 × 738 | Lifestyle/Marke | echt | Bärtiger Fahrer im Profil in schwarz-oranger H-D-Jacke, Oberkörper, Bäume unscharf im Hintergrund | Megamenü · Teaser Herren |
| `bento-herren-ruecken.jpg` | 864 × 720 | Lifestyle/Marke | echt | Mann in brauner Jacke mit Harley-Davidson-Schriftzug von hinten im Laden (Standbild aus `clothing-herren.mp4` bei 17,5 s, keine Gesichter) | Homepage · Kategorie-Kachel Herren |
| `bento-damen.jpg` | 960 × 867 | Lifestyle/Marke | echt | Frau in ärmelloser Bluse hält eine Lederjacke, Bike im Hintergrund | Megamenü · Teaser Damen |
| `bento-damen-ruecken.jpg` | 864 × 720 | Lifestyle/Marke | echt | Frau in schwarzer Lederjacke mit Bar-&-Shield-Prägung von hinten im Laden (Standbild aus `clothing-damen.mp4` bei 3,7 s, keine Gesichter) | Homepage · Kategorie-Kachel Damen |
| `bento-accessoires.jpg` | 960 × 867 | Freisteller | echt | Handyhülle mit Bar & Shield, Freisteller auf Weiß | Megamenü · Teaser Accessoires |
| `bento-accessoires-eiskuebel.jpg` | 1400 × 677 | Lifestyle/Marke | echt | Eiskübel in Schwarz-Orange mit Harley-Davidson-Schriftzug, Zange und Eiswürfeln auf runder Holztrommel, Querformat (vom Nutzer geliefert, 21.10.2026) | Homepage · Kategorie-Kachel Accessoires |
| `bento-teile.jpg` | 1400 × 787 | Lifestyle/Marke | echt | Zubehör-Flatlay auf dunklem Grund: Helm, Kissen mit Bar & Shield, Spanngurte | Homepage · Kategorie-Kachel Teile & Zubehör |
| `banner-motorraeder.jpg` | 1200 × 600 | Lifestyle/Marke | Platzhalter | Touring-Bike im Profil, dunkler Hintergrund | Kategorieseite · Banner Motorräder |
| `banner-herren.jpg` | 1200 × 600 | Lifestyle/Marke | Platzhalter | Herren-Lederjacken nebeneinander, Detail | Kategorieseite · Banner Herren |
| `banner-damen.jpg` | 1200 × 600 | Lifestyle/Marke | Platzhalter | Damen-Kollektion, Jacken und Shirts auf Kleiderstange | Kategorieseite · Banner Damen |
| `banner-teile.jpg` | 1200 × 600 | Lifestyle/Marke | Platzhalter | Teile auf Werkbank: Auspuff, Luftfilter, Griffe | Kategorieseite · Banner Teile & Zubehör |
| `banner-accessoires.jpg` | 1200 × 600 | Lifestyle/Marke | Platzhalter | Accessoires-Flatlay: Cap, Geldbörse, Sonnenbrille, Schlüsselanhänger | Kategorieseite · Banner Accessoires |
| `banner-neuheiten.jpg` | 1200 × 600 | Lifestyle/Marke | Platzhalter | Neue Kollektion, Mix aus Bekleidung und Teilen | Kategorieseite · Banner Neuheiten, Suche |
| `banner-sale.jpg` | 1200 × 600 | Lifestyle/Marke | Platzhalter | Sale-Motiv, Bekleidung mit Preisschild | Kategorieseite · Banner Sale |
| `mega-herren.jpg` | 600 × 750 | Freisteller | echt | Kurzarm-Karohemd in Rot und Orange, Freisteller auf Weiß | Megamenü Herren · Teaser |
| `mega-damen.jpg` | 600 × 750 | Lifestyle/Marke | Platzhalter | Neue Damen-Kollektion, Model in Jacke | Megamenü Damen · Teaser |
| `mega-teile.jpg` | 600 × 750 | Lifestyle/Marke | Platzhalter | Custom-Umbau vorher/nachher | Megamenü Teile · Teaser Custom-Umbauten |
| `mega-accessoires.jpg` | 600 × 750 | Lifestyle/Marke | Platzhalter | Geschenkideen: Gutschein, Tasse, Cap | Megamenü Accessoires · Teaser |
| `mega-motorraeder-familien.webp` | 1600 × 600 | Presse | echt | Drei Touring-Modelle 2025 vor Schwarz (Road Glide, Street Glide, Road King Special): Kopfbild der Seite „Harley-Davidson Modelle 2025“ auf 1903shop.de (`2025HD01_Touring_Modelle.jpg`, 1795 × 1154, vom Nutzer gewählt), Ausschnitt y 170–1000, auf 560 px Höhe verkleinert, Ränder weich nach Schwarz ausgeblendet und mit Schwarz auf 1600 × 600 erweitert. Bildrechte vermutlich Harley-Davidson-Pressebild, vor Live-Gang klären | Megamenü Motorräder · Kachel Modellfamilien |
| `mega-herren-bekleidung.webp` | 1080 × 660 | Lifestyle/Marke | echt | Mann von hinten mit Cap im schwarzen Hoodie mit grünem Zylinder-Motiv und Bar & Shield auf dem Rücken, ohne Gesicht (Standbild aus dem Herren-Film, vom Nutzer als Bild geliefert; unterer Ausschnitt 1106 × 676, auf 1080 × 660 verkleinert) | Megamenü Herren · Kachel Bekleidung |
| `mega-herren-motorrad.webp` | 1080 × 660 | Lifestyle/Marke | echt | Mann mit aufgesetztem schwarzem Integralhelm und Motorradjacke mit Bar-&-Shield-Tasche, Gesicht hinter dem Visier (Herren-Film: `collection-2.mov` Bild 592, ab y = 470; vom Nutzer ausgewählt) | Megamenü Herren · Kachel Motorradbekleidung |
| `mega-herren-kollektionen.webp` | 1080 × 660 | Lifestyle/Marke | echt | Mann von hinten im Hoodie „Harley-Davidson Factory Racing“ (Herren-Film: `clothing-intro.mov` Bild 0, ab y = 630) | Megamenü Herren · Kachel Kollektionen |
| `mega-damen-bekleidung.webp` | 1080 × 660 | Lifestyle/Marke | echt | Frau von hinten im schwarzen T-Shirt mit „Ride“-Druck auf dem Rücken, ohne Gesicht (Damen-Film: `collection-2.mov` Bild 40, ab y = 820) | Megamenü Damen · Kachel Bekleidung |
| `mega-damen-motorrad.webp` | 1080 × 660 | Lifestyle/Marke | echt | Frau von hinten in schwarzer Lederjacke mit geprägtem Bar & Shield und Kapuze, ohne Gesicht (Damen-Film: `clothing-intro.mov` Bild 304, ab y = 640; vom Nutzer ausgewählt) | Megamenü Damen · Kachel Motorradbekleidung |
| `mega-damen-kollektionen.webp` | 1080 × 660 | Lifestyle/Marke | echt | Frau im schwarzen Harley-Davidson-Zip-Hoodie, Ausschnitt vom Hals abwärts, ohne Gesicht (Damen-Film: `clothing-intro.mov` Bild 200, ab y = 940) | Megamenü Damen · Kachel Kollektionen |
| `mega-teile-komfort.webp` | 1080 × 660 | Lifestyle/Marke | echt | Hellgraue Touring im Laden: Soziussitz mit Rückenlehne, Lautsprecher und Topcase mit Gepäckträger, Kleiderständer unscharf dahinter (Foto des Nutzers `komfort-touring.jpg`, 6336 × 9504, auf 1080 px Breite verkleinert, Ausschnitt ab y = 220) | Megamenü Teile & Zubehör · Kachel Komfort & Touring |
| `mega-teile-optik.webp` | 1080 × 660 | Lifestyle/Marke | echt | Heck eines Custom-Bikes: mattschwarzer Endtopf mit Plakette „Dr. Jekill & Mr. Hyde“, blaues Heckteil, Hinterrad, Pflaster unscharf dahinter (Foto des Nutzers `optik-pflege.jpg`, 6336 × 9504, auf 1080 px Breite verkleinert, Ausschnitt ab y = 290) | Megamenü Teile & Zubehör · Kachel Optik & Custom |
| `mega-teile-technik.webp` | 1080 × 660 | Lifestyle/Marke | echt | Bremssattel am Vorderrad mit Bar-&-Shield-Plakette und gelochter Blende, Holzboden unscharf dahinter (Foto des Nutzers `technik-pflege.jpg`, 6336 × 9504, auf 1080 px Breite verkleinert, Ausschnitt ab y = 480) | Megamenü Teile & Zubehör · Kachel Technik & Pflege |
| `mega-service-werkstatt.webp` | 1080 × 660 | Lifestyle/Marke | echt | Orange Lochwand mit Gabelschlüssel und blauen Steckdosen, davor unscharf die Verkleidung eines Touring-Bikes (Foto des Nutzers `werkstatt-mega.jpg`, 5393 × 8090, Ausschnitt 5393 × 3296 ab y = 2100, auf 1080 × 660 verkleinert) | Megamenü Service · Kachel Werkstatt |
| `mega-service-dienstleistungen.webp` | 1080 × 660 | Lifestyle/Marke | echt | Ausschnitt aus `finanzierung-breakout.jpg` (1200 × 733 ab y = 40): Fahrer geht im Abendlicht von seiner Breakout weg, von hinten | Megamenü Service · Kachel Dienstleistungen |
| `mega-service-ueber-uns.webp` | 1080 × 660 | Lifestyle/Marke | echt | Ausschnitt aus `entwuerfe/ueber-uns/bilder/foto/showroom-theke.jpg` (alte Website, 1600 × 978 ab y = 150): Showroom mit Holztheke und Harley-Davidson-Schriftzug, ohne Personen | Megamenü Service · Kachel Über uns |
| `mega-accessoires-mode.webp` | 1080 × 660 | Lifestyle/Marke | echt | Hosenträger mit orangen Streifen auf einer alten Werkbank, daneben Lederhandschuhe und Jeanshemd, Lederjacke und schwarzes Motorrad unscharf dahinter (Bild des Nutzers `mode-accessories.jpeg`, 1432 × 890, auf 1080 px Breite verkleinert, Ausschnitt mittig) | Megamenü Accessoires · Kachel Mode-Accessoires |
| `tuer-dienstleistungen-{720,1280,1920}.webp` | 1920 × 1280 (und kleiner) | Lifestyle/Marke | echt | Fahrer geht im Abendlicht von seiner Breakout weg, von hinten, ohne Gesicht (alte Website: `alte-website/finanzierung-versicherung/bilder/01-finanzierung-breakout.jpg`, nur verkleinert) | Service · Tür Dienstleistungen · Startseite · Story |
| `tuer-ueber-uns-{720,1280,1600}.webp` | 1600 × 1066 (und kleiner) | Lifestyle/Marke | echt | Showroom mit Holztheke und Harley-Davidson-Schriftzug, ohne Personen (`entwuerfe/ueber-uns/bilder/foto/showroom-theke.jpg`, Ausschnitt 1600 × 1067 ab y = 100) | Service · Tür Über uns · Startseite · Story |
| `powershop-team.webp` | 980 × 807 | Lifestyle/Marke | echt | Das Team vom Power Shop, Porträtraster mit Namen und Funktion (WebP, Qualität 90, ca. 140 KB; Quelle: `pics_to_use/powershop-team.png`) | Seit 27.10.2026 nicht mehr eingesetzt (Startseite ohne Teamfoto), Kandidat für Über uns |
| `event-1.jpg` | 800 × 500 | Lifestyle/Marke | Platzhalter | Gruppenausfahrt auf Landstraße | Homepage · Event-Kachel 1 |
| `event-2.jpg` | 800 × 500 | Lifestyle/Marke | Platzhalter | Bike Night im Hof, Lichterketten, Community | Homepage · Event-Kachel 2 |
| `event-3.jpg` | 800 × 500 | Lifestyle/Marke | Platzhalter | Winter-Check in der Werkstatt, Kunden mit Kaffee | Homepage · Event-Kachel 3 |
| `team-verkauf.jpg` | 400 × 400 | Lifestyle/Marke | Platzhalter | Porträt Verkaufsberater, freundlich, im Showroom | Kontakt-Box · Ansprechpartner |
| `service-probefahrt.jpg` | 1200 × 800 | Lifestyle/Marke | echt | Lenker und Scheinwerfer eines Bikes in der Frontansicht, ohne Person | Service · Probefahrt (Foto der Kontakt-Karte, 4 : 5) |
| `service-finanzierung.jpg` | 1200 × 800 | Lifestyle/Marke | Platzhalter | Beratungsgespräch am Tisch, Bike im Hintergrund | Service · Finanzierung |
| `service-werkstatt.jpg` | 1200 × 800 | Lifestyle/Marke | echt | Werkstatt mit Bike auf der Hebebühne, schwarze Werkbänke mit oranger Rückwand, ohne Person | Service · Werkstatt |
| `service-inzahlungnahme.jpg` | 1200 × 800 | Lifestyle/Marke | Platzhalter | Handschlag vor Gebrauchtbike | Service · Inzahlungnahme |
| `service-standort.jpg` | 1200 × 800 | Lifestyle/Marke | Platzhalter | Außenansicht Power Shop mit Logo, Abendstimmung | Service · Standort |
| `messanleitung.jpg` | 800 × 600 | Freisteller | Platzhalter | Illustration: Messpunkte Brust, Taille, Hüfte, Innenbeinlänge | Größentabellen-Popup |
| `hd-bar-shield.png` | 190 × 154 | Logo | echt | Offizielles H-D Bar & Shield, transparenter Hintergrund (Ersatz laut Briefing aus dem Händlerportal) | Header, Mobile-Menü, Footer |
| `power-shop-signet.svg` | Vektor | Logo | echt | Power-Shop-Signet | Favicon, Passwortseite, Geschenkgutschein |

`story-werkstatt.jpg` (1200 × 900, Mechaniker bei der Arbeit in der Werkstatt) liegt noch in `assets/` und steht in der Platzhalterliste,
ist aber derzeit in keiner Section und keinem Template eingebunden.

## Bildnachweis und Nutzungsrechte

**Offen, vor dem Livegang klären.** Für keines der Fotos in `assets/` ist die Quelle oder Lizenz dokumentiert.

- `hero-ride-cvo.jpg` trägt in den EXIF-Daten den Vermerk „2023 Harley-Davidson Motor Company. Usage: Unlimited Worldwide“. Ob die Nutzung im
  Onlineshop des Händlers damit gedeckt ist (Händlerportal, Lizenzbedingungen), muss der Händler bei Harley-Davidson bestätigen.
- Der Commit „Hero und Sortiment an den Katalog 2026 anpassen“ (`bfbd9cc`) nennt harley-davidson.com/ch als Quelle für Katalogdaten und
  Touring-Fotos. Herkunft und Rechte von `hero-ride-road.jpg`, `hero-ride-street.jpg`, `bento-herren.jpg` und `mega-herren.jpg` (ohne
  Metadaten) sind nicht belegt.
- Die EXIF-Daten bleiben unverändert: ein Entfernen des Urhebervermerks wäre eine Entscheidung des Händlers, keine technische Aufräumarbeit.
- Je Bild nach der Klärung hier Quelle, Lizenz und gegebenenfalls den geforderten Bildnachweis eintragen.
- Die Hero-Fotos hießen früher `hero-ride-*.png`, waren aber JPEG mit falscher Endung. Sie sind jetzt bytegleich als `.jpg` abgelegt (kein Neu-Kodieren, die EXIF-Daten bleiben).

Die gesamte Liste der offenen Händlerfreigaben steht in [`freigaben.md`](freigaben.md).

## Videos und Poster

| Datei | Format | Einsatz |
|---|---|---|
| `hero-loop.mp4` · `hero-loop-720.mp4` · `hero-loop.webm` · `hero-poster.webp` · `hero-poster-960.webp` | 1280 × 720 bzw. 960 × 540, 1920 × 1080 und 960 × 540 (Poster, beide gemeinsam ersetzen), ohne Ton | Hero-Loop der Startseite, Herkunft und Austausch: `docs/hero-clip.md` |
| `bikes-intro.mp4` · `bikes-intro-poster.jpg` | 960 × 720, ca. 17 s | Kategorieseite Motorräder · Film-Intro |
| `clothing-herren.mp4` · `clothing-herren-poster.jpg` | 960 × 720, ca. 18 s | Kategorieseite Herren · Film-Intro |
| `clothing-damen.mp4` · `clothing-damen-poster.jpg` | 960 × 720, ca. 6 s | Kategorieseite Damen · Film-Intro |
| `werkstatt-intro.mp4` · `werkstatt-intro-poster.jpg` | 960 × 720, 24 fps, ca. 15 s, ohne Ton | Werkstatt · Seitenkopf. Quelle `~/Downloads/werkstatt-intro.mp4` (1920 × 1080, 6 s, Kamerafahrt). Mitte 4 : 3 (`crop=1440:1080:240:0`), `minterpolate` auf 192 fps, Zeitkurve mit sanftem Anlauf (erste 0,5 s) und Auslauf (letzte 1 s bis Bild 143), dann vorwärts und rückwärts aneinander (Ping-Pong, Doppelbilder an den Wenden entfernt): keine harte Schleife. x264 slow, CRF 26. Poster = Bild 0. |

## Custom-Umbauten (Werkstatt-Seite)

Fotos des Händlers aus `pics_to_use/custom-*` (iPhone, 26./27.10.2026). Je Foto WebP in mehreren Breiten, ohne Metadaten (GPS und Gerät
entfernt): Querformat 720 / 1280 / 1920 px, Hochformat 720 / 1080 / 1440 px, nie größer als das Original. Name: `umbau-<umbau>-<nr>-<breite>.webp`.
Eingesetzt in `templates/page.werkstatt.json` (Blöcke „Umbau-Bild“; `umbau-falk-2` nicht mehr im Umbau, aber auf der Werkstatt-Kachel der Startseite und der Werkstatt-Tür der Service-Seite). Im Theme-Editor lässt sich jedes Foto durch ein hochgeladenes Bild ersetzen,
dann liefert das Shopify-CDN die Größen selbst.

| Umbau | Fotos (Nr.) | Größte Datei | Hinweis |
|---|---|---|---|
| Falk | 1–7 | 1920 bzw. 1440 px | Nr. 3 und 4 waren ungedreht gespeichert, gedreht. Nr. 3: Kennzeichen teilweise lesbar. Nr. 2: Person im Bild, deshalb nicht mehr im Umbau-Eintrag (nur noch Startseite, Service-Tür). Nr. 5–7: Kamera-Fotos aus ~/Downloads/custom-falk (5584 × 8368 bzw. 8368 × 5584), WebP Qualität 80 |
| Low Rider ST | 1–4 | 1440 / 1600 / 1080 / 1080 px | Nr. 3 und 4 sind Instagram-Exporte mit 1080 px; Originale vom Handy wären schärfer |
| Police | 1–4 | 1440 bzw. 1920 px | Nr. 1 und 4 waren ungedreht gespeichert, gedreht |
| Breakout | 1–4 | 1920 bzw. 1440 px | |
| Franzi | 1–6 | 1920 bzw. 1440 px | Kamera-Fotos aus `~/Downloads/custom-franzi` (7008 × 4672, Nr. 3: 5584 × 8368), WebP Qualität 80. Basis-Modell und Umbau-Tabelle aus den Fotos abgeleitet, Bestätigung durch den Händler offen |
