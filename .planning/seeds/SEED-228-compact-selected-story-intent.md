---
id: SEED-228
status: active
planted: 2026-11-04
planted_during: Terry Yin's annotated screenshot and request to improve the selected-story Intent view
trigger_when: A developer opens Intent for a selected story and browses its files
scope: story
---

# SEED-228: Make selected-story Intent easier to scan

<a id="compact-selected-story-intent"></a>

### Make selected-story Intent easier to scan

**Identity:** SEED-228#compact-selected-story-intent
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** A developer reviewing a story in Intent can see which story is
selected and quickly distinguish Intent locations from their files and folders.

**Acceptance examples**

- With a story selected, the area immediately above the Intent file list
  contains one compact summary. It brings together the story information
  formerly above the Intent tabs, the **Selected story only** filter, and the
  outside-Intent changes notice and **Review changes** action when applicable.
  The selected story is identifiable at a glance, even with a long title.
- The summary starts compact. A disclosure reveals the full story title,
  identity, and comparison details or status. Collapsing it keeps the story
  identifiable. Expanding or collapsing it preserves the file selection and
  the **Selected story only** setting.
- Intent location headers such as `dashboard/tests` and `tests` have a
  distinct background from nested file and folder rows. Selecting a location
  changes the background across the full width of its header, including the
  disclosure area. The highlight follows the selected location and is
  distinguishable from whether a location is expanded.
