#!/usr/bin/env bash
# JLCPCB fab + PCBA outputs into PCB/production/. Fails on ERC/DRC errors other than the
# 15 accepted SMA edge-launch copper_edge_clearance hits (J2/J3/J4).
#
# DigiKey hand-solder split: symbols with the property JLC_PCBA=No are excluded from
# the JLC BOM and CPL by the post-filter below. They are NOT marked DNP, so ERC,
# copper, solder paste, and the board remain unchanged. Buy those parts from the
# DigiKey cart in digikey/vfo-digikey-cart-qty10.txt and solder them after assembly.
set -euo pipefail
cd "$(dirname "$0")/.."
B=PCB/Si5351AVFO; O=PCB/production; G=$O/gerbers
rm -rf "$O"; mkdir -p "$G"
kicad-cli sch erc -o $O/erc.rpt --format report --units mm --severity-warning --severity-error --exit-code-violations $B.kicad_sch
kicad-cli pcb drc -o $O/drc.rpt --format report --units mm --severity-warning --severity-error --refill-zones --schematic-parity $B.kicad_pcb
n=$(grep -c '^\[' $O/drc.rpt || true); e=$(grep -c '^\[copper_edge_clearance' $O/drc.rpt || true)
[ "$n" = 15 ] && [ "$e" = 15 ] || { echo "DRC: unexpected violations ($n total)"; exit 1; }
kicad-cli pcb export gerbers -o $G --layers F.Cu,In1.Cu,In2.Cu,B.Cu,F.Paste,B.Paste,F.SilkS,B.SilkS,F.Mask,B.Mask,Edge.Cuts \
  --subtract-soldermask --precision 6 --no-protel-ext $B.kicad_pcb
kicad-cli pcb export drill -o $G/ --format excellon --drill-origin absolute --excellon-units mm \
  --excellon-zeros-format decimal --excellon-separate-th $B.kicad_pcb
kicad-cli sch export bom -o $O/raw_bom.csv \
  --fields 'Value,Reference,Footprint,LCSC,JLC_PCBA,${DNP},${EXCLUDE_FROM_BOM}' \
  --labels 'Comment,Designator,Footprint,LCSC,JLC_PCBA,DNP,EXB' \
  --group-by 'Value,Footprint,LCSC,JLC_PCBA,${DNP}' --sort-field Reference --exclude-dnp $B.kicad_sch
python3 - "$O" <<'P'
import csv, re, sys
o = sys.argv[1]

def jlc_no(val):
    return (val or '').strip().lower() in {'no', 'n', 'false', 'digikey'}

def expand_refs(s):
    out = []
    for p in [x.strip() for x in s.split(',') if x.strip()]:
        m = re.fullmatch(r'([A-Za-z]+)(\d+)\s*-\s*\1(\d+)', p)
        if m:
            pre, a, b = m.group(1), int(m.group(2)), int(m.group(3))
            if a > b:
                a, b = b, a
            out.extend(f'{pre}{i}' for i in range(a, b + 1))
        else:
            out.append(p)
    return out

rows = list(csv.DictReader(open(o + '/raw_bom.csv')))
w = csv.writer(open(o + '/Si5351AVFO_BOM_JLC.csv', 'w', newline=''))
w.writerow(['Comment', 'Designator', 'Footprint', 'LCSC Part #'])
jlc_refs = set()
for x in rows:
    # Post-filter: JLC_PCBA=No means the part is ordered from DigiKey and hand-soldered.
    if jlc_no(x.get('JLC_PCBA')):
        continue
    if x.get('DNP') or x.get('EXB'):
        continue
    if not (x.get('LCSC') or '').strip():
        continue
    refs = expand_refs(x['Designator'])
    # JLC does not understand KiCad ranges like C4-C6; write every designator out.
    w.writerow([x['Comment'], ','.join(refs), x['Footprint'].split(':')[-1], x['LCSC']])
    jlc_refs.update(refs)
open(o + '/jlc_refs.txt', 'w').write('\n'.join(sorted(jlc_refs, key=lambda r: (re.match(r'[A-Za-z]+', r).group(), int(re.search(r'\d+', r).group())))) + '\n')
P
# JLC flags one LCSC part on several BOM lines (e.g. SW2-SW4 with different values); merge by LCSC.
python3 - "$O" <<'M'
import csv, sys
p = sys.argv[1] + '/Si5351AVFO_BOM_JLC.csv'
rows = list(csv.reader(open(p))); out = []; idx = {}
for r in rows[1:]:
    if r[3] in idx: out[idx[r[3]]][1] += ',' + r[1]
    else: idx[r[3]] = len(out); out.append(list(r))
w = csv.writer(open(p, 'w', newline='')); w.writerow(rows[0]); w.writerows(out)
M
rm $O/raw_bom.csv
kicad-cli pcb export pos -o $O/raw_pos.csv --format csv --units mm --side both --exclude-dnp $B.kicad_pcb
python3 - "$O" <<'P'
import csv, sys
o = sys.argv[1]
jlc_refs = {line.strip() for line in open(o + '/jlc_refs.txt') if line.strip()}
w = csv.writer(open(o + '/Si5351AVFO_CPL_JLC.csv', 'w', newline=''))
w.writerow(['Designator', 'Mid X', 'Mid Y', 'Layer', 'Rotation'])
for x in csv.DictReader(open(o + '/raw_pos.csv')):
    if x['Ref'].startswith('FID'):
        continue
    if x['Ref'] not in jlc_refs:
        continue
    if x['Ref'] == 'SW1':
        # EC11E footprint origin is pin A; JLC's model is body-centred and turned 90 deg.
        # Body centre is +7.5 mm X, +2.5 mm Y from pin A (KiCad Y down = more negative here).
        x['PosX'] = f"{float(x['PosX']) + 7.5:.6f}"; x['PosY'] = f"{float(x['PosY']) - 2.5:.6f}"
        x['Rot'] = f"{(float(x['Rot']) + 90) % 360:.6f}"
    w.writerow([x['Ref'], x['PosX'] + 'mm', x['PosY'] + 'mm', 'Top' if x['Side'] == 'top' else 'Bottom', x['Rot']])
P
rm -f $O/raw_pos.csv $O/jlc_refs.txt
python3 -c "import zipfile,os,sys;g=sys.argv[1];z=zipfile.ZipFile(sys.argv[2],'w',zipfile.ZIP_DEFLATED);[z.write(os.path.join(g,f),f) for f in sorted(os.listdir(g))]" $G $O/Si5351AVFO_gerbers_JLC.zip
echo done
