import test from 'node:test';
import assert from 'node:assert/strict';
import { LineDecoder, SerialConnection, browserSupportsWebSerial } from '../serial.js';

function makeMockPort() {
  const writes = [];
  let openOptions = null;
  const port = {
    writes,
    async open(options) {
      openOptions = options;
    },
    async close() {},
    getInfo() {
      return { usbVendorId: 0x10c4, usbProductId: 0xea60 };
    },
    readable: new ReadableStream(),
    writable: new WritableStream({
      write(chunk) {
        writes.push(new TextDecoder().decode(chunk));
      }
    })
  };
  port.openOptions = () => openOptions;
  return port;
}

test('browserSupportsWebSerial is false without navigator.serial', () => {
  assert.equal(browserSupportsWebSerial(), false);
});

test('LineDecoder splits CRLF', () => {
  const decoder = new LineDecoder();
  assert.deepEqual(decoder.feed('OK\r\n'), ['OK']);
});

test('LineDecoder buffers partial lines', () => {
  const decoder = new LineDecoder();
  assert.deepEqual(decoder.feed('OK'), []);
  assert.deepEqual(decoder.feed('\r\n'), ['OK']);
});

test('LineDecoder rejects lines over its configured limit', () => {
  const decoder = new LineDecoder(32);
  assert.throws(() => decoder.feed('X'.repeat(33) + '\n'), /too long/i);
});

test('SerialConnection.open uses 115200 baud', async () => {
  const port = makeMockPort();
  const previousNavigator = globalThis.navigator;
  Object.defineProperty(globalThis, 'navigator', {
    value: { serial: { requestPort: async () => port } },
    configurable: true
  });
  try {
    const connection = new SerialConnection();
    await connection.open();
    assert.equal(port.openOptions().baudRate, 115200);
    await connection.close();
  } finally {
    Object.defineProperty(globalThis, 'navigator', {
      value: previousNavigator,
      configurable: true
    });
  }
});

test('SerialConnection.writeLine appends a newline', async () => {
  const port = makeMockPort();
  const connection = new SerialConnection();
  connection.port = port;
  connection.writer = port.writable.getWriter();
  await connection.writeLine('STATUS');
  assert.deepEqual(port.writes, ['STATUS\n']);
  connection.writer.releaseLock();
});
