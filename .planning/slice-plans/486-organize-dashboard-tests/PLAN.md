# Organize dashboard tests by feature

**Identity:** SEED-249#organize-dashboard-tests
**Source:** [Organize dashboard tests](../../seeds/SEED-249-dashboard-test-organization.md#organize-dashboard-tests)

## Goal and scope

Expose Dashboard Backend Test as an independent Intent entry backed by
`dashboard/backend-tests/`, a sibling of `dashboard/tests/`. Organize every
browser spec into Configuration, Stories, Launches, Sessions, Terminals, Review,
Intent, Navigation, Observation, or Runtime. Preserve all cases, one shared
Playwright run/build and twelve CI shards, with no increased CI wall time.
Do not change product behavior beyond the entry's optional display label or
reduce test coverage, retry failures, increase deadlines, or add CI jobs.

## Existing solution and decisions

- Reuse `dashboard/tests/support/testFiles.mjs`, the duration deal and common
  runner; change discovery to the two test roots under the dashboard common
  root rather than creating another runner/build. Keep shared fixtures in
  `dashboard/tests/` and rewrite moved references by their resolved targets.
- Keep canonical repository paths as Intent/proof identities; optional location
  labels supply the requested Dashboard Backend Test title. CI proof must
  partition the shared record by actual repository file ownership.
- Move recorded duration labels with specs; production watcher chains keep their
  priority after moving to Runtime. Compare allocation, then actual CI timing.
- ADR 0008 (docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  keeps published facts separate from local operations. ADR 0001 preserves the
  agreed domain vocabulary. No ADR exception or North Star change is needed.
- The product backlog's near-future direction prioritizes navigable Purpose and
  trustworthy Proof at justified cost; the separate entry and feature folders
  directly serve that reading outcome.

## Premises and baseline

| Premise | Consuming observation | Result and remainder |
| --- | --- | --- |
| The baseline suite is discoverable in the owned checkout | `npx playwright test --config dashboard/playwright.config.ts --list --reporter=json` at claim 411e607a5eaf523ce8b2b64f880db8f2cb976557 | 741 files, 2075 registered cases, zero discovery errors; raw listing `/tmp/open-dough-test-organization-proof/before.json`. |
| The existing twelve-shard route selects this inventory | `node scripts/test-shares.mjs preview --split-count 12 --spec-dir dashboard/tests` in the same checkout | 688 recorded files, 53 unrecorded; 818.1–828.0 predicted job-seconds per shard. Preserve recorded history and compare after each move. |
| CI has a successful directly comparable baseline | CI run 42242723239 at base 5befe37bd575feb2e7776e14feaf4be430ddc629 | Workflow 296 s; slowest dashboard job 269 s, suite step 236 s. Proof 2067 passed, 0 failed, 8 other. Compare final published CI on the same twelve Ubuntu shards; diagnose any increase. |
| Feature classification is total | Read-only inventory of all 473 browser spec basenames at the claim revision | Configuration 16, Stories 37, Launches 96, Sessions 91, Terminals 27, Review 42, Intent 62, Navigation 41, Observation 51, Runtime 10. New regression cases retain their feature owner. |
| Shared support has path-sensitive consumers | Existing imports, `new URL` references, proof-record fixtures, duration labels, tsconfig, ESLint and CI proof declaration trace | Update by resolved target and prove via typecheck, full discovery and focused harness runs. Final integration remains CI-owned below. |

## Outside-in proof and ownership

- Slice 1 owns the independent backend entry, its label without changed path
  identity, exactly-once discovery across both roots, multi-entry proof counts,
  CI declaration and preserved durations. Exercise the existing label/source
  browse journey and backend read boundary with a configured label, plus the
  discovery/proof collector tests and affected proof-record harness.
- Slice 2 owns the ten folder groups and preservation of the original 2075
  case identities (additional deliberate regression cases are counted
  separately), deployment scheduling, final documentation and actual CI wall
  time. Compare the JSON inventories by basename, case title and project;
  verify the complete twelve-shard partition and migrated timing labels.
- Local gates: selective formatter, lint hook, dashboard typecheck, all-case
  discovery, focused changed discovery/proof tests and representative relocated
  harness/browser/backend specs. Full hosted CI supplies exhaustive execution;
  do not run a redundant 2075-case local suite solely for relocation.
- Long local verification starts fully awake on the observed AC power under
  `caffeinate -s -i`; on battery plug in or use the lid-open `caffeinate -i`
  procedure and inspect sleep logs, as maintained in
  [machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
- Failure policy: [Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests)
  applies as written, including owned published CI defects. Known attribution
  is never an exemption; another active exact repair owner is a coordination
  boundary, with their files preserved.

## Ordered slices

### 1. Read backend tests as an independent entry
Type: Behavior
Status: planned
Proof: Backend specs remain selected exactly once by the shared twelve-shard
runner; a labelled backend Intent location opens its canonical sources;
collector tests prove browser/backend fragments partition counts and times;
typecheck, focused relocation/harness checks, and allocation preview pass.

Behavior: A configured project exposes Dashboard Backend Test beside its
dashboard tests, backed by the sibling backend directory. Both entries receive
their own truthful CI proof from one combined execution, without another build,
job matrix, retry or deadline.

### 2. Browse dashboard tests through the ten feature groups
Type: Behavior
Status: planned
Proof: Every browser spec lives in exactly one agreed feature folder; full
discovery retains every original case, all twelve shards partition the result,
production watcher scheduling remains prioritized, focused path-sensitive
harness checks pass, and final published CI passes without increased wall time
against run 42242723239. Record observed runtime variability truthfully.

Behavior: Opening the dashboard test entry reveals the ten domain groups;
opening any group reaches its existing tests and CI proof at the moved paths.
The complete browser/backend suite still runs under the existing CI schedule.

## Execution context

Owned checkout: `/Users/terryyin/git/open-dough-test-organization`, created for
this story; branch `story/dashboard-test-organization`, Story Branch Mode.
Originating/default checkout: `/Users/terryyin/git/open-dough`.
Claim accepted on origin/main: `411e607a5eaf523ce8b2b64f880db8f2cb976557`.
Implementation target: `origin/refs/heads/story/dashboard-test-organization`.
Node locked install and `npm run --silent typecheck:dashboard` passed in this
exact checkout. Use the same installed dependencies; no lockfile change.
Replanning is permitted within the accepted outcome; no numeric slice limit
was supplied.

## Refinement review

Refinement was not needed: the two independently observable browsing outcomes
each retain their own complete proof loop and share existing runner machinery.
No remaining slice-specific concern was identified. Final CI and timing are
required observations, not presumed successes.

## Learnings

The main baseline advanced during initial inspection, adding
`intent-file-purpose-proof.spec.ts`; the adopted baseline includes that test.
