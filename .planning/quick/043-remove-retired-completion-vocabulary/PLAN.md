# Remove retired completion-list vocabulary from story wrap-up

## Source and provenance

- Reviewed story: `SEED-004#drop-recently-done-from-product-backlog` at
  `.planning/seeds/SEED-004-extract-and-adopt-project-guidance.md`, recoverable
  at commit `30a5026`.
- Reviewed implementation commit: `30a5026` — the uncontaminated quick execution
  that removed the completion section from the canonical product backlog and
  expressed `dough-product-backlog` as an active-work convention.
- Current finding: `src/skills/dough-story-wrap-up/SKILL.md` still resolves and
  deletes `finished-history` / `recently-done` entries and describes their absence
  through negated archive vocabulary. Its recognition record carries the same
  retired concept. These references predate `30a5026`; the reviewed execution
  exposed the whole-product inconsistency rather than introducing it.

## Correction outcome

A developer using story wrap-up receives one coherent active-work lifecycle:
completed work leaves **Taken** or **Backlog list**, spent execution material
leaves the current snapshot, and Git remains the recovery mechanism.

## Scope and preserved behavior

- Express `dough-story-wrap-up` source and recognition in terms of active backlog
  entries, current product knowledge, spent-material deletion, and Git recovery.
- Remove the retired completion-list concepts and vocabulary from those current
  published sources and their behavior-review cases.
- Preserve completion checks, follow-up queueing, product-review decisions,
  before-cleanup and final-closure commits, canonical story/plan/evidence cleanup,
  process-log occurrence cleanup, link repair, worktree integration, and safe
  resource cleanup.
- Preserve the active `dough-product-backlog` convention delivered by `30a5026`.
- Release, managed-copy synchronization, native-host acceptance, and cleanup of
  completed planning artifacts remain separately owned lifecycle work.

## Outside-in proof

- A representative completed feature story linked from **Taken** closes through
  wrap-up: the active entry and spent story material leave the current snapshot,
  maintained product knowledge remains, and the before-cleanup Git revision
  recovers the deleted material.
- A representative authorized standalone backlog removal still leaves the seed,
  plan, and proof available for later wrap-up.
- Focused source inspection finds the current active-work vocabulary in
  `dough-story-wrap-up` skill and recognition and finds none of the retired
  completion-list vocabulary.
- Existing focused story-wrap-up and product-backlog behavior checks remain
  green where their boundaries are unchanged; affected maintained checks are
  updated to assert the current convention.

## Current decisions

- This is one bounded whole-concept correction across the story-wrap-up runtime
  instruction and its maintainer recognition record.
- Git history is the sole recovery surface for deleted completion history.
- Current published guidance states the remaining lifecycle positively.
- The correction changes no product direction or backlog priority.

## Slice

### 1. Close completed work through the active backlog model

Type: Behavior
Status: done
Proof: Representative wrap-up evidence shows active-entry and spent-material
removal with Git recovery; focused source and maintained checks demonstrate one
positive active-work convention across product-backlog and story-wrap-up.

Behavior: Given completed selected work with an active backlog entry, when story
wrap-up closes it, then the current snapshot retains maintained product knowledge
and active work while Git retains recoverable execution history.

## Learnings

- Story 17 corrected the product-backlog source in one quick execution, but the
  same retired completion-list concept remains in the adjacent story-wrap-up
  representation. Whole-product review supplied the cross-skill evidence.

## Execution context

- Authorized direct execution on the existing `main` checkout at
  `/Users/terryyin/git/open-dough`; delivery destination `origin/main`
  (`terryyin/open-dough`).
- Source-only Markdown correction; no generator or managed-copy update applies.
  Focused proof is the representative authoring review required by AGENTS.md,
  with `git diff --check` for whitespace. No numeric slice budget is supplied.
- Repository tooling runs directly. `npm run format` is repository-wide and
  targets JavaScript/JSON/shell only; the changed Markdown has no formatter
  target. No active pre-commit hook is configured. Use a scoped whitespace
  check for this prose change rather than altering unrelated tooling.
- CI observer: coordinator task 043, checkout above, workflow `ci.yml` / `CI`,
  branch `main`, cell `12`, session `70567`, PID `70550`, receipt directory
  `/tmp/dough-ci-501/watch-KJgT26`; status: stopped.
  Stop receipt and terminal process exit confirmed; unread events: 0;
  `pendingCi: unobserved`.

## Slice delivery evidence

- Updated only the story-wrap-up source and recognition record. The source now
  resolves and removes the selected entry from **Taken** or **Backlog list**,
  with Git as the sole recovery surface and maintained product content carrying
  lasting knowledge.
- Representative invocation, missing-context safeguards, completed-work closure,
  and standalone backlog removal were reviewed. The recognition record retains
  the outcome; [walkthrough evidence](evidence/WALKTHROUGH.md) records the
  disposable Git-mechanism demonstration. This does not claim native-host
  acceptance.
- Focused source inspection passed: both changed sources contain the active-list
  and sole-recovery wording, with none of the retired terms specified by this
  correction. Existing wrap-up recognition cases remain applicable; there are
  no focused executable wrap-up/backlog behavior tests in this repository.
- Independent dough-post-change-refactor review: none — already clean;
  `## REFACTOR COMPLETE`. No edits or repeated tests needed. Completion checks,
  follow-ups, product decisions, commits, cleanup, links, and worktree safeguards
  remain intact.
- Markdown formatting reviewed selectively; `git diff --check` passes. No active
  commit hook exists, so no hook-owned lint command applies to this change.
- Retain this completed plan, evidence, and Taken entry for retrospective and
  subsequent story wrap-up. Release and installed-copy updates remain separate.

Delivery: implementation commit `a5da136` pushed to `origin/main`. CI observation
ended after delivery without waiting for pending runs.

## Retrospective

Completed in the execution conversation on 2026-09-11, reviewing `a5da136`
and `674686e` against the original correction contract. No unresolved
implementation findings or follow-up correction plan. Product recommendation:
retain existing priorities. Process findings DD-006 and DD-007 are recorded in
DearDough.md. Native-host acceptance and CI results were not established by
this retrospective. The user authorized committing those findings and story
wrap-up.
