# Open and refresh the published Board from local Git

**Source:** [SEED-430](../../seeds/SEED-430-read-published-project-data-from-local-git.md#open-and-refresh-board-at-verified-trunk)

**Identity:** SEED-430#open-and-refresh-board-at-verified-trunk

**State:** Awaiting story refinement. These mapped slices need realignment before execution.

**Split from:** The original Board plan 824 (`548a3814652df8782da71457ac3acffd973a2f08:.planning/slice-plans/824-open-published-board-from-local-git/PLAN.md`).
The fixture work was split into three preceding outcomes. This plan retains
the verified open, manual Refresh and cleanup.

## Goal and scope

Open the Board and refresh the currently shown Board at a confirmed origin
trunk pin without depending on the execution checkout. A failed fresh check
keeps an already shown confirmation and reports the failure. Automatic
observation, additional records and the migration of Review callers belong
to [the published-progress story](../823-follow-published-progress-from-local-git/PLAN.md).
This story owns removal of the superseded Board membership path and all
temporary code, tests, and documents used to reach the cutover.

## Approach comparison

| Approach | Consequence for the Board |
| --- | --- |
| Keep the existing REST ref lookup and use Git to verify and read the named pin | Reuses the current named-revision evidence. Each confirmation still depends on the GitHub API and its separate wait and recovery rules, as well as Git fetching the corresponding object. |
| Reuse Review's exact-ref fetch on every open and Refresh | Establishes local content in the right repository. A successful unchanged Refresh would still fetch, and the current Review fetch moves its tracking ref before saving its sync time. |
| Reuse Review's repository and bounded transport, with one verified observation as the commit point | Probe the exact origin ref, fetch only if needed, verify the backlog at the immutable revision, then publish that revision and its confirmation time together. A failed candidate leaves the prior confirmation readable. |

Select the third approach. Borrow the commit point from
[SQLite's atomic commit](https://www.sqlite.org/atomiccommit.html#deleting_the_rollback_journal).
Git can fetch candidate objects ahead of the commit point, while readers
switch to the candidate only when its observation is atomically published.
Here Git origin can move during the check, so independently establish
which commit origin confirmed and which commit was fetched. SQLite's
locking and power-loss guarantees do not transfer to this repository.

## Current decisions

- Follow [Share one refresh for published Dashboard Git reads](../../NORTH-STAR.md#share-one-refresh-for-published-dashboard-git-reads).
  [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  makes origin authoritative and separates the Review repository from the
  execution checkout. [ADR 0002, Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  guides the shared domain model through the server, wire contract, and UI.
- Extend [Review repository](../../../dashboard/server/reviewRepository.ts)
  and its [bounded Git fetch](../../../dashboard/server/gitTargetFetch.ts).
  SEED-438 moved the repository writer, pinned-ref verification, and sync
  recording into [Review repository storage](../../../dashboard/server/reviewRepositoryStorage.ts).
  The Board's observation must verify its own candidate and backlog before
  publishing confirmation. An initial Review sync can also fetch the target,
  so its tracking ref and sync record remain separate from Board confirmation.
  Reuse [SharedObservation](../../../dashboard/server/sharedObservation.ts)
  for lifetime, bounded waiters, and fresh demand. Match a project and
  authorized origin, the required refs, and freshness before joining a check.
  Let an uncovered demand share the next eligible check. The subscriber
  that disconnects releases only its own wait. Keep existing Review readers
  working against the same repository. The follow-up switches them to the
  observation used here for trunk.
- Use [published story history](../../../dashboard/server/publishedStoryHistory.ts)
  and the existing Git reader seams for local objects. Keep the pinned
  reader contract and existing admission predicates at
  [authenticated reads](../../../dashboard/server/authenticatedRead.ts),
  [reachable paths](../../../dashboard/server/reachablePaths.ts),
  [branch reachability](../../../dashboard/server/branchReachability.ts),
  and [records beside the backlog](../../../dashboard/server/recordsBesideBacklog.ts).
  Seed the existing pinned backlog memo with `PinnedMemo.remember` from the
  verified local text where reachability still consults it. Call
  `observeProjectRevision` and advance the memo's answered backlog after
  verification and confirmation publication. Keep the object available for
  its existing admitted lifetime.
- Use the configured source's exact trunk ref and immutable commit IDs.
  A ref move between probe and fetch cannot confirm an unverified candidate.
  Commit the revision and confirmation time together after the pinned
  backlog read. Keep observation start time for accepted-launch
  reconciliation and report failed attempt time separately. Ambiguous
  transport failure is unavailable. An explicit access refusal takes the
  established refusal path.
- Follow North Star's
  [direct production test seams](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support),
  [act as soon as the page allows](../../NORTH-STAR.md#act-as-soon-as-the-page-allows),
  and [plain Vitest boundary](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e).
  Extend the production seam or reuse existing fixtures. For focused unit
  cases, use a configured project, an admitted revision or required-ref
  demand, and a real fixture Git repository; substitute an origin response
  or provider only where the case must control timing or failure. Keep
  browser proof at user-visible transitions.
- The Board's cold open is the authenticated endpoint's `ref` read in
  [performed reads](../../../dashboard/server/performedRead.ts), which today
  resolves trunk through `resolveRevisionViaGh`. Switching it moves every
  Board open at once, so Board-opening fixtures first publish through a real
  origin routed by the fixture HOME (delivered by the
  fixture story SEED-430#read-published-project-data-from-local-git for
  committed origins, `publishes()` and the default answer)
  ([fixture origin routes](../../../dashboard/test-support/support/fixtureOriginRoute.ts),
  [published main](../../../dashboard/test-support/support/publishedMainFixture.ts)).
  Use one Git trunk path for Board open and manual Refresh. Delete the
  REST dispatch for authenticated `ref` when it switches, including any
  fallback that could answer a failed Git check.
- Trace the deletion from Board requests through the server handler, memo,
  transport and failure handling to their callers, tests, fixtures and docs.
  `resolveRevisionViaGh` still serves the fallback in `revisionChecks.ts` and
  the check in `feedbackMaintenanceCheck.ts`. The explicit `backlog-at`
  operation and pinned reachability still read through `PinnedTexts`. Keep
  those live paths and remove obsolete Board-specific branches, comments,
  test cases, and fixture adapters when their final use disappears. Tests
  for a live scheduled or detail behavior keep their proof at that caller.
- Reuse the MakeMe [repository materializer](../../../Distribution/tests/support/repository-fixture.mjs)
  for described history, `publishes()` for one publication, and the existing
  movable Git fixture for journeys that actually push. Both Git and the
  retained REST detail answers use the published commit IDs. Preserve the
  tests' differing record-failure inputs and control their failure at the
  boundary still responsible for it.
- Reuse the Board's [fresh read and attempt state](../../../dashboard/src/publishedObservation.ts)
  for Refresh. Carry the server's confirmation time distinctly from
  `askedAt`, which remains the start of the joined origin check.
  Preserve the current scheduled check and explicit-revision read path
  through the follow-up. Refresh is available from the selected Board and
  shares only an eligible check. An earlier automatic read cannot overwrite
  a later manual confirmation.
- Classify transport outcomes with the seed's
  [transport evidence](../../seeds/SEED-430-read-published-project-data-from-local-git.md)
  under `LC_ALL=C`. Reuse an observation only for the same project, origin
  URL, and machine gh credential.

## Premises and available baselines

| Consuming operation | Observation | Remainder |
| --- | --- | --- |
| Review transport probe of refusal, unavailability, and absence | On 2026-11-25 against this checkout at `75182dd87`, the Review transport's exact `ls-remote` (gh credential helper, `GIT_TERMINAL_PROMPT=0`, `LC_ALL=C`) exited 128 for loopback 401, 403, 404, 503, a held request aborted by its deadline, a closed port, and GitHub "Repository not found". Stderr separated 401 ("could not read Username") and 403 ("returned error: 403") from connection failure and 503. A missing branch exited 2 under `--exit-code`. One read-only probe reached the configured origin under the existing Review authority with the active gh account's `repo` scope. | A server-rejected credential ("Authentication failed") was not observed; slice 7 treats an unrecognized 128 as unavailable. |
| Board fixture reach | The [fixture audit inventory](../827-qualify-board-fixture-routing-and-request-boundaries/fixture-audit.md) attributes the remaining successful REST answers to their registered publishers. | Plans 824, 826 and 827 cover the fixed, moving and configured/direct-read fixtures and the pre-cutover suite gate. |
| Review's ref and stored sync time can diverge | In the same disposable HOME at `2eb0dae6f`, `syncedReviewRepository` fetched A and `git show A:.planning/PRODUCT-BACKLOG.md` read it. After origin advanced to B, a read-only sync record made the next sync reject with `EACCES`. The tracking ref had moved to B, the sync record still held A's time, and A was still readable by object ID. The probe ran through `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES node --experimental-transform-types --input-type=module` with `LC_ALL=C` and `GIT_ALLOW_PROTOCOL=file`. | Rules out treating the current Review tracking ref plus its sync time as a confirmed Board view. Slices 2 and 7 verify the new commit point and interruption recovery. |
| Recovery and fixture baselines | At `2eb0dae6f`, the three branch/check/recovery browser cases passed under `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run test:e2e -- e2e/observation/auto-refresh-branches.spec.ts e2e/observation/auto-refresh-recovery.spec.ts --workers=1 --reporter=line`. Separately the six `story-review-offline-sync.spec.ts` cases and two `committed-origin-actions.spec.ts` cases passed via `npm run test:dashboard:backend -- <spec>` under the same environment and sleep guard. | Automatic checks and Review offline behavior provide a preserved-behavior baseline. These runs did not exercise a manual Board Refresh. The Board has a fresh-read callback for launch reconciliation and uses page reload as a published-read recovery cue. Slices 6–7 expose and exercise the in-place Board action. |
| Representative cutover and migration | At `2eb0dae6f`, the phone Board and the first direction-disclosure case passed before a temporary cutover. The cutover pointed only the authenticated `ref` operation at existing `syncedReviewRepository`, `rev-parse` and `git show`. The phone Board with its committed origin passed. Direction disclosure lost its synthetic revision, seeing the fallback origin's empty backlog. Replacing that case's setup with a materialized MakeMe history and `publishCommittedOrigin` restored its exact rendered revision, direction and interactions. On REST the focused case observed the ref, pinned backlog and configuration reads. After cutover, it still observed the configuration read, while the ref and backlog calls were gone. Both scratch changes were reverted. | Run used `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run test:e2e -- e2e/navigation/phone-board.spec.ts e2e/stories/direction-disclosure.spec.ts --workers=1 --reporter=line` with grep for the phone Board and first direction case. The migration reruns selected only the first direction case. This sample covers one static publication and one consumer's call assertions. The moving histories, failed-check journeys and whole-suite assertion surface remain unmeasured. |
| Board's cold wait | The [browser read bound](../../../dashboard/src/authenticatedReadRules.ts) is 30 seconds. [Review's cold sync](../../../dashboard/server/reviewRepository.ts) allows 50 seconds. The production Review transport probe above fetched the disposable origin without reaching the Board boundary. | Slices 3 and 5 prove Board cancellation and recovery at the existing Board wait with a controlled origin and reports the real fixture timings. Review's cold allowance does not establish a Board check duration. |

Use the
[consumer trace procedure](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
when changing a reader or fixture. The retained audit checks only the first
served HOME per answer and only successful fake REST ref responses. Use it
for discovery and verify routed refs in each relevant HOME where the
consumer uses more than one. The suite after cutover proves that the
actual Board entry opens through Git.

At `c3bd0ac36`, the baseline preparation run selected seven cases and all
seven passed. The command was
`env -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run test:e2e -- e2e/navigation/phone-board.spec.ts e2e/observation/auto-refresh-branches.spec.ts e2e/observation/limited-reading-membership.spec.ts e2e/stories/direction-disclosure.spec.ts --workers=1 --reporter=line`.
A scratch cutover of authenticated `ref` to Review sync and `git show`
added `--grep 'touch pages|automatic check follows|limiting the membership|direction starts'`.
The phone Board passed. The moving-branch journey failed at its initial
Board membership. Direction disclosure lost its synthetic pin. The
REST rate-limit journey failed during the second project's initial Board
open, before it reached the throttle. The scratch edit was reverted.
The same four cases passed again after reverting it.
The moving-branch journey needs a real initial trunk and a real trunk move
to prove the existing automatic branch behavior. The scratch used Review's
existing fetch on every open, so it supplies no evidence about the proposed
confirmation or fetch-elision behavior.

### Preparation probes on 2026-11-25

- On `174c73f1f`, the existing phone Board, automatic branch progress, and
  automatic rate-limit browser cases all passed in 29.8 seconds. Replacing
  the branch-progress fixture's trunk with two MakeMe commits took about
  one active minute for this consumer once its fixture was traced. The
  routed origin started at the first commit. Its trunk-move step advanced
  the bare origin and the fake REST listing to the second commit. The
  complete journey passed with the existing REST membership path in 16.4
  seconds, including the conditional head listing, the exact displayed
  trunk pin and the pinned backlog request. The synthetic story-branch
  answers were left in place for the still-REST scheduled check and detail
  reads. A separate A/B conversion for the rate-limit journey took about
  one active minute with the same materialization and routing sequence.
  Neither estimate includes generalizing the helper, migrating other
  callers, or refactoring and delivering a slice.
- On `2d6b55306`, after SEED-438 landed, a scratch change routed only
  authenticated `ref` through `syncedReviewRepository`, verified the
  configured tracking ref, read the pinned backlog with `git show`, and
  seeded the pinned memo. The phone Board and both migrated journeys
  passed in 32.2 seconds. The branch journey reached the exact new
  displayed trunk and retained the REST pinned backlog assertion for the
  scheduled update. The rate-limit journey reached the scheduled 429,
  held owner time, 403 reset, and recovery at the second committed
  revision. Neither required REST membership. The command was
  `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run test:e2e -- e2e/navigation/phone-board.spec.ts e2e/observation/auto-refresh-branches.spec.ts e2e/observation/auto-refresh-rate-limit.spec.ts --workers=1 --reporter=line`.
  This exercised routing and the consumers. The scratch path fetched on
  every open and supplies no proof of confirmation atomicity or fetch
  elision.
- With the scratch cutover at `174c73f1f`, the backend shared-open case
  never reached its held REST ref. The cooldown suite lost the implicit
  membership request as both a way to trigger and a way to observe the
  REST owner's wait. The first-open browser suite's synthetic origin
  failed before its success and held-detail assertions could run. The
  command was `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run test:dashboard:backend -- dashboard/backend-tests/observation/authenticated-read-shared.spec.ts dashboard/backend-tests/observation/authenticated-read-cooldown.spec.ts dashboard/backend-tests/runtime/first-open-waits-for-read.spec.ts`.
- At `2d6b55306`, using an explicit scheduled `since` read and holding
  `matching-refs` restored all three cooldown cases after removing the
  obsolete membership assertion from the cross-operation REST owner
  matrix. In the owned-server first-open case, placing a gate on the
  actual Git fetch through the fixture's `pathPrefix` and releasing it to
  a real origin preserved the pending-read and rendered-Board assertions.
  The four cases passed in 14.2 seconds under
  `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i node_modules/.bin/playwright test --config dashboard/backend.playwright.config.ts dashboard/backend-tests/runtime/first-open-waits-for-read.spec.ts dashboard/backend-tests/observation/authenticated-read-cooldown.spec.ts --grep 'starts its own dashboard|directed rate limit' --workers=1 --reporter=line`.
  The [landed Review browser case](../../../e2e/review/story-review-initial-sync.spec.ts)
  also demonstrates a real transfer gate using `remote.origin.uploadpack`.
  Outside these cases, cross-project opens, shared waiters and failure
  variants were not converted. All scratch edits were reverted. The
  untouched backend selection of the shared-read, cooldown, and first-open
  files then passed all 11 cases at the same revision (19.7 seconds)
  through `npm run test:dashboard:backend` with `--reporter=line`.

## Outside-in proof

| Promise | Proof owner |
| --- | --- |
| Exact origin pin and backlog, including a move during fetch and ambiguous or refused transport | Slices 1 and 5, using real file origins and controlled errors at the transport. |
| Atomic pin and time, including a failed write and restart | Slice 2 at the Review storage boundary, then slice 7 from Refresh. |
| Eligible reads share, different projects are isolated, and a waiter can leave | Slice 3 at the service boundary and slice 5 at the authenticated endpoint. |
| Cold Board opens without an execution checkout or REST membership | Slice 4. Count probe, fetch and local read, and check exact rendered revision. |
| Warm Refresh reports pending, refreshes unchanged without a fetch and advances after a real change | Slices 6 and 7 at the rendered Board. Capture cold and warm counts and timing. |
| Superseded membership paths and fixtures lose their last use | Delete the old dispatch in slice 4 and the remaining orphaned paths in slice 8. |

## Provisional ordered slices

### 1. Verify an exact origin trunk candidate

Type: Structure
Status: planned

Change: At the production Git boundary, probe the configured ref and use
Review's bounded fetch to obtain the required object. Read the backlog at
an immutable candidate pin. Reject a fetch whose revision cannot satisfy
the probe. Keep the existing Board route until slice 4.

Proof: At the candidate seam, run real initial and changed publications,
hold the actual transfer while the advertised ref moves, and show what is
pinned in each successful case. Cover missing ref and unreadable backlog
with a real origin, and distinguish refusal from an ambiguous transport
failure at the shared classification seam. On `9dc3e801e`, a scratch
probe rejected the fetch when the ref moved from A to B between
`ls-remote` and the gated transfer, then served B on retry. A separate
fixture had a real trunk with no backlog and a successful synthetic
REST answer. The endpoint returned 502 without consulting REST.
The scratch backend Playwright selection (three cases including the
two-project wait from slice 3) passed in 3.0 seconds with one worker using the backend Playwright config.
The probe reused the existing Git runner and aborted when the fetched ref
differed from the exact advertised SHA. The scratch changes were removed.
Budget 13 active minutes using the existing probe and read seams.
Resolve the transport classification and its required cases during
refinement before adopting that estimate.

### 2. Publish one durable confirmation

Type: Structure
Status: planned

Change: Publish the verified revision and confirmation time together after
the pinned backlog read. Reuse the Review repository as the object store
and the Dashboard's [durable JSON replacement](../../../dashboard/server/durableJsonReplacement.ts)
where it satisfies the atomicity and failure contract.
Track observation start separately. With a warm confirmed pin, probe
origin even for a later unchanged check and elide the fetch if confirmed.
Leave the former observation readable when candidate verification or the
atomic write fails.

Proof: Observe A from the store, move origin to B, interrupt publication
after B is available locally, and reopen the store after server restart.
Show A and its original time, then B and its new time after retry. With
origin holding B, prove the later time and no fetch. Budget 14 active
minutes using one storage boundary and one controlled write failure.

### 3. Bound and share eligible Git waits

Type: Structure
Status: planned

Change: Own the probe-to-confirm interval in SharedObservation. Key it by
project and authorized origin/credential. Share only a request whose refs
and freshness qualify. A departing subscriber releases its own wait.
Keep the Board deadline separate from Review's cold sync allowance.

Proof: Hold the real Git fetch, show a qualifying waiter joins, cancel one
and release the other. Show an uncovered fresh demand gets its own check
and a different configured project progresses independently. Check
deadline disposal at this ownership boundary. A scratch HTTP probe on
`9dc3e801e` held the actual transfers for two projects and released them
to distinct backlogs. Two opens for the first project obtained the same
pin with one fetch, and the second project made its own fetch. The probe
passed in 1.9 seconds using the backend Playwright config with one worker.
That prototype used Review's fetch sharing. It did not prove the planned
check-wide sharing, freshness or cancellation rules. Budget 14 active
minutes if the existing observation seam can express this eligibility
without changing its other owners.

### 4. Open the Board at confirmed Git trunk

Type: Behavior
Status: planned

Behavior: Open a Board with an accessible real origin and an absent
execution checkout. The rendered backlog and time identify the exact
verified revision. A ref dispatch cannot answer from the REST endpoint.

Proof: Open the real Board through the authenticated endpoint. Check
exact pin, backlog, confirmation time, and zero REST membership calls.
Hold the actual Git transfer to preserve pending and shared-open evidence.
Seed the pinned memo and observe existing detail admission. Carry existing
wire outcomes for cold errors when removing the REST dispatch. Run the migrated fixture
suites, retaining proof for scheduled and detail reads at their live
callers. Before switching, account for each test that still observes
membership traffic, with its replacement Git observation or deletion. Keep the switched path
green against the current affected suites before adding the expanded
failure variants in slice 5. Budget 14 active minutes for dispatch
and its moved membership proofs after the fixture gate has disposed of
incidental assertions. Reassess before dispatch if those proofs still
span independent legacy consumers.

### 5. Report cold Git failures at the Board boundary

Type: Behavior
Status: planned

Behavior: An unavailable origin, missing trunk or unreadable backlog
cannot confirm a cold Board. An explicit refusal retains its established
outcome. Pending open ends at the Board deadline and can later recover.

Proof: Cover the wire mapping and rendered unavailable/refused states.
Let the old REST fixture advertise readable membership during a Git
failure and verify zero fallback attempts. Preserve the first-open
failure wait and cross-project failure isolation through the real
observable Git boundary. Budget 12 active minutes for the wire mapping
variants and browser wait observation.

### 6. Refresh the warm Board at an unchanged pin

Type: Behavior
Status: planned

Behavior: Press Refresh on the selected Board. While Git is held the
previous pin and confirmation time stay visible. If origin still
confirms it, update the time and fetch nothing.

Proof: Drive the rendered action and check pending, exact revision,
changed time and zero fetch. Count cold and warm membership operations
and elapsed time separately from remaining detail transport. Verify two
eligible requests join one check. Budget 13 active minutes using the
shared check and existing fresh-read state.

### 7. Recover a warm Refresh after origin changes

Type: Behavior
Status: planned

Behavior: Refresh after origin advances. A failed fetch or confirmation
keeps the pin and time and shows the failure. A later eligible Refresh
publishes B and its time together. An earlier automatic read cannot
replace the confirmed newer result.

Proof: With A rendered, hold B and fail before publication. Verify A and
the attempted-refresh failure, then recover to B. Check the in-flight
automatic result and restart case against the durable observation used
by the Board. Budget 14 active minutes with storage and ownership proof
from slices 2–3.

### 8. Retire the old membership-only support

Type: Structure
Status: planned

Change: Remove orphaned Board-specific REST handling, helpers, test
controls and docs. Preserve `resolveRevisionViaGh` at its observed callers
in `revisionChecks.ts` and `feedbackMaintenanceCheck.ts`, and keep the
explicit pinned `backlog-at` and reachability readers. The static scan for
the exact `"ref main"` assertion found 12 files across E2E and backend.
Classify by operation, including request recorders with different
spellings. The migration plan owns the earlier REST proof moves, leaving
this slice the code and evidence that has lost its last member.
Remove the membership-only 429 case in `limited-reading-membership.spec.ts`
when its obsolete call is gone.

Proof: Trace every deleted reference, including the tests and docs that
observed it. Compare scheduled fallback, detail, and recovery against
their maintained proof and run both Dashboard Backend Test and E2E Test. Budget 13 active
minutes for the retired-only callers, tests and docs. Command wait is
separate from the active estimates.
Record and close any temporary obligations following
[story obligations](../../../.agents/skills/dough-execute-plan/references/story-obligations.md).

## Refinement condition

After the fixture gate, remeasure the membership assertion replacements
and backend cold-open variants. The scratch probes cover fixture routing,
the two held-project fetches, and one first-open hold, with open gaps in
check-wide cancellation, the failed-confirmation restart and the Board
wait bound. Verify or revise the active estimates against those mechanisms
and the residual membership changes before recording readiness. Move assertions for independent REST operations back to the fixture
proof that owns them.

## Local gate

Run focused checks and Dashboard typecheck for each changed boundary.
Run long checks under `caffeinate -s -i` on AC power.
Follow the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
and select test conventions through [AGENTS.md](../../../AGENTS.md).
