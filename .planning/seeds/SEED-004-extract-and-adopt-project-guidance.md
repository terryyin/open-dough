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
- This seed records story understanding. Story 1 now has a linked slice plan;
  no extraction is implemented, guidance published, or project migrated, and no
  removal of another project's files is authorized.

## Alternatives and Working Direction

| Option | Assessment |
| --- | --- |
| Defer | Keeps practices local and leaves developers to recognize and reconcile overlap themselves. |
| Generalize one supplied item first | Recommended first outcome: prove useful reuse before adding automatic migration to installation and updates. |
| Manually copy, rename, and reconcile guidance | A practical fallback for one item, but does not provide the requested repeatable internal skill or recognition and replacement across adopting projects. |
| Deliver extraction and all migration behavior together | Matches the overall ambition but delays learning whether generalization preserves effectiveness. |

The owner has confirmed the overall direction and the cross-project matching
requirement. The four boundaries and order below are recommendations, not a
separately approved delivery sequence. The first learning hypothesis is that one
concrete practice can become reusable without weakening it in its original use.

## Story Decomposition

<a id="generalize-project-guidance"></a>

### 1. Turn a supplied project practice into usable public guidance

- **Status:** Planned; not implemented. [Slice plan](../quick/007-generalize-project-guidance/PLAN.md)
  recommends refinement for four leaves before execution.
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
- **Depends on:** Available public guidance with identifying characteristics;
  Story 1 supplies it, but its internal skill is not required to run an update.

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

- **Status:** Refined; not implemented or planned for execution.
- **For / why:** An adopting developer wants shared improvements without losing
  the local refinements that make the practice effective in their project.
- **Evaluation:** Replace overlapping guidance containing a useful local addition,
  then demonstrate both the shared practice and retained local behavior.
- **Value / learning:** Enables migration of adapted practices; remains useful
  even if initial-install reconciliation is deferred.
- **Effort hypothesis:** L (2–4 hours), low confidence; assumes a bounded case
  with a separable local addition. Open-ended conflict resolution is not promised.
- **Depends on:** The assessment and authorized replacement journey in Story 2.

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
- This extends the update journey; it does not automatically contribute local
  additions back to Open Dough or guarantee resolution of arbitrary conflicts.

#### Key examples

| Pre-condition | Trigger | Observable result |
| --- | --- | --- |
| A local story skill adds a project-required review step absent from the shared version | Authorize replacement during update | Uses the shared skill while retaining and applying the local review requirement; removes the redundant local copy and repairs references. |
| Local and shared guidance prescribe incompatible outcomes for the same situation | Attempt reconciliation | Explains the incompatible requirements and stops that replacement without losing the current effective guidance. |
| The same local addition appears in a project unrelated to the source | Reconcile its matching guidance | Preserves the addition based on its purpose, without requiring a source-project relationship. |

<a id="reconcile-guidance-on-install"></a>

### 4. Start using Open Dough without leaving overlapping local guidance

- **Status:** Refined; not implemented or planned for execution.
- **For / why:** A first-time adopter already has useful guidance and wants a
  coherent installation rather than another competing set of instructions.
- **Evaluation:** Install into a project with existing rules, skills, and agent
  instructions; review and perform suitable replacements, then use the result.
- **Value / learning:** Makes the migration available at first adoption rather
  than requiring the developer to wait for a subsequent update.
- **Effort hypothesis:** M (1–2 hours), low confidence; assumes the same matching
  and reconciliation behavior from Stories 2–3 can serve initial installation.
- **Depends on:** Installable public guidance and the matching/replacement behavior
  of Stories 2–3; an existing Open Dough installation is not required.

#### Goal

As a developer installing Open Dough for the first time, identify and replace
redundant local guidance while retaining the project instructions I still need.

#### Scope

- Evaluate existing rules, skills, and agent instructions against the guidance
  being installed, including matches unrelated to the source project.
- Explain and suggest replacements, then perform authorized replacements with
  the same equivalence, local-context preservation, cleanup, and conflict behavior
  as the update journey.
- Leave unrelated guidance intact. Handle affected guidance in mixed instruction
  documents without removing the whole document. A match does not imply the
  entire project's guidance must be replaced.
