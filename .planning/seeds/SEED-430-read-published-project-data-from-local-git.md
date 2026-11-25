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
and [scheduled feedback maintenance](SEED-436-check-feedback-maintenance-from-local-git.md#check-feedback-maintenance-from-local-git).
[Add Project](../../dashboard/server/projectAddition.ts) resolves the default branch
from origin's symbolic `HEAD` when configuring a project.

<a id="qualify-board-fixture-routing-and-request-boundaries"></a>

### Qualify Board fixture routing and request boundaries

**Identity:** SEED-430#qualify-board-fixture-routing-and-request-boundaries
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/827-qualify-board-fixture-routing-and-request-boundaries/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"78ad8b6b484d84f14a331a615d16caba7c99ed886bc3b3721a85a55eba0e2586","plan":"2fa9e3994354ee1bcd186712b4df0f423d9f7d0561fbb11a79edc36438714d20"}}
```
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-430#qualify-board-fixture-routing-and-request-boundaries","dependencies":[{"supplier":{"identity":"SEED-430#open-published-board-from-local-git","href":"seeds/SEED-430-read-published-project-data-from-local-git.md#open-published-board-from-local-git"},"implementation":"Real publications for the fixed Board and Intent fixture families","rationale":"The final fixture gate covers the same fixed Board opens. Their synthetic origin pins leave unexplained mismatches in that gate.","condition":"The fixed Board and Intent fixtures advertise their real routed trunk with existing retained detail proof","state":"satisfied","resolution":{"revision":"548a3814652df8782da71457ac3acffd973a2f08","path":".planning/seeds/SEED-430-read-published-project-data-from-local-git.md#open-published-board-from-local-git","summary":"Plan 824 slices 1-6 are done at the before-cleanup revision. Fixed publications in the profile, clock, roster, portrait, branch-progress, Recently done, session, completion, Intent and project-observation specs commit through publishCommittedFiles or serveCommitted, which fail unless Git under every served dashboard HOME finds the published revision; REST detail answers serve the same files at that revision and specs assert the returned pin. Deliberate listing, catalog, record and backlog failures stay at their REST boundaries. Intent Coverage at 46d4fbf32 caught a broken routing on the listing-failure path. Branch CI succeeded at 851fc0199 and 27aa26172. The restored-access step of authenticated-project-observation still advertises a real routed trunk but at a new commit; queued correction SEED-430#recover-fixed-observation-at-its-published-pin restores its already-read pin. Moving cases remain with SEED-430#publish-moving-board-fixtures-through-git.\nCondition satisfied: The fixed Board and Intent fixtures advertise their real routed trunk with existing retained detail proof.\nCondition satisfied: The fixed Board and Intent fixtures advertise their real routed trunk with existing retained detail proof\nAccepted integration: 79b86d132478ef60f372d4ec86290ff22b8ab149 on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-430#publish-moving-board-fixtures-through-git","href":"seeds/SEED-430-read-published-project-data-from-local-git.md#publish-moving-board-fixtures-through-git"},"implementation":"Real publications for the moving browser fixture families","rationale":"The fixture gate requires real before and after trunk pins and preserved scheduled/detail proof in the browser suite.","condition":"The moving browser fixtures serve their real trunk at each expected move and preserve their scheduled and pinned-detail results","state":"satisfied","resolution":{"revision":"cd6d91fc619c03d5e6f988fcbe5dd4ecd162eb1c","path":".planning/seeds/SEED-430-read-published-project-data-from-local-git.md#publish-moving-board-fixtures-through-git","summary":"The moving browser fixtures publish actual trunk commits at every expected move. The scheduled and pinned-detail browser proofs passed on the published story branch. A shared-observer fault check also caught the Git read staying pinned to A when the REST fixture alone advanced to B.\nCondition satisfied: The moving browser fixtures serve their real trunk at each expected move and preserve their scheduled and pinned-detail results\nAccepted integration: 118787d8d61a2d14c77ce9eaa1551ccc2a0babf2 on origin/refs/heads/main."}}]}
```

**Goal.** A Dashboard maintainer can move Board membership reads to Git
with confidence that the tests publish a real, reachable commit for each
Board open and that the live REST operations still prove their request
handling independently.

**Scope.** Qualify named and seeded routing, republication, Add Project
and saved configuration, launch and reconciliation, and the cold setup
used by direct authenticated readers and retained-answer tests. A
successful open's configured repository and ref must reach its fixture
commit in each HOME that uses it. Keep intentional HOME overrides and
local failure for an unserved repository so fixture reads stay isolated
from live GitHub. Keep admission, pinning, sharing, directed waits, and
recovery observable at the scheduled and detail operations that use them.
Pass the full Dashboard Backend Test and E2E Test suites with every
diagnostic mismatch explained, then remove the scratch diagnostic. The
[Board cutover](#open-and-refresh-board-at-verified-trunk) owns the
membership transport switch and retirement of its superseded REST proofs.

**Key examples.**

- Republish a named project and reopen it in two served HOMEs. Both
  resolve its new real trunk. A HOME with an explicit route keeps that
  route, and another project's route still reaches its own publication.
- Add a project whose configured default branch is `release+stable`, then
  reopen it after restart. Its Board fixture reaches the published commit
  on that branch. A launch fixture that later publishes a second commit
  makes it reachable when reconciliation reads its published record.
- Start a scheduled REST check while pinned reads are under way, then
  return a directed wait. The independent reads keep their own answers,
  and later REST checks of either project observe the owner's wait.
  After it expires, a formerly held detail is asked for and answered at
  its admitted pin.

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
