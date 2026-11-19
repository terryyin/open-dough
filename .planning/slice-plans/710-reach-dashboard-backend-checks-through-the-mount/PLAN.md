# Reach dashboard backend checks through the mounted boundary

**Identity:** SEED-403#reach-dashboard-backend-checks-through-the-mounted-boundary
**Source:** [Reach dashboard backend checks through the mounted boundary](../../seeds/SEED-403-reach-dashboard-backend-checks-through-the-mounted-boundary.md#reach-dashboard-backend-checks-through-the-mounted-boundary)
**Source review:** [Source-only review](source-review.md)

## Goal and scope

In Dashboard Backend Test, a boundary-mode start mounts the local boundaries
in the test process on the Cursor runner stand-in, and each case keeps its
assertions. A case whose proof is a separate process, a live connection, the
server program, or Cursor work asks for the live server by name. A case that
fails on the mount for another reason also asks, naming that reason.

Excluded: returning the cases held for another reason, preview-mode cases,
mounting one boundary alone, and boundary-mode starts made by E2E Test or
Dashboard Frontend Test. The seed records these as deferred.

## Current decisions and proof boundaries

- **The start chooses the entry.** Cases keep calling the start they call
  today. The scratch trial passed 1,545 of 1,634 cases that way, so moving
  cases one by one buys nothing.
- **Reuse.** Extend `dashboard/test-support/support/inProcessBoundaryHttp.ts`
  to mount a list of boundaries, pass them the HTTP server for upgrades, and
  take the project environment. `inProcessAuthenticatedRead.ts` keeps using
  it. Reuse `cursorRunnerStandIn.ts`, `withRestoredEnv`
  (`testEnv.ts`) and `dashboardFixtureLifetime.ts` as they are.
- **A new module holds the mounted server.**
  `dashboard/test-support/support/dashboardServer.ts` is 241 lines against
  the 250-line check, so the mount lives beside it and
  `startDashboardServer` selects between the two launches.
- **The live request is one option on the start** that carries its reason:
  `separate process`, `connection`, `server program`, or a free-text reason
  for a case held for another cause. Wrappers pass it through per call, so a
  wrapper shared with mounted cases is not pinned whole.
- **One mounted server per test process at a time.** A second mounted start
  while one is up refuses and names the live request.
- **Only the backend run mounts.** The backend configuration selects the
  mounted default; other groups keep the live server.
- No Accepted ADR governs the test entry.
  [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
  sets the comparison the seed records. No North Star topic applies.
- [MOUNT-TRIAL.md](MOUNT-TRIAL.md) lists the cases that failed on the mount
  and the specs that ran a second server. Slices 4, 5 and 6 start from it.

## Premises and observations

All observed on 2026-11-18 at `901d7c3b9` in this story's worktree, on AC
power under `caffeinate -s -i`, two workers, with other sessions loading the
machine (load average 7 to 16). Scratch edits were reverted.

| Premise and operation | Observed result and limits |
| --- | --- |
| Every boundary except the incident record mounts in a Playwright worker and answers. A scratch spec under the backend configuration installed `localBoundaries` without `dough-incident-record` through `installBoundary` on its own `http.Server`, private `HOME`, fake `gh`, stand-in runner, six mounts in one worker, and asked `/__project-configuration`. | 200 each time; start 2–4 ms, close 1–9 ms. |
| The Cursor runner, not the child process, is most of a start. Same spec, interleaved six rounds. | Live with real runner 358–595 ms; live with stand-in 157–358 ms; mounted with real runner 426–665 ms; mounted with stand-in 2–4 ms. |
| A process keeps one project environment. Read `initializeProjectConfiguration` in `dashboard/server/projectConfiguration.ts`; in the scratch trial a production mount ran in a worker before `configuration/project-add-validation.spec.ts`, whose fixture initializes development. | `A dashboard server cannot use both project environments.` The trial reset the two module variables before each mount; slice 1 replaces that reset. |
| Boundary-mode cases pass on the mount with the stand-in. `npm run test:dashboard:backend -- --grep-invert '[Cc]ursor'` with the scratch routing. | 1,545 of 1,634 passed, 74 failed in 59 files, 900 starts mounted at a median 6 ms start and 3 ms close. Classes: process identity, restart and shutdown; the incident record; a test's own child command inheriting the mount's environment; backoff timing. Cases naming Cursor did not run. |
| A Cursor case cannot use the stand-in. The whole suite with the scratch routing; read `stopCursorRunner` in `dashboard/server/hosts/cursor/runnerProcess.ts`. | Cursor cases failed with `Unexpected Cursor protocol work on the runner stand-in: GET /sessions`, and the run ended abruptly during `terminals/agent-terminal-cursor-exit.spec.ts`. The stop sends SIGTERM to the pid in the runner address, which a stand-in writes as the worker's. Which call ended the run was not isolated. |
| The mount is faster under equal load. `npm run test:dashboard:backend -- review/ --grep-invert '[Cc]ursor\|one-shot-landing\|completed-capture-fallback\|one-shot-admission'`, live then mounted, three times. | 136 passed each time. Wall 145, 108, 116 s live; 91, 97, 85 s mounted. |
| Baseline for the seed's comparison. One whole backend run with each start timed. | 1,110 starts: 1,028 boundary, 76 preview, 6 dev. Start and close summed to 532 s of 2,116 s of case time; wall 1,114 s. One case failed, `sessions/agent-launch-codex-observation-wait.spec.ts`, under load. |
| Server settings are read when used, so a mount can set them per case. `grep -nE '^(export )?(const\|let) .*process\.env' dashboard/server/*.ts`. | No match at module level in `server/*.ts`. `server/hosts/` and the backoff failures were not traced; slice 6 traces the failures. |

## Ordered slices

### 1. A closed server releases its project environment

Type: Structure
Status: done
Budget: 15 active minutes, excluding commands.

`dashboard/server/projectConfiguration.ts` holds the environment until the
server that initialized it closes; the next initialization may name the
other one. A running server still refuses a second environment. The
boundary server and the Vite plugin keep their one environment per process.
Enables slice 2.

Proof: a backend case mounts the project-configuration boundary through
`inProcessBoundaryHttp.ts` in development, closes it, mounts production with
a fresh `HOME`, and reads the seeded project ids; a second environment
requested while the first is mounted is refused with today's message.
Scratch fault: skip the release; the production mount fails with that
message. `configuration/`, `observation/authenticated-read-plugin-hooks.spec.ts`,
`runtime/fake-gh-in-process.spec.ts` and `runtime/serving-modes.spec.ts`
stay green.

Observed the sequential development-to-production mount and the active-mount
refusal through the project-list HTTP endpoint. Omitting release reproduced
the second-environment error at the production start. The focused selection
passed across 57 tests in 17 files. The revision-stream, setup-departure, and
shared-listing-failure specs also passed on the existing in-process read
fixture and dashboard typecheck passed. Run records and the consumer trace
are in this worktree's Git evidence directory under `slice-1-`.
Independent refactoring unified project-add fixture startup and teardown
cleanup. All nine project-add validation cases and typecheck passed again.

The project-addition fixture also owns a scoped configuration, so its worker
can later mount production. The authenticated-read hook proofs close the
actual Vite boundary hook while HTTP stays open. Slice 2 needs to preserve
that independent hook and HTTP lifetime.

### 2. A boundary-mode start can mount in the test process

Type: Behavior
Status: done
Budget: 15 active minutes, excluding commands.

On request, `startDashboardServer` in boundary mode mounts the boundaries in
the worker with the stand-in runner and returns the same controls. It sets
the server environment for the mount's lifetime, restores it at close,
refuses a second mount while one is up, and releases the stand-in address
before close returns. Process-only members (`pid`, `output`) refuse with the
live request's name. The live server stays the default.

Behavior: the Java intent read, the project-list case and one synthetic
`claude` launch acceptance ask for the mount → their answers, written files
and host calls are unchanged, and no server process or Cursor runner starts.

Proof: `intent/authenticated-read-intent-java.spec.ts`,
`configuration/project-configuration-boundary.spec.ts` and
`launches/agent-launch-boundary.spec.ts` request the mount and pass with
assertions unchanged; a new runtime case asserts no child of the worker runs
the boundary server and the runner address names the stand-in, then is
absent after close, and that a second mount is refused. Scratch fault: leave
the environment unrestored; the next live start in that worker reads the
earlier `HOME` and its case fails.

The focused backend run passed 98 cases across 25 specs and dashboard
typecheck passed. It preserved the Java, project list, and Claude launch
assertions on the opt-in mount. Runtime proof covered the stand-in, HTTP and
terminal upgrade, omitted incident lifecycle, process-only access, failed
bind recovery, overlap refusal, and the held launch control. The restoration
fault let an ordinary child command inherit the old mount's HOME. That is the
decisive observation because a live dashboard launch supplies its own HOME.
Proof records and the consumer trace are under `slice-2-` in the worktree's
Git evidence directory.

Both start paths reuse the fixture's port allocator so tests can restart on
the same leased port. The mounted runner claims its address exclusively.
The private-home probe verified a second claim preserves the first address
and its live listener. After refactoring, 37 affected backend cases across
eight specs and dashboard typecheck passed.

### 3. Cursor cases ask for the live server

Type: Structure
Status: done
Budget: 15 active minutes, excluding commands.

Every start that serves Cursor work passes the live request with reason
`separate process`: the Cursor fixtures under `dashboard/test-support/`
(`cursorRunner*.ts`, `keptCursorTurn.ts`, `cursorUnconfirmedStop.ts`,
`publishedMainFixture.ts` where it stops the runner) and the backend specs
that start a server and stop or read the runner address themselves. No
behavior changes while live is the default. Enables slice 7.

Proof: the specs matching `[Cc]ursor` under `dashboard/backend-tests/` pass,
and a scratch flip of the default leaves every one of them on the live
server (count mounted starts in that selection: none).

The strict focus run passed 144 cases. The guarded scratch default passed
all 124 Cursor-selected cases across 41 specs. It recorded 55 live boundary
and four live preview starts, with zero attempts to mount. The dispatch
guard refused a mount before publishing any runner address. The dispatcher
was restored byte for byte, and dashboard typecheck passed. Named run
records and the source trace are under `slice-3-` in the Git evidence directory.

### 4. A second server and the server program ask for the live server

Type: Structure
Status: done
Budget: 15 active minutes, excluding commands.

From [MOUNT-TRIAL.md](MOUNT-TRIAL.md): in each of the 14 specs that ran a
second server, the server that joins a machine another server already
serves passes the live request with reason `separate process`; the first
may mount. `runtime/boundary-server.spec.ts` and the shutdown cases in
`sessions/session-instruction-voice-boundary.spec.ts` pass it with
`server program` or `connection`, as each case states. No behavior changes
while live is the default. Enables slice 7.

Proof: those specs pass on the live default, and a scratch flip of the
default runs them green with one mounted and one live server where two
servers share a machine.

The live selection passed 53 cases. The final scratch selection passed all
51 cases in the 16 planned specs with 31 mounted and 50 live starts. Both
same-machine launch cases ran the development boundary in the worker and
production in a different process. They kept both acceptances for different
stories and one acceptance with an `already-starting` refusal for one story.
The shared-owner case that reads an exact diagnostic history uses two live
servers. Its other cases each retained a mount beside a live process.
Dashboard typecheck passed and the dispatcher was restored byte for byte.
Evidence is under `slice-4-` in the worktree's Git evidence directory.

### 5. Process identity, restart and incident-record proofs ask for the live server

Type: Structure
Status: done
Budget: 15 active minutes, excluding commands.

From [MOUNT-TRIAL.md](MOUNT-TRIAL.md): the `launches/`, `sessions/` and
`observation/` cases whose proof is a pid, a worker handoff, a start lost
with its server, a restart that must be a new process, diagnostics of a new
server, or the incident record pass the live request with reason
`separate process`. Read each case before choosing: the reason is the proof
the case states, not the error the trial printed. A case with no such proof
goes to slice 6. No behavior changes while live is the default. Enables
slice 7.

Slice 4 also reached `observation/authenticated-read-output-bound.spec.ts`
through the shared revision helper. Its exact failure diagnostics need a
fresh process because `readDiagnostics.ts` retains earlier entries in the
worker. Include this case in the slice 5 selection.

Proof: the listed specs pass on the live default, and each request sits on
a case whose description or assertions name the process fact.

The live selection passed 59 cases across 22 specs. The three acceptance
cases passed again with their final routing. Dashboard typecheck passed.
The G2 scratch check ran one mounted failure and then the output-bound
case in the same worker. The latter started a separate child and observed
exactly its own diagnostic. The dispatcher was restored byte for byte.
Run records and the consumer trace are under `slice-5-` in Git evidence.

Slice 6 carries the quiet-closure case's initial server, which explicitly
requires the worker HOME to differ from the dashboard HOME. `ghRead.ts`
constructs `GitHubRequests` once with both the timeout and backoff values.
Its short-bound consumers and the one-shot delivery child environment are
the remaining diagnosis leads.

### 6. Cases held for another reason ask for the live server and say why

Type: Structure
Status: done
Budget: 15 active minutes, excluding commands.

The remaining cases in [MOUNT-TRIAL.md](MOUNT-TRIAL.md): the landed CI and
one-shot landing cases whose own child command inherited the mount's
environment, the read backoff and resumption cases, and
`configuration/project-add-validation.spec.ts` unless slice 1 already
returned it. Trace the backoff failures to their cause first; when the cause
is a setting the server reads once per process, that is the reason and
product timing stays as it is. Each passes
the live request with that cause as its reason, at the call or the helper
that makes the child command, never on a wrapper mounted cases share.
Enables slice 7.

Proof: the listed specs pass on the live default; a search for the free-text
reasons lists every held case, which is the deferred story's input.

The live-default proofs passed all 100 focused cases across two selections.
The same cases passed with a scratch mounted default, with 27 mounted and
80 live starts. Dashboard typecheck passed and the dispatcher was restored
byte for byte. Logs, route evidence, and the searchable held-case list are
under `slice-6-` in Git evidence.

The trial's presumed child environment cause resolved to a synchronous
publication child blocking its mounted HTTP receiver. The backoff and
request owner bounds initialize once in `ghRead.ts`. Quiet closure needs
distinct worker and server HOME values. Some readers reuse a live
predecessor's runner on the same machine. Four scoped Codex starters
reproduced competing native setup reads; the trace did not isolate the
initiating callback in every case.

The CI comparison module remembers final answers by repository and story
identity across machine directories. This is an exception to the trial's
path-scoped cache premise. The affected tests need an empty process and
request one explicitly. The mount and product cache policy stay scoped to
their existing responsibilities.

### 7. Dashboard Backend Test mounts boundary-mode starts by default

Type: Behavior
Status: planned
Budget: 15 active minutes, excluding commands.

Behavior: a backend case starts a boundary-mode server without asking →
the boundaries mount in the worker → its assertions are unchanged. A case
that asked for the live server gets one. E2E Test and Dashboard Frontend
Test keep the live server.

The shared Playwright fixture attaches diagnostics on an unexpected test
status. When it receives a mounted server, attach the available fake GitHub
calls without requesting a child process's output, and guarantee fixture
close even when diagnostics fail. This path must preserve the case's original
failure and restore the worker before it can serve another mount.

Proof: the whole backend suite passes. A case that newly fails gets its
cause found and the live request with that cause, under the failure policy;
it is not skipped or loosened. Record every start's entry and its start and
close time for this run through a temporary recorder and compare with the
baseline row: at least 800 mounted starts and their summed start and close
time under a quarter of the baseline's for the same starts. Alternate the
live and mounted defaults three times over `review/` and record both wall
times. Run `npm run test:dashboard:frontend` and `npm run test:e2e`, since
the start is shared with them, and confirm neither mounted a server.

The retained November 18 baseline is aggregate. For a matched-start
comparison, collect a live-default run on the same implementation with the
temporary recorder's default override, and pair the originally live starts
by case and call order with the starts the mounted default routed in-process.
Explicit mount-only runtime checks keep their requested entry in both runs
and have no live mate. Retain any unpaired rows for review.

### 8. The entry rule names the mount and the live request

Type: Behavior
Status: planned
Budget: 15 active minutes, excluding commands.

Behavior: a developer reads
[which entry a case uses](../../../dashboard/backend-tests/README.md#which-entry-a-case-uses)
→ it says a boundary-mode start mounts in the test process on the stand-in,
how a case asks for the live server and with which reasons, that Cursor
work is such a reason, and that a test's own child command needs its own
environment → the link to this story's migration is gone and the header
comment of `dashboardServer.ts` agrees.

Proof: the README and the fixture comments match the delivered option names;
`npm run lint` passes. The CI comparison in the seed's goal is owed to
target CI: the median `dashboard-backend` test step time over the five main
runs after landing against the five before, read from CI.

## Verification and review

Every slice runs its named specs with
`npm run test:dashboard:backend -- <paths>` under the strict backend
configuration, `npm run lint`, and `npm run --silent typecheck:dashboard`.
Slice 7 runs the three browser groups whole because the shared start
changes its default. Apply the
[consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace),
the shared test-entry selection and the MakeMe convention. Keep default test
timeouts and the
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Local gate uses `caffeinate -s -i` on awake macOS on AC power. On battery,
use the maintained open-lid `caffeinate -i` procedure and sleep-log read
under [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
Other sessions load this machine: classify a local failure by rerunning its
spec alone before reading it as a defect of the change.

## Execution context

- Maria-chan in Story Branch Mode, publisher `dashboard-territory.local-open-dough`.
  Take `0424a7f92c5b86b25c7ed76e0c41bcf03eb26928` was accepted on
  `origin/main` and on `origin/codex/reach-dashboard-backend-checks-through-the-mount`.
  Starting revision `4dfda22b9fd5bb324099e58494f505251185c343`.
- Execution checkout `.worktrees/reach-dashboard-backend-checks-through-the-mount`.
  Integration checkout `/Users/terryyin/git/open-dough`.
- Story branch CI uses GitHub Actions `ci.yml` (workflow 351271804).
  Codex coordinator `Maria-403`, mailbox `/tmp/dough-ci-501/watch-PslrGt`,
  PID 27345, stream session 7526, cell `g149:11`.
- Slice 1 was accepted on the story branch at
  `b4f3b5a2d20430fb328e2fa7fb0d9e2a14f8b8bf` and registered with this observer.
- Slice 2 was accepted on the story branch at
  `d1b17dbaa0798fa256f27a389f2c7f138c9ad7db` and registered with this observer.
- Slice 3 was accepted on the story branch at
  `5986f220a1452459fe4b62c6cd46c7d7e1d840b8` and registered with this observer.
- Slice 4 was accepted on the story branch at
  `4a754c19f05e4e2d0011d22f836936f4d2836512` and registered with this observer.
- Slice 5 was accepted on the story branch at
  `ed000275896c0d2b89ded0d81703c0b2f5c28b30` and registered with this observer.
- Checkout preparation passed the locked npm install, Chromium prerequisite
  check, and dashboard typecheck. Use the Homebrew Bash 5 on `PATH`.

## Story obligations

### G1. Mounted fixture failures preserve their diagnostics and cleanup

Reported: slice 3 — "dashboardTest.ts attaches server.output() on unexpected status before closing the fixture, and mounted output throws."
Story clause: "Each case keeps its product assertion."
Disposition: receiving slice 7

### G2. The output-bound diagnostics start with an empty failure record

Reported: slice 4 — "authenticated-read-output-bound.spec.ts expects one fresh process diagnostic and sees prior entries."
Story clause: "A proof that needs an empty process is a separate-process proof."
Disposition: proved by slice 5: `slice-5-g2.routes` and `slice-5-g2.log.run.json`, paired with the existing one-entry assertion in `authenticated-read-output-bound.spec.ts`

### G3. CI comparison cases start with an empty process cache

Reported: slice 6 — "two later checks expected a pending or unavailable build and immediately read a previous final build."
Story clause: "A proof that needs an empty process is a separate-process proof."
Disposition: proved by slice 6: the final mounted-default selection kept the existing pending-proof and receipt assertions on their explicit live starts, as recorded in `slice-6-final.log.run.json` and `slice-6-final.routes`

## Plan review

Refinement was not needed: each slice has one outcome and one proof loop.
Slices 3 to 6 are Structure so the default can change in slice 7 without a
red suite; each is bounded by a named list in
[MOUNT-TRIAL.md](MOUNT-TRIAL.md) or by the Cursor fixtures. This review
identified no remaining slice-specific concern. Cursor cases stay on the
live server, so the plan does not depend on the stand-in serving them.
