# Shared frontend HTTP teardown repair

[Active plan](PLAN.md) · [Rendering evidence](render-evidence.md)

## Owned failure and actual cause

Owned SHA `2023e15064b9756f20f5e0b14b6743a50d162590`, run 42644250988
attempt 1, failed dashboard job 129253111726. Complete inventory has 17 terminal
jobs and exactly one failed job/case. All seven assertions in the cancelled
Landed/no-later-result case passed. Teardown then spent 30 seconds waiting for
comparisonServer.close; page, routes and context had not yet been torn down.
All six HTTP requests visible in its trace had completed. The trace does not
identify the held socket; no precise CI socket identity is claimed.

Moving that particular case to SSR did not fix the shared helper: the same
frontendAppServer implementation still served six retained counter rules,
seven lifecycle rules, three new live bindings and ordinary frontend clients.
Source inspection and an actual Node24 helper probe demonstrated a reachable
cause: an accepted zero-byte TCP connection stays live after server.close stops
listening. Its close promise remains pending until the client is released.
The probe observes server acceptance/getConnections and real close events,
without waiting for wall-clock time, then always releases every owned resource.

The lifetime owner now initiates server.close(callback), then calls Node's
closeAllConnections. This stops acceptance before releasing held connections;
the callback remains the sole completion/error authority. Ordinary static
serving, fallback, public API, fixture ordering and timeouts are unchanged.
Existing sibling test servers already use this standard Node operation.

## Independent regression and affected consumers

The new runtime spec uses the actual helper and real HTTP/TCP sockets, with
positive server acceptance before shutdown. Technical HTML/CSS/zero-byte input
is the exact protocol under test, not arranged product data or a fake server.
It observes the public close promise through default expect.poll, then awaits
real server/socket/client close events before any manual peer release. It
accepts asynchronous implementations rather than requiring synchronous socket
destruction. Always-finally restoration/cleanup also completes on the RED path.

Removing only the repair makes that exact final regression fail at the default
five-second assertion bound; shutdown took 4,908 ms, while ordinary serving and
error propagation passed. After restoration, three strict passes observe
shutdown 117/151/149 ms and serving/error 20/19/20 ms, all retry0. The other
case checks actual CSS bytes/type/status, nested SPA HTML fallback and real
ERR_SERVER_NOT_RUNNING rejection from a second close. No timeout, retry,
skip, sleep, platform exception or synchronous-only contract was added.

Affected proof passed strictly: 32 cases, runner 38.710 s, comprising all 16
live comparison cases, seven frontend-app files/12 cases, two retained real
Done/Taken acquisition journeys and the two new runtime cases. Two further
18-case passes (9.223/9.130 s) repeat all 16 live cases and the new pair.
The later cleanup enhancement changes only the new regression's failure path;
its final exact RED and three GREEN passes are the current body above.
Dashboard typecheck and whitespace passed.

The artifact-demand GET/close caller is accounted for by the same actual-helper
HTTP/close contract; it is not falsely claimed as separately run. Its shared
build/acquisition owner is unchanged and default-build inputs are exercised by
the frontend consumers. Both installed consumer traces disposition every
located caller. Independent post-change refactoring found no further edit or
uncovered consumer; standard Node calls need no new cross-server framework.

## Resource and preservation boundaries

All commands ran in the execution checkout at accepted base
`2f5b6a3ff18a1f93bcb46f0745646c5c2a36c417`, Node24.21.0/Homebrew Bash5,
awake AC96%, under `caffeinate -s -i`. One unrelated one-worker test run was
left with its owner; this repair sequenced bounded one-worker proof. Historical
loads were 7.01/9.61/7.11 then 4.66/6.35/6.25 and 6.29/6.32/6.24, free memory
73%. These are local conditions, not a remote headroom claim. Every owned
process, socket and temporary directory was confirmed cleaned at handoff.

Official CI preservation returned clean/no entry before repair:
`/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/dough-ci-repair-stash-cd9Un4/record.json`.
Root retains actual formatting/cap, single repair publication and official
restore. The observer generation and expired predecessor are recorded in
execution-evidence. Final CI is not inferred from the local proof.

Formatting found Node's generic events.once result needed its actual Socket
tuple type. The annotation repair emits byte-identical JavaScript (4,362 bytes);
no operation or expectation changed. Existing executed proof remains applicable.

Repair `4f095a7f1c422a1976c61b7773237d1cdab07b4c` was accepted and registered
on the replacement observer. Official restore returned resumed, OID null,
applied false/dropped null; the previously clean checkout lost no work.
Exact receipts: `ci-server-close-delivery-repaired.log` and
`ci-server-close-restore.log` under the evidence directory below.

## Historical failure audit and current checkpoint

Retained older run 42631269357 attempt1 had two failed jobs: the adapter Taken
variant's broad h3/h4 selector, and the unsafe argv type. Run 42634202936
attempt1 failed only that same argv type. Both complete 17-job inventories and
all three whole logs establish exact cause correspondence, not inference from
test names or later passing runs. Existing 817cb heading and 2023e argv repairs
cover them; no additional failure is omitted.

Run 42668027365 at 2f5b6a3 has all 17 jobs reporting success in its exact-attempt
API record. All 12 reports contain 2,453 expected passes/eight source-declared
skips, zero unexpected/flaky/global errors and retry0. That later green does
not settle the old teardown defect; the actual current-helper counterexample,
causal repair and regression above do. Its timing checkpoint separately leaves
four static rendering cases above the strict target (G8), plus slice7's known
lifecycle/counter work. G1/G3/G4/G5 and final target CI remain open.

## Inspectable evidence

Under `/tmp/seed286-execution-20261109/`:

- `ci-42644250988-triage.md`, complete job inventory/log and exact trace summary;
  `ci-42644250988-server-close-probe.{mjs,log}` observes current shared liveness.
- `ci-42644250988-repair-return.md` and `repair-proof-summary.json` retain the
  literal commands, positive acceptance/setup and each observing assertion.
- `ci-42644250988-shutdown-final-{red,green-1,green-2,green-3}-proof.json` and
  consumer GREEN1/2/3 receipts retain all terminal outcomes, including RED.
- `ci-42644250988-refactor-return.md` and all consumer disposition records
  retain actual caller correspondence and the no-edit refactor decision.
- `ci-older-failure-audit.md` retains both older full inventories/log checksums
  and repaired source-blob correspondence.
- `ci-42668027365-jobs.json`, artifact metadata and twelve HTML/times ZIPs,
  `slice6-ci-global-status.json` and `ci-42668027365/test-envelopes.json` retain
  current assertion success and the independent still-open timing bounds.

## Qualified first repair publication outcome

The observer's recovered event3 names4f095a7/run42674414222 attempt1 failed.
Full exact API inventory has15 successful jobs/steps; lint and test3/3 never
started. The actual workflow requires17 unconditionally and is byte-identical
through742f80b. The [run annotation](https://github.com/terryyin/open-dough/actions/runs/42674414222)
explicitly records GitHub's “Internal server error”, correlation
ae5fff5c-2c2d-4427-99c8-ec940a7b2ee9. Internal dispatch detail remains unknown.
This is proved provider workflow failure; there is no failed test/assertion or
source repair justified. Preserve the failed original outcome and missing2-job
coverage; never claim4f passed or rerun it until green. Full diagnostics and
annotation are retained in `ci-42674414222-diagnosis.md` and its raw responses.
Current66f6a8d and742f80b each have separate complete17-job success; they provide
current coverage without rewriting the earlier failure or its cause.
