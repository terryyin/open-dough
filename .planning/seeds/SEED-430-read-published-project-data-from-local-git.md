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

<a id="open-the-board-from-the-verified-git-trunk"></a>

### Open the Board from the verified Git trunk

**Identity:** SEED-430#open-the-board-from-the-verified-git-trunk
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/856-open-the-board-from-the-verified-git-trunk/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"ba63ad9284fbd10d045b7ffc9c2d43d3ce645d270d371874a45731e5d54588b6","plan":"4c478e9d3f396d1c939533a6c9e4ddab8667d09677a87964454671cc3a4b6085"}}
```
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-430#open-the-board-from-the-verified-git-trunk","dependencies":[{"supplier":{"identity":"SEED-430#open-and-refresh-board-at-verified-trunk","href":"seeds/SEED-430-read-published-project-data-from-local-git.md#open-and-refresh-board-at-verified-trunk"},"implementation":"The shared verified-origin trunk check, and detail, credit, and recovery proofs that leave REST membership out of their compared lists","rationale":"The Board open switches the ref case onto that check. Building another check would duplicate the probe, fetch, and sharing already landed.","condition":"The shared verified-origin trunk check and the detail, credit, and recovery proofs that leave REST membership out of their compared lists are on origin/main","state":"satisfied","resolution":{"revision":"374ccd86b15fdb1909590cc447b863bb34bb65f6","path":".planning/seeds/SEED-430-read-published-project-data-from-local-git.md#open-and-refresh-board-at-verified-trunk","summary":"Slices 1–3 are on origin/main through 81c2cab55021673e9d04dde1d1b873cd47eb0be9. The verified-origin trunk check and the shared check are published at 2dca752cf7bf75737c07f6f84635967658514c53 and c532c7b0ae87b4b257231cf69b2a31c00aab18a6. The detail, credit, and recovery proofs that leave REST membership out of their compared lists are published at 11264ea38b4a45592ff54328f60ef90a33899870. The before-cleanup revision 374ccd86b15fdb1909590cc447b863bb34bb65f6 records that delivered story before its section was removed.\nCondition satisfied: The shared verified-origin trunk check and the detail, credit, and recovery proofs that leave REST membership out of their compared lists are on origin/main\nAccepted integration: 81c2cab55021673e9d04dde1d1b873cd47eb0be9 on origin/refs/heads/main."}}]}
```

