# Si5351AVFO Web Control

A static browser app that controls the Si5351AVFO over its USB-C UART using the
Web Serial API.

## Browser requirements

Use Chrome or Edge on a desktop operating system. Firefox and Safari do not
support Web Serial. The page must be served from `localhost` or HTTPS; opening
`index.html` directly from `file://` is not reliable.

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
npm test
npm run test:browser
```

`npm test` covers command encoding, status parsing, and serial framing.
`npm run test:browser` covers the UI with a mock `navigator.serial`.

If Playwright cannot find a browser, set `CHROME_PATH` to a Chromium executable:

```bash
CHROME_PATH=/path/to/chromium npm run test:browser
```

## Limitations

- Chromium-based desktop browsers only.
- Requires a user gesture to grant serial access.
- The firmware does not implement `AUTO`, so the app polls `STATUS`.
- No backend or build step is required.
