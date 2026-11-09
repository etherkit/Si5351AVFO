import test from 'node:test';
import assert from 'node:assert/strict';
import { parseStatus, parseMemoryList, parseVersion, parseError } from '../status.js';

const STATUS = 'F=7074000 BAND=40M STEP=1000 MODE=DIR EN=1 OUT=7074000,OFF,OFF IF=9000000 INJ=HI IQ=0 LIMIT=WIDE DRIVE=8,8,8 FOVR=0 CAL=0 FLAGS=0 SI5351=OK';

test('parse a full STATUS line', () => {
  const state = parseStatus(STATUS);
  assert.equal(state.freq, 7074000);
  assert.equal(state.band, '40M');
  assert.equal(state.step, 1000);
  assert.equal(state.mode, 'DIR');
  assert.equal(state.ifFrequency, 9000000);
  assert.equal(state.injection, 'HI');
  assert.equal(state.iqOrder, 0);
  assert.equal(state.limit, 'WIDE');
  assert.equal(state.calibration, 0);
  assert.equal(state.si5351Ok, true);
});

test('parse BAND=--', () => {
  const state = parseStatus('F=1000000 BAND=-- STEP=1000 MODE=DIR EN=0 OUT=OFF,OFF,OFF IF=0 INJ=HI IQ=0 LIMIT=HAM DRIVE=8,8,8 FOVR=0 CAL=0 FLAGS=0 SI5351=OK');
  assert.equal(state.band, null);
});

test('parse binary enable bits', () => {
  const state = parseStatus('F=1000000 BAND=-- STEP=1000 MODE=DIR EN=101 OUT=OFF,OFF,OFF IF=0 INJ=HI IQ=0 LIMIT=HAM DRIVE=8,8,8 FOVR=10 CAL=0 FLAGS=0 SI5351=OK');
  assert.deepEqual(state.clockEnabled, [true, false, true]);
  assert.deepEqual(state.filterOverride, [false, true, false]);
});

test('parse OUT with OFF', () => {
  const state = parseStatus('F=1000000 BAND=-- STEP=1000 MODE=DIR EN=1 OUT=7074000,OFF,OFF IF=0 INJ=HI IQ=0 LIMIT=HAM DRIVE=8,8,8 FOVR=0 CAL=0 FLAGS=0 SI5351=OK');
  assert.deepEqual(state.outputs, [7074000, null, null]);
});

test('parse drive values', () => {
  const state = parseStatus('F=1000000 BAND=-- STEP=1000 MODE=DIR EN=1 OUT=7074000,OFF,OFF IF=0 INJ=HI IQ=0 LIMIT=HAM DRIVE=2,4,6 FOVR=0 CAL=0 FLAGS=0 SI5351=OK');
  assert.deepEqual(state.drive, [2, 4, 6]);
});

test('parse plan flags', () => {
  const state = parseStatus('F=1000000 BAND=-- STEP=1000 MODE=DIR EN=1 OUT=7074000,OFF,OFF IF=0 INJ=HI IQ=0 LIMIT=HAM DRIVE=8,8,8 FOVR=0 CAL=0 FLAGS=3 SI5351=OK');
  assert.equal(state.flags, 3);
});

test('parse a 10-line memory list', () => {
  const lines = [
    'M0 7074000 DIR 40M',
    'M1 14074000 SH 20M',
    'M2 --',
    'M3 --',
    'M4 --',
    'M5 --',
    'M6 --',
    'M7 --',
    'M8 --',
    'M9 --'
  ];
  const memories = parseMemoryList(lines);
  assert.equal(memories.length, 10);
  assert.deepEqual(memories[0], { channel: 0, empty: false, freq: 7074000, mode: 'DIR', band: '40M' });
  assert.deepEqual(memories[1], { channel: 1, empty: false, freq: 14074000, mode: 'SH', band: '20M' });
  assert.deepEqual(memories[2], { channel: 2, empty: true });
});

test('parse a version line and an error line', () => {
  assert.deepEqual(parseVersion('SI5351A VFO 0.1.0'), { product: 'SI5351A VFO', version: '0.1.0' });
  assert.match(parseError('ERR IQRANGE'), /4\.761905 MHz/);
});
