# Review a story's impact on test intent

**Identity:** SEED-192#review-story-intent-impact
**Source:** [selected story](../../seeds/SEED-192-review-product-intent.md#review-story-intent-impact).
**Source review:** [source-review.md](./source-review.md)

## Goal and scope

A developer selects a story on the Development board by clicking its card's
empty area, which works for active and Recently done cards. Clicking it again
deselects it. Keyboard selection uses the active card's existing Inspect
control and an equivalent selection control added to Recently done cards.
In Intent, the selected story's default Review changes comparison
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
  `DoneStoryCard.tsx` has neither selection nor an Inspect control; add a
  keyboard-operable selection control there. Lift the selection to one
  page-level owner keyed by project, in the style of `pageSessions.ts` /
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

Deleted files remain selectable changes even when absent from the published
tree. A rename is in scope when its current or old path meets a configured
location's kind and include patterns, including moves between locations or
across their boundary. Preserve both paths for Review's rename diff, and count
the changed file once rather than treating its two paths as two changes.

"Selected story only" is the same join restricted to changed entries. Folder
expansion is one function of the join: open what contains changes, plus the
first changed location in configured order. Intent applies it at mount and at
each toggle, never on a live selection change.

## Outside-in proof

| Story example | Observable signal |
| --- | --- |
| 1 workspace story, highlighted tree, diff | Playwright journey with a story-review workspace fixture and Intent locations: card-area click selects; Intent shows story name, compared revisions, modified/added styling, contains-changes folders, changed folders open; the changed file's diff region matches Review's |
| 2 toggle | same journey, including deleted and renamed files: "Selected story only" shows only changed files, expanded; off restores the whole tree with changed folders opened |
| 3 outside locations | same journey: count of changed files outside Intent locations |
| 4 no in-scope change | journey variant: product-only change says no test files in Intent locations changed |
| 5 completed story | journey on `completedPublishedStory` through `committedOrigin` with Intent settings committed; a file deleted by the story is absent from the published tree but remains selectable with its deletion diff |
| 6 no comparison | active story with no workspace: explanation; tree usable |
| 7 deselect / controls don't select | board journey: second empty-area click clears selection, and Intent shows no toggle; Tab reaches the Recently done selection control and Enter/Space select and deselect through the same state; Start, session entry, dependency link clicks keep selection unchanged |
| 8 collapsed default | updated Intent journeys: every folder starts collapsed without a selected story |
| Deleted and renamed files under the existing scope rule | workspace journey variants: a deletion, a rename between configured locations, a rename into a location, and a rename out of one remain visible with their change kind and Review's exact diff; an old-path match keeps a rename in scope, while a change matching neither path contributes once to the outside count |

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
Status: done
Proof: new board journey (e.g. `dashboard/tests/story-card-selection.spec.ts`)
for example 7, plus selecting and deselecting a Recently done card by both
card-area click and keyboard. Tab to its selection control, activate it with
Enter and Space, and assert the same selected state and deselection behavior.
The control has an accessible name and exposes its selected state. Existing
inspection and story-navigation journeys still pass.

Pre-condition: the board shows active and Recently done cards. Trigger: the
developer clicks a card's empty area, then clicks it again. Result: the first
click selects the story. An active card shows detail, as Inspect does, and
every selected card has a selected mark distinct from "shown in Side panel".
The second click deselects it. Active cards retain Inspect/Hide detail as their
keyboard equivalent. Recently done cards gain a focusable native selection
button that selects and deselects without opening detail. Its activation
toggles selection once, without a second toggle from the card-area handler.
Clicks on other buttons, links, inputs, session
entries, and disclosures inside the card do not select. One story is selected
per project across active and done cards. Selection moves from `Columns` to a
page-level owner that Intent can read. Reveal-and-select from story navigation
keeps working, and the selection survives a perspective switch.

### 2. Intent folders start collapsed
Type: Behavior
Status: done
Proof: update the consumer journeys the scratch observation found (see the
decisive premises below) to expand folders explicitly, and assert the
collapsed start (example 8).

Pre-condition: Intent with configured locations and no selected story.
Trigger: open a location group. Result: every folder inside starts collapsed.
A file opened from the candidates record still shows selected in the tree,
because its folders open. Expansion keeps working as today.

### 3. One change-kind model for Review changes and Intent
Type: Structure
Status: done
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
Status: done
Proof: new Intent journey on a workspace fixture with Intent settings
(examples 1, 3, and 6). This journey also proves the overlay join. Include a
deleted test and rename variants between two configured locations, into a
location from outside, and out of a location. Assert visibility, change-kind
styling, the same deletion/rename diff as Review changes, and the outside
count under the current-or-old-path rule. A rename with neither path admitted
is excluded and counted once outside.

Pre-condition: a selected Taken story with a reviewable workspace and Intent
locations. Trigger: switch to Intent. Result:

- Intent names the story and the compared revisions.
- Changed in-scope files are styled by kind, and added files are inserted.
- Deleted files stay visible. Renames admitted by either path stay reviewable,
  including when the new path lies outside configured locations; neither
  deletion nor rename disappears because a path is absent from the base tree.
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
Status: done
Proof: extend slice 4's journey (example 2), retaining its deleted and renamed
entries in both toggle states with the same change kinds and diffs, plus a
product-only-change variant (example 4).

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
revision. The fixture commits Intent settings and test files the story changes,
including one it deletes. Assert that the deleted file is absent from the
published inventory yet appears as removed in Intent, in both toggle states,
and opens the same deletion diff as Review changes.

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
  the URL. Recently done cards get a keyboard selection control because they
  have no existing Inspect control.
- Intent stays at the published revision, and the story comparison is an
  overlay. Locations are the published ones.
- The toggle starts off. Folder expansion happens only at Intent mount and at
  toggles.
- Review changes and Intent share one comparison read, one change-kind model
  and style set, one tree, and one diff renderer.

## Learnings

- Page selection API mutators must stay referentially stable across selection
  changes, or reveal-and-select effects re-select after Hide detail.
- Disabled card buttons do not receive clicks; empty-area handlers need
  point-in-bounds control hit-testing so those clicks do not toggle selection.
- Selection mark styling belongs in one CSS home (`story-cards.css`); splitting
  it across `story-detail.css` forced dual edits for one rule.
- Open `.story-detail` content is not empty area: treating it as a card-area
  click closed Inspect mid-journey (`source-navigation` hostile pinned links).
- Nested quiet Playwright proof runs must drop both `FORCE_COLOR` and
  `NO_COLOR`; Cursor shells often set both and Node's conflict warning fails
  empty-stderr expectations.
- **Stopped 2026-11-02 (human):** Slice 1 selection is implemented with
  focused proof green, but not published. Full `npm test` stalled for hours on
  `github-request-owned-calls` (held fixture `gh` + start-slack misrecognition
  deadlock; `--test-timeout=0`) and failed `dashboard-concurrent-runs` with
  `ENOENT` on `dashboard/test-results/<stamp>`. Piping through `| tee | tail`
  hid progress. Partial harness fixes (color env strip; pid-stamped Playwright
  output dirs) are in the checkout. Follow-up:
  SEED-218#fix-owned-calls-start-slack-hang. This story returns to the backlog;
  resume after that hang fix, or with suite gates known green.
- **Resumed 2026-11-02 (claude, mrsn-chan):** slice 1's code reached main in
  `c64319b6`; main CI passed at `0328d829` with it and the SEED-218 hang fix.
  The focused proof below reran green in this worktree (15 tests), so slice 1
  is delivered without a separate increment.

### Slice 1 accepted proof

```
command: env -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts --reporter=list dashboard/tests/story-card-selection.spec.ts
covers: example 7 — empty-area/keyboard select/deselect; Hide detail; Start/session/sidebar/disclosure non-select; done no detail; Intent survival without Selected story only
boundary: board story selection + Intent read of page selection
result: pass (2)
```

Also green: `steady-refresh-inspection.spec.ts`, `story-reference-navigation.spec.ts`, `notification-story-navigation.spec.ts` (13).

### Slice 2 accepted proof

```
command: npm run typecheck:dashboard; env -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts --reporter=list dashboard/tests/intent- dashboard/tests/development-intent-frame dashboard/tests/story-review-tree-collapse dashboard/tests/boundary/story-review-folders
covers: example 8 — every Intent folder starts collapsed; a record-opened file's folders open and it shows selected; caret/name expansion unchanged
boundary: IntentLocationGroup open-folder state (reviewFoldersHolding / reviewFolderPaths)
observations: Ex 8 steps in intent-entry-folder-summaries-folders.spec.ts and intent-test-optimization-candidates-open.spec.ts
result: pass (44); after refactor inline, focused rerun 5 passed
```

- A collapsed folder's name button carries its file count, so journeys
  matching folder names exactly expand folders first (`expandIntentFolders`).
- Slice 4 opens folders containing changes by seeding `IntentLocationGroup`'s
  `openFolders` at mount and at toggles.

### Slice 3 accepted proof

```
command: env -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts --reporter=list --workers=6 dashboard/tests/story-review- dashboard/tests/boundary/story-review- dashboard/tests/intent- dashboard/tests/development-intent-frame dashboard/tests/story-card-selection
covers: Review changes behavior unchanged except modified names in --accent; one change-kind model with per-folder containsChanges
observations: story-review-tree.spec.ts kind-style step; boundary/story-review-folders.spec.ts contains-changes model test
result: pass (171); side-panel/board/recently-done/agent-terminal consumers 44 passed
full gates on final state: whole dashboard suite 1894 passed (29.1m); npm test passed (PATH with Homebrew Bash 5 first — /bin/bash 3.2 is refused)
```

- Slice 4 API: `useStoryComparison({source, identity, completed})` gives
  `{review, reading, problem, shown}`; pass `shown.reviewed`,
  `shown.comparison.from` (or `file.includesTrunkFrom`) and `shown.tree` to
  `FileDiff`; gate with `storyComparisonOffered`; give tree items
  `{path, kind}` so `FileTree` emits `data-kind`; use `node.containsChanges` /
  `reviewContainsChanges` and style `data-contains-changes` in slice 4.
- Review changes itself opens on "since" when a review mark exists; Intent
  uses the story's "all changes, including uncommitted" (commitment 7.1).

### Slice 4 accepted proof

```
command: env -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts --reporter=list --workers=6 dashboard/tests/intent- dashboard/tests/story-review- dashboard/tests/boundary/story-review- dashboard/tests/boundary/authenticated-read-intent dashboard/tests/development-intent-frame dashboard/tests/story-card-selection dashboard/tests/side-panel-content-replacement dashboard/tests/recently-done-one-shot-review
covers: examples 1, 3, 6 and the deletion/rename variants; failed read with retry
observations: intent-story-changes.spec.ts, intent-story-changes-moves.spec.ts, intent-story-changes-gaps.spec.ts (per id in source-review.md)
result: pass (190); after refactor focused 57 passed, --repeat-each=4 intent-story-changes 16 passed
full gates on final state: npm test passed; whole dashboard suite 1898 passed (29.3m)
```

- The location selection rule (kind + include) now lives in
  `dashboard/src/intentLocationSelection.ts` on pinned `minimatch` (the
  matcher Node's `matchesGlob` is built on, POSIX), shared by the server's
  listing and `file-at` admission and by the overlay join
  `intentStoryOverlay.ts`.
- Placement: a change sits at its path where a location admits it; a rename
  whose new path no location admits sits at its old path; a placed rename
  removes its old published entry; a change neither path admits counts once
  outside.
- `committedOrigin.ts` already answers Intent's recursive `git/trees` read
  (slice 6's first step).
- Slice 5: filter `intentStoryOverlay` to changed entries; bump the
  `IntentBrowser` expansion round and recompute `storyOverlayExpansion` at
  each toggle. `IntentPerspective` unmounts when hidden, so a selection made in
  Development applies at the next mount.

### Slice 5 accepted proof

```
command: env -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts --reporter=list --workers=6 dashboard/tests/intent- dashboard/tests/boundary/authenticated-read-intent dashboard/tests/development-intent-frame dashboard/tests/story-card-selection
covers: examples 2 and 4; deleted and renamed entries in both toggle states; expansion at each toggle and at Intent open
observations: intent-story-changes-only.spec.ts tests 1-2, intent-story-changes-moves.spec.ts, intent-story-changes-gaps.spec.ts
result: pass (57, rerun after refactor); story-review family 135 passed; --repeat-each=4 intent-story-changes 24 passed
```

- "Selected story only" is hidden while there is no comparison or the read
  failed, so a restricted empty tree never reads as "no changes"; it appears
  unchecked once Retry produces a comparison.
- With the toggle on, locations without changes are not rendered.

## Story obligations

### X1. Other Intent comparisons deferred
Reported: slice 1 — "Choosing another comparison in Intent is deferred."
Story clause: "Choosing another comparison in Intent: since review mark, commit range, or committed only."
Disposition: excluded "Choosing another comparison in Intent: since review mark, commit range, or committed only."
Commitment: X1

### X2. Story-changed Intent configuration deferred
Reported: slice 1 — "Intent configuration as changed by the story itself is deferred."
Story clause: "Intent configuration as changed by the story itself. Locations stay those of the published revision."
Disposition: excluded "Intent configuration as changed by the story itself. Locations stay those of the published revision."
Commitment: X2

### X3. Story-version proof and judgment deferred
Reported: slice 1 — "Proof for the story's changed version and protection or complexity judgment are deferred."
Story clause: "Proof for the story's changed version, and judging whether the changes protect the story's intent (story 10) or how complex they are (story 11)."
Disposition: excluded "Proof for the story's changed version, and judging whether the changes protect the story's intent (story 10) or how complex they are (story 11)."
Commitment: X3

### X4. Marking review from Intent deferred
Reported: slice 1 — "Marking review progress from Intent is deferred."
Story clause: "Marking review progress from Intent."
Disposition: excluded "Marking review progress from Intent."
Commitment: X4

### X5. URL and beyond-today selection deferred
Reported: slice 1 — "Story selection through the URL and beyond today's sidebar or reference behavior is deferred."
Story clause: "Story selection through the URL, and selecting a story from the sidebar or from story references beyond today's behavior."
Disposition: excluded "Story selection through the URL, and selecting a story from the sidebar or from story references beyond today's behavior."
Commitment: X5

### G1. Unavailable review explanation unobserved
Reported: slice 4 — "A review answer of unavailable or landing-unavailable shows its own explanation as unavailable with no retry. No test covers this path."
Story clause: "A story with no comparison Review changes could offer, such as an active story with no recoverable workspace, gets an explanation."
Disposition: receiving slice 6

### G2. Summaries count only published files
Reported: slice 4 — "Location and folder Summaries still count only published files, so inserted files are not in Summary counts."
Story clause: "Proof keeps describing the published revision and says so."
Disposition: no user cost "sees that story's test-file changes in place in the project's test source": Summaries report the published revision's files and their proof; an inserted file is absent from that revision, yet it is still shown in place with its change kind and its own note that the published revision lacks it (intent-story-changes spec)

### G3. Completed story named by identity only
Reported: slice 4 — "A completed story is named by its identity and read with completed: true. Slice 6 should supply the done record's title and prove it."
Story clause: "Intent names the selected story"
Disposition: receiving slice 6

### G4. Compared revisions equal Intent's published revision in the fixture
Reported: slice 4 — "The compared baseline and Intent's published revision are the same commit in this fixture, so the ADR 0008 distinction is shown as two separate elements but not observed with two different values."
Story clause: "Intent states which revisions it compared."
Disposition: receiving slice 6

## Concern evidence

All seven slice boundaries are retained. The slices follow one model:
selection, then comparison, then the overlay join, then the shared tree and diff. Each
Behavior has its own proof loop, and Structure slice 3 comes directly before
slice 4, the Behavior it enables. Slice 6's fixture extension is a known,
bounded addition inside its own proof. Slice 2's spec updates have
identified consumers. Slice 1 now owns Recently done keyboard selection proof;
slices 4–6 explicitly cover deleted files and renames across Intent locations
through the same overlay and toggle model, including a completed-story deletion
absent from the published inventory. No additional slice or sizing exception is
needed. This review found no remaining slice-specific concern.
