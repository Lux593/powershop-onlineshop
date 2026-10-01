/* ==========================================================================
   Power Shop – Kontakt-Box: Thema wählen, WhatsApp- und E-Mail-Link mit
   vorausgefüllter Nachricht setzen, Öffnungsstatus anzeigen.
   ========================================================================== */
(function () {
  var PS = (window.PS = window.PS || {});

  var TOPICS = {
    probefahrt: { subj: 'Probefahrt', text: function (x) { return 'ich möchte gerne eine Probefahrt' + (x ? ' mit der ' + x : '') + ' vereinbaren. Wann passt es euch?'; } },
    finanzierung: { subj: 'Finanzierung', text: function (x) { return 'ich interessiere mich für eine Finanzierung' + (x ? ' der ' + x : '') + '. Könnt ihr mir ein Angebot machen?'; } },
    inzahlungnahme: { subj: 'Inzahlungnahme', text: function (x) { return 'ich möchte mein aktuelles Motorrad in Zahlung geben' + (x ? ' und interessiere mich für die ' + x : '') + '. Mein Bike: Modell …, Baujahr …, km-Stand …'; } },
    reservierung: { subj: 'Reservierungsanfrage', text: function (x) { return 'ich möchte die ' + x + ' reservieren. Bitte schickt mir den Zahlungslink für die Reservierungsgebühr.'; } },
    werkstatt: { subj: 'Werkstatt-Termin', text: function () { return 'ich hätte gerne einen Werkstatt-Termin. Mein Bike: Modell …, Baujahr …, Anliegen: …'; } },
    kompatibilitaet: { subj: 'Frage zur Kompatibilität', text: function (x) { return 'passt ' + x + ' an mein Motorrad? Modell …, Baujahr …'; } },
    einbau: { subj: 'Einbau-Anfrage', text: function (x) { return 'könnt ihr ' + x + ' bei mir einbauen? Mein Bike: Modell …, Baujahr …'; } },
    frage: { subj: 'Frage', text: function (x) { return 'ich habe eine Frage' + (x ? ' zur ' + x : '') + ': …'; } }
  };

  function update(box) {
    var pressed = box.querySelector('[data-topic][aria-pressed="true"]');
    var topic = TOPICS[(pressed && pressed.dataset.topic) || 'frage'] || TOPICS.frage;
    var subject = box.dataset.subject;
    var ref = box.dataset.ref || window.location.href;
    var message = 'Hallo Power-Shop-Team, ' + topic.text(subject) + (ref ? '\n\n' + ref : '') + '\n\nViele Grüße';
    var subjectLine = topic.subj + (subject ? ': ' + subject : '');
    var whatsapp = (PS.shop && PS.shop.whatsapp) || '';
    var email = (PS.shop && PS.shop.email) || '';

    var wa = box.querySelector('[data-cb="wa"]');
    var mail = box.querySelector('[data-cb="mail"]');
    if (wa) wa.href = 'https://wa.me/' + whatsapp + '?text=' + encodeURIComponent(message);
    if (mail) mail.href = 'mailto:' + email + '?subject=' + encodeURIComponent(subjectLine) + '&body=' + encodeURIComponent(message);

    // Mobile Kontaktleiste spiegelt die Links der Haupt-Box
    if (box.hasAttribute('data-primary')) {
      document.querySelectorAll('[data-sticky="wa"]').forEach(function (a) { a.href = wa.href; });
      document.querySelectorAll('[data-sticky="mail"]').forEach(function (a) { a.href = mail.href; });
    }
  }

  // Öffnungsstatus aus den Zeiten, die der Server als Data-Attribute liefert
  function openState(el) {
    var hours = PS.shop && PS.shop.hours;
    if (!hours) return;
    var now = new Date();
    var day = now.getDay();
    var time = now.getHours() + now.getMinutes() / 60;
    var slot = hours.filter(function (h) { return h.days.indexOf(day) > -1; })[0];
    if (slot && time >= slot.from && time < slot.to) {
      el.textContent = 'Jetzt geöffnet – bis ' + String(slot.to).padStart(2, '0') + ':00 Uhr';
      el.classList.add('is-open');
    } else {
      el.textContent = 'Gerade geschlossen – schreib uns, wir melden uns.';
      el.classList.remove('is-open');
    }
  }

  PS.on('[data-contact]', function (box) {
    update(box);
    var state = box.querySelector('[data-open-state]');
    if (state) openState(state);
  });

  document.addEventListener('click', function (event) {
    var chip = event.target.closest('[data-contact] [data-topic]');
    if (!chip) return;
    var box = chip.closest('[data-contact]');
    box.querySelectorAll('[data-topic]').forEach(function (c) { c.setAttribute('aria-pressed', c === chip ? 'true' : 'false'); });
    update(box);
  });
})();
