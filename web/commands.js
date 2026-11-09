export const COMMAND_LIMIT = 32;

const ERROR_MESSAGES = {
  IQRANGE: 'Quadrature output is only supported from 4.761905 MHz to 90 MHz.',
  EMPTY: 'That memory channel is empty.',
  ARG: 'The device rejected the argument.',
  STEP: 'Supported steps are 100k, 10k, 1k, 500, 100, and 10 Hz.',
  BAND: 'Unknown band name.',
  LONG: 'Command line is longer than 32 characters.',
  NOTIMPL: 'The firmware has not implemented this yet.',
  CMD: 'Unknown command.'
};

function line(parts) {
  const cmd = parts.map(String).join(' ').trim().toUpperCase();
  if (cmd.length > COMMAND_LIMIT) {
    throw new Error(`Command too long: ${cmd}`);
  }
  return cmd;
}

export function frequency(hz) {
  return line(['F', hz]);
}

export function step(hz) {
  return line(['STEP', hz]);
}

export function band(name) {
  return line(['BAND', name]);
}

export function mode(name) {
  return line(['MODE', name]);
}

export function clockOn(clk) {
  return line(['ON', `CLK${clk}`]);
}

export function clockOff(clk) {
  return line(['OFF', `CLK${clk}`]);
}

export function drive(clk, milliamps) {
  return line(['DRIVE', `CLK${clk}`, milliamps]);
}

export function ifFrequency(hz) {
  return line(['IF', hz]);
}

export function injection(side) {
  return line(['INJ', side]);
}

export function iqOrder(order) {
  return line(['IQ', order]);
}

export function limit(mode) {
  return line(['LIMIT', mode]);
}

export function filterOverride(clk, enabled) {
  return line(['FOVR', `CLK${clk}`, enabled ? 1 : 0]);
}

export function memoryStore(channel) {
  return line(['MS', channel]);
}

export function memoryRecall(channel) {
  return line(['MR', channel]);
}

export function memoryClear(channel) {
  return line(['MC', channel]);
}

export function memoryList() {
  return 'M?';
}

export function calibration(ppb) {
  return line(['CAL', ppb]);
}

export function save() {
  return 'SAVE';
}

export function reset() {
  return 'RESET';
}

export function factoryReset() {
  return 'RESET ALL';
}

export function status() {
  return 'STATUS';
}

export function version() {
  return 'VER';
}

export function help() {
  return 'HELP';
}

export function commandError(reason) {
  return ERROR_MESSAGES[reason] || `Device error: ${reason}`;
}
