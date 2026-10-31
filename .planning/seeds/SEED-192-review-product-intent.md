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
Proof, bounded rolling run history, folder summaries, further test families,
and CI corroboration of locally produced proof with resource-aware timing.
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
  CI independently checks the relevant claims; it does not produce the retained
  dashboard Proof history. CPU and other resources can change run time.
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
with tested source and meaningfully corroborated by independent CI.

## Alternatives and Recommendation

- **Defer:** keeps the existing editor/report workflow, but misses the explicitly
  requested Intent experience. Terry has selected advancement of this direction.
- **Use editors, Review changes, and existing reports:** the strongest smaller
  alternative. It remains the comparison and fallback, and can support early
  protection/complexity reviews. It does not supply the requested integrated
  browsing and rolling evidence experience; its quantitative disadvantage is unknown.
- **One source-browser story for every language:** possible as delivery
  checkpoints, but plain text, folders, and explicit file selection are the same
  observable behavior. A Python-only reader adds no demonstrated independent
  outcome after a configurable text reader exists. Recommend a Cucumber pilot,
  then one general source-browsing increment evaluated with TypeScript, Python,
  Node, and shell examples. Split only if refinement reveals distinct behavior.
- **One universal reporting story or JUnit-only import:** unnecessarily combines
  different runner semantics. Reuse native reports and add one real producer
  family at a time. Avoid a plugin platform or a universal scoring model.
- **Recommended:** deliver the visible frame, source access, one end-to-end
  locally produced Proof history, and early CI corroboration. Extend the shared
  reading experience by actual runner family, with folder summaries once one
  family's observations can already be read. Later families include their CI
  corroboration under the policy learned from the first case.

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
3. **Producer ownership:** a project's normal authorized test workflow produces
   evidence; the dashboard reads it. Prefer compact repository-published run
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
   changed; CI compares the tested basis, not blindly the report commit's HEAD.
5. **Bounded clinical history:** retain failed and incomplete observations as
   well as passes, per configured suite, with each run's original scope. Proposed
   starting retention is the latest ten compact run records per suite, subject
   to review. A focused run must not masquerade as a full run, erase the meaning
   of an earlier full observation, or combine old passing cases into a current
   green suite. Keep raw screenshots/videos out of the compact rolling record.
6. **Native reporting before new machinery:** Cucumber.js emits Cucumber
   Messages, and Doughnut's preprocessor can emit Messages too. This is a
   promising common input, not proven compatibility of their installed versions.
   Map source scenarios/outline rows and retry attempts using each run's actual
   source, not generated runtime IDs across unrelated runs. Keep collection,
   ordinary diagnostics, and strict pass/fail rules coherent. Open Dough already
   has an opt-in Playwright proof record, but it has no explicit tested revision
   and no automatic history/retention policy.
7. **Folder truth and timing:** summarize one selected run's observed children
   before considering cross-run or mixed-runner totals. Show unobserved,
   excluded, skipped, and incomplete work. Summed case durations are not elapsed
   wall time under parallelism; shared setup/hook cost is only attributed where
   observed. Do not invent folder wall time from case sums or imply that a
   folder's source listing is the runner's collected-case inventory.
8. **CI corroboration:** compare applicable tested source and selection before
   comparing case outcomes. A broader CI run can corroborate the matched local
   subset; excluded host-only cases remain unchecked. Missing expected cases,
   changed source, malformed records, retry-assisted passes, and interrupted CI
   need explicit classifications. CI reports its consistency verdict and any
   diagnostic evidence without replacing or appending to the retained local
   Proof history. It corroborates reproducibility; it does not authenticate who
   created a local observation or prove that a test correctly expresses intent.
9. **Resource-aware comparisons:** durations, timestamps, worker counts, and
   execution order need not match. Record relevant runner/browser/runtime and
   resource context where available; compare timing only within comparable
   contexts. Do not choose an arbitrary CPU multiplier or timing tolerance as a
   consistency gate. Actual failures/timeouts retain their observed outcome;
   resource differences qualify interpretation rather than turning them into
   passes. Performance-regression enforcement is a separate later decision.

