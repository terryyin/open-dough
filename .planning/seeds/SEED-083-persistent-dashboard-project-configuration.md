---
id: SEED-083
status: active
planted: 2026-10-02
planted_during: Terry's request to replace hardcoded dashboard project information
scope: story
---

# SEED-083: Persist dashboard project configuration

## Why This Matters

A developer needs to add projects to the dashboard without changing hardcoded
project information. Each project needs its GitHub repository URL and the local
path containing its checkout, retained across dashboard restarts.

## Story

<a id="persistent-dashboard-project-configuration"></a>

### Persist dashboard project configuration

**Identity:** SEED-083#persistent-dashboard-project-configuration
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** A developer can add a project by supplying its GitHub URL and local
checkout path, and the dashboard uses that persistent configuration after restart
without requiring source-code edits.

**Scope:**

- Replace hardcoded project information with persistent project configuration.
- Let the developer add a project and specify its GitHub repository URL and the
  local path containing its checkout.
- Use those configured values wherever the dashboard needs the project's remote
  repository or local checkout.
- Preserve the configured projects and their values across dashboard restarts.

**Key examples for later refinement:**

1. The developer adds a project with a GitHub URL and an existing local checkout
   path; the dashboard makes that project available using those values.
2. The dashboard restarts; the added project, URL, and checkout path remain
   configured without editing source code or re-entering them.
3. The developer adds a second project with a different URL and path; each
   project's dashboard operations use its own configuration.

**Boundary:** Configuring AI tools to trust those paths is outside this story.
The developer supplies an existing local checkout; this capture does not promise
repository cloning or AI tool setup.

**Open decisions:** Refine the add-project interaction, configuration storage
location and format, transition from existing hardcoded projects, and handling
of invalid URLs or unavailable checkout paths. Editing/removing projects and
configuration sharing between environments are not yet specified.

**Capture:** Terry requested this as the second queued backlog story on
2026-10-02, authorizing capture, commit, and synchronization on main. This record
captures intended behavior; implementation and slice planning remain pending.

## Breadcrumbs

- [Product backlog](../PRODUCT-BACKLOG.md).
