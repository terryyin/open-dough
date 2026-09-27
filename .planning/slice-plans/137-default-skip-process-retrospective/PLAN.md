# Run process retrospectives only when a project enables them

## Source

[Run process retrospectives only when a project enables them](../../seeds/SEED-001-install-and-update-open-dough.md#default-skip-process-retrospective)
— Identity: SEED-001#default-skip-process-retrospective.

## Goal and scope

A project using Open Dough gets process review in its execution retrospective
only when it enables it; code/design and product review stay on by default.

Included: the review-selection default in
`src/skills/dough-execution-retrospective/SKILL.md` (description and "Select
reviews"), the preference section of `docs/installation-and-updates.md`,
SEED-010's recorded default, and this repository's own
`.planning/open-dough.json` with `"skipProcessRetrospective": false`.

Excluded: installer or updater writes (rejected under
[ADR 0004](../../../docs/adrs/0004-client-installation-and-update-accepted.md)
item 4), new flags, prompts, CHANGELOG wording (owned by the release), and paid
native runs (manual only, outside this story).

PFE: the preference reader already lives in the retrospective's review
selection; this plan changes its default and adds no responsibility elsewhere.
No North Star topic applies.

## Decisive premises

| Premise | Observation | Result |
| --- | --- | --- |
| Only the retrospective skill interprets `skipProcessRetrospective`; no script reads it | `git grep -n skipProcessRetrospective` over `src docs tests scripts` | Holds: skill prose, the docs example, and three test fixtures that only write the file as preserved data |
| No other skill, doc, or test states the process default | `git grep -n -i -E "missing file/key\|enables process\|process review\|process retrospective"` over `src/skills tests scripts README.md docs` | Holds: only the retrospective skill and `docs/installation-and-updates.md:39` |
| An include-process request already exists as an explicit override | `src/skills/dough-execution-retrospective/SKILL.md:41-42` | Holds: "an include-process request enables without a new flag" |
| Installer and updater leave `.planning/open-dough.json` untouched | `/opt/homebrew/bin/bash tests/install-preserves-open-dough-json.sh` | Exit 0 on `fb9cf871` |
| A file with only the skip key keeps this repo's CI on GitHub | `src/skills/dough-execute-plan/references/runtime-setup.md:42` | Holds: absent `ciAdapter` selects GitHub |

## Outside-in proof

| Key example | Owner | Signal |
| --- | --- | --- |
| No config → retrospective runs code/design and product review only, no process analysis, no history access, no `DearDough.md` | Slice 1 | Behavior review walk of the new "Select reviews" text |
| `false` → process review runs | Slice 1 | Behavior review walk; this repo's `.planning/open-dough.json` parses to `false` |
| No config plus explicit include-process request → process review runs | Slice 1 | Behavior review walk (override sentence unchanged, still precedes storage) |
| Malformed or non-boolean value → error reported, process omitted, other reviews continue | Slice 1 | Behavior review walk (unresolved-selection sentence unchanged) |
| Updated older project without the key → process skipped; file left byte-for-byte or absent | Slice 1 | Behavior review walk plus `tests/install-preserves-open-dough-json.sh` green |

The behavior review is the AGENTS.md walk (invocation context, required
context, useful outcome) over the five examples, recorded in slice 1's
evidence.

## Ordered slices

### 1. Process review runs only when the project enables it
Type: Behavior
Status: planned
Proof: behavior review walk of all five key examples against the changed
skill text; `/opt/homebrew/bin/bash tests/install-preserves-open-dough-json.sh`
exit 0; `node -e 'process.exit(require("./.planning/open-dough.json").skipProcessRetrospective===false?0:1)'`
exit 0; `npm run lint`.

Behavior: a project with no `skipProcessRetrospective` setting finishes a
planned execution → its retrospective skips process review and writes no
`DearDough.md`, while a project that sets `false` (this repository included)
still gets process review, and explicit invocation choices and the
malformed-file path behave as before.

Change the missing-file/missing-key rule in "Select reviews" and the opening
"by default" sentence, and adjust the description so it names process review
as opt-in. Rewrite the docs paragraph so the enabling example is `false` and
absence means skipped. Update SEED-010's "on by default" bullet. Add this
repository's `.planning/open-dough.json`. One slice: the documentation, record,
and repository setting only restate or preserve the same rule, so separating
them would not give independent progress or proof.
