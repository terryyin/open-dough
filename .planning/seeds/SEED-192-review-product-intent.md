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
Intent workspace for Purpose and CI proof. Begin with actual automated
test source and named real projects, within the
[near-future direction](../PRODUCT-BACKLOG.md#near-future-direction) and the
[product intent review memorandum](../../docs/product-intent-review-memorandum.md).
Terry evaluates the first experience. The cost of today's manual workflow has
not been measured; usefulness must be judged against that baseline.

**Decomposition kept 2026-10-31:** Terry requested a visible Development/Intent
frame first, explicit per-project test-folder types, and source browsing.
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
- Proof comes from CI: Intent's **CI status → Proof** shows the judged run's
  CI proof. CPU and other resources can change run time.
- Preserve the selected project, the shared frame and any story scope across
  Intent's reading modes. Near-future direction belongs in Development.
- The existing optimization-candidate story was requested at priority 2 earlier
  on 2026-10-31. Its links require useful source browsing, not merely an empty
  frame. Terry selected its revised placement after the source-browsing stories,
  at priority 4, when keeping this decomposition on 2026-10-31.
- Story impact, protection, and complexity remain part of the parent direction.
  Source changes and passing runs alone do not establish intent protection.
  Domain models, types, and written specifications remain later extensions.

The first learning question is whether the real frame makes the two perspectives
understandable without disrupting Development. The next is whether explicit
locations make real test source easy to find. The next is whether a story's
intent protection and test complexity can be assessed reliably at justified cost.

## Alternatives and Recommendation

- **Defer:** keeps the existing editor/report workflow, but misses the explicitly
  requested Intent experience. Terry has selected advancement of this direction.
- **Use editors, Review changes, and existing reports:** the strongest smaller
  alternative. It remains the comparison and fallback, and can support early
  protection/complexity reviews. It does not supply the requested integrated
  browsing experience; its quantitative disadvantage is unknown.
- **One source-browser story for every language:** possible as delivery
  checkpoints, but plain text, folders, and explicit file selection are the same
  observable behavior. A Python-only reader adds no demonstrated independent
  outcome after a configurable text reader exists. Recommend a Cucumber pilot,
  then one general source-browsing increment evaluated with TypeScript, Python,
  Node, and shell examples. Split only if refinement reveals distinct behavior.
- **Recommended:** deliver the visible frame and source access, then test the
  protection and complexity reviews on a real story.

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
   its existing project settings. File selection matters for colocated tests and mixed helper folders.
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

## Shared Evidence and Sizing Boundaries

Follow the [initial Intent UX/UI direction](../../docs/dashboard-ux-ui-north-star.md#initial-intent-workspace).
Every candidate is evaluated by Terry or a developer reviewing the named project.
Every stopping point preserves useful behavior without later stories. Source
reads name their revision; Proof names its actual run and supported scope.
Missing observations remain unknown. No synthetic sample establishes a real pass.

Open Dough has no established S/M/L calibration, as already recorded here and in
[SEED-052](SEED-052-start-agent-work-from-dashboard.md#open-decisions-before-refinement-or-planning).
No bands or time commitments are invented. Comparative hypotheses below are
unbanded; confidence includes integration, verification, and cleanup.
At decomposition, none had an execution approach or readiness assessment.
Individual refinements and their recorded facts below carry current preparation.

## Story Decomposition

<a id="assess-story-intent-protection"></a>

### 10. Review how well a story's intent is protected

**Identity:** SEED-192#assess-story-intent-protection
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/472-assess-story-intent-protection/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"7230e6e0aa9db3e7ed5e34b8ee4ce527149ce6637dbe11d511b96cf7767522ce","plan":"f61f95e3aaa6bf876566375b13b77ecab0e6704d4a5f7c3eaf021b8e345ae801"}}
```

**Beneficiary.** Terry, evaluating whether AI-assisted review of story intent
helps him decide which test protections to retain, clarify, or strengthen.

**Goal.** Trial the proposed Dough Intent Coverage assessment on three recent
completed Open Dough stories. For each promise and restriction, show how
clearly the maintained tests express it, what evidence shows a test would catch
a regression, and which cases are uncovered or uncertain. Terry can review
the saved reports together and decide whether the method earns further work.

**Scope**

- During this story's execution, run the assessment directly with the AI host
  executing the story. A fresh assessor uses the original story, the delivered
  production implementation, and the relevant tests and support at the recorded
  completion revision. The three cases and their proof routes are in
  [Plan 472](../slice-plans/472-assess-story-intent-protection/PLAN.md#trial-cases).
- Give each promise or restriction a verdict of *protected*, *partially
  protected*, *not protected*, or *unknown*. Cite the story, implementation,
  test assertion and relevant support, and revision-matched execution evidence.
  Explain how clearly the tests express the promise. For partial protection name
  the uncovered case. For unknown name the missing evidence.
- Run the relevant existing tests at the completion revision and record the
  command and results. A protected verdict needs a successful baseline and
  either a break check or an explicit *reasoned-only* explanation. Across at
  least two different cases, probe one uncertain protected claim per case by
  deliberately breaking the promised production behavior in a scratch checkout
  and rerunning the original tests. Record the fault, command, and observed
  assertion or passing result. Reconsider the verdict if the intended fault
  goes undetected.
- Finish the initial verdicts before exposing the assessor to any retrospective
  or later fixes. Compare against known review findings where available and
  check which reported gaps still apply on trunk.
- Commit a Markdown report for each story and a cross-case summary under
  `docs/intent-coverage-trial/`. Keep these reports available after wrap-up so
  Terry can review the evidence and the follow-up can use it. Record useful
  findings, unsupported claims, review effort, and Terry's decision in the
  summary. Link it from the product intent memorandum.
- The scope is the three Open Dough cases and their existing test tools. A
  public skill, cross-project generalization across test types, and automatic
  invocation during wrap-up belong to the
  [separate follow-up](SEED-258-dough-intent-coverage.md#dough-intent-coverage).
  The trial can be executed from Plan 472.

**Key examples**

1. A story promises clicks inside a card's opened disclosure will keep their
   own behavior. A test clicks the summary and a link but never the disclosure
   body. The report gives *partially protected* and names that gap. The trial
   later checks whether this matches the retrospective and whether it still
   applies on trunk.
2. A story promises that a changed file appears in place in the full tree.
   With the original tests passing, a scratch fault drops the changed-file
   overlay and the named assertion fails. The report gives *protected,
   break-checked* for that fault and records the evidence. A fault that
   reproduces the wrong behavior while tests still pass identifies a gap.
3. A relevant test cannot be run successfully at the case revision. The report
   identifies the failed or unavailable evidence and gives *unknown* for the
   promise where that run is needed.
4. Terry opens three committed reports and compares them. The summary
   identifies which findings would change a decision, which claims he rejects,
   and what the work and review cost. He decides whether to pursue the follow-up.
   The reports remain readable after the trial's plan is removed.

<a id="assess-story-test-complexity"></a>

### 11. Review complexity introduced by a story's tests

**Identity:** SEED-192#assess-story-test-complexity
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/475-assess-story-test-complexity/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"e908d27b498ce5b7cfdfc9159bfb32f8eb6666f94b47af98353c11c530e3d2e1","plan":"6d200f3b4c8aa7ea81a8bf8759bf15c4c05bdbd667a68ee6b3a13dda1758f376"}}
```

- **Beneficiary:** Terry, reviewing the maintenance cost of an Open Dough
  dashboard story's test expression.
- **Goal:** Terry can distinguish complexity needed to protect the story's
  behavior from avoidable complexity in its tests and support, and make a
  justified retain or simplify decision. The case also tests whether the
  memorandum's starting criteria improve that decision enough to justify the
  review's own cost, rather than rewarding short test bodies
  ([ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md)).

**Case (selected during refinement, 2026-11-05):** story 5,
SEED-192#review-story-intent-impact
([done record](../done/SEED-192_review-story-intent-impact.json)), at completion
revision `7c71049bac64d7a6520a33628e485704a21ee855`. Its original intent and plan
441 are recoverable at that revision. This is the same case as the protection
review above, but this review stands alone: it assesses the cost of expressing
and maintaining the tests, without waiting for protection verdicts or claiming
to establish them. The selection is an agent planning choice, not a prior
human evaluation of the case.

**Scope:**

- **Required:** identify the test changes actually delivered by this story,
  including its earlier stopped attempt; read their relevant setup, fixtures,
  helpers, stand-ins, and lower-level checks, including unchanged support.
  Explain the behavioral boundary, concepts a maintainer must understand,
  coupling to implementation, and substituted behavior or assumptions. Apply
  the [memorandum's criteria](../../docs/product-intent-review-memorandum.md#observable-proof-cost-and-judged-complexity)
  to the complete expression. Trace costs and benefits to revision-pinned
  source; distinguish the behavior's inherent complexity, its proof's
  complexity, and observed execution cost.
- **Required:** give concrete retain or simplify proposals, naming the intent
  each protects, what a simplification would remove, what proof must survive,
  and uncertainty. A justified retain proposal is a useful result; finding
  something to delete is not an acceptance requirement. Recheck actionable
  historical findings against current trunk before recommending future work.
  Record Terry's decisions and his assessment of the review's usefulness and
  cost. Preserve the method's learning and limitations in the memorandum.
- **Evidence limits:** brevity, counts, a lower boundary, or mocking alone do
  not settle a proposal. Lower-level checks and substituted behavior carry
  costs to explain and weigh against their distinct protection. Source
  inspection supports a reasoned preservation argument, not an observed claim
  that a proposed rewrite preserves detection. Missing timing or protection
  evidence stays unknown; runtime alone measures neither complexity nor value.
- **Scope limits:** one story and the support needed to understand it; no
  suite audit, new dashboard UI, metric or scoring system, reusable review
  skill, automatic rewriting, test optimization, or change to project testing
  rules. Implementing proposals and queuing follow-ups need a separate
  instruction. This story does not rerun historical tests or collect timings;
  it may cite existing execution records with their revision and selection.

**Decision basis:** compare the assessment with ordinary Review changes plus
source reading and the existing
[test-value review](../../docs/maintainer/dashboard-test-value-review.md).
Before writing verdicts, record what those tools already reveal about this
case. Terry judges the method useful if its sourced reasoning helps him make
or confidently retain a concrete maintenance decision and merits the time he
spends reading it. Record unsupported claims and his reading effort, alongside
the assessor's effort. Rejection or an inconclusive decision with its missing
evidence recorded is valid learning; one retrospective case cannot validate a
general heuristic or demonstrate a speedup.

**Key examples:**

1. A short test delegates substantial work to helpers → follow the assertion
   through those helpers and setup → its cost account includes that support,
   with citations, instead of calling the body alone simple.
2. A journey and a lower-level tree check touch related behavior → assess their
   actual boundaries and distinct observations → a proposal explains what
   each protects and the coupling cost; apparent overlap alone does not justify
   deletion.
3. A fixture substitutes an external response → trace where its answer comes
   from and what the assertion observes → distinguish real preconditions from
   supplied behavior and identify the resulting assumption or evidence gap.
4. A proposed simplification would shorten a test but remove its only
   observation of a promised distinction → compare protection with the cost
   removed → recommend retention or specify the equivalent proof a future
   change must retain, without claiming that replacement was tested.
5. A historical cost is already gone on trunk → recheck the cited source →
   retain the historical learning and mark the proposal resolved; do not
   recommend duplicate work. No recorded runtime → leave execution cost
   unknown rather than deriving it from source size or summed durations.
6. Terry reads the proposals and their citations → he decides retain,
   simplify, or insufficient evidence, and keep, adjust, or reject the method
   → record his reasons, review cost, and limitations without changing tests
   or silently starting a follow-up.

**Product prerequisites and stopping point:** the case's intent, attributable
changes, relevant support, and Terry's evaluation. No blocking story dependency
is established, including on the sibling protection review. The sourced
assessment and decisions remain useful if no automation or implementation
follows. Effort is unbanded; no S/M/L calibration is established.

## Ordering, Existing Stories, and Scope Reduction

The numbered sections record the backlog order Terry selected on 2026-10-31;
they do not establish a mandatory dependency chain. Remaining identities stay
canonical here. Specifically, the Cucumber source pilot closed as
SEED-192#browse-test-purpose and is not duplicated under a new identity. Other
existing review candidates retain their outcomes.

The selected order starts with the frame (1), then the Cucumber pilot (2), then
other configured source (3). The strongest rejected smaller option for the
frame is a disposable mockup: Terry explicitly wants to experience the real
interface and return to working Development. This story is justified by that
learning, not merely as infrastructure for later readers.

The earlier optimization-candidate priority becomes selected position 4, after
its source-navigation prerequisites. Story impact (5) keeps the review centered
on a story. The protection trial and complexity review (10–11) can use
existing tools.

The kept decomposition differs from Terry's rough sequence deliberately: it
combines language-only source extensions when they share the same reading
outcome, retaining TypeScript, Python, Node, and shell as real evaluation
examples.

No formal blocking dependency has been recorded: common code and delivery order
alone do not establish that another story cannot start. Each consumer owns its
integration. Establish a blocking agreement later only if refinement demonstrates
an actual supplier outcome required before work can start.

If investment must shrink, retain the source-only product after 3 and keep an
early protection review to test the parent direction's hardest assumption.

## Open Decisions Before Refinement or Planning

- Select a real story and a developer's prior review basis for the complexity
  assessment case (story 11); define what decision and review cost would justify
  keeping its method. Story 10 records its trial cases and evaluation criteria
  in its scope and plan.
- Establish Open Dough S/M/L calibration before assigning bands. Comparative
  uncertainty is recorded; no borrowed client-project timing policy applies.

## When to Surface

Terry kept this revised decomposition and its backlog order on 2026-10-31.
Refine one selected story before
execution planning.

## Breadcrumbs

- Terry's 2026-10-30 direction: initial source browser, story scope, and
  longer-term forms of intent expression.
- Terry's earlier 2026-10-31 request: optimization candidates and accepted slow
  tests at priority 2, with links into the test-source browser.
- Terry's current 2026-10-31 request: decompose the broad first story, lead with
  the real frame, use explicit folder types across Open Dough/Doughnut/Pygardon.
- Terry's 2026-10-31 keep and landing instruction: retain this decomposition,
  queue its stories in the proposed order, and place optimization-candidate
  review after source browsing.
- [Product backlog](../PRODUCT-BACKLOG.md).
- [Initial Intent direction](../../docs/dashboard-ux-ui-north-star.md#initial-intent-workspace).
- [Project visibility requirements](../../docs/project-visibility-requirements.md#product-intent-perspective-the-current-product).
- [Current dashboard behavior](../../dashboard/README.md),
  [source reads](../../dashboard/server/ghContents.ts), and
  [review text](../../dashboard/server/storyReviewFileResponse.ts).
- Doughnut checkout: `package.json`, `frontend/vitest.config.ts`,
  `e2e_test/config/common.ts`, `e2e_test/config/ci.ts`, `backend/build.gradle`.
- Pygardon checkout: `cucumber.js`, `e2e_test/packaged/cucumber.js`,
  `frontend/vite.config.ts`, `pyproject.toml`, `scripts/check-prepared-checkout.sh`,
  and `.github/workflows/ci.yml`. These paths are research references within
  their named repositories, not Open Dough installation requirements.
