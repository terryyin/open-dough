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

<a id="extract-directly-with-guidelines"></a>

### 9. Extract a project skill directly into unreleased source

**Status:** Refined; first in the product backlog.
**Effort:** S (30–60 minutes), medium confidence; one ordinary on-demand skill
and a manual behavior review.

#### Goal

The maintainer makes one extraction request and receives the reusable skill
in Open Dough's source tree, ready to review and improve.

#### Scope

- Update the internal `extract-guidance` workflow for one supplied, self-contained
  on-demand skill. Read its necessary context and preserve the source contents.
- Write `src/skills/dough-<name>/SKILL.md` and a short `RECOGNITION.md` directly.
  Follow the existing naming convention and shared authoring guideline.
- Preserve the useful workflow, trigger, output, and human decisions. Turn local
  conventions into explicit adopter context. Keep recognition focused on purpose,
  source-relative clues, and required context.
- Review one representative use manually. Handle incomplete context and unusual
  source guidance through a brief explanation and manual follow-up.
- Delete the displaced draft/assessment workflow and its dedicated checks and
  support material. Keep instructions focused on the current operation.

Extraction ends with the source skill and concise review result. Publication,
client installation, and extraction of a particular Donut practice belong to
their selected tasks. The existing Acme readiness fixture supplies this story's
small demonstration.

#### Key example

Given the Acme readiness skill and an adopter whose work-item convention is
`TASK-NNN`, invoke extraction in a disposable Open Dough checkout. The result is
`src/skills/dough-acme-change-readiness/` with the skill and recognition record.
Apply it to a concrete proposal carrying `TASK-123`: the brief identifies the
user, outcome, risk, rollback signal, and required context; the human owns approval.
Compare the source contents before and after extraction to confirm preservation.

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

Story 9 supplies direct extraction using the shared maintenance guideline.
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

<a id="maintain-skills-without-discovery-rechecks"></a>

### 10. Maintain skills with a minimal shared guideline

**Status:** Complete.
**Goal and scope:** Add or edit skills with a short shared guideline and manual
behavior review; keep surrounding process small.
