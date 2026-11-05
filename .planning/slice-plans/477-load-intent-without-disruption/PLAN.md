# Load Intent without disruption or bulk source transfer

**Identity:** SEED-241#load-intent-without-disruption-or-bulk-source-transfer
**Source:** [selected story](../../seeds/SEED-241-intent-loading-and-traffic.md#load-intent-without-disruption-or-bulk-source-transfer)
**Source review:** [source-review.md](source-review.md)
**Prepared:** 2026-11-05; preparation only. Execution is not authorized by this plan.

## Goal and boundaries

A developer keeps their Intent reading place while trunk moves and while
switching perspectives, sees newer published work as a notice they apply
deliberately, and revisits content without the page asking for it again.
The story section owns the goal, scope, key examples, UI and architecture;
this plan does not restate them.

Included:

- Page-held answers fixed by identity: locations and the candidates record
  per repository and revision, file text through `fileContentCache`, and a
  story file's diff and texts per comparison.
- Removing the unused plain-source read beside a story diff.
- Page-held reading state per project.
- The reading revision with its **New revision available** notice, apply,
  missing-path explanation and failure recovery.
- The documentation of those reads and of the observed-revision rule.

Excluded (from the story's deferred promises and scope limits):

- Persistence across page reload, and retention across a project change.
- Line anchoring after an update, and cross-revision blob reuse in the
  browser.
- HTTP caching or compression, and any backend index, calculation cache or
  progress service.
- CI homepage behavior, owned by `SEED-239`.

**Failure policy:** [AGENTS.md — Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests)
applies as written to execution, verification, delegation and repair
handoffs.

**Local gate:** each slice runs `npm run lint`, `npm run typecheck:dashboard`
and its focused proof (`bash scripts/test.sh <paths>` for Node checks;
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/playwright.config.ts <specs> --reporter=list`
for dashboard specs, with Homebrew Bash 5 first on `PATH`). The focused
suite for Intent is every `dashboard/tests/intent-*.spec.ts` plus
`development-intent-frame*.spec.ts`: all of them pass through the changed
read hooks and the perspective. Because slices 1 to 3 change shared browser
read paths and the perspective's mount lifecycle, run `npm test` and
`npm run test:dashboard` once before landing the story branch, not per slice.
For those long runs follow the maintained
[macOS sleep guard and power condition](../../../tests/local-test-resources.md#machine-sleep-on-macos):
start fully awake; on AC use `caffeinate -s -i`; on battery plug in or keep
the lid open under `caffeinate -i` and inspect the sleep log afterwards.
Hosted CI on the published story branch remains owned under the failure
policy.

## Existing solutions and direction

- **File text:** `dashboard/src/fileContentCache.ts` (16 MiB LRU keyed by
  repository, revision and path) already backs `repositoryFileReads.ts`.
  `useIntentFileRead` calls `readRepositoryFileAt` directly. Route it
  through one shared cached read that also joins a read already in flight
  for the same key. Failures are never remembered, as `rememberFile` only
  takes text.
- **Revision-fixed JSON answers:** the locations answer
  (`authenticatedIntentRead.ts`), the candidates record
  (`authenticatedIntentCandidatesRead.ts`) and the story-review file diff and
  texts (`useReviewRead` with `from`/`tree` revisions in its query) are fixed
  by their keys, but each is held only while its component is mounted. Give
  them one small bounded in-memory answer memo beside `fileContentCache`,
  keyed by the read's full identity, with the same in-flight join and the
  same never-cache-failure rule. Limited and refused answers (`ReadProblem`,
  `readingLimit.ts`) stay uncached. The story comparison listing is a live
  observation of a moving branch; it keeps its current reads.
- **Page-held reading state:** `pageIntentMode.tsx` and
  `pageStorySelection.tsx` already keep per-project page state above
  `ConfiguredDashboard`'s Intent mount (`PageFrame.tsx`). The Intent
  selection (`intentWorkspaceSelection.ts`, today remounted by
  `key={source.id:revision}` in `IntentPerspective.tsx`), the location
  expansion (`IntentBrowser.tsx`), the open folders
  (`useLocationOpenFolders.ts`), **Selected story only**
  (`useIntentStoryTree.ts`) and the reading pane's scroll offset move into
  one provider of that kind. A project change resets it, matching the mode
  choice.
- **Reading revision:** the published work's `revision` stays the page's
  observed revision (`publishedObservation.ts`, SSE and revision checks,
  unchanged). Intent's reading revision is the page-held value set on first
  open and on **Show latest**. `IntentCiStatus` keeps receiving the observed
  work, so its new-head trigger is untouched.
- **Accepted decisions.** [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  allows this as disposable, rebuildable browser state. HTTP answers stay
  `no-store`. The UX North Star's
  [evidence and freshness distinctions](../../../docs/dashboard-ux-ui-north-star.md#evidence-freshness-and-uncertainty)
  govern the notice and failure wording. [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
  supplies the before/after basis below. No conflict and no new North Star
  topic is needed.
- **Coordination with `SEED-239`:** its executing branch
  (`cursor/show-ci-status-and-timing-on-the-intent-homepage`, slice 1 at
  `bb9b7128e`) rewrites `IntentBrowser.tsx`, `IntentPerspective.tsx`,
  `IntentFileReading.tsx` and `IntentSummary.tsx`, and adds
  `IntentSelectionReading.tsx` for the empty-selection homepage. This plan's
  changes sit in the read hooks, a page-level provider and the provider key
  those components consume. Start each slice from fetched trunk. When
  `SEED-239` has landed, apply the same changes to its shape; do not edit its
  branch or its owned files in its workspace.

## Decisive premises observed during preparation

Observed in this preparation workspace on 2026-11-05 at
`1406517aeb8a3e52b121d8ee119ce08cbe26448e`, through the dashboard
Playwright runner in the slices' form (`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/playwright.config.ts … --reporter=list`,
Homebrew Bash 5, Node 24.21.0). The scratch specs were deleted afterwards.

| Premise | Consuming operation | Observation and result | Remainder |
| --- | --- | --- | --- |
| A new observed revision re-reads locations and clears the selection | Slice 3 replaces that behavior | `dashboard/tests/intent-selection-reads.spec.ts` passed all three tests, including "a new published revision reads the locations again and starts with nothing selected" (locations reads 1 → 2, Purpose "Select a file…") | — |
| Reopening a file and returning from Development repeat reads and lose the place | Slices 1 and 2 | Scratch spec on the pygardon fixture: feature A, feature B, feature A gave two `path=<A>` reads. Development → Intent then sent one more `intent=locations` read, and A's button was no longer shown (group collapsed, nothing selected) | — |
| A story-changed file's diff is accompanied by an unused plain read | Slice 1 | Scratch spec with `selectTakenStoryInIntent`: opening `Modified dashboard/tests/a.spec.ts` sent `/__authenticated-read?…&path=dashboard/tests/a.spec.ts` beside the diff | — |
| Folder Summaries make no request | Slice 1's regression for example 5 | Scratch spec on the entry-folder fixture: selecting the location, `jobs` and `reports` sent no request apart from revision checks (`[]`) | — |
| Live boundary sizes and warm costs (baseline) | Slice 4's ADR 0010 comparison | The running dashboard at `127.0.0.1:4173` with same-origin headers, at the revision above. Locations: 67,758 bytes, 2.51 s cold, 0.009 s warm. `dashboard/tests/agent-launch-story-card.spec.ts`: 8,346 bytes, 2.79 s cold, 0.004 s warm. Load average 1.5–2.5 | Browser-side counts are the scratch counts above; CI reads are excluded as `SEED-239`'s |

## Outside-in proof

| Source promise / examples | Owner and observable result |
| --- | --- |
| Revisit at the same revision makes no repeat request; overlapping reads share (example 2) | Slice 1: a new `intent-read-reuse.spec.ts` counts one `path=<A>` read across A → B → A, and one locations read and one candidates-record read across Development → Intent. Unit proof shows two concurrent reads of one key ask once and a failure is asked again |
| No source/diff bodies without an opened file; folders make no request (examples 1, 5) | Slice 1: the same spec opens Intent with a selected story, browses a location and two folders, and counts zero `path=` and zero story-review file reads |
| Story diff without an unused plain read; renames and deletions keep their explanations (example 3) | Slice 1: the spec counts zero `path=` reads and one diff read when a changed file is opened twice; the existing `intent-story-changes*.spec.ts` stay green |
| Reading place kept through Development and back, scoped per project (example 2) | Slice 2: a spec keeps the selection, the expanded location and folders, **Selected story only** and the reading pane's scroll offset after Development → Intent. A project change starts that project afresh (`intent-ci-status-kept.spec.ts` stays green) |
| New revision → notice, nothing read; Show latest keeps the view, keeps the selection by path, re-reads only the selected file, explains a missing path (example 4) | Slice 3: `intent-selection-reads.spec.ts`'s third test is rewritten to this journey. `intent-test-optimization-candidates-revision.spec.ts` reads the new record only after **Show latest**. A new test deletes the selected file at the new revision and expects the explanation. `intent-ci-status-kept.spec.ts`'s new-head test stays green unchanged |
| Failed refresh keeps the shown content with retry; failures distinct; late answers ignored (example 6) | Slice 4: a held, then failing, locations read on **Show latest** keeps the old reading with failure and Retry; Retry applies. A project change during a held update shows the new project's reading only. The existing `intent-read-recovery*.spec.ts` stay green |
| CI homepage freshness and triggers preserved (example 7) | Owned by `SEED-239`. This plan proves only that the reading revision does not hold CI: slice 3 keeps `intent-ci-status-kept.spec.ts` green |
| ADR 0010 before/after | Slice 4 repeats the premise table's counts with the new specs' noting and the live boundary measurements on the same revision and journey, and records both in this plan |

## Slices

### 1. Intent asks for each fixed answer once per page
Type: Behavior
Status: done
Proof: new `dashboard/tests/intent-read-reuse.spec.ts` (examples 1, 2
counts, 3, 5); unit tests for the shared cached reads (in-flight join,
failure not kept, LRU budget kept); focused Intent suite green.

**Behavior:** Intent open at one revision → the developer reopens a file,
browses folders, opens a story-changed file twice, and leaves and returns →
each file text, locations answer, candidates record and story file diff is
requested once, and no plain-source read accompanies a displayed diff.

Route `useIntentFileRead` through `fileContentCache` with an in-flight
join. Skip its read when the selected file's Purpose is the story diff:
`IntentFileReading` already decides that from `story` and `treeFile.change`,
so lift that decision to where the read is enabled. Add the bounded answer
memo for the locations answer, candidates record and story-review file
answers. Keep the abort-on-departure pattern: a departing reader stops
waiting, but a shared in-flight read continues for any other waiter. Update
`dashboard/GITHUB-REQUESTS.md`'s Intent paragraph: the page asks the
boundary once per answer per page. Run the consumer trace with
`--term "no-store"` and `--term readRepositoryFileAt`.

**Accepted (slice 1):** `readCachedFile` (`repositoryFileReads.ts`) is the one
cached, joined file read; `sharedRead.ts` joins in-flight reads with
per-reader departure; `answerMemo.ts` (8 MiB) and `fileContentCache.ts`
(16 MiB) share `byteBudgetedMemo.ts`. Kept answers: locations `configured` /
`not-configured`, candidates absent / present, story file `diff` / `text`;
settings problems, unreadable records and unavailable answers are asked
again. `useReviewRead` takes an options object `{ round, enabled, fixed }`.
Proof: `intent-read-reuse.spec.ts` and `intent-read-reuse-story.spec.ts`
(fail on base), `boundary/intent-shared-reads.spec.ts`, focused Intent suite
(97 passed), story-review consumers (132 passed after refactor).
Learning: a test that provokes a failed read by reopening the same content
on one page must use a fresh page or another identity
(`story-review-diff-context.spec.ts`). A memo hit still resolves through a
promise, so cached content can show "Reading…" for one frame; slice 4 owns
showing cached content immediately (S6.1).

### 2. The reading place survives leaving Intent
Type: Behavior
Status: planned
Proof: a new spec in `intent-read-reuse.spec.ts` or
`intent-reading-place.spec.ts` (example 2's restored place);
`intent-ci-status-kept.spec.ts` and `development-intent-frame*.spec.ts`
green.

**Behavior:** a file selected deep in an expanded location, with **Selected
story only** on and Purpose scrolled → the developer goes to Development and
back → the same selection, expansion, toggle and scroll offset show, with no
locations or file request. Choosing another project and returning starts
afresh.

Move the selection, location expansion, open folders, reveal round,
**Selected story only** and the reading pane's scroll offset into one
per-project page provider beside `IntentModeProvider`. Drop the
`key={source.id:revision}` remount. Selection identity now resets only on a
project change; slice 3 owns revision changes. Interim behavior until
slice 3: a new observed revision still re-reads the locations, but the
selection is kept by path, with `intent-selection-reads.spec.ts`'s third
test adjusted to that interim. Slice 3 replaces both.

### 3. A newer revision waits behind a notice
Type: Behavior
Status: planned
Proof: rewritten third test of `intent-selection-reads.spec.ts` (example 4),
a new missing-path test, updated
`intent-test-optimization-candidates-revision.spec.ts`, unchanged
`intent-ci-status-kept.spec.ts` new-head test; focused Intent suite green.

**Behavior:** a file selected at revision A → trunk moves to B, then C →
one "New revision available — showing `<A>`" status appears and no Intent
read is sent. **Show latest** keeps A's view with "Updating…" until C's
locations answer arrives, then shows C with the same selection and
expansion, reading only the selected file at C. If C lacks the path, Purpose
explains it and selects nothing else.

Hold the reading revision in slice 2's provider: set on the project's first
Intent open, compared with the observed `work.revision`. Purpose, the
candidates record and story overlays read at the reading revision.
`IntentCiStatus` keeps the observed work. Update
`docs/dashboard-development-intent.md` (reading revision and notice) and
`dashboard/GITHUB-REQUESTS.md` (reads at the reading revision, none on
observation). Consumer trace with `--term "observed revision"` and
`--term "starts with nothing selected"`.

### 4. A failed update keeps the shown revision readable
Type: Behavior
Status: planned
Proof: a new test in the slice 3 spec file with a held, then failing,
locations read (`holdAuthenticatedReads.ts`) (example 6); existing
`intent-read-recovery*.spec.ts` green; the ADR 0010 comparison recorded
in this plan.

**Behavior:** **Show latest** pressed and the new locations read fails →
revision A's reading stays usable, the notice shows the failure and Retry,
and Retry applies the update. Choosing another project while an update is
held → only the new project's reading appears when the held answer
arrives.

Then repeat the baseline: the scratch-equivalent counts come from the new
specs. Re-measure the live boundary sizes on the same revision and record
before and after rows here. The latency and byte savings claimed are only
those observed.

## Current decisions

- Answers are reused only under their full identity (repository, revision,
  path or query). Failed, limited and refused answers are never kept.
- The reading revision is page state per project. The CI homepage and
  Development follow the observed revision.
- No server change is planned. If a slice finds one necessary, it is a plan
  change under execution reassessment, not slice-local scope.

## Plan concerns

Refinement was not needed: each slice is one Behavior with its own proof
loop, the common rule (fixed answers by identity, one page-held reading
per project) carries all four without special cases, and no supplied
target or limit is at risk. This review found no remaining slice-specific
concern. `SEED-239`'s concurrent edits to the same components are a merge
coordination step, not a sizing risk: this plan's changes sit in hooks and a
provider those components consume, as the coordination note above records.
