# Prove the terminal's foreign-Host refusal again and settle the residue's homes

## Source and authority

- **Identity:** SEED-052#terminal-host-refusal-proof, a correction.
- **Source:** [story](../../seeds/SEED-052-start-agent-work-from-dashboard.md#terminal-host-refusal-proof),
  written by the execution retrospective of SEED-052#terminal-residue (plan
  155; claim `10f862b9`; commits `87d1fc6c`, `777c2623`, `bdeaea99` on
  `claude/terminal-residue`; its closed plan is at
  `94177c75:.planning/slice-plans/155-terminal-residue/PLAN.md`).
- **Authority:** planning only. This plan grants no Take, implementation, or
  publication.

## Outcome and boundaries

The terminal upgrade's refusal of a foreign Host has a test that reaches the
product check. Closing a terminal returns the keyboard to its still-present
opener, which a test tells apart from the Recent sessions fallback. The Claude
Code host commands keep their fixed argument arrays private to one module. The
page's focus target lives with the terminal opening. The launch and terminal
docs match the code.

Key examples:

1. An upgrade whose Origin and Host both name `evil.example` is refused 403
   with no `claude` call, in dev and preview. Removing the Host check in
   `server/localOrigin.ts` fails the test.
2. A terminal opened from a card's Started, whose session still runs, is
   closed → the Started's Open terminal has the keyboard, not the Recent
   sessions entry.
3. Nothing outside `server/claudeCode.ts` can run `claude` with arbitrary
   arguments. A launch still runs `claude --bg` with the recorded name and
   instruction.

Preserved promises: everything plans 152 and 155 delivered and proved,
including the rejection constraint (only `claude attach` or `claude stop` of a
recorded session, a fixed rename string, never a shell) and all refusals.

Excluded, and left for Terry at wrap-up:

- where focus goes when the opener is gone and the entry offers no Open
  terminal (Session unavailable), or the session belongs to another project;
- `NORTH-STAR.md`'s "Host-specific code stays in one module per host" now
  that Claude Code code spans `claudeCode.ts` and `claudeLaunch.ts`;
- Mark as done's rename: typing `/rename` into the attached terminal can reach
  a permission prompt or the agent view. The alternative is a `done-` name kept
  only in the dashboard record, which the story allows when the rename cannot
  be done reliably;
- State unknown still offers Open terminal (`attachOpens` in
  `src/agentLaunch.ts`), as it offered the copyable command before;
- at narrow widths, preparation facts arriving after a focus scroll can move
  the focused control past the window edge. `dashboard-header.spec.ts` waits
  for "Reading preparation…" to clear, and no product change is recommended;
- `agent-launch-refusal.spec.ts` running every schema row in both modes, a
  test-optimization candidate.

## Findings (retrospective, at `bdeaea99`)

- **A:** `bdeaea99` removed the boundary spec's "naming a foreign Host" upgrade
  case, whose Origin equals its Host, so only `verifyLocalOrigin`'s Host branch
  (`server/localOrigin.ts:37-44`) refused it. The remaining foreign-Host case,
  in `agent-launch-refusal.spec.ts`, is `answeredByVite` in both modes. Vite
  answers it before the boundary runs, and `authenticated-read-refusal.spec.ts`
  has no Host case. Vite's upgrade listener handles only its own HMR path, so
  the terminal upgrade relies on this check alone. Plan 155's ownership row
  for origin details was wrong for Host.
- **B:** the journey's Close focus check (`agent-terminal.spec.ts`, "Close ends
  the panel…") closes a terminal opened from the Recent sessions entry, so the
  opener and the fallback are one element. The done spec covers only the
  fallback.
- **C:** slice 2 exported `execClaude(args)` from `claudeCode.ts` for
  `claudeLaunch.ts` to build the `--bg` argv. The header's claim that each
  command is a fixed array held there now holds by convention only.
- **D:** `recentSessionControl` is a non-component export from
  `RecentSessions.tsx`. The `data-opens-session` literal is split between it
  and `LaunchSession.tsx`, and `TerminalSplit` depends on Recent sessions
  markup.
- **E:** `AGENT-LAUNCH.md`'s Mark as done section attributes the done refusals
  to `server/doneMarks.ts` (now `agentLaunchAdmission.ts`). It omits that a
  launch name with a control character is never typed, and says the
  could-not-mark message follows only "if no answer came" (a refusal shows it
  too). `server/agentTerminals.ts`'s header names `./agentLaunches.ts` as the
  admitter. `agent-launch-done.spec.ts`'s "with no Origin" done row re-proves
  a `verifyLocalOrigin` detail owned by `agent-launch-refusal.spec.ts`.

