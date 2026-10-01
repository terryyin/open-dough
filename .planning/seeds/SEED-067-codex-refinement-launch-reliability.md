---
id: SEED-067
status: active
planted: 2026-10-01
scope: story
---

# SEED-067: Codex refinement launch reliability

## Story

<a id="resolve-codex-refinement-launch-failures"></a>

### Resolve reported Codex refinement launch failures

**Identity:** SEED-067#resolve-codex-refinement-launch-failures
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planless","assessment":"not-ready","reasons":["The desktop ownership handoff is unproven; this increment covers only the confirmed creation startup defect, and recovery of the shared daemon still needs restart approval."],"basis":{"document":"a7b376180eadc9d0f5b9820f2c813f1e28f207576d25b4d93c2f5ee524d1cf87"}}
```

**Goal:** Diagnose the reported dashboard launch failures and resolve supported
violations of the intended launch and continuation behavior.

**Scope:** Investigate native conversation creation and transfer to the Codex
desktop app for dashboard-started refinement. Preserve the original conversation,
its fork, both preparation workspaces, their assignments, and configured Codex
settings. Do not expand into general desktop session management or CI monitoring.

**Expected:** Starting refinement creates a conversation with the first input
accepted. The developer can continue that same conversation in the Codex desktop
app, including answering refinement questions, without having to fork it.

**Reported actual and evidence:**

- The SEED-066 attempt created conversation
  `01a0f4e3-0f7f-79e0-9678-ad57dd19c824`. The desktop app initially refused
  interaction because another app had it open. Terry forked it; the original later
  became operable. The original first turn ran from 08:35:17 to 08:38:51 Singapore
  time on 2026-10-01 and asked refinement questions. These times are observed
  thread history; a causal relation to ownership release remains unconfirmed.
- A subsequent SEED-063 attempt at revision `f5d31a4` showed: “Codex refused to
  create a conversation. No first input was submitted.” It retained the Preparing
  assignment as bastiaan-chan and workspace
  `~/git/open-dough/.worktrees/monitor-ci-from-the-dashboard-and-deliver-its-st`.
  The first screenshot retained the SEED-066 Preparing assignment as ebacky-chan.

**Remaining uncertainty:** The native refusal's underlying reason, the desktop
ownership contract during an active first turn, reproducibility, and whether the
two failures share a cause. Investigation must establish scope before repair.

**Diagnosis observed on 2026-10-01:**

- A direct native `thread/start` against the shared endpoint, using this
  investigation's existing workspace, returned code `-32600` with
  `failed to load configuration: No such file or directory (os error 2)`.
  No conversation was created and no first input was submitted.
- Read-only `config/read` requests for the existing integration and investigation
  checkouts both returned code `-32603` with
  `failed to resolve feature override precedence: No such file or directory (os error 2)`.
- `lsof -a -p 7055 -d cwd` and the daemon management process 2905 showed their
  working directory as the retired story 189 workspace
  `/Users/terryyin/git/open-dough/.worktrees/start-codex-refinement-from-dashboard`.
  That path no longer exists. The daemon reports native version 0.159.3; the
  installed CLI is 0.157.0. Its directory was inherited during earlier native
  validation; deleting the owned story workspace left the shared service broken.
- An isolated app-server using that same native 0.159.3 executable reproduced the
  dependency causally: `config/read` succeeded before deleting only its own
  temporary working directory, then failed with the identical `-32603` error.
  `thread/start` subsequently returned the identical `-32600` error despite its
  requested workspace still existing. The isolated process and temporary fixture
  were stopped and removed; no turn or native conversation was created.
- `dashboard/server/hosts/codex/rpc.ts` replaces native error details with a
  generic refusal. `launch.ts` then displays the creation refusal without its
  actionable cause. The daemon startup call inherits its caller's working
  directory; future startup should select a stable directory without changing
  each thread's requested workspace or configured policy.
- The separate desktop handoff remains unconfirmed: `launch.ts` hands its
  accepted connection to `conversation.ts`, which retains it until native
  `turn/completed` or failure. Documentation for unsubscribe establishes event
  subscription behavior, but does not establish desktop ownership transfer.
  Actual desktop continuation during an active turn remains required proof.
- Recovery requires restarting the shared daemon from a stable directory. Terry
  has been asked because that action may interrupt other active chats; no restart
  has been performed. No original chat, fork, preparation file or assignment was
  changed. At inspection the SEED-063 advertised workspace path was absent; its
  preparation owner must reconcile that independently rather than recreate it
  blindly.

**Repair boundary:** Terry authorized landing the supported creation repair on
main on 2026-10-01. The bug-fixing workflow supplies one bounded planless repair,
with a ten-minute hard limit and no replanning. Starting from a stable home
directory and preserving a bounded native refusal message address the confirmed
startup defect. They do not repair or establish the desktop handoff.

**Remaining work:** Recover the shared daemon when authorized, then establish
and verify a safe desktop handoff. This admitted story remains Taken. The desktop
report is not resolved by the causal creation reproduction, and implementation
must not claim both failures repaired without their respective observations.

**Acceptance examples:** A developer launches refinement and answers its questions
in the original desktop conversation; a second story launches independently.
If native creation is refused, the dashboard preserves the preparation and reports
actionable native evidence without claiming a conversation or accepted input.
