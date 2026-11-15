# Declare Intent comparison histories through MakeMe

**Identity:** SEED-353#declare-intent-comparison-histories
**Source:** [Declare Intent comparison histories through MakeMe](../../seeds/SEED-353-declarative-git-test-state.md#declare-intent-comparison-histories)

## Goal, scope and evaluation

A developer reads Intent's compared revisions, source and build provenance from
named repository facts instead of reconstructing routine Git. Preserve the same
independent HTTP, UI, CI acquisition, source-selection and timing observations.
The source's shared requirements and key examples govern all six slices.

Include direct and indirect arrangement in backend, E2E and remaining integrated
Intent scenarios, including `storyCiComparison*`, completed/retained Intent,
Summary comparisons and scope-history support. Existing declarative cases need
no cosmetic rewrite. General review/completion/launch/recovery migration stays
with the source seed's other stories; changed shared owners retain their proof.
No production behavior change, new fixture framework, eager preparation, suite
relocation or speedup promise. This plan grants no execution authority.

ADR 0010 baseline: `precedeClaimWithPlanning`, the Done/earlier-landing
publishers, retained completion and Summary publishers currently mix file
facts, commits/publication and endpoint discovery. Worth keeping: named facts
explain the same result with less reconstruction, and shared construction costs
less to understand than the plumbing removed. Compare representative before/after
source and reached builder/harness cost in each slice; line reduction or green
tests alone do not establish that gain. Do not claim runtime savings.

## Existing owners and architectural direction

PFE in this owned checkout at `b85a83dcbd1d54cfe631035a0326fd09dc6ec202`:

| Responsibility | Reuse/change decision |
| --- | --- |
| Repository facts, parents, authors, exact files and workspace | Reuse `Distribution/tests/support/repositoryTestData.mjs` through the one `makeMe` entry. The materializer/revision owners execute Git and return named SHAs. Add only facts required by a consuming case; no command-shaped builder API. |
| Installed origins, prepared prefixes and private copies | Reuse `startOriginPreparation.ts`, `startOriginInitialization.ts`, `startOrigin.ts` and `keptPublishedStory.ts`. Carry the revision map through these paths if not already delivered by the sibling's named-history work. Extend the same owners without a blocking story dependency or a parallel cache. |
| Completion and comparison history | Reuse/modularize the facts already represented by `keptPublishedStory.ts`, `completedPublishedStory.ts`, `completedStoryInput.ts`, `intentSummaryStoryComparisonRepository.ts`, `queued-repository.mjs` and `takeRevision`. One shared representation of claim/implementation/completion relationships; CI variants compose its facts, rather than copy review-history logic. Preserve real CLI publication when that operation is under proof. |
| CI evidence and kept provenance | Retain `serveActionsFor`, adapter answers, `storyCiComparisonEvidence`, CI/proof builders, `scopeHistoryCollection.ts` and `aLandedCiHistory`. They serve external evidence, not expected answers. Related incidental launch/landing IDs derive through existing builders; explicit provenance dates/identities remain caller facts. |
| Browser mechanics | Keep the existing Intent comparison, story, Summary and scope-history page owners. Tests retain concrete expectations, provider calls and causal transitions. No new scenario runner. |

Follow Accepted [ADR 0002 — Direct domain mapping](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution),
[ADR 0008 — Published/local distinction](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state)
and [ADR 0010 — Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
The [existing North Star](../../NORTH-STAR.md#one-backlog-interpretation-separate-observation-and-presentation)
and test-data architecture support this direction. No new topic, schema, ADR
exception or consequential architectural decision is needed.

Inspected expected owners are within 250 lines: repository builder 231,
origin preparation 249, initialization 94, origin 193, kept story 169,
comparison fixture 236, Taken 140, Done 79, earlier landing 193, skipped
fixtures 243/225/137, completed publisher 243, retained helpers 58/56,
Intent completed 105, Summary repository 184, publishers 108/187, guide 224.
Recheck edited paths. Keep serving, history facts and materialization cohesive:
extract baseline facts from the comparison-serving module, completion facts
from CLI publication, and installation layering from origin preparation if
growth requires it. Do not mechanically cut files or duplicate models.

## Decisive premises and preparation evidence

Observed 2026-11-15 in this checkout at the revision above, with dependencies
installed by `npm ci --ignore-scripts`; Playwright used AC power, `caffeinate -s -i`, one worker,
load 6.83/6.24/6.16 and 55% free memory. These are focused functional
observations, not a capacity measurement or proof of the future API.

| Premise / consuming operation | Observation and result | Unverified remainder |
| --- | --- | --- |
| Declared baseline facts can feed the existing real Git comparison and provisional refresh (slice 1). | A passed 6 maintained cases. A disposable `precedeClaimWithPlanning` used `makeMe.aRepository` for the built workflow/files and four planning revisions, committed by the existing materializer. B passed both completed and Taken comparison cases, including the later-head reread. | Named fixture-map continuity and final migration are implementation obligations, with proof below. |
| Comparison proof depends on build-time workflow bytes (slices 1–3). | With that probe's historical workflow changed to `name: altered historical workflow\njobs: {}\n`, D failed at the independent `+17 s` overall timing assertion. E restored original source and passed 6 comparison/adapter/distinct-landing/Summary cases. | An earlier fault C matched the local workflow exactly and stopped on an empty commit; it reached no timing assertion and is not discrimination evidence. |
| Done Intent distinguishes immutable source bytes from local workspace state (slice 4). | G changed only the retained helper's implementation file bytes. The readable-Done case failed at the expected `completed immutable` diff, showing `wrong historical source`. H restored source and passed both retained-workspace cases. | Final declared source/workspace construction must retain these observations. |
| Existing graphs support owning merges, fast-forward and later first-parent histories; collected proof reaches actual provenance (slices 2, 3, 5, 6). | F passed 6 backend published-endpoint/history-integration/scoped-provenance cases. E reached the real adapter and historical Summary file source; A reached the real collector and project/nested/file timing charts. | Do not resurrect unused browser publishers to duplicate backend variant proof. Rerun reached consumers after migration. |
| Shared materialization preserves topology and private mutable state (all slices). | I passed 8 cases including actual ordered Git parents, workspace ancestry, executable bytes, peer refs/config/index/files and snapshot teardown. | Changed installed-origin map paths need their own consuming/isolation proof in slice 1. |

Literal observations (all paths below are outside the checkout):

```sh
# A: baseline, strict passed, 6 cases
OPEN_DOUGH_E2E_PROOF_RECORD=/tmp/seed353-intent-baseline-20261115-a.json caffeinate -s -i npm run test:e2e -- intent/intent-ci-comparison.spec.ts intent/intent-ci-comparison-taken.spec.ts intent/intent-ci-comparison-skipped-landed.spec.ts intent/intent-done-retained-workspace.spec.ts intent/intent-project-scope-timing-history.spec.ts --workers=1
# B: disposable declarative baseline, strict passed, 2 cases
OPEN_DOUGH_E2E_PROOF_RECORD=/tmp/seed353-intent-declarative-20261115-b.json caffeinate -s -i npm run test:e2e -- intent/intent-ci-comparison.spec.ts intent/intent-ci-comparison-taken.spec.ts --workers=1
# D: deliberate historical-workflow fault, strict failed at timing, 1 case
OPEN_DOUGH_E2E_PROOF_RECORD=/tmp/seed353-intent-historical-workflow-fault-20261115-d.json caffeinate -s -i npm run test:e2e -- intent/intent-ci-comparison.spec.ts --workers=1
# E: restored source/topology routes, strict passed, 6 cases
OPEN_DOUGH_E2E_PROOF_RECORD=/tmp/seed353-intent-restored-topology-20261115-e.json caffeinate -s -i npm run test:e2e -- intent/intent-ci-comparison.spec.ts intent/intent-ci-comparison-adapter.spec.ts intent/intent-ci-done-prior-provenance.spec.ts intent/intent-summary-story-comparison-source.spec.ts --workers=1
# F: backend graphs and actual scoped provenance, strict passed, 6 cases
OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD=/tmp/seed353-intent-backend-20261115-f.json caffeinate -s -i npm run test:dashboard:backend -- intent/ci-comparison-published-endpoints.spec.ts intent/ci-comparison-history-integration.spec.ts intent/landed-ci-scope-build-provenance.spec.ts --workers=1
# G: deliberate historical-source fault, strict failed at diff bytes, 1 case
OPEN_DOUGH_E2E_PROOF_RECORD=/tmp/seed353-intent-retained-source-fault-20261115-g.json caffeinate -s -i npm run test:e2e -- intent/intent-done-retained-workspace.spec.ts --grep 'a readable Done' --workers=1
# H: restored source, strict passed, 2 cases
OPEN_DOUGH_E2E_PROOF_RECORD=/tmp/seed353-intent-restored-source-20261115-h.json caffeinate -s -i npm run test:e2e -- intent/intent-done-retained-workspace.spec.ts --workers=1
# I: graph/workspace/private-copy boundaries, 8 passed
node --test Distribution/tests/support/repository-fixture.test.mjs Distribution/tests/support/repository-graph.test.mjs Distribution/tests/support/repository-snapshot-isolation.test.mjs
```

Scratch edits were reverted byte for byte before any preparation record write.
Expected fault failures above are controlled observations; no unexplained
failure remains. Use fresh proof paths for execution.

## Outside-in proof and consumer ownership

| Promise and reached boundary | Slice / proof owner |
| --- | --- |
| Named baseline/claim/provisional branch and trunk; later-head refresh remains an action | 1: complete `intent-ci-comparison-taken` and `intent-ci-comparison-adapter-taken` E2E files, reached backend Taken cases, real SHA/parent observations and Actions request assertions. |
| Original owning landing/branch vs completion/later builds; fast-forward/rewrite variants preserved | 2: E, F and `ci-comparison-endpoints` backend cases. Preserve canonical expected endpoint facts rather than deriving expectations with the description renderer. |
| Workflow/config bytes yield planning-only/equivalent, code/no-run, cancelled and proofless distinctions | 3: complete skipped/missing-run/adapter-planning-skip/cancelled-landing E2E files, reached backend selection/refusal cases and scoped-provenance file. Final historical-workflow fault must still discriminate. |
| Done sources stay immutable despite retained workspace/later trunk; missing objects and recovery stay meaningful | 4: complete retained-workspace, retained-landing, prior-execution, default-answer-selection, completed-source and project-refresh E2E files; reached integrated Done source/review-mode cases. Keep capture, completion, shallow/deepen and post-read publication as actions where observed. |
| Nested/renamed Summary rows and file source use the same declared comparison | 5: E's Summary file-source cases, renamed Summary E2E, reached integrated Summary/relative/drilldown cases and their independent proof/provider assertions. |
| Scope history keeps represented landing, selected build, dates, order, gaps and file timing totals | 6: A's collector/project case, complete scoped collected-file/history/prior-build E2E cases and reached backend scoped build-provenance/later-build/shared-attempt cases; integrated kept-history provenance/gaps/legacy cases. |
| Deferred reuse, private refs/objects/config/index/files and cleanup | 1 owns any origin/map change: existing start-origin isolation and kept-origin consumers plus I. Every later slice reruns reached consumers when its shared description changes. |
| Readability, one shared model and no superseded arrangement | Every slice compares representative before/after construction and removes newly unused setup. Slice 6 updates the guide and checks remaining direct/indirect Intent candidates across the original three roots. |

Before delivery, run installed `dough-execute-plan/scripts/consumer-trace.mjs`
with `--checkout <execution checkout> --base HEAD`, adding effect terms for
the changed comparison/source/history operations and exported helpers. Follow
support/page/step names until actual specs and native/script consumers appear.
Disposition every listed consumer as run, reused evidence, or excluded with the
unreached boundary. Include non-Intent consumers of shared completed/origin
owners, explicit/omitted identity callers and MakeMe's native runtime closure.
The table maps promises; filename matches alone do not prove coverage.

## Ordered slices

### 1. Read provisional comparison history from named facts
Type: Behavior
Status: planned
Proof: Provisional and isolation rows above; A/B establish the consuming route.

Behavior: Given a declared built baseline, planning chain, claim and branch/trunk
tip, opening Taken Intent shows the same provisional CI identities and timing.
Replace routine baseline/Taken setup and endpoint searches with shared named
facts/results, preserving actual post-observation head publication and requests.
Carry results through prepared/private/worker-kept paths if needed; prove peer
isolation. Interim: completed comparison publishers still use their current setup.
One provisional comparison loop; 15 active minutes, running commands excluded.

### 2. Read the owning landing independently of completion
Type: Behavior
Status: planned
Proof: Owning-landing row, E/F, independent parent/endpoint and adapter assertions.

Behavior: Given claim, implementation, ordered owning merge, later completion
and later trunk, Done Intent names the original branch/landing builds. Compose
shared completion facts for Done and earlier-landing publishers, keeping meaningful
authors, first-parent trees and bytes. Preserve actual lifecycle actions where
observed. Existing fast-forward/rewrite backend graphs stay declarative; remove
browser setup proven unused (including type-only references) without dropping
their surviving behavioral proof. Interim: skipped-build variants migrate next.
One original-landing selection loop; 15 active minutes, commands excluded.

### 3. Read build eligibility from historical workflow facts
Type: Behavior
Status: planned
Proof: Workflow/eligibility row, F's scoped provenance and final workflow fault.

Behavior: Given explicit workflow bytes and planning/code changes at named
baseline, branch and landing revisions, comparison retains skipped, exact,
ancestor, equivalent, later-build and unavailable distinctions. Migrate skipped
start/landing/proofless-parent and retry starting history through the same graph
owners. Preserve provider runs/proofs/jobs, adapter differences and literal
invalidity. Unshallow/retry and later publication under proof remain actions.
One build-selection loop; 15 active minutes, commands excluded.

### 4. Read completion sources beside retained local state
Type: Behavior
Status: planned
Proof: Immutable-source row, H and the retained/prior-execution consumer files.

Behavior: Given named completion-time locations/files and conflicting later
published/local facts, Done Intent uses its immutable source while Review keeps
its local meaning. Migrate completed/retained Intent setup and defaults through
existing history/workspace and launch/landing builders; no duplicate completion
model. Keep actual completion, capture and recovery sequences visible where
those operations establish the observation. Preserve missing-history refusals.
One completion-source selection loop; 15 active minutes, commands excluded.

### 5. Read Summary comparisons from the shared history
Type: Behavior
Status: planned
Proof: Nested Summary/file-source row and complete reached Summary consumers.

Behavior: Given declared added/modified/removed/renamed test files and their
owning integration, Summary and file Proof preserve exact source/count/timing
comparisons in Story Branch and Trunk/Taken modes. Reuse and reconcile
`declaredSummaryComparisonHistory` with the shared completion facts, replacing
imperative variant setup and message-based SHA discovery. Keep independent
expected rows and providers outside builders. One hierarchical comparison loop;
15 active minutes, commands excluded.

### 6. Read timing-history provenance from named revisions
Type: Behavior
Status: planned
Proof: Scope-history/provenance and final readability rows above.

Behavior: Given named represented landings and selected builds, ordered measured
revisions, gaps and current endpoint, collected/kept history preserves dates,
provenance and nested/file totals even for sources absent from the current tree.
Replace incidental Git endpoint/ID wiring in scope/prior-build history setup;
keep independent Git/order observations, collection, corruption, recovery and
cleanup actions visible. Finish this story's indirect candidate audit and guide
examples, preserving deferred siblings' ownership. One timing-history reading
loop; 15 active minutes, commands excluded.

## Verification and execution gates

Apply [AGENTS.md](../../../AGENTS.md#test-automation), installed MakeMe and browser
page-object selection before test edits. The selector resolved MakeMe true for
the inspected three tiers, pageObjects true for E2E/integrated and false for
backend. Recheck actual/new paths. Builders follow consuming tests; production
types are type-only imports, and Git/files/environment/cleanup remain harness
work. Add no builder-only checks. Keep default test timeouts; never `test.slow()`
or suite/file/group/hook timeout overrides.

Local gates: complete affected spec files and their traced consumers above,
`npm run typecheck:dashboard`, changed-file lint, I when repository/origin
materialization changes, and `native-import-closure.test.mjs` when MakeMe's
runtime closure changes. Broaden to the whole affected group if the trace shows
the shared change reaches it; do not infer a full local suite requirement from
hosted CI. Repeat source/workflow faults against final setup, restore and pass.
No product-suite run is required to land these Markdown preparation records.

Before expensive proof inspect load/memory and competing runs; start focused at
one worker. Use the maintained [macOS sleep guard and power condition](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos):
fully awake on AC under `caffeinate -s -i`; on battery, lid open and fully awake
under `caffeinate -i`, then inspect the sleep log. Unfiltered groups share
admission across worktrees. Follow the shared [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
as written for every local/CI failure, carrying this link into every delegation
and repair handoff. Execution retains its required final CI ownership.

## Current decisions and concern review

- One repository-facts model and canonical completion/launch relationships serve
  all six outcomes; later slices compose them rather than add variant renderers.
- Slice-plan refinement was not needed: six independently observable reading
  outcomes, each with a bounded migration/proof loop, fit the eight-slice limit.
  The shared owners already exist; no speculative Structure slice is needed.
- No remaining slice-specific concern was identified in this review. The probes
  settle current consuming routes; new construction remains work to prove.
- No blocking dependency, pre-Take human decision, trunk-only operation or
  execution authorization. Preserve earlier slices' proof while later consumers
  migrate; no CI-breaking interim state is accepted.
