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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/201-session-after-workspace-retirement/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"0c69cef16a96168e1b803f854aebfa4b3fc90a16559716e6aa9fb2d34beaa49f","plan":"dc6bcedfb9d29d1b7cd22d9d2f587be8c0d896157ae60a349522594bfe6964b4"}}
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

**Scope:**

- **Required:** Distinguish retained conversation availability, saved workspace
  availability, native activity, and the developer's done mark. A completed
  turn can need review even when its workspace no longer exists; none of these
  facts establishes completion of the associated story.
- **Required:** When the saved workspace is confirmed absent, explain that it
  is unavailable for terminal continuation and provide a usable way to review
  the retained result. Preserve the host and conversation identity, project and
  story association, and review attention until the developer marks it done.
  Apply this consistently wherever the dashboard offers access to that session,
  including its story card, Recent sessions, and Sessions sidebar.
- **Required:** Recheck the saved workspace when terminal attachment is
  requested, so retirement after a previous observation produces the specific
  explanation instead of an empty terminal and generic attachment failure.
- **Required:** Keep native history and ordinary worktree retirement intact.
  Existing workspaces retain current review alerts and terminal continuation.
  An existing directory is a prerequisite, not proof that attachment will
  succeed for other reasons.
- **Required:** A failed or inconclusive lookup preserves uncertainty and
  explains the limitation. Confirmed absence alone does not establish why the
  directory disappeared; describe retirement as established only when supported
  by evidence. A result-read failure likewise leaves the retained identity and
  attention intact and reports that review is currently unavailable.
- **Rejection constraints:** Do not recreate the missing directory, silently
  substitute another workspace, create a replacement conversation, or
  manufacture a done mark. These constraints preserve the seed's saved-context
  and explicit-completion contract; review is access to the existing result.
- **Deferred promises:** Continuing work from a different workspace, repairing
  endpoints or other attachment failures, a general conversation browser,
  adding Cursor support, and implementing SEED-069's architecture recommendations.
  This story does not require a new history view for sessions whose existing
  review access already works.
- **Boundary assumption:** The demonstrated failure is Codex-specific. Preserve
  existing Claude Code behavior; do not presume its native history or retirement
  semantics match Codex. The selected review surface is inside the dashboard.

**Key examples:**

1. **Retained result after landing:** A saved Codex conversation has a completed
   landing turn, its worktree is confirmed absent, and it is not marked done →
   refresh and select it from the card, Recent sessions, or Sessions sidebar →
   explain the missing workspace, retain its review attention and association,
   and offer review of that same conversation's result without attempting a
   terminal in the missing directory. The result lets the developer read the
   agent's final report, including its landing outcome and remaining limitations.
2. **Ordinary continuation:** A conversation has a completed turn and its saved
   workspace still exists → select it → preserve its ordinary review alert and
   existing terminal continuation behavior.
3. **Retirement between observation and action:** A workspace existed at refresh
   but is removed before Open terminal → request attachment → report the missing
   saved workspace and direct the developer to the supported result review;
   do not leave an empty terminal with a generic attachment error.
4. **Uncertain availability:** A workspace lookup fails without proving absence
   → refresh or request attachment → explain that availability could not be
   established; do not label the workspace retired, delete the conversation,
   infer story completion, or manufacture a done mark.
5. **Retained result temporarily unreadable:** The workspace is absent and the
   native result read or navigation fails → select review → report that failure
   while retaining the conversation identity and review attention; do not
   claim the history was deleted or offer a replacement conversation.
6. **Deliberate completion:** A retired-workspace session still needs review →
   the developer marks it done → suppress attention across later observations
   and concurrent record updates. Merely opening the result or detecting
   retirement does not mark it done. A completed refinement turn can leave
   its associated story not ready for execution.

**UI contract:** Show the saved workspace limitation separately from the
conversation's review status. When absence is confirmed, session selection and
review alerts lead to the supported review surface; Open terminal must not
advertise continuation in that missing directory. Exact wording and layout
remain implementation choices. Review does not submit input or resume work.

**Decision (2026-10-01):** Terry agreed to the recommended dashboard
result/history view and requested slice planning. The view is read-only and
shows the retained final report for this conversation; a general conversation
browser and continuation in another workspace remain deferred. Native evidence
must establish that this report can be read after workspace retirement before
dependent implementation proceeds.

**Open decisions:** None about story scope. Native result-read feasibility is
an execution premise owned by the plan's first slice.

**Effort hypothesis:** M, medium confidence. A coherent change covers workspace
availability, session presentation and actions, and the observation-to-review
journey. Native result access is bounded by an early probe.

**Slice plan:** [Session review after workspace retirement](../slice-plans/201-session-after-workspace-retirement/PLAN.md).

**Coordination:** SEED-069 reviews this same lifecycle boundary but explicitly
defers implementation. This defect story does not change its Taken scope or
interrupt that review. SEED-072 owns pending startup, not post-landing retirement.

## Breadcrumbs

- [Existing attachment limitation](../../docs/dashboard-session-troubleshooting.md)
- [Architecture review](SEED-069-review-dashboard-multi-tool-architecture.md#review-dashboard-multi-tool-architecture)
- Terry's screenshot and recurrence report in this conversation.
