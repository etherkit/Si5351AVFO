# Si5351AVFO — DigiKey lookup of JLC Extended parts

Prices pulled **Thursday, 19 Nov 2026, 1:53 PM Pacific (America/Los_Angeles)** from the DigiKey Product Information API v4 (`/products/v4/search/{PN}/productdetails` and keyword search), US site, USD, Marketplace sellers excluded. JLC unit costs and the $3.07 Economic feeder fee are from the same day’s `/workspace/si5351avfo-final/pricing.md` and the final assembly BOM `/workspace/si5351avfo-final/production/Si5351AVFO_BOM_JLC.csv`.

This is a read-only comparison. It does not change the board or the fab package. Tax and shipping are not included.

## BOM this is based on

Final package after the stock/packing fixes: **R20 populated** (Basic C17414, no new Extended line), **C145 = C519460** (YAGEO CC0603GRNPO9BN160, ±2%), **D4 = C154887** (Diodes SD101AW-7-F), **U2 primary = C504891** (SI5351A-B-GTR).

- Unique Extended LCSCs: **32** (SW2, SW3, and SW4 share C2837537 and count as one feeder).
- Economic feeder loading: 32 × $3.07 = **$98.24 per order**.
- All-in JLC parts + Extended fees, if every Extended line stays on the assembler: **$176.19** for 5 boards, **$234.80** for 10 boards.

## How the DigiKey prices were chosen

- Prefer the exact manufacturer MPN, non-Marketplace, **cut tape** (or tray/bulk/tube when that is the only small-quantity pack).
- Quantity = (per-board qty) × (5 or 10 boards). Unit price is the cut-tape break at `max(need, MOQ)`. The table does **not** bump a 5-board buy up to 10 just to hit a break; for several 0603 lines that would be cheaper if you want a couple of spares.
- If the exact MPN is missing from the catalog or has too little stock for 5 or 10 boards, the closest **same package, equal-or-better specs** in-stock part is listed and flagged as a **substitute**.
- JLC comparison cost for each unique line is (JLC parts extended cost at their order quantity, including any JLC MOQ) **+ $3.07**. Pulling a line off the assembler avoids both.

## Recommended split

Pull **21 unique Extended lines** off JLCPCB and buy them from DigiKey to hand-solder. Leave the other **11** (including the optional 39 pF) on the JLC assembler.

| | 5 boards | 10 boards |
|---|---:|---:|
| DigiKey parts for the 21 lines | $33.67 | $58.26 |
| JLC feeder fees avoided (21 × $3.07) | $64.47 | $64.47 |
| JLC parts cost avoided on those 21 lines | $31.66 | $56.27 |
| **Net vs leaving those 21 at JLC** (negative = you save) | **-$62.46** | **-$62.48** |
| Remaining 11 unique Extended still at JLC (parts + 11 × $3.07) | $75.37 | $106.60 |
| Basic JLC parts that stay on the assembler either way | $4.69 | $7.47 |
| **New parts+fee total** (DigiKey 21 + remaining JLC Basic and Extended + 11 fees) | **$113.73** | **$172.32** |
| Current all-JLC parts + $98.24 fees | $176.19 | $234.80 |
| **All-in save vs current JLC total** | **-$62.46** | **-$62.48** |

That is about **$62** saved at either 5 or 10 boards, before tax and shipping, in exchange for hand-soldering 0603/1008 passives, one SOD-123, one THT header, and one SOIC-20 MCU per board.

**Buy from DigiKey and hand-solder (21):** the Cauer/0603 caps C101/C121, C103/C123, C106/C126, C107/C127, C141–C147; D4; FB1/FB2; J5; L1/L4, L2/L3/L5/L6, L7, L8/L9; R7; R8; U4.

**Keep at JLC (11):** C102/C122 (75 pF), C104/C124 (43 pF), C105/C125 (39 pF, optional — see below), D1, J1, SW1, SW2–SW4, U1/U5, U2, U3, X1.

### Top reasons to pull a line

