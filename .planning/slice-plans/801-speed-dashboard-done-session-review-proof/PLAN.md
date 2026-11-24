# Get fast proof of finding and reviewing Done sessions

**Identity:** SEED-413#speed-dashboard-done-session-review-proof
**Source:** [Get fast proof of finding and reviewing Done sessions](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-dashboard-done-session-review-proof)

## Goal and scope

Give Dashboard developers a faster focused run for the Done session workflow.
Follow a session from its project or story to the right review, comparison
and diff. Reconcile the roster with trunk at execution start.

Follow the [campaign acceptance](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#acceptance-shared-by-the-frontend-stories).
Live sessions and terminal internals, shared runner retirement, real Git,
publication and installation have their own owners. Standalone (ad hoc)
session cases not migrated by slices 1 and 2 stay in their legacy specs for
[SEED-426](../../seeds/SEED-426-start-ad-hoc-work-under-a-story.md#start-ad-hoc-work-under-a-story)
to remove with the standalone paths (developer decision, 2026-11-24). Preserve the separate
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
Status: done

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
Recently done's link reads (another project's snapshot and done catalog, and
the ad hoc association) go through `PageReads` so the mount drives the real
selection path. The real terminal attach remains in
`e2e/sessions/recently-done-sessions-select-open.spec.ts`. The remaining
observations of `sessions/recently-done-sessions-select.spec.ts` and all of
`-select-touch.spec.ts` moved to slice 9.

### 3. Attribute a session to its resolved Done card

Type: Behavior
Status: done

**Roster (15 cases).** `sessions/recently-done-{active-story-sessions,follow-up-grouping,follow-up-membership,published-session-story,story-sessions}.spec.ts`.

**Proof.** Drive Board through published snapshots and machine answers.
Exercise the production membership and deduplication rules beneath the
list for direct variants. Render a discriminating cross-machine arrival,
retained counterpart and ambiguous association, followed by an explicit
choice. Prove open, Done and reopened membership, originating card, source
project isolation and top-level paging count. Older standalone entries stay
legacy for SEED-426. Trunk's revert removed
`sessions/recently-done-published-session-story.spec.ts` from this roster.
Keep the documented real publication journey in
`e2e/sessions/recently-done-published-sessions.spec.ts`.
Trunk's revert `0bdef6cb2` deleted `dashboard/src/storyAssociationChoice.ts`
and its server half, withdrawing the ambiguous association and explicit
choice from this promise.

### 4. Reveal a follow-up's source without losing the current place

Type: Behavior
Status: done

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

**Roster.** `review/story-review-action.spec.ts`.
`sessions/recently-done-ad-hoc-review.spec.ts` stays legacy for SEED-426.

**Proof.** Start from the real card actions and Review opening. Prove order,
wrap and keyboard handoff to Intent Changes. Use the production eligibility
rule for the distinct launch, preparation, claim and unavailable inputs
across Backlog and Taken. Render representative destination and focus
handoffs.

### 7. Review the evidence of the chosen session and run

Type: Behavior
Status: planned

**Roster.** `review/story-review-details-runs.spec.ts`.
`sessions/recently-done-ad-hoc-{branch-result,comparisons,review-gaps,session-commits,session-runs}.spec.ts`
stay legacy for SEED-426.

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
`sessions/recently-done-sessions-sidebar{,-paging,-room,-touch}.spec.ts`,
and those slice 2 left in `sessions/recently-done-sessions-select{,-touch}.spec.ts`
(see the assertion map).

**Proof.** Measure the three lists' floors, shared room with Running Cursor,
drag to floor, exact key step and short-window reachability in the slice 1
mount with native Chromium input. Prove ages ticking with the clock there. In the slice 2 selection mount,
prove the Development highlight after an Intent choice; leave Open's
terminal reopening to `e2e/sessions/recently-done-sessions-select-open.spec.ts`
if it needs a real attach. Row ring style, equal row heights, coarse-input
touch sizes and the phone overlay need native layout or a touch page.
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
proof together and check that the only scoped legacy registrations left are
the standalone cases SEED-426 removes.

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
reproduction are in [the diagnosis record](diagnosis-frame-launch-look-focus.md).

Slice 2 returned at 12.7 of 15 active minutes after moving eight legacy
cases into two mounted spec files: at load about 4–5.7 its 10 legacy
Playwright cases took 10.6 s and the 12 replacements 7.9 s, while the two
files still owned by slice 9 take 6.9 s. Splitting mounted cases across
files matters: one file runs serially (13.4 s for ten cases against 6.4 s
split in two).

CI run 45296057233 failed on `a49313ba` in
`intent/intent-scope-timing-history-units.spec.ts`: a late Done comparison
renamed the location button that a name-resolved click was waiting for. The
repair presses the button by its path; see
[the diagnosis record](diagnosis-intent-scope-timing-click.md). Fit the 15 active-minute limit by keeping representative
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

Slice 2 (in progress). Production now reads a row's other-project snapshot,
done catalog and ad hoc association through `PageReads` (`useDoneLinkReads`:
`observation.readSnapshot`/`readDoneCatalog`, `machine.readCompletedStoryAssociation`),
which is what slice 1's mounted Select was missing. Replacements:
`sessions/recently-done-sessions-select-mount.spec.ts` ("destination spec") and
`sessions/recently-done-sessions-select-check-mount.spec.ts` ("check spec"),
over `sessions/recently-done-selection-mount-page.ts`.

| Old case | Distinct observations | Replacement or equivalent |
| --- | --- | --- |
| `sessions/recently-done-sessions-select-check.spec.ts` — "an unanswered check is superseded by a later choice, and a failed one leaves the reading with its session's Open usable" (deleted) | "Checking…" status while unread; later row supersedes (pressed moves, status gone); failed read said "could not be checked … Select again to check again." with description; project kept; Open usable | Check spec "an unanswered catalog check says checking until a later choice supersedes it, and a failed one is said apart from a miss, leaving project and Open usable". Distinguishes a stale answer taking over or a failure read as a miss (would select standalone, no status). Real Open attach: `e2e/sessions/recently-done-sessions-select-open.spec.ts`. |
| `sessions/recently-done-sessions-select-check.spec.ts` — "a catalog naming the story's done record unreadable, or not describing the done records, is said apart from a miss…" (deleted) | Exact unreadable-record and catalog-gap texts; row stays pressed; project kept | Check spec "a catalog naming the story's done record unreadable, or not describing the done records, is said apart from a miss and leaves the project" (exact texts). |
| `sessions/recently-done-sessions-select-ad-hoc-check.spec.ts` — "an unanswered ad hoc association is superseded by another row, and a failed one retries without moving the story" (deleted) | Held association superseded by another row; failed association said apart from a miss with retry; retry links and selects the story | Check spec "a held association is superseded by a later choice, whose project stands when the first answers" (a late `linked` answer would switch to Doughnut) and "an unreadable or refused ad hoc association is said apart from a miss and leaves the story; selecting again links its Done story" (unavailable and refused texts, then Intent `data-selected-story`). |
| `sessions/recently-done-sessions-select-supersede.spec.ts` — "choosing another project while a linked row is still checked abandons the check…" (deleted) | Project chosen meanwhile stands; Intent kept, no selected story; row unpressed, no status | Check spec "choosing another project while a linked row is still checked abandons the check, keeping the reader in the project they chose". |
| `sessions/recently-done-sessions-select-supersede.spec.ts` — "another row's Open while a linked row is still checked abandons the check…" (deleted) | Open supersedes the check; Development shown; row unpressed | Check spec "another row's Open while a linked row is still checked abandons the check and shows Development". Gap: the opened report text stays with the legacy `select.spec.ts` Side-panel observations and the e2e select-open spec. |
| Slice 1 leftovers in `sessions/recently-done-sessions-sidebar{,-paging}.spec.ts` — Select switches project and reveals the Board entry with no terminal; Open's destination | Project switch, entry `selected-session` + "Selected session", no Terminal region; Open → Development | Destination spec "selecting a standalone row in Development shows its project's Board with its entry marked selected and opens no terminal", "selecting a linked done row in Development…", and check spec Open case. Legacy files keep their reload observations (planned E2E, slice 9). |
| `sessions/recently-done-sessions-select.spec.ts` (kept, partly mapped) | Linked from Intent selects that project's story; standalone keeps project; Tab Select→Open terminal, description, ad hoc has no Open; opened final report kept in the Side panel with its row `aria-current` and unpressed | Destination spec "selecting a linked done row from Intent…", "a linked row's Select in Development brings its selected done card…; Tab reaches its separate Open terminal, which an ad hoc row lacks", and "selecting a linked row from Intent keeps the opened final report in the Side panel, its row current but not chosen" (typed `SessionServices.readFinalReport`). Slice 9: row ring style, equal row heights, Development highlight after an Intent choice, Open reopening the terminal. Intent Changes file and Taken card kept across standalone choices: legacy for SEED-426. |
| `sessions/recently-done-sessions-select-development.spec.ts` (deleted, all three cases) | Linked done card beyond Pygardon's first ten selected in view, kept on re-select; older standalone entry beyond Doughnut's first ten revealed, marked and in view; roster view gives way to the project's Board with the entry selected | Destination spec "a linked row's Select in Development brings its selected done card, beyond Pygardon's first ten, into view and keeps it on a second Select; …", "selecting an older standalone session in Development reveals and marks its entry beyond Doughnut's first ten" (eleventh entry), "selecting a standalone session from Development's agent roster shows its project's Board with the entry selected in view". Distinguishes a reveal that stops at the default ten or a roster that stays. Gap: Side-panel report kept during these (legacy `select.spec.ts` still observes report preservation in Intent). |
| `sessions/recently-done-sessions-select-touch.spec.ts` (kept) | Coarse-input touch sizes, phone overlay | Slice 9. |

Slice 3 (in progress). Replacements over `ConfiguredDashboard` with typed
machine answers, published done catalogs and done-record reads:
`sessions/recently-done-card-membership-mount.spec.ts` ("membership spec") and
`sessions/recently-done-card-membership-transition-mount.spec.ts`
("transition spec") over `sessions/recently-done-card-membership-mount-page.ts`;
`sessions/recently-done-active-story-mount.spec.ts` ("active spec");
`sessions/recently-done-story-card-sessions-mount.spec.ts` ("story card spec").
They and the slice 2 destination spec read the Board's column through
`sessions/recently-done-column-page.ts`.

| Old case | Distinct observations | Replacement or equivalent |
| --- | --- | --- |
| `sessions/recently-done-active-story-sessions.spec.ts` — "an active story owns its open and Done sessions even with a matching done card…" (deleted) | Backlog card holds open (Working) session; Done card and Recently done hold neither; Done disclosure counts and holds the closed one; each key shown once on the Board; two top-level entries; "Recently done 2 entries" | Active spec, same title. Distinguishes a matching done card taking the active story's closed session (Recently done would hold its key and the top-level count would change). |
| `sessions/recently-done-follow-up-grouping.spec.ts` — "marking a follow-up Done moves it from Taken onto its source card" (deleted) | Open follow-up in Taken, card empty; after Done it leaves Taken and is the card's one Done entry | Transition spec "a follow-up answered Done moves from Taken onto its source card, and reopened returns to Taken" (the next machine answer carries the Done mark). The Mark as done action posting itself stays with the session-action specs. |
| `sessions/recently-done-follow-up-grouping.spec.ts` — "card and file follow-ups of one story share its Done card" (deleted) | Both nested, newest first; each listed once; kept after reload | Membership spec "card and file follow-ups of one story share its Done card, newest first, and are listed once". Reload is a re-read of the same answers; no separate observation kept. |
| `sessions/recently-done-follow-up-grouping.spec.ts` — "reopening a closed follow-up returns it to Taken" (deleted) | Reopened answer returns it to Taken and empties the card | Transition spec above (poll-driven answer instead of reload). |
| `sessions/recently-done-follow-up-membership.spec.ts` — "another story's and another project's closed follow-ups stay off the card" (deleted) | Own on source card, other story on its card, other project's not in Open Dough's Recently done | Membership spec, same title (Doughnut also lists the source identity, so a project-blind join would show it). |
| `sessions/recently-done-follow-up-membership.spec.ts` — "a closed follow-up whose source card is not listed stays standalone" (deleted) | Standalone entry; listed card holds none | Membership spec, same title. |
| `sessions/recently-done-follow-up-membership.spec.ts` — "a card holding a closed follow-up still names the story's Follow up context" (deleted) | Card holds 2; Follow up context lists the story's own session facts only; follow-up title absent | Membership spec "a card holding a closed follow-up still names only the story's own sessions in its Follow up context" (Completed line matched by prefix). |
| `sessions/recently-done-story-sessions.spec.ts` — "a done story's card holds this machine's sessions for it…" (reduced) | Entries newest first by completion; card holds two closed sessions newest first, Done, no terminal/actions, raised-surface set-off; open session stays Taken with identity, terminal and actions; last week's card holds yesterday's session; card without sessions shows none | Story card spec "a done story's card holds this machine's closed sessions for it, newest first, while its open session stays local Taken, and done cards order by completion". Set-off checks background only (in-card text colour unobserved). The 31-day-old retained standalone entry stays in the reduced legacy case "a session of a done record past the window is its own Recently done entry" — legacy for SEED-426. |
| `sessions/recently-done-story-sessions.spec.ts` — set-off in-card text (legacy `expectSessionEntryInCardText`) | Entry reads in its card's colour, which is not quiet; its `.launch-local` facts are quiet | Story card spec, same case (restored). |
| Plan proof row 3, cross-machine arrival (no legacy case left after trunk removed `recently-done-published-session-story.spec.ts`) | Published record with no kept counterpart stands alone and leaves the card empty; a kept Done follow-up reporting through it stands for it on the source card; a kept live counterpart also stands for it | `sessions/recently-done-published-counterpart.spec.ts` (plain Vitest on `newestFirst`, three cases); rendered: membership spec "a follow-up published from another machine while its kept counterpart is Done here shows one entry, on its source card" (mutating the reporting reference renders two entries and fails it). |

Slice 4 (in progress). Replacement: `sessions/follow-up-source-reveal-mount.spec.ts`
("reveal spec") over `sessions/follow-up-source-page.ts`, a `mountBoardFrame`
Board with Open Dough's published done catalog (source among 11 recent
fillers), a case-held or failed source body read, an open follow-up machine
answer and a selectable Backlog story. Legacy file and its spent support
(`test-support/support/recentlyDoneFollowUpGrouping.ts`,
`followUpSourceCatalog.ts`) deleted.

