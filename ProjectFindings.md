# Open Dough Project Findings

Project-owned retrospective findings: problems in how this repository builds,
tests, and proves Open Dough, rather than in the published Open Dough skills or
their release payload. General execution lessons and published-skill defects
remain in [DearDough.md](DearDough.md), which also keeps local-number
allocation (DD-NNN) and removed-finding recovery references. An occurrence in
this repository alone does not make a cause project-specific. Original finding
codes and occurrence evidence are retained.

Reviewed on 2026-10-12 against `11d48b956607e3485f5771c59509b111be3626b8`.
Frequency counts distinct executions, not commands, retries, or repairs.
Grouping related symptoms does not establish a shared cause or duplicate an
execution. A repaired individual race does not resolve every suite failure.

## Priority assessment

1. **Proof-selection visibility — opt-in verified locally.** [DD-216/DD-243](#dd-216)
   repeats across five executions (plans 217, 261, 263, 264, 297), costing
   extra listings or reruns. [Read a dashboard proof selection without rerunning it or weakening its verdict](.planning/seeds/SEED-131-repository-test-feedback.md#retain-strict-proof-selection)
   now has same-run selection/attempt evidence through the configured strict
   reporter: the observed focused run selected and passed 24 tests in 21.999
   seconds, retained its JSON record, and removed its passing output directory.
   Choosing a fresh path and reading it remain manual. The general acceptance mistake of overriding that policy remains
   DD-262 in DearDough.md; it is not another project occurrence.
2. **Browser journey stability — open, unqueued.** [DD-278](#dd-278)
   records three CI failures across two executions. Both concrete spec families
   were repaired; plan 293 ran a branch predating the repair, so it is not
   recurrence after the fix. Shared interaction helpers still allow a click
   before all page reads settle. Retain that qualified residual, not a claim
   that the repaired specs still fail.
3. **Suite timing and diagnosis — open, unqueued.** [DD-279](#dd-279)
   records two shard deadlines in one execution; a refreshed duration list and
   twelve shares repair those runs, while duration ordering still ages without
   a refresh step. [DD-275](#dd-275) records one separate execution whose
   within-run load was unobserved. These are related diagnostic/margin concerns,
   not one demonstrated cause. The repaired individual timeout DD-280 and
   shell budget breach DD-283 are removed below.
4. **Shell observation reliability — open, unqueued.** [DD-187](#dd-187)
   records one Linux SIGPIPE repair cycle. The named observer was fixed;
   early-exit pipelines remain in two repository test helpers. Those are
   residual risks, not additional observed failures.
5. **Paid native-run permission handoff — low, unqueued.** [DD-161](#dd-161)
   records one execution's two permission round trips. The boundary is the
   host's; no change to released Open Dough behavior is justified by it.

The descendant cache policy and opt-in selection evidence are implemented and
measured below. The selection record helps parallel contributors obtain reliable local
proof. Neither changes published skills, shared workflow rules, or the
dashboard's runtime contract. The existing native-observation queue item and
Taken CI-monitoring story stay unchanged. Earlier suite repairs remain completed;
new or residual causes above are not evidence that every earlier fix failed.

## Dashboard specs can lose a mouse press to a reflow (open, unqueued)

<a id="dd-278"></a>

### DD-278 — Two dashboard specs lost a mouse press to a reflow between press and release, on two CI runs in one day

[Retained findings, follow-up and occurrence evidence](docs/maintainer/project-test-findings.md#dd-278).

## Dashboard shards run at their time ceiling (open, unqueued)

<a id="dd-279"></a>

### DD-279 — A dashboard shard reached its 320-second deadline after one spec file was added

[Retained findings, follow-up and occurrence evidence](docs/maintainer/project-test-findings.md#dd-279).

## Quiet passing checks obscure the selected proof (opt-in verified locally)

<a id="dd-216"></a>

### DD-216 — Literal proof commands printed no pass counts, so agents reran passing suites

[Retained findings, follow-up and occurrence evidence](docs/maintainer/project-test-findings.md#dd-216).

**Observed outcome (2026-10-12):** The opt-in
`OPEN_DOUGH_DASHBOARD_PROOF_RECORD` path retained the actual selection, attempts
and strict verdict of one 24-test focused invocation without a counting rerun.
The full reporter/capability proof passed in 21.999 seconds; the reporter stayed
silent and its passing output directory was absent. Normal npm and direct
config entry from another directory also retained their own outer selection
across nested runs. [Usage and evidence interpretation](dashboard/tests/README.md)
cover the remaining cost: supply an unused path before invocation, retain it,
then read it alongside the strict command exit. Opt-out runs still have no count
record. This verifies the repository tooling response, not universal adoption
or a change to published proof-acceptance guidance.

<a id="dd-243"></a>

DD-243 remains the same finding; its later occurrences are
[retained with DD-216](docs/maintainer/project-test-findings.md#dd-243).

## Shell observations can invert a result on Linux (open, unqueued)

<a id="dd-187"></a>

### DD-187 — A `git log | grep -q` observation under `pipefail` flipped on CI when git lost the race to SIGPIPE

[Retained findings, follow-up and occurrence evidence](docs/maintainer/project-test-findings.md#dd-187).

## Paid native-run permission handoff (low priority, unqueued)

<a id="dd-161"></a>

### DD-161 — The developer's approval of paid runs did not let the coordinator start them

[Retained findings, follow-up and occurrence evidence](docs/maintainer/project-test-findings.md#dd-161).

<a id="nodes-compile-cache-fills-the-disk-under-the-dashboard-suite-queued-not-resolved"></a>

## Node's compile-cache growth under the dashboard suite (descendant policy verified)

**Outcome:** Implemented and measured below. The [test configuration](dashboard/playwright.config.ts)
prevents descendant writes without reclaiming existing shared cache; the
[tests guide](dashboard/tests/README.md) describes the policy. The source of the
historical 134 GB remains unknown.

<a id="dd-287"></a>

### DD-287 — A wide dashboard run failed with ENOSPC while `$TMPDIR/node-compile-cache` held 134 GB

#### Occurrences

- Execution: `SEED-066#unattached-session-options` / plan 298, first related implementation commit `0601f38b`
  - Timestamp: unknown (2026-10-11, about 15:05+09:00, slice 4 refactor verification)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown
  - Evidence: the refactor return reported `ENOSPC` at about test 678 of 801 with 132 MiB free; `du` showed `node-compile-cache` at 134,421 MB, of it 120,374 MB and 244,880 files under `v24.21.0-arm64-…` and 14,045 MB under `v24.5.0-…`; after deleting entries older than three hours, 37,531 MB remained and 98 GiB were free.
  - Observed effect: one 15-minute wide run was lost and rerun; the refactor pass could not report completion until the coordinator cleared the cache.
  - Inference: qualified. About 37 GB was written within three hours while this execution and other sessions ran dashboard suites, yet one measured wide run afterwards added about 1 GiB; which runs write the bulk is not established. Scratch fixture projects under new temp paths would give each run new cache keys.

#### Suite-policy evaluation (2026-10-12)

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

## Loaded-suite evidence lacks within-run load (open, unqueued)

<a id="dd-275"></a>

### DD-275 — Acceptance runs recorded machine load only at their start and end, so a failure could not be placed against the story's load bound

[Retained findings, follow-up and occurrence evidence](docs/maintainer/project-test-findings.md#dd-275).

## Review and recovery

[Classification, repaired findings and source recovery](docs/maintainer/project-findings-history.md#review-and-recovery)
remain available in the history record, with the original evidence and dates.

<a id="dd-171"></a>

DD-171's delivered commit-hook typecheck and red/green evidence are
[retained in the review history](docs/maintainer/project-findings-history.md#dd-171).

### Earlier reviews

[Earlier classification and resolution reviews](docs/maintainer/project-findings-history.md#earlier-reviews).

### Earlier moves

[Earlier moves and their Git recovery references](docs/maintainer/project-findings-history.md#earlier-moves).
