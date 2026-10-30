# Über-uns-Seite nach Entwurf H: Einbau-Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/pages/ueber-uns` zeigt Entwurf H, Version 37, als pflegbare Sections im Shopify-Theme.

**Architecture:** Vier neue Sections mit Blöcken: Seitenkopf, Geschichte, Team und „Komm vorbei“. Jede bringt ihr eigenes CSS und JS mit,
wie `sections/build-book.liquid`. Liquid rendert alles vollständig und statisch. Die Bewegung liegt hinter `html.has-motion` und läuft über
`PS.on` und `PS.motion.add`. GSAP und ScrollTrigger laden dafür zusätzlich auf der Vorlage `ueber-uns`.

**Tech Stack:** Shopify Liquid (Online Store 2.0, JSON-Vorlagen), CSS mit den Tokens aus `assets/tokens.css`, Vanilla-JS, GSAP und
ScrollTrigger 3.15.0 aus `assets/`, Shopify CLI 4.9.4 (`theme dev`, `theme check`, `theme push --unpublished`, immer mit
`--store powershop-online.myshopify.com`).

**Spec:** `docs/ueber-uns-h-design.md` im Theme-Repo (Quelle: `$P/entwuerfe/ueber-uns/design-ueber-uns-h.md`, vom Nutzer am 30.10.2026
abgenommen). Referenz für Aussehen und Bewegung, außerhalb des Repos und nur zu lesen: `$P/entwuerfe/ueber-uns/h-vollbild.html` mit
`shared/base.css`, `shared/karten.css`, `shared/team.js`, `shared/team-spotlight.js` und den Bildern unter `bilder/` im selben Ordner.
Ausführende lesen Spec und Referenz.

**Pfade:** Alles liegt unter `/Users/lucaarnoldi/Apps/PowerShop/powershop-onlineshop/`. Pfade ohne Präfix beziehen sich auf den Worktree
`ueber-uns-worktree/` (Theme-Repo). Jeder Shell-Befehl beginnt mit

```bash
P=/Users/lucaarnoldi/Apps/PowerShop/powershop-onlineshop; W=$P/ueber-uns-worktree; Q=$P/ueber-uns-qa
```

und nutzt nur diese absoluten Pfade (`git -C "$W"`, `--path "$W"`). Eine Shell startet hier oft im Haupt-Checkout, ein `git commit` ohne
`-C` landete dort auf `main`.

Das unveröffentlichte Vorschau-Theme „Über uns H Vorschau“ hat die ID **200879538520**. Die Vorschau läuft unter
http://127.0.0.1:9293/pages/ueber-uns (Launch-Eintrag `ueber-uns-vorschau`, `theme dev` auf Port 9293).

## Global Constraints

- Nie im Haupt-Checkout `$P/powershop-onlineshop` committen, stashen, resetten oder auschecken. Dort nur lesen, mit `git --no-optional-locks`. Einzige Ausnahme: Task 0, Schritt 1 (`fetch` und `worktree add`), der nur in `.git` schreibt.
- Vor jedem Commit: `test "$(git -C "$W" rev-parse --abbrev-ref HEAD)" = claude/ueber-uns-h`. Schlägt das fehl, nicht committen.
- Kein Push auf `main` und kein `shopify theme push` aufs Live-Theme. Ein Push auf `main` geht sofort live und braucht das ausdrückliche Okay des Nutzers.
- Kein zweites `shopify theme dev` gegen das Entwicklungs-Theme 199894139224 und nichts am Launch-Eintrag `shopify-theme-dev` (Port 9292) ändern, das ist die Vorschau des Nutzers. Geprüft wird nur im eigenen unveröffentlichten Theme aus Task 0 auf Port 9293.
- Keine Hex-Werte außerhalb von `assets/tokens.css`. Neue Farben dort als Token, Kontrast im Kommentar.
- Bewegung nur unter `html.has-motion` und nur ohne `prefers-reduced-motion`. Das Pinnen der Bühne zusätzlich nur ab 600 px Fensterhöhe: `gsap.matchMedia('(prefers-reduced-motion: no-preference) and (min-height: 600px)')`. 600 = Kopfleiste (bis 77 px mit Rand) plus 520 px Mindesthöhe der Bühne. Team-Fotowechsel und Landen des Pins gelten für jede Höhe. Der Theme-Editor ist immer statisch.
- Fotos zoomen, wachsen oder gleiten beim Umblättern nicht. Einzige Ausnahmen: das Setzen des Kopffotos beim Laden (1,08 → 1) und der Team-Fotowechsel (1,12 → 1). Beides steht so in V37.
- Texte wörtlich aus `h-vollbild.html` und `shared/team.js`. Keine neuen Fakten. Die Teamtexte außer Gerhard und Ingrid bleiben Platzhalter.
- Händlerdaten (Adresse, Telefon, WhatsApp, E-Mail) nur aus den Theme-Einstellungen (`settings.address`, `phone`, `whatsapp`, `email`), nie fest im Markup. Links über `snippets/contact-href.liquid`, die Route wie `sections/visit.liquid:22`.
- Section-Skripte stehen als `<script defer>` in der Section und laufen deshalb **vor** `theme.js`. Sie starten wie `assets/build-book.js:13–17`: sofort, wenn `PS.on` da ist, sonst bei `DOMContentLoaded`. `window.gsap` nur im Callback von `PS.motion.add` oder hinter `PS.motion.enabled` benutzen.
- Section-Blöcke im Schema, keine Theme-Blöcke: Balken und Bühne lesen dieselben Blöcke zweimal. Das Theme nutzt Theme-Blöcke nur zum Verschachteln (`docs/architecture.md:17`). Schema wie `sections/build-book.liquid`: Namen deutsch ohne `t:`-Schlüssel, ein `preset`, dazu `"enabled_on": { "templates": ["page"] }`.
- Klassen nach der Tabelle „Vom Entwurf ins Theme“ unten. Kein Klassenname aus dem Entwurf ungeprüft übernehmen, `.story` und `.visit__*` sind im Theme schon belegt.
- Fokus wie im ganzen Theme: `base.css:94` blendet den Fokusrahmen auf Wunsch des Händlers aus (offen in `docs/freigaben.md:44`). Diese Seite weicht nicht davon ab.
- Kommentare und Doku auf Deutsch, im Stil der vorhandenen Dateien. Commit-Nachrichten auf Deutsch, mit der Zeile `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` am Ende.
- Jeder Task endet mit `shopify theme check --path "$W"` ohne Meldung, die nicht schon in `$Q/theme-check-vorher.txt` steht, und mit Prüfungen aus `docs/qa/ueber-uns-checks.js` ohne Fehler.
- Prüfungen im Browser nur mit dem Vorschau-Tab im Vordergrund (`tabs_select`). Im Hintergrund drosselt der Browser `requestAnimationFrame`, GSAP und `header.js` stehen dann still, und Screenshots zeigen alte Stände.

## Review Focus

