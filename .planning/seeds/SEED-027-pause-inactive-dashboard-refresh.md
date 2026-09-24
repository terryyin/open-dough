---
id: SEED-027
status: active
planted: 2026-09-24
planted_during: Product backlog capture requested by the maintainer
trigger_when: The dashboard remains open while its browser page is not active
scope: small
---

# SEED-027: Keep dashboard observation quiet while the page is inactive

## Why This Matters

For a developer who leaves the Open Dough dashboard open while working
elsewhere, automatic refresh activity should consume attention and remote
requests only while the dashboard is active. The current revision-check
schedule already pauses when the browser reports the page hidden. A browser
window can lose foreground activity while its selected tab is still reported
visible, leaving scheduled checks running when the developer is not using it.

## Alternatives and Decision

- **Keep the current hidden-page rule:** This handles background tabs but
  leaves a visible tab in an inactive browser window checking for changes.
- **Remove automatic refresh:** This avoids background requests but makes an
  active dashboard depend on manual refresh for published progress.
- **Recommended:** Pause scheduled checks while the page is inactive and check
  promptly when it becomes active again. Keep the manual Refresh action and
  existing rate-limit waits meaningful.

## Story Decomposition

<a id="pause-inactive-dashboard-refresh"></a>

### 1. Pause dashboard refresh while the page is inactive

**Identity:** SEED-027#pause-inactive-dashboard-refresh
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Status:** Captured and queued on 2026-09-24; not refined or planned.

- **For / why:** A developer who keeps the dashboard open can switch to other
  work without the dashboard repeatedly checking published state in the
  background.
- **Evaluation:** With the dashboard loaded and its tab selected, move to
  another application or browser window. Scheduled revision checks cease while
  that page is inactive. Returning to it checks for newer published work
  promptly, then resumes the usual active-page cadence. A hidden tab remains
  quiet as it does today. A rate-limit wait is still respected on return.
- **Value / learning:** Avoid unnecessary remote requests during ordinary
  multitasking while retaining timely progress visibility during use.
- **Effort hypothesis:** S, with moderate confidence. The remaining question
  is which browser activity signal best matches the intended behavior across
  tabs and windows.
- **Depends on:** The delivered dashboard revision-check schedule; no queued
  story is a product prerequisite.
- **Boundary:** Scheduled automatic checks. Do not change user-requested
  Refresh or turn this into presence tracking for other developers.
- **Safe stopping point:** The dashboard remains useful with its existing
  active-page refresh and explicit Refresh action if later dashboard stories
  are deferred.

## Ordering and Scope Reduction

Queue this after the current dashboard ownership and published-branch stories.
It advances the dashboard direction by reducing idle activity, but those stories
deliver more direct visibility into project progress. It can proceed
independently of same-machine worktree coordination.

## Open Decisions

- Confirm whether “inactive” means the browser window lacks focus even while
  its tab is selected; the existing hidden-tab behavior is already delivered.
- Confirm how a page that becomes active during an outstanding read should
  resume without duplicating that read.

## When to Surface

When improving dashboard observation cadence or investigating unnecessary
background requests.

## Breadcrumbs

- [Dashboard observation](../../dashboard/src/publishedObservation.ts)
- [Visibility and revision checks](../../dashboard/src/pageVisibility.ts)
- [Published dashboard stories](SEED-021-observe-published-story-progress.md)
