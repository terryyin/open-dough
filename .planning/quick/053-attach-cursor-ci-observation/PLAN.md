# Attach Cursor CI observation after a mailbox probe

## Source

[SEED-011 Story 1](../../seeds/SEED-011-cursor-ci-observer-readiness.md#attach-cursor-ci-observation),
first backlog item. Captured from Plan 052 and [DD-047](../../../DearDough.md).
Refined 2026-09-17.

## Goal and scope

A developer executing planned Cursor work, including from a Trunk Mode
worktree, gets host `CI_MONITOR_READY` after a harmless mailbox probe, so
execute-plan can arm one observer without waiting for CI.

Include: probe from the execution checkout, including a Trunk Mode worktree,
while the coordinator's managed Cursor hooks may run in the originating
workspace; separate `CI_MONITOR_READY` context; start one observer for the
authorized branch after readiness; preserve receipt-is-not-an-observer,
unrelated-checkout refusal, and genuinely-unavailable reporting.

Exclude: rewriting `.cursor/hooks.json` from execute-plan; AI polling or a
second notification framework; waiting for CI; Claude Code and Codex native
proof; GitHub Actions changes; installing unreleased guidance in other
projects; richer missed-READY diagnosis; re-proving attached-observer failure
delivery, stop, and child `generation_id` isolation.

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
| Worktree probe yields host `CI_MONITOR_READY` when hooks can run | Slice 1 | Inexpensive: `node --test src/skills/dough-execute-plan/scripts/ci-cursor-worktree-hook.test.mjs` pass (coordinator). Setup: fixture originating git + `git worktree add` execution; deploy `.agents` runtime; originating `cwd` managed Cursor `postToolUse`. Observation: originating hook `additional_context` matches `/CI_MONITOR_READY/`. Native Cursor coordinator: still unproved — this session's installed originating `.agents` hook is not the `src/` change. |
| After READY, execute-plan can start one observer for the authorized branch | Slice 1 | Same focused test: start from worktree runtime; originating hook matches `/CI observer attached to this coordinator/`. Later push registration/stop: reuse existing same-checkout lifecycle tests. |
| Receipt is not an armed observer | Slice 1 | Same focused test: probe `request.probe === true`; READY context does not match attach. |
| Unrelated checkout mailbox is still another checkout | Slice 1 | Same focused test: unrelated probe into originating hook rejects `/CI mailbox belongs to another checkout/`. Launcher identity: `node --test src/skills/dough-execute-plan/scripts/ci-deployment-layout.test.mjs` (implementation report, pass 4). |
| Genuinely unavailable coverage reports once and continues | Slice 1 | `node --test src/skills/dough-execute-plan/scripts/ci-host-hook.test.mjs` (implementation report, pass 17) — missing `generation_id` / empty later deliveries; no host JSON rewrite. |

## Ordered slices

### 1. Attach READY after a worktree mailbox probe
Type: Behavior
Status: planned
Proof: Inexpensive contract accepted via
`node --test src/skills/dough-execute-plan/scripts/ci-cursor-worktree-hook.test.mjs`
(pass). Native Cursor coordinator READY after a worktree probe remains required
and unproved; do not mark this slice done.

Behavior: Given managed Cursor hooks registered on the originating project and
a session that can run them, when `ci-mailbox.mjs probe` runs from the
execution worktree through Shell, the next coordinator hook context includes
`CI_MONITOR_READY`, execute-plan may start one observer for the authorized
branch from that same execution runtime, and the probe receipt directory is
still not treated as that observer. A mailbox from an unrelated checkout still
fails as another checkout. Disabled hooks, missing `generation_id`, or an
untrusted workspace still yield unavailable coverage once with host settings
unchanged.

## Current decisions

- Change the existing mailbox-claim / checkout-identity rule so a worktree
  probe of this repository is visible to the originating workspace hook. Do not
  relax the launcher rule that probe/start must use the selected execution
  checkout's own runtime.
- Native Cursor evaluation stays in this slice (external session wait). Do not
  split a second acceptance story for the same READY outcome.
- Claude Code, Codex, and GitHub Actions remain out of this plan.

## Execution identity

- Mode: Story Branch Mode
- Originating checkout/branch: `/Users/terryyin/git/open-dough` `main` (claim `87db020`)
- Execution checkout/branch: `/Users/terryyin/git/open-dough/.worktrees/053-attach-cursor-ci-observation` `quick/053-attach-cursor-ci-observation`
- Integration target: `origin/main` (`terryyin/open-dough`)
- Authorized push destination: `origin` `quick/053-attach-cursor-ci-observation`
- CI source: GitHub Actions workflow `ci.yml` display name `CI`; observe `terryyin/open-dough` `quick/053-attach-cursor-ci-observation`
- Observer: unavailable. Probe from execution runtime printed `CI_OBSERVER {"directory":"/tmp/dough-ci-501/watch-YPwNFo"}`; host did not add `CI_MONITOR_READY`. Continue without promised monitoring; do not rewrite host settings.

## Learnings

- Mailbox claim fails when the hook `checkoutRoot` is the originating workspace
  and `request.root` is the execution worktree. Comparing
  `git rev-parse --git-common-dir` at each checkout (only when
  `--show-toplevel` is that root) accepts same-repo worktrees and still
  rejects unrelated clones.
- Native evaluation in this coordinator still runs the originating installed
  `.agents` hook, not unreleased `src/skills` scripts. Do not hand-sync
  installed copies or rewrite `.cursor/hooks.json` to complete that proof.

## Considered but excluded

- Rewriting `.cursor/hooks.json` from execute-plan to point at the worktree
  script.
- Treating the `CI_OBSERVER` receipt as readiness.
- Replacing hook delivery with model polling.
- Broadening mailbox identity to unrelated checkouts or other repositories.
- Re-proving the full Cursor CI lifecycle (failure delivery, stop, child
  `generation_id` isolation) beyond what READY-plus-start requires.