1. **Handy drehen mitten in der Bühne:** Hochkant ist das Fenster mindestens 600 px hoch, quer darunter. Die Bühne wechselt sauber zwischen gepinnt und gestapelt, keine Etappe bleibt verschoben, kein Text unsichtbar, die Kopfleiste bleibt nicht festgehalten. Ablauf `story:resize` in Task 4.
2. **Reduzierte Bewegung zur Laufzeit:** `motion.js` ruft dann in `teardown()` die Aufräumer aller Sections und beendet alle ScrollTrigger (`assets/motion.js:89–100`). Danach haben alle Texte der Etappen Deckkraft 1, nichts bleibt versetzt, die Kopfleiste ist frei. Prüfung `story:revert` in Task 4.
3. **Kopfleiste:** Man kommt mit weggefahrener Kopfleiste an der Bühne an oder springt per Jahres-Link von unterhalb zurück. Die Kopfleiste fährt kurz vor dem Pinnen ein und bleibt, bis das Team oben angekommen ist. Danach fährt sie wieder wie überall weg. Über der Bühne blitzt dabei nie Weiß auf. Prüfung `story:header` in Task 4 und Task 6.
4. **Andere Anzahl an Etappen oder Personen:** 2 oder 5 Etappen (höchstens 6) geben so viele Spalten im Balken und Haltepunkte. Bei einer Etappe gibt es weder Bühne noch Balken, ohne Blöcke keine Section. Bei einer Person gibt es keine Pfeile und kein Raster. Ablauf `story:count` in Task 4, Prüfung `team:one` in Task 5.
5. **Bilder im echten Netz:** Etappen- und Teamfotos sind geladen, bevor sie ins Bild fahren. Ein `loading="lazy"`-Bild in einer Etappe, die rechts außerhalb des beschnittenen Viewports wartet, lädt sonst erst beim Hereinfahren (`snippets/media.liquid:31` ist standardmäßig lazy). Fehlt ein Bild ganz, zeigt die Etappe eine anthrazitfarbene Fläche und die Person ohne breiten Ausschnitt das Quadrat ganz (`contain`). Prüfungen `story:eager`, `story:noimage`, `team:preload`, `team:nowide`.

---

## Dateien

| Datei | Neu / geändert | Verantwortung |
|---|---|---|
| `sections/about-head.liquid`, `assets/about-head.css` | neu | Seitenkopf „Halle, dunkel“ |
| `sections/about-story.liquid`, `assets/about-story.css`, `assets/about-story.js` | neu | Etappen, Fortschrittsbalken, Bühne, Übergang zum Team |
| `sections/about-team.liquid`, `assets/about-team.css`, `assets/about-team.js` | neu | Team-Spotlight |
| `sections/about-visit.liquid`, `assets/about-visit.css` | neu | „Komm vorbei“ im Stil einer Etappe |
| `snippets/visit-map.liquid` | neu | Karte mit Pin, aus `sections/visit.liquid` herausgelöst |
| `sections/visit.liquid` | geändert | rendert die Karte über `visit-map`, Ausgabe unverändert |
| `templates/page.ueber-uns.json` | geändert | Unternavigation plus die vier neuen Sections mit Inhalt |
| `layout/theme.liquid` | geändert | GSAP und ScrollTrigger auch bei `template.suffix == 'ueber-uns'` |
| `assets/header.js` | geändert | `PS.headerHold(on)` |
| `assets/motion.js` | nur Kommentar | „nur Startseite“ → „Startseite und Über uns“ |
| `assets/tokens.css` | geändert | `--c-orange-on-light`, `--c-hd-orange`, `--photo-grade` |
| `assets/ueber-uns-*.jpg` | neu | Kopf-, Etappen- und Teamfotos in festen Größen |
| `docs/qa/ueber-uns-checks.js`, `docs/qa/karte-ausschneiden.py` | neu | Prüfungen im Browser, Vergleich der Karte (Task 0) |
| `docs/ueber-uns-h-design.md`, `docs/plan-ueber-uns-h.md` | neu | Spec und dieser Plan |
| `docs/architecture.md`, `docs/motion-api.md`, `docs/file-structure.md`, `docs/bildliste.md` | geändert | Doku |
| `$P/.claude/launch.json` (nicht im Repo) | geändert | Eintrag `ueber-uns-vorschau` |

## Vom Entwurf ins Theme

| Im Entwurf | Im Theme |
|---|---|
| `.page-head*`, dazu `.page-head h1/em/p` aus `shared/karten.css` | `.about-head*` in `about-head.css` |
| `.full`, `.full__*` | `.about-story`, `.about-story__*` (`.story` und `.story__text` belegen `home.css` und `sections.css`, `home.css` lädt überall) |
| `.leaf*`, `.spot*` | bleiben, im Theme frei |
| `.meta` (Ort unter dem Etappentext) | `.leaf__meta` in `about-story.css` |
| `.arrow`, `.arrow--solid` | `.spot__arrow`, `.spot__arrow--solid` in `about-team.css` |
| `.btn--ghost` | `.btn--outline-dark` (`assets/components.css:21`) |
| `.visit__title`, `__info`, `__place`, `__street`, `__city`, `__where`, `__contact`, `__phone`, `__foot` | `.about-visit__*`. `pages.css:248–325` stylt `.visit__*` anders. |
| `.map*`, `.pin*` | Klassen des Snippets `visit-map` (heute in `visit.liquid`). Abweichungen nur unter `.about-visit`: `--ax: 50` (Pin mittig statt `pages.css:279–280`), Höhe statt `pages.css:252/257`, weißes Schild statt `pages.css:294`. |
| Icons `i-arrow-left`, `i-arrow-right`, `i-message`, `i-navigation`, `i-pin`, `i-phone`, `i-mail` | `render 'icon'` mit `chevron-left`/`arrow-right` (links gespiegelt: `arrow-right` mit `scale: -1 1`), `message-circle`, `route`, `map-pin`, `phone`, `mail` |
| `#i-barshield` | `symbol` in `about-story.liquid`, Form unverändert |
| `#f3692b`, `#a8430f`, Bildfarbe | Tokens aus Task 1 |

---

### Task 0: Arbeitsplatz, Vorschau und Prüfgerüst

**Files:**
- Create: `docs/qa/ueber-uns-checks.js`, `docs/qa/karte-ausschneiden.py`, `docs/ueber-uns-h-design.md` (Kopie der Spec), `docs/plan-ueber-uns-h.md` (Kopie dieses Plans)
- Create außerhalb des Repos: `$Q` (Vergleichsstände, wird nie committet)

**Interfaces:**
- Produces: `window.UU = { checks: {}, add(name, fn, when?), run(prefix?) }`.
  - `fn: () => string[] | Promise<string[]>` gibt Fehlertexte zurück. Leer heißt bestanden.
  - `when?: () => string` gibt einen Grund zum Überspringen zurück (z. B. „nur ab 900 px Breite“), leer heißt: läuft.
  - `run(prefix?): Promise<{ name: string, fails: string[], skipped?: string }[]>` führt alle Prüfungen mit passendem Namensanfang nacheinander aus und gibt eine Zeile pro Prüfung aus.
- Produces, als globale Hilfen neben `UU`:
  - `px(el, prop): number` (berechneter Wert), `rect(sel): DOMRect`, `wait(ms)`, `frames(n = 2)` (wartet n Animation-Frames)
  - `go(y)`: `scrollTo({ top: y, behavior: 'instant' })`, dann `frames(2)`. `base.css:6` setzt `scroll-behavior: smooth`, ein einfaches `scrollTo(0, y)` gleitet.
  - `story()`: `document.querySelector('[data-story]')?.__story`
  - `at(p)`: hält die Bühne an (`st.disable(false, true)`) und setzt `st.animation.progress(p)`. Werte danach lesen. `UU.run` gibt die Bühne nach jeder Prüfung mit `st.enable()` frei, das misst neu und scrubbt zurück.
- Produces: Vorschau unter `http://127.0.0.1:9293/pages/ueber-uns`, Launch-Eintrag `ueber-uns-vorschau`.

- [ ] **Step 1: Worktree anlegen**

```bash
git -C "$P/powershop-onlineshop" --no-optional-locks fetch origin
git -C "$P/powershop-onlineshop" worktree add "$W" -b claude/ueber-uns-h origin/main
mkdir -p "$Q"
```

