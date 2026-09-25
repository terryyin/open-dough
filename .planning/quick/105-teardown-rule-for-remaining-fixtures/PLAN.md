# Stop what every remaining test fixture started before removing it

This bounded retrospective correction has this plan as its canonical home.

**Identity:** quick/105-teardown-rule-for-remaining-fixtures/PLAN.md
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"eb8c4d374a6386276d740f252f1b32666343e1525ff66604f3bb4a54aaa0bf2c"}}
```

## Source

Execution retrospective of story `SEED-037#diagnosable-test-hangs`, executed
through plan 104 on `claude/104-diagnosable-test-hangs`. Both are recoverable
from before-cleanup commit `19cbad6`:
`.planning/seeds/SEED-037-quiet-stable-fast-tests.md` (story 3) and
`.planning/quick/104-diagnosable-test-hangs/PLAN.md`. Reviewed commits `044c88f..bde06c7`.
Findings were rechecked for this plan at `bde06c7`.

The story promise this correction completes (seed scope, "Teardown order"):
"Tests stop what they started before removing the fixture it runs from … The
same pattern is fixed wherever else a test starts a detached worker or held
process. A failing `stop` in teardown fails the test instead of being
swallowed." Plan 104 narrowed this to a passing-path leak sweep (two leaking
files) and the startup race tests. It delivered the one mechanism this plan
reuses:

- `fixtureTeardown(root)` (`fixture-teardown-test-fixtures.mjs`): `defer(step)`,
  and `cleanup` runs the steps in reverse order, removes the fixture, then
  rethrows any step failure;
- `deferObserverStop` (`watch-ci-test-fixtures.mjs`): real `ci-mailbox.mjs
  stop`, no `.catch`, then asserts the recorded worker is dead;
- `awaitProcessExit` / `processEnded` (`process-lifetime-test-fixtures.mjs`);
- the `startProcess` pattern (`workspace-publication-startup-test-fixtures.mjs`):
  a deferred step kills its child and awaits its `exit`.

All paths below are under `src/skills/dough-execute-plan/scripts/`.

## Goal and scope

**Beneficiary and outcome.** Open Dough developers running the suite: a test
that fails between starting something and stopping it neither hangs its test
file nor leaves a worker, observer, or child running, and a teardown stop
that fails is reported as a test failure.

Every remaining test fixture that starts a detached worker, child process,
in-process worker, or observer registers its stop or release with the
fixture's teardown when it starts. On passing and failing paths, teardown
stops it (and awaits its exit where the process is ours) before the fixture
it runs from is removed. A stop that fails fails the test (no ignored exit
code, no `Promise.allSettled` swallowing), and removal still runs.

### Current findings (at `bde06c7`)

- **F1. Revision-coverage in-process worker hangs a failing test file
  (confirmed).** `ci-revision-coverage-test-fixtures.mjs:60` registers only
  removal; `:122` starts an in-process `runMailboxWorker`, which holds
  `fs.watch(directory)` (`ci-mailbox.mjs:72`) and an abortable sleep. Callers
  stop it only inline (`ci-revision-coverage.test.mjs`,
  `ci-revision-coverage-discovery-delay.test.mjs`,
  `ci-revision-coverage-stop-states.test.mjs`). See the isolated proof below.
- **F2. Same in-process worker family, teardown that swallows or skips.**
  `ci-revision-coverage-late-github-failure.test.mjs:32` and
  `ci-revision-coverage-ignored-only-failure.test.mjs:39` settle
  `[worker, otherWorker]` with `Promise.allSettled`, swallowing a worker
  rejection. `ci-revision-coverage-not-required.test.mjs:87`,
  `ci-revision-coverage-not-required-shutdown.test.mjs:89` and
  `ci-mailbox-await-inherited-cases.mjs:83` stop, await, and remove in one
  hook: a rejecting worker skips removal. (These three were not in the
  retrospective's list; found by this plan's sweep.)
