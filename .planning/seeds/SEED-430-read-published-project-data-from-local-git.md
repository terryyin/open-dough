---
id: SEED-430
status: active
planted: 2026-11-24
planted_during: Developer decision to extend shared Git refresh to published Dashboard reads
trigger_when: selected from the product backlog after the Review repository is in use
scope: one story
---

# SEED-430 — Read published project data from local Git

<a id="read-published-project-data-from-local-git"></a>

### Read published project data from local Git

**Identity:** SEED-430#read-published-project-data-from-local-git
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-430#read-published-project-data-from-local-git","dependencies":[{"supplier":{"identity":"SEED-428#read-reviews-from-the-review-repository","href":"seeds/SEED-428-read-reviews-from-the-review-repository.md#read-reviews-from-the-review-repository"},"implementation":"Dashboard-owned Review repository for each project with shared, bounded Git fetches","rationale":"The next published reader extends that live storage and freshness boundary. A temporary store or checkout reader would duplicate it and could expose a second version of the same published state.","condition":"SEED-428 has landed on origin/main. Published comparisons can use the Dashboard-owned Review repository independently of the execution checkout, and their concurrent readers share a bounded fetch.","state":"waiting"}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal.** A developer can open the Board, inspect published work, and see it
advance with origin. Opening details uses local Git, and the Dashboard shows
when it last confirmed the published state or whether a refresh failed.

