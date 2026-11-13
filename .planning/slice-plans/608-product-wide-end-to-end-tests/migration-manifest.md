# Migration manifest

Execution evidence for [PLAN.md](PLAN.md) (5a.1–5a.3): what the old dashboard
runner discovered, how CI dealt and published it, and where each spec, case
and registering module goes. Later slices reconcile against it.

## Files

| File | Content |
| --- | --- |
| `migration-manifest.jsonl` | One JSON record per line: one `inputs` record, then one `spec` record per selected spec and one `case` record per declared case, at the base revision |
| `migration-moves.json` | Old path → `{ to, slice }` for every moved spec and registering module (paths relative to `dashboard/`) |
| `migration-case-moves.json` | `{ spec, source?, title, to, toSource?, slice }` for each case that left a spec that stayed: its new spec, and its new source when that is a moved module |
| `migration-classification.json` | Integrated spec → purpose note, for each spec read and left for a later slice |
| `migration-added.json` | New proof cases a slice wrote (not migrated), with what each proves |
| `migration-reconciliation-slice-<n>.json` | Slice n's native lists checked against the manifest |
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

`destination` is the moved path, the unchanged path for specs already under
`frontend-tests/` or `backend-tests/`, `pending: slice 3 — <purpose note>`
for an integrated spec read and left for slice 3, or `pending: slice 2/3
inventory` for one not yet read. A case moved out of a spec that stayed
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
node .planning/slice-plans/608-product-wide-end-to-end-tests/migration-reconcile.mjs \
  --manifest .planning/slice-plans/608-product-wide-end-to-end-tests/migration-manifest.jsonl \
  --moves .planning/slice-plans/608-product-wide-end-to-end-tests/migration-moves.json \
  --case-moves .planning/slice-plans/608-product-wide-end-to-end-tests/migration-case-moves.json \
  --after after-list.json --frontend frontend-list.json --backend backend-list.json \
  --added .planning/slice-plans/608-product-wide-end-to-end-tests/migration-added.json \
  --after-out .planning/slice-plans/608-product-wide-end-to-end-tests/migration-reconciliation-slice-2.json
```

It exits 1 unless every base case is selected exactly once at its destination,
no case appears beyond those and the listed new proof cases, and each focused
runner selects exactly the umbrella's cases under its root. Slice 1 ran the
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
