---
id: SEED-359
status: active
planted: 2026-11-14
planted_during: Terry asked to evaluate splitting the dashboard token usage story by host
trigger_when: selected from the product backlog
scope: story
---

# SEED-359 — View token usage for dashboard-launched Claude Code tasks

<a id="keep-claude-coverage-gaps-current-after-refresh"></a>

### Keep Claude coverage gaps current after Refresh

**Identity:** SEED-359#keep-claude-coverage-gaps-current-after-refresh
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/643-keep-claude-coverage-gaps-current/PLAN.md"}
```

**Goal.** Terry, reading System settings → Usage, sees a dashboard launch
marked partial only while its usage is actually missing: a Refresh taken
before a launch's first response, or before a worker answers, no longer
leaves that launch partial and out of the moving average once its responses
arrive.

**Scope.** Bounded retrospective correction of
View token usage for dashboard-launched Claude Code tasks
(`5c16998bc:.planning/seeds/SEED-359-claude-code-task-token-usage.md#view-claude-code-task-token-usage`;
commits `83276a56`, `65210f8d`, `3f463b92`, `bbc0be6e`). A session read
again replaces the coverage gaps it recorded, as it already replaces its
usage contribution, and a Claude worker's gap reaches its launch through the
Claude session it belongs to. The usage-history contract names the stored
cache-write split and Claude's speed tier, and the Claude Code Usage
end-to-end journey keeps only the case that needs real services. No new
product promise; Codex answers and the offline import's results stay as
they are for unchanged native files.

Plan:
[643-keep-claude-coverage-gaps-current](../slice-plans/643-keep-claude-coverage-gaps-current/PLAN.md).
