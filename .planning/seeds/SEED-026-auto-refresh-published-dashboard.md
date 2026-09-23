---
id: SEED-026
status: active
planted: 2026-09-23
planted_during: Maintainer request to improve dashboard freshness
trigger_when: A dashboard stays open while new work is published to main
scope: unknown
---

# SEED-026: Keep the published dashboard fresh without repeated full reads

## Why This Matters

For a developer watching published project work, the dashboard currently reads
once on opening and again only after a manual Refresh. New work on `main` can
therefore remain invisible in an open page. Repeating full reads at a short
interval would waste requests and fetch the same backlog and story details when
nothing has changed.

The desired experience is that the selected project's published view updates
soon after `main` changes, while quiet periods use only a lightweight revision
check. All three project sources can use the local authenticated `gh` path;
the maintainer selected one read transport over keeping separate public and
private paths.

## Alternatives and Decision

- **Keep manual Refresh:** It avoids background requests, but the developer
  must remember to check for new work.
- **Repeat the current full read:** It improves freshness but repeatedly fetches
  unchanged backlog and detail content, and can consume the public GitHub API
  allowance quickly.
- **Check the selected ref first through `gh`:** Periodically compare the
  published `main` commit SHA with the displayed revision. Use the existing
  local authenticated boundary for all three projects, fetch a new pinned
  snapshot and its details only when the SHA changes, and retire the superseded
  direct-browser GitHub read path. Choose a cadence that balances visible
  freshness with the request budget, including idle or hidden pages.

The revision check and unified `gh` transport are selected. The exact interval,
conditional-request handling, and local response shape remain planning
decisions. The current private read path returns the revision and backlog
together, so it needs a lightweight revision-only check. Public projects
currently read unauthenticated REST from the browser; their reads move behind
the same local authenticated boundary as part of this story.

## Story Decomposition

<a id="auto-refresh-published-dashboard"></a>

### 1. See new published work without manually refreshing the dashboard

