# Review a story's impact on test intent

**Identity:** SEED-192#review-story-intent-impact
**Source:** [selected story](../../seeds/SEED-192-review-product-intent.md#review-story-intent-impact).

## Goal and scope

A developer selects a story on the Development board by clicking its card's
empty area, which works for active and Recently done cards. Clicking it again
deselects it. In Intent, the selected story's default Review changes comparison
overlays the published test tree. With the whole tree shown, changed files are
styled by kind and folders containing changes are highlighted. With "Selected
story only" on, only the changed files appear. Selecting a changed file shows
Review changes' own diff. Folders start collapsed. Those containing changes
open when Intent opens with a selected story, and again at each toggle.

Exclusions, from the story: other comparisons in Intent, the story's own
Intent configuration, Proof of the story's version, protection or complexity
judgments, marking review from Intent, and URL selection. The story section
lists the required restrictions: a gap is never shown as no change, and Intent
and Review changes never disagree.

## Existing solutions and decisions

PFE:

- **Selection.** `dashboard/src/Columns.tsx` keeps `selectedIdentity` in local
  state. Its `select()` toggle and story-navigation reveal-and-select
  (`storyNavigation.tsx`) already exist, and selecting shows `StoryDetail`.
  `DoneStoryCard.tsx` has no selection. Lift the selection to one page-level
  owner keyed by project, in the style of `pageSessions.ts` /
  `storyNavigation.tsx` contexts. Columns, Recently done, and Intent use it.
- **Selected styling.** `.story-card-selected` and `.story-card.in-side-panel`
  share `--accent-soft` (`story-cards.css`). Selection needs its own visible
  mark.
- **Comparison read.** `useStoryReviewSelection(source, identity, round,
  completed)` (`StoryReview.tsx`) already chooses between workspace snapshot,
  landed run, and published comparison. `useStoryReviewComparison` derives
  the shown comparison. Intent calls the same hooks with the default "all
  changes, including uncommitted" choice, extracted only as far as needed for
  a second caller. Whether a story has a comparison follows
  `StoryReviewAction`'s offer rule (`reviewWorkspaceOf` for active, always for
  completed). Extract that rule rather than restating it.
- **Tree and styles.** Intent already uses `reviewFileTree`, `FileTree`
  (`StoryReviewFileTree.tsx`), and `story-review-files.css`. The `data-kind`
  styles (added `--ready`, deleted line-through, renamed italic) move into one
  shared change-kind style that adds a modified style. `FileTree` gains a
  per-folder contains-changes mark, computed once in the tree model.
- **Diff.** `FileDiff` (`StoryReviewFileDiff.tsx`) with `DiffLines` and
  context expansion is the only diff renderer. Intent passes it the same
  `reviewed`/`from`/`tree` arguments `StoryReviewSnapshotView` does.
- **Fixtures.** Workspace review fixtures are in
  `dashboard/tests/support/storyReviewWorktree.ts`, and
  `completedPublishedStory.ts` covers a completed story served by
  `committedOrigin.ts`. Intent fixtures (`intentCodeBrowseFixtures.ts`,
  `publishIntentProject`, `intentPerspectivePage.ts`) publish hand-built files.
  `committedOrigin.ts` does not answer Intent's recursive `git/trees` read; see
  the decisive premises below.

