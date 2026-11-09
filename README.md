# Si5351AVFO
Si5351A VFO board for the Si5351 Field Manual (Chapter 6).

## Regenerating docs

After any schematic change, run `tools/export_docs.sh` (needs KiCad 10 `kicad-cli`).
It rewrites `docs/Si5351AVFO_schematic.pdf`, the netlist, SVGs and `docs/erc.rpt`.

## Web control

A static browser control panel is available in [`web/`](web/). It uses the Web
Serial API to talk to the firmware over the CP2102N USB-C UART.

- Live site: <https://etherkit.github.io/Si5351AVFO/>
- Offline single-file build: [`web/single-file.html`](web/single-file.html)
  (works from `file://` with no server)

See [`web/README.md`](web/README.md) for browser requirements and setup.
