---
id: SEED-004
status: dormant
planted: 2026-09-06
planted_during: Parallel exploration of extracting existing project guidance
trigger_when: Adopt proven project practices as public Open Dough guidance
scope: large
---

# SEED-004: Extract and adopt reusable project guidance

## Why This Matters

For Open Dough maintainers and adopting developers, useful skills and rules
maintained separately in individual projects should become shared guidance
that projects can adopt without losing effective local behavior or keeping
redundant instructions.

The owner wants an internal skill that learns a supplied skill or rule from an
existing project, removes project-specific assumptions, and produces a public
Open Dough equivalent. It must evaluate whether the shared version remains
effective when substituted for the original and address gaps in generalization.
Installation and updates should then recognize overlapping local guidance,
suggest replacement, and carry out a clean replacement when authorized.

**Matching is based on characteristics, not source-project identity.** Donut is
only an example. A different project may have matching guidance with a different
name or path, even if it never used the original source. It should receive the
same assessment and replacement opportunity. Original names and paths are useful
clues, not required matches or sufficient proof of equivalence.

## Decisions and Constraints

- The extraction skill is internal to Open Dough. Its results are public skills
  or rules; public skill names use `dough-`. Public rule naming remains undecided.
- Retain distinguishing characteristics of the guidance, including useful name
  and path clues, its purpose, triggering situations, and expected behavior.
  Remember enough to recognize equivalent guidance elsewhere. Source provenance
  may be useful context but must not gate matching.
- Remove project-specific information from public guidance while preserving a
  way to provide context that its behavior actually needs. A generalized version
  is not an effective replacement merely because names and paths were removed.
- A potential match invites evaluation. Suggest replacement only when the shared
  guidance covers the local behavior, or explain the remaining gap. Similar names
  alone do not justify removal; neither does common provenance.
- Replacement includes cleaning up obsolete references and preserving useful
  project-specific behavior. Resolve conflicts where possible and stop with an
  explanation when something cannot be resolved.
- Initial installation evaluates existing rules, skills, and agent instructions
  as well as updates. Preserve unrelated instructions in shared documents.
- Work in Codex, Cursor, and Claude Code with one shared behavioral source and
  minimal platform adaptation. The internal skill and repository acceptance guard
  must not become part of the public installation.
- Story 1 is complete with a linked evidence plan. Other stories remain
  unfinished. Reordering the backlog authorizes no extraction, installation,
  or removal of another project's files in this pass.
- First finish shared installation, release ADR-awareness, and use it in Open
  Dough through the same installation path as any other project. Then adopt it
  in Donut and replace the proven redundant original. More extraction follows. Preserve safe installation and cross-platform acceptance; defer special
  migration and difference reconciliation until a real case needs them.

## Alternatives and Working Direction

| Option | Assessment |
| --- | --- |
| Defer | Keeps practices local and leaves developers to recognize and reconcile overlap themselves. |
| Generalize one supplied item first | Recommended first outcome: prove useful reuse before adding automatic migration to installation and updates. |
| Manually copy, rename, and reconcile guidance | A practical fallback for one item, but does not provide the requested repeatable internal skill or recognition and replacement across adopting projects. |
| Deliver extraction and all migration behavior together | Matches the overall ambition but delays learning whether generalization preserves effectiveness. |

The owner confirmed the overall direction and cross-project matching, then
reprioritized on 2026-09-06 around repeated borrowing from Donut, then selected
ADR-awareness adoption and replacement as the next priority. The latest order
first completes shared installation, publication, and Open Dough self-use under
SEED-001. Story 1 already proved extraction; Story 4 then closes Donut's adoption
loop before Stories 6–7 extract more commonly borrowed planning skills. Story 5 retains the more complex CI-monitor extraction
for later. Borrowing source guidance is an immediate bridge, but only extraction,
distribution, and native reuse remove the recurring sibling-project dependency.

