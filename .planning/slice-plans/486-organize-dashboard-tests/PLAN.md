# Organize dashboard tests by feature

**Identity:** SEED-249#organize-dashboard-tests
**Source:** [Organize dashboard tests](../../seeds/SEED-249-dashboard-test-organization.md#organize-dashboard-tests)

**Source review:** [Source-only acceptance](source-review.md)

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
Status: done
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

## Story obligations

### G1. CI scheduling fixture depends on incidental path order
Reported: slice 1 — "CI run 42253102353 failed the scheduling priority assertion: chain setup index 3 was not before the later ordinary job at index 1."
Story clause: "preserving complete CI execution without increasing CI wall time"
Disposition: proved by slice 1: scheduling-repair controlled startup gate reproduced the exact failure; intentional fixture ordering passed three guarded runs, reversed production priority still failed the original assertion, and the restored candidate passed. Complete target CI remains owned by the lifecycle commitments.

## CI repair evidence

The failure inventory was complete: one failed dashboard job, no missing logs.
The sibling backend root sorted the later ordinary fixture before its intended
first ordinary handshake. The repaired fixture establishes that order and
waits for causal startup evidence; production dispatch, assertions, retries,
timeouts and case counts are unchanged. Focused command:
`caffeinate -s -i npm run --silent test:dashboard -- backend-tests/dashboard-scheduling.spec.ts --workers=2`.
Controlled red, three candidate passes, negative priority reversal and restored
candidate pass are retained under `/tmp/open-dough-test-organization-proof/scheduling-*.log`.
Independent review `/root/scheduling_refactor` returned `## REFACTOR COMPLETE`,
none already clean, with no edits or extra tests. Consumer dispositions are in
`scheduling-repair-consumers.md` beside those logs.

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

The baseline CI proof identifies eleven browser case-definition modules outside
spec files, plus one backend case-definition module. Slice 2 moves browser case
definitions with their feature owners (including `storyCardTouchStartCases.ts`
under Launches), so their proof remains inside those feature folders. Truly
shared fixtures stay in support. The backend case module moved with Slice 1.

Slice 1 implementation proof retained: full discovery preserves 2075 cases and
741 specs, with zero missing or added identities. The twelve-shard preview
remains 818.1–828.0 predicted job-seconds with all 688 recorded duration labels
preserved and the same 53 unrecorded files. Proper Bash runner checks passed
15 discovery/preview cases and 37 proof-collector/declaration cases. Focused
backend/harness checks and the browser label/source-path journey passed. A new
browser assertion initially included line-number DOM in a multiline comparison;
comparing the exact source-line text repaired that assertion without weakening
source fidelity. Independent refactoring will retain or renew affected proof
before delivery.


### Slice 1 retained commands

- `PATH="/opt/homebrew/bin:$PATH" npm test -- tests/support/dashboard-test-files.test.mjs tests/support/test-shares.test.mjs`: 15 cases passed.
- `PATH="/opt/homebrew/bin:$PATH" npm test -- src/skills/dough-test-optimization/scripts/ci-proof-*.test.mjs tests/support/ci-proof-declaration.test.mjs`: 7 files, 37 cases passed.
- `caffeinate -s -i npm run --silent test:dashboard -- backend-tests/authenticated-read-intent-locations.spec.ts tests/intent-code-browse.spec.ts backend-tests/dashboard-scheduling.spec.ts backend-tests/proof-record-entry.spec.ts backend-tests/spec-times.spec.ts backend-tests/agent-launch-acceptance-kept-first-cleanup.spec.ts backend-tests/serving-modes.spec.ts --workers=2`: 20 cases passed, one new source-text assertion failed from line-number DOM; the assertion was corrected to exact source-line text.
- `caffeinate -s -i npm run --silent test:dashboard -- tests/intent-code-browse.spec.ts --workers=2`: repaired assertion passed, exit 0.
- `npx playwright test --config dashboard/playwright.config.ts --list --reporter=json`: `/tmp/open-dough-test-organization-proof/after-backend.json`, 2075 cases, zero discovery errors; comparison with `before.json` missing/added none.
- `node scripts/test-shares.mjs preview --split-count 12 --spec-dir dashboard`: `/tmp/open-dough-test-organization-proof/after-backend-shards.txt`, unchanged predicted loads.

Consumer trace evidence is retained outside Git in
`/tmp/open-dough-test-organization-proof/backend-path-consumers.md`,
`label-consumer-trace.md`, and `proof-partition-consumers.md`; root inspected
changed runner, label, collector and observation assertions. The raw whole-base
trace includes relocated unchanged test vocabulary; the dispositioned path and
contract traces bound actual changed behavior.


Independent Slice 1 refactor accepted (`/root/backend_refactor`,
`## REFACTOR COMPLETE`): figure accumulation now lives in the existing figures
module; CI-action fixtures are shared without a new test job; repeated fixed
source setup and redundant relocated comments were reduced. The seven-file
37-case proof suite, dashboard typecheck, and entire seven-case
`backend-tests/intent-shared-reads.spec.ts` passed under the AC sleep guard.
Changed helper boundaries were reverified; prior label, discovery, duration and
other backend observations remained valid. Consumer dispositions:
`/tmp/open-dough-test-organization-proof/backend-refactor-consumers.md`.
