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
- The immediate goal is safe adoption in Donut with the redundant ADR-awareness
  guidance removed. Story 4 can be refined and developed alongside safe
  installation. Real adoption still needs accepted installation and a published
  release containing the required behavior. Open Dough self-use can proceed
  independently; it is useful evidence, not an additional gate on this outcome.
  Preserve cross-platform acceptance; defer further extraction, general migration,
  and difference reconciliation until a real case needs them.

## Alternatives and Working Direction

| Option | Assessment |
| --- | --- |
| Defer | Keeps practices local and leaves developers to recognize and reconcile overlap themselves. |
| Generalize one supplied item first | Recommended first outcome: prove useful reuse before adding automatic migration to installation and updates. |
| Manually copy, rename, and reconcile guidance | A practical fallback for one item, but does not provide the requested repeatable internal skill or recognition and replacement across adopting projects. |
| Deliver extraction and all migration behavior together | Matches the overall ambition but delays learning whether generalization preserves effectiveness. |

The owner confirmed the overall direction and cross-project matching, then
reprioritized on 2026-09-06 around repeated borrowing from Donut, then selected
ADR-awareness adoption and replacement as the next priority. The latest request
selects Story 4 for refinement in a separate worktree alongside safe installation.
Story 1 already proved extraction; Story 4 closes Donut's adoption loop as soon as
its installation and release prerequisites are ready. Open Dough self-use remains
separately queued and can be delayed. Stories 6–7 retain further planning-skill
extraction; Story 5 retains the more complex CI-monitor extraction. Borrowing
source guidance is an immediate bridge, but only extraction, distribution, and
native reuse remove the recurring sibling-project dependency.

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

- **Status:** Refined 2026-09-06 in `codex/adopt-adr-awareness`, with a
  [slice plan](../quick/013-adopt-adr-awareness/PLAN.md) prepared using Donut's
  `slice-planning` skill and refined in place with `slice-plan-refinement`.
  It is ready to start from slice 1, with safe-install and published-adoption
  dependency gates intact. Implementation and native verification are pending.
- **Value / learning:** Demonstrate the first useful replacement in a real
  adopter using the already-extracted `dough-adr-awareness` and recognition
  record. A reusable adoption journey must work without a maintainer manually
  copying files or borrowing an unreleased Open Dough checkout.
- **Effort hypothesis:** M–L, low confidence. The outstanding uncertainty is
  preserving local context and automatic application across three native tools;
  extraction and basic installer implementation already exist.
- **Dependencies:** Story 1's accepted skill and recognition record are available.
  Refinement and controlled development can proceed alongside SEED-001 Story 5a.
  Real Donut adoption needs that safe-install acceptance and a published release
  containing the required adoption behavior under
  [ADR 0003](../../docs/adrs/0003-tagged-release-versioning-accepted.md).
  Reuse Story 5d's release workflow. Story 5e's Open Dough self-use can proceed
  separately; further extraction and Stories 2–3 do not block this outcome.

#### Goal

As a developer adopting Open Dough in a project such as Donut, obtain its
released guidance through the existing safe install or update flow, then replace
my proven redundant local ADR-awareness skill and its obsolete callers, so all
three tools use the shared practice with my project's ADR context intact.

The smallest useful outcome is one completed ADR-awareness adoption. Success
includes removing the original and retaining effective explicit and
architecture-triggered ADR use; installed files or a replacement suggestion
alone do not complete it.

#### Scope

- Use the existing supplied-URL, pinned numeric-release installation/update
  behavior. Fresh installation is the primary Donut starting point. If Open
  Dough is already installed when adoption begins, use the existing update or
  explicitly authorized reinstall path to reach the required release, followed
  by the same one-time cleanup. Do not require a second update after a successful
  first install. Reuse version comparison, repeat protection, and failure rules;
  do not alter their semantics to perform cleanup. A current-version result
  alone does not prove the separate local replacement has happened.
