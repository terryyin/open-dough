# Keep CI wall time history readable across dashboard updates

**Identity:** SEED-305#keep-ci-wall-time-history-readable-across-dashboard-updates
**Source:** [Refined story](../../seeds/SEED-305-ci-wall-time-history-across-dashboard-updates.md#keep-ci-wall-time-history-readable-across-dashboard-updates)
**Source review:** [Source-only commitments](source-review.md)
**Preparation:** owned workspace
`/Users/terryyin/git/open-dough/.worktrees/keep-ci-wall-time-history-readable-across-dashbo`,
branch `cursor/keep-ci-wall-time-history-readable-across-dashbo`, starting
revision `865681bc9b0d3e5bf4b17bfa79226800c6bc59d5`. This plan authorizes no
execution.

## Goal and scope

A developer who leaves Project Intent's CI status open across an Open Dough
dashboard deployment can still read collected CI wall time history after the
deployment introduces a new final gap reason such as `timing-basis`. Measured
builds stay visible; gaps stay understandable for the prior deployed frontend
that can still be open; a newly loaded frontend can show the specific new
reason; and regression coverage pins the previous reader against the updated
server.

Out of scope: requiring a reload as the fix; a general dashboard API
versioning framework; changing which landings are collected or measured;
compatibility with every historical Open Dough revision beyond that prior
deployed reader; remote CI adapters and non-dashboard clients.

## Architecture and reuse

PFE: the responsibility is “project `intent=ci-history` so an already-loaded
Open Dough frontend keeps reading measured history when the server gains a
new final gap reason, while a current frontend can still name that reason.”

Existing owners:

- Server projection:
  [`dashboard/server/landedCiHistoryEntries.ts`](../../../dashboard/server/landedCiHistoryEntries.ts)
  (`historyEntries` / `gapOf`)
- Read assembly:
  [`dashboard/server/intentCiHistoryRead.ts`](../../../dashboard/server/intentCiHistoryRead.ts)
- Frontend read and schema:
  [`dashboard/src/authenticatedIntentCiHistoryRead.ts`](../../../dashboard/src/authenticatedIntentCiHistoryRead.ts)
  and
  [`dashboard/src/landedCiHistory.ts`](../../../dashboard/src/landedCiHistory.ts)

Reuse and change that local history boundary. There is no existing gap-reason
vocabulary negotiation; `parseIntentCiHistoryRead` allows only `source` and
`intent` on the unscoped history read. Content negotiation elsewhere
(`Accept-Encoding` on launch answers) is a different concern and is not the
home for this contract. Do not add a second history API or a parallel schema.

Selected solution: keep one history response. By default, project final gap
reasons newer than the prior deployed reader into that reader's vocabulary
(`timing-basis` → `not-recorded`, which that reader already accepts and
labels “CI wall time not recorded”). Let the current frontend opt into the
expanded vocabulary so it can show the specific reason. Pin the previous
reader against the default answer in automated coverage.

No consequential product architecture choice beyond that local response
contract. No new North Star topic. Accepted ADRs are not implicated beyond
ordinary dashboard-boundary ownership already in ADR 0008.

Common rule: one response vocabulary per request; default is the prior
compatible set; newer reasons appear only when the current reader asks for
them.

## Outside-in proof ownership

| Final promise | Owning slice and observable proof |
| --- | --- |
| Prior open frontend still shows measured builds and an understandable gap when the server would emit `timing-basis` | 1: focused backend/history proof — default `intent=ci-history` answer is accepted by the previous frontend reader schema; measured points remain; each timing-basis landing appears as a prior-vocabulary gap (`not-recorded`) |
| Newly loaded frontend can show the specific `timing-basis` reason | 1: same boundary with the opt-in signal — answer includes `timing-basis`; current reader and gap words show the specific reason; existing timing-basis assertions move to the opt-in path |
| Regression fails closed if a later new reason again blanks the whole response | 1: pinned previous-reader check against the default updated-server answer |

## Decisive premises

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| Prior final-gap schema (without `timing-basis`) rejects a gap with `reason: "timing-basis"` and rejects a whole history that includes one | Slice 1 default projection / previous-reader proof | Ran Zod parse of that prior reason enum against a timing-basis gap and a history containing a measured point plus that gap in this workspace | Settled: `oldRejectsTimingBasis: true`, `oldRejectsWholeHistoryWithTimingBasis: true` |
| The same prior schema accepts that history when the gap is projected to `not-recorded` | Slice 1 compatible default mapping | Same observation with `reason: "not-recorded"` | Settled: `oldAcceptsNotRecorded: true`, `oldAcceptsWholeHistoryWithNotRecorded: true` |
| Prior deployed gap words already label `not-recorded` as “CI wall time not recorded” | Slice 1 “understandable gap” for the open tab | `git show 49367c2e4:dashboard/src/ciHistoryGapWords.ts` | Settled: `not-recorded` → `CI wall time not recorded` |
| Current unscoped `intent=ci-history` parse refuses any query key other than `source` and `intent` | Slice 1 opt-in signal placement | Read `parseIntentCiHistoryRead` in `dashboard/server/intentCiHistoryRead.ts` | Settled: allowlist must gain an explicit opt-in parameter (or an equivalent request signal the read path already inspects); unknown keys refuse today |
| Current frontend history fetch sends only the query string and no capability header | Slice 1 how the new reader opts in | Read `authenticatedGet` in `dashboard/src/authenticatedGet.ts` | Settled: opt-in must be added to the history request the current reader makes |
| Focused timing-basis proofs currently expect `timing-basis` on the default history answer | Slice 1 consumer update | Read `dashboard/backend-tests/intent/landed-ci-attempt-start.spec.ts` | Settled: those assertions move to the opt-in answer; default answer must not keep emitting `timing-basis` |

## Ordered slices

### 1. Compatible default history with opt-in for new gap reasons
Type: Behavior  
Status: done
Proof: Focused backend/history checks at the local `intent=ci-history` boundary: (a) default answer with retained timing-basis landings is accepted by the previous frontend reader schema, keeps measured points, and projects those gaps to `not-recorded`; (b) the current frontend's opt-in request returns `timing-basis` and the current reader/words show the specific reason; (c) existing timing-basis collection proofs are updated to the opt-in path and still discriminate. Neighboring landed-CI history specs that assert default response shape stay green. On macOS start long runs fully awake; on AC use `caffeinate -s -i`.

Behavior: Collected history that would project `timing-basis` gaps → an already-loaded prior frontend reads the default `intent=ci-history` answer and a newly loaded current frontend reads with its opt-in → the prior reader still shows measured builds and an understandable gap instead of a response-shape error; the current reader can show the specific timing-basis reason; regression coverage pins that previous reader against the default updated-server answer.

## Current decisions

- Compatibility substitute for `timing-basis` on the default answer is
  `not-recorded` (prior vocabulary; understandable “CI wall time not
  recorded” on the open tab).
- Prefer an explicit allowed query parameter on the existing history read for
  opt-in over a new header or a second endpoint, so the signal stays on the
  same local authenticated-read contract.
- Do not invent a general versioning framework; only negotiate final gap
  reasons this story introduces for the prior-vs-current reader pair.

## Learnings

- Response projection belongs after internal history classification: the same
  entries also drive prior-build references, which retain their specific
  reasons. The selected Done wall-time response shares the project history
  entry shape and therefore negotiates the same vocabulary; scoped history
  has a separate model and keeps its request unchanged.

## Plan concern assessment

Slice-plan refinement was not needed: one Behavior owns one proof loop at the
existing history boundary, with no independent second outcome, no preparatory
Structure beyond that Behavior, and no unresolved sizing concern. No remaining
slice-specific concerns.

## Execution notes

- Established execution: story-branch; owned workspace
  `/Users/terryyin/git/open-dough/.worktrees/keep-ci-wall-time-history-readable-across-dashbo`,
  branch `codex/keep-ci-wall-time-history-readable-across-dashbo`, agent
  `jacked-chan`, publisher `dashboard-territory.local-open-dough`.
  Starting revision `82342b0488f8c15a28343279ef19731e37dae486`;
  accepted Take and initial candidate
  `cbed76e816e7acad4548b93fb2d335e679cc4745` published on `origin/main`.
  Ordinary increments publish to the execution branch on `origin`.
- Checkout setup: `npm ci` succeeded against the current lockfile; no host
  preparation was assumed. Selective formatting is `npm run format`;
  `.githooks/pre-commit` is check-only staged lint and script-change dashboard
  typecheck. No numeric slice budget is configured; retain one cohesive proof
  loop, with the skill's existing planning authority if needed.
- Project command `npm run typecheck:dashboard` passed after setup.
- CI observer: GitHub Actions `terryyin/open-dough`, execution branch
  `codex/keep-ci-wall-time-history-readable-across-dashbo`, selector `ci.yml`
  verified as active workflow `CI` (351271804). Codex coordinator
  `seed305-jacked-chan`, yielded cell `g42:11`, session `93151`, directory
  `/tmp/dough-ci-501/watch-D5E5di`, PID `53072`, checkout as above. The trunk
  Take is `pendingCi: unobserved`; this observer owns branch increments.
- Slice 1 acceptance: source review C1–C7 observed in the compatibility spec.
  Prior-reader main/Done HTTP answers preserve the 120000 ms point and every
  current final gap, with timing-basis projected to prior wording; current
  production frontend readers explicitly request the specific reason and
  retain the same points. The frozen whole-response reader from `49367c2e4`
  rejects that expanded answer, and every current final reason is exercised.
  Q1–Q7 and J1–J3 hold at this local boundary without reload or collection
  changes. Exclusions X1–X8 remain intact. No uncovered story obligation.
- Freshness before acceptance: `unchanged` against pinned `origin/main`
  `829c6405b14292cadf2b5e82c9c8d53992948696`, base the accepted Take. No story
  or plan named sibling coordination dependencies.
- Accepted proof, all terminal passes, in this checkout:
  - `caffeinate -s -i npm run test:dashboard -- backend-tests/intent/ci-history-reader-compatibility.spec.ts backend-tests/intent/landed-ci-attempt-start.spec.ts --workers=1`
  - `caffeinate -s -i npm run test:dashboard -- 'backend-tests/intent/landed-ci-history' backend-tests/intent/landed-ci-attempt-start-adapter.spec.ts 'backend-tests/intent/ci-done-wall' 'tests/intent/intent-ci-wall-time-history' --workers=1`
  - `PATH="/opt/homebrew/bin:$PATH" npm test -- tests/support/dashboard-ci-scope-history-read.test.mjs tests/support/ci-scope-prior-build-read.test.mjs`
  - `caffeinate -s -i npm run test:dashboard -- tests/intent/intent-ci-done-prior-build.spec.ts tests/intent/intent-ci-done-prior-states.spec.ts tests/intent/intent-ci-done-reference-lifecycle.spec.ts tests/intent/intent-ci-prior-build-average.spec.ts tests/intent/intent-ci-prior-build-states.spec.ts --workers=1`
  - `git diff --check`
  Setup: MakeMe retained raw landings/build observations, independent frozen
  reader schema/words, real authenticated HTTP responses and current frontend
  readers. Observations: compatibility spec's prior/current parsing, exact gap
  words, measured values and capability request assertions; existing history
  browser heading/chart/evidence assertions and Done reference refresh,
  failure/retry/publication/eviction assertions. Collection and scope parser
  neighbors passed. Initial named Node command stopped before tests because
  PATH selected Bash 3.2; the documented PATH correction selected Bash 5.3.20.
- Consumer evidence: `/tmp/seed305-consumer-{trace,dispositions}.md` and
  `/tmp/seed305-direct-consumer-{trace,dispositions}.md`; affected default and
  opt-in history, current hooks/rendering, Done references and helper callers
  covered above. Scope's separate response, unchanged internal classification,
  generic schema/name matches and documentation are excluded with reasons in
  those records. No deferred affected consumer proof.
- Expensive-proof decision: actual Mac, 16 CPUs, load 22.70, 40% memory free,
  AC; sequence focused checks with one worker under `caffeinate -s -i`, no
  full suite. Other Taken executions may share the machine; reconsider load
  before an invalidated/repeated heavy check. Implementation agent owned every
  command to its terminal result.
- Independent refactor `/root/refactor_history_compatibility` returned
  `## REFACTOR COMPLETE`: none — already clean; no edits or tests. It checked
  projection callers, frontend hooks, independent internal references, frozen
  reader independence and all changed file sizes (largest 246 lines). All
  accepted proof and consumer dispositions remain unchanged and valid.
- Guarded preparation stopped at formatting before commit: unused callback
  argument and forbidden non-null assertion in the new compatibility test.
  Coordinator made mechanical fixes within the accepted refactor's paths and
  trace, without new helper, representation or dependency (`already traced`).
  Renewed `caffeinate -s -i npm run test:dashboard -- backend-tests/intent/ci-history-reader-compatibility.spec.ts --workers=1`
  passed. Actual Mac load was 5.94 before that bounded one-worker check; all
  other accepted proof remains unchanged. Retry guarded preparation.
- Further preparation stops were repaired before any commit: the status
  mutation retained old Markdown trailing spaces (removed), and staged
  typecheck required the new MakeMe PublishedSource's label and repository.
  Supplied the fixture's actual Open Dough source facts; compatibility proof
  remains a real server/read observation, not an outcome supplied by setup.

- Local gates: focused backend/history specs for the default and opt-in
  answers, plus affected neighbors that assert landed CI history shape
  (including `landed-ci-attempt-start` and related history collection/gap
  specs). Use the combined local gate only when a change reaches shared
  harnesses those suites share. Start long macOS runs fully awake and on AC
  use `caffeinate -s -i`. On battery plug in or keep the lid open under
  `caffeinate -i` and inspect sleep logs. Follow
  [machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
- Carry the
  [failing and flaky tests policy](../../../AGENTS.md#failing-and-flaky-tests)
  as written into every delegation and repair handoff. Arrange domain data
  through shared MakeMe. Never sleep for wall-clock time; wait on observable
  events. Keep the default test timeout.
