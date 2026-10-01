---
id: SEED-067
status: active
planted: 2026-10-01
scope: story
---

# SEED-067: Codex refinement launch reliability

## Story

<a id="resolve-codex-refinement-launch-failures"></a>

### Resolve remaining Codex refinement handoff and retry failures

**Identity:** SEED-067#resolve-codex-refinement-launch-failures
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/194-codex-refinement-handoff-retry/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"9810fb8eb1d1d7d208feb7cae8d4126ae4278dbcff2481b20b8c61339f4ed16f","plan":"4fd2289b3b900b0faafdcd7d1e2ff3aa4426a367ca0743fa6a0f6a304ae3a6f6"}}
```

**Goal:** Let Terry start refinement from the dashboard and continue the original
Codex conversation without forking it or creating competing preparation owners
when a launch fails and is retried.

**Scope:** Establish the initial desktop handoff's actual native ownership and
lifetime behavior, then repair a confirmed dashboard-caused continuation block.
Make a retry of a retained refinement start reuse its established preparation;
when its workspace or ownership evidence is missing or inconsistent, stop with
the context needed for explicit reconciliation. Keep the start recoverable and
make no replacement announcement, workspace, conversation or first input in
that stopped attempt. Preserve configured native settings and the existing
conservative first-input recovery rule.

Preserve Terry's original conversation, fork, existing workspaces and published
assignments. This story prevents another duplicate; it does not authorize
deleting either reported preparation assignment or reconstructing lost drafts.
Release of an existing assignment remains the developer's decision about its
exact allocation under the installed lost-workspace procedure.

**Deferred promises:** General desktop management, external conversation
discovery, live observation, embedded terminal, Mark as done and broader Codex
execution/ad hoc support remain in SEED-052 / plan 192. Session policy remains
in SEED-066 / plan 191; CI monitoring remains in SEED-063. The delivered daemon
startup repair is preserved rather than repeated. Concurrent turn submission is
governed by Codex's native behavior; this story does not invent that capability.

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

**Remaining uncertainty:** Desktop ownership and turn continuity while the
dashboard's native client remains connected, and whether that reproduces the
original refusal on the current runtime. This requires an early native probe;
a protocol substitute cannot establish it. If safe handoff cannot satisfy the
goal, stop the dependent repair and return the native limitation for a product
decision. The daemon creation failure has been causally reproduced and repaired.

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
- Before the repair, `dashboard/server/hosts/codex/rpc.ts` replaced native error details with a
  generic refusal. `launch.ts` then displays the creation refusal without its
  actionable cause. The daemon startup call inherits its caller's working
  directory; future startup should select a stable directory without changing
  each thread's requested workspace or configured policy.
- The separate desktop handoff remains unconfirmed: `launch.ts` hands its
  accepted connection to `conversation.ts`, which retains it until native
  `turn/completed` or failure. Documentation for unsubscribe establishes event
  subscription behavior, but does not establish desktop ownership transfer.
  Actual desktop continuation during an active turn remains required proof.
- At diagnosis, recovery required restarting the shared daemon from a stable directory.
  No original chat, fork, preparation file or assignment was changed by this investigation.
  At inspection the SEED-063 advertised workspace path was absent; its
  preparation owner must reconcile that independently rather than recreate it
  blindly.

**Delivered repair boundary:** Terry authorized and landed the bounded planless
creation repair on 2026-10-01. Its ten-minute limit belonged to that completed
attempt. Stable daemon startup and bounded native refusal details address the
confirmed startup defect; they do not establish the desktop handoff.

**Resolved portion and later observations:**

- The daemon startup repair is on main at `f68730d3232993aa40a3bdabdebc151b564fa894`.
  Nine focused launch tests, dashboard typecheck and exact-revision CI passed.
  Startup now uses the home directory and creation refusals expose a bounded
  native cause. Existing shared daemons require their own restart.
- A subsequent screenshot at `31dd4ab` showed the newly exposed configuration
  error and two Preparing profiles, bastiaan-chan and jacked-chan, for SEED-063.
  No first input had been submitted. A retry must reuse or explicitly reconcile
  the saved assignment; it must not silently add a competing preparation owner.
- Terry subsequently reported being able to connect and use conversation
  `01a0f519-5df4-71e1-84d4-a0ad1b2d54f2` for
  SEED-066#unattached-session-options. Its screenshot showed accepted first input
  and one Preparing owner. That establishes a successful later attempt, without
  proving when the original desktop refusal releases ownership.
- Read-only inspection after that report showed the running daemon's working
  directory as `/Users/terryyin`, confirming recovery from its deleted directory.
- During this refinement, at source revision `aeac68d810a07c5df97789f1edaebcdc751a4e66`,
  an isolated real Git/production preparation-script fixture announced Yui-chan
  for one queued story. Normal retry returned `continued`. After removing only
  that fixture's clean worktree and its branch, the same request announced
  Akiho-chan; both profiles remained published for that identity. This establishes
  a reproducible retry defect matching the reported duplicate-owner class. The
  precise disappearance of the real SEED-063 branch remains unestablished.
  The fixture was removed; no user assignment or workspace was changed.
- A disposable Playwright HTTP probe then followed the actual dashboard path:
  native creation refusal, retained start, removal of only the fixture workspace
  and branch, and retry. Retry returned `launched`, left two published preparation
  profiles for the same identity, and sent one `turn/start`. The native substitute
  supplied only RPC outcomes; the dashboard and installed preparation script
  created the duplicate themselves. The temporary probe was assessed and removed.

**Remaining work and disposition:** Establish whether desktop continuation is
blocked during an active initial turn, repairing any confirmed violation; repair
or safely reconcile preparation reuse after a failed launch. The completed
daemon repair is retained in Git. Terry requested removal from Taken after
landing; the unresolved remainder returns to Backlog and its retired execution
claim is released. Do not treat that return as readiness or start execution.

**Key examples:**

1. A dashboard refinement accepts its first input. Terry opens the original
   task in Codex desktop, follows its work, and answers its refinement question
   through that same native conversation when input is available. There is no
   fork, repeated first instruction or forced dashboard/server shutdown. The
   first turn and saved history survive the handoff.
2. Native creation refuses a prepared launch. The dashboard reports its bounded
   cause and retains the established agent, workspace and start. After recovery,
   retry (including after dashboard restart) continues that exact preparation,
   creates one conversation and submits the first input once.
3. After that refusal the saved preparation workspace is missing, or its local
   ownership record no longer matches the saved assignment. Retry reports the
   retained agent/workspace and need to reconcile. The same saved start and
   published profiles survive; there is no new announcement, replacement
   workspace, native thread or submitted input. Repeating retry stays safe.
4. Native creation or input acceptance has an uncertain result. Retry reconciles
   the recorded native identity and original input as today; it does not infer
   rejection from missing history or launch a replacement conversation. Another
   story can launch independently of the failed/handed-off one.
