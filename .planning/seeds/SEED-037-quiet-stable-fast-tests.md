---
id: SEED-037
status: active
planted: 2026-09-25
planted_during: Product backlog capture requested by the maintainer
trigger_when: The full local test suite is run or tests run in CI
scope: unknown
---

# SEED-037: Get quiet, stable, fast test feedback

## Why This Matters

For an Open Dough developer running the tests locally or reading CI results,
routine test output and warnings obscure failures, time-based waits make tests
slow and flaky, and the full suite takes too long to provide feedback. The
desired result is a quiet successful run, useful diagnostics on failure,
repeatable results, and less total test work, so that local runs and the CI
verdict every published revision waits for both come back sooner, and stay
fast as the suite grows.

## Alternatives and Decision

Silencing the runner alone would shorten logs but leave warnings, flaky tests,
and long waits in place. Retrying failed tests would hide instability. A set
of isolated micro-optimizations could make individual tests faster without
meaningfully shortening the full run. Treat output, stability, and total local
feedback time as one end-to-end outcome, using `dough-test-optimization` to
profile related test families, experiment, preserve behavioral proof, and
re-profile the complete local scope.

## Story Decomposition

<a id="fourfold-local-suite"></a>

### 2. Cut total test work and the CI verdict wait, and keep them within budget

