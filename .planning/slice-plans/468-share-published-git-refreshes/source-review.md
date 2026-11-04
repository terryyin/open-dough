# Source review — SEED-232#share-published-git-refreshes

**Launch:** Fresh general-purpose reviewer, no conversation inheritance; only
the selected story's Goal, Scope, key examples, deferred promises, scope
limits, and evaluation basis; no plan, return, product, or proof; no human
amendments.
**Input:** `.planning/seeds/SEED-232-reduce-dashboard-refresh-traffic.md#share-published-git-refreshes`
as supplied in the reviewer prompt (verbatim Goal through Evaluation basis).

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A developer following one published project from several visible dashboard pages of one dashboard process sees newly published work within the current refresh pace. | slice 3 | |
| 2 | While that process asks GitHub for one branch-head listing per pace for that project, not one per page. | slice 3 | |
| 3 | Outcome: fewer `gh` requests reach GitHub for the same observation. | slice 3 | |
| 4 | Freshness, credential isolation, rate-limit handling, and failure behavior remain as they are. | slice 3 | |
| 5 | A page's scheduled revision check is answered from the branch-head listing this dashboard process last settled for that project when that listing is younger than the check pace. | slice 1 | observed: dashboard/tests/boundary/authenticated-read-shared-listing.spec.ts: sequential checks within window cost one matching-refs |
| 6 | The reuse window is the same one host status uses — one second under the pace. | slice 1 | observed: dashboard/src/revisionCheckSchedule.ts:`checkReuseMs`; revisionChecks and hostStatusObservation both read it |
| 7 | Otherwise (no young enough settled listing), the check joins a listing already outstanding. | slice 1 | observed: dashboard/tests/boundary/authenticated-read-shared.spec.ts: concurrent checks share one outstanding listing |
| 8 | The check asks GitHub only when neither a young enough settled listing nor an outstanding listing exists. | slice 1 | observed: dashboard/tests/boundary/authenticated-read-shared-listing.spec.ts: window zero second check asks matching-refs again |
| 9 | Each page still learns its own answer from the shared listing. | slice 1 | observed: dashboard/tests/boundary/authenticated-read-shared-listing.spec.ts: different since and watched branches each report own changed/heads from one listing |
| 10.1 | whether the configured ref still names the revision that page shows | slice 1 | observed: dashboard/tests/boundary/authenticated-read-shared-listing.spec.ts: since=other reports changed:true from settled listing |
| 10.2 | the head of each story branch that page watches | slice 1 | observed: dashboard/tests/boundary/authenticated-read-shared-listing.spec.ts: watch=story/one reports that branch head from settled listing |
| 11 | A page that becomes visible again checks at once. | slice 2 | |
| 12 | under the same reuse as 5–8. | slice 2 | |
| 13 | a tab switch costs no listing when another page checked recently. | slice 2 | |
| 14 | A listing GitHub refused keeps no settled answer (as today). | slice 1 | observed: dashboard/tests/boundary/authenticated-read-shared-listing-failures.spec.ts: rate-limited listing then next check asks matching-refs again |
| 15 | A listing that failed keeps no settled answer (as today). | slice 1 | observed: dashboard/tests/boundary/authenticated-read-shared-listing-failures.spec.ts: 504 listing keeps nothing; next check asks matching-refs |
| 16 | A listing that timed out keeps no settled answer (as today). | slice 1 | observed: dashboard/tests/boundary/authenticated-read-shared-listing-failures.spec.ts: timed-out listing keeps nothing; next check asks matching-refs |
| 17 | Every page waiting on such a listing is told so alike. | slice 1 | observed: dashboard/tests/boundary/authenticated-read-revision-check-failures.spec.ts + shared-listing-failures 504/timeout/limit paths: waiters receive failed check alike |
| 18 | Every such page keeps its last snapshot. | slice 1 | observed: dashboard/tests/boundary/authenticated-read-shared-listing-failures.spec.ts: 504 path returns 200 with last revision snapshot (changed:false) |
| 19 | Every such page recovers as today. | slice 1 | observed: dashboard/tests/boundary/authenticated-read-shared-listing-failures.spec.ts: after 504/timeout/limit the next check asks GitHub again |
| 20 | A rate-limit wait remains the request owner's. | slice 1 | observed: dashboard/tests/boundary/authenticated-read-shared-listing-failures.spec.ts: rate-limited listing returns 502 GitHub limited; owner wait unchanged |
| 21 | A rate-limited answer serves no later check. | slice 1 | observed: dashboard/tests/boundary/authenticated-read-shared-listing-failures.spec.ts: rate-limited listing serves no later check (asks matching-refs again) |
| 22 | Reuse is per dashboard process. | slice 1 | observed: dashboard/server/revisionChecks.ts: SharedObservation per process instance (in-memory per RevisionChecks) |
| 23 | Reuse is per project. | slice 1 | observed: dashboard/server/revisionChecks.ts: one SharedObservation per catalog source.id |
| 24 | Reuse is per request-owner scope (host and login). | slice 1 | observed: dashboard/server/revisionChecks.ts: demand keyed by ownerScope from GitHubRequests.scope() |
| 25 | A listing read under one login never answers a check under another. | slice 1 | observed: dashboard/tests/boundary/authenticated-read-shared-listing-failures.spec.ts: settled under login-a does not answer login-b (second listing) |
| 26 | Separately launched dashboard processes keep sharing only outstanding requests as today (not settled listings across processes). | slice 1 | observed: dashboard/server/revisionChecks.ts + story: settled reuse is in-process SharedObservation; separately launched processes share only outstanding via GitHubRequests as today |
| 27 | A reload of a project still resolves the configured ref afresh, as today. | slice 2 | |
| 28 | A return to a project still resolves the configured ref afresh, as today. | slice 2 | |
| 29 | those paths do not reuse a settled listing. | slice 2 | |
| 30 | The branch-head listing's `304` hint stays as it is. | slice 1 | observed: dashboard/tests/boundary/authenticated-read-revision-check.spec.ts: conditional 304 hint path unchanged |
| 31 | Content reuse at known commits stays as it is. | slice 1 | observed: dashboard/tests/boundary/authenticated-read-revision-check.spec.ts: content at known commits unchanged |
| 32 | The eight-at-once bound stays as it is. | slice 1 | observed: dashboard/tests/boundary/authenticated-read-revision-check.spec.ts: eight-at-once bound unchanged |
| 33 | The 30-second wait bound stays as it is. | slice 1 | observed: dashboard/server/revisionChecks.ts: demand waits readWaitLimitMs (30s) |
| 34 | A listing whose every page left before it settled may still settle, so that its answer serves the next check within the window. | slice 1 | observed: dashboard/tests/boundary/authenticated-read-shared-listing.spec.ts: requester gone before settlement; next check within window costs nothing |
| 35 | today the last page leaving aborts it. | slice 1 | observed: dashboard/tests/boundary/authenticated-read-shared-listing.spec.ts: departed waiter leaves gh alive until listing settles; authenticated-read-shared-listing-failures.spec.ts: closing boundary aborts |
| 36 | A listing already at GitHub is counted either way. | slice 1 | observed: dashboard/tests/boundary/authenticated-read-shared-listing.spec.ts: departed-waiter case still counted matching-refs once |
| 37 | Letting such a listing settle saves the next listing. | slice 1 | observed: dashboard/tests/boundary/authenticated-read-shared-listing.spec.ts: next check after settled departed listing costs no matching-refs |
| Ex1 | Two visible pages show the same project at the same revision on one dashboard process; the second opened seven seconds after the first; origin is quiet. Over the next minute that process sends GitHub four conditional branch-head listings for that project (today: eight). Both pages keep their snapshot with no problem shown. | slice 2 | |
| Ex2 | Page A shows revision R and watches story branch X; page B shows R and watches nothing. Origin moves X. One listing answers both: A learns X's new head and reads only X's plan and last commit time there; B learns nothing changed. | slice 1 | observed: dashboard/tests/boundary/authenticated-read-shared-listing.spec.ts: one settled listing answers different since (changed) and watch=story/one (head); content-read of watched plan remains performRevisionCheck (unchanged) |
| Ex3 | Three staggered visible pages show R; origin publishes R′. Each page shows R′ within the current pace from publication (~30 seconds), after one read of R′'s backlog shared as today. A page whose own check would have fallen between the shared listing and its reuse may see R′ up to one window later than today, never later than the pace plus the window. | slice 2 | |
| Ex4 | Page B is hidden for ten minutes while page A keeps checking. B seen again three seconds after A's last listing → answered from that listing; B seen again twenty seconds after → asks GitHub. | slice 2 | |
| Ex5 | Both pages close, hide, or switch project. No further listing for that project is asked; the next visible page's check asks GitHub. | slice 1 | observed: dashboard/tests/boundary/authenticated-read-shared-listing.spec.ts: departed requester leaves listing to settle (next within window free); window-zero asks again; authenticated-read-shared-listing-failures.spec.ts: closing boundary aborts |
| Ex6 | A shared listing fails with a `504`. Both pages keep their snapshot, report the failed check as today, and the next check asks GitHub; the earlier successful listing does not stand in. | slice 1 | observed: dashboard/tests/boundary/authenticated-read-shared-listing-failures.spec.ts: 504 keeps nothing; next asks again |
| Ex7 | A check under login A settles a listing; `gh auth switch` changes the login; a check two seconds later under login B asks GitHub. | slice 1 | observed: dashboard/tests/boundary/authenticated-read-shared-listing-failures.spec.ts: scope login-a then login-b asks again |
| D1 | Sharing settled listings across separately launched dashboard processes |  | G-excl-deferred |
| D2 | Delivering updates to pages without their recurring local check (the SSE story) |  | G-excl-deferred |
| D3 | Fewer requests for a single page |  | G-excl-deferred |
| D4 | An immediate shared check on a known publication event |  | G-excl-deferred |
| E1 | No change to what a page shows |  | G-excl-limits |
| E2 | No change to when a page reads content |  | G-excl-limits |
| E3 | No new daemon |  | G-excl-limits |
| E4 | No new database |  | G-excl-limits |
| E5 | No new scheduler |  | G-excl-limits |
| E6 | No change to the request owner's protocol |  | G-excl-limits |
| M1 | Baseline: one visible page costs four listings a minute per project; N staggered pages cost 4N. | slice 3 | |
| M2 | Target: N visible pages on one process cost four a minute. | slice 3 | |
| M3 | Target: publication-to-display stays within the current pace. | slice 3 | |
| M4 | Count `gh` requests that reach GitHub, conditional `304` answers included. | slice 3 | |
| M5 | Observation (2026-11-04): a `304` left GitHub's `X-RateLimit-Used` unchanged — gain is in `gh` invocations, request-owner turns, and outage exposure, not primary rate-limit allowance. | slice 3 | |
| M6 | Count latency as time from a published commit to each page showing it. | slice 3 | |
| M7 | Permitted trade-off: Ex3's bounded extra delay for one page. | slice 3 | |
