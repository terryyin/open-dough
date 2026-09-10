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

## 2026-09-11 quick-entry authoring walkthrough

The representative case used an understood canonical story whose sole behavior
was moving its existing queued entry to **Taken**, plus an explicit current
instruction to execute it without slice planning. At the invocation boundary,
the revised skill selected the story as one quick slice only after resolving
both inputs and execution authority. Queue handling then moved the existing
entry as execution's first project-state change; an entry already in **Taken**
remained in place on resume, and work absent from both active lists produced no
new entry.

The proposed quick journey passes the story, explicit skip-planning instruction,
and relevant conversation to delegation. It accepts story-mapped proof, supplies
the plan path to independent refactoring only when one exists, skips the
plan-update delivery step, then retains the ordinary generator, selective
formatting, owned staging, hook, commit, push, CI repair, and observer-shutdown
gates. Runtime setup and the Codex adapter keep the quick observer handle in the
conversation rather than requiring an active-plan note. The destructive
later-outcome check reads the canonical story when no plan exists. No step
creates a plan, completion note, project summary, or substitute execution
record; the successful chat ends with the quick completion marker only after
delivery and shutdown.

The missing-authorization and missing-canonical-story variants both stop before
the backlog transition, delegation, or implementation. A seed by itself does
not authorize execution. The ordinary variant, with no explicit instruction to
skip slice planning, still requires its executable plan, reads slice status from
that plan, updates it during delivery, and uses the existing planned completion
marker. A quick attempt that ceases to fit one coherent slice inventories and
preserves owned work and proof, reports its safe stop in the conversation, and
does not create a plan on that path.

This is a local source-authoring walkthrough under the repository's behavior
review, not native acceptance. Existing native evidence establishes only the
unchanged delivery mechanisms. Quick-entry behavior remains pending for Codex,
Cursor, and Claude Code under [SEED-010 Story 2](../../../.planning/seeds/SEED-010-learn-from-execution-retrospectives.md#use-released-retrospective-log)
before any affected release.

## Quick 040 Slice 3 local behavior evidence

Walked an explicitly authorized quick attempt that failed to converge as one
slice. The fixture contained one completed compatible behavior with focused
proof, attributable incomplete edits, an unrelated pre-existing edit, and the
story's existing **Taken** entry.

1. **Safe stop and ownership.** The transition inventory retained the completed
   behavior and proof, preserved the unrelated edit, and parked or reverted only
   the attributable incomplete edits. The **Taken** entry stayed in its existing
   position. A variant whose overlapping edit had unclear ownership stopped its
   disposition and dependent planning for human judgment.
2. **Ordinary planning and resume.** With story scope unchanged and the original
   instruction authorizing continued execution, ordinary slice planning received
   the canonical story, relevant chat evidence, completed work and proof,
   incomplete-change disposition, elapsed time, and failed sizing assumption. It
   planned only remaining work: no earlier planned slice, duplicate Taken entry,
   substitute quick record, or second execution history was created. Planned
   delegation began at the preserved completion boundary and reused unchanged
   proof instead of repeating completed work.
3. **Human-owned scope.** A variant where the new evidence changed the story's
   scope stopped before affected planning and routed through story refinement for
   the human decision. A disputed-constraint variant used the existing plan
   conflict handoff. Complexity by itself granted neither change.

This is local Proposed-source review under ADR 0005, not native acceptance.
Native quick-to-planned transition behavior remains pending for Codex, Cursor,
and Claude Code under [SEED-010 Story 2](../../../.planning/seeds/SEED-010-learn-from-execution-retrospectives.md#use-released-retrospective-log).
