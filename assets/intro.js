/* ==========================================================================
   Power Shop – Intro / Einlass (Startseite). Markup: snippets/intro.liquid, Stile: assets/intro.css, Doku: docs/intro.md.
   Läuft nur, wenn das Head-Skript (layout/theme.liquid) html.intro-on gesetzt hat. Ablauf:
     build   Film „Aufbau“ läuft, das Logo zeichnet sich aus Linien
     ready   Überschrift und Button sind eingestiegen, warten auf den Klick
     zoom    Klick: Texte steigen aus, das Logo (Vektor, live gezeichnet) fährt durch den Balken auf die ECHTE Startseite
     done    Überzug ist weg (Event ps:introdone gibt es schon früh in der Fahrt, hero.js startet dann seinen Film)
   Der Zoom ist kein Film: Das Logo liegt als Vektor in einer SVG über der Seite, das Fenster im Balken ist ein Loch, durch das man
   die wirkliche Startseite sieht. Am Ende der Fahrt füllt das Loch den Bildschirm, in jedem Seitenverhältnis, daher gibt es keinen
   sichtbaren Übergang. Beim Klick stimmt das erste Bild der SVG mit dem letzten Bild des Aufbau-Films überein.
   Beim Freigeben der Seite gleiten Header und Ankündigungsleiste leicht ein (html.intro-in, intro.css).
   Jeder Fehlerfall führt nach done: ohne laufenden Film (Autoplay gesperrt, Netz zu langsam) steht das Logo als SVG mit den Texten,
   nach dem Klick fährt der Zoom trotzdem. Der Besuch wird erst bei der Freigabe der Seite als gesehen gemerkt.
   ========================================================================== */
