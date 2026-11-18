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

<a id="run-dashboard-frontend-checks-at-doughnut-speed"></a>

### Get faster feedback on the seven phone-board checks

**Identity:** SEED-404#run-dashboard-frontend-checks-at-doughnut-speed
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/701-faster-phone-board-checks/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"e1f2b0e2ee5376e375713aff766a4853178014dfadb5770a5170e588ebdd60d1","plan":"7848e7deb9bc248f9fc73850204fdf67e444a3bf20e35f7caf5477a606807aec"}}
```

**Goal.** A developer runs the seven phone-board checks through the ordinary
Dashboard Frontend Test command. Their combined recorded case time is under
0.5 seconds in repeated comparable runs, excluding Chromium and runner
startup. Measure full command elapsed time too. All seven appear in frontend
CI proof.

**Scope.** Mount the production React dashboard and CSS with fresh service
answers. Dispatch touch events directly. Control timers and signal transition
completion explicitly so the scenarios need no elapsed-time waits. Check
actual layout, focus, viewport changes and independent starting state. Keep
representative full-page proof of published work, gesture wiring, vertical
reading and native indicator hit testing. The [second story](#run-the-remaining-dashboard-frontend-checks-at-doughnut-speed)
owns the full-suite target.

**Key examples**

- At 390 × 844, swipe from Backlog to Taken. The two indicators are each at
  most 16 px wide. Both the view and story card gain more than 44 px against
  the former layout with two 44 px controls. Activating the indicator reaches
  the named column. Keyboard activation hands focus to the surviving indicator.
  The published-project journey also taps the real narrow target.
- A short or cancelled swipe keeps the current column. A completed swipe moves
  one column and stops at either end. A swipe starting on a card or its launch
  action leaves selection, inspection and launch untouched. Ordinary taps still
  inspect and select. With reduced motion, the open detail and selection
  survive a rotation to landscape and back.
- With a long backlog, a vertical touch stays unconsumed and leaves Backlog
  visible. CSS permits vertical panning and the Backlog can actually scroll.
  A later case starts with its own board preference and service answers.
- A developer runs the two phone specs together → all seven results appear
  once. The frontend CI summary includes those seven and the retained cases
  once each, including when a moved assertion fails.

[Indicator cases](../../dashboard/frontend-tests/board-indicators.mounted.spec.ts)
and [swipe cases](../../dashboard/frontend-tests/board-swipe.mounted.spec.ts)

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

For example, comparison retry should still disable the button while its read
is held and recover the Landed endpoints. Opening, reloading and traversing
an encoded story URL must exercise real browser history. Keep a runner
change when a matched measurement shows it helps the relevant family.
[Comparison retry](../../dashboard/frontend-tests/intent/intent-ci-comparison-mounted-retry.spec.ts)
and [story URL journeys](../../dashboard/frontend-tests/navigation/story-url-destination.spec.ts)
