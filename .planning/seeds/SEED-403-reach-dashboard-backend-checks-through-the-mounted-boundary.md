---
id: SEED-403
status: active
planted: 2026-11-18
planted_during: Terry set the dashboard backend entry at the mounted boundary and asked to queue the migration as one story
trigger_when: selected from the backlog
scope: one story
---

# SEED-403 — Dashboard backend checks reach the mounted boundary

<a id="reach-dashboard-backend-checks-through-the-mounted-boundary"></a>

### Reach dashboard backend checks through the mounted boundary

**Identity:** SEED-403#reach-dashboard-backend-checks-through-the-mounted-boundary
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/710-reach-dashboard-backend-checks-through-the-mount/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"3b1a222f6d3e5ea9cc9ace57d17f50cb8688ec60629bfdab6f89d9dc81b33fad","plan":"4d2081d0a49cd44e4202d7542f5d3086c5b4b67ce15d3bb851f03f92326636ca"}}
```

**Goal:** A developer changing a dashboard server rule, or waiting for
Dashboard Backend Test, gets the same answer the boundary gives — status,
body, files written, and whether a host was asked — from the boundaries
mounted in the test process, with a stand-in for the Cursor runner. A
boundary-mode case reaches that mount without being rewritten: the start it
already calls mounts the boundaries, and a case whose proof is a separate
process, a live connection, or the server program asks for the live server by
name. Those live-server proofs stay.

The rule is
[which entry a case uses](../../dashboard/backend-tests/README.md#which-entry-a-case-uses).
Judge the gain under
[ADR 0010 — Definition of improvement](../../docs/adrs/0010-definition-of-improvement-accepted.md).
The beneficiary is whoever waits for Dashboard Backend Test. The baseline is
the 2026-11-18 run below. The result worth keeping is the same passing cases
with their assertions unchanged, at least 800 of the run's boundary-mode
starts mounted, their summed start and close time under a quarter of the
baseline's for the same starts, and a lower median `dashboard-backend` test
step time on CI across the five main runs after landing than the five
before. A local wall time is evidence only when both entries alternate in
one sitting.

**Scope:**

- A boundary-mode start mounts every local boundary except the incident
  record lifecycle on an HTTP server the test process owns, in the project
  environment and machine directory the case names, and hands the case the
  controls it has today: the fake GitHub and its calls, the synthetic hosts,
  and the time controls.
- The mounted start uses the Cursor runner stand-in. A case that proves
  Cursor work asks for the live server with the real runner, as a
  separate-process proof: stopping the runner signals the process its
  address names, and a stand-in's address names the test worker.
- A case asks for the live server when its proof is one of the three kinds
  the entry rule names. The request states which kind. This includes a second
  server running beside a mounted one, a server left running or killed, and
  the incident record, whose lifecycle belongs to a process.
- A case that fails on the mount for a reason outside those three kinds also
  asks for the live server, naming that reason, so it keeps its proof. The
  two known reasons are a test's own child command inheriting the mount's
  environment, and a time setting the server reads once per process.
- Dev and preview starts are unchanged. So is a boundary-mode start made by
  E2E Test or Dashboard Frontend Test: only Dashboard Backend Test mounts.
- Each case keeps its product assertion. A browser workflow stays in E2E
  Test. A presentation case stays in Dashboard Frontend Test. A lower function
  stays the entry where the rule already allows it; this story moves no case
  below the boundary.
- The entry rule in the README names how a case asks for the live server.

**Deferred:**

- Returning the cases held on the live server for a reason outside the three
  kinds. On 2026-11-18 these were about 35 cases in the landed CI and
  one-shot landing folders and the read backoff specs.
- Moving a preview-mode case whose fact is not the preview.
- Mounting one boundary alone for a case that needs only that boundary.

#### Evidence from 2026-11-18

All figures are from this worktree at `901d7c3b9`, two workers, on a machine
other sessions were loading (load average 7 to 16).

- One Dashboard Backend Test run made 1,110 live-server starts across 339
  spec files for 1,755 cases: 1,028 boundary-mode (831 production, 197
  development), 76 preview and 6 dev. Their start and close time summed to
  532 s of 2,116 s of case time.
- Interleaved in one worker, six rounds each: a live boundary server with the
  real Cursor runner started in 358–595 ms, the same with the stand-in in
  157–358 ms, every boundary mounted in process with the real runner in
  426–665 ms, and every boundary mounted in process with the stand-in in
  2–4 ms. The runner is the larger part of a start, and a mount that still
  starts it gains nothing.
- A scratch change routed boundary-mode starts to an in-process mount with
  the real runner, one mounted server at a time. 953 of 982 boundary starts
  mounted; 1,667 of 1,755 cases passed unchanged, 73 failed in 58 files, and
  29 starts in 15 files were a second concurrent server. The failures were
  process identity, restart and shutdown, the incident record, a test's own
  child command inheriting the mount's environment, and backoff timing.
- The same scratch change with the stand-in, over the 1,634 cases that do
  not name Cursor: 900 starts mounted with a median 6 ms start and 3 ms
  close, 40 s in sum; 1,545 cases passed unchanged and 74 failed in 59 files,
  in the same classes. A whole-suite run on the stand-in ended abruptly
  while a Cursor case ran. `stopCursorRunner` signals the pid in the runner
  address, which for a stand-in is the test worker.
- Alternating the live and mounted entries three times over 136 passing
  cases in `review/`: wall time 145, 108 and 116 s live against 91, 97 and
  85 s mounted. Across whole-suite runs under different load, case time did
  not fall, so only a paired or CI comparison shows the gain.

**Key examples:**

- A Java intent read asks which `.java` files a location admits → its start
  mounts the boundaries in the test process → the listing, the admitted file
  text, the 404 for a refused path, the 400 for `..`, and the absence of a
  contents fetch for a refused path are unchanged, and no server process or
  Cursor runner started.
- A project-list case in the production environment runs in a worker that
  earlier mounted the development environment → its start mounts production
  → the seeded project ids, a foreign origin's 403, POST's 405, and
  `Cache-Control: no-store` are unchanged.
- A launch case accepts a launch for the synthetic `claude` → mounted, with
  the runner stand-in → the answer, the launch record under the case's
  machine, and the host's calls are unchanged.
- A case watches a server's pid, a preload, a restart that must be a new
  process, or the incident record of a killed server → it asks for the live
  server as a separate-process proof → those facts remain observable.
- A case answers a launch from a second server on the same machine → the
  second server is a live server beside the mounted one → both answers are
  unchanged.
- A case hands a start to the Cursor host → it asks for the live server with
  the real runner → the Cursor work is unchanged. A case that reaches the
  runner while mounted fails naming the unexpected Cursor request.

#### Architecture

- **One project environment per server.**
  `server/projectConfiguration.ts` keeps the environment for the life of the
  process and refuses a second one. A mounted server holds its environment
  until it closes, and the next mount chooses again. A running server still
  cannot use both.
- **The test process is the machine while a server is mounted.** The server
  reads `HOME`, `PATH` and its settings from the process environment at
  request time, so the mount sets them for its lifetime and restores them at
  close. One server is mounted at a time in a test process. A child command
  the test itself runs inherits that environment unless the test gives it
  one.
- **Server module state outlives a mount.** Held documents, locks and
  caches are keyed by paths under the case's machine directory, so a new
  machine directory is a clean slate. A proof that needs an empty process is
  a separate-process proof.
- **The incident record lifecycle is not mounted.** It takes the process's
  termination signal and ends its record at process exit.
- No Accepted ADR governs which entry a test uses. ADR 0010 sets the basis
  above.
