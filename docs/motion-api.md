# Motion-API (assets/motion.js)

Vertrag der Motion-Schicht des Themes. Hero, Startseite und Shop bauen darauf; Namen nicht ändern.
Die Datei selbst enthält nur einen Verweis hierher, damit der Vertragstext nicht bei jedem Seitenaufruf mitgeladen wird.

```text
Power Shop – Motion-Schicht: Reveals, Wort-Splitter, Count-up, Parallax, Smooth-Scroll.
Lädt auf allen Templates (defer, nach theme.js, vor header.js). GSAP und ScrollTrigger kommen nur auf der Startseite
dazu (nur dort gibt es Scrub und Parallax), nur mit Setting und nie im Theme-Editor. Lenis (weiches Scrollen) lädt
nach, nur auf index, collection und product und nur für Maus und Trackpad. Ohne sie läuft die Schicht im
Fallback (Reveals per IntersectionObserver, Count-up, Splitter).

VERTRAG – daran bauen Hero, Startseite und Shop. Namen nicht ändern.

Zustand
  html.has-motion      Setzt der Head-Inline-Skript in theme.liquid. Fehlt sie (Setting aus, prefers-reduced-
                       motion, saveData, Theme-Editor, Failsafe 3,5 s), ist alles statisch und sichtbar; der
                       Theme-Editor ist komplett statisch. Start- und Bewegungszustände gelten NUR unter dieser
                       Klasse, eigene Bewegung ebenfalls dahinter bauen.
  html.has-smooth      Zusätzlich, wenn das Setting „Weiches Scrollen“ an ist. Fällt weg, wenn Lenis nicht lädt.
  PS.motionReady       true, sobald diese Datei fertig ist (auch im Fallback). Das Event ps:motionready feuert vor
                       header/hero/home/sections.js: dort PS.motionReady direkt prüfen.
  PS.motion.enabled    true, solange Bewegung aktiv ist (bei prefers-reduced-motion zur Laufzeit false).
  PS.motion.scroll     true, wenn GSAP + ScrollTrigger laufen (nur auf der Startseite). Nur dann Scrub/Parallax bauen.
  PS.motion.*          theme.js legt einen No-op-Stub an: Aufrufe sind immer harmlos, kein Existenztest nötig.
  PS.lenis             Lenis-Instanz oder null (Setting, pointer:fine und hover:hover, ohne reduced-motion). Lenis lädt
                       nach motion.js (Head-Skript setzt PS.lenisSrc und lädt vor), daher immer lazy prüfen:
                       PS.lenis && PS.lenis.stop(). Ein Dialog, der vor dem Start offen war, hält es beim Start an.
                       Mit GSAP (Startseite) gibt dessen Ticker den Takt, sonst läuft Lenis mit autoRaf.
                       Anker (#id) scrollt Lenis selbst (Abstand = html scroll-padding-top) und fokussiert das Ziel.
                       Tastatur-Scroll bricht ein laufendes Gleiten ab. html.lenis setzt scroll-behavior mit !important
                       auf auto: ScrollTrigger schreibt es sonst inline zurück.

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

## Verträge der Shop-Schicht

Auf diese Namen bauen Hero, Warenkorb, Karten, Kollektion und Produktseite. Sie gehören zur Motion-Schicht, auch wo der Code in
`cart.js`, `sections.js`, `collection.js`, `product.js` oder `hero.js` steht.

```text
Ereignisse
  ps:motionready     Auf document, wenn motion.js fertig ist (siehe oben).
  ps:cart            Auf document, nach jedem Abgleich von Drawer, Zähler und Warenkorb-Seite (cart.js).
                     detail = { count, previous }: Artikelzahl danach und davor (davor aus data-count des Zählers).
                     Es feuert auch beim Entfernen und Verringern: Bewegung nur bei count > previous (das Symbol
                     [data-cart-trigger] wippt dann als .is-bump). Die Warenkorb-Seite lädt sich bei jedem ps:cart neu.
  ps:open            Am <dialog>, wenn PS.openDialog ihn geöffnet hat (blubbert nicht). Es gibt kein ps:close:
                     dafür das native close-Ereignis des Dialogs nutzen.
  ps:tab             Am Tablist (blubbert nicht), detail = der gewählte Tab (Element). Quelle: PS.selectTab.

