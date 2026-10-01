---
id: SEED-073
status: active
planted: 2026-10-01
planted_during: Terry's report of a dashboard Codex terminal attachment failure
scope: story
---

# SEED-073: Investigate Codex terminal attachment failure

<a id="investigate-codex-terminal-attachment"></a>

### Investigate Codex terminal attachment failure

**Identity:** SEED-073#investigate-codex-terminal-attachment
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"unselected"}
```

**Goal:** Establish why opening the recorded refinement session fails to attach and report an evidence-backed cause and recovery direction.
- **Scope:** Diagnose the supplied local session and attachment boundary. This request authorizes investigation, not product repair.
- **Expected:** Open terminal attaches the recorded Codex conversation when its retained workspace and endpoint are usable.
- **Observed:** The panel says “The session could not be attached” and offers Reconnect, with no terminal output.
- **Evidence:** Terry's two screenshots name session `01a0f67a-d156-7360-906b-db4f9d1fc70e`, endpoint `unix:///Users/terryyin/.codex/app-server-control/app-server-control.sock`, and workspace `/Users/terryyin/git/open-dough/.worktrees/keep-the-dashboard-responsive-while-session-star`. The card reports first input accepted and ready for review.
- **Unknown:** Whether the saved workspace, endpoint, native conversation, or terminal process failed; whether reconnect changes the outcome.

## Breadcrumbs

- Terry's investigation request and screenshots in this chat, 2026-10-01.
