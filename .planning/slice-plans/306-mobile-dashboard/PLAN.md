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

## Execution context

- Identity: SEED-133#operate-dashboard-from-mobile-browser; publisher
  `dashboard-territory.local-open-dough`; agent DavidKo-chan.
- Mode: story-branch. Execution/originating checkout:
  `/Users/terryyin/git/open-dough/.worktrees/use-the-dashboard-from-an-ipad-or-iphone-browser`,
  branch `codex/use-the-dashboard-from-an-ipad-or-iphone-browser`.
  Existing linked worktree reused; no new workspace or claim. Default integration
  checkout: `/Users/terryyin/git/open-dough`; authorized remote trunk: origin/main.
- Starting revision: `6b16a31681bda3f3dec0be8f9d9c1eb2f4f01fcf`.
  Established claim/candidate and initial published base:
  `db0dfb0773236c1ff56ad12851ebdac8f3ee73e8`.
- Slice 1 accepted on origin execution branch:
  `1a843c3efbcd97a068c5c04fe94da007d6a1144e`, suffix base
  `db0dfb0773236c1ff56ad12851ebdac8f3ee73e8`; observation reused.
- Slice 2 accepted on origin execution branch:
  `ef370423642958deb1f7aa151d17f5a4aefdde84`, suffix base
  `1a843c3efbcd97a068c5c04fe94da007d6a1144e`; observation reused.
- Slice 3 accepted on origin execution branch:
  `d465a827be2a7162ae0ea05b621496537a3d27ab`, suffix base
  `ef370423642958deb1f7aa151d17f5a4aefdde84`; observation reused.
- Slice 4 accepted on origin execution branch:
  `65a03c49056f81343e2b17d4c83fa9c9f496313f`, suffix base
  `80affc7edb6033b723e32b11cbc1ddd68dd2d0e6`. Its initial receipt reported
  lost observer coverage; managed resume confirmed acceptance without a push
  and recovered observation on the current stream.
- Owned gesture-proof CI repair accepted on origin execution branch:
  `63ca444fe4b5d736a9e4ff3bcda2029556e7cb8b`, suffix base
  `65a03c49056f81343e2b17d4c83fa9c9f496313f`; observation reused.
- Owned header-reading CI repair accepted on origin execution branch:
  `95419ae267a41dd625612b46a9cd734ddd0d3ef1`, suffix base
  `63ca444fe4b5d736a9e4ff3bcda2029556e7cb8b`; observation reused.
- Slice 5 accepted on origin execution branch:
  `5505a27563d8822a15f64410955e1e9bf8b073da`, suffix base
  `95419ae267a41dd625612b46a9cd734ddd0d3ef1`; observation reused.
- Owned warning-observation CI repair accepted on origin execution branch:
  `6b793828659e70b76d78392895ba931569edc49f`, suffix base
  `5505a27563d8822a15f64410955e1e9bf8b073da`; observation reused.
- Owned review-reading CI repair accepted on origin execution branch:
  `27fa55b50bf2f75446dcbb2ce0acaacc1db0297d`, suffix base
  `6b793828659e70b76d78392895ba931569edc49f`; observation reused.
- Slice 6 accepted on origin execution branch:
  `866f49cca1ae5d0ef53f1d83a5ba22bf7bd5f81b`, suffix base
  `27fa55b50bf2f75446dcbb2ce0acaacc1db0297d`; observation reused.
- Installed npm/browser setup and `node scripts/setup-native.mjs check` passed
  in this checkout against the current lockfile on 2026-10-12; Node 24.21.0,
  Playwright 1.63.0, Chromium 153.0.8010.12. Bash 5 uses `/opt/homebrew/bin`.
- CI: GitHub Actions `ci.yml`, verified display name CI, repository
  `terryyin/open-dough`; target is the published execution branch above.
  Codex observer coordinator `mobile-dashboard-davidko`, directory
  `/tmp/dough-ci-501/watch-V2jZ70`, PID 82271, stream session 47438,
  yielded cell 29. The earlier claim on trunk is unobserved by this stream.
  Slice4 publication found the intermediate `watch-LsfZJ7` stream lost across
  session continuation; exact stop confirmed worker exit, zero unread evidence
  and lost coverage before rearming the same coordinator.
  On 2026-10-13 recovery, the prior stream at
  `/tmp/dough-ci-501/watch-b4sk3D` had no live worker or terminal result;
  exact stop recorded lost coverage with zero unread events. Its registered
  repair `80affc7edb6033b723e32b11cbc1ddd68dd2d0e6` had success coverage
  (run38262274324/attempt1). Verified checkout/remote identity and native setup
  before rearming this coordinator's stream. Slice4 changes were preserved;
  no live writer/test remained, and its unreturned proof must be obtained.
- No numeric slice target/hard limit or overrun replanning override is supplied;
  preserve existing planning authority. Formatter: `npm run format`; commit hook
  owns staged lint/typecheck. No product generation trigger applies to this UI work.

## Ordered slices

### 1. Browse and inspect work by touch
Type: Behavior
Status: done
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

Accepted proof (2026-10-12): shared control size, project selection, column edges
and Start/Inspect targets now adapt to coarse input; Start limitations are
visible without hover. Inspected `styles.css`, `project-select.css`,
`dashboard-columns.css`, `story-detail.css`, `StartLaunch.tsx`, `CardLaunches.tsx`
and `agent-launch.css`. Fixture setup supplies published work/session facts;
`accessible-overview-touch.spec.ts` observes real coordinate taps, full long
title/identity/source in view, stages/projects, rotation, focus return and no
launch. `story-dependencies.spec.ts` observes dependency/readiness explanations
and Cancel; `preparation-legend.spec.ts` observes reachable help/Close, preserved
reading position/project and no source read. `tapWhereShown` checks 44px bounds,
clipping and hit target before touchscreen input. Chromium 153.0.8010.12 at
390×844, 844×390, 768×1024 and 1024×768; existing desktop conditions retained.

