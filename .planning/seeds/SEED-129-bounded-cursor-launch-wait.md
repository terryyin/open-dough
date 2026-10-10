---
id: SEED-129
status: active
planted: 2026-10-10
planted_during: Terry's decision while closing SEED-008#bound-managed-git-transport
trigger_when: A developer starts or recovers a Cursor session from the dashboard and Cursor never shows that it took the instruction
scope: story
---

# SEED-129: A Cursor launch or recover wait ends within a bound

## Why This Matters

When the dashboard starts or recovers a Cursor session, the machine-local
Cursor runner's keep path waits on `LaunchInstruction` until a ready screen,
a finished synchronized frame that answers a submitted paste chip, or client
exit (`dashboard/server/launchInstruction.ts`,
`dashboard/server/terminalKeep.ts`). That wait itself has no deadline.

Start already races the keep call against the shared launch wait
(`DOUGH_LAUNCH_TIMEOUT_MS`, default 30s in `dashboard/server/launchRun.ts`).
When that abort wins while keep is still open, Cursor Start today returns
`launched` rather than an uncertain timed-out answer
(`dashboard/server/hosts/cursor/launch.ts`). Developer-requested Recover
(`dashboard/server/hosts/cursor/recover.ts` via `/__agent-launch/recover`)
awaits the same keep with no deadline, so a silent live client holds Recover
indefinitely.

No occurrence of an unbounded Recover wait is recorded. The paste-chip settle
path became reachable on 2026-10-10 (`d1aec794`): a pasted instruction settles
only after Cursor answers the submitted chip, which lengthens the keep wait on
an already-confirmed first-input record when the client stays silent.

## Story

<a id="bounded-cursor-launch-wait"></a>

### A Cursor launch or recover wait ends within a bound with a clear message

**Identity:** SEED-129#bounded-cursor-launch-wait

**Slice plan:** [A Cursor launch or recover wait ends within a bound with a clear message](../slice-plans/283-bounded-cursor-launch-wait/PLAN.md).

```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/283-bounded-cursor-launch-wait/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"021a4e17408b8399334408b143089331bcf5f1cd50769429d47bfe46635605f6","plan":"59732934d1644e427934b1d09d11861f4c68d153e8825cae0baf9505517d4842"}}
```

**Beneficiary:** A developer who starts or recovers a Cursor session from the
Open Dough dashboard.

**Goal:** When Cursor stays alive but never shows that it took the launch or
recovery instruction, the dashboard's Start or Recover answers within the
existing shared launch wait bound with a message that says Cursor did not show
it took the instruction in time and what the developer can do next (open the
kept session's terminal, or continue from the recorded resume / try Recover
again), instead of waiting indefinitely or treating an expired keep wait as an
ordinary successful launch. A Cursor that answers in ordinary time starts or
recovers exactly as today.

**Scope:**

- Both Cursor keep waits that today block on `LaunchInstruction.firstScreen`:
  a screen that is never ready, and a pasted instruction whose paste chip was
  submitted (Enter written) but never answered by a later paint or exit.
- Bound: the existing shared launch wait (`DOUGH_LAUNCH_TIMEOUT_MS`, default
  30 seconds). Start already uses it; Recover must use the same bound.
- Start: when that bound expires before the keep settles, answer `uncertain`
  with reason `timed-out` and an explanation that Cursor did not show it took
  the instruction in time, that the session remains kept when the runner holds
  it, and how to continue (terminal or recorded resume). Do not answer
  `launched` for that expiry.
- Recover: when that bound expires before the keep settles, answer `failed`
  with the same class of explanation (Recover's answer shape has no
  `uncertain`). Do not leave the Recover HTTP wait open past the bound.
- Held client: expiry does not hang up or kill the Cursor client; the launch
  wait's abort already leaves it running.
- Launch record: expiry does not invent or revoke first-input state. An
  instruction not yet written stays uncertain; a paste chip whose Enter was
  already written may already be confirmed and stays that way. Acceptance of a
  later screen after Start returned remains as today.
- Deferred: changing when paste-chip Enter confirms first input; bounding
  non-Cursor hosts; a dashboard control to stop the runner; new ADR work.

**Key examples:**

1. A Cursor client accepts Enter on the paste chip and then never repaints and
   never exits → Start answers within the launch wait bound as `uncertain` /
   `timed-out` with the unconfirmed-delivery explanation; the client stays
   kept; first input remains whatever was already recorded (confirmed after
   Enter). Recover on the same silent keep answers `failed` with the same
   class of explanation within the same bound.
2. A Cursor client is never ready and never exits → Start and Recover answer
   the same way within the bound; first input stays uncertain when nothing was
   written.
3. A Cursor client becomes ready and shows it took the instruction in ordinary
   time → Start returns `launched` and Recover returns `recovered` as today,
   with no such timed-out or failed expiry message.

**Investigation (facts vs hypotheses):**

| Claim | Status | Source / observation |
| --- | --- | --- |
| `LaunchInstruction` / keep has no internal deadline | Fact | `launchInstruction.ts` settles only via announce paths; `terminalKeep.ts` awaits `firstScreen` with no timer |
| Start applies a shared launch wait (default 30s) | Fact | `launchRun.ts` `launchTimeoutMs()` / `DOUGH_LAUNCH_TIMEOUT_MS` |
| Start abort during an open Cursor keep returns `launched` | Fact | `hosts/cursor/launch.ts` races keep vs abort; `"aborted"` falls through to `launched` |
| Recover keep wait is unbounded | Fact | `recoverCursorSession` → `keepCursorClient` with no signal or timer; `postJson` for `/keep` has no request timeout |
| Abort does not kill the kept client | Fact | `hosts/cursor/launch.ts` header comment; `AGENT-LAUNCH-HOSTS.md` |
| Paste-chip Enter confirms first input before keep settles | Fact | `onEntered` runs on chip submit; announce waits for a later answering paint |
| Exact developer-facing sentence beyond the timed-out class | Settled in scope | Match existing Cursor timed-out wording pattern (`Cursor did not answer in time…` / kept session + continue), specialized to instruction delivery |

**Architecture:**

No new consequential architecture. Relevant records:

- [ADR 0001](../../docs/adrs/0001-ubiquitous-language-accepted.md) (Accepted) —
  keep existing launch vocabulary (`uncertain`, `timed-out`, kept session).
- [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture.md)
  (Proposed, non-binding) — launch remains local operational evidence and does
  not settle story state; this story only bounds that local wait's answer.

No Accepted ADR conflicts with bounding the Cursor keep wait or answering
expiry as uncertain/failed while leaving the client kept.
