# Recognize Intent folders and read their proof

**Identity:** SEED-420#recognize-intent-folders-and-read-proof
**Source:** [Recognize Intent folders and read their proof](../../seeds/SEED-420-unified-intent-review.md#recognize-intent-folders-and-read-proof)

A developer reviewing a story or browsing a published project in Intent can
locate configured Intent locations in the shared repository file tree through
collapsed-ancestor and persistent-root cues on clean folder-name rows, and read
a root's test configuration and matching files or a nested folder's scoped CI
proof with its evidence basis identified.

The
[SEED-420#browse-one-selectable-review-tree](https://github.com/terryyin/open-dough/blob/07dad9d62ee48012ee757bf2e6858f2d7ebfeed6/.planning/seeds/SEED-420-unified-intent-review.md#browse-one-selectable-review-tree)
story delivered the single uncompacted repository path tree, with a path
view for regular folders and Summary for Intent folders. Replacing
**Selected story only** with **Intent only** and
**Changes only** belongs to
[SEED-420#filter-review-files](../../seeds/SEED-420-unified-intent-review.md#filter-review-files),
and expanding whole-project inventory beyond configured Intent locations belongs
to
[SEED-420#browse-the-project-at-a-revision](../../seeds/SEED-420-unified-intent-review.md#browse-the-project-at-a-revision).

## Execution context

- Story Branch Mode in this launch's owned worktree
  `recognize-intent-folders-and-read-their-proof` on
  `codex/recognize-intent-folders-and-read-their-proof`, targeting `origin/main`
  with publisher `dashboard-territory.local-open-dough` and agent Eimi-chan.
- Starting revision `4256182d1f0b345a9157506a96998acde7e7f78b`. The established
  claim and initial execution branch base were
  `77fbfd3105b3b5112ba30f4e3f587a45d39178f9`. Readiness had changed since
  review. Checkout setup ran `npm ci` and `npm run typecheck:dashboard` here.
- Codex observes the execution branch with the verified GitHub Actions
  `ci.yml` workflow named CI for `terryyin/open-dough`.

## Current decisions

- [Dashboard UX/UI North Star, Review in Intent](../../../docs/dashboard-ux-ui-north-star.md#review-in-intent)
  places file navigation in one sidebar tree, keeps browsing filters independent
  of CI proof, and requires proof views to identify the measured builds and
  comparison endpoints. The slices keep tree rows restricted to folder names
  and state while surfacing root configuration and scoped proof in Summary.
- [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#domain-concepts-and-relationships)
  and [ADR 0001, Ubiquitous language](../../../docs/adrs/0001-ubiquitous-language-accepted.md#dashboard-product-concepts)
  give Intent one scope across project or story, revision or comparison, and
  path, separating maintained procedures (configured Intent locations, test
  types, patterns, and matching files) from observed CI results and keeping
  folder expansion and visual cues as disposable derived presentation state.
- [ADR 0002, Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#2-whole-product-focus)
  prefers one representation per domain concept. Proudly Found Elsewhere:
  extend [IntentSummaryView](../../../dashboard/src/IntentSummaryView.tsx) and
  [intentLocationExplanation](../../../dashboard/src/intentLocationExplanation.ts)
  with root configuration details, reuse
  [locationSelectsRepositoryPath](../../../dashboard/src/intentLocationSelection.ts)
  to restrict Summary's matching-file inventory under mixed-content roots,
  reuse [IntentScopeProof](../../../dashboard/src/IntentScopeProof.tsx) and
  [intentTreeComparison](../../../dashboard/src/intentTreeComparison.ts) for
  scoped proof and compared-entry root cues. `IntentBrowserTree` renders
  `IntentStoryFileTree` for stories and `IntentLocationGroup` for Project
  Intent. Move Project Intent onto the selectable tree and migrate the
  `IntentLocationHeader` metadata still used on story root rows.
- Reuse the narrow-only dismissal that already exposes a chosen file in
  [FilesSidebar](../../../dashboard/src/FilesSidebar.tsx) when a tree
  selection opens Summary. Folder disclosure stays independent of selection.
- Follow the [Architectural North Star](../../NORTH-STAR.md):
  - [Make production code directly testable instead of growing test support](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support):
    keep the ancestor/root cue rule in a small typed production module and pass
    typed props into `IntentSummaryView` and the shared tree component; add no
    new wrappers in `dashboard/test-support/`, restricting edits there to
    existing E2E page objects (`pageObjects: true` for `e2e/`, `false` for
    `dashboard/frontend-tests/`).
  - [Act as soon as the page allows](../../NORTH-STAR.md#act-as-soon-as-the-page-allows):
    drive mounted components with `userEvent` and retrying `expect.element` /
    `expect.poll` assertions without `act` wrappers.
  - [Plain Vitest for unit tests; Playwright only for E2E](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e):
    prove Summary configuration, matching-file scoping, and folder cues in
    Vitest Browser Mode (`dashboard/frontend-tests/`) and pure Node Vitest
    (`dashboard/backend-tests/`) where applicable, using Playwright (`e2e/`)
    only for end-to-end Project Intent and story journeys.
- Reconcile cleanly whether `SEED-420#filter-review-files` lands before or
  after this plan: derive the collapsed-ancestor cue from configured Intent
  roots present in the currently shown tree (including empty or unsupported
  roots when unfiltered, and omitting unchanged roots when change filtering is
  on), and filter Summary's listed files by `locationSelectsRepositoryPath`
  (admitting a rename when either path matches) on top of whichever shown or
  overlaid inventory the browser supplies.
- Keep edited files within the 250-line limit. At the supplier integration,
  `IntentBrowser.tsx` is 200 lines, `IntentStoryFileTree.tsx` 162 lines,
  and `StoryReviewFileTree.tsx` 218 lines. Recheck these files and the
  affected proof at startup, extracting Intent folder-row cue presentation
  into a cohesive module if needed.

## Story obligations

### G1. Open folder Summary from the Files drawer

Reported: slice 1 — "Trunk amendment f97792f9b requires Summary selection to expose the reader at phone width in both views."
Story clause: "When Files is a drawer, choosing a configured Intent root or nested folder that opens Summary closes Files so the reader is immediately available."
Disposition: proved by slice 4: `intent-files-drawer.spec.ts` opens Files and discloses a root before selecting its Summary and a nested Summary in both Project and Taken story readings, at 390 and 1280 pixels. It observes the selected Summary path and drawer or docked visibility after each choice.

### G2. Select an ancestor of empty Intent roots

Reported: slice 2 — "A visible ancestor containing only empty or unsupported configured roots incorrectly rendered a missing-revision notice."
Story clause: "Selecting a folder outside configured Intent locations, including an ancestor above an Intent root, shows the minimal folder view naming its path."
Disposition: proved by slice 2: `intent-story-folder-cues.spec.ts` selects the ancestor in a mounted story tree and reads its path. `intent-revision-apply.spec.ts` still observes the missing-revision notice for a removed file.

## Decisive premises and baseline

Observed on 2026-11-25 at `0b7b8984e011e3bb6e8efbf590750c6b161d8f2b` in the
owned preparation worktree on macOS with AC power (`npm ci` installed). The
supplier's story tree is still in `Taken`; these observations settle the
existing Summary, CI-cue, and Project Intent consumers this plan builds on.

| Consuming operation and profile | Literal observation | Result and planning consequence |
| --- | --- | --- |
| Mounted Vitest Browser Mode checks for folder selection, exclusive group headers, CI cues, and Summary proof | `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run test:dashboard:frontend -- dashboard/frontend-tests/intent/intent-entry-folder-summaries.spec.ts dashboard/frontend-tests/intent/intent-gherkin-groups.spec.ts dashboard/frontend-tests/intent/intent-story-ci-cues.spec.ts dashboard/frontend-tests/intent/intent-summary-ci-proof-table.spec.ts dashboard/frontend-tests/intent/intent-summary-story-comparison-rows.spec.ts` | 15 passed (17.76s). `IntentSummaryView` currently renders optional `label`, `path`, file count, and `locationExplanation`, while `kind` and `include` patterns live only in `IntentLocationHeader`. `intent-gherkin-groups.spec.ts` asserts exclusive single-location collapse and `.intent-location-header` full-width bands, which slice 4 replaces. |
| Mounted candidate-record open, CI drill-down, and kept-judgment Summary evidence labels | `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run test:dashboard:frontend -- dashboard/frontend-tests/intent/intent-candidates-open.spec.ts dashboard/frontend-tests/intent/intent-ci-comparison-drilldown-relative.spec.ts dashboard/frontend-tests/intent/intent-summary-ci-proof-kept.spec.ts` | 3 passed (6.46s). Single-run `EvidenceNamed` / `EvidenceKept` and candidate-return reveal already run through `IntentSummary` and `useLocationOpenFolders` with no extra CI or file read. |
| Discrimination of Summary comparison evidence-basis assertions on root vs nested folders | Temporarily suppressed `<ComparisonNamed evidence={evidence} />` in `dashboard/src/IntentScopeComparisonFrame.tsx` and ran `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run test:dashboard:frontend -- dashboard/frontend-tests/intent/intent-summary-story-comparison-rows.spec.ts --grep 'nested Summary|Summary labels'`, then restored and reran. | With `<ComparisonNamed>` suppressed, the root `Summary labels` case failed (`expected [] to deeply equal [...]`) while `nested Summary renders precise endpoint rows` stayed green because it did not assert `comparisonLabels` on the subfolder; after restoration all 3 selected cases passed. Slice 1 adds explicit subfolder evidence-basis assertions in mounted Vitest specs for both single-run and comparison modes. |
| End-to-end Project Intent Summary proof, `kind` and `sources` headers, and unusable locations | `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run test:e2e -- e2e/intent/intent-summary-ci-proof.spec.ts e2e/intent/intent-code-browse.spec.ts e2e/intent/intent-code-browse-sources.spec.ts e2e/intent/intent-gherkin-unusable.spec.ts --workers=1 --reporter=line` | 4 passed (45.0s). Confirmed `intentCodeBrowsePage.ts` and the `intent-code-browse*` / `intent-gherkin-*` E2E specs currently assert inline `label`, `kind`, and `include` patterns on `.intent-location-name` and navigate via `intentGroupToggle` without opening parent folders. Slices 3 and 4 isolate those page-object helpers and move header metadata assertions to the selected root's Summary. |

## Outside-in proof

| Promise | Slice | Observation |
| --- | --- | --- |
| Root Summary shows optional label, path, declared test type (`kind` or `sources` `syntax`), configured `include` patterns, matching Intent files only, problem explanation when empty/unsupported, and proof; nested folder Summary shows folder-scoped proof and matching files with evidence basis identified and no root-only config | 1 | Mounted Vitest Browser Mode spec rendering `IntentSummary` / `IntentPage` with typed `IntentLocation` variants (`kind` only, `kind` + `include` + `label`, `sources` with and without `syntax`, `unsupported-kind`, `no-matching-files`, and a mixed-content root holding non-matching sibling files such as `Distribution/src/SKILL.md` plus a matched rename). Assert root config details, exclusion of non-matching files from count and child rows, and nested subfolder Summary (`path !== location.path`) omitting root config while rendering `EvidenceNamed` (single-run) and `comparisonLabels` / `WholeStoryNote` (story comparison). |
| Story review tree styles open/closed Intent roots distinctly, rolls a related cue onto collapsed non-root ancestors and intervening collapsed folders in the shown tree, suppresses false ancestor cues when change filtering hides Intent roots, and keeps tree rows to folder names and state | 2 | Pure Node Vitest check of the folder-cue derivation (`e2e`, `e2e_test/features`, `e2e_test/packaged/features`, nested roots, empty roots, filtered subtrees) plus mounted Vitest Browser Mode story-tree journey exercising collapsed ancestor → expanded ancestor + intervening collapsed folder → open/closed root, light/dark themes, narrow/desktop widths, coexistence with selection, `containsChanges`, and compared-entry CI cues/words, absence of inline types/patterns on rows, change-filter toggle removing/restoring the ancestor cue, and regular ancestor folder view vs root/subfolder Summary. |
| Shared E2E Project Intent page-object helpers navigate nested locations without coupling unrelated journeys to `.intent-location-header` | 3 | Existing E2E callers (`intent-summary-ci-proof.spec.ts`, `intent-file-purpose-proof.spec.ts`, `intent-ci-proof-units.spec.ts`, `intent-scope-prior-build-states.spec.ts`) pass unchanged against current Project Intent while page-object helpers support ancestor expansion and path-based location lookup. |
| Project Intent without a selected story uses the same shared folder tree, cues, independent disclosure, empty/unsupported roots, and root/subfolder proof reading, retiring the location-group accordion | 4 | Mounted Vitest Browser Mode Project Intent specs (`intent-entry-folder-summaries.spec.ts`, `intent-gherkin-groups.spec.ts` replaced/updated for shared tree cues and independent disclosure, `intent-candidates-open.spec.ts`) and E2E Project Intent journeys (`intent-code-browse.spec.ts`, `intent-code-browse-projects.spec.ts`, `intent-code-browse-sources.spec.ts`, `intent-gherkin-browse.spec.ts`, `intent-gherkin-unusable.spec.ts`, `intent-summary-ci-proof.spec.ts`) proving collapsed-ancestor and root cues, non-root ancestor minimal view, root config + matching files in Summary, nested folder single-run proof with run/revision/branch/ancestor/newer-tree labels, and candidate/CI-link reveal. |
| Selecting a root or nested folder that opens Summary dismisses narrow Files in Project Intent and story review. Disclosure keeps Files open. A docked tree stays visible after selection. | 4 | Extend `intent-files-drawer.spec.ts` through the mounted Project Intent and story entry points. Exercise disclosure and path-name selection at phone width and verify the Summary and sidebar visibility at a docked width. |

## Slices

### 1. Show root test configuration and matching-file scope in Summary

Type: Behavior
Status: done
Proof: Mounted Vitest Browser Mode Summary checks in `dashboard/frontend-tests/intent/`
covering `kind`, `sources`, mixed-content roots, empty/unsupported roots, and
nested-folder single-run and comparison evidence basis, plus existing
`intent-summary-*` specs.

When the selected path is a configured Intent root (`path === location.path`),
render its declared configuration in `IntentSummaryView`: for a `kind`
location, its `kind` and any `include` patterns; for a `sources` location,
each source entry's optional `syntax` alongside its `include` patterns,
preserving optional `label` and `locationExplanation` when the root has no
matching files or an unsupported kind. When the selected path is a folder
inside a configured location (`path !== location.path`), omit root-only label,
test-type, and pattern lines while keeping the folder path, matching file
count, and `IntentScopeProof` with its single-run or comparison evidence
labels.

Filter the file list passed to `IntentSummary` to paths under the selected
scope that the owning `IntentLocation` admits (`locationSelectsRepositoryPath`,
admitting a rename when either path matches), so non-matching repository files
under a broad root such as `Distribution/src/SKILL.md` do not inflate the
matching count or appear as `no CI result` child rows in Summary.

Accepted proof (checked from the execution worktree under the plan's macOS guard):

- The mounted `intent-summary-location-config.spec.ts` builds declared locations
  and a pinned mixed inventory. Root content, empty and unsupported
  explanations, counts, source entries, scoped nested rows, and both rename
  memberships pass with
  `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run test:dashboard:frontend -- dashboard/frontend-tests/intent/intent-summary-location-config.spec.ts --workers=1`.
- The mounted `intent-summary-ci-proof-table.spec.ts`,
  `intent-summary-story-comparison-rows.spec.ts`, and
  `intent-story-compare-evidence.spec.ts` assert nested single-run,
  comparison endpoint, and whole-story evidence. The 60 selected Summary and
  affected caller cases plus the 2 comparison evidence cases passed.
  The independent refactor moved the first two checks into dedicated
  nested Summary cases. All 10 cases in those two specs passed again.
- `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run test:dashboard:backend -- dashboard/backend-tests/intent/intent-story-overlay.spec.ts --workers=1`
  passed 7 cases, including a cross-location rename with one repository row
  and a file in each applicable Summary.
- Eight E2E cases passed for the real Git comparison, former-path Summary
  links, scoped CI artifact reads, sources, and CI proof units and basis.
  Literal commands, selection, and observation locations are in
  `slice-1-report.md` and `slice-1-*.log.run.json` in the worktree's Git
  `open-dough/evidence` directory. Dashboard typecheck and full lint passed.

### 2. Style collapsed ancestors and persistent Intent roots in the story review tree

Type: Behavior
Status: done
Proof: Direct Vitest unit cases for the folder-cue model and mounted Vitest
Browser Mode story-tree specs for ancestor rollup, intervening collapsed
folders, open/closed roots, change-filter cue suppression, and selection/change/CI
cue coexistence across light and dark appearances.

Introduce one pure folder-cue model over the shown tree's folder nodes,
collapsed folder set, and configured `IntentLocation` list:

- A folder whose path is a configured Intent root in the shown tree carries
  the Intent root cue whether open or closed. Keep configured roots with zero
  matching files or an unsupported kind present in the tree when change
  filtering is off.
- A non-root folder carries the collapsed-ancestor cue when it is collapsed
  and at least one configured Intent root is present strictly beneath it in
  the shown tree. Expanding it clears its cue while any still-collapsed
  intervening folder beneath it carries the cue.

Apply the root and collapsed-ancestor styles in the shared folder tree using
the `--location-header` token family so an open or closed root stays visually
distinct from both regular folders and collapsed non-root ancestors, and
coexists with `aria-pressed` selection, `data-contains-changes`, and
`treeLocationComparisonOf` CI cues and words on compared entry roots. Keep
tree folder rows showing only folder names and state, with no inline labels,
test types, or glob patterns. Selecting a non-root ancestor continues to show
the minimal folder view naming its path.

Accepted proof (focused runs on the Story Branch Mode checkout under
`caffeinate -s -i`):

- `intent-folder-cues.spec.ts` observes the derived cues on configured,
  empty, unsupported, ordinary, and filtered paths. The two selected Node
  suites passed all 8 tests.
- `intent-story-folder-cues.spec.ts`, `intent-story-ci-cues.spec.ts`, and
  `intent-sidebar-toggle.spec.ts` mount story and Project readings. They
  observe root persistence, collapsed-ancestor clearing and transfer,
  filter suppression, clean names and counts, independent selection, and
  selection/change/CI cue coexistence at light/dark and narrow/docked widths.
  The 62 selected mounted checks and 10 affected-locator checks passed.
- The one-worker E2E retry passed all 8 cases, including changed-file
  ordering, former-path reveal, exact root lookup at a pinned revision, and
  the story-card journey. The story-card helper waits for the real configured
  root before arranging nested disclosure, since the provisional tree can
  otherwise be replaced while it works.
- The independent refactor consolidated CI count styling and kept separate
  mounted observations for empty ancestors and unsupported roots. The 21
  focused checks in `refactor-2-folder-cues.log.run.json` passed.
- Dashboard typecheck passed. Exact selections, setup, and observations are
  in `slice-2-report.md` and `slice-2-*.log.run.json` under the worktree's
  Git `open-dough/evidence` directory.

### 3. Isolate Project Intent page objects from location-group selectors

Type: Structure
Status: done
Proof: Re-run `e2e/intent/intent-summary-ci-proof.spec.ts`,
`e2e/intent/intent-file-purpose-proof.spec.ts`,
`e2e/intent/intent-ci-proof-units.spec.ts`, and affected mounted Intent specs
with external product behavior unchanged.

Update the shared Project Intent helpers in
`dashboard/test-support/intentPerspectivePage.ts` and
`dashboard/test-support/intentCodeBrowsePage.ts` (and mounted test helpers in
`dashboard/frontend-tests/intent/` where needed) so expanding or selecting a
location path walks any collapsed ancestor folders along that path instead of
assuming flat `.intent-location-toggle` / `.intent-location-body` wrappers in
every caller. Keep external behavior unchanged in this slice so slice 4 can
switch Project Intent onto the shared folder tree and update only assertions
whose promised UI changed.

Accepted proof (focused one-worker runs under `caffeinate -s -i`):

- The 9 selected E2E checks passed. The real-Git
  `intent-story-changes.spec.ts` closes the ancestor and uses the shared
  location actions to both select and disclose the exact configured root.
  Project Summary, file Purpose/Proof, and prior-build cases exercise the
  same helpers with the existing flat location structure.
- The mounted Summary and homepage cases preserve scoped reading, keyboard
  return, focus, and disclosure across both entry points. The targeted
  14-case run verified the resolved button after its accessible name changes.
  The separate system-appearance case and dashboard typecheck passed.
- The Story-card journey uses an existing real-Git Take fixture and waits on
  visible UI state. The independent Review/Back and remembered-file cases
  finished in 21.9 s and 15.8 s in the isolated test command under the
  unchanged 30 s timeout, preserving terminal and inventory observations.
  Literal commands, setup, outcomes, and consumer decisions are in
  `slice-3-report.md` and `slice-3-*.log.run.json` in Git
  `open-dough/evidence`.

### 4. Browse Project Intent in the shared folder tree

Type: Behavior
Status: done
Proof: Mounted Vitest Browser Mode Project Intent tree, cues, and candidate-open
specs, the Files drawer and docked selection checks above, and E2E Project
Intent journeys (`intent-code-browse*.spec.ts`,
`intent-gherkin-*.spec.ts`, `intent-summary-ci-proof.spec.ts`), dashboard
typecheck, and lint.

Render Project Intent (`story === undefined`) through the same shared
selectable folder tree over its configured `IntentLocation` files and empty or
unsupported configured roots at the browsed revision, with top-level folders
starting collapsed and each folder disclosing independently. Apply the same
Intent root and collapsed-ancestor cues, clean folder-name rows, non-root
ancestor minimal folder view, and root/subfolder Summary reading as story
review. Preserve path reveal when opening a location, folder, or file from CI
entry links, Summary child rows, and optimization candidates.

In both views, selecting a configured root or nested folder that opens Summary
closes the Files drawer and exposes the selected Summary. Folder disclosure
keeps the drawer open. In a docked view, Summary opens beside the sidebar.

Retire `IntentLocationGroup.tsx`, any remaining use of
`IntentLocationHeader.tsx`, and superseded rules in `intent-location-group.css`,
`story-review-files.css`, `change-kinds.css`, and `intent-ci-cues.css`. Update
the direct header and exclusive-collapse tests to assert clean folder rows,
ancestor/root cues, independent disclosure, and root configuration in Summary.

Accepted proof (focused one-worker runs under `caffeinate -s -i`):

- `intent-gherkin-groups.spec.ts` and `intent-entry-folder-summaries.spec.ts`
  observe the shared Project tree with configured, empty, and unsupported
  roots, its independent disclosure and selection, cues, counts, and Summary.
  `intent-files-drawer.spec.ts` covers narrow and docked Summary selection in
  both Project and story review, and its existing file actions still pass.
- Scoped single-run and comparison proof, branch and revision labels, and
  candidate return and exact ancestor reveal passed in mounted Chromium.
  The final 15-case batch covered tree, drawer, and candidate observations.
  Two ordinary Review drawer and two retained renderer cases also passed.
- The independent refactor passed 23 mounted cases for the shared reveal
  request, exact ancestor disclosure, Summary, and candidate return, plus
  dashboard typecheck. See `refactor-4-report.md` in the same Git evidence.
- Nineteen distinct E2E cases passed for Project and story navigation,
  configuration in Summary, CI and file drill-down, candidates, and
  accepted-revision reading. Dashboard typecheck passed. See
  `slice-4-report.md` and `slice-4-*.log.run.json` in Git
  `open-dough/evidence` for literal commands, setup, and test locations.

CI consumer repair: Run 45731012531 at `d303911c9` found three selected
comparison proof cases still assuming Files stayed open after a narrow
Summary choice. `intent-story-compare-selected-counts.spec.ts` now reopens
Files through the normal control before choosing the file. All five
selected-count cases and eleven drawer cases passed in the focused mounted
run. Assertions and drawer behavior are unchanged. See
`ci-repair-selected-counts-report.md` in Git `open-dough/evidence`.

## Execution complete

Product advice: Keep the existing order and scope of the file filters and
published-project browsing stories. The shared tree and Summary contracts
are in place for those stories. No product correction is indicated by the
delivered implementation and reviewed local proof.

The review covered the four published implementation commits from
`cf0cd72b7` through `d303911c9` against the seed and the drawer amendment.
Mounted and Node cases drove the implementation. End-to-end checks cover
real Git revisions, artifact reads, and cross-view navigation. The CI repair
above preserves each reviewed product and proof conclusion. Applicable CI
for the repaired branch remains to be observed.
The selected process review is deferred to wrap-up. Intent Coverage is
enabled, and the retired accordion assertions and rewritten Story-card
proof warrant checking the protection of one replaced promise there.

## Verification and plan review

- Run the installed
  [consumer-trace script](../../../.agents/skills/dough-execute-plan/scripts/consumer-trace.mjs)
  before each slice commit with terms `IntentBrowserTree`, `IntentStoryFileTree`,
  `IntentLocationGroup`, `IntentLocationHeader`, `intent-location-header`,
  `intent-location-toggle`, `intent-location-name`, `intent-location-kind`,
  `intentGroupToggle`, `intentLocationName`, `expandIntentGroup`,
  `expectIntentGroupsCollapsed`, and `locationHeaderLook`, recording `run`,
  `reused`, or `excluded` with reasons for each consumer.
- Local verification runs the focused Vitest Browser Mode, Node Vitest, and
  affected E2E specs mapped above, plus `npm run typecheck:dashboard` and
  `npm run lint` when contracts or styles change. On macOS start long checks
  from a fully awake machine on AC power under
  [`caffeinate -s -i`](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
  (or on battery with the lid open under `caffeinate -i`, checking
  `pmset -g log | grep -E 'Entering Sleep|Wake from'` afterwards).
- Follow the
  [shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
  as written, apply `dough-makeme` to test data builders and
  `dough-page-objects` only where `pageObjects: true` (`e2e/`), and run
  `dough-post-change-refactor` before each slice commit.
