# Open and refresh the published Board from local Git

**Source:** [SEED-430](../../seeds/SEED-430-read-published-project-data-from-local-git.md#open-published-board-from-local-git)

**Identity:** SEED-430#open-published-board-from-local-git

**Split from:** SEED-430#read-published-project-data-from-local-git, whose
slices 1–4 delivered real-origin routing for committed origins,
`publishes()` and the default answer. Its planned cold open and Refresh
became slices 7–8 here.

## Goal and scope

Open the Board and refresh the currently shown Board at a confirmed origin
trunk pin without depending on the execution checkout. A failed fresh check
keeps an already shown confirmation and reports the failure. Automatic
observation, additional records and the migration of Review callers belong
to [the published-progress story](../823-follow-published-progress-from-local-git/PLAN.md).

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
  Seed the existing pinned backlog memo from the verified local text where
  reachability still consults it. Admit the pin after verification. Keep the
  object available for its existing admitted lifetime.
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
  One trunk path serves every Board open; no fixture keeps a REST-only Board.
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
| Board fixture reach | On 2026-11-25 at `739b1dbc4` with the first story's committed-origin change, a log-only audit ran `git ls-remote` under a served HOME for successful fake GitHub `ref` answers through both full suites. About 150 e2e and 26 backend files answered a revision their routed origin did not hold. Slices 1–6 name those fixture families. Launch journeys (`agent-launch-*`, `responsive-session-reconciliation*`, `agent-completion-attention`, `story-review-one-shot`, `published-work`, `system-settings-terminal-theme`) that already push to the real `main` before `advanceTo` supply that origin directly. | Apply [the audit](ref-audit.patch.b64) from the repository root with `base64 -d -i <plan-dir>/ref-audit.patch.b64 \| git apply -`. Run the focused consumers as each family moves, run both full suites before cutover, and reverse the audit before delivery. File counts leave family sizes unmeasured. |
| Ref and backlog agree in one served HOME | At `2eb0dae6f`, a local Node probe used `startFakeGitHub`, `routeDashboardHome`, `publishes`, and production `remoteBranchHead`. After publication A, a synthetic trunk answer advertised B over the framed `gh api …/commits/main --jq .sha` call while Git still returned A. Republishing B as a real commit made both calls return B's object ID. Git was restricted to the file protocol in a disposable HOME. | Confirms the need to migrate synthetic inputs. The probe covers named republication in one HOME. Slice 6 owns maintained coverage and the remaining routing cases. |
| Review's ref and stored sync time can diverge | In the same disposable HOME at `2eb0dae6f`, `syncedReviewRepository` fetched A and `git show A:.planning/PRODUCT-BACKLOG.md` read it. After origin advanced to B, a read-only sync record made the next sync reject with `EACCES`. The tracking ref had moved to B, the sync record still held A's time, and A was still readable by object ID. The probe ran through `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES node --experimental-transform-types --input-type=module` with `LC_ALL=C` and `GIT_ALLOW_PROTOCOL=file`. | Rules out treating the current Review tracking ref plus its sync time as a confirmed Board view. Slices 7–8 verify the new commit point and interruption recovery through the Board. |
| Recovery and fixture baselines | At `2eb0dae6f`, the three branch/check/recovery browser cases passed under `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run test:e2e -- e2e/observation/auto-refresh-branches.spec.ts e2e/observation/auto-refresh-recovery.spec.ts --workers=1 --reporter=line`. Separately the six `story-review-offline-sync.spec.ts` cases and two `committed-origin-actions.spec.ts` cases passed via `npm run test:dashboard:backend -- <spec>` under the same environment and sleep guard. | Automatic checks and Review offline behavior provide a preserved-behavior baseline. These runs did not exercise a manual Board Refresh. The Board has a fresh-read callback for launch reconciliation and uses page reload as a published-read recovery cue. Slice 8 exposes and exercises the in-place Board action. |
| Representative cutover and migration | At `2eb0dae6f`, the phone Board and the first direction-disclosure case passed before a temporary cutover. The cutover pointed only the authenticated `ref` operation at existing `syncedReviewRepository`, `rev-parse` and `git show`. The phone Board with its committed origin passed. Direction disclosure lost its synthetic revision, seeing the fallback origin's empty backlog. Replacing that case's setup with a materialized MakeMe history and `publishCommittedOrigin` restored its exact rendered revision, direction and interactions. On REST the focused case observed the ref, pinned backlog and configuration reads. After cutover, it still observed the configuration read, while the ref and backlog calls were gone. Both scratch changes were reverted. | Run used `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run test:e2e -- e2e/navigation/phone-board.spec.ts e2e/stories/direction-disclosure.spec.ts --workers=1 --reporter=line` with grep for the phone Board and first direction case. The migration reruns selected only the first direction case. This sample covers one static publication and one consumer's call assertions. The moving histories, failed-check journeys and whole-suite assertion surface remain unmeasured. |
| Board's cold wait | The [browser read bound](../../../dashboard/src/authenticatedReadRules.ts) is 30 seconds. [Review's cold sync](../../../dashboard/server/reviewRepository.ts) allows 50 seconds. The production Review transport probe above fetched the disposable origin without reaching the Board boundary. | Slice 7 proves Board cancellation and recovery at the existing Board wait with a controlled origin and reports the real fixture timings. Review's cold allowance does not establish a Board check duration. |

