# Read observed proof alongside test purpose

**Identity:** SEED-192#read-observed-test-proof
**Source:** [selected story](../../seeds/SEED-192-review-product-intent.md#read-observed-test-proof).
**Source review:** [source-review.md](source-review.md)

## Goal and scope

When a developer selects a Pygardon feature file in Intent, the Proof pane
beside Purpose shows the latest committed observation of each of its scenarios
and outline rows. Pygardon produces those observations from its ordinary
Cucumber.js runs by following one released Open Dough reference document, a
reference rather than a skill. The story's Scope owns the rules: one
uniquely named file per run, rewritten after each finished scenario. A
scenario is identified by feature path, scenario name and example row. The
latest observation wins. Consolidation is optional and keeps meaning. Each
observation carries its commit and feature-file blob.

Material exclusions (deferred, not rejected): run history and trends; tabbed
Purpose/Proof layout and its switch; story scope; folder totals; CI
corroboration; Doughnut and other runners. Open Dough ships no ready-made
formatter or consolidation tool.

Assumptions: Pygardon is the evaluation project (Doughnut keeps
[story 8](../../seeds/SEED-192-review-product-intent.md#read-cypress-cucumber-proof)).
Proof files are committed with ordinary work.

## Existing solutions and decisions

PFE:

- **Intent reader.** Extend `dashboard/src/IntentBrowser.tsx`'s placeholder
  Proof section and the pinned-revision Intent reads in
  `dashboard/server/intentLocationsRead.ts` / `intentLocationsSettings.ts`.
  Declare proof beside the Intent location in `.planning/open-dough.json`. Read
  proof files through the same authenticated pinned-read boundary
  (`ghTrees.ts` for listing, `file-at` for text), once per revision and project.
- **File-version match.** Compare the observation's recorded blob with the
  published blob of the selected feature: either carry `sha` through
  `TreeEntry` (the Git trees API answers it) or hash the read text as a Git
  blob. Prefer the tree `sha` because it is byte-exact.
- **Scenario order and rows.** The Purpose reader already has the published
  feature text. Derive scenario, outline and example-row identities from that
  text in source order. Do not rely on runtime IDs (observed: AST/pickle IDs are
  fresh UUIDs each run).
- **Existing proof contract.** `dashboard/tests/proof-record.md` is Playwright-
  specific, one record per invocation. It is a reference for atomic snapshot
  writing and honest incomplete states, not a reusable format.
- **Payload.** Only skill directories install. The reference goes under
  `src/skills/dough-test-optimization/references/` and is promoted through
  `install.sh`'s `managed_files` ([ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)).
  Write it for the agent in the adopting project ([ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)).
  Run the [behavior review](../../../AGENTS.md#behavior-review).
- **Release and rollout.** Use the internal `release-and-update-clients` skill.
  It updates every production-dashboard project, not only Pygardon.

Applicable Accepted decisions: ADR 0001 (Purpose/Proof language), ADR 0003,
ADR 0004 (project-owned `.planning/open-dough.json`), ADR 0006, ADR 0008
(repository records own durable facts; the dashboard reads the published
revision), ADR 0010 (measure read cost and commit noise against today's
workflow). No conflict; no new ADR or North Star topic.

Coordination: [plan 438](../438-renovate-intent-sidebar/PLAN.md) (SEED-213)
changes the Intent locations column and `intent-gherkin-browse.spec.ts`
journeys. This plan changes the Proof section only. Rebase onto whichever
lands first and keep both specs' selection steps aligned.

## Outside-in proof

| Story example | Slice | Observable proof |
| --- | --- | --- |
| 1 Focused run updates only what it ran | 1 | Playwright Intent journey: two published proof files at the pinned revision; rows show the newer observation for one scenario and the older ones elsewhere, each with its own time and commit |
| 2 Latest failure wins | 1 | Same journey: newer failed observation outranks an older pass; the count line shows the failure |
| 3 Retry-assisted pass | 1 | Same journey: an observation with 2 attempts reads *Passed after retry (2 attempts)* |
| 4 Changed source | 1 | Same journey: an observation whose blob differs from the published feature reads as observed on an earlier file version; an added scenario reads *Not observed* |
| 6 Parallel worktrees / 7 Consolidation | 1 | Same journey: the same observations split across two run files or consolidated into one render identical rows |
| 8 Not adopted / unreadable / nothing yet | 2 | Playwright Intent journey: no declared proof names the installed reference; declared but nothing for this file says nothing observed; a malformed proof file shows a read failure with retry while Purpose stays readable |
| 5 Interrupted run, parallel and retry production | 3 | Recorded behavior walk: a scratch Cucumber.js project configured only from the reference is run focused, with `--parallel 2 --retry 1`, and interrupted. The dashboard's own proof parser reads its files with the expected rows. Payload declaration tests pass |
| Real Pygardon proof | 4 | Real focused Pygardon run after adoption, landed in Pygardon; the dashboard's Intent shows those scenarios observed on the current file version. Terry evaluates |

## Ordered slices

### 1. Intent shows the latest committed proof of each scenario
Type: Behavior
Status: done
Proof: New Playwright Intent proof journey (beside
`intent-gherkin-browse.spec.ts`) with published Pygardon-like feature and proof
files, covering examples 1–4, 6 and 7. Apply the repository's
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests).

Behavior: a project declares a proof directory with its Gherkin location, and
the pinned revision holds run and consolidated proof files → the developer
selects a feature → Proof lists every scenario and outline row in source order.
Each row shows its latest outcome across all files (retry-assisted passes
marked), duration, time since observation, short commit, and whether it was
observed on this file version. Unobserved rows say so, and a count line
summarizes. Draft the reference's file format in
`src/skills/dough-test-optimization/references/cucumber-proof.md` here as the
reader's contract. It is not yet in `managed_files`.

Accepted proof (2026-11-01): `env -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts dashboard/tests/intent-cucumber-proof.spec.ts dashboard/tests/intent-gherkin-browse.spec.ts dashboard/tests/intent-gherkin-unusable.spec.ts dashboard/tests/intent-code-browse.spec.ts dashboard/tests/boundary/authenticated-read-intent-locations.spec.ts --reporter=list`
passed 12 (the new spec 8/8 under `--repeat-each 4`; 8 passed again after
refactoring), plus `authenticated-read-intent-selection` and
`development-intent-frame-sessions` (3 passed) and `npm run typecheck:dashboard`.
Per-commitment observations are in the [source review](source-review.md).
`dashboard/src/gherkinScenarios.ts` matched `@cucumber/gherkin` 42 on all 169
rows of Pygardon's real features.

Learnings for slices 2–3: the contract is `intent.locations[].proof` on a
`gherkin` location, and every `*.json` under it is a `{"version": 1,
"observations": [...]}` file (fields in the reference). One invalid
observation makes its whole file malformed, which the server answers as
`proof: {path, problem: "unreadable"}`; the pane says only "could not be read"
with no retry yet. Undeclared proof keeps the old placeholder. Slice 3 applies
`dashboard/src/cucumberProof.ts` (`parseProofFile`, `latestObservations`) to the
walk's files.

### 2. Proof absence and failures read distinctly
Type: Behavior
Status: done
Proof: Playwright Intent journey for example 8 (not declared, declared but
unobserved, malformed or unreadable proof file with retry), and neighboring
Intent journeys stay green. Apply the repository's
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests).

Behavior: the same reader meets missing configuration, no observation for the
file, or an unreadable proof file → three different explanations. The
not-adopted one names the installed reference path, and Purpose stays readable
throughout.

Accepted proof (2026-11-01): the new `dashboard/tests/intent-cucumber-proof-absent.spec.ts`
with every neighboring Intent and Development Intent frame spec, 25 passed; the
proof and browse specs 36/36 under `--repeat-each 4`; 7 passed again after
refactoring; `npm run typecheck:dashboard` clean. Retry re-reads the Intent
locations read in place, keeping selection and Purpose. A malformed file stays
malformed at the same revision; only a new published revision or a transient
read failure changes the answer.

### 3. A project that follows the reference produces readable proof
Type: Behavior
Status: done
Proof: The [behavior review](../../../AGENTS.md#behavior-review) walk, recorded
in this plan: in the execution workspace's scratch directory, a minimal
Cucumber.js 13 project configured only from the reference text. Run it focused,
parallel with retry, interrupted, and twice into separate files, then
consolidate once. Apply the dashboard proof parser from slice 1 to the results
and record the observed rows (examples 3, 5, 6 and 7 on the producer side).
Add the reference to `install.sh`'s `managed_files`; payload declaration and
compare tests (`tests/payload-declaration-links.sh`, `tests/compare-payload.sh`)
pass. Run `bash scripts/test.sh` for the affected payload tests.

Behavior: an agent in a Cucumber.js project follows the reference → every
ordinary run writes uniquely named, compact proof that keeps finished
scenarios through interruption and leaves the runner's output and exit
unchanged. Readers see the same latest rows before and after consolidation.

Recorded walk (2026-11-01, scratch `walk3/proj` in the execution job's tmp, Cucumber.js
13.2.1, Node 24.21.0; recorder `support/proof-plugin.js` and
`support/consolidate-proof.js` written from the reference text only). Six
scenarios: plain, `@smoke`, an outline with rows `timeout|3` and
`crash \| oom|5`, one failing under `FAIL=1`, and one `@flaky` that fails its
first attempt.

| Run | Result |
| --- | --- |
| a. focused `features/jobs.feature:8` | exit 0, stdout and stderr equal to the same run without the recorder; 1 file |
| b. `--tags @smoke`, also `-p ci` | exit 0, output unchanged; 1 file |
| failing `FAIL=1 --name 'Report a broken job'` | exit 1 both ways, output unchanged |
| c. `--parallel 2 --retry 1` | exit 0; 1 file, 6 observations; Flaky queue `passed`, `attempts: 2`; both outline rows with `example` (escaped pipe unescaped) |
| d. SIGINT during the third of five | same signal and output as without the recorder; file holds exactly the two finished scenarios, no temp file |
| e. second worktree, two runs, merged | 3 uniquely named files; `git merge` exit 0, no conflict |
| f. consolidation | 7 files into 1 new uniquely named file; consumed files deleted |
| `--dry-run`, unwritable directory | no file written, output unchanged |

The dashboard's `parseProofFile` parsed every file at each committed revision;
`latestObservations` with `scenarioRowsOf` gave: after d, List and Cancel at
the new commit and the other three rows at their earlier commit (example 5);
across both worktrees' files, the later observation of each scenario (example
6); identical rows before and after consolidation (example 7); Flaky queue
passed after 2 attempts (example 3); and, after a scenario was added, earlier
rows on a different file version. `featureBlob` equalled `git hash-object`.

The walk corrected the reference: the `format` example replaced the project's
own stdout formatter (a format entry without a target takes stdout), so the
recorder is now a Cucumber.js plugin; dry-run and fail-fast attempts are not
recorded; the outcome is the attempt's worst step status; recording happens in
the main process under `--parallel`; feature paths are converted to the
repository root; files below the proof directory are read too. The reference
is declared in `install.sh` `managed_files` and linked from
`dough-test-optimization/SKILL.md`. Payload tests
(`tests/payload-declaration-links.sh`, `tests/compare-payload.sh` and the
install/update payload family) passed.

Behavior review: an agent arrives from Intent's not-recorded sentence or the
`dough-test-optimization` link; it needs its Cucumber configuration and
profiles, the Gherkin location in `.planning/open-dough.json`, and a Git
checkout (without one it records nothing); the walk above is the useful
outcome.

CI repair (2026-11-01): run 41321048358 on `4487c435` failed
`ci-github-diagnostic-inventory.test.mjs` with "local connection failed", a
request-owner race unrelated to this story. `github-request-owner.mjs` now
removes its socket before closing connections, and `greeted()` treats a close
before the welcome as absence once the socket is gone. The new regression test
in `github-request-owner-unresponsive.test.mjs` failed 5/5 without the fix; the
two tests passed 20 times in a row, the 22 request/diagnostic tests 3 times,
and full `npm test` passed.

Trunk CI repair (2026-11-01): run 41325287636 on the landed `bdeb210a` failed
`sessions-sidebar-host-status.spec.ts` with "response.json: Test ended": its last
step awaited the third host read being asked, not answered, so the response
listener outlived the test. The step now also polls the third answer. A forced
delay on that answer failed before the fix and passed 5/5 after; the spec passed
60/60 under `--repeat-each 10`.

Story-branch CI repair (2026-11-01): run 41326542071 on `23e725f2` failed
`agent-launch-base-ci-completed-history.spec.ts`: its fixture committed the
running base before a merged sibling, so a sibling landing a second later was
listed first by date and its failure judged nearest, as the product should.
The fixture now commits the sibling first. A forced one-second gap reproduced
the failure before and passed after; the spec passed 30/30 under
`--repeat-each 10`, and the other base-CI specs passed.

### 4. Pygardon's ordinary runs publish proof that Intent reads
Type: Behavior
Status: done
Proof: After Terry authorizes the release, run `release-and-update-clients`;
it pushes to every production-dashboard project. In an owned Pygardon
worktree, adopt the installed reference in Pygardon's `cucumber.js` and
`.planning/open-dough.json`, run a real focused selection with Pygardon's
documented command (comparing its output and exit with and without the
recorder), and land in Pygardon. The local dashboard's Intent then
shows those scenarios with current-version observations and the rest *Not
observed*. Record the proof file count, Intent read time, and the commit diff
that proof added, for Terry's evaluation (ADR 0010). Pygardon's own CI must
stay green under the failure policy above.

Behavior: Pygardon developer or agent runs ordinary Cucumber tests and lands
the work → Intent shows those scenarios' latest proof beside their source.

Recorded rollout (2026-11-01/02): with Terry's go-ahead, slices 1–3 and two CI
repairs landed on Open Dough `main` through Dough Land `--keep-worktree`
(`bdeb210a`, landing receipt recorded; trunk CI repaired at `46587847`, green),
and `release-and-update-clients` published 0.3.80 (`1908428b`, tag `v0.3.80`)
and pushed updates to all five production projects. In an owned Pygardon
worktree, `e2e_test/plugins/cucumberProof.mts` was added as a Cucumber.js plugin
in the shared `focused` profile (so `default` and `ci`), with `"proof":
"e2e_test/proof"` on `e2e_test/features`; `e2e_test/packaged/features` runs only
through its packaging tests and declares none. The focused run
`nix develop -c scripts/check-worktree.sh pnpm exec cucumber-js e2e_test/features/disk_space_cli.feature e2e_test/features/runtime_status.feature e2e_test/features/strategy_areas.feature`
exited 0 with output and diagnostics identical to the same run without the
recorder; `--profile ci --dry-run` wrote nothing. Pygardon landed
`3711c54a3` on its `main`, and its CI passed. Intent at that revision showed
`runtime_status.feature`'s scenario Passed, 205 ms, commit `6bc3372`, This file
version, and `holdings.feature` "Nothing has been observed yet for this file in
e2e_test/proof."

For Terry's evaluation (ADR 0010): 1 proof file, 1,208 bytes, 3 observations;
the first Intent locations read of the new revision took 3,060 ms (79,305-byte
answer), later reads 3–9 ms; the adoption commit was 6 files, +267/−2, of which
proof +35 and the recorder +224. The rollout exposed G6–G9, fixed here.

## Decisive premises

- **Cucumber.js 13.2.1 lets a project formatter observe every attempt without
  changing runs.** Consuming operations: slices 1, 3 and 4. Observed
  2026-11-01 in a scratch project using Pygardon's installed Cucumber.js. A
  custom formatter passed with `--format` beside `progress` under
  `--parallel 2 --retry 1` received the failed first attempt
  (`willBeRetried: true`) and the passing retry. Outline rows arrived as
  separate pickles, and the exit was 0. AST IDs differed per run. Settled.
- **A `cucumber.js` profile's `format` loads the formatter, and per-scenario
  atomic rewrites survive interruption.** Consuming operations: slices 3 and 4.
  Observed in a second scratch run with `format: ['progress', './proof2.js']`
  in `cucumber.js`, interrupted with SIGINT during the third of four
  scenarios. The exit was 130 and the file held exactly the two finished
  scenarios. Settled.
- **Recorded blob hash can be compared with the published file.** Consuming
  operation: slice 1 file-version match. Observed: `git hash-object README.md`
  equals the blob `git ls-tree HEAD README.md` lists
  (`bffc614ea005fe28fbd97e4048b28b62b0b2ec48`). Settled. The dashboard side
  (tree `sha` or text hash) is chosen in slice 1 and proved by its journey.
- **Pygardon's real hooks and services accept the added formatter.**
  Consuming operation: slice 4. Observed 2026-11-01 in a scratch detached
  Pygardon worktree at `ce1e68ae4` (removed afterwards; nothing committed), after
  `nix develop -c scripts/prepare-worktree.sh`:
  `nix develop -c scripts/check-worktree.sh pnpm exec cucumber-js --format <probe formatter> e2e_test/features/disk_space_cli.feature`
  exited 0. The formatter recorded the scenario's `PASSED` attempt with its
  feature path and name, the default 2-worker profile ran unchanged, and the
  worktree stayed clean. Settled for the formatter route; slice 4 still owns
  the configured adoption and landing.
  The slice 3 walk showed that a `--format` entry without its own target
  replaces the stdout formatter, so this probe did not check that Pygardon's
  own output survived; slice 4 configures the recorder as a plugin and
  compares output with and without it.

## Story obligations

### G1. Undeclared proof keeps the old placeholder (first reported in slice 1)
Reported: slice 1 — "When proof is not declared, the old \"No Proof is available for this file yet…\" text is kept"
Story clause: "A project without a declared proof directory says so and names the reference to adopt"
Disposition: proved by slice 2: dashboard/tests/intent-cucumber-proof-absent.spec.ts "Ex 8: a project without declared proof says Proof is not recorded and names the reference" asserts the not-recorded sentence naming dough-test-optimization/references/cucumber-proof.md

### G2. Declared proof with nothing for this file shows only Not observed rows
Reported: slice 1 — "the empty or absent proof directory (which shows every row as Not observed), was not exercised"
Story clause: "A declared directory with no observation for this file says nothing has been observed yet"
Disposition: proved by slice 2: dashboard/tests/intent-cucumber-proof-absent.spec.ts "a declared proof directory with nothing for this file says nothing is observed yet" (absent directory; other feature only) asserts "Nothing has been observed yet for this file in e2e_test/proof."

### G3. Unreadable proof has no retry and is unexercised
Reported: slice 1 — "The pane then shows \"Proof in <dir> could not be read.\" with no retry yet"
Story clause: "An unreadable or malformed proof file is reported as a read failure with retry"
Disposition: proved by slice 2: dashboard/tests/intent-cucumber-proof-absent.spec.ts "Ex 8: a truncated proof file reads as a read failure with retry…" and "a failed proof file read says so; Retry reads the proof again…" assert the alert, Retry re-read, and recovered rows

### G4. Gherkin scanner edge cases unproved
Reported: slice 1 — "Not exercised: escaped pipes in example cells; multiple Examples blocks; Rule: nesting; doc strings containing keywords"
Story clause: "lists the file's scenarios and outline rows in source order"
Disposition: no user cost "A developer reviewing a Pygardon feature file in Intent sees": compared at acceptance against Cucumber's own @cucumber/gherkin 42 parser on all of Pygardon's e2e_test/features (169 rows, including its Rule: and Background: files), dashboard/src/gherkinScenarios.ts produced identical rows; Pygardon uses no escaped pipes, doc strings or multiple Examples blocks, and other projects are deferred

### G5. Proof directory listing failure unexercised
Reported: slice 2 — "The directory-listing failure branch (\"<dir> could not be listed at this revision\", no `file`) is not exercised"
Story clause: "An unreadable or malformed proof file is reported as a read failure with retry"
Disposition: proved by slice 2: dashboard/server/intentProofRead.ts proofFilesUnder returns the same unreadable problem for a failed listing as for a failed file read, and dashboard/src/IntentProofProblem.tsx ProofProblem renders both with the same Retry that dashboard/tests/intent-cucumber-proof-absent.spec.ts "a failed proof file read says so; Retry reads the proof again…" exercises; only the sentence differs

### G6. Proof pairs a new selection with the previous file's text (first reported in slice 4)
Reported: slice 4 — "holdings' \"Nothing has been observed yet…\" sentence above a Not observed row for runtime_status's scenario"
Story clause: "For a selected feature file, the Proof pane reads proof from the same published revision as Purpose and lists the file's scenarios and outline rows in source order"
Disposition: proved by slice 4: dashboard/tests/intent-selection-reads.spec.ts "selecting another feature never shows the previous feature's text in Purpose or Proof" records every frame labelled for the new file while its read is held; it failed before the fix with the reported mixed frame

### G7. Startup Intent re-reads clear the selection (first reported in slice 4)
Reported: slice 4 — "While the page is first loading, Intent re-reads `intent=locations` several times... Each re-read collapses the expanded group and clears the selected feature"
Story clause: "the Proof pane reads proof from the same published revision as Purpose"
Disposition: proved by slice 4: dashboard/tests/intent-selection-reads.spec.ts "a feature selected while startup detail completes stays selected with its Purpose and Proof" (one locations read, group and selection kept) and "a new published revision reads the locations again and starts with nothing selected"; the first failed before the fix with three reads and a collapsed group

### G8. Reference does not limit recording to the declared location (first reported in slice 4)
Reported: slice 4 — "It doesn't say what to do with features run outside the declared Gherkin location"
Story clause: "Declare the proof directory in `.planning/open-dough.json` with the Intent location it covers"
Disposition: proved by slice 4: src/skills/dough-test-optimization/references/cucumber-proof.md Configure once bullet recording only features under the locations that declare the proof directory; payload tests passed

### G9. Reference does not say how a TypeScript project loads the plugin (first reported in slice 4)
Reported: slice 4 — "Its `./<path>/proof-plugin.js` example doesn't tell a TypeScript project that plugins are loaded with `import()` before `requireModule`"
Story clause: "Existing output, diagnostics and the command's exit meaning stay unchanged"
Disposition: proved by slice 4: src/skills/dough-test-optimization/references/cucumber-proof.md Configure once bullet on native import() plugin loading and loading silently; payload tests passed

### G10. Pygardon has no test of its own for its recorder (first reported in slice 4)
Reported: slice 4 — "Pygardon has no test of its own for the recorder. Retry, outline and failure behaviour were exercised only in the slice-3 scratch walk"
Story clause: "Pygardon's ordinary Cucumber.js setup follows the released reference"
Disposition: no user cost "Pygardon produces that proof as a side effect of its ordinary Cucumber runs": Pygardon's real focused run produced proof that Intent reads on this file version, its CI passed with the recorder in both profiles, the same rules' retry, outline, failure and interruption behavior was walked in slice 3, and Pygardon owns its implementation and its tests

## Human checkpoint

Slice 4 publishes a release, updates every production-dashboard project, and
lands in Pygardon. Before it, stop for Terry's go-ahead naming that rollout.
Slices 1–3 need no such stop.

## Concern evidence

Slice-plan refinement was not needed. Each slice has one proof loop: the
reader's rows, the reader's absence states, the producer reference, and the
real adoption. No cumulative special-case pattern was found, because one
latest-observation reduction serves run and consolidated files alike. No remaining
slice-specific concern: every decisive premise above was observed. Slice 4's
rollout waits only for the human checkpoint. Sizing of slice 1 is the
largest; if it overruns, split the file-version match from the rows.
