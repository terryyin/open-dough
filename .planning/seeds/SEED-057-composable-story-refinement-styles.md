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

<a id="settle-purpose-scope-and-behavior"></a>

### 2. Settle purpose, scope, and behavior during refinement

**Identity:** SEED-057#settle-purpose-scope-and-behavior
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/182-challenge-and-clarify-refinement/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"36d101b2ee2daa6c9203ebd28adf88449a36d174ef85d4ba1cc7465fa0cf9435","plan":"8c33c8a5b0889db81e6d2b3e7c5691dde489a1a65e32d711124b46e971728ea6"}}
```

- **Goal:** A developer refining a selected story can use Challenge and Clarify,
  independently or together, to test whether the proposed capability achieves its
  purpose, then settle the smallest sufficient scope with observable behavior
  that distinguishes competing interpretations.
- **Scope:**
  - Recognize `--challenge` and `--clarify` in invocation of
    `dough-story-refinement`, alone, together, and with the delivered `--explore`
    and `--borrow`. Options keep the single authoritative definition and
    composition rules already delivered, and no option changes default
    refinement.
  - Challenge examines whether the story's proposed capability would achieve its
    stated purpose: the assumptions the purpose rests on, whether the proposal
    is the capability or merely one way to reach it, and how it could satisfy
    its wording yet miss the purpose. It reports the strongest consequential
    doubt with its reason. Objections that change nothing about the promised
    outcome are not reported.
  - Clarify settles the smallest scope that still delivers the purpose. It
    separates required behavior from deferred promises and from genuinely
    justified rejection constraints, and states behavior in concrete
    pre-condition → trigger → result examples chosen to distinguish competing
    interpretations. A behavior that would need an unrecorded independent
    requirement to reject is left naturally supported and recorded as an open
    decision, never as a rejection.
  - With both selected, Challenge's doubts feed Clarify's scope decision within
    one refinement. Challenge alone does not shrink scope, and Clarify never
    trims value the challenged purpose needs. When they disagree, expose the
    trade-off for the developer's decision.
  - With `--explore` or `--borrow`, challenge and clarify the recommended
    direction as well as the original proposal; they do not add an alternatives
    or analogy pass.
  - The two options change the goal, scope, or examples only through discussion
    with the developer. A challenge is a proposal, not a decision, and does not
    authorize an automatic rewrite or a story split.
  - If the purpose survives the challenge, say so and continue useful
    refinement; do not invent doubt. If the story is already unambiguous and
    minimal, report that and change nothing.
  - Keep wording concise and actionable. Add only these two entries to the one
    authoritative options definition; restate no shared refinement
    responsibility under either entry.
- **Proposed agent instructions for behavior review:**
  - **Challenge:** Test whether the proposed capability achieves the selected
    story's stated purpose. Name the assumptions it rests on and how it could
    meet its own wording yet miss the purpose. Report the strongest consequential
    doubt with its reason; do not object without consequence or invent doubt when
    the purpose holds. A challenge is a proposal: discuss any change to goal or
    scope with the developer.
  - **Clarify:** Settle the smallest scope that still delivers the purpose, using
    concrete pre-condition → trigger → result examples that distinguish competing
    interpretations. Separate required behavior, deferred promises, and
    rejection constraints; justify a rejection by an independent requirement or
    record the decision as open. Do not trim value the purpose needs.
- **Key examples:**
  - A story says "let developers manage agent sessions from the dashboard".
    Invoking `--clarify` distinguishes interpretations, such as viewing,
    starting, and stopping sessions. Examples show one or two of these
    situations and the result each interpretation implies. The developer decides
    which interpretation this story owns, and the others become deferred
    promises, not rejections.
  - For the same story, `--challenge` finds that developers only need to notice
    sessions awaiting them; an implementation that supports full management
    could pass its wording yet not reduce missed sessions. The doubt and its
    consequence are reported, and the developer decides whether to narrow the
    purpose.
  - Both options together on that story: the challenge identifies the
    consequential purpose, and clarification records the smallest scope that
    serves it with examples that would fail an implementation missing the
    purpose. Nothing needed by the purpose is dropped for being small.
  - A story lists three examples, and its rule naturally handles a fourth.
    Clarification does not turn the missing fourth case into a rejection
    constraint; it records the open question only if the developer's intent
    matters.
  - Challenge finds the purpose sound. It says so briefly, and refinement
    continues without manufactured objections.
  - With `--explore` selected as well, the chosen alternative receives the same
    challenge and clarification as the original proposal.
  - No options supplied: existing straightforward refinement remains, without a
    mandatory challenge or clarification exercise.
- **Useful-outcome review:** Walk representative Challenge-only, Clarify-only,
  combined, combined-with-Explore, and default uses on an oversized story with
  competing interpretations. Evaluate a consequential doubt tied to the purpose,
  a smaller sufficient scope with no lost essential value, examples that
  distinguish the interpretations, unmanufactured rejection constraints, and
  human ownership of scope decisions. Option announcements or headings alone are
  not evidence; use the traps above to challenge wording. Confirm that the
  options definition still has one authoritative home.
- **Deferred promises:** Investigation, stress testing, and both focus options
  belong to sibling stories. Dashboard controls, persistent preferences, and
  custom option authoring are not delivery commitments here. These deferrals add
  no rejection rules and leave naturally supported behavior intact.
- **Value / learning:** Makes critical refinement useful while testing whether
  concrete examples resolve consequential uncertainty rather than add ceremony.
- **Effort hypothesis:** Unestimated. It follows the delivered options definition
  shape, so the uncertainty is wording that yields consequential doubts and
  distinguishing examples rather than more text; representative behavior review
  will show which.
- **Depends on:** The delivered options definition and composition behavior from
  the first increment; no dependency on stories 3 or 4.
- **Safe stopping point:** Purpose, sufficient scope, and observable behavior can
  be examined with these options independently of later increments.

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
