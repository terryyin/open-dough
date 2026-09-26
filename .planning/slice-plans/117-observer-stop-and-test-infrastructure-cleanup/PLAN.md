# Report a mid-exit observer worker as lost and consolidate duplicated test-speed mechanics

## Source

**Identity:** slice-plans/117-observer-stop-and-test-infrastructure-cleanup/PLAN.md
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"a8d5223dae2c7dd88b58397f4e54033d8a1df70f22ee16ea30b99743ee0ace84"}}
```

Bounded retrospective correction of plan 107 (SEED-037#fourfold-local-suite,
which merged SEED-037#fewer-installer-runs-per-promise), executed on
`claude/107-cut-test-work-and-ci-wait` in commits `273ae9a..388bcea` after
claim `489396e`. Plan 107 is recoverable from Git at
`388bcea:.planning/quick/107-cut-test-work-and-ci-wait/PLAN.md`. The
execution retrospective of 2026-09-26 found one regression and duplicated
mechanics this execution added or left, reviewed at `388bcea`.

**Beneficiary and outcome.** Agents stopping a CI observer, and maintainers of
the installer and test suite: stopping an observer whose worker is caught
mid-exit reports lost coverage instead of throwing, and the payload-comparison,
wait, and command-stub mechanics that plan 107 duplicated each have one home,
with the same proof as before.

## Goal and scope

### Included (current findings, evidence at `388bcea`)

1. **Regression (bb6e850, 47658ff).** `stopMailbox`'s `watchWorkerDeparture`
   (`ci-mailbox-complete.mjs`) treats any liveness other than `alive`
   (including `unknown`) as departure and calls `terminateMailboxWorker` at
   once. `verifyMailboxWorker` (`ci-mailbox-worker-process.mjs`) throws "does
   not match this mailbox" for any non-matching command that is not one of
   `commandShowsExit`'s forms, without liveness's "is the PID still running?"
   re-check. A worker caught mid-exit showing a transient command such as
   `[node]` makes `stop` throw instead of returning the lost-coverage result.
   Before 47658ff, termination ran only after the 5 s deadline.
2. **Duplicated payload comparison (342b939).** `managed_payload_unchanged`
   (`src/install/open-dough-release-version.sh`) has its own Node-then-`cmp`
   comparison beside `payload_bytes_run`
   (`src/install/open-dough-install-payload.sh`), with different fallback exit
   semantics; the updater now also runs `open-dough-payload-bytes.mjs`, which
   the inspect-before-executing list (`docs/installation-and-updates.md`,
   `tests/pin-and-inspect.sh` `inspected_helpers`) does not name.
3. **Duplicated test wait and stub mechanics (older weakness, one copy added
   by this execution).** Fixed-deadline wait helpers are defined separately in
   `ci-revision-coverage-test-fixtures.mjs`,
   `ci-revision-coverage-late-github-failure-test-fixtures.mjs`
   (`waitFor`), `watch-ci-test-fixtures.mjs` and
   `execution-increment-managed-delivery-test-fixtures.mjs`
   (`waitForPidExit`), plus inline loops in `ci-command-adapter.test.mjs`,
   `execution-increment-managed-delivery-resume-ownership.test.mjs`, and the
   new `waitForAdapterCalls` in `ci-custom-bridge-test-fixtures.mjs`.
   `writeBlockingGithubListCommand` (`watch-ci-test-fixtures.mjs`) and
   `ci-command-adapter-test-fixtures.mjs` still write a per-test `gh` stub,
   which plan 107 slice 6b identified as the macOS load-timeout cause and
   replaced elsewhere with `sharedCommandDirectory`.
4. **Latent fixture-cache defect (49c4ce3).** `tests/helpers/fixture-cache.bash`
   selects rewrite candidates with `grep -rlF` (binary files match) and
   rewrites through a NUL-terminated `read`, so a binary file embedding a
   cache path would be truncated; its header promises text files only.
5. **Stale scheduling list.** `tests/longest-first` still leads with checks
   plan 107 made cheap (`execution-payload-update.sh`,
   `product-backlog-payload-update.sh`) and omits CI's current longest jobs.

### Material exclusions

- The local budget report printing on normal local runs (CI-calibrated
  ceilings on a slower machine) conflicts with the seed's "quiet successful
  output"; it is a maintainer decision, not part of this correction.
- The exported `terminalResultDeadlineMs()` and its test stay: plan 107
  requires a test pinning the 5 s default, and observing it through a stalled
  stop would cost the full 5 s.
- Further speed targets, fewer fetches per start, and the four installation
  coverage gaps plan 107 recorded (refusing a requested version, `apply` with
  an unsupported platform, updating a Claude-only installation, installing
  without Node) belong to product follow-ups, not this correction.
- No test runs are removed, no assertion is loosened, and no retry is added.

### Preserved promises and constraints

- Stop still returns a published terminal result when one exists, records lost
  coverage for a worker that exits without publishing, keeps the full
  lifecycle deadline for a live stalled worker, and never signals a process
  whose identity is unknown (a reused PID running something else).
- Installer and updater user-visible behavior, first-mismatch reporting in
  declaration order, exit statuses, and the Node-less fallback are unchanged.
- Every journey keeps its promise and observation; waits stay bounded by the
  producing process where one exists.

## Context and architecture

- **PFE.** One liveness rule already exists in
  `checkMailboxWorkerLiveness`; termination's verification should reuse that
  classification rather than a second rule. `payload_bytes_run` is the
  existing one-process compare; `open-dough-platform.sh` is already sourced by
  both `install.sh` and `open-dough-release.sh`, so a shared compare over
  explicit roots and a file list can live there with the updater's
  first-mismatch walk on top. `awaitWorkerState` / `awaitSignalWhileRunning`
  (`watch-ci-test-fixtures.mjs`) and `sharedCommandDirectory`
  (`fixture-teardown-test-fixtures.mjs`) are the existing homes for waits and
  stubs.
- Existing structure is sufficient; no North Star topic or ADR change is
  needed. Runtime source edits stay under `src/skills/` and `src/install/`
  (maintainer guidance, `AGENTS.md`).

## Outside-in proof

| Finding | Slice | Observation |
| --- | --- | --- |
| 1. Mid-exit worker during stop | 1 | Deterministic stop case with an injected command reader showing a transient non-matching command whose PID then stops running: stop returns lost coverage with the worker-exit reason, where the current code throws; a PID still running another command keeps the deadline path and is never signalled |
| 2. One payload compare | 2 | Installer, updater, and payload checks pass unchanged; the updater's edited/missing/collision messages name the same file as before; the Node-less path still reports the first mismatch; inspection list and `pin-and-inspect.sh` name `open-dough-payload-bytes.mjs` |
| 3. One wait and stub home | 3 | The affected CI observer journeys pass silently, and at 30 parallel copies under load without failures; no remaining fixed-deadline duplicate helper or per-test `gh` stub in the named fixtures |
| 4. Binary-safe fixture cache | 4 | The fixture-equivalence check (fresh versus cached, including `.git`) still passes; a binary file containing the build path is copied byte-identical |
| 5. Current scheduling list | 5 | `tests/longest-first` matches the longest jobs in the latest CI `test-times` artifact |

## Current decisions

- One exit classification serves liveness and termination; `unknown` (a live
  PID with another command) never counts as departure.
- The shared payload compare keeps each caller's reporting: the installer's
  copy-then-match statuses and the updater's first-mismatch walk.
- Measure nothing against speed targets; this correction preserves plan 107's
  savings and proves behavior, stability, and equivalence only.

## Ordered slices

### 1. Stopping an observer whose worker is caught mid-exit reports lost coverage

Type: Behavior
Status: planned
Proof:
- New deterministic case in the completion journey (`ci-mailbox-complete`
  cases), with the existing `readCommand` injection or an equivalent seam for
  termination's read: a worker that shows a transient non-matching command and
  then stops running during stop yields the lost-coverage result with the
  worker-exit reason; it fails on the current code with "does not match this
  mailbox".
- Existing cases still hold: published result returned, stalled live worker
  keeps the full deadline, reused-PID identity is never signalled.
- `ci-*.test.mjs` and `watch-ci*.test.mjs` pass silently;
  `ci-mailbox-complete.test.mjs` at 50 parallel copies under load: no
  failures.

Behavior: an agent stops an observer whose worker is exiting as stop reads it
→ stop reports lost coverage instead of throwing, and a live process with
another identity is still never signalled.

### 2. The installer and updater compare payload bytes through one helper

Type: Structure
Status: planned
Proof:
- Every installer, updater, and payload check passes silently with unchanged
  assertions (`install-*.sh`, `update-*.sh`, `story-payload-update.sh`,
  `self-installation-baseline.sh`, `compare-payload.sh`,
  `pin-and-inspect.sh`); a scratch copy with a byte-changed managed file
  still names that file in the updater's message, with and without Node on
  `PATH`.
- `docs/installation-and-updates.md` and `tests/pin-and-inspect.sh`
  `inspected_helpers` name `open-dough-payload-bytes.mjs`.

Structure: the updater's baseline comparison and the installer's verification
share one Node-then-`cmp` compare over explicit roots and a file list, removing
the duplicated rule; installer and updater behavior are unchanged.

### 3. CI observer tests share one wait and one command-stub home

Type: Structure
Status: planned
Proof:
- The journeys using the consolidated helpers pass silently, and at 30
  parallel copies under load without failures.
- No fixed-deadline duplicate helper or per-test `gh` stub remains in the
  fixtures named under finding 3.

Structure: fixed-deadline wait helpers fold into the producing-process-bound
waits in `watch-ci-test-fixtures.mjs`, and environment-only `gh` stubs move to
`sharedCommandDirectory`; every journey proves the same promise.

### 4. The fixture cache copies binary files unchanged

Type: Structure
Status: planned
Proof:
- The fixture-equivalence check (fresh versus cached, including `.git`,
  refs, tags, and modes) still passes for delivery and context on all three
  hosts.
- A fixture file containing NUL bytes and the build path is copied
  byte-identical, where the current rewrite truncates it.

Structure: `fixture-cache.bash` rewrites only text files, as its header
promises; native-evidence checks are unchanged.

### 5. The runner schedules today's longest checks first

Type: Structure
Status: planned
Proof:
- `tests/longest-first` lists the longest jobs from the latest CI
  `test-times` artifact, and the runner tests that read it pass silently.

Structure: the scheduling list reflects plan 107's changed costs, so long
jobs still start early; no check changes.

## Promise ownership

- Stop reports lost coverage for a mid-exit worker and never signals an
  unknown identity: slice 1.
- Installer and updater behavior unchanged with one compare: slice 2.
- Test waits and stubs consolidated with the same proof and stability:
  slice 3.
- Binary-safe fixture cache: slice 4.
- Current scheduling list: slice 5.