`fetch` und `worktree add` schreiben nur in `.git` (Remote-Zweige, neuer Zweig, Worktree-Eintrag), wie beim vorhandenen `motion-worktree`.
Dateien und Zweig des Haupt-Checkouts bleiben unberührt.
Expected: `git -C "$W" status -sb` zeigt `claude/ueber-uns-h` ohne Änderungen.

- [ ] **Step 2: Unveröffentlichtes Vorschau-Theme anlegen und starten**

Erst `shopify theme list --store powershop-online.myshopify.com --name "Über uns H Vorschau"`. Gibt es das Theme schon, dessen ID nehmen und
nicht neu anlegen. Sonst im Hintergrund (lädt das ganze Theme samt Filmen hoch, etwa 53 MB):
`shopify theme push --store powershop-online.myshopify.com --unpublished --theme "Über uns H Vorschau" --path "$W" --json`.
Die ID im Kopf dieses Plans unter „Pfade“ eintragen. In der Bibliothek stehen am 30.10. vier von höchstens 20 Themes.

Danach in `$P/.claude/launch.json` einen Eintrag `ueber-uns-vorschau` anlegen: gleiche `runtimeExecutable` und `shopify`-Pfad wie
`shopify-theme-dev`, Argumente `theme dev --store powershop-online.myshopify.com --path <W absolut> --theme <ID> --port 9293`,
`"port": 9293`. Starten mit `preview_start` (nie per Bash).
Expected: `http://127.0.0.1:9293/pages/ueber-uns` zeigt die heutige Seite (Unternavigation und Kopf „Über uns“).

- [ ] **Step 3: Prüfgerüst schreiben**

`docs/qa/ueber-uns-checks.js` legt `window.UU` und die Hilfen an, wie unter Interfaces beschrieben. Die Datei darf mehrfach laufen und
überschreibt dann nur. Sie wird nicht ausgeliefert. Man liest sie mit `cat` und schickt ihren Inhalt plus `await UU.run('…')` in einem
Aufruf von `javascript_tool`. Nach jedem Neuladen (auch durch `theme dev`) neu einspielen.

`UU.run` scheitert sofort mit „Tab im Hintergrund“, wenn `document.hidden` gilt. Es wartet, bis die Seite mindestens 3 s geladen ist:
`header.js` hält die Kopfleiste nach dem Neuladen so lange still (`assets/header.js:146–150`).

Was nicht aus der Seite heraus geht (Fenstergröße wechseln, Vorlage ändern, Theme-Editor, iPhone), steht in den Tasks als „Ablauf“ mit den
Werkzeugaufrufen.

- [ ] **Step 4: Vergleichsstände sichern**

Vor jeder Änderung am Theme:

```bash
shopify theme check --path "$W" > "$Q/theme-check-vorher.txt"
curl -s http://127.0.0.1:9293/pages/service | python3 -I "$W/docs/qa/karte-ausschneiden.py" > "$Q/karte-vorher.html"
```

`karte-ausschneiden.py` liest HTML von stdin, gibt den Teilbaum des ersten Elements mit der Klasse `visit__map` aus und ersetzt
`?v=<Zahl>` durch `?v=X` (die Versionsnummer der Assets ändert sich bei jedem Hochladen). Expected: `karte-vorher.html` ist nicht leer
und enthält `visit__ring`.

- [ ] **Step 5: Spec und Plan ablegen und committen**

Spec und Plan aus `entwuerfe/ueber-uns/` nach `docs/` kopieren, Pfade im Kopf des Plans anpassen.

```bash
git -C "$W" add docs/qa/ueber-uns-checks.js docs/qa/karte-ausschneiden.py docs/ueber-uns-h-design.md docs/plan-ueber-uns-h.md
git -C "$W" commit -m "Über uns: Spec, Plan und Prüfgerüst für Entwurf H"
```

### Task 1: Grundlagen: Tokens, GSAP auf der Seite, Kopfleiste festhalten

**Files:**
- Modify: `assets/tokens.css`, `layout/theme.liquid` (Bedingung der GSAP-Skripte bei Zeile ~161, Kommentar darüber), `assets/header.js` (Block „Überlagerung und Ausblenden“, Zeilen 102–140), `assets/motion.js` (Kommentare Zeile 3 und 102)
- Test: `docs/qa/ueber-uns-checks.js` (Prüfungen `base:*`)

**Interfaces:**
- Produces: die Tokens `--c-orange-on-light: #a8430f` (Text-Orange auf Hell), `--c-hd-orange: #f3692b` (Farbe der Bar-&-Shield-Datei, nur Logo) und `--photo-grade: saturate(.8) contrast(1.07) brightness(.97)`.
- Produces: `PS.headerHold(on: boolean): void`, definiert in `header.js` neben `PS.headerQuiet`. Mit `true` fährt die Kopfleiste ein und bleibt, auch beim Runterscrollen. Mit `false` gilt wieder das normale Verhalten. Mehrfaches `true` zählt nicht hoch, das letzte Wort gilt.
- Produces: Auf `/pages/ueber-uns` gilt mit Setting „Animationen aktivieren“ und außerhalb des Theme-Editors `PS.motion.scroll === true`.

- [ ] **Step 1: Prüfungen schreiben**

Die Seite ist zu diesem Zeitpunkt kürzer als der Bildschirm. `base:hold` macht sie deshalb kurz länger.

```js
UU.add('base:gsap', () => document.documentElement.classList.contains('has-motion') && !(window.gsap && PS.motion.scroll) ? ['GSAP fehlt auf Über uns'] : []);
UU.add('base:tokens', () => ['--c-orange-on-light', '--c-hd-orange', '--photo-grade']
  .filter((t) => !getComputedStyle(document.documentElement).getPropertyValue(t).trim()).map((t) => 'Token fehlt: ' + t));
UU.add('base:hold', async () => {
  if (typeof PS.headerHold !== 'function') return ['PS.headerHold fehlt'];
  const wrap = document.querySelector('.site-header-wrap'), away = () => wrap.classList.contains('is-away'), f = [];
  const pad = document.body.appendChild(Object.assign(document.createElement('div'), { style: 'height:4000px' }));
  await go(0); await go(1200); await go(1600);
  if (!away()) f.push('Vorbedingung: Kopfleiste fährt beim Runterscrollen nicht weg');
  PS.headerHold(true); await wait(400);
  if (away()) f.push('Kopfleiste fährt bei Hold nicht ein');
  await go(2200); await go(2800);
  if (away()) f.push('Kopfleiste fährt trotz Hold weg');
  PS.headerHold(false); await go(3400);
  if (!away()) f.push('Kopfleiste fährt nach Hold nicht mehr weg');
  pad.remove(); await go(0);
  return f;
}, () => document.documentElement.classList.contains('has-motion') ? '' : 'nur mit has-motion');
```

- [ ] **Step 2: Prüfungen laufen lassen und Scheitern sehen**

Run: `await UU.run('base')` auf `http://127.0.0.1:9293/pages/ueber-uns`, Desktop 1440 × 900.
Expected: 3 Prüfungen mit Fehlern (GSAP fehlt, Tokens fehlen, `PS.headerHold fehlt`).

- [ ] **Step 3: Umsetzen**

- `tokens.css`: die drei Tokens. Den Kontrast von `--c-orange-on-light` auf Weiß und auf dem hellen Grund der Etappen nachrechnen und in den Kommentar schreiben.
- `theme.liquid`: `template.name == 'index' or template.suffix == 'ueber-uns'`. Den Kommentar darüber nachziehen.
- `header.js`: eine Variable `held` neben `quiet`. In `update()` steht `held` in derselben Bedingung wie ein offenes Menü (vor der Prüfung auf `quiet`), die Kopfleiste wird also gezeigt. `PS.headerHold` setzt `held` und ruft `queue()` auf.

