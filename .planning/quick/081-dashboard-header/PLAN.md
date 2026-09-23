# Keep dashboard controls in reach and supporting context out of the way

Status: complete.

Identity: `SEED-021#compact-dashboard-controls`

Source: [refined story](../../seeds/SEED-021-observe-published-story-progress.md#compact-dashboard-controls).
Terry requested first backlog priority, refinement, and planning on 2026-09-23.
Terry subsequently authorized publication, execution, and ordinary wrap-up.
The Taken claim was published before implementation.

## Goal and scope

For developers reading published work, keep project context and common controls
reachable while scrolling and put supporting explanations behind deliberate
disclosure. Deliver a viewport-top OpenDO banner with the existing project
selector, project/source information and SVG refresh control; initially collapsed
near-future direction; and a question-mark launcher for a preparation-legend modal.
Keep actual story badges visible. Preserve the current source/read/retry model,
published evidence, keyboard access, and readable narrow/zoomed layout.

OpenDO brands the dashboard; it does not rename Open Dough or observed projects.
The final refresh instruction is authoritative: move and render as SVG, not
remove. The question mark replaces the standing legend, not card status badges.
Transient disclosure state is sufficient: same-project refresh retains direction
expansion; changing projects starts collapsed. No persisted preference is promised.

Excluded: registration, catalog changes, automatic refresh, new preparation
semantics, authentication or reader changes, navigation redesign, general modal
or icon infrastructure, and workflow/AI-skill changes. The existing UX/UI guide
has been aligned during preparation; keep relevant guidance and dashboard usage
documentation aligned with each delivered behavior.

## Existing solutions and current decisions

Follow the [UX/UI North Star](../../../docs/dashboard-ux-ui-north-star.md#connected-stages-and-spatial-navigation)
and [architectural North Star](../../NORTH-STAR.md#one-backlog-interpretation-separate-observation-and-presentation).
Reuse the current React/TypeScript/CSS application and Playwright proof boundary.
Accepted [ADR 0001: Ubiquitous language](../../../docs/adrs/0001-ubiquitous-language-accepted.md)
and [ADR 0002: Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
preserve distinct domain facts and one owner per meaning. ADR 0008 remains
Proposed; no new architecture decision or North Star topic is needed.

PFE inspected the dashboard's presentation, reader boundaries, callers, shared
test locators, accessibility helpers, and existing documentation:

| Responsibility | Evidence and selected action |
| --- | --- |
| Project selection and observation | `dashboard/src/ProjectSelect.tsx`, `App.tsx`, `publishedSource.ts`: reuse catalog/control and App's select/read/abort ownership. Moving the selector must not introduce another selected-project state. |
| Source context and refresh | `SourceStatus.tsx` renders repository/ref/revision/time and the one Refresh/Retry button; App guards reads and keeps the prior snapshot on failure. Adapt presentation in these owners; preserve the guarded callback and focusable `aria-disabled` behavior. |
| Persistent header | `App.tsx` and `styles.css` currently use a normal-flow page header. Add a compact top-pinned banner in ordinary CSS; its containing block must span page scrolling. Keep expanded direction and read-problem prose out of its fixed-height footprint. Avoid brittle fixed pixel offsets for a wrapping header. |
| Direction disclosure | App currently renders the full direction. Reuse the existing snapshot field and empty-state wording; use a native disclosure or an equivalently accessible control with local UI state. Preserve multiline text rendering. |
| Legend modal | `PreparationCard.tsx` owns BadgeLegend and card facts; `WorkStages.tsx` renders the legend when preparation exists. Reuse that content and visibility condition; add the launcher/modal there. Existing StoryDetail is an inline panel, not a modal. A native dialog with correct focus lifecycle is sufficient; no product dialog abstraction exists or is needed. |
| Proof | `dashboard/tests/dashboardPage.ts` centralizes semantic locators; `githubOrigin.ts` and `committedOrigin.ts` supply HTTP/Git fixtures. Keep the real App, control events, readers, and rendering under test. Existing accessibility helpers cover focus, contrast, wrapping, and zoom. |

The common design is one observation model with small presentation-only state.
No Structure slice is needed; keep necessary component extraction within the
Behavior that needs it. No uncertain storage/infrastructure assumption needs a
new experiment. Each slice has one observable UI capability and bounded proof.
No numeric slice target or hard limit is supplied; do not invent one.

## Ordered slices and outside-in proof

### 1. Reach project context and refresh from a persistent OpenDO banner

Type: Behavior
Status: done

Behavior: a reader scrolls a long backlog or selects/refreshes a project → the
top banner keeps OpenDO, project selection, compact source context, and the SVG
read action reachable; the selected project's ordinary observation still works.

Move the existing controls and source context into the compact banner. Give the
SVG button the accessible name Refresh/Retry, hide decorative SVG paths from
assistive technology, and retain one action with readable retrieval feedback.
Keep full revision/time accessible and distinguish retrieval time from commit
time. Preserve long text, source warnings, membership order, and focus restoration.
Allow responsive reflow; ensure keyboard-focused cards and links are not hidden
behind the banner. A sticky implementation is acceptable only if it remains at
the viewport top throughout page scrolling, as requested.

Proof: add `dashboard/tests/dashboard-header.spec.ts` using the existing origin
fixture and real control interactions. Observe the banner and controls in the
viewport after scrolling lower cards at desktop and 320 CSS pixels / equivalent
400% zoom. Verify readable project context/full evidence, no sideways overflow,
unobscured focused content, and accessible SVG naming/contrast. Select another
project and observe its actual ref/membership, then refresh. Reuse the existing
held-response, failed-refresh, and focus journeys for read suppression, retained
snapshot, Retry recovery, and identity focus; update shared locators only where
the semantic layout changed. Private read/authentication fixtures remain unchanged.

```sh
npm run test:dashboard -- dashboard-header.spec.ts project-selection.spec.ts project-read-isolation.spec.ts refresh.spec.ts read-failure-refresh.spec.ts refresh-focus.spec.ts accessible-overview.spec.ts accessible-overview-keyboard.spec.ts
npm run typecheck:dashboard
git diff --check
```

**Accepted proof:** The focused browser command above passed 21 tests; typecheck
and whitespace checks passed. Inspected real App/readers with origin HTTP fixtures
and `dashboard-header.spec.ts` viewport, non-overlap, pointer and focus assertions.
Refactoring extracted DashboardBanner/banner styles; focused repair closed selector
overlap and stale resize measurement. Independent refactor review completed.
CI run 35816645704 exposed remaining text-button assertions in public/private
recovery tests. Accessible-name/cardinality repair reproduced the failure and
passed all 12 affected browser checks plus typecheck; source behavior unchanged.

Safe stopping point: common controls stay in reach with the existing direction
and legend still usable. Align the relevant dashboard usage description.

### 2. Read near-future direction on demand

Type: Behavior
Status: done

Behavior: an observation arrives → direction starts collapsed; activate its
labeled control → full published text or the no-direction explanation is readable;
activate again → it collapses without altering the snapshot or fetching data.

Keep its expanded/collapsed state across same-project refresh, including failure;
reset when selecting another project. Show no previous-project direction while
the new project is being read. Use a visible title and keyboard-operable control
with exposed expansion state; preserve multiline and safe text rendering.

Proof: add `dashboard/tests/direction-disclosure.spec.ts` against the real origin
fixture. Observe initial hidden body, pointer/keyboard open-close, multiline and
empty direction, no new requests on toggles, retained state during refresh, and
reset/isolation on project change. Update `dashboardPage.ts` and existing direction
assertions in overview, project-selection, private overview/recovery, and
source-navigation journeys to explicitly expand before claiming readable content.
Do not weaken visibility assertions to mere DOM text presence.

```sh
npm run test:dashboard -- direction-disclosure.spec.ts published-work.spec.ts project-selection.spec.ts private-project-overview.spec.ts private-project-recovery.spec.ts source-navigation.spec.ts accessible-overview.spec.ts
npm run typecheck:dashboard
git diff --check
```

**Accepted proof:** The focused command above passed 18 browser tests;
`npm run test:dashboard -- accessible-overview-keyboard.spec.ts` passed 2.
Typecheck and whitespace passed. Inspected native App disclosure and real-origin
visibility, keyboard, no-request, refresh/failure and project-isolation assertions
in `direction-disclosure.spec.ts`; independent refactor review found no edits.

Safe stopping point: direction takes little space until requested, and all
previous project/evidence behavior remains useful. Update relevant usage text.

### 3. Explain preparation badges through a compact help dialog

Type: Behavior
Status: done

Behavior: preparation facts are available → a question-mark control takes the
standing legend's place; activate it → a titled modal presents the existing
legend; Close or Escape → focus and reading context return to the launcher.

Keep the original legend content in one owner and actual card badges unchanged.
Name the launcher Preparation badge legend; use a comfortable click/touch target
around the small symbol. Keep dialog content readable and scrollable at narrow
widths/zoom, above the banner. Contain focus and interaction while open; restore
focus to the launcher on close. Opening/closing help neither fetches nor changes
preparation/readiness. Keep its availability under the existing preparation rule.

Proof: add `dashboard/tests/preparation-legend.spec.ts`, reusing committed story
preparation fixtures. Observe the collapsed overview, unchanged card badge text,
one-click and keyboard opening, dialog title/content, contained Tab/Shift-Tab,
inert background, visible Close and Escape paths, focus/scroll return, no extra
requests, and narrow/zoomed/reduced-motion reading. Update the standing-legend
assumptions in `story-readiness.spec.ts` and `storyReadinessAccessible.ts` to
exercise the modal; retain text/contrast/evidence checks for both cards and legend.

```sh
npm run test:dashboard -- preparation-legend.spec.ts story-readiness.spec.ts story-readiness-accessible.spec.ts read-failure.spec.ts read-failure-refresh.spec.ts accessible-overview-keyboard.spec.ts
npm run typecheck:dashboard
git diff --check
```

**Accepted proof:** The expanded focused command above passed 19 browser tests;
typecheck and whitespace passed. Inspected real committed-origin setup and modal
visibility, keyboard scrolling, focus/inertness, scroll return and no-read/card
assertions in `preparation-legend.spec.ts`. Independent refactor review completed.

Safe stopping point: all requested presentation improvements are usable with
accessible explanations and unchanged observation semantics. Align usage text.

## Proof ownership and delivery gates

| Final promise | Owning slice and observation |
| --- | --- |
| OpenDO brand; always-reachable selector, project/source context and SVG refresh | 1: scroll, project change, source evidence, semantic SVG action, and narrow/zoomed browser observations. |
| Existing explicit read, Retry, loading, snapshot and focus behavior | 1: existing origin-backed refresh/failure/isolation journeys through the relocated control. |
| Direction collapsed by default; complete/empty text on demand; transient state policy | 2: disclosure events, no-request checks, refresh persistence and project-change reset. |
| Small help launcher, modal legend, unchanged card badges | 3: real preparation fixtures and dialog/card visibility assertions. |
| Accessible control targets, modal focus/close, no obscured content or sideways overflow | 1 for banner/focus; 2 for disclosure; 3 for modal keyboard, focus return and reflow. |
| Current agent-facing UI direction and usage instructions | Preparation updates the UX/UI guide; each slice checks its implemented behavior against that guide and updates only relevant usage documentation. |

At execution, use the installed dough-execute-plan workflow's independent
post-change refactoring, focused checks, commit/review and CI delivery gates.
Do not add installation/native-agent checks for this dashboard-only change.
The commands above are prospective recipes, not passing evidence. Playwright's
configured test command builds the production application; no live GitHub or
private account is needed for these fixtures. Record actual accepted proof and
done statuses here only during authorized execution. Broaden checks only for a
newly exposed concern or the delivery workflow's required gates.

## Learnings and preparation review

The current UX/UI guide prohibited project selection despite its delivered
implementation. Preparation aligns that stale guidance with the existing catalog
and this request; it does not revise global AI skills or source/authentication
architecture. The standing legend has explicit browser assertions that must
move to the modal journey instead of being deleted.

Reviewed all three slice boundaries and final-promise mappings: no remaining
slice-specific blocking concern was identified. Structured readiness is recorded
in the canonical story by the preparation recorder; it grants no execution
authority. Slice evidence below records implementation progress; unfinished
slices retain prospective proof recipes.

## Execution identity

- Mode: Story Branch Mode; reuse the preparation worktree authorized by Terry.
- Owned checkout: `/Users/terryyin/git/open-dough-worktrees/081-dashboard-header`,
  branch `codex/081-dashboard-header`; session-created during preparation at
  `d5a3da0db09d7bbd9df73f48a0413c5d11330525`, reconciled onto published trunk.
- Originating/integration checkout: `/Users/terryyin/git/open-dough` on `main`.
  This coordinator owns only the requested brief clean fast-forward intervals.
- Preparation published: `e4ec2cebf3a4f24c893aa40508bf528f31261db1` on `origin/main`.
- Taken published: `3f13418740f3f57128ff947383ca7aaeba3e37d0` on `origin/main`;
  claim CI is unobserved by the story-branch observer.
- Increment target: `origin/codex/081-dashboard-header`; final integration target:
  `origin/main`. Local main advances only while clean and safely fast-forwardable.
- Setup: locked `npm ci` and `npm run typecheck:dashboard` passed in this checkout.
- Replanning: existing planning authority retained within this story's scope.
- Hooks: no active Git commit hook or core.hooksPath override. Selectively format
  changed supported files with the checked-in Prettier configuration; run focused
  lint checks for changed code before commits. No generation trigger applies.
- CI observer: GitHub Actions `ci.yml` / `CI`, push-triggered for all branches;
  selected checkout runtime `.agents/skills/dough-execute-plan/scripts/ci-mailbox.mjs`.
  Coordinator `root-dashboard`, target `codex/081-dashboard-header`, mailbox
  `/tmp/dough-ci-501/watch-UPso05`, PID `52256`, PTY session `79407`, yielded cell `31`.
  Bound to this worktree; no previous observer for this execution.
- Slice 1 accepted publication: `f3374cf4c1cc4c6ea2ada3b7c07adcfe8b93d816`
  on `origin/codex/081-dashboard-header`; registered with the retained observer.
- CI repair accepted: `44cff5ef3ddbb861f7e6a15caacd93082ed832b3` on the story branch; registered with the same observer.
- Slice 2 accepted: `2bc5422080eead54a463cddce8bff8ff32549605` on the story branch; registered with the same observer.
