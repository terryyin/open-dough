# Redo preparation and input decision

Prepared 2026-11-17; no paid native launch, trust change, awake guard or
participant message occurred. Slice 2 remains incomplete.

## Rebuilt input

- Workspace: `/Users/terryyin/open-dough-scratch/seed-393/tests-focus/redo`.
- Sole remote `origin`: `/Users/terryyin/open-dough-scratch/seed-393/tests-focus/origin.git` (local bare repository only).
- Branch: `claude/show-and-keep-the-effort-a-claude-code-launch-ru`.
- Frozen base: `c629d0d938528e5ef0923b9ef041abb19b4c0751`.
- Prepared guidance start: `f7e770957b7f4ff8589324fbe76532d3c92ddc0e`.
- Candidate guidance: slice 1 publication `c9b39e4b8300ec00a9cff1b95b659d44d8a22209`.
- `git diff --stat c629d0d93 f7e770957b7f4ff8589324fbe76532d3c92ddc0e`: exactly the two installed
  `.agents/skills/` and `.claude/skills/` refactor-checks files, total
  20 insertions, 16 deletions. Plan 664 is byte-unchanged from frozen base.
- Scratch `construction.json` and `guidance.patch` retain construction;
  the clone is clean. No current product or consumer-reach repair entered it.
- No memory files were copied to this new native project. Global/user context
  and A/B memory parity are not established; disclose that comparison limit.

## Recovered first message exposes a false premise

Native source: `/Users/terryyin/.claude/projects/-Users-terryyin-open-dough-scratch-seed-391-b/a46d7c72-ae04-4349-b60f-6f3f85545033.jsonl`,
first textual user UUID `df9ec00f-9705-4da3-890d-a2ff36ff0646` at
`2026-11-17T00:04:46.172Z`. Extraction retains exact text and native
slash-command markup, including the unexpected appended Python launcher.

Under `/Users/terryyin/open-dough-scratch/seed-393/tests-focus`:

| File | Meaning / SHA-256 |
| --- | --- |
| `frozen-first-user-message.txt` | Exact native text, `348afc0267efa00ec66bf101b50737890f297bc6204182d717ee77126f30924f` |
| `prompt.txt` | Sole full workspace-path substitution (one occurrence), `2afcaa95438a3e569ab50507b3124cc044ed7565b58fae3167870a3d4ec50e3d` |
| `task-only-prompt.txt` | Proposed removal of only appended launcher code, `5d61fc6e4f56f6d4a53f0c8639affcf2a042445c88a9661668fc40df3588ad64` |
| `proposed-prompt.diff` | Exact reviewable removal against `prompt.txt` |
| `slash-reconstructed-prompt.txt` | Unselected alternate CLI reconstruction, retained separately; not a launch input |

`prompt.txt` lines 22–40 retain Python whose line 24 sets the old
`seed-391` root and `workspace=root/'b'`; line 25 reads old
`b-claude-prompt.txt`; lines 33/38 overwrite `b-claude-launch.json`; line 34
runs another `claude --bg` command at that old workspace. Those old scratch
paths are currently absent, so direct execution fails at the first read;
recreating them would re-enable writes and another paid launch against frozen
B. The embedded code has no Git push; its `git ls-remote origin` inherits the
new process cwd if executed there. Exact input replay conflicts with keeping
frozen B unchanged and with a single paid native redo.

The smallest proposed amendment removes only that nested-launch block,
retaining task, `--skip-retro`, local-only stop, all established values and
native markup. It is **not selected** and needs human proof/evaluation
amendment plus the plan's paid-run authority. Raw native markup is preserved;
passing it literally versus regenerating it through a CLI slash command has
not been observed as equivalent. No wrapper normalization is silently selected.

## Launcher and next conditions

Prepared one-shot launcher (no default prompt selected):

```sh
~/open-dough-scratch/seed-393/tests-focus/run ~/open-dough-scratch/seed-393/tests-focus/task-only-prompt.txt
```

That is a proposed command, not authorized execution. The launcher accepts a
selected prompt path, refuses the nested old launcher, records its SHA,
command, cwd, version, AC/load, guard PID and launch start/return/exit in
`launch.json`, and makes no retry. It checks pinned clean HEAD, local-only
remote, CLI 2.1.326, AC, native trust and competing working Claude sessions.
It uses `caffeinate -s -i`; after any successful background launch the
coordinator owns official terminal observation, effective native model/effort
metadata, stop on battery and exact guard retirement. Model/effort are
requested as Opus/medium, not yet observed in a redo session. Native metadata
will be under `~/.claude/projects/-Users-terryyin-open-dough-scratch-seed-393-tests-focus-redo/`.

Native trust for the new workspace is absent. No trust setting was changed;
the interactive trust step remains Terry's. AC was present during setup.
Observed load was 16.91/14.58/11.32; `claude agents --json` showed working
sessions 8304861f, 613a3d98 and db6d2416, so the no-competing-paid-run condition
is not met and must be reconsidered at a later trigger. Existing sessions
were neither messaged nor stopped.

## Terminal proof and preservation

All commands ran from the owned execution checkout through the installed
slice clock, with scratch commands explicitly selecting the clone:

- `/tmp/seed393-slice2-setup.log` / `.exit`: `node scripts/setup-native.mjs npm`
  in the clone, locked independent install, exit 0; no copied/symlinked dependencies.
- `/tmp/seed393-slice2-readiness.log` / `.exit`: `node scripts/setup-native.mjs check`
  then `npm run --silent lint -- --staged`, exit 0; real Chromium prerequisite
  158.0.8127.18 and applicable project command succeed.
- `/tmp/seed393-slice2-construction-repaired.log` / `.exit`:
  `python3 /tmp/seed393-verify-redo.py`, exit 0; observes clean pinned clone,
  two-file guidance diff, unchanged plan 664, sole local remote, exact one-path
  replacement, proposed code-only removal and no launch receipt.
- The initial one-off verifier incorrectly required shared origin tracking
  refs to remain globally stable across concurrent executions; it failed when
  shared `origin/main` advanced 51bbe3c7→fc5bfc05. Its construction-interval
  before/after snapshots match. One corrected observation retained concurrent
  movement separately. Setup made no push or write to real origin; shared
  tracking refs may advance through other worktree fetches.

Only this research record changes the real worktree during preparation;
product/test/skill sources are unchanged. Scratch construction and exact inputs
remain recoverable above. No test source was authored. The actual redo,
terminal record, native settings and criteria assessment remain outstanding.
