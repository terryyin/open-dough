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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/472-assess-story-intent-protection/PLAN.md","assessment":"not-ready","reasons":["Terry withdrew the story from execution on 2026-11-05: it is not ready to be executed yet and needs further refinement."],"basis":{"document":"ff429504421f5eedd7d75b7cdecaba0cbe9b138c756c4f6ebbc1ed6f4c94e5da","plan":"e91b10cbb1ff354d468d3e61408853a11eec5193d43e1f5c8ed0e0b0e42c27fd"}}
```

- **Beneficiary:** A developer deciding whether one story's intent is worth
  keeping, clarifying, or strengthening in its maintained high-level tests,
  here Terry reviewing an Open Dough dashboard story.
- **Goal:** Terry receives an explainable, per-promise account of how well one
  completed story's intent is distilled into its tests and protected by them:
  what each promise's tests express, whether a test would fail if the promise
  broke, and where evidence is missing. He can follow every claim to its
  source, and decides retain, clarify, or strengthen per promise, or rejects
  the method as unhelpful with its limitation recorded. This tests the parent
  direction's hardest assumption, that such an assessment is reliable and
  worth its cost, before any general coverage model or automation is built
  ([ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md)).

**Case (selected during refinement, 2026-11-05):**
story 5, Review a story's impact on test intent
(SEED-192#review-story-intent-impact, [done record](../done/SEED-192_review-story-intent-impact.json)), assessed at its completion revision
`7c71049b`. Its intent is recoverable there as the story's seed section and
plan 441 (`git show 7c71049b:<path>`); its tests are Playwright dashboard
journeys, the high-level form the memorandum trusts most. The review basis to
compare against is already recorded: the story's execution retrospective,
Terry's ordinary review through the existing tools, found two promises the
tests did not protect: clicks inside an opened disclosure body selected the
card, and Intent's **Review changes** link showed another comparison for a
story with a review mark (correction SEED-192#align-intent-story-lens, plan
448, `git show 168c04473^:.planning/slice-plans/448-align-intent-story-lens/PLAN.md`).
This gives the case a known answer and a live one: findings that correction
448 already fixed measure recall, and findings that still hold on current
trunk need a live decision.

**Facts observed during refinement (2026-11-05):** `7c71049b` is an ancestor
of trunk and holds story 5's seed section and plan. It holds no committed
dashboard proof record: `dashboard/tests/proof/latest.json` first appears in
`2d272e1bb` (2026-11-05). The case's execution evidence is therefore a fresh
local run of the story's specs at `7c71049b`.

**Scope:**

- **Required:**
  - An assessment of story 5's intent at `7c71049b`, written before the
    assessor reads anything recorded after that revision: the retrospective,
    correction 448, or later commits. Each promise and restriction in story 5's
    section gets one verdict: *protected*, *partially protected* (naming the
    uncovered case), *not protected*, or *unknown* (naming the missing
    evidence). Each verdict cites the story text, the test and support source
    lines, and the execution evidence it rests on, and says how clearly the
    test expresses the promise.
  - Execution evidence: a fresh local run of the story's specs at `7c71049b`,
    with its command and per-test result. A test that was not run, or not run
    successfully, supports no *protected* verdict.
  - Break checks, adapted from mutation testing: a *protected* verdict is
    either break-checked (a deliberate local fault against the promise, in a
    scratch copy at `7c71049b`, makes a named test fail; record the fault,
    command, and failing assertion) or labelled reasoned-only with why it was
    not checked. At least two verdicts are break-checked, chosen where the
    reasoning is least certain. Break checks run locally and cost nothing;
    no paid native-host runs.
  - A comparison with the review basis: which retrospective findings the
    assessment recovered or missed, and what it found that the retrospective
    did not. Each finding still applying on current trunk is rechecked there.
  - Terry's evaluation: per live finding, retain, clarify, or strengthen;
    unsupported claims he rejects, counted; the assessor's elapsed time and
    his reading time. A strengthen or clarify decision becomes a queued story
    or bounded correction, or is declined with its reason.
  - The method's lasting learning, its usefulness, unsupported claims, cost,
    and limits, recorded in the
    [product intent review memorandum](../../docs/product-intent-review-memorandum.md),
    including a rejected or inconclusive result.
- **Keep criterion (proposed, Terry's to judge):** keep the method only if it
  recovers both retrospective findings, or explains why the evidence at
  `7c71049b` could not show them, and gives Terry at least one useful verdict
  the retrospective did not, with few enough unsupported claims that checking
  them costs less than the review saves. Matching the retrospective's gaps
  alone favors folding the method into the retrospective instead.
- **Scope limits:** one case. No product code, test, or project-rule change:
  strengthening a finding is the follow-up it queues. The assessment uses the
  existing tools (Git, the checkout, the dashboard's Intent and Review changes,
  local test runs) and an agent; no new skill, dashboard automation, stored
  intent catalogue, or numeric score.
- **Deferred, neither promised nor prevented:** a reusable assessment skill or
  a retrospective extension, a dashboard action that launches the assessment,
  a second case such as a story in progress or a Doughnut or Pygardon Cucumber
  story, and the complexity review of story 11.

**Key examples:**

1. Story 5 promises that clicks on a card's disclosures keep their own
   behavior → the assessor finds that `story-card-selection.spec.ts` clicks
   only a disclosure's summary and a link → verdict *partially protected:
   opened disclosure body not exercised*, matching the retrospective's first
   finding, already fixed on trunk by correction 448 → counted as recall; no
   live decision.
2. Story 5 restricts Intent's changed files to the comparison Review changes
   shows → no fixture gives the story a review mark → verdict *partially
   protected: only unmarked stories*, matching the second finding → recall.
3. A promise the assessor judges protected, such as a changed file showing in
   place in the full tree → a scratch fault at `7c71049b` drops that overlay →
   the named spec fails on its assertion → verdict *protected, break-checked*,
   with the fault, command, and failing assertion recorded.
4. A promise judged protected where no fault was introduced → *protected,
   reasoned-only*, with the reason; Terry weighs it as a weaker claim.
5. A spec of the story fails or cannot run at `7c71049b` → its promises are
   *unknown*, naming the run, not *protected*.
6. The assessor reports a gap the retrospective did not, and it still holds on
   trunk → Terry decides strengthen → a story or correction is queued with the
   finding; or he decides retain, recorded with his reason.
7. Terry finds a verdict whose cited source does not say what the verdict
   claims → it counts as unsupported; if such claims outweigh useful verdicts,
   he rejects the method and the memorandum records why.

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
learning (10–11). Those review cases can also use existing tools sooner.

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
families in reverse order of demonstrated use; Node and unrequested
Java/CLI expansion are the first candidates to defer, rather than spreading
partially trustworthy evidence everywhere. Keep an early protection review to
test the parent direction's hardest assumption. History can be modest; source
association and truthful selection/outcomes cannot be deferred without weakening
what the first Proof claims.

## Open Decisions Before Refinement or Planning

- First Proof's profile, tested basis, publication and retention were settled
  on 2026-11-01 and published as the [Cucumber proof reference](../../src/skills/dough-test-optimization/references/cucumber-proof.md): proof is
  a latest per-scenario snapshot, not run history.
- Select a real story and a developer's prior review basis for the complexity
  assessment case (story 11); define what decision and review cost would justify
  keeping its method. Story 10 records its own case and keep criterion.
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
