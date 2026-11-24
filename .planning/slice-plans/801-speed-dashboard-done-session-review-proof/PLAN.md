# Get fast proof of finding and reviewing Done sessions

**Identity:** SEED-413#speed-dashboard-done-session-review-proof
**Source:** [Get fast proof of finding and reviewing Done sessions](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-dashboard-done-session-review-proof)

## Goal and scope

Give Dashboard developers a faster focused run for the Done session workflow.
Follow a session from its project or story to the right review, comparison
and diff. Reconcile the roster with trunk at execution start.

Follow the [campaign acceptance](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#acceptance-shared-by-the-frontend-stories).
Live sessions and terminal internals, shared runner retirement, real Git,
publication and installation have their own owners. Preserve the separate
[renamed-path grammar correction](../746-prove-renamed-diff-grammar-from-new-path/PLAN.md).
Coordinate session-test cleanup with
[SEED-341](../../seeds/SEED-341-simplify-session-tests.md).

## Current decisions

- [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  distinguishes published work, machine session evidence and presentation
  state. Retain those inputs and their production owners. Select, Open and
  Review actions keep their own handoffs. Comparison choices, file reads and
  saved notes use the selected subject and exact trees, including after refresh.
- [Make production code directly testable instead of growing test support](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support).
  Reuse `mountComponent`, page-loadable MakeMe, the typed `PageReads` entry,
  and existing page operations. The Board frame and Intent Changes cases
  already exercise `ConfiguredDashboard` with typed published work and reads.
  Reuse that composition for state and navigation. Supply typed evidence at
  the production owner for display-only checks. Drive the real reader for
  pending, rejected, superseded and retried results.
- The mounted review specs offer proof precedents. Route new page-context
  cases through the real frame and Review request. Standalone cases use the
  production owner's inputs. Check callers before removing spent support,
  and keep `PageFrame.tsx` (250 lines) within its established responsibility.
- [Act as soon as the page allows](../../NORTH-STAR.md#act-as-soon-as-the-page-allows).
  Use retrying assertions on actual requests or rendered state. Use native
  input where it matters and preserve the recovery and late-styling proof.
- [Plain Vitest for unit tests; Playwright only for E2E](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e),
  [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  and [frontend test entry guidance](../../../dashboard/frontend-tests/README.md#which-entry-a-case-uses).
  Use production derivations for isolated domain rules, Chromium for rendered
  results, and named E2E journeys for real page reload or transport. Use
  the [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) and
  [page-object](../../../.agents/skills/dough-page-objects/SKILL.md) selection
  before authoring or changing a test.
- Under [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md),
  maintain an assertion map here as each slice lands. Identify the old case,
  distinct observations, and the replacement or existing equivalent by path
  and title. Check that an equivalent distinguishes the old regression
  before deleting it. Count setup, support and moved E2E proof in the cost.
  Seek a repeatable reduction in elapsed developer feedback time. The
  campaign's full-suite goal stays with runner retirement.

## Outside-in proof

| Starting evidence and action | Observed result | Slice |
| --- | --- | --- |
| Sessions reads retained work across projects and the reader expands or scrolls Recently done | Correct rows, order, completion age, accessible room and range through refresh | 1, 9 |
| A reader selects a linked or standalone Done row during another read | Intent or Development shows the right destination, preserves reading where applicable, and a stale answer cannot take over | 2 |
| A local launch or a published follow-up appears while the Board reads its catalog | One visible entry stands for the right session, and only resolved membership changes the source card | 3 |
| The reader follows a Taken follow-up's source beyond the visible range | The source is revealed or its specific gap is shown, with selection and any open panel preserved | 4 |
| A pending or failed read races a review-state change | The card and shown rows agree on that project's state, and obsolete answers cannot restore a cue | 5 |
| The reader opens Review from a card or a standalone row | The expected Review destination has the selected subject and keyboard focus | 6 |
| A finished session has multiple runs, missing evidence or no changes | The exact chosen comparison survives refresh, and the rendered result names its evidence truthfully | 7 |
| A selected file receives text or a note, or the panel narrows | The diff stays readable and width recovers; tokens and notes use the selected comparison | 8 |

## Baseline and decisive premises

Observed in the owned workspace on 2026-11-23 at `65dc71078`, Node 24.21.0
from the locked install, on macOS AC power. Unless qualified, commands ran
from the project root. These measurements apply to the selected Done and
Review families.

| Consuming operation | Observed form and result | Use in the plan |
| --- | --- | --- |
| Scoped selection | `caffeinate -s -i npm run --silent test:dashboard:frontend -- sessions/recently-done sessions/follow-up-source-navigation stories/recently-done review/ --list --reporter=line` selected 92 legacy cases in 37 files. The mounted listing names 19 files and contains parameterized titles. | The explicit legacy roster below replaces the earlier 77-case estimate. Measure executed cases from the proof record. |
| Baseline journey and timing | The same selectors with `--workers=2` in place of the listing flags passed both engines in 83.33 s elapsed; Vitest executed 107 cases. Explicit legacy paths at two workers also passed 92/92 in 56.07 s wall, including preparation, at one-minute load 7.59 → 6.83. The 19 explicit Vitest paths passed 107/107 in 18.83 s at load 9.69 → 14.90. | Reuse the baseline at this source revision, and pair runs on comparable load for the timing decision. Each slice uses the relevant legacy paths listed below and its replacement paths. |
| Published session and retained comparison | The focused run passed `published-session-subject.spec.ts`, `story-review-details.spec.ts` and the truthful toolbar specs with the real mounted Review owners, including the selected run through Refresh and gaps that retain their label. The legacy roster also passed the standalone Review entry and Done card captured-run journeys. | Reuse the comparison and request contracts. The existing mount leaves page handoff unobserved; retain that observation via the originating row or card. |
| Diff text and viewport proof | The focused run passed `story-review-diff-late-styling.spec.ts`, `story-review-files-divider-kept.spec.ts` and the legacy divider-room, note and syntax cases. Late text preserves position and context, and the preferred width serves a subsequent session. | Use the real diff reader for arrival and retry. Retain native frame resizing wherever the panel's room changes the result. Avoid assumptions about which existing assertion can replace a case until its behavior is checked. |
| Legacy run cost | The strict proof record reports all 92 passing on attempt zero, 103.86 summed case-seconds. The slowest cases were the Review panel room (6.05 s) and Sessions sidebar room (4.48 s). | Focus on composing the actual frame over typed inputs and preserving native layout proof. |
| Cross-project Done and follow-up evidence | The explicit legacy run passed `recently-done-sessions-select*`, `recently-done-published-session-story`, `follow-up-source-navigation` and the cue evidence and race files. They consume typed domain answers through the built frontend and see the project, selection, source, pending and stale outcomes named below. | Migrate the inputs to the page entry. Keep the actual association and review-state readers, and trace the new observations to those consumers. |
| Production page composition | At `731e01cad`, the normal frontend runner with `navigation/story-reference-done-reveal.spec.ts navigation/side-panel-width-kept.spec.ts intent/intent-story-compare-done.spec.ts --workers=2` passed 8/8. It reached a previously hidden Done card with keyboard input, kept frame width through reduced room, and retained a chosen run over a newer default. | Reuse the production frame and reader. Each migrated case still owns its distinct caller and observation. |

## Ordered slices

Paths are relative to `dashboard/frontend-tests/`. Each slice proves its
legacy assertions before deletion and removes support with no callers.

### 1. Find the right completed sessions in the sidebar

Type: Behavior
Status: done

**Roster.** Started from all seven cases in
`sessions/recently-done-sessions-sidebar{,-paging,-projects,-room,-touch}.spec.ts`;
the assertion map names what moved. Room, touch, reload and ticking age moved
to slice 9; Select and Open destinations moved to slice 2.

**Proof.** The production Sessions sidebar mounted in `ConfiguredDashboard`
over a case-owned machine reader that answers, holds or fails
(`sessions/recently-done-sidebar-mount-page.ts`). Across three projects it
proves project identity, newest-first order, completion and launch age,
empty versus reading, progressive scroll to 20/40/45 with tie order, the
range kept through collapse, hiding, project change, Select and refresh,
focus off a removed row, a failed refresh, independent open-list scroll and
the named, keyed divider.

### 2. Select the current Done destination without interrupting the reading

Type: Behavior
Status: planned

**Roster (12 cases).** `sessions/recently-done-sessions-select{,-ad-hoc-check,-check,-development,-supersede,-touch}.spec.ts`.

**Proof.** Mount the existing production frame with typed machine,
observation and Done reads. Resolve a linked story and a standalone row from
Intent, Development and the roster, including one older destination. Preserve
the current file or report where appropriate. Hold an association and then
choose a different row, project or Open. Settle the first request and check
that the later choice stands. Distinguish refusable, unreadable and absent
association evidence, preserve retry, and verify the separate touch actions
and narrow overlay. Take over the sidebar destinations slice 1 left in
`sessions/recently-done-sessions-sidebar{,-paging}.spec.ts`: Select switches
project and reveals the Board entry with no terminal, and Open's destination.
In the slice 1 mount Select pressed the row without switching project, likely
awaiting the association read this slice supplies. The real terminal attach remains in
`e2e/sessions/recently-done-sessions-select-open.spec.ts`.

### 3. Attribute a session to its resolved Done card

Type: Behavior
Status: planned

**Roster (15 cases).** `sessions/recently-done-{active-story-sessions,follow-up-grouping,follow-up-membership,published-session-story,story-sessions}.spec.ts`.

**Proof.** Drive Board through published snapshots and machine answers.
Exercise the production membership and deduplication rules beneath the
list for direct variants. Render a discriminating cross-machine arrival,
retained counterpart and ambiguous association, followed by an explicit
choice. Prove open, Done and reopened membership, originating card, source
project isolation, older standalone entries and top-level paging count.
Keep the documented real publication journey in
`e2e/sessions/recently-done-published-sessions.spec.ts`.

### 4. Reveal a follow-up's source without losing the current place

Type: Behavior
Status: planned

**Roster (6 cases).** `sessions/follow-up-source-navigation.spec.ts`.

**Proof.** Use the production Board and page range. With an older catalogued
source, activate by keyboard from Taken, reach and focus its card in reduced
motion, preserve selection and an open Side panel, restore the latest ten
and reveal again. Preserve the title/identity fallback and each distinct
read-failure or unlisted outcome. Compare the mounted Done reference
navigation proof for shared range and focus assertions, retaining the Taken
source control's dispatch.

### 5. Keep the current review state across a card and its session rows

Type: Behavior
Status: planned

**Roster (19 cases).** `sessions/recently-done-sessions-review-cue{,-evidence,-races}.spec.ts`,
`stories/recently-done-review-{cue,state,state-offer}.spec.ts`.

**Proof.** Use the existing per-project review state and shown-link readers.
Exercise pending and failed evidence separately from the successful update.
Observe both the matching row and card across save, confirmation and Unreview,
and release an obsolete result after the successful save or association
change. Check cross-project identity isolation, a newly revealed batch with
bounded requests, and that state changes preserve sessions and selection.
Consolidate repeated combinations where the reader and state transition are
shared. Keep distinct appearance, 44px control, long-title and touch proof.
Persist across actual reload and restart through the existing
`e2e/stories/recently-done-review-state-persistence.spec.ts` owner.

### 6. Open the review in its production reading surface

Type: Behavior
Status: planned

**Roster (10 cases).** `review/story-review-action.spec.ts`,
`sessions/recently-done-ad-hoc-review.spec.ts`.

**Proof.** Start from the real card actions and Review opening. Prove order,
wrap and keyboard handoff to Intent Changes. Use the production eligibility
rule for the distinct launch, preparation, claim and unavailable inputs
across Backlog and Taken. Render representative destination and focus
handoffs, including the standalone ad hoc row opening its own Review.

### 7. Review the evidence of the chosen session and run

Type: Behavior
Status: planned

**Roster (15 cases).** `sessions/recently-done-ad-hoc-{branch-result,comparisons,review-gaps,session-commits,session-runs}.spec.ts`,
`review/story-review-details-runs.spec.ts`.

**Proof.** Open the real review request from a standalone row or a Done
card where the subject differs. Render comparison and run choices through
the existing Review owner and typed source. Observe saved branch, delivery
and Default main choices, exact file and run endpoints, chronological runs
and retained selection through Refresh. Keep empty, missing, pending and
unverified evidence distinguishable. Retain local versus published
provenance and keyboard switching. Use the existing toolbar and details
specs for covered display states after checking their discriminating
observations. Real captured Git and published reviews keep their owners in
`e2e/review/recently-done-one-shot-review.spec.ts` and
`e2e/sessions/recently-done-published-sessions.spec.ts`.

### 8. Keep the displayed diff and notes tied to the selected comparison

Type: Behavior
Status: planned

**Roster (8 cases).** `review/story-review-diff-syntax-{appearance,arrival,intent-hints}.spec.ts`,
`review/story-review-{files-divider-room,note-context,notes}.spec.ts`.

**Proof.** Read file diff and text through `ReviewSource` and the production
diff. On failure keep plain lines, the context problem and Retry; after
retry style the same lines. Preserve isolated grammar-load failure,
snapshot versus later tip hints, and the appearance comparison with the
actual Intent source viewer. When the frame narrows, stacks, maximizes
and restores, verify the diff's room and the kept files width. Save a file
note and inspect its paths, exact baseline/tree and absent line. Keep the
real published note in `e2e/review/story-review-diff-add-note.spec.ts`.

### 9. Keep the sidebar's room, touch disclosure and reload

Type: Behavior
Status: planned

**Roster.** The cases slice 1 left in
`sessions/recently-done-sessions-sidebar{,-paging,-room,-touch}.spec.ts`
(see the assertion map).

**Proof.** Measure the three lists' floors, shared room with Running Cursor,
drag to floor, exact key step and short-window reachability in the slice 1
mount with native Chromium input. Prove ages ticking with the clock there.
The touch disclosure needs `any-pointer: coarse`, which the mount does not
emulate; keep it on a touch-enabled page. Put reload reset to 20, the open
sidebar and collapsed section after reload, and the saved size in one
representative E2E session sidebar journey, starting from
`e2e/sessions/cursor-sessions-sidebar-size-kept.spec.ts`. Delete the
remaining legacy sidebar files once every case is mapped, then pair the
original seven cases with their replacements under comparable load.

## Local gates and review

On macOS use the maintained [sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
`caffeinate -s -i` from an awake machine on AC power. Keep the default test
timeouts and follow the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
For each slice use `npm run test:dashboard:frontend -- <explicit paths> --workers=2`
for each affected engine separately while both exist. Run `npm run test:e2e
-- <explicit paths> --workers=2` for changed E2E cases and affected service
journeys. Run `npm run typecheck:dashboard` for changed Dashboard types and
callers, and `npm run lint` for source changes. When a shared fixture changes,
check its remaining consumers before deleting or modifying it.

Pair the original and resulting selections at two workers under comparable
load. Record elapsed time including setup, counts by engine and destination,
slow remaining cases and added E2E cost. Run the final moved and retained
proof together and check for zero scoped legacy registrations.

The slice review found no remaining concerns after grouping proof by the
reader's actions and assigning each legacy case once. A separate refinement
pass was unnecessary.

Slice 1 returned unfinished at 11.9 of 15 active minutes: the sidebar's room
geometry, touch disclosure and reload restoration each needed a different
entry from the mounted reading cases. Its delivered part kept the mounted
proof; the rest became slice 9. At comparable load (5.4 → 4.7) the slice's
own selection took 13.12 s against the legacy 10.67 s, because it starts the
Vitest engine while most legacy cost remains; the story-level pair, whose
baseline already runs both engines, decides the timing outcome.

Trunk `0bdef6cb2` ("Revert completion-time ad hoc story creation") changed
the production Recently done listing and selection and the slice 3 roster
files `recently-done-follow-up-grouping` and
`recently-done-published-session-story`. Merge trunk and recheck the slice 1
mount specs before slice 3 reconciles its roster.

During slice 2, `navigation/frame-launch-look.spec.ts` failed intermittently
on base and candidate alike: Enter on the launcher right after Cancel lost the
reopen because the native dialog's late close shut it. The repair keys each
opening's dialog and ignores a replaced opening's close; the cause, proof and
reproduction are in [the diagnosis record](diagnosis-frame-launch-look-focus.md). Fit the 15 active-minute limit by keeping representative
rendered scenarios and checking distinct variants at their smallest owner.

## Assertion map

Slice 1 (legacy cases not listed as replaced remain their owners until slices 2 and 9).
Replacement path: `sessions/recently-done-sessions-sidebar-mount.spec.ts`
("mount spec"), over `ConfiguredDashboard` with a case-owned machine reader.

| Old case | Distinct observations | Replacement or equivalent |
| --- | --- | --- |
| `sessions/recently-done-sessions-sidebar-projects.spec.ts` — "of two projects' kept executions, Recently done lists only the one marked Done yesterday, under its project" (deleted) | Only the Done record is listed; the open one stays in the open list; the day-old execution names its project and kind | Mount spec "Recently done lists completed sessions across projects newest completion first, with completion age and project identity": exact Done titles, open list holds only the open session, `1d`, `Pygardon · Execution`. Distinguishes the recorded `doneSessionsOf` filter regression (an open record breaks the exact title list and region exclusion). |
| `sessions/recently-done-sessions-sidebar-paging.spec.ts` — "delayed first session read and a failed refresh keep existing read semantics" (deleted from the file) | "Reading sessions…" with no rows before the first answer; newest 20 after release; a failed refresh keeps the shown rows and no empty message | Mount spec "Recently done reads, reveals 20, 40 and 45 newest first, keeps that range through collapse, hiding, a cross-project Select and refresh, and moves focus off a removed row": held first read, then failed read (read count proves the poll ran) keeps all rows and shows no empty message. |
| `sessions/recently-done-sessions-sidebar-paging.spec.ts` — "scrolling Recently done reaches all 45 retained sessions and refresh keeps the reached older range" (kept) | 20/40/45, inert scroll, tie order, range through collapse/hide/project change/Select, refresh adds new and drops removed while keeping range and focus | Mount paging case above, plus mount "the reached range of 45 survives a project change". Independent open-list scroll: `sessions/recently-done-sessions-sidebar-room-mount.spec.ts` "scrolling the open list to its end leaves Recently done's range unchanged". Still owned by legacy: Select switching project and revealing the Board entry with no terminal (in the mount, Select presses the row but the project does not switch even with real timers, likely awaiting an association read the mount leaves unread; slice 2 territory); reload reset to 20 (planned E2E). |
| `sessions/recently-done-sessions-sidebar.spec.ts` — "empty and reading states stay distinct, and fewer than 20 shows every Done session" (kept) | Empty message; fewer than 20 shows all; reload keeps sidebar open with section collapsed | Empty: mount "an expanded Recently done with no retained sessions says none are listed"; reading: mount paging case; fewer than 20: mount cross-project case (3 of 3). Still owned by legacy: reload restoration (planned E2E). |
| `sessions/recently-done-sessions-sidebar.spec.ts` — "finds and opens the newest completed sessions across projects…" (kept) | Collapsed default, cross-project order, completion ages, open-row launch age and Launched tooltip | Mount cross-project case; open-row `4m` and `Launched …` tooltip: mount "an open session in the Sessions sidebar shows its launch age and Launched time". Still owned by legacy: ages ticking with the clock, Select/Open destinations and project switch, reload collapse. |
| `sessions/recently-done-sessions-sidebar-touch.spec.ts` (kept) | Completion, not launch, in Session details | Facts text in the mount cross-project case; touch disclosure tap still legacy. |
| `sessions/recently-done-sessions-sidebar-room.spec.ts` (kept) | Three-list room geometry, resize, short window, reload preference | Partly: `sessions/recently-done-sessions-sidebar-room-mount.spec.ts` "the Recently done divider is named and keyed arrows resize the section" (accessible name, ArrowUp grows aria-valuenow). Still owned by legacy: three-list floors and shared room with Running Cursor, drag to floor, exact key step, short window reachability, reload preference. |
