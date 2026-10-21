/* ==========================================================================
   Power Shop – Hero (nur Startseite): Modell-Tabs, Film, Bildwechsel, Scroll-Effekte (Motion-API).
   Film: nach window.load plus Idle, nur im Bild und im sichtbaren Tab. Übersprungen bei saveData, 2G/3G, Reduced-Motion,
   im Editor und bei abgelehntem play() (iOS Low-Power): Poster plus Play-Taste. Pause-Taste = WCAG 2.2.2.
   ========================================================================== */
(function () {
  var PS = (window.PS = window.PS || {});

  PS.on('[data-hero]', function (hero) {
    var tabs = hero.querySelector('[data-hero-tabs]');
    var slides = [].slice.call(hero.querySelectorAll('.hero__slide'));
    var chips = tabs ? [].slice.call(tabs.querySelectorAll('[role="tab"]')) : [];
    var btn = hero.querySelector('.hero__pause');
    var video = hero.querySelector('.hero__video');
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
        btn.hidden = !video && !motion; // Ken-Burns und Scroll-Linie laufen auch ohne Film (2.2.2)
        btn.setAttribute('aria-pressed', paused);
      }
      if (!video) return;
      if (going() && cur === 0) play(); else video.pause();
    }

    /* ---------------- Film ---------------- */
    function play() {
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
    if (video) {
      video.muted = true;
      video.addEventListener('playing', function () { hero.classList.add('is-video'); });
      // Pause von außen (System): Taste zeigt „angehalten“
      // Nur im Bild: iOS hält den Film beim Wegscrollen selbst an, bevor der IntersectionObserver „nicht im Bild“ meldet
      video.addEventListener('pause', function () {
        if (video && video.paused && going() && cur === 0 && inView()) { paused = true; apply(); }
      });
      video.addEventListener('error', function () { video.remove(); video = null; hero.classList.remove('is-video'); apply(); });
    }

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
        // Reveals aller Slides liefen schon beim Laden: Text der neuen Slide spielt sie neu ab
        var p = document.getElementById(e.detail.getAttribute('aria-controls'));
        if (p) [].forEach.call(p.querySelectorAll('.is-in'), function (n) { n.classList.remove('is-in'); void n.offsetWidth; n.classList.add('is-in'); });
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
    var io = new IntersectionObserver(function (en) { seen = en[0].intersectionRatio >= 0.1; apply(); }, { threshold: [0.1] });
    // Gleiche Grenze wie der Observer, aber sofort gemessen (seine Meldung kommt beim Scrollen erst verzögert)
    function inView() {
      var r = hero.getBoundingClientRect();
      return r.height > 0 && (Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0)) / r.height >= 0.1;
    }
    var ac = new AbortController();
    io.observe(hero);
    document.addEventListener('visibilitychange', apply, { signal: ac.signal });
    // Section-Reload im Editor, Reduced-Motion zur Laufzeit (motion.js ruft es)
    function off() {
      ac.abort();
      io.disconnect();
      rotate = false;
      loop();
      hero.classList.remove('is-rotating');
      if (video) video.pause();
    }
    document.addEventListener('shopify:section:unload', function (e) { if (e.target.contains(hero)) off(); }, { signal: ac.signal });
    PS.motion.track(hero, off);

    /* ---------------- Scrub (nur mit ScrollTrigger): Durchfahrt ----------------
       Der Film zoomt nach vorn (1 auf 1,4) und läuft langsamer als die Seite (30 % nach unten; die freie Kante oben liegt
       dabei immer schon außerhalb des Bildes). Die Textebene fliegt größer werdend weg (Scale 1,45, 40 px hoch, in der
       ersten Hälfte ausgeblendet) und nimmt danach keine Klicks mehr an; Tastaturfokus darin holt sie zurück (hero.css).
       Ab 30 % läuft das Bild ins Helle aus (.hero__fade) und geht in den hellen Willkommensblock darunter über.
       Die Pause-Taste bleibt stehen, der Pfeil blendet beim Scrollen aus. */
    PS.motion.add(hero, function (gsap) {
      var m = hero.querySelector('.hero__media'), f = hero.querySelector('.hero__fade'), c = hero.querySelector('.hero__caption');
      var tl = gsap.timeline({
        defaults: { ease: 'none', duration: 1 },
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true, invalidateOnRefresh: true }
      });
      tl.fromTo(m, { scale: 1, yPercent: 0 }, { scale: 1.4, yPercent: 30 }, 0)
        .fromTo(c, { y: 0, scale: 1, opacity: 1 }, { y: -40, scale: 1.45, opacity: 0, duration: 0.5 }, 0)
        .set(c, { pointerEvents: 'none' }, 0.5)
        .fromTo(f, { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0.3);
      if (link) tl.fromTo(link, { opacity: 1 }, { opacity: 0, duration: 0.15 }, 0);
      return [tl.scrollTrigger, tl, function () { gsap.set([m, f, c, link].filter(Boolean), { clearProps: 'all' }); }];
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
