---
id: SEED-090
status: active
planted: 2026-10-03
planted_during: Terry's request for a persisted terminal theme setting
trigger_when: A developer wants to choose one colour theme for every embedded dashboard terminal
scope: unestimated
---

# SEED-090: A shared terminal theme setting

## Why This Matters

A developer watching agent sessions wants readable, consistent terminal colours.
The dashboard currently constructs xterm terminals with their default appearance
and offers no theme selection. Terry requested this story as the highest-priority
queued item after noticing less styling in the production terminal.

xterm.js exposes a configurable colour palette through its
[theme option](https://xtermjs.org/docs/api/terminal/interfaces/iterminaloptions/)
and [ITheme](https://xtermjs.org/docs/api/terminal/interfaces/itheme/).
Named presets can be supplied by the dashboard; the preset catalogue remains
to be chosen during refinement. This request does not establish the cause of
the perceived production/development difference.

## Story

<a id="shared-terminal-theme"></a>

### Choose and persist a theme for all embedded terminals

**Identity:** SEED-090#shared-terminal-theme
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/229-shared-terminal-theme/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"8475e332e746a951c50bdcbaab402f18cb7626605f2d6425dfe9d80286360244","plan":"68dbabc766d740aa32f393e9ee0f574acb9dc7842544350e1facdaf336a08adb"}}
```

**Goal:** A developer watching agent sessions can choose a named terminal theme
in dashboard System settings once and have that choice remembered and applied to
every embedded xterm window, so agent output reads consistently in the palette
they find readable.

**Scope:**

- Add a Terminal theme section to System settings with four named presets:
  **Default** (today's appearance, xterm's white-on-black default), **Light**
  (dark text on a light background matching the dashboard), **Solarized Dark**,
  and **Solarized Light**. Each preset defines readable foreground, background,
  cursor, selection, and ANSI colours.
- The selector is a labelled, keyboard-operable choice that shows the saved
  preset. Beside it, a small sample in the selected palette shows ordinary text
  and the ANSI colours, because Settings hides the dashboard and its terminal
  panel while the developer chooses.
- Choosing a preset saves it immediately; there is no separate Save step. If
  saving fails, Settings shows an alert with Retry and keeps showing the last
  saved preset, and terminals keep the saved theme.
- Persist the selection with the dashboard's other machine settings under
  `~/.open-dough/dashboard/`, so it survives page reloads and dashboard
  restarts and is one preference for this dashboard on this machine.
- Apply the same selection to all embedded xterm windows, regardless of agent
  host or project. Terminals open in the page update when the selection
  changes, and a terminal opened or reopened afterwards uses it, without
  restarting its agent session.
- Use the same theme selection behavior in development and production.

**Deferred promises:**

- Live update of terminals in other already-open browser windows; they use the
  saved theme after reload or when opening a terminal.
- Custom or edited palettes, font settings, and per-project or per-session
  overrides.
- Making CLI applications emit styling they do not already emit, and
  diagnosing the perceived production/development styling difference.

**Key examples:**

- With no saved choice, Settings shows Default selected with its sample, and
  terminals look as they do today.
- A developer with an agent terminal open opens System settings and chooses
  Solarized Dark: the sample changes immediately; returning to the dashboard,
  the open terminal shows Solarized Dark with its session and scrollback
  intact, and a terminal opened next also uses it.
- After reloading the page or restarting the dashboard, Settings still shows
  Solarized Dark and terminals use it.
- The settings write fails when the developer chooses Light: an alert with
  Retry appears, the selector and sample return to Solarized Dark, and
  terminals stay Solarized Dark until a retry succeeds.
- Choosing Default again persists that choice and restores today's palette.