Dialoge
  data-lazy-script="URL"   Am <dialog>: PS.openDialog hängt das Skript beim ersten Öffnen an (Such-Dialog: search.js).
                           Schlägt das Laden fehl, versucht das nächste Öffnen es erneut. Das Skript startet über PS.on
                           und muss damit rechnen, dass ps:open schon gefeuert hat (search.js fokussiert dann selbst).
                           Bedienelemente im Dialog brauchen einen Rückfall ohne das Skript: die Chips „Beliebte Suchen“
                           sind Links auf die Suchseite, search.js fängt den Klick ab und füllt stattdessen das Feld.

Produktkarte (snippets/product-card.liquid, assets/sections.js)
  PS.quick(card, open)     Öffnet oder schließt das Quick-Add-Panel einer .pcard: setzt .is-quick-open an der Karte und
                           aria-expanded am [data-quick-toggle], gibt den Toggle zurück. Nur PS.quick setzt beides, das CSS
                           koppelt die Sichtbarkeit an die Klasse. Der Klick auf den Toggle (öffnet, schließt alle anderen
                           Karten) und Escape (schließt, Fokus zurück auf den Toggle) sind in sections.js verdrahtet.
                           Am Desktop (Hover, ab 1024 px) zeigt Hover oder Tastaturfokus das Panel, dort gibt es keinen Toggle.

Kollektion und Suche (assets/collection.js, Regeln in shop.css)
  Nachgeladenes HTML       collection.js parst die Antwort über ein <template>, nicht über DOMParser: ein geparstes Dokument mit
                           <video> (Film-Kollektionen) bliebe sonst je Austausch im Speicher (+1200 Knoten).
  [data-results]           Ergebnisbereich. Beim Nachladen (Filter, Sortierung, Seitenwechsel) setzt collection.js sofort
                           aria-busy="true" und nach 160 ms .is-loading (sichtbarer Ladehinweis).
  is-vt, is-vt-results     Mit PS.motion.enabled und document.startViewTransition tauscht collection.js die Ergebnisse als
                           View Transition aus. Nur dafür trägt [data-results] .is-vt (view-transition-name: results) und
                           html .is-vt-results (Root-Überblendung aus: Header und Filterleiste bleiben stehen). Beide Klassen
                           entfernt nur die jüngste Überblendung. Ohne View Transition (Browser, Reduced-Motion, Setting aus)
                           wird ohne Überblendung getauscht. Reveals im neuen HTML startet motion.js selbst (MutationObserver).

Produktseite (snippets/pdp-buy.liquid, snippets/pdp-sticky-buy.liquid, assets/product.js)
  [data-sticky-buy]        Mobile Kaufleiste (Teile, Bekleidung). product.js setzt .is-shown, sobald der Kaufbereich
                           (.pdp__buy) oben aus dem Bild ist, und nimmt es am Seitenende (Footer sichtbar) wieder weg.
  [data-sticky-contact]    Kontaktleiste der Motorräder statt der Kaufleiste; product.js setzt body.has-sticky-contact.
  [data-variant-id]        Das versteckte Feld „id“ des Formulars trägt immer die gewählte Variante: Liquid füllt es bei genau einer
                           Option Farbe/Color (die erste verfügbare Variante gilt als gewählt), product.js beim Start, nach jeder
                           Auswahl und im Submit-Handler unmittelbar vor dem Absenden. Ohne vollständige Auswahl bleibt es leer.
  Live-Region              product.js legt beim Start eine sr-only Region (role=status) an und sagt nach einer Variantenwahl
                           „Option / Option, Preis, ausverkauft“ an (Preis und Lager tauschen sich per innerHTML aus).

