# Observe an unattached Start session on the native hosts

**Identity:** SEED-066#unattached-session-native-observation
**Source:** [selected story](../../seeds/SEED-066-composable-lightweight-session-options.md#unattached-session-native-observation)

## Goal and scope

Give the developer native evidence that Start session opens in the established
workspace and a later invoked workflow honors that workspace and landing intent
on Claude Code, Codex, and Cursor. Add the two review journeys Terry selected on
2026-10-11. An observation with no discrepancy changes no product behavior.

Five manually operated paid sessions: one isolated auto-land execution per
host, one isolated review execution followed by explicit landing on Claude
Code, and one default-main warning/refinement/review journey on Claude Code.
Run one initial attempt per journey; assess failure before agreeing a retry.
Agent work is preparation and assessment of supplied evidence, not running the
paid native sessions. The developer chooses the observation project from the
verified projects below, with its remote, queued fixture stories, host models,
and session time budget at execution setup; record actual paths, target,
versions and revisions before observation.

Excluded: creating a release, installing untagged source as managed skills,
new test runners, a full host-by-scenario matrix, native Default main auto-land,
and implementation of hypothetical defects. Optional timeout recovery and
parallel pending-session exploration stay optional and cannot replace required
coverage. A discovered discrepancy requires a bounded correction and affected
re-observation before closure; do not pre-plan unknown repairs. The
[start-leftovers correction](../../done/SEED-066_unattached-start-leftovers.json)
closed on 2026-10-11; its completion does not supply this story's native proof.

## Current decisions and prerequisite

Terry explicitly approved release first on 2026-10-11, as the seed recommended:
a context-specific exception to [ADR 0005 — Cross-tool validation](../../../docs/adrs/0005-cross-tool-validation-accepted.md).
The release makes the required installed payload available; acceptance remains
pending until this story's native evidence passes. The exception grants neither
a release version nor execution authority to this preparation.

**Observation project:** Terry names it and its publication target at Take,
from the five dashboard-configured projects whose complete tagged installation
and capability result are recorded below. Each already publishes to its own
configured remote and trunk. A project outside that set, or one whose installed
version record no longer reads `0.3.60`, repeats both checks against its actual
path before slice 1; a failing check leaves that project's native journeys
pending. The choice of project carries no unobserved premise.

[ADR 0003 — Release lifecycle](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
requires tagged payload;
[ADR 0004 — Client installation and update](../../../docs/adrs/0004-client-installation-and-update-accepted.md)
requires the complete locally installed release rather than copied individual
helpers; [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
requires evidence per affected host, distinguishes native behavior from
substitute processes, and owns evidence assessment and cleanup. Follow
[AGENTS.md](../../../AGENTS.md); do not hand-synchronize managed installations.
This plan introduces no architecture decision or runtime guidance change.

## Reused paths and decisive premises

PFE finds the observation route already exists: [Start session](../../../dashboard/LAUNCH-START.md#start-session),
`dashboard/server/unattachedStart.ts`, native adapters under
`dashboard/server/hosts/`, and the released form of
[Established session](../../../src/skills/dough-execute-plan/references/established-session.md).
The installed workflow start owns workspace reuse; one-shot execution/refinement
owns tracking and result disposition; Dough Land owns publication and retirement.
The [North Star host seam](../../NORTH-STAR.md#agent-launch-as-a-requested-assignment)
supports those existing homes.
Reuse these operations and their receipts; add no harness or parallel state store.
PFE rechecked these responsibilities against `unattachedStart.ts`, the source
`established-session.md` and `one-shot.md` on 2026-10-12. Review disposition
already closes queued work in the local result commit; remote backlog state
changes only when that commit lands. Judge these two locations separately.

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

The developer runs slice 1 as the early paid probe in the project named at
Take. Native instruction consumption, actual CWD, workflow
reuse, publication and retirement remain unobserved. A failed probe stops
its dependent journeys for assessment and correction; earlier native evidence
is reused only with a justified unchanged requirement and environment boundary.
Existing deterministic start/guidance specs prove their own boundaries and are
not offered as native proof.

## Outside-in proof ownership

Use a fresh native session per journey, with prompts naming the work rather
than supplying the expected answer. Observe the native transcript/tool activity,
Git worktree inventory and status, fetched remote history/backlog, dashboard
session workspace, and launch landing receipt. An agent's statement or exit 0
alone is insufficient. Retain concise judged evidence in this plan during
execution: requirement, host/runtime/model, dashboard revision, installed release,
project/workspace/target, fixture story, literal input, observed result and
relevant native/receipt references. Distinguish fresh evidence from justified
reuse; remove spent artifacts under ADR 0005 at closure.

| Promise | Owning slice and discriminating observation |
| --- | --- |
| Each native host opens the chosen isolated workspace, receives the block, and reuses it for a later workflow | 1–3: native CWD, first input and actual start receipt; exactly one workspace, no new assignment |
| A question alone claims, commits, pushes and completes nothing | 1–3: before/after Git and launch completion state |
| Auto-land honors launch intent without another landing request | 1–3: native workflow invocation omits landing flags; accepted result SHA, queued-story closure, original launch capture and retirement |
| Review retains the isolated result until requested | 4: local result commit includes closure, while remote still queues the story; explicit Dough Land publishes the result and closure, captures the original launch and retires the owned workspace |
| Default-main warning preserves input and work; refinement waits for review | 5: Back/Continue behavior, unchanged file at launch, same checkout and committed combined result after refinement, no push or new assignment |
| Older installations cannot offer unsupported choices | Preflight of each affected host: disabled controls and explanation; count only this guard as covered, leave native journey pending |
| Every discrepancy is resolved before closure | Owning failed slice stays unfinished; link bounded correction and its subsequent native result |

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

## Ordered slices

### 1. Claude Code consumes the isolated auto-land handoff
Type: Behavior
Status: planned
Proof: developer observes the source story's per-host steps 1–3 on Claude Code.

Behavior: with the prerequisite installed and a clean observation project,
Start session · Isolated workspace · Automatically land, no text → one session
workspace (normally `.worktrees/session`, collision suffix when needed) on the
host branch; native CWD and sidebar match; first input contains `workspace role:
isolated`, `landing: auto-land`, `startingRevision`, no `fetched`, and reporting
context with `--landing-context`; no initial publication or claim. Ask a
question → answer only. Invoke one-shot execution of the prepared trivial story
with the host's native skill syntax, without `--auto-land` → start reports
`prepared`, `created: false`, verified result lands with no extra request,
original launch capture has no story identity, story closes and worktree retires.

This is the first paid probe. Failure stops dependent paid observations until
its cause and affected boundaries are assessed. Success proves Claude Code
only. Safe stop preserves its judged evidence and leaves other hosts pending.

### 2. Codex consumes the same isolated auto-land intent
Type: Behavior
Status: planned
Proof: same complete journey as slice 1 in a fresh Codex session, using Codex's
native skill invocation syntax and a different queued fixture story.

Behavior: after the prerequisite and probe, repeat start → question → one-shot
execution → landing in Codex. Observe its own native CWD, instruction, start,
Git result and launch capture. Do not infer success from Claude Code. Safe stop
leaves Cursor and the review journeys pending.

### 3. Cursor consumes the same isolated auto-land intent
Type: Behavior
Status: planned
Proof: same complete journey as slice 1 in a fresh Cursor session with a distinct
fixture story, including visible instruction submission in its native terminal.

Behavior: start → question → one-shot execution → landing uses the established
Cursor workspace, not a host-created second worktree. Judge Cursor's own
instruction consumption, start receipt, result and original launch capture.
Safe stop retains three-host auto-land proof; review remains pending.

### 4. An isolated review result waits and later lands
Type: Behavior
Status: planned
Proof: source story's Claude Code isolated review journey; compare the remote
and owned workspace before review and after explicit Dough Land.

Behavior: Start session · Isolated workspace · Wait for review → established
`landing: review`; invoke one-shot execution without landing flags → verified
committed result and story closure stay in the same owned workspace; remote
trunk is unchanged and still queues the story. Explicitly invoke Dough Land →
the retained-result ownership recheck and landing publish that result and closure,
capture the original launch's
landing context and retire the owned workspace. A missing closure or unsolicited
push is a discrepancy, not permission to revise the expected behavior.

### 5. Default-main refinement preserves changes and waits for review
Type: Behavior
Status: planned
Proof: source story's Claude Code default-main warning plus refinement journey,
with a harmless existing file and an unassigned queued refinement fixture.

Behavior: default Start choices with text and an existing uncommitted file →
warning; Back preserves text; Continue opens the default checkout with that
file untouched and no Established session block. Invoke
`dough-story-refinement <identity> --one-shot --default-main` → same default
checkout, refined seed and existing file committed together, no Preparing or
Take, no push or retirement. The retained result and branch are available for
review. Explicit `--default-main` is essential because this launch sends no
block; the check proves the default path, not inherited block intent.

The operator retains the review result for a later explicit disposition; its
absence from published preparation is expected. Do not delete or publish it as
observation cleanup. Safe stop records the result and its location accurately.

## Review and execution gates

The sequence uses one established-session model and one proof loop per native
journey. No implementation structure is prescribed. Slice-plan refinement is
not needed: no fragmented outcome, duplicated implementation or unmapped promise
was identified. No blocking concern remains: the installed-payload premise is
observed in every configured project, and naming one of them with its fixture
stories is execution setup.
Paid host behavior is bounded by slice 1's early probe; it is not claimed settled.

Use the project's existing execution delivery/refactoring gates when execution
is authorized. No automated suite substitutes for the paid observations. For
this planning-only change, validate links, preparation records and whitespace;
normal commit hooks still run. Unknown defects return through the bounded
correction workflow and appropriate focused tests, without speculative repairs.
Do not mark the story complete while any required host, review journey, or
result-affecting discrepancy remains pending. No execution-complete record is
written during preparation.
