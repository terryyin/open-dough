---
name: dough-makeme
description: >-
  Checks whether test sources select the shared MakeMe convention and applies
  it when authoring, extending or refactoring tests. Use for ordinary test work
  as well as Dough execution; only configured entries with makeMe enabled
  receive the convention.
---

# Apply MakeMe to selected tests

Before arranging test data, identify the task's project and the repository-relative
source paths you will create or change. Use the established Node runtime to run
this skill's resolver from its installed directory:

```sh
node '<this skill directory>/scripts/select-makeme.mjs' --project '<project root>' -- '<test source>' ...
```

The resolver uses `.planning/open-dough.json` → `intent.locations[]` and the
same `kind`/`include` or `sources` membership as Intent. Only boolean
`"makeMe": true` enables an entry; omission, false and non-booleans stay off.
A matching disabled entry does not veto a matching enabled entry.

`selected` names the applicable files, entries and convention path.
`not-selected` means no enabled source (including missing configuration).
`unresolved` with a nonzero exit means the check could not be completed;
report that diagnostic before dependent test work rather than treating it as
successful selection or silently enabling the rule.

When at least one test source selects an enabled entry, read
[the shared convention](references/convention.md) once and apply it to those
sources. For other sources, follow their project practice without imposing
this convention. Discovering or reading this entrypoint alone does not enable it.

Resolve selection again if your work adds a test source outside the checked scope.
