---
id: SEED-062
status: active
planted: 2026-09-30
planted_during: Terry's dashboard UX review of the Sessions sidebar
trigger_when: A developer scans the dashboard Sessions sidebar to find sessions that need them
scope: story
---

# SEED-062: Compact, scannable Sessions sidebar

## Why This Matters

Terry wants the Sessions sidebar to be quick to scan. Today rows are tall, carry
launch information and spelled-out status words, and the attention count is
explained in words. Session details already exist once a session is opened, so
the list only needs to show what helps a developer choose where to look next.

## Story

<a id="compact-session-sidebar"></a>

### Scan sessions quickly in a compact sidebar that surfaces those needing attention

**Identity:** SEED-062#compact-session-sidebar
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** A developer glancing at the Sessions sidebar sees more sessions
  at once, recognises each session's state by color and shape, and finds the
  sessions that need attention at the top.
- **Evaluation:** With sessions in several states, open the dashboard: the
  toggle is an SVG icon; a red numeric badge shows only when sessions need
  attention; each row is one line with elapsed time and a color-coded state;
  attention sessions lead the list.
- **Scope:**
  - The Sessions toggle button is an SVG icon rather than text.
  - The count of sessions needing attention is a red badge containing only the
    number, with no explanatory wording. It appears only when at least one
    session needs attention.
  - Each sidebar row is a single line and shorter than today. It omits launch
    information and shows how long the session has existed since it started,
    taking little space at the end of the row.
  - Session state (working, needs input, ready for review, unknown, and the
    other states shown today) is conveyed by color and border styling, not by
    words in the row. State detail remains on the opened session page.
  - Ordering: sessions needing attention (needs input, ready for review) come
    first, earliest start first; all other sessions follow, newest start first.
- **Key examples for later refinement:**
  - Two attention sessions started at 09:00 and 10:00 plus working sessions
    started at 08:00 and 11:00: order is 09:00, 10:00, 11:00, 08:00.
  - No session needs attention: no badge is shown.
  - A session moves from working to needs input: it moves into the attention
    group and the badge count increases.
  - Colors and border styles stay distinguishable for each state, including for
    developers who cannot rely on hue alone (to settle in refinement).
- **Boundary:** Session detail content, launch flows, and state definitions are
  unchanged. Wording elsewhere in the dashboard stays consistent with this
  change.
- **Value / learning:** Faster triage of many concurrent sessions.
- **Effort hypothesis:** Unestimated; likely splits into toggle and badge, row
  layout and state styling, and ordering if refinement finds it large.
- **Capture:** Terry requested this story on 2026-09-30.

## Open Decisions

- Accessible names for the icon toggle, badge, and color-only states.
- How elapsed time is formatted and refreshed.

## Breadcrumbs

- [Product backlog](../PRODUCT-BACKLOG.md).
- [Existing dashboard launch behavior](../../dashboard/AGENT-LAUNCH.md).
