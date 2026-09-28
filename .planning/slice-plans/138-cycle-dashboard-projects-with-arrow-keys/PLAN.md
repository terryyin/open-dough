# Cycle dashboard projects with left and right arrow keys

## Source

[Cycle dashboard projects with left and right arrow keys](../../seeds/SEED-053-cycle-dashboard-projects-with-arrow-keys.md#cycle-dashboard-projects-with-arrow-keys)
— Identity: SEED-053#cycle-dashboard-projects-with-arrow-keys.

## Goal and scope

Developers switch the dashboard's three projects with unmodified Left/Right
keys while browsing either stories or the agent roster. Right advances and Left
reverses the displayed catalog order, wrapping at both ends. Selection, URL
history, and shown project data follow the existing pointer-selection journey.
Focused project radios consume one navigation step and retain useful focus.
Editing, other arrow-operated controls, handled events, modifier shortcuts, and
the open help dialog retain their own keyboard behavior.

Page-wide scope is the stated refinement assumption, pending any correction to
the focus-scope question offered to the developer. No project catalog change,
shortcut settings, new reading policy, or project-registration capability.

## Existing solution and direction

PFE responsibility: translate a keyboard navigation intention into the existing
project selection, rather than create another project or observation owner.
`dashboard/src/publishedSource.ts` owns ordered `catalog` data;
`ProjectSelect.tsx` renders native radios; `App.tsx` passes
`useDashboardRoute().selectProject` into the banner. `dashboardRoute.ts` owns
history and view retention; `publishedObservation.ts` owns fresh project reads
and clearing the previous snapshot. Reuse those responsibilities.

Extend keyboard handling at the dashboard UI boundary with one cyclic catalog
rule. Coordinate it with native radio handling so one key cannot advance twice.
Do not put keyboard concerns into authenticated reads or create parallel route
state. When a project radio holds focus, native navigation may remain the owner
if it satisfies wrap and single-step proof. Elsewhere, the new shortcut calls the
same project-selection callback. Preserve focused controls that survive a switch;
if the focused story/roster content disappears, put focus on the selected project
control so subsequent keyboard navigation remains usable.

Follow [Architectural North Star: One backlog interpretation, separate
observation and presentation](../../NORTH-STAR.md),
[dashboard navigation](../../../docs/dashboard-navigation.md), and Accepted
[ADR 0002 — Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md):
one coherent representation of project selection and the smallest useful change.
This local UI extension requires no new architectural topic or ADR.

## Decisive premises

Observed at `fa8ab585` (preparation announcement `223cba87` changes only its
assignment profile).

| Premise | Literal observation | Result |
| --- | --- | --- |
| Catalog order is Open Dough, Doughnut, Pygardon | Read `dashboard/src/publishedSource.ts` | Three ordered entries, default Open Dough |
| Native selector already owns focused arrow navigation | Read `ProjectSelect.tsx`; search `rg -n 'ArrowLeft\|ArrowRight\|keydown' dashboard/src dashboard/tests`; inspect `project-read-isolation.spec.ts` and `project-read-recovery.spec.ts` | Radios use native change events; existing browser tests press Left on a focused selection during held/failed reads; no page-wide handler exists |
| Pointer selection already preserves view, records history, and starts an isolated read | Read `dashboardRoute.ts:87`, its `App.tsx` caller, and `publishedObservation.ts:225` | `selectProject` pushes the project/view URL and delegates to `selectSource`, which clears earlier work and starts a fresh read |
| Help is an actual modal and there are no existing editing fields to repurpose | Read `PreparationLegend.tsx`; search `rg -n 'input\|textarea\|contentEditable\|dialog' dashboard/src` | `showModal()` owns help focus; only current inputs are project radios; editing exclusions are protective shortcut behavior, not a new product form |
| Existing proof exercises real selection and reading without real GitHub | Read `dashboard/tests/README.md`, `dashboardTest.ts`, `publishedOrigin.ts`, `catalogProjectRecords.ts`, and `project-selection.spec.ts` | Playwright runs built UI and local read boundary; synthetic gh answers only replace external GitHub; three-project records are reusable |
| Focused selection and read isolation baseline is executable | `env -u NO_COLOR npm run test:dashboard -- dashboard/tests/project-read-isolation.spec.ts dashboard/tests/project-read-recovery.spec.ts dashboard/tests/project-selection.spec.ts` in the originating checkout | Exit 0; first run with inherited NO_COLOR/FORCE_COLOR failed quiet-output gate solely on Node warnings, resolved by removing NO_COLOR |

## Outside-in proof ownership

All promises belong to slice 1. Add a capability-named browser spec
`dashboard/tests/project-keyboard-navigation.spec.ts`, using `dashboardTest.ts`,
`parts(page)`, and the existing three-project published records. The fake supplies
GitHub facts; it must not synthesize key handling, route selection, or UI updates.

| Promise | Observable proof |
| --- | --- |
| Right cycles forward and Left backward with wrap, without selector focus | Focus Refresh; use actual keyboard presses through all three projects in both directions; assert checked radio, correct unique project content/source revision, and URL after each step |
| Selector advances exactly once with wrap | Focus selected project radio, press Right/Left at each boundary; assert newly checked and focused radio, resulting project and URL; retain existing held/failed-read selector tests |
| Existing routing and view semantics are reused | Keyboard-select projects and browser Back/Forward restores the selections; enter roster through existing UI, keyboard-switch, and assert roster view and selected project's data remain aligned |
| Editing, handled events, modified keys and modal use are preserved | Open the real help modal and press arrows, assert project unchanged, close and prove shortcut resumes; exercise the event eligibility boundary for editable targets, non-project arrow controls, prevented events and modifiers with focused contract checks |
| Focus stays useful and old project data stays isolated | Surviving Refresh focus stays put; when focused project content disappears, selected radio holds focus; assert destination-only content after switching, including while a previous read is held |

Do not add product editing controls for test fixtures. If eligibility is kept
inline, exercise it with test-only DOM controls through the production handler;
if a small pure predicate is warranted, focused unit proof may own that contract.
Use one implementation rule for cyclic order, not project-specific handlers.

## Ordered slices

### 1. Browse dashboard projects cyclically by keyboard
Type: Behavior
Status: planned
Proof: new project-keyboard-navigation browser journey plus retained
selection/read-isolation, keyboard accessibility, modal, and routing journeys;
`npm run typecheck:dashboard` and `npm run lint`.

Behavior: a developer browsing a selected project's stories or roster presses
an eligible Left/Right key → the adjacent catalog project is selected, with wrap,
its own data and route are shown, and focus remains usable. A protected keyboard
context keeps its existing behavior and does not change project selection.

Implement the UI shortcut and its proof together; update
`docs/dashboard-navigation.md` to describe page-wide shortcut scope and focus
exceptions. Keep pointer selection, native radio accessibility and existing
history/read owners coherent. Review the implicated change for refactoring
before commit using dough-post-change-refactor; verify after final edits. Execute
and deliver through dough-execute-plan only on a separate execution instruction.

Focused verification from the executing checkout:

```sh
env -u NO_COLOR npm run test:dashboard -- dashboard/tests/project-keyboard-navigation.spec.ts dashboard/tests/project-selection.spec.ts dashboard/tests/project-read-isolation.spec.ts dashboard/tests/project-read-recovery.spec.ts dashboard/tests/accessible-overview-keyboard.spec.ts dashboard/tests/preparation-legend.spec.ts dashboard/tests/source-navigation.spec.ts
npm run typecheck:dashboard
npm run lint
```

## Boundary review and current decisions

One cohesive behavior and proof loop: both directions, wrap, selector integration,
and eligibility are facets of the same keyboard selection rule. Splitting by
direction, UI wiring, or test activity provides no useful stopping point. No
Structure slice is needed. No numeric slice target/hard limit was supplied;
boundedness rests on the existing catalog, callback, and browser harness.

Review result: retain the one slice; no slice-specific blocking concern found.
No separate plan-refinement rewrite is needed. Readiness is recorded in the
story by the shared preparation recorder and grants no execution authority.

## Learnings

None changing the selected outcome or remaining work.
