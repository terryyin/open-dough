---
id: SEED-007
status: active
planted: 2026-09-07
planted_during: Story 7 refinement follow-up on repeated native validation
trigger_when: Improve existing tests under ADR 0005; reconsider stories before revisiting old plans
scope: Representative integration checks, shared behavior checks, and minimal evidence retention
---

# SEED-007: Deliver trustworthy cross-tool acceptance with fewer native runs

## Outcome and boundaries

Follow [ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md).
Use representative skills to qualify shared integration mechanisms on Codex,
Cursor, and Claude Code. Reuse that per-tool evidence for similar skills; add
integration cases only for different mechanisms or invalidated evidence.
Keep skill behavior checks separate. Do not test general vendor skill behavior
or require every product scenario on every tool.

Extend existing tests and keep useful deterministic coverage. Test shared logic
once and adapter differences separately. Retain completed evidence with its
original scope; do not certify it by copying or relabeling it. Keep missing
native evidence pending per tool. Internal tooling is not installed in clients.

Do not build an offline reassessment interface, dependency graph, review workflow,
judge model, evidence database, or new test platform. Review saved artifacts and
record applicability manually. Preserve genuine client adoption/use outcomes.
The earlier [migration assessment](../research/adr-0005-migration-assessment.md)
and [research](../research/cross-tool-validation.md) are background, not additional
acceptance criteria.

## Stories

<a id="select-and-retain-native-checks"></a>

### 1. Run one needed native check without replaying or losing the others

**Status:** In progress. Plan 20 is complete. Plan 22 leaves 1–2 are done.
**Type:** Test tooling.
**Plans:** [20](../quick/020-select-and-retain-native-checks/PLAN.md) then
[22](../quick/022-retain-native-evidence-for-verdicts/PLAN.md).

**Scope:** Keep implemented context selection, retention, execution bounds,
launch-failure handling, and stream completeness. Add one combined native
update→fresh-use journey through each existing delivery wrapper. Use inspected
bootstrap and a real newer tagged fixture, then a fresh session on that updated
target. Keep both stages in one retained attempt. Use the existing
`delivery/updated-use` selector; do not implement separate update/refusal selectors.

**Acceptance:**

- Listing and selection launch only the requested implemented check. Unsupported
  selections fail before setup and remain clearly identified as unavailable.
- Retain candidate, runtime, relevant inputs, raw output/events, responses,
  execution status/reason, and decisive state observations after scratch cleanup.
  Keep failures and earlier attempts; report the result path.
- Keep completed timeout, launch-failure, and stream-completeness checks. Reuse
  shared supervision for delivery; do not repeat its failure matrix per stage.
- Run update then fresh use on the same verified installation, without native
  legacy refusal. Failed update starts no use. Retain each stage's evidence and
  preservation observations; a final payload alone does not prove the transition.
- Prove shared journey behavior once with real local installer fixtures and
  substitutes. Check routing, runtime identity, and stream differences per tool.

**Excluded:** Separate delivery-stage execution, dependency attempt IDs,
automated reassessment/reuse, prompt/assessment repair, native runs, skill or
installer changes, client adoption, and releases.

**Completion:** Plans 20 and 22 pass their cheap checks. Story 3 owns outstanding
native evidence per tool. Completing plan 20 alone does not complete this story.

<a id="trust-native-verdicts"></a>

### 2. Detect native behavior failures instead of rewarding the expected words

**Status:** Planned; scope reduced under ADR 0005.
**Type:** Test migration.
**Dependency:** Story 1's retained context and combined journey evidence.
**Plan:** [21](../quick/021-trust-native-verdicts/PLAN.md), after 20 and 22.

**Scope:** Remove coaching and incidental wording assertions from existing ADR
context and delivery checks. Define shared expectations for clear ADR use,
unresolved authority, legacy refusal, and update followed by fresh use. Keep
small automated activation/state checks; document prose expectations for review
when reliable automation would require a semantic parser.

**Acceptance:**

- Clear/conflicting ADR fixtures receive the same ordinary task request. Update
  and fresh-use prompts do not reveal expected conclusions or facts to repeat.
- Require complete execution, supported activation of the installed copy,
  intended behavior, and observed state for a pass. Self-report, an attempted
  read/call, or a completion marker alone cannot establish activation.
- Preserve exact payload/version and protected-state checks. Keep legacy refusal
  as a shared product check, without a new refusal integration matrix.
