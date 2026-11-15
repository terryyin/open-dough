# Open Dough maintainer guidance

Internal to this repository; do not distribute via the installer.

## Skill authoring

Before adding, editing or reviewing an Open Dough skill or rule, or an internal
maintainer skill, follow
[author-open-dough-skills](.agents/skills/author-open-dough-skills/SKILL.md).

## Planning records

This repository keeps its product backlog in `.planning/PRODUCT-BACKLOG.md`,
seeds in `.planning/seeds/`, and executable plans (“Slice Plans”) in
`.planning/slice-plans/<NNN>-<slug>/PLAN.md`.

## Test automation

- Before authoring or changing a test, apply the installed
  [`dough-makeme`](.agents/skills/dough-makeme/SKILL.md) and, for browser
  tests, [`dough-page-objects`](.agents/skills/dough-page-objects/SKILL.md)
  selection. [Test data architecture](Distribution/tests/README.md#test-data-architecture)
  and [journey writing](dashboard/tests/writing-journeys.md#page-objects) give
  this project's builders, harness boundaries and pilot context.
- Never use `test.slow()`.
- Keep the default test timeout. Override it only when essential, inside the
  individual test. Suite, file, group, and hook overrides are forbidden.

## Failing and flaky tests

Follow the shared
[failure policy](Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
as written, and carry it by link into every plan, delegation brief and repair
handoff.

A plan's local-gate line names the maintained macOS sleep guard and its power
condition from [machine sleep on macOS](Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
