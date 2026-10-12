---
id: SEED-063
status: active
planted: 2026-09-30
planted_during: Terry's request to move dashboard-launched CI monitoring into the dashboard
trigger_when: Execution or wrap-up should end its turn while background CI monitoring can wake the owning session on failure
scope: story
---

# SEED-063: Background CI monitoring and failure delivery

## Why This Matters

A developer should not keep an agent waiting for CI after execution or wrap-up.
Background monitoring must retain responsibility for published work and wake
the same session when failure needs handling, whether the session began in
the dashboard or directly. The reduced story starts with live Claude Code and reuses existing
observation and coordinated GitHub demand.

## Story

<a id="background-ci-failure-delivery"></a>

### Monitor CI in the background and wake execution or wrap-up sessions only on failure

**Identity:** SEED-063#background-ci-failure-delivery
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/299-background-ci-failure-delivery/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"4bab93d2a395ce6b45a49293d02340c617f650899733155b1bfd5f3af8c84e46","plan":"ebdbe863217673c598c006470ccdfe8262c9b26d76718380ede00eb404cf0d09"}}
```
**Slice plan:** [Background CI monitoring and failure delivery](../slice-plans/299-background-ci-failure-delivery/PLAN.md).

**Scope decision (2026-10-13):** Terry asked to reduce the scope and finish soon.
This supersedes the earlier all-host/all-form direction. Keep the established
Taken identity, workspace and delivered request-owner recovery; finish the
smallest useful background failure delivery path using existing machinery.
[Historical scope](../slice-plans/299-background-ci-failure-delivery/SCOPE-BEFORE-REDUCTION.md)
and native records preserve the broader investigation without requiring it here.

**Goal:** A still-running interactive Claude Code session can publish work,
report CI pending, and end its coding turn. During a bounded background window,
an actionable CI failure wakes that same session through its native hook under
its existing repair authority. Pending and success create no new turn.

**Scope:**

- **Live Claude Code only.** Direct interactive invocations use the existing
  installed owner-bound mailbox and detached observer. Automated dashboard
  runners are deferred with the other noninteractive forms. The
  exact original session, checkout and coordinator/child identity are retained.
  Continuation preserves conversation, workspace, permission policy and repair authority.
  Deliver to the exact enrolled coordinator.
- **Explicit handoff.** The final accepted, registered Story Branch publication
  may enter a ten-minute background window. The receipt says CI pending and
  retains the live session, observer and worktree; it does not say CI succeeded
  or authorize retirement. Late owned failure uses the existing repair guidance.
- **One existing observer.** Reuse managed publication registration, mailbox
  event ordering and the delivered GitHub request owner. Add no GitHub poller,
  second observer, general runtime or durable subscription registry.
- **Failure-only native wake.** Claude’s supported asyncRewake hook waits on
  local mailbox state after the turn ends. Pending or success never creates a new agent turn.
  Safe busy/approval/question handling and child isolation reuse accepted native
  feasibility. Installed integration must prove late failure delivery and silence
  for pending/success. Concurrent hooks cannot repeat an attempted failure.
- **Truthful limits.** Missing observation or delivery is visible, never success.
  Local status records expiry, cancellation and uncertain delivery. An uncertain
  native handoff is retained for attention rather than blindly resent. Explicit
  stop revokes waiting delivery. No cold-session resume or automatic rearming.
- **Existing behavior elsewhere.** Codex, Cursor, closed/print Claude sessions,
  Trunk Mode and ordinary wrap-up retain their existing bounded completion wait.
  Background handoff is only used after verifying the live Claude route. It
  does not change installation policy, host settings or repair permission.

**Excluded by the authorized reduction:** Codex/Cursor background delivery,
closed-session resume, automatic rearming, dashboard lifecycle/status integration,
full runtime replacement, ownership transfer, machine-reboot recovery, mixed-version
cutover, new authorization-change handling, and automatic resource retirement.
Restricted hosts that cannot run the existing observer or reach its request
owner are not newly supported. The former remaining runtime slices are deferred together. Their historical
requirements included “Installation and mixed-version startup must preserve one runtime owner.”,
“Changed authorization cannot reuse incompatible live acquisition answers” and
“The retained launcher restarts a failed runtime owner with fenced recovery.”
The independently delivered connectable-owner greeting recovery remains accepted.

**Key examples:**

1. A live Claude coordinator’s managed Story Branch publication is registered.
   It receives an explicit pending handoff receipt and ends its coding turn.
   A later actual CI failure wakes the same session with the failure evidence
   and existing repair instructions; its child does not receive that failure.
2. Pending CI and successful CI remain quiet. Success settles the waiter without
   generating a model turn, and the worktree stays available.
3. The session closes, the budget expires, or the mailbox is explicitly stopped.
   Delivery status names the limitation; no replacement session, success claim
   or resource retirement follows.
4. A duplicate native Stop hook observes an already attempted event and does
   not send it again. Uncertain output remains visible for attention.
5. Codex or Cursor execution uses its existing completion operation. This
   reduction promises no new background behavior for those hosts.

**Delivery and acceptance:** Retain G21’s accepted process-backed regression.
Use focused process-backed tests for the new handoff and local hook waiter,
including failure, success silence, expiry, cancellation, owner binding and
concurrent dispatch. One installed native Claude end-to-end case must cross
pending publication → foreground end → late provider CI failure → native wake
with retained context and repair instruction. Existing native feasibility is
reused rather than repeated across tools. [SEED-053](SEED-053-native-guidance-acceptance.md#background-ci-failure-wakeup)
records this limited acceptance under [ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md).
Paid native runs require explicit native-check authority; Terry’s standing
bounded-check authorization applies, outside routine CI.

<a id="request-owner-says-why"></a>

### A GitHub request or failed log that could not be read says why

**Identity:** SEED-063#request-owner-says-why
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/300-request-owner-says-why/PLAN.md"}
```
**Slice plan:** [Request owner says why](../slice-plans/300-request-owner-says-why/PLAN.md).

**Goal:** A developer or agent whose GitHub request never reached `gh`, or
whose failed-job log could not be read, is told the actual cause instead of
"gh failed" or an unbounded retry instruction. This bounded correction comes
from the retrospective of shared GitHub request admission, whose closed
story is recoverable at
`2d889140cd7bd390f5bbb6e775de1e690e65645b:.planning/seeds/SEED-063-dashboard-owned-ci-monitoring.md`.

**Scope:** The request owner's unreachable-owner causes and the diagnostic
entry's unavailable-log causes, with the guidance that names them; one shared
reading of the process table for the request owner and the CI mailbox; and
removal of request-rule proofs repeated across test layers. No new feature
promise.

## Breadcrumbs

- [Product backlog](../PRODUCT-BACKLOG.md).
- [Dashboard launch](../../dashboard/AGENT-LAUNCH.md) and
  [completion reporting](../../dashboard/AGENT-LAUNCH-COMPLETION.md).
- [GitHub request ownership and costs](../../dashboard/GITHUB-REQUESTS.md).
- [CI observation](../../src/skills/dough-execute-plan/references/ci-monitor.md),
  [completion mechanics](../../src/skills/dough-execute-plan/references/ci-completion-wait.md),
  and [wrap-up closure](../../src/skills/dough-execute-plan/references/wrap-up-closure-publication.md).
