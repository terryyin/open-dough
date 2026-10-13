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

Not yet established: why the joined terminal was empty while the client held
the trust prompt. Slice 1 settles it before any change to the terminal.

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
Status: planned
Proof: a new focused Playwright spec beside
`dashboard/tests/agent-terminal-cursor-launch-wait.spec.ts`, using the
existing substitute Cursor client, run with `--reporter=list`.

Behavior: a kept client drew a trust prompt and is waiting; the developer
opens that session's terminal → the terminal shows the prompt. This slice
starts by reproducing the empty screen with the substitute client. If it does
not reproduce there, record what differs from the native client and stop for
a decision before changing the terminal.

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