The initial touch-only run failed on 32/28/40px targets and a hidden Start note
before implementation. Final implementation proof exited 0, 101 tests across
38 complete affected files (all frame-icon, column-view and reachability
consumers found):
```sh
env -u NO_COLOR -u FORCE_COLOR PATH=/opt/homebrew/bin:$PATH npm run test:dashboard -- accessible-overview.spec.ts accessible-overview-keyboard.spec.ts dashboard-columns-paging.spec.ts story-dependencies.spec.ts preparation-legend.spec.ts frame-launch-look.spec.ts frame-overview-look.spec.ts frame-sessions-look.spec.ts dashboard-header.spec.ts system-settings-look.spec.ts system-settings.spec.ts project-selection.spec.ts project-configuration.spec.ts project-keyboard-navigation.spec.ts project-keyboard-navigation-focus.spec.ts project-keyboard-navigation-eligibility.spec.ts agent-launch-card.spec.ts agent-launch-card-noted-start.spec.ts agent-launch-card-open-session.spec.ts agent-launch-card-session-states.spec.ts agent-launch-card-problems.spec.ts agent-launch-card-sessions.spec.ts agent-launch-dialog-layout.spec.ts agent-launch-start-session-layout.spec.ts agent-terminal-keyboard.spec.ts agent-terminal-maximize.spec.ts story-panel-switching.spec.ts side-panel-width-stacking.spec.ts cursor-sidebar-panels.spec.ts cursor-sidebar-resize-lasting.spec.ts dashboard-columns-clamp.spec.ts dashboard-columns-height.spec.ts dashboard-columns-kept.spec.ts dashboard-columns-paging-side-panel.spec.ts dashboard-columns-paging-sessions-sidebar.spec.ts dashboard-columns-paging-launch-dialog.spec.ts published-facts-reading.spec.ts branch-progress-reading.spec.ts --workers=2
```
Independent refactoring moved the cohesive touch journeys into
`accessible-overview-touch.spec.ts` and centralized only large-backlog fixture
publication. Assertions/product declarations stayed unchanged. Replacement
proof exited 0 (13 tests/four complete specs); untouched proof reused:
```sh
env -u NO_COLOR -u FORCE_COLOR PATH=/opt/homebrew/bin:$PATH npm run test:dashboard -- accessible-overview.spec.ts accessible-overview-touch.spec.ts dashboard-columns-paging.spec.ts dashboard-columns-clamp.spec.ts --workers=2
env -u NO_COLOR -u FORCE_COLOR PATH=/opt/homebrew/bin:$PATH npm test -- tests/support/dashboard-test-files.test.mjs
```
New-spec discovery and `git diff --check` passed. Initial generalized helper
assumed fixed edge width/desktop margins; corrected to measured available view.
Per-axis clipping checks now respect visible overflow; existing reachability
checks retain unscrollable-overflow proof. No slice-1 promise gap remains.

### 2. Finish a launch dialog with limited visible height
Type: Behavior
Status: done
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

Accepted proof (2026-10-12): inspected `launch-dialog.css` short-height field
cap/touch option and session labels, `launch-session.css`, `startup-recovery.css`,
and all new setup/observation locations. Actual red measurements were 23.1875px
session labels, 21px recovery control, and a 110.75px textarea inside a 92.625px
body at 390×300. Short-height fields retain a 44px minimum and multiline
scrolling; effects/actions stay in view. Published/native fixtures supply only
initial work and host scenarios. New touch journey specs observe real coordinate
taps and typed insertion at the actual caret, exact draft/choices through
rotation, Cancel focus/zero calls, Start pending then actual session/native1,
and uncertainty then explicit Continue with exact kept draft/native2. Conditions:
Chromium 153.0.8010.12, 390×844/844×390, 768×1024/1024×768,
390×300/768×300 and recovery844×300, alongside existing desktop/zoom cases.

Final implementation proof exited 0 quietly: 134 tests/39 complete specs,
including every affected dialog/session/recovery/recording consumer found:
```sh
env -u NO_COLOR -u FORCE_COLOR PATH=/opt/homebrew/bin:$PATH npm run test:dashboard -- agent-launch-dialog-layout.spec.ts agent-launch-start-session-layout.spec.ts agent-launch-card.spec.ts agent-launch-card-problems.spec.ts frame-launch-look.spec.ts agent-launch-model.spec.ts agent-launch-options.spec.ts agent-launch-options-exclusive.spec.ts agent-launch-options-kept.spec.ts agent-launch-options-entries.spec.ts agent-launch-session-choices.spec.ts agent-launch-default-checkout-warning.spec.ts agent-launch-start-session-existing-changes.spec.ts agent-launch-start-session-failed.spec.ts agent-launch-start-session-recovery.spec.ts agent-launch-uncertain-continuation.spec.ts agent-launch-ad-hoc-problems.spec.ts responsive-session-recovery.spec.ts responsive-session-recovery-ad-hoc.spec.ts responsive-session-recovery-reads.spec.ts responsive-session-recovery-restart.spec.ts responsive-session-recovery-verification.spec.ts responsive-session-reconciliation-kept.spec.ts responsive-session-reconciliation-refusals.spec.ts session-instruction-voice.spec.ts session-instruction-voice-lifecycle.spec.ts session-instruction-voice-overflow.spec.ts session-instruction-voice-key-failures.spec.ts session-instruction-voice-provider-failures.spec.ts session-instruction-voice-capture-failures.spec.ts agent-launch-claude-verification.spec.ts agent-launch-continuation.spec.ts agent-launch-codex-recheck.spec.ts agent-launch-unconfirmed-input.spec.ts agent-launch-start-session-isolated.spec.ts agent-launch-start-session-landing.spec.ts agent-launch-start-session-isolated-boundary.spec.ts agent-launch-start-session-landing-context.spec.ts agent-launch-ad-hoc-terminal.spec.ts --workers=2
```
Independent refactoring consolidated unchanged label declarations in the dialog
owner and extracted complete touch journeys/documentation. Inspected replacement
locations: `agent-launch-card-touch.spec.ts`, `agent-launch-dialog-touch.spec.ts`,
`agent-launch-start-session-touch.spec.ts`, `touchLaunchPage.ts`, and
`LAUNCH-TOUCH.md`. Setup and all assertions retained; typing helper observes
selection before actual input. Replacement proof exited 0, 18 tests/six specs:
```sh
env -u NO_COLOR -u FORCE_COLOR PATH=/opt/homebrew/bin:$PATH npm run test:dashboard -- agent-launch-card.spec.ts agent-launch-card-touch.spec.ts agent-launch-dialog-layout.spec.ts agent-launch-dialog-touch.spec.ts agent-launch-start-session-layout.spec.ts agent-launch-start-session-touch.spec.ts --workers=2
```
Other accepted consumers reused; `git diff --check` passed. A caret-at-End test
assumption was corrected to the actual selection without mutating the field.
No slice-2 promise gap remains.

