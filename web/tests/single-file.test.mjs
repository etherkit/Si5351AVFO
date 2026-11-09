import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'single-file.html'), 'utf8');

test('single-file build inlines CSS and JS', () => {
  assert.ok(html.includes('<style>'), 'missing inline <style>');
  assert.ok(html.includes('<script>'), 'missing inline <script>');
  assert.ok(!html.includes('<script type="module" src="app.js">'), 'module script tag still present');
  assert.ok(!html.includes('<link rel="stylesheet" href="styles.css">'), 'stylesheet link still present');
});

test('single-file build excludes mock serial code', () => {
  assert.ok(!html.includes('__mockSerial'), 'mock serial global still present');
  assert.ok(!html.includes('MockSerialPort'), 'mock serial class still present');
});