- **F3. Managed-delivery observer stop ignores its exit code.**
  `execution-increment-managed-delivery-test-fixtures.mjs:158-166`
  `stopObserver` runs `ci-mailbox.mjs stop` with `stdio: "ignore"` and awaits
  only `exit`. It runs in 16 `t.after` blocks across
  `execution-increment-managed-delivery*.test.mjs`, each with `cleanup()` after
  it and no `try/finally`. Observer directories are recorded after delivery
  returns (`fixture.observerDirectory = …`); several tests register no stop at
  all and stop only inline (`-resume-lifecycle.test.mjs:163`,
  `-resume-ownership.test.mjs:35`, `:90`), and `-resume-ownership.test.mjs:143`
  records two observers only after a second `startExecutionMailbox` succeeds.
- **F4. Process-mailbox fixture: one hook, and unregistered CLI children.**
  `ci-mailbox-process-test-fixtures.mjs:108-111` (`setupProcessMailbox`) runs
  `stop` then removal in one hook: a failing stop skips removal.
  `launchMailboxCommand` (`ci-mailbox-await-test-fixtures.mjs:35`, behind
  `launchAwait`/`launchComplete`) spawns a non-detached child with an IPC
  channel and registers no kill; a failing assertion before it completes
  leaves it for the rest of the file. Callers: `ci-mailbox-await-exact-cases`,
  `-await-exception-cases`, `-complete-success-cases`,
  `-complete-unresolved-cases`, `-complete-retain-cases`, `ci-mailbox-launch`,
  `ci-mailbox-worker-loss`.
- **F5. Blocking-GitHub environment removes its root before the tests' kills
  run.** `blockingGithubEnvironment` (`watch-ci-test-fixtures.mjs:97-109`)
  registers removal with `t.after` first; callers register their kills later,
  so `node:test` removes the root first. Kills are not awaited. Callers:
  `ci-codex-lifecycle.test.mjs` (`:55/:60,:85`, `:138/:143`; `:30/:37` uses its
  own root with the same order), `ci-codex-stop-lifecycle.test.mjs:23`,
  `ci-codex-completion.test.mjs` (`:34`, `:110`), `ci-fixture-lifecycle.test.mjs`
  (`:57/:67/:86`), and `ci-claude-worker-loss-lifecycle.test.mjs` /
  `ci-cursor-worker-loss-lifecycle.test.mjs`, which start a detached worker and
  end it only inline (SIGKILL at `:41`), with an assertion in between.
- **F6. Other host-lifecycle and child-process fixtures.**
  - `createClaudeReplay` (`ci-claude-lifecycle-test-fixtures.mjs:59-74`) and
    `ci-cursor-lifecycle-test-fixtures.mjs:60-76` record the started observer
    only after `configuredHook` succeeds; `ci-claude-lifecycle.test.mjs:29` and
    `ci-cursor-lifecycle.test.mjs:39` stop and remove in one hook.
  - `ci-observer-stream.test.mjs:74/:78`,
    `ci-codex-observation-loss-lifecycle.test.mjs:49/:53` and
    `ci-mailbox-complete-exit-cases.mjs:13/:47` register removal before the
    kill; kills are not awaited.
  - `ci-command-adapter-unavailable.test.mjs:167-186`: the `blocking` (and
    `timeout`) adapter runs `setInterval` forever and records its pid; if the
    product fails to end it, nothing kills it and it outlives the run.

**Checked and dropped** (the retrospective listed these as leaks or they
appeared in the sweep, but no failure can leave anything running):

- `ci-mailbox.test.mjs:102-115` and `:127-160`, and every
  `runMailboxWorker` in `ci-host-hook.test.mjs`: the worker is awaited inline
  right after a stop request, or awaited directly, with no assertion in
  between.
- `interruptHostHookWhileWriting` (`ci-host-hook-test-fixtures.mjs:64-79`):
  kills and awaits inline, with no assertion in between.
- Retrospective finding reclassified, not dropped: the `launchAwait` children
  (`ci-mailbox-await-exact/exception-cases`) are real (F4), not merely
  "low": a non-detached IPC child keeps the test file alive while it runs.

**Already correct (preserve):** the files that use `fixtureTeardown`
(`ci-cursor-worktree-hook`, `ci-target-branch-worktree`,
`workspace-publication-fixtures` `createQueuedTrunk`,
`workspace-publication-startup-test-fixtures`), `ci-custom-host-bridge.test.mjs`,
`ci-command-adapter-cli.test.mjs`, and `mailboxWithUnrelatedWorker` /
`spawnIdleNode`.

