# Freigabeliste für den Händler

Alles hier sind **Aussagen, Zahlen und Texte des Händlers**. Das Theme-Team ändert sie nicht, sie stehen aber live im Shop,
sobald das Theme veröffentlicht ist. Jede Zeile braucht vor dem Livegang ein Ja vom Händler (bei Rechtstexten zusätzlich vom
Rechtstexte-Anbieter). Fundstellen sind Datei:Zeile im Stand dieses Laufs, die Zeilen verschieben sich bei Änderungen (Prüfung: jede Fundstelle gegen den Text abgleichen, nicht nur gegen die Zeilenzahl).

Status: **offen** = noch nicht freigegeben. Trage Freigabe und Datum in die letzten beiden Spalten ein.

## 1. Zahlen und Zusagen aus den Theme-Einstellungen

Diese Werte sind Beispielwerte (`config/settings_data.json` ist leer, es gelten die Schema-Vorgaben). Sie erscheinen in
Ankündigungsleiste, Produktseiten, Warenkorb, Newsletter-Band und Bike-Seite. **Im Theme-Editor unter Theme-Einstellungen >
Versand, Rückgabe, Reservierung prüfen oder leeren.** Ein leerer oder 0-Wert erzeugt im Shop keine Aussage (siehe unten).

| Fundstelle | Aussage (Beispielwert) | Wo sie erscheint | Status | Freigabe |
|---|---|---|---|---|
| `config/settings_schema.json:49` | Versandkostenfrei ab 100 € | Ankündigungsleiste, Produktseite (Lieferung, Versand), Warenkorb-Fortschritt | offen | |
| `config/settings_schema.json:50` | Versandkosten darunter 4,95 € | Produktseite (Versand und Rückgabe), Warenkorb | offen | |
| `config/settings_schema.json:51` | Lieferzeit 2–4 Werktage | Produktseite, Warenkorb | offen | |
| `config/settings_schema.json:52` | Rückgabefrist 14 Tage (vom Händler festgelegt). Bis 14 Tage nennt die Produktseite nur das gesetzliche Widerrufsrecht; erst ein Wert über 14 erscheint als freiwillige, „kostenlose Rückgabe“. Die Ankündigungsleiste zeigt „14 Tage Rückgabe“. | Ankündigungsleiste, Produktseite | erledigt | |
| `config/settings_schema.json:53-54` | Reservierung 250 € für 48 h, „wird beim Kauf angerechnet, sonst erstattet“ | Bike-Seite (Gebrauchte) | offen | |
| `config/settings_schema.json:55` | Newsletter-Rabatt 10 % | Newsletter-Band im Footer | offen | |
| `config/settings_schema.json:61` | Zahlarten: Footer und Warenkorb zeigen die im Checkout aktiven Zahlarten als offizielle Shopify-Icons. Die Liste PayPal, Klarna, Visa, Mastercard, Apple Pay, Google Pay gilt nur, solange dort noch keine aktiv sind. | Footer, Warenkorb | offen | |
| `sections/header-group.json:8-9` | Texte der Ankündigungsleiste („Versandkostenfrei ab {schwelle}*“, „{tage} Tage Rückgabe“) | alle Seiten | offen | |

## 2. Newsletter

| Fundstelle | Aussage | Status | Freigabe |
|---|---|---|---|
| `sections/footer-group.json:16-17` | „10 % auf deine erste Bestellung“, „Der Gutschein gilt für Bekleidung, Teile und Accessoires – nicht für Motorräder“. Im Theme gibt es **keinen** Gutschein und keine Automation: den Rabattcode samt automatischer Zusendung im Shopify-Admin anlegen, sonst die Aussage streichen. | offen | |
| `sections/footer.liquid:85, 90` | Erfolgstext und Hinweis „Double-Opt-in“. Stimmt nur, wenn Shopify die Bestätigungs-Mail wirklich verschickt (Einstellungen > Kunden > Marketing-Einwilligung). Einwilligungstext vom Rechtstexte-Anbieter. Sicherheitsprüfung (Endkontrolle): Das Theme erzwingt die Bestätigung nicht, die Einstellung ist von außen nicht prüfbar; ohne aktives Double-Opt-in können fremde Adressen eingetragen werden (unverlangte Werbung, UWG). Dann Zusage und Erfolgstext streichen. | offen | |

## 3. Rechtliches, Footer und Kontakt

