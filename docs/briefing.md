# Power Shop – UI-Briefing & Komponenten

Finales Briefing (Phase 6) für den Harley-Davidson-Onlineshop **Power Shop**. Er ist für eine deutsche Firma und offiziellen H-D-Vertragshändler auf Shopify gedacht.
Das frühere klickbare HTML-Mockup ist nicht mehr im Repo. Maßgeblich ist das Theme: Bausteine liegen in `sections/` und `snippets/`, Stile in `assets/`
(Überblick in `README.md`). Der Hero und die Bewegung sind seit diesem Briefing erweitert worden: `docs/auftrag-motion.md`, `docs/motion-api.md`, `docs/hero-clip.md`.

> Rechtliche Punkte sind Umsetzungshinweise, **keine Rechtsberatung**. Rechtstexte, Preisangaben und Cookie-Consent bitte vor dem Livegang prüfen lassen.

---

## 1. Entscheidungen im Überblick

| Thema | Entscheidung |
|---|---|
| Marken-DNA | **Hybrid**: Dark-Luxury (reduziert, viel Schwarz, Showroom) + raue Akzente (Asphalt/Metall, Werkstatt) |
| Zielgruppe | Kenner & Einsteiger gleich wichtig |
| Aufbau | Wie die Referenz-Templates „Oréal“ (Homepage) und „Guza“ (Kategorieseite) – übersichtlich, modern, userfreundlich |
| Grundthema | Hell/Dunkel-Wechsel: dunkle Bühnen (Header, Hero, Bento, Story, Footer), helle Produktbereiche |
| Orange | Nur gezielter Akzent (ca. 5–10 % der Fläche) |
| Typografie | Barlow Condensed (Headlines, Versalien) + Inter (Text) – self-hosted |
| Navigation | Motorräder · Herren · Damen · Teile & Zubehör · Accessoires · Service · Sale, Megamenüs mit Bildern |
| Garage „Meine Harley“ | Vorerst nicht – Modellfamilie/Baujahr nur als Filter (später nachrüstbar) |
| Bike-Verkauf | Kein Online-Kauf. Kontakt nur über **Anrufen · WhatsApp · E-Mail** (vorausgefüllte Nachricht) |
| Reservierung | Nur Gebraucht/Vorführer, **Anfrage mit manueller Bestätigung**, Gebühr wird angerechnet bzw. erstattet |
| Größen | Größentabelle als Popup (Modal / Bottom-Sheet) |
| Bilder | Platzhalter mit festen Dateinamen → 1:1 austauschbar (Bildliste: `docs/bildliste.md`) |

---

## 2. Design-Tokens

Quelle: `assets/tokens.css` (CSS-Variablen).

### Farben

| Token | Wert | Einsatz |
|---|---|---|
| `black` | #0A0A0A | dunkle Sektionen, Megamenü (einfarbig, ohne Körnung), Sekundär-Button, Text auf hell |
| `anthracite` | #1A1A1A | Karten/Flächen auf dunkel |
| `steel` | #2B2B2B | Linien auf dunkel |
| `white` | #FFFFFF | Text auf dunkel, Karten auf hell |
| `offwhite` | #F5F3EF | heller Seitengrund |
| `stone` | #EDEBE7 | Produktbild-Grund (Freisteller) |
| `line` | #DDD9D2 | Linien auf hell |
| `orange` | #F26722 | Akzent: CTAs, Badges, Zähler, Announcement-Bar, aktive Zustände |
| `orange-dark` | #D9571A | Hover/Pressed |
| `muted` | #5F5F5F | Nebentext auf hell |
| `muted-dark` | #A8A8A8 | Nebentext auf dunkel |
| `error` / `success` | #C62828 / #2E7D32 | Formular-Feedback, Verfügbarkeit |
| `text-soft` | #333333 | Fließtext in Akkordeons und Fakten |
| `on-dark` / `on-dark-strong` | #D6D2CB / #E9E6E1 | Fließtext bzw. Menülinks auf dunkel |
| `border-input` | #8A857D | Rahmen von Formularfeldern auf hell |
| `border-input-dark` | #777777 | Rahmen von Formularfeldern auf dunkel |
| `border-soft` / `border-dark` | #BDB8B0 / #555555 | Rahmen ohne Bedienfunktion (Hinweisfläche, Chips auf dunkel) |

