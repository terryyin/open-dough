"""Inspect the bounded native result files and independent bare-origin facts."""
from pathlib import Path
import json, re, subprocess, sys
root=Path(sys.argv[1]).resolve(); od=root/'open-dough'
def git(path,*args):
    return subprocess.check_output(['git','-C',str(path),*args],text=True).strip()
def section(text,heading):
    return text.split(heading,1)[1].split('\n## ',1)[0]
findings=od/'docs/maintainer/findings'
frequent=(findings/'ODF-001.md').read_text()
# Native judgment is separately reviewed; these check actual retained occurrences.
for execution in ['alpha-check-a','alpha-check-b','beta-check']:
    assert frequent.count(execution)==1,execution
assert '48 minutes' in frequent and '42 minutes' in frequent and '36 minutes' in frequent
assert 'unknown' in frequent
uncertain=[p for p in findings.glob('*.md') if 'beta-reread' in p.read_text()]
assert len(uncertain)==1 and uncertain[0].name!='ODF-002.md'
assert 'uncertain' in uncertain[0].read_text().lower()
assert int(uncertain[0].stem.split('-')[1])>=11
source_before=(root/'alpha-source-before.md').read_text()
source_after=(root/'alpha/DearDough.md').read_text()
assert section(source_before,'## DD-003 — Local stylesheet spelling')==section(source_after,'## DD-003 — Local stylesheet spelling')
assert 'alpha-css' not in '\n'.join(p.read_text() for p in findings.glob('*.md'))
assert len(re.findall(r'^## ODF-001 ',source_after,re.M))==1
assert source_after.count('Former local code: DD-001.')==1
backlog=(od/'.planning/PRODUCT-BACKLOG.md').read_text()
queued=re.findall(r'^- \[([^]]+)\]\(([^)]+)\)',section(backlog,'## Backlog list'),re.M)
assert [x[0] for x in queued]==['Preserve unrelated user files during maintenance publication','Avoid repeating accepted checks','Unrelated useful work']
assert 'preserve-observations' in section(backlog,'## Taken')
assert 'ODF-004' not in section(backlog,'## Backlog list')
assert 'containing release' in (findings/'ODF-004.md').read_text().lower()
for p in [od/'.planning/PRODUCT-BACKLOG.md',* (od/'.planning/seeds').glob('*.md'),*findings.glob('*.md'),od/'docs/maintainer/finding-names.md']:
    for href in re.findall(r'\]\(([^)]+)\)',p.read_text()):
        if '://' in href:continue
        target,_,anchor=href.partition('#');q=(p.parent/target).resolve()
        assert q.is_file(),(p,href)
        if anchor:assert f'id="{anchor}"' in q.read_text(),(p,href)
receipts={}
for name,branch in [('open-dough','main'),('alpha','main'),('beta','master')]:
    p=root/name; local=git(p,'rev-parse','HEAD')
    accepted=subprocess.check_output(['git','--git-dir',str(root/f'{name}.git'),'rev-parse',f'refs/heads/{branch}'],text=True).strip()
    assert local==accepted,(name,local,accepted)
    assert not git(p,'status','--porcelain'),name
    remote_log=subprocess.check_output(['git','--git-dir',str(root/f'{name}.git'),'show',f'{accepted}:DearDough.md'],text=True)
    assert remote_log==(p/'DearDough.md').read_text(),name
    receipts[name]={'target':f'refs/heads/{branch}','accepted':accepted,'count':git(p,'rev-list','--count','HEAD'),'tree':git(p,'rev-parse','HEAD^{tree}')}
# Evidence-only commit must precede the commit shortening source text.
commits=git(od,'log','--reverse','--format=%H','--','docs/maintainer/findings/ODF-001.md').splitlines()
assert len(commits)>=2
retention=commits[1]
assert 'alpha-check-a' in git(od,'show',f'{retention}:docs/maintainer/findings/ODF-001.md')
assert '## DD-001 — Unrelated files published' in git(od,'show',f'{retention}:DearDough.md')
(root/'first-independent-result.json').write_text(json.dumps({'assertions':'pass','receipts':receipts,'evidenceRetainedBeforeShortening':retention},indent=2)+'\n')
print(json.dumps({'result':'pass','origins':receipts,'retention':retention},indent=2))
