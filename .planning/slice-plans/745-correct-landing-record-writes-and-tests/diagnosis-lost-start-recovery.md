# Lost Start session recovery in hosted CI

Round 1 began from the clean published execution review revision
`5c0a1a5fa3363f03967421ce8b6fd0837f259a88`. There was no saved stash entry.
The governing [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
applies to this repair and each proof.

Run `44853956929`, attempt 1, job `136691606200` (backend shard 1/3) tested
accepted implementation `1e9fb0cbd4d864ba1942e87982136492ec0547cf`. The
after-workspace case at `agent-launch-start-session-lost.spec.ts:88`
received `undefined` in a property matcher after restarting the server.
The initial attempt inventory had one unfinished shard. Evidence is
`ci-44853956929-1.json` and
`ci-44853956929-job-136691606200.log` in the worktree Git evidence.
No exact other repair owner was identified.

Initial hypothesis: the test stops the original server and its installed
Start command at a boundary where the kept record used by the assertion
can be absent or read before it is durable. The launched branch and later
Continue assertions remain required. Inspect the real start persistence
order and the exact stopped process before deciding whether this is a
product state-loss defect or a fixture expectation. Try one focused
reproduction under the normal local timeout. If it passes, change the
experiment to a controlled persistence or lifecycle interleave before
another run, and retain the experiment and stop count here.

The exact after-workspace case passed once locally, with Node 24.21.0 on
macOS, AC power, and one worker. See `lost-start-local-baseline.log.run.json`
and `lost-start-local-baseline.json` in the worktree Git evidence directory.
The workspace hold marker can only follow the original server's successful
write-ahead `keepSessionStart`. The current test begins an asynchronous
graceful server close, then immediately terminates the held start process.
`scriptSession` removes the start when the still-live server observes a
non-prepared child outcome. This is a different event from losing the server
while the start was unanswered.

Controlled experiment, one run only: identify the originally present
write-ahead record before either process is stopped. Terminate the held
worker while leaving the original server live until that exact record is
removed. Then close and restart the server and let the original assertion
observe the result. If the CI signature matches, stop diagnosis, restore
the instrumentation, and hand the cause to the repair boundary. A different
failure or a passing run requires reconsidering the demonstrated mechanism.

The controlled run reproduced the hosted signature once. The original
journal lookup succeeded while the installed start was held, then proved
absent before the old server closed. The original post-restart matcher
received `undefined`. See `lost-start-child-first.log.run.json`,
`lost-start-child-first.json`, and the exact single-use
`lost-start-child-first.patch`. The instrumentation was reversed.
The completed hosted attempt inventory in `ci-44853956929-1-final.json`
names this single failure.

Cause confirmed: the test's child termination can outrun its graceful
server termination. An installed start that finishes without a prepared
receipt gives the still-live server legitimate grounds to remove its
journal. The fixture must instead crash the owned server with the start
still held. The existing fixture teardown waits for the server to exit
before ending remaining group members. Once teardown returns, it is safe
to release the hold for Continue. This keeps the original assertions.

Repair proof hypothesis and stop count: on the owned preview server's
abrupt stop, its held start cannot deliver an unreadable answer to its old
parent. The existing fixture close waits for the leader and remaining
group members, then the test releases the hold for Continue. Run the
before-workspace and after-workspace cases once each in one focused local
batch. Require the original journal lookup, same recovery attempt, original
workspace/branch arguments, native launch, cleanup, and untouched
default-checkout changes. Then one applicable hosted CI run can check
this same process ordering under the scheduler that exposed it. Reuse
these bounds for the terminal CI acceptance; on another comparable
failure, inspect the new signature before ordering a further run.

Round 1 used two active diagnosis minutes by the controlled-run receipt.
The before-workspace and after-workspace cases each passed strictly on
the first repair attempt. Their durations were 2.77 s and 3.04 s in the
one-worker local run. See `lost-start-repair.log.run.json` and
`lost-start-repair.json`. The existing owned-preview crash precedent is
`e2e/launches/agent-launch-second-server-orphan.spec.ts:85`. The
repair affects only this spec's server teardown sequence, so no production
or shared fixture contract requires additional local tests.