### 3. Identify and manage the intended session without hover
Type: Behavior
Status: done
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

Accepted proof (2026-10-12): inspected `SidebarEntry.tsx`'s single facts array,
shared frame disclosure and separate Open control; `sidebar-entry.css` preserves
desktop density while exposing touch details. Session/question/attention
controls reuse shared touch size in `agent-launch.css` and
`session-attention-message.css`. New `session-sidebar-touch.spec.ts` observes
visible full title/identity/project/state/model/time/unread facts, actual badge
count, disclosure rotation, exact cross-project selected native identity,
one attachment and no stop/Done. `session-management-touch.spec.ts` observes
the real submitted unfinished report, panel/card Keep open invariants, exact
Mark-read receipt, confirmed Done's intended native stop only, and unavailable
Delete/Keep/confirm record/stop invariants. Setup supplies only disposable
published work/native-host/report starting conditions. Chromium153.0.8010.12
at 390×844/844×390 and 768×1024/1024×768; desktop row/keyboard contracts retained.
Initial red run failed all four new journeys on missing Session details.
Settled preparation reads are required before geometry measurement; existing
stacked panels allow ordinary page scrolling, and beside-page sidebar openness
is preserved. Badge corner overflow exemption has dedicated full-count proof.

Focused proof exited 0, five tests:
```sh
env -u NO_COLOR -u FORCE_COLOR PATH=/opt/homebrew/bin:$PATH npm run test:dashboard -- session-sidebar-touch.spec.ts session-management-touch.spec.ts session-sidebar-row.spec.ts --workers=2
```
Complete direct consumer proof exited 0, 119 whole files:
```sh
env -u NO_COLOR -u FORCE_COLOR PATH=/opt/homebrew/bin:$PATH npm run test:dashboard -- agent-completion-attention.spec.ts agent-completion-binding.spec.ts agent-completion-cursor.spec.ts agent-completion-identity.spec.ts agent-completion-quiet-claude.spec.ts agent-completion-quiet.spec.ts agent-launch-ad-hoc-codex.spec.ts agent-launch-ad-hoc-cursor.spec.ts agent-launch-ad-hoc-sessions.spec.ts agent-launch-ad-hoc-terminal.spec.ts agent-launch-ad-hoc.spec.ts agent-launch-attention-clearing.spec.ts agent-launch-attention.spec.ts agent-launch-card-delete-problems.spec.ts agent-launch-card-delete.spec.ts agent-launch-card-done.spec.ts agent-launch-card-open-session.spec.ts agent-launch-card-session-states.spec.ts agent-launch-card-sessions.spec.ts agent-launch-card.spec.ts agent-launch-codex-observation-boundary.spec.ts agent-launch-codex-observation.spec.ts agent-launch-codex.spec.ts agent-launch-cursor-model.spec.ts agent-launch-delete.spec.ts agent-launch-done-close.spec.ts agent-launch-done-codex-intent.spec.ts agent-launch-done-codex-races.spec.ts agent-launch-done-codex.spec.ts agent-launch-done-prompt.spec.ts agent-launch-done-question-follows.spec.ts agent-launch-done-question.spec.ts agent-launch-done-refusal.spec.ts agent-launch-done-rename-wait.spec.ts agent-launch-done-stop.spec.ts agent-launch-done.spec.ts agent-launch-host-identity.spec.ts agent-launch-model-entries.spec.ts agent-launch-open-session.spec.ts agent-launch-preparation-cursor.spec.ts agent-launch-recent-delete-unavailable.spec.ts agent-launch-recent-delete.spec.ts agent-launch-recent-sessions.spec.ts agent-launch-records.spec.ts agent-launch-session-state-pace.spec.ts agent-launch-start-cursor.spec.ts agent-launch-start-session-isolated.spec.ts agent-session-cursor.spec.ts agent-terminal-avatar.spec.ts agent-terminal-codex-page.spec.ts agent-terminal-cursor-launch-page.spec.ts agent-terminal-cursor-page.spec.ts agent-terminal-delete.spec.ts agent-terminal-done-codex-boundary.spec.ts agent-terminal-done-codex-page.spec.ts agent-terminal-done-question.spec.ts agent-terminal-done-reopen.spec.ts agent-terminal-done-report.spec.ts agent-terminal-done.spec.ts agent-terminal-keyboard.spec.ts agent-terminal-lifetime.spec.ts agent-terminal-maximize.spec.ts agent-terminal-reopen.spec.ts agent-terminal-theme.spec.ts agent-terminal.spec.ts cursor-session-recovery-replacement.spec.ts cursor-session-recovery-stops.spec.ts cursor-session-recovery-wait.spec.ts cursor-session-recovery.spec.ts cursor-sidebar-panels.spec.ts cursor-sidebar-resize-lasting.spec.ts dashboard-columns-paging-launch-dialog.spec.ts dashboard-columns-paging-sessions-sidebar.spec.ts dashboard-columns-paging-side-panel.spec.ts dashboard-header.spec.ts done-question-rule.spec.ts frame-sessions-look.spec.ts recently-done-progressive-added-project.spec.ts recently-done-progressive-after-sessions.spec.ts recently-done-progressive-failed-read-refresh.spec.ts recently-done-progressive-loading.spec.ts recently-done-progressive-navigation-cursor.spec.ts recently-done-progressive-navigation-report.spec.ts recently-done-progressive-navigation.spec.ts recently-done-progressive-refresh.spec.ts recently-done-progressive-reset.spec.ts recently-done-progressive-state.spec.ts recently-done-read-latency.spec.ts recently-done-stories.spec.ts recently-done-story-sessions.spec.ts responsive-session-access.spec.ts session-alerts-unavailable.spec.ts session-alerts-unread-report.spec.ts session-alerts.spec.ts session-attribution.spec.ts session-column-membership.spec.ts session-management-touch.spec.ts session-sidebar-keyboard.spec.ts session-sidebar-navigation-cases.spec.ts session-sidebar-navigation.spec.ts session-sidebar-reading.spec.ts session-sidebar-row.spec.ts session-sidebar-state-edge.spec.ts session-sidebar-stays-as-left.spec.ts session-sidebar-touch.spec.ts session-sidebar.spec.ts session-unread-report-message.spec.ts session-unread-report.spec.ts session-workspace-retirement-attach.spec.ts session-workspace-retirement-claude-done.spec.ts session-workspace-retirement-claude.spec.ts session-workspace-retirement-done.spec.ts session-workspace-retirement-lifetime.spec.ts session-workspace-retirement.spec.ts side-panel-width-kept.spec.ts side-panel-width-stacking.spec.ts side-panel-width.spec.ts story-panel-replacement.spec.ts story-panel-switching.spec.ts --workers=2
```
Specific transitive populated-row consumers and new-spec partition check exited0:
```sh
env -u NO_COLOR -u FORCE_COLOR PATH=/opt/homebrew/bin:$PATH npm run test:dashboard -- cursor-sidebar-size-unkept.spec.ts cursor-sidebar-resize.spec.ts cursor-runner-sessions.spec.ts cursor-sidebar-panels-navigation.spec.ts cursor-sidebar-size-kept.spec.ts --workers=2
env -u NO_COLOR -u FORCE_COLOR PATH=/opt/homebrew/bin:$PATH npm test -- tests/support/dashboard-test-files.test.mjs
```
Independent refactoring changed comments only in sidebar/session/CSS owners;
all accepted runtime/setup/assertion boundaries stayed unchanged, so no tests
reran. `git diff --check` passed. No slice-3 promise gap remains.

