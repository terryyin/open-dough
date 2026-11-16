# Tell compared Usage tools apart and drop stale read errors

**Source:** [correction story](../../seeds/SEED-383-compare-codex-and-claude-code-token-usage.md#tell-compared-usage-tools-apart)
**Identity:** SEED-383#tell-compared-usage-tools-apart

## Provenance

Retrospective of SEED-383#compare-codex-and-claude-code-token-usage
(plan 658), reviewed commits `6cb3aac` (shared chart named traces), `c575c97`
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

## Ordered slices

### 1. Show only current read failures and isolate selections

Type: Behavior
Status: planned

A failure alert belongs to the read that produced it: a later successful read
of the same selection (returning to it, or a day round trip) shows no alert,
and a pending read shows "Loading usage…". Answers for an old selection never
appear after the selection changes, even when they arrive late.

Proof: two frontend cases in `dashboard/frontend-tests/system-settings-usage-compare.spec.ts`
(or a new focused Usage spec if that file would exceed 250 lines): fail Claude
Code, hide and show it with a now-successful answer, expect no alert and the
chart; hold the first selection's route, change selection, release it, expect
only the new selection's points. Run all `system-settings-usage*` frontend
cases.

Sizing: 10 active minutes, high confidence.

### 2. Tell tools apart without colour and match the legend

Type: Behavior
Status: planned

Claude Code's task marks use a distinct shape from Codex's (for example a
square or triangle point, keeping the hollow-diamond meaning for partial via
the caution stroke), and the legend lists each shown tool's task mark and
median line (dashed for Claude Code) with the tool name. Correct the
`USAGE-TOKEN-INDEX.md` and `usageTokenIndex.ts` text drift in finding 4.

Proof: compare spec asserts each shown tool has a named legend entry matching
its drawn mark and median style, Claude Code marks differ in shape from Codex
marks, and Claude Code partial marks keep the caution stroke; light/dark
contrast and narrow fit cases stay green. Run all `system-settings-usage*`
frontend cases and the shared-chart consumer specs named in plan 658.

Sizing: 15 active minutes, medium confidence.

## Local gates

Guarded one-worker Playwright forms from plan 658 (`caffeinate -s -i env -u
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
