# Bound flaky-test and CI-failure diagnosis in evidence rounds

**Identity:** SEED-367#bound-diagnosis-in-evidence-rounds
**Source:** [Selected story](../../seeds/SEED-367-bounded-slice-active-time.md#bound-diagnosis-in-evidence-rounds)
**Source review:** [source-review.md](source-review.md)

## Goal and scope

Diagnosis whose cause is still unknown, either when a slice reaches its limit
or when an owned CI failure goes to a repair agent, runs in rounds of 15 active
minutes. The slice clock counts the rounds. One diagnosis record carries the
evidence across fresh contexts. Continuation needs progress or a change of
experiment kind. The cap is three rounds, then a human. The source owns the
scope, the record fields, the exclusions and the key examples. Required proof
conditions belong to the sibling story and are not planned here.

## Existing solution and architecture

PFE:

- **Slice clock.** `Distribution/src/skills/dough-execute-plan/scripts/`
  already measures active time per checkout, excludes `run` time, and tells
  the agent at the limit through the host hook. Extend it with diagnosis
  rounds; add no second timer.
- **Parking for CI repair.** `ci-repair-stash.mjs` already parks unfinished
  owned work for CI repair.
- **Durable resume state.** The plan already holds durable resume state, as
  [planning](../../../Distribution/src/skills/dough-story-refinement/references/planning.md#write-an-executable-plan)
  describes. The diagnosis record lives there.
- **Overrun evidence for quick execution.** Quick execution already writes
  overrun evidence under the executable-plan root, as
  [handle the overrun](../../../Distribution/src/skills/dough-execute-plan/references/oversized-slice.md#handle-the-overrun)
  describes. The diagnosis record for quick execution goes there too.
- **Diagnosis rules.** The current rules sit in
  [diagnose failed proof](../../../Distribution/src/skills/dough-execute-plan/references/execution-decisions.md#diagnose-failed-proof),
  which allows one retry for a stated explanation, and in
  [CI repair step 4](../../../Distribution/src/skills/dough-execute-plan/references/ci-monitor.md#handle-a-notification).
  One new reference, `diagnosis-rounds.md` in
  `dough-execute-plan/references/`, owns the rounds, the record, continuation
  and the stop. Those two places, the overrun handling, and the delegation
  brief link to it rather than restating it.

`slice-clock.mjs` has 199 lines. Put the round rules in a new
`slice-clock-diagnosis.mjs` beside `slice-clock-slices.mjs`. Keep each file
under 200 lines by moving command handling out of the CLI file where needed.
No ADR or North Star topic applies.

## Current decisions

- **Starting a round.** `start --identity ID --diagnosis NAME` starts the
  next round of that diagnosis:
  - The report adds the diagnosis name, the round number, the authorized
    round total and the cumulative active minutes.
  - The record keeps the rounds under the story, so every agent and resume in
    the checkout continues the same count.
  - `pause`, `status` and `run` apply to a running round as to a slice.
  - Only one slice or round runs at a time.
- **Round ends are not overruns.** A round at 15 minutes reports
  `overrun: true` with a round message, as the hook already relays. It does
  not add to `storyOverruns`, because a round ending is the design, not a
  sizing failure.
- **The cap.** Starting a round beyond the authorized total is refused. The
  default total is 3. `--rounds-authorized N` raises it only on a human's
  authorization, which the stop records. The clock never resets a
  diagnosis's rounds.
- **Continuation stays with the agent.** The clock does not judge the
  continuation condition. The agent judges it from the record, under the new
  reference.
- **Overlap with plan 668.** [Plan 668](../668-discard-time-after-an-ended-session/PLAN.md)
  is Taken and changes the same clock files. Execute slice 1 on trunk after
  668's slice 1 lands. If 668 is still unlanded at Take, start with slices 2
  and 3, which do not touch the clock. Slice 1 can then be prepared, but it
  lands only on top of 668's clock.

## Proof ownership

| Source example | Slice and outside-in observation |
| --- | --- |
| Three rounds end without a cause → stop reports 3 rounds and 45 minutes; a replacement agent continues at round 4 only if the human authorized more | 1: new `Distribution/tests/skills/dough-execute-plan/slice-clock-diagnosis.test.mjs` drives the real CLI through `executionWorktree`'s time file: three 15-minute rounds report rounds and cumulative minutes, a fourth `start` is refused, `--rounds-authorized 4` starts round 4 |
| Round ends are not sizing overruns (needed by every multi-round example) | 1: same file; after two full rounds, `storyOverruns` is unchanged, and the round report carries `overrun: true` |
| Flaky spec fixed within the slice → no record, no round | 2: behavior review; the slice rules are unchanged below the limit |
| Slice reaches 15 with an unexplained 2-in-10 failure → work parked, record written, round 1 in a fresh context | 2: behavior review of `diagnosis-rounds.md`, the overrun handling, and diagnose failed proof |
| 900 repetitions without a reproduction → round 2 starts for an instrument, stops for another repetition batch; refuted hypotheses without a reproduction and no narrowing → stops after round 2 | 2: behavior review of the continuation rule |
| A CI run states its hypothesis and stopping count; a rerun with no hypothesis is not started | 2: behavior review of `diagnosis-rounds.md` and diagnose failed proof |
| Owned CI failure: round 1 gets one natural reproduction → round 2 forces it → the fix runs on its own clock with the forcing as proof | 3: behavior review of CI repair step 4 and the delegation brief |

## Decisive premises and preparation observations

Observed on 2026-11-16 at `677e682453b33a7bd56c214e18946ead80bf420a`, with
Node v24.21.0. The real `slice-clock.mjs` ran in a scratch Git repository
under the job's temporary directory, with `DOUGH_SLICE_CLOCK_TIME_FILE`
moving time.

| Premise / consuming operation | Result |
| --- | --- |
| Can rounds run as ordinary slice keys? (slice 1) | Slice `4` ran 10:00–10:15. Round `4 diagnosis round 1` ran 10:15–10:30, and `4 diagnosis round 2` ran from 10:30 to 10:45. `storyOverruns` went 1 → 2 → 3. Ordinary keys would therefore trigger the [story-boundary reassessment](../../../Distribution/src/skills/dough-story-decomposition/references/problem-decomposition.md#size-and-escalate-slices) on round ends, and nothing would count or cap rounds. A diagnosis mode is needed. |
| Focused proof route (slice 1) | `node --test Distribution/tests/skills/dough-execute-plan/slice-clock*.test.mjs` gave 20 pass, 0 fail in this checkout. The clock scripts and tests are unchanged between `a1744fcb8` and fetched `origin/main` (empty `git diff --stat`). |
| Does CI repair run with no time bound today? (slice 3) | The [track active time](../../../Distribution/src/skills/dough-execute-plan/references/oversized-slice.md#track-active-time) text pauses the clock for CI repair. [CI repair step 4](../../../Distribution/src/skills/dough-execute-plan/references/ci-monitor.md#handle-a-notification) delegates to a fresh agent with no time limit. The guidance itself is the consuming text. |
| Does today's overrun handling revert suspect work? (slice 2) | [Handle the overrun](../../../Distribution/src/skills/dough-execute-plan/references/oversized-slice.md#handle-the-overrun) says planned execution "parks or reverts" unfinished work, and quick or disabled-replanning paths remove it. Nothing keeps it for a diagnosis. |

No premise remains assumed. The new test file fails today on both slice 1
examples, according to the first observation.

## Ordered slices

Each slice targets 15 active minutes, including its focused proof and cleanup.

### 1. Count a diagnosis's rounds on the slice clock
Type: Behavior
Status: done
Proof: `slice-clock-diagnosis.test.mjs`; all `slice-clock*.test.mjs`.

Behavior: a diagnosis is started round after round in the same checkout by
`start --diagnosis` → each report gives the round, the authorized total and
the cumulative active minutes. A round at 15 minutes reports its end without
adding a story overrun. A fourth round is refused unless `--rounds-authorized`
raises the total. Update the usage text and the record description.

### 2. Diagnose an unexplained failure in rounds once the slice limit is reached
Type: Behavior
Status: planned
Proof: behavior review under [author-open-dough-skills](../../../.agents/skills/author-open-dough-skills/SKILL.md#behavior-review), walking the slice examples.

Behavior: an implementer reaches the slice limit while a failure's cause is
unknown. The slice's unfinished changes are parked, not reverted. The record
holds the source's fields, and rounds proceed under the continuation rule and
the cap. A confirmed cause hands its forcing reproduction to a fix on its own
clock.

- Add `diagnosis-rounds.md`.
- Link it from [handle the overrun](../../../Distribution/src/skills/dough-execute-plan/references/oversized-slice.md#handle-the-overrun),
  [track active time](../../../Distribution/src/skills/dough-execute-plan/references/oversized-slice.md#track-active-time)
  (the round commands), and
  [diagnose failed proof](../../../Distribution/src/skills/dough-execute-plan/references/execution-decisions.md#diagnose-failed-proof).
  Diagnose failed proof keeps its one-retry rule and gains the
  stated-hypothesis requirement for repeat batches and CI runs.

### 3. Run CI repair diagnosis in the same rounds
Type: Behavior
Status: planned
Proof: behavior review, walking the CI example.

Behavior: an owned CI failure is delegated for repair. The repair brief
starts the repair agent's diagnosis as rounds under `diagnosis-rounds.md`,
carrying an existing record when the same failure was diagnosed before. A
confirmed cause's fix runs on its own clock. A stop for a human keeps the
stash record, the diagnosis record and the owed repair.

- Edit [CI repair step 4](../../../Distribution/src/skills/dough-execute-plan/references/ci-monitor.md#handle-a-notification)
  and the unresolved-repair paragraph.
- In [delegation](../../../Distribution/src/skills/dough-execute-plan/references/delegation.md),
  the brief carries the record path.
- Change the CI-repair pause sentence in track active time so that it covers
  rounds.

## Concerns and cumulative design

Slice-plan refinement was not needed. The plan has three slices, each with
one proof loop:

- the clock rule;
- the in-slice diagnosis path, which owns the new reference;
- the CI repair path, which reuses that reference.

Each later example uses the same round model rather than a new rule. The one
remaining concern is the code overlap with plan 668 on slice 1. It is an
ordering constraint recorded in Current decisions, not a sizing or proof
concern. This review identified no human decision needed before Take.

## Local gates and execution discipline

- Apply the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
  as written.
- Before test edits, apply the installed
  [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) selection. No
  browser test is added.
- Keep default timeouts and never use `test.slow()`.
- Run focused proof with `bash scripts/test.sh` on the `slice-clock*` paths in
  `Distribution/tests/skills/dough-execute-plan/`, or with `node --test` on
  them for case output. Full suites stay in hosted CI.
- Local-gate sleep guard: see
  [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
  These runs take seconds, so start fully awake and wrap any longer run in
  `caffeinate -s -i` on AC power.

## Learnings

- Slice 1 (4.8 active minutes): rounds live at
  `stories[identity].diagnoses[name]` in the clock record. Shared active-time
  arithmetic moved to `slice-clock-active-time.mjs` and the `run` body to
  `slice-clock-run.mjs`; the install payload declares all three new scripts.
  Accepted proof: `node --test Distribution/tests/skills/dough-execute-plan/slice-clock*.test.mjs`
  (32 pass) and `payload-declaration-links.sh`. Untested internals left as
  is: a `run` outliving its round (pinned to its round), and
  `--rounds-authorized` on an already-running diagnosis taking effect only at
  the next round start; a stop always pauses first, so the human's
  authorization arrives on a fresh start.
