---
id: SEED-011
status: active
planted: 2026-09-16
planted_during: Plan 052 Trunk Mode execution
trigger_when: Cursor execute-plan cannot arm CI observation after a mailbox probe
scope: small
---

# SEED-011: Make Cursor CI observation attach after a mailbox probe

## Why This Matters

A developer executing planned work in Cursor needs CI failures delivered into
the same coordinator session. The mailbox probe is supposed to prove the host
bridge, then the hook must add `CI_MONITOR_READY` so observation can start.
Without that, pushes remain unobserved even when GitHub Actions runs.

## Alternatives and Decision

Queue this as first-priority product work rather than a ten-minute bounded
repair: it needs native Cursor hook binding (`generation_id`), and the same
gap already recurred. Do not rewrite `.cursor/hooks.json` from execute-plan or
replace observation with AI polling. Following the unavailable-bridge path is
correct until this story lands.

## Stories

<a id="attach-cursor-ci-observation"></a>

### 1. Attach Cursor CI observation after a mailbox probe

**Status:** Backlog; first priority. Captured 2026-09-16 from Plan 052 and
[DD-047](../../DearDough.md). Not planned.

**Goal:** A developer executing planned work in Cursor gets host
`CI_MONITOR_READY` after a harmless mailbox probe, so execute-plan can arm one
observer and handle delivered CI failures without waiting for CI.

#### Scope and required behavior

- After `ci-mailbox.mjs probe` from the execution checkout prints a
  `CI_OBSERVER` receipt, the Cursor host hook adds separate `CI_MONITOR_READY`
  context to the coordinator session when managed hooks are registered and the
  session can run them.
- A receipt alone still does not prove readiness. Execute-plan still refuses to
  treat the probe directory as an armed observer.
- If readiness is genuinely unavailable (disabled hooks, missing
  `generation_id`, untrusted workspace), report unavailable coverage once and
  continue; do not rewrite host settings from execute-plan.
- Do not wait for CI. Do not invent a second notification framework.

**Deferred:** Proving Claude Code and Codex bridges in the same delivery;
changing GitHub Actions; installing unreleased guidance in client projects.

#### Key examples

1. **Ready session:** Managed Cursor hooks are registered. Probe prints
   `CI_OBSERVER {directory: ...}`. The next host-hook context includes
   `CI_MONITOR_READY`. Execute-plan starts the observer for the authorized
   branch and can register later pushes.
2. **Current defect:** Probe from
   `.worktrees/052-introduce-trunk-mode` printed
   `CI_OBSERVER {"directory":"/tmp/dough-ci-501/watch-widqgL"}`. No
   `CI_MONITOR_READY` arrived. Observation was not started. Pushes on
   `quick/052-introduce-trunk-mode` are `pendingCi: unobserved`.
3. **Recurrence:** The same probe/receipt/no-READY sequence occurred on
   2026-09-16 for `quick/051-guide-manual-exploration` (DearDough DD-047,
   probe directory `/tmp/dough-ci-501/watch-P9o15E`).

**Evaluation:** In a real Cursor coordinator session with registered hooks, a
probe is followed by `CI_MONITOR_READY` without editing host JSON from
execute-plan. A session that cannot run hooks still reports unavailable
coverage instead of claiming observation.

**Evidence already in hand:** Plan 052 execution identity; DD-047; adapter
contract in `dough-execute-plan/references/ci-notify-hosts.md`. Remaining
uncertainty: whether Cursor failed to bind `generation_id`, the hook did not
run, or another host-delivery gap.

**Depends on:** none as a product prerequisite. Plan 052 Trunk Mode remains
Taken and is not this story.

**Safe stopping point:** Cursor planned execution can arm observation when
hooks are able to run. Other hosts can stay on their existing evidence.
