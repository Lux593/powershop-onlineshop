# Performance Paket 1 („nichts sichtbar nachladen“): Einbau-Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** In Schienen, nach Umschaltern, unter Reveals und beim Warenkorb ist kein Nachladen mehr zu sehen, und Chrome holt wahrscheinliche
Ziel-Seiten vorab. Keine Animation und kein Effekt ändert sich.

**Architecture:** Fünf voneinander unabhängige Teile im vorhandenen Theme-Code, ohne neue Theme-Datei und ohne Bibliothek:
- gemeinsame Vorlade-Hilfen und der Schienen-Vorlader in `assets/theme.js`;
- die Umschalter in `assets/sections.js` und `theme.js`;
- der Reveal-Vorlader in `assets/motion.js`;
- der Warenkorb in `assets/cart.js` plus Liquid;
- die Speculation Rules als Inline-Skript in `layout/theme.liquid`.

Alle Vorlader stellen nur vorhandene `<img>` von `lazy` auf `eager` und starten frühestens nach `load` plus Leerlauf. Das Einblenden der
Kartenbilder hängt künftig an der Klasse `fade-on-load` statt am Attribut `loading`.

**Tech Stack:**
- Shopify Liquid (Online Store 2.0);
- Vanilla-JS im ES5-Stil des Themes (`PS.on`, kein Build);
- IntersectionObserver, Section Rendering API, Speculation Rules API;
- Shopify CLI (`theme dev`, `theme check`, `theme push --unpublished`), immer mit `--store powershop-online.myshopify.com`;
- Prüfen im Browser-Pane (Chrome) per `javascript_tool`, Safari im iOS-Simulator.

**Spec:** `docs/performance-paket-1-design.md`, vom Nutzer am 11.11.2026 abgenommen. Ausführende lesen Spec und Plan.

**Pfade:** Alles liegt unter `/Users/lucaarnoldi/Apps/PowerShop/powershop-onlineshop/`. Pfade ohne Präfix beziehen sich auf den Worktree
`performance-worktree/` (Theme-Repo). Jeder Shell-Befehl beginnt mit

```bash
P=/Users/lucaarnoldi/Apps/PowerShop/powershop-onlineshop; W=$P/performance-worktree; Q=$P/performance-qa
```

und nutzt nur diese absoluten Pfade (`git -C "$W"`, `--path "$W"`). Eine Shell startet oft im Haupt-Checkout. Ein `git commit` ohne `-C`
landete dort auf `main`.

Das unveröffentlichte Vorschau-Theme heißt „Performance Paket 1 Vorschau“. Seine ID (in Task 0 angelegt): **201624322392**.
- Vorschau im Pane: http://127.0.0.1:9294/ (Launch-Eintrag `performance-vorschau`).
- Am iPhone: `https://powershop-online.myshopify.com/?preview_theme_id=201624322392`.

## Global Constraints

- **Haupt-Checkout** `$P/powershop-onlineshop`:
  - Dort nie committen, stashen, resetten oder auschecken. Nur lesen, mit `git --no-optional-locks`.
  - Ausnahmen gibt es nur in Task 0:
    - Schritt 1: `fetch` und `worktree add`, sie schreiben nur in `.git`.
    - Schritt 5: die beiden unversionierten Dateien (Spec und Plan) nach `$Q` verschieben.
- Vor jedem Commit: `test "$(git -C "$W" rev-parse --abbrev-ref HEAD)" = claude/performance-paket-1`. Schlägt das fehl, nicht committen.
- **Push und Theme-Upload:**
  - Ein Push auf `main` geht sofort live. Er braucht das ausdrückliche Okay des Nutzers, nur als Fast-Forward, nie mit Force.
  - Nie `shopify theme push` aufs Live-Theme.
  - `theme push` nur mit `--unpublished` bzw. `--theme <Vorschau-ID>` und immer mit `--path "$W"` und `--nodelete`. Am 11.11. hat ein
    Push ohne `--path` im falschen Ordner Live-Dateien gelöscht.
- Fremde Vorschauen bleiben unberührt: nichts an `shopify-theme-dev` (Port 9292, Entwicklungs-Theme 199894139224) oder
  `ueber-uns-vorschau` (Port 9293) ändern oder dagegen starten. Geprüft wird nur im eigenen Vorschau-Theme auf Port 9294.
- Die Anti-Ziele der Spec (Abschnitt 2) sind Abnahmekriterien jedes Tasks:
  - keine Animation und kein Effekt ändert sich: Reveals, Staffel, Clip-Zoom, Scrub, Pinnen, Parallax, Filme, View Transitions,
    600-ms-Einblenden;
  - die ersten 4 Karten einer Kollektion bzw. Suche starten nie versteckt;
  - bis `load` kommt keine zusätzliche Anfrage dazu;
  - bei `saveData` und 2G/3G wird nicht vorgeladen;
  - versteckte Bilder kommen nie auf `eager`, außer den Ausnahmen `state`, `tab`, `chip` und `drawer` (siehe `data-pre`, Task 2);
  - kein Prefetch von Links mit Nebenwirkung;
  - keine Entscheidung des Nutzers wird zurückgedreht (Menübilder als JPG, Vorladen von Megamenü und Schublade, Galerie mit weißem
    Grund).
- Bilder werden nur über die vorhandenen `<img>` gesteuert: `loading`, `decode()`, beim Warenkorb ein `new Image()`. Kein
  `<link rel="preload">`, kein `fetchpriority`, keine neue Asset-Datei.
- **Code-Stil** wie im Theme:
  - ES5: `var`, `function`, keine Pfeilfunktionen, kein `const`;
  - Module über `PS.on`;
  - Kommentare auf Deutsch, mit Begründung bei bewussten Entscheidungen.
  - Das Prüfgerüst darf modernes JS nutzen, es läuft nur im Chrome des Pane.
- Commit-Nachrichten auf Deutsch, mit der Zeile `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` am Ende.
- Jeder Task endet mit zwei Prüfungen:
  - `shopify theme check --path "$W"` ohne Meldung, die nicht schon in `$Q/theme-check-vorher.txt` steht (Zeilennummern dürfen sich
    verschieben);
  - die Prüfungen des Tasks aus `docs/qa/performance-checks.js` ohne Fehler.
- **Messen und Prüfen im Pane:**
  - Nur mit dem Vorschau-Tab im Vordergrund (`tabs_select`). Sonst drosselt Chrome auf ca. 1,5 Bilder/s. `PK.run` prüft das.
  - Alles, was vom Laden abhängt (`rail.swipe`, `reveal.ready`, alle Messungen unter `PK.m`), läuft in einem neuen Tab. Lädt man im
    selben Tab neu, kommen Lazy-Bilder aus dem Memory-Cache.
  - `javascript_tool` bricht nach 45 s ab. Lange Läufe deshalb nach Präfix teilen, oder das Ergebnis in `window` ablegen und in einem
    zweiten Aufruf abholen.
  - Handy heißt `resize_window` mit Preset `mobile` (Chrome mit Touch), danach neu laden.
  - Safari nur im iOS-Simulator. Dort `simctl` direkt aus dem CoreSimulator-Framework nutzen, `xcrun simctl` hängt.
  - Welches Theme eine Seite zeigt, sagt `Shopify.theme.role`: `main` ist live, sonst Vorschau. Der Vorschau-Link kann ein
    Vorschau-Cookie setzen, dann zeigt auch die Live-Adresse im selben Pane die Vorschau.
  - Der Dev-Server beantwortete am 11.11. Section-Abrufe (`?section_id=`) aus dem Browser mit 404, aus Python mit 200. Was davon
    abhängt, läuft dann über den Vorschau-Link (Task 0, Schritt 2).
- Prüfungen am Warenkorb ändern den echten Warenkorb des Test-Browsers. Es entsteht keine Bestellung, und die Prüfung stellt den
  Warenkorb danach wieder her.
- Dem Nutzer immer sagen, ob etwas live ist oder nur in der Vorschau.

## Review Focus

1. **Veralteter Warenkorb.** Eine Seite wurde vor einem Hinzufügen vorab geholt (Chrome) oder kommt per „Zurück“ aus dem bfcache.
   - Erwartet: Zähler und Drawer zeigen nach spätestens einer Abfrage den echten Stand.
   - Bei gleichem Stand gibt es keine Abfrage.
   - Geprüft durch `cart.sync` (Task 4) und den Ablauf „Warenkorb-Test“ (Task 7).
2. **Antwort ohne Drawer-Section.** Zum Beispiel greift eine App in die Antwort ein, die Section fehlt, oder ein Drawer hat kein
   `data-count`.
   - Erwartet: Rückfall auf `/cart.js`, der Zähler stimmt, es kommt genau ein `ps:cart`.
   - Geprüft durch `cart.fallback` (Task 4).
3. **Bild lädt beim Sichtbarwerden noch.** Zum Beispiel bei sehr schnellem Wischen, über Mobilfunk oder nach einem Baureihen-Chip am
   iPhone.
   - Erwartet: anthrazitfarbene Fläche, dann 600-ms-Einblenden wie heute, nie ein hart hineinspringendes Bild.
   - Geprüft durch `fade.rule` (Task 1) und die Sichtprüfung in Task 8.
4. **Datensparen oder langsame Verbindung.**
   - Erwartet: kein Vorlader und keine Speculation Rules, alles läuft wie heute. Am iPhone greift diese Bremse nie, weil Safari
     `navigator.connection` nicht kennt. Das ist bekannt und so gewollt.
   - Geprüft durch `rail.slownet` und `rail.slow` (Task 2).
5. **Versteckte Inhalte.** Gemeint sind geschlossene Dialoge, das Megamenü, eine andere Baureihe, das Zweitbild am Handy und die
   Reiter-Karten ab der dritten.
   - Erwartet: Die neuen Vorlader laden sie nie, außer den Ausnahmen `state`, `tab`, `chip` und `drawer`.
   - Geprüft durch `pre.hidden` (Task 2) und `alt.touch` (Task 6).

---

## Dateien

