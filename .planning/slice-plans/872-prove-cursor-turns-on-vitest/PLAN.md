# Prove Cursor turns in Node Vitest

**Identity:** SEED-413#prove-cursor-turns-on-vitest

**Source:** [Prove Cursor turns in Node Vitest](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-cursor-turns-on-vitest)

## Goal and scope

Give developers changing a Cursor terminal fast Node Vitest feedback on when
that client receives its instruction, when an unconfirmed or exited client
does not confirm it, and whether a detached client stays for the next socket.
Move the six legacy specs (18 cases) off backend Playwright and account for
each observation. Product behavior is unchanged. Terminal attach, the Cursor
runner, and browser terminal journeys belong to their sibling stories in the
[campaign coverage map](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#backend-vitest-replacement-coverage).

## Current decisions

- Follow the North Star on [directly testable production code](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
  and [plain Vitest for unit tests](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e).
  Use the [direct domain mapping in ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution),
  [local operational state in ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state),
  and [the proof and cost comparison in ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md#decision).
  The kept record and the live client are machine-local. The gain against
  the Playwright backend runner is the same observations on Node Vitest.
  The cases stay in seconds because they keep the runner and the fake PTY.
- PFE: the boundary server and the fake `cursor-agent` already exist.
  [`startCursorDashboard`](../../../dashboard/test-support/support/keptCursorTurn.ts)
  starts [`startDashboardServer`](../../../dashboard/test-support/support/dashboardServer.ts)
  in boundary mode with the fake on `PATH`, and
  [`withInstructedCursor`](../../../dashboard/test-support/support/keptCursorTurn.ts)
  launches through [`launch`](../../../dashboard/test-support/agentLaunchBoundary.ts).
  Reuse those, plus `installFakeCursor`, `openCursorTerminal`, `admit`,
  `stayedUp`, and `heldOnWorkspaceTrust`. Do not add a server, runner, or
  cursor wrapper. The runner story and `e2e/` still call the shared helpers,
  so this story does not delete them.
- One delivery rule covers the six specs. The instruction is written only
  when the screen is ready; until then the record stays uncertain and the
  client stays up. An exit before acceptance does not confirm it. Detach,
  a dropped socket, server close, and a restarted server do not kill the
  client; the next socket joins that process.
- Each moved case passes `60_000` as its own Vitest timeout argument. The
  installed Vitest 5.1.0 node default is `5_000`, and the probes below
  exceeded it. `launchWaitMs` is `30_000`, so `60_000` covers one launch
  bound plus the runner start. Do not set a file, suite, hook, or config
  timeout. Keep every poll timeout the legacy case already passes,
  including `{ timeout: launchWaitMs }`.
- The survival spec's `test.step` calls become ordinary blocks. Vitest's
  `test.step` is undefined. `workingKeptCursorTest` is Playwright's
  `test.extend`; that case calls `installFakeCursor({ working: true })`
  and `cursor.cleanup()` itself. After that spec moves, remove the extend
  and the `pageTest` import from `keptCursorTurn.ts`. The helper's
  Playwright `expect` already ran under Vitest in the probes. Do not add
  a Vitest fixture in its place.
- Remove a test-support helper only when `dashboard/` and `e2e/` have no
  remaining caller. Browser journeys stay in `e2e/terminals/`. This plan
  adds no E2E case. No checked file is over 250 lines; the extend removal
  shrinks `keptCursorTurn.ts` (238 lines). Do not grow a file past 250.

## Decisive premises

Observed in this preparation checkout at `dffeb2d7b` on 27 November 2026
with Node 24.21.0 and one worker, after `npm ci` in this worktree. Scratch
specs were removed before this plan was written. The product code under test
was unchanged. Vitest rows used
`npm run test:dashboard:backend -- 'terminals/zz-scratch-cursor-turn\.spec\.ts$' --workers=1`.
Premise 1 used:

```sh
node node_modules/playwright/cli.js test --config dashboard/backend.playwright.config.ts --reporter=list --list 'terminals/agent-terminal-cursor(-exit|-idle|-launch|-launch-wait|-trust-join)?\.spec\.ts$'
```

| Premise | Consuming operation and result |
| --- | --- |
| 1. Playwright lists the six turn specs as 18 cases, all outside Vitest | The list command below exited 0 and printed `Total: 18 tests in 6 files`. `groupFiles(backendGroup)` classified those six paths, and the runner spec, as Playwright. |
| 2. The same boundary server on Vitest exceeds the 5s default test timeout and passes with the case's own 60s timeout | The first scratch run, with no per-test timeout, failed all three cases at 5000ms (`Test timed out in 5000ms`). The ready-composer case then passed in 8307ms, and the unrecognized detach passed in 9350ms, each with `60_000`. |
| 3. A ready composer confirms the instruction, a joined socket accepts typing, and a foreign origin adds no attach | The ready-composer case above saw `firstInput.state` `confirmed` and that text in the PTY. The joined-socket case passed in 8370ms: `terminal.send({ input: "later" })` reached `cursor.input`, an unknown session returned 404, and a foreign origin returned 403 with no new attach. |
| 4. Held paint, workspace trust, exit, and server close keep the legacy answers on Vitest | Held paint without `{ timeout: launchWaitMs }` failed in 6352ms (`expected [] to have a length of 1`). The same end-wait with that timeout passed in 7648ms as `uncertain` / `timed-out`. `heldOnWorkspaceTrust` passed in 4684ms with empty PTY input and `timed-out`. The exit screen passed in 6330ms: `unconfirmed`, the printed error, and the process gone. Server close then `stayedUp` passed in 6912ms. |
| 5. A restarted boundary server joins the same client when the terminal is admitted | The restart case passed in 7895ms: after `server.close()` and a second `startCursorDashboard` on the same machine, `admit` attached the same pid, a second socket stayed on that pid, and `kept-turn` reached the PTY. A scratch that expected `attached` without `admit` failed in 9627ms on `observe`. Keep `admit`. |

The question, paste, later-ready, follow-up, and killed-client cases were not
separate probes. They use the same `startCursorDashboard({ mode: "boundary" })`,
`launch`, `installFakeCursor`, and `openCursorTerminal` these rows ran. The
screen option and a second `launch` on that server do not change the route.

## Ordered slices

### 1. Prove a ready screen receives the instruction

Type: Behavior
Status: done
Estimate: 12–15 active minutes.

Proof: Move `agent-terminal-cursor-launch.spec.ts` (6 cases) to Node Vitest
on the existing boundary server. Each case passes `60_000` as its own
timeout.

- A working client receives the instruction, confirms the record, accepts
  typing, and the next socket joins the same process.
- The empty composer and a long pasted instruction confirm once Cursor
  shows the text.
- A question accepts a typed answer and leaves the instruction unconfirmed.
- A trust prompt that never becomes the composer does not receive the
  instruction, and a second launch adds no session.
- A screen that becomes ready later receives the instruction and confirms
  the record. The client stays that one process.
- Proof recorded (2026-11-27, Node Vitest, 1 worker): `npm run test:dashboard:backend -- 'terminals/agent-terminal-cursor-launch\.spec\.ts$' --workers=1` passed 6/6 on Vitest (33.58s summed case time, 35.99s elapsed; 0 on Playwright). Native Vitest `expect` / `expect.poll` passed all 6 cases with per-case `60_000` timeouts. Refactor pass skipped (subject spec only, 8-line engine switch, 223 lines, no refactor candidate).

### 2. Prove an unsettled launch wait leaves the client

Type: Behavior
Status: done
Estimate: 12–15 active minutes.

Proof: Move `agent-terminal-cursor-launch-wait.spec.ts` (3) and
`agent-terminal-cursor-trust-join.spec.ts` (2) to Node Vitest. Keep each
`launchWaitMs` poll timeout and `heldOnWorkspaceTrust`. Each case passes
`60_000` as its own timeout.

- A held first paint answers uncertain and timed out, leaves the client
  running, and confirms the instruction after the paint is released.
- A silent paste chip answers uncertain and timed out while the first input
  stays confirmed and the client stays up.
- Workspace trust explains the kept prompt. The developer's terminal answer
  confirms the instruction in that same client.
- A terminal joined during the framed or unframed trust wait shows that
  prompt, sends no instruction, and rejoins the same process.
- Proof recorded (2026-11-27, Node Vitest, 1 worker): `npm run test:dashboard:backend -- 'terminals/agent-terminal-cursor-(launch-wait|trust-join)\.spec\.ts$' --workers=1` passed 5/5 on Vitest (25.99s summed case time, 27.93s elapsed; 0 on Playwright). Vitest `expect.poll` defaults to 1000ms (vs Playwright 5000ms), so the paste-chip `endWaitAfter` poll keeps `{ timeout: launchWaitMs }`. Absorbed seed link amendment from sibling closure `e240fa876` (`terminal attach`). Refactor pass skipped (subject specs + absorbed seed link only, no refactor candidate).

### 3. Prove an exit before acceptance does not confirm

Type: Behavior
Status: done
Estimate: 8–10 active minutes.

Proof: Move `agent-terminal-cursor-exit.spec.ts` (2 cases) to Node Vitest.
Each case passes `60_000` as its own timeout.

- A client that prints an exit before acceptance records Cursor's text.
  Repeating the launch adds no session.
- Killing the client leaves the instruction unconfirmed. The next launch
  submits it in a new conversation.
- Proof recorded (2026-11-27, Node Vitest, 1 worker): `npm run test:dashboard:backend -- 'terminals/agent-terminal-cursor-exit\.spec\.ts$' --workers=1` passed 2/2 on Vitest (11.79s summed case time, 13.09s elapsed; 0 on Playwright). Kept `{ timeout: 5_000 }` on `processRunning` poll to match Playwright's legacy 5s default. Refactor pass skipped (subject spec only, 115 lines, no refactor candidate).

### 4. Prove a detached screen leaves the client running

Type: Behavior
Status: planned
Estimate: 10–12 active minutes.

Proof: Move `agent-terminal-cursor-idle.spec.ts` (4 cases) to Node Vitest.
Each case passes `60_000` as its own timeout.

- A detached follow-up prompt keeps the process. The next open joins it
  and accepts typing.
- A question, an unrecognized screen, or a working screen keeps the
  detached client after the socket closes.

### 5. Prove a working client survives detach and server close

Type: Behavior
Status: planned
Estimate: 12–15 active minutes.

Proof: Move `agent-terminal-cursor.spec.ts` (1 case) to Node Vitest. The
case passes `60_000` as its own timeout. Replace `test.step` with ordinary
blocks and install the fake cursor in the case, including `cursor.cleanup()`.
Keep `admit` before the attached check.

- After a restart, a new socket joins the same process and accepts typing.
  A second socket shares that client. An unknown session is refused and a
  foreign origin adds no attach. A dropped connection still leaves the
  client to rejoin. Closing the server leaves the process running.
- Remove `workingKeptCursorTest` and the `pageTest` import from
  `keptCursorTurn.ts` once this spec is its only caller. Search
  `dashboard/` and `e2e/` before that removal.
- Run `npm run typecheck:dashboard` and the focused backend selection below.

## Proof ownership and local gate

Files are relative to `dashboard/backend-tests/terminals/`.

| Slice | Legacy selection | Observable proof |
| --- | --- | --- |
| 1 | `agent-terminal-cursor-launch` (6) | The instruction is confirmed only for a ready screen; a question or a trust prompt that never becomes the composer leaves it unconfirmed |
| 2 | `agent-terminal-cursor-launch-wait` (3), `agent-terminal-cursor-trust-join` (2) | An unsettled wait answers uncertain, leaves the client, and a later screen or the developer's answer confirms it; a join during the wait shows the trust prompt |
| 3 | `agent-terminal-cursor-exit` (2) | An exit before acceptance records Cursor's text and adds no session; a killed client is replaced by a new conversation |
| 4 | `agent-terminal-cursor-idle` (4) | A detached follow-up, question, unrecognized, or working screen leaves the process running, and the follow-up join accepts typing |
| 5 | `agent-terminal-cursor` (1) | Restart, a second socket, a dropped connection, and server close leave the same client; an unknown session and a foreign origin add no attach |

Account for all 18 cases before accepting zero Playwright selections for
these six files. Use one worker. Repeat a comparable before-and-after pair
at execution if the tree or the machine load changed. Record engine and case
counts, per-case time, summed case time, and elapsed selection time. These
cases keep a real runner, so their times stay in seconds.

```sh
selection='terminals/agent-terminal-cursor(-exit|-idle|-launch|-launch-wait|-trust-join)?\.spec\.ts$'
caffeinate -s -i env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u OPEN_DOUGH_DASHBOARD_BACKEND_SPLIT -u FORCE_COLOR -u NO_COLOR OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD="$backend_proof" /usr/bin/time -p npm run test:dashboard:backend -- "$selection" --workers=1
```

Run `npm run typecheck:dashboard` in slice 5. No production signature
changes, so there is no extra consumer suite. Apply the shared
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Keep the default test timeout except the per-case `60_000` above.

Use awake macOS on AC under `caffeinate -s -i` for this long local check per
[AGENTS.md](../../../AGENTS.md).

## Plan review

Slice-plan refinement was not needed. Five Behavior slices stay within the
eight-slice and 15-minute limits. Each owns one turn question, and the
runner specs stay with the Cursor runner story. The five premises were
observed in this checkout. This review found no remaining slice-specific
concern. The per-case timeout and the kept `admit` call are the probe
results, not open choices.