1. **U4 (ATtiny3226)** — biggest single save (~$10.48 / $13.65). Exact SU is out of stock at DigiKey; **ATTINY3226-SF** is the same SOIC-20W package with a better temperature rating and is in stock. SOIC-20 is easy to hand-solder.
2. **The 0603/1008 passives** — the $3.07 fee dwarfs the part cost on almost every cap, resistor, bead, and inductor. Most exact Yageo/Murata MPNs are in stock. A few need a same-footprint substitute (33 pF, 24 pF, 33 nH, 47.5 kΩ).
3. **D4** — exact Diodes **SD101AW-7-F** is in the DigiKey catalog but **has 0 stock**. Use **MCC SD101AW-TP** (same 60 V / 15 mA / 200 nA SOD-123 ratings, 52,278 in stock). Easy SOD-123; saves about $3.06 / $3.84.
4. **C145** — the new ±2% Yageo **CC0603GRNPO9BN160** is in stock at DigiKey (10,628). If you hand-solder it, you can optionally step back up to the ±1% CC0603FRNPO9BN160 that JLC could not fill.
5. **J5** — a generic 1×4 2.54 mm header is $0.50 / $0.54 vs JLC parts+fee of $3.33 / $3.59, and it is through-hole.

### Keep these at JLC even when a DigiKey part exists

- **U2 (SI5351A-B-GTR)** and **U3 (CP2102N)** — exact MPNs are in the catalog but DigiKey stock is 0. JLC can fill both. MSOP-10 and QFN-24 are also the harder packages.
- **J1 (USB-C)** — no catalog hit on the HCTL MPN, and 16-pin Type-C footprints are not interchangeable without a check.
- **D1 (SP0503BAHTG, SOT-143)** — in stock at DigiKey, but more expensive than JLC+fee and harder to solder.
- **SW1 (Alps EC11E18244A5)** — in stock, but DigiKey is much more expensive than JLC.
- **SW2–SW4** — no confirmed 6×6 mm SMD 11 mm-actuator equivalent; keep the JLC part so the panel height is right.
- **C102 (75 pF)** and **C104 (43 pF)** — exact Yageo is out of stock; in-spec substitutes cost more than JLC+fee at 10 boards (43 pF at both quantities).
- **X1 (YXC 25 MHz TCXO)** — pin 1 is NC and is tied to GND. No in-stock DigiKey 3225 clipped-sine 3.3 V TCXO that is both pin-safe and ±500 ppb or better.
- **U1/U5 (LP2985)** — small save, 10–20 SOT-23-5s. Not worth it unless you are already hand-assembling a lot.

## Line-by-line table

Net = DigiKey extended cost − (JLC parts + $3.07). A negative net means DigiKey + hand-solder is cheaper. “Order” is `max(need, MOQ)` at the matching price break.

