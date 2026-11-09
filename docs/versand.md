# Versand

Stand 10.11.2026. Entscheidungen von Luca vom 10.11.: Gratis-Grenze 100 €, Standardversand 5,99 €, vorerst nur Deutschland,
Sperrgut-Versand auf Anfrage, Batterien und Öle nur Abholung.

## So ist es eingerichtet

Der Shop nutzt den **marktbasierten Versand** von Shopify: Die Tarife hängen am Markt, nicht mehr an Versandprofilen.

| Wo | Was |
|---|---|
| Shopify-Admin → Märkte → Deutschland → Versand | **Standard** 5,99 €, ab 100 € kostenlos. **Express** 9,99 €. Beide gelten nur für die Kollektion „Versand: Paket“. |
| Einstellungen → Versand und Zustellung → Abholung | Abholung im Power Shop, Burghölzle 15, 79576 Weil am Rhein, kostenlos, „gewöhnlich fertig in 24 Stunden“. Gilt für alle Artikel. |
| Produkt-Editor → Feld **„Versand“** (Metafeld `versand.klasse`) | Leer oder „Paket“: normaler Paketversand. „Sperrgut“: Versand auf Anfrage, an der Kasse nur Abholung. „Nur Abholung“: kein Versand. |
| Kollektionen „Versand: Sperrgut“, „Versand: Nur Abholung“, „Versand: Paket“ | Automatisch aus dem Feld „Versand“ (Motorräder immer in „Nur Abholung“). „Paket“ = alle Artikel außer den beiden anderen. **Nicht im Onlineshop veröffentlichen**, sie sind nur für die Versandregeln da. |
| Theme-Einstellungen → Versand, Rückgabe, Reservierung | „Versandkostenfrei ab“ 100 und „Versandkosten darunter“ 5,99 € steuern nur die Texte im Shop. Sie müssen zu den Tarifen im Markt passen. |

Ein Artikel braucht damit **nur einen Handgriff**: das Feld „Versand“. Shop-Texte (snippets/shipping-class.liquid) und Kasse folgen
von selbst. Neue Artikel sind ohne Eintrag Paket.

### Was der Kunde sieht

- **Paket**: „Versandkostenfrei ab 100 €“, im Versand-Akkordeon „darunter 5,99 €“, im Warenkorb der Balken bis 100 €.
- **Sperrgut**: Unter dem Kaufbereich „Sperrgut: Versand auf Anfrage · Versand anfragen“ (springt zur Kontakt-Box, Thema „Versand
  anfragen“, Nachricht mit Artikel und Frage nach PLZ und Ort vorausgefüllt). Lager-Status „Abholung im Power Shop“ bzw.
  „Abholung nach Lieferung (5–7 Werktage)“. Im Warenkorb ein Hinweis je Position und statt des Balkens „Abholung im Power Shop …“.
- **Nur Abholung**: „Kein Versand, nur Abholung“, sonst wie Sperrgut, ohne Versandanfrage.
- **Kasse**: Sperrgut und Abhol-Artikel bieten nur „Abholung“ an. Liegen sie zusammen mit Paket-Artikeln im Warenkorb, sagt die
  Kasse bei „Versand“: „Versand nicht verfügbar“, Abholung geht. Eine Bestellung kann nicht teils versendet, teils abgeholt werden.

### Eingestuft am 10.11. (225 Artikel)

**Sperrgut (176)**: alle Artikel der Produkttypen Räder (35), Reifen (23), Auspuffanlage (2), Lenker (15), Doppelsitzbänke (2),
Windschilder (78), Gepäckträger (14), Tour-Pak Gepäckträger (3), dazu einzeln die harten Koffer „Defender Seitenkoffer mit
Schnellentriegelung“, „FXLRST Seitenkoffer – Vivid Black“, „Verschließbare Leder-Seitenkoffer“ und die „Quarter Verkleidung –
Purple Abyss Denim“.

**Nur Abholung (49)**: Motorräder (38), Crate-Motoren (2), Batterien (1), Öle und Flüssigkeiten (6), dazu einzeln „H-D Original SYN
Blend Motoröl – Liter“ (Typ Ölwechsel-Kits) und „Harley-Davidson Genuine Motorradöl – SAE 20W50“ (Typ Service Parts).

**Bewusst Paket geblieben**, weil die Produkttypen gemischt sind:

- Trittbretter (34): überwiegend Einsätze, Abdeckungen, Halter und Montagekits, passen ins Paket.
- Tank und Konsole: nur Tankdeckel, Konsolenklappen und Blenden, keine Tanks.
- Schutzbleche: nur eine Sitzverkleidung aus Forged Carbon.
- Satteltaschen: Leder- und Überwurftaschen und Träger; nur die drei harten Koffer sind Sperrgut.
- Verkleidung: zwei Halterungskits; nur die Quarter-Verkleidung ist Sperrgut.
- Solo-Fahrersitz (1): passt ins Paket, „Sitzbänke“ meinte die Doppelsitzbänke.
- Ölwechsel-Kits und Werkzeug (Trichter, Wanne, Schlüssel) ohne Öl.

Ein Teil davon würde auch ins normale DHL-Paket passen (max. 120 × 60 × 60 cm, 31,5 kg), etwa Lenker, Sitzbänke, Gepäckträger
und kleine Windabweiser. Sie sind wie besprochen Sperrgut. Wer einzelne freigeben will, stellt das Feld „Versand“ auf „Paket“.

## Versand auf Anfrage: Ablauf

