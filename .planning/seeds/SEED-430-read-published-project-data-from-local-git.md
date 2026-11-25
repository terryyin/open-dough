---
id: SEED-430
status: active
planted: 2026-11-24
planted_during: Developer decision to extend shared Git refresh to published Dashboard reads
trigger_when: selected from the product backlog after the Review repository is in use
scope: five stories
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

<a id="open-published-board-from-local-git"></a>

### Publish fixed Board test fixtures through real Git

**Identity:** SEED-430#open-published-board-from-local-git
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/824-open-published-board-from-local-git/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"5bf56a4ccc41bc22d3f10fe775c1ac7b3431d68c5fb0b61a9ae7544cc2587385","plan":"cb958e5145f257a4c7996a6c34e2d04ae6fd2bd3c2eb373a96a05aea2514b27c"}}
```

```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-430#open-published-board-from-local-git","dependencies":[{"supplier":{"identity":"SEED-430#read-published-project-data-from-local-git","href":"seeds/SEED-430-read-published-project-data-from-local-git.md#read-published-project-data-from-local-git"},"implementation":"Board-opening test fixtures that publish through real routed Git origins","rationale":"The Board's Git read can only be proved where the suites hold a real origin at the answered revision; switching it first would break every Board open in the suites.","condition":"SEED-430#read-published-project-data-from-local-git has landed on origin/main: committed origins, publishes() and the default answer publish through real routed origins whose main holds the answered revision.","state":"satisfied","resolution":{"revision":"1e2edf48ff3abdb521ad2bef8828b47dafa80eef","path":".planning/seeds/SEED-430-read-published-project-data-from-local-git.md#read-published-project-data-from-local-git","summary":"Origin main accepted f05e15351e85617fab1bf8fa97b8f7f6c0eb7568. At the before-cleanup revision, plan 819 slices 1-4 are done: publishCommittedOrigin routes its origin through every dashboard HOME its fake GitHub serves and keeps the origin's main at the answered revision; publishes() without a revision commits a real origin that serving by name routes, with a republication replacing only its own earlier route; the default answer commits a real origin linked for the seeded projects; answer wrappers keep their origin. committed-origin-actions.spec.ts checks ls-remote under the dashboard HOME, and both full suites passed on each slice. Intent Coverage at 4baf31b4f found the republication path missing from maintained checks; plan 824 slice 6 owns that proof.\nCondition satisfied: committed origins, publishes() and the default answer publish through real routed origins whose main holds the answered revision.\nCondition satisfied: SEED-430#read-published-project-data-from-local-git has landed on origin/main: committed origins, publishes() and the default answer publish through real routed origins whose main holds the answered revision.\nAccepted integration: f05e15351e85617fab1bf8fa97b8f7f6c0eb7568 on origin/refs/heads/main."}}]}
```

**Goal.** A maintainer can exercise a fixed test publication through the
Board or Intent and confirm the routed Git origin and the REST detail reads
use the same revision and record bytes.

**Scope.** Convert fixed file publications and their wrappers, including
MakeMe-backed profile, clock, Recently done, session and Intent records.
Preserve each case's visible behavior and deliberately unreadable detail.
Moving histories, project routing and direct backend readers remain with
the succeeding fixture stories.

**Key example.** Given a fixed publication with a readable backlog and an
unavailable profile listing, open its test Board. The configured origin's
Git ref points to the advertised revision, while the retained profile
request still reports the deliberate listing failure.

**Split trace.** Original plan 824's fixed parts of slices 1, 3 and 4 stay
here. Its moving browser publications from slices 1–4 move to
[the moving fixture story](#publish-moving-board-fixtures-through-git).
Direct backend and configured projects from slices 5–6, plus the
pre-cutover audit and live REST proof moves, belong to
[the fixture qualification story](#qualify-board-fixture-routing-and-request-boundaries).
The original cold-open and Refresh slices 7–8, and deletion of the
superseded REST membership path, move to
[the verified Board story](#open-and-refresh-board-at-verified-trunk).
These retain the original selected outcome in delivery order.

<a id="publish-moving-board-fixtures-through-git"></a>

### Publish moving Board test fixtures through real Git

**Identity:** SEED-430#publish-moving-board-fixtures-through-git
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/826-publish-moving-board-fixtures-through-git/PLAN.md","assessment":"not-ready","reasons":["Slice 6 needs a real-origin Project Intent visit that observes the trunk and story judgments and establishes the size of the shared CI history conversion.","Slice 8 needs a real-origin mixed-owner observation that reaches the directed scheduled or detail wait and recovery so the remaining inline fixture work can be sized."],"basis":{"document":"6bffebe68005254fee82a09548b0e1ccf2c3049f3f286ae0ae32e019613fbd17","plan":"440a269620aa911fefdfab8d9926fa63374896e97248dbf4ca62b6293a497abc"}}
```

