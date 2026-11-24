# Read review files without fetching and answer failed syncs from the last sync

**Source:** [Read review files without fetching and answer failed syncs from the last sync](../../seeds/SEED-428-read-reviews-from-the-review-repository.md#read-review-files-without-fetching)

**Identity:** SEED-428#read-review-files-without-fetching

## Goal and scope

A bounded correction of the completed execution of
[Read published reviews from the Review repository](https://github.com/terryyin/open-dough/blob/5813f8d95b5816e984540785e4e3d0e439c2c1ff/.planning/seeds/SEED-428-read-reviews-from-the-review-repository.md#read-reviews-from-the-review-repository)
([plan 803](https://github.com/terryyin/open-dough/blob/5813f8d95b5816e984540785e4e3d0e439c2c1ff/.planning/slice-plans/803-read-reviews-from-the-review-repository/PLAN.md)). A
developer in **Review changes** gets, for every comparison kind, what that
story already promised. File switches read local Git only. A failed or hanging
sync answers from the last sync with the sync notice, or leaves a cold review
unavailable and names the failed sync.

Provenance: commits a7448680 (slice 1), bd0acbfd (slice 2), d354fbc6
(slice 3), 9531fa77 (slice 4), bc52c59f and 7fa6d36a (slice 5). Findings were
rechecked against `bb6c08f1` on 2026-11-24.

Included: findings F1, F2, F3, F4, F7, and F8 below.

Excluded, routed to
[SEED-430](../../seeds/SEED-430-read-published-project-data-from-local-git.md#read-published-project-data-from-local-git)
refinement:

- F5: a stale ref for a branch deleted on origin.
- F6: the shared, non-atomic sync record.

Excluded as already in place: Taken file reads, which already make no remote
request (`story-review-published-taken.spec.ts`).

## Preserved promises

Quoted from the original story. The correction restores them and adds none.

- "Switching files reads local Git only, so navigation stays fast and works
  offline."
- "File reads admit a file only when it belongs to the named comparison at its
  fixed endpoints, and they make no remote request."
- "A file request naming a path outside the comparison, or a head outside the
  last synced published branch, is refused without a fetch."
- "When a sync fails and the Review repository already holds the comparison,
  answer it with a sync notice. The notice names the problem and when the
  project last synced."
- "A cold review with no readable comparison stays unavailable and names the
  failed sync."
- "Resolve Taken story branch and trunk comparisons, Done story completions,
  accepted landing pairs, and recorded published session ranges from the
  project's Review repository."
- "Where those paths share a helper with review, the helper takes the
  repository it reads, and both keep working."

Constraints kept: attribution, comparison selection, **Include merged
changes**, and existing gap explanations stay unchanged. Concurrent opens still
share one fetch. CI keeps its execution checkout until SEED-430.

## Current findings

| ID | Severity | Finding at `bb6c08f1` | Promise broken |
| --- | --- | --- | --- |
| F1 | High | Landed-run and recorded-landing file reads sync from origin on every file switch. `admitLandedRun` (`storyReviewHistoricalFileAdmission.ts:186`) calls `landedStoryReview`, which calls `reviewRepositoryRead` (`storyReviewLanded.ts:64`). The recorded-landing branch (`storyReviewHistoricalFileAdmission.ts:228`) calls `recordedLandingReview`, which calls `reviewRepositoryRead` (`storyReviewPublishedLanding.ts:150`). Kept-session file reads reach `admitLandedRun` through `storyReviewSessionFileAdmission.ts:19`. Only Taken has no-remote-request proof. | Local-only file reads |
| F2 | Medium | A Done completion file read fetches when the named completion is absent. The named path in `storyReviewPublished.ts:34-43` calls `reviewRepositoryHolding` (`reviewRepository.ts:166`), which calls `commitPresentOrFetched`. The published-session source resolves file reads the same way: when the UUID's record is absent from the last synced trunk, `fetchedPublishedSessionSource` (`publishedSessionSource.ts:71`) syncs. | Outside requests are refused without a fetch |
| F3 | Medium | Published session reviews ignore a failed sync (`publishedSessionSource.ts:71-75`). A project that never synced gets "This machine has not synced this project's published trunk." instead of the shared `failedSyncExplanation` ("The review could not sync from origin…"). When a record is absent from the last sync and the sync fails or hangs, the answer is "This project published no such session." (`published-session-review-request.spec.ts` "a hung fetch…"), which hides the failed sync. Recheck: a session open syncs only when its record is absent from the last synced trunk. So a failed sync can never leave a readable session comparison, and every session sync failure is the cold case. A `syncFailure` notice on `published-session` answers would have no reachable case. | A cold review names the failed sync |
| F4 | Medium-low | A hanging origin (rather than a refusing one) times the open out. The open's response bound is `storyReviewWaitMs` (60s, `storyReview.ts:35-39`). Done, landed, and Taken syncs run under that same signal. `reviewSyncFailure` rethrows on abort. Taken runs two fetches one after the other (trunk, then branch). Sessions already use a separate 30s fetch bound (`storyReviewInput.ts:184`). | Answer from the last sync with the notice |
| F7 | Low | CI's Git-root guard in `checkoutStoryEndpoints` (`storyPublishedEndpoints.ts:67-90`, "The execution checkout no longer points to this project's Git root.") lost its only test when bd0acbfd replaced "an execution checkout cannot borrow a parent checkout's published history or file diffs". | CI keeps working on its checkout |
| F8 | Low | 7fa6d36a appended the Done offline reopen to `e2e/review/story-review-completed.spec.ts` and widened its title. No backend case covers the Done offline file diff. | Test-suite structure: one promise per test |

## Direction

- [North Star: Read published comparisons from the Review repository](../../NORTH-STAR.md#read-published-comparisons-from-the-review-repository).
  "serve file lists, diffs, and source from local Git" and "If origin is
  unavailable, keep the last readable comparison with its sync status." This
  correction completes the topic's file-read and sync-status parts. The
  original story's wrap-up still owns retiring the topic.
- [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#domain-concepts-and-relationships)
  defines the Review repository. No conflict.
- PFE: reuse `remoteRequestRecordingGit`
  (`dashboard/test-support/support/remoteRequestRecordingGit.ts`) for every
  no-remote-request proof. Reuse the hanging-origin pattern from
  `published-session-review-request.spec.ts` ("a hung fetch…": an `ssh://`
  origin URL with `core.sshCommand` set to sleep). Reuse
  `failedSyncExplanation`, `reviewSyncFailure`, and `withSyncFailure` from
  `reviewRepository.ts` for sessions. Do not write a session-only wording or
  notice.

## Current decisions

- **File reads never sync.** A file read admits against the comparison built
  from the refs the last sync left. Landed-run, recorded-landing, Done
  completion, and published-session file reads take a read-only path: the
  Review repository and its last-sync record, with no `syncedReviewRepository`
  call. A comparison, completion, reference, or session record absent from
  the last sync is refused with its existing refusal wording, without a fetch.
  The open that showed the file has already synced.
- **Named Done completions validate only against the synced
  `origin/<ref>`.** `publishedStoryEndpoints` already checks
  `merge-base --is-ancestor <completion> origin/<ref>`. Retire
  `reviewRepositoryHolding`. Then fold `commitPresentOrFetched` back into
  `fetchUnlessCommitPresent`, its only remaining caller.
- Follow-up launch admission (`admitPublishedStoryComparison`) uses the same
  read-only named path. It follows a review open, so it needs no fetch either.
- **A failed session sync is named.** `fetchedPublishedSessionSource` routes
  its sync through `reviewSyncFailure`. When the sync fails and the record is
  still absent from the last synced trunk, or the project never synced, the
  review answers the existing session-unavailable shape (`kind:
  "landing-unavailable"`, `comparison: "published-session"`) with
  `failedSyncExplanation`. "This project published no such session." stays
  only for a record absent after a successful sync. The "has not synced this
  project's published trunk" wording is removed. The `published-session`
  schema gains no `syncFailure` (see F3). The existing rule stays: an open
  whose record is present at the last synced trunk starts no fetch.
- **A review sync has its own deadline, shorter than the response.** Each open
  creates one sync deadline when it starts. Every sync of that open shares it,
  including both of Taken's. The deadline is 30s when the project has a last
  successful sync, matching the session fetch bound. It is 50s when the
  project has never synced, so a slow first sync of a large trunk still has
  most of the 60s response. When the deadline aborts a sync and the request
  has not aborted, `reviewSyncFailure` returns a failure naming the timeout
  ("origin did not answer within N seconds"). It does not rethrow. A request
  abort still rethrows. The deadline is a typed input of the readers, so
  backend proof can pass a short one.
- Fixtures: a hanging origin is made after the first sync by pointing the
  Review repository's `origin` at an `ssh://` URL with a sleeping
  `core.sshCommand` (the existing session pattern). Renaming the fixture
  origin stays the refusing-origin fixture.
- Trunk Mode or Story Branch Mode is the developer's choice at Take. No slice
  acts from trunk.

## Decisive premises and preparation observations

Observed on 2026-11-24 at `bb6c08f1` (merge of origin/main `7c8a41fd`) in the
execution checkout. Node 24.21.0, Git 2.50.1 (Apple Git-155), load average
about 10.

| Consuming operation | Observation and result | Remainder |
| --- | --- | --- |
| F1–F3 code paths are as listed | Read at `bb6c08f1`: `storyReviewHistoricalFileAdmission.ts:110-260`, `storyReviewLanded.ts:34-90`, `storyReviewPublishedLanding.ts:138-175`, `storyReviewPublished.ts:23-60`, `reviewRepository.ts`, `publishedSessionSource.ts:47-87`, `storyReviewInput.ts:172-187`, `gitTargetFetch.ts:95-128`. Every finding reproduces as described. | None |
| No-remote-request proof works in a Vitest backend spec that calls server functions | `story-review-published-taken.spec.ts:166-190` stubs `PATH` with `remoteRequestRecordingGit(home).bin` and asserts `remoteRequests()` is `[]` after file reads. `story-review-published-landing.spec.ts` uses the same Vitest style (`storyReview`, `reviewedFileDiff`). | None |
| No-remote-request proof works through a boundary dashboard server | `story-review-completed-shared-fetch.spec.ts` restarts the server with `pathPrefix: [recording.bin]` and counts fetches. `story-review-completed-offline.spec.ts` already runs in boundary mode on `ordinaryTrunkModeCompletedHistory()`. | None |
| A hanging origin holds a fetch open until aborted | Existing case `published-session-review-request.spec.ts` "a hung fetch lets the review answer from the last synced trunk" (`ssh://example.invalid/x.git` with `core.sshCommand "sh -c 'sleep 2'"`, 500ms bound) passes in plan 803's proof. Scratch check: a bare repository whose fixture-HOME `remote.origin.uploadpack` points at a `sleep 30` script hung `git fetch` until a 4s alarm (exit 142). Either fixture works without a network. | None |
| A shared fetch ends when its last waiter leaves | `OutstandingReads.waitFor` (`github-request-outstanding.mjs`) "ends once no requester waits for it". A 30s waiter bound therefore also aborts the shared fetch. This is why a never-synced project gets the longer 50s deadline. | None |
| A proof fixture reaches `recordedLandingReview` (a Done story whose published landing names a session reference) | No backend spec reaches it. `e2e/review/story-review-story-branch-landed.spec.ts:129-190` advances trunk, publishes a sealed session record with `sessionId` equal to the run reference (`sessionRecordPathBeside`, `sessionRecord`), and reads that run's review and files after retirement. That is the recorded-landing path. `story-review-completed-shared-fetch.spec.ts` shows that a test can close its dashboard and restart it with `startDashboardServer({ pathPrefix: [recording.bin] })`. Slice 1 therefore proves recorded-landing file reads in that journey, using a dashboard restarted with the recording wrapper. | None |
| The F7 guard is untested | Grep of `dashboard/backend-tests` and `e2e` (excluding `test-results`) finds no reference to "no longer points to this project's Git root" or `checkoutStoryEndpoints`. The deleted case is recoverable at `bd0acbfd^:dashboard/backend-tests/review/story-review-completed.spec.ts`. | None |

## Outside-in proof map

| Promise | Owning slice | Observation |
| --- | --- | --- |
| Landed-run and kept-session file reads make no remote request and still read after origin moves away | 1 | Backend `story-review-published-landing.spec.ts`: after one open, origin moves away under the recording wrapper. Admitted file diffs read correctly. A file outside the pair is refused. `remoteRequests()` is `[]`. |
| Recorded-landing file reads make no remote request | 1 | E2E `e2e/review/story-review-story-branch-landed.spec.ts`: after the recorded landing opens, the dashboard runs with the recording wrapper, and file switches record no `fetch` or `ls-remote` in the Review repository |
| Done completion file reads make no remote request; a completion outside the last synced trunk is refused without a fetch | 2 | Backend `story-review-completed-offline.spec.ts`: a synced Done review reopens offline, its file diff reads, and a completion beyond the last sync is refused. The wrapper records no `fetch` or `ls-remote` from the file reads. |
| Published-session file reads make no remote request; a session record absent from the last sync is refused without a fetch | 2 | Backend `published-session-review.spec.ts` with the recording wrapper |
| Done offline file diff covered by its own test (F8) | 2 | The backend Done offline case above. Then the E2E appendage is removed and the original title of `e2e/review/story-review-completed.spec.ts` is restored. |
| A session review whose sync fails names the failed sync | 3 | Backend `published-session-review-request.spec.ts`: a never-synced project opened offline, and the hung-fetch case for an absent record, each answer session-unavailable with "The review could not sync from origin". A record absent after a successful sync is still refused as unknown. E2E `e2e/sessions/recently-done-published-sessions.spec.ts` stays green. |
| A hanging origin answers from the last sync with a notice naming the timeout; a hanging first sync is unavailable and names it | 4 | Vitest backend `story-review-offline-sync.spec.ts` (Taken, both syncs) and `story-review-published-landing.spec.ts` (landed; the same `reviewRepositoryRead` path Done uses) call `storyReview` with a hanging origin and a short injected sync deadline. The boundary-server Done spec cannot inject the deadline, so it is not used here. |
| CI refuses an execution checkout that is not this project's Git root | 5 | One backend case in `dashboard/backend-tests/intent/` that moves the checkout's `.git` to its parent and expects the Git-root explanation from the CI comparison |

## Ordered slices

### 1. Read landed-run and recorded-landing files without a remote request
Type: Behavior
Status: planned
Proof: backend `dashboard/backend-tests/review/story-review-published-landing.spec.ts` with the recording wrapper; E2E `e2e/review/story-review-story-branch-landed.spec.ts` with the recording wrapper for the recorded landing; `e2e/sessions/recently-done-published-sessions.spec.ts` stays green.

Behavior: a landed run or recorded landing was opened, then origin moves away
→ the developer switches between its files → each exact diff appears, a file
outside the pair is refused, and no `fetch` or `ls-remote` runs.

Change: `admitLandedRun` and the recorded-landing admission build the pair from
the Review repository's last synced refs without calling `reviewRepositoryRead`.
Opens keep their sync. Kept-session file reads gain the fix through
`admitLandedRun`.

### 2. Read Done completion and published-session files from the last sync only
Type: Behavior
Status: planned
Proof: backend `dashboard/backend-tests/review/story-review-completed-offline.spec.ts` and `dashboard/backend-tests/review/published-session-review.spec.ts` with the recording wrapper; `story-review-completed-file-admission.spec.ts` and the follow-up launch specs stay green; then E2E `e2e/review/story-review-completed.spec.ts` with its appendage removed.

Behavior: a Done review or published session was opened, then origin moves away
→ the developer switches files → exact diffs appear with no remote request. A
completion beyond the last synced trunk, or a session record absent from it, is
refused without a fetch.

Change: the named-completion path reads the Review repository and relies on
`publishedStoryEndpoints`' ancestry check against `origin/<ref>`.
`reviewRepositoryHolding` is retired, and `commitPresentOrFetched` is folded
into `fetchUnlessCommitPresent`. Published-session file reads resolve the
record at the last synced trunk without syncing.

Test-suite correction (F8): first add the Done offline file-diff assertion to
the backend offline case. Then remove the offline reopen appended to
`e2e/review/story-review-completed.spec.ts` (its `renameSync` import and the
lines after "Origin becomes unreachable"). Restore the title "a CLI-completed
story without a local launch opens fixed published changes and file diffs after
trunk advances and its checkout moves". The removed E2E part caught regressions
in the offline file diff and the notice. The backend case now catches the
first. `e2e/review/story-review-offline.spec.ts` keeps catching the notice in
Intent.

### 3. Name a failed sync in published session reviews
Type: Behavior
Status: planned
Proof: backend `dashboard/backend-tests/review/published-session-review-request.spec.ts` and `dashboard/backend-tests/review/published-session-review.spec.ts`; E2E `e2e/sessions/recently-done-published-sessions.spec.ts` stays green.

Behavior:
- A project never synced has a published session opened while origin is
  unreachable → the session review is unavailable, with "The review could not
  sync from origin…" and the problem.
- A session whose record is not in the last sync is opened while origin hangs
  or refuses → the same failed-sync answer appears, not "This project
  published no such session."
- A session absent after a successful sync is still refused as unknown.

Change: implement the "A failed session sync is named" decision above.

### 4. Answer from the last sync when origin hangs
Type: Behavior
Status: planned
Proof: backend `dashboard/backend-tests/review/story-review-offline-sync.spec.ts` and `dashboard/backend-tests/review/story-review-published-landing.spec.ts` with a hanging origin and a short injected deadline; `story-review-completed-shared-fetch.spec.ts` and `e2e/review/story-review-offline.spec.ts` stay green.

Behavior:
- A Taken, Done or landed review was synced, and origin now accepts connections but
  never answers → reopen → the last synced comparison appears within the
  response bound, with a notice naming the timeout.
- A review never synced is opened against a hanging origin → it is unavailable
  and names the timed-out sync.

Change: implement the sync-deadline decision above. Taken's trunk and branch
syncs share one deadline. Sessions keep their existing 30s fetch bound,
expressed through the same input.

### 5. Restore the CI Git-root guard's backend case
Type: Structure
Status: planned
Proof: the new case in `dashboard/backend-tests/intent/` fails when the Git-root check in `checkoutStoryEndpoints` is removed, and passes with it in place; `dashboard/backend-tests/intent/ci-comparison-taken.spec.ts` stays green.

Correction: the CI comparison's refusal of a checkout that resolves to a parent
checkout's Git root lost its only test (F7). Add one small case to the CI
comparison specs. It moves the execution checkout's `.git` to its parent and
expects "The execution checkout no longer points to this project's Git root.".
It follows the deleted case's setup at `bd0acbfd^`, without the
parent-publication steps. Product code is unchanged.

## Concern evidence

Refinement was not needed. Each slice holds one finding's proof loop, and
slices 1–2 share one rule: file reads use the last sync only. Slice 2 carries
F8 because its new backend case is the replacement coverage the E2E removal
needs. This review found no slice-specific concern.

## Local gate

Run focused proof through
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npm run --silent test:dashboard:backend -- <spec paths>`
and `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npm run --silent test:e2e -- <spec paths>`
with the default strict reporter. Before landing, run the dashboard backend,
dashboard frontend, and E2E suites that read the moved review paths. Follow the
[shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
For long local checks on macOS, start awake on AC power under `caffeinate -s -i`.
Follow the [machine sleep guidance](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
for battery runs.
