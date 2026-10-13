# See and answer Cursor's workspace trust prompt when a session starts

**Identity:** SEED-066#cursor-trust-prompt-at-session-start
**Source:** [correction story](../../seeds/SEED-066-composable-lightweight-session-options.md#cursor-trust-prompt-at-session-start)

## Source and provenance

Bounded correction from the native observation of
[SEED-066#unattached-session-native-observation](../../seeds/SEED-066-composable-lightweight-session-options.md#unattached-session-native-observation)
(plan 301), run on 2026-10-13 in the Lizard project with dashboard deployment
`e40d6854c99b` and Cursor agent 2026.10.01-e373342. Terry accepted planning
this correction the same day.

## Current findings

Start session · Isolated workspace · Automatically land on Cursor (launch
`2d5ab090-e36e-4f52-afd9-24363e66c8c7`, chat `2787e58b-228e-4e60-96e2-b7ccfcf51cee`):

- The start created `.worktrees/session-2`, a path Cursor had not trusted.
- The launch settled `uncertain`, `timed-out` after 38 seconds: “Cursor did
  not show it took the instruction in time. Session … is kept.” Startup
  recovery offered Recheck and Continue session start; the entry read “First
  input acceptance uncertain”; the runner listed the client as “waiting for an
  answer”. Nothing named workspace trust.
- Opening the session's terminal delivered one frame,
  `{"readiness":"observe"}`, and an empty screen, on two openings at different
  sizes.
- Opening the same chat in a private pty showed “Workspace Trust Required …
  [a] Trust this workspace / [q] Quit”.
- Pressing `a` in the dashboard terminal drew “Trusting workspace…”, then the
  runner wrote the kept instruction, the record's first input became
  `confirmed`, and the journey continued normally.

Read from source at `52a4f6e9`: [launch.ts](../../../dashboard/server/hosts/cursor/launch.ts)
answers every launch-wait abort with the shared timed-out wording;
[recover.ts](../../../dashboard/server/hosts/cursor/recover.ts) already
recognizes the trust screen (`trustPhrases`) for recovery; and
[AGENT-LAUNCH-TERMINALS.md](../../../dashboard/AGENT-LAUNCH-TERMINALS.md) says a
socket joining a kept client “sees a redrawn screen”.

Slice 1 establishes why the held screen was absent on join and fixes that
boundary; its native observation and accepted proof are recorded below.

## Goal and scope

When Cursor holds its workspace trust prompt at launch, the dashboard says so
and shows it, and the developer's answer in the terminal delivers the first
input.

Preserved: no `--trust`, `--force` or `--yolo` flag and no answer typed by the
dashboard ([AGENT-LAUNCH-HOSTS.md](../../../dashboard/AGENT-LAUNCH-HOSTS.md));
the kept client, its instruction delivery on the first ready screen, and the
record's uncertain state until then; recovery's existing trust stop; wording
of other uncertain outcomes; Claude Code and Codex launches.

Excluded: trusting workspaces in advance, changing where isolated sessions are
created, the missing Cursor completion report seen in the same journey, and
retirement, which [plan 304](../304-retire-established-session-worktree/PLAN.md)
owns.

## Current decisions

- Reuse the trust recognition `recover.ts` owns; move it to a shared home only
  if both callers need it. Do not add a second phrase list.
- The trust wording replaces the timed-out explanation only when the held
  screen shows the prompt; the outcome stays `uncertain`, because the first
  input is still undelivered.
- Dashboard source only; no skill payload and no release. Follow
  [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md): the
  Cursor behavior needs native evidence, and substitute-client specs prove
  only their own boundary.

## Execution context

- Execution mode: story-branch; publisher `dashboard-territory.local-open-dough`;
  agent `d.kanai-chan`.
- Originating and execution checkout:
  `/Users/terryyin/git/open-dough/.worktrees/see-and-answer-cursor-s-workspace-trust-prompt-w`;
  reused owned worktree on
  `codex/see-and-answer-cursor-s-workspace-trust-prompt-w`.
  No integration checkout was supplied. Authorized remote trunk: `origin/main`;
  increments publish to the execution branch.
- Starting revision: `605e5b8bfb34f6a93f6326e64a9e7a277610da20`.
  Established claim accepted on `origin/main`:
  `310f729d31696ee83686f10684c808ab8cab432b` (also the first increment's
  previously published base). Claim CI is unobserved on trunk.
- Checkout setup: `npm ci`, then `npm run --silent typecheck:dashboard`, both
  passed on 2026-10-14 with the current `package-lock.json`.
- Replanning permission: retain existing planned authority within this outcome.
  No numeric slice target or hard limit is supplied; use the bounded behavior
  and proof loop. No generation trigger is implicated by dashboard source.
- CI source: GitHub Actions, verified `ci.yml` / `CI`,
  `terryyin/open-dough`, execution branch above.
  Coordinator `seed066-cursor-trust`, installed runtime in this checkout,
  observer `/tmp/dough-ci-501/watch-xpWDgm`, PID `55960`, stream session `71234`,
  yielded cell `9`. Keep this identity for managed delivery and recovery.
  Stopped for the slice 1 decision on 2026-10-14: matching stop receipt reports
  `status: stopped`, no unread evidence, `pendingCi: unobserved`; PID exit
  confirmed. No increment was committed or published. Resume preserves the
  uncommitted baseline spec and this plan, and may rearm only after the native
  investigation decision is resolved.
  Terry authorized the bounded native investigation and continuation on
  2026-10-14. The resumed observer is `/tmp/dough-ci-501/watch-j5qciV`,
  PID `56569`, stream session `57326`, yielded cell `5`, same coordinator,
  checkout, repository, workflow and execution target.

## Outside-in proof ownership

| Promise | Owning slice and observation |
| --- | --- |
| The cause of the empty joined terminal is known | 1: a spec with a substitute client holding a trust screen at launch, joined after the launch wait, shows what the socket receives |
| The joined terminal shows the held trust prompt | 1: the same spec, once passing, reads the prompt text in the terminal |
| The launch answer, Startup recovery and session entry name workspace trust | 2: a launch-wait spec with the substitute trust screen reads all three |
| Answering in the terminal delivers and confirms the first input | 2: the spec types the answer and reads the delivered instruction and `confirmed` record |
| Real Cursor behaves the same in a new worktree | 3: one native Start session in an untrusted worktree |

## Ordered slices

### 1. A terminal joined to a held Cursor client shows its current screen
Type: Behavior
Status: done
Proof: a new focused Playwright spec beside
`dashboard/tests/agent-terminal-cursor-launch-wait.spec.ts`, using the
existing substitute Cursor client, run with `--reporter=list`.

Behavior: a kept client drew a trust prompt and is waiting; the developer
opens that session's terminal → the terminal shows the prompt. This slice
starts by reproducing the empty screen with the substitute client. If it does
not reproduce there, record what differs from the native client and stop for
a decision before changing the terminal.

Accepted investigation and implementation on 2026-10-14:

- The original completed-frame trust substitute showed its prompt on join and
  reconnect (2 dev/preview tests). It did not reproduce the native failure.
  Terry then authorized one bounded native investigation and continuation.
- Production `execCursor` / `spawnCursorPty` opened Cursor
  `2026.10.01-e373342`, chat `df40ecf2-0d3e-4b47-9e4b-0cb69d671cf7`, in a fresh
  temporary fixture worktree detached at the claim revision. The 80×24 trust
  screen emitted 1,889 bytes with no completed synchronized frame; synchronous
  81→80 nudge emitted zero bytes; sustained 120×40 resize emitted 2,586 bytes.
  `q` quit, exit 0, with no instruction or model turn. The internal signal
  handling is not inferred. Native redraw alone cannot ensure join visibility.
- The new unframed/no-redraw substitute reproduced blank joins in both modes
  before product changes. Reuse the existing `KeptClientScreen` model with
  pinned xterm serialization; replay dimensions and ANSI current viewport to
  the joining socket before live output, then fit the browser panel. Existing
  sockets receive only live output; incomplete paints stay incomplete.
- Accepted proof: `npm run test:dashboard -- dashboard/tests/agent-terminal-cursor-trust-join.spec.ts --reporter=list`
  passed 4 tests after the 2 native-shaped RED failures. The same sole client
  survives reconnect, first input stays uncertain and no instruction is typed.
- `npm run test:dashboard -- 'dashboard/tests/.*terminal.*\.spec\.ts' dashboard/tests/claude-prompt.spec.ts dashboard/tests/kept-client-screen-replay.spec.ts dashboard/tests/joined-sockets-replay.spec.ts --reporter=list`
  passed 133 tests in 48.1s. Inspected browser trust-page assertions observe
  rendered prompt/choices, rendition, hidden cursor, fitting without temporary
  resize, reconnect and input. Screen replay tests observe both buffers,
  positioned cursor/pending wrap, resized current viewport and incomplete
  frames. Socket replay tests observe live ordering and admission race.
  All three hosts' shared terminal consumers ran; no known consumer is unrun.
- Diagnosed failures: fixture-reported dimensions were stale stdout properties,
  not kernel dimension proof; that unrelated assertion was removed. Serializer
  full-row positioned cursor needed explicit positioning while preserving wrap.
  Admission had to preserve its replay gate. Two prior native-output equality
  assertions now compare the common live suffix after new-socket-only replay.
  Each affected final observation passed. `npm ci` on the new lock and final
  `npm run --silent typecheck:dashboard` passed. Current viewport is the promise;
  history replay is not added.
  The accepted native capture and its clean temporary fixture worktree were
  removed; the execution checkout is retained.
  Independent refactor completed: shared control type and extracted registry
  options preserve the accepted boundaries; typecheck passed. Formatter's
  unused-type finding was repaired, and final `npm run format` passed.

### 2. An unanswered trust prompt is named where the developer looks
Type: Behavior
Status: planned
Proof: extend the launch-wait and Startup recovery specs for Cursor with the
substitute trust screen; then the whole dashboard suite and `npm test`.

Behavior: the launch wait ends while the held screen shows the trust prompt →
the launch answer, Startup recovery and the session entry say Cursor is
waiting for workspace trust and that it is answered in the session's
terminal. The developer answers there → the kept instruction is written and
the first input reads confirmed. A wait that ends on any other screen keeps
today's wording.

### 3. Cursor's real trust prompt is seen and answered from the dashboard
Type: Behavior
Status: planned
Proof: one paid native journey, manually triggered or explicitly authorized,
against a dashboard deployment carrying slices 1 and 2: Start session ·
Isolated workspace on Cursor in a project, creating a worktree Cursor has not
trusted.

Behavior: the dashboard names workspace trust, the terminal shows Cursor's
prompt, answering it delivers the Established session block, and the record
confirms the first input. Record the Cursor version, dashboard revision,
launch and observed result in this plan, and in plan 301 where its slice 3
waits on this evidence.

## Story obligations

### G1. Native empty-screen cause and current-screen repair remain unresolved
Reported: slice 1 — "Cause of the native empty joined screen remains unknown; current-screen replay repair remains unimplemented."
Story clause: "Opening that session's terminal shows the prompt the client currently holds."
Disposition: proved by slice 1: dashboard/tests/agent-terminal-cursor-trust-join.spec.ts and agent-terminal-cursor-trust-page.spec.ts prompt visibility assertions

### G2. Trust explanation and first-input confirmation await slice 2
Reported: slice 1 — "Timeout trust wording and developer answer → first-input confirmation remain slice 2."
Story clause: "When the launch wait ends while the kept Cursor client shows its workspace trust prompt, the launch answer, Startup recovery and the session entry say that Cursor is waiting for workspace trust and that it is answered in the session's terminal."
Disposition: receiving slice 2

### G3. Rendered dashboard and native Cursor proof await slice 3
Reported: slice 1 — "This raw-socket substitute proof establishes neither native acceptance nor page rendering."
Story clause: "A developer who starts a Cursor session in a workspace Cursor has not trusted learns from the dashboard that Cursor is waiting for workspace trust, sees that prompt in the session's terminal, and gets the first input delivered once they answer it."
Disposition: receiving slice 3
