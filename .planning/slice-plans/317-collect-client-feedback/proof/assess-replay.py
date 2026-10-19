"""Inspect unchanged native replay and the actual Claude skill expansion."""
from pathlib import Path
import json, subprocess, sys
root=Path(sys.argv[1]).resolve()
before=json.loads((root/'replay-before.json').read_text())
after={}
for name in before:
    def git(*args):return subprocess.check_output(['git','-C',str(root/name),*args],text=True).strip()
    after[name]={'head':git('rev-parse','HEAD'),'tree':git('rev-parse','HEAD^{tree}'),'count':git('rev-list','--count','HEAD'),'status':git('status','--porcelain')}
    assert after[name]==before[name],name
    branch='master' if name=='beta' else 'main'
    remote=subprocess.check_output(['git','--git-dir',str(root/f'{name}.git'),'rev-parse',f'refs/heads/{branch}'],text=True).strip()
    assert remote==after[name]['head'],name
stream=[json.loads(l) for l in (root/'replay-transcript.jsonl').read_text().splitlines()]
init=next(d for d in stream if d.get('type')=='system' and d.get('subtype')=='init')
assert 'collect-client-feedback' in init['skills']
blocks=[b for d in stream if d.get('type')=='assistant' for b in d.get('message',{}).get('content',[])]
assert any(b.get('name')=='Skill' and b.get('input',{}).get('skill')=='collect-client-feedback' for b in blocks)
assert any(b.get('name')=='Bash' and 'cat .agents/skills/collect-client-feedback/SKILL.md' in b.get('input',{}).get('command','') for b in blocks)
assert not any(b.get('name')=='Bash' and 'git push' in b.get('input',{}).get('command','') for b in blocks)
terminal=next(d for d in reversed(stream) if d.get('type')=='result')
assert terminal.get('subtype')=='success' and not terminal.get('is_error',False)
result={'result':'pass','host':'claude','runtime':init['claude_code_version'],'model':init['model'],'skillInvocation':'thin pointer then canonical .agents source','unchanged':after}
(root/'replay-independent-result.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result,indent=2))
