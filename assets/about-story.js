/* ==========================================================================
   Power Shop – Bühne der Geschichte auf der Über-uns-Seite (sections/about-story.liquid). Lädt nur mit der Section, ab zwei Etappen.
   Mit Bewegung (html.has-motion, GSAP und ScrollTrigger, ohne reduzierte Bewegung, ab 600 px Fensterhöhe) bleibt die Bühne unter
   der Kopfleiste stehen, während man scrollt, und die Etappen blättern um:
   - Die nächste Etappe schiebt sich als Ganzes von rechts über die aktuelle, die liegen bleibt. Ihr Foto kommt zuerst und fährt über
     Jahreszahl und Text der aktuellen Etappe, dahinter folgt ihre weiße Textspalte, noch leer. Ist sie angekommen, gleiten
     Jahreszahl, Überschrift, Text und Ort nacheinander von rechts herein. Fotos zoomen und gleiten dabei nie im eigenen Rahmen.
   - Eine Bildschirmhöhe Scrollweg je Wechsel, eingerastet wird auf jeder Etappe, ohne Schwung.
   - Balken: Linie und Bar & Shield folgen der Lage der Etappen, nicht dem rohen Scrollwert. Die Zahlen sind Links, ein Klick
     scrollt zur Etappe, ohne unterwegs einzurasten.
   - Kopfleiste: Ab 150 px vor dem Pinnen bis zu dessen Ende fährt sie ein und bleibt stehen (PS.headerHold aus header.js).
   Ohne Bewegung, im Theme-Editor und unter 600 px Höhe läuft nichts davon: Die Etappen stehen untereinander, die Zahlen sind Anker.
   Solange die Bühne läuft, trägt [data-story] die Klasse is-live und __story = { st, guard, last, revert } (Prüfungen, Übergang zum Team).
   Vorlage: entwuerfe/ueber-uns/h-vollbild.html (Skript am Ende), Spec: design-ueber-uns-h.md, Abschnitte 4.3 und 6.
   ========================================================================== */
