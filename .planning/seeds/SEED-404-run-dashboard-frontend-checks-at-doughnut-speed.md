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
run. Doughnut reported 2,573 frontend cases in 65 seconds. Terry selected the
phone board as the first delivery. Its seven cases put real navigation
controls, native gestures and CSS to work in a fixture typical of the expensive
part of this suite. A developer can keep the faster focused feedback even if
the wider migration stops.

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

Vitest browser mode reuses Chromium, supplied by Playwright. Each case mounts
the production component or screen with real CSS and fresh service answers in
the browser. Sharing a static server per worker would still incur a page and
bundle load per built-app case. More CI shards would leave the two-worker local
wait intact. Classify each case by the product behavior it observes. A real URL
load, browser history, the production page or an integrated service keeps its
Playwright journey. A setup call to `goto("/")` alone tells us little about
which boundary the assertion needs.

The useful analogy is a calibrated instrument reused across samples. Here
each case also needs a clean starting state. Unmounting leaves some preferences
in memory, and clearing storage alone can reveal their last values. Doughnut
retains per-file isolation after 216 of 339 files failed with isolation
disabled. ADR 0008 leaves the choice of test tools open. ADR 0010 calls for
equivalent useful proof and a measured gain worth the cost of migration and
maintaining both runners. [Doughnut configuration](https://github.com/nerds-odd-e/doughnut/blob/a23441f741486ea5bde7e892038ba33b408d78a4/frontend/vitest.config.ts),
[built-app fixture](../../dashboard/tests/support/frontendApp.ts),
[ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
and [ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md)

<a id="run-dashboard-frontend-checks-at-doughnut-speed"></a>

### Get faster feedback on the seven phone-board checks

**Identity:** SEED-404#run-dashboard-frontend-checks-at-doughnut-speed
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/701-faster-phone-board-checks/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"e1f2b0e2ee5376e375713aff766a4853178014dfadb5770a5170e588ebdd60d1","plan":"7848e7deb9bc248f9fc73850204fdf67e444a3bf20e35f7caf5477a606807aec"}}
```

**Goal.** A developer checking the phone board gets results sooner through the
ordinary Dashboard Frontend Test command. All seven cases retain their
original assertions and remain identifiable in the frontend CI proof. The current
two-worker selection passed in 22.07 s elapsed, including startup.

**Scope.** Move both phone-indicator cases and all five board-swipe cases onto
real mounted React and production CSS. Within a file, reuse the browser, supply
fresh answers at the service boundary, and unmount after each case. Preserve
native input, viewport changes, measured geometry, state isolation and the
existing observations. The normal focused command, unfiltered group and CI
must select each case once. Measure the seven-case selection under comparable
conditions. The remaining suite and its roughly one-minute target belong to
the [second story](#run-the-remaining-dashboard-frontend-checks-at-doughnut-speed).

**Key examples**

- At 390 × 844, swipe from Backlog to Taken. The two indicators are each at
  most 16 px wide. Both the view and story card gain more than 44 px against
  the former layout with two 44 px controls. A native tap reaches the named
  column. Keyboard activation hands focus to the surviving indicator.
- A short or cancelled swipe keeps the current column. A completed swipe moves
  one column and stops at either end. A swipe starting on a card or its launch
  action leaves selection, inspection and launch untouched. Ordinary taps still
  inspect and select. With reduced motion, the open detail and selection
  survive a rotation to landscape and back.
- With a long backlog, a native vertical stroke advances the scroll region
  and keeps Backlog visible. A later case starts again with its own board
  preference and service answers.
- A developer runs the two phone specs together → all seven results appear
  once. The frontend CI summary includes those seven and the retained cases
  once each, including when a moved assertion fails.

[Indicator cases](../../dashboard/frontend-tests/board-indicators.spec.ts)
and [swipe cases](../../dashboard/frontend-tests/board-swipe.spec.ts)

<a id="run-the-remaining-dashboard-frontend-checks-at-doughnut-speed"></a>

### Run the remaining Dashboard Frontend Test checks at Doughnut's speed

**Identity:** SEED-404#run-the-remaining-dashboard-frontend-checks-at-doughnut-speed
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-404#run-the-remaining-dashboard-frontend-checks-at-doughnut-speed","dependencies":[{"supplier":{"identity":"SEED-404#run-dashboard-frontend-checks-at-doughnut-speed","href":"seeds/SEED-404-run-dashboard-frontend-checks-at-doughnut-speed.md#run-dashboard-frontend-checks-at-doughnut-speed"},"implementation":"Apply the measured phone-board mount and its frontend command and CI proof path to the remaining eligible cases.","rationale":"The wider migration uses the gain and proof fidelity delivered by the first seven cases to justify extending the approach across the suite. Shared helper code alone would not establish that result.","condition":"All seven phone-board cases run once through the normal frontend command and CI, preserve their native assertions, and deliver a repeatable reduction in focused elapsed time.","state":"waiting"}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal.** A developer running the complete frontend group gets its answer in
roughly a minute at the usual two-worker local budget, including setup, with
the original product assertions accounted for.

**Scope.** Starting from the phone-board delivery, classify the remaining
cases by the proof each needs (685 at the baseline). Move eligible rendered,
layout, keyboard and touch checks to the proven mount. Preserve journeys
whose assertions require a real URL load, the production page or the integrated
server in Playwright. For example, comparison retry should still disable the
button while its read is held and recover the Landed endpoints. Opening,
reloading and traversing an encoded story URL must exercise real browser
history. Measure time and selection size for the normal command and report
the cost and destination of any cases moved elsewhere. A change of group
alone cannot deliver the original feedback sooner.

A comparison retry rehearsal passed its three cases in 4.08 s in Vitest
versus 5.51 s on Playwright. Showing Branch in place of Landed made all three
fail, and restoration passed in 4.41 s. This was one file on 2026-11-18, using
Doughnut's installed runner. Full-suite speed awaits measurement.
[Comparison retry](../../dashboard/frontend-tests/intent/intent-ci-comparison-mounted-retry.spec.ts)
and [story URL journeys](../../dashboard/frontend-tests/navigation/story-url-destination.spec.ts)
