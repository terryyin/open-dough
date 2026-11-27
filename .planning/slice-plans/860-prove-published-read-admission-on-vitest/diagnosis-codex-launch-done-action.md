# Codex launch session action CI diagnosis

[Failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)

## Round 1

- Registered Story Branch revision `687b3ba2e8e453d6a195bf71eb6ef9d8d0ba3601`.
  [CI run 45983367855, attempt 1, E2E shard 1 job 140452764582](https://github.com/terryyin/open-dough/actions/runs/45983367855/job/140452764582).
- In `e2e/launches/agent-launch-codex.spec.ts`, the shared-host journey
  sees first input accepted, observes Working and sees Open terminal.
  Its first attempt to expose Mark as done stays at zero elements through
  the assertion at line 136. The diagnostic log and trace location are
  retained in `ci-45983367855-attempt-1.json` in the checkout's Git proof
  directory.
- This candidate changes the backend proof selection and the pinned file
  dispatcher, without changing the session menu or fixture. A prior
  distinct Codex journey at `2827eb3e6` reproduced a press before the
  published Board finished reading. It supplies a hypothesis and an
  existing settled-page witness for comparison. The current case's cause
  still needs an observation.
- Investigate request/menu timing versus action eligibility. Inspect the
  exact CI trace and relevant local readers if available. Use a single
  focused controlled observation of the original failure under a known
  unsettled transition if the diagnosis supports it. Stop after that
  observation and reassess if the failure differs. Verify a repair with
  the full failing journey and the touched consumers once before
  delivering a candidate for one push-triggered CI observation.
- Slice 5's six paths are parked in the owned repair stash
  `937bfb9bb23596b7f1f1e3225d28b8f1fbf56d96`. The current evidence includes
  the completed slice 5 focused proof and uncommitted implementation report.
- The exact trace comes from artifact `e2e-failure-output-1` (15190562038)
  and is retained as `codex-action-ci-trace.zip` in the Git proof directory.
  Calls `fgyj@4421` and `fgyj@4423` find one More session actions button
  with `aria-expanded=false`. At `fgyj@4425` (190684.380 ms), Enter
  lands while Story C still has `story-card-starting` and a disabled
  startup fieldset. The disclosure remains collapsed after the press.
  The published A and B plan reads begin at 190998 ms and reconciliation
  is reported at 191239 ms. The action remains absent even after release
  because the test sends only one press.
- The local test holds the same A plan read immediately before revealing
  publication. It waits for the held read and observes Open terminal
  disabled, presses through the existing session-actions object, then
  releases the read, observes Open terminal enabled, and checks for the
  original Mark as done button. Prediction is the same zero-element
  assertion after reconciliation. One run at one worker, then reassess.
- Confirmed in one controlled run on the AC macOS host at one worker and
  default timeouts. Open terminal was disabled when the session action
  was pressed and enabled after the held read was released. Mark as done
  stayed at zero at the original assertion despite reconciliation.
  `codex-action-forced-before.log.run.json` records the failure and
  `codex-action-forced-before.patch` retains the temporary instrument.
  The diagnosis clock paused after one round and 4.3 active minutes.
- The repair waits on the existing Open terminal action in the same
  protected frame before pressing Enter. Use the same held plan once to
  observe protection, release it, wait for Open terminal to become
  enabled and observe the Mark as done button. Then remove the
  instrument and run the full matching journey once to verify the final
  working tree. Stop for diagnosis if either check fails.
- The held-plan case passed once with the repair. Open terminal was
  disabled while the A plan was held and enabled after release. The
  existing disclosure then revealed Mark as done and the remainder of the
  full journey passed. Records are `codex-action-forced-after.log.run.json`
  and `codex-action-forced-after.patch`. The temporary instrument has been
  removed.
- The final working-tree diff changes only the existing Open terminal
  presence assertion to enablement before the press. The uninstrumented
  focused proof passed the one complete Chromium journey on its first
  attempt (14.906 s case, 19.89 s wall). The test selection was
  `caffeinate -s -i npm run test:e2e -- launches/agent-launch-codex.spec.ts -g 'shared host choice uses own installation' --workers=1`.
  See `codex-action-final.log.run.json`, `codex-action-final.json` and
  `codex-action-consumer-trace.md`. The shared action helpers and their
  consumers remain outside the diff. The next CI proof is the one
  push-triggered run on the accepted repair revision.
