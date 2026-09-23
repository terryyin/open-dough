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
check. This applies to the dashboard's public and private project sources.

## Alternatives and Decision

- **Keep manual Refresh:** It avoids background requests, but the developer
  must remember to check for new work.
- **Repeat the current full read:** It improves freshness but repeatedly fetches
  unchanged backlog and detail content, and can consume the public GitHub API
  allowance quickly.
- **Check the selected ref first:** Periodically compare the published `main`
  commit SHA with the displayed revision. Fetch a new pinned snapshot and its
  details only when the SHA changes. Choose a cadence that balances visible
  freshness with the request budget, including idle or hidden pages.

The revision check is the selected direction; its exact cadence and transport
shape remain refinement decisions. The private read path currently returns the
revision and backlog together, so it needs an equivalent revision-only check
to make unchanged polls lightweight.

## Story Decomposition

<a id="auto-refresh-published-dashboard"></a>

### 1. See new published work without manually refreshing the dashboard

**Identity:** SEED-026#auto-refresh-published-dashboard
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Status:** Captured and queued first on 2026-09-23; not refined or planned.

**For / why:** A developer keeping the dashboard open can see newly published
work on the selected project's `main` branch promptly without repeatedly
pressing Refresh or spending full-read requests while nothing has changed.

**Outcome:** The open dashboard checks the selected project's published `main`
revision at a bounded cadence. An unchanged SHA leaves the current snapshot and
its details intact without reading the backlog, seed, or plan files again. A
changed SHA causes one coherent read pinned to that revision and updates the
view, including its revision and retrieval evidence. Manual Refresh remains
available. Switching projects stops checks for the old project and observes
only the newly selected project. Execution branches are outside this story;
branch inspection remains with the separately queued branch-progress story.

**Key example / evaluation:** With the dashboard open and `main` unchanged
through several check intervals, requests are limited to lightweight revision
checks and no detail files are fetched again. After a new commit reaches
`main`, the dashboard shows the new published snapshot within the documented
freshness target, with all displayed records pinned to the same SHA. A failed
check or detail read leaves the last successful snapshot visible and accurately
identified; subsequent checks do not overlap or flood the source. The selected
cadence stays within the public source's request allowance in ordinary use.

**Value / learning:** Make the dashboard useful as a live view of published
progress and learn what freshness people need without paying for full reads
during quiet periods.

**Depends on:** The delivered published-work dashboard. No branch-watching
capability is required.

**Effort hypothesis:** Unestimated until refinement covers the public and
private read paths, request allowance, and browser lifecycle.

**Safe stopping point:** Main-branch published work updates automatically while
the existing snapshot remains trustworthy during unchanged or failed checks.

## Open Decisions for Refinement

- Set a visible-page freshness target and polling cadence against GitHub's
  unauthenticated request allowance and normal multi-tab use; decide how checks
  slow or pause when a page is hidden.
- Decide what the UI says about the last successful snapshot versus the last
  revision check, especially after a check fails.
- Reuse the existing pinned-read and cancellation paths while adding a cheap
  revision-only operation for private sources.

## Ordering and When to Surface

Queue this story first as explicitly requested. It improves the already
delivered dashboard without waiting for ownership or execution-branch views.
Revisit branch watching only when the branch-progress story establishes which
published execution branches should be observed.

## Breadcrumbs

- Maintainer request on 2026-09-23 for balanced automatic refresh using a
  changed hash before fetching details, initially watching only `main`.
- [Published story dashboard work](SEED-021-observe-published-story-progress.md).
- [Dashboard behavior](../../dashboard/README.md).
- [Product backlog](../PRODUCT-BACKLOG.md).