**Goal.** A maintainer can exercise a moving or rewound test publication
through the same real origin the Dashboard will use for Board membership.
Browser journeys can continue to verify scheduled observation and pinned
details against the commits the fixture actually publishes.

**Scope.** Migrate moving browser histories and their custom observation
fixtures. Successful trunk answers in Git and REST name the same commit
at each publication. Carry the existing record bytes, comparisons, clocks,
launch-independent session transitions, and Intent CI references to the
appropriate pins. Preserve intentional holds, bad inputs, and recovery at
the scheduled or detail request that owns them. Keep earlier pins readable
where the journey retains them. The fixed fixture story owns fixed file
publications. Routing qualification owns actual launch and reconciliation,
configured-project setup, direct backend proofs, and the final cross-suite
audit. The Board cutover owns membership dispatch and its failure proofs.

**Key examples.**

- Given a Board at A, publish B and let the scheduled check run. The served
  HOME resolves trunk to B, the scheduled request discovers B, and the
  Board shows the records for B. A detail already pinned at A still reads
  its intended record.
- Given a test origin that has moved from A to B, rewind trunk to A. A
  subsequent check and the visible direction or navigation state follow the
  original A commit. A deliberately held or refused REST detail still
  reaches its original failure and recovery assertions.
- Given a moving file history where B changes only product code, let the
  check discover B. The existing comparison names the real A and B, the
  Board reuses unchanged planning records, and a restarted Dashboard reads
  those records at B. Intent and Recently done journeys keep the same CI
  evidence or session relationship across their own publication changes.

<a id="qualify-board-fixture-routing-and-request-boundaries"></a>

### Qualify Board fixture routing and request boundaries

**Identity:** SEED-430#qualify-board-fixture-routing-and-request-boundaries
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"planned","plan":"../slice-plans/827-qualify-board-fixture-routing-and-request-boundaries/PLAN.md"}
```
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-430#qualify-board-fixture-routing-and-request-boundaries","dependencies":[{"supplier":{"identity":"SEED-430#open-published-board-from-local-git","href":"seeds/SEED-430-read-published-project-data-from-local-git.md#open-published-board-from-local-git"},"implementation":"Real publications for the fixed Board and Intent fixture families","rationale":"The final fixture gate covers the same fixed Board opens. Their synthetic origin pins leave unexplained mismatches in that gate.","condition":"The fixed Board and Intent fixtures advertise their real routed trunk with existing retained detail proof","state":"waiting"},{"supplier":{"identity":"SEED-430#publish-moving-board-fixtures-through-git","href":"seeds/SEED-430-read-published-project-data-from-local-git.md#publish-moving-board-fixtures-through-git"},"implementation":"Real publications for the moving browser fixture families","rationale":"The fixture gate requires real before and after trunk pins and preserved scheduled/detail proof in the browser suite.","condition":"The moving browser fixtures serve their real trunk at each expected move and preserve their scheduled and pinned-detail results","state":"waiting"}]}
```

**Goal.** A maintainer can open Boards for configured, added and relaunched
test projects against the right origin in the served HOME, with the
backend's direct request proofs independent of which transport opens a
Board.

**Scope.** Cover named and seeded routing, existing HOME overrides,
republication, launch/reconciliation, direct authenticated readers and
retained-answer fixtures. Restore scheduled and detail ownership proof
at the calls that use it. Qualify both suites before the cutover and
retire the scratch diagnostic.

**Key example.** Republish one named test project and reopen it from the
test's two served HOMEs. Both route to its new real trunk. An explicit
HOME override keeps precedence and a competing REST check only observes
its own directed wait.

<a id="open-and-refresh-board-at-verified-trunk"></a>

### Open and refresh the published Board from local Git

**Identity:** SEED-430#open-and-refresh-board-at-verified-trunk
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"planned","plan":"../slice-plans/828-open-and-refresh-board-at-verified-trunk/PLAN.md"}
```
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-430#open-and-refresh-board-at-verified-trunk","dependencies":[{"supplier":{"identity":"SEED-430#qualify-board-fixture-routing-and-request-boundaries","href":"seeds/SEED-430-read-published-project-data-from-local-git.md#qualify-board-fixture-routing-and-request-boundaries"},"implementation":"A real-origin fixture surface for the Board membership cutover","rationale":"Changing the authenticated ref dispatch affects every Board open. The current suites need their routed origins and live REST proofs before that switch can be proved.","condition":"Both fixture suites pass with real routed Board pins and every remaining audit mismatch assigned to a still-live operation with proof","state":"waiting"}]}
```

**Goal.** A developer can open the Board and confirm what is published,
even when the execution checkout is absent or behind. The Board shows
the backlog at the verified published trunk, names when it was last
confirmed, and explains a failed Refresh.

