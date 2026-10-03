# Modernize and streamline the dashboard frame

**Identity:** SEED-091#dashboard-frame-renovation
**Source:** [refined story](../../seeds/SEED-091-dashboard-ui-renovation.md#dashboard-frame-renovation).
**Prepared:** 2026-10-03. Planning only, in the established preparation workspace. This instruction authorizes neither implementation nor publication.

## Goal and boundaries

A developer monitoring and directing story work can navigate and use a
visually polished, modern dashboard frame with clear controls, consistent
styling, and the System settings gear at the far upper right.

Included scope is the source story's scope: the banner, Sessions sidebar, the
row below the banner, the stage containers and connector, the terminal and
final-report panel's header and controls, dialog chrome, the agent roster's
surrounding chrome, the frame's loading, empty, no-projects, and problem states,
and System settings. Material exclusions:

- Story cards and their session boxes ("Working", "Needs input", Recent
  sessions). Story 2 of SEED-091 owns the cards.
- Terminal contents and colours, which belong to SEED-090.
- Dark theme, settings section navigation, and a different project selector.
- The content or information hierarchy of dialogs, roster entries, and the stage
  layout.
- Any change to wording, accessible names, keyboard shortcuts, navigation,
  history, or published facts.

## Direction and PFE

PFE: reuse the frame's existing pieces and add only the icon library.

- `dashboard/src/styles.css` already defines colour tokens on `:root`
  (`--surface`, `--panel`, `--line`, `--edge`, `--text`, `--quiet`,
  `--accent`, `--problem`, `--ready`, `--focus-ring-clearance`). Extend this
  set with type scale, spacing, radius, elevation, and control sizes. Do not
  start a second token set or adopt a CSS framework or component suite.
- The frame has five hand-drawn icons: Sessions (`SessionSidebar.tsx`),
  Refresh (`SourceStatus.tsx`), and Mark as done, Maximize/Restore, and Close
  (`TerminalPanel.tsx`). The help control draws a text "?". Replace all six
  with Lucide through one icon component. The Taking work connector arrow
  (`WorkStages.tsx`) is a connector, not an icon, so it stays an SVG and only
  takes the tokens. The card mode marks under `public/mode-icons/` belong to
  story cards.
- The terminal panel's icon buttons already carry a `title` that matches their
  name ("Close (⌘⇧Esc)"). That wording is the precedent for every frame
  icon-only control's tooltip. Native `title` shows only on hover, so the
  tooltip itself is a shared CSS tooltip (see Current decisions).
- `lucide-react@1.51.0` (ISC) supports React 19. Pin it exactly in
  `devDependencies`, like every other dependency here; Vite bundles it.

Accepted ADRs: [0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
favours small increments and inexpensive change. Every slice keeps existing
behavior green and leaves the frame consistent within what it touched. No
Accepted ADR conflicts. Proposed ADR 0008 and
[the tech-stack recommendation](../../../docs/dashboard-tech-stack.md) (plain
CSS, no component suite) inform the plan and bind nothing. The look follows the
[UX/UI North Star's visual direction](../../../docs/dashboard-ux-ui-north-star.md#visual-and-accessibility-direction),
and its contrast numbers are this plan's thresholds. No new North Star topic is
needed: the seed's Architecture section holds the shared-foundation direction
until the code shows it.

## Key examples and proof

| Promise (source example) | Owning slice | Observable proof |
| --- | --- | --- |
| One banner row at 1440px: Lucide Sessions with count, project name, tabs, Lucide Refresh, gear at the far right; shared type, sizes, radius, colours | 1 | `dashboard-header.spec.ts` extended: the gear is the banner's last control and rightmost at 1280px; every banner icon control, including its tooltip on hover and on Tab focus, passes the frame icon-control check. Before/after screenshots at 1440px and 420px, accepted by Terry |
| Gear named "System settings" with a tooltip on hover and focus; opens Settings; Back to dashboard returns focus to it | 1 (gear), 2 (page) | `system-settings.spec.ts`, which already asserts focus return, plus the icon-control check on the gear (name, tooltip on hover and focus, `aria-hidden` SVG, contrast ≥3:1, visible focus) |
| Settings page: back control, Projects and OpenAI sections styled like the dashboard; Add, Remove, and Save API key work as before | 2 | `system-settings*.spec.ts`, `project-add.spec.ts`, `project-remove.spec.ts`, and `project-configuration*.spec.ts` green; a new assertion that each section is a headed region with ≥4.5:1 text and ≥3:1 control contrast; no sideways scroll at 420px |
| Failed read: refresh becomes Retry, problem shown near the source in problem styling | 1 | `read-failure.spec.ts` and `read-failure-refresh.spec.ts` green; the Retry icon passes the icon-control check |
| Terminal header shows the title and Lucide Done, maximize, and Close icons in the frame style; contents unchanged | 4 | `agent-terminal-maximize.spec.ts` and `agent-terminal-done.spec.ts`, with icon-control assertions moved to the shared check; xterm container styles untouched in the diff |
| At 420px or 200% zoom the banner wraps without covering content; every control reachable and named | 1, re-checked in 3–5 | `dashboard-header.spec.ts` viewports (320px zoomed window, 700px, Verdana) green; each slice's surfaces run `expectNoSidewaysScrollAndWholeText` at narrow width |
| Story cards, their session boxes, and terminal contents look as before | every slice | The diff touches no card or card-session CSS selectors, and no xterm options; after screenshots of cards match before |
| Row below banner, stage containers, connector, help modal, and empty, loading, no-projects states renovated | 3 | `direction-disclosure.spec.ts`, `preparation-legend.spec.ts`, `accessible-overview*.spec.ts`, and `project-configuration.spec.ts` (no projects) green; icon-control check on the help control |
| Sessions sidebar including Running Cursor sessions in frame style | 4 | `session-sidebar*.spec.ts` green; Sessions button icon-control check |
| Launch, Add project, and Remove project dialog chrome, and the roster's chrome, in frame style | 2 (project dialogs), 5 (launch dialogs, roster) | `agent-launch-dialog-layout.spec.ts`, `agent-roster*.spec.ts`, `project-add.spec.ts`, and `project-remove.spec.ts` green; long-title start-session dialog at narrow width and 200% zoom keeps controls reachable |
| Navigation guidance describes the gear | 1 | `docs/dashboard-navigation.md` and `dashboard/PROJECT-CONFIGURATION.md` updated in the same slice |

**The frame icon-control check** is one shared test helper, added in slice 1
and reused afterwards. It asserts the control's accessible name, a tooltip
with that name that becomes visible on hover and on keyboard focus, an
`aria-hidden` Lucide `svg`, the shared rendered size, an icon
contrast of at least 3:1 against its background, and a visible focus outline
of at least 3:1. Build it on the existing `dashboard/tests/accessibleReading.ts`
(`expectReadableContrast`) and `dashboard/tests/pageLayout.ts` helpers.

## Decisive premises

| Premise | Consumed by | Observation | Result |
| --- | --- | --- | --- |
| The existing header, settings, and terminal specs are green at the start revision | Slices 1, 2, 4 (regression baseline) | `npx playwright test --config dashboard/playwright.config.ts --reporter=line dashboard/tests/dashboard-header.spec.ts dashboard/tests/system-settings.spec.ts dashboard/tests/agent-terminal.spec.ts`, run in this worktree with a clean environment (see Current decisions) | 9 passed, 8.5s |
| Lucide's `svg` is `aria-hidden="true"` without extra props, so specs asserting `svg[aria-hidden=true]` in refresh, sessions, and terminal controls stay valid | Slices 1, 3, 4 | Read `lucide-react@1.51.0` `dist/esm/shared/src/build/buildLucideIconNode.mjs`: it sets `aria-hidden: "true"` when the icon has no a11y prop | Confirmed |
| Lucide supports React 19 and ships the needed icons | Slice 1 | `npm view lucide-react@1.51.0 peerDependencies` gives `react ^16.5.1 … ^19.0.0`; the package's `dist/esm/icons` holds `menu`, `panel-left`, `refresh-cw`, `rotate-cw`, `settings`, `circle-help`, `circle-check`, `maximize-2`, `minimize-2`, `x`, `arrow-left` | Confirmed |
| The settings entry is reached by name, not by position or class: tests use `getByRole("button", { name: "System settings" })` and `App.tsx` returns focus through `button[aria-label='System settings']` | Slice 1 (moving the gear after Refresh) | `grep -rn "System settings" dashboard/tests dashboard/src` | Confirmed: there are no `.project-configuration-actions` selectors in tests. The no-projects banner in `App.tsx` has its own button and must also become the gear |
| Specs pin the terminal icon buttons' current styling: 36×36, transparent, borderless | Slice 4 | `dashboard/tests/agent-terminal-maximize.spec.ts:100-120` | Confirmed. Slice 4 keeps those values or moves them into the shared check with the new frame size; the promise (quiet, compact, named) stays asserted |

## Ordered slices

### 1. A renovated banner on a shared visual foundation, with the settings gear
Type: Behavior
Status: done — look accepted by Terry at the visual checkpoint, 2026-10-03
Accepted proof: `npm run typecheck:dashboard`; `npx playwright test --config
dashboard/playwright.config.ts --reporter=line` over
`accessible-overview-keyboard`, `accessible-overview`, `refresh`,
`story-readiness-accessible`, `dashboard-header`, `system-settings`,
`session-sidebar`, `read-failure`, `read-failure-refresh`,
`project-configuration`, and `project-read-recovery` specs (47 passed); full
dashboard suite 973 passed (an earlier full run under heavy load had seven
launch-card `toContainText` timeouts that passed on rerun, recorded below).
The shared check is `expectFrameIconControl` in
`dashboard/tests/frameIconControl.ts`; `dashboard-header.spec.ts` "banner is
one row at {1440,1280} CSS pixels, ending with System settings" pins order and
the gear's position. Before/after screenshots compared a build of the starting
revision and of this slice against the same live projects; cards are
unchanged.
Learnings: the icon control's tooltip hangs from a zero-size anchor with
`contain: layout`, so a showing tooltip does not count as overflow in
`expectNoSidewaysScrollAndWholeText`; reuse it in slices 3–5. The two-row
banner at the 320px zoomed window is about 124px against the spec's 128px
limit, so later banner height at narrow widths breaks `dashboard-header.spec.ts`.
Keyboard order through the banner (Sessions, project choices, Refresh, source
name, gear) still differs from visual order, as before this slice; changing it
would change navigation, which the story excludes. `project-configuration.spec.ts`
sits at the 250-line limit. The full-run launch-card timeouts
(`agent-launch-cursor-model`, `agent-launch-preparation-{codex,cursor,kept}`,
`agent-launch-start-{codex,cursor,taken}`) touch no frame code and stay an
open flakiness defect outside this story.
Proof: The banner rows of the proof table; `dashboard-header.spec.ts`, `system-settings.spec.ts`, `session-sidebar.spec.ts`, `read-failure*.spec.ts`; the full dashboard Playwright suite once (see Current decisions); before/after screenshots.

Behavior: the dashboard is open on a configured project → the developer looks
at and uses the banner → one consistent banner in the new look, as in the
seed's first example. The Sessions toggle with its count, the source
disclosure, the project tabs, and Refresh/Retry use the shared tokens and
Lucide icons. The gear sits after Refresh at the far right with name and
tooltip "System settings", and opens settings as before. The no-projects page's
banner shows the same gear.

Includes: extend the `:root` tokens; add the icon component wrapping
`lucide-react` (size, stroke, decorative hiding); pin the dependency; add the
frame icon-control test helper; update `docs/dashboard-navigation.md` and
`dashboard/PROJECT-CONFIGURATION.md`. Before the first product edit, capture
"before" screenshots at 1440px and 420px of the main view, the open Sessions
sidebar, and Settings. Take them from the production dashboard at
`http://127.0.0.1:4173/` (its frame matched the starting revision on
2026-10-03), or from a build of the starting revision when production no
longer shows that frame. Take "after" from a build of this workspace against
the same projects. After the slice, capture "after" screenshots.

**Visual acceptance checkpoint:** after slice 1 is green, stop and present the
before/after screenshots to Terry. Slices 2–5 apply the accepted look. A
requested change to the look is made in slice 1's surfaces before continuing.

### 2. System settings as a renovated page
Type: Behavior
Status: done
Accepted proof: `npm run typecheck:dashboard`; `npx playwright test --config
dashboard/playwright.config.ts --reporter=line dashboard/tests/system-settings
dashboard/tests/project-add dashboard/tests/project-remove
dashboard/tests/project-configuration dashboard/tests/openai-configuration
dashboard/tests/dashboard-header.spec.ts
dashboard/tests/session-instruction-voice.spec.ts` (65 passed), plus
`project-restored-session`, `project-selection`, and
`authenticated-read-agent-settings` (34 passed). The new
`system-settings-look.spec.ts` checks each section as a headed region in one
column with ≥4.5:1 text and ≥3:1 control contrast (`expectControlContrast` in
`accessibleReading.ts`), and the page and both project dialogs at 420px.
Learnings: `dashboard/src/frame-controls.css` holds `.frame-button`,
`.frame-button-primary`, and `.frame-input` for slice 5's launch dialog
buttons, which still use `agent-launch.css`'s older outline style. A label
split around `.project-action-target` needs one wrapping span inside an
inline-flex button, or the gap doubles the space.
Proof: The settings rows of the proof table.

Behavior: the developer activates the gear → a settings page with a header
holding a back control (still named "Back to dashboard") and one styled
section each for Projects and OpenAI, with project rows, Add project and Remove
project dialogs, the API key field, and its buttons in the frame style →
adding, removing, saving, Retry, Back, and Back/Forward behave as before, with
focus returned to the gear. A later setting group drops in as another section
with no layout change.

### 3. The row below the banner, the stages' frame, and the frame states
Type: Behavior
Status: done
Accepted proof: `npm run typecheck:dashboard`; full dashboard suite 978
passed; after the CSS split and refactor, 171 passed over
`direction-disclosure`, `preparation-legend`, `accessible-overview`,
`project-configuration`, `dashboard-header`, `frame-overview-look`,
`published-work`, `agent-launch-ad-hoc`, `read-failure`, `refresh`,
`responsive-session`, `story-readiness-accessible`, `project-read-recovery`,
`session-sidebar`, `system-settings`, `project-selection`,
`authenticated-project-overview`, `source-navigation`, and `auto-refresh`. The
help control passes `expectFrameIconControl` in `preparation-legend.spec.ts`;
`frame-overview-look.spec.ts` checks the row, stages, connector, empty stage,
failed read, and no-projects state at 420px and the zoomed window. The CSS
diff touches no card, card-session, or xterm selector.
Learnings: the help control moved from ≥44px to the shared 40px control, still
above the 24px minimum target. `stage-frame.css` and `frame-states.css` load
after `styles.css` in `main.tsx` and rely on that order. `--weight-strong` is
the frame heading weight. `expectDecorativeIcon` in `frameIconControl.ts`
checks icons inside text buttons. The "Loading projects…" panel shows too
briefly for a look test and shares `.frame-state` with the tested no-projects
state.
CI repair (runs 37107532924 and 37109262826, `dashboard (5/9)`):
`agent-launch-ad-hoc-cursor.spec.ts` saw two Cursor attaches because the
default fake Cursor looked idle at once and the detached idle watch hung the
launch client up before the auto-opened panel joined under load. The spec now
uses the shared `workingCursorTest` fixture in `tests/support/cursorStart.ts`
and polls the saved first-input record; reproduced 13 of 25 before, 90 of 90
after. The separate local launch-card 5 s waits under load stay open, as
recorded in slice 1.
Proof: The row-below-banner rows of the proof table.

Behavior: the developer reads the overview → Near-future direction, Start
session (text plus a leading icon), and the Lucide help control with its legend
modal; the Backlog and Taken containers with their headings, counts, and Taking
work connector; and the loading, empty, no-projects, and source-problem states
all use the frame style. Cards inside the stages are unchanged.

### 4. Sessions sidebar and terminal panel chrome
Type: Behavior
Status: done
Accepted proof: `npm run typecheck:dashboard`; 191 passed over
`agent-terminal`, `session-sidebar`, `dashboard-header`, and 65 related specs
(`agent-completion-*`, `agent-launch-*`, `session-workspace-retirement*`,
`responsive-session-access`, `session-alerts-unavailable`,
`frame-overview-look`, `system-settings*`, `preparation-legend`,
`backlog-preparing`, `accessible-overview`, `frame-sessions-look`); after the
refactor, 28 passed over the `expectFrameIconControl` callers and
`agent-terminal-keyboard`. `agent-terminal-maximize.spec.ts` runs the shared
check on Mark as done, Maximize, Restore, and Close ("Close (⌘⇧Esc)");
`frame-sessions-look.spec.ts` checks the Sessions button, sidebar and panel
contrast, and narrow and zoomed fit (passed 16 of 16 repeated). No xterm
option, `.terminal-screen` rule, or card selector changed.
Learnings: the Running Cursor sessions list the seed names is not built yet
(only the North Star describes it), so there was nothing to restyle; whoever
builds it reuses the sidebar entry rules. A positioned `.icon-control` paints
over earlier positioned neighbours, so the terminal portrait got a `z-index`;
slice 5's roster portraits may need the same. xterm refits asynchronously
after a resize, so a layout check with an open terminal waits for
`.xterm-screen` to fit `.terminal-screen` and passes `.terminal-screen` and
`.sidebar-title` to `expectNoSidewaysScrollAndWholeText`'s new `cutByDesign`
list. `tooltipOf` in `frameIconControl.ts` finds a control's tooltip.
Proof: The terminal and sidebar rows of the proof table.

Behavior: the developer opens the Sessions sidebar and a session terminal →
sidebar entries, their attention marks, the Running Cursor sessions list, and
the panel header's title, Mark as done, Maximize/Restore, and Close use the
frame style and Lucide icons with names and tooltips → toggling, shortcuts
(Command+B, Command+Shift+Escape), focus, and detach behave as before, and the
terminal contents look the same.

### 5. Launch dialogs and agent roster chrome
Type: Behavior
Status: done
Accepted proof: `npm run typecheck:dashboard`; full dashboard suite 983
passed; 145 passed over `agent-launch-dialog`, `agent-roster`, `project-add`,
`project-remove`, `frame-launch-look`, `system-settings`,
`session-instruction-voice`, `frame-overview-look`, `agent-launch-ad-hoc`, and
`agent-launch-boundary`; after the refactor, 11 passed over
`frame-launch-look`, `agent-launch-dialog-layout`, `frame-overview-look`, and
`frame-sessions-look`, and 58 passed over `agent-launch-codex-model` repeated
twice. `agent-launch-dialog-layout.spec.ts` keeps the long-title refinement
dialog's controls reachable at 320px and 200% zoom through
`expectEveryControlReachable` in `pageLayout.ts`, which also fails a clipping
part a reader cannot scroll; `frame-launch-look.spec.ts` checks dialog and
roster contrast and fit. Final screenshots at 1440px and 420px match the
accepted look; cards are unchanged.
Learnings: `.launch-dialog` now holds the dialog look and the project dialogs
inherit it. `expectNoSidewaysScrollAndWholeText` cannot run with a dialog open
because the dialog's `overflow: hidden` counts as not read whole; dialog specs
use `expectNoSidewaysScrollIn` and `expectEveryControlReachable`.
`narrowWindow` and `twiceZoomedWindow` sit beside `zoomedWindow` in
`accessibleReading.ts`. Under load average about 89,
`codexEffortDialogCases.ts:114` and `:166` failed once and then passed 87
times; this was not reproduced and stays an observation.
Proof: The launch dialog and roster rows of the proof table, plus final whole-frame screenshots at 1440px and 420px compared with the accepted slice-1 look.

Behavior: the developer opens Start session, Start execution, or Start
refinement, or the agent roster → dialog surfaces, fields, disclosures, and
footer buttons, and the roster's header and back control, use the frame style
→ their content, order, wording, and behavior are unchanged, and a long title
at narrow width and 200% zoom keeps every control reachable.

## Current decisions

- **Clean environment for local commands.** An agent session launched from the
  production dashboard inherits `NODE_ENV=production` and the preview script's
  `npm_*` variables. As a result `npm ci` / `npm install` silently skip every
  devDependency (all of this repository's dependencies are devDependencies),
  and `PATH` resolves tools from the deployed release. Run npm and Playwright
  without them, for example:
  `env -u NODE_ENV -u npm_config_local_prefix -u npm_package_json … npm ci`.
  Put `./node_modules/.bin` first on `PATH`. Add Lucide with
  `npm install --save-dev --save-exact lucide-react@1.51.0` under the same
  clean environment, and commit the lockfile change.
- **Local gates.** The pre-commit hook runs `npm run lint -- --staged`. Run
  `npm run typecheck:dashboard` and each slice's focused specs. Slice 1 changes
  the shared tokens that many specs check through computed contrast
  (`expectReadableContrast`), so run the full dashboard Playwright suite once
  at the end of slice 1, and once again at the end of slice 5. Hosted CI runs
  the rest after publication.
- **Accessible names and wording are fixed.** Visual changes may update tests
  that pin superseded styling, such as exact pixel sizes or transparency. They
  must not weaken a name, focus, contrast, reachability, or behavior assertion.
- **Tooltip.** Each icon-only frame control shows a styled tooltip with its
  accessible name, plus its shortcut where one exists ("Close (⌘⇧Esc)"), when
  hovered and when it holds keyboard focus. A native `title` alone is not
  enough because browsers show it only on hover. The tooltip text is
  `aria-hidden`, so the control's accessible name is not announced twice.
  Remove superseded `title` assertions only where the shared check replaces
  them.
