# Distribution shard 1 exhausted the shared deadline

The [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md) applies.
[Run 45370933189, attempt 1](https://github.com/terryyin/open-dough/actions/runs/45370933189/job/138364868319)
tested `a20b0fbcd119a96d726095a3c1d013bde5077586`. After about 15 seconds of
setup, the test step had 305.7 seconds before the runner enforced the cutoff.
Four preparation files were interrupted between 1.1 and 5.2 seconds after
starting: the Nerds, owned context, reuse, and stops cases. Five further files
had yet to start: story left queue, handoff, native session record, publication,
and session record. No earlier assertion failures appeared in the job log.

Trunk commit `49e2b24ff52c199c6310555e242e4aa34c96d332`, which the story
merged after its earlier green run, assigned both long native comparison
baseline checks to the same shard as execution and preparation. They used
82.7 and 79.2 job-seconds in the failed run. The test-time artifacts recorded
1,218.4 job-seconds in shard 1 through the cutoff, compared with 695.7 and
482.9 for the two complete shards. Successful main runs 45369419406 and
45365142269 recorded 520.0 and 495.4 job-seconds for shard 3 with this
pattern on shard 1.

Round 1 replays the actual CI selector's path order on four slots, using the
failed run's measured job times and earlier measured durations where the
deadline cut an observation short. It projects the original shard 1 at 311.7
seconds, with the same preparation family reaching the cutoff. It projects
271.3, 174.7, and 166.0 seconds after moving the two comparisons to fallback
shard 3. This is a scheduling model based on CI measurements. The next
automatic branch run tests the headroom under real hosted conditions.

The repair removes the explicit pattern from shard 1. The runner's selection
still covers each of the 653 tests once. Only the two native comparison
tests move. The workflow selector and CI proof declaration passed all 16
focused tests. The three CI jobs, coverage, setup, and deadlines are unchanged.
The timings, selector outputs, and replay are retained with the archived split
evidence in the common Git directory under
`open-dough/evidence/SEED-426-ad-hoc-cutover-handoff/deadline-repair`.
Round 1 used 2.3 active minutes.
