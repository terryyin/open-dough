# Consumer trace

## Effect terms searched

| Term | Origin |
| --- | --- |
| `.planning/slice-plans/580-speed-up-slowest-dashboard-checks/execution-context.md` | changed path |
| `execution-context.md` | basename of `.planning/slice-plans/580-speed-up-slowest-dashboard-checks/execution-context.md` |
| `dashboard/backend-tests/runtime/production-deployment.spec.ts` | changed path |
| `production-deployment.spec.ts` | basename of `dashboard/backend-tests/runtime/production-deployment.spec.ts` |
| `dashboard/tests/support/publishedMainFixture.ts` | changed path |
| `publishedMainFixture.ts` | basename of `dashboard/tests/support/publishedMainFixture.ts` |
| `publishedMainFixture` | supplied |
| `stageDeployment` | supplied |
| `sourcePaths` | supplied |
| `.planning/slice-plans/580-speed-up-slowest-dashboard-checks/execution-context` | import path of `.planning/slice-plans/580-speed-up-slowest-dashboard-checks/execution-context.md` |
| `execution-context` | import path of `.planning/slice-plans/580-speed-up-slowest-dashboard-checks/execution-context.md` |
| `dashboard/backend-tests/runtime/production-deployment.spec` | import path of `dashboard/backend-tests/runtime/production-deployment.spec.ts` |
| `production-deployment.spec` | import path of `dashboard/backend-tests/runtime/production-deployment.spec.ts` |
| `dashboard/tests/support/publishedMainFixture` | import path of `dashboard/tests/support/publishedMainFixture.ts` |
| `cwd` | declared in `dashboard/tests/support/publishedMainFixture.ts`; in 526 files, too broad to list consumers by itself; supply it as a `--term` to list them |

## Scope

Whole checkout at `0ee3e439e9f6`, including uncommitted and untracked files: 5874 tracked and untracked non-ignored files searched with fixed-string, case-insensitive matching.

Changed files not searched: `.planning/slice-plans/580-speed-up-slowest-dashboard-checks/execution-context.md`, `dashboard/backend-tests/runtime/production-deployment.spec.ts`, `dashboard/tests/support/publishedMainFixture.ts`.

## Located consumers

Kinds are path hints for inspection; each file appears once. Fill every Disposition with `run`, `reused` or `excluded: <reason the effect does not reach its boundary>`.

### Production

| File | Terms matched | First matching line | Disposition |
| --- | --- | --- | --- |
| `.planning/seeds/SEED-275-story-intent-tabs/intent-story-tabs.html` | `production-deployment.spec.ts`, `publishedMainFixture`, `production-deployment.spec` | 127: `<div data-candidate-test hidden><button class="od-link cursor-interaction" type="button" data-back-candidates><i data-lucide="arrow-left" aria-hidden="true"></…` |excluded: historical/planning reference; no executable consumer or changed expectation |
| `dashboard/longest-first-boundary` | `production-deployment.spec.ts`, `production-deployment.spec` | 6: `31.0	backend-tests/runtime/production-deployment.spec.ts` |excluded: same file/title discovery; scheduler record does not call fixture |
| `dashboard/server/productionDeployment.mjs` | `stageDeployment` | 103: `export async function stageDeployment(options) {` |run: unchanged real stage/preview path, focused triple and six-case siblings |
| `scripts/watch-dashboard.mjs` | `stageDeployment` | 12: `stageDeployment,` |run: real refusal paths in siblings; activation source selection is unchanged |

### Test

| File | Terms matched | First matching line | Disposition |
| --- | --- | --- | --- |
| `dashboard/backend-tests/runtime/production-publication-fixture.spec.ts` | `publishedMainFixture.ts`, `publishedMainFixture` | 7: `import { publishedMainFixture } from "../../tests/support/publishedMainFixture.ts";` |run: strict siblings 6/6; full source/default input |
| `dashboard/backend-tests/runtime/production-watcher-refusals.spec.ts` | `publishedMainFixture.ts`, `publishedMainFixture` | 5: `import { publishedMainFixture } from "../../tests/support/publishedMainFixture.ts";` |run: strict siblings 6/6; full source/default input |
| `dashboard/tests/runtime/production-watcher-failures.spec.ts` | `publishedMainFixture.ts`, `publishedMainFixture` | 16: `import { publishedMainFixture } from "../support/publishedMainFixture.ts";` |excluded: new omission is opt-in and not supplied; empty pathspec lists byte-identically |
| `dashboard/tests/runtime/productionUpdateJourney.ts` | `publishedMainFixture.ts`, `publishedMainFixture` | 12: `import { publishedMainFixture } from "../support/publishedMainFixture.ts";` |excluded: new omission is opt-in and not supplied; empty pathspec lists byte-identically |
| `dashboard/tests/runtime/productionWatcherMachine.ts` | `publishedMainFixture.ts`, `publishedMainFixture` | 15: `import { publishedMainFixture } from "../support/publishedMainFixture.ts";` |excluded: new omission is opt-in and not supplied; empty pathspec lists byte-identically |
| `dashboard/tests/writing-journeys.md` | `publishedMainFixture` | 127: `` `publishedMainFixture` give one, and a test wiring `gh` itself takes `` |excluded: unchanged fixture ownership guidance; no runtime consumer |
| `src/skills/dough-story-refinement/scripts/preparation-handoff-guidance.test.mjs` | `execution-context` | 57: `/- the execution source and authority under \[Establish execution context\]\(\.\.\/\.\.\/dough-execute-plan\/SKILL\.md#establish-execution-context\);/,` |excluded: parent-owned execution-context note produced a lexical match; no source effect |