## Decisive premises

| Premise | Observation | Result |
| --- | --- | --- |
| No test reaches the Host branch. | `grep answeredByVite dashboard/tests/*.spec.ts`; `grep Host authenticated-read-refusal.spec.ts`; `git show 10f862b9:dashboard/tests/agent-terminal-boundary.spec.ts`. | The only case is `answeredByVite`; the read spec has none. The removed upgrade case ran under `for (const mode of ["dev", "preview"])` and passed there. |
| The journey's Close check cannot distinguish the opener. | Read `agent-terminal.spec.ts` "Close ends the panel…". | It expects `openIn(entry(readyStory))` focused after closing a terminal opened from that entry. |
| `execClaude` has two outside uses. | `grep -n execClaude dashboard/server/*.ts`. | `claudeLaunch.ts:122` only, besides `claudeCode.ts`'s own stop and listing. |
| `recentSessionControl` has one caller. | `grep recentSessionControl\|data-opens-session dashboard/src`. | `TerminalSplit.tsx:57`; the attribute is set in `LaunchSession.tsx:26`. `terminalOpening.ts` holds `TerminalOpening`. |

## Slices

### 1. The terminal upgrade's foreign-Host refusal is proved
Type: Behavior
Status: done
Proof: `npm run test:dashboard -- dashboard/tests/agent-terminal-boundary.spec.ts dashboard/tests/agent-launch-done.spec.ts`, with the new case failing when the Host check is removed.

Behavior: example 1. Restore one refusal row in the boundary spec's table,
with Origin and Host both `evil.example`, asserting 403 and no `claude` call in
each mode. Drop the done spec's "with no Origin" row. Name the Host refusal's
owner in the spec header.

Accepted proof: the proof command passed. The row "naming a foreign Host" in
`agent-terminal-boundary.spec.ts`'s refusal table asserts 403 and unchanged
`server.claudeCalls()` in both modes. With `verifyLocalOrigin`'s Host branch
disabled, only that row failed in both modes ("opened a refused socket").

### 2. Closing returns the keyboard to a still-present opener
Type: Behavior
Status: planned
Proof: `npm run test:dashboard -- dashboard/tests/agent-terminal.spec.ts dashboard/tests/agent-terminal-done.spec.ts` and `npm run typecheck:dashboard`.

Behavior: example 2, in the existing journey: close a terminal opened from a
card's Started while its session still runs, and expect that Started's Open
terminal focused. Move the focus target's lookup and the attribute name into
`terminalOpening.ts`, which `LaunchSession` and `TerminalSplit` already use.
`TerminalSplit` then no longer imports `RecentSessions`.

### 3. The Claude Code host commands stay private to their module
Type: Structure
Status: planned
Proof: unchanged behavior under `npm run test:dashboard -- $(ls dashboard/tests/agent-*.spec.ts)` and `npm run typecheck:dashboard`.

Removes finding C's exposure: `claudeCode.ts` exports a fixed `claude --bg`
command, and `execClaude` becomes private. `claudeLaunch.ts` keeps naming, the
instruction, and outcome classification. Fix finding E's documentation:
`AGENT-LAUNCH.md`'s Mark as done section, and the `claudeCode.ts` and
`agentTerminals.ts` headers.

## Proof ownership

| Promise | Owner |
| --- | --- |
| Foreign-Host upgrade refused | 1: boundary spec, both modes |
| Other origin details | `agent-launch-refusal.spec.ts`, `authenticated-read-refusal.spec.ts` |
| Focus returns to a present opener | 2: `agent-terminal.spec.ts` journey |
| Focus falls back to the entry | `agent-terminal-done.spec.ts` main test |
| Launch argv and outcomes | `agent-launch-boundary.spec.ts` and the other `agent-launch-*` specs |

## Delivery checks

Focused Playwright specs per slice plus `npm run typecheck:dashboard`; check
`npm run format`'s exit status directly (this repository has no commit hook).
The whole dashboard suite is not a local gate. No payload or skill changes.

## Concern review

Three slices, each with one proof loop: a security proof, a focus proof with
the focus target's home, then host-command encapsulation with its docs. No
slice-specific concern was identified in this review.
