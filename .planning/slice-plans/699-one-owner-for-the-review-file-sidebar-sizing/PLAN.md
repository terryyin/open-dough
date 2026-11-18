# Give the review file sidebar's sizing one owner

**Source:** [Give the review file sidebar's sizing one owner](../../seeds/SEED-384-keep-review-changes-focused-on-the-diff.md#one-owner-for-the-review-file-sidebar-sizing)
**Source review:** [source-review.md](source-review.md)
**Identity:** SEED-384#one-owner-for-the-review-file-sidebar-sizing

## Provenance and findings

Retrospective correction of
Resize and remember the Review changes file sidebar (`88a7f2348:.planning/seeds/SEED-384-keep-review-changes-focused-on-the-diff.md`, section
`resize-and-remember-the-review-file-sidebar`)
(plan `88a7f2348:.planning/slice-plans/697-resize-and-remember-the-review-file-sidebar/PLAN.md`, claim
`c4c7b2472`, commits `28b3cac77`, `67bfd6bd8`, `a275db203`). Findings verified
at `a275db203`:

1. **Sizing split across two style sheets.** `dashboard/src/story-review.css`
   (247 lines) gives `.story-review-files` `flex: 0 1 16rem` and, stacked,
   `flex: none; box-sizing: border-box; max-height: 40%`;
   `dashboard/src/story-review-workarea.css` overrides with
   `.story-review-workarea > .story-review-files { flex: 0 0 var(--story-review-files-width, 16rem); box-sizing: border-box }`
   and repeats the stacked `flex: none`. The 16rem default is written four
   times: `defaultWidth` in `dashboard/src/reviewFileSidebarWidth.ts`, the two
   `var(..., 16rem)` fallbacks and the old base rule. Intent's locations carry
   `intent-location story-review-files` (`dashboard/src/IntentLocationGroup.tsx`)
   and every style sheet is bundled globally, so the base rule also reaches
   them.
2. **Duplicated vertical grip.** The `::after` grip geometry (top 50%, 4px
   wide, 2.5rem tall, `translateY(-50%)`) is written in both
   `story-review-workarea.css` and `.panel-divider::after` in
   `dashboard/src/side-panel.css`, differing only in `left`.
3. **Kept-width specs repeat shared proof.**
   `dashboard/frontend-tests/review/story-review-files-divider-kept.spec.ts`
   tests at lines 50 (unusable values `"wide"`, `"0"`, `"Infinity"`, each with
   a reload, then a kept choice) and 72 (refused storage, asserting its own
   setup's refusal, a key step and a reload) repeat
   `dashboard/frontend-tests/navigation/side-panel-width-kept.spec.ts:114` and
   `:147`, which prove the shared `usePreferredSize` / `keptPreference.ts`
   parsing and refusal. The review's own rule is only: no usable preference →
   16rem. Test 1's opening 16rem / nothing-kept assertions repeat the first
   step of `story-review-files-divider.spec.ts`.
4. **Implicit upper bound.**
   `dashboard/frontend-tests/review/story-review-files-divider-room.spec.ts`
   gets its chosen width with `files.drag(200)` and then reads
   `upperBound()`, relying on 256 + 200 px exceeding the 374 px bound at the
   fixture's 1440 px window.

## Goal and scope

Dashboard maintainers find the review file sidebar's sizing, its default and
the vertical grip each in one place, and the Files divider specs prove only
the review's own rules, with the review's behavior unchanged.

Excluded: the Panel divider's `{width, ...}` versus `DividerRange` shape (older
and optional); changing the 16rem default (a pending product question); the
horizontal Sessions sidebar grip, already written once in
`dashboard/src/sessions-sidebar.css` for both its dividers.

Preserved promises and constraints: all of the source story's Scope and Key
examples, observed as
`88a7f2348:.planning/slice-plans/697-resize-and-remember-the-review-file-sidebar/source-review.md`
P1–P21 records; Intent's locations column keeps its width; the 12rem and 18rem
minimums; the 16rem border-box default (an accepted decision of plan 697);
files stacked above the diff below a 34.75rem review body with at most two
fifths of the height; no Files divider while stacked or hidden.

## Decisive premises and preparation observations

Observed in this checkout at `a275db203` on 2026-11-18, load average about
24, through `npm run --silent test:dashboard:frontend` (frontend substitutes,
Desktop Chrome, the specs' 1440 px window helpers) with temporary scratch specs
that were deleted afterwards. Product files were not edited: the planned CSS
was applied through the CSSOM of the loaded, bundled style sheets.

| Premise / consuming operation | Observation and result | Remainder |
| --- | --- | --- |
| Moving the sidebar's flex basis and stacked rules out of `.story-review-files` into `.story-review-workarea > .story-review-files`, and the vertical grip geometry into `.resize-divider[aria-orientation="vertical"]::after` with only `left` left per divider, leaves Intent's locations column, the review's panes and both grips as they compute today (slice 1) | Scratch specs read computed styles and boxes: Intent (`selectTakenStoryInIntent`) at 1280 px and 800 px wide — `.intent-locations` and every `.intent-location` (width, height, flex, box-sizing, max-height, min sizes); an opened review side by side and stacked (`dragDivider(page, 400)` then `isStackedAboveTheDiff`) — the sidebar and diff boxes, flex, box-sizing, max-height, and both grips' `::after` top, left, width, height, transform, colour and radius. Run once as is, once with a CSSOM edit removing the base `flex`, deleting the stacked `.story-review-files` rule, adding `max-height: 40%` to the stacked work-area rule, trimming both grips to `left`, and inserting the shared vertical grip rule; all six edits reported applied. The two runs' JSON were identical in every view. | The TypeScript-owned default (next row) was not applied in the scratch. |
| Giving `--story-review-files-width` its 16rem value from `reviewFileSidebarWidth.ts` until the room is measured, instead of the CSS fallbacks, leaves the first paint as it is (slice 1) | Not run: a scratch edit of product TypeScript is outside this planning's permission. Before measurement, `var(--story-review-files-width, 16rem)` with the property unset and `var(--story-review-files-width)` with it set to `16rem` compute the same length, and after measurement both carry the measured px, so the difference cannot change what is shown; no spec observes the pre-measure frame. | None that changes the outcome; slice 1's Files divider specs observe the measured 16rem. |
| The surviving unusable and refused kept-width tests discriminate the review's 16rem default from the shared equal share (slice 2) | The base scratch run measured the review's room as 256 + 406.2 = 662.2 px, so an equal share would be 331 px and the upper bound 374 px; an assertion of 256 px fails if the review stops supplying its default. | None. |
| `side-panel-width-kept.spec.ts:114` and `:147` prove the shared parsing of unusable values and refused storage (slice 2) | Retained: plan 697's premise row (scratch swap of keys failed `side-panel-width-kept.spec.ts:114`) shows the spec runs the shared divider; both tests passed in plan 697's slice 3 proof on `67bfd6b`. `readPreferredSize` and `keptPreference.ts` have not changed since. Not scratch-tested on the parsing itself (a product edit). `:114` asserts half the room for each of `"0"` and `"Infinity"`, which unfiltered would give the panel's minimum or maximum instead, so its passing result already fails without the parsing; slice 2 keeps `"wide"` on the review. |

## Outside-in proof ownership

| Promise | Slice | Observable proof |
| --- | --- | --- |
| Review layout and Files divider unchanged (P1–P21) | 1 | `dashboard/frontend-tests/review` (the three Files divider specs and the rest of the review folder) green |
| Intent's locations column keeps its width | 1 | `dashboard/frontend-tests/intent` green |
| Panel divider unchanged | 1 | `dashboard/frontend-tests/navigation/side-panel-width` green |
| Review panes and touch layout unchanged | 1 | `npm run --silent test:e2e -- e2e/review/story-review-panes.spec.ts e2e/review/story-review-touch.spec.ts` green |
| No kept preference → 16rem, and opening keeps nothing (P13, P15) | 2 | `story-review-files-divider.spec.ts` first step only |
| An unusable kept value → 16rem (P14) | 2 | One review test with one unusable value |
| Refused storage → 16rem and a drag still resizes, without a page error | 2 | One lean review test |
| The room limits a chosen width at the upper bound (P10, P16, P17) | 2 | `story-review-files-divider-room.spec.ts` reaches the bound it read, by name |

## Ordered slices

### 1. The review file sidebar's sizing and the vertical grip each have one owner
Type: Structure
Status: done
Proof: the slice 1 rows above; `npm run typecheck:dashboard`; staged lint.

Structure: removes finding 1 and 2's split ownership, with the computed
layout unchanged.

- `story-review.css`: `.story-review-files` keeps the box it shares with
  Intent's locations (minimum sizes, overflow, border, radius, padding) and
  loses `flex: 0 1 16rem`; the stacked container rule loses its
  `.story-review-files` block.
- `story-review-workarea.css` alone sizes `.story-review-workarea >
  .story-review-files`: border-box in both layouts, the reviewer's width side
  by side, `flex: none` and `max-height: 40%` stacked; the divider's `left`
  and the sidebar's basis read `var(--story-review-files-width)` with no
  fallback.
- `reviewFileSidebarWidth.ts` is the one owner of the 16rem default: the work
  area carries `--story-review-files-width` from the first render, the
  measured px once known and the default in rem before; the style sheet's
  header comment points to it instead of repeating the value.
- `resize-divider.css` holds the vertical grip's geometry under
  `.resize-divider[aria-orientation="vertical"]::after`; `.panel-divider::after`
  and `.story-review-files-divider::after` keep only their `left`.

### 2. The Files divider specs prove only the review's own rules
Type: Structure
Status: done
Proof: the slice 2 rows above; `npm run --silent test:dashboard:frontend --
dashboard/frontend-tests/review/story-review-files-divider.spec.ts
dashboard/frontend-tests/review/story-review-files-divider-kept.spec.ts
dashboard/frontend-tests/review/story-review-files-divider-room.spec.ts`
green, the room spec three times in a row; `npm run typecheck:dashboard`;
staged lint.

Structure: removes finding 3 and 4's repeated and implicit proof, with every
P1–P21 observation kept.

- Kept test 1 starts at its choice: the default and nothing-kept opening
  belong to the divider spec's first step.
- The unusable-value test keeps one value, `"wide"`, → 16rem; the three-value
  loop and the trailing kept choice go (shared parsing:
  `side-panel-width-kept.spec.ts:114`; a kept choice: kept test 1).
- The refused-storage test keeps 16rem, a drag that resizes, and no page
  error; the assertion of its own setup's refusal, the key step and the reload
  go (shared refusal: `side-panel-width-kept.spec.ts:147`).
- The room spec reaches the upper bound through a named page-object operation
  in `dashboard/tests/filesDividerPage.ts` that reads the bound and drags to
  it within the window, then asserts the sidebar is at that bound.
- Spec header comments name the shared specs their removed cases rely on.
- While plan 697's source review (`88a7f2348:.planning/slice-plans/697-resize-and-remember-the-review-file-sidebar/source-review.md`)
  still exists, its P13 and P14 rows name the surviving observations.

## Verification and delivery

- Follow [the failing/flaky-test policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
  as written; a base failure is attribution, never an exemption.
- Before test edits, apply [dough-makeme](../../../.agents/skills/dough-makeme/SKILL.md)
  and [dough-page-objects](../../../.agents/skills/dough-page-objects/SKILL.md)
  selection. No sleeps, `test.slow()`, or timeout overrides.
- Local gate per slice: the slice's focused specs, `npm run
  typecheck:dashboard`, post-change refactoring and staged lint, run under
  maintained `caffeinate -s -i` on AC per
  [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos);
  on battery, `caffeinate -i` from a fully awake machine with the lid open and
  read the sleep log afterwards. No full local suite: the first premise row
  observed the computed layout unchanged in every view the folders read.
  Hosted CI runs the shards.

## Current decisions and plan review

- Two slices: the style ownership and the test cleanup have independent proof
  loops (journeys across review, Intent and Side panel versus the three Files
  divider specs), and each owns its retrospective correction directly.
- `.story-review-files` stays the shared box for Intent's locations; only the
  review's sizing leaves it.
- Slice-plan refinement was not needed: two slices, each one correction and
  one proof loop, with the shared-CSS consumers observed rather than assumed.
  This review identified no remaining slice-specific concern.
- Slice 1 settled reorganization: extract side-panel header/title/actions and
  `.side-panel-question` into `dashboard/src/side-panel-header.css` with
  `@import` from `side-panel.css` (was 258 lines). Delivered 143 / 111.
- Slice 1 accepted proof (evidence `slice1-20261118T164915`): frontend review,
  intent, side-panel-width, e2e panes/touch, and `typecheck:dashboard` all
  exitStatus 0 under `caffeinate -s -i`. Source-review P1–P4, P8, P9 observed.
  Post-change refactor: none — already clean.
- Slice 2 accepted proof (evidence `slice2-20261118T170500`): three Files
  divider specs green; room spec three times in a row; `typecheck:dashboard`
  green. Source-review P5–P7 observed. `dragToUpperBound()` owns explicit bound
  reach. Plan 697 source-review update skipped (file absent). Post-change
  refactor: none — already clean.
