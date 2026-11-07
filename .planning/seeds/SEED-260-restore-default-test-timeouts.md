---
id: SEED-260
status: active
planted: 2026-11-07
scope: story
---

# Restore default timeouts across automated tests

<a id="restore-default-test-timeouts"></a>

### Restore default timeouts across automated tests

**Identity:** SEED-260#restore-default-test-timeouts
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal.** Developers get fast, reliable local and CI feedback from automated
tests that pass with their runner's default timeout wherever possible.

**Evaluation.**

- Clean up the dashboard Playwright suite first, including the frontend and
  backend tests and their fixtures. Remove every `test.slow()` and restore
  Playwright's 30-second default. Then apply the same audit and cleanup to the
  project's remaining automated tests, including shell and Node tests, using
  each runner's own defaults. Follow the repository's
  [test automation rules](../../AGENTS.md#test-automation) throughout.
- For tests that approach or exceed the default, identify the cost and change
  the test strategy first. Preserve the behavior under test and use observable
  events or controlled clocks for synchronization. Measure affected cases across
  supported local and CI runs and verify they finish comfortably within the default.
- When a faster strategy is impractical in this story, use the smallest
  justified timeout inside the individual test. Record each remaining
  exception as a pending [test optimization candidate](../TEST-OPTIMIZATION-CANDIDATES.md)
  with measured cost, behavior protected, approaches tried, and a follow-up.
- Verify that the full `npm run test:dashboard` and `npm test` suites pass
  locally and in CI, preserving coverage. For full runs on an awake Mac on AC
  power, use `caffeinate -s -i` as described in
  [machine sleep on macOS](../../tests/local-test-resources.md#machine-sleep-on-macos).
  Follow the [failing and flaky test policy](../../AGENTS.md#failing-and-flaky-tests).

**Starting evidence.** In a full dashboard CI run, all 51 cases marked slow
finished within 14.1 seconds. Production-watcher recovery took 82.1 seconds.
[Playwright reports](https://github.com/terryyin/open-dough/actions/runs/42372706379)
