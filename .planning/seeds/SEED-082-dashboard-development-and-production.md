---
id: SEED-082
status: active
planted: 2026-10-02
planted_during: Terry's request to distinguish dashboard development and production environments
scope: story
---

# SEED-082: Separate dashboard development and production environments

## Why This Matters

A developer needs a development dashboard for manual testing and a production
dashboard for real use. Source changes during development should not refresh or
restart the dashboard being used for real work.

## Story

<a id="dashboard-development-and-production"></a>

### Separate dashboard development and production environments

**Identity:** SEED-082#dashboard-development-and-production
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** A developer can manually test the development environment while using
a stable production dashboard that updates when a new release tag is published.

**Scope:**

- Establish distinct development and production environments while retaining
  the current hosting approach. Development is for manual testing; production
  is for real use.
- Run production from a built bundle. Development source edits must not cause
  production to auto-refresh or restart.
- Start the production watcher through an npm command run from the development
  environment. The watcher owns starting the production server and watching for
  new release tags, then deploying the corresponding built bundle and restarting
  production for that release.
- Keep the environments distinguishable to the developer using them.

**Key examples for later refinement:**

1. The developer starts the watcher with the npm command and can use production
   while running development for manual testing.
2. The developer changes source code and tests it in development; production
   continues serving its deployed built bundle without auto-refreshing.
3. A new release tag is published; the watcher detects it and restarts production
   on the build corresponding to that tag.

**Open decisions:** Refine the command name, how the environments are identified
and accessed, which release tags qualify and where they are watched, where a
release build is produced, and watcher/restart behavior if a release cannot be
deployed. Clarify any runtime data shared between manual testing and real use.

**Capture:** Terry requested this as the first queued backlog story on
2026-10-02, authorizing capture, commit, and synchronization on main. This record
captures intended behavior; implementation and slice planning remain pending.

## Breadcrumbs

- [Product backlog](../PRODUCT-BACKLOG.md).
