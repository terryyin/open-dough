# Read frontend Vitest proof in both projects

**Identity:** SEED-192#read-vitest-proof
**Source:** [selected story](../../seeds/SEED-192-review-product-intent.md#read-vitest-proof)
in SEED-192, refined 2026-11-04 under Terry's instruction that, like the
pytest story, this story includes Vitest proof generation, declared in the
project configuration, as well as reading it.
**Prepared:** 2026-11-04. Planning only, in the story's established workspace
(branch `claude/read-frontend-vitest-proof-in-both-projects`, agent yilv-chan).

## Goal and boundaries

A Doughnut or Pygardon developer selecting a Vitest test file in Intent sees
each test's last successful committed proof beside its TypeScript source,
with the Vitest project named on every observation that has one, and a
location or folder summary gives the Gherkin summary's figures for Vitest.
Each project records that proof deliberately through a project-owned Vitest
reporter that follows a published Open Dough Vitest proof reference and is
declared with `runner`, `proof` and `proofGeneration` on its frontend Intent
location. The story's ten key examples are the evaluation; Terry judges the
first experience against `vitest run` output plus an editor
([ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md)).

Included scope, one source each:

- the Vitest proof reference
  `src/skills/dough-test-optimization/references/vitest-proof.md` and its link
  from `src/skills/dough-test-optimization/SKILL.md`;
- the dashboard's proof reading for a third family: the `runner` declaration
  (`dashboard/server/intentLocationsSettings.ts`, `dashboard/src/authenticatedIntentRead.ts`),
  the Vitest proof parser and project variant in the kind-neutral case model
  plan 459 introduces (`dashboard/src/cucumberProof.ts` and its successors,
  `dashboard/server/intentProofRead.ts`, `dashboard/server/intentLocationsRead.ts`),
  the TypeScript test-call row derivation beside `dashboard/src/gherkinScenarios.ts`,
  the unit words (`dashboard/src/proofScenarioCountLine.ts`), the Proof pane and
  summaries (`dashboard/src/IntentProof.tsx`, `dashboard/src/IntentSummary.tsx`
  and the summary modules it delegates to) and the explanations
  (`dashboard/src/IntentProofProblem.tsx`);
- the Intent guidance `docs/dashboard-development-intent.md`;
- Doughnut's reporter, its tests, its `.planning/open-dough.json` declaration
  and its first committed snapshot, in a subordinate Doughnut workspace;
- Pygardon's reporter, its tests, its declaration and its first committed
  snapshot, in a subordinate Pygardon workspace.

Material exclusions (from the story): Doughnut's CLI Vitest, Open Dough's
dashboard Playwright tests and Node `node:test` files (served by the row
derivation, no proof commitment), run wall time, CI comparison, staleness
rules, browser or runtime context beyond the project name, tests whose names
are not literals, observations the published file no longer defines,
`includeTaskLocation` as a project requirement, a cheaper root summary, and a
full-suite refresh of either frontend, which is Terry's deliberate run after
slices 3 and 4. Also outside this plan: the installed copies under
`.agents/skills/` and `.claude/skills/`, which update only from a released
payload (AGENTS.md), so the Vitest reference reaches the projects' installed
skills with the next release; execution reads it from this repository's
`src/skills/` meanwhile.

Assumptions: each project's publication follows its own guidance (Doughnut
AGENTS.md "Execution wrap-up": `./scripts/run.sh pnpm format:changed` once,
check-only lint hook, push; Pygardon AGENTS.md "Project-specific lifecycle
settings": `pnpm format:changed`, staged lint hook, CI adapter check before
the first slice there); the coordinator resolves each project's authorized
publication before delivery, as plan 446 did. Apply this repository's
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
throughout, including delegated work and CI repair; each project's guidance
also applies at its boundary. Local full suites follow
`tests/local-test-resources.md`: Bash 5 on PATH, and on AC power
`caffeinate -s -i` around the run
([machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos)).

## Direction and PFE

- **Third family of one case model.** Plan 459 (SEED-192#read-pytest-proof,
  Taken) lifts the Gherkin-only reader into a case model (file, case name
  path, optional variant, definition line) with per-kind row derivation and
  proof parsing. This plan adds Vitest to that model: the name path is the
  `describe` path plus the test name as Vitest formatted them, the variant
  is the project, and the count, duration-sum and slowest rules are reused
  unchanged. Nothing is duplicated; no second schema, adapter framework or
  plugin platform.