Weitere Tokens (Zulassungs-Badges `badge-ok/warn/bad-*`, `stock-order`, `mark`, `error-on-dark`, `black-soft`, `pure-black`, `stone-deep`) stehen mit
Kommentar in `tokens.css`. Hex-Werte gehören nur dorthin.

**Tipp:** Das Orange mit dem Orange der offiziellen Logo-Datei abgleichen, damit UI und Bar & Shield exakt übereinstimmen.

### Kontraste (WCAG 2.1 AA, Text ≥ 4,5 : 1)

| Kombination | Farben | Kontrast |
|---|---|---|
| Schwarz auf Orange (Buttons, Badges) | #0A0A0A / #F26722 | 6,4 : 1 ✅ |
| Schwarz auf Orange-Hover | #0A0A0A / #D9571A | 5,0 : 1 ✅ |
| Orange-Text auf Schwarz | #F26722 / #0A0A0A | 6,4 : 1 ✅ |
| Weiß auf Schwarz | #FFFFFF / #0A0A0A | 19,8 : 1 ✅ |
| muted-dark auf Schwarz | #A8A8A8 / #0A0A0A | 8,3 : 1 ✅ |
| muted auf Stone | #5F5F5F / #EDEBE7 | 5,4 : 1 ✅ |
| **Weiß auf Orange** | #FFFFFF / #F26722 | 3,1 : 1 ❌ nicht verwenden |
| **Orange-Text auf Off-White** | #F26722 / #F5F3EF | 2,8 : 1 ❌ nicht verwenden |

### Nicht-Text-Kontrast (WCAG 1.4.11, Rahmen von Formularfeldern ≥ 3 : 1)

| Kombination | Farben | Kontrast |
|---|---|---|
| `border-input` auf Weiß | #8A857D / #FFFFFF | 3,7 : 1 ✅ |
| `border-input` auf Off-White | #8A857D / #F5F3EF | 3,3 : 1 ✅ |
| `border-input` auf Stone | #8A857D / #EDEBE7 | 3,1 : 1 ✅ |
| `border-input-dark` auf Schwarz | #777777 / #0A0A0A | 4,4 : 1 ✅ |
| `border-input-dark` auf Anthrazit | #777777 / #1A1A1A | 3,9 : 1 ✅ |
| `border-input-dark` auf Steel | #777777 / #2B2B2B | 3,2 : 1 ✅ |
| früher: #BDB8B0 auf Weiß, #555555 auf Anthrazit | | 2,0 : 1 und 2,3 : 1 ❌ |

**Regeln**
- Orange-Flächen bekommen immer **schwarze Schrift**.
- Orange als Textfarbe nur auf dunklem Grund. Auf hellem Grund Orange nur als Fläche oder Linie (z. B. Tab-Unterstrich) einsetzen.

### Typografie

| Stil | Schrift | Desktop / Mobil |
|---|---|---|
| H1 | Barlow Condensed 800, Versalien | 56 / 36 px |
| H2 | Barlow Condensed 700, Versalien | 40 / 28 px |
| H3 | Barlow Condensed 700, Versalien | 28 / 22 px |
| H4 | Barlow Condensed 700, Versalien | 20 / 18 px |
| Body | Inter 400 | 16 px |
| Small / Caption | Inter 400–600 | 14 / 12 px |
| Button | Barlow Condensed 600, Versalien, 1 px Letter-Spacing | 16 px, min. 48 px hoch |

- Schriften liegen als `*.woff2` in `assets/` (OFL-Lizenz) und werden in `snippets/fonts.liquid` eingebunden.
- Kein Google-Fonts-CDN: Das LG München hat 2022 entschieden, dass dabei die IP-Adresse unzulässig an Google übertragen wird (DSGVO).

### Layout
- 12-Spalten-Grid, max. 1320 px, Gutter 24 px (mobil 16 px)
- Breakpoints 640 / 1024 / 1280 px
- Abstände im 8er-System (8 · 16 · 24 · 32 · 48 · 64 · 96)
- Radius 0–2 px (kantig)
- Icons: Lucide, Linie 1,5 px
- Touch-Ziele min. 44 × 44 px

