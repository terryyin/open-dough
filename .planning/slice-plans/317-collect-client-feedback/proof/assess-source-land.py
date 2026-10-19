"""Check source guidance / installed publisher composition and accepted content."""
from pathlib import Path
import json,subprocess,sys
root=Path(sys.argv[1]).resolve();od=root/'open-dough'
def git(path,*args):return subprocess.check_output(['git','-C',str(path),*args],text=True).strip()
result=json.loads((root/'publication-result.json').read_text())
assert result['ok'] and result['publication']=='accepted'
accepted=subprocess.check_output(['git','--git-dir',str(root/'open-dough.git'),'rev-parse','refs/heads/main'],text=True).strip()
candidate=result['receipt']['sha']
assert accepted==git(od,'rev-parse','HEAD')
subprocess.run(['git','--git-dir',str(root/'open-dough.git'),'merge-base','--is-ancestor',candidate,accepted],check=True)
assert git(od,'show',f'{candidate}:docs/maintainer/findings/ODF-001.md').count('od-check-new')==1
assert 'Former local code: DD-099.' in git(od,'show',f'{candidate}:DearDough.md')
assert set(git(od,'diff','--name-only',result['suffixBase'],candidate).splitlines())=={'DearDough.md','docs/maintainer/findings/ODF-001.md'}
assert not git(od,'status','--porcelain')
commands=[]
for line in (root/'source-land-transcript.jsonl').read_text().splitlines():
    d=json.loads(line);i=d.get('item',{})
    if d['type']=='item.completed' and i.get('type')=='command_execution':commands.append(i['command'])
assert any('src/skills/dough-land/SKILL.md' in c for c in commands)
assert any('src/skills/dough-land/references/publish-reviewed-checkout.md' in c for c in commands)
script=(root/'publish-cycle.mjs').read_text()
assert ".agents/skills/dough-execute-plan/scripts/execution-increment-publication.mjs'" in script
assert 'checkQueuedClosures' in script and 'onFetchedTarget:' in script
# The installed guide deliberately lacks the new caller contract: source route is real.
assert 'findings-maintenance' not in (od/'.agents/skills/dough-land/SKILL.md').read_text()
assert 'findings-maintenance' in (od/'src/skills/dough-land/SKILL.md').read_text()
for name in ['alpha','beta']:
    branch='main' if name=='alpha' else 'master'
    head=git(root/name,'rev-parse','HEAD')
    prior=json.loads((root.parent/'open-dough-feedback-317-slice1/first-independent-result.json').read_text())['receipts'][name]['accepted']
    assert head==prior,name
    assert not git(root/name,'status','--porcelain')
report={'result':'pass','sourceGuidance':'src/skills/dough-land/SKILL.md','helperRuntime':'.agents/skills','accepted':candidate,'target':'refs/heads/main','newOccurrence':'open-dough/od-check-new','unchangedClients':['alpha','beta']}
(root/'source-land-independent-result.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
