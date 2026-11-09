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
