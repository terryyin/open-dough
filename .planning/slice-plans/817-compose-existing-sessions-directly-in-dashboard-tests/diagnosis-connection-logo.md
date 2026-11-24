# Connection-logo animation CI diagnosis

CI run 45428320615, attempt 1, frontend shard 1/2, job 138566326794.
The published slice 1 revision was `5829eec98da09d77b32a4bc44a5fda6e5da3f703`.
In `dashboard-connection-logo.spec.ts:182` the replay animation remains at
`/opendough-knead.svg?play=_r_2_-2` after the test advances fake time.
The first animation returned to still. The mounted spec and ProductMark code
are unchanged by slice 1. No other repair owner is recorded.

Slice 2's four specs are parked in the checkout's managed CI stash. The
complete failed job log is in execution evidence
`ci-45428320615-frontend-1.log`.

## Round 1

Hypothesis: a loaded asset's `naturalWidth` and resource entry can become
observable before the React `onLoad` playback effect starts its timer. The
fake-time advance can then happen before the 3,780 ms timer exists. Run one
focused experiment with the load/effect boundary controlled. Preserve both
animation cycles, later still icon, and no restart on ordinary updates.

The mounted Chromium case reproduced the CI assertion once locally. A capture
listener held the replay image's native load from React while the original
image dimension and resource timing assertions passed. The original 4,000 ms
advance ran against that state. Replaying load afterward left the same replay
URL at the final still-icon assertion. The retained `ci-45428320615-logo-held-load`
patch and run record identify the forcing step and failure. Round 1 used 1.2
active minutes. The Mac was on AC power with load around 4 of 16 and no competing
proof owned by this execution.

## Repair proof

Hypothesis: waiting for each playback's timeout to be scheduled before advancing
fake time handles that same ordering. Run the held-load replay once with the
repair. Then remove the capture and run the complete logo spec once with native
load delivery. Keep both animation resource assertions, each return to the
still icon, and the no-replay check on ordinary updates.

The held-load replay passed with the repair under the same early clock
advance. The complete logo spec passed with native load delivery after the
capture was removed. Dashboard typecheck and `git diff --check` passed.
Execution evidence is in `ci-45428320615-logo-repair-return.md`. The repair
changes only test synchronization and leaves ProductMark's playback intact.

[Failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)

Branch CI hypothesis: synchronizing the image load with fake time prevents
the recorded replay failure under shard load. Observe one automatic attempt
for the repair publication and diagnose any repeated failure before retrying.
