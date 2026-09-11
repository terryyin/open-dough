# Slice 4 behavior walkthrough

Candidate: Proposed `dough-execution-retrospective` JSON contract already in
[Select reviews](../../../../../src/skills/dough-execution-retrospective/SKILL.md#select-reviews),
plus install/update preservation documentation. Date: 2026-09-11. These are
local, representative records, not native cross-tool acceptance. Installer
behavior was not changed: existing unrelated-file preservation already kept
project `open-dough.json` outside managed payload writes.

Each fixture below is treated as a separate established project root. Config
path is `<established-planning-directory>/open-dough.json`, default
`.planning/open-dough.json`. This Open Dough worktree still has no
`.planning/open-dough.json`.

## Commands

```bash
bash tests/install-preserves-open-dough-json.sh
bash tests/install.sh
bash tests/install-all-tools.sh
git diff --check
```

The focused test ran real `install.sh` and `open-dough-release.sh apply`
operations, including `--force`, for Codex/Cursor (`--platform cursor`) and
Claude (`--platform claude`) entry contexts. It compared config bytes or
absence before and after each operation. Existing `tests/install.sh` and
`tests/install-all-tools.sh` were rerun as the maintained install/update
seams; they were not extended.

## Preservation journey

The retained bytes are
[`retained/.planning/open-dough.json`](retained/.planning/open-dough.json):
`skipProcessRetrospective` boolean `true` plus unknown `unrelatedFutureSetting`
and `nested`. SHA-256
`46079f7c1966aed1bb57c4ba81b05af390572b5d359a2f8bd3c8347b54b59ccf` matches Slice
1 variant 7. [`absent/`](absent/) has no `open-dough.json`.

| Operation | Entry context | Config before | Config after |
| --- | --- | --- | --- |
| First install | `--platform cursor` | absent | still absent; no `open-dough.json` under skill roots |
| First install | `--platform claude` | absent | still absent |
| First install | `--platform cursor` | retained true + unknown keys | byte-identical `46079f7c…` |
| `--force` install | `--platform cursor` | same retained file | byte-identical |
| First install | `--platform claude` | retained true + unknown keys | byte-identical |
| `--force` install | `--platform claude` | same retained file | byte-identical |
| Old tagged install then ordinary `apply` | `--platform cursor` | retained true + unknown keys | byte-identical after 0.1.1 install and after update to latest |
| `apply --force` | `--platform claude` | same retained file | byte-identical |
| Old tagged install then ordinary `apply` then `apply --force` | Claude then Cursor force | absent | still absent |

`install.sh` and `src/install/open-dough-release-version.sh` do not list
`open-dough.json`. The sourced `managed_files` array does not include it. No
installer prompt, merge, or default-file writer was added.

## Selection after preservation

Walked
[Select reviews](../../../../../src/skills/dough-execution-retrospective/SKILL.md#select-reviews)
against the retained file as this project's `.planning/open-dough.json`.

The preserved object is a JSON object whose known boolean is `true`. Process
review is skipped before any process analysis and before resolving, reading, or
writing [`retained/DearDough.md`](retained/DearDough.md). Unknown keys are
ignored and were left byte-identical by install/update. Implementation and
product review remain independent.

The absent path remains default-on process review: no file was created, so
missing-file default from Slice 1 still applies. [`absent/DearDough.md`](absent/DearDough.md)
may be accessed only because process is on, not because install wrote
configuration.

This is the same selection rule as Slice 1 variants 2, 7, and 1. Fresh native
use after update remains pending Story 2.

## Byte identity

[`checksums.fixtures`](checksums.fixtures) records the evidence files used for
the selection observation. The focused test compared live installer fixture
bytes against a copy of the same retained JSON; those temp trees are not stored
here.

## Behavior review

1. **Invocation context.** Installation docs name the optional project file when
   installing or updating Open Dough. The JSON example is the skill's single
   example; selection, defaults, flags, and invalid-file handling stay in
   Select reviews. The retrospective description already names
   `open-dough.json` / `skipProcessRetrospective`.
2. **Required context.** The established planning directory of the project
   being installed or updated locates the file, defaulting to
   `.planning/open-dough.json`. A missing file is usable absence, not a stop.
   The path is not the skill directory and not the Open Dough source checkout.
3. **Useful outcome.** After ordinary install, ordinary update, and supported
   `--force` replacement on shared Codex/Cursor and Claude paths, retained
   `true` plus unknown keys still mean skip-process, and absence still means
   default-on. No managed-payload list gained this file.

ADR 0006: one JSON contract remains in the runtime skill. Install docs link to
it and record ownership/preservation only. Description, path language, and the
JSON example address the executing project's planning directory.