**Identity:** SEED-037#fourfold-local-suite
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../quick/107-cut-test-work-and-ci-wait/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"5ab6c09a10b87aa766c34f7e998561f833f36770ba7ff7adab953bd2d8c83fec","plan":"54aa45ca73a5fb68cf6fff350e56415cdb9abbd5d78dc7ee1212ac364fda8fe6"}}
```

**Status:** Refined on 2026-09-26. Split on 2026-09-25 from the delivered
story that made the suite quiet, stable, and twice as fast. On 2026-09-26 the
maintainer replaced the local "a quarter of the original time" target with
total test work and CI test time plus a budget guard, kept the immediate CI
check in this story, and deferred fewer installer runs per promise to
[a later story](#fewer-installer-runs-per-promise). The anchor keeps its
original name because it is the recorded identity.

**Goal:** Agents publishing to trunk and developers running the tests get
test feedback sooner. Every published revision reaches its CI verdict sooner,
the complete local suite does less total work, and a budget check keeps both
from creeping back as tests are added. This serves the near-future direction:
parallel agents on trunk wait for each revision's CI verdict, and that wait,
not a developer's local run, is the feedback loop they repeat most.

**Measure:**

- **CI test time:** the median of the CI `test` job's `Run test` step over the
  last successful runs on trunk. Baseline on 2026-09-26: about 190 s (168–208 s
  across six runs; checkout, Node setup, and `npm ci` add under 10 s). Target:
  at most 120 s.
- **Total local work:** the sum of per-job wall seconds that
  `OPEN_DOUGH_TEST_TIMES` records for `npm test`, compared relatively: three
  paired runs alternating the story's start revision and the candidate under the
  same load, comparing medians. Target: at least 35% less total work than the
  start revision. Wall time of the whole local run is reported but is not the
  target, because 16-slot local parallelism does not carry over to CI runners.
- **Verdict delay:** registering a push whose CI run has already finished
  yields the verdict in about a second instead of up to 30 s.

**Scope:**

- **CI observer checks when a push is registered.** Today
  `watch-ci-execution.mjs` polls every 30 s (`pollMs = 30_000`) and
  `register-push` does not wake it, so an already-finished run waits for the
  next poll. Registration must trigger an immediate check; periodic polling
  continues for runs still in progress. Tests that pay this wait today (for
  example `execution-payload-update.sh`, 30.05 s against 0.40 s) lose it.
- **Less work per test, not fewer promises.** Reduce what each test pays to
  prove the promise it already proves. Candidates in the profile of
  2026-09-26: the installer and updater itself (per-run cost, not run
  count), `workspace-publication*.test.mjs` (98 s under load),
  the `preparation-assignment-*` tests (about 23 s each), real-time waits,
  shared fixture setup, and `assert_payload`'s per-file `cmp`. Use
  `dough-test-optimization` to profile, run measured experiments, and
  re-profile.
- **Budget guard.** CI checks the recorded per-job times against a committed
  budget: a ceiling for any single job and one for the total. Set the budget
  from the times this story achieves plus headroom for runner variance, so that
  an ordinary busy runner does not fail it. Exceeding it fails the CI `test`
  job with a message naming the jobs over budget and their times. The local
  run reports the same comparison but does not fail, because local load varies.
  Raising the budget is an explicit, reviewed edit to the committed file.
- **Keep what the suite already has:** quiet successful output, stable results
  without retries, and each promise's observable proof at its boundary.

**Deferred promises:**

- Proving an installation or update promise with fewer installer runs,
  including the 24-run Cursor-only protection matrix in
  `story-payload-update.sh`. This is a coverage decision and belongs to
  [fewer installer runs per promise](#fewer-installer-runs-per-promise).
- Dashboard Playwright time (`npm run test:dashboard`). It runs in parallel
  with the CI `test` job and does not set the verdict time.
- Machine-specific speedups that do not reach CI, such as putting the Command
  Line Tools git ahead of macOS's `/usr/bin/git` launcher stub.
- Release-fixture reuse and repository-copy setup, already measured as not
  worth doing (about 1 s and 4–5 s of wall).

**Rejection constraints:** no retries or loosened assertions to gain speed,
following this seed's stability goal. Removing a test is acceptable only when
another test still observes the same promise at the same boundary.

**Key examples:**

1. **Finished run.** An agent publishes a revision whose CI run has already
   completed (for example, a republish of a covered revision) and registers
   the push → the observer reports that verdict within about a second, not
   after the next 30-second poll.
2. **Run in progress.** A registered push whose CI run is still going →
   the observer keeps checking periodically and reports the verdict when the
   run completes, as it does today.
3. **CI verdict time.** After the story, successive trunk CI runs show the
   `Run test` step at a median of at most 120 s, against about 190 s on
   2026-09-26.
4. **Local total work.** Paired runs of the start revision and the result
   under the same load show at least 35% fewer total job-seconds, with the
   same quiet successful output.
5. **Budget exceeded.** A change makes one job take much longer than its
   ceiling → the CI `test` job fails, naming that job, its time, and the
   ceiling; the same run locally prints the comparison and still passes.
6. **Budget respected.** A normal run, including one on a moderately busy
   runner, stays within budget and prints nothing about it.

**Evidence (2026-09-25 decisive checkpoint and 2026-09-26 profile):**

- When the twofold result was delivered, jobs run alone summed to about
  632 s, with an effective parallelism of about 6 at 16 slots. The complete
  paired local run was 242.6 s at `bad3717` against 121.6 s (ratio 0.50).
- On 2026-09-26 the suite had grown from 186 to 196 shell and Node test
  files since the twofold delivery; the heaviest jobs were still the
  installer and update checks, followed by `workspace-publication.test.mjs`.

- **Value / learning:** shortens the CI verdict wait for every revision
  agents publish, and learns how much can be saved without changing how many
  times each promise is exercised.
- **Effort hypothesis:** M, provisional; the CI observer change is small, and
  the rest depends on what profiling shows.
- **Depends on:** none.

<a id="fewer-installer-runs-per-promise"></a>

### 4. Prove each installation promise with fewer installer runs

**Identity:** SEED-037#fewer-installer-runs-per-promise
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../quick/108-fewer-installer-runs-per-promise/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"71a04e995554083ab7902c05384c11a8157f53426fa4c0b127e1b6d05d0adb7a","plan":"4baf760b61564d49a7fdf04ec754971488224296b2e72b4b9353cdc0b0ab7dae"}}
```

**Status:** Refined on 2026-09-26. Deferred from story 2 by the maintainer
on 2026-09-26. The maintainer accepted declaration in the managed payload as
the proof that a file is covered, and directed that the story include whatever
its goal needs, follow the architectural North Star, and leave no duplicate.
A later refinement the same day narrowed it to the two protection matrices;
the maintainer restored the whole duplicated family on 2026-09-26, keeping that
refinement's owner corrections and links-only declaration check. The former
dependency on story 2 only attributed savings and is dropped; this story needs
nothing story 2 delivers.

