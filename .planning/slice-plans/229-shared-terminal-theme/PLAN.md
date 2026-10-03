# Choose and persist a theme for all embedded terminals

**Identity:** SEED-090#shared-terminal-theme
**Source:** [refined story](../../seeds/SEED-090-dashboard-terminal-theme.md#shared-terminal-theme).
**Prepared:** 2026-10-03. Planning only, in the established preparation workspace. This instruction authorizes neither implementation nor publication.

## Goal and boundaries

A developer watching agent sessions chooses a named terminal theme once in
System settings. The dashboard remembers it on this machine and every embedded
xterm window uses it.

Included scope is the source story's scope: the four presets (Default, Light,
Solarized Dark, Solarized Light), a labelled keyboard-operable selector with a
sample, save on choose with an alert and Retry on failure, machine persistence
under `~/.open-dough/dashboard/`, live update of open terminals without
re-attaching, and the same behavior in development and production.

Material exclusions, from the story's deferred promises:

- Live update of terminals in other already-open browser windows.
- Custom or edited palettes, fonts, and per-project or per-session themes.
- Making command-line tools emit styling, and diagnosing the reported
  production/development styling difference.

## Direction and PFE

No North Star topic or Accepted ADR governs a terminal appearance setting, and
this story adds no consequential architectural choice. It follows existing
dashboard structure:

- **Reuse the machine-setting pattern.** The OpenAI setting
  (`dashboard/server/openAIConfigurationPlugin.ts` with
  `openAICredential.ts`) already gives a local-origin-checked read and POST
  boundary through `localBoundaryPlugin`, `verifyLocalOrigin` and `jsonBody`,
  and a file under `HOME` that dev and preview share, replaced atomically. The
  terminal theme gets its own small plugin and file in that shape:
  `~/.open-dough/dashboard/terminal-theme.json`. It is not a secret, so it
  gets no private credential folder or `0600` handling.
- **Change, not copy, the one terminal construction.** `new Terminal` exists
  only in `dashboard/src/useAttachedTerminal.ts`, which every host's page
  terminal (Claude Code, Codex, Cursor) goes through. The theme is given there.
- **Settings section beside the existing ones.** `SystemSettings.tsx`
  renders Projects and `OpenAISettings`. A `TerminalThemeSettings` section
  joins them. [Dashboard UX/UI North Star](../../../docs/dashboard-ux-ui-north-star.md)
  sections *Empty, loading, and error states* and *Visual and accessibility
  direction* apply to the selector, the alert and the sample.

## Decisive premises

