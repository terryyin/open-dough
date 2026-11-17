# Source-only review

Launch: fresh general-purpose agent `/root/source_review`, `fork_turns: none`,
2026-11-17. Its launch message and returned review are inspectable in this
execution conversation. Input was only the original selected story's Goal,
Scope, key examples, exclusions and Evaluation, with instructions to read no
project files and change nothing; no plan, implementation or proof was supplied.
The reviewer used the supplied headings and bullet names as source references.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| P01 | Both guides identify the family command with a substitute host as an evaluation-check entry. Guideline, entry bullet; Goal; Entry, not helper example: supervision runs the `context` command with a substitute host. | slice 7 | |
| P02 | Both guides identify the named layer-contract entry: an assessor applied to an observation through the rejected-case helper. Guideline, entry bullet. This is the alternative allowed entry. | slice 7 | |
| P03 | The guideline explains what an evaluation check leaves untested. Goal: “says where a check enters, what it leaves untested, and which words it uses.” The supplied source does not specify those exclusions. | slice 7 | |
| P04 | The guides prohibit sourcing a private `src/` helper to call its functions or read its globals, and contain no instruction directing new checks to do so. Guideline, private-helper bullet; Evaluation. Entry, not helper retains the concrete prohibited example: sourcing `native-run-supervise.sh`. | slice 7 | |
| P05 | The guides require data and configuration to have one owning script, without restatement in checks. Guideline, data bullet. Named forms: catalog entry, case list, routing table, input list. Data stays in one place: the catalog-selection example does not list shipped case names. | slice 7 | |
| P06 | The guides require a check to prove the rule consuming data using data controlled by the check. Guideline, data bullet. Data stays in one place: give the command a two-case catalog and prove `--where` filters by trait. | slice 7 | |
| P07 | The guides require every expected fact to use the shared expectation vocabulary. Guideline, vocabulary bullet; Goal. | slice 7 | |
| P08 | The guides require distinct behaviors to remain distinct cases. Guideline, case-organization bullet. | slice 7 | |
| P09 | The guides require data-only variants of one behavior to share a row table. Guideline, case-organization bullet. | slice 7 | |
| P10 | The test-only helper provides a scratch workspace that cleans itself up. Expectation vocabulary. Helper location: `tests/native-harness/support/`. | slice 1 | observed: native-check-expectations.sh workspace child loop exits 0/7 and verifies removal including read-only content; focused runner exit 0 |
| P11 | The helper can run an entry with substitute hosts. Expectation vocabulary. | slice 1 | observed: native-check-expectations.sh real bash entry resolves native-check-host from substitute bin; focused runner exit 0 |
| P12 | Running an entry through the helper retains its exit status. Expectation vocabulary: “keeping its status and output.” | slice 1 | observed: native-check-expectations.sh native_check_run loop retains 0 and 9 without stopping caller; focused runner exit 0 |
| P13 | Running an entry through the helper retains its output. Expectation vocabulary: “keeping its status and output.” | slice 1 | observed: native-check-expectations.sh run loop reads independent stdout and stderr bytes; focused runner exit 0 |
| P14 | The vocabulary can express an expected status as one fact in one line. Expectation vocabulary; Goal; A fact in one line: hung substitute host makes `context` return `124`, asserted in one line. | slice 2 | |
| P15 | The vocabulary can express an expected record field as one fact in one line. Expectation vocabulary; A fact in one line: assert `execution-status: timeout` in one line. | slice 2 | |
| P16 | The vocabulary can express an expected line in a file as one fact in one line. Expectation vocabulary; Goal. | slice 1 | observed: native-check-expectations.sh quiet passing native_check_expect_line and failing retained-payload child; focused runner exit 0 |
| P17 | The vocabulary can express an absent path as one fact in one line. Expectation vocabulary; A fact in one line: assert the absent adopter directory in one line. | slice 2 | |
| P18 | A failed expectation causes the job to fail. Expectation vocabulary; Failed expectation shows evidence. Concrete trigger: record contains `execution-status: completed` while `timeout` is expected. | slice 1 | observed: native-check-expectations.sh assert_failure children use errexit and cannot reach trailing stdout, including completed versus timeout record; focused runner exit 0 |
| P19 | A failed expectation names the fact that failed. Expectation vocabulary. Failed expectation shows evidence specifically names the record field. | slice 1 | observed: native-check-expectations.sh assert_failure checks named fact and execution-status field; focused runner exit 0 |
| P20 | A failed record-field expectation reports the expected and actual values. Failed expectation shows evidence: expected `timeout`, actual `completed`. | slice 1 | observed: native-check-expectations.sh record failure checks expected timeout and actual completed; focused runner exit 0 |
| P21 | A failed expectation prints the evidence it read. Expectation vocabulary. Failed expectation shows evidence specifically prints the record. | slice 1 | observed: native-check-expectations.sh assert_failure checks evidence and both record lines; focused runner exit 0 |
| P22 | The six named run-entry checks use the shared vocabulary. Worked example: `native-run-timeout.sh`, `native-run-watchdog-cleanup.sh`, `native-run-workspace-isolation.sh`, `native-result-retention.sh`, `native-runner-failures.sh`, `native-stream-completeness.sh`. | slice 6 | |
| P23 | Those six checks contain no hand-written `FAIL` block. Evaluation; A fact in one line. | slice 6 | |
| P24 | Those six checks contain no private scratch-cleanup trap. Evaluation. | slice 6 | |
| P25 | The rewritten `native-run-timeout.sh` retains every fact it previously asserted. Worked example; Evaluation requires continued failure on a covered behavioral break. | slice 2 | |
| P26 | The rewritten `native-run-watchdog-cleanup.sh` retains every fact it previously asserted. Worked example; Evaluation, same qualification. | slice 6 | |
| P27 | The rewritten `native-run-workspace-isolation.sh` retains every fact it previously asserted. Worked example; Evaluation, same qualification. | slice 6 | |
| P28 | The rewritten `native-result-retention.sh` retains every fact it previously asserted. Worked example; Evaluation, same qualification. | slice 3 | |
| P29 | The rewritten `native-runner-failures.sh` retains every fact it previously asserted. Worked example; Evaluation, same qualification. | slice 4 | |
| P30 | The rewritten `native-stream-completeness.sh` retains every fact it previously asserted. Worked example; Evaluation, same qualification. | slice 5 | |
| P31 | A retry-after-deadline fault that fails an existing run-entry check still fails the rewritten check. Same facts after rewrite. The source does not identify the particular check. | slice 2 | |
| P32 | An owned-process-left-alive fault that fails an existing run-entry check still fails the rewritten check. Same facts after rewrite. The source does not identify the particular check. | slice 6 | |

Unnumbered context returned by reviewer: selected story
`SEED-396#replace-evaluation-shell-checks`; documentation locations are
`Distribution/evaluation/README.md` and `native-family-layers.md`. The helper
has its own check including proof that a failed expectation fails the job.
The source names six checks and preserves every existing fact without
enumerating assertions; P25–P30 cannot be decomposed further from source alone.
Other families retain their form and adopt the vocabulary when next changed;
no checks are removed; `cases/`, `src/`, `Distribution/tests`, and `node --test`
files stay unchanged. Shell remains; JavaScript replacement and Bach are not
pursued. Real Git, processes/deadlines and substitute hosts on PATH remain
relevant. The worked example is approximately 1,000 lines. The next real check
change judges whether vocabulary shortens writing and clarifies failure; the
source promises no measured improvement now.