### Bildsprache
- **Produkte:** Freisteller auf `stone`, einheitlicher Ausschnitt (4:5)
- **Marke** (Hero, Bento, Story): Lifestyle & Road, dunkle Tonalität, warmes Licht, echte Fahrer
- **Raue Akzente:** feine Körnung/Asphalt-Textur als Overlay in dunklen Sektionen (`.textured`)

---

## 3. Informationsarchitektur

```
Header (sticky, schwarz)
├─ Motorräder ─ Megamenü: Neu · Gebraucht · Vorführer · Alle | Modellfamilien-Kacheln | CTA Probefahrt/Finanzierung
├─ Herren     ─ Megamenü: Unterkategorien | Neuheiten · Sale · Größentabelle · Kollektionen | 2 Teaser
├─ Damen      ─ (wie Herren)
├─ Teile & Zubehör ─ Megamenü: 10 Unterkategorien | nach Modellfamilie | Teaser Custom-Umbauten
├─ Accessoires ─ Megamenü: Unterkategorien | Neuheiten · Sale · Gutscheine | 2 Teaser
├─ Service    ─ Megamenü: Probefahrt · Finanzierung · Werkstatt · Inzahlungnahme · Events · Standort | Kontakt
└─ Sale (orangener Textlink)
Icons: Suche (auch Teilenummer) · Konto · Warenkorb (eine Merkliste hat das Theme nicht)
```

**Filter je Kategorie** (horizontale Filterleiste, mobil Bottom-Sheet)

| Kategorie | Filter |
|---|---|
| Motorräder | Zustand · Modellfamilie · Modell · Baujahr von–bis · Preis · km-Stand · Farbe |
| Herren / Damen | Kategorie · Größe · Farbe · Kollektion · Preis |
| Teile & Zubehör | Kategorie · Modellfamilie · Baujahr · Marke · Zulassung · Preis · Verfügbarkeit |
| Accessoires | Kategorie · Farbe · Preis |
| Neuheiten / Sale / Suche | Bereich · Preis |

**Weitere Elemente der Kategorieseite**
- Aktive Filter als Chips mit „Alle zurücksetzen“ und Trefferzahl
- Sortierung und Spalten-Umschalter (2/3/4)
- Pagination mit 12 Artikeln pro Seite

---

## 4. Seiten & Sektionen (Mapping auf Shopify-Sections)

### Homepage (`templates/index.json`)

| # | Sektion | Grund | Shopify-Section |
|---|---|---|---|
| 1 | Announcement-Bar | Orange | Announcement bar |
| 2 | Header + Megamenüs | Dunkel | Header (Mega-Menu-Blöcke) |
| 3 | Hero-Slider, Split 50/50, Autoplay 6 s mit Pause | Dunkel | Slideshow (eigene Variante „Split“) |
| 4 | Service-Leiste (4 Kacheln) | Hell | Multicolumn / Icon-Kacheln |
| 5 | Neuheiten mit Tabs (Bekleidung · Teile · Accessoires) | Hell | Featured collection mit Tabs |
| 6 | Kategorie-Bento (5 Kacheln) | Dunkel | Collage / Collection list (Custom) |
| 7 | Bike-Showroom-Karussell (Neu \| Gebraucht & Vorführer) | Hell | Featured collection „Motorräder“ (Bike-Karte) |
| 8 | Storytelling „Über uns“ + 3 Events | Dunkel | Image with text + Blog-Posts/Metaobjekt „Event“ |
| 9 | Footer mit Newsletter (Double-Opt-in) | Dunkel | Footer + Newsletter |

### Weitere Seiten

| Seite | Template | Kern |
|---|---|---|
| Kategorieseite | `templates/collection.json` | Banner, Filterleiste, Chips, Grid, Pagination |
| PDP Bekleidung/Accessoires | `templates/product.json` | Galerie, Farbe, Größe (Pflicht), Größentabelle, Akkordeons, GPSR |
| PDP Teile | `templates/product.teil.json` | Art.-Nr. kopierbar, Kompatibilitäts-Box, Zulassungs-Badge, Einbau-Hinweis |
| PDP Motorrad | `templates/product.motorrad.json` | Gesamtpreis + Steuerhinweis, Fakten-Grid, Kontakt-Box, Reservierung, Sticky-Bar mobil |
| Service | `templates/page.service.json` | Probefahrt · Finanzierung · Werkstatt · Inzahlungnahme · Events · Standort, je mit Kontakt-Box |

