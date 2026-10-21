# Dashboard compile-cache finding

Detailed evidence linked from [ProjectFindings.md](../../ProjectFindings.md#dd-287).
The index owns prioritization; this record retains the occurrence and policy evaluation.

<a id="dd-287"></a>

## DD-287 — A wide dashboard run failed with ENOSPC while `$TMPDIR/node-compile-cache` held 134 GB

### Occurrences

- Execution: `SEED-066#unattached-session-options` / plan 298, first related implementation commit `0601f38b`
  - Timestamp: unknown (2026-10-11, about 15:05+09:00, slice 4 refactor verification)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown
  - Evidence: the refactor return reported `ENOSPC` at about test 678 of 801 with 132 MiB free; `du` showed `node-compile-cache` at 134,421 MB, of it 120,374 MB and 244,880 files under `v24.21.0-arm64-…` and 14,045 MB under `v24.5.0-…`; after deleting entries older than three hours, 37,531 MB remained and 98 GiB were free.
  - Observed effect: one 15-minute wide run was lost and rerun; the refactor pass could not report completion until the coordinator cleared the cache.
  - Inference: qualified. About 37 GB was written within three hours while this execution and other sessions ran dashboard suites, yet one measured wide run afterwards added about 1 GiB; which runs write the bulk is not established. Scratch fixture projects under new temp paths would give each run new cache keys.

### Suite-policy evaluation (2026-10-12)

The suite sets `NODE_DISABLE_COMPILE_CACHE=1` in
`dashboard/playwright.config.ts` before setup/workers launch descendants.
It allocates no cache and deletes no shared entries. `compile-cache.spec.ts`
uses fresh module paths and real enable/import/flush attempts; removing the
policy in an isolated checkout makes its first no-growth comparison fail.
Supported Node versions without that API skip only the cache probe.

Measurements used macOS, Node v24.21.0, npm 11.19.0, locked Vite 8.3.0,
owned short `/tmp/dcc-*` roots, and removed inherited color/cache/deadline/split
variables. The preparation baseline was revision `326ba973`; the implemented
candidate was based on `48ccb616`. Runs kept the strict reporter and zero
retries. Focused proof selected `production-deployment.spec.ts --grep
'deployment installs'` or `authenticated-project-overview.spec.ts`, with one
worker; the full run kept the local default of eight workers on sixteen cores.

| Observation | Seconds | Persistent cache change | Verdict |
| --- | ---: | --- | --- |
| Baseline fresh deployment, first/second | 8.413 / 8.106 | +10,784,756 / +8,054,940 bytes | Pass / pass |
| Implemented fresh deployment, first/second npm | 8.355 / 7.888 | 0 files / bytes; existing hashes unchanged | Pass / pass |
| Implemented fresh deployment, direct config entry | 9.145 | 0 files / bytes; existing hashes unchanged | Pass |
| Baseline / implemented dev and preview journeys | 10.022 / 11.544 | Baseline wrote 10,475,684 bytes; candidate added none | Pass / pass |
| Two overlapping fresh deployments | 19.940 / 19.577 | Each preserved its own 94-file cache and sentinel | Pass / pass |
| Full strict suite, 1,551 tests selected in 484 files | 750.830 | 94 files / 306,427 bytes before and after; all hashes unchanged | Pass |

The configured runner retained a controlled child's failure (exit 17,
runner 1) and a SIGTERM verdict after explicit cache attempts/flush, followed
by a successful run. All three preserved seeded explicit-cache hashes; their
default cache directory remained absent. The dashboard typecheck passed.

A first fresh npm caller launch added 93 files / 306,396 bytes before config
loading, all containing paths to global npm startup modules. Later observations
warmed that caller separately and preserved its entries plus the sentinel;
fresh installed fixture paths and explicit-enable probes still added nothing.
This boundary does not change Node/npm caller startup caching or ordinary
commands outside tests. Existing shared cache is neither migrated nor reclaimed,
and a hard kill retains existing non-cache cleanup limitations.

Deployment timings were comparable to the small baseline sample; the page
sample was 1.522 seconds slower. Shared-machine samples and an unpaired full
run establish no stable speedup or suite-wide timing penalty. Fresh fixture
cache growth is prevented in these observations; the source of the historical
134 GB remains unknown.
