# Resolve attempts that appear to be reconciling forever

**Identity:** SEED-225#resolve-stuck-attempt-reconciliation
**Source:** [story](../../seeds/SEED-225-restore-dashboard-responsiveness.md#resolve-stuck-attempt-reconciliation)

## Goal and scope

A developer reviewing an execution attempt in the dashboard can tell whether
reconciliation is still in progress or has reached an outcome. A story
attempt whose session reported completion counts as settled, is judged
against the published snapshot like any settled attempt, is noted reconciled
on this machine, and leaves the Sessions overview's attention, so the
story's actions return instead of staying behind "Waiting for published
story state" indefinitely.

Exclusions (from the story): a containment answer of "not contained" keeps
waiting without an explanation, as today; the attempt's outcome is not
settled from the native session's own record; stored attempts are neither
purged nor edited.

Assumptions: the dashboard's existing notion that a completed session ends
an attempt's need for reconciliation (`needsReconciliation` and `unsettled`
in `dashboard/src/launchAttemptSelection.ts`) is the product rule to extend,
not a new one (PFE: reuse and extend the existing selection rule; no second
representation).

## Outside-in proof

Commands from the worktree after `node scripts/setup-native.mjs npm`,
`browser`, `check` with `/opt/homebrew/bin` first on `PATH`:
`env -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts --reporter=list <specs>`.
Record the consumer trace with
`node .claude/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout . --base HEAD`
before accepting the slice. Apply the repository's
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
as written: a failing or flaky test is a defect to fix, reproducing on main
is attribution not exemption, CI failing on a published revision is the
publisher's to repair through to final CI, never rerun-until-green, stop
only for product, design or credential judgment, and preserve another
active owner's uncommitted repair.

| Promise (story key example) | Owning slice | Observable proof |
| --- | --- | --- |
| Lost worker after its session was spawned, session reported completion, trunk contains the published revision → actions return, attempt noted reconciled, overview no longer carries it | 1 | New journey spec (below): card loses the waiting status and its actions are enabled, `reconciledAt` kept, the attempt answered only in the sessions history |
| Same attempt while the latest read fails → waiting with the read's failure, then reconciled on the next successful read | 1 | The judgement has one implementation for every settled attempt; `responsive-session-reconciliation-refusals.spec.ts` proves its waiting-with-problem branch and stays green |
| Same attempt before the completion report, no server running it → Startup needs reconciliation with Recheck and Continue | 1 | `responsive-session-recovery-restart.spec.ts` stays green; the new journey asserts it before the report |
| Attempt that published nothing, session completed → a snapshot read asked after the report reconciles it | 1 | Focused node test of the shared settled rule and settlement time (completion `receivedAt` when no `settledAt`) through the judgement's pure parts; the journey covers the published case end to end |

## Decisive premises

- **The symptom reproduces through the dashboard.** Observed 2026-11-04 in
  this worktree with a scratch Playwright spec (removed): synthetic `claude`
  held, Story A's execution started, the server closed with the launch
  held (attempt: worker step `launch`, reporting prepared, publication
  `cd5a5c93`, no outcome), restarted on the same port (attempt `owned:
  false`, `running: false`; card said "Startup needs reconciliation" with
  recovery offered), the attempt's own reporting command run with
  `--outcome completed` (receipt `state: pending-native-session`), origin
  `main` moved to a descendant commit `d92916a`, page reloaded. Result: the
  card read "Waiting for published story state: this execution start
  settled on this machine, and this story's actions return once origin
  shows its result", Inspect story disabled, no Startup recovery, unchanged
  after 5 s and another reload, attempt still without outcome or
  `reconciledAt`. Run: 1 passed in 16.3 s.
- **Why it never settles.** `latestSettled` and `askedAfterSettling` in
  `dashboard/src/startupReconciliation.ts` take settled as `outcome !==
  undefined` / `settledAt`, so neither a containment question nor a fresh
  read is asked for the attempt and it is never noted; `reconcileAttempt`
  in `dashboard/server/launchAttemptReconciliation.ts` refuses an attempt
  without an outcome. Confirmed by the scratch run's final state and by the
  real modules (`storyStartup` returns `reconciling`,
  `attemptsNeedingAttention` carries the attempt).
- **Proof route.** The preview harness (`responsiveStart.ts` fixtures,
  `claudeScenario("held")`, `restart` from `responsiveRecovery.ts`,
  `reportingChild` from `support/completionRecovery.ts`, `commitOn`,
  `attempts`) runs in this checkout as above.
- **Not the cause.** Every published revision of the machine's 988 story
  attempts is contained by its project's trunk (checked 2026-11-04 across
  six projects), and the machine's store and backups hold no attempt in the
  reproduced state; the story's exclusion of the silent "not contained"
  answer stands.

## Ordered slices

### 1. A story attempt whose session completed reconciles with published state
Type: Behavior
Status: planned
Proof: a new journey spec (the scratch journey above, kept) in
`dashboard/tests/`: before the completion report the restarted page shows
"Startup needs reconciliation" with recovery offered; after the report and
a trunk move past the published revision, the card shows no startup status,
Inspect story is enabled, no Startup recovery is listed, the attempt is
kept with `reconciledAt` and is answered only in the sessions history. A
focused node test under `tests/` or `dashboard/tests/boundary/` of the
shared settled rule: settled by outcome or by completed session, settlement
time from `settledAt` else the completion's `receivedAt`, and the server's
noting accepting a session-completed attempt and still refusing an
unsettled or needs-reconciliation one. `responsive-session-reconciliation*.spec.ts`,
`responsive-session-recovery*.spec.ts`, `recently-done-sessions-sidebar-*.spec.ts`
and `session-unread-report.spec.ts` stay green; consumer trace recorded.

Behavior: a story attempt lost its worker after spawning its session and
that session reported completion → once a fully read snapshot contains its
published revision (or, with no revision, was asked after the report was
received), the page judges it reconciled, notes it on this machine, the
story's actions return, and the attempt leaves the overview's attention;
while the read fails or the snapshot is incomplete, the waiting status and
its reason stay.

Implementation direction: one settled rule in
`dashboard/src/launchAttemptSelection.ts` (outcome recorded or session
completed, with its settlement time) consumed by `unsettled`,
`attemptsNeedingAttention`, `startupReconciliation.ts` (`latestSettled`,
`askedAfterSettling`, `settling`, the containment questions) and
`launchAttemptReconciliation.ts`; `needsReconciliation` keeps its meaning.

## Current decisions

- Settlement by completed session uses the completion's `receivedAt` as the
  settlement time; nothing writes `outcome` or `settledAt` onto the attempt.

## Learnings

None yet.

## Concern evidence

Slice-plan refinement was not needed: one Behavior slice with one proof
loop, no hidden preparation, and the shared rule's structure change is the
immediate enabler of that behavior. No remaining slice-specific concern.