- [ ] **Step 4: Prüfungen grün, andere Seiten unverändert**

Run: `await UU.run('base')` auf `/pages/ueber-uns`. Auf `/pages/werkstatt` gilt `window.gsap === undefined`. Auf `/` laufen Hero und Willkommensblock wie vorher.
Expected: keine Fehler auf Über uns. `undefined` auf der Werkstatt-Seite.

- [ ] **Step 5: Theme Check und Commit**

```bash
git -C "$W" add assets/tokens.css layout/theme.liquid assets/header.js assets/motion.js docs/qa/ueber-uns-checks.js
git -C "$W" commit -m "Über uns: Tokens, GSAP auf der Seite, Kopfleiste festhalten (PS.headerHold)"
```

### Task 2: Seitenkopf „Halle, dunkel“

**Files:**
- Create: `sections/about-head.liquid`, `assets/about-head.css`, `assets/ueber-uns-halle-{720,1257}.jpg` (aus `entwuerfe/ueber-uns/bilder/foto/softail-licht.jpg`, 1257 × 1280)
- Modify: `templates/page.ueber-uns.json`: Section `main` (`service-page`) durch `head` (`about-head`) ersetzen, `subnav` bleibt davor. `service-page` gibt keinen Seiteninhalt aus dem Admin aus, es geht also nichts verloren.
- Test: Prüfungen `head:*`

**Interfaces:**
- Produces: `about-head` mit den Einstellungen `heading` (inline_richtext, *kursiv* = orange), `text` (textarea), `image` (image_picker), `asset` (text, Standard `ueber-uns-halle-1257.jpg`), `alt` (text). Klasse `.about-head on-dark`. Das Foto steht in `.about-head__photo`.

- [ ] **Step 1: Prüfungen schreiben**

Breite ist hier immer `document.documentElement.clientWidth` (ohne Scrollbalken), nicht `innerWidth`.
- `head:desktop` (ab 900 px Breite, sonst übersprungen): `.about-head__photo` beginnt bei `breite * 1.08 / 2.08 ± 2 px` und endet am rechten Rand. Die Höhe des Kopfs ist `clamp(440px, 38vw, 640px)`, also 547 px bei 1440. Die h1 hat `clamp(44px, 5.8vw, 92px)`, also 83,5 px bei 1440. `em` in der h1 ist `--c-orange`.
- `head:mobile` (unter 900 px): Das Foto steht über dem Text, ist 4 : 3 (± 1 px) und höchstens `0.52 * innerHeight` hoch. Die h1 ist bei 375 px 48 px groß.
- `head:settle`: Mit `has-motion` hat das Foto die Animation `about-head-settle`, ohne `has-motion` keine.
- `head:a11y`: genau eine h1 auf der Seite. Das Foto hat einen nicht leeren Alt-Text.

- [ ] **Step 2: Laufen lassen, scheitert** (Section fehlt)

Run: `await UU.run('head')` bei 1440 × 900 und 375 × 812. Expected: Fehler „.about-head fehlt“.

- [ ] **Step 3: Umsetzen**

Markup und CSS nach `h-vollbild.html` (Tabelle oben), das CSS-Tag oben in der Section wie `sections/build-book.liquid:10`. Texte wörtlich
in die Vorlage. Das Bild über `render 'media'` mit `srcset` der beiden Dateien, `loading: 'eager'` und `fetchpriority: 'high'` (größtes
Bild im ersten Bildschirm).

Das Setzen aus 1,08 ist eine CSS-`@keyframes`-Animation `about-head-settle` (1,8 s, `var(--ease-out)`, 0,1 s Verzögerung) unter
`.has-motion` und `@media (prefers-reduced-motion: no-preference)`. Kein Übergang (`transition`): Ohne Zustandswechsel liefe er nie.
`has-motion` setzt das Head-Skript vor dem ersten Bild (`layout/theme.liquid:18–24`), die Animation startet also mit der Seite.

- [ ] **Step 4: Prüfungen grün**

Run: `await UU.run('head')` bei 1440 × 900 und 375 × 812. Expected: keine Fehler, je Größe eine der beiden Layout-Prüfungen übersprungen.

- [ ] **Step 5: Theme Check, Commit**

```bash
git -C "$W" add sections/about-head.liquid assets/about-head.css assets/ueber-uns-halle-720.jpg assets/ueber-uns-halle-1257.jpg templates/page.ueber-uns.json docs/qa/ueber-uns-checks.js
git -C "$W" commit -m "Über uns: Seitenkopf Halle"
```

### Task 3: Geschichte, statisch

**Files:**
- Create: `sections/about-story.liquid`, `assets/about-story.css`, Etappenfotos:
  - `assets/ueber-uns-team-gerhard.jpg` (aus `bilder/team/01-gerhard-link.jpg`, 720 × 720). Standard für 1985, Task 5 nutzt dieselbe Datei für Gerhard. Kein größeres 1985-Bild, das Original ist nicht größer.
  - `assets/ueber-uns-1991-678.jpg` (`bilder/foto/power-shop-frueher.jpg`, Original 678 px breit)
  - `assets/ueber-uns-2016-{720,1280}.jpg` (`showroom-theke.jpg`), `assets/ueber-uns-heute-{720,1280}.jpg` (`crew-auf-bikes-quer.jpg`)
- Modify: `templates/page.ueber-uns.json` (Section `story` nach `head`, vier Blöcke mit den Schlüsseln `1985`, `1991`, `2016`, `heute`)
- Test: Prüfungen `story:static`, `story:noimage`

**Interfaces:**
- Produces: Section `about-story` mit `data-story`, Wurzelklasse `.about-story`, mit 2 und mehr Blöcken zusätzlich `.about-story--stage`. Darin:
  - `.about-story__stage[data-stage]` > `.about-story__viewport[data-viewport]` > `ol.about-story__track` > `li.leaf` je Block, mit `id="etappe-{{ block.id }}"`. Dank der Schlüssel in der Vorlage heißen die Anker `#etappe-1985` usw.
  - `nav.about-story__rail[data-rail][aria-label="Etappen"]` mit `.about-story__fill[data-fill]` und `.about-story__head[data-head]` (Bar & Shield, `#i-barshield`). Dazu je Etappe ein `a[href="#etappe-…"][data-jump="<index>"]`.
  - `.about-story__hint` („Weiterscrollen“ mit Pfeil, `aria-hidden`) im Viewport.
- Produces: Block `stage` (`max_blocks: 6`, damit die Jahre am Handy in eine Zeile passen) mit:
  - `year` (text)
  - `dot` (checkbox, oranger Punkt hinter dem Jahr, für „Heute.“)
  - `title`, `text` (textarea), `meta`
  - `image`, `asset`, `alt`
  - `focus` (text, `object-position`, Standard `50% 50%`)
  - `mono` (checkbox, schwarz-weiß wie 1985)
- Produces: Ohne Blöcke gibt die Section außerhalb des Editors nichts aus. Bei einem Block gibt es keinen Balken.
- Produces: CSS in zwei Stufen.
  - Unter `html.has-motion .about-story--stage` und `@media (prefers-reduced-motion: no-preference) and (min-height: 600px)` hat die Section schon vor dem Skript die Maße der Bühne: Platz für den Balken, Etappe 1 in Bühnenhöhe. Die Etappen 2..n stehen noch darunter. So springt beim Start der Bühne nichts im ersten Bildschirm.
  - `.about-story.is-live` (Regeln aus `.full.is-live` der Referenz): Etappen übereinander, Balken sichtbar.
  - Sonst stehen die Etappen untereinander, der Balken ist ausgeblendet.

