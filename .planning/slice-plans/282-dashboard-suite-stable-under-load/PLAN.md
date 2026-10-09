# The dashboard suite gives the same result under local load

**Identity:** SEED-123#dashboard-suite-stable-under-load
**Source:** [refined story](../../seeds/SEED-123-dashboard-suite-stable-under-load.md#dashboard-suite-stable-under-load).
**Prepared:** 2026-10-08, planning only, in the established preparation
workspace `/Users/terryyin/git/open-dough/.worktrees/the-dashboard-playwright-suite-gives-the-same-re`
on `claude/the-dashboard-playwright-suite-gives-the-same-re`, under the
preparation assignment for `bastiaan-chan`. Refined in place on 2026-10-09
in the same workspace under the assignment for `d.kanai-chan`, after the
story's investigative refinement. Publication target: `origin/main`;
integration checkout: `/Users/terryyin/git/open-dough`.

## Goal and boundaries

`npm run test:dashboard` at Playwright's default local worker count gives the
same pass or fail result as CI on the same code, on a developer machine that
is also running other work, so a local failure always points at a real defect
and is never answered with a rerun.

In scope, from the story: a failed run's console report and retained files
survive a later run from the same checkout and are named in the failure
output; two runs from one checkout do not interfere; the recorded failure
kinds are reproduced at default workers, with the shared build ruled out, and
the suite's own causes in waits, shared outputs, or local worker selection are
fixed; three consecutive full runs at default workers pass, one of them under
induced CPU load and one of them the first run in a freshly prepared
checkout (its own dependency install, no earlier suite run); the tests guide
records the kept location and the loaded-run expectation.

Material exclusions, from the story:

- A result under load that leaves the suite no CPU at all. The suite stays
  truthful there: it fails naming the wait, keeps its evidence, and is not
  retried.
- A product defect in the dashboard server or app that the reproduction
  uncovers gets its own bug report; this story fixes the suite.
- A faster local full run. Only its result is promised.
- `retries` stays 0. Waits end on an observable event or the real failure
  signal; a raised bound is acceptable only on a wait that already ends on
  the event. CI's dashboard shards still end within their recorded deadline.

## Published baseline and integration context

Origin was fetched at `7770d013` (`origin/main`). The highest plan directory
allocated on that history is `281-review-merged-one-shot-change`;
`282-dashboard-suite-stable-under-load` was free immediately before this
write. This workspace is at `04079cda` (the refined seed) on top of
`eda80638`, behind that trunk by backlog and plan commits that touch none of
the dashboard test support this plan changes. This workspace has no
`node_modules` of its own; for the observations below it was linked to the
integration checkout's `node_modules` (same `package-lock.json`), and the
link is removed before the result is kept.

No North Star topic governs the browser suite's own harness. Accepted ADRs
0000, 0002, 0005, and 0006 apply as the story records; none constrains how
the suite keeps its evidence or builds its assets. No Accepted ADR conflicts.
This plan adds no North Star topic.

## Existing solutions and selected approach

PFE for three responsibilities: keeping a failed run's evidence, isolating
concurrent runs from one checkout, and reproducing the recorded failures.

| Need | Finding |
| --- | --- |
| A failed run's console report survives a rerun | **Change** `dashboard/tests/support/quietReporter.ts`. It already prints each failure with its error, captured output, and retained files, and prints nothing for a passing run. It prints to the console only, so a delegated rerun replaces the only record (DD-224). It gains a written copy of everything it printed, in the run's output directory, and a final line naming that directory when anything was shown. |
| Retained files survive a rerun | **Change** `dashboard/playwright.config.ts`. Playwright removes `outputDir` before global setup on every run (`node_modules/playwright/lib/runner/index.js`, `createRemoveOutputDirsTask` first among the global setup tasks), so one shared `./test-results` cannot keep a previous run. Each run gets its own directory under `dashboard/test-results/`, named by its start time, so a later run removes only its own. CI's report upload already takes `dashboard/test-results/` whole, so a stamped subdirectory arrives with it. `preserveOutput` cannot do this: it governs passing tests' files, not a previous run's. |
| A passing run leaves no clutter | **Change** the reporter: at exit of a run that showed nothing, it removes the run's own directory. Playwright writes `.last-run.json` there; the proof in slice 1 observes whether that file arrives before or after `onExit`, and if after, the directory stays with a `passed` marker instead. Nothing here deletes another run's directory; the developer removes kept runs. |
| Concurrent runs do not rebuild each other's assets | **Change** `dashboard/tests/support/globalSetup.ts` and `builtDashboardDir`. Today global setup builds into the shared `dashboard/dist` and about seventy specs and helpers pass `prebuilt: builtDashboardDir`. Global setup builds into a private directory under the OS temporary directory instead (`buildDashboardTo` already takes any `outDir`; a build takes about 1.2 s and 80 MB, nearly all avatars), hands its path to workers through the environment (Playwright forks workers with the runner's `process.env`), and `builtDashboardDir` reads that path, so no consumer changes. A `globalTeardown` removes it. Production `npm run build:dashboard` keeps `dashboard/dist`. |
| Reproducing the recorded failures | **Gap.** `scripts/ci-repeat.sh` repeats CI only, and no local repeat or load tool exists. Slice 3 adds one maintainer script that runs the suite (or named specs) a given number of times, optionally under CPU burners it starts and stops, and reports each run's exit, seconds, load averages, and kept directory. It belongs beside `ci-repeat.sh` and is documented in the tests guide. |
| Waits with fixed bounds | **Change** per slice 3's findings. The suite's own bounds today: `ownAddress` waits 20 s for Vite's address (`dashboard/tests/support/viteAddress.ts`); the config sets no `timeout` or `expect.timeout`, so tests have 30 s and every plain `expect` 5 s; explicit bounds appear 83 times at 30 s, 18 at 5 s, 11 each at 60 s and 20 s, and 7 at 180 s; ten completion specs set 120 s test timeouts; the server's start wait is shortened per spec through `DOUGH_START_TIMEOUT_MS`. Which of these the reproduction reaches decides slice 4. |
| Local worker count | **Preserve** Playwright's local default (half the cores) unless slice 3 shows the storm of simultaneous server, browser, and `gh` starts is the lever. CI uses every core (`availableParallelism()`), which stays. |

