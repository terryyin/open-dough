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

<a id="follow-published-progress-from-local-git"></a>

### Follow published progress from local Git

**Identity:** SEED-430#follow-published-progress-from-local-git
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/823-follow-published-progress-from-local-git/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"5ce088baca39a8f84478d136da3d6df6b1798d691a53f4e7cb47b16a2e3c263a","plan":"53b4b541ee2197a4dd4bb5b798b8d9a28be36d6fb670d4c80fcbb277e91894f4"}}
```
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-430#follow-published-progress-from-local-git","dependencies":[{"supplier":{"identity":"SEED-430#read-published-project-data-from-local-git","href":"seeds/SEED-430-read-published-project-data-from-local-git.md#read-published-project-data-from-local-git"},"implementation":"Board-opening test fixtures that publish through real routed Git origins","rationale":"The Board's Git read can only be proved where the suites hold a real origin at the answered revision; switching it first would break every Board open in the suites.","condition":"SEED-430#read-published-project-data-from-local-git has landed on origin/main: committed origins, publishes() and the default answer publish through real routed origins whose main holds the answered revision.","state":"satisfied","resolution":{"revision":"1e2edf48ff3abdb521ad2bef8828b47dafa80eef","path":".planning/seeds/SEED-430-read-published-project-data-from-local-git.md#read-published-project-data-from-local-git","summary":"Origin main accepted f05e15351e85617fab1bf8fa97b8f7f6c0eb7568. At the before-cleanup revision, plan 819 slices 1-4 are done: publishCommittedOrigin routes its origin through every dashboard HOME its fake GitHub serves and keeps the origin's main at the answered revision; publishes() without a revision commits a real origin that serving by name routes, with a republication replacing only its own earlier route; the default answer commits a real origin linked for the seeded projects; answer wrappers keep their origin. committed-origin-actions.spec.ts checks ls-remote under the dashboard HOME, and both full suites passed on each slice. Intent Coverage at 4baf31b4f found the republication path missing from maintained checks; plan 824 slice 6 owns that proof.\nCondition satisfied: committed origins, publishes() and the default answer publish through real routed origins whose main holds the answered revision.\nCondition satisfied: SEED-430#read-published-project-data-from-local-git has landed on origin/main: committed origins, publishes() and the default answer publish through real routed origins whose main holds the answered revision.\nAccepted integration: f05e15351e85617fab1bf8fa97b8f7f6c0eb7568 on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-430#open-the-board-from-the-verified-git-trunk","href":"seeds/SEED-430-read-published-project-data-from-local-git.md#open-the-board-from-the-verified-git-trunk"},"implementation":"Verified local trunk check behind every Board open","rationale":"Automatic observation, branch progress, pinned records, Review sharing and containment extend the verified observation.","condition":"The Board opens from a verified local trunk pin with no REST membership dispatch, and both migrated fixture suites pass","state":"satisfied","resolution":{"revision":"d71b0c6d6dc3c767a80efc93ac03247f467d7881","path":".planning/seeds/SEED-430-read-published-project-data-from-local-git.md#open-the-board-from-the-verified-git-trunk","summary":"Verified at accepted integration: every Board open reads a verified local trunk pin through `SharedVerifiedOriginTrunk`, with no REST membership dispatch, and the migrated fixture suites (Dashboard Backend and E2E) passed in hosted CI on the story branch (c4a757d83; 3d1fa24ce run 45961565842). Plan 856 slices 1-9 done. Review still shares the bare review repository with the Board check (FETCH_HEAD, creation, upload-pack gate); plan 853 slice 2 owns that correction.\nCondition satisfied: The Board opens from a verified local trunk pin with no REST membership dispatch, and both migrated fixture suites pass\nAccepted integration: 72cbe76dacde35db57ceac1f2592508455e4529c on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-430#refresh-published-board-in-place","href":"seeds/SEED-430-read-published-project-data-from-local-git.md#refresh-published-board-in-place"},"implementation":"Verified local trunk observation behind the Board's open and Refresh, with durable atomic confirmation","rationale":"Automatic observation, branch progress, pinned records, Review sharing and containment extend the verified observation and its confirmation.","condition":"The Board opens and refreshes from a verified local trunk pin, with atomic confirmation, and both migrated fixture suites pass","state":"satisfied","resolution":{"revision":"07e7c56a89041f123d48d79a5dba7ddd23e72f7b","path":".planning/seeds/SEED-430-read-published-project-data-from-local-git.md#refresh-published-board-in-place","summary":"Verified at accepted integration: the Board's open and its Refresh button both run the shared verified Git trunk check (`SharedVerifiedOriginTrunk`, fresh demand for Refresh and launch reconciliation), which fetches into `refs/open-dough/board/<branch>` and publishes revision and `confirmedAt` together through the durable record in `dashboard/server/boardConfirmation.ts`; a warm open or Refresh at origin's advertised revision skips the fetch. Plan 853 slices 1-6 done; Intent Coverage at 7dcc16adb caught a disabled warm path. Hosted CI passed every job, including Dashboard Backend, Dashboard Frontend and E2E, on the story branch at 7dcc16adbe3edde4d44d91ee94f3f3a2afa7a497 (run 45998545672). Plan 823 now leads with two corrections from this story's review.\nCondition satisfied: The Board opens and refreshes from a verified local trunk pin, with atomic confirmation, and both migrated fixture suites pass\nAccepted integration: e8900025b6a0b3adc55b56b65eb0f4cec8404cc5 on origin/refs/heads/main."}}]}
```

**Goal.** A developer can follow trunk and story-branch changes on origin
from the Board with the execution checkout absent or behind, and can trust
the Board's confirmation time and failure notice while doing so.

