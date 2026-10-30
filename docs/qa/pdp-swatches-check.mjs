import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const html = path.join(__dirname, 'pdp-swatches-overflow.html');
const outDir = path.join(__dirname, 'screenshots');
fs.mkdirSync(outDir, { recursive: true });

const widths = [
  { w: 360, label: '360' },
  { w: 390, label: '390' },
  { w: 768, label: '768' },
  { w: 1440, label: '1440' },
];

function fileUrl(broken) {
  const q = broken ? '?broken=1' : '';
  return 'file://' + html + q;
}

async function measure(page) {
  return page.evaluate(() => ({
    docScrollW: document.documentElement.scrollWidth,
    docClientW: document.documentElement.clientWidth,
    bodyScrollW: document.body.scrollWidth,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    swatchRow: (() => {
      const el = document.querySelector('.swatches');
      const r = el.getBoundingClientRect();
      return { width: r.width, right: r.right, lines: Math.round(r.height / 48) };
    })(),
  }));
}

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || '/usr/local/bin/google-chrome',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
const context = await browser.newContext({ deviceScaleFactor: 2 });

for (const mode of [{ broken: true, tag: 'before' }, { broken: false, tag: 'after' }]) {
  for (const { w, label } of widths) {
    const page = await context.newPage();
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto(fileUrl(mode.broken), { waitUntil: 'networkidle' });
    const metrics = await measure(page);
    const shot = path.join(outDir, `pdp-swatches-${mode.tag}-${label}.png`);
    await page.screenshot({ path: shot, fullPage: true });
    console.log(JSON.stringify({ mode: mode.tag, width: w, metrics, shot }));
    await page.close();
  }
}

await browser.close();
