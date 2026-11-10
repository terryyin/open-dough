# Source-only review: SEED-290#publish-frontend-test-proof

**Launch:** Fresh general-purpose reviewer (no conversation inheritance); input was only the seed Goal, Scope, Scope limits, and Key examples for SEED-290#publish-frontend-test-proof. No plan, product, proof, or current-slice scope was supplied. Reviewer was told to read no other project files and change nothing.

**Input:** `.planning/seeds/SEED-290-publish-frontend-test-proof.md` section `publish-frontend-test-proof` (Goal, Scope, Scope limits, Key examples 1–4).

Examples E1–E4 from the return illustrate commitments and are not separate commitment rows.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Publish one downloadable frontend test proof artifact for each run attempt whose existing CI proof collection job runs, alongside the combined summary. | slice 1 | observed: tests/support/ci-proof-declaration.test.mjs optional frontend upload; tests/support/ci-proof-frontend-report.test.mjs report file beside summary |
| 2 | The report covers `dashboard/frontend-tests`. | slice 1 | observed: tests/support/ci-proof-frontend-report.test.mjs Frontend test proof: dashboard/frontend-tests; no browser/backend rows |
| 3a | The report identifies the repository. | slice 1 | observed: tests/support/frontend-test-proof.test.mjs and ci-proof-frontend-report.test.mjs Repository line |
| 3b | The report identifies the checked revision. | slice 1 | observed: tests/support/frontend-test-proof.test.mjs and ci-proof-frontend-report.test.mjs Revision line |
| 3c | The report identifies the GitHub run ID. | slice 1 | observed: tests/support/frontend-test-proof.test.mjs and ci-proof-frontend-report.test.mjs Run ID line |
| 3d | The report identifies the run attempt. | slice 1 | observed: tests/support/frontend-test-proof.test.mjs and ci-proof-frontend-report.test.mjs Attempt line |
| 4a | Show observed test-case outcomes by test file. | slice 1 | observed: tests/support/frontend-test-proof.test.mjs file table passed/failed/other columns |
| 4b | Show recorded execution durations by test file. | slice 1 | observed: tests/support/frontend-test-proof.test.mjs file Duration column 0 ms / 30 ms / unavailable |
| 5a | Include frontend totals. | slice 1 | observed: tests/support/frontend-test-proof.test.mjs Totals line 1 passed, 1 failed, 1 other |
| 5b | Include evidence gaps (make gaps visible in the report). | slice 1 | observed: tests/support/frontend-test-proof.test.mjs Evidence parts missing/ambiguous; Incomplete completeness |
| 6a | Keep passed results distinct. | slice 1 | observed: tests/support/frontend-test-proof.test.mjs distinct passed column/totals |
| 6b | Keep failed results distinct. | slice 1 | observed: tests/support/frontend-test-proof.test.mjs distinct failed; remain failed wording |
| 6c | Keep other results distinct from passed and failed. | slice 1 | observed: tests/support/frontend-test-proof.test.mjs distinct other column/totals |
| 6d | Explain that other results include skipped or unfinished selections, and that existing evidence does not distinguish them further. | slice 1 | observed: scripts/frontend-test-proof.mjs and frontend-test-proof.test.mjs skipped or unfinished explanation |
| 7 | Identify durations as summed recorded test execution time, rather than elapsed job time. | slice 1 | observed: scripts/frontend-test-proof.mjs Duration: summed recorded test execution; proof-record.md |
| 8a | Make missing shard evidence explicit. | slice 1 | observed: tests/support/frontend-test-proof.test.mjs Part missing (unknown; not a reported zero) |
| 8b | Make ambiguous shard evidence explicit. | slice 1 | observed: tests/support/frontend-test-proof.test.mjs Part ambiguous (conflicting evidence) |
| 8c | A present shard with no frontend tests is a reported zero. | slice 1 | observed: tests/support/frontend-test-proof.test.mjs and ci-proof-frontend-report.test.mjs present zero |
| 8d | A missing shard is unknown (not treated as zero). | slice 1 | observed: tests/support/frontend-test-proof.test.mjs missing distinct from present zero |
| 9 | Partial results do not establish an overall executed pass. | slice 1 | observed: tests/support/frontend-test-proof.test.mjs Incomplete; does not establish executed pass |
| 10a | Keep measured zero time distinct from unavailable timing. | slice 1 | observed: tests/support/frontend-test-proof.test.mjs 0 ms versus unavailable |
| 10b | Matching revision and attempt are correctness requirements: another attempt's results cannot prove this attempt. | slice 1 | observed: tests/support/ci-proof-frontend-report.test.mjs wrong-revision/attempt fragments excluded; gaps remain |
| 11a | Derive the report from the attempt's existing dashboard proof records, through the existing CI proof fragments and combined summary. | slice 1 | observed: .github/actions/ci-proof-summary/action.yml renders from written summary; ci-proof-frontend-report.test.mjs |
| 11b | Preserve the combined summary and existing test verdicts. | slice 1 | observed: tests/support/ci-proof-frontend-report.test.mjs combined summary entries preserved; declaration keeps summary artifact |
| 11c | Add no test run to produce the report. | slice 1 | observed: .github/actions/ci-proof-summary/action.yml report command reads summary only; proof-record.md |
| L1 | No dashboard UI. | slice 1 | observed: diff scope: no dashboard UI changes |
| L2 | No new test collection. | slice 1 | observed: diff scope: no new test collection; reuses fragments/summary |
| L3 | No individual test diagnostics. | slice 1 | observed: report shows file aggregates only; no individual diagnostics |
| L4 | No new outcome taxonomy. | slice 1 | observed: passed/failed/other only; no finer taxonomy |
| L5 | No timing benchmark or threshold. | slice 1 | observed: no timing benchmark or threshold in report/action |
| L6 | No reports for other test locations. | slice 1 | observed: frontend-entry scoped to dashboard/frontend-tests only |
| L7 | No new cancellation/recovery guarantee: a cancelled workflow can prevent the existing collector from running. | slice 1 | observed: no new cancel/recovery path; existing !cancelled collector preserved |
| L8 | An incomplete shard record can remain missing under the existing collector's rules; recovering its partial attempts is separate work. | slice 1 | observed: running shard refused; part remains missing in report |
