# Keep the attention completion journey within its timeout under load

**Identity:** SEED-341#keep-attention-completion-journey-within-timeout
**Source:** [Keep the attention completion journey within its timeout under load](../../seeds/SEED-341-simplify-session-tests.md#keep-attention-completion-journey-within-timeout)

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
when the overlap check in Slice 1 finds another test that already proves the
same rule for a Codex attention completion. The work keeps the default
timeout and adds no override.

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
page phase; `retainedReport.ts` is 232 and is not edited. The new page spec
stays at or under 250 lines. If the journey does not fit, Slice 1 extracts
the composed-record setup into a new helper under
`dashboard/test-support/support/` and does not extend `retainedReport.ts`.

## Decisive premises and preparation observations

The composition and column facts below were read in this workspace at
`a9dc00d17` on 2026-11-22. They were not executed: this worktree has no
`node_modules`, and the host load was about 49 on 16 cores, so a fresh
install plus the spec was not run. The timing row cites the quiet journey's
observation. Slice 1 and Slice 2 are the early probes that reach the
unobserved operations. A failure stops that slice and changes this plan
before any further claim that the case fits in 30 s.

| Premise / consuming operation | Observation and result | Remainder |
| --- | --- | --- |
| A Codex attention completion can be stored without a launch, and the server reads that file (consumed by Slice 1) | `LaunchRecordBuilder.completedWith` stores `outcome` and `message`. `keepLaunchRecords` writes `agent-launches.json`. `readStoredRecords` reads that file on every request. | Not executed. Slice 1's page spec is the probe: a scratch edit that drops the composed message makes the message assertion fail. Revert it. |
| The story card follows the published column (consumed by Slice 1) | `interpretPublishedBacklog` places a story by the published list. The story-columns taken revision takes Story B. The current spec shows the message on the backlog card, then on the Taken card after `advanceTo` and a reload. | Not executed for a composed Story B record. Slice 1 is the probe: leaving the published revision queued makes the Taken assertion fail. Revert that scratch. |
| Dropping the browser and the page phase leaves the installed path inside 30 s at load about 50 (consumed by Slice 2) | Proxy, from plan 775 (`5d221c5fa:.planning/slice-plans/775-split-quiet-completion-journey/PLAN.md`) at `9a7abeef7` on 2026-11-22. With 46 burners and the four sibling specs on `--workers 4`, load 52 → 59, the quiet spec's no-page scratch took 15.5/17.8/14.6 s and the current quiet spec 17.3/21.4/20.6 s. In that same run this attention spec timed out at 30 s once. The difference can change the outcome: this spec also restarts the dashboard and has a longer page phase, and its own phases were not measured here. | Slice 2 is the early probe. It runs the paired comparison below and records loads, per-case durations, and the ratio. A closure case at or over 30 s, or no visible cut, stops the slice and changes this plan. |

## Outside-in proof ownership

| Key example | Owner and signal |
| --- | --- |
| At load about 50 on 16 cores, each case passes inside 30 s | Slice 2: alternating runs, three of each, of `git show origin/main:e2e/sessions/agent-completion-attention.spec.ts` (saved as a scratch copy) against the split specs under the same load. Record the loads, the per-case durations, and the ratio. The closure worker launches no browser (trace shows no `Fixture "browser"`). The page spec runs no launch and no installed report. |
| Installed completed-with-attention records the receipt and message, leaves `doneAt` unset, and does not steer the native session; a later unfinished report stays open; the command still returns a receipt after the workspace is removed; the stored receipt survives a dashboard restart | Closure spec, through the installed command and `stored()` after restart. No page assertion. |
| The card shows the message as text, Working, the unread completed-with-attention report, and Mark as read; after the stored completion is unfinished, the open card shows "Unfinished work"; the message is on the Taken card after the published move and stays after the workspace path is removed | Page spec. Story B, story-columns journey, `openStoryColumnsJourney` and `show(journey.taken)`. The unfinished label is a `keepLaunchRecords` rewrite of the same record, then one pace (`pausePageClockAt`, `watchRecordReads`), not an installed command. |
| The final report panel shows the native report and not the reminder, and offers no Mark as read. Mark as read keeps the session open and adds no panel control. Mark as done renames and interrupts the in-progress turn. The Done entry collapses "Unfinished work" until expanded, and the final report is still the native report | Page spec, through `keepFinalReport`, `readFinalReport`, `messagePartOf`, `buttonsAddedSince`, `markDoneAnyway`, and `shownDoneSessionEntriesOf`. |

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

### 1. The story card shows an attention completion from a composed record

Type: Behavior
Status: planned
Proof: the new page spec passes. Discrimination checks, each reverted: drop
the composed message and the message assertion fails; leave the published
revision queued and the Taken assertion fails.

Behavior: a Codex record for Story B that already has a completed attention
message is stored, and the story-columns page is opened on the queued
revision → the backlog card shows that message as text, with no
`.session-attention-message script` element, Working, "Unread report:
Completed with attention", and Mark as read. The stored completion is then
rewritten unfinished and one pace passes → the open card shows "Unfinished
work". `show(journey.taken)` → the message is on the Taken card. Removing
the composed workspace path does not clear it. The final report panel shows
the native report "The saved conversation's final report." and not
"Reminder: inspect the migration", and offers no Mark as read. Mark as read
clears the button, sets `reportRead` to the completion receipt, leaves
`doneAt` unset, and adds no panel button. With the native session observing
an in-progress turn, Mark as done closes the panel, removes the attention
message from the story card, sets `doneAt` with no `doneProblem`, and the
native calls since the mark are `thread/name/set` to the done name and
`turn/interrupt` of that turn. The Done entry shows Done and `Named` that
name; "Unfinished work" is collapsed until expanded, and the final report is
still the native report. Before writing each assertion, check
`session-unread-report.spec.ts`, `session-workspace-retirement*.spec.ts`, and
`agent-completion-identity.spec.ts`. Where one already proves an observation
for a Codex attention completion, cite it in the spec's owner comment and do
not repeat it.

### 2. Installed attention reporting runs without a browser

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
owner of the card observations.

## Concerns

Refinement was not needed: the plan has two slices, one per owner, and
neither depends on deferred design. The composition and column premises are
bounded by Slice 1's discrimination checks, and the timing premise is
bounded by Slice 2's early probe. No other slice-specific concern remains.
The real failing load cannot be reproduced on demand; hosted CI and later
loaded local runs remain the ongoing check under the failure policy.

## Story obligations
