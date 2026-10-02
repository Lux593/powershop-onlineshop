/* ==========================================================================
   Power Shop – Hero (nur Startseite): Modell-Tabs, Film, Bildwechsel, Scroll-Effekte.
   Hängt sich über PS.on ein (läuft auch nach einem Section-Reload im Theme-Editor), Bewegung über die Motion-API.
   Film: lädt erst nach window.load plus Idle, zeigt sich bei „playing“, läuft nur im Bild und im sichtbaren Tab.
   Übersprungen bei saveData, 2G/3G, Reduced-Motion, im Editor und wenn play() abgelehnt wird (iOS Low-Power):
   dann Poster plus Play-Taste. Die Pause-Taste hält Film, Bildwechsel, Fortschritt und Pfeil an (WCAG 2.2.2).
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
    var rotate = motion && chips.length > 1; // endet dauerhaft mit einem Klick auf einen Tab
    var paused = !motion || !!slow;          // ohne Bewegung startet die Seite pausiert
    var seen = true, awake = false, cur = 0, auto = false, t0 = performance.now();

    function going() { return !paused && seen && awake && !document.hidden; }

    function apply() {
      hero.classList.toggle('is-held', !going());
      hero.classList.toggle('is-rotating', rotate);
      if (btn) {
        btn.hidden = !video && !rotate;
        btn.setAttribute('aria-pressed', paused);
      }
      if (!video) return;
      if (going() && cur === 0) play(); else video.pause();
    }

    /* ---------------- Film ---------------- */
    function play() {
      var d = video.dataset;
      if (!video.getAttribute('src')) {
        // Mobil die 540p-Datei, sonst WebM nur wenn der Browser es sicher kann (SSIM gegen das MP4 0,98), sonst MP4
        video.src = matchMedia('(max-width: 767px)').matches ? d.srcM || d.src :
          d.srcWebm && video.canPlayType('video/webm; codecs="vp9"') === 'probably' ? d.srcWebm : d.src;
      }
      var p = video.play();
      // iOS Low-Power und Autoplay-Sperren lehnen ab: Poster mit Play-Taste. AbortError (pause() dazwischen) ist normal.
      if (p && p.catch) p.catch(function (e) { if (e.name === 'NotAllowedError') { paused = true; apply(); } });
    }
    if (video) {
      video.muted = true;
      video.addEventListener('playing', function () { hero.classList.add('is-video'); });
      // Pause von außen (System, Energiesparmodus): Taste zeigt „angehalten“
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
        if (!auto) end(); // Nutzer wählt selbst: Rotation endet
        slides.forEach(function (s, k) {
          var on = k === i, img = s.querySelector('img');
          if (!on && s.classList.contains('is-active')) {
            s.classList.add('is-leaving'); // bleibt unter dem neuen sichtbar, bis dieser eingeblendet ist
            setTimeout(function () { s.classList.remove('is-leaving'); }, 800);
          }
          if (on) s.classList.remove('is-leaving');
          s.classList.toggle('is-active', on);
          s.setAttribute('aria-hidden', !on);
          if (on && img) img.loading = 'eager';
        });
        cur = i;
        t0 = performance.now();
        apply();
      });
      // Die Linie am Tab füllt sich über die Standzeit (CSS), ihr Ende wechselt den Slide
      tabs.addEventListener('animationend', function (e) {
        // Echte Zeit muss vergangen sein: Werkzeuge, die Animationen ans Ende springen lassen (Screenshots), wechseln sonst den Slide
        if (e.animationName !== 'hero-progress' || performance.now() - t0 < parseFloat(hero.style.getPropertyValue('--hero-dur')) * 800) return;
        auto = true;
        PS.selectTab(chips[(cur + 1) % chips.length]);
        auto = false;
      });
    }
    if (btn) btn.addEventListener('click', function () {
      paused = !paused;
      if (!paused) awake = true; // Taste = Nutzerwunsch, auch ohne Load/Idle
      apply();
    });
    // Im Theme-Editor springt der Hero auf den gewählten Slide
    hero.addEventListener('shopify:block:select', function (e) {
      var t = hero.querySelector('#hero-tab-' + e.detail.blockId);
      if (t) PS.selectTab(t);
    });

    /* ---------------- Im Bild, im sichtbaren Tab ---------------- */
    var io = new IntersectionObserver(function (en) { seen = en[0].intersectionRatio >= 0.1; apply(); }, { threshold: [0.1] });
    var ac = new AbortController();
    io.observe(hero);
    document.addEventListener('visibilitychange', apply, { signal: ac.signal });
    // Aufräumen: Section-Reload und -Entfernen im Theme-Editor, Reduced-Motion zur Laufzeit (motion.js ruft es dort)
    function off() {
      ac.abort();
      io.disconnect();
      rotate = false;
      hero.classList.remove('is-rotating');
      if (video) video.pause();
    }
    document.addEventListener('shopify:section:unload', function (e) { if (e.target.contains(hero)) off(); }, { signal: ac.signal });
    PS.motion.track(hero, off);

    /* ---------------- Scroll-Effekte (nur mit ScrollTrigger): Film-Scale, Abdunkeln, Text 0.15 Parallax ---------------- */
    PS.motion.add(hero, function (gsap) {
      var m = hero.querySelector('.hero__media'), d = hero.querySelector('.hero__dim');
      // Pfeil und Pause-Taste wandern mit dem Text, sonst überlappen sie ihn beim Hinausscrollen
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

    /* ---------------- Pfeil: erstes Element nach dem Hero (das ändert sich, wenn die Startseite ein Band dazwischen setzt) ---------------- */
    if (link) {
      var n = (hero.closest('.shopify-section') || hero).nextElementSibling;
      while (n && !n.offsetHeight) n = n.nextElementSibling;
      if (n && n.id) link.setAttribute('href', '#' + n.id);
    }

    /* ---------------- Start: Film und Rotation erst nach Load plus Idle; restliche Fotos im Leerlauf vorladen ---------------- */
    var idle = window.requestIdleCallback || function (f) { setTimeout(f, 300); };
    function begin() {
      awake = true;
      apply();
      if (!slow) idle(function () { slides.forEach(function (s) { var i = s.querySelector('img'); if (i) i.loading = 'eager'; }); });
    }
    hero.classList.add('is-ready');
    apply();
    if (document.readyState === 'complete') idle(begin, { timeout: 2000 });
    else window.addEventListener('load', function () { idle(begin, { timeout: 2000 }); }, { once: true });
  });
})();
