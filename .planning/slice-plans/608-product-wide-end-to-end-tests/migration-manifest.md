# Migration manifest

Execution evidence for [PLAN.md](PLAN.md) (5a.1–5a.3): what the old dashboard
runner discovered, how CI dealt and published it, and where each spec, case
and registering module goes. Later slices reconcile against it.

## Files

| File | Content |
| --- | --- |
| `migration-manifest.jsonl` | One JSON record per line: one `inputs` record, then one `spec` record per selected spec and one `case` record per declared case, at the base revision |
| `migration-moves.json` | Old path → `{ to, slice }` for every moved spec and registering module (paths relative to `dashboard/`) |
| `migration-case-moves.json` | `{ spec, source?, title, to, toSource?, toTitle?, slice }` for each case that left a spec that stayed: its new spec, and its new source when that is a moved module; `toTitle` for a case a slice renamed in place |
| `migration-classification.json` | Integrated spec → proof-purpose class and note, for each spec left in `tests/` for a later conversion |
| `migration-purpose.json` | Slice 3's reading of all 566 integrated specs: class (`e2e`, `frontend`, `split`, `backend`), purpose, real integrations, simulated boundaries, conversion effort, per-case split, redundancy candidates and destination |
| `migration-conversion-batches.json` | The 264 specs left in `tests/`, grouped into proposed conversion batches by the controlled answers each batch needs, with class, effort and per-case split |
| `migration-added.json` | New proof cases a slice wrote (not migrated), with what each proves |
| `migration-reconciliation-slice-<n>.json` | Slice n's native lists checked against the manifest |
| `migration-duration-rows.json` | Slice 4: every row of the former `dashboard/longest-first` parts, its seconds and the group list and label it moved to (`to: null` when its spec no longer exists) |
| `migration-manifest.mjs`, `migration-reconcile.mjs` | The generator and the reconciler; `migration-cases.mjs` holds what they share, including each record's destination |

## Records

- `inputs`: base revision, the native list command, spec/case totals by root,
  the 17 registering modules, shard count, `dashboard/longest-first` and its
  parts, and the CI proof inputs read from `.github/workflows/ci.yml`
  (dashboard `entries`, `report-format`, summary `expect`, `frontend-entry`,
  and the `dashboard-times-<shard>`, `dashboard-playwright-report-<shard>` and
  `frontend-test-proof-attempt-<attempt>` artifacts).
- `spec`: `spec` (enclosing file, the shard/timing identity), `shard` (its
  `OPEN_DOUGH_DASHBOARD_SPLIT=i/13` deal at base), `seconds` and `timingPart`
  (its `longest-first` row; absent when unrecorded), `cases`,
  `registeringSources` (other modules declaring its cases), `boundary`,
  `destination` and `slice`.
