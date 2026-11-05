## Launch and input

Fresh general-purpose reviewer, no conversation inheritance. Supplied only the
selected story Goal, Scope (required behavior, constraints, scope limits), and
key examples 1–10 from
`.planning/seeds/SEED-192-review-product-intent.md#read-node-test-proof`.
Instructed: use only those inputs; read no other project files; change nothing;
return numbered commitments, qualifications, journey examples and exclusions.

Reviewer agent: 36df6ae3-0fc5-4577-bfbc-3432769747ea (2026-11-05).

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| Q1 | Recording is opt-in via an explicit project-owned option such as RECORD_NODE_TEST_PROOF=1; off in every profile including CI. | slice 1 | observed: node-test-proof.md Configure once: RECORD_NODE_TEST_PROOF=1 off by default including CI |
| Q2 | Only a plain pass records proof; an executed non-pass clears it. Proof must not claim behavior a test did not pass. | slice 1 | observed: node-test-proof.md Record: plain pass records; non-pass clears |
| Q3 | Normal runs never create, change, or delete proof (byte-for-byte untouched when the option is off). | slice 1 | observed: node-test-proof.md opening: normal runs leave proof byte-for-byte untouched |
| Q4 | Missing, empty, unreadable, or malformed proof is never shown as a pass. | slice 3 |  |
| Q5 | Existing Cucumber, pytest, and Vitest proof files, reader behavior, and wording for their locations stay unchanged. | slice 3 |  |
| Q6 | Each project's test output, diagnostics, exit meaning, and scheduling stay as they are with the recorder loaded; scripts/test.sh still fails a job that passed but printed output. | slice 2 |  |
| Q7 | Reuse the Vitest-introduced test-call snapshot format and reader for a second runner; add no Node-shaped duplicate. | slice 3 |  |
| Q8 | The reference is written for the agent working in the recording project. | slice 1 | observed: node-test-proof.md written for agent in recording project (Configure once) |
| Q9 | Event shape is stated with the Node version it was observed on. | slice 1 | observed: node-test-proof.md Record section: observed on Node 24.21.0 |
| Q10 | Publication of Doughnut adoption follows Doughnut's own rules. | slice 5 |  |
| Q11 | Terry evaluates real reading against node --test output plus an editor. | slice 6 |  |
| 1 | Publish src/skills/dough-test-optimization/references/node-test-proof.md. | slice 1 | observed: src/skills/dough-test-optimization/references/node-test-proof.md exists |
| 2 | Link that reference from dough-test-optimization the same way the Cucumber, pytest and Vitest references are linked. | slice 1 | observed: src/skills/dough-test-optimization/SKILL.md links Node test proof beside cucumber/pytest/vitest |
| 3 | Declare that reference in install.sh. | slice 1 | observed: install.sh managed_files lists node-test-proof.md; payload-declaration-links.sh exit 0 |
| 4.1 | Explicit project-owned option (such as RECORD_NODE_TEST_PROOF=1), off in every profile including CI. | slice 1 | observed: node-test-proof.md Configure once: RECORD_NODE_TEST_PROOF=1 |
| 4.2 | Normal runs leave proof byte-for-byte untouched. | slice 1 | observed: node-test-proof.md opening: normal runs leave proof untouched |
| 4.3 | The recorder prints nothing. | slice 1 | observed: node-test-proof.md Configure once: recorder prints nothing |
| 4.4 | The recorder never fails the run. | slice 1 | observed: node-test-proof.md Configure once: never fails the run |
| 4.5 | The recorder records nothing outside a Git checkout. | slice 1 | observed: node-test-proof.md Configure once: outside Git checkout records nothing |
| 4.6 | One maintained latest.json per proof directory. | slice 1 | observed: node-test-proof.md Refresh: one latest.json per proof directory |
| 4.7 | That file is refreshed atomically after each finished case. | slice 1 | observed: node-test-proof.md Refresh: atomic write then rename after each finished case |
| 4.8 | Refresh is serialized against concurrent recording runs in the same checkout. | slice 1 | observed: node-test-proof.md Refresh: serialize concurrent recording processes |
| 4.9 | Passing cases only are recorded. | slice 1 | observed: node-test-proof.md Retain only passing test cases |
| 4.10 | An executed final unsuccessful result clears that case's earlier proof. | slice 1 | observed: node-test-proof.md executed unsuccessful result clears earlier proof |
| 4.11 | Unexecuted cases keep their proof. | slice 1 | observed: node-test-proof.md unexecuted cases keep theirs |
| 4.12 | Deliberate commits of proof. | slice 1 | observed: node-test-proof.md Commit proof section: deliberate commits |
| 4.13 | runner, proof, and proofGeneration are declared on the location. | slice 1 | observed: node-test-proof.md Configure once declaration example with runner/proof/proofGeneration |
| 5.1 | The recorder is a --test-reporter module. | slice 1 | observed: node-test-proof.md Record: --test-reporter module |
| 5.2 | It runs once per node --test process, in the main process. | slice 1 | observed: node-test-proof.md Record: once per process in main process |
| 5.3 | It receives every file's events. | slice 1 | observed: node-test-proof.md Record: receives every file's events |
| 5.4 | Loaded from ordinary command beside existing reporter with destinations, or from recording command alone / NODE_OPTIONS. | slice 1 | observed: node-test-proof.md Configure once: destinations or NODE_OPTIONS loading shapes |
| 5.5 | The option decides whether a loaded recorder records. | slice 1 | observed: node-test-proof.md option decides whether loaded recorder records |
| 5.6 | Records from test:pass and test:fail, never from test files or hooks. | slice 1 | observed: node-test-proof.md Record: test:pass and test:fail only |
| 5.7 | A case is a test (details.type: "test") whose enclosing results are suites or the file. | slice 1 | observed: node-test-proof.md Record: case is details.type test with suite/file enclosing |
| 5.8 | Subtests fold into the parent; subtestsFailed clears; durationMs is Node's duration_ms; subtest records nothing. | slice 1 | observed: node-test-proof.md Record: subtests fold; subtestsFailed clears; duration_ms |
| 5.9 | attempts is 1. | slice 1 | observed: node-test-proof.md Record: attempts always 1 |
| 5.10 | skip/todo/excluded/cancelled/unreached keep proof. | slice 1 | observed: node-test-proof.md Record: skip/todo/excluded/cancelled/unreached keep |
| 5.11 | Every other test:fail, timeouts included, clears. | slice 1 | observed: node-test-proof.md Record: other test:fail including timeouts clear |
| 5.12 | file is path from repository root (git rev-parse --show-toplevel). | slice 1 | observed: node-test-proof.md Identity: file via git rev-parse --show-toplevel |
| 5.13 | Only files under locations declaring runner: "node:test" and proof. | slice 1 | observed: node-test-proof.md covered locations with runner node:test and proof only |
| 5.14 | test is names from outermost describe/suite to the test. | slice 1 | observed: node-test-proof.md Identity: test name list from outermost describe/suite |
| 5.15 | Event shape stated with the Node version observed. | slice 1 | observed: node-test-proof.md observed on Node 24.21.0; Doughnut 26+ note |
| 6.1 | field file | slice 1 | observed: node-test-proof.md File format JSON: file field |
| 6.2 | field test (a list) | slice 1 | observed: node-test-proof.md File format JSON: test list |
| 6.3 | outcome: "passed" | slice 1 | observed: node-test-proof.md File format: outcome always passed |
| 6.4 | attempts | slice 1 | observed: node-test-proof.md File format: attempts |
| 6.5 | durationMs | slice 1 | observed: node-test-proof.md File format: durationMs |
| 6.6 | finishedAt | slice 1 | observed: node-test-proof.md File format: finishedAt |
| 6.7 | commit | slice 1 | observed: node-test-proof.md File format: commit |
| 6.8 | fileBlob | slice 1 | observed: node-test-proof.md File format: fileBlob |
| 7 | At most one observation per identity. | slice 1 | observed: node-test-proof.md at most one observation per identity |
| 8 | Observations ordered by file then test. | slice 1 | observed: node-test-proof.md Refresh: order by file then test |
| 9 | A node:test snapshot parses with the Vitest parser. | slice 1 | observed: node-test-proof.md Identity/File format: Vitest format without project |
| 10 | runner: "node:test" on a javascript or typescript location that declares proof. | slice 2 |  |
| 11 | Dashboard reads proof and proofGeneration on that location as on any location. | slice 3 |  |
| 12 | Declared proof without usable runner explained naming vitest or node:test. | slice 3 |  |
| 13.1 | Every test or it call outside another test's callback. | slice 3 |  |
| 13.2 | With or without .skip, .only, or .todo. | slice 3 |  |
| 13.3 | Names are string literals or template literals without substitutions. | slice 3 |  |
| 13.4 | In definition order. | slice 3 |  |
| 13.5 | Each at its call's line. | slice 3 |  |
| 13.6 | Named by whole suite path as Vitest and failures reporter join it. | slice 3 |  |
| 14 | Default import from node:test is read; an alias is not. | slice 3 |  |
| 15 | Each test shows one row with Vitest cells or No successful proof. | slice 3 |  |
| 16 | Header reads Test case. | slice 3 |  |
| 17 | Count line counts test cases. | slice 3 |  |
| 18 | Same figures as Vitest summary with tests and test cases words. | slice 3 |  |
| 19 | Location without proof names declared runner reference, else every runner's. | slice 3 |  |
| 20 | Other-kinds sentence lists Node test files among the families. | slice 3 |  |
| 21 | Unreadable and malformed proof keep their retry explanations. | slice 3 |  |
| 22 | Cucumber- or pytest-shaped file under node:test location is malformed. | slice 3 |  |
| 23 | Recorder in Open Dough tests/support. | slice 2 |  |
| 24 | Loaded by scripts/test.sh beside failures reporter with recording off; quiet-pass holds. | slice 2 |  |
| 25.1 | Option off | slice 2 |  |
| 25.2 | A describe path | slice 2 |  |
| 25.3 | Subtests folding | slice 2 |  |
| 25.4 | skip and todo | slice 2 |  |
| 25.5 | A timeout | slice 2 |  |
| 25.6 | A failure clearing only itself | slice 2 |  |
| 25.7 | Name-pattern exclusion | slice 2 |  |
| 25.8 | Concurrent jobs refreshing one snapshot | slice 2 |  |
| 25.9 | An interrupted refresh | slice 2 |  |
| 25.10 | Outside-Git no-op | slice 2 |  |
| 25.11 | Unchanged output and exit | slice 2 |  |
| 26 | runner, proof, and recording command declared on src/skills. | slice 2 |  |
| 27 | One explicit focused recording run committed as first snapshot. | slice 2 |  |
| 28 | Doughnut JS reporter sharing e2e_test/config/proofStore.mjs. | slice 5 |  |
| 29 | Tests through pnpm test:* inside lint:all covering same rules on Doughnut Node. | slice 5 |  |
| 30 | runner, proof, recording command on scripts and infra. | slice 5 |  |
| 31 | Recording command loads reporter via NODE_OPTIONS or explicit flags. | slice 5 |  |
| 32 | Focused recording of cheap files committed as first snapshot. | slice 5 |  |
| 33 | Publication follows Doughnut's own rules. | slice 5 |  |
| 34 | Intent on Open Dough shows recorded files' rows and folder summary. | slice 6 |  |
| 35 | Intent on Doughnut shows the same for its recorded files. | slice 6 |  |
| 36 | src/skills root summary opened once with time and GitHub request count as learning. | slice 6 |  |
| 37 | docs/dashboard-development-intent.md describes node:test Proof beside Vitest. | slice 3 |  |
| 38 | The reference is linked where the others are. | slice 3 |  |
| 39 | No count or summed duration includes both a test and its subtests. | slice 3 |  |
| 40 | Identity uses Node's own names, never test numbers, lines, or collection order. | slice 1 | observed: node-test-proof.md Identity: Node's own names, never line/column/collection order |
| E1 | Explicit focused recording in Open Dough. | slice 2 |  |
| E2 | Subtests fold into their test. | slice 2 |  |
| E3 | No verdict keeps proof; a verdict clears it. | slice 2 |  |
| E4 | Concurrent jobs share one snapshot. | slice 2 |  |
| E5 | Explicit focused recording in Doughnut. | slice 5 |  |
| E6 | File Proof. | slice 3 |  |
| E7 | Folder summary. | slice 3 |  |
| E8 | Declaration problems. | slice 3 |  |
| E9 | Explanations. | slice 3 |  |
| E10 | Cucumber, pytest and Vitest unchanged. | slice 3 |  |
| X1 | Open Dough's tests/support tests and dashboard/tests (Playwright) carry no proof commitment. |  | X1 |
| X2 | No shared payload recorder. |  | X2 |
| X3 | Tests whose names are not literals have no row. |  | X3 |
| X4 | A test's subtests have no rows of their own. |  | X4 |
| X5 | Observations whose identity the published file no longer defines are not listed. |  | X5 |
| X6 | No run wall time, no CI comparison, no per-folder run cost, no staleness rule, no runtime context beyond what the format carries. |  | X6 |
| X7 | A full-suite proof refresh of either project is Terry's deliberate run after the recorders land; the story commits focused selections first. |  | X7 |
