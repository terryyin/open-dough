# Use sidebars consistently across the Dashboard

**Identity:** SEED-417#use-sidebars-consistently-across-the-dashboard

**Source:** [Use sidebars consistently across the Dashboard](../../seeds/SEED-417-use-sidebars-consistently-across-the-dashboard.md#use-sidebars-consistently-across-the-dashboard)

## Goal and scope

Give developers one show, hide and reopen interaction for Sessions, Intent
Files and Review changes Files. A side-by-side sidebar shares the available
room with its reader. A drawer opens from the left without taking reader space
and consumes the outside click or tap that dismisses it. The Files controls
row fits on a phone with the controls applicable to the current scope.
Use the story's separate owners for Home navigation, filter semantics and
the unified tree. Keep the right-hand Side panel's own behavior.

## Current decisions

- Reuse Sessions' left overlay, mounted contents and reachable launcher as
  the starting point. Extend the existing Files toggle contract to use the
  same presentation and dismissal state as Sessions. Preserve the distinct
  button labels, badges and persistence policies. Reuse the Review Files
  divider's width preference and the existing room measurements. Files in a
  constrained Review uses its panel's actual room, including a narrow split
  inside a wide window. A drawer's width must leave usable dismissal space.
- A single active drawer owns outside pointer input and Escape. Keep the
  active toggle reachable, including from a maximized Side panel, and
  restore focus on dismissal. Contain keyboard movement while the drawer
  is open. Keep modal dialogs' existing input priority. The backdrop
  receives the complete outside gesture so closing cannot click through or
  toggle a second sidebar. Leaving the drawer's owner or changing to docked
  mode releases its input boundary. Docked sidebars can coexist.
- A newly entered narrow Files view starts with its reader available.
  Docked Files retains its own visibility and reading state. Selecting a
  file in a drawer performs the existing path action and exposes the selected
  reading; folder disclosure stays available in the open drawer. Sessions'
  existing preference, shortcut, badges, optional sections and session handoff
  remain view-owned. Distinguish the active toggle from other copies through
  the existing control relationships.
- [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#dashboard-ui-concepts)
  distinguishes the Sessions sidebar and Side panel, and keeps navigation
  and layout in the UI. One sidebar implementation shares visibility and
  interaction mechanics. The views supply content and actions.
  [Dashboard UX/UI North Star, Review in Intent](../../../docs/dashboard-ux-ui-north-star.md#review-in-intent)
  governs the Files toolbar control and Home, Intent only, Changes only order.
  Lay out the applicable actions as their owners supply them. Verify the
  composition with controlled action inputs while a supplier is unavailable.
  [Board interaction, Touch browsing and selection](../../../docs/dashboard-board-interaction.md#touch-browsing-and-selection)
  governs use of coarse-pointer targets and the established Board handoff.
- Apply [directly testable production code](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support),
  [act as soon as the page allows](../../NORTH-STAR.md#act-as-soon-as-the-page-allows)
  and [plain Vitest for unit tests](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e).
  Mounted proof drives the actual frame, Intent and Review through the
  existing typed published-work, Intent and Review inputs. Exercise real
  browser hit-testing, focus and geometry. Use the retained e2e journeys for
  production navigation and Review wiring.

## Decisive premises and baseline

Observed on 2026-11-25 at `f4d03aae4` in the owned macOS checkout,
Node 24.21.0, Chromium and the locked dependencies. Trunk through
`6dbe3deb7` changed none of the dashboard or e2e paths used here.

| Consuming operation and profile | Result and planning consequence |
| --- | --- |
| `npm run test:dashboard:frontend -- dashboard/frontend-tests/intent/intent-sidebar-toggle.spec.ts dashboard/frontend-tests/review/story-review-files-divider.spec.ts dashboard/frontend-tests/review/story-review-touch-height.spec.ts dashboard/frontend-tests/sessions/recently-done-sessions-sidebar-touch-mount.spec.ts dashboard/frontend-tests/navigation/board-paging-sessions-sidebar.spec.ts` | Nine passed. Intent's wide reader recovered its selected test, Proof, folders and scroll after hiding and reopening the Files column. At 640 px the column took part of the reading height. The Review Files divider changed both widths and was removed on hide. A narrow Review still let the reader reach status and code, a Sessions entry reached its Board destination, and an inside touch reached Recently done details. |
| The same frontend runner with temporary `intent/intent-sidebar-observation.spec.ts` and `review/review-sidebar-observation.spec.ts`, both at 390 × 844 with native CDP touch. The probes used the existing Intent file-layout and published-session Review mounts. | Two passed. Sessions ended at x=288; tapping the underlying Intent Files control at x=352 toggled Files while Sessions remained open. In Review the file list ended at y=228 and the diff began at y=249. A native tap on Refresh produced its success status while Files stayed open. The probes were removed. Slice 1 takes the former gesture as its regression; Slices 2 and 3 replace the stacked layout and preserve reader access. |
| `npm run test:e2e -- --workers=2 e2e/review/story-review-panes.spec.ts e2e/sessions/sessions-sidebar-keyboard.spec.ts e2e/sessions/sessions-sidebar-touch.spec.ts` with `OPEN_DOUGH_E2E_PROOF_RECORD` set to a temporary file | Strict pass for all five cases. The Review journey read real fixture diffs in a wide and covering panel, including independent scroll and pane recovery. Sessions preserved terminal input and dialog priority for keyboard shortcuts, and touch navigation reached the chosen project and session after rotation. |
| Standalone Chromium, `page.setContent()` with the maintained unified Intent [design example](../../seeds/SEED-420-unified-intent-review/preview.html), 320 × 640 touch viewport; also a native modal with the launcher outside its dialog. | All three story controls shared one row with 44 px height and used 227 of 282 available px. The sketch kept Changes only visible and disabled in project scope; the current seed requires omission. The native modal moved focus to its internal Close and refused focus on the external launcher. These observations compare mechanisms and size the row. They carry no production acceptance. |

## Outside-in proof

| Promise | Owning slice and observation |
| --- | --- |
| Sessions toggle, reopen and consume an outside click or tap. Escape and focus return work; docked Sessions stays open while the page works. | 1. Mounted frame in Intent with the Files action behind Sessions, using real hit coordinates twice. Observe both expanded states and focus. Preserve Board and terminal navigation from Sessions. |
| Intent Files overlays at drawer widths, exposes selected reading and recovers the browsing place; project and story views retain their separate docked choices. | 2. Mounted Intent through Project and story reading, including no-file views. Observe reader bounds, background action before and after dismissal, selection and scroll after reopening. Drive a wide page control while docked. |
| Review changes Files works at phone widths and in a narrow split, preserves the diff and independent width choice, and shares the active drawer boundary with other surfaces. | 3. Mounted Review and real frame. Observe reader bounds and selected diff, outside Refresh counts or status, reopen, width recovery when docked, and single-gesture dismissal across Sessions and Files. Retain a real Review changes journey with synthetic Git evidence. |
| Files stays reachable and the row presents Home and applicable filters in one line. | 4. Mounted production Files row with story and project controls at 320 CSS px, using actual controls where supplied or typed action callbacks as inputs. Observe order, omission in project scope, reachable toggle, nonoverlapping geometry, and operation of each supplied action. |

## Consumer trace and local gates

Run the installed [consumer trace](../../../.agents/skills/dough-execute-plan/scripts/consumer-trace.mjs)
after each diff. The preparation trace used `--base HEAD` and the terms
`page-with-sessions-sidebar`, `closeOverPage`, `intent-files-hidden`,
`story-review-workarea`, `Hide files`, `Files divider` and `Sessions sidebar`.
Follow changed helpers to their call sites. The initial proof selection is:

| Reached boundary | Disposition at implementation |
| --- | --- |
| Frame tracks, Board paging and keyboard, Session selection and Side panel handoff, including maximized and covered layouts | Run mounted `board-paging-sessions-sidebar`, `board-reading-keys`, `frame-sessions-look`, `development-intent-frame-sessions` and the affected `side-panel-width*` cases. Keep Sessions sidebar row, optional list, host status and resize consumers where the frame geometry or shared input reaches them. Run retained e2e `sessions-sidebar-keyboard`, `sessions-sidebar-touch`, `sessions-sidebar-stays-as-left` and the navigation and continuity consumers of any changed handoff. |
| Intent toolbar order, reading bounds, scope switches and independent scroll | Run mounted `intent-sidebar-toggle`, `intent-story-views-narrow`, `intent-ci-status-layout`, `intent-gherkin-layout` and affected Done/CI source consumers. The narrow stacking assertion becomes a drawer observation. Trace the comparison mount's use of `intent-files-hidden` to its layout readers before changing that class. |
| Review toolbar preconditions, details and status height, file list, diff, divider and panel width | Run mounted `story-review-toolbar-truthful*`, `story-review-details`, `story-review-touch-height`, `story-review-files-divider*` and `side-panel-width-files-room`. Run e2e `story-review-panes` and `story-review-touch`. Replace assertions for stacked panes with independent drawer and reader geometry. Keep tests for empty/unavailable review and desktop divider bounds. |
| Story and project Files header composition and current filter placement | Run mounted Files layout cases on the Story and Project entry points. Keep the current actions through their native controls. Verify row geometry, order and interaction separately from inventory and Home results. |
| Historical done records, static design references, fixture-only copies with no dependency on the new input/placement, and unchanged server reads | Exclude from reruns for this UI effect. Revisit any consumer whose fixture, selector, effective room or action boundary changes. |

- Use `npm run test:dashboard:frontend -- <specs>` and
  `npm run test:e2e -- <specs>` for the reached readers, with
  `npm run typecheck:dashboard` and lint for affected Dashboard code.
  For long runs, start fully awake on AC with `caffeinate -s -i`. On battery
  start fully awake with the lid open under `caffeinate -i` and check the sleep
  log afterwards. See [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
- Follow the [shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
  and [post-change refactoring](../../../.agents/skills/dough-post-change-refactor/SKILL.md)
  before each commit. Apply the configured MakeMe and page-object selection
  before test changes. Route e2e controls through the existing Dashboard,
  Sessions sidebar and Review changes page-object owners.
- The frame and Intent owners are near the file size limit. Keep presentation
  in the shared sidebar code and move any local view-only logic along its
  existing seam if edits push those owners past the limit.

## Ordered slices

### 1. Dismiss Sessions before acting on the page

Type: Behavior
Status: planned
Proof: Mounted frame with a real outside click and native touch tap, keyboard
dismissal and return, and docked focus and main-content interaction. Run the
Sessions and Board consumers above that read the changed interaction.

Behavior: With the Sessions sidebar open over the page, a click or tap beyond
its edge closes it, while the underlying action waits for a second gesture.
The reachable Sessions toggle and existing shortcut can reopen it. Preserve
the session-selection focus handoff and docked interaction. Extract only the
placement, open/close and input-boundary mechanics needed here.

### 2. Browse Intent files in a drawer when room is tight

Type: Behavior
Status: planned
Proof: Mounted Intent Project and story entry points at phone and docked widths,
using existing location and published comparison fixtures.

Behavior: At drawer widths the Files control opens the file list over a
full-size reader. Using a folder disclosure keeps the drawer open. Selecting
a file shows its reading and lets Files reopen to the same browsing place.
The other dismissal paths preserve the reader. Wide Project and story views
keep their existing scoped choice and independently scrolling reader.

### 3. Use the same Files drawer in Review changes

Type: Behavior
Status: planned
Proof: Mounted Review width, input and navigation cases, plus the real-frame
Review and Sessions journey. Verify the second-click action from the same
coordinates and the preferred width after the divider returns.

Behavior: In a narrow Review changes panel, including inside a wide frame,
Files opens over the diff as a left drawer. Dismissing it returns access to
the same diff. Choosing a file exposes that diff, and reopening Files
recovers the tree. At docked widths the existing divider and preference
govern the file sidebar and the diff remains interactive. A Sessions or
Files drawer in the same frame owns one dismissal, including during resize
and panel replacement. Keep the toolbar gated by the comparison that lists
files.

### 4. Keep the Files sidebar controls together on a phone

Type: Behavior
Status: planned
Proof: Mounted production row at phone width for both scope shapes. Measure
the visible controls' bounds, observe accessible order, and operate the
supplied actions. Confirm the Files toolbar affordance still opens the row.

Behavior: With the applicable file actions available, the sidebar's first row
keeps Home, Intent only and Changes only in order on one line. The Home icon
has an accessible name and the actions remain touch and keyboard operable.
Whole-project scope leaves Changes only out of the row. Preserve live controls
and their original action owners as they are supplied.

## Plan review

Slice-plan refinement was unnecessary after construction. Each slice owns an
independent observable change and the three sidebar entry points use the same
dismissal rule. The remaining Files surfaces adopt that same rule in their
named slices. This review identified no remaining slice-specific concern.
