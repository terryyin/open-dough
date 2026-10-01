---
id: SEED-074
status: active
planted: 2026-10-01
planted_during: Terry's report of a possibly completed session raising attention again
scope: story
---

# SEED-074: Investigate attention from a completed session

<a id="investigate-done-session-alerts"></a>

### Investigate attention from a completed session

**Identity:** SEED-074#investigate-done-session-alerts
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"unselected"}
```

**Goal:** Establish why a possibly marked-done Codex session appears ready for review and invites opening a terminal that cannot attach.

- **Scope:** Investigate done-state persistence, reopening, notification eligibility, and retained workspace availability. No product repair is selected by this report.
- **Expected:** A successfully marked-done session does not raise review attention unless intentionally reopened under the existing contract.
- **Observed:** The screenshot shows “Ready for review”, one attention badge, and “The session could not be attached” for session `01a0f697-aa8a-7d10-892e-315c50158d8d`. Terry remembers probably using Mark as Done.
- **Evidence:** The saved session currently has no `doneAt`; its workspace `/Users/terryyin/git/open-dough/.worktrees/align-one-shot-callers-and-starts-with-the-revie` no longer exists.
- **Uncertainty:** Whether Mark as Done succeeded, a subsequent attachment reopened it, a stale write removed the done flag, or notification eligibility is incorrect.
- **Related evidence:** The earlier investigation is recoverable at commit `ae22469918f20d03640fe5cd584a89c55eedfc04`, `.planning/seeds/SEED-073-investigate-codex-terminal-attachment.md`.
