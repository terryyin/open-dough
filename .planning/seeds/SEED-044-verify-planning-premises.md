---
id: SEED-044
status: active
planted: 2026-09-26
planted_during: Maintainer review of retrospective finding priorities
trigger_when: A plan's readiness depends on claims about existing code or executable proof
scope: unknown
---

# SEED-044: Start execution from verified planning premises

## Why This Matters

Developers and execution coordinators need a ready plan whose decisive claims
about existing code, fixtures, environment and proof paths hold in the target
project. Discovering an invalid premise during execution causes avoidable scope
changes, failed paid runs, replanning and missing CI evidence. This serves the
low coordination cost and empirical improvement goals of
[ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md).

## Stories

<a id="verify-planning-premises"></a>

### Verify planning premises and proof setup before declaring readiness

**Identity:** SEED-044#verify-planning-premises
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**For / why:** An execution coordinator can rely on the concrete premises that
make the selected plan executable, without rediscovering readily checkable
contradictions after Take.

**Outcome / scope:** Before declaring a plan ready, establish the specific
existing-code claims, fixture and environment prerequisites, and proof paths
that determine whether its promised journey can proceed. Use current project
inspection and the smallest safe observation that resolves each material
uncertainty. A readiness replay covers the relevant promised journey, including
its next operation when that operation depends on the replayed result.

Reuse existing planning, proof ownership and readiness assessment. Inspect why
their current instructions missed these cases before adding more instructions.
Do not introduce a general checklist, new state registry, automatic semantic
validator, routine full-suite run or approval for ordinary inspection. Paid,
credentialed or state-changing observations keep their existing authority
requirements; when unavailable, retain the specific uncertainty instead of
claiming readiness. Planning does not implement the proposed feature.

**Evaluation:** A proposed ready plan names a nonexistent proof selector, an
empty audio fixture, an unavailable workload dataset, or an existing-code
premise contradicted by inspection. Preparation detects the contradiction and
corrects the plan or records the bounded unresolved concern before Take. A
pull-then-publish journey cannot be declared ready from a replay that establishes
only pull. A comparable plan with supported premises proceeds without redundant
inspection or invented gates. Assess actual agent behavior or justified reuse
under [ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md).

**Supporting findings:** [ODF-074](../../docs/maintainer/finding-names.md#odf-074),
[ODF-114](../../docs/maintainer/finding-names.md#odf-114), and
[ODF-110](../../docs/maintainer/finding-names.md#odf-110). They retain distinct
identities and mechanisms. Execution evidence stays in the catalog and source
logs. ODF-115's measurement becoming unrepresentative after implementation is
related but is not automatically addressed by a preparation change.

**Priority rationale:** Repeated failed planning premises and the observed scope
changes and proof gaps outrank the two reports of extra sibling-readiness
reassessment. Work-preservation remains first because recovery and cleanup have
already interfered with another execution's state. Delivered CI corrections
need release or relevant-use assessment rather than duplicate implementation.

**Completion:** Record the actual response, implementation commit, first
containing release and effectiveness limits on each addressed finding. Preserve
any cause or occurrence the response does not address. Queueing is not resolution.

**Depends on:** None; consume the existing planning and readiness contracts.
The structural-format validator and sibling-readiness story are separate.

**Safe stopping point:** Decisive, cheaply checkable contradictions are resolved
before execution while valid plans retain a proportionate path to readiness.
