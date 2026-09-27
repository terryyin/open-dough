---
id: SEED-053
status: active
planted: 2026-09-27
planted_during: Maintainer request for dashboard browser navigation
trigger_when: Dashboard navigation does not behave as expected in the browser
scope: story
---

# SEED-053: Make dashboard links and agent roster browser navigation work naturally

## Why This Matters

Developers move between the dashboard, published source, other external
references, and agent rosters while reviewing work. Following a link should
not discard their dashboard context, and the roster should participate in the
browser's normal navigation history.

## Story

<a id="dashboard-browser-navigation"></a>

### Open external links in new tabs and route agent rosters

**Identity:** SEED-053#dashboard-browser-navigation
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary:** Developers reviewing published work in the Open Dough
dashboard.

**Goal:** Open every dashboard link to an external destination in a new browser
tab, and make navigation from a dashboard project to its agent roster and back
work through an addressable route and browser history.

**Evaluation examples:**

- Following a dashboard link to published source or another external website
  opens that destination in a new tab while the dashboard remains available in
  its current tab. This applies consistently wherever external links appear in
  the dashboard.
- Opening an agent roster changes the dashboard URL to a route for that
  project's roster. Browser Back returns to the project stories, and browser
  Forward returns to the roster.
- The roster's own Back to stories control follows the same navigation model:
  after using it, browser history and the visible view agree.
- Loading or refreshing a roster URL directly shows the corresponding project's
  roster, including when no published snapshot has yet been read. Moving
  between projects does not show a roster for the wrong project.
- Keyboard focus remains useful after opening a roster and returning to the
  stories, including through browser Back and Forward.

**Boundary for refinement:** Choose the route shape and decide how a direct
roster visit selects its project and handles an unknown project. Keep existing
published-snapshot and read-failure behavior truthful while navigating.

## Breadcrumbs

- Maintainer request on 2026-09-27: prioritize new-tab external links and
  browser-history-aware navigation to and from avatar rosters.
- [Product backlog](../PRODUCT-BACKLOG.md).
