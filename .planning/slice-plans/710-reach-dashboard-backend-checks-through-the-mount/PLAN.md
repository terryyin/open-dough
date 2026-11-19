# Enable opt-in mounting for dashboard backend checks

**Identity:** SEED-403#reach-dashboard-backend-checks-through-the-mounted-boundary
**Source:** [Enable opt-in mounting for dashboard backend checks](../../seeds/SEED-403-reach-dashboard-backend-checks-through-the-mounted-boundary.md#reach-dashboard-backend-checks-through-the-mounted-boundary)
**Source review:** [Source-only review](source-review.md)

## Goal and scope

An explicit boundary-mode request mounts the local dashboard boundaries in
the test worker on the Cursor stand-in. The existing Java, project list and
Claude acceptance assertions hold. Cases that need a live process can name
their reason per start. Live is the default.

The developer authorized closing this opt-in outcome after the sixth
delivered slice. Original slices 7 and 8, including the adoption and timing
gates, belong to [SEED-408](../715-default-dashboard-backend-checks-to-the-mounted-boundary/PLAN.md).
The existing opt-in evidence and production entry contracts apply independently.

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

## Verification

The focused Dashboard Backend Test selections, dashboard typecheck, and lint
passed at delivery for each retained slice. Local proof used the project's
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
and the [macOS sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
with `caffeinate -s -i` on AC.

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
- Slice 6 was accepted on the story branch at
  `73f859a5da6e9e45f6bb6c194693b23e685f713c` and registered with this observer.

## Story obligations

### G2. The output-bound diagnostics start with an empty failure record

Reported: slice 4 — "authenticated-read-output-bound.spec.ts expects one fresh process diagnostic and sees prior entries."
Story clause: "Existing cases with Cursor, separate-process, connection, server-program or other demonstrated fixture requirements can explicitly request the live server and state why."
Disposition: proved by slice 5: `slice-5-g2.routes` and `slice-5-g2.log.run.json`, paired with the existing one-entry assertion in `authenticated-read-output-bound.spec.ts`

### G3. CI comparison cases start with an empty process cache

Reported: slice 6 — "two later checks expected a pending or unavailable build and immediately read a previous final build."
Story clause: "Existing cases with Cursor, separate-process, connection, server-program or other demonstrated fixture requirements can explicitly request the live server and state why."
Disposition: proved by slice 6: the final mounted-default selection kept the existing pending-proof and receipt assertions on their explicit live starts, as recorded in `slice-6-final.log.run.json` and `slice-6-final.routes`

## Execution complete

Product advice: Keep the opt-in mount and live default. The developer
requested closing this delivered outcome and queueing the remaining migration
separately. SEED-408 carries the adoption decision and the unfinished proof.
