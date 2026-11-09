# Source-only review

Reviewer launch: `/root/source_review`, fresh `fork_turns: none`, 2026-11-09.
The reviewer received only the original source below, was instructed to read no
project files, change nothing, and return individually numbered commitments,
qualifications, journey examples and exclusions. No plan or implementation was supplied.
The numbered table retains its returned commitments.

## Original input

**Goal.** Maintainers can verify that two competing local full suites enter
one at a time after the original owner exits, even when the contender is slow
to reach its admission decision. A passing lifecycle check must establish that
the losing contender reached admission and was blocked by the successor;
elapsed time alone cannot establish that fact.

**Scope.** Replace the unconditional 150 ms delay in the
[local suite lifecycle spec](../../tests/support/local-test-suite-lifecycle.test.mjs)
with an observable admission decision identifying the current successor. Extend
the existing admission observation where needed so an earlier observation of
the original owner cannot stand in for observing its successor. Keep the
existing owner-exit and interrupted-retirement coverage and
[local suite admission rules](../../tests/local-test-resources.md).

The required exclusion and predecessor retirement protect the shared machine
from overlapping full suites and surviving checks. This story changes their
proof, without adding admission policy, a preferred contender order, or a
throughput or flake-rate improvement claim.

**Key examples.**

- For owner failure, SIGTERM, SIGINT, and SIGKILL, verify that the first
  successor enters after the predecessor's check has stopped. Hold the
  successor in its first check until the competing suite is observed blocked
  by that successor's current admission record and has started no checks.
  A contender that reaches this decision later keeps the test waiting for the
  observation. Release the successor and verify that the competing suite
  enters, both runs succeed, and the admission ref is removed.
- In one controlled case, observe both contenders blocked by the original
  owner before ending it. The losing contender's later observation must
  identify the successor as the blocking owner; the original owner's record
  cannot satisfy it.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Sequential entry: Maintainers can verify that two competing local full suites enter one at a time after the original owner exits. | slice 1 | observed: tests/support/local-test-suite-lifecycle.test.mjs: failure/SIGTERM/SIGINT/SIGKILL exact successor blockedBy and zero-start assertions (65–71); gate matcher rejects check start/exit in tests/support/local-test-suite-gates.mjs (23–53) |
