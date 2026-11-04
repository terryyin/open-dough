# Read Open Dough dashboard Playwright proof

**Identity:** SEED-192#read-playwright-proof
**Source:** [selected story](../../seeds/SEED-192-review-product-intent.md#read-playwright-proof)
in SEED-192, refined 2026-11-04 under Terry's instruction to use what the
Cucumber, pytest, Vitest and Node proof stories taught, keep the
architecture cohesive and add no duplicate.
**Source review:** [source-review.md](source-review.md)
**Prepared:** 2026-11-04. Planning only, in the story's established workspace
(branch `claude/read-open-dough-dashboard-playwright-proof`, agent
yusuke-chan), continuing the refinement in the same session.

## Goal and boundaries

An Open Dough developer selecting a spec file under `dashboard/tests` in
Intent sees each Playwright test's last successful committed proof beside
its TypeScript source, named by its `test.describe` path as the quiet
reporter names it, and a location or folder summary gives the Gherkin
summary's figures in test words. Open Dough records that proof deliberately:
the suite's own quiet reporter maintains the snapshot under a published
Open Dough `playwright` proof reference, through one proof store module
shared with the `node:test` recorder plan 467 introduces, declared with
`runner: "playwright"`, `proof` and `proofGeneration` on `dashboard/tests`.
The snapshot is the Vitest proof format, `project` included, so the
dashboard gains a runner registration and one call form in the shared row
rule, not a Playwright-shaped parser or reader. The story's ten key
examples are the evaluation; Terry judges the first experience against the
quiet reporter's output plus an editor.

Included: the reference; the store module (when plan 467 has not landed
it), the snapshot producer in the quiet reporter, its option, declaration
and first snapshot; the row rule's member call form and Playwright
modifiers; the dashboard's runner registration, words, explanations and
documentation; one real reading. Excluded, as the story records: proof for
`src/skills` and `tests`, other projects' adoption, rows for loop-generated
or helper-defined tests, consolidation of the five references' shared
discipline, run wall time, CI comparison, trace retention, a full-suite
refresh.

Apply this repository's
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
throughout. Local full suites follow `tests/local-test-resources.md`: Bash
5 on PATH, and on AC power `caffeinate -s -i` around the run
([machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos)).

## Direction and PFE

- **Reader: reuse, register, one call form.** The proof kind registry
  (`dashboard/src/proofKinds.ts`) resolves a `typescript` or `javascript`
  location's kind by its declared `runner` through `runnerProofKinds`; a
  kind contributes `parseFile`, `rowsOf` and `words`, and every other rule
  lives in the case model (`dashboard/src/proofCases.ts`). A `playwright`
  kind reuses `parseVitestProofFile` (`dashboard/src/vitestProof.ts`), whose
  optional `project` already fits a file several Playwright projects run,
  and `vitestRowsOf` (`dashboard/src/vitestCases.ts`) with Playwright's
  words. The row rule reads `describe`, `suite`, `it` and `test` only as
  bare calls, so a named `test.describe` is read through and its tests lose
  their prefix; the rule gains the family name as a member of `test`
  (`test.describe`, which Node also offers as an alias, `test.it`), with
  Playwright's `.serial`, `.parallel`, `.fixme` and `.fail` added to the
  modifier set, the case line staying the line of the `test` token. An
  anonymous `test.describe(fn)` has no literal name and is read through, as
  today, matching Playwright's title path. Plan 465 (Taken) edits
  `vitestCases.ts` and `scriptTokens.ts`: at Take, fetch trunk and add the
  form to the current file; a runner-neutral rename of the Vitest-named
  modules stays a later refactor.
- **Explanations: the generalized rule.** Plan 467 generalizes
  `unrecordedReferenceOf` to "the declared runner's reference when Intent
  reads that runner, otherwise every runner's" and lets `RunnerProblem` and
  the other-kinds sentence read `proofRunners` and `proofFamilies`. When
  plan 467 has landed, registering `playwright` is the whole change; when
  it has not, this story makes that generalization, and plan 467 then
  registers into it.
- **Recorder: a second consumer of the quiet reporter's events, one
  store.** `dashboard/tests/support/quietReporter.ts` already calls
  `ProofRecord.begin`, `end` and `finish` from `onTestBegin`, `onTestEnd`
  and `onEnd`, and `dashboard/playwright.config.ts` passes it
  `{ proofRecord, times }` from the environment. A sibling
  `dashboard/tests/support/proofSnapshot.ts` receives the same events,
  decides each test's final attempt and strict verdict, and writes through
  the store; the config passes `snapshot: process.env["RECORD_PLAYWRIGHT_PROOF"] === "1"`
  beside the other options, so every ordinary, CI and nested-config run
  loads it with recording off. The store is one runner-neutral module,
  `tests/support/proofStore.mjs` (atomic `latest.json`, a lock without the
  `.json` extension, order by `file`, `test`, `project`, fold rules, commit
  at run start and `git hash-object` per file, outside-Git no-op, covered
  locations from `.planning/open-dough.json` at `git rev-parse --show-toplevel`),
  tested through `bash scripts/test.sh`; plan 467 names the same store for
  its `node:test` recorder. Whichever plan executes first writes the module;
  the second imports it, extracting it from the first's reporter when the
  first kept it inline. A TypeScript reporter loaded by Playwright imports
  a sibling `.mjs` module (observed below), as the config already imports
  `scripts/local-test-suite.mjs`.
- **Run record kept, distinct.** `ProofRecord` keeps its contract (a
  caller-owned absolute path, refused when present, one run's transcript);
  plan 463 (Taken) reads it per CI shard. The snapshot is committed Proof.
  `dashboard/tests/proof-record.md` and `dashboard/tests/README.md` say
  which is which; the run record's atomic writer is not the store.
- **Nested runs.** `dashboard/tests/support/proofRecordRun.ts` strips
  `OPEN_DOUGH_DASHBOARD_PROOF_RECORD` and `OPEN_DOUGH_DASHBOARD_TIMES` from
  the environment of nested runs and writes each nested run a scratch
  config naming the quiet reporter with explicit options. The snapshot
  tests use the same route with a temporary Git checkout as the nested
  run's working directory, holding its own `.planning/open-dough.json`,
  spec files and proof directory, and `RECORD_PLAYWRIGHT_PROOF` is stripped
  there so an outer run with the option never records a nested run's cases
  into this checkout.
- **Reference: beside the others, same discipline, shared format.**
  `src/skills/dough-test-optimization/references/playwright-proof.md` keeps
  the Vitest reference's recording discipline and states the snapshot
  format by its own fields as the Vitest format with `project`, with the
  Playwright rules the story records (configured reporter and the
  `--reporter` warning, runner-process events, final attempt, strict pass,
  keep and clear rules, `attempts` and summed `durationMs`, repetitions
  fold, `file` from the file suite, `test` as the title path, `project`
  when more than one configured project selects the file, the observed
  Playwright version).

Accepted decisions: Proof stays a repository record read as a published
fact and `runner` stays project-owned configuration
([ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md));
one Proof concept and identity rule across runners
([ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md));
reuse before new machinery, with safe stopping points
([ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md));
the reference is written for the executing agent in the recording project
([ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)).
No ADR conflict; no North Star topic is needed.

## Decisive premises

| Premise | Consuming operation, observed form, revision | Result | Unverified remainder |
| --- | --- | --- | --- |
| Playwright names a test by `["", project, file, …describes, title]`, omits an anonymous describe, assigns a helper-defined test to the spec's file suite, and the dashboard suite's selection is known | `--list` of the dashboard suite into a throwaway run record through `OPEN_DOUGH_DASHBOARD_PROOF_RECORD`, Playwright 1.63.0, Node 24.21.0, worktree at `0363ca1f1`, 2026-11-04 | True: 2,005 selections, 723 files (711 specs, 12 helpers holding 35 tests), `phase: "listed"`, 1,378/615/12 tests at depth 0/1/2, no empty describe title | — |
| The shared row rule misnames tests under `test.describe`, and the member call form corrects every such name without changing a Vitest row | Scratch script running `vitestRowsOf` over the 711 specs against the listed title paths, before and after a scratch edit of `vitestCases.ts` (member form plus four modifiers), then `bash scripts/test.sh tests/support/intent-vitest-cases.test.mjs tests/support/intent-vitest-case-templates.test.mjs tests/support/intent-vitest-proof.test.mjs tests/support/intent-proof-runner.test.mjs` under the edit; edit reverted, 2026-11-04 | True: before, 1,065 of 1,496 reader names agree and 450 carry a describe prefix the reader omits; after, all 1,470 reader names agree, 500 Playwright names (all loop-generated) stay unlisted, no reader-only name remains; the four existing test files pass under the edit | Slice 3's unit tests pin the form on Vitest and Node fixtures as well |
| A Playwright-shaped snapshot in the Vitest format parses and attaches to a real spec's rows | Scratch script: a snapshot built from `accessible-board-touch.spec.ts`'s three listed title paths, `parseVitestProofFile`, `latestProofOf`, `observedRowsOf` under the scratch edit, 2026-11-04 | True: 3 parsed, 3 of 3 rows observed at lines 42, 129 and 177, named `touch reading > …` | — |
| Intent reads no `playwright` proof today and names Vitest's reference for a `typescript` location without proof | Same scratch script: `proofKindOf("typescript", "playwright")`, `runnerProblemOf`, `unrecordedReferenceOf("typescript", undefined)`, `proofFamilies` | True: undefined, `"unsupported"`, `vitest-proof.md`, three families; slice 3 changes all four | — |
| A reporter receives one `onTestEnd` per attempt with status, retry index, the test's retries, expected status, per-attempt duration and captured output; skip, fixme, body skip, `test.fail`, printed output, timeout, `--project`, `--repeat-each` arrive as the story records | Throwaway reporter under a scratch config in the job's temporary directory (`retries: 1`, two projects selecting one file), `playwright test` and `playwright test --repeat-each=2 -g "plain pass" --project=alpha`, Playwright 1.63.0, 2026-11-04 | True: see the story's observed facts; `config.projects` lists both projects under `--project`, the root suite only the selected one | — |
| A TypeScript reporter loaded by Playwright imports a sibling `.mjs` module | Scratch `probe2.ts` importing `./store-probe.mjs`, `playwright test --list` under the scratch config, 2026-11-04 | True: the reporter printed the imported value | — |
| The quiet reporter is loaded through the config with options from the environment, and a nested run's environment is filtered | `dashboard/playwright.config.ts` lines 67–73 and `proofRecordRun.ts` lines 41–50 at `0363ca1f1` | Presence: the route exists; slice 2's first test is its first run with the new option | Slice 2 observes it |
| Plans 465, 466, 467 touch files this story edits | Plan headers at `0363ca1f1`: 465 edits `scriptTokens.ts`, `vitestCases.ts` and the Vitest journeys; 466 edits `scripts/test.sh` and `scripts/local-test-suite.mjs`; 467 adds `tests/support/node-test-proof-reporter.mjs` with its store, registers `node:test` in `proofKinds.ts`, edits `IntentProofProblem.tsx` and the docs | True, overlapping hunks with 467 in `proofKinds.ts`, `IntentProofProblem.tsx` and the docs, and with 465 in `vitestCases.ts` | At Take, fetch trunk; while any is unlanded, edit the current files and expect a rebase; never duplicate their repairs; when 467 has landed, import its store instead of writing one |

## Outside-in proof

| Story example | Owning slice | Observable signal |
| --- | --- | --- |
| Reference usable by the recording agent | 1 and 2 | AGENTS.md behavior review walking examples 1–5 against the reference text; slice 2 implements from the reference alone and reports every gap it had to fill, fixed in the reference in the same slice |
| 1 focused recording, option off, `--list`, CI shard and full run unchanged | 2 | Snapshot tests through nested runs in a temporary checkout: option off leaves no file, a run with it writes `latest.json`, stdout, stderr and exit identical with and without; then the real run of example 1 commits `dashboard/tests/proof/latest.json`; `--list` and a focused normal run afterwards leave it byte-identical; CI never sets the option |
| 2 retries and repetitions fold | 2 | Snapshot test: `--retries=1` on a fixture failing first and passing second gives `attempts: 2` and the summed duration; `--repeat-each=2` gives one observation; a test failing twice is cleared |
| 3 skipped, fixme, body skip, `--grep`, `--project`, interruption keep; failure, timeout, `test.fail`, printed pass clear | 2 | Snapshot tests on fixture specs, including a killed run with completed updates kept |
| 4 disjoint projects carry no `project`; one file under two projects records it | 2 | Snapshot test with a two-project fixture config; the real snapshot of example 1 has no `project` |
| 5 nested runs record nothing here | 2 | The existing run-record and quiet-reporter specs pass with `RECORD_PLAYWRIGHT_PROOF=1` set for the outer run while `dashboard/tests/proof` is unchanged, and `proofRecordRun.ts` strips the option |
| 6 file Proof with describe names, 7 unlisted proof, 8 folder summary, 9 declaration problems and explanations | 3 | New Playwright journey on an Open Dough-like `typescript` location fixture with `runner: "playwright"`: Test case header and test words, rows by describe path in definition order, a loop-generated name and a helper-defined case absent while the count line counts listed rows, a stale observation unlisted, the undeclared-runner wording naming `playwright` among the runners, a Cucumber-shaped snapshot malformed with Retry, a location without `proof` naming the Playwright reference when it declares the runner, the other-kinds sentence; kind-independent rules are not re-proved. Unit tests pin the member form (`test.describe`, `test.describe.serial`, anonymous `test.describe(fn)`, `test.fixme`, `test.fail`, `test.it`) and that every Vitest and Node fixture file's rows are unchanged |
| 10 Cucumber, pytest, Vitest and Node unchanged | 3 | The focused Gherkin, pytest, Vitest and (when landed) Node Intent journeys stay green on unchanged fixtures, with only the absence wording expectations updated |
| 6–8 on real proof, root summary cost | 4 | Intent on project Open Dough at the revision that published slice 2's snapshot (or later), reading `accessible-board-touch.spec.ts`, `agent-completion-quiet.spec.ts` and the `boundary` folder; the `dashboard/tests` root summary opened once with its time and request count recorded |

Local gates: `PATH=/opt/homebrew/bin:$PATH bash tests/payload-declaration-links.sh`
for slice 1; `PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh tests/support/proof-store.test.mjs tests/support/proof-store-refresh.test.mjs`
(or the name plan 467 gave it) plus the focused dashboard specs
`env -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts --reporter=list dashboard/tests/boundary/proof-snapshot-*.spec.ts dashboard/tests/boundary/proof-record-*.spec.ts dashboard/tests/quiet-reporter.spec.ts`
and `npm run --silent typecheck:dashboard` for slice 2; the focused
Playwright journeys named per slice,
`PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh tests/support/intent-vitest-cases.test.mjs tests/support/intent-vitest-case-templates.test.mjs tests/support/intent-proof-runner.test.mjs <new unit test>`
and `npm run --silent typecheck:dashboard` for slice 3;
`npm run --silent format` before each commit. Run the whole dashboard suite
once before publishing slice 2, since every spec runs under the changed
reporter and config, and once before publishing slice 3, since the shared
row rule and the explanation component every Intent absence journey renders
change (`tests/local-test-resources.md`, with the sleep guard named above).
Hosted CI runs the full suites after publication and its failures stay owned
under the policy above.

## Ordered slices

### 1. The `playwright` proof reference tells a project how to record
Type: Behavior
Status: done
Proof: `src/skills/dough-test-optimization/references/playwright-proof.md`
exists with the contract the story records (option, configured reporter
and the `--reporter` warning, runner-process events, final attempt rule,
strict pass as proof, keep rules for skipped, fixme, body skip, unselected,
interrupted and unreached tests, clear rules for failed, timed out,
`test.fail` and printed-output results, `attempts` and summed
`durationMs`, repetitions and other executions folding as the Vitest
reference folds them, `file` from the file suite for covered locations
only, `test` as the title path with anonymous describes adding nothing,
`project` when more than one configured project selects the file, the
snapshot format stated as the Vitest format's fields with `project`, one
snapshot per directory, atomic refresh serialized against concurrent
recording runs, commit discipline, `runner: "playwright"` declaration with
an example, a reading section stating the row rule with the member form
and that loop-generated and helper-defined tests have no rows, and the
Playwright version observed); the SKILL.md links it beside the other
references; `install.sh` declares it; an AGENTS.md behavior review walks
examples 1–5 against the text and is recorded here;
`tests/payload-declaration-links.sh` and `npm run --silent format` clean.
Behavior: An agent in a project with a Playwright suite asked to record
`playwright` proof → reads the installed reference and can configure the
option, write or extend the reporter, and declare the location without
asking Open Dough anything else.

**Slice 1 accepted proof (2026-11-04):**
`PATH=/opt/homebrew/bin:$PATH bash tests/payload-declaration-links.sh`
exit 0; `npm run --silent format` exit 0; post-change refactor shortened
`playwright-proof.md` to 250 lines without dropping examples 1–5 contract
points; source review retained as `source-review.md` with slice 1
commitments 1, 1a, 1b, 1c, 5l, 16c observed.

**Slice 1 behavior review (AGENTS.md, 2026-11-04, agent YeongSheng-chan):**
Walked story key examples 1–5 against
`src/skills/dough-test-optimization/references/playwright-proof.md` as
written for the recording project's agent (re-walked after the 250-line
shorten). Outcome: usable for each; no gap that blocks configuring the
option, extending a reporter, or declaring the location from the
reference alone.

1. **Explicit focused recording** — Covered: `RECORD_PLAYWRIGHT_PROOF=1`
   off in every profile including CI; normal runs leave proof untouched;
   configured `reporter` list and `--reporter` replacement warning;
   declaration example with `runner: "playwright"`, `proof` and
   `proofGeneration.command` using the illustration command; identity
   with `file` from the file suite, `test` as title path, `project`
   omitted when projects are disjoint; `attempts` / `commit` /
   `fileBlob`; recorder prints nothing and never changes exit. Option-off,
   `--list`, CI and full-suite non-recording follow from the off-by-default
   and "normal runs leave untouched" rules.
2. **Retries and repetitions fold** — Covered: final-attempt rule;
   `attempts` = final retry index + 1; `durationMs` sums attempt
   durations; `--repeat-each` and other same-identity executions fold as
   the Vitest reference (one observation; fail clears for the rest of the
   run).
3. **No verdict keeps / verdict clears** — Covered: keep for `skipped`
   (`test.skip`, `test.fixme`, body `skip()`), `interrupted`, unselected
   (selection / project / shard / split) and unreached; clear for
   `failed`, `timedOut`, `test.fail` and printed-output passes under the
   strict `passed` + expected `passed` + empty stdout/stderr rule.
4. **Projects** — Covered: record `project` only when more than one
   configured project selects the file; omit when projects select disjoint
   files; reading section shows one row per observed project.
5. **Nested runs** — Covered: strip `RECORD_PLAYWRIGHT_PROOF` from nested
   runs of the real configuration; fixture projects record only in their
   own temporary checkout via covered-location resolution from that
   checkout's `.planning/open-dough.json`.

### 2. Open Dough records dashboard proof on explicit request
Type: Behavior
Status: done

**Slice 2 accepted proof (2026-11-04):** store unit test; focused
`proof-snapshot-*.spec.ts` + proof-record + quiet-reporter (34 passed);
`typecheck:dashboard`; Ex1 recording of
`dashboard/tests/{intent-proof-generation,accessible-board-touch}.spec.ts`
→ 7 observations in `dashboard/tests/proof/latest.json`; non-recording /
`--list` / focused / full suite leave snapshot byte-identical; full suite
under `caffeinate -s -i` on AC Power exit 0 (~64m). Reference gaps fixed:
canonicalize paths before `path.relative` (macOS `/var` vs `/private/var`);
prefer unique repo-relative paths for focused recording (basename filters
are Playwright substrings).

Proof: `tests/support/proofStore.mjs` (with `proofObservationOrder.mjs` and
`proofDirectoryRefresh.mjs`) with `tests/support/proof-store.test.mjs` and
`tests/support/proof-store-refresh.test.mjs` through `bash scripts/test.sh`
(atomic refresh, lock, order, fold of repeated identities, clear, outside-Git
no-op, covered locations, concurrent writers losing nothing), unless plan 467
landed the module, in which case its tests are reused and only missing rules
are added;
`dashboard/tests/support/proofSnapshot.ts` fed by `quietReporter.ts` and
optioned by `playwright.config.ts`; new `dashboard/tests/boundary/proof-snapshot-*.spec.ts`
through `proofRecordRun.ts`'s nested-run route with a temporary Git
checkout as the working directory: option off leaves no file; a describe
path recorded as the title path; `--retries=1` folding to `attempts: 2`
with the summed duration; `--repeat-each=2` as one observation; a test
failing twice cleared; `skipped`, `fixme`, a body `skip()`, `--grep` and
`--project` exclusion and a killed run keeping proof; a timeout, an
assertion failure, a `test.fail` test and a printed-output pass clearing
only themselves; a two-project fixture recording `project` and a
disjoint-project fixture recording none; a helper-defined test recorded
under the spec's file; two concurrent recording runs landing every pass in
one `latest.json` with no `.json` lock left; an outside-Git no-op; stdout,
stderr and exit identical with and without the option; `proofRecordRun.ts`
strips `RECORD_PLAYWRIGHT_PROOF`, and the existing run-record and
quiet-reporter specs pass with the option set for the outer run while
`dashboard/tests/proof` stays unchanged. `.planning/open-dough.json`
declares `runner: "playwright"`, `proof: "dashboard/tests/proof"` and
`proofGeneration.command`
`RECORD_PLAYWRIGHT_PROOF=1 npm run --silent test:dashboard -- <files>` on
`dashboard/tests`; then the real run of example 1 writes
`dashboard/tests/proof/latest.json` with the two files' tests
(`attempts: 1`, no `project`, `commit` at run start, `fileBlob` matching
`git hash-object`), committed as the first snapshot; the same command
without the option, `--list` and a later focused normal run change nothing
there; `dashboard/tests/README.md` and `proof-record.md` distinguish the
run record from committed Proof; the whole dashboard suite before
publication.
Behavior: `dashboard/tests` declares the runner, proof directory and
recording command → an explicit recording run of `npm run test:dashboard`
maintains the snapshot under the reference's rules; every ordinary, CI and
nested-config run loads the reporter with recording off and behaves as
before, including the strict quiet-pass rule and the run record. Any rule
the reference left unclear is reported back and fixed in the reference in
this slice.

### 3. Intent reads `playwright` proof and names `test.describe` paths
Type: Behavior
Status: done

**Slice 3 accepted proof (2026-11-04):** unit
`intent-vitest-cases` / templates / `intent-proof-runner` /
`intent-playwright-cases`; focused Intent journeys including
`intent-playwright-proof.spec.ts` (21 passed with vitest/cucumber/pytest
absence); `typecheck:dashboard`; full dashboard suite under
`caffeinate -s -i` on AC Power exit 0 (~121m).

Proof: `vitestCases.ts` reads a family name as a member of `test` with the
line of the `test` token, with `serial`, `parallel`, `fixme` and `fail`
in the modifier set; a unit test through `bash scripts/test.sh` pins
`test.describe`, `test.describe.serial`, `test.describe.configure` (no
case), anonymous `test.describe(fn)`, `test.fixme`, `test.fail`, `test.it`,
`test.use` and hooks naming nothing, and that every Vitest and Node fixture
file in `tests/support` lists the same rows as before; `proofKinds.ts`
registers `playwright` in `runnerProofKinds` with `parseVitestProofFile`,
`vitestRowsOf` and Playwright's words (Test case; tests; test cases;
family "Playwright tests"; reference
`dough-test-optimization/references/playwright-proof.md`); the runner
problem and unrecorded-reference answers name `playwright` (the
generalized rule written here when plan 467 has not landed); new
`dashboard/tests/intent-playwright-proof.spec.ts` with a fixture module
(Open Dough-like `dashboard/tests` location with `runner: "playwright"`, a
spec with a named describe, a serial describe, a top-level test, a
loop-generated name, a stale observation, a snapshot holding a
helper-defined case) asserts the Playwright-specific parts of examples 6–9
only; the Gherkin, pytest, Vitest and Node absence journeys' wording
expectations are updated and the rest of those journeys unchanged;
`docs/dashboard-development-intent.md` adds `playwright` beside Vitest and
Node; `npm run --silent typecheck:dashboard` clean; the whole dashboard
suite before publication.
Behavior: A `typescript` or `javascript` location declares
`runner: "playwright"`, `proof` and `proofGeneration` → Intent reads the
snapshot at the revision, a selected spec file's Proof lists its tests in
definition order by describe path with _No successful proof_ rows, the
count line counts listed test cases, a location or folder summary gives
the Gherkin figures with test words, and the explanations name the
Playwright reference and the `runner` setting; Vitest and Node files list
the same rows as before.

