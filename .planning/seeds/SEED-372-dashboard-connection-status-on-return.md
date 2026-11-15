---
id: SEED-372
status: active
planted: 2026-11-15
planted_during: Terry asked to show the dashboard connection status when returning to an inactive browser window
trigger_when: selected from the product backlog
scope: story
---

# SEED-372 — Dashboard connection status on return

<a id="see-dashboard-connection-status-on-return"></a>

### See dashboard connection status when returning to the window

**Identity:** SEED-372#see-dashboard-connection-status-on-return
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

#### Goal

A developer returning to the dashboard can tell at a glance whether it is
receiving live updates again.

#### Key examples

- When the browser window becomes active again, a small dashboard dot turns
  yellow while the connection is unconfirmed. The last message received before
  the return leaves the dot yellow.
- If the live update connection is still open, the dashboard keeps it and
  waits for its next message without sending a request to prompt an update.
  The dot turns green on the first new message after the window becomes active.
- If the connection is down, the dashboard resumes it through the existing
  recovery path. The dot stays yellow through connection establishment and
  turns green when the resumed connection delivers its first message.

#### Starting point

The [revision stream scheduler](../../dashboard/src/revisionStreamSchedule.ts)
already handles stream silence and reopening. Check how that behavior applies
when focus returns and reuse the existing recovery path where it fits.
