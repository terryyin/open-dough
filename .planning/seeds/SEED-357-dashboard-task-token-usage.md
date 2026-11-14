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

Measure the entire task as far as the evidence allows. Include all attributable
turns, resumed work, workers, and background work done for that task. Keep
failed or cancelled work and usage when observed. Show which parts of the task
the measurement covers, and surface observed gaps in the total. The same story
can have several launches, each with its own usage and outcome.

#### Launch history and Recently done

Retain each dashboard launch record and its usage indefinitely, including
records that predate this change and are still present. Aging out of Recently
done, removing a session from the active UI, and cleaning up native session or
worktree state preserve the historical record. The Recently done session view
and count cover the most recent 30 days, measured from when a launch ended.

A launch can end before its story is complete. Record an execution that wraps
up early and returns its story to the backlog as a finished launch with that
outcome. Show it in Recently done and include it once in the session count.
The story remains queued. An unfinished update from an ongoing session or a
story move by itself establishes no end to the launch. Preserve any usage that
arrives after the launch ends when it belongs to the task.

#### Key examples

- A developer launches two tasks for the same story with different settings.
  After a dashboard restart, they can inspect each task's persisted launch
  settings and token usage alongside its story identity.
- An ad hoc task is visible with its launch settings and any available usage.
  If the tool supplies only partial usage or no measurement, the dashboard
  shows that state and distinguishes it from a measured zero.
- A story execution wraps up early and returns to the backlog. Its session
  appears in Recently done as returned to backlog, with usage and launch
  settings intact. Starting the story again creates a separate record. After
  30 days the earlier session ages out of the recent list and count. Both
  launch records remain available in usage history.
- An execution reports unfinished work while still assigned to the task. Its
  launch remains open and keeps accumulating attributable usage.

#### Open research

The [dashboard usage and cost research](../../docs/maintainer/dashboard-task-usage-research.md)
identifies usage sources for Codex, Claude Code, and the installed Cursor CLI.
The tools can share an accounting format for input, cache reads, cache writes,
and output. A cross-tool cost comparison needs a stated pricing basis and
equivalent verified outcomes. Record provider-reported charges separately when
they can be tied to a task.

Verify the sources on real dashboard launches, including resumed, cancelled,
and delegated work. Check whether the current Cursor launcher can reliably join
worker usage. Keep and label parent usage where worker coverage is missing.
Establish how to link follow-up activity to the same task and how to observe
confirmed early wrap-up. The related
[retained-history comparison story](SEED-345-session-token-efficiency.md#compare-agent-effort-on-comparable-runs)
uses existing execution history for workflow comparisons.
