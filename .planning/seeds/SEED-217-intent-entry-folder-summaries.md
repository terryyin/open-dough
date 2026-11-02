---
id: SEED-217
status: active
planted: 2026-11-02
planted_during: Terry Yin's request for Intent entry and folder summaries
trigger_when: Developers open Intent or select folders in its file browser
scope: story
---

# Show summaries when selecting Intent entries and folders

<a id="intent-entry-folder-summaries"></a>

### Show summaries when selecting Intent entries and folders

**Identity:** SEED-217#intent-entry-folder-summaries
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**For / why:** Developers reviewing project intent can see the selected entry's
statistics and summarized Proof, and select folders for review while controlling
which folders are open.

**Goal:** Clicking the Intent entry shows its summary page, including statistics
and summarized Proof. Folders in the Intent file browser can also be selected
to show their summary pages.

**Scope:** Add the entry and folder summary views and distinguish folder-caret
clicks from folder-row clicks. A caret toggles its folder open or closed.
Clicking an unselected folder selects it and shows its summary page. Clicking
the already selected folder toggles it open or closed while retaining its
selection and summary.

**Key examples:**

- Click the Intent entry: its summary page appears with statistics and
  summarized Proof for that entry.
- Click a closed folder's caret: the folder opens. Click its caret again: the
  folder closes. Caret clicks control expansion without changing selection.
- Click an unselected folder itself: it becomes selected and its summary page
  appears, including statistics and summarized Proof for that folder. This
  selection click preserves the folder's current open or closed state.
- Click that selected folder again: it toggles open or closed and remains
  selected with its summary visible. Repeated clicks continue to toggle it.
- Select a different folder: the selection and summary page move to that folder.

**Request evidence:** Terry's 2026-11-02 request specifies Intent-entry summary
content and the separate caret, first-selection, and selected-folder click
behaviors.

**Priority:** Terry requested this as the first queued product-backlog item,
ahead of the separate Optimization Candidates tab story.
