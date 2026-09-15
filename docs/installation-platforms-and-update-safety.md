# Platform use, update safety, and contributor checks

Use the [shared installation procedure](installation-and-updates.md#common-installation-flow)
before following the host-specific instructions below.

## Codex

The default platform is Codex; `--platform codex` is equivalent. Installation
writes the client payload under `.agents/skills/` and records the supplied
source and release in `.agents/skills/dough-update/SOURCE` then
`.agents/skills/dough-update/VERSION`. Open Dough's own tracked Codex
installation lives there too, separately from the distributable source.
See [Codex skill discovery](https://learn.chatgpt.com/docs/build-skills).

Start a fresh Codex session in the client project and invoke:

> $dough-update https://github.com/terryyin/open-dough.git

## Cursor

Cursor shares the client payload and records under `.agents/skills/` with
Codex. See
[Cursor skills](https://cursor.com/docs/skills). Start a fresh Cursor session in
the client project and invoke:

> /dough-update https://github.com/terryyin/open-dough.git

## Claude Code

Installation writes the client payload under `.claude/skills/` and records
the supplied source and release in `.claude/skills/dough-update/SOURCE` then
`.claude/skills/dough-update/VERSION`. See
[Claude Code skills](https://code.claude.com/docs/en/skills). Start a fresh
Claude Code session in the client project and invoke:

> /dough-update https://github.com/terryyin/open-dough.git

## Updater safety contract

Ordinary updates of a recorded installation read that root's `SOURCE` and do
not require a URL. First installation takes a supplied cloneable repository
URL. Explicit `--force` uses the recorded SOURCE when present; otherwise it
takes a supplied `--url`. Never infer the client's Git remote or use a
working-tree helper. The updater:

1. Captures the client project before fetching.
2. Resolves the recorded or supplied source's highest numeric release tag,
   fetches its exact commit into a fresh temporary checkout, and validates
   matching `VERSION` and changelog metadata without falling back to a branch
   or lower release.
3. Records the actual source URL, tag, and exact commit.
4. Uses the running tool only as an entry-context hint, then verifies every
   existing native root and adds missing roots.
5. Validates the fetched installer against the release-declared client payload.
6. Compares every existing updater's `VERSION` record. An ordinary update
   without a supplied URL fetches each tagged baseline as data without
   executing it and compares the complete managed payload before skipping,
   preserving, or replacing. Missing siblings are added; a conflicting source,
   newer root, or missing/edited/unverifiable managed root refuses the whole
   operation before writing. It does not infer the client remote or treat an
   existing destination as a clean first install.
   The baseline installer declaration determines which paths were managed; a
   file present only in release source was not installed. Newly declared paths
   must be absent locally before an ordinary update can add them; collisions
   are preserved and refused. An unreadable or unrecognized baseline declaration
   refuses comparison.
7. Verifies that all installed payload files byte-match the fetched sources in every
   native root and that distributable source, unrelated project files, and home
   guidance remain unchanged. Optional
   `.planning/open-dough.json` is unrelated project
   configuration: preserve its exact bytes when present, and do not create it
   when absent. See [Optional process-review preference](installation-and-updates.md#optional-process-review-preference).

An equal recorded version that still matches its recorded release produces no
installed-file writes. An older unchanged installation advances to the selected
release. Ordinary update without a supplied URL refuses when the recorded
baseline cannot be established, including missing or malformed SOURCE or
VERSION, an unavailable tag or source, baseline metadata mismatch, and changed
or missing managed files, even when the recorded version equals latest. A
supplied-URL missing record still advances to the selected release. A verified
newer record is preserved without a downgrade; an unverifiable newer record is
unsupported without writes. A malformed VERSION is refused. Explicit `--force`
skips that comparison and replaces the selected installation with the
inspected latest payload, then `SOURCE` and `VERSION`, including edited,
incomplete, equal, or newer files. It does not merge changes or commit
automatically. Review a resulting diff and start a fresh session in the same
tool to use replaced guidance.

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

- `npm run lint` checks JavaScript with ESLint, code and JSON
  formatting with Prettier, and shell scripts with ShellCheck and shfmt.
- `npm run format` applies ESLint fixes, Prettier formatting, ShellCheck's
  available patch fixes, and shfmt formatting, then runs all checks again. It
  exits unsuccessfully and prints remaining findings if anything cannot be
  fixed automatically or a tool fails.

JavaScript uses ESLint's recommended rules plus strict equality, brace, unused
argument, mutation, and unsafe-construct checks. [ShellCheck](https://github.com/koalaman/shellcheck)
enables every optional check and reports every severity; ESLint allows zero
warnings. Shell discovery includes tracked and untracked files, honors Git
ignores, and recognizes `.sh`, `.bash`, `.ksh`, `.bats`, and shell shebangs on
extensionless files. JavaScript and JSON checks exclude dependencies, build
output, coverage, and planning metadata.
