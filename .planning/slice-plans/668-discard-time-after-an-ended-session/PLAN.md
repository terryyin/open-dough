# Discard a slice's clock time after its session ended

**Identity:** SEED-367#discard-time-after-an-ended-session
**Source:** [Selected story](../../seeds/SEED-367-bounded-slice-active-time.md#discard-time-after-an-ended-session)

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
Status: planned
Proof: `slice-clock-ended-session.test.mjs`; all `slice-clock*.test.mjs`.

Behavior: a slice left running, possibly inside a dead `run`, by an ended
session → `start --after-ended-session` in a new session settles it at the last
clock command and starts the named slice; reports match the source examples.
Update the usage text in `slice-clock.mjs` and the record description.

### 2. Start in a new session with the ended-session option
Type: Behavior
Status: planned
Proof: behavior review of the changed guidance; `slice-clock*.test.mjs` unchanged.

Behavior: a coordinator resuming execution in a new session → its first `start`
carries `--after-ended-session`, whether it resumes the running slice or starts
another. Edit [track active time](../../../Distribution/src/skills/dough-execute-plan/references/oversized-slice.md#track-active-time)
and the resume paragraph of
[continue or recover at an execution boundary](../../../Distribution/src/skills/dough-execute-plan/SKILL.md#continue-or-recover-at-an-execution-boundary);
the stop-time `pause` rule stays as written.

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

None beyond the preparation observations above.
