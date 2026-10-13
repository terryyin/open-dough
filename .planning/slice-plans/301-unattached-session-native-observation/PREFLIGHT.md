# Native observation preflight and execution setup

Source: [plan 301](PLAN.md). These are historical preparation observations,
not native acceptance. Later correction versions are recorded with their own
journey evidence.

## Preparation checks

Preparation workspace:
`/Users/terryyin/git/open-dough/.worktrees/observe-an-unattached-start-session-on-the-nativ`,
revision `f5f850fde321956822b0f6e36fe52f172a67c5dd`, whose dashboard source
supplies the consumer. The observation projects are the five the dashboard is
configured with (`~/.open-dough/dashboard/projects-production.json`), at their
default checkouts under `~/git`: `open-dough`, `doughnut`, `pygardon`,
`terry-talks` and `lizard`. On 2026-10-13 the following fresh unpaid, read-only
prefix reached the consumer that decides whether non-default Start choices can
be offered, once per project path:

```sh
node --experimental-transform-types --input-type=module <<'JS'
import os from 'node:os';
import { establishesUnattached } from './dashboard/server/unattachedStart.ts';
for (const name of ['open-dough', 'doughnut', 'pygardon', 'terry-talks', 'lizard']) {
  const path = `${os.homedir()}/git/${name}`;
  for (const host of ['claude', 'codex', 'cursor']) console.log(JSON.stringify({name, host, available: await establishesUnattached({ path, shown: path }, host)}));
}
JS
```

Result: exit 0, `available: true` for all three hosts in each of the five
projects. No native process, workspace creation, assignment or publication was
attempted. This proves the capability consumer enables non-default choices for
those projects, not native behavior or visible control rendering.

`git ls-remote --tags origin 'v0.3.*'` identified `v0.3.60` as the highest
numeric release, with peeled revision
`f87b344806b899b1ef3d79bd8eaea013b63d3ad2`. Each project's default checkout was
clean and both of its installed version records read `0.3.60`. The following
read-only comparison against the tagged declaration returned `compared: 242,
mismatches: []` for both installed roots of every project:

```sh
python3 - <<'PYTHON'
import io, tarfile, subprocess, pathlib, json
release = 'v0.3.60'
data = subprocess.check_output(['git', 'archive', release])
with tarfile.open(fileobj=io.BytesIO(data)) as tar:
    declaration = tar.extractfile('install.sh').read().decode().split('managed_files=(\n', 1)[1].split('\n)', 1)[0]
    files = [line.strip() for line in declaration.splitlines() if line.strip()]
    for name in ['open-dough', 'doughnut', 'pygardon', 'terry-talks', 'lizard']:
        for root in ['.agents/skills', '.claude/skills']:
            base = pathlib.Path.home() / 'git' / name / root
            mismatches = [f for f in files if not (base / f).is_file() or (base / f).read_bytes() != tar.extractfile('src/skills/' + f).read()]
            print(json.dumps({'release': release, 'project': name, 'root': root, 'compared': len(files), 'mismatches': mismatches}))
PYTHON
```

These observations verify the complete tagged installation in each named
project; they do not prove native acceptance. Since the 2026-10-12 review,
`unattachedStart.ts`, `launchStart.ts`, the host adapters and the Start session
contract are unchanged apart from a link to launch editing by touch; later
source changes to shared skills are unreleased and outside the observed payload.

The inspected capability consumer checks three installed files: start, shared
session policy and formatter. It does not evaluate the full payload, native
skill consumption, path-identity handling or identity-free landing capture.
`available: true` is necessary to offer non-default choices, but the
operator must also identify the complete installed tagged release carrying the
story's required payload. The paid probe then settles native behavior. Do not
turn this observation into a new capability validator.

## Execution setup

Recorded 2026-10-13 at execution start (claim `8f3ba27c` on `main`, agent
`yilv-chan`, Story Branch Mode in the preparation workspace above).

- Observation project: Lizard, chosen by Terry at Take. Default checkout
  `/Users/terryyin/git/lizard`, branch `master`, remote `origin`
  (`git@github.com:terryyin/lizard.git`), target `master`.
- Rechecked the same day with the two commands above: `available: true` for
  all three hosts and `compared: 242, mismatches: []` for both installed roots
  of every configured project; `v0.3.60` is still the highest release.
- Dashboard: deployment `e40d6854c99b` serving `http://127.0.0.1:4173`;
  `git diff e40d6854 HEAD -- dashboard src` is empty in this workspace.
- Hosts: Claude Code 2.1.296, codex-cli 0.162.1, Cursor agent
  2026.10.01-e373342. Record each journey's model with its evidence.
- Fixture stories, drafted by the agent and published on Terry's instruction
  as Lizard `0128281` (`.planning/seeds/SEED-001-readme-accuracy.md`), all
  unassigned in its **Backlog list**:

  | Slice | Host and journey | Fixture |
  | --- | --- | --- |
  | 1 | Claude Code, isolated auto-land | `SEED-001#exit-code-wording` |
  | 2 | Codex, isolated auto-land | `SEED-001#python3-module-example` |
  | 3 | Cursor, isolated auto-land | `SEED-001#dead-travis-badge` |
  | 4 | Claude Code, isolated review then Dough Land | `SEED-001#research-section-wording` |
  | 5 | Claude Code, default-main refinement | `SEED-001#verified-python-versions` (not refined) |

- Baseline before slice 1: Lizard default checkout clean at `0128281`, equal
  to `origin/master`; no `.worktrees/` directory; two unrelated prunable
  worktrees under `/private/tmp`; no Lizard entry in the dashboard's
  `agent-launches.json`.
- After each journey the agent reads the Git, remote, launch-record and
  native-transcript evidence itself; Terry operates the paid session only.
