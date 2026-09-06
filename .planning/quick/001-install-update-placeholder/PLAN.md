# Install the Open Dough update placeholder

Status: complete — all three slices verified and delivered individually.
Source: [SEED-001, Story 1](../../seeds/SEED-001-install-and-update-open-dough.md#install-from-github).

## Outcome

Open Dough installs its Codex `dough-update` placeholder from a shallow clone
of the supplied repository's default branch. The installer copies only
`src/skills/dough-update/SKILL.md` to the target project's
`.agents/skills/dough-update/SKILL.md`. Repetition stops with a warning;
`--force` replaces installed content without merging. Open Dough's installed
copy is checked in separately from its distributable source.

Real updating, versions, migration, broader rules, other platforms, and
comprehensive edge cases remain outside this story. ADR 0000 was followed;
ADR 0001 remains Proposed.

## Completed slices and proof

1. **Install and invoke the placeholder — Behavior, done.**
   `bash tests/install.sh` verified matching supplied content and preservation
   of an unrelated skill, from outside the source checkout into a path with
   spaces. A fresh Codex session discovered the temporary installation and
   returned “Updating Open Dough is not implemented yet.”
2. **Stop an ordinary repeat installation — Behavior, done.**
   The same check verified a warning, nonzero exit, explicit `--force`
   instruction, and unchanged locally edited installed content.
3. **Overwrite when the maintainer insists — Behavior, done.**
   The same check verified forced replacement matches the supplied source and
   preserves the unrelated sentinel. Missing/unknown argument checks and Bash
   syntax checks also passed.

Each slice received independent refactor review before commit and push.
Skill metadata validation passed. Usage and enduring behavior are documented
in [README](../../../README.md) and `tests/install.sh`.

## GitHub and Codex demonstration

On 2026-09-06, shallow-cloned `https://github.com/terryyin/open-dough.git`
(default-branch revision `2b45a50`) and ran that clone's installer targeting
Open Dough itself, following README's clone/install steps. The installed file
matched the supplied source. A fresh bundled Codex CLI 0.153.4 session
(`01a0744e-36be-7d02-b967-147bd3aea43f`) invoked `$dough-update` and returned
“Updating Open Dough is not implemented yet.” It ran no commands or edits.

## Learnings

- The standalone Codex CLI 0.144.1 was too old for the configured model; the
  desktop app's bundled CLI 0.153.4 verified native discovery and invocation.
- Automatic command review rejected the README command's `rm -rf` cleanup
  trap. The demonstration retained its temporary clone and completed the same
  clone/install steps without the cleanup trap.
- This repository has no CI workflows or formatter. Focused Bash verification,
  syntax checks, and diff whitespace review replace Donut application tooling.