## Current decisions

- One directory per run, `dashboard/test-results/<start time>/`, holds
  Playwright's retained files and the reporter's `report.txt`. The stamp is
  filesystem safe (`2026-10-08T13-05-22.123Z`). Nothing else chooses a
  different place: CI's upload path and `.gitignore` already cover it.
- The reporter's final line on a shown run is
  `Kept: dashboard/test-results/<stamp>` (shown relative to the working
  directory as its other paths are), after everything it printed.
- The private build directory comes from `mkdtemp` under `os.tmpdir()` with
  the prefix `dough-dashboard-build-`; its path travels as
  `OPEN_DOUGH_DASHBOARD_BUILD`. When that variable is unset, as for a preview
  server started outside a suite run, `builtDashboardDir` stays
  `dashboard/dist` so existing standalone use keeps working.
- Induced load means `yes > /dev/null` burners, one per core, started by the
  repeat script before the run and stopped after it, with the one-minute
  load average recorded before and after. It is the story's loaded
  condition. It did not by itself reproduce the failures (observations
  below); it stays the acceptance condition, not the suspected cause.
- Slice 4 changes only what slice 3 reaches. A finding outside the suite's
  waits, shared outputs, or worker selection is recorded as a bug report
  through the project's bug path, not fixed here.
- A freshly prepared checkout, for the story's first-run condition, is a
  new Git worktree of the revision under test with its own `npm ci` and no
  suite run yet. The repeat script's `--fresh` makes one under the OS
  temporary directory, runs the first repetition there, reports it like any
  other, and removes the worktree afterwards; later repetitions of the same
  invocation run in the invoking checkout. The script unsets `NODE_ENV` and
  `npm_config_local_prefix` for its `npm ci` and suite runs, because a
  session the dashboard launched carries both and `npm ci` then installs no
  dev dependencies, into another prefix.

## Decisive premises and observations

