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
    var seen = true, awake = false, cur = 0, auto = false, t0 = performance.now();

    function going() { return !paused && seen && awake && !document.hidden; }

    function apply() {
      hero.classList.toggle('is-held', !going());
      hero.classList.toggle('is-rotating', rotate);
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
      if (p && p.catch) p.catch(function (e) { if (e.name === 'NotAllowedError') { paused = true; apply(); } });
    }
    if (video) {
      video.muted = true;
      video.addEventListener('playing', function () { hero.classList.add('is-video'); });
      // Pause von außen (System): Taste zeigt „angehalten“
      video.addEventListener('pause', function () {
        if (video && video.paused && going() && cur === 0) { paused = true; apply(); }
      });
      video.addEventListener('error', function () { video.remove(); video = null; hero.classList.remove('is-video'); apply(); });
    }

    /* ---------------- Tabs, Bildwechsel, Rotation ---------------- */
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
        t0 = performance.now();
        apply();
      });
      // Die Linie am Tab füllt sich über die Standzeit (CSS), ihr Ende wechselt den Slide. Echte Zeit muss vergangen sein,
      // sonst wechselt jedes Werkzeug, das Animationen ans Ende springen lässt (Screenshots).
      tabs.addEventListener('animationend', function (e) {
        if (e.animationName !== 'hero-progress' || performance.now() - t0 < parseFloat(hero.style.getPropertyValue('--hero-dur')) * 800) return;
        auto = true;
        PS.selectTab(chips[(cur + 1) % chips.length]);
        auto = false;
      });
    }
    if (btn) btn.addEventListener('click', function () {
      paused = !paused;
      if (!paused) awake = true;
      apply();
    });
    // Theme-Editor: gewählten Slide zeigen
    hero.addEventListener('shopify:block:select', function (e) {
      var t = hero.querySelector('#hero-tab-' + e.detail.blockId);
      if (t) PS.selectTab(t);
    });

    /* ---------------- Im Bild, im sichtbaren Tab, Aufräumen ---------------- */
    var io = new IntersectionObserver(function (en) { seen = en[0].intersectionRatio >= 0.1; apply(); }, { threshold: [0.1] });
    var ac = new AbortController();
    io.observe(hero);
    document.addEventListener('visibilitychange', apply, { signal: ac.signal });
    // Section-Reload im Editor, Reduced-Motion zur Laufzeit (motion.js ruft es)
    function off() {
      ac.abort();
      io.disconnect();
      rotate = false;
      hero.classList.remove('is-rotating');
      if (video) video.pause();
    }
    document.addEventListener('shopify:section:unload', function (e) { if (e.target.contains(hero)) off(); }, { signal: ac.signal });
    PS.motion.track(hero, off);

    /* ---------------- Scrub (nur mit ScrollTrigger): Film-Scale, Abdunkeln, Text 0.15 Parallax ---------------- */
    PS.motion.add(hero, function (gsap) {
      var m = hero.querySelector('.hero__media'), d = hero.querySelector('.hero__dim');
      // Pfeil und Pause-Taste wandern mit, sonst überlappen sie den Text
      var c = [hero.querySelector('.hero__caption'), link, btn].filter(Boolean);
      var tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true, invalidateOnRefresh: true }
      });
      tl.fromTo(m, { scale: 1 }, { scale: 1.08 }, 0)
        .fromTo(d, { opacity: 0 }, { opacity: 0.55 }, 0)
        .fromTo(c, { y: 0 }, { y: function () { return hero.offsetHeight * 0.15; } }, 0);
      return [tl.scrollTrigger, tl, function () { gsap.set([m, d, c], { clearProps: 'all' }); }];
    });

    /* ---------------- Pfeil: erstes Element nach dem Hero (ein Band dazwischen verschiebt es) ---------------- */
    if (link) {
      var n = (hero.closest('.shopify-section') || hero).nextElementSibling;
      while (n && !n.offsetHeight) n = n.nextElementSibling;
      if (n && n.id) link.setAttribute('href', '#' + n.id);
    }

    /* ---------------- Start nach Load plus Idle ---------------- */
    var idle = window.requestIdleCallback || function (f) { setTimeout(f, 300); };
    function begin() { awake = true; apply(); }
    hero.classList.add('is-ready');
    apply();
    if (document.readyState === 'complete') idle(begin, { timeout: 2000 });
    else window.addEventListener('load', function () { idle(begin, { timeout: 2000 }); }, { once: true });
  });
})();
