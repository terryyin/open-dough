# Execution evidence

## Execution resume context

- Mode: story-branch; owned linked checkout and originating execution location:
  `/Users/terryyin/git/open-dough/.worktrees/answer-fake-github-reads-without-a-process-per-c`,
  branch `codex/answer-fake-github-reads-without-a-process-per-c`.
  Optional default checkout: `/Users/terryyin/git/open-dough`; it is not the execution location.
- Identity: `SEED-332#answer-fake-gh-reads-in-process`; publisher
  `dashboard-territory.local-open-dough`; assigned agent `philip-chan`.
  Established start reused without another claim. Starting revision:
  `7089d5d688f528e552fc1f5d34f9a48398d8de84`; accepted claim and current candidate:
  `9f56540bd83b175a2ab974aad8d6ce1e9f8c66ec` on `origin/main`.
  First increment base is that accepted claim. Execution publication targets
  `origin/refs/heads/codex/answer-fake-github-reads-without-a-process-per-c`.
- Setup: locked `npm ci` completed in this checkout, then
  `npm run typecheck:dashboard` passed on 2026-11-13. Check-only pre-commit
  runs staged lint and script-triggered dashboard type-check; selective formatter
  is `npm run format`.
- CI: GitHub Actions `ci.yml`, verified active workflow 351271804 (`CI`).
  Coordinator `seed332-philip`, observer `/tmp/dough-ci-501/watch-xHjBHF`,
  PID 6241, stream session 69344, yielded cell `g330:10`; runtime is this
  checkout’s `.agents/skills/dough-execute-plan`. Story-branch observer covers
  increments; trunk claim coverage is `pendingCi: unobserved`.
- Replanning: preserve ordinary planning authority; no explicit denial, numeric
  slice target, hard limit or exception was supplied.
- Expensive-proof decision (2026-11-13 10:06 local, this macOS host): AC power,
  load 7.22/10.86/19.18, 56.85% CPU idle, compressed memory 21 GB. Other
  worktrees include active SEED-324 and SEED-334 executions. Focused two-worker
  checks may proceed under `caffeinate -s -i`. Command owner rechecks load,
  memory and competing work before long/repeated proof. No local natural-load
  30–50 acceptance is established. Full-suite admission remains mandatory.

Hosted baseline artifacts retrieved to `/tmp/seed332-hosted-baseline-43336803436` (all thirteen per-spec time files).

## Slice 1 acceptance

Freshness: source-freshness check returned unchanged at trunk/base `9f56540bd83b175a2ab974aad8d6ce1e9f8c66ec`; no incoming named sibling work exists in that empty range. Source-only comparison inspected original triggers and clauses against actual setup, code and assertions.


All implementation edits are uncommitted. CLI remains the installation default.
No production source, timeout, runner, answer model or managed installation changed.

## Owned paths

- dashboard/tests/support/fakeGhTransport.mjs: existing NUL argv and byte-frame
  client using local HTTP, bounded independent stdout/stderr, single settlement,
  abort/error/response-close cleanup, synthetic diagnostics, no call PID.
- dashboard/tests/support/fakeGhPreload.mjs: consumer-only scoped owner spawn
  injection with explicit --import; only that owner's gh api execution changes.
  Native unmatched overloads and promisification remain native.
- dashboard/tests/support/fakeGh.ts: explicit cli/in-process selection, env preload
  propagation and direct-worker activation. CLI remains default.
- dashboard/tests/support/dashboardServerOptions.ts and dashboardServer.ts:
  optional ghTransport propagates the explicit opt-in into a spawned server.
- dashboard/tests/support/inProcessAuthenticatedRead.ts: same optional selection.
- dashboard/backend-tests/support/fakeGhInProcess.ts: poisoned API executable,
  native auth, private fake/owner lifecycle and raw transport observation.
- dashboard/backend-tests/runtime/fake-gh-in-process.spec.ts: actual owner byte,
  rate-limit/admission/sharing/isolation/lifecycle observations.
- dashboard/backend-tests/runtime/fake-gh-in-process-wire.spec.ts: raw argv and
  stdout/stderr/exit/framing/failure contracts.
