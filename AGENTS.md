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

Keep one-off analysis in the conversation. If upcoming work depends on it,
capture the decision, baseline, and limits in the seed until a plan exists.
Keep any working evidence the execution still needs with that plan. For
evidence shared across stories, link to one recoverable source and carry only
the relevant excerpt into each plan. Remove spent evidence at wrap-up and use
Git for recovery. Use `docs/` and `docs/maintainer/` for maintained guidance,
decisions, and findings with an ongoing owner.

## Test automation

- Before authoring or changing a test, apply the installed
  [`dough-makeme`](.agents/skills/dough-makeme/SKILL.md) and, for browser
  tests, [`dough-page-objects`](.agents/skills/dough-page-objects/SKILL.md)
  selection. [Test data architecture](Distribution/tests/README.md#test-data-architecture)
  and the [dashboard test guide](dashboard/tests/README.md) give this project's
  builders and harness boundaries. The
  [fluent side-panel page objects](dashboard/tests/sidePanelPages.ts) show
  the phase-and-cue form of the Side panel journeys.
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
