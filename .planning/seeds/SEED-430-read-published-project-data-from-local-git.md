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

<a id="refresh-published-board-in-place"></a>

### Refresh the published Board in place

**Identity:** SEED-430#refresh-published-board-in-place
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-430#refresh-published-board-in-place","dependencies":[{"supplier":{"identity":"SEED-430#open-the-board-from-the-verified-git-trunk","href":"seeds/SEED-430-read-published-project-data-from-local-git.md#open-the-board-from-the-verified-git-trunk"},"implementation":"The verified Git trunk check behind every Board open, with the REST membership dispatch removed","rationale":"Refresh runs the same verified check and extends its result with a durable confirmation; building it beside the REST dispatch would duplicate the check and its failure handling.","condition":"The Board opens at a verified Git trunk revision with no REST membership dispatch, and both Dashboard suites pass","state":"satisfied","resolution":{"revision":"d71b0c6d6dc3c767a80efc93ac03247f467d7881","path":".planning/seeds/SEED-430-read-published-project-data-from-local-git.md#open-the-board-from-the-verified-git-trunk","summary":"Verified at accepted integration: the Board's `ref` read (open, project select, reload, launch reconciliation's fresh read) answers from the shared verified-origin trunk check in `dashboard/server/performedRefRead.ts` and the REST membership dispatch is removed; `resolveRevisionViaGh` keeps its three callers. Both Dashboard suites passed in hosted CI on the story branch (c4a757d83 run, 3d1fa24ce run 45961565842). Plan 856 slices 1-9 done; Intent Coverage caught a REST-fallback fault. Refresh's plan 853 now starts with two correction slices from this story's review.\nCondition satisfied: The Board opens at a verified Git trunk revision with no REST membership dispatch, and both Dashboard suites pass\nAccepted integration: 72cbe76dacde35db57ceac1f2592508455e4529c on origin/refs/heads/main."}}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/853-refresh-published-board-in-place/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"0a7439ae52c0f4b0d5ed401fde93e02ddbaa0f200feb99fb80fb0acb88bef976","plan":"48d24528c13e62bb9d84afa6738de1c75f825eed8a55d300986b94985d22452f"}}
```

**Goal.** A developer can confirm what is published without reloading the
page. The Board names when it was last confirmed and explains a failed
Refresh while the developer keeps working from the confirmed view.

**Scope.** The Board perspective's project actions row shows a quiet
"Checked <time>" note, worded as System settings Usage words it, and an
icon button labeled "Refresh", as the Review panel has it. Refresh runs
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
{"schemaVersion":1,"identity":"SEED-430#follow-published-progress-from-local-git","dependencies":[{"supplier":{"identity":"SEED-430#read-published-project-data-from-local-git","href":"seeds/SEED-430-read-published-project-data-from-local-git.md#read-published-project-data-from-local-git"},"implementation":"Board-opening test fixtures that publish through real routed Git origins","rationale":"The Board's Git read can only be proved where the suites hold a real origin at the answered revision; switching it first would break every Board open in the suites.","condition":"SEED-430#read-published-project-data-from-local-git has landed on origin/main: committed origins, publishes() and the default answer publish through real routed origins whose main holds the answered revision.","state":"satisfied","resolution":{"revision":"1e2edf48ff3abdb521ad2bef8828b47dafa80eef","path":".planning/seeds/SEED-430-read-published-project-data-from-local-git.md#read-published-project-data-from-local-git","summary":"Origin main accepted f05e15351e85617fab1bf8fa97b8f7f6c0eb7568. At the before-cleanup revision, plan 819 slices 1-4 are done: publishCommittedOrigin routes its origin through every dashboard HOME its fake GitHub serves and keeps the origin's main at the answered revision; publishes() without a revision commits a real origin that serving by name routes, with a republication replacing only its own earlier route; the default answer commits a real origin linked for the seeded projects; answer wrappers keep their origin. committed-origin-actions.spec.ts checks ls-remote under the dashboard HOME, and both full suites passed on each slice. Intent Coverage at 4baf31b4f found the republication path missing from maintained checks; plan 824 slice 6 owns that proof.\nCondition satisfied: committed origins, publishes() and the default answer publish through real routed origins whose main holds the answered revision.\nCondition satisfied: SEED-430#read-published-project-data-from-local-git has landed on origin/main: committed origins, publishes() and the default answer publish through real routed origins whose main holds the answered revision.\nAccepted integration: f05e15351e85617fab1bf8fa97b8f7f6c0eb7568 on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-430#open-the-board-from-the-verified-git-trunk","href":"seeds/SEED-430-read-published-project-data-from-local-git.md#open-the-board-from-the-verified-git-trunk"},"implementation":"Verified local trunk check behind every Board open","rationale":"Automatic observation, branch progress, pinned records, Review sharing and containment extend the verified observation.","condition":"The Board opens from a verified local trunk pin with no REST membership dispatch, and both migrated fixture suites pass","state":"satisfied","resolution":{"revision":"d71b0c6d6dc3c767a80efc93ac03247f467d7881","path":".planning/seeds/SEED-430-read-published-project-data-from-local-git.md#open-the-board-from-the-verified-git-trunk","summary":"Verified at accepted integration: every Board open reads a verified local trunk pin through `SharedVerifiedOriginTrunk`, with no REST membership dispatch, and the migrated fixture suites (Dashboard Backend and E2E) passed in hosted CI on the story branch (c4a757d83; 3d1fa24ce run 45961565842). Plan 856 slices 1-9 done. Review still shares the bare review repository with the Board check (FETCH_HEAD, creation, upload-pack gate); plan 853 slice 2 owns that correction.\nCondition satisfied: The Board opens from a verified local trunk pin with no REST membership dispatch, and both migrated fixture suites pass\nAccepted integration: 72cbe76dacde35db57ceac1f2592508455e4529c on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-430#refresh-published-board-in-place","href":"seeds/SEED-430-read-published-project-data-from-local-git.md#refresh-published-board-in-place"},"implementation":"Verified local trunk observation behind the Board's open and Refresh, with durable atomic confirmation","rationale":"Automatic observation, branch progress, pinned records, Review sharing and containment extend the verified observation and its confirmation.","condition":"The Board opens and refreshes from a verified local trunk pin, with atomic confirmation, and both migrated fixture suites pass","state":"waiting"}]}
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
