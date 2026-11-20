# Prove what Done keeps of a Default main session's commits in-process

**Identity:** SEED-413#renovate-remaining-dashboard-backend-unit-tests
**Source:** [Prove what Done keeps of a Default main session's commits in-process](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#renovate-remaining-dashboard-backend-unit-tests)

## Goal and scope

About 25 cases become plain Node Vitest cases. Capture cases mark a kept
Default main session Done through `setRecordDoneAt` and observe the kept
record, Git references or a typed review answer. Two review-only cases pass
kept records and real Git repositories directly to the typed handlers. The
checkout's Git work is stated through MakeMe and performed by real Git. The
backend README gains the rules this family adds, and spent
`dashboard/test-support/` code is deleted. The seed holds the full scope, the
key examples and the 2026-11-19 baseline.

Excluded, as the seed states: native Done, reported Done and its retries, the
held checkout read, record deletion and expiry at the dashboard
(`kept-commits-release`), the launch that keeps no start, the branch result,
manual landing and handoff journeys, `ad-hoc-session-comparisons`, a clock
seam in the server, and `Distribution/src/`.

The seed records the satisfied dependency on plan 721, integrated at
`d940be196`. The landed work supplies the typed review, file diff and file
text handlers, `makeMe.aSessionReviewRead`, and the backend README rules.

## Approach and reuse

This plan follows both topics of the
[Architectural North Star](../../NORTH-STAR.md): production seams instead of
test support, and plain Vitest for unit tests.
[ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md),
[ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
and [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
apply, and no Accepted ADR conflicts.

- **Done seam (reuse).** `setRecordDoneAt(sourceId, session, doneAt)`
  (`dashboard/server/recordDoneAt.ts`, exported by `launchRecordStore.ts`)
  writes the mark and starts the capture in `doneCapture.ts`,
  `sessionCommitsCapture.ts` and `launchRecordPins.ts`. None reads HTTP or an
  agent host. Use the [existing production contract](../../../Distribution/src/skills/dough-post-change-refactor/references/refactor-checks.md#design-production-code-for-testability)
  directly. A capture-only case supplies the kept session and real checkout
  without mounting project configuration or initializing native Done services.
  If a case needs unrelated setup to use this entry, narrow the production
  contract instead of adding a wrapper.
- **Review reads (reuse).** Call `storyReview` in `storyReviewSnapshot.ts`
  and `reviewedFileText` in `storyReviewFileResponse.ts` with the typed input
  from `makeMe.aSessionReviewRead.ofSession(…).keeping(…)` and an
  `AbortSignal`. Use `.readingFile(…)` for file text. Capture cases pass the
  records the Done operation kept. The landing and file-text cases build
  those records with MakeMe and supply only the records and real Git
  repository. These handler calls need no project list or server mount.
- **Kept sessions (reuse).** `makeMe.aLaunchRecord` builds the session with
  `inDefaultCheckout`, `inClaudeSession` and `launchedAt`. For capture and
  release cases, use the existing `keepLaunchStore` writer to put the
  starting records in a launch document under the case's disposable home.
  Observe the persisted record where the case proves what was kept.
- **Checkout work as MakeMe steps (change).** The dated Git steps in
  `dashboard/test-support/support/sessionCheckoutWork.ts` (221 lines) and
  `sessionCheckoutGit.ts` become a MakeMe description of a checkout's work: a
  commit, an edit left uncommitted, an amend, a commit on another branch, a
  reword, trunk work another clone publishes and the checkout takes in by a
  fast-forward, a merge, a rebase or a rebase onto fetched trunk, a push, a
  continued cherry-pick and an autosquash. A builder states the steps as
  data, each with its time and a name. A performer beside
  `Distribution/tests/support/repository-fixture.mjs` runs them with real Git
  in the materialized checkout and answers each named step's commit, as
  `materializeRepository` answers `revisions`. It can perform further steps
  after a Done mark. `commitDeclaredRevision` stays the commit step's
  implementation. The builder imports nothing from `dashboard/`.
  `Distribution/tests/test-data-architecture.md` names it.
- **Times against the case's clock.** A case states a launch about an hour
  ago, work after it and a Done no later than now. The base revision of the
  MakeMe repository is dated before the launch (`committer.date`).
- **Group run (reuse).** The cases are Vitest specs in
  `dashboard/backend-tests/review/`, run by `scripts/test-backend.mjs` on
  Vitest in Node. This plan adds no runner code.
- **File sizes.** `Distribution/tests/support/makeMe.mjs` is 245 lines and
  `repositoryTestData.mjs` 226 at `f9e6023bc`, under the 250-line check, and
  plan 721 changes `makeMe.mjs` first. The checkout-work builder and its
  performer are new modules. If exposing the builder takes `makeMe.mjs` over
  the check, slice 1 moves the repository builders' exposure (`aRepository`
  with the checkout work) into one module that `makeMe.mjs` spreads in.

## Owner of each moved case

| Case today | Slice |
| --- | --- |
| `ad-hoc-session-commits`: a default launch's commit kept and reviewable after trunk advances and the commit leaves every branch; an established session's commit; an established session holding a landing keeps answering its landing | 1 |
| `ad-hoc-session-commits-file-text`: a kept run's pair answers both sides and any other pair is refused | 1 |
| `ad-hoc-session-commit-runs`: all six cases | 2 |
| `ad-hoc-session-commit-rewrites`: the continued cherry-pick; each autosquash kind | 3 |
| `ad-hoc-review-unavailable`: edited and committed nothing; a commit on another branch; a reworded commit, both forms; an unreadable log; a log without an entry | 4 |
| `ad-hoc-session-commits-shared`: all three cases | 5 |
| `kept-commits-release-after-done`: all four cases | 6 |

Staying on Playwright in the two partly moved specs: the quiet-report case
of `ad-hoc-session-commits`, and the launch that keeps no start in
`ad-hoc-review-unavailable`. Plan 721 moves those specs' other cases.

## Decisive premises

Observed on 2026-11-19 at `f9e6023bc` in this workspace, Node 24.21.0,
Vitest 5.1.0, with `vitest run --root . --config
dashboard/backend.vitest.config.mts` on a scratch spec under
`dashboard/backend-tests/review/`. The scratch file was removed after each
run.

| Consuming operation | Observed result and limit |
| --- | --- |
| A Node Vitest case marks a kept session Done in-process and the capture keeps its commit (slices 1–6) | Load about 3.5. A temporary `HOME`; `materializeLocalCheckout` of a MakeMe repository whose base revision is dated 2019; a MakeMe launch record established an hour ago written as the store document; `commitDeclaredRevision` dated half an hour ago; `setRecordDoneAt("open-dough", session, <ten minutes ago>)`. Three cases passed. The answered record held `sessionCommits.runs` of `base` to the commit, and the repository held `refs/open-dough/session-commits/claude/<session>/0/base` and `/revision`. Arrangement 54–140 ms, the Done mark 98–103 ms. No project list was mounted. |
| Typed review reads use the kept records directly (slices 1–5) | On 2026-11-20 at `ab0feff62`, a Node 24.21.0 probe called `setRecordDoneAt`, read the saved record with `keptRecords`, and passed it to `storyReview`. The handler answered `session-commits` for the expected pair, and both Git refs resolved. From a MakeMe record with a landing and a later run and a real repository, `storyReview` answered the landing and listed its added file. `reviewedFileText` answered both sides for the kept run and returned 409 for a mismatched pair. Project configuration stayed unmounted throughout. |
| A case's stated times (slices 1–6) | Same spec with launch, work and Done in 2020: the Done mark answered no record, as retention had dropped it. With the launch now and a Done in 2099: the review answered "This session's changes were not captured." With the base revision dated after the launch: no capture, as the log's first commit cannot be placed. The form above avoids all three. |
| Trunk work taken in through an origin (slices 2, 3) | Load about 11. `materializeRepository` (bare origin and checkout), a commit, another clone's commit pushed to `main`, `git pull --no-rebase --no-edit origin main`, a second commit, the Done mark: two runs, the second based on the merge. With `--rebase`: one run from trunk's commit to the second commit. 1.2–1.4 s per case, 0.8–1.0 s of it Git. Not observed: a rebase onto fetched trunk, an amend, a continued cherry-pick, an autosquash and a reword in-process. They run the same Git commands the Playwright specs run today against the same capture code, with only the dates changed, so slices 2 to 4 own their first runs. |
| Baseline for the timing promise (slice 7, measured in slice 1) | CI medians over main runs 44528572337, 44512335806, 44503789713, 44500660591 and 44494044199: 27.5 s for the five specs that move whole (16 cases), about 40 s with the moved share of the two partly moved specs. Slice 1 measures the local Playwright baseline before deleting a case. |
| Which specs still use the support this plan removes from (slice 7) | Search for `DefaultMainSessionWork` and `sessionCheckoutGit`: the seven moved specs, and `ad-hoc-session-branch-handoff`, `ad-hoc-session-commits-done`, `ad-hoc-session-commits-pending-done` and `kept-commits-release`, which stay. No `e2e/` or frontend spec uses them. The staying specs bound what slice 7 can delete. |

## Ordered slices

### 1. A session's commit is kept at Done, proven in-process from MakeMe checkout work

Type: Behavior
Status: planned

Behavior: Given a stored record for a session established an hour ago in a
Default main checkout at `base` and a commit made there half an hour ago,
when a plain Node Vitest case marks the session Done ten minutes ago through
`setRecordDoneAt`, the kept record holds one run from `base` to the commit.
The review handler answers `session-commits` for that run. One capture case
advances trunk until the commit leaves every branch and checks that the
comparison stays readable.

The two review-only cases build kept records and a real repository. Call
`storyReview` for an established session with both a landing and a later
kept run, and observe the landing and its added file. Call `reviewedFileText`
for a kept run, and observe both sides for the exact pair and the existing
409 for a mismatched pair. These two cases need no store setup or Done call.

The checkout-work builder and performer arrive with the commit and push
steps the capture cases use. Before any case is deleted, record the
Playwright run time of all seven affected specs in one session with the
load. Delete the Playwright versions of these four cases, including the
file `ad-hoc-session-commits-file-text.spec.ts`.

Proof: The cases pass through `npm run test:dashboard:backend -- review/`
with a filter naming the new spec, and appear in the group's times and proof
record. Each fails under a scratch edit disabling its rule in the capture or
review modules. The builder's and performer's own cases under
`Distribution/tests/` pass. The remaining Playwright cases of
`ad-hoc-session-commits` pass.

### 2. Runs across trunk work taken into the checkout are proven in-process

Type: Behavior
Status: planned

Behavior: Given the same kept session and checkout work with commits either
side of trunk work pulled, merged or rebased onto, when the case marks the
session Done, then the kept runs and the review answer are those the six
cases of `ad-hoc-session-commit-runs.spec.ts` state today: two runs oldest
first without trunk's changes, an amended and rebased pair as one run as
pushed, a commit rebased onto fetched trunk kept as rebased, and a commit
made before the session and rebased during it not kept. The checkout-work
steps gain the amend and the four ways of taking trunk in. The spec is
deleted.

Proof: The six cases pass through the focused backend run. Each fails under a
scratch edit to the placing rule it depends on in
`sessionCommitsCapture.ts`. The performer's cases for the new steps pass.

### 3. Rewritten commits are kept as they ended, proven in-process

Type: Behavior
Status: planned

Behavior: Given checkout work that continues a conflicted cherry-pick, or
autosquashes a fixup or a squash, when the case marks the session Done, then
the run holds the commit as it ended with the session's resolution or both
files. The steps gain the continued cherry-pick and the autosquash.
`ad-hoc-session-commit-rewrites.spec.ts` is deleted.

Proof: The cases pass through the focused backend run and each fails under a
scratch edit to the `committing` or `replaying` pattern it depends on. The
performer's cases for the two steps pass.

### 4. A Done that captures nothing says why, proven in-process

Type: Behavior
Status: planned

Behavior: Given a kept session whose checkout work is an uncommitted edit, a
commit on another branch, a reworded commit in either form, a `HEAD` log that
cannot be read, or a log without an entry, when the case marks the session
Done, then the session is done and the review handler answers
`landing-unavailable` with the explanation each case states today. The steps
gain the edit, the commit on another branch and the reword. The six
Playwright cases are deleted from `ad-hoc-review-unavailable.spec.ts`.

Proof: The cases pass through the focused backend run. Each fails under a
scratch edit that makes the capture keep a run or changes its explanation.
The launch case that stays in `ad-hoc-review-unavailable.spec.ts` passes.

### 5. A checkout shared with another open session is said so, proven in-process

Type: Behavior
Status: planned

Behavior: Given two kept sessions open in one Default main checkout, each
with a commit, when the case marks one Done, then its review holds the
commits made while it was open and says the checkout was shared. A session
open meanwhile in an isolated workspace, and a session done before this one
launched, do not share it. `ad-hoc-session-commits-shared.spec.ts` is
deleted.

Proof: The three cases pass through the focused backend run and each fails
under a scratch edit to `checkoutSharedMeanwhile`.

### 6. The references a Done keeps, and their release, are proven in-process

Type: Behavior
Status: planned

Behavior: Given a kept session with a commit, when the case marks it Done,
then the repository holds references for only the comparison pair, and
deleting the record through `deleteRecord` releases them. A later Done whose
log cannot be read releases the earlier capture's references; a later Done
keeps its pair when the repository is also reachable through the old path;
and deleting a record whose later capture failed releases what its earlier
Done created. `kept-commits-release-after-done.spec.ts` is deleted.

Proof: Run these four cases with only the launch store and real Git state
the capture and release use. Each passes in the focused backend run and fails
under a scratch edit to the keep or release it depends on in
`launchRecordPins.ts` or `doneCapture.ts`. `kept-commits-release.spec.ts`
passes.

### 7. The backend guidance states the family's rules, and spent support is gone

Type: Behavior
Status: planned

Behavior: A contributor reading `dashboard/backend-tests/README.md` finds,
under "Which entry a case uses", the rules this family adds: state a
checkout's work through MakeMe; state times against the case's clock; a store
function under a native operation is the entry when the kept record is the
whole fact the case adds. A review-only case passes the kept state directly
to its handler. The existing guidance on stored documents applies to cases
that exercise the store. Every method of `DefaultMainSessionWork` and every
function of `sessionCheckoutGit.ts` and `adHocReview.ts` with no caller left
is deleted. The moved cases' summed case time at two workers is at most half
of slice 1's Playwright baseline for the same cases.

Proof: A search over `dashboard/` and `e2e/` for each exported function and
method of the three support modules finds none without a caller. Every path
and function the README names exists. `npm run test:dashboard:backend --
review/` with `_TIMES` set and a filter naming the new specs reports the
summed time with case count, worker count and load beside the baseline.
`ad-hoc-session-commits-done`, `ad-hoc-session-commits-pending-done`,
`ad-hoc-session-branch-handoff` and `kept-commits-release` pass. `npm run
lint` and `npm run typecheck:dashboard` pass.

## Proof map

| Promise in the seed | Slice |
| --- | --- |
| Every in-scope case moves, including both review-only cases | 1–6 and the owner table |
| Done marked through `setRecordDoneAt` with a stated time; a record deleted only where release is the behavior | 1, 6 |
| Times stated against the case's clock | 1–6 |
| Capture cases start with the stored launch document and real Git checkout work stated through MakeMe | 1–6 |
| Review calls use typed kept records; the landing and file-text cases need only those records and a real repository | 1–5 |
| The lifecycle specs keep proving the wire's path into the capture | 7 (the staying specs pass) |
| At most half the Playwright summed time | 1 (baseline), 7 |
| README rules | 7 |
| Spent test-support deleted, nothing added outside MakeMe | 7 |

## Current decisions

- Read the current handler input and MakeMe builder signatures before moving
  cases. The handler entry points stay the same across the contract correction.
- The new cases are Vitest specs in
  `dashboard/backend-tests/review/`, named for what Done keeps.
- The checkout-work builder's exact step names and whether it extends the
  repository builder or stands beside it are the executor's choice within
  Approach: steps are data with a time and a name, real Git performs them,
  and the performer answers each named commit.
- Partly moved specs keep their remaining Playwright cases in place.
- The server gains no clock seam.

## Proof and local gates

Follow the [shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Keep default timeouts and omit `test.slow()`. Apply
[dough-makeme](../../../.agents/skills/dough-makeme/SKILL.md) to affected
test sources.

- **Focused:** `npm run test:dashboard:backend -- <paths>` for backend specs
  and `bash scripts/test.sh <paths>` for `Distribution/tests/`, with
  `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES`. The
  execution checkout needs `npm ci` for the Playwright half.
- **Broader runs:** slice 7 runs the whole `review/` backend folder once,
  because it deletes support the staying specs share. Use Homebrew bash 5 and
  run on awake macOS on AC with `caffeinate -s -i`. On battery, follow the
  [open-lid procedure](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
- **Lint and typecheck:** `npm run lint` and `npm run typecheck:dashboard`.

## Plan review

Slice-plan refinement was not needed: seven slices, each one outcome with its
own proof, and every seed promise mapped. Slices 2 to 4 each add the
checkout-work steps their own cases use, so no step is built ahead of a case
that needs it. Slice 1 carries the builder's first form and the four cases
from the two initial specs. It keeps the two review-only arrangements at the
typed handler so they add no capture setup or new checkout-work steps. Until
slice 7, support methods the deleted specs used may remain without a caller.
Slice 7 removes them. This review found no remaining slice-specific concern.
