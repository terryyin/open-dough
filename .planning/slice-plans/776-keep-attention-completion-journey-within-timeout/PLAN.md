# Keep the attention completion journey within its timeout under load

**Identity:** SEED-341#keep-attention-completion-journey-within-timeout
**Source:** [Keep the attention completion journey within its timeout under load](../../seeds/SEED-341-simplify-session-tests.md#keep-attention-completion-journey-within-timeout)
**Source review:** [source review](source-review.md)

## Goal and scope

Developers should get the same `e2e/sessions/agent-completion-attention.spec.ts`
result locally and in CI at any machine load. The work splits that one
journey into two owners, the split
the completed quiet completion journey established in
`agent-completion-quiet.spec.ts` and `agent-completion-quiet-done.spec.ts`:

- **Closure and reporting** keeps the installed path in the existing spec
  without the `page` fixture. A worker that runs only this spec launches no
  browser. It launches through the HTTP `launch` the quiet closure uses, not
  the Start execution button.
- **Page** is `e2e/sessions/agent-completion-attention-page.spec.ts`. It
  composes a Codex record that already carries the attention completion, then
  reads it on the story card. It runs no launch, no installed closure, and no
  installed reporting, and it does not restart the dashboard process.

Every current observation moves to one of those owners, or is removed only
when the overlap check in the page slice that would repeat it finds another
test that already proves the same rule for a Codex attention completion. The
work keeps the default timeout and adds no override.

The page renders a stored completion. The installed command is what writes
that completion. Those are one rule at two owners, not a second recognizer
for the unfinished label, the column change, or Mark as done.

Exclusions:

- The other completion specs (`-quiet`, `-cursor`, `-execution`,
  `-quiet-claude`) do not change.
- Fixture cost does not move out of the test budget. The developer rejected
  that lever for the quiet journey, and this story reuses that decision.
- No dashboard behavior changes.
- Refused deliveries stay in
  `dashboard/backend-tests/sessions/agent-completion-identity.spec.ts`.

## Existing solution

The responsibility is already in the product. Reuse it; do not add a
composition framework.

- `makeMe.aLaunchRecord.executing(...).inCodexSession(...).completedWith(...)`
  (`Distribution/tests/support/launchTestData.mjs`) builds the Codex record
  and its completion. `keepLaunchRecords`
  (`dashboard/test-support/support/launchStore.ts`) writes the store the
  server reads on every request
  (`dashboard/server/launchRecordDocument.ts`).
- `retained()` in `dashboard/test-support/support/retainedReport.ts` also
  composes a Codex record, and it launches. The page spec does not call it.
  Reuse `keepFinalReport` from that file for the native final report.
- Column membership is the published backlog
  (`dashboard/src/publishedBacklog.ts`). The story-columns journey takes
  Story B (`readyStory` / `readyIdentity` in
  `dashboard/test-support/launchJourney.ts`). `openStoryColumnsJourney` then
  `show(journey.taken)` moves that card from Backlog to Taken without a real
  start. The attention record is Story B's, so the message moves with the
  card. Story A stays where the current spec puts it only because that spec
  starts execution; the page owner does not.
- `session-unread-report.spec.ts` proves Mark as read, an unfinished label,
  and a collapsed Done message for a Claude session. It does not prove a
  Codex rename and interrupt, a column change, workspace removal, or a
  dashboard restart. Cite it only when the overlap check finds the same rule
  already proved for a Codex attention completion.

No file this work edits is over the 250-line check at `a9dc00d17`:
`agent-completion-attention.spec.ts` is 245 and the closure edit removes the
page phase; `retainedReport.ts` is 232 and is not edited. The parked draft of
the whole page journey is 291 lines, so it does not fit one spec. Slice 1
extracts the composed-record setup into a new helper under
`dashboard/test-support/support/` and does not extend `retainedReport.ts`.
Every page spec file stays at or under 250 lines. Later page slices add their
own tests to `e2e/sessions/agent-completion-attention-page.spec.ts` and do
not restore that draft as one test.

## Decisive premises and preparation observations

The composition and column facts below were read in this workspace at
`a9dc00d17` on 2026-11-22. They were not executed: this worktree had no
`node_modules`, and the host load was about 49 on 16 cores, so a fresh
install plus the spec was not run. The timing row cites the quiet journey's
observation. Slice 1, Slice 2, and Slice 7 are the early probes that reach
the unobserved operations. A failure stops that slice and changes this plan
before any further claim that the case fits in 30 s.

| Premise / consuming operation | Observation and result | Remainder |
| --- | --- | --- |
| A Codex attention completion can be stored without a launch, and the server reads that file (consumed by Slice 1) | `LaunchRecordBuilder.completedWith` stores `outcome` and `message`. `keepLaunchRecords` writes `agent-launches.json`. `readStoredRecords` reads that file on every request. | Not executed. Slice 1's page spec is the probe: a scratch edit that drops the composed message makes the message assertion fail. Revert it. |
| The story card follows the published column (consumed by Slice 2) | `interpretPublishedBacklog` places a story by the published list. The story-columns taken revision takes Story B. The current spec shows the message on the backlog card, then on the Taken card after `advanceTo` and a reload. | Not executed for a composed Story B record. Slice 2 is the probe: leaving the published revision queued makes the Taken assertion fail. Revert that scratch. |
| Dropping the browser and the page phase leaves the installed path inside 30 s at load about 50 (consumed by Slice 7) | Proxy, from plan 775 (`5d221c5fa:.planning/slice-plans/775-split-quiet-completion-journey/PLAN.md`) at `9a7abeef7` on 2026-11-22. With 46 burners and the four sibling specs on `--workers 4`, load 52 → 59, the quiet spec's no-page scratch took 15.5/17.8/14.6 s and the current quiet spec 17.3/21.4/20.6 s. In that same run this attention spec timed out at 30 s once. The difference can change the outcome: this spec also restarts the dashboard and has a longer page phase, and its own phases were not measured here. | Slice 7 is the early probe. It runs the paired comparison below and records loads, per-case durations, and the ratio. A closure case at or over 30 s, or no visible cut, stops the slice and changes this plan. |

## Outside-in proof ownership

| Key example | Owner and signal |
| --- | --- |
| At load about 50 on 16 cores, each case passes inside 30 s | Slice 7: alternating runs, three of each, of `git show origin/main:e2e/sessions/agent-completion-attention.spec.ts` (saved as a scratch copy) against the split specs under the same load. Record the loads, the per-case durations, and the ratio. The closure worker launches no browser (trace shows no `Fixture "browser"`). The page spec runs no launch and no installed report. |
| Installed completed-with-attention records the receipt and message, leaves `doneAt` unset, and does not steer the native session; a later unfinished report stays open; the command still returns a receipt after the workspace is removed; the stored receipt survives a dashboard restart | Slice 7 closure spec, through the installed command and `stored()` after restart. No page assertion. |
| The card shows the message as text, Working, the unread completed-with-attention report, and Mark as read | Slice 1. Story B, story-columns journey, queued revision. |
| After the stored completion is unfinished, the open card shows "Unfinished work"; the message is on the Taken card after the published move and stays after the workspace path is removed | Slice 2. The unfinished label is a `keepLaunchRecords` rewrite of the same record, then one pace (`pausePageClockAt`, `watchRecordReads`), not an installed command. `show(journey.taken)` moves the card. |
| The final report panel shows the native report and not the reminder, and offers no Mark as read | Slice 3, through `keepFinalReport` and `readFinalReport`. |
| Mark as read keeps the session open and adds no panel control | Slice 4, through `messagePartOf`, `buttonsAddedSince`, and the stored `reportRead`. |
| Mark as done renames and interrupts the in-progress turn | Slice 5, through `markDoneAnyway` and the native calls since the mark. |
| The Done entry collapses "Unfinished work" until expanded, and the final report is still the native report | Slice 6, through `shownDoneSessionEntriesOf`. Mark as done in that test is setup for the Done entry. |

## Local gate

Run from an awake machine on AC power, under the maintained
[sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
`caffeinate -s -i`. Unset `NO_COLOR`, `FORCE_COLOR` and
`GIT_ALTERNATE_OBJECT_DIRECTORIES`, keep the default reporter and the default
timeouts, and follow the
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).

- `npx playwright test --config e2e/playwright.config.ts e2e/sessions/agent-completion-attention.spec.ts e2e/sessions/agent-completion-attention-page.spec.ts`
- `npm run typecheck:dashboard` and `npm run --silent lint`

## Slices

Page slices share one model: a stored Codex attention completion rendered by
the existing story card and session panel. Each slice below is one observable
result of that model. Apply the overlap check in Existing solution before
each new assertion. Keep the default timeout and add no override. Do not
restore the parked draft as one test.

### 1. The backlog card shows a composed attention completion

Type: Behavior
Status: done
Proof: the new page spec's backlog-card test passes. Discrimination, then
reverted: a scratch edit that drops the composed message makes the message
assertion fail.

Behavior: extract the composed-record setup into a new helper under
`dashboard/test-support/support/`. Do not extend `retainedReport.ts` and do
not call `retained()`. A Codex record for Story B that already has a
completed attention message is stored, and the story-columns page is opened
on the queued revision → the backlog card shows that message as text, with
no `.session-attention-message script` element, Working, "Unread report:
Completed with attention", and Mark as read. The spec runs no launch, no
installed closure, and no installed reporting.

### 2. The card follows an unfinished completion and the published column

Type: Behavior
Status: done
Proof: the page spec's unfinished and Taken tests pass. Discrimination, then
reverted: leaving the published revision queued makes the Taken assertion fail.

Behavior: the stored completion is rewritten unfinished and one pace passes
→ the open card shows "Unfinished work". `show(journey.taken)` → the message
is on the Taken card. Removing the composed workspace path does not clear
it. Reuse Slice 1's helper. Run no launch, no installed closure, and no
installed reporting.

### 3. The final report panel shows the native report

Type: Behavior
Status: planned
Proof: the page spec's final-report test passes.

Behavior: the final report panel shows the native report "The saved
conversation's final report." and not "Reminder: inspect the migration", and
offers no Mark as read. Use `keepFinalReport` and `readFinalReport`. Reuse
Slice 1's helper. Run no launch, no installed closure, and no installed
reporting.

### 4. Mark as read keeps the session open

Type: Behavior
Status: planned
Proof: the page spec's Mark-as-read test passes.

Behavior: Mark as read clears the button, sets `reportRead` to the completion
receipt, leaves `doneAt` unset, and adds no panel button. Reuse Slice 1's
helper. Run no launch, no installed closure, and no installed reporting.

### 5. Mark as done renames and interrupts the native session

Type: Behavior
Status: planned
Proof: the page spec's Mark-as-done test passes.

Behavior: with the native session observing an in-progress turn, Mark as
done closes the panel, removes the attention message from the story card,
sets `doneAt` with no `doneProblem`, and the native calls since the mark are
`thread/name/set` to the done name and `turn/interrupt` of that turn. Reuse
Slice 1's helper. Run no launch and no installed reporting. This slice does
not assert the Done entry.

### 6. The Done entry collapses the unfinished message

Type: Behavior
Status: planned
Proof: the page spec's Done-entry test passes.

Behavior: after Mark as done, the Done entry shows Done and `Named` that
name; "Unfinished work" is collapsed until expanded, and the final report is
still the native report. Mark as done in this test is setup for that entry,
not a second proof of Slice 5. Reuse Slice 1's helper. Run no launch, no
installed closure, and no installed reporting.

### 7. Installed attention reporting runs without a browser

Type: Behavior
Status: planned
Proof: the gate's attention spec passes with no `page` fixture. Then run the
paired load comparison from the proof table and record its loads, durations,
and ratio here. This slice is the early probe for the timing premise. A
closure case at or over 30 s, or no visible cut, stops the slice and changes
this plan.

Behavior: the real HTTP launch's installed command reports
completed-with-attention → the receipt carries the message and the Codex
session, the store keeps that completion, `doneAt` is absent, and the native
session receives no `turn/interrupt`, `thread/name/set`, or `turn/start`. A
later unfinished report returns unfinished, the store keeps that message, and
`doneAt` stays absent. After the workspace directory is removed, the
installed command still returns a receipt. After the dashboard process
restarts, `stored()` on the new server is that retained receipt. Remove
`publishCommittedOrigin`, the page clock, the page reads, and the `page`
fixture from `agent-completion-attention.spec.ts`. Name the page spec as the
owner of the card observations. Keep the default timeout and add no override
in either owner.

## Concerns

The page journey was one slice. Writing it reached the active-time limit
before any proof, and the draft was 291 lines, so that boundary combined
independent card, column, report, and mark results. The replacement is seven
slices: six page results, then the unchanged closure probe. The composition
premise is Slice 1's discrimination check, the column premise is Slice 2's,
and the timing premise is Slice 7's. The real failing load cannot be
reproduced on demand; hosted CI and later loaded local runs remain the
ongoing check under the failure policy. Refinement ran after that overrun.
No other slice-specific concern remains.

## Learnings

The first attempt at the whole page journey overran on 2026-11-22. The clock
paused at 17.7 active minutes. No focused spec, typecheck, discrimination
probe, or consumer trace ran. The failed sizing assumption was that the
backlog card, unfinished label, Taken move, workspace removal, final report,
Mark as read, Mark as done, and Done entry fit one slice and one spec at or
under 250 lines. The parked draft is `slice1-draft.spec.ts` in this
checkout's evidence directory. It is evidence only. Do not restore it as the
spec.

The replacement Slice 1 finished its backlog-card proof: the focused spec and
typecheck exited 0, and dropping the composed message made `toHaveText` fail
before that scratch was reverted. The implementer reported 14.4 active
minutes with overrun false. The coordinator pause then measured 15.1 active
minutes, so `storyOverruns` is 2. That completed proof stays. This remains
one story. Delivered value is the composed backlog card. Remaining scope is
Slices 2–7. Continuing is justified because this one-result slice finished
its proof, and the second overrun is the handoff crossing the limit after
that proof. Do not refine the remaining slices again unless a later slice
fails to finish its own proof.

## Story obligations