(function () {
  'use strict';
  var doc = document, html = doc.documentElement;
  var root = doc.querySelector('[data-intro-root]');
  if (!root) return;

  var T_TEXT = 3.3;      // s im Aufbau-Film: die Linien treffen sich, ab hier steigen die Texte ein
  var ZOOM_MS = 3000;    // Dauer der Kamerafahrt
  var RELEASE_AT = 0.6;  // Anteil der Fahrt, ab dem die Seite frei ist: Das Fenster füllt dann fast den Bildschirm, die Hero-Überschrift steigt ein
  var state = 'build';
  var textShown = false, fallback = false, released = false;
  var inerted = [], timers = [];
  function later(fn, ms) { var t = setTimeout(fn, ms); timers.push(t); return t; }

  // Das Head-Skript wollte keinen Intro (schon gesehen, Datensparen, Bot …): Überzug samt Film-Adressen verwerfen
  if (!html.classList.contains('intro-on')) { root.remove(); return; }
  var variant = html.getAttribute('data-intro-variant') === 'portrait' ? 'portrait' : 'landscape';
  var S;
  try { S = JSON.parse(root.getAttribute('data-sources'))[variant]; } catch (e) { S = null; }
  var stage = root.querySelector('.intro__stage');
  var build = root.querySelector('.intro__video--build');
  var text = root.querySelector('[data-intro-text]');
  var tpl = root.querySelector('[data-intro-tpl]');
  var skip = root.querySelector('[data-intro-skip]');
  // Seite kam mitten aus dem Scrollen zurück (Neuladen, Zurück-Taste): dort gehört kein Intro hin
  if (!S || !stage || !build || !tpl || (window.pageYOffset || 0) > 80) { finish(true); return; }
  html.setAttribute('data-intro-ready', ''); // Failsafe im Head: ohne dieses Zeichen gibt er die Seite nach 6 s frei

  /* ---------------- Logo als Vektor ----------------
     Spur des Logos (aus intro-logo, 1447 × 1173 Pixel; Fenster im Balken: x 90–1357, y 492–692, Mitte 723,5 / 592).
     Geometrie der Bühne = die der Filme: Bühne 1920 × 1080 (Querformat) bzw. 1080 × 1920 (Hochformat), Logo mit Breite lw bei lx / ly.
     aEnd: Mindest-Vergrößerung am Ende; die Fahrt rechnet sie je nach Bildschirm hoch, bis das Fenster ihn sicher ganz füllt. */
  var LOGO = {
    w: 1447, h: 1173, win: [90, 492, 1357, 692],
    d: 'M719.92 1172.75C719.75 1172.58 715.75 1171.56 711.04 1170.49C680.75 1163.63 642.31 1151.26 605.7 1136.59C597.27 1133.22 583.54 1127.35 571.75 1122.11C563.62 1118.49 559.89 1116.77 549.5 1111.89C544.66 1109.61 518.96 1096.77 515.37 1094.83C513.65 1093.9 509.77 1091.84 506.75 1090.25C427.57 1048.56 340.39 986.39 268 920C244.02 898.02 208.44 862.86 209.3 862C209.57 861.73 212.37 860.85 215.52 860.04C250.1 851.2 280.05 834.7 297.53 814.84C306.09 805.12 314.92 789.5 315.88 782.41L316.13 780.5L158.19 780.38L0.25 780.25L0.12 592.12L0 404L158.21 404C330.93 404 318.38 404.21 317.77 401.34C317.64 400.74 317.3 398.63 317.02 396.65C313.59 372.9 292.32 349.21 260.5 333.7C256.24 331.63 252.41 329.75 252 329.53C251 329.01 250.59 199.56 251.58 198.95C251.91 198.75 254.55 198.45 257.46 198.29C266.34 197.79 284.2 196.41 293.62 195.48C312.48 193.62 315.77 193.23 336 190.46C413.38 179.86 486.34 159.37 549.56 130.48C620.56 98.04 683.62 51.63 719.64 5.33C721.51 2.93 723.25 1.1 723.52 1.26C723.78 1.42 725.4 3.4 727.11 5.65C768.87 60.58 850.93 115.36 941.96 149.08C960.53 155.96 986.36 164.25 1003.25 168.75C1035.33 177.3 1062.07 182.96 1096.5 188.48C1099.7 188.99 1118.15 191.54 1125.5 192.49C1133.17 193.48 1140.05 194.23 1153 195.49C1162.47 196.42 1180.25 197.8 1189.14 198.3C1192.89 198.51 1194.75 198.82 1195.26 199.33C1196.28 200.35 1196.39 327.28 1195.38 328.66C1195.03 329.12 1192.08 330.73 1188.81 332.23C1158.36 346.23 1136.52 368.34 1130.51 391.25C1129.09 396.67 1128.6 402.94 1129.55 403.54C1129.95 403.8 1196.78 403.99 1288.13 403.99L1446 404L1445.88 592.12L1445.75 780.25L1288.27 780.38C1201.66 780.44 1130.61 780.69 1130.38 780.92C1129.33 781.97 1135.63 796.43 1140.16 803.36C1157.54 829.99 1193.31 851.66 1235.62 861.21C1238.26 861.8 1237.1 863.21 1219.62 880.55C1147.38 952.23 1076.04 1008.8 995.75 1058.08C977.01 1069.58 958.96 1079.91 936.5 1091.98C929.82 1095.57 898.36 1111.3 891.75 1114.35C889.27 1115.49 885.45 1117.26 883.25 1118.27C853.47 1132.02 816.79 1146.45 788 1155.76C768.57 1162.05 753.2 1166.35 733.25 1171.09C726.9 1172.6 720.56 1173.39 719.92 1172.75ZM730.44 1072.47C836.24 1044.69 949.15 987.95 1051.25 911.25C1070.95 896.45 1099.83 872.89 1100.37 871.18C1100.47 870.87 1097.9 868.87 1094.66 866.75C1063.04 845.95 1041.45 818.21 1032.2 786.5C1031.44 783.89 1030.6 781.47 1030.35 781.12C1029.97 780.63 967.97 780.5 723.25 780.5C478.55 780.5 416.52 780.63 416.12 781.12C415.85 781.47 415.01 783.89 414.27 786.5C405.4 817.72 383.41 845.98 351.86 866.73C344.93 871.29 345.12 870.63 349.62 874.62C406.51 924.92 499.82 985.26 575.25 1020.52C577.73 1021.67 581.44 1023.41 583.5 1024.37C588.1 1026.52 599.6 1031.64 604 1033.51C630.8 1044.87 646.69 1050.92 670.25 1058.75C684.84 1063.61 693.98 1066.42 705.25 1069.53C707.17 1070.06 711.45 1071.26 714.75 1072.19C722.29 1074.32 723.33 1074.34 730.44 1072.47ZM1274.21 882.06C1252.96 874.81 1253.06 845.15 1274.36 838.04C1295.52 830.97 1313.18 856.25 1299.58 874.13C1293.84 881.67 1283 885.06 1274.21 882.06ZM1289.6 878.35C1303.89 871.34 1305.45 852.22 1292.44 843.54C1274.25 831.39 1252.75 853.06 1264.86 871.32C1270.08 879.18 1281.37 882.39 1289.6 878.35ZM1272.38 874.46C1270.96 873.63 1271.04 847.28 1272.47 846.52C1274.08 845.65 1284.38 845.92 1287.24 846.9C1291.95 848.51 1293.68 854.39 1290.73 858.74C1289.56 860.45 1289.52 860.69 1290.23 861.47C1292.09 863.53 1292.86 874.66 1291.15 874.91C1288.79 875.24 1288.17 874.33 1287.84 869.99C1287.33 863.34 1287.24 863.25 1280.99 863.25L1275.75 863.25L1275.61 868.5C1275.46 874.55 1274.75 875.85 1272.38 874.46ZM1286.54 857.54C1290.59 853.49 1287.73 849.9 1280.63 850.11L1275.75 850.25L1275.6 853.95C1275.39 859.17 1275.23 859 1280.52 859C1284.89 859 1285.14 858.94 1286.54 857.54ZM1356.4 691.4C1357.44 690.36 1357.25 493.82 1356.21 492.79C1355.41 491.98 92.88 491.5 90.79 492.3C89.97 492.62 89.51 690.84 90.33 691.67C90.99 692.32 1355.74 692.06 1356.4 691.4ZM1031.21 403.21C1031.65 402.78 1032 401.6 1032 400.59C1032 399.58 1032.46 396.05 1033.02 392.75C1039 357.23 1060.05 319.41 1094.68 281.91C1098.16 278.14 1101 274.83 1101 274.53C1101 274.18 1098.38 274 1093.2 274C1085.82 274 1079.64 273.68 1064 272.48C1057.53 271.99 1055.09 271.74 1044.5 270.5C1012.46 266.74 975.15 258.89 942 248.93C866.72 226.31 793.21 189.49 728.75 142.13C722.76 137.73 724.25 137.41 713.16 145.4C686.5 164.6 657.36 182.71 628.75 197.86C623.29 200.74 596.66 214 596.31 214C596.19 214 593.94 215 591.31 216.23C565.81 228.15 526.63 242.71 499 250.54C485.85 254.27 467.64 258.87 457.75 260.98C455 261.56 451.85 262.25 450.75 262.49C447.03 263.34 438.59 264.92 429.38 266.51C427.79 266.78 425.21 267.22 423.62 267.5C404.18 270.88 370.08 274.01 352.88 274C348.54 274 345 274.15 345 274.32C345 274.5 347.43 277.26 350.41 280.45C387.49 320.22 410.18 361.98 414.06 397.58C414.45 401.15 414.86 402.94 415.41 403.38C416.74 404.44 1030.15 404.28 1031.21 403.21Z'
  };
  var LAYOUT = {
    landscape: { w: 1920, h: 1080, lw: 690, lx: 615, ly: 152, aEnd: 7.5 },
    portrait: { w: 1080, h: 1920, lw: 800, lx: 140, ly: 444, aEnd: 11.5 }
  };
  var Z = LAYOUT[variant];
  var S0 = Z.lw / LOGO.w;                                        // Maßstab des Logos im Ausgangsbild
  var WX0 = LOGO.win[0], WY0 = LOGO.win[1], WX1 = LOGO.win[2], WY1 = LOGO.win[3];
  var CX = (WX0 + WX1) / 2, CY = (WY0 + WY1) / 2;                // Mitte des Fensters im Logo
  var H0X = Z.lx + CX * S0, H0Y = Z.ly + CY * S0;                // …und im Ausgangsbild
  var GLOW = [24, 48, 76, 108, 146, 190, 240, 300].map(function (w) { return [w, 0.021]; }); // Schein um das Logo: acht übereinander liegende Striche (Breite in Bühnen-Einheiten, Deckkraft), nähert eine weiche Unschärfe
  var svg = null, plate, dim, cam, halos = [];
  var view = null, aEnd = Z.aEnd;

  function buildSvg() {
    var NS = 'http://www.w3.org/2000/svg';
    function make(name, attrs, parent) {
      var n = doc.createElementNS(NS, name);
      for (var k in attrs) n.setAttribute(k, attrs[k]);
      if (parent) parent.appendChild(n);
      return n;
    }
    svg = make('svg', { 'class': 'intro__zoom', viewBox: '0 0 ' + Z.w + ' ' + Z.h, preserveAspectRatio: 'none', 'aria-hidden': 'true', focusable: 'false' });
    // Dunkler Grund mit weichem warmem Rand, wie im Film (Mitte 22/15/10, Rand 8/8/9; Verlauf (1−d)^1,6)
    var grad = make('radialGradient', {
      id: 'intro-bg', gradientUnits: 'userSpaceOnUse', cx: 0, cy: 0, r: 1,
      gradientTransform: 'translate(' + Z.w / 2 + ' ' + Z.h * 0.42 + ') scale(' + Z.w * 0.75 + ' ' + Z.h * 0.75 + ')'
    }, make('defs', {}, svg));
    [0, 0.1, 0.2, 0.3, 0.45, 0.6, 0.75, 0.9, 1].forEach(function (s) {
      var k = Math.pow(1 - s, 1.6);
      make('stop', { offset: s, 'stop-color': 'rgb(' + [8 + 14 * k, 8 + 7 * k, 9 + k].map(Math.round).join(',') + ')' }, grad);
    });
    plate = make('path', { fill: 'url(#intro-bg)', 'fill-rule': 'evenodd' }, svg);  // Grund mit Loch im Fenster
    dim = make('rect', { fill: 'url(#intro-bg)' }, svg);                           // verdunkelt das Fenster am Anfang
    cam = make('g', {}, svg);
    GLOW.forEach(function () {
      halos.push(make('path', { d: LOGO.d, fill: 'none', stroke: '#ff7814', 'stroke-linejoin': 'round', opacity: 0, display: 'none' }, cam));
    });
    make('path', { d: LOGO.d, fill: '#fa6600', 'fill-rule': 'evenodd' }, cam);
    stage.insertBefore(svg, text); // über den Filmen, unter den Texten
  }
  try { buildSvg(); draw(0); } catch (e) { svg = null; }

  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function smooth(t, lo, hi) { t = Math.min(Math.max((t - lo) / (hi - lo), 0), 1); return t * t * (3 - 2 * t); }
  function n2(v) { return Math.round(v * 100) / 100; }

  // Bildschirm in Einheiten der Bühne (die Bühne ist größer als der Bildschirm, wenn das Seitenverhältnis abweicht)
  function measure() {
    var r = root.getBoundingClientRect(), s = stage.getBoundingClientRect();
    if (!s.width || !s.height) return;
    var kx = Z.w / s.width, ky = Z.h / s.height;
    view = { cx: ((r.left + r.right) / 2 - s.left) * kx, cy: ((r.top + r.bottom) / 2 - s.top) * ky, w: r.width * kx, h: r.height * ky };
    aEnd = Math.max(Z.aEnd, 1.12 * Math.max(view.w / (WX1 - WX0), view.h / (WY1 - WY0)));
  }

  // Ein Bild der Kamerafahrt, t = 0…1. t = 0 ist das fertige Logo wie im letzten Bild des Aufbau-Films.
  function draw(t) {
    var e = ease(t);
    var vx = view ? view.cx : Z.w / 2, vy = view ? view.cy : Z.h / 2;
    var A = S0 * Math.pow(aEnd / S0, e);
    var fx = H0X + (vx - H0X) * e, fy = H0Y + (vy - H0Y) * e;
    cam.setAttribute('transform', 'matrix(' + A + ' 0 0 ' + A + ' ' + n2(fx - A * CX) + ' ' + n2(fy - A * CY) + ')');
    // Loch im Grund: Fenster des Balkens, 2 Einheiten größer, damit der Rand unter dem Orange liegt
    var m = 2;
    var x0 = n2(fx + A * (WX0 - CX) - m), x1 = n2(fx + A * (WX1 - CX) + m);
    var y0 = n2(fy + A * (WY0 - CY) - m), y1 = n2(fy + A * (WY1 - CY) + m);
    plate.setAttribute('d', 'M0 0H' + Z.w + 'V' + Z.h + 'H0ZM' + x0 + ' ' + y0 + 'H' + x1 + 'V' + y1 + 'H' + x0 + 'Z');
    var br = smooth(t, 0, 0.3);  // das Fenster hellt auf: die Seite scheint durch
    if (br < 1) {
      dim.setAttribute('x', x0); dim.setAttribute('y', y0);
      dim.setAttribute('width', n2(x1 - x0)); dim.setAttribute('height', n2(y1 - y0));
      dim.setAttribute('opacity', n2(1 - br));
      dim.setAttribute('display', 'inline');
    } else {
      dim.setAttribute('display', 'none');
    }
    var s = Math.exp(-Math.pow((t - 0.45) / 0.2, 2)); // Schein: Spitze in der Mitte der Fahrt
    halos.forEach(function (h, i) {
      if (s < 0.03) { h.setAttribute('display', 'none'); return; }
      h.setAttribute('display', 'inline');
      h.setAttribute('stroke-width', n2(GLOW[i][0] / A));
      h.setAttribute('opacity', n2(GLOW[i][1] * s * 1000) / 1000);
    });
  }

  /* ---------------- Seite dahinter sperren ---------------- */
  [].forEach.call(doc.body.children, function (el) {
    if (el === root || /^(SCRIPT|STYLE|LINK|TEMPLATE)$/.test(el.tagName) || el.hasAttribute('inert')) return;
    el.setAttribute('inert', '');
    inerted.push(el);
  });
  if (window.PS && PS.lenis && PS.lenis.stop) PS.lenis.stop();
  root.focus({ preventScroll: true });

  /* ---------------- Aufbau-Film ---------------- */
  function pick(v, s) {
    // WebM nur wenn sicher abspielbar (wie hero.js), sonst MP4
    return s.webm && v.canPlayType('video/webm; codecs="vp9"') === 'probably' ? s.webm : s.mp4;
  }
  build.muted = true;
  // Fehler beim Laden oder Dekodieren (etwa ein WebM-Profil, das Safari nicht kann, obwohl canPlayType „probably“ sagt):
  // einmal mit dem MP4 (H.264 geht überall) neu versuchen, erst danach gilt der Film als defekt.
  function retryMp4(v, s) {
    if (v.getAttribute('src') === s.mp4) return false;
    v.src = s.mp4;
    v.load();
    return true;
  }
  build.src = pick(build, S.build);

  function showFrame() {
    // Notlösung: das fertige Logo als SVG (gleiches Bild wie das Ende des Films), Texte sofort
    if (fallback || state === 'done') return;
    fallback = true;
    root.classList.add('is-fallback');
    if (svg) root.classList.add('is-svg');
    build.pause();
    showText();
  }

  var started = later(showFrame, 5000); // der Film kommt in 5 s nicht in Gang
  var playing = false;
  function playBuild() {
    var p = build.play();
    // Nur gesperrtes Autoplay (iOS Strom sparen) führt gleich zum Standbild. NotSupportedError (Quelle nicht ladbar) kommt vor dem
    // error-Ereignis und gehört dem MP4-Rückfall unten; AbortError ist ein Neuladen.
    if (p && p.catch) p.catch(function (e) { if (e && e.name === 'NotAllowedError') showFrame(); });
  }
  build.addEventListener('playing', function () {
    playing = true;
    clearTimeout(started);
    build.classList.add('is-on');
    watch();
  }, { once: true });
  build.addEventListener('error', function () { if (retryMp4(build, S.build)) playBuild(); else showFrame(); });
  build.addEventListener('ended', showText);
  playBuild();
  // Kein Fehlerereignis, aber auch kein Bild (manche Browser): nach 2,2 s das MP4 versuchen
  later(function () {
    // networkState 2 = lädt noch (langsames Netz): dann warten, nicht den größeren Film nachladen
    if (!playing && state === 'build' && build.networkState !== 2 && retryMp4(build, S.build)) playBuild();
  }, 2200);
  // Zurück im Tab: ein vom Browser angehaltener Film läuft weiter
  doc.addEventListener('visibilitychange', function () {
    if (!doc.hidden && state === 'build' && !fallback && build.paused && !build.ended) { var q = build.play(); if (q && q.catch) q.catch(function () {}); }
  });

  function watch() {
    // currentTime ist genauer als timeupdate (alle 250 ms)
    (function tick() {
      if (state !== 'build' || textShown) return;
      if (build.currentTime >= T_TEXT) { showText(); return; }
      requestAnimationFrame(tick);
    })();
  }

  /* ---------------- Texte ---------------- */
  function showText() {
    if (textShown || state === 'done') return;
    textShown = true;
    state = 'ready';
    text.appendChild(tpl.content.cloneNode(true));
    var enter = text.querySelector('[data-intro-enter]');
    enter.addEventListener('click', go);
    // Die Bewegungsschicht startet die neuen Elemente selbst (MutationObserver, motion.js). Kommt sie nicht (Skript fehlt, Fenster zu
    // niedrig für die Beobachtungsgrenze), zeigt dieser Failsafe die Texte nach 1,8 s trotzdem.
    later(function () {
      [].forEach.call(text.querySelectorAll('[data-split],[data-reveal]'), function (el) { el.classList.add('is-in', 'is-split'); });
    }, 1800);
  }

  /* ---------------- Klick: Zoom ---------------- */
  function go() {
    if (state !== 'ready') return;
    state = 'zoom';
    root.classList.add('is-leaving');
    if (!svg) { later(finish, 520); return; } // ohne SVG: Überzug blendet nur aus
    measure();
    build.pause();
    // Ab jetzt zeigt die SVG das Bild (sie deckt Film und Grund; das Loch im Fenster ist noch ganz verdunkelt), der Überzug selbst wird durchsichtig
    root.classList.add('is-svg', 'is-live');
    var t0 = 0;
    requestAnimationFrame(function frame(now) {
      if (state !== 'zoom') return;
      if (!t0) t0 = now;
      var t = Math.min((now - t0) / ZOOM_MS, 1);
      draw(t);
      if (!released && t >= RELEASE_AT) release();
      if (t >= 1) { finish('cut'); return; }
      requestAnimationFrame(frame);
    });
    later(finish, ZOOM_MS + 4000); // Notausstieg (Tab im Hintergrund …)
  }

  /* ---------------- Seite freigeben, Ende ---------------- */
  function release(noFocus) {
    if (released) return;
    released = true;
    html.classList.remove('intro-on');
    inerted.forEach(function (el) { el.removeAttribute('inert'); });
    if (window.PS && PS.lenis && PS.lenis.start) PS.lenis.start();
    // Als gesehen merken (Speicher kann gesperrt sein: Safari privat, Cookies aus)
    try { sessionStorage.setItem('ps-intro', '1'); } catch (e) {}
    try { localStorage.setItem('ps-intro', String(Date.now())); } catch (e) {}
    root.classList.add('is-released'); // der Überzug lässt Klicks durch
    // Header und Ankündigungsleiste gleiten ein (intro.css). Nicht, wenn es nie einen Intro gab (noFocus = true: früher Ausstieg).
    if (noFocus !== true) {
      html.classList.add('intro-in');
      setTimeout(function () { html.classList.remove('intro-in'); }, 1500);
    }
    var main = doc.getElementById('main');
    if (main && noFocus !== true) {
      main.setAttribute('tabindex', '-1');
      main.focus({ preventScroll: true });
      main.addEventListener('blur', function () { main.removeAttribute('tabindex'); }, { once: true });
    }
    // Ab jetzt laufen die Seitenanimationen (Hero-Überschrift …), weil intro-on weg ist; hero.js startet seinen Film
    doc.dispatchEvent(new Event('ps:introdone'));
  }
  function finish(how) {
    if (state === 'done') return;
    state = 'done';
    timers.forEach(clearTimeout);
    release(how === true);
    // true: es gab nie einen Intro. 'cut': die Fahrt ist zu Ende, das Loch füllt den Bildschirm, der Überzug kann ohne Blende weg.
    if (how === true || how === 'cut') { root.remove(); return; }
    root.classList.add('is-out');
    setTimeout(function () { root.remove(); }, 900);
  }

  /* ---------------- Überspringen ---------------- */
  skip.addEventListener('click', function () { finish(); });
  doc.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && state !== 'done') finish();
    // Enter betritt, auch ohne Fokus auf dem Button (der Fokus bleibt auf dem Überzug, damit kein Ring am noch einsteigenden Button hängt)
    else if (e.key === 'Enter' && state === 'ready' && !e.target.closest('button')) go();
  });
})();
