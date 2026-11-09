export const COMMAND_LIMIT = 32;
export const REPLY_LINE_LIMIT = 256;

export function browserSupportsWebSerial() {
  return Boolean(
    typeof navigator !== 'undefined' &&
      navigator.serial &&
      typeof navigator.serial.requestPort === 'function'
  );
}

export class LineDecoder {
  constructor(maxLineLength = REPLY_LINE_LIMIT) {
    this.maxLineLength = maxLineLength;
    this.buffer = '';
  }

  feed(text) {
    this.buffer += String(text).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = [];
    let newline;
    while ((newline = this.buffer.indexOf('\n')) >= 0) {
      const line = this.buffer.slice(0, newline);
      this.buffer = this.buffer.slice(newline + 1);
      if (line.length > this.maxLineLength) {
        throw new Error('Line too long');
      }
      lines.push(line);
    }
    return lines;
  }
}

export class SerialConnection {
  constructor() {
    this.port = null;
    this.reader = null;
    this.writer = null;
    this.info = null;
    this._closed = false;
    this._decoder = new LineDecoder();
    this._textDecoder = new TextDecoder();
    this._pendingLines = [];
  }

  async open() {
    if (!browserSupportsWebSerial()) {
      throw new Error('Web Serial is not supported by this browser');
    }
    this.port = await navigator.serial.requestPort();
    await this.port.open({ baudRate: 115200 });
    this.reader = this.port.readable.getReader();
    this.writer = this.port.writable.getWriter();
    this.info = typeof this.port.getInfo === 'function' ? this.port.getInfo() : null;
    return this.port;
  }

  async writeLine(line) {
    if (!this.port || !this.writer) {
      throw new Error('Serial port is not open');
    }
    await this.writer.write(new TextEncoder().encode(`${line}\n`));
  }

  async readLine() {
    while (true) {
      if (this._pendingLines.length) {
        return this._pendingLines.shift();
      }
      const { value, done } = await this.reader.read();
      if (done) {
        return null;
      }
      const text = this._textDecoder.decode(value, { stream: true });
      this._pendingLines.push(...this._decoder.feed(text));
    }
  }

  async *readLines() {
    while (!this._closed) {
      const line = await this.readLine();
      if (line === null) {
        return;
      }
      yield line;
    }
  }

  async close() {
    this._closed = true;
    try {
      if (this.reader) {
        await this.reader.cancel();
      }
    } catch {
      // Ignore cancel errors during close.
    }
    try {
      if (this.writer) {
        this.writer.releaseLock();
      }
    } catch {
      // Ignore writer release errors during close.
    }
    try {
      if (this.port) {
        await this.port.close();
      }
    } catch {
      // Ignore port close errors during close.
    }
    this.reader = null;
    this.writer = null;
    this.port = null;
  }
}
