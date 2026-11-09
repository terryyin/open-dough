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

**Starting direction.** Refinement settles the scope; these are hypotheses.

- Prove the resolution, slot, retry and memory rules in
  `dashboard/server/intentCiComparison{Resolve,Slots,Answers}.ts` and their
  neighbors as browser-free `dashboard/backend-tests/intent/` specs. Arrange
  history, runs and proofs as MakeMe domain data, and advance a controlled clock
  for remembered and retried answers.
- Prove the panel's wording and Check again behavior in
  `dashboard/frontend-tests/` against the shared app build with service
  substitutes that answer prepared comparisons.
- Keep only the few integrated journeys that prove the real Git and `gh`
  wiring, and make them cheap: build history once per worker and clone it per
  test (for example an APFS `cp -c` clone), and reuse a warm worker-scoped
  dashboard server.
- Apply the same approach to
  `dashboard/tests/review/story-review-one-shot-choice-refresh.spec.ts:86`,
  whose four real launches only produce stored run records (DD-445): arrange
  those records directly and keep one real launch elsewhere as the integrated
  proof.

**Constraints.** Preserve each rule's behavioral proof and independently
stated expectations. Follow the [test automation rules](../../AGENTS.md#test-automation):
no `test.setTimeout`, no `test.slow()`, no wall-clock waits. Recording these
tests as Test Optimization Candidates does not satisfy this story.