| Datei | Neu / geändert | Verantwortung |
|---|---|---|
| `assets/theme.js` | geändert | Hilfen `PS.slowNet`, `PS.afterLoad`, `PS.eager`, `PS.eagerCards`, `PS.whenLoaded`. Dazu `railStep()`, der Schienen-Vorlader und das Vorladen der Reiter |
| `assets/sections.js` | geändert | Showroom: anderer Zustand im Leerlauf, Baureihen-Chips bei Absicht |
| `assets/motion.js` | geändert | Vorlader für Bilder unter Reveals |
| `assets/cart.js` | geändert | eine Anfrage pro Hinzufügen, Vorschaubild beim Klick, Zeilenbilder, Abgleich des Warenkorbs |
| `snippets/bike-card.liquid`, `snippets/product-card.liquid` | geändert | Klasse `fade-on-load`. Die Produktkarte bekommt zusätzlich `data-add-thumb` an den Quick-Add-Knöpfen |
| `assets/shop.css` | geändert | Einblend-Regel an `fade-on-load` |
| `assets/components.css` | geändert | Zweitbild nur mit Hover ab 1024 px |
| `sections/cart-drawer.liquid` | geändert | `data-count` und `data-sig` am `<dialog>` |
| `snippets/cart-line.liquid` | geändert | `widths: '176'` |
| `snippets/pdp-options.liquid` | geändert | `"thumb"` je Variante im Produkt-JSON |
| `layout/theme.liquid` | geändert | Speculation Rules (Inline-Skript im `head`) |
| `docs/qa/performance-checks.js` | neu | Prüfgerüst `PK` und Messungen `PK.m` |
| `docs/performance-paket-1-design.md`, `docs/plan-performance-paket-1.md` | neu im Repo | Spec und dieser Plan |
| `docs/motion-api.md` | geändert | Abschnitt „Vorladen“ |
| `$P/.claude/launch.json` (nicht im Repo) | geändert | Eintrag `performance-vorschau` |

## Entscheidungen zu Spec Abschnitt 6 („Dem Builder überlassen“)

Diese Punkte hat der Plan festgelegt, nicht der Nutzer:
- **Vorlauf:**
  - Schienen beim Annähern: 1 Fensterhöhe.
  - Schienen seitlich: `max(Schienenbreite, 3 Kartenschritte)`.
  - Reveals: 150 % der Fensterhöhe nach unten.
- **Mengen:**
  - anderer Showroom-Zustand: 3 Karten;
  - Baureihen-Chip: 3 Karten;
  - Neuheiten mit Maus: alle Karten des Reiters;
  - Neuheiten am Touch-Gerät: 2 Karten je anderem Reiter.
- **Kein `fetchpriority`.** Chrome lädt Bilder außerhalb des Fensters ohnehin mit niedriger Priorität und hebt sichtbare an.
- **Leerlauf nach `load`:** `requestIdleCallback` mit `timeout: 2000`, ohne `requestIdleCallback` 300 ms. `product.js` wartet dort
  1200 ms. Am iPhone ist man sonst womöglich schneller am Showroom, als vorgeladen wird.
- **Einblend-Merkmal ist die Klasse `fade-on-load`:**
  - `class` ist an `image_tag` im Theme erprobt, ein `data-`-Parameter nicht.
  - `ps-fade` ist schon der Name eines Keyframes in `assets/motion.css`.
- **176-px-URL fürs Vorschaubild:**
  - Liquid erzeugt sie mit demselben Filter wie `cart-line.liquid`, im Produkt-JSON (`"thumb"`) und am Quick-Add-Knopf
    (`data-add-thumb`).
  - `cart-line.liquid` bekommt `widths: '176'`, damit das `srcset` sicher nur diese eine URL enthält.
- **Fingerabdruck des Warenkorbs:** `md5` aus Menge, Summe und `Schlüssel:Menge` je Position, als `data-sig` am Drawer. Der letzte
  Stand liegt in `sessionStorage['ps:cart-sig']`.
- **Regel nach `ps:cart` als neues `<script>` einsetzen, nicht klonen.** Ein geklontes Skript übernimmt „already started“ und würde nicht
  neu ausgewertet.
- **`sizes` der Bike-Karte bleibt.** Am iPhone (3×) braucht die ca. 300 px breite Karte 900 px. Gewählt würde also weiter 1200w, es gibt
  keinen Gewinn.
- **Ein Commit pro Task, Reihenfolge wie unten.** Das Einblend-Merkmal kommt zuerst: Sonst blendete ein auf `eager` gestelltes, noch
  ladendes Bild zwischendurch nicht mehr ein.

---

### Task 0: Arbeitsplatz, Vorschau, Prüfgerüst, Ausgangsmessung

**Files:**
- Create: `docs/qa/performance-checks.js`.
- Create: `docs/performance-paket-1-design.md` und `docs/plan-performance-paket-1.md`, beide aus dem Haupt-Checkout übernommen.
- Außerhalb des Repos: `$Q` mit den Vergleichsständen (nie committen) und der Eintrag `performance-vorschau` in
  `$P/.claude/launch.json`.

**Interfaces:**
- Produces: `window.PK = { checks: {}, add(name, fn, when?), run(prefix?) }`.
  - Vertrag wie `UU` in `docs/qa/ueber-uns-checks.js:82–125`: `fn` gibt Fehlertexte als `string[]` zurück, `when` einen Grund zum
    Überspringen.
  - Zusätzlich scheitert `run` sofort mit „Pane verdeckt“, wenn `requestAnimationFrame` in 500 ms weniger als 30-mal kommt.
- Produces, globale Hilfen:
  - `wait(ms)`, `frames(n = 2)` und `go(y)` wie in `ueber-uns-checks.js`.
  - `until(fn, ms = 6000): Promise<boolean>` fragt `fn()` alle 100 ms ab. Es gibt `true`, sobald `fn()` wahr ist, sonst nach `ms`
    `false`.
  - `near(el): Promise<void>` scrollt `el` eine halbe Fensterhöhe unter den unteren Fensterrand und wartet 1500 ms.
  - `into(el): Promise<void>` scrollt `el` 100 px unter den oberen Rand, dann `frames(2)`.
  - `go`, `near` und `into` setzen `window.pkMoved = true`. Das bleibt beim erneuten Einspielen stehen und fällt erst beim Neuladen
    weg.
  - `imgs(card): HTMLImageElement[]`: die Bilder der Karte ohne `.pcard__img--alt`.
  - `ready(img): boolean`: `img.complete && img.naturalWidth > 0`.
  - `pre(img): { why: string, at: number } | null` liest `data-pre` (Format „`why ms`“, Task 2).
  - `mouse(): boolean`: `matchMedia('(hover: hover) and (pointer: fine)').matches`.
  - `entries(re): PerformanceResourceTiming[]`: die Resource-Timing-Einträge, deren URL `re` trifft.
  - `room(): { s, rail, cards } | null` gibt die Showroom-Section, ihre `.rail` und alle `.bcard`.
  - `inState(card): boolean` wie `assets/sections.js:20–22`.
  - `neu(): { list, tabs, panel(tab) } | null` gibt die Reiter-Liste, deren Panels `.pcard` enthalten (Neuheiten).
  - Gründe zum Überspringen für `when`:
    - `needMotion()`: leer mit `html.has-motion`, sonst „nur mit has-motion“;
    - `fresh()`: leer, solange `!window.pkMoved && scrollY === 0`, sonst „nur frisch geladen“.
- Produces, Messungen unter `PK.m`. Sie werden vor und nach dem Einbau gleich benutzt.
  - `swipe(rail, speed): Promise<{ seen, ready, late: string[] }>`:
    - `into(rail)`, Scroll-Snap aus, dann `scrollLeft` per rAF mit `speed` px/s bis zum Ende;
    - jede Karte mit Box zählt einmal, sobald ihre linke Kante im sichtbaren Bereich ist, und gilt als `ready`, wenn dann alle
      `imgs(card)` fertig sind;
    - danach Snap zurück und `scrollLeft = 0`.
  - `add(trigger): Promise<{ ms, adds, cartJs, events, thumbReady, thumbPreloaded, count, serverCount }>`:
    - `trigger` ist ein Knopf `[data-add-variant]` (wird geklickt) oder ein Formular `form[data-product-form]` (`requestSubmit()`);
    - vorher merkt sich `add` die Menge der Variante per `/cart.js`;
    - `ms` misst vom Klick, bis `#cart-drawer` offen ist (MutationObserver auf `open`);
    - `events` zählt die `ps:cart` bis dahin;
    - `thumbReady`: Beim Öffnen ist das Bild der Zeile mit `[data-key^="<Varianten-ID>:"]` fertig;
    - `thumbPreloaded`: Der Resource-Timing-Eintrag dieses Bildes begann vor dem `responseEnd` von `/cart/add.js`;
    - `adds` und `cartJs` zählen die Einträge `/cart/add.js` und `/cart.js` seit dem Klick;
    - danach kommt `serverCount` per `/cart.js` und `count` aus `[data-cart-count]`;
    - zum Schluss setzt `add` die Menge per `PS.cart.change` zurück und schließt den Drawer.
  - `reveals(speed): Promise<{ revealed, ready, late: string[] }>`:
    - scrollt mit `speed` px/s von oben bis unten;
    - jedes `[data-reveal]` oder `[data-stagger]` mit Bildern zählt, sobald es `.is-in` bekommt;
    - es gilt als `ready`, wenn seine Bilder mit Box dann fertig sind.
  - `cardImages(): { main, alt }` zählt die `.pcard__img` mit `currentSrc`, getrennt nach Haupt- und Zweitbild (nach einem Lauf von
    `reveals`).
  - `jank(speed): Promise<{ p99, max }>` gibt die Abstände der rAF-Bilder in ms beim Scrollen.
  - `beforeLoad(): { img, other }` zählt die Resource-Timing-Einträge mit `startTime < loadEventEnd`.

- [ ] **Step 1: Worktree anlegen**

```bash
git -C "$P/powershop-onlineshop" --no-optional-locks fetch origin
git -C "$P/powershop-onlineshop" worktree add "$W" -b claude/performance-paket-1 origin/main
mkdir -p "$Q"
```

Expected: `git -C "$W" status -sb` zeigt `claude/performance-paket-1` ohne Änderungen.

- [ ] **Step 2: Vorschau-Theme anlegen und starten**

1. `shopify theme list --store powershop-online.myshopify.com --name "Performance Paket 1 Vorschau"` ausführen.
   - Gibt es das Theme schon, dessen ID nehmen.
   - Sonst das Theme im Hintergrund anlegen (ca. 53 MB):
     `shopify theme push --store powershop-online.myshopify.com --unpublished --theme "Performance Paket 1 Vorschau" --path "$W" --nodelete --json`.