1. Anfrage kommt per WhatsApp oder E-Mail (Betreff „Versandanfrage: Artikel“).
2. Angebot beim Versanddienstleister einholen.
3. Im Admin unter Bestellungen → Entwürfe eine Bestellung anlegen: Artikel hinzufügen, unter „Versand“ eine eigene Versandposition
   mit dem Angebotspreis eintragen, Kundin oder Kunde auswählen.
4. „Rechnung senden“: Die Kundschaft bekommt einen Bezahllink. Nach der Zahlung ist es eine normale Bestellung.

## Versandrichtlinie (noch anlegen)

`/policies/shipping-policy` liefert noch 404. Claude konnte sie nicht anlegen (dem Zugang fehlt die Berechtigung für Rechtstexte).
**Im Admin unter Einstellungen → Richtlinien → Versandrichtlinie** diesen Text einfügen und vor dem Speichern prüfen:

> **Liefergebiet**
> Wir liefern zurzeit nur innerhalb Deutschlands.
>
> **Versandkosten für Paketversand**
> - Standardversand: 5,99 € je Bestellung, ab einem Bestellwert von 100 € kostenlos.
> - Expressversand: 9,99 € je Bestellung.
>
> Alle Preise inkl. MwSt.
>
> **Abholung im Power Shop**
> Du kannst jede Bestellung kostenlos bei uns abholen: Power Shop, Burghölzle 15, 79576 Weil am Rhein. Wähle dafür an der Kasse
> „Abholung“. Wir sagen dir Bescheid, sobald deine Bestellung bereitliegt.
>
> **Sperrgut: Versand auf Anfrage**
> Große Teile wie Räder, Reifen, Auspuffanlagen, Lenker, Sitzbänke, Windschilder, Gepäckträger, Seitenkoffer und Verkleidungen
> passen nicht in ein normales Paket. Beim Artikel steht dann „Sperrgut: Versand auf Anfrage“. Online bestellst du diese Artikel mit
> Abholung. Sollen wir sie dir schicken, frag den Versand bei uns an: Wir holen ein Angebot für deine Adresse ein und schicken dir
> die Bestellung mit den Versandkosten zum Bezahlen.
>
> **Artikel ohne Versand**
> Motorräder, Motoren, Batterien, Öle und andere Betriebsflüssigkeiten versenden wir nicht. Diese Artikel holst du bei uns ab.
>
> **Bestellungen mit Sperrgut oder Artikeln ohne Versand**
> Liegt Sperrgut oder ein Artikel ohne Versand im Warenkorb, ist an der Kasse nur Abholung möglich. Sollen die übrigen Artikel per
> Paket kommen, bestell sie getrennt.
>
> **Lieferzeit**
> Die Lieferzeit steht bei jedem Artikel: in der Regel 2–3 Werktage, wenn er auf Lager ist, und 5–7 Werktage, wenn wir ihn für
> dich bestellen.

Sobald sie angelegt ist, verlinken das Theme sie von selbst: „Versandkostenfrei ab 100 €“ in der Ankündigungsleiste, „zzgl.
Versandkosten“ unter den Preisen, „Alle Versandinfos“ im Versand-Akkordeon und „Versandinfos“ im Abholungs-Hinweis des Warenkorbs.

## Offen und zu beachten

- **Währungsformat**: Der Shop zeigt Preise als „€97,00“ (Einstellungen → Allgemein → Währungsformat), die Kasse und die Texte als
  „5,99 €“. Für Deutschland üblich ist `{{amount_with_comma_separator}} €`. Das Format gilt für den ganzen Shop, darum nicht nebenbei
  umgestellt.
- **Weiteres Gefahrgut**: Ausbesserungslack (eigener Produkttyp) und mögliche Spraydosen bei Reinigungsmaterialien oder
  Schmiermitteln sind Paket, nicht einzeln geprüft. Mit dem Versanddienstleister klären, was davon raus muss, dann das Feld
  „Versand“ setzen.
- **Schweiz (später)**: neuer Markt mit eigenem Versand-Tarif; die Kollektion „Versand: Paket“ dort genauso als Bedingung setzen.
  Zoll und Mehrwertsteuer (Ausfuhr ohne deutsche MwSt., Schweizer MWST bei Einfuhr) vorher klären.
- **Alte Versandprofile**: Das „Allgemeine Profil“ unter Einstellungen → Versand und Zustellung ist seit dem marktbasierten Versand
  nicht mehr maßgeblich. Dort stehen ebenfalls 5,99 € bis 99,99 € und kostenlos ab 100 € (am 10.11. per API angepasst, bevor klar war,
  dass der Markt gilt) sowie alte Zonen für EU (13,99 €) und International (19,99 €), die ohne Markt nicht greifen.
- **Test-Theme** „Versand-Test (Claude, kann weg)“ im Admin unter Onlineshop → Themes löschen.

## Getestet am 10.11. (Live-Checkout und Vorschau-Theme)

| Fall | Kasse | Shop |
|---|---|---|
| Paket 97 € | Standard 5,99 €, Express 9,99 €, Abholung kostenlos | Balken „Noch 3 € bis zum kostenlosen Versand“, „zzgl. 5,99 € Versand“ |
| Paket 111,20 € | Standard kostenlos, Express 9,99 € | „Standardversand kostenlos“ |
| Reifen (Sperrgut) | nur Abholung, kostenlos | Hinweis Sperrgut, „Versand anfragen“ wählt das Thema in der Kontakt-Box |
| Batterie (Nur Abholung) | nur Abholung | „Kein Versand, nur Abholung“ |
| Reifen + Aufkleber | „Versand nicht verfügbar“, Abholung geht | Abholungs-Hinweis mit „bestell sie getrennt“ |