### Test support or stand-in

| File | Terms matched | First matching line | Disposition |
| --- | --- | --- | --- |
| `dashboard/tests/support/productionBuildGate.ts` | `publishedMainFixture.ts`, `publishedMainFixture` | 6: `import type { PathChanges } from "./publishedMainFixture.ts";` |excluded: type-only PathChanges import is unchanged; typecheck passed |
| `dashboard/tests/support/productionFault.ts` | `publishedMainFixture.ts`, `publishedMainFixture` | 6: `import type { PathChanges } from "./publishedMainFixture.ts";` |excluded: type-only PathChanges import is unchanged; typecheck passed |
| `dashboard/tests/support/productionQualificationFixture.ts` | `publishedMainFixture.ts`, `publishedMainFixture` | 18: `import { publishedMainFixture } from "./publishedMainFixture.ts";` |excluded: uses fullSource=false; source listing branch not entered |
| `dashboard/tests/support/publishedMainHosts.ts` | `publishedMainFixture.ts`, `publishedMainFixture` | 5: `import type { PublishedMainFixture } from "./publishedMainFixture.ts";` |excluded: fixture return shape/type is unchanged; typecheck passed |
| `tests/support/native-admission-reuse-test-fixtures.mjs` | `sourcePaths` | 22: `const sourcePathspecs = [` |excluded: independent local sourcePaths variable; inspected as existing pathspec precedent |

### Journey or feature

none found

### Guidance reader

