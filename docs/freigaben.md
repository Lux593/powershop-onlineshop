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
| `config/settings_schema.json:52` | 30 Tage freiwillige Rückgabe („kostenlose Rückgabe“) | Ankündigungsleiste, Produktseite | offen | |
| `config/settings_schema.json:53-54` | Reservierung 250 € für 48 h, „wird beim Kauf angerechnet, sonst erstattet“ | Bike-Seite (Gebrauchte) | offen | |
| `config/settings_schema.json:55` | Newsletter-Rabatt 10 % | Newsletter-Band im Footer | offen | |
| `config/settings_schema.json:61` | Zahlarten PayPal, Klarna, Visa, Mastercard, Apple Pay, Google Pay (nur eintragen, was im Checkout aktiv ist) | Footer, Warenkorb | offen | |
| `sections/header-group.json:8-9` | Texte der Ankündigungsleiste („Versandkostenfrei ab {schwelle}*“, „{tage} Tage Rückgabe“) | alle Seiten | offen | |

## 2. Newsletter

| Fundstelle | Aussage | Status | Freigabe |
|---|---|---|---|
| `sections/footer-group.json:16-17` | „10 % auf deine erste Bestellung“, „Der Gutschein gilt für Bekleidung, Teile und Accessoires – nicht für Motorräder“. Im Theme gibt es **keinen** Gutschein und keine Automation: den Rabattcode samt automatischer Zusendung im Shopify-Admin anlegen, sonst die Aussage streichen. | offen | |
| `sections/footer.liquid:85, 90` | Erfolgstext und Hinweis „Double-Opt-in“. Stimmt nur, wenn Shopify die Bestätigungs-Mail wirklich verschickt (Einstellungen > Kunden > Marketing-Einwilligung). Einwilligungstext vom Rechtstexte-Anbieter. | offen | |

## 3. Rechtliches, Footer und Kontakt

| Fundstelle | Aussage | Status | Freigabe |
|---|---|---|---|
| Shopify-Menüs `footer`, `customer-service`, `legal` (Handles aus `sections/footer-group.json:8-10`) | Impressum, Datenschutz, AGB, Widerruf kommen ausschließlich aus diesen Menüs. **Im Admin anlegen und prüfen.** Zusätzlich verlinkt der Footer Richtlinien aus Einstellungen > Richtlinien, die in keinem Menü stehen (Schalter im Footer-Abschnitt, Standard an). | offen | |
| `sections/footer.liquid:146` | Fußnote „* Alle Preise inkl. MwSt., zzgl. Versandkosten“. Gilt nicht für Differenzbesteuerung (Gebrauchte, § 25a UStG, `snippets/bike-card.liquid:68`). Der Stern der Ankündigungsleiste wird nirgends einzeln erklärt. Wortlaut „Versand“ und „Versandkosten“ ist uneinheitlich (`snippets/pdp-sticky-buy.liquid:32`, `sections/cart.liquid:32`, `sections/cart-drawer.liquid:51`: „zzgl. Versand (kostenlos)“ widerspricht sich). | offen | |
| `sections/footer-group.json:18` | Text der Händlerkarte „Harley-Davidson Neufahrzeuge, Original-Teile, MotorClothes und Werkstatt-Service.“ | offen | |
| `config/settings_schema.json:15-21, 40-42` | Firmenname, Adresse, Telefon, WhatsApp, E-Mail, Ansprechperson: bewusst ohne Beispielwerte, bleiben unsichtbar, solange leer. | offen | |
| `assets/theme.js:114-120`, `sections/footer-group.json:10` | Link „Cookie-Einstellungen“ tut nur etwas, wenn in Shopify ein Cookie-Banner mit gleichwertigem „Ablehnen“ aktiv ist (Customer Privacy API). Ohne Banner erscheint beim Klick ein Hinweis. Banner im Admin aktivieren und testen. | offen | |
| `docs/briefing.md:250-253` | Barrierefreiheitserklärung (BFSG) und Kontakt für Rückmeldungen: Text vom Rechtstexte-Anbieter, im Rechtsmenü verlinken. Aussagen erst nach echtem Test (Preview-Theme, Tastatur, Screenreader). Das Theme hat keinen Platz dafür, solange das Menü `legal` keinen Eintrag hat. | offen | |
| Datenschutzerklärung | Erwähnung von WhatsApp-Kontakt und Google-Maps-Link (siehe `docs/briefing.md`). | offen | |

