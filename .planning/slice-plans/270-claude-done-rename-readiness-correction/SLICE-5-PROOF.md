# Accepted execution proof: slice 5

Part of [plan 270](PLAN.md). The coordinator inspected the private wait,
Done signal, fake pre-prompt discard, and concrete test setup/assertions.
Setup supplies a running idle session and delayed composer, never a done-name.

## Automated proof

- RED on unchanged production: `env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts agent-launch-done-rename-wait.spec.ts --grep 'waits for the private composer' --workers=1 --reporter=line`: one selected case failed with the expected native-confirmation cause. Early keys were discarded.
- Initial green prompt/close/predicate selection: nine passed (16.4 s).
- Required Done and 15 fake-text consumers: `env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts agent-launch-done-stop.spec.ts agent-launch-done-rename-wait.spec.ts agent-launch-done-close.spec.ts agent-terminal-done-reopen.spec.ts session-workspace-retirement-claude.spec.ts agent-completion-quiet-claude.spec.ts agent-completion-binding.spec.ts agent-completion-quiet.spec.ts agent-completion-cursor.spec.ts agent-launch-card-done.spec.ts agent-launch-done-question.spec.ts agent-launch-done-codex-races.spec.ts agent-launch-done.spec.ts session-unread-report.spec.ts claude-prompt.spec.ts agent-terminal.spec.ts agent-terminal-reopen.spec.ts agent-terminal-maximize.spec.ts agent-terminal-boundary.spec.ts agent-launch-ad-hoc-sessions.spec.ts session-sidebar-keyboard.spec.ts frame-sessions-look.spec.ts agent-launch-ad-hoc-terminal.spec.ts agent-terminal-lifetime.spec.ts story-panel-switching.spec.ts session-sidebar-navigation.spec.ts agent-terminal-done-question.spec.ts agent-terminal-keyboard.spec.ts agent-terminal-avatar.spec.ts side-panel-width.spec.ts --workers=2 --reporter=line`: 105 passed (2.5 m).
- Whole dashboard: `env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- --workers=4`, exit 0 (~14 m 50 s). Quiet reporter and `.last-run.json` report passed with no failed tests. Matching `--list --reporter=line` selected 1,207 tests in 347 files; this is a selection count, not an individual passed count.
- Independent refactor moved the waiter into the existing screen/lifetime owner `DetachedIdleWatch`; `LiveTerminalClient` delegates. No second screen, parser, PTY, or registry was added. Abort, exit and disposal settle false and remove listeners. Predicate type reuse changes no page admission policy.
- Fake controls extracted with stable exports; prompt scenarios moved intact to `agent-launch-done-prompt.spec.ts`. Fresh proof: `env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts claude-prompt.spec.ts agent-launch-done-prompt.spec.ts agent-launch-done-rename-wait.spec.ts agent-launch-done-close.spec.ts agent-completion-quiet-claude.spec.ts agent-terminal-boundary.spec.ts agent-terminal-reopen.spec.ts agent-terminal-done-reopen.spec.ts agent-terminal-close.spec.ts agent-terminal-lifetime.spec.ts agent-launch-ad-hoc-cursor.spec.ts agent-completion-recovery.spec.ts --workers=2 --reporter=line`: 55 passed (42.4 s).
- Held-screen/Cursor consumers: `env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts agent-terminal-cursor-runner.spec.ts agent-terminal-cursor-idle.spec.ts --workers=1 --reporter=line`: 16 passed (21.2 s).
- Formatting found untyped parsed responses and a non-null assertion in the extracted prompt spec. Mechanical type/guard repairs preserve observations. `env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts agent-launch-done-prompt.spec.ts --workers=1 --reporter=line`: four passed (8.7 s).
- `env -u NODE_ENV npm run typecheck:dashboard`, repaired `npm run format`, and `git diff --check` passed. Commit hook owns staged lint.

Success observes exact input and native listing, retaining the original stored
session name. Deadline, client exit and server close observe no typed lines,
cleanup, and the attachment cause. Quiet completion observes pending before
the prompt, then `Named`; reporting does not stop. Busy-turn and first manual
recovery proof remain green. Unit renderer proof rejects banners/transcript
prompts and hidden cursors, accepting bordered drafts without a completed frame.

## Native dashboard acceptance (2026-10-07)

Claude Code 2.1.292, dedicated session
`272f4bf5-2a79-4033-bed9-ab615e3936e9`, short ID `272f4bf5`, created by:

```sh
claude --bg --name 'Open Dough · Dashboard rename readiness probe' 'Reply only READY. Do not use tools or modify any files. This is the SEED-116 slice 5 dashboard readiness probe.'
```

Its native listing was idle/done before binding an ad hoc dashboard launch
record through the production locked binding operation. That record supplied
no done mark, problem, completion outcome or reporting receipt. The owned
candidate preview served on `127.0.0.1:54327`; Chrome drove the page.
The session remained idle but changed to blocked, so the page showed Needs
input and its ordinary confirmation question. The agent clicked Mark as done
and confirmed it. No page terminal was opened (DOM count zero).

Recently done showed `Done` and
`Named done-Open Dough · Dashboard rename readiness probe`; no failure text.
The production record retained its original session name, acquired `doneAt`
`2026-10-07T07:42:21.772Z`, and contained no `doneProblem`. The independent
native listing confirmed that exact done-name for the same ID and state
`stopped`. This is the corrected dashboard's private rename, separate from
slice 1's direct native probe and from fake proof.

Only the owned probe record was deleted after acceptance; its native process
was already stopped. The owned preview and Chrome tab were closed. Passing
native snapshots/harness were deleted after judgment under Accepted ADR 0005;
compact accepted facts remain here. No native transcript/storage was edited.
