# Remove tests that only assert configuration or data

**Identity:** SEED-354#remove-configuration-only-tests
**Source:** [selected story](../../seeds/SEED-354-remove-configuration-only-tests.md#remove-configuration-only-tests)

## Goal and scope

A maintainer changes internal configuration or test data, consistently, and no
test needs editing merely because it copied that value. Tests that catch real
regressions (inconsistent settings, lost reports, broken selection, useful
rejections, overwritten files) keep failing on those regressions.

Included: the candidate sites below, found across Distribution, dashboard
backend/frontend/integrated UI and e2e, plus any sibling assertion of the same
shape a slice finds while working in the same file or family.

Already done on trunk before execution: tests that only restated shipped
skill and reference wording (the former `*-guidance.test.mjs` family); no
slice owns them.

Exclusions: rendered style values; files the product writes after a user
action; production code and CI configuration (changed only as reverted scratch
probes).

## Existing solutions and direction

- No new helper or framework. Where a behavior test's expected output copies a
  configured value, derive the expectation from the configuration the test
  already reads (for example the CI proof summary's declared `expect` input),
  or compare before/after state, following the existing
  `machineRecordNames` before/after pattern in
  `e2e/configuration/system-settings-feedback-maintenance.spec.ts`.
- A check that two settings agree with each other stays: it fails on an
  inconsistent change, which is a real regression (observed below).
- Resolve test conventions through [dough-makeme](../../../.agents/skills/dough-makeme/SKILL.md)
  and, for browser tests, [dough-page-objects](../../../.agents/skills/dough-page-objects/SKILL.md);
  `.planning/open-dough.json` selects MakeMe for every location here and page
  objects for `e2e`, `dashboard/tests` and `dashboard/frontend-tests`. Edits
  here mostly remove or narrow assertions; a reshaped assertion uses the
  file's existing builders and page objects.

## Decisive premises and observations

| Consuming operation / premise | Observation and limits |
| --- | --- |
| A consistent CI layout change fails tests that only restate it, while consistency checks still pass | Scratch edit of `.github/workflows/ci.yml` at `706387653` in this workspace: e2e `shards` 5→4 with the summary's `expect: e2e=4`, test-run deadline 320→330 s (step name and expression), `retention-days` 7→14. `bash scripts/test.sh` on `ci-browser-groups`, `ci-proof-declaration`, `ci-proof-actions`, `ci-proof-frontend-report`, `test-runner-deadline-cutoff`, `browser-group-shards`, `ci-container-workflow.sh`, `native-setup.sh` and `ci-workflow-path-policy` failed exactly: `test-runner-deadline-cutoff` "ci.yml establishes the 320s test-run epoch…", `ci-browser-groups` "each browser group's job names its own command, settings, root and shards", and `ci-proof-actions` (expected text "part 2 of 5 missing…" copied from the real workflow). Edited `ci.yml` reverted. |
| An inconsistent change is still caught | Same scratch edit before updating `expect`: `ci-proof-declaration` "the declared parts and units equal the matrix lengths…" and `ci-proof-actions` (fragment "of 4, but e2e declares 5 parts") failed. These stay as the consistency proof. |
| The dashboard's CI-time reading of the repository's own workflow survives a shard change | `ci-time-without-runner-waits.spec.ts` (backend config) passed 9/9 with the scratch shard change. Its last test's hand-written job labels may still break on a job rename; slice 1 judges it with a scratch rename. |
| Local concurrency defaults live in one place each | `scripts/test.sh:43` `default_job_slots=4` (CI: `getconf _NPROCESSORS_ONLN`) and `dashboard/tests/support/runnerConfig.mjs:140` `workers: ci ? availableParallelism() : 2`, read at `706387653`. `local-test-suite.test.mjs` queues `max(cores, 4) + 1` checks, so "fewer than all" is observable on any machine. |
| Remaining candidate sites | Read-only survey of each area at `706387653`, with spot reads of `local-test-suite.test.mjs`, `frontend-test-proof.test.mjs`, `story-columns-prefix.spec.ts`, `project-configuration.spec.ts` and `agent-launch-options-rules.spec.ts`. Each slice starts with its scratch value change, which both confirms its sites and is its proof. Not decisive: every slice applies the same rule and probe, so a survey site that proves to be behavioral stays unchanged, and an unlisted site of the same shape joins its slice, without changing the slice's approach or proof. |

## Outside-in proof ownership

Every slice proves the story's examples the same way, with its scratch probe in
this workspace, reverted before commit:

1. **Consistent change stays green:** change the slice's configuration or data
   value consistently and run the slice's family. Before the slice the sites
   the probe reaches fail; after it they pass.
2. **Real regression still fails:** apply the slice's named inconsistent change
   or behavior break and run the same family; at least one remaining test fails.
3. The family passes on the unmodified checkout.

Record each probe's literal change, command and result in the slice's accepted proof.

## Ordered slices

### 1. CI workflow layout changes need no test edits
Type: Behavior
Status: planned
Proof: probe as in the observation above (shards, deadline, retention) plus a
scratch rename of one browser group job; inconsistent `expect` still fails
`ci-proof-declaration` and `ci-proof-actions`; reverting the pull-request
head preference in both workflows fails the reshaped revision check.

Behavior: a maintainer changes CI shards, deadlines, retention or job names
consistently → the CI-declaration family stays green, while an inconsistent
declaration or a lost pull-request head revision still fails. Sites:

- `Distribution/tests/support/test-runner-deadline-cutoff.test.mjs` "ci.yml
  establishes the 320s test-run epoch…": remove; the file's cutoff behavior
  tests stay.
- `Distribution/tests/support/frontend-test-proof.test.mjs` "artifact and file
  names match the CI upload declaration": remove; the frontend report replay
  covers the upload.
- `Distribution/tests/support/ci-browser-groups.test.mjs`: remove the literal
  job/command/settings/shard table and the literal YAML-line regexes; keep the
  check that the shared workflow hard-codes no group value and the uniqueness
  and root-in-locations checks.
- `Distribution/tests/support/ci-proof-declaration.test.mjs`: remove the
  `frontend-entry`/retention literals, the per-producer input `deepEqual`, the
  literal browser-job-name list and the literal half of the attempt-fragment
  test; keep `needs` = producers and declared parts = matrix lengths. Reshape
  "both workflows name a pull request's head as CI_PROOF_REVISION…" to replay
  the proof action under a `pull_request` event and observe the head revision.
- `Distribution/tests/support/ci-proof-actions.test.mjs`: derive the expected
  "part N of M missing" counts from the summary step's declared `expect`.
- `Distribution/tests/support/browser-group-shards.test.mjs` "the integrated
  specs keep the feature groups under dashboard/tests": remove the literal
  directory set unless it guards a partition the other tests in the file do not.
- `Distribution/src/skills/dough-execute-plan/scripts/ci-workflow-path-policy.test.mjs`
  "readCiPathIgnorePolicy sees this repository's actual … ci.yml": keep
  `supported === true`, drop the literal path lists.
- `dashboard/backend-tests/intent/ci-time-without-runner-waits.spec.ts` "this
  repository's own workflow keeps every job it reports readable": if the
  scratch rename fails it, build the reported rows from the workflow's parsed
  jobs and assert a duration, not the literal 360 s.

### 2. CI setup script changes need no test edits
Type: Behavior
Status: planned
Proof: scratch change of the Node/npm cache deadline (60→90 s, consistently in
name, expression and `timeout-minutes`), one `scripts/ci-container.sh` line
the container test copies, and the lint tool's pinned digest in its declaring
script → family green; a digest mismatch and the native-setup negative gates
(`restore-keys`, `--with-deps`, `always()`) still fail when broken.

Behavior: a maintainer adjusts CI setup timings, container script text or a
pinned tool version → `Distribution/tests/native-setup.sh` (workflow block
literal `expect_in_log` greps), `ci-container-workflow.sh` (literal source
lines and exact `dashboard_install` string), `ci-lint-setup.sh` (literal
digests and curl flags) and `install-preserves-open-dough-json.sh`
(`assert_not_managed` source greps, already covered by `assert_config_absent`)
stay green; acquisition failure, digest rejection and the remaining
container/CI agreement checks keep failing on real breaks.

### 3. Local runner concurrency defaults change without test edits
Type: Behavior
Status: planned
Proof: scratch change of `default_job_slots=4` in `scripts/test.sh` (to 3) and
the local `workers: … : 2` in `dashboard/tests/support/runnerConfig.mjs` (to
3) → both tests green; a local default that starts every queued check at once,
or ignoring `OPEN_DOUGH_TEST_JOBS`/`--workers`, still fails.

Behavior: `Distribution/tests/support/local-test-suite.test.mjs` "local
repository defaults to four jobs…" and "native Playwright config shares
repository admission…" keep their exact counts where the test supplies them
(overrides) or observes them (CI = available cores). The repository local
default case asserts a bounded run instead of the literal 4: with more checks
queued than CI's concurrency, a local run starts at least one check and fewer
than all of them before a slot frees. The dashboard test drops the literal
`"2"` workers check; its admission, focus, override and CI cases stay. Rename
the first test so its title states that behavior, not the number.

### 4. Test data and builder changes need no test edits
Type: Behavior
Status: planned
Proof: scratch changes: one more commit in `storyColumnsRepository`'s history,
a renamed Distribution location label, the page-object fixture builders'
default settings, the share-deal fixture's run count → family green; a worker
that skips building history, a scheduled source losing MakeMe selection, or a
broken selection run still fails.

Behavior: tests compare against what the builder or fixture produced, or
observe its effect, rather than its literal output. Sites:
`dashboard/backend-tests/runtime/story-columns-prefix.spec.ts` (literal `"5"`
revisions and `commitsTraced` 5 → the built history's own count);
`Distribution/tests/makeme-scheduled-selection.test.mjs` (drop the
`"Distribution Tests"` label assertion);
`Distribution/tests/support/page-object-native-fixture.test.mjs` and
`page-object-makeme-fixture.test.mjs` (drop assertions on the builder's
returned paths and settings; keep the selection runs);
`Distribution/tests/support/share-deal-recorded-runs.test.mjs` (fixture sizes
416/417/84, unless a count is the computed result the example promises);
`dashboard/backend-tests/runtime/production-application-source.spec.ts`
(`first.gh`/`second.gh` fixture-factory lines);
`dashboard/backend-tests/runtime/observation-measurements.spec.ts` (redundant
`expect(done).toBeDefined()` before the guarding throw).

### 5. Shipped product data changes need no test edits
Type: Behavior
Status: planned
Proof: scratch changes: add a fifth project to `dashboard/server/projectConfigurationSeed.ts`,
add one more machine record file the dashboard writes at start, add a summary
to `refinement-options.json`, change one icon size declaration → e2e and
dashboard families green; first start not writing the seed, an action
changing another machine record, or a declared icon not resolving to its
supplied bytes still fails.

Behavior: sites:
`dashboard/backend-tests/launches/agent-launch-options-rules.spec.ts` "the
shipped definition is valid…" (remove; the integrated options spec renders
every shipped entry, and seed example 3 applies);
`e2e/configuration/project-configuration.spec.ts` "production seeds its four
projects…" (the saved file equals the seed the product ships and the radio
group shows those projects, without the literal list or count 4);
`e2e/configuration/system-settings-openai.spec.ts` (`toHaveLength(4)` on the
production projects; the unchanged-file check stays);
`e2e/configuration/project-remove.spec.ts` and
`e2e/launches/agent-launch-continuation.spec.ts` (literal machine-record name
lists → before/after comparison);
`e2e/runtime/browser-identity.spec.ts` (drop the exact `<link>` attribute list;
keep that the tab and touch icons are declared and serve the supplied bytes).

## Current decisions

- Remove, do not replace: a removed assertion gets no new snapshot of the same
  value. A reshape observes an effect or compares with the value the test
  itself read or built.
- Guidance check: the [test automation instructions](../../../AGENTS.md#test-automation)
  resolve plain restatements, but two survey examples are not stated
  explicitly. (a) A check that two settings agree is not a restatement and
  stays. (b) A behavior test whose expected output copies a configured value
  should derive the expectation from that configuration. The execution-complete
  `Product advice:` suggests one focused clarification covering both, plus any
  further unresolved example found during execution. AGENTS.md is not edited
  in this story.

## Verification, sizing and concern review

- Local gate: each slice's families, through `bash scripts/test.sh <paths>` for
  Distribution checks (Homebrew Bash first on `PATH`) and
  `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES node node_modules/playwright/cli.js test --config <config> <paths> --reporter=list`
  for `dashboard/backend.playwright.config.ts`,
  `dashboard/integrated.playwright.config.ts` and `e2e/playwright.config.ts`.
  Include every test in a touched file and the file's consumers (shared
  fixtures such as `ci-proof-action-fixtures.mjs`). Run `npm run lint` and,
  when a TypeScript spec changes, `npm run typecheck:dashboard`. A fresh
  worktree needs `node scripts/setup-native.mjs npm` and `browser` first. No
  whole local suite is required; hosted CI runs the full suites after
  publication.
- Long local runs follow the maintained
  [macOS sleep guard and power condition](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos):
  on AC use `caffeinate -s -i`; on battery plug in, or run awake with the lid
  open under `caffeinate -i` and read the sleep log afterwards.
- Failure policy: [Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests)
  applies as written, including local/CI differences and owned CI repair.
- Cumulative design: one rule throughout (remove restatements, keep
  consistency and behavior, derive copied expectations); slices split by
  which kind of value a maintainer changes, each with its own probe. Every
  slice is a safe stop.
- Refinement: not needed; five Behavior slices, each with one maintainer
  outcome and probe loop, no preparatory Structure.
- Remaining slice-specific concerns: none identified. Site lists come from a
  read-only survey; each slice's first probe confirms them, and an extra site
  of the same shape found there is in scope.
