import { commandError } from './commands.js';

function parseBinaryMask(value, width = 3) {
  const mask = parseInt(value, 2);
  return Array.from({ length: width }, (_, i) => Boolean(mask & (1 << i)));
}

export function parseStatus(line) {
  const result = {
    freq: null,
    band: null,
    step: null,
    mode: null,
    clockEnabled: [false, false, false],
    outputs: [null, null, null],
    ifFrequency: null,
    injection: null,
    iqOrder: null,
    limit: null,
    drive: [null, null, null],
    filterOverride: [false, false, false],
    calibration: null,
    flags: 0,
    si5351Ok: false
  };

  for (const token of line.trim().split(/\s+/)) {
    const eq = token.indexOf('=');
    if (eq < 0) continue;
    const key = token.slice(0, eq);
    const value = token.slice(eq + 1);

    switch (key) {
      case 'F':
        result.freq = parseInt(value, 10);
        break;
      case 'BAND':
        result.band = value === '--' ? null : value;
        break;
      case 'STEP':
        result.step = parseInt(value, 10);
        break;
      case 'MODE':
        result.mode = value;
        break;
      case 'EN':
        result.clockEnabled = parseBinaryMask(value);
        break;
      case 'OUT':
        result.outputs = value.split(',').map((v) => (v === 'OFF' ? null : parseInt(v, 10)));
        break;
      case 'IF':
        result.ifFrequency = parseInt(value, 10);
        break;
      case 'INJ':
        result.injection = value;
        break;
      case 'IQ':
        result.iqOrder = parseInt(value, 10);
        break;
      case 'LIMIT':
        result.limit = value;
        break;
      case 'DRIVE':
        result.drive = value.split(',').map((v) => parseInt(v, 10));
        break;
      case 'FOVR':
        result.filterOverride = parseBinaryMask(value);
        break;
      case 'CAL':
        result.calibration = parseInt(value, 10);
        break;
      case 'FLAGS':
        result.flags = parseInt(value, 10);
        break;
      case 'SI5351':
        result.si5351Ok = value === 'OK';
        break;
      default:
        break;
    }
  }

  return result;
}

export function parseMemoryList(lines) {
  const list = typeof lines === 'string' ? lines.split(/\r?\n/) : lines;
  return list.slice(0, 10).map((raw, index) => {
    const text = raw.trim();
    const match = /^M(\d+)\s+(.+)$/.exec(text);
    if (!match) {
      return { channel: index, empty: true };
    }
    const channel = parseInt(match[1], 10);
    const rest = match[2].trim();
    if (rest === '--') {
      return { channel, empty: true };
    }
    const [freq, mode, band] = rest.split(/\s+/);
    return {
      channel,
      empty: false,
      freq: parseInt(freq, 10),
      mode,
      band
    };
  });
}

export function parseVersion(line) {
  const match = /^(.*?)\s+(\d+\.\d+\.\d+)$/.exec(line.trim());
  if (!match) {
    return { product: line.trim(), version: null };
  }
  return { product: match[1], version: match[2] };
}

export function parseError(line) {
  const text = line.trim();
  const match = /^ERR\s+([A-Z]+)/.exec(text);
  if (match) {
    return commandError(match[1]);
  }
  return text;
}

const PLAN_FLAGS = {
  0x01: 'IQ low: CLK0/CLK1 muted',
  0x02: 'LO out of range: CLK0 muted',
  0x04: 'LPF limit: clock muted',
  0x08: 'IQ high: CLK0/CLK1 muted',
  0x10: 'Si5351 refused a clock'
};

export function decodeFlags(flags) {
  return Object.entries(PLAN_FLAGS)
    .filter(([bit]) => flags & Number(bit))
    .map(([, message]) => message);
}