**Goal:** Agents publishing to trunk and developers running the tests get
the same installation and update confidence from less test work, and authors
of new payload files stop copying protection proofs into a new
payload-update check. The installer protects every declared file through one
mechanism, walking `install.sh`'s single `managed_files` declaration
(`src/install/open-dough-install-payload.sh`). So each shared protection gets
one end-to-end owner, a declaration-level check proves which files it covers,
and each payload-update check proves only what its own payload adds. This
follows the architectural North Star's one-owner cohesion and
[ADR 0004](../../docs/adrs/0004-client-installation-and-update-accepted.md)'s
single payload declaration, and shortens the CI verdict wait that parallel
agents repeat.

**Measure:** `install.sh` and `apply` runs in the four payload-update checks
(`story-payload-update.sh`, `product-backlog-payload-update.sh`,
`execution-payload-update.sh`, `retrospective-reference-payload.sh`), counted
from each check's code before and after, and their summed job-seconds in a
relative paired run under the same load. Target: at least two thirds fewer
runs (about 97 → about 31), with each removed promise naming its surviving
owner. Job-seconds are reported, not targeted.

**Scope:**

- **One owner for an edited or removed declared file.** The Cursor-only
  matrices in `story-payload-update.sh` and `product-backlog-payload-update.sh`
  (24 runs each), the edit loop in `execution-payload-update.sh` (8 runs), and
  the per-platform missing-reference refusals in
  `retrospective-reference-payload.sh` (6 runs) all re-prove that an edited or
  removed managed file makes ordinary update and repeat install refuse without
  writes, and that `--force` restores it. Existing owners already prove
  ordinary-update refusal of an edited or missing file
  (`tests/update-refuses-unverifiable.sh`), `--force` restoring either
  (`tests/update-force-restores-latest.sh`), and repeat install refusing an
  edited file (`tests/install.sh`). Repeat install refusing a removed file has
  no owner and is added to `tests/install.sh` before the copies go.
- **Declaration proves a file is covered: links only.** One check that runs
  no installer: every relative Markdown link in a declared managed file,
  ignoring its anchor, resolves to a path that `managed_files` also declares.
  With `assert_payload`, which proves each declared file is installed
  byte-identical in each root, it makes the three installed link-walking loops
  (in the story, execution, and retrospective checks) redundant, and they are
  removed. Those loops keep only the last link on a line; the new check sees
  every link. It does not require every file under a skill source directory to
  be declared.
- **One owner for an unrelated file at a newly managed path.** Ordinary update
  refusing without writes when the project already has its own file at a path
  the new release starts managing is repeated in the story check (per
  platform), the retrospective check (per platform), and the execution check.
  `tests/install-refuses-unsafe-topology.sh` covers only fresh-install unsafe
  layouts, not this update case, so the story check's per-platform case stays
  as the owner and the other two copies go.
- **One shared upgrade fixture.** All four checks build the same pair of
  releases by hand: an older release with some paths removed from `install.sh`,
  `open-dough-release-version.sh`, and the skill sources, then a newer release
  with them. One helper in `tests/helpers/release-fixture.bash` builds that
  pair from the paths to withhold, and every check uses it.
- **Payload-update checks keep only what their payload adds:** the story
  skills arriving on each platform, the backlog scripts arriving with the
  project's backlog untouched and their offline runtime proof (which also
  keeps the declaration of the `.mjs` scripts a links-only check cannot see),
  execution hooks and the installed CI runtime, and the retrospective
  reference arriving with configuration preserved.
- **No change to installer or updater behavior.** This is a test-only change.

**Deferred promises:**

- Fewer per-platform (codex, cursor, claude) runs of the checks that remain.
  AGENTS.md's cross-tool rule says success on one tool does not prove another,
  so reducing platform coverage needs its own decision.