(function () {
  // Das Skript-Tag steht in der Section und läuft deshalb vor theme.js (beide defer). PS.on gibt es erst danach:
  // spätestens bei DOMContentLoaded sind alle defer-Skripte gelaufen.
  if (window.PS && window.PS.on) start();
  else document.addEventListener('DOMContentLoaded', start, { once: true });

  function start() {
    var PS = window.PS;
    if (!PS || !PS.on) return;
    PS.on('[data-story]', function (section) {
      if (!section.classList.contains('about-story--stage')) return; // eine Etappe: keine Bühne
      // Nur mit GSAP und ScrollTrigger (PS.motion.scroll), sonst ein No-op. Der Aufräumer gehört zur Section.
      PS.motion.add(section, function (gsap, ScrollTrigger) { return stage(PS, section, gsap, ScrollTrigger); });
    });
  }

  // Höhe der Kopfleiste aus dem Token (64 px, ab 1024 px 76 px). Der Start des Pinnens und --stage-h (CSS) rechnen mit derselben Größe.
  function hh() {
    return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 0;
  }

  function stage(PS, section, gsap, ScrollTrigger) {
    // Die Adressleiste am Handy ändert die Fensterhöhe beim Scrollen: kein Neuberechnen mitten im Umblättern
    ScrollTrigger.config({ ignoreMobileResize: true });
    var mm = gsap.matchMedia();
    var revert = function () { mm.revert(); };
    // 600 px = Kopfleiste (bis 77 px) plus 520 px Mindesthöhe der Bühne. Darunter stehen die Etappen untereinander.
    mm.add('(prefers-reduced-motion: no-preference) and (min-height: 600px)', function () {
      return build(PS, section, gsap, ScrollTrigger, revert);
    });
    return revert;
  }

  function build(PS, section, gsap, ScrollTrigger, revert) {
    var stageEl = section.querySelector('[data-stage]');
    var viewport = section.querySelector('[data-viewport]');
    var leaves = gsap.utils.toArray('.leaf', section);
    var links = gsap.utils.toArray('[data-jump]', section);
    var fill = section.querySelector('[data-fill]');
    var head = section.querySelector('[data-head]');
    var hint = section.querySelector('.about-story__hint');
    var last = leaves.length - 1;
    var alive = true, current = -1, jumping = false, jumpTimer = 0;
    if (!stageEl || !viewport || !fill || !head || last < 1) return;

    section.classList.add('is-live');
    // Wartende Etappen liegen rechts außerhalb des beschnittenen Fensters: mit lazy lüden ihre Fotos erst beim Hereinfahren
    section.querySelectorAll('.leaf__media img').forEach(function (img) { img.loading = 'eager'; });

    function setActive(i) {
      if (i === current) return;
      current = i;
      links.forEach(function (a, k) {
        if (k === i) a.setAttribute('aria-current', 'step');
        else a.removeAttribute('aria-current');
      });
    }

    /* ---------------- Balken ----------------
       marks: wo der Balken in eine Zahl hineinläuft, als Anteil der Linie. Ab dort wird sie orange, die erste ist es von Anfang an.
       Für das Bar & Shield: wo die Zahlen stehen (nur der Text, in px ab Linienanfang), wie breit Linie und Zeichen sind und wie
       lang es blendet. Kommt das Zeichen einer Zahl nahe, blendet die Zahl samt schwarzem Grund aus, dahinter wieder ein. */
    var rider = head.firstElementChild;
    var near = 4; // so viel Luft bleibt zwischen Zeichen und Zahl, wenn die Zahl ganz ausgeblendet ist
    var marks = [], digits = [], lineW = 1, riderHalf = 0, fadeLen = 28;
    function measure() {
      var line = fill.parentElement.getBoundingClientRect();
      if (!line.width) return;
      marks = links.map(function (a) { return (a.getBoundingClientRect().left - line.left) / line.width; });
      digits = links.map(function (a) {
        var range = document.createRange();
        range.selectNodeContents(a);
        var box = range.getBoundingClientRect();
        return [box.left - line.left, box.right - line.left];
      });
      lineW = line.width;
      riderHalf = rider.getBoundingClientRect().width / 2;
      // Am Handy liegen die Zahlen eng: Die Blende wird kürzer, damit auf halbem Weg zwischen zwei Zahlen beide wieder ganz da sind
      var room = Infinity;
      for (var k = 1; k < digits.length; k++) room = Math.min(room, digits[k][0] - digits[k - 1][1]);
      fadeLen = gsap.utils.clamp(6, 28, (room - 2 * riderHalf - 2 * near) / 2);
    }
    var setFill = gsap.quickSetter(fill, 'scaleX');
    var setHead = gsap.quickSetter(head, 'xPercent');
    function paintRail(p) {
      setFill(p);
      setHead(p * 100);
      var x = p * lineW;
      links.forEach(function (a, k) {
        a.classList.toggle('is-passed', p >= marks[k]);
        if (!digits.length) return; // vor dem ersten Ausmessen gibt es nichts zu blenden
        var gap = Math.max(digits[k][0] - x, x - digits[k][1], 0) - riderHalf - near;
        a.style.setProperty('--show', gsap.utils.clamp(0, 1, gap / fadeLen));
      });
    }

    /* ---------------- Umblättern ----------------
       Je Etappe eine Zeiteinheit, damit das Einrasten auf 1/last genau zwischen zwei Umblätterungen liegt. 0 bis 0,6: Die Etappe
       schiebt sich herein. Ab 0,5: Jahreszahl und Text gleiten nach, 22 % der Bühnenbreite weiter rechts gestartet, am Handy 40 %.
       Die 120 px schieben wartende Etappen samt ihrem Schatten ganz aus dem Bild (der weiche Schatten reicht gut 80 px nach links). */
    var push = function () { return viewport.clientWidth * (window.innerWidth < 900 ? 0.4 : 0.22); };
    var bits = leaves.map(function (leaf) {
      return [leaf.querySelector('.leaf__year')].concat(gsap.utils.toArray(leaf.querySelectorAll('.leaf__text > *')));
    });
    // Linie und Zeichen folgen den Etappen selbst, nicht dem rohen Scrollwert: so gleiten sie genauso weich wie das Umblättern
    function railAt() {
      var sum = 0;
      for (var k = 1; k <= last; k++) sum += 1 - gsap.getProperty(leaves[k], 'xPercent') / 100;
      return sum / last;
    }

    var slide = gsap.timeline({
      // Aktive Zahl und Hinweis folgen dem Fortschritt der Zeitleiste, egal wer ihn setzt
      onUpdate: function () {
        var p = slide.progress();
        paintRail(railAt());
        setActive(Math.round(p * last));
        if (hint) hint.classList.toggle('is-gone', p > 0.03);
      },
      scrollTrigger: {
        trigger: stageEl,
        start: function () { return 'top top+=' + hh(); },
        end: function () { return '+=' + last * window.innerHeight; }, // eine Bildschirmhöhe Scrollweg je Etappe
        pin: true,
        scrub: 0.6,
        // Während ein Klick auf eine Zahl zur Etappe scrollt, rastet nichts dazwischen ein
        snap: {
          snapTo: function (v) { return jumping ? v : Math.round(v * last) / last; },
          inertia: false,
          duration: { min: 0.25, max: 0.7 },
          delay: 0.06,
          ease: 'power2.inOut'
        },
        invalidateOnRefresh: true
      }
    });
    // fromTo mit festen Startwerten: Beim Neuberechnen (Größenänderung mitten im Umblättern) bleibt der Ausgangszustand erhalten
    for (var k = 1; k <= last; k++) {
      slide
        .fromTo(leaves[k], { xPercent: 100, x: 120 }, { xPercent: 0, x: 0, duration: 0.6, ease: 'power2.inOut' }, k - 1)
        .fromTo(bits[k], { x: push, opacity: 0 }, { x: 0, opacity: 1, duration: 0.3, stagger: 0.05, ease: 'power3.out' }, k - 0.5);
    }
    slide.set({}, {}, last);
    var st = slide.scrollTrigger;

    // Kopfleiste: fährt 150 px vor dem Pinnen ein und bleibt bis zu dessen Ende. Beim Abbau räumt der Aufräumer unten auf,
    // denn beim Abbau durch matchMedia feuert onToggle nicht sicher.
    var guard = ScrollTrigger.create({
      trigger: stageEl,
      start: function () { return 'top top+=' + (hh() + 150); },
      end: function () { return st.end; },
      onToggle: function (self) { if (PS.headerHold) PS.headerHold(self.isActive); }
    });

    function remeasure() {
      if (!alive) return;
      measure();
      paintRail(railAt());
      setActive(Math.round(slide.progress() * last));
    }
    remeasure();
    ScrollTrigger.addEventListener('refresh', remeasure);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(remeasure);

    /* ---------------- Sprung über den Balken ----------------
       Mit Bühne führt der Anker nicht zur Etappe (sie liegt auf der Bühne), sondern zur passenden Scroll-Stelle.
       jumping gilt vom Klick bis 200 ms nach dem letzten scroll-Ereignis. */
    function jumpEnd() { jumping = false; }
    function onScroll() {
      if (!jumping) return;
      clearTimeout(jumpTimer);
      jumpTimer = setTimeout(jumpEnd, 200);
    }
    function onJump(e) {
      var a = e.target.closest && e.target.closest('[data-jump]');
      if (!a || !section.contains(a)) return;
      e.preventDefault();
      jumping = true;
      clearTimeout(jumpTimer);
      jumpTimer = setTimeout(jumpEnd, 200);
      window.scrollTo({ top: st.start + (st.end - st.start) * (+a.getAttribute('data-jump') / last), behavior: 'smooth' });
    }
    section.addEventListener('click', onJump);
    window.addEventListener('scroll', onScroll, { passive: true });

    section.__story = { st: st, guard: guard, last: last, revert: revert };

    // Abbau (reduzierte Bewegung, Fenster unter 600 px Höhe, Section entfernt): Zeitleiste, Pin und guard räumt matchMedia selbst
    // zurück, hier der Rest
    return function () {
      alive = false;
      ScrollTrigger.removeEventListener('refresh', remeasure);
      section.removeEventListener('click', onJump);
      window.removeEventListener('scroll', onScroll);
      clearTimeout(jumpTimer);
      jumping = false;
      section.classList.remove('is-live');
      if (PS.headerHold) PS.headerHold(false);
      delete section.__story;
      fill.style.removeProperty('transform');
      head.style.removeProperty('transform');
      links.forEach(function (a, i) {
        a.classList.remove('is-passed');
        a.style.removeProperty('--show');
        if (i === 0) a.setAttribute('aria-current', 'step');
        else a.removeAttribute('aria-current');
      });
      if (hint) hint.classList.remove('is-gone');
    };
  }
})();
