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
