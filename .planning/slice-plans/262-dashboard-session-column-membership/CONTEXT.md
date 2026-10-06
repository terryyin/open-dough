# Reviewed session column context

Static discovery and baseline observations for the [executable plan](PLAN.md).
Scope, promise ownership, slices and execution context remain in that plan.

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

## Reviewed sizing and construction

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

## Accepted execution proof


Slice 1: the built dashboard's real launch/published-membership journey captures
native and host-qualified identity in `cardSessionListing.ts` and observes one
column occurrence through Preparing, Taken, reload and manual Done. Held-read,
refused Done, reopen, matching done-card and edge-count assertions passed.
The reached attribution, native-state, saved-detail, terminal/report, deletion
and continuation consumers preserve their purpose at the actual single entry.
No persistence or native-completion change. Open orphan/ad hoc placement remains
the explicit interim behavior owned by slice 2. Independent refactor completed;
its extraction/loop changes passed focused replacement proof and typecheck.
All commands selected Node 24.21.0 via the Execution context PATH; test services
ran with authorized loopback/Git-fixture access. Terminal results:

- `env -u NO_COLOR -u FORCE_COLOR PATH=/private/tmp/open-dough-node-24.21.0/node-v24.21.0-darwin-arm64/bin:$PATH npm run test:dashboard -- agent-launch-card-sessions.spec.ts session-sidebar-reading.spec.ts agent-launch-card-done.spec.ts agent-terminal-done-reopen.spec.ts recently-done-story-sessions.spec.ts --workers=2` — exit 0, eight tests.
- `env -u NO_COLOR -u FORCE_COLOR PATH=/private/tmp/open-dough-node-24.21.0/node-v24.21.0-darwin-arm64/bin:$PATH npm run test:dashboard -- agent-launch-card-sessions.spec.ts agent-launch-recent-sessions.spec.ts agent-terminal-done-codex-page.spec.ts agent-launch-codex-observation-boundary.spec.ts --grep 'a card lists each|lists each launch newest|Codex done|native interrupt refusal|predecessor without continuation' --workers=2` — exit 0, six selected tests, resolving two old duplicate-target assertions from the otherwise passing affected-consumer run.
- `env -u NO_COLOR -u FORCE_COLOR PATH=/private/tmp/open-dough-node-24.21.0/node-v24.21.0-darwin-arm64/bin:$PATH npm run test:dashboard -- agent-launch-card-sessions.spec.ts agent-launch-model-entries.spec.ts agent-launch-options-entries.spec.ts agent-launch-preparation-workspace.spec.ts agent-launch-session-state-pace.spec.ts --workers=2` — exit 0, ten tests after refactoring.
- `env PATH=/private/tmp/open-dough-node-24.21.0/node-v24.21.0-darwin-arm64/bin:$PATH npm run typecheck:dashboard` and `git diff --check` — exit 0 after implementation and refactoring. Project `npm run format` — exit 0 before staging.

## Slice 2 proof

Accepted at the built dashboard/local service boundary, with raw machine,
published Git/done records and synthetic native transports. Setup supplies
starting facts; actual page assertions observe placement and operations.
`session-column-membership` owns mixed counts/order, direct Start/refusal/Done
and last-local deletion; `agent-launch-card-sessions` owns no-reload published
completion/return and unchanged attachment counts. `recently-done-story-sessions`
observes two distinct closed launches alongside an open Taken session, and
independent published-card expiry/local retention. Held read/access/regroup and
incomplete edge navigation use actual answers and paused clocks.
MarkRead and automatic/manual Done distinctions remain observed by the report
journeys and `completionRecoveryIntent`/`completionRecoveryFaults`; shared
launch, Cursor, membership, paging and recent-fixture consumers were inventoried.
The mechanical standaloneSessionName rename leaves labels/setup/assertions
unchanged; typecheck proves imports. Every command reached a terminal result.