## 4. Marken- und Marketingtexte

| Fundstelle | Aussage | Status | Freigabe |
|---|---|---|---|
| `templates/index.json:112-114` | Kennzahlen: 25+ Jahre Erfahrung, 300+ Bikes pro Jahr, 1 Meisterwerkstatt | offen | |
| `templates/index.json:115-117`, `templates/page.service.json:62-88` | Events: Titel, Datum, Ort und Uhrzeit (11.10., 24.10., 14.11.2026) | offen | |
| `templates/index.json:6-19, 20-33, 34-47` | Hero: Modelle, Preise („ab 31.500 €“, „ab 48.300 €“), Modelljahr 2026, Farben, Beschreibungen | offen | |
| `templates/index.json:86` | Statement „Von der Probefahrt bis zum Umbau …“ | offen | |
| `templates/index.json:58-61, 77-80, 92-96, 100, 122-125` | Texte der Service-Kacheln, Neuheiten, Kategorie-Kacheln und Story | offen | |
| `templates/index.json:125` | Story-Button „Über uns“ hat **keinen Link** (`button_url` leer): der Button erscheint nie. Ziel nennen oder Label streichen. | offen | |
| `templates/page.service.json` | Service-Texte (Probefahrt, Finanzierung, Werkstatt, Inzahlungnahme) | offen | |
| `sections/header-group.json:22, 29-36, 53` | Megamenü-Text, Teaser-Beschriftungen, Suchbegriffe | offen | |
| `sections/product.liquid:204, 208-210` | Zusicherungen bei Fahrzeugen: Neufahrzeug „mit voller Herstellergarantie“; Gebrauchte „Scheckheftgepflegt bei Harley-Davidson Vertragspartnern“, „Unfallfrei laut Vorbesitzer“, „Frische Inspektion vor Übergabe“ | offen | |
| `sections/product.liquid:530` | Pflichthinweis „Geprüfte Bewertungen“ (UWG): stimmt nur mit einer Bewertungs-App, die den Kauf prüft | offen | |
| `snippets/size-guide.liquid:23-90` | Größentabellen (Werte in cm) | offen | |

## 5. Bildrechte

Siehe [`docs/bildliste.md`](bildliste.md), Abschnitt „Bildnachweis und Nutzungsrechte“. Der Hero-Clip hat eigene offene Punkte in
[`docs/hero-clip.md`](hero-clip.md).

## 6. Titel, Beschreibung, Teilen-Bild

Startseiten-Titel, Meta-Beschreibung und das Bild für geteilte Links pflegt der Händler in Shopify (Onlineshop > Einstellungen >
Titel und Meta-Beschreibung, Soziale Netzwerke). Das Theme (`snippets/meta-tags.liquid`) liest sie nur aus und hat kein eigenes Share-Bild.

## Verhalten bei leeren Werten

Leere oder 0-Werte in den Theme-Einstellungen führen im Shop zu **keiner** Aussage statt zu „ab 0 €“ oder „ Tage Rückgabe“:

- Ankündigungsleiste: ein Hinweis mit `{schwelle}` oder `{tage}` entfällt bei Wert 0 oder leer; ohne sichtbaren Hinweis entfällt die Leiste.
- Produktseite: Lieferzeit, Versandkostenfrei-Grenze, Versandkosten, Rückgabefrist und Reservierungsbedingungen erscheinen nur mit Wert.
- Footer: ohne Newsletter-Rabatt lautet die Überschrift „Newsletter“ (der Text darunter bleibt unverändert und gehört dann geprüft).
