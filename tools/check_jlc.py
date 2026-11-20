#!/usr/bin/env python3
"""Pre-handoff checks on the JLC BOM/CPL. Usage: check_jlc.py <repo root>"""
import csv, re, sys, subprocess, tempfile, os, math, collections
import pcbnew
root = sys.argv[1]; P = os.path.join(root, 'PCB'); O = os.path.join(P, 'production')
fails = []
def fail(m): fails.append(m); print('FAIL', m)
# schematic per-ref data
tmp = tempfile.mktemp(suffix='.csv')
subprocess.run(['kicad-cli','sch','export','bom','-o',tmp,'--fields','Reference,Value,MPN,LCSC,JLC_PCBA,${DNP}',
                '--group-by','','--exclude-dnp',os.path.join(P,'Si5351AVFO.kicad_sch')],check=True,capture_output=True)
sch = {r['Reference']: r for r in csv.DictReader(open(tmp))}
no = lambda v: (v or '').strip().lower() in {'no','n','false','digikey'}
expected = {r for r,x in sch.items() if not r.startswith('#') and x['LCSC'].strip() and not no(x['JLC_PCBA']) and not x['DNP']}
bom = list(csv.reader(open(os.path.join(O,'Si5351AVFO_BOM_JLC.csv'))))[1:]
cpl = list(csv.reader(open(os.path.join(O,'Si5351AVFO_CPL_JLC.csv'))))[1:]
# 1. designators one by one
allrefs = []
for c,d,f,l in bom:
    for t in d.split(','):
        t = t.strip()
        if not re.fullmatch(r'[A-Z]+\d+', t): fail(f'BOM designator token not a single ref: {t!r} ({c})')
        allrefs.append(t)
dup = [r for r,n in collections.Counter(allrefs).items() if n>1]
if dup: fail(f'designators on more than one BOM line: {dup}')
if set(allrefs) != expected: fail(f'BOM vs schematic: missing {sorted(expected-set(allrefs))}, extra {sorted(set(allrefs)-expected)}')
cplrefs = [r[0] for r in cpl]
if len(cplrefs)!=len(set(cplrefs)) or set(cplrefs)!=set(allrefs): fail(f'CPL vs BOM: missing {sorted(set(allrefs)-set(cplrefs))}, extra {sorted(set(cplrefs)-set(allrefs))}')
print(f'1. designators: {len(bom)} BOM lines, {len(allrefs)} refs, {len(cplrefs)} CPL rows, expected {len(expected)}')
# 2. same MPN on one line
mpn_lines = collections.defaultdict(set); lcsc_lines = collections.defaultdict(set)
for i,(c,d,f,l) in enumerate(bom):
    lcsc_lines[l].add(i)
    mp = {sch[r]['MPN'].strip() for r in d.split(',')}
    if '' in mp: fail(f'line {i+2} ({c}) has a ref with no MPN')
    if len(mp)>1: fail(f'line {i+2} ({c}) mixes MPNs {mp}')
    for m in mp: mpn_lines[m].add(i)
    lc = {sch[r]['LCSC'].strip() for r in d.split(',')}
    if lc != {l}: fail(f'line {i+2} LCSC {l} but schematic has {lc}')
for k,v in list(mpn_lines.items())+list(lcsc_lines.items()):
    if len(v)>1: fail(f'{k} on {len(v)} BOM lines {sorted(x+2 for x in v)}')
print(f'2. MPN/LCSC: {len(mpn_lines)} MPNs, {len(lcsc_lines)} LCSC numbers, one line each' if not any(len(v)>1 for v in list(mpn_lines.values())+list(lcsc_lines.values())) else '2. see failures')
# 3. CPL origin/rotation
b = pcbnew.LoadBoard(os.path.join(P,'Si5351AVFO.kicad_pcb'))
fps = {f.GetReference(): f for f in b.GetFootprints()}
CORR = {'SW1': (7.5, -2.5, 90)}  # export_fab.sh corrections (dx, dy in CPL frame, drot)
mm = pcbnew.ToMM
print('3. footprints whose origin is >0.25 mm from the pad-bbox centre:')
for r,x,y,side,rot in cpl:
    f = fps[r]; px, py = mm(f.GetPosition().x), -mm(f.GetPosition().y); kr = f.GetOrientationDegrees() % 360
    cx, cy, cr = float(x[:-2]), float(y[:-2]), float(rot)
    dx, dy, drot = CORR.get(r, (0,0,0))
    if abs(cx-(px+dx))>1e-3 or abs(cy-(py+dy))>1e-3 or abs(((cr-(kr+drot)+180)%360)-180)>1e-3:
        fail(f'{r} CPL ({cx},{cy},{cr}) != KiCad ({px},{py},{kr}) + correction {dx,dy,drot}')
    if (side=='Top') != (f.GetLayer()==pcbnew.F_Cu): fail(f'{r} side mismatch')
    L=[];R=[];T=[];B=[]
    for p in f.Pads():
        pb = p.GetBoundingBox(); L.append(pb.GetLeft()); R.append(pb.GetRight()); T.append(pb.GetTop()); B.append(pb.GetBottom())
    bx, by = mm((min(L)+max(R))/2), -mm((min(T)+max(B))/2)
    off = math.hypot(bx-px, by-py)
    if off > 0.25:
        coff = math.hypot(bx-cx, by-cy)
        print(f'   {r:5s} {f.GetFPID().GetLibItemName()}: origin {off:.2f} mm off pad centre; CPL point {coff:.2f} mm off pad centre; correction {"applied "+str(CORR[r]) if r in CORR else "none"}')
print('RESULT:', 'PASS' if not fails else f'FAIL ({len(fails)})')
sys.exit(1 if fails else 0)
