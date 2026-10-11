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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/299-finish-retirement-success-verdict/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"5e5c9d5e8736d85f222fb0f581871cad134ce04c7be8b384e2cdf5d6a4dbf8f3","plan":"e299ce50a70603d9d4720541054b0ff4297c3c634896e3851551b0885877039f"}}
```

**Goal:** A developer whose coordinator's `finish` ends a Trunk Mode closure
without a CI verdict for the final closure keeps the execution worktree and
branch and is told why, so retirement follows only an observed `success` for
that closure, by a rule the product states and tests, and never an
unobserved closure by default.

**Scope:**

Decision: retirement requires a `success` verdict for the accepted final
closure with confirmed observer shutdown. An unresolved receipt keeps the
worktree and branch under `step: "completion"`. The alternative, retiring on an
unresolved receipt and stating that, contradicts the goal above and the shared
completion rule in
[CI observation](../../src/skills/dough-execute-plan/references/ci-monitor.md#await-the-applicable-revision-at-completion),
where only a successful receipt with confirmed shutdown satisfies the
observation and an unresolved receipt establishes no success. The Taken
[dashboard-owned CI monitoring](SEED-063-dashboard-owned-ci-monitoring.md#dashboard-owned-ci-monitoring)
plan records the same rule, positive settlement, for the path that later
replaces this one.

Observed on 2026-10-11 through the installed `finish` in the closure test
fixture: a live observer whose execution observation budget expired before CI
reported anything for the final closure gave a completion receipt with no
verdict (`unresolvedReason: "observation_unavailable"`, `detail:
"monitor_unavailable"`) and `shutdown.status: "confirmed"`; `finish` answered
`ok: true`, `step: "done"`, exit 0, and removed the worktree and branch.
`receiptPermitsRetirement` in
[trunk closure](../../src/skills/dough-story-wrap-up/scripts/trunk-closure.mjs)
permits retirement on any receipt without a `failure` verdict whose shutdown is
confirmed, so the ten-minute `timeout` and every other unresolved receipt
retire the same way. No test pins either outcome.

Required behavior:

- `finish` retires the worktree and branch only when the completion receipt for
  the accepted final closure holds `verdict: "success"` and
  `shutdown.status: "confirmed"`. Dough Land's retirement core keeps its own
  containment and creation gates after that.
- Every other receipt stops at `step: "completion"` with `ok: false`, exit 1,
  `cleanup: "not-performed"`, the receipt in the result, and the worktree,
  branch, and both closure commits in place: a `failure` verdict, retained or
  unconfirmed shutdown, and every unresolved receipt (`timeout`,
  `observation_unavailable` in each of its details, `observation_cancelled`,
  `incomplete`, `missing_registration`, `evidence_unreadable`,
  `wait_cancelled`). The stop's `recovery` names the unresolved case: rerun
  `finish` to repeat completion on this coordinator's observer, or report the
  closure's coverage as lost.
- The product states the rule once where it is read:
  [wrap-up closure publication](../../src/skills/dough-execute-plan/references/wrap-up-closure-publication.md)
  (the `finish` description, its `completion` result row, and the Story Branch
  retirement gate) and story wrap-up's
  [remove execution resources safely](../../src/skills/dough-story-wrap-up/SKILL.md#remove-execution-resources-safely)
  name a `success` receipt with confirmed shutdown as the retirement gate for
  both modes, in place of confirmed shutdown alone. Story Branch Mode's gate is
  guidance the coordinator applies; no script changes there.
- A journey through the installed `finish` pins the observed case above: a
  live observer that records no verdict for the final closure stops at
  `completion` and keeps the resources.

Deferred promises: keeping the observer alive after an unresolved completion
(the shared completion operation still stops it, and the rerun establishes a
new observer through `deliver` as the guidance already says); changes to
`awaitRevision` or `completeRevision` receipts or to `finish`'s ended-observer
selection; background settlement, dashboard-owned monitoring, and automatic
retirement, which SEED-063 owns; Dough Land's own landing, which has no CI
obligation.

Boundary assumptions: SEED-063's plan later rewrites this retirement path for
its background contract and records that it will not remove or complete this
story; this story's stricter gate and pinned journey are the behavior that
rewrite preserves, and neither story blocks the other. The fixture's observer
budget is the practical way to reach an unresolved receipt in a test; the
ten-minute deadline is the same rule, not a separate case.

**Key examples:**

- Final closure accepted on trunk; the coordinator's live observer records no
  verdict for it and its observation ends (budget expired or worker gone) →
  `finish` → `step: "completion"`, `ok: false`, exit 1,
  `completion.unresolvedReason` set and no `verdict`, `cleanup:
  "not-performed"`; the worktree exists, the branch points at the final closure,
  trunk holds it. Today this case answers `ok: true` and removes both.
- Final closure accepted; the live observer stays silent past the completion
  deadline → `finish` → the same `completion` stop with `unresolvedReason:
  "timeout"`; nothing is removed.
- Final closure accepted; CI reports `success` and the observer shuts down →
  `finish` → `ok: true`, worktree and branch removed, as today.
- Final closure accepted; CI reports `failure` → `finish` → `completion` stop,
  resources kept, as today.
- After the unresolved stop, the coordinator reruns `finish` with the same
  owner input → the ended observer holds no verdict, so `step: "observation"`
  names the existing recovery: `deliver` from the execution worktree establishes
  this coordinator's observer, and the next rerun completes and retires only
  on `success`.

## Breadcrumbs

- Terry's reported misregistration and explicit request to queue confirmed
  work first, commit on main, and sync with origin, 2026-10-08.
- [Managed observation](../../src/skills/dough-execute-plan/scripts/execution-increment-observation.mjs).
- [Mailbox matching](../../src/skills/dough-execute-plan/scripts/ci-mailbox-match.mjs).
- [Mailbox location and access](../../src/skills/dough-execute-plan/scripts/ci-mailbox-location.mjs).
- [Managed delivery](../../src/skills/dough-execute-plan/scripts/execution-increment-delivery.mjs).
- [Resume ownership coverage](../../src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery-resume-ownership.test.mjs).
