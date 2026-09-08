# Open Dough

**A shared, AI-augmented software development lifecycle for projects and the tools that help build them.**

Open Dough defines how people and AI work together to develop software. It brings a common set of philosophies, principles, processes, AI agent rules, and AI agent skills into a project's own repository, where they can guide everyday work and evolve alongside the code.

The aim is to define the lifecycle once, reuse it across projects, and make it usable across AI development platforms. The initial platform scope is **Codex, Cursor, and Claude Code**.

> **Status:** Codex, Cursor, and Claude Code can install and update the
> project-local two-skill public payload (`dough-update` plus
> `dough-adr-awareness`) from the latest numeric release of a supplied
> repository URL. Codex and Cursor share `.agents/skills/`; Claude Code uses
> `.claude/skills/`. Recognition records remain source-only maintainer material.

## Install with an AI agent

Open your client project in an AI agent with web and shell access, then ask:

> Install https://github.com/terryyin/open-dough into this project.

**For the installing agent:**

1. Use the user's current project as the target, or their explicitly supplied
   target path. Ask only if the target is unclear. Capture its absolute path
   before cloning so the source checkout does not become the installation target.
2. Explain that one installation supplies all three tools. Codex (default, or
   `--platform codex`) and Cursor (`--platform cursor`) share
   `.agents/skills/`; Claude Code (`--platform claude`) uses `.claude/skills/`.
   The platform is an entry-context hint and every successful operation writes
   both physical roots. Do not install the source recognition record.
3. Follow the shared [safe installation procedure](docs/installation-and-updates.md#common-installation-flow)
   with the supplied URL and running tool
   ([Codex](docs/installation-and-updates.md#codex),
   [Cursor](docs/installation-and-updates.md#cursor), or
   [Claude Code](docs/installation-and-updates.md#claude-code)). Select and pin
   the highest numeric release using Git before any fetched script runs. Inspect
   that snapshot's installer, helper and dependencies, and two public sources;
   then revalidate the selection and invoke its installer directly. Keep ownership
   of the temporary checkout through inspection and clean it on success or failure.
   Bash and Git are sufficient; installing package dependencies is unnecessary.
4. Respect the user's authorization and your environment's permission controls.
   An explicit installation request authorizes the described project-local
   installation; do not ask for the same permission again. If required access
   is unavailable, explain what is needed.
5. If installation reports an existing skill, stop and explain that `--force`
   replaces its contents, including local edits. Use it only when the user has
   explicitly authorized that overwrite. A known older installation that lacks
   `SOURCE` needs that one-time supplied-source `--force` bootstrap.
6. Verify both installed files match the pinned sources, the updater's
   `SOURCE` record matches the supplied source, the `VERSION` record matches
   the selected release, and the client project's diff contains no unrelated
   changes. Report the installed paths, source tag and commit, and tell the
   user to invoke the updater in a fresh session of the same tool
   (`$dough-update` in Codex, `/dough-update` in Cursor or Claude Code). Later
   ordinary updates use the recorded `SOURCE` and do not need the URL
   repeated. Explicit `--force` of a recorded installation also uses that
   `SOURCE` when present; otherwise supply `--url`.
   Report invocation as verified only if you actually observed it. Commit or
   push only when authorized.

## Inspiration and name

Open Dough is inspired by the [Donut project](https://github.com/nerds-odd-e/doughnut) and the development practices behind it.

Dough is a flexible raw material: you can shape it into many things, and a donut is one specific product made from it. Open Dough carries that idea into software development, making the practices behind Donut reusable and adaptable so other projects can shape them into products of their own.

## What Open Dough shares

Open Dough is the source of the shared lifecycle definition. Each client project receives the parts it needs to put that definition into practice.

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
- **Make guidance part of the project.** Install files into the client project so the team and its AI tools can inspect them, version them, and review changes together.
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
two-skill payload, shared installation procedure, updater safety contract,
legacy bootstrap path, and contributor checks.

## Distribution

The initial distribution channel is the [Open Dough GitHub repository](https://github.com/terryyin/open-dough). The intention is to let projects install and update directly from GitHub without requiring publication to a package registry such as npm.

The installer and updater select the highest numeric release tag in the supplied
repository. A matching tag, source `VERSION`, and dated changelog entry identify
the validated snapshot; branch content is not used as a fallback.

Package registry distribution remains an option if it later makes installation or maintenance simpler.

## Maintainers

Open Dough maintainers prepare and tag source releases with the internal
`release-version` skill in this repository (`$release-version` in Codex,
`/release-version` in Cursor or Claude Code). It writes `VERSION` and
`CHANGELOG.md`, then tags `vMAJOR.MINOR.PATCH`. The skill and the repository
maintainer guidance (`AGENTS.md`) are not installed into client projects.

Installation and `dough-update` use the highest numeric release of the recorded
or supplied repository. A known older installation that lacks `SOURCE` needs
one explicit supplied-source `--force` bootstrap; afterward ordinary updates
use that recorded `SOURCE` without repeating the URL.

## License

Open Dough is open source under the [MIT License](LICENSE).
