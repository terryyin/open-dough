# Recognition: dough-execute-plan

Review: ready for maintainer review

## Original clues

`execute-plan` at `.agents/skills/execute-plan/SKILL.md` in the supplied source checkout.
Provenance does not determine replacement suitability.

## Purpose

Executes slices in a plan for one selected story or bounded correction, or an
explicitly selected canonical story as one quick slice without a plan, taking
queued work before coordinator-owned delivery and asynchronous CI repair.

## Triggers

Execute plan, run plan, execute slices, or explicitly execute a canonical story
without slice planning. Ordinary execution requires a plan. Quick execution
requires both the current skip-planning instruction and an understood canonical
story; the seed alone is not executable.

## Distinguishing behavior

After execution-source context and execution authorization are resolved, a queued entry
moves to **Taken** as execution's first project-state change. Resume recognizes
an already-taken entry, and work absent from both active lists is not fabricated.
Fresh implementers and independent refactor; proof reuse; owned staging; one
observer per execution; durable owner-bound notifications;
pause/stash/repair/resume; exact shutdown.

## Client project context

Selected executable plan or canonical quick story and conversation, budgets,
proof and formatting commands, Git authorization, client hooks, generation
triggers, subsystem policy, Node/gh, workflow selection, and current host bridge.

## Differences that rule out replacement

Synchronous CI gates, per-SHA observers, worker-owned commits, or workflows without an independent refactor pass are not equivalent. Automatic source coexistence-rule activation is not installed.

## Validation needed

