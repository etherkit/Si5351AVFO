# Si5351AVFO Web Control

A static browser app that controls the Si5351AVFO over its USB-C UART using the
Web Serial API.

## Quick start (no install)

Open the live site in Chrome or Edge on desktop:

<https://etherkit.github.io/Si5351AVFO/>

Click **Connect** and choose the CP2102N serial port.

## Single-file offline build

`single-file.html` is a self-contained build that works from `file://` — no server
or install required.

1. Download [`single-file.html`](single-file.html) from this directory (or from
   <https://etherkit.github.io/Si5351AVFO/single-file.html> once this change is
   merged).
2. Save it anywhere.
3. Open it in Chrome or Edge on desktop.
4. Click **Connect** and choose the device.

To try the UI without hardware, use the live site or the local dev server with
`?mock=1` appended to the URL. The single-file build does not include the mock
serial port; use it with real hardware.

## Browser requirements

Use Chrome or Edge on a desktop operating system. Firefox and Safari do not
support Web Serial. The normal module-based `index.html` must be served from
`localhost` or HTTPS; the single-file build also works from `file://`.

## Run locally

```bash
cd web
npm install
python3 -m http.server 8000
```

Open <http://127.0.0.1:8000>, click **Connect**, and choose the CP2102N serial
port.

## Controls

The app exposes the firmware’s serial command set:

- Frequency, step, band, and mode
- Tuning knob, `+`/`-` buttons, and keyboard shortcuts (`+`/`=` to step up,
  `-`/`_` to step down). Stepping is clamped to 8000–160000000 Hz.
- Clock enable, drive current, and filter override for CLK0–CLK2
- Superhet IF, injection side, and I/Q order
- Tuning limit
- Memory channels 0–9 (store, recall, clear)
- Calibration, save, reset, and factory reset
- A raw console for any supported command

Opening the serial port may reset the board through the CP2102N DTR line. The
app waits briefly and uses `VER` as a readiness probe.

## Development

```bash
npm install
npm test
npm run test:browser
npm run build:single
npm run check:single
```

`npm test` covers command encoding, status parsing, serial framing, and the
single-file artifact.
`npm run test:browser` covers the UI with a mock `navigator.serial`.
`npm run build:single` regenerates `single-file.html` using esbuild.
`npm run check:single` verifies the committed `single-file.html` is up to date.

If Playwright cannot find a browser, set `CHROME_PATH` to a Chromium executable:

```bash
CHROME_PATH=/path/to/chromium npm run test:browser
```

## Limitations

- Chromium-based desktop browsers only.
- Requires a user gesture to grant serial access.
- The firmware does not implement `AUTO`, so the app polls `STATUS`.
- No backend is required.
