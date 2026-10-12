# Operate the dashboard comfortably by touch

**Identity:** SEED-133#operate-dashboard-from-mobile-browser
**Source:** [selected story](../../seeds/SEED-133-mobile-dashboard.md#operate-dashboard-from-mobile-browser)

## Goal and scope

A developer can read and operate the dashboard at phone and tablet sizes by
touch while retaining efficient desktop mouse and keyboard operation. The
source's required interactions and seven examples apply in full.

Terry's 2026-10-12 refinement decisions select browser-neutral implementation
and testing in one available browser. Use the existing Chromium Playwright
project, with touch contexts and representative phone/tablet portrait,
landscape, and reduced-height conditions, alongside desktop cases in that same
browser. These are viewport/input conditions, not a browser or device matrix.
Record the actual browser/version and dimensions used. Constrained-height
editing is the accepted local UI evidence; do not describe it as a physical
iOS software-keyboard observation or universal engine compatibility.

Tailscale, remote-access setup, connectivity and the former real-device remote
reality check are outside this story. Terry will arrange connection later.
No remote URL, physical device, new authentication, hosting, native mobile app,
offline operation, push notifications, or new host capability is required.
Use disposable harness projects, settings, credentials and native-host
stand-ins, retaining real browser/server and terminal WebSocket paths.

## Existing solution and design direction

PFE found substantial responsive behavior already owned by the dashboard:

- `DashboardColumns`, `dashboard-columns.css` and `workFocus` own whole-column
  paging, semantic reading order and focused-work reveal. Extend them rather
  than introducing mobile story state or a separate navigation model.
- `styles.css`, `frame-controls.css`, `Icon` and `FrameTooltip` own shared
  control presentation. Existing dependency disclosure provides a touch-sized
  control and `tap()` proof. Make any needed shared changes with their first
  consuming journey; do not copy controls into mobile-only implementations.
- `LaunchDialog`, shared dialog styles and project dialogs own editing and
  scrolling. Keep one draft and explicit Start/Cancel semantics as available
  width/height changes.
- `PageFrame`, `SessionSidebar`, `pageSidePanel`, `sidePanelWidth`, `ResizeEdge`
  and keyboard-return helpers own selected content, panel geometry and focus.
  `SidebarEntry` currently puts project/state/model details in its native
  `title`; touch-readable information must remain the same session facts.
- `useAttachedTerminal` owns xterm input, fitting and the existing transport;
  geometry changes must not become a new attachment or session. Story review
  already owns independent file/diff scrolling and selected-file state.
- Settings already have shared frame controls, responsive project forms,
  disposable storage fixtures and explicit error recovery.

The common rule is to adapt existing interactions to available space and input
capability, preserving their state and domain meaning. Do not branch behavior
on a browser brand or device-model whitelist. Touch discovery may need a
different way to reveal existing information; it needs no second session or
launch model. A separate dispatch-style operating mode was considered in the
seed and is not justified by current evidence.

Follow [ADR 0002 — Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
for reuse and cohesive domain ownership, and
[ADR 0000 — Use Architectural Decision Records](../../../docs/adrs/0000-use-adrs-accepted.md)
for keeping feature-local design in this plan. The ADR index and relevant
Accepted records agree; dashboard ADR 0008 remains Proposed. Existing
[dashboard direction](../../NORTH-STAR.md#one-backlog-interpretation-separate-observation-and-presentation) and the
[UX/UI North Star](../../../docs/dashboard-ux-ui-north-star.md) retain published
story authority, connected stages, accessible reading/focus order, and one
local operational boundary. No new North Star topic, ADR or exception is needed.
Native-host attachment, Done and recovery semantics remain those documented in
[terminal operations](../../../dashboard/AGENT-LAUNCH-TERMINALS.md).

## Observed premises

Preparation observations use
`/Users/terryyin/git/open-dough/.worktrees/use-the-dashboard-from-an-ipad-or-iphone-browser`
at product base `e7455dc2182629e1211d648925fe4c1101153a06`, with Node 24.21.0,
Playwright 1.63.0 and Chromium 153.0.8010.12. Dependencies were installed in
that checkout through `node scripts/setup-native.mjs npm`; native setup check
launched the browser successfully. Use `/opt/homebrew/bin` on PATH for Bash 5
on this macOS host. Another execution checkout runs its own normal setup check.

- The existing one-browser route reaches column navigation, dependency touch
  interaction and stacked panels. The initial selected run's assertions
  completed, but strict reporting rejected inherited NO_COLOR/FORCE_COLOR
  warnings, so that invocation was not accepted as passing proof. Clearing
  those conflicting caller variables corrected the environment without
  weakening the reporter.
  `env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- dashboard-columns-paging.spec.ts story-dependencies.spec.ts side-panel-width-stacking.spec.ts --workers=2`
  exited 0, with all nine selected tests passing quietly.
- Column proof discriminates: a scratch change to narrow
  `--columns-shown: 1` made it `2`. The existing 40rem journey exited 1 at
  `dashboardColumnsPage.ts:91`: it expected the next edge to name
  `Taken 1 entry` and received `Recently done 0 entries`. The original CSS
  was restored before writing this plan. This settles reuse of the
  column-paging observation, not acceptance of new touch comfort. The literal
  command was
  `env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- dashboard-columns-paging.spec.ts --grep "a 40rem page shows one column" --workers=1`.
- `env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- agent-terminal.spec.ts --workers=1`
  exited 0. The journey reaches browser xterm input through the real local
  WebSocket boundary to the fixture PTY, observes echoed follow-up and resize,
  and checks Close/detach with retained session identity. This supports that
  proof route; it does not establish the new constrained-height behavior.
- `env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- agent-launch-dialog-layout.spec.ts story-review-panes.spec.ts system-settings-look.spec.ts --workers=2`
  exited 0, with seven tests observing real dialog fit, selected review/pane
  behavior, and settings layout from this checkout's built assets. Together
  with the nine-test baseline and one terminal journey, 17 existing tests
  passed. No real host, paid API, remote connection or physical device was used.

New mobile observations below are execution obligations. Existing tests are
extension points, not claims that the new UI already passes. No product
implementation or scratch edit is retained in this preparation.

## Ordered slices

### 1. Browse and inspect work by touch
Type: Behavior
Status: planned
Proof: Extend the overview, column and dependency journeys in
`accessible-overview.spec.ts`, `dashboard-columns-paging.spec.ts`,
`story-dependencies.spec.ts` and `preparation-legend.spec.ts`, with relevant
keyboard/frame consumers below.

Behavior: A developer has entries in Backlog, Taken and Recently done → selects
a project, pages between the groups, and inspects a story by touch → full title,
source, dependency/readiness explanations and Start limitations can be read
without hover, navigation stays reachable, and returning preserves context.

Improve the shared control/disclosure owners needed by that journey. Keep
long content readable and page-wide sideways scrolling absent at phone/tablet
sizes. Exercise touch activation and full visible explanation, not merely an
accessible name or HTML title. Preserve desktop whole-column layout, tab order,
focus return, project selection and reduced motion. Update the relevant
dashboard navigation/reading documentation with the delivered behavior.

Safe stop: touch browsing is useful while later operational improvements remain
planned. One reading/navigation proof loop; no separate control framework.

### 2. Finish a launch dialog with limited visible height
Type: Behavior
Status: planned
Proof: Extend `agent-launch-dialog-layout.spec.ts`,
`agent-launch-start-session-layout.spec.ts`, `agent-launch-card.spec.ts` and
`agent-launch-card-problems.spec.ts` through their disposable launch fixtures.

Behavior: A developer opens a story or unattached-session dialog → types a
multiline instruction, changes orientation/visible height, reads choices and
effects, then explicitly cancels or starts → the exact draft survives viewport
changes, required actions remain reachable, Cancel launches nothing, and Start
shows the actual pending/accepted/failed/uncertain result and its recovery.

Keep editing, host/model/session choices and explicit operation submission in
the existing dialog lifecycle. Assert native launch counts across viewport
changes and cancellation; do not infer non-launch from layout. Exercise one
existing failure/uncertain continuation under constrained height. Preserve
desktop effects visibility, keyboard order, focus restoration and existing
instruction/recording recovery without adding a new dictation promise.

Safe stop: mobile launch editing/submission works end to end; downstream session
and terminal comfort retain their existing behavior until their owning slices.

### 3. Identify and manage the intended session without hover
Type: Behavior
Status: planned
Proof: Extend `session-sidebar-row.spec.ts`, `session-sidebar-navigation.spec.ts`
and `agent-launch-done-question.spec.ts`; retain sidebar keyboard and explicit
report action coverage for any changed controls.

Behavior: Several projects have sessions with ordinary and attention states →
a developer opens Sessions, reads the intended session's full identity/context
by touch, chooses it and inspects its report/actions → the intended project and
session are selected, attention is readable, and Keep open on an incomplete
session's Done question stops nothing and retains the current session.

Expose existing session/project/state information through a touch-usable path;
preserve desktop row density and keyboard operation. Update the existing
tooltip-only row expectations where they conflict with the intentional mobile
behavior, instead of leaving two incompatible contracts. Keep Mark as read,
Mark as done and Delete record distinct with their current eligibility and
confirmation; shared wording continues to distinguish host activity, local Done
and published story state. Prove the chosen action, not its neighbour, runs.

Safe stop: sessions can be identified and managed by touch; terminal viewport
comfort is the next slice's responsibility, not implicitly completed here.

### 4. Continue a terminal session in the available space
Type: Behavior
Status: planned
Proof: Extend `agent-terminal.spec.ts` and `agent-terminal-maximize.spec.ts`
through real browser input, WebSocket and fixture PTY output. Include the
shared panel and terminal consumers listed below when their owners change.

Behavior: A developer opens an existing disposable session at phone/tablet
size → enters and submits a harmless follow-up, changes orientation/visible
height, maximizes/restores, then closes/reopens or reconnects → input reaches
the same session, its answer is readable, essential panel/input recovery stays
reachable, and geometry changes neither launch nor reattach anything.

Adapt shared panel/input fitting only as the journey demonstrates is needed.
Do not presume a need for custom mobile keys; exercise editing, Enter, scroll,
focus/exit and any required terminal control in the chosen browser before
adding a control. Assert attachment counts and retained identity through
resize; distinguish expected Close/reconnect attachment from unexpected
viewport-driven attachment. Preserve each host's lifecycle, read-only report
fallback, desktop resizing/shortcuts and focus restoration. Update terminal
usage documentation with actual supported interaction and proof limits.

Safe stop: one interactive session cycle works at constrained sizes. If evidence
requires a new native-host capability or changed lifecycle, stop that expansion
and surface it instead of absorbing it into this UI slice.

### 5. Review changes without losing the chosen file
Type: Behavior
Status: planned
Proof: Extend `story-review-panes.spec.ts`, `story-review.spec.ts` and
`story-panel-switching.spec.ts` using real fixture comparisons/diffs.

Behavior: Reviewable work has multiple files and long diff lines → a developer
opens review by touch, selects and reads a file, changes orientation, and
maximizes/restores or hides the file browser → the selected comparison/file and
reading context remain meaningful, content scrolls within its pane, and panel
controls/Close remain reachable with focus returning to originating work.

Keep existing comparison, review-mark, stale/unavailable and refresh semantics.
Extend the existing pane ownership rather than adding a mobile diff renderer.
Prove containment at phone width and short landscape height alongside desktop
independent-pane scrolling and panel switching; no page-wide sideways scroll.
Reflect delivered behavior in review/navigation documentation.

Safe stop: review is usable independently of the remaining settings adaptation.

### 6. Edit settings and recover by touch
Type: Behavior
Status: planned
Proof: Extend `system-settings-look.spec.ts`,
`system-settings-project-management.spec.ts`,
`system-settings-openai-recovery.spec.ts` and
`system-settings-terminal-theme.spec.ts` in their private fixture storage.

Behavior: A developer opens settings at phone/tablet size → reads Projects,
OpenAI status and Terminal theme, edits with reduced height, rotates, then
saves/cancels or retries a failed operation → the draft and saved predecessor
are preserved as required, actions remain reachable, and only the intended
fixture-host setting changes.

Reuse shared controls/dialogs and existing storage/error rules. Keep host-local
paths/settings understandable, desktop navigation efficient, and an existing
terminal attachment intact while entering/leaving settings. Update settings
documentation; do not add paid API validation or expose real credentials.

Safe stop: every selected primary browser journey has its own mobile and desktop
proof. This completes the UI story only when the obligations below are proved.

## Proof ownership and execution checks

| Source promise | Owner and observable signal |
| --- | --- |
| Example 1: project/stage/story navigation and complete explanations without hover | Slice 1: touch navigation, visible full content and reason, preserved focus/context, no page overflow. |
| Example 3: launch draft, effects, cancellation, result and recovery | Slice 2: exact input retained, action bounds and launch counts, fixture result/recovery. |
| Example 4: session identity, attention and safe explicit management | Slice 3: visible session facts by touch, exact selected identity, unchanged stop/Done state after Keep open. |
| Example 5: interactive terminal, fitting, same session and connection recovery | Slice 4: echoed input, output/resize, attachment counts, retained session identity and reachable Close/recovery. |
| Example 2: file review and orientation/context | Slice 5: selected file/comparison, visible diff and controls, contained pane scrolling and return focus. |
| Example 6: settings edit and failed-operation recovery | Slice 6: draft and predecessor bytes, visible status/retry, fixture-only writes. |
| Example 7: desktop capabilities, shortcuts, focus, panels/columns | Every slice owns corresponding existing desktop assertions and its changed shared consumers; no final catch-all slice defers regression responsibility. |
| Comfortable targets, no accidental action, visible actions in reduced space | Each slice checks control geometry and actual touch activation plus the operation's result; slices 2/4/6 own active editing and reduced-height continuity. |
| Same story/native-host meaning and no viewport-induced operation | Slices 2–4 assert request/attachment counts and identity; all slices preserve published membership and existing host operations. |
| Browser neutrality and revised access boundary | All slices adapt space/input capability, not brand; proof records one browser and local conditions. No Tailscale or physical-device gate. |

Check current control bounds before activating a control promised to remain in
view; use its visible coordinate for touch where appropriate. A locator click
or `scrollIntoViewIfNeeded` can hide the clipping problem by auto-scrolling.
Allow deliberate user scrolling for ordinary content. Demonstrate real readable
information for touch discovery; HTML titles/accessibility descriptions alone
are insufficient. Newly added proof must fail when its promised behavior is
removed and pass intact; add focused meaningful assertions, not implementation
mirrors or a separate exhaustive device suite.

Run the existing complete spec files touched by each journey plus its affected
shared consumers, using
`env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- <selected-spec-files> --workers=2`.
Use the repository's [native setup](../../../tests/native-setup.md) and strict
[dashboard proof harness](../../../dashboard/tests/README.md), not production
projects or live paid hosts. Add capability-named specs if that improves
cohesion; keep one browser project. Useful cross-cutting consumer selections:

- Shared frame/disclosure changes: `frame-launch-look.spec.ts`,
  `accessible-overview-keyboard.spec.ts`, `preparation-legend.spec.ts`,
  `system-settings-look.spec.ts`, and callers of `frameIconControl.ts`.
  Reassess exact page-wide tab-stop/count assertions when adding controls.
- Session discovery: `session-sidebar-row.spec.ts`,
  `session-sidebar-keyboard.spec.ts`, `session-sidebar-navigation.spec.ts`.
- Panel geometry/lifecycle: `side-panel-width.spec.ts`,
  `side-panel-width-stacking.spec.ts`, `side-panel-width-kept.spec.ts`,
  `dashboard-columns-paging-side-panel.spec.ts`,
  `agent-terminal-keyboard.spec.ts`, `story-panel-switching.spec.ts`.
- Shared terminal attachment/input changes: `agent-terminal-codex-page.spec.ts`
  and `agent-terminal-cursor-page.spec.ts`, preserving their distinct host
  contracts in the same browser. The mocked transport race in
  `agent-terminal-resize.spec.ts` does not replace actual page-to-PTY proof.
- Settings navigation while a terminal is open: `system-settings.spec.ts`.

Selection follows changed responsibilities and assertions; inspect additional
consumers when the change reaches them. Shared frame/panel changes have broad
rendered consumers, so use the covering surface suite when it fits focused
feedback. No all-suite local gate is invented from CI configuration.
`.githooks/pre-commit` requires staged lint and dashboard typecheck when scripts
are staged. Follow ordinary execution's independent post-change refactor and
delivery gates; keep documentation and proof with their behavior slice.

## Current decisions and sizing

Six Behavior slices separate independently observable user journeys, with
implementation, proof and cleanup together. Shared rules evolve in their
existing owner at first need and are reused by later slices; delivery order
does not justify per-workflow mobile frameworks or duplicate state. Each slice
is bounded by one journey and its change-dependent consumers. No numeric slice
target or hard limit is supplied. Reassess if a slice requires a new host
operation, architecture boundary or second independent outcome.

No Structure slice, remote-access prerequisite, browser matrix or separate
manual physical-device acceptance is required. No source-scope decision remains
open. Readiness is recorded through the canonical story's preparation recorder;
this plan neither Takes the story nor authorizes implementation.