| Premise | Consumed by | Observation | Result |
| --- | --- | --- | --- |
| A rerun removes the previous run's retained files | Slice 1's per-run directory | `node_modules/playwright/lib/runner/index.js` lines 6321–6326 and 6398–6415: `createGlobalSetupTasks` lists `createRemoveOutputDirsTask()` first, which `removeFolders` each project's `outputDir`. In this session, a later group run emptied `dashboard/test-results` of the first run's two failure traces before they were read. | Confirmed; the same loss as DD-224. |
| The reporter prints to the console only and knows nothing of the output directory | Slice 1 adds the written copy | `dashboard/tests/support/quietReporter.ts`: `print` writes `this.writeOut` only; `onBegin` is not implemented, so `config.rootDir` and `outputDir` are not yet read. | Confirmed. |
| `quiet-reporter.spec.ts` runs Playwright on a temporary config with substitute specs, and can observe the output directory | Slice 1's proof | `dashboard/tests/quiet-reporter.spec.ts` `runSubstitute` writes `playwright.config.mjs` with its own `outputDir` and `reporter: [[reporter]]`, spawns `node_modules/.bin/playwright test`, and returns stdout, stderr, status, and `outputDir`; `retainedTraces` lists `trace.zip` under it. Substitutes: `passing`, `failing`, `printing`, `hanging`, `printingSetup`. | Confirmed; the stamped directory and `report.txt` are provable there with no real journey. |
| Global setup builds into one shared directory that every preview server serves | Slice 2 | `globalSetup.ts` calls `buildDashboardTo(builtDashboardDir)`; `builtDashboardDir` is `path.join(repoRoot, "dashboard", "dist")`; `grep -rn builtDashboardDir dashboard/tests` lists about seventy `prebuilt: builtDashboardDir` sites. | Confirmed; DD-226's collision. |
| Workers see environment set in global setup | Slice 2 hands the build path over | `runner/index.js` line 1915: workers are forked with `env: { ...process.env, ...this._extraEnv }`, after the global setup tasks ran in the runner process. | Confirmed. |
| A private build is cheap | Slice 2's sizing | `npm run build:dashboard -- --outDir <tmp>` in this workspace. | 1.2 s, 80 MB, of which `agent-avatars` is 79 MB. |
| The recorded failures reproduce at default workers in unchanged code | Slice 3's shape | A 14-spec group from plan 276's proof (58 tests: `recently-done-*`, `authenticated-read-done-catalog*`, `authenticated-read-revision-reuse*`, `published-facts-failures`), `npm run test:dashboard -- <group>` at the default 8 workers on this 16-core machine. | 2026-10-08: six runs without induced load (one-minute load 3.8–19) — the first run failed 2 of 58 (both in `recently-done-progressive-loading.spec.ts`: `toHaveAccessibleName` timed out at 5000 ms while the first entry was still `aria-busy`, 18 s run), the next five passed in 15–17 s; that spec alone passed in 7 s. One run under 16 `yes` burners (load 19→32) passed in 22 s. One run with an empty Playwright transform cache (`PWTEST_CACHE_DIR`) passed. | Reproduced once in eight group runs. CPU load alone is not the trigger; the failing wait was a 5 s plain `expect` bound while the server's record reads were still under way. |
| The record reads are a process storm | Slice 3's instrumentation | `dashboard/tests/fixtures/fake-gh` is a Node script, one process per `gh` call; `dashboard/server/readAdmission.ts` admits `readsUnderWayLimit = 8` reads per server; each worker runs its own Vite preview, fake GitHub, and Chromium. | 8 workers × up to 8 Node `gh` processes plus 24 long-lived processes start together at the head of a run. |
| A full run at default workers | Slice 3's sizing | `npm run test:dashboard` once in this workspace, timed. | 2026-10-08, 8 workers, one-minute load 7 at start rising to 24 from the suite itself: 536 s, 941 of 951 tests passed; the 10 failures were every `production-*.spec.ts` test, each `Recursive option not enabled, cannot copy a directory: …/node_modules/`, because those specs copy the workspace's `node_modules`, which was a symbolic link only in this session. No timing failure. A full run is about nine minutes here. |
| CPU load alone reaches the 20 s Vite address bound | Slice 3's candidates; story example 5 | 2026-10-09 refinement: eight `vite preview` starts at once on the built assets, three rounds unloaded and three under 16 `yes` burners (load 23–29). | Not reached: every start reported its address within 0.5 s unloaded and 0.75 s loaded. DD-257's 20 s silence has another cause; slice 3 keeps it as an unexplained kind. |
| The first group run of a session is the trigger | Slice 3's shape | 2026-10-09 refinement, same group at 8 workers in this workspace with its own fresh `npm ci`: 13 runs (10 without load, 3 under the burners at load 26–37) and 3 with an empty `PWTEST_CACHE_DIR`. | The first run failed 3 (all `toHaveAccessibleName` at the 5 s bound; two entries still `aria-busy`, one entry already read where the test expected it unread after a sibling's failed read), the other 15 passed. With the plan's session that is 2 failing first runs in 21 group runs, so slice 3 starts each repetition series from a freshly prepared checkout as well as repeating in one. The kept failure is in the refinement job's temporary directory only; slice 3 reproduces it. |
| A fresh worktree with its own `npm ci` runs the suite from this repository | Slice 3's `--fresh` and slice 4's first-run proof | 2026-10-09 refinement in this workspace, which had no `node_modules`: `npm ci` under the session's `NODE_ENV=production` and `npm_config_local_prefix` reported "up to date" and installed nothing here; `env -u NODE_ENV -u npm_config_local_prefix npm ci` added 162 packages in 0.8 s from the warm npm cache, and `npm run test:dashboard -- <group>` then ran (the failing first run above). Playwright's Chromium comes from the user cache, not the checkout. | Confirmed, with the two variables to unset. A fresh worktree costs seconds, so the first-run condition is cheap to repeat. |
| CI's bound | Slice 4's constraint | `.github/workflows/ci.yml`: nine shards, 6-minute jobs, `OPEN_DOUGH_DASHBOARD_DEADLINE_MS` 320 s after job start; `playwright.config.ts` turns it into `globalTimeout`. | A fix that lengthens the suite must stay inside it; CI on the published revision is the observation. |

