# Prove Cursor runner lifecycle in Node Vitest

**Identity:** SEED-413#prove-cursor-runner-lifecycle-on-vitest

**Source:** [Prove Cursor runner lifecycle in Node Vitest](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-cursor-runner-lifecycle-on-vitest)

## Goal and scope

Give developers changing the Cursor runner fast Node Vitest feedback on its
start, reuse, replacement and shutdown, and on the held clients and session
evidence that survive. Account for all 25 observations in the seven legacy
backend specs before retiring their Playwright selections. Preserve the
runner's behavior. The [campaign coverage map](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#backend-vitest-replacement-coverage)
assigns terminal attach, Cursor turn delivery and the runner cutover to
their own stories. Real Cursor resumption after a runner kill or reboot
remains outside this deterministic proof.

## Current decisions

- Follow the North Star for [directly testable production code](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
  and [plain Vitest for unit tests](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e).
  Keep the build proof in the runner model under [ADR 0002, Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution).
  Runner addresses, kept records and live clients are machine-local under
  [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state).
  Use deterministic fake-agent proof under [ADR 0005, Native validation and A/B testing](../../../docs/adrs/0005-cross-tool-validation-accepted.md#2-keep-deterministic-checks-in-ci)
  and compare retained proof, runtime and support cost under
  [ADR 0010, Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md#decision).
- Reuse production operations found in
  [runnerBuild](../../../dashboard/server/hosts/cursor/runnerBuild.ts),
  [runnerCurrentProof](../../../dashboard/server/hosts/cursor/runnerCurrentProof.ts),
  [runnerClient](../../../dashboard/server/hosts/cursor/runnerClient.ts),
  [runnerPaths](../../../dashboard/server/hosts/cursor/runnerPaths.ts) and
  [terminalBridge](../../../dashboard/server/hosts/cursor/terminalBridge.ts).
  Keep one build-proof decision for all new work. Make it directly callable
  in `runnerCurrentProof.ts` using the current build ID, the typed protocol
  answer and the recorded build proof. An unanswered probe leaves the
  listener alone. An answered mismatch or absent proof takes the existing
  replacement path. Matching proofs take the existing helper check and
  repair path. Start-if-absent and joining an already held client keep
  their existing entry points and effects.
- Reuse the fake Cursor agent and the isolated process arrangements in
  [cursorRunnerProof](../../../dashboard/test-support/support/cursorRunnerProof.ts).
  Call the typed runner operations in the cases that observe runner
  processes, local files or PTYs. Keep the existing narrow development
  boundary process for legacy observations that require two Dashboard
  owners, real Dashboard launch refusal, server close or reconnect after
  that close. This keeps the process whose lifetime is the subject of the
  test. Reuse the WebSocket pair in the bridge case. Keep fake host inputs
  on their current service boundaries and add no shared wrappers. Use
  MakeMe for typed host-session data. Move scenario bodies out of
  `cursorRunnerRestart.ts`, `cursorRunnerLifetime.ts` and
  `cursorRunnerHosts.ts` as their cases move, then delete those modules
  after the last callers go. They serve only the legacy terminal runner
  spec. Retain shared fixture primitives with live callers.
- Use `test` and `expect` from Vitest in the resulting specs. Use
  `test.skipIf` for the existing helper-platform condition. Keep cases
  sequential within a file where fixtures change process environment,
  restore it in cleanup and use private homes. The legacy serial group
  setting can go. Keep the five-second test default for direct runner
  cases. Give all eight terminal cases individual 60-second timeouts
  because they include real boundary process, launch, wait or reconnect
  operations. Those paths approach or exceed five seconds in the
  observations below. Slice 4 found the two-server case at 4.7–7.0 s at
  load about 20, failing three of five runs at the default. Preserve the existing
  separate operation and poll deadlines.

## Decisive premises

Observed on 27 November 2026 in the owned preparation checkout with Node
24.21.0, Playwright 1.65.0 and Vitest 5.1.0, first at `64314e642` and
again after terminal-attach landed at `66d05a5ea`. Both pairs used one
worker, the fake Cursor agent, private homes and awake macOS on AC.
The repeat includes the updated terminal and environment fixtures.

| Premise | Consuming operation and observation |
| --- | --- |
| Existing runner proof selects the seven source specs | The backend command in the local gate selected 25 Playwright cases and all passed in both runs. The initial summed case and elapsed times were 53.098 s and 62.95 s. The repeat took 42.381 s and 45.07 s respectively. |
| Node Vitest can consume the same runner, PTY, files, helper repair and process cleanup | The backend command with the scratch filter below selected only the seven disposable Vitest copies. All 25 passed in both runs, including helper restoration, stale and reused listeners, process shutdown, clean spawn environment, kept keys and reconnect. Initial summed case and elapsed times were 49.410 s and 53.85 s. The repeat took 60.141 s and 65.45 s respectively. All 17 direct runner cases took under 1.72 s with the default timeout. The scratch copies kept the executable paths, protocol, helpers, setups and assertions. |
| Real boundary lifecycle proof needs time for process and launch waits | The seven terminal cases with the longer waits took 3.66–7.13 s across the full Vitest runs. At the default, the refusal timed out at 5000 ms. Its rerun with the individual timeout passed in 5.35 s. The detached prompt varied from 4.12 s to 6.98 s. The restart and waiting cases reached 6.09 s and 5.69 s in the repeat. The two-server ownership case passed with the default at 3.60 s, 4.24 s and 4.85 s. At load about 20 in slice 4 it took 4.7–7.0 s and timed out three of five runs at the default. |
| The real stale-build case distinguishes replacement under the lock | `npm run test:dashboard:backend -- 'zz-scratch-cursor-runner-build-proof\.spec\.ts$' --workers=1 --grep 'a real runner whose recorded proof turns stale'` failed when the stop and spawn branch under the lock was removed. The new exec returned `undefined`. The same case passed after restoration. |

Scratch filter used in the backend command:

```text
zz-scratch-(agent-terminal-cursor-runner|cursor-runner-(build-proof|discarded-start|environment|helper-repair-shapes|last-held|restart-shapes))\.spec\.ts$
```

The temporary production edit and scratch specs were removed. The probes
establish the existing route. Their full-suite times varied by run. The
direct typed decision and final proof selection are execution deliverables.

## Ordered slices

Legacy session filenames below are under `dashboard/backend-tests/sessions`.
The legacy terminal file is `terminals/agent-terminal-cursor-runner.spec.ts`.
Remove each legacy case when its receiving proof passes.

### 1. New Cursor work requires current build proof

Type: Behavior
Status: done
Estimate: 15 active minutes.

Proof: Convert `cursor-runner-build-proof` with its source-closure and
bundled-entry digest and four new-work cases. Its bridge case runs on
Vitest here and moves in slice 6. Move the live unrelated listener and
stale-after-ensure cases from `cursor-runner-restart-shapes` to
`sessions/cursor-runner-current-proof.spec.ts`. Exercise the build
decision directly with typed proof values in that focused spec. Keep
the process cases for whether new work starts an agent, uses the new
PID, or leaves the existing PID and client, including concurrent
replacement. Move the Dashboard refusal case to
`terminals/cursor-runner-start-admission.spec.ts` and verify its unavailable
answer and empty agent call/attach logs. An accepting process without a
valid answer stays running. A wrong or absent proof on an answering
runner requires one replacement before exec. Start-if-absent leaves it
in place.

Delivered: `runnerBuildProofDecision` in `runnerCurrentProof.ts` returns
`leave-alone`, `replace` or `check-helper` with the recorded address and
reported helper. Dispositions: six build-proof cases stay converted in
place; restart-shapes unrelated-listener and stale-after-ensure moved to
`cursor-runner-current-proof`; the refusal moved to
`cursor-runner-start-admission` (6.35 s). Focused Vitest 12/12, remaining
legacy Playwright 9/9, affected E2E 4/4. A mixed backend selection prints
only Vitest output; read Playwright counts from the proof record.
CI repair after slice 1 (run 45929593535): the Codex alerts spec now
applies a new reading at the next poll, so one poll never mixes two.
CI repair (run 45930129765): Vitest `expect.poll` waits 1 s where
Playwright waited 5 s, so carried-over polls give an explicit
`{ timeout: 5_000 }`. Later slices keep that legacy deadline.

### 2. Restore the terminal helper on the same runner

Type: Behavior
Status: done
Estimate: 8 active minutes.

Proof: Migrate the three `cursor-runner-helper-repair-shapes` cases. Keep
the real helper file and compare its recorded and reported paths,
including a deleted wire helper and the two startup ensures before later
work. New work repairs the file or recorded path and keeps the runner and
client PIDs. A subsequent Cursor launch or keep works on that same runner.

Delivered: the three cases converted in place with `test.skipIf`. Vitest
3/3 twice at load about 35, each 3.4–4.4 s under the five-second default.

### 3. Recover a dead runner and retain held-session evidence

Type: Behavior
Status: done
Estimate: 12 active minutes.

Proof: Convert the two dead-address cases that remain in
`cursor-runner-restart-shapes` and the `cursor-runner-last-held` case.
After a runner dies, the stale address and a new listener on its old
port cannot substitute for a live runner, and a fresh runner can keep
the same conversation. Observe the last-held file after keep, explicit
hangup and sudden death. Use the real runner and read the kept key
through the production file reader. Browser proof retains automatic
revival and its Done, never-held and failed-revive controls.

Delivered: both dead-address cases and the last-held case converted in
place, Vitest 3/3. They needed no scenario bodies from the shared modules.

### 4. Give one machine home ownership of its runner

Type: Behavior
Status: done
Estimate: 10 active minutes.

Proof: Convert both `cursor-runner-discarded-start` cases and move the
two-Dashboard case to `terminals/cursor-runner-process-ownership.spec.ts`.
Starting two servers for one home leaves one runner with its own process
group, and closing one of those servers leaves that runner running. A child
whose starter directory is already gone exits cleanly. Removing the
requested home after startup leaves no runner there or in the ambient
home. Observe process groups, exit result and directories using the
existing process primitives.

Delivered: discarded-start cases converted in place; the two-server case
moved to `cursor-runner-process-ownership` with a 60-second timeout
(5.19–6.34 s at load about 21). Its scenario body left
`cursorRunnerLifetime.ts`.

### 5. Start Cursor with the developer shell environment

Type: Behavior
Status: planned
Estimate: 7 active minutes.

Proof: Convert `cursor-runner-environment`. Start the real runner with
the deployment additions and use `execOnRunner` and `keepCursorClient`.
Observe the successful exec and kept outcomes, and the fake agent's
actual command and PTY environments with `developerShellViolations`.

### 6. Rejoin the same held client after a Dashboard restart

Type: Behavior
Status: planned
Estimate: 15 active minutes.

Proof: Move the three restart cases and the held versus resumed bridge
case to `terminals/cursor-runner-rejoin.spec.ts`. Observe the same PID
accepting terminal input after the Dashboard stops, both when working
and when awaiting an answer. A held trust prompt stays unconfirmed
through restart until the same client is ready. Directly bridge a held
client on an accepting stale runner, then bridge a different session
and observe its fresh resume on the current runner.

### 7. Close Dashboard attachments according to their owner

Type: Behavior
Status: planned
Estimate: 12 active minutes.

Proof: Move the detached-prompt and cross-host close cases to
`terminals/cursor-runner-dashboard-close.spec.ts`. Closing the
Dashboard leaves the detached Cursor client ready to continue, and
ends attached Claude Code and Codex clients. Observe the scoped
signals and process liveness after the real Dashboard has stopped, using
`codexEndOnceGone` for the Codex attachment.

### 8. Resume after deliberately stopping the runner

Type: Behavior
Status: planned
Estimate: 9 active minutes.

Proof: Move the final terminal runner case to
`terminals/cursor-runner-stop.spec.ts`. With a saved chat and a held
client, stopping the runner sends hangup, ends the old client and
removes the address. Opening the terminal again resumes the same
conversation in a fresh client. Remove the empty Playwright file,
verify former wrapper callers are gone, and run the full focused gate.

## Proof ownership and local gate

The slices account for 8 + 3 + 3 + 3 + 1 + 4 + 2 + 1 legacy cases.
Record the disposition of each and select zero backend Playwright cases
in their paths. Apply the shared
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Use `npm run typecheck:dashboard` for changed typed production and
specs. If production proof changes, trace its consumers and run the
affected existing [replacement](../../../e2e/sessions/cursor-runner-replacement.spec.ts),
[revival controls](../../../e2e/sessions/cursor-runner-replacement-controls.spec.ts)
and [helper survival](../../../e2e/sessions/cursor-runner-helper-survival.spec.ts)
E2E proof alongside the focused Node cases. The current Playwright
selector listed four cases in those three files.

Use awake macOS on AC under `caffeinate -s -i` per
[AGENTS.md](../../../AGENTS.md). Compare the one-worker result against the
baseline, rerunning a comparable pair if the revision or load changed.
Record engine and case counts, per-case and summed case times, and
elapsed selection time. Set `backend_proof` to a disposable output path
before running the gate.

```sh
legacy='(sessions/cursor-runner-(build-proof|discarded-start|environment|helper-repair-shapes|last-held|restart-shapes)|terminals/agent-terminal-cursor-runner)\.spec\.ts$'
receiving='(sessions/cursor-runner-current-proof|terminals/cursor-runner-(start-admission|process-ownership|rejoin|dashboard-close|stop))\.spec\.ts$'
caffeinate -s -i env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u OPEN_DOUGH_DASHBOARD_BACKEND_SPLIT -u FORCE_COLOR -u NO_COLOR OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD="$backend_proof" /usr/bin/time -p npm run test:dashboard:backend -- "$legacy|$receiving" --workers=1
```

## Plan review

Slice-plan refinement was unnecessary after assigning each observation to
its runner outcome. The eight slices have focused proof and fit the
active-time limit. The preparation found no remaining slice-specific
concerns. The build proof remains one rule for new work, with startup
and held-client joins following their existing ownership.
