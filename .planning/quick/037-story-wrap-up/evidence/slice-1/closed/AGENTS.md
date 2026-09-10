# Widget project conventions

- Repository root is this directory.
- Canonical seeds live in `.planning/seeds/`. Story identity is the heading
  or the `widget-status` anchor.
- Executable plans live in `.planning/quick/`. Slice status is
  `planned`, `in-progress`, or `done`.
- Product backlog is `.planning/PRODUCT-BACKLOG.md`.
- A retrospective is complete when the user says so or the conversation
  contains `## EXECUTION RETROSPECTIVE COMPLETE`. Empty output is complete.
- Commit uncommitted spent history before deleting it:
  `git commit -am "chore: preserve spent history before wrap-up"`
- Wrap-up deletions stay in the working tree unless a commit is authorized.
