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
- Story 4 is complete at the first native Codex replacement boundary. Its
  post-cleanup use and real Donut adoption are smaller stories in SEED-006.
  Open Dough self-use remains independently owned by SEED-001. Preserve
  cross-platform acceptance by leaving unobserved Cursor and Claude Code outcomes
  pending rather than expanding this completed story.

## Alternatives and Working Direction

| Option | Assessment |
| --- | --- |
| Defer | Keeps practices local and leaves developers to recognize and reconcile overlap themselves. |
| Generalize one supplied item first | Recommended first outcome: prove useful reuse before adding automatic migration to installation and updates. |
| Manually copy, rename, and reconcile guidance | A practical fallback for one item, but does not provide the requested repeatable internal skill or recognition and replacement across adopting projects. |
| Deliver extraction and all migration behavior together | Matches the overall ambition but delays learning whether generalization preserves effectiveness. |

The owner selected ADR-awareness as the first replacement example, then narrowed
Story 4 after execution showed that its original three-tool, real-project, update,
and exception matrix contained several independent outcomes. The accepted result
is one bounded native Codex replacement. SEED-006 owns the remaining adoption
journeys; Stories 5–7 here retain separate extraction outcomes.

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
  Practical Donut adoption is now decomposed in SEED-006 before this recurring
  generic update journey.

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

### 4. Complete one authorized ADR-guidance replacement in Codex

- **Status:** Completed 2026-09-06 through slice 4a in
  [Plan 013](../quick/013-adopt-adr-awareness/PLAN.md). Native Codex
  assessment, context retention, caller repair, and redundant-original removal
  passed on a protected disposable Donut-derived target. Cursor, Claude Code,
  fresh-install, later-update, and live Donut outcomes were not claimed.
- **For / why:** The Open Dough maintainer needed the smallest usable proof that
  one recognized equivalent could be replaced safely after one authorization.
- **Evaluation:** Native Codex followed the installed tagged workflow, retained
  every required original-only value, repaired the explicit caller checklist,
  removed only the original, and preserved ADR records and unrelated guidance.
- **Value / learning:** The narrow success validates the replacement direction
  without requiring automatic handling of every platform and failure case.
- **Effort:** Completed. The former M-L scope was disproved by two execution
  overruns and split at the first coherent value boundary.

#### Goal

As an Open Dough maintainer, prove one already-installed, behaviorally
equivalent ADR-awareness practice can be assessed and replaced in native Codex
without losing required adopter context or unrelated project guidance.

#### Scope

- Includes a disposable exact tagged payload, read-only assessment, reuse of one
  cleanup authorization, context retention, exhaustive caller repair, and
  removal of the redundant original for the single Codex integration.
- Excludes fresh installation, release publication, real Donut mutation,
  post-cleanup use, Cursor and Claude Code adoption, automatic failure handling,
  and update preservation.
- The excluded work is decomposed in
  [SEED-006](SEED-006-extend-adr-guidance-adoption.md). Open Dough self-adoption
  remains in SEED-001.

#### Completion evidence

Plan 013 records `codex-cli 0.144.1`, controlled release `v0.1.0`, exact
caller/original-only changes, preserved payload and ADR state, focused checks,
and successful CI run `34036359908`. Missing native Cursor and Claude Code
evidence remains pending in follow-up stories.
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

Story 1 is complete with independent native extraction, delivery, use, and
coexistence evidence in Codex, Cursor, and Claude Code. Stories 2, 3, and 5-7
remain pending in every platform.

Story 4 is complete only for its deliberately narrowed native Codex replacement
boundary. Cursor and Claude Code adoption, post-cleanup use, fresh installation,
later updates, and live Donut changes moved to SEED-006. File copying or Codex
success does not prove those outcomes; their native evidence remains pending.

## Ordering and Scope Reduction

SEED-001 safe installation and publication are complete. The first bounded
Codex replacement is also complete. Open Dough self-adoption remains in
SEED-001. The next practical adoption work is decomposed in SEED-006: prove
post-cleanup Codex use, prepare Donut while retaining the original, finish
Donut cleanup only after three-tool readiness, then optionally verify updates.

Stories 2, 3, and 5-7 in this seed remain independent. Preserve local guidance
when equivalence is unresolved; defer difference reconciliation and additional
skill extraction until their own triggers.

## Selection and Open Decisions

- The completed example remains `dough-adr-awareness`; matching is behavioral,
  not tied to Donut provenance or the original name.
- Public rule naming remains undecided and does not block skill adoption.
- Backlog order authorizes no execution, publication, or mutation of Donut.

## When to Surface

The product backlog records completed Stories 1 and 4 and the selected
follow-ups from SEED-006. Surface other candidates only when their stated pain
or dependency appears.

## Breadcrumbs

- Owner scope correction, 2026-09-06: stop the first adoption story after the
  narrow successful Codex replacement; manual failure recovery is acceptable.
- The former 40-slice remainder is mapped in
  `SEED-006-extend-adr-guidance-adoption.md`.
- [Donut story-refinement](../../../doughnut/.agents/skills/story-refinement/SKILL.md)
- [Donut story-decomposition](../../../doughnut/.agents/skills/story-decomposition/SKILL.md)
- [Public and internal skill terminology](../../docs/adrs/0001-ubiquitous-language.md)