Warenkorb (assets/cart.js, snippets/cart-line.liquid)
  PS.cart.add(payload)             Alle Schreibzugriffe laufen über eine Warteschlange, nie zwei Anfragen gleichzeitig: Die Antwort mit dem
  PS.cart.change(target, quantity) älteren Stand könnte sonst den neueren Drawer überschreiben. target = Schlüssel der Position
                                   (item.key, Attribut data-key an allen Steuerungen einer Position; bleibt bei Änderungen an anderen
                                   Positionen gültig) oder Zeilennummer ab 1 (Rückfall, data-line). cart.js sendet den Schlüssel als „id“.
                                   PS.cart.refresh gibt es nicht mehr (war ungenutzt).
  Fehlermeldungen                  Nur ein 422 (Bestand, Mengengrenze) zeigt die Meldung der API, Shopify liefert sie in der Shop-Sprache.
                                   Alles andere zeigt einen deutschen Satz statt rohem Englisch („Cannot find variant“).
  Steuerungen                      aria-label nennen das Produkt („Menge erhöhen: Titel“), ebenso Größenknöpfe und „In den Warenkorb“ der Produktkarte.

Toast (assets/theme.js, PS.toast(msg, icon))
  Bestätigungen bleiben 3,6 s. Meldungen mit dem Icon circle-alert (Fehler, Hinweise) bleiben 10 s, halten an, solange Zeiger oder
  Fokus darauf sind (WCAG 2.2.1), und schließen mit Klick oder Escape (.toast--alert).

Cookie-Einstellungen ([data-cookie-settings], Footer-Knopf, assets/theme.js)
  Reihenfolge: window.privacyBanner.showPreferences() (Cookie-Banner von Shopify) → Shopify.customerPrivacy.showPreferences() →
  Shopify.loadFeatures consent-tracking-api und danach showPreferences → Hinweis „nicht verfügbar“. Die Schnittstellen gehören Shopify.

Schienen (.rail, assets/theme.js)
  Die Pfeile ([data-rail-prev], [data-rail-next]) sperren am Anfang und Ende über aria-disabled, nicht über disabled: ein per Tastatur
  bedienter Pfeil behält so den Fokus. Das CSS (components.css) behandelt beide Schreibweisen gleich.

Tooltip (.tip, assets/sections.js, components.css; WCAG 1.4.13)
  Die Blase bleibt sichtbar, solange Zeiger oder Fokus auf Knopf oder Blase liegen (die Brücke ::before füllt den Spalt). Escape blendet
  sie aus (.tip.is-dismissed), ohne dass Fokus oder Zeiger wandern; sie kommt wieder, sobald beide die Info verlassen haben.

Showroom (sections/showroom.liquid, assets/theme.css, assets/sections.js)
  Das Limit von zwölf Karten gilt je Zustand (Neu / alles andere), nicht für die ganze Kollektion. Hat die gewählte Gruppe keine Fahrzeuge,
  zeigt .showroom__none[data-showroom-none="neu|gebraucht"] einen Hinweis; das CSS blendet nur den der gewählten Gruppe ein.

Kontakt (snippets/contact-href.liquid, assets/contact.js)
  Telefon, WhatsApp und E-Mail aus den Händlerdaten gehen nur über contact-href in href-Attribute (Leerzeichen, +, Klammern entfernt,
  Anführungszeichen maskiert); contact.js bereinigt die Nummer für wa.me auf Ziffern und kodiert die E-Mail.

