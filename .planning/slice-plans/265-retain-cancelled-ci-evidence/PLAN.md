# Retain actionable diagnostics when a dashboard CI shard times out

**Identity:** SEED-115#retain-cancelled-ci-evidence
**Source:** [refined story](../../seeds/SEED-115-cancelled-dashboard-ci-failures.md#retain-cancelled-ci-evidence).
**Prepared:** 2026-10-07. Planning only, in the story's preparation workspace
on `claude/retain-actionable-diagnostics-when-a-dashboard-c`.

## Goal and boundaries

When a dashboard CI shard runs out of time, the maintainer can retrieve the
diagnostics of every test that completed before the deadline, and the shard's
verdict states the deadline as its cause, while each shard job stays within its
current `timeout-minutes: 6`.

Include the story's required behavior: the browser suite ends its own run at a
deadline inside the job bound, the job then fails rather than being cancelled,
the console names the deadline, the retained HTML report shows which tests
passed, failed, or did not finish, and the shard's
`dashboard-playwright-report-<shard>` artifact is retrievable with every
completed failure's trace and error context. Include the five key examples.

Deferred: classifying or repairing the thirteen historical primary failures,
changing worker concurrency or shard balance, raising `timeout-minutes`, and
changing how the CI observer or a maintainer treats an earlier failed run. A
local run without `CI` is not held to the deadline.

## Existing solutions and current decisions

PFE searched the workflow, the shell test runner, the Playwright config, and the
browser suite's test support for owners of a deadline, a run-end report, and
retained diagnostics.

- **A deadline below the job bound.** The shell suite owns one:
  `tests/time-budget` with `scripts/test-budget.sh` fails the split job itself
  with `OVER BUDGET` lines. It judges recorded per-job times after the run, so
  it cannot stop a run that is still going; the browser suite's problem is a
  run that does not end. **Decision: gap, same shape.** The browser suite gets
  its own run-wide deadline that Playwright enforces (`globalTimeout`), so the
  step fails and the runner never cancels the job.
- **A job-relative clock.** The dashboard job already records
  `OPEN_DOUGH_SETUP_DEADLINE_MS` as an absolute epoch in its first step, and
  `scripts/setup-native.mjs` bounds acquisition against it. **Decision: reuse
  the pattern.** The same step also records `OPEN_DOUGH_DASHBOARD_DEADLINE_MS`,
  an absolute epoch at which the browser suite must have ended, and the
  Playwright config turns it into the remaining `globalTimeout` at run start.
  A fixed duration would not absorb a slow setup (63 seconds in the cancelled
  shard against 15–35 seconds normally), and the suite's clock then starts
  from the job's, not from its own.
- **Naming the deadline.** `tests/support/quietReporter.ts` already prints a
  run-level error through `onError`, and Playwright raises
  `Timed out waiting <n>s for the test suite to run` through it when
  `globalTimeout` ends the run (observed in O1 and O3). **Decision: reuse**;
  no reporter change is needed for the console to name the deadline. The HTML
  reporter already records an interrupted test as `interrupted` and unrun
  tests as `skipped` (O1).
- **Retaining diagnostics.** `use.trace: "retain-on-failure"` keeps a failed
  test's `trace.zip` and `error-context.md`, and the workflow's
  `Keep the Playwright report` step uploads `playwright-report/` and
  `test-results/` under `!cancelled()`, which runs after a failed step.
  **Decision: reuse.** The upload condition stays; no second upload step.
- **Proof entry.** `dashboard/tests/quiet-reporter.spec.ts` runs Playwright
  itself on a substitute config and specs under
  `tests/fixtures/quiet-reporter/`, asserting exit status, console text, and
  retained traces. **Decision: reuse** it for the deadline case, with a
  hanging substitute spec and the HTML reporter added to that case's config.
  `tests/support/dashboard-test-files.test.mjs` is the unit home for config
  helpers in `dashboard/tests/support/*.mjs`; the deadline-to-timeout helper
  gets its unit proof there.

Decisions that constrain the slices:

- **Numbers.** The dashboard job's first step records the suite deadline as
  its own time plus 320 seconds. Over the last six successful trunk runs the
  slowest suite step took 249 seconds and the slowest whole shard 271 seconds,
  so the slowest shard keeps about 70 seconds of headroom, and the job keeps
  at least 35 seconds after the deadline for teardown, the upload (0–2 seconds
  observed), and post-job steps before `timeout-minutes` at 360 seconds.
  Changing either number later is a reviewed edit of the workflow, as
  `tests/time-budget` is for the shell suite.
- **The deadline covers the build.** `globalTimeout` bounds global setup too
  (O4: a 4-second timeout ended the run during the build). A shard whose build
  does not finish by the deadline fails with the deadline named; that is the
  deadline path, not a new setup-failure path.
- **Local runs are unbounded.** The config applies `globalTimeout` only when
  `OPEN_DOUGH_DASHBOARD_DEADLINE_MS` is set; `npm run test:dashboard` without
  it stays as today. A deadline reached while a preview server is starting can
  leave that server's detached process group orphaned (O4), which an ephemeral
  CI runner discards; the local suite is not held to the deadline, so no local
  cleanup machinery is added.
- **One owner each.** The suite ends the run and names the deadline; the
  workflow records the clock and uploads on any non-cancelled end. No second
  reporter, no `always()` step, no retry.

Accepted [ADR 0000](../../../docs/adrs/0000-use-adrs-accepted.md) keeps this
test-infrastructure design with the dashboard tests' documentation;
[ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)'s
fast feedback and high cohesion support one suite-owned deadline beside the
shell suite's. No North Star topic governs CI timing; none is added.

## Decisive premises and observations

Observations ran in this workspace at `f0045db1` with Node v24.5.0 after
`env -u NODE_ENV npm ci --ignore-scripts --offline`, Playwright 1.63.0. O1
used a substitute config outside the suite with a copied failing substitute
and a hanging spec; O3 and O4 ran real specs through the suite's own config.
Probe files were removed afterwards.

| Premise | Consumed by | Observation and result |
| --- | --- | --- |
| A run that reaches `globalTimeout` exits non-zero with the deadline named, keeps the completed failure's trace and error context, writes the HTML report, and records the unfinished test as interrupted. | Slice 1's design and proof. | O1 (`globalTimeout: 6000`, one failing and one hanging substitute, quiet and HTML reporters): exit 1; stdout had the `FAIL:` block with `trace.zip` and `error-context.md` paths, then `ERROR outside a test: Timed out waiting 6s for the test suite to run`; `test-results/failing.proof.ts-compares-the-wrong-sum/` held both files; `playwright-report/index.html` was written and names one `interrupted` test. |
| The real suite ends promptly at its deadline through the quiet reporter. | Slice 1's design; slice 2's job-duration expectation. | O3 (six real specs, `--workers=1 --global-timeout=25000`, `CI=1`): exit 1 after 26 seconds with the two `Timed out waiting 25s` errors; `test-results/` held the two interrupted tests' directories; no process of this worktree remained. |
| `globalTimeout` also bounds global setup (the build). | The "deadline covers the build" decision. | O4 (`--global-timeout=4000`): exit 1 after 4 seconds with the deadline named; one orphaned `vite preview` group remained and was ended by hand. |
| The dashboard job's first step already records an absolute epoch deadline, and the setup script bounds against it. | The job-relative clock. | `.github/workflows/ci.yml` dashboard job, step `Start prerequisite acquisition deadline (180 seconds)` writes `OPEN_DOUGH_SETUP_DEADLINE_MS` to `GITHUB_ENV`; `scripts/setup-native.mjs:18-22` reads it. |
| The upload step is skipped only on cancellation and runs after a failed suite step. | Slice 1's reuse of the upload; slice 2's expectation. | `ci.yml`: `if: ${{ !cancelled() }}` on `Keep the Playwright report`; the cancelled shard's listing lacked only shard 1 while failing shards in earlier runs uploaded. The real end-to-end path is slice 2's probe. |
| Recent shard timings leave room for a 320-second suite deadline. | The numbers decision. | `gh api` over the last six successful `ci.yml` runs on `main` (37409584906 … 37476543739): suite step 100–249 seconds, whole shard 124–271 seconds, upload 0–2 seconds. |
| The reporter's existing proof runs Playwright on substitutes with a generated config. | Slice 1's proof entry. | `dashboard/tests/quiet-reporter.spec.ts` builds `playwright.config.mjs` in a temporary directory with `testDir` at `tests/fixtures/quiet-reporter/`, spawns `playwright test`, and asserts status, stdout, and `trace.zip` count. Spec files must live under the repository for `@playwright/test` to resolve (O1 first attempt failed outside it). |
| A build failure in global setup already fails the shard naming the build, claiming no browser evidence. | The setup-failure example. | `tests/support/globalSetup.ts` calls `buildDashboardTo`, which throws on a failed `vite build`; the `ci.yml` comment records that globalSetup fails the shard when the build fails. Unchanged by this plan. |

Literal observation commands, run from this workspace:

```sh
# O1 — substitute config in $CLAUDE_JOB_DIR/tmp/o1 with testDir under dashboard/tests/fixtures/planning-probe-o1 (removed after); exit 1
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR ./node_modules/.bin/playwright test --config /Users/terryyin/.claude/jobs/3d97347c/tmp/o1/playwright.config.mjs

# O3 — real specs past the deadline; exit 1 after 26 s, no leftover processes
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR CI=1 ./node_modules/.bin/playwright test --config dashboard/playwright.config.ts agent-launch-model.spec.ts agent-launch-ad-hoc.spec.ts agent-launch-preparation-codex-retry.spec.ts accessible-overview.spec.ts accessible-overview-keyboard.spec.ts agent-completion-attention.spec.ts --workers=1 --global-timeout=25000

# O4 — deadline during the build; exit 1 after 4 s, one orphaned preview group
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR CI=1 ./node_modules/.bin/playwright test --config dashboard/playwright.config.ts agent-launch-model.spec.ts --workers=1 --global-timeout=4000

# Shard timings — read-only
gh run list --workflow ci.yml --branch main --status success --limit 6 --json databaseId
gh api "repos/terryyin/open-dough/actions/runs/<id>/jobs?per_page=50"
```

These establish today's behavior and a usable proof route, not the remedy.

## Promise and proof ownership

| Final promise | Owning slice and observable proof |
| --- | --- |
| A shard whose suite cannot finish by the deadline ends as a failed job with the deadline named in the console. | 1: substitute run exits non-zero and prints the deadline. 2: forced CI run shows every shard failed, not cancelled, each log naming the deadline. |
| The retained report shows which tests passed, failed, or did not finish. | 1: substitute run's HTML report names the interrupted test and the failed one. |
| The shard's report artifact is retrievable and holds every completed failure's trace and error context. | 1: substitute run keeps `trace.zip` and `error-context.md` for the completed failure. 2: forced CI run lists the artifact for the shard holding the temporary failing spec, and it contains both files. |
| The suite reaches its deadline before the runner's cancellation, with room for the upload, under slow setup. | 1: config derives the remaining timeout from the job's recorded epoch (unit proof). 2: forced CI run's shards end within `timeout-minutes` with the upload step run. |
| `timeout-minutes` stays at 6. | 1: the workflow diff changes no `timeout-minutes`. |
| An assertion failure, a passing shard, and a setup failure keep their meaning. | 1: existing quiet-reporter cases stay green. 2: the unforced run after the probe passes all nine shards with their artifacts, as today. |
| Local runs are not held to the deadline. | 1: unit proof that an unset variable yields no `globalTimeout`. |

## Slices

### 1. The browser suite ends at the job's recorded deadline and keeps completed diagnostics
Type: Behavior
Status: done
Accepted proof: `env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- quiet-reporter.spec.ts`
(5 pass; the new case runs `failing.proof.ts` then `hanging.proof.ts` on one
worker with `globalTimeout: 8000` and asserts non-zero status, `Timed out
waiting` and the failure in stdout, exactly one `failing.proof.ts-*/trace.zip`
with `error-context.md`, and the HTML report's deadline error, Failed1 and
Skipped1 entries); `node --test tests/support/dashboard-test-files.test.mjs`
(6 pass, `remainingSuiteTime` in `dashboard/tests/support/suiteDeadline.mjs`);
`env -u NODE_ENV npm run typecheck:dashboard`; `npm test --
tests/ci-lint-setup.sh tests/ci-container.sh` with Bash 5 first on PATH;
`tests/native-setup.sh`'s `ci.yml` assertions checked by grep (its runtime
part needs Node 24.21.0, absent locally; CI runs it). No `timeout-minutes`
line changed.
Learnings: the HTML report lists an interrupted test under Skipped, not by
the word "interrupted"; the interrupted test also keeps a trace of its own.
Playwright workers reload the config, so a worker started after the deadline
would fail loading it; that can only follow a run already ended by
`globalTimeout`, so slice 2's log may show such an extra config error.
Proof: `dashboard/tests/quiet-reporter.spec.ts` gains "a run that reaches its deadline names it, keeps completed failures' traces, and records unfinished tests": substitute config with a small `globalTimeout` and the HTML reporter, `failing.proof.ts` plus a new `hanging.proof.ts` under `tests/fixtures/quiet-reporter/`; asserts non-zero status, `Timed out waiting` in stdout, one `trace.zip` with its `error-context.md`, and an HTML report naming the interrupted test. `tests/support/dashboard-test-files.test.mjs` (or a sibling unit file) proves the helper that turns `OPEN_DOUGH_DASHBOARD_DEADLINE_MS` into the remaining timeout: unset gives no bound, a future epoch gives its remainder, a past or invalid value fails the run naming the value. Run `env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- quiet-reporter.spec.ts` and the node unit test.

