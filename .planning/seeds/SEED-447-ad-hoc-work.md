---
id: SEED-447
status: active
scope: one story
---

# SEED-447 — Cursor runner and runtime specs clean up after a timeout

<a id="ad-hoc-work"></a>

### Cursor runner and runtime specs clean up after a timeout

**Identity:** SEED-447#ad-hoc-work
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** A Cursor runner or runtime boundary spec that times out still stops its runner and restores HOME and PATH, so the next test starts clean.
