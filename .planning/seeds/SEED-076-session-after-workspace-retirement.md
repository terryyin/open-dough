---
id: SEED-076
status: active
planted: 2026-10-01
planted_during: Terry's recurring dashboard attachment failure after landing
trigger_when: A dashboard session's saved workspace is retired while its conversation remains retained
scope: story
---

# SEED-076: Session access after workspace retirement

## Why This Matters

Terry receives a review alert after an agent lands its work, but opening the
session leads to an empty terminal and an attachment failure. Developers need
truthful session availability and access to the result after ordinary worktree
retirement. Conversation history and a resumable terminal are different facts.

## Story

<a id="session-after-workspace-retirement"></a>

### Show truthful session access after its workspace is retired

**Identity:** SEED-076#session-after-workspace-retirement
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** A dashboard developer can understand and review a session's result
after landing removes its workspace, without being directed to a terminal that
cannot start in that workspace.

**Expected versus actual:** Landing may safely retire an owned worktree. The
dashboard should explain that retirement and offer a supported way to review
the retained result. Today it labels the retained conversation Ready for review
and offers Open terminal, which fails because the saved directory is absent.

**Evidence (2026-10-01):**

- Doughnut refinement session `01a0f713-8a12-75b3-980b-998b1a3841f8`,
  SEED-063#story-2, reports landing at `a5df85d90ab33cfaf03ee9d2c065e53d2fbd06fe`
  and removing its worktree and branch in its final message at 19:06:07
  Singapore time. The user explicitly requested landing in that conversation.
- The native conversation remains readable with status notLoaded. Its task was
  not deleted. The directory
  `/Users/terryyin/git/doughnut/.worktrees/existing-numbered-property-keys-become-one-list`
  is absent.
- The machine launch record retains that directory in continuation.workspace
  and the resume command. It has no doneAt marker; this example does not prove
  that a previously recorded marker was lost.
- `dashboard/server/hosts/codex/sessions.ts` classifies notLoaded with a
  completed latest turn as available/review, without checking the continuation
  directory. `terminal.ts` uses that directory as both PTY cwd and resume --cd.
- The earlier concurrent-record repair preserves done marks; it does not
  reconcile workspace retirement with retained conversation availability.

**Acceptance examples:**

1. A saved conversation has a completed landing turn and a missing workspace.
   Refresh and select it: explain workspace retirement rather than offering an
   apparently available terminal followed by the generic attachment error.
   Preserve the conversation identity and its result for review.
2. A conversation has a completed turn and an existing workspace. Preserve its
   ordinary review alert and terminal continuation behavior.
3. A workspace lookup fails without establishing absence. Preserve uncertainty;
   do not claim deletion, completion, or manufacture a done mark.
4. Mark as done still suppresses attention across later observations and
   concurrent updates. Retirement alone does not prove the story is complete:
   this refinement intentionally left its story not ready.

**Scope:** Reconcile saved workspace availability, session presentation and the
supported review action. Preserve native history, deliberate worktree cleanup,
and unrelated stories. Do not recreate a retired directory or silently resume
in a different project location.

**Open decisions:** Choose how the dashboard exposes a retained result when no
terminal can attach: history/result view, or an explicit navigation to the
existing Codex conversation. Any continuation in a different workspace needs
an explicit product contract and native evidence. Review attention should lead
to a usable review surface, rather than simply hiding an unread result.

**Effort hypothesis:** M, medium confidence. A coherent fix involves the
availability model, UI actions and a real observation-to-review regression;
the review surface contract is unresolved. It is beyond an established
ten-minute repair. No implementation or executable plan is included.

**Coordination:** SEED-069 reviews this same lifecycle boundary but explicitly
defers implementation. This defect story does not change its Taken scope or
interrupt that review. SEED-072 owns pending startup, not post-landing retirement.

## Breadcrumbs

- [Existing attachment limitation](../../docs/dashboard-session-troubleshooting.md)
- [Architecture review](SEED-069-review-dashboard-multi-tool-architecture.md#review-dashboard-multi-tool-architecture)
- Terry's screenshot and recurrence report in this conversation.