Owned CI repair (run 38260224582, attempt1, dashboard12/12): the tablet management
test asserted xterm output before bringing the stacked panel into view. Full
job/artifact contained one failure; real WebSocket banner/composer arrived while
the panel was offscreen, where xterm deliberately pauses rendering. Supported
reduced-motion setup reproduced the same blank-output failure locally. Moved
the existing ordinary panel scroll before the output assertion and retained
reduced motion to discriminate the condition. No product, timeout, native
fixture or action/identity assertion changed. Red filtered command exited1;
repaired filtered and full commands exited0 (full two tests):
```sh
env -u NO_COLOR -u FORCE_COLOR PATH=/opt/homebrew/bin:$PATH npm run test:dashboard -- session-management-touch.spec.ts --grep 'tablet session management' --workers=2
env -u NO_COLOR -u FORCE_COLOR PATH=/opt/homebrew/bin:$PATH npm run test:dashboard -- session-management-touch.spec.ts --workers=2
```
Inspected reduced-motion setup, scroll-before-output and unchanged exact native
invariants in that spec. Independent refactor found no edits needed; unaffected
124-file proof reused. Slice4 was quiesced and preserved through the installed
CI stash protocol; its proof resumes after repair publication/restoration.

### 4. Continue a terminal session in the available space
Type: Behavior
Status: done
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

Accepted proof (2026-10-13): inspected `useAttachedTerminal.ts` and extracted
`terminalTouchScroll.ts` registration/cleanup, public xterm `scrollLines` and
partial-row accumulation. Existing xterm wheel input, work-focus touch handling
and resize gestures do not own one-finger scrollback; Chromium touch gestures
left output unchanged before the adapter. `agent-terminal.css` bounds the
touch identity header independently, after a 390×240 long title consumed the
input area. No custom key or focus rule was needed. Stale tablet tap coordinates
hit the surrounding page before responsive fitting settled; the final proof
waits for current panel/native/rendered geometry before measuring coordinates.

`agent-terminal-touch.spec.ts` supplies disposable published work/native session
only. `touchTerminalPage.ts` observes real WebSocket input and PTY resize/output,
checks rendered room/row fitting, and uses native Chromium touch gestures.
Assertions observe raw Backspace/Enter bytes and edited native line, earlier
then latest scrollback without new input or attachment, full long identity,
240-pixel visible height, portrait/landscape and Maximize/Restore, attachment
counts, Close focus/detach and same-session reopening. Native fixture Backspace
only models terminal editing; raw browser bytes and recorded native input are
checked separately. Chromium153.0.8010.12 at390×844/844×390 and
768×1024/1024×768, each reduced to240px while editing. Documentation retains
the physical-keyboard/remote limits. G3 is proved; no slice4 gap remains.

Complete terminal/shared-consumer proof exited0, and was rerun after independent
gesture/observation extraction with unchanged assertions, again exit0:
```sh
env -u NO_COLOR -u FORCE_COLOR PATH=/opt/homebrew/bin:$PATH npm run test:dashboard -- agent-terminal-touch.spec.ts agent-terminal.spec.ts agent-terminal-maximize.spec.ts agent-terminal-keyboard.spec.ts agent-terminal-lifetime.spec.ts agent-terminal-theme.spec.ts agent-terminal-avatar.spec.ts agent-terminal-codex-page.spec.ts agent-terminal-cursor-page.spec.ts agent-terminal-cursor-launch-page.spec.ts agent-terminal-done-codex-page.spec.ts agent-terminal-done-question.spec.ts agent-terminal-done-reopen.spec.ts agent-terminal-done-report.spec.ts agent-terminal-done.spec.ts agent-terminal-delete.spec.ts agent-launch-ad-hoc-terminal.spec.ts system-settings.spec.ts side-panel-width.spec.ts side-panel-width-stacking.spec.ts side-panel-width-kept.spec.ts dashboard-columns-paging-side-panel.spec.ts story-panel-switching.spec.ts story-panel-replacement.spec.ts cursor-sidebar-resize-lasting.spec.ts cursor-sidebar-resize.spec.ts cursor-sidebar-panels.spec.ts agent-terminal-boundary.spec.ts agent-terminal-close.spec.ts agent-terminal-reopen.spec.ts --workers=2
```
Final fitting and mounted native-retirement consumers exited0:
```sh
env -u NO_COLOR -u FORCE_COLOR PATH=/opt/homebrew/bin:$PATH npm run test:dashboard -- agent-terminal-touch.spec.ts session-workspace-retirement-attach.spec.ts session-workspace-retirement-lifetime.spec.ts session-workspace-retirement-claude.spec.ts --workers=2
env -u NO_COLOR -u FORCE_COLOR PATH=/opt/homebrew/bin:$PATH npm test -- tests/support/dashboard-test-files.test.mjs
```
Independent refactor completed, moving only gesture lifecycle and browser
observations into cohesive owners; unrelated accepted proof remains reusable.
Its 30-file rerun started before the coordinator narrowed the invalidated
selection; the excess unchanged-consumer rerun is a process deviation, not an
additional acceptance gate. Formatter found an unused expected-array parameter;
the equivalent twelve-index sequence repair changed no observation. Repaired
formatter and `git diff --check` passed; all refactor-owned files stay below250
lines. No transport, native-host or session lifecycle expansion occurred.

