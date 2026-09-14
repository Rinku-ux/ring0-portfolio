const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const URLS = [
  { url: 'https://runloop-web.vercel.app/', name: 'runloop.jpg' }
];

async function capture() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  const outDir = path.join(__dirname, 'public', 'covers');
  
  for (const item of URLS) {
    console.log(`Navigating to ${item.url}...`);
    try {
      await page.goto(item.url, { waitUntil: 'domcontentloaded', timeout: 90000 });
      await page.waitForTimeout(5000); 
      const outPath = path.join(outDir, item.name);
      await page.screenshot({ path: outPath, type: 'jpeg', quality: 80, timeout: 0 });
      console.log(`Saved screenshot to ${outPath}`);
    } catch (e) {
      console.error(`Failed to capture ${item.url}:`, e);
    }
  }

  await browser.close();
}

capture();
