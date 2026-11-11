# Select shared conventions before test work

Use the project established by the task. Before authoring or changing tests,
identify their project-relative source paths, including intended paths for new
tests. Run the shared selector from this installation:

```sh
node '<installed-execute-plan>/scripts/test-entry-rules.mjs' \
  --project '<project-root>' --source '<test-source>'
```

Repeat `--source` for additional paths. Resolve `<installed-execute-plan>` to the
directory containing this skill, independently of the target project. The command
reads that project's `.planning/open-dough.json` and applies the same
`intent.locations` declarations and file membership as Intent. Folder containment
alone does not establish membership. It accepts intended paths before files exist.

For each source, load only its selected conventions. `pageObjects: true` loads
[the page-object convention](../../dough-page-objects/references/convention.md)
when the task concerns browser tests. `makeMe: true` independently selects the
shared MakeMe guidance available in this installation. If a selected convention's
guidance is unavailable, report that rule as unresolved; do not replace it with
an invented convention or silently treat it as disabled. Leave changes requiring
that rule unperformed and continue independent work. The command's `status`
reports applicability, not whether a convention was available or applied.

A rule is enabled only by the exact boolean `true` on at least one matching
entry. A matching opt-out never vetoes another entry's opt-in. Omitted, false
and non-boolean flags are off. Neither rule implies the other. Missing
configuration means off; malformed or unreadable configuration returns
`status: "unresolved"` and a nonzero command result. Report that problem and stop
changes that depend on the unresolved selection. Do not label it successful opt-out.

For planned and planless execution, run this check before test-authoring
delegation and carry source paths, selected conventions and unresolved checks in
the brief. If exact new test paths emerge during implementation, require the
author to check them before authoring. Recheck when paths or scope change.
Selection adds no authority to convert unrelated tests and imposes no browser
abstraction on non-browser work.
