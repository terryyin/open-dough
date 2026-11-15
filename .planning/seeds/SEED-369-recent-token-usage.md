---
id: SEED-369
status: active
planted: 2026-11-15
planted_during: Terry requested a day-count filter and a clearer token usage chart
trigger_when: selected from the product backlog
scope: story
---

# SEED-369 — Make recent token usage easier to read

<a id="make-recent-token-usage-easier-to-read"></a>

### Make recent token usage easier to read

**Identity:** SEED-369#make-recent-token-usage-easier-to-read
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

#### Goal

A developer reviewing [System settings → Usage](../../dashboard/src/SystemSettingsUsage.tsx)
can focus on a recent period and see the trend and differences between ordinary
tasks even when a few tasks use far more tokens.

#### Scope

- Choose how many days to show with a **Last N days** control. The period
  always ends today.
- Draw the moving average in a distinct color above the task dots.
- Show tasks whose plotted Token index exceeds 50 million as red × marks at
  the top of the chart. Keep each mark aligned to the task's date, label it
  with its actual value, and let the developer select it to open task
  details. Keep those task values out of the y-axis scaling.

#### Evaluation

- Changing the lookback from 30 days to 7 days keeps today's tasks visible
  and removes tasks that fall outside the shorter period.
- When a 65 million task appears among ordinary tasks, its labeled red ×
  remains visible alongside distinguishable ordinary points and a moving
  average that is easy to follow.

#### Open decision

The current moving average uses the last 10 eligible tasks. Decide how
tasks before the visible period contribute and how to display the average
if an outlier pulls it high enough to compress the ordinary points.
