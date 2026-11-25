# Browse and select folders in one story review tree

**Identity:** SEED-420#browse-one-selectable-review-tree

**Source:** [Browse and select folders in one story review tree](../../seeds/SEED-420-unified-intent-review.md#browse-one-selectable-review-tree)

A developer can browse repository paths, select a regular folder or read an
Intent folder's existing proof, and open source or a diff without leaving the
story comparison. Keep **Selected story only** until the filter story replaces
it. The new filter controls, folder styling and summary details, Project
Intent rollout, and new comparison or CI evidence are separate work.

## Current decisions

- [Dashboard UX/UI North Star, Review in Intent](../../../docs/dashboard-ux-ui-north-star.md#review-in-intent)
  places file navigation in the sidebar, keeps repository paths for deletions
  and renames, and preserves the Board's direct cumulative diff entry.
  The tree's inventory filter leaves CI evidence intact. The
  [Project visibility requirements](../../../docs/project-visibility-requirements.md#product-intent-perspective-the-current-product)
  call for production files, tests and other tracked files in story review
  and a Done story's historical result.
- [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#domain-concepts-and-relationships)
  gives Intent one scope containing story, optional sessions, comparison or
  revision, and path. The selected path changes within that scope. CI retains
  its measured-build provenance. The repository source is a published object
  held by the Review repository. The developer's local working directory is
  outside that read.
- Reuse [FileTree](../../../dashboard/src/StoryReviewFileTree.tsx),
  [reviewFileTree](../../../dashboard/src/reviewFileTree.ts), and the
  [workspace selection](../../../dashboard/src/intentWorkspaceSelection.ts).
  The shared tree currently compacts chains that have one child folder.
  Keep each directory individually selectable in the story tree, including
  configured roots in those chains. Preserve compaction in other callers.
  Use the current file row for change and CI cues. Keep existing root
  comparison information discoverable through the root selection or its
  summary as the group headers go away.
- The [current overlay](../../../dashboard/src/intentStoryOverlay.ts) groups
  paths by location and stores some rename rows at the old path. A single
  path inventory should own browser membership, expansion, changed-file
  order and lookup. Intent membership and the rename's baseline path remain
  facts on the same change. Use the existing configured matcher for summary
  and proof scope. Preserve existing root and folder proof behavior for
  paths crossing an Intent boundary. Keep CI links to a former path
  working through the active rename.
- The current [browser source](../../../dashboard/src/intentBrowserSource.ts)
  can pair a selected landed run with whole-story locations. The narrow
  `file-at` admission serves configured tests and other already-reachable
  project paths. Reuse the selected Review's existing admission and fetched
  repository for the wider story read. A Taken Published comparison names a
  published head, a Done Published comparison names a completion, and a
  landed run names a retained landing. Use that admitted review's after
  tree for the inventory and unchanged text. Read the matching Intent
  settings from the same published result and reuse the settings parser and
  source matcher. Keep the existing comparison-file admission and evidence
  rules for changed files. Shared Project Intent Git migration is separate.
- Story Home and shared sidebar work can land before or after this plan.
  Work within the existing sidebar slot and path selection contract.
  On execution startup, use the version of that shell on the selected base
  and keep its entry, path reading and recovery tests. The unified tree
  needs neither a new Home transition nor a new sidebar shell.

## Outside-in proof

| Promise | Slice | Observation |
| --- | --- | --- |
| One hierarchy and independent folder selection and disclosure | 1 | Mounted story review with changed paths inside and outside Intent under the same ancestor. Open it once and locate both branches in the single tree. From a file's diff, select a closed regular folder by keyboard and see its repository path. Toggle its children without changing selection. Select a configured root and then a nested Intent folder and see their existing summaries. Exercise a single-child chain and keep the comparison selected. Preserve the Project Intent folder journey. |
| Exact changes, navigation and previous-path evidence | 2 | Extend the real-Git story moves journey to assert one destination row for each rename, one former-path row for a deletion, both rename paths in the diff, and former-path CI evidence where present. Assert both toggle states and Previous/Next in visible changed-file order. Board **Review changes**, remembered selection and CI drill-down open and reveal the appropriate path, including an old-path link. Check an empty comparison and a repository with no locations. |
| Admitted pin is shared by inventory, settings and text | 3 | Use the routed Git backend boundary and committed trees that disagree on the same blob and on membership. Request the admitted review and assert literal paths, settings and source at the selected result. Exercise published completion, published Taken head and retained run through the corresponding existing admission cases. A mismatched revision, unrelated run or unreadable input gets its boundary outcome. Existing diff and file-text requests keep their separate literal comparison checks. |
| Story browsing follows the selected result and recovers | 4 | Use a story whose selected captured run and newer revision disagree on unchanged source outside Intent and configured test files. Open the file and read the exact text and revision. Change the comparison and observe the inventory, settings and source update together. Include a removed path, a failed inventory response that leaves changed diffs usable, and successful retry. Delayed results from an old selection leave the new one alone. Verify a published story with no configured locations can read an unchanged file and its changed diff. |

## Baseline and proof routes

Observed on macOS with AC power at `6fc83f361ceb` with dependencies installed
in the preparation checkout. These results describe the existing product.

| Consuming operation | Literal observation | Result |
| --- | --- | --- |
| Mounted Intent uses folder name and disclosure independently, filters the comparison paths and reads matching CI counts | `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run test:dashboard:frontend -- dashboard/frontend-tests/intent/intent-story-changes-only.spec.ts dashboard/frontend-tests/intent/intent-story-changes-no-locations.spec.ts dashboard/frontend-tests/intent/intent-entry-folder-summaries.spec.ts dashboard/frontend-tests/intent/intent-story-compare-selected-counts.spec.ts` | 15 passed. Observed separate folder controls, existing selected-only expansion and reading, no-location diff fallback, and captured comparison counts shared by file, folder and CI evidence. |
| Mounted folder selection proof detects a disclosure that works while selection is broken | Temporarily suppressed nested folder selection in `IntentLocationGroup.tsx`, keeping disclosure active. Ran `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run test:dashboard:frontend -- dashboard/frontend-tests/intent/intent-entry-folder-summaries.spec.ts --grep 'folders start collapsed'` with the fault and again after restoration. | The one selected case failed after clicking the folder name at line 136 because `aria-pressed` stayed false. It passed again after restoration. Slice 1 keeps this Project Intent proof and maps the story buttons to a separate mounted journey. |
| Joined overlay and path filtering consume the location matcher and literal compared changes | `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run test:dashboard:backend -- dashboard/backend-tests/intent/intent-story-overlay.spec.ts` | 7 passed. Observed old and new rename paths, removals, source-entry matching and unchanged-path filtering. This names the model's current placement behavior that slice 2 replaces. |
| Routed backend distinguishes settings failures and enforces literal comparison file admission | `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run test:dashboard:backend -- dashboard/backend-tests/intent/authenticated-read-intent-locations.spec.ts dashboard/backend-tests/intent/authenticated-read-intent-locations-problems.spec.ts dashboard/backend-tests/review/story-review-file-text-admission.spec.ts dashboard/backend-tests/review/story-review-completed-file-admission.spec.ts --workers=1 --reporter=line` | 9 passed. Observed the configured and absent settings cases and read failures, literal-file mismatches for both completion modes, and the compared file text on both sides alongside its printed diff. |
| Named Taken and retained landed reads keep their admitted pair when origin advances | `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run test:dashboard:backend -- dashboard/backend-tests/review/story-review-published-landing.spec.ts dashboard/backend-tests/review/story-review-published-taken.spec.ts --grep 'an opened landed run reads|a named published branch pair admits' --workers=1 --reporter=line` | Both selected cases passed. Observed unchanged admission after origin movement and the retained run's file read with no new remote request. Slice 3 separately proves the added inventory and unchanged-source read. |
| Mounted CI drill-down and the Board action reach the shared reading | `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run test:dashboard:frontend -- dashboard/frontend-tests/intent/intent-ci-comparison-drilldown-relative.spec.ts dashboard/frontend-tests/review/story-review-action-mount.spec.ts` | 6 passed. Observed CI scope words and scales through folder and file reading, and Board review arrival for Taken stories and keyboard users at desktop and narrow widths. |
| Review and Intent consume actual published changes and historical source | `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run test:e2e -- e2e/intent/intent-story-completed-source.spec.ts e2e/intent/intent-story-changes-moves.spec.ts e2e/review/story-review-initial-sync.spec.ts --workers=1 --reporter=line` | 5 passed. Observed deleted and moved diffs, current move order, historical source after trunk changes, missing-history refusal, and cold Board entry to a diff. |
| The local Git runner and existing tree text reader consume exact after-tree objects | In the owned checkout, used `node --input-type=module` to call `runGit(["rev-parse", revision + "^{tree}"])`, `runGit(["ls-tree", "-r", "-z", tree])` and `textAtTree(cwd, tree, "dashboard/src/IntentBrowser.tsx", signal)` for `d31aee723^` and `d31aee723`. Compared both reads with `git show <revision>:dashboard/src/IntentBrowser.tsx`. | Distinct tree IDs `cd33d814a1d5` and `705a5e80ebff` yielded 7,586 and 7,588 blob paths. Both listed the selected file and the root README. Both texts matched their own revision and differed from each other. Slice 3 adds proof through the new admitted browse boundary. |

## Slices

### 1. Select folders in one story tree

Type: Behavior
Status: planned
Proof: Mounted unified hierarchy and keyboard selection from the proof map.
Run the existing project folder summary and affected story comparison cases.

When a developer opens the story sidebar, put today's configured paths and
comparison paths into one repository hierarchy. A folder name changes the
reading and the disclosure changes the children independently. Route root
and Intent folder selections to existing summaries. Give regular folders
a path heading in the same pane. Keep current path reveal and filter
behavior and retain current rename placement and move order until slice 2.
The tree still has today's inventory until slices 3 and 4 broaden it.

Use the existing tree and selection components in the story shell. Move
story tree navigation and presentation out of the near-limit
`IntentBrowser.tsx` (246 lines at the baseline) as needed. Keep Project Intent
and candidate-return callers on their current behavior. Trace tests that
address the old group labels or control names. Update the shared page-object
interaction and keep assertions of the original proof, focus, and recovery.

### 2. Follow changed files in repository order

Type: Behavior
Status: planned
Proof: Real-Git rename and move journey, CI drill-down and Board arrival from
the proof map. Keep existing selected comparison counts and file diff proof.

When a story comparison lists changes, keep deleted files at their removed
paths and put each rename at its destination once. Use the former path for
baseline lookup and when resolving an existing link into the old location.
Drive directed open, reveal, and file moves from the changed paths in the
displayed tree. Exercise the same rule with **Selected story only** active.
Replace the interim aliases in the displayed rows and the old two-part
move order. Preserve the published comparison and file diff request fields.

### 3. Read the admitted story result tree

Type: Structure
Status: planned
Proof: Routed backend checks against committed origin objects as mapped above.
Re-run existing Review file admission and historical source consumers.

Expose the smallest typed read needed by slice 4 to list tracked files and
read source and Intent configuration at the same admitted story result.
Use the existing published completion, published Taken and landed-run
review resolution, local Git runner and `textAtTree` semantics. Keep the
external Dashboard browsing behavior unchanged in this slice. Preserve
literal path handling and the distinction between a missing object, an
unreadable response, and a valid empty inventory or absent settings. Check
that a read cannot select a tree or path outside the admitted result. Keep
the existing changed-file admission independent of unchanged source.

Keep review admission cohesive. If reuse reaches the near-limit
`storyReviewHistoricalFileAdmission.ts` (248 lines), extract its
comparison-resolution seam from changed-file validation and keep the
existing historical file and follow-up caller assertions. Retain typed
diagnostics and request cancellation at the read boundary.

### 4. Browse the selected revision's complete inventory

Type: Behavior
Status: planned
Proof: Mounted selection-switch and recovery cases plus a real-Git browser
journey with historical unchanged text and a no-locations repository.

When the current comparison provides a published result, populate the
story tree from that result and overlay its comparison. Use settings and
text from the same result. Opening a folder continues to route through
the normal selection, and an unchanged file reads its source at that pin.
Use a comparison-keyed read so a response for another revision cannot
replace the active tree or its displayed text. If the inventory is
unavailable, explain the gap with recovery where available and continue
to show the active comparison paths. With no compared result, keep the
existing browsing and evidence behavior. Preserve all interim comparison
paths that the complete inventory needs, including deletions.

## Verification and plan review

- Local gate for changed reader contracts and UI behavior is the focused
  frontend, backend and real-Git browser proof mapped to each slice.
  On macOS use
  [`caffeinate -s -i` on AC power](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
  On battery use `caffeinate -i` with the lid open and inspect the sleep
  log after the run. Run the dashboard type and changed-file lint checks
  where their contracts are edited.
- Apply the [shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
  to baseline and changed proof, the repository's MakeMe and page-object
  selections to test changes, and
  [post-change refactoring](../../../.agents/skills/dough-post-change-refactor/SKILL.md)
  before each slice commit. Use the
  [consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
  for `Outside Intent locations`, configured group helpers,
  `intentChangedFileOrder`, root comparison cues, diff and Summary
  navigation, and read contracts at the server and mounted fixture boundaries.
- No separate refinement pass was needed. The four slices each have a
  focused proof loop within the 15-active-minute budget. Each builds on
  the repository path as the navigation key, with comparison metadata
  carrying diff and proof identity. The admission slice limits integration
  work in the last slice to joining a pinned inventory to the existing tree.
  This review found no remaining slice-specific concern.
