# Embedded Codex lifecycle proof

Supporting accepted execution evidence for [plan 192](PLAN.md). Slice 8 still
owns complete native dashboard acceptance and active launch-connection joining.

## Slice 4 — embedded native terminal

Ordinary resume uses the saved endpoint/workspace/thread ID, never a fresh native
conversation or another first instruction. The existing terminal owner carries
input, output and resize; socket/server closure SIGHUPs the CLI client only.
Claude retains immediate attachment semantics. Codex startup stays interactive
but does not reopen a done record until successful native readiness; failed
startup preserves the mark. Ready exit and failed attachment remain distinct.

Coordinator inspected the host attachment contract, Codex private attach,
TerminalAttachments, AgentTerminals, useAttachedTerminal, capability owner,
TerminalPanel and changed fixture/current callers. Browser xterm observes complete
synchronized frames and cursor state, then sends its current native viewport.
The host recognizes a visible composer cursor without startup/disabled state.
No title, cumulative output, empty-draft or footer inference remains.

Actual store/HTTP/dev-preview WS/PTY assertions in agent-terminal-codex.spec.ts
observe exact arguments/canonical workspace, keyboard, resize, host-qualified
equal IDs, failure/exit cleanup, SIGHUP/absent PID and no replay/fork/interrupt.
agent-terminal-codex-page.spec.ts observes interactive hook review preserving
done; incomplete native repaint preserving done; a configured custom footer
without context percentage and nonempty draft reopening; card refresh, close,
reload, project switch, server restart, reconnect and CLI exit/reopen.
agent-terminal-codex-close.spec.ts invokes closeServer alone and observes WS/PTY
closure while HTTP stays alive. Native CLI/RPC are substitutes here; production
code performs all transport, record, browser and cleanup effects.

Independent refactor extracted server per-attachment lifetime and browser
attachment hook. Ordered registry, native readiness/protocol and observing
assertions stayed unchanged. Replaced proof after moving implementation:

```sh
env -u FORCE_COLOR -u NO_COLOR npx --no-install playwright test --config dashboard/playwright.config.ts dashboard/tests/agent-terminal-codex.spec.ts dashboard/tests/agent-terminal-codex-page.spec.ts dashboard/tests/agent-terminal-codex-close.spec.ts dashboard/tests/agent-launch-codex.spec.ts dashboard/tests/agent-terminal-boundary.spec.ts dashboard/tests/agent-terminal-reopen.spec.ts dashboard/tests/agent-terminal-done-reopen.spec.ts dashboard/tests/agent-terminal-lifetime.spec.ts dashboard/tests/agent-terminal-close.spec.ts dashboard/tests/agent-terminal.spec.ts dashboard/tests/session-sidebar.spec.ts dashboard/tests/session-sidebar-navigation-cases.spec.ts > /tmp/dough192-refactor-terminal-proof.log 2>&1
npm run typecheck:dashboard
git diff --check
```

All terminal exit 0. Existing selected consumers preserve Claude reopen/done,
cleanup/lifetime and shared session switching, focus, wide/narrow layout/sidebar
navigation. macOS canonical workspace assertions use realpathSync for /private/var.

Formatter found unnecessary optional/fallback access after host admission and
an unused Array.from callback argument. Equivalent repairs and a stale startup
comment correction invalidate no native/Claude outcomes. Affected proof passed:

```sh
env -u FORCE_COLOR -u NO_COLOR npx --no-install playwright test --config dashboard/playwright.config.ts dashboard/tests/agent-terminal-codex.spec.ts dashboard/tests/agent-terminal-codex-page.spec.ts dashboard/tests/agent-terminal-codex-close.spec.ts > /tmp/dough-192-terminal-mechanical-proof.log 2>&1
npm run typecheck:dashboard
```

Both terminal exit 0; final npm run format passed. Changed files remain <=250
lines. No readiness renewal. Slice 5 owns Codex done/stop behavior.

## Bounded native readiness follow-up, 2026-10-01

Fixture .native192-attach-a4wMwe used the real v0.3.51 release through install.sh,
with its installed hook review preserved. CLI/daemon both reported 0.159.3 on the
existing shared Unix endpoint; configured gpt-6.1-sol/never/YOLO were unchanged.
No model turn, policy override, native trust choice or daemon restart occurred.
Review hooks then Esc inspected the installed hook, leaving Active 0/Review 1.

Native raw output disproved title/placeholder readiness: provisional frames
already contain OpenAI Codex, Resuming session and the empty composer placeholder.
Hook modal/review hides the cursor. After acknowledged resume and closing the
review view, the configured composer has visible cursor, no startup message and
a model/workspace footer rather than context-left text. Raw output has balanced
DEC synchronized drawing frames (?2026h/l), and configured cursor visibility
(?25h). The actual raw/source observations support the page frame/cursor gate.

Version-matched primary sources inspected:

- [Startup draft](https://github.com/openai/codex/blob/rust-v0.159.3/codex-rs/tui/src/startup_draft_layout.rs#L83): provisional resume message.
- [Resume ordering](https://github.com/openai/codex/blob/rust-v0.159.3/codex-rs/tui/src/app/startup.rs#L462): acknowledged native resume precedes ChatWidget construction; read-only fallback is disabled.
- [Composer cursor](https://github.com/openai/codex/blob/rust-v0.159.3/codex-rs/tui/src/bottom_pane/chat_composer/composer_layout.rs#L140) and [disabled writer](https://github.com/openai/codex/blob/rust-v0.159.3/codex-rs/tui/src/chatwidget.rs#L1778): direct input/cursor gating.
- [Cursor emission](https://github.com/openai/codex/blob/rust-v0.159.3/codex-rs/tui/src/custom_terminal.rs#L450) and [synchronized drawing](https://github.com/openai/codex/blob/rust-v0.159.3/codex-rs/tui/src/tui.rs#L1265): native frame and cursor signals.

## Blank materialization learning for slice 7

Two fresh metadata-only blank creations returned idle, ephemeral:false and the
saved workspace. Their ordinary CLI resumes failed before configuration with
missing saved session/rollout, and subsequent reads confirmed absence. IDs:
01a0f585-f76b-7b42-a11d-d6ba74da209b and
01a0f589-4ddf-7353-9064-9dd57b6fca7d. Readable loaded metadata alone does not
establish durable blank history. The first harness's closed stdin was corrected;
only its owned CLI was detached, and no input had been submitted.

A third fresh creation issued thread/read(includeTurns:true) before creator
closure, matching slice 1's successful probe sequence. It initially returned
-32601 list_turns unsupported, but the native operation materialized persistence.
[Matched thread processor](https://github.com/openai/codex/blob/rust-v0.159.3/codex-rs/app-server/src/request_processors/thread_processor.rs#L3048)
calls persist_thread before paginated history loading. Ordinary CLI resume then
succeeded on the same ID 01a0f58b-a6b7-7b23-b78c-4720bab64016. After all CLI clients
closed, fresh native reads retained that same ID/workspace with zero turns.

Slice 7 must use supported native blank materialization before losing the creator,
preserve honest first-input evidence and prove restart/reconnect without a new
thread or artificial model turn. This clarifies slice 1's existing successful
precondition, rather than accepting metadata-only creation as persistence.
All four owned CLI PIDs (27917,8251,36137,18968) were absent and driver commands
had terminal outcomes. Native histories stay vendor-owned; judged disposable
fixture and root research files were removed. Structured native waiting under
never and active launch-connection ownership remain slice 8 requirements.
