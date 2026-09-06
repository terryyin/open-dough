# Extract-guidance native fixture

`project/` is a controlled, self-contained source project for successful native
extraction proof. Its source skill contains one reusable workflow, one
deliberately local project convention, and an explicit human decision boundary.

Copy this directory and `.agents/skills/extract-guidance/SKILL.md` into a
disposable checkout before invoking `$extract-guidance`. Write generated output
outside `project/.agents/skills/acme-change-readiness/`, then compare source
checksums before and after the run. Generated candidates are evidence, not test
fixtures, and must not be committed as evaluated public payload.

`unresolved-rule-project/` is the rejection fixture. Its only supplied guidance
is a Cursor rule that applies automatically to every release request and requires
an authoritative `policy/release-evidence.yml` file. That policy file is
deliberately absent. A native extractor run must report both unresolved facts:

- an on-demand public skill would not preserve automatic application; and
- the missing policy prevents preserving the rule's release-specific checks.

Run rejection proof from a disposable copy with a caller-supplied output under
`.planning/extracted-guidance/`. The source rule's checksum must remain unchanged.
The extractor must leave only `ASSESSMENT.md` there. It must not create
`SKILL.md` or `RECOGNITION.md`, write anything under `src/`, or call the result
suitable public guidance.
