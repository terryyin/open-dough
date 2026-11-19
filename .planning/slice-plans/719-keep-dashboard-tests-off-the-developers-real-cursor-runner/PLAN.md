# Keep dashboard tests off the developer's real Cursor runner

**Identity:** SEED-412#keep-dashboard-tests-off-the-developers-real-cursor-runner
**Source:** [Keep dashboard tests off the developer's real Cursor runner](../../seeds/SEED-412-keep-dashboard-tests-off-the-developers-real-cursor-runner.md#keep-dashboard-tests-off-the-developers-real-cursor-runner)
**Source review:** [Independent review](source-review.md)

## Execution context

- Owned checkout: `/Users/terryyin/git/open-dough/.worktrees/keep-dashboard-tests-off-the-developer-s-real-cu`, branch `codex/keep-dashboard-tests-off-the-developer-s-real-cu`, established at starting revision `2ff7890804e1249ac58140afa72317e5f44cf2e7`.
- Integration checkout: `/Users/terryyin/git/open-dough`. The origin of this established launch was the Dashboard.
- Story Branch Mode, publisher `dashboard-territory.local-open-dough`, agent Rina-chan. Story branch and trunk claim confirmed on `origin` at `a731e2e54e1fa2b74164ec9456173aac56a96f92`. Authorized trunk is `origin/main`.
- Checkout setup passed `npm ci` and `npm run typecheck:dashboard`.
- GitHub Actions `ci.yml` (CI), story branch observer `seed-412-rina`,
  directory `/tmp/dough-ci-501/watch-XJafs3`, PID 41541, session 61370, cell `g212:9`.

## Goal and scope

Keep every dashboard test run (`test:e2e`, `test:dashboard:frontend`, and
`test:dashboard:backend`, both via `npm run` and direct config invocations,
including `--list`) off the developer's real `HOME` (`~/.open-dough/dashboard/`,
live Cursor runner, credentials, and session records):

- Slice 1 (`7ce5da1c7`, already integrated on `main`) moved
  `createComparisonRenderer` off `dashboard/vite.config.mts` onto
  `configFile: false`.
- Slice 2 gives each Playwright and Vitest browser run its own disposable
  temporary `HOME` under `tmpdir()`, resolving `PLAYWRIGHT_BROWSERS_PATH` from
  the pre-change home beforehand when unset and removing only its own run home
  on exit, while preserving explicit per-spec and per-fixture `HOME` overrides.

Exclusions follow the seed's scope limits and the
[Architectural North Star](../../NORTH-STAR.md): production `homedir()`
defaults are unchanged ([ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)),
explicit home parameters on typed server handlers belong to
[`SEED-413`](../../seeds/SEED-413-renovate-dashboard-unit-tests.md), and **zero
new wrapper files may be added to `dashboard/test-support/`** (the earlier
canary server, `NODE_OPTIONS --import` TCP preload, listener registry, and
Chromium `CONNECT` proxy are dropped).

## Architecture and PFE

- **Existing runner seams (zero new `test-support` files):**
  - [`runnerConfig.mjs`](../../../dashboard/test-support/support/runnerConfig.mjs)
    (`prepareGroupRun`, 203 lines) runs in the Playwright main process (`runner === true`)
    before global setup and is reloaded by workers (`runner === false`) across
    `e2e/playwright.config.ts`, `dashboard/backend.playwright.config.ts`, and
    `dashboard/frontend.playwright.config.ts`. Keying the run home env var by
    `${variables.runStamp}_HOME` (or `${prefix}_RUN_HOME`) keeps concurrent,
    nested, and mixed `scripts/test-frontend.mjs` runs independent so ending
    Playwright never deletes Vitest's run home.
  - [`dashboard/frontend.vitest.config.mts`](../../../dashboard/frontend.vitest.config.mts)
    (28 lines) runs before Vitest Browser Mode opens Chromium, both via
    `scripts/test-frontend.mjs` and direct `vitest --config`; keying its home by
    `OPEN_DOUGH_VITEST_RUN_HOME` gives Vitest its own disposable home and
    cleanup on process exit without touching 253-line `scripts/test-frontend.mjs`.
