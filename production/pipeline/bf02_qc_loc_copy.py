import re,json,sys
s=open('/home/claude/montik-assets/remotion/src/bf02v2/BF02loc.tsx').read()
lines_blk=s.split('export const LINES')[1].split('\n};')[0]
for lang in ['it','hr']:
    blk=s.split('export const PACKS')[1].split(f'  {lang}: {{')[1].split('vo:')[0]
    L=lambda k: json.loads(re.search(k+r': (\[[^\]]*\]|"[^"]*")', blk).group(1))
    tiers=json.loads(re.search(r'tiers: (\[\[.*?\]\])', blk).group(1))
    pieces=[" ".join(L('hook'))," ".join(L('pop')),L('gift')," ".join(L('q'))," ".join(L('ans'))," ".join(L('shop'))+" "+" ".join(L('sel'))," ".join(L('k3a'))]+[f"{a} → {b}" for a,b in tiers]+[" ".join(L('v'))," ".join(L('kup'))," ".join(L('end')),L('cta')]
    lines=json.loads(re.search(lang+r': (\[.*?\])(,|$)', lines_blk.replace('\n',' ')).group(1))
    bad=[(a,b) for a,b in zip(pieces,lines) if a!=b]
    print(lang,'PASS' if not bad and len(pieces)==len(lines) else 'FAIL',len(pieces),bad)
