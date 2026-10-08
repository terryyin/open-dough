---
id: SEED-126
status: active
planted: 2026-10-09
planted_during: Terry's report that dashboard story refreshes flicker while most information stays the same
trigger_when: A dashboard refresh of Git-derived story state or assignments visibly flashes or moves unchanged stories
scope: story
---

# SEED-126: Dashboard refreshes keep unchanged stories steady

## Why This Matters

The dashboard periodically reloads story information derived from Git, mostly
story state and assignment information. During each reload the page flickers
and flashes, and items move while loading, even though most of the reloaded
information is unchanged. The motion makes the board hard to read and to act
on, and it misrepresents a routine refresh as a change.

## Story

<a id="steady-dashboard-refresh"></a>

### Keep unchanged dashboard stories steady while story information reloads

**Identity:** SEED-126#steady-dashboard-refresh
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary:** A developer watching or working from the Open Dough dashboard
while it reloads story state and assignment information.

**Outcome:** While a reload is in progress and when it completes, stories and
assignments whose information did not change keep their content and position
without flashing, blanking, or shifting. Only information that actually
changed updates, and loading indication does not displace existing items.

**Scope:** A UI/UX improvement to the dashboard's reload presentation for
Git-derived story state and assignments. Refinement identifies which reloads
cause the flicker and movement and the smallest change that keeps prior
content displayed until changed data replaces it. Initial loading of a
project with no prior information is not the target.

**Evaluation:** With a dashboard showing stories and assignments, trigger a
reload in which nothing changes: no card blanks, flashes, or moves, and the
page layout stays put throughout. Trigger a reload in which one story's state
or assignment changes: that story updates while other items stay in place.

**Dependencies:** No blocking story prerequisite.

## Breadcrumbs

- [Product backlog](../PRODUCT-BACKLOG.md).
- [Dashboard source](../../dashboard/src/).
