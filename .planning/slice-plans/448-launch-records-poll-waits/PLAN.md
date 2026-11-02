# Pass launch-records reads without waiting the poll interval

**Source:** [SEED-221#launch-records-poll-waits](../../seeds/SEED-221-launch-records-poll-waits.md#launch-records-poll-waits)
**Identity:** SEED-221#launch-records-poll-waits
**Request:** Terry Yin's `/dough-test-optimization --resolve` (2026-11-02)
resolved the pending `launch-records-poll-waits` candidate in
[`TEST-OPTIMIZATION-CANDIDATES.md`](../../TEST-OPTIMIZATION-CANDIDATES.md#transferred-obligations)
into this replacement plan. Resolve-only planning grants no execution; run it
through `dough-execute-plan` when execution is authorized.

## Failing and flaky tests

Carry this project's failure policy as written in
[AGENTS.md — Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests).

## Goal and scope

Developer outcome: shorter local `npm run test:dashboard` feedback by removing
about 60 summed seconds of real-time waits for the page's next launch-records
read, without losing protection.

- **In scope:** the attention journey in
  `dashboard/tests/agent-completion-attention.spec.ts` (its waits for the
  reported message and for "Unfinished work") and the two close/reopen races in
  `dashboard/tests/agent-launch-ad-hoc-terminal.spec.ts` (their waits after
  `release()`).
- **Preserved promises:** a delivered report reaches the open page without a
  reload, and stays durable and readable through column change, retirement,
  restart, Mark as read and Mark as done; a terminal the developer closed while
  its session started stays closed (no new attach) and Open terminal still
  attaches it; a reopened terminal stays open with its shown text and no second
  attach.
- **Exclusions:** no new clock or pacing helper; `withholdLaunchOutcomes` is not
  extended or rewritten; no case removal or boundary move; the accepted
  `long-integrated-journeys` and `agent-launch-poles` costs stay as accepted.
- **Assumption:** each wait is the 15s `checkIntervalMs`
  (`src/agentLaunches.ts:176`, `src/revisionCheckSchedule.ts:31`) between the
  page's launch-records reads, as the SEED-208 timestamped diagnostic showed.

## Evidence and baseline

- **Recorded evidence:** SEED-208 slices 7 and 8 Results in
  `40e1d2f9:.planning/slice-plans/432-reduce-dashboard-proof-cost/PLAN.md`:
  the attention journey spent 14.9s on each of two waits (about 30s of 35s);
  each race spends about 15s after `release()`.
- **Baseline prerequisite (not yet run):** before slice 1's edits, run the three
  cases focused, back to back, three times each in normal mode, recording
  revision, 1-minute load, worker count, per-case and wall time:
  `cd dashboard && env -u NO_COLOR -u FORCE_COLOR npx playwright test tests/agent-completion-attention.spec.ts tests/agent-launch-ad-hoc-terminal.spec.ts --reporter=list`
  (after `setup-native` in a fresh worktree). Keep raw output outside the repo.

## Family analysis

All four waits share one cost: the page learns the new launch-records state only
on its next scheduled read. Existing infrastructure already drives that real
read without waiting: `pausePageClockAt` (`dashboard/tests/dashboardTest.ts`)
pauses page time before the page opens, and `watchRecordReads(page).passOnePace`
(`dashboard/tests/sessionStatePace.ts`) advances exactly one pace and asserts
exactly one read was asked and answered. `agent-launch-attention.spec.ts` uses
this pair with Open terminal under paused time, so the terminal is known to work
with a paused clock. The read itself, its server answer and the page's
rendering stay real; only the waiting is removed.

Risk to check per experiment: other page timers in these journeys (reload
helpers, restart recovery, xterm rendering, startup progress) must still
progress; where one waits on page time, advance it explicitly rather than
reintroducing a real wait.

## Experiment loop

Each slice follows: **Hypothesize** (the case's remaining wall is the poll wait)
→ **Try and measure** (comparable focused baseline above, smallest change,
focused proof, measure again) → **Decide** (keep a supported gain; undo an
ineffective or regressing change and record it) → **Reassess** (whether the
other family members share the result).

## Slices

### 1. The close/reopen races see their session start after one paced read
Type: Behavior
Status: planned
Proof: both race cases pass three consecutive focused runs with unchanged
assertions; each case's focused time drops by roughly the poll interval against
the baseline.

Behavior: an ad hoc session starting with launch outcomes withheld and its
terminal closed or reopened → `release()` then one `passOnePace` (page clock
paused before the page opens) → quiet actions row, panel closed with no new
attach and Open terminal attaching it, or panel open with unchanged text and no
second attach — without waiting the interval in real time.

### 2. The attention journey sees each delivered report after paced reads
Type: Behavior
Status: planned
Proof: the attention case passes three consecutive focused runs with unchanged
assertions (including retirement, restart, Mark as read and Mark as done); its
focused time drops by roughly two poll intervals against the baseline.

Behavior: an open page and a recorded completion or unfinished report →
paced reads instead of 20s waits → the card shows the message, "Unread report:
Completed with attention", Mark as read, and later "Unfinished work" without a
reload.

### 3. Re-profile local dashboard feedback
Type: Structure
Status: planned
Proof: normal `npm run test:dashboard` on the final state under comparable load
against a reference run of the starting revision, with cases, wall and summed
test seconds recorded; record the outcome (measured gain, no demonstrated gain,
or incomplete measurement) and any remaining cost in
`.planning/TEST-OPTIMIZATION-CANDIDATES.md`, removing the transferred entry
when the work is done.

Internal change: measurement and record update only; it closes the
transferred `launch-records-poll-waits` obligation.

## Current decisions

- Retain a slice only with a measured focused gain; summed or fewer seconds
  alone do not count.

## Learnings

None yet.
