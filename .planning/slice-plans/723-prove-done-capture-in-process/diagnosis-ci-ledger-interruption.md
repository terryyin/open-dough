# Ledger interruption CI diagnosis

GitHub Actions [run 44674580679, attempt 1](https://github.com/terryyin/open-dough/actions/runs/44674580679)
reported a failure in Distribution Tests 3/3 at `da878033e`. The
test `interruption after durable spend and before submission never resends`
received the successful spend acknowledgement and found the durable intent.
The subprocess terminal signal was `null`, where the test expected
`SIGKILL`. The first notification arrived while other jobs were running.

The failing test and its subprocess implementation are unchanged from the
Take. The parked slice 3 owns two checkout-work fixture modules, the
retired Playwright rewrite spec and its two new tests. The separate
landed CI repeat coverage story is back in the backlog. Its checkout
shows no active repair for these files.

## First diagnosis round

The worker listens once for an IPC message. The crash-before-send action
acknowledges the durable spend and leaves the IPC channel open. The
working hypothesis is that the channel has lost its event-loop reference
when the one-time listener is removed, allowing the worker to exit before
the parent sends its kill signal. Reproduce that interleaving by delaying
the parent's kill after the acknowledgement, with a bounded disposable
probe. Verify that a held worker remains alive for the intentional kill
and that the real ledger still refuses to spend the allowance twice.

Use one disposable trial on an awake AC-powered Mac with Node 24.21.0.
Allow a 200 ms scheduling gap after the successful acknowledgement and
durable intent read, then send the same kill signal as CI. Stop after this
trial. The expected matching failure is a clean worker exit before the
parent's kill. The delay belongs to the probe only.

The trial reproduced the CI assertion on Darwin arm64 at natural
one-minute load 12.52. The probe saw the durable intent, then exit code
`0`, a failed signal delivery, and `null !== 'SIGKILL'`. Round 1
confirmed the cause at 1.2 active minutes. Its command and output are in
`ci-ledger-interruption-probe-before.log.run.json` and its log in the
checkout's Git evidence directory.

## Repair proof

The worker now explicitly references its IPC channel in crash mode
before it sends the success acknowledgement. Run each probe mode once
with the same 200 ms gap. The kill trial expects a live worker that
exits via `SIGKILL`. The disconnect trial expects the same live worker
to exit normally when the parent closes the channel. Both must observe
durable intent followed by a rejected second spend. Then run the
existing ledger suite once to cover ordinary actions and the original
interruption test.

Both probe modes passed. In the kill trial the worker was still running
after the gap, the kill was delivered and the observed exit signal was
`SIGKILL`. The disconnect trial also found a live worker after the gap,
then observed exit code 0. Both read durable intent and rejected the
second spend. The existing ledger file passed. Run one more selected
ledger file with its case outcome reporter enabled. The single selected
file reported all eight cases passing, including the interruption case.
The repair proof ran on the same Mac at natural one-minute load 17.68
after the probes and initial suite. No competing proof was owned by this
execution. The repair changed only the ledger worker fixture and added no
timing wait. The scratch probe is retained in the Git evidence directory.

The next CI check is the first publication carrying the repair. Expect
Distribution Tests 3/3 to complete the interruption case with the parent
kill observed. If the same failure recurs, reassess the cause using that
attempt's evidence. The coordinator owns publication and CI observation.

Follow the [shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