| Refs | Qty/bd | JLC LCSC / MPN | DigiKey match | DigiKey PN | MPN used | Pack | Stock | Need/ord ×5 | Unit ×5 | Ext ×5 | Need/ord ×10 | Unit ×10 | Ext ×10 | JLC parts+fee ×5 | ×10 | Net ×5 | Net ×10 | Solder | Rec |
|---|---:|---|---|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
| C101, C121 | 2 | C519485 / CC0603FRNPO9BN330 | Substitute | 478-KGM15ACG1H330FTCT-ND | KGM15ACG1H330FT | Cut Tape (CT) | 71759 | 10 / 10 | $0.13 | $1.31 | 20 / 20 | $0.13 | $2.62 | $3.36 | $3.36 | -$2.05 | -$0.74 | easy (0603) | DigiKey + hand-solder |
| C102, C122 | 2 | C519496 / CC0603FRNPO9BN750 | Substitute | 478-KGQ15ACG1H750FTCT-ND | KGQ15ACG1H750FT | Cut Tape (CT) | 1958 | 10 / 10 | $0.27 | $2.66 | 20 / 20 | $0.27 | $5.32 | $3.68 | $3.68 | -$1.02 | $1.64 | easy (0603) | Keep at JLC |
| C103, C123 | 2 | C519487 / CC0603FRNPO9BN820 | Exact MPN | 311-3906-1-ND | CC0603FRNPO9BN820 | Cut Tape (CT) | 51663 | 10 / 10 | $0.12 | $1.17 | 20 / 20 | $0.12 | $2.34 | $3.32 | $3.32 | -$2.15 | -$0.98 | easy (0603) | DigiKey + hand-solder |
| C104, C124 | 2 | C519493 / CC0603FRNPO9BN430 | Substitute | 720-VJ0603D430FXPAJCT-ND | VJ0603D430FXPAJ | Cut Tape (CT) | 5446 | 10 / 10 | $0.51 | $5.09 | 20 / 20 | $0.51 | $10.18 | $3.52 | $3.52 | $1.57 | $6.66 | easy (0603) | Keep at JLC |
| C105, C125 | 2 | C527048 / CC0603FRNPO9BN390 | Substitute | 1276-2280-1-ND | CL10C390FB81PNC | Cut Tape (CT) | 62695 | 10 / 10 | $0.19 | $1.89 | 20 / 20 | $0.19 | $3.78 | $3.53 | $3.53 | -$1.64 | $0.25 | easy (0603) | Optional (keep at JLC if building 10) |
| C106, C126 | 2 | C326779 / CC0603FRNPO9BN200 | Exact MPN | 13-CC0603FRNPO9BN200CT-ND | CC0603FRNPO9BN200 | Cut Tape (CT) | 22788 | 10 / 10 | $0.14 | $1.42 | 20 / 20 | $0.14 | $2.84 | $3.36 | $3.36 | -$1.94 | -$0.52 | easy (0603) | DigiKey + hand-solder |
| C107, C127 | 2 | C513588 / CC0603CRNPO9BN9R1 | Exact MPN | 311-3867-1-ND | CC0603CRNPO9BN9R1 | Cut Tape (CT) | 4095 | 10 / 10 | $0.11 | $1.12 | 20 / 20 | $0.11 | $2.24 | $3.20 | $3.20 | -$2.08 | -$0.96 | easy (0603) | DigiKey + hand-solder |
| C141 | 1 | C519106 / CC0603BRNPO9BN3R6 | Exact MPN | 311-3833-1-ND | CC0603BRNPO9BN3R6 | Cut Tape (CT) | 35040 | 5 / 5 | $0.19 | $0.95 | 10 / 10 | $0.11 | $1.07 | $3.19 | $3.19 | -$2.24 | -$2.12 | easy (0603) | DigiKey + hand-solder |
| C142 | 1 | C2857979 / 0603CG240G500NT | Substitute | 13-CC0603FRNPO9BN240CT-ND | CC0603FRNPO9BN240 | Cut Tape (CT) | 35178 | 5 / 5 | $0.25 | $1.25 | 10 / 10 | $0.14 | $1.42 | $3.33 | $3.33 | -$2.08 | -$1.91 | easy (0603) | DigiKey + hand-solder |
| C143 | 1 | C519491 / CC0603FRNPO9BN300 | Exact MPN | 311-3894-1-ND | CC0603FRNPO9BN300 | Cut Tape (CT) | 25055 | 5 / 5 | $0.25 | $1.25 | 10 / 10 | $0.14 | $1.42 | $3.36 | $3.36 | -$2.11 | -$1.94 | easy (0603) | DigiKey + hand-solder |
| C144 | 1 | C527046 / CC0603FRNPO9BN180 | Exact MPN | 311-3889-1-ND | CC0603FRNPO9BN180 | Cut Tape (CT) | 2964 | 5 / 5 | $0.22 | $1.10 | 10 / 10 | $0.13 | $1.26 | $3.33 | $3.33 | -$2.23 | -$2.07 | easy (0603) | DigiKey + hand-solder |
| C145 | 1 | C519460 / CC0603GRNPO9BN160 | Exact MPN | 13-CC0603GRNPO9BN160CT-ND | CC0603GRNPO9BN160 | Cut Tape (CT) | 10628 | 5 / 5 | $0.17 | $0.85 | 10 / 10 | $0.10 | $0.97 | $3.32 | $3.32 | -$2.47 | -$2.35 | easy (0603) | DigiKey + hand-solder |
| C146 | 1 | C519111 / CC0603BRNPO9BN5R6 | Exact MPN | 311-3837-1-ND | CC0603BRNPO9BN5R6 | Cut Tape (CT) | 61628 | 5 / 5 | $0.14 | $0.70 | 10 / 10 | $0.07 | $0.74 | $3.20 | $3.20 | -$2.50 | -$2.46 | easy (0603) | DigiKey + hand-solder |
| C147 | 1 | C513620 / CC0603BRNPO9BN2R0 | Exact MPN | 311-3827-1-ND | CC0603BRNPO9BN2R0 | Cut Tape (CT) | 14137 | 5 / 5 | $0.13 | $0.65 | 10 / 10 | $0.07 | $0.71 | $3.21 | $3.21 | -$2.56 | -$2.50 | easy (0603) | DigiKey + hand-solder |
| D1 | 1 | C7074 / SP0503BAHTG | Exact MPN | F2715CT-ND | SP0503BAHTG | Cut Tape (CT) | 15408 | 5 / 5 | $1.50 | $7.50 | 10 / 10 | $0.95 | $9.47 | $4.31 | $5.55 | $3.19 | $3.92 | harder (SOT-143) | Keep at JLC |
| D4 | 1 | C154887 / SD101AW-7-F | Substitute | SD101AWTPMSCT-ND | SD101AW-TP | Cut Tape (CT) | 52278 | 5 / 5 | $0.21 | $1.05 | 10 / 10 | $0.13 | $1.31 | $4.11 | $5.15 | -$3.06 | -$3.84 | easy (SOD-123) | DigiKey + hand-solder |
| FB1, FB2 | 2 | C80165 / BLM18PG221SN1D | Exact MPN | 490-5221-1-ND | BLM18PG221SN1D | Cut Tape (CT) | 181890 | 10 / 10 | $0.10 | $0.97 | 20 / 20 | $0.10 | $1.94 | $3.37 | $3.37 | -$2.40 | -$1.43 | easy (0603) | DigiKey + hand-solder |
| J1 | 1 | C2894897 / HC-TYPE-C-16P-01A | Not in catalog | — | — | — | — | — | — | — | — | — | — | $3.57 | $4.07 | — | — | harder (USB-C) | Keep at JLC |
| J5 | 1 | C124378 / B-2100S04P-A110 | Substitute | 35-PREC004SAAN-RC-ND | PREC004SAAN-RC | Bulk | 18224 | 5 / 5 | $0.10 | $0.50 | 10 / 10 | $0.05 | $0.54 | $3.33 | $3.59 | -$2.83 | -$3.05 | easy (THT) | DigiKey + hand-solder |
| L1, L4 | 2 | C1330579 / LQW2UASR10G0CL | Exact MPN | 490-18518-1-ND | LQW2UASR10G0CL | Cut Tape (CT) | 103 | 10 / 10 | $0.19 | $1.94 | 20 / 20 | $0.19 | $3.88 | $6.63 | $10.18 | -$4.69 | -$6.30 | easy (1008) | DigiKey + hand-solder |
| L2, L3, L5, L6 | 4 | C2044861 / LQW2UASR15F00L | Exact MPN | 490-16089-1-ND | LQW2UASR15F00L | Cut Tape (CT) | 8857 | 20 / 20 | $0.34 | $6.80 | 40 / 40 | $0.34 | $13.60 | $9.53 | $16.00 | -$2.73 | -$2.40 | easy (1008) | DigiKey + hand-solder |
| L7 | 1 | C2043161 / LQW2UAS33NG0CL | Substitute | 490-LQW2UAS33NG00LCT-ND | LQW2UAS33NG00L | Cut Tape (CT) | 1012 | 5 / 5 | $0.22 | $1.10 | 10 / 10 | $0.18 | $1.79 | $4.71 | $6.34 | -$3.61 | -$4.55 | easy (1008) | DigiKey + hand-solder |
| L8, L9 | 2 | C703709 / LQW2UAS68NG00L | Exact MPN | 490-LQW2UAS68NG00LCT-ND | LQW2UAS68NG00L | Cut Tape (CT) | 1498 | 10 / 10 | $0.18 | $1.79 | 20 / 20 | $0.18 | $3.58 | $4.80 | $6.53 | -$3.01 | -$2.95 | easy (1008) | DigiKey + hand-solder |
| R7 | 1 | C137768 / RC0603FR-0722K1L | Exact MPN | 311-22.1KHRCT-ND | RC0603FR-0722K1L | Cut Tape (CT) | 419047 | 5 / 5 | $0.10 | $0.50 | 10 / 10 | $0.03 | $0.28 | $3.13 | $3.13 | -$2.63 | -$2.85 | easy (0603) | DigiKey + hand-solder |
| R8 | 1 | C2933225 / FRC0603F4752TS | Substitute | RMCF0603FT47K5CT-ND | RMCF0603FT47K5 | Cut Tape (CT) | 189276 | 5 / 5 | $0.10 | $0.50 | 10 / 10 | $0.02 | $0.21 | $3.11 | $3.11 | -$2.61 | -$2.90 | easy (0603) | DigiKey + hand-solder |
| SW1 | 1 | C255515 / EC11E18244A5 | Exact MPN | 4809-EC11E18244A5-ND | EC11E18244A5 | Tray | 1118 | 5 / 5 | $4.62 | $23.08 | 10 / 10 | $4.32 | $43.24 | $15.17 | $23.96 | $7.91 | $19.28 | easy (THT) | Keep at JLC |
| SW2, SW3, SW4 | 3 | C2837537 / KH-6X6X11H-STM | Not in catalog | — | — | — | — | — | — | — | — | — | — | $3.64 | $4.21 | — | — | moderate (6×6 SMD) | Keep at JLC |
| U1, U5 | 2 | C16085 / LP2985AIM5-3.3/NOPB | Exact MPN | LP2985AIM5-3.3/NOPBCT-ND | LP2985AIM5-3.3/NOPB | Cut Tape (CT) | 39275 | 10 / 10 | $0.51 | $5.12 | 20 / 20 | $0.51 | $10.24 | $8.80 | $14.53 | -$3.68 | -$4.29 | moderate (SOT-23-5) | Keep at JLC |
| U2 | 1 | C504891 / SI5351A-B-GTR | Exact, 0 stock | 336-3908-1-ND | SI5351A-B-GTR | Cut Tape (CT) | 0 | 5 / — | — | — | 10 / — | — | — | $9.03 | $13.51 | — | — | harder (MSOP-10) | Keep at JLC |
| U3 | 1 | C969151 / CP2102N-A02-GQFN24R | Exact, 0 stock | 336-5888-1-ND | CP2102N-A02-GQFN24R | Cut Tape (CT) | 0 | 5 / — | — | — | 10 / — | — | — | $12.99 | $20.39 | — | — | harder (QFN-24) | Keep at JLC |
| U4 | 1 | C3234898 / ATTINY3226-SU | Substitute | 150-ATTINY3226-SF-ND | ATTINY3226-SF | Tube | 641 | 5 / 5 | $1.35 | $6.75 | 10 / 10 | $1.35 | $13.50 | $17.23 | $27.15 | -$10.48 | -$13.65 | easy (SOIC-20W) | DigiKey + hand-solder |
| X1 | 1 | C48888230 / OW2EL89CENUXK7YLC-25M | Not in catalog | — | — | — | — | — | — | — | — | — | — | $7.14 | $9.65 | — | — | easy (4-pad 3225) | Keep at JLC |

