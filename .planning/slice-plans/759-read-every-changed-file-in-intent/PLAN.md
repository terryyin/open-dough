# Read every file a story changed in Intent

**Identity:** SEED-420#open-review-in-intent
**Source:** [Read every file a story changed in Intent](../../seeds/SEED-420-unified-intent-review.md#open-review-in-intent)
**Source review:** [source-review.md](source-review.md)

## Goal and scope

The selected story's file view in Intent lists every file its comparison
changed, production code beside tests, each with its diff and Proof. The
seed holds the full scope, exclusions and key examples. This plan carries
them without enlarging them.

**Excluded** (seed): comparison choices in Intent
([plan 760](../760-choose-story-comparison-in-intent/PLAN.md)),
**Review changes** on a Story card
([plan 761](../761-route-review-changes-to-intent/PLAN.md)), the Intent only
and Changes only filters, the Home control and the repository inventory.

## Key examples and proof

| Example (seed) | Proof owner |
| --- | --- |
| Worktree changed a spec in a location, `landing.ts` and `PLAN.md` → all three listed, `landing.ts` shows its diff | Slice 1 |
| No count of outside files shows in the header | Slice 2 |
| Diff → Proof → Purpose returns to the same line. Proof of `landing.ts` says it has no file-level CI evidence | Slice 3 |
| **Selected story only** leaves the three changed files. A product-code-only story lists that code and says no test files in Intent locations changed | Slice 1 |
| A Done story with a retired worktree lists every file of its published completion | Slice 1 |
| The view is named **Changes** | Slice 4 |
| A project with no Intent locations lists the story's changed files and says no locations are configured | Slice 5 |

## Current decisions

- **One join.** [`intentStoryOverlay`](../../../dashboard/src/intentStoryOverlay.ts)
  already places each changed file in the location that admits it and counts
  the rest. Its `outside` becomes the list of those files. Do not add a
  second overlay or a second changed-file reader. `storyChangesOnly` and
  `overlayFilesByPath` carry the outside files, so selection, the kept
  reading place and `treeHoldsSelection` treat them as tree files.
- **One tree.** [`IntentBrowser`](../../../dashboard/src/IntentBrowser.tsx)
  draws the outside files after the locations as one group headed
  **Outside Intent locations**, through the shared
  [`FileTree`](../../../dashboard/src/StoryReviewFileTree.tsx) folder rows
  and [`IntentTreeFileRow`](../../../dashboard/src/IntentTreeFileRow.tsx).
  An outside file's selection is `{ path, scope: "file" }` with the
  repository path. It has no owning location and no folder summary.
- **Purpose.** An outside file is always a changed file, so its Purpose is
  the story's diff through the existing
  [`IntentFileReading`](../../../dashboard/src/IntentFileReading.tsx) path.
  Intent reads no published text for it. Its syntax hint comes from the
  path-grammar fallback in
  [`reviewDiffSyntaxHint`](../../../dashboard/src/reviewDiffSyntaxHint.ts),
  as the Side panel review reads it.
- **Story notes.** Notes store the view that wrote them
  ([`storyNote.ts`](../../../dashboard/src/storyNote.ts)). New notes from
  Intent store `Intent → Changes`. The schema keeps reading
  `Intent → Changed tests` from saved notes.
- Follow [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#domain-concepts-and-relationships):
  the selected file and line stay presentation state.
- No expected edit is in a file over 250 lines. `IntentBrowser.tsx` has 250
  and `IntentFileReading.tsx` 247. Slice 1 moves the outside group into its
  own component, and slice 3 keeps the absence line in
  [`IntentFileProofView`](../../../dashboard/src/IntentFileProofView.tsx).

## Decisive premises observed

Observed in this preparation workspace at `7634d96a0`, after `npm ci`.

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| The overlay already separates outside files, as a count | `intentStoryOverlay(locations, changed).outside` | Read of `dashboard/src/intentStoryOverlay.ts` and its spec `dashboard/backend-tests/intent/intent-story-overlay.spec.ts` (lines 106 to 222 assert the count) | The join skips an unplaced change after counting it. Slice 1 changes the count's readers |
| The story's changed-tree specs pass before the change | Slice 1 and 2 proof | `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES node scripts/test-frontend.mjs dashboard/frontend-tests/intent/intent-story-changes-only.spec.ts dashboard/frontend-tests/intent/intent-story-changes-gaps.spec.ts` | exit 0 |
| The header count has discriminating readers | Slice 2's removal | Scratch edit making `StoryOutsideLocations` draw nothing, the same command plus `intent-story-review-return.spec.ts`, then reverted | exit 1. Four cases fail in `intent-story-changes-gaps`, `intent-story-changes-only` (two) and `intent-story-review-return` |
| A changed file's diff, Proof and return to the same line already work for a tree file | Slice 3 | Read of `IntentFileReading.tsx`: `places` keeps each tab's scroll for one file and restores it on a tab switch | Holds for any selected tree file. Slice 3 proves it for an outside file |
| Intent mounts no browser without locations | Slice 5 | Read of `IntentPage.tsx`: `IntentBrowser` mounts only when `locations !== undefined`, and `settledLocationsOf` answers `not-configured` with an explanation alone | Slice 5 must mount the browser with no locations for a compared story |

Other readers of the count that slice 2 must settle:
`intent-story-views-narrow`, `intent-story-notes` and
`intent-done-review-modes` under `dashboard/frontend-tests/intent`, the
page object `dashboard/test-support/support/intentStoryPage.ts`, and
`intent-story-completed`, `intent-summary-story-comparison-renamed`,
`intent-story-changes`, `intent-story-completed-source` and
`intent-story-changes-moves` under `e2e/intent`. The e2e group was not run
in preparation. Slice 2 runs each of these readers.

No premise remains open.

## Slices

### 1. Changes lists the changed files outside Intent locations

Type: Behavior
Status: done

Behavior: a selected story whose comparison changed a spec in an Intent
location and two files no location admits → the story's file view → the
spec sits in its location and the two files follow the locations under
**Outside Intent locations**, in their repository folders with their change
kinds. Selecting one shows its diff as Purpose with the reviewed-file
header. **Selected story only** keeps them, and a product-code-only story
lists its code beside the message that no test files in Intent locations
changed. A Done story lists the outside files of its published completion.
A rename no location admits at either path is listed outside once.

**Proof (accepted).** `dashboard/backend-tests/intent/intent-story-overlay.spec.ts`
lists the outside files once, a rename included, and holds them in
`overlayFilesByPath`. `dashboard/frontend-tests/intent/intent-story-outside-locations.spec.ts`
proves the group, its markers and folders, the diff as Purpose, Selected
story only and a Done story. `intent-story-changes-only.spec.ts` keeps the
product-code-only message. Outside diffs offer Follow up
(`e2e/intent/intent-story-follow-up.spec.ts`) and line notes
(`intent-story-notes.spec.ts`). Whole `dashboard/frontend-tests/intent` and
`e2e/intent` passed.

**Learning for slice 2.** `e2e/intent/intent-story-changes.spec.ts` and
`intent-story-changes-moves.spec.ts` now assert the outside files are listed
once beside the count. The location groups live in
`dashboard/src/IntentTreeGroups.tsx` and the outside group in
`dashboard/src/IntentOutsideGroup.tsx`.

### 2. The header no longer counts files outside Intent locations

Type: Behavior
Status: done

Behavior: a selected story with changed files outside Intent locations → its
Intent header → no count and no control that opens the Side panel review.
The files remain listed.

**Proof.** Remove `StoryOutsideLocations` and `expectOutsideCount` with its
helpers. In each reader named above, replace the count assertion with the
listed files where the case is about outside files, and drop it where the
count was incidental. `intent-story-review-return.spec.ts` proves only the
return from the review this control opened, so it goes with the control. Run
every named frontend reader and the five `e2e/intent` readers.

**Decision at slice 2 start.** The consumer trace found the count is the
only control that opens the Side panel review from Intent
(`openReviewFromIntent`, `intentStory(...).openReview()` in
`dashboard/test-support/support/intentStoryPage.ts`). Cases whose subject is
that Intent-opened review go with the control, as
`intent-story-review-return.spec.ts` does:
`intent-done-landed-review-mode.spec.ts`, the Intent-opened cases of
`intent-done-review-modes.spec.ts` and `e2e/intent/intent-story-changes-landed-run.spec.ts`.
A case there that observes Intent's own reading or the card's review
without the control stays. Where a case only cross-checks the Review diff
against the Intent diff after opening Review from the count, drop that step
and keep its Intent assertions: `intent-done-prior-execution`,
`intent-done-completion-provenance`, `intent-done-retained-landing`,
`intent-done-retained-workspace`, `intent-summary-story-comparison-renamed`,
`intent-story-changes-moves`, `intent-story-changes` and
`intent-story-completed` under `e2e/intent`, and the Intent step of
`e2e/sessions/recently-done-sessions-select-ad-hoc-review.spec.ts`.
Retargeting them to the card's **Review changes** is rejected, since
[plan 761](../761-route-review-changes-to-intent/PLAN.md) sends that control
to Intent. Run those specs too.

**Proof (accepted).** `intent-story-outside-locations.spec.ts` shows the
header holds no outside count while the files are listed. Whole
`dashboard/frontend-tests/intent`, whole `e2e/intent` and the
`e2e/sessions` spec passed. The header count was the only route from Intent
into the Side panel review.

### 3. Proof names a file without file-level CI evidence

Type: Behavior
Status: done

Behavior: a selected outside file with usable story CI evidence → Proof →
one line says that no file-level CI evidence exists for this file, with the
evidence still named. Scrolling the file's diff, opening Proof and returning
to Purpose shows the same line. A spec in a location reads its Proof as
before.

**Proof.** A frontend case beside
`dashboard/frontend-tests/intent/intent-summary-story-comparison-file.spec.ts`
for the absence line and the return to the same scroll position. Its
existing cases stay green.

**Proof (accepted).** `intent-story-outside-proof.spec.ts` shows Proof of an
outside file naming the evidence and its absence line, and the same offset
after Proof or CI comparison and back. Whole `dashboard/frontend-tests/intent`
passed. A journey checking a kept reading place chooses the tab with
`chooseReadingTabInPlace`, since a located click first scrolls the pane.

### 4. The story's file view is named Changes

Type: Behavior
Status: done

Behavior: a selected story in Intent → its views read CI comparison,
**Changes**, Intent coverage. A note written from an Intent diff names
`Intent → Changes`. A saved note naming `Intent → Changed tests` still
reads.

**Proof.** Run `node .claude/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout . --base HEAD --term 'Changed tests'`
and settle every consumer. At `7634d96a0` the words appear in 8 files under
`dashboard/src`, 9 under `dashboard/test-support`, 21 under
`dashboard/frontend-tests` and 17 under `e2e`. Most read the label through
`dashboard/test-support/intentModePage.ts`. Add one case to
`dashboard/frontend-tests/intent/intent-story-notes.spec.ts` for a saved
note with the old view. Run the frontend readers and the `e2e/intent`
readers.

**Proof (accepted).** The tab reads **Changes** with the value `"changes"`.
`intent-story-changes.spec.ts` shows the three views in order.
`intent-story-notes.spec.ts` shows new notes storing `Intent → Changes` and a
saved `Intent → Changed tests` note still reading. Story view panels are
found through `storyTabPanel` in `dashboard/test-support/intentModePage.ts`.

### 5. A project without Intent locations lists the story's changed files

Type: Behavior
Status: planned

Behavior: a project with no `intent.locations` and a selected story with a
comparison → **Changes** → the changed files are listed under their
repository folders and each shows its diff. The view still says that no
Intent locations are configured. A settings problem keeps its explanation
and Retry.

**Proof.** A frontend case beside
`dashboard/frontend-tests/intent/intent-story-changes-gaps.spec.ts`. The
existing not-configured and settings-problem cases stay green.

## Local gates and review

- On AC power, prefix test commands with `caffeinate -s -i env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR`,
  as [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
  describes. Frontend: `node scripts/test-frontend.mjs <specs>`. Backend:
  `npm run --silent test:dashboard:backend -- --workers=1 <specs>`. E2E:
  `npm run test:e2e -- <spec>`. Then `npm run typecheck:dashboard` and
  `npm run lint`. Never run suites concurrently. Follow the
  [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
- Apply [dough-makeme](../../../.agents/skills/dough-makeme/SKILL.md) and
  [dough-page-objects](../../../.agents/skills/dough-page-objects/SKILL.md)
  to every changed test.
- Refinement not needed. Five slices, each with one example family and its
  own proof loop. Slice 1 adds the listing while the count still shows, so
  slice 2 can remove the count and settle its readers alone. This review
  found no slice-specific concern. Slice 4 is the widest by file count. Its
  edits are one label, and if it overruns, split the e2e readers from the
  frontend readers.