- Core final placement, Done/refusal/focus, mixed counts, closed grouping/retention, live membership/attachment and navigation: `env -u NO_COLOR -u FORCE_COLOR PATH=/private/tmp/open-dough-node-24.21.0/node-v24.21.0-darwin-arm64/bin:$PATH npm run test:dashboard -- session-column-membership.spec.ts recently-done-story-sessions.spec.ts agent-launch-card-sessions.spec.ts recently-done-read-latency.spec.ts session-sidebar-navigation-cases.spec.ts --workers=2` — exit 0.
- Last-local deletion, closed access, corrected deletion baseline, paging/sidebar counts: `env -u NO_COLOR -u FORCE_COLOR PATH=/private/tmp/open-dough-node-24.21.0/node-v24.21.0-darwin-arm64/bin:$PATH npm run test:dashboard -- session-column-membership.spec.ts recently-done-read-latency.spec.ts agent-launch-recent-delete.spec.ts agent-launch-recent-delete-unavailable.spec.ts dashboard-columns-paging.spec.ts dashboard-columns-paging-side-panel.spec.ts dashboard-columns-paging-sessions-sidebar.spec.ts session-sidebar-reading.spec.ts --workers=2` — exit 0.
- Report/read, automatic Done/clear, attribution, ad hoc, retained workspace and responsive consumers: `env -u NO_COLOR -u FORCE_COLOR PATH=/private/tmp/open-dough-node-24.21.0/node-v24.21.0-darwin-arm64/bin:$PATH npm run test:dashboard -- agent-launch-ad-hoc-sessions.spec.ts agent-launch-ad-hoc.spec.ts recently-done-stories.spec.ts session-sidebar-reading.spec.ts agent-launch-recent-delete.spec.ts agent-launch-recent-delete-unavailable.spec.ts dashboard-columns-paging.spec.ts dashboard-columns-paging-side-panel.spec.ts dashboard-columns-paging-sessions-sidebar.spec.ts session-unread-report.spec.ts session-unread-report-message.spec.ts agent-completion-quiet.spec.ts agent-completion-recovery.spec.ts session-workspace-retirement.spec.ts responsive-session-start.spec.ts responsive-session-access.spec.ts agent-terminal-avatar.spec.ts agent-launch-attention.spec.ts --workers=2` — exit 1 only for three stale observations corrected by the preceding replacement; all remaining observations passed.
- All reached startedSession/Cursor reading consumers, Codex identity/recovery/model, native Working with saved Done/refusal/reopen, unresolved creation and project lifecycle: `env -u NO_COLOR -u FORCE_COLOR PATH=/private/tmp/open-dough-node-24.21.0/node-v24.21.0-darwin-arm64/bin:$PATH npm run test:dashboard -- session-sidebar-reading.spec.ts agent-launch-ad-hoc-codex.spec.ts agent-launch-ad-hoc-codex-recovery.spec.ts agent-launch-ad-hoc-cursor.spec.ts agent-launch-ad-hoc-cursor-split-screen.spec.ts agent-terminal-cursor-launch-page.spec.ts agent-session-cursor.spec.ts agent-terminal-cursor-page.spec.ts cursor-runner-sessions.spec.ts agent-launch-cursor-model.spec.ts agent-launch-codex-model.spec.ts agent-terminal-theme.spec.ts responsive-session-start-codex.spec.ts project-restored-session.spec.ts project-remove.spec.ts agent-launch-ad-hoc-terminal.spec.ts agent-launch-ad-hoc-problems.spec.ts agent-terminal-done-codex-page.spec.ts agent-launch-codex-creation.spec.ts --workers=2` — exit 1 only for the newly added held-edge assertion; unaffected observations passed.
- Corrected incomplete edge navigation before held records answer, settled empty counts: `env -u NO_COLOR -u FORCE_COLOR PATH=/private/tmp/open-dough-node-24.21.0/node-v24.21.0-darwin-arm64/bin:$PATH npm run test:dashboard -- session-sidebar-reading.spec.ts --workers=2` — exit 0 after literal spacing and viewport floating-point tolerance corrections.
- Independent refactor replacement for shared stage projection/count/completeness and navigation: `env -u NO_COLOR -u FORCE_COLOR PATH=/private/tmp/open-dough-node-24.21.0/node-v24.21.0-darwin-arm64/bin:$PATH npm run test:dashboard -- session-column-membership.spec.ts session-sidebar-reading.spec.ts recently-done-read-latency.spec.ts dashboard-columns-paging.spec.ts session-sidebar-navigation-cases.spec.ts agent-launch-ad-hoc-sessions.spec.ts agent-launch-card-sessions.spec.ts --workers=2` — exit 0.
- `env PATH=/private/tmp/open-dough-node-24.21.0/node-v24.21.0-darwin-arm64/bin:$PATH npm run typecheck:dashboard` and `git diff --check` — exit 0 after implementation/refactoring.
- Project `npm run format` first found one remaining style issue and expanded one spec past 250 lines. Prose-only cap repair preserved proof; the necessary formatter repeat exited 0. All changed files are within the cap after formatting.

## Accepted CI repair

