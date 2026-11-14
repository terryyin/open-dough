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

#### Goal

A maintainer can change internal configuration and test data without editing
assertions that merely duplicate those values, while meaningful behavior remains protected.

#### Scope

- Review unit tests and relevant end-to-end tests across the project for assertions
  whose only subject is configuration, constant data, fixture shape or builder output.
- Remove configuration/data-only tests and redundant constraints, including exact
  worker/shard counts and workflow literals that freeze implementation choices.
- Keep or reshape proof when a configuration or data value produces meaningful
  behavior worth protecting: observe that behavior rather than copy its inputs.
- Do not delete behavior tests merely because their setup uses configuration or data.
  Preserve checks such as independent concurrent reports, complete selection/proof,
  and useful validation behavior.
- Do not replace removed assertions with another snapshot of the same data.

#### Examples

- A test only compares configured worker counts with literal numbers: remove it.
- A real run omits a required case or loses another run's report: retain meaningful
  proof that observes and catches that behavior.
- A schema rejects invalid user input with a useful error: judge its behavior;
  the shipped internal fixture merely matching the schema is not independent value.

#### Origin and priority

Explicit developer request during SEED-350's early closure; first queued story.
The current change drops its three newly introduced configuration-string checks.
The wider audit is this story, not work already completed by that small removal.