| Fundstelle | Aussage | Status | Freigabe |
|---|---|---|---|
| Shopify-Menüs `footer`, `customer-service`, `legal` (Handles aus `sections/footer-group.json:8-10`) | Impressum, Datenschutz, AGB, Widerruf kommen ausschließlich aus diesen Menüs. **Im Admin anlegen und prüfen.** Zusätzlich verlinkt der Footer Richtlinien aus Einstellungen > Richtlinien, die in keinem Menü stehen (Schalter im Footer-Abschnitt, Standard an). | offen | |
| `sections/footer.liquid:146` | Fußnote „* Alle Preise inkl. MwSt., zzgl. Versandkosten“. Gilt nicht für Differenzbesteuerung (Gebrauchte, § 25a UStG, `snippets/bike-card.liquid:69`). Der Stern der Ankündigungsleiste wird nirgends einzeln erklärt. Wortlaut „Versand“ und „Versandkosten“ ist uneinheitlich (`snippets/pdp-sticky-buy.liquid:33`, `sections/cart.liquid:32`, `sections/cart-drawer.liquid:51`: „zzgl. Versand (kostenlos)“ widerspricht sich). | offen | |
| `sections/footer-group.json:18` | Text der Händlerkarte „Harley-Davidson Neufahrzeuge, Original-Teile, MotorClothes und Werkstatt-Service.“ | offen | |
| `config/settings_schema.json:15-21, 40-42` | Firmenname, Adresse, Telefon, WhatsApp, E-Mail, Ansprechperson: bewusst ohne Beispielwerte, bleiben unsichtbar, solange leer. Folge (Endkontrolle): Ohne Telefon, WhatsApp und E-Mail zeigen die Bike-Karten nur „Details“ (kein „Anfragen“ auf einen toten Anker), die Motorrad-Seite hat keine Kontakt-Box und keine Handlung. Das ist der Verkaufsweg der Motorräder: Daten vor dem Livegang eintragen. Adresse eingetragen (config/settings_data.json): Burghölzle 15, 79576 Weil am Rhein, aus den Shopify-Angaben; erscheint auf der Service-Seite und bei „Standort & Übergabe“. | offen | |
| `assets/theme.js` (`showCookieSettings`), `sections/footer-group.json:10` | Link „Cookie-Einstellungen“ (jetzt ein Knopf): öffnet zuerst `window.privacyBanner.showPreferences()` (so auf dem Live-Shop gefunden), dann die Customer Privacy API, dann lädt er diese nach; erst wenn nichts davon da ist, erscheint ein Hinweis. Funktioniert nur mit einem aktiven Cookie-Banner von Shopify mit gleichwertigem „Ablehnen“. Banner im Admin aktivieren und im Preview-Theme testen (im Harness nur mit Stubs prüfbar). | offen | |
| `docs/briefing.md:250-253` | Barrierefreiheitserklärung (BFSG) und Kontakt für Rückmeldungen: Text vom Rechtstexte-Anbieter, im Rechtsmenü verlinken. Aussagen erst nach echtem Test (Preview-Theme, Tastatur, Screenreader). Das Theme hat keinen Platz dafür, solange das Menü `legal` keinen Eintrag hat. | offen | |
| Datenschutzerklärung | Erwähnung von WhatsApp-Kontakt und Google-Maps-Link (siehe `docs/briefing.md`). Sicherheitsprüfung (Endkontrolle): Schon vor der Einwilligung laufen Anfragen an Shopify-Dienste (shop.app/pay/hop setzt das Cookie `_shop_app_essential`, Skripte von cdn.shopify.com, Anfragen an monorail-edge und otlp-http-production.shopifysvc.com); Marketing- und Analyse-Cookies entstehen nicht. Die Erklärung muss Shopify, Shop Pay und die Shop-App nennen. Das Theme kann das nicht ändern; „Mit Shop anmelden“ und Shop-Pay-Funktionen im Admin prüfen oder abschalten. | offen | |
| `assets/base.css` (`:focus-visible`) | Fokusrahmen auf Wunsch des Händlers entfernt, auch für Tastaturbedienung. Wer nur mit der Tastatur bedient, sieht nicht mehr, wo der Fokus steht (WCAG 2.4.7). Für Onlineshops in Deutschland gilt seit 28.06.2025 das BFSG (Ausnahme: Kleinstunternehmen unter 10 Beschäftigten und höchstens 2 Mio. € Umsatz). Zurück: in base.css die Linie wieder färben (`outline-color`). | offen | |

## 4. Marken- und Marketingtexte

