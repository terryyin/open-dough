# Sessions appear with active work until marked done

**Identity:** SEED-114#session-column-membership
**Source:** [refined story](../../seeds/SEED-114-dashboard-session-column-membership.md#session-column-membership).
**Prepared:** 2026-10-06. Planning only, in the existing preparation workspace
on `codex/refine-dashboard-session-column-membership`.

## Execution context

Started 2026-10-06 in Story Branch Mode. Originating and integration checkout:
`/Users/terryyin/git/open-dough`. Owned execution workspace:
`/Users/terryyin/git/open-dough/.worktrees/dashboard-session-column-membership`,
branch `codex/dashboard-session-column-membership`, created for this story.
Publisher: `20f093cd-c5a4-4a42-a270-39ad64448a26`; agent: `terry-chan`.
Starting revision: `fdc9de0a773498c02b1e4d115e166995cb5facc8`.
Accepted Take: `8122c552d4efbab66dbb2c15ba766134eddbe054` on `origin/main`;
the same revision establishes the remote execution branch. Preparation was
published and its assignment released before Take. Plan number changed from
261 to 262 because another preparation published 261 before this plan landed.

Increment target: `origin/refs/heads/codex/dashboard-session-column-membership`.
Replanning remains authorized within the existing story and planning scope.
The Take's main-target CI is unobserved; execution increments use one observer
for the execution branch, GitHub Actions selector `ci.yml` (push-triggered).
The selector query succeeded with no branch run yet.

CI observer: repository `terryyin/open-dough`, target
`codex/dashboard-session-column-membership`, coordinator
`01a10fba-38b7-7b32-8b0b-c3f3910bbd6f`, execution checkout as above.
Codex yielded cell `103`, terminal session `77783`, directory
`/tmp/dough-ci-501/watch-XLyt1z`, process `53380`; state watching.
Workflow selector `ci.yml`, host bridge established by the yielded stream.

Checkout-local locked dependencies installed through `scripts/setup-native.mjs
npm` with the cached Node 24.21.0 runtime; browser acquisition and Chromium
prerequisite validation passed. `npm run typecheck:dashboard` passed there.
All execution commands select
`/private/tmp/open-dough-node-24.21.0/node-v24.21.0-darwin-arm64/bin` first on PATH.
No parent dependency installation is reused. Retain this workspace for all
implementation, refactoring, proof, delivery and review.

## Goal and boundaries

An open story session appears once, inside its current Backlog or Taken card.
Every other confirmed open session has a machine-local entry in Taken.
Recently done holds published recent done stories and retained sessions with
a saved done mark. Closing a session does not complete or Take its story.

Implement the source's placement table, membership changes, manual done and
reopen examples, truthful native activity, counts, loading, ordering, access,
and keyboard/navigation promises. Keep the same host-qualified session,
project/story association, attribution, reports, retention, and terminal owner.

The refined source's stated agent assumption remains: an open session whose
story leaves both active lists becomes a local Taken entry retaining its story
reference, even when its done-story card is visible. Only marked-done sessions
are nested in that done card. This is a reviewable default, not a human answer.

New completion policy, native host adapters, launch/start reconciliation,
published backlog interpretation, record persistence or schema, retention
windows, sidebar attention ordering, and general paging/layout redesign are
excluded. Unresolved creation evidence stays reachable and uncertain in its
existing recovery surfaces; it is not promoted into a confirmed session.
Observer sharing and independently arriving published details belong to their
existing stories and are not prerequisites for this placement change.

## Reviewed context

The [existing solutions, architectural decisions and baseline observations](CONTEXT.md)
supply the premises for this plan. Their literal commands are baseline
observations of the old placement, not implementation proof. The same
context preserves the reviewed sizing and construction assessment.

## Promise and proof ownership

| Final promise | Owning slice and observable proof |
| --- | --- |
| Open refinement/execution sessions appear only in their own active story card, follow Backlog/Preparing/Taken membership, and remain associated across reload. | 1: actual start and published-membership journey; count the host-qualified session across all three columns and retain start protection. |
| Confirmed open sessions with no active story card appear once in local Taken, retaining their saved identity when one exists; a done-story card contains only marked-done sessions. | 2: ad hoc Start plus published story removal/completion/return, mixed open/closed raw records, project isolation and reload. |
| Only the saved done mark moves a session to Recently done; refusal, Mark as read, and native activity do not. Local Done remains authoritative despite native stop/rename problems. | 2: entry and terminal done actions, refused request, read-report and native-reading changes, automatic completion regression; inspect saved records and truthful UI. |
| Successful reopen or an existing cleared mark restores the current open home; refused native readiness preserves closed placement. | 2: real successful/failed terminal attach plus the existing reporting-clear path; no new completion policy. |
| Published stories retain their recorded ordering and membership; standalone Taken entries follow them newest launch first. Done stories retain completion chronology and standalone closed sessions retain launch chronology. | 2: mixed-entry page journey with distinct raw times, later activity, story expiry and source-backed story cards; no Take/done record created by local session actions. |
| Heading/edge counts and emptiness describe the same top-level entries, including mixed/nested sessions; unread records or done facts are not a complete count or established absence. | 2: one Taken story with two nested sessions and one standalone session means two entries; empty published Taken with one session, held records, held/failed done content and settled-empty cases. |
| Retained closed-session access survives unread/failed done records, regrouping and published-card expiry without duplication. Existing 30-day local retention stays intact. | 2: raw done records through held answers and the existing bound, release/regroup once, an expired published card with a more recent local done mark, and existing store-retention regression if that contract changes. |
| Sidebar choice reveals the actual entry; terminal/report highlighting and keyboard return follow it after placement change, with deletion fallback in the containing list/column. Moving an entry alone does not attach/detach the terminal. | 2: narrow same/cross-project selection, open panel during membership/reopen movement, close/mark/delete controls, actual focus and native attachment counts. |
| Attribution, host support, reports, actions, and unresolved recovery evidence remain truthful and accessible. | Both: shared entry remains the renderer; affected existing attribution/report/action consumers run as regression proof. O3's actual unresolved-creation journey remains preserved without confirmed-session counts. |
| Maintained history and navigation wording match the delivered table. | 1 then 2: update `dashboard/AGENT-LAUNCH-HISTORY.md` with each delivered behavior and replace overlapping old-rule assertions, including shared fixture consumers. |

## Ordered slices

### 1. An active story owns its open sessions across the columns

Type: Behavior
Status: done
Proof: Extend `dashboard/tests/agent-launch-card-sessions.spec.ts` and
`session-sidebar-reading.spec.ts`; retain the affected card-done and
page-reopen journeys.

Behavior: Starting refinement or execution lists the confirmed session only in
its own active Backlog/Preparing/Taken card. Publishing a Take moves that same
session with the story. Reload retains the association. Marking the session
done leaves the story in its published list and lists the closed record in
Recently done.

Introduce the minimum column projection needed to exclude open records held
by active story cards from every Recently done path, including a matching
done-story card. Feed the same recent list to its edge count and rendered view.
Keep existing open-card matching and launch protection coherent with this
projection. Preserve record actions, native state and shared session rendering.
Update the history contract and assertions that currently require the active
session twice.

Use `launchJourney.ts`/`storyStagesPage.ts` for the actual installed start and
published membership sequence, with the real local service and synthetic
Claude. Capture native session identity once and assert one column occurrence
after launch, each membership update, and reload. Observe the card's state,
supported controls, original attribution and disabled Starts, not merely a
projection helper result. Observe the retained closed entry after Mark as done,
and no extra launch from moving the story.

Safe stop: The reported active-story duplication is removed, and closed-session
history still works. Until slice 2, open sessions with no active story card
retain their old Recently done placement/grouping. That explicit interim
trade-off is replaced by slice 2, not described as the final contract.

### 2. Every remaining open session belongs in local Taken

Type: Behavior
Status: done
Proof: Extend `agent-launch-ad-hoc-sessions.spec.ts`,
`recently-done-story-sessions.spec.ts`, the done-read-latency, sidebar-navigation
and column-paging journeys; add `dashboard/tests/session-column-membership.spec.ts`
only for uncovered combined membership/loading/interaction examples. Preserve
the automatic Done/clear journey in agent-completion-recovery.spec.ts and its
shared completionRecoveryIntent consumer.

Behavior: A confirmed open session without an active story card appears once in
Taken after the published stories, newest launch first. It keeps its title,
local wording, host, reports, native state and saved story reference. Only
marked-done records are grouped in visible done cards or standalone in Recently
done. A story completing/disappearing/returning changes the open session's home
without changing its native identity or completing it.

Complete the same projection from slice 1 using the common open/done rule,
active membership and recent done-card membership. Reuse the existing session
renderer for local Taken entries and offer its supported Mark as done action.
Use these actual entry sets and completeness for heading and edge counts and
empty/loading wording. Keep published ordering and progress separate; retain
uncertain creation evidence in its existing recovery surface and distinguish
it from session counts. Do not infer an absent story before published
membership is read or a final combined count before its needed inputs arrive.

Adapt `sessionNavigation.ts`, `pageSessions.ts` and the implicated panel-return
logic to resolve the actual session across columns. Keep the shown panel keyed
by host-qualified identity. On successful marking/reopen, allow the moved
entry to supply keyboard return when the original control vanished. On
deletion, return to the nearest surviving entry in its list, then its card or
column. Preserve existing confirmation, refusal, supported-host and retention
rules; invoke the existing operations, not a new lifecycle.

Outside-in examples own the complete transition and preservation loop:

- Actual no-story Start, direct entry Mark as done and terminal Mark as done,
  successful Open terminal/reload, and refused mark/reopen. Check one placement,
  the saved mark, open-sidebar membership, supported actions, keyboard return
  and truthful Working/problem wording when native stop/rename is unconfirmed.
- Publish completion/removal of a story while its open session is shown, then
  return it to an active list. Check standalone Taken retains its story
  reference, the done card holds only closed sessions, and movement alone
  leaves the open terminal and native attachment count unchanged.
- Supply one Taken story with two open nested sessions plus one standalone
  session; observe two entries in both heading and edge control. Verify
  published story order before newest-first local entries, no invented
  priority/progress and no empty-Taken message. Repeat with no published
  Taken stories, then after all sessions are closed, and with another
  project's records to exclude.
- Hold the real records HTTP answer and separately hold/fail raw done-record
  content. Observe reading/uncertain counts and usable established facts.
  Retain closed standalone access while done cards are unavailable; release
  the matching record and regroup once. Expire only the published done card
  while the local closed record remains within its own retention window.
- Select ad hoc and former-story sessions from Sessions in narrow same- and
  cross-project views; observe Taken revealed, current-session highlighting,
  the correct terminal/report, and focus after close, move, and deletion of
  the last local entry. Retain report reading without a done mark, automatic
  done/clear behavior and the existing native-readiness regressions.

Replace old placement assumptions in shared helpers and every affected journey
that consumes them; search their consumers before changing a helper. In
particular `dashboardPage.ts` membership assertions must distinguish published
story cards from standalone session articles, and recent-list fixtures must
use the open/done table instead of silently filtering expected results.
Keep unresolved-creation and native-state assertions meaningful. Finish the
maintained history/navigation contract with the final rule.

Safe stop: All source promises have outside-in proof, and the three columns
consistently distinguish current work from saved Done without changing
published story state or native completion policy.

## Verification, sizing, and delivery

Each slice owns its behavior, product edits, executable proof and refactoring
together. Extend real built-preview journeys using raw GitHub/store/native
boundary inputs. Do not substitute a helper-only test, forged view snapshot,
product test hook, live account, or elapsed sleep for the observable result.
Use existing held-answer and paused-clock controls for deterministic gaps.

Run the changed slice's specs and named affected regressions with
`env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- <spec files> --workers=2`.
Run `npm run typecheck:dashboard` for the changed typed projection, column
summary, and renderer contracts. These selected checks cover the changed
behavior and interfaces; a full suite is not a local gate merely because
hosted CI runs it. Broaden proof when a shared helper's changed contract affects
another actual consumer, including launch protection, attribution, reports,
done questions and native reopen. Existing host capabilities are preserved;
this common UI projection does not require a new native-host parity claim.

Use the installed post-change-refactoring and execution delivery workflow.
The required local commit gate is the check-only `.githooks/pre-commit`,
`npm run --silent lint -- --staged`; do not bypass it. Hosted validation and
repair stay with the authorized execution/publication workflow. This plan is
not execution or publication authority.

## Accepted execution proof

Historical slice-1 proof and terminal results remain in the linked
[execution proof context](CONTEXT.md#accepted-execution-proof).

Slice 2 completed the placement table, supported controls, counts/completeness,
ordering, retention, navigation and focus. Its [accepted proof](CONTEXT.md#slice-2-proof)
includes actual starts and operations, published membership movement with a
retained terminal, raw mixed/closed records, held reads and reached shared
consumers. Independent refactoring made one stage view authoritative for lists,
headings and edges. No persisted/native completion policy changed.

## Execution complete

Product advice: No queue changes or additional feature promises are warranted.
The delivered placement rule resolves the combined report while preserving
published story membership, native completion policy and the existing observer
work's scope. Wrap-up should align maintained dashboard surface descriptions
with local Taken entries; the final session contract and executable journeys
already preserve the lasting behavior.