### 4. Intent shows the dashboard's published proof
Type: Behavior
Status: planned
Proof: Intent on project Open Dough at a revision that holds slice 2's
snapshot and slice 3's reader: `accessible-board-touch.spec.ts` shows its
three `touch reading > …` rows with proof, `agent-completion-quiet.spec.ts`
shows its source with a count line over listed rows only, the `boundary`
folder summary gives its figures, and the `dashboard/tests` root summary
(711 files) opens once with its read time and GitHub request count recorded
here as a learning; Terry's evaluation notes against the quiet reporter's
output plus an editor are recorded in the execution-complete record.
Behavior: The snapshot and the reader are published → a developer opening
Intent on Open Dough reads real dashboard Proof beside its spec files.

## Current decisions

- The quiet reporter owns the snapshot producer as its second consumer of
  the events it already receives; no second reporter. The run record keeps
  its contract and its CI use under plan 463.
- Open Dough keeps one proof store, `tests/support/proofStore.mjs`, shared
  by the `node:test` recorder (plan 467) and the snapshot producer; the
  second plan to execute imports or extracts it rather than copying it. A
  shared payload recorder stays Terry's later choice.
- The `runner` value is `playwright`; the snapshot format is the Vitest
  format with `project`, recorded only when more than one configured
  project selects the file; Open Dough's observations carry none.
