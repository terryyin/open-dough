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
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** Resolve the remaining reported dashboard launch failures: establish
whether initial desktop ownership violates the intended continuation behavior,
and preserve one preparation owner when retrying a failed launch.

**Scope:** Investigate transfer to the Codex desktop app and reuse of preparation
after native refusal for dashboard-started refinement. Preserve the original conversation,
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

**Remaining uncertainty:** The desktop ownership contract during an active first
turn, whether the initial refusal remains reproducible, and how retry should
reconcile a saved preparation whose workspace is missing without publishing a
second owner. The daemon creation failure has been causally reproduced and repaired.

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

**Repair boundary:** Terry authorized landing the supported creation repair on
main on 2026-10-01. The bug-fixing workflow supplies one bounded planless repair,
with a ten-minute hard limit and no replanning. Starting from a stable home
directory and preserving a bounded native refusal message address the confirmed
startup defect. They do not repair or establish the desktop handoff.

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

**Remaining work and disposition:** Establish whether desktop continuation is
blocked during an active initial turn, repairing any confirmed violation; repair
or safely reconcile preparation reuse after a failed launch. The completed
daemon repair is retained in Git. Terry requested removal from Taken after
landing; the unresolved remainder returns to Backlog and its retired execution
claim is released. Do not treat that return as readiness or start execution.

**Acceptance examples:** A developer launches refinement and answers its questions
in the original desktop conversation; a second story launches independently.
If native creation is refused, the dashboard preserves the preparation and reports
actionable native evidence without claiming a conversation or accepted input.
Retry preserves the same preparation owner and workspace, or explains the
required reconciliation when they cannot be reused. A missing workspace and a
saved preparation must not produce competing published assignments.