Behavior: the dashboard job records `OPEN_DOUGH_DASHBOARD_DEADLINE_MS` (its first step's time plus 320 seconds) → the suite step runs with it → `playwright.config.ts` sets `globalTimeout` to the remaining time, so a run still going at that epoch ends with exit 1, the console names the deadline, completed failures keep trace and error context, the HTML report records interrupted and unrun tests, and the existing `Keep the Playwright report` step uploads them. Without the variable the suite runs unbounded, as today.

Includes: the helper beside `testFiles.mjs` in `dashboard/tests/support/`; the config change; the workflow step renamed to record both deadlines for the dashboard job only, with the comment above the suite and upload steps saying the suite ends itself before the job bound and why; `dashboard/tests/README.md`'s CI paragraph naming the deadline variable, the 320-second allowance, and that local runs are unbounded.

### 2. Probe: the forced deadline path on CI retains the shard's evidence
Type: Behavior
Status: planned
Proof: one temporary commit on the story branch shortens the recorded allowance so the suite is interrupted mid-tests (about 75 seconds after the deadline step; raise it if the log shows the build itself interrupted) and adds a deliberately failing spec under `dashboard/tests/` so one shard completes a failure first. Observe that run with read-only `gh` queries: every dashboard shard concluded `failure`, none `cancelled`; each log has `Timed out waiting`; the shard holding the failing spec lists `dashboard-playwright-report-<shard>` and the downloaded artifact contains that test's `trace.zip` and `error-context.md`; each shard's duration is under 360 seconds and its upload step ran. Then a second commit removes the failing spec and restores the 320-second allowance, and its run passes all nine shards with their artifacts. Record both run ids and the observed durations in this plan.

Behavior: a pushed revision whose suite cannot finish by the deadline → CI runs → the maintainer retrieves the completed failure's diagnostics from the run and reads the deadline as the cause, within the job bound.

A probe result that lacks the artifact, shows a cancelled shard, or exceeds the bound stops here and changes this plan before anything is reported as delivered; the forced commit never reaches trunk in effect, since the next commit reverts its two changes.

## Considered and excluded

- An `always()` upload step: it would run only if the runner honored it after a
  hard cancellation, which the story forbids assuming; ending the suite first
  makes the question moot.
- Naming interrupted tests in the console: the reporter skips `skipped`
  outcomes, which is how Playwright reports an interrupted test to it. The
  HTML report records them, which the story asks for; the console names the
  deadline. Adding console lines for them is not needed by any example.
- A fixed `globalTimeout` under `CI`: it cannot absorb slow setup, which is the
  observed cause of the cancelled shard's overrun.
- Cleaning orphaned preview servers after a local deadline: local runs have no
  deadline.