| Fundstelle | Aussage | Status | Freigabe |
|---|---|---|---|
| `templates/index.json:123-125` | Kennzahlen: 45+ Jahre Erfahrung, 2 Motorrad-Meister, ∞ Kunden & Freunde (vom Händler vorgegeben) | erledigt | |
| `templates/index.json:126-128` | Events: Titel, Datum, Ort und Uhrzeit (11.10., 24.10., 14.11.2026). Seit 27.10. nur noch auf der Startseite, als Infokarten ohne Link und ohne „Alle Events“. | offen | |
| `templates/index.json:6-19, 20-33, 34-47` | Hero: Modelle, Preise („ab 31.500 €“, „ab 48.300 €“), Modelljahr 2026, Farben, Beschreibungen | offen | |
| `templates/index.json:66-67` | Willkommensblock: Überschrift „Willkommen beim Harley-Davidson Power Shop“ und Statement „Von der Probefahrt bis zum Umbau …“ | offen | |
| `templates/index.json:58-61, 77-80, 92-96, 100, 133-137` | Texte der Service-Kacheln, Neuheiten, Kategorie-Kacheln und Story | offen | |
| `templates/index.json:136` | Story-Button „Über uns“ hat **keinen Link** (`button_url` leer): der Button erscheint nie. Ziel nennen oder Label streichen. | offen | |
| `templates/page.werkstatt.json` | Werkstatt-Kopf: „Inspektion, Einbau, Custom-Umbau und Eintragung: Unsere Meisterwerkstatt kümmert sich um dein Bike.“ Band über den Umbauten: „Custom-Umbauten aus unserer Meisterwerkstatt“ und „Du bringst die Idee mit, wir setzen sie in unserer Meisterwerkstatt um, vom neuen Lenker bis zum kompletten Umbau. Wähl einen Umbau und schau dir in der Galerie alle Bilder und Details an.“ | offen | |
| `templates/page.dienstleistungen.json` | Kaufweg-Texte (bis 27.10. auf der Service-Seite): Banner „Probefahrt, Inzahlungnahme, Finanzierung, Versicherung und Lieferung. Ein Ansprechpartner. Ein Ablauf. Kein Stress.“ (Satz der alten Website), Probefahrt (Text und drei Stichpunkte), Inzahlungnahme (Ablauf in drei Schritten, Unterlagen „Das brauchen wir von dir“), Finanzierung, Versicherung | offen | |
| `templates/page.service.json` | **Neu (27.10.):** Einleitung „Werkstatt, Kauf und das Team dahinter: alles, was wir rund um dein Motorrad für dich tun.“ und die drei Türen „Werkstatt – Inspektion, Umbau & Eintragung“, „Dienstleistungen – Probefahrt, Inzahlungnahme, Finanzierung & Versicherung“, „Über uns – Team & Geschichte seit 1985“ (1985 aus der alten Website, Frage 43 in `docs/haendler-fragen.md`) | offen | |
| `templates/page.dienstleistungen.json` (Block `inzahlungnahme`) | **Neu (27.10.):** Ablauf in drei Schritten (Daten schicken, Angebot bekommen, beim Kauf anrechnen) und „Das brauchen wir von dir: Fahrzeugschein und -brief (Zulassungsbescheinigung Teil I und II), Serviceheft und alle Schlüssel.“ (Frage 40 in `docs/haendler-fragen.md`) | offen | |
| `templates/page.dienstleistungen.json` (Block `lieferung`), `templates/page.service.json` (Hinweis unter `standort`) | **Neu (27.10.):** „Anmeldung & Lieferung“ nach der alten Seite „Verkauf & Lieferung DE/CH/FR“: Kauf vor Ort oder per Telefon und E-Mail, Deutschland über die Harley-Davidson-Spedition SKS, Schweiz mit Export, Verzollung und Zollkennzeichen bis zum MFK-Termin, Frankreich mit Exportabwicklung und WW-Kennzeichen; unter „Standort & Kontakt“: „Zu weit für einen Besuch? Wir liefern dein Motorrad bundesweit, in die Schweiz und nach Frankreich.“ (Frage 41) | offen | |
| `templates/page.service.json` (Einstellungen der Sektion `main`) | Events-Abschnitt: „Gemeinsame Ausfahrten, Bike Nights und Werkstatt-Tage – komm vorbei, auch ohne eigenes Bike.“ und ohne anstehenden Termin „Gerade steht kein Termin an. Neue Ausfahrten und Bike Nights findest du hier, sobald sie feststehen.“ | entfällt (27.10.: Service zeigt keine Events mehr) | |
| `sections/visit.liquid`, `templates/page.service.json` und `templates/page.contact.json` (Sektion `standort`) | „Komm vorbei“: „Im Stadtteil Haltingen, mitten im Dreiländereck.“, Pin „Power Shop“ auf der Karte, Knopf „Route planen“ (Google Maps) | offen | |
| `sections/header-group.json:22, 29-36, 54` | Megamenü-Text, Teaser-Beschriftungen, Suchbegriffe | offen | |
| `sections/product.liquid:214, 218-220` | Zusicherungen bei Fahrzeugen: Neufahrzeug „mit voller Herstellergarantie“; Gebrauchte „Scheckheftgepflegt bei Harley-Davidson Vertragspartnern“, „Unfallfrei laut Vorbesitzer“, „Frische Inspektion vor Übergabe“ | offen | |
| `sections/product.liquid:527` | Pflichthinweis „Geprüfte Bewertungen“ (UWG): stimmt nur mit einer Bewertungs-App, die den Kauf prüft. Der Abschnitt „Bewertungen“ mit diesem Hinweis erscheint bei Bekleidung auch ohne App-Block | offen | |
| `sections/product.liquid:456` | Überschrift „Wird oft zusammen gekauft“ (Teile): belegt eine Kaufstatistik, die das Theme nicht hat; es sind nur die ersten Produkte der Kollektion. Vorschlag neutral, z. B. „Das passt dazu“, erst nach Freigabe. | offen | |
| `snippets/price.liquid:42` | Hinweis „Streichpreis = niedrigster Preis der letzten 30 Tage“ (PAngV): behauptet eine Eigenschaft des Vergleichspreises. Nur mit Bestätigung, dass der Streichpreis so gepflegt wird. | offen | |
| `assets/contact.js` (`openState`) | Anzeige „Jetzt geöffnet – bis … Uhr“ / „Gerade geschlossen“: rechnet in der Zeitzone des Besuchers, kennt keine Feiertage und Betriebsferien. Eine Aussage des Händlers: Anzeige freigeben (mit Zeitzone und Feiertagen, siehe Frage 2 in `docs/haendler-fragen.md`) oder „Öffnungszeiten“ in den Theme-Einstellungen leer lassen. | offen | |
| `sections/showroom.liquid:54, 85-88, 120` | Neue neutrale Statustexte im Showroom: „Aktuell sind keine Neufahrzeuge eingestellt.“, „Aktuell sind keine Gebrauchten oder Vorführer eingestellt.“, Links „Alle Motorräder“ / „Alle Motorräder ansehen“. Sie erscheinen, wenn eine Gruppe leer ist beziehungsweise (Handlung) wenn keine Kontaktdaten gepflegt sind. Wortlaut kurz bestätigen. | offen | |
| `sections/showroom.liquid:66`, `templates/index.json:107-112` | Kategorie-Chips im Showroom: „Alle“ plus Sport, Cruiser, Grand American Touring, Adventure Touring, Trike, CVO (Titel der Kollektionen, im Theme-Editor je Block änderbar). | offen | |
| `sections/header.liquid:105`, `snippets/mega-menu.liquid` | Handy-Menü und Megamenü: Link zur Service-Seite heißt „Service im Überblick“ (bei Kollektionen weiter „Alle …“). | offen | |
| `snippets/size-guide.liquid:23-90` | Größentabellen (Werte in cm) | offen | |

