# A Cursor session with background work reads Working

**Identity:** SEED-155#cursor-background-work-reads-working
**Source:** [Selected story](../../seeds/SEED-155-cursor-background-work-reads-working.md#cursor-background-work-reads-working)

## Goal and scope

While any background agent belonging to a held Cursor session is still
working, that session reads Working (no Ready-for-review attention). Ready
for review appears only when the parent is at the follow-up prompt and no
background work for that session remains.

Included: Cursor host observation at
`dashboard/server/hosts/cursor/` (and focused proof beside the existing
classification tests), using machine-local subagent transcripts under
`~/.cursor/projects/<workspace-slug>/agent-transcripts/<sessionId>/subagents/`
and the existing shared `working` activity / Working reading.

Excluded: abandoned unfinished transcripts without `turn_ended` reclaim;
inferring background work from parent-screen prose alone; new shared
activities or durable project records; other hosts; story-complete or Mark
as done signals.

Assumptions: the held session's `continuation.workspace` is the path Cursor
used for its project directory; a `turn_ended` record in a subagent jsonl
proves that subagent finished; missing or unreadable transcript trees leave
the parent-screen reading unchanged.

## Architecture and current decisions

PFE: reuse the existing Cursor observation path —
`heldCursorSessionEvidence` → `observeCursorSessions` → shared activities →
`nativeSessionShown` — and extend only the follow-up branch that today maps a
confirmed first instruction to `review`. Do not invent a parallel reading
pipeline or a new activity.

[ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
applies: machine-local evidence supplements the Session entry reading;
missing observation does not invent Working; the dashboard observes without
owning agent cooperation. No Accepted ADR conflict.

Workspace slug for path lookup: the continuation workspace path with `/`
and `.` removed into one segment (observed equal to replacing non-alphanumeric
runs with `-` for the incident and this preparation's workspaces).

## Preparation observations and decisive premises

Observed in this workspace on 2026-10-27 (this preparation's investigation):

1. **Follow-up with confirmed first instruction maps to `review` today**
   (consumed by slice 1). `dashboard/server/hosts/cursor/sessions.ts`
   returns `available(..., "review")` when `held.label` is the follow-up
   label and `firstInput.state === "confirmed"`, with no background check.
2. **Belonging unfinished background work is visible on disk while the
   parent is at follow-up** (slice 1's example). Runner `/sessions` held
   Doughnut `c6df5a96-…` as `at the follow-up prompt` while
   `~/.cursor/projects/Users-terryyin-git-doughnut-worktrees-use-donut-note-context-from-an-https-mcp-client/agent-transcripts/c6df5a96-…/subagents/218e47f0-….jsonl`
   existed without `turn_ended` (minutes old). Completed siblings in the
   same folder carried `{"type":"turn_ended","status":"success"}`.
3. **Shared `working` already reads Working without attention** (slice 1
   reading). `dashboard/src/nativeSessionShown.ts` maps activity `working`
   to label Working, `needsAttention: false`.
4. **Parent-screen alone cannot prove this case** (exclusions). The runner
   ships screen text only for waiting labels; SEED-147 already rejects
   `Working`/`Running` history prose as proof of work.

## Ordered slices

### 1. Follow-up with unfinished belonging subagents reads Working
Type: Behavior
Status: done
Proof: Accepted — `npm run test:dashboard -- dashboard/tests/boundary/cursor-session-classification.spec.ts dashboard/tests/boundary/cursor-session-belonging-subagents.spec.ts --reporter=list` (18 passed). Observations: unfinished belonging → `working`; only `turn_ended` / no subagents / empty / unreadable → `review`; unconfirmed → `awaiting-instruction`; live stop-hint label → `working`; prior idleScreen cases green. Setup: mkdtemp home; stage under `cursorBelongingSubagentsDirectory`. Consumer-trace: reused shared `working` via `observeCursorSessions` → `nativeSessionShown` (Working, no attention).

Behavior: Held Cursor session at the follow-up prompt after a confirmed first
instruction, with any belonging `subagents/*.jsonl` lacking a `turn_ended`
record → shared activity `working` (Working, no Ready-for-review attention).
When every belonging subagent has `turn_ended`, or none exist / the tree is
unreadable → keep today's follow-up reading (`review` or
`awaiting-instruction`). Live parent stop hint stays `working` regardless of
subagents.

## Learnings

- Host `sessions(records, folder, signal)` must not take injected `home` as the
  second positional arg; tests pass `home` only into `observeHeldCursorSession`.
- Belonging observation cases live in sibling
  `cursor-session-belonging-subagents.spec.ts`; production path builder is
  `cursorBelongingSubagentsDirectory`.

## Concern evidence

Slice-plan refinement was not needed: one Behavior slice, one proof loop, and
the common rule (unfinished belonging subagent transcripts override follow-up
`review`) without accumulating special-case recognizers. No remaining
slice-specific concerns.

## Execution complete

Product advice: No product backlog change: delivered follow-up→`working` when any belonging `subagents/*.jsonl` lacks `turn_ended` matches SEED-155 intent and ADR 0008 (machine-local evidence; missing/unreadable trees do not invent Working); deferred abandoned-transcript reclaim and non-Cursor generalization stay out of scope.
