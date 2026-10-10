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

<a id="recovery-holds-after-reuse-and-rerun"></a>

### Recovery holds after a path is reused and after finish reruns

**Identity:** SEED-121#recovery-holds-after-reuse-and-rerun
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/292-recovery-holds-after-reuse-and-rerun/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"5d2cac935977cff87e667072c36d6bb8dae8b2ff5611c7b162fede08c25590e9","plan":"c92052389b9224354a2a48d1930c9c6fb4688d4449838545f61415c66496437a"}}
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
