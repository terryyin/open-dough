---
id: SEED-192
status: active
planted: 2026-10-30
planted_during: Terry Yin's request to decompose the product intent review near-future direction
trigger_when: Developers review the lasting intent and proof introduced or affected by a story
scope: epic
---

# SEED-192: Review product intent as development changes the product

## Why This Matters

For developers reviewing and maintaining product intent, reading test source in
editors and piecing together separate run output should change to a coherent
Intent workspace for Purpose and observed Proof. Begin with actual automated
test source and named real projects, within the
[near-future direction](../PRODUCT-BACKLOG.md#near-future-direction) and the
[product intent review memorandum](../../docs/product-intent-review-memorandum.md).
Terry evaluates the first experience. The cost of today's manual workflow has
not been measured; usefulness must be judged against that baseline.

**Decomposition kept 2026-10-31:** Terry requested a visible Development/Intent
frame first, explicit per-project test-folder types, source browsing before
Proof, bounded rolling run history, folder summaries, and further test families.
Terry kept this decomposition and directed the backlog to follow the order
below, with optimization-candidate review after source browsing. Existing story
identities are preserved. The stories remain preparation input; execution
approaches and implementation are not selected by this backlog decision.

## Human-Owned Framing and Constraints

Established by Terry's 2026-10-30 and 2026-10-31 discussions:

- The developer should be able to see and feel the overall frame before the
  Intent reader is built. Development and Intent are the initial perspectives;
  Intent can initially explain that its content is forthcoming. Structure waits.
- Each project explicitly configures its intent locations and what they contain.
  Start with Cucumber source in Doughnut and Pygardon. Automatic detection is
  deferred. Next consider TypeScript, Python, and script tests.
- Purpose initially means actual static test source. File and folder browsing
  needs no runtime reports, generated narrative, or authored intent catalogue.
- Projects produce Proof through their test commands outside CI. Keep a bounded,
  rolling history, show selected-file Proof, then folder-level observations.
  CI reports its configured checks separately; it does not produce the retained
  dashboard Proof history. CPU and other resources can change run time.
  On 2026-11-01 Terry replaced rolling run history with a latest per-test
  snapshot that every ordinary run updates, under a published
  [Cucumber proof reference](../../src/skills/dough-test-optimization/references/cucumber-proof.md); later stories still to be refined
  use that latest-observation model. On 2026-11-02 Terry made proof generation
  deliberate: normal runs leave snapshots untouched, and each proof-bearing
  Intent entry declares its generation command or skill. Terry also dropped local-proof/CI
  comparison, including the proposed duration gate and comparison requirements
  for later producers: retained proof and CI verdicts are independent observations.
  Earlier direction notes below retain their original historical wording; active
  guidance and stories use the replacement.
- Preserve the selected project and the shared frame. Purpose/Proof side-by-side
  and tabbed layouts share one selection; the switch preserves selection and any
  story scope. Near-future direction belongs in Development.
- The existing optimization-candidate story was requested at priority 2 earlier
  on 2026-10-31. Its links require useful source browsing, not merely an empty
  frame. Terry selected its revised placement after the source-browsing stories,
  at priority 4, when keeping this decomposition on 2026-10-31.
- Story impact, protection, and complexity remain part of the parent direction.
  Source changes and passing runs alone do not establish intent protection.
  Domain models, types, and written specifications remain later extensions.

The first learning question is whether the real frame makes the two perspectives
understandable without disrupting Development. The next is whether explicit
locations make real test source easy to find. Before spreading report collection,
test the more consequential assumption that retained local proof can be associated
with tested source and honestly interpreted within its observed scope.

## Alternatives and Recommendation

- **Defer:** keeps the existing editor/report workflow, but misses the explicitly
  requested Intent experience. Terry has selected advancement of this direction.
- **Use editors, Review changes, and existing reports:** the strongest smaller
  alternative. It remains the comparison and fallback, and can support early
  protection/complexity reviews. It does not supply the requested integrated
  browsing and latest-observation experience; its quantitative disadvantage is unknown.
- **One source-browser story for every language:** possible as delivery
  checkpoints, but plain text, folders, and explicit file selection are the same
  observable behavior. A Python-only reader adds no demonstrated independent
  outcome after a configurable text reader exists. Recommend a Cucumber pilot,
  then one general source-browsing increment evaluated with TypeScript, Python,
  Node, and shell examples. Split only if refinement reveals distinct behavior.
- **One universal reporting story or JUnit-only import:** unnecessarily combines
  different runner semantics. Reuse native reports and add one real producer
  family at a time. Avoid a plugin platform or a universal scoring model.
- **Recommended:** deliver the visible frame, source access, the first project's
  latest local observations. Extend the shared reading experience by actual
  runner family, with folder summaries once one family's observations can
  already be read.

## Research Basis and Architectural Considerations

### Observed project inventory

Read-only inspection on 2026-10-31; these are checkout observations, not new test
runs or measurements. Open Dough was inspected at `7e198a7c3374`; Doughnut at
`1233bbd6db20`; Pygardon at `5df070ed54fc`. No client-project files were changed.

| Project | Initial source locations | Actual runners and relevant distinctions |
| --- | --- | --- |
| Open Dough | `dashboard/tests/`; shell checks under `tests/`; Node tests under `tests/`, `scripts/`, and skill-script locations selected by the existing test command | Dashboard TypeScript tests use Playwright Test, not Vitest. `scripts/test.sh` schedules shell checks and `node --test` files. |
| Doughnut | `e2e_test/features/`; frontend test locations under `frontend/`; Node script tests under `scripts/` and `infra/` | Cucumber features run through Cypress and `@badeball/cypress-cucumber-preprocessor`. Frontend Vitest uses real-browser projects, including touch, with different CI retry/parallel settings. |
| Pygardon | `e2e_test/features/`; separately `e2e_test/packaged/features/`; colocated tests under `frontend/src/`; `tests/` for pytest | Cucumber.js uses Playwright as browser automation. Its CI profile and tags differ from local defaults. Frontend uses Vitest with happy-dom. pytest defaults and CI exclude different slow/host-only selections. |

Doughnut also has CLI Vitest, CLI Python unittest, and Java/JUnit backend tests.
The requested Pygardon Python increment means pytest, not all Python tests in
all projects. Java/JUnit and additional CLI/packaged profiles are scope choices
for later selection; a generic source reader need not prohibit them. Source
browsing does not imply their execution evidence is already supported.

### Constraints from current Accepted ADRs

- [ADR 0001 — Ubiquitous language](../../docs/adrs/0001-ubiquitous-language-accepted.md):
  keep Development, Product intent, Purpose, and Proof distinct. An initial
  scope limit does not justify a product gate against another readable format.
- [ADR 0002 — Software development lifecycle principles](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md):
  retain useful stopping points, reuse suitable existing solutions, and build
  supporting machinery when the selected outcome needs it. Delivery order alone
  does not justify blocking story dependencies.
- [ADR 0008 — Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md):
  repository records own durable project facts; published facts, local
  observations, and disposable UI state stay distinguishable. Project registration
  and machine paths remain host settings. No application/server database is selected.
- [ADR 0010 — Definition of improvement](../../docs/adrs/0010-definition-of-improvement-accepted.md):
  compare the useful review with the existing manual workflow, including human
  effort, collection overhead, retained data, and future maintenance cost.
- [ADR 0000 — Use ADRs](../../docs/adrs/0000-use-adrs-accepted.md):
  this Intent-specific direction belongs with product intent and planning.
  No new ADR acceptance, supersession, or exception is proposed. Relevant index
  and record statuses agree; no conflict was found in this recommendation.

### Recommended boundaries for refinement

These are proposed responsibilities and evidence semantics, not a technical
schema, executable design, or a newly accepted architecture decision.

1. **Project-owned configuration:** record intent roots, explicit source kind,
   and file selection in each repository's `.planning/open-dough.json`, extending
   its existing project settings. Identify the execution runner separately when
   Proof needs it: Gherkin does not mean Cucumber.js, and TypeScript does not mean
   Vitest. File selection matters for colocated tests and mixed helper folders.
   Read config and source at the same named published revision. Missing config,
   an empty configured location, and a failed read have different meanings.
   Dashboard project registration remains machine-local. A settings editor is
   not needed for the first browsing story; repository configuration suffices.
2. **Reuse the existing frame and source concepts:** the current React dashboard
   already has project selection, session preservation, settings navigation,
   review file trees, exact source text, and authenticated pinned Git reads.
   These inform reuse; they are not a ready-made Intent tree. The current
   published-directory helper lists files only, while story-review text is
   admitted within a particular comparison. Intent needs its own project/root
   reading scope without depending on a live session or story workspace.
3. **Producer ownership:** a project's explicitly enabled recording workflow
   produces evidence; normal test runs leave proof untouched. Each proof-bearing
   Intent entry declares its project-owned generation command or skill; the
   dashboard displays it and reads compact repository-published snapshot
   records for shared viewing without a developer clone. Local unpublished
   results may exist before publication but are not published Proof. Keep the
   current bounded working set small; deleting old records does not erase Git
   history or guarantee bounded lifetime repository storage. The exact record
   path, retention count, and size budget need first-Proof refinement.
4. **Source association from the first run:** a run identifies the product,
   tests, relevant dependency/configuration basis, selection, producer, time,
   terminal outcome, and observed attempts. A feature-file hash or passing exit
   alone cannot show that current implementation was tested. Dirty source stays
   identifiable or explicitly unmatched. Publishing an evidence-only commit
   must not invalidate its tested source merely because the enclosing commit
   changed. Keep the tested basis distinct from the commit publishing the report.
5. **Last successful per-test proof:** each explicit recording run maintains proof only
   for the cases it executed. Retain passing observations with their time,
   attempts and source association; a final unsuccessful scenario removes its
   earlier proof, while cases not run keep theirs. A later pass restores proof.
   A focused run neither claims a full run nor turns a mixture of older passes
   into a current green suite. Consolidation selects latest observations before
   retaining only passes; raw screenshots/videos stay outside compact Proof.
6. **Native reporting before new machinery:** Cucumber.js emits Cucumber
   Messages, and Doughnut's preprocessor can emit Messages too. This is a
   promising common input, not proven compatibility of their installed versions.
   Map source scenarios/outline rows and retry attempts using each run's actual
   source, not generated runtime IDs across unrelated runs. Keep collection,
   ordinary diagnostics, and strict pass/fail rules coherent. Open Dough already
   has an opt-in Playwright proof record, but it has no explicit tested revision
   and no automatic history/retention policy.
7. **Folder truth and timing:** summarize last successful proof of the
   folder's cases, retaining differing times and source versions. Expose cases
   without successful proof and incomplete reads. These observations may
   come from different runs; a sum of their durations is neither one run's
   elapsed wall time nor current suite cost. Attribute shared setup/hooks only
   where observed. A source listing is not the runner's collected-case inventory.
8. **Run context and timing:** record relevant runner/browser/runtime and
   resource context where available. Durations describe the observed execution;
   they do not establish a cross-environment performance threshold. Actual
   failures/timeouts retain their observed outcome.

### External reporting research

The following official documentation supports feasibility, not a selected
implementation. Installed-version compatibility still needs a real run during
refinement or execution.

- Cucumber.js recommends its [Messages formatter](https://github.com/cucumber/cucumber-js/blob/main/docs/formatters.md)
  for structured output; legacy JSON is in maintenance mode. The
  [Messages model](https://github.com/cucumber/messages/blob/main/README.md)
  retains source/run information and has versioned schemas.
- The Cypress preprocessor documents [Messages reports](https://github.com/badeball/cypress-cucumber-preprocessor/blob/master/docs/messages-report.md),
  including optional embedded media, which reinforces the need for compact retention.
- [Vitest reporters](https://vitest.dev/guide/reporters) provide JSON results and
  allow multiple reporters. Keep existing quiet/strict reporters rather than
  accidentally replacing their behavior when collection is added.
- [Playwright reporters](https://playwright.dev/docs/test-reporters) support JSON
  and multiple reporters; Open Dough's [existing proof contract](../../dashboard/tests/proof-record.md)
  is a more directly relevant reuse candidate than replacing its strict reporter.
- [pytest JUnit output](https://docs.pytest.org/en/stable/how-to/output.html#creating-junitxml-format-files)
  includes setup/teardown in durations by default; it does not settle our full
  source association, selection, and latest-observation requirements by itself.
- [Node test reporters](https://nodejs.org/api/test.html#test-reporters) expose
  structured events; console output is not a stable programmatic contract.

## Shared Evidence and Sizing Boundaries

Follow the [initial Intent UX/UI direction](../../docs/dashboard-ux-ui-north-star.md#initial-intent-workspace).
Every candidate is evaluated by Terry or a developer reviewing the named project.
Every stopping point preserves useful behavior without later stories. Source
reads name their revision; Proof names its actual run and supported scope.
Missing observations remain unknown. No synthetic sample establishes a real pass.

Open Dough has no established S/M/L calibration, as already recorded here and in
[SEED-052](SEED-052-start-agent-work-from-dashboard.md#open-decisions-before-refinement-or-planning).
No bands or time commitments are invented. Comparative hypotheses below are
unbanded; confidence includes integration, verification, and cleanup. The new
track has three source/frame outcomes and eight Proof outcomes; four existing
review candidates remain. Most uncertainty lies in the first Proof cases.
At decomposition, none had an execution approach or readiness assessment.
Individual refinements and their recorded facts below carry current preparation.

## Story Decomposition

<a id="assess-story-intent-protection"></a>

### 10. Review how well a story's intent is protected

**Identity:** SEED-192#assess-story-intent-protection
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** A developer receives an explainable assessment of how clearly
  one real story's intent is distilled into maintained high-level tests, what
  those tests protect, and where evidence is insufficient.
- **Evaluation:** For one newly developed or completed story with recoverable
  intent and source, state the developer's review basis first. Review an
  AI-assisted assessment against the actual story, test source, and applicable
  execution evidence. The developer can follow the reasoning to its sources
  and make a concrete retain, clarify, or strengthen decision, or reject the
  assessment as unhelpful with its limitation recorded.
- **Value / learning:** Tests the direction's hardest assumption before building
  a general coverage model. Compare useful findings, unsupported claims, and
  review effort with an ordinary review using the existing tools.
- **Boundary:** One bounded case with qualitative reasoning and explicit unknowns.
  A changed-file list, passing run, or line-coverage percentage alone cannot
  establish intent protection. Existing tools and reports may supply the review;
  a new dashboard automation or stored intent catalogue is not required.
- **Effort hypothesis:** Unbanded; bounded exploratory case, low confidence.
  Selecting a case with recoverable intended behavior limits scope. Assessment
  reliability is the uncertainty; an inconclusive result is valid learning.
- **Product prerequisites:** Recoverable story intent, relevant test source,
  available execution evidence, and a developer able to evaluate the result.
  No blocking story dependency has been established.
- **Safe stopping point:** The case retains its useful maintenance decision and
  evidence limits. Wider automation remains a later choice informed by this
  result; the judgment does not become a whole-product protection claim.

<a id="assess-story-test-complexity"></a>

### 11. Review complexity introduced by a story's tests

**Identity:** SEED-192#assess-story-test-complexity
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** A developer can distinguish useful protection from avoidable
  complexity in a story's expression of intent and its tests.
- **Evaluation:** Review one real story's test changes and the supporting setup
  using the memorandum's criteria. Explain the relevant boundary, concepts,
  coupling, and mock assumptions with source references. The developer can judge
  a concrete simplify or retain proposal against the behavior it protects.
- **Value / learning:** Tests whether the proposed heuristics support a worthwhile
  maintenance decision, rather than merely rewarding short test bodies.
- **Boundary:** Account for supporting code as well as test bodies, and separate
  behavioral complexity from proof complexity and run time. Low-level tests and
  mocks carry costs to explain and weigh. A universal complexity score or an
  automatic rewrite is a later decision.
- **Effort hypothesis:** Unbanded; bounded exploratory case, low confidence.
  Source outside the changed test body may be needed to understand its costs.
  Scope stays at one story and its relevant support rather than a suite audit.
- **Product prerequisites:** A real story comparison, relevant test/support
  source, and a developer able to assess the tradeoff. No blocking story
  dependency has been established.
- **Safe stopping point:** A justified retain or simplify decision and the
  heuristic's limitations remain useful even if no automated metric follows.
  The assessment changes no tests or project testing rules by itself.

<a id="read-vitest-proof"></a>

### 12. Read frontend Vitest proof in both projects

**Identity:** SEED-192#read-vitest-proof
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** Doughnut and Pygardon developers can review frontend test results
  and latest observations beside the TypeScript source already readable in Intent.
- **Evaluation:** Collect a real local Vitest run in each frontend, inspect
  latest file/case outcomes, and use supported folder summaries with the
  observed selection and environment explicit.
- **Value / learning:** Tests shared reporting across browser-mode and happy-dom
  Vitest without conflating their execution environments.
- **Boundary:** The two frontends, including explicit browser-project identity,
  retries, and existing reporter/failure behavior. Open Dough dashboard tests
  remain Playwright. CLI Vitest is a later selection rather than hidden scope.
- **Effort hypothesis:** Unbanded; middle, medium confidence after the first
  proof case. Split the frontend variants only if real reporting behavior
  proves materially different; Vue versus React alone does not require a split.
- **Product prerequisites:** TypeScript source reading and established latest-observation
  semantics at integration.
- **Safe stopping point:** Usable frontend Proof in both projects, with
  environment and unsupported observations explicit.


<a id="read-playwright-proof"></a>

### 13. Read Open Dough dashboard Playwright proof

**Identity:** SEED-192#read-playwright-proof
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** An Open Dough developer can inspect observed dashboard protection
  beside its TypeScript tests using the existing strict run semantics.
- **Evaluation:** Retain a real dashboard run, review its selection, attempts,
  strict terminal outcome and latest case observations in Intent, keeping
  selection and shard scope explicit.
- **Value / learning:** Brings the dashboard's own test intent into Proof and
  tests reuse of its already available opt-in record.
- **Boundary:** Add missing source association, publication, and latest observations around
  the existing contract. A listed-only, running, skipped, or raw-runner pass
  cannot be upgraded to executed strict pass. Preserve quiet diagnostics.
- **Effort hypothesis:** Unbanded; middle, medium confidence. Repetition/retry,
  shared hooks, and shard scope already have meaningful distinctions to retain.
- **Product prerequisites:** Source reader and established Proof semantics.
- **Safe stopping point:** Honest dashboard file/folder Proof without migrating
  tests to another runner or waiting for Python/script collection.


<a id="read-pytest-proof"></a>

### 14. Read Pygardon pytest proof

**Identity:** SEED-192#read-pytest-proof
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/459-read-pytest-proof/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"653a2617776a1c74eb0ddc6b79969202923cb0d6e88ad6b868f5afa3e8d03fee","plan":"a1f13f794f5ca47b822a72624044354a561dcdb60db2325cd83bea5439ba690f"}}
```

**Beneficiary:** A Pygardon developer reviewing Python test protection in
Intent, such as Terry selecting a file under `tests` and reading what its
test cases last proved.

**Goal:** Pygardon records deliberate pytest proof the way it records Cucumber
proof: a published Open Dough reference defines the compact snapshot and the
explicit recording run, the `tests` Intent location declares its proof
directory and generation command in `.planning/open-dough.json`, and a
Pygardon-owned pytest plugin maintains the snapshot. Selecting a pytest file in
Intent then shows each test case's last successful committed proof beside its
Python source, and a location or folder summary gives the same figures as for
Gherkin. This extends Proof to Pygardon's largest test family and tests whether
the latest-observation model survives parametrization, marker selection,
expected failures, setup/teardown and parallel workers
([ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md)).
Terry's 2026-11-04 instruction: the story includes the generation of pytest
proof as well, like the Cucumber proof, declared in the project configuration
and produced when the project generates proof; the rest of the story is
reading it.

**Facts observed during refinement (2026-11-04, read-only):**

- Pygardon at `aac9adb94` declares `tests` as a `python` Intent location with
  `include: ["**/test_*.py"]` and no `proof`. Its two Gherkin locations declare
  `proof` and a `proofGeneration.command` of the form
  `RECORD_CUCUMBER_PROOF=1 nix develop -c scripts/check-worktree.sh pnpm exec cucumber-js`.
  pytest runs through the same wrapper: `scripts/check-worktree.sh pytest`
  execs `scripts/worktree_pytest.py`, which passes the environment through
  and adds `-p scripts.worktree_pytest_progress`; CI runs
  `pytest -p scripts.ci_crash_evidence … -n auto --dist loadfile -m "not slow and not host_docker"`.
  `pyproject.toml` pins `pytest>=9.1.1`, `pytest-xdist`, `addopts = "-m 'not slow'"`,
  `filterwarnings = ["error"]`, `pythonpath = ["tests", "tests/fixtures", "."]`;
  no rerun plugin. `scripts/ci_crash_evidence.py` is a Pygardon-owned pytest
  plugin that already records only on the xdist controller
  (`hasattr(config, "workerinput")`). The conftest registers assert rewriting
  for every helper module under `tests/`.
- Static shape of the suite (grep, not a collection): 1280 `test_*.py` files,
  1024 directly under `tests` and 256 in ten subfolders; 4483 module-level
  `def test_*`, 114 of them `async def`; no `def test_` inside a class and no
  `class Test*`; 499 files use `parametrize`. `pytest --collect-only` could
  not be run in the default checkout: a stray ignored `tests/.venv/` makes the
  conftest's assert-rewrite registration fail under `filterwarnings = error`.
  The collected case count with parametrization is unobserved; 4483 is its
  lower bound.
- Pygardon's Cucumber snapshot holds 168 observations in 70 KB, about 415
  bytes each. A pytest snapshot of 4483 or more cases is therefore 1.5–3 MB.
- The dashboard's GitHub answers are bounded at 1 MiB
  (`GitHubRequests` default `maxBufferBytes` in
  `src/skills/dough-execute-plan/scripts/github-requests.mjs`, not overridden
  by `dashboard/server/ghRead.ts`), and proof files are read as raw contents
  (`application/vnd.github.raw`, which GitHub serves up to 100 MB). A single
  Pygardon pytest snapshot cannot be read today. Proof blobs are memoized by
  blob sha across revisions, so an unchanged snapshot is fetched once per
  server process.
- Intent reads proof only for `kind: "gherkin"` (`dashboard/server/intentLocationsRead.ts`),
  derives rows from Gherkin text (`dashboard/src/gherkinScenarios.ts`), words
  everything as scenarios, summarizes only Gherkin
  (`dashboard/src/IntentSummary.tsx`), and tells other kinds that Proof is read
  only for Gherkin feature files so far (`dashboard/src/IntentProofProblem.tsx`).
  A location or folder summary reads every contained source file with
  concurrency 4 (`dashboard/src/IntentGherkinSummary.tsx`).
- Precedent for including generation: Open Dough's plan 446
  (SEED-220#last-successful-intent-proof) ran subordinate producer workspaces
  in Pygardon and Doughnut from the Open Dough execution and delivered the
  recorder changes there; Pygardon's first recorder was adopted in Pygardon
  from the reference (Pygardon `3711c54a3`). Open Dough ships no recorder.

**Selected direction:** Publish a pytest proof reference beside the Cucumber
one, with the same recording discipline and a pytest-shaped identity. Pygardon
owns the plugin, declares `proof` and `proofGeneration` on its `tests`
location, and commits a first real snapshot from a focused explicit run. In
the dashboard, generalize proof reading from Gherkin-only to a kind-neutral
case model so file Proof and summaries serve `python` locations with pytest
wording, and raise the proof read bound so the Pygardon snapshot is readable.

**Alternatives considered (explore / borrow):**

| Option | Assessment |
| --- | --- |
| Editor plus `pytest -q` output | Baseline and fallback for Terry's evaluation. Gives no latest observation beside Purpose and no folder figures. |
| Commit pytest's `--junitxml` report as Proof | Native, but it keeps failures and skips, has no commit or file-version association, no latest-per-case reduction, and grows with every run. Rejected: it contradicts the success-only snapshot Terry selected on 2026-11-01. |
| Open Dough ships a pytest plugin in the skill payload | A pytest plugin is far more portable than a Cucumber recorder, so this is credible. Rejected for this story: it reverses the 2026-11-02 decision that each project owns its recorder, and Pygardon's wrapper, `filterwarnings = error` and plugin registration are project choices. Exposed for Terry: a later shared plugin remains possible once a second pytest project appears. |
| **Project-owned plugin, shared reference and reader** (selected) | Same roles as Cucumber: reference defines the contract, project records, Intent reads published facts. One reader serves both families through a kind-neutral case model instead of a second Gherkin-shaped copy. |
| **Borrowed: aircraft maintenance sign-off** (adapted) | Each component carries its last inspection sign-off with date, inspector and aircraft configuration; a finding voids the sign-off until re-inspected; uninspected components keep theirs. Maps to test case, passing observation with `finishedAt`, `commit` and `fileBlob`, an executed non-pass clearing proof, and unexecuted cases keeping it. Where it breaks: sign-offs carry a due date, proof has no expiry; Intent shows age, never a due. A staleness rule is not part of this story. |

**Challenge:** The purpose is to review Python protection, not to see green
rows. The strongest consequential doubt is that pytest rows cannot all be read
from source: parametrized cases exist only once run, and the flat `tests` root
makes a whole-suite summary cost 1280 source reads. Neither changes the
promised outcome: file Proof and subfolder summaries carry the review, the
inventory line and the proof count line name their different units, and the
root summary's real cost is measured before it is optimized. The purpose holds;
the scope below keeps parametrized cases observation-derived and defers root
optimizations.

**Scope:**

Required behavior:

- **pytest proof reference.** `src/skills/dough-test-optimization/references/pytest-proof.md`,
  linked from that skill like the Cucumber reference, written for the agent
  working in the recording project ([ADR 0006](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)).
  It carries the Cucumber contract's recording discipline: an explicit
  project-owned option such as `RECORD_PYTEST_PROOF=1`, off in every profile
  including CI; normal runs leave proof byte-for-byte untouched; the recorder
  prints nothing, never fails the run, records nothing outside a Git checkout;
  one maintained snapshot (`latest.json`) refreshed atomically after each
  finished case; passing cases only; an executed final unsuccessful result
  clears that case's earlier proof; unexecuted cases keep theirs; deliberate
  commits; `proof` and `proofGeneration` declared on the `python` location.
  pytest-specific rules: record on the xdist controller from
  `pytest_runtest_logreport`, never in workers; a case is finished when its
  teardown report arrives; `durationMs` sums the case's own setup, call and
  teardown phases across its attempts; a failure or error in any phase, an
  expected failure (`xfail`) and an unexpected pass (`xpass`) are executed
  unsuccessful results that clear proof and record nothing; `skipped`,
  deselected (for example by `-m`), uncollected and `--collect-only` cases
  ran nothing and keep their proof; `attempts` counts executed attempts when
  the project's runner reports reruns, otherwise 1.
- **pytest proof format.** One JSON object `{"version": 1, "observations": […]}`
  whose observations are identified by pytest's own node id parts: `file`
  (repository path with `/` separators), `test` (the `::`-joined names after
  the file, class names included), and `parameterId` (the text inside the
  node id's outer brackets, present only for a parametrized case). Measured
  fields match Cucumber proof: `outcome: "passed"`, `attempts`, `durationMs`,
  `finishedAt`, `commit`, and `fileBlob` (the test file's Git blob hash as
  tested). Never record collection order or runner object ids. A file holds at
  most one observation per identity.
- **Declaration.** The dashboard reads `proof` and `proofGeneration` on a
  `python` location exactly as on a Gherkin one: committed proof at the pinned
  revision, the generation instruction shown as text, malformed instruction
  explained without hiding readable proof.
- **File Proof for a pytest file.** Rows come from the published Python text in
  source order: every module-level `def test_*` or `async def test_*`, and
  `test_*` methods of `Test*` classes, each with its definition line. A
  function with observed parameter ids shows one row per observed id, named
  with its parameters as an outline row is named with its example cells and
  ordered by parameter id, since pytest's collection order is not recorded
  (Terry, 2026-11-04); a function with no observation shows one row reading
  _No successful proof_.
  Each observed row shows the same cells as a scenario: last successful proof
  with attempts, duration, time since, commit, and whether the test file's
  published blob is the one observed. The header reads **Test case**, and the
  count line counts test cases.
- **Summaries for a pytest location or folder.** The same figures as a Gherkin
  summary over the same rows: an inventory line counting test functions from
  the read files, the proof count line over cases, summed last successful
  duration with coverage and the separate-observations note, slowest cases,
  per-child breakdown, Partial labelling while files read or failed, drill-down
  to a file or to a case's definition line, and the generation instruction.
  Wording says test functions and test cases where Gherkin says scenarios.
- **Readable snapshot size.** Proof file reads accept snapshots well above
  1 MiB (a bound of 32 MiB), so Pygardon's single snapshot is read; the
  reference says one snapshot per proof directory and names that bound.
- **Explanations.** A `python` location without `proof` says proof is not
  recorded and names the pytest reference; a kind with no proof reading yet
  says Proof is read for Gherkin feature files and pytest files so far.
  Unreadable and malformed proof keep their retry explanations.
- **Pygardon adoption.** In a subordinate Pygardon workspace of this
  execution, as plan 446 did: a Pygardon-owned pytest plugin following the
  reference, registered so the ordinary `pytest`, `scripts/check-worktree.sh pytest`
  and CI commands load it with recording off; its tests through pytest's
  `pytester`, including a two-worker xdist run, parametrization, `xfail`,
  `skip`, deselection, a setup error, and an interrupted refresh; `proof:
  "tests/proof"` and the real recording command declared on the `tests`
  location; one explicit focused recording run committed as the first
  snapshot. Pygardon's publication follows Pygardon's own rules.
- **Real reading.** With that snapshot published, Intent on project Pygardon
  shows the recorded file's cases with their proof and a subfolder summary;
  the root `tests` summary is opened once and its read time and GitHub request
  count recorded as a learning. Terry evaluates against `pytest -q` output
  plus an editor.
- **Documentation.** `docs/dashboard-development-intent.md` describes pytest
  Proof and summaries beside Gherkin; the reference is linked where the
  Cucumber one is.

Constraints:

- Only a plain pass records proof; an executed non-pass clears it. Proof must
  not claim behavior a case did not pass (correctness of Proof).
- Normal runs never create, change or delete proof (Terry, 2026-11-02).
- Missing, empty, unreadable or malformed proof is never shown as a pass.
- Identity uses pytest's own node id text; parameter ids that pytest derives
  from positions (`param0`) are recorded as given, and the reference
  recommends explicit `ids=` for stable identity. No runner object ids.
- Existing Cucumber proof files, their reader behavior and wording for Gherkin
  locations stay unchanged; the on-disk Cucumber format is not renamed.
- Pygardon's output, diagnostics, exit meaning, progress containment, xdist
  distribution and `filterwarnings = error` stay as they are with the plugin
  loaded.

Scope limits:

- Pygardon's `tests` location only. Legacy Python trees, Doughnut's CLI
  unittest and other pytest projects are naturally served by the contract and
  reader but carry no delivery or verification commitment here.
- No run wall time, no CI comparison, no per-folder run cost, no staleness or
  expiry rule.
- Observations whose identity the published file no longer defines (a renamed
  or removed test) are not listed; listing them as observed but no longer
  defined is a deferred promise.
- Tests pytest generates dynamically or collects from non-`Test*` classes are
  not derived from source; their observations stay in the snapshot and are
  read when the source rule can name them.
- A cheaper root summary for a flat 1024-file folder (lazy source inventory,
  cached parsing, or proof-only figures) is deferred to the measured result.
- A full-suite proof refresh of Pygardon is Terry's deliberate run after the
  plugin lands; the story commits a focused selection first. Rerun plugins and
  per-attempt detail beyond the attempt count are not added.

**Key examples:**

1. **Explicit focused recording.** Pygardon at a prepared worktree, no
   `tests/proof` → `RECORD_PYTEST_PROOF=1 nix develop -c scripts/check-worktree.sh pytest tests/test_cors.py`
   → `tests/proof/latest.json` holds one passing observation per executed case
   of that file with `file`, `test`, `parameterId` where parametrized,
   `commit` at run start and the file's `fileBlob`; the run's output and exit
   are those of the same run without the option. The same command without the
   option changes nothing under `tests/proof`.
2. **Parametrized cases.** `test_rounding[up]` and `test_rounding[down]` pass →
   two observations under `test: "test_rounding"`. A later explicit run in
   which `[down]` fails removes only the `[down]` observation; Intent shows the
   `up` row with its proof and no `down` row until a later pass restores it.
3. **Parallel run.** `-n 2 --dist loadfile` with recording on → every executed
   case appears once, recorded by the controller; worker processes write
   nothing.
4. **Selection keeps proof.** Default `-m 'not slow'` leaves slow cases
   unexecuted; their earlier proof stays. `pytest -m slow` with recording on
   adds theirs. A `skipped` case and a deselected case keep their proof.
5. **Executed non-pass clears.** An `xfail` case that fails as expected, an
   `xpass`, a fixture `setup` error, and a `teardown` failure after a passing
   call each remove that case's earlier observation and record nothing; Intent
   reads _No successful proof_ for it.
6. **File Proof.** Select `tests/test_cors.py` in Pygardon's Intent at the
   published revision → a table headed Test case, Last successful proof,
   Duration, Observed, Commit, Observed on; rows in definition order; a
   parametrized function expands to its observed ids in parameter id order;
   the count line reads,
   for example, "Last successful proof: 6 test cases: 5 passed, 1 without
   successful proof"; the Purpose pane positions on a row's definition line
   when opened from a summary or Optimization Candidates.
7. **Folder summary.** Select `tests/search_run` (50 files) → "N test
   functions" from the read files, the proof count line over cases, summed
   duration with "over M of N test cases" and the separate-observations note,
   slowest cases, and children with their sums; Partial labelling and unread
   file retry as for Gherkin; a child name opens that file's Purpose and
   Proof.
8. **Snapshot above 1 MiB.** A published pytest snapshot of 2 MB → Intent reads
   it and shows rows; no read failure.
9. **Explanations.** The `python` location without `proof` → "Proof is not
   recorded for this project. To configure deliberate proof generation, follow
   `dough-test-optimization/references/pytest-proof.md` …"; a `typescript`
   location → Proof is read for Gherkin feature files and pytest files so far;
   a `tests/proof/latest.json` that is not valid proof → "Proof could not be
   read: tests/proof/latest.json is not a valid proof file" with Retry.
10. **Cucumber unchanged.** Pygardon's and Doughnut's Gherkin locations show
    the same rows, wording and summaries as before this story.

**UI:** Pytest Proof reuses the Gherkin table and summary layouts; only the unit
words change (Test case, test functions, test cases, Parameters: instead of
Example:). The one interaction choice with system consequences: selecting the
`tests` location reads 1280 source files for its summary. For the developer it
means a long Partial period before the whole-suite figures settle; for the
system it means 1280 GitHub file reads per server process at a revision. The
story keeps the shared behavior and measures it (example 7 and the real
reading); a lazier inventory is deferred as above. No layout, component or
technology is chosen here.

**Architecture:** The dashboard's proof reading becomes kind-neutral inside:
one case model (file, case name path, optional variant, definition line) with
one identity, latest-first reduction, count, duration-sum and slowest rules,
and per-kind source row derivation and proof file parsing (Gherkin
feature/scenario/example and pytest file/test/parameterId). This preserves one
Proof meaning with distinct vocabulary ([ADR 0001](../../docs/adrs/0001-ubiquitous-language-accepted.md)),
reuses the reader rather than adding a second representation or a plugin
platform ([ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)),
keeps proof as repository records the dashboard reads as published facts with
no server database ([ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)),
and is design within the product, not an ADR proposal. Raising the proof read
bound is an implementation decision justified by the observed 1 MiB limit and
the estimated snapshot size. Current ADR index and record statuses agree; no
conflict, exception or North Star topic is needed; later families (Vitest,
Playwright, Node, shell) will find the model in code and the pytest reference.

- **Effort hypothesis:** Unbanded; middle-to-higher, medium confidence after
  the Cucumber stories. Two repositories, a reader generalization and a real
  plugin; the collected case count and the root summary cost are the open
  measurements.
- **Product prerequisites:** Python source reading and the Cucumber proof
  model, both in place. No blocking story dependency is recorded.
- **Safe stopping point:** The reference, the generalized reader and Pygardon's
  plugin each keep value alone: Gherkin behavior unchanged, a readable pytest
  snapshot wherever one is committed, and honest absence elsewhere.

<a id="order-pytest-parameter-rows"></a>

### Order pytest parameter rows by parameter id

**Identity:** SEED-192#order-pytest-parameter-rows
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/464-order-pytest-parameter-rows/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"952647d94e38500dabd98df5c3c8422957facfc3bcadd9be8e1f884df1271c61","plan":"4b2bd17b57e3bdd23c47970921a79874b94437426e86f2b6bcf63faee10ac290"}}
```

**Goal.** A Pygardon developer reading pytest Proof in Intent sees a
parametrized function's observed rows in parameter id order whatever order
the snapshot holds them in, and the reference and Intent guidance describe
that order and pytest summaries truthfully: the residue the execution
retrospective of [Read Pygardon pytest proof](#read-pytest-proof) found.

**Scope.** Correct the reviewed defects named in the plan without changing
that story's promises: Intent orders a function's observed parameter ids
itself (code-point order, as Python's `sorted` orders `str`); its journey
proves it from an unsorted snapshot; a unit test covers that order and the
Python definition scanner's rules; the pytest reference's "Reading proof"
and `docs/dashboard-development-intent.md` state the order, and the guidance
names the kinds Intent reads no proof for and the summaries both kinds give
without declared proof. No new product behavior beyond those corrections.

**Plan:** [464-order-pytest-parameter-rows](../slice-plans/464-order-pytest-parameter-rows/PLAN.md)


<a id="read-node-test-proof"></a>

### 15. Read Node script-test proof

**Identity:** SEED-192#read-node-test-proof
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** Open Dough and Doughnut developers can inspect script-test
  evidence alongside the configured Node test source.
- **Evaluation:** Capture a real `node --test` selection in each project through
  its existing command, and read cases/subtests, latest outcomes and attempts
  within the observed selection.
- **Value / learning:** Makes script protection visible at the runner's actual
  case granularity without treating a wrapper's exit as every case passing.
- **Boundary:** Node test events and the selected project commands. Preserve
  existing scheduler ownership, quiet/strict failures, and nested-case meanings.
  A suite plus its child cases must not inflate counts or summed duration.
- **Effort hypothesis:** Unbanded; middle, medium confidence. Two project wrappers
  use one runner family; console scraping is not a reporting contract.
- **Product prerequisites:** Configured script source and shared Proof semantics.
- **Safe stopping point:** Useful Node-script Proof independently of shell checks,
  Java/JUnit, or other not-yet-selected runners.


<a id="read-shell-check-proof"></a>

### 16. Read shell-check proof at its observed granularity

**Identity:** SEED-192#read-shell-check-proof
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** An Open Dough developer can review retained evidence for shell
  checks whose protection is currently visible only through command output.
- **Evaluation:** Run selected checks through the existing scheduler, review
  each check's observed result and duration beside its source, within the
  observed selection.
- **Value / learning:** Extends the review to a real remaining test family without
  manufacturing case identities or counts unavailable from the command.
- **Boundary:** Selected Open Dough shell checks. A shell process can truthfully
  yield file/check-level evidence; case-level claims require a real producer.
  Preserve strict command exit and timing semantics. Add Doughnut shell checks
  only when a concrete runnable target is selected.
- **Effort hypothesis:** Unbanded; middle, low-to-medium confidence. The existing
  scheduler already observes job exit/time, but retention and source mapping
  still need integration; parsing arbitrary scripts is not part of this story.
- **Product prerequisites:** Configured source and shared Proof semantics.
- **Safe stopping point:** Honest coarse-grained Proof, labelled as such, remains
  useful without pretending it has the same detail as Cucumber or pytest.

## Ordering, Existing Stories, and Scope Reduction

The numbered sections record the backlog order Terry selected on 2026-10-31;
they do not establish a mandatory dependency chain. Remaining identities stay
canonical here. Specifically, the Cucumber source pilot closed as SEED-192#browse-test-purpose;
`read-observed-test-proof` delivered Pygardon's first local Cucumber case, and
SEED-192#inspect-hierarchical-proof-cost closed with folder Proof. These are not duplicated
under new identities. Other existing review candidates retain their outcomes.

The selected order starts with the frame (1), then the Cucumber pilot (2), then
other configured source (3). The strongest rejected smaller option for the
frame is a disposable mockup: Terry explicitly wants to experience the real
interface and return to working Development. This story is justified by that
learning, not merely as infrastructure for later readers.

The earlier optimization-candidate priority becomes selected position 4, after
its source-navigation prerequisites. Story impact (5) keeps the review centered
on a story. First local Proof (6) precedes Doughnut's second producer (8).
Folder Proof (9) needs only one producer and may move before 8 if that offers
earlier value. Preserve the bounded protection/complexity
learning (10–11) before expanding collection across every remaining family
(12–16). Those review cases can also use existing tools sooner.

The kept decomposition differs from Terry's rough sequence in two deliberate ways:

- Combine language-only source extensions when they share the same reading
  outcome; retain TypeScript, Python, Node, and shell as real evaluation examples.
- Separate runner-specific collection even where the source language matches.

No formal blocking dependency has been recorded: common code and delivery order
alone do not establish that another story cannot start. Each consumer owns its
integration. Establish a blocking agreement later only if refinement demonstrates
an actual supplier outcome required before work can start.

If investment must shrink, retain the source-only product after 3. Next retain
one Cucumber producer (6). Drop additional producer
families in reverse order of demonstrated use; shell/Node and unrequested
Java/CLI expansion are the first candidates to defer, rather than spreading
partially trustworthy evidence everywhere. Keep an early protection review to
test the parent direction's hardest assumption. History can be modest; source
association and truthful selection/outcomes cannot be deferred without weakening
what the first Proof claims.

## Open Decisions Before Refinement or Planning

- First Proof's profile, tested basis, publication and retention were settled
  on 2026-11-01 and published as the [Cucumber proof reference](../../src/skills/dough-test-optimization/references/cucumber-proof.md): proof is
  a latest per-scenario snapshot, not run history.
- Select a real story and a developer's prior review basis for each assessment
  case; define what decision and review cost would justify keeping the method.
- Establish Open Dough S/M/L calibration before assigning bands. Comparative
  uncertainty is recorded; no borrowed client-project timing policy applies.

## When to Surface

Terry kept this revised decomposition and its backlog order on 2026-10-31.
Refine one selected story before
execution planning; reevaluate wider producer work from actual early use.

## Breadcrumbs

- Terry's 2026-10-30 direction: initial source browser, story scope, Purpose/Proof
  layouts, timing/hierarchy, and longer-term forms of intent expression.
- Terry's earlier 2026-10-31 request: optimization candidates and accepted slow
  tests at priority 2, with links into the test-source browser.
- Terry's current 2026-10-31 request: decompose the broad first story, lead with
  the real frame, use explicit folder types across Open Dough/Doughnut/Pygardon,
  collect bounded local Proof history and folder observations.
- Terry's 2026-10-31 keep and landing instruction: retain this decomposition,
  queue its stories in the proposed order, and place optimization-candidate
  review after source browsing.
- [Product backlog](../PRODUCT-BACKLOG.md).
- [Initial Intent direction](../../docs/dashboard-ux-ui-north-star.md#initial-intent-workspace).
- [Project visibility requirements](../../docs/project-visibility-requirements.md#product-intent-perspective-the-current-product).
- [Current dashboard behavior](../../dashboard/README.md),
  [source reads](../../dashboard/server/ghContents.ts),
  [review text](../../dashboard/server/storyReviewFileResponse.ts), and
  [existing dashboard proof contract](../../dashboard/tests/proof-record.md).
- Doughnut checkout: `package.json`, `frontend/vitest.config.ts`,
  `e2e_test/config/common.ts`, `e2e_test/config/ci.ts`, `backend/build.gradle`.
- Pygardon checkout: `cucumber.js`, `e2e_test/packaged/cucumber.js`,
  `frontend/vite.config.ts`, `pyproject.toml`, `scripts/check-prepared-checkout.sh`,
  and `.github/workflows/ci.yml`. These paths are research references within
  their named repositories, not Open Dough installation requirements.
