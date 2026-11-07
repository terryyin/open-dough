---
id: SEED-250
status: active
planted: 2026-11-07
planted_during: Terry Yin's request to hide a client project in the dashboard while retaining updates and maintenance
trigger_when: A maintainer wants fewer projects in dashboard navigation without removing a maintained client project
scope: story
---

# SEED-250: Hide a client project from the dashboard

## Context

The dashboard's configured projects also supply the maintained project inventory
for release updates and feedback maintenance. Removing a project to declutter
the dashboard would remove it from that inventory. Terry wants a separate
visibility choice in each project's configuration.

## Story

<a id="hide-client-project-from-dashboard"></a>

### Hide a client project from the dashboard while keeping it maintained

**Identity:** SEED-250#hide-client-project-from-dashboard
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/476-hide-client-project-from-dashboard/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"ef695d94e3326d9173f725b5fb1b1761ad32b09f5c57d98329cf5c52ea25ca1f","plan":"7bd8d6e5f59430d896e6ba86422144f32fb3da310387e04f3d663ed81438fc86"}}
```

**Goal:** A maintainer who keeps several client projects configured can hide
ones they are not currently viewing from the dashboard's project navigation,
then show them again, without removing them from configuration or from release
updates and maintenance cycles.

**Scope:**

- **Required behavior:**
  - In **System settings → Projects**, each configured project's row offers hide
    and show for that environment's saved list. Hidden state is clear on the
    row, and show is available without re-adding the project.
  - Hidden projects leave dashboard project selection: project tabs, the
    compact project selector, and page-wide Left/Right project cycling.
  - The Board and Intent content of a hidden project is not presented as the
    selected project while it remains hidden. Settings stay reachable so a
    project can be shown again.
  - Hiding the currently selected project selects another visible project when
    one exists; when every project is hidden, the dashboard presents no project
    Board or Intent content and keeps settings usable.
  - Reloading the dashboard or restarting its server keeps the saved visibility
    choice for that environment. Existing entries with no visibility choice
    stay visible.
  - Open sessions for a hidden project may remain in the Sessions sidebar so a
    running agent is not lost. Choosing such a session may open its
    terminal or report; it must not restore that project to selection chrome or
    present its Board or Intent while it stays hidden. Settings remain the path
    to show it again.
  - Release updates, feedback maintenance, and other workflows that read the
    production (or development) configured-project inventory still include a
    hidden project under the same eligibility rules as when it is visible.
    Repository, ref, local path, and membership are unchanged by hide or show.
- **Required restrictions:** Visibility is independent of Remove project and of
  maintenance eligibility. Production and development keep separate saved lists;
  a visibility choice applies only in the environment that stores it.
- **Scope limits:** This story does not add a maintenance opt-out, change how
  update or maintenance workflows otherwise select work, move project
  configuration out of machine-local settings, or redesign Remove / Add
  project.
- **Deferred, neither promised nor prevented:** Filtering or labeling Sessions
  sidebar entries by visibility beyond the selection rule above; a confirmation
  step before hide; bulk hide or show.

**Key examples:**

1. A visible project's settings row is hidden → that project disappears from
   project tabs, the compact selector, and Left/Right cycling. Its settings row
   remains, shows it is hidden, and offers show. Remove and its confirmation
   stay available as today.
2. The dashboard is reloaded or its server restarted after a hide → the project
   stays hidden in that environment. A project saved before this capability,
   with no visibility field, remains visible.
3. The selected project is hidden while others are visible → another visible
   project becomes selected. Every configured project is hidden → no Board or
   Intent content is shown; System settings remain reachable and a row can be
   shown again.
4. A direct URL or prior selection names a now-hidden project → the dashboard
   does not present that project's Board or Intent while it stays hidden; it
   follows the same selection rule as example 3.
5. An open session belongs to a hidden project → it may still appear in the
   Sessions sidebar. Opening it attaches the session's terminal or report
   without putting the project back in tabs or the compact selector and without
   showing that project's Board or Intent until it is shown again in settings.
6. Release updates or a maintenance cycle runs with a hidden client project in
   the environment's configuration → the project remains in the maintained
   inventory and is included as when visible; its repository, ref, local path,
   and membership are unchanged.
7. The hidden project is shown again in settings → tabs, compact selector, and
   cycling include it again, and normal selection of its Board and Intent
   returns, without re-adding the project or restoring other configuration.

**UI:** The user is a maintainer operating this machine's dashboard. Hide and
show live on each **System settings → Projects** row beside the existing
identity facts and Remove control—not on the banner tabs. The row must make
hidden versus visible unmistakable and keep show one step away. No new layout
system: extend the existing settings list. Empty configured list and
all-hidden remain distinct: the former still explains that nothing is
configured and points to Add project; the latter keeps configured rows so show
is possible.

**Architecture:** Dashboard visibility is another field of machine-local
project configuration
([ADR 0008 — Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)):
the same per-environment file that already holds repository, ref, backlog path,
and local path. Presentation (tabs, compact selector, cycling, and selected
Board/Intent) reads a visibility-filtered view. Settings rows and maintainer
inventory readers that consume the configured list for release updates and
feedback maintenance continue to see every configured project, including
hidden ones. That split keeps decluttering from changing inventory membership.
No conflict with Accepted ADRs; ADR 0004's client-payload configuration is out
of scope because this choice is dashboard machine state, not
`.planning/open-dough.json`.

## Breadcrumbs

- Terry's 2026-11-07 request: add this story at the top of the product backlog.
- [Dashboard project configuration](../../dashboard/PROJECT-CONFIGURATION.md).
- [ADR 0008 — Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md).
- [Release and update clients](../../.agents/skills/release-and-update-clients/SKILL.md).
- [Combined maintenance cycle](../../.agents/skills/maintain-feedback-cycle/SKILL.md).
- [Product backlog](../PRODUCT-BACKLOG.md).
