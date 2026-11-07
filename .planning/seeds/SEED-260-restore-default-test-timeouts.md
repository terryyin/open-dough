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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/502-restore-default-test-timeouts/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"a23c7998c18a54198e09d62c2f46ac9b72321820b695b6feb081f7b32d44836f","plan":"8e4064203d95f380ac284381556e8b22b1407c2d773c654b9f7f32bb8b69c2a2"}}
```

**Goal.** Developers get fast, reliable local and CI feedback from automated
tests that pass with their runner's default timeout wherever possible. A slow
or stalled check should surface promptly while retaining the behaviors that
make a passing result trustworthy.

**Scope.**

- Restore Playwright's 30-second default across the dashboard journeys,
  frontend and backend tests, and their fixtures. Then audit and clean up the
  remaining automated checks, including the shell and Node checks and their
  fixtures. Each runner supplies its own default. The repository's shell
  runner and `node --test` have no finite default case timeout. [Playwright
  timeouts](https://playwright.dev/docs/test-timeouts), [Node test
  runner](https://nodejs.org/docs/latest-v24.x/api/test.html#testname-options-fn),
  [repository job runner](../../scripts/test-run-job.bash).
- Remove `test.slow()` and inherited case-timeout overrides. Where an affected
  case approaches or exceeds its default, measure setup, execution and cleanup
  as applicable, then try a faster test strategy first. Synchronize on
  observable events or a controlled clock. Preserve the behaviors and failure
  signals covered by the checks. Measure the affected cases or jobs under
  supported local and CI conditions, including normal suite load.
- The only permitted override is the smallest measured allowance needed by an
  individual test after a practical faster strategy has been tried. Record each
  remaining exception as a pending optimization candidate with observed cost,
  protected behavior, approaches tried and a follow-up. [Test automation
  rules](../../AGENTS.md#test-automation), [optimization candidates](../TEST-OPTIMIZATION-CANDIDATES.md).
- Both full suites, `npm run test:dashboard` and `npm test`, pass locally and
  in CI with preserved coverage. On an awake Mac on AC power, use
  `caffeinate -s -i` for each full local run. [Machine sleep on
  macOS](../../tests/local-test-resources.md#machine-sleep-on-macos),
  [failing and flaky test policy](../../AGENTS.md#failing-and-flaky-tests).

**Key examples.**

1. A real-Git completed-story review has ample headroom. When its slow marker
   is removed, the same HTTP checks still distinguish the selected story's
   published files from interleaved changes at the default timeout.
2. A candidate has an unsupported published policy or fails its build. When
   the watcher checks it, the last successful preview keeps serving. A repair
   that qualifies only because the failed application's paths remain in the
   range can activate, and the next excluded range is compared from that
   successful activation. The faster check still observes real activation,
   recovery and cleanup. If the measured case still needs more than the default,
   its own bounded allowance and pending candidate make the cost visible.
3. A check passes alone and times out under full suite load. Treat it as a
   failing check and identify the missed event, fixture cost or host condition.
   Preserve its proof and confirm the repair under the profile that exposed it.
4. A shell watchdog check drives a stalled child through expiration. Observe
   termination, cleanup and retained evidence through the watchdog's contract.
   The expiration under test is part of the scenario. The shell job runs with
   its normal runner settings.

**Deferred scope.** New timeout enforcement or reporting infrastructure,
runner replacement and a redesign of test tiers. Changes to the existing unique
integrated watcher coverage require their own scope decision and replacement
proof. [Prior watcher coverage decision](../TEST-OPTIMIZATION-CANDIDATES.md#long-integrated-journeys).

**Evidence and approach.** The retained CI run covered 2,127 dashboard cases.
All 51 cases marked slow took at most 14.139 seconds, and eight other cases
exceeded 30 seconds. The watcher policy/build recovery case took 82.112 seconds
excluding shared file hooks. A focused local run of the real-Git review case
passed in 5.902 seconds with its slow marker temporarily removed. A blanket
removal would expose the over-budget cases before their strategies improve.
Remove measured surplus overrides first, then use the existing fixtures to
drive progress at the expensive boundaries. Measure the changed strategies in
their intended profiles.
[CI reports](https://github.com/terryyin/open-dough/actions/runs/42372706379),
[prior watcher timings](../../docs/maintainer/production-policy-test-timings.md).

**Architecture.** Reuse fixture-owned events and clocks to control inputs to
the real boundaries the tests observe. Keep case timeouts, the cost of shared
fixture setup and cleanup, and whole-run safeguards visible in their respective
profiles. Moving expensive work into shared setup can lower a case's reported
duration while increasing the time to a trustworthy suite result. [ADR 0002,
Software development lifecycle principles](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md),
[ADR 0010, Definition of improvement](../../docs/adrs/0010-definition-of-improvement-accepted.md).