2. Die ID in `$Q/vorschau-id.txt` notieren.
3. In `$P/.claude/launch.json` einen Eintrag `performance-vorschau` anlegen, gebaut wie `ueber-uns-vorschau`: `--path` ist `$W`
   absolut, dazu `--theme <ID>`, `--port 9294` und `"port": 9294`.
4. Mit `preview_start` starten, nie per Bash. Die Datei liegt in `$P/.claude/`. Läuft die Sitzung in einem anderen Ordner und findet den
   Eintrag nicht, die Sitzung mit Arbeitsordner `$P` starten.
5. Im Pane zwei Dinge sondieren und das Ergebnis in `$Q/vorschau-id.txt` dazuschreiben:
   - `(await fetch('/?sections=cart-drawer')).status`. Bei 404 laufen alle `cart.*`-Prüfungen und die Warenkorb-Messung über den
     Vorschau-Link, dort antwortet Shopify selbst. Vorher und nachher am selben Ort messen.
   - `!!(HTMLScriptElement.supports && HTMLScriptElement.supports('speculationrules'))`. Bei `false` kann der Pane Task 7 nicht
     prüfen (siehe dort).

Expected: `http://127.0.0.1:9294/` zeigt die Startseite mit Showroom.

- [ ] **Step 3: Prüfgerüst schreiben**

`docs/qa/performance-checks.js` legt `PK`, die Hilfen und `PK.m` an, wie unter Interfaces beschrieben.
- Aufbau wie `ueber-uns-checks.js`: eine IIFE, die `window.PK` und die Hilfen an `window` hängt (dort `window.px`). Die Datei darf
  mehrfach laufen, denn die `const` der Task-Abschnitte stehen in der IIFE. Sie wird nicht ausgeliefert.
- Benutzung: den Inhalt plus `await PK.run('…')` in einem Aufruf von `javascript_tool` schicken. Nach jedem Neuladen neu einspielen.
- Die Prüfungen der Tasks kommen in diese Datei, ein Abschnitt je Task.

Expected:
- Mit `PK.add('pk.leer', () => [])` meldet `await PK.run('pk')` eine bestandene Prüfung.
- `await PK.m.swipe(room().rail, 4000)` liefert Zahlen.

- [ ] **Step 4: Vergleichsstände sichern**

1. `shopify theme check --path "$W" > "$Q/theme-check-vorher.txt"`.
2. Ausgangsmessung: jede Messung in einem neuen Tab, die Warenkorb-Messung am Ort aus Schritt 2. Das Ergebnis kommt als Tabelle nach
   `$Q/messung-vorher.md`.

| Messung | Gerät | Seite |
|---|---|---|
| `PK.m.swipe(room().rail, 4000)` | Desktop 1440 × 900 | `/` |
| `PK.m.swipe(room().rail, 3000)` und `PK.m.swipe(<Neuheiten-Schiene>, 3000)` | Handy | `/` |
| `PK.m.add(<erster Quick-Add-Knopf>)`, 3-mal, Median von `ms` | Desktop | Bekleidungs-Kollektion mit Quick-Add, z. B. `/collections/herren` (vorher prüfen, ob es `[data-add-variant]` gibt) |
| `PK.m.reveals(2500)` | Desktop und Handy | `/` und dieselbe Kollektion |
| `PK.m.cardImages()` nach `PK.m.reveals(2500)` | Handy | Kollektion |
| `PK.m.jank(2500)` | Desktop | `/` |
| `PK.m.beforeLoad()` | Desktop und Handy | `/` und Kollektion |

Expected: Die Werte ähneln der Analyse vom 11.11.
- Showroom: ca. 3 von 26 Karten fertig.
- Warenkorb: 0,56–0,96 s, mit `cartJs` 1.

Weichen sie stark ab, erst klären, warum.

- [ ] **Step 5: Spec und Plan ablegen und committen**

```bash
cp "$P/powershop-onlineshop/docs/performance-paket-1-design.md" "$P/powershop-onlineshop/docs/plan-performance-paket-1.md" "$W/docs/"
```

Die Vorschau-ID aus `$Q/vorschau-id.txt` in `$W/docs/plan-performance-paket-1.md` unter „Pfade“ eintragen, dann:

```bash
git -C "$W" add docs/qa/performance-checks.js docs/performance-paket-1-design.md docs/plan-performance-paket-1.md
git -C "$W" commit -m "Performance Paket 1: Spec, Plan und Prüfgerüst"
mv "$P/powershop-onlineshop/docs/performance-paket-1-design.md" "$P/powershop-onlineshop/docs/plan-performance-paket-1.md" "$Q/"
```

Das Verschieben hält den Haupt-Checkout sauber. Lägen die Dateien dort unversioniert, bräche später ein `git pull` ab.

### Task 1: Einblenden am eigenen Merkmal

**Files:**
- Modify: `snippets/bike-card.liquid:28` (Zuweisung) und `:75` (`class`).
- Modify: `snippets/product-card.liquid:15` und `:59`.
- Modify: `assets/shop.css:502–505`.
- Test: `docs/qa/performance-checks.js`, Prüfungen `fade.*`.

**Interfaces:**
- Produces: die Klasse `fade-on-load` an genau den Kartenbildern, die Liquid lazy ausgibt.
  - Das sind das Bild der Bike-Karte (`.bcard__media img`) und das Hauptbild der Produktkarte (`.pcard__img`).
  - Nie bekommt sie `.pcard__img--alt`.
  - Eager ausgegebene Karten bekommen sie auch nicht. Das sind die ersten 4 der Kollektion und der Suche.
- Produces: `.has-motion .pcard__img.fade-on-load:not(.is-loaded), .has-motion .bcard__media img.fade-on-load:not(.is-loaded) { opacity: 0; }`.
  - Sie ersetzt die beiden Regeln mit `[loading="lazy"]`.
  - Transitions und das inline `onload` bleiben.

- [ ] **Step 1: Prüfungen schreiben**

```js
PK.add('fade.rule', () => {
  const box = document.body.appendChild(document.createElement('div')), f = [];
  box.innerHTML = '<div class="pcard"><img class="pcard__img fade-on-load" loading="eager"><img class="pcard__img" loading="lazy"></div>' +
    '<div class="bcard"><div class="bcard__media"><img class="fade-on-load" loading="eager"></div></div>';
  const [a, b, c] = box.querySelectorAll('img'), op = (i) => getComputedStyle(i).opacity;
  box.querySelectorAll('img').forEach((i) => { i.style.transition = 'none'; });
  if (op(a) !== '0' || op(c) !== '0') f.push('fade-on-load ohne is-loaded ist nicht versteckt (auch bei eager)');
  if (op(b) !== '1') f.push('Regel hängt noch an loading="lazy"');
  a.classList.add('is-loaded');
  if (op(a) !== '1') f.push('is-loaded zeigt das Bild nicht');
  box.remove();
  return f;
}, needMotion);
PK.add('fade.marker', () => [...document.querySelectorAll('.pcard__img, .bcard__media img')].flatMap((i) => {
  const has = i.classList.contains('fade-on-load');
  if (i.classList.contains('pcard__img--alt')) return has ? ['Zweitbild mit fade-on-load'] : [];
  const lazy = i.getAttribute('loading') === 'lazy' || !!pre(i); // so von Liquid ausgegeben
  return lazy === has ? [] : [(has ? 'eager mit' : 'lazy ohne') + ' fade-on-load: ' + i.src.slice(-50)];
}));
```

- [ ] **Step 2: Prüfungen laufen lassen und Scheitern sehen**

Run: `await PK.run('fade')` auf `/` und auf der Kollektion, Desktop 1440 × 900.
Expected:
- `fade.rule` meldet 2 Fehler: „nicht versteckt“ und „Regel hängt noch an loading“.
- `fade.marker` meldet jede lazy Karte.

- [ ] **Step 3: Umsetzen**

- **`bike-card.liquid`:** `img_class` ist `'fade-on-load'`, wenn `img_loading == 'lazy'`, sonst leer. Dazu `image_tag: class: img_class, …`.
  Ein leeres `class=""` schadet nicht.
- **`product-card.liquid`:** `img_class` ist `'pcard__img fade-on-load'` bzw. `'pcard__img'`, in Zeile 59 `class: img_class`.
- **`shop.css`:** Die Regel umschreiben und den Kommentar 502–503 nachziehen. Er nennt:
  - warum die Regel an einer Klasse statt am Attribut hängt: Die Vorlader stellen Bilder auf `eager`, und ein noch ladendes Bild soll
    weiter einblenden;
  - dass vorgeladene, fertige Bilder ohne sichtbares Einblenden erscheinen. So hat es der Nutzer am 11.11. entschieden.

- [ ] **Step 4: Prüfungen grün**

Run: `await PK.run('fade')`
- auf `/`;
- auf der Kollektion: die ersten 4 Karten ohne Klasse, ab der fünften mit;
- auf einer Bike-Produktseite (Bike-Schiene).

Jeweils Desktop und Handy.
Expected: keine Fehler. Beim Scrollen blenden die Karten ein wie vorher.

- [ ] **Step 5: Theme Check und Commit**

```bash
git -C "$W" add snippets/bike-card.liquid snippets/product-card.liquid assets/shop.css docs/qa/performance-checks.js
git -C "$W" commit -m "Performance: Einblenden der Kartenbilder an eigener Klasse statt an loading=lazy"
```

### Task 2: Vorlade-Hilfen und Schienen

**Files:**
- Modify: `assets/theme.js`:
  - die Hilfen hinter Zeile 41;
  - im Block „Schienen“ (230–259) `step()` als gemeinsame Funktion `railStep(rail)` herauslösen;
  - dahinter ein neuer Block „Schienen vorladen“.
- Test: Prüfungen `rail.*` und `pre.hidden`.