- **Browser cache resolution (`playwright-core`):** When
  `PLAYWRIGHT_BROWSERS_PATH` is unset, resolve Playwright's default registry
  path from `homedir()` before changing `HOME` (`~/Library/Caches/ms-playwright`
  on `darwin`, `${LOCALAPPDATA || ~/AppData/Local}/ms-playwright` on `win32`,
  `${XDG_CACHE_HOME || ~/.cache}/ms-playwright` on `linux`) and set
  `process.env.PLAYWRIGHT_BROWSERS_PATH`.
- Follow [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  and [Architectural North Star](../../NORTH-STAR.md) ("Make production code
  directly testable instead of growing test support").

## Decisive premises

Observed on 2026-11-19 in owned preparation worktree `/tmp/dough-prep-seed-412-56054`
at `35301ad92bc62ff5c7c221ee6261c8b021c8d31f` (Node v24.5.0, awake AC macOS
under `caffeinate -s -i`), with every scratch edit and temporary artifact
reverted before writing this plan:

| Premise and consuming operation | Form and profile observed | Result and remainder |
| --- | --- | --- |
| Slice 1 comparison renderer fix holds on current `main` (`35301ad92`) | `node node_modules/playwright/cli.js test --config dashboard/backend.playwright.config.ts dashboard/backend-tests/runtime/comparison-renderer-vite-cache.spec.ts` | Settled: exit 0; zero runner requests and no generated machine-local files in the test home. |
| Preserving `PLAYWRIGHT_BROWSERS_PATH` and setting a per-run `tmpdir()` `HOME` in `runnerConfig.mjs` and `frontend.vitest.config.mts` launches Chromium and leaves the invoking `HOME` untouched across mixed Playwright + Vitest runs (Slice 2) | Scratch `ensureDisposableTestHome` in `runnerConfig.mjs` (`${variables.runStamp}_HOME`) and `frontend.vitest.config.mts` (`OPEN_DOUGH_VITEST_RUN_HOME`), run from the developer's real `HOME` on `comparison-renderer-vite-cache.spec.ts` and under `PLAYWRIGHT_BROWSERS_PATH=$HOME/Library/Caches/ms-playwright HOME=<outer_scratch>` on `node scripts/test-frontend.mjs dashboard/frontend-tests/test-harness/` (retained Playwright specs + 5 mounted Vitest cases) | Settled: both commands exited 0; `<outer_scratch>/.open-dough/dashboard` retained only its seeded `cursor-runner.json`; without `PLAYWRIGHT_BROWSERS_PATH` under an empty `<outer_scratch>`, Chromium failed looking under `<outer_scratch>/Library/Caches/ms-playwright`, confirming discrimination of the cache-path preservation. |
| Existing runtime and runner specs do not depend on workers inheriting the caller's outer `HOME` (Slice 2) | Inspected `Distribution/tests/test-runner/*` and `dashboard/backend-tests/runtime/*.spec.ts`; ran `comparison-renderer-vite-cache.spec.ts` (which saves, overrides, and restores `process.env.HOME` inside the case) under the scratch change | Settled: all per-case `HOME` overrides happen inside the worker/fixture and restore cleanly to the run's disposable `HOME`. Remainder: run `consumer-trace.mjs` and focused runner/runtime checks during Slice 2. |

## Outside-in proof ownership

| Promise | Owning slice | Observable proof |
| --- | --- | --- |
| `createComparisonRenderer` compiles without mounting dashboard server boundaries or contacting the home's runner | Slice 1 (done, `7ce5da1c7`) | `dashboard/backend-tests/runtime/comparison-renderer-vite-cache.spec.ts` |
| Playwright (`backend`, `frontend`, `e2e`, including `--list`) and Vitest (`frontend.vitest.config.mts` / `scripts/test-frontend.mjs`) start with a disposable `tmpdir()` `HOME`, find Chromium via preserved `PLAYWRIGHT_BROWSERS_PATH`, keep explicit in-test `process.env.HOME` overrides, leave an outer `HOME`'s `cursor-runner.json` untouched, and remove their disposable `HOME` on exit | Slice 2 | Focused runtime/runner check invoking Playwright and `scripts/test-frontend.mjs` with a seeded outer `HOME` + logging listener, plus `comparison-renderer-vite-cache.spec.ts` and `mounted-boundary-server.spec.ts` |

## Ordered slices

### 1. The comparison renderer compiles without the dashboard's boundaries

Type: Behavior
Status: done

Behavior: Rendering starts and closes in a scratch home with a runner address.
It compiles normal comparison markup and leaves the runner and that home alone.

Accepted proof (`7ce5da1c7`): `comparison-renderer-vite-cache.spec.ts`
"a comparison renderer leaves the runner and the machine home alone" failed
with `POST /release-handoffs` before the fix and passes with the renderer on
`configFile: false` and the React plugin; the 15 comparison frontend specs (84
cases) pass through `pageTest.ts`.

### 2. Every dashboard test run uses and cleans up its own disposable default HOME

Type: Behavior
Status: done

Behavior: Invoking any Playwright dashboard group (`backend`, `frontend`, `e2e`,
or `--list`) or Vitest frontend browser run (`frontend.vitest.config.mts` /
`scripts/test-frontend.mjs`) from an environment whose `HOME` contains
`.open-dough/dashboard/cursor-runner.json` gives workers, Vitest browser
commands, and child processes a disposable `tmpdir()` `HOME`, launches Chromium
from the preserved `PLAYWRIGHT_BROWSERS_PATH`, leaves the outer `HOME` and its
runner untouched, preserves explicit per-test `process.env.HOME` overrides, and
removes each run's disposable `HOME` when its owning process exits — adding zero
new wrapper files to `dashboard/test-support/`.

Proof: Focused check launching Playwright and mixed `scripts/test-frontend.mjs`
against a seeded outer `HOME` with a logging listener (`homedir()` inside
workers/commands resolves under `tmpdir()`, `readCursorRunnerAddress()` is
`undefined`, zero listener hits, disposable home directory gone after exit),
plus `dashboard/backend-tests/runtime/comparison-renderer-vite-cache.spec.ts`,
`dashboard/backend-tests/runtime/mounted-boundary-server.spec.ts`, and
`npm run typecheck:dashboard`.

Accepted proof on the execution worktree at `a731e2e54` with the two runner
config edits:

- Nine launches against a seeded invoking home and a logging Cursor stand-in
  covered direct listing for all three Playwright groups, executing workers
  in each group, direct Vitest Browser Mode, and both default and explicitly
  configured browser caches in mixed frontend runs. Node setup, test module,
  worker and browser command observations saw the disposable homes. Workers
  and commands spawned children with those homes, and the worker verified
  Git could not read the invoking home's marker. The invoking runner received
  no requests and the fixture home stayed intact. Playwright removed its home
  before the mixed run's Vitest command, which still saw its own home. Each
  home disappeared at its owner's normal exit.
- The comparison renderer, mounted boundary server and nested runner ownership
  specs passed. Admission and shard checks passed 17 cases with the
  repository-required Bash 5. The concurrent backend runner check and
  Dashboard typecheck passed.
- Direct Vitest proof used `--configLoader runner`, the loader already used by
  the frontend driver. The default bundle loader reproduces the same parse
  errors in the mounted fixture graph at the starting revision. The mixed
  command's admission Git bookkeeping precedes Vitest runtime startup.
- Review commitments and exact observations are mapped in
  [the source review](source-review.md). The worktree Git evidence directory
  holds the runner harness, terminal records, consumer trace, and
  `seed-412-implementation-return.md` until retirement.
- The independent refactor pass found no edit necessary. The existing
  Playwright main-process check and an exit callback that captures the home
  each process creates supply ownership without an environment marker.

## Local gates and failure policy

Follow the shared
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md);
keep default timeouts and never use `test.slow()`. Run local browser checks on
awake AC macOS with `caffeinate -s -i` (or the open-lid battery procedure in
[machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)),
and run `npm run lint` and `npm run typecheck:dashboard`.

## Plan review

Refinement pass not needed: Slice 1 is already delivered on `main` (`7ce5da1c7`),
and Slice 2 is one cohesive ~30-line Behavior slice inside existing config files
with all decisive premises settled at `35301ad92`. Remaining concerns: none.