Split from [SEED-430#open-and-refresh-board-at-verified-trunk](https://github.com/terryyin/open-dough/blob/374ccd86b15fdb1909590cc447b863bb34bb65f6/.planning/seeds/SEED-430-read-published-project-data-from-local-git.md#open-and-refresh-board-at-verified-trunk)
on 2026-11-26 at the delivered boundary after that story's slices 1–3.
Recover that story from the before-cleanup revision after wrap-up deletes
its section. Uncommitted slice 1 edits stay in worktree
`/Users/terryyin/git/open-dough/.worktrees/open-the-published-board-at-verified-git-trunk`
on `cursor/open-the-published-board-at-verified-git-trunk` and are not part
of the landed first half.

**Goal.** A developer can open the Board and see what is published, even
when the execution checkout is absent or behind. The Board shows the
backlog at the published trunk that origin verifies and explains a cold
open that cannot be verified.

**Scope.** Every read that resolves the configured trunk through the
authenticated `ref` operation resolves it with the shared verified-origin
check: opening the dashboard, selecting a project, reloading, and launch
reconciliation's fresh read. The Board shows the backlog at that verified
revision within its wait bound. Eligible concurrent opens of one project
share a check, different projects proceed independently, and a departing
waiter releases only its own wait.

An unavailable origin, a missing trunk, an unreadable backlog, or a fetched
commit other than the verified one cannot establish a Board, and nothing
falls back to GitHub REST membership. With no Board shown, the failure is
shown as unavailable. Explicit access refusal retains its established
outcome. With a Board already shown, a failed read keeps it beside the
existing failure notice.

Remove the REST membership dispatch and every path, test control, fixture
and document that loses its last caller with it. `resolveRevisionViaGh`
keeps its scheduled-check, feedback-maintenance and follow-up callers.
Detail reads keep their current transports. The
[Refresh story](#refresh-published-board-in-place) owns the visible
confirmation time, manual Refresh, durable confirmation and fetch elision.
The [published-progress story](#follow-published-progress-from-local-git)
owns automatic observation, watched branches, other published records and
Review callers.

**Key examples.**

- Given an accessible origin and an absent execution checkout, open a
  Board. It shows the backlog for the exact verified trunk without any
  GitHub REST membership read.
- Given two tabs opening one project while the Git transfer is held, both
  wait on one check and show the same revision. Closing one tab leaves the
  other's read to finish; a second project opens independently.
- Given an origin that cannot be reached on a cold open, no Board is shown
  even though the REST endpoint could answer, and the page says it is
  unavailable. An origin whose trunk is missing, or whose backlog cannot be
  read at the verified revision, also shows no Board. An explicit refusal is
  reported as a refusal.

<a id="refresh-published-board-in-place"></a>

### Refresh the published Board in place

**Identity:** SEED-430#refresh-published-board-in-place
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-430#refresh-published-board-in-place","dependencies":[{"supplier":{"identity":"SEED-430#open-the-board-from-the-verified-git-trunk","href":"seeds/SEED-430-read-published-project-data-from-local-git.md#open-the-board-from-the-verified-git-trunk"},"implementation":"The verified Git trunk check behind every Board open, with the REST membership dispatch removed","rationale":"Refresh runs the same verified check and extends its result with a durable confirmation; building it beside the REST dispatch would duplicate the check and its failure handling.","condition":"The Board opens at a verified Git trunk revision with no REST membership dispatch, and both Dashboard suites pass","state":"waiting"}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/853-refresh-published-board-in-place/PLAN.md","assessment":"not-ready","reasons":["Plan 853's slices are provisional until plan 828 lands; the durable confirmation store design and the warm Refresh path (fetch elision, timing) are unmeasured against the landed verified check."],"basis":{"document":"03a136e1609003a16088531cb54075bfb3a956e0bd4d9716deb246e922c4cca5","plan":"25813e655e75efaa9721e27e8485977bf34c754bb6dc0bfdad9d427e8468ba76"}}
```

**Goal.** A developer can confirm what is published without reloading the
page. The Board names when it was last confirmed and explains a failed
Refresh while the developer keeps working from the confirmed view.

**Scope.** The Board perspective's project actions row shows a quiet
"Checked <time>" note and an icon button labeled "Refresh", with the same
wording and icon as System settings Usage and the Review panel. Refresh runs
the same verified Git check as an open. While it is pending, the Board keeps
the confirmed backlog and time and says it is checking origin; the button
stays focusable but unavailable. A successful unchanged check advances the
confirmation time without fetching. A changed check advances the view and
time together once that revision's backlog is readable. A failed check
keeps the earlier view and time and shows the problem beside them.

The dashboard binds the verified revision and its confirmation time in one
durable update, so a failed update or a restart leaves the earlier
confirmation readable. An open with a confirmation at origin's advertised
revision also skips the fetch. Until the published-progress story migrates
automatic observation, an automatic check that advances the Board shows
that read's time, and an earlier automatic read cannot replace a later
manual confirmation.

**Key examples.**

- Given a Board confirmed at A and origin advertising B, press Refresh.
  While B is being checked, the Board shows A and A's time. If B's fetch or
  confirmation write fails, A and its time stay and the failure is shown.
  A later Refresh that verifies B advances the revision and time together.
- Given a warm Board whose origin is still at the confirmed revision, press
  Refresh. The time advances and nothing is fetched. Record cold and warm
  request counts and timing.
- Given a confirmation at A and a restarted dashboard, open the Board. It
  shows A's revision once origin still advertises A, without fetching.

<a id="follow-published-progress-from-local-git"></a>

### Follow published progress and read Board records from local Git

**Identity:** SEED-430#follow-published-progress-from-local-git
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"planned","plan":"../slice-plans/823-follow-published-progress-from-local-git/PLAN.md"}
```
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-430#follow-published-progress-from-local-git","dependencies":[{"supplier":{"identity":"SEED-430#read-published-project-data-from-local-git","href":"seeds/SEED-430-read-published-project-data-from-local-git.md#read-published-project-data-from-local-git"},"implementation":"Board-opening test fixtures that publish through real routed Git origins","rationale":"The Board's Git read can only be proved where the suites hold a real origin at the answered revision; switching it first would break every Board open in the suites.","condition":"SEED-430#read-published-project-data-from-local-git has landed on origin/main: committed origins, publishes() and the default answer publish through real routed origins whose main holds the answered revision.","state":"satisfied","resolution":{"revision":"1e2edf48ff3abdb521ad2bef8828b47dafa80eef","path":".planning/seeds/SEED-430-read-published-project-data-from-local-git.md#read-published-project-data-from-local-git","summary":"Origin main accepted f05e15351e85617fab1bf8fa97b8f7f6c0eb7568. At the before-cleanup revision, plan 819 slices 1-4 are done: publishCommittedOrigin routes its origin through every dashboard HOME its fake GitHub serves and keeps the origin's main at the answered revision; publishes() without a revision commits a real origin that serving by name routes, with a republication replacing only its own earlier route; the default answer commits a real origin linked for the seeded projects; answer wrappers keep their origin. committed-origin-actions.spec.ts checks ls-remote under the dashboard HOME, and both full suites passed on each slice. Intent Coverage at 4baf31b4f found the republication path missing from maintained checks; plan 824 slice 6 owns that proof.\nCondition satisfied: committed origins, publishes() and the default answer publish through real routed origins whose main holds the answered revision.\nCondition satisfied: SEED-430#read-published-project-data-from-local-git has landed on origin/main: committed origins, publishes() and the default answer publish through real routed origins whose main holds the answered revision.\nAccepted integration: f05e15351e85617fab1bf8fa97b8f7f6c0eb7568 on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-430#open-the-board-from-the-verified-git-trunk","href":"seeds/SEED-430-read-published-project-data-from-local-git.md#open-the-board-from-the-verified-git-trunk"},"implementation":"Verified local trunk check behind every Board open","rationale":"Automatic observation, branch progress, pinned records, Review sharing and containment extend the verified observation.","condition":"The Board opens from a verified local trunk pin with no REST membership dispatch, and both migrated fixture suites pass","state":"waiting"},{"supplier":{"identity":"SEED-430#refresh-published-board-in-place","href":"seeds/SEED-430-read-published-project-data-from-local-git.md#refresh-published-board-in-place"},"implementation":"Verified local trunk observation behind the Board's open and Refresh, with durable atomic confirmation","rationale":"Automatic observation, branch progress, pinned records, Review sharing and containment extend the verified observation and its confirmation.","condition":"The Board opens and refreshes from a verified local trunk pin, with atomic confirmation, and both migrated fixture suites pass","state":"waiting"}]}
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
