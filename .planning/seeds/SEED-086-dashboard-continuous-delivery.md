---
id: SEED-086
status: active
planted: 2026-10-03
planted_during: Maintainer request for production dashboard continuous delivery
trigger_when: A developer wants the production dashboard to follow qualifying changes on origin/main
scope: unestimated
---

# SEED-086: Production dashboard continuous delivery

## Why This Matters

A developer running the production dashboard wants published application
changes to become available automatically. Follow origin/main directly, use
CI's change exclusions, and build and serve each qualifying published revision.

## Story

<a id="dashboard-continuous-delivery"></a>

### Automatically build and restart the production dashboard from main

**Identity:** SEED-086#dashboard-continuous-delivery
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/225-dashboard-continuous-delivery/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"b01e48e69927e150acb4f1b52b5afc1086498f1a23207000d0b09b437e5ce08b","plan":"6bb6e8c120de0e912b4ec1ae81e7b7ae9f8605e37c3d705b3bb3ee60e44160bc"}}
```

**Goal:** A developer running the production dashboard receives qualifying
changes published to origin/main automatically. The watcher builds the selected
published revision and restarts the application at its existing production URL,
making delivered application changes available during ordinary dashboard use.

**Scope:**

- On watcher startup, resolve the current published origin/main commit, install
  its locked dependencies, build it in a separate checkout, and serve that
  exact commit. Every watcher restart establishes this startup baseline anew.
- On subsequent checks, compare the latest published main revision with the
  last successfully served revision. Evaluate the changed paths across that
  whole range, including deletions and renames. Coalesce pending changes into
  one build of the latest selected revision; pin its commit through build and
  startup even if main advances during those operations.
- Read the push path-exclusion policy from `.github/workflows/ci.yml` at the
  selected published revision. That workflow is the policy source; maintain
  matching path semantics rather than a separately maintained exclusion list.
  Currently the exclusions are `.planning/**` and `docs/**`. An update whose
  changed paths are all excluded produces no deployment, build, or restart.
  Any non-excluded changed path makes the update qualify.
- Keep the successful deployment baseline across skipped updates and failed
  attempts. Once a candidate is successfully served, use its commit as the
  next comparison baseline. An unchanged published revision leaves the running
  application in place.
- A successful local build gates deployment of a qualifying revision. This
  refinement assumes immediate delivery after that build; CI-result gating is
  deferred.
- Preserve the existing operational behavior: development edits and hot reload
  remain isolated from production; polling defaults to 30 seconds; the
  production URL remains stable across replacements; machine-local project
  and launch/session records survive replacement and shutdown. Existing port
  and polling-interval options remain usable.
- Failed origin checks, unreadable exclusion policy, or failed candidate builds
  report the cause and keep the running build. Failed candidate startup attempts
  restoration of the previous built server at the same URL. Retry on a later
  check after recoverable failure; report both failures and exit if restoration
  also fails. Startup failure reports the cause and exits. Shutdown stops owned
  processes and cleans temporary build checkouts.
- Remove the obsolete dashboard tag-delivery behavior and its supporting code:
  tag selection, numeric-version comparisons, tag immutability checks, and
  tag-to-VERSION validation used solely for dashboard delivery. Remove tests,
  fixture machinery, comments, names, and documentation that exist solely to
  support or describe that behavior. Review the watcher, production runner,
  their tests and support fixtures, and dashboard command/README guidance, then
  follow their references to remove remaining obsolete material. Update the
  maintained documentation to describe the main-based workflow affirmatively.
  Delete obsolete passages; do not replace them with negations of the removed
  behavior or retain a compatibility path for it.

**Material boundary:** This story owns production dashboard delivery. Open
Dough guidance installation and update use the tagged-release contract in
[ADR 0003 — Release lifecycle and versioning](../../docs/adrs/0003-tagged-release-versioning-accepted.md)
and [ADR 0004 — Client installation and update](../../docs/adrs/0004-client-installation-and-update-accepted.md).
Their shared release tooling remains owned by that contract; dashboard-only
uses and obsolete dependencies are removed as part of this delivery change.

**Deferred promises:** Hosted CI status integration, configurable deployment
branches, durable deployment history across watcher lifetimes, and separate
project/session stores are outside this delivery commitment.

**Boundary assumptions:** Main follows the project's ordinary integration
history. This story establishes commit-pinned local delivery and retains the
current watcher's startup/recovery model; it adds no history-rewrite recovery
or persistent deployment service.

**Key examples:**

- **Startup and restart:** Published main is A and the development checkout has
  local edits → the watcher starts → it builds and serves exactly A from an
  isolated checkout. After stopping it and publishing B, starting it again
  builds and serves B as the new baseline, including when B's latest changes
  are documentation-only.
- **Application update:** A is running → an application change reaches main as
  B → the next check builds B and serves it at A's production URL. Logs identify
  the selected and running commit.
- **Excluded update:** A is running → B changes only `.planning/` and `docs/`
  → checks keep A running without a build or restart. Repeated checks of an
  unchanged main likewise leave the running process in place.
- **Accumulated and mixed changes:** A is running → B changes application code
  and C changes only docs before the next check → the A-to-C changes qualify
  and the watcher builds C once. A single update changing both docs and
  application code has the same result.
- **Policy change:** A is running → B changes CI's push exclusions → B's policy
  is used to classify the pending range and subsequent main updates. The
  watcher follows that policy without a second exclusion-list edit.
- **Pinned build:** B is selected for a build → C reaches main while B builds
  → a successful build serves exactly B; a later check evaluates B-to-C.
- **Recoverable failure:** A is running → qualifying B fails to build, or its
  server fails to start → the watcher reports B's commit and cause, keeps or
  restores A, and retains A as the baseline for a later attempt.
- **Removal review:** Implementation and documentation review follow the old
  dashboard tag-delivery references → obsolete dashboard code, assertions,
  fixtures, and prose are deleted; maintained instructions explain selection,
  filtering, building, recovery, and running by published main commit.

## Breadcrumbs

- [Slice plan](../slice-plans/225-dashboard-continuous-delivery/PLAN.md).
- Terry's 2026-10-03 request: put this story first in the product backlog;
  watch main, apply CI's exclusions, build the application, and restart it.
- Refinement instruction: remove obsolete dashboard tag-delivery behavior,
  dead code, and documentation; delete obsolete material rather than rewriting
  it as negations.
- [Product backlog](../PRODUCT-BACKLOG.md).
- [Current production watcher](../../scripts/watch-dashboard.mjs).
- [Production release runner](../../dashboard/server/productionReleaseRunner.mjs).
- [CI path exclusions](../../.github/workflows/ci.yml).
- [Dashboard command guidance](../../dashboard/COMMANDS.md) and
  [dashboard README](../../dashboard/README.md).
