---
id: SEED-219
status: active
planted: 2026-11-02
planted_during: Terry Yin's request for a CI status tab in Intent
trigger_when: Developers review CI status in Intent with or without a selected story
scope: story
---

# Show CI status in an Intent tab

<a id="intent-ci-status-tab"></a>

### Show CI status in an Intent tab

**Identity:** SEED-219#intent-ci-status-tab

```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**For / why:** Developers reviewing a project's intent can see its CI status
in the same page, scoped to the story they are reviewing when one is selected.

**Goal:** Add a CI status tab to the Intent page. With no story selected, it
shows CI status for the selected project's `main` branch. With a story
selected, it shows CI status for that story's branch.

**Scope:**

- Add a tab labelled **CI status** within Intent.
- Show which branch the displayed status belongs to.
- Follow story selection: selecting or changing a story switches the CI status
  to its branch; clearing the story selection returns to `main`.
- Keep unavailable CI information explicit rather than presenting it as a
  successful result or silently substituting another branch's status.

**Key examples:**

- Open Intent without a selected story and choose CI status: the tab identifies
  `main` and shows that branch's CI status.
- Select a story whose branch is `codex/example-story`: CI status identifies
  and shows `codex/example-story`, even if its result differs from `main`.
- Select another story: CI status follows the newly selected story's branch.
- Clear the selected story: CI status shows `main` again.
- CI status cannot be read for the selected branch: the tab identifies that
  branch and makes the missing status explicit.

**Request evidence / priority:** Terry requested this on 2026-11-02 as the
first queued item in the [product backlog](../PRODUCT-BACKLOG.md#backlog-list),
with `main` as the default and a selected story's branch taking precedence.
