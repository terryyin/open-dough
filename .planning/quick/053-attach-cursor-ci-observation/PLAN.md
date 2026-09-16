# Attach Cursor CI observation after a mailbox probe

## Source

[SEED-011 Story 1](../../seeds/SEED-011-cursor-ci-observer-readiness.md#attach-cursor-ci-observation),
first backlog item. Captured from Plan 052 and [DD-047](../../../DearDough.md).
Refined 2026-09-17.

## Goal and scope

A developer executing planned work in Cursor gets host `CI_MONITOR_READY` after
a harmless mailbox probe, so execute-plan can arm one observer without waiting
for CI.

Include: probe from the execution checkout, including a Trunk Mode worktree,
while the coordinator's managed Cursor hooks may run in the originating
workspace; separate `CI_MONITOR_READY` context; start one observer for the
authorized branch after readiness; preserve receipt-is-not-an-observer and
genuinely-unavailable reporting.

Exclude: rewriting `.cursor/hooks.json` from execute-plan; AI polling or a
second notification framework; waiting for CI; Claude Code and Codex native
proof; GitHub Actions changes; installing unreleased guidance in other
projects; richer missed-READY diagnosis.

## Assumptions

- The existing Cursor adapter (`ci-host-hook.mjs`, mailbox, managed
  `cursor-hooks.json`) remains the solution. Change it so the worktree probe
  can attach; do not add another bridge.
- Launcher identity stays: probe and start still use the execution checkout's
  own installed runtime. This plan does not allow the originating checkout's
  skill path to launch against a different checkout.
- Leading defect: the workspace hook's `checkoutRoot` is the originating
  project, while a worktree probe records that worktree as `request.root`, so
  `readMailbox` refuses the receipt and the hook never injects
  `CI_MONITOR_READY`. Same-checkout unit tests therefore stay green while
  planned worktree execution fails.
- Cursor `postToolUse` still supplies `generation_id`, `tool_name` `Shell`, and
  JSON-stringified `tool_output` with `stdout` or `output` text containing the
  receipt, matching current docs and fixtures.

## PFE and architecture

Reuse and change the current host-hook plus mailbox claim path. Do not
relocate notification into execute-plan prose, a polling loop, or a new
mailbox format.

Relevant current Accepted ADRs:

- [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md) —
  inexpensive tests cover this Cursor probe/hook contract; native Cursor
  coordinator evaluation is this story's host-integration proof; do not infer
  Claude or Codex success.
- [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
  — one shared observer behavior with only the Cursor workspace/worktree
  adaptation required.
- [ADR 0004](../../../docs/adrs/0004-client-installation-and-update-accepted.md)
  — execute-plan still does not rewrite installed host settings.

No new North Star topic: this is a gap in the existing adapter under already
adopted worktree execution, not a new product boundary.

## Outside-in proof

| Promise | Owner | Observable proof |
| --- | --- | --- |
| Worktree probe yields host `CI_MONITOR_READY` when hooks can run | Slice 1 | Focused failing-then-green hook delivery: probe with the execution worktree runtime, feed the receipt to the originating-workspace Cursor hook, match `CI_MONITOR_READY`. Native Cursor coordinator session: probe from an execution worktree, then observe `CI_MONITOR_READY` without editing host JSON. |
| After READY, execute-plan can start one observer for the authorized branch | Slice 1 | Same focused path starts with the worktree runtime after READY; hook can add `CI observer attached to this coordinator`. Reuse existing same-checkout lifecycle proof for later push registration and stop. |
| Receipt is not an armed observer | Slice 1 | Execute-plan / adapter still refuses to treat the probe directory as the execution observer (existing readiness-vs-receipt distinction). |
| Genuinely unavailable coverage reports once and continues | Slice 1 | Existing missing-`generation_id` / empty-hook tests stay green; no host JSON rewrite. |

## Ordered slices

### 1. Attach READY after a worktree mailbox probe
Type: Behavior
Status: planned
Proof: Focused Node test of originating-workspace Cursor hook + execution-worktree probe receipt (and subsequent start attachment). Keep
`src/skills/dough-execute-plan/scripts/ci-host-hook.test.mjs`,
`ci-cursor-lifecycle.test.mjs`, and
`ci-deployment-layout.test.mjs` (launcher identity) green. Native Cursor
coordinator: from an execution worktree, `node <execution-skill>/scripts/ci-mailbox.mjs probe`
is followed by `CI_MONITOR_READY` without editing `.cursor/hooks.json`.

Behavior: Given managed Cursor hooks registered on the originating project and
a session that can run them, when `ci-mailbox.mjs probe` runs from the
execution worktree through Shell, the next coordinator hook context includes
`CI_MONITOR_READY`, execute-plan may start one observer for the authorized
branch from that same execution runtime, and the probe receipt directory is
still not treated as that observer. Disabled hooks, missing `generation_id`, or
an untrusted workspace still yield unavailable coverage once with host settings
unchanged.

## Current decisions

- Change the existing mailbox-claim / checkout-identity rule so a worktree
  probe of this repository is visible to the originating workspace hook. Do not
  relax the launcher rule that probe/start must use the selected execution
  checkout's own runtime.
- Native Cursor evaluation stays in this slice (external session wait). Do not
  split a second acceptance story for the same READY outcome.
- Claude Code, Codex, and GitHub Actions remain out of this plan.

## Learnings

None yet.

## Considered but excluded

- Rewriting `.cursor/hooks.json` from execute-plan to point at the worktree
  script.
- Treating the `CI_OBSERVER` receipt as readiness.
- Replacing hook delivery with model polling.
- Broadening mailbox identity to unrelated checkouts or other repositories.
- Re-proving the full Cursor CI lifecycle (failure delivery, stop, child
  `generation_id` isolation) beyond what READY-plus-start requires.
