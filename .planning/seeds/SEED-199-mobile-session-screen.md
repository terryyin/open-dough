---
id: SEED-199
status: active
planted: 2026-10-31
planted_during: Terry's request for full-screen mobile sessions and a compact session header
trigger_when: A developer opens a session on a phone or reads its header at any screen width
scope: one responsive session-view story
---

# SEED-199: Give mobile sessions the screen and simplify their header

## Why This Matters

Developers using a phone need room to read and interact with their active
session. Terry's screenshot shows a terminal occupying the upper half of the
page, with the dashboard still visible below. Its header also spends several
lines on a long story title and the session UUID. Opening a session should
give it the mobile viewport until the developer closes the view, while a
compact header identifies the story and the kind of session.

## Alternatives and Decision

Queue one product story first, following Terry's instruction for work beyond
a one-shot fix. Removing the UUID alone would be a small edit, but the main
outcome replaces the intentional half-height stacked layout with a mobile
session screen. It needs coherent treatment of background navigation, Close,
focus return, terminal fitting, and orientation or available-height changes,
plus revision of existing touch and panel-layout proof. That warrants bounded
planning rather than a trivial one-shot change.

Keep the header simplification with the mobile session outcome. The separate
[project-header story](SEED-198-responsive-project-header.md#responsive-project-header)
changes the dashboard banner and project selection; neither story needs the
other to deliver its value.

## Selected Stories

<a id="mobile-session-screen"></a>

### Use the full mobile screen for sessions and simplify their header

**Identity:** SEED-199#mobile-session-screen
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary:** A developer reading and interacting with a dashboard session,
especially on a phone.

**Goal:** Give an opened mobile session the available screen and keep its
header compact while retaining the story and workflow context.

**Scope:**

- On mobile-sized viewports, opening or activating a session presents its
  session view across the available browser viewport. The dashboard banner,
  Board, and Sessions sidebar are out of view and cannot receive background
  interaction while that session view is open. This concerns the session
  currently opened in the dashboard, not every session running in the
  background. It does not require browser or operating-system fullscreen.
- Keep Close reachable. Closing the session view returns to the dashboard's
  existing project, selection, and scroll context, using the established focus
  return behavior. Close detaches the view; it does not stop the session or
  mark its work done. Reopening it returns to the same session.
- Fit the terminal to the available mobile space, including rotation and
  reduced visible height while entering text. Preserve the session and its
  interaction state across those layout changes. Do not offer a mobile
  Restore action that reveals the old dashboard split; Close is the route
  back to the dashboard.
- On both mobile and desktop, remove the detailed session UUID from the
  session view's top information bar. Retain the workflow label, such as
  "Refinement session", and the story title. Other workflows retain their
  correct labels; this does not rename every session as refinement. Session
  identifiers remain available where existing session details need them.
- At narrow widths, truncate the story title so it does not consume several
  header lines or push the session type and controls out of reach. Keep the
  complete title available to assistive technology and through a usable
  existing or proportionate disclosure for users who need to read it.
- Retain the desktop panel's split, resizing, and Maximize/Restore behavior;
  the compact information bar applies there too. Choose the responsive
  boundary from usable space rather than hard-coding the screenshot's size.
- Update maintained navigation documentation and the affected session-layout
  and touch journeys. Unrelated dashboard-header and story-review changes
  remain outside this story.

**Evaluation:**

1. At phone width, open the screenshot's refinement session with its long
   story title. The session fills the available viewport, "Refinement session"
   stays readable, the title is compact, and the terminal and Close control
   remain usable. The dashboard is neither visible nor reachable behind it.
2. Enter text, rotate the phone, and reduce the visible height as when using
   its keyboard. The same session remains usable and fitted to the available
   room, with the compact header and Close still reachable.
3. Close the view and return to the same dashboard project and browsing
   context. The session remains running and can be reopened. Touch and
   keyboard users can leave the session view and resume dashboard work.
4. At desktop width, open a session and use the existing split, divider, and
   Maximize/Restore controls. Its header shows the story title and correct
   session type without the UUID. Resizing into and out of the mobile layout
   preserves the opened session and the desktop width preference.

**Effort hypothesis:** M, medium confidence. Header cleanup is small; the
responsive navigation change and terminal fitting across touch, focus, and
height transitions need planned verification.

**Product prerequisites:** None established. Reconcile shared panel changes
with other work without inventing a dependency on the project-header story.

**Safe stopping point:** A mobile session occupies the screen until closed,
with a compact, identifiable header on all screen sizes, independently of
later dashboard navigation work.

## Breadcrumbs

- Terry's 2026-10-31 request and attached portrait screenshot: mobile-only
  full-screen session behavior, UUID removal on mobile and desktop, retained
  refinement label, possible narrow title truncation, and first-priority
  queueing on main with origin synchronization when larger than one-shot.
- [Session header](../../dashboard/src/Terminal.tsx),
  [terminal styles](../../dashboard/src/agent-terminal.css), and
  [shared panel layout](../../dashboard/src/side-panel.css).
- [Page frame](../../dashboard/src/PageFrame.tsx),
  [panel state and focus return](../../dashboard/src/pageSidePanel.ts), and
  [panel width](../../dashboard/src/sidePanelWidth.ts).
- [Touch session journey](../../dashboard/tests/agent-terminal-touch.spec.ts),
  [maximize journey](../../dashboard/tests/agent-terminal-maximize.spec.ts), and
  [stacked panel journey](../../dashboard/tests/side-panel-width-stacking.spec.ts).
- [Maintained navigation behavior](../../docs/dashboard-navigation.md).
