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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/470-see-running-sessions-with-sidebar-closed/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"10ad316afade1ee0bfb69afbd8b06fd88127a490e4f3e38817b77f8ed8f653f4","plan":"bd2c1eb139f04bfde91548a86a99189a8e8f8f5d65283d6fdbfd053bc8382066"}}
```

**Goal:** A dashboard developer working with the Sessions sidebar closed can
still tell, at a glance at the Sessions toggle (the dashboard logo), how many
of this machine's open sessions across projects are working and how many need
them, so they know whether agents are still progressing without reopening the
sidebar. This keeps local session evidence visible while the board keeps its
full width.

**Scope:**

- While the sidebar is closed, the Sessions toggle's badge shows two separate
  counts in one badge: the working count, in green, first, then the existing
  attention count with its existing look.
- A session counts as working when its entry reads it working by the same
  reading every session entry uses: native **Working**, or Cursor's held
  **working** screen. A session marked done, awaiting its first instruction,
  unavailable, of unknown or unrecognized state, or needing attention does not
  count. An unread report does not change which count a session is in.
- The attention count keeps its existing rule: the sessions whose entries need
  attention.
- Each count shows only when it is above zero; with neither, the toggle shows
  no badge, as now. Before the machine's sessions are first read, no badge.
- Each count has its own accessible name, worded as the sessions it counts:
  "3 sessions working" and "2 sessions need attention" (singular "1 session
  working"). Its position and name, not color alone, distinguish it.
- The badge follows the sessions as they change state, on the existing
  session reads.
- While the sidebar is open, the toggle shows the existing attention-only
  badge; its title row keeps its existing figures.
- Closed means closed wherever the toggle shows, including a narrow window
  where the open sidebar lies over the page.
- **Scope limits:** no change to which sessions are read, how often, or to the
  sidebar's title-row figures, entries, ordering, or alerts.

**Key examples:**

- Sidebar closed, three working sessions and two needing attention across two
  projects → the badge shows a green **3** then the attention count **2**,
  named "3 sessions working" and "2 sessions need attention".
- From there, one working session starts waiting for input → **2** working and
  **3** needing attention.
- Sidebar closed, two working sessions, one awaiting its first instruction, and
  none needing attention → only a green **2**.
- Sidebar closed, one Cursor session at its held **working** screen and one
  Claude session marked done while still working natively → only a green **1**.
- Sidebar closed, nothing working, one session needing attention → only the
  attention **1**, as today.
- The developer opens the sidebar with three working and two needing attention
  → the toggle shows only the attention **2**; closing it again restores **3**
  and **2**.

**Architecture:** No new responsibility or read. The working count derives in
the page from the session records the toggle already holds, through the shared
session reading (`dashboard/src/sessionShown.ts`), so the badge, entries, and
attention count cannot disagree on a session. This stays machine-local session
evidence beside published story facts under
[ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md).
The badge says "working", the entry label's word, not "running", which the
dashboard keeps for Cursor's runner process.
