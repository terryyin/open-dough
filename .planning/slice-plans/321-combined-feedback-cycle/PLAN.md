# Run project and shared feedback maintenance in one invocation

**Source:** [SEED-010 — Run project and Open Dough feedback maintenance in one invocation](../../seeds/SEED-010-learn-from-execution-retrospectives.md#run-combined-project-and-shared-feedback-cycle)
**Identity:** SEED-010#run-combined-project-and-shared-feedback-cycle

## Goal and scope

Give the Open Dough maintainer one explicit `maintain-feedback-cycle` invocation that performs
project-local maintenance across the discovered project set, then shared collection and
priority selection, and delivers every resulting change. Carry the originating authority,
actual record locations, coverage gaps and per-repository delivery facts across those
boundaries. Preserve existing local stories when shared responses subsequently lead Open Dough's queue.

Keep `.agents/skills/maintain-feedback-cycle/SKILL.md` as the internal source, outside the payload,
with the ordinary thin Claude pointer. It owns composition, phase order, handoff, recovery
and reporting; the phase skills retain their rules. Link it from the runbook while preserving
the shared-only invocation. Add focused references only if readability needs them.

No selected improvement is implemented. Scheduling, new causal or selection policy, direction
changes, release/install rollout, dashboard controls and a permanent cycle ledger are outside
this delivery. Examples are representative, not project-count or branch-name restrictions.
Both constituent stories are completed; no new backlog dependency or North Star topic is needed.

## Existing owners and architectural constraints

PFE searched maintenance/delivery skills, runbook, configuration resolver, native
helpers and completed plans recovered from Git. Reuse the existing owners:

- [Project maintenance](../../../src/skills/dough-triage-project-findings/SKILL.md):
  attribution, lifecycle, local selection and
  [delivery](../../../src/skills/dough-triage-project-findings/references/maintenance-delivery.md).
  Pass named-phase authority and the established target project; resolve helpers
  in that project's installed runtime.
- [Shared collection](../../../.agents/skills/collect-client-feedback/SKILL.md):
  inventory discovery/recheck, reconciliation/adoption, retention/watch, priorities
  and later delivery. Pass the composing handoff. Read discovery before local
  passes without starting collection; run the full workflow afterward and route
  additions through the local phase.
- [Dough Land](../../../src/skills/dough-land/SKILL.md) and the target project's
  installed publisher: Git reconciliation, acceptance, refresh and retirement.
  Pass owned workspace/candidate/base facts without copying Git mechanics. After
  retirement resolve the accepted target or unfinished candidate, never stale paths.
- [Runbook](../../../docs/maintainer/retrospective-findings-runbook.md): discovery.
  [Configuration resolver](../../../dashboard/server/projectConfiguration.ts):
  production location. No dashboard/configuration mutation is needed.

Follow [AGENTS.md](../../../AGENTS.md) and Accepted ADRs:
[0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
(one representation, proportionate process),
[0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md) (source/installed boundaries),
[0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md) (useful behavior, evidence limits),
[0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
(explicit target context, minimal adapters). Index/in-file statuses agree; no
conflict/exception. The dashboard North Star adds no maintenance architecture.

## Preparation observations and decisive premises

Preparation on 2026-10-19 used this established checkout at `331b8155b4195e2dca33385cb75fb7b015414f80`,
without maintenance or production writes. Full commands, inspected assertions and historical fixture
locators are recoverable from this plan at `7a7d82ca3e4353b7b1c28ea8cd03b4c031453161`. Decisive premises:

- Focused publication/preservation/resume and runner-selection tests exited 0,
  proving reusable local-origin Git mechanics, including dirty/index/private-commit
  preservation and accepted-ancestry resume without republishing, not agent compliance.
- Node `v24.21.0`, `codex-cli 0.163.0` and native-helper syntax checks established
  an attemptable supervised route, not authenticated native execution.
- Both source contracts accept composing authority. Historical fixtures supply
  origins, inventory/catalog and interrupted-delivery inputs, not the new journey.

Slice 1's early isolated native probe must prove actual contract consumption and local-then-shared
delivery. Failure stops dependent work and revises this plan; retain unavailable/inconclusive
evidence and never substitute transcript replay. The probe needs no production credentials/inventory or external publication.

## Outside-in proof

Use disposable repositories/local bare origins, explicit inventory and separate canonical local
findings, shared logs, catalog/backlogs. Include Open Dough and another project with mixed evidence,
existing queued/Taken responses and unrelated queue entries. Reuse historical fixture concepts/current
native helpers with only necessary adaptation. Protect production sources, state fixture authority,
and prompt with invocation/inputs without expected classifications, counts or ranking.

| Story examples | Observable proof and owner |
| --- | --- |
| 1, 3: ordered phases, local-story preservation, later shared edits | Slice 1: native trace shows every selected local pass/result before shared consumption; inspect actual canonical records, reciprocal links and queue order. Read each origin target to prove both local results and later shared adoption edits are accepted, including Open Dough. A first-phase SHA alone cannot pass. |
| 2, 7: unavailable local pass or consequential conflict | Slice 1: representative behavior review traces the exact missing-input/conflict branch through the owning skill; slice 2 supplies a real unavailable local input and unrelated checkout work. Observe qualified coverage, unchanged affected records and independent progress. No passed watch may depend on the gap. |
| 4, 5: partial publication, recovery and unchanged rerun | Slice 2: retain candidates and report, restore the unavailable fixture boundary, invoke again, and compare remote ancestry, occurrence/alias/story counts and accepted commit history. A final unchanged invocation yields no empty commit or repeated push. Verify private staged/unstaged bytes and local commits separately from refresh. |
| 6: inventory changes | Slice 2: an independent fixture actor adds one project between initial discovery and final selection; observe its local result or explicit gap before shared use. Walk a target-change/removal case and verify retained pending delivery is reported rather than silently dropped or redirected. |
| One combined completion report when reporting context is supplied | Slice 2: inspect the handoff and completion path; child landing/local returns defer final reporting to the combined owner, which waits for both phases and truthful delivery outcomes. Exercise with an isolated reporting receiver if reporting code changes; do not contact the production dashboard from fixtures. |

Judge repository state and trace, not self-report/exit alone. Any new assessor needs counterexamples
for omitted shared publication and duplicated occurrences/stories. Keep native artifacts/temporary
assessors under this active plan through ordinary wrap-up cleanup, not as a product framework or durable ledger.

## Ordered slices

### 1. One invocation completes local maintenance before shared collection
Type: Behavior
Status: done
Proof: Story examples 1 and 3 plus the invocation/context/conflict behavior review; early native handoff probe and actual remote record inspection described above.

Behavior: Given an explicit combined invocation and a resolved project set,
each project including Open Dough reaches a local result or named gap before
shared collection. The shared phase consumes the resulting records, preserves
local stories while applying its own priority rule, and delivers every changed
repository without another maintenance/publication prompt.

Author the minimal complete wrapper, pointer and runbook entry. Pass originating
and narrower instructions, project/target, canonical destinations, ownership and
result/delivery facts to each owner. Unavailable local classification does not
establish shared responsibility; stop only dependent decisions. Resolve the
source-to-target-helper handoff, including missing/incompatible helpers.

Probe immediately once composition exists: observe classification/local stories,
shared consumption, both publications and preserved local work. Handoff/runtime/
isolation failure stops dependent implementation; retain it and revise before
slice 2. Never install production guidance to pass. Complete AGENTS.md behavior
review and diff/link checks. Safe stop: a working complete-input cycle with truthful
unfinished boundaries; interruption recovery remains slice 2's proof.

### 2. A partial combined cycle resumes without repeating accepted work
Type: Behavior
Status: done
Proof: Story examples 2 and 4–7 through the same native fixture's interrupted/resumed journey, state comparisons and bounded conflict/inventory/reporting walkthroughs.

Behavior: Given a missing local input, changed inventory or partial publication,
supported work remains delivered and the report names each affected phase and
unfinished boundary. A rerun reuses evidence, stories and accepted commits,
finishes later shared edits, and reports complete only when required work is
accepted; deferred default-checkout refresh remains a separate outcome.

Extend this wrapper's handoff/recovery without copying classification/Git policy.
Recheck inventory through its owner, route additions through local maintenance and
retain pending work on removal/retargeting. Keep receipt/report context outside
retirable workspaces; the combined owner reports once operations and wording settle.

Exercise a local gap, accepted local/blocked shared delivery, independent supported
publication, unrelated dirty/default work, inventory addition, recovery and unchanged
rerun. Inspect real origins/counts at each boundary. Reuse sufficient slice-1 proof;
resolve observed gaps within this story and rerun only affected proof, not a full suite.

## Verification and execution constraints

[AGENTS.md](../../../AGENTS.md) requires representative useful-behavior review. Existing shared discovery
and the thin Claude pointer need no routine per-tool matrix, installer change or dashboard suite.
Native proof covers its observed host only. Review descriptions, context, examples and pointer;
investigate unusual host cases when they arise without claiming unobserved native success.

Execution follows the installed execute-plan workflow, including independent post-change refactoring,
normal hooks, agent commits, delivery and its CI duties. Trace changed helper contracts through actual
consumers and run focused regression proof even for prose changes. No numeric limit was supplied.
Each slice owns one coherent implementation/proof/cleanup outcome, not a preparatory framework or
independent second feature. Preparation grants no execution authority.

## Current decisions and review

- Reuse maintained phase sources with target context/installed helpers; no rollout prerequisite.
- Recovery uses the concise report/real records/Git candidate/base facts, not a state model.
- No refinement needed: complete-cycle use and interrupted recovery have separate
  proof owners and safe stops. No other slice/cumulative concern beyond the early
  native probe, whose failure stops dependent work.

## Learnings

Slice 1's [native observation](proof/slice-1-observation.md) proves actual child consumption, local
results before shared use, preserved local stories/Taken work, and both stages accepted in each
fixture origin. Coordinator inspected canonical records, reciprocal links, queue order, native events
and candidate/base receipts. Independent refactoring changed only plan prose; contract hashes and
proof stayed valid. `npm run format` passed after documenting sourced helper variables for ShellCheck
in the disposable runner. The [behavior review](proof/behavior-review.md) covers invocation, context
and conflict paths.

Slice 2's [observation](proof/slice-2-observation.md) and [walkthrough](proof/slice-2-walkthrough.md)
close G1–G4 through the planned native/source boundaries. Refactoring preserved
all captured values and native contracts; formatter passed. No further wrapper
change was needed. G6 explicitly bounds the overwritten artifact without losing
the independent Git, report, trace and publication proof.

## Execution context

- Established start: `SEED-010#run-combined-project-and-shared-feedback-cycle`,
  publisher `dashboard-territory.local-open-dough`, agent `stanly-chan`.
- Originating and execution checkout:
  `/Users/terryyin/git/open-dough/.worktrees/run-project-and-open-dough-feedback-maintenance`;
  reused owned worktree, branch
  `codex/run-project-and-open-dough-feedback-maintenance`, Story Branch Mode.
  Default checkout: `/Users/terryyin/git/open-dough`; authorized remote `origin`,
  trunk `main`. Ordinary increments publish to the execution branch.
- Starting revision `9f5ca4b1f65172e2bd0501e27aec228d26f703f8`;
  accepted claim / previously published base / initial candidate
  `7a7d82ca3e4353b7b1c28ea8cd03b4c031453161`. Claim CI on trunk is unobserved.
- Slice 1 accepted on the execution branch at `f3f2f8aae37dfe83f5778bc6b6f88906c3c4bfcd`,
  suffix base `7a7d82ca3e4353b7b1c28ea8cd03b4c031453161`; next delivery uses that accepted SHA.
- Checkout preparation: `PATH=/opt/homebrew/bin:$PATH npm ci` exited 0;
  `PATH=/opt/homebrew/bin:$PATH npm test -- tests/test-runner-selection.sh`
  exited 0 against the current lockfile on 2026-10-20. Contributor setup was
  then resolved through `tests/native-setup.md`: each of
  `PATH=/opt/homebrew/bin:$PATH node scripts/setup-native.mjs npm`,
  `PATH=/opt/homebrew/bin:$PATH node scripts/setup-native.mjs browser`, and
  `PATH=/opt/homebrew/bin:$PATH node scripts/setup-native.mjs check` exited 0,
  with Chromium `153.0.8010.12`. Native proof was held until that check passed.
- CI source: GitHub Actions, repository `terryyin/open-dough`, verified
  workflow `ci.yml` (display name `CI`), target execution branch above.
  Codex observer coordinator `combined-feedback-321`, directory
  `/tmp/dough-ci-501/watch-U9AgKh`, PID `11808`, session `38392`, yielded cell `8`.
- No numeric slice limit or new overrun-replanning permission was supplied;
  preserve the existing two-slice planning authority and stop any disputed scope.
- Hook: `.githooks/pre-commit` is check-only staged lint and dashboard
  typecheck for staged scripts. Coordinator owns formatting and delivery.

## Story obligations

### G1. Unavailable input and unrelated-work observation
Reported: slice 1 — "Missing-input and consequential-conflict branches received the source walkthrough only."
Story clause: "One project's log or required helper is unavailable → the local phase records that gap and supported projects continue"
Disposition: proved by slice 2: proof/slice-2-observation.md — actual missing beta source leaves qualified local/shared coverage while supported work proceeds; exact alpha private commit/index/worktree evidence stays intact. proof/slice-2-walkthrough.md traces the missing-helper/conflict variants.

### G2. Recovery and unchanged-rerun observation
Reported: slice 1 — "It does not prove interruption recovery, unavailable local input/helper handling, retarget/removal/addition behavior, preserved unrelated private/default work, unchanged repeat idempotence or supplied dashboard completion."
Story clause: "A rerun resumes unfinished boundaries without undoing delivered work or double-counting findings and stories."
Disposition: proved by slice 2: proof/slice-2-observation.md — origin refusal retains alpha's candidate/base; recovery accepts that exact candidate; restored beta evidence creates no duplicate occurrence/story. Actual raw snapshots, beforePush bytes and all unchanged-run commands establish no repeated commit/push.

### G3. Inventory changes and retained delivery observation
Reported: slice 1 — "retarget/removal/addition behavior"
Story clause: "An added project needs its local pass or an explicit gap before its shared evidence is consumed. A removed or retargeted project does not erase retained unfinished delivery."
Disposition: proved by slice 2: proof/slice-2-observation.md observes gamma's independent addition and local pass before shared consumption; proof/slice-2-walkthrough.md traces removal/retarget handling against alpha's real retained candidate and original target. Removal/retarget branches have source review, as planned, not a native publication claim.

### G4. Combined completion reporting observation
Reported: slice 1 — "supplied dashboard completion"
Story clause: "When dashboard reporting context is supplied, the combined invocation owns one final completion report after both phases and all required delivery have settled."
Disposition: proved by slice 2: proof/slice-2-walkthrough.md follows surviving context, deferred child reporting, both phase returns, truthful partial outcomes, final attention and matching-receipt/retry obligations through maintained reporting owners. No reporting code changed, so the plan's conditional receiver exercise does not apply.

### G5. Native observation covers Codex
Reported: slice 1 — "Native evidence here covers Codex only."
Story clause: "Add the internal `maintain-feedback-cycle` skill."
Disposition: no user cost "Add the internal `maintain-feedback-cycle` skill.": The ordinary shared skill source and thin Claude discovery pointer introduce no new host mechanism. AGENTS.md and ADR 0005 require representative useful-behavior review for this conventional change; behavior-review.md inspects invocation, context, failure and handoff paths, and slice-1-observation.md bounds the fresh native claim to Codex. No installation/coexistence or new native host guarantee is claimed.

### G6. Recovery context artifact overwritten during capture
Reported: slice 2 — "The exact native-complete recovery JSON was accidentally overwritten during artifact capture."
Story clause: "Existing Git facts and a concise run report supply recovery context; no permanent cycle ledger or second finding store is required."
Disposition: proved by slice 2: proof/resume-capture-limit.md retains the loss explicitly; actual origin snapshots, complete native report, trace, publication pairs and terminal output independently establish recovery. The unchanged native trace reconciles the stale supplied JSON through that report and fetched ancestry without mutation. The original JSON is unavailable and is not claimed as retained evidence.
