---
id: SEED-446
status: active
scope: one story
---

# SEED-446 — Speed up the selectable story review tree tests

<a id="ad-hoc-work"></a>

### Speed up the selectable story review tree tests

**Identity:** SEED-446#ad-hoc-work
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planless"}
```

**Goal:** Keep the six frontend cases added by the selectable story review tree near 100 ms each by simplifying setup and preserving behavioral coverage.

**Scope.** Exercise the comparison and tree in mounted Chromium with typed replies, fewer incidental interactions, and real keyboard input for the folder keyboard case. Measure the same cases before and after. Preserve the published and captured result, stale read, retry, Changes only, and folder selection checks.

**Source.** Follow-up to SEED-420#browse-one-selectable-review-tree, delivered at b3b0704a7c76b994c9300d1ab8880ef0493f2854.