- **`runner` selects the proof format within a kind.** `typescript` cannot
  imply Vitest: Open Dough's own `dashboard/tests` is a `typescript` location
  whose tests are Playwright. A `typescript` or `javascript` location that
  declares `proof` also declares `runner` (`"vitest"` here); `gherkin` and
  `python` keep implying theirs. The settings parser already reads `proof`
  and `proofGeneration` for every kind, so `runner` joins them there and in
  the answer schema, with a `runner` problem explained like a malformed
  `proofGeneration`.
- **Vitest file format and identity** as the story records them: `file`,
  `test` (list of names), optional `project`, `outcome: "passed"`,
  `attempts`, `durationMs`, `finishedAt`, `commit`, `fileBlob`. A
  Cucumber- or pytest-shaped file under a Vitest location is malformed, and
  the reverse.
- **Source rows for TypeScript** from the published text, never from the
  runner: a nesting-aware reading of `describe`/`suite` and `it`/`test`
  calls with modifier chains, string-literal or substitution-free template
  names, each with its call's line; `.each`/`.for` names are templates whose
  placeholders match observed names. Both frontends are almost entirely
  literal-named (8 exceptions in Doughnut, none in Pygardon), so the rule is
  the natural one, not extra scope. The derivation serves every runner of
  this call family and is not per-runner.
- **Recording in each project** as a Vitest reporter in the configured
  `reporters` beside the existing ones, as Doughnut's `orchestratorGcReporter`
  already is in `frontend/vitest.config.ts` and as Pygardon's
  `vitest-quiet-reporter.ts` already shows a Pygardon-owned reporter. The
  reporter checks the option before any proof read, write or lock, records
  from the per-case result, treats the final result as the case's end, maps
  `retryCount + 1` to `attempts`, folds repeated executions of one identity
  into one observation (all must pass; durations summed; greatest attempts),
  clears on `failed`, keeps on skipped, and writes through a non-JSON
  temporary file renamed over `latest.json`. Each project generalizes its
  existing Cucumber proof store (`e2e_test/config/cucumberProofStore.mjs`,
  `e2e_test/plugins/cucumberProofStore.mts`) to the shared observation shape
  rather than adding a second store; the reference does not mandate that
  reuse, this plan selects it as PFE within each project.
- **Wording.** Test case, tests, test cases, and the project as the row's
  variant beside the existing scenario and pytest words; one place per word,
  parameterized by kind as plan 459 leaves it.
