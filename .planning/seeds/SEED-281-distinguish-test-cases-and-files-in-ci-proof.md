---
id: SEED-281
status: active
planted: 2026-11-09
scope: story
---

# Distinguish test cases and test files in Intent CI proof

<a id="distinguish-test-cases-and-files-in-ci-proof"></a>

### Distinguish test cases and test files in Intent CI proof

**Identity:** SEED-281#distinguish-test-cases-and-files-in-ci-proof
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal.** Developers comparing CI builds in Intent can tell whether a count
or delta describes individual test cases or whole test files. Projects can
publish that distinction through the shared CI proof protocol.

**Scope.** Evolve the versioned CI proof format, collector, publisher guidance,
and Intent reader to use explicit test case and test file units. Allow both
units in the same proof location and keep their results and comparisons
separate. Read existing summaries from GitHub Actions and CI adapters during
the rollout. Adopt the format in Open Dough's own CI and make the protocol and
collector available to the other publishers through the normal release path
([ADR 0003](../../docs/adrs/0003-tagged-release-versioning-accepted.md) and
[ADR 0004](../../docs/adrs/0004-client-installation-and-update-accepted.md)).
Each other project owns its CI migration.

**Key examples.**

- A Playwright spec with five reported cases contributes five test cases.
  A Node test file with five cases that reports one aggregate outcome
  contributes one test file. A location with both shows both totals separately.
- A failed file that produces no case results remains visible as a file
  failure. Keep outcome counts, available timing, and missing evidence visible
  at the level the publisher reports them.
- A legacy summary with an ambiguous unit remains readable as legacy test
  results. A comparison shows a count delta only when the reported units are
  known to match. Projects can switch publishers independently.
