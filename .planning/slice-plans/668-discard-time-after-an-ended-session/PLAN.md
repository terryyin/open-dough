# Discard a slice's clock time after its session ended

**Identity:** SEED-367#discard-time-after-an-ended-session
**Source:** [Selected story](../../seeds/SEED-367-bounded-slice-active-time.md#discard-time-after-an-ended-session)
**Source review:** [Independent source commitments](source-review.md)

## Execution context

- Established start, Story Branch Mode; owned workspace
  `/Users/terryyin/git/open-dough/.worktrees/discard-a-slice-s-clock-time-after-its-session-e`,
  branch `codex/discard-a-slice-s-clock-time-after-its-session-e`.
- Publisher `dashboard-territory.local-open-dough`, agent Kirara-chan;
  starting revision `6d18d69930a2daa5085a374b73c72f7c9ad710ca`;
  accepted Take/candidate `ad2e6f733dc41b7177bd39ab20fb7b0846f41146` on
  `origin/main`; increments target the remote execution branch. Claim CI is
  unobserved. No second claim or workspace creation.
- Slice 1 accepted `66ce0a60d6b5ae2f172667c174b0c1154ef6ba97` on
  `origin/codex/discard-a-slice-s-clock-time-after-its-session-e`, suffix base
  `ad2e6f733dc41b7177bd39ab20fb7b0846f41146`; same candidate, no rewrite;
  observer attachment reused. This is the next previously published base.
- Slice 2 accepted `06f162bebd4e0766f8cbc8f5d1da45e759b6b55f` on the same
  execution target; suffix base `66ce0a60d6b5ae2f172667c174b0c1154ef6ba97`,
  no rewrite, same observer. This supersedes the prior published base.
- Setup: Node v24.21.0; checkout-local `setup-native.mjs npm`, `browser`,
  and `check` passed, Chromium 158.0.8127.18; existing clock proof passed.
  Selective formatter is `npm run format`; check-only pre-commit runs staged
  lint and dashboard typecheck for script changes. No generation trigger.
- Replanning retains the selected plan's authority; scope changes need human
  judgment. Two bounded slices, no conflicting later destructive outcome:
  settling open timing intervals supports slice 2's new-session instruction.
- CI: GitHub Actions `terryyin/open-dough`, verified `ci.yml` (CI), story
  branch target. Coordinator `kirara-seed367`; yielded cell `g615:15`, session
  `64030`, directory `/tmp/dough-ci-501/watch-WclHzn`, PID `11477`.
  Runtime and checkout identity match. Reuse this observer for increments.

## Goal and scope

A coordinator starting in a new session settles the ended session's running
slice at that session's last clock command, so the slice limit reports no
idle-gap overrun and a different slice can start without `pause`. The source
owns the scope, exclusions and key examples. Nothing detects an ended session
by itself; work after the last clock command is not counted.

## Existing solution and architecture

PFE: the installed slice clock in
`Distribution/src/skills/dough-execute-plan/scripts/` already owns the record
(`slice-clock-record.mjs`), active-time arithmetic and overruns
(`slice-clock-slices.mjs`) and the CLI (`slice-clock.mjs`). Extend those; no new
script, installation entry or host hook change. The hook only reads under the
limit and stays out of the last-command time. All three files are under 200
lines; keep the settling rule in `slice-clock-slices.mjs` beside
`continueSlice` and `dropOverrunSlice`. No architectural concern or ADR applies.

## Current decisions

- `start --after-ended-session` names a new coordinator session. With a running
  slice it closes that slice's open period and every open command at the
  record's last clock command time, clears `running`, then starts the named
  slice as an ordinary `start`, combining with `--continues` and
  `--split-from`. With nothing running it is an ordinary `start`.
- The record gains a checkout-level last clock command time, written by
  `start`, `pause`, `status` and each `run`'s start and end. A record written
  before this field exists settles at its latest recorded period or command
  timestamp. Keep `schemaVersion` 1: the field is additive.
- A settled slice keeps any overrun already detected; settling never counts a
  new overrun by itself. The report of the started slice is the usual one.

## Proof ownership

| Source example | Slice and outside-in observation |
| --- | --- |
| Same slice resumed at 14:00 after last `status` at 10:00 with 9 minutes → 9 elapsed, 6 remaining, no overrun | 1: new `Distribution/tests/skills/dough-execute-plan/slice-clock-ended-session.test.mjs` drives the real CLI through `executionWorktree`'s time file |
| Different slice started as a new session without `pause` → slice 3 paused at 9, slice 4 at zero; plain `start` still refused | 1: same file; assert both reports and the refusal |
| Dead `run` from 10:02 → resumed at 14:00, `status` at 14:03 reports 11 elapsed | 1: same file; the `run`'s clock process is killed with SIGKILL before it records its end (extend the fixture to expose the child or a kill, as needed) |
| Previously paused slice resumed as a new session → same as plain `start` | 1: same file |
| Coordinator guidance starts with the option in a new session; pausing on stops unchanged | 2: behavior review under [author-open-dough-skills](../../../.agents/skills/author-open-dough-skills/SKILL.md#behavior-review) of the changed references |

## Decisive premises and preparation observations

Observed 2026-11-16 at `a1744fcb8eb674b7e185ff427a263712c622479f`, Node v24.21.0,
with the real `slice-clock.mjs` in scratch Git repositories under the job's
temporary directory and `DOUGH_SLICE_CLOCK_TIME_FILE` moving time.

| Premise / consuming operation | Result |
| --- | --- |
| A same-slice `start` after a dead session counts the idle gap; slice 1 | `start` 09:51, `status` 10:00, `start` same slice 14:00 → `elapsedMinutes` 249, `overrun: true`, `storyOverruns` 1. |
| A different slice is refused while the dead slice runs; slice 1 | `start --slice 4` at 14:00 → `slice 3 of S is running in this checkout; pause it first`, exit 1. |
| A dead `run` leaves an open command that hides later time; slice 1 | `run -- sleep 30` at 10:02, its node process killed with SIGKILL; record keeps `endedAt: null`. `start` at 14:00 and `status` at 14:03 both report 11 elapsed: time after 10:02 is excluded forever, so the clock can never overrun. |
| Focused proof route; slice 1 | `node --test Distribution/tests/skills/dough-execute-plan/slice-clock*.test.mjs` → 20 pass, 0 fail in this checkout without `node_modules`; `bash scripts/test.sh Distribution/tests/skills/dough-execute-plan/slice-clock.test.mjs` exits 0 silently. |

No premise remains assumed: the new behavior's proof is the new test file, which
fails today on each example by the observations above.

## Ordered slices

Each slice targets 15 active minutes, including its focused proof and cleanup.

### 1. Settle an ended session's running slice when a new session starts
Type: Behavior
Status: done
Proof: `slice-clock-ended-session.test.mjs`; all `slice-clock*.test.mjs`.

Behavior: a slice left running, possibly inside a dead `run`, by an ended
session → `start --after-ended-session` in a new session settles it at the last
clock command and starts the named slice; reports match the source examples.
Update the usage text in `slice-clock.mjs` and the record description.

### 2. Start in a new session with the ended-session option
Type: Behavior
Status: done
Proof: behavior review of the changed guidance; `slice-clock*.test.mjs` unchanged.

Behavior: a coordinator resuming execution in a new session → its first `start`
carries `--after-ended-session`, whether it resumes the running slice or starts
another. Edit [track active time](../../../Distribution/src/skills/dough-execute-plan/references/oversized-slice.md#track-active-time)
and the resume paragraph of
[continue or recover at an execution boundary](../../../Distribution/src/skills/dough-execute-plan/SKILL.md#continue-or-recover-at-an-execution-boundary);
the stop-time `pause` rule stays as written.

## Execution complete

Product advice: no change. The bounded clock outcome is delivered; retain the
existing diagnosis story's priority. No product correction or new story needed.

Retrospective: related published revisions are Take `ad2e6f733`, clock
`66ce0a60d6`, and guidance `06f162bebd`; earlier preparation is provenance,
other trunk work excluded. Original source examples and all 20 commitments
match inspected CLI/tests/guidance. No approval/scope change. Arithmetic,
record persistence and CLI remain cohesive. ADRs 0003/0005/0006 constrain
source-only authoring and representative behavior proof; no host integration
or installation contract changed. Unit tests at real CLI/persistence boundary
drive the outcome; no browser E2E needed, no obsolete or redundant existing
case found. Refactor/whitespace and 29-test evidence accepted, CI pending.

Process enabled by project config; coordinator conversation/tool results
support one additional ODF-329 occurrence in `DearDough.md` (334 physical
lines), no correction plan. Automatic Intent Coverage not selected: no existing
tests/assertions/discovery removed, relocated or weakened by the aggregate
change, and no unresolved important-proof concern. New cases were organized
before first publication, preserving all assertions. No deferred process review.

Older run 43848821204 for `66ce0a60d6` was superseded by run 43849681170 for
`06f162bebd`; all older jobs succeeded except cancelled ci-proof, with no failed
job. Same-branch workflow concurrency cancels superseded runs. Latest applicable
CI remains pending; completion operation owns the wait and shutdown.

## Concerns and cumulative design

Slice-plan refinement was not needed: two slices, one clock rule then the
guidance that triggers it, each with one proof loop. This review identified no
remaining slice-specific concern or human pre-Take decision.

## Local gates and execution discipline

Apply the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
as written. Before test edits apply the installed
[MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) selection; no browser
test is added. Keep default timeouts and never `test.slow()`. Run focused proof
with `bash scripts/test.sh Distribution/tests/skills/dough-execute-plan/` paths
of the `slice-clock*` files, or `node --test` on them for case output; full
suites stay in hosted CI. Local-gate sleep guard:
[machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos);
these runs take seconds, so start fully awake and wrap any longer run in
`caffeinate -s -i` on AC power.

## Learnings

### Slice 1 acceptance

Freshness unchanged at `0b60c6dac219e2f807bbb456b0e48f2b1c8f3bae`;
no named coordinating siblings. Independent source commitments 1–13 and 17–20
match the CLI implementation and inspected assertions in
`slice-clock-ended-session.test.mjs`. The fixture supplies real Git worktrees
and controlled time; the product performs settlement. The dead-run case kills
the actual wrapper, observes no exit file, then observes closed intervals at
10:02 and 11 elapsed/4 remaining at 14:03. All source examples are observed.

Proof (Node v24.21.0, awake macOS):

- `node Distribution/src/skills/dough-execute-plan/scripts/slice-clock.mjs run --log /tmp/seed367-slice1-clock-suite.log --exit-file /tmp/seed367-slice1-clock-suite.exit -- node --test Distribution/tests/skills/dough-execute-plan/slice-clock*.test.mjs`
  — 29 passed, 0 failed.
- `node Distribution/src/skills/dough-execute-plan/scripts/slice-clock.mjs run --log /tmp/seed367-slice1-clock-runner.log --exit-file /tmp/seed367-slice1-clock-runner.exit -- env PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh Distribution/tests/skills/dough-execute-plan/slice-clock*.test.mjs`
  — exit 0. Use Homebrew Bash 5; system Bash 3 cannot run the project runner.

Consumer trace: installed `consumer-trace.mjs --checkout "$PWD" --base ad2e6f733dc41b7177bd39ab20fb7b0846f41146 --term after-ended-session --term lastClockCommandAt --term settleEndedSession --term overrunDetectedAt`.
Clock CLI accounting, pause/isolation (`slice-clock.test.mjs`), continue/refusal
(`slice-clock-continues.test.mjs`), limits/split/count (`slice-clock-overrun.test.mjs`)
and host notifications (`slice-clock-hook.test.mjs`) ran with inspected result,
record and context assertions. New tests observe legacy fallback and hook
timestamp exclusion. Install declarations and hook entry points are unchanged;
dashboard SliceClock displays commit age and consumes no active-time record;
other planning/history trace matches do not consume this contract. Slice 2
owns the remaining guidance. No acceptance gaps.

An added test teardown initially read scratch state after deletion; it now
captures the PID and owns cleanup. The first runner invocation used system
Bash and was corrected to the maintained Bash 5 command above. Final proof is
green. Coordinator paused slice 1 at 5.6 active minutes, no overrun.

Independent refactor completed: removed a redundant overrun guard, moved five
compatibility cases into `slice-clock-ended-session-compatibility.test.mjs`,
and used existing deferred cleanup/awaited process teardown in the shared
fixture. Source-review paths 5 and 20 follow the moved assertions. Replacement
proof: the two literal commands above with log/exit basenames
`seed367-slice1-refactor-clock-suite` and `seed367-slice1-refactor-clock-runner`
passed (29/29, runner exit 0). Annotated trace at
`/tmp/seed367-slice1-refactor-consumer-trace.md` disposes every consumer; no gap.
All changed files remain under 250 formatted lines. Delivery freshness is
unchanged at the same trunk revision. No generation or project summary applies.

Guarded preparation initially refused six `no-param-reassign` findings; no
commit/publication occurred. Mechanical repair uses existing `Object.assign`
for the record updates, wholly within the accepted refactor's traced paths.
`node --test Distribution/tests/skills/dough-execute-plan/slice-clock*.test.mjs`
passed 29/29 after that repair. Refactor disposition: already traced; no new
representation, helper, dependency or path. Freshness rechecked unchanged.

### Slice 2 acceptance

Freshness unchanged at `f797a84026576c1dc4d1ccb1a080189cf090e7ea`.
Source commitments 14–16 match the inspected resume paragraph and Track active
time: first new-session `start --after-ended-session` for same/different slice;
last-command settlement, ordinary start with nothing running, and uncounted
later active time; existing stop/coordinator/human/CI `pause` bullet unchanged.
Behavior review walked same slice (9 elapsed/6 remaining), different slice
(prior paused at 9, next zero), and paused resume. No gap or new host discovery
requirement. Source skill is 250 lines, reference 129.

`node Distribution/src/skills/dough-execute-plan/scripts/slice-clock.mjs run --log /tmp/seed367-slice2-clock-suite.log --exit-file /tmp/seed367-slice2-clock-suite.exit -- node --test Distribution/tests/skills/dough-execute-plan/slice-clock*.test.mjs`
passed 29/29, no skips. Existing real CLI/time-file/Git fixture and direct
same/different/paused/dead-run assertions remain unchanged. Annotated trace at
`/tmp/seed367-slice2-consumer-trace-annotated.md` disposes execution, delegation,
CI resume, proof-wait and sizing readers via behavior walkthrough, clock
consumers via suite; installed copies, unchanged payload names and historical
or unrelated basename matches are excluded. Slice paused at 3.5 active minutes,
no overrun. No test or generated-artifact edit.
