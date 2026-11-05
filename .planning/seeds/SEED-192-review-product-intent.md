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

<a id="read-node-test-proof"></a>

### 15. Read Node script-test proof

**Identity:** SEED-192#read-node-test-proof
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/467-read-node-test-proof/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"f4621af2f3f74153dee4849e0be714691a2a0a576b3385637946508ba37f5506","plan":"0ff38d98df2a227fe25027a032b5ac3e2100069bf567a264503b500f2bf5073c"}}
```

**Beneficiary:** An Open Dough or Doughnut developer reviewing script
protection in Intent, such as Terry selecting a skill script test under
`src/skills` or a Doughnut script test under `scripts` or `infra` and reading
what its `node --test` tests last proved.

**Goal:** Open Dough and Doughnut record deliberate `node:test` proof the way
Doughnut and Pygardon record Vitest proof: a published Open Dough reference
defines the explicit recording run and the snapshot, each project's
`javascript` Intent location for Node tests declares `runner: "node:test"`,
its proof directory and its generation command in `.planning/open-dough.json`,
and a project-owned `node --test` reporter maintains the snapshot. Selecting a
Node test file in Intent then shows each test's last successful committed
proof beside its JavaScript source, named by its `describe` path as Node's
own reporters and Open Dough's failures reporter name it, and a location or
folder summary gives the same figures as for Gherkin, pytest and Vitest. This
brings Open Dough's own skill-script protection (287 configured test files)
and Doughnut's script and infrastructure tests (78 files) into Proof, and
tests whether the test-call snapshot format and reader the Vitest story
introduced serve a second runner of the same call family without a
Node-shaped copy
([ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md),
[ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md)).
Terry's 2026-11-04 instruction for this refinement: use what the Cucumber,
pytest and Vitest proof stories taught, keep the architecture cohesive, and
add no duplicate.

**Facts observed during refinement (2026-11-04, read-only, plus throwaway
`node --test` runs and one scanner run in the job's temporary directory that
changed nothing in either checkout):**

- Open Dough at `34b253d91` declares `src/skills` as a `javascript` location
  with `include: ["**/*.test.mjs"]` and no `proof` or `runner`; 287 files
  match, and `tests/support` holds 107 more `*.test.mjs` files no location
  covers. `scripts/test.sh` runs each file as its own job with
  `node --test --test-reporter=tests/support/node-test-failures-reporter.mjs <file>`,
  four jobs at a time locally, fails a job that passed but printed output,
  and hands every environment variable except `OPEN_DOUGH_TEST_*` to its
  jobs; `bash scripts/test.sh <paths>` is the focused run. Node is 24.21.0
  (`.node-version`).
- Doughnut at `6e53933393` (fetched `origin/main`) declares `scripts` and
  `infra` as `javascript` locations with `include: ["**/*.test.mjs"]` and no
  `proof` or `runner`; 78 files match. Its `package.json` requires Node
  26.13 or later and runs them through ten `pnpm test:*` scripts, each
  `node --test <files>` with Node's default reporter, inside `lint:all`.
  Doughnut already owns a runner-neutral proof store
  (`e2e_test/config/proofStore.mjs`, 110 lines) shared by its Cucumber
  recorder and its Vitest reporter `frontend/vitestProofReporter.ts`.
- Static shape: Open Dough's 394 files hold 1,574 `test(` calls, one
  `describe`, two `await t.test(` subtests, 18 default imports
  (`import test from "node:test"`) and one alias (`test as nodeTest`);
  Doughnut's 78 files hold 386 `test(` calls and three `await t.test(`.
  Every parent of subtests in both projects is a loop over variants with no
  assertion of its own, and every subtest name is a template literal with
  substitutions. Run over both sets, the existing test-call reader
  (`dashboard/src/vitestCases.ts`) lists 1,479 of Open Dough's 1,574 tests
  and 368 of Doughnut's 386; every miss is a test named by a template literal
  with substitutions inside a loop (`` `${host}: …` ``), which the Vitest
  rule also leaves unlisted. `t.test(` is a member call the reader already
  skips.
- Observed with a throwaway reporter on Node 24.21.0: one `--test-reporter`
  module runs in the main process and receives every file's events;
  `test:start` carries `name`, `nesting` and `file`; `test:pass` and
  `test:fail` carry `details.type` (`test` or `suite`),
  `details.duration_ms`, `file`, `line`, `column`, `skip` and `todo`; a
  subtest's result arrives before its parent's, and a parent test's duration
  includes its subtests (23 ms over 2.7 ms of children); a `describe` block's
  result has `details.type: "suite"`; a skipped test and a `todo` test both
  arrive as `test:pass` with `skip` or `todo` set, a failing `todo` test as
  `test:fail` with `todo: true` and exit 0; a timeout is `test:fail` with
  `failureType: "testTimeoutFailure"`; a parent whose subtest failed is
  `test:fail` with `subtestsFailed`; `--test-name-pattern` emits nothing for
  excluded tests. Two reporters need one `--test-reporter-destination` each
  (`ERR_INVALID_ARG_VALUE` otherwise) and may both name `stdout`;
  `NODE_OPTIONS` accepts `--test-reporter` and leaves a plain `node -e` child
  unaffected. Node has no retry, so attempts are always 1.
- Precedent and reuse: the dashboard reads every proof kind through one case
  model (`dashboard/src/proofCases.ts`) and a kind registry
  (`dashboard/src/proofKinds.ts`) in which a `typescript` or `javascript`
  location's declared `runner` selects the proof kind, registered so far for
  `vitest` only; a kind contributes a file parser, a row rule and its words.
  The Vitest snapshot's identity (`file`, `test` as the name list from the
  outermost suite to the test, optional `project`) already names a
  `node:test` case. The Vitest story's completion advice asked that this
  story give Node locations their own reference instead of naming Vitest's.
  Plan 465 (Taken) edits the test-call reader and its tokenizer; plan 466
  (Taken) edits suite admission in `scripts/test.sh`.

**Selected direction:** Publish a `node:test` proof reference beside the
Cucumber, pytest and Vitest ones that keeps the same recording discipline and
declares the snapshot format shared with Vitest proof, without `project`: a
case is a `test` or `it` whose enclosing calls are suites, identified by
`file` and its name list, and a test's subtests fold into it. Each project
owns its reporter, declares `runner: "node:test"`, `proof` and
`proofGeneration` on its Node locations, and commits a first real snapshot
from a focused explicit run; Open Dough records its own `src/skills` proof
through `scripts/test.sh`. In the dashboard, register `node:test` as a second
runner of the existing kind registry, reusing the Vitest parser and the
test-call row rule with Node's words, and let the absence explanations name
the declared runner's reference.

**Alternatives considered (explore / borrow):**

| Option | Assessment |
| --- | --- |
| Editor plus `node --test` output, or `scripts/test.sh` failure output | Baseline and fallback for Terry's evaluation. The failures reporter and the runner's `times` file give per-file seconds and failures only: nothing per test, nothing beside Purpose. |
| Commit Node's built-in `junit`, `tap` or `spec` output as Proof | Native, but it retains failures, error text and stack traces, has no commit or file-version association and no latest-per-case reduction. Rejected as JSON reporters were for Vitest and `--junitxml` for pytest. |
| A Node-shaped proof format carrying Node's `line` and `column` per observation | Would duplicate the Vitest parser, the row rule and their tests for the same call family, and would make Intent's definition line a recorded fact that goes stale, where every other kind derives it from the published source. Rejected. |
| Subtests as the cases, their parent as a container | Node's finest granularity, but the reader would have to tell `t.test(` apart from `pattern.test(` by the callback's parameter name, every real subtest has a dynamic name no source rule lists, and a parent's own body would have no row. Rejected: both projects' parents are loops without assertions. |
| Open Dough ships one `node --test` recorder in the skill payload, run from source here and from the installed copy in Doughnut | More credible than for Vitest: no dependencies, plain JavaScript, and Open Dough must host a recorder anyway. Rejected for this story: it reverses the 2026-11-04 decision that each project owns its recorder while Open Dough ships the reference and the reader, and Doughnut would then run a second store beside its own. Exposed for Terry: after this story three project-owned stores exist (Pygardon, Doughnut, Open Dough) to measure a shared one against. |
| **Project-owned reporter, shared snapshot format, one reader registration** (selected) | The roles of the Vitest story: the reference defines the contract, the project records, Intent reads published facts. One parser and one row rule serve two runners of the same `describe`/`it`/`test` family; the kind registry gains a runner, not a copy. |
| **Borrowed: consolidated financial statements** (adapted) | A parent company publishes one consolidated statement in which each subsidiary's figures appear once and intercompany amounts are eliminated, so nothing is added twice. Maps to a test with subtests as the parent, subtests as subsidiaries, Node's duration for the parent as the consolidated figure, and the location sum as adding consolidated entities only. Limit: consolidation still publishes segment detail, while this proof keeps no per-subtest row at all; and a subsidiary's loss need not sink the parent, while in Node any failed subtest fails its test. |

**Challenge:** The purpose is to see script protection at the runner's own
granularity without reading a wrapper's exit as every test passing. It rests
on three assumptions: the configured locations hold the protection worth
reviewing; a `node --test` reporter sees every test's own verdict; and a test
with subtests counted once is honest. The strongest consequential doubt is
granularity: Node's summary counts subtests as tests, and folding them makes
Proof coarser than that summary for the five parents that have them. The
purpose holds because each such parent is a loop whose subtests carry
dynamic names Intent could not list anyway, Node's result for the parent
already fails when any subtest fails, and its duration already contains
them, so one row per test tells the truth and never counts a test twice. A
second doubt, that about six per cent of tests in both projects carry
loop-generated names and so have proof but no row, is the Vitest rule
applied consistently; the reference recommends literal names, and summaries
count listed rows only. Neither changes the promised outcome.

**Scope:**

Required behavior:

- **Node test proof reference.**
  `src/skills/dough-test-optimization/references/node-test-proof.md`, linked
  from that skill like the Cucumber, pytest and Vitest references, declared
  by `install.sh`, and written for the agent working in the recording
  project ([ADR 0006](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)).
  It keeps the Vitest reference's recording discipline: an explicit
  project-owned option such as `RECORD_NODE_TEST_PROOF=1`, off in every
  profile including CI; normal runs leave proof byte-for-byte untouched; the
  recorder prints nothing, never fails the run and records nothing outside a
  Git checkout; one maintained `latest.json` per proof directory, refreshed
  atomically after each finished case and serialized against concurrent
  recording runs in the same checkout, which a wrapper such as
  `scripts/test.sh` produces by running several `node --test` processes at
  once; passing cases only; an executed final unsuccessful result clears
  that case's earlier proof; unexecuted cases keep theirs; deliberate
  commits; `runner`, `proof` and `proofGeneration` declared on the location.
  Node-specific rules: the recorder is a `--test-reporter` module that runs
  once per `node --test` process, in the main process, and receives every
  file's events; the project loads it either from its ordinary command
  beside the reporter it already uses, each with its own
  `--test-reporter-destination`, or from the recording command alone, on
  the command line or through `NODE_OPTIONS`, and the option decides whether
  a loaded recorder records; it records from `test:pass` and `test:fail`,
  never from test files or hooks; a case is a test (`details.type:
  "test"`) whose enclosing results are suites or the file, and a test's
  subtests fold into it: its result is Node's result for the test
  (`subtestsFailed` clears), `durationMs` is Node's `duration_ms` for it,
  subtests included, and a subtest records nothing of its own; `attempts`
  is 1; a result with `skip` or `todo` set, a test a name pattern or
  `--test-only` excluded, a test cancelled by its parent and a test an
  interrupted run never reached ran to no verdict and keep proof; every
  other `test:fail`, timeouts included, clears; `file` is the test file's
  path from the repository root (`git rev-parse --show-toplevel`), recorded
  only for files under locations declaring `runner: "node:test"` and
  `proof`, each into its location's proof directory; `test` is the names
  from the outermost `describe` or `suite` to the test. The event shape is
  stated with the Node version it was observed on.
- **Snapshot format.** The Vitest proof file format without `project`,
  stated in the reference by its own fields: `file`, `test` (a list),
  `outcome: "passed"`, `attempts`, `durationMs`, `finishedAt`, `commit` and
  `fileBlob`; at most one observation per identity; ordered by `file` then
  `test`. A `node:test` snapshot therefore parses with the Vitest parser.
- **Declaration.** `runner: "node:test"` on a `javascript` or `typescript`
  location that declares `proof`; the dashboard reads `proof` and
  `proofGeneration` on it as on any location; a declared `proof` without a
  usable `runner` is explained as today, now naming `vitest` or `node:test`.
- **File Proof for a Node test file.** Rows come from the published
  JavaScript text under the existing test-call rule: every `test` or `it`
  call outside another test's callback, with or without `.skip`, `.only` or
  `.todo`, whose name and enclosing `describe` or `suite` names are string
  literals or template literals without substitutions, in definition order,
  each at its call's line, named by its whole suite path joined as Vitest
  and Open Dough's failures reporter join it. A default import
  (`import test from "node:test"`) is read; an alias is not. Each test shows
  one row with the same cells as a Vitest row, or _No successful proof_;
  the header reads **Test case**, and the count line counts test cases.
- **Summaries for a Node location or folder.** The same figures as a
  Vitest summary over the same rows, with tests and test cases words.
- **Explanations.** A `javascript` or `typescript` location without `proof`
  names the reference of the runner it declares when Intent reads that
  runner, otherwise the references of every runner Intent reads; the
  other-kinds sentence lists Node test files among the families; unreadable
  and malformed proof keep their retry explanations, and a Cucumber- or
  pytest-shaped file under a `node:test` location is malformed.
- **Open Dough adoption.** A recorder in Open Dough's own test support
  (`tests/support`), loaded by `scripts/test.sh` beside the failures
  reporter with recording off, so every ordinary and CI job runs with it
  and its quiet-pass rule holds; its own `node --test` tests run through
  `bash scripts/test.sh`, covering option off, a `describe` path, subtests
  folding (a parent with passing subtests and one with a failing subtest),
  `skip` and `todo`, a timeout, a failure clearing only itself, name-pattern
  exclusion, concurrent jobs refreshing one snapshot, an interrupted
  refresh, outside-Git no-op, and unchanged output and exit; `runner`,
  `proof` (for example `tests/proof`) and the real recording command
  (`RECORD_NODE_TEST_PROOF=1 bash scripts/test.sh <files>`) declared on
  `src/skills`; one explicit focused recording run committed as the first
  snapshot. Plan 466's change to `scripts/test.sh` is coordinated with, not
  duplicated by, this change.
- **Doughnut adoption.** In a subordinate Doughnut workspace of this
  execution, as the Vitest story did: a JavaScript reporter sharing
  `e2e_test/config/proofStore.mjs`, with tests run through a `pnpm test:*`
  script inside `lint:all` as the Vitest reporter's are, covering the same
  rules on Doughnut's Node; `runner`, `proof` and the real recording
  command declared on `scripts` and `infra`, the recording command loading
  the reporter since the ordinary scripts pass none, through `NODE_OPTIONS`
  or explicit flags as Doughnut chooses; one focused recording run of cheap
  files committed as the first snapshot. Publication follows Doughnut's own
  rules.
- **Real reading.** With both snapshots published, Intent on project Open
  Dough shows the recorded files' rows and a folder summary, Intent on
  project Doughnut shows the same for its recorded files, and the
  `src/skills` root summary (287 files) is opened once with its read time
  and GitHub request count recorded as a learning. Terry evaluates against
  `node --test` output plus an editor.
- **Documentation.** `docs/dashboard-development-intent.md` describes
  `node:test` Proof and the `runner` value beside Vitest's; the reference is
  linked where the others are.

Constraints:

- Only a plain pass records proof; an executed non-pass clears it. Proof
  must not claim behavior a test did not pass (correctness of Proof).
- Normal runs never create, change or delete proof (Terry, 2026-11-02).
- Missing, empty, unreadable or malformed proof is never shown as a pass.
- No count or summed duration includes both a test and its subtests
  (story boundary); identity uses Node's own names, never test numbers,
  lines or collection order.
- Existing Cucumber, pytest and Vitest proof files, reader behavior and
  wording for their locations stay unchanged.
- Each project's test output, diagnostics, exit meaning and scheduling stay
  as they are with the recorder loaded; `scripts/test.sh` still fails a job
  that passed but printed output.

Scope limits:

- Open Dough's `tests/support` tests and `dashboard/tests` (Playwright)
  carry no proof commitment: `tests/support` becomes an Intent location
  only by Terry's decision, and the Playwright runner has its own story.
  Pygardon's Node script tests are not a configured location.
- No shared payload recorder; the alternative above is Terry's later
  choice.
- Tests whose names are not literals have no row; a test's subtests have no
  rows of their own. Observations whose identity the published file no
  longer defines are not listed.
- No run wall time, no CI comparison, no per-folder run cost, no staleness
  rule, no runtime context beyond what the format carries.
- A full-suite proof refresh of either project is Terry's deliberate run
  after the recorders land; the story commits focused selections first.

**Key examples:**

1. **Explicit focused recording in Open Dough.** A prepared checkout, no
   `tests/proof` →
   `RECORD_NODE_TEST_PROOF=1 bash scripts/test.sh src/skills/dough-story-refinement/scripts/dough-land-guidance.test.mjs src/skills/dough-story-refinement/scripts/dough-land-rerun.test.mjs`
   → `tests/proof/latest.json` holds one
   passing observation per executed test, each with `file` from the
   repository root, `test` as its name list, `attempts: 1`, `commit` at run
   start and the file's `fileBlob`; the run's output and exit are those of
   the same run without the option, and the same command without the
   option, a full `bash scripts/test.sh` and CI leave `tests/proof` as it
   was.
2. **Subtests fold into their test.**
   `src/skills/dough-execute-plan/scripts/ci-codex-completion.test.mjs`
   whose first test runs `await t.test(…)` in a loop, recorded with every
   subtest passing → one observation named by the parent test with Node's
   duration for it; recorded with one subtest failing → that observation is
   removed and no subtest is recorded; the file's other tests keep or gain
   theirs.
3. **No verdict keeps proof; a verdict clears it.** A test marked `skip` or
   `todo`, one excluded by `--test-name-pattern`, and one an interrupted run
   never reached keep their earlier observations; a test that times out or
   fails an assertion loses its observation and records nothing; Intent
   reads _No successful proof_ for it until a later pass.
4. **Concurrent jobs share one snapshot.** `scripts/test.sh` records four
   files at once → `tests/proof/latest.json` holds every file's passes and
   loses none; a lock file, if any, is not a `.json` file and is gone when
   the run ends.
5. **Explicit focused recording in Doughnut.** Doughnut at a prepared
   worktree → its declared recording command naming
   `scripts/log-utils.test.mjs` and
   `infra/gcp/path-routing/path-routing-validation.test.mjs` →
   `scripts/proof/latest.json` and `infra/proof/latest.json` each hold their
   location's passing tests; `pnpm test:log-utils` without the option
   changes nothing under either directory.
6. **File Proof.** Select the recorded
   `src/skills/dough-story-refinement/scripts/dough-land-rerun.test.mjs` in
   Intent at the published revision → a table headed Test case, Last successful proof,
   Duration, Observed, Commit, Observed on; rows in definition order named
   by their suite path and name; a loop-generated name has no row; the count
   line reads "Last successful proof: 3 test cases: 3 passed";
   the Purpose pane positions on a row's `test` line when opened from a
   summary.
7. **Folder summary.** Select `src/skills/dough-story-refinement/scripts`
   (30 files) → "N tests" from the read files, the proof count line over test cases, summed
   duration with "over M of N test cases" and the separate-observations
   note, slowest test cases, and children with their sums; Partial labelling
   and unread file retry as for Gherkin.
8. **Declaration problems.** `src/skills` with `proof` but no `runner` → the
   location explains that `runner` is not declared for its proof, naming
   `vitest` or `node:test`, and its files and inventory stay readable;
   `runner: "node:test"` with a Cucumber-shaped file in the proof directory →
   "Proof could not be read: tests/proof/latest.json is not a valid proof
   file" with Retry.
9. **Explanations.** Doughnut's `infra` before adoption, declaring no
   `runner` → "Proof is not recorded for this project. To configure
   deliberate proof generation, follow `…/vitest-proof.md` or
   `…/node-test-proof.md` …"; the same location declaring
   `runner: "node:test"` and no `proof` → names the Node reference only; a
   `shell` location → Proof is read for Gherkin feature files, pytest files,
   Vitest tests and Node test files so far.
10. **Cucumber, pytest and Vitest unchanged.** Doughnut's and Pygardon's
    Gherkin locations, Pygardon's `tests` location and both frontends show
    the same rows, wording and summaries as before this story.

**UI:** Node Proof reuses the Vitest table and summary layouts and words;
no row has a variant. One interaction choice has system consequences: rows
named by the whole suite path, which for the developer reads as Node's
`spec` reporter and Open Dough's failures reporter name a test, and for the
system keeps one row rule for both runners. Selecting `src/skills` reads 287
files for its summary; the story keeps the shared behavior and measures it,
as the Vitest story did. No layout, component or technology is chosen here.

**Architecture:** The kind registry gains its second declared runner and the
first that shares another runner's snapshot format and row rule: `runner`
keeps selecting the parser and words, so a `javascript` location can carry
`node:test` proof and a `typescript` one Vitest proof under one settings
shape, and no parser, scanner, reduction or summary is copied
([ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md),
[ADR 0001](../../docs/adrs/0001-ubiquitous-language-accepted.md): Proof
stays one concept with one identity rule). The absence explanation changes
from "the Vitest reference for every `typescript` or `javascript` location"
to "the declared runner's reference, else every runner's", which the Vitest
story's completion advice asked for. Proof stays a repository record the
dashboard reads as a published fact, and `runner` stays project-owned
configuration in the same settings file
([ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)).
In each project the reporter is one more producer of that project's one
store: Doughnut's runner-neutral store gains a third producer, and Open
Dough's first store is written minimal, under the standing decision that
each project owns its recorder; the concurrency rule the Vitest reference
already states becomes load-bearing here because `scripts/test.sh` runs
four `node --test` processes at once. This is design within the product, not
an ADR proposal; the current ADR index and record statuses agree, and no
conflict, exception or North Star topic is needed.

- **Effort hypothesis:** Unbanded; middle, medium-to-high confidence after
  the Vitest story. The reader side is a registration plus wording and
  documentation; the work is two recorders in two repositories, the first
  under a four-process wrapper, and a reference whose event rules were
  observed on Node 24 and must hold on Doughnut's Node 26.
- **Product prerequisites:** The runner-selected kind registry, the
  test-call row rule and the Vitest parser, all on trunk since
  SEED-192#read-vitest-proof closed. Plan 465 (Taken) edits the row rule's
  tokenizer and Vitest journeys and plan 466 (Taken) edits `scripts/test.sh`:
  this story reuses both files without rewriting them, so no blocking
  dependency is recorded; the plan checks trunk at Take and coordinates
  rather than duplicating.
- **Safe stopping point:** The reference, Open Dough's recorder with its
  first snapshot, the reader registration and Doughnut's recorder each keep
  value alone: Cucumber, pytest and Vitest behavior unchanged, a readable
  `node:test` snapshot wherever one is committed, and honest absence
  elsewhere.


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

<a id="recover-intent-locations-read"></a>

### 17. Recover a failed Intent locations read

**Identity:** SEED-192#recover-intent-locations-read
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planless"}
```

**Goal:** A developer reading Intent sees the published locations again after a
passing read failure, without pressing Retry, and a failure that remains names
its actual cause.

- **Reported:** On 2026-11-05 at 8:32, after the 0.3.84 production dashboard
  restarts at 8:19 and 8:22, Intent on a phone over Tailscale showed "Intent
  locations for Open Dough could not be read at this revision." The same read
  then answered and parsed at that revision and five earlier ones, and the
  server recorded no failed read for Open Dough.
- **Cause in code:** `useIntentLocations` turns every rejection into a terminal
  `failed` state, and `IntentPerspective` replaces the read problem with fixed
  wording that blames the revision. Nothing re-reads it, unlike published-work
  reads.
- **Expected:** A failure that the boundary or the page deems transient (the boundary
  unreachable, a limited or transient answer) is read again automatically,
  and the failure shown names the read problem's own message.
- **Boundary:** Intent locations read only; keep manual Retry.

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
