import * as commands from './commands.js';
import * as status from './status.js';
import { SerialConnection, browserSupportsWebSerial } from './serial.js';

class App {
  constructor() {
    this.conn = null;
    this.poll = null;
    this.writeChain = Promise.resolve();
    this.expectMemory = 0;
    this.memoryLines = [];
    this.closed = false;
    this.elements = {
      connect: document.getElementById('connect'),
      disconnect: document.getElementById('disconnect'),
      portInfo: document.getElementById('port-info'),
      firmwareVersion: document.getElementById('firmware-version'),
      unsupported: document.getElementById('unsupported'),
      statusFreq: document.getElementById('status-freq'),
      statusBand: document.getElementById('status-band'),
      statusStep: document.getElementById('status-step'),
      statusMode: document.getElementById('status-mode'),
      statusSi5351: document.getElementById('status-si5351'),
      frequency: document.getElementById('frequency'),
      step: document.getElementById('step'),
      band: document.getElementById('band'),
      mode: document.getElementById('mode'),
      ifFrequency: document.getElementById('if'),
      injection: document.getElementById('injection'),
      iqOrder: document.getElementById('iq-order'),
      limit: document.getElementById('limit'),
      calibration: document.getElementById('calibration'),
      clockControls: document.getElementById('clock-controls'),
      memoryList: document.getElementById('memory-list'),
      consoleLog: document.getElementById('console-log'),
      consoleForm: document.getElementById('console-form'),
      consoleInput: document.getElementById('console-input'),
      save: document.getElementById('save'),
      reset: document.getElementById('reset'),
      factoryReset: document.getElementById('factory-reset')
    };
  }

