# Land reviewed worktree changes with Dough Land

Status: planned.

Source: [SEED-026#keep-reviewed-worktree-changes](../../seeds/SEED-026-dough-land.md#keep-reviewed-worktree-changes),
refined 2026-09-24. Identity: `SEED-026#keep-reviewed-worktree-changes`.

## Goal and scope

One explicitly invoked `dough-land` skill lands everything in a reviewed owned
worktree on the authorized remote trunk, refreshes the default checkout when
safe, and retires the worktree. Preparation keep and wrap-up retirement use it
with no second description; the execution retrospective writes only in an
owned worktree. Scope, deferrals, and key examples 1–6 are in the seed.

## Architecture and reuse

- PFE: reuse, no new runtime. Publication stays
  [publish the candidate](../../../src/skills/dough-execute-plan/references/publish-the-candidate.md);
  refresh stays
  [refresh eligibility](../../../src/skills/dough-execute-plan/references/maintain-default-checkout.md#refresh-eligibility);
  retirement builds on
  [exploration workspace "Close or retain it"](../../../src/skills/dough-manual-testing/references/exploration-workspace.md).
  Existing wrap-up modules (`closure-resources.mjs`) and preparation test
  fixtures stay where they are.
- Dough Land owns the landing text that is duplicated today: committing the
  whole worktree, sequencing publish → refresh → retire, and the
  containment/ownership retirement rule now split between
  `preparation-workspace.md` "Close or retain the workspace" and wrap-up
  "Remove execution resources safely".
- Follows the North Star topic "Remote publication and default-checkout
  ownership": publication, refresh, and cleanup keep separate results.
  ADR 0006 applies to the new skill's wording.

## Ordered slices

### 1. Retrospective writes its records in an owned worktree

Type: Behavior
Status: done

Behavior: Given an execution in an owned worktree, when its automatic
retrospective records findings or a correction plan, they are written in that
worktree and wrap-up commits them there; given a standalone retrospective
started from the default checkout, it writes in an owned workspace under
`preparation-workspace.md` and reports the pending disposition; a review that
writes nothing creates no workspace; the default checkout is unchanged.
(Seed example 6.)

Change: `finish-or-stop.md` passes the execution worktree path;
`dough-execution-retrospective/SKILL.md` and `process-finding-recording.md`
resolve the write location from it or from the preparation-workspace rule,
which lists the retrospective among its callers.

Proof: guidance assertions in
`src/skills/dough-manual-testing/scripts/workspace-ownership-lifecycle.test.mjs`
(or `ci-completion-lifecycle-guidance.test.mjs`, which already reads these
files) that fail before the change; behavior review walking example 6 under
AGENTS.md. Commands: `node --test --test-concurrency=1 <changed test files>`,
`npm run lint`.

Safe stopping point: no retrospective write lands in the default checkout.

Accepted proof (2026-09-24): `node --test --test-concurrency=1
src/skills/dough-manual-testing/scripts/workspace-ownership-lifecycle.test.mjs
src/skills/dough-execute-plan/scripts/ci-completion-lifecycle-guidance.test.mjs`
→ 7/7; "the execution retrospective writes only in an owned checkout" failed
against the pre-change guidance. `tests/workspace-publication-callers.sh` and
`tests/retrospective-reference-payload.sh` pass. Guidance-structure proof
plus the example 6 behavior review; no automated agent-behavior observation.

Learning for slice 2: `preparation-disposition.md` "Validate a keep
instruction before acting" accepts only preparation and bug-triage records, so
a standalone retrospective record can be reported pending but not yet kept.
Dough Land's keep path must accept it.

### 2. Dough Land lands a reviewed preparation worktree

Type: Behavior
Status: planned

Behavior: Given a reviewed preparation worktree with uncommitted edits and a
sibling change already on remote trunk, when the developer invokes
`dough-land`, every edit is committed, reconciled, and published; the default
checkout is refreshed, or reported deferred when it holds a pending edit; the
clean worktree and branch are removed once trunk contains the tip; a rejected
push keeps everything and a rerun publishes once; missing worktree or target
context stops before committing. (Seed examples 1–4.)

Change: new `src/skills/dough-land/SKILL.md` with an explicit-invocation-only
description. `preparation-disposition.md` "Keep and publish" and "Resume an
interrupted keep-and-publish" become a link to Dough Land (preparation keeps
its keep/leave/discard decision and its "what keep does not do" limits);
`preparation-workspace.md` close section keeps its confirmation triggers and
links Dough Land's retirement rule; update callers
(`dough-bug-fixing/SKILL.md`). Promote in `install.sh` `managed_files`,
because released preparation guidance now links the skill.

Proof: extend `src/skills/dough-story-refinement/scripts/preparation-publication.test.mjs`
(and `-resume`) for whole-worktree commit, deferred refresh, retained
resources after rejection, and single publication on rerun; update guidance
assertions in `workspace-ownership-lifecycle.test.mjs`; behavior review of
examples 1–4. Commands: `bash tests/workspace-publication-callers.sh`,
`npm run lint`, then `npm test` for payload checks.

Safe stopping point: the skill and preparation caller give a useful landed
keep; wrap-up still works unchanged.

### 3. Wrap-up retires execution resources through Dough Land

Type: Behavior
Status: planned

Behavior: Given a Trunk Mode or Story Branch closure whose final publication
is accepted, when wrap-up retires resources, it applies Dough Land's
retirement rule with its CI completion gate: the worktree stays until the
completion receipt and confirmed shutdown; a Story Branch remote branch is
deleted only after trunk contains its tip; results are unchanged from today.
(Seed example 5.)

Change: wrap-up "Remove execution resources safely" and the cleanup paragraph
of `trunk-publication.md` "Publish wrap-up closure" link Dough Land's
retirement and refresh sections with the gate. Wrap-up keeps completion
judgment, assimilation, before-cleanup and final commits, and its
publications through `trunk-publication.md`, whose ordering and observer
registration Dough Land does not take on.

Proof: `bash tests/closure-publication.sh` stays green (preserved behavior);
guidance assertions in `ci-completion-lifecycle-guidance.test.mjs` updated to
the linked rule and failing if a second retirement description returns.
Commands: `bash tests/closure-publication.sh`,
`node --test --test-concurrency=1 src/skills/dough-execute-plan/scripts/ci-completion-lifecycle-guidance.test.mjs`,
`npm run lint`, `npm test`.

Safe stopping point: one landing description serves all three callers.

## Current decisions

- Wrap-up shares Dough Land's refresh and retirement instead of invoking the
  whole skill: it must publish before deleting history, register each SHA
  with its CI observer, and integrate Story Branch history, which Dough Land
  does not own.
- The retrospective fix is slice 1 because it is small, independent, and
  stops the current default-checkout writes soonest.
- Worktree ownership comes from context; no ownership record is added.
