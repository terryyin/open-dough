# Intent location recovery clock

GitHub Actions run 45201461993, attempt 1, frontend shard 1/2 job
137785774233, story revision `9e2ed0796b0b5e06174edfff54965a21b4ccbcea`.
The job showed `expected 2 to be 1` at
`dashboard/frontend-tests/intent/intent-read-recovery.spec.ts:78` during
the 15-second boundary check. It ran one failing case with 455 passing.
The whole attempt was still in progress at initial classification.

Round 1 hypothesis. UI observations advanced fake time after the request
settled. Advancing another fixed 14,999 ms then crosses the due time.
A fixture that keys advances to settlement should keep the no-early-retry
and due-retry observations and complete all four backoff steps. Trunk
commit `2dd0eb94f11f0d21d49f43c3a45bc195fd8d0939` contains this repair.
Reproduce once with controlled observation time if needed, then run the
complete affected spec and named adjacent proof once on the repair. The
repair commit will run once on the existing CI workflow.

Slice 5 work was parked in the established checkout with the managed CI
stash; it does not enter the repair. The failing spec is unchanged from the
claim through slice 4. Full failed job log and diagnostic are in the
checkout's Git evidence directory. Follow the
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).

Round 1 reproduced the same failure once by adding 20 ms of fake time
between the UI observations and the old fixed advance. The instrument
was removed. The recovered test derives each pre-due assertion from the
controlled read's settlement and retains each of the four expected waits.
The repaired file matches trunk's file. Ten mounted Chromium recovery cases
and three authenticated E2E cases passed strictly. Dashboard typecheck
and `git diff --check` passed. Local proof and the reproduction are in
`repair-ci-4-return.md` and its run records in the checkout's Git evidence
directory. Active diagnosis time was 3.4 minutes.
