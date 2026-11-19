# Si5351AVFO parts cost — 10 assembled boards

Prices pulled **2026-11-19, afternoon Pacific (America/Los_Angeles)**.
JLC parts from the cart API (`getComponentDetail`); DigiKey parts from
the Product Information API v4 (US, USD, marketplace excluded). They
change daily.

Order quantity: **10 boards**. The 21 Extended lines listed in
`digikey-extended.md` are bought from DigiKey and hand-soldered; the
rest stay on the JLCPCB assembler. Working copy under
`/workspace/si5351avfo-final`, **not committed**.

## Totals at 10 boards

| Item | Amount |
|---|---:|
| JLC assembly-BOM parts (26 unique LCSCs, including 15 Basic) | **$80.30** |
| Economic Extended feeder loading (11 unique × $3.07) | **$33.77** |
| **JLC parts + feeder fees** | **$114.07** |
| DigiKey cart for the 21 pulled lines (`digikey/vfo-digikey-cart-qty10.txt`) | **$58.32** |
| **Parts + fees, excluding SMA / OLED / can** | **$172.39** |
| Hand-solder SMA, Amphenol 132289 (30 pcs, footprint still to confirm) | $217.60 |
| DS1 OLED and SH1 can | not priced |

Economic feeder fee source: [JLCPCB “PCB Assembly Cost: What Does the Price Include?”](https://jlcpcb.com/help/article/pcb-assembly-price), last updated 22 Oct 2026, “Feeder Loading \| $3.07 Extend” on Economic PCBA. Unique count is by LCSC number (SW2/SW3/SW4 share C2837537 and are one feeder).

Versus leaving all 32 Extended lines at JLC ($234.80 parts+fees): about **$62** saved, in exchange for hand-soldering 31 placements per ten boards (0603/1008 passives, one SOD-123, one THT header, one SOIC-20 MCU per board). The ±1% C145 upgrade is $0.06 more than the ±2% DigiKey part that was in the earlier comparison.

Standard PCBA feeder loading, for comparison only: $1.53 × 26 unique parts = $39.78 per order ([same page](https://jlcpcb.com/help/article/pcb-assembly-price)).

## How DigiKey quantities were chosen

For each of the 21 lines, order qty = max(qty per board × 10, DigiKey MOQ), then rounded up to a higher price break only if that extended cost is cheaper. **No line needed a bump**; every line is at need × 10 (MOQ 1). Customer reference is the refdes, space-separated, matching the pa40 cart file format.

C145 uses the **±1%** YAGEO CC0603FRNPO9BN160 (13-CC0603FRNPO9BN160CT-ND, 3,580 cut-tape in stock). The ±2% GRNPO9BN160 is also in stock (10,628) but was not used.

## DigiKey 21-line cart (10 boards)

Verified this session via `/products/v4/search/{PN}/productdetails`. All 21 are Active, non-marketplace, and fill a need of 10 boards.

| Refs | Qty/bd | DigiKey PN | MPN | Pack | Stock | Need | Order | Unit | Ext | Notes |
|---|---:|---|---|---|---:|---:|---:|---:|---:|---|
| C101 C121 | 2 | 478-KGM15ACG1H330FTCT-ND | KGM15ACG1H330FT | Cut Tape (CT) | 71759 | 20 | 20 | 0.1310 | 2.62 | substitute (33 pF C0G 0603 ±1%) |
| C103 C123 | 2 | 311-3906-1-ND | CC0603FRNPO9BN820 | Cut Tape (CT) | 51663 | 20 | 20 | 0.1170 | 2.34 | exact |
| C106 C126 | 2 | 13-CC0603FRNPO9BN200CT-ND | CC0603FRNPO9BN200 | Cut Tape (CT) | 22788 | 20 | 20 | 0.1420 | 2.84 | exact |
| C107 C127 | 2 | 311-3867-1-ND | CC0603CRNPO9BN9R1 | Cut Tape (CT) | 4095 | 20 | 20 | 0.1120 | 2.24 | exact |
| C141 | 1 | 311-3833-1-ND | CC0603BRNPO9BN3R6 | Cut Tape (CT) | 35040 | 10 | 10 | 0.1070 | 1.07 | exact |
| C142 | 1 | 13-CC0603FRNPO9BN240CT-ND | CC0603FRNPO9BN240 | Cut Tape (CT) | 35178 | 10 | 10 | 0.1420 | 1.42 | substitute (24 pF C0G 0603 ±1%) |
| C143 | 1 | 311-3894-1-ND | CC0603FRNPO9BN300 | Cut Tape (CT) | 25055 | 10 | 10 | 0.1420 | 1.42 | exact |
| C144 | 1 | 311-3889-1-ND | CC0603FRNPO9BN180 | Cut Tape (CT) | 2964 | 10 | 10 | 0.1260 | 1.26 | exact |
| C145 | 1 | 13-CC0603FRNPO9BN160CT-ND | CC0603FRNPO9BN160 | Cut Tape (CT) | 3580 | 10 | 10 | 0.1030 | 1.03 | ±1% upgrade; DigiKey stock 3,580 |
| C146 | 1 | 311-3837-1-ND | CC0603BRNPO9BN5R6 | Cut Tape (CT) | 61628 | 10 | 10 | 0.0740 | 0.74 | exact |
| C147 | 1 | 311-3827-1-ND | CC0603BRNPO9BN2R0 | Cut Tape (CT) | 14137 | 10 | 10 | 0.0710 | 0.71 | exact |
| D4 | 1 | SD101AWTPMSCT-ND | SD101AW-TP | Cut Tape (CT) | 52278 | 10 | 10 | 0.1310 | 1.31 | substitute (SOD-123 SD101AW; Diodes SD101AW-7-F stock 0) |
| FB1 FB2 | 2 | 490-5221-1-ND | BLM18PG221SN1D | Cut Tape (CT) | 181874 | 20 | 20 | 0.0970 | 1.94 | exact |
| J5 | 1 | 35-PREC004SAAN-RC-ND | PREC004SAAN-RC | Bulk | 18224 | 10 | 10 | 0.0540 | 0.54 | generic 1x4 2.54 mm THT header |
| L1 L4 | 2 | 490-18518-1-ND | LQW2UASR10G0CL | Cut Tape (CT) | 103 | 20 | 20 | 0.1940 | 3.88 | exact; thin stock |
| L2 L3 L5 L6 | 4 | 490-16089-1-ND | LQW2UASR15F00L | Cut Tape (CT) | 8857 | 40 | 40 | 0.3400 | 13.60 | exact |
| L7 | 1 | 490-LQW2UAS33NG00LCT-ND | LQW2UAS33NG00L | Cut Tape (CT) | 1012 | 10 | 10 | 0.1790 | 1.79 | substitute (00L vs JLC 0CL) |
| L8 L9 | 2 | 490-LQW2UAS68NG00LCT-ND | LQW2UAS68NG00L | Cut Tape (CT) | 1498 | 20 | 20 | 0.1790 | 3.58 | exact |
| R7 | 1 | 311-22.1KHRCT-ND | RC0603FR-0722K1L | Cut Tape (CT) | 419047 | 10 | 10 | 0.0280 | 0.28 | exact |
| R8 | 1 | RMCF0603FT47K5CT-ND | RMCF0603FT47K5 | Cut Tape (CT) | 189276 | 10 | 10 | 0.0210 | 0.21 | substitute 47.5 kΩ 1% 0603 |
| U4 | 1 | 150-ATTINY3226-SF-ND | ATTINY3226-SF | Tube | 641 | 10 | 10 | 1.3500 | 13.50 | substitute SOIC-20W, -40 to 125 °C; SU stock 0 |

**Cart file: 21 lines, $58.32.** Path: `digikey/vfo-digikey-cart-qty10.txt`.

Stock watch: **L1/L4** 490-18518-1-ND (LQW2UASR10G0CL) has **103** cut-tape. Need 20, so it fills, but it is thin. Re-check on the order day.

## Combined pa40 + VFO-10 cart

`digikey/combined-pa40-vfo10-cart.txt` is the pa40 `digikey-cart-rev7-qty2.txt` (quantities unchanged) plus this VFO-10 cart, with the one shared PN merged:

- **490-5221-1-ND** (BLM18PG221SN1D): pa40 qty 6 (`FB2 FB3`) + VFO qty 20 (`FB1 FB2`) = **26**. Customer reference: `PA40 FB2 FB3 VFO FB1 FB2`. The merge hits the 25-break ($0.0844) and is cheaper than buying the two lines separately.
- **62 lines, $140.77** at today’s API prices (pa40-only subtotal at the original cart quantities: $83.04; VFO $58.32; $0.59 saved on the merged bead).

**Combined-cart stock concern (pa40, not VFO):** `296-39451-1-ND` (TPS62175DQCR, pa40 U2) has **0** cut-tape stock (tape-and-reel and Digi-Reel also 0). The pa40 cart file was not edited. That line will not fill until stock returns or you pick a substitute. VFO U2 stays at JLC.

## JLC assembly BOM — remaining parts, stock and class

| Refdes | Qty/bd | LCSC | MPN | Class | Stock | MOQ | Process | Notes |
|---|---:|---|---|---|---:|---:|---|---|
| C1,C7 | 2 | C28323 | CL21B105KBFNNNE | Basic | 4014131 | 1 | SMT |  |
| C2,C4-C6,C8,C14,C15,C17-C21,C25,C28,C100,C120,C140 | 17 | C49678 | CC0805KRX7R9BB104 | Basic | 22759309 | 1 | SMT |  |
| C3,C9,C16,C22,C23 | 5 | C1779 | CL21A475KAQNNNE | Basic | 1930262 | 1 | SMT |  |
| C10,C13 | 2 | C14663 | CC0603KRX7R9BB104 | Basic | 53993112 | 1 | SMT |  |
| C11,C12 | 2 | C19666 | CL10A475KO8NNNC | Basic | 3221750 | 1 | SMT |  |
| C24 | 1 | C12891 | CL31A226KAHNNNE | Basic | 2590222 | 1 | SMT |  |
| C26 | 1 | C1525 | CL05B104KO5NNNC | Basic | 34541826 | 1 | SMT |  |
| C27 | 1 | C15850 | CL21A106KAYNNNE | Basic | 9078624 | 1 | SMT |  |
| C102,C122 | 2 | C519496 | CC0603FRNPO9BN750 | Extended | 6784 | 1 | SMT |  |
| C104,C124 | 2 | C519493 | CC0603FRNPO9BN430 | Extended | 3371 | 1 | SMT |  |
| C105,C125 | 2 | C527048 | CC0603FRNPO9BN390 | Extended | 1468 | 1 | SMT |  |
| D1 | 1 | C7074 | SP0503BAHTG | Extended | 8089 | 1 | SMT |  |
| J1 | 1 | C2894897 | HC-TYPE-C-16P-01A | Extended | 34852 | 1 | SMT |  |
| R1,R2 | 2 | C23186 | 0603WAF5101T5E | Basic | 18623008 | 1 | SMT |  |
| R5 | 1 | C17415 | 0805W8F100JT5E | Basic | 4687514 | 1 | SMT |  |
| R9,R29 | 2 | C21190 | 0603WAF1001T5E | Basic | 30428957 | 1 | SMT |  |
| R12,R14-R25 | 13 | C17414 | 0805W8F1002T5E | Basic | 46294473 | 1 | SMT |  |
| R13 | 1 | C23179 | 0603WAF4700T5E | Basic | 4182752 | 1 | SMT |  |
| R27,R28 | 2 | C17673 | 0805W8F4701T5E | Basic | 4400936 | 1 | SMT |  |
| R100,R120,R140 | 3 | C17168 | 0402WGF0000TCE | Basic | 14316293 | 1 | SMT |  |
| SW1 | 1 | C255515 | EC11E18244A5 | Extended | 296 | 1 | THT | THT / manual weld |
| SW2 | 1 | C2837537 | KH-6X6X11H-STM | Extended | 4704 | 1 | SMT |  |
| SW3 | 1 | C2837537 | KH-6X6X11H-STM | Extended | 4704 | 1 | SMT |  |
| SW4 | 1 | C2837537 | KH-6X6X11H-STM | Extended | 4704 | 1 | SMT |  |
| U1,U5 | 2 | C16085 | LP2985AIM5-3.3/NOPB | Extended | 3841 | 1 | SMT |  |
| U2 | 1 | C504891 | SI5351A-B-GTR | Extended | 9730 | 1 | SMT |  |
| U3 | 1 | C969151 | CP2102N-A02-GQFN24R | Extended | 23158 | 1 | SMT |  |
| X1 | 1 | C48888230 | OW2EL89CENUXK7YLC-25M | Extended | 375 | 1 | SMT |  |

Unique LCSC numbers: 26. Basic: 15. Extended: 11. Preferred Extended: 0.

## JLC parts cost at 10 boards

Order quantity = max(per-board qty × 10, `minPurchaseNum`, `leastNumber`). Unit price is the JLC break at that order quantity. Attrition (`leastPatchNumber`) is not included.

| Refdes | LCSC | Class | Qty/bd | Need×10 | Order×10 | Unit | Ext | Fills? |
|---|---|---|---:|---:|---:|---:|---:|---|
| C1,C7 | C28323 | Basic | 2 | 20 | 20 | 0.0285 | 0.5700 | YES |
| C2,C4-C6,C8,C14,C15,C17-C21,C25,C28,C100,C120,C140 | C49678 | Basic | 17 | 170 | 170 | 0.0138 | 2.3460 | YES |
| C3,C9,C16,C22,C23 | C1779 | Basic | 5 | 50 | 50 | 0.0343 | 1.7150 | YES |
| C10,C13 | C14663 | Basic | 2 | 20 | 20 | 0.0060 | 0.1200 | YES |
| C11,C12 | C19666 | Basic | 2 | 20 | 20 | 0.0150 | 0.3000 | YES |
| C24 | C12891 | Basic | 1 | 10 | 10 | 0.1029 | 1.0290 | YES |
| C26 | C1525 | Basic | 1 | 10 | 20 | 0.0024 | 0.0480 | YES |
| C27 | C15850 | Basic | 1 | 10 | 20 | 0.0312 | 0.6240 | YES |
| C102,C122 | C519496 | Extended | 2 | 20 | 20 | 0.0303 | 0.6060 | YES |
| C104,C124 | C519493 | Extended | 2 | 20 | 20 | 0.0226 | 0.4520 | YES |
| C105,C125 | C527048 | Extended | 2 | 20 | 20 | 0.0228 | 0.4560 | YES |
| D1 | C7074 | Extended | 1 | 10 | 10 | 0.2479 | 2.4790 | YES |
| J1 | C2894897 | Extended | 1 | 10 | 10 | 0.1004 | 1.0040 | YES |
| R1,R2 | C23186 | Basic | 2 | 20 | 20 | 0.0015 | 0.0300 | YES |
| R5 | C17415 | Basic | 1 | 10 | 20 | 0.0040 | 0.0800 | YES |
| R9,R29 | C21190 | Basic | 2 | 20 | 20 | 0.0017 | 0.0340 | YES |
| R12,R14-R25 | C17414 | Basic | 13 | 130 | 130 | 0.0034 | 0.4420 | YES |
| R13 | C23179 | Basic | 1 | 10 | 20 | 0.0019 | 0.0380 | YES |
| R27,R28 | C17673 | Basic | 2 | 20 | 20 | 0.0029 | 0.0580 | YES |
| R100,R120,R140 | C17168 | Basic | 3 | 30 | 30 | 0.0012 | 0.0360 | YES |
| SW1 | C255515 | Extended | 1 | 10 | 10 | 2.0888 | 20.8880 | YES |
| SW2 | C2837537 | Extended | 1 | 10 | 10 | 0.0380 | 0.3800 | YES |
| SW3 | C2837537 | Extended | 1 | 10 | 10 | 0.0380 | 0.3800 | YES |
| SW4 | C2837537 | Extended | 1 | 10 | 10 | 0.0380 | 0.3800 | YES |
| U1,U5 | C16085 | Extended | 2 | 20 | 20 | 0.5730 | 11.4600 | YES |
| U2 | C504891 | Extended | 1 | 10 | 10 | 1.0444 | 10.4440 | YES |
| U3 | C969151 | Extended | 1 | 10 | 10 | 1.7320 | 17.3200 | YES |
| X1 | C48888230 | Extended | 1 | 10 | 10 | 0.6581 | 6.5810 | YES |

| **Parts subtotal** |  |  |  |  |  |  | **$80.30** |  |
| Economic feeder loading (11 unique Extended × $3.07) |  |  |  |  |  |  | **$33.77** |  |
| **Parts + Economic extended feeder fees** |  |  |  |  |  |  | **$114.07** |  |

Every remaining assembly-BOM line can be filled from current JLC stock at 10 boards. U4 is no longer a JLC stock risk (it is on the DigiKey cart; ATTINY3226-SF tube stock 641). SW1 (296) and X1 (375) remain the thinnest JLC Extended parts and still fill.

## Other hand-solder parts (already outside the JLC BOM)

| Item | Qty/bd | DigiKey part used for price | Stock | Order ×10 | Unit | Ext ×10 | Notes |
|---|---:|---|---:|---:|---:|---:|---|
| J2, J3, J4 SMA end-launch | 3 | Amphenol RF **132289** (ACX1426-ND), 11,797 in stock, Active | 11797 | 30 | 7.2532 | 217.60 | Comparable only. Confirm the Etherkit `SMA-ENDLAUNCH` footprint. 132289-14 (“for 0.062 in PCB”) is $10.414 @25 → $312.42 for 30 pcs, stock 267. |
| DS1 1.3 in SH1106 SPI OLED | 1 | — | — | — | — | — | Not priced. Jason is sourcing this. |
| SH1 RF fence | 1 | — | — | — | — | — | User-made tin can. |

DNP 120 Ω shunts R101/R121/R141 are not ordered.

## Not priced here — get from the JLCPCB quote page

- Bare 4-layer PCB fab for 100 × 65 mm, 1.6 mm, JLC04161H-7628, 1 oz outer / 0.5 oz inner, **blue** mask, **white** silk, finish as ordered (board file is **HAL lead-free**).
- PCB tooling, via tenting, shipping, tax, and customs.
- Whether Economic PCBA is offered (remaining THT SW1 plus a QFN). Public schedule on 22 Oct 2026: setup $8.18, stencil $1.53, SMT $0.0016/joint, manual assembly $0.0164/joint, hand-soldering labor $3.58/order, confirm-placement $0.45. **Use the cart.**
- X-ray if charged for U3. Public list starts at $1.64/pc for 1–10 pcs.
- Extra component attrition JLC may add above the order quantities.
- The DS1 OLED and SH1 can.

Sources: [JLCPCB assembly pricing](https://jlcpcb.com/help/article/pcb-assembly-price) (22 Oct 2026); JLC `getComponentDetail` and DigiKey Products v4, 19 Nov 2026, America/Los_Angeles.

## Basic / Preferred swap analysis

The earlier pass found no safe Basic/Preferred swap (same package and
equal-or-better specs) among the Extended lines. None was applied. After
this DigiKey split, **11 unique Extended** remain on the assembler and
the Economic feeder total is **$33.77** per order. The four optional ±5%
C0G Basic substitutes for C101/C121, C106/C126, C143, and C144 are moot
for this package — those four lines are now on the DigiKey cart as ±1%
parts.
