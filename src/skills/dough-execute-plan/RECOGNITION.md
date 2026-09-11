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
