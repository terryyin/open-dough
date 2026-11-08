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
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/544-observe-stale-reclaimer-handoff/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"24372007d5f4b5feaafa1c4b4b497248702f2b573253e942612b4aa609abcd39","plan":"ab0cbc34a107b98450192ad87a4dacba0cbb843ec20bc8f44c2bfed53b9a8579"}}
```

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

**Origin.** The stale-reclaimer check was outside the scope of
`SEED-277#observe-local-suite-waits`, closed in `4cd1a7c21`.
