---
id: SEED-112
status: active
planted: 2026-10-06
planted_during: SEED-106#paged-dashboard-columns CI repair, which found a started session reopening a terminal the developer had closed
trigger_when: A developer closes a session's terminal while its start is still under way
scope: story
---

# SEED-112: Terminal stays closed during startup

## Why This Matters

When Start session finishes launching, the dashboard presents the new
session's terminal. A developer who already opened that terminal and closed
it while the start was still under way sees it open again on its own, as if
the close were ignored.

## Story

<a id="closed-terminal-stays-closed"></a>

### A terminal the developer closed while its session starts stays closed

**Identity:** SEED-112#closed-terminal-stays-closed
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"unselected"}
```

**Beneficiary:** A developer who starts a session from the dashboard, opens
its terminal, and closes it before the launch has finished.

**Goal:** Closing the terminal is the developer's decision and lasts: the
launch finishing afterwards does not reopen it, and the developer learns that
the session started the way they do today. A start the developer has not
interfered with still presents its session once launched, as today.

**Scope:**

- Close the terminal before the launch finishes, then let it finish: the side
  panel stays closed, the polite announcement that the ad hoc session started
  still appears, and the keyboard stays where Close returned it.
- Open terminal on the session's entry still opens its terminal afterwards,
  attached to the launched session.
- A start the developer leaves alone presents its terminal once launched, with
  the keyboard in it when it rested on the start's progress, as today.
- Reopening the terminal before the launch finishes, after closing it, leaves
  it open: the launch finishing keeps the terminal the developer reopened.
- Boundary assumption: the session's entry is listed while its start is under
  way, so its terminal can be opened and closed before the launch finishes;
  that window is where the reopen appeared.
- Only Start session presents a terminal when its launch finishes. A story's
  Start on a card presents none, so nothing changes there.
- Deferred: a different session's terminal the developer opened during the
  startup. Today the finishing launch replaces it with the new session's
  terminal; this story neither changes nor commits to that.

**Key examples:**

1. The developer clicks Start in Open Dough, opens the new entry's terminal
   while the start is under way, then clicks Close. The panel closes and the
   keyboard returns to Open terminal. The launch finishes: the panel is still
   closed, "Ad hoc session started" is announced, the entry still offers Open
   terminal, and the keyboard has not moved.
2. After example 1, the developer clicks Open terminal. The launched session's
   terminal opens with the keyboard in it, and typing reaches the session.
3. The developer clicks Start and waits. The launch finishes: the terminal opens
   with the keyboard in it, as today.
4. The developer opens the entry's terminal during the start, closes it, then
   opens it again and leaves it open. The launch finishes: the same terminal
   stays open, with no detach or reopen.

**Evidence:** `dashboard/tests/agent-terminal-cursor-page.spec.ts` "closing a
working Cursor terminal and reopening it shows the same turn" failed on CI run
37383633842 when Close came before the launched outcome was read; its trace
showed the panel reopen about 80 ms after Close. The test now waits for the
start to finish, so it no longer exercises this case.
