---
id: SEED-361
status: active
planted: 2026-11-14
planted_during: Terry asked for a backup solution for the dashboard's growing local data
trigger_when: selected from the product backlog
scope: story
---

# SEED-361 — Back up and restore dashboard data

<a id="back-up-and-restore-dashboard-data"></a>

### Back up and restore dashboard data

**Identity:** SEED-361#back-up-and-restore-dashboard-data

```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**For / why.** A developer can recover the dashboard's durable data when its
local data directory is lost or damaged.

Provide a repeatable way to back up dashboard-owned records to a separate
location and restore a verified backup. Include permanent launch and usage
history, project configuration, and other dashboard-owned records needed to
resume use. Establish the backup data set, destination, cadence, retention,
and credential handling during refinement. Preserve the data's access
protections. Capture a consistent backup while the dashboard can be writing
records. Keep backups usable independently of ephemeral host state and caches.
[Dashboard storage boundary](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state).

#### Key examples

- After the original local data directory becomes unavailable, a restore into a
  clean dashboard data directory recovers project configuration, launch outcomes
  and the saved token usage, including records older than 30 days. The restored
  history is readable without native session files or replaying old launches.
- An interrupted backup or an invalid archive leaves the last verified backup
  available and the current dashboard data intact. The developer can see what
  was saved and which backup can be restored.