## Outside-in proof ownership

| Promise (story example) | Owning slice | Proof |
| --- | --- | --- |
| Failure evidence outlives a rerun (3) | 1 | `quiet-reporter.spec.ts`: a failing substitute run leaves `report.txt` in its output directory holding the printed failure, names that directory last; a passing run leaves no directory. Then two real runs of `quiet-reporter.spec.ts` with a deliberate failure in the first: its stamped directory is still there after the second. |
| Two runs from one checkout (4) | 2 | `tests/dashboard-concurrent-runs.sh`: two `npm run test:dashboard -- project-configuration-boundary.spec.ts` started together both exit 0 and print nothing, and `dashboard/dist` is untouched by either. |
| Reproduce the recorded failure kinds (scope) | 3 | The repeat script's report over N full runs: failing locations, their waits and bounds, and kept directories. |
| Loaded machine, unchanged code (1); Vite start slower than its wait (5) | 4 | Three consecutive full runs at default workers pass with no output, one under the burners and one the first run in a fresh worktree, through the repeat script; CI green on the published revision. |
| A real failure under load is still a real failure (2) | 4 | One loaded run with one assertion deliberately broken fails that test only, naming it. |
| Boundary: load far beyond the bound (6) | 1 and 4 | A run that fails names its wait and keeps its evidence; `retries` stays 0 in the config. |
| Documentation (scope) | 5 | The tests guide names the kept location, the private build, the repeat script, and that the result does not depend on local load. |

## Ordered slices

