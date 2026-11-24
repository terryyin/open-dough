---
id: SEED-430
status: active
planted: 2026-11-24
planted_during: Developer decision to extend shared Git refresh to published Dashboard reads
trigger_when: selected from the product backlog after the Review repository is in use
scope: two stories
---

# SEED-430 — Read the published Board and Review from local Git

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

**Transport evidence.** Under `LC_ALL=C`, the Review transport's `ls-remote`
exits 128 for every failure, and its stderr separates explicit refusal
(HTTP 401 "could not read Username", 403 "returned error: 403") from
unavailability (connection failure, 503, caller deadline). After a successful
probe, `ls-remote --exit-code` exits 2 for an absent branch. GitHub's
"Repository not found" is a refusal for a configured project, never confirmed
absence. An observation is reusable only for the same project, origin URL,
and machine gh credential.

**Follow-up stories.** The rest of the published read inventory is tracked
in [Intent and attribution](SEED-434-browse-published-intent-from-local-git.md#browse-published-intent-from-local-git),
[CI inputs](SEED-435-read-published-ci-inputs-from-local-git.md#read-published-ci-inputs-from-local-git),
[scheduled feedback maintenance](SEED-436-check-feedback-maintenance-from-local-git.md#check-feedback-maintenance-from-local-git),
and [Add Project](SEED-437-discover-project-default-branch-through-git.md#discover-project-default-branch-through-git).

<a id="read-published-project-data-from-local-git"></a>

### Open and refresh the published Board from local Git

**Identity:** SEED-430#read-published-project-data-from-local-git
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-430#read-published-project-data-from-local-git","dependencies":[{"supplier":{"identity":"SEED-428#read-reviews-from-the-review-repository","href":"seeds/SEED-428-read-reviews-from-the-review-repository.md#read-reviews-from-the-review-repository"},"implementation":"Dashboard-owned Review repository for each project with shared, bounded Git fetches","rationale":"The next published reader extends that live storage and freshness boundary. A temporary store or checkout reader would duplicate it and could expose a second version of the same published state.","condition":"SEED-428 has landed on origin/main. Published comparisons can use the Dashboard-owned Review repository independently of the execution checkout, and their concurrent readers share a bounded fetch.","state":"satisfied","resolution":{"revision":"5813f8d95b5816e984540785e4e3d0e439c2c1ff","path":".planning/seeds/SEED-428-read-reviews-from-the-review-repository.md#read-reviews-from-the-review-repository","summary":"Origin main accepted b2b66a794f6a295e82e829ab446a6334e1fcc001. dashboard/server/reviewRepository.ts keeps one bare Review repository per configured project under the machine dashboard home, fetches published refs by exact refspec through GitTargetFetches with a bounded read, and records each sync. Done, Taken, landed and published-session review readers read it without calling executionCheckout. story-review-completed.spec.ts (backend and E2E) reads the same comparison and file diff with the execution checkout renamed and leaves its refs unchanged; story-review-published-taken.spec.ts reads Taken comparisons with no checkout; story-review-completed-shared-fetch.spec.ts records one fetch for two concurrent opens. Full backend, frontend and E2E suites passed on the merged state.\nCondition satisfied: SEED-428 has landed on origin/main; published comparisons use the Dashboard-owned Review repository independently of the execution checkout, and concurrent readers share a bounded fetch. The queued correction SEED-428#read-review-files-without-fetching removes remaining per-switch fetches on landed file reads; it does not affect this condition.\nCondition satisfied: SEED-428 has landed on origin/main. Published comparisons can use the Dashboard-owned Review repository independently of the execution checkout, and their concurrent readers share a bounded fetch.\nAccepted integration: b2b66a794f6a295e82e829ab446a6334e1fcc001 on origin/refs/heads/main."}}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/819-read-published-board-and-review/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"9c0ba3584945e23969d90fb631d5398cec4b89eea47544ef1b654ad1f2850947","plan":"c3de5f8f58da18e9f01b83340a34e8e4d225016d9e371bcbb2335493aba35bb9"}}
```

**Goal.** A developer can open the Board and Refresh it with the execution
checkout absent or behind. The Board shows the backlog at the verified
published trunk, identifies the last confirmed view, and explains a failed
refresh.

**Scope.** Cold Board open establishes a locally readable published trunk
view within a bounded check. A warm Board shows its last readable view during
Refresh. Manual Refresh updates the confirmation time when origin confirms
the same trunk and advances the Board when a new trunk is verified. A
temporary failure keeps the last confirmation and readable view, shows the
problem, and permits recovery on Refresh. A cold failure leaves the Board
unavailable. Explicit access refusals retain their own outcome. A missing
trunk or unreadable backlog cannot yield a confirmed Board. Mere object
presence confers no admission.

Board-opening test fixtures publish through a real origin so every Board
open in the suites exercises the verified trunk read. Reads other than the
Board's trunk and backlog keep their current paths until
[the published-progress story](#follow-published-progress-from-local-git)
moves them.

**Key examples.**

- Given an accessible origin and an absent execution checkout, open the Board
  cold. It shows the backlog at the exact verified trunk revision. Record
  cold and warm request counts and timing.
- Given a previously confirmed Board and an unavailable origin or an
  interrupted fetch, Refresh retains the current view with its old
  confirmation time. A cold failure and an explicit access refusal are
  distinguishable. On recovery, an unchanged check advances the confirmation
  time with no fetch and a changed check exposes only verified revisions.

<a id="follow-published-progress-from-local-git"></a>

### Follow published progress and read Board records from local Git

**Identity:** SEED-430#follow-published-progress-from-local-git
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"planned","plan":"../slice-plans/821-follow-published-progress-from-local-git/PLAN.md"}
```
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-430#follow-published-progress-from-local-git","dependencies":[{"supplier":{"identity":"SEED-430#read-published-project-data-from-local-git","href":"seeds/SEED-430-read-published-project-data-from-local-git.md#read-published-project-data-from-local-git"},"implementation":"Verified local trunk observation behind the Board's cold open and Refresh, with Board-opening test fixtures published through real routed origins","rationale":"Automatic observation, branch progress, pinned records, Review sharing and containment all extend that same verified observation and fixture origin. Building them first would need a second trunk path or REST-only fixtures that the supplier removes.","condition":"SEED-430#read-published-project-data-from-local-git has landed on origin/main: the Board opens and refreshes from a verified local trunk pin, and Board-opening fixtures publish through a real routed origin.","state":"waiting"}]}
```

**Goal.** A developer can follow changes on origin and inspect published
work with the execution checkout absent or behind. Board details and
already-admitted Review files read locally at their published pins.

**Scope.** Automatic observation updates the confirmation time when origin
confirms the same tips and advances the Board when new tips are verified,
with the existing pace and visibility behavior.

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

**Key examples.**

- Given a confirmed Board with an absent execution checkout, open a story,
  branch plan, Done record, and published session from the confirmed view.
  Board details read the admitted pins with zero remote Git operations and
  zero GitHub API calls for these published records.
- Given two Board tabs and Review, refresh after origin advances a watched
  branch while trunk stays fixed. The tabs and Review can share the check,
  live progress follows the verified head, and an already-admitted detail
  keeps its pin. Once a successful probe confirms deletion, the Board shows
  that the branch is no longer published. A newly watched branch is checked
  before its head is reported.