**Starting point.** Extend the Review repository and shared fetch that SEED-428
delivered in `dashboard/server/reviewRepository.ts`, after its correction
[Read review files without fetching](SEED-428-read-reviews-from-the-review-repository.md#read-review-files-without-fetching).
That delivery left two gaps for this story's refresh design:
- Exact-ref fetches never prune, so a story branch deleted on origin is
  still read from its stale tracking ref, with no notice.
- One sync record covers every ref and is not written atomically. A trunk sync
  that succeeds before the branch sync fails reports the branch as fresh, and
  a torn write reads as never synced.
Origin remains authoritative for durable project records. The execution checkout
supplies sessions and their worktrees. [Dashboard ADR](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state)

**Read inventory.** Move these reads to Git while preserving the meaning of
their answers, including pins, reachability, and absence.

| Published data | Current read paths |
| --- | --- |
| Configured trunk, watched story branch heads, branch-only plan progress, and publication containment | [Board opening](../../dashboard/server/performedRead.ts), [HTTP revision check](../../dashboard/server/performedRevisionCheck.ts), [revision stream](../../dashboard/server/sourceRevisionStream.ts), [ref listing and fallback](../../dashboard/server/ghRevision.ts), [branch heads](../../dashboard/server/branchHeads.ts), [branch detail and commit time](../../dashboard/server/performedBranchRead.ts), and [accepted commit containment](../../dashboard/server/containmentRead.ts). |
| Backlog membership and priority, story seeds, plans, requests, and reachable documents | [Authenticated reads](../../dashboard/server/authenticatedRead.ts) and [pinned file reads](../../dashboard/server/performedRead.ts). |
| Preparing and Taken agent profiles, Done catalog and record bodies, published session records, and the Done record that admits a follow-up | [Agent profiles](../../dashboard/server/listedRecordsRead.ts), [Done records](../../dashboard/server/doneCatalogRead.ts), [sessions](../../dashboard/server/publishedSessionsRead.ts), and [follow-up admission](../../dashboard/server/followUpStory.ts). |
| Intent location configuration, its directory and recursive tree listings, selected source files, and proof optimization candidates | [Locations and trees](../../dashboard/server/intentLocationsRead.ts), [selected files](../../dashboard/server/performedRead.ts), and [candidates](../../dashboard/server/intentCandidatesRead.ts). |
| Path history, last commit time, and the commit, name, and date for an agent profile's current allocation | [Path commit time](../../dashboard/server/ghCommitTime.ts), [profile-addition walk](../../dashboard/server/ghProfileAddition.ts), [commit file changes](../../dashboard/server/ghCommit.ts), and [attribution read](../../dashboard/server/additionRead.ts). Keep GitHub's account and avatar match as a provider lookup keyed by the exact adding commit. |
| Git inputs to CI views and judgment | Replace the [branch-history GitHub call](../../dashboard/server/baseCiGitHubReads.ts) used by [CI status and launch judgment](../../dashboard/server/baseCiJudgment.ts) and the [Taken branch lookup and fetch](../../dashboard/server/takenStoryEndpoints.ts) used by CI comparisons. Source published [first-parent and subject reads](../../dashboard/server/baseCiRevisionGit.ts) and [landing order](../../dashboard/server/intentCiHistoryRead.ts) from shared history where it supplies the recorded revisions. Keep the launch judgment's fresh-read requirement and exact-run rules. |
| Feedback maintenance watch list | [Scheduled maintenance](../../dashboard/server/feedbackMaintenanceCheck.ts) resolves trunk and reads the watch list. Use the shared refresh and pinned tree for the check that can authorize a launch. |
| Project setup | [Add Project](../../dashboard/server/projectAddition.ts) asks GitHub for the default branch. Check access and discover symbolic `HEAD` through the same authenticated Git transport. Keep the execution-checkout origin validation as a setup check. |

**Refresh architecture.** Follow the
[Architectural North Star](../NORTH-STAR.md#share-one-refresh-for-published-dashboard-git-reads).
Scope the coordinator to the configured project and authorized origin. Cold
opening, manual Refresh, and the active revision observer request a bounded
check from that coordinator. Review uses it too. Reuse the
[shared observation](../../dashboard/server/sharedObservation.ts)
and [revision stream](../../dashboard/server/revisionStreamObservation.ts)
for timing, with the same coordinator behind the HTTP fallback. Overlapping
demand joins a check that covers the required refs and freshness. A request
that needs a newer observation or an additional ref shares the next check.
Machine maintenance and launch admission can request a fresh check with the
same boundary and their existing wait limits.

Probe the configured trunk and relevant published story branches together.
Fetch incrementally into the Review repository when a tip changed or its
objects are missing. Publish a new observation only after Git can verify the
required commits locally, including when a ref moves between probe and fetch.
Check branch-only moves and confirmed deletions even while trunk stays still.
If a new trunk names a new story branch, check it before reporting its head.
Carry the observation time and result through the existing status path.
Opening with synced data can show the last readable revision during refresh.
A failed check preserves that revision with a stale or unavailable status.
Cold failures and authorization refusals retain their own outcomes.

Read pins, trees, blobs, path history, and ancestry from the Review repository.
Each detail read uses the requested published revision and existing source,
branch, and path admission. Retain already-admitted pins for their existing
read lifetime even when a branch is deleted or rewritten. An object present
on disk alone confers no access.
Preserve the origins of CI runs, jobs, and artifacts, GitHub account and avatar
facts, local session state, and the Git operations that actually launch,
publish, or land work. Retire the replaced Contents, Trees, Refs, Compare, and
Commit REST readers and any REST response caching and retry support that loses
its last caller. Keep the remaining provider lookups scoped to their own data.

**Key examples and proof.**

- After a cold sync, open the Board, story, branch plan, Done record, session,
  and Intent source. Verify the same data and pins, with zero GitHub API calls
  or remote Git operations for those detail reads. Show request counts and
  cold and warm timing through those entry points. Test provider-backed
  enrichment independently.
- Publish a backlog change, then advance and delete a watched branch without
  moving trunk. Two tabs and an open review share each scheduled or explicit
  refresh. An unchanged probe needs no fetch. The visible revisions advance
  only when readable and the already-open pinned detail retains its revision.
- Break origin access during an incremental refresh and reconnect. Verify
  the last successful check time and readable pins, a separate cold failure,
  and recovery on Refresh. Prove that a failed or raced fetch neither advances
  the visible tip nor reports an unconfirmed branch deletion, and that stale
  evidence never satisfies an action's fresh-check requirement.

**Effort hypothesis.** L, with medium confidence until SEED-428's fetch
contract and the launch and CI consumers' freshness rules are confirmed.