### 1. A failed run's report and retained files survive a rerun
Type: Behavior
Status: done
Accepted proof: `npm run test:dashboard -- quiet-reporter` passes (6 tests);
`quiet-reporter.spec.ts` "a passing run prints nothing and succeeds" asserts
no output directory remains, and "a failed run keeps what it printed in its
output directory and names that directory last" asserts `report.txt` holds the
printed failure and stdout ends `Kept: <outputDir>`. By hand: a failing run
kept `dashboard/test-results/<stamp>/` with `report.txt`, `trace.zip`, and
`error-context.md`; the next passing run left it in place. Learnings: the
runner sets `OPEN_DOUGH_DASHBOARD_RUN_STAMP` where `TEST_WORKER_INDEX` is
unset and workers reuse it; Playwright writes `.last-run.json` during `onEnd`,
before `onExit`, so a passing run's directory is removed outright (no
`passed` marker); a global-setup failure still reaches the reporter's
`onBegin(config)` from `onEnd`, so it keeps its report too.
Proof: `quiet-reporter.spec.ts` gains: a failing run writes `report.txt` in its
output directory with the same text it printed and prints
`Kept: <directory>` last; a passing run prints nothing and leaves no output
directory. Observed by hand once: `npm run test:dashboard -- quiet-reporter`
with `failing.proof.ts` temporarily selected, then again unchanged; the first
run's stamped directory and `report.txt` remain.

Behavior: A dashboard run fails one test → the failure, its output, and its
retained files are printed as today, written to
`dashboard/test-results/<stamp>/report.txt`, and that directory is named
last → a later run from the same checkout removes only its own stamped
directory. Config: `outputDir` becomes the stamped path, computed once at
config load. Reporter: capture everything printed, write it at `onEnd`,
remove the run's own directory at `onExit` when nothing was shown (or keep
it with a `passed` marker if `.last-run.json` arrives later; record which).
CI keeps its HTML report folder unchanged.

### 2. Two runs from one checkout each build and serve their own assets
Type: Behavior
Status: done
Accepted proof: `npm test -- tests/dashboard-concurrent-runs.sh` passes in
about 2 s (two concurrent runs silent, exit 0, `dashboard/dist` state
unchanged, no `dough-dashboard-build-*` left in its `TMPDIR`); the same check
fails on the previous global setup. `npm run test:dashboard --
project-configuration-boundary.spec.ts agent-launch-environment.spec.ts` and
`-- quiet-reporter` pass. CI's dashboard shards have no `dashboard/dist`, so
every page journey there observes workers serving the private build.
Learnings: the teardown is global setup's returned function, not a separate
`globalTeardown` file, so it removes exactly the directory setup made; a
failed build removes it before rethrowing. The `dashboard/dist` fallback is
only evaluated in the runner process, which imports `dashboardServer.ts`
before setup and serves nothing; no standalone preview imports it.
Proof: New `tests/dashboard-concurrent-runs.sh` starts two
`npm run test:dashboard -- project-configuration-boundary.spec.ts` at once
and requires both to exit 0 with no output while `dashboard/dist` keeps its
prior modification time. Focused: `npm run test:dashboard -- project-configuration-boundary.spec.ts agent-launch-environment.spec.ts`
(one `prebuilt` consumer, one `mode`-switching consumer).

Behavior: Two suite runs start from the same checkout → each global setup
builds into its own `mkdtemp` directory and exports
`OPEN_DOUGH_DASHBOARD_BUILD`; `builtDashboardDir` becomes a function of that
variable with `dashboard/dist` as the unset fallback; a new `globalTeardown`
removes the directory → neither run rebuilds under the other. Update
`dashboard/tests/README.md`'s "builds only into `dashboard/dist`" sentence.
The seventy `prebuilt: builtDashboardDir` sites change only in form if
`builtDashboardDir` becomes a call; prefer keeping it a value resolved at
import time in each worker, which reads the variable workers already carry.

### 3. The recorded failure kinds are reproduced and explained
Type: Behavior
Status: planned
Proof: `scripts/dashboard-repeat.sh <repetitions> [--load] [--fresh] [spec…]`
runs the suite that many times, under burners with `--load`, the first
repetition in a fresh worktree with `--fresh`, and prints per run: exit,
seconds, one-minute load before and after, failing locations from the quiet
reporter's `FAIL:` lines, and the kept directory. Its own check,
`tests/dashboard-repeat.sh`, proves the report format and the fresh-worktree
setup and removal on a substitute command without starting Playwright. The
slice's result is a learning in this plan: over at least five full runs
without `--load`, three with it, and three `--fresh` series, which locations
failed, which wait and bound each reached, and the timing evidence from the
kept directories (trace timelines, server output).

