# The page ends where the shown dashboard columns end

**Identity:** SEED-106#paged-columns-height-follows-shown
**Source:** [refined story](../../seeds/SEED-106-dashboard-paged-columns.md#paged-columns-height-follows-shown).
**Prepared:** 2026-10-07, planning only, in the established workspace
`codex/the-page-ends-where-the-shown-dashboard-columns`, at
`cee52a56032d5ccf30f5f080a58d230e10bdd54f`. The retained refinement is part
of this preparation; neither record authorizes execution or publication.

## Goal and boundaries

A developer reading one or two dashboard columns reaches the end of their
content without a blank tail caused by a taller hidden column. Revealing a
longer column restores its full reachable length. Page height follows the
longest currently shown column, with the ordinary page framing and reachable
edge controls.

Preserve the existing window scroll, sticky stage headings, semantic reading
and tab order, focus and session-selection reveals, edge controls and motion
preferences, browser-kept column position, width-dependent paging, and the
three-column overview. Keep a valid vertical position; clamp an invalid one
to the new bottom. Opened inspections and arriving content follow the same
height rule.

Deferred: new navigation or count policy, a separate remembered vertical
position for each column, a return-to-top policy, inner column scrollbars,
and a general viewport or measurement framework. The separate
[reveal/count correction](../../seeds/SEED-106-dashboard-paged-columns.md#paged-columns-reveal-and-count-correction)
is not a prerequisite: do not fold its launch-dialog classifier or unread
count changes into this delivery. Reconcile overlapping paging edits without
silently changing either story's scope.

## Existing solution and direction

PFE searched the layout, height measurement, clipping, scrolling, and reveal
responsibilities across `dashboard/src`, `src`, and `scripts`:

- `DashboardColumns.tsx`, `columnPaging.ts`, and `dashboard-columns.css`
  already own the three semantic columns, the shown count, the leftmost shown
  column, and their layout. Extend that owner; derive shown membership from
  those existing facts rather than maintaining another navigation position.
- `measuredHeight.ts` owns one element's measured CSS height, used by
  `DashboardBanner.tsx` and `TerminalPanel.tsx`. It does not select columns or
  exclude hidden overflow. The observed layout solution needs no measured
  maximum or polling loop, so leave those distinct responsibilities alone.
- `workFocus.ts` already owns item visibility, nearest scrolling after
  snapshot changes, and `keepInView`; `sessionNavigation.ts` consumes that
  reveal before scrolling the selected session. Preserve that journey.
  Keyboard reveal must finish after the target column regains its height,
  since the browser's earlier native focus scroll can be clamped too soon.
- `dashboardColumnsPage.ts` and `pageLayout.ts` already observe column
  membership, edge controls, motion, sideways overflow, and intentional
  clipping. Keep shown content and focus rings whole; do not weaken those
  observations with a blanket clipping exemption.

Use ordinary layout in the existing paging presentation: shown columns keep
their natural height, and hidden columns cease contributing height and
vertical overflow while remaining in the DOM and accessible reading order.
The disposable browser probe below demonstrated size containment and clipping
on hidden columns, followed by nearest scrolling of a newly revealed focused
control. Its observation attributes are not production names or an extra
state model. Execution may choose an equivalent local expression of this
rule; it must preserve the same proof boundaries.

This follows [North Star: One backlog interpretation, separate observation
and presentation](../../NORTH-STAR.md#one-backlog-interpretation-separate-observation-and-presentation):
ordinary layout/reflow and UI state separate from published facts. It needs
no new North Star topic. The [UX/UI North Star](../../../docs/dashboard-ux-ui-north-star.md#connected-stages-and-spatial-navigation)
likewise supports ordinary scrolling and navigation that serves this reading
need.

The [ADR index](../../../docs/adrs/README.md) and record statuses agree:
0000–0006 are Accepted, 0007–0009 Proposed, with no supersession affecting
this work. Relevant Accepted decisions are
[ADR 0000](../../../docs/adrs/0000-use-adrs-accepted.md), keeping feature-local
design with the feature;
[ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md), preserving
story/slice and preparation meanings; and
[ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md),
principles 3 and 4, keeping one coherent owner for each rule. No conflict,
exception, or new stack decision is needed. The
[technology recommendation](../../../docs/dashboard-tech-stack.md#first-story-application)
remains a recommendation; use the actual React/TypeScript/Vite and Chromium
Playwright boundary already present.

## Premises observed before planning

All observations below used unchanged product code at `cee52a56`.

| Premise and consuming operation | Observation and result |
| --- | --- |
| A hidden tall column creates a blank page tail; fixing the extent addresses an observed symptom. | The source story records the live 864 × 700 journey: scroll to 6,000px below Backlog/Taken, reveal tall Recently done at that depth, then return to the blank short pair. The isolated `largeBacklog` fixture also reproduced it: a 5,768px document with the shown Taken ending near 509px after Backlog was hidden. |
| Existing paging, keyboard focus, kept position, and sidebar/panel selection work through the real page boundary and can supply regression proof. | `env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- dashboard-columns-paging.spec.ts dashboard-columns-kept.spec.ts dashboard-columns-paging-side-panel.spec.ts dashboard-columns-paging-sessions-sidebar.spec.ts --workers=2 --output=dashboard/test-results/planning-baseline` passed. Inspected setup: `dashboardTest.ts` serves the built app with synthetic `gh` answering raw records; tests trigger real controls, keys, and sidebar choices. |
| The real canonical inspection, independently arriving facts, reading-place preservation, wide overview, and done-record projection are available through the named proof fixtures. | `env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- published-facts-reading.spec.ts branch-progress-reading.spec.ts accessible-overview.spec.ts recently-done-story-sessions.spec.ts --workers=2 --output=dashboard/test-results/planning-reading-baseline` passed. `publishedFactsArrival.ts` publishes raw pinned records and holds their actual `gh` reads; `published-facts-reading.spec.ts` opens the real canonical detail and releases groups while observing its focused link. The done-session journey reads rendered done-record files through `publishFiles`. These establish existing fixture journeys, not the new hidden-height arrival result. |
| Native layout can exclude hidden height and overflow while restoring long content, sticky headings, inspection reflow, and the normal wide overview. | The disposable page-only probe used `largeBacklog`, `publishOrigin`, and `parts` at 864 × 480; it applied `height: 0; contain: size; overflow: clip` and removed block framing only on hidden columns, updating membership from the paging owner's existing values. At a 1,500px scroll, the short pair contracted the document from 5,768px to 533px, clamping to 53px. Revealing Backlog restored 5,768px and kept 53px. Its heading stayed at 69px below the banner's 57px bottom. Inspection grew the page to 6,102px and closing it restored the original height; one-column and wide resizing passed. |
| Keyboard focus needs reveal completion after the extent is restored; simply clipping hidden columns is insufficient. | The first layout probe retained focus on Backlog's last card after Shift+Tab, but the control was outside the viewport. Adding nearest scrolling for the newly revealed focused control after restoring layout made the actual Shift+Tab journey pass with that control fully in the viewport. This changes the approach: height and reveal completion belong together. |
| The restored extent can be consumed by the existing Sessions sidebar reveal, without a second session navigation system. | The probe reused `publishStoryStagesJourney`, `openNavigationJourney`, and `sidebarParts`: hide Backlog, select its real story session, open its terminal, then observe Backlog restored to a height of about 855px, the chosen card in the viewport, and `Shown in terminal`. The production `keepInView` operation performed the reveal. |
| Default motion and existing whole-page measurements remain usable under the candidate layout. | The probe switched from reduced motion to normal motion, pressed the real Backlog edge control, observed exactly one transform slide, and passed `expectView` including its sideways-scroll and whole-text checks. |

The final two-case probe command was
`env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- planning-height-observation.spec.ts --workers=1 --output=dashboard/test-results/planning-height-observation`:
pass. Its temporary source was removed from the checkout after observation;
the cases used only page-injected candidate layout and the existing fixture
journeys named above. The observations settle feasibility and sequencing,
not implementation acceptance. Execution must own the permanent proof below.

The first baseline invocation was refused by the quiet reporter because the
inherited `NO_COLOR` and `FORCE_COLOR` combination printed Node warnings.
The explicit environment wrapper above produced the terminal passing result.
No paid, credentialed, production-mutating, or owner-held probe remains.

## Outside-in proof ownership

Every row belongs to slice 1. Seed example numbers identify source examples,
not restrictions on which columns or inputs the rule naturally handles.

| Promise | Permanent observation |
| --- | --- |
| Examples 1–2: hidden columns add no blank tail; showing a long column restores its end; shorter content clamps and valid vertical positions stay. | New `dashboard/tests/dashboard-columns-height.spec.ts`, using raw published fixtures: measure document extent against shown content and normal framing; actually wheel to the bottom, page away and back, and observe reachable last content. Include a shorter pair still taller than the viewport so its positive clamp distinguishes clamping from a forced top reset. Exercise a hidden tall Backlog and a hidden tall Recently done, plus one short/empty shown column. |
| Example 3: semantic order remains, focus reveals a hidden full-height column and the focused item, and session selection reveals its item. | Extend the paging keyboard journey to assert focus, full control visibility below the banner, and restored reachability of the long column's end. Assert all three regions remain in reading order while hidden. Extend the Sessions sidebar paging journey with extent/reachability assertions after selecting the hidden story; the actual `keepInView` operation must consume restored layout. |
| Example 4: shown inspection growth and contraction remain reachable; hidden arrivals add no blank tail. | In the height journey, supply a real canonical story through `publishFiles`, open Inspect story, reach the detail's end, close it, and observe extent contraction. Use an isolated variant of the held raw fact groups in `publishedFactsArrival.ts` with enough valid, recent done records to make the incoming hidden Recently done content taller than the shown Backlog/Taken content. Release that actual group and observe document extent still tied to shown content. Confirm the incoming content exceeds the shown extent: an arrival too short to affect the old layout would not prove this promise. Retain the reading-place assertions in `published-facts-reading.spec.ts` and `branch-progress-reading.spec.ts`. |
| Example 5: resizing restores the ordinary three-column overview and narrowing retains the existing chosen-column rule. | Extend the height journey across one/two/three shown columns, asserting full natural content, no sideways scroll, and extent for the resulting shown set. `dashboard-columns-kept.spec.ts` proves project switch, reload, wide/narrow return, and refused storage. The side-panel paging journey proves the page container's width, rather than just the window's width, drives the same rule. |
| Sticky stage headings and edge-control reachability, names/counts, moves, focus handoff, default slide, and reduced motion stay intact. | Preserve the corresponding assertions in `dashboard-columns-paging.spec.ts`, adding them after extent contraction and regrowth. Replace its obsolete `scrollY === 1500` expectations after paging to the short pair and back with the new clamp/valid-position observations; keep its long-column sticky-header checks. Run its entire file, not just a filtered example. |
| Shown text, focus rings, semantic cards, and controls remain whole across the changed shared surface. | Use the existing `expectView`/`pageLayout` observations and the consumer command below. Any necessary helper change must still distinguish genuinely hidden columns from shown clipped content, and preserve modal/terminal reachability checks. |

Fixtures supply published records, machine sessions, and starting content only.
They must not supply the new extent, reveal, or scroll result. Permanent
journeys use the built application and real user actions; do not accept a
test-side height, DOM patch, direct call to a new visibility setter, or the
disposable probe as proof of delivery.

## Slices

### 1. Reading and revealing columns uses only their shown content height

Type: Behavior
Status: done
Proof: every promise in the ownership table, through the new height journey,
the extended keyboard/sidebar journeys, and the regression command below.

Behavior: one or two columns are shown beside a taller hidden column → the
developer scrolls, pages, focuses or selects a hidden item, changes the
available width, or opens/closes shown detail → the page has only the shown
content's extent and normal framing; long content becomes fully reachable
when revealed, invalid vertical positions clamp, valid positions remain, and
the focused or selected item is visible after layout is restored.

Extend the existing paging presentation with one shown-membership rule and
natural layout. Exclude hidden columns' size and vertical overflow without
removing their semantic content or tab stops, changing the row's horizontal
geometry, or introducing a vertical scrolling ancestor that breaks sticky
headings. Finish a keyboard reveal after its target's layout is restored;
preserve the existing session reveal's ownership and lifetime. Keep dynamic
content and width changes on this same rule, including the all-shown case.

Build the failing permanent height assertion before the product change. Use
the existing `largeBacklog` and done-record renderer/`publishFiles` boundaries
for unequal column lengths; use held fact groups for an actual hidden arrival.
Keep the height behavior, focus/reveal completion, consumer assertions,
feature documentation, and local cleanup in this one slice. Update the paging
paragraph in `dashboard/README.md` to describe extent and scroll clamping.

Safe stopping point: commit only after all mapped behavior and preservation
proof is green. A height-only result that leaves a focused or selected item
clipped is incomplete. If the chosen layout needs materially different
structure, return the new evidence for in-place plan reassessment rather than
adding a competing visibility or scrolling system.

Accepted proof (execution `bas-chan` on
`claude/the-page-ends-where-the-shown-dashboard-columns`):

- Product: `columnPaging.ts` derives `hidden` from `leftmost`/`shown`
  (a slide's start columns stay until `slid`) and, after a `focusin` move,
  scrolls the still-focused target nearest in a layout effect;
  `DashboardColumns.tsx` names hidden columns on the row (`data-hidden`);
  `dashboard-columns.css` collapses them (`height: 0; contain: size;
  overflow: clip`, block framing removed, `overflow-anchor: none`).
- Examples 1–2, 4 (inspection, arrival), 5: new
  `dashboard-columns-height.spec.ts`, three journeys failing red before the
  product change: hidden 40-entry Recently done and inspection grow/shrink;
  `heldFactGroups(page, { moreDone: 40 })` release with
  `expectLongerThanThePage` and unchanged extent; `largeBacklog` positive clamp
  below 1500, kept position, wide and one-column ends.
- Example 3 and sticky/edge preservation: `dashboard-columns-paging.spec.ts`
  (clamp, Taken heading below banner, kept position, stuck Backlog heading at
  1500; reading-order regions while hidden; Shift+Tab control below banner and
  end reachable — fails with the nearest scroll disabled);
  `dashboard-columns-paging-sessions-sidebar.spec.ts` (Backlog whole length
  after the sidebar choice, `keepInView` unchanged).
  `accessible-overview.spec.ts` now shows Taken before measuring a card inside
  it, since hidden geometry intentionally collapses.
- Commands: the plan's 47-spec consumer command plus
  `published-facts-arrival`, `published-facts-failures`,
  `accessible-overview-keyboard`, `agent-launch-dialog-layout`,
  `frame-launch-look`, `side-panel-width-stacking` passed (exit 0), with ten
  further narrow-viewport consumers; after refactor and lint repair, height,
  paging, sidebar, kept, side-panel, accessible-overview and published-facts
  specs and `npm run typecheck:dashboard` passed.
- CI repair (run 37632417898, `dashboard (5/9)`): on Linux fonts the
  three-column card is taller than the 480px window, so the long-Backlog test
  now asserts the last card's end (its Inspect story control) in view, and
  both page tests wait for a settled page before reading; acting before cards
  finished loading clamped to a premature bottom. Test-only; the trace showed
  the page at its true bottom. `dashboard-columns-height.spec.ts
  --repeat-each=8 --workers=4` and the height, paging and sidebar specs
  passed.
- CI repair (run 37640824194, `dashboard (5/9)`, existing
  `agent-completion-identity.spec.ts`): the spec snapshotted the launch store
  and made it read-only while the first report's native Done was still
  writing after its receipt. It now waits until that record's pending
  `doneProblem` clears and the store lock is released. Test-only; 1 of 40
  failed before, 80 and 40 repeated runs passed after.

## Execution complete

Product advice: no correction is needed; the delivered rule covers all five
key examples, and the CI repair changed tests only. Keep the queued
[reveal/count correction](../../seeds/SEED-106-dashboard-paged-columns.md#paged-columns-reveal-and-count-correction)
at its place; when it runs, route its structural reveal through the same
`columnPaging.ts` shown-membership and post-layout focus reveal rather than a
second visibility rule.

## Verification and delivery

Run from this workspace's repository root. Dependencies were installed here
with `env -u NODE_ENV npm ci --ignore-scripts --offline`; a fresh execution
checkout needs its own dependencies. The browser command builds the production
app through `dashboard/playwright.config.ts` global setup.

Consumer inspection started with
`rg -l 'dashboardColumnsPage' dashboard/tests -g '*.ts'`,
`rg -n 'scrollY|scrollHeight|expectEveryControlReachable' dashboard/tests -g '*.ts'`,
and callers of `keepInView`. Following the imports of the column helper,
including `sessionSidebarPage.ts`, `storyReadinessScan.ts`, and
`storyReadinessAccessible.ts`, found 47 existing spec consumers. The following
command covers that related shared surface plus the new height journey.
Its breadth is justified by changed page extent, focus scrolling, and clipping
observed across these consumers; hosted CI alone is not the reason for this
local check. Recheck consumers if execution changes another contract or helper.

```sh
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- \
  dashboard-columns-height.spec.ts \
  accessible-overview.spec.ts agent-completion-attention.spec.ts \
  agent-completion-quiet-claude.spec.ts agent-launch-ad-hoc-codex.spec.ts \
  agent-launch-ad-hoc-cursor.spec.ts agent-launch-ad-hoc-sessions.spec.ts \
  agent-launch-ad-hoc-terminal.spec.ts agent-launch-ad-hoc.spec.ts \
  agent-launch-card-delete.spec.ts agent-launch-codex-observation.spec.ts \
  agent-launch-codex.spec.ts agent-launch-model-entries.spec.ts \
  agent-launch-recent-delete-unavailable.spec.ts agent-launch-recent-delete.spec.ts \
  agent-session-cursor.spec.ts agent-terminal-cursor-page.spec.ts \
  agent-terminal-done-report.spec.ts agent-terminal-keyboard.spec.ts \
  agent-terminal-maximize.spec.ts agent-terminal.spec.ts \
  branch-progress-reading.spec.ts cursor-runner-sessions.spec.ts \
  dashboard-columns-kept.spec.ts dashboard-columns-paging-sessions-sidebar.spec.ts \
  dashboard-columns-paging-side-panel.spec.ts dashboard-columns-paging.spec.ts \
  dashboard-header.spec.ts frame-sessions-look.spec.ts published-facts-reading.spec.ts \
  recently-done-story-sessions.spec.ts session-alerts-unavailable.spec.ts \
  session-column-membership.spec.ts session-sidebar-keyboard.spec.ts \
  session-sidebar-navigation-cases.spec.ts session-sidebar-navigation.spec.ts \
  session-sidebar-reading.spec.ts session-sidebar-row.spec.ts \
  session-sidebar-state-edge.spec.ts session-sidebar-stays-as-left.spec.ts \
  session-sidebar.spec.ts session-unread-report-message.spec.ts \
  session-unread-report.spec.ts side-panel-width-kept.spec.ts side-panel-width.spec.ts \
  story-panel-switching.spec.ts story-readiness-accessible.spec.ts \
  taken-agent-profile.spec.ts --workers=2
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npm run typecheck:dashboard
```

Typecheck verifies the paging/reveal and JSX changes. If helper or clipping
changes also reach the modal/stacked-panel control checks, add
`agent-launch-dialog-layout.spec.ts`, `frame-launch-look.spec.ts`, and
`side-panel-width-stacking.spec.ts`; their `expectEveryControlReachable`
observations have a different purpose from column membership. Run other newly
affected consumers under the installed proof contract. No unrelated shell,
installer, release, or native-host suite is made a local gate by this plan.

Execution uses the installed
[dough-execute-plan delivery gates](../../../.agents/skills/dough-execute-plan/references/wrap-up.md#deliver-the-change):
accept outside-in proof, perform independent post-change refactoring, run
`npm run format` before staging, and let the check-only commit hook own staged
lint. Preserve the current uncommitted preparation records, follow the chosen
execution workspace/publication contract and CI ownership, and retain accepted
proof in this plan. Planning itself commits, publishes, Takes, and executes
nothing.

## Current decisions

- One paging-owned rule determines shown membership and content extent. No
  second persistent position, generic measurement service, or animation engine.
- Native range clamping is intended; it does not authorize a forced top reset.
  Keyboard reveal completion waits until layout exposes the focused target.
- The source story owns scope. Keep the queued reveal/count correction separate
  and preserve its compatible behavior during later integration.
- The plan is a preparation draft in the existing owned workspace and branch;
  the published `pyo-chan` Preparing assignment remains. Keep/discard disposition
  follows preparation guidance. Readiness does not authorize execution.

## Plan refinement review

Slice-plan refinement ran in place. Retain slice 1: the extent rule and
post-layout reveal completion establish one cohesive user outcome with one
red-to-green proof loop. Tighten its hidden-arrival proof to require incoming
content taller than the shown columns; merely releasing a short hidden entry
could let the old layout pass. No slices were replaced; the resulting count
is one, with no sizing exception or resplit recommendation.

Splitting extent from reveal completion would leave a height-only result that
breaks keyboard reading. Natural layout already handles content growth and
width changes, so separate measurement, dynamic-content, or preservation-only
slices would fragment the same rule rather than deliver independent value.
No preparatory Structure slice or temporary behavior is required. The source
outcome and scope, PFE decision, and North Star direction remain unchanged.

No numeric slice target, hard limit, or exception was supplied by this request
or `AGENTS.md`. Sizing includes implementation, permanent outside-in proof,
the explicit 47-consumer regression cost, refactoring, documentation, and
cleanup; apply the installed decomposition/overrun guidance if execution
finds a larger concern. The representative observations settled the layout
and reveal sequencing assumptions. This review found no remaining
slice-boundary, cumulative-design, or proof-ownership concern. All delivery
proof remains planned, not completed.

## Learnings

Collapsing a hidden column also needs `overflow-anchor: none`: otherwise
Chrome's scroll anchoring can pick an anchor inside the column being hidden
and shift the shown columns after a move. Test wheels should travel exactly
the remaining distance; overshooting leaves Chromium's wheel animation
running, which moves the page once it grows.

Excluding hidden extent changes the range available to the browser's native
focus scroll. Restoring the column and then finishing the reveal is necessary;
retaining focus alone does not establish that the developer can read it.