Local story numbers are stable references, not priority. The
[product backlog](../PRODUCT-BACKLOG.md) records the current cross-seed order.

## Story Decomposition

<a id="generalize-project-guidance"></a>

### 1. Turn a supplied project practice into usable public guidance

- **Status:** Completed 2026-09-06. The
  [slice plan](../quick/007-generalize-project-guidance/PLAN.md) records all native
  extraction, equivalence, installation, update, fresh-use, and coexistence evidence.
- **For / why:** The Open Dough maintainer wants to share a proven practice
  without making every adopter inherit the source project's assumptions.
- **Evaluation:** Use the internal skill on a supplied item, inspect the public
  result, and demonstrate equivalent behavior in the source context and useful
  behavior in another project context.
- **Value / learning:** A reusable practice remains valuable even if migration
  automation is never built; tests whether generalization preserves effectiveness.
- **Effort hypothesis:** L (2–4 hours), low confidence; assumes one bounded
  supplied item and available native tool sessions. Reassess if its dependencies
  require a broader workflow rather than generalizing that workflow implicitly.
- **Depends on:** An accessible source skill or rule and enough project context
  to understand and evaluate it; no dependency on later migration stories.

#### Goal

As an Open Dough maintainer, use an internal skill to adapt a supplied project
skill or rule into public guidance that another project can use and that remains
an effective substitute in the original context.

#### Scope

- Inspect the supplied guidance and the context or supporting resources it needs.
  Produce a public equivalent with project-specific assumptions removed or
  resolved through the adopting project's own context. Handle one supplied item
  per request; whole-project mining and bulk extraction are excluded.
- Evaluate substitution against the original intended behavior. Resolve missing
  context or dependencies before reporting the result as a usable replacement;
  if a gap cannot be resolved, explain it and leave suitability pending.
- Retain identifying characteristics alongside the public result for subsequent
  matching in any project. Avoid carrying private or project-specific operational
  details into public instructions simply to preserve a fingerprint.
- Make the resulting guidance installable and natively usable in all three tools.
  This includes the distribution needed for the selected item, not a new catalog
  or publishing service. Existing release workflows remain separate.
- Demonstrate substitution in a controlled project context. Reconciliation or
  deletion of an adopting project's existing guidance belongs to later stories.

#### Key examples

| Pre-condition | Trigger | Observable result |
| --- | --- | --- |
| Doughnut's `adr-awareness` skill assumes `docs/adrs/` and local ADR conventions | Invoke the internal extraction skill | Produces `dough-adr-awareness` that uses each project's ADR location and conventions while preserving Accepted-decision handling, conflict reporting, and human decision ownership in Doughnut and another project. |
| A supplied rule depends on a project-specific check | Generalize and evaluate substitution | Preserves the requirement through suitable local context, or reports the unresolved gap instead of claiming that removing the check is equivalent. |
| Another project uses a different name and path for the same practice | Inspect the result's retained characteristics | Purpose and behavior provide recognition clues without requiring that project to be Donut or to share its paths. |

<a id="replace-equivalent-guidance-on-update"></a>

### 2. Replace equivalent local guidance when updating Open Dough

- **Status:** Refined; not implemented or planned for execution.
- **For / why:** An adopting developer wants to use shared guidance without
  maintaining a redundant local equivalent.
- **Evaluation:** Update a project with matching local guidance, review the
  explained suggestion, and use the shared replacement after authorized cleanup.
- **Value / learning:** Removes duplication for clear matches even if handling
  local differences and first-install migration are deferred.
- **Effort hypothesis:** L (2–4 hours), low confidence; assumes a bounded set of
  matches with equivalent behavior and available native verification contexts.
- **Depends on:** Released public guidance with identifying characteristics
  and an installed target. Reuse the clear-equivalent assessment and cleanup
  demonstrated by Story 4; local-difference merging in Story 3 is not required.
  First installation in Donut now precedes this recurring update journey.

