# Dashboard test names and timing breakdown

These measurements are retained local strict runs with one worker. CI selects
the maintained tests across 13 shards; CI elapsed time is a different measure.
No new timing run was needed for this naming and reporting change.

## Clear names and CI scope

| Name used here | CI selection | Meaning |
| --- | --- | --- |
| CI watcher and pinned-deployment selection | Yes | Existing watcher failure/update tests, pinned-deployment case and three real-Git update-selection cases. |
| Local preview lifecycle experiment | No | Archived six-case experiment over two genuinely built outputs. |
| Local watcher and preview reuse experiment | No | Archived seven-case experiment sharing watcher outputs with preview transitions. |

“Paid” was shorthand for including preparation in elapsed time, not a test
category. Local-only experiments are excluded from the maintained selection.
Replacement proof for an existing CI promise must join ordinary CI selection
before it can replace that promise; setup/build costs remain included.
The two archived experiments are alternatives, not extra time to add to CI tests.

The maintained Git spec is now
`dashboard/backend-tests/runtime/production-update-selection.spec.ts`, formerly
`production-updates.spec.ts`. Its case names state the selection rule:

1. excluded ranges keep the last activation as the comparison baseline
2. rejected policies retain application changes until an ignored repair qualifies
3. unactivated candidates retry until successful activation advances the baseline

Only the filename and title strings changed; test bodies, fixtures and assertions
are unchanged. Historical commands, exact archived source and measured case
identities retain their original names in the earlier evidence records.

## Latest measured CI watcher/pinning selection: 103.32 seconds

[Preview evidence](preview-evidence.md) records the ordinary 24/24 passing
`before` run on 11 November 2026. These are local measurements of CI-selected
tests, with all setup and cleanup included.

| Work | Cases | Seconds | Main cost |
| --- | ---: | ---: | --- |
| Watcher failure, retry, restoration and exit paths | 10 | 45.684 | Repeated real dependency installs, builds and preview processes. |
| Watcher updates, policy, native-start drain and shutdown | 10 | 33.153 | Real staged updates, shared development server/native runner, accepted-start settlement and cleanup. |
| Pinned deployment | 1 | 5.873 | Isolated Git checkout, install, Vite build, preview and distribution assertions. |
| Git update selection | 3 | 2.424 | Real published Git histories and CI-path qualification; no deployment builds. |
| Startup, shared hooks, inter-case gaps, teardown and wrapper | — | 16.186 | Included elapsed outside summed cases; the retained record does not split these phases further. |
| Whole command | 24 | 103.320 | 13 deployment installs/build-command attempts plus one development install. |

The matched earlier watcher-only comparison was 115.55 seconds before versus
95.47/99.18/95.93 after (median 95.93): a 19.62-second measured saving and four
fewer deployment stages. See [watcher evidence](watcher-evidence.md). Do not
subtract case-body sums from unrelated whole-command measurements.

## Original complete selection: representative 287.15-second baseline

Run 6 is the median whole-command run of the frozen three-pass baseline
(266.38/287.15/303.80 seconds). All 45 original cases passed. This is the
pre-optimization family breakdown, not a fresh full-selection measurement.
See [comparable baseline](comparable-baseline.md).

| Family | Cases | Seconds | Why it takes time |
| --- | ---: | ---: | --- |
| Watcher failure and update lifecycles | 25 | 111.847 | 16 real deployment install/build attempts across two serial chains. |
| Touch review | 4 | 51.362 | Large 64-file comparisons, overflowing lines, native touch strokes and viewport/reading-position transitions. |
| Cursor revival and scope continuation | 5 | 30.691 | Repeated real launches, runner/session setup, first-input acceptance, replacement and revival. |
| Landed-CI repeat admission and outcomes | 7 | 30.209 | Repeated five-landing predecessor histories, receipt ingestion, collection and rerun admission. |
| Provider rate-limit pacing | 1 | 21.624 | Approximately 20 seconds waiting for real retry/reset deadlines in the request owner. |
| Pending Take reconciliation | 1 | 9.033 | Held publication, stale/unrelated reads, failed comparison and final accepted snapshot reads. |
| Taken agent profile | 1 | 8.065 | Repeated card inspection, image loading, viewport changes and mark/portrait geometry. |
| Pinned deployment | 1 | 7.969 | Real Git, install, build, preview and cleanup. |
| Startup, shared hooks, gaps, teardown and wrapper | — | 16.350 | Included elapsed outside the 270.800 summed case seconds. |
| Whole command | 45 | 287.150 | One worker; all replacement work must eventually fit the same timing envelope. |

The largest costs are repeated deployments, gesture-heavy browser work and
repeated native/collection setup. Rate-limit time is mostly a real deadline;
the request-owner clock decision remains unresolved. The retained baseline does
not provide a per-command Git/install/build split for the complete suite.

## Archived local reuse experiment: 44.61 seconds

This seven-case candidate is not in the maintained CI selection. It was a
feasibility experiment, with exact source retained in
`/tmp/seed303-preview-KwFoNb`; it does not add seven required CI cases.

| Stage | Case-body seconds |
| --- | ---: |
| Start real watcher A beside development; copy its built output | 10.433 |
| Fail B's real build while A keeps serving | 3.091 |
| Retry B's held build, advance main to C, drain an accepted native start and serve pinned B | 10.587 |
| Cancel C's build and shut down without rewriting shared state | 1.000 |
| Restore and retry previews over isolated A/B copies | 6.738 |
| Preserve both startup/restoration errors and close the URL | 0.327 |
| Detect preview loss and stop owned processes | 0.680 |
| Startup, shared hooks, gaps, teardown and wrapper | 11.754 |
| Whole command | 44.610 |

The first activation and successful pinned retry alone account for 21.020 case
seconds. The command also performs four deployment attempts, one development
install, two complete checkout copies and nine preview invocations. The retained
record does not attribute each command's duration independently, so those counts
must not be presented as a fabricated install/build/copy timing split.

The experiment rejected this sharing strategy as a route to the complete
30-second goal. It did not measure an irreducible lower bound or a complete
replacement selection. Original CI protections remain in place.
