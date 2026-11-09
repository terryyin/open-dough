# Retained preparation and execution proof

Supporting evidence for [the active plan](PLAN.md).

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


## Slice 1 acceptance and proof

Accepted common `IntentPage` with optional story context, `IntentHeader`,
project tab definitions, and retired duplicate views/styles. Both evidence
providers, reading scopes and workspace selection owners remain independent;
project browsing has no story overlay. Coordinator inspected the product,
project-visit, sidebar-toggle, homepage held-location, narrow, story-header,
home-activation and independent-scroll assertions against the source review.
Source-only review commitments allocated to slice 1 are observed or linked to
proved G1/G2. No unresolved slice 1 promise remains.

Implementation return: `/tmp/seed282-slice1-return.md`. Actual consumer trace
uses `--base HEAD` with retired view/header/class names, context selectors,
heading observation, loading text and affected helper exports. Its per-row
dispositions are `/tmp/seed282-slice1-consumer-dispositions.md`: all actual
Intent consumers run/reused; navigation `development-intent-frame*` and session
`recently-done-sessions-select` additionally run; generic planning/header
matches outside this effect excluded after following their enclosing callers.

New shared-header acceptance failed before implementation. Focused command:
`caffeinate -s -i npm run test:dashboard -- tests/intent/intent-ci-status-homepage.spec.ts tests/intent/intent-project-visit.spec.ts tests/intent/intent-story-views-narrow.spec.ts tests/intent/intent-sidebar-toggle.spec.ts --workers=2 --reporter=line`
passed 9/9. Full affected command:
`caffeinate -s -i npm run test:dashboard -- tests/intent --workers=2 --reporter=line`
finished 260 passed, 3 failed (6.7 min). Those three failures were obsolete
zero-h2 assertions in code-browse, gherkin-browse, gherkin-unusable; repaired
to explicit No story selected and all passed in the final affected run.

G1 acceptance command:
`caffeinate -s -i npm run test:dashboard -- tests/intent/intent-ci-status-homepage.spec.ts --grep 'project CI remains readable' --workers=1`
failed before its fix and passed afterward. Final invalidated project
activation/reuse, repaired heading, and outer consumer proof:
`OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed282-slice1-affected-20261109.json caffeinate -s -i npm run test:dashboard -- 'dashboard/tests/intent/intent-(ci-status.*|ci-proof.*|summary-ci-proof.*|project-visit|home-activation|read-reuse.*|code-browse|gherkin-browse|gherkin-unusable)\.spec\.ts' tests/navigation/development-intent-frame tests/sessions/recently-done-sessions-select.spec.ts --workers=2`
passed 68/68, strict completed receipt, 75.97 s. Unchanged story/layout,
comparison, tabs/toggles and independent-scroll boundaries retain the full
run's passing observations. `npm run typecheck:dashboard` and
`git diff --check` passed after final production edits. No failing case remains.

Resource decision remained awake/AC under `caffeinate -s -i`, at most two
workers; final rerun load 3.82/4.95/5.19, ~4.8 GiB free plus inactive,
no competing runner. No sleep/timeout/flake invalidation observed.
Source freshness unchanged at `7611641b322b494262e57097ce80580ac8afb044`.
Named siblings: SEED-281 and SEED-275#preserve-story-on-panel-close remain
Taken with no landed product change affecting this slice; SEED-275's other
story closure is unrelated. Recheck those owned boundaries during integration.

## Slice 1 independent refactor

Accepted `/tmp/seed282-refactor1-return.md` with `## REFACTOR COMPLETE`.
`IntentHeader.tsx` owns shared header; `intent-page.css` loaded by `IntentPage`;
story summary retains story facts. Exact code-browse and project-visit helpers
moved to their cohesive test helper modules. Coordinator inspected relocations
and assertions; no behavior/evidence/provider change. Trace dispositions at
`/tmp/seed282-refactor1-consumer-dispositions.md`; unchanged full/68-test proof
reused, runtime imports/styles and moved helper observations reverified:
`OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed282-refactor1-proof.json caffeinate -s -i npm run test:dashboard -- tests/intent/intent-ci-status-homepage.spec.ts tests/intent/intent-project-visit.spec.ts tests/intent/intent-sidebar-toggle.spec.ts tests/intent/intent-story-views-narrow.spec.ts tests/intent/intent-story-summary-title.spec.ts tests/intent/intent-story-review-return.spec.ts tests/intent/intent-story-changes-gaps.spec.ts tests/intent/intent-code-browse.spec.ts --workers=2`
passed 16/16 strict, 34.95 s; typecheck and diffcheck passed. All changed/new
files remain <=250 lines after formatter projection. No unresolved gap.

Native workflow verification after the directed wait: installed diagnostic
`workflow terryyin/open-dough` returned active `ci.yml`, id `351271804`,
display name `CI`, path `.github/workflows/ci.yml`. Initial lookup hold is settled.

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


CI observer received a second informational directed throttle while slice 2
proof ran: resumes `2026-11-09T02:08:58.352Z` after 2441 s. Coverage remains
armed; do not poll or relabel this as CI success/loss. Final applicable
completion still owns the wait after delivery/review.

## Slice 2 acceptance and proof

