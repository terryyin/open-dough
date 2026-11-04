# Read Pygardon pytest proof

**Identity:** SEED-192#read-pytest-proof
**Source:** [selected story](../../seeds/SEED-192-review-product-intent.md#read-pytest-proof)
in SEED-192, refined 2026-11-04 under Terry's instruction that the story
includes pytest proof generation, declared in the project configuration, as
well as reading it.
**Source review:** [source-review.md](source-review.md)
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
Status: done
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

Accepted proof (2026-11-04): the six focused journeys 19 passed with
unchanged fixtures; 48 consumer specs (folder proof and summaries, Doughnut
Cucumber, Purpose/Proof tabs, drill-down, candidates, authenticated-read
boundaries) passed; `npm run typecheck:dashboard`; `bash scripts/test.sh
tests/support/intent-summary-proof-cost.test.mjs …` quiet pass; after the
refactor 23 focused passed; whole dashboard suite under `caffeinate -s -i`
1977 passed, 1 skipped (30.8 min, load 7–9). Consumer trace in the
implementation return: every renamed symbol's importer run or reused.

### 2. Intent reads pytest proof for a python location
Type: Behavior
Status: done
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

Accepted proof (2026-11-04): `intent-pytest-proof.spec.ts`,
`intent-pytest-proof-summary.spec.ts` and `intent-pytest-proof-absent.spec.ts`
7 passed (rerun after the refactor's fixture split); every
`dashboard/tests/intent-*.spec.ts` and
`boundary/authenticated-read-intent-*.spec.ts` 104 passed;
`npm run typecheck:dashboard`; payload and install shell tests
(`tests/payload-declaration-links.sh`, `install*.sh`, update payload tests)
quiet pass. The empty-selection prompts now read "Select a file to see its
Proof." and "Select a file to read its Purpose."; the slowest table's row key
includes the variant, since parametrized rows share a line. Per-id
observations are in [source-review.md](source-review.md).

Behavior review of `pytest-proof.md` (AGENTS.md), examples 1–5 against the
reference alone: 1 recording run (option checked before any read/write/lock,
commit at session start, `fileBlob` from `git hash-object`, output and exit
unchanged), 2 parametrized identity (parameter id from the first `[` after
the file; a failing id removes only itself), 3 controller-only under xdist
(`workerinput`), 4 skip/deselection/`--collect-only`/unreached keep proof,
5 setup/call/teardown failure, xfail and xpass clear: each implementable
from the text. One gap fixed during review: xpass under `strict` is reported
as a failure, not with `wasxfail`. Example 3 still rests on the open xdist
premise slice 5 settles first.

CI repair after slice 2 (run 41768486158, dashboard 11/12):
`agent-launch-publication-receipt-failure.spec.ts:17` failed because the test
helper `attempts()` (`dashboard/tests/agentLaunchSessions.ts`) read the
sessions and history answers separately, so an attempt the page reconciled
between them read twice. It now pairs the reads by the history `revision`
the sessions answer names as `historyRevision`. Proof: a hand-interleaved
scratch spec showed the duplicate before and one attempt after; the spec
40/40 under `--repeat-each 20 --workers 4` at load up to 93; all 46
`attempts()` consumer specs 108 passed.

### 3. A multi-megabyte proof snapshot is read
Type: Behavior
Status: done
Proof: A journey or server test serving a proof file above 1 MiB (about 2 MB
of generated passing observations) through the test GitHub stand-in: the
location's Proof renders rows, no read failure; the reference names the
bound.

Behavior: A published snapshot of 2 MB → Intent reads it; the GitHub answer
bound in `ghRead.ts` is 32 MiB.

Accepted proof (2026-11-04): `intent-pytest-proof.spec.ts` "a pytest
snapshot of about 2 MB is read…" (2,042,817 bytes through the synthetic `gh`
on PATH, so the bounded process) failed without the `ghRead.ts` bound ("could
not be read at this revision") and passes with it; the oversized answers in
`boundary/authenticated-read-output-bound.spec.ts` moved to 33 MiB (red at
2 MiB, then 2 passed); Intent and every `boundary/authenticated-read-*` plus
project-add-validation 304 passed; `github-request*.test.mjs` and payload
links quiet pass. `dashboard/PUBLISHED-OBSERVATION.md` now states the 32 MiB
bound.

### 4. Pygardon workspace is prepared and its CI route checked
Type: Structure
Status: done
Proof: `git worktree add` from fetched Pygardon trunk,
`nix develop -c scripts/prepare-worktree.sh`, then
`nix develop -c scripts/check-worktree.sh pytest --collect-only -q`
prints the collected count (recorded as a learning), and
`node scripts/pygardon-ci-adapter.mjs --check terryyin/pygardon main`
passes; a `CI deferred` result goes to Terry first (Pygardon AGENTS.md).

Internal change: the subordinate Pygardon workspace this execution owns, at
a recorded base, with its prepared environment. Enables slice 5. Keep
Pygardon's default checkout untouched.

Accepted proof (2026-11-04): worktree
`/Users/terryyin/git/pygardon/.worktrees/record-pytest-proof`, branch
`claude/record-pytest-proof`, from fetched `origin/main` at `ac093aea6`;
`nix develop -c scripts/prepare-worktree.sh` exit 0;
`nix develop -c scripts/check-worktree.sh pytest --collect-only -q` "6537/6560
tests collected (23 deselected)"; `node scripts/pygardon-ci-adapter.mjs
--check terryyin/pygardon main` "Pygardon CI adapter access confirmed". The
default checkout stayed on clean `main`.

CI repair after slice 3 (run 41771702750, dashboard 9/12):
`recently-done-sessions-sidebar-reopen.spec.ts` closed the narrow panel
about 85 ms after first paint, before the server's `attached` readiness let
the page re-read sessions, so the Done row stayed until the 15 s check. The
test now waits for the page's own sessions answer showing the reopened record
(`pageReadReopened` in `dashboard/tests/recentlyDoneSessionsSidebarPage.ts`)
before Close. Proof: with the `attached` frame held back 2 s the old test
failed 3/3 as in CI and the fixed one passed 3/3; the spec 60/60 under
`--repeat-each 20 --workers 4` at load 54; neighbours 16/16. Remaining product
edge for the developer: a Close in that window leaves the page showing Done
for up to 15 s.

### 5. Pygardon records pytest proof on explicit request
Type: Behavior
Status: done
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

Accepted proof (2026-11-04): Pygardon `8dc7cad1a` on `main` (from
`ac093aea6`): `scripts/pytest_proof.py`, loaded by `tests/conftest.py`
`pytest_plugins`; `tests/test_pytest_proof_{recording,outcomes,unchanged_runs}.py`
with `tests/pytest_proof_support.py`, 14 passed serial and `-n 2 --dist
loadfile`, rerun after `pnpm format:changed`; four plugin mutations (ignore
`wasxfail`, record in workers, print, end at `call`) each failed the intended
tests. The xdist premise held: an inner `-n 2` run's controller saw each of 8
cases' teardown exactly once, with `wasxfail` and `duration` intact. Real
`RECORD_PYTEST_PROOF=1 nix develop -c scripts/check-worktree.sh pytest
tests/test_cors.py tests/search_run/test_search_run_cli_ranking_span.py`
wrote 6 observations (commit `ac093aea6`, `fileBlob` = `git hash-object`,
derived ids `cell-expected0`, `cell,2008-2010-expected1`) with output and exit
equal to the run without the option, which left the snapshot unchanged; CI's
own `pytest -p scripts.ci_crash_evidence … -n 2 --dist loadfile` 20 passed
with the snapshot unchanged; `tests/pygardon-ci-coalesced-pushes.test.mjs`
15/15. The dashboard's `parsePytestProofFile` accepted the snapshot.
Reference gaps fixed from the implementation: any `wasxfail` report clears
(setup of an xfail case, `xfail(run=False)`); a non-setup/call report (xdist
crash) finishes and clears a case; only `latest.json` is maintained; a
directory `flock` leaves no file; a full refresh rewrites the snapshot per
case; `fileBlob` is hashed on the file's first passing case; inner `pytester`
runs clear inherited `PYTEST_XDIST_*` variables. Untested: two overlapping
recording sessions (the `flock` serialization). Observed outside this
change: `tests/test_ci_path_coverage.py::test_service_and_adapter_share_real_history[linear-150]`
hit the 60 s hang bound at `-n 4` under machine load 20–27 (26.9 s at load
13; passes alone); the worktree wrapper plus `-p scripts.ci_crash_evidence`
stops on `PytestAssertRewriteWarning` with or without the plugin.

### 6. Intent shows Pygardon's published pytest proof
Type: Behavior
Status: done
Proof: Open the dashboard on project Pygardon at the revision that published
slice 5: the recorded file's Proof shows its cases with example 6's cells,
`tests/search_run` (or the recorded file's folder) shows example 7's lines,
and the `tests` root summary is opened once with its time to complete and
the GitHub request count recorded as a learning. Record the retained
observation in this plan's retained-proof fields; Terry's evaluation against
`pytest -q` plus an editor is the story's acceptance.

Behavior: Pygardon's published snapshot → Intent reads it as examples 6–7
describe on real source; nothing is fabricated for the demonstration.

Accepted proof (2026-11-04): a dev dashboard from this checkout at
`d5249a45a`, with a private HOME, request owner and counting `gh` wrapper, on
Pygardon `main` `8dc7cad1a`. `tests/test_cors.py`: "Last successful proof: 2
test cases: 2 passed", headers Test case, Last successful proof, Duration,
Observed, Commit, Observed on. `tests/search_run/test_search_run_cli_ranking_span.py`:
4 test cases in definition order, the parametrized function expanded to
`cell,2008-2010-expected1` then `cell-expected0` (parameter id order, Terry's
amendment, O1). A slowest row opened Purpose at `data-line=33`, its `def`.
`tests/search_run`: "149 test functions", "150 test cases: 4 passed, 146
without successful proof", "476 ms over 4 of 150 test cases", the note,
slowest cases, 50 children, a child opening its Purpose and Proof. Returned
and fixed in this slice: O2 (table words broke inside at 1400 px) and O3
("of 1 files"); after them every `intent-*` and
`boundary/authenticated-read-intent-*` spec passed (106). Screenshots under
the execution's job temp directory (`e6-*`, `e7-*`, `root-*`).

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

- Slice 1: a proof kind contributes only `parseFile`, `rowsOf` and `words`
  (`dashboard/src/proofKinds.ts`); identity, reduction, counts, sums and
  slowest cases are `dashboard/src/proofCases.ts`. The Intent answer carries
  every kind's cases in one Cucumber-named shape (`featureBlobs`,
  feature/scenario/example/featureBlob), mapped once in
  `dashboard/src/cucumberProof.ts`; slice 2 maps pytest cases into that same
  shape (file → feature, test → scenario, parameterId → example) or changes
  server and client together. `CaseRowsOf` receives the file's retained
  observations for parametrized expansion, and the summary inventory counts
  distinct definition lines, which gives test functions for pytest.
  Remaining Gherkin-only text: the other-kinds sentence in
  `IntentProofProblem.tsx` and `IntentProof`'s "Select a feature file…" prompt.
- Slice 2: pytest proof parses in `dashboard/src/pytestProof.ts` (only
  `outcome: "passed"`; a Cucumber-shaped file is malformed, and the reverse)
  and rows derive in `dashboard/src/pytestCases.ts`. Intent orders a
  function's parametrized rows by snapshot order, which the reference asks to
  sort by file, test, parameterId. Rows need the `test_` prefix and `Test*`
  classes; custom `python_functions`/`python_classes` are not derived. For
  slice 3, a 2 MB fixture can reuse `passed()` in
  `dashboard/tests/intentPytestProofFixtures.ts`; the bound sentence belongs
  beside "one maintained snapshot per proof directory" in the reference. For
  slice 5, the reference resolves `file` from `git rev-parse --show-toplevel`
  and runs inner `pytester` sessions with the option set only for them; a
  lock file must not end in `.json`.
- Slice 4: Pygardon collects 6537 cases in 1273 files; 2963 are
  parametrized, from 890 functions; none come from a class. One parameter id
  contains `::` (`test_sealing.py::…[/usr/bin::/bin]`), so identity parsing
  stops at the first `[`. pytest 9.1.1, pytest-xdist 3.8.0, no
  pytest-asyncio; `filterwarnings = ["error"]`; `addopts = "-m 'not slow'"`.
  Plugins load by `-p` (CI: `-p scripts.ci_crash_evidence`, with
  `hasattr(config, "workerinput")` for workers; the wrapper adds
  `-p scripts.worktree_pytest_progress`) or `pytest_plugins`. `pytester` is
  enabled per module (`test_private_host_docker_lease.py` pattern with
  `inline_run("--confcutdir", …, "-o", "addopts=", plugins=[…])`). The worktree
  wrapper passes the caller's environment to pytest. CI runs `-n auto --dist
  loadfile`. Pygardon tests use no sleeps or time budgets.
- Slice 6: the `tests` root summary on real Pygardon, opened once from cold,
  took 208.2 s to complete and 1,298 GitHub requests (1,283 files, about 6
  requests per second, none failed): "4488 test functions", "4489 test
  cases: 6 passed, 4483 without successful proof", "888 ms over 6 of 4489
  test cases". That cost is the measured input for a cheaper root summary.
  The dashboard reaches GitHub through a machine-wide request owner; counting
  requests needs a private `DOUGH_GITHUB_REQUEST_OWNER_ROOT` for the dev
  server. A summary of retained files still flashes Partial for under a
  second (O4).


## Concern evidence

Slice-plan refinement was not needed: each slice owns one proof loop, the
Structure slices sit immediately before the Behavior they enable, and the
sequence exercises one case model rather than special cases per kind. No
slice-specific concern remains. Interim behavior: between slices 2 and 5,
Intent can read pytest proof while Pygardon publishes none; a `python`
location without `proof` keeps its honest absence wording, so this needs no
replacing slice. The xdist premise is bounded by slice 5's first test.

## Story obligations

### O1. Parameter rows follow snapshot id order, not pytest's
Reported: slice 6 — "the parameter rows come out as expected1 then expected0. That is the snapshot's sorted order (the comma sorts before the hyphen); `pytest -q` collects them as expected0 then expected1."
Story clause: "rows in definition order"
Disposition: owner changed "ordered by parameter id, since pytest's collection order is not recorded"

### O2. Proof table headers and commits break inside words
Reported: slice 6 — "Proof table columns squeeze into broken words at a 1400 px viewport when test names are long: 'Duratio/n', 'Observe/d', 'Commi/t', and the commit splits as 'ac093a/e'."
Story clause: "a table headed Test case, Last successful proof"
Disposition: proved by slice 6: dashboard/tests/intent-pytest-proof.spec.ts "long test case names wrap in their own column; headers and observed cells keep whole words, and on a phone only the table scrolls sideways" (`wordsBrokenApart` failed with Duration, Observed, Commit and commit cells before the CSS fix, passes after)

### O3. Partial labelling says "1 files"
Reported: slice 6 — "Wording 'across 0 of 1 files; 1 file reading': '1 files' is not pluralized correctly."
Story clause: "Partial labelling while files read or failed"
Disposition: proved by slice 6: dashboard/tests/intent-entry-folder-summary-partial.spec.ts step "a folder of one file still reading counts that file in the singular" ("0 of 1 file read", "across 0 of 1 file; 1 file reading"; red on the earlier wording)

### O4. Partial flashes while retained files settle
Reported: slice 6 — "re-selecting `tests/search_run` with every answer retained still showed Partial ('0 of 1 files; 1 file reading') on each child for under a second."
Story clause: "Partial labelling while files read or failed"
Disposition: no user cost "a location or folder summary gives the same figures as for": the shared summary shows the same sub-second Partial for Gherkin folders while retained file reads settle, and the complete figures follow without another request