- Select the local ADR-awareness practice using the existing recognition record
  and actual behavior. Donut's name, original filename, or extraction provenance
  is neither a requirement nor sufficient proof: a renamed equivalent must be
  assessable. Limit this story to the one ADR-awareness practice and its callers,
  rather than adding migration support for arbitrary skills and rules.
- Explain the behavioral coverage, exact redundant material, references to
  repair, and project context that will remain. Assessment alone makes no
  replacement changes. Carry out cleanup when the developer has authorized that
  replacement, reusing authorization already supplied rather than asking twice.
  A plain install/update request does not itself authorize deleting local skills;
  installer `--force` is not authorization for unrelated local-guidance removal.
- Retain the context required by the shared skill before removing the original:
  ADR store/index, status and supersession conventions, architecture-shaped
  triggers, human decision process, exception trail, and relevant planning
  precedence. Context currently embedded in the original must remain available
  locally. This necessary context transfer is included; merging additional
  competing behavioral policies remains Story 3.
- Remove the proven redundant original and repair all affected live callers,
  including discovery links and references inside mixed documents. Preserve
  unrelated instructions and ADR decisions, statuses, index entries, and history;
  mechanical skill-reference repair in ADR documentation is included. Native
  automatic application must still reach the shared guidance. Do not preserve a
  second behavioral copy merely to keep an obsolete name working.
- Complete replacement coherently for the affected integrations. Installing for
  one tool must not delete a shared original or link still required by another.
  Retain that original while any affected tool lacks a working replacement, and
  report cleanup as pending. The final Donut result has working native access in
  Codex, Cursor, and Claude Code with the obsolete original and dangling callers
  gone. Keep one shared Open Dough behavior with minimal native adaptations.
- Failed installation, uncertain equivalence, missing required context, or an
  unresolved local policy difference leaves the original available and blocks
  its removal. Report any completed installation separately from pending cleanup;
  do not claim migration success. If interrupted cleanup has changed files,
  describe the actual state without claiming automatic rollback.
- Subsequent ordinary installation/update retains the existing release contract
  and must not recreate the removed original or break the repaired callers.
  General recognition and replacement of new matches on recurring updates stays
  in Story 2. Also defer further extraction, local-difference merging, general
  migration/rollback infrastructure, home-level scanning, new release machinery,
  and broader documentation cleanup.

#### Key examples

| Pre-condition | Trigger | Observable result |
| --- | --- | --- |
| Donut has local `adr-awareness` and its callers; the accepted release contains the adoption behavior | Install Open Dough and authorize the ADR-awareness replacement | Uses the pinned release, preserves necessary local context, removes the proven redundant original, repairs callers, and retains explicit and architecture-triggered ADR use in all three tools. |
| Open Dough was already installed before this initial cleanup | Request adoption and replacement, using the existing update/reinstall path as needed | Reaches the usable released guidance and performs the same bounded cleanup; an already-current version does not falsely count as completed replacement. |
| A different project has the same ADR practice under another name; its instruction document also contains build commands | Assess and authorize this practice's replacement | Explains equivalence by behavior, replaces only redundant ADR guidance and affected references, and preserves build instructions. |
| Only one tool has the replacement, while another still reaches the shared original | Continue adoption | Keeps the original usable and reports cleanup pending until all affected integrations can use the replacement; no dangling discovery link or broken trigger. |
| Installation fails, or assessment finds a meaningful uncovered local behavior | Attempt adoption | Leaves the original available, names the blocker, and does not report successful replacement. |
| Replacement has completed | Run an ordinary later update and then do ADR-relevant work | Preserves the replacement, local context, and caller repairs; the old skill is not recreated. Existing equal-version no-write behavior remains intact. |

#### Current evidence and acceptance

Read-only inspection of Donut at `43f0dbe0d47840e31f4773723cfed2d663e56bc8`
found the original at `.agents/skills/adr-awareness/SKILL.md`, plus these affected
callers. Recheck the target at execution time because Donut has concurrent work:

