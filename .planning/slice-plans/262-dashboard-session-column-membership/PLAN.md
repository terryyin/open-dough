# Sessions appear with active work until marked done

**Identity:** SEED-114#session-column-membership
**Source:** [refined story](../../seeds/SEED-114-dashboard-session-column-membership.md#session-column-membership).
**Prepared:** 2026-10-06. Planning only, in the existing preparation workspace
on `codex/refine-dashboard-session-column-membership`.

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

## Existing solutions and current decisions

PFE found one machine-session owner in `dashboard/src/agentLaunches.ts`.
`agentLaunch.ts` already supplies selected-project records, project/story
matching, open card sessions, and the saved-done predicate. Reuse these facts.
Native Working, input, review, unavailable, stopped, or unknown readings never
determine the session's column. Existing manual and automatic operations that
record or clear `doneAt` remain authoritative.

The defect is a presentation rule: `RecentlyDone.tsx` groups every record of
a shown done story and lists every remaining record, including open sessions
already nested in active cards. `dashboard/AGENT-LAUNCH-HISTORY.md` explicitly
requires that current rule. Change its rule and the overlapping journeys
together; there is no missing saved story association to repair.

`DashboardColumns.tsx` assembles the three views and column-edge summaries;
`WorkStages.tsx` renders published Backlog/Taken cards and their heading counts.
Derive the local column view from the same published membership and machine
records using ordinary functions, and supply its lists and completeness to
both rendering and counts. Keep `PublishedWork` and its backlog readers purely
published evidence. A standalone local session is a session entry, never a
fabricated `WorkEntry`, story priority, slice-progress record, or published Take.
Extend this projection through the slices rather than adding a second store,
persisted column field, placement registry, or rules per workflow/host.

Reuse `SessionEntry`, `StorySessions`, `SessionList`, `DoneStoryCard`, and the
existing record actions. `SessionEntry` currently exposes Mark as done only
on a card or after a native-done problem; its open standalone Taken form needs
the existing supported control without inheriting an invented story.
`launchRecordActions.ts` already updates the one session by host-qualified key.
`pageSidePanel.ts` and `PageFrame.tsx` own one shown terminal/report, independent
of project and column placement. Keep that identity and attachment lifecycle.

The caller search across dashboard, source skills, tests, installed scripts,
and planning records found `stagesOf` and `recentlyDoneColumn` consumed only by
the column assembly/rendering; card-session matching also serves `CardLaunches`
and `WorkCard` for launch protection and highlighting. `recentlyDoneEntry` is
used by `sessionNavigation.ts`, itself called by `PageFrame.tsx`;
`deletedEntryHome` is called by `pageSidePanel.ts`. Their present assumption
that a standalone entry lives in Recently done must change with the entry.
Prefer the actual session element across the columns before a story fallback:
a closed session may be in Recently done while its story remains active.
Retain the valid original return control; when it disappeared, find the same
session where it is now. Deletion needs neighbors and the containing column
or card as fallback, including standalone Taken entries.

Follow [Architectural North Star — one backlog interpretation, separate
observation and presentation](../../NORTH-STAR.md#one-backlog-interpretation-separate-observation-and-presentation)
and [agent launch as a requested assignment](../../NORTH-STAR.md#agent-launch-as-a-requested-assignment).
The [UX/UI North Star](../../../docs/dashboard-ux-ui-north-star.md) preserves
local versus published meaning, reading uncertainty, and usable navigation.
Accepted [ADR 0000](../../../docs/adrs/0000-use-adrs-accepted.md) keeps this
feature-local decision with the feature;
[ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md) and
[ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
support coherent vocabulary, one authoritative fact, and incremental delivery.
The index and record statuses agree: 0000–0006 are Accepted, 0007–0009 Proposed.
No relevant supersession or conflict was found. The existing direction covers
this change; no new North Star topic, ADR, or human exception is needed.

## Decisive premises and observations

Observations ran against product code at
`61baa0ec942044dd43a761415dc1aa53bafc94c7`, before implementation, with Node
`v24.5.0`. The workspace and integration checkout have identical locked
dependencies; a temporary workspace symlink reused the installed dependencies.
Playwright builds the actual dashboard and serves its preview through the real
local read/launch boundary. The fixtures supply raw published files, real
test-owned Git histories, raw machine records, synthetic native transports and
GitHub answers. They do not inject a prepared dashboard snapshot or use live
accounts. Temporary dependency linkage is removed after observation.

| Premise | Consumer | Literal observation and result |
| --- | --- | --- |
| A launched story session already has the right association; the old recent list creates the duplicate. | Slice 1's remedy and proof. | O1's `agent-launch-card-sessions.spec.ts` launched three real fixture sessions and published Preparing, Taken, and completion through the installed commands. The same records stayed inside their own active cards, while the existing final assertion also found all three in Recently done, including the two still on active cards. It passed, reproducing the duplication. The `newestFirst`/`listedOf` source and history contract explain the rule. |
| A no-story start is already a durable session with done/reopen access, but its current home is Recently done. | Slice 2's change and sizing. | O1's `agent-launch-ad-hoc-sessions.spec.ts` used actual Start session, cross-project sidebar selection, terminal Mark as done, successful reopen and reload. Its old open-in-Recently-done assertions passed. The blocked and unreadable-native-list cases retained the same record and delete action. |
| Saved Done, native activity, refusal, and native attachment are separate facts. | Both slices' preserved lifecycle; slice 2's movement. | O1's card-done journey recorded local Done despite unavailable native rename and retained placement on a refused mark. Its page-reopen journey cleared the mark through real attachment. O2's `agent-terminal-reopen.spec.ts` observed raw HTTP/socket attach clearing the mark durably across server restart, and a refused upgrade preserving it. All passed. |
| Reading a report does not close a session; the existing automatic completion path does record a done mark. | Slice 2's classification without completion-policy changes. | O2's `session-unread-report.spec.ts` drove installed reporting and Mark as read, observed no `doneAt`, no native stop and continued Working, then explicit Mark as done. `agent-completion-quiet.spec.ts` exercised installed Land and both Wrap Up closures, observed the receiver's saved done mark and the real page's Done entry without native interruption. All passed. |
| New attention can clear automatic Done while later reports preserve deliberate local Done. | Slice 2's existing clear-mark path and regression scope. | O4's agent-completion-recovery journey ran the installed reporting child after actual closure/retirement. Its completionRecoveryIntent consumer observed quiet Done replaced by a newer attention message with no doneAt, reloaded the actual page with that message, then recorded manual Done and preserved it through a newer unfinished report, receipt retries and restart. It passed. |
| Done-card grouping, story chronology, expiry, and held/failed reads have real page consumers. | Slice 2's closed-session grouping and access. | O1's `recently-done-story-sessions.spec.ts` consumed raw shared-renderer done records and raw machine records through the preview. Its old open-and-closed grouping, later-launch ordering, and expired-story standalone assertions passed. O2's done-read-latency journey held a raw GitHub done-content answer, observed local entries while Taken ownership/clocks remained useful, then released it to obtain cards; the paused-clock 30-second bound produced a column-local gap. |
| Entry reveal and edge counts use the real column surface, and unread machine records are not established absence. | Slice 2's navigation, counts and loading. | O2's `dashboard-columns-paging-sessions-sidebar.spec.ts` selected a sidebar session in a narrow page and revealed its actual hidden story column. O3's paging journey observed heading/edge counts and keyboard handoff through real edge controls. Its sidebar-reading journey held the records HTTP answer, observed Reading sessions and protected Starts, then released it and observed the actual launched entry and sidebar. All passed. |
| Unresolved native creation is reachable evidence without a trustworthy session ID. | Both slices' exclusion of unconfirmed sessions. | O3's `agent-launch-codex-creation.spec.ts` lost the fake native creation identity, restarted the real boundary and observed preserved reconciliation advice on the story and recovery surface, no confirmed machine sessions and no first input. Its known-identity storage refusal preserved explicit continuation advice. Both passed. |

Literal commands, run from the preparation workspace, all exited successfully:

```sh
# O1 — reported placement and existing manual lifecycle
env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- agent-launch-card-sessions.spec.ts agent-launch-ad-hoc-sessions.spec.ts recently-done-story-sessions.spec.ts agent-launch-card-done.spec.ts agent-terminal-done-reopen.spec.ts --workers=2

# O2 — read gaps, report/completion meaning, reopen, and narrow navigation
env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- recently-done-read-latency.spec.ts session-unread-report.spec.ts agent-terminal-reopen.spec.ts dashboard-columns-paging-sessions-sidebar.spec.ts agent-completion-quiet.spec.ts --workers=2

# O3 — initial machine read, counts, and unresolved creation
env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- session-sidebar-reading.spec.ts dashboard-columns-paging.spec.ts agent-launch-codex-creation.spec.ts --workers=2

# O4 — automatic Done cleared by later attention, deliberate Done preserved
env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- agent-completion-recovery.spec.ts --workers=2
```

These are baseline observations, including passing expectations for the old
placement, not proof that the remedy is delivered. Execution changes those
expectations to the source's table at the actual consumer boundary.

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
Status: planned
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
Status: planned
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

No numeric slice target, hard limit, or effort bands were supplied. Slice 1 has
the reported association/projection proof loop; slice 2 completes the same rule
at standalone rendering and its existing lifecycle/navigation consumers.
Slice 2 is larger, but observed starts, done marks, reopen, reports, held reads
and paging already supply its paths. Splitting its counts, controls, or focus
into later activity-only slices would leave the moved entry unusable or the
column dishonest. No separate Structure slice is justified. If implementation
disproves a premise or boundedness, stop safely and revise the remaining plan
within this outcome; a changed story boundary or disputed decision stays with
Terry.

Construction review found no remaining slice-specific concern about boundaries,
cumulative design, proof ownership or sizing. Slice-plan refinement was not
needed: the two proof loops preserve one placement rule and include each
changed surface's consumer, with the named slice-1 interim behavior replaced
by slice 2. Record readiness on the source against the reviewed story and plan
digests after this plan exists.
