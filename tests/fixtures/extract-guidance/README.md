# Extract-guidance native fixture

`project/` is a controlled, self-contained source project for native extraction
proof. Its source skill contains one reusable workflow, one deliberately local
project convention, and an explicit human decision boundary.

Copy this directory and `.agents/skills/extract-guidance/SKILL.md` into a
disposable checkout before invoking `$extract-guidance`. Write generated output
outside `project/.agents/skills/acme-change-readiness/`, then compare source
checksums before and after the run. Generated candidates are evidence, not test
fixtures, and must not be committed as evaluated public payload.
