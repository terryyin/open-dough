# Source-only review

Fresh reviewer `/root/source_review` was launched with `fork_turns: none`.
The launch supplied only the selected story's verbatim Goal and Scope and the
complete six bullets under this plan's Correction input. The reviewer was told
to read no other files, change nothing, separate individual commitments,
qualifications, journey examples and exclusions, and derive no ownership or
acceptance. The launch and actual return are retained in this execution's tool
history. The source text was unchanged at review.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | One maintained check provides the guard against the selection gap reopening. | slice 1 | observed: tests/makeme-scheduled-selection.test.mjs: single maintained test; focused runner command passed |
| 2 | The check reads this repository's own `.planning/open-dough.json`. Fixture configurations alone do not establish this promise. | slice 1 | observed: tests/makeme-scheduled-selection.test.mjs: testEntryRules(root, paths) and readFileSync of actual .planning/open-dough.json |
| 3 | The check reads the globs in `tests/node-test-files`. | slice 1 | observed: tests/makeme-scheduled-selection.test.mjs: execFileSync of real scripts/test-jobs.sh; /tmp/seed329-guard-proof-d0933767/check-new-job.mjs and new-job.log prove added registry entry is checked |
| 4 | The check covers `tests/*.sh`. | slice 1 | observed: scripts/test-jobs.sh shell discovery reached by maintained test; test asserts shell jobs exist and selection covers all listed shell paths |
| 5 | The check fails when a runner-scheduled test inside an Intent location stops selecting MakeMe. | slice 1 | observed: /tmp/seed329-guard-proof-d0933767/legacy-shell-declaration.log and makeme-off.log name missed paths; maintained selection.sources failure-array assertion |
| 6 | The check confirms that the covered scheduled sources select page objects off. | slice 1 | observed: maintained selection.sources failure-array assertion; /tmp/seed329-guard-proof-d0933767/page-objects-on.log detects enabled page objects |
| 7 | The check fails when the `tests` Intent location loses its shell syntax hint. | slice 1 | observed: maintained testJobs hint assertion and /tmp/seed329-guard-proof-d0933767/missing-shell-hint.log detect lost shell hint |
| 8 | The check fails when the `tests` Intent location loses its JavaScript syntax hint. | slice 1 | observed: maintained testJobs hint assertion plus root/support presence assertions and /tmp/seed329-guard-proof-d0933767/missing-javascript-hint.log detect lost JavaScript hint |
| 9 | A maintainer changing Intent locations learns at once if the change breaks the guarded selection. | slice 1 | observed: /tmp/seed329-guard-proof-d0933767/check.mjs supplies five independent configuration faults; each focused runner command fails naming an offending path; restoration passes |
| 10 | A maintainer changing runner globs learns at once if a scheduled test breaks the guarded selection. | slice 1 | observed: /tmp/seed329-guard-proof-d0933767/check-new-job.mjs changes registry and adds source; new-job.log fails naming newly scheduled source; exact registry bytes restored |
| 11 | This correction adds a check only. | slice 1 | observed: git diff/status and actual test inspection: only new tests/makeme-scheduled-selection.test.mjs plus execution records; original configuration, flags, shared selector/matcher, skill sources/installations and runner discovery unchanged |
| 12 | The five Intent locations remain preserved. | slice 1 | observed: git diff/status and actual test inspection: only new tests/makeme-scheduled-selection.test.mjs plus execution records; original configuration, flags, shared selector/matcher, skill sources/installations and runner discovery unchanged |
| 13 | Their flags remain preserved. | slice 1 | observed: git diff/status and actual test inspection: only new tests/makeme-scheduled-selection.test.mjs plus execution records; original configuration, flags, shared selector/matcher, skill sources/installations and runner discovery unchanged |
| 14 | The shared selector remains preserved. | slice 1 | observed: git diff/status and actual test inspection: only new tests/makeme-scheduled-selection.test.mjs plus execution records; original configuration, flags, shared selector/matcher, skill sources/installations and runner discovery unchanged |
| 15 | The shared matcher remains preserved. | slice 1 | observed: git diff/status and actual test inspection: only new tests/makeme-scheduled-selection.test.mjs plus execution records; original configuration, flags, shared selector/matcher, skill sources/installations and runner discovery unchanged |
| 16 | Shared skill sources remain preserved. | slice 1 | observed: git diff/status and actual test inspection: only new tests/makeme-scheduled-selection.test.mjs plus execution records; original configuration, flags, shared selector/matcher, skill sources/installations and runner discovery unchanged |
| 17 | Installed skill copies remain preserved. | slice 1 | observed: git diff/status and actual test inspection: only new tests/makeme-scheduled-selection.test.mjs plus execution records; original configuration, flags, shared selector/matcher, skill sources/installations and runner discovery unchanged |
| 18 | The runner's job discovery remains preserved. | slice 1 | observed: git diff/status and actual test inspection: only new tests/makeme-scheduled-selection.test.mjs plus execution records; original configuration, flags, shared selector/matcher, skill sources/installations and runner discovery unchanged |

## Qualifications and journeys returned

- The source set is runner-scheduled tests inside Intent locations. Being a
  runner job alone does not establish inclusion.
- “At once” establishes timely maintenance feedback; the source prescribes no
  command, hook, CI placement or diagnostic format.
- Syntax hints concern shell and JavaScript in `tests`, without prescribing a
  configuration representation. Provenance does not freeze the file inventory.
- Reverting `tests` to `{"kind":"shell","include":["*.sh"]}` exposes the
  reported lost selection and hints for root and support Node tests.
- Changing runner globs to cover another test evaluates that source against
  this repository's Intent configuration.
- Removing either required syntax hint makes the guard fail.
- These are examples, not rules forbidding every shell-kind configuration or
  limiting coverage to the two paths in the original finding.
- `scripts/check-self-installation.sh` remains excluded because it is outside
  every Intent location. Browser-spec page-object selection remains out of scope.
