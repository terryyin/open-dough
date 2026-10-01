---
id: SEED-071
status: active
planted: 2026-10-01
planted_during: Terry's request for session-panel header controls and agent identity
scope: story
---

# SEED-071: Control the dashboard session panel from its header

## Why This Matters

A developer interacting with an agent in the dashboard can give the terminal
more room, return to the existing split, or hide it while work continues. The
header clearly identifies the agent and session and keeps finishing the session
as a separate, deliberate action.

## Story

<a id="session-panel-header-controls"></a>

### Control the dashboard session panel from its header

**Identity:** SEED-071#session-panel-header-controls
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** A developer using an embedded agent session can manage its
  visible panel and identify the agent without losing the running session.
- **Goal:** Add accessible SVG action controls and the agent's actual avatar
  to the terminal/session panel header, preserving current session content and
  unrelated panel behavior.
- **Scope:**
  - The baseline dashboard already has a left/right split with the
    terminal/session panel occupying part of the window. Maximize fills the
    available dashboard window; Restore returns to that existing left/right
    split. Maximize/Restore may be one toggle.
  - Close/minimize hides the panel and keeps the session running. Mark as done
    stays a separate header action with its established session semantics.
  - Command+Escape (⌘Esc) invokes Close. Show the shortcut in the Close tooltip
    and preserve plain Escape for terminal applications.
  - Show only the agent avatar in the header, without the human developer's
    avatar or identity. Use the agent's actual avatar rather than a placeholder
    robot. Place it to the left of the title and execution/session ID, enlarged
    to span the full height of those two text rows.
  - Place the SVG actions on the right with accessible labels and tooltips.
- **Key examples / evaluation:**
  - Open a session in the existing left/right split; maximize it to the
    available dashboard window, then restore it to that split with the same
    session content retained.
  - Activate Close by its header control or ⌘Esc; the panel hides while the
    session keeps running. Reopening retains the session under its existing
    behavior. Neither Close path invokes Mark as done.
  - Press plain Escape in a terminal application; it reaches that application
    without hiding the panel.
  - Read the header: the actual agent avatar spans the title and ID rows on
    the left, no developer identity appears, and each action on the right is
    identifiable through its accessible label and tooltip. Close's tooltip
    includes ⌘Esc; Mark as done remains separately available.
- **Boundary:** Only the terminal/session panel changes. Dashboard navigation,
  project selection, Taken cards, and surrounding UI are outside this story.
  The rejected mockup's top/bottom split and project/Taken content are not
  requested changes. Preserve the current session content and unrelated panel
  behavior.
- **Verification still needed:** ⌘Esc was selected by Terry but has not been
  tested. Verify browser compatibility and shortcut delivery with terminal
  focus in the supported dashboard browsers before claiming acceptance; record
  any browser reservation or delivery limitation rather than assuming support.
- **Dependencies:** No new prerequisite is established by this capture. Use the
  existing session panel and its current lifecycle behavior; this story does
  not expand native-host support or redefine Mark as done.
- **Effort hypothesis:** Unestimated. This is a captured request; refinement
  and approach selection remain later work, with no executable slice plan or
  readiness assessment claimed here.

## Breadcrumbs

- Terry's direction in this chat, 2026-10-01: queue this session-panel-only
  improvement at the top of the product backlog, retain the existing left/right
  split, distinguish hiding from finishing, use the actual agent avatar, and
  choose ⌘Esc for Close with browser verification still pending.
- [Product backlog](../PRODUCT-BACKLOG.md).
- [Existing dashboard session journey](SEED-052-start-agent-work-from-dashboard.md).
