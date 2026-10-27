/* ==========================================================================
   Power Shop – Seiten (nur Vorlagen page.*): Scrub der Aussagen in den Partner-Abschnitten der Service-Seite und die
   Service-Navigation (aktueller Abschnitt, Wischhinweis).
   Auf Seiten laden weder GSAP noch ScrollTrigger: Der Scrub läuft hier mit einem gedrosselten Scroll-Listener (rAF) und setzt
   nur Klassen (Regeln in pages.css). Nur mit Bewegung (PS.motion.enabled); Aufräumen über PS.motion.track, wenn die
   Bewegung zur Laufzeit abgeschaltet oder die Section im Editor ersetzt wird.
   ========================================================================== */
(function () {
  var PS = (window.PS = window.PS || {});
  var M = PS.motion;

  // Ein Scroll- und Resize-Listener je Aussage, je Frame höchstens ein Update
  function onScroll(update) {
    var queued = false;
    function frame() { queued = false; update(); }
    function queue() { if (!queued) { queued = true; requestAnimationFrame(frame); } }
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    queue();
    return function () {
      window.removeEventListener('scroll', queue);
      window.removeEventListener('resize', queue);
    };
  }

  /* ---------------- Aussagen: Wörter leuchten beim Scrollen nacheinander auf ----------------
     Wie der Willkommensblock der Startseite (home.js): Start, wenn die Oberkante 85 % der Fensterhöhe erreicht, fertig, wenn
     die Unterkante bei 45 % steht. Der Splitter (data-split) arbeitet erst nach document.fonts.ready; bis dahin und ohne
     Bewegung bleibt es beim Hochgleiten der Wörter aus motion.css, kein Wort bleibt gedimmt. */
  PS.on('[data-scrub]', function (el) {
    if (!M.enabled || !el.hasAttribute('data-split')) return;
    function go() {
      var words = el.querySelectorAll('.ps-wi'), lit = -1;
      if (!words.length) return;
      var stop = onScroll(function () {
        var r = el.getBoundingClientRect(), vh = window.innerHeight;
        var p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (vh * 0.4 + r.height)));
        var n = Math.round(p * words.length);
        if (n === lit) return;
        lit = n;
        for (var i = 0; i < words.length; i++) words[i].classList.toggle('is-lit', i < n);
      });
      el.classList.add('is-scrub');
      M.track(el, function () {
        stop();
        el.classList.remove('is-scrub');
        [].forEach.call(words, function (w) { w.classList.remove('is-lit'); });
      });
    }
    if (el.classList.contains('is-split')) return go();
    var mo = new MutationObserver(function () {
      if (!el.classList.contains('is-split')) return;
      mo.disconnect();
      go();
    });
    mo.observe(el, { attributes: true, attributeFilter: ['class'] });
    M.track(el, mo);
  });

  /* ---------------- Service-Navigation: aktueller Abschnitt und Wischhinweis ----------------
     Läuft immer, auch ohne Bewegung: Die Markierung ist Orientierung, keine Animation. Aktuell ist der Abschnitt, dessen
     Oberkante zuletzt die Linie bei 35 % der Fensterhöhe überschritten hat; am Seitenende der unterste. Die Leiste rückt den
     markierten Punkt ins Bild, nur waagerecht (scrollIntoView würde die Seite mitziehen), ebenso einen Punkt mit Tastaturfokus.
     has-more-start/-end blenden am Rand einen Verlauf ein, solange dort weitere Punkte liegen (pages.css).
     Im Theme-Editor räumt shopify:section:unload Listener und Markierung ab, bevor die Section neu geladen wird. */
  PS.on('[data-subnav]', function (nav) {
    var strip = nav.querySelector('[data-subnav-strip]');
    if (!strip) return;
    var ctrl = new AbortController();
    var current = null;
    var targets = [].map.call(nav.querySelectorAll('a[data-spy]'), function (link) {
      return { link: link, el: document.getElementById(link.getAttribute('data-spy')) };
    }).filter(function (t) { return t.el; });

    function edges() {
      var max = strip.scrollWidth - strip.clientWidth;
      nav.classList.toggle('has-more-start', strip.scrollLeft > 4);
      nav.classList.toggle('has-more-end', strip.scrollLeft < max - 4);
    }

    function reveal(link) {
      var box = strip.getBoundingClientRect(), r = link.getBoundingClientRect(), pad = 56;
      if (r.left >= box.left + pad && r.right <= box.right - pad) return;
      strip.scrollTo({ left: strip.scrollLeft + r.left - box.left - (box.width - r.width) / 2, behavior: M.enabled ? 'smooth' : 'auto' });
    }

    function spy() {
      var line = window.innerHeight * 0.35, active = null, best = -Infinity, lowest = null, lowestTop = -Infinity;
      var atEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      targets.forEach(function (t) {
        var top = t.el.getBoundingClientRect().top;
        if (top <= line && top > best) { best = top; active = t.link; }
        if (top > lowestTop) { lowestTop = top; lowest = t.link; }
      });
      if (atEnd) active = lowest;
      if (active === current) return;
      if (current) current.removeAttribute('aria-current');
      current = active;
      if (active) { active.setAttribute('aria-current', 'location'); reveal(active); }
    }

    var stop = onScroll(function () { edges(); if (targets.length) spy(); });
    strip.addEventListener('scroll', edges, { passive: true, signal: ctrl.signal });
    strip.addEventListener('focusin', function (e) { if (e.target.matches('a')) reveal(e.target); }, { signal: ctrl.signal });
    document.addEventListener('shopify:section:unload', function (e) {
      if (!e.target.contains(nav)) return;
      stop();
      ctrl.abort();
      if (current) current.removeAttribute('aria-current');
    }, { signal: ctrl.signal });
  });
})();
