# Get fast proof of story changes, Done references, notes and recorded progress

**Identity:** SEED-413#speed-story-changes-notes-and-progress-reading
**Source:** [Get fast proof of story changes, Done references, notes and recorded progress](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-story-changes-notes-and-progress-reading)
**Split from:** SEED-413#speed-intent-source-and-story-reading (plan `755`, former Slices 5–9) on 2026-11-21 at its delivered Slice 2 boundary

This provisional plan is **awaiting story refinement — not ready for slice-plan refinement or execution**.
It resumes through `dough-story-refinement` and plan realignment; the original
slices' readiness does not carry over.

## Goal and provisional scope

Dashboard maintainers get fast Vitest feedback on what a developer sees about a
selected or Done story's Changed tests, historical or live source across Review
modes, Done story references, Story notes, and recorded slice progress,
execution completion, and coverage. Move the 41 legacy Playwright cases across
19 files:
- `dashboard/frontend-tests/intent/`: `intent-read-reuse-story`,
  `intent-sidebar-toggle`, `intent-story-changes-gaps`,
  `intent-story-changes-only`, `intent-story-ci-cues`,
  `intent-story-dark-appearance`, `intent-story-summary-title`,
  `intent-story-views-narrow`, `intent-done-landed-review-mode`,
  `intent-done-project-refresh`, `intent-done-review-modes`,
  `intent-done-source-selection`, `intent-story-notes`, and
  `intent-story-coverage` (14 files, 27 legacy cases)
- `dashboard/frontend-tests/navigation/`: `story-reference-done`,
  `story-reference-done-cancellation`, and `story-reference-done-recovery`
  (3 files, 11 legacy cases)
- `dashboard/frontend-tests/stories/`: `taken-slice-progress` and
  `plan-execution-complete-detail` (2 files, 3 legacy cases)
Also narrow `dashboard/frontend-tests/stories/story-notes-control.spec.ts` to
its project's subscribed notes state without `act` or
`IS_REACT_ACT_ENVIRONMENT`, remove spent `dashboard/test-support/` modules
whose last consumer across `e2e/` and `dashboard/frontend-tests/` has moved,
and record the two-worker before/after comparison for this 19-file / 41-case
cohort.

## Preserved decisions and premises from `plan 755`