- `.cursor/rules/general.mdc` and `.cursor/rules/architecture-decisions.mdc`;
- `.cursor/agent-map.md` and `.agents/skills/story-refinement/SKILL.md`;
- `docs/adrs/README.md` and `docs/adrs/0000-use-adrs-accepted.md`;
- `.claude/skills/adr-awareness`, a symlink to `../../.agents/skills/adr-awareness`.

Donut's `AGENTS.md` and `CLAUDE.md` also direct agents to the architecture rule.
Its ADR index and record classify ADR 0001 as Accepted despite its unsuffixed
filename; the replacement must retain that interpretation and must not treat
Proposed ADR 0002 as binding. Neither reference searches nor the previous
controlled extraction proof establish successful replacement in current Donut.

| Platform | Earlier evidence reusable for unchanged behavior | Required new observation; currently pending |
| --- | --- | --- |
| Codex | Story 1's controlled equivalence and installed fresh-use proof, Quick 007 slices 5–6 and 12. | Native discovery and invocation of the adoption entry, authorized cleanup, fresh explicit and architecture-triggered shared ADR use, local-context preservation, later update behavior, and coexistence after original removal. |
| Cursor | Story 1's native delivery-to-use proof, Quick 007 slice 14. | Same adoption/use outcomes through native Cursor, including automatic application through the repaired architecture rule and preservation of other integrations. |
| Claude Code | Story 1's native delivery-to-use proof, Quick 007 slice 16. | Same adoption/use outcomes through native Claude Code, including coherent discovery after retiring the original skill symlink and preservation of other integrations. |

Use controlled tagged sources and disposable adopter copies for development;
they do not replace final adoption evidence from the published release in Donut.
Record the source URL/tag/commit, tool version, invoked entry, affected paths,
and decisive native observations per platform in the eventual plan/change
summary. Reuse Story 5a evidence only where the integration leaves it valid.
Changed guidance needs fresh native evidence; file copying is insufficient.

No unresolved product decision prevents slice planning within this boundary.
Actual local policy gaps, if encountered, remain explicit blockers to the
affected removal. The linked slice plan now records executable leaves and
proof ownership; neither refinement nor planning has installed or removed
anything from Donut.

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

The immediate delivery target is Story 4's first ADR-awareness adoption in
Donut. Its refinement and development can run in parallel with SEED-001 safe
installation; real adoption waits for safe-install acceptance and publication
of the required behavior through the existing release workflow. Do not delay
an otherwise-ready base release for replacement work; if it ships first, release
the accepted replacement changes through the same workflow afterward. Both
projects use the same installation flow. Open Dough self-use remains independently
queued and can be delayed rather than gating Donut's outcome. This refines
dependency timing without changing the ordered backlog or its stable links.

Then extract story-refinement (6) and story-decomposition (7), publish/use those
accepted additions, and extend recognition/replacement to recurring updates (2).
Stories 6–7 and 2 are not prerequisites for Story 4. A first adoption may use an
existing installation, but that does not absorb the general recurring-update
story. This boundary supersedes the earlier requirement to finish Open Dough
self-use before starting Story 4.

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
stories and a separate completed section in the same file. Story 4 can be
refined and developed alongside safe installation; its real adoption still
requires accepted installation and published behavior. Open Dough self-use is
independent. Stories 6–7 and 2 follow Story 4; Stories 3 and 5 remain deferred
with the triggers above. Backlog priority does not authorize implementation or
execution of unfinished stories.

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
- Owner's parallel-work request, 2026-09-06: create a separate branch/worktree
  for backlog item four and borrow Donut's story-refinement skill; minimize scope
  to safe install/update followed by redundant ADR-awareness removal. This
  refinement treats one initial cleanup as the selected outcome, allows its
  development alongside installation, and defers Open Dough self-use as a gate
  while retaining safe released adoption and all three native proofs.