- Proof is a final attempt's plain pass under the strict rule; `attempts`
  is the final retry index plus one; `durationMs` sums the attempts.
- The row rule's member form covers `test.<family name>` with the four
  Playwright modifiers; loop-generated and helper-defined tests have no
  rows and stay in the snapshot; summaries count listed rows only. Listing
  template-literal names and consolidating the references' shared
  discipline are deferred for Terry, as the story records.
- Open Dough's proof directory is `dashboard/tests/proof`; the first
  snapshot is the focused selection of example 1; a full refresh is
  Terry's deliberate run.
- Words: Test case, tests, test cases, "Playwright tests".
- Slices 1–3 depend on nothing beyond trunk at `0363ca1f1`; at Take, fetch
  trunk and, while plan 465, 466 or 467 is unlanded, edit the current
  files and expect a rebase rather than duplicating their work. Slice 2 is
  a safe stopping point with a readable snapshot committed and the reader
  explaining `playwright` as an unread runner until slice 3; slice 3 is
  another.

## Concern evidence

Slice-plan refinement was not needed: each slice owns one proof loop, no
Structure slice is needed because the store and the member form are each
part of the Behavior they serve and proved there, and the sequence
registers a runner in one case model and adds one call form to one rule
rather than a Playwright-shaped copy. No slice-specific concern remains.
Interim behavior: between slices 2 and 3, Open Dough publishes a
`playwright` snapshot Intent cannot yet read, and its `dashboard/tests`
location shows the honest `runner` explanation ("`playwright` is not a
runner Intent reads proof for") until slice 3 replaces it, so this needs no
replacing slice. The overlap with plans 465, 466 and 467 is bounded by the
Take-time check in Current decisions; the store-sharing rule names which
plan writes the module in either order.

## Story obligations

### E1. No Playwright commitment on src/skills or tests
Reported: slice 1 — "Open Dough's `src/skills` and `tests` locations carry no Playwright commitment"
Story clause: "Open Dough's `src/skills` and `tests` locations carry no Playwright commitment"
Disposition: excluded "Open Dough's `src/skills` and `tests` locations carry no Playwright commitment"
Commitment: E1

### E2. No other-project Playwright proof adoption
Reported: slice 1 — "no other project adopts this reference here"
Story clause: "no other project adopts this reference here"
Disposition: excluded "no other project adopts this reference here"
Commitment: E2

### E3. Deferred template-literal and helper-defined rows
Reported: slice 1 — "a test or describe named by a template literal with substitutions, and a test defined in a helper module, has no row"
Story clause: "a test or describe named by a template literal with substitutions, and a test defined in a helper module, has no row"
Disposition: excluded "Deferred promise, not a rejection: a test or describe named by a template literal with substitutions, and a test defined in a helper module, has no row"
Commitment: E3

### E4. Deferred shared-discipline consolidation
Reported: slice 1 — "leaves one consolidation of the shared discipline into a reference the runner pages link to as a separate candidate once both land"
Story clause: "leaves one consolidation of the shared discipline into a reference the runner pages link to as a separate candidate once both land"
Disposition: excluded "leaves one consolidation of the shared discipline into a reference the runner pages link to as a separate candidate once both land"
Commitment: E4

### E5. Excluded evaluation topics
Reported: slice 1 — "No run wall time, no CI comparison, no per-folder run cost, no staleness rule, no trace or attachment retention, no runtime context beyond what the format carries."
Story clause: "No run wall time, no CI comparison, no per-folder run cost, no staleness rule, no trace or attachment retention, no runtime context beyond what the format carries."
Disposition: excluded "No run wall time, no CI comparison, no per-folder run cost, no staleness rule, no trace or attachment retention, no runtime context beyond what the format carries."
Commitment: E5