#### Goal

As a developer updating Open Dough, recognize and replace an equivalent local
skill, rule, or instruction even when it has a different name or comes from an
unrelated project.

#### Scope

- Compare incoming shared guidance with existing local skills, rules, and agent
  instructions using retained characteristics and actual behavior. Explain the
  match, coverage, proposed removal, and any affected references.
- Carry out the replacement when the developer's request authorizes it. Reuse
  authorization already given; a request for assessment alone produces suggestions.
- Remove redundant material and repair affected references so the shared guidance
  takes over. Preserve unrelated text, files, and other tools' working guidance.
- In this story, replace clear behavioral equivalents. If meaningful differences
  or ambiguous matches prevent a sound decision, explain and stop the affected
  replacement before deleting anything needed. Story 3 handles useful differences.
- A repeated update must not recreate a removed original or propose the same
  completed replacement again. Preserve the established release/update contract.

#### Key examples

| Pre-condition | Trigger | Observable result |
| --- | --- | --- |
| Project B has `split-work`, behaviorally equivalent to an incoming shared skill originally extracted elsewhere | Update Open Dough | Suggests replacement with a coverage explanation despite different project, name, and path; when authorized, removes the redundant local skill and updates its callers. |
| Two skills have similar names but serve different purposes | Update Open Dough | Does not treat the local skill as redundant merely because its name matches. |
| A matching rule is one section of an agent instruction document | Carry out the authorized replacement | Removes or replaces that section and its obsolete references while preserving unrelated instructions. |
| A local equivalent contains an additional useful instruction | Evaluate replacement | Reports the difference and leaves the local behavior intact; does not call this a clean equivalent or silently overwrite it. |

<a id="preserve-local-behavior-during-replacement"></a>

### 3. Adopt shared guidance while preserving useful local differences

- **Priority:** Deferred until a real installation or update encounters a
  useful local difference that blocks equivalent replacement. Preserve that
  local guidance and report the gap meanwhile; do not silently discard it.
- **Status:** Refined; not implemented or planned for execution.
- **For / why:** An adopting developer wants shared improvements without losing
  the local refinements that make the practice effective in their project.
- **Evaluation:** Replace overlapping guidance containing a useful local addition,
  then demonstrate both the shared practice and retained local behavior.
- **Value / learning:** Enables migration of adapted practices; remains useful
  even if initial-install reconciliation is deferred.
- **Effort hypothesis:** L (2–4 hours), low confidence; assumes a bounded case
  with a separable local addition. Open-ended conflict resolution is not promised.
- **Depends on:** The assessment and authorized replacement journey in Story 4
  or Story 2, plus an actual useful local difference.

#### Goal

As an adopting developer, replace overlapping local guidance with Open Dough
while preserving necessary project behavior and receiving a clear stop when a
conflict cannot be resolved.

#### Scope

- Evaluate meaningful differences instead of treating every difference as either
  disposable duplication or an automatic reason to give up.
- Where the shared practice and local requirement can coexist coherently, retain
  the necessary local context or instruction, remove the redundant shared portion,
  and update references. Explain what remains local and why.
- Check that the resulting combination still fulfills the local intended behavior.
  The form of local context is not prescribed by this story.
- If conflicting requirements cannot be resolved, stop the affected replacement,
  preserve effective guidance, and describe the precise decision needed. Do not
  leave a half-removed local practice with competing active instructions.
- This extends installation or updating; it does not automatically contribute local
  additions back to Open Dough or guarantee resolution of arbitrary conflicts.

#### Key examples

| Pre-condition | Trigger | Observable result |
| --- | --- | --- |
| A local story skill adds a project-required review step absent from the shared version | Authorize replacement during update | Uses the shared skill while retaining and applying the local review requirement; removes the redundant local copy and repairs references. |
| Local and shared guidance prescribe incompatible outcomes for the same situation | Attempt reconciliation | Explains the incompatible requirements and stops that replacement without losing the current effective guidance. |
| The same local addition appears in a project unrelated to the source | Reconcile its matching guidance | Preserves the addition based on its purpose, without requiring a source-project relationship. |

