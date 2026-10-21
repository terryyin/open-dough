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
**Status:** planned
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

The scratch observation ran `node --input-type=module` with the following
operation sequence on standard input (imports, cleanup registration and
exit-code/byte-equality assertions are omitted here):

```js
const f = await fixture(t); // t.after registers fixture cleanup
writeFileSync(join(f.integration, supplierPlan), plan("done"));
const evidence = await publish(f, "completed supplier evidence");
await run(f.project, ["complete", "--identity", supplier.identity]);
rmSync(join(f.integration, ".planning/seeds/B.md"));
rmSync(join(f.integration, supplierPlan));
const accepted = await publish(f, "clean completed supplier");
const facts = await readDependencies(f.project, consumer);
const held = facts.dependencies.find(d => d.supplier.identity === supplier.identity);
const condition = "The selected endpoint contract is available; future consumer implementation belongs to the consumer.";
await updateDependency(f.project, consumer, { ...held, condition });
await resolveConsumer(f, consumer, evidence, accepted, { condition });
await resolveConsumer(f, consumer, evidence, accepted);
await readDependencies(f.project, consumer);
```

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