- dashboard/backend-tests/runtime/fake-gh-in-process-activation.spec.ts: spawned
  boundary activation, owner preload compatibility and real deadline cleanup.

Coordinator owns PLAN.md and source-review.md; these are not implementation edits.
Projected formatted line counts: owner spec 250; wire 110; activation about 110;
transport 141; preload 57; helper 102; edited pre-existing support <=245.
No selective formatting, hook lint, refactoring, commit or push was performed.

## Proof

1. `OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed332-slice1-proof.json caffeinate -s -i npm run test:dashboard -- backend-tests/runtime/fake-gh-in-process.spec.ts backend-tests/runtime/fake-gh-in-process-wire.spec.ts backend-tests/runtime/fake-gh-client.spec.ts backend-tests/runtime/fake-gh-client-lifecycle.spec.ts backend-tests/observation/authenticated-read-turns.spec.ts backend-tests/observation/authenticated-read-shared-waiters.spec.ts backend-tests/observation/authenticated-read-subprocess-lifecycle.spec.ts --workers=2`
   Terminal exit 0; strict passed; 40 selected/passed; 16.174 s. Native control
   paths/assertions and their setup stayed unchanged after this run. This observes
   actual CLI PIDs/SIGTERM/SIGINT/curl cleanup, auth holds, real shared waiter
   departure, eight native turns and native subprocess deadlines.
2. `OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed332-slice1-final-proof.json caffeinate -s -i npm run test:dashboard -- backend-tests/runtime/fake-gh-in-process.spec.ts backend-tests/runtime/fake-gh-in-process-wire.spec.ts --workers=2`
   Terminal exit 0; strict passed; 15 selected/passed; 14.787 s. This is the final
   owner/wire candidate after moving raw byte proof, extending exact owner argv
   with Unicode/newline header text and matching synthetic failure stderr.
3. `OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed332-slice1-activation-bound-proof.json caffeinate -s -i npm run test:dashboard -- backend-tests/runtime/fake-gh-in-process-activation.spec.ts --workers=2`
   Terminal exit 0; strict passed; 3 selected/passed; 7.233 s. Final activation
   candidate proves spawned boundary opt-in with poisoned gh, unmatched native
   callback overload plus auth/API promisification, and a real request bound
   canceling a held in-process HTTP call.
4. `npm run typecheck:dashboard`: final terminal exit 0, including all three specs.
5. `git diff --check`: passed.

Each JSON record carries actual locations, cases, durations and terminal verdict.
The first exploratory three-file run lacked its tool continuation handle; it was
not used as proof. Its ambiguity was superseded by retained terminal observations.

## Setup and independent observations

- fakeGhInProcess fixture installs fake gh in a private root, unlinks its hardlink,
  then writes a wrapper that records and exits 99 for every api call while native
  auth delegates to the committed fixture. A passing read with apiLaunched=false
  cannot have taken the CLI API path. The helper restores environment, disconnects
  consumers, ends real owner processes, closes fake HTTP and removes owned roots.
- Owner spec `the real owner receives exact argv...`: independently declared raw
  byte array survives bodyEncoding/base64 and expected --include-prefixed argv;
  no pid file or recorded call.* process entries exist.
- Wire spec raw-byte/empty-stream/UTF-8/nonzero tests compare independent Buffer
  expectations and exact error code/stderr; malformed frames are explicit invalid
  byte strings. Each malformed frame is also rejected through real GitHubRequests.
- Owner rate-limit test observes status 429, retained headers/body and real refusal
  of the following route without a second fake call. Eight-turn test observes
  eight arrivals, a refused same-connection marker after queued ninth, then ninth
  arriving only after release. Setup holds answers; owner establishes admission.
- Shared-read test gives two actual consumers the same held route, crosses a
  marker on the staying consumer's socket, aborts one, observes one unanswered,
  releases and sees the staying body. Last waiter departure then returns the fake
  to zero unanswered; teardown checks actual owner PIDs are gone.
- In-process boundary close and spawned boundary activation hold a genuine
  authenticated request, observe fake arrival and absent PID/poison record, close
  the real boundary/server, then observe zero unanswered HTTP requests.
