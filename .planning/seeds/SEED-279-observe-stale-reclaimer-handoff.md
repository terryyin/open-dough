---
id: SEED-279
status: active
planted: 2026-11-09
scope: story
---

# Verify stale-reclaimer exclusion without a fixed wait

<a id="observe-stale-reclaimer-handoff"></a>

### Verify stale-reclaimer exclusion without a fixed wait

**Identity:** SEED-279#observe-stale-reclaimer-handoff

**Goal.** Maintainers can verify that two competing local full suites enter
one at a time after the original owner exits, even when the contender is slow
to reach its admission decision.

**Scope.** Replace the unconditional 150 ms delay in the
[local suite lifecycle spec](../../tests/support/local-test-suite-lifecycle.test.mjs)
with an observable admission decision. Keep the existing owner-exit coverage
and [local suite admission rules](../../tests/local-test-resources.md).

**Key examples.**

- For owner failure, SIGTERM, SIGINT, and SIGKILL, verify that the first
  successor enters after the predecessor's check has stopped. Hold the
  successor in its first check until the competing suite is observed blocked
  by that successor and has started no checks. Release the successor and
  verify that the competing suite enters, both runs succeed, and the admission
  ref is removed.
- In one controlled case, observe both contenders blocked by the original
  owner before ending it. The losing contender's later observation must
  identify the successor as the blocking owner.

**Origin.** The stale-reclaimer check was outside the scope of
`SEED-277#observe-local-suite-waits`, closed in `4cd1a7c21`.
