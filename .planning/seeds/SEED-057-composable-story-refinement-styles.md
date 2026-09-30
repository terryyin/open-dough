---
id: SEED-057
status: active
planted: 2026-09-30
planted_during: Maintainer request for configurable story refinement styles
trigger_when: A developer wants to choose or combine how story refinement approaches a story
scope: epic
---

# SEED-057: Composable story refinement styles

## Why This Matters

A developer can direct refinement toward the uncertainty that matters,
composing techniques that uncover missing requirements and distinguish
consequential choices. Straightforward refinement remains the default.

The maintainer accepted six actions (`--investigate`, `--challenge`,
`--explore`, `--borrow`, `--clarify`, `--stress-test`) and two independently
composable focuses (`--architecture`, `--ux-ui`). Borrow remains independently
selectable. These options preserve the original critical, exploratory,
straightforward, architecture, and UX/UI concerns: Challenge supplies critical
examination; Explore and Borrow develop possibilities; default refinement
clarifies directly; the two focus options direct the selected actions.

## Alternatives and Decision

The smaller alternative is to add all eight short instructions in one change.
It would expose the vocabulary quickly, but leave little opportunity to learn
whether the instructions cause useful discoveries or merely change the prose.
Terry authorized four scenario-based increments on 2026-09-30, each delivering
one or a few related options with representative behavior review, then refinement
of the first increment. Each delivery remains useful if later options are
deferred. This instruction authorizes decomposition and refinement, not execution.

Keep option meanings and composition facts in one authoritative home, available
to the skill and, when delivered, dashboard launch. Precise representation and
loading are implementation decisions to resolve in planning. Do not author an
independent option vocabulary or duplicate the same instructions for each host.
The separate dashboard story owns its selection dialogue and the shared
consumption needed for that journey; it does not author these techniques.

## Story Decomposition

<a id="composable-refinement-styles"></a>

### 1. Discover materially different alternatives during refinement