**Interfaces:**
- Produces, in `theme.js`, für alle später geladenen Skripte:
  - `PS.slowNet(): boolean`: `true` bei `navigator.connection` mit `saveData` oder mit `effectiveType` passend zu `/(^|-)[23]g$/`
    (wie `assets/header.js:93`). Ohne `navigator.connection` (Safari) `false`. Es liest `navigator.connection` bei jedem Aufruf neu, die
    Prüfungen ersetzen es zur Laufzeit.
  - `PS.afterLoad(fn): void`: nach dem `load`-Ereignis im Leerlauf, also `requestIdleCallback(fn, { timeout: 2000 })`, sonst
    `setTimeout(fn, 300)`. Ist `load` schon vorbei, gilt nur der Leerlauf.
  - `PS.eager(img, why): boolean`:
    - Nur bei `img.loading === 'lazy'` setzt es `img.loading = 'eager'` und
      `img.dataset.pre = why + ' ' + Math.round(performance.now())` und gibt `true` zurück. Sonst `false`, ohne etwas zu ändern.
    - `data-pre` dient Prüfung und Fehlersuche.
    - `why` ist `rail`, `state`, `chip`, `tab`, `drawer` oder `reveal`.
  - `PS.eagerCards(cards, why): number`: gibt bei `PS.slowNet()` `0` zurück, ohne etwas zu tun. Sonst ruft es `PS.eager` für jedes
    `img[loading="lazy"]` der Karten außer `.pcard__img--alt` und gibt die Zahl der umgestellten Bilder zurück.
  - `PS.whenLoaded(imgs, ms): Promise<void>` ist erfüllt, sobald jedes Bild `complete` ist oder `load`/`error` meldet, spätestens
    nach `ms`.
  - Das Ereignis `ps:rail-near` (blubbert) kommt an der Schiene, einmal, sobald sie das erste Mal nah ist.
- Die lokalen Hilfen in `product.js` und `header.js` bleiben, wie sie sind.

- [ ] **Step 1: Prüfungen schreiben**

```js
PK.add('rail.api', () => ['slowNet', 'afterLoad', 'eager', 'eagerCards', 'whenLoaded']
  .filter((k) => typeof PS[k] !== 'function').map((k) => 'PS.' + k + ' fehlt'));
PK.add('rail.slownet', () => {
  const f = [];
  try {
    [[{ saveData: true }, true], [{ effectiveType: '3g' }, true], [{ effectiveType: 'slow-2g' }, true],
     [{ effectiveType: '4g' }, false], [undefined, false]].forEach(([c, want]) => {
      Object.defineProperty(navigator, 'connection', { configurable: true, value: c });
      if (PS.slowNet() !== want) f.push(JSON.stringify(c) + ' ergibt ' + !want);
    });
  } finally { delete navigator.connection; }
  return f;
});
PK.add('rail.far', async () => {
  await wait(1500);
  return [...document.querySelectorAll('.rail, .product-grid--rail')]
    .filter((r) => r.getBoundingClientRect().top > 2.5 * innerHeight && r.querySelector('img[data-pre]'))
    .map((r) => 'zu früh vorgeladen: ' + (r.id || r.className));
}, fresh);
PK.add('rail.ahead', async () => {
  const f = [];
  for (const rail of [...document.querySelectorAll('.rail')].filter((r) => r.getClientRects().length)) {
    await near(rail);
    const right = rail.getBoundingClientRect().right;
    const cards = [...rail.children].filter((c) => c.getClientRects().length && imgs(c).length);
    const vis = cards.filter((c) => c.getBoundingClientRect().left < right).length;
    const eager = cards.filter((c) => imgs(c).every((i) => i.loading === 'eager')).length;
    const want = Math.min(cards.length, vis + 3);
    if (eager < want) f.push(`#${rail.id}: ${eager} Karten vorgeladen, erwartet mindestens ${want}`);
    if (cards.length > vis + 8 && eager === cards.length) f.push(`#${rail.id}: alle ${eager} Karten auf einmal`);
  }
  return f;
});
PK.add('rail.neuheiten', async () => {
  const grid = document.querySelector('[role="tabpanel"]:not([hidden]) .product-grid--rail');
  await near(grid);
  const cards = [...grid.children], eager = cards.filter((c) => imgs(c).every((i) => i.loading === 'eager')).length;
  return eager >= Math.min(cards.length, 4) ? [] : [`Neuheiten: ${eager} Karten vorgeladen`];
}, () => innerWidth >= 1024 ? 'nur unter 1024 px' : document.querySelector('.product-grid--rail') ? '' : 'keine Neuheiten');
PK.add('pre.hidden', () => [...document.querySelectorAll('img[data-pre]')]
  .filter((i) => !i.getClientRects().length && !['state', 'tab', 'chip', 'drawer'].includes(pre(i).why))
  .map((i) => `verstecktes Bild vorgeladen (${pre(i).why}): ${i.src.slice(-50)}`));
