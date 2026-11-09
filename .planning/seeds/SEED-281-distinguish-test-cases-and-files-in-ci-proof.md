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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/547-distinguish-test-cases-and-files-in-ci-proof/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"49c6c22662a4f02a9d81ea1d7370f2ba0f718b9005853a31c630202b379efd94","plan":"b7e05161b1ff963def20aa14d9638674b076d4c5b3cd42873044f78c8c26bcfd"}}
```

**Goal.** Developers comparing CI builds in Intent can tell whether a count
or delta describes individual test cases or whole test files. Projects can
publish that distinction through the shared CI proof protocol.

**Scope.** Evolve the versioned CI proof format, collector, publisher guidance,
and Intent reader to use explicit test case and test file units. Allow both
units in the same proof location and keep their results and comparisons
separate through the CI result, story comparison, location and folder Summary,
and individual file Proof views. Read existing summaries from GitHub Actions
and CI adapters during the rollout. Adopt the format in Open Dough's own CI
and make the protocol and collector available to the other publishers through
the normal release path
([ADR 0003](../../docs/adrs/0003-tagged-release-versioning-accepted.md) and
[ADR 0004](../../docs/adrs/0004-client-installation-and-update-accepted.md)).
Each other project owns its CI migration.

A **test case** is an individual case outcome reported by a runner. A **test
file** is a reported aggregate outcome for running one file, even when that
file contains several cases. The number of matching source files or paths in
a proof breakdown is a different fact; it does not establish file outcomes.
When a publisher reports both case and file outcomes for a path, retain both
without adding them into one result count or inferring one from the other.
Preserve outcomes, available execution time, untimed results, and missing or
ambiguous parts within their reported unit.

Legacy evidence whose unit is ambiguous stays readable as legacy test results,
without guessing its meaning from a path, runner name, or the old `tests` /
`checks` spelling. Show a numeric count delta only for evidence whose units
are known to match: subtracting case and file counts, or treating an unknown
unit as a measured zero, would give a misleading change. An unavailable or
unreported result keeps its evidence gap.

This increment does not extract inner cases from aggregate file reports,
redesign the Intent layout, change which builds are compared, or migrate
other projects' CI. [Unifying Intent views and comparison presentation](../../docs/dashboard-development-intent.md)
has its own story; this story carries unit meaning through the existing views.

**Key examples.**

- A Playwright spec with five reported cases contributes five test cases.
  A Node test file with five cases that reports one aggregate outcome
  contributes one test file. A location with both shows five test cases and
  one test file separately, including when the two reports name the same path.
- A failed file that produces no case results remains visible as a file
  failure. Keep outcome counts, available timing, and missing evidence visible
  at the level the publisher reports them.
- A legacy summary with an ambiguous unit remains readable as legacy test
  results. A comparison shows a count delta only when the reported units are
  known to match. Projects can switch publishers independently.
- Baseline reports five test cases and one test file; Landed reports seven
  test cases and one test file. Intent shows +2 test cases and no change in
  test files. If Baseline instead has only ambiguous legacy results, both
  endpoints remain readable but no case or file count delta is invented.
- A folder contains two matching source files, one of which reports five
  cases and the other a failed file outcome with no case report. The source
  count stays two files; Proof shows five test cases and one failed test file,
  with timing and gaps attached to the evidence that supplied them.