- [ ] **Step 1: Prüfungen schreiben**

- `story:static` (nur ohne `is-live`):
  - 4 `li.leaf` in einem `ol`. Jede `.leaf__year` hat `aria-hidden="true"`.
  - Jede h3 beginnt mit einem `.sr-only`, der Jahr und Doppelpunkt enthält.
  - Es gibt eine h2 „Unsere Geschichte“ (`.sr-only`). Der Balken ist nicht sichtbar.
  - Ab 900 px Breite steht das Foto links und der Text rechts, Spalten 1.08fr | 1fr (Fotospalte 51,9 % ± 0,5).
  - Alle Etappenfotos haben `loading="lazy"`.
- `story:noimage`: Ein Block ohne Bild und ohne `asset` rendert kein `<img>`. Die Fotofläche ist `--c-anthracite`.

- [ ] **Step 2: Laufen lassen, scheitert**

Run: `await UU.run('story:static')` mit `document.documentElement.classList.remove('has-motion')` vorab. Expected: „.about-story fehlt“.

- [ ] **Step 3: Umsetzen**

Markup, Rail und CSS nach `h-vollbild.html` (Tabelle oben). Fotos über `render 'media'` mit `loading: 'lazy'`, `object-position` aus
`focus`, Filter aus `--photo-grade`. `mono` gibt `grayscale(1) contrast(1.12) brightness(.98)`. Der Balken teilt sich auf die Anzahl der
Blöcke auf (`--count` am Element, `repeat(var(--count), minmax(0, 1fr))`, Linie von `50% / count` bis `100% − 50% / count`). Texte, Orte
und Alt-Texte wörtlich aus `h-vollbild.html`. Fotofokus: 1985 `50% 30%`, 2016 `50% 58%`.

- [ ] **Step 4: Prüfungen grün, Commit**

Run: `await UU.run('story:static')` bei 1440 und 375. Expected: keine Fehler. Dann Theme Check und:

```bash
git -C "$W" add sections/about-story.liquid assets/about-story.css assets/ueber-uns-team-gerhard.jpg assets/ueber-uns-1991-678.jpg assets/ueber-uns-2016-720.jpg assets/ueber-uns-2016-1280.jpg assets/ueber-uns-heute-720.jpg assets/ueber-uns-heute-1280.jpg templates/page.ueber-uns.json docs/qa/ueber-uns-checks.js
git -C "$W" commit -m "Über uns: Geschichte als Etappen, ohne Bewegung"
```

- [ ] **Step 5: Ablauf `story:noimage`** (nach dem Commit, die Vorlage ist dann sauber)

In `templates/page.ueber-uns.json` einen fünften Block ohne Bild ergänzen, warten bis `theme dev` hochgeladen hat, neu laden,
`await UU.run('story:noimage')`. Dann `git -C "$W" restore templates/page.ueber-uns.json`.
Expected: keine Fehler, danach ist `git -C "$W" status --porcelain` leer.

### Task 4: Geschichte, Bühne und Umblättern

**Files:**
- Create: `assets/about-story.js` (geladen aus `sections/about-story.liquid` mit `defer`)
- Modify: `assets/about-story.css` (Regeln unter `.is-live`, Schatten, Hinweis „Weiterscrollen“), `sections/about-story.liquid` (Skript-Tag)
- Test: Prüfungen `story:*`

**Interfaces:**
- Consumes: `PS.on`, `PS.motion.add(el, (gsap, ScrollTrigger) => cleanup)`, `PS.headerHold(on)` aus Task 1, das Markup aus Task 3.
- Produces: `section.__story = { st: ScrollTrigger, guard: ScrollTrigger, last: number, revert: () => void }` am `[data-story]`, solange die Bühne läuft. `st` pinnt, `guard` hält die Kopfleiste. `revert` ist derselbe Aufräumer, den das Skript an `PS.motion.add` zurückgibt. Die Prüfungen nutzen es, Task 6 nutzt `st` und `guard`.
- Produces: Klasse `.is-live` am `[data-story]`, solange die Bedingung von `gsap.matchMedia` erfüllt ist (nicht nur während des Pinnens).

- [ ] **Step 1: Prüfungen schreiben**

Alle Prüfungen hier außer `story:short` laufen nur, wenn `story()` existiert. Den Fortschritt stellen sie mit `at(p)` ein.
- `story:turn` (4 Etappen, `last = 3`):
  - `p = 0`: Etappe 1 bei xPercent 0, Etappen 2–4 bei xPercent 100 mit x 120.
  - `p = 0.1`: Etappe 2 bei xPercent 50 ± 2, ihre Jahreszahl hat Deckkraft 0.
  - `p = 1/3`: Etappe 2 bei 0, alle Teile ihres Textes haben Deckkraft 1 und x 0.
  - Kein `img` in der Bühne hat je ein `scale` ≠ 1.
- `story:rail`:
  - `p = 1/3`: `[data-fill]` hat scaleX 0,333 ± 0,01. Die Zahl „1991“ hat `aria-current="step"` und die Klasse `is-passed`.
  - `p = 1`: Die letzte Zahl hat `aria-current`.
  - Die Links im Balken sind mindestens 44 px hoch.
- `story:hint`: Bei `p = 0.05` hat `.about-story__hint` die Klasse `is-gone`. Unter 900 px Breite wird er nicht angezeigt.
- `story:eager`: Alle Etappenfotos haben `loading="eager"`. Nach 5 s sind alle `complete` mit `naturalWidth > 0`.
- `story:snap`: `go()` auf 40 % des Wegs zwischen Etappe 1 und 2, dann 2,5 s warten. Der Fortschritt steht auf einem Vielfachen von 1/3 (± 0,005).
- `story:jump`: Klick auf die letzte Zahl. Nach 3 s ist der Fortschritt 1, ohne Halt dazwischen. Gemessen wird alle 100 ms, der Fortschritt steigt nur.
- `story:header` (Teil 1, Task 6 ergänzt den Übergang):
  - `go(0)`, dann in drei Schritten nach unten bis `st.start − 170`. Liegt das unter 405 px, übersprungen: `header.js:124` zeigt die Kopfleiste oberhalb von 400 px immer. Vorbedingung: `is-away`.
  - `go(st.start − 100)`, 400 ms warten: nicht `is-away` (das Festhalten beginnt 150 px vor dem Pinnen).
  - `go(st.start + 600)`: weiter nicht `is-away`, obwohl nach unten gescrollt.
  - Der Abstandshalter (`.pin-spacer`) der Bühne ist schwarz, damit über der Bühne nichts Weißes aufblitzt, während die Kopfleiste einfährt.
- `story:short` (nur unter 600 px Höhe): kein `.is-live`, kein `pin-spacer`, alle Texte Deckkraft 1. Nach `go()` 1000 px nach unten ist die Kopfleiste `is-away`.
- `story:revert` (läuft als letzte, danach neu laden): Oberkante und Höhe von Etappe 1 bei `go(0)` merken, dann `story().revert()`. Danach:
  - kein `.is-live`, kein `pin-spacer`
  - alle `.leaf` und `.leaf__text > *` ohne `transform` und mit Deckkraft 1
  - Etappe 1 steht an derselben Stelle wie vorher, gleich hoch (± 1 px)
  - beim Runterscrollen fährt die Kopfleiste wieder weg

  So baut auch `motion.js` ab, wenn jemand zur Laufzeit reduzierte Bewegung einschaltet (Review Focus 2).

- [ ] **Step 2: Laufen lassen, scheitert**

