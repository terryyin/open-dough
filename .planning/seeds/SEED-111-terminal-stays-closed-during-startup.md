---
id: SEED-111
status: active
planted: 2026-10-06
planted_during: SEED-106#paged-dashboard-columns CI repair, which found a started session reopening a terminal the developer had closed
trigger_when: A developer closes a session's terminal while its start is still under way
scope: story
---

# SEED-111: Terminal stays closed during startup

## Why This Matters

When Start session finishes launching, the dashboard presents the new
session's terminal. A developer who already opened that terminal and closed
it while the start was still under way sees it open again on its own, as if
the close were ignored.

## Story

<a id="closed-terminal-stays-closed"></a>

### A terminal the developer closed while its session starts stays closed

**Identity:** SEED-111#closed-terminal-stays-closed

**Beneficiary:** A developer who starts a session from the dashboard, opens
its terminal, and closes it before the launch has finished.

**Goal:** Closing the terminal is the developer's decision and lasts: the
launch finishing afterwards does not reopen it. A start the developer has not
interfered with still presents its session once launched, as today.

**Scope:**

- Close the terminal, then let the launch finish: the side panel stays
  closed, and the announcement that the session started still appears.
- Open terminal still opens the session's terminal afterwards.
- A start with no close in between presents its terminal once launched.

**Evidence:** `dashboard/tests/agent-terminal-cursor-page.spec.ts` "closing a
working Cursor terminal and reopening it shows the same turn" failed on CI run
37383633842 when Close came before the launched outcome was read; its trace
showed the panel reopen about 80 ms after Close. The test now waits for the
start to finish, so it no longer exercises this case.
