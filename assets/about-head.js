/* ==========================================================================
   Power Shop – Seitenkopf „Halle, dunkel“ (sections/about-head.liquid): Über uns und Werkstatt. Lädt nur mit der Section.

   1. Sprungziele hinter dem Kopf. Liegt der Abschnitt nach dem Kopf hinter ihm (Geschichte auf Über uns, Rolltor auf der Werkstatt),
      stünde ein Anker darin (#geschichte, #umbauten) beim Laden genau unter dem Kopf: Der Browser spränge kaum vom Fleck. Ziel ist
      stattdessen die Stelle, an der der Kopf ganz weg ist (seine Unterkante an der Kopfleiste). Gilt für Klicks auf Links zur eigenen
      Seite (Menü, Service-Leiste) und für den Aufruf mit Anker. Läuft vor dem Anker-Gleiten von motion.js (Capture). Links im offenen
      Handy-Menü lässt es durch: theme.js schließt erst das Menü und klickt dann noch einmal.
   2. Rolltor (Kopf mit .about-head--roll, Werkstatt): Das Hochfahren selbst ist CSS (about-head.css, sticky). Das Skript dunkelt den Kopf
      beim Wegscrollen bis 0,75 ab (--cover wie auf Über uns), blendet „Weiter“ gleich zu Beginn aus, hält die Kopfleiste stehen
      (PS.headerHold aus header.js, sonst läge über dem stehenden Inhalt ein leerer Streifen) und lässt „Weiter“ an die Stelle gleiten,
      an der der Kopf weg ist. Auf Über uns macht das alles about-story.js mit der Bühne.
   ========================================================================== */
(function () {
  if (window.PS && window.PS.on) start();
  else document.addEventListener('DOMContentLoaded', start, { once: true });

  function start() {
    var PS = window.PS;
    if (!PS || !PS.on) return;
    PS.on('[data-about-head]', function (head) { return init(PS, head); });
  }

  // Höhe der Kopfleiste aus dem Token (64 px, ab 1024 px 76 px), wie in about-story.js
  function hh() {
    return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 0;
  }

  // Die Section direkt nach dem Kopf
  function nextHost(head) {
    var host = head.closest('.shopify-section');
    var next = host && host.nextElementSibling;
    while (next && !next.classList.contains('shopify-section')) next = next.nextElementSibling;
    return next;
  }

  function glide(PS, y, instant) {
    y = Math.max(0, Math.round(y));
    if (PS.lenis && !PS.lenis.isStopped) PS.lenis.scrollTo(y, instant ? { immediate: true } : undefined);
    else window.scrollTo({ top: y, behavior: instant ? 'auto' : 'smooth' });
  }

  function init(PS, head) {
    var html = document.documentElement;
    var cue = head.querySelector('.about-head__scroll');
    var roll = head.classList.contains('about-head--roll');
    var after = nextHost(head);

    // Scrollposition, an der die Unterkante des Kopfs die Kopfleiste erreicht: Der Kopf ist weg, der Abschnitt dahinter liegt frei
    function clearY() { return head.getBoundingClientRect().bottom + window.scrollY - hh(); }

    // Steht das Ziel gerade hinter dem Kopf? Nur dann lenken wir um, sonst springt der Browser (oder motion.js) wie gewohnt.
    function behind(el) {
      if (!el || !after || !after.contains(el) || !el.getClientRects().length) return false;
      return el.getBoundingClientRect().top < head.getBoundingClientRect().bottom - 1;
    }
    function target(hash) {
      if (!hash || hash.length < 2) return null;
      try { return document.getElementById(decodeURIComponent(hash.slice(1))); } catch (e) { return null; }
    }

    function onClick(e) {
      if (!head.isConnected) { teardown(); return; } // Section im Theme-Editor neu geladen: der neue Kopf startet eigens
      if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest && e.target.closest('a[href*="#"]');
      if (!a || a.target || a.origin !== location.origin || a.pathname !== location.pathname || a.search !== location.search) return;
      if (a.closest('dialog[open]')) return; // Handy-Menü: theme.js schließt es und klickt dann erneut
      var isCue = cue && a === cue;
      if (!isCue && !behind(target(a.hash))) return;
      if (isCue && !roll) return; // „Weiter“ ohne Rolltor: about-story.js (Bühne) oder der Browser
      e.preventDefault();
      if (!isCue && location.hash !== a.hash) history.pushState(null, '', a.hash);
      glide(PS, clearY());
    }
    document.addEventListener('click', onClick, true);

    // Aufruf mit Anker (aus dem Menü einer anderen Seite): erst nach dem Laden, wenn Schrift und Bilder stehen. Der Browser ist dann
    // schon gesprungen (kaum vom Fleck, das Ziel liegt unter dem Kopf); nur wenn noch nicht weitergescrollt wurde.
    function onLoad() {
      var t = target(location.hash);
      if (behind(t) && window.scrollY < clearY() - 4) glide(PS, clearY(), true);
    }
    if (location.hash.length > 1) {
      if (document.readyState === 'complete') onLoad();
      else window.addEventListener('load', onLoad, { once: true });
    }

    var teardownRoll = roll && after ? rolltor(PS, head, cue, html) : null;

    function teardown() {
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('load', onLoad);
      if (teardownRoll) teardownRoll();
    }
    return teardown;
  }

  function rolltor(PS, head, cue, html) {
    var mq = window.matchMedia('(prefers-reduced-motion: no-preference) and (min-height: 600px)');
    var held = false, raf = 0, live = false;

    function active() { return mq.matches && html.classList.contains('has-motion'); }

    function paint() {
      raf = 0;
      if (!live) return;
      if (!head.isConnected) { stop(); return; }
      var r = head.getBoundingClientRect();
      var h = r.height || 1;
      // 0, solange der Kopf noch nicht unter die Kopfleiste fährt; 1, wenn seine Unterkante sie erreicht
      var p = Math.min(1, Math.max(0, (hh() - r.top) / (h)));
      head.style.setProperty('--cover', (p * 0.75).toFixed(3));
      if (cue) cue.style.opacity = String(Math.max(0, 1 - p / 0.15));
      // Kopfleiste stehen lassen ab 150 px vor dem Hochfahren, bis der Kopf ganz aus dem Fenster ist (wie die Bühne auf Über uns).
      // Danach scrollt der Inhalt wieder mit, die Kopfleiste darf wegfahren, ohne einen leeren Streifen aufzudecken.
      var hold = r.top < hh() + 150 && r.bottom > 0;
      if (hold !== held) {
        held = hold;
        if (PS.headerHold) PS.headerHold(held);
      }
    }
    function queue() { if (!raf) raf = requestAnimationFrame(paint); }

    function reset() {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      head.style.removeProperty('--cover');
      if (cue) cue.style.removeProperty('opacity');
      if (held && PS.headerHold) PS.headerHold(false);
      held = false;
    }
    function sync() {
      var on = active();
      if (on === live) return;
      live = on;
      if (live) queue();
      else reset();
    }

    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue, { passive: true });
    if (mq.addEventListener) mq.addEventListener('change', sync);
    sync();

    function stop() {
      window.removeEventListener('scroll', queue);
      window.removeEventListener('resize', queue);
      if (mq.removeEventListener) mq.removeEventListener('change', sync);
      live = false;
      reset();
    }
    return stop;
  }
})();
