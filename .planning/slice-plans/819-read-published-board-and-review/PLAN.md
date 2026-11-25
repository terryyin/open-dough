# Publish Board test fixtures through real Git origins

**Source:** [SEED-430](../../seeds/SEED-430-read-published-project-data-from-local-git.md#read-published-project-data-from-local-git)

**Identity:** SEED-430#read-published-project-data-from-local-git

## Goal and scope

See the source story. Test support routes committed origins, `publishes()`
and the default answer through real Git origins. Product reads are
unchanged; the cold open and Refresh moved to
[plan 824](../824-open-published-board-from-local-git/PLAN.md).

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
| Board fixture reach | At `75182dd87`, about 120 backend and e2e spec files use the fake GitHub; 52 use `publishes()` with synthetic revisions, 64 e2e files use `publishCommittedOrigin` with a real repository, and the e2e server routes every unrouted GitHub URL to a missing repository. | Slices 1–4 migrate the Board-opening ones; each slice's suite run is its proof. |

Use the
[consumer trace procedure](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
when changing a reader or fixture.

## Ordered slices

### 1. Route committed-origin journeys through the fixture HOME

Type: Structure
Status: done
Change: `publishCommittedOrigin` routes its repository through the fixture
HOME, so a Git read of the configured project reaches that origin. Fake
GitHub answers stay unchanged. Enables the Board cold open in plan 824.

Proof: The e2e specs using `publishCommittedOrigin` pass unchanged, and a
focused check shows a Git `ls-remote` under the fixture HOME reaching the
committed origin's `main`.

### 2. Back backend `publishes()` fixtures with a real origin

Type: Structure
Status: done
Change: `publishes()` without a supplied revision commits its backlog and
files to a real origin and answers fake GitHub with that origin's revision.
Serving it under a repository name routes that origin through every HOME
the fake GitHub serves, and a later publication of the same repository
replaces the route. Backend specs that named a synthetic trunk revision take
it from the fixture. Callers that still supply a revision are unchanged.
Enables the Board cold open in plan 824.

Proof: The migrated backend specs pass with assertions unchanged apart from
revision sourcing. A routed check shows `ls-remote` following a
republication. The full backend and e2e suites pass, because the route
replacement also governs `publishCommittedOrigin`.

### 3. Route the default published answer through a real origin

Type: Structure
Status: done
Change: The default answer that `dashboardTest.ts` and `dashboardServer.ts`
serve for every repository commits a real origin instead of the synthetic
`defaultBaseCiRevision`. An origin served for every repository is routed
through each served HOME for the configured project's GitHub URL. Wrappers
around a published answerer, such as `holdingAnswer`, keep its origin.
Callers of `defaultBaseCiRevision` read the origin's revision instead.
Enables the Board cold open in plan 824.

Proof: Both full suites pass unchanged in observed behavior. A routed check
shows `ls-remote` for a configured project reaching the default origin's
`main`.

### 4. Keep committed origins' `main` at the answered revision

Type: Structure
Status: done
Change: `publishCommittedOrigin` moves the routed origin's real `main` to
the revision it answers, on publish and on each `advanceTo`, except when it
follows pushes or the checkout has `main` checked out.

Proof: Both full suites pass. The eight specs that advance a committed
origin pass, and `git ls-remote` under the served HOME returns the answered
revision.

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
  [plan 821](../823-follow-published-progress-from-local-git/PLAN.md), and
  fixture migration now precedes the switch here.
- Slice 1 routes every origin published through one fake GitHub to every
  dashboard HOME it serves (`routeOriginThroughServedHomes`), which slices 2
  to 4 reuse. Slice 5 must handle two findings. Git uses the first of two
  routes for one GitHub URL, so a repository published twice in one test
  keeps reaching its first origin. `advanceTo` moves only the fake GitHub's
  answer, so a journey relying on it must move the origin's real `main`.
  A change to `dashboardServer.ts` needs both full suites (about 22 minutes
  for e2e and 20 for backend on this machine).
- Slice 2's first attempt (7.5 active minutes) completed the backend
  `publishes()` migration and returned the rest. Its findings set slices 3 and 4's
  scope. Migrated backend cases serve the `everyRepository` fallback, which
  routes nothing. Wrappers around `publishes()` drop its origin. A
  done-catalog case needs one revision holding different files for two
  projects, so it keeps a synthetic answer. Identical contents gave
  identical revisions, so each publication commits distinctly.
- CI run 45514916618 lost frontend shard 1/2 to a closed Vitest browser
  connection. With the developer's decision, a permanent history guard
  landed as the repair; see
  [the diagnosis record](diagnosis-frontend-browser-connection.md).
- Slice 2's second full backend run (load about 11–13) timed out three
  cases of `story-review-offline-sync.spec.ts` at the 5 s default. That
  file passed in the first full run, passed alone (6/6, 2.3–3.2 s per case),
  and this story does not change it. Its review syncs are a load-sensitive
  test defect that needs a follow-up correction at wrap-up.
- Slice 3's first attempt (1.5 active minutes, no change) found that the
  default answer served for every repository holds the synthetic
  `defaultBaseCiRevision`. Every default Board open goes through it, so the
  original slice 3 split into a central routing slice (3) and the
  hand-answered fixtures (4).
- Slice 3 links the default origin into each served HOME only for the
  seeded projects (`productionSeedProjects`), under the unrouted-away
  directory, so routes named by fixtures still win. Slice 5 must reach a
  project that a test adds and the default origin alone answers, and must
  move the origin's `main` where a journey advances trunk.
- Slice 4's log-only audit of every `ref` answer through both suites found
  about 150 e2e and 26 backend files still answering a synthetic trunk,
  against an estimate of about 17. With the developer's decision, this story
  closes at the delivered fixture routing. The remaining fixture families,
  the cold open and Refresh moved to
  [plan 824](../824-open-published-board-from-local-git/PLAN.md), which
  carries the audit and its family inventory.

## Execution complete

Product advice: no priority change. Keep the queued order: the Board trunk
story first, then published progress, then the Intent, CI and maintenance
follow-ups. Before migrating another published reader to local Git, run the
`ref` audit (plan 824) to size its fixture reach. This story's fixture work
was about ten times the planned estimate. Its maintained proof of the
routing rules is owed by plan 824 slice 6, and the load-sensitive Review
sync test by plan 823 slice 5.
