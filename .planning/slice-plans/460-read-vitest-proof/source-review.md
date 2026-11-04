# Source review: SEED-192#read-vitest-proof

Launch: a fresh general-purpose reviewer on 2026-11-04 with no conversation inheritance, given only an extract of the selected story section (Beneficiary, Goal, Scope with Constraints and Scope limits, Key examples, UI, Architecture; the readiness state block removed), told to read no other project files and change nothing. No human amendments; the rename stands as written. It returned 240 numbered commitments, reproduced below in condensed form with their ids unchanged.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| B1 | Serves a Doughnut or Pygardon developer reviewing frontend test protection in Intent, reading what a spec's tests last proved and in which browser project | slice 7 | |
| G1 | Doughnut and Pygardon record deliberate Vitest proof the way they record Cucumber proof | slice 4 | observed: doughnut main 5b2f8de6ab and pygardon main 2a48f97fd record Vitest proof only on explicit RECORD_VITEST_PROOF=1, as their Cucumber recorders record on explicit request |
| G2 | A published Open Dough reference defines the compact snapshot and the explicit recording run | slice 1 | observed: src/skills/dough-test-optimization/references/vitest-proof.md (whole reference, slice 1) |
| G3.1 | Each frontend's typescript Intent location declares its runner in .planning/open-dough.json | slice 4 | observed: doughnut .planning/open-dough.json frontend/tests and pygardon .planning/open-dough.json frontend/src: runner vitest, proof frontend/tests/proof / frontend/proof, proofGeneration.command RECORD_VITEST_PROOF=1 … test |
| G3.2 | It declares its proof directory there | slice 4 | observed: doughnut .planning/open-dough.json frontend/tests and pygardon .planning/open-dough.json frontend/src: runner vitest, proof frontend/tests/proof / frontend/proof, proofGeneration.command RECORD_VITEST_PROOF=1 … test |
| G3.3 | It declares its generation command there | slice 4 | observed: doughnut .planning/open-dough.json frontend/tests and pygardon .planning/open-dough.json frontend/src: runner vitest, proof frontend/tests/proof / frontend/proof, proofGeneration.command RECORD_VITEST_PROOF=1 … test |
| G4 | A project-owned Vitest reporter maintains the snapshot | slice 4 | observed: doughnut frontend/vitestProofReporter.ts and pygardon frontend/vitest-proof-reporter.ts maintain latest.json |
| G5 | Selecting a test file in Intent shows each test's last successful committed proof beside its TypeScript source | slice 7 | |
| G6 | The Vitest project is named on every observation that has one (chromium, chromium-touch) | slice 7 | |
| G7 | A location or folder summary gives the same figures as for Gherkin and pytest | slice 7 | |
| G8 | Extends Proof to both frontends and tests whether one reporting contract serves browser-mode and happy-dom Vitest without conflating their environments | slice 7 | |
| G9a | The story includes generating Vitest proof, declared in project configuration and produced when the project generates proof | slice 4 | observed: proofGeneration declared on both frontend locations; recording runs produced the committed snapshots |
| G9b | The rest of the story is reading that proof | slice 7 | |
| R1 | The reference lives at src/skills/dough-test-optimization/references/vitest-proof.md | slice 1 | observed: src/skills/dough-test-optimization/references/vitest-proof.md exists |
| R2 | That skill links it the way it links the Cucumber and pytest references | slice 1 | observed: src/skills/dough-test-optimization/SKILL.md links Vitest proof beside Cucumber and pytest; install.sh managed_files; tests/payload-declaration-links.sh pass |
| R3 | It is written for the agent working in the recording project (ADR 0006) | slice 1 | observed: src/skills/dough-test-optimization/references/vitest-proof.md addresses the agent in this project, no Open Dough-only vocabulary (behavior review in plan slice 1) |
| R4.1 | An explicit project-owned option turns recording on, such as RECORD_VITEST_PROOF=1 | slice 1 | observed: src/skills/dough-test-optimization/references/vitest-proof.md Configure once, first bullet |
| R4.2 | The option is off in every profile, including CI | slice 1 | observed: src/skills/dough-test-optimization/references/vitest-proof.md Configure once, first bullet |
| R4.3 | Normal runs leave proof byte-for-byte untouched | slice 1 | observed: src/skills/dough-test-optimization/references/vitest-proof.md intro paragraph 1 |
| R4.4 | The recorder prints nothing | slice 1 | observed: src/skills/dough-test-optimization/references/vitest-proof.md Configure once, unchanged-output bullet |
| R4.5 | The recorder never fails the run | slice 1 | observed: src/skills/dough-test-optimization/references/vitest-proof.md Configure once, unchanged-output bullet |
| R4.6 | The recorder records nothing outside a Git checkout | slice 1 | observed: src/skills/dough-test-optimization/references/vitest-proof.md Configure once, unchanged-output bullet |
| R4.7 | There is one maintained snapshot, latest.json | slice 1 | observed: src/skills/dough-test-optimization/references/vitest-proof.md Refresh the snapshot, first two bullets |
| R4.8 | The snapshot is refreshed atomically after each finished case | slice 1 | observed: src/skills/dough-test-optimization/references/vitest-proof.md Refresh the snapshot, first two bullets |
| R4.9 | Only passing cases are recorded | slice 1 | observed: src/skills/dough-test-optimization/references/vitest-proof.md intro paragraph 2 and Record from the reporter's results, outcome bullet |
| R4.10 | An executed final unsuccessful result clears that case's earlier proof | slice 1 | observed: src/skills/dough-test-optimization/references/vitest-proof.md intro paragraph 2 and Record from the reporter's results, outcome bullet |
| R4.11 | Unexecuted cases keep their proof | slice 1 | observed: src/skills/dough-test-optimization/references/vitest-proof.md intro paragraph 2 and Record from the reporter's results, outcome bullet |
| R4.12 | Proof is committed deliberately | slice 1 | observed: src/skills/dough-test-optimization/references/vitest-proof.md Commit proof |
| R4.13 | runner, proof and proofGeneration are declared on the location | slice 1 | observed: src/skills/dough-test-optimization/references/vitest-proof.md Configure once, declaration bullet and JSON example |
| R5.1 | The recorder is a reporter added to the configured reporters beside the existing ones, so existing output stays | slice 1 | observed: src/skills/dough-test-optimization/references/vitest-proof.md Configure once, reporters bullet |
| R5.2 | It runs once per run in the Node process and receives every project, worker and browser instance | slice 1 | observed: src/skills/dough-test-optimization/references/vitest-proof.md Record from the reporter's results, first bullet |
| R5.3 | It records from the reporter's per-case result, never from test files or setup files | slice 1 | observed: src/skills/dough-test-optimization/references/vitest-proof.md Record from the reporter's results, first bullet |
| R5.4 | A case is finished when its final result arrives, retries included | slice 1 | observed: src/skills/dough-test-optimization/references/vitest-proof.md Record, finished-case bullet |
| R5.5 | attempts is the retry count plus one | slice 1 | observed: src/skills/dough-test-optimization/references/vitest-proof.md Record, attempts bullet |
| R5.6 | durationMs is the case's duration across its attempts, as the reporter sees it | slice 1 | observed: src/skills/dough-test-optimization/references/vitest-proof.md Record, durationMs bullet (rule; retried-duration proof owed by slice 3 fixture) |
| R5.7 | A failed final result clears proof and records nothing | slice 1 | observed: src/skills/dough-test-optimization/references/vitest-proof.md Record, outcome bullet |
| R5.8 | A skipped result (skip, todo, only elsewhere, runtime skip, filter) ran nothing and keeps proof | slice 1 | observed: src/skills/dough-test-optimization/references/vitest-proof.md Record, outcome bullet |
| R5.9 | An identity executed more than once in one run records one observation, passing only when every execution passed | slice 1 | observed: src/skills/dough-test-optimization/references/vitest-proof.md Record, repeated-identity bullet |
| R5.10 | For that observation, attempts is the greatest | slice 1 | observed: src/skills/dough-test-optimization/references/vitest-proof.md Record, repeated-identity bullet |
| R5.11 | For that observation, durationMs is the sum | slice 1 | observed: src/skills/dough-test-optimization/references/vitest-proof.md Record, repeated-identity bullet |
| R5.12 | A shard records only what it ran | slice 1 | observed: src/skills/dough-test-optimization/references/vitest-proof.md Refresh the snapshot, shard sentence |
| R5.13 | The recording command runs the configured reporters with no --reporter option, so the recorder is loaded | slice 1 | observed: src/skills/dough-test-optimization/references/vitest-proof.md Configure once, no --reporter bullet |
| R6.1 | The recorder resolves the repository root with git rev-parse --show-toplevel | slice 1 | observed: src/skills/dough-test-optimization/references/vitest-proof.md Configure once, repository-root bullet |
| R6.2 | It reads the covered locations (runner "vitest" and proof) from .planning/open-dough.json | slice 1 | observed: src/skills/dough-test-optimization/references/vitest-proof.md Configure once, repository-root bullet |
| R6.3 | It records only cases of files under those locations | slice 1 | observed: src/skills/dough-test-optimization/references/vitest-proof.md Configure once, repository-root bullet |
| R6.4 | file is relative to the repository root, not Vitest's root | slice 1 | observed: src/skills/dough-test-optimization/references/vitest-proof.md Identity, file |
| R6.5 | The recorder tests itself on fixture projects, with the option set only for the inner runs | slice 1 | observed: src/skills/dough-test-optimization/references/vitest-proof.md Configure once, fixture-project bullet |
| R6.6 | The snapshot is ordered by file, test and project to limit diff noise | slice 1 | observed: src/skills/dough-test-optimization/references/vitest-proof.md Refresh the snapshot, ordering sentence |
| R6.7 | The reference's reading section states the row order Intent applies, without depending on the snapshot ordering | slice 1 | observed: src/skills/dough-test-optimization/references/vitest-proof.md Reading proof |
| F1 | The format is one JSON object {"version": 1, "observations": […]} | slice 1 | observed: src/skills/dough-test-optimization/references/vitest-proof.md File format |
| F2 | Observations are identified by file: the repository path with / separators | slice 1 | observed: src/skills/dough-test-optimization/references/vitest-proof.md Identity |
| F3 | Observations are identified by test: names from the outermost describe to the test, as Vitest formatted them, as a list | slice 1 | observed: src/skills/dough-test-optimization/references/vitest-proof.md Identity |
| F4 | Observations are identified by project: the Vitest project name, present only when the run names one | slice 1 | observed: src/skills/dough-test-optimization/references/vitest-proof.md Identity |
| F5.1 | Measured field outcome "passed" matches the other families | slice 1 | observed: src/skills/dough-test-optimization/references/vitest-proof.md File format |
| F5.2 | Measured field attempts matches the other families | slice 1 | observed: src/skills/dough-test-optimization/references/vitest-proof.md File format |
| F5.3 | Measured field durationMs matches the other families | slice 1 | observed: src/skills/dough-test-optimization/references/vitest-proof.md File format |
| F5.4 | Measured field finishedAt matches the other families | slice 1 | observed: src/skills/dough-test-optimization/references/vitest-proof.md File format |
| F5.5 | Measured field commit matches the other families | slice 1 | observed: src/skills/dough-test-optimization/references/vitest-proof.md File format |
| F5.6 | Measured field fileBlob matches the other families | slice 1 | observed: src/skills/dough-test-optimization/references/vitest-proof.md File format |
| F6 | Vitest's task ids, which encode collection order, are never recorded | slice 1 | observed: src/skills/dough-test-optimization/references/vitest-proof.md Identity |
| F7 | A file holds at most one observation per identity | slice 1 | observed: src/skills/dough-test-optimization/references/vitest-proof.md File format |
| D1 | A typescript or javascript location that declares proof also declares runner, here "vitest" | slice 6 | |
| D2 | runner selects how the location's proof files are read | slice 6 | |
| D3 | Gherkin and python locations keep implying their runner | slice 5 | |
| D4 | The dashboard reads proof and proofGeneration on the location exactly as on a Gherkin one | slice 6 | |
| D5 | A declared proof without a usable runner is explained as that setting's problem on that location | slice 6 | |
| D6 | That explanation does not hide the location's source or inventory | slice 6 | |
| FP1 | Rows come from the published TypeScript text, in source order | slice 6 | |
| FP2 | Every it or test call yields a row, with or without a modifier chain (such as .each, .for, .skip, .only, .todo, .concurrent, .skipIf(…)) | slice 6 | |
| FP3 | The call's name must be a string literal or a template literal without substitutions | slice 6 | |
| FP4 | The row is named by the enclosing describe or suite names, under the same literal rule | slice 6 | |
| FP5 | Each row carries its call's line | slice 6 | |
| FP6.1 | A .each/.for name is a template; observed names fitting placeholder %s expand to one row each | slice 6 | |
| FP6.2 | Placeholder %d | slice 6 | |
| FP6.3 | Placeholder %i | slice 6 | |
| FP6.4 | Placeholder %f | slice 6 | |
| FP6.5 | Placeholder %j | slice 6 | |
| FP6.6 | Placeholder %o | slice 6 | |
| FP6.7 | Placeholder %# | slice 6 | |
| FP6.8 | Placeholder %$ | slice 6 | |
| FP6.9 | Placeholder %% | slice 6 | |
| FP6.10 | Placeholder $field | slice 6 | |
| FP6.11 | Placeholder $field.path | slice 6 | |
| FP7 | Expanded rows appear in code-point order of the observed name | slice 6 | |
| FP8 | A template without placeholders names one case | slice 6 | |
| FP9 | A test observed under several projects shows one row per observed project | slice 6 | |
| FP10 | Those project rows appear in code-point order of the project name | slice 6 | |
| FP11 | Each project row is named with its project, as an outline row is named with its example cells | slice 6 | |
| FP12 | A test with no observation shows one row reading No successful proof | slice 6 | |
| FP13.1 | Each observed row shows last successful proof, with attempts | slice 6 | |
| FP13.2 | Duration | slice 6 | |
| FP13.3 | Time since | slice 6 | |
| FP13.4 | Commit | slice 6 | |
| FP13.5 | Whether the test file's published blob is the one observed | slice 6 | |
| FP14 | The header reads Test case | slice 6 | |
| FP15 | The count line counts test cases | slice 6 | |
| S1.1 | Summary: an inventory line counting tests from the read files | slice 6 | |
| S1.2 | Summary: the proof count line, over cases | slice 6 | |
| S1.3 | Summary: summed last successful duration, with coverage and the separate-observations note | slice 6 | |
| S1.4 | Summary: slowest cases | slice 6 | |
| S1.5 | Summary: a per-child breakdown | slice 6 | |
| S1.6 | Summary: Partial labelling while files are being read or have failed | slice 6 | |
| S1.7 | Summary: drill-down to a file, or to a case's definition line | slice 6 | |
| S1.8 | Summary: the generation instruction | slice 6 | |
| S2 | Wording says tests and test cases where Gherkin says scenarios | slice 6 | |
| E1 | A typescript or javascript location without proof says proof is not recorded | slice 6 | |
| E2 | That explanation names the Vitest reference | slice 6 | |
| E3 | A kind with no proof reading yet says which families Proof is read for so far, Vitest tests included | slice 6 | |
| E4 | Unreadable and malformed proof keep their retry explanations | slice 6 | |
| E5 | A proof file shaped for another family, under a Vitest location, is malformed | slice 6 | |
| A1 | Adoption happens in subordinate Doughnut and Pygardon workspaces of this execution, as plan 446 did | slice 2 | observed: plan slice 2 retained workspaces: ~/git/doughnut.worktrees/read-vitest-proof and ~/git/pygardon.worktrees/read-vitest-proof, prepared, as plan 446 did |
| A2 | Each project gets a project-owned Vitest reporter that follows the reference | slice 4 | observed: doughnut frontend/vitestProofReporter.ts and pygardon frontend/vitest-proof-reporter.ts, each project-owned, following vitest-proof.md |
| A3 | The reporter is loaded by the ordinary local and CI commands, with recording off |  | G4 |
| A4 | It shares the project's existing proof store, where that keeps one store per project | slice 4 | observed: doughnut e2e_test/config/proofStore.mjs and pygardon e2e_test/plugins/proofStore.mts shared by each project's Cucumber recorder and Vitest reporter; Cucumber proof byte-identical |
| A5.1 | Reporter tests on fixture projects cover option off | slice 4 | observed: doughnut:frontend/vitestProofReporter.test.mjs and pygardon:tests/vitest-proof-recorder.test.mjs option-off tests: no file, no lock |
| A5.2 | A nested describe path | slice 4 | observed: doughnut:frontend/vitestProofReporter.test.mjs identity test and pygardon:tests/vitest-proof-recorder.test.mjs nested describe test |
| A5.3 | An each table with placeholders | slice 4 | observed: doughnut:frontend/vitestProofReporter.test.mjs and pygardon:tests/vitest-proof-recorder.test.mjs %i table tests: adds 1, adds 2 |
| A5.4 | An each table without placeholders | slice 4 | observed: doughnut:frontend/vitestProofReporter.test.mjs and pygardon:tests/vitest-proof-recorder.test.mjs placeholder-less table tests: summed duration, one failing row clears |
| A5.5 | A retried pass | slice 4 | observed: doughnut:frontend/vitestProofReporter.test.mjs and pygardon:tests/vitest-proof-recorder.test.mjs retry tests: retryCount 1, attempts 2 |
| A5.6 | A failure clearing only itself | slice 4 | observed: doughnut:frontend/vitestProofReporter.test.mjs and pygardon:tests/vitest-proof-recorder.test.mjs failure-clears-only-itself tests |
| A5.7 | skip | slice 4 | observed: doughnut:frontend/vitestProofReporter.test.mjs and pygardon:tests/vitest-proof-recorder.test.mjs skip/todo/only/filter tests keep proof |
| A5.8 | only | slice 4 | observed: doughnut:frontend/vitestProofReporter.test.mjs and pygardon:tests/vitest-proof-recorder.test.mjs skip/todo/only/filter tests keep proof |
| A5.9 | A shard | slice 4 | observed: doughnut:frontend/vitestProofReporter.test.mjs and pygardon:tests/vitest-proof-recorder.test.mjs --shard=1/2 tests leave the other shard's observation |
| A5.10 | An interrupted refresh | slice 4 | observed: doughnut:frontend/vitestProofReporter.test.mjs and pygardon:tests/vitest-proof-recorder.test.mjs interrupted-refresh tests (SIGKILL after first refresh) |
| A5.11 | In Doughnut only, the same file under two browser instances | slice 4 | observed: doughnut:frontend/vitestProofReporter.test.mjs two-project test: two observations per test, one project's failure clears only its own (named Node projects chromium/chromium-touch); real browser instances observed in doughnut frontend/tests/proof/latest.json |
| A6.1 | runner is declared on the frontend location | slice 4 | observed: doughnut .planning/open-dough.json frontend/tests and pygardon .planning/open-dough.json frontend/src: runner vitest, proof frontend/tests/proof / frontend/proof, proofGeneration.command RECORD_VITEST_PROOF=1 … test |
| A6.2 | proof is declared there, for example frontend/tests/proof and frontend/proof | slice 4 | observed: doughnut .planning/open-dough.json frontend/tests and pygardon .planning/open-dough.json frontend/src: runner vitest, proof frontend/tests/proof / frontend/proof, proofGeneration.command RECORD_VITEST_PROOF=1 … test |
| A6.3 | The real recording command is declared there | slice 4 | observed: doughnut .planning/open-dough.json frontend/tests and pygardon .planning/open-dough.json frontend/src: runner vitest, proof frontend/tests/proof / frontend/proof, proofGeneration.command RECORD_VITEST_PROOF=1 … test |
| A7 | One explicit focused recording run is committed as the first snapshot | slice 4 | observed: doughnut frontend/tests/proof/latest.json (5 observations) and pygardon frontend/proof/latest.json (17), each from one focused explicit run |
| A8 | In Doughnut, that run covers one plain spec and one touch spec | slice 4 | observed: doughnut frontend/tests/proof/latest.json: titlePatternRender.spec.ts (plain) and DonutMenu.search.touch.spec.ts (touch) |
| A9 | Each project's publication follows that project's own rules | slice 4 | observed: doughnut main 5b2f8de6ab and pygardon main 2a48f97fd, each committed under its AGENTS.md wrap-up (format:changed once, check-only lint hook) and pushed |
| RR1 | With both snapshots published, Intent on Doughnut shows the recorded specs' cases with their projects | slice 7 | |
| RR2 | Intent on Doughnut shows a folder summary | slice 7 | |
| RR3 | Intent on Pygardon shows the recorded file's cases | slice 7 | |
| RR4 | Intent on Pygardon shows a folder summary | slice 7 | |
| RR5 | Each frontend root summary is opened once, and its read time and GitHub request count are recorded as a learning | slice 7 | |
| RR6 | Terry evaluates against vitest run output plus an editor | slice 7 | |
| DOC1.1 | docs/dashboard-development-intent.md describes Vitest Proof beside Gherkin and pytest | slice 6 | |
| DOC1.2 | It describes the runner declaration | slice 6 | |
| DOC1.3 | It describes project rows | slice 6 | |
| DOC2 | The reference is linked wherever the other references are | slice 6 | |
| C1 | Only a plain pass records proof | slice 4 | observed: doughnut:frontend/vitestProofReporter.test.mjs and pygardon:tests/vitest-proof-recorder.test.mjs: only passed final results record; failed clears; skipped keeps |
| C2 | An executed non-pass clears proof, for that project only | slice 4 | observed: doughnut:frontend/vitestProofReporter.test.mjs two-project test: failure clears only that project's observation |
| C3 | Proof must not claim behavior a case did not pass | slice 4 | observed: doughnut:frontend/vitestProofReporter.test.mjs and pygardon:tests/vitest-proof-recorder.test.mjs: only passed final results record; failed clears; skipped keeps |
| C4 | Normal runs never create, change or delete proof | slice 4 | observed: doughnut:frontend/vitestProofReporter.test.mjs and pygardon:tests/vitest-proof-recorder.test.mjs option-off tests; full frontend suites (doughnut 2457, pygardon 1185 passed) wrote no proof |
| C5 | Missing, empty, unreadable or malformed proof is never shown as a pass | slice 6 | |
| C6 | Identity uses Vitest's own formatted names and project names, never task ids or collection order | slice 1 | observed: src/skills/dough-test-optimization/references/vitest-proof.md Identity, task-id sentence |
| C7 | The reference recommends placeholders in each names so that each row is its own case | slice 1 | observed: src/skills/dough-test-optimization/references/vitest-proof.md Identity, placeholder paragraph |
| C8 | Intent orders a template's observed rows and a test's project rows itself, by code point; never depends on snapshot order | slice 6 | |
| C9 | Existing Cucumber and pytest proof files, reader behavior, and wording for their locations stay unchanged | slice 6 | |
| C10.1 | With the reporter loaded, each frontend's output stays as it is | slice 4 | observed: doughnut:frontend/vitestProofReporter.test.mjs and pygardon:tests/vitest-proof-recorder.test.mjs output-equality tests (stdout, stderr, exit with recorder loaded, recording on and off); doughnut real run output diff empty |
| C10.2 | Diagnostics | slice 4 | observed: doughnut:frontend/vitestProofReporter.test.mjs and pygardon:tests/vitest-proof-recorder.test.mjs output-equality tests (stdout, stderr, exit with recorder loaded, recording on and off); doughnut real run output diff empty |
| C10.3 | Exit meaning | slice 4 | observed: doughnut:frontend/vitestProofReporter.test.mjs and pygardon:tests/vitest-proof-recorder.test.mjs output-equality tests (stdout, stderr, exit with recorder loaded, recording on and off); doughnut real run output diff empty |
| C10.4 | Browser instances | slice 4 | observed: doughnut real run kept chromium and chromium-touch instances; vitest.config.ts instances unchanged |
| C10.5 | Retries | slice 4 | observed: doughnut vitest.config.ts retry: isCI ? 1 : 0 unchanged; pygardon config has no retry |
| C10.6 | Sharding | slice 4 | observed: doughnut CI shards run pnpm frontend:test --shard unchanged; doughnut:frontend/vitestProofReporter.test.mjs shard test |
| C10.7 | CI reporters | slice 4 | observed: doughnut vitest.config.ts CI reporters [default, orchestratorGcReporter(), recorder]; pygardon CI --reporter=./vitest-quiet-reporter.ts unchanged (G4) |
| X1 | Exclusion: only the two frontend locations are in scope | slice 4 | observed: only doughnut frontend/tests and pygardon frontend/src declare runner vitest |
| X2 | Exclusion: no proof delivery for Doughnut's CLI Vitest, dashboard Playwright tests, or node:test files; row derivation serves them anyway | slice 6 | |
| X3.1 | Exclusion: no run wall time | slice 6 | |
| X3.2 | Exclusion: no CI comparison | slice 6 | |
| X3.3 | Exclusion: no per-folder run cost | slice 6 | |
| X3.4 | Exclusion: no staleness or expiry rule | slice 6 | |
| X3.5 | Exclusion: no browser or runtime context beyond the project name | slice 6 | |
| X4 | Exclusion: non-literal or dynamically built tests are not derived from source; their observations stay in the snapshot | slice 6 | |
| X5 | Exclusion: observations whose identity the published file no longer defines are not listed | slice 6 | |
| X6 | Exclusion: includeTaskLocation not required; definition lines come from the source rule | slice 6 | |
| X7 | Exclusion: a cheaper root summary is deferred; this story measures and does not create it | slice 7 | |
| X8 | Exclusion: full-suite proof refresh is Terry's deliberate run; this story commits focused selections first | slice 4 | observed: both snapshots are focused selections; no full-suite refresh |
| K1.1 | Doughnut focused browser-mode run: latest.json holds one passing observation per executed case | slice 4 | observed: doughnut frontend/tests/proof/latest.json: 5 passing observations, one per executed case |
| K1.2 | The plain spec's observations have project "chromium" | slice 4 | observed: 3 titlePatternRender.spec.ts observations with project chromium |
| K1.3 | The touch spec's observations have project "chromium-touch" | slice 4 | observed: 2 DonutMenu.search.touch.spec.ts observations with project chromium-touch |
| K1.4 | Each observation has file | slice 4 | observed: doughnut latest.json observations: file, test [describe, name], commit f08c51e4ce (HEAD at run), fileBlob = git hash-object |
| K1.5 | Each has test as its describe path and name | slice 4 | observed: doughnut latest.json observations: file, test [describe, name], commit f08c51e4ce (HEAD at run), fileBlob = git hash-object |
| K1.6 | Each has commit at run start | slice 4 | observed: doughnut latest.json observations: file, test [describe, name], commit f08c51e4ce (HEAD at run), fileBlob = git hash-object |
| K1.7 | Each has the spec's fileBlob | slice 4 | observed: doughnut latest.json observations: file, test [describe, name], commit f08c51e4ce (HEAD at run), fileBlob = git hash-object |
| K1.8 | The run's output and exit match the same run without the option | slice 4 | observed: slice 4 real run: stdout/stderr diff with plain run empty after timing mask, exit 0 |
| K1.9 | The same command without the option changes nothing under frontend/tests/proof | slice 4 | observed: slice 4 run without option: proof tree hash ceecbf4e unchanged, no lock |
| K2.1 | Pygardon focused run: frontend/proof/latest.json holds that file's 17 cases | slice 3 | observed: Pygardon frontend/proof/latest.json from the slice 3 real run: version 1, 17 observations of frontend/src/api/__tests__/verifyStatsFormat.test.ts, no project field, commit 8dc7cad1a, fileBlob = git hash-object |
| K2.2 | None of them has a project field | slice 3 | observed: Pygardon frontend/proof/latest.json from the slice 3 real run: version 1, 17 observations of frontend/src/api/__tests__/verifyStatsFormat.test.ts, no project field, commit 8dc7cad1a, fileBlob = git hash-object |
| K2.3 | The same command without the option changes nothing under frontend/proof | slice 3 | observed: slice 3 run without the option and the check-prepared-checkout.sh frontend line (vitest run --reporter=./vitest-quiet-reporter.ts): latest.json sha256 unchanged, no lock |
| K2.4 | scripts/check-prepared-checkout.sh changes nothing under frontend/proof | slice 3 | observed: slice 3 run without the option and the check-prepared-checkout.sh frontend line (vitest run --reporter=./vitest-quiet-reporter.ts): latest.json sha256 unchanged, no lock |
| K3.1 | it.each([1, 2])("adds %i") passes, giving observations adds 1 and adds 2 | slice 4 | observed: doughnut:frontend/vitestProofReporter.test.mjs and pygardon:tests/vitest-proof-recorder.test.mjs %i table tests |
| K3.2 | it.each([a, b])("renders equivalent escapes") with one row failing gives no observation for that name | slice 4 | observed: doughnut:frontend/vitestProofReporter.test.mjs and pygardon:tests/vitest-proof-recorder.test.mjs placeholder-less table tests |
| K3.3 | In that case, the name's earlier observation is removed | slice 4 | observed: doughnut:frontend/vitestProofReporter.test.mjs and pygardon:tests/vitest-proof-recorder.test.mjs placeholder-less table tests |
| K3.4 | With both rows passing, one observation with the two executions' summed duration | slice 4 | observed: doughnut:frontend/vitestProofReporter.test.mjs and pygardon:tests/vitest-proof-recorder.test.mjs placeholder-less table tests |
| K4.1 | A case passing on its second attempt under retry: 1 gives one observation with attempts: 2 | slice 4 | observed: doughnut:frontend/vitestProofReporter.test.mjs and pygardon:tests/vitest-proof-recorder.test.mjs retry tests: attempts 2 |
| K4.2 | A later explicit run in which it fails removes its observation | slice 4 | observed: doughnut:frontend/vitestProofReporter.test.mjs and pygardon:tests/vitest-proof-recorder.test.mjs failure-clearing tests remove an earlier observation |
| K4.3 | Intent then reads No successful proof until a later pass restores it | slice 6 | |
| K4.4 | A skipped or filtered-out case keeps its proof | slice 4 | observed: doughnut:frontend/vitestProofReporter.test.mjs and pygardon:tests/vitest-proof-recorder.test.mjs skip/only/filter tests |
| K4.5 | A run of one shard leaves the other shard's cases as they were | slice 4 | observed: doughnut:frontend/vitestProofReporter.test.mjs and pygardon:tests/vitest-proof-recorder.test.mjs shard tests |
| K5.1 | A touch spec's cases observed under chromium-touch give one row per case, naming that project | slice 6 | |
| K5.2 | A file observed under both instances gives two rows per test | slice 6 | |
| K5.3 | chromium comes before chromium-touch, whatever order the snapshot holds | slice 6 | |
| K5.4 | Each of those rows has its own proof | slice 6 | |
| K5.5 | A failure in one instance clears only that project's observation | slice 4 | observed: doughnut:frontend/vitestProofReporter.test.mjs two-project failure test |
| K6.1.1 | titlePatternRender.spec.ts File Proof column: Test case | slice 7 | |
| K6.1.2 | Column: Last successful proof | slice 7 | |
| K6.1.3 | Column: Duration | slice 7 | |
| K6.1.4 | Column: Observed | slice 7 | |
| K6.1.5 | Column: Commit | slice 7 | |
| K6.1.6 | Column: Observed on | slice 7 | |
| K6.2 | Rows are in definition order, named by their describe path and name | slice 7 | |
| K6.3 | A template row expands to its observed names in code-point order, even when the snapshot holds another order | slice 6 | |
| K6.4 | The count line reads, for example, "Last successful proof: 3 test cases: 3 passed" | slice 7 | |
| K6.5 | When opened from a summary, the Purpose pane positions on the row's it line | slice 6 | |
| K7.1 | frontend/tests/utils summary: "N tests", counted from the read files | slice 7 | |
| K7.2 | The proof count line, over cases | slice 7 | |
| K7.3 | Summed duration with "over M of N test cases" | slice 7 | |
| K7.4 | The separate-observations note | slice 7 | |
| K7.5 | Slowest cases | slice 7 | |
| K7.6 | Children with their sums | slice 7 | |
| K7.7 | Partial labelling and unread-file retry, as for Gherkin | slice 6 | |
| K7.8 | A child name opens that file's Purpose and Proof | slice 7 | |
| K8.1 | frontend/tests with proof but no runner: the location explains runner is not declared for its proof | slice 6 | |
| K8.2 | In that case, its files and inventory stay readable | slice 6 | |
| K8.3 | runner "vitest" with a pytest-shaped proof file shows "Proof could not be read: … is not a valid proof file", with Retry | slice 6 | |
| K9.1 | frontend/src before adoption: "Proof is not recorded for this project. To configure deliberate proof generation, follow dough-test-optimization/references/vitest-proof.md …" | slice 6 | |
| K9.2 | A shell location says Proof is read for Gherkin feature files, pytest files and Vitest tests so far | slice 6 | |
| K10.1 | Gherkin locations and Pygardon's tests location show the same rows, wording and summaries as before | slice 6 | |
| U1 | Vitest Proof reuses the Gherkin table and summary layouts | slice 6 | |
| U2 | The unit words change to Test case, tests and test cases | slice 6 | |
| U3 | A row's variant is its project where one is observed, as an outline row shows its example cells | slice 6 | |
| U4 | Rows are named by the whole describe path | slice 6 | |
| U5 | The row derivation follows nesting in the TypeScript text rather than scanning lines | slice 5 | |
| U6 | The full path is kept because a bare it name repeats across suites | slice 6 | |
| U7 | Selecting frontend/tests reads its source files for the summary; the story keeps the shared behavior and measures it | slice 7 | |
| X9 | Exclusion: no layout, component or technology is chosen here | slice 6 | |
| AR1 | The case model gains its third family, the first where a location's kind does not determine its proof format | slice 6 | |
| AR2 | runner on the location selects the proof parser and, within the kind, the row derivation | slice 6 | |
| AR3 | Leaves room for typescript Playwright and javascript node:test proof later without a second settings shape | slice 5 | |
| AR4 | The project is the variant: one identity rule and one latest-first reduction across families | slice 6 | |
| AR5 | The Intent answer names cases by the model's file, name path and variant, replacing the Cucumber names | slice 5 | |
| AR6 | The TypeScript row derivation is a nesting-aware reading of test calls shared by every runner of that call family | slice 5 | |
| AR7 | Proof stays a repository record read as a published fact | slice 6 | |
| AR8 | runner is project-owned configuration in the same settings file | slice 5 | |
| AR9 | In each project, the reporter is the second producer of the project's one proof store | slice 4 | observed: doughnut e2e_test/config/proofStore.mjs, pygardon e2e_test/plugins/proofStore.mts: the reporter is the store's second producer |
| AR10 | The project generalizes that store to the shared observation shape rather than adding a second store | slice 4 | observed: the shared stores take a ProofFormat (identity, order, identifies) with the Cucumber format kept separate; no second store |
| X10 | Exclusion: design within the product, not an ADR proposal; no conflict, exception or North Star topic | slice 7 | |
