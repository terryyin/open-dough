---
id: SEED-235
status: active
planted: 2026-11-05
planted_during: Terry Yin's request to show running sessions on the dashboard logo
trigger_when: A dashboard developer hides the Sessions sidebar
scope: story
---

# SEED-235 — See running sessions with the sidebar closed

<a id="see-running-sessions-with-sidebar-closed"></a>

### See running sessions with the sidebar closed

**Identity:** SEED-235#see-running-sessions-with-sidebar-closed
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

A dashboard developer can see how many sessions are running and how many
need attention across projects while the Sessions sidebar is closed. The
Sessions toggle (the dashboard logo) shows the running count in green and
keeps the existing stopped-session count, which counts sessions needing
attention. Both numbers appear in one badge as separate, labeled counts.

Treat a session as running when the dashboard observes it working. For
example, with three working sessions and two needing attention, closing the
sidebar shows a green **3** beside the existing attention count of **2**.
If one of those working sessions then needs attention, the badge shows
**2** running and **3** needing attention. Opening the sidebar restores the
toggle's existing attention-only badge.
