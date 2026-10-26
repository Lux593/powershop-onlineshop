# Kundenkonto: Einstellungen im Shopify-Admin

Was das Theme macht und was im Admin eingestellt werden muss, damit Anmeldung und Kundenkonto im Power-Shop-Design erscheinen.
Stand 26.10.2026, Basic-Tarif. Die Bezeichnungen im deutschen Admin können leicht abweichen.

## So läuft die Anmeldung

- **Kein Passwort, keine eigene Datenbank.** Shopify speichert die Kunden (Admin › Kunden). Der Kunde gibt seine E-Mail ein, bekommt einen 6-stelligen Code und ist angemeldet. Konten entstehen bei der ersten Anmeldung oder bei einer Bestellung.
- **Ab 490 px Bildschirmbreite (Tablet, Desktop):** Ein Klick auf das Konto-Symbol im Header öffnet ein dunkles Fenster auf der Shop-Seite. Darin stehen die Anmeldung und die Links zu Bestellungen und Profil (Theme-Code, `sections/header.liquid`).
- **Handy:** Menü › „Anmelden“ führt zur Anmeldeseite von Shopify.
- **Code eingeben, Bestellungen, Profil:** Diese Seiten hostet Shopify (shopify.com/…/account). Ein eigenes Template dafür gibt es nicht mehr. Ihr Aussehen kommt ausschließlich aus dem Editor in Schritt 4. Auch wer im Fenster seine E-Mail eingibt, landet für den Code auf dieser Seite.

## 1. „Mit Shop anmelden“ abschalten

**Wo:** Einstellungen › Kundenkonten › Abschnitt „Sign in with Shop“
**Was:** Schalter aus, „Deaktivieren“ bestätigen.

Danach verschwindet der lila Knopf im Konto-Fenster und auf der Anmeldeseite. Shop Pay als Zahlungsart im Checkout ist davon getrennt und bleibt.

## 2. Anmeldung mit Google

**Wo:** Einstellungen › Kundenkonten › Abschnitt Anmeldung › „Verwalten“ › bei Google „Verbinden“.
Shopify zeigt dort zwei Werte an: „Autorisierte JavaScript-Ursprünge“ und „Autorisierte Weiterleitungs-URI“.

**In der Google Cloud Console** (console.cloud.google.com, mit dem Google-Konto des Shops):
1. Ein Projekt anlegen, z. B. „Power Shop Anmeldung“.
2. APIs & Dienste › OAuth-Zustimmungsbildschirm: App-Name „Power Shop“, Support-E-Mail, Logo (`docs/kundenkonto/logo-powershop-hell.png`), Link zur Datenschutzerklärung `https://powershop-online.myshopify.com/policies/privacy-policy`.
3. APIs & Dienste › Anmeldedaten › „Anmeldedaten erstellen“ › OAuth-Client-ID, Anwendungstyp „Webanwendung“.
4. Die beiden Werte aus Shopify eintragen, jeweils in das passende Feld.
5. Die angezeigte **Client-ID** und den **Clientschlüssel** kopieren und in Shopify unter „Anmeldedaten“ einfügen. Speichern.
6. In der Google Cloud Console unter „Zielgruppe“ die App veröffentlichen („App veröffentlichen“). Sonst können sich nur Testnutzer anmelden.

Danach erscheint „Mit Google anmelden“ im Konto-Fenster und auf der Anmeldeseite. Google übergibt nur die E-Mail-Adresse an Shopify.
Anleitung von Shopify: https://help.shopify.com/en/manual/customers/customer-accounts/sign-in-options/social-sign-in/google

## 3. Anmeldung mit Apple

Gibt es bei Shopify noch nicht. Shopify arbeitet daran, nennt aber keinen Termin (Shopify-Forum, 24.09.2026). Sobald es freigegeben ist, steht es voraussichtlich unter Einstellungen › Kundenkonten neben Google.