- Cheaper individual installer runs and `install.sh` speed, owned by
  [story 2](#fourfold-local-suite).
- Installer and update checks outside the payload-update family, except where
  they become an owner above.

**Rejection constraints:** no retries, skips, or loosened assertions, following
this seed's stability goal. Remove a run only when a named check still
observes the same promise at the same boundary, and name that owner in the
change.

**Key examples:**

1. **Edited declared file.** A project has the latest payload installed; a
   developer edits a managed reference and runs an ordinary update → the
   update refuses without writes; repeat install refuses; `--force` restores.
   The existing owners prove this once; no payload-update check repeats it.
2. **Removed declared file.** The same project, but the developer deletes a
   managed reference → ordinary update and repeat install both refuse without
   writes, and `--force` restores it; the existing owners plus the new
   repeat-install case prove this once.
3. **New file forgotten in the declaration.** A skill starts linking to a new
   reference that is not added to `managed_files` → the declaration check
   fails and names the linking file and the undeclared target, without
   running the installer.
4. **New file declared.** The same reference is added to `managed_files` →
   the declaration check passes, and the file is protected by examples 1
   and 2's owners with no new per-file installer runs.
5. **Unrelated file at a new managed path.** An older installation lacks a
   newly managed path and the project has its own file there → ordinary update
   refuses without writes on each platform, proved only by the story check.
6. **Payload-specific promise stays.** An update that adds execution hooks
   still proves hook registration, host-settings conflict refusal, and the
   installed CI runtime in `execution-payload-update.sh`.
7. **New payload-update check.** A future story adds files to the payload →
   its check builds its older and newer releases with the shared fixture
   helper and proves only what its files add.
8. **Run count.** Before/after counts across the four checks show at least
   two thirds fewer installer and updater runs, and the paired job-seconds are
   reported.

**Evidence (2026-09-26):** counted from each check's code on trunk:
`story-payload-update.sh` 33 installer and updater runs,
`product-backlog-payload-update.sh` 30, `execution-payload-update.sh` 16, and
`retrospective-reference-payload.sh` 18. In the planning profile they took
102.5, 87.7, 90.2, and 67.9 of 2,079 job-seconds under load; only relative
weights are usable. No existing check proves repeat install refusing a removed
file, and no check verifies links against the declaration without installing.
A probe of the links-only rule on trunk at `b34db51` found 450 relative links
across 164 declared files and no undeclared target. A probe on the same
revision showed repeat install refusing a removed managed file and `--force`
restoring it.

- **Value / learning:** removes the largest duplicated block of test work and
  the patterns new payload stories copy; learns whether declaration-level
  proof holds up as new payload files are added.
- **Effort hypothesis:** M; a test-only change across four checks, their
  owners, one new check, and one shared fixture helper.
- **Depends on:** none.

## Ordering and Scope Reduction

Story 2 stays first as requested by the maintainer. Within it, the CI
observer's immediate check is independent of the test-work reductions and can
land first. Investigate shared setup, fixture cost, synchronization, and runner
overhead as related test families, and keep measured experiments that preserve
confidence. Do not count a quiet log, fewer promises proved, or a faster
isolated test as the result. Story 4 is independent of story 2's code and
queued after it; the maintainer kept that position on 2026-09-26 rather than
re-ranking it after story 2's checkpoints. Per-platform reduction stays
deferred as its own decision.

## Open Decisions

None for story 2. Refinement on 2026-09-26 replaced the local fourfold target
with CI test time, total local work, and a budget guard, and deferred fewer
installer runs to story 4. Story 4's coverage decision was made on
2026-09-26: declaration in the managed payload proves a file is protected, and
each shared protection keeps one end-to-end owner. A second refinement the
same day narrowed story 4 to the two protection matrices; the maintainer
restored the whole duplicated payload-update family. Reducing per-platform
runs remains open and outside story 4.

## When to Surface

Immediately, as the first item in the product backlog.

## Breadcrumbs

- Maintainer request on 2026-09-25 for no-news-is-good-news output, strict CI
  output enforcement, stable event-synchronized tests, and a measured fourfold
  local full-suite speedup; replaced on 2026-09-26 by the CI test time, total
  work, and budget targets in story 2.
- `scripts/test.sh`, `tests/README.md`, `dashboard/tests/`, and
  `.github/workflows/ci.yml` identify the current test and CI surfaces.
- The installed `dough-test-optimization` skill owns profiling, measured
  experiments, preservation of proof, and final re-profiling during execution.
