# Declare landed-file follow-up state through MakeMe

**Identity:** SEED-353#declare-git-test-state-through-makeme
**Source:** [Declare landed-file follow-up state through MakeMe](../../seeds/SEED-353-declarative-git-test-state.md#declare-git-test-state-through-makeme)
**Source review:** [source-review.md](source-review.md)

## Goal, scope and comparison

A developer reads the landed-file admission case from its named comparison,
exact two-line file and related launch. Replace routine Git arrangement and
manual reporting-reference wiring with the existing shared MakeMe and origin
fixture. Preserve actual HTTP admission, launched-input assertions and refusal
proof. This is preparation only, with no execution authority.

The approved split retains all original scope in nine receiving stories in the
source seed. This plan owns only the landed-run success case in
`dashboard/backend-tests/launches/agent-launch-follow-up-file-admission.spec.ts`
and the shared construction it needs. The refusal cases remain regression proof;
their completed-history arrangement belongs to that receiving story. No campaign
across other specs, dirty-workspace model, changed production behavior, new
repository framework or speedup promise is included here.

ADR 0010 comparison: before, this case reads HEAD twice, writes/adds/commits/pushes
the file, creates a random UUID and repeats it in launch, landing and file facts.
Worth keeping: the case declares the exact file/comparison and launch relationship
through MakeMe, needs no incidental Git or UUID plumbing, and remains easier to
understand without comparable builder complexity, eager setup or weaker proof.
Review the before/after source and the reached shared owners; count reduction
alone is not the verdict. Make no runtime-saving claim from preparation timings.

## Existing owners and architectural fit

PFE inspected in this owned checkout at `14fa3d4fde427b07a1e94d3d62838be382a95607`:

| Responsibility | Reuse/change decision |
| --- | --- |
| Repository facts and deferred Git | Reuse `Distribution/tests/support/repositoryTestData.mjs`, `repository-fixture.mjs`, `repository-history.mjs` and revision commit/renderer owners. Named revisions/files/parents already exist; do not add a second repository builder or make builders execute Git. |
| Installed origins and sharing | Extend `dashboard/tests/support/startOriginPreparation.ts`, `startOriginInitialization.ts` and `startOrigin.ts`. Preparation already calls `materializeLocalCheckout`, but loses its revision map when packing the origin; initialization returns void. Carry named results through prepared-prefix, private and `keepStartedOrigin` copies. Keep names/SHAs harness metadata, not new published workflow facts or extra Git refs. |
| Launch and landing facts | Extend `launchTestData.mjs` and `launchLandingEvidenceTestData.mjs` behind the same `makeMe` entry. Existing reporting and landing operations take canonical records but require manual reference wiring. Derive missing references from their associated launch; preserve explicit overrides and current call forms. |
| Landed-file follow-up facts | Use the canonical `FollowUpFileFacts` / `FollowUp` shapes already consumed by `followUpContext.ts`, `followUpRequest.ts` and `followUpCompletedFile.ts`. Add only the missing MakeMe relationship operation for this consumer. Cases relate their file context to the launch, not to an extracted UUID. Keep HTTP sending and expected instruction outside construction. |
| Isolation and lifecycle | Reuse the existing template/snapshot and start-origin owners. No persistent cache, eager preparation, host process or cleanup belongs in a builder. |

Follow Accepted [ADR 0002 — Direct domain mapping](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution),
[ADR 0008 — Published and local state](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state)
and [ADR 0010 — Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
The existing test-data architecture and the [North Star's launch/local distinction](../../NORTH-STAR.md#agent-launch-as-a-requested-assignment)
already cover this direction. No new North Star topic, ADR exception, schema or
production persistence change is warranted.

`launchTestData.mjs` is 261 lines and will be edited. Slice 2 owns a cohesive
extraction of reporting/landing relationship construction to focused test-data
support, retaining request/session/workspace assembly in the current module and
the public `makeMe.aLaunchRecord` entry. Preserve explicit reporting, invalid
identity and real-context callers. `startOriginPreparation.ts` is 249 lines;
slice 1 keeps preparation/cache ownership there and, if needed to stay below
250, extracts its existing installation-file layer to focused origin support.
Other expected owners: initialization 94, origin 193, landing evidence 136,
repository builder 231, architecture guide 224, admission spec 160 lines.
Recheck actual edited files; split along these responsibilities, not line counts.

## Decisive premises and preparation observations

Observed on 2026-11-15 in this owned checkout at `14fa3d4fde427b07a1e94d3d62838be382a95607`.
Dependencies were installed with `npm ci --ignore-scripts`. This Mac was awake on
AC under `caffeinate -s -i`, load 5.60/6.05/6.88, 54% free memory, with other
worktrees active. Focused one-worker runs were appropriate; no full-suite,
remote-runner headroom or loaded-runtime comparison is claimed.

| Premise / consuming operation | Literal observation, profile and result | Remainder |
| --- | --- | --- |
| A declared installed-origin suffix reaches real file-follow-up HTTP admission (slice 1). | Command A passed one existing success case. In a disposable edit, `originRepository` became `queuedReadyRepository().withRevision("delivered", { files: { "delivered.txt": "line one\nline two\n" } }).please()`; removed the case's write/commit/push and read the actual HEAD/parent independently. Command B passed that same case with its comparison and input assertions. | Exposing named results is new work; the probe still read Git and manually wired references, so it is not final acceptance. |
| The chosen case discriminates actual file-line membership and launch identity (slices 1–3). | Command C, changing only the declared file to one line, failed at `expect(launched.kind).toBe("launched")`: “The line or side does not belong to this comparison.” Command D, restoring two lines but changing only file.reference to `55555555-5555-4555-8555-555555555555`, failed there: “This story has no landed run with that reference.” | These were deliberate scratch faults, not unexplained flaky failures. They establish that setup cannot supply the observed admission. |
| Maintained refusal and browser routes work with the existing fixture (all slices). | Restored the spec byte for byte, confirmed no Git diff, then Command E passed all five cases. Command F passed four E2E clean/conflicted/range/disjoint-merge cases through the installed origin and browser. | The new construction must rerun its affected consumers; these observations do not claim the new API exists. |
| Shared description/materializer retains real graph and private-copy behavior (slice 1). | At `d25751dd51970273d7e5622b21cb66209a14e083`, Command G passed eight tests, observing actual Git parents, origin publication, identity, index/files/refs/config isolation and teardown. The intervening trunk changes leave these owners unchanged. | Preserve those boundaries when carrying the map. Dashboard prepared/private/kept map continuity still needs consuming fixture proof in slice 1. |

```sh
# A: existing case, strict passed, 1 case
OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD=/tmp/seed353-baseline-admission-proof.json caffeinate -s -i npm run test:dashboard:backend -- launches/agent-launch-follow-up-file-admission.spec.ts --grep 'a landed-run' --workers=1
# B: disposable declarative fixture version, strict passed, 1 case
OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD=/tmp/seed353-declared-admission-proof.json caffeinate -s -i npm run test:dashboard:backend -- launches/agent-launch-follow-up-file-admission.spec.ts --grep 'a landed-run' --workers=1
# C: only line 2 removed, expected strict failed, 1 case
OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD=/tmp/seed353-absent-line-proof.json caffeinate -s -i npm run test:dashboard:backend -- launches/agent-launch-follow-up-file-admission.spec.ts --grep 'a landed-run' --workers=1
# D: only file reference mismatched, expected strict failed, 1 case
OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD=/tmp/seed353-unrelated-reference-proof.json caffeinate -s -i npm run test:dashboard:backend -- launches/agent-launch-follow-up-file-admission.spec.ts --grep 'a landed-run' --workers=1
# E: restored maintained file, strict passed, 5 cases
OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD=/tmp/seed353-restored-admission-proof.json caffeinate -s -i npm run test:dashboard:backend -- launches/agent-launch-follow-up-file-admission.spec.ts --workers=1
# F: maintained E2E origin/browser consumer, strict passed, 4 cases
OPEN_DOUGH_E2E_PROOF_RECORD=/tmp/seed353-e2e-review-baseline-proof.json caffeinate -s -i npm run test:e2e -- review/story-review-commit-trunk.spec.ts --workers=1
# G: existing shared materialization proof, 8 passed
node --test Distribution/tests/support/repository-description.test.mjs Distribution/tests/support/repository-fixture.test.mjs Distribution/tests/support/repository-graph.test.mjs Distribution/tests/support/repository-snapshot-isolation.test.mjs
```

An earlier anchored grep selected zero tests; it was corrected before A. An
attempt reusing an existing proof-file path produced no new proof and is not
accepted evidence. Use new proof paths for execution runs. Every scratch edit
was reverted before these records were written; only preparation records land.

## Outside-in proof ownership

| Final promise | Owner and observable proof |
| --- | --- |
| Exact two-line declared comparison, named base/tip and no routine Git setup in the success case | Slice 1: the real HTTP case still admits and names path/line/side/base/tip in host input, using fixture revision results. Fault its declared line bytes and observe rejection. |
| Named results survive preparation reuse and private/kept copies without changing sharing, cleanup or isolation | Slice 1: extend existing start-origin consuming/isolation scenarios to read named endpoints on shared-prefix, private-description and worker-kept paths; compare to independent Git observations and keep peer/template/later-copy mutation proof. No builder-output-only test. |
| Launch and stored landing derive their common reference; explicit and real contexts retain their meaning | Slice 2: migrate those two constructions in the same HTTP case; shared builder consumers with explicit/malformed identities and actual launch-returned contexts remain green. Expected IDs are independent scenario facts. |
| File follow-up relates to that launch with no spec UUID generation/extraction/passing | Slice 3: the same real HTTP case uses the relationship directly; mismatch fault still fails admission, while ordinary construction passes. Keep explicit mismatched/malformed-value behavior in relevant existing consumers. |
| Original admission/refusals and canonical record shapes remain independently proved | All slices: complete five-case source file, reached landing/follow-up/reporting consumers, typecheck and import-boundary checks. Do not replace expected instruction text with a builder/renderer-derived expectation. |
| Readability gain, documentation and no superseded setup remain | Each slice reviews its before/after case and shared cost; slice 3 updates the architecture guide and removes newly unused imports/support. No broad helper deletion while another receiving story still uses it. |

## Ordered slices

### 1. Read the landed comparison from named fixture history
Type: Behavior
Status: done
Proof: Named-history and fixture-continuity rows above; complete admission file,
start-origin isolation, kept-story consumer and existing repository materializers.

Behavior: Given the declared two-line delivered revision after the queued base,
the fixture supplies named commit IDs and the HTTP case admits line 2 with the
same independent host-input assertions. Remove its write/commit/push and
incidental HEAD reads. Carry materializer results through packed preparation,
shared-prefix extension, private and worker-kept paths without persistent state,
extra refs or rebuilding prepared inputs. Use the existing cache/fixture owners;
`keepStartedOrigin` and its `keptPublishedStory.ts` caller must retain the map too.
Keep all mutable copies and cleanup independent. Preserve existing fixture call
forms. One named-history-to-admission loop, target 15 active minutes, commands
excluded. Interim: the reference is still manually related until slices 2–3.

Accepted 2026-11-15: `StartOrigin.revision(name)` reads the materializer map,
kept as `revisions.json` beside the prepared or kept bare origin (run- or
process-scoped preparation directory; global setup runs in another process).
The installation layer moved to `startOriginInstallation.ts`. Named endpoints
are compared with independent `rev-parse` on shared-prefix, private and kept
paths in `start-origin-private.spec.ts` (the isolation spec is over 250 lines
and stays untouched). Proof: admission + private specs 8/8; isolation, default,
demand and both kept-story landed-ci-repeat specs 8/8; Command F 4/4; Command G
8/8; typecheck and eslint. Faults: one-line file refused admission; wrong
revision name failed the shared-prefix check. Refactor pass: no edits.

### 2. Associate the stored landing with its launch
Type: Behavior
Status: done
Proof: Launch/landing relationship row and existing explicit-context consumers;
the same HTTP case remains the externally observed gate.

Behavior: Given a launch with a declared captured comparison, launch reporting
and stored landing use one internally allocated reference. Relate their builders
instead of generating/passing that UUID in the spec. Preserve supplied values,
real launch contexts, reporting source/host and explicit identity distinctions.
Perform the cohesive launch-builder extraction described above; keep canonical
records and type-only production imports. No new relationship registry or eager
work. One launch-to-landing loop, target 15 active minutes, commands excluded.
Interim: the file context may still read/pass that reference until slice 3.

Accepted 2026-11-15: `LaunchReportingBuilder` (`launchReportingTestData.mjs`)
owns `reportingThrough` and `withLanding`; an omitted reporting reference is
allocated at completion, and a landing passed as its builder takes that
reference through `pleaseFor` unless it states `forLaunch`. The admission
route finds the landed run by the launch's reporting reference only, so it
discriminates 6.1 (unrelated launch reference refused) but not the landing's
own reference; `adHocCompletedAssociation.ts` now uses the derived landing and
`completed-story-association.spec.ts` discriminates 6.2 (broken derivation
answers `absent`). `withLanding` and the older `withCapturedLanding` both set
the landing; slice 3's guide names the builder form. Proof: 14 association +
admission, 159 reached backend, 22 E2E, 5 integrated, 89 Distribution node and
10 native-import-closure tests; typecheck and eslint. Refactor: one JSDoc
typedef.

### 3. Associate the file follow-up with its launch
Type: Behavior
Status: done
Proof: File/launch relationship and readability rows; admission/refusal file,
consumer trace and documented construction complete the final gate.

Behavior: Given the constructed launch and its comparison, the file follow-up
states path, line and side and associates with that launch through MakeMe.
The spec creates, extracts and passes no incidental UUID. Return the existing
file/follow-up shape; HTTP sending and expected host input remain independent.
Preserve literal mismatch/malformed inputs and real-context consumers. Finish
the architecture-guide examples and remove newly superseded setup without
migrating deferred siblings. Compare the final source with the baseline and
reject comparable builder complexity. One file-to-admission loop, target
15 active minutes, commands excluded; this replaces all interim manual wiring.

Accepted 2026-11-15: `makeMe.aFileFollowUp.onLandedRunOf(record).at({ path,
line, side })` (`followUpFileTestData.mjs`) returns the canonical file facts
with the launch's comparison and reporting reference; the spec names no
reference and its expected host input is literal or from `origin.revision`.
The architecture guide documents named start-origin revisions, reporting
allocation, `withLanding(builder)` and the file follow-up. Against the
baseline the case drops Git writes, HEAD reads, `randomUUID` and three
repetitions of the reference for one 52-line builder. Proof: admission 5/5;
faults (one-line file, unrelated launch) refused; native-import-closure 10/10;
native-evidence-identity; typecheck, eslint, prettier. Refactor: guide wording.

## Verification and execution gates

Apply [AGENTS.md test automation](../../../AGENTS.md#test-automation), installed
MakeMe and page-object selection before authoring or changing tests. The selector
resolved MakeMe true / pageObjects false for the admission and origin-isolation
backend sources. Recheck new paths and reached browser tests; E2E consumers select
both conventions. Builders follow consuming tests, use canonical production types
through JSDoc and retain the one `makeMe` entry. Do not write builder-only tests.
Keep default timeouts and never use `test.slow()` or file/group/hook overrides.

Local gates: the complete source admission file; `launches/start-origin-isolation.spec.ts`;
a retained-completion consumer using `keepStartedOrigin` (select through the trace);
Command G and `native-import-closure.test.mjs` if the shared runtime closure changes;
Command F for the changed origin layer; all landing/reporting/follow-up consumers
reached by changed builder contracts; `npm run typecheck:dashboard` and changed-file
lint. Broaden to an entire affected group when the consumer trace shows its whole
surface is changed. No full-repository run is required for these Markdown records.
Run discriminating scratch faults against the final constructed case, restore and
pass before acceptance; retain sufficient unchanged proof at each slice boundary.

Run the installed `dough-execute-plan/scripts/consumer-trace.mjs` with
`--checkout <execution checkout> --base HEAD` and effect terms for
`initializeStartOrigin`, `keepStartedOrigin`, `reportingThrough`, `withLanding`,
`forLaunch`, and the chosen file-follow-up operation. Follow helpers to actual
spec consumers and disposition each as run, matching-evidence reuse or excluded
with the unreachable boundary explained. Include explicit/omitted reporting,
malformed identity and native-import closure consumers, not just this source file.

Before expensive proof inspect current load/memory and competing work; begin
focused at one worker. The local gate uses the maintained [macOS sleep guard and
power condition](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos):
fully awake on AC under `caffeinate -s -i`; on battery, fully awake with lid open
under `caffeinate -i`, then inspect the sleep log. Unfiltered groups share full-run
admission across worktrees. No timeout or verdict relaxation follows contention.

Follow the shared [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
as written for every local/CI failure and carry this link into delegation and
repair handoffs. Execution retains its required final CI ownership.

## Current decisions and concern review

- Three slices share one repository description and canonical launch relationship;
  later examples extend those owners rather than invent parallel adapters.
- Slice-plan refinement retained all three boundaries: each yields a visible
  construction improvement and one proof loop, and later slices remove the named
  interim wiring. Three is within the eight-slice limit; no timing exception.
- No remaining slice-specific concern was identified for this bounded example.
  Current consuming routes discriminate its facts; new operations remain planned
  work with mapped proof, not claims that they already exist.
- No blocking dependency, human-owned decision or trunk-only operation. Later
  receiving stories remain unrefined/unselected; this plan grants none execution.

## Story obligations

### G1. File context reads the launch's reference (first reported in slice 2)
Reported: slice 2 — "the file context reads `record.request.reporting.reference` until slice 3."
Story clause: "builders derive launch, landing and file references without spec-level UUID creation, extraction or passing"
Disposition: proved by slice 3: agent-launch-follow-up-file-admission.spec.ts builds the file with makeMe.aFileFollowUp.onLandedRunOf(record) and contains no reference token; admission 5/5 passed and an unrelated launch was refused