**Identity:** SEED-057#composable-refinement-styles
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/180-explore-and-borrow-refinement/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"07b8b72d68286da99657b28435881d7af5c08ee71c97f702b03c22a1b6f21d7d","plan":"ce4c8b831cb1eb87ed04e56189fc8b360f70f88eaf92d36d72f84a3b2c6b5bd4"}}
```

- **Goal:** A developer refining a selected story can use Explore and Borrow,
  independently or together, to discover credible alternatives beyond the first
  proposed solution, compare their contribution to the goal, and converge on
  understood Goal, Scope, and Key examples.
- **Scope:**
  - Recognize `--explore` and `--borrow` in invocation of
    `dough-story-refinement`, independently and in combination. With no options,
    preserve straightforward refinement; necessary baseline inquiry, evidence
    checks, and architectural awareness remain applicable in every mode.
  - Explore develops alternatives that differ in how they achieve the outcome
    or frame the problem. Cosmetic variants alone do not establish this result.
    Include simpler or existing solutions when plausible, and compare relevant
    options against the same goal and genuine constraints.
  - Borrow identifies a mechanism in another domain, explains the correspondence
    between the relevant roles or relationships, adapts the mechanism to this
    story, and identifies a consequential limit of the analogy. Shared labels
    or visual resemblance alone do not establish a useful transfer.
  - With both selected, use transferred mechanisms as candidates within the
    broader exploration and compare them with other plausible alternatives.
    Produce one coherent refinement; separate mandatory passes, duplicated
    outputs, and a combinatorial checklist are not required.
  - Recommend a direction with reasons. Discuss a consequential change to the
    story's goal or scope with the developer; the options do not authorize an
    automatic rewrite of human-owned decisions or implementation.
  - Treat invented alternatives as proposals and uncertain premises as
    hypotheses. Inspect or research a decisive uncertain claim when needed;
    an analogy itself is not evidence that the transferred mechanism will work.
  - If no credible transfer is found, report that limit and continue useful
    refinement. Do not invent an analogy or require the developer to select an
    unsuitable one merely because Borrow was requested.
  - Keep wording concise and actionable, with one authoritative behavioral
    home. Reuse shared refinement responsibilities instead of restating them
    under both options. Introduce only the option-definition and loading support
    needed for this increment, consistent with later dashboard consumption.
- **Composition (planning assumption):** Flags select combined emphases, independent
  of flag order. A developer can explicitly request a sequence in ordinary
  language. Planning proceeds with this stated, reversible choice; it is not
  recorded as a human answer to the earlier question. An explicit instruction
  selecting ordered passes would require realigning the story and plan.
- **Proposed agent instructions for behavior review:**
  - **Explore:** Develop materially different ways to achieve the selected
    story's goal or frame its problem. Compare credible options against the
    goal and genuine constraints, then recommend a direction. Discuss any
    consequential goal or scope change before adopting it.
  - **Borrow:** Find a mechanism in another domain that could help achieve the
    selected story's goal. Explain the correspondence, adapt the mechanism,
    and identify where the analogy breaks. Treat the result as a candidate,
    not evidence that it works; report when no credible transfer is found.
- **Key examples:**
  - A developer proposes a dashboard to help colleagues choose work needing
    attention. Invoking `--explore` yields distinct approaches, such as an
    exception-focused view and guidance at the point of choosing work, compares
    their contribution to that goal, and recommends a direction. Merely listing
    three arrangements of the same dashboard is insufficient.
  - A developer wants convenient choices for directing agent refinement.
    Invoking `--borrow` examines a camera preset's mechanism: a user intention
    selects several related behaviors together. Refinement explicitly maps the
    intention, preset, and behaviors to refinement, derives a candidate option
    approach, and notes a limit: refinement emphases can overlap and evolve
    during conversation, so the camera analogy does not justify exclusivity.
  - For that same story, invoking both options examines intention presets,
    direct action selection, and ordinary-language direction. The borrowed
    candidate receives the same goal-based comparison as the other options;
    the analogy is not automatically favored or treated as validated demand.
  - A supplied constraint fixes the intended user outcome. Exploration reveals
    a possible different outcome; the agent exposes that possibility for a
    human decision and continues supported work without silently expanding
    the selected story.
  - No credible analogy can be explained within the established context;
    Borrow reports the limitation and refinement still clarifies the story.
  - No options are supplied; the existing direct refinement behavior and outputs
    remain available without a mandatory alternatives or analogy exercise.
- **Useful-outcome review:** Walk representative Explore-only, Borrow-only,
  combined, and default uses. Evaluate a substantive alternative, an explicit
  useful mechanism transfer and its limit, fair comparison, preservation of
  human-owned decisions, and convergence. Option announcements or matching
  headings alone are not evidence. Keep unsuccessful or irrelevant candidates
  from becoming required scope; use the trap examples above to challenge wording.
- **Deferred promises:** The other six flags are owned by the sibling stories.
  Dashboard controls, persistent preferences, custom option authoring, and a
  general multi-command option framework are not delivery commitments here.
  These deferrals do not impose rejection rules on naturally supported behavior.
- **Value / learning:** Tests the most distinctive technique and whether concise,
  composable instructions produce better alternatives rather than more text.
- **Effort hypothesis:** Unestimated; useful wording and representative behavior
  evidence are the central uncertainties. Project S/M/L bands were not supplied.
- **Depends on:** No queued product prerequisite identified.
- **Safe stopping point:** Explore and Borrow are independently usable through
  the refinement skill even if the remaining options and dashboard work stop.
- **Slice Plan:** [Explore and Borrow refinement](../slice-plans/180-explore-and-borrow-refinement/PLAN.md).
- **Capture:** The original queued story identity and anchor are retained for
  this first increment. Terry accepted the decomposition on 2026-09-30.

<a id="settle-purpose-scope-and-behavior"></a>

### 2. Settle purpose, scope, and behavior during refinement

**Identity:** SEED-057#settle-purpose-scope-and-behavior
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** A developer can select `--challenge` and `--clarify` to examine
  whether the proposed capability achieves its purpose and settle the smallest
  sufficient scope with unambiguous observable behavior.
- **Evaluation:** An oversized story with competing interpretations is refined
  into a sufficient user outcome and concrete examples that distinguish the
  interpretations, without trimming away essential value or manufacturing
  rejection constraints from a limited example set.
- **Boundary:** Owns these two techniques and their combinations with delivered
  options; preserves straightforward default refinement. It does not require
  delivering investigation, stress testing, or either focus option.
- **Value / learning:** Makes critical refinement useful while testing whether
  concrete examples resolve consequential uncertainty rather than add ceremony.
- **Effort hypothesis:** Unestimated; scope sufficiency and ambiguous behavior
  need representative examples during this story's refinement.
- **Depends on:** The first increment's established option selection and shared
  composition behavior; no dependency on stories 3 or 4.
- **Safe stopping point:** Purpose, sufficient scope, and observable behavior
  can be clarified with these options independently of later increments.

<a id="resolve-uncertainty-and-expose-failure"></a>

### 3. Resolve uncertainty and expose failure during refinement

**Identity:** SEED-057#resolve-uncertainty-and-expose-failure
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** A developer can select `--investigate` and `--stress-test` to
  ground refinement in evidence and discover consequential failure, conflict,
  and recovery requirements.
- **Evaluation:** A story rests on an unsupported assumption and a plausible
  failed-outcome scenario. Refinement separates known facts from hypotheses,
  identifies a useful way to resolve the uncertainty, and exposes behavior or
  recovery that changes the promised outcome without inventing research results.
- **Boundary:** Owns these two techniques and their combinations with delivered
  options. Consequential conflicting expectations remain human-owned decisions;
  exhaustive threat catalogues and automatic scope expansion are not promised.
- **Value / learning:** Tests whether evidence gathering and failure reasoning
  resolve material uncertainties without speculative requirements growth.
- **Effort hypothesis:** Unestimated; bound the evidence and failure scenarios
  during refinement before deciding proof and delivery breadth.
- **Depends on:** The first increment's option selection and shared composition
  behavior; story 2 is an ordering preference, not a product prerequisite.
- **Safe stopping point:** Evidence and recovery concerns are examinable without
  either focus option or dashboard support.

<a id="shape-interaction-within-system-constraints"></a>

### 4. Shape an interaction within system constraints during refinement

**Identity:** SEED-057#shape-interaction-within-system-constraints
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** A developer can select `--ux-ui` and `--architecture`, separately
  or together, to focus refinement on user experience and consequential system
  responsibilities, qualities, and decisions.
- **Evaluation:** A user journey exposes an interaction choice with architectural
  consequences. UX/UI focus clarifies the interaction; architecture focus makes
  its system implications and relevant decisions explicit; their combination
  frames the trade-off coherently for the developer.
- **Boundary:** Focus options apply to selected actions and to default refinement;
  they do not mandate upfront detailed design. Architecture focus must surface
  and stop an actual Accepted-ADR conflict rather than authorize an exception.
  Detailed expectations for each focus and their combination await refinement.
- **Value / learning:** Preserves the original design emphases and tests that
  a focus changes what is examined without duplicating the action techniques.
- **Effort hypothesis:** Unestimated; select one cohesive journey for the joint
  case and representative individual-focus cases during refinement.
- **Depends on:** The first increment's option selection and shared composition
  behavior; no required completion of stories 2 or 3.
- **Safe stopping point:** The delivered focuses remain usable with default
  refinement and any delivered actions if other techniques are deferred.

## Ordering and Scope Reduction

Queue the four increments in the order above, followed by the separately captured
[dashboard launch story](SEED-061-refinement-options-from-dashboard.md#select-refinement-options-from-dashboard).
The order prioritizes the distinctive Borrow technique, then purpose and behavior,
then evidence and failure, then the cross-cutting focuses. It is not a mandatory
dependency chain. Dashboard selection needs a usable first increment and can be
reprioritized earlier without waiting for all eight flags.

The first increment includes only its necessary selection and composition
support, never a standalone technical preparation story. Reassess later wording
and examples using actual learning from each delivery. Defer later techniques
or dashboard exposure before abandoning a useful independently delivered option.

## Architectural Constraints

Follow Accepted ADR 0002's single-representation and current-need principles,
ADR 0006's authoritative behavioral home and executing-agent audience, and the
maintainer behavior-review guidance in [AGENTS.md](../../AGENTS.md). Shared
option definitions should serve the skill and later launch consumers without
handwritten competing semantics. No new ADR or specific representation is
selected by this decomposition. Conventional guidance changes use representative
behavior review; installation or host expansion has its own proof scope.

## Breadcrumbs

- [Story refinement skill source](../../src/skills/dough-story-refinement/SKILL.md).
- [Product backlog](../PRODUCT-BACKLOG.md).
- [Dashboard option selection](SEED-061-refinement-options-from-dashboard.md#select-refinement-options-from-dashboard).
- [ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md).
- [ADR 0006](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md).
