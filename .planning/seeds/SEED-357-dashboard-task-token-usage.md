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
parameters. Persist the result in [dashboard launch history](SEED-358-dashboard-launch-history.md#keep-dashboard-launch-history).
Use an accounting format and view that [Claude Code](SEED-359-claude-code-task-token-usage.md#view-claude-code-task-token-usage)
and [Cursor](SEED-360-cursor-task-token-usage.md#view-cursor-task-token-usage) can
extend.

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
- For a launch already recorded before usage collection shipped, recover usage
  from its retained native history when the launch and requests can be linked.
  Include attributable workers. Repeating the import or resuming collection
  counts each response once. Keep older or missing evidence visible as a gap.

#### Open research

The [dashboard usage and cost research](../../docs/maintainer/dashboard-task-usage-research.md#codex-cli-01690)
identifies response records and explicit thread and turn lineage. Verify fresh,
resumed, cancelled and delegated work, plus active and archived historical
sessions. Keep uncached input, cache reads, cache writes, and output as distinct
counts. A cross-tool cost comparison needs equivalent verified outcomes and a
stated pricing basis. Keep attributable provider charges distinct from estimates.