- Complete only reconciled adoption; clearly report an unresolved conflict and
  preserve the affected behavior rather than claiming the migration succeeded.
- Global or home-level migration, unrelated agent reconfiguration, and scanning
  practices outside the target project are excluded.

#### Key examples

| Pre-condition | Trigger | Observable result |
| --- | --- | --- |
| A project has no Open Dough installation but contains a renamed equivalent local skill | Install Open Dough | Explains the match and can replace it within the installation journey when authorized; the shared skill becomes usable. |
| An agent instruction document mixes a matching practice with project-specific build instructions | Install and reconcile | Replaces the redundant practice, preserves required build instructions, and leaves references coherent. |
| A local rule conflicts with incoming guidance and cannot be reconciled | Install Open Dough | Reports and stops the affected migration without discarding the local rule or presenting conflicting guidance as a successful adoption. |

## Cross-platform Acceptance and Evidence

Each story includes native discovery, invocation or application, and its intended
behavior in all three tools. For Story 1, verify both the internal skill and the
resulting public skill or rule, including installation, update delivery, and
coexistence where affected. For Stories 2–4, verify the actual installation or
update interaction, reference cleanup, retained local behavior, and subsequent
native use of the resulting guidance. Verify that changes for one integration
do not break another integration present in the same project.

| Platform | Story 1 | Story 2 | Story 3 | Story 4 |
| --- | --- | --- | --- | --- |
| Codex | Pending native verification | Pending native verification | Pending native verification | Pending native verification |
| Cursor | Pending native verification | Pending native verification | Pending native verification | Pending native verification |
| Claude Code | Pending native verification | Pending native verification | Pending native verification | Pending native verification |

This is refinement evidence only: the supplied seed, the owner's correction,
and Donut's refinement/decomposition guidance were read. No native implementation
claims are made. Prior installer evidence does not prove these new behaviors;
copying files or passing in one tool does not establish another tool's support.

## Ordering and Scope Reduction

Recommended order: generalize one practice → replace clear equivalents on update
→ preserve local differences → reconcile at first installation. This tests
usefulness before migration and tests clear cross-project matching before more
complex reconciliation. No story exists solely to build a metadata layer.

If reducing scope, defer Story 4 first: initial adopters can retain local guidance
and reconcile on update. Then defer Story 3, retaining the explicit stop for
meaningful differences. Deferring Story 2 still leaves Story 1's reusable guidance
available with manual adoption and reconciliation. These are temporary stopping
points, not a reduction of the owner's complete intention.

## Selection and Open Decisions

- The user selected Doughnut's `adr-awareness` skill as the first extraction
  example, producing `dough-adr-awareness`. The internal skill remains selectable
  by source at invocation; the selected example is not a provenance constraint.
- Public rule naming remains undecided and does not block the selected skill
  example. Standalone rule delivery needs its own concrete application proof;
  successful skill delivery must not be reported as proof of public-rule support.
- The first plan proposes a compact companion recognition record and use of the
  adopting project's ADR context. Their exact representation is an implementation
  detail to settle through the selected example.

## When to Surface

All four stories are queued in the [product backlog](../PRODUCT-BACKLOG.md),
after the existing stories and in the order shown here. The owner selected
Story 1 for slice planning. Its linked plan does not authorize implementation
or execution of the remaining three stories.

## Breadcrumbs

- Owner's initial idea, 2026-09-06: internal extraction skill, effective
  generalization, retained identifying characteristics, and clean reconciliation
  on updates and first installation.
- Owner's correction: recognize matching guidance in any project; source-project
  identity is not a prerequisite for suggesting or performing replacement.
- Owner then queued all four stories, requested a slice plan for Story 1, and
  selected Doughnut's `adr-awareness` skill as its concrete extraction source.
- [Donut story-refinement](../../../doughnut/.agents/skills/story-refinement/SKILL.md)
- [Donut story-decomposition](../../../doughnut/.agents/skills/story-decomposition/SKILL.md)
- [Public and internal skill terminology](../../docs/adrs/0001-ubiquitous-language.md)
