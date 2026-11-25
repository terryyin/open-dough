---
id: SEED-437
status: active
planted: 2026-11-25
planted_during: Split of SEED-430 into independently verifiable published reads
trigger_when: selected from the product backlog
scope: one story
---

# SEED-437 — Discover a project's default branch through Git

<a id="discover-project-default-branch-through-git"></a>

### Discover a project's default branch through Git

**Identity:** SEED-437#discover-project-default-branch-through-git
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal.** A developer adding a project can validate access to origin and
use its current default branch even when the local checkout tracks a
different branch.

**Scope to refine.** Use the same authenticated Git transport as the
published project refresh to check access and resolve symbolic `HEAD`.
Keep the execution-checkout origin check. Preserve recovery when access is
refused or a usable default branch is unavailable.

**Evaluation.** Add a project whose local checkout differs from the remote
default and observe that the Board uses the symbolic branch origin advertises.
Show that an access refusal leaves the project unconfigured and tells the
developer how to retry. Verify both through Add Project without a repository
metadata API call.

**Source.** Split from [SEED-430](SEED-430-read-published-project-data-from-local-git.md).
Begin with [Add Project](../../dashboard/server/projectAddition.ts).
