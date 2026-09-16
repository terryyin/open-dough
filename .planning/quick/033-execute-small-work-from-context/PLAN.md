# Execute small work from a story or contextual instruction

Status: complete; all slices delivered.
Source: [SEED-004 Story 23](../../seeds/SEED-004-extract-and-adopt-project-guidance.md#execute-small-work-from-context).

## Execution identity

- Originating checkout and branch: `/Users/terryyin/git/open-dough` (`main`), claim `9f3a11f5f4a596c42d2b00fc7c55891fe40c6190`
- Execution checkout and branch: `/Users/terryyin/git/open-dough-worktrees/033-execute-small-work-from-context` (`worktree-quick-033-execute-small-work-from-context`)
- Integration target: `main`

## Outcome and scope

A developer can supply a plan, story, or contextual instruction, complete small
planless work in an isolated worktree through main integration, and independently
choose whether an oversized attempt may replan or must return control.

Change shared source guidance and only its directly affected callers/references.
Replace overlapping wording; prefer fewer instructions and no new reference files.
Reuse execution, delivery, and closure. Exclude bug classification/backlog policy
(Story 22), new isolation infrastructure, new numeric defaults, CI redesign,
release, installed-copy edits, and new validation machinery.

## Decisions and existing solutions

- Execution owns source resolution, delegation, worktree identity, and delivery:
  `src/skills/dough-execute-plan/SKILL.md` and `references/delegation.md`.
  Extend the existing planned-worktree path to planless work; do not build a
  second setup routine. Preserve explicit caller-selected current-branch use.
- `references/execution-decisions.md` already owns oversized-slice disposition
  and quick-to-planned continuation. Put the replan choice there, referenced by
  the main loop. `--replan` and `--no-replan` or clear contextual instructions
  choose permission independently of source. Otherwise preserve existing authority;
  neither option authorizes new scope, destructive action, or missing execution.
- `src/skills/dough-story-wrap-up/SKILL.md` owns main integration and resource
  cleanup. Accept context-only intent, identity, changes, and proof in the same
  closure path. The coordinator invokes it after successful branch delivery;
  report integrated completion only after its existing integration obligations.
  Do not add mandatory retrospective to wholly planless work.
- A source instruction may authorize investigation with unresolved expectations.
  Carry its goal and uncertainty, resolve what is needed before changing behavior,
  and permit an evidenced no-change conclusion. No fabricated story, plan, or queue
  entry for an otherwise sufficient instruction. Existing queued stories still use
  Taken normally; stopped Taken work stays there.
- A no-replan stop saves useful evidence in the project's disposable planning
  folder, then removes current attempt-owned unfinished changes. Evidence need not
  run. Leave no abandoned incomplete code/test work elsewhere; preserve unrelated
  work and earlier delivered slices. Ownership/cleanup ambiguity returns to the
  coordinator. Verified-result delivery failures use ordinary recovery.
- Replanning retains compatible work and the same execution identity. Context-only
  work transitions through ordinary source/refinement/planning requirements when
  authorized, carrying prior evidence without inventing completed plan slices.
  Missing authority or a disputed goal returns the precise decision needed.
- Use supplied slice targets, hard limits, and existing exceptions. No new timing
  policy for this implementation story; Story 22 later supplies its attempt limit.

PFE finding: the existing execution, overrun, and closure responsibilities above
fit this outcome; change their input restrictions and share their location rules.
No new coordinator, state registry, or North Star topic is justified. The simpler
current-checkout-only route misses the explicitly requested isolation.

### Applicable decisions

[ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
requires concise executing-agent guidance with one home per rule.
[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md) and AGENTS.md
support representative manual behavior review for this conventional skill change.
[ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md) keeps
source changes separate from release and installed copies.

Human-directed isolation: Terry explicitly requested that small story/instruction
work execute in a worktree and integrate to main on completion, to protect ongoing
work. Record that direction here as the bounded exception to
[ADR 0002 principle 2](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)'s
shared-trunk construction recommendation for this path. ADR 0007 remains Proposed;
this plan neither accepts it nor broadens the exception to unrelated lifecycles.

## Slices and proof

All slices are Behavior, with one manual behavior walkthrough each. Read the
changed guidance as an executing agent and record the decisive paths and outcome
here during execution. This is source behavior review, not a claimed native run.

### 1. Complete a contextual small request through main integration

Type: Behavior
Status: done

Behavior: An authorized small instruction without a story/plan enters the same
planless path as a selected story, runs in an isolated worktree, and reaches main
through existing verification, refactoring, delivery, and coordinator-invoked
closure. Its supplied scope and uncertainty remain the source of truth.

Change: Align source/context gates, delegation, execution identity/location, and
closure input/completion rules in the existing owners above. Preserve planned
inputs and current-branch overrides. An evidenced investigation conclusion with
no change reuses the explained-empty-change path. Check directly affected
retrospective/source references only where they would demand a fabricated artifact.

Proof: Walk a prompt-only correction from entry to closure. Observe the report's
objective passed to implementation, worktree identity retained in context, no
invented story/plan/queue entry, and integration owned by existing wrap-up. Trace
its merge ancestry/push/cleanup conditions before declaring integrated completion.
An existing selected story follows the same path with its established queue identity.

Safe stop: Small work is independently useful; overrun follows existing authorized
planning until the next slice adds the explicit return-without-replanning choice.

Accepted proof:
- Promise: contextual instruction is a first-class Quick source; no fabricated
  story/plan/queue; same Story Branch Mode worktree as a selected story; identity
  retained; evidenced no-change uses explained-empty-change; wrap-up owns main
  integration. Boundary: planless source, isolation, wrap-up-owned integration.
- Command: source walkthrough of changed guidance as an executing agent.
  Setup: authorized small instruction with no story/plan vs existing Backlog
  list story with skip-planning; no current-branch override.
  Locations: `src/skills/dough-execute-plan/SKILL.md` Establish (Quick source
  fields), Take queued work, Choose the execution location, Execute next slice
  1/4, Finish (`## QUICK EXECUTION COMPLETE` is branch delivery); `references/delegation.md`
  passes the established source; `src/skills/dough-story-wrap-up/SKILL.md`
  Resolve/completion/Integrate/push/cleanup/spent-history-when-present.
  Result: pass.
- Command: `git -C /Users/terryyin/git/open-dough-worktrees/033-execute-small-work-from-context diff --check`
  Setup: uncommitted Slice 1 skill edits. Result: pass (empty stdout, exit 0).
- Payload test not run: no payload or dependency-path change.

### 2. Return a bounded attempt without replanning

Type: Behavior
Status: done

Behavior: With replanning disabled, an unfinished attempt exceeds its time/scope
boundary or fails to converge; evidence is preserved in the planning folder,
owned incomplete changes are undone, and control returns without planning or retry.

Change: Add the independent replan choice at entry and use one overrun branch in
execution-decisions; pass it through delegation and resume context. Keep incomplete
attempt handling before delivery. Do not undo earlier delivered work or treat
integration failure as an overrun. Link to existing ownership/cleanup stop rules.

Proof: Walk an inconclusive context-only investigation under `--no-replan` through
its supplied slice limit. Observe knowledge saved before rollback, unfinished
changes removed outside the planning folder, an accurate return, and no invented
backlog action. The same branch applies to a plan or story; a previously delivered
slice and unrelated work remain intact. Inspect the ownership-ambiguity stop rather
than adding a second test harness or a destructive demonstration.

Accepted proof:
- Promise: `--no-replan` (or equivalent) independently of source; evidence saved
  before rollback of owned incomplete work; return without planning/retry;
  delivered slices and unrelated work intact; ownership-ambiguity stop;
  integration failure is ordinary recovery. Boundary: entry, delegation,
  oversized-slice disposition, finish/stop.
- Command: source walkthrough as an executing agent.
  Setup: authorized inconclusive context-only investigation; `--no-replan`;
  supplied slice limit; compare plan/story on the same disabled branch.
  Locations: `SKILL.md` Establish + startup read of Choose replanning permission;
  `references/delegation.md` agent returns incomplete attempt; Execute-next-slice
  3–4; `execution-decisions.md` disabled Refine oversized (project executable-plan
  root, then owned unfinished cleanup; Taken stays Taken); Finish or stop.
  Result: pass.
- Command: `git -C /Users/terryyin/git/open-dough-worktrees/033-execute-small-work-from-context diff --check`
  Result: pass.

### 3. Continue authorized work through planning without restarting it

Type: Behavior
Status: done

Behavior: With replanning authorized, a planless attempt becomes too large; the
ordinary planning workflow continues the same work from compatible changes and
evidence. A planned input uses existing plan refinement instead.

Change: Align the existing quick-to-planned handoff with both story and contextual
sources, retaining identity, input authority, completed proof, and remaining scope.
Apply ordinary canonical-source requirements at the planning boundary; if context
is insufficient, return the missing decision rather than fabricating a source.
Remove obsolete instructions that force all quick overruns into replanning.

Proof: Walk an oversized selected story with replanning authorized into its
remaining-work plan. Observe preserved compatible work, original scope and proof,
same checkout identity, and no duplicate execution. Read the adjacent contextual
source path for the same handoff and ordinary source resolution. Contrast Slice 2's
exit at the single replan decision; do not enumerate a source-by-option matrix.

Accepted proof:
- Promise: authorized replanning continues the same work through ordinary
  planning for a story or sufficient instruction; identity, compatible work, and
  proof retained; missing field/decision returned without fabricating a source;
  Slice 2 no-replan exit unchanged. Boundary: allowed-replan handoff and
  ordinary source resolution.
- Command: source walkthrough as an executing agent.
  Setup: oversized selected story with `--replan`; compare a sufficient
  instruction and a missing-field instruction; contrast `--no-replan`.
  Locations: `SKILL.md` Execute-next-slice 3; `execution-decisions.md` allowed
  Refine oversized; `dough-slice-planning/SKILL.md` Require understood planning
  input; `planning.md` Source; Slice 2 disabled branch contrast.
  Result: pass.
- Command: `git -C /Users/terryyin/git/open-dough-worktrees/033-execute-small-work-from-context diff --check`
  Result: pass.

## Verification and refinement assessment

Promise ownership: source/authority, planless worktree, no-change result, and main
integration belong to Slice 1; no-replan control, evidence preservation, rollback,
and safe return belong to Slice 2; authorized planning continuity belongs to Slice 3.

Use `git diff --check` at each slice. Manually inspect the changed relative links
and applicable entry-to-result guidance. Existing installer/payload tests exercise
installation, which this story does not change; run `bash tests/execution-payload-update.sh`
only if implementation changes a payload declaration or dependency path. Broaden
checks only for an actual changed responsibility or failure. Add no prose snapshot
assertions, new harness, full-suite requirement, or per-host discovery matrix.

Normal execution still applies its independent refactoring and delivery gates;
the manual walkthrough does not replace those. Record only concise proof and
consequential learnings here. Native acceptance and release are not claimed by
source review.

Refinement assessment: three cohesive outcomes, one shared execution path, no
preparatory Structure slices. Slice 1 crosses execution and closure because main
integration is its single promised outcome; splitting at branch delivery would
leave that promise unfinished. Slices 2 and 3 share the existing overrun owner
rather than accumulate source-specific loops. No further slice-specific concern
identified in this assessment; execution is not authorized by this planning request.

## Learnings

- Wrap-up is at the 250-line cap after Slice 1; remaining slices must not grow
  it without shortening in place. Contextual payload fields live in execute-plan
  Establish; delegation defers to that source. CI observer verifies retained
  identity for planless work too.
- execute-plan `SKILL.md` is at the 250-line cap after Slice 2. Evidence for a
  no-replan stop uses this project's executable-plan root (resolved via slice
  planning), not a hard-coded folder in reusable prose.
- Ordinary planning already owned goal/scope/examples. Slice 3 removed the
  leftover story-only gate (“refine the canonical story”). A missing field at
  that boundary returns the decision; `--replan` does not fill it.
  `dough-slice-plan-refinement` still names story or correction as plan source;
  later overrun of an instruction-sourced remaining-work plan stays planned
  refinement of that plan.
