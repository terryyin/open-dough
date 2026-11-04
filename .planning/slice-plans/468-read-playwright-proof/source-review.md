# Source review — SEED-192#read-playwright-proof

**Launch:** Fresh general-purpose reviewer (Cursor Task, no conversation
inheritance), 2026-11-04. Input: story Goal, Scope (required behavior,
constraints, exclusions), and Key examples 1–10 only. Instruction: use only
those inputs; read no other project files; change nothing; return numbered
commitments with compound items given own ids.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| G | Goal: published Playwright reference, dashboard declaration, quiet reporter + shared store, Intent shows last successful committed proof by describe path, summaries match other runners | slice 4 | observed: Slices 1–3 delivered; Intent locations+observedRowsOf at tip 25076885 show playwright proof beside dashboard specs |
| 1 | Open Dough publishes `src/skills/dough-test-optimization/references/playwright-proof.md` | slice 1 | observed: src/skills/dough-test-optimization/references/playwright-proof.md exists (new file, 302 lines) |
| 1a | That reference is linked from `dough-test-optimization` like Cucumber, pytest, Vitest and `node:test` | slice 1 | observed: src/skills/dough-test-optimization/SKILL.md links Playwright proof beside Cucumber/pytest/Vitest |
| 1b | That reference is declared by `install.sh` | slice 1 | observed: install.sh declares dough-test-optimization/references/playwright-proof.md |
| 1c | That reference is written for the agent working in the recording project | slice 1 | observed: playwright-proof.md written for recording-project agent (ADR 0006 voice; no Open Dough maintainer runtime vocabulary) |
| 2a | Recording gated by explicit project-owned option (e.g. `RECORD_PLAYWRIGHT_PROOF=1`) | slice 2 | observed: dashboard/playwright.config.ts snapshot option + proof-snapshot-basic option-off case |
| 2b | Option off in every profile, including CI | slice 2 | observed: playwright.config: RECORD_PLAYWRIGHT_PROOF never set by default; CI/package scripts unchanged |
| 2c | Normal runs leave proof byte-for-byte untouched | slice 2 | observed: Ex1 verify: without option / --list / focused normal / full suite leave latest.json byte-identical |
| 2d | Recorder prints nothing | slice 2 | observed: proof-snapshot specs: stdout empty with recording on (quiet) |
| 2e | Recorder never fails the run or changes its exit | slice 2 | observed: proof-snapshot specs: exit identical with/without option |
| 2f | Recorder records nothing outside a Git checkout | slice 2 | observed: proof-snapshot-concurrency / outside-Git case + proof-store.test.mjs outside-Git |
| 2g | One maintained `latest.json` per proof directory | slice 2 | observed: proofStore.mjs maintains latest.json; Ex1 dashboard/tests/proof/latest.json |
| 2h | Refreshed atomically after each finished case | slice 2 | observed: proofDirectoryRefresh via proofStore; proof-store-refresh.test.mjs |
| 2i | Serialized against concurrent recording runs in the same checkout | slice 2 | observed: proof-snapshot-concurrency.spec.ts concurrent writers |
| 2j | Only passing cases are recorded | slice 2 | observed: proofSnapshot.ts records only strict plain passes |
| 2k | Executed final unsuccessful result clears that case's earlier proof | slice 2 | observed: proof-snapshot-keep-clear / retries: unsuccessful clears |
| 2l | Unexecuted cases keep their earlier proof | slice 2 | observed: proof-snapshot-keep-clear: skip/unselected/interrupted keep |
| 2m | Proof commits are deliberate | slice 2 | observed: Ex1 snapshot committed deliberately as first dashboard/tests/proof/latest.json |
| 2n | Location declares `runner`, `proof` and `proofGeneration` | slice 2 | observed: .planning/open-dough.json declares runner, proof, proofGeneration on dashboard/tests |
| 3a | Recorder is a reporter in the project's configured `reporter` list | slice 2 | observed: playwright.config.ts quietReporter in configured reporter list with snapshot option |
| 3b | Loaded by every ordinary run with recording off | slice 2 | observed: config loads quiet reporter every ordinary run; snapshot false unless option |
| 3c | Command-line `--reporter` that replaces the list loads no recorder | slice 2 | observed: reference + ordinary commands use configured reporters (no --reporter on recording cmd) |
| 3d | Runs once in the runner process | slice 2 | observed: quietReporter single runner-process instance feeds proofSnapshot |
| 3e | Receives every project's and worker's results | slice 2 | observed: proofSnapshot receives all projects/workers via quietReporter events |
| 3f | Records from each test's final attempt only | slice 2 | observed: proofSnapshot.ts final-attempt rule |
| 3g | Never records from fixtures, hooks or test code | slice 2 | observed: proofSnapshot records from reporter events only |
| 4a.1 | Proof is a final attempt with status `passed` | slice 2 | observed: proofSnapshot strict status passed |
| 4a.2 | and expected status `passed` | slice 2 | observed: proofSnapshot expectedStatus passed |
| 4a.3 | that wrote nothing to stdout or stderr | slice 2 | observed: proofSnapshot no stdout/stderr |
| 4b.1 | Final `failed` clears | slice 2 | observed: proof-snapshot-keep-clear: failed clears |
| 4b.2 | Final `timedOut` clears | slice 2 | observed: proof-snapshot-keep-clear: timedOut clears |
| 4b.3 | Final `test.fail` clears | slice 2 | observed: proof-snapshot-keep-clear: test.fail clears |
| 4b.4 | Printed-output result clears | slice 2 | observed: proof-snapshot-keep-clear: printed-output clears |
| 4c.1 | Skipped (`test.skip`, `test.fixme`, body `skip()`) keeps proof | slice 2 | observed: proof-snapshot-keep-clear: skipped/fixme/body skip keep |
| 4c.2 | Interrupted result keeps proof | slice 2 | observed: proof-snapshot-keep-clear: interrupted keep |
| 4c.3 | Outside selection/project/shard/split keeps proof | slice 2 | observed: proof-snapshot-keep-clear: --grep/--project keep unselected |
| 4c.4 | Never reached by interrupted run keeps proof | slice 2 | observed: proof-snapshot-keep-clear: never-reached keep |
| 5a | `attempts` is final retry index plus one | slice 2 | observed: proof-snapshot-retries.spec.ts attempts:2 |
| 5b | `durationMs` sums the test's attempts | slice 2 | observed: proof-snapshot-retries.spec.ts summed durationMs |
| 5c | `--repeat-each` and other same-identity executions fold as Vitest | slice 2 | observed: proof-snapshot-retries.spec.ts --repeat-each=2 one observation |
| 5d | `file` is file suite path from repository root | slice 2 | observed: Ex1 + proofSnapshot: file is repo-relative file suite path |
| 5e | `file` is never `test.location.file` | slice 2 | observed: proof-snapshot-projects / helper case: not test.location.file |
| 5f | Record only files under locations with `runner: "playwright"` and `proof` | slice 2 | observed: proofStore covered locations runner playwright+proof |
| 5g | Each into its location's proof directory | slice 2 | observed: Ex1 writes into dashboard/tests/proof |
| 5h | `test` is title path after project and file | slice 2 | observed: proof-snapshot-basic describe path as title path |
| 5i | Anonymous describe adds nothing | slice 2 | observed: reference + titlePath after project/file (anonymous adds nothing) |
| 5j | `project` when more than one configured project selects the file | slice 2 | observed: proof-snapshot-projects.spec.ts two projects record project |
| 5k | `project` omitted when projects select disjoint files | slice 2 | observed: Ex1 snapshot observations omit project (disjoint Open Dough projects) |
| 5l | Event shape stated with observed Playwright version | slice 1 | observed: playwright-proof.md states event shape observed in Playwright 1.63.0 |
| 6a.1 | Snapshot field `file` | slice 2 | observed: dashboard/tests/proof/latest.json field file |
| 6a.2 | Snapshot field `test` (list) | slice 2 | observed: latest.json field test list |
| 6a.3 | Snapshot field optional `project` | slice 2 | observed: optional project field when recorded |
| 6a.4 | Snapshot field `outcome: "passed"` | slice 2 | observed: outcome passed |
| 6a.5 | Snapshot field `attempts` | slice 2 | observed: attempts |
| 6a.6 | Snapshot field `durationMs` | slice 2 | observed: durationMs |
| 6a.7 | Snapshot field `finishedAt` | slice 2 | observed: finishedAt |
| 6a.8 | Snapshot field `commit` | slice 2 | observed: commit |
| 6a.9 | Snapshot field `fileBlob` | slice 2 | observed: fileBlob |
| 6b | At most one observation per identity | slice 2 | observed: proofStore fold: at most one per identity |
| 6c | Ordered by `file`, then `test`, then `project` | slice 2 | observed: proofStore order by file,test,project |
| 6d | Playwright snapshot parses with Vitest parser | slice 3 | observed: intent-playwright-proof.spec.ts Ex6; parseVitestProofFile via playwright kind |
| 7a | `runner: "playwright"` on typescript/javascript location that declares `proof` | slice 2 | observed: .planning/open-dough.json runner playwright on dashboard/tests |
| 7b | Dashboard reads `proof` and `proofGeneration` as on any location | slice 3 | observed: intent-playwright fixtures declare proof+proofGeneration; shown in Proof |
| 7c | Declared `proof` without usable `runner` names `playwright` among runners | slice 3 | observed: undeclared-runner wording names vitest or playwright |
| 8a | Rows from published TS under test-call rule extended by one form | slice 3 | observed: vitestCases member form + intent-playwright-cases.test.mjs |
| 8b.1 | Family call: describe, suite, it, or test | slice 3 | observed: vitestCases family describe/suite/it/test |
| 8b.2 | bare or member of `test` (`test.describe`, `test.it`) | slice 3 | observed: test.describe / test.it member form |
| 8b.3 | modifier chain admits `.serial`, `.parallel`, `.fixme`, `.fail` | slice 3 | observed: .serial .parallel .fixme .fail modifiers |
| 8b.4 | names are string/template literals without substitutions | slice 3 | observed: literal/template without substitutions (existing rule) |
| 8b.5 | in definition order | slice 3 | observed: definition order in Ex6 journey |
| 8b.6 | each at its call's line | slice 3 | observed: case line at test token |
| 8b.7 | named by whole describe path | slice 3 | observed: whole describe path naming |
| 8c | Anonymous `test.describe(fn)` adds no segment | slice 3 | observed: anonymous test.describe(fn) adds no segment (unit) |
| 8d.1 | `test.describe.configure` names no case | slice 3 | observed: test.describe.configure names no case (unit) |
| 8d.2 | `test.use` names no case | slice 3 | observed: test.use names no case (unit) |
| 8d.3 | hooks name no case | slice 3 | observed: hooks name no case (unit) |
| 8d.4 | `test.step` names no case | slice 3 | observed: test.step names no case (unit) |
| 8e | Each test one Vitest-shaped row or _No successful proof_ | slice 3 | observed: Ex6 Vitest-shaped rows or No successful proof |
| 8f | Header reads Test case | slice 3 | observed: header Test case |
| 8g | Count line counts test cases | slice 3 | observed: count line counts test cases |
| 8h | Vitest and Node files keep their rows | slice 3 | observed: intent-vitest-cases + vitest journeys unchanged rows |
| 9 | Playwright location/folder summaries use Vitest figures with test words | slice 3 | observed: intent-playwright-proof Ex8 folder summary test words |
| 10a | Other-kinds sentence lists Playwright tests | slice 3 | observed: proofFamilies includes Playwright tests |
| 10b | Location without `proof` names declared runner's reference when Intent reads it, else every runner's | slice 3 | observed: unrecordedReferenceOf generalized; playwright-without-proof names playwright ref |
| 10c | Unreadable/malformed proof keep retry explanations | slice 3 | observed: malformed keeps retry (Ex9) |
| 10d | Cucumber- or pytest-shaped file under playwright location is malformed | slice 3 | observed: cucumber-shaped under playwright malformed (Ex9) |
| 11a | One proof store module in `tests/support` | slice 2 | observed: tests/support/proofStore.mjs |
| 11b.1 | atomic `latest.json` | slice 2 | observed: proofStore atomic latest.json |
| 11b.2 | lock without `.json` extension | slice 2 | observed: proofStore lock without .json |
| 11b.3 | order and fold rules | slice 2 | observed: proof-store-refresh.test.mjs order and fold |
| 11b.4 | commit and file blob | slice 2 | observed: proof-store.test.mjs commit and fileBlob |
| 11b.5 | outside-Git no-op | slice 2 | observed: proof-store.test.mjs outside-Git no-op |
| 11c | Shared with plan 467's node:test recorder (whichever lands second generalises) | slice 2 | observed: store placed for plan 467 reuse (shared module, no Playwright-only copy) |
| 12a | Snapshot producer in `dashboard/tests/support` beside ProofRecord | slice 2 | observed: dashboard/tests/support/proofSnapshot.ts |
| 12b | Fed by quiet reporter onTestBegin/onTestEnd/onEnd | slice 2 | observed: quietReporter.ts feeds proofSnapshot from onTestBegin/End/onEnd |
| 12c | Imports that store | slice 2 | observed: proofSnapshot imports proofStore.mjs |
| 12d | playwright.config passes option state like run record path | slice 2 | observed: playwright.config passes snapshot beside proofRecord/times |
| 12e | Ordinary, nested-config and CI runs load with recording off | slice 2 | observed: ordinary/CI/nested load with recording off |
| 12f | Quiet-pass rule holds | slice 2 | observed: focused proof-record + quiet-reporter still enforce quiet-pass |
| 13a | Recorder tests as dashboard specs on fixture projects in temp Git checkouts | slice 2 | observed: proof-snapshot-*.spec.ts temp Git checkouts |
| 13b | Option set only for the inner run | slice 2 | observed: proofSnapshotRun / proofRecordRun strip; option only inner |
| 13c.1 | Cover option off | slice 2 | observed: proof-snapshot-basic option off |
| 13c.2 | Cover describe path | slice 2 | observed: proof-snapshot-basic describe path |
| 13c.3 | Cover retries folding | slice 2 | observed: proof-snapshot-retries retries folding |
| 13c.4 | Cover `--repeat-each` | slice 2 | observed: proof-snapshot-retries repeat-each |
| 13c.5 | Cover skipped | slice 2 | observed: proof-snapshot-keep-clear skipped |
| 13c.6 | Cover fixme | slice 2 | observed: proof-snapshot-keep-clear fixme |
| 13c.7 | Cover test.fail | slice 2 | observed: proof-snapshot-keep-clear test.fail |
| 13c.8 | Cover timeout | slice 2 | observed: proof-snapshot-keep-clear timeout |
| 13c.9 | Cover printed-output pass clearing | slice 2 | observed: proof-snapshot-keep-clear printed-output |
| 13c.10 | Cover failure clearing only itself | slice 2 | observed: proof-snapshot-keep-clear failure clears only itself |
| 13c.11 | Cover --grep/--project leaving unselected proof | slice 2 | observed: proof-snapshot-keep-clear grep/project |
| 13c.12 | Cover two projects recording project | slice 2 | observed: proof-snapshot-projects two projects |
| 13c.13 | Cover concurrent recording runs | slice 2 | observed: proof-snapshot-concurrency concurrent runs |
| 13c.14 | Cover outside-Git no-op | slice 2 | observed: proof-store / concurrency outside-Git |
| 13c.15 | Cover helper-defined test's file | slice 2 | observed: proof-snapshot-projects helper-defined file |
| 13c.16 | Cover unchanged output and exit | slice 2 | observed: proof-snapshot-basic unchanged output/exit |
| 13d | Nested real-config runs never inherit the option | slice 2 | observed: proofRecordRun strips RECORD_PLAYWRIGHT_PROOF; Ex5 nested |
| 14a | `runner: "playwright"` on `dashboard/tests` | slice 2 | observed: open-dough.json runner playwright |
| 14b | `proof` declared (e.g. `dashboard/tests/proof`) | slice 2 | observed: open-dough.json proof dashboard/tests/proof |
| 14c | Real recording command declared | slice 2 | observed: open-dough.json proofGeneration recording command |
| 14d | One explicit focused recording run committed as first snapshot | slice 2 | observed: dashboard/tests/proof/latest.json first focused snapshot |
| 15a | Intent shows recorded files' rows and a folder summary | slice 4 | observed: intent=locations + observedRowsOf: 3 touch reading rows proved; quiet 0 listed; boundary 266 specs |
| 15b | Root summary opened once with read time and GitHub request count as learning | slice 4 | observed: Cold intent=locations ~4830ms, 1 HTTP locations request, 720 files; learning recorded under plan slice 4 |
| 15c | Terry evaluates against quiet reporter output plus editor | slice 4 | observed: Agent first-look evidence recorded in plan; Terry quiet-reporter+editor product judgment deferred to execution-complete after trunk Intent carries the tip |
| 16a | `docs/dashboard-development-intent.md` describes playwright Proof | slice 3 | observed: docs/dashboard-development-intent.md playwright beside Vitest |
| 16b | README and proof-record.md distinguish run transcript vs committed Proof | slice 2 | observed: dashboard/tests/README.md and proof-record.md distinguish records |
| 16c | Reference linked where the others are | slice 1 | observed: SKILL.md and install.sh link/declare the reference where the others are |
| C1 | Only plain strict pass records; executed non-pass clears | slice 2 | observed: proofSnapshot strict plain pass only; keep-clear specs |
| C2 | Normal runs never create/change/delete proof | slice 2 | observed: Ex1 non-recording runs leave proof unchanged |
| C3 | Missing/empty/unreadable/malformed never shown as pass | slice 3 | observed: Ex9 malformed never shown as pass |
| C4 | Identity uses Playwright title path and file suite path | slice 2 | observed: identity file suite path + title path in snapshot |
| C5 | Existing Cucumber/pytest/Vitest/node:test unchanged; member form changes no existing rows | slice 3 | observed: vitest/cucumber/pytest absence + vitest file journeys green; unit pins hold |
| C6 | Suite output, diagnostics, exit, run record, times, shard, local-suite admission unchanged | slice 2 | observed: quiet-reporter and proof-record specs green with recording off path |
| Ex1 | Explicit focused recording journey | slice 2 | observed: Ex1 recording + non-recording verify commands |
| Ex2 | Retries and repetitions fold journey | slice 2 | observed: proof-snapshot-retries.spec.ts |
| Ex3 | No verdict keeps; verdict clears journey | slice 2 | observed: proof-snapshot-keep-clear.spec.ts |
| Ex4 | Projects journey | slice 2 | observed: proof-snapshot-projects.spec.ts + Ex1 no project |
| Ex5 | Nested runs record nothing here | slice 2 | observed: RECORD_PLAYWRIGHT_PROOF=1 outer proof-record/quiet-reporter; nested strip |
| Ex6 | File Proof with describe names | slice 3 | observed: intent-playwright-proof.spec.ts file proof with describe names |
| Ex7 | Unlisted proof | slice 3 | observed: intent-playwright-proof unlisted loop/helper cases |
| Ex8 | Folder summary | slice 3 | observed: intent-playwright-proof folder summary |
| Ex9 | Declaration problems and explanations | slice 3 | observed: intent-playwright-proof declaration problems |
| Ex10 | Cucumber, pytest, Vitest and Node unchanged | slice 3 | observed: vitest/cucumber/pytest journeys green after wording-only updates |
| E1 | src/skills and tests locations carry no Playwright commitment | | E1 |
| E2 | Other projects' Cucumber Playwright suites keep Cucumber proof; no other adoption here | | E2 |
| E3 | Deferred: template-literal-with-substitutions and helper-defined tests have no row | | E3 |
| E4 | Deferred: consolidation of shared recording discipline across five references | | E4 |
| E5 | Excluded: run wall time, CI comparison, trace retention, full-suite refresh | | E5 |
