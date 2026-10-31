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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/425-mobile-session-screen/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"df4ce594081db0718450d4414a025505508a99933c1d31f4b85444f8dd2bb22d","plan":"3adbef12a99b74c9f3def197badd495eb286c31aec089f3bca861e2309c43a8c"}}
```

**Beneficiary:** A developer reading and interacting with a dashboard session,
especially on a phone.

**Goal:** Give an opened session the whole screen wherever the dashboard has
no usable room beside it, as on a phone, and keep the session header compact
while retaining the story and workflow context, so the developer can read and
type into the session there and still return to the dashboard.

**Scope:**

- Wherever the Side panel cannot sit beside the Board — the existing
  boundary: the window is 800px wide or narrower, or the room beside an open
  Sessions sidebar cannot hold both at their 20rem minimums — opening or
  activating a session shows the Side panel across the available viewport in
  place of today's half-height stacking. The banner, Board, and (on a narrow
  window) the Sessions sidebar are out of view and take no background
  interaction while it is open. Where the sidebar sits in its own column on a
  wider window, the panel takes the page column's room beside it, as Maximize
  does. This concerns the session shown in the panel, not sessions running in
  the background, and needs no browser or operating-system fullscreen.
- While the panel occupies the screen this way it offers no Maximize or
  Restore control (Terry, 2026-10-31: it is always maximized there), so no
  control reveals the old split; Close, with its existing shortcut, is the
  route back. Mark as done and the other content operations stay.
- The occupied-screen arrangement is the shared Side panel's, so a story
  review opened there gets the same screen and loses Maximize/Restore too, and
  the final report, which has only Close, gets the screen. These follow from
  the shared rule and add no separate promise beyond keeping their existing
  journeys passing.
- Close returns to the dashboard's existing project, selection, and scroll
  context, with the established focus return. Close detaches only; the session
  keeps running and is not marked done. Reopening returns to the same session.
- Keep fitting the terminal to the panel as the browser's viewport changes,
  including rotation and a reduced height such as an on-screen keyboard that
  resizes the page, without losing the session or its interaction state.
- On every width, the panel header's second line names the workflow, such as
  "Refinement session", without the session UUID. Other workflows keep their
  correct labels. Session identifiers remain where existing session details,
  such as Sessions sidebar entries, show them.
- Where the header lacks room, the story title stays on one line, truncated,
  so it cannot push the session type or controls out of reach. The complete
  title remains available to assistive technology and through a proportionate
  disclosure, such as a tooltip or tapping the title to show it in full.
- At widths with a usable split, the panel keeps its split, Panel divider,
  preferred width, and Maximize/Restore. A Maximize the developer chose there
  is their choice; the occupied-screen arrangement is derived from the room
  and never overwrites it or the preferred width.
- Update the maintained navigation documentation and the affected
  side-panel stacking, maximize, and touch journeys. Unrelated
  dashboard-header and story-review changes remain outside this story.

**Deferred promises:**

- Browser Back while a session occupies the screen keeps today's history
  behavior; making Back close the panel is not promised.
- An on-screen keyboard that overlays the page without resizing it (iOS
  Safari's default) is not separately tracked through the visual viewport.
  Whether its cursor line stays visible there is an unobserved hypothesis;
  check it on a phone after delivery and raise a follow-up if it fails.

**Key examples:**

1. Phone portrait (390×844), the screenshot's refinement session with its
   long story title → open its terminal → the panel fills the viewport; the
   header shows one truncated title line and "Refinement session" with no
   UUID; Mark as done and Close are visible, Maximize is not; the Board and
   banner are neither visible nor reachable by tap or Tab.
2. That open session → type text, reduce the viewport height to 400px and
   then rotate to landscape → the same session stays attached and fitted; the
   header and Close stay visible.
3. That open session, opened from a card partway down the Board → Close →
   the same project and Board scroll position return, focus goes back to the
   opening card, the session is still running, and reopening shows it again.
4. Desktop 1280px, a session open split beside the Board → the header shows
   the title and "Execution session" (or the session's own workflow) without
   the UUID; the divider and Maximize/Restore work as before.
5. Desktop split at a chosen width, not maximized → narrow the window to
   700px → the panel takes the screen without Maximize; widen again → the
   split returns at the chosen width, still not maximized. Maximized before
   narrowing → it is still maximized after widening, with Restore offered.
6. An 880px window with the Sessions sidebar open, leaving too little room
   beside it → open a session → the panel takes the page column's room beside
   the sidebar, without Maximize, instead of stacking half-height.

**Architecture:** The derived arrangement in the panel width module
(`sidePanelWidth.ts`) changes from "stacked" to an occupied-screen
arrangement; it remains derived from the room each render, never stored. The
page frame shows that arrangement through the existing maximized layout rather
than a second covering layout, so the stacked half-height styles are removed,
not kept beside it. Whether Maximize/Restore is offered becomes an input to
the shared panel controls (`SidePanelControls.tsx`) from that arrangement, so
the terminal and story review drop it through one rule. The stored
`maximized` choice stays in the panel state (`pageSidePanel.ts`) and is only
combined with the arrangement for display. No Accepted ADR conflicts; the
change keeps ADR 0008's Side panel and Panel divider vocabulary (the divider
is still offered only side by side).

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
- Terry's 2026-10-31 refinement instruction: remove the Maximize control
  from the view on a narrow screen, because it is always maximized there.
- [Session header](../../dashboard/src/Terminal.tsx),
  [terminal styles](../../dashboard/src/agent-terminal.css), and
  [shared panel layout](../../dashboard/src/side-panel.css).
- [Page frame](../../dashboard/src/PageFrame.tsx),
  [panel state and focus return](../../dashboard/src/pageSidePanel.ts), and
  [panel width](../../dashboard/src/sidePanelWidth.ts).
- [Touch session journey](../../dashboard/tests/agent-terminal-touch.spec.ts),
  [maximize journey](../../dashboard/tests/agent-terminal-maximize.spec.ts), and
  [covering panel journey](../../dashboard/tests/side-panel-width-covering.spec.ts).
- [Maintained navigation behavior](../../docs/dashboard-navigation.md).