Behavior: A developer runs the script → each run's result is kept as slice 1
provides, and the report names every failure → the plan records the causes
reached. Expected candidates, from the observations: the 5 s plain `expect`
bound while a server's `gh` reads are under way at the head of a run; a
read order the test assumes within a batch that contention changes (the
entry read before its sibling's failed read); the 20 s Vite address bound,
which CPU load alone does not reach; the shortened `DOUGH_START_TIMEOUT_MS`
waits. Start at least one series from a freshly prepared checkout, since
both recorded reproductions were a session's first group run. If
five unloaded and three loaded full runs all pass, record that, and slice 4
changes only the bounds the kept evidence from this session's one failure
already implicates (the 5 s bound on record-dependent entries).

### 4. The suite's own causes are fixed and the loaded run passes
Type: Behavior
Status: planned
Proof: `scripts/dashboard-repeat.sh 1 --fresh`, then
`scripts/dashboard-repeat.sh 1`, then `scripts/dashboard-repeat.sh 1 --load`
each pass with no output, as three consecutive full runs; one loaded run
with one assertion deliberately broken fails only that test; CI's nine shards
pass on the published revision inside their deadline.

Behavior: The suite runs at default workers while the machine runs other
work → every wait slice 3 implicated ends on its observable event or the real
failure signal within a bound derived from one stated place (the config's
`expect.timeout` and `timeout`, or the test's own timeout for Vite's address
wait, in place of scattered constants) → the run's result matches CI. Keep
`retries: 0`. Do not lower CI's worker count. If slice 3 implicates more
than one independent cause, or a product defect, stop and replan under the
story's exclusions before changing more than the waits.

### 5. The tests guide records the kept location and the loaded-run expectation
Type: Behavior
Status: planned
Proof: `tests/README.md` and `dashboard/tests/README.md` name
`dashboard/test-results/<stamp>/report.txt`, the private build, the repeat
script, and that a dashboard failure in unchanged code is a defect to fix,
not to rerun; `tests/native-setup.md`'s repeated-checks paragraph no longer
says every run rebuilds `dashboard/dist`. `node scripts/lint.mjs` passes.

Behavior: A developer reads the tests guide → finds where a failed run's
evidence is, how to repeat a run under load, and the result expectation.

## Verification and sizing

- Slices 1 and 2 are small and independent; each is one proof loop under an
  hour. Slice 1's focused check is `npm run test:dashboard -- quiet-reporter`
  (about 30 s). Slice 2's is the new shell check plus the two named specs.
- Slice 3 is the probe: its wall time is dominated by the full runs (about
  nine minutes each on this machine, so eleven runs are close to two hours;
  a fresh worktree adds seconds) and it changes no product or suite
  behavior. Run the repetitions in the background with a log, per the
  project's long-run practice. The group runs of the refinement (20 s each)
  are the cheap first series before any full run.
- Slice 4's size is unknown until slice 3 reports; it is bounded by the
  replanning rule in its Behavior.
- Lint (`node scripts/lint.mjs`) at each commit, as the repository's hooks
  require. The whole shell suite is not a local gate for these slices; CI
  runs it on publication. The new shell checks count toward CI's time budget
  (`tests/time-budget`: 71 s per job, 470 s per split), so keep
  `tests/dashboard-concurrent-runs.sh` under about 40 s on CI.
- The `node_modules` link made for this session's observations is removed
  before the result is kept; execution links or installs its own.

## Preparation review

Refinement of the written plan was not needed on 2026-10-08: each slice owns
one proof loop, the probe precedes the dependent fix, and no slice prepares
beyond the next Behavior. On 2026-10-09 the plan was refined in place for the
story's added first-run condition: slice 3 gains the fresh-worktree series
and slice 4 the fresh first run, with the setup premise observed above. No
slice-specific concern remains. The one decisive premise no session could
settle cheaply, which waits the recorded failures reach, is bounded by the
early probe in slice 3 (two failing first runs in 21 group runs; a full run
passed; no reproduction under burners or a cold transform cache; Vite start
under a second under load), and slice 4's replanning rule stops it from
growing past the story's waits, shared outputs, and worker selection.
Assessed ready on that basis.
