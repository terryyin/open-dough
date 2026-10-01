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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/197-session-panel-header-controls/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"23039971d7dbf0ef9ecb0878896c6574bc734dfadd515a9e4600c1005f9becbc","plan":"e02906e74c04a7ad66e6909d5b0d13c0c006e06a2933cbb9e5f3de3bdbb1e588"}}
```

- **For / why:** A developer working with an agent in the dashboard's embedded
  terminal can give it more room, return to the left/right split, or hide it
  while the work continues, and can tell at a glance which agent the session
  belongs to. This keeps the dashboard a comfortable place to interact with
  agents without risking finishing a session by accident.
- **Goal:** The terminal/session panel header shows the agent's actual avatar
  beside the title and session ID and offers accessible SVG controls to
  maximize/restore and to close (hide) the panel, with ⌘Esc for Close, while
  the running session, its content, and Mark as done keep their current
  behavior.
- **Scope:**
  - **Maximize / Restore.** Maximize gives the panel the page column's room:
    the banner and stories are hidden behind it, and an open Sessions sidebar
    stays beside it so the developer can still switch sessions (⌘B still
    hides the sidebar for full width). Restore returns to the existing
    split — left/right on a wide window, the panel stacked above the page on
    a narrow one. Maximize/Restore may be one toggle whose label and tooltip
    say what it will do next. The session's terminal content and attachment
    are retained across both.
  - **Maximized lasts until Close.** Opening another session while maximized
    keeps the panel maximized. Close ends it, so the next opened session
    starts in the split; a reload starts in the split as it already does.
  - **Close hides, never finishes.** Close keeps its current meaning: the
    panel hides, the session keeps running, and the keyboard returns to the
    control that opened the panel. Reopening from a card or the Sessions
    sidebar attaches to the same session as today. Mark as done remains a
    separate header action with its current semantics.
  - **⌘Esc invokes Close**, including while the keyboard is in the terminal.
    Close's tooltip shows the shortcut. Plain Escape still reaches the
    terminal application. Like the sidebar's ⌘B, the shortcut leaves a key
    pressed inside an open dialog alone, and it does nothing while no panel
    is open.
  - **Agent avatar, no developer identity.** The header shows the session's
    recorded agent by its actual avatar, left of the title and session-ID
    rows and spanning their full height. The avatar carries the agent's name
    (for example `Ruuf-chan`) as its accessible name and tooltip; no extra
    visible name row is added. No human developer avatar or identity appears
    in the header.
  - **No actual avatar, no image.** When the session has no recorded agent
    (such as an ad-hoc session) or the agent's portrait is unavailable, the
    header shows no avatar and no placeholder; the title and ID rows read as
    they do today.
  - **Actions on the right.** Header actions sit on the right; each is
    identifiable by its accessible label and tooltip.
- **Key examples / evaluation:**
  - On a wide window with a session open in the left/right split, Maximize →
    the panel takes the page column's room and the same terminal content
    continues; Restore → back to the left/right split with that content.
  - With the Sessions sidebar open, Maximize → the sidebar stays beside the
    panel; choosing another sidebar entry opens that session still maximized.
  - Maximized, press ⌘Esc with the keyboard in the terminal → the panel
    hides, the session keeps running, the keyboard returns to the opener, and
    Mark as done was not invoked. Reopening the session → it attaches in the
    split.
  - In a terminal application, press plain Escape → the application receives
    it and the panel stays shown.
  - With the launch dialog open, press ⌘Esc → the dialog keeps its own
    keyboard and the panel is not closed.
  - A refinement session whose preparation recorded `Ruuf-chan` → the header
    shows Ruuf-chan's avatar spanning the title and ID rows on the left, its
    tooltip and accessible name say `Ruuf-chan`, and no developer identity
    appears. An ad-hoc session with no recorded agent → no avatar, title and
    ID rows unchanged.
  - Hover or focus each right-hand action → Maximize/Restore and Close are
    named by label and tooltip, Close's tooltip includes ⌘Esc, and Mark as
    done remains separately available where it is offered today.
  - On a narrow window where the panel stacks above the page, Maximize → the
    panel fills the window; Restore → it stacks above the page again.
- **Deferred:** Remembering maximized across closes or reloads, resizable
  split proportions, and a visible agent-name row are not part of this
  delivery.
- **Boundary:** Only the terminal/session panel changes. Dashboard
  navigation, project selection, Taken cards, the Sessions sidebar, and
  surrounding UI are outside this story. The rejected mockup's top/bottom
  split and project/Taken content are not requested changes. Preserve the
  current session content and unrelated panel behavior.
- **Verification still needed:** ⌘Esc was selected by Terry but has not been
  tested. Verify browser compatibility and shortcut delivery with terminal
  focus in the supported dashboard browsers before claiming acceptance;
  record any browser reservation or delivery limitation rather than assuming
  support.
- **Dependencies:** None new. The agent comes from the launch record's
  established start or preparation, which may be absent; portraits come from
  the existing agent portrait set, whose Odd-e nerd cartoons are local and
  may be missing. This story does not expand native-host support or redefine
  Mark as done.
- **Effort hypothesis:** Small: one panel component, its layout, and one
  page shortcut, reusing the existing portrait and close/attach behavior.

## Breadcrumbs

- Terry's direction in this chat, 2026-10-01: queue this session-panel-only
  improvement at the top of the product backlog, retain the existing left/right
  split, distinguish hiding from finishing, use the actual agent avatar, and
  choose ⌘Esc for Close with browser verification still pending.
- [Product backlog](../PRODUCT-BACKLOG.md).
- Refinement with Terry, 2026-10-01: maximize keeps an open Sessions
  sidebar, lasts until Close, and the avatar is named by accessible label and
  tooltip rather than a visible name row.
- [Existing dashboard session journey](SEED-052-start-agent-work-from-dashboard.md).
