# Open Dough

**A shared, AI-augmented software development lifecycle for projects and the tools that help build them.**

Open Dough defines how people and AI work together to develop software. It brings a common set of philosophies, principles, processes, AI agent rules, and AI agent skills into a project's own repository, where they can guide everyday work and evolve alongside the code.

The aim is to define the lifecycle once, reuse it across projects, and make it usable across AI development platforms. The initial platform scope is **Codex, Cursor, and Claude Code**.

> **Status:** The first Codex installer provides a `dough-update` placeholder. Updating and the wider lifecycle content and platform integrations remain planned.

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

### Install the Codex placeholder

With Bash and Git available, run this from the existing target project's root:

```bash
(
  set -e
  source_url=https://github.com/terryyin/open-dough.git
  install_dir=$(mktemp -d)
  trap 'rm -rf "$install_dir"' EXIT
  git clone --depth 1 "$source_url" "$install_dir/open-dough"
  bash "$install_dir/open-dough/install.sh" --target "$PWD"
)
```

Set `source_url` to the cloneable repository URL you want to install from. The
command obtains that repository's default branch and runs its installer. To
install into another existing project, replace `"$PWD"` with its path.

Installation copies `skills/dough-update/SKILL.md` from the source checkout to
`.agents/skills/dough-update/SKILL.md` in the target project. Other project files
are preserved. Start a fresh Codex session in that project and invoke
`$dough-update`. It reports that updating Open Dough is not implemented yet and
makes no changes. See [Codex skill discovery](https://learn.chatgpt.com/docs/build-skills).

To run all script tests from a source checkout, run `npm test` (requires npm)
or `bash scripts/test.sh`. No npm dependencies need to be installed. The runner
discovers all `.sh` files under `tests/` and reports failure if any test fails.

If `.agents/skills/dough-update` already exists, installation warns and stops
without changing it. To reinstall, add `--force` to the installer line in the
clone command above:

```bash
bash "$install_dir/open-dough/install.sh" --target "$PWD" --force
```

This replaces the installed `SKILL.md`, including any local edits, with the
supplied source. It does not merge changes or replace other skills. Review and
commit the installed file in the target project. Open Dough's own installed
copy lives at the same destination, separately from the distributable source.

### Planned update flow

Open Dough will be installed **into a target project's repository**. Installation places lifecycle content and the selected platform integration files there; updating Open Dough directly changes those installed files. Global installation is not supported.

Installation uses the content addressed by the supplied URL. The usual source is the latest content on the repository's default branch (`main` for Open Dough), rather than a published release. An explicitly supplied source URL is honored rather than redirected to a different version.

The initial updater simply fetches and applies the latest default-branch content. It does not detect the installed version or check whether a newer version exists before applying it. Installed-version tracking and update detection are a separate, later story.

The intended adoption flow is:

1. Select the platforms the project uses.
2. Run the installation mechanism with the source URL and target repository to install Open Dough for the selected platforms.
3. Review the added files, add project-specific context, and commit them.
4. Use the installed guidance during development.
5. Run an update to apply the latest default-branch content to the installed files, review the resulting changes, and commit them.

Installing into a project that already has Open Dough stops by default. The `--force` override replaces the installed placeholder, including local edits, without migration or merging.

The Codex installation currently provides only the `dough-update` placeholder. Explicit reinstallation will allow the project to obtain the real updater when it becomes available. Initial shared rules are still under discussion.

Broader file ownership and project-specific additions remain to be defined as more guidance is added. Conflict behavior for the automatic update command remains for later discussion. A simple Codex update comes next, followed by Cursor and Claude Code together.

## Distribution

The initial distribution channel is the [Open Dough GitHub repository](https://github.com/terryyin/open-dough). The intention is to let projects install and update directly from GitHub without requiring publication to a package registry such as npm.

The installer runs from a shallow clone of the supplied repository's default branch, without requiring a published release. The future updater's delivery mechanism remains open. Version tracking is deferred and will not be required for the initial installation and update loop.

Package registry distribution remains an option if it later makes installation or maintenance simpler.

## License

Open Dough is open source under the [MIT License](LICENSE).
