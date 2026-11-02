---
id: SEED-222
status: active
planted: 2026-11-02
planted_during: Terry Yin's request for Purpose and Proof tabs with a remembered split-panel toggle
trigger_when: Developers switch between reading Purpose or Proof and reviewing both together in Intent
scope: story
---

# Read Purpose and Proof in tabs or remembered split panels

<a id="intent-purpose-proof-layout"></a>

### Read Purpose and Proof in tabs or remembered split panels

**Identity:** SEED-222#intent-purpose-proof-layout
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**For / why:** Developers reviewing product intent can give Purpose or Proof
the reading space they need, or compare both together, without repeatedly
restoring their preferred layout.

**Goal:** Present Intent's **Purpose** and **Proof** as tabs, with a toggle
that shows them together as two split panels. Remember the toggle choice.

**Scope:**

- Tabbed layout offers **Purpose** and **Proof**, showing the selected tab's
  content in the reading area.
- Turning on the split-panel toggle shows Purpose and Proof side by side;
  turning it off restores the tabbed layout.
- Remember the split-panel choice across navigation, reloads, and later visits
  in the same browser. Start with tabs when there is no remembered choice.
- Both layouts share the selected file or folder and any selected story scope;
  switching layouts preserves that context.

**Key examples:**

1. Select a feature file in Intent with the toggle off. Choose **Purpose** to
   read its source, then **Proof** to read that same file's observed proof.
2. Turn the toggle on: Purpose and Proof appear together for the same
   selection. Select another file: both panels follow the selection.
3. Leave Intent and return, or reload the dashboard: the split-panel choice
   remains on. Turn it off and reload: the tabbed layout remains selected.
4. Switch layouts while reviewing a selected story: the selected story and
   location remain unchanged.

**Refinement questions:** Decide whether the remembered preference is shared
across projects or kept per project, and how split panels behave on narrow
screens. Choose the persistence mechanism during refinement.

**Request evidence / priority:** Terry requested this on 2026-11-02 as a new
story at the top of the [product backlog](../PRODUCT-BACKLOG.md#backlog-list).
It advances the existing direction to make Purpose and Proof reviewable
together in story context.