---

## 5. Komponenten (Snippets in `snippets/`, Stile in `assets/components.css`)

| Komponente | Varianten / Zustände | Hinweise |
|---|---|---|
| Button | Primär (Orange/Schwarz) · Sekundär (Schwarz/Weiß) · Outline hell/dunkel · Text · deaktiviert | min. 48 px hoch |
| Badge | Neu · Sale/-x % · Gebraucht · Vorführer · Reserviert · ABE · Eintragungspflichtig · Ohne Straßenzulassung | Zulassungs-Badges mit Icon + Tooltip |
| Produktkarte | Bekleidung (Swatches, Größen-Quick-Add), Teile („Passt für …“, direkter Quick-Add) | Hover: 2. Bild + Quick-Add; mobil „+“ |
| Bike-Karte | Neu / Gebraucht / Vorführer / Reserviert | EZ/Modelljahr · km · kW (PS), Preis + Steuerhinweis, „Details“ + „Anfragen“ |
| Preisblock | Preis* · Streichpreis · Grundpreis · Steuer-/Versandhinweis | siehe DE-Pflichtpunkte |
| Kontakt-Box | Themen-Chips + Anrufen/WhatsApp/E-Mail, Ansprechpartner, „Jetzt geöffnet“ | Chips ändern nur den vorausgefüllten Text |
| Kompatibilitäts-Box | Zusammenfassung + aufklappbare, durchsuchbare Tabelle | Daten aus Metaobjekt „Fahrzeugmodell“ |
| Größentabelle | Tabs Oberteile · Hosen · Handschuhe · Helme · Stiefel, Messanleitung | Modal (Desktop) / Bottom-Sheet (mobil) |
| Filter-Dropdown / Bottom-Sheet | Checkbox, Farbe, Bereich (von–bis), Einzelauswahl | Zähler am Button, Esc schließt |
| Drawer | Warenkorb (Fortschrittsbalken Versandschwelle) · Mobile-Menü | natives `<dialog>`: Fokusfalle + Esc |
| Megamenü | Links, Bild-Kacheln, CTA-Leiste | Hover + Tastatur (Chevron-Button), Touch: 1. Tipp öffnet |
| Akkordeon, Tabs, Breadcrumb, Pagination, Chips, Toast | – | ARIA-konform (den Cookie-Banner liefert Shopify, siehe `docs/freigaben.md`) |

---

## 6. Workflows

### Bike-Anfrage (nur Kontakt-Buttons)
1. Kund:in wählt in der Kontakt-Box das Thema: Probefahrt · Finanzierung · Inzahlungnahme · Reservierung (nur Gebraucht/Vorführer) · Frage.
2. **Anrufen** (`tel:`), **WhatsApp** (`wa.me/<nr>?text=…`) oder **E-Mail** (`mailto:` mit Betreff).
   - Der Text enthält Modell, Baujahr bzw. EZ, Fahrzeugnummer und URL.
3. Mobil ist unten eine Leiste „Anrufen | WhatsApp | E-Mail“ sichtbar.
4. Den WhatsApp-Kontakt in der Datenschutzerklärung aufführen.

### Reservierung (Gebraucht/Vorführer, manuelle Bestätigung)
1. Anfrage über die Kontakt-Box (Thema „Reservierung“)
2. Verkäufer prüft die Verfügbarkeit.
3. Zahlungslink per **Shopify-Entwurfsbestellung → „Rechnung senden“** (Gebühr, z. B. 250 € für 48 h)
4. Nach der Zahlung Metafeld `bike.status = reserviert` und `bike.reserviert_bis` setzen. Badge und Hinweis erscheinen automatisch.
5. Die Gebühr wird beim Kauf angerechnet, bei Nichtkauf erstattet.
6. Der Kaufvertrag wird **vor Ort** geschlossen. Wird ein Bike ausschließlich per Fernkommunikation verkauft, kann ein Widerrufsrecht entstehen.
7. Status-Logik:

| Status | Anzeige |
|---|---|
| Neu | keine Reservierung |
| Reserviert | Badge + „Reserviert bis …“, Kontakt bleibt möglich |
| Verkauft | Produkt ausblenden |

