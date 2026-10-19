"""Inspect native-created records and real accepted Git contents, not self-report."""
from pathlib import Path
import json, re, subprocess, sys
root, phase = Path(sys.argv[1]).resolve(), sys.argv[2]
projects = [('open-dough', 'main'), ('alpha', 'main'), ('beta', 'master')]
od = root/'open-dough'
def git(path, *args):
    return subprocess.check_output(['git', '-C', str(path), *args], text=True).strip()
def remote(name, *args):
    return subprocess.check_output(['git', '--git-dir', str(root/f'{name}.git'), *args], text=True).strip()
def snapshot():
    state = {}
    for name, branch in projects:
        repo = root/name
        head = git(repo, 'rev-parse', 'HEAD')
        assert remote(name, 'rev-parse', f'refs/heads/{branch}') == head, name
        assert not git(repo, 'status', '--porcelain'), name
        for path in git(repo, 'ls-files').splitlines():
            # Check actual tracked bytes at the origin, including all record removals.
            assert (repo/path).read_bytes() == subprocess.check_output(['git', '--git-dir', str(root/f'{name}.git'), 'show', f'{head}:{path}']), (name, path)
        state[name] = {'head':head, 'tree':git(repo,'rev-parse','HEAD^{tree}'), 'count':git(repo,'rev-list','--count','HEAD')}
    return state
state = snapshot()
gaps = []
if phase == 'replay':
    assert (root/'replay-terminal.txt').read_text().strip() == 'native status=0 outcome=exited'
    calls = []
    for line in (root/'replay-transcript.jsonl').read_text().splitlines():
        content = json.loads(line).get('message',{}).get('content',[])
        calls.extend(block for block in content if block.get('type') == 'tool_use')
    assert any(call.get('name') == 'Skill' and call.get('input',{}).get('skill') == 'collect-client-feedback' for call in calls)
    commands = [call.get('input',{}).get('command','') for call in calls]
    assert any('.agents/skills/collect-client-feedback/SKILL.md' in command for command in commands)
    assert any('retention-and-watch.md' in command for command in commands)
    before = json.loads((root/'repeat-second-independent-result.json').read_text())['accepted']
    assert state == before, 'unchanged repeat changed commits, trees or accepted refs'
    report = {'result':'pass', 'phase':phase, 'accepted':state, 'unchanged':True}
