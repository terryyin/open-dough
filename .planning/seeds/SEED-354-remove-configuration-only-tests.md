---
id: SEED-354
status: active
planted: 2026-11-14
trigger_when: selected from the product backlog
scope: story
---

# SEED-354 — Remove tests that only assert configuration or data

<a id="remove-configuration-only-tests"></a>

### Remove tests that only assert configuration or data

**Identity:** SEED-354#remove-configuration-only-tests
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/626-remove-configuration-only-tests/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"782f051442ef5034601a5a6faf7c2971d44ef779b2263300714e701b40d8c2ae","plan":"097ca4b5e42e00033de1f5f2abc4a9b1e1b9490b722134399d2c46f64a4fe571"}}
```

#### Goal

A maintainer can change internal configuration and test data without editing
assertions that merely duplicate those values, while meaningful behavior remains protected.

#### Scope

- Review unit tests and relevant end-to-end tests across the project
  (Distribution, dashboard backend, frontend and integrated UI, and e2e) for
  assertions whose only subject is configuration, constant data, fixture shape
  or builder output.
- Remove configuration/data-only tests and redundant constraints, including exact
  worker/shard counts and workflow literals that freeze implementation choices.
- Keep or reshape proof when a configuration or data value produces meaningful
  behavior worth protecting: observe that behavior rather than copy its inputs.
  A behavior test whose expected output copies a configured value derives that
  expectation from the configuration it reads.
- A check that two settings agree with each other (for example a summary's
  declared parts and the matrix that writes them) catches an inconsistent change
  and stays.
- Do not delete behavior tests merely because their setup uses configuration or data.
  Preserve checks such as independent concurrent reports, complete selection/proof,
  and useful validation behavior.
- Do not replace removed assertions with another snapshot of the same data.
- Tests that only restate shipped skill and reference wording (the former
  `*-guidance.test.mjs` family) keep the same text in a second place and are
  removed; this part landed directly on trunk before execution. Tests that run
  a documented example, embedded recipe or formatter block through the code
  that consumes it stay.
- Rendered style values (`toHaveCSS`) and files the product writes after a user
  action are observed results, not candidates.

#### Examples

- A test only compares configured worker counts with literal numbers: remove it.
- A maintainer reduces the e2e shards from 5 to 4 and updates the CI proof
  summary's declared parts to match, or moves the test-run deadline from 320 to
  330 seconds: the tests that read `ci.yml` stay green. Today the deadline-epoch,
  browser-group roster and CI proof replay tests fail on that consistent change.
- The same maintainer forgets to update the declared parts: a consistency or
  replay test still fails.
- A real run omits a required case or loses another run's report: retain meaningful
  proof that observes and catches that behavior.
- A schema rejects invalid user input with a useful error: judge its behavior;
  the shipped internal fixture merely matching the schema is not independent value.
- A fixture repository gains one more commit, or a machine record directory gains
  one more file: tests that care only that the worker built the whole history,
  or that an action left other records unchanged, stay green.

#### Test guidance already updated

The [test automation instructions](../../AGENTS.md#test-automation) already
require authors and reviewers to identify the concrete regression an assertion
would catch and to reject assertions that merely restate configuration or data.
During the audit, apply the wording to examples found in the suite. Check whether
it clearly tells authors and reviewers when to remove an assertion and when to
keep or rewrite it to verify observable behavior. Flag any example the wording
does not resolve and suggest a focused clarification.

#### Origin and priority

The developer requested this audit during SEED-350's early closure, which removed
three newly introduced configuration-string checks. The wider audit remains open.