Owned CI repair (run38314860356/attempt1, dashboard12/12): full log/artifact
accounted for two failures, phone title-ending visibility and tablet unchanged
scrollback after `Input.synthesizeScrollGesture`. Matching Chromium153.0.8010.12
in a disposable Linux Playwright1.63 browser reproduced both: trusted touchstart
and touchend arrived, with zero touchmove events. `touchTerminalPage.ts` now
dispatches native finger movement in feasible viewport-contained strokes;
400px/s input timestamps and a stationary100ms lift preserve the previous
gesture's preventFling contract without sleeps or assigning scroll outcomes.
Linux font geometry showed title-ending plus wrapped ID span76.58px in a72px
header; each is now observed at its own reading position through actual swipes.
Both visibility assertions remain. Product/CSS/timeouts and raw input,
attachment, fitting and Close/reopen assertions are unchanged.

Linux browser setup used `mcr.microsoft.com/playwright:v1.63.0-noble`, ARM64
digest `sha256:eff16c30e6f3f4af0a03fa4b706120d5e9b0891c344a27d64559aff5900a4a27`,
read-only checkout dependencies and Playwright `<loopback>` forwarding to the
unchanged local dashboard/WebSocket/PTY fixture. This bounded diagnostic adds
no browser/device acceptance matrix. Setup check passed. Complete two-test
Linux red with observation-only instrumentation retained both CI failures at
`dashboard/test-results/2026-10-12T22-19-34.901Z`; event and font geometry
observations are retained under `/tmp/mobile-dashboard-linux-*-gesture.json`
and `/tmp/mobile-dashboard-linux-phone-geometry.json`. Final delivered-file
proof removed all diagnostics and exited0 on both Linux and macOS:
```sh
env -u NO_COLOR -u FORCE_COLOR PW_TEST_CONNECT_WS_ENDPOINT=ws://127.0.0.1:32768/ PW_TEST_CONNECT_EXPOSE_NETWORK='<loopback>' npm run test:dashboard -- agent-terminal-touch.spec.ts
env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- agent-terminal-touch.spec.ts
```
Each selected both complete journeys. Inspected native gesture helper and
successive header observations; all helper consumers occur in that full spec.
Independent refactor found no edits needed; wider accepted proof reused.
Formatter and whitespace passed. Disposable Linux container was stopped and
removed; cached images/shared resources preserved. Slice5 paused with its real
red touch-control proof and was preserved through installed CI stash protocol;
resume only after repair publication and restoration.

Subsequent owned CI repair (run38317464424/attempt1, dashboard12/12): full
artifact/log contained one phone title-ending failure. Retained snapshot showed
native movement to46px but title still below the72px header; the zero-move
failure did not recur. A fixed header-height stroke undershot under CI's font
geometry. A taller-title diagnostic at the same real browser/PTY boundary
reproduced the unchanged visibility assertion (exit1,
`dashboard/test-results/2026-10-12T22-45-17.183Z`); names/word geometry proved
the missing reading position. Bounded half-header native strokes now stop on
the existing visible-title/native-ID predicates, with a rendered frame between
strokes and at most12 per target. The same taller diagnostic passed, observing
the full title and then full ID at their respective reading positions.

Exact original title and all visibility/native invariants were restored for
final delivered-file proof. Both complete two-test commands exited0:
```sh
env -u NO_COLOR -u FORCE_COLOR PATH=/opt/homebrew/bin:$PATH PW_TEST_CONNECT_WS_ENDPOINT=ws://127.0.0.1:32770/ PW_TEST_CONNECT_EXPOSE_NETWORK='<loopback>' npm run test:dashboard -- agent-terminal-touch.spec.ts --workers=2
env -u NO_COLOR -u FORCE_COLOR PATH=/opt/homebrew/bin:$PATH npm run test:dashboard -- agent-terminal-touch.spec.ts --workers=2
```
Independent refactor consolidated the repeated reading orchestration into
`scrollHeaderUntilShown` in that spec; inspected its unchanged predicates,
bounded movement and actual-frame observation. The second command reran after
extraction and exited0. Shared gesture/setup/product consumers are unchanged;
prior native-delivery/geometry evidence remains valid. Hosted CI verdict for
the repair remains pending until ordinary registered observation/completion.
The first diagnostic launchServer did not forward loopback and failed at
navigation only; replacing it with run-server and proving HTTP forwarding
resolved that setup failure. Cached Linux image was reused, exact diagnostic
container retired; no dependency/product/CSS/timeout or lifecycle changes.
Formatter/whitespace passed. Slice5 remains planned and its unfinished review
proof was preserved through installed pause/stash protocol.

### 5. Review changes without losing the chosen file
Type: Behavior
Status: done
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

Accepted proof (2026-10-13): inspected the single coarse-input rule owner
`story-review-touch.css` and its import after base styles in `StoryReviewPanel`.
Shared44px targets cover context, comparison, file/folder, commit and checkbox
labels. Context gets a bounded, scrollable share with scroll padding; expanded
values scroll independently. Initial real reds measured25.89px targets and
20.59px landscape diff. Desktop declarations and comparison/selection/mark
semantics remain unchanged. All→Commits selects a new comparison; the journey
chooses the actual desired file after it settles rather than altering that
existing transition. LargeWorktree supplies63 real committed files, with the
wide line after200 short lines, not the navigation outcome.

