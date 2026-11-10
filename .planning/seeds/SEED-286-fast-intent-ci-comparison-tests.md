---
id: SEED-286
status: active
planted: 2026-11-09
planted_during: Terry Yin's decision on the heavy journeys reported at the close of SEED-261#map-intent-and-ci-proof-test-data
scope: story
---

# Make the Intent CI comparison tests sub-second

<a id="fast-intent-ci-comparison-tests"></a>

### Make the Intent CI comparison tests sub-second

**Identity:** SEED-286#fast-intent-ci-comparison-tests

**Plan:** [Fast, trustworthy Intent CI comparison feedback](../slice-plans/556-fast-intent-ci-comparison-tests/PLAN.md)
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/556-fast-intent-ci-comparison-tests/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"9747081df5b0b802d811f729f950efbba18807cfda6265001b19ec99b23b3be4","plan":"a8ca9d1e669fe0e26b3a6e31f27495c5fc86ec36713d4bad9e6dbf58f1bec6e3"}}
```

**Goal.** Developers and agents changing Intent's CI timing comparison get a
trustworthy result for each comparison rule in under a second, in any
environment. Each test arranges only the minimal domain data that explains
its case, so a reader sees what the rule is from the setup alone. No test in
the family relies on a raised timeout.

**Why now.** The closing report of SEED-261#map-intent-and-ci-proof-test-data
left these journeys over the 30 s default timeout at machine load 20 or more.
A traced local run on 2026-11-09 at load 17–19 showed where the time goes:

| | `intent-ci-comparison-cancelled-landing-gaps.spec.ts:81` | `intent-ci-comparison-retry.spec.ts:41` |
| --- | --- | --- |
| Worker fixtures (origin repository, dashboard server) | 20.6 s (8.6 s origin, 11.3 s dashboard) | 2.1 s |
| Real Git history built, pushed and published per test | about 15 s, then timed out at `page.goto` | about 5 s |
| Each comparison read | — | about 4.3 s, twice |
| Result | failed at 35.2 s | passed in 23.2 s |

The assertions themselves cost almost nothing. Each of the family's 60 browser
journeys (`dashboard/tests/intent/intent-ci-comparison-*.spec.ts` and
`intent-summary-story-comparison*.spec.ts`) pays for a cold dashboard server,
real commits, and a server read that reads Git history and spawns one Node
process per fake `gh` call (`dashboard/tests/fixtures/fake-gh`), just to prove
one resolution or wording rule.

**Scope.** Give each distinct comparison rule fast, deterministic proof at
the cheapest boundary that still exercises the real behavior. This includes
Done and Taken endpoints, Story Branch and Trunk Mode, merge and fast-forward
ownership, skipped/equivalent/cancelled/later builds, proof and timing gaps,
adapter attempts, retry and remembered answers, and the comparison's wording,
counts, sorting, relative marks and navigation through Summary and file Proof.
Preserve comparison visibility while other Intent reads are held or fail.

At this preparation's revision the matching family contains **73 cases in 25
files**, confirmed by the dashboard runner's list operation on 2026-11-09;
the 60-case figure above belongs to the earlier diagnosis. Inventory the actual
assertions before migrating them. Consolidation is allowed when the surviving
proof detects the same fault; a smaller case count is not the outcome.

Use browser-free server/domain tests for resolution and read-lifecycle rules,
and frontend tests for presentation and real UI actions against prepared
service answers. Arrange only the history, attempts, proof or records that
explain the case through the shared MakeMe API. Final-answer memory has no
time-to-live: prove finality and request counts directly. Use controlled clocks
only when elapsed time is itself relevant.

Keep a small, explicitly mapped set of real Git, CI-provider and authenticated
read journeys that proves the connections between these boundaries. Make their
setup cheaper without sharing mutable state or relying on an APFS-only copying
operation. A warm server or history snapshot is an experiment to justify with
measurements and isolation proof, not a prescribed architecture.

Also replace incidental launches in both cases of
`dashboard/tests/review/story-review-one-shot-choice-refresh.spec.ts` with
directly arranged stored launch/landing records. Preserve the chosen-run,
replaced-session, deleted/expired-run and legacy-gap behavior, and retain an
actual launch/capture journey as the integration owner. This is the adjacent
cost already identified in [DD-445](../../docs/maintainer/project-test-findings.md#dd-445).

**Performance evaluation.** Target less than 1,000 ms for each rule-focused
test, including per-test arrangement, actions, assertions and cleanup. Report
shared runner/build/worker setup and the retained real wiring journeys
separately; moving work into a shared hook is not evidence of reduced total
feedback time. Compare the normal local selection before and after with all
replacement tests included, record host load and concurrency, and verify the
same portable tests in CI. Loaded observations matter: one fast run does not
establish environment independence. No retained test gains a raised timeout.

**Scope limits.** This story does not change Intent's comparison semantics,
add timing-history features, optimize the whole dashboard suite, or build a
general test/mocking framework. It does not require one test per current file
or per helper. Its measurement and proof cover the selected family and the
named review-refresh cases.

**Required restrictions.** Preserve each distinct rule's behavioral proof and
independently stated expectations: speed without equivalent fault detection
would make the developer feedback untrustworthy. Follow the
[test automation rules](../../AGENTS.md#test-automation): no `test.setTimeout`,
no `test.slow()`, no wall-clock waits. Do not add retries, skips or platform
exceptions to meet the timing target. Recording candidates does not satisfy
this story.

**Key examples.**

1. Given a nearer completed build without usable proof and an older usable
   build, resolving Baseline selects the older build and names its provenance;
   a result walk never crosses the story-start bound. Minimal arranged history
   proves the rule without making commits or launching `gh`.
2. Given a cancelled landing and later trunk revisions with missing or unusable
   proof, resolution chooses the nearest later usable completed build. A running
   build or the read head stops the search and leaves the answer refreshable;
   timed-out or unexplained landings retain their exact-only behavior.
3. Given a transient unavailable comparison or endpoint proof, Check again
   disables while reading and recovers the displayed result. Subsequent reads
   reuse a final Done answer and valid proof without another provider request;
   Taken, running and unavailable results stay fresh.
4. Given prepared comparison and proof evidence, opening the comparison,
   Summary and file Proof retains the same active endpoints and fallback reason.
   Signed timing changes, a measured zero, gaps, counts, sorting and Show % keep
   their existing meaning, without extra CI reads during drilling. A held or
   failed Changed tests read does not hide the comparison.
5. Given stored captured runs and a legacy run, Refresh retains the selected
   run after native-session replacement. Deleting that choice selects the
   newest remaining captured run; expiring it selects the next, then the legacy
   evidence gap. These state transitions need no native launch to arrange them;
   a separate real launch/capture journey still proves record production.
