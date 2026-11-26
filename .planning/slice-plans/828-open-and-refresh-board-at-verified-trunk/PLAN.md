# Open the published Board at verified Git trunk

**Source:** [SEED-430](../../seeds/SEED-430-read-published-project-data-from-local-git.md#open-and-refresh-board-at-verified-trunk)

**Identity:** SEED-430#open-and-refresh-board-at-verified-trunk

**Split from:** The original Board plan 824 (`548a3814652df8782da71457ac3acffd973a2f08:.planning/slice-plans/824-open-published-board-from-local-git/PLAN.md`),
then on 2026-11-26 from this plan's open-and-Refresh outcome
(`6b267497e02efe0c5c24f0fdcccd17b900641fee:.planning/slice-plans/828-open-and-refresh-board-at-verified-trunk/PLAN.md`).
The durable confirmation, warm Refresh and Refresh recovery slices (former
2, 6 and 7) moved to
[plan 853](../853-refresh-published-board-in-place/PLAN.md).

## Goal and scope

Open the Board at an origin-verified trunk revision without depending on the
execution checkout or GitHub REST membership. A cold open that cannot verify
trunk shows no Board and says why. Remove the REST membership dispatch and
everything that loses its last caller with it.

Exclusions: visible confirmation time, manual Refresh, durable confirmation
and fetch elision (plan 853); automatic observation, branches, other records
and Review callers ([plan 823](../823-follow-published-progress-from-local-git/PLAN.md)).
Each open checks origin. Where the verified commit is already in the Review
repository, skipping the transfer is permitted but not promised here.

## Current decisions

- Follow [Share one refresh for published Dashboard Git reads](../../NORTH-STAR.md#share-one-refresh-for-published-dashboard-git-reads).
  [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  makes origin authoritative and separates the Review repository from the
  execution checkout. [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  guides the shared domain model through server, wire contract and UI.
- Extend [Review repository storage](../../../dashboard/server/reviewRepositoryStorage.ts)
  and its [bounded Git fetch](../../../dashboard/server/gitTargetFetch.ts).
  Review's tracking ref and sync record stay Review's: moving the tracking
  ref is not a Board verification (see premises). Keep Review readers working
  against the same repository.
- Probe the configured ref with `ls-remote --exit-code`, then fetch
  `refs/heads/<ref>` and accept it only when `FETCH_HEAD` is the probed
  commit. Fetching the probed SHA still returns that SHA after the branch
  moves, so a move is visible only on the ref fetch. Do not update
  `refs/remotes/origin/*`. An empty `remote.origin.fetch` override does not
  stop that update once `+refs/heads/*:refs/remotes/origin/*` is configured;
  a fresh Review repository sets only the URL, and a Board verification
  fetch must still leave the tracking ref unmoved when a refspec is present.
  Read the backlog at that immutable commit with the existing Git
  reader seams in [published story history](../../../dashboard/server/publishedStoryHistory.ts).
  Seed the pinned backlog memo with `PinnedMemo.remember` where reachability
  still consults it, then call `observeProjectRevision`. Keep the admission
  predicates in [authenticated reads](../../../dashboard/server/authenticatedRead.ts),
  [reachable paths](../../../dashboard/server/reachablePaths.ts),
  [branch reachability](../../../dashboard/server/branchReachability.ts)
  and [records beside the backlog](../../../dashboard/server/recordsBesideBacklog.ts).
- Classify transport outcomes with the seed's transport evidence under
  `LC_ALL=C`: 401/403 stderr is refusal and takes the established refusal
  path; exit 2 under `--exit-code` after a successful probe is a missing
  trunk; any other 128, including "Repository not found" and an
  unrecognized message, is unavailable. A gate failure keeps its specific
  stderr and then Git's generic remote-repository trailer, so match
  `could not read Username` and `returned error: 403` before treating that
  trailer as unavailable. A missing ref exits 2 with empty stderr.
  `Authentication failed` stays unavailable. Reuse a check only for the same
  project, origin URL and machine gh credential.
- Own the probe-to-read interval in [SharedObservation](../../../dashboard/server/sharedObservation.ts):
  bounded waiters, a departing waiter releases only its own wait, a
  different project gets its own check. Keep the Board's 30-second
  [browser read bound](../../../dashboard/src/authenticatedReadRules.ts)
  apart from Review's 50-second cold sync allowance.
- The switch point is the `ref` case in
  [performed reads](../../../dashboard/server/performedRead.ts), which today
  calls `resolveRevisionViaGh`. Its `askedAt` stays the observation start for
  launch reconciliation. Delete the REST dispatch when it switches, with no
  fallback that could answer a failed Git check. `resolveRevisionViaGh`
  keeps its callers in `revisionChecks.ts`, `feedbackMaintenanceCheck.ts`
  and `followUpStory.ts`; `backlog-at` and pinned reachability keep reading
  through `PinnedTexts`.
- Follow North Star's
  [direct production test seams](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support),
  [act as soon as the page allows](../../NORTH-STAR.md#act-as-soon-as-the-page-allows),
  and [plain Vitest boundary](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e).
  Focused unit cases use a configured project, a real fixture Git repository
  and a controlled origin only where timing or failure must be controlled.
  Browser proof stays at user-visible transitions.
- Hold a real Git transfer by pointing the Review repository's
  `remote.origin.uploadpack` at a gate script, as the landed
  [Review initial sync case](../../../e2e/review/story-review-initial-sync.spec.ts)
  does. Slice 2 lifts it into test support for the browser and backend
  shared-open, first-open and pending cases. The probe runs inside the
  Review repository against the remote name `origin`, so `ls-remote` and fetch
  both pass through the gate.
- Reuse the MakeMe [repository materializer](../../../Distribution/tests/support/repository-fixture.mjs),
  `publishes()` and the movable Git fixture. Git and the retained REST detail
  answers use the same published commit IDs.
- Request-list assertions that exist to prove detail, recovery or
  credit reads stop naming the membership operation before the switch
  (slice 3); assertions whose promise is the membership read itself move to
  the Git check at the switch (slice 4) or retire with it.

## Premises and available baselines

| Consuming operation | Observation | Remainder |
| --- | --- | --- |
| Transport probe of refusal, unavailability and absence (slices 1, 5) | On 2026-11-25 at `75182dd87`, the Review transport's exact `ls-remote` (gh credential helper, `GIT_TERMINAL_PROMPT=0`, `LC_ALL=C`) exited 128 for loopback 401, 403, 404, 503, a deadline-aborted held request, a closed port and GitHub "Repository not found". Stderr separated 401 ("could not read Username") and 403 ("returned error: 403") from connection failure and 503. A missing branch exited 2 under `--exit-code`. | A server-rejected credential ("Authentication failed") was not observed; it falls into unavailable by the decision above. |
| Exact candidate and move during transfer (slice 1) | On `9dc3e801e`, a scratch probe rejected the fetch when the ref moved from A to B between `ls-remote` and a gated transfer, then served B on retry. A real trunk with no backlog returned 502 without consulting REST. Three backend Playwright cases passed in 3.0 seconds with one worker. | None for sizing. |
| Review tracking ref is not a Board verification | At `2eb0dae6f`, `syncedReviewRepository` fetched A; after origin advanced to B a read-only sync record made the next sync reject with `EACCES` while the tracking ref had already moved to B. | Slice 1 reads only the probed commit ID. |
| Shared held Git opens (slice 2) | On `9dc3e801e`, a scratch HTTP probe held real transfers for two projects; two opens of the first obtained one pin with one fetch and the second project fetched separately (1.9 seconds). The `remote.origin.uploadpack` gate holds the landed Review initial-sync browser case. On 2026-11-26 with Git 2.x on this machine, a bare repository whose `remote.origin.uploadpack` named a logging gate ran the gate for `git ls-remote --exit-code origin refs/heads/main`, but not for the same probe by URL. | Check-wide waiter cancellation is proved in slice 2 itself. |
| Membership assertion surface after the fixture gate (slices 3, 4) | On 2026-11-26 at `6b267497e` (fixture qualification landed at `524f99699`), a scratch change pointed only the `ref` case at `syncedReviewRepository` plus `rev-parse` of the tracking ref, keeping REST `backlog-at`. Run with `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run test:e2e -- <files> --workers=2 --reporter=line` and `npm run test:dashboard:backend -- <files> --reporter=line`. Of the ten E2E files that name `"ref main"`, 13 cases failed and 2 passed. Twelve failures were request-list equalities that lost `"ref main"` (some then gained a later `listing .planning/done@…` in the compared window); four of these are `shared-observer-reads.spec.ts`, which holds the REST ref with `origin.hold("main")`. `limit-recovery-tabs.spec.ts` failed because its no-snapshot state came from a limited membership read. `direction-disclosure.spec.ts` failed two cases only on `pathsRead` counting `main`; the phone Board, `auto-refresh-branches` and `auto-refresh-rate-limit` passed. `limited-reading-membership.spec.ts` failed (its promise is the REST membership limit). Backend: `authenticated-read-shared` "two opens resolve the ref once" and `first-open-waits-for-read` "waits for a read slower than an expect's bound" lost their held REST ref; "fails for good" became a transient backlog failure. The other 6 backend cases passed. The scratch change was reverted. | Slice 3 owns the twelve detail/credit/recovery equalities except shared-observer-reads, plus `limit-recovery-tabs` (limit a detail read instead) and direction disclosure. Slice 4 owns shared-observer-reads, the three backend cases and the membership-limit retirement. |
| Backend cold-open conversions (slice 4) | At `2d6b55306`, an explicit scheduled `since` read and holding `matching-refs` restored the cooldown cases; gating the actual Git fetch through `pathPrefix` and releasing it to a real origin kept the first-open pending and rendered-Board assertions. Four cases passed in 14.2 seconds. | "Fails for good" becomes a missing trunk (exit 2), which is terminal by the classification above. |

Use the
[consumer trace procedure](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
when changing a reader or fixture.

## Outside-in proof

| Promise | Proof owner |
| --- | --- |
| Exact origin pin and backlog, including a move during transfer and refused, missing or unavailable transport | Slice 1 at the candidate seam with real file origins; slice 5 at the Board. |
| Eligible opens share, projects are isolated, a waiter can leave, the wait is bounded | Slice 2 at the service boundary; slice 4 in the browser. |
| Cold Board opens without an execution checkout or REST membership | Slice 4: exact rendered revision, zero REST membership calls. |
| Cold failures show no Board and never fall back | Slice 5. |
| Superseded membership paths lose their last use | Slice 4 deletes the dispatch; slice 6 deletes what remains orphaned. |

## Ordered slices

### 1. Verify an exact origin trunk candidate

Type: Structure
Status: done

Change: At the Git boundary, probe the configured ref, fetch the exact
advertised commit into the Review repository with the bounded fetch, reject
a different fetched commit, and read the backlog at the probed commit.
Classify refusal, missing trunk and unavailable. The Board route is
unchanged until slice 4; this enables slice 4.

Proof: Accepted at `verifiedOriginTrunk` in `verified-origin-trunk.spec.ts`.
`materializeRepository` and `makeMe` set the origin; the held and refusal
cases set `remote.origin.uploadpack` and the hold waits on a fifo. Six tests
observe the published bytes, the moved backlog, a rejected move then revision
B, missing trunk, an unreadable backlog, `GhFailure` 401/403, and unavailable
for any other 128. The spec and `npm run --silent typecheck:dashboard` exited 0.

### 2. Share bounded Git checks between eligible opens

Type: Structure
Status: planned

Change: Run the slice 1 check inside SharedObservation keyed by project,
origin URL and credential. A qualifying open joins; a departing waiter
releases only itself; a different project checks independently; the Board
deadline ends the wait. Lift the upload-pack gate into test support. This
enables slice 4's held-open proofs.

Proof: Hold the real transfer, join a second open, cancel one and release the
other; show a second project progresses and deadline disposal. Budget 14
active minutes.

### 3. Prove detail and recovery reads apart from membership

Type: Structure
Status: planned

Change: In the E2E cases the premise lists for slice 3, compare only the
detail, credit and recovery reads each case promises, leaving the
membership operation out of the compared list and window. Rebase
`limit-recovery-tabs.spec.ts` on a limited detail read beside a shown
snapshot. Count only backlog paths in direction disclosure. All stay green on
REST. This enables slice 4's switch without touching these proofs.

Proof: The changed files pass on REST; rerun them under the slice 4 switch
when it lands. Budget 14 active minutes for ten mechanical cases and one
setup change.

### 4. Open the Board at verified Git trunk

Type: Behavior
Status: planned

Behavior: With an accessible origin and an absent execution checkout,
opening the Board shows the backlog at the exact verified commit. Two tabs
opening one project share one held check; closing one leaves the other to
finish.

Proof: Switch the `ref` case to the shared check and delete its REST
dispatch. Move `shared-observer-reads.spec.ts` and the backend shared-open
and first-open cases to the upload-pack gate; make "fails for good" a
missing trunk. Retire `limited-reading-membership.spec.ts` and the membership
limit control it alone used. Check exact rendered revision and zero REST
membership calls. Run the slice 3 files and the affected observation
suites. Budget 14 active minutes.

### 5. Report cold Git failures at the Board

Type: Behavior
Status: planned

Behavior: An unavailable origin, missing trunk or unreadable backlog shows no
cold Board and names the problem as unavailable; an explicit refusal keeps
its established outcome. A pending open ends at the Board deadline and later
recovers.

Proof: Wire mapping and rendered states with a REST fixture that would answer
membership, showing zero fallback attempts. Preserve first-open failure wait
and cross-project isolation through the real Git boundary. Budget 12 active
minutes.

### 6. Retire the old membership-only support

Type: Structure
Status: planned

Change: Remove orphaned Board-specific REST handling, helpers, test controls
and docs that no caller reaches after slice 4. Keep `resolveRevisionViaGh` at
its three remaining callers and the `backlog-at` and reachability readers.

Proof: Trace every deleted reference to its tests and docs; run the Dashboard
Backend Test and E2E Test suites. Budget 13 active minutes. Close any
temporary obligations under
[story obligations](../../../.agents/skills/dough-execute-plan/references/story-obligations.md).

## Learnings

Slice 1 overran twice on 2026-11-26 (`storyOverruns` 2): 18.5 minutes with no
edit, then 16.6 with the cases green and typecheck still red. Cold discovery
failed the size assumption. Slices 2–6 and the story boundary stay.

## Plan refinement

Refinement ran on 2026-11-26 after the fixture gate: the plan was resplit
(Refresh moved to plan 853), the membership assertion surface was remeasured,
and slices were redrawn so the request-list detachment precedes the switch.
No slice-specific concern remains beyond the budgets above.

## Execution identity

Story Branch Mode. Reused workspace `/Users/terryyin/git/open-dough/.worktrees/open-the-published-board-at-verified-git-trunk` on `cursor/open-the-published-board-at-verified-git-trunk`. Start `c0d3dd203089472846b871fb210367a733d6a618`. Publisher `dashboard-territory.local-open-dough`, agent Sola-chan. Claim `dbce520fce73758e1ac339949e5711d1e7a73dc8` on `origin/cursor/open-the-published-board-at-verified-git-trunk`. Trunk `origin/main`.

## Local gate

Run focused checks and Dashboard typecheck for each changed boundary. Slice 6
runs both full Dashboard suites because it deletes shared fixture controls.
Run long checks under `caffeinate -s -i` on AC power.
Follow the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
and select test conventions through [AGENTS.md](../../../AGENTS.md).
