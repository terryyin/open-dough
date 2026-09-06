# Open Dough

**A shared, AI-augmented software development lifecycle for projects and the tools that help build them.**

Open Dough defines how people and AI work together to develop software. It brings a common set of philosophies, principles, processes, AI agent rules, and AI agent skills into a project's own repository, where they can guide everyday work and evolve alongside the code.

The aim is to define the lifecycle once, reuse it across projects, and make it usable across AI development platforms. The initial platform scope is **Codex, Cursor, and Claude Code**.

> **Status:** Codex, Cursor, and Claude Code can install and update the project-local `dough-update` skill from the latest numeric release of a supplied repository URL.

## Install with an AI agent

Open your target project in an AI agent with web and shell access, then ask:

> Install https://github.com/terryyin/open-dough into this project.

**For the installing agent:**

1. Use the user's current project as the target, or their explicitly supplied
   target path. Ask only if the target is unclear. Capture its absolute path
   before cloning so the source checkout does not become the installation target.
2. Explain that installation selects one tool. Codex (default, or
   `--platform codex`) installs `.agents/skills/dough-update/SKILL.md` and a
   numeric `VERSION` record beside it. Cursor (`--platform cursor`) installs
   those files under `.cursor/skills/dough-update/`. Claude Code
   (`--platform claude`) installs them under `.claude/skills/dough-update/`.
   Install only the running tool's copy.