| Premise | Consumed by | Observation | Result |
| --- | --- | --- | --- |
| Settings hides the dashboard but keeps it mounted, so an open terminal panel stays attached while the developer chooses a theme there. | Slice 2 | Read `dashboard/src/App.tsx` lines 90–132: `ConfiguredDashboard` (holding `TerminalSplit`) renders inside `<div hidden={settings}>`, and `SystemSettings` renders beside it when `settings` is true. | Confirmed. A choice made in Settings can reach the live terminal without reopening it. |
| xterm 6.0.0 applies `terminal.options.theme` to an open terminal without reopening it. The change shows in the computed background of `.xterm-scrollable-element` and the text colour of `.xterm-rows`. `.xterm-viewport` stays `#000` from `xterm.css`. | Slice 2 | Ran a throwaway headless-Chromium page with the installed `node_modules/@xterm/xterm/lib/xterm.mjs` and `css/xterm.css`. It opened a terminal, wrote `hello`, then set `options.theme = {background:'#002b36', foreground:'#839496'}`. | Confirmed. Before: scrollable element `rgb(0, 0, 0)`, rows `rgb(255, 255, 255)`. After: scrollable element `rgb(0, 43, 54)`, rows `rgb(131, 148, 150)`, text still `hello`; `.xterm-viewport` stayed `rgb(0, 0, 0)`. |
| The panel paints its own black behind the terminal. A light theme would leave a black edge unless that follows the theme. | Slice 2 | Read `dashboard/src/agent-terminal.css`: `.terminal-screen { … background: #000; }`. `TerminalPanel.tsx` line 197 renders that `div` as the xterm host. | Confirmed. Slice 2 makes `.terminal-screen` and the xterm viewport use the theme's background. |
| The terminal is created inside one attachment effect whose dependencies re-run it, closing the socket and making a new one. Adding the theme to those dependencies would re-attach on every theme change. | Slice 2 | Read `dashboard/src/useAttachedTerminal.ts`: `new Terminal({ cursorBlink: true })` and `new WebSocket(url)` are in the same `useEffect`, and its cleanup calls `socket.close()` and `terminal.dispose()`. | Confirmed. The theme is applied by a separate update to the live terminal, not by re-running the attachment. |
| `new Terminal` exists only in `useAttachedTerminal.ts` in the browser code, so one change covers every host and project. | Slice 2 | `grep -rln "new Terminal\|@xterm" dashboard/src dashboard/server` lists `src/TerminalPanel.tsx` (CSS import), `src/useAttachedTerminal.ts`, and server `agentTerminals.ts` / `keptClientScreen.ts`, which use `@xterm/headless` and render nothing for the page. | Confirmed. |
| A test can run real dev and preview servers on one machine directory whose `HOME` holds dashboard settings, restart them on that directory, and make a settings write fail by removing write permission. | Slice 1 | Read `dashboard/tests/support/openAISettingsMachine.ts` (`start("dev" \| "preview")` on a kept `machine` with `home`) and `tests/system-settings-openai-recovery.spec.ts` (`chmodSync(parent, 0o000)` makes Save fail, then restore and retry). | Confirmed. Slice 1's journey uses the same approach. |
| A page journey can open a session in the page's terminal with the synthetic `claude` and read its rows. | Slice 2 | Read `dashboard/tests/agent-launch-ad-hoc-terminal.spec.ts`: `dashboard.claudeScenario("launched")`, Start, then `panel.locator(".xterm-rows")` shows the echoed text. | Confirmed. Slice 2's journey starts there. |
| No terminal theme setting, endpoint or file exists today. | Slices 1 and 2 | `grep -rn "theme" dashboard/src dashboard/server` finds no terminal theme. `SystemSettings.tsx` has only Projects and OpenAI sections. | Confirmed. |

## Proof ownership

| Promise (story example) | Slice | Proof |
| --- | --- | --- |
| With no saved choice, Settings shows Default selected with its sample (1, Settings side) | 1 | Settings journey on a fresh machine |
| With no saved choice, terminals look as they do today (1, terminal side) | 2 | Terminal journey: before any choice, `.xterm-rows` text is `rgb(255, 255, 255)` on a `rgb(0, 0, 0)` scrollable element, as today |
| Choosing Solarized Dark changes the sample at once and saves it with no Save step (2, Settings side) | 1 | Settings journey: choose, see sample and selection change, then the file holds `solarized-dark` |
| The open terminal shows Solarized Dark on return, with its session and scrollback, and the next terminal opened uses it (2, terminal side) | 2 | Terminal journey: earlier echoed text still in `.xterm-rows`, new colours, no ended or disconnected state; close and open again shows Solarized Dark |
| After reloading or restarting the dashboard, Settings still shows the choice (3, Settings side) | 1 | Settings journey: reload, then restart the server on the same machine |
| After reloading, terminals use the saved choice (3, terminal side) | 2 | Terminal journey: reload the page, open the session again, see the saved colours |
| A failed save shows an alert with Retry, returns the selector and sample to the saved preset, and Retry saves it (4, Settings side) | 1 | Settings journey with the settings folder made unwritable |
| During a failed save, terminals keep the saved theme (4, terminal side) | 2 | The terminal follows only the saved theme. Proved by the terminal journey reading the same saved-theme state slice 1's failure leaves unchanged; see current decisions |
| Choosing Default again saves that choice and restores today's palette (5) | 1 and 2 | Slice 1: the file holds `default`. Slice 2: the terminal shows today's white on black again |
| Dev and production behave the same | 1 | Settings journey runs on dev and on preview, which share the machine file |
| Light shows no black edge around the terminal | 2 | Terminal journey: with Light, `.terminal-screen` and the scrollable element have Light's background |

## Slices

