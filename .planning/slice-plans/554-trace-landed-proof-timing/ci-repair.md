# Execution CI repair

Repair base: `6f972615c0e49c7d6fdfa10ebb69b348e904c4c4`.
Both failed attempts remain owned; neither is waived by later success.
Follow [the failure policy as written](../../../AGENTS.md#failing-and-flaky-tests).

## Failed attempts and causes

- Run42627575193/attempt1, dashboard11/12, job129195206824, on65e40e9:
  `limit-recovery-credit-history.spec.ts` observed an extra unrelated plan
  history request. A controlled scheduling change reproduced that exact
  failure. The shared limit had intercepted the plan's initial request before
  its empty answer was established, so production correctly retried it.
  `limitRecoveryCredit.ts` now establishes all four plan histories and checks
  the unrelated terminal answer before activating recovery. The exact narrow
  request-set, human attribution, Take clock and no-reload assertions remain.
- Run42631739158/attempt1, dashboard10/12, job129209485674, on6f972615:
  the global deadline interrupted two voice cases after all71files started;
  172cases passed and no assertion failure appeared in the retained report.
  The two interrupted cases started with only5.0/3.5seconds remaining.
  All12timing artifacts exposed124unrecorded specs among872files. Add their
  measured durations, normalized by the maintained runner factor0.89772727,
  preserving all748existing weights, including the conservative voice weight.
  Replaying observed workload changes the shard range724.9–1160.1 to
  833.9–957.7test-seconds; shard10 becomes941.2. No deadline or timeout changes.
- Local affected voice proof also exposed native capture hanging while
  Chromium's default fake input queried the Mac's real CoreAudio parameters.
  The sampled AudioService stack was blocked in AudioUnitSetProperty.
  Chromium153's input controller queries parameters before creating its fake
  stream. Selecting the enumerated non-default `Fake Audio Input 1` completed
  native capture immediately. `voicePage.ts` retains captured native
  getUserMedia, real tracks, MediaRecorder and recorded bytes. Explicit audio
  constraints and all permission, teardown and late-response assertions remain.

Known-failure diagnostic inventories named one failed job each. The installed
diagnostic could not fetch logs (HTTP403); the GitHub connector supplied both
complete failed-job logs and report artifacts. No CI rerun was requested.
Retained local evidence: `/tmp/trace-proof-285-ci-job-{129195206824,129209485674}.log`,
`/tmp/trace-proof-285-ci-report{10,11}`, all12timing artifacts under
`/tmp/trace-proof-285-ci-times-all`, and `/tmp/trace-proof-285-shard-analysis.json`.

## Proof and review

The implementation agent returned quiescent after both recovery journeys and
all four terminal voice lifecycle cases passed, then all ten other voice
fixture consumers passed. Scheduling/normalization/deal checks:17passed.
The deal preview records872files and zero unknown durations. Passing quiet
dashboard runs remove their passing report directories; no retained passing
trace is claimed. The controlled recovery red trace is retained at
`dashboard/test-results/2026-11-09T14-28-08.621Z-57534`.

Completed commands, from this execution checkout:

```sh
caffeinate -s -i npm run test:dashboard -- dashboard/tests/observation/limit-recovery-credit-history.spec.ts dashboard/tests/observation/limit-recovery-credit-commit.spec.ts dashboard/tests/terminals/session-terminal-voice-lifecycle.spec.ts --workers=1
node --test tests/support/dashboard-test-files.test.mjs tests/support/duration-list.test.mjs tests/support/share-deal.test.mjs
node scripts/test-shares.mjs preview --split-count 12 --spec-dir dashboard
```

The other ten-spec command ran under `caffeinate -s -i` and selected
`rg -l observeMicrophone dashboard/tests/launches dashboard/tests/terminals`,
excluding `session-terminal-voice-lifecycle.spec.ts`, then passed those paths to
`npm run test:dashboard --` with `--workers=1`. Six-case receipt: session21727,
exit0/chunk905a5c; ten-spec receipt: session24056, exit0/chunk4a79d6;
scheduling receipt: exit0/chunk74a44c. No case count was printed for the ten-spec
run, so none is inferred. The allocation replay consumed the twelve artifacts
with maintained `runnerFactor`, `formatSeconds` and `dealShares`; its JSON and
before/after previews are retained under `/tmp/trace-proof-285-*`.

Read-only retrospective delta review found no production or ADR change and no
change to original story-promise conclusions. Plan560's ready recovery-test
consolidation remains valid and unexecuted. Final CI remains required.

Independent refactor: `none — already clean`, no edits or invalidated proof;
returned `## REFACTOR COMPLETE`. Generated, annotated consumer trace:
`/tmp/trace-proof-285-refactor-ci-consumers.md`. Both recovery callers, all11
native microphone consumers, timing readers, allocation preview and17checks
have explicit dispositions; no affected consumer gap remains. Unchanged
backend key-only fixture users and unrelated Node timing lists are excluded
with reasons. No refactor test rerun was needed. Root inspected this trace,
the actual setup changes and preserved exact-request/recorded-byte assertions.

## Preservation and publication

The installed CI repair save found a clean tree at the repair base, with no
staged, unstaged or untracked work. Its record is
`/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/dough-ci-repair-stash-dRCIUC/record.json`.
Restore that record through the installed command after accepted repair
publication, even though it has no stash object. Reuse coordinator
`trace-proof-285` and observer `/tmp/dough-ci-501/watch-oKvBZU`.
The failure completion receipt retained this observer; it grants no closure
authority. Complete the accepted repair revision through that same observer.
