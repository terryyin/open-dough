# Installation and updates

Open Dough installs a project-local public payload into one tool's native skill
root. The payload is exactly:

- `dough-update/SKILL.md`
- `dough-adr-awareness/SKILL.md`
- `dough-adr-awareness/RECOGNITION.md`

The source files live under `src/skills/`. Installation preserves unrelated
project files, home-level guidance, and any other tool's separate installation.

## Common installation flow

Run the platform command below from the existing target project's root. Set
`source_url` to the cloneable repository URL you want to install from. To install
into another existing project, set `target_project` to its absolute path.

Each command clones the source repository and pins its highest numeric
`vMAJOR.MINOR.PATCH` release before running the installer. Before running it,
inspect the pinned release helper, `install.sh`, and all three declared public
source files. Bash and Git are sufficient; installing package dependencies is
unnecessary.

If either managed skill already exists, installation warns and stops before
changing any managed file. Reinstall only when overwriting all managed files,
including local edits, is intended: add `--force` to the installer command. The
installer does not merge changes or replace other skills. Review and commit the
installed files in the target project.

## Codex

```bash
(
  set -e
  target_project=$PWD
  source_url=https://github.com/terryyin/open-dough.git
  install_dir=$(mktemp -d)
  trap 'rm -rf "$install_dir"' EXIT
  git clone "$source_url" "$install_dir/open-dough"
  bash "$install_dir/open-dough/src/install/open-dough-release.sh" \
    pin-latest "$install_dir/open-dough" "$source_url"
  bash "$install_dir/open-dough/install.sh" --target "$target_project"
)
```

The default platform is Codex; `--platform codex` is equivalent. Installation
writes the three payload files under `.agents/skills/` and records the release
in `.agents/skills/dough-update/VERSION`. Open Dough's own tracked Codex
installation lives there too, separately from the distributable source.
See [Codex skill discovery](https://learn.chatgpt.com/docs/build-skills).

Start a fresh Codex session in the target project and invoke:

> $dough-update https://github.com/terryyin/open-dough.git

## Cursor

```bash
(
  set -e
  target_project=$PWD
  source_url=https://github.com/terryyin/open-dough.git
  install_dir=$(mktemp -d)
  trap 'rm -rf "$install_dir"' EXIT
  git clone "$source_url" "$install_dir/open-dough"
  bash "$install_dir/open-dough/src/install/open-dough-release.sh" \
    pin-latest "$install_dir/open-dough" "$source_url"
  bash "$install_dir/open-dough/install.sh" --target "$target_project" --platform cursor
)
```

Installation writes the three payload files under `.cursor/skills/` and records
the release in `.cursor/skills/dough-update/VERSION`. See
[Cursor skills](https://cursor.com/docs/skills). Start a fresh Cursor session in
the target project and invoke:

> /dough-update https://github.com/terryyin/open-dough.git

## Claude Code

```bash
(
  set -e
  target_project=$PWD
  source_url=https://github.com/terryyin/open-dough.git
  install_dir=$(mktemp -d)
  trap 'rm -rf "$install_dir"' EXIT
  git clone "$source_url" "$install_dir/open-dough"
  bash "$install_dir/open-dough/src/install/open-dough-release.sh" \
    pin-latest "$install_dir/open-dough" "$source_url"
  bash "$install_dir/open-dough/install.sh" --target "$target_project" --platform claude
)
```

Installation writes the three payload files under `.claude/skills/` and records
the release in `.claude/skills/dough-update/VERSION`. See
[Claude Code skills](https://code.claude.com/docs/en/skills). Start a fresh
Claude Code session in the target project and invoke:

> /dough-update https://github.com/terryyin/open-dough.git

## Updater safety contract

Supply a cloneable repository URL on every updater invocation. The updater:

1. Captures the target project before fetching.
2. Resolves the URL's highest numeric release tag, fetches its exact commit into
   a fresh temporary checkout, and validates matching `VERSION` and changelog
   metadata without falling back to a branch or lower release.
3. Records the actual source URL, tag, and exact commit.
4. Selects the running tool's native skill root without inferring the tool from
   directories that happen to exist.
5. Validates the fetched installer against the exact three-file public payload.
6. Compares the selected updater's `VERSION` record and runs the pinned
   installer with `--force` only when replacement is required.
7. Verifies that all three installed files byte-match the fetched sources and
   that distributable source, unrelated project files, other tools' separate
   installations, and home guidance remain unchanged.

An equal recorded version produces no installed-file writes. An older or missing
record advances to the selected release, a newer record is preserved without a
downgrade, and a malformed record is refused. Review a resulting diff and start
a fresh session in the same tool to use replaced guidance. The update flow
assumes the installed skill has no local edits; project-specific edit handling
remains future work.

## Legacy bootstrap

An older installed updater may authorize only replacement of its own `SKILL.md`
and must refuse the expanded three-file installer. Do not bypass or reinterpret
that refusal as success. Bootstrap explicitly: pin a fresh clone to the supplied
repository's highest numeric release, inspect the helper, installer, and all
three public source files, then run that pinned installer once with the selected
platform and `--force`.
The old updater cannot perform a migration it correctly refuses. Start a fresh
session before invoking the newly installed updater.

## Contributor checks

To run all script tests from a source checkout, run `npm test` (requires npm) or
`bash scripts/test.sh`. No npm dependencies need to be installed. The runner
discovers all `.sh` files under `tests/` and reports failure if any test fails.

GitHub Actions runs `npm run lint` and `npm test` independently on every push and
pull request, and can also be started manually. CI uses Node.js 24 and installs
the locked npm dependencies and shell lint tools. New shell tests under `tests/`
run automatically without workflow changes. When adding another test framework,
include it in `npm test` so the same command remains the complete suite locally
and in CI.

For development checks, use Node.js 20.19+, 22.13+, or 24+ and install the locked
npm dependencies with `npm ci`. Install ShellCheck 0.11+ and shfmt 3.14+ on your
PATH as well (`brew install shellcheck shfmt` on macOS).

- `npm run lint` checks JavaScript/TypeScript with ESLint, code and JSON
  formatting with Prettier, and shell scripts with ShellCheck and shfmt.
- `npm run format` applies ESLint fixes, Prettier formatting, ShellCheck's
  available patch fixes, and shfmt formatting, then runs all checks again. It
  exits unsuccessfully and prints remaining findings if anything cannot be
  fixed automatically or a tool fails.

JavaScript uses ESLint's recommended rules plus strict equality, brace, unused
argument, mutation, and unsafe-construct checks. TypeScript also uses
[typescript-eslint's strict type-checked and stylistic presets](https://typescript-eslint.io/users/configs/)
with strict compiler settings. [ShellCheck](https://github.com/koalaman/shellcheck)
enables every optional check and reports every severity; ESLint allows zero
warnings. Shell discovery includes tracked and untracked files, honors Git
ignores, and recognizes `.sh`, `.bash`, `.ksh`, `.bats`, and shell shebangs on
extensionless files. JavaScript/TypeScript and JSON checks exclude dependencies,
build output, coverage, and planning metadata.