**Excluded:** product (non-test) code; product slot accounting and runner
changes; the Playwright dashboard suite; `tests/` shell checks (none start
processes); fixed `exec` timeouts and other waits that quick/102 owns; test
speed.

**Preserved promises and constraints:**

- test behavior and assertions are unchanged except teardown; inline stops a
  test asserts on stay inline;
- tests wait for events, not elapsed time (`tests/README.md`);
- plan 104's "Process groups" decision: detached workers are the test's own
  teardown responsibility;
- one mechanism (`fixtureTeardown`/`defer`, `deferObserverStop`,
  `awaitProcessExit`); no second teardown framework, no per-test special case;
- passing runs stay silent.

### Isolated representative proof of F1 (2026-09-25, Node 24.5.0, macOS)

Assumption: a test that fails between `createRevisionCoverageFixture` and its
inline stop keeps its test file alive.

- Probe file beside the fixtures, one test:
  `await createRevisionCoverageFixture(t); assert.fail(...)`. Command:
  `PATH="/opt/homebrew/bin:$PATH" node --test zz-probe-revision-coverage-hang.test.mjs`,
  watched for 40 s. **Result:** the test failed after 167 ms, and the file
  process was still running at 41 s; `node:test` reported the file as
  cancelled with "Promise resolution is still pending but the event loop has
  already resolved" once killed. The hypothesis holds.
- Same probe with `t.after(async () => { requestMailboxStop(...); await worker; })`
  added in the test (so it runs *after* the fixture's earlier-registered
  removal): **still running at 40 s.** Registration order alone defeats a
  per-test stop.
- Same probe against a scratch copy of the fixture using `fixtureTeardown`,
  with the stop step (`requestMailboxStop` then `await worker`) deferred right
  after `runMailboxWorker` starts: **the file ended in 1 s, exit 1, 1 fail,
  0 cancelled.** The planned mechanism works for the in-process worker.

The probe and scratch copy were deleted; no repository file changed.

## Outside-in proof

Proof for every slice follows plan 104's failing-path demonstration:

1. **Before the fix**, temporarily make one representative test in the family
   fail between its start and its inline stop (or observe the existing order),
   and show that a process from the fixture remains after the file ends, or
   that the file does not end.
2. **After the fix**, the same temporary failure leaves no process and the
   file exits (failing, as intended).
3. A temporarily failing stop step fails the test, and the fixture directory
   is still removed.
4. The affected test files pass.
5. **Leak sweep** after each affected file:
   `ps -axo pid,command | grep -E 'ci-mailbox\.mjs (worker|stream)|<fixture temp prefixes>' | grep -v grep`
   is empty (the fixture temp prefixes are the `mkdtemp` names each family
   uses, for example `ci-revision-coverage-`, `ci-codex-lifecycle-test-`).

Revert every temporary break before commit. Record commands and results in
the slice's accepted proof, as plan 104 did.

| Promise | Slice | Observation |
| --- | --- | --- |
| A failing revision-coverage test does not hang its file; in-process workers stop before removal; worker rejection fails the test and removal still runs | 1 | Hang probe above flips to exit; temporary worker rejection fails the test with the directory gone; the six files pass |
| Managed-delivery observers are stopped before removal on every path; a failing `stop` fails the test | 2 | Temporary failure after delivery leaves no `ci-mailbox.mjs worker`; temporary failing stop fails the test; the 7 managed-delivery files pass |
| Process-mailbox observers and CLI children are stopped and awaited before removal; a failing stop still removes the fixture | 3 | Temporary failure before `launchAwait` completes: file exits, no child left; temporary failing stop fails the test with the directory gone; the 7 callers pass |
| Blocking-GitHub environment tests stop their observers and streams before the root is removed | 4 | Temporary failure in a worker-loss test before its SIGKILL leaves no worker; kill steps await exit; the 6 callers pass |
| Remaining host-lifecycle and child-process fixtures follow the same rule | 5 | Temporary failure after `start` but before the hook result leaves no observer; the blocking adapter is gone after a temporarily failing product stop; the 6 files pass |
| No teardown in the directory still removes a fixture before stopping what runs from it, ignores a stop's exit code, or settles worker rejections | 5 | Closing grep over the directory for `allSettled`, `stdio: "ignore"` stops, and `t.after(() => rmSync` in files that start processes; each remaining hit is justified in the accepted proof |

