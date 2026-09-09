# 0001 — Ubiquitous language

**Status:** Proposed

**Date:** 2026-09-06

**Revised:** 2026-09-09, at Terry Yin's direction.

**Decision makers:** Terry Yin

## Context

Open Dough needs consistent names for producing and delivering shared guidance.
Those names describe a maintainer's relationship to consuming projects. Carrying
that viewpoint into installed instructions can make an agent look for a separate
“client project” even though its task already establishes the project.

## Decision

### Maintainer vocabulary

Use these concepts in Open Dough's internal guidance, release documentation,
and maintenance records. This vocabulary does not prescribe the language of
published skills, rules, templates, or runtime references.

| Term | Meaning |
| --- | --- |
| Client project | A project using installed Open Dough guidance; Open Dough itself can fill this role. |
| Guidance | Rules, skills, and supporting instructions that direct development work. |
| Release | An immutable, versioned Open Dough source snapshot as defined by ADR 0003. |
| Client payload | The guidance and supporting runtime files declared for installation by a release. |
| Client installation | A release's managed content installed in a project in the supported tool layouts, with its installation record. |
| Installation record | The recorded release version and Open Dough source used for updates. |
| Maintenance material | Information used to produce or assess guidance, outside the installed payload. |
| Recognition record | Maintenance material describing a practice's purpose, triggers, distinguishing behavior, and review evidence. |
| Internal skill | A skill for Open Dough maintainers, with no required `dough-` prefix. |
| Open Dough skill | A skill intended for installation into projects, named with the `dough-` prefix. |

Proposed, Promoted, and Released describe a revision's lifecycle under
[ADR 0003](./0003-tagged-release-versioning-accepted.md). Installed describes a
copy in a project. These are maintenance and delivery concepts, not workflow
stages imposed on projects using the skills.

### Published runtime language

Follow [ADR 0006](./0006-write-skills-for-executing-agents-accepted.md) for the
authoritative runtime audience rule. Address the executing agent in its task's
established project: “this project's ADRs,” “this project's tooling,” or “the
selected story.” Do not require the agent to identify another client repository
or learn extraction, recognition, or promotion terminology to perform ordinary
project work.

When a task needs delivery concepts, explain the actionable roles in context.
For example, the updater captures its target project, reads its installation
record, and fetches a separate Open Dough release source. The target defaults
to this project unless the user selects another. Distinguish these locations
without importing the maintainer glossary into every skill.

Shared workflow concepts such as story, seed, and slice may appear where the
skill actually uses them. Their meaning belongs in the relevant behavioral
source; project-specific paths, vocabulary, and conventions come from the
executing project.

## Consequences

Maintainers can describe production and delivery consistently while installed
instructions remain direct and locally meaningful. Public accessibility of a
source file does not make it runtime content. Recognition and other maintenance
records remain outside the installed payload.

Review meaning and audience across runtime content rather than banning words
through a global replacement or wording lint. Necessary source/target
separation and checks for genuinely missing context remain intact.

## Related

- [ADR 0003 — Release lifecycle and versioning](./0003-tagged-release-versioning-accepted.md)
- [ADR 0006 — Write skills for executing agents](./0006-write-skills-for-executing-agents-accepted.md)
- [Maintainer authoring guideline](../../AGENTS.md)
