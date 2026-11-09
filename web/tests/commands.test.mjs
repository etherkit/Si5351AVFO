import test from 'node:test';
import assert from 'node:assert/strict';
import {
  COMMAND_LIMIT,
  frequency,
  step,
  band,
  mode,
  clockOn,
  clockOff,
  drive,
  ifFrequency,
  injection,
  iqOrder,
  limit,
  filterOverride,
  memoryStore,
  memoryRecall,
  memoryClear,
  memoryList,
  calibration,
  save,
  reset,
  factoryReset,
  status,
  version,
  help,
  commandError
} from '../commands.js';

test('frequency command', () => {
  assert.equal(frequency(7074000), 'F 7074000');
});

test('step command', () => {
  assert.equal(step(1000), 'STEP 1000');
});

test('band command', () => {
  assert.equal(band('40M'), 'BAND 40M');
});

test('mode command', () => {
  assert.equal(mode('SH'), 'MODE SH');
});

test('clockOn command', () => {
  assert.equal(clockOn(1), 'ON CLK1');
});

test('clockOff command', () => {
  assert.equal(clockOff(2), 'OFF CLK2');
});

test('drive command', () => {
  assert.equal(drive(0, 8), 'DRIVE CLK0 8');
});

test('ifFrequency command', () => {
  assert.equal(ifFrequency(9000000), 'IF 9000000');
});

test('injection command', () => {
  assert.equal(injection('HI'), 'INJ HI');
});

test('iqOrder command', () => {
  assert.equal(iqOrder(1), 'IQ 1');
});

test('limit command', () => {
  assert.equal(limit('HAM'), 'LIMIT HAM');
});

test('filterOverride command', () => {
  assert.equal(filterOverride(0, true), 'FOVR CLK0 1');
  assert.equal(filterOverride(2, false), 'FOVR CLK2 0');
});

test('memoryStore command', () => {
  assert.equal(memoryStore(3), 'MS 3');
});

test('memoryRecall command', () => {
  assert.equal(memoryRecall(3), 'MR 3');
});

test('memoryClear command', () => {
  assert.equal(memoryClear(3), 'MC 3');
});

test('memoryList command', () => {
  assert.equal(memoryList(), 'M?');
});

test('calibration command', () => {
  assert.equal(calibration(-25), 'CAL -25');
});

test('save command', () => {
  assert.equal(save(), 'SAVE');
});

test('reset command', () => {
  assert.equal(reset(), 'RESET');
});

test('factoryReset command', () => {
  assert.equal(factoryReset(), 'RESET ALL');
});

test('status command', () => {
  assert.equal(status(), 'STATUS');
});

test('version command', () => {
  assert.equal(version(), 'VER');
});

test('help command', () => {
  assert.equal(help(), 'HELP');
});

test('commandError maps IQRANGE', () => {
  assert.match(commandError('IQRANGE'), /4\.761905 MHz/);
});

test('commands are uppercased', () => {
  assert.equal(band('40m'), 'BAND 40M');
  assert.equal(mode('dir'), 'MODE DIR');
});

test('commands longer than 32 characters are rejected', () => {
  assert.throws(() => band('X'.repeat(COMMAND_LIMIT)), /too long/i);
});
