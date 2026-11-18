# Tell compared Usage tools apart and drop stale read errors

**Source:** [correction story](../../seeds/SEED-383-compare-codex-and-claude-code-token-usage.md#tell-compared-usage-tools-apart)
**Identity:** SEED-383#tell-compared-usage-tools-apart

## Provenance

Retrospective of SEED-383#compare-codex-and-claude-code-token-usage
(story and plan recoverable at before-cleanup commit `488cd602f9e029c3ce16c2d3aac2f82542223250`:
`.planning/seeds/SEED-383-compare-codex-and-claude-code-token-usage.md` and
`.planning/slice-plans/658-compare-codex-and-claude-code-token-usage/PLAN.md`),
reviewed commits `6cb3aac` (shared chart named traces), `c575c97`
(tool comparison) and `06ea5e3` (equal spacing), range
`650971b14..06ea5e342`. Story promises reviewed: "identifies each tool through
labeled series rather than color alone" (UI and architecture), "Keep tool
identity … understandable" (Scope), and the plan's slice 2 rule that an error
identifies the failed read and answers from different selections never render
as one comparison.

## Current findings

1. **Stale failure alert.** `dashboard/src/useUsageAnswers.ts` stores `problem`
   under `${selectionKey}#${refreshed}`; only the failure path writes it and a
   successful read never clears it. After selection K fails, switching to
   another selection and back to K (or 30 → 7 → 30 days) without Refresh shows
   the old alert at once, hides "Loading usage…", and keeps it beside the new
   successful chart (`SystemSettingsUsage.tsx` renders `problem` and the chart
   independently).
2. **Colour-only mark identity and a misleading legend.**
   `dashboard/src/history-chart.css` gives trace 1 only a different point fill
   and partial stroke (same circle/diamond shapes); only the median is dashed.
   `TokenIndexTrend.tsx`'s legend shows one Codex-coloured "Task" swatch and a
   solid median, never Claude Code's mark or dashed median; with Claude Code
   alone the Task swatch matches no drawn point, and Claude Code's partial
   diamonds lose the caution stroke the Partial swatch shows.
   `dashboard/USAGE-TOKEN-INDEX.md` claims tool identity "also reads without
   colour".
3. **Unproved selection isolation.** Two guards (`controller.signal.aborted`,
   `answers?.key === key`) implement "never render answers from different
   selections"; no Usage spec delays or reorders responses.
4. **Contract text drift.** `usageTokenIndex.ts` comment names
   `TokenIndexTrend.tsx` as home of the auxiliary-usage note (now
   `UsageToolSummary.tsx`); `USAGE-TOKEN-INDEX.md` says coincident large tasks
   keep date coordinates (not under equal spacing) and that a change clears a
   selection "no longer visible" (any selection/day change clears it).

## Preserved promises and constraints

- Each tool's values, units, tariff, median, coverage and unpriced notes, the
  union model/effort offering and reset, time and equal-spacing placement, and
  CI/scope charts' rendering stay unchanged.
- Partial marks keep the caution colour meaning; large-task and ↑ overflow
  marks keep their current meaning.
- A failed Refresh still keeps the last same-selection result and check time;
  a failed read for a new selection still shows only the tool-named error.

## Current decisions

- Claude Code's task mark is a triangle: filled for a measured task, hollow
  with the caution stroke for a partial one. Codex keeps its filled circle and
  hollow caution diamond. A triangle differs from circle and diamond at mark
  size where a square reads as a diamond turned; the shape belongs to the
  shared chart's second trace style, beside its dashed trend.
- The selected mark stays the larger diamond with its "Selected task" label for
  either tool; the open task detail names its tool.
- The legend names, for each shown tool, its task mark, its partial mark and
  its median line; a hidden tool has no entries. Each tool summary's heading
  swatch is that tool's task mark.

## Decisive premises

Observed in this worktree at `ed64b76d9` on 2026-11-18 with scratch edits, since
reverted, through `caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u
GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config
dashboard/frontend.playwright.config.ts --reporter=list <spec> --workers=1`.

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| The stale alert exists (finding 1) | Slice 1's first case | Scratch frontend case: Claude Code fails, hide it, show it with a successful answer | Fails as claimed: one alert beside four points |
| A held old-selection answer can be proved isolated (finding 3) | Slice 1's second case | Scratch case holding Claude Code's route, hiding the tool, releasing; rerun with the abort signal and aborted guard removed, then with the key guard removed too | Passes today; fails without the abort guards (0 points for 2) and without all guards (5 for 2) |
| Only Usage draws a second trace, and only one test helper relies on its mark element | Slice 2's shape change | `traces:` is supplied only by `TokenIndexTrend.tsx`; scratch triangle for slot 1 in `HistoryChartPlot.tsx`, all `system-settings-usage*` frontend cases | 22 pass; the three compare cases fail in `usageChart.showsDistinctTraces` (`circle.history-chart-point` no longer matches Claude Code); E2E Usage specs use no mark-element helper |

Sizes at that revision: `system-settings-usage-compare.spec.ts` 216 lines,
`TokenIndexTrend.tsx` 202, `system-settings-usage.css` 231, against the
250-line file-size check; none is over it today.

## Ordered slices

### 1. Show only current read failures and isolate selections

Type: Behavior
Status: planned

A failure alert belongs to the read that produced it: a later successful read
of the same selection (returning to it, or a day round trip) shows no alert,
and a pending read shows "Loading usage…". Answers for an old selection never
appear after the selection changes, even when they arrive late.

Proof: two frontend cases in a new focused Usage spec beside
`system-settings-usage-compare.spec.ts`, which has no room for them: fail
Claude Code, hide and show it with a now-successful answer, expect "Loading
usage…" while that read is held, then no alert and both tools' points; hold the
first selection's route, change selection, release it, expect only the new
selection's points. The compare spec's failed-Refresh and new-selection error
case stays green. Run all `system-settings-usage*` frontend cases.

Sizing: 10 active minutes, high confidence.

### 2. Tell each tool's marks apart by shape

Type: Behavior
Status: planned

With both tools shown, Claude Code's measured and partial task marks are
triangles and Codex's stay circle and diamond; a partial mark of either tool is
hollow with the caution stroke. `history-chart.css` and
`HistoryChartPlot.tsx` describe the second trace's shape.

Proof: `usageChart.showsDistinctTraces` asserts that Claude Code's measured
mark differs in shape from Codex's, its partial mark differs in shape from
Codex's partial mark and has the caution stroke, and marks stay readable in
light and dark; the compare spec's three cases, including phone and narrowest
window fit, pass. Run all `system-settings-usage*` frontend cases and the
shared-chart consumer specs (`intent-ci-history-chart-marks`,
`intent-project-ci-history-chart-marks`, `intent-scope-timing-history-*`,
`intent/intent-ci-wall-time-history*`), since the mark renderer is shared.

Interim: the legend still shows one "Task" swatch until slice 3, as today.

Sizing: 12 active minutes, medium confidence.

### 3. Match the legend to the shown tools and align the contract text

Type: Behavior
Status: planned

The legend lists each shown tool's task mark, partial mark and median line
(dashed for Claude Code) with the tool's name, and each tool summary's swatch
is its task mark; with Claude Code alone, no Codex entry shows. The legend is
its own component with its styles, keeping `TokenIndexTrend.tsx` and
`system-settings-usage.css` within the file-size check. Correct finding 4's
drift: the auxiliary-usage note's home in `usageTokenIndex.ts`, and in
`USAGE-TOKEN-INDEX.md` the coincident-large-task placement under equal
spacing, what clears a task selection, and how tool identity reads without
colour.

Proof: the compare spec asserts, through the Usage page objects, a named legend
entry per shown tool whose mark shape and median dash match the drawn ones,
and that hiding Codex leaves only Claude Code's entries; phone and narrowest
window fit stay green. Run all `system-settings-usage*` frontend cases.

Sizing: 12 active minutes, medium confidence.

## Proof ownership

| Promise | Slice |
| --- | --- |
| A read failure shows only while it describes the shown selection | 1 |
| Answers for an old selection never join a new one | 1 |
| Marks tell tools apart without colour | 2 |
| The legend matches each shown tool's drawn marks | 3 |
| Usage contract text matches delivered behaviour | 3 |

## Concern evidence

Slice-plan refinement was not needed: the one sizing concern, the former
slice 2 holding the mark shape and the legend as two outcomes in 15 minutes,
was settled here by splitting it. This review found no remaining
slice-specific concern.

## Local gates

Guarded one-worker Playwright forms (`caffeinate -s -i env -u
NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test
--config dashboard/frontend.playwright.config.ts … --workers=1`), typecheck
`npm run typecheck:dashboard`, eslint/prettier on changed sources. Apply the
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
as written; keep default timeouts; never `test.slow()`. On macOS start awake
and use `caffeinate -s -i` on AC power per
[machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
MakeMe and page objects apply to the frontend specs.

## Product advice not planned here

Narrow/touch cases in the compare and spacing specs overlap (four browser
cases), and the E2E tools journey re-asserts equal-slot geometry the frontend
spacing case proves; merging is a possible small test-cost saving, left to
the developer.
