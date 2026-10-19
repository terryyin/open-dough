"""Disposable native fixture inputs; never perform maintenance for the agent."""
from pathlib import Path
import hashlib
import json
import shutil
import subprocess
import sys

source = Path(__file__).resolve().parents[4]
root = Path(sys.argv[1]).resolve()
root.mkdir(parents=True, exist_ok=False)


def git(path, *args):
    return subprocess.check_output(['git', '-C', str(path), *args], text=True).strip()


def write(path, content):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content)


projects = [('open-dough', 'main'), ('alpha', 'master')]
for name, branch in projects:
    repo = root/name
    subprocess.run(['git', 'init', '-q', '-b', branch, str(repo)], check=True)
    git(repo, 'config', 'user.name', 'Fixture maintainer')
    git(repo, 'config', 'user.email', 'fixture@example.invalid')
    # Existing installed runtime is supplied as fixture input, not installed by the run.
    shutil.copytree(source/'.agents/skills', repo/'.agents/skills')
    write(repo/'AGENTS.md', f'''# Isolated maintenance project
Project identity: {name}. Canonical shared feedback: DearDough.md. Canonical
project findings: notes/ProjectFindings.md. Backlog: .planning/PRODUCT-BACKLOG.md;
canonical seeds: .planning/seeds/SEED-NNN-<slug>.md, anchors identify stories.
Origin target: {branch}; the configured origin is a local bare fixture.
Use the maintained phase and landing guidance in the supplied Open Dough source;
resolve helper commands in this project's .agents/skills installed runtime.
No hooks, formatter or application tests apply to record maintenance. No selected
execution exists: this is ordinary maintenance, not implementation of Taken work.
When an owned worktree is needed use .worktrees/<descriptive-branch> under this
repository. Preserve unrelated work. Only fixture repositories are authorized.
''')
    write(repo/'notes/ProjectFindings.md', '# Project findings\n\nNo findings recorded yet.\n')
    write(repo/'tools/status-label.mjs', 'export function statusLabel(passed) { return passed ? "FAILED" : "PASSED"; }\n')
    write(repo/'docs/status-interface.md', 'A successful check must render PASSED; a failed check must render FAILED.\n')
    write(repo/'.open-dough/reported-guidance.md', '''# Shared execution guidance observed at untagged fixture revision G1
At every slice boundary rerun the whole check suite, even if the previous result
was accepted and the implementation and environment are unchanged.
# Shared landing guidance observed at untagged fixture revision G2
Stage and publish the entire current checkout, including unrelated pending files.
''')
    write(repo/'evidence/status.txt', f'''Execution {name}-status; 2026-10-16T10:00:00+09:00; Codex.
The project-owned tools/status-label.mjs rendered FAILED for true and PASSED for
false. docs/status-interface.md defines the opposite. An operator held a good
build for 25 minutes. Observed project code revision is the fixture input commit.
''')
    write(repo/'evidence/checks.txt', f'''Execution {name}-checks; 2026-10-17T10:00:00+09:00; Codex.
The unchanged suite was accepted, then ran again at three slice boundaries under
.open-dough/reported-guidance.md G1; 39 minutes of redundant execution.
Execution release: untagged fixture G1, not the installed runtime's version.
''')
    write(repo/'DearDough.md', f'''# Retrospective observations

## DD-101 — Status result reversed

Execution {name}-status, 2026-10-16T10:00:00+09:00, Codex; observed code revision
is fixture input. Evidence: [captured result](evidence/status.txt),
[implementation](tools/status-label.mjs), [required interface](docs/status-interface.md).
The good build was held for 25 minutes because its status was reversed.

## DD-102 — Accepted suite repeated

Execution {name}-checks, 2026-10-17T10:00:00+09:00, Codex, untagged guidance G1.
Evidence: [captured result](evidence/checks.txt),
[reported guidance](.open-dough/reported-guidance.md). Three redundant runs cost
39 minutes after acceptance with unchanged implementation and environment.
''')
    write(repo/'.planning/seeds/SEED-001-existing.md', '''---
id: SEED-001
status: seed
planted: 2026-10-01
---
# Existing project work

<a id="ongoing"></a>
### 1. Preserve observed transport locators
For agents, retain a known observation locator through transport interruptions.
This work is Taken and remains ongoing.

<a id="unrelated"></a>
### 2. Make established useful work visible
For maintainers, expose the existing unrelated outcome.
''')
    write(repo/'.planning/PRODUCT-BACKLOG.md', '''# Product backlog

## Near-future direction

Reduce demonstrated execution waste and protect user work.

## Taken

- [Preserve observed transport locators](seeds/SEED-001-existing.md#ongoing) — SEED-001#ongoing

## Backlog list

- [Make established useful work visible](seeds/SEED-001-existing.md#unrelated) — SEED-001#unrelated
''')

