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
Status: done

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
Status: done

**Roster.** `review/story-review-action.spec.ts`.
`sessions/recently-done-ad-hoc-review.spec.ts` stays legacy for SEED-426.

**Proof.** Start from the real card actions and Review opening. Prove order,
wrap and keyboard handoff to Intent Changes. Use the production eligibility
rule for the distinct launch, preparation, claim and unavailable inputs
across Backlog and Taken. Render representative destination and focus
handoffs.

### 7. Review the evidence of the chosen session and run

Type: Behavior
Status: done

**Roster.** `review/story-review-details-runs.spec.ts`.
`sessions/recently-done-ad-hoc-{branch-result,comparisons,review-gaps,session-commits,session-runs}.spec.ts`
stay legacy for SEED-426.

**Proof.** Open the real review request from a standalone row or a Done
card where the subject differs. Render comparison and run choices through
the existing Review owner and typed source. Observe saved branch, delivery
and execution checkout choices, exact file and run endpoints, chronological runs
and retained selection through Refresh. Keep empty, missing, pending and
unverified evidence distinguishable. Retain local versus published
provenance and keyboard switching. Use the existing toolbar and details
specs for covered display states after checking their discriminating
observations. Real captured Git and published reviews keep their owners in
`e2e/review/recently-done-one-shot-review.spec.ts` and
`e2e/sessions/recently-done-published-sessions.spec.ts`.

### 8. Keep the displayed diff and notes tied to the selected comparison

Type: Behavior
Status: done

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
Status: done

**Roster.** The cases slice 1 left in
`sessions/recently-done-sessions-sidebar{,-paging,-room,-touch}.spec.ts`,
and those slice 2 left in `sessions/recently-done-sessions-select{,-touch}.spec.ts`,
and slice 5's touch cases: the 44px review control in
`stories/recently-done-review-state-offer.spec.ts` and the long-title touch
case in `sessions/recently-done-sessions-review-cue.spec.ts`
(see the assertion map).

**Proof.** Measure the three lists' floors, shared room with Running Cursor,
drag to floor, exact key step and short-window reachability in the slice 1
mount with native Chromium input. Prove ages ticking with the clock there. Close slice 8's open read: the
review diff's syntax hint (`dashboard/src/reviewDiffSyntaxHint.ts`) reads
Intent locations through the module-level request instead of `PageReads`.
Route it through `useIntentReads()` (patch retained in the execution
evidence as `s8-hint-route.patch`), add a mounted story-subject Review
changes case observing the snapshot tree for a live review and the
completion for a Done review, then retire
`review/story-review-diff-syntax-intent-hints.spec.ts` and its support. In the slice 2 selection mount,
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

### 10. Finish the sidebar's reload, short window and phone touch

Type: Behavior
Status: done

**Roster.** The cases slice 9 left in
`sessions/recently-done-sessions-sidebar{-paging,-room}.spec.ts`,
`sessions/recently-done-sessions-select-touch.spec.ts`,
`sessions/recently-done-sessions-review-cue.spec.ts` and
`stories/recently-done-review-state-offer.spec.ts` (see the assertion map).

**Proof.** In the slice 1 and 9 mounts, prove that wheeling to the end of
one list leaves the others' range and that every control stays reachable in
the short window. With `useTouchScreen`, prove the Sessions button takes the
keyboard back when the report closes, the second select-touch case, the
44px review control after the phone Board's column navigation and the
long-title touch case. Extend
`e2e/sessions/cursor-sessions-sidebar-size-kept.spec.ts` with Recently
done's reset to 20 and its divider size kept after reload. Then pair the
story's original and resulting selections and check the remaining scoped
legacy registrations.

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
[the diagnosis record](diagnosis-intent-scope-timing-click.md).

CI run 45305912032 failed on the trunk merge `28407491` in
`stories/story-note-voice.spec.ts`: Stop pressed before the recorder encoded
any audio produced an empty clip. Note-clip helpers now wait for recorded
audio before Stop; see
[the diagnosis record](diagnosis-story-note-voice-clip.md).

