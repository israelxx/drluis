import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const url = process.argv[2] || 'http://localhost:4001';
const label = process.argv[3] || '';
const width = parseInt(process.argv[4], 10) || 1440;

const CHROME_PATH = path.join(
  process.env.USERPROFILE || process.env.HOME,
  '.cache/puppeteer/chrome/win64-150.0.7871.24/chrome-win64/chrome.exe'
);

const outDir = path.join(__dirname, 'temporary screenshots');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const existing = fs.readdirSync(outDir).filter((f) => /^screenshot-(\d+)/.test(f));
const nextNum =
  existing.length === 0
    ? 1
    : Math.max(...existing.map((f) => parseInt(f.match(/^screenshot-(\d+)/)[1], 10))) + 1;

const fileName = `screenshot-${nextNum}${label ? '-' + label : ''}.png`;
const outPath = path.join(outDir, fileName);

const browser = await puppeteer.launch({
  executablePath: CHROME_PATH,
  headless: true,
});
const page = await browser.newPage();
await page.setViewport({ width, height: 900 });
await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

// Force any IntersectionObserver-based scroll-reveal elements to their
// final visible state instantly. Simulating a real scroll is unreliable —
// teleport-style scrollTo jumps can skip an element's viewport crossing
// entirely, leaving it permanently at opacity:0 in the capture.
await page.addStyleTag({
  content: `.reveal, .reveal-scale { transition-duration: 0s !important; transition-delay: 0s !important; }`,
});
await page.evaluate(() => {
  document.querySelectorAll('.reveal, .reveal-scale').forEach((el) => el.classList.add('in-view'));
});
await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));

// Give embedded iframes (e.g. maps) a moment to finish painting tiles.
await new Promise((r) => setTimeout(r, 1500));

// fullPage screenshots resize the viewport to the full document height right
// before capturing, which triggers native loading="lazy" images — but doesn't
// wait for them to actually finish loading. Force-load and wait so the
// capture reflects the fully-loaded page, not a mid-fetch frame.
await page.evaluate(async () => {
  const imgs = Array.from(document.images);
  imgs.forEach((img) => { img.loading = 'eager'; });
  await Promise.all(
    imgs.map((img) =>
      img.complete ? Promise.resolve() : new Promise((res) => { img.onload = img.onerror = res; })
    )
  );
});

await page.screenshot({ path: outPath, fullPage: true });
await browser.close();

console.log(`Screenshot salvo em: ${path.relative(__dirname, outPath)}`);