<a id="reconcile-guidance-on-install"></a>

### 4. Start using Open Dough without leaving overlapping local guidance

- **Status:** Follows shared installation, release, and Open Dough self-use;
  refine before planning or execution. Donut's local `adr-awareness` is the first
  selected replacement.
  Extraction and the recognition record already exist; replacement does not.
- **For / why:** A first-time adopter already has useful guidance and wants a
  coherent installation rather than another competing set of instructions.
- **Evaluation:** Install released `dough-adr-awareness` into Donut, demonstrate
  equivalence to local `adr-awareness`, remove the redundant original and repair
  its callers when authorized, then demonstrate explicit and architecture-triggered
  ADR use natively in Codex, Cursor, and Claude Code.
- **Value / learning:** Makes the migration available at first adoption rather
  than requiring the developer to wait for a subsequent update.
- **Effort hypothesis:** M–L, low confidence; first clear-equivalent adoption
  now establishes the assessment and cleanup reused by Story 2.
- **Depends on:** Story 1's accepted ADR-awareness skill and recognition record,
  safe installation (SEED-001 Story 5a), and a published payload (Story 5d).
  Open Dough self-use (Story 5e) is the chosen preceding real-use check, not a
  separate installation implementation. Deliver accepted replacement changes
  through the existing release workflow before released adoption in Donut.
  Further extraction and Stories 2–3 are not prerequisites; an existing Open
  Dough installation in Donut is not required.

#### Goal

As a developer installing Open Dough for the first time, identify and replace
redundant local guidance while retaining the project instructions I still need.

#### Scope

- Evaluate existing rules, skills, and agent instructions against the guidance
  being installed, including matches unrelated to the source project.
- Start with Donut's `adr-awareness` and the existing public recognition record.
  Explain coverage and affected references, then perform authorized replacement
  and repair callers. Include the references in `.cursor/rules/general.mdc` and
  `.cursor/rules/architecture-decisions.mdc`, and discover other actual callers.
  Preserve the local ADR context and effective architecture-triggered application;
  an explicitly invocable shared skill alone does not prove those triggers survived.
  Delete only redundant guidance, not ADR documents or necessary project rules.
  Assess by behavior; being extracted from Donut does not alone prove equivalence.
  Share this assessment and cleanup with the later update journey in Story 2.
- Useful local differences or conflicts stop the affected replacement and leave
  working local guidance intact. Story 3 handles reconciliation when such a case
  occurs; do not require that capability for clear equivalents.
- Leave unrelated guidance intact. Handle affected guidance in mixed instruction
  documents without removing the whole document. A match does not imply the
  entire project's guidance must be replaced.
- Report completion per selected replacement. An unresolved conflict preserves
  the affected local behavior and remains pending; do not present that skill's
  migration as successful. Unrelated clear replacements can still complete.
- Global or home-level migration, unrelated agent reconfiguration, and scanning
  practices outside the target project are excluded.

#### Key examples

| Pre-condition | Trigger | Observable result |
| --- | --- | --- |
| Donut has local `adr-awareness` and rule references to it; the accepted release contains `dough-adr-awareness` and its recognition record | Install Open Dough and authorize equivalent replacement | Installs the shared skill, removes the proven redundant original, repairs callers, preserves ADR documents and local conventions, and demonstrates explicit and architecture-triggered use in each native tool. |
| A project has no Open Dough installation but contains a renamed equivalent local skill | Install Open Dough | Explains the match and can replace it within the installation journey when authorized; the shared skill becomes usable. |
| An agent instruction document mixes a matching practice with project-specific build instructions | Install and reconcile | Replaces the redundant practice, preserves required build instructions, and leaves references coherent. |
| A local rule conflicts with incoming guidance and cannot be reconciled | Install Open Dough | Reports and stops the affected migration without discarding the local rule or presenting conflicting guidance as a successful adoption. |