| File | Terms matched | First matching line | Disposition |
| --- | --- | --- | --- |
| `.agents/skills/dough-bug-fixing/SKILL.md` | `execution-context` | 158: `and [resolve execution context](../dough-slice-planning/SKILL.md#resolve-execution-context)),` |excluded: parent-owned execution-context note produced a lexical match; no source effect |
| `.agents/skills/dough-execute-plan/references/oversized-slice.md` | `execution-context` | 21: `as in [slice planning](../../dough-slice-planning/SKILL.md#resolve-execution-context).` |excluded: parent-owned execution-context note produced a lexical match; no source effect |
| `.agents/skills/dough-story-refinement/references/preparation-journey.md` | `execution-context` | 135: `[Establish execution context](../../dough-execute-plan/SKILL.md#establish-execution-context);` |excluded: parent-owned execution-context note produced a lexical match; no source effect |
| `.claude/skills/dough-bug-fixing/SKILL.md` | `execution-context` | 158: `and [resolve execution context](../dough-slice-planning/SKILL.md#resolve-execution-context)),` |excluded: parent-owned execution-context note produced a lexical match; no source effect |
| `.claude/skills/dough-execute-plan/references/oversized-slice.md` | `execution-context` | 21: `as in [slice planning](../../dough-slice-planning/SKILL.md#resolve-execution-context).` |excluded: parent-owned execution-context note produced a lexical match; no source effect |
| `.claude/skills/dough-story-refinement/references/preparation-journey.md` | `execution-context` | 135: `[Establish execution context](../../dough-execute-plan/SKILL.md#establish-execution-context);` |excluded: parent-owned execution-context note produced a lexical match; no source effect |
| `.planning/evidence/SEED-303-dashboard-test-timings.md` | `dashboard/backend-tests/runtime/production-deployment.spec.ts`, `production-deployment.spec.ts`, `dashboard/backend-tests/runtime/production-deployment.spec`, `production-deployment.spec` | 18: `\| [Deployment serves the pinned revision](../../dashboard/backend-tests/runtime/production-deployment.spec.ts#L61) \| 25.741 \| 8.896 \| A real Git fixture, pinne…` |excluded: historical/planning reference; no executable consumer or changed expectation |
| `.planning/seeds/SEED-287-dashboard-journeys-within-default-timeout.md` | `dashboard/backend-tests/runtime/production-deployment.spec.ts`, `production-deployment.spec.ts`, `dashboard/backend-tests/runtime/production-deployment.spec`, `production-deployment.spec` | 248: `[production deployment](../../dashboard/backend-tests/runtime/production-deployment.spec.ts).` |excluded: historical/planning reference; no executable consumer or changed expectation |
| `.planning/slice-plans/576-fit-dashboard-journeys-in-default-timeout/PLAN.md` | `dashboard/backend-tests/runtime/production-deployment.spec.ts`, `production-deployment.spec.ts`, `dashboard/backend-tests/runtime/production-deployment.spec`, `production-deployment.spec` | 69: `` \| Policy-repair and production-deployment still carry temporary allowances \| Slice 6 remove after fit \| Read `dashboard/tests/runtime/productionUpdatePolicies.… `` |excluded: historical/planning reference; no executable consumer or changed expectation |
| `.planning/slice-plans/580-speed-up-slowest-dashboard-checks/baseline-evidence.md` | `production-deployment.spec.ts`, `production-deployment.spec` | 70: `\| production-deployment.spec.ts \| 1 \| 20.182 \| 20.182 \|` |excluded: historical/planning reference; no executable consumer or changed expectation |
| `.planning/slice-plans/580-speed-up-slowest-dashboard-checks/comparable-baseline.md` | `execution-context.md`, `execution-context` | 15: `Execution checkout and branch remain those in [execution context](execution-context.md).` |excluded: parent-owned execution-context note produced a lexical match; no source effect |
| `.planning/slice-plans/580-speed-up-slowest-dashboard-checks/coverage-map.md` | `dashboard/backend-tests/runtime/production-deployment.spec.ts`, `production-deployment.spec.ts`, `stageDeployment`, `dashboard/backend-tests/runtime/production-deployment.spec`, `production-deployment.spec` | 43: `\| 33 \| deployment installs, builds, and serves its pinned commit in isolation after main advances, with the real preview boundaries ([production-deployment.spe…` |excluded: historical/planning reference; no executable consumer or changed expectation |
| `.planning/slice-plans/580-speed-up-slowest-dashboard-checks/PLAN.md` | `execution-context.md`, `dashboard/backend-tests/runtime/production-deployment.spec.ts`, `production-deployment.spec.ts`, `execution-context`, `dashboard/backend-tests/runtime/production-deployment.spec`, `production-deployment.spec` | 38: `[Deployment](../../../dashboard/backend-tests/runtime/production-deployment.spec.ts)` |excluded: historical/planning reference; no executable consumer or changed expectation |
| `docs/maintainer/findings/ODF-257.md` | `publishedMainFixture` | 23: `- Evidence: the developer's message naming PIDs 225, 1381, 5054, 5666 and 22237 with deleted working directories and 46 of 48 GB in use; the coordinator's earl…` |excluded: historical/planning reference; no executable consumer or changed expectation |
| `docs/maintainer/findings/ODF-302.md` | `execution-context` | 25: `` - Evidence: `5e5dca5f2f4885a672e3ec1e316a8e35f015102a:.planning/slice-plans/375-packaged-transient-retry-proof/EVIDENCE.md#execution-context` records the initi… `` |excluded: parent-owned execution-context note produced a lexical match; no source effect |
| `docs/maintainer/project-compile-cache-findings.md` | `production-deployment.spec.ts`, `production-deployment.spec` | 34: `` retries. Focused proof selected `production-deployment.spec.ts --grep `` |excluded: historical/planning reference; no executable consumer or changed expectation |
| `src/skills/dough-bug-fixing/SKILL.md` | `execution-context` | 158: `and [resolve execution context](../dough-slice-planning/SKILL.md#resolve-execution-context)),` |excluded: parent-owned execution-context note produced a lexical match; no source effect |
| `src/skills/dough-execute-plan/references/oversized-slice.md` | `execution-context` | 21: `as in [slice planning](../../dough-slice-planning/SKILL.md#resolve-execution-context).` |excluded: parent-owned execution-context note produced a lexical match; no source effect |
| `src/skills/dough-story-refinement/references/preparation-journey.md` | `execution-context` | 135: `[Establish execution context](../../dough-execute-plan/SKILL.md#establish-execution-context);` |excluded: parent-owned execution-context note produced a lexical match; no source effect |
