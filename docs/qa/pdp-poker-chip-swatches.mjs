import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const html = path.join(__dirname, 'pdp-swatches-poker-chip.html');
const outDir = path.join(__dirname, 'screenshots');
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || '/usr/local/bin/google-chrome',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
const context = await browser.newContext({ deviceScaleFactor: 2 });

for (const mode of [{ images: false, tag: 'gray' }, { images: true, tag: 'variant-images' }]) {
  for (const { w, label } of [{ w: 390, label: '390' }, { w: 1440, label: '1440' }]) {
    const page = await context.newPage();
    await page.setViewportSize({ width: w, height: 900 });
    const q = mode.images ? '?images=1' : '';
    await page.goto('file://' + html + q, { waitUntil: 'networkidle' });
    if (mode.images) {
      await page.waitForFunction(() => {
        var s = document.querySelector('.swatch');
        if (!s) return false;
        var bg = getComputedStyle(s).backgroundImage;
        return bg && bg !== 'none';
      }, { timeout: 15000 });
    }
    const metrics = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      firstBg: getComputedStyle(document.querySelector('.swatch')).backgroundImage.slice(0, 40),
    }));
    const shot = path.join(outDir, `pdp-poker-chip-${mode.tag}-${label}.png`);
    await page.screenshot({ path: shot, fullPage: false });
    console.log(JSON.stringify({ mode: mode.tag, width: w, metrics, shot }));
    await page.close();
  }
}

await browser.close();
