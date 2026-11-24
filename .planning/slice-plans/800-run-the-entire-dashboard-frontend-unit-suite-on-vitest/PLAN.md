# Run the entire dashboard frontend unit suite on Vitest

**Identity:** SEED-413#retire-legacy-dashboard-frontend-runner
**Source:** [Run the entire dashboard frontend unit suite on Vitest](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#retire-legacy-dashboard-frontend-runner)

## Goal and scope

A maintainer lists, filters, runs and reviews CI proof for the complete
dashboard frontend unit suite on Vitest alone. The checkout keeps no frontend
unit path to `@playwright/test`. It also loses the frontend legacy config,
setup, output, fixtures and built-app substitutes. The complete group is
measured against the 7 min 15 s campaign baseline, with about one minute at
two workers as the target.

Included: the `test-harness/` audit, the runner cutover, the deletion of the
built-app support, the remaining authenticated defaults on reads owned by
`PageReads`, and the documentation, CI and output settings for the cutover.
Excluded: the backend group's own Playwright runner, which belongs to
the separately scheduled backend migration, and E2E. Evaluation case
overlays that run against a pinned revision are also excluded. The story
starts when all recorded prerequisites are satisfied, including
[SEED-426](../../seeds/SEED-426-start-ad-hoc-work-under-a-story.md#start-ad-hoc-work-under-a-story)
removing the remaining standalone legacy frontend cases from trunk.

## Current decisions

- Follow [Plain Vitest for unit tests; Playwright only for E2E](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e)
  and [Make production code directly testable instead of growing test support](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support).
  The cutover only removes from `dashboard/test-support/`. Apply
  [Dough MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) and
  [Dough Page Objects](../../../.agents/skills/dough-page-objects/SKILL.md)
  to any harness case that moves. Keep the default test timeout and never
  use `test.slow()`.
- `scripts/dashboard-group-run.mjs` is shared with the backend group, which
  still runs two engines. The frontend group drops its Playwright `config`
  from `browserTestGroups.mjs`. The group run then treats a group without a
  config as Vitest-only. It must not delegate an empty or non-Vitest
  selection to Playwright. The backend path keeps working unchanged.
- At `24ae92074` the run hands a selection without Vitest files to
  `retainedPlaywright` (`dashboard-group-run.mjs`, `!files.some(...)`
  branch). That covers an empty filter. With no config, an empty selection
  reports `No tests found` and exits 1, or exits 0 under `allowEmpty`. This
  is the same as the Vitest-only empty branch that exists today.
- Backend specs that assert the frontend preparation keep their behavior
  for the preparation that remains. These include
  `runtime/test-preparation-frontend`, `runtime/dashboard-artifact-demand`,
  `runtime/runner-ownership` and `observation/run-processes`. They lose only
  the frontend Playwright expectations.

## Decisive premises

| Consuming operation | Observation and result |
| --- | --- |
| Legacy specs this story moves | At `24ae92074`, a search for specs without a `from "vitest"` import, matching `isVitestFile`, found 30 frontend specs outside the Vitest set. Of these, `test-harness/` holds 3 `pageTest.ts` specs: observation measurements (2 cases), control reachability (7) and touch reading (2). The other 27 are outside retirement's scope. Slice 1 repeats the search after SEED-426 removes the 21 standalone cases across ten specs. |
| Consumers of the retired modules | At `24ae92074`, `git grep` outside `dashboard/frontend-tests/` named these consumers: the four backend specs above; `Distribution/tests/support/local-test-suite-checkout.mjs`, `local-test-suite-focused-runners.test.mjs` and `local-test-resources.md`; `runLifecycle.ts`, `runnerConfig.mjs`, `testFiles.mjs` and `groupRunnerExamples.ts`; `tsconfig.node.json`; `eslint.ignores.mjs`; and `scripts/retained-playwright.mjs`, which backend still uses. This is presence only. Slice 1 settles it by a scratch application and the consuming suites. |
| CI shard partition | `.github/workflows/ci.yml` `dashboard-frontend` declares shards `[1, 2]`. Shard 1 takes `intent/**`, `navigation/**` and `review/**`, and the other shard takes the rest, through `browser-test-group.yml`. Slice 5 observes the partition on branch CI. |
| Typed readers reach mounted consumers | At `f5f354ab3`, published details already supply the Done catalog, profile list and addition readers. Done link lookup supplies the catalog, and Intent locations and diff syntax hints supply the locations reader. `SessionAssignment` still relies on both profile defaults. This source trace leaves the mounted session-details observation with supplied profile readers open. |
| Full local suite route | Run the full group with Homebrew Bash 5 under `caffeinate -s -i` on AC power, per the [machine sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos). A Playwright listing in this preparation worktree failed: `node_modules/playwright/cli.js` was missing after a partial install. The execution workspace needs a complete `npm ci` on the pinned `.node-version` before any proof. |

## Slices

### 1. Probe: only the harness still uses the legacy frontend runner

Type: Structure
Status: planned

At fetched trunk, after all recorded prerequisites are satisfied, repeat the
legacy-spec search. In a scratch edit, remove `frontend.playwright.config.ts`
and the frontend group's `config`, then run `npm run typecheck:dashboard`,
the lint command, `npm run test:dashboard:frontend -- --list`, the four
backend specs, and the Distribution local-test-suite support tests. Record
each consumer that fails. Then revert.

**Proof.** The plan's premise rows record the remaining legacy specs and the
failing consumers, with their revision. If any legacy spec outside
`test-harness/` remains, stop: the owning supplier's outcome is incomplete.
If a consumer falls outside slices 3–5, replan those slices before
continuing.

### 2. Harness proof keeps only genuine measurement, touch and reachability checks

Type: Structure
Status: planned

Audit the three `pageTest.ts` harness specs. Move each genuine assertion to
a Vitest owner, either an existing observation spec or the measured
component. Retire assertions that prove only scaffolding being deleted, and
map each retired case to its reason in this plan.

**Proof.** Each moved assertion fails under a scratch break of the behavior
it measures, then passes once the break is reverted. Run the moved files
through `npm run test:dashboard:frontend -- <files>`. No `test-harness/`
spec imports `pageTest.ts`.

### 3. The frontend group command runs on Vitest alone

Type: Structure
Status: planned

Make the group run accept a group without a Playwright config. Remove the
frontend config from `browserTestGroups.mjs`. Delete
`frontend.playwright.config.ts` and `frontendGlobalSetup.ts`, and their
entries in `tsconfig.node.json`, `eslint.ignores.mjs`,
`groupRunnerExamples.ts` and the runner support comments. Update the four
backend specs and the Distribution local-test-suite tests to the remaining
preparation. Then the next slice can delete the built-app support without
breaking any runner.

**Proof.** `--list` names only Vitest projects. A file filter, a title
filter and an empty filter (exit 1, and exit 0 with `--pass-with-no-tests`) behave as before.
One file under `OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD`
writes a record with the same labels. The four backend specs pass through
`npm run test:dashboard:backend --`, and a backend listing still includes
both engines. The Distribution support tests pass through
`scripts/test.sh <files>`.

### 4. No built-app substitute support remains for frontend unit tests

Type: Structure
Status: planned

Delete `frontendApp.ts`, `frontendAppServer.ts`, the comparison bundle and
mount, `pageTest.ts`, `frontendServiceSubstitutes.ts`,
`frontendSubstituteAnswers.ts`, and the spent `frontend*` substitute, rule
and route-state modules. Follow their transitive imports until nothing
loses a live consumer. Keep any utility that E2E or backend imports, and
remove only its frontend legacy path.

**Proof.** `npm run typecheck:dashboard` and lint pass. A `git grep` of
`dashboard/` and `scripts/` finds no frontend import of `@playwright/test`
and no retired module name outside `.planning/`. `npm run test:e2e -- --list`
and `npm run test:dashboard:backend -- --list` still list their cases.

### 5. Documentation, CI and output settings name only the Vitest frontend runner

Type: Structure
Status: planned

Update `dashboard/frontend-tests/README.md`, the North Star topic's
"still to retire" wording, `Distribution/tests/local-test-resources.md`,
`browser-test-group.yml` steps that serve only the frontend Playwright
runner, and generated-output ignores. Keep the npm command, shards, timings,
proof label and publication.

**Proof.** Branch CI on the published candidate runs both
`dashboard-frontend` shards green. The proof artifact's case union equals a
local `--list` with no omission or duplicate, and `ci-proof` reads the
frontend proof.

### 6. Mounted Dashboard reads use their supplied readers

Type: Structure
Status: planned

Require an explicit reader for `cataloguedAt`, `readDoneStories`,
`readIntentLocationsAt`, `readAssignments` and `profileAdditionsAt`. Use the
existing typed `PageReads` sources for their page callers. Give
`SessionAssignment` the observation's profile list and addition readers;
keep authenticated implementations at production composition. Preserve read
results, gaps, retries and cancellation. Limit the change to the five reader
contracts and their direct callers and leave broader Board frame wiring to
its own work.

**Proof.** Typecheck the required readers at every call site. Run focused
mounted proof for Done catalog selection, Intent locations and review syntax,
and the session assignment shown from supplied profile and addition replies.
Use cold reads and make an unexpected authenticated read fail the case.
Keep the focused checks before the final suite measurement.

### 7. The complete frontend group is measured against the campaign baseline

Type: Behavior
Status: planned

Behavior: the complete frontend group at two workers, including preparation
→ one local run → elapsed time, case counts, and the slowest remaining
cases, compared with the 7 min 15 s baseline and the one-minute target.
Record the case-count and behavior ledger across every frontend campaign
story in the seed's [frontend renovation evidence](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#frontend-renovation-evidence).

**Proof.** Run `caffeinate -s -i npm run --silent test:dashboard:frontend -- --workers=2`
on AC power, recording load at start and finish. Every case passes on the
first attempt. Report the actual time and any remaining cost, including
proof promoted to E2E.

## Concern evidence

The seven slices follow consumer removal, then close the typed read boundary
before measuring the whole suite. The first slice is the authorized early
probe. The suppliers will change the paths that the consumer premises
inspected, so those premises reopen at start, and slice 1 settles them
before any deletion. Slice 1 also bounds the sizing of slices 3 and 4.

## Verification and delivery

- Local gate: use the maintained [macOS sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
  (`caffeinate -s -i`, AC power) for the full group run in slice 7. Follow
  the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
  as written.
- Changing the shared group run and the CI workflow justifies the broader
  checks in slices 3 and 5: the backend listing, Distribution support
  tests, and branch CI. Run focused gates through their maintained runners,
  apply the post-change refactor, and use the commit and publication gates.
