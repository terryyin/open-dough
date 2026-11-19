# Linux arm failures

[CI run 44432359216, attempt 1](https://github.com/terryyin/open-dough/actions/runs/44432359216/job/135252647345)
failed Distribution Tests (2/3) at `73370177aae75fc48653479d18386e847fe49594`.
The complete provider inventory in Git evidence
`ci-44432359216-1-followup.json` confirms exactly these three failures.

- Cleanup journey timed out waiting for the interrupted entry to finish.
- Supplier watch and unblocked supplier stopped at the arm's initial load
  observation, before materialization.
- The 51 named macOS checks passed before publication. CI runs Ubuntu;
  the local Colima runtime is Linux ARM64 with 8 CPUs and about 16 GiB RAM.

## Round 1

Slice 2's nine catalog edits are parked under the CI stash receipt. Reproduce
the three failing checks once on the published repair base, using the
repository's CI container. The initial-load hypothesis is that Linux rejects
`sysctl -n vm.loadavg` and the background arm propagates the nonzero status.
The separate interrupt hypothesis is that terminal INT or forwarding fails
under Linux process-group semantics. If the cleanup timeout reproduces,
identify the scenario, traps and process state before changing it. Keep any
instrumentation in disposable test inputs. On a repair, run the affected Linux
checks before publishing and retain the results here.

The first container invocation reproduced both supplier aborts at the same load
line, once each. Cleanup passed in that invocation. On the same Ubuntu image,
the existing load pipeline exited 1 under `pipefail`, and `/proc/loadavg`
provided the three Linux load averages.

For the unresolved cleanup result, run an instrumented copy of the cleanup
journey in the same Linux image with the shell check environment installed.
Stop at the first matching timeout or after four trials. Capture the failed
scenario, entry and host process groups, signal masks, and wait state before
the fixture cleans up. This tests whether group INT is ignored, or delivered
without successful reap. Preserve the exact maintained test and its bounds.
The first launch reached no check because the host shell expanded the mount
suffix as a parameter modifier. Correct the mount syntax for the same batch.

The corrected launch stopped at trial 2. Trial 1 passed all interrupts.
Pair INT in trial 2 matched the CI timeout. The entry and two arms were
waiting, and both detached hosts were still blocked in their FIFO reads.
The entry's signal mask ignored INT and TERM at the timeout. This is
consistent with its interrupt handler having installed the ignore traps.
Run up to four more diagnostic trials, stopping on the first timeout, with
probes inside the copied entry and arm signal handlers. This distinguishes
a missed forwarding signal from a forwarded signal whose arm trap cannot run.
The first probe launch reached the pair's committed-basis guard. Include the
instrumented files in the disposable fixture commit and start that batch once.

With the guard satisfied, the first three probe trials passed. Pair INT in
trial 4 returned 130 while a host survived. Extend the diagnostic to persist
trap receipts outside the work directory so entry cleanup cannot erase them.
Capture the arm PIDs and masks immediately before terminal INT and show the
receipts when either a timeout or host survivor occurs. Stop on the first
failure or after four trials.

The four receipt trials completed. On every pair INT, Linux Bash 5.2 armed
INT in both async arm shells. Both entered their supervisor's INT handler
before or during the entry's forwarding, then entered the TERM handler too.
The earlier timeout and survivor show the hazard of concurrent handling on
that same process boundary. The round ended at 6.3 active minutes.

## Repair

The arm launch now gives each arm a group of its own using the project's
test runner job-control pattern. The entry receives terminal INT and sends
one TERM to each active arm, then waits for cleanup. The arm disables monitor
mode before spawning its detached host, and the caller retains its original
monitor setting. Use the available Node runtime to read load averages with
the same three two-decimal fields on macOS and Linux.

Run the original three Linux tests once against both changes. They should
complete all interrupt cases and run both supplier journeys through load
capture. After they pass, use the receipt instrument for up to eight Linux
trials, stopping on any failure or an arm entering the INT handler. Verify
the same touched boundaries and the three retained records on macOS.

The three original failing checks passed once in the Linux CI container.
All eight instrumented Linux trials passed. The entry returned 130 for
both terminal INT scenarios and 143 for targeted TERM in each trial.
Each trial recorded four arm TERM handlers and zero arm INT handlers.

Run one macOS batch with the repaired boundaries: early-exit cleanup,
single and controlled supplier journeys, concurrent and sequential pairs,
frozen capture, reuse, fallback and incomplete evidence. The expected
result is ordinary retained evidence and successful historical recovery,
with no change to tracked comparison records.

The macOS batch reported the default 180-second safety deadline in the
baseline reuse and baseline misses checks. The other nine had no reported
failures and the batch did not reach recovery. AC power and the sleep guard
held and the sleep log supplied no sleep event. Natural pre-launch load was
14.95 on 16 CPUs with 55% of 48 GiB free. Retain unmodified limits and inspect
slow test progress before attributing those timeouts.

Arm isolation changed another ownership assumption. Bash `$$` remains the
entry PID in an arm subshell, so a host still attached to the arm group can
look detached when compared to the entry group. Force one known sampling
before detachment and check the group receipt in one local probe before
changing group ownership.

The forced sample observed arm 69401 while the host was still attached.
The old observer recorded 69401 as the owned host's group, but the host
detached into group 69406. Capture the actual supervisor PID before Bash
command substitutions and use its group for both host and controller
detachment. The shared termination helper uses its actual Bash caller PID
for its caller-group guard for the same reason. Run the forced sample once
again and require the owned-group receipt to match the detached host.

The repaired sample saw arm 21534 before detachment and recorded the
host's actual group 21543. In one paired probe, give the real termination
helper a FIFO-blocked child in its caller's group, first at the failed
revision and then with the guard repair. The owned child should stop and
the calling shell should remain able to finish. Run the earlier Linux
selection and the newly affected shared teardown consumers once after
the guard change.

The real caller-guard probe ended its caller with 143 at the previous
revision and stopped only the child with caller status 0 after the repair.
The final container batch passed all 15 named checks, including the three
original failures, both baseline checks, and the shared deadline consumers.

Repeat the macOS selection once after the group-ownership change under the
same four-job setting and default per-job deadline. Record the elapsed and
outcome receipts and instrument only top-level pair boundaries in disposable
copies of the two long checks. The hypothesis is that corrected ownership
allows the interrupted or slow arm paths to retire normally. Record the
last reached pair boundary if either test still fails. Recover the tracked
records independently.

The four-job repeat again hit the safety deadline in baseline reuse and
baseline misses, and reached the same limit in the baseline export check.
Eight other checks passed. The two instrumented tests advanced through
successive real acquisitions every 24–33 seconds until expiry. There was no
stalled arm in the captured progression. The macOS guard remained active and
the sleep log showed no event. Compare one identical frozen baseline capture
on the failed revision and the repair under the same current host conditions.
Run one capture per version, preserving setup, turn, and wrapper durations
to distinguish a new arm regression from common fixture work.

At comparable macOS loads of 17.13 and 17.77, equivalent single captures
took 11.80 seconds at the published revision and 10.56 seconds repaired.
Both retained an assessment pass, three two-decimal load figures, and
all four turn durations. Repaired preparation took 2.3 seconds versus 2.1,
and repaired journey time was 9.0 seconds versus 9.6. This single sample
does not show added arm latency.

Run the three affected archive checks plus the incomplete-pair check in a
disposable checkout of the exact published base, once with four jobs.
This tests whether assembly of many fresh arms under simultaneous local
jobs can exhaust the unchanged safety deadline independently of the
repair. Preserve per-check timing and outcomes. At the decision the Mac
was on AC, with natural load 13.15/19.02/17.27, 56% of 48 GiB memory free
and another worktree's dashboard run visible. The repair clock held
5.7 active minutes.

The published-base batch passed all four checks at observed launch and
finish loads of 9.52 and 12.52. Its archive checks took 118.8, 116.0,
and 93.6 seconds. The host load dropped compared with the late interval
of the failed repair batch, so this does not reproduce that contention.
Run the identical four-job selection once in an equivalent disposable
checkout with the repaired three source files. Preserve elapsed and
outcome receipts, and keep the same per-job budget.

The matched repaired selection passed all four. Its launch and finish loads
were 12.80 and 20.01. Misses, reuse, export and incomplete took 166.4,
162.9, 138.8 and 88.3 seconds. The base passed at lighter loads, so those
two batches do not isolate a performance delta. Both larger macOS runs
remain failures. The affected checks have direct passing results in the
final Linux selection and in focused macOS selections. No timeout change or
claim of repaired archive-suite timing follows from these observations.

The local performance boundary is repeated fresh supplier-arm acquisition
within the baseline export, reuse and miss checks. Profiling could separate
fixture materialization and launch cost from the assertions that need each
acquisition. Keep the full credible comparison proof and the safety
deadline. This finding does not justify another broad repeat in this repair.

All three retained comparisons recovered the pinned historical case bases.
The tracked comparisons diff against the Take was empty.

Before the next story-branch publication, the candidate hypothesis is that
one entry-owned signal route and portable load capture settle the three
hosted job failures. Observe one ordinary CI attempt on that candidate;
classify any new failure rather than retrying the same attempt.

Apply the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
