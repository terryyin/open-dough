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
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary:** A maintainer who wants the dashboard to show only the projects
they currently want to view while continuing to maintain all client projects.

**Outcome:** In **System settings → Projects**, the maintainer can hide a
configured project from the dashboard and later show it again. Hidden projects
remain configured client projects and continue to participate in release
updates and maintenance cycles under their existing eligibility rules.

**Key examples:**

1. Hide a visible project in its configuration → it disappears from dashboard
   project tabs and the compact project selector. Its settings row remains
   accessible, with its hidden state clear and a way to show it again.
2. Reload the dashboard or restart its server → the saved visibility choice
   persists in that environment. Existing projects without a visibility choice
   remain visible.
3. Hide the currently selected project → the dashboard selects another visible
   project. If every project is hidden, the dashboard shows no hidden project's
   content and keeps settings accessible so a project can be shown again.
4. Run release updates or a maintenance cycle with a hidden client project →
   it remains in the maintained project inventory and is included just as it
   would be when visible. Its repository, ref, local path, and client-project
   membership are preserved.
5. Show the hidden project again → its dashboard navigation and normal access
   return without re-adding the project or restoring its configuration.

**Scope:** Dashboard visibility is independent of project removal and
maintenance eligibility. Keep the existing separation between production and
development project configuration. This story does not introduce a maintenance
opt-out or change how update and maintenance workflows otherwise select work.

## Breadcrumbs

- Terry's 2026-11-07 request: add this story at the top of the product backlog.
- [Dashboard project configuration](../../dashboard/PROJECT-CONFIGURATION.md).
- [Release and update clients](../../.agents/skills/release-and-update-clients/SKILL.md).
- [Combined maintenance cycle](../../.agents/skills/maintain-feedback-cycle/SKILL.md).
- [Product backlog](../PRODUCT-BACKLOG.md).