  init() {
    if (!browserSupportsWebSerial()) {
      this.elements.unsupported.hidden = false;
      this.elements.connect.disabled = true;
    }

    this.elements.connect.addEventListener('click', () => this.connect());
    this.elements.disconnect.addEventListener('click', () => this.disconnect());
    this.elements.frequency.addEventListener('change', () => {
      this.send(commands.frequency(Number(this.elements.frequency.value)));
    });
    this.elements.step.addEventListener('change', () => {
      this.send(commands.step(Number(this.elements.step.value)));
    });
    this.elements.band.addEventListener('change', () => {
      this.send(commands.band(this.elements.band.value));
    });
    this.elements.mode.addEventListener('change', () => {
      this.send(commands.mode(this.elements.mode.value));
      this.updateModeAvailability();
    });
    this.elements.ifFrequency.addEventListener('change', () => {
      this.send(commands.ifFrequency(Number(this.elements.ifFrequency.value)));
    });
    this.elements.injection.addEventListener('change', () => {
      this.send(commands.injection(this.elements.injection.value));
    });
    this.elements.iqOrder.addEventListener('change', () => {
      this.send(commands.iqOrder(Number(this.elements.iqOrder.value)));
    });
    this.elements.limit.addEventListener('change', () => {
      this.send(commands.limit(this.elements.limit.value));
    });
    this.elements.calibration.addEventListener('change', () => {
      this.send(commands.calibration(Number(this.elements.calibration.value)));
    });
    this.elements.save.addEventListener('click', () => this.send(commands.save()));
    this.elements.reset.addEventListener('click', () => this.send(commands.reset()));
    this.elements.factoryReset.addEventListener('click', () => this.send(commands.factoryReset()));
    this.elements.consoleForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const line = this.elements.consoleInput.value.trim();
      if (line) {
        this.send(line);
      }
      this.elements.consoleInput.value = '';
    });

    this.buildClockControls();
    this.buildMemoryList();
    this.updateModeAvailability();
  }

  buildClockControls() {
    for (let clk = 0; clk < 3; clk += 1) {
      const row = document.createElement('div');
      row.className = 'clock-row';

      const enable = document.createElement('input');
      enable.type = 'checkbox';
      enable.id = `clock-enable-${clk}`;
      enable.checked = clk === 0;
      enable.addEventListener('change', () => {
        this.send(enable.checked ? commands.clockOn(clk) : commands.clockOff(clk));
      });

      const drive = document.createElement('select');
      drive.id = `drive-${clk}`;
      for (const value of [2, 4, 6, 8]) {
        const option = document.createElement('option');
        option.value = String(value);
        option.textContent = `${value} mA`;
        drive.appendChild(option);
      }
      drive.value = '8';
      drive.addEventListener('change', () => {
        this.send(commands.drive(clk, Number(drive.value)));
      });

      const filter = document.createElement('input');
      filter.type = 'checkbox';
      filter.id = `filter-${clk}`;
      filter.title = 'Filter override';
      filter.addEventListener('change', () => {
        this.send(commands.filterOverride(clk, filter.checked));
      });

      const filterLabel = document.createElement('label');
      filterLabel.textContent = 'FLT';
      filterLabel.title = 'Filter override';
      filterLabel.style.margin = '0';
      filterLabel.prepend(filter);

      const label = document.createElement('label');
      label.textContent = `CLK${clk}`;
      label.style.margin = '0';

      row.append(enable, label, drive, filterLabel);
      this.elements.clockControls.appendChild(row);
    }
  }

  buildMemoryList() {
    this.elements.memoryList.replaceChildren();
    for (let channel = 0; channel < 10; channel += 1) {
      const row = document.createElement('div');
      row.className = 'memory-row';
      row.id = `memory-row-${channel}`;

      const name = document.createElement('span');
      name.textContent = `M${channel}`;
      const value = document.createElement('span');
      value.textContent = '—';
      value.id = `memory-value-${channel}`;

      const actions = document.createElement('span');
      const store = document.createElement('button');
      store.textContent = 'Store';
      store.addEventListener('click', () => {
        this.send(commands.memoryStore(channel));
        this.send(commands.memoryList());
      });
      const recall = document.createElement('button');
      recall.textContent = 'Recall';
      recall.addEventListener('click', () => {
        this.send(commands.memoryRecall(channel));
        this.send(commands.memoryList());
      });
      const clear = document.createElement('button');
      clear.textContent = 'Clear';
      clear.addEventListener('click', () => {
        this.send(commands.memoryClear(channel));
        this.send(commands.memoryList());
      });
      actions.append(store, recall, clear);

      row.append(name, value, actions);
      this.elements.memoryList.appendChild(row);
    }
  }

  async connect() {
    if (this.conn) {
      return;
    }
    try {
      this.conn = new SerialConnection();
      await this.conn.open();
      this.closed = false;
      this.setConnected(true);
      this.log('system', 'Connected');
      if (this.conn.info) {
        const { usbVendorId, usbProductId } = this.conn.info;
        this.elements.portInfo.textContent = usbVendorId
          ? `USB ${usbVendorId.toString(16)}:${usbProductId.toString(16)}`
          : 'Serial port';
      }
      this.readLoop();
      await new Promise((resolve) => setTimeout(resolve, 500));
      this.send(commands.version());
      this.send(commands.status());
      this.send(commands.memoryList());
      this.poll = window.setInterval(() => this.send(commands.status()), 250);
    } catch (error) {
      this.log('error', error.message);
      await this.disconnect();
    }
  }

  async disconnect() {
    if (this.poll) {
      window.clearInterval(this.poll);
      this.poll = null;
    }
    this.closed = true;
    if (this.conn) {
      await this.conn.close();
      this.conn = null;
    }
    this.setConnected(false);
    this.elements.portInfo.textContent = '';
    this.log('system', 'Disconnected');
  }

  setConnected(connected) {
    this.elements.connect.hidden = connected;
    this.elements.disconnect.hidden = !connected;
    this.elements.connect.disabled = !browserSupportsWebSerial();
  }

  send(line) {
    if (!this.conn) {
      this.log('error', 'Not connected');
      return Promise.resolve();
    }
    if (line === 'M?') {
      this.expectMemory = 10;
      this.memoryLines = [];
    }
    this.log('sent', line);
    this.writeChain = this.writeChain
      .then(() => this.conn.writeLine(line))
      .catch((error) => this.log('error', error.message));
    return this.writeChain;
  }

  async readLoop() {
    try {
      for await (const line of this.conn.readLines()) {
        this.handleLine(line);
      }
    } catch (error) {
      if (!this.closed) {
        this.log('error', error.message);
      }
    }
  }

  handleLine(line) {
    const text = line.trim();
    if (!text) {
      return;
    }

    if (text.startsWith('ERR')) {
      this.log('error', status.parseError(text));
      return;
    }

    this.log('device', text);

    if (this.expectMemory > 0 && /^M\d+\s/.test(text)) {
      this.memoryLines.push(text);
      this.expectMemory -= 1;
      if (this.expectMemory === 0) {
        this.renderMemory(status.parseMemoryList(this.memoryLines));
        this.memoryLines = [];
      }
      return;
    }

    if (text.startsWith('F=')) {
      try {
        this.renderStatus(status.parseStatus(text));
      } catch (error) {
        this.log('error', error.message);
      }
      return;
    }

    if (text.startsWith('SI5351A VFO')) {
      this.renderVersion(status.parseVersion(text));
      return;
    }
  }

  renderStatus(state) {
    this.elements.statusFreq.textContent = state.freq ?? '—';
    this.elements.statusBand.textContent = state.band ?? '—';
    this.elements.statusStep.textContent = state.step ?? '—';
    this.elements.statusMode.textContent = state.mode ?? '—';
    this.elements.statusSi5351.textContent = state.si5351Ok ? 'OK' : 'ERR';

    if (state.freq !== null) this.elements.frequency.value = String(state.freq);
    if (state.step !== null) this.elements.step.value = String(state.step);
    if (state.band !== null) this.elements.band.value = state.band;
    if (state.mode !== null) this.elements.mode.value = state.mode;
    if (state.ifFrequency !== null) this.elements.ifFrequency.value = String(state.ifFrequency);
    if (state.injection !== null) this.elements.injection.value = state.injection;
    if (state.iqOrder !== null) this.elements.iqOrder.value = String(state.iqOrder);
    if (state.limit !== null) this.elements.limit.value = state.limit;
    if (state.calibration !== null) this.elements.calibration.value = String(state.calibration);

    for (let clk = 0; clk < 3; clk += 1) {
      const enable = document.getElementById(`clock-enable-${clk}`);
      const drive = document.getElementById(`drive-${clk}`);
      const filter = document.getElementById(`filter-${clk}`);
      if (enable) enable.checked = state.clockEnabled[clk];
      if (drive) drive.value = String(state.drive[clk] ?? 8);
      if (filter) filter.checked = state.filterOverride[clk];
    }

    this.updateModeAvailability();
  }

  renderMemory(memories) {
    for (const memory of memories) {
      const value = document.getElementById(`memory-value-${memory.channel}`);
      if (!value) continue;
      value.textContent = memory.empty
        ? '—'
        : `${memory.freq} ${memory.mode} ${memory.band}`;
    }
  }

  renderVersion(version) {
    this.elements.firmwareVersion.textContent = version.version
      ? `${version.product} ${version.version}`
      : version.product;
  }

  updateModeAvailability() {
    const mode = this.elements.mode.value;
    this.elements.ifFrequency.disabled = mode !== 'SH';
    this.elements.injection.disabled = mode !== 'SH';
    this.elements.iqOrder.disabled = mode !== 'IQ';
  }

  log(kind, text) {
    const line = document.createElement('div');
    line.textContent = `${kind === 'sent' ? '>' : kind === 'error' ? '!' : '<'} ${text}`;
    this.elements.consoleLog.appendChild(line);
    while (this.elements.consoleLog.childElementCount > 500) {
      this.elements.consoleLog.firstElementChild.remove();
    }
    this.elements.consoleLog.scrollTop = this.elements.consoleLog.scrollHeight;
  }
}

const app = new App();
app.init();
window.__app = app;