`story-review-touch.spec.ts` and `support/reviewTouchReading.ts` now observe
native vertical movement to the line's first11 characters, ending15 initially
clipped then fully inside the code pane after horizontal movement, fixed
header/context/heading/browser geometry and no page-wide overflow. A native
return observes a fully visible short line before independent scrolling and
rotation checks. Selected comparison/file/reading place survive both rotations,
Maximize/Restore and Hide/Show; geometry reads no new snapshot. Next/Refresh,
genuine nondefault Commits choice and Close focus are observed. Separate
`story-review-mark-touch.spec.ts` observes checkbox7→4 displayed files, rotation
choice and actual saved mark of the whole opened snapshot. G5 is proved.
Chromium153.0.8010.12 at390×844/844×390 and768×1024/1024×768, reduced motion.

Complete51-file consumer proof exited0 before the test-only G5 reading repair;
its unchanged product/helper observations remain reusable:
```sh
env -u NO_COLOR -u FORCE_COLOR PATH=/opt/homebrew/bin:$PATH npm run test:dashboard -- story-review-touch.spec.ts agent-terminal-touch.spec.ts story-review-panes.spec.ts story-review.spec.ts story-panel-switching.spec.ts story-panel-replacement.spec.ts side-panel-width.spec.ts side-panel-width-stacking.spec.ts side-panel-width-kept.spec.ts recently-done-one-shot-review.spec.ts story-review-action.spec.ts story-review-commit-admission.spec.ts story-review-commit-races.spec.ts story-review-commit-ranges.spec.ts story-review-commit-refresh.spec.ts story-review-commit-renames.spec.ts story-review-commit-trunk.spec.ts story-review-commit-worktree.spec.ts story-review-commits.spec.ts story-review-comparison-files.spec.ts story-review-comparison.spec.ts story-review-context-line.spec.ts story-review-diff.spec.ts story-review-file-moves.spec.ts story-review-folders.spec.ts story-review-landed.spec.ts story-review-line-counts.spec.ts story-review-mark.spec.ts story-review-nothing.spec.ts story-review-one-shot-admission.spec.ts story-review-one-shot-choice-races.spec.ts story-review-one-shot-choice-refresh.spec.ts story-review-one-shot-choice.spec.ts story-review-one-shot-unavailable.spec.ts story-review-one-shot.spec.ts story-review-refresh.spec.ts story-review-refusal.spec.ts story-review-since-trunk.spec.ts story-review-since.spec.ts story-review-story-branch-landed.spec.ts story-review-tree-collapse.spec.ts story-review-tree.spec.ts story-review-trunk-own-changes.spec.ts story-review-trunk-own-flagged.spec.ts story-review-trunk-own-older-git.spec.ts story-review-trunk-own-since.spec.ts story-review-trunk-worktree-ambiguity.spec.ts story-review-trunk-worktree.spec.ts story-review-uncommitted-check-refresh.spec.ts story-review-uncommitted-check.spec.ts story-review-workspace.spec.ts --workers=2
```
Final complete four-touch proof exited0, including actual G5 reading. A bounded
same-Chromium Linux diagnostic for the known native-gesture boundary also
passed unchanged, refuting the suspected undershoot on these exact paths:
```sh
env -u NO_COLOR -u FORCE_COLOR PATH=/opt/homebrew/bin:$PATH npm run test:dashboard -- story-review-touch.spec.ts --workers=2
env -u NO_COLOR -u FORCE_COLOR PATH=/opt/homebrew/bin:$PATH PW_TEST_CONNECT_WS_ENDPOINT=ws://127.0.0.1:32771/ PW_TEST_CONNECT_EXPOSE_NETWORK='<loopback>' npm run test:dashboard -- story-review-touch.spec.ts --workers=2
```
Exact diagnostic container retired. Independent refactor consolidated touch
styles/native gestures, extracted reading observations and split marking proof.
Terminal helper re-export retains its API/default vertical behavior. Mark/since
contract moved verbatim to linked `STORY-REVIEW-MARKS.md`; links/content checked.
Inspected new declarations, native dispatch and observation helpers. Focused
replacement proof and new-spec partition check exited0:
```sh
env -u NO_COLOR -u FORCE_COLOR PATH=/opt/homebrew/bin:$PATH npm run test:dashboard -- story-review-touch.spec.ts story-review-mark-touch.spec.ts story-review-panes.spec.ts story-review.spec.ts story-panel-switching.spec.ts story-panel-replacement.spec.ts agent-terminal-touch.spec.ts --workers=2
env -u NO_COLOR -u FORCE_COLOR PATH=/opt/homebrew/bin:$PATH npm test -- tests/support/dashboard-test-files.test.mjs
```
Formatter's non-null assertion/unnecessary-fallback findings were repaired
mechanically with unchanged observing values. Formatter/whitespace passed;
all refactor-owned files stay at or below250 lines. No backend/native/model
contract change or remaining slice5 gap.

Owned CI repair during slice6 pause (run38322070878/attempt1, dashboard2/12):
the existing `agent-launch-uncertain-continuation.spec.ts` froze a live attempt's
whole warning timestamp. Full artifact/log had one final failure: `slowSince`
changed48ms while duplicate/Continue refusals and other worker facts passed.
`OwnedAttempts.observed` derives acceptance-time warning until the owning timer
persists its own timestamp. Earlier worker-liveness commit25cdc5f6 established
that rule and the same matcher in execution/preparation resume peers, leaving
this assertion stale. Test/server code predates this UI execution; this is an
existing observation defect, not an attributed mobile regression.

Only the timestamp matcher now allows that documented transition. Whole-array
equality retains one attempt, request/id/acceptedAt, complete worker record,
ownership/running/publication; native-call/profile/automatic-settlement and
cleanup assertions remain strict. Inspected actual diff, observer/settlement
owners, peer assertions and CI trace. Complete seven-test proof exited0:
```sh
env -u NO_COLOR -u FORCE_COLOR PATH=/opt/homebrew/bin:$PATH npm run test:dashboard -- agent-launch-uncertain-continuation.spec.ts --workers=2
```
Independent refactor found no edits needed; duplicated expectation documents
distinct recovery journeys without duplicating production rules. Unchanged
consumer proof reused. Formatter/whitespace passed. Slice6 stays planned;
unfinished settings baseline was preserved through installed pause/stash
protocol pending repair publication/restoration.

