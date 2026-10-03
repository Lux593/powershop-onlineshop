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
| `bento-motorraeder.jpg` | 1400 × 1000 | Lifestyle/Marke | echt | Fahrer auf einer CVO Road Glide in voller Fahrt auf einer Landstraße, Hügel im Hintergrund | Homepage · Kategorie-Kachel Motorräder |
| `bento-herren.jpg` | 736 × 738 | Lifestyle/Marke | echt | Bärtiger Fahrer im Profil in schwarz-oranger H-D-Jacke, Oberkörper, Bäume unscharf im Hintergrund | Homepage · Kategorie-Kachel Herren |
| `bento-damen.jpg` | 960 × 867 | Lifestyle/Marke | echt | Frau in ärmelloser Bluse hält eine Lederjacke, Bike im Hintergrund | Homepage · Kategorie-Kachel Damen |
| `bento-accessoires.jpg` | 960 × 867 | Freisteller | echt | Handyhülle mit Bar & Shield, Freisteller auf Weiß | Homepage · Kategorie-Kachel Accessoires |
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
| `powershop-team.webp` | 980 × 807 | Lifestyle/Marke | echt | Das Team vom Power Shop, Porträtraster mit Namen und Funktion (WebP, Qualität 90, ca. 140 KB; Quelle: `pics_to_use/powershop-team.png`) | Homepage · Storytelling „Über uns“ |
| `event-1.jpg` | 800 × 500 | Lifestyle/Marke | Platzhalter | Gruppenausfahrt auf Landstraße | Homepage/Service · Event-Kachel 1 |
| `event-2.jpg` | 800 × 500 | Lifestyle/Marke | Platzhalter | Bike Night im Hof, Lichterketten, Community | Homepage/Service · Event-Kachel 2 |
| `event-3.jpg` | 800 × 500 | Lifestyle/Marke | Platzhalter | Winter-Check in der Werkstatt, Kunden mit Kaffee | Homepage/Service · Event-Kachel 3 |
| `team-verkauf.jpg` | 400 × 400 | Lifestyle/Marke | Platzhalter | Porträt Verkaufsberater, freundlich, im Showroom | Kontakt-Box · Ansprechpartner |
| `service-probefahrt.jpg` | 1200 × 800 | Lifestyle/Marke | echt | Lenker und Scheinwerfer eines Bikes in der Frontansicht, ohne Person | Service · Probefahrt |
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
