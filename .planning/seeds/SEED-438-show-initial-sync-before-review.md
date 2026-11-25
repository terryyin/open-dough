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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/822-show-initial-sync-before-review/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"59e0e9bc51884ef08aee9eefb14e73694ee7516ebea3c047bd0d02d74524064e","plan":"162ff3de178c496e6e53666dfe00e82a8e118e21f96f0fd4d913371f2342dc75"}}
```

**Goal.** A developer opening **Review changes** on a project that has never
synced its published history can follow the first sync and then review the
story they selected, using the project's published changes and historical
source. One open should be enough even when the first fetch is slow.

**Observed failure.** Repeated Done-story review opens showed “The story's
historical Intent locations and test source are unavailable: its landed
result could not be established.” On 2026-11-25 around 12:42 SGT, the running
Open Dough dashboard was deployed at `b127d984fd16`. Its separate bare Review
repository for `terryyin/open-dough` had no published refs or successful sync
record and held three incomplete Git pack files of about 117–133 MiB each.
The checkout had full history. A cancelled or timed-out first fetch is
consistent with those observations. The exact failed request error was
uncaptured.

The [current Done reader](../../dashboard/server/storyReviewPublished.ts)
needs the story's published completion before Intent can look up historical
locations and source. The 50-second cold fetch budget is part of the
[per-open deadline](../../dashboard/server/reviewRepository.ts), and the
[shared fetch](../../dashboard/server/gitTargetFetch.ts) stops when its last
waiter leaves. A local Done reader with a scaled deadline returned a sync
timeout and left no successful sync. This reproduces the failure mechanism.
The deployed request's exact failure remains unknown.

**Scope.** Opening **Review changes** remains one action. A bounded review
response identifies when the configured project needs its first sync. The
open pane calls a separate endpoint to start or join it, explains the first
sync, and shows **Running initial sync**. When the server confirms readable
published history, the pane automatically resumes the same review request,
including its story and comparison selection. Changing stories or closing
the pane ends that pane's wait. A completion arriving later belongs to the
request that asked for it.

The Dashboard server owns one ongoing initial sync per configured project.
The sync outlives its review and status requests and keeps running while Git
makes progress, including beyond the former per-open budget. A refusal or
stall settles the attempt as failed. An open or reopened pane shows the
specific failure and offers **Retry sync**, which starts or joins one new
attempt. The pane shows the sync state throughout, including failure. The
historical-source explanation applies when synced history still cannot
establish the story's result.

Already-synced Review opens retain their bounded refresh, the latest readable
comparison and its notice when refresh fails, and the usual comparison and
access checks. This story covers on-demand initial sync for story reviews.
Scheduled prewarming, cross-restart job resumption, and migrating Board reads
are outside this increment.

**Architecture.** Keep the operation and its status in the Dashboard's
Review repository and refresh boundary. The configured origin's verified,
locally readable published trunk is the handoff to normal review admission.
An arbitrary fetched ref or pack in progress cannot establish that handoff.
One project operation gives each pane a bounded wait and lets Git continue
after the pane leaves. The selected story stays with the pane, since multiple
panes can use the same project sync for different reviews. This follows
[ADR 0008, Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
and [ADR 0002, Software development lifecycle principles](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md).
[SEED-430](SEED-430-read-published-project-data-from-local-git.md#read-published-project-data-from-local-git)
extends the same boundary to Board and Review and supplies the
[shared refresh direction](../NORTH-STAR.md#share-one-refresh-for-published-dashboard-git-reads).
Both stories can build on the existing Review repository.

**Key examples.**

- Open a Done story on a configured project with an empty Review repository.
  Let the fetch make progress beyond the former first-fetch limit. The pane
  shows **Running initial sync** while the separate operation continues.
  Verified completion automatically opens the original story’s review with
  its historical changes and source.
- Open two reviews for the same cold project in separate tabs. Both see the
  same running sync. Close both and reopen one. It rejoins the running sync
  or opens the requested review if the sync has finished. If a pane switches
  to another story while waiting, the earlier completion never reselects
  the first story.
- Make origin refuse the fetch or stop making progress. The pane shows the
  specific sync failure and **Retry sync**. Reopening before recovery shows
  that failure again. Restore origin and choose **Retry sync**. The selected
  review opens after the successful sync.
- Open a review on an already synced project and verify the usual path,
  including the last successful comparison and failure notice when refresh
  fails. With synced history that cannot establish a particular story’s
  completion, verify the historical-source explanation.

**Sources.** [Deadline change and rationale](https://github.com/terryyin/open-dough/blob/557b4e7c950daabe1b79913e6e8231af54ded220/.planning/slice-plans/816-read-review-files-without-fetching/PLAN.md#direction),
[Review repository sync](../../dashboard/server/reviewRepository.ts), and
[historical Intent location selection](../../dashboard/src/useHistoricalIntentLocations.tsx).
