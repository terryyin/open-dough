---
id: SEED-121
status: active
planted: 2026-10-08
planted_during: Terry's report of a trunk repair registering with another worktree's CI observer
trigger_when: Concurrent execution sessions observe the same repository and trunk branch
scope: story
---

# SEED-121: Execution delivery retains its CI observer owner

## Why This Matters

An agent publishing a Trunk Mode increment needs CI coverage and completion
through its own execution observer. Concurrent sessions share the repository
and target branch; attaching a revision to another session can leave the
publisher's completion gate without coverage and send CI events to the wrong
owner.

## Story

<a id="settle-observer-owner-edges"></a>

### Settle observer ownership at its recovery edges

**Identity:** SEED-121#settle-observer-owner-edges
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/288-observer-owner-edges/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"c31d068e415f6a8814dbe6a2aa0988f75060a3353f12b475ff7a64a8eee519c3","plan":"41667b7d56df8dfa9980b936671f2a81bcaa2fc412d2949641fa77b1143aeb7d"}}
```
**Slice plan:** [Observer ownership holds at its recovery edges](../slice-plans/288-observer-owner-edges/PLAN.md).

**Goal:** A coordinator whose observer ownership is verified keeps a usable
observer and truthful recovery guidance when its closure reruns after the
worktree is retired, when a call names another session, when it is a subagent
coordinator, and in the native closure harness. This corrects edges the
delivered ownership story left; it adds no feature promise.

**Scope:**

- A closure rerun after retirement reads the owner's observer whichever
  worktree armed it, and closure derives the owner the way delivery does.
- Gap reasons and guidance direct a caller only to an observer whose events it
  can receive, and name the session fields a subagent coordinator passes.
- The native closure harness arms and records observers as the guidance
  teaches, including a Codex stream.
- Delivery, resume, and closure share one gap vocabulary and one session-input
  parser; wording that still describes repository-and-branch matching goes.

<a id="recovery-steps-reach-their-observer"></a>

### Recovery steps reach the observer they name

**Identity:** SEED-121#recovery-steps-reach-their-observer
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/291-recovery-steps-reach-their-observer/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"ab7989767bd7b2dde84e54745b3ac337d1a838d8c5a05e4a837cad610bc10a0b","plan":"94d8584b1ef972f58d66a42a6b7696fc2cae25aa69a093b56a99c3429fee855c"}}
```
**Slice plan:** [Recovery steps reach the observer they name](../slice-plans/291-recovery-steps-reach-their-observer/PLAN.md).

**Goal:** A coordinator that follows a coverage gap's recovery step can carry
it out: the stop command reaches an observer armed from a worktree that is now
gone, and every gap reason ends in a step. This corrects residue the
recovery-edges correction left; it adds no feature promise.

**Scope:**

- The mailbox commands a recovery step names read an observer of the
  repository whichever of its worktrees armed it, also after that worktree was
  removed.
- Each gap reason `deliver`, `resume`, and `finish` can print ends in a
  recovery step, and `ownership` values keep one meaning per command.
- The closure rerun proofs keep one host for rules that do not differ by host.
- Excluded: what a Claude Code subagent coordinator passes as its identity,
  which observer an ambient-identity `finish` rerun may use after retirement,
  and what the native closure cases assert. Each waits for a developer
  decision recorded in the plan.

## Breadcrumbs

- Terry's reported misregistration and explicit request to queue confirmed
  work first, commit on main, and sync with origin, 2026-10-08.
- [Managed observation](../../src/skills/dough-execute-plan/scripts/execution-increment-observation.mjs).
- [Mailbox matching](../../src/skills/dough-execute-plan/scripts/ci-mailbox-match.mjs).
- [Mailbox location and access](../../src/skills/dough-execute-plan/scripts/ci-mailbox-location.mjs).
- [Managed delivery](../../src/skills/dough-execute-plan/scripts/execution-increment-delivery.mjs).
- [Resume ownership coverage](../../src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery-resume-ownership.test.mjs).