Run: `await UU.run('story')` bei 1440 × 900. Expected: alle Bewegungs-Prüfungen übersprungen („__story fehlt“). Das zählt hier als Scheitern.

- [ ] **Step 3: Umsetzen**

Aus `h-vollbild.html` übernehmen:
- die Timeline aus V36, mit `push = viewport.clientWidth * (innerWidth < 900 ? 0.4 : 0.22)`
- `railAt`, `measure` und `paintRail` mit der Blende der Zahlen am Bar & Shield
- `ScrollTrigger.config({ ignoreMobileResize: true })` (`h-vollbild.html:444`)
- den Sprung per `scrollTo({ top: st.start + (st.end - st.start) * i / last, behavior: 'smooth' })` (`h-vollbild.html:498`)

Davon abweichend:
- Start wie in den Global Constraints, dann `PS.on('[data-story]', …)` und darin `PS.motion.add`. Darin `gsap.matchMedia` mit der Bedingung aus den Global Constraints, gebaut nur bei `.about-story--stage`. Der matchMedia-Callback räumt in seinem eigenen Rückgabewert auf: `.is-live` weg, `PS.headerHold(false)`, `__story` weg. Beim Abbau durch matchMedia feuert `onToggle` nicht sicher. Der Aufräumer für `PS.motion.add` ist `() => mm.revert()`.
- Aktive Zahl (`aria-current`) und Hinweis hängen am `onUpdate` der Timeline (`Math.round(slide.progress() * last)`), nicht am ScrollTrigger wie in `h-vollbild.html:522–525`. So folgen sie dem Fortschritt, egal wer ihn setzt (auch `at(p)`).
- `snap: { snapTo: (v) => jumping ? v : Math.round(v * last) / last, inertia: false, duration: { min: 0.25, max: 0.7 }, delay: 0.06, ease: 'power2.inOut' }`. `jumping` gilt vom Klick auf eine Zahl bis 200 ms nach dem letzten `scroll`-Ereignis.
- Kopfleistenhöhe `hh()`: `--header-h` aus `getComputedStyle(document.documentElement)`, als Zahl. Daraus `start: () => 'top top+=' + hh()` und `--stage-h: max(520px, calc(100svh - var(--header-h) - env(safe-area-inset-top, 0px)))`. Beide rechnen mit derselben Größe.
- `guard`: ein eigener ScrollTrigger auf der Bühne, `start: () => 'top top+=' + (hh() + 150)`, `end` am Ende des Pinnens, `onToggle: (s) => PS.headerHold(s.isActive)`. Task 6 verlängert `end`.
- `.about-story .pin-spacer { background: var(--c-black); }`
- Solange `.is-live` steht: `html:has(.about-story.is-live) { scroll-behavior: auto; }`. Das `smooth` aus `base.css:6` ließe jeden Schritt des Einrastens selbst noch einmal gleiten.
- Beim Aufbau alle Etappenfotos auf `loading = 'eager'` stellen. Wartende Etappen liegen rechts außerhalb des beschnittenen Viewports, `lazy` lädt sie sonst erst beim Hereinfahren.

- [ ] **Step 4: Prüfungen grün**

Run: `await UU.run('story')` bei 1440 × 900 und 375 × 812, dazu bei 812 × 375. Expected: keine Fehler.

- [ ] **Step 5: Ablauf `story:resize`**

1. `resize_window` 375 × 812, neu laden, Gerüst einspielen, `go(story().st.start + (story().st.end - story().st.start) / 2)`.
2. `resize_window` 812 × 375, 1 s warten, `await UU.run('story:short')`.
3. `resize_window` 375 × 812, 1 s warten, `await UU.run('story:turn')`, dazu `.is-live` vorhanden.

Expected: keine Fehler in 2 und 3.

- [ ] **Step 6: Commit, dann Ablauf `story:count`**

Theme Check, dann:

```bash
git -C "$W" add assets/about-story.js assets/about-story.css sections/about-story.liquid docs/qa/ueber-uns-checks.js
git -C "$W" commit -m "Über uns: Bühne mit Umblättern, Fortschrittsbalken und Einrasten"
```

Danach `story:count`: In `templates/page.ueber-uns.json` auf 2 Etappen kürzen, prüfen, dann auf 5 (ein Block doppelt mit anderem
Schlüssel), prüfen, dann auf 1. Jedes Mal hochladen lassen, neu laden, Gerüst einspielen.
Expected: Der Balken hat 2 bzw. 5 Spalten, `story().last` ist 1 bzw. 4, `story:snap` hält auf Vielfachen von `1/last`. Bei 1 Etappe gibt es
kein `.is-live` und keinen sichtbaren Balken. Danach `git -C "$W" restore templates/page.ueber-uns.json`, `status --porcelain` ist leer.

- [ ] **Step 7: Mit eigenen Augen prüfen**

Screenshots bei `p = 0.08, 0.15, 0.2, 1/3`, Desktop und Handy, Tab im Vordergrund. Vergleich mit dem Artefakt V37: Foto fährt über den
Text, leere weiße Spalte, Text gleitet von rechts herein.

### Task 5: Team

**Files:**
- Create: `sections/about-team.liquid`, `assets/about-team.css`, `assets/about-team.js`, `assets/ueber-uns-team-<id>.jpg` (720 × 720, außer `gerhard`, das gibt es aus Task 3), `assets/ueber-uns-team-<id>-breit-{960,1600}.jpg` für `gerhard`, `falk`, `franziska`, `richard`. `<id>` wie in `shared/team.js`: `richard`, `falk`, `franziska`, `gerhard`, `ingrid`, `jean`, `aaron`, `juergen`.
- Modify: `templates/page.ueber-uns.json` (Section `team` nach `story`, 8 Blöcke `person` in der Reihenfolge Richard, Falk, Franziska, Gerhard, Ingrid, Jean-Nicolas, Aaron, Jürgen)
- Test: Prüfungen `team:*`

**Interfaces:**
- Produces: Section `about-team` mit `data-about-team`, Klassen `.spot on-dark textured`, `id="team"`. Block `person` (`max_blocks: 8`, das Raster ist für 4 × 2 und 8 × 1 gebaut) mit:
  - `first_name`, `last_name`, `role`, `text` (textarea)
  - `image`, `asset` (Quadrat)
  - `image_wide`, `asset_wide` (3 : 2, optional)
- Produces: Liquid rendert alle Personen vollständig:
  - Vorschau-Knöpfe `.spot__pick[data-pick="<index>"]`
  - Fotos `.spot__shot` mit `<picture>`, `loading="lazy"`. Die `source` gilt ab 900 px und wird nur ausgegeben, wenn ein breites Bild gesetzt ist.
  - Texte `.spot__card`, Pfeile `[data-prev]` und `[data-next]`, Live-Region `[data-status]`.
  - Ohne Skript sind alle Karten sichtbar. `about-team.js` setzt `.is-ready` und zeigt dann nur die aktive.
  - Ohne Blöcke gibt die Section außerhalb des Editors nichts aus. Bei einer Person gibt es keine Pfeile und kein Raster.

- [ ] **Step 1: Prüfungen schreiben**