PK.add('rail.afterload', () => {
  const end = performance.getEntriesByType('navigation')[0].loadEventEnd;
  return [...document.querySelectorAll('img[data-pre]')].filter((i) => pre(i).at < end).map((i) => 'vor load: ' + i.src.slice(-50));
});
PK.add('rail.slow', async () => { // Kopie der Showroom-Schiene: einmal mit saveData, einmal ohne als Gegenprobe
  const probe = async (save) => {
    const rail = room().rail, clone = rail.cloneNode(true);
    clone.id = rail.id + '-pk';
    clone.querySelectorAll('img').forEach((i) => { i.setAttribute('loading', 'lazy'); i.removeAttribute('data-pre'); });
    if (save) Object.defineProperty(navigator, 'connection', { configurable: true, value: { saveData: true } });
    try {
      rail.after(clone); PS.scan(clone); await near(clone); await wait(1500);
      return !!clone.querySelector('img[data-pre]');
    } finally { clone.remove(); delete navigator.connection; }
  };
  const f = [];
  if (await probe(true)) f.push('bei saveData vorgeladen');
  if (!await probe(false)) f.push('Gegenprobe: die Kopie lädt auch ohne saveData nicht vor, die Prüfung greift nicht');
  return f;
}, () => room() ? '' : 'kein Showroom');
PK.add('rail.swipe', async () => { // neuer Tab (Memory-Cache)
  const { rail } = room();
  await near(rail);
  const r = await PK.m.swipe(rail, mouse() ? 4000 : 3000);
  return r.ready >= 0.9 * r.seen ? [] : [`nur ${r.ready} von ${r.seen} Karten fertig: ${r.late.slice(0, 3).join(', ')}`];
}, () => room() ? '' : 'kein Showroom');
```

- [ ] **Step 2: Prüfungen laufen lassen und Scheitern sehen**

Run: in einem neuen Tab auf `/`, Desktop. Erst `await PK.run('rail.far')`, dann `await PK.run('rail')` und `await PK.run('pre')`.
Expected:
- `rail.api` meldet 5 Fehler.
- `rail.slownet` scheitert, weil `PS.slowNet` fehlt.
- `rail.ahead` meldet je Schiene zu wenige Karten.
- `rail.swipe` kommt auf ca. 3 von 26 Karten.
- `rail.slow` scheitert nur an der Gegenprobe.
- `rail.far`, `pre.hidden` und `rail.afterload` bestehen schon, weil noch nichts vorlädt. Das ist richtig so, sie sichern die
  Anti-Ziele.

- [ ] **Step 3: Umsetzen**

- Die Hilfen kommen hinter `PS.prefersReducedMotion` (Zeile 41), mit den Verträgen wie unter Interfaces.
- `railStep(rail)` ist der heutige Inhalt von `step()` (Zeilen 240–246) als Funktion im Modul. Der Pfeil-Block ruft sie auf.
- Neuer Block „Schienen vorladen“: `PS.on('.rail, .product-grid--rail', …)`. Ohne `IntersectionObserver` passiert nichts.
  1. **Annähern:** Nach `PS.afterLoad`, bei `PS.slowNet()` nichts. Sonst beobachtet ein Beobachter aufs Fenster mit
     `rootMargin: '100% 0px 100% 0px'` die Schiene. Beim ersten Treffer:
     - den Beobachter trennen;
     - Schritt 2 starten;
     - `ps:rail-near` an der Schiene melden.
  2. **Wischen und Pfeile:** Ein Beobachter mit `root: rail` und `rootMargin: '0px ' + m + 'px 0px ' + m + 'px'`, dabei gilt
     `m = Math.max(rail.clientWidth, 3 * railStep(rail))`. Er beobachtet jedes Kind der Schiene.
     - Trifft eine Karte: `PS.eagerCards([karte], 'rail')`, dann die Karte abmelden.
     - Versteckte Karten (`display: none` oder `hidden`) haben keine Box. Sie treffen erst, wenn sie sichtbar werden.
  - Der Kommentar nennt die Gründe für zwei Entscheidungen:
    - Schritt 2 startet erst nach Schritt 1, weil ein Beobachter mit der Schiene als `root` die Lage auf der Seite nicht kennt.
    - Der Rand umfasst mindestens 3 Karten, weil das Handy nur gut eine Karte zeigt.
  - `m` wird einmal berechnet und beim Drehen des Handys nicht neu. Das ist bewusst so, der Rand bleibt groß genug.

- [ ] **Step 4: Prüfungen grün**

Run: wie Schritt 2, jeweils in einem neuen Tab:
- auf `/`;
- auf einer Bike-Produktseite (Bike-Schiene);
- auf einer Bekleidungs-Produktseite („Ähnliche Artikel“).

Jeweils Desktop und Handy. `rail.swipe` läuft jedes Mal in einem eigenen neuen Tab.
Expected: keine Fehler. `rail.swipe` erreicht mindestens 90 %, vorher ca. 12 %.

- [ ] **Step 5: Theme Check und Commit**

```bash
git -C "$W" add assets/theme.js docs/qa/performance-checks.js
git -C "$W" commit -m "Performance: Schienen laden ihre Bilder vor (Annähern, Wischen, Pfeile), gemeinsame Vorlade-Hilfen"
```

### Task 3: Umschalter: Showroom und Neuheiten-Reiter

**Files:**
- Modify: `assets/sections.js:13–57`, das Showroom-Modul.
- Modify: `assets/theme.js`, ein neuer Block „Reiter vorladen“ hinter dem Tab-Block (Zeile 228).
- Test: Prüfungen `toggle.*`.

**Interfaces:**
- Consumes: `PS.eagerCards`, `PS.whenLoaded`, `PS.afterLoad` und `ps:rail-near` aus Task 2.
- Produces: `data-pre` mit den Werten `state`, `chip` und `tab`.

- [ ] **Step 1: Prüfungen schreiben**

```js
PK.add('toggle.state', async () => {
  const { s, rail, cards } = room(), f = [], other = cards.filter((c) => !inState(c));
  await near(rail);
  if (!await until(() => other.slice(0, 3).every((c) => imgs(c).every((i) => i.loading === 'eager')), 8000)) f.push('erste 3 Karten des anderen Zustands nicht vorgeladen');
  if (other[3] && imgs(other[3]).some((i) => i.loading === 'eager')) f.push('mehr als 3 Karten des anderen Zustands vorgeladen');
  await until(() => other.slice(0, 3).every((c) => imgs(c).every(ready)), 6000);
  await into(rail);
  s.querySelector('[data-showroom-mode][aria-pressed="false"]').click(); await frames(2);
  if (!other.filter((c) => c.getClientRects().length).slice(0, 2).every((c) => imgs(c).every(ready))) f.push('nach dem Umschalten nicht fertig');
  s.querySelector('[data-showroom-mode][aria-pressed="false"]').click(); await frames(2);
  return f;
}, () => room() && room().cards.some((c) => !inState(c)) ? '' : 'kein Showroom mit zwei Zuständen');
PK.add('toggle.chip', async () => {
  const { s, cards } = room(), has = (c, id) => (' ' + (c.dataset.categories || '') + ' ').includes(' ' + id + ' ');
  const want = (ch) => cards.filter((c) => inState(c) && has(c, ch.dataset.showroomCat)).slice(0, 3);
  const chip = [...s.querySelectorAll('[data-showroom-cat]')].find((ch) => ch.dataset.showroomCat && !ch.hidden &&
    want(ch).some((c) => imgs(c).some((i) => i.loading === 'lazy')));
  if (!chip) return []; // alle Chip-Karten schon geladen (z. B. nach rail.swipe): frisch laden, dann zählt die Prüfung
  chip.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch' }));
  await frames(1);
  return want(chip).every((c) => imgs(c).every((i) => i.loading === 'eager')) ? [] : ['Fingerauflegen auf einen Chip lädt nicht vor'];
}, () => room() ? '' : 'kein Showroom');
PK.add('toggle.tabs-mouse', async () => {
  const { tabs, panel } = neu(), tab = tabs.find((t) => t.getAttribute('aria-selected') === 'false');
  tab.dispatchEvent(new PointerEvent('pointerenter', { pointerType: 'mouse' }));
  await frames(1);
  const cards = [...panel(tab).querySelectorAll('.pcard')];
  return cards.length && cards.every((c) => imgs(c).every((i) => i.loading === 'eager')) ? [] : ['Zeigen auf einen Reiter lädt seine Karten nicht vor'];
}, () => !mouse() ? 'nur mit Maus' : neu() ? '' : 'keine Neuheiten-Reiter');
PK.add('toggle.tabs-touch', async () => {
  const { list, tabs, panel } = neu(), hidden = tabs.map(panel).filter((p) => p.hidden), f = [];
  const first = (p, n) => [...p.querySelectorAll('.pcard')].slice(0, n);
  await near(list);
  if (!await until(() => hidden.every((p) => first(p, 2).every((c) => imgs(c).every((i) => i.loading === 'eager'))), 6000)) f.push('erste 2 Karten der anderen Reiter nicht vorgeladen');
  if (hidden.some((p) => first(p, 3)[2] && imgs(first(p, 3)[2]).some((i) => i.loading === 'eager'))) f.push('mehr als 2 Karten je Reiter');
  return f;
}, () => mouse() ? 'nur am Touch-Gerät' : neu() ? '' : 'keine Neuheiten-Reiter');
```

- [ ] **Step 2: Prüfungen laufen lassen und Scheitern sehen**

Run: `await PK.run('toggle')` auf `/`, frisch in einem neuen Tab, Desktop und Handy.
Expected:
- Am Desktop scheitern `toggle.state`, `toggle.chip` und `toggle.tabs-mouse`.
- Am Handy scheitern `toggle.state`, `toggle.chip` und `toggle.tabs-touch`.

- [ ] **Step 3: Umsetzen**

- **Showroom** (`sections.js`), im bestehenden Modul:
  - Meldet `rail` das Ereignis `ps:rail-near` (einmal), läuft diese Kette:
    1. `PS.whenLoaded(<Bilder der ersten 3 sichtbaren Karten>, 4000)`;
    2. dann `PS.afterLoad`;
    3. dann `PS.eagerCards(<erste 3 Karten des anderen Zustands in der gewählten Baureihe>, 'state')`.
  - Der Kommentar nennt den Grund: Safari kennt kein Zeigen und fokussiert Knöpfe beim Tippen nicht (`assets/header.js:65`). Ein
    Vorladen erst beim Tippen käme zu spät.
  - Jeder Chip reagiert auf `pointerenter` (nur bei `pointerType === 'mouse'`), `pointerdown` und `focus` mit
    `PS.eagerCards(<erste 3 Karten des aktuellen Zustands mit dieser Baureihe>, 'chip')`.
- **Reiter** (`theme.js`): `PS.on('[role="tablist"]', …)`. Das Panel eines Reiters kommt über `aria-controls`, die Karten darin sind
  `.pcard, .bcard`. Hat kein Panel Karten (Hero, Größentabelle), kehrt das Modul sofort zurück.
  - `pointerenter` (nur mit Maus) oder `focus` auf einem Reiter: `PS.eagerCards(<alle Karten seines Panels>, 'tab')`. Beide Ereignisse
    blubbern nicht, also am Reiter selbst lauschen oder per Capture an der Liste.
  - Ohne `(hover: hover) and (pointer: fine)` kommt nach `PS.afterLoad` ein Beobachter aufs Fenster dazu
    (`rootMargin: '100% 0px 100% 0px'`), der die Liste beobachtet. Beim ersten Treffer:
    1. den Beobachter trennen;
    2. `PS.afterLoad` abwarten;
    3. für jedes versteckte Panel `PS.eagerCards(<erste 2 Karten>, 'tab')`.

- [ ] **Step 4: Prüfungen grün**

Run: `await PK.run('toggle')` und `await PK.run('pre')` auf `/`, frisch in einem neuen Tab, Desktop und Handy.
Expected: keine Fehler. Zur Sichtprüfung:
- Neu/Gebraucht zeigt sofort Bilder.
- Die Schiene springt wie vorher an den Anfang.
- Reveals und Staffel bleiben unverändert.

- [ ] **Step 5: Theme Check und Commit**

```bash
git -C "$W" add assets/sections.js assets/theme.js docs/qa/performance-checks.js
git -C "$W" commit -m "Performance: Showroom und Neuheiten-Reiter laden die Karten hinter dem Umschalter vor"
```

### Task 4: Warenkorb: eine Runde weniger, Vorschaubild vorab, Abgleich

**Files:**
- Modify: `sections/cart-drawer.liquid:44`, davor ein `capture`.
- Modify: `snippets/cart-line.liquid:29`.
- Modify: `snippets/pdp-options.liquid:74–80`.
- Modify: `snippets/product-card.liquid:102–108` und `:114`.
- Modify: `assets/cart.js`: `applySections` (66–89), `addNow` (146–164), die Handler (223–259) und ein neuer Abgleich.
- Test: Prüfungen `cart.*`.

**Interfaces:**
- Consumes: `PS.eager`, `PS.afterLoad` und `PS.slowNet` aus Task 2.
- Produces:
  - `#cart-drawer` trägt `data-count="{{ cart.item_count }}"` und `data-sig` (32 Hex-Zeichen), auch in jeder Section-Antwort.
  - `sessionStorage['ps:cart-sig']` ist der zuletzt gesehene Fingerabdruck dieses Tabs.
  - Quick-Add-Knöpfe tragen `data-add-thumb`, und jede Variante im Produkt-JSON hat `"thumb"` (eine URL oder `null`).
  - `applySections(sections, itemCount?) → boolean`, intern in `cart.js`.
  - `ps:cart` bleibt unverändert (`{ count, previous }`). Task 7 hängt sich daran.

Liquid, wörtlich:

```liquid
{%- capture cart_sig -%}{{ cart.item_count }}|{{ cart.total_price }}{%- for item in cart.items -%}|{{ item.key }}:{{ item.quantity }}{%- endfor -%}{%- endcapture -%}
<dialog class="drawer drawer--cart" id="cart-drawer" … data-count="{{ cart.item_count }}" data-sig="{{ cart_sig | md5 }}">

{%- comment -%} pdp-options.liquid, in der Varianten-Schleife {%- endcomment -%}
{%- assign thumb = v.featured_image | default: product.featured_image -%}
"thumb": {% if thumb %}{{ thumb | image_url: width: 176 | json }}{% else %}null{% endif %}
```

Die Quick-Add-Knöpfe bekommen `{% if add_thumb %} data-add-thumb="{{ add_thumb | image_url: width: 176 }}"{% endif %}`.
- Am Größen-Chip gilt `add_thumb = variant.featured_image | default: product.featured_image`.
- Am Einzelknopf gilt dasselbe für `product.selected_or_first_available_variant`.

So rechnet auch `item.image` in `cart-line.liquid`: Variantenbild, sonst Produktbild. In `pdp-options.liquid` ist `"image"` heute die
letzte Eigenschaft der Variante. Dahinter kommt also ein Komma, dann `"thumb"`.

- [ ] **Step 1: Prüfungen schreiben**