Owned review-proof CI repair during slice6 pause (run38323369971/attempt1,
dashboard12/12): the tablet's complete review journey exceeded30s while Close
finished. Full hosted trace/log shows all reading, rotation, selection, panel
and focus assertions succeeding; no individual API call stalled (maximum496ms).
The reader's duplicate300px cap caused35 feedback frames and390 native
touchMove samples, consuming9.991s of the journey. The existing native helper
already splits requested movement into feasible in-view strokes.

Only `support/reviewTouchReading.ts` now sends the observed remaining distance
plus the existing24px compensation to that helper. Ten movement samples,
no-fling timestamps, actual Range clipping/text observations, bounded convergence
and every integrated assertion remain unchanged. Inspected reader/helper and
all original touch/mark observations; consumer search finds only the primary
review touch spec. Unchanged Linux baseline passed2 tests; changed Linux full
touch/mark proof passed4. Tablet journey15.814s→10.364s,350→230 touchMoves,
34→9 CDP sessions and31→6 feedback frames; phone16.084s→11.846s,370→290
touchMoves,35→9 sessions and32→6 frames. Linux used the cached same-Chromium
ARM64 image; hosted x64 timing remains conditional on the next CI run.
Final macOS full proof exited0 quietly:
```sh
env -u NO_COLOR -u FORCE_COLOR PATH=/opt/homebrew/bin:$PATH npm run test:dashboard -- dashboard/tests/story-review-touch.spec.ts dashboard/tests/story-review-mark-touch.spec.ts --workers=2
```
Exact diagnostic container retired. Independent refactor found no edits needed;
reader visibility/convergence and native stroke ownership are coherent.
Formatter/whitespace passed. No timeout, product, fixture, shared native helper
or assertion change. Slice6 remains planned with settings proof preserved.

### 6. Edit settings and recover by touch
Type: Behavior
Status: done
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

Accepted proof (2026-10-13): inspected the ten coarse-input CSS lines keeping
the existing settings bar sticky. The initial full look spec failed both new
touch cases at clipped Back after reading the final group; desktop cases
passed. Final look proof reads actual rendered project/path, OpenAI status and
theme text within viewport/ancestor clipping, rotates, then taps current44px
Back without action scrolling and restores project/roster/focus.

Project touch proof edits at320px height, retains exact URL/typed tilde path
through rotation, preserves predecessor bytes after Cancel and real Add/Remove
permission failures, then observes explicit retry writes. OpenAI touch proof
edits at the actually touched password caret, retains exact draft/file bytes
through reduced height/rotation/failed Save, observes status Retry without a
write, exact successful Save and failed Remove/retry, and unsaved input clearing
on leaving settings. Theme touch proof reads the sample, saves Solarized Dark,
observes failed save restoring saved selector/sample and predecessor bytes,
then rotates and taps Retry to save Light. Real disposable storage assertions
exclude unrelated setting writes, provider egress and native launches/stops.

Settings terminal touch proof reaches real browser/server/WebSocket/PTY echo
before and after entering/leaving settings. Session identity, attachment PID,
running process, one attachment/launch, exact input lines, absence of ending or
stops and project bytes persist through reduced height/rotation. Fixtures supply
private starting configuration/native stand-ins; they do not supply outcomes.
Chromium153.0.8010.12/Playwright1.63/Node24.21; phone390×844/844×390,
tablet768×1024/1024×768, editing height320 and corresponding desktop cases.

Inspected actual setup/assertions in `projectAddMachine`,
`systemSettingsMachine`, all five changed specs and `settingsTouchPage`.
Ordinary content scrolling corrects sticky-header occlusion, then checks every
actual text Range exactly; a fractional paragraph line-box edge is not used as
a glyph visibility proxy. Single-line URL scrolling, typed tilde path storage
and existing credential/theme recovery contracts remain unchanged. No new
operation, message, default, backend or native lifecycle. Consumer search finds
one settings-bar owner; all seven settings specs ran completely,25 tests,
including ten new phone/tablet cases, terminal exit0 quiet:
```sh
env -u NO_COLOR -u FORCE_COLOR PATH=/opt/homebrew/bin:$PATH npm run test:dashboard -- system-settings-look.spec.ts system-settings-project-management.spec.ts system-settings-openai-recovery.spec.ts system-settings-terminal-theme.spec.ts system-settings.spec.ts system-settings-openai.spec.ts system-settings-openai-race.spec.ts --workers=2
```
Independent refactor extracted complete mobile project editing and attached
terminal journeys into `system-settings-project-management-touch.spec.ts` and
`system-settings-terminal-touch.spec.ts`, preserving statements/setup/assertions.
Inspected their relocated observations; retained desktop specs and both new
specs passed completely. Other five specs remain unchanged and reuse proof:
```sh
env -u NO_COLOR -u FORCE_COLOR PATH=/opt/homebrew/bin:$PATH npm run test:dashboard -- system-settings-project-management.spec.ts system-settings-project-management-touch.spec.ts system-settings.spec.ts system-settings-terminal-touch.spec.ts --workers=2
env -u NO_COLOR -u FORCE_COLOR PATH=/opt/homebrew/bin:$PATH npm test -- tests/support/dashboard-test-files.test.mjs
```
New-spec exactly-once partition proof exited0. Formatter's untyped parsed
fixture-array finding was repaired mechanically; no assertion/value changed.
Formatter/whitespace passed and every owned product/test/doc file is≤250 lines.
All five recorded obligations resolved; no remaining slice6 acceptance gap.
Physical device/keyboard, additional engines and remote access stay excluded.

## Execution complete

Product advice: No additional product story is recommended from this execution.
The six delivered journeys meet the selected local viewport/touch acceptance
boundary while preserving desktop operation and native-host meanings. Continue
the existing CI-observation, strict-proof reporting and unattached native-session
work in their own queued/Taken stories. Terry's later connection arrangement
remains outside this UI story.

## Execution retrospective