Representative invocation-context, required-client-context, and useful-outcome
walkthroughs are recorded in
[the extraction review](../dough-execute-plan/EXTRACTION.md#representative-behavior-review).
Native behavior and host integration, plus installation/update/coexistence
checks, are recorded in the [execution acceptance review](../../../.planning/quick/027-execution-native-acceptance/README.md).
The review retains failures, the Codex adapter corrections, and validation limits.
See the extraction review for dependency disposition and source differences.
Source integrity is recorded in
[SOURCE-CHECKSUMS.json](../dough-execute-plan/SOURCE-CHECKSUMS.json).

The 2026-09-10 source review walked authorized first execution, resume, missing
authorization, and work not selected from the backlog. Only authorized first
execution moved the existing queued entry, before plan-state or implementation
changes. Resume and non-backlog execution did not duplicate or invent entries;
missing authorization stopped with the queue intact. The human explicitly
skipped new native acceptance, so the earlier native review remains evidence
for the unchanged delivery machinery only.

## 2026-09-11 worktree claim behavior review

**Candidate identity:** uncommitted Slice 1 revision of `SKILL.md` based on
`48f9b81127f3f617847fb87eb2000976e8e8cba9` on
`codex/plan-042-worktree-execution`.

**Input:** a disposable Git repository on `main` with one existing **Taken**
entry, one selected queued story and plan, one unrelated queued story, and a
local bare `origin`. The initial commit
`0d971324b28c625b8f0cc46758ecd751b7d7486d` was pushed before the walkthrough.
Execution was authorized in worktree mode; the walkthrough stopped at the claim
boundary before creating a branch or worktree.

**Actions:** applied the candidate guidance's read-only preflight, moved the
selected entry unchanged to the end of **Taken**, staged only `BACKLOG.md`,
inspected the staged diff, and made local commit
`9a133a6f2d3227b9126d0a369f18fe0fafa25a77`. Inspected branch, parent, changed
paths, local and remote refs, backlog membership, and worktree/branch listings.
Repeated the boundary with the selected entry already **Taken**, absent from
both lists, and still queued while unrelated `PLAN.md` content was staged.

**Observations:** the Taken-only commit remained on `main`, had the pushed
baseline as its parent, and changed only `BACKLOG.md`; `origin/main` remained at
`0d971324b28c625b8f0cc46758ecd751b7d7486d`. The existing **Taken** entry kept
its order, the selected entry appeared once after it, and the unrelated queued
entry remained queued. No execution branch or added worktree existed. The
already-Taken repeat kept the two-commit tip unchanged and clean. The absent
repeat made no execution change or empty commit. In the ambiguous staged-state
repeat, preflight observed only staged `PLAN.md`; `BACKLOG.md`, the one-commit
tip, and `origin/main` stayed unchanged, so no unrelated content entered a
Taken-only commit.

**Assessment and limitations:** the candidate supplies a useful outcome for an
authorized worktree-mode invocation and truthful stops for ambiguous ownership,
while preserving the existing already-Taken and absent-entry meanings. This was
a manual disposable-repository behavior review of the guidance and ordinary Git
assumptions, not native Codex, Cursor, or Claude Code compliance evidence. It
did not create a worktree or exercise post-claim setup failure; those boundaries
remain with the later execution-location slice. Native behavior proof for this
revision remains pending under ADR 0005 and the selected story's deferred
acceptance work.

## 2026-09-11 planned-execution location behavior review

**Candidate identity:** uncommitted Slice 2 revision of `SKILL.md`,
`references/delegation.md`, `references/wrap-up.md`, and
`references/ci-monitor.md`, based on
`8a1be3c88a1c0acf593079b2eb67d74f560965c1` on
`codex/plan-042-worktree-execution`.

**Input:** a disposable repository at
`/private/tmp/od-slice2-walk.jVFjoJ` with `main`, a selected plan and queued
story, unrelated backlog content, and local bare `origin`. Baseline
`85f57ced62c99316a64729447c6f5dc5e9443cc1` was pushed before execution. The
worktree-mode variant had a recorded Taken-only commit
`7269938e1b481bae58b4dc43df0626edc1a88da5`. Separate clones represented an
explicit planned current-branch selection and a planless quick selection.

**Actions:** before editing the candidate, inspected the existing current-branch
fixture as regression context. For the default variant, created
`codex/selected-story` and `/private/tmp/execution` from the claim, recorded the
originating checkout, execution checkout and branch, and `main` integration
target in the existing plan, then committed and pushed ordinary implementation
on the execution branch. Inspected the originating and execution checkouts
separately, then simulated resume by validating the recorded path, branch, claim
ancestry, and worktree listing without creating another worktree. For the
override and quick variants, committed their execution edits in their current
checkouts without `git worktree add`. Finally attempted setup at the occupied
execution path and checked a deliberately contradictory expected branch.

**Literal observations:** the walkthrough used `git status --short`,
`git diff --name-only HEAD^ HEAD`, `git log --oneline --all`,
`git worktree list --porcelain`, and `git branch --list` in each relevant
checkout. Default delivery produced execution tip
`df3ff5b069ad9fdb48bba679251b0154ab48f663`, changed only `PLAN.md` and
`app.txt`, and pushed `origin/codex/selected-story` to that tip. The originating
checkout stayed at the claim and `git show HEAD:app.txt` returned only
`baseline`; `origin/main` stayed at the baseline. Resume returned
`/private/tmp/execution`, `codex/selected-story`, and the same execution tip;
`git merge-base --is-ancestor
7269938e1b481bae58b4dc43df0626edc1a88da5 HEAD` succeeded and the two-entry
worktree listing was unchanged. At completion,
`git merge-base --is-ancestor
df3ff5b069ad9fdb48bba679251b0154ab48f663 main` exited 1, while the execution
directory and `codex/selected-story` branch remained present, demonstrating
retention before separately invoked closure.

The explicit-current variant committed `PLAN.md` and `app.txt` at
`2e781d6d0d1398896df72dc15bb346396e47523a` on its current `main`; its
`git worktree list --porcelain` contained only that checkout. The planless quick
variant committed only `app.txt` at
`5c027760cedb0b9ef3cb49ff8678d4d0af2ed243` on its current `quick/local` branch
and likewise had one checkout, so it did not inherit planned worktree creation.
The occupied-path setup printed `fatal: '/private/tmp/execution' already
exists` after creating only the partial local branch `codex/setup-retry`; the
claim, completed execution checkout, and both branches were retained and
reported. The contradictory identity check reported expected
`codex/wrong-identity` versus actual `codex/selected-story`; a second
`git worktree list --porcelain` showed no nested or replacement worktree.

**Assessment and limitations:** the candidate makes default planned isolation,
explicit current-branch execution, quick-path preservation, resume validation,
execution-checkout propagation, normal execution-branch delivery, and retained
completion state actionable through one shared identity. Setup and identity
failures preserve recoverable resources instead of guessing. This manual Git
walkthrough validates the representative useful outcome and ordinary Git
assumptions, not native Codex, Cursor, or Claude Code compliance. It did not run
retrospective, story wrap-up, target integration, cleanup, or CI repair;
`git show <before-cleanup-commit>:DearDough.md` was therefore not relevant to
this slice. Native behavior proof remains pending under ADR 0005.