- Test shared behavior and counterexamples once. Test only decoding differences
  per tool. Equivalent instruction/response phrasing must not fail incidental
  text assertions; quotations, negations, and contradictory advice cannot pass
  merely by containing expected words.
- Keep definite failures nonpassing and uncertain prose/events inconclusive.
  Record later review with reasons and evidence without overwriting the original
  result. A documented review is sufficient.

**Excluded:** General language grading, per-case/per-tool counterexample
matrices, offline assessment commands, reviewer workflow, runner redesign, new
native mechanisms/cases, skill/installer changes, native runs, and releases.

**Completion:** Plan 21's shared checks and small adapter tests pass. Actual
native evidence remains with Story 3; coached historical results gain no new claim.

<a id="accept-standalone-client-workflow"></a>

### 3. Establish that the standalone client candidate works in all three tools

**Status:** Pending refinement and native acceptance; not selected for execution.
**Type:** Native acceptance.
**Dependencies:** Stories 1–2 and a named candidate from the reconsidered
standalone updater story. Publication and old-plan reconciliation are not prerequisites.

**Scope:** Review prior per-tool evidence first. Select only unresolved checks:
representative installed skill use and a combined update→fresh-use journey on
each tool where applicable proof is missing. Record the integration mechanism
and justify reuse for similar skills. Select additional skill behavior cases only
for unresolved product risks; keep deterministic policy/error variants in CI.
Quick 019 is historical input, not a required scenario list.

**Acceptance:**

- Record native discovery, invocation/application, and intended behavior per
  tool, with installation/update/coexistence where affected. Distinguish explicit
  invocation from automatic application; test the latter only where promised
  and unsupported by applicable evidence.
- Verify a real update and fresh use on the resulting installation, preserving
  unrelated guidance and other tool roots. Local tagged fixtures are sufficient;
  do not publish a release solely to create the transition.
- Review changed ADR behavior and updater decision boundaries against the actual
  candidate. Add clear/conflict, edited-equal, force, or refusal native cases only
  when an unresolved risk requires them, not as a mandatory matrix.
- Save actual outcomes, loading evidence, candidate/runtime, and any review
  judgment. Label reused evidence with its scope and applicability. Keep unknown
  or failed requirements pending. Do not qualify the vendor's general skill system.
- Before release, check that the candidate still matches the relevant tested
  inputs and revalidate only affected requirements. Leave released self-adoption
  and real client work with their product stories.

**Completion:** Resolve each required per-tool claim through evidence or justified
reuse. Qualification covers the chosen mechanisms and behavior only.

| Platform | Integration evidence | Skill behavior evidence |
| --- | --- | --- |
| Codex | Pending applicability review and unresolved representative checks. | Pending candidate-specific review. |
| Cursor | Pending applicability review and unresolved representative checks. | Pending candidate-specific review. |
| Claude Code | Pending applicability review and unresolved representative checks. | Pending candidate-specific review. |

<a id="separate-native-acceptance"></a>

### 4. Reconcile retained plans after reconsidering their stories

**Status:** Deferred until underlying stories are reconsidered.
**Type:** Planning migration.

**Scope:** Reconsider SEED-001 Story 7, SEED-004 Stories 5–8, and SEED-006
Stories 3–4. Retire obsolete plans; update only retained plans. Keep useful client
outcomes and completed evidence. Do not recreate a per-skill integration matrix.
This story does not block Stories 1–3 or the current updates to plans 20, 22, and 21.

**Acceptance:**

- Separate implementation completion from pending native acceptance. Link each
  retained requirement to an acceptance story or applicable reusable evidence.
- Reuse integration proof for the same mechanism and tool. Give different
  mechanisms and unresolved skill behavior their own bounded checks.
- Preserve actual Donut/client adoption and postpublication use. Candidate
  acceptance does not depend on a future released installation.
- Do not credit future extracted guidance with another skill's behavioral proof.
  Keep missing per-tool evidence visible without duplicating acceptance matrices
  in every plan.

**Completion:** Updated retained stories/plans and evidence links. No native run
is required for this planning work.

## Order and completion

Execute **20 → 22 → 21**. Plans 20 and 22 deliver Story 1; plan 21 delivers
Story 2. Plan 20's final checkpoint checks its own completed runner work and
does not wait for plan 22. Preserve plan 22's completed leaf 1.

Refine Story 3 against the actual candidate before native execution. Do Story 4
last after reconsidering its underlying stories. Keep this seed until the scoped
migration and native acceptance work is complete. Research options and removed
plan leaves are not hidden completion requirements.
