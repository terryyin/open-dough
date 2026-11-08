---
id: SEED-277
status: active
planted: 2026-11-08
scope: story
---

# Verify local suite limits without wall-clock waits

<a id="observe-local-suite-waits"></a>

### Verify local suite limits without wall-clock waits

**Identity:** SEED-277#observe-local-suite-waits
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/537-observe-local-suite-waits/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"5a884856df2e30ac92fa8f147c75f7be6ad1f02b9563614abbf6b52ffd567239","plan":"295a5bdc08ad69102c6a6eb7c0c05b0107485efba0098552a233b26093d41348"}}
```

#### Goal

Maintainers can verify job limits and linked-worktree suite admission even when
the runner is slow to reach a gate. The three fixed waits in
[the local suite tests](../../tests/support/local-test-suite.test.mjs)
currently let an absence of starts stand in for evidence that the runner
reached its blocking decision.

#### Scope

Replace the three fixed waits with observations of the dispatcher's capacity
decision and the contender's admission decision. Hold the relevant jobs or
owner until the test explicitly releases them or cancels the contender.
Preserve the [current resource rules](../../tests/local-test-resources.md)
and the neighboring coverage for independent runs and owner cleanup.
Changes to slot counts, worktree admission policy, and the separate
stale-reclaimer timing check are outside this increment.

The replacement checks synchronize on events under the
[test automation rules](../../AGENTS.md#test-automation) and the
[failing and flaky test policy](../../AGENTS.md#failing-and-flaky-tests).

#### Key examples

- With more checks queued than there are job slots, hold every occupied slot
  until the dispatcher reaches the slot gate with work still queued. Confirm
  that the configured number of jobs started, then release the held jobs and
  verify all checks ran. Exercise the local default, an explicit override, and
  CI's CPU-derived limit.
- While a full suite holds admission, start a contender in a linked worktree
  with a stale token and then another with a copied current token. Each reaches
  the gate and is blocked by the live owner. Cancelling either contender
  leaves the owner's admission intact and starts no contender checks.
- Once a nested full suite returns, a competitor in a linked worktree reaches
  the gate and is blocked by the outer suite. The competitor starts its checks
  after the outer suite releases admission.