| 2 | Slow-contender qualification: That verification remains valid when a contender is slow to reach its admission decision. | slice 1 | observed: tests/support/local-test-suite-lifecycle.test.mjs: failure/SIGTERM/SIGINT/SIGKILL exact successor blockedBy and zero-start assertions (65–71); gate matcher rejects check start/exit in tests/support/local-test-suite-gates.mjs (23–53) |
| 3 | Admission reached: A passing lifecycle check establishes that the losing contender reached admission. | slice 1 | observed: tests/support/local-test-suite-lifecycle.test.mjs: failure/SIGTERM/SIGINT/SIGKILL exact successor blockedBy and zero-start assertions (65–71); gate matcher rejects check start/exit in tests/support/local-test-suite-gates.mjs (23–53) |
| 4 | Successor exclusion: A passing lifecycle check establishes that the successor blocked the losing contender. | slice 1 | observed: tests/support/local-test-suite-lifecycle.test.mjs: failure/SIGTERM/SIGINT/SIGKILL exact successor blockedBy and zero-start assertions (65–71); gate matcher rejects check start/exit in tests/support/local-test-suite-gates.mjs (23–53) |
| 5 | Evidence restriction: Elapsed time alone cannot establish that admission and blocking occurred. | slice 1 | observed: tests/support/local-test-suite-lifecycle.test.mjs: failure/SIGTERM/SIGINT/SIGKILL exact successor blockedBy and zero-start assertions (65–71); gate matcher rejects check start/exit in tests/support/local-test-suite-gates.mjs (23–53) |
| 6 | Delay replacement: Replace the lifecycle spec’s unconditional 150 ms delay with an observable admission decision. | slice 1 | observed: tests/support/local-test-suite-lifecycle.test.mjs: failure/SIGTERM/SIGINT/SIGKILL exact successor blockedBy and zero-start assertions (65–71); gate matcher rejects check start/exit in tests/support/local-test-suite-gates.mjs (23–53) |
| 7 | Successor identity: That observable decision identifies the current successor. | slice 1 | observed: tests/support/local-test-suite-lifecycle.test.mjs: failure/SIGTERM/SIGINT/SIGKILL exact successor blockedBy and zero-start assertions (65–71); gate matcher rejects check start/exit in tests/support/local-test-suite-gates.mjs (23–53) |
| 8 | Observation freshness: Extend the existing admission observation where needed so an earlier observation of the original owner cannot satisfy the successor observation. | slice 1 | observed: tests/support/local-test-suite-lifecycle.test.mjs: failure/SIGTERM/SIGINT/SIGKILL exact successor blockedBy and zero-start assertions (65–71); gate matcher rejects check start/exit in tests/support/local-test-suite-gates.mjs (23–53) |
| 9 | Preserved coverage: Keep the existing owner-exit coverage. | slice 1 | observed: tests/support/local-test-suite-lifecycle.test.mjs: all four owner exits retain predecessor-state assertion (60–64) before successor observation |
| 10 | Preserved coverage: Keep the existing interrupted-retirement coverage. | slice 1 | observed: tests/support/local-test-suite-lifecycle.test.mjs: reclaimer killed during retirement scenario (93–124), predecessor cleanup and no recovering check assertions |
| 11 | Preserved rules: Keep the existing local suite admission rules. | slice 1 | observed: scripts/local-test-suite.mjs: acquireLocalSuite control decisions unchanged (113–165); whole tests/support/local-test-suite.test.mjs passed with slot, token, ancestry, native Playwright and independence observations |
| 12 | Protected outcome: Preserve the required exclusion that protects the shared machine from overlapping full suites. | slice 1 | observed: tests/support/local-test-suite-lifecycle.test.mjs: all four owner exits retain predecessor-state assertion (60–64) before successor observation |
| 13 | Protected outcome: Preserve predecessor retirement that protects the shared machine from surviving checks. | slice 1 | observed: tests/support/local-test-suite-lifecycle.test.mjs: all four owner exits retain predecessor-state assertion (60–64) before successor observation |
| 14 | Change boundary: Change the proof of those protections. | slice 1 | observed: inspected four-file diff: marker observation, matcher, lifecycle proof and runner docs only; no admission ordering/policy changes or throughput/flake-rate claims |
| 15 | Exclusion: Add no admission policy. | slice 1 | observed: scripts/local-test-suite.mjs: acquireLocalSuite control decisions unchanged (113–165); whole tests/support/local-test-suite.test.mjs passed with slot, token, ancestry, native Playwright and independence observations |
| 16 | Exclusion: Establish no preferred contender order. | slice 1 | observed: scripts/local-test-suite.mjs: acquireLocalSuite control decisions unchanged (113–165); whole tests/support/local-test-suite.test.mjs passed with slot, token, ancestry, native Playwright and independence observations |
| 17 | Claim exclusion: Make no throughput improvement claim. | slice 1 | observed: inspected four-file diff: marker observation, matcher, lifecycle proof and runner docs only; no admission ordering/policy changes or throughput/flake-rate claims |
| 18 | Claim exclusion: Make no flake-rate improvement claim. | slice 1 | observed: inspected four-file diff: marker observation, matcher, lifecycle proof and runner docs only; no admission ordering/policy changes or throughput/flake-rate claims |
| 19 | Exit-trigger examples: For owner failure, SIGTERM, SIGINT, and SIGKILL, verify that the first successor enters after the predecessor’s check has stopped. | slice 1 | observed: tests/support/local-test-suite-lifecycle.test.mjs: all four owner exits retain predecessor-state assertion (60–64) before successor observation |
| 20 | Successor hold: Hold the successor in its first check until the competing suite is observed blocked by that successor’s current admission record and has started no checks. | slice 1 | observed: tests/support/local-test-suite-lifecycle.test.mjs: failure/SIGTERM/SIGINT/SIGKILL exact successor blockedBy and zero-start assertions (65–71); gate matcher rejects check start/exit in tests/support/local-test-suite-gates.mjs (23–53) |
| 21 | No-check evidence: Establish that the competing suite has started no checks while blocked. | slice 1 | observed: tests/support/local-test-suite-lifecycle.test.mjs: failure/SIGTERM/SIGINT/SIGKILL exact successor blockedBy and zero-start assertions (65–71); gate matcher rejects check start/exit in tests/support/local-test-suite-gates.mjs (23–53) |
| 22 | Late-arrival journey: If a contender reaches its admission decision later, keep the test waiting for the required observation. | slice 1 | observed: tests/support/local-test-suite-lifecycle.test.mjs: failure/SIGTERM/SIGINT/SIGKILL exact successor blockedBy and zero-start assertions (65–71); gate matcher rejects check start/exit in tests/support/local-test-suite-gates.mjs (23–53) |
| 23 | Release journey: Release the held successor after the required observation. | slice 1 | observed: tests/support/local-test-suite-lifecycle.test.mjs: held successor release, remaining waiter entry, both succeeded and admission ref absent (73–88) |
| 24 | Subsequent entry: Verify that the competing suite then enters. | slice 1 | observed: tests/support/local-test-suite-lifecycle.test.mjs: held successor release, remaining waiter entry, both succeeded and admission ref absent (73–88) |
| 25 | First-run outcome: Verify that the first successor’s run succeeds. | slice 1 | observed: tests/support/local-test-suite-lifecycle.test.mjs: held successor release, remaining waiter entry, both succeeded and admission ref absent (73–88) |
| 26 | Competing-run outcome: Verify that the competing suite’s run succeeds. | slice 1 | observed: tests/support/local-test-suite-lifecycle.test.mjs: held successor release, remaining waiter entry, both succeeded and admission ref absent (73–88) |
| 27 | Cleanup outcome: Verify that the admission ref is removed. | slice 1 | observed: tests/support/local-test-suite-lifecycle.test.mjs: held successor release, remaining waiter entry, both succeeded and admission ref absent (73–88) |
| 28 | Controlled predecessor-observation example: In one controlled case, observe both contenders blocked by the original owner before ending that owner. | slice 1 | observed: tests/support/local-test-suite-lifecycle.test.mjs: failure scenario asserts both first gates equal original record before release (35–42) |
| 29 | Later observation identity: In that controlled case, the losing contender’s later observation identifies the successor as the blocking owner. | slice 1 | observed: tests/support/local-test-suite-lifecycle.test.mjs: failure/SIGTERM/SIGINT/SIGKILL exact successor blockedBy and zero-start assertions (65–71); gate matcher rejects check start/exit in tests/support/local-test-suite-gates.mjs (23–53) |
| 30 | Stale-evidence exclusion: The original owner’s record cannot satisfy that later successor observation. | slice 1 | observed: tests/support/local-test-suite-lifecycle.test.mjs: failure/SIGTERM/SIGINT/SIGKILL exact successor blockedBy and zero-start assertions (65–71); gate matcher rejects check start/exit in tests/support/local-test-suite-gates.mjs (23–53) |