Both Open Dough and Pygardon's GitHub workflow declarations ignore pushes that
change only `.planning/**` or `docs/**`. Pygardon uses its own source-check
recipe/controller for execution. If report publication uses an ignored path,
first-Proof/CI refinement must establish which source run is checked and how a
report-only update requests corroboration; ordinary push behavior cannot be
assumed sufficient. Respect existing CI adapters and test selection policies.

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
  source association, selection, and history requirements by itself.
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
track has three source/frame outcomes and nine Proof/CI outcomes; four existing
review candidates remain. Most uncertainty lies in the first Proof and CI cases.
At decomposition, none had an execution approach or readiness assessment.
Individual refinements and their recorded facts below carry current preparation.

## Story Decomposition

<a id="browse-test-purpose"></a>

### 2. Browse a project's test source in Intent

**Identity:** SEED-192#browse-test-purpose
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/429-browse-test-purpose/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"d0ff7df40bb2d34902871150c8672d1bfe40c93bdd438bd399f7de3bbdba0190","plan":"29686745ed6008f433843a06dcfe8b8029e181a9cf0d420268c43c580a29702c"}}
```

Refined 2026-10-31 with Terry's direction: keep this story to Gherkin, keep the
implementation cohesive with the existing file tree and source reads (one model,
no duplicate or translation layer), and render source with syntax styling from
an evaluated library that can later serve TypeScript, Python, Java, and others.

#### Goal

A developer reviewing Doughnut's or Pygardon's product intent can open Intent,
find a Cucumber feature in the project's configured Gherkin locations, and
read its exact published source, styled for reading, without opening an editor.
This tests whether explicit project-owned locations make real test source easy
to find, and replaces the frame's forthcoming notice with the first Purpose
reader. Usefulness compared with the editor workflow stays Terry's judgment.

#### Scope

Required behavior:

- **Project-owned locations.** A project lists its intent locations in its
  repository's `.planning/open-dough.json`, each a repository folder and an
  explicit source kind. This story supports the `gherkin` kind, whose files are
  `.feature` files. Execution adds Gherkin locations to Doughnut
  (`e2e_test/features`) and Pygardon (`e2e_test/features`,
  `e2e_test/packaged/features`) and publishes them on their trunks.
- **Published, pinned reading.** Intent reads the configuration, folder
  contents, and file text at the one revision the dashboard already observes
  for the selected project, and names that revision beside the source. No local
  checkout or running session is needed.
- **Browse.** Each location shows its nested folders and Gherkin files in a
  collapsible tree arranged as Review changes arranges its files. Files outside
  the kind, such as Doughnut's tracked snapshot PNGs, are not listed.
- **Read.** Selecting a file shows its whole exact text with line numbers and
  Gherkin syntax styling. Styling only aids reading: copying the text yields the
  source, and nothing depends on color to be understood.
- **Proof.** The selected file's Proof truthfully says no Proof is available yet.
- **Distinct states.** No configured locations, a location with no Gherkin files
  at the revision, an unsupported kind, and a failed read each say what happened
  and name the setting or location involved; a failed read can be retried.
- **Project change** shows the newly selected project's locations and source.

Deferred promises (not undertaken here; nothing prevents them):

- Other source kinds and file-selection patterns
  ([browse-configured-test-source](#browse-configured-test-source)).
- Syntax styling in Review changes diffs; the styling ability is chosen so it
  can serve them later.
- Links or URLs to a selected file (owned by the optimization-candidate story),
  scenario parsing or outline, search, automatic location detection, a settings
  editor, Purpose/Proof layout switching, and any Proof collection.

Required restrictions:

- Reads stay limited to paths inside the configured locations of the observed
  revision's configuration: the local read boundary is not an open repository
  proxy, as for every existing published read.

Boundary assumptions:

- The dashboard has no dark appearance today, so one light styling theme
  suffices.
- Terry authorizes the configuration commits to Doughnut and Pygardon as part
  of this story's publication and evaluation.

#### Key examples

1. **Find and read a feature.** Doughnut publishes a `gherkin` location at
   `e2e_test/features` → the developer opens Intent, expands `recall`, and
   selects a feature → its exact text appears with line numbers, `Feature:`,
   `Scenario:`, and step keywords styled distinctly, and the revision shown is
   the one the dashboard observes for Doughnut. The `recall/__image_snapshots__`
   PNG files are not listed.
2. **Several locations.** Pygardon publishes two `gherkin` locations → Intent
   shows both, each with its own tree; choosing a packaged feature shows its
   text.
3. **Project change.** Intent shows a Doughnut feature → the developer selects
   Pygardon → Doughnut's tree and text are replaced by Pygardon's locations,
   with nothing selected until a file is chosen.
4. **Not configured.** Open Dough's published `.planning/open-dough.json` has no
   intent locations → Intent says no intent locations are configured and names
   the setting and file to add them to; it shows no empty tree.
5. **Empty or missing location.** A configured location holds no `.feature`
   files at the revision, or does not exist → that location says so by path;
   other locations still browse.
6. **Unsupported kind.** A location names kind `typescript` → that location
   says the kind is not yet supported, naming it; other locations still browse.
7. **Read failure.** Reading a selected file fails → the source pane says it
   could not be read and offers retry; the tree stays usable.
8. **No Proof yet.** With a file selected → Proof says no Proof is available for
   it yet, without implying a pass, failure, or absence of tests.

#### Architecture

Applicable Accepted decisions: [ADR 0001](../../docs/adrs/0001-ubiquitous-language-accepted.md)
(Purpose is test source; Proof stays distinct),
[ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
(reuse suitable existing solutions), and
[ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
(project facts come from published repository records; machine registration
stays local). No conflict found; no ADR change proposed.

- **One configuration model.** The intent locations are a new key in the
  existing lenient `.planning/open-dough.json` project settings. The source kind
  is the domain term the reader uses directly: it selects both the listed files
  (`gherkin` → `.feature`) and the styling grammar, which uses the same language
  name, so there is no separate mapping layer. A later Proof runner stays a
  separate setting; Gherkin does not imply Cucumber.js.
- **One read path.** Configuration, listing, and text go through the existing
  local authenticated read boundary at a pinned revision, reusing its `gh`
  reads, failure meanings, pinned-text memo, and browser file cache. The new
  admission rule mirrors the existing reachability rule: a path is readable
  when that revision's configured locations contain it, instead of when its
  backlog records name it. A folder's nested listing is one new read beside the
  existing single-folder listing; story review's local `git` reads are not used.
- **One tree.** Review changes' folder arrangement (folder chains compacted,
  folders before files, stable order, collapse/expand rows) becomes shared by
  both browsers over a path-bearing item, so Intent does not copy it. Each
  browser keeps its own row content and counts wording (changed files versus
  feature files).
- **Source styling ability.** Review changes has no syntax styling today, so this
  story introduces it once, as a source-lines view that both Intent and, later,
  Review changes can use. Candidates compared on 2026-10-31 by a scratch probe
  outside this repository:
  - **Shiki 4.5.0 (recommended).** TextMate grammars, the same family as
    GitHub and VS Code, so Gherkin, TypeScript, Python, Java, and shell are all
    available. Its JavaScript regex engine needs no WebAssembly, grammars and the
    theme load on demand (Gherkin grammar about 12 KB, TypeScript about 188 KB),
    and `codeToTokens` returns per-line colored tokens that React renders
    directly beside line numbers, without injected HTML. Probe: a 170-line
    Doughnut feature tokenized in about 22 ms with `Feature`, step keywords,
    and quoted strings distinguished.
  - **highlight.js 11.12.0.** Small and synchronous with Gherkin support, but
    it returns an HTML string, so per-line rendering needs injected markup or
    splitting multi-line spans; its regex grammars are less faithful.
  - **Prism 1.30.0 / refractor 5.0.0.** Gherkin supported and refractor gives a
    tree rather than HTML, but its grammars are older and less complete, and
    refractor's last release was in March 2025.
  - **starry-night 3.11.0.** GitHub's grammars as a tree, but it needs
    WebAssembly Oniguruma, a larger load than Shiki's JavaScript engine.
  - **CodeMirror or Monaco.** Editors; far more than a read-only view needs.
  - **GitHub's own page.** A link to the file on GitHub renders it styled with
    no new dependency, but leaves the dashboard and cannot sit beside Proof.
- **Borrowed mechanism.** GitHub Linguist lets a repository declare, in
  `.gitattributes`, which language a path holds; that declaration selects both
  classification and highlighting. The intent location's kind plays the same
  role. The analogy stops at detection: Linguist guesses by extension first,
  while this story uses only explicit declarations.


<a id="browse-configured-test-source"></a>

### 3. Browse the other configured test sources

**Identity:** SEED-192#browse-configured-test-source
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** A developer can use Intent for the other maintained test sources,
  including tests colocated with application code.
- **Evaluation:** Open a dashboard Playwright TypeScript spec in Open Dough,
  frontend Vitest specs in Doughnut and Pygardon, a Pygardon pytest file, and
  selected Open Dough/Doughnut Node or shell test source. Nested navigation and
  explicit file selection keep helpers and product files understandable.
- **Value / learning:** Tests one shared text-reading rule across the requested
  families; Python and scripts need no separate story merely for syntax.
- **Boundary:** Explicit roots, source kinds, and include selections; actual text
  with project/revision context. No AST-based case inventory, runner migration,
  report collection, or claim that every file in a mixed folder is a test.
- **Effort hypothesis:** Unbanded; lower-to-middle, medium confidence after the
  Cucumber pilot. Split TypeScript first only if file selection or a distinct
  Python/script behavior proves independently consequential during refinement.
  Fold examples already supported by the pilot into its evaluation rather than
  queue a source-extension story that would change no behavior.
- **Product prerequisites:** A source-reading experience for integration. No
  parser or execution reporter is a prerequisite for source browsing.
- **Safe stopping point:** All named source examples remain readable without
  runtime Proof. New formats can work naturally without an artificial gate.


<a id="review-test-optimization-candidates"></a>

### 4. Review test optimization candidates and accepted slow tests

**Identity:** SEED-192#review-test-optimization-candidates
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** A developer can see which tests remain hard to optimize and
  which slow tests have an accepted cost, then inspect the tests behind those
  decisions without leaving Intent.
- **Evaluation:** For the selected project's maintained Test Optimization
  Candidates record, list every pending candidate and every accepted necessary
  cost in clearly labelled groups. Show the recorded test locations, observed
  cost and date, and disposition rationale, with access to recorded evidence.
  Selecting a test location opens that project's actual test source through
  the configured-source browser. A family spanning multiple files links each file;
  use an identified case location when available. An unavailable or moved target
  explains the gap rather than opening an unrelated test.
- **Value / learning:** Makes unresolved optimization work and deliberate
  decisions to retain slow protection reviewable together. Tests whether direct
  access to the protected behavior helps developers understand those decisions.
- **Boundary:** Read the maintained record, such as Open Dough's
  [Test Optimization Candidates](../TEST-OPTIMIZATION-CANDIDATES.md), and reuse
  the configured-source reader and test selection. Include all recorded
  pending and accepted entries, regardless of their observed duration or whether
  a runtime report is available. Accepted costs remain visible with their
  rationale; acceptance does not imply skipping or excluding those tests.
  Profiling, test changes, and disposition changes belong to separate work.
- **Effort hypothesis:** Unbanded; comparatively lower, medium confidence.
  Assumes source browsing supports the recorded tests' source types. Resolving recorded
  locations and presenting missing targets truthfully need refinement.
- **Product prerequisites:** A maintained candidate record and the test-source
  navigation delivered by the source-browsing increments. Reusing that navigation belongs in
  this story's implementation; no separate navigation mechanism is needed.
- **Safe stopping point:** The complete recorded list and its test links are
  useful without runtime Proof or automated assessment. Distinguish an absent
  or unreadable record from a readable record with no entries in either group.

<a id="review-story-intent-impact"></a>

### 5. Review a story's impact on test intent

**Identity:** SEED-192#review-story-intent-impact
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** A developer can focus an intent review on what a story changed,
  while retaining access to the surrounding maintained test source.
- **Evaluation:** Select a story with a recoverable source comparison, including
  a completed story, and inspect the relevant test-file changes with the compared
  revisions. Return to the whole-project view without losing the selected project.
- **Value / learning:** Connects the new Intent view to the near-future question
  about a story, rather than making a whole-product assessment the entry cost.
- **Boundary:** Reuses the meaning of existing story comparisons. Changed-test
  selection is an initial impact view; unchanged tests may also protect affected
  behavior. An unavailable comparison explains the gap rather than showing
  an empty change as evidence of no impact.
- **Effort hypothesis:** Unbanded; comparatively middle, medium confidence.
  Assumes existing Review changes can supply a usable comparison. Completed-story
  attribution and continuity with project browsing need refinement.
- **Product prerequisites:** A story identity and an available comparison for the
  evaluated case. No blocking story dependency has been established.
- **Safe stopping point:** Developers can review a story's changes to Purpose
  even if runtime reporting or assisted assessment is never added.

<a id="read-observed-test-proof"></a>

### 6. Read observed proof alongside test purpose

**Identity:** SEED-192#read-observed-test-proof
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** A Pygardon developer can see recent actual Cucumber.js proof for
  the feature source being reviewed, rather than locate separate console logs.
- **Evaluation:** Run an existing authorized local selection, retain and publish
  its compact record, then select its feature in Intent and inspect cases,
  attempts, outcomes, time, cost, and recent run history against the tested basis.
  A focused or interrupted run remains visibly limited. Switch Purpose/Proof
  layouts without losing selection; preserve story scope when one is present.
- **Value / learning:** The first complete producer-to-reader loop tests whether
  source association and bounded clinical history are useful and affordable.
- **Boundary:** Pygardon's ordinary Cucumber.js profile first, file-level Proof,
  bounded run history, source association, and existing command failure meaning.
  Retention count/path/publication and relevant source basis must be settled in
  refinement. Folder totals and CI corroboration are separate outcomes.
- **Effort hypothesis:** Unbanded; higher, low confidence. Existing Messages are
  input, not a delivered publication/history service. Narrow the chosen profile
  or selection if necessary while retaining honest outcome/attempt distinctions.
- **Product prerequisites:** Actual feature source and a runnable authorized
  local selection. No dashboard-run button or new service is required.
- **Safe stopping point:** Recent local file-level evidence is useful even if CI
  corroboration never arrives, and is explicitly uncorroborated in that case.


<a id="check-cucumber-proof-in-ci"></a>

### 7. Check locally collected Cucumber proof against CI

**Identity:** SEED-192#check-cucumber-proof-in-ci
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** A Pygardon developer can tell whether independent CI corroborates
  the applicable retained local Cucumber proof or why comparison is incomplete.
- **Evaluation:** CI reads the local record published with a source basis, runs
  its own selection, and reports matching observations, a specific discrepancy,
  or an explicit unchecked scope. A slower compatible CI run with matching
  outcomes remains consistent without requiring equal durations.
- **Value / learning:** Tests the trust boundary before proliferating producers:
  selection, evidence-only commits, CI exclusions, and nonidentical resources.
- **Boundary:** One project, one runner family. CI's comparison output does not
  create, refresh, or overwrite retained local history. Define comparison of
  case identities/outcomes, retries, incomplete runs, and report-only trigger
  behavior. Performance gates and proof authenticity are separate concerns.
- **Effort hypothesis:** Unbanded; higher, low confidence. Actual Pygardon source
  recipe/controller and differing local/CI tags must be respected.
- **Product prerequisites:** Retained locally produced Cucumber evidence and an
  independently runnable CI selection; only matched source/scope is corroborated.
- **Safe stopping point:** An actionable CI consistency verdict for Cucumber.js;
  earlier source and local history views still work when CI is unavailable.


<a id="read-cypress-cucumber-proof"></a>

### 8. Read Doughnut Cucumber proof with recent history

**Identity:** SEED-192#read-cypress-cucumber-proof
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** A Doughnut developer can review local Cypress-Cucumber evidence
  for a selected feature through the same Intent experience.
- **Evaluation:** Produce and publish a real record through Doughnut's existing
  runner, read feature/case history, and check comparable observations against
  its CI selection. Outline rows and retries retain their source association.
- **Value / learning:** Tests whether the first Cucumber input and evidence
  meanings survive a second real execution integration.
- **Boundary:** Cypress preprocessor Messages and Doughnut's existing runner,
  diagnostics, tags, and isolation. Reuse learned history/read/CI policy without
  assuming Cucumber.js-generated identifiers or changing either project's runner.
- **Effort hypothesis:** Unbanded; middle-to-higher, low-to-medium confidence.
  Both emit Messages, but version compatibility and Cypress run semantics need
  observation. No generic adapter framework is justified by this alone.
- **Product prerequisites:** The evidence/history and CI comparison outcomes at
  integration; no formal start dependency has been established.
- **Safe stopping point:** Doughnut file-level history and bounded corroboration
  stand alone; large attachments do not enter the compact retained record.


<a id="inspect-hierarchical-proof-cost"></a>

### 9. Find expensive proof in the test hierarchy

**Identity:** SEED-192#inspect-hierarchical-proof-cost
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** A developer can locate observed execution cost and result gaps
  by selecting folders and drilling into their tests.
- **Evaluation:** Select a Cucumber folder and one real run, read its observed
  child outcomes and costs, then open a feature. A focused run exposes unobserved
  children. Concurrent case-duration sums are labelled separately from run wall
  time; unavailable folder wall time remains unavailable.
- **Value / learning:** Makes existing observations navigable for maintenance
  without requiring an automated judgment about cost or intent quality.
- **Boundary:** Begin with the configured hierarchy and one supported Cucumber
  run. No union of unrelated historical passes, mixed-runner performance ranking,
  invented shared-setup attribution, or whole-product protection claim. Other
  producers reuse the rule where their observations support it.
- **Effort hypothesis:** Unbanded; middle, medium confidence after file-level
  Proof. Case selection and timing definitions drive the uncertainty.
- **Product prerequisites:** A browsable hierarchy and readable observations for
  at least one runner; a second Cucumber producer is not required.
- **Safe stopping point:** Honest folder-level outcomes/costs with drill-down,
  useful even if every other report family is cancelled.


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
  and recent history beside the TypeScript source already readable in Intent.
- **Evaluation:** Collect a real local Vitest run in each frontend, inspect
  file/case outcomes and history, use supported folder summaries, and corroborate
  comparable claims against each project's CI selection.
- **Value / learning:** Tests shared reporting across browser-mode and happy-dom
  Vitest without conflating their execution environments.
- **Boundary:** The two frontends, including explicit browser-project identity,
  retries, and existing reporter/failure behavior. Open Dough dashboard tests
  remain Playwright. CLI Vitest is a later selection rather than hidden scope.
- **Effort hypothesis:** Unbanded; middle, medium confidence after the first
  proof/CI case. Split the frontend variants only if real reporting behavior
  proves materially different; Vue versus React alone does not require a split.
- **Product prerequisites:** TypeScript source reading and established run-history
  and CI comparison semantics at integration.
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
  strict terminal outcome and bounded history in Intent, and corroborate its
  applicable claims against the actual CI selection/shards.
- **Value / learning:** Brings the dashboard's own test intent into Proof and
  tests reuse of its already available opt-in record.
- **Boundary:** Add missing source association, publication, and history around
  the existing contract. A listed-only, running, skipped, or raw-runner pass
  cannot be upgraded to executed strict pass. Preserve quiet diagnostics.
- **Effort hypothesis:** Unbanded; middle, medium confidence. Repetition/retry,
  shared hooks, and shard scope already have meaningful distinctions to retain.
- **Product prerequisites:** Source reader and established Proof/CI semantics.
- **Safe stopping point:** Honest dashboard file/folder Proof without migrating
  tests to another runner or waiting for Python/script collection.


<a id="read-pytest-proof"></a>

### 14. Read Pygardon pytest proof

**Identity:** SEED-192#read-pytest-proof
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** A Pygardon developer can review observed Python test protection
  and recent history alongside the configured pytest source.
- **Evaluation:** Record an actual authorized pytest selection, inspect file/case
  and parameterized outcomes, then corroborate the applicable subset in CI.
  Slow and host-Docker selections absent from CI stay explicitly unchecked.
- **Value / learning:** Extends evidence to Python while preserving its real
  collection, setup/teardown, expected-failure, and parallel-run meanings.
- **Boundary:** Pygardon's selected pytest suite; not legacy Python trees or
  Doughnut CLI unittest. Source root, default markers, and CI selection are
  separate facts; visible source does not imply executed coverage.
- **Effort hypothesis:** Unbanded; middle-to-higher, low-to-medium confidence.
  Existing progress containment, plugins, and xdist must retain their behavior.
- **Product prerequisites:** Python source reading and established Proof/CI semantics.
- **Safe stopping point:** Reviewable Python Proof with its actual limits; no
  invented per-folder wall cost or current pass from an unmatched older run.


<a id="read-node-test-proof"></a>

### 15. Read Node script-test proof

**Identity:** SEED-192#read-node-test-proof
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** Open Dough and Doughnut developers can inspect script-test
  evidence alongside the configured Node test source.
- **Evaluation:** Capture a real `node --test` selection in each project through
  its existing command, read cases/subtests, terminal outcome, and history, and
  corroborate matched CI observations.
- **Value / learning:** Makes script protection visible at the runner's actual
  case granularity without treating a wrapper's exit as every case passing.
- **Boundary:** Node test events and the selected project commands. Preserve
  existing scheduler ownership, quiet/strict failures, and nested-case meanings.
  A suite plus its child cases must not inflate counts or summed duration.
- **Effort hypothesis:** Unbanded; middle, medium confidence. Two project wrappers
  use one runner family; console scraping is not a reporting contract.
- **Product prerequisites:** Configured script source and shared Proof/CI semantics.
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
  each check's observed result and duration beside its source, and corroborate
  comparable check-level observations in CI.
- **Value / learning:** Extends the review to a real remaining test family without
  manufacturing case identities or counts unavailable from the command.
- **Boundary:** Selected Open Dough shell checks. A shell process can truthfully
  yield file/check-level evidence; case-level claims require a real producer.
  Preserve strict command exit and timing semantics. Add Doughnut shell checks
  only when a concrete runnable target is selected.
- **Effort hypothesis:** Unbanded; middle, low-to-medium confidence. The existing
  scheduler already observes job exit/time, but retention and source mapping
  still need integration; parsing arbitrary scripts is not part of this story.
- **Product prerequisites:** Configured source and shared Proof/CI semantics.
- **Safe stopping point:** Honest coarse-grained Proof, labelled as such, remains
  useful without pretending it has the same detail as Cucumber or pytest.


## Ordering, Existing Stories, and Scope Reduction

The numbered sections record the backlog order Terry selected on 2026-10-31;
they do not establish a mandatory dependency chain. The existing seven identities
remain canonical here. Specifically, `browse-test-purpose` narrows to the Cucumber source pilot,
`read-observed-test-proof` narrows to Pygardon's first local Cucumber case, and
`inspect-hierarchical-proof-cost` keeps folder Proof. These are not duplicated
under new identities. Other existing review candidates retain their outcomes.

The selected order starts with the frame (1), then the Cucumber pilot (2), then
other configured source (3). The strongest rejected smaller option for the
frame is a disposable mockup: Terry explicitly wants to experience the real
interface and return to working Development. This story is justified by that
learning, not merely as infrastructure for later readers.

The earlier optimization-candidate priority becomes selected position 4, after
its source-navigation prerequisites. Story impact (5) keeps the review centered
on a story. First local Proof (6) precedes CI corroboration (7), then Doughnut's
second producer (8). Folder Proof (9) needs only one producer and may move before
8 if that offers earlier value. Preserve the bounded protection/complexity
learning (10–11) before expanding collection across every remaining family
(12–16). Those review cases can also use existing tools sooner.

The kept decomposition differs from Terry's rough sequence in three deliberate ways:

- Combine language-only source extensions when they share the same reading
  outcome; retain TypeScript, Python, Node, and shell as real evaluation examples.
- Separate runner-specific collection even where the source language matches.
- Check CI consistency on one Cucumber family early, then include corroboration
  in each later producer's complete outcome rather than postpone one very large
  cross-runner reconciliation story until last.

Once the comparison policy is understood, corroboration is part of a later
producer's promised evidence quality. If a new runner introduces a separate
unsettled comparison policy, split that learning from its local-history outcome
instead of silently enlarging the producer story.

No formal blocking dependency has been recorded: common code and delivery order
alone do not establish that another story cannot start. Each consumer owns its
integration. Establish a blocking agreement later only if refinement demonstrates
an actual supplier outcome required before work can start.

If investment must shrink, retain the source-only product after 3. Next retain
one Cucumber producer plus its corroboration (6–7). Drop additional producer
families in reverse order of demonstrated use; shell/Node and unrequested
Java/CLI expansion are the first candidates to defer, rather than spreading
partially trustworthy evidence everywhere. Keep an early protection review to
test the parent direction's hardest assumption. History can be modest; source
association and truthful selection/outcomes cannot be deferred without weakening
what the first Proof claims.

## Open Decisions Before Refinement or Planning

- For first Proof, settle a runnable Pygardon profile, tested-source basis,
  compact repository publication path, count/size retention budget, and how
  source and report-only changes obtain CI corroboration. Ten runs per suite is
  a proposed starting point, not an accepted retention rule.
- Refine comparison dispositions: what local scope requires CI corroboration,
  how unmatched/host-only scopes are reported, and what discrepancies fail a
  check. Durations alone do not decide logical consistency in this proposal.
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
  collect bounded local Proof history and folder observations, then corroborate
  against CI with resource-aware timings.
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
