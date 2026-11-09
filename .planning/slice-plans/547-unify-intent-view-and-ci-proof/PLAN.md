# Unify the Intent view and CI proof

**Identity:** SEED-282#unify-intent-view-and-ci-proof

**Source:** [Unify the Intent view and CI proof](../../seeds/SEED-282-unify-intent-view-and-ci-proof.md#unify-intent-view-and-ci-proof)

**Source review:** [Independent source commitments](source-review.md)

## Goal and scope

One persistent header/tab/content arrangement for project and selected-story
Intent, preserving separate evidence/reading places, keyboard, narrow/zoomed
use and CI independent of locations. Share CI comparison language through
location/folder/file, preserving precision, symmetric per-display scale
(minimum 50%), one Show % preference, measured Baseline sort and signed
Branch/Landed sort with uncomparable rows and pinned outside last.
Source owns examples/restrictions. No endpoint discovery, proof schema,
collection, count units, revision/retry or coverage change. SEED-281 is independent.

## Architecture and reuse

[ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#dashboard-ui-concepts)
keeps Selected story at page scope and project/story evidence and reading
places independent. Share presentation around optional story context, while
shown evidence context remains distinct from retained selection.
PFE at `1d10644648ff861a257ba964418bd3459b9d0826` selected existing owners:
- `IntentPerspective` orchestrates context, evidence and focus; duplicate
  `IntentStoryView`/`IntentProjectView` arrangements share the browser/tabs.
- `ciScopeComparison`/`ciScopeComparisonTiming` calculate scope evidence,
  rename paths, precision and gaps; expose the private story signed conversion.
- Share `IntentCiComparison` framing/relative control with Summary/File Proof
  using held evidence and displayed figures/rows only, without provider reads.
- `CiProofTable`, `CiProofFigures` and `ciProofSort` already consume signed
  cells/changeMs; carry common meaning through them without another sorter.
This fits [ADR 0002 principles 2/5](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md),
[ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md), and the
[North Star](../../NORTH-STAR.md#one-backlog-interpretation-separate-observation-and-presentation):
ordinary components and transient presentation state, no new provider or store.
Relevant Accepted statuses agree, with no supersession or conflict.

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
Status: done
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

[Retained preparation observations](proof.md#decisive-premises-and-retained-observations)
record the literal commands, real fixture paths, settled context-isolation,
comparison precision/sorting, request-reuse observations and scratch fault
discrimination at `1d10644648ff861a257ba964418bd3459b9d0826` on this host.
Reuse them while their boundaries hold. Slice 1's new shared-header and
held-location promises now have current acceptance proof; slice 2 must capture
its new signed drill-down acceptance failure before implementation.

## Current decisions and preparation review

Preserve page selection and independent evidence/reading contexts; share
precision-aware comparison display and signed sorting atomically, using held
evidence. Endpoint recovery stays unchanged. Two cohesive Behavior slices
have one proof loop and safe stop each. No remaining preparation concern or
new provider/store; no dependency on Side panel or test-unit work.

## Execution context

Established start accepted 2026-11-09; story-branch mode, reused owned workspace:
`/Users/terryyin/git/open-dough/.worktrees/unify-the-intent-view-and-ci-proof`,
branch `codex/unify-the-intent-view-and-ci-proof`. Originating/execution checkout
are this workspace; default/integration checkout `/Users/terryyin/git/open-dough`.
Remote `origin`, trunk `main`; increment target is the execution branch.
Publisher `dashboard-territory.local-open-dough`, agent `jackson-chan`.
Starting revision `35b3db1a95ead4e19b5af3d5a907349c0fce7fa5`; accepted claim,
initial published base/candidate `b62745bec339504a683c736d59caa09f4d3b915c`.
Remote branch confirms claim; claim trunk CI unobserved. Checkout setup:
`npm ci --ignore-scripts --no-audit --no-fund`, then dashboard typecheck passed.
Check-only hook owns staged lint/typecheck; selective formatter `npm run format`.
No numeric slice budget/hard limit; retain within-story planning authority.
CI: GitHub Actions `terryyin/open-dough`, push `ci.yml`; initial native lookup
held by directed rate limit. Observer `seed282-codex`, `/tmp/dough-ci-501/watch-bQpQj3`,
PID `35239`, stream `9080`, yielded cell `g48:8`, this checkout, watching.
MacOS awake on AC: `caffeinate -s -i`, at most two workers; recheck competing
work/load/memory before expensive commands. Final slice 1 launch had load
3.82/4.95/5.19, ~4.8 GiB free plus inactive, no competing browser runner.
Do not duplicate SEED-275's active Side panel correction; ADR 0008 already
requires preserved selection on close. Recheck trunk before integration.

## Story obligations

### G1. Project CI during held location loading
Reported: slice 1 — "Acceptance inspection found that projectCiActive and the project fallback wait for locations to settle, while the source promises CI usable while locations load."
Story clause: "usable CI while locations load or fail"
Disposition: proved by slice 1: `intent-ci-status-homepage.spec.ts`, “project CI remains readable while locations load, fail and recover without another CI read” observes held load → location failure → Retry → tree with main CI visible and exactly one fresh plus one kept judgment request. Inspected production activation remains in the same mounted project evidence owner; final affected 68-test strict run passed.
Commitment: C26a

### G2. Observe Hide files across evidence-context visits
Reported: slice 1 — "Coordinator acceptance inspection found no explicit cross-context Hide files assertion in project-visit or sidebar-toggle; existing observations cover separate views and mounts only."
Story clause: "Hide files choice"
Disposition: proved by slice 1: `dashboard/tests/intent/intent-sidebar-toggle.spec.ts`, “the hidden column stays hidden through a Project Intent visit”: lines 167–191 explicitly hide story, visit project with files shown, return to story still hidden, then retain it through Development. Coordinator inspected this previously missed block; current focused run passed, with full Intent run covering it again.
Commitment: C10e

## Slice 1 acceptance and proof

Accepted the common page, separate evidence/reading owners, and independent
project CI during held locations. [Retained proof](proof.md#slice-1-acceptance-and-proof)
contains the literal commands, consumer dispositions, source comparison and
resource decision: focused 9 passed; full 260 passed plus 3 obsolete heading
assertions subsequently repaired; final affected strict 68 passed; typecheck
and diff check passed. G1 and G2 are proved; no slice 1 gap remains.

Independent refactor accepted: common header/style ownership and exact test
helper extraction; focused 16/16 strict passed, typecheck/diffcheck passed.
Details and command retained in [proof](proof.md#slice-1-independent-refactor).
