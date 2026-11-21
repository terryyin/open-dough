# Get fast proof of Intent source browsing, pinned links and detours

**Identity:** SEED-413#speed-intent-source-browsing-and-detours
**Source:** [Get fast proof of Intent source browsing, pinned links and detours](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-source-browsing-and-detours)
**Split from:** SEED-413#speed-intent-source-and-story-reading (plan `755`, former Slices 3–4) on 2026-11-21 at its delivered Slice 2 boundary

## Goal and scope

Dashboard maintainers get fast Vitest feedback that a developer can browse
Gherkin and code sources at the chosen scope, line and revision, follow
canonical and plan links safely, open Project Intent or a selected story, and
resume the exact reading place and focus after a detour through Review or
another view. Move the 23 legacy Playwright cases across 16 files:
- `dashboard/frontend-tests/navigation/`: `source-navigation` and
  `source-navigation-refused` (2 files, 3 legacy cases)
- `dashboard/frontend-tests/intent/`: `intent-entry-folder-summaries`,
  `intent-entry-folder-summaries-folders`, `intent-gherkin-groups`,
  `intent-gherkin-layout`, `intent-code-browse-java`, `intent-purpose-case`,
  `intent-home-activation`, `intent-project-visit`,
  `intent-project-visit-selection`, `intent-read-reuse`,
  `intent-reading-place`, `intent-recent-stories`, `intent-selection-reads`,
  and `intent-story-review-return` (14 files, 20 legacy cases)
Switch `dashboard/frontend-tests/intent/intent-candidates-publication.ts` to
production `IntentPageProviders`, and retire spent `dashboard/test-support/`
modules whose last consumer moves (`frontendSourceNavigation.ts`,
`intentEntryFolderSummariesFixtures.ts`, and `putFrontendFolderSources` on
`frontendRepositorySources.ts`).

## Decisions and existing owners

