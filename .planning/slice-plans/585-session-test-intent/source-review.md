# Source review

**Plan:** [Executable plan](PLAN.md)

Launch: fresh general-purpose sub-agent, no conversation inheritance, on
2026-11-12 during execution start by bastiaan-chan. Input: the story section
`SEED-300#express-session-test-intent-through-page-objects` (Goal, Scope, scope
limits, Key examples, Audit findings) plus the family's "Shared acceptance for
each receiving story", copied verbatim from
`.planning/seeds/SEED-300-dashboard-test-page-objects.md` (lines 592–716 without
the plan link, and 181–204). Instructions: use only that input, read no other
files, change nothing, return numbered commitments with separated compound
items. Ids below are the reviewer's, with kind omitted.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A developer reading session tests in Intent can follow which session is found, selected, acted on or read across the Board and Sessions sidebar | slice 6 | |
| 2 | Shared session controls and observations have one browser owner | slice 6 | |
| 2.1 | ...reducing mechanics edit sites | slice 6 | |
| 2.2 | ...while each scenario still explains the behavior it proves | slice 6 | |
| 3 | Resolve the three audit findings (F1 to F3) | slice 6 | |
| 3.1 | ...and current same-control or same-sequence sibling callers | slice 6 | |
| 4.1 | Express Session entry disclosure through shared session owners | slice 1 | observed: dashboard/tests/sessions/compact-session-entry.spec.ts discloses through sessionDetailsControl/sessionActionsControl with aria-expanded, sessionIdLineOf hidden then visible, Enter/Space/Escape and focus inline; passed s1-proof2.log |
| 4.2 | Express Session entry state/attention through shared session owners | slice 1 | observed: sessionStateOf and storyCardUnreadReportsOf/sessionUnreadReportOf in session-unread-report.spec.ts with literal '1 unread report' words; attention specs keep literal attentionCountsOn; passed s1-proof2.log |
| 4.3 | Express Session entry open through shared session owners | slice 1 | observed: openTerminalOf/openEntryTerminal in compact-session-entry (focus returns after Close), session-column-membership (refused reopening then focus) and 91 sibling files (G1); passed s1-proof2.log and s1r batches |
| 4.4 | Express Session entry Done/Delete through shared session owners | slice 1 | observed: markDoneAnyway/sessionAction(entry,'Mark as done') in agent-launch-story-card-done and askToDeleteRecord in agent-launch-story-card-delete(-problems), session-column-membership, session-management-touch; passed s1-proof2.log |
| 4.5 | Express Session entry confirmation/cancellation through shared session owners | slice 1 | observed: agent-launch-story-card-delete.spec.ts asserts asked.question toHaveAccessibleName(question), Keep and Escape as separate steps with stored() kept; keepOpen(doneQuestion) in compact and touch; held answers stay separate in delete-problems; passed s1-proof2.log |
| 4.6 | Express Session entry column placement through shared session owners | slice 1 | observed: sessionEntryShowing(board\|taken\|recentlyDone, key) with literal column counts in session-column-membership and recently-done-active-story-sessions; passed s1-proof2.log |
| 4.7 | Keep independent observations of the same session in a Story card, Column and Sessions sidebar when their agreement is the promise | slice 1 | observed: agent-launch-story-card-delete.spec.ts still checks card, Recently done and sidebar entries separately; story-card-sessions keeps separate Board and Recently done counts; passed s1-proof2.log |
| 5.1 | Express open sidebar navigation through suitable shared observations | slice 2 | |
| 5.2 | Express Recently done sidebar navigation through suitable shared observations | slice 2 | |
| 5.3 | Express keyboard focus through suitable shared observations | slice 2 | |
| 5.4 | Express paging through suitable shared observations | slice 2 | |
| 5.5 | Express retained scroll through suitable shared observations | slice 2 | |
| 5.6 | Express host figures through suitable shared observations | slice 3 | |
| 5.7 | Counts, CPU/disk values and accessible words remain caller facts | slice 3 | |
| 5.8 | Controlled reads and clocks still explain when a reading changes | slice 3 | |
| 6.1 | Express Running Cursor discovery through shared browser controls | slice 4 | |
| 6.2 | Express Running Cursor selection through shared browser controls | slice 4 | |
| 6.3 | Express Running Cursor reachability through shared browser controls | slice 5 | |
| 6.4 | Express Running Cursor resizing through shared browser controls | slice 5 | |
| 6.5 | Frontend synthetic answers remain separate from integrated runner setup and native attachment evidence | slice 4 | |
| 7 | Express retained-session selection separately from opening its Terminal or Final report | slice 6 | |
| 7.1 | Share report identity | slice 6 | |
| 7.2 | Share report title | slice 6 | |
| 7.3 | Share exact report text | slice 6 | |
| 7.4 | Share read/open/close mechanics | slice 6 | |
| 7.5 | Preserve passive access after workspace retirement | slice 6 | |
| 7.6 | Preserve attention/read state | slice 6 | |
| 7.7 | Preserve completion receipts | slice 6 | |
| 7.8 | Preserve independent filesystem, request and native-session observations | slice 6 | |
| 8.1 | Keep session identity explicit where it separates outcomes | slice 1 | observed: claude:<id> keys, sessionIdLineOf(entry, native) and Session <id> stay at call sites in compact-session-entry and agent-launch-story-card-sessions; passed s1-proof2.log |
| 8.2 | Keep expected state/badges and placement explicit where they separate outcomes | slice 1 | observed: literal state words, column counts ('2 entries') and expectMembership unchanged at call sites in session-column-membership and agent-launch-story-card-session-states; passed s1-proof2.log |
| 8.3 | Keep report text explicit where it separates outcomes | slice 6 | |
| 8.4 | Keep exact key/touch/pointer input and focus expectations explicit where they separate outcomes | slice 2 | |
| 8.5 | Keep held answers and release order explicit where they separate outcomes | slice 4 | |
| 8.6 | Keep native/HTTP/Git/record evidence explicit where it separates outcomes | slice 6 | |
| 9 | Domain setup stays with MakeMe | slice 6 | |
| 10 | Browser observations must not manufacture expected facts from the production value being checked | slice 3 | |
| 11 | Browser observations must not complete a held read as an incidental wait | slice 4 | |
| 12 | Accessibility and geometry contract checks retain their independent expectations | slice 5 | |
| 13.1 | No dashboard behavior change | slice 6 | |
| 13.2 | No test-speed promise | slice 6 | |
| 13.3 | No fewer-case promise | slice 6 | |
| 13.4 | No universal fluent conversion | slice 6 | |
| 13.5 | No new page-object framework | slice 6 | |
| 14 | Unrelated Terminal, launch, Board, review and settings workflows remain with their stories | slice 6 | |
| 14.1 | ...but shared session/report controls in those callers are included | slice 6 | |
| 15 | Reuse existing owners without making those stories execution prerequisites | slice 6 | |
| 16 | Necessary proof-harness repair follows the project's failing/flaky-test policy | slice 6 | |
| E1 | A compact entry hides technical details and lifecycle actions independently → the user discloses, opens, confirms or cancels an action → named session operations expose those steps, while the case still specifies its native session, state, focus and resulting membership in each relevant surface | slice 1 | observed: compact-session-entry.spec.ts Mark-as-done cancellation reads markAsDone(entry).click → keepOpen(doneQuestion(entry)) focused → Escape → markAsDone focused, with native session, state and membership kept in the case; passed s1-proof2.log |
| E2 | Open and Recently done lists contain more sessions than fit → the user walks them by keyboard, pages older entries, or changes view and returns → shared sidebar operations express the destination and retained reading place; exact keys, expected order/count and no-unintended-action evidence stay in the scenario | slice 2 | |
| E3 | Frontend synthetic and integrated host-status cases read the same figures → a controlled host/session read changes or is unavailable → one browser observation checks the caller's count, text, accessible name and title; fixtures keep their tiers and the case still explains read timing | slice 3 | |
| E4 | A Running Cursor list has a held native client, or a frontend held answer → the user expands, chooses, collapses or resizes the list → shared controls expose the actual input and expected row/geometry/focus, while native attachment and frontend request ownership remain separately observed | slice 5 | |
| E5 | A retained row is linked to a completed story, or is standalone → the user selects it, then separately opens its report → selection preserves the required perspective, Selected story and existing Side panel; opening shows the chosen session's exact report | slice 6 | |
| E5.1 | A retired workspace remains passively readable without resuming or attaching a conversation | slice 6 | |
| E6 | A maintainer reviews the migration → each finding and affected sibling has an evidence-backed disposition and a representative before/after → user actions and expected outcomes are clearer, shared mechanics have fewer edit sites, and that gain justifies the added helper cost | slice 6 | |
| E6.1 | Every distinct behavior check and existing test tier remains represented | slice 6 | |
| F1 | Session rows, actions and membership: share row operations and observations for open, inspect, confirm/cancel, and placement in Taken or Recently done | slice 1 | observed: shared row operations in dashboardParts.ts, support/sessionEntryDisclosure.ts and support/markDone.ts serve open, inspect, confirm/cancel and placement across the cohort and 91 siblings; passed s1-proof2.log and s1r batches |
| F1.1 | ...using the existing session-entry and mark-done helpers | slice 1 | observed: extended existing sessionEntryDisclosure.ts (askToDeleteRecord, deleteRecordQuestion, controls) and markDone.ts (keepOpen); no new framework |
| F1.2 | Keep separate checks for the same session shown in different surfaces where that is the promise | slice 1 | observed: agent-launch-story-card-delete.spec.ts and agent-launch-story-card-sessions.spec.ts keep independent card, Recently done and sidebar observations; passed s1-proof2.log |
| F1.3 | Affected: compact entry, story-card session rows, Delete, column membership, unread reports, Cursor recovery specs | slice 1 | observed: compact-session-entry, agent-launch-story-card-sessions, agent-launch-story-card-delete, session-column-membership, session-unread-report and cursor-session-recovery-stops migrated; passed s1-proof2.log |
| F2 | Sessions sidebar and Running Cursor: share the keyboard-walk, selection, paging, scroll-retention and resize observations and actions (currently built from locators, coordinates and raw focus checks) | slice 5 | |
| F2.1 | Share the expectFigure that the frontend and integrated host-status specs each define | slice 3 | |
| F2.2 | Share the opening of the Running Cursor list (duplicated in the frontend spec) | slice 4 | |
| F2.3 | ...without coupling frontend fixtures to integrated servers | slice 3 | |
| F2.4 | Affected: sidebar keyboard, kept scroll, Recently done paging, Cursor resize, integrated and frontend host status, frontend Running Cursor specs | slice 5 | |
| F3 | Final report, retained sessions, workspace retirement: expose report text, panel title, session ID and read/open/close mechanics through the report and session pages | slice 6 | |
| F3.1 | Keep exact report text visible | slice 6 | |
| F3.2 | Keep the distinction between selecting a session and opening its report visible | slice 6 | |
| F3.3 | Keep retired-workspace evidence visible | slice 6 | |
| F3.4 | Affected: Recently done selection, report reading by touch, completion attention, retirement attach, retirement and reports specs | slice 6 | |
| A1 | Each finding has a resolved disposition backed by the affected specs | slice 6 | |
| A2 | A representative before/after from each feature family shows the user action and expected outcome in domain terms | slice 6 | |
| A2.1 | ...with repeated locators and interaction sequences owned by shared helpers | slice 6 | |
| A3 | Prefer existing procedural helpers and component owners | slice 6 | |
| A4 | The fluent pilot supplies evidence for shared controls and recurring handoffs; adopt fluent phases where those benefits justify the extra code | slice 6 | |
| A5 | A shared control edit has one maintained selector owner for the affected callers | slice 6 | |
| A6 | A test of the exact name, accessibility contract or DOM measurement retains its independent expected value | slice 5 | |
| A7 | Use the audited source as the comparison baseline; weigh call-site clarity, edit sites and helper cost under the definition of improvement (ADR 0010) | slice 6 | |
| A8.1 | Held-read tests still show which action happens before the answer | slice 4 | |
| A8.2 | ...which user choice supersedes it | slice 4 | |
| A8.3 | ...and what stays selected after release | slice 4 | |
| A9 | Touch and keyboard tests still identify the actual input and expected focus | slice 2 | |
| A10 | Keep Git, HTTP, host and record evidence at the boundary it observes, along with the assertions that distinguish outcomes | slice 6 | |
| A11.1 | Preserve each distinct behavior check | slice 6 | |
| A11.2 | Preserve the existing test tiers | slice 6 | |
| A12.1 | Use MakeMe for domain data | slice 6 | |
| A12.2 | Use the existing causal waits | slice 6 | |
| A13 | Run the changed specs and the applicable dashboard gates under the project's failing and flaky test policy | slice 6 | |
