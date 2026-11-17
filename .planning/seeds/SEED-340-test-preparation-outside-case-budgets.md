---
id: SEED-340
status: active
planted: 2026-11-13
planted_during: execution of SEED-300#express-session-test-intent-through-page-objects, whose obligation G6 found cold preparation inside a first case's 30 s budget and whose G8 left the remaining consumers
trigger_when: Terry asked on 2026-11-13 to queue a story that removes this risk
scope: story
---

# SEED-340 — Keep one-time browser test preparation out of case budgets

## Why this matters

Dashboard browser cases built on the plain `test` from
`dashboard/tests/support/preparationPage.ts` acquire the queued origin, the
app build and the server bundle through test-scoped fixtures. The first case a
worker runs pays that one-time preparation inside its own 30 s budget. While
[Express session discovery and report test intent through page objects](https://github.com/terryyin/open-dough/blob/891a05400ffabebbe64505d67561c0a6e20afd42/.planning/seeds/SEED-300-dashboard-test-page-objects.md#express-session-test-intent-through-page-objects) was being executed,
`navigation/side-panel-content-replacement.spec.ts` timed out three times as the
first case of a fresh run at load 31–46. Its traces showed 15.4–24.7 s of
in-budget `origin` and `dashboard` fixture time before the page opened, against
2.9 s on a repeat. Moving it and six sibling specs to the existing
worker-scoped `queuedCodexPreviewTest` / `queuedClaudePreviewTest` opt-ins
brought that first case to 16 s. About 148 other plain-`test` consumers keep
the cost, and `intent/intent-done-source-selection.spec.ts` still reached
25.5 s on its first case because of its own synchronous git arrangement. Under
the project's failure policy a case that times out only when it happens to run
first under ordinary machine load is a flaky test, not a speed preference.

<a id="keep-one-time-test-preparation-out-of-case-budgets"></a>

### Keep one-time browser test preparation out of case budgets

**Identity:** SEED-340#keep-one-time-test-preparation-out-of-case-budgets

**Priority.** Alongside SEED-375's suite-owner correction and before further
broad test migrations or builder conversions. The usage-spike review found
repeated setup, load-sensitive timeouts and repair interruptions amplifying
agent work. This story has a concrete first-case mechanism and named
consumers; it retains the load 30–50 proof rather than replacing it with a
quiet-machine pass.

#### Goal

Maintainers get the same verdict from a dashboard browser case whether it runs
first or later in a worker: one-time preparation (queued origin, app build,
server bundle) happens outside every case's 30 s budget, so first cases keep a
wide margin at a one-minute load of 30–50 with default timeouts.

#### Scope

- Every `preparationPage` consumer, whichever host it prepares, including specs
  that override `originRepository`. Choose one cohesive mechanism, such as
  worker-scoped preparation per host, rather than per-spec opt-ins; weigh the
  run-elapsed cost of preparing hosts a worker does not use.
- First cases whose own arrangement still nears the budget once preparation is
  out, starting with `intent-done-source-selection`, get their arrangement
  reduced without dropping the behavior they prove.
- Excluded: raising or overriding timeouts, `test.slow()`, waits on wall-clock
  time, fewer behavior checks, and product behavior changes.

Since SEED-334 (`64f15182b`), the `preparationPage` consumers are spread over
three browser test groups, each a separate Playwright run with its own
configuration and global setup in `dashboard/tests/support/`: 90 in E2E Test
(`e2e/`, `e2eGlobalSetup.ts`), 55 in the interim Dashboard Integrated UI Test
(`dashboard/tests/`, `integratedGlobalSetup.ts`) and 46 in Dashboard Backend
Test (`backendGlobalSetup.ts`). The former shared `globalSetup.ts` is gone.
Each run still builds its registered artifacts when a worker first requests
them (`runArtifacts.ts`). `side-panel-content-replacement` is now
`e2e/navigation/side-panel-content-replacement.spec.ts`, and
`intent-done-source-selection` is now the Dashboard Frontend Test
`dashboard/frontend-tests/intent/intent-done-source-selection.spec.ts`. The
mechanism must cover all three groups, which are run with `npm run test:e2e`,
`test:dashboard:integrated` and `test:dashboard:backend`.

#### Key examples

1. A fresh run starts with `side-panel-content-replacement` at load about 40 →
   its first case spends no fixture time on origin, build or bundle preparation
   inside its budget and passes well under 30 s.
2. A Claude-hosted and a Codex-hosted preparation spec share a worker → each
   gets its host's prepared origin without either case paying the other's
   preparation inside its budget.
3. `intent-done-source-selection` runs first at load 30–50 → it passes with
   wide margin and keeps its two published stories and trunk-advance evidence.


#### Current repair and remaining protection

SEED-391's mandatory CI correction already moves normal shared app/server
preparation into the common worker owner; reconcile that solution before
changing the remaining consumers. Its [bounded input and accepted proof](https://github.com/terryyin/open-dough/blob/fbfaa116b961a445cc606fd05363bf75f6ecad5f/.planning/slice-plans/668-redo-the-effort-story-under-the-test-focus-guidance/ci-repair.md)
retain the controlled 31-second preparation observation, hosted acceptance and
five custom fixture profiles that were deliberately left unchanged.

The 2026-11-17 Intent Coverage check at `fbfaa116b` found an assertion gap:
`review/story-review-state-admission.spec.ts` passed after common preparation
was faulted to request an app in boundary mode. An independent artifact trace
observed a real 1.993-second app build. Baseline and restored checks passed
with zero app requests; no actual delivered defect was established.
Preserve that boundary-only behavior and add a focused infrastructure assertion
for server-bundle preparation with zero app requests. Keep the review-state
case's product assertions intact. The complete report is retained in SEED-391's
completion record. This is proof strengthening within this preparation story,
not a new product prerequisite or permission to broaden the implementation.

The E2E case `e2e/intent/intent-ci-comparison-retry.spec.ts:30` ("Check again
recovers a done Story Branch Baseline that failed once, then asks GitHub
nothing") timed out twice as a worker's first case at load 27–35 on
2026-11-17 while hosted CI passed it. Its trace spent about 20 s of the 30 s
budget before the Check again response: `origin` 4.7 s and `dashboard` 2.6 s
in-budget fixtures, then about 10 s publishing the compared Story Branch
(`completedPublishedStory` CLI completion 5.6 s, planning commits 1.6 s). With
the timeout lifted only to measure, it took 33 s. It is a first case whose own
arrangement nears the budget once preparation is out. Its
[diagnosis](https://github.com/terryyin/open-dough/blob/309dacb410f71134bc1ff76b668bed907d541f4d/.planning/slice-plans/651-move-intent-ci-proof-comparison-and-candidate-checks/diagnosis-comparison-retry-e2e-timeout.md)
names the remaining options.
