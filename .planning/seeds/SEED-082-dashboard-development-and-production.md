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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/213-dashboard-development-and-production/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"cdbd93d194e0a40c6e33b32c1ccc2dd5996f77431a74a800905c0d4626c02173","plan":"b83b1b0b7ac0ce0ad44b0dc12c47d09118ad6d73dba1af5e9fff751355bcf227"}}
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
  checkout. This one command starts the watcher, which starts the production
  server from the highest numeric `vMAJOR.MINOR.PATCH` tag published on origin.
  The watcher checks for a newer qualifying tag, builds the dashboard from that
  tagged source, and restarts production on the new bundle. If no qualifying
  tag exists at startup, it reports that production cannot start.
- If a new release cannot be built or started, keep the last working production
  release available, report the failure, and retry the new release on a later
  watcher check.
- Give development and production distinct local URLs so the developer can
  identify and use each environment.
- Both environments continue using the existing hardcoded real-project catalog
  and shared local dashboard launch/session records. This story does not move,
  isolate, or migrate those records. Separate configuration, including toy
  projects for development and production's real projects, belongs to
  [SEED-083](SEED-083-persistent-dashboard-project-configuration.md#persistent-dashboard-project-configuration).

**Key examples:**

1. Several release tags are published; the developer runs the production
   watcher npm command from the development checkout; the watcher starts the
   production server from the highest numeric release tag's built dashboard.
   The developer can also run development at its own local URL for manual
   testing.
2. Production is serving a tagged build; the developer edits dashboard source
   and tests the change in development; production continues serving the same
   build without refreshing or restarting.
3. Production is serving one release; a newer qualifying release tag is
   published on origin; the watcher builds the dashboard from that tag and
   restarts production on it.
4. Production is serving one release; a newer qualifying tag cannot be built
   or started; production continues serving the last working release, the
   watcher reports the problem, and a later check retries the new release.

**Deferred promise:** Isolating development's projects and local records is not
part of this delivery. Until the follow-up configuration story, manual testing
can act on the same real projects as production; developers choose test actions
accordingly.

**Release convention:** The watcher uses Open Dough's numeric release tags on
origin under [ADR 0003](../../docs/adrs/0003-tagged-release-versioning-accepted.md).

**Plan:** [Separate dashboard development and production](../slice-plans/213-dashboard-development-and-production/PLAN.md).

**Capture:** Terry requested this as the first queued backlog story on
2026-10-02, authorizing capture, commit, and synchronization on main. This record
originally captured intended behavior; implementation remains pending.

## Breadcrumbs

- [Product backlog](../PRODUCT-BACKLOG.md).
