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
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary:** A developer using the dashboard on desktop or a narrow screen.

**Goal:** Reclaim header space by removing the unwanted project-information
disclosure and combining narrow-screen project selection with the active title.

**Scope:**

- Remove the project title's source-information expansion completely: the
  disclosure, its contents, and supporting state, handlers, styles, imports,
  props, helpers, and documentation that become obsolete. On a wide screen the
  project name is a plain title, with the existing tab-shaped project choices
  retaining their current behavior.
- Trace supporting reads through the frontend and server. Delete API calls,
  endpoints, request handling, and data processing that exist solely for the
  removed feature or become unused after removal. The current `SourceStatus`
  renders the already-read `source` and `work`; no disclosure-specific API call
  was found during initial inspection. Shared reads needed to populate and
  refresh the Board remain necessary. Check actual consumers rather than
  assuming that every source-related read belongs to the disclosure.
- Delete the removed feature's tests, fixtures, helpers, and assertions when
  they serve no surviving behavior. Do not replace them with negated assertions
  that the disclosure, content, or calls are absent. Where a shared journey also
  proves surviving published-read behavior, remove its obsolete portions and
  observe that surviving behavior at its appropriate boundary.
- At narrow widths, replace the separate project tabs with a dropdown opened
  from the active project title. Show the current project's name in that control;
  choosing another configured project updates the title and uses the existing
  project-selection behavior. Opening it offers project choices, not the removed
  information. Keep the wide-screen tabs.
- Keep selection usable with touch and keyboard and ensure the compact header
  fits narrow screens without the current multi-row tab list. Resizing between
  layouts preserves the selected project and makes the appropriate control
  reachable. Choose the layout breakpoint from available header space during
  implementation rather than treating the screenshot's dimensions as a rule.
- Update maintained header/navigation documentation and add positive proof for
  the new responsive selection behavior.

**Evaluation:**

1. On a wide screen, Open Dough is a plain project title and the existing
   tab-shaped choices switch to Doughnut through the established selection flow.
2. On a phone-width screen with the screenshot's five configured projects, the
   title shows Open Dough in one dropdown control. Activating it offers those
   projects; choosing Doughnut updates the title and displays Doughnut's work.
3. Keyboard and touch users can open the compact selector and choose a project.
   Widening and narrowing the page retains that project and a usable selector.
4. Review the aggregate change for deletion of the old feature and its exclusive
   support throughout the stack, including obsolete tests. New automated checks
   demonstrate useful selection behavior; they do not turn removed tests into
   negation tests. Surviving Board publication and refresh behavior still has
   meaningful proof.

**Effort hypothesis:** M, medium confidence. The visible change is small, but
the shared observation-test dependence on the source panel and the responsive
keyboard/touch transition require bounded planning and verification.

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
  [project choices](../../dashboard/src/ProjectSelect.tsx).
- [Header journeys](../../dashboard/tests/dashboard-header.spec.ts) and
  [shared observation assertions](../../dashboard/tests/dashboardPage.ts).
- [Maintained navigation behavior](../../docs/dashboard-navigation.md).
