---
id: SEED-004
status: active
planted: 2026-09-06
planted_during: Parallel exploration of extracting existing project guidance
trigger_when: A real task benefits from reusable project guidance
scope: medium
---

# SEED-004: Extract useful guidance and use it on real work

## Goal

Turn one useful project practice into shared guidance, then use it on an actual
task. Keep source review and project-specific fixes manual. Shared skill behavior
follows the established Codex, Cursor, and Claude Code conventions.

## Stories

<a id="maintain-skills-without-discovery-rechecks"></a>

### 10. Maintain skills with a minimal shared guideline

**Status:** Refined; first in the product backlog.
**Effort hypothesis:** S (30–60 minutes), low confidence; assumes manual cleanup
of the discovery process and reuse of existing skill conventions.

#### Goal

The Open Dough maintainer can add or edit a skill by following a short shared
guideline and manually reviewing its useful behavior. Spend time improving the
skill itself; keep the surrounding process small.

#### Scope

- Keep one concise description of the naming, frontmatter, layout, and reference
  conventions used by Codex, Cursor, and Claude Code. Review a representative
  skill change against those conventions and its intended outcome.
- Delete routine native discovery verification and the machinery dedicated to it:
  runners, fixtures, tests, evidence records, checklists, and acceptance tasks.
  Retain shared pieces according to their current functional use.
- Make affected instructions, acceptance wording, and policy documents describe
  the resulting workflow directly. Delete obsolete text, historical explanations,
  archival copies, and commentary about removed behavior. Apply this cleanup to
  the discovery process and its supporting material throughout the repository.
- Use positive examples of useful behavior for acceptance. Retain tests that
  exercise current functionality; delete tests whose purpose is policing removed
  process. Manual review is sufficient for the guideline and prose cleanup.
- Handle unusual cases manually when they arise. Story 9 owns the extraction
  destination change; installation and update functionality retain their own
  stories and functional checks.

#### Key examples

| Situation | Action | Useful result |
| --- | --- | --- |
| The maintainer adds a conventional skill | Follow the shared guideline and review a representative use | The skill has clear invocation context and produces its intended result. |
| The maintainer edits an existing skill | Review the changed behavior using a concrete example | The owner can judge the improvement directly. |
| An agent reads the project's skill-maintenance instructions | Apply the concise current workflow | The agent produces a reviewable skill change using the same conventions across the three tools. |

<a id="extract-directly-with-guidelines"></a>

### 9. Extract a project skill directly into unreleased source

**Status:** Unplanned.
**Goal:** One extraction request produces the reusable skill in the source tree.
**Scope:** Adapt one ordinary project skill into `src/skills/dough-<name>/` with a
concise recognition record. Preserve its useful behavior, make adopter context
explicit, and keep the source intact. Handle unusual cases manually.
**Evaluation:** The maintainer reviews the actual source skill against the
original and can use it on a representative task. Release is a separate action.
**Effort:** M, medium confidence; assumes one self-contained on-demand skill.
**Depends on:** An accessible source practice. Story 10 simplifies the common workflow.

<a id="extract-story-refinement"></a>

### 6. Extract story refinement and improve one real story

**Status:** Unplanned.
**Goal:** Refine an actual Open Dough story using reusable shared guidance.
**Scope:** Extract Donut's story-refinement practice and its needed guidance into
the source skills. Apply it to one selected story in its existing seed.
**Evaluation:** The story has a useful goal, small scope, and concrete examples
that the owner can review. Include the skill in the next useful release.
**Effort:** M, medium confidence; assumes the supplied practice is self-contained
with its directly referenced guidance.
**Depends on:** The source practice and Story 9's direct extraction workflow.

<a id="extract-story-decomposition"></a>

### 7. Extract story decomposition and simplify one real problem

**Status:** Unplanned.
**Goal:** Split one oversized Open Dough problem into useful, ordered stories.
**Scope:** Extract Donut's decomposition practice and its needed guidance, then
use it on one actual problem. Keep the smallest worthwhile outcomes in their
home seed and queue the useful next story.
**Evaluation:** Each selected story delivers something the owner can judge and
has a rough effort estimate. Manual work is considered when choosing scope.
Include the skill in the next useful release.
**Effort:** M, medium confidence; assumes one bounded problem.
**Depends on:** The source practice and Story 9. Select when an actual problem
needs decomposition.

<a id="adopt-known-client-projects"></a>

### 8. Adopt shared guidance in one other client project

**Status:** Deferred until another named client wants the guidance.
**Goal:** That client uses a released shared practice on an existing task.
**Scope:** Choose one project and practice, install the release, retain required
local context, fix callers manually, and delete redundant borrowed guidance.
**Evaluation:** The installed practice helps complete the chosen task and the
owner can review the resulting project changes.
**Effort:** M, low confidence; the actual project determines the work.
**Depends on:** A named client, wanted practice, and available release.

<a id="extract-plan-execution-with-ci-monitor"></a>

### 5. Extract plan execution for one real task through CI

**Status:** Deferred until a real execution task needs this practice.
**Goal:** Finish one actual plan using shared execution guidance through its CI result.
**Scope:** Extract the selected practice with the scripts needed for that task.
Use existing CI and handle the observed result manually where practical.
**Evaluation:** The plan delivers its useful behavior and the maintainer gets
an actionable CI result.
**Effort:** M–L, low confidence; size the real task when selected.
**Depends on:** An actual plan, source practice, and working project CI.

## Ordering

Story 10 first simplifies maintenance; Story 9 supplies direct extraction.
Story 6 is the next concrete reuse opportunity. Story 7 surfaces for a real
oversized problem; Stories 8 and 5 surface for their named client/task needs.
Manual copying is a useful fallback if Story 9 is deferred.

## Delivered capabilities

<a id="generalize-project-guidance"></a>

### 1. Turn a supplied project practice into usable public guidance

**Status:** Complete.
**Goal and scope:** Generalize one practice while retaining its useful behavior.

<a id="reconcile-guidance-on-install"></a>

### 4. Complete one authorized ADR-guidance replacement in Codex

**Status:** Complete.
**Goal and scope:** Replace a borrowed practice while retaining required adopter context.
