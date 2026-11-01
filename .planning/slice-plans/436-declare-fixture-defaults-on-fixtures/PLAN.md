# Declare dashboard fixture defaults on their fixtures

**Identity:** SEED-208#declare-fixture-defaults-on-fixtures
**Source:** [correction story](../../seeds/SEED-208-dashboard-proof-cost.md#declare-fixture-defaults-on-fixtures).
**Source review:** [source-review.md](./source-review.md)

## Goal and scope

Replace the module-level `test.use({ projectFolders: ["open-dough"],
launchTimeoutMs: … })` in `dashboard/tests/support/cursorStart.ts:81` and
`dashboard/tests/support/unreadReportPage.ts:16` with defaults declared on the
fixture itself, as `support/codexStart.ts` now does (plain-value overrides
inside `base.extend`; the `[value, { option: true }]` form fails typecheck for
an inherited option). Spec-level `test.use` keeps precedence. Provenance:
plan 432 slice 9 Result and obligation G2, recoverable at
`40e1d2f9:.planning/slice-plans/432-reduce-dashboard-proof-cost/PLAN.md`.

## Existing solutions and constraints

- `support/codexStart.ts` at `b6a767ce` is the reference shape.
- `unreadReportPage.ts` re-exports `startOriginTest.ts`'s `test`; give it its
  own `test.extend` with the overrides and keep the export name, so its
  consumers do not change, or confirm with the consumer trace that a narrower
  change suffices.
- Follow `dashboard/tests/README.md`; no new fixture framework.

## Ordered slices

### 1. Fixture defaults reach every consumer in any file order
Type: Structure
Status: done
Proof: Accepted. Before: option-value probes at `--workers=1` showed second-file
`projectFolders`/`launchTimeoutMs` missing
(`tmp/order-probe-cursor2/proof.json`, `tmp/order-probe-unread/proof.json`).
After: same probes keep defaults
(`tmp/after-order-cursor/proof.json`, `tmp/after-order-unread/proof.json`).
Consumer suite of 47 specs / 107 tests:
`tmp/consumer-suite/proof.json` terminal `strictStatus=passed`,
`runnerStatus=passed`. `npm run typecheck:dashboard` clean (post-refactor
`tmp/refactor-typecheck-dashboard.log`). Source review commitments 1–6, E1–E2,
X1–X2 observed in `source-review.md`.

## Current decisions and stopping points

- Values stay `["open-dough"]` and the existing launch waits (`launchWaitMs`,
  which is `30_000`).
- Stop for human judgment if a consumer turns out to need the first-file-only
  behavior.
- Failing and flaky tests follow
  [AGENTS.md § Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests).
- The broader consumer run is required because both changed fixtures are
  loaded by many distributed spec files (57 importers found by the 2026-11-01
  trace of `cursorStart`/`unreadReportPage` imports).
- Learning: module-level `test.use` binds only to the first file that evaluates
  the module in a worker; second-file journeys may still pass when they do not
  need that option, so option-value probes are the reliable order-dependence
  signal. Post-change refactor shares `launchWaitMs` on `unreadReportPage`
  with the sibling start fixtures.

## Plan review

Slice-plan refinement was not needed: one cohesive Structure slice with its
own proof and no boundary, sizing, or design concern. No slice-specific
concern remains. Premises observed on 2026-11-01 in this workspace:
`cursorStart.ts:81` and `unreadReportPage.ts:16` still hold the module-level
`test.use`; `unreadReportPage.ts` re-exports `startOriginTest.ts`'s `test`;
`workingCursorTest` and `deploymentCursorTest` derive from `cursorStart`'s
`test`, so fixture-level defaults reach them; the `codexStart.ts` reference
shape exists. The file-order failure itself is reproduced as the slice's
first proof step.