Implementation return `/tmp/seed282-slice2-return.md` accepted after inspecting
actual model, setup and observing assertions. Shared frame receives held
evidence; scope cells preserve classification/rename/precision and supply
changeMs to existing sorting; no new reader or endpoint policy. Live preference
is above hidden mounted story panels. Scale receives own figures and immediate
rows only. Source review rows individually retain observed locations or G3/G4.
Docs align comparison/Summary/Proof behavior and tree cues. Excluded endpoint,
schema, collection, revision/retry, count units, coverage and project views are
unchanged in the production diff; independent SEED-281 remains unrelated.

Before implementation, the signed file Proof acceptance failed for old
before-to-after text, using the normal clean-merge fixture. Provisional compact
labels likewise failed before correction after the fixture's required slug
was supplied. Source examples are now directly observed by deep-relative,
fallback, signed-sort and zero-Baseline browser journeys. Geometry proves
shared own/child scale, min50%, scope rescaling, left/right/unchanged marks;
toggling preserves geometry/order and synchronizes back to hidden home panel.
The real owning-merge nested file shows +70ms/+21%; added/gap/zero Baseline
show no fabricated ratio. Exactly one comparison plus three proof requests
remain unchanged during full drilling; Summary initiates no source-text read.
Literal expanded unit command (42/42 passed):
`node --test tests/support/intent-ci-comparison-sort.test.mjs tests/support/intent-ci-relative-change.test.mjs tests/support/intent-scope-proof.test.mjs tests/support/intent-scope-comparison-cues.test.mjs tests/support/intent-scope-comparison-wording.test.mjs tests/support/dashboard-ci-comparison-entries.test.mjs tests/support/intent-ci-proof-sort.test.mjs tests/support/intent-ci-proof-timing.test.mjs`
Final focused commands passed with strict default reporter:
`caffeinate -s -i npm run test:dashboard -- tests/intent/intent-summary-story-comparison-sort.spec.ts --workers=1`
`OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed282-slice2-signed-sort.json caffeinate -s -i npm run test:dashboard -- tests/intent/intent-summary-story-comparison-signed-sort.spec.ts --workers=2`
`caffeinate -s -i npm run test:dashboard -- tests/intent/intent-summary-story-comparison-fallback.spec.ts tests/intent/intent-ci-comparison-drilldown-relative.spec.ts --workers=2`
Full affected command:
`OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed282-slice2-full-intent.json caffeinate -s -i npm run test:dashboard -- tests/intent --workers=2`
finished 270 selected,269 passed,one obsolete tree location ARIA before-to-after
literal failed,465.45s. Only its expected output changed to shared signed text;
all cue/tint/count/selection/focus assertions retained. No production change
followed full run. The complete repaired journey passed1/1 strict,13.26s:
`OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed282-slice2-tree-cues.json caffeinate -s -i npm run test:dashboard -- tests/intent/intent-story-ci-cues.spec.ts --workers=1`
`npm run typecheck:dashboard` and `git diff --check` passed afterward. Other269
observations remain valid. Full run's actual host ACawake,load6.04/5.36/5.23,
~2GiBfree+inactive with lowCPU separate Side panel runner: max2workers under
`caffeinate -s -i`; no relaxed timeout or sleep/flake invalidation.
Consumer trace uses baseHEAD and changed/retired timing conversion,Show%,
framing,sorting,compact label and tree accessible-name terms. Final839 consumer
rows dispositioned at `/tmp/seed282-slice2-consumer-dispositions.md`; actual
Intent and42-node consumers run, generic planning/import/endpoint parsing
contracts outside effect excluded after following their boundaries.

## Slice 2 independent refactor

Accepted `/tmp/seed282-refactor2-return.md` with `## REFACTOR COMPLETE`.
Removed internal showsChange flag now redundant with comparison-cell identity
from type/constructors/table notes/sorter; only three representation-only unit
assertions removed. Coordinator inspected changed consumers and exact preserved
behavioral assertions. No schema/value/read/endpoint/fixture change.
Expanded42-node command above passed again; current focused browser command:
`OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed282-refactor2-proof.json caffeinate -s -i npm run test:dashboard -- tests/intent/intent-ci-comparison-relative.spec.ts tests/intent/intent-ci-comparison-drilldown-relative.spec.ts tests/intent/intent-summary-story-comparison-signed-sort.spec.ts tests/intent/intent-summary-story-comparison-sort.spec.ts tests/intent/intent-summary-ci-proof-table.spec.ts --workers=1`
passed8/8 strict,60.64s. Typecheck/diffcheck passed. Current shared sort/table,
geometry/preference/read accounting reobserved; accepted full269+tree evidence
retained elsewhere. Trace842rows dispositioned at
`/tmp/seed282-refactor2-consumer-dispositions.md`; no runtime flag reference.
All files <=250 formatted lines. ACawake host load5.35/5.71/5.70,~0.74GiBfree
plusinactive, separate Sidepanel runner: supported one-worker bounded run under
caffeinate-s-i, no timeout/sleep/flake. No remaining gap. Source freshness
unchanged at `2f08bababae8410472d4c8aa9abdf23c9358a48b`; named sibling
changes remain unlanded; latest trunk adds only preparation announcements.
