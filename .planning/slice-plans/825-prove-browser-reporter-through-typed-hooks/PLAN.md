# Prove the browser suites' reporter, proof record and spec times through their typed hooks

**Identity:** SEED-413#renovate-remaining-backend-families-after-intent-ci-readers
**Source:** [Prove the browser suites' reporter, proof record and spec times through their typed hooks](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#renovate-remaining-backend-families-after-intent-ci-readers)

## Goal and scope

Give maintainers fast, compile-time-checked feedback when they change how the
browser suites report a run, keep its proof record or write its spec times.
Move the seed's seven Playwright-selected specs to plain Node Vitest, at about
100 ms per case except where a nested run is essential:

- `intent/proof-record.spec.ts` (5 cases), `intent/proof-record-verdict.spec.ts`
  (3), `intent/proof-record-storage.spec.ts` (5), `intent/spec-times.spec.ts`
  (5), `runtime/quiet-reporter.spec.ts` (6),
  `intent/proof-record-entry.spec.ts` (2) and
  `intent/proof-record-interruption.spec.ts` (6).

Exclusions are the seed's boundary. Every other Playwright-selected spec
stays with
[the remaining backend renovation](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#renovate-remaining-backend-families-after-browser-reporter),
including the other `proofRecordRun.ts` callers (`runner-ownership`,
`dashboard-artifact-demand`, `dashboard-scheduling`, `start-origin-demand`,
`run-processes`, the test-preparation specs and their support). They keep
working unchanged.

## Current decisions

- Entries and inputs:
  - `ProofRecord(requested, config, suite, diagnostic)` with `begin`, `end`
    and `finish`, writing to a real temporary destination.
  - `SpecTimes(destination, config, diagnostic)` with `add`,
    `addSharedHook` and `write`.
  - `QuietReporter(options)` with `onBegin`, `onTestBegin`, `onStdOut`,
    `onStdErr`, `onStepEnd`, `onTestEnd`, `onError`, `onEnd` and `onExit`.
  - The typed inputs are Playwright's reporter types (`FullConfig`, `Suite`,
    `TestCase`, `TestResult`, `TestStep`, `TestError`, `FullResult`) from
    `@playwright/test/reporter`. Lint allows these type imports.
- MakeMe builds those inputs. Add one reporter-run MakeMe module beside the
  existing ones in `Distribution/tests/support/` and register it in
  `makeMe.mjs`. It builds a config with its project output directories and
  argv, a file suite and its cases, attempts' results, and steps. A suite's
  `allTests()` returns the same `TestCase` instances that the hooks later
  receive, because `ProofRecord` keys selections by instance. Cases state
  each value they assert on. The builder supplies only the shapes.
- One production seam. `QuietReporter` binds and patches `process.stdout`
  and `process.stderr` in its constructor, and prints through the bound
  originals. Give the constructor a second, optional parameter with the two
  streams, defaulting to the process streams. Playwright constructs the
  reporter with its options only, so every config keeps today's behavior.
  Direct cases pass their own writable streams, read what was printed, and
  never patch the Vitest worker's streams.
- Nested real runs stay only where the runner's process behavior decides
  the result:
  - opting in through the normal npm command and a direct config from
    another working directory (`proof-record-entry`, 2 cases);
  - output that global setup writes to the runner's own streams, which no
    reporter event carries (`quiet-reporter`'s run-output case);
  - graceful interruption and a forced group kill
    (`proof-record-interruption`).
  Every other case calls the hooks directly. A run reaching its deadline
  reaches the reporter as `onError` with the deadline message and `onEnd`
  with `timedout`. Its record, console and kept report are direct cases.
- `quiet-reporter`'s deadline case also browses the HTML report in a page.
  That report is Playwright's own `html` reporter under a config the spec
  writes itself, so the page check proves Playwright, not this product's
  code. Drop that part, and with it the case's only `page` use. Trace
  retention under `retain-on-failure` is also Playwright's. The reporter's
  part is listing a failed result's attachment paths, which is a direct case.
- `waitForProofState` is the only part of `proofRecordRun.ts` that imports
  Playwright's `expect`, and only `proof-record-interruption` uses it. Move it
  into that spec on Vitest's `expect.poll`, bounded by the case's own
  timeout. Its three readiness cases stay while the graceful and forced-kill
  cases wait on producer progress. The rest of `proofRecordRun.ts` keeps its
  exports for its other callers.
- Delete each quiet-reporter fixture under
  `dashboard/test-support/fixtures/quiet-reporter/` that no surviving case
  or other caller loads by path. Name matches are noisy: `skipped`,
  `failing` and `selection` also appear as ordinary words. Confirm by path
  through the consumer trace before deleting. Remove eslint ignores that
  only covered a deleted fixture.
- Keep the default Vitest timeout. The nested cases took 0.4–1.6 s at the
  baseline. If a surviving nested case cannot finish within the default
  under the measured load, shorten what it waits on, such as its fixture's
  sleep. Do not override the timeout.
- Follow the North Star topics
  [make production code directly testable](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
  and [plain Vitest for unit tests](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e).
  [ADR 0010, definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
  judges speed, clarity and deleted support together. Each moved case keeps
  its observation, and each dropped observation names its owner or reason.
- Slice 1 learnings (reuse in later slices):
  - Reporter-run MakeMe is split across `reporterRunTestData.mjs` (run/suite),
    `reporterResultTestData.mjs` (result/step), and `reporterRunMakeMe.mjs`
    (factory surface). Specs share Vitest helpers in
    `dashboard/backend-tests/support/directProofRecord.ts`.
  - `QuietReporter` optional `{ stdout, stderr }` defaults to process streams;
    format helpers live in `quietReporterFormat.ts`. Options-only construction
    leaves Playwright configs unchanged (confirmed by one e2e and one frontend
    Playwright run under high load with `--workers=1`).
  - MakeMe JSDoc `FullConfig` needs an `unknown`→`FullConfig` bridge at the
    ProofRecord call site; optional result fields must be omitted rather than
    set to `undefined` under `exactOptionalPropertyTypes`.

## Baseline and decisive premises

Baseline at `9464e9a0a` on 25 November 2026 in the preparation worktree:
Node 24.21.0, macOS on AC power, load average about 4, default two workers.
Maintained command:

```sh
caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES \
  OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD="$proof_file" \
  npm run --silent test:dashboard:backend -- <the 7 spec paths>
```

All seven files passed on Playwright: 32 cases, 40.4 s summed, 28 s elapsed,
with 31 cases over 100 ms. The deadline cases in `quiet-reporter` (8.9 s)
and `proof-record-interruption` (8.3 s) held 43% of the time. The other
cases took 0.3–1.9 s each. CI run `45557556997` on `1adca9f40` gave the
seven files 93 s.

| Consuming operation | Observation in the preparation checkout | Result |
| --- | --- | --- |
| `ProofRecord`, `SpecTimes` and `QuietReporter` run from direct hook calls on Node Vitest under the maintained runner | Scratch spec `backend-tests/intent/zz-scratch-reporter.spec.ts` at `9464e9a0a`, run by the command above. A hand-built config, file suite and case in a temporary directory: `ProofRecord` with two `end` attempts and `finish`, `SpecTimes.add` and `write`, and `QuietReporter` `onBegin`, a failed `onTestEnd` and `onEnd`. | First run: `attempts` was empty because the suite's `allTests()` returned a different `TestCase` instance than the hooks did. The rerun shared one instance and gave `selectedCount: 1`, two attempts, strict `failed`, and the times line for `a.spec.ts` for a case located in another module. `QuietReporter` answered `{ status: "failed" }` and wrote `FAIL:` to `report.txt`. 3 cases in 0.3–3.1 ms. Removed. MakeMe returns shared instances, and the stream seam keeps the worker's streams untouched. |
| A Vitest case can import `proofRecordRun.ts` unchanged and start a nested quiet run | Scratch spec `zz-scratch-nested.spec.ts`, same command: `startProofRun({ spec: "printing.proof.ts" })`, then `readProof`. | Passed in 469 ms. The run exited 1 with `PRINTED` on stdout, phase `completed` and strict `failed`. Importing Playwright's `expect` at module scope did not break the Vitest worker. Removed. |
| Only the cohort uses `waitForProofState` | `git grep -l waitForProofState -- dashboard` at `9464e9a0a`. | Only `proofRecordRun.ts` and `proof-record-interruption.spec.ts`. Every other caller imports engine-neutral exports. |
| A global deadline reaches the reporter as `onError` and a `timedout` end | The baseline run above at `9464e9a0a` passed both nested deadline cases. `proof-record-interruption` asserted `terminal.runnerStatus: "timedout"`, and `quiet-reporter` asserted `Timed out waiting` on stdout with no `Test timeout of`. The reporter prints outside a test only from `onError` and `onEnd` (`quietReporter.ts`), and the hanging test's own timeout was not reached. | Settled for the direct cases in slices 4 and 5: they supply that error and status. |
| The backend Vitest config selects the moved specs and no fixture | `backend.vitest.config.mts` includes `dashboardSpecFiles(...).filter(isVitestFile)` over `backend-tests/**/*.spec.ts`. Fixtures are `*.proof.ts` under `test-support/fixtures/`. | The moved specs select Node Vitest once they import from `vitest`. The fixtures stay unselected. |

The direct deadline cases encode what the reporter receives from Playwright
at a global timeout. A run that ends `interrupted` stays nested through the
graceful interruption case, so the reporter's non-passing end still meets a
real runner.

## Slices

### 1. A run's selection, attempts and strict verdict are recorded from direct hooks

Type: Behavior
Status: done
Proof: `proof-record.spec.ts` and `proof-record-verdict.spec.ts` run on Node
Vitest, with 8 cases under about 100 ms each. Add the reporter-run MakeMe
module and the `QuietReporter` stream seam. Cases: a filtered selection
with its attempts, a listing recorded as `listed` with no executed proof,
repetitions and skips kept apart from the selected count, a retry adding an
attempt without weakening strict failure, overlapping invocations keeping
their own run identity and selection, and assertion failure, passing-test
output and run output (`onStdOut` without a test) each leaving
`runnerStatus` apart from strict `failed`. `npm run typecheck:dashboard`
passes, as does lint for the changed files.

Behavior: given a run's suite and its attempts' results, the record keeps
the actual selection, every attempt and a strict verdict that output or
failure turns failed.

Estimated active work 12–15 minutes.

Accepted proof (implementation + refactor): focused
`caffeinate -s -i … npm run --silent test:dashboard:backend -- intent/proof-record.spec.ts intent/proof-record-verdict.spec.ts`
→ 8 passed, 2–8 ms each (`slice1-refactor-backend-proof.log.run.json`).
`typecheck:dashboard` and lint on owned paths passed. Default-stream seam
confirmed by `e2e/runtime/browser-identity.spec.ts` and frontend Playwright
`test-harness/observation-measurements.spec.ts` (`--workers=1`). Setup:
MakeMe shared `TestCase` instances and writable stream stand-ins. Observations:
`selectedCount`/attempts/listing/`strictStatus`; QuietReporter
`FAIL:`/`PRINTED:`/`outside any test` and `Kept:`.

### 2. Proof record storage refusals and snapshots hold from direct hooks

Type: Behavior
Status: done
Proof: `proof-record-storage.spec.ts` runs on Node Vitest, with 5 cases
under about 100 ms each, over real temporary paths. An alias into an
existing output directory is refused. An existing path stays byte-for-byte
unchanged. Relative paths, a missing directory, a regular file used as the
parent and a path inside an output directory each report unavailability,
leave no record, and keep the underlying verdict. For a snapshot write
failure, make a directory at the next temporary path
(`<record>.<run id>.tmp`) after `begin`. `end` then reports unavailability,
the last complete `running` snapshot remains, and the obstruction is left
untouched. With no record requested, a passing reporter run writes none,
and `onExit` removes its output directory.

Behavior: given a requested destination, the record is written only to a
claimed, absolute path outside every output directory, and a recording
failure never changes the test verdict.

Estimated active work 10–14 minutes.

Accepted proof: focused
`caffeinate -s -i … npm run --silent test:dashboard:backend -- intent/proof-record-storage.spec.ts`
→ 5 passed, 1–3 ms (`slice2-backend-proof2.log.run.json`). typecheck and lint on
owned paths passed. Setup: real temp paths, MakeMe shared cases, collectingStream
stand-ins; snapshot case mkdir-obstructs `<record>.<run id>.tmp` after begin.
Observations: alias/existing/invalid destinations unavailable without changing
verdict; running snapshot retained; no-record run clears outputDir on onExit.
Production QuietReporter/ProofRecord untouched. Refactor disposition: skipped —
subject spec + shared Vitest helpers only; files ≤250; no production candidate.

### 3. Spec times attribute and sum from direct hooks

Type: Behavior
Status: planned
Proof: `spec-times.spec.ts` runs on Node Vitest, with 5 cases under about
100 ms each. Summed seconds are listed longest first by path under
`rootDir`. Cases from an imported module count under the enclosing file
suite's spec. A failed run still writes what completed. A listing writes
no file. `beforeAll` and `afterAll` hook steps add once per file, while
test-scoped hooks stay inside each attempt's duration.

Behavior: given the run's results and hook steps, the times file names each
spec file with its summed seconds, attributed to the spec that ran it.

Estimated active work 10–13 minutes.

### 4. The console report stays quiet unless a run needs attention

Type: Behavior
Status: planned
Proof: `quiet-reporter.spec.ts` runs on Node Vitest. Five cases call the
hooks directly with the stream seam. A passing run prints nothing and
succeeds. A failing case is named with its error and its kept attachment
paths. A failed run writes `report.txt` and names its directory last. A
passing case that printed fails the run and shows its output. A deadline
(`onError` with the deadline message, a completed failure, then `onEnd`
with `timedout`) names the deadline, shows the completed failure and keeps
the report. The run-output case keeps one nested run with `printingSetup.ts`
and asserts the global setup's text and the failing exit. Delete
`innerPlaywright.ts` only if the consumer trace shows no other users; today
`run-processes` and `agent-launch-acceptance-kept-first-cleanup` also use it.

Behavior: given a run's events, the console shows only failures, unexpected
output and the run's own end, and a run that shows nothing leaves no output
directory.

Estimated active work 12–15 minutes.

### 5. Runner entry and interruption keep their nested proof on Node Vitest

Type: Behavior
Status: planned
Proof: `proof-record-entry.spec.ts` and `proof-record-interruption.spec.ts`
run on Node Vitest. The two entry cases and the graceful-interruption and
forced-kill cases keep their nested runs, each within the default timeout.
The deadline case becomes a direct `ProofRecord` case: one finished attempt,
one begun attempt with no status, and `runnerStatus: "timedout"` with
strict `failed`. `waitForProofState` moves into the spec on Vitest's
`expect.poll`, and its three readiness cases pass there. Then delete
fixtures that no surviving case or other caller loads, confirmed by path,
along with any eslint ignore that only covered them. Rerun the remaining
`proofRecordRun.ts` callers (`runner-ownership`, `dashboard-artifact-demand`,
`dashboard-scheduling`, `start-origin-demand`, `run-processes`,
`kept-history-worker` and the test-preparation specs) under the maintained
runner.

Behavior: given the normal or direct entry, or an interrupted or killed
run, the record attributes nested runs to their outer invocation and
leaves a readable snapshot with finished work kept apart from unfinished
work.

Estimated active work 12–15 minutes.

## Concern evidence

Slice-plan refinement was not needed. The slices follow the reporter's three
collaborators (record, storage, times), then its console, then the cases
that keep a nested runner. Slice 1 holds the only production seam and the
new MakeMe module that the later slices reuse. The interim state, with
some cohort specs still on Playwright, is the runner's normal two-engine
run. No remaining slice-specific concerns were identified.

## Verification and delivery

- The local gate uses the maintained
  [macOS sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
  (`caffeinate -s -i`, on AC power) and the shared
  [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
  Keep the default timeout. Apply MakeMe for the backend sources.
- Run each slice's specs focused with the maintained backend runner. After
  slice 5, rerun the baseline command for the seven files and confirm each
  selects Node Vitest. Record per-case times against about 100 ms, case count,
  summed case time and elapsed time, and name each nested case with its
  cost. Note the host load. Account for the dropped HTML-report page check.
- Run `npm run typecheck:dashboard` and `npm run lint -- --staged`. Run the
  [consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
  for `quietReporter.ts`, `proofRecordRun.ts` and each deleted fixture. The
  reporter seam is shared by every Playwright config through
  `runnerConfig.mjs`, so slice 1 also runs one e2e spec and one frontend
  Playwright spec under their maintained commands to confirm that the
  default streams are unchanged.
