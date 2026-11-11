# Source review — SEED-304#show-one-ci-proof-row-per-location

Launch: fresh general-purpose reviewer with no conversation inheritance; only
Goal, Scope, Key examples, UI, and observational note from
`.planning/seeds/SEED-304-ci-proof-one-row-per-location.md#show-one-ci-proof-row-per-location`.
No plan, product, or proof supplied. Returned 2026-11-11.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A developer reading Intent's CI status can see the full result for a test location without scanning repeated paths. | slice 2 | observed: production Doughnut run 42828209530 attempt 1 Proof shows one row per path with both types' labeled counts/times; no repeated paths |
| 2 | Show each location once in the Proof table, with each result type's own labeled counts and execution time in that row. | slice 1 | observed: dashboard/tests/intent/intent-ci-proof-units.spec.ts one location row; IntentCiProof entryProofCellsOf one row per path |
| 3 | In the CI status tab's Proof table, show one row for each declared location. | slice 1 | observed: dashboard/tests/intent/intent-ci-proof-units.spec.ts expectProofRows four paths; getByRole row count 5 |
| 4.1 | Within that row, label each reported result type: test cases | slice 1 | observed: intent-ci-proof-units.spec.ts labeled test cases lines in frontend/tests and scripts rows |
| 4.2 | Within that row, label each reported result type: test files | slice 1 | observed: intent-ci-proof-units.spec.ts labeled test files lines including no test files and failed file |
| 4.3 | Within that row, label each reported result type: legacy test results | slice 1 | observed: intent-ci-proof-legacy-results.spec.ts and adapter specs remain green with legacy labels |
| 5.1 | Keep each type's passing results | slice 1 | observed: intent-ci-proof-units.spec.ts passed counts per type in grouped rows |
| 5.2 | Keep each type's failing results | slice 1 | observed: intent-ci-proof-units.spec.ts with-failure: 1 failed test file beside cases |
| 5.3 | Keep each type's other results | slice 1 | observed: ciProofCellsOf other-results wording retained via unit lines; single-unit path unchanged |
| 5.4 | Keep each type's measured execution time | slice 1 | observed: intent-ci-proof-units.spec.ts separately labeled times 1 min 39 s / 34.2 s / No timings |
| 5.5 | Keep each type's genuine reporting or timing gaps attributable to that type | slice 1 | observed: intent-ci-proof-units.spec.ts mixed/gap Part 2 missing with Partial title on test files line |
| 6 | Show its totals across shards. | slice 1 | observed: intent-ci-proof-units.spec.ts frontend/tests 2542 cases from two shards |
| 7 | Do not add different result types together. | slice 1 | observed: entryProofCellsOf joins labeled lines; never sums countedResults across units |
| 8 | A failed file before any cases run must remain visible even beside passing cases. | slice 1 | observed: intent-ci-proof-units.spec.ts with-failure file failure visible beside passing cases |
| 9 | This separation prevents misleading counts and execution times. | slice 1 | observed: docs/dashboard-development-intent-ci-status.md types never added across units |
| 10 | Use the existing published CI proof summary. | slice 1 | observed: groupedLocationSummary MakeMe of published-summary shape; no collector/schema change |
| 11.1 | A present report containing zero results needs no execution time | slice 1 | observed: frontend/tests zero file results: No timings; needs no duration |
| 11.2 | A present report containing zero results does not introduce a timing gap for another type | slice 1 | observed: scripts empty file reports keep 34.2 s measured without false gap |
| 12 | Distinguish an explicitly reported zero from missing or ambiguous evidence. | slice 1 | observed: mixed/gap missing part vs frontend/tests explicit zero file results |
| 13 | Keep whole location rows together when sorting the table. | slice 1 | observed: intent-ci-status-sort.spec.ts multi-unit whole-row keyboard sort |
| 14.1 | Preserve readable single-type summaries | slice 1 | observed: single-unit flat presentation retained; neighboring intent-ci-proof.spec.ts green |
| 14.2 | Preserve readable legacy summaries | slice 1 | observed: intent-ci-proof-legacy-results.spec.ts green |
| 15 | A dashboard deployment delivers the change for already published summaries, without rerunning the observed project's CI. | slice 2 | observed: watcher running 28cf896d… (contains slice 1); same published run 42828209530 attempt 1 read with grouped rows; no Doughnut CI rerun |
| 16 | This increment does not redesign folder Summaries. | | G1 |
| 17 | This increment does not redesign file Proof. | | G2 |
| 18 | This increment does not redesign story comparison tables. | | G3 |
| 19 | This increment does not redesign collectors. | | G4 |
| 20 | This increment does not redesign the summary format. | | G5 |
| 21 | CI wall time history compatibility is the separate SEED-305 story. | | G6 |
| 22 | Doughnut's two Vitest shards appear as one `frontend/tests` row with 2,542 passing test cases and zero file-level failures. The case execution time is the sum across both shards. If a file fails before any cases run, its failure is visible in that same row, labeled as a test file result. | slice 1 | observed: intent-ci-proof-units.spec.ts frontend/tests 2542 + zero files + with-failure file failure |
| 23 | Doughnut's `scripts` row shows 450 passing Node test cases and 22 passing Bash test files, with separately labeled execution times (about 1 min 39 s for cases and 34.2 s for files in the observed summary). Its thirteen empty Node file reports do not make the Bash file time partial. | slice 1 | observed: intent-ci-proof-units.spec.ts scripts 450 cases / 22 files / 1 min 39 s / 34.2 s |
| 24 | A location reports timed cases and a missing file-results shard. It still has one row: the case time remains measured, and the missing-part explanation names test files. Sorting moves this whole row without mixing its figures with another location's or summing different types. | slice 1 | observed: intent-ci-proof-units.spec.ts mixed/gap measured case time + file Part 2 missing; sort moves whole row |
| 25 | After the new dashboard is deployed, opening the same already published run shows these combined rows. A single-type or older legacy summary remains readable with its own labels and timing information. | slice 2 | observed: frontend/tests and scripts combined rows; single-type e2e_test/features and backend/src/test/java still readable with own counts/times |
| 26.1 | Keep the Entry column | slice 1 | observed: CiProofFigures/Table keep Entry scope column |
| 26.2 | Keep the Counts column | slice 1 | observed: CiProofFigures proofHeaders Counts column |
| 26.3 | Keep the Test execution time column | slice 1 | observed: CiProofFigures proofHeaders Test execution time column |
| 27 | Write the path once. | slice 1 | observed: IntentCiProof ScopePath once per entry; unit lines only in Counts/time cells |
| 28 | Align labeled result-type lines inside its counts and time cells, so a reader can associate each count, duration, or gap without following a repeated path. | slice 1 | observed: CiProofFigures UnitLine stacked label+value; expectProofRows labeled association |
| 29 | Keep those labels and gap explanations available to assistive technology. | slice 1 | observed: intent-ci-proof-accessibility.spec.ts aria-label/title/description + narrow/zoom |
| 30 | Observed in Doughnut CI run 42828209530. | | G7 |
