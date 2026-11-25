---
id: SEED-438
status: active
planted: 2026-11-25
planted_during: Investigation of repeated Review changes failures before the project’s first sync
trigger_when: selected from the product backlog
scope: one story
---

# SEED-438 — Show initial sync and open the requested review when ready

<a id="show-initial-sync-before-review"></a>

### Show initial sync and open the requested review when ready

**Identity:** SEED-438#show-initial-sync-before-review
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal.** A developer opening **Review changes** for a project whose
published history has never synced can see the initial sync running, then
review the story they selected as soon as its published history is ready.

**Observed failure.** Repeated Done-story review opens showed “The story's
historical Intent locations and test source are unavailable: its landed
result could not be established.” On 2026-11-25 around 12:42 SGT, the running
Open Dough dashboard was deployed at `b127d984fd16`. Its separate bare Review
repository for `terryyin/open-dough` had no published refs or successful sync
record and held three incomplete Git pack files of about 117–133 MiB each.
The checkout had full history. A cancelled or timed-out first fetch is
consistent with those observations. The exact failed request error was
uncaptured.

The review needs the story's published completion or landing revision before
it can look up the historical Intent locations and test source. The message
appears before those files are checked. Commit `557b4e7c9` introduced a shared
per-open fetch deadline so a hanging origin would leave time to answer within
the 60-second review response limit. It allows 50 seconds before the first
successful project sync and 30 seconds afterward, with a 30-second fetch bound
for session opens. The last successful sync can answer a warm review with a
failure notice. The shared fetch is cancelled when its last waiter leaves.
A large first fetch can therefore transfer data on each attempt and still
leave the project without a usable comparison.

**Agreed flow.** Opening **Review changes** remains one user action. When the
review reports that the project needs its initial sync, the frontend calls a
separate API endpoint to start or join that project’s sync. The review pane
explains that the project has yet to sync and shows **Running initial sync**.
The frontend follows the sync status and automatically retries the original
review for the same story once the server confirms that the required published
history is ready. A failed sync shows the specific failure and offers
**Retry sync**.

**Scope to refine.** The server owns the sync independently of any review or
status request. Concurrent tabs and reviews for the same configured project
share one initial sync. Closing a review releases that pane’s wait, and the
sync continues. A later review can join it and see its current state. Give
the sync its own stall detection so a slow transfer can continue while Git
is making progress. Keep review requests bounded and preserve their normal
behavior once the project has a successful sync. When published history is
ready, apply the usual story comparison and access checks. Reserve the
historical-source explanation for a review whose result still cannot be
established after sync.

Use the Dashboard-owned Review repository and coordinate with the shared
Board and Review refresh in [SEED-430](SEED-430-read-published-project-data-from-local-git.md#read-published-project-data-from-local-git).
The initial sync and normal refresh use the same configured origin and
verified published history under
[ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
and the [shared refresh direction](../NORTH-STAR.md#share-one-refresh-for-published-dashboard-git-reads).

**Acceptance examples.**

- Open a Done story on a configured project with an empty Review repository.
  Let the fetch make progress beyond the former first-fetch limit. The pane
  shows **Running initial sync** while the separate operation continues.
  Verified completion automatically opens the original story’s review with
  its historical changes and source.
- Open the same project’s reviews in two tabs and close both while the sync
  is in progress. The one sync continues. Reopen a review and see its current
  status or, if it has finished, the requested review.
- Make origin refuse the fetch or stall. The pane shows the sync failure
  and **Retry sync**. Restore origin and retry. The review opens after the
  successful sync.
- Open a review on an already synced project and verify the usual path,
  including the last successful comparison and failure notice when refresh
  fails. With synced history that cannot establish a particular story’s
  completion, verify the historical-source explanation.

**Sources.** [Deadline change and rationale](https://github.com/terryyin/open-dough/blob/557b4e7c950daabe1b79913e6e8231af54ded220/.planning/slice-plans/816-read-review-files-without-fetching/PLAN.md#direction),
[Review repository sync](../../dashboard/server/reviewRepository.ts), and
[historical Intent location selection](../../dashboard/src/useHistoricalIntentLocations.tsx).
