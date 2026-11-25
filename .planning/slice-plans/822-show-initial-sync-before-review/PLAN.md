# Show initial sync and open the requested review when ready

**Source:** [SEED-438](../../seeds/SEED-438-show-initial-sync-before-review.md#show-initial-sync-before-review)

**Identity:** SEED-438#show-initial-sync-before-review

## Goal and scope

Opening **Review changes** on a cold project starts or joins its initial sync
and shows its status. When the published history is ready, resume the same
review automatically. A failed attempt explains the cause and offers
**Retry sync**. Keep the warm review and historical-source behaviors from the
seed. This increment covers on-demand story review. Scheduled prewarming,
cross-restart job resumption, and the Board migration are deferred.

## Current decisions

- [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  makes the configured origin authoritative. Use the Dashboard's Review
  repository with the execution checkout absent. [ADR 0002, Software
  development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  supports one model and transport for both sync lifetimes.
- Follow [Share one refresh for published Dashboard Git reads](../../NORTH-STAR.md#share-one-refresh-for-published-dashboard-git-reads).
  Extend the existing [Review repository](../../../dashboard/server/reviewRepository.ts)
  and [Git fetch serialization](../../../dashboard/server/gitTargetFetch.ts).
  Reuse the exact configured ref and the repository's mutation ordering through
  child exit. [SharedObservation](../../../dashboard/server/sharedObservation.ts)
  already separates per-caller waits from a server-owned operation. Reuse that
  lifetime mechanism where it fits. Its short-lived success reuse and dropped
  failures alone cannot answer the initial-sync status contract. Keep one
  owner for that status, the active attempt, and its verified result. Do not
  add a second repository, independent writer, or new refresh scheduler.
- Coordinate that seam with [SEED-430, Board and Review shared refresh](../../seeds/SEED-430-read-published-project-data-from-local-git.md).
  Its fixture-routing work landed at `f05e15351`. The explicit Git origin
  route used by Review fixtures keeps precedence. The published-progress
  successor carries the remaining shared Board and Review work. Use the
  current Review repository for this increment and recheck project, origin,
  and relevant ref when deciding whether a verified observation covers
  the request.
- A state-changing start or retry uses the existing Dashboard local request
  admission, accepts a configured project identity, and resolves the origin
  and target on the server. Status reads observe the same attempt. Publish
  readiness only once the configured published trunk is verified and locally
  readable. Other ref fetches, partial transfers, and stale status responses
  cannot establish readiness. On ready, the original request still undergoes
  usual story, branch, and comparison admission, including pinned historical
  source. Reuse the observation for that open when it covers the demand so
  completion does not depend on a duplicate initial fetch.
- Keep the first sync alive under its own progress and shutdown policy.
  Count advancing work through the Git boundary, including byte progress
  during a large transfer. A connected process or repeated message cannot
  indefinitely defer a stall. Bound retained diagnostics, surface the
  existing safe failure details, and release the writer only after Git closes.
- Follow North Star's [direct production test seams](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support),
  [act as soon as the page allows](../../NORTH-STAR.md#act-as-soon-as-the-page-allows),
  and [plain Vitest boundary](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e).
  Use typed sync requests, a controllable origin and elapsed time at the Git
  boundary, and the real browser journey for user-visible transitions.
  Reuse the fixture origin and existing Review changes page object.

## Premises and baselines

Observed on 2026-11-25 in the preparation checkout at `154723527`, with
Node 24.21.0 and Apple Git 2.50.1.

| Consuming operation | Observation | Remainder |
| --- | --- | --- |
| Cold Done review waits on origin within the open's budget | `node --experimental-transform-types --input-type=module` called `publishedStoryReview` with an isolated bare Review repository, its existing sleeping-SSH fixture pattern, and `ReviewSyncDeadline({ syncedMs: 1000, neverSyncedMs: 1000 })`. It returned `unavailable` with the origin timeout in 1,002 ms and left `lastSync` empty. The production initial budget is 50,000 ms. | This reproduces the deadline path at a short interval. The exact error from the deployed request remains unknown. Slice 3 changes the bounded entry and exercises the full journey. |
| Exact initial Git fetch can report progress before the published ref is ready | `git fetch --progress origin +refs/heads/main:refs/remotes/origin/main` against isolated smart HTTP served by `git http-backend` delivered 140 incompressible blobs in chunks, with an injected 1.8-second pause. The first live receive report arrived at 0.17 s, receive progress reached 142/142 at 24.27 s, and the process exited successfully at 24.30 s. `git rev-parse --verify refs/remotes/origin/main^{commit}` then matched the origin commit. | This establishes a usable local transport observation for the large pack case. Slice 2 verifies bounded inactivity, advancing transfer and Git processing, and clean retry through the Dashboard runner. The live GitHub incident was not replayed. |
| Server observation is independent of waiter timeout | `caffeinate -s -i npm run test:dashboard:backend -- shared-observation.spec.ts --workers=1 --reporter=line` passed 6 Vitest cases. A second demand of the same key joined the job after the first demand timed out. Concurrent different keys waited and a failed observation rejected its waiters. | Slice 1 proves the project's verified success and late status through the HTTP boundary. Slice 2 keeps failed status available for explicit retry. |
| Shared comparison, warm fallback, and exact local file reads | `caffeinate -s -i npm run test:dashboard:backend -- story-review-completed-shared-fetch.spec.ts story-review-completed-offline.spec.ts story-review-offline-sync.spec.ts story-review-completed-gaps.spec.ts --workers=1 --reporter=line` passed 11 boundary and 6 Vitest cases. The cases include concurrent Done fetches, cold and warm failures, local files, comparison gaps, and a Taken open sharing one deadline across trunk and branch. | Slices 1–2 exercise new job ownership and preserve the warm path. Use the shipped test commands to rerun the affected callers. |
| The card opens a Done comparison and Intent uses its historical revision | `caffeinate -s -i npm run test:e2e -- story-review-completed.spec.ts intent-story-completed-source.spec.ts --workers=1 --reporter=line` passed 3 cases. The card reached the correct diff with the execution checkout moved. Historical locations and source remained tied to the completion and the history-gap case showed its distinct cue. | Slices 3–4 exercise the handoff through the same card, including the cold and recoverable states those cases do not supply. |

## Ordered slices

### 1. Start or rejoin one verified first sync

Type: Behavior
Status: done

Behavior: Given a configured cold project, concurrent start and status
requests see one running sync. When all waiting requests disconnect, the
sync continues. Late status sees running or ready. Ready exposes only a
locally readable commit fetched for the configured published target.

Proof: Use the authenticated local boundary with a cold bare Review
repository and an execution checkout absent. Hold an exact fetch open, send
overlapping requests, disconnect them, and query status before and after
releasing origin. Count one fetch and verify the resulting target commit.
Reject unknown and cross-site requests without starting Git. A release of
the child with the wrong or missing ref cannot yield ready. Exercise the
same repository's ordinary fetch path during this operation to prove its
write ordering. The bounded transport may keep an interim deadline until
slice 2. The existing Review consumer switches to this contract in slice 3.

### 2. Continue a progressing initial sync and recover a stopped attempt

Type: Behavior
Status: done

Behavior: A first sync that advances past the old review deadline stays
running. A quiet stall or origin refusal settles as failed. Status reports
the reason. An explicit retry starts or joins one new attempt after the
previous Git process closes. A server shutdown clears its running work.

Proof: Through the production sync and Git runner seams, use a controlled
slow origin plus a shortened clock or thresholds to cross the equivalent
of the old deadline and a no-progress interval without increasing suite
timeouts. Observe advancing Git work while transferring and verifying,
and distinguish it from repeated diagnostics. Drain output, verify that
the worker stops on inactivity, and confirm retry succeeds after both
stall and refusal without overlapping writers. Exercise shutdown while
the child is active. Rerun the warm offline and deadline baselines.

### 3. Open the requested review when its initial sync completes

Type: Behavior
Status: done

Behavior: A cold story review answers promptly with the need for initial
sync. Review changes presents **Running initial sync** while following the
project status. On ready it automatically resumes the original request and
recovers its normal comparison, files, and historical source. A pane that
closes or changes stories stops waiting for its earlier request.

Proof: Extend the real browser journey from the Done story card through a
held origin, release after the review wait would have expired, and assert
the selected story's historical revision, first changed file, and readable
historical source. Use two tabs or different selected stories to show
joining, leaving, and selecting again without stale completion replacing
the current story. Distinguish a typed pending answer from ordinary
unavailability at the review boundary. Keep the sync failure visible in
the interim. Slice 4 adds its recovery action.

### 4. Retry initial sync from the review pane

Type: Behavior
Status: planned

Behavior: A failed first sync shows its reason and **Retry sync**. Reopening
shows that failure until a retry. A developer can retry and reach the same
review after origin recovers. An already-synced review after a failed
refresh shows its last readable comparison and notice. A history gap
after a successful sync keeps its historical-source explanation.

Proof: Use the Review changes page object to open on a refusing origin,
observe the failure and recovery action, restore origin, retry, and see the
original diff. Use slice 2 for stall and repeated retry timing. Exercise
the warm failure and historical-gap cases at their existing boundaries and
check that neither displays the initial-sync action.

## Execution context

- Story Branch Mode, publisher `dashboard-territory.local-open-dough`, agent
  `Honoka-chan`. The established workspace is
  `/Users/terryyin/git/open-dough/.worktrees/show-initial-sync-and-open-the-requested-review`.
  The local integration checkout is `/Users/terryyin/git/open-dough`.
- Starting revision `d8ecf133394e1aa0a45af4444e76234275f9838c`. The Take at
  `41b1f70fc0ddc01fc4cc4f08565e7b186c5d0e88` was confirmed on `origin/main`
  and `origin/codex/show-initial-sync-and-open-the-requested-review`.
- Checkout setup used Node `24.21.0`, the locked npm setup, and Dashboard
  typecheck. Chromium prerequisite validation passed on the same checkout.
- Codex observer for `terryyin/open-dough`, workflow `ci.yml` (`CI`), and
  `codex/show-initial-sync-and-open-the-requested-review`: coordinator
  `seed-438-honoka`, mailbox `/tmp/dough-ci-501/watch-wPO4WT`, PID `29930`,
  session `22122`, cell `g271:10`.

### Slice 1 evidence

`review-initial-sync.spec.ts` observes late status after cancellation, shared
writer order, exact ref readiness and failure when Git fetched a different ref.
`review-initial-sync-admission.spec.ts` verifies cross-site refusal with the
Review repository absent. Focused backend and existing Intent CI browser
checks and Dashboard typecheck passed. `s1-implementation.md` in the Git
evidence directory holds commands and trace. Story-branch observer registered
the accepted revision `04fb36330b917d44d5808bb3d7b5138d8b8265af`.

### Slice 2 evidence

`review-initial-sync-progress.spec.ts` observes Git object and byte increments
past the scaled former limit, a stall under repeated output, refusal and shared
retry after Git closes, and shutdown with an active transport. Forty focused
backend cases and Dashboard typecheck passed. `s2-implementation.md` in the
Git evidence directory holds commands and trace.

### Slice 3 evidence

The story branch accepted slice 2 at `8e639371a9790c200e19622a0c4ff91afe56ad1b`.
`story-review-initial-sync.spec.ts` verifies the typed pending answer, retained
failure, and exact continuation. The two-tab Chromium case verifies the original
comparison, first changed file, and pinned historical source after one initial
fetch. Focused backend and frontend checks, eight Chromium journeys, and
Dashboard typecheck passed. See `s3-implementation.md` in the Git evidence directory.

## Story obligations

### G1. Replace the interim request-era cutoff and prove retry

Reported: slice 1 — "Slice 2 replaces the interim original 50-second bound with Git progress-inactivity handling and explicit retry."
Story clause: "The sync outlives its review and status requests and keeps running while Git makes progress, including beyond the former per-open budget."
Disposition: proved by slice 2: `review-initial-sync-progress.spec.ts` advancing-transfer, stall/retry, origin-refusal, and process-shutdown observations

### G2. Connect the review opening to the verified target

Reported: slice 1 — "The new endpoint currently has no browser consumer."
Story clause: "When the server confirms readable published history, the pane automatically resumes the same review request, including its story and comparison selection."
Disposition: proved by slice 3: typed exact-target continuation and two-tab Chromium observations in `story-review-initial-sync.spec.ts`

### G3. Provide the retry action in Review changes

Reported: slice 2 — "The Retry sync control remains assigned to slice 4."
Story clause: "An open or reopened pane shows the specific failure and offers **Retry sync**, which starts or joins one new attempt."
Disposition: receiving slice 4

## Consumer trace

- The [exact review route](../../../dashboard/server/storyReviewExactReads.ts)
  and [typed handler](../../../dashboard/server/storyReview.ts) reach Done,
  Taken and named landings. Follow the cold state only for story opens
  requiring published history. Published and kept session opens, CI and
  follow-up readers retain their current admission and budgets. File reads
  keep their exact local admission. Trace shared callers before changing the
  common reader or fixture, and use their focused tests for unchanged behavior.
- The [review selection](../../../dashboard/src/useStoryReviewSelection.ts)
  and [Intent lens](../../../dashboard/src/useIntentStoryLens.ts) feed
  [historical Intent](../../../dashboard/src/useHistoricalIntentLocations.tsx)
  and [the first changed file](../../../dashboard/src/useFirstStoryChangedFile.ts).
  Carry the cold state through this chain. Keep the pending card opening until
  the same comparison has settled and historical source can use its revision.
  Check compact and expanded cues, including status announcement and keyboard
  access to retry, and release observation on selection or pane change.

## Local gate

Run focused tests and Dashboard typecheck for changed production boundaries.
Run long local checks fully awake with
[`caffeinate -s -i` on AC power](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
Follow the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
and [test conventions](../../../AGENTS.md). Apply
[post-change refactoring](../../../.agents/skills/dough-post-change-refactor/SKILL.md)
per slice before delivery. Use deterministic local timing and existing test
timeouts for the stall and long-transfer examples.

## Readiness review

Slice-plan refinement was unnecessary after splitting independently
observable start, transport recovery, review continuation, and pane recovery
transitions. They share one project sync state and one review continuation
rule. The interim deadline and missing retry action have named replacing
slices. No remaining slice-specific planning concern was identified.
