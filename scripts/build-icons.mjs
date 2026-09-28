// Baut assets/js/icons.js aus den Lucide-SVGs in assets/icons/.
// Die Icons landen als <symbol> in einem Inline-Sprite, damit sie auch per file:// funktionieren
// und per CSS (currentColor, stroke-width) gefärbt werden können.
// Aufruf: node scripts/build-icons.mjs
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(root, 'assets/icons');

const symbols = readdirSync(dir)
  .filter((f) => f.endsWith('.svg'))
  .sort()
  .map((f) => {
    const name = f.replace(/\.svg$/, '');
    const svg = readFileSync(join(dir, f), 'utf8');
    const inner = svg
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/^[\s\S]*?<svg[^>]*>/, '')
      .replace(/<\/svg>\s*$/, '')
      .replace(/\s*\n\s*/g, '')
      .trim();
    return `<symbol id="i-${name}" viewBox="0 0 24 24">${inner}</symbol>`;
  });

const js = `/* Automatisch erzeugt von scripts/build-icons.mjs – nicht von Hand bearbeiten.
   Icons: Lucide (ISC-Lizenz, siehe assets/icons/LICENSE-lucide.txt) */
(function () {
  var sprite = ${JSON.stringify(`<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="position:absolute;width:0;height:0;overflow:hidden">${symbols.join('')}</svg>`)};
  window.PS = window.PS || {};
  PS.icon = function (name, cls) {
    return '<svg class="icon' + (cls ? ' ' + cls : '') + '" aria-hidden="true" focusable="false"><use href="#i-' + name + '"></use></svg>';
  };
  // Skripte werden mit defer geladen, der Body existiert also bereits.
  document.body.insertAdjacentHTML('afterbegin', sprite);
})();
`;

writeFileSync(join(root, 'assets/js/icons.js'), js);
console.log(`icons.js: ${symbols.length} Icons`);
