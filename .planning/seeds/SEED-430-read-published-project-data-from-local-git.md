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