```js
const quick = () => document.querySelector('[data-add-variant]:not([disabled])');
const addFails = (r) => [
  r.cartJs && `${r.cartJs}× /cart.js nach dem Hinzufügen`, r.adds !== 1 && `${r.adds}× /cart/add.js`,
  r.events !== 1 && `${r.events}× ps:cart`, !r.thumbPreloaded && 'Vorschaubild nicht beim Klick geholt (andere URL?)',
  !r.thumbReady && 'Vorschaubild beim Öffnen nicht fertig', r.count !== r.serverCount && `Zähler ${r.count}, Warenkorb ${r.serverCount}`
].filter(Boolean);
PK.add('cart.attrs', () => {
  const d = document.getElementById('cart-drawer'), f = [];
  const n = (d.querySelector('#cart-title').textContent.match(/\((\d+)\)/) || [])[1];
  if (d.dataset.count !== n) f.push(`data-count ${d.dataset.count} statt ${n}`);
  if (!/^[0-9a-f]{32}$/.test(d.dataset.sig || '')) f.push('data-sig fehlt');
  if (quick() && !quick().dataset.addThumb) f.push('Quick-Add ohne data-add-thumb');
  return f;
});
PK.add('cart.add', async () => addFails(await PK.m.add(quick())), () => quick() ? '' : 'kein Quick-Add auf der Seite');
PK.add('cart.form', async () => addFails(await PK.m.add(document.querySelector('form[data-product-form]'))),
  () => document.querySelector('form[data-product-form] [type="submit"]:not([disabled])') ? '' : 'kein kaufbares Produktformular');
PK.add('cart.fallback', async () => { // Antwort ohne Drawer-Section
  const orig = window.fetch;
  window.fetch = (u, o) => orig(u, o).then((res) => !String(u).includes('/cart/add') ? res : res.clone().json().then((j) => {
    delete j.sections;
    return new Response(JSON.stringify(j), { status: res.status, headers: { 'Content-Type': 'application/json' } });
  }));
  try {
    const r = await PK.m.add(quick());
    return [r.cartJs !== 1 && 'kein Rückfall auf /cart.js', r.events !== 1 && `${r.events}× ps:cart`,
      r.count !== r.serverCount && 'Zähler falsch'].filter(Boolean);
  } finally { window.fetch = orig; }
}, () => quick() ? '' : 'kein Quick-Add auf der Seite');
PK.add('cart.change', async () => {
  const id = +quick().dataset.addVariant, f = [], sel = `#cart-drawer [data-cart-qty][data-key^="${id}:"]`;
  const qty = () => +(document.querySelector(sel) || { value: 0 }).value, key = () => document.querySelector(sel).dataset.key;
  await PS.cart.add([{ id, quantity: 1 }]);
  const q = qty();
  await PS.cart.change(key(), q + 1);
  if (qty() !== q + 1) f.push('Menge ändern wirkt nicht');
  await PS.cart.change(key(), q - 1); // Stand vor der Prüfung, bei 0 entfernt
  if (qty() !== q - 1) f.push('Zurücksetzen oder Entfernen wirkt nicht');
  if (document.querySelector('[data-cart-count]').dataset.count !== document.getElementById('cart-drawer').dataset.count) f.push('Zähler und data-count uneinig');
  return f;
}, () => quick() ? '' : 'kein Quick-Add auf der Seite');
PK.add('cart.lines', () => [...document.querySelectorAll('#cart-drawer .line-item img')].some((i) => i.loading !== 'eager') ? ['Drawer-Bilder nach load noch lazy'] : [],
  () => document.querySelector('#cart-drawer .line-item img') ? '' : 'Warenkorb leer: einen Artikel hinzufügen, neu laden');
PK.add('cart.sync', async () => {
  const d = document.getElementById('cart-drawer'), f = [];
  const show = () => window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
  let t = performance.now();
  sessionStorage.setItem('ps:cart-sig', 'veraltet'); show();
  if (!await until(() => sessionStorage.getItem('ps:cart-sig') === d.dataset.sig, 4000)) f.push('kein Abgleich nach pageshow');
  if (!entries(/sections=cart-drawer/).some((e) => e.startTime > t)) f.push('Drawer nicht neu geholt');
  t = performance.now(); show(); await wait(1500);
  if (entries(/sections=cart-drawer/).some((e) => e.startTime > t)) f.push('Abruf trotz gleichem Stand');
  return f;
});
```

- [ ] **Step 2: Prüfungen laufen lassen und Scheitern sehen**

Run: `await PK.run('cart')` auf der Kollektion (Desktop), am Ort aus Task 0, Schritt 2 (Dev-Server oder Vorschau-Link). `cart.lines`
läuft nach einem Neuladen mit einem Artikel im Warenkorb.
Expected:
- Fehler melden: `cart.attrs`, `cart.add` (`1× /cart.js`, Vorschaubild nicht beim Klick geholt), `cart.sync` und `cart.lines`.
- `cart.fallback` besteht schon, es sichert den Rückfall ab.
- `cart.change` scheitert nur an „Zähler und data-count uneinig“, weil `data-count` noch fehlt. Menge ändern und Entfernen wirken.

- [ ] **Step 3: Umsetzen**

- Die Liquid-Änderungen wie oben. Dazu `cart-line.liquid:29` mit `widths: '176'`.
- **`applySections(sections, itemCount)`:**
  - Ist `itemCount` keine Zahl, gilt `+fresh.dataset.count` des frischen Dialogs.
  - Ist danach keine endliche Zahl bekannt (`isFinite`, denn `+undefined` ist `NaN`): `return false`, nichts ändern, kein `ps:cart`.
  - Nach dem Tausch von `innerHTML`:
    - `data-count` und `data-sig` vom frischen auf den lebenden Dialog kopieren, denn `innerHTML` tauscht nur den Inhalt;
    - `data-sig` in `sessionStorage['ps:cart-sig']` schreiben, in einem `try`, weil der Speicher gesperrt sein kann;
    - die Zeilenbilder per `PS.eager(img, 'drawer')` umstellen, außer bei `PS.slowNet()`. Der Drawer öffnet meist gleich danach.
  - Alles andere bleibt wie bisher. Am Ende `return true`.
- **`addNow`:** `if (applySections(data.sections)) return data;` Sonst wie bisher `/cart.js` holen und
  `applySections(data.sections, cart.item_count)`.
- **Vorschaubild vorab:** Eine lokale Funktion `warm(url)` legt ein `new Image()` an und hält die Referenz in einer Liste, bis `load`
  oder `error` kommt.
  - Im `submit`-Handler vor `PS.cart.add`:
    1. die Variante aus `form.elements.namedItem('id')` lesen;
    2. das Produkt-JSON aus `form.closest('[data-pdp]')` holen (`[data-product-json]`);
    3. dessen `thumb` an `warm` geben.
    - Fehler beim Lesen des JSON still übergehen.
  - Im Quick-Add-Handler: `warm(add.dataset.addThumb)`.
- **Zeilenbilder nach dem Laden:** `PS.afterLoad` stellt die `#cart-drawer img[loading="lazy"]` per `PS.eager(img, 'drawer')` um, außer
  bei `PS.slowNet()`.
- **Abgleich `sync()`:**
  - Er liest `data-sig` des Drawers und `sessionStorage['ps:cart-sig']`. Gibt es beides und weicht es ab, `enqueue(refresh)`. Sonst
    den eigenen Stand speichern.
  - `refresh()`: `fetch(location.pathname + '?sections=' + SECTION)`, dann JSON, dann `applySections(json)`. Fehler still übergehen.
  - `sync()` läuft beim Start von `cart.js` und bei `pageshow` mit `persisted`.
  - Der Kommentar nennt die Gründe: vorab geholte Seiten, bfcache, und das Warenkorb-Cookie ändert sich ab dem zweiten Artikel nicht.
  - Wie jede Änderung meldet der Abgleich `ps:cart`. Steigt der Zähler dabei, wippt das Symbol. Das ist gewollt, denn der Zähler ändert
    sich sichtbar.

- [ ] **Step 4: Prüfungen grün**

Run: `await PK.run('cart')` auf der Kollektion und auf einer Bekleidungs-Produktseite, Desktop und Handy, am Ort aus Task 0, Schritt 2.
Für `cart.lines` neu laden, während ein Artikel im Warenkorb liegt.
Expected: keine Fehler. In `read_network_requests` stehen pro Hinzufügen nur `/cart/add.js` und das Drawer-Bild ohne zweite Anfrage.
Sichtprüfung:
- Das Lade-Band am Knopf läuft kürzer.
- „Hinzugefügt“, Fokusrückgabe, Zeilen-Staffel und Versandbalken sind wie vorher.

- [ ] **Step 5: Theme Check und Commit**

```bash
git -C "$W" add sections/cart-drawer.liquid snippets/cart-line.liquid snippets/pdp-options.liquid snippets/product-card.liquid assets/cart.js docs/qa/performance-checks.js
git -C "$W" commit -m "Performance: Warenkorb ohne zweite Anfrage, Vorschaubild beim Klick, Abgleich nach Prefetch und Zurück"
```

### Task 5: Vorlader für Reveals

**Files:**
- Modify: `assets/motion.js`:
  - ein neuer Block „Vorladen unter Reveals“ hinter `watch()` (Zeilen 190–196);
  - ein Aufruf in `watch()`;
  - der Abbau in `teardown()` (89–97).
- Test: Prüfungen `reveal.*`.

**Interfaces:**
- Consumes: `PS.afterLoad`, `PS.slowNet` und `PS.eager` aus Task 2.
- Produces:
  - `data-pre` mit dem Wert `reveal`.
  - Das Attribut `data-no-preload` an einem Container nimmt dessen Bilder aus.
- Die Konstante `NO_PRELOAD` in `motion.js` nennt die Ausnahmen, das Prüfgerüst nutzt dieselbe Liste:
  `.rail, .product-grid--rail, [data-hero], [data-story], [data-about-team], [data-build-book], [data-header], [data-pdp], [data-no-preload]`.
  - Die Schienen gehören zu Task 2.
  - Die übrigen laden ihre Bilder selbst, in bewusster Reihenfolge: `hero.js`, `about-story.js`, `about-team.js`, `build-book.js`,
    `header.js`, `product.js`.

- [ ] **Step 1: Prüfungen schreiben**

```js
const NO_PRELOAD = '.rail, .product-grid--rail, [data-hero], [data-story], [data-about-team], [data-build-book], [data-header], [data-pdp], [data-no-preload]';
const revealImgs = () => [...document.querySelectorAll('[data-reveal] img, [data-stagger] img')].filter((i) =>
  !i.classList.contains('pcard__img--alt') && !i.closest(NO_PRELOAD) && i.getClientRects().length && (i.getAttribute('loading') === 'lazy' || pre(i)));
PK.add('reveal.ahead', async () => {
  await wait(1500);
  const f = [], h = innerHeight;
  revealImgs().forEach((i) => {
    const top = i.getBoundingClientRect().top;
    if (top > h && top < 2.4 * h && i.loading !== 'eager') f.push('nicht vorgeladen: ' + i.src.slice(-50));
    if (top > 2.6 * h && pre(i)) f.push('zu früh vorgeladen: ' + i.src.slice(-50));
  });
  return f;
}, () => needMotion() || fresh());
PK.add('reveal.excl', () => [...document.querySelectorAll('img[data-pre]')]
  .filter((i) => pre(i).why === 'reveal' && (i.closest(NO_PRELOAD) || i.classList.contains('pcard__img--alt')))
  .map((i) => 'Ausnahme vorgeladen: ' + i.src.slice(-50)));
PK.add('reveal.ready', async () => { // neuer Tab (Memory-Cache)
  const r = await PK.m.reveals(2500);
  return !r.revealed || r.ready >= 0.9 * r.revealed ? [] : [`${r.ready} von ${r.revealed} Reveals mit fertigem Bild: ${r.late.slice(0, 3).join(', ')}`];
}, needMotion);
```

