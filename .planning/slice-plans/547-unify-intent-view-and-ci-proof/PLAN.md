# Unify the Intent view and CI proof

**Identity:** SEED-282#unify-intent-view-and-ci-proof

**Source:** [Unify the Intent view and CI proof](../../seeds/SEED-282-unify-intent-view-and-ci-proof.md#unify-intent-view-and-ci-proof)

## Goal and scope

Developers read project and selected-story Intent in one persistent
header/tab/content arrangement and read one CI comparison language from the
story through location, folder, and file evidence. Preserve independent
project/story evidence and reading places, keyboard return, narrow/zoomed
reading, and CI availability when locations cannot be read.

The source owns the examples and restrictions. In particular, precise
drill-down changes remain visible; each displayed comparison shares a
symmetric relative scale of at least 50%, widened to its largest displayed
relative change. Show % is the story reading preference across scopes.
Baseline sorts by measured time and Branch/Landed by signed change, with
uncomparable rows last and the outside row pinned last.

No CI endpoint discovery, proof schema/collection, count-unit semantics,
revision/retry policy, or coverage assessment change. SEED-281's test-case vs
test-file work is independent. Preparation does not authorize implementation.

## Architecture and reuse

Follow [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#dashboard-ui-concepts):
Selected story is page state; a Project Intent visit preserves it. Keep
`IntentCiEvidence.tsx`'s context-specific evidence ownership and
`pageIntentReading.tsx`'s separate disposable project/story reading scopes.
Share the page presentation around optional story context rather than
substituting one shared mutable evidence target. Preserve the currently shown
evidence context independently of the retained Selected story.

PFE inspected the current owners at `1d10644648ff861a257ba964418bd3459b9d0826`:

- `IntentPerspective.tsx` already chooses context, activates evidence, and
  manages return focus. `IntentStoryView.tsx` and `IntentProjectView.tsx`
  duplicate page arrangement around shared `IntentBrowser.tsx`, `IntentTabs.tsx`,
  and evidence/reading owners. Change that existing presentation into one
  implementation, preserving applicable project and story views.
- `ciScopeComparison.ts` and `ciScopeComparisonTiming.ts` already calculate
  entry/folder/file cells, renamed Baseline paths, partial timing, and gaps.
  `storyCiComparisonEntries.ts` privately converts those cells to signed
  changes. Expose one precision-aware conversion for every compared scope,
  keeping the domain classification and endpoint rules authoritative.
- `IntentCiComparison.tsx` owns active comparison framing and the relative
  provider/control; `IntentScopeComparisonTable.tsx` and `IntentFileProof.tsx`
  use the same scope evidence without that presentation. Share that
  presentation and reading preference at their existing boundaries.
  Calculate relative scale from each displayed comparison's figures/rows,
  with no new provider reads or unseen-descendant scan.
- `CiProofTable.tsx`, `CiProofFigures.tsx`, and `ciProofSort.ts` already render
  signed cells and sort their `changeMs` when `showsChange` is true. Carry the
  common cell meaning through these consumers rather than making another
  table or a separate drill-down sorter.

This follows [ADR 0002, principles 2 and 5](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
and [ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md).
The ADR index and relevant record statuses agree, with no applicable conflict
or supersession. The established [North Star](../../NORTH-STAR.md#one-backlog-interpretation-separate-observation-and-presentation)
supports ordinary components and transient presentation state. No new topic,
ADR, service, or persistence mechanism is needed.

## Outside-in proof ownership

All automated domain arrangements use the shared MakeMe API under
[test data architecture](../../../tests/README.md#test-data-architecture).
Extend the existing published-project/story fixtures with the facts at the
case site; do not replace product behavior with fixture-supplied results.

| Source promise | Slice | Observable proof |
| --- | --- | --- |
| Persistent arrangement with No story selected; correct applicable views and trunk evidence; selection/clear transitions | 1 | Extend `intent-ci-status-homepage.spec.ts` and `intent-project-visit.spec.ts`: shared header with project tabs, then story title/views, then deselect to project CI. Inspect one shared production page implementation as structural proof. |
| Visiting project preserves Selected story and both reading places, published project text, keyboard return, and read reuse | 1 | `intent-project-visit.spec.ts`'s real Taken worktree journey keeps Purpose scroll, file Proof, project candidate/focus, and exactly one candidate/text read; retain `intent-home-activation.spec.ts`, `intent-reading-place.spec.ts`, and sidebar-toggle journeys. |
| Header/views/reader remain usable with missing locations and at narrow/zoomed widths | 1 | Extend `intent-story-views-narrow.spec.ts` to no-story context; retain `intent-story-changes-gaps.spec.ts`'s queued story without workspace/locations, `intent-sidebar-toggle.spec.ts`, and `intent-ci-proof.spec.ts` / `intent-summary-ci-proof-table.spec.ts` at their short/zoom-style viewports. |
| Same active label, observed-build framing, endpoint columns, signed change, precise drill-down, and relative marks at every depth | 2 | Extend the published done-story entry → folder → nested file journeys in `intent-summary-story-comparison.spec.ts` and `intent-summary-story-comparison-file.spec.ts`: compare labels/cells with CI comparison, including 340 ms → 410 ms = +70 ms. Preserve renamed Baseline lookup and merge-edited file coverage. |
| Shared Show % preference and scale rule; words remain understandable without colour; zero/added/gap evidence never invents a ratio | 2 | Extend `intent-ci-comparison-relative.spec.ts` into Summary/File Proof and back: initial off, keyboard toggle, retained preference, same displayed scale for own figures/children, rescale on scope change, no mark/percentage for zero Baseline/added/gaps, unchanged mark at zero. Assert accessible words and geometry, not colour alone. |
| Sorting matches shown quantities and survives drilling | 2 | Extend adversarial MakeMe facts in `intent-ci-comparison-sort.test.mjs` and `intent-summary-story-comparison-sort.spec.ts` so duration, signed change, and percentage have different orders; cover ascending/descending, ties/gaps/additions, pinned outside row, retained sort and missing-column fallback. |
| Same fallback/absence rules at every scope; no new evidence reads | 2 | Extend `intent-summary-story-comparison-gaps.spec.ts` and keep `intent-summary-story-comparison-outside.spec.ts`: running Landed/Branch fallback, Trunk N/A, Taken provisional, no breakdown/partial/outside figures. Count authenticated comparison/proof requests through the full drill-down and require no extra read caused by the shared presentation. Preserve existing recovery/read-reuse journeys. |
| Maintained product guidance describes delivered behavior | 1, 2 | Slice 1 aligns Intent/story page guidance; slice 2 aligns CI comparison/Summary/Proof wording. Keep seed and plan numbering out of product code, tests, and lasting documentation. |

## Ordered slices

### 1. Read project and story Intent in one persistent page

Type: Behavior
Status: planned
Proof: slice 1 rows above; relevant focused browser journeys, then the
affected Intent consumer suite under the gate below.

No story selected → open Intent → the persistent header says **No story
selected**, with project CI status and Optimization Candidates below it.
Select or clear a story → the same page arrangement shows the applicable
context. Visit Project Intent with a story selected and return → the selected
story and each context's evidence/reading remain intact, with keyboard return.
CI remains readable independently of locations. The common frame fits narrow
and short/zoomed reading and preserves Hide files and direct-home behavior.

Generalize the existing page/header/tab orchestration; preserve the browser,
evidence and reading owners. Align all observing helpers and structural/text
assertions in the consumer trace, without weakening the underlying promises.
Update `docs/dashboard-development-intent.md` and the page/header portions of
`docs/dashboard-development-intent-story.md` in the same slice. Consult current
trunk for the independently owned Side panel selection correction; use its
accepted behavior rather than duplicating its repair.

Safe stopping point: both evidence contexts use the shared page; comparison
drill-down retains its current presentation until slice 2.
Sizing hypothesis: one bounded presentation transition and preservation proof
loop, using established state and evidence boundaries. No new state store or
provider contract is assumed.

### 2. Read and sort the same CI comparison at every evidence depth

Type: Behavior
Status: planned
Proof: slice 2 rows above; one complete story → location → folder → file
journey, adversarial sorting, gaps, relative geometry, and request accounting.

A story comparison is available → drill into Changed tests Summary and file
Proof → each scope uses its active endpoints, shared comparison framing,
signed timing cells, marks, and Show %. Precise drill-down changes stay
visible. A displayed comparison shares one scale across its own figures and
rows; changing depth applies that rule to the new displayed set. Turning on
Show % in one scope applies when the next is opened and when returning.

Use the existing scope model with shared precision-aware signed-cell
presentation. Propagate its signed meaning to the existing sorting in the
same change: Baseline orders measured time, Branch/Landed order change, and
uncomparable values stay last. Keep current Counts, Change, pinned outside
row, rename mapping, proof labels and explanations. Comparison tables use the
story's words/marks presentation while tree cues keep their current meaning.
Use already-held evidence; Summary reads no source text and drilling initiates
no additional CI request. Align timing/comparison guidance and expected rows
with the final behavior together.

Safe stopping point: all promised scopes speak one comparison language;
project one-run proof remains meaningful and independent of retained story
selection. Sizing hypothesis: one common comparison rule and one drill-down
proof loop, reusing current figures, tables, sorting, and evidence. Splitting
sorting from signed display would create an unnecessary inconsistent state;
no separate Structure slice is justified by the inspected implementation.

## Consumer trace and verification gates

The shared page reaches enclosing navigation and all Intent views. Inspected
observers include `intentModePage.ts`, `support/intentStoryPage.ts`,
`intentCiStatusPage.ts`, and `intentPerspectivePage.ts`: their current context
detection and separate-header/tab-row selectors must follow the shown evidence
context rather than infer it from retained Selected story. In particular,
`intent-ci-status-homepage.spec.ts` currently expects zero h2 headings;
project-visit/home-activation expect the story header absent; sidebar-toggle
asserts combined tab-row text; gaps asserts the old first-child structure.
Replace those obsolete structural observations with common-page semantics,
preserving evidence, keyboard, overflow, and reading expectations.

CI presentation reaches `summaryComparisonExpectedRows.ts`,
`summaryComparisonFileExpectedRows.ts`, `expectCiComparisonCues.ts`,
`ciEvidenceLabelsPage.ts`, and their enclosing specs. They currently expect
before → after wording and comparison tint/count edges in Summary/Proof.
Update them for the shared signed/mark presentation while preserving the
classification and tree cues. The sort unit's final case explicitly expects
the old Summary measured-time sort and must change, not survive as a second
domain rule.

At each implementation diff, run the installed consumer-trace script with
`--base HEAD` and terms for the changed header/context, old comparison wording,
and any changed helper exports. Follow located helpers to their callers and
give each consumer a run/reused/excluded disposition. These preparation traces
are starting evidence, not a substitute for the actual diff's trace.

Focused commands start from this worktree:

- `npm run typecheck:dashboard` and `npm run lint` for changed dashboard code.
- Slice 1: `npm run test:dashboard -- tests/intent/intent-ci-status-homepage.spec.ts tests/intent/intent-project-visit.spec.ts tests/intent/intent-home-activation.spec.ts tests/intent/intent-reading-place.spec.ts tests/intent/intent-sidebar-toggle.spec.ts tests/intent/intent-story-views-narrow.spec.ts tests/intent/intent-story-changes-gaps.spec.ts tests/intent/intent-ci-proof.spec.ts tests/intent/intent-summary-ci-proof-table.spec.ts --workers=2`.
- Slice 2: `node --test tests/support/intent-ci-comparison-sort.test.mjs tests/support/intent-ci-relative-change.test.mjs tests/support/intent-scope-proof.test.mjs tests/support/intent-scope-comparison-cues.test.mjs tests/support/intent-scope-comparison-wording.test.mjs` and `npm run test:dashboard -- tests/intent/intent-summary-story-comparison.spec.ts tests/intent/intent-summary-story-comparison-file.spec.ts tests/intent/intent-summary-story-comparison-sort.spec.ts tests/intent/intent-summary-story-comparison-gaps.spec.ts tests/intent/intent-summary-story-comparison-outside.spec.ts tests/intent/intent-ci-comparison-relative.spec.ts tests/intent/intent-read-reuse.spec.ts tests/intent/intent-read-reuse-story.spec.ts --workers=2`.

For the shared presentation changes, the maintained `dashboard/tests/intent`
suite is the affected consumer set: run `npm run test:dashboard -- tests/intent
--workers=2` before delivery, including additional consumers found by the
actual diff trace. Use a single sufficient run instead of repeating its
covered focused cases. No full repository suite is prescribed solely because
hosted CI runs it. Published CI failures remain owned under the policy below.

**Local gate.** Follow [machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos):
start fully awake; on AC wrap long checks in **caffeinate -s -i**. On battery,
plug in or keep the lid open under **caffeinate -i** and inspect the sleep log.
Before expensive runs inspect this host's load/memory and competing work,
keeping coverage while choosing supported concurrency. All failure/flake and
CI repair handling follows [the project's failure policy as written](../../../AGENTS.md#failing-and-flaky-tests),
including failures attributable to base and preservation of another active
repair owner's uncommitted work. Never wait for wall-clock time in tests,
use test.slow(), or override suite/file/group/hook timeouts.

## Decisive premises and retained observations

Observed in this owned worktree on 2026-11-09 at
`1d10644648ff861a257ba964418bd3459b9d0826`, with production and test paths
unchanged apart from the reverted scratch faults. Commands used the normal
dashboard Playwright config and Chromium fixtures.
This machine was on AC with load 4.28/5.63/6.86, about 1.3 GiB free plus
inactive memory, and no other observed test run. Two workers under the AC
sleep guard were sufficient for these bounded observations. Initial fixture
startup failed because this new worktree had no node_modules; `npm ci
--ignore-scripts --no-audit --no-fund` repaired that local setup, after which
the same checks reached their observations.

| Premise / consuming operation | Observation in the consuming form | Result and limit |
| --- | --- | --- |
| Slice 1 can preserve the actual project/story visit through existing evidence/reading owners | `caffeinate -s -i npm run test:dashboard -- tests/intent/intent-project-visit.spec.ts tests/intent/intent-ci-comparison-relative.spec.ts --grep "a candidate's test\|relative changes share" --workers=2 --reporter=line` | Both passed, 10.1 s: real Taken worktree visit restored Purpose scroll, published project candidate, file Proof, keyboard returns, and asserted request reuse. This is preserved-behavior evidence, not proof of the new shared frame. |
| The visit proof discriminates loss of scope isolation; the relative proof discriminates wrong signed text | Scratch remove `scopedKey`'s scope prefix and replace `timeChangeOf` text with "comparison disabled"; run the exact two-spec command above, then restore both files | Both failed: project visit could no longer show main CI after entering project context; entry Branch cell received disabled text instead of +30 s. Scratch edits were reverted before records. This establishes these checks' discrimination only at the observed boundaries. |
| Slice 2's existing sort consumes signed changes rather than measured/relative time | `node --test tests/support/intent-ci-comparison-sort.test.mjs`; scratch force `valueOf` to return `cell.ms` and repeat, then restore | Baseline 4/4 passed; fault failed the entry ordering and adversarial signed-change cases (2/4), including added rows moving ahead of comparable changes. Final Summary case proves the current divergence and must be rewritten. |
| Normal fixture route reaches published file Proof and precision-bearing expected rows | `caffeinate -s -i npm run test:dashboard -- tests/intent/intent-project-visit.spec.ts tests/intent/intent-ci-comparison-relative.spec.ts tests/intent/intent-summary-story-comparison-file.spec.ts --grep "a candidate's test\|relative changes share\|compact comparison with clean merges" --workers=2 --reporter=line` after all scratch restores | 3/3 passed, 14.5 s. The clean file journey observes modified, added, and unchanged file timings and keyboard CI-return. The new signed/relative drill-down assertions are slice 2 work and must first fail on current behavior. |
| Location/folder and sort fixtures reach the intended drill-down and current sorting, including rename lookup | `caffeinate -s -i npm run test:dashboard -- tests/intent/intent-summary-story-comparison.spec.ts tests/intent/intent-summary-story-comparison-sort.spec.ts --workers=2 --reporter=line` | 3/3 passed, 15.5 s: both clean and owning-merge variants read precise location/folder figures and changed/renamed child rows; the sort journey observes current measured-time ordering, retained sort, missing-column fallback, and zoomed fit. These existing expectations must change where the promised signed presentation differs. |
| The nested merge-edited file fixture exposes the source's 70 ms example | `caffeinate -s -i npm run test:dashboard -- tests/intent/intent-summary-story-comparison-file.spec.ts --grep 'own-conflict-extra' --workers=2 --reporter=line` | 1/1 passed, 14.6 s: the owning-merge variant reads the nested file's current 340 ms → 410 ms (+70 ms, +21%) cells. Slice 2 owns replacing that wording with the common signed-cell/mark presentation; the fixture does not supply the display behavior. |

Reassess observations only when relevant code/fixture/environment changes
invalidate them; unchanged retained proof needs no repeat. Before implementation
capture the new shared-header and drill-down acceptance failures in the normal
fixtures, then make them pass. Existing passes do not claim those new promises.

## Current decisions and preparation review

- Preserve page-owned selection and separate evidence/reading contexts; shared
  layout changes no repository or machine-local authority.
- Preserve precise drill-down timing and apply the existing relative-scale
  rule to the currently displayed figures, with one kept Show % preference.
- Keep signed display and its sorting atomic. Added/gap/zero handling comes
  from current evidence classification, not a new per-scope exception set.
- Preserve current endpoint discovery and recovery. No dependency on the
  independent Side panel correction or test-unit story is introduced.

Plan refinement was not needed: two cohesive Behavior slices own the page
transition and the complete comparison drill-down respectively. Each has one
observable proof loop and a safe stopping point; shared responsibilities are
reused inside those slices rather than scheduled as speculative Structure.
No remaining slice-specific concern was identified within the inspected
boundaries. No execution or Take is authorized by this preparation.
