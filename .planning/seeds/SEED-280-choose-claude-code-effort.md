---
id: SEED-280
status: active
planted: 2026-11-09
scope: story
---

# Choose Claude Code effort when starting a session

<a id="choose-claude-code-effort"></a>

### Choose Claude Code effort when starting a session

**Identity:** SEED-280#choose-claude-code-effort
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/545-choose-claude-code-effort/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"ba70d1fcf480f3ebeaec235788468ae187136dcae7869b47ceece373cb181683","plan":"f6d972e5be4b56b3cd3339ee2af7a2faef4d2055fea92212fde4f2b585f2ee2e"}}
```

**Goal.** A developer starting a Claude Code session from the dashboard can
choose its reasoning effort for the work at hand, so an unattended story
workflow or project session runs its first turn at the intended depth instead
of only at the developer's configured Claude Code effort.

**Scope.**

- The Reasoning effort field, already shown for Codex and Cursor, also appears
  for Claude Code in the Start session, follow-up, and story workflow start
  dialogs. Its default choice uses the developer's Claude Code setting; the
  other choices are the levels Claude Code's `--effort` accepts: low, medium,
  high, xhigh, and max.
- The choices are independent of the selected Model, like Codex's. Claude
  Code itself drops effort for a model that does not support it, so the
  dashboard adds no per-model filtering.
- An explicit choice starts the session with that effort for this session
  only. It writes no Claude Code configuration, and the developer can still
  change effort inside the session with `/effort`. The default sends no
  effort.
- Launch admission accepts a Claude Code effort only from those levels and
  keeps refusing any other value. Switching host or reopening a dialog clears
  the choice, as it does today.
- A retried or continued Claude Code launch starts with the effort its
  recorded request carries, as it does with the model. Attaching to a running
  session does not resend it.
- Scope limits: the feedback maintenance setting keeps its current
  Codex-only effort; Codex and Cursor effort behavior is unchanged; the
  dashboard does not report the session's effective effort, because Claude
  Code's session listing does not expose it.

**Key examples.**

- Claude Code, Opus, and high are selected in a story workflow's start
  dialog → Start → the session starts with `--effort high` and shows high
  effort when the developer opens its terminal.
- Claude Code with "Use your Claude Code setting" selected in Start session →
  Start → no effort is passed and Claude Code uses its configured effort.
- A follow-up dialog for a Claude Code session, with max selected → Start →
  the follow-up session starts at max effort; the original session is
  unchanged.
- Low is selected for Claude Code, then the host is switched to Codex → the
  effort returns to "Use Codex setting".
- A launch request that names Claude Code with effort `extreme` → refused
  before Claude Code runs, naming the supported levels.

**Investigation.** Observed on Claude Code 2.1.319 (2026-11-09): `claude
--help` lists `--effort <level>` with low, medium, high, xhigh, and max. A
blank `claude --bg --effort low` session (no prompt, then stopped and
removed) showed "Opus 5.5 with low effort" in its screen, so the flag reaches
background sessions. `claude agents --json --all` lists no effort field. The
statement that Claude Code drops effort for a model that rejects it comes
from Claude Code's own bundled text, not from a run.

**Alternatives considered.** Writing `effortLevel` into Claude Code settings
would change the developer's configuration beyond this session; relying on
`/effort` after attaching misses the first turn of an unattended workflow.
Like a camera's per-shot exposure override over its saved program, the
choice applies to one session and leaves the saved default alone; unlike a
camera, the dashboard cannot read back the effective setting.