## 4. Aussehen von Anmeldung, Kontoseiten und Checkout

**Wo:** Einstellungen › Checkout › „Anpassen“. Das öffnet den Editor „Checkout und Konten“. Laut Shopify gelten die Markeneinstellungen seit Mai 2026 gemeinsam für Checkout, Kontoseiten und Anmeldeseite. Welche Felder der Basic-Tarif genau zeigt, war von außen nicht einsehbar. Fehlt eine Einstellung, bitte melden.

| Einstellung | Wert |
|---|---|
| Logo | `docs/kundenkonto/logo-powershop-dunkel.png` bei schwarzer Kopfzeile, sonst `logo-powershop-hell.png`. Größe so, dass der Schriftzug etwa so hoch ist wie im Shop-Header |
| Kopfzeile, Hintergrund | `#0a0a0a` (wie der Shop-Header) |
| Seitenhintergrund | `#f5f3ef` |
| Flächen/Abschnitte | `#ffffff` |
| Text | `#0a0a0a` |
| Akzent (Links, Fokus, Auswahl) | `#f26722` |
| Hauptknopf | Hintergrund `#f26722`, Schrift `#0a0a0a` (Weiß auf Orange wäre zu kontrastarm) |
| Fehler | `#c62828` |
| Ecken | die kleinste Stufe bzw. „Keine“ (der Shop nutzt 2 px) |
| Schrift Überschriften | Barlow Condensed |
| Schrift Text | Inter |

Beide Schriften sind in Shopifys Schriftenbibliothek. Werte im Shop: `assets/tokens.css`.

Nach dem Speichern prüfen:
- **Anmeldeseite:** Abmelden, dann Handy-Menü › Anmelden. Am Desktop eine E-Mail im Konto-Fenster eingeben.
- **Bestellungen und Profil:** über das Konto-Fenster, angemeldet.

## 5. Logo für E-Mails und Shop-App

**Wo:** Einstellungen › Allgemein › Markenassets › Logo: `logo-powershop-hell.png`.
**Dazu:** Einstellungen › Benachrichtigungen › Kundenbenachrichtigungen. Dort die Mail mit dem Anmeldecode ansehen und unter „E-Mail-Vorlagen anpassen“ Logo und Akzentfarbe `#f26722` setzen.

## 6. Shop-Name (optional)

Auf den Kontoseiten steht ohne Logo und in E-Mails der Store-Name „Power Shop Onlineshop“. Ändern unter Einstellungen › Allgemein › Name des Shops, falls dort nur „Power Shop“ stehen soll.

## 7. Recht und Einwilligung

- **Double-Opt-in:** Das Konto-Fenster bietet beim Anmelden eine Newsletter-Einwilligung an. In Deutschland gilt sie erst nach Bestätigung per Mail. Einstellungen › Benachrichtigungen › Abschnitt Double-Opt-in für E-Mail-Marketing: einschalten („Kunden müssen ihr Abonnement bestätigen“).
- **AGB fehlen:** Das Konto-Fenster verlinkt die AGB unter `/policies/terms-of-service`. Heute ist das eine 404-Seite, ebenso das Impressum (`/policies/legal-notice`) und das Widerrufsrecht (`/policies/refund-policy`). Einstellungen › Richtlinien. Siehe `docs/freigaben.md`.
- **Datenschutzerklärung:** Sie wird unter der Anmeldung verlinkt. Darin sollten Shopify als Anbieter der Kundenkonten genannt sein und Google, sobald die Google-Anmeldung aktiv ist. Bitte von jemandem mit rechtlichem Wissen prüfen lassen.

## Theme-Einstellung

Im Theme-Editor unter Header › „Menü im Konto-Fenster“ steht das Menü mit den Links im Fenster. Voreingestellt ist `customer-account-main-menu` (Bestellungen, Profil); es lässt sich unter Inhalte › Menüs bearbeiten.
