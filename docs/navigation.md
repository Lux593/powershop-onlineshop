# Navigation: Hauptmenü und Gruppen-Kollektionen

Stand 10.11.2026. Das Hauptmenü `main-menu` (Shopify-Admin › Inhalte › Menüs) hat drei Ebenen:

| Ebene | Beispiel | Im Megamenü | Im Handy-Menü |
|---|---|---|---|
| 1 Hauptpunkt | Herren | Punkt in der Leiste, Fußzeile „Alle Herren“ | Aufklapper, oben „Alle Herren“ |
| 2 Gruppe | Motorradbekleidung | Foto-Kachel als Link, darunter „Alle Motorradbekleidung“ und alle Links, ohne Aufklappen | Bildstreifen zum Aufklappen, darin „Alle Motorradbekleidung“ |
| 3 Link | Helme | Link unter der Kachel (alle Gruppen zugleich sichtbar, seit 10.11.2026) | Link im aufgeklappten Bildstreifen |

Der Link „Alle …“ einer Gruppe führt auf das Ziel ihres Ebene-2-Punkts. Bei Kollektionen heißt er „Alle …“, bei Seiten
„… im Überblick“ (z. B. „Werkstatt im Überblick“). Ohne Ziel (leer oder `#`) entfällt er.
Code: `snippets/overview-label.liquid`, `snippets/mega-menu.liquid`, `sections/header.liquid`.

## Gruppen-Kollektionen (angelegt am 10.11.2026)

Jede Gruppe zeigt auf eine eigene Kollektion. Diese besteht aus den Kollektionen ihrer Ebene-3-Links
(Quelle „Unterkollektionen“ im neuen Kollektionsmodell). Sie füllt sich deshalb von selbst, sobald Artikel in den
Unterkollektionen landen. Veröffentlicht sind sie wie die übrigen Kollektionen im Onlineshop und im Shop-Kanal.

| Gruppe | Kollektion | besteht aus |
|---|---|---|
| Herren › Bekleidung | `herren-bekleidung` | T-Shirts & Tops, Hemden, Sweatshirts, Freizeitjacken, Westen, Jeans & Hosen, Mützen & Caps (Herren) |
| Herren › Motorradbekleidung | `herren-motorradbekleidung` | Motorradjacken, Motorradhosen, Handschuhe, Stiefel & Schuhe, Regenbekleidung (Herren), Helme, Brillen |
| Damen › Bekleidung | `damen-bekleidung` | wie bei Herren, dazu Handtaschen (Damen) |
| Damen › Motorradbekleidung | `damen-motorradbekleidung` | wie bei Herren (Damen), Helme, Brillen |
| Herren/Damen › Kollektionen | `kollektionen` | Power Shop Kollektion, Willie G Skull, Realtree, Dickies, Factory Racing: **ohne Kinder und Sale** (Wunsch des Nutzers) |
| Teile & Zubehör › Komfort & Touring | `teile-komfort-touring` | die 6 Teile-Kollektionen der Gruppe |
| Teile & Zubehör › Optik & Custom | `teile-optik-custom` | die 6 Teile-Kollektionen der Gruppe |
| Teile & Zubehör › Technik & Pflege | `teile-technik-pflege` | die 7 Teile-Kollektionen der Gruppe |
| Accessoires › Mode-Accessoires | `accessoires-mode` | Gürtel & Geldbörsen, Schmuck, Brillen, Taschen & Rucksäcke, Socken, Halstücher & Bandanas |
| Accessoires › Zuhause & Garage | `accessoires-zuhause-garage` | Tassen & Gläser, Schilder & Deko, Aufkleber & Magnete |
| Accessoires › Biker-Extras & Geschenke | `accessoires-biker-extras-geschenke` | Poker Chip, Patches & Pins, Ride Bells, Geschenkgutscheine: **ohne Sale** |

Motorräder › Fahrzeuge und › Modellfamilien zeigen weiter auf `motorraeder`: beide Gruppen umfassen zusammen alle
Motorräder, eine eigene Kollektion bringt dort nichts. Die Service-Gruppen zeigen auf ihre Seiten.

## Pflege

- **Neuer Link in einer Gruppe** (Ebene 3): die neue Kollektion auch in der Gruppen-Kollektion unter „Unterkollektionen“
  ergänzen, sonst fehlt sie in „Alle …“.
- **Neue Gruppe** (Ebene 2): eine Kollektion aus ihren Unterkollektionen anlegen, veröffentlichen und im Menü als Ziel des
  Ebene-2-Punkts wählen. Zeigt die Gruppe nur auf den Hauptpunkt (z. B. `/collections/herren`), führt „Alle …“ dorthin.
- Vorher zeigten alle Gruppen (außer Service) per Web-Adresse auf ihren Hauptpunkt, z. B. Motorradbekleidung auf `/collections/herren`.