## 5. Bildrechte

Siehe [`docs/bildliste.md`](bildliste.md), Abschnitt „Bildnachweis und Nutzungsrechte“. Der Hero-Clip hat eigene offene Punkte in
[`docs/hero-clip.md`](hero-clip.md).

Sichtbare Bildthemen aus der Endkontrolle (ohne Händlerfreigabe nicht änderbar):

- Die Banner für Damen, Teile & Zubehör, Accessoires, Neuheiten und Sale sind Platzhalterbilder (`banner-teile.jpg` zeigt „PLATZHALTER“) und bleiben bewusst ausgeblendet; die rechte Bannerhälfte bleibt dort schwarz. Echte Bannerfotos unter denselben Dateinamen liefern lassen (`docs/bildliste.md`) und aus der Platzhalterliste streichen.
- Das Teamfoto (`assets/powershop-team.webp`) trägt Namen und Funktionen als Bildtext; auf dem Handy (Faktor 0,37) ist er mit etwa 5 px nicht lesbar. Besser Foto ohne eingebrannte Texte oder als Raster mit HTML-Beschriftung.
- Hero-Quellen sind weich (Mobil 960 x 540, Fotoslides 1024 x 576): schärfere Dateien mit dem Performance-Gewicht abwägen (`docs/hero-clip.md`).
- Die Karte in „Komm vorbei“ (`assets/karte-dreilaendereck-*.webp`) ist ein Ausschnitt der OpenStreetMap (Lizenz ODbL). Die Quellenangabe „Karte © OpenStreetMap-Mitwirkende“ steht verlinkt auf der Karte und muss dort bleiben.

