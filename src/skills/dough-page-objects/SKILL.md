---
name: dough-page-objects
description: >-
  Checks per-entry page-object guidance when authoring or changing browser tests,
  including end-to-end tests and page/component objects. Applies the shared
  convention only to test sources selected by pageObjects: true in the
  project's intent.locations configuration; other entries keep their practice.
---

# Check the test entry before browser test work

Use the project established by the task. Identify each test source path, including
an intended path for a new test, before applying this convention.

Read `.planning/open-dough.json` in that project and resolve the source's membership
in `intent.locations`. Reuse the project's existing test-file selection: an entry's
`kind` and `include`, or its `sources` when present, select files; folder containment
alone is insufficient. Patterns are relative to the entry and case-sensitive.

Load [the page-object convention](references/convention.md) only when at least one
matching entry has the exact boolean `pageObjects: true`. A matching false entry
does not veto another entry's opt-in. Omitted, false, and non-boolean values are
off. `makeMe` is a separate selection and does not enable this convention.

Missing configuration means off. Report unreadable or malformed configuration as
an unresolved applicability check; do not claim it selected or disabled a rule.
If a required source path or its membership cannot be established, name that gap
before making changes that depend on this convention. Recheck when the test's path
or the work's scope changes. Selection adds no browser abstraction to non-browser
work and grants no authority to convert unrelated tests.
