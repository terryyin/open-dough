---
id: SEED-093
status: active
planted: 2026-10-03
planted_during: Maintainer request to group project retrospective findings and queue the two highest priorities
trigger_when: A change proved locally fails CI for a reason the local proof could not show
scope: unknown
---

# SEED-093: Local checks agree with CI

## Why This Matters

Executing agents and maintainers publish Open Dough work on the strength of
this repository's local checks. The
[project findings](../../ProjectFindings.md#priority-assessment) show those
checks repeatedly disagreeing with CI: tests that race under CI's load, and
checks whose result depends on the directory they start in. Each failed CI run
pauses the slices in progress for a stash, diagnosis, repair, and publication
cycle, and each false local failure costs a diagnosis and a rerun.

## Stories

<a id="expose-timing-races-locally"></a>

### Keep the dashboard tests' recurring race shapes out by construction

**Identity:** SEED-093#expose-timing-races-locally
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/233-dashboard-test-race-shapes/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"1d01fe8c3da3f9b53409ff3efddb803e5c156c30dfa9f5ce74a6448153721416","plan":"e4650150ed9be59171dc6734cc19b04ccfd0ce7d88c8b30ad0874a0c705b880e"}}
```

**For / why:** The agent or maintainer publishing a change needs the dashboard
suite to give CI's verdict on the first run. Races keep arriving one CI failure
at a time, and each one pauses the slices in progress for a diagnosis and a
repair.

**Goal:** The dashboard browser tests stop producing the race shapes that
keep failing CI, because shared test support settles the page, drains its
reads, and orders fault setups for every spec. Individual specs no longer
repair these shapes one at a time.

**Findings:**
[tests whose verdict depends on timing or machine load](../../ProjectFindings.md#tests-whose-verdict-depends-on-timing-or-machine-load-first-priority-queued)
(DD-186, DD-195, DD-199).

**Field evidence (refinement, 2026-10-03):**

- Every race named by the findings and CI history is already repaired, and
  no named spec failed on a revision containing its repair (126 failed runs
  surveyed). The `read-failure.spec.ts` and `agent-launch-start-taken.spec.ts`
  CI failures came from their own branches, not races.
- Races still keep arriving. About 20 test-only race repairs landed between
  2026-09-28 and 2026-10-03. Most take three shapes:
  - Acting or measuring before the page settles: `6a8d3608`, `656de358`,
    `1af1db40`, `79ae5949`, `0d103b4a`, `076ed50a`, `dc402362`.
  - Disposing the context while intercepted reads are still in flight:
    `180b34aa`, `0e88f016`.
  - Injecting a fault before observing the event it depends on: `3fdae6f2`,
    `02cd7e86`.
- A generic slow-path run does not separate races from slowness:
  - Chromium CPU throttling ×4 at 16 workers failed the repaired
    `startup-host-words.spec.ts` in 16 of 20 runs on plain deadlines.
  - Random 0–1500 ms delays on local fetches neither raised nor lowered the
    reverted race's rate of about 1 in 60.

**Scope:**

- **Teardown drain:** the shared dashboard test fixture finishes the page's
  intercepted reads before the context is disposed, for every spec. The
  per-spec copies in `startup-host-words.spec.ts` (two, from a merge) and
  `project-remove.spec.ts` go.
- **Settled page:** the shared page helpers that open or reload the dashboard
  return only once the stages show their cards and the cards' preparation
  facts are read. Specs that hand-roll that wait use the shared one instead.
- **Fault after event:** a fault setup observes the event it depends on (for
  example accepted input) before injecting the fault. Sweep the dashboard
  specs for setups that use a deadline in place of that event, and convert
  them.
- **Repair method:** repairs wait for events. They do not lengthen deadlines,
  add sleeps, or add retries, because a retry or a longer wait hides the race
  instead of removing it (`retries: 0` stays).

**Key examples:**

- A spec intercepts a background read with `page.route` and has no teardown
  drain of its own. Its last assertion passes while the read is in flight →
  the test ends → the shared fixture finishes the read before disposal, and
  the run passes without "Response has been disposed".
- A spec reloads the stages and immediately measures a card's position or
  facts → the shared helper returned only after cards and preparation facts
  arrived → the measurement matches the settled page (no 507.8 versus 586.7
  shift, no "Reading preparation…").
- A recovery spec disconnects a native substitute after a short launch
  deadline → the converted setup first observes the substitute's accepted
  input, then disconnects → absent history can no longer pass as equal
  records.

**Deferred:**

- A local slow-path or jitter detector. The refinement probes above found
  neither one discriminating.
- A pre-publication repeat run of changed specs.
- The cause of the single local `agent-launch-start-taken.spec.ts:53` "server
  could not be reached" failure. It has not recurred in CI and is left to
  recur through DD-195.
- Node test races.

**Boundary:** This repository's dashboard tests and test support only.
Published skill guidance about proof selection stays with its DearDough
findings.

<a id="checks-run-from-any-directory"></a>

### Run a check from any directory and get CI's result

**Identity:** SEED-093#checks-run-from-any-directory
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/234-checks-run-from-any-directory/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"7e68cf3b136a22226eb8afe483d4ff9e62511a9aa8c3899bad483ccfc4e3ead5","plan":"d808a744b99d20e4f8621a7cd44d5ca0c1ca3473a2c21de1c2e4ab2527047364"}}
```


