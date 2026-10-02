# Motion-API (assets/motion.js)

Vertrag der Motion-Schicht des Themes. Hero, Startseite und Shop bauen darauf; Namen nicht ändern.
Die Datei selbst enthält nur einen Verweis hierher, damit der Vertragstext nicht bei jedem Seitenaufruf mitgeladen wird.

```text
Power Shop – Motion-Schicht: Reveals, Wort-Splitter, Count-up, Marquee, Parallax, Smooth-Scroll.
Lädt auf allen Templates (defer, nach theme.js, vor header.js). GSAP, ScrollTrigger und Lenis kommen nur auf
index, collection und product dazu, nur mit Setting und nie im Theme-Editor. Ohne sie läuft die Schicht im
Fallback (Reveals per IntersectionObserver, Count-up, Splitter, Marquee).

VERTRAG – daran bauen Hero (M2), Startseite (M4) und Shop (M5). Namen nicht ändern.

Zustand
  html.has-motion      Setzt der Head-Inline-Skript in theme.liquid. Fehlt sie (Setting aus, prefers-reduced-
                       motion, saveData, Theme-Editor, Failsafe 3,5 s), ist alles statisch und sichtbar; der
                       Theme-Editor ist komplett statisch. Start- und Bewegungszustände gelten NUR unter dieser
                       Klasse, eigene Bewegung ebenfalls dahinter bauen.
  html.has-smooth      Zusätzlich, wenn das Setting „Weiches Scrollen“ an ist.
  PS.motionReady       true, sobald diese Datei fertig ist (auch im Fallback). Das Event ps:motionready feuert vor
                       header/hero/home/sections.js: dort PS.motionReady direkt prüfen.
  PS.motion.enabled    true, solange Bewegung aktiv ist (bei prefers-reduced-motion zur Laufzeit false).
  PS.motion.scroll     true, wenn GSAP + ScrollTrigger laufen. Nur dann Scrub/Parallax bauen.
  PS.motion.*          theme.js legt einen No-op-Stub an: Aufrufe sind immer harmlos, kein Existenztest nötig.
  PS.lenis             Lenis-Instanz oder null (Setting, pointer:fine, ohne reduced-motion). Immer lazy prüfen:
                       PS.lenis && PS.lenis.stop(). Anker (#id) scrollt Lenis selbst (Abstand = html scroll-padding-
                       top) und fokussiert das Ziel. Tastatur-Scroll bricht ein laufendes Gleiten ab.

Attribute (Markup, alles optional)
  data-reveal="up|fade|clip|left"   Einblenden beim Scrollen, leer = up. .is-in = sichtbar (Hook). clip endet in
                                    clip-path:none, nie inset(0). In .rail nur opacity. Nicht aufs LCP-Element.
                                    Bei display:contents zählt das erste Kind.
  data-reveal-delay="200"           Verzögerung in ms (--rd).
  data-stagger[="70"]               Am Elternelement: Kinder blenden nacheinander ein (--i, max. 8 Stufen, Schritt in
                                    ms). Kinder ohne eigenes data-reveal fahren als up ein. Für kurze Gruppen.
  data-split="words"                Überschrift wortweise aus einer Maske, nach document.fonts.ready. Wort-Spans
                                    aria-hidden plus .sr-only-Kopie. Nur Text und Inline-Auszeichnung: mit Link, Button
                                    oder [tabindex] darin wird nicht zerlegt (sonst ohne Namen), der Block blendet dann
                                    als Ganzes ein (wie data-reveal). Zerlegen geht nur direkt am Link selbst.
  data-parallax="0.15"              Nur mit GSAP + ScrollTrigger. Weg = Wert × Elementhöhe, mittig. Den Überstand
                                    liefert das Markup: Bild im overflow:hidden-Container mit CSS scale ≥ 1 + Wert
                                    (0.2 → scale: 1.2). Belegt transform (Wrapper nutzen).
  data-countup[="1400"]             Zahl zählt hoch (ms). Reiner Text wie „25+“, „1.250 km“, „4,9“ (deutsches
                                    Zahlenformat); Original bleibt als .sr-only, im Druck gilt der Endwert.
                                    NICHT data-count (Warenkorb-Zähler im Header).
  data-marquee[="60"]               Lauftext-Spur (px/s), Kinder = ein Satz Inhalt, Klon aria-hidden + inert. Pause-Button
                                    ist Pflicht (WCAG 2.2.2): [data-marquee-toggle] in derselben Section (aria-pressed =
                                    angehalten, 44 px) oder, wenn keiner da ist, ergänzt motion.js einen (.marquee-toggle
                                    hinter der Spur, aria-label „Lauftext pausieren“). Pausiert auch bei Hover, Fokus und
                                    außerhalb des Bildes. Kein data-reveal/-split/-countup in der Spur.
  data-lenis-prevent                Am Dialog / vertikal scrollenden Container, damit Lenis dort das Wheel nicht
                                    fängt. Nicht an horizontale Schienen. Scrollbare Vorfahren, dialog[open],
                                    [role=dialog] und [aria-modal] erkennt Lenis ohnehin selbst (Cookie-Einstellungen,
                                    App-Overlays). overscroll-behavior:contain gilt nur in Dialogen (motion.css).
Per JS eingefügtes HTML (Drawer, AJAX) startet ein MutationObserver selbst, PS.scan(root) ist nicht nötig;
entfernte Elemente gibt er samt Aufräumern wieder frei. Elemente mit display:contents (z. B. .bento__col mobil)
beobachtet er über ihr erstes Kind. Im Theme-Editor ist alles aus, die shopify:section:*-Aufräumer laufen dort
nie (nicht darauf bauen).

Hilfs-API (Aufräumen pro Section bei shopify:section:unload, beim Entfernen des Elements und beim Abbau)
  PS.motion.add(el, function (gsap, ScrollTrigger) { ...; return ScrollTrigger.create(...); })
      Nur mit PS.motion.scroll. Rückgabe (Funktion, {kill}, {disconnect} oder Array) wird der Section zugeordnet.
  PS.motion.track(el, cleanup)   Dasselbe für eigene Observer/Listener, auch ohne GSAP.
  PS.motion.refresh()            ScrollTrigger neu messen (nach Layoutänderungen).
```

