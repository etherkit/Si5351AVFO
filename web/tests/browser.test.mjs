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
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
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
  return { context, page, errors };
}

test('shows the unsupported-browser message when navigator.serial is absent', async () => {
  const { context, page, errors } = await newPage({ noSerial: true });
  try {
    await page.waitForFunction(() => !document.querySelector('#unsupported').hidden);
    assert.equal(await page.locator('#unsupported').isVisible(), true);
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
});

test('connects and displays firmware version', async () => {
  const { context, page, errors } = await newPage();
  try {
    await page.click('#connect');
    await page.waitForFunction(() => document.querySelector('#firmware-version').textContent.includes('0.1.0'));
    assert.match(await page.locator('#firmware-version').textContent(), /SI5351A VFO 0\.1\.0/);
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
});

test('renders status fields', async () => {
  const { context, page, errors } = await newPage();
  try {
    await page.click('#connect');
    await page.waitForFunction(() => document.querySelector('#status-freq').textContent === '7074000');
    assert.equal(await page.locator('#status-band').textContent(), '40M');
    assert.equal(await page.locator('#status-mode').textContent(), 'DIR');
    assert.equal(await page.locator('#status-si5351').textContent(), 'OK');
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
});

test('sends F 14074000 when the frequency field changes', async () => {
  const { context, page, errors } = await newPage();
  try {
    await page.click('#connect');
    await page.waitForFunction(() => document.querySelector('#firmware-version').textContent.includes('0.1.0'));
    await page.locator('#frequency').evaluate((element) => {
      element.value = '14074000';
      element.dispatchEvent(new Event('change'));
    });
    await page.waitForFunction(() => window.__mockSerial.port.writes.includes('F 14074000'));
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
});

test('sends BAND 20M when the band selector changes', async () => {
  const { context, page, errors } = await newPage();
  try {
    await page.click('#connect');
    await page.waitForFunction(() => document.querySelector('#firmware-version').textContent.includes('0.1.0'));
    await page.selectOption('#band', '20M');
    await page.waitForFunction(() => window.__mockSerial.port.writes.includes('BAND 20M'));
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
});

test('sends MODE IQ when the mode selector changes', async () => {
  const { context, page, errors } = await newPage();
  try {
    await page.click('#connect');
    await page.waitForFunction(() => document.querySelector('#firmware-version').textContent.includes('0.1.0'));
    await page.selectOption('#mode', 'IQ');
    await page.waitForFunction(() => window.__mockSerial.port.writes.includes('MODE IQ'));
    assert.equal(await page.locator('#if').isDisabled(), true);
    assert.equal(await page.locator('#injection').isDisabled(), true);
    assert.equal(await page.locator('#iq-order').isDisabled(), false);
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
});

test('sends ON CLK1 when a clock checkbox changes', async () => {
  const { context, page, errors } = await newPage();
  try {
    await page.click('#connect');
    await page.waitForFunction(() => document.querySelector('#firmware-version').textContent.includes('0.1.0'));
    await page.check('#clock-enable-1');
    await page.waitForFunction(() => window.__mockSerial.port.writes.includes('ON CLK1'));
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
});

test('sends DRIVE CLK0 8 when a drive selector changes', async () => {
  const { context, page, errors } = await newPage();
  try {
    await page.click('#connect');
    await page.waitForFunction(() => document.querySelector('#firmware-version').textContent.includes('0.1.0'));
    await page.selectOption('#drive-0', '8');
    await page.waitForFunction(() => window.__mockSerial.port.writes.includes('DRIVE CLK0 8'));
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
});

test('renders 10 memory channels', async () => {
  const { context, page, errors } = await newPage();
  try {
    await page.click('#connect');
    await page.waitForFunction(() => document.querySelectorAll('#memory-list .memory-row').length === 10);
    await page.waitForFunction(() => document.querySelector('#memory-value-0').textContent === '7074000 DIR 40M');
    assert.equal(await page.locator('#memory-value-1').textContent(), '—');
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
});

test('sends an arbitrary console command and displays its reply', async () => {
  const { context, page, errors } = await newPage();
  try {
    await page.click('#connect');
    await page.waitForFunction(() => document.querySelector('#firmware-version').textContent.includes('0.1.0'));
    await page.fill('#console-input', 'STATUS');
    await page.click('#console-form button');
    await page.waitForFunction(() => document.querySelector('#console-log').textContent.includes('STATUS'));
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
});

test('step buttons change the tuned frequency', async () => {
  const { context, page, errors } = await newPage();
  try {
    await page.click('#connect');
    await page.waitForFunction(() => document.querySelector('#firmware-version').textContent.includes('0.1.0'));
    await page.waitForFunction(() => document.querySelector('#status-freq').textContent === '7074000');
    await page.click('#step-up');
    await page.waitForFunction(() => document.querySelector('#status-freq').textContent === '7075000');
    assert.equal(await page.evaluate(() => window.__mockSerial.port.writes.includes('F 7075000')), true);
    await page.click('#step-down');
    await page.waitForFunction(() => document.querySelector('#status-freq').textContent === '7074000');
    assert.equal(await page.evaluate(() => window.__mockSerial.port.writes.includes('F 7074000')), true);
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
});

test('tuning knob steps with arrow keys', async () => {
  const { context, page, errors } = await newPage();
  try {
    await page.click('#connect');
    await page.waitForFunction(() => document.querySelector('#firmware-version').textContent.includes('0.1.0'));
    await page.waitForFunction(() => document.querySelector('#status-freq').textContent === '7074000');
    await page.locator('#tuning-knob').focus();
    await page.keyboard.press('ArrowUp');
    await page.waitForFunction(() => document.querySelector('#status-freq').textContent === '7075000');
    await page.keyboard.press('ArrowDown');
    await page.waitForFunction(() => document.querySelector('#status-freq').textContent === '7074000');
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
});

test('disconnects and reconnects cleanly', async () => {
  const { context, page, errors } = await newPage();
  try {
    await page.click('#connect');
    await page.waitForFunction(() => document.querySelector('#firmware-version').textContent.includes('0.1.0'));
    await page.click('#disconnect');
    await page.waitForFunction(() => document.querySelector('#disconnect').hidden);
    await page.click('#connect');
    await page.waitForFunction(() => document.querySelector('#firmware-version').textContent.includes('0.1.0'));
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
});

test('disconnects when the serial stream ends', async () => {
  const { context, page, errors } = await newPage();
  try {
    await page.click('#connect');
    await page.waitForFunction(() => document.querySelector('#firmware-version').textContent.includes('0.1.0'));
    await page.evaluate(() => window.__mockSerial.port.closeReadable());
    await page.waitForFunction(() => document.querySelector('#disconnect').hidden);
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
});

test('does not leave a poll after disconnect during startup', async () => {
  const { context, page, errors } = await newPage();
  try {
    await page.click('#connect');
    await page.waitForTimeout(100);
    await page.click('#disconnect');
    await page.waitForTimeout(900);
    const poll = await page.evaluate(() => window.__app.poll);
    assert.equal(poll, null);
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
});

test('does not overwrite a focused frequency field during polling', async () => {
  const { context, page, errors } = await newPage();
  try {
    await page.click('#connect');
    await page.waitForFunction(() => document.querySelector('#firmware-version').textContent.includes('0.1.0'));
    await page.locator('#frequency').focus();
    await page.locator('#frequency').fill('14074000');
    await page.waitForTimeout(300);
    assert.equal(await page.locator('#frequency').inputValue(), '14074000');
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
});

test('displays output and plan-flag warnings from STATUS', async () => {
  const { context, page, errors } = await newPage();
  try {
    await page.click('#connect');
    await page.waitForFunction(() => document.querySelector('#firmware-version').textContent.includes('0.1.0'));
    await page.evaluate(() => {
      window.__mockSerial.port.setStatus('F=7074000 BAND=40M STEP=1000 MODE=IQ EN=1 OUT=OFF,OFF,7074000 IF=9000000 INJ=HI IQ=0 LIMIT=WIDE DRIVE=8,8,8 FOVR=0 CAL=0 FLAGS=9 SI5351=OK');
    });
    await page.fill('#console-input', 'STATUS');
    await page.click('#console-form button');
    await page.waitForFunction(() => document.querySelector('#status-outputs').textContent === 'OFF, OFF, 7074000');
    await page.waitForFunction(() => document.querySelector('#status-flags').textContent.includes('IQ low'));
    await page.waitForFunction(() => document.querySelector('#status-flags').textContent.includes('IQ high'));
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
});

test('requires confirmation before factory reset', async () => {
  const { context, page, errors } = await newPage();
  try {
    await page.click('#connect');
    await page.waitForFunction(() => document.querySelector('#firmware-version').textContent.includes('0.1.0'));
    let acceptDialog = false;
    page.on('dialog', (dialog) => {
      if (acceptDialog) dialog.accept(); else dialog.dismiss();
    });
    await page.click('#factory-reset');
    await page.waitForTimeout(200);
    assert.equal(await page.evaluate(() => window.__mockSerial.port.writes.includes('RESET ALL')), false);
    acceptDialog = true;
    await page.click('#factory-reset');
    await page.waitForFunction(() => window.__mockSerial.port.writes.includes('RESET ALL'));
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
});

test('exposes accessible labels', async () => {
  const { context, page, errors } = await newPage();
  try {
    await page.click('#connect');
    await page.waitForFunction(() => document.querySelector('#firmware-version').textContent.includes('0.1.0'));
    assert.equal(await page.locator('#clock-enable-0').getAttribute('aria-label'), 'CLK0 enable');
    assert.equal(await page.locator('#drive-0').getAttribute('aria-label'), 'CLK0 drive');
    assert.equal(await page.locator('#memory-list button[aria-label="Store M0"]').count(), 1);
    assert.equal(await page.locator('#console-input').getAttribute('aria-label'), 'Console command');
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
});

test('does not overflow at 320px', async () => {
  const { context, page, errors } = await newPage();
  try {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.click('#connect');
    await page.waitForFunction(() => document.querySelector('#firmware-version').textContent.includes('0.1.0'));
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert.ok(overflow <= 0, `horizontal overflow: ${overflow}`);
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
});

test('rejects invalid numeric input', async () => {
  const { context, page, errors } = await newPage();
  try {
    await page.click('#connect');
    await page.waitForFunction(() => document.querySelector('#firmware-version').textContent.includes('0.1.0'));
    await page.locator('#frequency').evaluate((element) => {
      element.value = '';
      element.dispatchEvent(new Event('change'));
    });
    await page.waitForTimeout(100);
    assert.equal(await page.evaluate(() => window.__mockSerial.port.writes.includes('F 0')), false);
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
});

test('disables mode-dependent controls correctly', async () => {
  const { context, page, errors } = await newPage();
  try {
    await page.click('#connect');
    await page.waitForFunction(() => document.querySelector('#firmware-version').textContent.includes('0.1.0'));
    await page.selectOption('#mode', 'IQ');
    assert.equal(await page.locator('#if').isDisabled(), true);
    assert.equal(await page.locator('#injection').isDisabled(), true);
    assert.equal(await page.locator('#iq-order').isDisabled(), false);
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
});

test('displays a friendly error for an unknown command', async () => {
  const { context, page, errors } = await newPage();
  try {
    await page.click('#connect');
    await page.waitForFunction(() => document.querySelector('#firmware-version').textContent.includes('0.1.0'));
    await page.fill('#console-input', 'NOPE');
    await page.click('#console-form button');
    await page.waitForFunction(() => document.querySelector('#console-log').textContent.includes('Unknown command'));
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
});
