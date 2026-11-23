# Intent read recovery frontend failure

GitHub Actions run 45185973098, attempt 1, job 137731544860 failed in the
frontend test step on published slice 3 commit `cce5ca4466839193eeb42e26e0d1c87f9b450c61`.
The full job log identifies the first pre-deadline assertion in
`dashboard/frontend-tests/intent/intent-read-recovery.spec.ts` at line 78.
The count was 2 after a relative wait of 14,999 ms, with 1 expected.
The shard reported one failed case and 448 passes. The attempt was still
running when that failure arrived. The complete diagnostic is retained in
this checkout's Git evidence directory.

The changes through slice 3 did not edit this test or the read-recovery
code. Slice 4 is parked at its completed independent review in stash
`424d46467dbaa99d47963addeb04151916d12545`.

## Round 1

Hypothesis. Vitest advances fake timers while polling browser assertions.
A poll after the first failed read can spend part of its recovery window
before the test begins the relative 14,999 ms wait. The installed Vitest
poll implementation advances the fake clock by the polling interval, and
the browser provider advances it in 50 ms ticks while a command waits.

Run one focused reproduction on the existing spec with one frontend worker.
If it passes, run one controlled experiment with a 50 ms fake-clock advance
between the settled error assertions and the first pre-deadline advance.
This models one intervening browser poll with the same fake timer APIs.
Compare the assertion and the count with CI, then remove the temporary
advance. The Mac is awake on AC. Recent load ranged from 27.0 to 38.3 on
16 logical cores with 47–49% memory free and other worktree jobs unconfirmed.
Keep the normal timeout and avoid repeating the whole shard.

The ordinary focused run passed all five cases. One intervening 50 ms tick
reproduced the CI assertion with 2 requests and 1 expected, while the other
four cases passed. The terminal records are `repair-intent-r1-baseline` and
`repair-intent-r1-poll-control` in the checkout's Git evidence directory.
Round 1 ended at 2.2 active minutes. The diagnosis found no early retry in
product code. The mounted test counted time already spent by browser polling
as part of a fresh relative wait.

## Repair verification

Anchor each 15, 30, 60 and 60 second boundary to the time the stand-in
observed the request it rejects immediately. Keep the assertions on request
count, error, recovery, and the absence of further scheduled reads after
success. Test the same intervening 50 ms tick once with the repair, then
remove it and run the clean five-case spec once. Use one worker.

Both runs passed all five cases. The timing case observed exactly one
additional request after each checkpoint and stopped retrying after
success. The forced-tick line is absent from the repair. The proof
records are `repair-intent-fixed-poll-control` and `repair-intent-fixed`.
The focused run used mounted Chromium on awake AC macOS with one worker.
No functional or timeout changes were needed.

Publish the repair once. The hosted check should observe one request before
its first deadline regardless of browser polling. Use the story observer
for the applicable final CI result.
