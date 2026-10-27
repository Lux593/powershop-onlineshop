# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- Harley-Fahrer und solche, die es werden wollen: Kenner und Einsteiger sind gleich wichtig (Briefing, `docs/briefing.md`).
- Sie kommen über den Onlineshop (Bekleidung, Teile, Accessoires), über den Showroom (Neu- und Gebrauchtmaschinen) oder mit einem
  Service-Anliegen: Probefahrt, Werkstatt-Termin, Custom-Umbau, Finanzierung, Versicherung, Inzahlungnahme.
- Viele lesen am Handy; der Betreiber selbst arbeitet an zwei 3440 × 1440-Monitoren mit Intel-Grafik.

## Product Purpose

Onlineshop und digitales Schaufenster des Power Shop, eines offiziellen Harley-Davidson-Vertragshändlers in Weil am Rhein
(Burghölzle 15). Kleidung, Teile und Accessoires werden online gekauft. Motorräder und Service-Leistungen werden angefragt,
der Abschluss passiert persönlich.

## Positioning

Ein Händler mit eigener Meisterwerkstatt, die Custom-Umbauten baut, Zubehör einbaut und Abnahme und Eintragung übernimmt.
Die Startseite sagt es so: „Von der Probefahrt bis zum Umbau: Motorrad, Ausrüstung und Werkstatt aus einer Hand.“
Die eigenen Umbauten sind der Beweis, den kein Online-Händler kopieren kann.

## Operating Context

- Kein Online-Kauf von Motorrädern. Kontakt immer über Anrufen, WhatsApp oder E-Mail (vorausgefüllte Nachricht, `snippets/contact-box.liquid`).
- Reservierung nur für Gebrauchte und Vorführer, als Anfrage mit manueller Bestätigung.
- Events (Ausfahrten, Bike Night, Winter-Check-Tag) gehören zum Angebot.

## Capabilities and Constraints

- Shopify-Liquid-Theme ohne Build-Step; der Branch `main` ist mit dem Live-Theme verbunden, jeder Push geht live.
- Schriften self-hosted (DSGVO, kein Google-Fonts-CDN).
- Service-Bereich (Entscheidung 2026-10-27): Werkstatt und Über uns sind eigene, besondere Seiten. Die Service-Seite führt als
  Kaufweg durch Probefahrt, Inzahlungnahme, Finanzierung, Versicherung und Anmeldung & Lieferung, dazu Events und Standort & Kontakt.
  Finanzierung und Versicherung bekommen keine eigene Seite. Plan: `docs/plan-service-werkstatt.md`.
- Custom-Umbauten kommen mit dem Theme (Standardbilder in `assets/`) und sind im Theme-Editor pflegbar
  (Entscheidung 2026-10-26, aktualisiert; ADR in `docs/plan-service-werkstatt.md`).
- Je Umbau gibt es Name, Basis-Modell und eine Umbau-Liste. Story-Texte und Vorher-Bilder gibt es nicht.

## Brand Commitments

- Offizieller H-D-Vertragshändler: Marken und Logos nur im Rahmen der Händlerrechte (`docs/freigaben.md`).
- Ansprache per Du, Deutsch.
- Die visuelle Welt ist im Theme festgelegt (`docs/briefing.md`, `assets/tokens.css`) und gilt für neue Seiten weiter.

## Evidence on Hand

- Umbau-Fotos: `pics_to_use/custom-falk` (4), `pics_to_use/custom-lowriderst` (2), `pics_to_use/custom-police` (2); teils HEIC vom iPhone.
- Teamfoto-Collage `assets/powershop-team.webp` (acht Personen mit Namen und Rollen).
- Der Betreiber hat Einzelfotos, Teamfotos und Gebäudefotos; sie liegen noch nicht im Repo.
- Nicht erfinden: Umbau-Details, Teilelisten, Stunden, Preise, Kundenzitate, Namen von Besitzern, Auszeichnungen.

## Product Principles

1. Zeigen statt behaupten: echte Umbauten, echte Leute, echtes Gebäude.
2. Jede Service-Seite endet in einem direkten Draht (Anruf, WhatsApp, E-Mail).
3. Kenner sollen Details finden, Einsteiger sollen sich willkommen fühlen.
4. Fakten, Zusagen und Rechtliches gehen vor der Veröffentlichung über die Freigabeliste.

## Accessibility & Inclusion

WCAG 2.1 AA (Kontraste im Briefing belegt), Touch-Ziele mindestens 44 px, alles per Tastatur bedienbar,
`prefers-reduced-motion` wird respektiert, Animationen sind nie die einzige Art, an Inhalte zu kommen.
