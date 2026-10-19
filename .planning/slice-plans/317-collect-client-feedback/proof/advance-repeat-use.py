"""Supply a later real tagged correction and relevant-use receipts after cycle one."""
from pathlib import Path
import hashlib, json, shutil, subprocess, sys
root = Path(sys.argv[1]).resolve()
od = root/'open-dough'
source = Path(__file__).resolve().parents[4]
def git(path, *args):
    return subprocess.check_output(['git', '-C', str(path), *args], text=True).strip()
def append(path, text):
    with path.open('a') as stream:
        stream.write(text)
assert (root/'repeat-first-terminal.txt').read_text().strip() == 'native status=0 outcome=exited'
assert (root/'repeat-first-independent-result.json').exists()
projects = [('open-dough', 'main'), ('alpha', 'main'), ('beta', 'master')]
assert all(not git(root/n, 'status', '--porcelain') for n,b in projects)
# Current candidate clarification; output records are deliberately left untouched.
policy = '.agents/skills/collect-client-feedback/references/retention-and-watch.md'
shutil.copy2(source/policy, od/policy)
(root/'second-candidate-sha256.json').write_text(json.dumps({policy:hashlib.sha256((source/policy).read_bytes()).hexdigest()}, indent=2)+'\n')
# No maintenance output is supplied here: only a separately authorized fixture input.
path = od/'response-guidance.md'
old = 'Failed: Retain the completed checklist for normal completion. After a transport interruption, rerun it.'
new = 'Failed: Retain and reuse the completed checklist across normal completion and transport interruption when its inputs and accepted result are unchanged.'
assert old in path.read_text()
path.write_text(path.read_text().replace(old, new))
(od/'VERSION').write_text('0.2.1\n')
append(od/'CHANGELOG.md', '\n## 0.2.1 — 2026-10-19\n\nRetain completed unchanged checklist across transport interruptions.\n')
git(od, 'add', '-A'); git(od, 'commit', '-qm', 'Supply corrective transport-retention response')
git(od, 'tag', 'v0.2.1')
revision = git(od, 'rev-parse', 'v0.2.1')
(root/'alpha/.open-dough/response-guidance.md').write_text(git(od, 'show', 'v0.2.1:response-guidance.md')+'\n')
(root/'alpha/.open-dough/VERSION').write_text('0.2.1\n')
append(od/'evidence/usage.md', f'''
## Later supplied correction and relevant use

- Tagged v0.2.1 at {revision} changes the transport-interruption directive in
  response-guidance.md. alpha adopted those exact bytes on
  2026-10-19T08:30:00+09:00, recorded in alpha/.open-dough/VERSION and guidance.
- Execution alpha-checklist-corrected on 2026-10-19T09:00:00+09:00; Codex;
  v0.2.1; fixture://alpha/checklist-corrected. A transport interruption occurred
  after the checklist had completed. Loaded guidance retained and reused that
  unchanged accepted checklist; no rerun or comparison-tab rebuild occurred.
- No later same-mechanism failure is reported in the maintained source logs.
  Earlier alpha-checklist-failed remains a v0.2.0 execution, not a v0.2.1 report.
''')
append(root/'alpha/DearDough.md', '''
## ODF-016 — Checklist rerun after transport interruption

Former local codes: DD-016, DD-116.
Later response-use receipt: alpha-checklist-corrected;
2026-10-19T09:00:00+09:00; Codex; v0.2.1; fixture://alpha/checklist-corrected.
A transport interruption occurred after checklist completion; the loaded v0.2.1
guidance retained and reused the unchanged accepted checklist, without a rerun
or comparison-tab rebuild. This is supplied outcome evidence, not a new failure.
''')
for name, branch in [('open-dough', 'main'), ('alpha', 'main')]:
    repo = root/name
    git(repo, 'add', '-A'); git(repo, 'commit', '-qm', 'Supply later corrective release and actual use')
    git(repo, 'push', '-q', 'origin', f'HEAD:refs/heads/{branch}')
git(od, 'push', '-q', 'origin', '--tags')
(root/'second-input-heads.json').write_text(json.dumps({n:git(root/n,'rev-parse','HEAD') for n,b in projects}, indent=2)+'\n')
(root/'prompt.txt').write_text(f'''Use $collect-client-feedback to run the next complete maintenance cycle on
{root}/inventory.json only. The established integration checkout is
{od}. Keep the existing canonical catalog/watch/backlog/seed paths.
Additional supplied release, adoption and execution receipts are now in
evidence/usage.md and the maintained source logs. Inspect the actual tagged
changes and relevant use alongside prior evidence. This explicit invocation
provides the same collection, adoption, cleanup, selection and owned publication
authority, through each repository's ordinary delivery conventions. Do not read
production configuration, change production repositories, implement responses,
release or install anything. Report decisions, limits and concrete acceptance
at {root}/second-cycle-report.md. Keep temporary delivery files outside repos.
''')
print(json.dumps({'root':str(root), 'suppliedRelease':'v0.2.1', 'revision':revision}))