**Scope.** Automatic observation (the revision stream and its HTTP
fallback) runs the same verified Git check as Refresh and publishes through
the same durable confirmation record. It advances the confirmation time
when origin confirms the same tips and advances the Board when new tips are
verified, with the existing pace and visibility behavior. A departing tab
releases only its own wait.

The Board follows trunk membership and priority, Preparing and Taken
assignments, and branch-only plan progress, including the plan's commit
time, from verified heads. A newly watched branch is checked before its
head is reported, and a race or missing object never exposes an unverified
head. Once a successful probe confirms a branch's deletion, the Board shows
that the branch is no longer published; a failed probe keeps the last
confirmed branch state and its time.

When a verified check cannot record its confirmation, the Board shows the
existing read failure beside the view it presents, whichever revision that
is, including a cold open that shows the former confirmed view.

Pinned record reads, Board and Review sharing one check, and
accepted-publication containment belong to the sibling stories below.

**Key examples.**

- Given a visible Board at trunk A, origin advances trunk to B. Without a
  Refresh the Board shows B with a new confirmation time; with origin
  unchanged the next check only advances the time.
- Given an automatic advance to B, a Refresh whose confirmation write fails
  keeps B and shows the read failure; it does not move the Board back to A.
- Given a Taken story whose branch moves while trunk stays fixed, the Board
  shows the branch's new plan progress and commit time with the execution
  checkout absent. After the branch is deleted on origin, the Board shows it
  is no longer published.

**Frontend closure handoff (2026-11-28).**
SEED-413#keep-full-frontend-runs-connected named the cause of the frontend
group's `VITEST_BROWSER_CONNECTION_CLOSED`: Chromium renderer growth from
per-file module revalidation. It repaired that by upgrading Vitest to
5.1.2. Vite's orchestrator reload only follows the socket drop. The
`keepVitestOrchestratorOpen` plugin (`cfa5f8396`) and
`diagnosis-frontend-browser-connection.md` on this story's branch therefore
leave the branch before it lands, and `dashboard/frontend.vitest.config.mts`
keeps trunk's form.

<a id="read-board-records-at-published-pins"></a>

### Read Board records at their published pins

**Identity:** SEED-430#read-board-records-at-published-pins
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-430#read-board-records-at-published-pins","dependencies":[{"supplier":{"identity":"SEED-430#follow-published-progress-from-local-git","href":"seeds/SEED-430-read-published-project-data-from-local-git.md#follow-published-progress-from-local-git"},"implementation":"Verified trunk and watched-branch observation through the shared check and its confirmation record","rationale":"Branch details are admitted only from a verified branch observation; pins cannot be admitted or retained before the check verifies branch heads.","condition":"SEED-430#follow-published-progress-from-local-git has landed on origin/main: the Board's verified check publishes locally readable trunk and watched branch revisions and can require a new check within the caller's wait bound.","state":"waiting"}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"planned","plan":"../slice-plans/887-read-board-records-at-published-pins/PLAN.md"}
```

**Goal.** A developer can open the Board's published records with the
execution checkout absent or behind, read locally at the revision the Board
shows, without GitHub API calls for those records.

**Scope.** Read reachable stories, plans, requests, and documents, the Done
catalog and bodies, published session records, and the pinned Done record
used for follow-up admission, at the verified pin. Check
accepted-publication containment at the shown revision and reconcile a
local launch only from verified containment. Preserve the distinction
between absence and an unreadable record, and between publication and
machine-local launch or session evidence. A detail already admitted at a
revision keeps its pin for its existing lifetime through branch deletion or
rewrite. Admission follows the configured source and the existing revision,
branch, and path rules; mere object presence confers no admission. Retire
superseded REST reads and caching only when they lose their last caller.

**Key examples.**

- Given a confirmed Board with an absent execution checkout, open a story,
  branch plan, Done record, and published session. Each reads the admitted
  pin with zero remote Git operations and zero GitHub API calls.
- Given an opened branch plan, its branch is rewritten on origin and the
  Board refreshes. Reopening the detail during its read lifetime returns
  the original revision; a different revision merely present locally is
  refused.

<a id="share-one-refresh-across-board-and-review"></a>

### Share one project refresh across Board and Review

**Identity:** SEED-430#share-one-refresh-across-board-and-review
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-430#share-one-refresh-across-board-and-review","dependencies":[{"supplier":{"identity":"SEED-430#follow-published-progress-from-local-git","href":"seeds/SEED-430-read-published-project-data-from-local-git.md#follow-published-progress-from-local-git"},"implementation":"Verified trunk and watched-branch observation through the shared check and its confirmation record","rationale":"Review can share only a check that already covers watched branches and fresh demand; sharing before that would join Review to a trunk-only check.","condition":"SEED-430#follow-published-progress-from-local-git has landed on origin/main: the Board's verified check publishes locally readable trunk and watched branch revisions and can require a new check within the caller's wait bound.","state":"waiting"}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"planned","plan":"../slice-plans/888-share-one-refresh-across-board-and-review/PLAN.md"}
```

**Goal.** Board tabs and Review opens of one project share one bounded
verified check, so a developer sees the same published state in both and
origin is asked once per covered demand.

**Scope.** A Board open, manual Refresh, active revision observer, and
Review open share the same bounded check when it covers their refs and
freshness; a demand needing another ref joins the next eligible check
within its own wait bound. One record says what is current for both.
Review keeps its existing comparison admission, selection, and notices, and
file switching stays local. Review's remote fetches end with their
transport when aborted or stalled and release the repository for the next
sync.

**Key examples.**

- Given two Board tabs and a Review open, origin advances a watched branch
  while trunk stays fixed. One check serves all three, and Review's file
  switches make no remote operation.
- Given a Review fetch that stalls, its caller's deadline ends the fetch
  and its transport helpers, and the next sync starts.