- `team:markup`: 8 `.spot__pick` mit zugänglichem Namen (Vor- und Nachname). Der erste hat `aria-current`. Im Text der Section stehen alle 8 Namen.
- `team:select`: Klick auf den dritten Knopf. Nach 1 s zeigt die sichtbare Karte „Franziska“, `[data-status]` enthält „Franziska Link“, und der dritte Knopf hat `aria-current`.
- `team:arrows`: Ab 900 px führt `[data-next]` von Richard zu Falk und `[data-prev]` von Richard zu Jürgen. Unter 900 px sind die Pfeile nicht sichtbar.
- `team:wide` (ab 900 px): Das sichtbare Foto von Richard hat ein `currentSrc` mit `breit`. Das Fotofeld ist 3 : 2 und endet nicht rechts außerhalb des Containers.
- `team:nowide` (ab 900 px): Das Foto von Ingrid (kein breites Bild) hat `object-fit: contain`.
- `team:preload`: `go()` so, dass die Oberkante des Teams einen halben Bildschirm unter dem Fenster liegt, 300 ms warten. Alle Fotos der Section haben `loading="eager"`.
- `team:layout`:
  - Bei 1440 steht das Raster als 4 × 2 unter den Pfeilen.
  - Bei 1100 steht es als 8 × 1 unter dem Foto.
  - Bei 375 als 4 × 2, mit quadratischem Foto.
  - Bei 1440 steht der Nachname in einer eigenen Zeile unter dem Vornamen.
- `team:swipe` (unter 900 px): Auf `.spot__photo` ein `PointerEvent('pointerdown', { clientX: 300, bubbles: true })` und dann `pointerup` mit `clientX: 200` auslösen. Danach ist Falk aktiv. `.spot__photo` hat `touch-action: pan-y`.
- `team:gone`: Es gibt keinen Zähler „01 / 08“, keinen WhatsApp-Knopf und keine Notiz in der Section.
- `team:one`: siehe Step 5.

- [ ] **Step 2: Laufen lassen, scheitert**

Run: `await UU.run('team')` bei 1440 × 900. Expected: „[data-about-team] fehlt“.

- [ ] **Step 3: Umsetzen**

CSS aus `h-vollbild.html` (`.spot*`, Tabelle oben), Verhalten aus `shared/team-spotlight.js`. Unterschiede:
- Das Skript baut kein Markup, es arbeitet mit dem aus Liquid. Start wie in den Global Constraints, `PS.on('[data-about-team]', …)`.
- Der Fotowechsel bleibt wie in V37: Das neue Foto kommt mit `yPercent ±100` und setzt sich aus `scale 1.12`, 0,75 s. GSAP nur, wenn
  `PS.motion.enabled && window.gsap` gilt und keine reduzierte Bewegung gewünscht ist (wie `calm` in `team-spotlight.js:12`). Sonst
  wechselt alles sofort.
- Vorladen: Ein IntersectionObserver mit `rootMargin: '0px 0px 100% 0px'` stellt alle Fotos der Section auf `loading = 'eager'`, sobald
  das Team weniger als einen Bildschirm entfernt ist. Der Wechsel wartet auf `img.decode()` des neuen Fotos, höchstens 400 ms.
- Die Pfeiltasten wirken nur, solange der Fokus auf einem Knopf der Section liegt.
- Theme-Editor: `shopify:block:select` zeigt die gewählte Person sofort, ohne Animation (Muster `assets/build-book.js:428–433`).
  `shopify:section:unload` räumt auf.
- Namen, Rollen und Texte wörtlich aus `shared/team.js`.

- [ ] **Step 4: Prüfungen grün, Commit**

Run: `await UU.run('team')` bei 1440 × 900, 1100 × 800 und 375 × 812. Expected: keine Fehler. Theme Check, dann:

```bash
git -C "$W" add sections/about-team.liquid assets/about-team.css assets/about-team.js assets/ueber-uns-team-*.jpg templates/page.ueber-uns.json docs/qa/ueber-uns-checks.js
git -C "$W" commit -m "Über uns: Team-Spotlight"
```

- [ ] **Step 5: Ablauf `team:one`** (nach dem Commit)

Vorlage auf eine Person kürzen, hochladen lassen, neu laden. Expected: keine Pfeile, kein Raster, keine Fehler in der Konsole. Dann
`git -C "$W" restore templates/page.ueber-uns.json`, `status --porcelain` ist leer.

### Task 6: Übergang von der Bühne zum Team

**Files:**
- Modify: `assets/about-story.js`, `assets/about-story.css`, `assets/about-team.css` (z-index)
- Test: Prüfungen `story:toteam`, `story:header` (Teil 2)

**Interfaces:**
- Consumes: `section.__story.st` und `.guard` aus Task 4. Das Team ist die nächste Section: das erste `[data-about-team]` in der folgenden `.shopify-section`. Fehlt es, gibt es keinen Übergang, und `guard` endet mit dem Pinnen.

- [ ] **Step 1: Prüfungen schreiben**

`story:toteam`: Auf die halbe Strecke zwischen dem Ende der Bühne und dem Moment scrollen, in dem die Oberkante des Teams die Unterkante der
Kopfleiste erreicht. Dann gilt:
- Der Viewport der Bühne hat `scale` 0,96 ± 0,01 (halber Weg zu 0,92) und ist nach unten versetzt.
- `--cover` ist 0,375 ± 0,02.
- Die Unterkante des Balkens liegt auf der Oberkante des Teams (± 1 px). Der Balken liegt über der Abdunkelung (z-index 5), das Team über der Bühne (z-index 4).
- Am Ende des Übergangs liegt die Unterkante des Balkens auf der Unterkante der Kopfleiste (± 1 px), der Balken also ganz hinter der Kopfleiste.

`story:header`, Teil 2, im Anschluss an Teil 1:
- Auf die halbe Strecke des Übergangs: nicht `is-away`.
- 600 px unter dem Ende des Übergangs, nach unten gescrollt: `is-away`.
- `click()` auf die erste Zahl im Balken, 3 s warten: nicht `is-away`, Fortschritt 0.

- [ ] **Step 2: Laufen lassen, scheitert.** Expected: `scale` ist 1, und die Kopfleiste fährt im Übergang weg.

- [ ] **Step 3: Umsetzen** nach dem Team-Übergang in `h-vollbild.html:542–545` (`sink`, `--cover`, Schatten am Balken). Bewegt werden nur
Kinder der gepinnten Bühne. Das Ende des Übergangs ist `top top+=` + `hh()`. `guard.end` reicht jetzt bis dahin. Führe die Kopfleiste im
Übergang weg, endete das Team 64 bzw. 76 px tiefer als gemessen, und zwei Bewegungen liefen zugleich.

- [ ] **Step 4: Prüfungen grün** bei 1440 × 900 und 375 × 812, dazu ein Screenshot auf halber Strecke.

- [ ] **Step 5: Theme Check, Commit**

```bash
git -C "$W" add assets/about-story.js assets/about-story.css assets/about-team.css docs/qa/ueber-uns-checks.js
git -C "$W" commit -m "Über uns: Team schiebt sich über die Bühne, Balken fährt mit"
```

### Task 7: Komm vorbei

**Files:**
- Create: `snippets/visit-map.liquid`, `sections/about-visit.liquid`, `assets/about-visit.css`
- Modify: `sections/visit.liquid` (Karte über das Snippet), `templates/page.ueber-uns.json` (Section `visit` nach `team`)
- Test: Prüfungen `visit:*`, Vergleich der Karte

**Interfaces:**
- Produces: `{% render 'visit-map', sizes: string, ring: boolean, logo: boolean, reveal: string, address_lines: array %}`.
  - Standard: `ring: true`, `reveal: 'clip'`, ohne `logo` und `address_lines`. So gibt das Snippet genau die heutige Karte aus `visit.liquid` aus, mit `.visit__map`, `data-reveal="clip"` (`visit.liquid:31`), Ring und Schild „Power Shop“.
  - `about-visit` rendert es mit `ring: false, logo: true, reveal: ''`: kein Einblenden der ganzen Karte, das gibt es in V37 nicht.
  - Mit `logo: true` steht das Bar & Shield (`hd-bar-shield.png`) im Schild. Mit `address_lines` steht die Adresse darunter, nur am Handy sichtbar (CSS in `about-visit.css`).
