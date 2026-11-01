---
id: SEED-208
status: active
planted: 2026-11-01
planted_during: Terry Yin's value-first review of test optimization candidates
scope: story
---

# Worthwhile dashboard proof at lower cost

<a id="reduce-dashboard-proof-cost"></a>

### Reduce dashboard proof cost while retaining worthwhile coverage

**Identity:** SEED-208#reduce-dashboard-proof-cost
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/432-reduce-dashboard-proof-cost/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"ababc5469464fbe796e21007ee461ff913739f6557605c5cec85c1703efc601f","plan":"3a25f9f8c101656de2bfac879e6ded9623bdac08fc79fb66894dfc9335fe22a3"}}
```

**Goal:** Developers wait less for dashboard feedback and maintain fewer
redundant test paths, while retaining the important behavior those tests protect.

**Beneficiary:** Developers running and maintaining `npm run test:dashboard`.

**Scope:** Implement the supported reductions and bounded fixture improvements
in the [value/cost assessment](../../docs/maintainer/dashboard-test-value-review.md).
For every affected test, first judge whether its protected behavior is valuable;
then whether its incremental coverage justifies runtime, maintenance, complexity,
and the cost of improving it. Either negative answer removes or narrows the test.
For worthwhile remaining coverage, prefer fewer tests, then simpler real
preconditions and existing system/test infrastructure. Accept evidenced residual
necessary costs when no credible worthwhile acceleration remains.

**Key examples:**

- Malformed review/mark requests still cannot select arbitrary repositories or
  mutate real Git state, without opening a browser or building irrelevant history.
- One story and one ad-hoc discovered-model journey retain the distinct launch
  shapes; refinement model/effort persistence survives in its existing journey.
  Catalog-only cases no longer prepare installed-start repositories.
- Claude execution and Codex refinement retain the full phase/observer journeys;
  existing Codex execution proof retains its changed-readiness handoff.
- Ambiguous attribution still fails closed with no files after its duplicate
  gaps case is removed; missing-agent recovery remains protected.
- Recently-done deletion retains each placement/focus/no-stop result using real
  APIs for incidental launch setup and one owner for generic confirmation proof.
- One full ad-hoc terminal attachment path survives the blank/text matrix
  reduction; blank UI submission remains proved at the cheapest real boundary.
- Attention reporting keeps its installed-command/restart/retirement lifecycle;
  its raw refusal variants use an existing real boundary fixture.
- Completed-review Published/Landed round-trip selection, non-owner second-server
  protection, and real production-watcher chains retain their accepted coverage.

**Evaluation:** Record comparable normal local full-suite before/after wall and
executed cases, plus controlled focused measurements of retained infrastructure
changes. Preserve valuable fault detection and make test/support orchestration
simpler. Distinguish measured speedup from independently worthwhile scope
reduction; do not restore redundancy solely because wall time is unchanged.
Stop speculative acceleration when its expected benefit no longer justifies
implementation and future maintenance. Update the candidate record after proof.

**Constraints:** No mocking as an acceleration strategy; no production answer
substitution, new retry/skip/exclusion policy, weakened timeouts, shared mutable
test state, or another fixture framework. Existing synthetic external hosts are
not proof of live vendor behavior and must not be expanded to replace real
dashboard/Git/store/transport behavior. Existing response-rewriting terminal
races are not no-mock replacement proof. Product behavior is unchanged.

**Boundaries:** No deployment/cache redesign, broad watcher optimization, new
test runner, or product-wide test audit. This queued story does not authorize
implementation. [Plan](../slice-plans/432-reduce-dashboard-proof-cost/PLAN.md).

**Effort hypothesis:** Moderate overall, medium confidence. Simple scope
reductions are low risk; fixture gains require bounded measurement before
keeping shared changes. One story owns all changes and final suite re-profiling.
