# Correct a consumer agreement after its supplier completes

**Identity:** SEED-010#correct-completed-supplier-agreement
**Source:** [Selected story](../../seeds/SEED-010-learn-from-execution-retrospectives.md#correct-completed-supplier-agreement)
**Finding:** [ODF-297](../../../docs/maintainer/findings/ODF-297.md)

## Goal and scope

Permit an explicitly reviewed correction of an existing consumer agreement
against the same supplier's verified historical completion after cleanup.
Separate the delivered supplier prerequisite from future consumer implementation,
remove only the justified stale wait, and preserve recoverable completion evidence.
The source's Goal, Scope and Key examples define the outcome and rejection rules.
No implementation is authorized by this preparation.

No release or Pygardon write, automatic semantic verification, automatic correction,
new dependency store, new dashboard editor, or supplier recreation is included.
The retained Pygardon report supplies a representative domain example; executable
proof uses isolated local repositories, not that project's working copy or remote.

## Existing solution and architectural direction

PFE assessed the existing command boundary, pure dependency model, historical
completion validator, consumers, preparation reader and published guidance:

- `src/skills/dough-product-backlog/scripts/product-backlog-dependency-resolution.mjs`
  already discovers an existing consumer, verifies historical supplier completion
  through `product-backlog-dependency-completion.mjs`, checks the current dependency
  basis under the file lock, and preserves an unchanged satisfied resolution.
  Extend this owner with an explicit correction mode (for example
  `resolve-dependency --correct-agreement`); default resolution must still reject
  agreement changes. Do not weaken the ordinary resolver into automatic correction.
- Reuse `supplierCompletion` for historical identity, recoverable before-cleanup
  revision, planned/planless completion and accepted-target ancestry. Reuse
  `updateStoryDependency` for the single canonical dependency record and atomic
  stale-basis replacement. Keep new-relationship/live-home authoring with
  `updateDependency`; its absent-home refusal remains correct for ordinary use.
- Reuse `dependencyAgreement` and existing preparation digests. An agreement
  correction invalidates the reviewed content basis, while a resolution-only
  change does not. No readiness renewal, queue movement or consumer completion
  follows from this operation.
- The current satisfied-record shortcut applies only when the agreement is
  unchanged. Explicit correction must still review and validate a changed
  agreement; it must never silently return the old satisfied condition. Preserve
  the original recoverable supplier revision/path and accepted completion evidence
  while recording the new condition judgment and why removed clauses are consumer
  work. Keep that evidence in the existing canonical record and Git history;
  do not add a parallel audit store. Exact replay with the current basis is a no-op.

The shared rule is an existing consumer's explicitly judged prerequisite against
one recoverable supplier outcome. There is no separate Pygardon recognizer or
new rule per supplier lifecycle. Condition satisfaction remains agent judgment:
mechanical checks cannot establish the truth of arbitrary condition prose.

Relevant current Accepted decisions (index and record statuses agree):
[ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
requires one coherent representation and separates readiness, progress and
membership; [ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
keeps source changes distinct from a release;
[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md) and
[ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
require proportionate behavior proof and one runtime procedure addressed to the
executing project. No ADR conflict or new product-wide decision is identified.
The [dashboard North Star](../../../docs/dashboard-ux-ui-north-star.md)'s repository
state authority remains intact; no UI direction or new North Star topic is needed.

## Outside-in proof and affected consumers

All final promises belong to slice 1. Use real CLI invocations against isolated
repositories with a bare local origin. Starting supplier/consumer prose is fixture
input; the CLI must establish the corrected dependency and its observable effects.

| Promise / boundary | Observable proof owned by slice 1 |
| --- | --- |
| Correct the mixed agreement after supplier cleanup | Extend `tests/support/supplier-dependency-completion.test.mjs` (or a cohesive sibling using its fixture): publish completed supplier evidence, clean its canonical section and plan, correct an existing mixed condition through the explicit CLI path, then read the revised agreement and satisfied state. Future consumption stays in consumer scope; its plan/slices and queue membership are unchanged. |
| Historical identity, completed/accepted evidence, stale basis | Exercise wrong supplier identity/path, missing or incomplete history, unaccepted revisions, stale input and absent relationship; assert refusal and byte-identical consumer content. Reuse existing completion and refusal suites for unchanged boundaries. |
| Unproved condition or human-owned scope choice | Walk the runtime procedure with a supplier that lacks the proposed outcome and a separate ambiguous consumer promise. The agent declines correction, retains the agreement, and names evidence/decision required. Missing mechanical evidence also refuses at the CLI. Do not substitute a prose-keyword test for this judgment. |
| Evidence retention and stable repeat | Correct both a waiting agreement and an already-satisfied but misworded agreement. Preserve the original completion locator and accepted history, record the revised judgment, then replay with the current basis and require byte stability. |
| Only this supplier's wait ends | Retain a second unresolved supplier and observe `read-dependencies`, `read-state` eligibility and the real execution-start refusal naming only the remaining blocker. With no blocker, eligibility may change but no execution starts from correction itself. |
| Readiness and unrelated content | Extend `story-dependencies-review-and-eligibility.test.mjs`: readiness judgment is unchanged, corrected agreement reports changed-since-review, unrelated Not ready reasons, sibling prose and other suppliers remain intact. |
| Ordinary paths preserve behavior | Run the whole four-file focused suite below, including ordinary live-home writes and unchanged historical resolution. Default resolution without correction opt-in still rejects a changed agreement. |
| Usable guidance and honest response status | Walk invocation, required context and useful outcome under `AGENTS.md`; align CLI help and the shared supplier procedure, then update ODF-297 with actual examples, unreleased/known release status and the unobserved Pygardon adoption gap. |

The effect flows from the canonical dependency fence through
`readStoryDependencies` to blocking/start guards and through `dependencyAgreement`
to readiness digests. The existing completion suite invokes real execution-start;
the review/eligibility suite observes preparation judgments. Dashboard views consume
those normalized facts; the record schema and rendering contract stay unchanged.
`tests/support/story-dependencies-installed-observe.mjs` is a further CLI consumer:
retain its ordinary update/resolve call forms. If implementation changes shared
exports, fields, defaults or payload files, retrace those consumers and run their
existing affected checks; do not infer coverage from these filename matches.

Focused execution command (add the new sibling file if one is created):

```sh
node --test tests/support/story-dependencies.test.mjs tests/support/story-dependencies-review-and-eligibility.test.mjs tests/support/supplier-dependency-completion.test.mjs tests/support/supplier-dependency-refusal.test.mjs
```

The new positive correction case must fail on the current implementation and
pass after the change. The existing green cases are regression baselines, not
proof of the missing correction. Run the complete affected suites, not a selected
subset hiding consumers. Apply changed-file formatting and the repository commit
hook. Broader checks are required only by an affected boundary or a project gate;
CI configuration alone does not prescribe all suites locally. During authorized
execution, follow [Execute Plan](../../../.agents/skills/dough-execute-plan/SKILL.md)'s
independent post-change refactoring, focused verification and delivery gates;
retain retrospective and wrap-up inputs through that workflow. This project's
`skipProcessRetrospective: false` keeps process review enabled there. These gates
belong to execution and are not permission to execute during preparation.

## Ordered slices

### 1. Correct an evidenced historical supplier agreement without completing its consumer

**Type:** Behavior
**Status:** done
**Proof:** All rows above, through one CLI correction journey and its safety cases,
plus representative review of the corresponding runtime procedure.

**Behavior:** A current consumer holds an agreement with a completed supplier
whose active section is gone → an agent explicitly reviews the boundary and
supplier proof and invokes correction with the observed basis → the same
relationship records the proved revised prerequisite and retained evidence;
consumer implementation remains pending. Invalid/stale inputs or unsupported
judgment leave it unchanged. Ordinary authoring/resolution and replay retain
their existing semantics except for the explicit correction capability.

Implement the correction in the existing dependency-resolution boundary and
shared model, including only structural changes necessary for this behavior.
Keep historical validation and stale-basis checks before any write, with the
current consumer rechecked under its lock. Reject attempts to introduce or
retarget a supplier through correction. Do not silently overwrite prior evidence
or allow satisfied replay to hide an actual agreement change.

Update the shared supplier procedure and CLI help so the agent knows when to
use correction, which evidence to recover, when to stop for a human, how to
retain consumer obligations, and when to reread/rejudge. Link callers to this
single procedure rather than copying rules. Author runtime changes in `src/skills/`;
never hand-sync installed managed copies. Include finding-response maintenance
as part of this outcome, leaving release and external adoption honestly pending.

**Sizing and safe stop:** One cohesive correction outcome, one model and one
outside-in proof loop. Existing local history fixtures and validators remove the
need for new infrastructure. No numeric target or hard limit is supplied.
Implementation, focused proof and cleanup stay together; there is no independently
usable intermediate change that justifies splitting the safety checks from the
correction. If evidence reveals a new domain choice or a substantially different
representation, stop and reassess this plan before extending scope.

## Preparation observations and decisive premises

Observed on 2026-10-21 in the established preparation checkout
`/Users/terryyin/git/open-dough/.worktrees/correct-a-consumer-agreement-after-its-supplier`,
source revision `53fef56382e1b7c149662c3d09348342a79dd476`.

1. **Reported gap and historical reuse:** A scratch Node invocation imported
   `tests/support/supplier-dependency-fixture.mjs`, created its isolated repository,
   published a done supplier plan, completed its backlog entry and deleted its
   home/plan, then published cleanup. The command `node --input-type=module`
   with the fixture script summarized below reached real CLI operations.
   `updateDependency` exited 1 with “Supplier canonical home not found”; `resolveConsumer` with a revised condition exited 1 with
   “Consumer agreement changed since it was read”. Both preserved consumer bytes.
   Resolving the unchanged agreement from the same historical evidence exited 0;
   only the independent THIRD dependency remained blocking. Thus the historical
   validator is usable and the correction is the missing behavior, not missing
   supplier work. The scratch project was removed; no product source was edited.
2. **Available proof route and current boundaries:** The focused command above
   passed all 18 tests in 14.4 seconds. Inspected setup/assertions exercise live
   writes, stale refusal, readiness effects, historical completion/cleanup,
   local accepted ancestry, planless evidence and real start blocking. This is
   baseline evidence only; the new correction and discriminating proof remain
   slice 1 work. No paid/native host route is needed for this CLI responsibility.

The complete preparation script remains recoverable at `0d43a173` in this plan;
its decisive observations and original baseline are retained above.

No current-state premise requires a credentialed probe or a pre-Take decision.
The implementation is still required to establish the promised corrected result.

## Current decisions, learnings and concern assessment

- Use explicit correction in the historical resolution owner; retain default
  unchanged-agreement protection and live-home authoring. The flag spelling is
  an implementation detail; explicit intent and its documented contract are not.
- Supplier identity, completion evidence, accepted integration and consumer
  fulfillment are distinct facts. Human/agent judgment owns semantic fulfillment;
  tooling validates the recoverable facts and write preconditions.
- A known completion is not proof of every revised condition. Never implement
  natural-language matching or treat an opt-in flag as proof by itself.
- No new dependency is needed for this story. No product implementation, release
  or external project change has occurred during preparation.
- Slice-plan refinement was not needed: one cohesive behavior owns all proof and
  safety boundaries, with existing reusable fixtures and no speculative structure.
- No remaining slice-specific concern was identified in this preparation review.

## Execution context

- Established story-branch execution in `/Users/terryyin/git/open-dough/.worktrees/correct-a-consumer-agreement-after-its-supplier`, branch `codex/correct-a-consumer-agreement-after-its-supplier`; reused established workspace. Default checkout `/Users/terryyin/git/open-dough` is maintenance only; management context `/Users/terryyin/git/open-dough/.git`. Git's `refs/worktree/dough/created-for/SEED-010#correct-completed-supplier-agreement` confirms creation for this work and retirement ownership.
- Identity `SEED-010#correct-completed-supplier-agreement`; publisher `dashboard-territory.local-open-dough`; agent `steven-chan`. Accepted claim on `origin/main`: `01d9eefbcf4ecd7c42fa70dbdddef013d51d0c59`; starting revision `0d43a173d9e209ab1163c24bbd409c2207a91f9f`. First increment published base/candidate is the claim SHA. Ordinary destination is the recorded remote execution branch; integration is `origin/main`.
- Node 24.21.0; `node scripts/setup-native.mjs npm`, `node scripts/setup-native.mjs browser`, `node scripts/setup-native.mjs check`, and installed backlog CLI `--help` passed here on 2026-10-21, lock unchanged. Hook checks staged lint and script-triggered dashboard typecheck; selective formatter `npm run format`. No numeric slice budget/hard limit or live action; existing planned replanning authority retained without scope expansion. Slice-1 obligations listing was empty.
- CI GitHub Actions `terryyin/open-dough`, push workflow `ci.yml` (ID 351271804, verified name CI), execution branch target. Coordinator `steven-chan-336`; directory `/tmp/dough-ci-501/watch-3oJ7kk`, PID 65001, session 39507, cell 9. Claim on trunk is unobserved and not registered on this stream.
- Source-only reviewer `/root/source_promises` launched without inherited history, received complete original Goal/Scope/examples/exclusions/completion and no files, plan, product or proof. Actual input and individual commitments G1–G6, S1–S40, X1–X10, C1–C4 are retained in this session's delegation history.

## Accepted source comparison

The independent clauses were compared against source, actual resolver/readers, guidance and observing assertions; no human amendment or changed scope was needed. All applicable promises belong to slice 1. Names below identify tests in `tests/support/`; concrete assertion locations are retained by test name through refactoring.

| Original trigger → expected result | Actual observation and disposition |
| --- | --- |
| Goal / G1–G5: completed supplier cleaned up → reuse outcome, end stale wait without recreating/repeating supplier work | `explicit historical correction removes only the proved supplier wait and retains consumer work`: real historical CLI correction after cleanup; supplier home remains absent, revised condition satisfied. Accepted. |
| S1–S6: existing relationship, explicit review, observed basis, same recoverable identity, completion and accepted history | Flag defaults false; `resolveDependency` calls unchanged `supplierCompletion` then rechecks basis/relationship under lock; positive and refusal matrix observe outcome, accepted SHA and missing/stale/invalid refusal. Accepted. |
| G6 / S7–S11: existing consumer intent OR explicit human decision settles boundary → retain consumption, implement/complete nothing | Shared procedure preserves both alternative grounds, requires removed-clause explanation; first positive keeps pending scope/example, exact plan and queue bytes. Command only mutates the dependency fence. Accepted. |
| S12–S13, S18–S19: correction → preserve readiness judgment, grant no execution, flag changed agreement | Positive preserves assessment basis/status and sets changedSinceReview; historical readiness case preserves entire Not ready judgment/reason, refinement/approach, plus THIRD blocker. Eligible sibling observation invokes no start. Accepted. |
| S14–S17: correction → preserve identity, historical evidence, other suppliers and siblings | Positive tests assert same supplier, primary locator, old summary plus new validated evidence, second dependency and sibling bytes. Existing updateStoryDependency replaces one canonical record. Accepted. |
| S20 / example 4: replay current basis → byte-stable agreement and evidence; another supplier still blocks, plan/readiness unchanged | Both positive tests assert exact home bytes on replay; first real execution-start names only THIRD and creates no workspace. Accepted. |
| S21–S25 / example 2: stale review, different/unverified supplier or unavailable/unaccepted completion → no write | Refusal matrix asserts error and exact consumer bytes for incomplete, unpublished, wrong historical identity, missing home, wrong path, stale basis, absent/retargeted relationship and missing resolution. Accepted. |
| S26–S34 / example 3: unproved condition OR human-owned product/architecture choice → retain agreement, name evidence/decision; command cannot judge prose | Shared procedure explicitly stops both paths, requires reread/rejudgment after stale intent; CLI refuses unresolved correction judgment. Walkthrough below supplies contextual agent observation, not a semantic verifier. Accepted. |
| S35–S40 / example 5: ordinary live authoring and unchanged historical resolution continue; no automatic rewrite/new store/recreated story/queue-completion inference | Focused baseline and installed payload journey pass, ordinary changed-agreement resolver still refuses, historical validator requires completed plan/proof and accepted ancestry. No schema/store/export/payload declaration added. Accepted. |
| Example 1: Pygardon-shaped mixed agreement, recovered full SHAs → corrected satisfied prerequisite, future consumption pending | Isolated local-bare-origin positive journeys exercise this shape with full generated revisions; real Pygardon references identify retained report only. No project-specific recognizer. Accepted; external write excluded. |
| S27, X1–X10: examples are not rejection counts/project filters; no external edit/migration/release/automatic semantic verifier/dashboard editor | Resolver uses general canonical identity/path machinery; diff is shared CLI/guidance/tests/finding only. No live action or release. Accepted exclusions. |
| C1–C4: finding records implemented response, verified examples, known release or unreleased, adoption gap | ODF-297 updated with local proof and semantic walkthrough, explicitly unreleased and Pygardon adoption/outcome unobserved. Accepted, not external completion. |

- Implementation proof: `node --test tests/support/story-dependencies.test.mjs tests/support/story-dependencies-review-and-eligibility.test.mjs tests/support/supplier-dependency-completion.test.mjs tests/support/supplier-dependency-refusal.test.mjs tests/support/supplier-dependency-correction.test.mjs tests/support/supplier-reconciliation.test.mjs tests/support/supplier-reconciliation-refusal.test.mjs` passed 24/24 in 7.66s. New positives first failed the original unchanged-agreement guard after flag registration, establishing discriminating red proof.
- `bash tests/product-backlog-payload-update.sh` passed, including real installed update/resolve with release source unavailable. CLI help assertion passed. Setup supplies starting supplier/consumer records only; real CLI writes establish tested outcomes.
- Walkthrough actual `node --input-type=module` script/output retained in `/root/implement_correction` follow-up: whole-second/strict endpoint at `9979dfc83c8b2231462f59c904e9e70117ff96ea`, accepted `208cf9e5459095093a4155f4ecbbd2983313e287`; fractional consumer lacks delivered precision, unspecified legacy compatibility needs human scope choice. Both stayed waiting/byte-identical, no correction invoked. Coordinator inspected complete inputs/output and judged both refusals against procedure.
- Consumer trace: request → resolver → completion validator → canonical update → dependency reader/agreement digest → read-state/start eligibility/real start guard; installed observer and reconciliation callers inspected. No uncovered affected consumer, unresolved return or interim behavior was identified. Independent refactor accepted; delivery follows through the guarded fresh operation.

- Independent refactor `/root/refactor_correction` returned `## REFACTOR COMPLETE`; coordinator inspected moved assertions/builders and shortened shared-procedure links. No production code changed, applicable boundaries preserved. Replacement focused proof: `node --test tests/support/story-dependencies.test.mjs tests/support/story-dependencies-review-and-eligibility.test.mjs tests/support/supplier-dependency-completion.test.mjs tests/support/supplier-dependency-refusal.test.mjs tests/support/supplier-dependency-correction.test.mjs tests/support/supplier-dependency-correction-satisfied.test.mjs tests/support/supplier-dependency-correction-refusal.test.mjs tests/support/supplier-dependency-correction-readiness.test.mjs tests/support/supplier-reconciliation.test.mjs tests/support/supplier-reconciliation-refusal.test.mjs` passed 24/24 in 7.02s. Installed-payload proof reused; no covered installation/runtime contract changed. `git diff --check` passed.

## Execution retrospective

- Completed planned execution, no scope amendments: attributable implementation `c56944f8b3829980a1fe948baad855bf2780fbe0`; `01d9eefb` is claim provenance and `0d43a173` preparation provenance. Nearby/interleaved upstream stories are outside this execution. Aggregate patch, original contract, source-only comparison, post-refactor suite/assertions, runtime guidance and unchanged model/readers/start guards inspected; no defect, architecture drift, disputed rule or refactoring residue found.
- New CLI positive journeys drove the change from the observed guard failure. Existing ordinary authoring, historical completion, eligibility, reconciliation and installed journeys retain distinct regression responsibilities; the new waiting/satisfied/refusal/readiness observations cover distinct changed behavior. No whole-suite run was required for this bounded responsibility, and no cleanup correction is justified.
- Process review enabled by project configuration and based on available coordinator plus implementation/refactor histories. DearDough records one ODF-264 retrieval recurrence and DD-325's guarded-delivery containment; no new guidance change or follow-up is selected. Product direction/queue reviewed: this response closes the selected blocked maintenance gap; preserve existing priorities. ODF-297 remains explicitly unreleased with external adoption/outcome unobserved, as required exclusions rather than unfinished implementation.
- Planning: unchanged; no correction/follow-up created. CI remains pending on accepted `c56944f8` at the execution branch, observer `/tmp/dough-ci-501/watch-3oJ7kk`; review is complete; the execution completion operation remains pending. No current unresolved attention beyond that owned gate.

## Execution complete

Product advice: no change. Keep the current product backlog order; local implementation and guidance meet the selected outcome. Release and Pygardon adoption remain outside this story's authority and are honestly retained in ODF-297.

- Accepted implementation delivery: `c56944f8b3829980a1fe948baad855bf2780fbe0`, suffix base `01d9eefbcf4ecd7c42fa70dbdddef013d51d0c59`, recorded remote execution branch, observer reused. Formatting and staged lint/dashboard-typecheck hooks passed. No product mutation followed accepted proof; this completion increment changes review records only.
