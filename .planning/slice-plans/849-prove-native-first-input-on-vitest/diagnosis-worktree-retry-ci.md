# Diagnose the worktree-update retry CI failure

- Registered branch revision `075273945e40df16be58719e50909cedb945feec`.
- GitHub run [45803717275, attempt 1](https://github.com/terryyin/open-dough/actions/runs/45803717275), job [dashboard-backend shard 1/3](https://github.com/terryyin/open-dough/actions/runs/45803717275/job/139853461137).
- `agent-launch-update-worktree-retry.spec.ts` received a failed acceptance
  when applying the updater to the kept worktree. CI logged the result kind
  and assertion at line 162. The reason and explanation were omitted by the
  matching assertion. The other 267 Node cases in this shard passed.
- The current story uses the fixture as plan evidence and incorporates the
  sibling's `08a530c46` change to its typed setup through merge `ef0e5de2b`.
  The current migration made no edits to this retry spec or production retry
  code. No active writer was identified for the same repair.
- Parked slice 7 at 5.7 active minutes with two typed specs and one real-worker
  E2E spec uncommitted, stashed through the workspace repair command.
- First trial checks the exact spec once under the locked setup and captures
  the typed refusal reason if observed. If it does not reproduce, inspect
  the apply helper and retained worktree preconditions against CI. Require a
  discriminating failure before accepting a cause.
- Raw CI excerpts and job log are in this worktree's Git evidence directory.
  Follow the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).

## Round 1

- Baseline trial on macOS, Node 24.21.0, one worker, load about 5.42 on
  16 logical cores and on AC. The original fixture with a typed acceptance
  diagnostic passed 2/2 in 4.76 seconds wall. No natural recurrence in one
  run. Evidence is `retry-ci-focused.log.run.json`.
- Next experiment is one controlled trial of the persisted-before-owned
  ordering. Temporarily hold the promise returned by the real `keepAttempt`
  after it has saved the worktree-update refusal. The fixture's original
  durable-state wait should finish while the typed owner still sees the
  attempt running. The retry should fail before invoking the updater.
  Observe the full typed refusal, then release the hold before drain.
  This tests the published product and exercises a precise ordering rather
  than repeating timing-dependent local tests. Remove the injected hold
  after the diagnostic and keep it only in the evidence.
- The one injected trial reproduced CI's visible acceptance mismatch. The
  durable record already contained the worktree-update refusal. The typed
  attempt still showed `running: true` and had no outcome. The direct retry
  returned `failed/refused` with “This start does not need an Open Dough
  worktree update, so Update worktree and retry did nothing.” The updater
  had no opportunity to run. The diagnosis used the production write and
  observed server state. The hold only delayed when the owner received
  completion of that write. The reason for the CI refusal was not printed,
  so its exact message remains unverified. The local trial explains the
  CI's observed assertion on an allowed ordering. Evidence is
  `retry-ci-held-settlement.log.run.json` and the saved injection patch.
- Proposed repair changes only the test precondition. Wait for the owner
  that serves retries to report its settled worktree-update refusal and
  verify the durable refusal separately. Retain both original test journeys.
- Post-repair experiment is one replay of the injected order. The original
  durable wait still reaches the persisted rejection. The new owner wait
  observes the pending attempt, releases the controlled settlement, and
  must wait for `running: false` and the refusal before starting the retry.
  The updater must still run once in the kept worktree and resume the same
  attempt. Restore the uninstrumented fixture after the replay and run
  both named retry cases once.
- The injected replay passed 1/1 after the owner wait was added. The wait
  observed the not-yet-settled owner before releasing the hold. All
  original successful retry assertions passed after settlement. Evidence
  is `retry-ci-held-settlement-fixed.log.run.json` and its saved patch.
- The final fixture drops the injected hold, waits for the same typed
  owner outcome and independently checks the durable reason, update flag
  and explanation. A future unexpected acceptance retains the full typed
  response in its test diagnostic. No product behavior changed.
- Final uninstrumented proof is one targeted backend run of both retry
  cases, then Dashboard typecheck. A subsequent same-branch CI run is the
  coordinator's broad gate. Its hypothesis is that replacing the durable
  readiness signal with owner settlement removes the race. One run
  should pass the retry in its usual backend shard.
- Final targeted proof passed both Node cases in 6.14 seconds wall on
  the awake AC Mac, one worker and load about 3.71. Success still applies
  the updater once at the exact kept path and resumes its attempt. Refusal
  still preserves the worktree evidence and never dispatches. Evidence is
  `retry-ci-fixed.log.run.json`.
- Consumer trace `retry-ci-consumer-trace.md` confirms that the changed
  precondition and diagnostic are local to this spec. The existing plan
  link points to the revalidated proof, and shared commands and flags
  retain their behavior.
- Round 1 used 2.5 active minutes. The repair clock is separate from
  diagnosis and the parked implementation slice.
- Dashboard typecheck passed. Evidence is `retry-ci-typecheck.log.run.json`.