Use the
[consumer trace procedure](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
when changing a reader or fixture. The retained audit checks only the first
served HOME per answer and only successful fake REST ref responses. Use it
for discovery and verify routed refs in each relevant HOME where the
consumer uses more than one. The suite after cutover proves that the
actual Board entry opens through Git.

## Outside-in proof

| Promise | Owner and observation |
| --- | --- |
| Test publications expose the advertised trunk and preserve the consumer's existing behavior | Slices 1–6. Compare the real routed origin with each migrated fixture's advertised revision. Run the affected consumer journeys and use the final pre-cutover whole-suite audit to find missed fixtures. |
| Cold Board open shows the exact configured origin revision and backlog without an execution checkout | Slice 7. Observe the authenticated ref response and the rendered Board against a real origin. Check unavailability, missing trunk or backlog, and explicit refusal through the same boundary. |
| An in-flight or failed warm Refresh retains the previous revision and confirmation time | Slice 8. Act on Refresh in the rendered Board, hold a candidate fetch, fail before confirmation publication, then restart the server while the Board remains open. Record what the view and persisted observation show at each point. |
| Warm success advances confirmation and requires no fetch when origin is unchanged | Slice 8. Observe the fresh probe, no fetch, and later confirmation time. Move origin and verify the revision and time advance together on the next successful Refresh. Record elapsed time and counts for cold and warm membership reads, with follow-up detail calls counted separately. |

## Ordered slices

### 1. Publish described-revision fixtures through a real origin

Type: Structure
Status: planned
Change: Publish the common described history once and let `publishedFiles`
and `describedRevision(s)` use its real commit IDs for Board-opening
consumers. Move the configured trunk when the fixture advances it.
`sharedReads`, `agentRosterRecords` and `originObservation` consume that
publication where they use this common path. Keep file-only and detail-only
consumer behavior. Enables slice 7.

Proof: The migrated specs pass with their assertions using the fixture's
published commit IDs. The focused `ref` audit reports no remaining
mismatch for this path.

### 2. Publish observation fixtures through a real origin

Type: Structure
Status: planned
Change: Migrate the remaining auto-refresh, steady-refresh, limit-recovery,
limited-reading, transient, revision-stream, published-facts, and feedback
maintenance inputs that control trunk without the common path. Moving
trunk and subsequent REST detail reads use the same commit IDs. Keep the
deliberate failures of the scheduled and detail paths at their existing
boundary. Enables slice 7.

Proof: The migrated specs still observe each branch, freshness, and
recovery transition at its intended boundary. The focused `ref` audit
reports no remaining mismatch for this path.

### 3. Publish Intent fixtures through a real origin

Type: Structure
Status: planned
Change: Migrate the Intent CI, code-browse and Gherkin journeys that still
open with a synthetic trunk after slice 1. The existing REST assertions
keep their published revision, content and event relationships. Enables
slice 7.

Proof: The migrated Intent journeys still observe their declared files,
CI evidence and Gherkin results. The focused `ref` audit reports no
remaining mismatch for this path.

### 4. Publish recently-done and session fixtures through a real origin

Type: Structure
Status: planned
Change: Migrate the remaining recently-done progressive and
published-session fixtures to the advertised real trunk. Keep their
session and Done record facts at the same pin. Enables slice 7.

Proof: The affected journeys observe the same Done records and session
transitions at the real pin. The focused `ref` audit reports no remaining
mismatch for this path.

### 5. Publish backend authenticated-read fixtures through a real origin

Type: Structure
Status: planned
Change: Migrate the remaining backend authenticated-read and
retained-answers fixtures whose successful ref answers lack real origins.
Keep deliberate transport and retained-answer inputs where their scenario
still reaches those paths. Enables slice 7.

Proof: The affected backend checks observe the same admission, pinning,
and retained-answer outcomes. The focused `ref` audit reports no
remaining mismatch for this path.

### 6. Route projects a test adds or configures

Type: Structure
Status: planned
Change: A project a test adds or configures outside the seeded projects
reaches the origin that answers it, through the same served-HOME routing.
`publishCommittedOrigin` routes through the serve hook as `publishes()`
does, leaving one named-route path. Enables slice 7.

Proof: Maintained fixture tests cover the routing rules that the first
story proved only with scratch scripts. A republication reaches the latest
origin, a route the HOME fixture set up still wins, a seeded project
resolves to the default origin, an added project resolves to its origin,
and an unserved repository fails locally. Intent Coverage at `4baf31b4f`
found the republication path missing from maintained checks: skipping the
earlier origin's unroute left every examined check green while a scratch Git
read reached the stale origin. Repeat the backend and e2e suites with
the audit, account for all residual mismatches, and reverse the audit
before delivery.

### 7. Open the Board at verified published trunk

Type: Behavior
Status: planned
Behavior: Given a configured project, a cold machine repository, and an
accessible origin, open the Board without an execution checkout. After the
bounded check the Board receives the backlog from the verified local trunk
pin. A missing trunk or unreadable backlog cannot yield a confirmed Board.
An explicit refusal keeps its refusal outcome; an ambiguous failure is
unavailable.

Proof: Drive cold Board open through the authenticated endpoint, using a
real origin and a renamed checkout. Assert the exact revision and backlog
and count the membership probe, fetch, local read, and any API calls.
Check refusal, unavailable origin, missing trunk, unreadable backlog, and
the Board's timeout at the same boundary. Drive a changed advertised
ref during fetch and prove the answer matches the verified revision.
Run the dashboard backend and e2e suites after cutover. Move
membership-specific transport assertions from the old REST path to the
Git path while keeping separate assertions for the REST details and
scheduled checks that those journeys still exercise. Launch journeys
whose product push reaches origin before `advanceTo` keep their
observed reconciliation behavior.

### 8. Refresh a warm Board and explain failure

Type: Behavior
Status: planned
Behavior: Given a confirmed Board, Refresh while origin is slow or
unavailable. Continue showing the confirmed revision and time, report the
failure, and allow another Refresh. On successful recovery, confirm the same
revision without a fetch or expose a newly verified revision. Distinguish
cold failure and explicit access refusal.

Proof: Drive real origin transitions through Board Refresh and check
the rendered attempt, revision, confirmation time, and recovery. Hold a
fetch after candidate data arrives and interrupt the confirmation update.
The verified view survives that failure and a server restart. Verify a
shared eligible check if two requests arrive together, and show that a
new Refresh can recover after the failed one. Capture cold and warm
request counts and elapsed time from the Board.

## Slice refinement and remaining concerns

Refinement retained eight slices. Slices 1–6 each preserve current
behavior through a distinct fixture publication boundary. Slice 1 owns
the shared materialization and later migrations address only callers it
does not already cover. Slice 7 switches one authenticated membership
path and slice 8 exercises that same path from the open Board.

- Slices 1–5 still lack a migration-sized measurement. The prior audit
  counts responding files and the direction example covers one static
  fixture. The effort for the remaining fixture and assertion changes
  after the common conversion is unmeasured. In particular,
  `MovingFiles.moveTrunk` currently returns no published ID and some
  observation tests assert hard-coded A/B/C values and REST request
  counts. Sample the shared moving-revision conversion with an asserting
  consumer and use its trace to group the remaining edits before Take.
- Slice 7's cutover had a different effect on membership and detail calls
  in the direction example. Trace the remaining cold-open request-count
  and failure assertions across both suites. Measure which assertions
  move to Git and which still guard REST details and scheduled checks
  before estimating this slice against the 15-minute active limit.

## Local gate

Use slice-focused checks and Dashboard typecheck for the changed boundary.
Run long local checks fully awake under
[`caffeinate -s -i` on AC power](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
Follow the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Apply the test conventions in [AGENTS.md](../../../AGENTS.md) before
authoring or changing proof.
