# Direction, premises, and outside-in proof

Companion to [PLAN.md](PLAN.md) for SEED-192#read-playwright-proof. Split from
the plan so the executable slice record stays within the 250-line file-size
bound; behavior and decisions are unchanged.

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

<a id="concern-evidence"></a>

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