**For / why:** The agent running a focused check from a plan or a delegation
needs the same verdict CI gives, whichever directory the command starts in,
so a false failure does not cost a diagnosis and a rerun.

**Goal:** This repository's Node tests and dashboard Playwright suite find the
repository root from their own location. A focused run started in any
directory then passes or fails as it does from the repository root, and its
build output lands in the usual place. Plans can copy a proof command from an
earlier plan without first checking which directory it needs.

**Findings:**
[checks whose result depends on where or how they are run](../../ProjectFindings.md#checks-whose-result-depends-on-where-or-how-they-are-run-second-priority-queued)
(DD-168, DD-178, DD-194).

**Observed at refinement (2026-10-03, `f09795ed`):**

- All 206 Node test files run directly with `node --test` from an unrelated
  directory: only `src/skills/dough-execute-plan/scripts/ci-mailbox-complete.test.mjs`
  failed, in its two cases that build the mailbox with `root: process.cwd()`
  (`ci-mailbox-complete-unresolved-cases.mjs`,
  `ci-mailbox-complete-exit-cases.mjs`): "CI mailbox belongs to another
  checkout". `scripts/test.sh` started in `src/skills` passes them, because it
  moves to the root itself.
- `npm run test:dashboard` started in `dashboard/tests` passes, because npm
  runs it at the root. `npx playwright test` started in `dashboard/` fails a
  spec that reaches the skill sources ("ENOENT … lstat
  'src/skills/dough-execute-plan'"), and even a passing spec leaves a
  production build in `dashboard/dashboard/dist`, because global setup builds
  into the working directory's `dashboard/dist`.
- Dashboard test support takes the root from `process.cwd()` in about ten
  places: `support/dashboardServer.ts` (root, Vite binary, built app),
  `support/fixtureExecutable.ts`, `support/publishedMainFixture.ts`,
  `admittedWork.ts`, `storyDependencyFixture.ts`, `storyReadinessCli.ts`,
  `quiet-reporter.spec.ts`, and `production-deployment.spec.ts`. Their
  comments say Playwright loads helpers as CommonJS, so `import.meta.url` is
  unavailable there; the configuration itself uses `import.meta.url`.
- All 70 shell checks already find the root from their own location.

**Scope:**

- Each affected suite finds the repository root from its files' location,
  through one shared owner per suite rather than a copy per helper: the
  dashboard test support (every place listed above) and the CI-mailbox
  completion cases.
- The dashboard suite's production build and preview servers use the
  repository's `dashboard/dist` (or the test's own build directory) wherever
  the run starts, so no run leaves a build anywhere else.
- A lint check fails when a test file or its support takes the repository root
  from `process.cwd()`, naming the file. Uses of the working directory that
  are not the root stay allowed, such as a fake executable recording the
  directory it was started in or a reporter showing paths relative to it.
- Keep the entry points that already work: `scripts/test.sh` and
  `npm run test:dashboard` from any directory, and the root-relative commands
  in existing plans.

**Key examples:**

- From `src/skills`, `node --test
  dough-execute-plan/scripts/ci-mailbox-complete.test.mjs` passes, as it does
  from the root. Today its two unresolved and exit cases fail with "CI mailbox
  belongs to another checkout".
- From `dashboard/`, `npx playwright test
  tests/agent-launch-preparation-phases.spec.ts` passes as
  `npm run test:dashboard -- agent-launch-preparation-phases` does from the
  root, and afterwards `dashboard/dashboard/` does not exist. Today it fails
  with ENOENT and leaves that build behind.
- From any directory, `npx playwright test --config
  <repository>/dashboard/playwright.config.ts <spec>` gives the same result
  as from the root.
- A new dashboard helper writes `const repoRoot = process.cwd();`:
  `npm run lint` fails and names that file. A fake `claude` that records
  `cwd: process.cwd()` in its calls log still passes lint.

**Deferred:** A Playwright run started outside `dashboard/` without
`--config` uses none of this repository's configuration, so it is not a run
of this suite and is not promised. DD-162 (a direct shell-check run that
bypassed the runner's Bash 5 guard) and DD-216 (a passing run prints no
count) have other causes and stay open as findings.

**Boundary:** This repository's tests, test support, and lint configuration
only.