## Current decisions

- **Register at start.** The fixture that starts something defers its stop
  immediately after the start returns (before any assertion or further
  setup), not after the test records a directory.
- **Stop steps.**
  - Observer worker (detached `ci-mailbox.mjs worker`): `deferObserverStop`.
    Its postcondition is that the recorded worker is dead. When the worker is
    already dead at teardown (the test killed or stopped it itself), the step
    only asserts that; this avoids the 5 s terminal-result wait `stop` spends
    on a lost worker. This is one rule inside the mechanism, not a per-test
    case. The plan-104 users keep their behavior (their workers are alive at
    teardown).
  - In-process worker: `requestMailboxStop` then `await worker`, so a
    rejection fails the test. If the same step appears in more than two
    fixtures, extract one helper beside `fixtureTeardown`.
  - Our own child process: kill if it has not exited, then await its `exit`
    (the `startProcess` pattern). A process that is not our child:
    `awaitProcessExit`.
  - An inline stop the test asserts on stays; the deferred step then finds
    the thing already stopped. `stop` on an ended mailbox returns its
    existing terminal result, so repeating it is safe.
- **Shared fixtures take the teardown.** `blockingGithubEnvironment`,
  `createManagedFixture`, `setupProcessMailbox`, `launchMailboxCommand` and
  the lifecycle replays switch to `fixtureTeardown`, and all their callers
  change in the same slice, so no caller is left on the old order.
  `createManagedFixture` is the one place that registers observer stops for
  the directories that its `deliverManagedExecutionIncrement`,
  `resumeManagedExecutionIncrement` and `startExecutionMailbox` return; the
  per-test `stopObserver` + `cleanup` hooks and `fixture.observerDirectory`
  bookkeeping go away.
- **Overlap with quick/102** (queued): 102 changes
  `ci-mailbox-await-exact-cases`, `-await-exception-cases`,
  `-complete-success-cases` (slice 3 here) and the `stop` refusal in
  `ci-mailbox-worker-loss` (slice 3), and lists `ci-codex-stop-lifecycle`,
  `ci-fixture-lifecycle` (slice 4), `ci-mailbox-launch` (slice 3) and
  `ci-revision-coverage-stop-states` (slice 1) as excluded timeout sites.
  This plan changes only teardown registration, order, and error
  propagation. Whichever lands second reconciles, as plan 104 did.
- **No North Star topic or ADR** governs test fixture teardown; no new
  direction is warranted.

## Ordered slices

### 1. Revision-coverage in-process workers stop before their fixture is removed

Type: Structure (owns F1, F2)
Status: done

Change: `createRevisionCoverageFixture` uses `fixtureTeardown` and defers the
worker stop right after `runMailboxWorker` starts.
`ci-revision-coverage-late-github-failure`, `-ignored-only-failure`,
`-not-required`, `-not-required-shutdown` and `ci-mailbox-await-inherited-cases`
defer each worker's stop when it starts, with no `allSettled`.

Weakness removed: a failing test hangs its file (F1), and worker rejections
in teardown are swallowed or skip removal (F2).

Proof: the F1 probe (as recorded above, against the real fixture) ends with
exit 1 instead of running on; a temporary worker rejection in
`-late-github-failure` fails that test and its storage directory is gone; the
three `createRevisionCoverageFixture` callers, the four other test files, and
`ci-mailbox-await.test.mjs` (which imports `ci-mailbox-await-inherited-cases`) pass; leak sweep
empty.

Accepted proof (2026-09-26, Node 24.5.0, macOS; commands run in
`src/skills/dough-execute-plan/scripts`):

- Before: probe `await createRevisionCoverageFixture(t); assert.fail(...)`
  against the HEAD fixture was still running at 20 s (1 fail, 1 cancelled once
  killed). After: the same probe against the real fixture exited 1 in about
  1 s (1 fail, 0 cancelled).
- A temporary rejecting deferred stop for the first worker in
  `ci-revision-coverage-late-github-failure.test.mjs` failed that test with
  the rejection, and its storage directory was gone. After refactoring, an
  inline check of `fixtureTeardown(a, b)` with a rejecting `deferWorkerStop`
  threw the rejection and removed both roots.
