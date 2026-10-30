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

For developers reviewing a newly developed story, the difficulty of connecting
its intended outcome to maintained test source and observed proof should change
to a review that supports decisions about intent clarity, protection, complexity,
and proof cost. Begin with automated tests and the story's impact, within the
[near-future direction](../PRODUCT-BACKLOG.md#near-future-direction) and the
[product intent review memorandum](../../docs/product-intent-review-memorandum.md).

The dashboard currently presents Development and supports Review changes.
Intent remains design direction. Test source can be read in existing editors,
and test results can be read outside the dashboard. The missing product outcome
is a coherent review of the resulting intent and its proof. The time or error
cost of the existing manual workflow has not been measured.

Terry selected this direction on 2026-10-30 and requested its decomposition and
backlog ordering. The named beneficiary is the developer maintaining and
reviewing product intent, with Terry evaluating the initial experience. The
stories and their order below are recommendations under that request, rather
than a record of acceptance of each individual boundary.

## Human-Owned Framing and Constraints

The preceding discussion establishes these inputs:

- The initial usable Intent increment can be a test-file browser. Each project
  identifies its test locations; the reader follows their folder structure.
- Purpose initially means actual static test source. Proof adds observed
  execution information. The selected UX supports side-by-side and tabbed
  layouts, with an adjacent switch that preserves the selection and story scope.
- Review the intent introduced or affected by a newly developed story, including
  a completed story with a recoverable comparison. The maintained product intent
  survives the story; a changed file is only an initial indication of impact.
- Protection and complexity assessment are questions to investigate. High-level,
  concise tests are preferred; setup, low-level coupling, and mocking carry
  complexity costs. These preferences have not established a scoring formula.
- Actual execution reports provide the initial observable proof cost. Keep
  timings, outcomes, selection, and evidence limitations understandable.
- Domain models, static types, written specifications, and assessment of the
  whole product's protection belong to the longer-term memorandum.
- The initial navigation includes Development and Intent. Structure is deferred.
  Near-future direction belongs in Development. Start session placement remains
  open and need not be settled to deliver these review outcomes.

The most consequential unresolved assumption is whether an explainable
assessment can tell the developer something useful about a story's intent
protection. The first browser story tests the smaller, explicitly requested
entry point: whether developers can locate and read the relevant expressions of
intent. A bounded assessment comes before richer aggregate reporting.

## Alternatives and Recommendation

- **Defer or do nothing:** preserves the current tools and their cost, but leaves
  the selected review goal unmet. Terry has chosen to advance this direction.
- **Use an editor, existing Review changes, and manual test reports:** the
  strongest smaller alternative and the baseline for assessing added value.
  It can support an initial assessment without new report or AI infrastructure.
  It does not provide the integrated Intent experience Terry requested; retain
  it as the fallback and use it in the assessment stories where it is sufficient.
  Its quantitative disadvantage remains unmeasured.
- **Deliver only a test-source browser:** selected as the first useful product
  increment. It improves access to Purpose and remains valuable if the later
  proof and assessment stories are cancelled. It cannot itself establish how
  much intent is protected.
- **Build integrated review incrementally:** recommended. Follow useful source
  reading with story impact and real proof, then test protection and complexity
  judgments on bounded real cases. Add folder-level cost summaries after those
  learning opportunities. A general scoring system is not a prerequisite.

Each story below has one user-visible outcome and its own stopping point.
Navigation, project test-location identification, source reading, evidence
association, and any required support belong within those outcomes rather than
in separate infrastructure stories. Detailed implementation choices remain for
refinement and planning.

## Shared Evidence and Sizing Boundaries

Use the [initial Intent UX/UI direction](../../docs/dashboard-ux-ui-north-star.md#initial-intent-workspace)
and the existing shared dashboard frame. Real repository content and actual
execution evidence supply the views. A source read identifies its revision;
a proof observation identifies the run and scope it actually supports. Missing
or historical observations remain explicit. Browsing a test makes no claim that
it is a good expression of product intent or that the whole product is covered.

[ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
keeps durable project facts in repository records, published progress in origin,
and machine-local observations distinguishable. Existing test-run reporting is
an input to investigate, not an already implemented Intent proof service.
[ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md)
requires worthwhile outcomes relative to a stated baseline, including review
and future maintenance cost.

No project S/M/L definitions were found, consistent with the retained sizing
notes in [SEED-052](SEED-052-start-agent-work-from-dashboard.md#open-decisions-before-refinement-or-planning).
Bands and a numeric effort distribution remain unassigned. The comparative
hypotheses below identify uncertainty and likely scope pressure; they are not
time commitments. Each candidate records decomposition facts only. No execution
approach has been selected.

## Story Decomposition

<a id="browse-test-purpose"></a>

### 1. Browse a project's test source in Intent

**Identity:** SEED-192#browse-test-purpose
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** A developer can find and read the project's maintained test
  source as the initial account of Purpose, without leaving the dashboard.
- **Evaluation:** Given an identified set of test locations for the selected
  project, enter Intent, expand a folder, select a test file, and read its actual
  source with its revision. The tree and reader correspond to that project.
- **Value / learning:** Delivers the first usable Intent perspective and tests
  whether this entry point helps developers locate expressions of behavior.
- **Boundary:** Includes project test-location identification and the usable
  browser in the existing frame. Runtime proof collection and generated intent
  narratives belong to later outcomes. The test-location mechanism is open.
- **Effort hypothesis:** Unbanded; comparatively lower, medium confidence.
  Assumes the existing source-reading and folder-review capabilities can inform
  the work; selecting test locations across projects is the main uncertainty.
- **Product prerequisites:** A readable project and identified test locations.
  No blocking story dependency has been established.
- **Safe stopping point:** A read-only browser remains useful independently.
  Empty, unavailable, or unreadable source must be distinguishable from an empty
  or fully reviewed intent set.

<a id="review-story-intent-impact"></a>

### 2. Review a story's impact on test intent

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

### 3. Read observed proof alongside test purpose

**Identity:** SEED-192#read-observed-test-proof
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** A developer can inspect what actually ran, its observed outcome,
  when it ran, and its execution cost alongside the test source being reviewed.
- **Evaluation:** For source with an applicable real report, select a test file
  and inspect its observed executions, result, validation time, and duration.
  Switch between side-by-side and tabbed Purpose/Proof layouts while preserving
  the selection and story scope. Historical or unmatched evidence is qualified.
- **Value / learning:** Makes the distinction between intended behavior and
  observed proof usable, and supplies the initial directly observable proof cost.
- **Boundary:** Begin with one existing report producer in one real project.
  Open Dough's dashboard proof-record contract is a concrete candidate for
  refinement, not a universal report format. Run tests through existing commands;
  the report reader itself runs no tests. The selected producer must support a
  truthful association with source; missing revision context stays unknown.
- **Effort hypothesis:** Unbanded; comparatively higher, low confidence.
  The existing report records execution but does not itself establish the source
  revision. Evidence association and usable layout switching are the main risks.
- **Product prerequisites:** A real test selection, source, and execution report
  for the chosen case. No blocking story dependency has been established.
- **Safe stopping point:** Selected-file Proof is useful without summaries or
  AI judgment. Passing cases, skipped work, incomplete runs, and missing results
  must retain their actual meanings rather than implying a complete pass.

<a id="assess-story-intent-protection"></a>

### 4. Review how well a story's intent is protected

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

### 5. Review complexity introduced by a story's tests

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

<a id="inspect-hierarchical-proof-cost"></a>

### 6. Find expensive proof in the test hierarchy

**Identity:** SEED-192#inspect-hierarchical-proof-cost
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** A developer can locate where observed proof execution cost is
  concentrated by reviewing folders and their contained tests.
- **Evaluation:** For a real report, inspect a folder's results and timing summary,
  then drill into its tests. Partial selection remains visible. Summed durations
  and run elapsed time retain distinct meanings under concurrent execution.
- **Value / learning:** Makes measured cost navigable so the developer can choose
  where investigation or simplification may be worthwhile.
- **Boundary:** Start with the actual folder hierarchy and one report's available
  observations. A folder summary accounts for its observed children and exposes
  gaps; it cannot establish validation of unobserved tests. Cross-run trends,
  custom semantic groups, and whole-product intent coverage are later questions.
- **Effort hypothesis:** Unbanded; comparatively middle, low-to-medium confidence.
  Aggregation is bounded by a known report, but selection, retries, shared setup,
  and timing attribution must not produce misleading totals.
- **Product prerequisites:** A test hierarchy and actual execution observations
  with identifiable selection and timing semantics. No blocking story dependency
  has been established.
- **Safe stopping point:** Folder summaries support cost investigation on their
  own. High cost is an observation, not a conclusion that proof should be removed
  or that intended behavior is too complex.

## Ordering and Scope Reduction

Queue the six stories above in that order. The backlog was empty when this
preparation began; unrelated dormant candidates remain in their existing seeds.

1. The browser is the usable first increment Terry explicitly described.
2. Story scope brings that browser to the selected near-future question.
3. Real Proof makes the review concrete and exposes cost before judging it.
4. The protection case tests the most consequential uncertainty before richer
   aggregation or generalized AI automation.
5. The complexity case tests the other judgment dimension separately from
   protection and raw execution cost.
6. Folder summaries extend evidence that can already be read for selected tests.

This is a value and learning order, not a dependency chain. The existing editor,
Review changes, and report workflow can support the assessment cases earlier if
that is the cheapest path to useful evidence. Reuse and reconciliation may allow
stories to progress independently; no demonstrated product blocker justifies a
blocking agreement yet. Reassess the order if early use shows that a manual
assessment or cost summary provides greater value sooner.

If scope must shrink, drop folder summaries first, then the separate complexity
case. Retain an early protection assessment before expanding automation; a
source browser and story-impact view remain a safe smaller product if runtime
integration proves too costly. Negative or inconclusive assessment evidence
prompts reconsideration of later automation rather than a forced scoring model.

## Open Decisions Before Refinement or Planning

- Choose the smallest practical mechanism by which each project identifies its
  test locations. This belongs inside the first story's useful browser outcome.
- For the first Proof case, choose the report producer and establish how its
  observations relate to the reviewed source. The existing dashboard report has
  no explicit source revision; absence of that context cannot prove a match.
- Select a real story and a developer's prior review basis for each assessment
  case. Determine what useful decision and review cost would justify keeping the
  method before observing the assessment result.
- Establish project S/M/L calibration before assigning bands. Comparative scope
  assumptions are available above; bands are not necessary to order these
  candidates for refinement.

## When to Surface

Terry requested decomposition and backlog prioritization on 2026-10-30. Review
and refine a selected story before choosing an execution approach. Each later
story remains subject to the learning from earlier delivery and assessment.

## Breadcrumbs

- Terry's 2026-10-30 discussion: the Intent file browser, story scope,
  Purpose/Proof layouts, proof timing and hierarchy, and the longer-term
  three forms of intent expression; followed by acceptance and landing of the
  near-future direction and a request for this decomposition.
- [Product backlog](../PRODUCT-BACKLOG.md).
- [Product intent review memorandum](../../docs/product-intent-review-memorandum.md).
- [Initial Intent UX/UI direction](../../docs/dashboard-ux-ui-north-star.md#initial-intent-workspace).
- [Project visibility requirements](../../docs/project-visibility-requirements.md#product-intent-perspective-the-current-product).
- [Current dashboard behavior](../../dashboard/README.md).
- [Review changes and preparation](../../dashboard/STORY-PREPARATION.md).
- [Existing dashboard proof-record contract](../../dashboard/tests/proof-record.md).