od = root/'open-dough'
shutil.copytree(source/'src/skills', od/'src/skills')
shutil.copytree(source/'docs/adrs', od/'docs/adrs')
# The wrapper's relative maintainer link resolves to the fixture guidance above.
write(od/'docs/maintainer/finding-names.md', '''# Finding names
Codes are permanent; highest allocated is ODF-003. Linked owners contain evidence
and dispositions. Use project plus execution identity for occurrences.

## ODF-001 — [Accepted checks repeated](findings/ODF-001.md) <a id="odf-001"></a>
## ODF-002 — [Transport locator lost](findings/ODF-002.md) <a id="odf-002"></a>
## ODF-003 — [Unrelated pending files published](findings/ODF-003.md) <a id="odf-003"></a>
''')
write(od/'docs/maintainer/findings/ODF-001.md', '''## ODF-001 — Accepted checks repeated
**Meaning:** Shared guidance requires repeating an accepted unchanged suite at
slice boundaries, wasting execution time.
**Response:** [Reuse accepted checks](../../../.planning/seeds/SEED-001-existing.md#reuse-checks), queued, not resolved.
''')
write(od/'docs/maintainer/findings/ODF-002.md', '''## ODF-002 — Transport locator lost
**Meaning:** Transport interruption discards a known observation locator.
**Response:** [Preserve observed transport locators](../../../.planning/seeds/SEED-001-existing.md#ongoing), Taken, ongoing, not resolved.
''')
write(od/'docs/maintainer/findings/ODF-003.md', '''## ODF-003 — Unrelated pending files published
**Meaning:** Shared whole-checkout landing guidance includes unrelated pending
user files without isolating the maintenance result.
**Response:** Open, unqueued.
''')
write(od/'docs/maintainer/near-term-watch-list.md', '# Response watch\n\nNo verified relevant exposure receipts supplied.\n')
with (od/'.planning/seeds/SEED-001-existing.md').open('a') as stream:
    stream.write('''
<a id="reuse-checks"></a>
### 3. Reuse accepted checks
For executing agents, reuse accepted checks while their implementation,
environment and promise remain unchanged. Addresses
[ODF-001](../../docs/maintainer/findings/ODF-001.md). On completion record the
actual response and containing release at ODF-001. This response is queued.
''')
with (od/'.planning/PRODUCT-BACKLOG.md').open('a') as stream:
    stream.write('- [Reuse accepted checks](seeds/SEED-001-existing.md#reuse-checks) — SEED-001#reuse-checks\n')
write(od/'evidence/unsafe-publication.txt', '''Execution od-publish; 2026-10-18T09:00:00+09:00; Claude Code;
untagged shared guidance G2. Following .open-dough/reported-guidance.md, the agent
staged and published a pending private user note with the maintenance records.
The user had to remove the note from the remote and investigate its exposure.
No local script or adaptation took part in this publication.
''')
with (od/'DearDough.md').open('a') as stream:
    stream.write('''
## DD-103 — Private note included in publication

Execution od-publish, 2026-10-18T09:00:00+09:00, Claude Code, untagged shared G2.
Evidence: [captured publication](evidence/unsafe-publication.txt),
[reported guidance](.open-dough/reported-guidance.md). The user removed an exposed
private note and investigated its exposure after the instructed publication.
''')

initial = {}
for name, branch in projects:
    repo = root/name
    git(repo, 'add', '-A')
    git(repo, 'commit', '-qm', 'Supply isolated combined-cycle inputs')
    bare = root/f'{name}.git'
    subprocess.run(['git', 'init', '--bare', '-q', str(bare)], check=True)
    git(repo, 'remote', 'add', 'origin', str(bare))
    git(repo, 'push', '-qu', 'origin', branch)
    subprocess.run(['git', '--git-dir', str(bare), 'symbolic-ref', 'HEAD', f'refs/heads/{branch}'], check=True)
    initial[name] = git(repo, 'rev-parse', 'HEAD')
    # Observes accepted commits and exact accepted record bytes without supplying behavior.
    hook = bare/'hooks/post-receive'
    write(hook, f'''#!/bin/sh
while read old new ref; do
  printf '%s %s %s\\n' "$old" "$new" "$ref" >> '{root}/{name}-accepted.txt'
done
''')
    hook.chmod(0o755)
    shutil.copy2(repo/'DearDough.md', root/f'{name}-shared-before.md')
write(root/'initial-heads.json', json.dumps(initial, indent=2)+'\n')
write(root/'inventory.json', json.dumps([
    {'id': name, 'localPath': str(root/name), 'ref': branch, 'origin': str(root/f'{name}.git')}
    for name, branch in projects], indent=2)+'\n')
write(root/'candidate-sha256.json', json.dumps({
    str(p.relative_to(source)): hashlib.sha256(p.read_bytes()).hexdigest()
    for p in [source/'.agents/skills/maintain-feedback-cycle/SKILL.md',
              source/'.agents/skills/collect-client-feedback/SKILL.md',
              source/'src/skills/dough-triage-project-findings/SKILL.md']}, indent=2)+'\n')
write(root/'prompt.txt', f'''Use $maintain-feedback-cycle at
{od}/.agents/skills/maintain-feedback-cycle/SKILL.md to run one combined project
and shared feedback maintenance cycle. The invocation authorizes both named
phases, canonical record/story/backlog updates, and ordinary owned maintenance
commit/integration/synchronization to each supplied fixture origin target.
Use only the isolated inventory {root}/inventory.json. Established Open Dough
integration checkout: {od}. Its catalog is docs/maintainer/finding-names.md and
linked owners, watch is docs/maintainer/near-term-watch-list.md, direction/backlog
is .planning/PRODUCT-BACKLOG.md, seeds are .planning/seeds/. Each project's
AGENTS.md supplies its canonical records and installed runtime conventions.
Use maintained local and landing source under {od}/src/skills/ with each selected
project established as target; use target-installed helpers, not copied Git logic.
This is an isolated native observation with local bare origins. Do not read
production inventory or access/mutate production repositories. Do not implement
responses, edit supplied skill files, release/install guidance or alter inventory.
There is no dashboard reporting context for this fixture. Keep temporary scripts
and reports outside the project repositories. Report actual record locations,
phase results, accepted SHA/target and limits at {root}/cycle-report.md, retaining
recovery facts outside workspaces a child may retire.
''')
print(root)
