# Prove each adapter proof reason below the E2E journey

**Identity:** SEED-413#hold-adapter-proof-reasons-in-default-timeout
**Source:** [Prove each adapter proof reason below the E2E journey](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#hold-adapter-proof-reasons-in-default-timeout)

## Goal and scope

The adapter proof reasons journey gives the same verdict under the usual local
load as in hosted CI. Each adapter proof reason keeps its exact line at the
Dashboard proof-read boundary. The journey keeps one representative reason
workflow in the Intent tab within the default timeout. The spec's other two
cases and the reason wording stay unchanged.

## Current decisions

- `e2e/intent/intent-ci-proof-adapter-reasons.spec.ts:43` runs eight UI
  rounds, one per adapter answer. Each reason line is a pure mapping from
  `dashboard/server/ciAdapterProof.ts` through `adapterUnavailableLine` in
  `dashboard/src/ciProofAbsenceWording.ts`.
  `Distribution/tests/support/dashboard-ci-adapter-proof.test.mjs` already
  proves full lines at that boundary, and its header sends "every other
  reason" to this E2E case. Move the per-answer lines to that support test.
  Keep the E2E rounds that need the tab: neutral reason border, oversized
  problem border, unchanged verdict and attempt with no proof rows, and Check
  again rereading discover and proof.
- Follow [Plain Vitest for unit tests; Playwright only for E2E](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e)
  and [Make production code directly testable instead of growing test support](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support).
  Apply [Dough MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) to the
  support test and [Dough Page Objects](../../../.agents/skills/dough-page-objects/SKILL.md)
  to the E2E spec. Keep the default test timeout; never use `test.slow()`.

## Decisive premises

| Consuming operation | Observation and result |
| --- | --- |
| The reasons journey under local load | During plan 793 at `4cc546a9c` plus slice 4's change, at load average about 50, the eight-round case timed out twice after every assertion passed: 33.7 s and 39.7 s against 30 s. The test-scoped Dashboard fixture used about 26 s before the browser launched. It passed in 11.2 s at load 25. The sibling cases took 15–18 s at load about 50. |

## Slices

### 1. Each adapter proof reason is proved at the proof-read boundary

Type: Structure
Status: planned

Add the moved reason lines to the support test first, then narrow the E2E
case to the tab-dependent rounds and update both headers.

**Proof.** Before narrowing, a scratch change to each moved reason's wording
fails its new support case; revert it. The support test passes with every
moved line. The narrowed spec passes beside its sibling cases, compared
relatively under comparable load. Run `npm run typecheck:dashboard` if
Dashboard types change.

## Verification and delivery

- Use the [macOS sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
  Follow the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
- Run the focused gates above through their maintained runners, apply the
  normal post-change refactor, and use the commit and publication gates.