## Notes on substitutes and special cases

- **C101, C121** (CC0603FRNPO9BN330): Exact Yageo MPN is Active on DigiKey but cut-tape stock is only 2 (not enough for 5 or 10 boards). Substitute: 33 pF 50 V C0G ±1% 0603, equal specs, 71,759 in stock.

- **C102, C122** (CC0603FRNPO9BN750): Exact Yageo MPN is listed but cut-tape stock is 0. Cheapest in-spec 0603 1% C0G substitute found. Saves a little at 5 boards, costs more than JLC+fee at 10 boards. Keep at JLC.

- **C104, C124** (CC0603FRNPO9BN430): Exact Yageo MPN is listed but cut-tape stock is 0. In-stock 0603 1% C0G substitutes are 250 V RF parts and cost more than JLC parts+fee at both 5 and 10 boards. Keep at JLC.

- **C105, C125** (CC0603FRNPO9BN390): Exact Yageo MPN is listed but cut-tape stock is 0. Substitute: 39 pF 50 V C0G ±1% 0603, AEC-Q200. Saves about $1.64 at 5 boards; about $0.25 more than JLC+fee at 10 boards. Optional if you are already hand-soldering the other filter caps and building 5.

- **C142** (0603CG240G500NT): Exact MPN 0603CG240G500NT is not in the DigiKey catalog. Substitute is better: Yageo 24 pF 50 V C0G ±1% 0603 (tighter than the BOM ±2%).