## Dateiaufteilung

Seit M1b liegen die Regeln und Module aus `sections.css`/`sections.js` nach Bereich getrennt, damit Hero/Header, Startseite und Shop
parallel an verschiedenen Dateien arbeiten. Inhalt und Reihenfolge der Regeln sind unverändert.

| Datei | Inhalt | Bereich |
|---|---|---|
| `assets/header.css` | Announcement-Bar, Header, Megamenü, Mobile-Menü, Such-Dialog | Hero + Header (M2) |
| `assets/hero.css`, `assets/hero.js` | Hero und Modell-Tabs (`hero.js` lädt nur auf index) | Hero + Header (M2) |
| `assets/home.css`, `assets/home.js` | Service-Leiste, Produkt-Grids, Kategorie-Bento, Showroom, Story | Startseite + Footer (M4) |
| `assets/footer.css` | Footer, Cookie-Banner | Startseite + Footer (M4) |
| `assets/shop.css` | Kategorieseite (Banner, Film-Intro, Filter), Produktseite, Warenkorb und Drawer | Kategorie, PDP, Warenkorb, Suche (M5) |
| `snippets/search-dialog.liquid` | Markup des Such-Dialogs, aus `sections/header.liquid` per `{% render %}` | Suche (M5), eingebunden im Header |
| `assets/sections.css` | geteilte Reste: Events, Service-Seite, eine mehrseitige `min-width`-Regel | Rest, Aufräumen in M6 |
| `assets/sections.js` | globale Section-Module: Showroom, Quick-Toggle der Produktkarte | Rest (Quick-Toggle: M5) |

CSS-Ladereihenfolge (`layout/theme.liquid`, entspricht der Kaskade): tokens, base, components, sections, theme, motion, header, hero, home,
footer, shop. Alle Dateien laden auf jeder Seite; die Bereichsdateien stehen hinter den Legacy-Dateien und können sie bei gleicher Spezifität
überschreiben. Klassen, die mehrere Bereiche nutzen, liegen in der Datei ihres ursprünglichen Blocks (z. B. `.product-grid` in `home.css`,
`.page-banner`, `.empty` und `.contact-box` in `shop.css`, `.payments` in `footer.css`, `.hide-mobile` in `header.css`): dort nur mit
Blick auf die anderen Seiten ändern.
