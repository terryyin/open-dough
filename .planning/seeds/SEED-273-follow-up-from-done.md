---
id: SEED-273
status: active
planted: 2026-11-08
scope: story
---

# Start a follow-up from recently done work

<a id="follow-up-from-done"></a>

### Start a follow-up from recently done work

**Identity:** SEED-273#follow-up-from-done
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal.** A developer can start a new session about a completed story or a
standalone Done session when there is no existing session to reopen, with the
dashboard carrying forward the available context.

**Examples.**

- A completed story with no session left to reopen offers **Follow up**, as
  does a standalone Done session whose conversation is no longer available.
  An entry with a reopenable session keeps its existing session action.
- **Follow up** opens the existing **Start session** dialog for the entry's
  project. The developer can choose the tool, model and other launch options,
  and enter a new initial request. On Start, the dashboard supplies context
  alongside that request. It includes the linked story's identity, title and
  available completion context when the entry has a story, and available
  context such as the original request from a retained session. The source
  entry stays Done.
- The dialog uses the same **Workspace** choices as an ad hoc session.
  **Isolated workspace** starts in a fresh worktree based on the project's
  trunk, and **Default main** starts in the project's default checkout, with
  the existing launch checks and confirmations.

Reuse the [ad hoc Start session dialog and launch path](../../dashboard/LAUNCH-START.md#start-session)
for the new launch. Use the [existing done and retained session records](../../dashboard/AGENT-LAUNCH-HISTORY.md)
for the source context. A session's local Done status is independent of
whether its changes landed.