- Reuse typed `makeMe.anIntentLocationsAnswer` (`Distribution/tests/support/intentLocationTestData.mjs`)
  landed by `SEED-413#speed-intent-source-and-story-reading`. Supply every
  read through the required typed page entry (plan 759 Slice 1, with the page
  observation's reads added by plan 762 Slice 1) and render the production
  Intent body or `ConfiguredDashboard`, as
  [plan 762's correction](../762-speed-intent-source-browsing-and-detours/PLAN.md#correction-of-the-locations-recovery-test-entry)
  establishes. `loadRepositoryTexts`'s former optional `readFile` and the
  provider composition in `intent-candidates-publication.ts` were the
  test-entry defects that correction removes; do not reuse either.
- No spec or colocated helper builds a test copy of a production
  composition, restates a provider stack, calls a private pipeline such as
  `enrichPreparation` to make props, spies on `fetch`, or calls transport or
  module-state functions. Build replies and recurring inputs with MakeMe
  steps. Record each touched file's production import count before and after;
  keep it to the entry, its typed inputs and stylesheets.
- Follow [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md):
  published source, Done records, and Taken progress retain their actual
  provenance while Story Notes stay on the machine-local project subscription
  (`storyNotesState` and `localSettingState`). Resolve the shared project
  state at the control's production entry so card and Review callers keep
  working while `story-notes-control.spec.ts` supplies the subscribed state
  directly.
- At `f981fc912` on 2026-11-21 (`--workers=2`, `caffeinate -s -i`),
  `story-notes-control.spec.ts` passed proving refresh updates the open list
  and a late read leaves a saved note visible, and the pre-split 37-file /
  71-case legacy cohort ran in `209.26 s` (`376.66` summed case-seconds). At
  `c7c1a5b38` on 2026-11-21, listing the 19 scoped files reported `41` legacy
  `chromium` cases. During story refinement and plan realignment, check slice
  sizes against the 15-minute active-time budget (especially Provisional
  Slices 1 and 3, which carry 16 and 11 legacy cases respectively and will
  likely split along narrower mount boundaries).

## Provisional slices (mapped from `plan 755` Slices 5–9)

### 1. Changed tests stays usable with the selected story's context

Type: Behavior
Status: planned

Capture the 19-file / 41-case legacy baseline at `--workers=2` before
replacing the first legacy file, and move `intent-read-reuse-story`,
`intent-sidebar-toggle`, `intent-story-changes-gaps`,
`intent-story-changes-only`, `intent-story-ci-cues`,
`intent-story-dark-appearance`, `intent-story-summary-title`, and
`intent-story-views-narrow` (8 files, 16 legacy cases), retaining
`e2e/intent/intent-story-changes.spec.ts`.

**Proof.** Selected story only follows the current revision, empty or failed
comparisons name their cause while keeping the tree usable, opened changed
files reuse their diff without rereading published text, and title, accessible
CI cues, dark appearance, narrow layout, and sidebar state hold.

### 2. Done Intent and ordinary Review use the selected historical or live source

Type: Behavior
Status: planned

Move `intent-done-landed-review-mode`, `intent-done-project-refresh`,
`intent-done-review-modes`, and `intent-done-source-selection` (4 files, 5
legacy cases), retaining `e2e/intent/intent-done-project-refresh.spec.ts` and
`e2e/intent/intent-story-completed-source.spec.ts`.

**Proof.** A new Done story replaces the old source only with its own
historical answer, refresh leaves Done Purpose and its reading place readable,
switching Review modes waits for each mode's actual answer without showing the
other selection's text, and ordinary Review clears the captured-run selection.

### 3. Done references lead to the intended story or explain what stopped them

Type: Behavior
Status: planned

Move `navigation/story-reference-done`,
`navigation/story-reference-done-cancellation`, and
`navigation/story-reference-done-recovery` (3 files, 11 legacy cases) over
`useStoryReferenceJourney` and its production notice and destination (keeping
a representative composed reveal in `e2e/` if built-app destination focus
requires it).

**Proof.** Pending, unavailable, expired, and failed Done references stay
distinct, Retry recovers without reading older stories, navigation/pointer/Tab
can supersede a held reveal, and replaced dependency disclosures wait for
opening before reading.

### 4. Story notes update in place and keep the reader's context

Type: Behavior
Status: planned

Move `intent-story-notes` (1 file, 4 legacy cases) and narrow
`stories/story-notes-control.spec.ts` to the subscribed project notes state
without `act` or `IS_REACT_ACT_ENVIRONMENT`, verifying
`e2e/terminals/agent-terminal-lifetime.spec.ts` if shared project wiring
changes.

**Proof.** Note icons and unreadable warnings fit beside the title, opening
and closing Notes preserves the file and focus, line notes record the Intent
subject, refresh updates the subscribed control, and a late older read never
overwrites a saved note.

### 5. Recorded slice progress, execution completion and story coverage expose their actual evidence

Type: Behavior
Status: planned

Move `stories/taken-slice-progress`, `stories/plan-execution-complete-detail`,
and `intent-story-coverage` (3 files, 5 legacy cases) over `SliceProgress`,
`StoryDetail`, and `IntentStoryCoverage`, retaining
`e2e/stories/branch-slice-progress.spec.ts` and
`e2e/stories/taken-execution-complete.spec.ts`. Remove spent
`dashboard/test-support/` modules and record the two-worker before/after
comparison for the 19-file cohort.

**Proof.** Completed slices, plan gaps, product advice, and coverage states
(`absent`, `unavailable`, `failed`, `insufficient`) render from recorded
evidence without reading on disclosure or treating future plan proof as
completed, and the 19-file Vitest suite runs faster at two workers.
