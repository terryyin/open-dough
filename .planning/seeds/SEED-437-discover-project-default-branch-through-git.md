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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/843-discover-project-default-branch-through-git/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"0483c98201dd6b5ce43b4b372303b31e7620e511ae7e7d7851c519ed7b0dad2a","plan":"0b11bbbdb8bfebbcbda907e18104f7dca6adbfe3e362e4c8947285a354e856de"}}
```

**Goal.** A developer adding a project can validate access to origin and
configure the Board on that repository's current default branch even when
the local execution checkout tracks a different branch.

**Scope.**

- After the existing execution-checkout root and origin-match checks, Add
  Project uses the same authenticated Git transport as published project
  refresh (`gh auth git-credential`, non-interactive) to check origin access
  and resolve symbolic `HEAD` to the branch name origin advertises as
  default. That name becomes the configured `ref`.
- Keep the execution-checkout checks that refuse a missing folder, a path
  that is not the checkout root, or an origin that does not match the entered
  GitHub repository.
- When access is refused or a usable default branch cannot be resolved, leave
  the project unconfigured and tell the developer how to retry. Do not save a
  partial configuration.
- Do not discover the default branch through the GitHub repository metadata
  API (`gh api … .default_branch`). Board open, Refresh, and other published
  readers stay with their own stories; this story only changes Add Project's
  access check and default-branch discovery.

**Key examples.**

- Given an accessible origin whose symbolic `HEAD` names `release+stable`
  while the execution checkout is on another branch, add the project. The
  saved configuration's `ref` is `release+stable`, the Board uses that
  branch after add and after restart, and Add Project makes no repository
  metadata API call for the default branch.
- Given an origin that refuses access, submit Add Project. The project is
  not configured, and the developer is told how to check access and retry.
- Given an accessible origin that does not advertise a usable default
  branch, submit Add Project. The project is not configured, and the
  developer can retry after the repository has a usable default.

**Source.** Split from [SEED-430](SEED-430-read-published-project-data-from-local-git.md).
Begin with [Add Project](../../dashboard/server/projectAddition.ts).
