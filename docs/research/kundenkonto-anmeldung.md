# Kundenkonto-Anmeldung – Recherche

Stand 26.10.2026. Store powershop-online.myshopify.com (Basic-Tarif).

## Findings

### Store (per Admin-API abgefragt)
- `shop.customerAccountsV2`: `NEW_CUSTOMER_ACCOUNTS`, Anmelde-Links sichtbar, Anmeldung im Checkout nicht Pflicht, Konto-URL `https://shopify.com/101712200024/account`.
- 0 Kunden. Nur die Domain powershop-online.myshopify.com.
- Menü `customer-account-main-menu` („Hauptmenü Kundenkonto“: Bestellungen, Profil) existiert.
- Richtlinien: nur `/policies/privacy-policy` (200). `terms-of-service`, `legal-notice` und `refund-policy` liefern 404 (offen in `docs/freigaben.md`).
- Themes: `powershop-onlineshop/main` (live, GitHub `main`), „Horizon“ (unveröffentlicht, ID 199114359128), zwei Entwicklungs-Themes.

### Shopify-Vorgaben
- Die alten Kundenkonten sind seit dem 26.02.2026 abgekündigt. Themes sollen keine `customers/*.liquid` mehr enthalten, Anmelde- und Kontoseiten hostet Shopify. https://shopify.dev/changelog/posts/legacy-customer-accounts-are-deprecated
- `<shopify-account>`: Avatar im Header, das Fenster öffnet sich auf der Shop-Seite, gestaltbar über CSS-Variablen, den Part `signed-out-avatar` und den Slot `signed-out-avatar`. „Shopify controls this component … basic styling“. https://shopify.dev/docs/storefronts/themes/customer-engagement/account-component , https://shopify.dev/docs/api/storefront-web-components/components/shopify-account
- Muster aus Horizon (`snippets/header-actions.liquid`): kein eigenes Skript, Variablen aus Theme-Tokens, `:not(:defined)` 44×44, Platzhalter-Kreis bei `customer`. https://github.com/Shopify/horizon
- Branding von Anmeldung, Konto und Checkout im Editor „Checkout und Konten“. Seit Mai 2026 ist auch die Anmeldeseite einstellbar. Basic: Logo, Farben, Schriften, Hintergrund. Die API (`checkoutAndAccountsConfigurationUpdate`) gibt es nur mit Plus. https://shopify.dev/docs/apps/build/customer-accounts , https://shopify.dev/docs/apps/build/checkout/styling/checkout-and-accounts-configuration , https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility
- Barlow Condensed und Inter sind in Shopifys Schriftenbibliothek (`barlow_condensed_*`, `inter_*`). https://shopify.dev/docs/storefronts/themes/architecture/settings/fonts
- Google-Anmeldung: Einstellungen › Kundenkonten › Verwalten › Google › Verbinden, mit eigenem Google-Cloud-OAuth-Client (Typ Web; Ursprung und Weiterleitungs-URI kommen von Shopify), danach die App veröffentlichen. https://help.shopify.com/en/manual/customers/customer-accounts/sign-in-options/social-sign-in/google
- Apple-Anmeldung: noch nicht verfügbar. Shopify-Mitarbeiter am 24.09.2026: „no public release timeline“. https://community.shopify.dev/t/missing-apple-sign-in-in-it-is-required-when-also-using-facebook-or-google-login/32454
- „Sign in with Shop“ lässt sich unter Einstellungen › Kundenkonten ausschalten. https://help.shopify.com/manual/customers/customer-accounts

### Schritt 0: Horizon-Vorschau im eigenen Store (Playwright, Chrome, 3440×1440 und 390×844)
- Shopify fügt über `content_for_header` selbst `https://cdn.shopify.com/storefront/web-components/account.js` (type=module, async, fetchpriority=low) und `#shopify-customer-account-data` mit deutschen Texten ein, sobald das Element auf der Seite steht. Auf unserer Live-Seite fehlt das heute.
- Geladen werden `account.js` (31 KB) und danach `account-dialog` (28 KB), `store` (25 KB) und `observe-logger` (9 KB), gemessen als entpackte Grösse. Dazu kommen die Module für die Shop-Anmeldung, solange „Mit Shop“ aktiv ist.
- Der Knopf heisst im Accessibility-Baum von sich aus „Konto“, ein eigenes Label ist nicht nötig.
- Das Fenster ist ein modaler `<dialog>` (Part `dialog`), Überschrift „Anmelden oder Konto erstellen“, „Menü schließen“, „Mit Shop anmelden“, „ODER“, das Formular „Mit E-Mail-Adresse anmelden“ und Schnelllinks zu Bestellungen und Profil (shopify.com/…/account/orders|profile).
- Am Desktop sitzt das Fenster rechts mit 360 px Breite unter dem Header. Mobil ist es ein Blatt vom unteren Rand, 390 px breit.
- Beim Öffnen springt der Fokus auf „Menü schließen“, Esc schliesst. `html` und `body` bekommen `overflow: hidden`.
- **E-Mail-Anmeldung wechselt die Seite:** Das Absenden lädt das Dokument `/customer_authentication/login?return_to=%2F&login_hint=…&login_hint_mode=submit`, also die von Shopify gehostete Seite für den Code. Getestet wurde mit `pruefung@example.invalid`, alle Anfragen abgebrochen, nichts kam bei Shopify an. Die Code-Seite muss deshalb über den Editor gestaltet werden.
- Im Fenster stehen Links zu `/policies/terms-of-service` (heute 404) und `/policies/privacy-policy`.
- Das Shopify-Cookie-Banner ist aktiv.

## Key Data

| Was | Wert |
|---|---|
| Komponenten-Skript | `https://cdn.shopify.com/storefront/web-components/account.js` (von Shopify eingefügt) |
| Menü-Handle | `customer-account-main-menu` |
| Anmelde-Weiterleitung | `/customer_authentication/login` |
| Horizon-Theme-ID | 199114359128 |
| Variablen (Auszug) | `--shopify-account-color-accent`, `-accent-text`, `-accent-hover`, `-background`, `-background-subdued`, `-border`, `-card-background`, `-card-text`, `-control-background`, `-control-text`, `-text`, `-text-subdued`, `-shadow`, `--shopify-account-font-body`, `-font-heading` (+ `-weight`, `-transform`), `--shopify-account-radius-base`, `-radius-button`, `-radius-button-small`, `-radius-dialog`, `-radius-input`, `--shopify-account-dialog-position-top`, `--shopify-account-avatar-size`, `--shopify-account-signed-in-avatar-*` |

## UNVERIFIED Items
- UNVERIFIED: welche Einzelfelder der Editor im Basic-Tarif für die Anmeldeseite zeigt (nicht vollständig dokumentiert, Admin nicht einsehbar).
- UNVERIFIED: ob Apple bei Freigabe an derselben Stelle wie Google erscheint.
- UNVERIFIED: genauer Name des Schalters für das Double-Opt-in im deutschen Admin.

## UNKNOWNS
- Ob das Abschalten von „Sign in with Shop“ auch die Shop-Erkennung im Konto-Fenster entfernt. Wird nach der Umstellung durch den Nutzer geprüft.

CONFIDENCE: 8/10
