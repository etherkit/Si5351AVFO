# Si5351AVFO JLCPCB fabrication and assembly package

Generated 2026-11-19 (afternoon, America/Los_Angeles) from a local
working copy of [etherkit/Si5351AVFO](https://github.com/etherkit/Si5351AVFO)
`master` @ `6adb135`, plus uncommitted BOM-field and assembly-split
edits in `/workspace/si5351avfo-final` (**no commit or push**).

**Order quantity for this package: 10 assembled boards.**

21 unique Extended lines are pulled off JLCPCB and bought from DigiKey
for hand-solder (see `../digikey/vfo-digikey-cart-qty10.txt` and
`../pricing.md`). The copper is unchanged from `51569a3` /
[PR #7](https://github.com/etherkit/Si5351AVFO/pull/7).

## Files in this folder

| File | What it is |
|---|---|
| `Si5351AVFO_gerbers_JLC.zip` | Gerbers + PTH/NPTH drill, ready to upload |
| `Si5351AVFO_BOM_JLC.csv` | JLC BOM: Comment, Designator, Footprint, LCSC Part # (**28 lines**, 26 unique LCSCs) |
| `Si5351AVFO_CPL_JLC.csv` | JLC CPL: Designator, Mid X, Mid Y, Layer, Rotation (**72** placements, all Top) |
| `gerbers/` | Unzipped copy of the same Gerbers and drill files |
| `erc.rpt` / `drc.rpt` | ERC and DRC from this regeneration (KiCad 10.0.8) |

How the 21 DigiKey lines were removed: each of those symbols and
footprints has a custom field **`JLC_PCBA=No`** (and `DK_PN`). They are
**not** marked DNP — `in_bom` / `on_board` stay yes, so ERC, copper, and
the board are unchanged. `tools/export_fab.sh` post-filters any row with
`JLC_PCBA=No` out of the JLC BOM, then builds the CPL only from the
remaining BOM refs. A documented backup of that filter lives in the
script header.

The F.Paste gerber still has openings for those SMT pads, because they
are not DNP. The JLC stencil will deposit paste on empty pads unless you
ask JLC to omit them, or you clean the unused paste after reflow. THT
J5 has no SMT paste.

## Order parameters (from the board stackup and this design)

Set these on the JLC order page to match the board file:

| Item | Value |
|---|---|
| Layers | **4** (F.Cu, In1.Cu, In2.Cu, B.Cu) |
| Size | 100 × 65 mm, 3 mm corner radii |
| Thickness | 1.6 mm |
| Stackup | JLC04161H-7628 (0.2104 mm 7628 prepreg, 1.065 mm core) |
| Outer / inner copper | 1 oz (35 µm) / 0.5 oz (15.2 µm) |
| Material | FR4 |
| Solder mask | **Blue** (both sides) |
| Silkscreen | **White** (both sides) |
| Surface finish in the board file | **HAL lead-free** — change this on the quote page if you want ENIG |
| Impedance control | Not specified; RF lanes are 50 Ω CPWG by geometry |
| Via covering | **Tented** (recommended). U3's four 0.3 mm thermal-pad vias sit in the exposed pad; tenting or plugging the bottom helps limit solder wicking. |
| Fiducials | FID1–FID3, 1 mm copper / 2 mm mask, not in the BOM/CPL. FID1 is only 3.0 mm from the left edge; FID2 4.0 mm from the right; FID3 4.0 mm from the left. Mention this if JLC's DFM flags edge distance. |
| **PCB / PCBA qty** | **10** |

## PCBA settings

| Item | Value |
|---|---|
| Assembly side | **Top only** (all 72 CPL parts). Bottom has test-point pads only. |
| Tooling holes / fiducials | Three board fiducials already present |
| BOM / CPL | Upload the CSV files in this folder |
| THT still at JLC | **SW1** (Alps EC11E18244A5) is THT / `manualWeld` and remains in the JLC BOM/CPL. **J5** is now a DigiKey hand-solder header (see below). |
| Economic vs Standard | Prefer Economic if the cart offers it (one remaining THT + one QFN may force Standard). Use the cart for the real number. |
| U2 part | BOM uses **C504891** (SI5351A-B-GTR, tape, 9,730 in stock on 2026-11-19). `LCSC_ALT` is C529366 (GT tube). |
| X-ray | U3 is a QFN-24 with an exposed pad. The part API `xrayFlag` is false, but the quote may still add X-ray. |
| Extended parts remaining | **11 unique** Extended LCSCs (SW2/SW3/SW4 share C2837537). Economic feeder: **11 × $3.07 = $33.77** per order. |

CPL rotations are KiCad's, with no package-type offset applied. When JLC
shows the 3D placement preview, check pin 1 on **U1/U5 (SOT-23-5)**,
**U2 (MSOP-10 at 90°)**, **U3 (QFN-24)**, **D1 (SOT-143)**, **X1 (3225)**,
and **J1 (USB-C)**. U4 and D4 are no longer in this CPL. Do not upload a
hand-rotated CPL unless that preview is wrong.

## Hand-solder — DigiKey 21 lines (10 boards)

Import `../digikey/vfo-digikey-cart-qty10.txt` (or the combined
`../digikey/combined-pa40-vfo10-cart.txt` if you are also buying the
40m TX parts). Format matches the pa40 cart Jason already used:
`Quantity,DigiKey Part Number,Customer Reference` with
space-separated refdes and no header. The VFO-10 file is **21 lines,
$58.32**.

| Refs | Qty/bd | DigiKey PN | MPN | Notes |
|---|---:|---|---|---|
| C101 C121 | 2 | 478-KGM15ACG1H330FTCT-ND | KGM15ACG1H330FT | Substitute, 33 pF C0G 0603 ±1% (KYOCERA AVX) |
| C103 C123 | 2 | 311-3906-1-ND | CC0603FRNPO9BN820 | Exact |
| C106 C126 | 2 | 13-CC0603FRNPO9BN200CT-ND | CC0603FRNPO9BN200 | Exact |
| C107 C127 | 2 | 311-3867-1-ND | CC0603CRNPO9BN9R1 | Exact |
| C141 | 1 | 311-3833-1-ND | CC0603BRNPO9BN3R6 | Exact |
| C142 | 1 | 13-CC0603FRNPO9BN240CT-ND | CC0603FRNPO9BN240 | Substitute, 24 pF C0G 0603 ±1% |
| C143 | 1 | 311-3894-1-ND | CC0603FRNPO9BN300 | Exact |
| C144 | 1 | 311-3889-1-ND | CC0603FRNPO9BN180 | Exact |
| C145 | 1 | 13-CC0603FRNPO9BN160CT-ND | CC0603FRNPO9BN160 | **±1%** YAGEO (DigiKey stock 3,580); JLC could not fill this part |
| C146 | 1 | 311-3837-1-ND | CC0603BRNPO9BN5R6 | Exact |
| C147 | 1 | 311-3827-1-ND | CC0603BRNPO9BN2R0 | Exact |
| D4 | 1 | SD101AWTPMSCT-ND | SD101AW-TP | MCC SOD-123 Schottky (SerialUPDI). Diodes SD101AW-7-F is catalogued but stock 0 |
| FB1 FB2 | 2 | 490-5221-1-ND | BLM18PG221SN1D | Exact. Merged with the pa40 bead line in the combined cart |
| J5 | 1 | 35-PREC004SAAN-RC-ND | PREC004SAAN-RC | Generic 1×4 2.54 mm THT header |
| L1 L4 | 2 | 490-18518-1-ND | LQW2UASR10G0CL | Exact. **Thin stock: 103**, need 20 |
| L2 L3 L5 L6 | 4 | 490-16089-1-ND | LQW2UASR15F00L | Exact |
| L7 | 1 | 490-LQW2UAS33NG00LCT-ND | LQW2UAS33NG00L | Substitute (00L vs JLC 0CL) |
| L8 L9 | 2 | 490-LQW2UAS68NG00LCT-ND | LQW2UAS68NG00L | Exact |
| R7 | 1 | 311-22.1KHRCT-ND | RC0603FR-0722K1L | Exact |
| R8 | 1 | RMCF0603FT47K5CT-ND | RMCF0603FT47K5 | Substitute 47.5 kΩ 1% 0603 (Stackpole) |
| U4 | 1 | 150-ATTINY3226-SF-ND | ATTINY3226-SF | Same SOIC-20W as SU, −40 to 125 °C. SU stock is 0 at DigiKey |

## Hand-solder / do-not-place — already outside the JLC BOM

| Ref | What | How it is marked | Suggested sourcing |
|---|---|---|---|
| J2, J3, J4 | SMA end-launch, CLK0 / CLK1 / CLK2 | DNP, `in_bom`/`in_pos` off. MPN BWSMA-KE-P001. | Comparable Amphenol 132289; confirm the Etherkit `SMA-ENDLAUNCH` footprint. See `../pricing.md`. |
| DS1 | 1.3 in SH1106 SPI OLED, 7-pin 2.54 mm | DNP, excluded. Header only on the PCB. | Jason sourcing. |
| SH1 | Optional 42 × 33.5 mm RF solder fence | DNP, excluded. | User-cut tin can. |
| R101, R121, R141 | 120 Ω 0805 back-match shunts | DNP (sites present). | Leave off unless you later want them. |
| H1–H4 | Plated M3 mounting holes, tied to GND | Excluded (holes only). | Your hardware. |
| TP1–TP8 | 1.5 mm bottom-side pads | Excluded. | No parts. |
| FID1–FID3 | Fiducials | Excluded. | No parts. |
| JP102–JP105, JP122–JP125, JP142–JP145 | Filter / bypass solder jumpers | Not parts. NC = bridged; NO = open. | Leave as fabricated unless bypassing a filter. |

R20 stays populated at JLC (10 kΩ 0805, C17414, SW4 MENU pull-up).

## ERC / DRC from this regeneration

- ERC: 0 errors, 0 warnings (KiCad 10.0.8).
- DRC with `--schematic-parity` and `--refill-zones` (board not saved): 15 violations, all the accepted `copper_edge_clearance` hits on J2/J3/J4 SMA edge-launch pads. 0 unconnected, 0 schematic-parity issues, 0 footprint errors.

## Related

10-board parts cost, remaining Extended fees, and DigiKey cart totals:
`../pricing.md`. Cart files: `../digikey/`.
