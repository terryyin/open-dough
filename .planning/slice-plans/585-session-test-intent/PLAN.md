# Express session discovery and report test intent

**Identity:** SEED-300#express-session-test-intent-through-page-objects
**Source:** [Story](../../seeds/SEED-300-dashboard-test-page-objects.md#express-session-test-intent-through-page-objects)
**Source review:** [Source review](source-review.md)

## Goal, scope and evaluation

A developer reading session tests in Intent can follow the session found,
selected, acted on or read. Shared session/report controls have one browser
owner; scenarios retain independent facts and causal evidence.

Resolve all three allocated findings and affected same-control/sequence siblings:
Session rows/actions/membership (slice 1), Sessions sidebar/Running Cursor
(slices 2–5), and Final report/retained sessions/workspace retirement (slice 6).
Preserve every distinct behavior check and frontend/integrated tier. No product
behavior change, speed or case-count promise, universal fluent conversion, new
framework, or unrelated sibling workflow migration is included.

Evaluation baseline: audit `7eab3d6ca`, reconciled with source at
`0c8463348062fcce9f2fa3d9b9e8879bacd10e9f` on 2026-11-12. Execution retains a
before/after for each finding: named user actions and independent outcomes,
selector/sequence edit sites removed, and added helper cost. The gain must
justify that cost; passing tests or relocating locators alone is insufficient.
Each slice owns its caller/finding dispositions, comparison, implementation,
proof and cleanup. Record those results here during execution. A direct
contract observation can remain direct with an evidence-backed reason.

## Architecture and existing solutions

Follow Accepted [ADR 0001 — Ubiquitous language](../../../docs/adrs/0001-ubiquitous-language-accepted.md),
[ADR 0002 — Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md),
[ADR 0008 — Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
and [ADR 0010 — Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
Index and in-file statuses agree; no relevant supersession or conflict was found.
The North Star's [Agent launch as a requested assignment](../../NORTH-STAR.md#agent-launch-as-a-requested-assignment)
keeps machine-local sessions distinct from published membership. Existing
structure supports this work; no new architectural topic or decision is needed.

PFE result: extend procedural/component owners and share them with fluent callers:

- `dashboardParts.ts` owns `storyCardSessions`, `sessionStateOf`, `sessionNamedBy`;
  `dashboardPage.ts` re-exports them. Extend the former seam rather than growing
  the 250-line facade. `storyCardSessionListing.ts`, `support/sessionEntryDisclosure.ts`
  and `support/markDone.ts` own listing, disclosure and causal Done-answer waits.
  Preserve a separately invocable non-waiting operation for held answers.
- `sessionsSidebarPage.ts` (238 lines) owns open-list parts/reading;
  `recentlyDoneSessionsSidebarPage.ts` (189) owns retained-list parts. Separate
  layout/geometry from entry reading if growth requires it, preserving callers.
- `support/sessionHostStatus.ts` mixes integrated setup with browser figures.
  Expose pure figure parts/assertions for both tiers, accepting expected
  count/text/words. Host sampling and setup keep their fixtures. The integrated
  real-host case currently uses production formatting to relate its answer to
  display; retain that transport observation alongside frontend literal formatting
  checks. Do not introduce production-derived expectations into shared readers.
- `runningCursorSessionsPage.ts` (232) mixes native fixtures with list controls.
  Modularize its pure `runningCursorParts`/`openRunningList` seam independently,
  retaining exports. Frontend callers must not acquire a runner.
  `cursorSessionsSidebarResizePage.ts` (125) owns divider mechanics/geometry.
- `recentlyDoneSelectionReport.ts`, `support/unreadReportPage.ts`,
  `support/reportTouchPage.ts` and `finalReportPages.ts` have separate setup,
  selection, touch and fluent roles. Share report-scoped browser reading, keeping
  exact-text observations distinct from the fluent containment observation.
  Callers supply expected text/title/session; Side panel frame controls retain
  their existing owner. No omnibus session object or fluent framework is needed.

Expected edits already exceeding the 250-line check have these slice 1 decisions:

| File at inspected revision | Cohesive reorganization and preserved proof |
| --- | --- |
| `sessions/agent-launch-story-card-sessions.spec.ts` — 272 | Move queued-card launch/listing and blocked-start observations into existing `storyCardSessionListing.ts`. Preserve Preparing, Taken, removed-story and Done transitions, reloads and separate uniqueness assertions. Run the whole spec and listing consumers. |
| `sessions/agent-launch-attention.spec.ts` — 257 | Separate Backlog/Preparing attention from Taken/project/local-session scenarios into capability-named specs; share setup through existing `storyCardOpenSessions.ts` (163 lines). Preserve all cases and scenario expectations. Run resulting specs and attention consumers. |

Recheck actual expected edits and sizes before implementation. Growth beyond the
check receives cohesive restructuring in its owning Behavior, not arbitrary cuts.

## Decisive premises and preparation observations

Observations used this owned worktree at `0c8463348062fcce9f2fa3d9b9e8879bacd10e9f`
on 2026-11-12. Trial source and injected faults were restored byte-for-byte before
preparation writes. These are bounded observations, not completed slices.

| Premise / consuming operation | Observation and result | Remaining boundary |
| --- | --- | --- |
| The actual integrated proof route builds/launches its fixture here. | Initial P1 stopped when server-bundle `mkdtemp` encountered missing local `node_modules`. `npm ci --silent` repaired checkout setup; P1 then passed 17/17 in 61.244 s. | Execution installs dependencies in its own checkout; parent resolution alone is insufficient. No failure was waived. |
| Browser controls can be shared across tiers without sharing startup. | P1 trial extracted `statusParts`/`expectFigure` into one browser-only module and `runningCursorParts`/`openRunningList` from native setup, retaining exports. Both frontend specs and integrated host-status/Cursor navigation passed. Trial `npm run typecheck:dashboard` passed. | Other callers remain execution's sweep; this is no suite-wide completion claim. |
| Shared figures detect an independent display-contract fault in both tiers. | P2 changed only the rendered figure title to `Broken figure title`. Both selected host-status cases failed at the shared title assertion against caller words. | Never weaken expectations to preserve reuse. |
| Retained-row proof distinguishes Select from Open. | P2 also made retained Select invoke `onOpen`. The linked-story case failed because Intent became unchecked. Its prior/restored passes exercised Select, retained report, separate Open, attachment and focus observations. | Keep separate operations, not a helper that selects and opens together. |
| Proof loops reach membership, keyboard/paging, resizing and passive report access. | P3 restored product behavior with trial extractions still applied: 25/25 passed in 87.147 s across 11 files, including P1 plus membership, keyboard, retained paging and Cursor resizing. | Execution still owns every changed/transitively affected case and before/after evaluation. |

Literal commands from this workspace; temporary proof JSONs retain run details:

```sh
# P1: 17 cases, seven files
OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed300-session-scratch.json caffeinate -i npm run test:dashboard -- tests/sessions/compact-session-entry.spec.ts tests/sessions/sessions-sidebar-host-status.spec.ts frontend-tests/sessions-sidebar-host-status.spec.ts tests/sessions/cursor-sessions-sidebar-navigation.spec.ts frontend-tests/cursor-runner-sessions-ui.spec.ts tests/sessions/recently-done-sessions-select.spec.ts tests/sessions/session-workspace-retirement.spec.ts --workers=1
# P2: deliberate faults, all three expected failures
OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed300-session-discrimination.json caffeinate -i npm run test:dashboard -- tests/sessions/sessions-sidebar-host-status.spec.ts frontend-tests/sessions-sidebar-host-status.spec.ts tests/sessions/recently-done-sessions-select.spec.ts --grep 'counts active and waiting|an unread host figure|selecting a linked done story from Intent' --workers=1
# P3: restored behavior, 25 cases
OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed300-session-restored.json caffeinate -i npm run test:dashboard -- tests/sessions/compact-session-entry.spec.ts tests/sessions/sessions-sidebar-host-status.spec.ts frontend-tests/sessions-sidebar-host-status.spec.ts tests/sessions/cursor-sessions-sidebar-navigation.spec.ts frontend-tests/cursor-runner-sessions-ui.spec.ts tests/sessions/recently-done-sessions-select.spec.ts tests/sessions/session-workspace-retirement.spec.ts tests/sessions/session-column-membership.spec.ts tests/sessions/sessions-sidebar-keyboard.spec.ts tests/sessions/recently-done-sessions-sidebar-paging.spec.ts tests/sessions/cursor-sessions-sidebar-resize.spec.ts --workers=1
```

Host choice before launch: Territory.local, 16 logical CPUs, 48 GiB RAM, load
4.78/6.44/8.88, about 2.55 GiB free plus inactive memory. Dashboard preview and
other agents were active. Battery 77%, machine awake. Bounded cohorts used one
worker under `caffeinate -i`; no timeout or promise changed. Recheck power/load
and competing work before larger execution cohorts. Durations describe this
host/selection only.

## Ordered slices

Outside-in proof ownership: bare spec stems below name files in `dashboard/tests/sessions/`; other integrated
paths are relative to `dashboard/tests/`. `frontend-tests/` names that separate
tier. Named specs are initial cohorts, extended by effect/consumer trace. Story examples 1–5 map to slices 1, 2, 3, 4–5 and 6; example 6 and shared
acceptance belong to every slice and its finding disposition.

### 1. Read Session entry actions and membership through shared owners
Type: Behavior
Status: done
Proof: `compact-session-entry`, `agent-launch-story-card-{sessions,session-states,delete,delete-problems,done}`, `agent-launch-attention`, `session-column-membership`, `session-management-touch`, `cursor-session-recovery-stops`, `session-unread-report` and `recently-done-{active-story-sessions,story-sessions}` specs. Retain session IDs, states/badges, confirmation/refusal, cross-surface uniqueness and kept-record assertions.

Behavior: Given a compact or multiply represented session, a developer follows
named disclosures/lifecycle actions and sees which session changes where, with
unchanged input, focus and placement contracts. Extend entry/listing/Done owners,
retain caller facts, and apply the oversized-spec decisions. Cancellation and
held-answer send/release remain separate. Safe stop: entry scenarios are readable
and green without sidebar/report migration; existing public callers still work.

Result (slice 1): Shared Session entry owners now live in `dashboardParts.ts`
(`sessionEntriesIn`, `sessionEntryShowing`, `sessionIdLineOf`, `openTerminalOf`,
unread/problem readers), `support/sessionEntryDisclosure.ts` (disclosure controls,
`deleteRecordQuestion`, `askToDeleteRecord`), `support/markDone.ts` (`keepOpen`) and
`storyCardSessionListing.ts` (queued-card launch, `expectStartsBlocked`). The audited
cohort plus 91 sibling files moved: 206+113 raw locator sites removed, 2 kept with
reason, about 61 helper lines added; the attention spec split into
`agent-launch-attention{,-taken}.spec.ts`; full-config `--list` unchanged (2674).
Before/after (compact entry cancellation): six-line `entry.getByRole("button",
{ name: "Keep open"/"Mark as done", exact: true })` sequence → `markAsDone(entry)`,
`keepOpen(doneQuestion(entry))` with keys and focus still inline. Proof: 28/28 cohort
(`s1-proof2.log`), 88 changed/consumer specs in four batches; whole-test timeouts at
load 42–56 in untouched setup waits passed reruns at lower load (CI owns the verdict
under the failure policy). Later slices also move their families' raw Session entry
sites onto these owners.

### 2. Follow sidebar navigation and retained reading place
Type: Behavior
Status: done
Proof: `sessions-sidebar-{keyboard,navigation,navigation-cases,order,reading,row,state-edge,stays-as-left,touch}` and `recently-done-sessions-sidebar*` specs, plus reached frame/sidebar and `navigation/board-paging-sessions-sidebar` callers. Retain exact keys, focus/row order, older paging, retained scroll and no-unintended-action evidence.

Behavior: Given open or Recently done sessions beyond the available room, the
developer follows named sidebar navigation around explicit keys, view changes
and read events, with expected destination and retained position visible.
Extend open/retained list owners, preserving distinct selection/report access
for slice 6. Safe stop: navigation improvements stand independently.

Result (slice 2): `sessionsSidebarPage.ts` gained `expectSessionsSidebar`,
`expectCurrentEntry`, `titles`, `row`, elapsed/details readers (layout moved to new
`sessionsSidebarLayout.ts`); `recentlyDoneSessionsSidebarPage.ts` gained
`showRecentlyDone`, `expectRecentlyDone`, `titles`; paging owns `byProjectOf`;
`pageShortcutsPage.ts` owns `markKeyboardPlace`/`expectKeyboardAtMark`/`keyboardWithin`.
About 150 raw visibility, `aria-expanded`/`aria-current`, header-click, heading and
`activeElement` sites removed across 33 files for about 60 helper lines. Before/after
(keyboard): spec-local `markFocused`/`stillFocused` evaluates plus paired sidebar and
toggle checks → `markKeyboardPlace` → `Meta+b` → `expectSessionsSidebar(page, "open")`
→ `expectKeyboardAtMark` (179 → 157 lines). Learning: while a side panel covers the
page the banner is hidden from the accessibility tree, so covering-page callers read
the sidebar alone. Proof 53/53 over 30 specs (`s2-proof-final.log`), refactor rerun 4/4.

### 3. Read host figures through one cross-tier browser observation
Type: Behavior
Status: done
Proof: Entire `sessions/sessions-sidebar-host-status.spec.ts` and `frontend-tests/sessions-sidebar-host-status.spec.ts` cohorts. Keep accessible name/title, value, icon/non-action checks, literal unavailable/formatting cases, contrast, read counts and visibility/clock transitions. P2 supplies discrimination evidence.

Behavior: Given synthetic or actual host answers, a controlled read changes the
figures and both tiers express expected counts/text/words through one browser
owner without acquiring each other's fixtures. Expose the observed pure seam
from `support/sessionHostStatus.ts`. Safe stop: both tiers remain independently
runnable with existing transport and formatting proof.

Result (slice 3): new browser-only `sessionsSidebarFigures.ts` owns the figure
locators and `expectFigure`; both host-status tiers import it, `sessionHostStatus.ts`
keeps sampling/setup. Two `expectFigure` and two `statusParts` copies plus an inline
any-figure regex removed for about 30 helper lines; every count and word stays a call-
site literal. Proof 6/6 (`slice3-host-status.log`), refactor rerun 4/4.

### 4. Follow Running Cursor discovery and selection
Type: Behavior
Status: done
Proof: `cursor-sessions-sidebar-{navigation,layout}`, `cursor-runner-sessions*`, and `frontend-tests/cursor-runner-sessions-ui.spec.ts`, extended to extracted-control consumers. Retain held answers, request ownership/peak, ask-gap clocks, runner states, chosen UUID/client, terminal destination and native calls/attachment evidence.

Behavior: Given a native held client or synthetic held answer, the developer
follows shared list expansion/discovery/selection while the case still explains
demand, collapse/visibility and the chosen session's destination. Separate browser
controls from native setup, preserving exports. Safe stop: frontend starts no
runner and integrated native evidence stays explicit.

Result (slice 4): new browser-only `runningCursorList.ts` owns `runningCursorParts`
(plus `listed`, `heldRows`), idempotent `openRunningList` and `collapseRunningList`;
`runningCursorSessionsPage.ts` re-exports `runningCursorParts` and keeps native setup. The frontend
copy of the opening, 19 held-row, 6 list-item, 6 opening, 2 collapse and 11 Session
entry raw sites were removed for about 20 new behavior lines. Held reads stay armed and
answered in scenarios. Proof 37/37 over 21 specs (`s4-proof.log`) plus 5/5 retained
consumers. Slice 5 inherits the resize page's own open sequence.

CI repair (run 43229686512 on e7f81af): `agent-completion-quiet` "Land retires real
accepted work…" pressed Read final report while Startup recovery was still reconciling;
the panel left between mouse-down and up. The spec now waits for
`parts(page).startupRecovery` to leave before pressing; the panel lookup has one owner.
Reproduced by holding card-detail reads; fix 12/12, refactor proof 19/19 + 2/2.

### 5. Read Running Cursor resize and reachability through its owner
Type: Behavior
Status: done
Proof: `cursor-sessions-sidebar-{resize,resize-lasting,size-kept,size-unkept}`, including `cursorSessionsSidebarFormerHeightCases.ts` scenarios and retained three-list room/touch callers. Keep pointer/key/touch modality, numeric bounds, stored/retained height, focus, geometry and absence of launch/attach/Done/Delete/runner-control requests.

Behavior: Given expanded overflowing lists, the developer reads named divider
operations and expected geometry/focus through resize, collapse, restore and
reload. Extend existing resize/list-layout owners; measurements remain
independent. Safe stop: resizing changes no session and needs no report migration.

Result (slice 5): `cursorSessionsSidebarResizePage.ts` owns `grab` → pointer
`{moveTo, release, cancel}`, `expectCursorHeight`, `keyDivider`, `expectScrollsOnItsOwn`,
`showCrowded`/`expandCrowded` (opening through `openRunningList`) and `heightOf`, typed by
`RunningCursorParts`. Specs lost 10 raw mouse-coordinate, 8 focus+press, 22 paired
divider/split and 13 scrollTop sites for a 68-line owner growth (specs −65 lines).
Contract values stay literal; resize keyboard reach stays raw because focus is under
proof. Proof 13/13 (`s5-proof.log`), refactor rerun 3/3.

### 6. Read retained selection and Final reports as distinct actions
Type: Behavior
Status: done
Proof: `recently-done-sessions-select*`, `session-unread-report*`, `final-report-touch*`, `agent-completion-*`, `session-workspace-retirement*` and report-reading Codex observation cases. Include reached fluent `navigation/side-panel-content-replacement`, retained sidebar navigation, `stories/recently-done-progressive-navigation-report` and `intent/intent-ci-status-side-panel` consumers. Preserve exact report text/title/session, unread/read state, receipts, store/filesystem/retirement, requests, attachment and focus.

Behavior: Given a linked or standalone retained session, the developer follows
Select and separate report Open/Close/Read operations and sees the required
Selected story, perspective and Side panel retained. A retired workspace remains
passively readable. Extend report/session owners while preserving exact-text
versus containment strength and touch geometry. Helpers neither resume nor attach
nor erase evidence. Safe stop: all findings have complete caller dispositions
and before/after evidence with unchanged product behavior.

Result (slice 6): `dashboardParts.ts` owns `readFinalReportOf`, `finalReportParts`
(panel, exact `reportText`, body, scroll, header `sessionName`/`shownSessionId`),
click-only `readFinalReport` and `sidePanelNamesOf`; the retained row's control is
`select(title)` beside `open(title)`; the fluent `FinalReport.expectText` keeps its
containment check on the same region. About 160 raw report, header, Close and Session
entry sites removed across 55 files for about 45 helper lines. Before/after (retired
workspace, held report): seven raw selectors → `readFinalReport(second)` with
`sessionName`, `shownSessionId` and the exact "Second conversation's own result" at the
call site, then `closeSidePanel`. Remaining raw sites are contract checks, different
elements or sibling Terminal/launch workflows. G6 moved cold preparation out of seven
specs' budgets; G7 replaced the only wall-clock wait. Proof 92/92 over 49 files.

## Execution complete

Product advice:
- Before integration, reconcile with trunk: since the claim, the review story
  (67bb91d54) and Terminal story (2137dfd0d) landed parallel owners for the same
  Open terminal, Read final report, Final report text and Side panel Close controls
  (`sessionEntryAccess.ts`, `finalReportPages.ts` `finalReportText`/`readReportUntilText`,
  `sidePanelFrame.ts`, `terminalScreenPage.ts`); merging trunk conflicts in 77 files.
  Keep one owner per control and keep bbcbbc3's causal Startup recovery wait over
  trunk's retry-until-text loop for the same flake; prove the merged state on branch
  CI first.
- Pass a literal open-session description into `storyCardSessionListing.ts`
  `expectStartsBlocked` instead of deriving it from production `openSessionStartReason`
  (story: observations must not manufacture expected facts from production values).
- Small residue for the same reconciliation: remaining hand-built Mark as done / Keep
  open / Session actions sites (session-attribution, final-report-touch,
  agent-terminal-done, retirement-attach, agent-session-cursor-done,
  session-management-touch, reportTouchJourney), the unused `runningCursorParts`
  re-export, dead `hostStatusAnswer`, `native-host-fixtures.md` naming
  `launchEachQueuedStory`, the frontend host-status spec importing `unreadSessions`
  from integrated support, and the Sessions heading/list locators defined in three
  sidebar owners.
- G8: cold preparation still counted inside 148 preparation-page tests' first-case
  budget is a latent flaky-test risk under the failure policy, not only speed; queue it
  as its own story.

## Verification, current decisions and concern review

- Each slice runs changed specs and transitive consumers, using `npm run
  test:dashboard -- <actual spec paths or quoted Playwright path regexes>
  --workers=1`. Braces above describe filenames, not executable Playwright
  selectors. Inspect changed selections with `--list`; preserve cases on moves.
- Capture original scenarios before edits; inspect setup and assertions. Run
  installed `consumer-trace.mjs --checkout <workspace> --base HEAD --term <effect>`
  for changed paths/exports, retired selectors and whole-surface observations.
  Follow helper exports to enclosing journeys and give each consumer a
  run/reused/excluded disposition. Include launch/recovery, frame/sidebar,
  progressive Done navigation, Intent and fluent Side panel entry points reached
  by session/report mechanics. Their unrelated workflows remain with siblings;
  shared code is no blocking story dependency.
- Run `npm run typecheck:dashboard` for shared TypeScript edits and the maintained
  formatting/lint gate for changed files. Hosted CI alone imposes no full local
  suite; a changed shared fixture/consumer can justify broader local proof.
  Published CI failures stay owned through applicable final CI.
- Use MakeMe for domain data; inputs, independent expectations, held releases
  and controlled-clock steps stay in scenarios. The installed selector resolved
  the three trial specs with both convention flags false; AGENTS.md and this
  story still govern. Recheck actual/new paths before test edits; configuration
  conversion is outside this story.
- Carry the [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
  as written, by this link or verbatim, into every delegation and repair handoff.
  No failure is excluded for predating the story. Preserve another active repair
  owner's files. Keep default timeouts; no wall-clock sleeps, `test.slow()` or
  suite/file/group/hook timeout overrides.
- Local gate: start fully awake; on AC use `caffeinate -s -i`; on battery plug
  in or keep the lid open under `caffeinate -i`, following the maintained
  [macOS sleep guard and power condition](../../../tests/local-test-resources.md#machine-sleep-on-macos).
  Inspect sleep logs when required; sleep invalidates rather than excuses a run.
- No numeric slice-time limit is supplied. Six cohesive Behavior/proof loops
  include restructuring and cleanup. Their common model is scoped browser
  actions/observations with caller facts; the lists keep their domain-specific
  rules and fixture lifecycles. No speculative common framework is warranted.
- Slice-plan refinement was not needed after construction split independent host
  figures and Cursor resize from navigation. No remaining slice-specific concern
  was identified in this bounded review. No human decision or blocking dependency
  remains. Record readiness against final story/plan digests; this preparation
  grants no Take or execution authority.

## Story obligations

### G1. Session entry sibling callers still build the shared controls by hand
Reported: slice 1 — "Acceptance found about 80 test files outside the initial cohort (launches/, terminals/, stories/, review/, navigation/, the remaining sessions/ specs and their helpers) still locating Open terminal, the two disclosures, Delete record, Keep open, .session-entry, data-shows-session and .session-state directly."
Story clause: "Resolve the three audit findings below and current same-control or same-sequence sibling callers"
Disposition: proved by slice 1: 206 raw Session entry locator sites in 91 dashboard/tests files moved onto openTerminalOf, sessionEntriesIn, sessionEntryShowing, sessionStateOf, sessionUnreadReportOf, sessionDetailsControl, askToDeleteRecord, sessionAction and keepOpen with 0 raw sites added; deliberate exceptions are non-entry elements, the local-entry child selector in localTakenSessions.ts and stronger regex absence checks; all 88 changed and consumer specs passed (s1r-batch logs, two load timeouts in untouched setup waits passed 8 reruns); sidebar, Running Cursor and report families remain with slices 2–6

### G2. Blocked-Start observation duplicated in the session-states spec
Reported: slice 1 — "agent-launch-story-card-session-states.spec.ts keeps its own expectStartsBlocked loop for the same disabled Start sequence now owned by storyCardSessionListing.ts."
Story clause: "Resolve the three audit findings below and current same-control or same-sequence sibling callers"
Disposition: proved by slice 1: dashboard/tests/sessions/agent-launch-story-card-session-states.spec.ts expectEveryStartBlocked calls storyCardSessionListing.ts expectStartsBlocked(action, queued.backlog) and keeps only the not-refined description check inline; passed in s1r batch run

### G3. Done-card closed-entry absence check uses exact control names
Reported: slice 1 — "recently-done-story-sessions replaced the non-exact /Open terminal|More session actions/ absence check with two exact-name absence checks through the shared owners."
Story clause: "Every distinct behavior check and existing test tier remains represented"
Disposition: proved by slice 1: dashboard/tests/sessions/recently-done-story-sessions.spec.ts asserts openTerminalOf(closedFirst) and sessionActionsControl(closedFirst) toHaveCount(0), the product's only names for those controls (same exact names every other caller asserts), passing in s1-proof2.log

### G4. Current-entry observation requires exactly one current row
Reported: slice 2 — "expectCurrentEntry's exactly-one-current check could fail a future scenario where a Recently done row is also aria-current while expanded; no current scenario does that."
Story clause: "shared sidebar operations express the destination and retained reading place"
Disposition: proved by slice 2: dashboard/tests/sessionsSidebarPage.ts expectCurrentEntry asserts the named entry's aria-current and a single current row, which every current open-list caller expects (s2-proof-final.log 53/53); a later scenario needing two current rows would state that in its own assertion

### G5. Cancelled-drag move starts from the divider centre
Reported: slice 5 — "The cancel step's 150 px downward move after pointercancel now starts from the divider's centre rather than its top-left corner."
Story clause: "shared controls expose the actual input and expected row/geometry/focus"
Disposition: proved by slice 5: dashboard/tests/sessions/cursor-sessions-sidebar-resize.spec.ts "a cancelled drag ends" still grabs, cancels with pointerId 1, moves 150 px down and releases, asserting the split stays at start + 120 before and after release (13/13 s5-proof.log); the start point inside the divider does not change what a cancelled drag must ignore

### G6. Side panel replacement first case nears its budget under load
Reported: slice 6 — "navigation/side-panel-content-replacement.spec.ts:66 timed out at 30 s three times as the first case of a fresh run at load 31–46, at different untouched steps; the coordinator's solo rerun at load 27–39 passed with that case taking 26.1 s."
Story clause: "Necessary proof-harness repair follows the project's failing/flaky-test policy."
Disposition: proved by slice 6: side-panel-content-replacement.spec.ts now runs under preparationPage.ts queuedCodexPreviewTest, whose worker fixture prepares origin, build and bundle outside the test budget; traces showed the first case's 15.4 s of in-budget origin/dashboard fixtures fall to 6.5 s, and a fresh run at load 46→40 passed 6/6 with the first case at 16.0 s (g6-before.log, g6-after2.log); six more slice-6 Claude/Codex specs moved to the same per-host opt-in (g6-firstcases-after.log)

### G7. Retirement spec waits on wall-clock time
Reported: slice 6 — "sessions/session-workspace-retirement-claude-done.spec.ts holds a route with setTimeout(300), a wall-clock sleep the project forbids."
Story clause: "Necessary proof-harness repair follows the project's failing/flaky-test policy."
Disposition: proved by slice 6: session-workspace-retirement-claude-done.spec.ts holds the story-details reads with holdAuthenticatedReadsWhere, waits until the opened page is reading them (details.held > 0), opens Session actions, releases in finally, then checks the control stays put after settled(); 9/9 with --repeat-each=3 (g7-retirement.log)

### G8. Preparation-page tests still count cold preparation in their budget
Reported: slice 6 — "Plain preparationPage test consumers (148 specs) still fetch the queued origin, app build and server bundle inside their first case's 30 s budget; a shared fix would need to prepare both hosts per worker, a run-time trade-off for a human. intent-done-source-selection's first case also stays near budget (25.5 s at load 29–43) from its own git arrangement."
Story clause: "test-speed promise"
Disposition: excluded "test-speed promise"