Registered completion `70b6f62a51c0cec572047e16c3c1ac10fb225911` failed
run [37432066761](https://github.com/terryyin/open-dough/actions/runs/37432066761),
attempt 1. Its fourteen observations exposed unreplaced open-session column and
published-card assertions, a direct Cursor test-entry import cycle, and an
actual late-Done response stealing the replacement terminal's keyboard. The
repair captures the panel request before awaiting Done and leaves a later
panel's focus alone; no native completion or placement policy changed. The
Cursor spec reads the existing public host lookup, preserving capabilities.
Recovery now observes the same saved native id once in Taken before/after
continuation, no Recently done duplicate or invented published card, alongside
one thread, zero turns and startup reconciliation.

The independent refactor relocated the complete sidebar layout observation to
its existing page support, preserving toggles, viewport and hit-target proof.
Coordinator inspection accepted the guard and every changed assertion. All
verification ended; commands ran in this execution checkout with authorized
loopback access, with no reruns-until-green or relaxed timeouts.

- Minimal reproduced red focus/model observations: `env -u NO_COLOR -u FORCE_COLOR PATH=/private/tmp/open-dough-node-24.21.0/node-v24.21.0-darwin-arm64/bin:$PATH npm run test:dashboard -- dashboard/tests/agent-terminal-done.spec.ts:188 dashboard/tests/agent-launch-model-entries.spec.ts:111 --workers=2` — exit 1 at the reported assertions. Direct Cursor entry separately reproduced its collection ReferenceError.
- All failed observations' owning specs and established Cursor companions: `env -u NO_COLOR -u FORCE_COLOR PATH=/private/tmp/open-dough-node-24.21.0/node-v24.21.0-darwin-arm64/bin:$PATH npm run test:dashboard -- dashboard/tests/agent-launch-model-entries.spec.ts dashboard/tests/agent-session-cursor.spec.ts dashboard/tests/agent-launch-ad-hoc-cursor.spec.ts dashboard/tests/agent-terminal-cursor-page.spec.ts dashboard/tests/agent-terminal-keyboard.spec.ts dashboard/tests/responsive-session-recovery-ad-hoc.spec.ts dashboard/tests/session-sidebar.spec.ts dashboard/tests/accessible-overview-keyboard.spec.ts dashboard/tests/project-configuration.spec.ts dashboard/tests/responsive-session-reconciliation-kept.spec.ts dashboard/tests/agent-terminal-done.spec.ts dashboard/tests/agent-terminal.spec.ts dashboard/tests/project-add.spec.ts --workers=2` — exit 0.
- Strengthened recovery and affected placement/navigation/direct-Done regression: `env -u NO_COLOR -u FORCE_COLOR PATH=/private/tmp/open-dough-node-24.21.0/node-v24.21.0-darwin-arm64/bin:$PATH npm run test:dashboard -- dashboard/tests/responsive-session-recovery-ad-hoc.spec.ts dashboard/tests/session-column-membership.spec.ts dashboard/tests/session-sidebar-navigation.spec.ts dashboard/tests/agent-launch-card-done.spec.ts --workers=2` — exit 0.
- Refactor replacement for the same actual sidebar layout journey: `env -u NO_COLOR -u FORCE_COLOR PATH=/private/tmp/open-dough-node-24.21.0/node-v24.21.0-darwin-arm64/bin:$PATH npm run test:dashboard -- session-sidebar.spec.ts --grep "lists every project's open sessions" --workers=2` — exit 0.
- `env PATH=/private/tmp/open-dough-node-24.21.0/node-v24.21.0-darwin-arm64/bin:$PATH npm run typecheck:dashboard` and `git diff --check` — exit 0 after implementation and refactoring.

Earlier attempts were classified separately. Slice-one run 37427204231/1's
recovery lookup was already fixed in slice two, with local and later hosted
proof. Slice-two run 37431359551/1 has the same fourteen observation failures as
the completion run. Seven retained failure events were acknowledged only after
this bounded classification; the same observer and repair ownership remain.
The resumed retrospective accepts this bounded repair under the original
contract; its queue advice remains unchanged. DD-242 records the Codex binding's
missing acknowledgment boundary, with inferred and observed effects separated.

## Closure inputs

Branch CI for accepted repair `49555075912e8d106e7214965a9871bb6b9c4d9c`
passed run 37434529261/1; completion confirmed observer shutdown with all seven
failure events acknowledged. Consumer discovery found no agreements and three
older non-story anchors in SEED-001, SEED-010 and SEED-028. Their current text was
inspected, names no dependency on this story, and remains unchanged; the discovery
format gaps are retained, not reported as repaired. The shared North Star topic
still governs active SEED-113 observer work and remains.
