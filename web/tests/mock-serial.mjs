export function installMockSerial() {
  class MockSerialPort {
    constructor() {
      this.writes = [];
      this._queue = [];
      this._controller = null;
      this._closed = false;
      this._baudRate = null;
      this.status = 'F=7074000 BAND=40M STEP=1000 MODE=DIR EN=1 OUT=7074000,OFF,OFF IF=9000000 INJ=HI IQ=0 LIMIT=WIDE DRIVE=8,8,8 FOVR=0 CAL=0 FLAGS=0 SI5351=OK';
      this.closeAttempts = 0;
      this.closeError = null;

      this.writable = new WritableStream({
        write: (chunk) => {
          const text = new TextDecoder().decode(chunk);
          const line = text.replace(/\r?\n$/, '');
          this.writes.push(line);
          this._handleCommand(line);
        }
      });

      this.readable = new ReadableStream({
        start: (controller) => {
          this._controller = controller;
        },
        pull: (controller) => {
          this._maybeEnqueue();
        },
        cancel: () => {
          this._closed = true;
        }
      });
    }

    async open(options) {
      this._baudRate = options.baudRate;
    }

    async close() {
      this.closeAttempts += 1;
      if (this.readable.locked || this.writable.locked) {
        this.closeError = new Error('Port streams are still locked');
        throw this.closeError;
      }
      this._closed = true;
      this.closeError = null;
      if (this._controller) {
        try {
          this._controller.close();
        } catch {
          // Already closed.
        }
      }
    }

    getInfo() {
      return { usbVendorId: 0x10c4, usbProductId: 0xea60 };
    }

    setStatus(status) {
      this.status = status;
    }

    closeReadable() {
      if (this._controller) {
        try {
          this._controller.close();
        } catch {
          // Already closed.
        }
      }
    }

    _handleCommand(line) {
      const response = this._responseFor(line);
      if (response === null) {
        return;
      }
      const text = Array.isArray(response) ? `${response.join('\r\n')}\r\n` : `${response}\r\n`;
      this._queue.push(text);
      this._maybeEnqueue();
    }

    _maybeEnqueue() {
      if (this._controller && this._queue.length) {
        const chunk = this._queue.shift();
        this._controller.enqueue(new TextEncoder().encode(chunk));
      }
    }

    _responseFor(line) {
      const upper = line.trim().toUpperCase();
      if (upper === 'VER') return 'SI5351A VFO 0.1.0';
      if (upper === 'STATUS') {
        return this.status;
      }
      if (upper === 'M?') {
        return Array.from({ length: 10 }, (_, i) => (i === 0 ? 'M0 7074000 DIR 40M' : `M${i} --`));
      }
      if (upper === 'HELP') {
        return 'F STEP BAND MODE ON OFF DRIVE IF INJ IQ LIMIT FOVR MS MR MC M? CAL SAVE RESET RESET ALL STATUS VER HELP';
      }
      if (/^(F|STEP|BAND|MODE|ON|OFF|DRIVE|IF|INJ|IQ|LIMIT|FOVR|MS|MR|MC|CAL|SAVE|RESET)\b/.test(upper)) {
        return 'OK';
      }
      return 'ERR CMD';
    }
  }

  class MockSerial {
    constructor() {
      this.port = new MockSerialPort();
    }

    async requestPort() {
      return this.port;
    }

    async getPorts() {
      return [];
    }
  }

  const mock = new MockSerial();
  window.__mockSerial = mock;
  Object.defineProperty(navigator, 'serial', {
    value: mock,
    configurable: true
  });
}