- `PATH="/opt/homebrew/bin:$PATH" node --test ci-revision-coverage.test.mjs ci-revision-coverage-discovery-delay.test.mjs ci-revision-coverage-stop-states.test.mjs ci-revision-coverage-late-github-failure.test.mjs ci-revision-coverage-ignored-only-failure.test.mjs ci-revision-coverage-not-required.test.mjs ci-revision-coverage-not-required-shutdown.test.mjs ci-mailbox-await.test.mjs`
  → 26 pass, 0 fail, 0 cancelled, silent.
- Leak sweep over `ci-mailbox.mjs (worker|stream)` and the prefixes
  `ci-revision-coverage-`, `ci-late-github-`, `ci-not-required-`,
  `ci-await-inherited-`, `ci-path-applicability-`: no process or directory
  from these fixtures. Workers from other checkouts on the machine were
  present and are not this plan's.

Delivered structure: `deferWorkerStop(teardown, worker, requestStop)` beside
`fixtureTeardown`, which now takes several roots (`fixtureTeardown(storage,
repo)`) and removes them all after the deferred steps.

### 2. Managed-delivery observers are stopped before their fixture is removed

Type: Structure (owns F3)
Status: done

Change: `createManagedFixture` builds on `fixtureTeardown(base.fixture)`;
`cleanup` becomes its `cleanup`. The fixture defers `deferObserverStop` for
each observer directory its delivery, resume, and mailbox-start functions
return. `stopObserver` checks the exit code (for inline use). The per-test
teardown hooks become `t.after(fixture.cleanup)`.

Weakness removed: a failing `stop` is ignored, a failing stop skips removal,
and a test failing before it records the directory leaves the observer.

Proof: before, a temporary failure right after delivery in
`execution-increment-managed-delivery-resume-lifecycle.test.mjs:163`'s test
leaves a `ci-mailbox.mjs worker` from the fixture; after, none. A temporarily
failing stop (for example a wrong launcher path) fails the test and the
fixture directory is gone. The dead-worker test
(`-resume-ownership.test.mjs:90`) does not gain the 5 s lost-worker wait. All
seven `execution-increment-managed-delivery*.test.mjs` files pass; leak sweep
empty.

Accepted proof (2026-09-26; commands run in
`src/skills/dough-execute-plan/scripts` with a private `TMPDIR`):

- Before: a temporary `assert.fail` right after delivery in "ended observer
  receipt never reports active attachment on the host hook"
  (`-resume-lifecycle`) left a `ci-mailbox.mjs worker` under the removed
  fixture 8 s after the file ended. After: exit 1, 1 fail, 0 cancelled, no
  worker and no fixture directory.
- A temporarily wrong launcher path made the teardown stop fail the Story
  Branch test with `Command failed: … stop`, and the fixture directory was
  gone.
- The dead-worker test ran 758–994 ms before and 882–915 ms after: no 5 s
  wait. Correction to the decision's rationale: this family never paid the
  lost-worker wait; the dead-worker rule is needed because a teardown `stop`
  fails on a mailbox the test removed ("mismatched owner").
- `node --test execution-increment-managed-delivery*.test.mjs ci-cursor-worktree-hook.test.mjs ci-target-branch-worktree.test.mjs`
  → 24 pass, 0 fail, 0 cancelled, silent; the private `TMPDIR` held no
  fixture and no worker afterwards.

Delivered structure: `createManagedFixture` wraps delivery, resume, and
mailbox start to defer `deferObserverStop` for each returned directory;
`stopObserver({ launcher, directory, cwd, env })` in `watch-ci-test-fixtures.mjs`
is the one real `stop` call and rejects on failure; `deferObserverStop` only
asserts a worker that is already dead.

### 3. Process-mailbox observers and CLI children are stopped before removal

Type: Structure (owns F4)
Status: done

Change: `setupProcessMailbox` uses `fixtureTeardown` and defers its observer
stop. `launchMailboxCommand` takes the fixture's teardown and defers kill and
awaited exit for each command child; `launchAwait`/`launchComplete` callers
pass it.

Weakness removed: a failing stop skips removal, and a failing assertion
while an await or complete command runs keeps that child alive.