| Old case | Distinct observations | Replacement or equivalent |
| --- | --- | --- |
| `sessions/follow-up-source-navigation.spec.ts` — "a Taken follow-up names its source by title when read, and by identity while unread" (deleted) | Identity link while the older source's body is held, no title link; title replaces identity after release | Reveal spec "a Taken follow-up names its source by identity while its body is unread, and by title once read". Distinguishes naming before the body answers or keeping the identity after it. |
| — "keyboard source reveal beyond ten on a narrow reduced-motion viewport focuses the card and keeps the selected story" (deleted) | 390 wide, reduced motion; no destination before; keyboard Enter on the Taken link focuses the card at least half in view; "Showing 12 of 12 entries."; selected story kept; Show latest 10 offered | Reveal spec "keyboard reveal of an older source beyond ten at a narrow reduced-motion viewport focuses its card, keeps the selected story, restores with Show latest 10 and reveals again" (`showsReached` from the Done reference page: focus plus half in the reading room). Selection is a Backlog story rather than a Taken story card (same `story-card-selected` owner). |
| — "an older catalogued source reveals on demand, restores with Show latest 10, and reveals again" (deleted) | 31-day-old source absent until followed; focused in view; Show latest 10 removes it; second follow reaches it again | Same reveal spec case (source 31 days old, twelfth). Distinguishes a reveal that stops at the default ten/window or a restore that keeps the range. |
| — "keyboard source reveal beyond ten keeps an open Side panel and leaves selection alone under reduced motion" (deleted) | 1280 wide; unselected story stays unselected; Terminal Side panel opened from the Taken entry stays visible; destination focused in view | Reveal spec "keyboard source reveal beyond ten keeps an open Side panel and leaves selection alone under reduced motion" (`answerTerminal` transport; Open terminal on the Taken entry). |
| — "a failed source body keeps the Taken entry naming the identity and still reveals the gap card" (deleted) | Naming read fails → identity link; reveal read fails → focused destination says "This done story could not be read."; Taken entry still names identity | Reveal spec, same title (two failed source reads). |
| — "an absent source keeps the Taken entry accessible with honest unavailable feedback" (deleted) | Notice "`<identity>` is unavailable in Open Dough's dashboard."; no destination; Taken entry kept | Reveal spec, same title (exact notice text). |
