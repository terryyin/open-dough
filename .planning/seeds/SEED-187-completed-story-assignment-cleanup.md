---
id: SEED-187
status: active
planted: 2026-10-30
scope: bounded repair of completed-story assignment cleanup
---

# SEED-187: Release completed-story preparation assignments

<a id="release-completed-story-preparation"></a>

### Release every assignment when its story completes

**Identity:** SEED-187#release-completed-story-preparation
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planless"}
```

**Goal:** Completing a story leaves no readable preparation or execution
assignment for that identity, so the agent roster cannot retain a Preparing
assignment for completed work.

**Scope:** Remove the stale Juacompe assignment for
SEED-120#cursor-session-restart-recovery. Repair the existing completion
operation and its guidance, with focused regression coverage. Preserve other
stories' assignments, unreadable profiles, and execution-agent completion
credit. Change the shared source; do not update installed skill copies.

**Expected:** Completion releases all readable profiles matching the completed
identity, including preparation profiles owned by other agents. Done records
continue to credit the executing agent, and preparation-only completion does
not invent execution credit.

**Actual:** Completion releases execution profiles only. Juacompe's preparation
profile remained after Steven completed SEED-120 on 2026-10-08, leaving the
roster displaying Preparing and a missing-backlog-title error.

**Authority:** The user's request authorizes this bounded repair. Execute one
planless attempt with a ten-minute implementation limit and no replanning.
