# Return to recently selected stories

**Identity:** SEED-409#return-to-recently-selected-stories
**Source:** [Return to recently selected stories](../../seeds/SEED-409-return-to-recently-selected-stories.md#return-to-recently-selected-stories)
**Source review:** [source-review.md](./source-review.md)

## Goal and scope

Add a banner **Recent stories** button. It shows whether a story is selected,
brings the selected story back into view, and lists up to 10 recently
selected stories kept in this browser. Choosing one of them selects and
reveals it in the current perspective. The seed owns the goal, the
retention decision, the key examples and the scope limits: no
cross-device history, no URL change, no title reads from other projects, no
new handling for a story that has left the Board, and no shortcut.

## Approach and reuse

- **History owner.** History lives beside the Selected story in
  [`pageStorySelection.tsx`](../../../dashboard/src/pageStorySelection.tsx).
  Every selection goes through that hook's one state, so each new selection
  updates the history there, including the follow-up URL's initial
  selection. A new `recentStories.ts` module holds the most-recent-first,
  deduplicated list. It keeps that list through the existing
  [`keptPreference.ts`](../../../dashboard/src/keptPreference.ts), which ADR
  0008 allows as disposable browser storage. `PageFrame.tsx` (249 lines)
  does not need to change.
- **Development reveal.** Choosing a row, or clicking the button while a
  story's card is out of view, calls `select` and then the story-reference
  `follow`
  ([`storyReferenceJourney.tsx`](../../../dashboard/src/storyReferenceJourney.tsx)).
  `follow` shows the story's project in Columns, reaches into Recently
  done, focuses and cues the card through `revealStory`, keeps it in view,
  and reports an unavailable story in its notice. No second reveal path is
  added.
- **In view.** Use the card's or Intent view's start inside the region's
  `readingBounds`
  ([`boardScroll.ts`](../../../dashboard/src/boardScroll.ts)). This is the
  same rule `keepInView` already uses for "readable".
- **Intent reveal.** Use `useIntentScope`'s `chooseScope("story")`
  ([`intentStoryTabs.tsx`](../../../dashboard/src/intentStoryTabs.tsx)) and
  bring the element marked by `intentHomeMarks` to its start.
- **Vocabulary.** ADR 0008
  [Dashboard UI concepts](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#dashboard-ui-concepts)
  gains **Recent stories**, and its Selected story entry gains the new way
  of setting it. [Board interaction](../../../docs/dashboard-board-interaction.md)
  describes the banner order and selection. Each matching sentence lands in
  the slice that delivers the behavior. (`docs/dashboard-navigation.md` was
  removed by SEED-410; banner-order guidance lives with board interaction.)

No Accepted decision conflicts, and no North Star topic is needed.

## Oversized files expected to change

- `dashboard/src/ConfiguredDashboard.tsx`, 250 lines. The banner is rendered
  outside `StoryReferenceNavigation`, so `follow` cannot reach it today.
  Slice 3 splits the file along one seam: the scrolled page content
  (`StoryReferenceNavigation` and everything below the banner) moves into
  its own component, and the story-reference navigation provider moves up
  to wrap both the banner and that content. Callers: `App.tsx` only.
  Preserved proof: `navigation/story-reference-navigation.spec.ts`,
  `navigation/project-selection.spec.ts`, `navigation/dashboard-header.spec.ts`.

The other expected edits are under 250 lines: `DashboardBanner.tsx` (80),
`pageStorySelection.tsx` (174), `storyReferenceJourney.tsx` (231),
`intentStoryTabs.tsx`, and `test-support/dashboardPage.ts` (221). If an edit
takes `storyReferenceJourney.tsx` or `dashboardPage.ts` over 250 lines, move
the new part into its own module, such as a `recentStoriesPage.ts` page
object.

## Decisive premises

Observed on 2026-11-19 at `d6159c217`, Node 24.21.0, in this worktree.

| Operation | Observed result and remaining question |
| --- | --- |
| Frontend proof route: `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD=<tmp> npm run --silent test:dashboard:frontend -- 'frontend-tests/navigation/story-reference-navigation.spec.ts' 'frontend-tests/intent/intent-project-visit-selection.spec.ts'` | Four tests passed in about 9 s, according to the proof record. Paths are relative to `dashboard/`. A `dashboard/`-prefixed path selects nothing and still exits 0, so always read the proof record. |
| `follow` reveals an active story, focused and cued, without selecting it | Shown by `story-reference-navigation.spec.ts` in the run above. |
| `follow` from Development's Roster into another project, and for a missing story | A scratch edit exposed the journey's `follow` on `window`, and a scratch spec ran through the frontend proof command with the `projectSelectionProjects.ts` publications. From `/?project=open-dough&view=roster`, following `{doughnut, DN-1#story}` hid the Roster, set `project=doughnut`, and left Doughnut's taken card in view and focused. Following `{open-dough, GONE-1#nope}` showed "GONE-1#nope is unavailable in …". The run passed in 419 ms, and both scratch files were reverted. |
| Selection has one writer | `usePageStorySelection`'s `setSelected` is the only selection state. `toggle`, `select` and `clear` all go through it, and the initial value comes from the follow-up URL. Slice 1's spec covers both a card click and a Side panel opening, so a missed route fails that proof. |
| Banner can call `follow` | It cannot today: `DashboardBanner` is a sibling before `StoryReferenceNavigation` (lines 116–141). Slice 3 lifts the provider. |
| Intent returns to the story view during a selection | `useIntentScope` keeps the scope choice per selection, and `intent-project-visit-selection.spec.ts` passed in the run above. Slice 6 calls `chooseScope("story")` from the banner, inside `PageFrame`'s `IntentReadingProvider`. |
| Banner fit at narrow widths | `dashboard-header-compact.spec.ts` shows the compact project control whenever the project tabs do not fit. Slice 1 reruns it with the new button. |
| Browser storage in tests | Each Playwright test gets a fresh context, so stored history does not leak between tests. Slice 2 reloads inside one test. |

## Ordered slices

### 1. The banner shows the selection and lists recent stories

Type: Behavior
Status: done
Proof: new `frontend-tests/navigation/recent-stories.spec.ts`, plus
`navigation/dashboard-header.spec.ts` and
`navigation/dashboard-header-compact.spec.ts` still passing.
Accepted proof: `open-dough/evidence/slice1-frontend-proof-2.json` (headers)
and `refactor-frontend-proof.json` (recent-stories after refactor); selection
consumer `slice1-selection-consumer-proof.json`; lint/typecheck exit 0.

Behavior: covers seed examples 1, 4 and 5 within one page. With no
selection, the bookmark is an outline, and its accessible name says no
story is selected. Clicking it opens a popover that says there are no
recent stories. After A, then B, then A are selected, one by a card's
empty area and one by opening its terminal in the Side panel, the
bookmark is filled, and the popover lists A checked first, then B. A
appears once, and each row shows its project label. Clearing A shows the
outline bookmark, and the popover lists A unchecked. Escape or an outside
click closes the popover without changing the selection. The button sits
in its own group right after the Perspective group, and the banner stays
on one row at the compact widths. ADR 0008 adds **Recent stories**, and
board interaction records the banner button. Browser storage is not used
yet; slice 2 adds it. Control file is `recentStoriesControl.tsx` (macOS
case clash with `recentStories.ts`).

### 2. Recent stories survive a reload, capped at 10

Type: Behavior
Status: done
Proof: a test in `recent-stories.spec.ts` that selects eleven stories,
reloads, and lists ten.
Accepted proof: `open-dough/evidence/slice2-refactor-frontend-proof.json`
(recent-stories after persistence refactor); lint/typecheck exit 0.

Behavior: example 8. After eleven distinct stories are selected in turn
and the page reloads, no story is selected and the popover lists the last
10, newest first. When storage throws, the history lasts for the page:
cover this with one assertion that overrides `localStorage` in the page,
not with a separate fixture.

### 3. The banner can follow a story reference

Type: Structure
Status: planned
Proof: `navigation/story-reference-navigation.spec.ts`,
`navigation/project-selection.spec.ts` and
`navigation/dashboard-header.spec.ts` pass unchanged.

Change: reorganize `ConfiguredDashboard.tsx` as described above, so the
story-reference navigation provider wraps the banner as well as the
page content. The banner gets the navigation and adds no behavior. This
enables slice 4.

### 4. Choosing a recent story reveals it in Development

Type: Behavior
Status: planned
Proof: a test in `recent-stories.spec.ts` that uses two projects.

Behavior: example 6. Showing project P in Development's Roster view, with
history holding story C of project Q, choosing C's row closes the
popover, selects C, shows Q's Columns, and brings C's card into view,
focused and cued. Reopening the popover lists C checked first, then the
previous current story. Choosing a row whose story is no longer on Q's
Board shows the existing story-reference unavailable notice. ADR 0008's
Selected story entry and Board interaction add choosing a Recent stories
row as a way to set it.

### 5. The button returns to the selected story before listing

Type: Behavior
Status: planned
Proof: a test in `recent-stories.spec.ts` on a Board tall enough to
scroll.

Behavior: examples 2 and 3. A story is selected and its card is scrolled
out of view. Clicking the button brings the card into view and leaves the
popover closed. A second click opens the popover. When a tall card's start
is visible but its end is below the fold, the first click opens the
popover. When the selected story belongs to a project other than the one
shown, the first click follows it there.

### 6. Recent stories reveal the story view in Intent

Type: Behavior
Status: planned
Proof: new `frontend-tests/intent/intent-recent-stories.spec.ts`, using the
`intentModePage.ts` helpers `openProjectIntent`, `backToStory` and
`expectIntentModeChosen`.

Behavior: example 7 and choosing a row in Intent. With A selected and
Project Intent chosen, clicking the button shows A's story view from its
start and leaves the popover closed. With A's story view already in view,
the first click opens the popover. Choosing B's row keeps the Intent
perspective and shows B's story view from its start. Dashboard navigation
records that the button follows the current perspective.

## Proof and local gates

Follow the [shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Keep default test timeouts, never use `test.slow()`, and apply
[`dough-makeme`](../../../.agents/skills/dough-makeme/SKILL.md) and
[`dough-page-objects`](../../../.agents/skills/dough-page-objects/SKILL.md)
to new specs and page objects. Add the Recent stories controls to
Dashboard Test Support page objects rather than as raw locators in specs.

- **Frontend specs:** use the command in the premise table, with paths
  relative to `dashboard/`, and read the proof record.
- **Lint and typecheck:** `npm run lint` and `npm run typecheck:dashboard`.

No shared fixture or distributed consumer changes, so no broader local
suite is required. Hosted CI runs the rest. Run any long local gate on
awake macOS on AC with `caffeinate -s -i`. On battery, follow the
[open-lid procedure](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).

## Current decisions

- Retention, decided by Terry on 2026-11-19: this browser's disposable
  storage keeps the 10 most recently selected distinct stories, including
  the current one. The selection itself stays page state.
- In Development, revealing a story reuses the story-reference journey. A
  Recent stories reveal opens no card detail.

## Learnings

- On macOS case-insensitive FS, do not place `RecentStories.tsx` beside
  `recentStories.ts`; use `recentStoriesControl.tsx`.
- Banner-order docs belong in `docs/dashboard-board-interaction.md` after
  SEED-410 removed `docs/dashboard-navigation.md`.
- Optional later Structure: denser page-object journeys for
  `recent-stories.spec.ts` step bodies (same pattern as neighboring
  navigation specs).
- Persistence remember+keep is one rule (`rememberKeptRecentStory`); optional
  later Structure could share the in-page localStorage-refusal helper with
  other kept-preference specs.

## Plan review

Refinement was not needed: each slice has one outcome and one proof loop.
Slices 4–6 share one rule ("select, then reveal in the current
perspective"), and slice 5 reuses slice 4's reveal for the button. This
review found no remaining slice-specific concern.
