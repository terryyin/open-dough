# Production dashboard continuous delivery

**Identity:** SEED-086#dashboard-continuous-delivery
**Source:** [refined story](../../seeds/SEED-086-dashboard-continuous-delivery.md#dashboard-continuous-delivery).
**Prepared:** 2026-10-03. Planning only; reuse the established preparation workspace and assignment.

## Goal and scope

The production watcher builds and serves pinned origin/main revisions. Startup
builds current main; later checks qualify the complete change range from the
last successfully served commit using the selected revision's CI push
exclusions. Qualifying updates replace production at the same URL. Skips and
recoverable failures retain the successful baseline. Existing isolation,
restoration, process ownership, and machine-record continuity remain intact.

Remove the dashboard's obsolete tag-delivery implementation, tests, fixture
machinery, comments, names, and documentation. Delete obsolete passages and
describe main-based delivery affirmatively. Cleanup belongs to the slice that
changes the behavior, with a final reference review in the filtering slice.

Use the story's immediate-delivery assumption: a successful local build gates
activation. Deferred: hosted CI result gating, configurable branches, durable
deployment history, history-rewrite recovery, a persistent deployment service,
and new project/session stores. Main follows ordinary integration history.

## Direction and PFE

- Change the existing `scripts/watch-dashboard.mjs` owner and
  `dashboard/server/productionReleaseRunner.mjs` staging/preview operations.
  Preserve their temporary checkout, exact-commit verification, locked install,
  real build, strict production port, restoration, and owned-process cleanup.
  Use commit identities consistently through selection, activation, and logs.
  Rename dashboard-only tag-era runner/process/fixture representations and
  repair callers and links as part of that same migration.
- Reuse `dashboardCommand.ts`, `processGroup.ts`, and the disposable bare-origin
  fixture for public-command proof. Its current `commit` always edits `VERSION`,
  `fixture-marker`, and (in full-source mode) `dashboard/index.html`; replace
  that hidden publication behavior with explicit path changes before proving
  exclusions. Build/preview fault scripts remain real process fault gates.
- Reuse `readCiPathIgnorePolicy` in
  `src/skills/dough-execute-plan/scripts/ci-workflow-path-policy.mjs` for the
  workflow grammar. It reads the current literal `<prefix>/**` lists and
  detects unsupported policy. Expose the existing prefix-matching rule from a
  shared pure policy home and use it from the CI coverage classifier and the
  dashboard qualification operation. This narrowly necessary cross-subsystem
  change keeps one meaning for ignored paths; preserve CI coverage verdicts.
  Both files are already declared in `install.sh`.
- Keep dashboard qualification separate from
  `classifyRevisionApplicability`: that classifier answers whether CI coverage
  can be reused, with mixed changes/deletions/renames sometimes indeterminate.
  Dashboard delivery qualifies when any changed path is non-excluded. Use a
  NUL-safe Git comparison that includes deleted paths and both rename endpoints,
  with sufficient objects for the successful baseline and selected commit.
  Repository inspection stays in owned temporary storage; local development
  edits and its refs are not delivery inputs.
- Read policy from the selected commit before deciding whether to install and
  build. An unreadable or unsupported policy reports a recovery error and
  retains the running build, as required by the story's policy-error behavior.
  Extend shared policy support only for a concrete required workflow form;
  maintain no second exclusion list or approximate matcher.
- Accepted [ADR 0003 — Release lifecycle and versioning](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
  and [ADR 0004 — Client installation and update](../../../docs/adrs/0004-client-installation-and-update-accepted.md)
  govern guidance release/installation. Preserve their release resolver and
  VERSION contract while deleting dashboard-only uses. No conflict was found.
  The [North Star](../../NORTH-STAR.md), "One backlog interpretation, separate
  observation and presentation", keeps credentials/processes at the existing
  local boundary. This delivery change preserves it and requires no new topic.

## Decisive premises and observations

Observed at preparation base `d4cebfb45d19caedfeba3cf8e872df32198d527f` plus this
session's seed refinement. Commands ran from the preparation workspace.

| Premise | Consumed by | Observation and result |
| --- | --- | --- |
| The public npm watcher reaches the current runner and real staged build/preview | Slice 2 | Read `package.json`, `scripts/watch-dashboard.mjs`, the runner, `dashboardCommand.ts`, and the four `production*.spec.ts` files; ran the command below. All 10 tests passed in 51.2 seconds, including real source markers over browser/HTTP. |
| Existing faults exercise build retention, startup restoration, retry, origin failure and shutdown | Slice 2 | The same run passed `production-watcher-failures.spec.ts`: published fault-gated source runs actual build/preview, clearing machine-local causes allows retry, PID/HTTP checks observe replacement/restoration, and SIGHUP ends checks and owned processes. Double restoration failure and unexpected preview exit still need slice 2 proof. |
| Replacement reads the same physical machine record store | Slice 2 | The same run passed `production-watcher-updates.spec.ts`: the test writes an actual launch record under its HOME, both dev/production HTTP boundaries read it before/after replacement, and file bytes survive shutdown. This proves same-store continuity. |
| Current publication helper cannot express excluded-only changes | Slices 1, 3 | Read `dashboard/tests/support/dashboardReleaseFixture.ts`: `commit(version, marker)` unconditionally writes VERSION and a marker before `git add .` and pushing main. Slice 1 removes that premise from later proof setup. |
| The existing policy reader accepts this workflow, while coverage classification differs from deployment qualification | Slice 3 | Read both CI modules and ran the three Node test files below: 21 tests passed, including actual workflow parsing and mixed/deletion/rename cases returning indeterminate. |
| All current consumers of the runner/fixture and changed shared classifier are located | Slices 1–3 | `rg -n 'productionReleaseRunner|dashboardReleaseFixture|dashboardReleaseProcess|watch-dashboard.mjs' --hidden --glob '!.git/**' --glob '!node_modules/**' --glob '!package-lock.json' .` found the watcher, four production specs, their fixture/process modules, and seed links. `rg -n 'ci-workflow-path-policy|ci-path-applicability' src/skills/dough-execute-plan/scripts/*test* tests/*.sh` found the classifier/policy and revision-coverage specs; include coverage consumers in slice 3's regression checks. |

Literal baseline commands:

```sh
PATH=/tmp/open-dough-release-node-0.3.55/node-v24.21.0-darwin-arm64/bin:$PATH NODE_ENV=development node scripts/setup-native.mjs npm
PATH=/tmp/open-dough-release-node-0.3.55/node-v24.21.0-darwin-arm64/bin:$PATH NODE_ENV=development node scripts/setup-native.mjs check
PATH=/tmp/open-dough-release-node-0.3.55/node-v24.21.0-darwin-arm64/bin:$PATH NODE_ENV=development npm run test:dashboard -- dashboard/tests/production-release-runner.spec.ts dashboard/tests/production-watcher.spec.ts dashboard/tests/production-watcher-updates.spec.ts dashboard/tests/production-watcher-failures.spec.ts --reporter=line --workers=2
node --test src/skills/dough-execute-plan/scripts/ci-workflow-path-policy.test.mjs src/skills/dough-execute-plan/scripts/ci-path-applicability.test.mjs src/skills/dough-execute-plan/scripts/ci-path-applicability-indeterminate.test.mjs
```

Native setup used selected Node 24.21.0 and validated Chromium
153.0.8010.12. The pure Node baseline used host Node 24.5.0; execution's checks
use the selected Node. These observations establish existing journeys, not the
new main-selection or exclusion behavior that the slices must prove.

## Ordered slices

### 1. Disposable origins publish exactly the requested paths
Type: Structure
Status: done
Proof: focused fixture assertions inspect the actual pushed commit's path diff and unchanged VERSION/application bytes for a documentation-only publication; the existing production specs remain green with no product behavior change.
Accepted proof: `dashboard/tests/production-publication-fixture.spec.ts` ("a documentation-only publication pushes only its requested paths to origin main") observes origin main's SHA/parent, the exact `diff --name-status -z` (M/D/A), and unchanged VERSION, package.json, index.html and runner bytes. `NODE_ENV=development npm run test:dashboard -- dashboard/tests/production*.spec.ts --reporter=line --workers=2` passed 11 tests; `npm run typecheck:dashboard` passed.

Internal change: give the current fixture explicit commit/push operations whose
path changes come from the test. Keep marker edits explicit for real browser
journeys; copy the real workflow/policy dependencies when the fixture needs
them. Copy the live working-tree files, including new names and excluding
deleted tracked paths: the current Git file enumeration otherwise passes
removed filenames directly to `cpSync` during slice 2's renames. Temporarily
retain the tag wrapper only for existing consumers until
slice 2 replaces those consumers and deletes it. Do not add a parallel fixture.

Enables: slice 2's main publications, with the same exact-path fixture later
used by slice 3's exclusion examples. Safe stopping point: existing delivery
and all current preservation assertions still work; preparation stays internal
to disposable tests.

### 2. Production follows pinned published main commits through its existing lifecycle
Type: Behavior
Status: done
Proof: revise the production runner/watcher specs at the public npm boundary, observing selected commit, real served markers, URL/PID changes, failure recovery, shared-store bytes, and cleanup. Run all affected `production*.spec.ts` together.
Accepted proof: `NODE_ENV=development npm run test:dashboard -- dashboard/tests/production*.spec.ts --reporter=line --workers=2` passed 10 tests across `production-deployment`, `production-publication-fixture`, `production-watcher`, `-updates`, `-failures` and `-refusals` specs; `npm run typecheck:dashboard` passed. The runner is now `dashboard/server/productionDeployment.mjs` (`resolvePublishedMain`, `stageDeployment`, `startDeploymentPreview`), the process module `productionProcess.mjs`, and the fixture `tests/support/publishedMainFixture.ts`. The 30-second default interval and default port 4173 remain observed only in code and docs.

Behavior: origin/main is A and local development has different uncommitted
source → watcher startup builds and serves A → publishing B replaces production
at A's URL using exactly B. Repeated checks of the same commit leave its PID
and build count unchanged. Stopping, then restarting with current main C,
builds C as a new baseline even when C's last commit edits only documentation.

Replace the dashboard tag resolver, numeric comparison, immutability checks,
and tag/VERSION validation with main commit selection and exact-commit
verification. Migrate the real fault/replacement/isolation tests to commit
identities, delete obsolete selection tests and tag-publication machinery, and
rename obsolete dashboard representations with callers and seed links aligned.
Retain existing build/install cancellation and strict-port proof. Update
`dashboard/COMMANDS.md`, `dashboard/README.md`, and relevant comments in this
slice by deleting tag-contract prose and stating the current main workflow.

Preserve the successful commit as baseline only after activation. Prove a
failed build retains A; failed candidate startup restores A at the same URL;
clearing the fault retries the same commit; failed restoration reports both
causes, exits, and cleans owned processes/checkouts. Also prove the watcher
observes an unexpectedly ended preview on its next check and cleans up. A
controlled build gate in the disposable published source lets C arrive while B
builds: B's actual served content and logs must match its selected commit, then
C is picked up later. The gate delays actual build; it supplies no result.

Interim behavior: every changed main revision qualifies. Slice 3 replaces
this with the CI exclusion rule. Safe stopping point: main delivery and
existing operational safeguards are coherent; the story remains unfinished
until filtering is delivered. Keep this migration cohesive: the runner,
watcher, caller tests and docs change together rather than shipping competing
tag/main identities.

### 3. CI exclusions govern the complete pending main change range
Type: Behavior
Status: planned
Proof: public watcher journeys use exact-path publications to observe build/activation counts, PID, served content and baseline after skips/failures. Focused policy/qualification tests cover deletion, rename and policy interpretation. Keep shared CI coverage tests green.

Behavior: A is running → main B changes only excluded paths → polling keeps
A without installing, building or restarting. Later qualifying C is compared
against A and built once at its selected commit. An application commit followed
by a docs commit between checks still qualifies the latest selected revision;
mixed changes qualify too. After successful activation the next comparison
starts there; skipped or failed attempts never consume qualifying changes.

Read the selected commit's workflow and use its push exclusions to qualify
the full A-to-candidate path diff. Include non-excluded deletions and rename
endpoints, with NUL-safe path handling. Reuse the shared pure reader/matcher;
keep CI coverage's conservative classifier behavior intact. Test changing
the published prefix list and verify subsequent updates follow it despite a
different local workflow. Missing/unsupported policy retains A, reports the
cause and retries after a valid revision becomes available. With no push
exclusions, changed application paths qualify.

Keep scenarios deterministic by blocking an owned fixture build/check boundary
or using the configured interval with observed check output, rather than
assuming two pushes race ahead of a running check. Negative deployment proof
observes completed checks plus unchanged install/build/activation counts and
PID; a page marker alone cannot prove a skipped build.

Update maintained docs with filtering, baseline, policy-source and recovery
behavior. Repeat repository-wide searches for removed runner/fixture exports,
dashboard numeric/tag-selection wording and dependencies. Inspect every hit;
delete remaining obsolete dashboard material and repair live references,
including planning breadcrumbs. Preserve guidance-release history/tooling
under the cited ADRs. Safe stopping point: all story promises have their final
behavior and owned proof; no dashboard tag-delivery compatibility path remains.

## Proof ownership and local gates

| Final-state promise | Owning slice and observation |
| --- | --- |
| Startup/restart build current main with locked dependencies and exact source | 2: actual npm install/build/preview, selected SHA and served source marker; docs-only latest commit at restart |
| Development isolation; strict/default/configurable production port and interval | 2: preserve real dev HMR and occupied-port cases; CLI validation and configured-interval observations |
| Stable URL, commit pinning during concurrent publication, unchanged revision stability | 2: browser/HTTP markers, build gate, activation SHA, URL/PID/build counts |
| Build/origin/start failure, retry, fatal restoration failure and unexpected preview exit | 2: real process fault gates; watcher output/exit, recovered HTTP and PID/process cleanup |
| Shutdown during install/build and while serving removes owned processes/checkouts | 2: existing cancellation case and watcher signal cases, including remaining SIGINT/SIGTERM coverage alongside existing SIGHUP |
| Physical project configuration and launch/session stores survive replacement/shutdown | 2: inspect fixture HOME store identities, preserve launch-record HTTP/file proof, assert production configuration bytes persist |
| Excluded-only, mixed and accumulated changes; baseline across skips/failures | 3: exact path diff, completed checks and install/build/activation/PID observations |
| Selected revision's changing CI policy; deletions and renames; policy failure recovery | 3: public watcher policy journey plus focused policy/qualification contracts |
| Obsolete dashboard behavior/code/docs removed; guidance release contract preserved | 2 removes the old contract; 3 completes reference/caller review and keeps shared CI semantics green |

From the repository root, select `.node-version` and use
[native setup](../../../tests/native-setup.md). Then run:

```sh
NODE_ENV=development npm run test:dashboard -- dashboard/tests/production*.spec.ts --reporter=line --workers=2
NODE_ENV=development npm run typecheck:dashboard
node --test src/skills/dough-execute-plan/scripts/ci-workflow-path-policy.test.mjs src/skills/dough-execute-plan/scripts/ci-path-applicability.test.mjs src/skills/dough-execute-plan/scripts/ci-path-applicability-indeterminate.test.mjs src/skills/dough-execute-plan/scripts/ci-revision-coverage*.test.mjs
git diff --check
```

Production suite rebuilds assets through its existing global setup; it never
serves an earlier build. Slice 1 runs production proofs; slice 2 repeats them
for changed behavior; slice 3 adds qualification and shared CI proofs. Typecheck
covers renamed/changed TS consumers. No whole-dashboard run is imposed because
the located production fixture/runner consumers are these specs. Broaden only
if execution discovers another affected purpose or changes another shared API.

Before each delivery, apply the installed execution workflow's independent
post-change refactor and proof acceptance. The check-only pre-commit hook
(`.githooks/pre-commit`) runs `npm run --silent lint -- --staged`; do not bypass
it. Hosted CI retains its configured checks and execution's asynchronous repair
ownership. Planning starts no observer, claim, implementation, or publication.

## Current decisions and design assessment

One commit identity flows through the existing watcher lifecycle. One selected
workflow supplies exclusions, and one pure path rule serves both meanings that
need it; deployment qualification and CI coverage retain their distinct verdicts.
The fixture Structure directly enables the next Behavior. Main lifecycle and
filtering are separate usable proof loops; cleanup stays with each behavior.

No numeric slice target/hard limit was supplied. Sizing includes implementation,
fixture migration, relevant proof and cleanup. The identity migration is the
widest slice because its four consumer specs must stay coherent; it adds no
second outcome or general deployment framework. If execution exposes a wider
caller set or a failed premise, stop dependent changes and revise this same
plan under the project's sizing/reassessment rules. No remaining slice-specific
concern was identified in this preparation review.

## Learnings

- Slice 1: the fixture commits only the paths a test passes through `changes`; files a test writes into `development` otherwise stay uncommitted local edits. Origin main starts empty until a test calls `push()` or `publish()`, so main-based startup cases need an explicit first publication. The minimal (non-full-source) fixture copies no workflow; slice 3 copies `.github` policy when it uses that mode.
- Slice 2: the watcher logs `Checked published main: <sha>.` before deciding; slice 3's qualification belongs between that check and `Preparing`, leaving the baseline unchanged on a skip. `tests/support/productionBuildGate.ts` (`builds.log` ordinals and `hold-build-<n>`) gives exact build counts for negative-deployment proof. The minimal fixture starts from an empty commit and copies nothing. Superseded checkouts are removed after the activation log, so single-entry deployment-directory checks poll.