- **C145** (CC0603GRNPO9BN160): Exact ±2% BOM MPN is in stock. Optional upgrade if hand-soldering: the ±1% Yageo CC0603FRNPO9BN160 (13-CC0603FRNPO9BN160CT-ND), 3,580 cut-tape, $0.19@1 / $0.103@10 — the 1% part JLC could not fill.

- **D1** (SP0503BAHTG): Exact MPN was a 404 on /productdetails; keyword search found the same Littelfuse MPN under F2715CT-ND (non-Marketplace). Exact part is on DigiKey, but cut-tape costs more than JLC parts+fee, and SOT-143 is fiddly to hand-solder. Keep at JLC.

- **D4** (SD101AW-7-F): Exact Diodes Inc SD101AW-7-F is Active in the catalog (SD101AW-7FDICT-ND) but cut-tape stock is 0. Substitute is the same SD101AW type: 60 V, 15 mA, 200 nA @ 50 V, 1 V @ 15 mA, SOD-123. Alternate in-stock: previous BOM part 1N5711W-7-F (1N5711W-FDICT-ND), 70 V 15 mA SOD-123, 26,399 stock, $0.26@1 / $0.176@10; or Vishay SD101AW-E3-18 (30 mA, 13,100 stock).

- **J1** (HC-TYPE-C-16P-01A): Exact HCTL MPN is not in the DigiKey catalog. 16-pin Type-C receptacles are in stock (e.g. Amphenol 10171746-00021LF, Same Sky UJ20-C-H-C-3-SMT-TR, GCT USB4720-03-A) but footprints were not verified against the HCTL HC-TYPE-C-16P-01A land pattern. Do not substitute without a footprint check. Keep at JLC.

