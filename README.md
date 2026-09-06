# Open Dough

**A shared, AI-augmented software development lifecycle for projects and the tools that help build them.**

Open Dough defines how people and AI work together to develop software. It brings a common set of philosophies, principles, processes, AI agent rules, and AI agent skills into a project's own repository, where they can guide everyday work and evolve alongside the code.

The aim is to define the lifecycle once, reuse it across projects, and make it usable across AI development platforms. The initial platform scope is **Codex, Cursor, and Claude Code**.

> **Status:** Codex, Cursor, and Claude Code can install and update the
> project-local public payload (`dough-update` plus `dough-adr-awareness` and
> its recognition record) from a supplied repository URL.

## Install with an AI agent

Open your target project in an AI agent with web and shell access, then ask:

> Install https://github.com/terryyin/open-dough into this project.

**For the installing agent:**

1. Use the user's current project as the target, or their explicitly supplied
   target path. Ask only if the target is unclear. Capture its absolute path
   before cloning so the source checkout does not become the installation target.
2. Explain that installation selects one tool. Codex (default, or
   `--platform codex`) installs under `.agents/skills/`, Cursor (`--platform
   cursor`) under `.cursor/skills/`, and Claude Code (`--platform claude`)
   under `.claude/skills/`. Each receives exactly
   `dough-update/SKILL.md`, `dough-adr-awareness/SKILL.md`, and
   `dough-adr-awareness/RECOGNITION.md`. Install only the running tool's copy.
3. Follow the clone/install instructions for that tool
   ([Codex](docs/installation-and-updates.md#codex),
   [Cursor](docs/installation-and-updates.md#cursor), or
   [Claude Code](docs/installation-and-updates.md#claude-code)), using the URL
   the user supplied. Inspect that clone's `install.sh` and all three declared
   public source files before running it with `--target` set to the captured
   project path, and `--platform cursor` or `--platform claude` when installing
   for Cursor or Claude Code. Bash and Git are sufficient; installing package
   dependencies is unnecessary.
4. Respect the user's authorization and your environment's permission controls.
   An explicit installation request authorizes the described project-local
   installation; do not ask for the same permission again. If required access
   is unavailable, explain what is needed.
5. If installation reports an existing skill, stop and explain that `--force`
   replaces its contents, including local edits. Use it only when the user has
   explicitly authorized that overwrite.
6. Verify all three installed files match the cloned sources and review the
   target project's diff for unrelated changes. Report the installed paths and
   tell the user to invoke the updater with the source URL in a fresh session of
   the same tool (`$dough-update` in Codex, `/dough-update` in Cursor or Claude
   Code).
   Report invocation as verified only if you actually observed it. Commit or
   push only when authorized.

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

See [Installation and updates](docs/installation-and-updates.md) for the exact
three-file payload, per-platform commands, updater safety contract, legacy
bootstrap path, and contributor checks.

## Distribution

The initial distribution channel is the [Open Dough GitHub repository](https://github.com/terryyin/open-dough). The intention is to let projects install and update directly from GitHub without requiring publication to a package registry such as npm.

The installer and updater use a shallow clone of the supplied repository's default branch, without requiring a published release. Version tracking is deferred and is not required for installation or updates.

Package registry distribution remains an option if it later makes installation or maintenance simpler.

## Maintainers

Open Dough maintainers prepare and tag source releases with the internal
`release-version` skill in this repository (`$release-version` in Codex,
`/release-version` in Cursor or Claude Code). It writes `VERSION` and
`CHANGELOG.md`, then tags `vMAJOR.MINOR.PATCH`. The skill and the repository
acceptance guard are not installed into adopting projects.

Installation and `dough-update` still use a shallow clone of the supplied
repository's default branch. A source version tag does not change that
behavior; version-aware updates are not implemented yet.

## License

Open Dough is open source under the [MIT License](LICENSE).
