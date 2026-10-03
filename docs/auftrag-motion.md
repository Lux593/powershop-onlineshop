# Auftrag: Power-Shop-Theme auf Premium-Niveau bringen (Video-Hero, Motion, Scroll-Effekte)

Antworte dem Nutzer immer auf Deutsch, per Du, kompakt in Stichpunkten.

> Hinweis zur Übergabe: Dieser Auftrag wurde in einer Cloud-Sitzung vorbereitet. Dort waren die Plugins nicht ladbar
> (Konto: `enabled: false`). Er soll in einer **lokalen** Sitzung ausgeführt werden, in der die Plugins installiert sind.
> Im Repo wurde bisher nichts außer dieser Datei geändert.

## SCHRITT 0 – ZUERST, VOR JEDER ARBEIT: Plugins prüfen (harte Vorgabe des Nutzers)

Der Nutzer will ausdrücklich **nicht**, dass hier ohne die vereinbarten Plugins/Skills gearbeitet wird. Prüfe daher als allererste Aktion:

1. `ListPlugins` und `ListSkills` (Stichworte: frontend-design, shopify, design-critique, accessibility, liquid) bzw. die Skill-Liste im System-Prompt.
2. Erforderlich sind: **frontend-design** (Anthropic), **shopify-ai-toolkit** (Skills u. a. `shopify-liquid`, `shopify-dev`, `shopify-use-shopify-cli`) und **design** (`design:design-critique`, `design:accessibility-review`, `design:ux-copy`). Wünschenswert zusätzlich: **liquid-skills** von Shopify (`liquid-theme-a11y`, `liquid-theme-standards`, `shopify-liquid-themes`).
3. Versuche sie über das Skill-Tool aufzurufen (Namen exakt wie gelistet, evtl. mit Plugin-Präfix).
4. **Fehlen frontend-design, shopify-ai-toolkit oder design: STOPP.** Mache keine Änderungen, nimm keinen Higgsfield-Credit in Anspruch, sag dem Nutzer in wenigen Zeilen, was fehlt, und warte. Arbeite nicht stillschweigend ohne die Skills weiter.
5. Sind sie da: Lade die Skills, wenn die jeweilige Arbeit ansteht (frontend-design beim Hero/Typografie/Motion-Feinschliff, shopify-liquid/liquid-theme-* bei Liquid, Schema und Barrierefreiheit, design:design-critique + design:accessibility-review als QA am Ende). Subagenten geben die Skill-Anweisungen im Prompt mit, falls sie die Skills selbst nicht sehen.

## Kontext

Repo: `Lux593/powershop-onlineshop`, Custom-Shopify-Theme **Power Shop** (Harley-Davidson-Vertragshändler, Deutschland). Arbeitsbranch: **`claude/laughing-brahmagupta-fldc3b`** (nie direkt auf `main` pushen – ein Push auf `main` aktualisiert über die GitHub-Integration das Live-Theme). Der Branch ist inhaltlich identisch mit `main` (Commit `a4d8926`), plus diese Auftragsdatei.

Der Nutzer ist mit dem Shop unzufrieden: wirkt nicht professionell. Hero = statisches Foto mit Tabs, keine Motion-Schicht (kein Scroll-Reveal, Parallax, Autoplay, Smooth-Scroll, Text-Animation). Ziel: Auftritt auf dem Niveau von harley-davidson.com (Vollbild-Video-Hero, riesige Condensed-Headlines, cineastische Übergänge), schnell und barrierearm.

**Verbindliche Entscheidungen des Nutzers (nicht neu verhandeln):**
- Genau **ein KI-Clip** (Higgsfield, image-to-video) als Hero-Loop. Keine Downloads fremder H-D-Videos (Urheberrecht).
- Look: **Premium-cinematisch** (Vollbild-Video-Hero, Text-Reveals, Parallax, Smooth-Scroll, Hover-Effekte, Bento-/Karten-Animationen). KEIN Custom-Cursor, kein Pinned-Storytelling-Overkill.
- Umfang: **alles in einem Rutsch** (Startseite, Header, Kategorie, Produktkarten, PDP, Warenkorb).
- Auslieferung: Feature-Branch → **PR (kein Draft, ready for review)** → Preview-Theme in Shopify. Der Nutzer hat „Go" gegeben; kein weiteres Freigabe-Ping-Pong außer den unten genannten Nutzerschritten.
- Credits-Budget Higgsfield: Starter-Plan, ca. 464 Credits, maximal 2 Generierungsversuche; vor dem Generieren kurz den Credit-Verbrauch nennen.

