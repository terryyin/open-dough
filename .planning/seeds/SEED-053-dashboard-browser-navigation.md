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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/136-dashboard-browser-navigation/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"01732ad0a6f859777ee54a88ccd305386ef5924a8f051c69f870ad7e692a0fbd","plan":"e597d5b63f7059845f3338d3ebeea57057a4641ec0aff82162a53493a35b47bb"}}
```

**Beneficiary:** Developers reviewing published work in the Open Dough
dashboard.

**Goal:** Follow dashboard source and external-reference links without losing
the dashboard tab, and navigate to and from each project's agent roster with
URLs and browser history that match the visible view.

**Scope:** Every dashboard link whose destination is outside the dashboard,
including revision-pinned repository files and ordinary external references,
opens in a new tab. Dashboard-internal navigation stays in the current tab.
The stories and agent-roster views have project-aware URLs. Opening a portrait,
using Back to stories, switching projects, loading or refreshing a URL, and
using browser Back/Forward keep the URL, selected project, and visible view in
agreement. Preserve the roster's use of the selected project's published
snapshot and the existing focus return to an opener when it is still present.
An unknown project URL returns to a valid dashboard view without displaying a
different project's roster under that URL.

**Key examples:**

- Given a card's canonical source or plan link, following it opens the
  revision-pinned GitHub page in a new tab; the original dashboard tab keeps
  its selected project and open story detail. The same applies to an ordinary
  external-reference link.
- Given a selected project's stories, opening an agent portrait changes the
  URL to that project's roster and shows its assignments. Browser Back returns
  to that project's stories; browser Forward reopens the roster. Back to
  stories also updates the URL and history consistently.
- Loading or refreshing a project's roster URL directly selects that project
  and shows its roster, including a truthful reading or failure state before a
  snapshot is available. Switching projects while there changes both the URL
  and roster source. Browser Back restores the previous project and view.
- Opening a roster from the keyboard focuses the opened agent. Returning to
  stories restores focus to the portrait when it remains available; a direct
  roster visit or vanished opener still leaves a useful focus location.

**Deferred:** This story does not commit to shareable routes for individual
stories, persisted open details, or new data reads for the roster.

## Breadcrumbs

- Maintainer request on 2026-09-27: prioritize new-tab external links and
  browser-history-aware navigation to and from avatar rosters.
- [Product backlog](../PRODUCT-BACKLOG.md).