### Warenkorb
- Drawer mit Fortschrittsbalken „Noch X € bis versandkostenfrei“ und Zwischensumme (Cross-Sell hat das Theme nicht)
- „Zur Kasse“ führt zum Shopify-Checkout (Branding: Logo, Orange-Buttons)
- Zahlarten: PayPal, Klarna (Rechnung/Raten), Kreditkarte, Apple/Google Pay
- **Motorräder landen nie im Warenkorb.**

---

## 7. DE-/EU-Pflichtpunkte (Checkliste)

- [ ] **Preisangaben:**
  - Unter Shop-Preisen „inkl. MwSt., zzgl. Versandkosten“ (Sternchen + Fußnote bzw. Link)
  - Lieferzeit auf der PDP angeben
- [ ] **Streichpreise:** Nur mit dem niedrigsten Preis der letzten 30 Tage (§ 11 PAngV)
- [ ] **Grundpreis:** Bei Flüssigkeiten wie Öl oder Pflegemitteln (€/l)
- [ ] **Motorräder:**
  - Neufahrzeuge mit **Gesamtpreis inkl. Überführung/Nebenkosten**
  - Gebrauchte mit Differenzbesteuerung: „MwSt. nicht ausweisbar (§ 25a UStG)“
- [ ] **Finanzierung:** Monatsraten nur mit repräsentativem Beispiel (§ 17 PAngV). Das Theme zeigt keine Raten.
- [ ] **Bewertungen:** Hinweis, ob und wie sie geprüft werden (UWG)
- [ ] **GPSR** (EU 2023/988): Herstellerangaben und Sicherheitshinweise auf jeder PDP. Bei Textilien zusätzlich die Materialzusammensetzung.
- [ ] **Teile:** Zulassungs-Hinweis (ABE/EG-Genehmigung · eintragungspflichtig · ohne Straßenzulassung)
- [ ] **Newsletter:** Double-Opt-in; der Gutschein gilt nicht für Motorräder
- [ ] **Cookie-Consent:**
  - „Ablehnen“ gleichwertig zu „Alle akzeptieren“ (TDDDG)
  - Umsetzung über Shopify Customer Privacy API; Einstellungen jederzeit im Footer
- [ ] **Karten, Videos, Social-Embeds:** Erst nach Einwilligung laden
- [ ] **Button-Lösung:** Der Bestell-Button heißt „Zahlungspflichtig bestellen“ (§ 312j BGB) – im Checkout prüfen.
- [ ] **Rechtstexte:** Impressum, Datenschutz, AGB, Widerrufsbelehrung und Barrierefreiheitserklärung von einem Rechtstexte-Anbieter
- [ ] **Barrierefreiheit (BFSG, seit 28.06.2025):** Ziel WCAG 2.1 AA
  - Im früheren Mockup umgesetzt, im Theme erneut zu prüfen: Skip-Link, Landmarks, Fokus-Stile, ARIA für Tabs/Dialoge/Karussell, Pause beim Autoplay, `prefers-reduced-motion`
  - axe-Prüfung des Themes (axe-core 4.13, WCAG 2.1 A/AA, lokaler Render-Harness mit Beispieldaten): 0 Verstöße auf allen Standardseiten in Desktop und Mobil und in den geöffneten Zuständen (Warenkorb-Drawer, Such-Dialog, Menüs, Filter, Größentabelle), 32 Läufe. Kontrast über Bildern und Videos meldet axe als „zu prüfen“: manuell prüfen. Der Nullbefund gilt nicht für den echten Shop: im Preview-Theme erneut laufen lassen, zusätzlich Kontrastmodus (Windows, `forced-colors`), Tastatur und Screenreader prüfen
- [ ] **Widerruf:** 14 Tage gesetzlich. Die freiwillige Rückgabefrist (z. B. 30 Tage) getrennt davon kommunizieren.

---

## 8. Shopify-Umsetzung

**Theme-Basis:** Eigenes Theme „Power Shop“ (kein Horizon oder Dawn, kein Build-Step). Sections wie in Kapitel 4, Tokens als CSS-Variablen in `assets/tokens.css`.

### Metafelder

