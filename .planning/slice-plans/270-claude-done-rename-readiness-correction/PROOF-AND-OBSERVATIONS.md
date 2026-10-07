# Proof and observations

Part of [plan 270](PLAN.md); execution identity and ordered slices stay there.

## Decisive premises and observations

The inherited observations below ran at `bcb39b01`; O2 covered only the
previous raw-HTTP case. Current preparation observations at `fc2fbdc6` follow
the table and supply the missing page journey. No implementation slice is done.

| Premise | Consumed by | Observation and result |
| --- | --- | --- |
| The private client types after its first output settles, with no prompt check. | Slice 5's remedy. | Reading `liveTerminalClient.ts:60,130`, `terminalAttachments.ts:162-185`, `keptClientScreen.ts:107`, `detachedIdleWatch.ts` `text()`, `rename.ts:57-67`. Confirmed. |
| Claude's `attach` declares no readiness, and a private client ignores any. | Slice 5's seam choice. | Reading `claudeHost.ts:32-34` (`{ pty }` only) and `nativeAttach.ts:41-47` (`readiness: undefined` when private). Confirmed. |
| Declaring `ready` on Claude's attach would change the page terminal. | Current decision "not `TerminalAttachment.ready`". | Reading `joinedSockets.ts:76-86` (unadmitted socket gets `observe`), `:94-103`, `:115-127` (admission runs `reopen`). Confirmed. |
| No recorded Claude Code prompt text exists in this repository. | Slice 1 exists; slice 5's predicate. | `grep -rn "for shortcuts\|❯\|claudeReady" dashboard docs .planning`: no hits. Only the developer can observe it (auto mode denied an agent's node-pty `claude attach` on a real session, plan 267). Remainder bounded by probe slice 1. |
| The fake accepts keys immediately after `attached …`. | Slice 5's red-before proof. | Reading `tests/fixtures/fake-claude:125-136`. Confirmed. |
| Specs read the fake attach's screen text. | Slice 5's consumer set. | `grep -rln "attached \${\|\"attached \|'attached \|\`attached " dashboard/tests`: 15 specs (listed in slice 5's proof). |
| A record marked done with a problem offers Mark as done in Recently done. | Slice 2's UI path. | Reading `SessionEntry.tsx:135-137` (`!markedDone \|\| doneProblem !== undefined`) and `sessionCapabilities.ts:37-45`. Confirmed. |
| The old problem texts as stored. | Slice 2's fixture. | `git show fef99b34:dashboard/server/doneMarks.ts` line 88 and `:114`, `git show fef99b34:dashboard/server/hosts/claude/rename.ts` line 50: stored as `Local done mark retained. Claude Code rename failed: Native rename requires terminal input while the reporting sender is still working. Use Mark as done after reporting finishes.` and `Local done mark retained. Claude Code rename failed: No terminal attachment is available to confirm native rename.` |
| O2: the example 3 spec and proof command run here. | Slice 2's proof. | `env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts session-workspace-retirement-claude.spec.ts --workers=1 --reporter=line`: 7 passed (12.5 s). Dependencies are installed at the repository root. |
| `keepRecord` without `doneMarks` is reached only by four out-of-process test writers. | Slice 3. | `grep -rn "keepRecord" dashboard/server dashboard/tests`: production callers `launchRun.ts:163`, `launchVerification.ts:153`, `launchRecording.ts:45` all pass it; `recordOperation` (`tests/support/completionRecovery.ts:30-51`) imports by name from `launchRecordStore.ts`, which re-exports `keepRecord` (`:69`). Confirmed. |
| Only Claude and Codex implement `rename`; Codex ignores the signal. | Slice 4. | `grep -rn "rename:" dashboard/server dashboard/tests`: `claudeHost.ts:35`, `codexHost.ts:29`; `renameCodex(record)` (`hosts/codex/done.ts:39`). Confirmed. |
| Manual Done writes `doneAt` with no pending text before its rename. | Slice 4's abandoned-manual rule. | Reading `doneMarks.ts:231-234` and `launchRecordStore.ts:123-139` (`doneProblem` dropped unless passed). Confirmed. |

### Current preparation observations (2026-10-07)

- The code underlying the inherited observations is unchanged between
  `bcb39b01` and `fc2fbdc6`. Literal comparison:
  `git diff bcb39b01..HEAD -- dashboard/server/liveTerminalClient.ts dashboard/server/terminalAttachments.ts dashboard/server/launchRecordBinding.ts dashboard/server/doneMarks.ts dashboard/server/hosts/claude/rename.ts dashboard/tests/session-workspace-retirement-claude.spec.ts dashboard/tests/fixtures/fake-claude`.
  Result: empty. The earlier comparison's root `tests/fixtures` spelling was
  corrected to the actual fixture path for this check.
- Slice 5's waiting seam: reading `LiveTerminalClient.watch()` and
  `screenText()`, `DetachedIdleWatch.text()`, `KeptClientScreen.cursorVisible()`
  and `settled()`, and `nativeAttach()` confirms that the private client owns
  a recorded 80×24 screen. Current `screenText()` provides only a settled read;
  the cursor flag and output/exit-aware predicate wait still need to be exposed
  through that existing observation. `LaunchInstruction.evaluate()` consumes
  the predicate after settled output but additionally owns launch input and
  paste handling, so it is not reused as the rename operation.
- Slice 3's full consumer route was searched with
  `rg -n 'keepRecord|recordOperation|observeCompletionFaults' dashboard scripts tests --glob '!*.md'`.
  Result: three production callers supply Done ownership. Three specs and
  `support/completionRecoveryFaults.ts` perform out-of-process binding writes;
  `agent-completion-recovery.spec.ts` calls `observeCompletionFaults`, which
  calls `recordOperation`, which dynamically imports the binding from
  `launchRecordStore.ts`. Its feature remains in slice 3's proof selection.
- Current dependency setup: the first observation could not start the preview
  server because this worktree lacked `node_modules/.bin/vite`. After
  `env -u NODE_ENV npm ci --ignore-scripts --offline` succeeded, the command
  `env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts readiness-planning-observation.spec.ts agent-completion-binding.spec.ts agent-completion-quiet-claude.spec.ts --workers=1 --reporter=line --output /tmp/open-dough-readiness-planning-results`
  passed the eight existing binding/quiet tests. The two disposable page
  cases attempted an extra click on the already-running Done button; they
  did not settle the page premise in that run.
- Slice 2's full page journey was then observed with
  `env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts readiness-planning-observation.spec.ts --workers=1 --reporter=line --output /tmp/open-dough-readiness-page-replay-results`:
  **2 passed (14.5 s)**. The disposable spec reused `recorded()` from
  `session-workspace-retirement-claude.spec.ts`, made the fake session
  `done-live`, saved a prior `doneAt` and each of the two old stored problem
  texts, removed the saved workspace, opened the page, found Recently done by
  session ID, asserted the old text, clicked Mark as done once, and asserted
  `Named`, both the native listing and private attach's `/rename` line, and
  disappearance of the old problem. The completed idle record bypasses the
  confirmation question. The disposable spec was removed after the observation;
  slice 2 still owns making this journey a maintained regression case.

## Proof ownership

| Correction outcome | Owning slice | Proof |
| --- | --- | --- |
| The real prompt, its recognizing text, and attach-to-prompt time are known | 1 | Explicitly authorized agent's native observation in [accepted slice 1 proof](#accepted-execution-proof-slice-1) |
| Example 3 as written: Recently done, old problem text, Mark as done → `Named`, problem gone | 2 | `session-workspace-retirement-claude.spec.ts` |
| Keys are typed only once the prompt shows, within the one wait | 5 | New case: fake prompt delayed below the wait → `Named`, the attach's lines hold `/rename done-…`; red at `bcb39b01` (keys discarded → "could not be confirmed") |
| A prompt that never shows reports "could not be opened" and hangs up | 5 | Existing silent-attach case in `agent-launch-done-rename-wait.spec.ts`, plus a case with the prompt delayed past the wait |
| Quiet completion keeps the pending mark until idle, then renames; first manual recovery after a failed reported wait works | 4, 5 | `agent-completion-quiet-claude.spec.ts` receipt, takeover, and expired-wait cases |
| The corrected dashboard renames on the real host | 5 | Owner-run Mark as done without a page terminal; native listing confirms `done-<name>` and the entry has no rename problem |
| Manual rename failures keep cause-specific text, retain local Done, and still stop; exited sessions are not renamed | 4, 5 | `agent-launch-done-stop.spec.ts`, `agent-launch-done-rename-wait.spec.ts`; descriptions distinguish external fake revival from the deferred retry |
| Open page terminals retain admission, typing, and reopen behavior; retirement needs no page terminal | 2, 5 | `agent-terminal-done-reopen.spec.ts`, terminal consumer specs, and `session-workspace-retirement-claude.spec.ts` |
| Docs and comments say the private attachment types at the prompt | 5 | Reading `AGENT-LAUNCH-TERMINALS.md:97-101`, `terminalAttachments.ts`, `launchHosts.ts` |
| `keepRecord` takes `doneMarks` as required; test writers use the binding write | 3 | Typecheck plus the four writers' specs green |
| One signal, always passed; abandoned manual Done never shows `Named` | 4 | Typecheck; done and quiet specs green; new manual close case in `agent-launch-done-close.spec.ts` |
| Codex and Cursor done behavior unchanged | 4, 5 | `agent-completion-quiet.spec.ts`, `agent-completion-cursor.spec.ts` green |

Proof commands, from the worktree root:

```sh
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- <spec>.spec.ts --workers=1
env -u NODE_ENV npm run typecheck:dashboard
env -u NODE_ENV npm run lint
```

Because slice 5 changes the fake Claude every dashboard spec loads, run the
whole `env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npm run test:dashboard`
once after slice 5 and before delivery.


## Accepted execution proof: slice 2

- `env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts session-workspace-retirement-claude.spec.ts --workers=1 --reporter=line`: 8 passed (22.1 s).
- `env -u NODE_ENV npm run typecheck:dashboard`: passed.
- Boundary: Recently done page action → shared Done → private fake Claude
  attachment and native listing. Setup in the parameterized historical-problem
  cases of `dashboard/tests/session-workspace-retirement-claude.spec.ts` uses
  `recorded()`, saved old `doneAt`/`doneProblem`, removed workspace and
  `done-live`; it supplies no rename outcome. Assertions observe the old
  problem before the click, then `Named`, no rendered or persisted problem,
  the listing's done-name, exactly one expected private attach/input and no
  page terminal. Both historical texts passed; existing report/terminal cases
  remain green. Coordinator inspected those locations and `SessionEntry`.
- Independent refactor: no test-code edits; split oversized planning context
  into cohesive linked records without changing contract or proof.
  `git diff --check` passed; accepted behavior proof unchanged.
- `npm run format` passed; hook-owned lint runs at commit. Native prompt
  observation remains pending for slices 1 and 5.

## Accepted execution proof: slice 3

- `env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts agent-completion-recovery.spec.ts agent-completion-early-recovery.spec.ts agent-completion-binding.spec.ts agent-completion-identity.spec.ts --workers=1 --reporter=line`: 7 passed (42.2 s).
- `env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts agent-launch-ad-hoc-cursor.spec.ts --workers=1 --reporter=line`: 3 passed (7.4 s); covers `launchRecording` initial binding.
- `env -u NODE_ENV npm run typecheck:dashboard`: passed.
- Boundary: production binding after held native launch or Recheck, durable
  completion receiver and out-of-process stale writers. Inspected
  `launchRecordBinding.bindRecord` preserves the locked write; required
  `keepRecord` starts Done only after that promise settles. Binding spec
  setups submit a real early report while launch is held; assertions retain
  receipt/Done across stale writes and observe one quiet rename after idle.
  Early recovery/deletion and recovery fault assertions reject resurrection
  and reserved unapplied receipt import, preserve duplicate receipt identity,
  and observe recovered native naming. Identity assertions retain newer
  session/reopen intent against old reports. Cursor assertions observe
  initial persisted first-input/session evidence through `launchRecording`.
- Searches found three production owners and four dynamic test writers; all
  test writers use `bindRecord`, and no test `keepRecord` literal remains.
  Independent refactor: none, already clean; accepted boundaries unchanged.
  `git diff --check` and `npm run format` passed; commit hook owns lint.

## Slice 4 shutdown observation and decision

The first named 20-case run reached its terminal result: 19 passed; the new
manual-close case retained `doneAt` without `doneProblem`. It invalidates the
assumption that synchronous abort lets manual failure persistence finish.
Installed Vite (`node_modules/vite/dist/node/chunks/node.js`, shutdown's
`closePreviewServer` await then `process.exit`) awaits the existing boundary
cleanup hook. `localBoundaryPlugin` discards cleanup results and the launch
plugin returns no tracked settlement. PFE selected the existing boundary
cleanup and Done settlement ownership, extended to return an awaited promise;
no second shutdown or retry mechanism. The correction outcome is unchanged.
The first run is superseded for final-candidate acceptance, not a pass.

## Accepted execution proof: slice 4

- `env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts agent-completion-quiet-claude.spec.ts agent-launch-done-stop.spec.ts agent-launch-done-rename-wait.spec.ts agent-launch-done-close.spec.ts agent-terminal-done-reopen.spec.ts agent-completion-quiet.spec.ts agent-completion-cursor.spec.ts agent-completion-binding.spec.ts --workers=1 --reporter=line`: 24 passed (1.8 m) after cohesive helper/test extraction.
- `env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts authenticated-read-plugin-hooks.spec.ts authenticated-read-subprocess-lifecycle.spec.ts agent-terminal-close.spec.ts agent-terminal-codex-close.spec.ts agent-terminal-lifetime.spec.ts agent-launch-codex-lifetime.spec.ts --workers=1 --reporter=line`: 18 passed (14.6 s); refactor did not change those boundaries.
- Formatter exposed TypeScript narrowing `signal.aborted` across an await.
  Consolidating the listing/abort/poll catch preserves last-observed stage
  evidence. Its directly affected final proof:
  `env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts agent-completion-quiet-claude.spec.ts agent-launch-done-rename-wait.spec.ts agent-launch-done-close.spec.ts --workers=1 --reporter=line`: 8 passed (1.0 m). Remaining accepted proof is unchanged.
- `env -u NODE_ENV npm run typecheck:dashboard`, `git diff --check`, and
  repaired `npm run format` passed. Hook-owned lint runs at commit.
- Inspected boundary: Done request/quiet receipt → tracked signal → native
  rename and durable problem, with existing Vite cleanup awaiting settlement.
  `agent-launch-done-close.spec.ts` supplies working fake activity and repeated
  listing before closing a real preview process, then observes durable working
  cause, local mark, no attachment/input, stop and unchanged native name.
  Rename-wait cases observe existing cause texts and stop, with external
  revival explicitly a new precondition. Quiet Claude cases observe pending
  then confirmed rename, takeover, first manual recovery and reported close
  with no late write. Other hosts and page reopen remain covered.
- Independent refactor extracted unchanged durable helpers to
  `doneSessionRecord.ts`, preserving public exports; split listing/removal,
  rename wait and close tests along cohesive seams and updated future proof
  selectors. Early-binding consumers were rechecked. All touched files fit
  the refactor size rule. No native prompt or real-dashboard proof supplied.

## Accepted execution proof: slice 1

Terry authorized the executing agent to run the native probe on 2026-10-07.
Claude Code `2.1.292`; session `50922762-2c72-4b2e-85dd-0ce1022b2879`,
short ID `50922762`, original name `Open Dough · Native prompt readiness probe`.
Created with `claude --bg --name 'Open Dough · Native prompt readiness probe'
'Reply only READY. Do not use tools or modify any files.'`; its listing was
`status: idle`, `state: done` before attaching. Dedicated probe, no page terminal.

A temporary harness spawned `claude attach 50922762` in an 80×24
`xterm-256color` PTY, recording output and monotonic chunk times. Every chunk
was rendered serially through the production `KeptClientScreen(80,24)`, with
its settled text and cursor visibility recorded before the next chunk.
First screen at **205.287 ms**: `Attaching…`, cursor hidden, no composer.
Ready screen at **213.793 ms**: header/version, the completed READY turn, then
a blank `❯` input row between two `─` separator rows near the bottom; cursor
visible. The completed-frame flag was false at this first ready screen.
Selected marker: visible cursor and the empty `❯` composer between separator
rows, rather than transcript `❯` lines or the earlier attach banner.

After observing that screen, the harness sent Ctrl-U,
`/rename done-Open Dough · Native prompt readiness probe`, then Enter.
Rendered output showed `Session renamed to: done-Open Dough · Native prompt readiness probe`.
`claude agents --json --all` confirmed that exact name for this same session,
still idle/done. Ctrl+Z detached, attachment exit code 0; no native stop ran during the measurement.
The dedicated probe session was stopped after its accepted confirmation.
T is **0.214 s**, well below the roughly-three-second decision point.
The raw capture and timestamped renderer frames were inspected in
`/tmp/claude-attach.typescript` and `/tmp/dough-270-native-probe/frames.json`;
compact accepted evidence is retained here. This direct rename does not prove
the corrected dashboard; slice 5 still owns that native acceptance.