- [ ] **Step 2: Prüfungen laufen lassen und Scheitern sehen**

Run: `await PK.run('reveal')` auf `/` und auf der Kollektion, frisch in einem neuen Tab, Desktop.
Expected:
- `reveal.ahead` meldet nicht vorgeladene Bilder.
- `reveal.ready` liegt so wie in `$Q/messung-vorher.md`. Ist der Wert am Desktop schon hoch, weil Chrome ca. 1250 px vorher holt, das so
  notieren. Das eigentliche Ziel ist Safari.

- [ ] **Step 3: Umsetzen**

- `watch(el)` ruft `preload(el)` auf.
- `preload(el)` nimmt jedes `img[loading="lazy"]` in `el`, außer `.pcard__img--alt` und Bildern mit `img.closest(NO_PRELOAD)`.
  - Steht der Beobachter schon, beobachtet er das Bild.
  - Sonst kommt es in eine Warteliste.
- **Start nach `PS.afterLoad`:**
  - Ohne `M.enabled` oder bei `PS.slowNet()`: Warteliste verwerfen und nichts beobachten.
  - Sonst ein `IntersectionObserver` aufs Fenster mit `rootMargin: '0px 0px 150% 0px'` anlegen und die Warteliste abarbeiten.
- **Beobachtet werden die Bilder selbst, nicht die Reveal-Elemente.** Der Kommentar nennt die Gründe:
  - Ein langer Stagger-Container wie `events-page__list` lädt so nur, was wirklich nah ist.
  - Bilder ohne Box (versteckt) treffen nie.
- Bei einem Treffer: das Bild abmelden, dann `if (PS.eager(img, 'reveal') && img.decode) img.decode().catch(noop)`.
- `teardown()` trennt den Beobachter und verwirft die Warteliste.
- Auslöser, Rand, Dauer, Staffel und Clip der Reveals bleiben unberührt.

- [ ] **Step 4: Prüfungen grün**

Run: `await PK.run('reveal')` und `await PK.run('pre')`, Desktop und Handy, jeweils frisch in einem neuen Tab:
- auf `/`;
- auf der Kollektion (Karten ab der fünften);
- auf `/pages/werkstatt`;
- auf `/pages/ueber-uns`: Dort wird in `[data-story]` und `[data-about-team]` nichts vorgeladen.

Expected: keine Fehler. `reveal.ready` erreicht mindestens 90 %.

- [ ] **Step 5: Theme Check und Commit**

```bash
git -C "$W" add assets/motion.js docs/qa/performance-checks.js
git -C "$W" commit -m "Performance: Bilder unter Reveals laden 1,5 Fensterhöhen vorher und sind beim Einblenden dekodiert"
```

### Task 6: Zweitbild der Produktkarte nur mit Hover

**Files:**
- Modify: `assets/components.css:199` und `:215–219`.
- Test: Prüfungen `alt.*`.

**Interfaces:** keine neuen.

- [ ] **Step 1: Prüfungen schreiben**

```js
const hoverWide = () => matchMedia('(hover: hover) and (min-width: 1024px)').matches;
const hasAlt = () => document.querySelector('.pcard__img--alt') ? '' : 'keine Karte mit Zweitbild';
PK.add('alt.touch', () => [...document.querySelectorAll('.pcard__img--alt')]
  .filter((i) => getComputedStyle(i).display !== 'none' || i.currentSrc).map((i) => 'Zweitbild da oder geladen: ' + i.src.slice(-50)),
  () => hoverWide() ? 'nur ohne Hover oder unter 1024 px' : hasAlt());
PK.add('alt.desktop', async () => {
  const alt = document.querySelector('.pcard__img--alt'), f = [];
  alt.style.transition = 'none'; alt.closest('.pcard').querySelector('a').focus(); await frames(2);
  if (getComputedStyle(alt).display === 'none') f.push('Zweitbild am Desktop ausgeblendet');
  // :focus-within greift nur, wenn das Fenster den Fokus hat
  if (document.hasFocus() && getComputedStyle(alt).opacity !== '1') f.push('Fokus zeigt das Zweitbild nicht');
  document.activeElement.blur(); alt.style.transition = '';
  return f;
}, () => hoverWide() ? hasAlt() : 'nur mit Hover ab 1024 px');
```

- [ ] **Step 2: Prüfungen laufen lassen und Scheitern sehen**

Run: `await PK.run('alt')` auf der Kollektion am Handy, frisch in einem neuen Tab, nach `go(document.body.scrollHeight)`.
Expected: `alt.touch` meldet sichtbare bzw. geladene Zweitbilder.

- [ ] **Step 3: Umsetzen**

- `.pcard__img--alt { opacity: 0; display: none; }`.
- Im Block `(hover: hover) and (min-width: 1024px)` kommt `.pcard__img--alt { display: block; }` dazu.
- Der Kommentar nennt den Grund: Ein Lazy-Bild ohne Box lädt nicht, und außerhalb dieser Bedingung ist das Zweitbild nie zu sehen.

- [ ] **Step 4: Prüfungen grün**

Run: `alt.touch` am Handy und in Tablet-Größe (Preset `tablet`), `alt.desktop` am Desktop.
Expected:
- keine Fehler;
- `PK.m.cardImages()` am Handy nach `PK.m.reveals(2500)` zählt `alt` 0;
- am Desktop wechselt Hover das Bild wie vorher.

- [ ] **Step 5: Theme Check und Commit**

```bash
git -C "$W" add assets/components.css docs/qa/performance-checks.js
git -C "$W" commit -m "Performance: Zweitbild der Produktkarte lädt nur mit Hover ab 1024 px"
```

### Task 7: Seiten vorab holen (Speculation Rules)

**Files:**
- Modify: `layout/theme.liquid`, ein neuer Block hinter den View Transitions: nach Zeile 137, vor `{{ content_for_header }}` in Zeile
  139.
- Test: Prüfungen `spec.*`.

**Interfaces:**
- Consumes: `ps:cart` aus `assets/cart.js` (kommt nach jeder Änderung), dazu der Abgleich aus Task 4 als Sicherheitsnetz.
- Produces:
  - `<script type="speculationrules" id="ps-speculation">` im `head`, nach jedem `ps:cart` als neues Element;
  - das Abschalt-Merkmal `data-no-prefetch` an einem Link oder Container.

Die Ausnahmeliste und die Form sind festgelegt, deshalb wörtlich. Der Liquid-Kommentar davor fasst Spec 4.5 zusammen:
- nur Chrome und Edge;
- nur `prefetch`, kein `prerender`, mit Begründung;
- `moderate` mit Maus, `conservative` am Touch-Gerät, mit dem Grund Chrome 138 auf Android;
- keine Seiten mit Nebenwirkung;
- nach jeder Warenkorb-Änderung ein neues Element und kein Klon.

```liquid
{%- unless request.design_mode -%}
  <script>
    (function () {
      var c = navigator.connection;
      if (!(window.HTMLScriptElement && HTMLScriptElement.supports && HTMLScriptElement.supports('speculationrules'))) return;
      if (c && (c.saveData || /(^|-)[23]g$/.test(c.effectiveType || ''))) return;
      var lang = '/:lang([a-z]{2}|[a-z]{2}-[a-z]{2})?';
      var off = ['/cart*', '/checkout*', '/checkouts/*', '/account*', '/customer_authentication/*', '/discount/*', '/password*',
        '/challenge*', '/apps/*', '/a/*', '/tools/*', '/community/*', '/services/*', '/*/orders/*'];
      var rules = { prefetch: [{
        source: 'document',
        eagerness: matchMedia('(hover: hover) and (pointer: fine)').matches ? 'moderate' : 'conservative',
        where: { and: [
          { href_matches: '/*' },
          { not: { href_matches: off.map(function (p) { return lang + p; }) } },
          { not: { selector_matches: '[data-filter-link], [target="_blank"], [download], [rel~="nofollow"], [data-no-prefetch], [data-no-prefetch] a' } }
        ] }
      }] };
      function put() {
        var old = document.getElementById('ps-speculation');
        if (old) old.remove();
        var s = document.createElement('script');
        s.type = 'speculationrules';
        s.id = 'ps-speculation';
        s.textContent = JSON.stringify(rules);
        document.head.appendChild(s);
      }
      put();
      document.addEventListener('ps:cart', put);
    })();
  </script>
{%- endunless -%}
```

- [ ] **Step 1: Prüfungen schreiben**

