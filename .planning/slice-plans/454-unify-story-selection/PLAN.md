# Unify story selection across Development and Intent

**Identity:** SEED-224#unify-story-selection
**Source:** [story](../../seeds/SEED-224-unify-story-selection.md#unify-story-selection)

## Goal and scope

The page keeps one selected story, set by Side panel content and by each
card's **Select story** toggle. The selected card is highlighted, Intent
reads the same story, and **Inspect story** only opens inline detail. The
story's Scope, Key examples, and Deferred promises apply as written.

Exclusions: no new Side panel content, no selection from Intent itself, and
no persistence across reload or in the URL.

Assumptions: Side panel content always names its story. A session's
`request.source` and `storyOf(request)` (`dashboard/src/launchWorkflow.ts`)
name it, and the result is undefined for an ad-hoc session. A review's
`StoryReviewRequest` carries `source` and `identity`. Both facts were read
in `dashboard/src/pageSidePanel.ts` at `0145597e`.

## Existing solutions and decisions

- `dashboard/src/pageStorySelection.tsx` already owns the selected story
  below `PageFrame`. It becomes one page-wide `{ project, identity }`
  instead of a per-project record. `useStorySelection(project)` keeps its
  shape for consumers, so `Columns`, `RecentlyDone`, `IntentPerspective`,
  `intentCiTarget`, and `useIntentStoryLens` read it unchanged, with
  `selectedIdentity` undefined for a project that does not own the
  selection.
- `usePageSidePanel` (`dashboard/src/pageSidePanel.ts`) is the single place
  where content opens and closes: `openTerminal`, `openFinalReport`,
  `openStoryReview`, `close`, and the closes in `markSessionDone` and
  `deleteSessionRecord`. Those transitions set or clear the selection.
  Selection is not derived from the panel, because a card toggle may select
  another story while the panel stays as it is.
- Inspection gets its own page-level owner keyed by project and identity, so
  that story navigation's reveal in `Columns` (`useLayoutEffect`) can open a
  target's detail without selecting it. Several identities can be open at
  once.
- The highlight keeps the current `story-card-selected` look: an inset accent
  ring and a pale fill. The `in-side-panel` class goes from story cards only.
  Session entries (`SessionEntry`, `SessionsSidebarSessionEntry`) keep their
  `in-side-panel` and "Shown in terminal" marks.
- **Select story** (`aria-pressed`) appears in every card's action group.
  `StoryCard` gains it beside **Inspect story**. `DoneStoryCard` already has
  it. An empty-area click calls the same toggle.
- The guard that blocks empty-area selection during startup (`starting` in
  `StoryCard`'s `onClick`) existed to protect the disabled inspection.
  Selection no longer opens inspection, so that guard goes. Startup
  protection keeps covering the card's actions in its disabled fieldset.
  Whether **Select story** sits inside that fieldset follows the same rule:
  it is a selection, not a protected action, so it stays enabled.
- Code, tests, and helpers use **selected story**, **highlight**, and
  **inspect** as the story defines them. For example
  `tests/storyCardSelection.ts`'s `expectSelected` asserts the highlight and
  the control's pressed state.

## Coordination

Plan 448 (SEED-192#align-intent-story-lens, Taken by dbs-chan) edits
`pageStorySelection.tsx`, `tests/story-card-selection.spec.ts` (its slice 1
moves the dependency test into its own spec), `dashboard/README.md`, and
`docs/dashboard-development-intent.md` (its slice 3 documents empty-area
selection, Recently done's Select story, and selection that scopes Intent).
Start execution from a trunk that contains 448's landing when one exists,
and rewrite its descriptions to this story's model. If this story lands
first, 448 rebases onto it. Its disclosure-content and Review changes
outcomes stay compatible either way. This is no blocking dependency, since
neither story's outcome needs the other's.

## Outside-in proof

| Example (seed Key examples) | Owning slice | Signal |
| --- | --- | --- |
| Inspect B with the Side panel closed leaves no selection; with A selected, B's open and close leave A selected; the control shows open or closed | 1 | rewritten `story-card-selection.spec.ts`: highlight and pressed state unchanged, `aria-expanded` on Inspect story follows |
| Several cards can have detail open; a dependency reference to D opens D's detail, keeps A and C open, and leaves selection alone | 1 | dependency journey (448's split spec, or the one in `story-card-selection.spec.ts`): supplier detail open, earlier details still open, no highlight change |
| Empty-area click toggles selection without opening or closing detail, on Backlog, Taken, and Recently done cards | 1 | `story-card-selection.spec.ts` on an active and a done card: highlight on and off, detail region count unchanged |
| Keyboard Enter and Space on **Select story** toggle selection on a Backlog card | 1 | same spec: focus the control, press keys, check `aria-pressed` and highlight, no detail |
| A Taken story held elsewhere, selected on its card, gives Intent its branch's CI status | 1 (reused) | `intent-ci-status-story.spec.ts` stays green; its `toggleOnDevelopment` selects by empty-area click on published Taken stories without a local workspace |
| Opening A's terminal selects and highlights A; Intent names A; B's final report moves both | 2 | Side panel journey (`side-panel-content-switching.spec.ts`): highlight follows each opening, `data-selected-story` on Intent follows |
| Panel shows B's terminal; click A's empty area: A selected, B's terminal stays | 2 | same journey: terminal region still shows B, A highlighted |
| A done story's Review changes highlights it, and Intent's lens shows it; clicking its empty area clears and the review stays | 2 | `intent-story-completed.spec.ts` (or its `support/intentCompletedStory.ts`) opening the review instead of clicking the heading, then clearing |
| Closing the panel, or opening an ad-hoc session, clears highlight and Intent's lens; CI judges trunk | 2 | `sessions-sidebar-navigation.spec.ts` close step and the rewritten "Sessions sidebar" step of `story-card-selection.spec.ts`: no highlight, no `data-selected-story` |
| One page-wide selection: a project that does not own it has none | 2 | focused unit or page check on `useStorySelection` across two projects (`project-selection.spec.ts` journey if no cheaper boundary exists) |
| Terminology in ADR 0008 and maintained docs | 2 | review of the named documents, plus `npm test`'s documentation checks |

Command for focused specs:
`env -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts --reporter=list <specs>`

Consumer trace: before each slice's proof, run the installed
`consumer-trace.mjs` with `--term 'story-card-selected' --term 'in-side-panel'
--term 'Select story' --term 'Hide detail' --term 'data-selected-story'
--term 'expectSelected'`. Dispose of every listed consumer. Known consumers
at `0145597e` include `responsive-session-access.spec.ts`, which expects
`story-card-selected` on a starting card whose detail is open and becomes an
inspection assertion. They also include
`session-workspace-retirement(-attach).spec.ts`, which expects a story card's
`in-side-panel` and becomes highlight. The Intent helpers
`support/intentStoryPage.ts` and `support/intentCompletedStory.ts` and
`intent-story-changes*.spec.ts` select by heading click, which keeps
working.

Local gates: this changes page state that the whole dashboard reads, so run
the full `npm test` (Homebrew Bash 5 first on PATH, under `caffeinate -i`)
and the whole dashboard Playwright suite on the final state before
publishing. Apply the repository's
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
as written.

## Ordered slices

### 1. Inspection and card selection are separate
Type: Behavior
Status: planned
Proof: rewritten `story-card-selection.spec.ts` (kept under 250 lines, and
split by journey if needed), the dependency journey, and
`responsive-session-access.spec.ts` with its starting-card assertions on
inspection. `intent-ci-status-story.spec.ts` and the Intent helper specs
are reused unchanged.

Behavior: Backlog, Taken, and Recently done cards each have **Select
story**. The developer toggles it by pointer or keyboard, or clicks a card's
empty area. That story becomes the page's selected story and is
highlighted, or the selection clears, and no detail opens or closes.
**Inspect story** opens and closes only its own card's detail, and several
can be open. Following a dependency reference opens the target's detail and
leaves the selection alone. Update the matching wording in
`dashboard/README.md` and `docs/dashboard-navigation.md` (Inspect,
selection, pale fill).

Interim: the selection is still per project and does not follow the Side
panel, and story cards keep the `in-side-panel` outline. Slice 2 replaces
both.

### 2. The Side panel sets and clears the selected story
Type: Behavior
Status: planned
Proof: `side-panel-content-switching.spec.ts`,
`sessions-sidebar-navigation.spec.ts`,
`session-workspace-retirement(-attach).spec.ts`, and
`intent-story-completed.spec.ts` with the examples above. The ad-hoc step
of `story-card-selection.spec.ts` now expects selection to clear. Add a
cross-project selection check. Run the full local gates.

Behavior: opening a story's terminal, final report, or review selects and
highlights that story, and Intent reads it. Opening another story's content
moves the selection there. Closing the panel, closing it by marking done or
deleting, or showing an ad-hoc session clears the selection. A card toggle
still selects without changing the panel. The selection is one page-wide
project and story. Story cards lose the `in-side-panel` outline, so the
highlight is their only selection mark. Add **Selected story**,
**Highlight**, and **Inspect** to ADR 0008's Dashboard UI concepts. Align
`dashboard/README.md`, `docs/dashboard-navigation.md`,
`docs/dashboard-development-intent.md` (selected story and CI status), and
the Side panel description in `dashboard/AGENT-LAUNCH-TERMINALS.md` with the
story's terms. Remove wording that ties selection to inspection or to a
card mark for Side panel content.

## Plan review

Refinement was not needed. The two slices each own one proof loop. The
first is how cards toggle selection and inspection. The second is how the
Side panel changes selection, and it completes the terminology. Slice 1's
interim behavior is named, and slice 2 replaces it. This review found no
remaining slice-specific concern.
