---
id: SEED-124
status: active
planted: 2026-10-09
planted_during: Terry's review of project-specific retrospective findings and priority selection
trigger_when: A shared JavaScript test fixture change passes its Node proof but breaks the dashboard's inferred TypeScript consumer
scope: story
---

# SEED-124: Local checks cover the dashboard's shared fixture imports

## Why This Matters

Open Dough maintainers change JavaScript fixtures that the dashboard's
TypeScript journeys import. Focused Node proof twice passed while those
imports failed only in the dashboard CI job, causing a repair cycle after
publication. A repository-local check should expose that consumer failure
before the change leaves the checkout.

## Story

<a id="check-dashboard-fixture-consumers-locally"></a>

### Catch shared fixture signature breaks in the dashboard's local checks

**Identity:** SEED-124#check-dashboard-fixture-consumers-locally
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary:** An Open Dough maintainer or agent changing shared JavaScript
test fixtures consumed by dashboard TypeScript tests.

**Outcome:** The repository's normal local validation for an affected fixture
change runs the dashboard typecheck and reports an incompatible inferred
signature before commit/publication. A green focused Node run alone cannot
establish this repository's fixture-consumer compatibility.

**Scope:** Connect the existing `npm run typecheck:dashboard` to the local
check path for shared fixture changes, with an actionable failure and a
documented focused command. Refinement chooses the smallest appropriate
integration with the repository's runner or check-only commit gate. Preserve
the existing lint gate and test coverage; do not add unrelated whole-suite
runs to every change.

**Evaluation:** A temporary required-looking parameter in `landWorktree`,
omitted by `dashboard/tests/preparingJourney.ts`, can pass the fixture's Node
checks but must fail the affected local validation with the dashboard's
TS2345 diagnostic. Restoring the compatible signature passes the same local
validation and CI's dashboard typecheck. Demonstrate both the new check's
failure and its successful corrected path, without publishing the temporary
break. Confirm the documented local route actually invokes the consumer
check rather than relying on the maintainer to remember a separate command.

**Evidence:** [DD-171](../../ProjectFindings.md#dd-171) records two distinct
executions (plans 146 and 191). Repairs `de81cb96` and `716c933b` fixed the
individual signatures; the missing local consumer gate remains. The generic
proof-selection issue is separately retained as ODF-150 in DearDough.md.

**Project boundary:** This story changes Open Dough's repository test tooling
and test documentation. It changes no published skill or rule, installer
payload declaration, or generic guidance about consumer proof. A JavaScript
fixture living under `src/skills` does not make the dashboard's local
TypeScript-check wiring a published-runtime defect.

**Completion criterion:** Record the delivered check, implementation revision,
and red/green consumer evidence against DD-171 in ProjectFindings.md. Remove
the active finding only after that evidence confirms the local gate covers
the recurring mechanism; queued work and repaired individual signatures do
not establish resolution.

**Dependencies:** No blocking story prerequisite. The loaded-suite story
owns Playwright interference, not this typecheck gate.

## Breadcrumbs

- [Project retrospective findings](../../ProjectFindings.md#dd-171).
- [Product backlog](../PRODUCT-BACKLOG.md).
- [Repository tests](../../tests/README.md),
  [native setup](../../tests/native-setup.md), and
  [dashboard test configuration](../../dashboard/tsconfig.node.json).