```js
const rules = () => { const s = document.getElementById('ps-speculation'); return s && JSON.parse(s.textContent); };
const specOk = () => HTMLScriptElement.supports && HTMLScriptElement.supports('speculationrules') ? '' : 'Browser ohne Speculation Rules';
PK.add('spec.rule', () => {
  const r = rules(), f = [];
  if (!r || !r.prefetch) return ['keine Regel im Dokument'];
  if (r.prerender) f.push('prerender in der Regel');
  if (r.prefetch[0].eagerness !== (mouse() ? 'moderate' : 'conservative')) f.push('eagerness ' + r.prefetch[0].eagerness);
  return f;
}, specOk);
PK.add('spec.where', () => {
  const w = rules().prefetch[0].where, f = [];
  const hit = (x, a) => x.and ? x.and.every((y) => hit(y, a)) : x.or ? x.or.some((y) => hit(y, a)) : x.not ? !hit(x.not, a)
    : x.href_matches ? [].concat(x.href_matches).some((p) => new URLPattern(p, location.origin).test(a.href))
    : [].concat(x.selector_matches).some((sel) => a.matches(sel));
  const link = (href, attr = '') => Object.assign(document.createElement('div'), { innerHTML: `<a href="${href}" ${attr}>x</a>` }).firstChild;
  ['/cart', '/cart/add', '/de/cart', '/checkout', '/checkouts/c/123', '/account', '/account/login', '/customer_authentication/login',
   '/discount/WINTER', '/password', '/challenge', '/apps/x', '/a/x', '/tools/x', '/community/x', '/services/login_with_shop',
   '/12345/orders/abc', 'https://example.com/products/x'].forEach((h) => { if (hit(w, link(h))) f.push('würde vorab holen: ' + h); });
  ['/', '/products/helm', '/de/products/helm', '/collections/herren', '/collections/herren?page=2', '/pages/ueber-uns', '/search?q=helm']
    .forEach((h) => { if (!hit(w, link(h))) f.push('holt nicht vorab: ' + h); });
  ['target="_blank"', 'download', 'rel="nofollow"', 'data-no-prefetch', 'data-filter-link']
    .forEach((a) => { if (hit(w, link('/products/helm', a))) f.push('würde vorab holen mit ' + a); });
  return f;
}, () => specOk() || (window.URLPattern && rules() ? '' : 'keine Regel oder kein URLPattern'));
PK.add('spec.cart', async () => {
  const a = document.getElementById('ps-speculation');
  document.dispatchEvent(new CustomEvent('ps:cart', { detail: { count: 0, previous: 0 } }));
  await frames(1);
  const b = document.getElementById('ps-speculation');
  return b && b !== a && !a.isConnected && b.textContent === a.textContent ? [] : ['Regel nach ps:cart nicht neu eingesetzt'];
}, () => specOk() || (rules() ? '' : 'keine Regel'));
```

`spec.where` prüft auch die Muster selbst: Ein ungültiges Muster wirft in `new URLPattern` und erscheint als Fehler. Chrome verwürfe
sonst still die ganze Regel.

- [ ] **Step 2: Prüfungen laufen lassen und Scheitern sehen**

Run: `await PK.run('spec')` auf `/`, Desktop.
Expected: `spec.rule` meldet „keine Regel im Dokument“, die übrigen werden übersprungen.

- [ ] **Step 3: Umsetzen**

Den Block wie oben einsetzen, mit dem Kommentar im Stil des View-Transition-Kommentars (`theme.liquid:110–119`).

- [ ] **Step 4: Prüfungen grün und Abläufe mit echten Werkzeugen**

Run: `await PK.run('spec')` am Desktop und am Handy. Am Handy muss die Regel `conservative` sein.
- `spec.rule` darf nicht übersprungen werden.
- Kennt der Pane keine Speculation Rules (Sondierung in Task 0), den Nutzer fragen, ob die Prüfung in seinem Chrome laufen darf (Claude
  in Chrome). Sonst ehrlich melden, dass Task 7 ungeprüft ist.

Künstliche Ereignisse lösen keinen Prefetch aus, deshalb drei Abläufe mit echten Werkzeugen:
1. **Prefetch per Maus:** Desktop, Kollektion. Die Maus per `computer` (`hover`) 0,5 s auf einen Produktlink halten, dann klicken.
   - Expected: Auf der neuen Seite gilt `performance.getEntriesByType('navigation')[0].deliveryType === 'navigational-prefetch'`.
   - Wenn nicht: in `read_network_requests` nachsehen, ob überhaupt ein Prefetch lief (`Sec-Purpose: prefetch`). Klappt es am
     Dev-Server nicht, dasselbe über den Vorschau-Link versuchen. Kommt auch dort keiner (z. B. ist „Seiten vorab laden“ im Pane aus,
     oder Shopify liefert eine Antwort, die Chrome nicht nutzt), das ehrlich melden und nicht daran weiterbauen.
2. **Warenkorb-Test:**
   1. Auf der Kollektion die Maus 0,5 s auf den Link von Karte A halten.
   2. Quick-Add an Karte A, den Drawer schließen.
   3. Den Link von Karte A klicken. Nach 2 s zeigen `[data-cart-count]` und der Titel des Drawers das `item_count` aus `/cart.js`.
   4. `navigate` mit `back`. Nach 2 s gilt auf der Kollektion dasselbe.
   5. Den Warenkorb danach zurücksetzen.
3. **Theme-Editor:** Er ist hier nicht prüfbar, weil er die Anmeldung im Admin braucht. `request.design_mode` steht im Liquid, Task 8
   bittet den Nutzer um die Sichtprüfung.

- [ ] **Step 5: Theme Check und Commit**

```bash
git -C "$W" add layout/theme.liquid docs/qa/performance-checks.js
git -C "$W" commit -m "Performance: Speculation Rules (prefetch, Maus moderate, Touch conservative), neu nach jeder Warenkorb-Änderung"
```

### Task 8: Gesamtprüfung, Messung nachher, Doku, Übergabe

**Files:**
- Modify: `docs/motion-api.md`, ein neuer Abschnitt „Vorladen“ unter „Verträge der Shop-Schicht“ (Zeile 111).

- [ ] **Step 1: Alle Prüfungen auf allen Seiten**

Run: `await PK.run()`, jeweils frisch in einem neuen Tab, Desktop 1440 × 900 und Handy. Läufe über 45 s nach Präfix teilen
(`fade`, `rail`, `pre`, `toggle`, `cart`, `reveal`, `alt`, `spec`).
- Seiten: `/`, eine Bekleidungs-Kollektion, eine Bekleidungs-Produktseite, eine Bike-Produktseite, `/pages/ueber-uns` und `/cart`.
- `rail.far`, `reveal.ahead` und `toggle.chip` brauchen jeweils eine frisch geladene Seite. Wo sie übersprungen werden, einzeln
  nachholen.
- `cart.*` läuft am Ort aus Task 0, Schritt 2.

Expected: nirgends Fehler. Übersprungenes je nach Seite und Größe ist erwartet, aber jede Prüfung läuft mindestens einmal.

- [ ] **Step 2: Messung nachher**

Run: wie Task 0, Schritt 4, jeweils in einem neuen Tab. Das Ergebnis kommt nach `$Q/messung-nachher.md`, mit den Werten von vorher
daneben.

Expected nach Spec Abschnitt 5:
- Showroom: mindestens 90 % der Karten fertig (vorher ca. 12 %).
- Warenkorb: `cartJs` 0, `ms` ca. 0,13 s kürzer, `thumbReady` wahr.
- Reveals: mindestens 90 %.
- Kollektion am Handy: `alt` 0.
- `jank` p99 unter 10 ms.
- `beforeLoad` gleich, mit ±2 Einträgen.

Was nicht erreicht wird, mit Wert so nennen.

- [ ] **Step 3: Safari im iOS-Simulator**

Ablauf: `http://127.0.0.1:9294/` in Safari öffnen. Dann:
- den Showroom schnell wischen;
- Neu/Gebraucht umschalten;
- einen Baureihen-Chip antippen;
- die Neuheiten wischen und den Reiter wechseln;
- die Kollektion schnell scrollen;
- Quick-Add nutzen.

Expected:
- keine dunklen Kästen in Schienen und nach dem Umschalten;
- nach einem Chip darf kurz das Einblenden kommen;
- der Drawer zeigt das Bild beim Öffnen.

Dazu Screenshots machen.

- [ ] **Step 4: Sichtvergleich der Effekte**

Ablauf: Live (`https://powershop-weil.com/`) und Vorschau nebeneinander, Desktop und Handy. Vor jedem Blick `Shopify.theme.role`
prüfen: `main` ist live, sonst Vorschau. Verglichen wird:
- Startseite: Intro, Hero, Showroom, Bento, Türen;
- Kollektion: Einblenden ab Karte 5, Hover-Zweitbild am Desktop;
- Produktseite: Galerie und Schienen;
- Drawer: Lade-Band, Zeilen-Staffel, Versandbalken;
- Über uns;
- ein Seitenwechsel mit View Transition.

Expected: alles gleich. Einzige Ausnahme: Vorgeladene Bilder erscheinen ohne Einblenden, so hat es der Nutzer entschieden.

- [ ] **Step 5: Doku, Theme Check, Commit**

Der neue Abschnitt „Vorladen“ in `docs/motion-api.md` beschreibt:
- die Hilfen `PS.*` mit Vertrag;
- `data-pre` mit seinen `why`-Werten;
- `fade-on-load`, `data-no-preload` und `ps:rail-near`;
- `data-count` und `data-sig` am Drawer sowie `ps:cart-sig`;
- `#ps-speculation` und `data-no-prefetch`.

```bash
git -C "$W" add docs/motion-api.md
git -C "$W" commit -m "Performance: Doku zum Vorladen (Motion-API)"
```

- [ ] **Step 6: Übergabe an den Nutzer**

1. Die Messtabelle vorher/nachher und die Screenshots schicken.
2. Den Vorschau-Link fürs iPhone nennen und klar sagen: noch nicht live.
3. Den Nutzer bitten, zwei Dinge zu prüfen:
   - am iPhone über Mobilfunk Showroom, Neuheiten und Warenkorb;
   - im Theme-Editor des Vorschau-Themes, dass nichts vorab geholt wird und alles wie vorher bedienbar ist.
4. Die offene Entscheidung aus der Spec ansprechen: Soll der Drawer schon beim Klick öffnen? Jetzt gibt es dafür einen Messwert.
5. Um das Okay für den Push fragen.

Erst nach dem Okay:
1. `git -C "$W" fetch origin`.
2. Steht `origin/main` weiter: `git -C "$W" rebase origin/main`. Konflikte so lösen, dass beide Änderungen bleiben. Danach `PK.run()` und
   Theme Check noch einmal.
3. `git -C "$W" push origin claude/performance-paket-1:main`, als Fast-Forward, nie mit Force.
4. Live prüfen, sobald der GitHub-Abgleich durch ist (ca. 1 Minute, sonst wiederholen):
   - Startseite und die geänderten Assets (`theme.js`, `sections.js`, `motion.js`, `cart.js`, `shop.css`, `components.css`) laden mit
     200;
   - `curl -s https://powershop-weil.com/ | grep -c 'ps-speculation'` ist mindestens 1;
   - auf einer Kollektion ist `grep -c 'fade-on-load'` mindestens 1.
5. Erst dann dem Nutzer sagen, dass es live ist.

Vorschau-Theme, Launch-Eintrag und `$Q` nur auf Wunsch entfernen.