**Scope.** Open and manual Refresh resolve the configured trunk on origin
and read the backlog at that exact revision from the dashboard's Review
repository, within the Board's wait bound. Refresh is an action on the
open Board. The developer can keep working from the confirmed view while
the check is pending. A successful unchanged check advances the
confirmation time without fetching. A changed check advances the view
and time together once that revision's backlog is readable. A failed
check keeps the earlier confirmation and shows the problem. A Board
without a prior confirmed view shows the failure as unavailable.
Explicit access refusal retains its established outcome. A missing trunk,
unreadable backlog, or unverified local commit cannot establish a Board
confirmation. Admission still follows the configured source and existing
read rules.

The fixture qualification story supplies a real routed origin for each
Board-opening fixture. Open and manual Refresh use the same verified Git path,
including on failure. Before closing this story, remove every temporary
implementation or fixture bridge and every superseded path that loses its
last caller, including the old REST membership path. Remove the associated
tests, fixtures, and documentation that only served those paths. Keep the
behavioral proof for promises that continue on the Git path or through
another live caller. The
[published-progress story](#follow-published-progress-from-local-git)
owns migrating automatic observation, watched branches, the other
published records, and Review callers to the verified observation. Those
live callers define the scope of any shared REST helpers this story retains.

**Architecture.** Reuse the dashboard-owned Review repository and its Git
transport under [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md).
The Board's confirmation binds the origin-verified revision and its
confirmation time in one update after checking the backlog at the pin.
Git may already hold candidate objects when that update fails. Readers
continue to use the last confirmed pin and access is still evaluated
against the configured source.

**Key examples.**

- Given an accessible origin and an absent execution checkout, open a
  Board with no prior confirmation. It shows the backlog and time for the
  exact verified trunk without GitHub REST membership reads. If origin
  is unavailable on that first open, there is no confirmed Board even
  if the old REST endpoint could answer. An explicit refusal is reported
  as such.
- Given a Board confirmed at A and origin advertising B, press Refresh.
  While B is being checked, the Board shows A and A's confirmation time.
  If B's fetch or confirmation write fails, A and its time stay and the
  failure is visible. If another Refresh can verify B, the displayed
  revision and time advance together.
- Given a warm Board and reachable origin still at its confirmed
  revision, press Refresh. The later check updates the confirmation
  time without fetching. Record cold and warm request counts and timing.

<a id="follow-published-progress-from-local-git"></a>

### Follow published progress and read Board records from local Git

**Identity:** SEED-430#follow-published-progress-from-local-git
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"planned","plan":"../slice-plans/823-follow-published-progress-from-local-git/PLAN.md"}
```
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-430#follow-published-progress-from-local-git","dependencies":[{"supplier":{"identity":"SEED-430#read-published-project-data-from-local-git","href":"seeds/SEED-430-read-published-project-data-from-local-git.md#read-published-project-data-from-local-git"},"implementation":"Board-opening test fixtures that publish through real routed Git origins","rationale":"The Board's Git read can only be proved where the suites hold a real origin at the answered revision; switching it first would break every Board open in the suites.","condition":"SEED-430#read-published-project-data-from-local-git has landed on origin/main: committed origins, publishes() and the default answer publish through real routed origins whose main holds the answered revision.","state":"satisfied","resolution":{"revision":"1e2edf48ff3abdb521ad2bef8828b47dafa80eef","path":".planning/seeds/SEED-430-read-published-project-data-from-local-git.md#read-published-project-data-from-local-git","summary":"Origin main accepted f05e15351e85617fab1bf8fa97b8f7f6c0eb7568. At the before-cleanup revision, plan 819 slices 1-4 are done: publishCommittedOrigin routes its origin through every dashboard HOME its fake GitHub serves and keeps the origin's main at the answered revision; publishes() without a revision commits a real origin that serving by name routes, with a republication replacing only its own earlier route; the default answer commits a real origin linked for the seeded projects; answer wrappers keep their origin. committed-origin-actions.spec.ts checks ls-remote under the dashboard HOME, and both full suites passed on each slice. Intent Coverage at 4baf31b4f found the republication path missing from maintained checks; plan 824 slice 6 owns that proof.\nCondition satisfied: committed origins, publishes() and the default answer publish through real routed origins whose main holds the answered revision.\nCondition satisfied: SEED-430#read-published-project-data-from-local-git has landed on origin/main: committed origins, publishes() and the default answer publish through real routed origins whose main holds the answered revision.\nAccepted integration: f05e15351e85617fab1bf8fa97b8f7f6c0eb7568 on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-430#open-and-refresh-board-at-verified-trunk","href":"seeds/SEED-430-read-published-project-data-from-local-git.md#open-and-refresh-board-at-verified-trunk"},"implementation":"Verified local trunk observation behind the Board’s cold open and Refresh","rationale":"Automatic observation, branch progress, pinned records, Review sharing and containment extend the verified observation.","condition":"The Board opens and refreshes from a verified local trunk pin, with atomic confirmation, and both migrated fixture suites pass","state":"waiting"}]}
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