- **J5** (B-2100S04P-A110): Exact MPN B-2100S04P-A110 is not in the DigiKey catalog. Generic 1×4 2.54 mm vertical through-hole header, equivalent function. Confirm pin length vs the enclosure if it matters.

- **L1, L4** (LQW2UASR10G0CL): Exact MPN, but cut-tape stock is only 103. Enough for 10 or 20 pcs today; re-check before ordering 10 boards.

- **L7** (LQW2UAS33NG0CL): Exact LQW2UAS33NG0CL is listed but cut-tape stock is 0. Same LQW2UAS 33 nH 2% 1008 family (1 A, 140 mΩ, Q=60 @ 350 MHz); 00L vs 0CL is a packing/termination suffix. Tighter-tolerance option: LQW2UAS33NF00L (1%, 427 stock, $0.39@1 / $0.32@10).

- **R8** (FRC0603F4752TS): Exact FRC0603F4752TS is not in the DigiKey catalog. Closest Yageo RC0603FR-0747K5L is listed but cut-tape stock is 0. Substitute: 47.5 kΩ 1% 1/10 W 0603 thick film. Plenty of other in-stock 0603 1% options (KOA RK73H1JTTD4752F, Panasonic ERJ-3EKF4752V, Vishay CRCW060347K5FKEAC).

