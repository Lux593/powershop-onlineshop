/* ==========================================================================
   Power Shop – Team der Über-uns-Seite (sections/about-team.liquid). Lädt nur mit der Section.
   Liquid rendert alle Personen vollständig; dieses Modul macht daraus das Spotlight (is-ready) und zeigt nur die gewählte Person:
   - Wechsel per Vorschau-Knopf, Pfeil (am Desktop), Pfeiltaste (nur solange der Fokus auf einem Knopf der Section liegt) und
     Wischen auf dem Foto (nach links weiter, nach rechts zurück).
   - Mit Bewegung (PS.motion.enabled und GSAP, ohne reduzierte Bewegung) fährt das neue Foto senkrecht durch den Rahmen herein und
     setzt sich dabei aus 1,12 auf 1, das alte fährt 35 % weiter und blendet aus (0,75 s). Der alte Text gleitet seitlich hinaus,
     der neue herein. Sonst wechselt alles sofort. Wie in V37 (entwuerfe/ueber-uns/shared/team-spotlight.js), der einzige Foto-Zoom
     der Seite neben dem Kopffoto.
   - Vorladen: Ist das Team weniger als einen Bildschirm entfernt, laden alle Fotos der Section (loading = eager). Ein Wechsel wartet
     auf das Dekodieren des neuen Fotos, höchstens 400 ms.
   - Eine Live-Region sagt die neue Person an.
   - Theme-Editor: Ein gewählter Block zeigt seine Person sofort, ohne Bewegung. shopify:section:unload räumt auf.
   ========================================================================== */
