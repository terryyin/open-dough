# Read the whole repository and its CI from Project Intent

**Identity:** SEED-420#browse-the-project-at-a-revision
**Source:** [Read the whole repository and its CI from Project Intent](../../seeds/SEED-420-unified-intent-review.md#browse-the-project-at-a-revision)

With no story selected, a developer can start from the measured project CI
overview, read the project’s full tracked tree and source at the shown
published revision, and return through **Home**. The plan uses the shared
Project Intent tree, folder cues, and filters from the suppliers recorded
in the seed. Revision selection continues through **Show latest**. An
arbitrary revision picker, new CI runs, changes to story review, and the
migration of existing published Intent and attribution readers remain
outside this plan.

## Current decisions

- [Dashboard UX/UI North Star, Review in Intent](../../../docs/dashboard-ux-ui-north-star.md#review-in-intent)
  supplies the shared file sidebar, project **Home**, and the browsing-only
  **Intent only** filter. Project scope omits **Changes only**. Keep CI
  overview and file Proof on their existing measured evidence, independently
  of which files the browser shows.
- [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#domain-concepts-and-relationships)
  and [ADR 0001, Ubiquitous language](../../../docs/adrs/0001-ubiquitous-language-accepted.md#dashboard-product-concepts)
  keep source and proof within one Intent scope and distinguish a published
  revision from a measured build. The selection, filter, and disclosure
  belong to [the reading place](../../../dashboard/src/pageIntentReading.tsx).
- [ADR 0002, Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#2-whole-product-focus)
  favors sharing the existing path model. Proudly Found Elsewhere: use the
  story supplier's tracked-tree and literal blob operations where they are
  revision-independent, the shared tree from the folder supplier, and the
  shared Intent membership rule from the filter supplier. Story comparison
  admission stays with story review. Reuse
  [ProjectIntentReading](../../../dashboard/src/ProjectIntentReading.tsx),
  [the selected file reader](../../../dashboard/src/useIntentFileRead.ts),
  [IntentFileProofView](../../../dashboard/src/IntentFileProofView.tsx), and
  [IntentCiStatus](../../../dashboard/src/IntentCiStatus.tsx) for the project
  journey. The current generic `file-at` route enforces Board and configured
  Intent reachability. Use a project-browse read through the same
  authenticated boundary with project and tree admission specific to that
  operation.
- [Architectural North Star, Share one refresh for published Dashboard Git reads](../../NORTH-STAR.md#share-one-refresh-for-published-dashboard-git-reads):
  use the existing per-project
  [Review repository and bounded refresh](../../../dashboard/server/reviewRepository.ts)
  for the new inventory and text reads. Use the displayed project revision
  and verify its published project history through the configured target in
  that repository. Reuse the local object when available. If the inventory
  needs a sync, join the existing exact-target fetch. File selection reads
  locally from the admitted tree. The existing location settings and CI
  providers remain separately scoped and must be keyed to their own revisions.
  This introduces no new clone, ref observer, or provider-specific tree listing.
- [Make production code directly testable instead of growing test support](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support),
  [Act as soon as the page allows](../../NORTH-STAR.md#act-as-soon-as-the-page-allows),
  and [Plain Vitest for unit tests](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e):
  exercise the typed handler and actual Git commands at the routed backend
  boundary. Mount the existing project reading in Vitest Browser Mode for
  delayed answers and revision ordering. Use the existing Playwright project
  journeys and routed origin fixtures for the integrated user proof.

## Decisive premises and baseline

Observed on 2026-11-25 at `5c784c49ad95e4b667b2308c42267fa8675058c0` in the
owned worktree, Node v24.21.0 on macOS with AC power after `npm ci`. The
recorded suppliers own the future tree and filter. The observations below
establish the consumers and repository operations used by this plan.

| Consuming operation and profile | Observation and consequence |
| --- | --- |
| `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run test:dashboard:backend -- dashboard/backend-tests/intent/authenticated-read-intent-locations.spec.ts dashboard/backend-tests/intent/authenticated-read-intent-selection.spec.ts dashboard/backend-tests/review/story-review-published-taken.spec.ts --workers=1 --reporter=line` | 7 existing location cases and 7 Vitest published-review cases passed. A matched path reads at its pin, and the generic route refuses a nonmatching neighbor. The Review repository retained a named pair and read its exact file after origin moved without another remote request. A locally present unpublished commit and unlisted path were refused. Slice 1 proves the new project admission separately. |
| Node ESM in this worktree, importing `runGit` and `textAtTree`. For `d31aee723^` and `d31aee723`, used `rev-parse <revision>^{tree}`, `ls-tree -r -z <tree>` and `textAtTree(cwd, tree, "dashboard/src/IntentBrowser.tsx", signal)`, comparing each result with `git show <revision>:dashboard/src/IntentBrowser.tsx`. | The trees beginning `cd33d814a1d5` and `705a5e80ebff` listed 7,586 and 7,588 blob paths, both including root `README.md` and the selected source. Text matched the respective Git object and differed between revisions (9,131 and 8,485 bytes). A repository hierarchy and source can use the same local pin. |
| `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run test:dashboard:frontend -- dashboard/frontend-tests/intent/intent-revision-apply.spec.ts dashboard/frontend-tests/intent/intent-source-target-recovery.spec.ts dashboard/frontend-tests/intent/intent-project-scope-glance.spec.ts dashboard/frontend-tests/intent/intent-project-visit-selection.spec.ts` | 6 passed. A later revision waited for **Show latest**, the old reading survived a held or failed source answer, and a removed selection cleared its source and explained its absence. Clearing a story showed the project CI view, and scope changes selected the corresponding timing context. Slice 3 extends the same held-reading behavior to the inventory. |
| `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run test:e2e -- e2e/intent/intent-code-browse-projects.spec.ts e2e/intent/intent-file-purpose-proof.spec.ts e2e/intent/intent-project-visit-ci.spec.ts --workers=1 --reporter=line` | 3 passed. The browse fixture committed real published files, including a product file and test in one folder, and the current view omitted the product file. File Purpose and Proof survived moving among tests. The live Project Intent fixture checked the real routed trunk SHA, independently observed CI builds for project and story, and still named the pinned browsing revision. |

## Outside-in proof

| Promise | Slice and observation |
| --- | --- |
| Inventory and literal text use the same admitted published revision. A newer target, a locally present unpublished object, an absent path, and a nontext blob get their distinct outcomes. | 1. Route a configured project to a real origin with two differing commits, a literal path with spaces, a removed file, and an unrelated unpublished commit. Assert the full path set and exact texts, one shared cold sync, reuse on path navigation, and no change to the legacy `file-at` admission. |
| The default tree lists production source, documents, and tests. Regular and Intent folders use the shared selection behavior. The filter narrows mixed folders and keeps location cues. A no-locations project opens a tracked document. | 2. Mount Project Intent with mixed tracked paths and distinct configured/unconfigured answers. Extend a real-origin browser journey to open the actual source and verify the filter, selection, and no-locations cases. |
| Test Proof names the measured build, an ordinary file has an honest missing-evidence explanation, and **Home** restores the existing project overview with the filter kept. | 2. Compare the rendered file Proof and CI overview using the same fixture's measured build and CI change. Assert Home while the filter is on and confirm the same build and change on return. |
| Path navigation keeps the shown pin. **Show latest** advances tree/settings/source coherently, explains deletion, and keeps the old usable reading if an inventory update is held or fails. | 3. Hold and fail the new inventory answer while the new locations answer independently, then retry. Assert A stays usable until B's matching data is available, B reads exact replacement source, and a path removed at B has no stale text. Resolve an obsolete request after navigation and check that it cannot replace the active reading. |

## Slices

### 1. Share pinned repository inventory and source for Project Intent

Type: Structure
Status: planned
Proof: Direct Node Vitest tests at the authenticated project-read boundary
with real Git fixtures, plus the existing generic reachability and
published-review checks. Existing Dashboard UI behavior is preserved.

Extend the shared tree/object reader from story review where its operation
is independent of story admission. Join the Review repository's bounded
target synchronization on a cold inventory read. Return the requested
revision and tracked paths or a recoverable unavailability. Bind source
to the same project and revision, resolve exact literal tracked entries,
and use the existing text reader's distinct missing and unavailable
outcomes. Prove a cold inventory and warm file reads through the new
boundary, including two versions of the same tracked path. Keep the
boundary typed and cancellable. This supplies the browser in slice 2.

### 2. Browse the whole project and return to CI Home

Type: Behavior
Status: planned
Proof: Mounted Project Intent Vitest Browser Mode and a focused routed-origin
Playwright journey starting from Project Intent CI and opening actual
production, document, and test source.

Feed the tracked paths to the existing project tree at the shown revision.
Use the shared filter and folder Summary with that revision's location
settings. Treat an explicit no-locations answer as empty membership and
keep the full unfiltered tree. Source selection uses the project reader
for all tracked files. Keep test Purpose and Proof, use the existing
evidence wording for a file without a CI result, and have **Home** return to
the existing CI overview. The initial read and a changed pin use only
matching revision data. While a changed pin's inventory is being read, an
updating state can briefly replace the tree. Slice 3 restores continuous
use of the old tree during that interval.

### 3. Keep the current reading until Show latest can replace it

Type: Behavior
Status: planned
Proof: Extend the mounted revision-apply and source-recovery journeys with
held, failed, retried, and stale project inventory answers. Re-run the
end-to-end project revision and CI visit journeys.

Make the project reading advance when both the new inventory and its
settings have settled for the offered revision. Keep the last usable pair
with its own pin while blocked, and route inventory failure through its
existing retry surface. When the new pair arrives, re-evaluate the
selection against the full inventory, independent of the browsing filter.
Reuse the existing source transition and missing-path views. A retained
path reads the new blob, and a removed path clears its old source.

## Consumer trace and local gates

- Recheck the shipped supplier paths before editing. Keep one revision-pinned
  project read in the existing page read seams. Review all
  `publishIntentProject` callers and
  `e2e/intent/intent-recorded-purpose-read.spec.ts`, which currently counts
  provider file reads. Preserve the once-per-pin assertion at the chosen
  boundary. Update assertions that currently rely on the default tree
  excluding non-Intent files to exercise **Intent only** explicitly.
- At the preparation pin, `IntentBrowser.tsx` has 246 lines,
  `IntentFileReading.tsx` 242, and the authenticated read dispatcher and
  parser 235 and 233. Recheck after the suppliers land. Route the new
  handler through a cohesive project-read module in slice 1. Keep the
  project inventory lifecycle with the project reading in slices 2 and 3.
  Preserve shared source, selection and proof rendering and keep edited
  files within the project file-size check.
- Run each slice's focused tests, `npm run typecheck:dashboard` for changed
  contracts, and staged lint. Run long macOS checks awake on AC power under
  `caffeinate -s -i` per [maintainer guidance](../../../AGENTS.md). Follow
  the [shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
  Apply Dough MakeMe and the page-object selection for affected tests, and
  Dough Post-change Refactor before each slice commit.
- No separate slice-plan refinement was needed. Three slices fit the
  eight-slice cap and the 15-active-minute budget per slice. They share
  one tracked-tree model, isolate admission before its first UI use, and
  distinguish opening a project reading from keeping it usable during an
  update. This assessment found no remaining slice-specific concern.
