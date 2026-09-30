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

<a id="shape-interaction-within-system-constraints"></a>

### 4. Shape an interaction within system constraints during refinement

**Identity:** SEED-057#shape-interaction-within-system-constraints
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/184-ux-ui-and-architecture-focus-refinement/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"90c0251c06422defa1f1ac139d080f33aa9f4f93d7d3e66174a1735501d9ce62","plan":"472710a084292415ab83037fcb7d70b186f5f10a3e5af49cf99eff24200ea548"}}
```

- **Goal:** A developer refining a selected story can use `--ux-ui` and
  `--architecture`, separately or together, to direct refinement toward what the
  user experiences and toward the system responsibilities, qualities, and
  Accepted decisions that experience depends on, so an interaction choice and
  its architectural consequences are understood together before planning.
- **Scope:**
  - Recognize `--ux-ui` and `--architecture` in invocation of
    `dough-story-refinement`, alone, together, with default refinement when no
    action is selected, and with each delivered action. Options keep the single
    authoritative definition and composition rules already delivered; the two
    focuses are added there, and no option changes default refinement.
  - A focus changes what refinement examines, not which technique it applies.
    With actions selected, the focus is the lens the actions use: alternatives
    are compared, doubts raised, examples written, hypotheses observed, and
    failures examined for that concern. A focus adds no pass or output of its
    own, and each entry restates no action technique or shared responsibility.
  - UX/UI focus examines the story from the user's side: the task and context,
    what the user sees and decides at each step, the feedback and recovery
    available, and where the interaction could confuse, block, or exclude the
    user. It reports the interaction choices that change what the story
    promises. It describes or sketches the interaction only where the developer
    and agent need agreement, as default refinement already does.
  - Architecture focus examines what the story adds or moves in system
    responsibilities, the qualities it depends on, and the Accepted decisions
    that apply, citing them through
    [dough-adr-awareness](../../src/skills/dough-adr-awareness/SKILL.md).
    It reports the consequences that change what the story can promise or how
    choices compare. It records an **Architecture** section only for a
    consequential concern, as design in the seed, not as an ADR proposal. A
    Proposed ADR informs the discussion but binds nothing. If required ADR
    context is unavailable, it names what is missing and stops that
    examination, and other refinement continues.
  - An actual conflict with an Accepted ADR is surfaced with the ADR and the
    conflicting element, and that path stops. The developer decides; the
    refinement never treats the conflict as authorization for an exception, and
    supported work continues.
  - With both focuses, each interaction choice is presented with its system
    consequences as one trade-off for the developer's decision, not as separate
    interface and architecture reports. Neither focus wins by default. A
    consequence that conflicts with an Accepted ADR stops as above, however
    attractive the interaction.
  - Neither focus mandates upfront detailed design. Screens, component design,
    and technology choices appear only when agreeing on a choice requires them.
    A focus that finds nothing consequential says so briefly and continues: a
    story without a user-facing interaction gets no invented UI, and one with
    no consequential architectural concern gets no invented section.
  - The focuses change the goal, scope, or examples only through discussion
    with the developer. A finding is a proposal, not a decision, and does not
    authorize an automatic rewrite, a story split, or a scope expansion.
  - When a focus needs input only the developer can supply, such as who the
    user is or which decision applies, and it was not given with the request,
    stop that examination and ask; do not assume it. Other refinement continues.
  - The result must not depend on delivery order. The two focus entries and the
    composition rule are written so that, whether they arrive before or after
    the other actions, the one authoritative options definition holds no
    duplicated, overlapping, or contradictory wording. The composition rule
    names no specific action, so it holds for whichever actions exist. How a
    focus is distinguished from an action there is a planning decision; a
    consumer must be able to tell that a focus composes with any action or none.
  - Keep wording concise and actionable. Add only these two entries and the one
    composition rule to the one authoritative options definition.
- **Proposed agent instructions for behavior review:**
  - **UX/UI:** Examine the selected story from the user's side: the task and
    context, what the user sees and decides at each step, the feedback and
    recovery available, and where the interaction could confuse, block, or
    exclude. Report interaction choices that would change what the story
    promises. Describe or sketch the interaction only where agreement needs it.
    If no interaction choice matters, say so.
  - **Architecture:** Examine what the story adds or moves in system
    responsibilities, the qualities it depends on, and the Accepted decisions
    that apply, citing them. Report consequences that change what the story can
    promise or how choices compare. Surface an actual Accepted-ADR conflict, stop
    that path, and leave the decision to the developer; never treat it as
    authorization for an exception. Record detail only for a consequential
    concern. If there is none, say so.
  - **Composition (in the options definition):** A focus selects what the
    selected actions, or default refinement when none, examine; it adds no pass.
    With both focuses, present each interaction choice with its system
    consequences as one trade-off for the developer's decision.
- **Key examples:**
  - The dashboard's refinement launch dialogue lets a developer choose from
    eight options. `--ux-ui` alone on that story examines the developer's path
    from opening the dialogue to launching: discovering what each option does,
    combining several, and seeing what will be sent. It reports one choice that
    changes the promise, such as a flat list versus options grouped as actions
    and focuses, and describes the dialogue only enough to agree on it. It draws
    no layout and picks no component library.
  - `--architecture` alone on the same story finds that the dialogue and the
    launched command must read the same option definition, and cites Accepted
    ADR 0002's single-representation principle. If the story proposed a
    dialogue-owned list of option labels for speed, the refinement names that
    as a conflict, stops that path, and leaves the decision to the developer
    without offering an exception. Proposed ADR 0008 is discussed, not treated
    as a conflict.
  - Both focuses on that story: presets that bundle options are simpler for the
    user than individual choices, but require the shared definition to carry a
    bundle concept that no current option needs. The developer sees this as one
    trade-off, with each side's user effect and system consequence, and decides;
    neither focus is favored.
  - `--architecture` with `--explore`: the compared alternatives differ in where
    responsibility sits, and each is judged on responsibilities and the
    Accepted decisions that apply. No separate architecture pass follows.
  - `--ux-ui` with `--clarify`: the examples state what the user sees and does
    at each step, and distinguish competing interpretations of the interaction.
  - `--architecture` without any action: straightforward refinement of Goal,
    Scope, and Key examples, with the architectural examination included.
  - `--ux-ui` on a story that changes only a script with no user-facing
    interaction says so briefly and refines the rest; no UI section is added.
  - `--architecture` on a story with no consequential concern names the ADRs it
    checked and records no Architecture section. Where the project's ADR context
    cannot be resolved, it names what is missing, stops the architecture
    examination, and does not claim the check completed.
  - `--ux-ui` on a story whose user is not identified and not supplied with the
    request: the examination stops and asks who the user is rather than
    assuming one; the rest of refinement continues.
  - Story 3's options and this story's focuses are delivered in either order:
    the definition ends with the same entries and no duplicated or conflicting
    composition wording.
  - No options supplied: existing straightforward refinement remains, adding a
    UI or Architecture section only when default refinement would.
- **Useful-outcome review:** Walk representative UX/UI-only, Architecture-only,
  combined, focus-with-action, focus-without-action, and default uses on a story
  with a user journey whose interaction choice has architectural consequences
  and one plausible Accepted-ADR conflict. Evaluate an interaction understood
  from the user's side, consequences tied to cited decisions, one coherent
  trade-off for the combination, a conflict surfaced and stopped without an
  exception, no invented UI or architecture, no upfront detailed design, no
  duplicated action technique, and identical results in either delivery order
  with story 3. Option announcements or headings alone are not
  evidence; use the traps above to challenge wording. Confirm that the options
  definition still has one authoritative home.
- **Deferred promises:** Detailed design guidance for each focus (visual and
  interaction design, audits, technology selection) and ADR drafting or
  exceptions are deferred; this delivery is complete and usable without them.
  Dashboard controls, persistent preferences, and custom option authoring are
  not commitments here. These deferrals add no rejection rules and leave
  naturally supported behavior intact.
- **Value / learning:** Preserves the original design emphases and tests that
  a focus changes what is examined without duplicating the action techniques.
- **Effort hypothesis:** Unestimated. It follows the delivered options
  definition shape, and default refinement already covers UI and Architecture
  detail, so the uncertainty is wording that changes what is examined without
  adding a pass, and how the definition marks a focus; representative behavior
  review will show which.
- **Depends on:** The delivered options definition and composition behavior from
  the first increment. Stories 2 and 3 are not prerequisites; a focus composes
  with whichever actions are delivered. Story 3 edits the same definition;
  overlapping stories are acceptable provided the resulting definition is the
  same in either delivery order.
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
