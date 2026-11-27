# Correct the fast runtime cases' leftovers

**Identity:** SEED-413#fast-runtime-unit-case-cleanup
**Source:** [Correct the fast runtime cases' leftovers](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#fast-runtime-unit-case-cleanup)

## Goal and scope

Maintainers running the fast runtime unit cases keep that folder's delivered
promises without an end-to-end wait or a Git process. Correction of
[plan 879](https://github.com/terryyin/open-dough/blob/7fdf8e265edfb72ded348f3845080a186f5a39f1/.planning/slice-plans/879-prove-runtime-in-fast-unit-cases/PLAN.md)
(`SEED-413#fast-runtime-unit-cases`, commits `b7f5b8ff0`..`5b4c52038`).
Test and test-support changes only; no product behavior changes. The runner
cutover stays with
[its story](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#retire-legacy-dashboard-backend-runner).

Findings, rechecked at `f6092ebf8`:
- `production-deployment.spec.ts` calls `expectSelectedCommit` directly.
  `stageDeployment` calls `verifyPublishedCommit` and only then `npm ci` and
  `npm run build:dashboard`. Nothing in the unit file drives that sequence.
- `e2e/observation/transient-read-exclusions.spec.ts:115-133` races
  `expectMembership` against a Board count that cannot settle in the
  malformed-backlog state, then awaits that count, so the journey pays
  Playwright's locator timeout to prove a test helper fails fast.
- `committed-origin-routing.spec.ts:97-113` spawns `git ls-remote`.
  `homeRoutes` (`homeRoutes.ts:55-77`) reads the same list through
  `git config --get-regexp`.
- Cases that only restate a constant or stub: `boundary-server.spec.ts:45-58`
  (seeded project ids), `mounted-boundary-server.spec.ts:48-60`
  (`processOnly`'s message and `withRestoredEnv`),
  `page-read-waits.spec.ts:116-129` (the `finishRouteHandlers` stub),
  `test-preparation-boundary.spec.ts:21-23` (the dev `servedArtifacts` cell).
- `verifyPublishedCommit` (`productionDeployment.mjs:55`) and
  `productionBuildEnvironment` (`productionWatcherFixture.ts:15`) are
  exported without outside callers. `scripts/watch-dashboard.mjs` imports
  `resolvePublishedMain` and `stageDeployment` only.

## Direction and current decisions

- The Dashboard start took this correction on Story Branch Mode with
  Rina-chan in the named worktree and published
  `3e5ebed61c025bfbb57fd2efe11f79bf52701786` on `origin/main` and the
  execution branch. The seed and revised plan agree on all four outcomes.
  The readiness review remains marked changed. The checkout's locked install
  and dashboard typecheck passed.
- Execution pushes target `origin/codex/correct-the-fast-runtime-cases-leftovers`.
  GitHub Actions `ci.yml` is observed there from this checkout by
  `rina-205c04b8` in `/tmp/dough-ci-501/watch-OWCpDU` (Codex cell
  `g752:9`, session `52471`, PID `49439`). The trunk claim itself was
  unobserved.

- Plan 879's decisions hold: plain Vitest for unit tests, one case per rule,
  MakeMe and page-object conventions, no `test.slow()`, default timeouts.
- [Make production code directly testable instead of growing test support](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
  and [Plain Vitest for unit tests; Playwright only for E2E](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e).
  Slice 1 passes the existing `command` runner into `stageDeployment`,
  defaulting to the real runner, instead of adding a test-support Git stand-in.
  Slice 2 does not import `@playwright/test` into the runtime spec.
  `dashboardPage.ts` value-imports it, so the immediate title comparison moves
  to `pageRequestNoting.ts`, which that spec and the page object already use
  and which only type-imports Playwright. That is the framework limit the
  North Star allows as a minimal seam, not a new wrapper. Slice 3 deletes the
  `git` spawn inside `homeRoutes` and reads the config text `writeHomeRoutes`
  already writes. No new test-support file.
- Reuse `expectSelectedCommit` for the mismatch, `expectMembership`'s
  immediate branch for the fail-fast rule, and `writeHomeRoutes`'
  serialization for the route list. Delete the restating cases rather than
  replacing them.
- `expectServedHomesReach` proves Git finds the published revision under the
  served HOMEs. It does not assert the unrouted-path message the `ls-remote`
  case asserts; that case is the one this story removes.
- Remove a case only after naming its surviving owner in the commit message.
  The seeded-id case restates `seededProjects` and `projectConfigurationFile`;
  no journey reads that literal list.
- Failures follow the shared
  [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
  as written.

## Ordered slices

### 1. Prove staging refuses a checkout that is not the selected commit
Type: Behavior
Status: done

Behavior: a staged checkout whose fetched HEAD is not the selected commit →
`stageDeployment` refuses with `Fetched commit … did not match selected main
commit …` and does not run `npm ci` or `npm run build:dashboard`.

The case supplies the production command runner. `git rev-parse HEAD` returns
the other commit; `npm` is recorded and must not be called. The real `command`
stays the default, so the watcher journeys are unchanged.

Proof: `dashboard/backend-tests/runtime/production-deployment.spec.ts`.
Removing the `expectSelectedCommit` call from the sequence fails the case.
`npx vitest run --config dashboard/backend.vitest.config.mts dashboard/backend-tests/runtime/production-deployment.spec.ts`

Accepted proof: Both Node cases passed. The staging test supplied a different
HEAD through the injected command, observed both SHAs in the rejection,
and saw no npm command. Removing the comparison made staging resolve
instead of rejecting and failed the test. The comparison was restored.
The comparison now has only its internal staging caller and is private.
The focused check passed again after spelling the command substitute's
promise explicitly for the project lint rule.
Hosted watcher and qualification journeys exercise the default command,
which retains its arguments and behavior.
Published on the execution branch at `a7e3119ee203f05a537afc8358bcc67a4f5f6545`.

### 2. Prove the membership check fails at once when the read fails for good
Type: Behavior
Status: done

Behavior: the published-work read failed for good (the page says to reload
and shows no work) and the check is asked for two titles that are not shown →
the check fails synchronously and the failure names both titles. The
malformed-backlog journey no longer races or awaits a Board count.

`expectMembership` still reads the problem line on a real page, then calls
the comparison. The `page-read-waits.spec.ts` case calls that same comparison
with the failed-for-good fact and the two titles. Delete the appended block
in `transient-read-exclusions.spec.ts` (the comment, the race, and
`await bound`); keep the rest of that journey.

Proof: the new case, and `e2e/observation/transient-read-exclusions.spec.ts`
with the block gone.
`npx vitest run --config dashboard/backend.vitest.config.mts dashboard/backend-tests/runtime/page-read-waits.spec.ts`
and, under `caffeinate -s -i`,
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npm run --silent test:e2e -- e2e/observation/transient-read-exclusions.spec.ts`

Accepted proof: 6 Node cases passed. The replacement case requires a
synchronous exception containing both expected titles. The page object
calls that comparison after reading the terminal reload cue and continues
to use the waiting matcher for ordinary membership. The focused Chromium
file passed all 6 first attempts. The malformed journey retained its
read/no-snapshot/no-retry checks after removal of the Board wait. The
project-switch case exercised ordinary membership. The exact command
passed quietly, and a second run recorded attempts using the runner's
proof-record option.
Published on the execution branch at `6a94187c24e39f4e524c61f8c55afdc690138e0a`.
Its queued run superseded slice 1's run, which GitHub cancelled with
zero failed jobs.

### 3. Round-trip a HOME's routes through its config text
Type: Structure
Status: done

Change: `homeRoutes` parses the config text `writeHomeRoutes` writes,
including a quoted origin, and no longer spawns Git. Drop the `git ls-remote`
case from `committed-origin-routing.spec.ts`. `writeHomeRoutes` stays as it
is, so Git still sees the same file. `changeHomeRoutes` keeps returning the
same route list.

Preserved behavior: the route list round-trips, and the other routing cases
in that spec stay. The weakness removed is the runtime folder starting Git.

Proof: `dashboard/backend-tests/runtime/committed-origin-routing.spec.ts`
passes, and neither that spec nor `homeRoutes` spawns `git`.
`npx vitest run --config dashboard/backend.vitest.config.mts dashboard/backend-tests/runtime/committed-origin-routing.spec.ts`
Do not run the `expectServedHomesReach` journeys locally: the writer is
unchanged, and those journeys remain Git's own check in hosted CI.

Accepted proof: 5 Node cases passed. The round-trip observes the routes in
order, including the quoted origin, and the retained user config setting.
The reader and runnable route cases no longer invoke Git. Real Git's
published-revision checks remain in the hosted journeys, and the plan's
retired unrouted-path assertion was removed.

### 4. Remove restated cases and unused exports
Type: Structure
Status: planned

Change: remove the four restating cases named in the findings. Un-export
`verifyPublishedCommit` and `productionBuildEnvironment`. In the commit
message, name the surviving owner of each removed case: the mounted-server
refusal cases for `processOnly`, the helper's callers for `withRestoredEnv`,
real page teardown for `finishRouteHandlers`, and the boundary `servedArtifacts`
case in the same file for the dev cell. The seeded-id case has no journey
owner, as the decisions say.

Preserved behavior: the runtime folder's remaining cases. The weakness
removed is cases and exports that only restate a constant, a stub, or a
function with no outside caller.

Proof: the runtime folder passes and `npm run typecheck:dashboard` passes.
`npx vitest run --config dashboard/backend.vitest.config.mts dashboard/backend-tests/runtime`

## Decisive premises

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| P1 The unit case and the watcher journey do not prove staging refuses before npm | Slice 1's case, through `stageDeployment` | Intent Coverage of plan 879 slice 1 at `b4e218f6b` (`.planning/done/SEED-413_fast-runtime-unit-cases.json`). `git log b4e218f6b..f6092ebf8` is empty for `productionDeployment.mjs`, `production-deployment.spec.ts`, and `e2e/runtime/production-watcher.spec.ts` | With `expectSelectedCommit` removed from `verifyPublishedCommit`, staging ran `npm ci` and the build; the unit file (2/2) and `production-watcher.spec.ts` (6/6) stayed green |
| P2 `homeRoutes`' Git read returns the routes `writeHomeRoutes` wrote, including a quoted origin | Slice 3's parser, which must return that same list | Node v24.21.0, Apple Git 2.50.1, at `f6092ebf8`: `writeHomeRoutes` then `homeRoutes` on `/explicit` and `/with "quote"` | File text and the Git read were the same two routes. The file is `[url "<origin>"]` / `insteadOf = <url>`, with `"` escaped |
| P3 The fail-fast rule is the immediate title comparison once the page says the read failed for good | Slice 2's comparison, called by `expectMembership` | Source at `f6092ebf8`: `dashboardPage.ts` compares shown titles with `toEqual` when the problem contains `Reload the page to read again.`; that line is the no-work branch in `PublishedReadFailure.tsx`. The E2E block then awaits the Board count. Not re-timed | The comparison is synchronous once the failed-for-good fact is known. The 5 s cost is the unconditional Board wait the slice deletes |
| P4 The two exports have no outside caller | Slice 4's un-export, then `tsc` and loading the module | Scratch removal of both `export` keywords at `f6092ebf8`, reverted afterward. `npx tsc --build dashboard/tsconfig.json` (18.8 s). `import * as deployment from "./dashboard/server/productionDeployment.mjs"` | Typecheck passed. The module no longer exposed `verifyPublishedCommit` and still exposed `stageDeployment`, `resolvePublishedMain`, and `expectSelectedCommit` |

## Proof ownership and local gate

| Promise | Slice |
| --- | --- |
| Staging refuses a mismatched checkout before install or build, with no Git or npm process | 1 |
| Membership fails at once, naming both titles, when the read fails for good; the journey no longer waits out the Board count | 2 |
| A HOME's routes round-trip through config text and the runtime folder starts no Git | 3 |
| Restating cases and the two unused exports are gone; remaining runtime cases and the dashboard typecheck pass | 4 |

Apply the shared
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Focused Vitest uses the commands on the slices. The one E2E file and any
longer local check run on awake macOS on AC under `caffeinate -s -i`, per
[AGENTS.md](../../../AGENTS.md). The runtime folder is the broadest local
unit check, because slice 4 deletes cases across it. Hosted CI still runs
the watcher and `expectServedHomesReach` journeys; this plan does not make
them a local gate.

## Plan review

Slice-plan refinement was not needed after this write. The route round-trip,
the restatement removal, and the un-export are separate proof loops, so they
are slices 3 and 4 rather than one combined cleanup. Four slices are within
the limit. Each fits one 15-minute active slice: the command seam, the
comparison move, the config parse, and the deletions. No remaining
slice-specific concern. No early probe.