- Isolation test observes different private roots and owner PIDs with different
  answers, then the first answer after nested second-owner cleanup.
- Activation `real request bound...` warms the owner, holds another route, sees
  arrival, receives timed-out from the real request deadline, sees zero remaining
  HTTP calls and no poisoned executable invocation.

## Consumer trace and limits

`node .agents/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout . --base HEAD --term fakeGhEnv --term installFakeGh --term ghTransport --term runFakeGh --term transport --term startDashboardServer --term startInProcessAuthenticatedRead`
Output and each row's run/excluded disposition: /tmp/seed332-slice1-consumers.md.
The new fast mode reaches only new explicit callers; existing consumers retain
CLI. Ordinary preview/dev/browser/default rollout, custom clocks, full dashboard
suite, natural-load 30–50 repetitions and hosted comparison remain slice 2.
No slice-1 promise is knowingly omitted.

One new test failed because it expected missing ghPid() to be 0; the actual helper
contract is undefined. Correcting that test defect to assert no PID was followed
by a complete passing activation replay, then final three-case activation proof.
No assertion was removed or relaxed relative to the intended absence of a PID.

Expensive-proof basis: AC macOS host, two workers under caffeinate -s -i; before
broad focused selection natural load 4.39/5.98/12.24 and 37% memory free. Other
worktree browser work remained active; no burners or full-suite launch. This is
functional proof, not natural-load acceptance or a hosted headroom claim.

Independent refactor: `/root/refactor1` inspected changed concepts, tests and records; returned `none — already clean`, no edits/tests, `## REFACTOR COMPLETE`. All accepted observations and consumer dispositions remain unchanged. Every current changed file is below 250 lines; formatted owner spec projects 250. Delivery freshness again unchanged at claim SHA; no incoming named sibling changes. Delivery is pending.

Shard preview: `node scripts/test-shares.mjs preview --split-count 13 --spec-dir dashboard` passed; 1024 jobs, 956 recorded and 68 unrecorded; shares predict 978.9–988.4 job-seconds. New activation/wire/owner specs deal to shares 8/9/10. Full preview: `/tmp/seed332-shard-preview.txt`. Worker count and deadlines are unchanged; these sums predict work, not runner capacity.

## Mechanical formatter correction return


Corrected no-await answerers to Promise.resolve, typed the known owner-record
shape, used array keys for numeric admission input, consumed the wire request,
narrowed caught deadline errors from unknown, and normalized preload arguments
without parameter mutation. Added explicit braces in the implicated files.
Moved the existing missing/remote/closed/interrupted endpoint case from the
owner spec to the wire spec; its setup/observations are unchanged. No new
behavior, scenario, assertion weakening, timeout or production change.

Renewed proof:
`OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed332-slice1-mechanical-proof.json caffeinate -s -i npm run test:dashboard -- backend-tests/runtime/fake-gh-in-process.spec.ts backend-tests/runtime/fake-gh-in-process-wire.spec.ts backend-tests/runtime/fake-gh-in-process-activation.spec.ts --workers=2`
Terminal exit 0, strict passed, 18 cases. Typecheck `npm run typecheck:dashboard`
also completed exit 0. `git diff --check` passed. Native control source, setup and
observations are unchanged; the earlier native-control proof remains valid.
Current authored lines: owner 231, wire 142, activation 112, helper 115,
preload 61, transport 148. Coordinator owns formatting/lint and plan evidence;
none were invoked or edited by this correction. All changes remain uncommitted.
Host before the focused run: natural load 30.07/31.35/27.44, 49% free memory,
AC sleep guard retained. This single functional selection is not the named
loaded-repeat acceptance gate.

Source freshness after correction: unchanged at claim SHA, no incoming named sibling work. Fresh independent `/root/refactor1_corrections` returned `none — already clean`, no edits/tests and `## REFACTOR COMPLETE`; same accepted consumer scope and proof. Moved endpoint observation pointers now name wire spec. Final pre-delivery freshness unchanged at claim SHA. Renewed guarded delivery pending.
