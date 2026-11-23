# Diagnose native setup interruption

CI run [45098800346 attempt 1](https://github.com/terryyin/open-dough/actions/runs/45098800346), Distribution Tests 3/3, failed on `7227ee7204f05c8ce3fd88b8e96da2d597e9e553`. The native harness expected the SIGINT interruption message after the acquisition descendant became ready and the parent returned 130. The job printed only the setup stage announcement.

The committed story changes do not touch the setup or its native harness. No other execution has established ownership of this exact failure. Slice 6's test-only changes are parked with the installed repair-stash operation. Follow the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).

Round 1 will distinguish a signal arriving after a child has started but before the setup process installs its handlers from a fixture process that exits before the signal. Begin with the handler and fixture ordering. Use a bounded forced timing reproduction that exercises the real entry point, and record its outcome before any additional batch.

## Round 1 experiment

Force the pre-handler window once with SIGINT. The scratch preload wraps the real spawn and delays its return until a separate caller has observed the actual npm descendant, sent the signal, and released the gate. It records the parent handler counts at that point. The probe checks the diagnostic, the exit result and whether the descendant could write after the interruption. A ready descendant with no handler, the same missing diagnostic and a surviving write would distinguish this ordering defect from a fixture process that had already completed. Stop after one run and inspect the evidence.

Run on macOS arm64 with Node 24.21.0 on AC power. The one-minute load at setup was 26.01. The experiment controls ordering rather than relying on load. Scratch files live in the worktree's Git evidence directory. No product or test edits are needed to reproduce.

The forced experiment reproduced the missing Linux CI diagnostic in 1/1 macOS probes. At the gate both signal handler counts were zero and the real detached descendant had written readiness. The parent died from SIGINT (the shell status would be 130), logged only its acquisition announcement, and left the descendant able to write afterward. This disproves a fixture that had already exited for the observed reproduction. Round 1 confirmed a race between spawning the source process and registering interruption handlers. The scratch probe and result are retained as `native-setup-signal-{probe.mjs,race.cjs,before.log,before.exit,before.log.run.json}` in Git evidence.

## Repair proof

The coordinator closed diagnosis after one round and started the separate repair clock. The existing native setup harness will hold the real spawn call until its caller signals the parent. Its stub descendant waits for permission to write so normal fixture completion cannot race the signal. Run the harness once against the old ordering to observe the missing diagnostic. After moving signal registration ahead of spawn, run the same harness once and run the independent scratch probe once per signal. The expected result is a signal-specific diagnostic, exit 130 or 143, and no write by the descendant.

The first harness command stopped before selecting a test because this checkout's shell resolves system Bash 3.2. The corrected run uses Homebrew Bash 5 and limits the maintained runner to one slot for the single test. The failure hypothesis and one-run limit are unchanged.

The corrected harness reproduced the same signature before the product edit. It exited 1 with the missing SIGINT diagnostic and the acquisition announcement alone. The durable test drives the CLI and asserts only the public signal-specific status and diagnostic plus the descendant's inability to write.

After the ordering fix, the maintained harness passed with both interruption cases, along with its existing prerequisite, deadline and source-failure cases. The independent gate saw one handler for each signal before spawn returned. SIGINT exited 130 with its diagnostic and SIGTERM exited 143 with its diagnostic. Neither detached descendant wrote after interruption. Scope was one shell runner slot and one independent probe per signal, sequentially. All local proof used macOS arm64, Node 24.21.0 and AC power. Git evidence contains the run records `native-setup-harness-red.log.run.json`, `native-setup-harness-green.log.run.json`, `native-setup-signal-after.log.run.json` and the consumer trace `native-setup-consumer-trace.md`. The Linux CI rerun remains the publication gate.
