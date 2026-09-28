# Plan 139: Accept one-shot escalation natively on Claude Code

## Source

- Story: [Accept existing guidance natively on Claude Code](../../seeds/SEED-053-native-guidance-acceptance.md#native-acceptance-claude-code)
- Identity: SEED-028#native-one-shot-escalation

## Goal and scope

Learn whether a Claude Code agent notices that an explicitly selected, unlisted
one-shot attempt has grown and escalates it into tracked work instead of
landing it untracked (`publication/one-shot-escalation`). Carry, restore and
conflict mechanics already have credential-free tests in
`src/skills/dough-execute-plan/scripts/one-shot-escalation.test.mjs`; the native
run judges only the agent's recognition and choice.

Included: one unlisted escalation fixture, its prompt, observations and
assessor in the existing publication native harness; a credential-free
substitute journey with state counterexamples; bounded paid Claude Code runs.

Excluded: queued-story escalation, a developer stop, conflicting carried edits,
the `--no-replan` bug-fixing variant, Codex and Cursor, repeated runs or
statistics, and any change to the one-shot guidance itself. A failed run
reports a guidance defect for a separate decision; it is not fixed here.

Assumptions: paid native runs are manually triggered only. Each one needs
Terry's explicit go-ahead at execution time, and none joins `npm test`,
`scripts/test.sh`, CI, or a wrapper whose default calls a real host.

## Outside-in proof

| Promise | Owning slice | Observable proof |
| --- | --- | --- |
| The harness judges escalation from real origin, workspace and transcript state | 1 | `tests/git-publication-native.sh` (credential-free default): substitute `publication/one-shot-escalation` passes and each state counterexample yields its expected fail or inconclusive |
| A fixture exercises escalation without the prompt supplying growth, or the exit is taken | 2 | Retained `--results-dir` observations and transcript from at most three paid runs, classified pass, fail or inconclusive by the slice 1 assessor |
| Accepted escalation evidence, or the exit, is recorded in the host stories | 2 | SEED-053 diff: Claude Code evidence line with guidance revision and date, or the escalation case removed from all three host stories and the shared one-shot cases |

## Decisive premises

| Premise | Observation | Result |
| --- | --- | --- |
| The runner selects one-shot cases by name | `grep -n one-shot tests/support/git-publication-native-host.sh` | Line 141 lists `publication/one-shot-result \| publication/one-shot-queued`; a new case name is added there |
| Existing one-shot support files are at the size limit | `wc -l tests/support/git-publication-native-one-shot.sh tests/support/git-publication-native-assess.sh` | 249 and 250 lines; escalation needs its own support file (seed's harness limits) |
| The assessor already has an inconclusive outcome | `grep -n inconclusive tests/support/git-publication-native-assess.sh` | Lines 127, 154, 203, 237 set `git_publication_assess_status=inconclusive` |
| The carry path exists in the installed start CLI | `ls src/skills/dough-execute-plan/scripts/execution-start-carry.mjs`; `one-shot-escalation.test.mjs` line 34 | Present; deterministic test admits a grown unlisted attempt and restores its edits |
| Without planning authority an escalated attempt stops before planning | `src/skills/dough-execute-plan/references/one-shot.md` lines 149–153 | "without authority to plan, stop there before planning: report the Taken story, the evidence, and the edits restored uncommitted" — bounds the paid run |
| The native test job has room for one more substitute journey | `tests/time-budget`; seed records 52.2 s on CI | `per-job-seconds=71`; unconfirmed until CI measures slice 1 |
| A code-discovered growth fixture triggers escalation without a hint | Paid only | Probed in slice 2 |

## Ordered slices

### 1. Judge one-shot escalation from real state without a host

Type: Behavior
Status: done
Proof: `tests/git-publication-native.sh` credential-free default passes with the
escalation substitute journey and its counterexamples; CI's native job stays
within `per-job-seconds=71`.

Behavior: harness without an escalation case → the credential-free suite runs
`publication/one-shot-escalation` → a fixture builds a project with a code
path whose one-shot request reveals a separate outcome (for example, renaming a
configuration key that persisted user data still uses, with project docs
requiring a versioned migration); the substitute runs the installed
`execution-start.mjs --one-shot`, edits, then `--admit --carry` and stops before
planning; observations record the one-shot start, the admission start with
carry, a Taken entry for the new story on origin, no result commit on origin,
and the edits uncommitted in the claimed workspace; the assessor passes.
State counterexamples on the kept fixture: a result commit on trunk → fail; no
admission → fail; edits missing or committed → fail; admission with no prior
one-shot edits (admitted up front) → inconclusive; human edits changed → fail.

Put fixture, prompt, observation and assessment in new
`tests/support/git-publication-native-one-shot-escalation*` files, reusing the
one-shot fixture builder, push log and human-edit capture. The prompt names the
one-shot request, workspace, branch, publisher ID and publication authority. It
grants no planning authority and does not mention growth, migration or
escalation. If the substitute journey pushes the native job past
`per-job-seconds`, move the one-shot substitute journeys into their own test
job in this slice.

Accepted proof: `PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh
tests/git-publication-native.sh` exits 0. `run_substitute_one_shot_journey
one-shot-escalation` requires pass, and
`run_one_shot_escalation_state_counterexamples` in
`tests/support/git-publication-native-one-shot-escalation.sh` asserts each
verdict (result on trunk, no admission, edits missing, edits committed, human
edits changed → fail; up-front admission → inconclusive; restored → pass).
CI run 36379953372 measured the native job at 69.0 s against
`per-job-seconds=71` (main: 48.5–61.2 s), so the one-shot substitute journeys
moved to `tests/git-publication-native-one-shot.sh`, sharing
`prepare_substitute_hosts`; locally 58.3 s and 22.2 s.

### 2. Probe and accept escalation natively on Claude Code

Type: Behavior
Status: done
Proof: retained `tests/git-publication-native.sh --native claude --case
publication/one-shot-escalation --results-dir <dir>` observations, assessed
by slice 1's assessor, recorded in SEED-053.

Behavior: installed candidate at the current guidance revision → with Terry's
go-ahead, one paid Claude Code run (at most three, adjusting only the fixture
between runs, each after investigating the previous result) → one of:

- **pass:** record the run's guidance revision, date and outcome in the Claude
  Code story; the escalation case becomes available to Codex and Cursor.
- **fail** (the grown result landed untracked, or the agent asked before
  escalating): stop, record the evidence, and hand the guidance question to
  Terry; no guidance change here.
- **inconclusive three times, or no fixture avoids supplying the growth:** take
  the exit. Remove the native escalation case from the Codex and Cursor stories
  and from the shared one-shot cases in SEED-053, leaving deterministic tests
  and real use as the evidence.

Run 1 (2026-09-28, guidance at `0466e5ba`, results
`test-results/native-escalation-1`): inconclusive. The agent grepped `notesDir`,
read `docs/settings.md`'s migration rule before editing, started `--one-shot`,
then admitted with `--carry` carrying nothing and stopped before planning. The
assessor first reported fail because its workspace-edits check preceded the
not-exercised check; corrected so nothing carried is inconclusive. For run 2
the fixture drops the docs rule and pointer comment: the rule surfaces only
when the project command's released-settings check fails after the rename.

Run 2 (2026-09-28, guidance `23563ee0`, candidate `afa43926`, results
`test-results/native-escalation-2`): pass. The agent started `--one-shot`,
renamed the key, ran `node scripts/command.js`, saw the released-settings
failure, drafted and admitted `SEED-NOTES-DIRECTORY#rename-notes-dir` with
`--carry` without asking, and stopped before planning. Observations: one
trunk commit (the admission), no product paths on trunk, edits
`docs/settings.md,src/notes.mjs,src/settings.mjs` uncommitted over the claim,
human edits preserved. Recorded in SEED-053's Claude Code story.

## Current decisions

- The prompt withholds planning authority, so the guidance's own stop before
  planning ends the run; "no unnecessary approval stop" is judged as the agent
  running the admission with carry itself, without asking first.
- An up-front admission is inconclusive, never a pass.
- A single paid pass is the acceptance claim; it covers only the observed run.

## Learnings

- The native prompt is `git_publication_one_shot_escalation_prompt`: rename
  `notesDir` to `notesDirectory`; growth is discoverable only from
  `src/settings.mjs`'s comment and `docs/settings.md`.
- The assessor fails a run that publishes more than the admission claim, so a
  native run that plans past the stop fails rather than being inconclusive.
- Up-front admission is judged from the transcript (no `--one-shot` start or
  nothing carried); repository state cannot distinguish it.
