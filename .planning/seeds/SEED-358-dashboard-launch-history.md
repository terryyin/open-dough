---
id: SEED-358
status: active
planted: 2026-11-14
planted_during: Terry asked to evaluate permanent launch history as a separate story
trigger_when: selected from the product backlog
scope: story
---

# SEED-358 — Keep dashboard launch history

<a id="keep-dashboard-launch-history"></a>

### Keep dashboard launch history

**Identity:** SEED-358#keep-dashboard-launch-history

```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**For / why.** A developer can account for each task the dashboard launched,
including work that stopped early, after the recent session views age out.

Retain every dashboard launch record and its available usage indefinitely,
including older records still present. Keep dashboard-owned history after a
session is removed from the active UI or native session and worktree artifacts
are cleaned up. The Recently done session view and count still cover the most
recent 30 days from when a launch ended. Routine recent-session reads stop at
that window. Historical records remain readable independently of native state.

A confirmed early wrap-up that returns the story to the backlog ends that
launch with a returned-to-backlog outcome. Count the finished launch once in
Recently done while the story remains queued. A later start for the story has
its own record. An unfinished update from an ongoing task or a queue move by
itself establishes no end to a launch. Keep later evidence attributable to a
finished launch available for accounting.

#### Usage records and historical backfill

Define the dashboard-owned launch and usage data structure here. A stable launch
ID ties together the project, story when applicable, workflow, host, launch
settings, start and end times, and outcome. Preserve native session and turn
lineage and each usage observation's identity, source, scope, and coverage.
Store model and effort when known and keep uncached input, cache reads, cache
writes, and output distinct. Represent missing or partial measurements explicitly.
Later host collectors and usage views use the same stored records.

Backfill historical usage for already-recorded **Codex and Cursor** launches.
Read Codex response usage from retained active and archived rollouts, including
compressed files. Use explicit thread and turn lineage to include attributable
workers. For Cursor, import retained usage evidence where conversation and task
identity can be established, such as matching rows from an eligible Admin API
or supported export. Include worker usage only where the stored lineage supports
the join. Preserve unavailable or ambiguous usage as a coverage gap. Make the
import repeatable without duplicate usage, including when live collection later
overlaps it. The [historical recovery research](../../docs/maintainer/dashboard-task-usage-research.md#recovering-earlier-launches)
records the available evidence.

Terry approved delivering the data structure and backfill without a new usage UI.
Verify them by reading the stored records and checking the import's coverage and
repeatability. The visible usage views remain with their host stories.

#### Key examples

- A session that finished 31 days ago stays out of the recent list and count.
  Its launch history survives a later write and a dashboard restart. Removing
  its session or cleaning up native artifacts still preserves the history.
- An execution wraps up early and returns its story to the backlog. Its session
  appears in Recently done as returned to backlog, once. A new launch for the
  story coexists with that finished record. An interim unfinished report from
  the new launch leaves it open.
- An older Codex launch gains usage from its own responses and any linked
  workers. An older Cursor launch gains usage when retained rows can be matched
  and retains its history with unavailable or partial usage otherwise. Repeating
  an import leaves the same attributed counts and coverage.

The [current launch lifecycle findings](../../docs/maintainer/dashboard-task-usage-research.md#dashboard-ownership-and-task-boundaries)
identify read filtering, write-time pruning, explicit removal, and the early
wrap-up gap. Preserve existing launch metadata for the usage stories. Retain
accounting evidence without changing retention policies for temporary attempts,
landing retries, or unrelated project history.
