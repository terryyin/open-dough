# Choose the whole project or a recent story from the bookmark

**Identity:** SEED-420#choose-review-scope

**Source:** [Choose the whole project or a recent story from the bookmark](../../seeds/SEED-420-unified-intent-review.md#choose-review-scope)

## Goal and scope

A developer can identify Intent and its scope in the banner and use the
bookmark to reveal the selected story, choose a recent story, or clear the
selection to read project CI. The same chooser works on the Board and supports
keyboard and touch. A recent story from another project opens in the current
perspective. The selected story's start, the card start on the Board and the
story heading in Intent, distinguishes menu opening from reveal.

The developer selected the bookmark as the only scope chooser. Opening
**Whole project** keeps the project and perspective, clears the Selected
story and leaves the history order intact. Choosing the same story again
starts its default review. Keep independent CI and revision semantics and
ordinary view navigation within each scope, including **Review changes**
arrivals. Story Home, project file inventory, and comparison presentation
have separate stories.

## Current decisions

- [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#dashboard-ui-concepts)
  gives PageFrame one Selected story and the browser one recent history of
  project and identity pairs. Use the existing select and clear operations in
  [pageStorySelection](../../../dashboard/src/pageStorySelection.tsx). Keep
  history keys, ordering and browser storage. Intent derives its scope for the
  current project from its selection. Use the UI's reading bounds and
  existing movement owners for reveal.
- Follow [Dashboard UX/UI North Star, Review in Intent](../../../docs/dashboard-ux-ui-north-star.md#review-in-intent)
  for the single chooser and compact mobile label, and
  [Board interaction, Touch browsing and selection](../../../docs/dashboard-board-interaction.md#touch-browsing-and-selection)
  for the first-reveal gesture, 44 px coarse-pointer target, and Board
  story-reference journey. Keep the existing icon semantics and perspective
  radio behavior. Project evidence retains its own meaning and revision owner.
- Reuse and extend [RecentStories](../../../dashboard/src/recentStoriesControl.tsx)
  and the existing project switch path. The Board uses the story-reference
  journey, including its unavailable state. Intent uses its own visible
  heading and scroll region. Keep opening and reveal on the same definition
  of readable. Preserve the live distinction between an offscreen
  destination and one already reported unavailable.
- Use the published title already resolved for the selected story when
  available, including a Done record's title. Trace the active and Done reads
  from [useIntentStoryLens](../../../dashboard/src/useIntentStoryLens.ts) and
  its consumers before threading the title to the banner. Fall back to the
  identity during loading or absence. Keep label data derived from the
  current project and selection so a project change cannot show stale text.
- Follow [directly testable production code](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support),
  [act as soon as the page allows](../../NORTH-STAR.md#act-as-soon-as-the-page-allows)
  and [plain Vitest for unit tests](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e).
  Use the production frame and existing typed published-work, Intent, Review
  and CI inputs for mounted tests. Use synthetic work snapshots, bounded
  revision reads and MakeMe fixtures. Reuse the browser's actual geometry
  and input. Keep real service wiring in representative e2e journeys and
  follow configured MakeMe and page-object selection before edits.

## Decisive premises and baseline

Observations below ran on `3e9dc1a93` on 2026-11-25 in the owned macOS
preparation checkout with Node 24.21.0 and Chromium. The original annotated
Done review's viewport was unavailable. The mounted Changes fixture
reproduced the same visible-heading symptom under native layout and input.

| Consuming operation and profile | Observed result |
| --- | --- |
| Maintained mounted `intent-home-activation-scope.spec.ts` Changes fixture, temporarily instrumented at 390 × 320, with the story's file selected | The title spanned y=148–172 in the reading region y=69–320 while the tabs began at y=356. Mouse click left the menu closed and moved toward the tabs. A native Chromium touch tap on the 44 × 44 target also left the menu closed, with the file still selected. After scrolling the heading behind the banner while the tabs were visible, Enter opened the menu and Tab left the dialog for the project control. These observations identify the heading/bounds mismatch and unreachable choices. Temporary edits were reverted. |
| Maintained mounted `navigation/recent-stories.spec.ts`, with a temporary observation after choosing its unavailable identity | Existing visible, reveal-then-open and cross-project assertions passed. After the unavailable-story notice, two activations kept the chooser closed. The observation used the existing simulated published snapshot and was reverted. |
| Maintained mounted browser consumers, the 11 named specs in the trace below | All 30 baseline cases passed, including project CI, cross-project Board navigation, keyboard reading order, Story card and Side panel selection, and reading-place recovery during the temporary visit. These runs establish the current path and inputs. Each changed assertion must discriminate the new promise in its owning slice. |
| Maintained e2e Chromium, the five named specs below with two workers and their synthetic repositories | The proof record selected eight cases and reported a strict pass for all eight. The current journeys reached live CI judging, historical Done pins, project timing refresh, captured follow-up return and delayed Review changes arrival. |

## Outside-in proof

| Final promise | Owner and observation |
| --- | --- |
| Readable start opens the chooser immediately and preserves the current reading. Offscreen start reveals and then opens. Unavailable selection keeps choices reachable. | Slice 1. Board and Intent mounted frame journeys. Independently observe the card/heading in the available region, the menu and the position/file before and after activation. Exercise native touch at the reproduced short viewport and cover a hidden heading with tabs visible. |
| Whole project clears the story, preserves ordered recents, and shows project CI or an unhighlighted Board. Keyboard can operate and dismiss the chooser. Recent selection can navigate between projects without changing perspective. | Slice 2. Mounted Board and Intent journeys. Drive clear and selection through the chooser; read both the resulting project/story and persisted list. Observe Tab or the choice control's native keyboard navigation, activation, and Escape focus return. Keep cross-project Board and Intent entry proof. |
| Project CI and pinned Done evidence remain valid through the new chooser, with Review changes still opening directly. | Slices 3 and 4. Retain the independent evidence and arrival assertions through the supported chooser and card journeys. Selecting a recent after clear observes a fresh review. |
| Desktop Intent and the current scope are visible together; on narrow screens the closed bookmark keeps its accessible name and touch target. | Slice 5. Mounted frame at desktop and phone widths, showing active and Done titles when resolved, identity fallback while unavailable, and **Whole project** after clear. Observe text visibility, accessible name, and a 44 px coarse-pointer target. |

### Consumer trace

The installed consumer trace searched `Back to selected story`,
`projectIntentLink`, `openProjectIntent`, `returnToStory`, `backToStory`,
`Recent stories, no story selected`, `Recent stories`, and
`intentStoryViewStart`. Recheck changed declarations and enclosing banner
assertions during execution.

- **Run** `navigation/recent-stories.spec.ts` and
  `navigation/accessible-board-keyboard.spec.ts`. Inspect their
  `recent-stories-frame.ts` and `dashboard-header-reading.ts` consumers.
- **Run** the mounted Intent specs `intent-recent-stories`,
  `intent-home-activation-scope`, `intent-ci-status-homepage`,
  `intent-done-project-refresh`, `intent-project-visit-selection`,
  `intent-project-visit`, `intent-sidebar-toggle`,
  `intent-story-changes-gaps` and `intent-story-changes-only`.
  Route changed journeys through their existing fixture and reading owners.
- **Run** the e2e specs `intent-project-visit-ci`,
  `intent-project-scope-timing-refresh`, `intent-done-project-refresh`,
  `intent-ci-follow-up-return` and `story-card-review-arrival-race`.
  Inspect the shared `intentModePage.ts`, `recentStoriesPage.ts` and
  review helpers before changing selectors. The captured follow-up's pinned
  scope and story arrival are independent proof.
- **Excluded** historical mockups and retired plan/done prose because they
  are archived evidence. The `backToStoryCi` match in `IntentFileReading.tsx`
  returns from file Proof to story CI, a different action.
  Planning-state schema and unrelated matches for `not-refined` only consume
  the supported enum value.

## Ordered slices

### 1. Open the chooser when the selected story is readable

Type: Behavior
Status: planned
Estimate: 10–14 active minutes.

With the Board card or Intent heading readable, opening the chooser leaves
the reading in place. Move the start offscreen and activate twice to see
reveal, then menu. An unavailable story's existing notice leaves a way to
open the chooser. Use the shared motion owner and actual reading region for
each perspective. Keep Intent's current temporary project visit during this
increment. Prove it through the desktop Board and the 390 × 320 Intent
fixture, including native touch and the unavailable Board destination.

### 2. Use the bookmark to choose whole-project and story scope

Type: Behavior
Status: planned
Estimate: 10–14 active minutes.

With a story selected and the chooser open, activate **Whole project** to
clear the page selection and reach project CI or the unhighlighted Board.
Reopen the list and select the retained recent story, including a story
from another project. Keep the chooser's keyboard choices operable and
return focus on dismissal, respecting Board story-arrival focus on
selection. Exercise initial project scope with empty history as an
available Whole project choice. Exercise cross-project Intent selection
through the configured frame with a working project switch. Update shared recent-story assertions that
observe menu contents and active-row semantics. The existing temporary
visit controls remain usable until slice 4 replaces the old path.

### 3. Move project evidence journeys to the bookmark

Type: Structure
Status: planned
Estimate: 11–15 active minutes.

Use the existing e2e page abstractions to drive Whole project and recent-story
selection for the project evidence and arrival journeys listed above. This
enables slice 4 to remove the old controls. Preserve the observations for
trunk CI refresh and branch identity, Done historical pins and collected
timing, pinned follow-up arrivals, and late review results. Observe each
scope's own evidence independently. Keep same-selection restoration checks
inside supported transitions such as switching perspective or story tabs
when that behavior is the promise. The cross-scope behavior delivered in
slice 2 starts a new review. Run the five named e2e specs with their existing
typed fixture inputs and Dashboard entry points. Product behavior stays as
delivered by slice 2.

### 4. Give the bookmark sole ownership of scope selection

Type: Behavior
Status: planned
Estimate: 11–15 active minutes.

From a story diff, choose Whole project, then reselect the story. The
project CI view names the trunk and the story returns at its default view
and comparison. Entering through **Review changes** still opens Changes.
Remove the old Intent header controls and their temporary override and
focus bridge. Observe the old controls absent on both sides of the scope
change. Preserve independent project CI/revision state and story
path state under supported same-selection navigation. Migrate mounted
fixtures to the chooser and retain their separate purpose, revision,
filter, missing-locations and sidebar observations at the transitions
those cases promise. Run the nine mounted Intent specs and the e2e
arrival/CI cases that observe the cutover.

### 5. Name the active Intent scope in the banner

Type: Behavior
Status: planned
Estimate: 8–12 active minutes.

With Intent open at desktop width, the developer can read the **Intent**
label and the selected story title or **Whole project** in the banner.
At narrow width the closed bookmark shows its icon and exposes the scope
by accessible name. Reuse the frame's resolved story metadata and
existing responsive banner mechanics. Verify changing scopes, project
and selection alignment, title fallback, bounded label width, and the
existing 44 px coarse-pointer target. Keep the Board's banner navigation
and keyboard reading order intact.

## Verification and plan review

- Local gates are the named frontend and e2e consumers above. Use the
  maintained runners `node scripts/test-frontend.mjs <specs>` and
  `npm run test:e2e -- <specs>`, scoped to the affected promises at each
  slice. Check type and lint for the touched dashboard contracts. On macOS
  AC power start fully awake with `caffeinate -s -i` for long runs. On
  battery, use the lid-open `caffeinate -i` procedure and check sleep logs
  afterwards, as in [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
- Apply the [shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
  Use [post-change refactoring](../../../.agents/skills/dough-post-change-refactor/SKILL.md)
  before committing each slice and the normal delivery proof after candidate
  reconciliation.
- Slice-plan refinement was unnecessary after construction. The slices use
  one selection and reveal rule, the temporary overlap has an explicit
  replacement, and the evidence migration directly enables that replacement.
  This review identified no remaining slice-specific concern.
