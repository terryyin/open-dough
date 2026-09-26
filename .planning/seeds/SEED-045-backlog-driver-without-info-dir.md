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

### Confirm and repair backlog driver registration when the Git directory lacks `info/`

**Identity:** SEED-045#driver-without-info-dir
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** A backlog merge, rebase, or cherry-pick registers its merge driver
in any repository the product operates on, or the report is shown not to
apply to a supported path.

**Expected behavior:** registering the driver works in a repository whose Git
directory has no `info/` directory, and keeps any existing
`info/attributes` content.

**Actual behavior (possible defect, not yet confirmed on a supported path):**
`ensureDriverRegistered` in
`src/skills/dough-product-backlog/scripts/product-backlog-git-repository.mjs`
(about lines 133–141 at `388bcea`) writes `<git-dir>/info/attributes` with
`writeFileSync` without first creating `info/`. Its callers are the merge,
rebase, and cherry-pick adapters (`product-backlog-git-merge.mjs`,
`product-backlog-git-rebase.mjs`, `product-backlog-git-cherry-pick.mjs`).

**Evidence:** during plan 107 slice 4 (workspace-publication test cost), a
diagnostic run of the workspace-publication family with the Command Line
Tools `git` in place of macOS's `/usr/bin/git` stub failed a claim replay
with `ENOENT` writing `.git/info/attributes`, in a repository initialized
without templates. The normal suite does not hit it, because `git init`
copies `info/` from its default templates.

**Remaining uncertainty:** whether any supported product path creates or uses
a repository without `info/` (for example `git init --template=` with an empty
template, a custom `init.templateDir`, or a host that omits templates), and
which exact product command the claim replay ran.

**Key examples:**

1. A repository whose Git directory has no `info/` → a backlog merge through
   the adapter registers the driver and reconciles the backlog, creating
   `info/attributes`.
2. A repository with an existing `info/attributes` → registration appends its
   line once and keeps the existing lines.
3. If no supported path can produce a Git directory without `info/`, record
   that finding and close the story without a code change.

**Scope:** confirm the behavior first, then repair a confirmed violation with
the smallest change and a reproduction test that fails for the right reason.
Other registration concerns (installing the driver for every checkout) stay
out of scope, as the function's own comment states.

## When to Surface

Next after correction plan 117 in the backlog, per the maintainer on
2026-09-26.

## Breadcrumbs

- Plan 107 slice 4 report and retrospective, recoverable at
  `e67796d:.planning/quick/107-cut-test-work-and-ci-wait/PLAN.md` (Learnings,
  "Slice 4 delivered").
