# Read the whole repository and its CI from Project Intent

**Identity:** SEED-420#browse-the-project-at-a-revision
**Source:** [Read the whole repository and its CI from Project Intent](../../seeds/SEED-420-unified-intent-review.md#browse-the-project-at-a-revision)

With no story selected, a developer can start from the measured project CI
overview, read the project’s full tracked tree and source at the shown
published revision, and return through **Home**. The shared Project Intent
tree, folder cues, and **Intent only** filter have landed. Project scope
still lists only the files its configured locations carry, and the generic
file read still admits only those locations. Revision selection continues
through **Show latest**. An arbitrary revision picker, new CI runs, changes
to story review, and the migration of existing published Intent and
attribution readers remain outside this plan.

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
  favors sharing the existing path model. Proudly Found Elsewhere: the
  published blob listing is `trackedFiles` inside
  [storyReviewResultRead.ts](../../../dashboard/server/storyReviewResultRead.ts),
  and literal text is [textAtTree](../../../dashboard/server/gitTreeFiles.ts).
  Both currently run only after a story comparison is admitted. Move the
  listing out of that admission and reuse `textAtTree`. The browser already
  accepts an inventory in
  [useIntentStoryTree](../../../dashboard/src/useIntentStoryTree.ts) and
  applies **Intent only** through `intentAdmits` in
  [intentStoryOverlay.ts](../../../dashboard/src/intentStoryOverlay.ts).
  Project Intent never passes that inventory, so the tree falls back to
  `location.files`.
  [FilesSidebarActions](../../../dashboard/src/FilesSidebarActions.tsx)
  already offers **Intent only** and omits **Changes only** for the whole
  project. Story comparison admission stays with story review. Reuse
  [ProjectIntentReading](../../../dashboard/src/ProjectIntentReading.tsx),
  [the selected file reader](../../../dashboard/src/useIntentFileRead.ts),
  [IntentFileProofView](../../../dashboard/src/IntentFileProofView.tsx), and
  [IntentCiStatus](../../../dashboard/src/IntentCiStatus.tsx) for the project
  journey. The generic `file-at` route still admits only a configured
  location. Use a project-browse read through the same authenticated
  boundary, with project and tree admission specific to that operation.
- [Architectural North Star, Share one refresh for published Dashboard Git reads](../../NORTH-STAR.md#share-one-refresh-for-published-dashboard-git-reads):
  the new inventory and text reads use the existing per-project Review
  repository. A cold inventory joins
  [syncedReviewRepository](../../../dashboard/server/reviewRepositoryStorage.ts),
  that repository’s shared fetch of the configured target. Do not call
  `fetchUnlessCommitPresent`: it keeps a separate outstanding-fetch map.
  After that sync, admit the displayed revision only when the fetched target
  contains it, using the `merge-base --is-ancestor` containment
  [storyPublishedEndpoints.ts](../../../dashboard/server/storyPublishedEndpoints.ts)
  already uses, and refuse a locally present unpublished commit. File
  selection then reads locally with `textAtTree`. The existing location
  settings and CI providers remain separately scoped and must be keyed to
  their own revisions. Their move onto this boundary belongs to the later
  Intent and CI migration stories, which this plan does not undertake. This
  introduces no new clone, ref observer, or `GitTargetFetches` instance.
- [Make production code directly testable instead of growing test support](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support),
  [Act as soon as the page allows](../../NORTH-STAR.md#act-as-soon-as-the-page-allows),
  and [Plain Vitest for unit tests](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e):
  exercise the typed handler and actual Git commands at the routed backend
  boundary. Mount the existing project reading in Vitest Browser Mode for
  delayed answers and revision ordering. Use the existing Playwright project
  journeys and routed origin fixtures for the integrated user proof.

## Decisive premises and baseline

Observed on 2026-11-26 at `26eafd8bdb91d9d8489d7a0972ebd76ad3d0bdb2` in this
worktree, Node v24.21.0 on macOS with AC power after `npm ci`. `origin/main`
at `6b267497e02efe0c5c24f0fdcccd17b900641fee` adds only an unrelated
preparation-agent file, so these paths match trunk. The suppliers now own
the shared tree and **Intent only** filter. The observations below establish
the consumers and repository operations this plan uses.

| Consuming operation and profile | Observation and consequence |
| --- | --- |
| `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run test:dashboard:backend -- dashboard/backend-tests/intent/authenticated-read-intent-locations.spec.ts dashboard/backend-tests/intent/authenticated-read-intent-selection.spec.ts dashboard/backend-tests/review/story-review-published-taken.spec.ts --workers=1 --reporter=line` | 7 location cases and 7 Vitest published-review cases passed. A matched path reads at its pin, and the generic route refuses a nonmatching neighbor. A named published pair retained its exact file after origin moved, without another remote request. A locally present unpublished commit and an unlisted path were refused. Slice 1 proves the new project admission separately and leaves this `file-at` admission unchanged. |
| Node ESM in this worktree, importing `runGit` and `textAtTree`. For `d31aee723^` and `d31aee723`, used `rev-parse <revision>^{tree}`, `ls-tree -r -z <tree>` and `textAtTree(cwd, tree, "dashboard/src/IntentBrowser.tsx", signal)`, comparing each result with `git show <revision>:dashboard/src/IntentBrowser.tsx`. | The trees beginning `cd33d814a1d5` and `705a5e80ebff` listed 7,586 and 7,588 blob paths, both including root `README.md` and the selected source. Text matched the respective Git object and differed between revisions (9,131 and 8,485 bytes). A repository hierarchy and source can use the same local pin. |
| `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run test:dashboard:frontend -- dashboard/frontend-tests/intent/intent-revision-apply.spec.ts dashboard/frontend-tests/intent/intent-source-target-recovery.spec.ts dashboard/frontend-tests/intent/intent-project-scope-glance.spec.ts dashboard/frontend-tests/intent/intent-project-visit-selection.spec.ts` | 6 passed. A later revision waited for **Show latest**, the old reading survived a held or failed source answer, and a removed selection cleared its source and explained its absence. Clearing a story showed the project CI view. `useIntentLocations` already keeps the shown locations while the next revision is read. Slice 6 gives the new inventory that same hold and advances only when the inventory and settings are one revision. |
| `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run test:e2e -- e2e/intent/intent-code-browse-projects.spec.ts e2e/intent/intent-file-purpose-proof.spec.ts e2e/intent/intent-project-visit-ci.spec.ts --workers=1 --reporter=line` | 3 passed (19.5s). The browse journey still lists matched tests and omits product and support files. File Purpose and Proof survived moving among tests. The project CI visit checked the routed trunk and story heads, kept the file browser on the published revision while trunk judgments advanced, and **Show latest** moved the browser onto the already judged trunk revision. |

## Outside-in proof

| Promise | Slice and observation |
| --- | --- |
| Inventory and literal text use the same admitted published revision. A newer target, a locally present unpublished object, an absent path, and a nontext blob get their distinct outcomes. | 1. Route a configured project to a real origin with two differing commits, a literal path with spaces, a removed file, and an unrelated unpublished commit. Assert the full path set and exact texts, one shared cold sync through `syncedReviewRepository`, reuse on path navigation, and no change to the legacy `file-at` admission. |
| The default tree lists production source, documents, and tests. Regular and Intent folders use the shared selection behavior. The filter narrows mixed folders and keeps location cues. A no-locations project opens a tracked document. | 3. Mount Project Intent with mixed tracked paths and distinct configured/unconfigured answers, verifying the filter, selection, and no-locations cases. 4. Extend a real-origin browser journey to open the actual source. |
| Test Proof names the measured build, an ordinary file has an honest missing-evidence explanation, and **Home** restores the existing project overview with the filter kept. | 4. Compare the rendered file Proof and CI overview using the same fixture's measured build and CI change. Assert Home while the filter is on and confirm the same build and change on return. |
| Path navigation keeps the shown pin. **Show latest** advances tree/settings/source coherently, explains deletion, and keeps the old usable reading if an inventory update is held or fails. | 6. Hold and fail the new inventory answer while the new locations answer independently, then retry. Assert A stays usable until B's matching data is available, B reads exact replacement source, and a path removed at B has no stale text. Resolve an obsolete request after navigation and check that it cannot replace the active reading. |

## Slices

### 1. Share pinned repository inventory and source for Project Intent

Type: Structure
Status: done
Proof: Direct Node Vitest tests at the authenticated project-read boundary
with real Git fixtures, plus the existing generic reachability and
published-review checks. Existing Dashboard UI behavior is preserved.

Move the blob listing out of story-review admission and reuse `textAtTree`.
Join `syncedReviewRepository` on a cold inventory read of the configured
target. Return the requested revision and tracked paths or a recoverable
unavailability. Admit the revision only when that fetched target contains
it, and refuse a locally present unpublished commit. Bind source to the
same project and revision, resolve exact literal tracked entries, and use
the existing text reader's distinct missing and unavailable outcomes. Prove
a cold inventory and warm file reads through the new boundary, including
two versions of the same tracked path. Keep the boundary typed and
cancellable. This supplies the browser in slice 2.

Delivered: `intent=project-tree&revision=` and
`intent=project-file&revision=&path=` through
[projectBrowseRead.ts](../../../dashboard/server/projectBrowseRead.ts). The
tree answers `{kind:"inventory", revision, paths}` or a recoverable
`{kind:"unavailable"}`, and a file answers `textAtTree`'s outcome with its
revision and path. An unpublished revision gets a 409. `trackedFiles`,
`textAtTree` and the tree-entry parser now share
[gitTreeFiles.ts](../../../dashboard/server/gitTreeFiles.ts). Proof:
[authenticated-read-project-browse.spec.ts](../../../dashboard/backend-tests/intent/authenticated-read-project-browse.spec.ts).
Slice 2 still owes the first HTTP exercise of the new dispatch case.
Backend specs built on `takenStoryReader` need
`beforeAll(prepareRepository(takenBranchContributionHistory()))` and small
cases to fit the default timeout under load.

### 2. Give Project Intent readers the project tree and file reads

Type: Structure
Status: done
Proof: `npm run typecheck:dashboard` and the baseline mounted Project Intent
specs, unchanged in behavior.

Add a client reader for `intent=project-tree` and `intent=project-file`
beside the existing authenticated Intent reads, and add both to
`IntentReadSource` (dashboard/src/intentReadSource.ts). About 37 test-support
and frontend-test files build that source literally (for example
`intent-project-visit-fixtures.ts`, `intent-revision-fixtures.ts`,
`unreadPageReads.ts`). Move them onto one MakeMe builder step whose default
tree is the fixture's configured location files and whose file read answers
the existing per-path text, so nothing visible changes yet.

Delivered: [authenticatedProjectBrowseRead.ts](../../../dashboard/src/authenticatedProjectBrowseRead.ts)
gives `readProjectTree` and `readProjectFile`. An absent or unavailable file
currently throws a `ReadProblem`, the same contract as `readFile`. Fixtures
build reads through `makeMe.anIntentReadSource`
([intentReadSourceTestData.ts](../../../dashboard/test-support/intentReadSourceTestData.ts)).
Slice 3 is the first to run the client parsing over HTTP.

### 3. Browse the whole project tree and its source

Type: Behavior
Status: done
Proof: Mounted Project Intent in Vitest Browser Mode with mixed tracked
paths and distinct configured and unconfigured answers, plus the existing
Project Intent end-to-end journeys that the change reaches.

Pass the tracked paths into the existing project tree at the shown
revision. Use the shared filter and folder Summary with that revision's
location settings. A project with no configured locations still shows the
full tree; **Intent only** keeps the existing empty-scope explanation
instead of replacing that tree. Today `intentBrowserSource.ts` shows no
project browser without locations, so this needs a whole-project branch.
`IntentPage.tsx` has 239 lines, so first move the project inventory lifecycle
into its own hook beside the project reading. Source selection uses the
project reader for all tracked files. The first open uses only the shown
revision's inventory and settings. `intent-recorded-purpose-read.spec.ts`
keeps its once-per-pin assertion, now counting `intent=project-file` reads
instead of upstream content requests. Assertions that relied on the default
tree excluding non-Intent files turn **Intent only** on explicitly.

Delivered: [useProjectTreeRead.tsx](../../../dashboard/src/useProjectTreeRead.tsx)
reads the tree once per shown revision, and project-scope source reads
through `readProjectFile`. Proof:
[intent-project-browse.spec.ts](../../../dashboard/frontend-tests/intent/intent-project-browse.spec.ts)
and the whole `e2e/intent` folder. E2E page steps `chooseIntentOnly` and
`noteProjectFileReads` live in `intentCodeBrowsePage.ts`. Mounted fixtures
leave the project tree unanswered by default, so their tree is the configured
location files; mixed-path cases answer `readProjectTree` explicitly and need
their own revision because reads are cached per revision. `IntentPage.tsx`
has 245 lines.
CI repair (run 45783681400): the no-locations explanation shows beside the
tree while Files shows and above the reading while Files is hidden (phone
drawer), and the not-configured helpers no longer assume an empty Intent
area has no list.

### 4. Open real source from Project Intent CI and return Home

Type: Behavior
Status: done
Proof: A focused routed-origin Playwright journey starting from Project
Intent CI and opening actual production, document, and test source.

Keep test Purpose and Proof, use the existing evidence wording for a file
without a CI result, and have **Home** return to the existing CI overview
with the filter kept. Compare the rendered file Proof and CI overview with
the fixture's measured build and CI change.

Delivered: the second test in
[intent-file-purpose-proof.spec.ts](../../../e2e/intent/intent-file-purpose-proof.spec.ts)
opens production, document and test source at A while B is available, over
the A/B history in
[intentProjectSourceFixtures.ts](../../../dashboard/test-support/intentProjectSourceFixtures.ts),
which slice 6 can reuse. An ordinary project file's Proof uses the existing
"declares no entry holding <path>" wording. After trunk moves, the CI
overview judges B while the browser stays at A.

Learning from the first slice-2 attempt (2.8 active minutes, nothing
changed): the combined slice needed fixture migration, a whole-project
branch, a file-size extraction and a new journey, which did not fit one
15-minute slice. Slices 2–4 replace it.

### 5. Answer the project tree in every mounted Project Intent fixture

Type: Structure
Status: done
Proof: `npm run typecheck:dashboard` and the mounted intent, navigation and
configuration suites, unchanged in behavior.

Nineteen of the 22 fixtures built through `makeMe.anIntentReadSource` never
answer `readProjectTree`, so their tree falls back to the configured location
files. Add a MakeMe step that answers the tree from the case's own location
files without calling `readLocations` again (read-count specs depend on
that), and move those fixtures onto it. Nothing visible changes.

Delivered: the builder's default now answers each revision's tree from the
locations the case's own `readLocations` answered there, so no fixture
changed. A case whose revision an earlier mount already read gets no
locations call and keeps an unanswered tree; slice 6 cases need their own
revision. Refactor pass skipped: one test-support file, the slice's subject,
with no refactor-check candidate on review.
CI repair (run 45791366547): `intent-story-compare-reading.spec.ts` now waits
for the story inventory before capturing a folder label; an older capture
race, not a product change.

### 6. Keep the current reading until Show latest can replace it

Type: Behavior
Status: planned
Proof: Extend the mounted revision-apply and source-recovery journeys with
held, failed, retried, and stale project inventory answers. Re-run the
end-to-end project revision and CI visit journeys.

Make the project reading advance when both the new inventory and its
settings have settled for the offered revision. Keep the last usable pair
with its own pin while either answer is unread or the inventory read fails,
using the same hold `useIntentLocations` already gives the locations, and
route inventory failure through the existing retry surface. When the new
pair arrives, re-evaluate the selection against the full inventory,
independent of the browsing filter. Reuse the existing source transition
and missing-path views. A retained path reads the new blob, and a removed
path clears its old source.

Today `useIntentLocations` moves `shownRevision` to B once B's settings
settle, and `useProjectTreeRead` reads only at `shownRevision`. Read the tree
at the reading revision and advance the shown pair only when both answers
are at B, taking A's locations from `keptIntentLocationsAt`. Keep this
pairing in project scope, because `useShownIntentLocations` also serves story
pages. Route an update failure to `IntentRevisionNotice`'s failed update and
Retry, and a first-open failure to the Retry `settledLocationsOf` offers,
replacing the alert in `useProjectTreeRead.tsx`. On first open, show a
pending state instead of a location-files tree.

Learning from the first slice-5 attempt (1.2 active minutes, nothing
changed): ending the interim tree turns an unanswered fixture read into a
pending state, so the fixture migration became its own Structure slice.

## Consumer trace and local gates

- Recheck the shipped supplier paths before editing. Keep one revision-pinned
  project read in the existing page read seams. Review all
  `publishIntentProject` callers and
  `e2e/intent/intent-recorded-purpose-read.spec.ts`, which asserts
  `contentReadsOf(...)` is 1 for a recorded Purpose case. Preserve that
  once-per-pin assertion at the chosen boundary. Update assertions that
  currently rely on the default tree excluding non-Intent files to exercise
  **Intent only** explicitly.
- At this preparation pin, `IntentBrowser.tsx` has 200 lines,
  `IntentFileReading.tsx` 236, the authenticated read dispatcher
  `dashboard/server/authenticatedRead.ts` 241, and
  `dashboard/server/requestedRead.ts` 233. Route the new handler through a
  cohesive project-read module in slice 1. Keep the project inventory
  lifecycle with the project reading in slices 3 and 6. Preserve shared
  source, selection and proof rendering and keep edited files within the
  project file-size check.
- Run each slice's focused tests, `npm run typecheck:dashboard` for changed
  contracts, and staged lint. Run long macOS checks awake on AC power under
  `caffeinate -s -i` per [maintainer guidance](../../../AGENTS.md). Follow
  the [shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
  Apply Dough MakeMe and the page-object selection for affected tests, and
  Dough Post-change Refactor before each slice commit.
- Refined during execution: the original slice 2 was split into slices
  2–4 (reader and fixture structure, whole-project tree and source, real
  journey with Proof and Home), and the original slice 3, later 5, into
  slices 5–6 (fixture tree answers, then the Show latest hold). Six slices
  fit the eight-slice cap, and each has one proof loop within the
  15-active-minute budget. No slice has overrun.

## Story obligations

### G1. Project tree shows only location files while its inventory is unread
Reported: slice 3 — "While the paths are not read, the browser lists the configured location files; a failed read says why and offers Retry."
Story clause: "List the published repository's tracked paths by default"
Disposition: interim until slices 6

### G2. Project tree read failure and Retry are unobserved and use a new surface
Reported: slice 3 — "Untested: the error message and Retry shown when the project tree read fails (in useProjectTreeRead.tsx)."
Story clause: "If the new inventory cannot be read, the current reading remains usable while the developer retries."
Disposition: receiving slice 6

### G3. Optimization Candidates lost its no-locations explanation
Reported: slice 3 — "the Optimization Candidates view shows its panel instead of the explanation"
Story clause: "With no configured locations, the default tree still opens a tracked document and **Intent only** explains the empty scope."
Disposition: proved by slice 3: the unchanged `showsExplanation("Optimization Candidates")` in dashboard/frontend-tests/intent/intent-story-changes-gaps.spec.ts passes again (evidence s3r-fe3)
