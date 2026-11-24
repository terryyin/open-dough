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
| Sessions reads retained work across projects and the reader expands or scrolls Recently done | Correct rows, order, completion age, accessible room and range through refresh | 1 |
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
Status: planned

**Roster (7 cases).** `sessions/recently-done-sessions-sidebar{,-paging,-projects,-room,-touch}.spec.ts`.

**Proof.** Use the production Sessions sidebar and its projection of
retained rows. With several projects and both optional sections, verify
project identity, newest-first order, completion age, empty versus reading,
progressive scroll, refresh and the short-window geometry. Keep resize,
independent scroll and saved size observations. Put the actual reload and
collapsed-section restoration in a representative E2E session sidebar
journey. Start from `e2e/sessions/cursor-sessions-sidebar-size-kept.spec.ts`
for existing persistence and preserve the three-section distinction where
it affects the result. Exercise independent Board detail reads through
`e2e/sessions/recently-done-sessions-sidebar-paging-board.spec.ts` if that
boundary changes.

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
and narrow overlay. The real terminal attach remains in
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
pass was unnecessary. Fit the 15 active-minute limit by keeping representative
rendered scenarios and checking distinct variants at their smallest owner.