**Identity:** SEED-026#auto-refresh-published-dashboard
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../quick/084-auto-refresh-published-dashboard/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"4fb380b7536c1686c43030e671a533a72ed2527547519dd213cfffa55c73f6eb","plan":"e8eb9ffd60db7081f2d895d70501506fa09604a091f453dbf7998f1d631f740e"}}
```

**Status:** Refined and slice planned on 2026-09-23; queued first, not Taken.

**Goal:** A developer who leaves the dashboard open sees newly published work
from the selected project's `main` branch within 30 seconds while the page is
visible and the source responds normally, without having to press Refresh.
Quiet periods fetch no backlog or story details, and the change-detection path
remains sustainable for an open dashboard.

**Scope:**

- Keep the initial read and the existing manual Refresh/Retry control. Route
  all three projects' initial, manual, and detail reads through one local
  `gh`-authenticated boundary. After a successful read, check only the
  selected project's published `main` commit SHA at a bounded cadence through
  that boundary. The browser receives only validated result data, never the
  `gh` credential. Remove the superseded direct-browser GitHub reader and
  related dead code once all callers use the unified path.
- Compare each check with the revision of the last successfully displayed
  snapshot. When it is unchanged, retain the view without fetching or parsing
  the backlog, seed, or plan files again. When it changes, read a coherent
  snapshot pinned to the new SHA. The backlog and later details may appear
  progressively as they do today, but every part is labeled with that same
  revision; an unavailable detail stays explicit rather than borrowing an old
  value. A failed backlog read retains the last successful snapshot.
- Check while the page is visible. Pause scheduled checks while it is hidden
  and check promptly when it becomes visible again. Do not overlap checks or
  full reads; a project switch stops work for the previous source and cannot
  let its late response replace the new project's view. Manual Refresh remains
  available, including when a person wants to retry an incomplete read at the
  same revision.
- Keep the last successful revision and retrieval time truthful while a check
  or read is under way or has failed. Report a failed automatic attempt without
  presenting the old snapshot as current; continue at the bounded cadence and
  allow manual Retry. A later successful check or read clears the failure.
  Preserve focus on a story still listed in the new snapshot, and use the
  existing notice when focused work is no longer listed.

**Key examples:**

1. **Quiet main:** Given a fully displayed snapshot at SHA A, several visible
   check intervals still resolve to A. The dashboard keeps the same cards,
   details, revision, and retrieval time; no backlog, seed, or plan content is
   requested again.
2. **New published work:** Given A on screen, a commit B reaches the selected
   project's `main`. With the page visible and reads succeeding, the dashboard
   shows B within 30 seconds. Backlog membership and story details come from
   B, even if details finish loading after membership; links remain pinned to
   B, and the source evidence names B. Focus stays on the same story if it
   remains listed.
3. **Failure and recovery:** A is still shown when a revision check fails, or
   when B is discovered but its backlog cannot be read. The dashboard reports
   the failed attempt and still identifies A as the last successful snapshot.
   It makes no rapid retry loop. When the next scheduled attempt or manual
   Retry succeeds, B replaces A and the failure clears. If one of B's detail
   files is unavailable, the B view labels that gap explicitly; an unchanged
   SHA does not cause repeated automatic detail reads, while manual Refresh
   remains available to retry it.
4. **Visibility and selection:** A hidden page makes no scheduled checks. On
   becoming visible it checks promptly. Switching from Open Dough to Pygardon
   stops Open Dough checks, reads Pygardon's `main`, and ignores any late Open
   Dough answer; only the selected project continues to be checked.
5. **One authenticated path:** Open Dough, Doughnut, and Pygardon each load and
   refresh through the same local reader using the launching person's `gh`
   access. A missing or insufficient `gh` login produces a clear read failure
   for the selected project, with no token exposed to the browser and no silent
   fallback to the old unauthenticated browser path.

**Constraints:** The dashboard continues to show published Git evidence only;
it does not infer local edits or live agent activity from a revision check.
One displayed snapshot must not mix files from different revisions. Automatic
checks must not exhaust the authenticated request allowance merely by leaving
the page open. Every project now requires the launching person's `gh` access;
the dashboard itself still has no sign-in or token-entry UI.

**Deferred promises:** Watching execution branches, coordinating checks across
multiple browser tabs, and offering a user-set polling interval are separate
possibilities, not commitments in this story. The existing branch-progress
story owns branch inspection.

**Value / learning:** Make the dashboard useful as a live view of published
progress and learn what freshness people need without paying for full reads
during quiet periods.

**Depends on:** The delivered published-work dashboard. No branch-watching
capability is required.

**Effort hypothesis:** Unestimated; the 30-second target and unified transport
touch all three source reads, browser visibility lifecycle, and existing focus
and failure behavior.

**Safe stopping point:** Main-branch published work updates automatically while
the existing snapshot remains trustworthy during unchanged or failed checks.

## Decisions for Planning

- Select the check interval and conditional-request handling that meet the
  30-second visible target without overusing the source. `gh api` makes an
  authenticated GitHub request and can send an `If-None-Match` header. GitHub
  does not count an authorized `304 Not Modified` answer against the primary
  API allowance, although each check still uses a network request. Verify that
  the selected ref endpoint supplies a useful ETag and `304` response. That
  response goes to the local reader; the browser receives an unchanged-revision
  result from it, never a GitHub credential. Handle rate-limit responses and
  overlapping checks without a rapid retry loop, accounting for normal
  multi-tab use without requiring cross-tab coordination.
- Keep the unified local reader restricted to catalog sources and reachable
  pinned files. Retire the old public browser transport after replacing its
  callers; preserve error reporting and existing no-token-in-browser behavior.
- A GitHub `push` webhook can announce the new `main` SHA without polling, but
  GitHub cannot deliver directly to this local dashboard's `localhost` address.
  A reachable receiver or forwarding service would add an operational boundary.
  Treat it as an alternative if conditional checks cannot meet the target,
  rather than assuming a webhook is already available.
- Reuse the existing pinned-read, cancellation, and focus behavior. The exact
  unified revision-only response shape and presentation of a failed background
  check can be chosen during planning and implementation, provided the scope
  and examples above hold.

## Ordering and When to Surface

Queue this story first as explicitly requested. It improves the already
delivered dashboard without waiting for ownership or execution-branch views.
Revisit branch watching only when the branch-progress story establishes which
published execution branches should be observed.

## Breadcrumbs

- Maintainer request on 2026-09-23 for balanced automatic refresh using a
  changed hash before fetching details, initially watching only `main`.
- Maintainer correction on 2026-09-23 that five minutes is too slow and the
  desired experience is within seconds or tens of seconds.
- Maintainer decision on 2026-09-23 to use local `gh` authentication for all
  three projects and retire the split public/private read design.
- [GitHub REST rate limits](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api)
  and [conditional-request guidance](https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api)
  inform the public-source request-budget constraint.
- [GitHub push webhook payloads](https://docs.github.com/en/webhooks/webhook-events-and-payloads#push)
  and [local receiver limits](https://docs.github.com/en/webhooks/testing-and-troubleshooting-webhooks/troubleshooting-webhooks#url-host-localhost-is-not-supported)
  inform the event-notification alternative.
- [GitHub CLI `gh api`](https://cli.github.com/manual/gh_api) supports
  authenticated requests and custom request headers.
- [Published story dashboard work](SEED-021-observe-published-story-progress.md).
- [Dashboard behavior](../../dashboard/README.md).
- [Product backlog](../PRODUCT-BACKLOG.md).