## Befunde der Codebasis (bereits analysiert)

- Buildlos, vanilla JS (IIFE, Namespace `PS`), ca. 126 Theme-Dateien im Repo-Root, **`assets/` ist flach** (keine Unterordner). Kein Dawn/Horizon, keine package.json, keine CI, kein CLAUDE.md. `.theme-check.yml` = `theme-check:recommended`.
- Einhängepunkte: `PS.on(selector, init)` + `PS.scan` (`assets/theme.js:8-39`, läuft auch nach `shopify:section:load`), `PS.prefersReducedMotion()`, reservierte `[data-motion]`/`[data-parallax]` (`assets/theme.css:14-18`, ungenutzt), Tokens `--ease`, `--t-fast`, `--t-med`, `.textured` (`assets/tokens.css`), globales Reduced-Motion (`assets/base.css:99-101`). Orange-Flächen immer mit schwarzer Schrift (WCAG-Regeln in `docs/briefing.md`).
- Hero (`sections/hero.liquid`, 164 Z.; CSS `assets/sections.css:113-221`; JS `assets/sections.js:10-28`): gestapelte Fotos + ARIA-Tabs (Road Glide / Street Glide / CVO), 480-ms-Opacity-Crossfade, kein Autoplay/Video/Parallax/Text-Animation, Panels wechseln hart über `hidden`, Overlay fest im CSS. Hero-Bilder nur 1024×576 bzw. 1500×1000 (JPEG mit `.png`-Endung: `assets/hero-ride-road.png`, `-street.png`, `-cvo.png`; inzwischen als `.jpg` umbenannt), ohne srcset/WebP/`fetchpriority` (`snippets/media.liquid`). Header immer solid schwarz, sticky (`sections.css:11-12`, `sections/header.liquid`, `assets/header.js`).
- `layout/theme.liquid` (68 Z.): 5 blockierende CSS (tokens/base/components/sections/theme.css), JS defer: theme.js, header.js, cart.js, search.js, sections.js, contact.js (+ collection.js bei collection/search, product.js bei product). Fonts self-hosted (DSGVO) – gleiches Prinzip für JS-Libs: self-hosten.
- Startseite `templates/index.json`: hero → service-tiles → product-tabs → category-bento → showroom → story-events. `product-tabs` und `showroom` haben **keine Kollektion** (leere Bereiche), Story-`button_url` fehlt, Kennzahlen („25+ Jahre", „300+ Bikes") und Events sind erfunden, Footer enthält Platzhalter (rechtlich/UWG-relevant → nur Händler-Freigabe, kein Code-Task).
- Weitere Lücken: PDP-Galerie ohne Swipe (`snippets/pdp-gallery.liquid`), 801-KB-`assets/powershop-team.png` (inzwischen als WebP, ca. 140 KB), `hd-bar-shield.png` 160 KB bei 49 px Anzeige, Collection-Banner eager obwohl mobil `display:none`, `contact.js`/`search.js` global, doppelte Listener in `assets/collection.js` (~Z. 199/208), toter Code (`wish-drawer`, `.wish-btn`), veraltete Kommentare/Docs, `og:image` mit `http:`.
- Umgebung der Cloud-Sandbox (nur zur Info; lokal kann es anders sein): Web gesperrt, npm erreichbar. npm: `gsap` 3.15 (Standard-„no charge"-Lizenz; `dist/gsap.min.js`, `dist/ScrollTrigger.min.js`), `lenis` 1.3.26 (MIT, `dist/lenis.min.js`), `@shopify/cli` 4.8, `liquidjs`, `playwright`. Chromium per `executablePath` starten (kein `playwright install` in der Cloud). Benötigt: `ffmpeg`/`ffprobe`, Node 22. Higgsfield-MCP (`balance`, `models_explore`, `generate_video`, `media_upload_widget`, `media_import_url`, `jobs_wait`, `upscale_image`) und Shopify-MCP (`search_collections` etc.) sollen verfügbar sein.

## Rahmen & Risiken

- **IP/Kennzeichnung:** Der Clip entsteht aus einem H-D-Pressefoto (EXIF-Copyright im CVO-Bild). Nutzer als Vertragshändler weisen: Händlervertrag/Brand-Guidelines prüfen, KI-Kennzeichnungspflicht (EU-KI-VO Art. 50) prüfen lassen; im Clip auf KI-Verfälschungen (Tank-Emblem, Logos, Räder, Fahrer) achten. Später 1:1 durch Originalmaterial ersetzbar (gleicher Dateiname).
- **Higgsfield-Upload:** Higgsfield kann lokale Dateien nicht direkt lesen → Startbild per `media_upload_widget` hochladen lassen (**Nutzer-Klick**, in dem Turn nur dieses Tool aufrufen) oder per `media_import_url`, falls das Repo öffentlich ist.
- **Clip-Download:** Falls der Higgsfield-CDN-Host gesperrt ist → Nutzer gibt den Host frei oder lädt das MP4 selbst in Shopify Files (`video_picker`) bzw. nach `assets/` hoch. Bis dahin läuft der Hero mit Poster-Standbild; Rest der Arbeit nicht blockieren.
- **KI-Qualität:** Räder/Fahrer können morphen → Frame-Check per Screenshot, sonst 2. Versuch mit anderem Modell (z. B. Kling v3.0 Pro mit identischem Start-/Endbild für nahtlosen Loop, ohne Ton; Alternative Seedance 2.5 1080p).
- **iOS Low-Power:** Safari blockiert Autoplay → Poster + Play-Button.
- **GSAP:** Lizenzkopf in den Dateien behalten.
- **Nur im Preview-Theme prüfbar (Checkliste für den Nutzer):** Theme-Editor-Reload, AJAX-Filter, Warenkorb, Checkout, echtes mobiles Lighthouse, CDN-Range-Requests fürs Video.
- Theme ist auf Deutschland ausgelegt (€, § 25a UStG, DSGVO). Falls Schweiz gemeint ist, wäre das ein separater Umbau (nur als offener Punkt erwähnen).

## Umsetzung (Meilensteine = Commits auf dem Arbeitsbranch)

Arbeitsweise: sequenziell nach Meilensteinen; parallele Subagenten nur für **lesende** Analyse/Review oder für Schreibarbeit mit strikt **disjunkten Dateien** (gleiche Datei nie parallel editieren, z. B. `assets/sections.css`, `templates/index.json`, `layout/theme.liquid`). Das Workflow-Tool nur, wenn der Nutzer es ausdrücklich verlangt; sonst Agent-Subagenten. Fortschritt per TaskCreate/TaskUpdate tracken.

### M0 – Baseline
Render-Harness im Scratchpad (nicht im Repo): `liquidjs` mit Shopify-Stubs (`asset_url`, `image_url`, `image_tag`, `money`, `render`, `section`, `sections`, `stylesheet_tag`, `t`, `json` …; Sections aus `templates/index.json` mit Schema-Defaults + Block-Settings) + Playwright/Chromium. Baseline-Screenshots Desktop 1440×900 und Mobil 390×844; `npx @shopify/cli theme check` als Referenz.

### M1 – Motion-Fundament
- Dateien (flach in `assets/`): `motion.css`, `motion.js` (≤ 8 KB gzip, funktioniert auch ohne GSAP), `gsap.min.js`, `ScrollTrigger.min.js`, `lenis.min.js` (aus `gsap/dist`, `lenis/dist`, mit Lizenzkopf; ≈ 45 KB gzip, self-hosted wegen DSGVO). **Kein SplitText** – eigener ~30-Zeilen-Wort-Splitter (Wort-Maske `overflow:hidden`, `translateY(110%→0)`, Originaltext per `aria-label`). Platzhalter `assets/hero.js` anlegen, damit nichts 404t.
- Laden (`layout/theme.liquid`): Inline-Skript im `<head>` setzt `html.has-motion` nur wenn `settings.motion_enabled` und weder `prefers-reduced-motion` noch `saveData`. Failsafe: setzt `motion.js` nicht binnen 3,5 s `PS.motionReady`, wird die Klasse wieder entfernt. `motion.js` auf allen Templates (defer); GSAP-Stack nur auf `index`, `collection`, `product`. Startzustände (`opacity:0`) gelten nur unter `.has-motion` → ohne JS alles sichtbar. Alle `theme.liquid`-Änderungen (inkl. `hero.js`-Tag nur auf index, Header-Overlay-Attribut) in diesem Meilenstein bündeln.
- Datenattribute: `data-reveal="up|fade|clip|left"` (+ `data-reveal-delay`), `data-stagger` am Elternelement (JS setzt `--i`, max. 8), `data-split="words"`, `data-parallax="0.15"`, `data-count`.
- Integration: alles über `PS.on(...)`; gemeinsamer IntersectionObserver für Reveals; ScrollTrigger-Instanzen pro Section in einer WeakMap, `shopify:section:unload` räumt auf; in `Shopify.designMode` sind Reveals sofort sichtbar und Lenis aus.
- Lenis ↔ ScrollTrigger: `lenis.on('scroll', ScrollTrigger.update)`, `gsap.ticker.add`, `lagSmoothing(0)`; Lenis aus bei Reduced-Motion/Touch; `data-lenis-prevent` an `.drawer__body`, `.rail`, `.search__results`, `dialog`; `PS.openDialog` stoppt Lenis, `close` startet es.
- Settings (`config/settings_schema.json`): Gruppe „Animationen": `motion_enabled`, `motion_smooth_scroll`, `header_overlay_home` (alle standardmäßig an = Notaus).
- Tokens (`assets/tokens.css`): `--ease-out`, `--t-slow: 700ms`, `--fs-display: clamp(64px, 11vw, 200px)`, `--section-y`. Stub `assets/theme.css:14-18` ersetzen.
- Budget: Index-JS ≤ 60 KB gzip, CLS < 0.05, TBT < 200 ms; animiert werden nur `transform`, `opacity`, `clip-path`; Video lädt erst nach `window.load` + Idle.

### M2 – Hero & Header (`sections/hero.liquid`, neu `assets/hero.js`, `assets/sections.css`, `assets/header.js`, `sections/header.liquid`, `assets/sections.js`)
- Schema: Sektion `overlay_opacity`, `overlay_direction`, `autoplay_seconds` (4–12); Block `video` (video_picker), `video_asset` (Default `hero-loop`), `poster`/`poster_asset`. Video gehört nur zu Slide 1 (Road Glide); Slide 2/3 = Foto mit CSS-Ken-Burns (Scale 1→1.08), Überblendung über das Video. Modell-Tabs bleiben ARIA-Tabs (Pfeiltasten + Home/End). `templates/index.json` Hero-Block nicht anfassen (Schema-Defaults genügen), damit M4 die Datei exklusiv besitzt.
- Markup: Poster = `<img fetchpriority="high" loading="eager" decoding="async">` mit srcset (LCP). Darüber `<video muted playsinline loop preload="none">`; JS wählt Quelle (< 768 px → 720p, sonst 1080p; WebM nur bei `canPlayType`). Video wird bei `playing` eingeblendet, pausiert per IntersectionObserver außerhalb des Bildes und bei `visibilitychange`. Übersprungen bei `saveData`, 2G/3G, Reduced-Motion → Poster + Play-Button.
- Layout: `100svh`; mobil ebenfalls Vollbild mit Text unten über Gradient (ersetzt „Foto oben/Text unten"). Headline `clamp(64px, 11vw, 200px)`, Barlow Condensed, Zeilenhöhe 0.88; Wort-Reveal, danach Blurb/Preis/Buttons mit Stagger. ScrollTrigger-Scrub: Video-Scale 1→1.08, Overlay dunkler, Text mit 0.15 Parallax; animierter Scroll-Indikator.
- Autoplay (WCAG 2.2.2): Rotation nach `autoplay_seconds` mit Progress-Bar am Tab; Pause bei Hover/Fokus; Klick auf Tab beendet Rotation dauerhaft; `.hero__pause` (44 px, `aria-pressed`) steuert Video, Rotation und Bar; bei Reduced-Motion startet die Seite pausiert. Hero-Code zieht aus `sections.js:10-28` in `hero.js` (nur index).
- Header: `data-header-overlay` nur auf index und nur mit Setting; Hero zieht per `margin-top: calc(var(--header-h) * -1)` unter den Header; oben transparent, nach ~40 px solid schwarz + Blur. Hide-on-scroll-down/show-on-scroll-up ab 400 px Tiefe auf allen Seiten – nie bei offenem Megamenü/Dialog/Fokus im Header. Sticky-Offsets (`.pdp__info`, `.service-nav`) über `--header-shown` (0/1).

### M3 – KI-Clip & Poster (parallel zu M1/M2 möglich, reine Assets)
1. `balance` + `models_explore` → Credit-Verbrauch nennen.
2. `assets/hero-ride-road.jpg` (1024×576) per `upscale_image` auf ~2K → Upload per `media_upload_widget` (Nutzer-Klick).
3. Generierung: 8 s, 16:9, Start- = Endbild (natürlicher Loop), ohne Ton. Prompt (EN): „slow cinematic push-in, two riders on a Harley-Davidson Road Glide, golden hour highway, subtle wind and road motion, photoreal, no text, bike design unchanged". Fallback ohne Endbild: ffmpeg `xfade` 1 s.
4. Encoding ohne Ton: MP4 H.264 `-crf 24 -preset slow -g 48 -movflags +faststart -an` (1080p ≤ 2,5 MB, 720p ≤ 1 MB); WebM VP9 `-crf 34 -b:v 0`; Poster WebP/JPG aus Frame 0 des fertigen Loops (1920 px ≤ 120 KB) → `assets/hero-loop.mp4`, `hero-loop-720.mp4`, `hero-loop.webm`, `hero-poster.webp`.
5. Frame-Check per Playwright-Screenshots auf Morphing/Logo-Fehler; Download-Hürde siehe Rahmen.

### M4 – Startseite (`sections/*.liquid`, `assets/sections.css`, `templates/index.json`)
- Neu `sections/statement.liquid` (große Markenaussage, Wort-für-Wort-Scroll-Scrub) in `templates/index.json`. Das ursprünglich geplante orange Lauftext-Band unter dem Hero entfällt (Entscheidung des Nutzers).
- service-tiles: Stagger; Icon hebt sich, orange Wipe-Linie. product-tabs: Slide/Fade-Panel, gleitender Indikator (`--ind-x/--ind-w`), Karten-Stagger. category-bento: Clip-Reveal (`inset(8%)→inset(0)`, Bild-Scale 1.15→1), Stagger, Bild-Parallax. showroom: Stagger, Scroll-Fortschritt am Rail (`--rail-progress`), Kantenmaske. story-events: Count-up (Text bleibt im DOM; Parser trennt Präfix/Zahl/Suffix), Bild-Parallax, Event-Stagger, vergangene Events per Liquid-Datumsvergleich ausblenden. Footer: Newsletter-Reveal, Wipe-Unterstreichung.
- Fixes: Kollektionen für `news`/`showroom` setzen (Handles `herren`, `damen`, `teile`, `accessoires`, `motorraeder` zuerst per `mcp__Shopify__search_collections` verifizieren); Story-`button_url` setzen oder Button entfernen.

### M5 – Rest des Shops
- Megamenü: Stagger der `.mega__inner > *` (translateY 8 px, 40 ms-Schritte), Wipe-Linie an Nav-Links.
- Collection (`assets/collection.js`): Karten-Stagger per IO; nach `apply()` `PS.scan(root)`, Austausch in `document.startViewTransition` (falls verfügbar, nicht Reduced-Motion) statt Opacity-Dim (`theme.css:33-34`); Banner `lazy`; Listener auf Modulebene mit Guard.
- Karten (`snippets/product-card.liquid`, `snippets/bike-card.liquid`, `assets/components.css:179-236`): Bild-Fade-in bei Load, längerer Zoom, 2.-Bild-Crossfade, Quick-Add-Slide, Fokus-Ring; Quick-Add aus der Tab-Reihenfolge (`inert`).
- PDP (`snippets/pdp-gallery.liquid`, `assets/product.js`): Scroll-Snap-Swipe mobil, Pointer-Zoom in der Lightbox, Add-to-Cart-Mikrointeraktion, Sticky-Mobilleiste mit Slide-in, Reveals; Produktvideo nur falls vorhanden.
- Cart-Drawer (`assets/cart.js`, `sections/cart-drawer.liquid`): Zeilen-Stagger, animierter Versand-Fortschrittsbalken, Bump am Warenkorb-Icon bei `ps:cart`. Suche: Dialog mit Scale/Blur-Backdrop.
- Seitenübergänge: `@view-transition { navigation: auto; }` (Cross-Document), kurzer Fade, Header mit `view-transition-name`, Reduced-Motion und Cart/Checkout ausgenommen.

### M6 – Politur & Cleanup
- Typo/Spacing: größere Display-Headlines, engeres Tracking, einheitlicher Section-Rhythmus, Eyebrow-Labels; Hex-Lecks (`components.css` ~Z. 55-57,137,229; `sections.css` ~Z. 65,86,111,269,313,367,440,446) auf Tokens; `.textured` ohne `mix-blend-mode` (statisches Noise-Bild).
- Bilder: `snippets/media.liquid` mit `fetchpriority`, `srcset`, `decoding`; Asset-Fallbacks als WebP (ffmpeg); `powershop-team.png` → ~150 KB WebP; `hd-bar-shield.png` auf 2× Anzeigegröße (98 px); Hero-Stills als echte `.jpg`/WebP (Referenzen in `index.json`/Schema nachziehen); EXIF (H-D-Copyright) im CVO-Bild prüfen/strippen.
- JS/CSS: `contact.js`/`search.js` nur bei Bedarf laden; Barlow 800 vorladen (`snippets/fonts.liquid`).
- Cleanup: `wish-drawer`/`.wish-btn` und stale Kommentare/Docs entfernen; `og:image` `http:` → `https:`.

### M7 – Verifikation & Übergabe
Siehe unten; danach `git push -u origin claude/laughing-brahmagupta-fldc3b` und PR gegen `main` (**kein Draft**; Repo hat kein PR-Template). Danach dem Nutzer anbieten, den PR per `subscribe_pr_activity` zu beobachten (nur in der Cloud-Variante verfügbar).

## Wiederverwendung (nicht neu bauen)
`PS.on`/`PS.scan`/`PS.selectTab` (`assets/theme.js`), `PS.prefersReducedMotion`, `snippets/media.liquid`, `snippets/bento-tile.liquid`, `.rail` (`assets/components.css` ~Z. 277), `.textured`, bestehende Tokens/Easings, `icon`-Snippet/Sprite.

## Verifikation

Ohne Shopify-Zugang:
1. `npx @shopify/cli theme check` (bzw. `@shopify/theme-check-node`) → keine neuen Fehler/Warnungen.
2. Render-Harness (M0) rendert Hero, Bento, Story, Produkt-Tabs.
3. Playwright/Chromium: Screenshots 1440×900 und 390×844 bei Scroll 0/25/50/100 %, Kontexte `reducedMotion: 'reduce'` und `javaScriptEnabled: false` (Inhalte sichtbar?), Konsole fehlerfrei, Video spielt/pausiert, CLS per PerformanceObserver (< 0,05).
4. `@axe-core/playwright` (WCAG 2.1 AA, 0 Verstöße), Lighthouse lokal (LCP Poster, JS-Zuwachs ≈ 55 KB gzip), Clip-Größen per `ffprobe`/`ls`.
5. QA mit den Plugin-Skills `design:design-critique` + `design:accessibility-review` auf den Screenshots; zusätzlich unabhängige Review-Subagenten (Lenses: A11y/WCAG inkl. 2.2.2, Shopify-Korrektheit/Theme-Editor-Reload, Performance, Motion-Robustheit ohne JS/Reduced-Motion/designMode, Regression bei Warenkorb/Filter). Findings beheben und erneut prüfen.

Nur im Preview-Theme (Checkliste für den Nutzer): Onlineshop → Themes → Theme hinzufügen → Aus GitHub verbinden → Branch `claude/laughing-brahmagupta-fldc3b`, dann prüfen: Theme-Editor (Sections hinzufügen/neu laden, Hero-Settings), Filter/Pagination, Warenkorb-Drawer, Checkout-Branding, iOS-Safari-Autoplay, echte Kollektionen/Produkte, mobiles Lighthouse. Erst danach nach `main` mergen.

## Nutzer-Schritte (kündige sie an, wenn sie anstehen)
Plugin-Prüfung (Schritt 0) · Credit-Hinweis vor der Generierung · Upload-Klick für das Startbild · ggf. Netzwerk-Host-Freigabe oder manueller Clip-Upload · Händler-Freigabe für Kennzahlen/Events/Footerdaten · Preview-Theme in Shopify verbinden.

## Stand bei Übergabe
Im Repo existiert nur diese Datei. Es wurde noch kein Theme-Code geändert, kein Higgsfield-Credit verbraucht. Beginne mit Schritt 0.