- **SW1** (EC11E18244A5): Exact part is in stock, but DigiKey is well above JLC parts+fee at both quantities ($23.08 vs $15.17 at 5; $43.24 vs $23.96 at 10). Keep at JLC (they already quote it as THT manual weld).

- **SW2, SW3, SW4** (KH-6X6X11H-STM): Exact KH-6X6X11H-STM is not in the DigiKey catalog. No in-stock DigiKey 6×6 mm SMD tactile with an 11 mm actuator was confirmed (hits were right-angle or the wrong height, e.g. Panasonic EVP-AT2L1B000 and C&K PTS645VH39-2 LFS). Keep at JLC so panel height stays correct. One unique LCSC, one $3.07 fee for all three switches.

- **U1, U5** (LP2985AIM5-3.3/NOPB): Exact part is in stock and a bit cheaper than JLC+fee (~$3.68 / $4.29), but that is 10 or 20 SOT-23-5s to hand-solder for a modest save. Keep at JLC unless you are already set up to reflow them.

- **U2** (SI5351A-B-GTR): Exact SI5351A-B-GTR and the tube SI5351A-B-GT are both Active in the catalog but DigiKey cut-tape / tube stock is 0. JLC has 9,730 of C504891. In-stock DigiKey Si5351A parts are the wrong package (QFN-20 SI5351A-B-GMR) or a factory-programmed MSOP (SI5351A-B02075-GT) — not a blank drop-in. Keep at JLC.

- **U3** (CP2102N-A02-GQFN24R): Exact GQFN24R (tape) and GQFN24 (tube) are listed but DigiKey stock is 0. JLC has 23,158. QFN-24 with an exposed pad is a poor hand-solder candidate even if stock returned. Keep at JLC.

- **U4** (ATTINY3226-SU): Exact ATTINY3226-SU (tube) is listed but DigiKey stock is 0. Substitute is the same SOIC-20W 7.50 mm MCU (32 KB flash, 3 KB RAM, 20 MHz, 1.8–5.5 V). SF is −40 to 125 °C (TA); SU is the industrial 85 °C packing of the same device — electrically a drop-in, equal or better temperature grade. Tape option: ATTINY3226-SFR (150-ATTINY3226-SFRCT-ND), 633 cut-tape, $1.45@1 / $1.3924@25.

- **X1** (OW2EL89CENUXK7YLC-25M): Exact YXC house MPN is not in the DigiKey catalog. No pin-safe, equal-or-better, in-stock substitute. CTS 525L25010ITR is a 25 MHz 3225 clipped-sine 3.3 V TCXO (689 stock, $3.22@1 / $2.796@10) but only ±1 ppm (worse than ±500 ppb). Jauch O 25,0-JTP32CSV-F-K-3,3-1510-1015-LF is ±280 ppb but is a VCTCXO (pin 1 is not NC); X1 pin 1 is tied to GND, so that part is not a safe drop-in, and it is $12.28@1. Keep the YXC part at JLC (375 in stock on the JLC pull).

## What was not priced here

- DigiKey and JLC tax, freight, and any Digi-Reel or reel MOQ.
- JLC bare-board, stencil, SMT/THT labor, X-ray, and attrition, which are unchanged if you only pull some Extended SMT lines.
- Hand-solder kit parts that are already outside the JLC BOM (SMA jacks, OLED, shield can).
- R20, now populated, is Basic C17414 and is not in this Extended list.

Sources: DigiKey Products v4, 19 Nov 2026, 1:53 PM Pacific; JLCPCB Economic feeder fee $3.07 from [JLCPCB assembly pricing](https://jlcpcb.com/help/article/pcb-assembly-price) (22 Oct 2026); JLC extended costs from `pricing.md` against the final `Si5351AVFO_BOM_JLC.csv`.