- `case`: `spec`, `source` (declared `test.location` file, only when another
  module registers it), `line`, `title` (describe › title, the behavior
  identity), `project` (only when not `chromium`), and `destination` (only
  when it differs from its spec's).

`boundary` is derived from the imports of the spec and its registering modules,
so it is a pointer for review, not a reading of the spec: `integrated: …` names
the real dashboard server, Git origin with synthetic GitHub, synthetic agent
hosts or production-watcher deployments it starts; `frontend: …` names
production components or the built app with controlled answers, or DOM content;
`harness: inner Playwright run`; `unclassified` means its fixture module was
not recognized and the spec must be read.

`destination` is the moved path (`../e2e/<path>` for E2E Test, relative to
`dashboard/`), the unchanged path for specs already under `frontend-tests/`
or `backend-tests/`, or `pending: <class> (<effort> conversion): <purpose>`
for an integrated spec read and left in `tests/` for a later conversion. A case moved out of a spec that stayed
carries its new spec as its own `destination`.

## Commands

At the base checkout (`a9ddb54a786d7d64d2bf63500f93cec1c9c5952d`):

```sh
npm run test:dashboard -- --list --reporter=json > base-list.json
node .planning/slice-plans/608-product-wide-end-to-end-tests/migration-manifest.mjs \
  --list base-list.json --revision a9ddb54a786d7d64d2bf63500f93cec1c9c5952d \
  --moves .planning/slice-plans/608-product-wide-end-to-end-tests/migration-moves.json \
  --case-moves .planning/slice-plans/608-product-wide-end-to-end-tests/migration-case-moves.json \
  --classes .planning/slice-plans/608-product-wide-end-to-end-tests/migration-classification.json \
  --out .planning/slice-plans/608-product-wide-end-to-end-tests/migration-manifest.jsonl
```

Regenerating from a detached base worktree gave a byte-identical manifest;
with slice 1's moves alone the current generator still writes slice 1's
manifest byte for byte. Slice 2's regeneration changed only `destination`
(and `slice`) fields: 573 spec records and the 29 moved case records.
After a migration edit:

```sh
npm run test:dashboard -- --list --reporter=json > after-list.json
npm run test:dashboard:frontend -- --list --reporter=json > frontend-list.json
npm run test:dashboard:backend -- --list --reporter=json > backend-list.json
npm run test:e2e -- --list --reporter=json > e2e-list.json
node .planning/slice-plans/608-product-wide-end-to-end-tests/migration-reconcile.mjs \
  --manifest .planning/slice-plans/608-product-wide-end-to-end-tests/migration-manifest.jsonl \
  --moves .planning/slice-plans/608-product-wide-end-to-end-tests/migration-moves.json \
  --case-moves .planning/slice-plans/608-product-wide-end-to-end-tests/migration-case-moves.json \
  --after after-list.json --frontend frontend-list.json --backend backend-list.json \
  --e2e e2e-list.json \
  --added .planning/slice-plans/608-product-wide-end-to-end-tests/migration-added.json \
  --after-out .planning/slice-plans/608-product-wide-end-to-end-tests/migration-reconciliation-slice-3.json
```

It exits 1 unless every base case is selected exactly once at its destination,
no case appears beyond those and the listed new proof cases, and each focused
runner selects exactly the umbrella's cases under its root. From slice 4,
with the umbrella retired, the four groups' own lists are the selection and
every selected spec must fall in exactly one CI shard of its own group:

```sh
npm run test:e2e -- --list --reporter=json > e2e-list.json
npm run test:dashboard:integrated -- --list --reporter=json > integrated-list.json
npm run test:dashboard:frontend -- --list --reporter=json > frontend-list.json
npm run test:dashboard:backend -- --list --reporter=json > backend-list.json
node .planning/slice-plans/608-product-wide-end-to-end-tests/migration-reconcile.mjs \
  --manifest .planning/slice-plans/608-product-wide-end-to-end-tests/migration-manifest.jsonl \
  --moves .planning/slice-plans/608-product-wide-end-to-end-tests/migration-moves.json \
  --case-moves .planning/slice-plans/608-product-wide-end-to-end-tests/migration-case-moves.json \
  --integrated integrated-list.json --frontend frontend-list.json \
  --backend backend-list.json --e2e e2e-list.json \
  --added .planning/slice-plans/608-product-wide-end-to-end-tests/migration-added.json \
  --after-out .planning/slice-plans/608-product-wide-end-to-end-tests/migration-reconciliation-slice-4.json
``` Slice 1 ran the
same check from `migration-manifest.mjs` before the reconciler had its own
file.

## Totals

| | Specs | Cases (by declared source root) |
| --- | --- | --- |
| Base | 1,015: 598 `tests`, 27 `frontend-tests`, 390 `backend-tests` | 2,717: 1,319 / 55 / 1,343 |
| After slice 1, umbrella | 1,015: 573 / 52 / 390 | 2,722: 1,221 / 153 / 1,348 (all 2,717 base cases once, plus 5 new backend lifecycle proofs) |
| After slice 1, `test:dashboard:frontend` | 52 | 153, all `chromium` |
| After slice 2, umbrella | 1,032: 566 / 52 / 414 | 2,727: 1,175 / 153 / 1,399 (all 2,717 base cases once, plus 10 new lifecycle proofs) |
| After slice 2, `test:dashboard:backend` | 414 | 1,399, all `chromium` |
| After slice 3, umbrella | 1,032: 264 `tests` / 52 / 415 / 301 `e2e` | 2,731: 611 / 153 / 1,407 / 560 (all 2,717 base cases once, plus 14 new proof cases) |
| After slice 3, `test:e2e` | 301 | 560: `chromium-deployments` for the three production chains, `chromium` for the rest |
| After slice 3, `test:dashboard:backend` / `:frontend` | 415 / 52 | 1,407 / 153 |
| After slice 4, the four groups (no umbrella) | 1,033: 264 / 52 / 415 / 302 | 2,735: 611 / 153 / 1,411 / 560 (all 2,717 base cases once, plus 18 new proof cases) |
| After slice 4, `test:e2e` / `:integrated` / `:frontend` / `:backend` | 302 / 264 / 52 / 415 | 560 (`chromium-deployments` + `chromium`) / 611 / 153 / 1,411, each one `chromium` project otherwise |

Slice 1 moved 25 mounted-comparison presentation specs (98 cases) and the five
`mountedComparison*Cases.ts` registering modules to `frontend-tests/intent/`;
24 of their 25 timing rows moved with them in `longest-first-additions`
(`intent-ci-cues-dark-contrast.spec.ts` was unrecorded at base). Totals and
reconciliation find loss or double selection; the moved cases' behavior is
proved by running them, under both runners.

Slice 2 moved 46 base cases to `backend-tests/`: seven whole specs (four test
runtime contracts to `runtime/`, three browser-free session specs to
`sessions/`, 17 cases), the `feedbackMaintenanceLaunchEligibilityCases.ts`
module, and 29 server-boundary cases split from 17 integrated specs that keep
their page cases (`migration-case-moves.json`). Whole-spec timing rows were
relabelled in place; split specs keep their rows and their new backend specs
are unrecorded until a refresh. It read every case of the 573 integrated specs
for a page and recorded the 566 left in `tests/` in
`migration-classification.json`: 546 open a page in every case, 17 are
browser journeys whose server cases moved, and 3 are serial production-watcher
chains whose no-page steps stay with the chain.

Slice 3 read all 566 remaining integrated specs (`migration-purpose.json`):
301 workflows, 204 detailed UI checks, 59 mixed specs (both kinds of case)
and two backend specs: a server boundary spec
(`intent/intent-ci-status-read-boundary`, a page used only as a fetch origin)
and a harness check. It moved the 301 workflows, with their four
registering modules and three chain-only helpers, to the repository's
`e2e/` (`../e2e/<path>` in `migration-moves.json`), and the harness check
`observation/first-open-waits-for-read` to `backend-tests/runtime/`. Timing
rows were relabelled in place to `../e2e/<path>`; the deal's predicted share
totals are unchanged, while bytewise tie order moved 499 specs to another
shard. The 204 detailed UI specs, the 59 mixed specs and the boundary spec
remain in `tests/` for conversion with controlled answers
(`migration-classification.json`).

Slice 4 retired the umbrella (`test:dashboard`, `dashboard/playwright.config.ts`)
and ran each group under its own configuration and CI producer, the interim
**Dashboard Integrated UI Test** (`npm run test:dashboard:integrated`) owning
the 264 specs left in `tests/`. Each group deals its specs by its own duration
list: the 960 rows of the former `dashboard/longest-first` parts went, seconds
unchanged, to `e2e/longest-first` (292, relabelled from `../e2e/<path>` to
`<path>`), `dashboard/integrated.longest-first` (255),
`dashboard/frontend.longest-first` (38) and `dashboard/backend.longest-first`
(374) (`migration-duration-rows.json`). Three rows still named the integrated
paths of `intent-scope-timing-history-{segments,units,reading}`, moved to
`frontend-tests/` before this story, and now time those specs; one row timed
`tests/sessions/agent-completion-recovery.spec.ts`, deleted on 2026-11-11
(8e93b1d24) before this story, and has no spec to time. The lifecycle case of
`backend-tests/observation/run-processes.spec.ts` that swept the umbrella's
setup now sweeps the integrated group's and is renamed
(`migration-case-moves.json`, `toTitle`); `runner-ownership.spec.ts` adds
the integrated runner's two invocation cases and drops the umbrella from its
concurrent-run case, and `ci-time-without-runner-waits.spec.ts` adds two
cases for reading reusable-workflow caller jobs and this repository's own
workflow (`migration-added.json`). CI shard counts (6 / 5 / 1 / 4)
were sized from each group's membership and the per-spec seconds of the last
thirteen-shard run (43374366861); `migration-reconciliation-slice-4.json`
records each group's shard membership.
