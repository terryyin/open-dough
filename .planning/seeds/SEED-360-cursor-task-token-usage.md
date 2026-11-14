---
id: SEED-360
status: active
planted: 2026-11-14
planted_during: Terry asked to give Cursor usage its own story at the bottom of the backlog
trigger_when: selected from the product backlog
scope: story
---

# SEED-360 — View token usage for dashboard-launched Cursor tasks

<a id="view-cursor-task-token-usage"></a>

### View token usage for dashboard-launched Cursor tasks

**Identity:** SEED-360#view-cursor-task-token-usage

```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**For / why.** A developer can inspect the usage that a dashboard-launched
Cursor task reports and see how much of the task the measurement covers.

Extend the [dashboard usage view](SEED-357-dashboard-task-token-usage.md#view-token-usage-for-dashboard-launched-tasks)
to Cursor story workflows and ad hoc tasks on the current interactive launcher.
Persist the reported usage and available settings. Measure the whole task where
requests can be attributed. Include related continuations and late worker usage.

#### Key examples

- The dashboard retains parent-turn usage with the launch's settings. An
  overlapping hook report or a retried collection counts that usage once.
- When reliable evidence ties a worker's usage to the task, the dashboard
  includes it once. If worker usage is unavailable, the dashboard shows the
  observed parent usage and the coverage gap.

The [Cursor research](../../docs/maintainer/dashboard-task-usage-research.md#cursor-cli-20261113-eacade1)
identifies local parent hooks and an optional Admin API join by each child
conversation ID. Verify the join on an eligible account if available. Preserve
useful parent coverage without that access. Cloud Agents has a different
launch and usage contract, tracked in the [cloud launch epic](SEED-339-dashboard-cloud-agent-launches.md#run-open-dough-tasks-in-the-cloud).
