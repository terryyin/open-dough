# Prove terminal attach in Node Vitest

**Identity:** SEED-413#prove-terminal-attach-and-cursor-turns-on-vitest

**Source:** [Prove terminal attach in Node Vitest](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-terminal-attach-and-cursor-turns-on-vitest)

## Goal and scope

Give developers changing a session terminal fast Node Vitest feedback on who
may attach, what a socket passes through, and when that attachment ends.
Move the five legacy specs (24 cases) off backend Playwright and account for
each observation. Product behavior is unchanged. Cursor turns, the Cursor
runner, Done, and browser terminal journeys belong to their sibling stories
in the
[campaign coverage map](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#backend-vitest-replacement-coverage).

## Current decisions

- Follow the North Star on [directly testable production code](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
  and [plain Vitest for unit tests](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e).
  Use the [direct domain mapping in ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution),
  [local operational state in ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state),
  and [the proof and cost comparison in ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md#decision).
- PFE: the upgrade boundary already exists.
  [`installAgentLaunchMiddleware`](../../../dashboard/server/launchBoundary.ts)
  builds [`AgentTerminals`](../../../dashboard/server/agentTerminals.ts) with
  [`admittedAttach`](../../../dashboard/server/terminalAdmission.ts) and is
  mounted by [`localBoundaryPlugin`](../../../dashboard/server/localBoundaryPlugin.ts)
  on a plain `http.Server`, as the close specs already do. Reuse that server.
  Do not start `startDashboardServer` for these cases.
  [`TerminalAttachments`](../../../dashboard/server/terminalAttachments.ts)
  already accepts a socket and a `TerminalSession`; the resize race drives it
  directly. Keep `installFakeClaude`, `installFakeCodex`, and MakeMe records.
  Add no server, request, or boundary wrapper.
- One attachment rule covers the live socket and the resize race: an admitted
  socket passes terminal messages, and a frame or a dead PTY ends only that
  attachment. `closeServer` is the separate server-hook observation. Codex
  resume, missing-target refusal, and the Done mark are that host's attach
  observations on the same server.
- Remove a test-support helper only when `dashboard/` and `e2e/` have no
  remaining caller. The Cursor turn specs still use the terminal helpers, so
  this story does not delete those shared helpers.
- Browser journeys stay in `e2e/terminals/`. This plan adds no E2E case.

## Decisive premises

Observed in this preparation checkout at `20bcf3013` on 27 November 2026
with Node 24.21.0, one worker, and a fresh `npm ci` in this worktree. Scratch
specs were removed before this plan was written. The product code under test
was unchanged.

| Premise | Consuming operation and result |
| --- | --- |
| 1. Playwright lists the five attach specs as 24 cases, and the six Cursor turn specs as the other 18, all outside Vitest | `node node_modules/playwright/cli.js test --config dashboard/backend.playwright.config.ts --reporter=list --list` with the eleven-spec pattern exited 0 and printed 42 `[chromium]` lines. `groupFiles(backendGroup)` classified all eleven paths as Playwright. |
| 2. A plain launch-boundary server on Vitest refuses a foreign origin and attaches fake-claude | `npm run test:dashboard:backend -- 'terminals/zz-scratch-terminal-plugin\.spec\.ts$' --workers=1` passed in the combined 8.14 s run: foreign origin returned 403 with no new Claude call, then a same-origin socket showed `attached <shortId>` and an `attach` call. The case took 2463 ms. |
| 3. `TerminalAttachments` ends only the unavailable PTY on Vitest for both attachment states | The same command's resize scratch, rerun as `npm run test:dashboard:backend -- 'terminals/zz-scratch-terminal-resize\.spec\.ts$' --workers=1`, passed both cases: ready closed with "The terminal ended." and starting closed with "Codex could not be attached."; a later attachment still accepted input. Wall 1.38 s. |
| 4. The same plain server resumes a fake Codex terminal, refuses the exact missing target, and `closeServer` hangs that PTY up while the HTTP server stays up | `npm run test:dashboard:backend -- 'terminals/zz-scratch-terminal-codex\.spec\.ts$' --workers=1` passed in 2.95 s wall (case 1493 ms): the socket showed "original retained history", the missing-target upgrade returned 410 with no new attach, `closeServer` closed the socket with 1006, the PTY was hung up, the server was still listening, and no `turn/interrupt` ran. |

The Codex Done-mark case was not part of that probe. Slice 5 carries it onto
the same server and the same `openCodexTerminal` path.

## Ordered slices

### 1. Prove which Claude upgrades attach

Type: Behavior
Status: done
Estimate: 12–15 active minutes.

Proof: Move the nine refusal cases and the two "still attaches" cases in
`agent-terminal-boundary.spec.ts` to Node Vitest on the plain launch-boundary
server:

- A completed automatic-feedback URL, a foreign origin, a foreign Host, an
  unknown project, a session this dashboard did not launch, a missing
  session, another project's session, a session Claude Code no longer lists,
  and a missing checkout are refused and run no attach.
- A stopped session Claude Code still lists, and a listing that cannot be
  read, still attach. Closing those sockets ends the attach with SIGHUP.

Accepted proof: the 11 cases now live in
`agent-terminal-admission.spec.ts` on Node Vitest (who may attach);
`agent-terminal-boundary.spec.ts` keeps what an admitted socket passes.
Before: Playwright, whole file 17 cases, 22.58 s wall, 1149 ms summed for
these 11. After: Vitest, 11 cases, 9.83 s wall, about 592 ms summed; nine
refusals take 1–47 ms, the two real attaches 209–248 ms (they wait for the
fake-claude attach and its SIGHUP). Records: `s1-before`, `s1-after`,
`s1-rest` in the execution's evidence directory.

### 2. Prove an admitted socket passes terminal messages

Type: Behavior
Status: done
Estimate: 12–15 active minutes.

Proof: Move the remaining six cases in `agent-terminal-boundary.spec.ts`
(one pass-through, five bad frames; the file held 17 cases, not 19) to the
same Vitest server:

- A same-origin socket shows the attached size, echoes input, applies a
  resize, and on close ends the attach with SIGHUP while the session stays
  available and no launch runs.
- Plain text, a command, non-text input, an oversized resize, and binary
  data each close the socket and end that attach without echoing a command.

Accepted proof: `agent-terminal-boundary.spec.ts` is now Node Vitest, 6
cases. Before: Playwright 1572 ms summed, 6.48 s wall (`s1-rest`). After:
Vitest 1173 ms summed, 5.45 s wall (`s2-after`); bad frames 92–161 ms each
(close 1008, SIGHUP, no echo); the pass-through case 524 ms, because it waits
for the real attach, echo, resize and SIGHUP.

### 3. Prove an unavailable PTY resize ends only that attachment

Type: Behavior
Status: planned
Estimate: 8–10 active minutes.

Proof: Move `agent-terminal-resize.spec.ts` (2 cases) to Node Vitest, driving
`TerminalAttachments` directly with the replaced PTY spawn:

- For a ready Claude attachment and a starting Codex attachment, a resize
  that throws ends only that attachment, does not escape the socket handler,
  ignores later input on the closed socket, and leaves the next attachment
  able to take a resize and input.

### 4. Prove closeServer ends the attachment while the server stays up

Type: Behavior
Status: planned
Estimate: 10–12 active minutes.

Proof: Move `agent-terminal-close.spec.ts` and
`agent-terminal-codex-close.spec.ts` to Node Vitest on the plain server:

- `closeServer` alone ends the Claude attach with SIGHUP while the socket
  and HTTP server are still open.
- `closeServer` alone closes the admitted Codex socket and hangs up its PTY
  while the HTTP server stays listening and the native protocol receives no
  `turn/interrupt`.

Slice 2's refactor composed the shared Claude terminal setup once in
`startClaudeTerminalBoundary` (`dashboard/test-support/claudeTerminalBoundaryHttp.ts`):
it composes the existing fake, projects and plain launch-boundary server and
returns them unchanged, so it is not a server wrapper. The close specs reuse
it only if it also exposes the boundary's close apart from HTTP; decide that
here when they move.

Refactor follow-up from slice 1: both close specs still build
`{baseURL, origin, ...claude.controls} as unknown as DashboardServer`. On
the move, type the server as `TerminalServer` from
`dashboard/test-support/agentTerminalBoundary.ts` without a cast, adding the
Codex controls beside it if the Codex helpers read them.

### 5. Prove Codex resume, missing-target refusal, and the Done mark

Type: Behavior
Status: planned
Estimate: 12–15 active minutes.

Proof: Move `agent-terminal-codex.spec.ts` (3 cases) to Node Vitest on the
plain server with `installFakeCodex`:

- Saved context resumes on the recorded remote transport and detaches
  without replay or fork. An unknown session and a foreign origin add no
  attach.
- Exact missing-target evidence refuses the upgrade with the Codex
  explanation and starts no attach.
- A failed exit, an unready screen, and a hidden cursor keep Done on both
  the Codex record and the same-id Claude record. A ready Codex screen
  clears only the Codex mark.
- After the five specs are on Vitest, search `dashboard/` and `e2e/` for
  helpers whose only callers were these specs and remove any such export.
  Run `npm run typecheck:dashboard` and the focused backend selection below.

## Proof ownership and local gate

Files are relative to `dashboard/backend-tests/terminals/`.

| Slice | Legacy selection | Observable proof |
| --- | --- | --- |
| 1 | `agent-terminal-boundary` refusals and still-listed attaches (11) | Refused upgrades run no attach; a stopped or unreadable listing still attaches and socket close sends SIGHUP |
| 2 | `agent-terminal-boundary` pass-through and bad frames (6) | Output, input, and size pass; a bad frame ends only that attach |
| 3 | `agent-terminal-resize` (2) | Unavailable resize ends only the ready or starting attachment |
| 4 | `agent-terminal-close` (1), `agent-terminal-codex-close` (1) | `closeServer` ends the Claude attach and the Codex PTY while the HTTP server stays up |
| 5 | `agent-terminal-codex` (3) | Remote resume without replay or fork, missing-target refusal, Done cleared only for the ready Codex host |

Account for all 24 cases before accepting zero Playwright selections for
these five files. Use fresh absolute proof paths and one worker. Repeat a
comparable before-and-after pair at execution if the tree or the machine
load changed. Record engine and case counts, per-case time against roughly
100 ms, summed case time, and elapsed selection time.

```sh
selection='terminals/agent-terminal-(boundary|codex-close|codex|close|resize)\.spec\.ts$'
caffeinate -s -i env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u OPEN_DOUGH_DASHBOARD_BACKEND_SPLIT -u FORCE_COLOR -u NO_COLOR OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD="$backend_proof" /usr/bin/time -p npm run test:dashboard:backend -- "$selection" --workers=1
```

Run `npm run typecheck:dashboard` in slice 5. No production signature
changes, so there is no extra consumer suite. Apply the shared
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Keep the default test timeout.

Use awake macOS on AC under `caffeinate -s -i` for this long local check per
[AGENTS.md](../../../AGENTS.md).

## Plan review

Slice-plan refinement was not needed. Five Behavior slices stay within the
eight-slice and 15-minute limits. Each owns one attach question, and the
Cursor turn specs are a separate story. The four premises were observed in
this checkout. This review found no remaining slice-specific concern. The
Codex Done-mark observation is slice 5's proof, on the server premise 4
already ran.