Proof: before, a temporary failure right after `launchAwait` in
`ci-mailbox-await-exact-cases.mjs` keeps the `await-revision` child (and the
file) running; after, the file exits and no child remains. A temporarily
failing stop fails the test and the directory is gone. The test files that
import the five `-cases` modules, `ci-mailbox-launch.test.mjs` and
`ci-mailbox-worker-loss.test.mjs` pass; leak sweep empty.

Accepted proof (2026-09-26; private `TMPDIR`):

- Correction to the planned before-observation: with a working stop, a
  temporary failure right after `launchAwait` in "the real CLI quietly awaits
  pending exact coverage" did not keep the child alive on HEAD — the teardown
  `stop` ended the mailbox and `await-revision` exited `observation_cancelled`.
  The exposure is a failing stop (or a child that outlives its mailbox). With
  that failure plus a temporarily failing stop, HEAD kept the file, the
  `await-revision` child, and the worker running until the worker's 60 s
  budget (about 86 s) and left `ci-process-test-*`; after the fix the file
  exited in about 1 s (1 fail, 0 cancelled), the child was gone, and the
  fixture was removed.
- A temporarily wrong launcher in `setupProcessMailbox`'s deferred stop failed
  the test with `Command failed: … stop` and the fixture directory was gone.
- From the repository root (`ci-mailbox-complete.test.mjs` needs the root as
  cwd): `node --test src/skills/dough-execute-plan/scripts/{ci-mailbox-await,ci-mailbox-complete,ci-mailbox-launch,ci-mailbox-worker-loss,ci-codex-completion}.test.mjs`
  → 56 pass, 0 fail, 0 cancelled; leak sweep and private `TMPDIR` empty.

Delivered structure: `setupProcessMailbox` owns a `fixtureTeardown` with
`deferObserverStop` and returns it; `launchAwait`/`launchComplete(teardown, …)`
defer SIGKILL plus awaited exit for each command child. The extra consumer
`ci-codex-completion.test.mjs` uses a root-less teardown for its command
children until slice 4 folds it into `blockingGithubEnvironment`'s teardown.

### 4. Blocking-GitHub environment tests stop observers before the root is removed

Type: Structure (owns F5)
Status: planned

Change: `blockingGithubEnvironment` takes (or returns) a `fixtureTeardown` for
its root. Callers defer their stream-child kills (with awaited exit) and
detached-worker stops through it; the worker-loss tests defer the worker's
end right after `start`. `ci-codex-lifecycle.test.mjs:30`'s own root and
`ci-fixture-lifecycle.test.mjs`'s first test use the same teardown.

Weakness removed: removal runs before the kills, kills are not awaited, and a
worker-loss test failing before its SIGKILL leaves a detached worker with a
blocked `gh` for up to its 60 s budget.

Proof: before, a temporary failure before the SIGKILL in
`ci-claude-worker-loss-lifecycle.test.mjs` leaves a `ci-mailbox.mjs worker`
and its `gh` after the file ends; after, none. `ci-fixture-lifecycle`'s
loss variants still observe the fixture guard exiting (they remove the root
or kill the parent as their trigger, unchanged). The six callers pass; leak
sweep empty.

### 5. Remaining host-lifecycle and child-process fixtures follow the same rule

Type: Structure (owns F6 and the closing check)
Status: planned

Change: the Claude and Cursor lifecycle replays take the teardown and defer
the observer stop right after `start` (before `configuredHook`);
`ci-observer-stream`, `ci-codex-observation-loss-lifecycle` and
`ci-mailbox-complete-exit-cases` defer kill-and-await instead of registering
kills after removal; `ci-command-adapter-unavailable` defers ending the
recorded adapter pid (for the modes that record one) with `awaitProcessExit`,
after the product had its chance.

Weakness removed: an observer started before a failing hook is never
stopped; kills run after removal; a blocking adapter the product failed to
end outlives the run.

Proof: before, a temporary `configuredHook` failure in
`ci-claude-lifecycle.test.mjs` leaves the started observer; after, none. A
temporary break that stops the product ending the blocking adapter fails
`observer cancellation terminates its blocking adapter child`, and the adapter
is gone after the file. The six test files pass; leak sweep empty. Closing
check (table above) recorded.

## Learnings

- Registration order defeats a per-test stop: `node:test` runs `t.after`
  hooks in registration order, so a stop added by a test after the fixture
  registered its removal runs too late (second F1 probe). The stop has to be
  deferred through the fixture's own teardown.
