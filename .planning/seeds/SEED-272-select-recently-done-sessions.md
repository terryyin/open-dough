---
id: SEED-272
status: active
planted: 2026-11-08
scope: story
---

# Select recently done sessions from the dashboard sidebar

<a id="select-recently-done-sessions"></a>

### Select recently done sessions from the dashboard sidebar

**Identity:** SEED-272#select-recently-done-sessions
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal.** A developer can use the dashboard's **Recently done sessions** to
select a completed story or session while staying in the current perspective.
They can open the terminal or final report separately when they want to read it.

**Examples.**

- Activating a row in **Recently done sessions** selects its linked done story,
  or selects the session itself for a standalone entry. Activating the selected
  row again keeps it selected. The Side panel stays as it was. A separate,
  explicit action opens the session's terminal or final report when available.
- From **Intent**, selecting a row linked to a done story keeps **Intent** open
  and updates it to show the newly selected story.
- From **Intent**, selecting a standalone session keeps the current Intent
  content and story selection as they were.

The [dashboard navigation guidance](../../docs/dashboard-navigation.md)
describes the current Sessions sidebar behavior.
