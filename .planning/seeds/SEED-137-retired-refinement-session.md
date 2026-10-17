# Completed refinement sessions with retired workspaces

<a id="completed-retired-refinement"></a>

### Show completed refinement rather than a waiting conversation

**Identity:** SEED-137#completed-retired-refinement
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planless"}
```

**Goal:** A developer sees a completed refinement with a retired workspace as
Completed with attention and can acknowledge its session without implying that
the associated story is complete.

**Scope:** Correct the shared dashboard reading and done confirmation for a
refinement with an explicit completed report and confirmed missing preparation
workspace. Preserve native working activity, incomplete work, unknown workspace
availability, and ordinary resumable sessions. A session done mark remains a
local acknowledgment; published story membership and readiness stay authoritative.

**Expected examples:** A Claude refinement reports completion with follow-up
actions, retires its preparation worktree, and remains idle/blocked. Its story
card, Sessions sidebar, attention count, and retained report agree on completion
with attention. Marking that session done does not claim the story completed or
move its queued, not-ready story. Without explicit completion or confirmed
workspace absence, ordinary native activity remains visible.

**Evidence:** Pygardon SEED-131#story-timesfm-daily-exits, session
bfcdda98-c42d-4b0a-8466-ac718ce442d7, 2026-10-17: completed report and published
refinement, missing worktree, live Claude process reporting idle/blocked. The
dashboard renders Needs input and asks whether to mark a waiting session done.

**Execution:** The reported bug is authorized for one bounded planless repair
through dough-bug-fixing, with reproduction before repair, focused browser proof,
independent refactoring, and a ten-minute implementation limit; no replanning.