Hero (sections/hero.liquid, assets/hero.js; nur Startseite, PS.on('[data-hero]'))
  Film                     Poster-<img> (LCP, nie versteckt) plus <video data-src ...>. Der Film startet nach window.load und
                           Idle, nur im Bild und im sichtbaren Tab. Er entfällt bei saveData, 2G/3G, Reduced-Motion, im
                           Theme-Editor und bei abgelehntem play() (iOS Low-Power): dann bleiben Poster und Play-Taste. Mobil
                           lädt die 540p-Datei, sonst WebM (nur wenn sicher abspielbar), sonst MP4.
  Bilder der Slides        Inaktive Slides rendern nicht (hero.css: content-visibility: hidden), ihre lazy Bilder laden daher nicht
                           gegen das Poster. hero.js holt sie nach Load plus Idle (loading = eager), außer bei saveData und
                           2G/3G; ein Tab-Klick davor lädt den gewählten Slide sofort.
  Tabs, Rotation           Die Modell-Tabs (role=tab) hören auf ps:tab: Slide wechselt über .is-active und aria-hidden, der
                           abgelöste Slide bleibt 800 ms als .is-leaving darunter. Mit Bewegung rotiert der Hero nach der
                           Standzeit (Setting „Bildwechsel nach“, --hero-dur); die Linie am Tab füllt sich per CSS, ihr Ende
                           (animationend hero-progress) wählt den nächsten Tab. Der erste Klick oder Tastendruck auf einen
                           Tab beendet die Rotation.
  Pause-Taste              .hero__pause (aria-pressed) hält Film, Rotation und die laufenden Bewegungen an (WCAG 2.2.2). Ohne
                           Bewegung oder bei saveData/2G/3G startet die Seite pausiert. Im Theme-Editor wählt
                           shopify:block:select den Slide, shopify:section:unload räumt auf (auch Reduced-Motion zur
                           Laufzeit über PS.motion.track).
  Scrub                    Nur mit PS.motion.scroll (PS.motion.add): Film skaliert 1 → 1,08, Abdunkeln bis 0,55, die
                           Textebene wandert 0,15 des Scrolls, höchstens 40 px und nur ab 768 x 541 px. Pause-Taste und
                           Weiter-Pfeil bleiben stehen, der Pfeil blendet beim Scrollen aus.
  Weiter-Pfeil             .hero__scroll: mit JavaScript zeigt href auf die ID des ersten sichtbaren Elements nach dem Hero,
                           ohne JavaScript auf das Setting „scroll_target“ (Standard nach-hero, in index.json die Anker-ID
                           der Service-Leiste).
