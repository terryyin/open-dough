# Run project and shared feedback maintenance in one invocation

**Source:** [SEED-010 — Run project and Open Dough feedback maintenance in one invocation](../../seeds/SEED-010-learn-from-execution-retrospectives.md#run-combined-project-and-shared-feedback-cycle)
**Identity:** SEED-010#run-combined-project-and-shared-feedback-cycle

## Goal and scope

Give the Open Dough maintainer one explicit `maintain-feedback-cycle` invocation
that performs project-local maintenance across the discovered project set, then
shared collection and priority selection, and delivers every resulting change.
Carry the originating authority, actual record locations, coverage gaps and
per-repository delivery facts across those boundaries. Preserve existing local
stories when shared responses subsequently lead Open Dough's queue.

Use one internal source at `.agents/skills/maintain-feedback-cycle/SKILL.md`,
with the ordinary thin Claude discovery pointer. Keep it outside the installer
payload. The maintained local and shared skills own their rules; the new skill
owns composition, phase order, handoff, combined recovery and reporting. Link
the combined entry point from the maintainer runbook while preserving its
explicit shared-only invocation. Add references only if the resulting workflow
needs them to stay readable.

No selected improvement is implemented. Scheduling, new causal or selection
policy, direction changes, release/install rollout, dashboard controls and a
permanent cycle ledger are outside this delivery. Examples are representative,
not project-count or branch-name restrictions. Both constituent stories are
completed; no new backlog dependency or North Star topic is needed.

## Existing owners and architectural constraints

PFE searched the maintenance skills, their delivery references, the runbook,
dashboard configuration resolver, native proof helpers and completed maintenance
plans recovered from Git. Reuse these responsibilities directly:

- [Project maintenance](../../../src/skills/dough-triage-project-findings/SKILL.md)
  owns attribution, lifecycle, local story selection and
  [delivery](../../../src/skills/dough-triage-project-findings/references/maintenance-delivery.md).
  It already accepts a named phase's originating user authority for its selected
  project. Load this maintained source with the target project established;
  resolve helper commands in that project's installed runtime.
- [Shared collection](../../../.agents/skills/collect-client-feedback/SKILL.md)
  owns production inventory discovery/recheck, catalog reconciliation, adoption,
  retention/watch judgments, shared priorities and later cross-repository delivery.
  It already accepts an explicit composing handoff. Reuse its discovery section
  before local passes and its full workflow afterward; reading that section alone
  does not start collection. Pass additions back through the local-phase boundary.
- [Dough Land](../../../src/skills/dough-land/SKILL.md) and the target project's
  installed publisher own Git reconciliation, acceptance, refresh and retirement.
  Pass owned workspaces and retained candidate/base facts; do not copy their Git
  algorithm. A local pass may retire its workspace: the next phase resolves the
  accepted target or a retained unfinished candidate, not a deleted path or stale
  default checkout.
- The [runbook](../../../docs/maintainer/retrospective-findings-runbook.md) remains
  a discovery pointer. The dashboard's
  [configuration resolver](../../../dashboard/server/projectConfiguration.ts)
  supplies the production location; no dashboard or configuration mutation is needed.

Follow [AGENTS.md](../../../AGENTS.md),
[ADR 0002 — Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
for one representation per responsibility and proportionate process,
[ADR 0003 — Release lifecycle and versioning](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
for source/installed boundaries,
[ADR 0005 — Cross-tool validation](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
for useful behavior and evidence limits, and
[ADR 0006 — Write skills for executing agents](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
for explicit target-project context and minimal host adaptation. Their index and
in-file Accepted statuses agree; no conflict or exception was identified.
The existing North Star covers dashboard work, not a new maintenance architecture.

## Preparation observations and decisive premises

Observed on 2026-10-19 in the established preparation checkout
`/Users/terryyin/git/open-dough/.worktrees/run-project-and-open-dough-feedback-maintenance`
at `331b8155b4195e2dca33385cb75fb7b015414f80`. No maintenance cycle or production
project write ran during preparation.

| Premise and consuming operation | Observation, result and limit |
| --- | --- |
| Existing publication can preserve unrelated default-checkout work and accept the owned result; resume can recognize accepted ancestry without republishing | `PATH=/opt/homebrew/bin:$PATH npm test -- src/skills/dough-execute-plan/scripts/publication.test.mjs src/skills/dough-execute-plan/scripts/publication-checkout-maintenance.test.mjs src/skills/dough-execute-plan/scripts/publication-resume.test.mjs tests/test-runner-selection.sh` exited 0. Inspected setup/assertions create real local bare origins, publish and inspect accepted SHAs, compare dirty/index/private-commit state, and observe a second resume with no push or commit. This settles reusable Git mechanics, not agent compliance. |
| A native proof route can be attempted with existing isolation and supervision | `node --version` returned `v24.21.0`; `codex --version` returned `codex-cli 0.163.0`; `bash -n tests/support/native-codex.sh tests/support/native-run-supervise.sh` exited 0. The selected test-runner check above exercised selection/refusal. These cheap checks do not establish authenticated native execution; slice 1's early paid probe owns that remaining premise. |
| The combined instruction is enough for both phase owners to act on the right project and complete delivery | Source inspection found explicit composing authority in both contracts. Historical fixture sources are recoverable with `git show 6222747b:.planning/slice-plans/317-collect-client-feedback/proof/setup-first-use.py` and `git show f492e533:.planning/slice-plans/317-collect-client-feedback/proof/setup-partial-use.py`. They supply real local origins, isolated inventory, catalog and interrupted-delivery inputs, but do not prove the new local-then-shared journey. Slice 1 must observe actual child consumption; failure stops dependent work and changes this plan. |

The remaining decisive premise requires paid native execution and record/Git
mutations. Bound it by the first slice's isolated probe rather than inferring
success from the contracts or prior shared-only evidence. No production
credentials, production inventory or external repository publication is needed
for that probe. If the native route is unavailable, retain the evidence and stop
the dependent slice; do not substitute transcript replay for observed behavior.

## Outside-in proof

Use disposable repositories with local bare origins, an explicitly supplied
inventory and separate canonical local findings, shared logs, catalog and
backlogs. Include Open Dough and another project with mixed local/shared evidence,
an existing queued response, Taken work and unrelated queue entries. Reuse the
historical fixture concepts and current native helpers; adapt only what is
needed for the combined journey. Keep production sources protected and fixture
authority explicit. The prompt invokes the new skill and supplies inputs, not
the expected classification, counts or ranking answer.

| Story examples | Observable proof and owner |
| --- | --- |
| 1, 3: ordered phases, local-story preservation, later shared edits | Slice 1: native trace shows every selected local pass/result before shared consumption; inspect actual canonical records, reciprocal links and queue order. Read each origin target to prove both local results and later shared adoption edits are accepted, including Open Dough. A first-phase SHA alone cannot pass. |
| 2, 7: unavailable local pass or consequential conflict | Slice 1: representative behavior review traces the exact missing-input/conflict branch through the owning skill; slice 2 supplies a real unavailable local input and unrelated checkout work. Observe qualified coverage, unchanged affected records and independent progress. No passed watch may depend on the gap. |
| 4, 5: partial publication, recovery and unchanged rerun | Slice 2: retain candidates and report, restore the unavailable fixture boundary, invoke again, and compare remote ancestry, occurrence/alias/story counts and accepted commit history. A final unchanged invocation yields no empty commit or repeated push. Verify private staged/unstaged bytes and local commits separately from refresh. |
| 6: inventory changes | Slice 2: an independent fixture actor adds one project between initial discovery and final selection; observe its local result or explicit gap before shared use. Walk a target-change/removal case and verify retained pending delivery is reported rather than silently dropped or redirected. |
| One combined completion report when reporting context is supplied | Slice 2: inspect the handoff and completion path; child landing/local returns defer final reporting to the combined owner, which waits for both phases and truthful delivery outcomes. Exercise with an isolated reporting receiver if reporting code changes; do not contact the production dashboard from fixtures. |

Judge the native result from repository state and the trace, not self-report or
exit status alone. If a small assessor is introduced, exercise counterexamples
for omitted second-phase publication and duplicated occurrences/stories before
trusting it. Native artifacts and temporary assessors belong under this plan
while active and follow ordinary wrap-up cleanup; they are not a new product
test framework or durable run ledger.

## Ordered slices

### 1. One invocation completes local maintenance before shared collection
Type: Behavior
Status: planned
Proof: Story examples 1 and 3 plus the invocation/context/conflict behavior review; early native handoff probe and actual remote record inspection described above.

Behavior: Given an explicit combined invocation and a resolved project set,
each project including Open Dough reaches a local result or named gap before
shared collection. The shared phase consumes the resulting records, preserves
local stories while applying its own priority rule, and delivers every changed
repository without another maintenance/publication prompt.

Author the smallest complete wrapper, its thin pointer and runbook entry.
Pass originating instruction, project/target, canonical destinations, workspace
ownership and current result/delivery facts to each authoritative owner. Preserve
narrower instructions. Distinguish unavailable local classification from shared
evidence and stop only dependent decisions. Resolve the source-to-target-helper
handoff explicitly, including absent/incompatible helper handling.

Run the first isolated native observation as soon as this minimal composition
exists. It is the early feasibility probe: verify local classification/story
creation, shared consumption, both publication stages and preserved local work.
If the handoff, runtime or isolation cannot reach those outcomes, stop dependent
implementation, retain the exact failure, and revise the approach before slice 2.
Do not install guidance into production to make the probe pass.

Complete the representative AGENTS.md behavior review and focused diff/link
checks. This slice already reports failures truthfully; interruption recovery
is not claimed proved until slice 2. Its safe stop is a working complete-input
cycle with explicit retained unfinished boundaries, not a false completion.

### 2. A partial combined cycle resumes without repeating accepted work
Type: Behavior
Status: planned
Proof: Story examples 2 and 4–7 through the same native fixture's interrupted/resumed journey, state comparisons and bounded conflict/inventory/reporting walkthroughs.

Behavior: Given a missing local input, changed inventory or partial publication,
supported work remains delivered and the report names each affected phase and
unfinished boundary. A rerun reuses evidence, stories and accepted commits,
finishes later shared edits, and reports complete only when required work is
accepted; deferred default-checkout refresh remains a separate outcome.

Extend the same wrapper's handoff/recovery instructions, without a second
classification policy or Git algorithm. Recheck inventory through its owner,
route newly discovered projects through local maintenance, and retain pending
work when projects disappear or targets change. Keep receipt/report context
outside any workspace a child may retire. Defer supplied dashboard completion
to the combined owner once all required operations and wording settle.

Exercise a local-phase gap, accepted local publication followed by a blocked
shared delivery, independent supported publication, unrelated dirty/default
checkout work, inventory addition, recovery and unchanged rerun. Observe the
real origins and counts at each boundary. Reuse sufficient slice-1 evidence;
do not repeat a full suite merely to produce another pass. Resolve any observed
missing behavior within the story and rerun only its affected proof.

## Verification and execution constraints

[AGENTS.md](../../../AGENTS.md) requires representative useful-behavior review
for conventional skill changes. This uses an existing shared skill-discovery
mechanism and ordinary thin Claude pointer; no routine per-tool discovery matrix,
installer change or dashboard application suite is a local gate. The combined
native journey proves the observed host only. Review affected descriptions,
context, examples and pointer against the same behavior; investigate an unusual
host case if it arises rather than claiming unobserved native success.

Execution follows the installed execute-plan workflow, including independent
post-change refactoring, normal hooks, agent commits, delivery and its CI duties.
If an existing helper contract changes, trace its actual consumers and add/run
their focused regression proof; the prose-only footprint does not waive those
obligations. No numeric slice limit was supplied. Each slice owns one coherent
outcome with implementation, proof and cleanup; there is no preparatory framework
or independent second feature. No execution is authorized by this preparation.

## Current decisions and review

- Reuse both maintained source phase contracts, each with the target project's
  established context and installed helpers. No release or rollout prerequisite
  is invented for this internal composition.
- Keep live recovery in the run's concise report and real records/Git facts,
  including accepted candidate/base facts; do not add a persistent state model.
- Slice-plan refinement was not needed: the two slices separate complete-cycle
  use from interrupted recovery with explicit proof ownership and a safe stop.
- No remaining slice-specific or cumulative design concern was found beyond
  the permitted early native probe, whose failure stops dependent work.

## Learnings

No implementation learning yet. Source inspection established the existing
composing-authority handoffs; actual combined consumption remains the early
probe's responsibility.
