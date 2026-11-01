# Source review — SEED-208#declare-fixture-defaults-on-fixtures

**Launch:** fresh general-purpose reviewer (no conversation inheritance),
2026-11-01, agent `019102cd-895b-453b-b15d-c86a37dbcd64`.

**Input:** seed section
`.planning/seeds/SEED-208-dashboard-proof-cost.md#declare-fixture-defaults-on-fixtures`
Goal, Scope, key examples, Boundaries only; human amendments: none. Reviewer
read no other project files.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Every dashboard journey that uses a shared start fixture receives that fixture’s project folder and launch wait, whichever spec file a test worker loads first. | slice 1 | observed: `tmp/after-order-cursor/proof.json` and `tmp/after-order-unread/proof.json` (second-file defaults present); `tmp/consumer-suite/proof.json` terminal `strictStatus=passed` / `runnerStatus=passed` selectedCount=107 |
| 2.1 | Apply the codexStart fixture-override fix to `dashboard/tests/support/cursorStart.ts` | slice 1 | observed: `dashboard/tests/support/cursorStart.ts` plain `projectFolders` / `launchTimeoutMs` inside `base.extend`; module-level `test.use` removed |
| 2.2 | Apply the same fix to `dashboard/tests/support/unreadReportPage.ts` | slice 1 | observed: `dashboard/tests/support/unreadReportPage.ts` own `base.extend` with the same defaults; module-level `test.use` removed |
| 3 | Declare those defaults on the fixtures the same way as the codexStart correction (fixture overrides, not module-level `test.use`). | slice 1 | observed: both modules match `support/codexStart.ts` plain-value overrides in `extend` |
| 4 | A spec’s own `test.use` still wins over the shared fixture defaults. | slice 1 | observed: consumer suite includes specs that set their own `projectFolders` (e.g. recently-done / compact) and passed in `tmp/consumer-suite/proof.json` |
| 5 | Change is test support only. | slice 1 | observed: owned diff is only `dashboard/tests/support/cursorStart.ts` and `dashboard/tests/support/unreadReportPage.ts` |
| 6 | Product behavior is unchanged. | slice 1 | observed: no product/src edits; fixture default relocation only |
| E1 | A worker that first loads another `cursorStart` consumer still gives a later Cursor journey file the `open-dough` project folder and launch wait. | slice 1 | observed: `tmp/after-order-cursor/proof.json` (probes A then B both see `["open-dough"]` / launch wait); before: `tmp/order-probe-cursor2/proof.json` B missing defaults |
| E2 | The unread-report journeys keep their folder and 30 s launch wait in any file order. | slice 1 | observed: `tmp/after-order-unread/proof.json` (both probes at defaults including `30_000`); before: `tmp/order-probe-unread/proof.json` B missing defaults |
| X1 | No other fixture redesign. | slice 1 | observed: owned diff moves defaults onto existing fixtures only; no new fixture framework |
| X2 | No change to option values. | slice 1 | observed: values remain `["open-dough"]`, `launchWaitMs` (cursorStart), `30_000` (unreadReportPage) |
