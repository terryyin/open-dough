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

<a id="resolve-uncertainty-and-expose-failure"></a>

### 3. Resolve uncertainty and expose failure during refinement

**Identity:** SEED-057#resolve-uncertainty-and-expose-failure
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/183-investigate-and-stress-test-refinement/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"e51d5099caaa8afaea465f7f57a6527a9d651fc4c94680d3205deedf54aa9d18","plan":"b49fd2a4eff93375e5ab1202e6de1fa53a70610a92f46f24e4e94aa370473b0d"}}
```

- **Goal:** A developer refining a selected story can use Investigate and
  Stress-test, independently or together, to separate what is known from what is
  assumed and to learn which failure, conflict, or recovery behavior would change
  the promised outcome, so the story's scope rests on evidence and examined
  failure rather than on unchecked premises.
- **Scope:**
  - Recognize `--investigate` and `--stress-test` in invocation of
    `dough-story-refinement`, alone, together, and with the delivered
    `--explore`, `--borrow`, `--challenge`, and `--clarify`. Options keep the
    single authoritative definition and composition rules already delivered, and
    no option changes default refinement.
  - Investigate separates what the story's goal and scope rest on into known
    facts, each with its source, and hypotheses. For each hypothesis that
    materially affects the outcome, it names the cheapest way to resolve it,
    and performs a safe, local, unpaid observation itself when one is available
    instead of asking the developer. It reports what was observed, what remains
    a hypothesis, and what the result changes. A hypothesis no available
    observation can settle is reported as such and left as an open decision.
    Findings are reported only as observed; a result that was not obtained is
    never supplied from plausibility.
  - Stress-test examines the story's recorded behavior under plausible failure:
    a dependency or input that is unavailable, stale, or malformed; an
    interrupted or repeated operation; concurrent or conflicting actors or
    expectations; and what a user or operator can do to recover. It reports the
    scenarios whose outcome would change what the story promises, each with the
    behavior or recovery it implies, in concrete pre-condition → trigger →
    result form. A scenario whose handling changes nothing about the promise is
    not reported.
  - Conflicting expectations that Stress-test exposes are shown as a trade-off
    for the developer's decision; the refinement does not pick a winner. A
    failure behavior becomes required scope only when the developer accepts it,
    or when the story's own purpose cannot be met without it; otherwise it is a
    deferred promise or an open decision, never an automatic addition. Naturally
    supported failure behavior is left alone and never becomes a rejection.
  - With both selected, Investigate's hypotheses are the assumptions Stress-test
    examines, and a failure scenario whose plausibility is itself a hypothesis
    is investigated before it is relied on, within one refinement.
  - With `--challenge` or `--clarify`, use their results as inputs: a challenged
    purpose sets which failures matter, and clarified examples are the behavior
    that is stress-tested. With `--explore` or `--borrow`, investigate and
    stress-test the recommended direction as well as the original proposal; they
    do not add an alternatives or analogy pass.
  - The two options change the goal, scope, or examples only through discussion
    with the developer. A finding is a proposal, not a decision, and does not
    authorize an automatic rewrite, a story split, or a scope expansion.
  - If the story rests on verified facts and its failure handling does not
    change the promise, say so and continue useful refinement; do not invent
    doubt or scenarios.
  - Keep wording concise and actionable. Add only these two entries to the one
    authoritative options definition; restate no shared refinement
    responsibility under either entry, including the baseline evidence check and
    human ownership of goal and scope that already apply in every mode.
- **Proposed agent instructions for behavior review:**
  - **Investigate:** Separate the facts the selected story's goal and scope rest
    on, with their sources, from hypotheses. For each hypothesis that could change
    the outcome, name the cheapest way to settle it and make a safe, local,
    unpaid observation yourself when one exists. Report what was observed and
    what remains a hypothesis; never supply a result you did not obtain. Leave a
    premise no available observation can settle as an open decision for the
    developer.
  - **Stress-test:** Examine the story's behavior when an input or dependency is
    unavailable, stale, or malformed, an operation is interrupted or repeated,
    actors or expectations conflict, and a user must recover. Report only
    scenarios that would change what the story promises, each as a concrete
    pre-condition → trigger → result. Expose conflicting expectations for the
    developer's decision. Add a failure behavior to scope only with the
    developer's agreement or when the purpose cannot be met without it;
    otherwise record it as deferred or open.
- **Key examples:**
  - A story says "show the sessions awaiting the developer on the dashboard",
    assuming the agent host reports a waiting state. `--investigate` checks what
    the session records the project actually holds can show, and reports, say,
    that a waiting state is observable for one host and unobserved for another.
    The story is narrowed or the gap is left open by the developer's decision;
    no claim about the unobserved host is written as fact.
  - Investigate reaches a hypothesis it cannot observe locally or safely, such as
    behavior that needs a paid run. It names what observation would settle it and
    leaves it as an open decision instead of answering it by plausibility.
  - For the same story, `--stress-test` asks what the dashboard shows when a
    session record is stale, when a session ends between two refreshes, and when
    two developers respond to the same waiting session. The last two change the
    promise, so they become examples or deferred promises the developer chooses
    between. A malformed record that the natural rule already skips is left alone.
  - Stress-test exposes that two stakeholders want opposite results for a
    repeated action. It shows both expectations and the consequence of each, and
    the developer chooses; the refinement records neither as settled.
  - Both options together: a plausibility-dependent failure, such as "the host
    stops reporting after a crash", is first investigated; only if it is
    observable does its recovery behavior become an example.
  - A story rests on verified facts and its failures change nothing it promises.
    Refinement says so briefly and continues, without manufactured scenarios.
  - With `--challenge` and `--clarify` selected as well, the recommended scope's
    examples receive the same investigation and stress test as the original.
  - No options supplied: existing straightforward refinement remains, without a
    mandatory investigation or stress test.
- **Useful-outcome review:** Walk representative Investigate-only,
  Stress-test-only, combined, combined-with-Clarify, and default uses on a story
  that rests on an unsupported assumption and has a plausible failed outcome.
  Evaluate a hypothesis separated from facts and settled by a real observation
  where one was available, no invented result where none was, failure scenarios
  that change the promise rather than a generic catalogue, conflicts left to the
  developer, and no scope added without agreement. Option announcements or
  headings alone are not evidence; use the traps above to challenge wording.
  Confirm that the options definition still has one authoritative home.
- **Deferred promises:** Both focus options belong to the sibling story.
  Exhaustive threat or failure catalogues, automatic scope expansion, automated
  research or fact-checking outside the project, dashboard controls, persistent
  preferences, and custom option authoring are not delivery commitments here.
  These deferrals add no rejection rules and leave naturally supported behavior
  intact.
- **Value / learning:** Tests whether evidence gathering and failure reasoning
  resolve material uncertainties without speculative requirements growth.
- **Effort hypothesis:** Unestimated. It follows the delivered options
  definition shape, so the uncertainty is wording that yields real observations
  and promise-changing scenarios rather than a broad catalogue; representative
  behavior review will show which.
- **Depends on:** The delivered options definition and composition behavior from
  the first increment; story 2's Challenge and Clarify are inputs when selected,
  not a prerequisite, so order is a preference and this story delivers without
  them.
- **Safe stopping point:** Evidence and recovery concerns are examinable with
  these options independently of the focus options, the dashboard, and any other
  increment.

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