3. Follow the clone/install instructions for that tool
   ([Codex](#install-the-codex-updater), [Cursor](#install-the-cursor-updater),
   or [Claude Code](#install-the-claude-code-updater)), using the URL the user
   supplied. The helper `src/install/open-dough-release.sh` selects the highest
   numeric `vMAJOR.MINOR.PATCH` tag from that URL. Inspect that pinned
   checkout's helper, `install.sh`, and source skill before running the
   installer with `--target` set to the captured project path, and
   `--platform cursor` or `--platform claude` when installing for Cursor or
   Claude Code. Bash and Git are sufficient; installing package dependencies
   is unnecessary.
4. Respect the user's authorization and your environment's permission controls.
   An explicit installation request authorizes the described project-local
   installation; do not ask for the same permission again. If required access
   is unavailable, explain what is needed.
5. If installation reports an existing skill, stop and explain that `--force`
   replaces its contents, including local edits and the selected version
   record. Use it only when the user has
   explicitly authorized that overwrite.
6. Verify the installed skill matches the pinned source and that `VERSION`
   records the same numeric release. Review the target project's diff for
   unrelated changes. Report the installed path, source URL, tag, and commit,
   and tell the user to invoke the updater with the source URL in a fresh
   session of the same tool (`$dough-update` in Codex, `/dough-update` in
   Cursor or Claude Code). Report invocation as verified only if you actually
   observed it. Commit or push only when authorized.

## Inspiration and name

Open Dough is inspired by the [Donut project](https://github.com/nerds-odd-e/doughnut) and the development practices behind it.

Dough is a flexible raw material: you can shape it into many things, and a donut is one specific product made from it. Open Dough carries that idea into software development, making the practices behind Donut reusable and adaptable so other projects can shape them into products of their own.

## What Open Dough shares

Open Dough is the source of the shared lifecycle definition. Each adopting project receives the parts it needs to put that definition into practice.

| Layer | Purpose |
| --- | --- |
| **Philosophies** | Explain the beliefs and reasoning behind the approach to software development. |
| **Principles** | Guide judgment and tradeoffs when there is no prescribed answer. |
| **Process** | Describe how work moves through the lifecycle, including activities, outcomes, and feedback loops. |
| **AI agent rules** | Provide documents that instruct AI agents how to work in the project, written so humans can also understand and review them. |
| **AI agent skills** | Provide reusable skills that AI agents use to perform specific development tasks. |

These layers should reinforce each other: philosophy explains why, principles guide decisions, process organizes work, agent rules direct AI behavior, and agent skills help carry out the work.

## Design principles

The following principles translate the project vision into an initial design direction:

- **Keep the lifecycle portable.** Share the underlying meaning across platforms, with platform-specific files adapting how each tool discovers and uses it.
- **Make guidance part of the project.** Install files into the target repository so the team and its AI tools can inspect them, version them, and review changes together.
- **Keep the shared definition coherent.** Maintain common lifecycle content in Open Dough and derive platform integrations from it, reducing drift between tools.
- **Allow project context to matter.** Give projects a clear way to add their own context and conventions while retaining a shared foundation.
- **Make updates visible.** Updating Open Dough changes installed repository files. Those changes should be understandable as ordinary diffs and reversible through version control.

The detailed development philosophy and AI agent rules remain to be defined. These principles describe how Open Dough itself should be organized and adopted.

## Cross-platform support

Open Dough's architecture has two parts:

- **A shared core:** the philosophies, principles, process, AI agent rules, and AI agent skills that define the lifecycle.
- **Platform integrations:** the instructions, file layouts, and conventions needed to make that core usable in Codex, Cursor, and Claude Code.

The goal is consistent development guidance across tools. Each integration may express that guidance differently to fit its platform's capabilities. Projects should be able to adopt one or more integrations without maintaining separate lifecycle definitions.

The exact file mappings and capability differences will be documented as integrations are implemented.

## Installation and updates

### Install the Codex updater

With Bash and Git available, run this from the existing target project's root:

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

Set `source_url` to the cloneable repository URL you want to install from. The
command selects that repository's highest numeric release tag, not its default
branch or newest tag by date, and runs that snapshot's installer. To
install into another existing project, set `target_project` to its absolute path.
Inspect the pinned helper, `install.sh`, and source skill before running the installer.

Installation copies `src/skills/dough-update/SKILL.md` from the pinned checkout to
`.agents/skills/dough-update/SKILL.md` in the target project and writes a matching
numeric `VERSION` record beside it after verification. Other project files
are preserved. Start a fresh Codex session in that project and invoke
`$dough-update https://github.com/terryyin/open-dough.git`, substituting the source
URL you want to update from. See [Codex skill discovery](https://learn.chatgpt.com/docs/build-skills).

To run all script tests from a source checkout, run `npm test` (requires npm)
or `bash scripts/test.sh`. No npm dependencies need to be installed. The runner
discovers all `.sh` files under `tests/` and reports failure if any test fails.

GitHub Actions runs `npm run lint` and `npm test` independently on every push
and pull request, and can also be started manually. CI uses Node.js 24 and
installs the locked npm dependencies and shell lint tools. New shell tests
under `tests/` (including subdirectories) run automatically without workflow
changes. When adding another test framework, include it in `npm test` so the
same command continues to run the complete suite locally and in CI.

For development checks, use Node.js 20.19+, 22.13+, or 24+ and install the
locked npm dependencies with `npm ci`. Install ShellCheck 0.11+ and shfmt 3.14+
on your PATH as well (`brew install shellcheck shfmt` on macOS).

- `npm run lint` checks JavaScript/TypeScript with ESLint, code and JSON
  formatting with Prettier, and shell scripts with ShellCheck and shfmt.
- `npm run format` applies ESLint fixes, Prettier formatting, ShellCheck's
  available patch fixes, and shfmt formatting, then runs all checks again.
  It exits unsuccessfully and prints the remaining findings if anything cannot
  be fixed automatically or a tool fails.

JavaScript uses ESLint's recommended rules plus strict checks for equality,
braces, unused arguments, mutation, and unsafe constructs. TypeScript also uses
[typescript-eslint's strict type-checked and stylistic presets](https://typescript-eslint.io/users/configs/)
with strict compiler settings. [ShellCheck](https://github.com/koalaman/shellcheck)
enables every optional check and reports all severities, including info and
style. ESLint allows zero warnings; any ShellCheck finding also fails the check.
Shell discovery includes tracked and untracked files, honors Git ignores, and
recognizes `.sh`, `.bash`, `.ksh`, `.bats`, and shell shebangs on extensionless files.
JavaScript/TypeScript and JSON checks exclude dependencies, build output,
coverage, and planning metadata.

If `.agents/skills/dough-update` already exists, installation warns and stops
without changing it. To reinstall, add `--force` to the installer line in the
clone command above:

```bash
bash "$install_dir/open-dough/install.sh" --target "$target_project" --force
```

This replaces the installed `SKILL.md` and `VERSION`, including any local edits, with the
pinned release. It does not merge changes or replace other skills. Review and
commit the installed files in the target project. Open Dough's own installed
copy lives at the same destination, separately from the distributable source.

### Update the installed Codex skill

In a fresh Codex session in the target project, ask:

> $dough-update https://github.com/terryyin/open-dough.git

Supply a cloneable repository URL on every invocation. The updater captures the
target project, resolves the highest numeric release from that URL, inspects
the pinned helper, installer, and source skill, and compares the selected
installation's recorded version before writing. `--platform` may be omitted for
Codex, which is equivalent to `--platform codex`. It updates only
`.agents/skills/dough-update/` in the target project.
Distributable source, unrelated project files, other tools' separate
installations and records, and home-level guidance are preserved.

If the selected record already matches latest, the updater reports that the
installation is current and does not invoke the installer or rewrite installed
files, even when untagged source or local skill text differs. An older or
unknown (missing) record advances directly to latest. A newer recorded version
is preserved with no downgrade. A malformed record is refused rather than
treated as unknown. Requested-version updates are not supported. Release notes
can be read in the tagged `CHANGELOG.md` until automatic changelog presentation
is added.

If your installed skill still clones the default branch and writes only
`SKILL.md`, first run the clone/install flow above once with the explicit
`--force` override. That bootstrap installs the version-aware updater and its
first record; the old skill cannot adopt the new write contract itself.
Then start a fresh Codex session and invoke the updater with your source URL.
Do not assign `0.1.0` to an unversioned copy merely because that source tag
exists.

This update flow assumes the installed skill has no local-edit merge policy.
Additional guidance and handling of project-specific edits remain
future work.

### Install the Cursor updater

With Bash and Git available, run this from the existing target project's root:

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

Set `source_url` to the cloneable repository URL you want to install from. The
command selects that repository's highest numeric release tag, not its default
branch or newest tag by date, and runs that snapshot's installer. To
install into another existing project, set `target_project` to its absolute path.
Inspect the pinned helper, `install.sh`, and source skill before running the installer.
Quote both paths.

Installation copies `src/skills/dough-update/SKILL.md` from the pinned checkout to
`.cursor/skills/dough-update/SKILL.md` in the target project and writes a matching
numeric `VERSION` record beside it after verification. Other project files
and any separate Codex installation are preserved. Start a fresh Cursor session
in that project and invoke `/dough-update https://github.com/terryyin/open-dough.git`,
substituting the source URL you want to update from. See
[Cursor skills](https://cursor.com/docs/skills).

If `.cursor/skills/dough-update` already exists, installation warns and stops
without changing it. To reinstall, add `--force` to the installer line in the
clone command above:

```bash
bash "$install_dir/open-dough/install.sh" --target "$target_project" --platform cursor --force
```

This replaces only the Cursor `SKILL.md` and `VERSION`, including any local edits, with the
pinned release. It does not merge changes, replace other skills, or update a
Codex copy in `.agents/skills`. Review and commit the installed files in the
target project.

### Update the installed Cursor skill

In a fresh Cursor session in the target project, ask:

> /dough-update https://github.com/terryyin/open-dough.git

Supply a cloneable repository URL on every invocation. The updater captures the
target project, resolves the highest numeric release from that URL, inspects
the pinned helper, installer, and source skill, and compares the selected
installation's recorded version before writing. It updates only
`.cursor/skills/dough-update/` in the target project. Distributable source,
unrelated project files, other tools' separate installations and records, and
home-level guidance are preserved.

If the selected record already matches latest, the updater reports that the
installation is current and does not invoke the installer or rewrite installed
files, even when untagged source or local skill text differs. An older or
unknown (missing) record advances directly to latest. A newer recorded version
is preserved with no downgrade. A malformed record is refused rather than
treated as unknown. Requested-version updates are not supported. Release notes
can be read in the tagged `CHANGELOG.md` until automatic changelog presentation
is added.

If your installed skill still clones the default branch and writes only
`SKILL.md`, first run the clone/install flow above once with the explicit
`--force` override. That bootstrap installs the version-aware updater and its
first record. Then start a fresh Cursor session and invoke the updater with
your source URL.

This update flow assumes the installed skill has no local-edit merge policy.
Handling of project-specific edits remains future work.

### Install the Claude Code updater

With Bash and Git available, run this from the existing target project's root:

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

Set `source_url` to the cloneable repository URL you want to install from. The
command selects that repository's highest numeric release tag, not its default
branch or newest tag by date, and runs that snapshot's installer. To
install into another existing project, set `target_project` to its absolute path.
Inspect the pinned helper, `install.sh`, and source skill before running the installer.
Quote both paths.

Installation copies `src/skills/dough-update/SKILL.md` from the pinned checkout to
`.claude/skills/dough-update/SKILL.md` in the target project and writes a matching
numeric `VERSION` record beside it after verification. Other project files
and any separate Codex or Cursor installation are preserved. Start a fresh
Claude Code session in that project and invoke
`/dough-update https://github.com/terryyin/open-dough.git`, substituting the
source URL you want to update from. See
[Claude Code skills](https://code.claude.com/docs/en/skills).

If `.claude/skills/dough-update` already exists, installation warns and stops
without changing it. To reinstall, add `--force` to the installer line in the
clone command above:

```bash
bash "$install_dir/open-dough/install.sh" --target "$target_project" --platform claude --force
```

This replaces only the Claude Code `SKILL.md` and `VERSION`, including any local edits, with
the pinned release. It does not merge changes, replace other skills, or update
a Codex or Cursor copy. Review and commit the installed files in the target
project.

### Update the installed Claude Code skill

In a fresh Claude Code session in the target project, ask:

> /dough-update https://github.com/terryyin/open-dough.git

Supply a cloneable repository URL on every invocation. The updater captures the
target project, resolves the highest numeric release from that URL, inspects
the pinned helper, installer, and source skill, and compares the selected
installation's recorded version before writing. It updates only
`.claude/skills/dough-update/` in the target project. Distributable source,
unrelated project files, other tools' separate installations and records, and
home-level guidance are preserved.

If the selected record already matches latest, the updater reports that the
installation is current and does not invoke the installer or rewrite installed
files, even when untagged source or local skill text differs. An older or
unknown (missing) record advances directly to latest. A newer recorded version
is preserved with no downgrade. A malformed record is refused rather than
treated as unknown. Requested-version updates are not supported. Release notes
can be read in the tagged `CHANGELOG.md` until automatic changelog presentation
is added.

If your installed skill still clones the default branch and writes only
`SKILL.md`, first run the clone/install flow above once with the explicit
`--force` override. That bootstrap installs the version-aware updater and its
first record. Then start a fresh Claude Code session and invoke the updater
with your source URL.

This update flow assumes the installed skill has no local-edit merge policy.
Handling of project-specific edits remains future work.

## Distribution

The initial distribution channel is the [Open Dough GitHub repository](https://github.com/terryyin/open-dough). The intention is to let projects install and update directly from GitHub without requiring publication to a package registry such as npm.

The installer and updater use the highest numeric release tag in the supplied
repository. A matching Git tag, source `VERSION`, and dated changelog entry
identify that snapshot. If no usable numeric release exists, installation and
update stop without falling back to unversioned branch content.

Package registry distribution remains an option if it later makes installation or maintenance simpler.

## Maintainers

Open Dough maintainers prepare and tag source releases with the internal
`release-version` skill in this repository (`$release-version` in Codex,
`/release-version` in Cursor or Claude Code). It writes `VERSION` and
`CHANGELOG.md`, then tags `vMAJOR.MINOR.PATCH`. The skill and the repository
acceptance guard are not installed into adopting projects.

Installation and `dough-update` use the highest numeric release tag of the
supplied repository. Existing unversioned copies need an explicit `--force`
bootstrap once; afterwards a current installation is left unwritten.

## License

Open Dough is open source under the [MIT License](LICENSE).
