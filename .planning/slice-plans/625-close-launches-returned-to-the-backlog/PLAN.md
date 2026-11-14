# Close launches returned to the backlog

**Identity:** SEED-358#close-launches-returned-to-the-backlog
**Source:** [selected story](../../seeds/SEED-358-dashboard-launch-history.md#close-launches-returned-to-the-backlog)
**Source review:** [source-review.md](source-review.md)

## Goal and scope

A claimed tracked execution launch whose quiet `completed` report arrives, or
whose early report binds, after its landing published the story's return to
the queue closes with automatic Done and keeps a returned-to-backlog outcome.
Its session entry reads "Returned to backlog" where a Done entry reads "Done",
so the developer no longer has to find and mark these launches done by hand.

Unchanged: story still Taken, or missing or unreadable evidence, stays open;
story gone from the backlog closes as completed; `unfinished` and attention
reports, one-shot execution and other workflows keep their handling; the final
report's product closure evidence still means published completion only.

Exclusions: no new reporting outcome or change to installed skills or the
reporting command; no relabelling of launches reported before this change;
no re-evaluation after delivery or binding; no change to story membership or
how stories return to the queue.

## Existing solutions and direction

- PFE: extend the one closure owner,
  [`completionClosure.ts`](../../../dashboard/server/completionClosure.ts).
  It already reads the retained landing, the launch repository's current
  remote tracking target and the configured backlog through `parseBacklog`,
  whose entries carry `list` (`Taken` or the queue heading). Replace its
  boolean answer for delivery and binding with one reading of three published
  outcomes: completed, returned to the queue, or open. `completionDelivery.ts`
  and `launchRecordBinding.ts` keep their Done conditions and save the
  returned outcome with the completion. `trackedExecutionClosureReadable`
  keeps answering published completion for `finalReportResponse.ts`.
- Keep the returned outcome on the launch record as one optional field naming
  the completion receipt it qualifies, so a newer report replaces it and the
  reading cannot attach it to another report. It must be saved at the time of
  the report: the landing is the first landing, and later membership
  (retaken, completed) cannot reconstruct it. Done listings keep every record
  field except those `sessionListing.ts` names as history-only, and launch
  history keeps the original record, so the field reaches Recently done and
  history without new plumbing.
- The reading lives in [`sessionShown.ts`](../../../dashboard/src/sessionShown.ts),
  where a reported Done session reads "Done" with the native Working note.
- [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state):
  the launch reads published membership and writes only local launch
  evidence; it never moves or settles the story. No North Star topic or ADR
  is needed.
- File sizes before edits: `sessionShown.ts` 248, `launchRecord.ts` 238,
  `completionDelivery.ts` 118, `launchRecordBinding.ts` 105,
  `completionClosure.ts` 63. If slice 2's edit takes `sessionShown.ts` past
  250 lines, slice 2 moves its session-count wording (`attentionCount`,
  `workingCount`, the summaries and `*Words` helpers, lines 179–248) into a
  cohesive `sessionCounts.ts`, updating the callers that import them; the
  entries' attention and working badges keep their existing proof. If
  `launchRecord.ts` would pass 250, keep the field's comment to one line.

## Decisive premises and observations

| Consuming operation / premise | Observation and limits |
| --- | --- |
| Early returns send a quiet `completed` report after the landing that publishes the queue move, and today's gate leaves them open | Read-only query of this machine's `~/.open-dough/dashboard/agent-launches.json` on 2026-11-14: SEED-324 (darren-chan) landing `7fb423492` at 00:07:59Z, quiet report 00:14:29Z, Done 00:15:09Z with `dispositionChangedAt` after it (explicit); SEED-303 (d.kanai-chan) landing `d54b6d56f` (contains return `28a3bb2ac`) 07:57Z, quiet report 08:06Z, explicit Done 08:20Z. |
| `completionClosesSession` reads the queued story as not closed, and `parseBacklog` distinguishes the queue from Taken | Scratch esbuild bundle of the real `dashboard/server/completionClosure.ts` at `d219005f4`, run on darren-chan's real record against `/Users/terryyin/git/open-dough/.git`: `trackedExecutionClosureReadable` false, `completionClosesSession` false; `parseBacklog` gives the story `list: 'Backlog list'` both at the landing revision and at `refs/remotes/origin/main` (`d219005f4`). Scratch file and `node_modules` link were removed. |
| Fixture repositories can publish a backlog with the story queued or Taken | `plantTrackedClosureRepository` writes through `writeRevisionFiles`, whose `renderPublishedBacklog` accepts `taken` and `queued` entries; `completionClosurePublication.ts` already publishes `queued` entries. Slice 1 parameterizes the planted backlog; its new assertions fail before the behavior (open session), which is the discrimination check. |

## Outside-in proof ownership

Resolve test paths through [dough-makeme](../../../.agents/skills/dough-makeme/SKILL.md)
and, for browser tests, [dough-page-objects](../../../.agents/skills/dough-page-objects/SKILL.md);
`.planning/open-dough.json` selects MakeMe for `dashboard/backend-tests` and
MakeMe plus page objects for `dashboard/tests`.

- Key examples 1, 4 and 5 (closure): backend spec at the reporting boundary.
- Key examples 1–3 (reading and placement): integrated dashboard UI spec.
- Example 2's interim `unfinished` report staying open is the existing rule;
  slice 1 keeps it covered by asserting an `unfinished` report on a returned
  story stays open, not by a new spec.

## Ordered slices

### 1. A returned launch closes when its quiet report arrives
Type: Behavior
Status: done
Proof: new `dashboard/backend-tests/sessions/agent-completion-returned-closure.spec.ts`
through the dashboard's completion endpoint and record binding, reading saved
records and the machine sessions answer.

Behavior: a claimed tracked execution record with a retained landing in a
planted repository whose `origin/main` backlog lists the story in the queue →
quiet `completed` delivery → the record is Done at the report's time and keeps
the returned outcome naming that receipt. Boundaries in the same spec: the
same delivery with the story in Taken stays open with no returned outcome; an
`unfinished` report on a queued story stays open; a launch explicitly marked
done before the report keeps its Done and gains the outcome; an early quiet
report that binds later (`bindRecord`) closes with the outcome; a story absent
from the backlog still closes as completed without it. The final report's
product closure evidence stays absent for the returned launch. Update
[AGENT-LAUNCH-COMPLETION](../../../dashboard/AGENT-LAUNCH-COMPLETION.md)'s
tracked-execution closure paragraph.

Accepted: `completionClosure` returns `completed`, `returned` or `open`;
delivery and binding save `returnedToBacklog` (the report's receipt) through
`returnedOutcome`, and `updateRecord` keeps the stored value. Proof: the new
spec plus the `agent-completion-*`, `final-report-admission` and
`one-shot-landing-*` backend specs (26 passed), e2e
`agent-completion-{quiet,attention,cursor,execution,quiet-claude}` and
`typecheck:dashboard`; both new tests fail on the pre-change server.
Learning: `recordOperation`'s child process now loads the server's saved
project list, without which `bindRecord` there never saw a configured
project's closure. Slice 2's reading must compare `returnedToBacklog` with
`completion.receipt` so a kept outcome never reads for another report.

### 2. A returned launch reads "Returned to backlog"
Type: Behavior
Status: done
Proof: new integrated spec `dashboard/tests/sessions/recently-done-returned-sessions.spec.ts`
using the existing Recently done records, page objects and `sessionStateOf`.

Behavior: published backlog lists the story in the queue; one Done launch
carries the returned outcome and a later open launch for the same story is
saved → the board loads → the returned launch appears once in Recently done,
standalone, reading "Returned to backlog"; the open launch sits in the queued
story's card and reads its native state. After publishing the story's done
record with the later launch marked done, the done-story card holds both, the
earlier reading "Returned to backlog" and the later "Done". A returned launch
whose native session still works keeps the "Native session is still working"
note; reopening it restores its native reading. Update
[AGENT-LAUNCH-HISTORY](../../../dashboard/AGENT-LAUNCH-HISTORY.md) or
[session entries](../../../dashboard/AGENT-LAUNCH-SESSION-ENTRIES.md) where
the Done reading is described.

Accepted: `sessionShown.ts` reads "Returned to backlog" when
`returnedToBacklog` equals `completion.receipt`; the count wording moved to
`sessionCounts.ts` under the settled file-size decision. Proof: the new spec
(queued, retaken and done steps; native Working note and reopen), the
`recently-done-*`, Done, sidebar and count integrated specs (60 passed), the
backend reading/count rules (29), the frontend sidebar status (2), e2e
attention, sidebar, quiet completion, Done reopen and one-shot review (9) and
`typecheck:dashboard`; both new integrated tests fail on the pre-change
reading. Learning: an integrated spec that marks done or reopens kept story
records needs `projectFolders: ["open-dough"]`.

## Execution complete

Product advice: no change. The two observed early returns (SEED-303,
SEED-324) now close on their quiet report and read "Returned to backlog";
no queued story depends on a different reading, and the review found no
correction. Process review is deferred into wrap-up with Intent Coverage.

## Verification, sizing and concern review

- Local gate: each slice's new spec plus the closure and Done families it
  shares code with, through
  `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES node node_modules/playwright/cli.js test --config <config> <paths> --reporter=list`.
  Slice 1, `dashboard/backend.playwright.config.ts`: the new spec,
  `dashboard/backend-tests/sessions/agent-completion-*.spec.ts` and
  `final-report-admission.spec.ts` (they exercise the changed closure and
  record writes). Slice 2, `dashboard/integrated.playwright.config.ts`: the
  new spec and `dashboard/tests/sessions/recently-done-*.spec.ts`,
  `agent-launch-story-card-done.spec.ts` and `agent-terminal-done.spec.ts`
  (they assert the Done reading), plus any spec covering moved count helpers
  if `sessionShown.ts` is reorganized. Run `npm run typecheck:dashboard` for
  the changed record contract. A fresh worktree needs `node scripts/setup-native.mjs` first.
  Hosted CI runs the full suites after publication.
- Long local runs follow the maintained
  [macOS sleep guard and power condition](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos):
  on AC use `caffeinate -s -i`; on battery plug in, or run awake with the lid
  open under `caffeinate -i` and read the sleep log afterwards.
- Failure policy: [Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests)
  applies as written, including local/CI differences and owned CI repair.
- Cumulative design: one closure reading with three outcomes feeds both record
  writers and one Done reading; no second recognizer for returns. Slice 1
  alone is a safe stop: returned launches close and read "Done".
- Refinement: not needed; two Behavior slices, each with one outcome and
  proof loop, no preparatory Structure.
- Remaining slice-specific concerns: none identified.