```

## Skripte

Alle laden mit `defer` am Seitenende von `layout/theme.liquid`, die Reihenfolge ist die Ausführungsreihenfolge.

| Skript | Lädt auf | Zweck |
|---|---|---|
| `theme.js` | überall | Kern: `PS.on`, Dialoge, Tabs, Toast |
| `gsap.min.js`, `ScrollTrigger.min.js` | nur index, nur mit Setting, nie im Theme-Editor | Scrub, Parallax, Takt für Lenis |
| `lenis.min.js` | index, collection, product, nur mit „Weiches Scrollen“ und nur für Maus/Trackpad (`pointer: fine`, `hover: hover`). Kein `<script>` am Seitenende: das Head-Skript lädt es vor, `motion.js` hängt es an. Touch-Geräte laden es nie | Weiches Scrollen |
| `motion.js` | überall (vor `header.js`) | diese Schicht |
| `header.js`, `cart.js`, `sections.js` | überall | Header, Warenkorb und Drawer, Showroom und Quick-Add |
| `contact.js` | product, page, im Theme-Editor immer | Kontakt-Box: Thema wählen, WhatsApp-/E-Mail-Link, Öffnungsstatus |
| `search.js` | beim ersten Öffnen des Such-Dialogs (`data-lazy-script`) | Vorschläge der Suche |
| `collection.js` | collection, search | AJAX-Filter, Sortierung, Seitenwechsel |
| `product.js` | product | Galerie, Varianten, Kaufleisten |
| `hero.js`, `home.js` | index | Hero, Statement-Scrub, Tab-Indikator, Schienen |

Eine Kontakt-Box oder ein Startseiten-Baustein, den der Händler im Theme-Editor auf ein anderes Template legt, läuft ohne das passende
Skript statisch weiter (Kontakt-Links ohne vorausgefüllte Nachricht, kein Scrub).

## Dateiaufteilung

Die Regeln und Module liegen nach Bereich getrennt (früher alles in `sections.css`/`sections.js`).

| Datei | Inhalt |
|---|---|
| `assets/header.css` | Announcement-Bar, Header, Megamenü, Mobile-Menü, Such-Dialog. Das geschlossene Megamenü rendert nicht (`content-visibility: hidden`), seine lazy Bilder holt `header.js` nach Load plus Idle (Desktop, ohne Datensparen), ein Hover lädt sie sofort |
| `assets/hero.css`, `assets/hero.js` | Hero und Modell-Tabs (beide laden nur auf index) |
| `assets/home.css`, `assets/home.js` | Statement, Service-Leiste, Produkt-Grids, Kategorie-Bento, Showroom, Story |
| `assets/footer.css` | Footer |
| `assets/shop.css` | Kategorieseite (Banner, Film-Intro, Filter), Produktseite, Warenkorb und Drawer, Bewegung der Shop-Seiten (Megamenü, Karten, View Transitions) |
| `snippets/search-dialog.liquid` | Markup des Such-Dialogs, aus `sections/header.liquid` per `{% render %}` |
| `assets/sections.css` | geteilte Reste: Events (Raster und Karten), Service-Seite, eine `min-width`-Regel für Grid-Kinder mehrerer Bereiche |
| `assets/theme.css` | Shopify-Ergänzungen; am Ende der Block `@media (forced-colors: active)` für gewählte Zustände (Umschalter, Chips, Farbfelder, Hero-Tabs, Spalten-Wahl), auch für Klassen aus `shop.css`/`hero.css` (dort mit einer Stufe mehr Spezifität). Der Tab-Indikator der Produkt-Tabs steht in `home.css`. |
| `assets/sections.js` | globale Section-Module: Showroom, Quick-Toggle der Produktkarte (`PS.quick`), Escape für Tooltips |

CSS-Ladereihenfolge (`layout/theme.liquid`, entspricht der Kaskade): tokens, base, components, sections, theme, motion, header, hero, home,
footer, shop. Auf der Startseite laden alle elf Dateien, auf allen anderen Seiten zehn (ohne `hero.css`). Die Sonderlayouts laden nur sechs: `layout/password.liquid` und
`templates/gift_card.liquid` binden tokens, base, components, sections, theme und header ein, nicht motion, hero, home, footer und shop.
Was dort stehen soll (z. B. die Formulare der Passwortseite), gehört also in diese sechs Dateien, vor allem in `header.css`.

Beim Aufteilen blieben Inhalt und Reihenfolge der Regeln zunächst gleich. Seither sind einzelne Regeln verschoben, zusammengeführt oder
entfallen (z. B. liegt das Event-Raster jetzt allein in `sections.css`, der Warenkorb-Titel allein in `theme.css`, der Cookie-Banner-Block
und die Wunschlisten-Regeln sind weg, die Körnung `.textured` steht ohne Blend-Modus in `base.css`). Bei gleicher Spezifität gewinnt die später
geladene Datei: die Bereichsdateien stehen hinter den Legacy-Dateien (components, sections, theme) und überschreiben sie. Klassen, die
mehrere Bereiche nutzen, liegen in der Datei ihres ursprünglichen Blocks (z. B. `.product-grid` in `home.css`, `.page-banner`, `.empty` und
`.contact-box` in `shop.css`, `.payments` in `footer.css`, `.hide-mobile` in `header.css`): dort nur mit Blick auf die anderen Seiten ändern.

## Farben und Kontrast

Keine Hex-Werte außerhalb von `assets/tokens.css` (Ausnahmen: `theme-color` im Layout, `#000` als reiner Alphakanal in `mask-image`, die
Zuordnung von Farbnamen zu Farbfeldern in `snippets/swatch.liquid`). Formularfelder
(`.input`, `.select`, `.qty`) haben einen Rahmen mit mindestens 3 : 1 gegen den Grund (WCAG 1.4.11): `--c-border-input` auf hell, `--c-border-input-dark`
auf dunkel. Neue Farben als Token anlegen und den Kontrast nachrechnen.