Accepted decisions:
[ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
keeps selection as disposable page state and the overlay's compared revisions
distinct from Intent's published revision.
[ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md) makes the
story scope a Development lens on Intent.
[ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
favors reuse.
[North Star: Story-scoped Intent](../../../docs/dashboard-ux-ui-north-star.md#story-scoped-intent)
describes this design. Once code explains it, the story's wrap-up trims that
section.

## Domain rule

One pure join: the configured locations' files at the published revision,
plus the comparison's changed files with their kinds and old paths, give:

- each tree file's change kind, or unchanged;
- added files inserted at their paths when a location's selection (kind and
  include patterns) admits them;
- a contains-changes mark for each folder and location; and
- the count of changed files outside every location.

"Selected story only" is the same join restricted to changed entries. Folder
expansion is one function of the join: open what contains changes, plus the
first changed location in configured order. Intent applies it at mount and at
each toggle, never on a live selection change.

## Outside-in proof

| Story example | Observable signal |
| --- | --- |
| 1 workspace story, highlighted tree, diff | Playwright journey with a story-review workspace fixture and Intent locations: card-area click selects; Intent shows story name, compared revisions, modified/added styling, contains-changes folders, changed folders open; the changed file's diff region matches Review's |
| 2 toggle | same journey: "Selected story only" shows only changed files, expanded; off restores the whole tree with changed folders opened |
| 3 outside locations | same journey: count of changed files outside Intent locations |
| 4 no in-scope change | journey variant: product-only change says no test files in Intent locations changed |
| 5 completed story | journey on `completedPublishedStory` through `committedOrigin` with Intent settings committed |
| 6 no comparison | active story with no workspace: explanation; tree usable |
| 7 deselect / controls don't select | board journey: second empty-area click clears selection, and Intent shows no toggle; Start, session entry, dependency link clicks keep selection unchanged |
| 8 collapsed default | updated Intent journeys: every folder starts collapsed without a selected story |

Local gates: run focused specs through the Playwright command below while
iterating. Slices 1 and 3 change shared page state and shared Review changes
components, so before publishing, run the full `npm test` and the whole
dashboard suite on the final state. Apply the repository's
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests) as
written.

Command:
`env -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts --reporter=list <specs>`

## Ordered slices

### 1. Select a story by its card
Type: Behavior
Status: planned
Proof: new board journey (e.g. `dashboard/tests/story-card-selection.spec.ts`)
for example 7, plus selecting and deselecting a Recently done card. Existing
inspection and story-navigation journeys still pass.

Pre-condition: the board shows active and Recently done cards. Trigger: the
developer clicks a card's empty area, then clicks it again. Result: the first
click selects the story. An active card shows detail, as Inspect does, and
every selected card has a selected mark distinct from "shown in Side panel".
The second click deselects it. Clicks on buttons, links, inputs, session
entries, and disclosures inside the card do not select. One story is selected
per project across active and done cards. Selection moves from `Columns` to a
page-level owner that Intent can read. Reveal-and-select from story navigation
keeps working, and the selection survives a perspective switch.

### 2. Intent folders start collapsed
Type: Behavior
Status: planned
Proof: update the consumer journeys the scratch observation found (see the
decisive premises below) to expand folders explicitly, and assert the
collapsed start (example 8).

Pre-condition: Intent with configured locations and no selected story.
Trigger: open a location group. Result: every folder inside starts collapsed.
A file opened from the candidates record still shows selected in the tree,
because its folders open. Expansion keeps working as today.

### 3. One change-kind model for Review changes and Intent
Type: Structure
Status: planned
Proof: existing Review changes journeys pass unchanged in behavior
(`story-review-comparison*.spec.ts`, `story-review-file-moves.spec.ts`,
`story-review-completed.spec.ts`, `story-review-line-counts.spec.ts`), plus
Intent journeys. A focused check shows the new modified style in Review
changes, which is the one intended visible change.

Extract the comparison-availability rule from `StoryReviewAction` and the
default-comparison choice from the snapshot view so a second caller can use
them. Give `reviewFileTree`/`FileTree` one change-kind and contains-changes
model with shared styles, including modified. Enables slice 4.

### 4. Intent highlights the selected story's changes
Type: Behavior
Status: planned
Proof: new Intent journey on a workspace fixture with Intent settings
(examples 1, 3, and 6). This journey also proves the overlay join.

Pre-condition: a selected Taken story with a reviewable workspace and Intent
locations. Trigger: switch to Intent. Result:

- Intent names the story and the compared revisions.
- Changed in-scope files are styled by kind, and added files are inserted.
- Folders and location groups containing changes have the contains-changes
  background. Those folders are open, and so is the first changed location.
  Everything else is collapsed.
- The count outside the locations points to Review changes.
- Selecting a changed file shows its `FileDiff` in Purpose, and Proof says it
  describes the published revision.
- No comparison and a failed read each have their own explanation, with a
  retry where the read failed.

Deselecting removes the lens.

### 5. Show only the selected story's changes
Type: Behavior
Status: planned
Proof: extend slice 4's journey (example 2) plus a product-only-change variant
(example 4).

Pre-condition: slice 4's view. Trigger: toggle "Selected story only" on, then
off. Result: on shows only the in-scope changed files and their folders,
expanded. A story with none says "No test files in Intent locations changed in
this story", with the outside count. Off shows the whole tree again, with
changed folders opened and others collapsed. A selection change while Intent
is hidden does not rearrange the tree until Intent opens or the toggle changes.

### 6. Review a completed story in Intent
Type: Behavior
Status: planned
Proof: Intent journey on `completedPublishedStory` (example 5). First extend
`dashboard/tests/committedOrigin.ts` to answer the recursive `git/trees`
request (`support/ghRequest.ts` kind `tree`) from `git ls-tree -r` at the
revision. The fixture commits Intent settings and a test file the story
changes.

Pre-condition: a story in Recently done whose published history comparison is
available. Trigger: click its card, switch to Intent. Result: Intent shows its
changes from the published comparison with the compared revisions, as slice 4
does for a workspace.

### 7. Terry evaluates a real story
Type: Behavior
Status: planned
Proof: developer-operated observation of the running dashboard on Open Dough.
Terry selects a real Taken or recently completed story with test changes,
reviews it in Intent in both toggle states, and compares this with Review
changes plus an editor. Record the story, the revisions, what was seen, and
Terry's judgment in Learnings.

Pre-condition: slices 1–6 are delivered. Trigger: Terry's review. Result: Terry
records a usefulness judgment, or a discrepancy that changes the plan.

## Decisive premises

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| Focused dashboard Playwright runs in this worktree | Every slice's proof | `node scripts/setup-native.mjs npm` and `browser`, then the command above on `dashboard/tests/intent-*` and `development-intent-frame*` (2026-11-02, base `469cdf78`) | Runs. See the following rows |
| Folder-collapse default has identifiable consumers | Slice 2's proof updates | Scratch edit initializing `IntentLocationGroup`'s collapsed set to every folder, then the Intent/frame specs, then revert (2026-11-02) | 6 failed, 25 passed. Failed: `intent-code-browse:30`, `intent-gherkin-browse:27`, `intent-gherkin-groups:23`, `intent-gherkin-unusable:62`, `intent-gherkin-layout:16`, `intent-selection-reads:175`. On revert, five pass. `intent-selection-reads:175` still fails (next row) |
| Baseline Intent specs are green | Slice 2's attribution | `intent-selection-reads.spec.ts:175` alone, twice, at `469cdf78` | Fails deterministically: expects Proof's "Select a feature file…" after a revision change, but the candidates default view hides Proof. Main's `3e8f8881` ("Expect cleared Intent selection to return to the candidates default view") is the story-4 execution's repair. CI on main was still failing at `3e8f8881`. Execution starts from current main and owns any failure that remains there, under the failure policy |
| The completed-story Git fixture serves Intent's location read | Slice 6's proof | Scratch spec: committed `.planning/open-dough.json` Intent settings and `tests/a.feature` into `completedPublishedStory`'s origin, `publishCommittedOrigin`, opened Intent (2026-11-02, then deleted) | False: "Intent locations for Open Dough could not be read at this revision". `committedOrigin.ts` has no `git/trees` answer, so slice 6 adds it first |

Whether `useStoryReviewSelection(source, identity, round, completed)`
(`StoryReview.tsx`) can be called outside the side panel as it is now is not
decisive. Its signature takes no context. Either way, slice 3 extracts what a
second caller needs, and its Structure proof observes the result.

## Current decisions

- A card's empty-area click is the existing inspection selection, not a
  second selection. It is one selection per project, page-level, and not in
  the URL.
- Intent stays at the published revision, and the story comparison is an
  overlay. Locations are the published ones.
- The toggle starts off. Folder expansion happens only at Intent mount and at
  toggles.
- Review changes and Intent share one comparison read, one change-kind model
  and style set, one tree, and one diff renderer.

## Learnings

None yet.

## Concern evidence

Refinement was not needed. The slices follow one model: selection, then
comparison, then the overlay join, then the shared tree and diff. Each
Behavior has its own proof loop, and Structure slice 3 comes directly before
slice 4, the Behavior it enables. Slice 6's fixture extension is a known,
bounded addition inside its own proof. Slice 2's spec updates have
identified consumers. This review found no remaining slice-specific concern.
