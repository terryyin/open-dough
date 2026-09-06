# Open Dough

**A shared, AI-augmented software development lifecycle for projects and the tools that help build them.**

Open Dough defines how people and AI work together to develop software. It brings a common set of philosophies, principles, processes, AI agent rules, and AI agent skills into a project's own repository, where they can guide everyday work and evolve alongside the code.

The aim is to define the lifecycle once, reuse it across projects, and make it usable across AI development platforms. The initial platform scope is **Codex, Cursor, and Claude Code**.

> **Status:** Initial project definition. This repository does not yet contain the lifecycle content, platform integrations, or an installer. The installation and update behavior described below is the intended design.

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

Open Dough will be installed **into a target project's repository**. Installation places lifecycle content and the selected platform integration files there; updating Open Dough directly changes those installed files.

Open Dough will be versioned, but installation and updates will support **only the latest version**. Selecting or pinning a version through the installer or updater will not be supported.

The intended adoption flow is:

1. Select the platforms the project uses.
2. Run the installation mechanism against the target repository to install the latest Open Dough version.
3. Review the added files, add project-specific context, and commit them.
4. Use the installed guidance during development.
5. Run an update to bring the installed files to the latest Open Dough version, review the resulting changes, and commit them.

The installer and updater still need a precise contract. The proposed design is to record the installed version, identify which files Open Dough manages, and keep project-specific additions separate where possible. Updates must account for existing tool configuration and local edits; their merge and conflict behavior has not yet been decided.

Installation commands and destination paths will be documented once the mechanism exists.

## Distribution

The initial distribution channel is the [Open Dough GitHub repository](https://github.com/terryyin/open-dough). The intention is to let projects install and update directly from GitHub without requiring publication to a package registry such as npm.

The delivery mechanism is still open: a GitHub-hosted installer, downloadable release, or another repository-based approach could fulfill this model. Versions will identify releases and track what is installed; installation and updates will always target the latest version.

Package registry distribution remains an option if it later makes installation or maintenance simpler.

## License

Open Dough is open source under the [MIT License](LICENSE).