- **Accepted decisions.** [ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md)
  one Proof meaning with each runner's vocabulary; [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  reuse the reader, the format and each project's store, no generic adapter;
  [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
  the reference addresses the agent recording in the project; [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  proof and `runner` stay repository records read as published facts. No
  conflict, no new ADR, no North Star topic: the case model and `runner` are
  realized here and then explained by code, the Intent guidance and the
  reference.
- **Exposed, not selected:** one Open Dough-shipped Vitest reporter. With two
  near-identical project-owned reporters landed, a shared reporter becomes a
  measured refactoring for Terry to choose; this plan does not pre-empt it.

## Decisive premises

| Premise | Consuming operation, observed form, revision | Result | Unverified remainder |
| --- | --- | --- | --- |
| Vitest's reporter API delivers per finished case the project name, the module's repository path, the `describe` path and name, final state, `each`, duration and retry count, and one reporter sees every browser instance | Throwaway reporter (`onInit`, `onTestCaseResult`, `onTestRunEnd`) run 2026-11-04 in both default checkouts, writing nothing to them: Doughnut `d761d3f0da`, `./scripts/run.sh pnpm -C frontend exec vitest run --browser=chromium --browser.headless --includeTaskLocation --reporter=<probe> tests/toolbars/DonutMenu.search.touch.spec.ts tests/utils/titlePatternRender.spec.ts`; Pygardon `aac9adb94`, `nix develop -c scripts/check-worktree.sh pnpm -C frontend exec vitest run --includeTaskLocation --reporter=<probe> src/api/__tests__/verifyStatsFormat.test.ts` | Settled: Doughnut reported projects `["chromium","chromium-touch"]`, 3 cases under `chromium` from the plain spec and 2 under `chromium-touch` from the touch spec, each with `fullName`, `location`, `state: "passed"`, `duration`, `retryCount: 0`, `each: true` on the touch table; Pygardon reported project `""` and 17 cases with the same fields | a retried case's `duration` spanning attempts and `onTestCaseResult` firing once after the final attempt: slice 3's first reporter test observes a `retry: 1` pass |
| An `each` title without placeholders is left unchanged, so a table's rows run under one identical name | `formatTitle` in the installed Vitest 5.0.5 (`dist/chunks/run.*.js`): `%`-formats are substituted only where present and `$field` only for object rows; otherwise the template is returned as given | Settled by reading the consuming formatter; both corpora show 30 of 31 and 5 of 5 such names | none |
| Both frontends' names are literal enough for a source rule | `grep` over Doughnut `frontend/tests/**/*.spec.ts` at `d761d3f0da` (1839 `it(`, 170 `it.each(`, 568 `describe(`, 5 `describe.each(`, 8 non-literal first arguments, 1 template literal) and Pygardon `frontend/src` tests at `aac9adb94` (757 `it(`, 43 `it.each(`, 217 `describe(`, 0 non-literal) | Settled | none |
| The settings parser reads `proof` and `proofGeneration` for every kind; proof is read only for `gherkin`; `typescript` and `javascript` are listed kinds | `declaredLocations` in `dashboard/server/intentLocationsSettings.ts`, `proofOfLocation` in `dashboard/server/intentLocationsRead.ts`, `intentSourceKinds` in `dashboard/src/intentLocationSelection.ts` at `0fd49cba4` | Settled by source read; slice 5 replaces the gate through plan 459's model | plan 459's case model and 32 MiB bound are not on trunk at `4cc8cff1d`: slice 5 starts only once they are, see Current decisions |
| Each project's test commands and reporters stay as they are with the recorder loaded | Doughnut `frontend/vitest.config.ts` (`reporters: isCI ? ["default", orchestratorGcReporter()] : ["default"]`, `retry: isCI ? 1 : 0`, two instances), `frontend/package.json` `test`; Pygardon `frontend/vite.config.ts` (happy-dom, no reporters), `scripts/check-prepared-checkout.sh` (`--reporter=./vitest-quiet-reporter.ts`) | Settled by source read | whether a `--reporter` command-line option drops the configured recorder: slice 3 observes it in Pygardon and records the answer in the reference |

## Outside-in proof

| Story example | Owning slice | Observable signal |
| --- | --- | --- |
| Reference usable by the recording agent | 1, 3 and 4 | AGENTS.md behavior review walking examples 1–5 against the reference text; slices 3 and 4 implement from the reference alone and report every gap they had to fill |
| 2 focused recording, happy-dom; 3 tables; 4 retry and clearing | 3 | Pygardon reporter tests on fixture projects read `latest.json` after each run: option off leaves no file, nested path, `%i` table expands, placeholder-less table folds (one failing row clears), `retry: 1` pass records `attempts: 2`, failure clears only itself, `skip`/`only` keep, interrupted refresh keeps completed updates, outside Git records nothing, stdout and exit unchanged; one real focused run commits the first snapshot |
| 1 focused recording, browser mode; 5 projects | 4 | Doughnut reporter tests add the same file under two instances (two observations per test, one instance's failure clears only its own), a shard run, and the browser-mode real run of one plain spec and one touch spec committed as the first snapshot with `chromium` and `chromium-touch` |
| 10 Cucumber and pytest unchanged | 2 and 5 | The focused Intent proof, summary and generation journeys stay green with unchanged fixtures and expected rows after each dashboard slice |
| 6 file Proof, 7 folder summary, 8 declaration problems, 9 explanations | 5 | New Playwright journey on a Doughnut-like `typescript` location fixture with `runner: "vitest"`: headers, rows in definition order by `describe` path, template expansion, project rows, a test without proof, count line wording, `runner` missing and wrong-shape proof explanations, absence wording for `typescript` and the other-kinds sentence |
| 6–7 on real proof, root summary costs | 6 | Intent on projects Doughnut and Pygardon at the revisions that published slices 3 and 4: the recorded files' cases with their projects, a folder summary each, and each frontend root summary opened once with its time and GitHub request count recorded |

Local gates: the focused Playwright journeys named per slice and
`npm run typecheck:dashboard` after each dashboard slice; `npm run --silent format`
before each commit; in the subordinate workspaces, each project's own test
command for the reporter tests and `pnpm format:changed`. Hosted CI runs the
full suites after publication and its failures stay owned under the policy
above. Run the whole dashboard suite before publishing slice 5, since it
changes the proof answer every Intent journey reads
(`tests/local-test-resources.md`, with the sleep guard named above).

## Ordered slices

### 1. The Vitest proof reference tells a project how to record
Type: Behavior
Status: planned
Proof: `src/skills/dough-test-optimization/references/vitest-proof.md` exists
with the contract the story records (option, reporter placement, identity of
`file`/`test`/`project`, finished case, attempts and duration, folding of
repeated identities, clearing and keeping rules, atomic snapshot, one
snapshot per directory, `runner`/`proof`/`proofGeneration` declaration,
no `--reporter` on the recording command, commit discipline); the SKILL.md
links it beside the Cucumber and pytest references; an AGENTS.md behavior
review walks examples 1–5 against the text and is recorded here;
`npm run --silent format` clean.

Behavior: An agent in Doughnut or Pygardon asked to record Vitest proof →
reads the installed reference and can configure the option, write the
reporter and declare the location without asking Open Dough anything else.

### 2. Subordinate Doughnut and Pygardon workspaces are prepared
Type: Structure
Status: planned
Proof: `git worktree add` from each fetched trunk; Doughnut
`./scripts/run.sh bash scripts/worktree_setup.sh` then
`./scripts/run.sh pnpm -C frontend exec vitest list tests/utils/titlePatternRender.spec.ts tests/toolbars/DonutMenu.search.touch.spec.ts`
prints both files' cases; Pygardon `nix develop -c scripts/prepare-worktree.sh`
then `nix develop -c scripts/check-worktree.sh pnpm -C frontend exec vitest list src/api/__tests__/verifyStatsFormat.test.ts`
prints its 17 cases and `node scripts/pygardon-ci-adapter.mjs --check terryyin/pygardon main`
passes; a `CI deferred` result goes to Terry first (Pygardon AGENTS.md).
Doughnut's publication route is confirmed from its AGENTS.md before slice 4.

Internal change: the two subordinate workspaces this execution owns, at
recorded bases, with prepared environments. Enables slices 3 and 4. Keep both
default checkouts untouched.

### 3. Pygardon records Vitest proof on explicit request
Type: Behavior
Status: planned
Proof: Pygardon reporter tests (first a `retry: 1` fixture observing one
result per case with `retryCount`, then serial recording, option off, nested
`describe` path, `%i` table, placeholder-less table with one failing row,
failure clearing only itself, `skip` and `only`, interrupted refresh,
outside-Git no-op, `--reporter=./vitest-quiet-reporter.ts` with the option
on, unchanged stdout and exit) run through Pygardon's frontend test command;
`biome` clean; then one real
`RECORD_VITEST_PROOF=1 nix develop -c scripts/check-worktree.sh pnpm -C frontend test src/api/__tests__/verifyStatsFormat.test.ts`
writes `frontend/proof/latest.json` with 17 observations and no `project`
field, inspected for example 2's fields; the same command without the option
changes nothing.

Behavior: Pygardon's `frontend/src` location declares `runner: "vitest"`,
`proof: "frontend/proof"` and the real recording command → an explicit
recording run maintains the snapshot under the reference's rules; the
ordinary `pnpm -C frontend test`, the worktree wrapper and CI load the
reporter with recording off and behave as before. The reporter, its tests,
the declaration and the first snapshot are committed and published under
Pygardon's rules. Any rule the reference left unclear, including the
`--reporter` answer, is reported back and fixed in the reference in the same
slice.

### 4. Doughnut records Vitest proof on explicit request, per browser instance
Type: Behavior
Status: planned
Proof: Doughnut reporter tests (the same file under two browser instances
giving two observations per test and one instance's failure clearing only
its own, a `--shard=1/2` run leaving the other shard's observations, option
off, retried pass, failure clearing, unchanged stdout and exit) run through
Doughnut's frontend test command; `biome` clean; then one real
`RECORD_VITEST_PROOF=1 ./scripts/run.sh pnpm -C frontend test tests/utils/titlePatternRender.spec.ts tests/toolbars/DonutMenu.search.touch.spec.ts`
writes `frontend/tests/proof/latest.json` with 3 `chromium` and 2
`chromium-touch` observations, inspected for example 1's fields; the same
command without the option changes nothing.

Behavior: Doughnut's `frontend/tests` location declares `runner: "vitest"`,
`proof: "frontend/tests/proof"` and the real recording command → an explicit
browser-mode recording run maintains the snapshot with the project on every
observation; the ordinary `pnpm frontend:test`, its CI shards and
`orchestratorGcReporter` behave as before. The reporter, its tests, the
declaration and the first snapshot are committed and published under
Doughnut's rules; reference gaps are fixed as in slice 3.

### 5. Intent reads Vitest proof for a location that declares the runner
Type: Behavior
Status: planned
Proof: New `dashboard/tests/intent-vitest-proof.spec.ts` with a fixture
module (Doughnut-like `frontend/tests` location with `runner: "vitest"`, a
nested `describe`, an `it.each` with `%s`, a placeholder-less `it.each`, a
touch spec observed under `chromium-touch`, a test without proof, a
renamed test's stale observation, a `utils`-like subfolder) asserting
examples 6, 7, 8 and 9, including a location with `proof` and no `runner`, a
pytest-shaped proof file under the Vitest location, the `typescript`
absence wording naming the Vitest reference and the other-kinds sentence;
the existing Gherkin and pytest journeys unchanged; `npm run typecheck:dashboard`;
the whole dashboard suite before publication; `docs/dashboard-development-intent.md`
updated.

Behavior: A `typescript` location declares `runner: "vitest"`, `proof` and
`proofGeneration` → Intent reads the Vitest proof files at the revision, a
selected test file's Proof lists its tests in definition order by `describe`
path with template rows expanded to observed names, project rows and _No
successful proof_ rows, the count line counts test cases, a location or
folder summary gives the Gherkin figures with test and test-case words, and
the explanations name the Vitest reference and the `runner` setting.

### 6. Intent shows both frontends' published Vitest proof
Type: Behavior
Status: planned
Proof: Open the dashboard on project Doughnut at the revision that published
slice 4: `frontend/tests/utils/titlePatternRender.spec.ts` shows example 6's
cells, `DonutMenu.search.touch.spec.ts` shows its `chromium-touch` rows,
`frontend/tests/utils` shows example 7's lines, and the `frontend/tests`
root summary is opened once with its time and GitHub request count recorded
as a learning. Then project Pygardon at the revision that published slice 3:
`src/api/__tests__/verifyStatsFormat.test.ts` with its 17 rows, its folder
summary, and the `frontend/src` root summary measured the same way. Record
the retained observations in this plan's retained-proof fields; Terry's
evaluation against `vitest run` plus an editor is the story's acceptance.

Behavior: Both published snapshots → Intent reads them as examples 6–7
describe on real source; nothing is fabricated for the demonstration.

## Current decisions

- Each project owns its reporter and generalizes its own proof store; Open
  Dough ships the reference and the reader. A shared payload reporter is
  Terry's later choice, now measurable against two real copies.
- `runner` is a location setting, required beside `proof` on `typescript`
  and `javascript` locations; `gherkin` and `python` imply theirs.
- The project is the row's variant; `describe` path plus name is the case
  name path; template placeholders match observed names; a placeholder-less
  table is one case folded from its executions.
- Slices 1–4 do not depend on plan 459. Slice 5 extends plan 459's case
  model and read bound: at its start, confirm trunk contains plan 459's
  slices 1 and 3; if not, stop at that boundary and report the coordination
  boundary rather than rebuilding the model, since another execution owns
  that repair. Slices 1–4 are a safe stopping point.
- Snapshot sizes stay under plan 459's 32 MiB bound by a wide margin; no
  further bound change.

## Learnings

None yet.

## Concern evidence

Slice-plan refinement was not needed: each slice owns one proof loop, the
Structure slice sits immediately before the Behaviors it enables, and the
sequence exercises one case model with one new declaration rather than a
Vitest-shaped copy. No slice-specific concern remains. Interim behavior:
between slices 3–4 and 5, both projects publish Vitest proof that Intent
cannot yet read; their `typescript` locations keep the honest other-kinds
wording until slice 5 replaces it, so this needs no replacing slice. The
`--reporter` and retry-duration remainders are bounded by slice 3's first
tests; the plan 459 ordering is bounded by the stop in Current decisions.
