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

<a id="recovery-steps-reach-their-observer"></a>

### Recovery steps reach the observer they name

**Identity:** SEED-121#recovery-steps-reach-their-observer
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/291-recovery-steps-reach-their-observer/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"c9771c42cdec0b54b84e15ce36a186313d55e06220c548f08497671e030e5dea","plan":"123cd2ab3692ef7981d5945d9ea9bb7a803d576834a26af64b175c11cd03f53b"}}
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
- Excluded: which observer an ambient-identity `finish` rerun may use after
  retirement, and what the native closure cases assert. Each waits for a
  developer decision recorded in the plan.

<a id="recovery-holds-after-reuse-and-rerun"></a>

### Recovery holds after a path is reused and after finish reruns

**Identity:** SEED-121#recovery-holds-after-reuse-and-rerun
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/292-recovery-holds-after-reuse-and-rerun/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"5d2cac935977cff87e667072c36d6bb8dae8b2ff5611c7b162fede08c25590e9","plan":"cebb64a26820c321211ceddfc5b06b6e5c93db09b74a70ae1203956352c4f43f"}}
```
**Slice plan:** [Recovery holds after a path is reused and after finish reruns](../slice-plans/292-recovery-holds-after-reuse-and-rerun/PLAN.md).

**Goal:** A coordinator recovering an ended observer keeps reaching it when
the removed worktree's path exists again, and a `finish` rerun settles on the
observer that already completed the final closure. This corrects residue the
recovery-steps correction left; it adds no feature promise.

**Scope:**

- A mailbox that recorded its arming identity is read by that identity
  whatever its recorded path has become, and a different repository at that
  path is refused.
- A `finish` rerun whose coordinator holds several ended observers of the
  final closure, one of which completed it, repeats completion on that one.
- The guidance rows and tests the recovery-steps correction left inexact or
  tied to wording.
- Excluded: which observer
  `finish` prefers when one ended observer covers the closure beside a live
  one that does not, which observer an ambient-identity `finish` rerun may use
  after retirement, and what the native closure cases assert. Each waits for a
  developer decision recorded in the plan.

## Breadcrumbs

- Terry's reported misregistration and explicit request to queue confirmed
  work first, commit on main, and sync with origin, 2026-10-08.
- [Managed observation](../../src/skills/dough-execute-plan/scripts/execution-increment-observation.mjs).
- [Mailbox matching](../../src/skills/dough-execute-plan/scripts/ci-mailbox-match.mjs).
- [Mailbox location and access](../../src/skills/dough-execute-plan/scripts/ci-mailbox-location.mjs).
- [Managed delivery](../../src/skills/dough-execute-plan/scripts/execution-increment-delivery.mjs).
- [Resume ownership coverage](../../src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery-resume-ownership.test.mjs).
