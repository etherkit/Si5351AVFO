import test from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { installMockSerial } from './mock-serial.mjs';
import { startServer, stopServer } from './server.mjs';

let browser;
let server;
let baseUrl;

test.before(async () => {
  server = await startServer();
  baseUrl = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH || undefined
  });
});

test.after(async () => {
  if (browser) {
    await browser.close();
  }
  if (server) {
    await stopServer(server);
  }
});

async function newPage({ mock = true, noSerial = false } = {}) {
  const context = await browser.newContext();
  const page = await context.newPage();
  if (noSerial) {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'serial', {
        value: undefined,
        configurable: true
      });
    });
  } else if (mock) {
    await page.addInitScript(installMockSerial);
  }
  await page.goto(`${baseUrl}/`);
  return { context, page };
}

test('shows the unsupported-browser message when navigator.serial is absent', async () => {
  const { context, page } = await newPage({ noSerial: true });
  try {
    await page.waitForFunction(() => !document.querySelector('#unsupported').hidden);
    assert.equal(await page.locator('#unsupported').isVisible(), true);
  } finally {
    await context.close();
  }
});

test('connects and displays firmware version', async () => {
  const { context, page } = await newPage();
  try {
    await page.click('#connect');
    await page.waitForFunction(() => document.querySelector('#firmware-version').textContent.includes('0.1.0'));
    assert.match(await page.locator('#firmware-version').textContent(), /SI5351A VFO 0\.1\.0/);
  } finally {
    await context.close();
  }
});

test('renders status fields', async () => {
  const { context, page } = await newPage();
  try {
    await page.click('#connect');
    await page.waitForFunction(() => document.querySelector('#status-freq').textContent === '7074000');
    assert.equal(await page.locator('#status-band').textContent(), '40M');
    assert.equal(await page.locator('#status-mode').textContent(), 'DIR');
    assert.equal(await page.locator('#status-si5351').textContent(), 'OK');
  } finally {
    await context.close();
  }
});

test('sends F 14074000 when the frequency field changes', async () => {
  const { context, page } = await newPage();
  try {
    await page.click('#connect');
    await page.waitForFunction(() => document.querySelector('#firmware-version').textContent.includes('0.1.0'));
    await page.locator('#frequency').evaluate((element) => {
      element.value = '14074000';
      element.dispatchEvent(new Event('change'));
    });
    await page.waitForFunction(() => window.__mockSerial.port.writes.includes('F 14074000'));
  } finally {
    await context.close();
  }
});

test('sends BAND 20M when the band selector changes', async () => {
  const { context, page } = await newPage();
  try {
    await page.click('#connect');
    await page.waitForFunction(() => document.querySelector('#firmware-version').textContent.includes('0.1.0'));
    await page.selectOption('#band', '20M');
    await page.waitForFunction(() => window.__mockSerial.port.writes.includes('BAND 20M'));
  } finally {
    await context.close();
  }
});

test('sends MODE IQ when the mode selector changes', async () => {
  const { context, page } = await newPage();
  try {
    await page.click('#connect');
    await page.waitForFunction(() => document.querySelector('#firmware-version').textContent.includes('0.1.0'));
    await page.selectOption('#mode', 'IQ');
    await page.waitForFunction(() => window.__mockSerial.port.writes.includes('MODE IQ'));
  } finally {
    await context.close();
  }
});

test('sends ON CLK1 when a clock checkbox changes', async () => {
  const { context, page } = await newPage();
  try {
    await page.click('#connect');
    await page.waitForFunction(() => document.querySelector('#firmware-version').textContent.includes('0.1.0'));
    await page.check('#clock-enable-1');
    await page.waitForFunction(() => window.__mockSerial.port.writes.includes('ON CLK1'));
  } finally {
    await context.close();
  }
});

test('sends DRIVE CLK0 8 when a drive selector changes', async () => {
  const { context, page } = await newPage();
  try {
    await page.click('#connect');
    await page.waitForFunction(() => document.querySelector('#firmware-version').textContent.includes('0.1.0'));
    await page.selectOption('#drive-0', '8');
    await page.waitForFunction(() => window.__mockSerial.port.writes.includes('DRIVE CLK0 8'));
  } finally {
    await context.close();
  }
});

test('renders 10 memory channels', async () => {
  const { context, page } = await newPage();
  try {
    await page.click('#connect');
    await page.waitForFunction(() => document.querySelectorAll('#memory-list .memory-row').length === 10);
    await page.waitForFunction(() => document.querySelector('#memory-value-0').textContent === '7074000 DIR 40M');
    assert.equal(await page.locator('#memory-value-1').textContent(), '—');
  } finally {
    await context.close();
  }
});

test('sends an arbitrary console command and displays its reply', async () => {
  const { context, page } = await newPage();
  try {
    await page.click('#connect');
    await page.waitForFunction(() => document.querySelector('#firmware-version').textContent.includes('0.1.0'));
    await page.fill('#console-input', 'STATUS');
    await page.click('#console-form button');
    await page.waitForFunction(() => document.querySelector('#console-log').textContent.includes('STATUS'));
  } finally {
    await context.close();
  }
});
