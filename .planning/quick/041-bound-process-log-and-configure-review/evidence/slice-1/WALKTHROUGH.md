# Slice 1 behavior walkthrough

Candidate: Proposed `dough-execution-retrospective` source after process-review
selection from optional project `open-dough.json`. Date: 2026-09-11. These are
local, representative records, not native cross-tool acceptance. Output wording
was not used as a pass condition; the walkthrough inspected the meaning of
[Select reviews](../../../../../src/skills/dough-execution-retrospective/SKILL.md#select-reviews)
applied to disposable fixtures, then checked fixture bytes.

Each fixture is treated as a separate established project root. Selection runs
before process analysis and before any `DearDough.md` resolve/read/write. No
fixture config was rewritten. This Open Dough worktree still has no
`.planning/open-dough.json`.

## Selection from stored preference

| Variation | Selection input | Selected reviews | Log / config effect |
| --- | --- | --- | --- |
| 1. Absent config | [`01-absent/`](01-absent/) has no `.planning/open-dough.json` | Process on (default), implementation on, product on | Process may access [`01-absent/DearDough.md`](01-absent/DearDough.md). No config created. |
| 1b. Missing key | [`01-missing-key/.planning/open-dough.json`](01-missing-key/.planning/open-dough.json) is an object with only `unrelatedFutureSetting` | Process on (missing key), unknown key ignored | Config left unchanged. Process may access the log. |
| 2. Config `true` | [`02-skip-true/.planning/open-dough.json`](02-skip-true/.planning/open-dough.json) `{"skipProcessRetrospective": true}` | Process skipped; implementation and product continue | [`02-skip-true/DearDough.md`](02-skip-true/DearDough.md) not resolved, read, or written. Config unchanged. |
| 3. Config `false` | [`03-skip-false/.planning/open-dough.json`](03-skip-false/.planning/open-dough.json) `{"skipProcessRetrospective": false}` | Process on | Process may access the log. Config unchanged. |
| 4a. Invalid type | [`04-invalid-type/.planning/open-dough.json`](04-invalid-type/.planning/open-dough.json) `"skipProcessRetrospective": "true"` | Unresolved process; report non-boolean known setting; implementation and product continue | Log and invalid file untouched. |
| 4b. Malformed JSON | [`04-invalid-malformed/.planning/open-dough.json`](04-invalid-malformed/.planning/open-dough.json) | Unresolved process; report malformed JSON; independent reviews continue | Log and invalid file untouched. |
| 4c. Non-object root | [`04-invalid-root/.planning/open-dough.json`](04-invalid-root/.planning/open-dough.json) is a JSON array | Unresolved process; report non-object root; independent reviews continue | Log and invalid file untouched. |
| 4d. Unreadable file | [`04-unreadable/.planning/open-dough.json`](04-unreadable/.planning/open-dough.json) chmod `a-r`; `cat` exited 1 with Permission denied ([`read-error.txt`](04-unreadable/read-error.txt)) | Unresolved process; report unreadable config. The restored bytes would have meant `true`, but the unreadable invocation did not use that meaning or repair the file. | Log untouched. Mode restored only as harness cleanup; content checksum unchanged. |
| 4e. Explicit skip on invalid | Same as 4a plus `--skip-process` | Process skipped (explicit instruction resolves the invocation) | Log still untouched. Invalid file not repaired. |
| 5. `--skip-process` with `false` | [`05-explicit-skip/.planning/open-dough.json`](05-explicit-skip/.planning/open-dough.json) is `false`; invocation supplies `--skip-process` | Process skipped (flag wins) | [`05-explicit-skip/DearDough.md`](05-explicit-skip/DearDough.md) not accessed. Config still `false`. |
| 6. Explicit include with `true` | [`06-explicit-include/.planning/open-dough.json`](06-explicit-include/.planning/open-dough.json) is `true`; invocation says include process review (no new flag) | Process on for this invocation | Config still `{"skipProcessRetrospective": true}`. Process may access the log. |
| 7. Unknown keys | [`07-unknown-keys/.planning/open-dough.json`](07-unknown-keys/.planning/open-dough.json) has `true` plus `unrelatedFutureSetting` and `nested` | Process skipped from the known boolean; extra keys ignored | Config byte-identical. Log not accessed. |
| 8. Established planning directory | Established dir is `plans/`; [`08-alt-planning/plans/open-dough.json`](08-alt-planning/plans/open-dough.json) is `true`. Unused default [`08-alt-planning/.planning/open-dough.json`](08-alt-planning/.planning/open-dough.json) is `false` | Process skipped from `plans/` | Default `.planning` file not used for selection and not rewritten. Log not accessed. |
| 9a. Skill-adjacent vs project `false` | Project [`09-misleading-skill/.planning/open-dough.json`](09-misleading-skill/.planning/open-dough.json) is `false`. [`09-misleading-skill/.agents/skills/dough-execution-retrospective/open-dough.json`](09-misleading-skill/.agents/skills/dough-execution-retrospective/open-dough.json) is `true` | Process on from this project's file | Skill-adjacent `true` ignored. Both configs unchanged. |
| 9b. Skill-adjacent vs absent project file | [`09-misleading-absent/`](09-misleading-absent/) has no project `open-dough.json`; skill-adjacent file is `true` | Process on (absence default) | No project config created. Skill-adjacent file ignored and unchanged. |
| 10. `--skip-product` with `false` | [`10-skip-product/.planning/open-dough.json`](10-skip-product/.planning/open-dough.json) is `false`; `--skip-product` | Product skipped; process still on | Process may access the log. Product analysis omitted. |
| 10b. `--skip-product` with `true` | [`10-skip-product-and-process/.planning/open-dough.json`](10-skip-product-and-process/.planning/open-dough.json) is `true`; `--skip-product` | Product skipped; process skipped independently | [`10-skip-product-and-process/DearDough.md`](10-skip-product-and-process/DearDough.md) not accessed. |
| 11. Default-on independent reviews | [`11-default-independent/`](11-default-independent/) has no config and no skip flags | Implementation, process, and product all on from the same selection rule | Same rule as variant 1: missing file is default-on; neither skip is implied. |

Contradictory explicit instructions (`--skip-process` together with an
include-process request) are not resolved by the stored preference; the skill
requires ordinary clarification before acting. No new include-process flag was
added.

## Byte identity

Skipped or unresolved variants did not open `DearDough.md` as review context.
After selection, every original fixture file matched
[`checksums.fixtures`](checksums.fixtures). Absent-config fixtures still have no
`open-dough.json`. The worktree root still has no `.planning/open-dough.json`.

## Behavior review

1. **Invocation context.** Frontmatter names `open-dough.json` and
   `skipProcessRetrospective` with the independent skip flags. The body applies
   one selection rule before process analysis or log access. The skill is for
   an execution retrospective in this project, not for editing installed
   guidance.
2. **Required context.** The established planning directory is required to locate
   optional config and defaults to `<project-root>/.planning`. A missing file or
   key is usable default-on. Invalid or unreadable config names the error, leaves
   process unresolved, and continues independent reviews. The project root is
   this task's project, not this skill's directory.
3. **Useful outcome.** Config `true` omits process and log access while
   implementation and product continue. `--skip-process` wins over stored
   `false`. An explicit include-process request runs process this invocation
   without editing stored `true`. Unknown keys and invalid files stay
   byte-identical. A misleading skill-adjacent file does not change selection.

ADR 0006: the JSON contract lives once in the runtime skill. Recording links to
that rule instead of repeating it. Description, heading, example, and path
language address the executing project. Maintainer terms stay in this
recognition record. Slices 2–4 are not implemented here.

Existing "do not delete entries" recording rules are unchanged.
