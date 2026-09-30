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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/185-select-refinement-options-from-dashboard/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"34ae170875f2dac6649791039a464eb5f911d13b8fa5ab8b890c75b4343573b2","plan":"45587e7095244b2730f56db8e784bec681d1fdbc1d2db355fe350b0430fedc63"}}
```

- **For / why:** A developer can discover, understand, and combine the available
  story refinement options in the dashboard's refinement launch dialogue, and
  start refinement with exactly those choices.
- **Evaluation:** Choose a queued story, open refinement launch, inspect its
  available options and explanations, select a valid combination, and launch.
  The agent receives the selected command options and follows their authoritative
  meaning. Launching without selected options retains straightforward refinement.
- **Goal:** A developer starting refinement from a backlog card chooses among
  the options the target project's refinement skill actually offers, and the
  session starts as if they had typed the same options on the command. The
  developer's discovery of options no longer depends on remembering flags.
- **Scope:**
  - The launch dialogue offers one choice per option in the target project's
    installed `dough-story-refinement` option definition
    (`references/refinement-options.json`), showing its label and explanation
    and spelled as its command flag. The dashboard reads that file from the
    project's installed skill, as it already does to decide whether a project
    establishes a start, so the choices always match the skill that will run.
  - Options compose by default. The definition also lets an option group be
    exclusive; selection, validation, and execution honor the group while
    leaving compatible options outside it composable. Selection order carries
    no meaning.
  - The launch request carries the selected flags with the story and developer
    instruction. The session's instruction is `/dough-story-refinement
    <identity> <flags>`, then the developer's instruction as before. With no
    selection, it is exactly today's launch. The skill's own interpretation of
    the flags is unchanged and lives only in the definition.
  - The boundary validates the request against the same installed definition
    before any `claude` runs. An unknown flag, an option the project's skill
    lacks, or a violated exclusive group refuses the launch with an explanation
    naming the option; nothing is dropped silently. A project whose installed
    skill has no definition offers no options and launches default refinement
    with a note saying why.
  - Executable proof of exclusivity uses a test definition that declares a
    group; no refinement option is made exclusive to exercise it.
  - Deferred: other commands (execution, Start session), remembered
    selections, other hosts, and the reasoning techniques of the options.
- **Key examples:**
  - Backlog card, project definition offers Explore and Borrow → developer
    selects both and Start → session instruction `/dough-story-refinement
    <identity> --explore --borrow` plus the typed instruction.
  - Nothing selected → launch identical to today's, instruction unchanged.
  - The definition changes (an option added) → dialogue and boundary offer and
    accept it with no dashboard code change.
  - Test definition with group {A, B} exclusive and C outside it → A+C valid;
    A+B refused with the group named, in dialogue and at the boundary.
  - Request names `--architecture` but the project's installed definition
    lacks it → refused before launch, option named.
  - Project has no installed definition → no option choices, note shown,
    default refinement launches.
- **UI:** Options group between the instruction field and Model, one checkbox
  per option with flag and one-line summary, a live command line, radios for an
  exclusive group. Sketch and states in the
  [UX/UI North Star](../../docs/dashboard-ux-ui-north-star.md#refinement-options-in-the-launch-dialog).
- **Architecture:** One command option definition owned by the skill, one shared
  pure model (schema, selection problems, canonical order) used by boundary and
  dialogue, installed-skill reading in one server place, and the agent unchanged.
  Domain vocabulary, responsibilities, and rules in the
  [Architectural North Star](../NORTH-STAR.md#command-options-one-definition-three-consumers).
  Follows Accepted ADR 0002 and ADR 0006; no conflicting Accepted ADR and no
  new ADR (dashboard and one skill file only); Proposed ADR 0008 is not binding.
- **Boundary:** This story exposes and carries refinement options; it does not
  author or validate the reasoning technique of each option. Other commands,
  persistent selection preferences, and support for additional agent hosts are
  deferred promises. Generality does not require delivering those extensions.
- **Depends on:** The delivered refinement-option increment (Explore and Borrow,
  defined in
  [refinement-options.json](../../src/skills/dough-story-refinement/references/refinement-options.json))
  and the established dashboard refinement
  launch. It need not wait for every proposed technique to be delivered. Scripted
  refinement preparation and additional host support are not established as
  prerequisites for this outcome.
- **Value / learning:** Makes refinement choice discoverable at launch and proves
  that one option definition can serve conversational guidance, selection, and
  execution without drift.
- **Effort hypothesis:** Moderate; installed-definition reading, shared selection
  validation, and the dialogue choices are the new work.
- **Capture:** Terry explicitly requested this additional backlog story on
  2026-09-30, including cohesive ownership, composable and exclusive selection
  semantics, and delivery bounded to refinement.

## Open Decisions

- Every option needs a `summary` for the dialogue, checked by a drift test on the
  shipped definition, so an option delivered by another story without one fails
  that check. Recommended: required. The alternative, a dialogue that tolerates a
  missing summary, would show options nobody explained.
- The proposed `--architecture` and `--ux-ui` options (a separate `focuses`
  list) are offered as soon as the definition contains them; this story neither
  waits for nor adds them.

## Breadcrumbs

- [Product backlog](../PRODUCT-BACKLOG.md).
- [Refinement options definition](../../src/skills/dough-story-refinement/references/refinement-options.json).
- [Existing dashboard launch behavior](../../dashboard/AGENT-LAUNCH.md).
- [ADR 0002: Software development lifecycle principles](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md).
- [ADR 0006: Write skills for executing agents](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md).