- Apply the [campaign acceptance](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#acceptance-shared-by-the-eight-stories),
  [North Star](../../NORTH-STAR.md),
  [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md),
  [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md),
  and [frontend entry guidance](../../../dashboard/frontend-tests/README.md#which-entry-a-case-uses).
  Use `mountComponent`, `pageMakeMe.mjs` (including typed
  `makeMe.anIntentLocationsAnswer` landed by
  `SEED-413#speed-intent-source-and-story-reading`), and colocated page
  objects under `dashboard/frontend-tests/intent/` and
  `dashboard/frontend-tests/navigation/` without `actSettled`, React `act`, or
  `IS_REACT_ACT_ENVIRONMENT`.
- Reuse `ProjectIntentReading` and `IntentPerspective` for their respective
  scopes, `IntentPageProviders` (`dashboard/src/IntentPerspective.tsx`) for
  page-owned reading place and mode, and `IntentReadSourceOnPage` for typed
  locations, file, and Candidates replies so production owners keep cache keys,
  cancellation, and Retry.
- Export `SourceHighlighterOnPage` (`Context<typeof highlightSourceLines>`) on
  `dashboard/src/sourceSyntax.ts` (consumed by
  `dashboard/src/SourceCodeReading.tsx`) so mounted Java plain-text fallback
  cases can supply a failing highlighter directly without module-request
  interception wrappers.
- For pinned/refused source links, exercise pure URL/refusal rules
  (`resolveRepositoryBaseUrl`, `sourceLink`) directly and mount `StoryCard` +
  `StoryDetail` over `enrichPreparation` (`dashboard/src/workPreparationView.ts`)
  for rendered canonical/plan URLs and non-clickable unsafe/invalid text,
  keeping one representative popup navigation check in
  `e2e/navigation/source-navigation.spec.ts`.
- Size every slice to a single component seam and 2–5 spec files (avoiding the
  18-path multi-seam bundle that overran former Slice 3 in `plan 755`; note
  that any spec file containing JSX mount wrappers must use `.tsx` or move JSX
  into a `.tsx` colocated page helper so `tsc --noEmit` passes). Capture the
  16-file / 23-case two-worker legacy baseline with
  `OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD` in Slice 1 before replacing the
  first legacy spec, and compare the completed 16-file cohort in Slice 6.

## Local gate

On macOS run from an awake machine on AC using `caffeinate -s -i` under the
maintained [sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
Use two workers, the default test timeouts, explicit path selections, and the
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Run `npm run typecheck:dashboard` for changed production/types and run named
E2E companions when shared contracts or popup/focus boundaries change.

## Decisive premises and proof

- At `f981fc912` on 2026-11-21 (macOS on AC, `--workers=2`), `intent-source-target-recovery.spec.ts` and `intent-revision-update-failures.spec.ts` passed 5 cases proving the typed production reader retains a pinned file and switches after Retry, and replacing separate mode/reading providers in `intent-candidates-publication.ts` with `IntentPageProviders` passed all 12 cases across its 8 consuming specs in scratch.
- At `c7c1a5b38` on 2026-11-21, `caffeinate -s -i npm run --silent test:dashboard:frontend -- <16 scoped files> --list --reporter=line` listed exactly `23` legacy `chromium` cases across the `16` scoped files.

| Promise | Owning proof |
| --- | --- |
| Canonical and plan links use the inspected revision, external/unsafe/invalid targets stay distinct, and popup activation is proved in E2E | Slice 1 (`navigation/source-navigation*` + `e2e/navigation/source-navigation.spec.ts` + retire `frontendSourceNavigation.ts`). |
| Entry and folder summaries aggregate nested test counts and expand or select cleanly | Slice 2 (`intent-entry-folder-summaries*` + retire `intentEntryFolderSummariesFixtures.ts` and `putFrontendFolderSources`). |
| Gherkin groups select scenarios and outlines while tree and feature panes scroll independently | Slice 3 (`intent-gherkin-groups`, `intent-gherkin-layout`). |
| Missing Java grammar falls back to readable plain text and Candidates cases open at their exact source line | Slice 4 (`SourceHighlighterOnPage` + `intent-code-browse-java`, `intent-purpose-case`). |
| Project Intent activation, project visits, cached reads, and pending revisions/selections keep the applicable source over `IntentPageProviders` | Slice 5 (`IntentPageProviders` in `intent-candidates-publication.ts` + `intent-home-activation`, `intent-project-visit*`, `intent-read-reuse`, `intent-selection-reads`). |
| Reading place, recent stories, and keyboard Review detours restore the story, nested file, reading position, and focus | Slice 6 (`intent-reading-place`, `intent-recent-stories`, `intent-story-review-return` + 16-file two-worker before/after comparison). |

## Slices

### 1. Pinned and refused source navigation links use the inspected revision and keep external, unsafe and invalid targets distinct

Type: Behavior
Status: planned

Capture the 16-file / 23-case legacy Playwright baseline at `--workers=2` with
`OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD` before replacing the first legacy
file. Move `dashboard/frontend-tests/navigation/source-navigation` (1) and
`source-navigation-refused` (2) to plain Vitest over `sourceLink` /
`resolveRepositoryBaseUrl` and mounted `StoryCard` + `StoryDetail` with
`enrichPreparation`. Add a representative popup journey in
`e2e/navigation/source-navigation.spec.ts`, check callers, and delete
`dashboard/test-support/frontendSourceNavigation.ts`.

**Proof.** Canonical and plan links point at the inspected revision URL and
open in a popup in E2E; external links stay separate from snapshot files; and
unsafe (`javascript:`, traversal) or missing targets render as non-clickable
text.

### 2. Intent entry and folder summaries aggregate nested test counts and select or expand cleanly

Type: Behavior
Status: planned

Move `intent-entry-folder-summaries` (2) and
`intent-entry-folder-summaries-folders` (1) over `ProjectIntentReading`,
`IntentReadSourceOnPage`, and `makeMe.anIntentLocationsAnswer`. Check callers
across `dashboard/frontend-tests/` and `e2e/` and retire
`dashboard/test-support/intentEntryFolderSummariesFixtures.ts` and unused
`putFrontendFolderSources` on `dashboard/test-support/frontendRepositorySources.ts`.
Retain `e2e/intent/intent-gherkin-browse.spec.ts` and
`e2e/intent/intent-code-browse-sources.spec.ts`.

**Proof.** Entry and nested folder rows aggregate test counts accurately, and
clicking names vs disclosure toggles selects or expands the intended scope.

### 3. Gherkin groups select scenarios and outlines while tree and feature panes scroll independently

Type: Behavior
Status: planned

Move `intent-gherkin-groups` (1) and `intent-gherkin-layout` (1, keeping any
JSX container helper in a `.tsx` file) over `ProjectIntentReading` and
`IntentReadSourceOnPage`.

**Proof.** Scenario and Scenario Outline items select and highlight their block,
and the Intent browser tree and Gherkin feature pane keep independent scroll
positions inside a constrained viewport height.

### 4. Java source fallback keeps readable plain text on grammar failure and Candidates cases open at their exact source line

Type: Behavior
Status: planned

Export `SourceHighlighterOnPage` on `dashboard/src/sourceSyntax.ts` (consumed
by `dashboard/src/SourceCodeReading.tsx`), and move `intent-code-browse-java`
(1) and `intent-purpose-case` (1) over `ProjectIntentReading` /
`IntentPerspective`, `IntentPageProviders`, and `IntentReadSourceOnPage`.

**Proof.** A failing Java syntax highlighter leaves the `.java` source plain
and readable without erroring, and activating an Optimization Candidates case
opens its exact repository file and line anchor.

### 5. Project Intent activation, project visits, cached reads and pending selections keep the applicable source

Type: Behavior
Status: planned

Switch `dashboard/frontend-tests/intent/intent-candidates-publication.ts` to
production `IntentPageProviders` and verify its existing Vitest consumers
(`intent-candidates-read-recovery.spec.ts`, `intent-revision-*.spec.ts`,
`intent-source-target-recovery-mounted.spec.ts`). Move
`intent-home-activation` (1), `intent-project-visit` (2),
`intent-project-visit-selection` (1), `intent-read-reuse` (2), and
`intent-selection-reads` (1), retaining
`e2e/intent/intent-project-visit-ci.spec.ts`.

**Proof.** Selecting a story opens its own view while Project Intent reads the
published source, cached files avoid duplicate reads, pinned-file failures
name their cause and Retry to the right revision/source, and while a later
revision or selection is pending Purpose keeps the applicable source.

### 6. Reading place, recent stories and Review detours restore the nested file, reading position and focus

Type: Behavior
Status: planned

Move `intent-reading-place` (2), `intent-recent-stories` (2), and
`intent-story-review-return` (2) over `IntentPageProviders`,
`IntentPerspective`, and Review's open/close and focus wiring (carrying the
keyboard header-count Review-return focus handoff to `e2e/intent/` only if the
full page is required to observe that header trigger, keeping a single owner).
Audit remaining `dashboard/test-support/` consumers across the 16 files and
record the two-worker before/after comparison including preparation and E2E
runtime.

**Proof.** With a nested Changed tests file selected, visiting Review by
keyboard and returning restores the selected story, file, scroll position, and
focus without extra reads; switching projects resets the reading place; and
the 16-file Vitest suite runs faster at two workers than its recorded legacy
baseline.