### 1. Choose a terminal theme in System settings and keep it on this machine
Type: Behavior
Status: planned
Proof: new `dashboard/tests/system-settings-terminal-theme.spec.ts` on the
`openAISettingsMachine`-style fixture (generalized or a sibling machine
fixture), plus focused unit proof for the endpoint's request checks.

Behavior: a developer opens System settings → Terminal theme on a machine with
no saved theme → sees Default selected and a sample in its palette. Choosing
Solarized Dark changes the sample at once and saves it to
`~/.open-dough/dashboard/terminal-theme.json`. Reload, a server restart, and
the other mode (dev or preview) on the same machine all show Solarized Dark.
With the folder made unwritable, choosing Light shows an alert with Retry and
the selector and sample return to Solarized Dark; after restoring permission,
Retry saves Light. Choosing Default saves `default`.

Includes:

- `dashboard/src/terminalThemes.ts`: the four presets by stable id and label,
  each an xterm `ITheme`. Default is `{}`, so xterm's own palette stays exactly
  today's. Light, Solarized Dark and Solarized Light give foreground,
  background, cursor, selection and all 16 ANSI colours, using the published
  Solarized values.
- A read and save endpoint in the OpenAI plugin's shape. Read answers the saved
  id, or `default` when there is no file. A save accepts only a known id. An
  unreadable file or unknown id answers a read problem, shown in the section
  with Retry, the same way OpenAI shows its read problem.
- The `TerminalThemeSettings` section with a labelled native choice and the
  sample (ordinary text plus the 16 ANSI colours in the selected palette).
- `dashboard/README.md` System settings paragraph names Terminal theme and
  where it is kept.

Local gates: the new spec on both modes, the endpoint unit proof,
`npm run typecheck:dashboard`, and `npm run lint`.

### 2. Every embedded terminal uses the saved theme
Type: Behavior
Status: planned
Proof: new `dashboard/tests/agent-terminal-theme.spec.ts` on
`dashboardTest.ts` with the synthetic `claude`.

Behavior: with a session open in the page's terminal and its echoed text
showing, in Default colours → the developer opens System settings, chooses
Solarized Dark and goes back → the same terminal shows Solarized Dark, the
earlier text is still there, and the panel shows no ended or disconnected
state. Closing and opening the session again, and reloading the page and
opening it, both show Solarized Dark. Choosing Light shows Light's background
on `.terminal-screen` as well, with no black edge. Choosing Default restores
today's white on black.

Includes:

- The page reads the saved theme once and shares it, and Settings updates that
  shared value only after a save succeeds.
- `useAttachedTerminal` creates the terminal with the current theme and sets
  `terminal.options.theme` on the live terminal when it changes, outside the
  attachment effect, so the socket is not reopened.
- `.terminal-screen` and `.xterm-viewport` take the theme's background (falling
  back to today's black for Default).
- `dashboard/AGENT-LAUNCH-TERMINALS.md` states that the terminal uses the theme
  chosen in System settings.

Local gates: the new spec, the existing `agent-terminal.spec.ts`,
`agent-terminal-reopen.spec.ts` and `agent-launch-ad-hoc-terminal.spec.ts`
(the attachment they cover changes), `npm run typecheck:dashboard`, and
`npm run lint`.

## Considered and excluded

- **Browser `localStorage`.** It would hold the choice per browser, not on this
  machine, and dev and production run on different origins. The story requires
  the dashboard's machine settings.
- **Putting the theme in the attachment effect's dependencies.** That reopens
  the socket on each change, against "without restarting its agent session".
- **Pushing changes to other open browser windows.** Deferred by the story.
- **A generic settings store for all machine settings.** One small setting does
  not justify it; the OpenAI pattern is reused by shape.

## Current decisions

- Preset ids are stable strings (`default`, `light`, `solarized-dark`,
  `solarized-light`); labels are what the developer sees.
- The terminal follows only the saved theme. A failed save never changes the
  shared value, so the terminal keeps the saved theme with no separate
  terminal-side failure path.
- A terminal opened before the first theme read finishes shows Default and
  switches when the read arrives. No hold or extra loading state.
- An unreadable or unknown saved theme is a read problem in Settings with
  Retry, and terminals use Default until a valid theme is read or saved.
