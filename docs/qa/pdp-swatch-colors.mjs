import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, 'screenshots');
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || '/usr/local/bin/google-chrome',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
const context = await browser.newContext({ deviceScaleFactor: 2 });

const pages = [
  { file: 'pdp-swatches-poker-chip.html', prefix: 'pdp-poker-chip-colors' },
  { file: 'pdp-swatches-bike-compare.html', prefix: 'pdp-bike-colors' },
];

for (const { file, prefix } of pages) {
  for (const w of [390, 1440]) {
    const page = await context.newPage();
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto('file://' + path.join(__dirname, file), { waitUntil: 'networkidle' });
    const metrics = await page.evaluate(() => {
      var sw = document.querySelectorAll('.swatch');
      var gray = 0;
      sw.forEach(function (el) {
        var bg = getComputedStyle(el).backgroundColor;
        if (bg === 'rgb(204, 204, 204)') gray++;
      });
      return {
        count: sw.length,
        gray,
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      };
    });
    const shot = path.join(outDir, `${prefix}-${w}.png`);
    await page.screenshot({ path: shot, fullPage: false });
    console.log(JSON.stringify({ prefix, width: w, metrics, shot }));
    await page.close();
  }
}

await browser.close();