<a id="extract-plan-execution-with-ci-monitor"></a>

### 5. Extract reusable plan execution with its CI monitor and supporting scripts

- **Priority:** Later, after simple extraction and real adoption. Resume when
  borrowing execute-plan/CI monitoring becomes the next material pain, or an
  earlier selected skill proves it needs this flow. This is complex main-path
  functionality, not merely an edge case.
- **Status:** Captured; not implemented or planned for execution.
- **For / why:** The Open Dough maintainer wants to extract a project practice
  such as Donut's execute-plan skill whose CI monitoring behavior relies on
  substantial supporting scripts, so adopters can use the complete practice.
- **Evaluation:** Extract the skill and required supporting resources, then
  demonstrate plan execution reaching and handling CI results in both the source
  context and another project context.
- **Value / learning:** Establishes whether extraction can preserve a practice
  whose behavior depends on executable scripts and integration with its caller.
- **Effort hypothesis:** Unknown until the source skill, CI monitor, and script
  dependencies are inspected; more involved than the ADR-awareness extraction.
- **Depends on:** Story 1's internal extraction capability and access to the
  source practice and its supporting scripts; independent of Stories 2–4.

#### Goal

As an Open Dough maintainer, extract a project's plan-execution skill, including
its CI monitor and required scripts, into reusable guidance that preserves the
working execution-to-monitoring flow in an adopting project.

#### Scope

- Inspect how the execute-plan skill invokes the CI monitor and which scripts,
  tools, configuration, and project assumptions the flow requires. Donut is the
  motivating source; confirm the exact source files during refinement.
- Generalize the required scripts and their invocation alongside the skill.
  Preserve necessary project context through explicit local configuration or
  discovery, keeping shared behavior in one source with minimal platform adaptation.
- Include required supporting resources in installation and updates, with working
  references from the installed skill. Evaluate coexistence with local guidance
  and other platform integrations without silently replacing them.
- Evaluate the complete plan-execution flow through CI monitoring against the
  source behavior, including successful CI, failed CI, and unavailable monitoring
  prerequisites. Report unresolved dependencies instead of claiming equivalence.
- Keep this as a separate extraction story; completed ADR-awareness evidence
  does not establish that script-dependent extraction or CI monitoring works.

#### Key examples

| Pre-condition | Trigger | Observable result |
| --- | --- | --- |
| Donut's execute-plan skill relies on a CI monitor and supporting scripts | Extract the practice | Produces reusable guidance with the required scripts and an explicit account of remaining local dependencies; copying the skill text alone is insufficient. |
| Another project has different paths and CI configuration | Install and invoke the extracted plan-execution skill | Uses that project's context, invokes its installed monitor resources, and handles CI results consistently with the source practice. |
| CI fails or a monitoring prerequisite is unavailable | Execute the plan through its monitoring step | Preserves the source practice's applicable failure handling or reports a precise unresolved gap; does not claim successful completion without the required CI evidence. |
| An installed version already works alongside local guidance and multiple tool integrations | Update the extracted practice and its scripts | Skill references and supporting resources remain consistent, and subsequent native execution still reaches CI monitoring without breaking coexistence. |

<a id="extract-story-refinement"></a>

### 6. Refine stories with an extracted Open Dough skill

- **Status:** Candidate; follows the first ADR-awareness adoption loop, not
  implemented or planned.
- **For / why:** The Open Dough maintainer repeatedly borrows Donut's
  `story-refinement`; use a shared skill for everyday story clarification.
- **Evaluation:** Extract `dough-story-refinement`, install it in a controlled
  context, and use it to refine a selected story's goal, scope, and key examples
  without reading the Donut checkout. Preserve the source practice's behavior.
