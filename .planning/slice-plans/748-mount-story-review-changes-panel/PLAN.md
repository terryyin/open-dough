# Read the Review changes panel's toolbar, details, files and notes in mounted cases

**Identity:** SEED-413#mount-story-review-changes-panel
**Source:** [Read the Review changes panel's toolbar, details, files and notes in mounted cases](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#mount-story-review-changes-panel)
**Source review:** [source-review.md](source-review.md)

## Goal and scope

Dashboard developers read what the Review changes panel names, reveals,
lists and keeps as plain Vitest cases on mounted Chromium, with each review
read answered as a typed reply. Eleven built-app specs in
`dashboard/frontend-tests/review/` move: `story-review-toolbar-truthful`,
`-toolbar-truthful-gaps`, `-details`, `-details-published`, `-details-runs`,
`-uncommitted-check`, `-files-divider`, `-files-divider-kept`,
`-touch-height`, `-notes` and `-note-context` (23 cases, 45.9 summed seconds
in CI run 44855532096).

The owner is `StoryReview` in `dashboard/src/StoryReview.tsx`. It takes a
typed `request`; its snapshot, range, file diff and file text reads go
through `useReviewRead` (`dashboard/src/useReviewRead.ts`), which calls
`fetch`. That hook gains a typed review source. The mounted case supplies
the existing page contexts the panel reads with typed values.

`story-review-action`, `-files-divider-room` and the three
`story-review-diff-syntax-*` specs, the
`e2e/review/` journeys and the full-group timing comparison stay as they
are.

## Key examples and proof

| Example | Observation and owner |
| --- | --- |
| The page source keeps the refusal wording | The page's own review source turns a refused read into the endpoint's `error` words, or `The review was refused.`, and forwards abort. Slice 1. |
| A pending published answer | A Done story's review holds progress with no name and no eye until its published answer arrives, then names it and offers the eye. An ad hoc landing holds the same toolbar and then names Landed runs. Slice 2. |
| A refused first read and Refresh | A first read refused with `refused for proof` keeps the problem and Refresh; Refresh reveals the answer. Refresh of a readable comparison keeps its name, eye and diff while progress shows. The files toggle stays independent of whether details are offered. Slice 2. |
| Landed runs and gaps | Session commits name the toolbar Session commits. A selected landed gap offers Landed runs and the eye, a bare landing gap names Landed runs without an eye. A Done story opens on the newer of two captured runs and Escape from the picker returns to the eye. A published completion keeps its facts behind the eye. Slice 3. |
| Details behind the eye | A workspace review opens on the diff and keeps its place while the eye reveals and hides its details. Choosing Commits renames the toolbar, and the range and commit list stay when details hide. Another story's review opens collapsed with the files shown. The uncommitted check leaves uncommitted changes out of All changes and back without reading the snapshot again. Slice 4. |
| The file sidebar width | The Files divider resizes the sidebar within both minimums. The chosen width serves another story's review. An unusable kept width gives 16rem, and refused storage gives 16rem with resizing and no page error. On a phone, revealed details and status share one height budget above a usable code pane. Slice 5. |
| Notes from a review | The Notes icon sits with Refresh. A Taken workspace file note keeps the Comparison switch's words and endpoints, its line menu offering Add note alone. Notes keeps the displayed diff and returns focus. A landed run's file note keeps the renamed path and exact endpoints. Slice 6. |
| The moved cases cost less | The focused command's elapsed time before and after, and each mounted case's time. Slice 7. |

## Decisions and existing owners

- Follow the
  [test support North Star](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support),
  [Which entry a case uses](../../../dashboard/frontend-tests/README.md#which-entry-a-case-uses)
  and the [improvement ADR](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
  Mount through `mountComponent`. Render and act directly, with no `act`
  wrapping and no `IS_REACT_ACT_ENVIRONMENT`, and wait through
  `expect.element` and `expect.poll`.
- The review source follows `IntentReadSourceOnPage`
  (`dashboard/src/intentReadSource.ts`): a context whose value answers one
  read of an endpoint, query and abort signal. `useReviewRead` asks it in
  place of `fetch`. Its memo (`answerMemo.ts`), `fixed`, rounds, `enabled`
  and the kept last answer stay in the hook. The page's source alone knows
  `fetch`, `cache: "no-store"` and the refusal wording, and it is the
  context's default value, as `IntentReadSourceOnPage`'s is.
- The mounted panel is wrapped in the production contexts it reads, with
  typed values: `ProjectsOnPage`, `SessionsSidebarOnPage` (the header's
  Sessions button), `LaunchesOnPage` (Follow up), the review source, and
  `StoryNotesOnPage` holding a `storyNotesState(source)` for the notes cases.
  One mount function in the panel page object beside the specs composes
  them; it is a page object, not a new `test-support` wrapper.
- Answers are built with page-loadable MakeMe steps added to
  `Distribution/tests/support/pageMakeMe.mjs` from a Node-free builder
  module: a story review snapshot, a published review, landed runs, session
  commits, a range and a file diff, typed by `storyReviewContract.ts`.
  `frontendStoryReviewFixtures.ts` keeps serving the remaining built-app
  cases until its last consumer moves.
- A case that observes a pending read holds its own deferred reply; a case
  that counts reads records what its source was asked. Neither becomes a
  shared helper.
- Kept file sidebar width uses the browser's real `localStorage`; the
  refused-storage case replaces `Storage.prototype` methods for its duration
  and restores them when it ends.
- Before deleting a built-app case, list it with the mounted case that
  carries each of its assertions in the slice's delivery note. Remove a case
  without a mounted replacement only when an E2E journey proves the same
  thing, and name the journey.

## Decisive premises observed

Preparation base `8e8ea0e28`, 2026-11-21, this owned worktree, AC power, Node
24.21.0, `npm ci`, one-minute load 8–10. The observation ran a scratch spec
under `dashboard/frontend-tests/review/` through
`caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npm run --silent test:dashboard:frontend -- review/zz-scratch-review-mount --workers=2`,
and the scratch spec was removed afterwards.

| Consuming operation | Observation and result | Limit and consequence |
| --- | --- | --- |
| `StoryReview` mounts alone (slices 1–6) | Mounted with `LaunchesOnPage` only, it failed: `The Sessions button is outside the page's PageFrame.` (`SidePanelHeader` renders `SessionsButton`). Adding `SessionsSidebarOnPage`, it failed: `Projects must be loaded before the dashboard opens.` (`StoryReviewSnapshotView` calls `useProjects`). With `ProjectsOnPage`, `SessionsSidebarOnPage` and `LaunchesOnPage` given typed values and `fetch` stubbed, Refresh and `story.txt` were visible 255 ms after mount; the toolbar read `All changes` with Hide files and Show review details. The panel asked story notes, the review snapshot and the file diff. | The stub stands in for slice 1's source; the reads are the ones it will answer. These three contexts are the panel's whole frame dependency. |
| Built-app baseline (slice 7) | CI run 44855532096 at `be03d5643`: toolbar-truthful 7.6 s (5 cases), toolbar-truthful-gaps 4.3 s (3), details 8.4 s (3), details-published 2.0 s (1), details-runs 2.6 s (1), uncommitted-check 1.7 s (1), files-divider 2.7 s (1), files-divider-kept 7.0 s (3), touch-height 2.3 s (1), notes 5.3 s (3), note-context 2.0 s (1). | Hosted time. Slice 1 takes the local focused baseline at the execution base before any change. |

## Slices

### 1. Review reads go through a typed source

Type: Structure
Status: done

Take the local focused baseline first: run the eleven built-app specs alone,
three times, and keep the elapsed times for slice 7. Then put the review
source behind `useReviewRead`, with the page's source as the context's
default, so `PageFrame`'s panel and Intent's comparison reads
(`useStoryComparison`) keep it without wiring. One mounted case of
the page source proves its refusal wording and abort forwarding. This
enables slices 2–6.

**Proof.** `npm run typecheck:dashboard`. Every built-app `story-review-*`
spec and every mounted `story-review-diff-*` spec pass unchanged, and the
`e2e/review/` journeys pass. The page-source case passes.

**Accepted.** `reviewSource.ts` holds `ReviewSource` (`review`, `range`,
`fileDiff`, `fileText`) and `pageReviewSource` as `ReviewSourceOnPage`'s
default; `useReviewRead(read, query, options)` names a read key.
`story-review-page-source.spec.ts` proves the refusal words and abort.
Unchanged built-app `story-review-*` (25), Playwright `intent/` and
`review/` (249), `e2e/review/` (72) and the Intent story-comparison
journeys (15) passed. A non-default provider is first used in slice 2.

**Local focused baseline for slice 7.** At `17fe6c2c4`, load 6–9, AC
power, the eleven built-app specs alone by file with `--workers=2`:
30.8 s, 34.5 s, 29.7 s wall time, 23/23 passing each run.

**Learning.** `test:dashboard:frontend -- review/story-review` selects only
the Vitest specs; the three `story-review-diff-syntax-*` specs are
built-app, so name built-app specs by file. Case results come from the
`OPEN_DOUGH_DASHBOARD_PROOF_RECORD` JSON, not the strict-reporter log.

### 2. The toolbar names only what the review has read

Type: Behavior
Status: done

Add the page MakeMe review steps, the panel page object with its mount, and
move the five `story-review-toolbar-truthful` cases, each holding or
refusing its own snapshot read. Remove the built-app file.

**Proof.** The mounted spec passes with all five titles. One scratch break
that names the comparison before the published answer arrives fails the
pending case and is reverted.

**Accepted.** `story-review-toolbar-truthful.spec.ts` is now the mounted
spec with the same five titles; a break naming "Published completion" early
failed the pending case, and one keeping the problem after a retry failed the
refused case. Builders live in `Distribution/tests/support/storyReviewTestData.mjs`
(`aStoryReview`, `.published()`, `.landed()`, `aReviewedFileDiff`) on
`pageMakeMe.mjs`. The panel page object `story-review-panel-page.ts` mounts
through `story-review-page-contexts.ts` (`onReviewPage`, `doneStory`,
`adHocSession`). Page consumers (`stories/`, `sessions/`, `configuration/`,
`review/`, 168 cases) and the 15 remaining built-app review specs passed.
Orphans for slice 7: `expectNoComparisonNameOrDetails` in
`reviewChangesPage.ts` and `expectNoToolbarComparisonOrDetails` in
`reviewDetails.ts`. Mounted cases took 0.2–1.7 s each at load about 24.

### 3. Landed runs and their gaps name the toolbar

Type: Behavior
Status: done

Move `-toolbar-truthful-gaps` (3 cases), `-details-runs` (1) and
`-details-published` (1), with landed run and session commit answers from
MakeMe steps. Remove the three built-app files.

**Proof.** The mounted specs pass. One scratch break that opens a Done story
on its older run fails the runs case and is reverted.

**Accepted.** The three specs are mounted in place under their titles; the
older-run break failed the runs case. New steps: `sessionCommits()`,
`landingGap(explanation)`, `onRun(selected, runs)`, `aReviewRun`
(`storyReviewRunTestData.mjs`); the file-diff builder moved to
`reviewedFileDiffTestData.mjs`. `story-review-details-view.ts` owns the eye,
the run picker and the facts; `reviewSourceAnswering(reads)` in the panel page
leaves unnamed reads unanswered. Opening from the Recently done column stays
proved by `sessions/recently-done-ad-hoc-session-commits.spec.ts`,
`sessions/recently-done-ad-hoc-review-gaps.spec.ts` and
`e2e/review/story-review-completed.spec.ts`. Orphans for slice 7:
`expectNoCodeShown`, `expectNoTimeShown`, `escapeFromLandedRuns` in
`reviewChangesDetails.ts`, `expectNoDetails` in `reviewToolbarPages.ts`.

### 4. Details stay behind the eye and keep the reading place

Type: Behavior
Status: planned

Move `-details` (3 cases) and `-uncommitted-check` (1), the latter counting
snapshot reads on its source. Remove both built-app files.

**Proof.** The mounted specs pass. One scratch break that reads the snapshot
again when the uncommitted check changes fails that case and is reverted.

### 5. The file sidebar keeps its chosen width

Type: Behavior
Status: planned

Move `-files-divider` (1 case), `-files-divider-kept` (3) and
`-touch-height` (1), at the viewports those cases use. The divider drags by
pointer through the page object. Remove the three built-app files.

**Proof.** The mounted specs pass. One scratch break that ignores the kept
width fails the kept-width case and is reverted.

### 6. Notes open from the review with its comparison

Type: Behavior
Status: planned

Move `-notes` (3 cases) and `-note-context` (1) with a `storyNotesState`
over a case-supplied notes source. Remove both built-app files.

**Proof.** The mounted specs pass. One scratch break that drops the renamed
path from a landed run's note fails the note-context case and is reverted.

### 7. The moved cases leave their support and show their cost

Type: Behavior
Status: planned

Remove each `dashboard/test-support/` export or module left with no
consumer, keeping what `story-review-action`, `-files-divider-room`, the
`-diff-syntax-*` specs, other folders and E2E use. Run the mounted specs
three times, interleaved with a rerun of the baseline revision when load
differs, and record elapsed time and time per mounted case in the parent
story's
[state section](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#frontend-group-state-after-seven-families).

**Proof.** The recorded comparison, the support line count before and after,
and a list pairing every removed built-app title with its mounted case or
the E2E journey that owns it.

## Local gates and review

- Apply [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) and
  [page objects](../../../.agents/skills/dough-page-objects/SKILL.md) to the
  new specs, and the
  [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
  to every failure. Keep default test timeouts and never use `test.slow()`.
  On AC power use `caffeinate -s -i` under
  [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
- Focused frontend command:
  `npm run --silent test:dashboard:frontend -- review/story-review --workers=2`,
  prefixed with `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES`.
  A selection mixing both engines runs only its Vitest specs, so run the
  built-app specs by file for their own result. The E2E journeys run through
  `npm run test:e2e -- review/`.
- Run `npm run typecheck:dashboard` and `npm run lint` for each slice. Run
  the [consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
  over slice 1's source and each slice's removed support, and run every
  reached consumer. `useReviewRead` also serves Intent's review reads, so
  slice 1 runs the `intent/` specs that open a comparison. `pageMakeMe.mjs`
  is loaded by every mounted spec, so slice 2 also runs `stories/`,
  `sessions/sessions-sidebar` and `configuration/system-settings-usage` as
  its page consumers. The full frontend group runs in CI.
- Expected production edits touch `useReviewRead.ts` (93 lines) and one
  new source module. Split a
  mounted spec by outcome before it passes 250 lines.
- Slice-plan refinement was not needed: one owner, one preparation placed
  before the behavior it enables, five behavior slices grouped by what the
  panel shows, and one proof loop per slice. No slice-specific concern
  remains.
