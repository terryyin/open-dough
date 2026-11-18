---
id: SEED-404
status: active
planted: 2026-11-18
planted_during: Terry asked to queue Dashboard Frontend Test at Doughnut's speed, using Doughnut's long-lived browser
trigger_when: selected from the backlog
scope: two stories
---

# SEED-404 — Dashboard Frontend Test runs at Doughnut's speed

A developer currently waits about 29 minutes for a local two-worker frontend
run at the story baseline. Doughnut reported 2,573 frontend cases in 65 seconds.
The seven phone-board journeys were the first delivery. On the same machine,
the old Playwright and mounted Vitest versions spent 23.4 s and 24.5 s in the
seven case bodies respectively. Native input acknowledgements and repeated
layout checks dominated both. Six Doughnut drag-rule cases took 1.5 ms in
Chromium, and three Doughnut phone layout journeys took 5.0 s total.

[CI run 44267762058, attempt 1](https://github.com/terryyin/open-dough/actions/runs/44267762058)
passed 692 cases across 291 files. The two parallel frontend test steps took
200 s and 197 s. The 1,427.141 s summed across cases measure a different cost.
At preparation revision `b6a759be6`, discovery again found 692 cases in 291 files.

| Files grouped by the fixture they use | Files | CI cases | Summed case-seconds |
| --- | ---: | ---: | ---: |
| Built-app fixture | 247 | 564 | 1,353.3 |
| Live comparison mount | 20 | 32 | 31.3 |
| Comparison markup renderer | 20 | 84 | 36.1 |
| Other | 4 | 12 | 6.5 |

### Architecture and alternatives

Playwright supplies Chromium to both test runners. The phone-board profile
supports choosing the cheapest faithful boundary for each behavior. Direct
event delivery exercises app-owned gesture handling. Real layout, actual
navigation, native hit testing and integrated services remain in the tests
that need those boundaries. Measure test bodies and command elapsed time
separately. [Doughnut configuration](https://github.com/nerds-odd-e/doughnut/blob/a23441f741486ea5bde7e892038ba33b408d78a4/frontend/vitest.config.ts),
[ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
and [ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md)

<a id="run-the-remaining-dashboard-frontend-checks-at-doughnut-speed"></a>

### Run the remaining Dashboard Frontend Test checks at Doughnut's speed

**Identity:** SEED-404#run-the-remaining-dashboard-frontend-checks-at-doughnut-speed
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal.** A developer running the complete frontend group gets its answer in
roughly a minute at the usual two-worker local budget, including setup, with
the original product assertions accounted for.

**Scope.** Start with current CI evidence and compare a representative local
selection before and after changes. Separate runner and build startup from
per-case work. Rank test families by removable cost, including repeated app
setup, browser input acknowledgements, polling, animation waits, and repeated
observations. Use fast event delivery, a controlled clock, smaller fixtures,
or a narrower proof boundary where each preserves the behavior. Use the
phone-board result to calibrate expectations across families. Retain
representative end-to-end coverage for actual navigation, native interactions
that the product depends on, and service integration. Compare the normal
whole-group command against the baseline and account for the cost and
destination of any case moved elsewhere.

Measure repeated dashboard startup separately in a representative built-app
family without native gestures. Playwright already reuses Chromium within a
worker. Each Open Dough case receives a fresh browser context and page and
starts the dashboard with service substitutes. In the phone-board profile,
launching Chromium took 105 ms once, creating the context and page took
about 30 ms per case, and opening the dashboard and waiting for it to settle
averaged 220 ms per case. Test whether a smaller fixture or a fresh mount in
an existing document avoids that startup while preserving case isolation
and the same observations. Doughnut keeps per-file isolation. These figures
come from the phone-board sample, so measure the saving in the selected
family before applying it more widely. [Built-app fixture](../../dashboard/test-support/support/frontendApp.ts)
and [Doughnut configuration](https://github.com/nerds-odd-e/doughnut/blob/a23441f741486ea5bde7e892038ba33b408d78a4/frontend/vitest.config.ts#L105-L114)

For example, comparison retry should still disable the button while its read
is held and recover the Landed endpoints. Opening, reloading and traversing
an encoded story URL must exercise real browser history. Keep a runner
change when a matched measurement shows it helps the relevant family.
[Comparison retry](../../dashboard/frontend-tests/intent/intent-ci-comparison-mounted-retry.spec.ts)
and [story URL journeys](../../dashboard/frontend-tests/navigation/story-url-destination.spec.ts)
