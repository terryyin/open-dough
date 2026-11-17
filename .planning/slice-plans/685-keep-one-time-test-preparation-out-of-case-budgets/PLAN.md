# Keep one-time test preparation out of case budgets

**Identity:** SEED-340#keep-one-time-test-preparation-out-of-case-budgets

**Source:** [refined story](../../seeds/SEED-340-test-preparation-outside-case-budgets.md#keep-one-time-test-preparation-out-of-case-budgets).
Preparation only; this plan grants no execution authority.
**Source review:** [source-review.md](source-review.md)

## Goal and scope

A first dashboard case keeps the same default 30-second budget and behavior
as later cases. Immutable origin/app/bundle preparation belongs before case
time, including the ordinary preparationPage path, its repository overrides,
the custom session/terminal profiles, and the named frontend source-selection
case. Reduce the retry E2E's remaining real-Git arrangement without losing its
complete recovery and remembered-answer journey. Acceptance retains natural
one-minute load 30–50; a quiet pass cannot replace it.

Preserve private mutable origins, checkouts, HOME, servers and vendor answers.
Boundary-only requests its bundle and no app; development-only does not acquire
an unused preview app. Preparation remains in run elapsed time. No product
behavior change, timeout increase/override, test.slow(), wall-clock wait,
removed assertion, scenario reduction, or test-layer migration is included.

## Current decisions

- Reconcile the delivered SEED-391 common worker owner, not its old symptom.
  [Its retained correction](https://github.com/terryyin/open-dough/blob/fbfaa116b961a445cc606fd05363bf75f6ecad5f/.planning/slice-plans/668-redo-the-effort-story-under-the-test-focus-guidance/ci-repair.md)
  proves a 31-second cold build outside case time and records five bypassing
  custom profiles. Existing common preview/boundary preparation stays intact.
- PFE: reuse runArtifacts' on-demand, run-owned deduplication, pageTest's one
  worker registration pool, coldInputPreparation's existing 60-second worker
  lifetime, and startOriginPreparation's independent copies. Do not add a
  second cache, artifact runner, per-spec opt-in scheme, or baseURL proxy.
- Ordinary preparationPage origins request queued inputs for both Claude and
  Codex through one worker readiness dependency before private origins start.
  Keep preparationHost and originRepository case options compatible, including
  their existing wrappers and later declared revisions. Both layouts allow
  mixed hosts to reuse a worker without depending on a case-scoped option from
  a worker fixture. Only consumers needing installed origins take this readiness.
  The extra unused layout costs one run-owned preparation, not one per case:
  the bounded two-layout observation took 1.672 s total at lower load. Accept
  that explicit trade-off; record actual loaded elapsed cost during slice 1.
- Shared queued bases cover the inspected overridden descriptions' leading
  revision; their later scenario revisions remain private. Preserve the
  already-prepared kept-story descriptions. Do not overwrite a generic queued
  cache slot with a completed comparison history used by only some consumers.
- Custom profiles express their actual mode at their current owner. Preview
  uses app + bundle readiness; boundary uses bundle only; development keeps
  its source-serving path. Do not attach inherited preview readiness globally
  to baseURL: session-alerts has a case-scoped dev/preview option and
  terminal-codex has a boundary path despite an inherited preview default.
- FrontendApp needs an app-only worker acquisition, sharing the build request
  with preview preparation. Existing dashboardPreviewReady also requests a
  server bundle, which frontendGlobalSetup deliberately does not register;
  it cannot be attached unchanged. Do not introduce a backend or origin into
  the frontend run. Remove the obsolete accepted in-case-build comment.
- For retry setup, separate immutable real-CLI history creation from per-case
  fake-GitHub/page publication. Reuse snapshot/copy mechanics with an explicit
  history-specific input, preserving real completion, claim attribution,
  baseline/branch/landed endpoints, planning predecessors and later trunk.
  Do not replace them with arranged endpoint answers or share writable state.
  Bound initial adoption to the retry journey; extend to equivalent callers
  only if the changed helper reaches them and proof covers their promises.
- Follow [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  for one cohesive responsibility and retained proof, and
  [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  for published evidence distinct from machine state. The existing
  [North Star](../../NORTH-STAR.md) needs no new topic for this test-lifecycle work.

## Decisive premises

Observations are at `baaf914daaec3376fa5ed303920eb83488b37910` on
2026-11-17 in this preparation's owned checkout unless a retained revision is
named. [Preparation evidence](preparation-evidence.md) records literal routes,
results, limits and recoverable sources; no implementation has been accepted.

| Premise | Consuming operation/profile | Observation and result; remainder |
| --- | --- | --- |
| Existing common owner removes cold app/bundle time without warming boundary apps | Slices 1–3, common dashboard fixture | SEED-391 correction at fbfaa116b: controlled 31 s red/green and exact hosted d59ab3e8 success. Current 3-case boundary route passes, bundle completes and app requests are zero. Since that revision pageTest has only a launchJourney comment change on this path. New assertions must detect regression. |
| Ordinary installed origin still starts cold after common preparation | Slice 1, plain preparationPage in E2E | Current retry route completes 2/2; artifact log requests/finishes app, then starts queued Claude preparation (515 ms). origin's case-scoped startOrigin awaits that request. The repair's common dependency names no origin host. The inspected override route also executes 2/2 with later dependency revisions intact. |
| Preparing both queued layouts uses the existing owner's keys and lifecycle | Slice 1, both host layouts | Direct startRunArtifacts/requestRunArtifact observation, exact current sources and keys: Claude 1609 ms, Codex 1668 ms, combined 1672 ms, teardown awaited. Node transform-types is only the loader for this cost probe; Playwright owns case-budget acceptance. No loaded-cost or speedup claim. |
| Custom profiles bypass common readiness and include genuinely different modes | Slice 3, session/terminal fixtures | SEED-391 retained five-profile observation plus current session-alerts dev/preview route 2/2 and Codex boundary route 3/3 (zero app requests). Source tracing follows each dashboard override to startDashboardServer; current preview artifact preparation happens in its case path. Preserved real notification URL and no-extra-host-action assertions pass. |
| Named Done-source case has no remaining real-Git arrangement | Slice 4, frontendApp service substitutes | Current frontend command completes 1/1 (4518 ms case); sole app preparation is 1797 ms. Inspected frontendDoneSelection supplies two Done publications, holds comparison and locations, and asserts only Story B's historical source after selection. No server/origin artifact is registered or requested. |
| Real-CLI completed history is portable as immutable input | Slice 5, real installed completion then independent origins | Scratch Playwright probe 1/1 (2023 ms): real CLI completion, later trunk, two copies with identical refs/parent graph/merge endpoint, fsck, local remote rewriting, and a push isolated from peer/source. [Exact probe source](origin-copy-probe.spec.ts.txt) is retained; scratch spec removed. The final worker binding and full retry journey remain slice 5 acceptance. |
| Retry slowness is fixed work rather than a missed response | Slice 5, whole browser retry journey | Retained 309dacb4 diagnosis: in-range failures and 32.9/33.0 s complete diagnostic journeys; 9.5 s real-Git arrangement. Relevant spec/done-fixture/completion helper diff to current HEAD is empty. Current lower-load route 2/2 confirms availability, not loaded stability. |

## Outside-in proof ownership

| Story promise/examples | Owning slice and distinguishing observation |
| --- | --- |
| First case, either host, overridden repository, all three preparationPage groups (1, 2, 5) | 1: runner-level preparation proof drives actual fixtures through fresh inner runs; cold origin completes before case time, both hosts get their own layout and independent copies, overrides retain later revisions. Exercise the same dependency under E2E, Integrated and Backend setup. Retain side-panel-content-replacement's full journey under required load. |
| Boundary bundle with zero app requests (6) | 2: infrastructure assertion observes artifact trace from common dashboard readiness, not only direct startDashboardServer. Inject the known unconditional-app fault: new assertion fails, restored passes; existing review-state assertions remain intact. |
| Five custom profiles, no eager app in dev/boundary (6) | 3: controlled artifact gate + traces for each distinct profile, actual initial and restarted servers, unchanged session/terminal journeys; separate dev-only and boundary-only runs assert zero app requests. |
| Done-source first case and held-read isolation (3) | 4: app-only cold worker gate plus unchanged frontend case at load 30–50; two Done publications and held comparison/locations assertions survive. Existing real CLI default-answer-selection E2E remains green. |
| Retry recovery, remembered checks and reselection (4) | 5: exact original retry journey with all upstream/read counts and source cues intact, real-CLI input built before the case and independent origin copies; sibling unrecoverable/shallow-history recovery stays green. Measure the full journey at load 30–50. |
| Run elapsed, cleanup/failure propagation and private mutable state | Each changed owner: retain artifact-demand complete/fail/interrupt proof, fixture-origin isolation and affected consumer proof; record worker and case intervals separately, do not subtract arbitrary fixture durations. |

## Ordered slices

### 1. Ordinary origins arrive prepared for either host
Type: Behavior
Status: done
Proof: story examples 1, 2, 5 and the first proof row above.

Behavior: a fresh plain preparationPage case, on either host and with a queued
repository override, starts → its immutable installed base is already ready,
its private history remains correct, and its default case budget pays no cold
preparation. Preserve each serving mode's existing app/bundle readiness.

Add the common worker dependency at the fixture owner; consolidate redundant
opt-in wrappers when made unnecessary without breaking importing consumers.
Use the existing subprocess artifact proof harness for new
`dashboard/backend-tests/runtime/test-preparation-budget.spec.ts` coverage,
with small fixture consumers rather than a test-source string assertion.
Hold a producer at an observed gate to locate work outside case time; no sleep
or timeout extension.
Run the host/override/group selections and loaded side-panel journey. Keep
run elapsed and unused-host cost visible. Include docs/fixture-origins updates.

Accepted (2026-11-18, load 6–11 AC): worker `queuedOriginsReady` in
`serverInputWorkerFixtures.ts` (extracted from pageTest, 249→163) prepares
both queued layouts; `runtime/test-preparation-budget.spec.ts` gates both
clones before any case under all three group setups and goes red (30 s) when
`origin` drops the dependency. Unused layout adds ~0.2 s concurrently, ~1.5 s
alone, once per run. Refactor found the two landed-CI preview readers
(`ciFollowUpSettledReading`, `projectScopeHistoryFixture`) now take
`dashboardPreviewReady`. The wrapper names are kept as aliases of `test` for
25 importing E2E specs; their misleading names are a wrap-up follow-up.
The loaded side-panel first-case run at natural 30–50 is still owed and is
carried into slice 5's loaded acceptance with the other journeys.
CI repair (run 44125679359): the strict reporter fails passing tests that
print; the intervals are now a test attachment. Run local proof with the
strict reporter, not `--reporter=list`.

### 2. Boundary-only preparation rejects an unnecessary app request
Type: Behavior
Status: planned
Proof: story example 6 and the boundary-only proof row above.

Behavior: the common boundary dashboard fixture prepares its inputs → the
infrastructure check observes a completed bundle and zero app requests;
changing that path to request an app makes this check fail. Existing
review-state admission assertions retain their product meaning.

Extend the focused runtime preparation proof from slice 1 using the actual
common readiness dependency. Replay the retained unconditional-app fault,
observe the new assertion fail, restore it and observe green. Do not rely on
runtime/boundary-server, which bypasses common readiness, or on an app build
that merely finishes inside the default budget.

### 3. Custom session and terminal starts prepare their actual serving inputs
Type: Behavior
Status: planned
Proof: custom-profile row, with distinct preview/dev/boundary requests observed.

Behavior: a custom server starts, including a restart → its profile's shared
inputs are already prepared outside case time, with no unused app in a dev-only
or boundary-only run; the original session/terminal behavior still holds.

Cover `e2e/sessions/agent-launch-story-card-session-states.spec.ts`,
`e2e/sessions/session-alerts-navigation.spec.ts`,
`e2e/terminals/agent-terminal-lifetime.spec.ts`,
`e2e/terminals/agent-terminal-touch-composer.spec.ts`, and
`dashboard/backend-tests/terminals/agent-terminal-codex.spec.ts`
(the deployment-like boundary profile). Match dependencies to mode rather than
changing server addresses, URLs, native protocol behavior, or case-scoped options.

### 4. Frontend Done-source selection starts after its app is built
Type: Behavior
Status: planned
Proof: app-only gate and the complete named held-read selection scenario.

Behavior: frontendApp's first case starts → its app build is complete before
case time; switching Done stories while Intent remains mounted shows only the
new story's source after the held reads finish. Other mutable services stay
private and the frontend run requests neither a bundle nor an installed origin.

Share the app acquisition with the existing preparation owner and declare its
worker fixture in the common pool. Preserve the current frontend boundary,
its independent assertions, and the real-CLI E2E selection owner.

### 5. The complete CI comparison retry journey has private prepared history
Type: Behavior
Status: planned
Proof: independent copies, real CLI provenance, and the full original retry
case plus its shallow-history sibling under the required loaded conditions.

Behavior: retry runs first → completed Story Branch history and later trunk
are prepared before case time; its private origin and page execute initial
failure, recovery, another check and reselection with the same answer and
upstream accounting, well within the default budget.

Separate history preparation from publication of each case's GitHub answers.
Use an explicitly scoped snapshot; do not mutate the ordinary queued cache.
Keep baseline planning/claim history, completion parents and endpoint IDs from
the real operations. Run other helper consumers reached by the actual diff;
no wholesale shared-helper migration is assumed. Keep the second case's
shallow/unshallow recovery private and unchanged.
Also run slice 1's fresh side-panel-content-replacement first case in the
same natural 30–50 loaded acceptance.

## Verification and delivery gates

- Apply the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
  literally throughout, including local/CI and base failures. Follow installed
  dough-execute-plan delivery, independent post-change refactoring and CI repair;
  this preparation neither Takes the story nor starts an execution observer.
- [AGENTS.md](../../../AGENTS.md#test-automation) requires test-entry selection
  before test edits. Backend runtime proof selects MakeMe true/pageObjects off;
  named E2E/frontend sources select both true. Use builders and focused page
  owners, keep independent transport counts and artifact traces inspectable.
- Local gate: Node 24.21.0, locked install and Chromium were exercised here.
  Before expensive proof inspect actual host load, memory and competing work;
  initially use one worker for cold observations, then two for affected cohorts.
  On macOS AC use `caffeinate -s -i`; battery requires awake/open-lid
  `caffeinate -i` and sleep-log inspection under
  [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
- Keep the strict reporter and request each group's unique PROOF_RECORD and
  artifact trace. Use fresh runs for first-case proof; a warm repeat is not
  acceptance. Report natural load before/after, power, case and runner elapsed,
  and remaining 30 s headroom. Do not use burners as evidence for natural 30–50.
  When that natural window is unavailable, retain the exact loaded observation
  as pending; lower-load passes establish only their own boundaries.
- Focused commands are in [preparation evidence](preparation-evidence.md).
  After runtime edits run typecheck and the new infrastructure proof, plus
  existing `runtime/dashboard-artifact-demand.spec.ts` and affected consumer
  checks found by the installed consumer-trace command. Common fixture edits
  reach distributed consumers, so execute broader named cohorts across the
  four groups when their purposes differ; file presence or one green case
  does not settle the others. Full groups are not automatic local gates.
- The existing pre-commit hook runs staged lint and, for script edits, dashboard
  typecheck. No timeout policy changes or weakened proof may bypass it.

## Sizing, design and remaining concerns

Five Behavior slices; each has one cohesive lifecycle outcome/proof loop and
fits the 15-active-minute budget, excluding command time under the slice clock.
The common model is immutable preparation at its existing owner, followed by
private scenario work; serving mode explains separate artifact profiles.

No expected edit is already over 250 lines: pageTest 249, preparationPage 95,
startOriginPreparation 212, frontendApp 55, done fixture 79 and
completedPublishedStory 243 and backend Codex terminal 234 at this baseline. Keep additions under the shared
size check: if pageTest grows, extract its cohesive server/origin preparation
fixture implementation/types into one support module and spread registrations
in pageTest, as publishedMainWorkerFixtures already does. This belongs in
slice 1 and preserves the one registration pool, not a new structural outcome.

Slice-plan refinement split the origin change from the independent boundary
assertion gap, and retained the three other boundaries: five cohesive slices,
no sizing exception or story resplit. The common ownership and direction are
unchanged; decisive premises have observed results. This review identified no remaining slice-specific concern. Loaded
acceptance and new discriminating assertions are execution obligations, not
claims supplied by these lower-load preparation observations.
