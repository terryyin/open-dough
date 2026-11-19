# Prove ad hoc session review reads in-process through a typed review handler

**Identity:** SEED-413#renovate-dashboard-backend-unit-tests
**Source:** [Prove ad hoc session review reads in-process through a typed review handler](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#renovate-dashboard-backend-unit-tests)
**Source review:** [source-review.md](source-review.md)

## Goal and scope

The review, file diff and file text reads answer through typed handlers under
a thin wire adapter. The fourteen ad hoc review cases whose state is kept
launch records and a repository become plain Node Vitest cases that call
those handlers in-process, with their machine stated through MakeMe. One wire
check keeps what only the wire owns. The backend README gains the rules this
family adds, and spent `dashboard/test-support/` code is deleted. The seed
holds the full scope, the scope limits, the key examples and the 2026-11-19
baseline.

Excluded, as the seed states: ad hoc cases that work in a checkout and mark
Done, the branch result, manual landing and handoff journeys,
`kept-commits-*`, the story-subject `story-review-*` specs, the range read,
`adHocReview.ts`, `launchStore.ts` and `completedReviewRequests.ts` while
those import them, `backend.playwright.config.ts`, and `Distribution/src/`.

The Story Notes pilot supplies the backend group's Node Vitest run, the
`*.unit.spec.ts` entry and the reference family
(`dashboard/backend-tests/review/story-notes.unit.spec.ts` with
`story-notes-admission.spec.ts` as its wire check); the seed records the
satisfied agreement.

## Approach and reuse

This plan follows both topics of the
[Architectural North Star](../../NORTH-STAR.md): production seams instead of
test support, and plain Vitest for unit tests. ADR 0008's direct mapping of
dashboard data across the wire and ADR 0002 support the seam; no Accepted ADR
conflicts.

- **Shared contract (reuse).** `dashboard/src/reviewedWorkSubject.ts` holds
  `ReviewedWorkSubject` and `reviewedWorkQuery`;
  `dashboard/src/storyReviewContract.ts` holds `StoryReview`,
  `ReviewedFileDiff`, `ReviewedFileText` and the endpoints. The handlers use
  these types. Where a read names more than its subject (a run, a reference,
  a file pair), the typed read is one shape the adapter parses the query
  into; the page's query builder and the adapter share it.
- **Handler under the adapter (change).** `storyReviewRequest(url)`
  (`storyReviewRequest.ts`, 166 lines, with `storyReviewSessionRequest.ts`,
  105) reads the query and the kept records in one step.
  `storyReviewResponse(request, res)` (`storyReviewSnapshot.ts`, 97) and the
  file responses (`storyReviewFileResponse.ts`, 92, over
  `storyReviewAdmission.ts`, 197) take a `ServerResponse` only for
  `withResponseSignal`. The adapter keeps the query's shape, method, origin,
  the bounded response signal and the status mapping in
  `launchBoundaryAnswer.ts` (238). An exported handler takes the typed read
  and an `AbortSignal`, admits it against the kept records and answers.
  Refusals a record decides stay in the handler as they are thrown today:
  `RefusedRequest` with its message and status, the convention `storyNotes`
  follows. A handler case asserts both.
- **Process-wide state through its owner (reuse).**
  `mountProjectConfiguration(environment)` mounts the project list from the
  machine home and answers its close. A case calls it under its own `HOME`.
- **Machine state through MakeMe (change).** `makeMe.aLaunchRecord`,
  `makeMe.aLaunchLanding`, `makeMe.aConfiguredProject` and
  `makeMe.aRepository` with `materializeLocalCheckout` already build the
  values. MakeMe gains stored-document builders for the launch store and the
  project list, the documents the server reads, in the form of
  `makeMe.aStoredStoryNotesDocument`: the builder answers the document as
  data and the case keeps it under its machine home.
  `Distribution/tests/test-data-architecture.md` names them. `launchStore.ts`
  keeps its remaining users.
- **Group run (reuse).** The cases run through the two-engine backend group
  run (`scripts/test-backend.mjs`), which sends `*.unit.spec.ts` specs to
  Vitest in Node (`dashboard/backend.vitest.config.mts`). This plan adds no
  runner code.
- **File sizes.** Every file named above is under the 250-line check.
  `launchBoundaryAnswer.ts` at 238 and `makeMe.mjs` at 245 are the closest; a
  slice that would take either over the check moves a cohesive part out in
  the same slice (the review reads' adapter beside the review modules; the
  stored-document builders in their own test-data module that `makeMe.mjs`
  exposes, as `storyNoteTestData.mjs` is).

## Owner of each moved case

| Case today | Owner after this plan |
| --- | --- |
| `ad-hoc-review`: landed after worktree removal and trunk advance; same tree is landed empty | Handler case |
| `ad-hoc-review-unavailable`: no landing; repository gone; comparison objects gone | Handler case |
| `ad-hoc-session-commits`: unreadable kept comparison still identifies the commits | Handler case |
| `ad-hoc-review-subject`: a story session; an unknown session | Handler case for the refusal and its message; the wire check for 400 and 404 |
| `ad-hoc-review-subject`: both a story and a session | Wire check |
| `ad-hoc-review-file`: file diff and text for a rename's old path; a kept run's pair answered and another refused | Handler case |
| `ad-hoc-review-file`: a foreign path, a foreign comparison, another session's reference | Handler case for the refusal; the wire check for one status |

## Decisive premises

Observed on 2026-11-19 at `bc2ecb8f9` in this workspace, Node 24.21.0,
Vitest 5.1.0. Scratch files were removed after each run.

| Consuming operation | Observed result and limit |
| --- | --- |
| A Node Vitest case reads an ad hoc review in-process with MakeMe state and real Git (slices 2, 3, 5) | `vitest run --root .` on a scratch spec under `dashboard/backend-tests/review/`, load about 9: a temporary `HOME`, `materializeLocalCheckout(makeMe.aRepository…)`, the project list and one `makeMe.aLaunchRecord…withLanding(…)` written under that home, `mountProjectConfiguration("development")`, then `storyReviewRequest(url)` and `storyReviewResponse(admitted, <event emitter>)`. Three cases answered `landed` with the expected baseline, tree and file at 295, 84 and 65 ms; the read took 56–79 ms. The handler split moves code inside the same modules. Not observed: the file reads in-process, which use the same admission and `withResponseSignal`. |
| The project list mounts and closes per case in one worker (slices 2, 3, 5) | Same run: each of the three cases mounted under a new home and closed; a second mount without the close throws by design. |
| Baseline for the timing promise (slice 6) | `playwright test --config dashboard/backend.playwright.config.ts review/ad-hoc-review.spec.ts review/ad-hoc-review-file.spec.ts review/ad-hoc-review-subject.spec.ts` with the proof record, load about 6: 10 cases passed, run 9.3 s, 9.8 s wall. The record at this revision carries no per-case time, so the comparison is run time for these ten cases. CI medians over five main runs: 5.7 s for the three files. |
| Which suites read the review reads at the wire (slices 1, 4) | Search for the endpoints and their request helpers: 39 specs in `dashboard/backend-tests/review/`, one in `launches/`, 16 in `e2e/review/` and `e2e/intent/`. The 11 `dashboard/frontend-tests/` matches answer the reads from route substitutes and never reach the server. |
| The backend group runs Node Vitest cases (slices 2–6) | Observed on 2026-11-19 at `78126b37f` in this workspace, load about 3: `npm run test:dashboard:backend -- review/story-notes` with `_TIMES` and `_PROOF_RECORD` set ran the nine cases of `story-notes.unit.spec.ts` on Vitest 5.1.0 in Node, 2–18 ms each; the times record gave `0.1 backend-tests/review/story-notes.unit.spec.ts` and the proof record named `dashboard/backend.vitest.config.mts`. This workspace has no `node_modules` of its own, so the Playwright half of that command did not start here; the slices' Playwright proof needs `npm ci` in the execution checkout. |

## Ordered slices

### 1. The review read answers through a typed handler under its adapter

Type: Structure
Status: done

Structure: Split `storyReviewRequest` and `storyReviewResponse` into the
adapter's part (query shape into the typed read, response signal, status) and
an exported handler taking the typed read and an `AbortSignal` and answering
`StoryReview`, for story and session subjects alike. Wire behavior is
unchanged. Enables slice 2, whose cases call the handler.

Proof: `playwright test --config dashboard/backend.playwright.config.ts
review/` and `launches/` specs that read a review pass unchanged, as do
`e2e/review/` and the `e2e/intent/` specs that open a review. `npm run lint`
and `npm run typecheck:dashboard` pass.

### 2. Landed and unavailable ad hoc reviews are proven in-process from MakeMe machine state

Type: Behavior
Status: planned

Behavior: Given a machine home that MakeMe states (a configured project, a
kept Done ad hoc session with a captured landing, and its repository whose
trunk advanced afterwards), when a plain Node Vitest case asks the handler for
that session's review, then it answers `landed` with the captured baseline,
tree and changed file, and the repository's `HEAD` and index are unchanged,
with no server started. The cases live in `*.unit.spec.ts` specs. The same entry proves the same-tree landing, the
session without a landing, the landing whose repository is gone, the landing
whose comparison objects are gone, and the unreadable kept comparison. The
HTTP versions of these six cases are deleted.

Proof: The cases pass through `npm run test:dashboard:backend --
review/ad-hoc-review` and appear in the group's times and proof record. Each
fails under a scratch edit disabling its rule in the review modules. The
remaining Playwright cases of `ad-hoc-review-unavailable` and
`ad-hoc-session-commits` pass. The stored-document builders' own cases under
`Distribution/tests/` pass.

### 3. Session subject refusals are proven in-process, with one wire check

Type: Behavior
Status: planned

Behavior: Given kept records holding a story launch's session, when the
handler is asked to review that session, then it refuses with "This session
belongs to a story launch and is reviewed by its story."; an unknown session
is refused with "This dashboard launched no such session for this project."
Each refusal is a `RefusedRequest` carrying the status the wire answers
today. One Playwright wire check through a started server keeps a refused method, a
foreign origin, a query naming both a story and a session, a malformed run,
and the 400 and 404 those two refusals map to.
`ad-hoc-review-subject.spec.ts` is deleted.

Proof: `npm run test:dashboard:backend -- review/ad-hoc-review` passes. Each
refusal case fails under a scratch edit removing its rule; the wire check
fails under a scratch edit changing a mapped status.

### 4. The file diff and file text reads answer through typed handlers

Type: Structure
Status: planned

Structure: Split `fileDiffRequest`, `fileTextRequest` and the two file
responses the same way as slice 1: the adapter parses the named pair and path
into the typed read and owns the signal and status; exported handlers answer
`ReviewedFileDiff` and `ReviewedFileText`. Wire behavior is unchanged.
Enables slice 5.

Proof: The same suites as slice 1 pass unchanged, with lint and typecheck.

### 5. Ad hoc file reads are proven in-process, and the wire check covers them

Type: Behavior
Status: planned

Behavior: Given a kept landed session whose comparison renames a file, when
the handlers are asked for the diff and text of the rename's old path, then
both answer. Given a session with one kept run, the run's pair is answered
and any other pair or path is refused, as are a foreign path, a foreign
comparison and another session's reference. The wire check gains a malformed
file pair and the status one file refusal maps to.
`ad-hoc-review-file.spec.ts` is deleted.

Proof: `npm run test:dashboard:backend -- review/ad-hoc-review` passes. Each
moved case fails under a scratch edit disabling its admission rule.
`ad-hoc-session-commits-file-text.spec.ts` and
`ad-hoc-session-commit-runs.spec.ts`, which read the same pairs over HTTP,
pass.

### 6. The backend guidance states the family's rules, and spent support is gone

Type: Behavior
Status: planned

Behavior: A contributor reading `dashboard/backend-tests/README.md` finds the
rules this family adds under "Which entry a case uses", beside the Story
Notes reference family: state a case's machine and
repositories through MakeMe; call another handler in arrangement only when
that step is the behavior under test; mount process-wide server state through
its production function. Every `dashboard/test-support/` function and module
with no importer left is deleted. The moved cases total at most about 3 s
summed case time at two workers.

Proof: An unused-export search over `dashboard/test-support/` for the helpers
the deleted specs imported (`adHocReview.ts`, `completedReviewRequests.ts`,
`launchStore.ts`, `codexStart.ts`) finds none without an importer. Every path
and function the README names exists. `npm run test:dashboard:backend --
review/ad-hoc-review` with `_TIMES` set reports the summed time with case
count, worker count and load against the baseline row. `npm run lint` and
`npm run typecheck:dashboard` pass.

## Proof map

| Promise in the seed | Slice |
| --- | --- |
| Thin wire adapter over typed handlers on the shared contract | 1, 4 |
| Handlers serve story subjects through the same admission path | 1, 4 (existing `story-review-*` specs) |
| Every kept-record ad hoc review case moves, none lost | 2, 3, 5 and the owner table |
| Machine stated through MakeMe; project list mounted through its production function | 2 |
| One focused wire check | 3, 5 |
| About 3 s summed at two workers | 6 |
| README rules | 6 |
| Spent test-support deleted, nothing added outside MakeMe | 6 |

## Current decisions

- The typed read's exact shape and where the handler modules sit are the
  executor's choice within Approach: one shape shared by the page's query
  builder and the adapter, and `RefusedRequest` as the only refusal
  convention.
- The new cases are `*.unit.spec.ts` specs in
  `dashboard/backend-tests/review/`.
- Partly moved specs (`ad-hoc-review-unavailable`, `ad-hoc-session-commits`)
  keep their remaining Playwright cases in place.
- Slice 1 placed the typed read `StoryReviewRead` with `storyReviewQuery` in
  `dashboard/src/storyReviewRead.ts`, the adapter in
  `dashboard/server/storyReviewRequest.ts`, the handler
  `storyReview(read, signal)` in `storyReviewSnapshot.ts`, record admission
  `keptStoryReview` in `storyReviewRecordAdmission.ts`, and the session's
  check against its kept record in `storyReviewSessionAdmission.ts`. The
  session-subject and story-identity query parses live once in
  `reviewedWorkSubjectAdmission.ts`. Because the adapter now
  refuses every query-shape fault before any record is read, a request that
  is wrong in both ways answers the shape's 400 where it answered the
  record's 404: an unknown source with a malformed identity, and a
  `reference` with an unmatched run. This follows the story's "two
  admissions, separated"; no suite or page sends either request.

## Proof and local gates

Follow the [shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Keep default timeouts and omit `test.slow()`. Apply
[dough-makeme](../../../.agents/skills/dough-makeme/SKILL.md) to affected
test sources.

- **Focused:** `npm run test:dashboard:backend -- <paths>` for backend specs
  and `bash scripts/test.sh <paths>` for `Distribution/tests/`, with
  `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES`.
- **Broader runs:** slices 1 and 4 run the whole `review/` backend folder and
  `e2e/review/`, because every spec there reads through the changed
  admission. Use Homebrew bash 5 and run on awake macOS on AC with
  `caffeinate -s -i`. On battery, follow the
  [open-lid procedure](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
- **Lint and typecheck:** `npm run lint` and `npm run typecheck:dashboard`.

## Plan review

Slice-plan refinement was not needed: six slices, each with one outcome and
its own proof loop, and every seed promise mapped. Slices 1 and 4 are the
same split on two reads, each placed before the Behavior that calls it.
Until slice 6, helpers the deleted specs used may remain without an importer,
and slice 6 removes them. The plan was reviewed again on 2026-11-19 with the
pilot on trunk: its entry naming, refusal convention and stored-document
builder replaced the placeholders here, and the group-run premise is now
observed. This review found no remaining slice-specific concern.
