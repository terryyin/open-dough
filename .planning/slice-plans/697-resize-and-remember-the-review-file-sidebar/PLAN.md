# Resize and remember the Review changes file sidebar

**Source:** [Resize and remember the Review changes file sidebar](../../seeds/SEED-384-keep-review-changes-focused-on-the-diff.md#resize-and-remember-the-review-file-sidebar)
**Source review:** [source-review.md](source-review.md)
**Identity:** SEED-384#resize-and-remember-the-review-file-sidebar

## Goal and scope

A developer reviewing changes drags or keys a **Files divider** between the
file sidebar and the diff to give paths the room they need, and finds that
width again in every later review in the same browser. The seed owns Goal,
Scope, Key examples and scope limits; the
[mockup](../../mockups/review-changes.html) is the visual reference for the
divider's grip and place.

Excluded: a height divider for the stacked layout; Intent's locations column;
sharing the preference across browsers; fitting the sidebar to its content;
wrapping or shortening file names.

## Existing solution and direction

PFE at `b85f9edd33f34522e0669d9dd429ce41558b98be`:

- [`ResizeDivider.tsx`](../../../dashboard/src/ResizeDivider.tsx) (127 lines)
  is the one focusable separator: pointer drag, arrow keys, `aria-valuenow`,
  `-valuemin`, `-valuemax`, `-valuetext`, and a disabled form where the room
  offers no range. Its two axes both grow the area with Left or Up, because
  both callers' areas lie on the divider's trailing side
  ([`PanelDivider.tsx`](../../../dashboard/src/PanelDivider.tsx),
  `SessionsSidebarOptionalSections.tsx`).
- [`sharedRoom.ts`](../../../dashboard/src/sharedRoom.ts) (222 lines) gives
  `shareOfRoom` (size, minimum, maximum, step from a room, a preference and
  two floors), `sizeWithin`, and `usePreferredSize`, which keeps one size in
  disposable browser storage through `keptPreference.ts`. With no preference
  it returns an equal share of the room.
- [`sidePanelWidth.ts`](../../../dashboard/src/sidePanelWidth.ts) is the
  pattern to follow: measure the room before paint, derive the shown size
  from room and preference, clamp a choice to the current bounds, never write
  a room-imposed size back.
- [`StoryReviewSnapshotView.tsx`](../../../dashboard/src/StoryReviewSnapshotView.tsx)
  (213 lines) renders `.story-review-workarea` with the
  `.story-review-files` section (hidden while `browser.shown` is false) and
  the diff. [`story-review.css`](../../../dashboard/src/story-review.css)
  (247 lines) gives the sidebar `flex: 0 1 16rem`, the diff `flex: 1 1 18rem`,
  a `0.75rem` gap, and stacks them where the review body is narrower than
  `34.75rem`.

Direction: reuse all of it. A small module beside `sidePanelWidth.ts` owns
the file sidebar's width: the work area's width less the gap is the room, the
sidebar's floor is 12rem and the diff's 18rem, the key step is 1rem (the
mockup's), and the preference is kept under its own key. Where nothing is
kept it passes 16rem as the preference and keeps nothing, so the shared
equal-share default never applies. The style sheet's container query stays
the one owner of side-by-side versus stacked; the divider is not displayed
where the panes stack or the sidebar is hidden, and the stacked rules override
the chosen width. The divider's rules and the sidebar's width go in a new
stylesheet so `story-review.css` stays within the 250-line check, and the
width is set on the review's pane, not on the `.story-review-files` class,
which Intent's locations (`IntentLocationGroup.tsx`) also carry. The divider
is named **Files divider**; ADR 0008 reserves **Panel divider** for the Side
panel's. No North Star topic and no server change.

[Keep Review changes focused on the diff](../695-keep-review-changes-focused-on-the-diff/PLAN.md)
is Taken and moves the **Hide files** / **Show files** control into a toolbar
with the same names and `browser.shown` state. This plan reads only that
state and those names, so it holds whichever lands first; rebase on trunk at
Take and reconcile `story-review.css` and `AGENT-LAUNCH-REVIEW.md` edits.

Maintained docs: [`STORY-REVIEW-FILES.md`](../../../dashboard/STORY-REVIEW-FILES.md)
(67 lines) takes the divider, its bounds and the kept preference.
[`AGENT-LAUNCH-REVIEW.md`](../../../dashboard/AGENT-LAUNCH-REVIEW.md) (245
lines) changes in place only where it says resizing needs the Panel divider
or describes the panes' widths, staying within 250 lines.

## Decisive premises and preparation observations

Observed in this workspace at `b85f9edd33f34522e0669d9dd429ce41558b98be` on
2026-11-18, load average 20 to 30.

| Premise / consuming operation | Observation and result | Remainder |
| --- | --- | --- |
| No existing review journey relies on the work area holding only the two panes, or on Tab passing from the file sidebar straight to the diff (slices 2 and 3) | Scratch edit placing a focusable `role="separator"` named “Files divider”, 0.8rem wide, as a flex child between the two sections while the sidebar is shown; `npm run --silent test:e2e -- e2e/review` (39 specs, with panes, tree and touch): exit 0. `npm run --silent test:dashboard:frontend -- dashboard/frontend-tests/review dashboard/frontend-tests/navigation/side-panel-width dashboard/frontend-tests/sessions/recently-done-ad-hoc-review.spec.ts dashboard/frontend-tests/sessions/final-report-touch-divider.spec.ts`: exit 0. Scratch reverted. | `e2e/intent` and the other frontend folders were not run with the edit; the scratch touched only the review's own view, which they reach through the same component. |
| The side-panel width specs prove the shared divider's key direction, so they guard slice 1 | Scratch swap of the vertical axis's grow and shrink keys in `ResizeDivider.tsx`; `npm run --silent test:dashboard:frontend -- dashboard/frontend-tests/navigation/side-panel-width`: exit 1, failing `side-panel-width.spec.ts:40`, `side-panel-width-kept.spec.ts:114` and `side-panel-width-review.spec.ts:30`. Scratch reverted. | The Sessions sidebar's horizontal dividers (`dashboard/frontend-tests/sessions/recently-done-sessions-sidebar-room.spec.ts`, `e2e/sessions/cursor-sessions-sidebar-resize.spec.ts`) were not scratch-tested; slice 1 leaves the horizontal axis's code path as it is and runs them. |
| A frontend-substitute review opens with files beside the diff in a 1440px window and can be reloaded and reopened (slices 2 and 3) | Read `dashboard/tests/support/frontendSidePanelWidth.ts` (`takenStoryWithReview` with a `snapshot` override, `openReview`, `reloadAndOpenReview`) and its use in `side-panel-width-kept.spec.ts`, which passed in the run above. At half of 1440px the review body is about 43rem wide, above the 34.75rem stacking width. | The panes' side-by-side arrangement in that fixture was derived from the style sheet, not measured; slice 2's first assertion measures it. |
| The sidebar is exactly 16rem wide wherever the panes sit side by side today | Read `story-review.css`: `flex: 0 1 16rem` beside `flex: 1 1 18rem` with a 0.75rem gap, stacked below 34.75rem, their sum, so the sidebar never shrinks while side by side. | None. |

## Outside-in proof ownership

New proof is frontend specs over the service substitutes under
`dashboard/frontend-tests/review/`, with one page object for the Files
divider; the story changes no server behavior.

| Promise | Slice | Observable proof |
| --- | --- | --- |
| The shared divider resizes an area on its leading side, with today's dividers unchanged | 1 | The side-panel width specs and the Sessions sidebar divider specs named in the premise rows stay green; slice 2's keyboard proof exercises the new side. |
| A **Files divider** sits between sidebar and diff while both are side by side, focusable, saying the sidebar's width and bounds | 2 | Open a review at 1440px → a separator named “Files divider” with `aria-valuenow` equal to the sidebar's measured width (16rem), `aria-valuemin` 12rem and `aria-valuemax` the work area less the gap and 18rem. |
| Dragging changes both widths; Right widens one step, Left narrows | 2 | Drag right by N px → sidebar N px wider, diff N px narrower, divider says the new width. Focus → Right → one step (1rem) wider; Left → back. |
| Neither pane goes below its minimum | 2 | Drag far right → diff 18rem, sidebar at `aria-valuemax`; drag far left → sidebar 12rem. |
| One preferred width serves every review and survives a reload; default until chosen | 2 | After a drag, close, open another story's review → same width; reload and open → same width; a fresh browser context → 16rem. |
| No divider while the sidebar is hidden; showing restores the preferred width | 2 | **Hide files** → no “Files divider”, diff spans the work area → **Show files** → sidebar and divider at the chosen width. |
| A limit the room sets never changes the preference | 3 | Choose a wide width, narrow the Side panel with the Panel divider → sidebar narrower, diff at 18rem, kept value unchanged → widen → chosen width returns. Maximize → `aria-valuemax` grows and a wider drag is accepted. |
| Stacked layout offers no divider and keeps today's arrangement | 3 | Narrow the panel until files sit above the diff → no “Files divider”, sidebar spans the width with at most two fifths of the height → widen → divider returns at the preferred width. |
| No kept, an unusable, or a refused preference starts at the default and still resizes | 3 | Kept as `"wide"`, `"0"`, `"Infinity"` → 16rem; storage refused → 16rem, drag resizes for the page's lifetime, no page error. |
| Intent's locations column keeps its width | 2 | `dashboard/frontend-tests/intent` specs that read the locations column stay green; the width rule names the review's pane. |
| Maintained docs describe the divider and the preference | 3 | `STORY-REVIEW-FILES.md` names the Files divider, its bounds, default and kept preference; `AGENT-LAUNCH-REVIEW.md` no longer says the panes' widths need the Panel divider alone. |

## Ordered slices

### 1. The shared divider resizes an area on its leading side
Type: Structure
Status: done
Proof: first row above; `npm run --silent test:dashboard:frontend --
dashboard/frontend-tests/navigation/side-panel-width
dashboard/frontend-tests/sessions/recently-done-sessions-sidebar-room.spec.ts
dashboard/frontend-tests/sessions/final-report-touch-divider.spec.ts` and
`npm run --silent test:e2e -- e2e/sessions/cursor-sessions-sidebar-resize.spec.ts`
green, typecheck and staged lint.

Structure: `ResizeDivider` learns which side of it the area lies on. For an
area on the leading side, a drag toward the trailing side and Right grow it;
the existing callers keep the trailing side and their behavior. Its header
comment states the rule once for both sides. Enables slice 2, whose sidebar
lies left of its divider.

Accepted proof (2026-11-18, on c4c7b2472 with the change uncommitted, load
about 20 to 25): `ResizeDivider` takes `side` (`"trailing"` by default,
`"leading"`); the named frontend specs, the Cursor Sessions sidebar resize
e2e spec and the typecheck passed. The leading side has no caller yet; slice
2's keyboard and drag specs observe it. Refactor pass: no change.

### 2. The Files divider resizes the file sidebar and the width is kept
Type: Behavior
Status: done
Proof: rows two to six and the Intent row above; new focused specs under
`dashboard/frontend-tests/review/` for the Drag, Reload, Keyboard, Bounds,
Hidden sidebar and No choice yet examples, plus
`dashboard/frontend-tests/review`, `dashboard/frontend-tests/intent` and
`e2e/review/story-review-panes.spec.ts`, `-tree.spec.ts`, `-touch.spec.ts`
green, typecheck and staged lint.

Behavior: a review with files, side by side → a **Files divider** sits
between the sidebar and the diff, saying the sidebar's width and bounds →
dragging it, or Right and Left while it holds the keyboard, widens or narrows
the sidebar and gives or takes the same width from the diff, stopping at
12rem for the sidebar and 18rem for the diff → the chosen width is the
sidebar's in every review opened afterwards, also after a reload → **Hide
files** removes the divider and **Show files** returns both at that width → a
browser with no choice shows 16rem.

Accepted proof (2026-11-18, on 28b3cac with the change uncommitted, load
about 25 to 44): `reviewFileSidebarWidth.ts` and `StoryReviewWorkarea.tsx`
with `story-review-workarea.css`; new specs
`story-review-files-divider.spec.ts` and `-kept.spec.ts` with the page object
`dashboard/tests/filesDividerPage.ts`; the review, intent and side-panel width
frontend folders, the panes, tree and touch e2e specs and the typecheck
passed. The fourth premise row was wrong as measured: the sidebar's 16rem was
its content width, so it showed 282px. The sidebar's width now includes its
padding and border, so it shows the 16rem (256px) the divider says, 26px
narrower than before, as in the mockup. `e2e/intent/intent-story-completed.spec.ts:55`,
reached by the consumer trace, timed out once at load about 44 in the Board's
`showColumn("Recently done")` after its review assertions passed, and passed
alone at load 36; the change does not touch Board column paging, so delivery
rests on that targeted rerun and hosted CI's verdict, and a CI failure there
is this execution's to repair. The refactor pass moved room measurement into
`measuredRoom.ts` and the choice's clamp into `sharedRoom.ts`'s
`useChoiceWithin`, used by the Side panel, the Sessions sidebar and the
review; on that state the two new specs, the side-panel width, Sessions
sidebar divider, review and intent frontend folders, the review panes, tree
and touch, Sessions sidebar resize and `intent-story-completed` e2e specs and
the typecheck passed at load about 12 to 25.

### 3. The room's limit leaves the preferred width alone
Type: Behavior
Status: done
Proof: rows seven to nine and the docs row above; new focused specs for the
Temporary limit, More room from the panel, Narrow panel and unusable or
refused storage examples, plus `dashboard/frontend-tests/review`,
`dashboard/frontend-tests/navigation/side-panel-width` and
`e2e/review/story-review-touch.spec.ts` green, typecheck and staged lint.

Behavior: a chosen wide sidebar → the Side panel is narrowed → before the
next paint the sidebar is as wide as the diff's 18rem allows, and the kept
preference is unchanged → the panel is widened or maximized → the preferred
width returns and the divider's upper bound grows → narrowed until the panes
stack → no divider, files above the diff as today → widened → divider and
preferred width return. A kept value that is not a usable width, or storage
the browser refuses, gives 16rem and a divider that still resizes for the
page's lifetime. The maintained docs describe the divider.

Accepted proof (2026-11-18, on 67bfd6b with the change uncommitted, load
about 22): no product change was needed; the shared calculation already gave
the room limit, the stacked layout and the unusable or refused storage
default. New `story-review-files-divider-room.spec.ts`, two tests added to
`-kept.spec.ts`, page-object reads in `filesDividerPage.ts`, and the two
maintained docs; the review and side-panel width frontend folders, the touch
e2e spec and the typecheck passed. The width is observed after it settles,
not before the next paint, which the shared `measuredRoom.ts` owns for the
Side panel too.
The refactor pass moved the room and kept-width writes into the page object
and fixed a race in the room spec, which read the divider's upper bound once
right after maximizing (374 against 1107 at load about 32); it now waits for
the bound to grow. The three Files divider specs passed, the room spec five
times in a row, with the typecheck, at load 19 to 32.

## Verification and delivery

- Follow [the failing/flaky-test policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
  as written; a base failure is attribution, never an exemption.
- Before test edits, apply [dough-makeme](../../../.agents/skills/dough-makeme/SKILL.md)
  and [dough-page-objects](../../../.agents/skills/dough-page-objects/SKILL.md)
  selection. No sleeps, `test.slow()`, or timeout overrides.
- Local gate per slice: the focused specs named in the slice, typecheck
  (`npm run typecheck:dashboard`), post-change refactoring, staged lint. No
  full local suite: the premise rows observed that the review and width
  journeys do not read the new divider. Hosted CI runs the shards.
- Run under maintained `caffeinate -s -i` on AC, per
  [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos);
  on battery, `caffeinate -i` awake with the lid open and read the sleep log.
- Wrap-up removes the [mockup](../../mockups/review-changes.html) and the
  seed's temporary design reference if
  [Keep Review changes focused on the diff](../695-keep-review-changes-focused-on-the-diff/PLAN.md)
  is already delivered; otherwise that story's wrap-up does.

## Current decisions and plan review

- Refinement on 2026-11-18 set the sidebar's minimum at 12rem and the default
  at 16rem (the mockup's 192px and 256px), the diff's minimum at 18rem
  (today's diff basis, which keeps the stacking width), the key step at 1rem
  (the mockup's 16px), and the name **Files divider**. The diff's minimum is
  the sidebar's only upper limit.
- The width is chosen as the pointer moves, as the dashboard's other dividers
  do; the mockup's choose-on-release is not carried over.
- Slice 1 is separate because its proof is the existing dividers' journeys,
  not the review's. Slice 3 is separate because room changes and unusable
  storage are their own proof loop; where slice 2 already follows the room
  through the shared calculation, slice 3's product change is what its
  examples still find missing, and the docs.
- Slice-plan refinement was not needed: three slices, each one outcome and
  one proof loop, with the consumer set observed rather than assumed. This
  review identified no remaining slice-specific concern.
