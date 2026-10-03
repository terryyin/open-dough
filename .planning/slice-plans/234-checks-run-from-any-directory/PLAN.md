# Run a check from any directory and get CI's result

**Identity:** SEED-093#checks-run-from-any-directory
**Source:** [refined story](../../seeds/SEED-093-local-checks-agree-with-ci.md#checks-run-from-any-directory).
**Prepared:** 2026-10-03. Planning only, in the established preparation workspace. This instruction authorizes neither implementation nor publication.

## Goal and boundaries

The agent running a focused check gets CI's verdict whichever directory the
command starts in. This repository's Node tests and dashboard Playwright suite
find the repository root from their own files' location, the dashboard build
lands in `dashboard/dist`, and a lint check keeps new test code from taking
the root from the working directory again.

Included scope is the story's scope. Material exclusions:

- A Playwright run started outside `dashboard/` without `--config` is not a
  run of this suite.
- DD-162 (direct shell runs under macOS Bash 3.2) and DD-216 (no pass count)
  stay open as findings.
- Product code keeps its own `process.cwd()` uses. CLIs such as
  `agent-commit.mjs` and `product-backlog-request.mjs` work in the directory
  they are run in by design. The lint rule applies to test code only.
- No change to `scripts/test.sh` or `npm run test:dashboard`, which already
  work from any directory.

## Direction and PFE

- **Node:** reuse `checkoutRoot` from
  `src/skills/dough-execute-plan/scripts/ci-mailbox-location.mjs`. It is
  already derived from that file's location, and `createMailbox` uses it by
  default. The failing cases pass `root: process.cwd()` to `completeRevision`
  for a mailbox that `mailboxWithUnrelatedWorker` and `mailboxWithStubWorker`
  created with the default root. They should pass `checkoutRoot`, or leave
  `root` out. `ci-mailbox-await-exception-cases.mjs` passes `process.cwd()` to
  both calls, so it agrees with itself and passes, but it takes the same
  change for the lint rule.
- **Dashboard:** one new owner, `dashboard/tests/support/repositoryRoot.ts`,
  exports the root from `import.meta.url`. Every helper and spec that now
  uses `process.cwd()` or a relative repository path imports it. Commands that
  build or run npm and git (`buildDashboardTo`, Vite launches,
  `publishedMainFixture`'s `git ls-files`) run with `cwd` set to that root.
  Delete the stale comments claiming Playwright loads helpers as CommonJS:
  specs already use `import.meta.url`, and the probe below shows helpers and
  global setup can too.
- **Guard:** a `no-restricted-syntax` rule in `eslint.config.mjs` forbids a
  `process.cwd()` call in test code, with a message that names the two root
  owners. Its scope is `dashboard/tests/**`, `tests/**`, and under
  `src/skills/*/scripts/` the `*.test.mjs`, `*-cases.mjs`, and `*fixture*.mjs`
  files. Three existing uses are not the root. Each keeps an inline disable
  that gives its reason: `dashboard/tests/support/quietReporter.ts:28` and
  `tests/support/node-test-failures-reporter.mjs:86` show paths relative to
  where the run started, and
  `tests/support/git-publication-native-one-shot-escalation-fixture.mjs:60`
  saves the directory to restore later. `process.cwd()` inside a string
  written into a fake executable is not a call and stays allowed.

Accepted ADRs: [0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
favours small, inexpensive change. Test-only changes; no ADR conflict. No North
Star topic is warranted.

## Key examples and proof

| Promise (story example) | Owning slice | Observable proof |
| --- | --- | --- |
| From `src/skills`, `node --test dough-execute-plan/scripts/ci-mailbox-complete.test.mjs` passes as from the root | 1 | That literal command from `src/skills`, and from an unrelated directory, exits 0. Before the change, its two cases fail with "CI mailbox belongs to another checkout" |
| `scripts/test.sh` still gives the same result | 1 | `bash scripts/test.sh src/skills/dough-execute-plan/scripts/ci-mailbox-complete.test.mjs src/skills/dough-execute-plan/scripts/ci-mailbox-await.test.mjs` from the root and from `src/skills`, exit 0 |
| From `dashboard/`, `npx playwright test tests/agent-launch-preparation-phases.spec.ts` passes, and `dashboard/dashboard/` does not exist afterwards | 2 | That literal command, then `test ! -e dashboard/dashboard` |
| From any directory, `npx playwright test --config <repository>/dashboard/playwright.config.ts` gives the root's result | 2 | The full suite run from `$TMPDIR` (outside the repository) with `--config`: the same pass count as the root baseline (976 at `f09795ed`), with no build output except `dashboard/dist` (`git status --short --ignored` shows only `dashboard/dist/`, `dashboard/test-results/`, `node_modules/`) |
| `npm run test:dashboard` keeps working | 2 | `npm run test:dashboard -- agent-launch-preparation-phases` from `dashboard/tests`, exit 0 |
| A new helper with `const repoRoot = process.cwd();` fails lint, naming the file; a fake recording `cwd: process.cwd()` in a string passes | 3 | A scratch `dashboard/tests/support/zzCwd.ts` with that line: `npm run lint` fails and names it. The existing `agent-launch-done-codex-races.spec.ts:174` string passes. Delete the scratch file. `npm run lint` is clean at the end |

## Decisive premises

Observed 2026-10-03 at `f09795ed` in this workspace, with `NODE_ENV` unset
(see Current decisions).

| Premise | Consumed by | Observation | Result |
| --- | --- | --- | --- |
| Among Node tests, only `ci-mailbox-complete.test.mjs` depends on the starting directory | Slice 1 scope | All 206 files from `tests/node-test-files` run with `node --test <absolute path>` from a directory outside the repository, 6 at a time | Only that file failed: two cases, "CI mailbox belongs to another checkout" |
| `scripts/test.sh` already gives the root's result from a subdirectory | Slice 1 (preserve) | From `src/skills`: `PATH=/opt/homebrew/bin:$PATH bash ../../scripts/test.sh dough-execute-plan/scripts/ci-mailbox-complete.test.mjs dough-execute-plan/scripts/ci-mailbox-await.test.mjs` | Exit 0 |
| `checkoutRoot` is the location-derived root and the fixtures' default | Slice 1 approach | Read `ci-mailbox-location.mjs:12` (`new URL("../../../../", import.meta.url)`) and `ci-mailbox-process-test-fixtures.mjs:147-157` (`createMailbox(…, { storage })`) | Confirmed |
| A dashboard support helper and global setup can use `import.meta.url` | Slice 2 approach (one owner) | Throwaway helper `support/zzProbeRoot.ts` imported by a spec, run from the root: `fileURLToPath(new URL("../../../", import.meta.url))` equals the root. Throwaway config whose global setup imports such a module, run from outside the repository with `--config`: wrote the root path. Both deleted | Passed |
| The root's full dashboard suite is green here (the comparison baseline) | Slice 2 proof | `node_modules/.bin/playwright test --config dashboard/playwright.config.ts --reporter=line` from the root | 976 passed, 6.2 min |
| What fails from `dashboard/` today (slice 2 inventory) | Slice 2 sizing | `../node_modules/.bin/playwright test --reporter=line` from `dashboard/`; error messages grouped | Stopped after 77 passed and 256 did not run. ENOENT linking fake executables (`support/fixtureExecutable.ts`, 649 errors); `lstat 'src/skills/dough-execute-plan'` from `support/startOrigin.ts:137` (155); `.github/workflows/ci.yml` read relatively (`production-qualification.spec.ts`); `publishedMainFixture.ts` copies an incomplete development tree (`git ls-files` in the starting directory); `quiet-reporter.spec.ts` spawns `dashboard/node_modules/.bin/playwright`; `production-watcher-refusals.spec.ts` gets npm exit 254. Also `path.resolve("dashboard/server/launchRecordStore.ts")` in `support/completionRecovery.ts` |
| A run from `dashboard/` builds into `dashboard/dashboard/dist` | Slice 2 (build location) | `npx playwright test tests/agent-launch-client.spec.ts` from `dashboard/`: 4 passed; `git status --ignored` then showed `dashboard/dashboard/` | Confirmed; `builtDashboardDir` is `process.cwd()`-relative |
| `npm run test:dashboard` already works from a subdirectory | Slice 2 (preserve) | `npm run test:dashboard -- agent-launch-preparation-phases --reporter=line` from `dashboard/tests` | 2 passed |
| ESLint lints all three test locations, and product scripts also call `process.cwd()` | Slice 3 scope | Read `eslint.ignores.mjs` (ignores only build output and `.planning/`); `git grep -ln "process.cwd()" -- 'src/skills/*/scripts/*'` lists product CLIs (`agent-commit.mjs`, `ci-command-adapter.mjs`, `watch-ci-execution.mjs`, `product-backlog-*.mjs`) | Confirmed; the rule must be scoped to test files |

## Ordered slices

### 1. The CI-mailbox completion cases give the root's result from any directory
Type: Behavior
Status: planned
Proof: Rows 1–2 of the proof table.

Behavior: an agent in `src/skills` (or anywhere) → runs
`node --test dough-execute-plan/scripts/ci-mailbox-complete.test.mjs` → it
passes as from the root. Pass `checkoutRoot` (or omit `root`) in
`ci-mailbox-complete-unresolved-cases.mjs:192`,
`ci-mailbox-complete-exit-cases.mjs:143`, and the six calls in
`ci-mailbox-await-exception-cases.mjs`.

### 2. The dashboard suite finds the repository from its own location
Type: Behavior
Status: planned
Proof: Rows 3–5 of the proof table. The foreign-directory full run is the
acceptance signal. Compare its pass count with the root baseline, and run any
spec that fails there from the root as well, to tell a directory dependency
from a race (SEED-093#expose-timing-races-locally).

Behavior: an agent in `dashboard/`, `dashboard/tests`, or outside the
repository with `--config` → runs dashboard specs → they pass or fail as from
the root, and the only build output is `dashboard/dist`.

Includes adding `support/repositoryRoot.ts` and repointing every site from
the inventory, plus anything else the foreign-directory run reveals:
`dashboardServer.ts` (root, Vite binary, `builtDashboardDir`, build and launch
`cwd`), `fixtureExecutable.ts`, `publishedMainFixture.ts`, `startOrigin.ts`,
`completionRecovery.ts`, `admittedWork.ts`, `storyDependencyFixture.ts`,
`storyReadinessCli.ts`, `quiet-reporter.spec.ts`,
`production-deployment.spec.ts`, `production-qualification.spec.ts` (read
`path.join(repoRoot, ciWorkflowPath)`; the product constant stays
repository-relative because it also names the path inside published trees), and `agent-launch-done-codex-races.spec.ts:164`. Remove
the stale CommonJS comments.

Split point: if the residue after the inventory sites grows beyond a handful
of further sites, finish the inventory sites green from `dashboard/` first,
then take the residue found by the foreign-directory run separately.

### 3. Lint keeps test code from taking the root from the working directory
Type: Behavior
Status: planned
Proof: Row 6 of the proof table.

Behavior: a contributor writes `process.cwd()` as a root in test code → runs
`npm run lint` (or the pre-commit hook) → lint fails, naming the file and
pointing to `repositoryRoot.ts` or `checkoutRoot`. The three annotated
non-root uses and string-embedded `process.cwd()` pass.

This comes last because the rule fails until slices 1 and 2 remove the
existing uses.

## Current decisions

- **Clean environment for local commands.** This session inherits
  `NODE_ENV=production` from the dashboard process that launched it, so
  `npm ci` skips devDependencies. Install with `env -u NODE_ENV npm ci`, and
  run Playwright with `NODE_ENV`, `FORCE_COLOR`, and `NO_COLOR` unset. Plans
  230–232 record the same workaround.
- **Local gates.** The pre-commit hook runs `npm run lint -- --staged`. Run
  `npm run typecheck:dashboard` after slice 2, because it touches shared test
  support. Slice 2 runs the full dashboard suite once from outside the
  repository, because the inventory is only complete when every spec has run
  from there. Hosted CI runs the rest after publication.
- **What counts as the root.** A path into this repository is built from
  `repositoryRoot.ts` (dashboard) or `checkoutRoot` (CI-mailbox cases). A
  temporary fixture project's own directory is not the repository root and
  is unaffected.
- **Limitation of the guard.** The lint rule catches `process.cwd()`, not a
  relative literal path such as `path.join("src", "skills")`. Slice 2's
  foreign-directory run removes today's cases. Catching that form in future
  would need a different check and is not promised.

## Learnings

None yet.
