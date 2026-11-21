# Source review

Launched on 2026-11-21 as a fresh general-purpose reviewer with no conversation
inheritance. Input: the story section of
[SEED-413#speed-intent-ci-comparison-proof](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-ci-comparison-proof)
(Goal, Scope, Key examples, Evaluation) and the referenced
"Acceptance shared by the eight stories" text, with no plan, product or proof.

Unnumbered context returned: scope ownership of `intent-ci-comparison-*.spec.ts`
and the five registration modules; Summary evidence rules and timing history
belong to the next story; test-method guidance (smallest production owner,
frontend guidance, North Star, ADR 0010, MakeMe, colocated page objects);
case-reduction techniques; campaign one-minute target belongs to the final
story; separate owners of recovery/late-styling and renamed-diff work; SEED-341
coordination; backend and E2E groups keep their own runner and coverage.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | The comparison names the right builds, timing, test results and limits (Goal) | slice 2 | observed: intent-ci-comparison-endpoints, -adapter-proof, -overall-metrics (slice 1) and -landed-fallback, -timing-gaps (slice 2) specs |
| 2 | Landed proof unavailable → Branch fallback with the real reason and measured figures | slice 2 | observed: intent-ci-comparison-landed-fallback.spec.ts "unavailable Landed proof retains the Branch counts, time and exact adapter reason" and "running Landed retains Branch fallback…" |
| 3 | Check again recovers Landed | slice 3 | observed: intent-ci-comparison-check-again.spec.ts "Check again reads all endpoint proofs afresh and replaces Branch fallback with recovered Landed proof" (held reply disables Check again; release shows Landed) |
| 4 | A previous selection's held result cannot replace the current comparison | slice 3 | observed: intent-ci-comparison-selection.spec.ts: old comparison and attempt-proof reads aborted and released late leave the current story ddddddd and 10 → 4 test cases (−6) shown |
| 5 | Cross-scope observations reuse the same preference, fallback or held evidence | slice 4 | observed: intent-ci-comparison-scope-running.spec.ts "Landed running preserves one Branch fallback through entry, folders and file Proof" (same fallback and reason at story, entry, folders and file Proof; 1 comparison and 2 proof reads) and drilldown-relative read counts |
| 6a | Legacy, case and file units with partially missing evidence: comparison and drill-down preserve the available figures | slice 5 | observed: intent-ci-comparison-legacy.spec.ts (comparison row, Summary figures and child rows, file Proof row) and intent-ci-comparison-count-gaps.spec.ts case 1 (complete file figure 1 → 2 test files (+1) beside a partial case gap) |
| 6b | Units stay separate | slice 6 | observed: intent-ci-comparison-units.spec.ts: separate test-case and test-file rows and Counts at the entry; one mounted scope keeps separate unit figures and rows in tree aria-labels, location and folder Summary and file Proof; legacy units in intent-ci-comparison-legacy.spec.ts |
| 6c | Disclose why a difference cannot be claimed | slice 5 | observed: intent-ci-comparison-count-gaps.spec.ts and -legacy/-entries: "part 2 of 2 missing/ambiguous; count difference unavailable" in comparison, Summary, tree and Proof; "(legacy unit unknown)", no-overall-count cue reason, "Partial: part 2 of 2 has no duration" |
| 7 | Sorting uses the signed changes with gaps last | slice 7 | observed: intent-ci-comparison-sort.spec.ts "native Enter and Space on Branch and Landed sort signed changes rather than duration or percentage, with gaps last both ways": ascending [down, small, big, untimed, added], descending [big, small, down, untimed, added]; direct rules in Distribution/tests/support/intent-ci-comparison-sort.test.mjs and -signed-sort.test.mjs |
| 8 | Native headers work by keyboard | slice 7 | observed: intent-ci-comparison-sort.spec.ts: the two keyboard cases focus the real header buttons and press Enter and Space via userEvent.keyboard, checking aria-sort on every column in both directions |
| 9 | Show % keeps the geometry and order | slice 8 | observed: intent-ci-comparison-relative.spec.ts "Show % starts off and by keyboard reveals every comparable percentage on the fifty percent scale without moving a mark or reordering sorted rows": row order and Chromium-measured mark geometry identical before and after Show % |
| 10 | Show % follows the reader between relevant scopes | slice 4 | observed: intent-ci-comparison-drilldown-relative.spec.ts: Show % toggled in Summary, file Proof or story panel carries across all three, each with its own scale |
| 11 | All 69 legacy cases have a traceable disposition | slice 8 | observed: slice-8 report 69-title disposition table: all 69 legacy titles mapped to a new Vitest owner or named equivalent (intent-summary-story-comparison-file.spec.ts for the page-level return) |
| 12 | The unit proof runs on plain Vitest | slice 8 | observed: all 21 intent-ci-comparison-*.spec.ts import vitest; --list shows the family on mounted-chromium only, none on Playwright |
| 13 | Direct logic proof for presentation rules that need no DOM | slice 8 | observed: Distribution/tests/support/intent-ci-relative-change, -comparison-sort, -signed-sort, -overall-counts, -overall-count-gaps and dashboard-ci-comparison-entries, -entry-gaps, -parse .test.mjs (29 passed) plus the direct selectionWords check in intent-ci-comparison-endpoints.spec.ts |
| 14 | Preserve representative authenticated and real composition boundaries in E2E | slice 8 | observed: e2e/intent/intent-ci-comparison, -adapter, -taken and -trunk-finality specs unchanged since 81b22bafd; 4 of 4 passed in 47.05 s |
| 15 | Preserve exact wording, accessibility, input distinctions, races and error/retry boundaries; distinct risks stay separately named | slice 8 | observed: per-slice legacy-to-owner mappings in slice reports 1–8; intent-ci-comparison-relative.spec.ts "Show % stays on after a Project Intent visit" and "a Landed time without runner waits that is unavailable shows neither mark nor percentage"; distinct titles kept for lifecycle, StrictMode and keyboard risks |
| 16 | Fewer maintained cases, reporting why repeated cases were consolidated or kept | slice 8 | observed: family went from 69 Playwright cases to 48 Vitest cases, with per-slice consolidation reasons recorded in each slice Accepted note |
| 17 | Before/after two-worker comparison with elapsed time incl. preparation, counts by engine and destination, slow cases and E2E cost | slice 8 | observed: paired two-worker runs incl. preparation under load 12–24: before 68.1 s and 50.9 s (69 Playwright cases), after 15.1 s and 16.4 s (46 Vitest cases); low-load baseline 19.64 s; E2E 4 tests 47.05 s; slowest remaining cases named |
| 18 | Retire actSettled, React act wrapping and IS_REACT_ACT_ENVIRONMENT; remove spent support | slice 8 | observed: git grep for act(, actSettled and IS_REACT_ACT_ENVIRONMENT over the family and its page objects finds nothing; strict-mode mount support and relativelyTimedStory.ts removed |
| 19 | Each completed slice's faster proof is usable before the next slice lands | slice 8 | observed: git log 81b22bafd..HEAD on the story branch: one published commit per slice (df33c00d1, b3f685d2f, e93a7cd12, 28bf9e926, 1cee572e5, 00348525b, 2dfade067) each with selectable Vitest specs |
