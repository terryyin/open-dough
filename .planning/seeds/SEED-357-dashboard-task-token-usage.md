---
id: SEED-357
status: active
planted: 2026-11-14
planted_during: Terry requested token usage for tasks started from the dashboard
trigger_when: selected from the product backlog
scope: story
---

# SEED-357 — View token usage for dashboard-launched Codex tasks

<a id="view-token-usage-for-dashboard-launched-tasks"></a>

### View token usage for dashboard-launched Codex tasks

**Identity:** SEED-357#view-token-usage-for-dashboard-launched-tasks

```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**For / why.** A developer can return to the dashboard to see how many tokens a
Codex task they started there used and which launch settings produced that usage.

Automatically collect usage for dashboard-launched Codex story workflows and
ad hoc tasks. Show it with the task type, project, story identity when applicable,
tool, requested and observed model and effort, and other relevant launch
parameters. Use the [usage records and historical reconstruction](SEED-358-dashboard-launch-history.md#reconstruct-codex-and-claude-code-usage-history).
Provide a usage view that [Claude Code](SEED-359-claude-code-task-token-usage.md#view-claude-code-task-token-usage)
and [Cursor](SEED-360-cursor-task-token-usage.md#view-cursor-task-token-usage) can extend.

Measure the entire task as far as the evidence allows. Include all attributable
turns, resumed work, workers, and background work done for that task. Keep
failed or cancelled work and usage when observed. Show which parts of the task
the measurement covers, and surface observed gaps in the total. The same story
can have several launches, each with its own usage and outcome.

#### Key examples

- A developer launches two tasks for the same story with different settings.
  After a dashboard restart, they can inspect each task's persisted launch
  settings and token usage alongside its story identity.
- An ad hoc task is visible with its launch settings and any available usage.
  The dashboard distinguishes a measured zero from missing or partial usage.
- An older Codex launch displays its imported usage and any coverage gaps.
  When a new collector sees a response already imported, the view counts it once.

#### Strongest option

Measure each launch with the same import the
[usage history reconstruction](SEED-358-dashboard-launch-history.md#reconstruct-codex-and-claude-code-usage-history)
runs: read completed-response usage from the launch's Codex rollouts, following
thread and turn lineage to its workers, while the task runs and after it ends.
The November 14 check found that usage for 385 of 385 retained roots and 3,325
of 3,327 descendants. New and older launches would then share one collection
path and one rule for counting a response once, the
[Claude Code story](SEED-359-claude-code-task-token-usage.md#view-claude-code-task-token-usage)
could measure the same way from its transcripts, and the launch observer need
not stay attached after the first turn. Refinement still decides the approach.
It would need to check how soon usage appears during a running task, how a
settled total is recognized, and rollout format changes across Codex versions.
App Server token events remain the alternative, for example for provisional
display while a turn runs.

#### Open research

The [dashboard usage and cost research](../../docs/maintainer/dashboard-task-usage-research.md#codex-cli-01690)
identifies response records and explicit thread and turn lineage. Verify fresh,
resumed, cancelled and delegated work and display of imported history. A
cross-tool cost comparison needs equivalent verified outcomes and a
stated pricing basis. Keep attributable provider charges distinct from estimates.
