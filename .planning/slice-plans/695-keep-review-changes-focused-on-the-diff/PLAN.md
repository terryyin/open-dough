# Keep Review changes focused on the diff

**Source:** [Keep Review changes focused on the diff](../../seeds/SEED-384-keep-review-changes-focused-on-the-diff.md#keep-review-changes-focused-on-the-diff)
**Source review:** [source-review.md](source-review.md)
**Identity:** SEED-384#keep-review-changes-focused-on-the-diff

## Goal and scope

A developer opens **Review changes** and reads the diff right away: one slim
toolbar (file sidebar toggle, comparison name, details toggle) sits above the
files and diff, and the comparison choices, run picker, context and **Include
uncommitted changes** wait behind the details toggle. The seed owns Goal,
Scope, Key examples and scope limits; the
[mockup](../../mockups/review-changes.html) is the visual reference for Landed
runs and Published completion.

Excluded: resizing or remembering the file sidebar width (the seed's second
story); naming the selected run in the toolbar; remembering the details' or
sidebar's shown state across openings; Intent's locations toggle.

## Existing solution and direction

PFE at `e53294dd9caae680a335a31281a32d51b4703330`:

- [`StoryReview.tsx`](../../../dashboard/src/StoryReview.tsx) (217 lines)
  renders `.story-review-top`: `ComparisonSwitch`, `RunChoice`,
  `ReviewContext` (workspace `ContextLine`, `LandedContext`, published facts),
  `ReviewFeedback`, `CommitRangeHeading`, the uncommitted check. It owns
  `browserShown` per opening.
- [`FileBrowserToggle.tsx`](../../../dashboard/src/FileBrowserToggle.tsx) is
  the one Hide/Show files control, rendered inside each context
  (`StoryReviewContextLine.tsx`, `StoryReviewLandedContext.tsx`,
  `StoryReviewContext.tsx`) only when the comparison has files, and by
  Intent's view row (`IntentPage.tsx`) with words.
- [`Icon.tsx`](../../../dashboard/src/Icon.tsx) `IconButton` gives icon
  buttons their accessible name and tooltip (Refresh, side-panel controls).
- [`story-review.css`](../../../dashboard/src/story-review.css) (247 lines)
  and [`story-review-touch.css`](../../../dashboard/src/story-review-touch.css)
  bound `.story-review-top` and size touch targets.

Direction: reuse these. The toolbar and the details section are one new
component and stylesheet beside `StoryReview.tsx`, so neither file passes the
250-line check; `StoryReview.tsx` hands them the controls it builds today.
The sidebar toggle becomes an `IconButton` in the toolbar with the same
`aria-controls`/`aria-expanded` and names; the contexts stop rendering it.
Intent keeps `FileBrowserToggle` unchanged. The details are an inline
disclosure (`hidden` section, `aria-expanded` on the eye), state held in
`StoryReview` beside `browserShown` so it resets per opening and survives
comparison, run and Refresh. Reading progress, problems and empty or
unavailable explanations (`ReviewFeedback`), `CommitRangeHeading` and the
commit list stay outside the details. ADR 0008's one side-panel region and
read-only review hold; no North Star topic; no server change.

Maintained docs: [`STORY-REVIEW-LANDED-RUNS.md`](../../../dashboard/STORY-REVIEW-LANDED-RUNS.md)
(67 lines) and [`AGENT-LAUNCH-REVIEW.md`](../../../dashboard/AGENT-LAUNCH-REVIEW.md)
(245 lines) describe where the Comparison switch, run listbox, context and
Hide/Show files sit. Update the affected sentences in place; put the toolbar
and details description where it keeps `AGENT-LAUNCH-REVIEW.md` within 250
lines.

## Decisive premises and preparation observations

Observed in this workspace at `e53294dd9caae680a335a31281a32d51b4703330` on
2026-11-18, load average about 8.

| Premise / consuming operation | Observation and result | Remainder |
| --- | --- | --- |
| Which existing tests read or operate the controls that move behind the details (slices 2 and 3) | Scratch edit wrapping `ComparisonSwitch`, `RunChoice`, `ReviewContext` (with its files toggle) and the uncommitted check in `hidden`, then `npm run --silent test:e2e -- e2e/review e2e/intent/intent-story-changes-landed-run.spec.ts`: 52 tests failed in 30 files: `e2e/intent/intent-story-changes-landed-run.spec.ts` and 29 of the 39 `e2e/review` specs (`story-review.spec.ts`, `-commit-races`, `-commit-ranges`, `-commit-refresh`, `-commit-renames`, `-commit-trunk`, `-commit-worktree`, `-commits`, `-completed`, `-context-line`, `-diff-context`, `-follow-up`, `-landed`, `-nothing`, `-one-shot`, `-one-shot-choice`, `-one-shot-choice-races`, `-one-shot-choice-refresh`, `-panes`, `-refresh`, `-story-branch-landed`, `-touch`, `-trunk-own-changes`, `-trunk-own-flagged`, `-trunk-own-older-git`, `-trunk-worktree`, `-trunk-worktree-ambiguity`, `-uncommitted-check`, `-uncommitted-check-refresh`). `npm run --silent test:dashboard:frontend` with the same edit: 3 failures, in `frontend-tests/intent/intent-done-landed-review-mode.spec.ts`, `frontend-tests/review/story-review-uncommitted-check.spec.ts`, `frontend-tests/sessions/recently-done-ad-hoc-review.spec.ts`. Scratch reverted. | The scratch also hid the files toggle, which slice 1 keeps visible, so slice 3's consumer count is at most this. Other e2e folders (`intent`, `sessions`, `navigation`) were not run with the edit; slice 2 repeats the scratch across them before editing. |
| Those tests reach the controls through shared support, so one step can serve them | Read `dashboard/tests/support/reviewControls.ts` (`comparison`, `comparisonChoice`, `comparisonLabel`, `landedRunChoice`, `expectShown`, `uncommittedCheck`, `uncommittedLabel`), `reviewContextLine.ts` (`contextLine`), and the openers `reviewRead.ts` (`openReview`, `openStoryReview`, `reopenStoryReview`), `oneShotReview.ts`, `intentStoryPage.ts`, `reviewPanes.ts`, `storyReviewTouchJourney.ts`, `frontendStoryReviewOpen.ts`, `frontendRecentlyDoneBoardReview.ts`. Direct locators outside them: `"Hide files"`/`"Show files"` buttons in 11 e2e review specs and two touch supports, `review.getByRole("radio")` counts in 4 specs, `storyReviewPages.ts` heading “Landed run”. | 47 spec files call `reviewRegion(` directly; those that do not pass an opener take the step explicitly in slice 2. |
| `IconButton` supplies accessible name and tooltip for an icon-only control | Read `Icon.tsx` use for Refresh in `StoryReview.tsx` and existing specs' `reviewRefresh` by name. | Eye and panel icons are named in the mockup (`eye`, `eye-off`, `panel-left-close`, `panel-left-open`); their presence in the installed `lucide-react` was not checked — any outlined eye and sidebar icon the package offers satisfies the story. |

## Outside-in proof ownership

| Promise | Slice | Observable proof |
| --- | --- | --- |
| Sidebar toggle sits at the toolbar's far left as an icon named **Hide files** / **Show files**, offered only when the comparison has files, in the same place shown or hidden; hiding gives the diff the width, showing restores the selected file; toolbar names the comparison shown | 1 | Review journey: open a workspace review → toolbar holds the toggle then “All changes”; **Hide files** → file list hidden, diff wider, toggle box unchanged and named **Show files** → **Show files** → same file selected. Empty/unavailable comparison → no toggle. Choosing **Commits** → toolbar says “Commits”. |
| Existing review journeys keep proving their own promises once details collapse | 2 | The suites named in the premise row stay green before slice 3 and after it. |
| Details collapsed on every opening for every comparison; eye named **Show/Hide review details** with expanded state; details hold choices, run picker (more than one run), context, uncommitted check | 3 | Landed-run journey with two captured runs: on open no Comparison radios, listbox or run facts are visible, files and first diff are; activate eye → they appear, name flips. Workspace journey: context line and uncommitted check hidden until revealed. |
| Reveal/hide keeps comparison, selected file and diff scroll; choosing a run updates toolbar, details and diff and keeps details revealed | 3 | Select second file, scroll diff, toggle eye twice → same file, same `scrollTop`; choose older run → run facts and files change, details still shown. |
| Escape inside details collapses them and returns focus to the eye | 3 | Focus run picker → Escape → details hidden, eye focused. |
| Feedback, empty and unavailable explanations, Commits range heading and commit list stay visible while collapsed | 3 | Evidence-gap run opens with its explanation visible and details collapsed; in **Commits**, hide details → commit list still shown. |
| Next opening starts collapsed with the sidebar shown | 3 | Reveal details, hide files, close, open another story's review → collapsed, files shown. |
| Touch input keeps full-size activation surfaces for both toggles; narrow layout keeps files above diff | 1 (sidebar toggle), 3 (eye) | Existing touch journey (`e2e/review/story-review-touch.spec.ts` and its support) asserts both toggles' boxes at control size and still passes its narrow-layout checks. |
| Maintained docs describe the toolbar and details | 3 | `STORY-REVIEW-LANDED-RUNS.md` / `AGENT-LAUNCH-REVIEW.md` name the toolbar, details toggle and what stays visible; no sentence places the controls above the work area unconditionally. |

## Ordered slices

### 1. File sidebar toggle and comparison name in a review toolbar
Type: Behavior
Status: done
Proof: first and touch rows above; focused
`bash scripts/test.sh` over the changed and reading review specs
(`e2e/review/story-review.spec.ts`, `-panes`, `-context-line`, `-refresh`,
`-one-shot*`, `-commits`, `-completed`, `-nothing`, `-uncommitted-check`,
`-touch`), typecheck and staged lint.

Behavior: a review whose comparison has files → open **Review changes** → a
toolbar under the panel header shows an outlined sidebar icon button at the
far left named **Hide files**, then the name of the comparison shown;
activating it hides the file sidebar, gives the diff its width and renames it
**Show files** in the same place; activating again restores the sidebar with
the same file selected. A comparison without files offers no toggle. The
contexts no longer hold a files button. Interim: the comparison choices,
run picker and context still show beneath the toolbar until slice 3.

### 2. Review journeys reach review details through one step
Type: Structure
Status: planned
Proof: second row above; the e2e and frontend suites named in the premise row
green with no product change.

Structure: test support gains one review-details step in
`dashboard/tests/support/reviewControls.ts` that leaves the comparison
choices, run picker, context and uncommitted check readable (today: they
already are). The shared review openers apply it, and journeys that reach the
review another way take it explicitly, so every consumer the premise row
lists passes through it. First repeat the premise's scratch edit across the
remaining e2e folders to complete the consumer list. Enables slice 3, which
changes that step alone to activate the details toggle.

### 3. Review details wait behind the eye
Type: Behavior
Status: planned
Proof: rows three to seven, the eye's touch row and the docs row; new focused
review specs for the compact opening, reveal, Escape, workspace and
evidence-gap examples, plus the premise row's suites green.

Behavior: any review → open **Review changes** → the comparison choices,
**Landed run** picker, context of the comparison shown and **Include
uncommitted changes** are hidden, and an outlined eye beside the comparison
name is named **Show review details** → activating it reveals them inline
above the work area and names it **Hide review details**, keeping comparison,
selected file and diff scroll → choices made there update toolbar, details
and diff and leave the details revealed, across Refresh → Escape inside the
details hides them and focuses the eye → feedback, explanations, the Commits
range heading and commit list are visible either way → a later opening starts
collapsed. Replaces slice 1's interim layout.

## Verification and delivery

- Follow [the failing/flaky-test policy](../../../AGENTS.md#failing-and-flaky-tests)
  as written; a base failure is attribution, never an exemption.
- Before test edits, apply [dough-makeme](../../../.agents/skills/dough-makeme/SKILL.md)
  and [dough-page-objects](../../../.agents/skills/dough-page-objects/SKILL.md)
  selection. No sleeps, `test.slow()`, or timeout overrides.
- Local gate per slice: the focused specs above through `npm run --silent
  test:e2e -- <paths>` (frontend specs: `npm run --silent
  test:dashboard:frontend -- <paths>`), typecheck, post-change refactoring,
  staged lint. `bash scripts/test.sh <spec.ts>` refuses Playwright specs (“no
  check was run”), observed in slice 1. Slices 2 and 3
  also run `e2e/review` and the dashboard frontend suite whole, because the
  moved controls are read across them (premise row); no other full local
  suite. Hosted CI runs the shards.
- Run under maintained `caffeinate -s -i` on AC, per
  [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos);
  on battery, `caffeinate -i` awake with the lid open and read the sleep log.
- Wrap-up keeps the mockup: the seed's second story still uses it.

## Execution record

- Mode: Story Branch; workspace `.worktrees/keep-review-changes-focused-on-the-diff`,
  branch `claude/keep-review-changes-focused-on-the-diff`; claim
  `70a81c6bad53c904576e0d89892b09cf52432d65` accepted on `origin/main`.
- Slice 1 accepted on 2026-11-18: `e2e/review` whole plus
  `e2e/intent/intent-story-changes-landed-run.spec.ts` green at load 20–36,
  `frontend-tests/review` and seven reading frontend specs green, both
  typechecks green. The toolbar is `StoryReviewToolbar.tsx`, a `role="group"`
  named “Review toolbar”; support reaches it through `reviewToolbar`,
  `toolbarComparison`, `filesToggle` in `reviewControls.ts`.
- `e2e/review/story-review.spec.ts` is at 250 lines: later slices put new
  assertions in support or new specs.
- Slice 1 repair on 2026-11-18: hosted CI run 44257937459 on `1b33fda6a`
  failed `frontend-tests/navigation/side-panel-width-covering.spec.ts:49`
  (“not read whole: SPAN: All changes”) because the toolbar name was styled
  to truncate; slice 1's local proof had not run `frontend-tests/navigation`.
  The name no longer truncates. Slices 2 and 3 run the frontend suite whole.
- Trunk amended the story's first scope limit to “Resizing the file sidebar
  and remembering its width, delivered separately.” (`ced05e258`), absorbed
  here; no numbered commitment's source text changed.
- Flaky under load, not caused by this story:
  `e2e/review/story-review-one-shot-choice.spec.ts:23` timed out once at 30 s
  at load about 32; its trace shows about 23 s in the fixture's three real
  launches (`oneShotReviewChoices.ts`) before the first UI step. It passed
  alone and in two later whole-folder runs. Slices 2 and 3 run the folder
  again; a second timeout there is diagnosed before delivery.

## Story obligations

### G1. Details still show beneath the toolbar
Reported: slice 1 — "Interim: the comparison choices, run picker and context still show beneath the toolbar until slice 3."
Story clause: "Details collapsed on every opening."
Disposition: receiving slice 3

### G2. Maintained docs still place Hide files in the context
Reported: slice 1 — "the maintained docs still place Hide/Show files in the context (slice 3 owns them)."
Story clause: "the panel opens with one slim toolbar above the files and the diff"
Disposition: receiving slice 3

## Current decisions and plan review

- Developer decisions on 2026-11-18: the story is split, resize-and-remember
  being the seed's second story; context and **Include uncommitted changes**
  collapse for every comparison while the Commits range heading and commit
  list stay visible; the toolbar shows the comparison name only.
- The Structure slice sits between the two Behaviors because only slice 3
  needs it; slice 1's toggle keeps its names, so its consumers change only
  where they located it inside the context line.
- Slice-plan refinement was not needed: three slices, each one outcome and
  one proof loop, with the consumer set observed rather than assumed. This
  review identified no remaining slice-specific concern.
