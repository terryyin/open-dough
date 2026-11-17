# Source review

Launch: fresh general-purpose reviewer, no conversation inheritance, 2026-11-17,
before slice 1 delegation. Input: only the story section "Evaluation checks that
restate data or enter below the family entry are removed" (Goal, Scope, Scope
limits, Key examples, Evaluation) of
[SEED-396](../../seeds/SEED-396-evaluation-javascript-tests.md#remove-redundant-evaluation-checks),
verbatim. No plan, proof or product files. Instructed to read nothing else and
change nothing.

Unnumbered context returned: story reason; scope limits (no runtime, catalog,
historical evidence or paid native changes; no framework/migration;
`native-comparison-refresh.sh` left to plan 677); wrappers remain with settled
CI-share baseline and no runtime promise; ten-file estimate not a quota; sibling
vocabulary/guideline stays its own work; Evaluation comparison is proof method;
no speed or native-host claim.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | The catalog check runs the real guidance-check command against its own small catalog, without listing shipped case names or copying their traits; changing shipped case names needs no expectation change | slice 1 | observed: Distribution/evaluation/tests/native-guidance-checks/native-guidance-check.sh: selection_case alpha/beta owned root; real native-guidance-check.sh --list; no shipped names in expectations |
| 2 | Two local cases share a host but differ in workflow → the command lists both | slice 1 | observed: Distribution/evaluation/tests/native-guidance-checks/native-guidance-check.sh: [[ $(catalog) == alpha\nbeta ]] and hosts=CODEX lists both |
| 3 | Mixed-case host/workflow filter values still match (case-insensitive trait filtering) | slice 1 | observed: Distribution/evaluation/tests/native-guidance-checks/native-guidance-check.sh: hosts=CODEX --where workflow=BLOCK == alpha (mixed case); ignored-filter fault red, restored green |
| 4 | Combined host and workflow filters return only the case matching both | slice 1 | observed: Distribution/evaluation/tests/native-guidance-checks/native-guidance-check.sh: hosts=CODEX --where workflow=BLOCK == alpha only; fault returned alpha/beta and failed |
| 5 | A filter matching no case returns a failure | slice 1 | observed: Distribution/evaluation/tests/native-guidance-checks/native-guidance-check.sh: catalog --where workflow=absent must exit nonzero |
| 6 | Case-selection, routing, entry-dispatch and identity-input checks no longer assert inventories, copied descriptions, or shipped descriptions and host/case counts | slice 3 | |
| 7 | Invalid selections still fail before launch, and this is still checked | slice 2 | observed: Distribution/evaluation/tests/adr-awareness/native-case-selection.sh: unchanged assert_invalid block (nonzero exit, error:/usage:, no sentinel calls, watched dir empty) |
| 8 | Listing starts no host, still checked | slice 2 | observed: Distribution/evaluation/tests/adr-awareness/native-case-selection.sh: assert_listing_quiet → assert_no_sentinel_calls on four wrapper listings and planted-record listing |
| 9 | Listing creates no scratch, still checked | slice 2 | observed: Distribution/evaluation/tests/adr-awareness/native-case-selection.sh: assert_listing_quiet → assert_watched_empty on the same five listings |
| 10 | Listing works with read-only results, still checked | slice 2 | observed: Distribution/evaluation/tests/adr-awareness/native-case-selection.sh: cursor listing with chmod a-w --results-dir readonly_results passes quietly |
| 11 | Listing marks a planted passing record unreviewed, still checked | slice 2 | observed: Distribution/evaluation/tests/adr-awareness/native-case-selection.sh: planted status: pass record shows prior-evidence: unreviewed, untouched conflict shows none; certified fault red, restored green |
| 12 | Entry-dispatch effects are still checked | slice 3 | |
| 13 | Retained artifacts are still checked | slice 3 | |
| 14 | Identity-input invalidation is still checked | slice 3 | |
| 15 | The identical `cursor-target` journey-state scenario's repeated pass is removed | slice 4 | |
| 16 | The failed-update counterexample remains | slice 4 | |
| 17 | The preservation counterexample remains | slice 4 | |
| 18 | Shell stream assertions already owned by corpus replay are removed | slice 5 | |
| 19 | A misclassified weekly-limit stream makes corpus replay fail naming that entry, after the shell assertions are removed | slice 5 | |
| 20 | A weekly-limit stream gaining an invented command makes corpus replay fail naming that entry | slice 5 | |
| 21 | Distinct command-output pairing observation stays in JavaScript | slice 5 | |
| 22 | Distinct tool/read observations stay in JavaScript | slice 5 | |
| 23 | The comparison assessor keeps its distinct rejected cases | slice 5 | |
| 24 | The journey assessor keeps its distinct rejected cases | slice 4 | |
| 25 | The probe-restoration check is kept | slice 1 | observed: native-guidance-check-launch-command-tests-probes.sh byte-unchanged (git diff); runs in final npm run test:evaluation |
| 26 | The fixture/E2E observations are kept | slice 1 | observed: native-guidance-check-launch-command-tests.sh fixture/backend/turn-2 assertions unchanged, passed via scripts/test.sh; -e2e.sh unchanged |
| 27 | The watchdog just-forked handler race regression is kept until equivalent entry-level protection exists | slice 5 | |
| 28 | The incomplete-output-parent regression is kept until equivalent entry-level protection exists | slice 5 | |
| 29 | The four launch-command test boundaries are kept | slice 1 | observed: four launch-command test files remain; only catalog prelude removed from native-guidance-check-launch-command-tests.sh |
| 30 | Every removal restates data/configuration, repeats the same scenario, or has a named retained/replacement entry-level check; unique or unproved protection is kept; every distinct observation keeps a retained owner | slice 5 | |
| 31 | Named retained or replacement checks fail under the named faults of their covered behavior and pass once restored; a lower check moves up only when its replacement does this | slice 5 | |
| 32 | The evaluation assertions run are fewer than before the change | slice 5 | |
| 33 | Removed assertions or scenarios are recorded apart from scheduled jobs; an unchanged job count is acceptable | slice 5 | |