CI run 45308457713 on `0c1017fe` lost one Vitest browser connection between
files in `dashboard-frontend` shard 1/2; every case that ran passed. Two
diagnosis rounds found no test closing or exhausting the page, and a hosted
probe passed 10 of 10 shard runs with memory, `/tmp` and `/dev/shm` far from
their limits, so the attempt is disposed of as a runner fault; see
[the diagnosis record](diagnosis-browser-connection-closed.md).

CI run 45314128135 ended `Distribution Tests (3/3)` at its 320 s deadline on
`bc255e62`; recent main runs of that shard already took up to 298 s. With the
developer's acceptance, `rebalance-ci-shards` moved
`Distribution/tests/skills/dough-story-wrap-up/**` into share 2, lowering the
slowest share's recent median total from 767 s to 681 s.

CI run 45319588627 on the trunk merge `8b8a4ea2` failed two jobs that trunk's
own `ba51ccece` also failed: a feedback-maintenance expectation kept the old
"default main" wording, and the longer "Execution checkout" footer wrapped on
Linux fonts and clipped the launch dialog's field in a short window. The
expectation follows the rename, and short windows give the dialog the full
height with a tighter footer; see
[the diagnosis record](diagnosis-trunk-rename-wording.md). Fit the 15 active-minute limit by keeping representative
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
| `sessions/recently-done-sessions-sidebar.spec.ts` — "finds and opens the newest completed sessions across projects…" (kept) | Collapsed default, cross-project order, completion ages, open-row launch age and Launched tooltip | Mount cross-project case; open-row `4m` and `Launched …` tooltip: mount "an open session in the Sessions sidebar shows its launch age and Launched time". Ages ticking (slice 9): `sessions/recently-done-sessions-sidebar-ages-mount.spec.ts` "the clock advances completion ages in Recently done and launch ages in the open list" (`<1m` → `2m` from completion on the 30 s tick, open row `4m` → `6m` from launch; a missing tick leaves `<1m`, verified). Still owned by legacy: Select/Open destinations and project switch (mapped in slice 2), reload collapse (planned E2E). |
| `sessions/recently-done-sessions-sidebar-touch.spec.ts` — "Session details identifies completion, not launch age" (deleted in slice 9) | Completion, not launch, in Session details; `Completed Nm ago` label; tap opens the disclosure; title and identity shown | `sessions/recently-done-sessions-sidebar-touch-mount.spec.ts` "a tap on a Done row's Session details shows its completion and identity, not its launch": the mount emulates `any-pointer: coarse` through CDP `Emulation.setTouchEmulationEnabled` (`navigation/board-touch-page.ts` `useTouchScreen`) and taps with `Input.dispatchTouchEvent`; the facts are inside a closed `<details>` until the tap, so a disclosure that does not open fails. |
| `sessions/recently-done-sessions-sidebar-room.spec.ts` (kept) | Three-list room geometry, resize, short window, reload preference | Partly: `sessions/recently-done-sessions-sidebar-room-mount.spec.ts` "the Recently done divider is named and keyed arrows resize the section" (accessible name, ArrowUp grows aria-valuenow). Slice 9: `sessions/recently-done-sessions-sidebar-three-lists-mount.spec.ts` "the three lists share the sidebar's room above their floors, and the Recently done divider drags to its floor and keys by its step" (open, Recently done and Running Cursor bodies each ≥ 8rem and summing to the room within 2px; a native CDP drag of +2000 lands `aria-valuenow` on the 8rem floor; three ArrowUp give exactly floor + 3 × 2rem and the body that height, room unchanged; at 320 × 256 the sidebar has no sideways scroll and both section headers scroll into view). Still owned by legacy: wheel-to-end of the Recently done body leaving the open and Running lists' scroll unchanged, every control reachable in the short window, and reload preference (planned E2E). |

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
| `sessions/recently-done-sessions-select.spec.ts` (kept, partly mapped) | Linked from Intent selects that project's story; standalone keeps project; Tab Select→Open terminal, description, ad hoc has no Open; opened final report kept in the Side panel with its row `aria-current` and unpressed | Destination spec "selecting a linked done row from Intent…", "a linked row's Select in Development brings its selected done card…; Tab reaches its separate Open terminal, which an ad hoc row lacks", and "selecting a linked row from Intent keeps the opened final report in the Side panel, its row current but not chosen" (typed `SessionServices.readFinalReport`). Slice 9 deleted the linked case "selecting a linked done story from Intent shows that project's story in Intent, keeps the report in the Side panel and attaches nothing; Open still opens its terminal": equal row heights, the chosen row's inset ring (pointer moved off) and the Development highlight after an Intent choice are `sessions/recently-done-sessions-select-intent-mount.spec.ts` "a linked row chosen from Intent wears an inset ring at an ad hoc row's height, and Development highlights its done card"; Open reopening the terminal needs a real attach and stays with `e2e/sessions/recently-done-sessions-select-open.spec.ts` "Open on a linked Recently done row goes to Development, attaches its terminal, …". The standalone case (Intent Changes file and Taken card kept across standalone choices) stays legacy for SEED-426. |
| `sessions/recently-done-sessions-select-development.spec.ts` (deleted, all three cases) | Linked done card beyond Pygardon's first ten selected in view, kept on re-select; older standalone entry beyond Doughnut's first ten revealed, marked and in view; roster view gives way to the project's Board with the entry selected | Destination spec "a linked row's Select in Development brings its selected done card, beyond Pygardon's first ten, into view and keeps it on a second Select; …", "selecting an older standalone session in Development reveals and marks its entry beyond Doughnut's first ten" (eleventh entry), "selecting a standalone session from Development's agent roster shows its project's Board with the entry selected in view". Distinguishes a reveal that stops at the default ten or a roster that stays. Gap: Side-panel report kept during these (legacy `select.spec.ts` still observes report preservation in Intent). |
| `sessions/recently-done-sessions-select-touch.spec.ts` (kept) | Coarse-input touch sizes, phone overlay | Case "a row's Select and its Open are separate touch controls…" partly in `sessions/recently-done-sessions-select-touch-mount.spec.ts` "on a phone's touch screen Select keeps the Sessions overlay and opens nothing, and the separate Open reads the final report in its place" (CDP touch emulation at 390 × 844: Select and Open each ≥ 44 × 44; tapped Select pressed with the overlay kept and no Terminal or Final report; tapped Open shows the report and the overlay leaves). Still legacy: closing the report returns focus to the Sessions button; the phone-width linked selection in view once the overlay closes while the catalog read is held. |

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

