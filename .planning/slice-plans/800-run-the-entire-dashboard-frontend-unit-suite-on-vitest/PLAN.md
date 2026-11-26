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
[SEED-439](https://github.com/terryyin/open-dough/blob/1ee3eb03b59a2133fdb73dddaf28c9d44fef2de8/.planning/seeds/SEED-439-complete-story-linked-ad-hoc-sessions.md#complete-story-linked-ad-hoc-sessions)
removing the remaining standalone legacy frontend cases from trunk.

## Current decisions

- Follow [Plain Vitest for unit tests; Playwright only for E2E](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e)
  and [Make production code directly testable instead of growing test support](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
  under [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md).
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
- Route an empty frontend selection through the existing group-run policy:
  `No tests found` and exit 1, or exit 0 with `--pass-with-no-tests`.
- Backend specs that assert the frontend preparation keep their behavior
  for the preparation that remains. These include
  `runtime/test-preparation-frontend`, `runtime/dashboard-artifact-demand`,
  `runtime/runner-ownership` and `observation/run-processes`. They lose only
  the frontend Playwright expectations.
- The comparison renderer and static app server have backend specs for those
  harnesses themselves. Retire those assertions with their harness and retain
  artifact-demand and teardown proof for the runners that still build and
  serve the app. The backend and E2E still use the shared `pageTest.ts` base.

## Decisive premises

| Consuming operation | Observation and result |
| --- | --- |
| Legacy specs this story moves | At `e63a4f2f3` (after SEED-432), `caffeinate -s -i npm run --silent test:dashboard:frontend -- --list` lists 846 rows: 835 `mounted-chromium` (Vitest) and 11 legacy `chromium` rows, all in `test-harness/`: `control-reachability-observation` (6), `observation-measurements` (4) and `touch-reading-observation` (1). No legacy spec remains outside `test-harness/`. |
| Consumers of the retired modules | Slice 1 scratch removal at `e63a4f2f3` (frontend config, `frontend.playwright.config.ts`, all `support/frontend*.ts`, comparison-mount bundle and renderer, the comparison extensions in `pageTest.ts`, the three harness specs and `frontend-app-server.spec.ts`) failed: the frontend listing (`dashboard-group-run.mjs` joins a missing `group.config`); typecheck and lint in `test-preparation-budget/frontend.proof.ts`, `artifact-demand/app.proof.ts` and `unregistered.proof.ts`, `intent/intent-ci-scope-page.tsx` (`ComparisonMountScope`), `backend-tests/runtime/comparison-renderer-vite-cache.spec.ts`, `accessibleBoard.ts`, `intentPerspectivePage.ts`, `frontend-tests/review/story-review-details.spec.ts` and `e2e/intent/intent-read-boundary-recovery.spec.ts`; the four backend preparation/ownership specs; and 13 Distribution `local-test-suite*` cases that copy the deleted config (`local-test-suite-checkout.mjs:72-73,127`). `dashboard/tsconfig.app.json` includes the comparison-mount bundle and `eslint.config.mjs` names it. Three `frontend*` modules still serve surviving code: `accessibleBoard.ts` keeps an unused `publishLargeBacklog(FrontendServiceState)`; E2E `intent-read-boundary-recovery` counts reads through `countAuthenticatedReads` from `frontendAuthenticatedReadControl.ts`; the Vitest `story-review-details` spec takes `frontendReviewIds` through `frontendStoryReview.ts`, which imports Playwright types. `e2e/intent/intent-code-browse.spec.ts` names a harness spec path only as fixture data, and the Distribution evaluation overlay's `frontendApp.ts` is its own client copy. |
| CI shard partition | At `910772218`, the runner's `groupFiles(frontendGroup, split)` for unsplit, `1/2` and `2/2` selected 332, 205 and 127 files. The split sets had no overlap, missing or extra files. Slice 5 checks the updated file partition and publication on branch CI. Slice 7 compares executed case identities. |
| Typed readers reach mounted consumers | At `910772218`, a cold scratch case in `launches/launch-record-details` opened Session details on a saved allocation and refused `/__authenticated-read`. It failed on that request with default readers. With both existing `PageReads.observation` readers wired and the five private defaults removed, it displayed the supplied credit, asked the supplied readers exactly once at the saved revision and made zero authenticated requests. `caffeinate -s -i npm run --silent test:dashboard:frontend -- launches/launch-record-details sessions/compact-session-entry-cursor --workers=2` passed 5 cases with the direct mounts supplying the page context. `caffeinate -s -i npm run --silent typecheck:dashboard` identified the shared Intent read spec as the remaining caller before its reader was supplied. Typecheck then passed, and `caffeinate -s -i npm run --silent test:dashboard:backend -- intent/intent-shared-reads --workers=2 --reporter=line` passed all 7 cases. Scratch edits were reverted. |
| Local proof route | In this preparation worktree, `caffeinate -s -i npm ci` on AC power succeeded with pinned Node 24.21.0. The full listing and the focused Chromium and backend runs above reached their consumers. Repeat the pinned dependency setup in execution. Slice 7 owns the complete timed run. |

## Slices

### 1. Probe: only the harness still uses the legacy frontend runner

Type: Structure
Status: done

At fetched trunk, after the supplier has landed, list the frontend group
and record the legacy cases by file. In scratch, remove the frontend
Playwright registration and legacy-only support slated for slices 3–5.
Trace the resulting callers with the installed consumer trace, then run
`npm run typecheck:dashboard`, `npm run lint`, the frontend listing, the
backend preparation/ownership specs and the Distribution local-test-suite
support tests. Record which commands and consumers fail, then revert.

**Proof.** The plan's premise rows record the remaining legacy specs and the
failing consumers, with their revision. If any legacy spec outside
`test-harness/` remains, stop: the owning supplier's outcome is incomplete.
If a consumer falls outside slices 3–5, replan those slices before
continuing.

### 2. Playwright observation helpers keep their proof in the backend group

Type: Structure
Status: done

The three legacy `test-harness/` specs prove Playwright-only helpers that
E2E and backend page objects use: `expectEveryControlReachable` and
`tapWhereShown` (`controlReachability.ts`), the four arrangement checks
(`partArrangement.ts`) and `scrollByTouch` (`touchGestures.ts`). They need
`Locator`, `page.touchscreen` and CDP sessions, which the in-browser Vitest
mounts lack, and they touch no built-app substitute. Move the three specs
unchanged into `dashboard/backend-tests/observation/`, keeping all 11 cases
on the shared `pageTest.ts` base. The separately scheduled backend migration
decides their later home.

**Proof.** Each moved spec fails under a scratch break of the helper it
measures and passes once the break is reverted, run through
`npm run --silent test:dashboard:backend -- <files> --workers=2`. The
frontend listing shows no `test-harness/` spec importing `pageTest.ts`, and
the backend listing includes the 11 cases.

**Accepted proof.** All 11 cases moved with their names; none retired.
Scratch breaks of `expectEveryControlReachable`, `expectStackedInOrder` and
`scrollByTouch` failed each moved spec through the backend command, and the
reverted run passed 11 cases. Typecheck and lint passed. The move leaves
`runner-ownership` "Dashboard Frontend Test runs started beside each other"
without its frontend example (`groupRunnerExamples.ts` names the moved
spec), so slice 2 publishes together with slice 3.

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

**Proof.** `--list` names only the Vitest runner. Check file and title
selection through the command and an empty selection both with and without
`--pass-with-no-tests` (exit 0 and 1 respectively).
One file under `OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD`
writes a record with the same labels. The four backend specs pass through
`npm run test:dashboard:backend --`, and a backend listing still includes
both engines. The Distribution support tests pass through
`scripts/test.sh <files>`.

### 4. No built-app substitute support remains for frontend unit tests

Type: Structure
Status: planned

Delete `frontendApp.ts`, `frontendAppServer.ts`, the static comparison
bundle and renderer with its `tsconfig.app.json` and `eslint.config.mjs`
entries, the comparison-only extensions in `pageTest.ts`,
`frontendServiceSubstitutes.ts`, `frontendSubstituteAnswers.ts`, and the
spent `frontend*` substitute, rule and route-state modules. Keep the shared
Playwright fixture base for E2E and backend. Move `ComparisonMountScope`
and its input type out of the static comparison mount to the existing
mounted Intent scope fixture owner. Delete the unused `publishLargeBacklog`
with `frontendServiceState.ts`. Move the authenticated-read counting that
E2E `intent-read-boundary-recovery` uses next to its page object in
`intentPerspectivePage.ts`. Give `story-review-details` its review ids
from `frontendStoryReviewFixtures.ts`, which imports no Playwright, and
delete `frontendStoryReview.ts` with its answer and route modules. Drop
the harness-only backend specs, including
`comparison-renderer-vite-cache`, and preserve generic app artifact and
process ownership checks through the surviving runners.

**Proof.** Typecheck and lint pass. Search `dashboard/` and `scripts/` for
retired modules and frontend `@playwright/test` imports, including imports
through shared helpers. Run the mounted Intent scope cases through the
frontend group. List E2E and backend, and run a representative shared
`pageTest.ts` case in each plus the retained artifact-demand checks.

### 5. Documentation, CI and output settings name only the Vitest frontend runner

Type: Structure
Status: planned

Update `dashboard/frontend-tests/README.md`, the North Star topic's
"still to retire" wording,
`browser-test-group.yml` steps that serve only the frontend Playwright
runner, and generated-output ignores. Keep the npm command, shards, timings,
proof label and publication.

**Proof.** Branch CI on the published candidate runs both
`dashboard-frontend` shards green. Confirm their selected file sets
partition the unsharded listing and their Vitest timing files and proof
fragments feed `ci-shard-balance` and `ci-proof` respectively. Keep the CI
browser install and cache for mounted Chromium and the shared upload
contract for E2E and backend.

### 6. Mounted Dashboard reads use their supplied readers

Type: Structure
Status: planned

Require an explicit reader for `cataloguedAt`, `readDoneStories`,
`readIntentLocationsAt`, `readAssignments` and `profileAdditionsAt`. Use the
existing typed `PageReads` sources for their page callers. Give
`SessionAssignment` the observation's profile list and addition readers;
keep authenticated implementations at production composition. Preserve read
results, gaps, retries and cancellation. Supply the page context in the
two direct Session entry mounts. Supply `requestIntentLocationsAt` to the
shared Intent read spec to keep its authenticated memoization and Retry
check. Limit the change to the five reader contracts and their direct callers.

**Proof.** Typecheck the required readers at every call site. Run focused
mounted proof for Done catalog selection, Intent locations and review syntax,
and the session assignment shown from supplied profile and addition replies.
Use cold reads and make an unexpected authenticated read fail the case.
Check the focused session mounts and the backend shared-read spec before the
final suite measurement. Preserve the existing E2E session-attribution
journey through authenticated composition.

### 7. The complete frontend group is measured against the campaign baseline

Type: Behavior
Status: planned

Behavior: the complete frontend group at two workers, including preparation
→ one local run → elapsed time, case counts, and the slowest remaining
cases, compared with the 7 min 15 s baseline and the one-minute target.
Record the case-count and behavior ledger across every frontend campaign
story in the seed's [frontend renovation evidence](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#frontend-renovation-evidence).

**Proof.** Run `caffeinate -s -i npm run --silent test:dashboard:frontend -- --workers=2`
on AC power with a fresh absolute `OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD`
path, recording load at start and finish. Compare the union of both CI shards'
executed case identities to the unsharded execution record at the same
revision. Compare execution to execution because discovery can report
parameterized case declarations without expanding their rows. Every case
passes on the first attempt. Report the actual time and any remaining cost,
including proof promoted to E2E.

## Concern evidence

Slice-plan refinement ran and retained seven slices. It assigned shared
fixture and mounted Intent proof to slice 4 and the executed-case comparison
to slice 7. The prerequisite changes the runner's consumers. Slice 1
rechecks that dependency-sensitive boundary and the sizing of slices 3 and
4 before any deletion. The cold mounted observation and the required-reader
typecheck settled the previous slice 6 concern. The review found no other
slice-specific concern.

## Verification and delivery

- Local gate: use `caffeinate -s -i` on AC power
  (`caffeinate -s -i`, AC power) for the full group run in slice 7. Follow
  the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
  as written.
- Changing the shared group run and the CI workflow justifies the broader
  checks in slices 3 and 5: the backend listing, Distribution support
  tests, and branch CI. Run focused gates through their maintained runners,
  apply the post-change refactor, and use the commit and publication gates.
