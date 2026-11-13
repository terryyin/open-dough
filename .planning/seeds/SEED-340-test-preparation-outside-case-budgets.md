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
SEED-300#express-session-test-intent-through-page-objects was being executed,
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

#### Key examples

1. A fresh run starts with `side-panel-content-replacement` at load about 40 →
   its first case spends no fixture time on origin, build or bundle preparation
   inside its budget and passes well under 30 s.
2. A Claude-hosted and a Codex-hosted preparation spec share a worker → each
   gets its host's prepared origin without either case paying the other's
   preparation inside its budget.
3. `intent-done-source-selection` runs first at load 30–50 → it passes with
   wide margin and keeps its two published stories and trunk-advance evidence.
