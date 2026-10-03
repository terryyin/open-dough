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

**Goal:** A developer can choose a named terminal theme in dashboard Settings
once and have that choice remembered and applied to every embedded xterm window.

**Scope:**

- Add a terminal theme selector to the existing Settings UI, with named presets
  and a default matching today's appearance.
- Persist the selected theme through the dashboard's settings mechanism so it
  survives page reloads and dashboard restarts.
- Apply the same selection to all embedded xterm windows, regardless of agent
  host or project. Update open terminals when the selection changes and use it
  when opening or reopening a terminal, without restarting its agent session.
- Use the same theme selection behavior in development and production.

**Key examples:**

- With no saved choice, terminals use the default theme.
- A developer chooses another preset in Settings: every open terminal adopts
  it, and a subsequently opened terminal uses it too.
- After reloading the page or restarting the dashboard, Settings still shows
  that preset and terminals use it.
- Choosing the default again persists that choice and restores its palette.

**Refinement questions:** Choose the preset catalogue and confirm the existing
settings persistence scope. Keep this one shared preference rather than adding
per-project or per-session overrides. Palette selection does not require CLI
applications to emit styling they do not already emit.
