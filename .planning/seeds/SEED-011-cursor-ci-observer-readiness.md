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
repair: the same gap already recurred during worktree execution, and the adapter
must keep native Cursor hook delivery rather than a workaround. Do not rewrite
`.cursor/hooks.json` from execute-plan or replace observation with AI polling.
Following the unavailable-bridge path is correct until this story lands.

## Stories

<a id="attach-cursor-ci-observation"></a>

### 1. Attach Cursor CI observation after a mailbox probe

**Status:** Refined 2026-09-17; first backlog priority. Planned at
`.planning/quick/053-attach-cursor-ci-observation/PLAN.md`. No remaining
story-scope open questions.

**Goal:** A developer executing planned Cursor work, including from a Trunk
Mode worktree, gets host `CI_MONITOR_READY` after a harmless mailbox probe, so
execute-plan can arm one observer without waiting for CI.

#### Scope

**Required behavior**

- After `ci-mailbox.mjs probe` from the execution checkout prints a
  `CI_OBSERVER` receipt, the Cursor host hook adds separate `CI_MONITOR_READY`
  context to the coordinator session when managed hooks are registered and the
  session can run them.
- The promised environment is planned Cursor execution, including Trunk Mode
  worktrees. The coordinator session may keep the originating project as its
  workspace while the probe runs from the execution worktree. Success only when
  probing from the main checkout does not close this story.
- After that readiness, execute-plan may start the observer for the authorized
  branch and register later pushes. Existing attached-observer failure delivery
  stays as already proved; this story does not re-prove the full CI lifecycle.

**Rejection constraints** (independent product requirements)

- A receipt alone still does not prove readiness. Execute-plan still refuses to
  treat the probe directory as an armed observer.
- A mailbox from an unrelated checkout still belongs to another checkout. A
  Trunk Mode worktree of this repository is not that case.
- Do not rewrite `.cursor/hooks.json` or other host settings from execute-plan.
- Do not wait for CI. Do not invent a second notification framework. Do not
  replace observation with AI polling.

**Unavailable coverage** (preserve; not a new promise)

- If readiness is genuinely unavailable (disabled hooks, missing
  `generation_id`, untrusted workspace), report unavailable coverage once and
  continue.

**Deferred:** Proving Claude Code and Codex bridges in the same delivery;
changing GitHub Actions; installing unreleased guidance in other projects;
richer diagnosis of a missed READY beyond the adapter's existing notes.

**Assumptions resolved in refinement**

- Why READY was missing in the recorded sessions (`generation_id` bind versus
  hook not run versus checkout/delivery mismatch) is implementation
  investigation, not a remaining scope question.
- Native Cursor coordinator proof is this story's evaluation: this is host-bridge
  integration, not a skill-only change that can finish from substitute payloads
  alone. Inexpensive tests must still cover the actual probe/hook contract once
  known. Claude Code and Codex native rechecks stay deferred.

#### Key examples

1. **Ready worktree session:** Managed Cursor hooks are registered and the
   session can run them. Probe from the execution worktree prints
   `CI_OBSERVER {directory: ...}`. The next host-hook context in the coordinator
   includes `CI_MONITOR_READY`. Execute-plan starts the observer for the
   authorized branch and can register later pushes. Host JSON is unchanged.
2. **Receipt is not an observer:** The same probe prints a receipt, but
   execute-plan still does not treat that directory as an armed observer until
   `CI_MONITOR_READY` arrives.
3. **Genuinely unavailable:** Hooks are disabled, `generation_id` is missing, or
   the workspace is untrusted. Execute-plan reports unavailable coverage once and
   continues without rewriting host settings or claiming observation.
4. **Unrelated checkout:** A probe mailbox whose root is a different repository
   still fails as another checkout. Execute-plan does not arm from it. A worktree
   of this repository is not that case.

**Evaluation:** In a real Cursor coordinator session with registered hooks, a
probe from the execution worktree is followed by `CI_MONITOR_READY` without
editing host JSON from execute-plan, and execute-plan can then arm one observer.
A session that cannot run hooks still reports unavailable coverage instead of
claiming observation.

**Evidence already in hand:** Plan 052 execution identity; DD-047; adapter
contract in `dough-execute-plan/references/ci-notify-hosts.md`. Recorded misses:
`.worktrees/052-introduce-trunk-mode` → `/tmp/dough-ci-501/watch-widqgL`;
`quick/051-guide-manual-exploration` → `/tmp/dough-ci-501/watch-P9o15E`.

**Depends on:** none as a product prerequisite. Trunk Mode is already on trunk;
recover the spent story from `ef6a59c:.planning/seeds/SEED-008-worktree-branch-trunk-sync.md#introduce-trunk-mode`.

**Safe stopping point:** Cursor planned execution can arm observation when
hooks are able to run, including from an execution worktree. Other hosts can
stay on their existing evidence.