## 6. Titel, Beschreibung, Teilen-Bild

Startseiten-Titel, Meta-Beschreibung und das Bild für geteilte Links pflegt der Händler in Shopify (Onlineshop > Einstellungen >
Titel und Meta-Beschreibung, Soziale Netzwerke). Das Theme (`snippets/meta-tags.liquid`) liest sie nur aus und hat kein eigenes Share-Bild.

## Verhalten bei leeren Werten

Leere oder 0-Werte in den Theme-Einstellungen führen im Shop zu **keiner** Aussage statt zu „ab 0 €“ oder „ Tage Rückgabe“:

- Ankündigungsleiste: ein Hinweis mit `{schwelle}` oder `{tage}` entfällt bei Wert 0 oder leer; ohne sichtbaren Hinweis entfällt die Leiste.
- Produktseite: Lieferzeit, Versandkostenfrei-Grenze, Versandkosten, Rückgabefrist und Reservierungsbedingungen erscheinen nur mit Wert.
- Footer: ohne Newsletter-Rabatt lautet die Überschrift „Newsletter“ (der Text darunter bleibt unverändert und gehört dann geprüft).

## 7. Admin-Aufgaben (kein Code, keine Textfreigabe)

Diese Punkte lassen sich im Theme nicht lösen. Sie wurden live beziehungsweise im Repository festgestellt (Endkontrolle, 3. Oktober 2026).

| Aufgabe | Befund | Status |
|---|---|---|
| Seite „Service“ anlegen (Handle `service`, Vorlage `page.service`) | `/pages/service` liefert live 404. Die Startseite verlinkt sie 16-mal (Ankündigungsleiste „Probefahrt anfragen“, zweiter Hero-Button, vier Service-Kacheln, Megamenü-Buttons, Event-Links), die Kategorie Motorräder verlinkt `/pages/service#probefahrt`. Der Showroom-Leerzustand hängt ebenfalls an ihr. Vor Werbung anlegen. | offen |
| Impressum, AGB, Widerruf, Versand, Rückgabe anlegen | `/policies/privacy-policy` existiert; `legal-notice`, `terms-of-service`, `refund-policy`, `shipping-policy` liefern live 404. Für einen Shop in Deutschland vor dem Verkauf Pflicht. | offen |
| Double-Opt-in für die Marketing-Einwilligung aktivieren und mit einer Testadresse prüfen | Siehe Abschnitt 2: Das Theme verspricht eine Bestätigungs-Mail. | offen |
| Cookie-Banner aktivieren, „Ablehnen“ gleichwertig, im Preview-Theme „Cookie-Einstellungen“ im Footer testen | Live ist das Banner aktiv; der Footer-Link nutzt jetzt dessen Schnittstelle (Abschnitt 3). Im Preview bestätigen. | offen |
| Händlerdaten (Telefon, WhatsApp, E-Mail) in den Theme-Einstellungen eintragen | Ohne sie hat die Motorrad-Seite keine Handlung (Abschnitt 3). Auf der Service-Seite fehlen dann die Anfrage-Zeilen; Finanzierung verweist auf „Standort & Kontakt“. Vorschlag aus der alten Website: Frage 39 in `docs/haendler-fragen.md`. | offen |
| Seite „Kontakt“ (`/pages/contact`) die Vorlage `contact` zuweisen | Erst nach dem Push, vorher kennt der Live-Shop die Vorlage nicht. Heute ist die Seite leer. | offen |
| GitHub-Repository `Lux593/powershop-onlineshop` auf privat stellen (vorher prüfen, ob die Shopify-GitHub-Integration damit weiter arbeitet) oder `docs/` nicht mehr veröffentlichen | Das Repository ist öffentlich lesbar und enthält interne Notizen (Händlerfragen, Freigabeliste, Briefing, Übergabe) sowie in 44 Commits eine private Autoren-Adresse. Für künftige Commits die GitHub-noreply-Adresse nutzen. Zugangsdaten oder Händlerdaten stehen nicht in den Dateien. | offen |
| „Mit Shop anmelden“ und Shop-Pay-Funktionen prüfen | Siehe Datenschutzerklärung (Abschnitt 3). | offen |
