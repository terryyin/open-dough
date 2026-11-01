# Declare dashboard fixture defaults on their fixtures

**Identity:** SEED-208#declare-fixture-defaults-on-fixtures
**Source:** [correction story](../../seeds/SEED-208-dashboard-proof-cost.md#declare-fixture-defaults-on-fixtures).

## Goal and scope

Replace the module-level `test.use({ projectFolders: ["open-dough"],
launchTimeoutMs: … })` in `dashboard/tests/support/cursorStart.ts:81` and
`dashboard/tests/support/unreadReportPage.ts:16` with defaults declared on the
fixture itself, as `support/codexStart.ts` now does (plain-value overrides
inside `base.extend`; the `[value, { option: true }]` form fails typecheck for
an inherited option). Spec-level `test.use` keeps precedence. Provenance:
plan 432 slice 9 Result and obligation G2 (removed with that plan at wrap-up;
recover from its last commit `b6a767ce`).

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
Status: planned
Proof: For each module, first reproduce the order dependence at `--workers=1`
with a non-option-setting consumer loaded first followed by a consumer that
relies on the default (record the failing or the observed missing default; if
no current consumer relies on it, record that and observe the option value
instead). After the change the same order passes, and all consumers of both
modules (consumer trace) pass strict at default workers;
`npm run typecheck:dashboard` clean.

## Current decisions and stopping points

- Values stay `["open-dough"]` and the existing launch waits.
- Stop for human judgment if a consumer turns out to need the first-file-only
  behavior.