(function () {
  // Das Skript-Tag steht in der Section und läuft deshalb vor theme.js (beide defer). PS.on gibt es erst danach:
  // spätestens bei DOMContentLoaded sind alle defer-Skripte gelaufen.
  if (window.PS && window.PS.on) start();
  else document.addEventListener('DOMContentLoaded', start, { once: true });

  function start() {
    var PS = window.PS;
    if (!PS || !PS.on) return;
    PS.on('[data-about-team]', function (root) { team(PS, root); });
  }

  var BITS = 'transform,opacity,visibility';
  var SHOT = 'zIndex,transform,opacity,visibility';
  function toArray(list) { return Array.prototype.slice.call(list); }

  function team(PS, root) {
    var photo = root.querySelector('[data-photo]');
    var shots = toArray(root.querySelectorAll('.spot__shot'));
    var cards = toArray(root.querySelectorAll('.spot__card'));
    var picks = toArray(root.querySelectorAll('[data-pick]'));
    var status = root.querySelector('[data-status]');
    var n = cards.length;
    if (!n || !photo || shots.length !== n) return;

    var ctrl = new AbortController(), sig = { signal: ctrl.signal };
    var alive = true;
    var cur = 0;  // gezeigte Person
    var want = 0; // gewählte Person; solange ihr Foto dekodiert, steht noch cur da
    var seq = 0;  // Zähler der Wechsel: Wartet einer noch aufs Foto, während der nächste kommt, entfällt er
    var tl = null;
    var io = null;

    root.classList.add('is-ready');
    paint(0, true);

    /* ---------------- Vorladen ----------------
       Wartende Fotos liegen unsichtbar im Rahmen, mit lazy lüden sie erst beim Wechsel. Einen Bildschirm vor dem Team laden alle. */
    function eager() { root.querySelectorAll('img').forEach(function (img) { img.loading = 'eager'; }); }
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(function (entries) {
        if (!entries.some(function (e) { return e.isIntersecting; })) return;
        eager();
        io.disconnect();
        io = null;
      }, { rootMargin: '0px 0px 100% 0px' });
      io.observe(root);
    } else {
      eager();
    }

    document.addEventListener('shopify:section:unload', function (e) {
      if (e.target.contains(root)) teardown();
    }, sig);
    if (n < 2) return; // eine Person: nichts zu wechseln

    /* ---------------- Anzeigen ---------------- */
    function calm() { return !(PS.motion.enabled && window.gsap) || PS.prefersReducedMotion(); }

    function mark(i) {
      picks.forEach(function (b, k) {
        if (k === i) b.setAttribute('aria-current', 'true');
        else b.removeAttribute('aria-current');
      });
    }
    // „3 von 8: Franziska Link, Geschäftsführerin“
    function label(i) {
      var h = cards[i].querySelector('h3'), r = cards[i].querySelector('.spot__role');
      var name = h ? h.textContent.replace(/\s+/g, ' ').trim() : '';
      return (i + 1) + ' von ' + n + ': ' + name + (r ? ', ' + r.textContent.trim() : '');
    }
    function paint(i, quiet) {
      cards.forEach(function (c, k) { c.classList.toggle('is-active', k === i); });
      shots.forEach(function (s, k) { s.classList.toggle('is-active', k === i); });
      if (status && !quiet) status.textContent = label(i);
    }

    // Wartet, bis das Foto dekodiert ist, höchstens 400 ms. Ein Klick vor dem Vorladen holt das Foto sofort.
    function ready(img) {
      return new Promise(function (resolve) {
        var t = setTimeout(resolve, 400);
        function done() { clearTimeout(t); resolve(); }
        if (!img || !img.decode) { done(); return; }
        if (img.loading === 'lazy') img.loading = 'eager';
        img.decode().then(done, done);
      });
    }

    // dir: 1 = das neue Foto kommt von unten, -1 = von oben. instant: sofort und ohne Ansage (Theme-Editor).
    function show(i, dir, instant) {
      i = ((i % n) + n) % n;
      if (tl) tl.progress(1).kill(); // ein laufender Wechsel springt ans Ende
      tl = null;
      var token = ++seq;
      want = i;
      mark(i);
      if (i === cur) return;
      if (instant || calm()) {
        cur = i;
        paint(i, instant);
        return;
      }
      ready(shots[i].querySelector('img')).then(function () {
        if (alive && token === seq && i !== cur) run(cur, i, dir);
      });
    }

    function run(from, i, dir) {
      var gsap = window.gsap;
      if (!gsap) { cur = i; paint(i); return; }
      cur = i;
      var oldImg = shots[from], newImg = shots[i];
      var oldBits = cards[from].children, newBits = cards[i].children;
      newImg.classList.add('is-active');
      tl = gsap.timeline({ defaults: { ease: 'power3.inOut' } })
        .set(newImg, { zIndex: 2, yPercent: dir * 100, scale: 1.12 })
        .to(newImg, { yPercent: 0, scale: 1, duration: 0.75 }, 0)
        .to(oldImg, { yPercent: dir * -35, autoAlpha: 0.2, duration: 0.75 }, 0)
        .to(oldBits, { x: dir * -40, autoAlpha: 0, duration: 0.26, stagger: 0.03, ease: 'power2.in' }, 0)
        // erst umschalten, wenn der alte Text ganz draußen ist, sonst bleiben Reste am Element hängen
        .add(function () {
          paint(i);
          gsap.set(oldBits, { clearProps: BITS });
        }, '>')
        .fromTo(newBits, { x: dir * 48, autoAlpha: 0 },
          { x: 0, autoAlpha: 1, duration: 0.55, stagger: 0.06, ease: 'power3.out', clearProps: BITS }, '>')
        .add(function () { gsap.set([oldImg, newImg], { clearProps: SHOT }); });
    }

    function next() { show(want + 1, 1); }
    function prev() { show(want - 1, -1); }

    /* ---------------- Bedienung ---------------- */
    root.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target : null;
      if (!t) return;
      var b = t.closest('[data-pick]');
      if (b && root.contains(b)) { var k = +b.getAttribute('data-pick'); show(k, k > cur ? 1 : -1); return; }
      if (t.closest('[data-next]')) next();
      else if (t.closest('[data-prev]')) prev();
    }, sig);

    // Pfeiltasten nur mit Fokus auf einem Knopf der Section (Vorschau oder Pfeil), nie mit Alt/Strg/Cmd (Alt+Links = Zurück)
    root.addEventListener('keydown', function (e) {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (!e.target.closest || !e.target.closest('button') || !root.contains(e.target)) return;
      if (e.key === 'ArrowRight') { next(); e.preventDefault(); }
      else if (e.key === 'ArrowLeft') { prev(); e.preventDefault(); }
    }, sig);

    // Wischen auf dem Foto: nach links weiter, nach rechts zurück. Senkrecht scrollt die Seite (touch-action: pan-y).
    var sx = null;
    photo.addEventListener('pointerdown', function (e) { sx = e.clientX; }, sig);
    photo.addEventListener('pointerup', function (e) {
      if (sx === null) return;
      var dx = e.clientX - sx;
      sx = null;
      if (Math.abs(dx) > 40) (dx < 0 ? next : prev)();
    }, sig);
    photo.addEventListener('pointercancel', function () { sx = null; }, sig);
    photo.addEventListener('dragstart', function (e) { e.preventDefault(); }, sig);

    // Theme-Editor: Block gewählt = Person sofort zeigen (Muster assets/build-book.js)
    document.addEventListener('shopify:block:select', function (e) {
      if (!root.contains(e.target)) return;
      var k = cards.indexOf(e.target.closest('.spot__card'));
      if (k >= 0) show(k, 1, true);
    }, sig);

    function teardown() {
      alive = false;
      ctrl.abort();
      if (io) io.disconnect();
      io = null;
      if (tl) tl.kill();
      tl = null;
    }
  }
})();