- **Value / learning:** Directly removes one recurring borrowing dependency and
  tests reuse beyond ADR-awareness without taking on CI scripts.
- **Effort hypothesis:** M, low confidence; the source has no accompanying scripts
  but references `planning.mdc`, ADR-awareness, and other lifecycle skills.
- **Depends on:** Story 1's extraction capability and the supplied source skill.
  Resolve required planning conventions and use the existing shared ADR skill;
  do not assume deleting references makes the result equivalent.
- **Scope:** One usable public skill and its necessary context, recognition
  record, installation/update delivery, and native use. Preserve one story home
  and the distinction between refinement and execution. Extract only necessary
  shared behavior or accept suitable adopting-project context; if an essential
  dependency requires a broader extraction, expose the gap before claiming done.
  Publishing, real self-adoption, and Donut cleanup follow in their existing stories.

<a id="extract-story-decomposition"></a>

### 7. Decompose product work with an extracted Open Dough skill

- **Status:** Candidate; follows story-refinement in priority, not implemented
  or planned. Priority is not a technical dependency on Story 6.
- **For / why:** The maintainer wants to shape and reorder useful stories without
  repeatedly borrowing Donut's `story-decomposition`.
- **Evaluation:** Extract `dough-story-decomposition`, install it in a controlled
  context, and use it to turn a real product problem into bounded, ordered
  stories and stable backlog links without access to the Donut checkout.
- **Value / learning:** Makes another frequently borrowed planning practice
  reusable and tests preservation of its decision and scope discipline.
- **Effort hypothesis:** M, low confidence; no accompanying scripts, but required
  `problem-decomposition.mdc` conventions must be resolved during refinement.
- **Depends on:** Story 1's extraction capability and the supplied source skill;
  reuse shared planning context from Story 6 where applicable.
- **Scope:** One public skill, required context and recognition record, and
  installation/update delivery with native use. Preserve valuable, observable
  story outcomes and separation from executable plans. Backlog position conveys
  priority through unnumbered links; stable seed anchors survive reordering.
  Wider lifecycle extraction and CI monitoring remain separate.

## Cross-platform Acceptance and Evidence

Each story includes native discovery, invocation or application, and its intended
behavior in all three tools. For Story 1, verify both the internal skill and the
resulting public skill or rule, including installation, update delivery, and
coexistence where affected. For Stories 2–4, verify the actual installation or
update interaction, reference cleanup, retained local behavior, and subsequent
native use of the resulting guidance. Verify that changes for one integration
do not break another integration present in the same project.
For Story 5, verify native discovery and invocation of the extraction skill and
the resulting plan-execution skill, the execution-to-CI-monitoring behavior, and
installation, updating, and coexistence of its required scripts in each tool.
For Stories 6–7, separately verify native extraction, public skill discovery and
invocation, intended planning behavior without the Donut checkout, installation,
updating, and coexistence in Codex, Cursor, and Claude Code. Keep one shared
behavioral source with minimal platform adaptation. Story 1's proof does not
establish these new skills' behavior.

| Platform | Story 1 | Story 2 | Story 3 | Story 4 | Story 5 | Stories 6–7 |
| --- | --- | --- | --- | --- | --- | --- |
| Codex | Complete: native extraction, equivalence, alternate-project use, install/update, and coexistence | Pending native verification | Pending native verification | Pending native verification | Pending native verification | Pending native verification for each story |
| Cursor | Complete: native extraction, alternate-project use, install/update, and coexistence | Pending native verification | Pending native verification | Pending native verification | Pending native verification | Pending native verification for each story |
| Claude Code | Complete: native extraction, alternate-project use, install/update, and coexistence | Pending native verification | Pending native verification | Pending native verification | Pending native verification | Pending native verification for each story |

Story 1 evidence is native and independent per platform; copying files or passing
in one tool was not treated as proof for another. Later stories remain pending
until their own installation or update interactions are verified natively.

## Ordering and Scope Reduction

