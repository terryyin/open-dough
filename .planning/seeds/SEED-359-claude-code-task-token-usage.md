---
id: SEED-359
status: active
planted: 2026-11-14
planted_during: Terry asked to evaluate splitting the dashboard token usage story by host
trigger_when: selected from the product backlog
scope: story
---

# SEED-359 — View token usage for dashboard-launched Claude Code tasks

<a id="view-claude-code-task-token-usage"></a>

### View token usage for dashboard-launched Claude Code tasks

**Identity:** SEED-359#view-claude-code-task-token-usage

```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**For / why.** A developer can inspect token usage for a Claude Code task they
started in the dashboard, including attributable workers and resumed work.

Extend the [dashboard usage view](SEED-357-dashboard-task-token-usage.md#view-token-usage-for-dashboard-launched-tasks)
to Claude Code story workflows and ad hoc tasks using the shared
[launch and usage records](SEED-358-dashboard-launch-history.md#reconstruct-codex-and-claude-code-usage-history).
Preserve the current background
launch and terminal experience. Show the launch settings, actual model and effort
where recorded, and usage by token category. Include attributable background
work, and distinguish partial or missing coverage from a measured zero.

#### Key examples

- A Claude Code launch with a worker resumes through a dashboard restart. The
  launch history shows each uniquely observed request once, including cache use
  and the worker's attributed usage. Later activity belonging to a different
  task stays out of this launch's total.
- An older dashboard launch with a retained session UUID and native transcripts
  gains its recoverable usage, including linked workers. A repeated import or
  overlap with telemetry keeps each request counted once. If past data is missing,
  the record explains the coverage gap.

The [Claude Code research](../../docs/maintainer/dashboard-task-usage-research.md#claude-code-21325)
identifies request telemetry and retained local transcripts. Verify export from
an already-running background supervisor, session resets, interrupted runs, and
worker lineage before claiming full coverage.
