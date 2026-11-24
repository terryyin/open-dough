# Open and refresh the published Board from local Git

**Source:** [SEED-430](../../seeds/SEED-430-read-published-project-data-from-local-git.md#read-published-project-data-from-local-git)

**Identity:** SEED-430#read-published-project-data-from-local-git

## Goal and scope

See the source story. A developer opens and refreshes the Board at verified
published trunk with the execution checkout absent or behind. Reads other
than the Board's trunk and backlog keep their current paths for
[the published-progress story](../821-follow-published-progress-from-local-git/PLAN.md).

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
  Let an uncovered demand share the next eligible check. Publish only
  verified revisions, branch absence confirmed by a successful probe, and
  the corresponding time. Use the same observation through the Board and
  Review. The subscriber that disconnects releases only its own wait.
- Use [published story history](../../../dashboard/server/publishedStoryHistory.ts)
  and the existing Git reader seams for local objects. Keep the pinned
  reader contract and existing admission predicates at
  [authenticated reads](../../../dashboard/server/authenticatedRead.ts),
  [reachable paths](../../../dashboard/server/reachablePaths.ts),
  [branch reachability](../../../dashboard/server/branchReachability.ts),
  and [records beside the backlog](../../../dashboard/server/recordsBesideBacklog.ts).
  Use a source-authorized, verified observation to admit a pin. Keep that
  object available for the already-admitted read lifetime across successful
  deletion or rewrite and reuse the existing lifetime bounds.
- Keep each published observation atomic, including metadata. Use immutable
  commit IDs for reads and keep an in-progress fetch from changing any
  visible pin or timestamp. Advance the confirmation time on a successful
  unchanged probe. Keep observation start time for accepted-launch
  reconciliation and report failed attempt time separately. Treat ambiguous
  transport failure as unavailable. An explicit access refusal takes the
  established refusal path. Confirmed local object presence has no effect on
  authorization.
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
  origin routed by the fixture HOME
  ([fixture origin routes](../../../dashboard/test-support/support/fixtureOriginRoute.ts),
  [published main](../../../dashboard/test-support/support/publishedMainFixture.ts)).
  One trunk path serves every Board open; no fixture keeps a REST-only Board.
- Classify transport outcomes with the seed's
  [transport evidence](../../seeds/SEED-430-read-published-project-data-from-local-git.md)
  under `LC_ALL=C`. Reuse an observation only for the same project, origin
  URL, and machine gh credential.

## Premises and available baselines

| Consuming operation | Observation | Remainder |
| --- | --- | --- |
| Review transport probe of refusal, unavailability, and absence | On 2026-11-25 against this checkout at `75182dd87`, the Review transport's exact `ls-remote` (gh credential helper, `GIT_TERMINAL_PROMPT=0`, `LC_ALL=C`) exited 128 for loopback 401, 403, 404, 503, a held request aborted by its deadline, a closed port, and GitHub "Repository not found". Stderr separated 401 ("could not read Username") and 403 ("returned error: 403") from connection failure and 503. A missing branch exited 2 under `--exit-code`. One read-only probe reached the configured origin under the existing Review authority with the active gh account's `repo` scope. | A server-rejected credential ("Authentication failed") was not observed; slice 4 treats an unrecognized 128 as unavailable. |
| Board fixture reach | At `75182dd87`, about 120 backend and e2e spec files use the fake GitHub; 52 use `publishes()` with synthetic revisions, 64 e2e files use `publishCommittedOrigin` with a real repository, and the e2e server routes every unrouted GitHub URL to a missing repository. | Slices 1–3 migrate the Board-opening ones; each slice's suite run is its proof. |
| Board's recovery cues | At `1c0272d6f`, `caffeinate -s -i npm run test:e2e -- auto-refresh-branches.spec.ts auto-refresh-recovery.spec.ts --workers=1 --reporter=line` passed 3 cases. The Board preserved the last good snapshot during a failed check and recovered. | Slice 5 replaces the provider fixture at the Refresh boundary and counts Git operations against a real origin. |

Use the
[consumer trace procedure](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
when changing a reader or fixture.

## Ordered slices

### 1. Route committed-origin journeys through the fixture HOME

Type: Structure
Status: planned
Change: `publishCommittedOrigin` routes its repository through the fixture
HOME, so a Git read of the configured project reaches that origin. Fake
GitHub answers stay unchanged. Enables slice 4.

Proof: The e2e specs using `publishCommittedOrigin` pass unchanged, and a
focused check shows a Git `ls-remote` under the fixture HOME reaching the
committed origin's `main`.

### 2. Back `publishes()` Board fixtures with a real origin

Type: Structure
Status: planned
Change: The published-repository fixture commits its backlog and files to a
real origin routed through the fixture HOME and answers fake GitHub with that
origin's actual revision. Specs that named a synthetic trunk revision take it
from the fixture. Enables slice 4.

Proof: The backend and e2e specs using `publishes()` pass with unchanged
assertions apart from revision sourcing. If the migration exceeds the
slice's time, split it at the backend and e2e boundary.

### 3. Publish the remaining Board-opening fixtures through a real origin

Type: Structure
Status: planned
Change: Specs that open the Board with a hand-written `ref` answer publish
their trunk through a real routed origin instead. Specs that never open the
Board keep their answers. Enables slice 4.

Proof: The migrated specs pass unchanged in observed behavior. A search
shows no remaining Board-opening hand answer of `ref`.

### 4. Open the Board at verified published trunk

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
and count subprocess and GitHub calls. Check refusal and unavailable origins
at the same boundary, then run the dashboard backend and e2e suites.

### 5. Refresh a warm Board and explain failure

Type: Behavior
Status: planned
Behavior: Given a confirmed Board, Refresh while origin is slow or
unavailable. Continue showing the confirmed revision and time, report the
failure, and allow another Refresh. On successful recovery, confirm the same
revision without a fetch or expose a newly verified revision. Distinguish
cold failure and explicit access refusal.

Proof: Drive real origin transitions through Board Refresh and check its
rendered status, last confirmation, and recovery. Hold a fetch after
candidate data arrives and interrupt the metadata update. The verified view
survives that failure and a server restart. Capture the cold and warm
request counts and elapsed time from this same entry point.

## Local gate

Use slice-focused checks and Dashboard typecheck for the changed boundary.
Run long local checks fully awake under
[`caffeinate -s -i` on AC power](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
Follow the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Apply the test conventions in [AGENTS.md](../../../AGENTS.md) before
authoring or changing proof.

## Learnings

- Slice 1 of the original plan (1.1 active minutes, no code change) probed
  the transport and found that switching cold open moves every Board open.
  The assumption that other Board callers could keep REST was false. The
  developer approved a resplit: original slices 3–8 moved to
  [plan 821](../821-follow-published-progress-from-local-git/PLAN.md), and
  fixture migration now precedes the switch here.
