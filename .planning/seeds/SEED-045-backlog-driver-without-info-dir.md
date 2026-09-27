---
id: SEED-045
status: active
planted: 2026-09-26
planted_during: Plan 107 execution and retrospective (SEED-037#fourfold-local-suite)
trigger_when: A backlog merge, rebase, or cherry-pick runs in a repository whose Git directory has no `info/`
scope: 1 story
---

# SEED-045: Register the backlog merge driver in any repository

## Why This Matters

Agents and developers reconcile the product backlog through Git merges,
rebases, and cherry-picks in their own checkouts and worktrees. Before each
of those operations the backlog adapter registers its merge driver. If that
registration fails, the operation stops with a raw file-system error instead
of reconciling the backlog, which blocks trunk-based collaboration between
parallel agents.

## Stories

<a id="driver-without-info-dir"></a>

### Register the backlog merge driver when the Git directory lacks `info/`

**Identity:** SEED-045#driver-without-info-dir
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planless","assessment":"ready","reasons":[],"basis":{"document":"58c531ce36f80b80e7d9dd4b3f23e454a2c1a3871d842bcaf893ee8611b8782c"}}
```

**Goal:** A developer or agent whose repositories are created without a Git
`info/` directory can still reconcile the product backlog through a merge,
rebase, or cherry-pick, instead of being stopped by a raw file-system error on
every backlog operation. This keeps trunk-based collaboration working for
developers with a common Git setup.

**Confirmed behavior (2026-09-27, Apple Git 2.50.1):** a repository made with
`git init --template=`, or cloned or initialized under an `init.templateDir`
that holds only `hooks/` (the setup pre-commit's `init-templatedir` and
git-secrets recommend), has no `info/`. `ensureDriverRegistered` in
`src/skills/dough-product-backlog/scripts/product-backlog-git-repository.mjs`
then fails with `ENOENT` writing `<git-dir>/info/attributes`, stopping the
merge, rebase, and cherry-pick adapters before Git runs. Linked worktrees are
not a separate case: `git rev-parse --git-path` already resolves to the common
Git directory. No other product script writes into an optional Git
subdirectory.

**Scope:**

- Registering the driver creates the missing `info/` directory and then
  reconciles the backlog as it does in a repository that has `info/`.
- Registration keeps existing `info/attributes` lines and adds its own line
  once; that current behavior must stay intact.
- Proof is one reproduction through the merge adapter in a repository created
  with `git init --template=`. Rebase and cherry-pick share the same
  registration, so they need no separate proof.

**Deferred promises:**

- Installing the driver for every checkout a project has (the registration
  comment already defers this).
- Friendlier reporting of other file-system failures, such as a read-only or
  permission-denied Git directory.
- Verifying repositories created by other Git implementations (libgit2, JGit,
  go-git); the repair covers them naturally, but this story does not test them.
- Isolating the checks' Git environment, which belongs to
  SEED-048#explicit-test-environment.

**Key examples:**

1. A repository whose Git directory has no `info/`, with diverging backlog
   edits on two branches → a backlog merge through the adapter creates
   `info/attributes` with the driver line and reconciles the backlog.
2. A repository whose `info/attributes` already holds other lines → a backlog
   merge keeps those lines and adds the driver line once.

## When to Surface

Next after correction plan 117 in the backlog, per the maintainer on
2026-09-26. Refined on 2026-09-27 for planless execution through bug fixing.

## Breadcrumbs

- Plan 107 slice 4 report and retrospective, recoverable at
  `e67796d:.planning/quick/107-cut-test-work-and-ci-wait/PLAN.md` (Learnings,
  "Slice 4 delivered").
