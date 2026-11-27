# Diagnosis: ci-held-transfer-deadline

## Failure
- CI run 45983348006 attempt 1, job 140452561340 "dashboard-backend / shard 2/3", revision f9cc29d42 (slice 3); passed on 0610901 and d1e4063 CI.
- Signature: `shared-verified-origin-trunk.spec.ts:167 > a transfer held past the read deadline is ended and the next open starts a new check` → `Hook timed out in 10000ms` at `releaseWhenFinished` (onTestFinished), plus run lifecycle: left `git ... ls-remote --exit-code --refs -- origin refs/heads/main` and its two `hold-upload-pack` shells (up 01:06).

## Reading of the evidence
- The gate passes call 1 (first demand's probe) and holds every later call until released. Call 2 is the first demand's fetch (held, ended by the deadline through `fetchGitTransport`). Call 3 is the reopened demand's *probe* (`ls-remote`) — held, which is what `heldAgain` observes. Same order before slice 3: the probe always preceded the fetch. Slice 3 does not change which call reaches the hold.
- The case releases the reopened probe only in its finish hook, with `signalFifo(releaseFifo, false)` (non-blocking). `heldAgain` resolves when the gate closes `held-upload-pack`, before the gate runs `read -r _ < release-upload-pack`. If the hook opens the release FIFO before the gate opens it for reading, the open fails `ENXIO`, `signalFifo` returns silently, the gate stays blocked, the reopened demand (no deadline aborted, fresh controller) never settles, and the hook awaits it until 10 s. The left processes are exactly that reopened probe chain.

## Hypothesis H1 (round 1)
Test-side release race (ENXIO swallowed) in the case's teardown, not product. Experiment: temporary diagnostic edit — `sleep 1` in the gate between writing `held` and reading the release FIFO, widening the window; run the single case once. Prediction: deterministic hook timeout + lifecycle leftovers matching CI. Stopping count: 1 run (deterministic forcing).
- Result: reproduced, matching signature (load 13.6–17, macOS, single spec, `npm run test:dashboard:backend -- shared-verified-origin-trunk.spec.ts`): the case `×` with `Hook timed out in 10000ms` and the lifecycle check reporting the left `git ... ls-remote ... origin refs/heads/main`. Other cases in the spec passed. 1/1 forced. H1 confirmed. Evidence: `$EV/heldrepro-1.log`.
- Hypothesis from the brief (slice 3's warm path moved the hold onto a non-owned probe so the deadline abort never returns) refuted: the stalled demand did return (`stalled` settled); the hang is the reopened demand's probe, held by design and never released.

## Fix (test-only; no product cause)
The case now releases the held reopened probe in its body with a blocking `signalFifo(releaseFifo, true)` (blocks until the gate opens the FIFO) and asserts the reopened demand observes the verified trunk. Proof plan: with the `sleep 1` instrument still in, 1 run must pass (forced window); then without it, 5 repeated runs of the spec all pass with no lifecycle leftovers, plus the focused route once.
- Proof: forced window (`sleep 1` instrument in) with the fix: 1/1 pass, exit 0, no lifecycle leftovers (`heldfix-forced.log`). Instrument removed (no temporary diagnostic edits remain). Repeats without instrument: 5/5 spec runs pass, every case passed, no leftovers (`heldfix-rep1..5.{log,json}`; load ~13–17). Focused route (5 specs, 23 tests) passed strict (`heldfix-focused.json`). `typecheck:dashboard` exit 0. Consumer trace (base a58ebe3): no consumers (test file only) — `heldfix-consumer-trace.txt`.

## Open product question (not this failure's cause; unverified)
The Board probe `remoteBranchHead` → `runGit` (`execFile` with `signal`) is not on the owned transport runner. On a deadline abort during a held probe, `execFile` rejects promptly (so the check does end), but the transport helper chain may outlive Git. Next discriminating experiment: a case whose gate holds the first call (the probe), aborts the deadline, and asserts the run lifecycle leaves no `hold-upload-pack` shells. Not attempted in this round.

## Round summary
Round 1, cumulative ~2 active minutes. Cause confirmed (test release race), fixed in the test; no parked changes; no unrelated defects found besides the open question above.
