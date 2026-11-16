---
id: SEED-386
status: active
planted: 2026-11-16
planted_during: Request to reorder dashboard backlog stories by drag and drop and publish them explicitly
trigger_when: selected from the product backlog
scope: story
---

# SEED-386 — Reorder backlog stories in the dashboard

<a id="reorder-backlog-stories-in-the-dashboard"></a>

### Reorder backlog stories in the dashboard

**Identity:** SEED-386#reorder-backlog-stories-in-the-dashboard

```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

#### Goal

A developer can drag and drop queued stories on the dashboard board to change
their priority. The board shows the draft order as edited, keeps it current as
other backlog changes arrive, and publishes it to `origin` when the developer
chooses to sync.

#### Acceptance examples

- Dropping a queued story in a different position shows the new order
  immediately and marks the board as edited. The draft stays in memory until
  the developer initiates sync. A drop that leaves the order unchanged creates
  no edit.
- While the board is edited, incoming backlog changes appear as they arrive.
  If the developer moves B above A, and someone else adds D and takes C, the
  board shows D in the queue and C in Taken while B stays above A. Compatible
  changes to the order of other stories also carry through. If two order
  changes conflict, the board shows the conflict and keeps the draft available
  for review before publishing.
- Choosing **Sync** commits the reconciled backlog order and pushes it to
  `origin`. The board clears the edited state after the push succeeds. If
  publishing fails, the board shows the failure and keeps the pending change
  available to retry.
