# Open Dough

**A shared, AI-augmented software development lifecycle for projects and the tools that help build them.**

Open Dough defines how people and AI work together to develop software. It brings a common set of philosophies, principles, processes, AI agent rules, and AI agent skills into a project's own repository, where they can guide everyday work and evolve alongside the code.

The aim is to define the lifecycle once, reuse it across projects, and make it usable across AI development platforms. The initial platform scope is **Codex, Cursor, and Claude Code**.

> **Status:** Codex can install and update the project-local `dough-update` skill from a supplied repository URL. The wider lifecycle content and other platform integrations remain planned.

## Install with an AI agent

Open your target project in an AI agent with web and shell access, then ask:

> Install https://github.com/terryyin/open-dough into this project.

**For the installing agent:**

1. Use the user's current project as the target, or their explicitly supplied
   target path. Ask only if the target is unclear. Capture its absolute path
   before cloning so the source checkout does not become the installation target.
2. Explain that the available installation adds one Codex updater at
   `.agents/skills/dough-update/SKILL.md`. Cursor and Claude Code integrations
   remain planned.
3. Follow the [clone/install instructions](#install-the-codex-updater), using
   the URL the user supplied. Inspect that clone's `install.sh` and source skill
   before running it with `--target` set to the captured project path. Bash and
   Git are sufficient; installing package dependencies is unnecessary.
4. Respect the user's authorization and your environment's permission controls.
   An explicit installation request authorizes the described project-local
   installation; do not ask for the same permission again. If required access
   is unavailable, explain what is needed.
5. If installation reports an existing skill, stop and explain that `--force`
   replaces its contents, including local edits. Use it only when the user has
   explicitly authorized that overwrite.
6. Verify the installed file matches the cloned source and review the target
   project's diff for unrelated changes. Report the installed path and tell the
   user to invoke `$dough-update` with the source URL in a fresh Codex session. Report invocation as
   verified only if you actually observed it. Commit or push only when authorized.

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

## Lifecycle scope

Open Dough is intended to support the full development lifecycle. An initial scope for defining the process is:

1. **Understand** — clarify the problem, desired outcomes, and constraints.
2. **Plan and design** — decide what to build, how to approach it, and how success will be checked.
3. **Implement** — carry out the work with relevant AI agent rules and skills.
4. **Verify and review** — check behavior, quality, and alignment with the intended outcome.
5. **Deliver and learn** — release the work and feed what was learned back into the project and process.

This is a starting structure, not a finalized workflow. The process should support iteration and feedback between activities.

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
  git clone --depth 1 "$source_url" "$install_dir/open-dough"
  bash "$install_dir/open-dough/install.sh" --target "$target_project"
)
```

Set `source_url` to the cloneable repository URL you want to install from. The
command obtains that repository's default branch and runs its installer. To
install into another existing project, set `target_project` to its absolute path.
Inspect the cloned `install.sh` and source skill before running the installer.

Installation copies `src/skills/dough-update/SKILL.md` from the source checkout to
`.agents/skills/dough-update/SKILL.md` in the target project. Other project files
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

This replaces the installed `SKILL.md`, including any local edits, with the
supplied source. It does not merge changes or replace other skills. Review and
commit the installed file in the target project. Open Dough's own installed
copy lives at the same destination, separately from the distributable source.

### Update the installed Codex skill

In a fresh Codex session in the target project, ask:

> $dough-update https://github.com/terryyin/open-dough.git

Supply a cloneable repository URL on every invocation. The updater captures the
target project, fetches a fresh shallow clone of that URL's default branch,
inspects its installer and source skill, and runs that installer with `--force`.
It replaces only `.agents/skills/dough-update/SKILL.md` in the target project.
Distributable source, unrelated project files, and home-level guidance are preserved.

Every invocation fetches and reapplies latest, including when the source content
is unchanged. No installed-version record or published release is needed. Review
the resulting diff and start a fresh Codex session to use the updated guidance.

If your installed skill still reports that updating is not implemented, first
run the clone/install flow above once with the explicit `--force` override.
That bootstrap installs the real updater; the placeholder cannot update itself.
Then start a fresh Codex session and invoke the updater with your source URL.

This update flow assumes the installed skill has no local edits. Additional
guidance, platforms, and handling of project-specific edits remain future work.

## Distribution

The initial distribution channel is the [Open Dough GitHub repository](https://github.com/terryyin/open-dough). The intention is to let projects install and update directly from GitHub without requiring publication to a package registry such as npm.

The installer and updater use a shallow clone of the supplied repository's default branch, without requiring a published release. Version tracking is deferred and is not required for installation or updates.

Package registry distribution remains an option if it later makes installation or maintenance simpler.

## License

Open Dough is open source under the [MIT License](LICENSE).
