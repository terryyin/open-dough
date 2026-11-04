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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/460-read-vitest-proof/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"e4d5074b57fc4a312dbf1cc1a77a229546fba615a0015042c28fca27118955de","plan":"8035343dd3b81844c0ece94894172f4880f6ef8981a1394414c201a19dcfa12e"}}
```

**Beneficiary:** A Doughnut or Pygardon developer reviewing frontend test
protection in Intent, such as Terry selecting a Vue component spec under
`frontend/tests` or a React test under `frontend/src` and reading what its
tests last proved, and in which browser project.

**Goal:** Doughnut and Pygardon record deliberate Vitest proof the way they
record Cucumber proof: a published Open Dough reference defines the compact
snapshot and the explicit recording run, each frontend's `typescript` Intent
location declares its runner, proof directory and generation command in
`.planning/open-dough.json`, and a project-owned Vitest reporter maintains
the snapshot. Selecting a test file in Intent then shows each test's last
successful committed proof beside its TypeScript source, with the Vitest
project (Doughnut's `chromium` and `chromium-touch` browser instances) named
on every observation that has one, and a location or folder summary gives the
same figures as for Gherkin and pytest. This extends Proof to both frontends
and tests whether one reporting contract serves browser-mode and happy-dom
Vitest without conflating their execution environments
([ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md)).
Terry's 2026-11-04 instruction: like the pytest story, this story includes
the generation of Vitest proof, declared in the project configuration and
produced when the project generates proof; the rest of the story is reading it.

**Facts observed during refinement (2026-11-04, read-only, plus two throwaway
single-file Vitest runs that changed nothing in either checkout):**

- Doughnut at `d761d3f0da` declares `frontend/tests` as a `typescript`
  location with `include: ["**/*.spec.ts"]` and no `proof`; Pygardon at
  `aac9adb94` declares `frontend/src` as `typescript` with spec and test
  `.ts`/`.tsx` includes and no `proof`. Both declare `proof` and
  `proofGeneration.command` on their Gherkin locations.
- Doughnut's frontend runs Vitest 5.0.5 in browser mode through the
  Playwright provider with two instances, `chromium` (every spec but
  `*.touch.spec.ts`) and `chromium-touch` (only touch specs, with touch
  emulation); `retry` is 1 on CI and 0 locally; reporters are `default` plus
  a Doughnut-owned `orchestratorGcReporter` on CI, declared in
  `frontend/vitest.config.ts`; `pnpm -C frontend test` runs
  `vitest run --browser=chromium --browser.headless`; CI runs it in two
  shards. Pygardon's frontend runs Vitest 5.0.3 under happy-dom with no
  projects, no retries and the default reporter through
  `nix develop -c scripts/check-worktree.sh pnpm -C frontend test`; its
  `scripts/check-prepared-checkout.sh` passes `--reporter=./vitest-quiet-reporter.ts`,
  a Pygardon-owned reporter. Both projects therefore already own and load
  Vitest reporters written in TypeScript.
- Observed with a throwaway reporter: Vitest's reporter API delivers, once
  per finished case in the Node process, the project name (`chromium` and
  `chromium-touch` in Doughnut; the empty string in Pygardon), the module's
  repository-relative path, the test name and the `describe` path, the final
  state, the `each` option, the duration, the retry count and, with
  `includeTaskLocation`, the definition line. One reporter received both
  Doughnut instances in one run; `--browser=chromium` runs both. The touch
  spec ran only in `chromium-touch` and the plain spec only in `chromium`.
- Static shape (grep, not a collection): Doughnut has 396 spec files, 6 of
  them touch specs, with 1839 `it(`, 170 `it.each(`, 568 `describe(` and 5
  `describe.each(`; 8 test or suite names are not string literals and 1 is a
  template literal. Pygardon has 197 test files with 757 `it(`, 43 `it.each(`
  and 217 `describe(`, every name a string literal. Neither uses `it.fails`,
  `repeats` or per-test `retry`. In both, almost every `each` name has no
  placeholder (30 of 31 and 5 of 5 of the names on the table's closing
  line): Vitest's title formatter then leaves the name unchanged, so every
  row of that table runs under one identical name.
- Pygardon's Cucumber snapshot stores about 415 bytes per observation; a
  Doughnut frontend snapshot of about 2,000 identities with suite paths is
  therefore around 1 MB, well under the 32 MiB proof read bound the pytest
  story delivered. Pygardon's frontend is about a third of that.
- Precedent and reuse: plan 446 ran subordinate Doughnut and Pygardon
  workspaces from the Open Dough execution; each project owns a Cucumber
  proof store with atomic snapshot maintenance
  (`e2e_test/config/cucumberProofStore.mjs`, `e2e_test/plugins/cucumberProofStore.mts`)
  that a Vitest reporter in the same project can share. Open Dough ships no
  recorder. Open Dough's own `dashboard/tests` is a `typescript` location
  whose tests are Playwright, so the kind cannot imply the proof format.
- From the pytest story, closed 2026-11-04: Intent's case model is on trunk
  (`dashboard/src/proofCases.ts`; `dashboard/src/proofKinds.ts` registers
  each kind's proof parser, source-row rule and words, looked up by the
  location's kind), and the Intent answer still carries every kind's cases
  in Cucumber-named fields (`featureBlobs`, feature, scenario, example),
  which that story's execution-complete record asks to decide before the
  next proof kind. Its retrospective found the reader showing a parametrized
  function's rows in the snapshot's order, with real Pygardon matching the
  promised parameter id order only because its plugin sorts the snapshot;
  the correction SEED-192#order-pytest-parameter-rows (Taken, plan 464)
  orders parameter ids in the reader by code point, pins the Python
  definition scanner with a unit test, and restates the Intent guidance's
  other-kinds and summary sentences. Pygardon's `tests` root summary (1,283
  files) took 208 s and 1,298 GitHub requests from cold; counting requests
  needs a private `DOUGH_GITHUB_REQUEST_OWNER_ROOT` for the dev server.

**Selected direction:** Publish a Vitest proof reference beside the Cucumber
and pytest ones, with the same recording discipline and a Vitest-shaped
identity of file, name path and project. Each project owns its reporter,
declares `runner`, `proof` and `proofGeneration` on its frontend location,
and commits a first real snapshot from a focused explicit run. In the
dashboard, add Vitest to the kind-neutral case model the pytest story
delivered: rows derive from the TypeScript test calls, the proof parser is
selected by the location's declared runner, the project is the row's
variant, and the reader orders a template's rows and a test's project rows
itself, as the pytest correction orders parameter ids.

**Alternatives considered (explore / borrow):**

| Option | Assessment |
| --- | --- |
| Editor plus `vitest run` output | Baseline and fallback for Terry's evaluation. Gives no latest observation beside Purpose, no project attribution after the run scrolls by, and no folder figures. |
| Commit Vitest's built-in `json` reporter output as Proof | Native, but it keeps failures and error text, has no commit or file-version association, no latest-per-case reduction, and its CLI form replaces the configured reporters. Rejected as `--junitxml` was for pytest. |
| Vitest's `blob` reporter with `--merge-reports` | Built for merging CI shards, not a compact committed snapshot; rejected for the same reasons. |
| Open Dough ships one Vitest reporter in the skill payload | More credible here than for pytest: two projects adopt the same runner API at once, and installed Open Dough scripts already run inside projects. Rejected for this story: it reverses the 2026-11-02 decision that each project owns its recorder, and it would duplicate inside each project the proof store the project's Cucumber recorder already owns. Exposed for Terry: with two near-identical project-owned reporters in place, a shared reporter becomes a measured refactoring rather than a guess. |
| **Project-owned reporter, shared reference and reader** (selected) | Same roles as Cucumber and pytest: reference defines the contract, project records, Intent reads published facts. One reader serves the third family through the case model instead of a Vitest-shaped copy. |
| **Borrowed: type approval per vehicle variant** (adapted) | A model is approved per variant and configuration; a certificate for one variant never covers another, an approval is void once that variant fails a retest, and a variant never tested simply has no certificate. Maps to test case, Vitest project as the variant, an observation per project, an executed non-pass clearing that project's proof only, and a project never run showing no row. Where it breaks: approval forbids selling an unapproved variant; Intent forbids nothing and only shows absence. |

**Challenge:** The purpose is to review frontend protection, not to see green
rows. The strongest consequential doubt is that Vitest names are formatted at
run time and may repeat: in both frontends almost every `each` table runs all
its rows under one name, so one row of proof can stand for several
executions. That does not defeat the purpose when the rule is honest: such an
identity records one observation that passes only when every execution
passed, with the executions' summed duration, and the reference recommends
placeholders for distinct identities. A second doubt, that local Doughnut
runs retry nothing so a flaky case clears its proof, is the correct meaning
of last successful proof. The purpose holds; the scope below records both
rules.

**Scope:**

Required behavior:

- **Vitest proof reference.** `src/skills/dough-test-optimization/references/vitest-proof.md`,
  linked from that skill like the Cucumber and pytest references, written for
  the agent working in the recording project
  ([ADR 0006](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)).
  It carries the Cucumber contract's recording discipline: an explicit
  project-owned option such as `RECORD_VITEST_PROOF=1`, off in every profile
  including CI; normal runs leave proof byte-for-byte untouched; the
  recorder prints nothing, never fails the run, records nothing outside a
  Git checkout; one maintained snapshot (`latest.json`) refreshed atomically
  after each finished case; passing cases only; an executed final
  unsuccessful result clears that case's earlier proof; unexecuted cases
  keep theirs; deliberate commits; `runner`, `proof` and `proofGeneration`
  declared on the location. Vitest-specific rules: the recorder is a
  reporter added to the configured `reporters` beside the existing ones, so
  existing output stays; it runs once per run in the Node process and
  receives every project, worker and browser instance, so it records from
  the reporter's per-case result and never from test files or setup files;
  a case is finished when its final result arrives, retries included;
  `attempts` is the retry count plus one and `durationMs` the case's
  duration across its attempts as the reporter sees it; a `failed` final
  result clears proof and records nothing; a skipped result, whether by
  `skip`, `todo`, `only` elsewhere, a runtime skip or a filter, ran nothing
  and keeps proof; an identity executed more than once in one run (a table
  under one name, a file run in one project twice) records one observation
  that passes only when every execution passed, with `attempts` the greatest
  and `durationMs` the sum; a shard records only what it ran; the recording
  command runs the project's configured reporters, with no `--reporter`
  option, so the recorder is loaded. Rules the pytest reference settled and
  this one carries: the recorder resolves the repository root with
  `git rev-parse --show-toplevel`, reads the covered locations (those with
  `runner: "vitest"` and `proof`) from `.planning/open-dough.json`, records
  only cases of files under them, with `file` relative to the repository
  root rather than Vitest's root, and tests itself on fixture projects with
  the option set only for the inner runs; the snapshot is ordered by `file`,
  `test` and `project` to limit diff noise, and the reference's reading
  section states the row order Intent applies without depending on that
  ordering.
- **Vitest proof format.** One JSON object `{"version": 1, "observations": […]}`
  whose observations are identified by `file` (repository path with `/`
  separators), `test` (the names from the outermost `describe` to the test,
  as Vitest formatted them, as a list) and `project` (the Vitest project
  name, present only when the run names one). Measured fields match the
  other families: `outcome: "passed"`, `attempts`, `durationMs`,
  `finishedAt`, `commit` and `fileBlob`. Never record Vitest's task ids,
  which encode collection order. A file holds at most one observation per
  identity.
- **Declaration.** A `typescript` or `javascript` location that declares
  `proof` also declares `runner`, here `"vitest"`, which selects how its
  proof files are read; Gherkin and `python` locations keep implying theirs.
  The dashboard reads `proof` and `proofGeneration` on it exactly as on a
  Gherkin one. A declared `proof` without a usable `runner` is explained as
  that setting's problem on that location, without hiding the location's
  source or inventory.
- **File Proof for a test file.** Rows come from the published TypeScript
  text in source order: every `it` or `test` call, with or without a
  modifier chain such as `.each`, `.for`, `.skip`, `.only`, `.todo`,
  `.concurrent` or `.skipIf(…)`, whose name is a string literal or a
  template literal without substitutions, named by the enclosing `describe`
  or `suite` names under the same rule, each with its call's line. A name
  from `.each` or `.for` is a template: observed names that fit its
  placeholders (`%s`, `%d`, `%i`, `%f`, `%j`, `%o`, `%#`, `%$`, `%%`,
  `$field`, `$field.path`) expand to one row each in code-point order of the
  observed name, as a parametrized pytest function expands to its observed
  ids in parameter id order, since Vitest's collection order is not
  recorded; a template without placeholders names one case. A test observed
  under several projects shows one row per observed project in code-point
  order of the project name, named with its project as an outline row is
  named with its example cells; a test with no observation shows one row
  reading _No successful proof_. Each observed row shows the same cells as a scenario:
  last successful proof with attempts, duration, time since, commit, and
  whether the test file's published blob is the one observed. The header
  reads **Test case**, and the count line counts test cases.
- **Summaries for a Vitest location or folder.** The same figures as a
  Gherkin or pytest summary over the same rows: an inventory line counting
  tests from the read files, the proof count line over cases, summed last
  successful duration with coverage and the separate-observations note,
  slowest cases, per-child breakdown, Partial labelling while files read or
  failed, drill-down to a file or to a case's definition line, and the
  generation instruction. Wording says tests and test cases where Gherkin
  says scenarios.
- **Explanations.** A `typescript` or `javascript` location without `proof`
  says proof is not recorded and names the Vitest reference; a kind with no
  proof reading yet says which families Proof is read for so far, Vitest
  tests included. Unreadable and malformed proof keep their retry
  explanations, and a proof file of another family's shape under a Vitest
  location is malformed.
- **Doughnut and Pygardon adoption.** In subordinate Doughnut and Pygardon
  workspaces of this execution, as plan 446 did: a project-owned Vitest
  reporter following the reference, loaded by the ordinary local and CI
  commands with recording off, sharing the project's existing proof store
  where that keeps one store per project; its tests run Vitest on fixture
  projects, covering option off, a nested `describe` path, an `each` table
  with and without placeholders, a retried pass, a failure clearing only
  itself, `skip` and `only`, a shard, an interrupted refresh and, in
  Doughnut, the same file under two browser instances; `runner`, `proof`
  (for example `frontend/tests/proof` and `frontend/proof`) and the real
  recording command declared on the frontend location; one explicit focused
  recording run committed as the first snapshot, in Doughnut covering one
  plain spec and one touch spec. Each project's publication follows its own
  rules.
- **Real reading.** With both snapshots published, Intent on project
  Doughnut shows the recorded specs' cases with their projects and a folder
  summary, Intent on project Pygardon shows the recorded file's cases and a
  folder summary, and each frontend root summary (`frontend/tests`,
  `frontend/src`) is opened once with its read time and GitHub request count
  recorded as a learning. Terry evaluates against `vitest run` output plus
  an editor.
- **Documentation.** `docs/dashboard-development-intent.md` describes Vitest
  Proof, the `runner` declaration and project rows beside Gherkin and
  pytest; the reference is linked where the others are.

Constraints:

- Only a plain pass records proof; an executed non-pass clears it, for that
  project only. Proof must not claim behavior a case did not pass
  (correctness of Proof).
- Normal runs never create, change or delete proof (Terry, 2026-11-02).
- Missing, empty, unreadable or malformed proof is never shown as a pass.
- Identity uses Vitest's own formatted names and project names, never task
  ids or collection order; the reference recommends placeholders in `each`
  names so each row is its own case.
- Intent orders a template's observed rows and a test's project rows
  itself, by code point as the pytest correction orders parameter ids; it
  never depends on the order the snapshot holds
  (SEED-192#order-pytest-parameter-rows).
- Existing Cucumber and pytest proof files, reader behavior and wording for
  their locations stay unchanged.
- Each frontend's output, diagnostics, exit meaning, browser instances,
  retries, sharding and CI reporters stay as they are with the reporter
  loaded.

Scope limits:

- The two frontend locations only. Doughnut's CLI Vitest, Open Dough's
  dashboard Playwright tests, and Node `node:test` files are naturally
  served by the test-call row derivation but carry no proof delivery or
  verification commitment here; their runners get their own references and
  `runner` values in later stories.
- No run wall time, no CI comparison, no per-folder run cost, no staleness
  or expiry rule, no browser or runtime context beyond the project name.
- Tests or suites whose names are not literals, or that a file builds
  dynamically, are not derived from source; their observations stay in the
  snapshot and are read when the source rule can name them. Observations
  whose identity the published file no longer defines are not listed.
- Definition lines come from the source rule; `includeTaskLocation` is not
  required of the projects.
- A cheaper root summary for a 396-file folder is deferred: the pytest story
  measured Pygardon's 1,283-file root at 208 s and 1,298 GitHub requests and
  advises a separate story for large-location summaries, which this story
  measures against and does not create.
- A full-suite proof refresh of either frontend is Terry's deliberate run
  after the reporters land; the story commits focused selections first.

**Key examples:**

1. **Explicit focused recording, browser mode.** Doughnut at a prepared
   worktree, no `frontend/tests/proof` →
   `RECORD_VITEST_PROOF=1 ./scripts/run.sh pnpm -C frontend test tests/utils/titlePatternRender.spec.ts tests/toolbars/DonutMenu.search.touch.spec.ts`
   → `frontend/tests/proof/latest.json` holds one passing observation per
   executed case, the plain spec's with `project: "chromium"` and the touch
   spec's with `project: "chromium-touch"`, each with `file`, `test` as its
   `describe` path and name, `commit` at run start and the spec's
   `fileBlob`; the run's output and exit are those of the same run without
   the option, and the same command without the option changes nothing
   under `frontend/tests/proof`.
2. **Explicit focused recording, happy-dom.** Pygardon →
   `RECORD_VITEST_PROOF=1 nix develop -c scripts/check-worktree.sh pnpm -C frontend test src/api/__tests__/verifyStatsFormat.test.ts`
   → `frontend/proof/latest.json` holds that file's 17 cases, none with a
   `project` field; the same command without the option, and
   `scripts/check-prepared-checkout.sh`, change nothing under
   `frontend/proof`.
3. **Tables.** `it.each([1, 2])("adds %i")` passes → observations named
   `adds 1` and `adds 2`; `it.each([a, b])("renders equivalent escapes")`
   with one row failing → no observation for that name and its earlier one
   removed; with both rows passing → one observation with the two
   executions' summed duration.
4. **Retry and clearing.** A case that passes on its second attempt under
   `retry: 1` → one observation with `attempts: 2`. A later explicit run in
   which it fails → its observation removed; Intent reads _No successful
   proof_ until a later pass restores it. A skipped or filtered-out case
   keeps its proof; a run of one shard leaves the other shard's cases as
   they were.
5. **Projects.** A touch spec's cases observed under `chromium-touch` → one
   row per case naming that project; a hypothetical file observed under both
   instances → two rows per test, `chromium` before `chromium-touch` whatever
   order the snapshot holds them, each with its own proof; a failure in one
   instance clears only that project's observation.
6. **File Proof.** Select `frontend/tests/utils/titlePatternRender.spec.ts`
   in Doughnut's Intent at the published revision → a table headed Test
   case, Last successful proof, Duration, Observed, Commit, Observed on;
   rows in definition order named by their `describe` path and name; a
   template row expands to its observed names in code-point order from a
   snapshot that holds them in another order; the count line reads, for
   example, "Last successful proof: 3 test cases: 3 passed"; the Purpose
   pane positions on a row's `it` line when opened from a summary.
7. **Folder summary.** Select `frontend/tests/utils` (26 files) → "N tests"
   from the read files, the proof count line over cases, summed duration
   with "over M of N test cases" and the separate-observations note, slowest
   cases, and children with their sums; Partial labelling and unread file
   retry as for Gherkin; a child name opens that file's Purpose and Proof.
8. **Declaration problems.** `frontend/tests` with `proof` but no `runner` →
   the location explains that `runner` is not declared for its proof, and
   its files and inventory stay readable; `runner: "vitest"` with a
   pytest-shaped file in the proof directory → "Proof could not be read:
   frontend/tests/proof/latest.json is not a valid proof file" with Retry.
9. **Explanations.** Pygardon's `frontend/src` before adoption → "Proof is
   not recorded for this project. To configure deliberate proof generation,
   follow `dough-test-optimization/references/vitest-proof.md` …"; a `shell`
   location → Proof is read for Gherkin feature files, pytest files and
   Vitest tests so far.
10. **Cucumber and pytest unchanged.** Doughnut's and Pygardon's Gherkin
    locations and Pygardon's `tests` location show the same rows, wording
    and summaries as before this story.

**UI:** Vitest Proof reuses the Gherkin table and summary layouts; the unit
words change (Test case, tests, test cases) and a row's variant is its
project where one is observed, as an outline row shows its example cells.
Two interaction choices have system consequences. First, rows named by the
whole `describe` path: for the developer each row reads as the test is named
in Vitest's own output; for the system the row derivation must follow
nesting in TypeScript text rather than scan lines as the Gherkin and Python
rules do. The story keeps the full path, because a bare `it` name repeats
across suites in both frontends. Second, selecting `frontend/tests` reads
396 source files for its summary, a long Partial period for the developer
and 396 GitHub file reads per server process for the system; the story keeps
the shared behavior and measures it, as the pytest story does. No layout,
component or technology is chosen here.

**Architecture:** The dashboard's case model (file, case name path, optional
variant, definition line) gains its third family, and the first in which a
location's kind does not determine its proof format: `runner` on the
location selects the proof parser and, within the kind, the row derivation,
so `typescript` can later carry Playwright proof for Open Dough's dashboard
tests and `javascript` can carry `node:test` proof without a second
settings shape. The project is the variant, which keeps one identity rule
and one latest-first reduction across families
([ADR 0001](../../docs/adrs/0001-ubiquitous-language-accepted.md)). The
Intent answer, internal to the dashboard's server and client, names cases by
that model's file, name path and variant from this story on, replacing the
Cucumber names every kind's cases have carried: the decision the pytest
story's completion record asked for before a third kind, taken here under
the same ADR because a Vitest case under feature, scenario and example would
misname all three; Terry can keep the Cucumber names instead before Take,
and the plan records the rename as a Structure step with no product
behavior. The TypeScript row derivation is a nesting-aware reading of test calls in the
published text, shared by every runner of that call family, not a per-runner
parser ([ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)).
Proof stays a repository record the dashboard reads as a published fact,
and `runner` is project-owned configuration in the same settings file
([ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)).
In each project, the reporter is the second producer of the project's one
proof store, which the project generalizes from scenario identity to the
shared observation shape rather than adding a second store. This is design
within the product, not an ADR proposal; current ADR index and record
statuses agree, and no conflict, exception or North Star topic is needed.

- **Effort hypothesis:** Unbanded; middle-to-higher, medium confidence after
  the pytest story. Three repositories, a nesting-aware TypeScript row rule,
  a `runner` declaration and two real reporters; the first browser-mode
  recording and the root summary costs are the open measurements.
- **Product prerequisites:** TypeScript source reading, the kind-neutral
  case model and the 32 MiB proof read bound, all on trunk since the pytest
  story closed on 2026-11-04. The code-point ordering and the restated
  Intent guidance sentences of SEED-192#order-pytest-parameter-rows (Taken,
  plan 464) are what the reader slices reuse for Vitest rows: they start
  once that correction is on trunk, while the reference and the two
  reporters do not wait. No blocking story dependency is recorded; the plan
  checks the trunk state when its reader slices start.
- **Safe stopping point:** The reference, the generalized reader with
  `runner`, and each project's reporter each keep value alone: Gherkin and
  pytest behavior unchanged, a readable Vitest snapshot wherever one is
  committed, and honest absence elsewhere.


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
retrospective of Read Pygardon pytest proof (`33fe545353b34e2d4028f541e0a922c63286255d:.planning/seeds/SEED-192-review-product-intent.md#read-pytest-proof`) found.

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
