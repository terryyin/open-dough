---
name: dough-makeme
description: >-
  Checks whether test sources select the shared MakeMe convention and applies
  it when authoring, extending or refactoring tests. Use for ordinary test work
  as well as Dough execution; only configured entries with makeMe enabled
  receive the convention.
---

# Apply MakeMe to selected tests

Before arranging test data, identify the task's project and the test source
paths you will create or change. Read that project's `.planning/open-dough.json`.
Check each path against `intent.locations[]`, preserving its existing
`kind`/`include` or `sources` membership. Folder containment alone is insufficient.
An entry enables this convention only with `"makeMe": true`; omission, `false`
and non-boolean values do not enable it. A matching disabled entry does not veto
another matching enabled entry.

Missing configuration means no opt-in. Report unreadable or malformed
configuration as an unresolved applicability check; do not claim successful
selection or silently enable the rule.

When at least one test source selects an enabled entry, read
[the shared convention](references/convention.md) once and apply it to those
sources. For other sources, follow their project practice without imposing
this convention. Discovering or reading this entrypoint alone does not enable it.

Resolve selection again if your work adds a test source outside the checked scope.
