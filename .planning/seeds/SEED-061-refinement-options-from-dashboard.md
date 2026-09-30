---
id: SEED-061
status: active
planted: 2026-09-30
planted_during: Maintainer discussion of composable story refinement options
trigger_when: A developer wants to select command options when launching story refinement from the dashboard
scope: story
---

# SEED-061: Select refinement options from the dashboard

## Why This Matters

A developer launching story refinement from the dashboard should be able to
discover and select the command's available options without remembering flags
or reproducing them in the optional instruction field. The options offered by
the launch dialog and their execution meaning must stay aligned as refinement
guidance evolves.

Terry requested one cohesive, authoritative definition of a command's options,
consumed by command execution and its selection dialogue. That definition must
express whether options compose or belong to an exclusive selection. The design
should apply generally to command options, while this delivery implements only
the behavior needed to launch refinement.

## Story

<a id="select-refinement-options-from-dashboard"></a>

### Select refinement options when launching from the dashboard

**Identity:** SEED-061#select-refinement-options-from-dashboard
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** A developer can discover, understand, and combine the available
  story refinement options in the dashboard's refinement launch dialogue, and
  start refinement with exactly those choices.
- **Evaluation:** Choose a queued story, open refinement launch, inspect its
  available options and explanations, select a valid combination, and launch.
  The agent receives the selected command options and follows their authoritative
  meaning. Launching without selected options retains straightforward refinement.
- **Scope:**
  - Derive the offered options, their command spelling, explanations, defaults,
    and composition or exclusivity rules from one authoritative command-option
    definition. Agent instructions live there or are referenced from their one
    authoritative behavioral home; do not maintain competing meanings in the
    skill, launch dialogue, and execution path.
  - Use the same definition to interpret and validate selections for execution
    and to provide the dialogue's choices. Group-specific exclusivity must still
    allow composition with compatible options outside that group.
  - Expose the refinement options actually delivered by the related refinement
    work. Current proposed options are `--investigate`, `--challenge`,
    `--explore`, `--borrow`, `--clarify`, `--stress-test`, `--architecture`, and
    `--ux-ui`; their precise instructions and composition semantics belong to
    that work. All eight are currently proposed as composable. Do not create a
    mutually exclusive refinement choice merely to exercise the shared model.
  - Carry selections through the existing launch journey together with the
    selected story and developer instruction. Preserve existing launch and
    failure handling while making invalid option combinations understandable.
  - Keep the solution cohesive around command options. Implement the shared
    representation and consumers needed for refinement, without adding other
    commands, a plugin system, or speculative configuration machinery.
- **Key examples for later refinement:**
  - Available refinement options include Borrow, Explore, and UX/UI focus;
    selecting them launches the same combination as the corresponding direct
    command invocation.
  - No options selected; launching retains the established default refinement
    behavior and the developer's additional instruction.
  - An authoritative option definition changes; the dialogue and execution
    consume the changed definition without a second handwritten option list or
    competing instruction text.
  - A representative command-option definition declares an exclusive group;
    selection and execution apply that same rule while permitting compatible
    options outside the group. Verify this without shipping an unrelated command
    or inventing exclusivity among the proposed refinement options.
- **Architectural concerns:** One representation of option identity, meaning,
  and selection relations; explicit ownership of the authoritative definition;
  consistent consumption by the agent, launch boundary, and dialogue. Resolve
  the representation and delivery location during refinement and planning rather
  than prescribing a new format here. Follow Accepted ADR 0002's single
  representation and current-need principles and ADR 0006's authoritative
  behavioral-home and executing-agent guidance. No conflicting Accepted ADR was
  identified in this capture; Proposed dashboard ADR 0008 is not binding.
- **Boundary:** This story exposes and carries refinement options; it does not
  author or validate the reasoning technique of each option. Other commands,
  persistent selection preferences, and support for additional agent hosts are
  deferred promises. Generality does not require delivering those extensions.
- **Depends on:** A usable refinement-option increment from
  [Discover materially different alternatives during refinement](SEED-057-composable-story-refinement-styles.md#composable-refinement-styles)
  and the established dashboard refinement
  launch. It need not wait for every proposed technique to be delivered. Scripted
  refinement preparation and additional host support are not established as
  prerequisites for this outcome.
- **Value / learning:** Makes refinement choice discoverable at launch and proves
  that one option definition can serve conversational guidance, selection, and
  execution without drift.
- **Effort hypothesis:** Unestimated; authoritative-definition ownership, its
  availability at launch, and shared selection validation need refinement.
- **Capture:** Terry explicitly requested this additional backlog story on
  2026-09-30, including cohesive ownership, composable and exclusive selection
  semantics, and delivery bounded to refinement.

## Open Decisions

- Where should the authoritative definition live and how should the installed
  refinement skill and dashboard obtain the same applicable definition?
- Does combination order carry meaning? The UI and command must preserve the
  semantics selected by the refinement work rather than infer them from control
  order or flag order.
- How should unavailable definitions or options be explained at launch without
  silently dropping the developer's selected intent?

## Breadcrumbs

- [Product backlog](../PRODUCT-BACKLOG.md).
- [Refinement options story](SEED-057-composable-story-refinement-styles.md#composable-refinement-styles).
- [Existing dashboard launch behavior](../../dashboard/AGENT-LAUNCH.md).
- [ADR 0002: Software development lifecycle principles](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md).
- [ADR 0006: Write skills for executing agents](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md).