- Produces: Section `about-visit` mit Einstellungen `heading` (Standard „Komm vorbei“, der orange Punkt kommt aus dem Markup), `where` (Satz zum Ort), `foot` (inline_richtext, Lieferhinweis). Adresse, Route, Telefon, WhatsApp und E-Mail kommen aus den Händlerdaten.

- [ ] **Step 1: Prüfungen schreiben**

- Vergleich der Karte (Bash, kein Browser):
  ```bash
  curl -s http://127.0.0.1:9293/pages/service | python3 -I "$W/docs/qa/karte-ausschneiden.py" > "$Q/karte-nachher.html"
  diff "$Q/karte-vorher.html" "$Q/karte-nachher.html"
  ```
  Expected: keine Ausgabe. `karte-vorher.html` stammt aus Task 0.
- `visit:about`:
  - Ab 900 px steht die Karte links und der Text rechts.
  - „Route planen“ und „Anrufen“ sind `btn--primary`. „Anrufen“ geht über die volle Breite und enthält die Telefonnummer aus den Händlerdaten. WhatsApp und E-Mail stehen darunter nebeneinander als `btn--outline-dark`.
  - Bei 700 px stehen Anrufen, WhatsApp und E-Mail in einer Reihe, bei 375 untereinander.
  - Es gibt keinen Ring (`.visit__ring`), kein `data-reveal` an der Karte und keine Kontakt-Box.
- `visit:mobile` (unter 900 px): Die Karte geht über die volle Breite, Frankreich und Schweiz sind ausgeblendet, und das Schild enthält die Adresse. Die Kartenschrift ist 10 px. Der Pin steht waagrecht in der Mitte (± 2 px).
- `visit:land`: Mit Bewegung ist der Pin vor dem Einblenden versetzt und unsichtbar. Danach ist er an seinem Platz, und zwar nur einmal.
- `visit:data`: Die `href` von Anrufen, E-Mail und Route entsprechen `contact-href` bzw. `settings.address`. Bei WhatsApp zählt der Teil vor `?text=`, den hängt `contact.js:38` an. Im Markup steht keine feste Nummer.

- [ ] **Step 2: Laufen lassen, scheitert.** Expected: „.about-visit fehlt“. Der Vergleich der Karte ist schon leer, er schützt den Umbau.

- [ ] **Step 3: Umsetzen**

- Erst das Snippet herauslösen, der Vergleich der Karte muss leer bleiben.
- Dann `about-visit` nach `h-vollbild.html` mit den Klassen aus der Tabelle oben. Route wie `visit.liquid:22` und `:65`. WhatsApp-Link über `contact-href`/`contact.js` wie in der Kontakt-Box.
- Die Karte am Handy: `--mw: max(min(230cqw, 780px), 150cqw, 160cqh)`, Höhe `clamp(300px, 88vw, 560px)`.
- Das Landen des Pins hängt an `data-reveal` am Pin (motion.js setzt `.is-in`), ohne eigenes Skript.

- [ ] **Step 4: Prüfungen grün** bei 1440, 700 und 375. Expected: keine Fehler und leerer Vergleich.

- [ ] **Step 5: Theme Check, Commit**

```bash
git -C "$W" add snippets/visit-map.liquid sections/visit.liquid sections/about-visit.liquid assets/about-visit.css templates/page.ueber-uns.json docs/qa/ueber-uns-checks.js
git -C "$W" commit -m "Über uns: Komm vorbei im Stil der Etappen, Karte als Snippet"
```

### Task 8: Gesamtprüfung, Doku, Übergabe

**Files:**
- Modify: `docs/architecture.md` (Abschnitt „Über uns“: Bausteine, Datenfluss, Randfälle; der Satz „Die Seitenvorlagen laden kein GSAP“ gilt jetzt nur noch für Werkstatt und Service), `docs/motion-api.md` (Skript-Tabelle: GSAP auch auf Über uns; `PS.headerHold`), `docs/file-structure.md` (Tabelle „Über uns“), `docs/bildliste.md` (alle neuen `ueber-uns-*.jpg` mit Herkunft aus `entwuerfe/ueber-uns/bilder/`)

- [ ] **Step 1: Alle Prüfungen in allen Größen**

Run: `await UU.run()` bei 1440 × 900, 3440 × 1440, 1100 × 800, 375 × 812 und 812 × 375, je frisch geladen, `story:revert` zuletzt.
Expected: nirgends Fehler. Übersprungen je nach Größe ist erwartet, aber jede Prüfung läuft in mindestens einer Größe.

- [ ] **Step 2: Fälle außerhalb des Gerüsts**

- Langsames Netz: in der Vorschau mit gedrosseltem Netz (DevTools) laden. Beim Umblättern erscheint jedes Foto mit der Etappe, nie die leere Fläche. Im ersten Bildschirm springt nichts, wenn die Bühne startet.
- iOS Safari im Simulator (`simctl` direkt, siehe Gedächtnis): Bühne, Einrasten, Team-Wischen, Kopfleiste und der Team-Übergang. `hero.js:200–202` hält fest, dass per Skript gescrubbte Verschiebungen auf dem iPhone ein Bild nachhinken können. Ruckelt der Übergang dort, unter 768 px nur noch abdunkeln (`--cover`), ohne `y` und `scale`, und das dem Nutzer melden.
- Reduzierte Bewegung echt: im iOS-Simulator unter Einstellungen › Bedienungshilfen › Bewegung › „Bewegung reduzieren“ (nur im Simulator, nie in den Einstellungen des Macs). Die Seite steht dann untereinander, der Pin steht an seinem Platz.
- Nur Tastatur: Tab durch Balken, Team und Kontakt in sinnvoller Reihenfolge. Die Pfeiltasten wechseln die Person nur im Team. Sichtbarer Fokus wie überall im Theme (Global Constraints).
- Konsole ohne Fehler auf `/pages/ueber-uns`, `/pages/service`, `/pages/werkstatt` und `/`.

- [ ] **Step 3: Doku nachziehen, Theme Check, Commit**

```bash
git -C "$W" add docs/
git -C "$W" commit -m "Über uns: Doku zu Architektur, Motion-API, Dateien und Bildern"
```

- [ ] **Step 4: Übergabe an den Nutzer**

- Screenshots von Desktop und Handy schicken: Kopf, Umblättern auf halber Strecke, Team, Komm vorbei.
- Die Vorschau-Adresse nennen und klar sagen: noch nicht live.
- Den Nutzer bitten, im Theme-Editor des Vorschau-Themes zu prüfen (dafür braucht es die Anmeldung im Admin, die Agenten nicht machen):
  Seite statisch, alle Inhalte sichtbar, eine Etappe hinzufügen und verschieben, eine Person anwählen zeigt sie im Team.
- Um das Okay für den Push fragen. Erst danach: `git -C "$W" fetch origin`. Steht `origin/main` weiter (Theme-Editor-Änderungen des
  Händlers landen dort als Commits), `git -C "$W" rebase origin/main` und Konflikte in `templates/page.ueber-uns.json` und
  `config/settings_data.json` so lösen, dass die neuen Sections und die Änderungen des Händlers bleiben. Dann `UU.run()` und Theme Check
  noch einmal, danach `git -C "$W" push origin claude/ueber-uns-h:main` als Fast-Forward, nie mit Force.
- Das Vorschau-Theme „Über uns H Vorschau“, den Eintrag `ueber-uns-vorschau` und `$Q` danach nur auf Wunsch entfernen.