Slice 5 (in progress). Replacements over `ConfiguredDashboard` with the
existing `PageReads.reviewStates` reader (now passable through
`mountBoardFrame`/`mountSessions`, no production change):
`stories/recently-done-review-state-mount.spec.ts` ("state spec") over
`stories/recently-done-review-state-mount-page.ts`, and
`sessions/recently-done-review-cue-mount.spec.ts` ("cue spec") over
`sessions/recently-done-review-cue-mount-page.ts` (per-project review states
and Pygardon catalog the case answers, holds or fails). Each equivalent
distinguishes the old regression by the same observation.

| Old case | Distinct observations | Replacement or equivalent |
| --- | --- | --- |
| `stories/recently-done-review-state.spec.ts` — "Mark as reviewed keeps the card, selection and announcement as they were" (deleted) | All unreviewed; keyboard mark → Reviewed focused, one "Marked as reviewed." status, action list otherwise unchanged; others, order, "3 entries", C selected, A not, no Side panel, saved set; Cancel focus/keep; Escape closes and keeps | State spec "Mark as reviewed, Cancel and Escape keep the card, its order, count and selection, and announce once". |
| `stories/recently-done-review-state.spec.ts` — "Marking and unreviewing a story keep the card's sessions as they were" (deleted) | Card's two sessions unchanged after mark and after Unreview | State spec "marking and unreviewing a story keep the card's sessions as they were" (session identities, plus the saved change sequence). |
| `stories/recently-done-review-state-offer.spec.ts` — "a card whose record could not be read offers Mark as reviewed" (removed from file) | Unread text; Mark as reviewed offered | State spec, same title. |
| `stories/recently-done-review-state-offer.spec.ts` — "a card whose record is still being read …" (removed from file) | Reading text; mark while reading; Reviewed kept after facts appear | State spec, same title. |
| `stories/recently-done-review-state-offer.spec.ts` — "Review actions and both confirmation choices offer the shared 44px control height" (kept) | Coarse-pointer 44px heights | Still legacy after slice 9. The mount can emulate `any-pointer: coarse` (CDP `Emulation.setTouchEmulationEnabled` via `navigation/board-touch-page.ts` `useTouchScreen`), but at 390 × 844 the Board shows one column, so tapping the Recently done card's controls needs the Board's column navigation first; a first attempt with `scrollIntoView` did not reveal the column (the tap point fell outside the control). |
| `sessions/recently-done-sessions-review-cue.spec.ts` — "an unselected cross-project done-story row exposes its review need while the Board stays put" (removed) | Cue, "Needs review" description, unpressed, Open Dough kept | Cue spec "equal identities use their own project's review state; …" (opening assertions). |
| `sessions/recently-done-sessions-review-cue.spec.ts` — "equal identities use their own project's review state; every shown matching row shares successful card changes" (removed) | Pygardon rows cue, Open Dough/ad hoc/Taken rows none; one Pygardon catalog read; Unreview → Open Dough row cues, Pygardon unchanged; Mark → clears only Open Dough row | Cue spec, same case (card operated with the Sessions sidebar closed). The final-report row is not in the mounted frame (its cue-free observation is the Taken/ad hoc rows'). |
| `sessions/recently-done-sessions-review-cue.spec.ts` — "a newly revealed batch resolves the same published story without per-row catalog reads" (removed) | 20 shown, older absent; reveal → older row cues; ≤2 catalog reads | Cue spec, same title (29 rows, revealed through the end). |
| `sessions/recently-done-sessions-review-cue.spec.ts` — "a long title leaves Needs review and separate Select and Open usable" (kept) | Coarse-pointer narrow touch geometry, 44px, tap Select/Open | Still legacy after slice 9 (not reached before the slice clock ran low); the mount's `useTouchScreen` and `tapWhereShown` (see the select-touch mount) are the route. |
| `sessions/recently-done-sessions-review-cue-evidence.spec.ts` — "failed catalog / failed review state supplies no warning; …" (removed) | No cue, Select/Open enabled; later read cues without selecting; Open Dough kept | Cue spec "failed catalog …" and "failed review state …" (later read via the next check interval). |
| `sessions/recently-done-sessions-review-cue-evidence.spec.ts` — "pending catalog shows no initial warning, then resolves without selecting" (removed) | No cue while held; cue after release; unpressed | Cue spec, same title. |
| `sessions/recently-done-sessions-review-cue-evidence.spec.ts` — failed/pending association (kept) | Ad hoc row association evidence | Legacy for SEED-426. |
| `sessions/recently-done-sessions-review-cue-races.spec.ts` — "pending local review evidence stays unknown and its pre-save answer cannot restore a cleared cue" (removed) | Held read → no cue; release → cue; stale read asked before card Mark on Pygardon → cue cleared and stays cleared after the stale answer | Cue spec, same title (stale answer is the pre-save snapshot). |
| `sessions/recently-done-sessions-review-cue-races.spec.ts` — "an obsolete association cannot warn the row after its project/association changes" (kept) | Ad hoc association context change | Legacy for SEED-426. |
| `stories/recently-done-review-cue.spec.ts` — "an outstanding review is a readable red action beside quiet Reviewed in light/dark appearance" (deleted, both cases) | Exact red fill/foreground and quiet colours per scheme, 4.5:1 text and 3:1 control contrast, focus ring ≥2px at 3:1, keyboard mark/unreview keeps focus | `stories/recently-done-review-appearance-mount.spec.ts`, same titles (scheme via CDP emulated media). Spent helpers `expectReviewWarning`/`expectQuietReviewed` removed from `test-support/doneStoryReviewPage.ts`. |
| Persistence across reload/restart | — | `e2e/stories/recently-done-review-state-persistence.spec.ts` (unchanged owner). |

Slice 6. Replacement `review/story-review-action-mount.spec.ts` ("action
spec") over `mountBoardFrame` (`ConfiguredDashboard`, typed machine answer;
no production change). The eligibility rule is the production
`storyComparisonOffered`/`reviewWorkspaceOf`, already proven in plain form by
`backend-tests/review/story-review-workspace.spec.ts`; the column does not
enter it (`StoryCard` passes the same launches for Backlog and Taken). Spent
support removed: `expectActionGlyph`, `putFrontendStories`,
`expectOnOneLineWhenRoom`/`groupLineHasRoom`.

| Old case | Distinct observations | Replacement or equivalent |
| --- | --- | --- |
| `review/story-review-action.spec.ts` — "the inspection group sits below the launch group, wraps in reading order, and the keyboard reaches Review changes from Inspect story" (deleted) | Starts above the inspection group; Inspect, Notes, Review on one line when roomy, in reading order when wrapped (1920, 1440, narrow, 2x zoom); leading git-compare and trailing arrow glyphs; Enter on Inspect → Hide detail focused, detail shown; Tab → Notes → Review; Enter → Intent Changes selected and focused | Action spec "at 1920 px …" and "at 320 px … the keyboard reaches Review changes from Inspect story and opens Changes focused" (one-line at 1920, reading order at 320; glyph placement, each glyph aria-hidden at 3:1 contrast with the accessible name kept "Review changes"; same keyboard path and Changes focus). Each distinguishes a reordered group, a lost glyph or a broken focus handoff. 1440 and 2x zoom are between the two proven widths. |
| `review/story-review-action.spec.ts` — "`<column>` card Review changes eligibility and route with `<source>`" (8 cases, deleted) | launch/preparation/claim offer Review in Backlog and Taken, open Changes with `data-selected-story` and focused tab; none offers nothing | Rule: `backend-tests/review/story-review-workspace.spec.ts` (preparation counts like a start; found worktree; none). Rendered: action spec "a Backlog card offered Review changes by a claim / a Taken card … by a preparation / a Backlog card … by a launch opens its Changes with the tab focused" and "a Backlog/Taken card with no workspace offers no Review changes". |

Slice 7. The `sessions/recently-done-ad-hoc-*` specs stay legacy for SEED-426.
One mounted case added to `intent/intent-story-compare-done.spec.ts`
("compare-done"), which reads the Done story's comparison through Review
changes' own selection and `RunChoice`. No support was left without callers.

| Old case | Distinct observations | Replacement or equivalent |
| --- | --- | --- |
| `review/story-review-details-runs.spec.ts` — "a Done card opens on the latest captured run, keeping an older choice across Refresh" (deleted) | Opens on Landed runs with the newer run chosen; runs offered in read order, newest first; choosing each run names its launch time, "Refinement launched", `origin/main` and `From <base> to <revision>.`; that run's file reads its own diff; Refresh keeps the older choice | Default newer run and choice: compare-done "a Done story keeps its published locations when choosing captured changes…". Launch time, destination and endpoints: compare-done "Intent names the launch, destination and captured revisions of the landed run being compared". Order: new compare-done "Landed runs lists the captured runs as read, newest first, and the keyboard moves to the older run's changes" (fails when `RunChoice` reverses the options; also proves keyboard switching). Exact run file read: `intent/intent-story-compare-fixed.spec.ts` "a captured landed run reads its own diff pair…" (path, run baseline and tree). Refresh retention: compare-done "a newer default run moves an unchosen run but not a chosen one…" (stronger than the old case, which had no newer default), plus `review/story-review-details.spec.ts` "the chosen session run survives Refresh…" for "Review refreshed". Card-to-Review handoff: slice 6. Diff rendering: the diff reader specs. |

Slice 8. All six legacy files were deleted. Replacements:
`review/story-review-diff-text-retry-mount.spec.ts` and
`review/story-review-diff-grammar-failure-mount.spec.ts`, both through
`openGreetingReview` in `review/greetingDiff.ts` (over `mountReviewChanges`
and `reviewSourceAnswering`), which also holds the plain-and-complete reading
shared with `story-review-diff-late-styling.spec.ts`;
`review/story-review-diff-syntax-hint.spec.ts`, using the production
derivations plus `StyledFileDiff`;
`review/story-review-diff-source-appearance.spec.ts`, which mounts
`StyledFileDiff` beside `IntentSourceLines`;
`intent/intent-story-file-notes.spec.ts`, using `openStoryChanges`,
`notesKept` and the Notes composer and saved-note readers in
`intent/intent-story-notes-page.ts`, shared with `intent-story-notes.spec.ts`;
and `navigation/side-panel-width-files-room.spec.ts`, using
`mountWidthReview` with native frame and divider drags and the Files divider's
upper bound and stacking readers in `review/story-review-files-divider-view.ts`. Support left without
callers was removed: `test-support/support/{frontendSidePanelWidth,syntaxGrammar}.ts`
and `test-support/filesDividerPage.ts`; `reviewDiffSyntax` and
`frontendStoryReviewOpen` were removed with the intent-hints spec in slice 9.

| Old case | Distinct observations | Replacement or equivalent |
| --- | --- | --- |
| `review/story-review-diff-syntax-arrival.spec.ts` — "text that cannot be read leaves plain lines with only the context problem and Retry, and a Retry that reads it styles them" (deleted) | The diff's alert says exactly "Additional context could not be read: … Retry"; the lines are plain and complete with no tokens; Retry reads again and styles the same lines; the alert is gone | Text-retry spec, same title. The ReviewSource answers unavailable first and text second, so the case fails if Retry does not read again. |
| — "a grammar that fails to load leaves the code plain with nothing added" (deleted) | A failed TypeScript grammar leaves the lines plain and complete; revealing context adds 20 lines; no tokens; no alert | Grammar-failure spec, same title. A `vi.mock` of `@shikijs/langs/typescript` throws, and the case waits for that load. Mutation check: without the mock the case fails, so it detects a grammar that loads after all. |
| `review/story-review-diff-syntax-intent-hints.spec.ts` — "a live review supplies a diff's hint from Intent settings at the snapshot tree" (deleted in slice 9) | The settings are read at the snapshot tree; a hinted path and a renamed file's new path take the shell syntax; a path outside the location stays plain | Hint spec: "a live review reads Intent settings at its snapshot tree, …" (`reviewIntentSettingsRevision`), "a hinted path and a renamed file's new path take the location's syntax, …" (`syntaxHintOfRepositoryPath`), and "a diff styles by its syntax hint and stays plain without one" (rendered). The read itself: `useReviewDiffSyntaxHint` now reads through `useIntentReads().readLocations`, and `review/story-review-diff-syntax-hint-reads.spec.ts` "a live story review reads the diff's Intent hint at its snapshot tree and styles it" mounts a story-subject `SnapshotView` in the review page contexts with typed `intent.readLocations`. Mutation check: without the route both reads-spec cases fail. |
| — "a published Done review styles by completion Intent settings, not a later tip change" (deleted) | A published review takes its hint from the completion settings, not a later tip | Hint spec "… a published Done review at its completion" (published → completion), and reads spec "a Done story review reads the diff's Intent hint at its completion and styles it" (read at the completion, never at the tree; the diff styled). |
| `review/story-review-diff-syntax-appearance.spec.ts` — "diff tokens match Intent's source reading of the same code in both appearances" (deleted) | Keyword, identifier, string and comment on unchanged, added and removed lines match `IntentSourceLines` in dark and light; the schemes differ; roles differ | Source-appearance spec, same title (it mounts the actual `IntentSourceLines`). The legacy "switching appearance needs no extra read" no longer applies: the text is a prop and nothing is read. |
| `review/story-review-notes.spec.ts` — "workspace file notes name the Changes comparison and its endpoints" (deleted) | The composer shows Intent → Changes, the path, and All changes with baseline → tree; no line; the saved change has an exact context; the line menu offers only Add note | File-notes spec "a workspace file note names All changes and its exact endpoints without a line". |
| `review/story-review-note-context.spec.ts` — "Changes saves a landed run's renamed paths and exact endpoints without a line" (deleted) | Rename `old → new` and Landed run with baseline → tree in the composer; no line; the saved context has `path`, `oldPath` and exact endpoints; the saved entry in Notes shows the rename and comparison without a line | File-notes spec "a landed run's file note keeps the renamed paths and exact endpoints without a line". The story is Taken with a landed review; the comparison context is the observation that matters. The published note stays in `e2e/review/story-review-diff-add-note.spec.ts`. |
| `review/story-review-files-divider-room.spec.ts` — "the Side panel's room limits the file sidebar while its chosen width stays kept" (deleted) | Narrowed by 60, the diff is 18rem and the kept width is unchanged; widened, the chosen width returns; maximized, the upper bound equals `floor(room − 18rem)` and accepts ±48; Restore; narrowed by 400, the panes stack with no divider; widened again, the divider returns at the chosen width | Files-room spec, same title, over the mounted Board frame with native Side panel and Files divider drags. |

Timing (`--workers=2`): legacy 8 cases took 10.6 s at load 3.0 → 2.7. The
replacements, 9 Vitest cases, took 4.8 s at load 4.6 → 4.7. No E2E was added.

Slice 9 (partial, stopped on the clock). Reload journey: `e2e/sessions/cursor-sessions-sidebar-size-kept.spec.ts` step "a reload keeps the sidebar open, starts both sections collapsed, and expanding recovers the kept height" now expands Recently done before the reload and observes it collapsed after, with the sidebar still open; this proves the reload observation of `sessions/recently-done-sessions-sidebar.spec.ts` "empty and reading states stay distinct…" and "finds and opens…" (reload collapse). Still legacy: reload reset to 20 (`-sidebar-paging`), the Recently done divider's kept size after reload (`-sidebar-room`), the wheel/short-window remainder of `-sidebar-room`, the 44px review control, the long-title touch case, the rest of `-select-touch`, and the standalone `-select` case (SEED-426). With that step, `sessions/recently-done-sessions-sidebar.spec.ts` was wholly mapped and deleted (both cases). The other legacy sidebar files stay, because each still owns one of these.

Slice 10. All five remaining legacy files were mapped and deleted:
`sessions/recently-done-sessions-sidebar-paging.spec.ts`,
`sessions/recently-done-sessions-sidebar-room.spec.ts`,
`sessions/recently-done-sessions-select-touch.spec.ts`,
`sessions/recently-done-sessions-review-cue.spec.ts` and
`stories/recently-done-review-state-offer.spec.ts`.

| Old case | Distinct observations | Replacement |
| --- | --- | --- |
| `-sidebar-room` "both optional sections share one room…" — independent scroll | Wheeling Recently done to its end (reaching every retained row) leaves the open and Running lists' scroll where it was | `sessions/recently-done-sessions-sidebar-three-lists-mount.spec.ts` "…and the Recently done divider drags to its floor and keys by its step", "wheeling Recently done to its end reaches every row and leaves the open and Running lists where they were" and "a short window keeps every header and control of the sidebar reachable without sideways scrolling" (native CDP `mouseWheel`; open list at 40 px and Running at 24 px stay exactly; 30 of 30 rows reached). A shared scroller or a reset of another list fails it. |
| `-sidebar-room` — short window | At 320 × 256 every control reachable, no sideways scroll | Same case: after one retrying wait on the first sidebar button, a single synchronous pass scrolls each button into view and requires its whole box inside the window and every scrolling or clipping area holding it (as the legacy clipped-edge check). Mutation: clipping the Recently done rows to 20 px fails it, listing the cut-off controls. |
| `-sidebar-room` — reload preference; `-sidebar-paging` — reload reset to 20 | Recently done's divider size kept after reload; newest 20 after a reload that followed reaching 40 | `e2e/sessions/cursor-sessions-sidebar-size-kept.spec.ts` step "a reload keeps the sidebar open, starts both sections collapsed, and expanding recovers the kept heights and Recently done's newest 20" (45 kept done launches; reveal 40, key the divider, reload, expand: 20 rows and the same `aria-valuenow`). |
| `-select-touch` case 1 remainder | Closing the report returns the keyboard to the Sessions button | `sessions/recently-done-sessions-select-touch-mount.spec.ts` "on a phone's touch screen Select keeps the Sessions overlay and opens nothing, the separate Open reads the final report in its place, and closing the report gives the Sessions button the keyboard" (touch tap on Close). |
| `-select-touch` "at phone width a linked selection in Development is in view…" | Board's catalog read held after the check passes; overlay closed by tap; after release the card is selected and in view, Development checked, no Intent | Touch mount, same title (`pygardonCatalog().holdUntilReleased(1)` in `recently-done-selection-mount-page.ts`). |
| `stories/recently-done-review-state-offer.spec.ts` "Review actions and both confirmation choices offer the shared 44px control height" | 44px Mark as reviewed, Reviewed, Unreview, Cancel on touch; taps change state | `stories/recently-done-review-state-mount.spec.ts` "on a phone's touch screen Review actions and both confirmation choices offer the shared 44px control height" (column controls Taken → Recently done, reduced Board motion so the tap lands where the control rests). |
| `-review-cue` "a long title leaves Needs review and separate Select and Open usable" | Cue inside the row, Select/Open ≥ 44px, tap Select keeps cue and opens no report, tap Open reads the final report | `sessions/recently-done-review-cue-mount.spec.ts` "at narrow touch width a long title leaves Needs review and separate Select and Open usable": the row is observed retained for review (new `openReviewCue({ reported })`) with a typed `SessionServices.readFinalReport`; Open is named "Read final report" and its tap shows the report text in the Final report region. Same observations as the legacy case. |

Story-wide timing (`npm run test:dashboard:frontend -- sessions/recently-done sessions/follow-up-source-navigation stories/recently-done review/ --workers=2`, back to back, legacy at 4c0b4a9cb in a temporary worktree): legacy 63.8 s (load 3.61 → 4.60), resulting 53.8 s (4.60 → 3.93; one failure, the new phone review-control tap, fixed by reduced Board motion), resulting 44.0 s (3.93 → 4.15), legacy 58.4 s (4.15 → 5.31); a final resulting run after the fixes passed 172/172 in 39.5 s (runner) at 4.08 → 3.37. Elapsed includes setup. Counts: legacy 92 Playwright (96–99 summed case-seconds) + 107 Vitest; resulting 21 Playwright (18.7 s) + 172 Vitest, 174 after the refactor split the three-lists case. Slowest remaining: Playwright `sessions/recently-done-sessions-select.spec.ts` standalone case 3.18 s, the ad hoc review cases 1.3–1.4 s; Vitest the three-lists mount, split into three one-behavior cases (about 4.9 s summed; 2.5–2.9 s as one case, 9.4 s with a retrying assertion per control), the Files divider 2.0 s. Added E2E cost: one reload step in `e2e/sessions/cursor-sessions-sidebar-size-kept.spec.ts` (45 kept launches, reveal 40, one reload). The 21 Playwright registrations left are all SEED-426 standalone/ad hoc cases: `recently-done-ad-hoc-{branch-result,comparisons,review-gaps,review,session-commits,session-runs}`, `-review-cue-{evidence,races}`, the standalone `-select` case and the 31-day standalone entry in `recently-done-story-sessions.spec.ts`.

## Execution complete

Product advice:
- Retain the result: the scoped Done-session and review selection runs in
  39.5–44 s against 58–64 s at two workers, with 92 legacy Playwright cases
  reduced to 21, all standalone cases SEED-426 removes. The campaign's fewer
  maintained cases aim is met only marginally here (199 → 195 cases); most of
  that reduction arrives when SEED-426 deletes the standalone cases.
- Runner retirement (SEED-413#retire-legacy-dashboard-frontend-runner) still
  waits on this story with the condition that no legacy frontend spec in its
  Done review boundary remains on trunk, which the SEED-426 handoff leaves
  unmet; its dependency belongs on SEED-426 for the remaining standalone specs.
- Five read functions still default to their authenticated reader when none
  is passed (`dashboard/src/doneStories.ts` `cataloguedAt` and
  `readDoneStories`, `authenticatedIntentRead.ts` `readIntentLocationsAt`,
  `agentAssignments.ts`, `authenticatedProfileRead.ts`), against the shared
  acceptance; slices 2 and 9 each had to reroute such a read before mounted
  proof could run. The board-frame mount relays each read through several
  optional layers, and a partial `PageReads` override would remove that relay.
- Planning runner retirement can reuse slices 6 and 8's learning: mounted
  cases split across files ran about twice as fast as one serial file.