SEED-001 safe installation is complete. Remaining delivery order: publication of
the existing ADR-awareness payload and Open Dough self-use; then Story 4 installs in Donut
and replaces the redundant original. Both projects use the same installation
flow. Story 4 adds assessment, reference repair, and removal only where equivalent
local guidance exists; self-use needs no separate installer feature.

Then extract story-refinement (6) and story-decomposition (7), publish/use those
accepted additions, and extend replacement to later updates (2). Stories 6–7
and 2 are not prerequisites for Story 4. First-install replacement and later
update-time replacement remain distinct outcomes. This order supersedes the
earlier proposal to build replacement before completing installation and self-use.

Defer preserving local differences (3) until an actual mismatch occurs. Defer
plan execution and CI monitoring (5) until that borrowing becomes the next pain.
Potential follow-ons such as slice-planning and slice-plan-refinement wait for
selection rather than expanding the first two extractions implicitly. Keep
working local guidance where equivalence is unresolved. Basic preservation,
truthful failure reporting, and native cross-platform proof remain acceptance
conditions of the main path, not optional edge-case projects.

## Selection and Open Decisions

- The user selected Doughnut's `adr-awareness` skill as the first extraction
  example, producing `dough-adr-awareness`. The internal skill remains selectable
  by source at invocation; the selected example is not a provenance constraint.
- Public rule naming remains undecided and does not block the selected skill
  example. Standalone rule delivery needs its own concrete application proof;
  successful skill delivery must not be reported as proof of public-rule support.
- Story 1 delivered a companion recognition record and project-specific ADR
  context. Reuse that extraction capability for Stories 6–7; inspect their rule
  dependencies before treating either as straightforward. These two candidates
  are the recommended initial choices from the repeatedly borrowed skills.

## When to Surface

Story 1 is recorded in the [recently completed stories](../PRODUCT-BACKLOG.md#recently-done).
The [product backlog](../PRODUCT-BACKLOG.md) keeps one ordered list of unfinished
stories and a separate completed section in the same file. Story 4 follows SEED-001's safe
installation, publication, and self-use. Stories 6–7 and 2 follow Story 4;
Stories 3 and 5 remain deferred with the triggers above. Backlog priority does
not authorize implementation or execution of unfinished stories.

## Breadcrumbs

- Owner's initial idea, 2026-09-06: internal extraction skill, effective
  generalization, retained identifying characteristics, and clean reconciliation
  on updates and first installation.
- Owner's correction: recognize matching guidance in any project; source-project
  identity is not a prerequisite for suggesting or performing replacement.
- Owner then queued all four stories, requested a slice plan for Story 1, and
  selected Doughnut's `adr-awareness` skill as its concrete extraction source.
- Owner's addition, 2026-09-06: capture a separate story for extracting plan
  execution with its CI monitor, using Donut as an example; the monitor's
  substantial supporting scripts make extraction more complicated.
- Owner's reprioritization, 2026-09-06: keep every story visible, use unnumbered
  backlog links, prioritize easier Donut skill extraction, preserve a safe
  release/adoption order, then install in Donut and remove redundant guidance;
  defer edge cases until encountered.
- Owner's next correction, 2026-09-06: because ADR-awareness is already extracted
  with its characteristics recorded, prioritize installing it in Donut and
  removing the redundant original before extracting further skills; identify only
  genuine prerequisites.
- Owner's installation clarification, 2026-09-06: first fix installation, then
  apply the same flow to Open Dough and other projects. Chosen order is safe
  installation, publication, self-use, then Donut replacement; more extraction
  and later update-time replacement are not prerequisites for that first cleanup.
- [Donut story-refinement](../../../doughnut/.agents/skills/story-refinement/SKILL.md)
- [Donut story-decomposition](../../../doughnut/.agents/skills/story-decomposition/SKILL.md)
- [Public and internal skill terminology](../../docs/adrs/0001-ubiquitous-language.md)
