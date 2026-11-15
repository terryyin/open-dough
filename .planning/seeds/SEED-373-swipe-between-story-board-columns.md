---
id: SEED-373
status: active
planted: 2026-11-15
trigger_when: selected from the product backlog
scope: story
---

# SEED-373 — Swipe between story board columns on mobile

<a id="swipe-between-story-board-columns"></a>

### Swipe between story board columns on mobile

**Identity:** SEED-373#swipe-between-story-board-columns
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

#### Goal

A developer using the dashboard on a phone can swipe horizontally across the
story board in Development to move between the Backlog, Taken, and Recently done
columns.

#### Evaluation

- On a phone, swipe left from Backlog to show Taken, then swipe left again to
  show Recently done. Swipe right to return to Taken and then Backlog.
- A smooth slide between columns is a nice-to-have. Animation smoothness does
  not require an automated test.
