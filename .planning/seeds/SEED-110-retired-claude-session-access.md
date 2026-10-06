---
id: SEED-110
status: active
planted: 2026-10-06
scope: story
---

# Retired Claude session access

<a id="retired-claude-session-access"></a>

### Completed Claude sessions remain readable after their workspace is retired

**Identity:** SEED-110#retired-claude-session-access
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planless"}
```

**Goal:** Opening a completed Claude session after its saved workspace is
retired gives the developer its retained report or a clear missing-workspace
explanation instead of trying to wake the session in a nonexistent directory.

**Scope:** Investigate and reproduce the reported terminal reopening failure,
then attempt one bounded repair through dough-bug-fixing with no replanning and
a ten-minute implementation limit. Reuse the existing session access and
retained-report behavior where applicable. Preserve access to sessions whose
workspaces still exist and preserve session read/done actions. Session
attribution belongs to SEED-109 and is outside this repair.

**Expected versus observed:** After SEED-100's refinement and plan landed as
6feed7d9, cleanup removed its worktree
`.worktrees/a-session-the-dashboard-launches-prepares-its-ch`. The dashboard
still offered Open terminal for Claude session
4fea4bcb-bde8-42cc-9574-f74f91b6d40f. Opening it produced "Waking session",
then "Workspace not trusted" with the decisive explanation that the workspace
could not be resolved on disk, and the terminal ended. The screenshot retains
the completion report. The removed directory was also confirmed absent from
the filesystem and Git's worktree list. The dirty default checkout being one
commit behind is an independent landing-maintenance outcome.

**Key examples:**

- A completed Claude refinement has a retained report and its recorded
  preparation workspace has been removed: opening the session shows the
  report and a clear workspace explanation without waking the missing workspace.
- The workspace disappears after the page's observation but before terminal
  attachment: the action handles that loss usefully with the same retained
  report or clear explanation.
- A Claude session's saved workspace still exists: its existing terminal
  attachment continues to work.

**Remaining uncertainty:** Confirm the discrepancy at the dashboard browser
boundary, including whether existing retired-workspace handling is limited to
Codex. Determine whether one bounded repair can cover Claude's saved workspace
without changing session attribution or broadening host lifecycle behavior.
