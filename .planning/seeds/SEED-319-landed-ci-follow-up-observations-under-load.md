---
id: SEED-319
status: active
planted: 2026-11-12
planted_during: SEED-316#select-and-copy-terminal-text-on-mobile execution, whose loaded local runs missed 5 s observations in landed-CI and Intent CI checks no story owned
trigger_when: SEED-287#fit-dashboard-journeys-in-default-timeout has landed, or a landed-CI or Intent CI Done/prior-build check misses a 5 s observation under load
scope: story
---

# SEED-319 — Landed CI follow-up checks hold their observations under load

## Why this matters

During [Select and copy text in the Dashboard terminal on mobile](https://github.com/terryyin/open-dough/blob/ebaf16f6336d2d9111f95984b907a006b67f3c04/.planning/seeds/SEED-316-mobile-terminal-text-selection.md#select-and-copy-terminal-text-on-mobile)'s execution, under local load 30–50 from other worktrees,
these checks missed their 5 s observations on the base revision as well as on
the story branch, so the misses predate that story:

- `landed-ci-repeat-reconciliation` (lines 26, 57, 92),
  `landed-ci-follow-up-reading` (54, 134),
  `landed-ci-repeat-receipt-boundary` (56, 96)
- `landed-ci-history-comparison-run:22`,
  `landed-ci-scope-build-provenance:40`, `landed-ci-scope-later-build:44`
- `intent-scope-prior-build-average:41`,
  `intent-ci-done-reference-lifecycle:11`, `intent-ci-done-prior-build:33`,
  `intent-ci-done-prior-provenance:16`

Line numbers are from `main` at `c13bd4a06`. The landed-CI specs are under
`dashboard/backend-tests/intent/`, the `intent-*` specs under
`dashboard/tests/intent/`.

[Select and copy text in the Dashboard terminal on mobile](https://github.com/terryyin/open-dough/blob/ebaf16f6336d2d9111f95984b907a006b67f3c04/.planning/seeds/SEED-316-mobile-terminal-text-selection.md#select-and-copy-terminal-text-on-mobile)'s report recommended adding them to
[Make dashboard journeys fit the default timeout under load](https://github.com/terryyin/open-dough/blob/3d0246825ae7a03cc0c0b7b2076c4b1cce7d531c/.planning/seeds/SEED-287-dashboard-journeys-within-default-timeout.md#fit-dashboard-journeys-in-default-timeout), whose in-flight repair
around `ciFollowUpScenario`/`ciFollowUpPriors` addresses the same miss: a
current receipt observed before its predecessor builds' proof has been
collected. On 2026-11-12 Terry approved that recommendation on condition that
the receiving story is not already picked up. [Make dashboard journeys fit the default timeout under load](https://github.com/terryyin/open-dough/blob/3d0246825ae7a03cc0c0b7b2076c4b1cce7d531c/.planning/seeds/SEED-287-dashboard-journeys-within-default-timeout.md#fit-dashboard-journeys-in-default-timeout) was Taken and being
executed, so this story holds the checks until that repair lands.
[Speed up landed CI repeat checks](https://github.com/terryyin/open-dough/blob/4eb1f6a74f42111c185be8521dbbd6d36f411d5f/.planning/seeds/SEED-314-landed-ci-repeat-checks.md#speed-up-landed-ci-repeat-checks) owns the automatic-repeat and
verdict specs, and [Make dashboard journeys fit the default timeout under load](https://github.com/terryyin/open-dough/blob/3d0246825ae7a03cc0c0b7b2076c4b1cce7d531c/.planning/seeds/SEED-287-dashboard-journeys-within-default-timeout.md#fit-dashboard-journeys-in-default-timeout) owns the five repeat-admission cases and
`landed-ci-history-no-proof-recovery`.

<a id="hold-landed-ci-follow-up-observations-under-load"></a>

### Hold landed CI follow-up observations under load

**Identity:** SEED-319#hold-landed-ci-follow-up-observations-under-load
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected","assessment":"not-ready","reasons":["Queued from SEED-316's report to wait for SEED-287's in-flight predecessor-collection repair; refine after SEED-287 lands. No execution authority is granted."],"basis":{"document":"00b9061fa6c17cdd32428c119e3089c6ebb0bc79935c408ab3e9d2ee66c49f2a"}}
```

#### Goal

Maintainers get the same verdict from the landed-CI follow-up and Intent CI
Done/prior-build checks under the machine's usual parallel load as in hosted
CI, with every 5 s observation and assertion kept.

#### Scope to refine

- Start from `main` after [Make dashboard journeys fit the default timeout under load](https://github.com/terryyin/open-dough/blob/3d0246825ae7a03cc0c0b7b2076c4b1cce7d531c/.planning/seeds/SEED-287-dashboard-journeys-within-default-timeout.md#fit-dashboard-journeys-in-default-timeout) lands. Rerun the named checks at 2 workers
  under local load 20–30 and drop any that [Make dashboard journeys fit the default timeout under load](https://github.com/terryyin/open-dough/blob/3d0246825ae7a03cc0c0b7b2076c4b1cce7d531c/.planning/seeds/SEED-287-dashboard-journeys-within-default-timeout.md#fit-dashboard-journeys-in-default-timeout)'s predecessor-collection
  readiness already settles; record which ones.
- For each remaining miss, find the causal boundary (for example, prior proof
  not yet collected, or a request still settling) and wait for that observable
  event. Reuse [Make dashboard journeys fit the default timeout under load](https://github.com/terryyin/open-dough/blob/3d0246825ae7a03cc0c0b7b2076c4b1cce7d531c/.planning/seeds/SEED-287-dashboard-journeys-within-default-timeout.md#fit-dashboard-journeys-in-default-timeout)'s readiness rather than adding a second one.
- Preserve real receipt ingestion, collection and admission, and every
  assertion. Do not seed the card or result under test.
- Use shared MakeMe for domain data and existing external-provider fixtures.

Required restrictions and reasons: keep the default case timeout and the 5 s
observations; no sleeps, retries, skips or timeout increases to absorb load
variance. A flaky check is failing under the project's
[failing and flaky test policy](../../AGENTS.md#failing-and-flaky-tests)
until it is stable locally and in CI.

#### Key examples to refine

- At local load 20–30 on 2 workers, each named check that remains after
  [Make dashboard journeys fit the default timeout under load](https://github.com/terryyin/open-dough/blob/3d0246825ae7a03cc0c0b7b2076c4b1cce7d531c/.planning/seeds/SEED-287-dashboard-journeys-within-default-timeout.md#fit-dashboard-journeys-in-default-timeout) lands passes in three consecutive runs with its 5 s observations.
- A check that [Make dashboard journeys fit the default timeout under load](https://github.com/terryyin/open-dough/blob/3d0246825ae7a03cc0c0b7b2076c4b1cce7d531c/.planning/seeds/SEED-287-dashboard-journeys-within-default-timeout.md#fit-dashboard-journeys-in-default-timeout) already settles is recorded as covered there and gets
  no second repair.
