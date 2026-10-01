# Control the dashboard session panel from its header

**Identity:** SEED-071#session-panel-header-controls
**Source:** [refined story](../../seeds/SEED-071-session-panel-header-controls.md#session-panel-header-controls)
**Authority:** Executing (Story Branch Mode).
**Preparation:** Established workspace `/Users/terryyin/git/open-dough/.worktrees/control-the-dashboard-session-panel-from-its-hea`, branch `claude/control-the-dashboard-session-panel-from-its-hea`, remote `origin`, trunk `main`, agent `ruuf-chan`, published assignment `28c89671d28477453cbc0ff8c44f6804ddf44549`, integration checkout `/Users/terryyin/git/open-dough`.
**Execution:** agent `philip-chan`, Story Branch Mode on remote `origin`
branch `claude/control-the-dashboard-session-panel-from-its-hea` (trunk `main`),
claim `9ebc123ed78586c483513a62b2f20f3976026e7d`, starting revision
`f932ba9b95d5ca55347dcf122c999f631d904e9a`, workspace setup `npm ci` plus
`npm run typecheck:dashboard` passed.

## Goal and scope

The terminal panel's header (`dashboard/src/TerminalPanel.tsx`) gains
icon controls on the right for Maximize/Restore and Close, ⌘⇧Esc for Close, and
the session's recorded agent avatar on the left, spanning the title and
session-ID rows. The running session, its content, Close's detach-only
meaning, and Mark as done stay as they are.

Included, per the story: maximized gives the panel the page column's room, keeps
an open Sessions sidebar beside it, and lasts until Close (opening another
session stays maximized; the next open after Close, and any reload, start in the
split). Restore returns to the wide left/right split or the narrow stacked
layout. ⌘⇧Esc works from the terminal, leaves an open dialog's keys alone, does
nothing with no panel, and plain Escape reaches the terminal. The avatar is
named by accessible label and tooltip; without a recorded agent or an available
portrait there is no image and no placeholder. No developer identity appears.

Excluded: remembering maximized across Close or reload, resizable split widths,
a visible agent-name row, any change to the Sessions sidebar, banner, cards,
navigation, or Mark as done semantics.

## Current decisions

- **Mark as done stays a labeled text button**, separate from the icon
  controls, so the one finishing action is never an icon beside Close. It
  remains offered only where `marksDone(host)` offers it today.
- **Maximized is panel-frame state in `TerminalSplit`**, beside the open
  session it already holds: it survives replacing the session and is cleared
  where `closeTerminal` and the delete path set the terminal to `undefined`.
  Mark as done closes through `closeTerminal`, so it also ends maximized. No
  storage.
- **Close's shortcut is ⌘⇧Esc** (Terry, 2026-10-01), because slice 1 showed
  Chrome and Safari never deliver ⌘Esc to the page.
- **⌘⇧Esc follows the ⌘B pattern** (`SessionSidebar.tsx`): a capture-phase
  `window` keydown listener with the exact-modifier check and
  `isInsideOpenDialog` (`pageShortcuts.ts`), which runs before xterm consumes
  the key. Plain Escape is never handled.
- **The avatar reuses `AgentPortrait`** with the name from
  `agentNameOf(record.start?.agent ?? record.preparation?.agent)`
  (`product-backlog-agent-profile.mjs`); `AgentPortrait` already renders
  nothing for an unknown name or a missing local nerd cartoon. The header
  wraps it in an element carrying the agent (e.g. `Ruuf-chan`) as its
  accessible name and `title`, sized to the two text rows; with no portrait
  shown, that wrapper is absent.
- **Icons follow the Refresh precedent** (`SourceStatus.tsx`): inline
  `<svg aria-hidden="true" focusable="false">` in a button whose accessible
  name and `title` give the action. Close keeps the accessible name `Close`, so
  existing journeys that find it by role and name are unchanged.
- **Documentation:** the terminal-panel text in
  `docs/dashboard-ux-ui-north-star.md` (Launch actions row) and the shortcut
  text in `docs/dashboard-navigation.md` are updated in the slice that changes
  the described behavior.

## Decisive premises

| Premise | Consumed by | Observation | Result |
| --- | --- | --- | --- |
| Close already detaches only, keeps the session running, and returns the keyboard to the opener | Slices 2, 3 | `npx playwright test --config dashboard/playwright.config.ts dashboard/tests/agent-terminal.spec.ts` | Passed (2026-10-01) |
| A capture-phase window listener receives a ⌘-shortcut from inside the xterm terminal before xterm, while Ctrl+key still reaches the session | Slice 3 | `npx playwright test --config dashboard/playwright.config.ts dashboard/tests/session-sidebar-keyboard.spec.ts` (⌘B from the terminal) | Passed, 2 tests (2026-10-01) |
| The banner is inside the page column, so taking the page column's room hides it, while the sidebar is a separate grid column | Slice 2 | Read `App.tsx` (banner is a `TerminalSplit` child), `TerminalSplit.tsx` (`page-column`), `session-sidebar.css` (`.page-with-sidebar.page-split` three columns) | Confirmed |
| The narrow layout is the `max-width: 800px` media rule stacking the panel above the page at 70dvh | Slice 2 | Read `agent-terminal.css` | Confirmed |
| A session record carries its agent only through optional `start.agent` or `preparation.agent`, spelled `<Name>-chan`; ad-hoc records have neither | Slice 4 | Read `launchRecord.ts` schemas and `agent-launch-preparation-start.spec.ts` (record `preparation.agent`) | Confirmed |
| `AgentPortrait` takes the rotation name and renders nothing for an unknown name or a missing nerd cartoon | Slice 4 | Read `AgentPortrait.tsx`; `public/agent-avatars/odd-e-nerds` is absent in this workspace | Confirmed |
| A page journey can give a launched, listed session a recorded agent by rewriting `~/.open-dough/dashboard/agent-launches.json` under `dashboard.home`, since the server reads that store on every request | Slice 4 | Throwaway spec (deleted) on the `agent-terminal.spec.ts` journey: launch, wait for the store file, add `preparation.agent: "Yui-chan"` to the session record, `recordsOf` and reload | Passed (2026-10-01): the record answers with the agent and `available` state, and the card still offers Open terminal. The store does not exist when `launch()` returns, so the journey must poll for it before rewriting |
| macOS has no symbolic hotkey bound to Escape on this machine | Slice 1 | `defaults read com.apple.symbolichotkeys AppleSymbolicHotKeys` filtered for key code 53 | No binding |
| Real browsers deliver ⌘Esc to the page while a text field has focus | Slice 3 | Slice 1 probe | **Refuted (2026-10-01):** Chrome and Safari withhold ⌘Esc; see slice 1 |

## Ordered slices

### 1. ⌘Esc reaches the page in the developer's real browsers
Type: Behavior (probe)
Status: done — ⌘Esc is withheld; Terry chose ⌘⇧Esc for slice 3
Proof: recorded OS-level observation per browser (below), taken by the
executing agent instead of Terry because System Events keystrokes pass through
the same OS and browser path as a physical key press.

Behavior: a scratch HTML page outside the repository (in the job's temp
directory) with a focused `<textarea>` and a capture-phase `window` keydown
logger → Terry presses ⌘Esc and plain Escape in each browser he uses for the
dashboard (at least Chrome; Safari if used) → the log shows `Escape` with
`metaKey: true`, and nothing else (no Force Quit or browser action) happens.
Record each browser and result here. If any browser withholds ⌘Esc, stop
slice 3 and return the shortcut choice to Terry; slices 2 and 4 continue.

Result (2026-10-01, macOS 26 on this machine): a local page
(`http://127.0.0.1` scratch server, focused `<textarea>`, capture-phase
`window` keydown logger) received real keystrokes sent with
`osascript … tell application "System Events" to key code 53 using …`.
In both Google Chrome and Safari, ⌘Esc produced **no** keydown, while in the
same runs ⌘B, ⌘., ⌘⇧Esc (`Escape`, `metaKey` and `shiftKey`), ⌥Esc, ⌃Esc,
⇧Esc and plain Escape all reached the page. Nothing else visible happened on
⌘Esc. ⌘⌥Esc (Force Quit) was not tried.

### 2. Maximize and restore the panel from icon controls
Type: Behavior
Status: done
Proof: new `dashboard/tests/agent-terminal-maximize.spec.ts` on the
`agent-terminal.spec.ts` journey; `agent-terminal.spec.ts`,
`agent-terminal-done.spec.ts`, and `session-sidebar-navigation.spec.ts` stay
green.

Behavior: a session open in the wide split → Maximize (icon button named and
titled `Maximize`) → the panel spans the page column's room, the banner and
stories are not visible, the same terminal rows remain, and the control reads
`Restore`; with the Sessions sidebar open it stays beside the panel, and
opening another sidebar entry shows that session still maximized; Restore
returns the left/right split. Close (icon button named `Close`) hides the panel
and the session stays running; reopening shows the split. On an 800px-or-less
window, Maximize fills the window and Restore stacks the panel above the page.
Mark as done remains its text button. Update the North Star terminal-panel text.

Accepted proof (2026-10-01): `npx playwright test --config
dashboard/playwright.config.ts dashboard/tests/agent-terminal-maximize.spec.ts
dashboard/tests/agent-terminal.spec.ts dashboard/tests/agent-terminal-done.spec.ts
dashboard/tests/session-sidebar-navigation.spec.ts` (7 passed) and
`dashboard/tests/agent-terminal-delete.spec.ts` (1 passed, delete path), plus
typecheck and lint, after the refactor. `pageTerminal.ts` (`usePageTerminal`)
now owns the open session and maximized state, so `close()` always ends
maximized. Maximized keeps the page column laid out but unseen behind the
panel (`visibility: hidden`), so Restore shows the page at its scroll position.

### 3. ⌘⇧Esc closes the panel
Type: Behavior
Status: planned
Proof: new cases in `agent-terminal-maximize.spec.ts` (or a sibling
`agent-terminal-keyboard.spec.ts`), mirroring `session-sidebar-keyboard.spec.ts`;
slice 1's recorded browser results (⌘⇧Esc delivered in Chrome and Safari)
for real delivery.

Behavior: maximized with the keyboard in the terminal → `Meta+Shift+Escape` → the
panel hides, the session keeps running (attach detached, record still
available, not marked done), and the keyboard returns to the opener; reopening
shows the split. Plain `Escape` in the terminal reaches the session (the fake
records it) and the panel stays. With the launch dialog open, `Meta+Shift+Escape`
leaves the panel shown. With no panel, `Meta+Shift+Escape` changes nothing. Close's
tooltip reads `Close (⌘⇧Esc)` while its accessible name stays `Close`. Update
`docs/dashboard-navigation.md` and the North Star text.

### 4. The header shows the session's agent avatar
Type: Behavior
Status: planned
Proof: new `dashboard/tests/agent-terminal-avatar.spec.ts` using
`tests/agentPortrait.ts` helpers where they fit; `nerds-cartoon-portrait.spec.ts`
and `agent-roster-avatar.spec.ts` stay green.

Behavior: a launched session whose kept record gains `preparation.agent:
"Yui-chan"` → opening its terminal → the header shows Yui's atlas tile left of
the title and session-ID rows, as tall as both rows together, with accessible
name and tooltip `Yui-chan`, and no developer name or GitHub avatar in the
panel. A session with `start.agent` naming a nerd whose cartoon the test serves
shows that cartoon; one whose cartoon is not served, or an ad-hoc session with
no agent, shows no avatar element and the title and ID rows unchanged. Update
the North Star text.

## Proof ownership

| Promise (story) | Slice | Observation |
| --- | --- | --- |
| Maximize to page column's room, content retained; Restore to split | 2 | Panel box vs window and page column; same `.xterm-rows` text |
| Sidebar stays beside maximized panel; switching keeps maximized | 2 | Sidebar visible left of panel; second session's header while maximized |
| Maximized lasts until Close; next open in split | 2, 3 | Reopen after Close (button and ⌘⇧Esc) shows split |
| Narrow window maximize/restore | 2 | 800px viewport boxes |
| Close hides, session runs, keyboard to opener, not Mark as done | 2, 3 | Record still available, not `doneAt`; attach ended; focus |
| ⌘⇧Esc from terminal; dialog untouched; no panel no-op | 3 | Keyboard cases |
| Plain Escape reaches terminal app | 3 | Fake `claude` line record |
| ⌘⇧Esc delivered by real browsers | 1 | Recorded per-browser OS keystroke probe |
| Agent avatar spanning both rows, named by label and tooltip | 4 | Portrait tile, box heights, accessible name, `title` |
| No avatar without agent or portrait; no developer identity | 4 | Absent element; no attribution text in panel |
| Each right-hand action identifiable; Close tooltip includes ⌘⇧Esc | 2, 3 | Role/name and `title` |
| Mark as done unchanged | 2 | `agent-terminal-done.spec.ts` green |

## Verification

At each slice boundary run the slice's new spec and the named existing specs
with `npx playwright test --config dashboard/playwright.config.ts <spec…>`, plus
`npm run typecheck:dashboard` and `npm run lint`, which every dashboard change
can break. Hosted CI runs the full suite after publication.

## Learnings

- Playwright `locator.click()` on a control in the sticky panel scrolls the
  window first, which a real click does not; box-comparing specs click the
  header controls with `page.mouse.click` at the control's centre.
- CI repair during slice 3 (run 36841120811 on `4699ad18`, dashboard 1/4):
  `agent-launch-ad-hoc-codex.spec.ts` checked `kill(pid, 0)` immediately
  after the fake codex recorded SIGHUP, but the fake records before exiting
  and macOS keeps unreaped pids answering. All five specs now use
  `expectCodexHungUp` (`tests/support/codexTerminal.ts`), which polls both;
  the five codex specs passed (17 tests).
