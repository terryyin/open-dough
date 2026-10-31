---
id: SEED-198
status: active
planted: 2026-10-31
planted_during: Terry's request to simplify the dashboard project header and mobile project selection
trigger_when: Developers read or switch projects in the dashboard, especially on narrow screens
scope: one dashboard header story
---

# SEED-198: Simplify the project header across screen widths

## Why This Matters

Developers need room for their work and a clear way to switch projects. Terry's
phone screenshot shows a project title that opens unwanted source information
above several rows of project choices. The title should identify the project;
at narrow widths it should also replace those separate choices with a dropdown.

## Alternatives and Decision

Queue one product story at the top of the Backlog list, as Terry requested for
work beyond a one-shot quick fix. This combines a coherent header outcome with
complete feature removal and responsive selection. The existing source panel
is also used by shared test helpers and many published-observation journeys;
removing it requires separating obsolete proof from proof of surviving behavior.
Together with keyboard, touch, and resize behavior, this exceeds a genuinely
trivial one-shot change. Hiding the panel alone would leave precisely the
supporting code and tests Terry asked to delete.

## Selected Stories

<a id="responsive-project-header"></a>

### Simplify the project header and use a dropdown on narrow screens

**Identity:** SEED-198#responsive-project-header
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/424-responsive-project-header/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"d7e446f165a3646136c1f84d7302da2ead403566a65c134e6a56c6f3b9b5d51c","plan":"11ae422fc07b38f6f414e0584b0c41438054ab60b95e1d087abd16f42622bcee"}}
```

**Beneficiary:** A developer using the dashboard on desktop or a narrow screen,
by pointer, touch, or keyboard.

**Goal:** Reclaim header space and make project switching obvious: the project
name identifies the project and, at narrow widths, is also the one control for
choosing another project, instead of opening source information above several
rows of project tabs.

**Scope — required behavior:**

- Remove the project title's source-information disclosure completely: the
  disclosure, its repository/ref/revision/retrieval content and note, and
  supporting state, handlers, styles, imports, props, helpers, and
  documentation that become obsolete. This includes banner behavior that exists
  only for the disclosure, such as re-measuring the banner height after a
  just-closed disclosure, and comments elsewhere that justify behavior by the
  disclosure (for example the read status's reason for not showing its result).
  `SourceStatus` renders only already-read `source` and `work`; it has no API
  call, endpoint, or server processing of its own, so the shared Board read
  stays.
- On a wide screen the active project's name is a plain, non-interactive page
  title, and the existing tab-shaped project choices keep their current
  behavior.
- At narrow widths, the active project's title is the project selector and the
  separate tab list is not shown. It shows the current project's name, is
  recognizable as a dropdown, and opening it offers the configured projects
  with the current one indicated. Choosing a project uses the existing project
  selection (URL, history, published read) and updates the title. Dismissing
  without a choice leaves the project unchanged and returns focus to the
  title control.
- The compact selector works by touch and keyboard, and the compact header
  fits a phone width without a multi-row project list. Resizing between layouts
  keeps the selected project and leaves the appropriate control reachable. The
  layout switches where the tabs no longer fit the header, not at the
  screenshot's dimensions.
- Page-wide Left/Right project cycling keeps working at narrow widths. Where it
  currently moves focus to the selected project radio after focused content
  disappears, it moves focus to whichever project control is shown.
- Tests: delete the disclosure's own tests and assertions without negated
  replacements. Many journeys use the disclosure's region only as evidence of
  which revision the page has read (about 150 assertions, plus a retrieval
  time). Move that surviving published-read evidence to a boundary that
  remains: the always-present read status announces the read revision (short
  form) and retrieval time, and failure and rate-limit alerts name the revision.
  Update maintained navigation documentation and add positive proof of
  responsive selection.

**Scope — accepted consequence:** Sighted users no longer see the repository,
ref, full revision, retrieval time, or the "only published changes are
visible" note in the header; the read result remains spoken and problems
remain visible. Terry requested this information's removal as unwanted.

**Deferred promises:** Making the read result visible elsewhere, project search
or grouping in the selector, and moving other banner controls (Sessions,
System settings, product mark) beyond what the compact layout needs to fit.

**Required restrictions:** None added. A single configured project, or any
number of projects, is handled by the same selector rule.

**Key examples:**

1. Wide screen, five configured projects, Open Dough selected → page loads →
   "Open Dough" is a plain heading that opens nothing; choosing the Doughnut tab
   shows Doughnut in the title and Doughnut's work through the established
   selection flow.
2. Phone width (portrait), the same five projects → page loads → the header shows
   "Open Dough" in one dropdown-styled title control and no row of project tabs;
   tapping it offers the five projects with Open Dough indicated; tapping
   Doughnut closes the choices, the title shows Doughnut, and the Board shows
   Doughnut's work.
3. Phone width, keyboard → focus the title control and open it → the projects
   are offered; arrow keys or Tab reach Pygardon, Enter or Space selects it;
   Escape instead closes the choices with Open Dough unchanged and focus on the
   title control.
4. Doughnut chosen at phone width → widen the page past the breakpoint → the
   title is plain "Doughnut" with the Doughnut tab selected; narrowing again
   shows the dropdown title "Doughnut".
5. Phone width, focus on a story card in Open Dough → press Right Arrow →
   Doughnut is selected; when the focused card disappears, focus lands on the
   compact title control.
6. A journey that previously read the new revision from the source panel →
   the origin advances and the page rereads → the read status announces the new
   short revision, and the journey asserts that instead.

**Evaluation:** Review the aggregate change for deletion of the old feature and
its exclusive support, including obsolete tests, without negation tests. New
automated checks demonstrate examples 1–5; surviving publication and refresh
journeys still prove which revision was read (example 6).

**Effort hypothesis:** M, medium confidence. The visible change is small; the
cost is migrating the published-read evidence across many journeys and the
responsive keyboard/touch behavior.

**Product prerequisites:** None established. Other shared-frame work can
reconcile this header behavior without becoming a new blocking dependency.

**Safe stopping point:** A compact, usable project header with the old disclosure
and its exclusive supporting code and tests deleted, regardless of later
Development/Intent frame work.

## Breadcrumbs

- Terry's 2026-10-31 request and attached portrait screenshot; explicit complete
  deletion requirement and first-priority instruction for a new backlog story.
- [Current banner](../../dashboard/src/DashboardBanner.tsx),
  [source disclosure](../../dashboard/src/SourceStatus.tsx), and
  [project choices](../../dashboard/src/ProjectSelect.tsx),
  [read status](../../dashboard/src/PublishedReadStatus.tsx), and
  [project arrow navigation](../../dashboard/src/projectKeyboardNavigation.ts).
- [Header journeys](../../dashboard/tests/dashboard-header.spec.ts),
  [compact header journeys](../../dashboard/tests/dashboard-header-compact.spec.ts),
  and [shared observation assertions](../../dashboard/tests/dashboardPage.ts).
- [Maintained navigation behavior](../../docs/dashboard-navigation.md).
