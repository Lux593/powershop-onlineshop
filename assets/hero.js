/* ==========================================================================
   Power Shop – Hero (nur Startseite): Modell-Tabs, Film, Bildwechsel, Scroll-Effekte (Motion-API).
   Film: je Slide höchstens einer, nur der des aktiven Slides läuft (die anderen halten an ihrer Stelle an und laden erst,
   wenn ihr Slide drankommt). Nach window.load plus Idle, nur im Bild und im sichtbaren Tab. Übersprungen bei saveData, 2G/3G, Reduced-Motion,
   im Editor und bei abgelehntem play() (iOS Low-Power): Poster plus Play-Taste. Pause-Taste = WCAG 2.2.2.
   ========================================================================== */
(function () {
  var PS = (window.PS = window.PS || {});

  PS.on('[data-hero]', function (hero) {
    var tabs = hero.querySelector('[data-hero-tabs]');
    var slides = [].slice.call(hero.querySelectorAll('.hero__slide'));
    var chips = tabs ? [].slice.call(tabs.querySelectorAll('[role="tab"]')) : [];
    var btn = hero.querySelector('.hero__pause');
    var videos = slides.map(function (s) { return s.querySelector('.hero__video'); });
    var link = hero.querySelector('.hero__scroll');
    var con = navigator.connection || {};
    var slow = con.saveData || /(^|-)[23]g$/.test(con.effectiveType || '');
    var motion = PS.motion.enabled && !PS.prefersReducedMotion();
    var rotate = motion && chips.length > 1; // endet mit dem ersten Tab-Klick
    var paused = !motion || !!slow;          // ohne Bewegung startet die Seite pausiert
    var seen = true, awake = false, cur = 0, auto = false;
    var began = !paused; // Fortschrittslinie läuft erst, wenn die Seite wirklich spielt: sonst steht sie bei 0 und der aktive Tab hat keinen Marker
    var hover = false, focus = false; // Maus über dem Text oder Tastaturfokus darin: Bildwechsel hält an, der Film läuft weiter

    function going() { return !paused && seen && awake && !document.hidden; }
    function rolling() { return going() && !hover && !focus; }

    function apply() {
      hero.classList.toggle('is-held', !rolling());
      hero.classList.toggle('is-rotating', rotate && began);
      loop();
      if (btn) {
        btn.hidden = !videos.some(Boolean) && !motion; // Ken-Burns und Scroll-Linie laufen auch ohne Film (2.2.2)
        btn.setAttribute('aria-pressed', paused);
      }
      videos.forEach(function (v, k) { if (v) { if (k === cur && going()) play(v); else v.pause(); } });
    }

    /* ---------------- Film ---------------- */
    function play(video) {
      var d = video.dataset;
      if (!video.getAttribute('src')) {
        // Mobil 540p, sonst WebM nur wenn sicher abspielbar (SSIM gegen das MP4 0,98), sonst MP4
        video.src = matchMedia('(max-width: 767px)').matches ? d.srcM || d.src :
          d.srcWebm && video.canPlayType('video/webm; codecs="vp9"') === 'probably' ? d.srcWebm : d.src;
      }
      var p = video.play();
      // iOS Low-Power und Autoplay-Sperren lehnen ab. AbortError (pause() dazwischen) ist normal.
      if (p && p.catch) p.catch(function (e) { if (e.name === 'NotAllowedError') { paused = true; began = false; apply(); } });
    }
    videos.forEach(function (video, k) {
      if (!video) return;
      var slide = slides[k];
      video.muted = true;
      // Einmal gelaufen, bleibt der Film über dem Standbild (beim Zurückkehren steht sein letztes Bild da)
      video.addEventListener('playing', function () { slide.classList.add('is-video'); });
      // Hält der Browser den Film von sich aus an (iOS: Stromsparen, als unsichtbar eingestufte Filme beim Scrollen, Seite aus
      // dem Zurück-Speicher), ist das keine Pause des Besuchers: Die Taste bleibt, apply() startet ihn beim nächsten Anlass
      // wieder (Sichtbarkeits-Stufen beim Scrollen, Tab wieder sichtbar, pageshow). Früher galt so eine Pause als „angehalten“
      // und der Film blieb dauerhaft stehen.
      video.addEventListener('error', function () { video.remove(); videos[k] = null; slide.classList.remove('is-video'); apply(); });
    });

    /* ---------------- Tabs, Bildwechsel, Rotation ----------------
       Die Standzeit misst das Skript und zeichnet die Linie am Tab selbst (--hero-p). Sie zählt nur, solange der Bildwechsel
       läuft (im Bild, nicht pausiert, keine Maus über dem Text, kein Tastaturfokus darin). Eine CSS-Animation mit
       animation-play-state über eine Variable und :has(:hover) blieb in iOS Safari nach Scrollen oder Tippen stehen. */
    var dur = (parseFloat(hero.style.getPropertyValue('--hero-dur')) || 8) * 1000;
    var elapsed = 0, last = 0, raf = 0;
    function bar(p) { if (chips[cur]) chips[cur].style.setProperty('--hero-p', p); }
    function tick(now) {
      raf = 0;
      if (!(rotate && began && rolling())) return;
      if (last) elapsed += Math.min(now - last, 100); // ein Ruckler oder Sprung zählt höchstens 100 ms
      last = now;
      if (elapsed >= dur) {
        auto = true;
        PS.selectTab(chips[(cur + 1) % chips.length]);
        auto = false;
        return;
      }
      bar(elapsed / dur);
      raf = requestAnimationFrame(tick);
    }
    function loop() {
      if (rotate && began && rolling()) {
        if (!raf) { last = 0; raf = requestAnimationFrame(tick); }
      } else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    }
    function end() { rotate = false; apply(); }

    /* Text beim Modellwechsel: Er schiebt sich seitlich wie ein Band (hero.css, .is-exiting und .is-entering). Die Richtung
       folgt der Lage der Tabs: zu einem Tab weiter rechts läuft der alte Text nach links hinaus und der neue kommt von
       rechts; zu einem Tab weiter links umgekehrt (.is-back). Das gilt auch für die Rotation, vom letzten zum ersten Modell
       läuft der Text daher zurück. Der alte ist dabei schon hidden, bleibt per CSS sichtbar und ist inert. Der neue kommt
       fertig an, seine Reveals spielen nicht neu ab. animationend räumt auf; jeder Wechsel setzt vorher alle Panels zurück,
       auch wenn eine Animation nie lief (z. B. ohne has-motion). Ohne Bewegung wechselt der Text sofort. */
    var panels = chips.map(function (c) { return document.getElementById(c.getAttribute('aria-controls')); });
    function settle(p) { p.classList.remove('is-entering', 'is-exiting', 'is-back'); p.inert = false; }
    panels.forEach(function (p) {
      if (p) p.addEventListener('animationend', function (e) { if (e.target === p) settle(p); });
    });
    function swap(p, old, back) {
      panels.forEach(function (n) { if (n) settle(n); });
      if (!motion || !p || !old || old === p) return;
      // Reveals, die noch nicht liefen, gelten als gelaufen
      [].forEach.call(p.querySelectorAll('[data-split],[data-stagger],[data-reveal]'), function (n) { n.classList.add('is-in'); });
      void p.offsetWidth; // ein abgebrochener Wechsel startet sauber neu
      old.inert = true;
      old.classList.add('is-exiting');
      p.classList.add('is-entering');
      if (back) { old.classList.add('is-back'); p.classList.add('is-back'); }
    }

    if (tabs) {
      tabs.addEventListener('ps:tab', function (e) {
        var i = parseInt(e.detail.dataset.index, 10) || 0;
        if (!auto) end();
        slides.forEach(function (s, k) {
          var on = k === i, img = s.querySelector('img');
          if (!on && s.classList.contains('is-active')) {
            s.classList.add('is-leaving'); // bleibt unter dem neuen, bis dieser eingeblendet ist
            setTimeout(function () { s.classList.remove('is-leaving'); }, 800);
          }
          if (on) s.classList.remove('is-leaving');
          s.classList.toggle('is-active', on);
          s.setAttribute('aria-hidden', !on);
          if (on && img) img.loading = 'eager'; // Sicherheitsnetz: lazy hält gestapelte Bilder nicht zurück
        });
        swap(document.getElementById(e.detail.getAttribute('aria-controls')), panels[cur], i < cur);
        cur = i;
        elapsed = 0;
        last = 0;
        bar(0);
        apply();
      });
    }
    // Maus über dem Text (nicht Touch: dort bliebe :hover nach einem Tippen hängen) und Tastaturfokus halten den Bildwechsel an
    var content = hero.querySelector('.hero__content');
    if (content) {
      content.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { hover = true; apply(); } });
      content.addEventListener('pointerleave', function () { if (hover) { hover = false; apply(); } });
      content.addEventListener('focusin', function (e) {
        try { focus = e.target.matches(':focus-visible'); } catch (err) { focus = true; }
        apply();
      });
      content.addEventListener('focusout', function (e) {
        if (!content.contains(e.relatedTarget)) { focus = false; apply(); }
      });
    }
    if (btn) btn.addEventListener('click', function () {
      paused = !paused;
      if (!paused) { awake = true; began = true; }
      apply();
    });
    // Theme-Editor: gewählten Slide zeigen
    hero.addEventListener('shopify:block:select', function (e) {
      var t = hero.querySelector('#hero-tab-' + e.detail.blockId);
      if (t) PS.selectTab(t);
    });

    /* ---------------- Im Bild, im sichtbaren Tab, Aufräumen ---------------- */
    // Grenze 10 %; die weiteren Stufen rufen apply() beim Scrollen öfter auf, damit ein vom Browser angehaltener Film weiterläuft
    var io = new IntersectionObserver(function (en) { seen = en[0].intersectionRatio >= 0.1; apply(); }, { threshold: [0.1, 0.5, 1] });
    var ac = new AbortController();
    io.observe(hero);
    document.addEventListener('visibilitychange', apply, { signal: ac.signal });
    // Zurück-Taste: Die Seite kommt aus dem Zurück-Speicher (bfcache), ohne neues Laden; der Film steht dann meist
    window.addEventListener('pageshow', function (e) { if (e.persisted) apply(); }, { signal: ac.signal });
    // Section-Reload im Editor, Reduced-Motion zur Laufzeit (motion.js ruft es)
    function off() {
      ac.abort();
      io.disconnect();
      rotate = false;
      loop();
      hero.classList.remove('is-rotating');
      videos.forEach(function (v) { if (v) v.pause(); });
    }
    document.addEventListener('shopify:section:unload', function (e) { if (e.target.contains(hero)) off(); }, { signal: ac.signal });
    PS.motion.track(hero, off);

    /* ---------------- Scrub (nur mit ScrollTrigger): Band ----------------
       Der Text zieht beim Scrollen nach links aus dem Bild, wie beim Modellwechsel. Drei Ebenen mit eigener Geschwindigkeit
       geben Tiefe: vorn die Headline am schnellsten, dahinter Unterzeile mit Preis und Buttons, hinten die Tabs. Die Wege
       sind auf 1440 px Breite gedeckelt, sonst flöge die Unterzeile auf breiten Bildschirmen weiter als die Headline. Die
       Textebene blendet dabei aus und nimmt ab der Hälfte keine Klicks mehr an; Tastaturfokus darin holt sie zurück (hero.css).
       Der Film läuft langsamer als die Seite (32 % nach unten) und ab 40 % ins Helle aus (.hero__fade), hinüber in den hellen
       Willkommensblock. Die Pause-Taste bleibt stehen, der Pfeil blendet beim Scrollen aus.
       Nur Verschieben und Ausblenden, nie Skalieren: Ein Zoom des laufenden Films ließ Bilder ausfallen, und eine wachsende
       Schrift musste der Browser in jedem Bild neu rastern (gemessen: 32 statt 74 fps, docs/research/hero-scroll-performance.md).
       will-change in hero.css hält alle bewegten Ebenen von Anfang an auf der Grafikkarte.
       Handy (bis 767 px): kein Skript. Der Film steht als feste Ebene, der Hero ist sein Fenster und der Willkommensblock
       schiebt sich darüber (hero.css). Per Skript gesetzte Zoom- und Versatzwerte kamen auf dem iPhone ein Bild nach dem
       Scrollen und zitterten gegen die Seite. */
    PS.motion.add(hero, function (gsap) {
      var m = hero.querySelector('.hero__media'), f = hero.querySelector('.hero__fade'), c = hero.querySelector('.hero__caption');
      var row = hero.querySelector('.hero__chips'), heads = hero.querySelectorAll('.hero__poster'), subs = hero.querySelectorAll('.hero__sub');
      function reach(k) { return function () { return -k * Math.min(innerWidth, 1440); }; }
      var mm = gsap.matchMedia(); // wechselt beim Drehen oder Ändern der Fensterbreite die Variante und räumt die alte auf
      mm.add('(min-width: 768px)', function () {
        var tl = gsap.timeline({
          defaults: { ease: 'none', duration: 1, force3D: true },
          scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true, invalidateOnRefresh: true }
        });
        tl.fromTo(m, { yPercent: 0 }, { yPercent: 32 }, 0)
          .fromTo(heads, { x: 0 }, { x: reach(0.55), ease: 'power1.in', duration: 0.55 }, 0)
          .fromTo(subs, { x: 0 }, { x: reach(0.38), ease: 'power1.in', duration: 0.55 }, 0.04)
          .fromTo(row || [], { x: 0 }, { x: reach(0.24), ease: 'power1.in', duration: 0.55 }, 0.08)
          .fromTo(c, { opacity: 1 }, { opacity: 0, ease: 'power1.in', duration: 0.6 }, 0)
          .set(c, { pointerEvents: 'none' }, 0.5)
          .fromTo(f, { opacity: 0 }, { opacity: 1, duration: 0.55 }, 0.4);
        if (link) tl.fromTo(link, { opacity: 1 }, { opacity: 0, duration: 0.15 }, 0);
      });
      return function () { mm.revert(); };
    });

    /* ---------------- Pfeil: erstes Element nach dem Hero (ein Band dazwischen verschiebt es) ---------------- */
    if (link) {
      var n = (hero.closest('.shopify-section') || hero).nextElementSibling;
      while (n && !n.offsetHeight) n = n.nextElementSibling;
      if (n && n.id) link.setAttribute('href', '#' + n.id);
    }

    /* ---------------- Start nach Load plus Idle ---------------- */
    var idle = window.requestIdleCallback || function (f) { setTimeout(f, 300); };
    function begin() {
      awake = true;
      apply();
      // Die Bilder der anderen Slides rendern nicht und laden daher nicht von selbst (hero.css): jetzt holen, damit der Wechsel nicht auf ein leeres Bild trifft
      if (!slow) slides.forEach(function (s) { var img = s.querySelector('img'); if (img) img.loading = 'eager'; });
    }
    hero.classList.add('is-ready');
    apply();
    if (document.readyState === 'complete') idle(begin, { timeout: 2000 });
    else window.addEventListener('load', function () { idle(begin, { timeout: 2000 }); }, { once: true });
  });
})();
