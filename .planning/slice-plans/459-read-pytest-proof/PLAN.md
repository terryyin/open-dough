# Read Pygardon pytest proof

**Identity:** SEED-192#read-pytest-proof
**Source:** [selected story](../../seeds/SEED-192-review-product-intent.md#read-pytest-proof)
in SEED-192, refined 2026-11-04 under Terry's instruction that the story
includes pytest proof generation, declared in the project configuration, as
well as reading it.
**Prepared:** 2026-11-04. Planning only, in the story's established workspace
(branch `claude/read-pygardon-pytest-proof`, agent DavidKo-chan).

## Goal and boundaries

A Pygardon developer selecting a pytest file in Intent sees each test case's
last successful committed proof beside its Python source, and a location or
folder summary gives the Gherkin summary's figures for pytest. Pygardon
records that proof deliberately through a project-owned pytest plugin that
follows a published Open Dough pytest proof reference and is declared with
`proof` and `proofGeneration` on its `tests` Intent location. The story's ten
key examples are the evaluation; Terry judges the first experience against
`pytest -q` output plus an editor
([ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md)).

Included scope, one source each:

- the pytest proof reference
  `src/skills/dough-test-optimization/references/pytest-proof.md` and its link
  from `src/skills/dough-test-optimization/SKILL.md`;
- the dashboard's proof reading, generalized from Gherkin-only to a
  kind-neutral case model (`dashboard/src/cucumberProof.ts`,
  `dashboard/server/intentLocationsRead.ts`, `dashboard/server/intentProofRead.ts`,
  `dashboard/src/authenticatedIntentRead.ts`, `dashboard/src/IntentProof.tsx`,
  `dashboard/src/IntentSummary.tsx` and the summary modules it delegates to,
  `dashboard/src/IntentProofProblem.tsx`, `dashboard/src/proofScenarioCountLine.ts`);
- the proof read bound in `dashboard/server/ghRead.ts`;
- the Intent guidance `docs/dashboard-development-intent.md`;
- Pygardon's plugin, its tests, its `.planning/open-dough.json` declaration
  and its first committed snapshot, in a subordinate Pygardon workspace.

Material exclusions (from the story): other Python trees and projects, run
wall time, CI comparison, staleness rules, observations the published file no
longer defines, dynamically generated tests, a cheaper root summary,
rerun plugins, and a full-suite Pygardon refresh, which is Terry's deliberate
run after slice 5. Also outside this plan: the installed copies under
`.agents/skills/` and `.claude/skills/`, which update only from a released
payload (AGENTS.md), so the pytest reference reaches Pygardon's installed
skills with the next release; execution reads it from this repository's
`src/skills/` meanwhile.

Assumptions: Pygardon's publication follows Pygardon's own guidance
(`AGENTS.md` "Project-specific lifecycle settings": `pnpm format:changed`,
staged lint hook, CI adapter check before the first slice there); the
coordinator resolves Pygardon's authorized publication before delivery, as
plan 446 did. Apply this repository's
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
throughout, including delegated work and CI repair; Pygardon's guidance also
applies at its boundary. Local full suites follow
`tests/local-test-resources.md` (Bash 5 on PATH, `caffeinate -s -i` on AC).

## Direction and PFE

- **Reuse the proof model, not its Gherkin shape.** `cucumberProof.ts` already
  owns identity, latest-first reduction and the successful-only view;
  `intentProofRead.ts` reads a proof directory once per revision;
  `proofScenarioCountLine.ts`, `intentSummaryCoverage.ts`,
  `intentSummaryProofCost.ts` and `IntentSummarySlowest.tsx` derive every
  summary figure from `ObservedRow` (a source row with its observation). The
  Gherkin-specific parts are the field names (`feature`, `scenario`,
  `example`, `featureBlob`), the row derivation (`gherkinScenarios.ts`), the
  `kind === "gherkin"` gates (`proofOfLocation`, `IntentSummary`) and the unit
  words. Slice 1 lifts those into a case model with per-kind derivation and
  parsing; nothing else is duplicated. No second schema, adapter framework or
  plugin platform.
- **Pytest file format and identity** as the story records them: `file`,
  `test`, optional `parameterId`, `outcome: "passed"`, `attempts`,
  `durationMs`, `finishedAt`, `commit`, `fileBlob`. The reader selects the
  parser by the location's kind; a Cucumber-shaped file under a `python`
  location's proof directory is malformed, and the reverse too.
- **Source rows for Python** from the published text, never from the runner:
  module-level `def test_*` and `async def test_*`, and `test_*` methods of
  `Test*` classes by indentation, each with its definition line; a function's
  observed parameter ids expand to rows under it. Pygardon's suite has only
  module-level functions today (4483, 114 async), so the class rule is the
  natural pytest rule, not extra scope.
- **Read bound.** `GitHubRequests` bounds one answer at 1 MiB by default and
  `ghRead.ts` passes no bound; a Pygardon snapshot is 1.5–3 MB. Raise the
  bound for GitHub answers to 32 MiB in `ghRead.ts` (one process-wide
  instance) and name that bound in the reference. Source and listing reads are
  unaffected by a larger bound.
- **Recording in Pygardon** with the plugin pattern it already has
  (`scripts/ci_crash_evidence.py`): controller-only, loaded through a `-p`
  entry or `pytest_plugins`, exercised by `pytester`. The plugin checks the
  option before any proof read, write or lock, records from
  `pytest_runtest_logreport`, treats the teardown report as the case's end,
  sums the three phases' `duration`, and clears on any executed non-pass,
  including `wasxfail` outcomes. Snapshot writes go through a non-JSON
  temporary file renamed over `tests/proof/latest.json`.
- **Wording.** Test case, test functions, Parameters: beside the existing
  scenario words; one place per word, as `proofScenarioCountLine.ts` and
  `scenarioWords` are today, parameterized by kind.
- **Accepted decisions.** [ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md)
  one Proof meaning with each runner's vocabulary; [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  reuse the reader and format, no generic adapter; [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
  the reference addresses the agent recording in Pygardon; [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  proof stays a repository record read as a published fact. No conflict, no
  new ADR, no North Star topic: the case model is realized in this story and
  then explained by code and the reference.

## Decisive premises

| Premise | Consuming operation, observed form, revision | Result | Unverified remainder |
| --- | --- | --- | --- |
| GitHub answers are bounded at 1 MiB, so a 2 MB proof file fails to read today | Read `src/skills/dough-execute-plan/scripts/github-requests.mjs` constructor (`maxBufferBytes = 1024 * 1024`) and `dashboard/server/ghRead.ts` construction (no `maxBufferBytes`) at `e2a305704` | Settled: slice 3 raises it and proves a 2 MB fixture reads | none |
| Proof is read only for `gherkin` locations and rows come only from Gherkin text | `proofOfLocation` in `dashboard/server/intentLocationsRead.ts`, `IntentSummary.tsx`'s `gherkin` gate, `IntentProof.tsx` using `scenarioRowsOf` at `e2a305704` | Settled by source read; slices 1–2 replace these gates | none |
| Pygardon's `tests` location is `python` with `**/test_*.py` and declares no proof; its wrapper passes the environment to pytest | `.planning/open-dough.json`, `scripts/check-worktree.sh`, `scripts/worktree_pytest.py` (`env={**os.environ, …}`) at Pygardon `aac9adb94` | Settled by source read | none |
| Pygardon test cases are module-level functions the static rule names | `grep` over `tests/**/test_*.py` at `aac9adb94`: 4483 `def test_`, 114 `async def test_`, 0 indented `def test_`, 0 `class Test` | Settled | parametrized expansion count: `pytest --collect-only` failed in the default checkout on a stray ignored `tests/.venv/`; slice 5 observes it in the fresh subordinate workspace |
| xdist re-emits every worker's `pytest_runtest_logreport` on the controller, so a controller-only recorder sees every case once | pytest-xdist's documented controller reporting; Pygardon's `ci_crash_evidence.py` relies on controller-side hooks | Open: not observed in this preparation | slice 5's first `pytester` test runs `-n 2` before the plugin's design is fixed; if false, record in workers under the Cucumber reference's serialization rule |
| Existing Intent proof journeys pass in this workspace at the base | `env -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts --reporter=list dashboard/tests/intent-cucumber-proof.spec.ts dashboard/tests/intent-cucumber-proof-absent.spec.ts dashboard/tests/intent-summary-proof-cost.spec.ts dashboard/tests/intent-summary-slowest.spec.ts dashboard/tests/intent-entry-folder-summaries.spec.ts dashboard/tests/intent-proof-generation.spec.ts` after `npm ci` at `e2a305704` | Settled: **19 passed in 22.7 s** (2026-11-04), after `node scripts/setup-native.mjs check` passed with Chromium 153.0.8010.12; existing behavior observation, not proof of the new behavior | none |

## Outside-in proof

| Story example | Owning slice | Observable signal |
| --- | --- | --- |
| 10 Cucumber unchanged | 1 | The focused Intent proof, summary and generation journeys above stay green with unchanged fixtures and expected rows |
| 6 file Proof, 9 explanations | 2 | New Playwright journey on a Pygardon-like `python` location fixture: table headers and rows in definition order, parametrized expansion, a function without proof, count line wording, absence wording for `python` and for `typescript`, malformed proof retry |
| 7 folder summary | 2 | The same fixture's folder summary: test-function total, proof count line, summed duration with coverage, slowest cases, children, Partial on an unread file, drill-down to a file and to a definition line |
| 8 snapshot above 1 MiB | 3 | A served 2 MB proof snapshot renders rows; the raw read is not refused |
| 1–5 recording, parametrization, parallel, selection, executed non-pass | 5 | Pygardon `pytester` runs read `latest.json` after each run: option off leaves no file, serial and `-n 2` runs record each case once, `[down]` failure clears only itself, `-m` deselection and `skip` keep proof, `xfail`/`xpass`/setup error/teardown failure clear, output and exit unchanged; one real focused run commits the first snapshot |
| 6–7 on real proof, root summary cost | 6 | Intent on project Pygardon at the published revision shows `tests/test_cors.py` (or the recorded file) with its proof and a subfolder summary; the `tests` root summary's read time and request count are recorded |
| Reference usable by the recording agent | 2 and 5 | AGENTS.md behavior review walking examples 1–5 against the reference text; slice 5 implements from the reference alone and reports every gap it had to fill |

Local gates: the focused Playwright journeys named per slice and
`npm run typecheck:dashboard` after each dashboard slice; `npm run --silent format`
before each commit; Pygardon's `nix develop -c scripts/check-worktree.sh pytest <plugin tests>`
and `pnpm format:changed` in the subordinate workspace. Hosted CI runs the
full suites after publication and its failures stay owned under the policy
above. Run the whole dashboard suite before publishing slice 1's shared
reader change, since it changes the proof answer every Intent journey reads
(`tests/local-test-resources.md`).

## Ordered slices

### 1. Proof reading rests on a kind-neutral case model
Type: Structure
Status: planned
Proof: The focused journeys in the decisive-premises table stay green with
their fixtures and expected rows unchanged; `npm run typecheck:dashboard`
passes; the consumer-trace record lists every importer of the renamed
symbols with a `run` or `reused` disposition. Whole dashboard suite before
publication, per the gate above.

Internal change: one case model (file, case name path, optional variant,
definition line) with one identity, latest-first reduction, count line,
duration sum and slowest derivation; Cucumber proof files parse into it
(feature → file, scenario → case, example → variant, featureBlob →
fileBlob) and Gherkin rows derive through the same `ObservedRow` path; the
unit words come from the kind. The on-disk Cucumber format, the Gherkin
wording and the server answer's Gherkin fields stay as they are. Enables
slice 2.

### 2. Intent reads pytest proof for a python location
Type: Behavior
Status: planned
Proof: New `dashboard/tests/intent-pytest-proof.spec.ts` with a fixture
module (Pygardon-like `tests` location, one parametrized function, one
`async def`, one function without proof, one renamed function's stale
observation, a `tests/search_run`-like subfolder) asserting examples 6, 7
and 9, including the `typescript` wording and malformed-file retry; the
existing absence journey updated for the new other-kinds sentence;
`npm run typecheck:dashboard`; the AGENTS.md behavior review of the
reference against examples 1–5, recorded in this plan.

Behavior: A `python` location declares `proof` and `proofGeneration` →
Intent reads the pytest proof files at the revision, a selected `.py` file's
Proof lists its test cases in definition order with observed parameter rows
and _No successful proof_ rows, the count line counts test cases, a location
or folder summary gives the Gherkin figures with test-function and test-case
words, and the explanations name the pytest reference. This slice also
publishes `pytest-proof.md` and its SKILL.md link, and updates
`docs/dashboard-development-intent.md`.

### 3. A multi-megabyte proof snapshot is read
Type: Behavior
Status: planned
Proof: A journey or server test serving a proof file above 1 MiB (about 2 MB
of generated passing observations) through the test GitHub stand-in: the
location's Proof renders rows, no read failure; the reference names the
bound.

Behavior: A published snapshot of 2 MB → Intent reads it; the GitHub answer
bound in `ghRead.ts` is 32 MiB.

### 4. Pygardon workspace is prepared and its CI route checked
Type: Structure
Status: planned
Proof: `git worktree add` from fetched Pygardon trunk,
`nix develop -c scripts/prepare-worktree.sh`, then
`nix develop -c scripts/check-worktree.sh pytest --collect-only -q`
prints the collected count (recorded as a learning), and
`node scripts/pygardon-ci-adapter.mjs --check terryyin/pygardon main`
passes; a `CI deferred` result goes to Terry first (Pygardon AGENTS.md).

Internal change: the subordinate Pygardon workspace this execution owns, at
a recorded base, with its prepared environment. Enables slice 5. Keep
Pygardon's default checkout untouched.

### 5. Pygardon records pytest proof on explicit request
Type: Behavior
Status: planned
Proof: Pygardon `pytester` tests (first the `-n 2` controller observation,
then serial recording, option off, parametrized clear, `-m` and `skip`
keep, `xfail`, `xpass`, setup error, teardown failure, `--collect-only`,
outside-Git no-op, interrupted refresh keeping completed updates, unchanged
stdout and exit) run through
`nix develop -c scripts/check-worktree.sh pytest tests/test_pytest_proof.py`
(name chosen there); `ruff` clean; then one real
`RECORD_PYTEST_PROOF=1 nix develop -c scripts/check-worktree.sh pytest tests/test_cors.py`
(or another small real file) writes `tests/proof/latest.json`, inspected for
example 1's fields; the same command without the option changes nothing.

Behavior: Pygardon's `tests` location declares `proof: "tests/proof"` and the
real recording command → an explicit recording run maintains the snapshot
under the reference's rules; ordinary `pytest`, the worktree wrapper and CI
load the plugin with recording off and behave as before. The plugin, its
tests, the declaration and the first snapshot are committed and published
under Pygardon's rules. Any rule the reference left unclear is reported
back and fixed in the reference in the same slice.

### 6. Intent shows Pygardon's published pytest proof
Type: Behavior
Status: planned
Proof: Open the dashboard on project Pygardon at the revision that published
slice 5: the recorded file's Proof shows its cases with example 6's cells,
`tests/search_run` (or the recorded file's folder) shows example 7's lines,
and the `tests` root summary is opened once with its time to complete and
the GitHub request count recorded as a learning. Record the retained
observation in this plan's retained-proof fields; Terry's evaluation against
`pytest -q` plus an editor is the story's acceptance.

Behavior: Pygardon's published snapshot → Intent reads it as examples 6–7
describe on real source; nothing is fabricated for the demonstration.

## Current decisions

- Pygardon owns the plugin; Open Dough ships the reference and the reader.
  A shared payload plugin is a later choice for Terry once a second pytest
  project appears.
- One snapshot per proof directory; the reader's answer bound is 32 MiB.
- Parametrized rows are observation-derived; the inventory line counts test
  functions and the proof lines count test cases.
- The root `tests` summary keeps the shared read-every-file behavior; its
  measured cost in slice 6 informs a follow-up.

## Learnings

None yet.

## Concern evidence

Slice-plan refinement was not needed: each slice owns one proof loop, the
Structure slices sit immediately before the Behavior they enable, and the
sequence exercises one case model rather than special cases per kind. No
slice-specific concern remains. Interim behavior: between slices 2 and 5,
Intent can read pytest proof while Pygardon publishes none; a `python`
location without `proof` keeps its honest absence wording, so this needs no
replacing slice. The xdist premise is bounded by slice 5's first test.
