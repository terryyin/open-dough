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

<a id="run-standalone-manual-testing-in-isolated-execution"></a>

### 23. Run standalone manual testing from a stable temporary work branch

**Status:** Refined; queued and planned.
[Slice plan](../quick/054-stable-temporary-manual-testing-workspace/PLAN.md).

**Goal:** A developer who explicitly requests manual or exploratory testing
as a standalone activity can conduct checkout-bound preparation and observation
from one stable temporary Git branch and worktree, without changing or depending
on the developer's originating checkout.

**Current gap:** The manual-testing guidance allows temporary harnesses and tests
and asks the agent to preserve isolation, but it does not establish a workspace
identity or lifecycle for a standalone session. Preparation can therefore mix
with the developer's working branch, and a resumed session can observe a different
checkout state from the one it prepared.

**Why now:** Real use exposed this missing standalone workspace boundary. The
smallest response is to make the testing session's checkout stable and disposable,
without turning manual testing into a development or delivery lifecycle.

**Scope:** When a standalone manual-testing session needs a project checkout,
create a dedicated temporary branch and paired worktree from a verified starting
revision before checkout-bound setup, temporary harness work, or observation.
Retain that branch, worktree, and starting revision as the session identity and
use the same workspace throughout preparation, exploration, reporting, and any
resume. Verify and reuse a matching retained workspace rather than nesting or
silently replacing it.

An explicit caller-supplied checkout remains authoritative. Manual testing owned
by a UAT story, active plan slice, or another workflow with an established
checkout continues there and does not create a nested temporary workspace. On
normal completion, remove session-owned temporary artifacts and then remove the
clean temporary worktree and branch. When interruption, unresolved evidence, or
unsafe cleanup requires retention, preserve and report the exact workspace so it
can be resumed or deliberately disposed of later.

**Key examples:**

- Given an explicit standalone manual-testing request with no story, plan, or
  location instruction, the session creates a temporary branch and worktree from
  the verified current revision before preparing a temporary setup scenario. All
  preparation and observation use that workspace; the originating checkout is
  unchanged.
- Given that standalone session is interrupted after preparation, resumption
  verifies and reuses the recorded branch and worktree rather than creating a new
  workspace whose state may differ.
- Given manual testing required by an active UAT story or plan slice, or an
  explicit caller-selected checkout, testing uses that checkout and creates no
  nested temporary branch or worktree.
- Given a completed standalone session whose temporary artifacts can be removed
  safely, cleanup removes those artifacts, the worktree, and its temporary branch.
  If cleanup is unsafe, the session reports and retains the exact workspace.

**Boundaries:** This story owns only the temporary Git branch/worktree lifecycle
for standalone manual testing. It does not invoke or change `dough-execute-plan`,
move backlog work, commit or publish product changes, integrate with trunk, start
CI observation or retrospective work, diagnose or repair findings, or turn a
temporary harness into permanent product or test code. A Git workspace does not
isolate shared accounts, services, databases, or other external test state; their
existing environment and cleanup rules remain authoritative. It adds no general
workspace manager and does not change testing already owned by another workflow.

**Safe stopping point:** A standalone checkout-bound testing session has one
stable, recoverable, and disposable temporary work branch, while its originating
checkout and all testing owned by other workflows remain unchanged.

<a id="proudly-found-elsewhere-design"></a>

### 19. Strengthen architectural review after using the lightweight guidance

**Status:** Decomposed; deferred and not refined.

**Goal:** A developer gets useful architectural corrections and maintained
direction from normal review after the initial PFE and North Star guidance has
been used, without accumulating duplicate review work or stale instructions.

**Scope candidate:** Carry the remaining broader architecture-review work here:
review PFE use, whole-product domain cohesion, and North Star alignment in
post-change refactoring and execution retrospective; propose evidence-backed
corrections or direction updates; refine lifecycle handling where actual use
shows the minimal flow insufficient. Consider broader refactoring-authorization
alignment only for a demonstrated obstacle. Basic planning, execution stops,
coordinator updates, and ordinary retirement are already delivered by the
lightweight guidance. Do not assume every candidate extension is worth
implementing.

**Evaluation:** From actual use of the lightweight guidance, identify a concrete
missed architectural issue or unnecessary process step; refine this story around
a review result or simplification the developer can evaluate. Existing review
that already supplies the outcome is evidence to drop that extension.
**Depends on:** Evidence from using the delivered lightweight guidance. Its
completed source contract and plan are recoverable at
`7f672bf:.planning/seeds/SEED-004-extract-and-adopt-project-guidance.md` and
`7f672bf:.planning/quick/044-lightweight-pfe-and-direction/PLAN.md`.
**Safe stopping point:** Any selected review improvement delivers its own useful
correction or reduced burden; no further process rollout is required.
**Effort hypothesis:** Uncertain until a concrete review gap is observed; no
S/M/L estimate without repository definitions and a refined outcome.
**Deferred decisions:** Which remaining extensions are justified, their concrete
examples, and the final bounded delivery scope. Tracking machinery, mandatory
per-story documents, partial wrap-up, and early termination remain excluded.
