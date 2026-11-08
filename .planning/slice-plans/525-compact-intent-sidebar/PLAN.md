# Make the Intent sidebar easier to scan and hide

**Identity:** SEED-271#compact-intent-sidebar

**Source:** [Make the Intent sidebar easier to scan and hide](../../seeds/SEED-271-compact-intent-sidebar.md#compact-intent-sidebar)
**Source review:** [source-review.md](source-review.md)

## Goal and boundaries

A developer reviewing a story in Intent can quickly spot the top-level
entries, give the reading pane more room, and see at a glance how many changed
files fall outside Intent locations. The seed's Scope holds the promises,
scope limits and deferred promises; this plan adds none.

Exclusions, as the seed records them: no resizable sidebar, keyboard shortcut,
remembering the choice across reloads, or sticky headers; while the sidebar
is hidden the mode bar carries only the mode controls and **Show files**, the
persistent story header belonging to SEED-275#story-intent-tabs; Development, Review changes'
browser behavior and the explanation shown in place of the tree are unchanged.

## Current decisions

- **Hide, do not unmount.** The locations column stays mounted and is hidden
  (`hidden`, `display: none`), so the tree's scroll, the open folders and the
  summary's disclosure return without reading again. The reading pane takes
  the grid's whole width (and, narrow, its whole height) while the column is
  hidden.
- **One kept choice.** Whether the sidebar is shown is one `useKeptReading`
  value in Intent's reading place (`dashboard/src/pageIntentReading.tsx`),
  read by the mode bar's toggle and the browser alike. It is kept across
  Development and back, the reading modes and new revisions, and a project
  change starts it shown, as the reading place already does for the selection.
  It is not on the URL or in storage (ADR 0008 presentation state).
- **One toggle control.** Review changes' `FileBrowserToggle`
  (`dashboard/src/StoryReviewBrowserToggle.tsx`) moves unchanged to a shared
  module, `dashboard/src/FileBrowserToggle.tsx`, that Review changes and
  Intent both import, so **Hide files** / **Show files** have one owner. The
  toggle appears in the mode bar only while the **Intent** mode shows the
  location browser.
- **Outside count presentation only.** The count `scope.outside` keeps its
  computation; `StoryOutsideLocations` becomes one button with an icon from
  the dashboard's existing icon set and the count, placed on the summary's
  title line, with the explanation as its accessible name and hover text.
- **Header color.** A new location-header token in light and dark themes,
  distinct from `--line`-based folder change background, the selected fill
  and the CI tints; the bold label weight matches the toggle's existing 600.
- **Test data.** New or extended specs arrange domain data through the shared
  MakeMe API and reuse `dashboard/tests/support/intentStoryPage.ts` and
  `dashboard/tests/intentLocationHeaderLook.ts` rather than copying setup.
  [Test data architecture](../../../tests/README.md#test-data-architecture)

## Outside-in proof

| Promise | Owner | Required observation |
| --- | --- | --- |
| Seed example 1: full-width colored band with a bold name | Slice 1 | `locationHeaderLook` measures the header against the locations column's width (not the group's padded inner width) and reports its label weight; `intent-gherkin-groups.spec.ts` expects full width, weight ≥ 600 and a background different from a changed folder row's. The new assertion fails before the CSS change. |
| Seed example 2: selected and change cues kept | Slice 1 | `intent-story-changes.spec.ts` header look (selected background across the full column, change mark) and `intent-story-ci-cues.spec.ts` (count-border and duration tint, accent border when selected) pass with the new geometry. |
| Header color in light and dark | Slice 1 | One Playwright screenshot of the Intent tree with a story's changes in light and in `prefers-color-scheme: dark`, inspected by the executing agent, attached to the slice's evidence. |
| Seed example 6: icon and count, accessible name, opens Review changes, absent at zero | Slice 2 | `intent-story-changes-gaps.spec.ts` and `intent-story-changes.spec.ts`: a button named "2 changed files outside Intent locations — open Review changes" with visible text `2` on the title line opens Review changes on All changes; absent when no file is outside. The old sentence is gone. |
| Seed examples 3 and 4: hide, bar holds only mode controls and Show files, show restores | Slice 3 | New `dashboard/tests/intent/intent-sidebar-toggle.spec.ts`: with a story, a file open two folders deep, **Selected story only** on and the summary expanded, **Hide files** hides the locations column, the reading pane's width grows to the content width, the bar holds only **Intent**, **Optimization Candidates** and **Show files**; **Show files** returns the same selected row, open folders, checked choice, expanded summary and tree scroll offset, and the file's **Purpose** stays. With no story, the bar holds the same and CI status takes the width. |
| Seed example 5: kept across modes and perspectives, reset by project | Slice 3 | Same spec: hidden after **Optimization Candidates** and back and after Development and back; another project's Intent shows the sidebar. |
| Narrow screen | Slice 3 | Same spec at a viewport under 52rem: hidden, the reading pane fills the height under the bar. |
| Toggle keyboard and state | Slice 3 | Same spec: the toggle is reached by Tab after the mode tabs, operates with Enter and Space, and has `aria-expanded` matching the column. |
| Review changes' Hide files unchanged | Slice 3 | `tests/review/` specs that use **Hide files** / **Show files** pass after the move. |
| Guidance | Slices 1–3 | `docs/dashboard-development-intent.md` describes the header, outside count, and sidebar toggle as delivered. |

## Decisive premises

Observed on 2026-11-08 at `4174d1c25` on macOS.

| Consuming operation | Observation | Result |
| --- | --- | --- |
| Slice 1 changes header geometry and weight | Headless Playwright Chromium screenshot of the production dashboard (`http://127.0.0.1:4173/?project=open-dough&perspective=intent`, 1440×900) | Each location header is a grey rounded block inset about 12 px inside its group's padding; labels are regular weight. `locationHeaderLook.fullWidth` compares the header with the group's padded inner width, so it must change to the column's width. |
| Slice 3 keeps tree scroll, folders and disclosure by hiding, not unmounting | A scratch script (since removed) importing the integration checkout's `@playwright/test`, Chromium 153.0.8010.12: a 100 px scrolling element set to `scrollTop = 300`, then `hidden = true`, then `hidden = false`, each after a frame | While hidden `scrollTop` read 0; after showing it read 300. The same engine runs the dashboard suite. Unmounting would lose it, so the column stays mounted. |
| Slice 3 keeps the choice with the reading place | `dashboard/src/pageIntentReading.tsx`: `useKeptReading` stores in the per-project place that `IntentReadingProvider` replaces on project change; `IntentModeTabs` renders inside `IntentReadingPlace`. `intent-reading-place.spec.ts` (Development and back keeps the reading; another project starts afresh) passed in CI run 42457898422 at `0df273615`; no `dashboard/` file changed between `0df273615` and `4174d1c25`. | A `useKeptReading` value gives exactly the seed's keep and reset behavior. |
| Slice 3 reuses the Review changes toggle | `dashboard/src/StoryReviewBrowserToggle.tsx` is a stateless button taking `{ id, shown }` and `onShowBrowser`, imported by `StoryReviewContext.tsx`, `StoryReviewContextLine.tsx` and `StoryReviewLandedContext.tsx` | It needs no change to serve Intent; the move updates those three imports. |
| Slice 2 replaces the outside sentence | `rg "intent-story-outside\|outside Intent locations" dashboard` | Consumers: `IntentStorySummary.tsx`, `intent-story-summary.css`, `intent-story-changes.spec.ts`, `intent-story-changes-gaps.spec.ts`. |

## Local gates

Follow the [test automation rules](../../../AGENTS.md#test-automation) and the
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests).
Never sleep, never use `test.slow()`, and keep the default timeouts. For full
runs on awake macOS with AC power, use `caffeinate -s -i` and put Homebrew Bash
first on `PATH`. On battery, follow the lid-open procedure and check the sleep
log. [Machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos)

A fresh worktree needs the native setup before its first spec run. Run
Playwright with `GIT_ALTERNATE_OBJECT_DIRECTORIES`, `NO_COLOR` and
`FORCE_COLOR` unset. Each slice runs `npm run lint` and
`npm run typecheck:dashboard`, and its specs with
`npm run test:dashboard -- <paths> --reporter=list`. The changes reach shared
Intent layout and the mode bar, so slices 1 and 3 run the whole
`tests/intent` directory once their own specs pass, and slice 3 also runs
`tests/review`. Hosted CI runs the whole suite after publication.

## Slices

### 1. Location headers read as full-width section headers

Type: Behavior
Status: done
Proof: `locationHeaderLook` measures the column width and label weight; the
`intent-gherkin-groups.spec.ts` header expectation fails first, then passes
with `intent-story-changes.spec.ts` and `intent-story-ci-cues.spec.ts`; then
the whole `tests/intent` directory; light and dark screenshots inspected.

Behavior: Intent with five locations, one holding a story's changes and one
selected → the developer reads the sidebar → each location header spans the
column edge to edge in its own color with the toggle and bold label padded
inside; the selected header carries the selected fill (or accent border with a
CI tint) across the full width, and the changed one its leading-edge mark.
Guidance updated.

Accepted (2026-11-08): `locationHeaderLook` now measures against
`.intent-locations` and reports `labelWeight`; the new assertions failed before
the CSS change (`fullWidth` false). The location rules and the
`--location-header` token moved to `dashboard/src/intent-location-group.css`
(imported by `IntentLocationGroup.tsx`) to keep `intent-perspective.css` under
the 250-line limit. Whole `tests/intent` (239) passed after the refactor.
Learning: the dashboard has no dark base theme; only the CI cue colours vary
under `prefers-color-scheme: dark`, so the header token's dark value sits on a
light surface and stays distinct from the dark cues.

### 2. The outside-locations count is an icon and a number

Type: Behavior
Status: done
Proof: `intent-story-changes-gaps.spec.ts` and `intent-story-changes.spec.ts`
expect the named button with text `2` on the title line, its opening of
Review changes on All changes, and its absence at zero; the old sentence's
assertions are replaced.

Behavior: A story whose comparison changed two files no location selects →
the developer looks at the summary → its title line ends with an icon and `2`,
named "2 changed files outside Intent locations — open Review changes";
activating it opens Review changes on Intent's comparison. Guidance updated.

Accepted (2026-11-08): `StoryOutsideLocations` is a button (Lucide
`GitCompare` icon and the count) in a new `.intent-story-title-line` beside
the disclosure, so it never toggles the disclosure; observed through
`expectOutsideCount` in `dashboard/tests/support/intentStoryPage.ts`. Whole
`tests/intent` (239) and the backend overlay spec passed. The outside sentence
also had consumers in the changes-only, changes-moves and completed specs.

### 3. Hide files gives the reading pane the sidebar's room

Type: Behavior
Status: done
Proof: new `intent-sidebar-toggle.spec.ts` covering the slice's examples and
the narrow and keyboard rows above; then the whole `tests/intent` and
`tests/review` directories.

Behavior: A story selected, a file open two folders deep → **Hide files** →
the locations column hides, the reading pane spans the width, and the bar
holds only the mode controls and **Show files**; switching modes, perspectives or revisions keeps it hidden, and a project
change shows it; **Show files** → the summary, selection, open folders,
**Selected story only**, disclosure and tree scroll return. `FileBrowserToggle`
moves to its shared module first, with Review changes importing it. Guidance
updated.

Amended during execution (2026-11-08, Terry; trunk 9367c5b44): the story
title in the mode bar is dropped and the persistent story header moves to
SEED-275#story-intent-tabs. The source review was replaced for the amended
story. Accepted: the choice is `useKeptReading("filesShown")` in
`IntentBody` (`IntentPerspective.tsx`), which now renders `IntentModeTabs`;
`.intent-locations[hidden]` needs an explicit `display: none` because the
column's own `display: flex` overrides `hidden`; the summary object moved to
`useStorySummary` in `IntentStorySummary.tsx` for the line limit. Whole
`tests/intent` and `tests/review` (409) passed.

## Plan review

Slice-plan refinement was not needed: the three slices are independent
outcomes with their own proof loops, each one cohesive change. This review
found no remaining slice-specific concern.

## Execution complete

Product advice: no change. The persistent story header the amendment removed
is already queued as SEED-275#story-intent-tabs. Learning for later dashboard
stories: the dashboard has no dark base theme; only the CI cue colours vary
under `prefers-color-scheme: dark`, so a "light and dark themes" promise on a
dashboard colour is observable only against those cues until a dark theme is
chosen as its own product decision.
