# CI completion during machine sleep

Investigation date: 2026-11-02. Disposition: explained observation gap; no
observer implementation change justified by this occurrence.

## Evidence

The accepted revision was `db511594b1935968e01df4b22f4931bcb5843994`, on
`claude/show-ci-status-in-an-intent-tab`. GitHub Actions
[run 41436051947](https://github.com/terryyin/open-dough/actions/runs/41436051947)
completed successfully. Local observation used mailbox
`/tmp/dough-ci-501/watch-ZKNLCE`.

All times below are on 2026-11-02 in Asia/Jakarta (UTC+07:00).

| Event                       | Time         | Evidence                                                   |
| --------------------------- | ------------ | ---------------------------------------------------------- |
| Revision registered         | 18:20:36.334 | Coverage record `registeredAt`                             |
| Completion started          | 18:20:49.301 | Immutable completion record `startedAt`                    |
| Machine entered sleep       | 18:23:29     | `pmset -g log`: Clamshell Sleep                            |
| GitHub run succeeded        | 18:26:56     | Run API `updated_at`, with conclusion `success`            |
| Foreground wait deadline    | 18:30:49.301 | Start plus the ten-minute `revisionWaitDeadlineMs`         |
| Machine entered DarkWake    | 18:39:49     | `pmset -g log`: wake after 980 seconds                     |
| Observer stopped unresolved | 18:39:49     | Mailbox stop/result file timestamps and completion receipt |

The original Claude session was `ffbf28be-d644-443b-9696-2de78994823e`.
Its transcript records the completion command at 11:20:47.842 UTC and the
background-task response at 11:39:50.183 UTC. The final receipt names the
correct requested SHA, branch, run, and attempt (`1`), with pending exact
evidence, no `observedAt`, `unresolvedReason: "timeout"`, and confirmed
shutdown. There was no successful completion record or pending handoff.

The receipt was recovered from task `b1l4ewaoy` after the session resumed.
The mailbox and transcript were inspected without modification. The machine
sleep log and GitHub run independently account for the timing discrepancy.

## Interpretation and limits

The successful remote run and the foreground deadline both occurred during
machine sleep. The local worker could not observe that success while
suspended. At wake, wall-clock time had already exceeded the foreground
budget, and the completion reader had no fresh progress or successful
evidence to return.

`ci-mailbox-await.mjs` checks recorded coverage before its wall-clock timeout.
`ci-mailbox-complete.mjs` retains observation after that timeout only when
fresh pending evidence justifies a handoff. Stale or withdrawn evidence
cannot justify it. `withdrawIntegratedState` removes pending freshness on
failed discovery; the final coverage record has that shape. Individual
provider-request errors and their ordering at wake were not retained, so
the exact cause of that withdrawal is not established.

The observed unresolved shutdown agrees with the existing bounded-wait
contract. A remote pass does not prove the suspended local observer read it.
No evidence here establishes wrong revision registration, wrong attempt
selection, or rejection of an observed successful result. The later
`d0abfe47` pass supplies separate coverage and is not needed for this
explanation.

## Validation and disposition

The existing completion-budget tests exercise stale and withdrawn progress,
including a clock jump past the foreground deadline. The process completion
tests exercise pending-to-success observation, already-recorded success, and
bounded unresolved shutdown. Both maintained entry points passed on the
investigation date with this project's Bash 5+ test wrapper:

```sh
env PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh \
  src/skills/dough-execute-plan/scripts/ci-mailbox-completion-budget.test.mjs \
  src/skills/dough-execute-plan/scripts/ci-mailbox-complete.test.mjs
```

Keep the current completion policy. No new regression test is warranted for
an unestablished implementation defect. A future change that offers recovery
after machine sleep would need an explicit decision about the wall-clock
budget, freshness, and observer ownership before changing shutdown behavior.
