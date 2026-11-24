---
id: SEED-430
status: active
planted: 2026-11-24
planted_during: Developer decision to extend shared Git refresh to published Dashboard reads
trigger_when: selected from the product backlog after the Review repository is in use
scope: one story
---

# SEED-430 — Read the published Board and Review from local Git

<a id="read-published-project-data-from-local-git"></a>

### Read the published Board and Review from local Git

**Identity:** SEED-430#read-published-project-data-from-local-git
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-430#read-published-project-data-from-local-git","dependencies":[{"supplier":{"identity":"SEED-428#read-reviews-from-the-review-repository","href":"seeds/SEED-428-read-reviews-from-the-review-repository.md#read-reviews-from-the-review-repository"},"implementation":"Dashboard-owned Review repository for each project with shared, bounded Git fetches","rationale":"The next published reader extends that live storage and freshness boundary. A temporary store or checkout reader would duplicate it and could expose a second version of the same published state.","condition":"SEED-428 has landed on origin/main. Published comparisons can use the Dashboard-owned Review repository independently of the execution checkout, and their concurrent readers share a bounded fetch.","state":"satisfied","resolution":{"revision":"5813f8d95b5816e984540785e4e3d0e439c2c1ff","path":".planning/seeds/SEED-428-read-reviews-from-the-review-repository.md#read-reviews-from-the-review-repository","summary":"Origin main accepted b2b66a794f6a295e82e829ab446a6334e1fcc001. dashboard/server/reviewRepository.ts keeps one bare Review repository per configured project under the machine dashboard home, fetches published refs by exact refspec through GitTargetFetches with a bounded read, and records each sync. Done, Taken, landed and published-session review readers read it without calling executionCheckout. story-review-completed.spec.ts (backend and E2E) reads the same comparison and file diff with the execution checkout renamed and leaves its refs unchanged; story-review-published-taken.spec.ts reads Taken comparisons with no checkout; story-review-completed-shared-fetch.spec.ts records one fetch for two concurrent opens. Full backend, frontend and E2E suites passed on the merged state.\nCondition satisfied: SEED-428 has landed on origin/main; published comparisons use the Dashboard-owned Review repository independently of the execution checkout, and concurrent readers share a bounded fetch. The queued correction SEED-428#read-review-files-without-fetching removes remaining per-switch fetches on landed file reads; it does not affect this condition.\nCondition satisfied: SEED-428 has landed on origin/main. Published comparisons can use the Dashboard-owned Review repository independently of the execution checkout, and their concurrent readers share a bounded fetch.\nAccepted integration: b2b66a794f6a295e82e829ab446a6334e1fcc001 on origin/refs/heads/main."}}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/819-read-published-board-and-review/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"bca71618d63d70e4f033d98f9b449fe4330694024915583caecbbc6aab8cccb9","plan":"efdbc2e14d1ea984b3e21a4dfa44b8ccca763a3deeee989014943ed7d173b88d"}}
```

**Goal.** A developer can open the Board, inspect published work, and follow
changes on origin with the execution checkout absent or behind. The Board
identifies the last confirmed view and explains a failed refresh. Board
details and already-admitted Review files read locally at their published pins.

**Scope.** Cold Board open establishes a locally readable published view
within a bounded check. A warm Board can show its last readable view during
refresh. Manual Refresh and automatic observation update the confirmation
time when origin confirms the same tips and advance the Board when new tips
are verified. A temporary failure keeps the last confirmation and readable
view, shows the problem, and permits recovery on Refresh. A cold failure
leaves the Board unavailable. Explicit access refusals retain their own
outcome.

The Board follows trunk membership and priority, Preparing and Taken
assignments, and branch-only plan progress, including the plan's commit
time. It reads reachable stories, plans, requests, and documents, Done
catalog and bodies, published session records, and the pinned Done record
used for follow-up admission. Check accepted-publication containment at the
shown revision. Preserve the distinction between absence and an unreadable
record, and between publication and machine-local launch or session evidence.

Live progress follows confirmed branch moves and reports a confirmed
deletion. A detail already admitted at a revision keeps its pin for its
existing lifetime through branch deletion or rewrite. Admission follows the
configured source and the existing revision, branch, and path rules. Mere
object presence confers no admission.

A Board open, manual Refresh, active revision observer, and Review open share
the same bounded check when it covers their refs and freshness. Review
retains its existing comparison admission, selection, and notices. File
switching stays local. Retire superseded REST reads and caching only when
they lose their last caller.

**Architecture.** Extend the existing Review repository and bounded Git
transport, including the landed
[read-only Review file correction](https://github.com/terryyin/open-dough/blob/82fa2ac11bda12ca2af0f9575087a79bdf3b98ec/.planning/seeds/SEED-428-read-reviews-from-the-review-repository.md#read-review-files-without-fetching).
Apply [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
and [ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md).
The [Architectural North Star](../NORTH-STAR.md#share-one-refresh-for-published-dashboard-git-reads)
sets the common observation boundary. Stage fetched objects, verify the
required pins, and publish the resulting observation and confirmation time
together. A trunk success cannot confirm a branch whose check failed. Reuse
the existing observation timing, SSE and HTTP fallback. Keep observation
start time for launch reconciliation distinct from the displayed
confirmation time.

**Key examples.**

- Given an accessible origin and an absent execution checkout, open the Board
  cold, then open a story, branch plan, Done record, and published session
  from the confirmed view. Board details read the admitted pins with zero
  remote Git operations and zero GitHub API calls for these published
  records. Record cold and warm request counts and timing.
- Given two Board tabs and Review, refresh after origin advances a watched
  branch while trunk stays fixed. The tabs and Review can share the check,
  live progress follows the verified head, and an already-admitted detail
  keeps its pin. Once a successful probe confirms deletion, the Board shows
  that the branch is no longer published. A newly watched branch is checked
  before its head is reported.
- Given a previously confirmed Board and an unavailable origin or an
  unresolved probe/fetch race, Refresh retains the current view with its old
  confirmation time. A cold failure and an explicit access refusal are
  distinguishable. On recovery, an unchanged check advances the confirmation
  time with no fetch and a changed check exposes only verified revisions.

**Follow-up stories.** The rest of the published read inventory is tracked
in [Intent and attribution](SEED-434-browse-published-intent-from-local-git.md#browse-published-intent-from-local-git),
[CI inputs](SEED-435-read-published-ci-inputs-from-local-git.md#read-published-ci-inputs-from-local-git),
[scheduled feedback maintenance](SEED-436-check-feedback-maintenance-from-local-git.md#check-feedback-maintenance-from-local-git),
and [Add Project](SEED-437-discover-project-default-branch-through-git.md#discover-project-default-branch-through-git).
