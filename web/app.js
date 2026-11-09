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
    this.memoryRequestPending = false;
    this.memoryRefreshQueued = false;
    this.memoryRequestTimeout = null;
    this.closed = false;
    this.connectionGeneration = 0;
    this.versionReceived = false;
    this.statusReceived = false;
    this.memoryReceived = false;
    this.serialDisconnectHandler = null;
    this.knobRotation = 0;
    this.knobIndicator = null;
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
      statusOutputs: document.getElementById('status-outputs'),
      statusFlags: document.getElementById('status-flags'),
      frequency: document.getElementById('frequency'),
      step: document.getElementById('step'),
      stepUp: document.getElementById('step-up'),
      stepDown: document.getElementById('step-down'),
      tuningKnob: document.getElementById('tuning-knob'),
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
    this.elements.consoleInput.setAttribute('aria-label', 'Console command');

    this.elements.connect.addEventListener('click', () => this.connect());
    this.elements.disconnect.addEventListener('click', () => this.disconnect());
    this.elements.frequency.addEventListener('change', () => {
      const value = Number(this.elements.frequency.value);
      if (this.validNumber(this.elements.frequency, value, 8000, 160000000)) {
        this.send(commands.frequency(value));
      }
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
      const value = Number(this.elements.ifFrequency.value);
      if (this.validNumber(this.elements.ifFrequency, value, 8000, 160000000)) {
        this.send(commands.ifFrequency(value));
      }
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
      const value = Number(this.elements.calibration.value);
      if (this.validNumber(this.elements.calibration, value, -999999, 999999)) {
        this.send(commands.calibration(value));
      }
    });
    this.elements.save.addEventListener('click', () => this.send(commands.save()));
    this.elements.reset.addEventListener('click', () => {
      if (window.confirm('Reset settings to defaults?')) {
        this.send(commands.reset());
      }
    });
    this.elements.factoryReset.addEventListener('click', () => {
      if (window.confirm('Factory reset will erase calibration and all memories. Continue?')) {
        this.send(commands.factoryReset());
      }
    });
    this.elements.consoleForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const line = this.elements.consoleInput.value.trim();
      if (line) {
        this.send(line);
      }
      this.elements.consoleInput.value = '';
    });

    document.addEventListener('keydown', (event) => {
      if (event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }
      const tag = event.target && event.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
        return;
      }
      if (event.key === '+' || event.key === '=') {
        event.preventDefault();
        this.stepFrequencyWithKnob(1);
      } else if (event.key === '-' || event.key === '_') {
        event.preventDefault();
        this.stepFrequencyWithKnob(-1);
      }
    });

    this.buildClockControls();
    this.buildMemoryList();
    this.updateModeAvailability();
    this.elements.stepUp.addEventListener('click', () => this.stepFrequencyWithKnob(1));
    this.elements.stepDown.addEventListener('click', () => this.stepFrequencyWithKnob(-1));
    this.setupTuningKnob();
  }

  validNumber(element, value, min, max) {
    if (!Number.isInteger(value) || value < min || value > max) {
      this.log('error', `${element.id} must be an integer between ${min} and ${max}`);
      element.setAttribute('aria-invalid', 'true');
      element.focus();
      return false;
    }
    element.removeAttribute('aria-invalid');
    return true;
  }

  stepFrequency(direction) {
    if (!this.conn) {
      return false;
    }
    let freq = Number(this.elements.frequency.value);
    if (this.elements.frequency.value.trim() === '' || !Number.isFinite(freq) || freq < 8000 || freq > 160000000) {
      freq = Number(this.elements.statusFreq.textContent);
    }
    if (!Number.isFinite(freq)) {
      return false;
    }
    const step = Number(this.elements.step.value) || 1000;
    const next = Math.min(160000000, Math.max(8000, freq + direction * step));
    if (!Number.isInteger(next) || next === freq) {
      return false;
    }
    this.elements.frequency.value = String(next);
    this.elements.statusFreq.textContent = String(next);
    this.send(commands.frequency(next));
    this.updateKnob(next);
    return true;
  }

  stepFrequencyWithKnob(direction) {
    if (this.stepFrequency(direction)) {
      this.rotateKnob(direction);
    }
  }

  rotateKnob(direction) {
    this.knobRotation = (this.knobRotation || 0) + direction * 15;
    this.applyKnobRotation();
  }

  applyKnobRotation() {
    if (this.knobIndicator) {
      this.knobIndicator.style.transform = `rotate(${this.knobRotation}deg)`;
    }
  }

  updateKnob(value) {
    const knob = this.elements.tuningKnob;
    if (!knob) return;
    knob.setAttribute('aria-valuenow', String(value));
    knob.setAttribute('aria-valuetext', `${value} Hz`);
  }

  setupTuningKnob() {
    const knob = this.elements.tuningKnob;
    if (!knob) return;
    this.knobIndicator = knob.querySelector('.knob-indicator');
    let dragging = false;
    let lastAngle = 0;
    let accum = 0;
    const threshold = 15;
    const angleOf = (event) => {
      const rect = knob.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      return Math.atan2(event.clientY - cy, event.clientX - cx) * 180 / Math.PI;
    };
    const onDown = (event) => {
      dragging = true;
      accum = 0;
      lastAngle = angleOf(event);
      try { knob.setPointerCapture(event.pointerId); } catch (e) { /* ignore */ }
    };
    const onMove = (event) => {
      if (!dragging) return;
      const angle = angleOf(event);
      let delta = angle - lastAngle;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      accum += delta;
      lastAngle = angle;
      this.knobRotation = angle;
      this.applyKnobRotation();
      while (accum >= threshold) { this.stepFrequency(1); accum -= threshold; }
      while (accum <= -threshold) { this.stepFrequency(-1); accum += threshold; }
    };
    const onUp = (event) => {
      dragging = false;
      accum = 0;
      try { knob.releasePointerCapture(event.pointerId); } catch (e) { /* ignore */ }
    };
    knob.addEventListener('pointerdown', onDown);
    knob.addEventListener('pointermove', onMove);
    knob.addEventListener('pointerup', onUp);
    knob.addEventListener('pointercancel', onUp);
    knob.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowUp' || event.key === 'ArrowRight') {
        event.preventDefault();
        this.stepFrequencyWithKnob(1);
      } else if (event.key === 'ArrowDown' || event.key === 'ArrowLeft') {
        event.preventDefault();
        this.stepFrequencyWithKnob(-1);
      }
    });
  }

  buildClockControls() {
    for (let clk = 0; clk < 3; clk += 1) {
      const row = document.createElement('div');
      row.className = 'clock-row';

      const enable = document.createElement('input');
      enable.type = 'checkbox';
      enable.id = `clock-enable-${clk}`;
      enable.setAttribute('aria-label', `CLK${clk} enable`);
      enable.checked = clk === 0;
      enable.addEventListener('change', () => {
        this.send(enable.checked ? commands.clockOn(clk) : commands.clockOff(clk));
      });

      const drive = document.createElement('select');
      drive.id = `drive-${clk}`;
      drive.setAttribute('aria-label', `CLK${clk} drive`);
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
      filter.setAttribute('aria-label', `CLK${clk} filter override`);
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
      label.htmlFor = enable.id;
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
      store.setAttribute('aria-label', `Store M${channel}`);
      store.addEventListener('click', () => {
        this.send(commands.memoryStore(channel));
        this.send(commands.memoryList());
      });
      const recall = document.createElement('button');
      recall.textContent = 'Recall';
      recall.setAttribute('aria-label', `Recall M${channel}`);
      recall.addEventListener('click', () => {
        this.send(commands.memoryRecall(channel));
        this.send(commands.memoryList());
      });
      const clear = document.createElement('button');
      clear.textContent = 'Clear';
      clear.setAttribute('aria-label', `Clear M${channel}`);
      clear.addEventListener('click', () => {
        if (window.confirm(`Clear M${channel}?`)) {
          this.send(commands.memoryClear(channel));
          this.send(commands.memoryList());
        }
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
    const generation = ++this.connectionGeneration;
    try {
      this.conn = new SerialConnection();
      await this.conn.open();
      if (generation !== this.connectionGeneration) {
        if (this.conn) {
          const errors = await this.conn.close();
          if (errors.length) {
            this.log('error', `Close failed: ${errors.join(', ')}`);
          }
        }
        return;
      }
      this.closed = false;
      this.versionReceived = false;
      this.statusReceived = false;
      this.memoryReceived = false;
      this.expectMemory = 0;
      this.memoryLines = [];
      this.memoryRequestPending = false;
      this.memoryRefreshQueued = false;
      if (this.memoryRequestTimeout) {
        clearTimeout(this.memoryRequestTimeout);
        this.memoryRequestTimeout = null;
      }
      this.setConnected(true);
      this.log('system', 'Connected');
      if (this.conn.info) {
        const { usbVendorId, usbProductId } = this.conn.info;
        this.elements.portInfo.textContent = usbVendorId
          ? `USB ${usbVendorId.toString(16)}:${usbProductId.toString(16)}`
          : 'Serial port';
      }
      this.readLoop();
      this.attachSerialDisconnectListener();
      await this.initialSync(generation);
      if (generation !== this.connectionGeneration || !this.conn) {
        return;
      }
      this.poll = window.setInterval(() => this.send(commands.status()), 250);
    } catch (error) {
      this.log('error', error.message);
      await this.disconnect();
    }
  }

  async initialSync(generation) {
    const deadline = Date.now() + 3000;
    let memoryRequestedAt = 0;
    while (Date.now() < deadline && generation === this.connectionGeneration && this.conn) {
      if (!this.versionReceived) {
        this.send(commands.version());
      }
      if (!this.statusReceived) {
        this.send(commands.status());
      }
      if (this.statusReceived && !this.memoryReceived && (this.expectMemory === 0 || Date.now() - memoryRequestedAt > 1000)) {
        this.send(commands.memoryList());
        memoryRequestedAt = Date.now();
      }
      if (this.versionReceived && this.statusReceived && this.memoryReceived) {
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  attachSerialDisconnectListener() {
    if (!browserSupportsWebSerial() || typeof navigator.serial.addEventListener !== 'function') {
      return;
    }
    this.detachSerialDisconnectListener();
    this.serialDisconnectHandler = (event) => {
      if (!this.conn || event.target === this.conn.port) {
        this.log('system', 'Serial port disconnected');
        this.disconnect();
      }
    };
    navigator.serial.addEventListener('disconnect', this.serialDisconnectHandler);
  }

  detachSerialDisconnectListener() {
    if (this.serialDisconnectHandler && typeof navigator.serial?.removeEventListener === 'function') {
      navigator.serial.removeEventListener('disconnect', this.serialDisconnectHandler);
    }
    this.serialDisconnectHandler = null;
  }

  async disconnect() {
    this.connectionGeneration += 1;
    if (this.poll) {
      window.clearInterval(this.poll);
      this.poll = null;
    }
    this.closed = true;
    this.detachSerialDisconnectListener();
    if (this.conn) {
      const errors = await this.conn.close();
      if (errors.length) {
        this.log('error', `Close failed: ${errors.join(', ')}`);
      }
      this.conn = null;
    }
    this.expectMemory = 0;
    this.memoryLines = [];
    this.memoryRequestPending = false;
    this.memoryRefreshQueued = false;
    if (this.memoryRequestTimeout) {
      clearTimeout(this.memoryRequestTimeout);
      this.memoryRequestTimeout = null;
    }
    this.versionReceived = false;
    this.statusReceived = false;
    this.memoryReceived = false;
    this.setConnected(false);
    this.clearConnectionState();
    this.log('system', 'Disconnected');
  }

  clearConnectionState() {
    this.elements.portInfo.textContent = '';
    this.elements.firmwareVersion.textContent = '';
    this.elements.statusFreq.textContent = '—';
    this.elements.statusBand.textContent = '—';
    this.elements.statusStep.textContent = '—';
    this.elements.statusMode.textContent = '—';
    this.elements.statusSi5351.textContent = '—';
    this.elements.statusOutputs.textContent = '—';
    this.elements.statusFlags.textContent = '—';
    for (let channel = 0; channel < 10; channel += 1) {
      const value = document.getElementById(`memory-value-${channel}`);
      if (value) value.textContent = '—';
    }
    this.updateKnob(0);
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
      if (this.memoryRequestPending) {
        this.memoryRefreshQueued = true;
        return this.writeChain;
      }
      this.memoryRequestPending = true;
      this.expectMemory = 10;
      this.memoryLines = [];
      this.memoryRequestTimeout = setTimeout(() => {
        this.memoryRequestPending = false;
        this.expectMemory = 0;
        this.memoryLines = [];
        if (this.memoryRefreshQueued) {
          this.memoryRefreshQueued = false;
          this.send('M?');
        }
      }, 2000);
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
      if (!this.closed && this.conn) {
        this.log('error', 'Serial stream ended');
        await this.disconnect();
      }
    } catch (error) {
      if (!this.closed) {
        this.log('error', error.message);
        await this.disconnect();
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
      this.expectMemory = Math.max(0, this.expectMemory - 1);
      if (this.expectMemory === 0) {
        this.renderMemory(status.parseMemoryList(this.memoryLines));
        this.memoryLines = [];
        this.memoryRequestPending = false;
        if (this.memoryRequestTimeout) {
          clearTimeout(this.memoryRequestTimeout);
          this.memoryRequestTimeout = null;
        }
        if (this.memoryRefreshQueued) {
          this.memoryRefreshQueued = false;
          this.send('M?');
        }
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
    this.statusReceived = true;
    this.elements.statusFreq.textContent = state.freq ?? '—';
    if (state.freq !== null) this.updateKnob(state.freq);
    this.elements.statusBand.textContent = state.band ?? '—';
    this.elements.statusStep.textContent = state.step ?? '—';
    this.elements.statusMode.textContent = state.mode ?? '—';
    this.elements.statusSi5351.textContent = state.si5351Ok ? 'OK' : 'ERR';
    this.elements.statusOutputs.textContent = state.outputs
      .map((value) => (value === null ? 'OFF' : value))
      .join(', ');
    const warnings = status.decodeFlags(state.flags);
    this.elements.statusFlags.textContent = warnings.length ? warnings.join('; ') : 'None';

    if (state.freq !== null) this.setIfUnfocused(this.elements.frequency, String(state.freq));
    if (state.step !== null) this.setIfUnfocused(this.elements.step, String(state.step));
    if (state.band !== null) this.setIfUnfocused(this.elements.band, state.band);
    if (state.mode !== null) this.setIfUnfocused(this.elements.mode, state.mode);
    if (state.ifFrequency !== null) this.setIfUnfocused(this.elements.ifFrequency, String(state.ifFrequency));
    if (state.injection !== null) this.setIfUnfocused(this.elements.injection, state.injection);
    if (state.iqOrder !== null) this.setIfUnfocused(this.elements.iqOrder, String(state.iqOrder));
    if (state.limit !== null) this.setIfUnfocused(this.elements.limit, state.limit);
    if (state.calibration !== null) this.setIfUnfocused(this.elements.calibration, String(state.calibration));

    for (let clk = 0; clk < 3; clk += 1) {
      const enable = document.getElementById(`clock-enable-${clk}`);
      const drive = document.getElementById(`drive-${clk}`);
      const filter = document.getElementById(`filter-${clk}`);
      if (enable && document.activeElement !== enable) enable.checked = state.clockEnabled[clk];
      if (drive) this.setIfUnfocused(drive, String(state.drive[clk] ?? 8));
      if (filter && document.activeElement !== filter) filter.checked = state.filterOverride[clk];
    }

    this.updateModeAvailability();
  }

  setIfUnfocused(element, value) {
    if (element.tagName === 'SELECT' || document.activeElement !== element) {
      element.value = value;
    }
  }

  renderMemory(memories) {
    this.memoryReceived = true;
    for (const memory of memories) {
      const value = document.getElementById(`memory-value-${memory.channel}`);
      if (!value) continue;
      value.textContent = memory.empty
        ? '—'
        : `${memory.freq} ${memory.mode} ${memory.band}`;
    }
  }

  renderVersion(version) {
    this.versionReceived = true;
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

function boot() {
  const app = new App();
  app.init();
  window.__app = app;
}

const ENABLE_MOCK = globalThis.ENABLE_MOCK !== false;
const params = new URLSearchParams(window.location.search);
if (ENABLE_MOCK && params.get('mock') === '1') {
  import('./tests/mock-serial.mjs').then(({ installMockSerial }) => {
    installMockSerial();
    boot();
  });
} else {
  boot();
}