Reviewed the original execution-ready plan at established claim
`db0dfb0773236c1ff56ad12851ebdac8f3ee73e8`, selected SEED-133 story, recorded
proof/decisions and aggregate result at final implementation
`866f49cca1ae5d0ef53f1d83a5ba22bf7bd5f81b`. Git confirms the story and both
North Stars unchanged, the same six slice outcomes, and no interleaved unrelated
commits in this branch range. Initial claim is planning/ownership provenance;
the following accepted published revisions are the complete related set:

| Accepted revision | Attribution |
| --- | --- |
| `1a843c3efbcd97a068c5c04fe94da007d6a1144e` | Slice1: touch browsing and visible Start reasons. |
| `ef370423642958deb1f7aa151d17f5a4aefdde84` | Slice2: reduced-height launch editing/recovery. |
| `d465a827be2a7162ae0ea05b621496537a3d27ab` | Slice3: session facts and explicit management. |
| `80affc7edb6033b723e32b11cbc1ddd68dd2d0e6` | Owned CI repair: observe terminal after ordinary panel scrolling. |
| `65a03c49056f81343e2b17d4c83fa9c9f496313f` | Slice4: terminal fitting, input and native scrollback. |
| `63ca444fe4b5d736a9e4ff3bcda2029556e7cb8b` | Owned CI repair: complete native movement and successive identity reading. |
| `95419ae267a41dd625612b46a9cd734ddd0d3ef1` | Owned CI repair: identity strokes converge on observed visibility. |
| `5505a27563d8822a15f64410955e1e9bf8b073da` | Slice5: real diff reading, context, controls and marking. |
| `6b793828659e70b76d78392895ba931569edc49f` | Owned CI repair: existing live warning timestamp observation. |
| `27fa55b50bf2f75446dcbb2ce0acaacc1db0297d` | Owned CI repair: remove duplicate review gesture cap. |
| `866f49cca1ae5d0ef53f1d83a5ba22bf7bd5f81b` | Slice6: settings readability, drafts, recovery and retained attachment. |

Outcome findings: none requiring correction. Read the uncontaminated net diff,
current shared controls/sidebar/dialog/panel/settings/terminal owners and their
underlying state/operation contracts. One control-size rule and one session
facts array serve their representations; native touch scrolling belongs to the
existing attachment with cleanup. Review and settings adapt existing geometry.
No browser-brand branch, mobile story/session model, duplicated host operation,
speculative extension or abandoned workaround remains. Accepted ADR0000/0002
and published-observation/connected-stage direction agree; Proposed ADR0008
grants no connection change authority. Documentation follows existing owners.

E2E observations drove the geometry/interaction changes with retained reds.
Whole-suite assessment was read-only: meaningful desktop, touch and real
browser/server/native integration journeys remain; external provider/native
stand-ins supply starting facts rather than outcomes. Tests are parameterized
by two viewport conditions, not a device/engine matrix. Focused affected
consumers and exactly-once spec partitioning passed. No full-suite local rerun
or unsupported detailed-test downgrade is needed. The observed review input
overhead was repaired with measured unchanged-assertion evidence above.

Process review enabled by `skipProcessRetrospective:false`. Available retained
coordinator/tool history, agent handoffs, plan and Git support bounded findings;
full raw histories and total execution cost were not reconstructed. Recorded
one execution occurrence under ODF-141 for the no-edit small-repair independent
handoff (reported five active minutes, not measured token savings), and new
DD-292 for slice4's unnecessary unchanged-consumer rerun. `DearDough.md` grew
223→243 physical lines with no pruning or threshold warning. Proposals are
proportionate review for established small repairs and choosing invalidated
proof before starting verification; no workflow/backlog guidance was changed.
Observer loss recoveries and causal CI diagnoses retain their own evidence;
this review assigns no invented general failure rate or unmeasured cost.

Planning classification: unchanged; no correction story or plan created.
Review complete; applicable CI on the execution branch remains pending at
`866f49cca1ae5d0ef53f1d83a5ba22bf7bd5f81b` on retained observer
`/tmp/dough-ci-501/watch-V2jZ70`. This record's publication and the invoking
execution's single exact-revision completion receipt own the final CI verdict
and local shutdown. Physical-keyboard, engine and remote-access exclusions
remain evidence limits, not overlooked acceptance prerequisites.

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

## Story obligations

### G1. Physical keyboard and engine evidence boundary
Reported: slice 2 — "Physical iOS keyboard and remote-connectivity validation remain outside scope."
Story clause: "Viewport/touch checks are the accepted local UI proof; they do not claim physical iOS keyboard behavior or universal browser compatibility."
Disposition: excluded "Viewport/touch checks are the accepted local UI proof; they do not claim physical iOS keyboard behavior or universal browser compatibility."

### G2. Remote connection evidence boundary
Reported: slice 2 — "Physical iOS keyboard and remote-connectivity validation remain outside scope."
Story clause: "Tailscale, remote connectivity, and the previously requested real-device connection reality check are outside this story."
Disposition: excluded "Tailscale, remote connectivity, and the previously requested real-device connection reality check are outside this story."

### G3. Terminal fitting and input comfort
Reported: slice 3 — "Terminal fitting/input comfort remains slice 4’s work"
Story clause: "Input, output, and panel controls remain usable with constrained visible height;"
Disposition: proved by slice 4: agent-terminal-touch.spec.ts and touchTerminalPage.ts observe edited native input, actual touch scrollback, fitted rows at 240px, reachable controls and same attachment through viewport changes

### G4. Offscreen terminal observation in session management
Reported: slice 3 — "the test waited for .xterm-rows before scrolling the stacked terminal into view"
Story clause: "then open its terminal or available final report."
Disposition: proved by slice 3: session-management-touch.spec.ts scroll-before-output with reduced motion, complete two-test command above

### G5. Actual long-diff reading observation
Reported: slice 5 — "wideLine is after200 short lines, but the current vertical -180px drag stays near the beginning; DOM toContainText includes offscreen content"
Story clause: "choose a file, read its diff, and rotate."
Disposition: proved by slice 5: story-review-touch.spec.ts and support/reviewTouchReading.ts observe visible beginning/end through actual native gestures, containment and a visible mid-file reading position before rotation

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
