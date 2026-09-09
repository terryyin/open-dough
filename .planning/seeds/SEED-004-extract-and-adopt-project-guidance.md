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
seed and queue the useful next story.
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

**Status:** Planned in
[Quick 028](../quick/028-prevent-self-installation-drift/PLAN.md).
**Goal:** Finish the self-installation drift prevention plan using shared
execution guidance and obtain actionable evidence from Open Dough's real CI.
**Scope:** Make `src/skills/` the explicit source for client-payload edits, add a
deterministic self-installation baseline check, and gate release finalization on
that check. Execute with one CI observer and repair a delivered legacy CI defect.
Manual post-release self-update/commit and the separate historical regression
fixture remain maintainer-owned follow-ups.
**Evaluation:** Open Dough CI rejects managed installation drift, release
finalization stops before mutation when drift exists, and execution records a
real actionable CI notification plus safe repair/shutdown evidence; if no real
failure is delivered, that observer proof remains explicitly pending.
**Effort:** M–L, medium confidence; four target-sized implementation slices plus
one live CI evidence slice, with external wait as the only expected exception.
**Depends on:** The released execution skill, an executable plan, authenticated
`gh`, and push-triggered `ci.yml` on `main`.

## Ordering

Story 9 is complete. Story 6 is the next concrete reuse opportunity. Story 7
surfaces for a real oversized problem; Stories 8 and 5 surface for their named
client/task needs.

## Delivered capabilities

<a id="extract-directly-with-guidelines"></a>

### 9. Extract a project skill directly into unreleased source

**Status:** Complete.
**Goal and scope:** One extraction request yields a reviewable shared skill under
`src/skills/` with concise recognition; generalization and review stay manual.
Publication, client delivery, and particular Donut extractions remain separate.

<a id="generalize-project-guidance"></a>

### 1. Turn a supplied project practice into usable public guidance

**Status:** Complete.
**Goal and scope:** Generalize one practice while retaining its useful behavior.

<a id="reconcile-guidance-on-install"></a>

### 4. Complete one authorized ADR-guidance replacement in Codex

**Status:** Complete.
**Goal and scope:** Replace a borrowed practice while retaining required client project context.

<a id="maintain-skills-without-discovery-rechecks"></a>

### 10. Maintain skills with a minimal shared guideline

**Status:** Complete.
**Goal and scope:** Add or edit skills with a short shared guideline and manual
behavior review; keep surrounding process small.
