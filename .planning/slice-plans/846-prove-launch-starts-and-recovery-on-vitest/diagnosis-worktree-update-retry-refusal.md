# Worktree update retry refusal

Follow the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).

## Round 1

[Run 45798389009 attempt 1, backend shard 1/3](https://github.com/terryyin/open-dough/actions/runs/45798389009/job/139834868547)
failed one of 216 tests on branch candidate `7984549d478bc4213f3841f171764ca028dbfe7f`.
The updater refusal case received `failed/refused` without
`worktreeUpdateNeeded`. The job log omits the actual explanation as a matching
object excerpt. The maintained spec last changed in the earlier reporting
migration `daa4334d4` before this story's Take. Trunk's later `08a530c46`
adapts the initial `attemptRun` invocation and imports its native argument.
That edit is separate from the readiness check. This execution owns the
failure on its registered revision. Slice 5 stays in its managed stash.

Hypothesis: after the final attempt file is atomically replaced, a separate
read can observe the new outcome before the owner finishes persisting it and
updates its in-memory answer. The test polls the file before calling the
updater, whose guard reads the owner's answer. Hold exactly that final
replacement after the real rename and let the original refusal test assert
its response once. The proof variant releases the held write when the
fixture asks the owner to drain. A whole-setup repair should complete that
drain before reading the persisted outcome and calling the updater. Stop the
scratch batch after one original attempt and one repaired attempt. Keep the
regular maintained test focused and verify both cases once after the repair.

Local proof runs on arm64 macOS with installed Node 24.21.0, AC power,
`caffeinate -s -i`, one Node test worker and no Chromium selections. At
18:18 SGT the one-minute load was 22.77 on the shared host with other work
active. Run the focused commands sequentially and reconsider before any
broader or repeat run.

The first scratch command failed in the probe itself before reaching the
updater. Its parser assumed a flat attempt array, while the real storage
partitions that array by source. Correct the probe to read the source groups
and run one before-fix trial with the same hold and the same finish criterion.

The corrected single probe matched the hosted failure. The actual retry
response explained that Update worktree and retry did nothing because the
start did not need the update. The original case failed on the same missing
`worktreeUpdateNeeded` field. The rename gate held the real write before it
returned to `launchAttemptSettlement.note`, where the in-memory answer is
updated only after the durable write settles. The setup's file poll could
return during this interval. `LaunchAttemptOwner.attempts` prefers the
owner's current in-memory attempt, and the updater guard rejects that
attempt before attempting the release helper.

The ownership contract deliberately keeps in-progress answers through
durable write completion. The first repair trial uses `AgentLaunches.drain`
to test if it provides the needed setup cue. Evidence is
`worktree-update-retry-before-corrected.log`, the adjacent exit/run record
and JSON in worktree Git evidence. The probe generator is
`worktree-update-retry-interleave-source.py`.

The first repair trial established that `AgentLaunches.drain` closes admission
as part of Dashboard replacement, so it cannot prepare another retry. The
probe reached the updater call and received 503. The maintained setup now
waits for the same owner observation the updater consults via
`AgentLaunches.attempts`, then checks the durable refusal separately.
The next scratch trial will hold the same final rename, show that the
first owner observation is still running, then release. The setup must
observe settlement and reach the same actionable refusal and retained
worktree assertions. Run one trial and retain its input and output. The
older generator reproducing the no-update explanation is preserved as
`worktree-update-retry-interleave-before-source.py`.

With the corrected setup, the first owner read during the held replacement
reported `running: true` with no outcome. After release, setup observed the
settled refusal from the owner and the durable record, then the retry
reached the updater and returned the required flag and actionable refusal.
The unchanged assertions verified that the updater did not force a reinstall,
no native launch occurred, the missing install stayed missing, and the kept
start and trunk stayed as they were. Both maintained Node cases passed
without scratch instrumentation. The success case applied the updater to the
exact kept checkout and resumed the same attempt with one native dispatch.
See `worktree-update-retry-after-owner.log` and
`worktree-update-retry-maintained.log` with adjacent run, exit and proof
files. The proof recorded two maintained Node selections and zero Chromium
selections. The scratch probe is retained in Git evidence and removed from
test discovery.

The diagnosis paused after round 1 of 3 at 2.3 active minutes. The repair
used its own `repair-worktree-update-retry-refusal` clock and paused at 4.0
active minutes. Independent review accepted the fixture change without edits.

Publish the repair once and observe the exact ordinary story-branch CI
attempt. The backend shard should exercise both retry cases successfully
with owner settlement observed before calling the updater. Stop after that
attempt and inspect any new failure. The bounded frontend capture may also
observe the ordinary frontend shard in this workflow.
Dashboard typecheck, a read-only Prettier check of the spec and
`git diff --check` passed. The exact hosted repair candidate remains the
coordinator's delivery gate.