else:
    label = 'repeat-first' if phase == 'first' else 'repeat-second'
    assert (root/f'{label}-terminal.txt').read_text().strip() == 'native status=0 outcome=exited'
    records = od/'docs/maintainer/findings'
    index = (od/'docs/maintainer/finding-names.md').read_text()
    watch = (od/'docs/maintainer/near-term-watch-list.md').read_text()
    logs = {n:(root/n/'DearDough.md').read_text() for n,b in projects}
    backlog = (od/'.planning/PRODUCT-BACKLOG.md').read_text()
    seed = (od/'.planning/seeds/SEED-001-feedback.md').read_text()
    initial_od = json.loads((root/'initial-heads.json').read_text())['open-dough']
    assert backlog.strip() == remote('open-dough','show',initial_od+':.planning/PRODUCT-BACKLOG.md')
    assert seed.strip() == remote('open-dough','show',initial_od+':.planning/seeds/SEED-001-feedback.md')
    for code in ['001','002','003','011','013','014','015','016','017','019','020','021']:
        assert (records/f'ODF-{code}.md').exists(), code
        assert f'ODF-{code}' in index, code
    # These removed identities are recoverable from the accepted pre-cycle history.
    for code in ['004','018']:
        assert not (records/f'ODF-{code}.md').exists(), code
        assert f'ODF-{code}' not in index + ''.join(logs.values()), code
        if f'ODF-{code}' in watch:
            if phase == 'first' and code == '004':
                gaps.append('Retired ODF-004 summary remains in maintained watch list')
            else:
                raise AssertionError(f'Obsolete retired reference ODF-{code} in watch list')
        initial = json.loads((root/'initial-heads.json').read_text())['open-dough']
        assert f'ODF-{code}' in remote('open-dough', 'show', f'{initial}:docs/maintainer/findings/ODF-{code}.md')
    # Low impact alone must not sever unfinished reciprocal work.
    for code, anchor in [('020','clarify-receipt-label'), ('021','clarify-maintenance-annotation')]:
        record = (records/f'ODF-{code}.md').read_text()
        assert anchor in record and f'ODF-{code}' in seed and anchor in backlog
        assert sum(f'ODF-{code}' in text for text in logs.values()) == 1
    taken = backlog.split('## Taken')[1].split('## Backlog list')[0]
    assert 'clarify-maintenance-annotation' in taken
    assert 'preserve-observations' in taken
    assert 'clarify-receipt-label' in backlog.split('## Backlog list')[1]
    assert 'od-severe' in (records/'ODF-003.md').read_text()
    assert 'beta-reread' in (records/'ODF-011.md').read_text()
    assert 'unknown' in (records/'ODF-015.md').read_text().lower()
    assert 'beta-unknown' in (records/'ODF-015.md').read_text()
    assert 'alpha-unused-old' in (records/'ODF-014.md').read_text()
    assert 'beta-format-old' in (records/'ODF-017.md').read_text()
    for code in ['014','015','017']:
        assert not re.search(rf'(?ms)^## ODF-{code}\b.*?(?=^## |\Z)', watch), f'{code} wrongly passed to watch'
    # Retired/pruned codes cannot be recycled for the historical returning issue.
    historical = (records/'ODF-019.md').read_text()
    assert 'beta-preview-old' in historical and 'beta-preview-new' in historical
    assert 'Implicit generated preview' in historical
    for path in records.glob('ODF-*.md'):
        if path.name != 'ODF-019.md':
            assert 'beta-preview-new' not in path.read_text(), path.name
    # One failure occurrence retains the distinct second effect before compaction.
    failure = (records/'ODF-016.md').read_text()
    failure_occurrences = [line for line in failure.splitlines() if 'occurrence:**' in line.lower() and 'alpha-checklist-failed' in line]
    assert len(failure_occurrences) == 1
    assert '30 minutes' in failure and '3 minutes' in failure and 'comparison' in failure
    assert logs['alpha'].count('alpha-checklist-failed') == 1
    assert 'DD-116' in logs['alpha'] and 'DD-016' in logs['alpha']
    original = remote('alpha','show',json.loads((root/'initial-heads.json').read_text())['alpha']+':DearDough.md')
    def local_only(text):
        return re.search(r'(?ms)^## DD-003\b.*?(?=^## |\Z)', text).group().strip()
    assert local_only(logs['alpha']) == local_only(original)
    # Preserve direction and relative order of the unrelated old queue suffix.
    assert 'Reduce observed agent execution waste while preserving user work.' in backlog
    assert backlog.index('avoid-repeating-checks') < backlog.index('unrelated-useful-work') < backlog.index('clarify-receipt-label')
    for name in ['alpha','beta']:
        installed = (root/name/'.open-dough/VERSION').read_text().strip()
        assert (root/name/'.open-dough/response-guidance.md').read_text() == git(od,'show',f'v{installed}:response-guidance.md')+'\n'
    if phase == 'first':
        assert not re.search(r'(?ms)^## ODF-016\b.*?(?=^## |\Z)', watch), 'failed response still on watch'
        assert 'alpha-checklist-corrected' not in failure
        changes = remote('open-dough','log','--format=%B',f"{json.loads((root/'initial-heads.json').read_text())['open-dough']}..HEAD")
        report_text = (root/'cycle-report.md').read_text()
        assert 'ODF-018' in changes + report_text, 'missing recoverable pruning reason'
    elif phase == 'second':
        entry = re.search(r'(?ms)^## ODF-016\b.*?(?=^## |\Z)', watch)
        assert entry, 'corrective response has no new watch entry'
        entry = entry.group()
        assert '2026-10-19T09:00:00+09:00' in entry and '2026-10-26T09:00:00+09:00' in entry
        assert 'v0.2.1' in entry and 'alpha-checklist-corrected' in entry
        assert '2026-10-08' not in entry, 'failed response age inherited'
        assert 'alpha-checklist-corrected' in failure
        first = json.loads((root/'repeat-first-independent-result.json').read_text())['accepted']
        assert state['beta'] == first['beta'], 'unchanged beta republished'
    else:
        raise ValueError(phase)
    commands = []
    for line in (root/f'{label}-transcript.jsonl').read_text().splitlines():
        item = json.loads(line).get('item', {})
        if item.get('type') == 'command_execution':
            commands.append(item.get('command',''))
    assert any('retention-and-watch.md' in command for command in commands)
    assert any('src/skills/dough-land/SKILL.md' in command for command in commands)
    report = {'result':'incomplete' if gaps else 'pass', 'gaps':gaps, 'phase':phase, 'accepted':state, 'removed':['ODF-004','ODF-018'], 'retainedEvidenceGaps':['ODF-015','ODF-014','ODF-017'], 'liveLinks':['ODF-020','ODF-021'], 'historicalIdentity':'ODF-019'}
(root/f'repeat-{phase}-independent-result.json').write_text(json.dumps(report, indent=2)+'\n')
print(json.dumps(report, indent=2))
if gaps:
    sys.exit(1)
