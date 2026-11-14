---
id: SEED-357
status: active
planted: 2026-11-14
planted_during: Terry requested token usage for tasks started from the dashboard
trigger_when: selected from the product backlog
scope: story
---

# SEED-357 — View token usage for dashboard-launched tasks

<a id="view-token-usage-for-dashboard-launched-tasks"></a>

### View token usage for dashboard-launched tasks

**Identity:** SEED-357#view-token-usage-for-dashboard-launched-tasks

```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**For / why.** A developer can return to the dashboard to see how many tokens
a task they started there used and which launch settings produced that usage.

The dashboard automatically collects and persists a record for each task it
starts, including story workflows and ad hoc tasks. It keeps the task type,
project and story identity when applicable, the agent tool, model, effort,
other relevant launch parameters, and the usage the tool makes available.

#### Key examples

- A developer launches two tasks for the same story with different settings.
  After a dashboard restart, they can inspect each task's persisted launch
  settings and token usage alongside its story identity.
- An ad hoc task is visible with its launch settings and any available usage.
  If the tool supplies only partial usage or no measurement, the dashboard
  shows that state and distinguishes it from a measured zero.

#### Open research

The [dashboard usage and cost research](../../docs/maintainer/dashboard-task-usage-research.md)
identifies usage sources for Codex, Claude Code, and the installed Cursor CLI.
The tools can share an accounting format for input, cache reads, cache writes,
and output. A cross-tool cost comparison needs a stated pricing basis and
equivalent verified outcomes. Record provider-reported charges separately when
they can be tied to a task.

Verify the sources on real dashboard launches, including resumed, cancelled,
and delegated work. Establish which later work belongs to a launch, what
coverage the dashboard can report, and how long usage history should remain
visible after a session is removed. The related
[retained-history comparison story](SEED-345-session-token-efficiency.md#compare-agent-effort-on-comparable-runs)
uses existing execution history for workflow comparisons.