| Namespace.Key | Typ | Zweck |
|---|---|---|
| `bike.status` | Einzeiliger Text (verfügbar / reserviert / verkauft) | Badge, Status-Logik |
| `bike.zustand` | Einzeiliger Text (neu / gebraucht / vorfuehrer) | Filter, Badge |
| `bike.baujahr` · `bike.erstzulassung` · `bike.km` | Zahl / Text / Zahl | Fakten, Filter |
| `bike.leistung_kw` · `bike.leistung_ps` · `bike.hubraum` · `bike.farbe` · `bike.hu_bis` | Zahl / Text | Fakten-Grid |
| `bike.besteuerung` | Text (regel / 25a) | Steuerhinweis |
| `bike.reserviert_bis` | Datum/Uhrzeit | „Reserviert bis …“ |
| `bike.fahrzeugnummer` | Text | Kontakt-Nachricht |
| `part.teilenummer` | Text | Anzeige + Suche |
| `part.zulassung` | Text (abe / eintragung / keine / none) | Badge |
| `part.modellfamilien` · `part.baujahre` | Liste Text / Liste Zahl | Filter (Search & Discovery) |
| `part.kompatibilitaet` | Liste Metaobjekt „Fahrzeugmodell“ | Kompatibilitäts-Tabelle |
| `apparel.groessentabelle` | Metaobjekt „Größentabelle“ | Popup-Inhalt |
| `apparel.passform` | Text | Akkordeon „Passform“ |

### Metaobjekte
- **Fahrzeugmodell** (Modellfamilie, Modell, Baujahr von/bis)
- **Größentabelle** (Titel, Spalten, Zeilen, Messanleitung)
- **Event** (Datum, Titel, Ort, Bild)

### Weitere Punkte
- **Filter:** App „Search & Discovery“ mit Metafeld-Filtern (Zustand, Modellfamilie, Baujahr, km, Zulassung)
- **Motorräder:**
  - Als Produkte mit eigener Produktvorlage `product.motorrad` ohne Kauf-Button
  - Den Kauf zusätzlich technisch sperren, z. B. über den Bestand oder eine Checkout-Validierung (mit dem Entwickler klären)
- **Suche:** Teilenummer als durchsuchbares Feld (Metafeld in der Suche aktivieren oder als Tag/SKU pflegen)
- **Bewertungen:** Bewertungs-App mit Hinweis „geprüft“
- **Newsletter:** Shopify Email bzw. Klaviyo mit Double-Opt-in
- **Cookie-Consent:** Customer Privacy API bzw. Consent-App mit gleichwertigem „Ablehnen“
- **Logos:**
  - Offizielles **H-D Bar & Shield** unverändert aus dem Händlerportal
  - Einsatz im Header neben der Wortmarke, im Footer und im Mobile-Menü
  - Schutzzone und Mindestgröße laut H-D-Händlerrichtlinien einhalten
  - Nicht als Favicon verwenden; Favicon ist das Power-Shop-Signet

---

## 9. Von euch zu liefern

Im Theme stehen dafür Platzhalter oder leere Felder (Theme-Einstellungen, siehe `README.md`).

- **Firmendaten:** Name, Anschrift, Telefon, WhatsApp-Nummer, E-Mail, Öffnungszeiten, Ansprechpartner (Foto, Name, Rolle)
- **Shop-Werte:** Versandschwelle und -kosten, Lieferzeiten, Rückgabefrist, Versandländer
- **Reservierung:** Gebühr und Dauer; dazu der Newsletter-Rabatt
- **Echte Fotos** laut `docs/bildliste.md` (gleiche Dateinamen, gleiches Seitenverhältnis)
- **H-D-Logo** als Datei (am besten SVG aus dem Händlerportal) → `assets/hd-bar-shield.png` ersetzen (PNG mit Transparenz, ca. 190 px breit, Seitenverhältnis 1024 : 830, siehe `README.md`)
- **Texte:** Über uns, Kennzahlen, Events
- **Rechtstexte**

## 10. Später nachrüstbar
- Garage „Meine Harley“ (Bike speichern → Teile automatisch filtern, Badge „Passt zu deiner …“)
- Größenberater-App
- Online-Terminbuchung für Probefahrt und Werkstatt
- 360°-Ansicht bzw. Video auf der Bike-PDP
