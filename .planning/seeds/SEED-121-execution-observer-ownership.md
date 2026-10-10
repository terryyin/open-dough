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

<a id="finish-retirement-without-verdict"></a>

### Finish retires the worktree only by a decided rule when CI gave no verdict

**Identity:** SEED-121#finish-retirement-without-verdict
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** A developer whose coordinator's `finish` completes the final closure
without a CI verdict knows what happens to the execution worktree and branch
by a rule the product states and tests, so retirement never removes them on
an unobserved closure by default.

**Scope:** Read from the code on 2026-10-11, not exercised:
`receiptPermitsRetirement` in
[trunk closure](../../src/skills/dough-story-wrap-up/scripts/trunk-closure.mjs)
permits retirement on any completion receipt without a `failure` verdict whose
shutdown is confirmed. A live observer's unresolved receipt, such as the
ten-minute `timeout`, would therefore retire the worktree with no CI verdict
for the closure. No test or guidance pins that outcome. An ended observer's
record no longer reaches it: `finish` selects an ended observer only by its
recorded verdict.

The decision to refine: whether retirement requires a `success` verdict, with
an unresolved receipt keeping the worktree and branch under `step:
"completion"`, or whether retiring on an unresolved receipt is intended and
is then stated in
[wrap-up closure publication](../../src/skills/dough-execute-plan/references/wrap-up-closure-publication.md)
and pinned by a journey. The first step of refinement is a journey through the
installed `finish` that shows today's outcome.

## Breadcrumbs

- Terry's reported misregistration and explicit request to queue confirmed
  work first, commit on main, and sync with origin, 2026-10-08.
- [Managed observation](../../src/skills/dough-execute-plan/scripts/execution-increment-observation.mjs).
- [Mailbox matching](../../src/skills/dough-execute-plan/scripts/ci-mailbox-match.mjs).
- [Mailbox location and access](../../src/skills/dough-execute-plan/scripts/ci-mailbox-location.mjs).
- [Managed delivery](../../src/skills/dough-execute-plan/scripts/execution-increment-delivery.mjs).
- [Resume ownership coverage](../../src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery-resume-ownership.test.mjs).
