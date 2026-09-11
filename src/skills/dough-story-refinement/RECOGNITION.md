# Recognition: dough-story-refinement

Review: ready for maintainer review

## Original clues

Source on-demand skill: `.agents/skills/story-refinement/SKILL.md` in the
supplied doughnut repository. Project identity is provenance, not a recognition
condition.

## Purpose

Clarify selected stories in their existing seeds before execution planning.

## Triggers

Selected-story goal, scope, and examples need shared understanding; not broad
candidate selection or slice sizing.

## Distinguishing behavior

Conversation reuses prior answers; smallest useful outcome; conditional UI and
ADR checks; stable story anchors; implemented-story cleanup.

## Client project context

Selected stories and prior decisions; seed conventions if creating one;
conditional ADR context and requested execution workflow.

## Differences that rule out replacement

A workflow that requires separate refinement documents, exhaustive test suites,
unconditional architecture sections, or execution on selection is not
equivalent.

The source dependencies `problem-decomposition.mdc` and `planning.mdc` are
Cursor `alwaysApply: true` rules. The shared references preserve the shared
fractal behavior at story and slice resolutions; this skill invokes
the story-level workflow, while the slice skills invoke the execution-level
workflow. They do not replace automatic repository-wide application; client
installation owns that delivery.

Source-specific paths, exact timers, test tooling, and GSD artifact management
remain client project context rather than Open Dough defaults.

## Validation needed

Before release, maintainers must review invocation context, required client project
context, and useful outcome under [AGENTS.md](../../../AGENTS.md), including a
representative use in the intended client project. Extraction-time manual walkthrough:

For a selected totals-export story in an existing seed: retain its anchor and
sibling scheduling story, state the beneficiary and export goal, bound scope to
one team and week, and add a pre-condition → export trigger → totals result
example. Exclude scheduling explicitly; do not create a plan. If excluding
access control would expose another team’s records, leave that boundary
unresolved and stop dependent planning. For a consequential ADR conflict, cite
the relevant Accepted record and stop the conflicting path for human direction
using the linked ADR skill. After implementation, remove spent examples only
once enduring knowledge is captured.

Dependency review: decomposition owns the shared fractal decomposition
reference and seed format; refinement owns the shared story/executable planning
reference. The story and slice skills select the relevant resolution without
copying those rules. Refinement links the existing Open Dough
`dough-adr-awareness` skill, whose inspected source is byte-identical to the
current source copy. Client installation remains separate validation work.

Inspected source SHA-256 values (paths relative to the supplied repository):

- `.agents/skills/story-refinement/SKILL.md`:
  `3415d2fa370ad78a8354029efacf8dc9b13a0dd76d5ace7e850bac18c62e4174`
- `.cursor/rules/planning.mdc`:
  `7a61fd6fa556906d9ee0316899b1cb1718ab98a88bc8e6c6f93bc40ea37c6d5b`
- `.cursor/rules/problem-decomposition.mdc`:
  `744f1099dcd3c3280402eacc38b0a5a22a0d871bae8b9f511f8389ee01a16b33`
- `.agents/skills/dough-adr-awareness/SKILL.md`:
  `6c0f29ceec252eeda4a0c3bb3a0fcc0260a6d0f907ca8467a96dbd39cb43cd25`
