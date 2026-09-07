# 0001 — Ubiquitous language

**Status:** Proposed

**Date:** 2026-09-06

**Decision makers:** Terry Yin

**Consulted:** Terry Yin; installation and update terminology proposed following
the ADR 0004 discussion on 2026-09-07. Further advice open.

## Context

Open Dough needs consistent names for the guidance it produces, what clients
install, and what clients can customize.

## Decision

Use the following concepts for client installation and updating:

| Term | Meaning |
| --- | --- |
| Client project | A project using installed Open Dough guidance; Open Dough itself can be a client. |
| Release | An immutable, versioned Open Dough source snapshot, as defined by ADR 0003, whose entire client payload is ready for public use. |
| Guidance | Rules, skills, and supporting instructions that direct development work. |
| Client payload | The complete guidance, supporting files, and update entry point supplied by a release for installation in clients. |
| Client installation | An instance of the client payload in a client project, laid out for Codex, Cursor, or Claude Code, with an installation record. Its release-supplied files are its managed content. |
| Installation record | The installed version and the Open Dough repository URL used to obtain it. Updates reuse this location automatically. The record contains no maintenance material. |
| Client configuration | Proposed client-owned settings in `open-dough.json` at the project root, shared by all tools and separate from managed content. No file or settings are introduced until needed. |
| Maintenance material | Information in the Open Dough source repository for producing, assessing, or updating guidance. It is outside the client payload and installation record; relevant material may be fetched temporarily during maintenance. |
| Recognition record | Maintenance material describing a reusable practice's purpose, triggers, distinguishing behavior, and suitability as a replacement. `RECOGNITION.md` is its current representation. |

### Relationships

A release defines one complete client payload and may also contain maintenance
material. A client project may have installations for Codex, Cursor, and Claude
Code. Each installation realizes the release's payload in that application's layout, and
its installation record identifies the release. Future client configuration
supplies supported settings without changing managed content. A recognition
record describes guidance; ordinary use does not need that record.

The client runs `dough-update`, receives changes to its installed project files,
then reviews and commits those changes. The Open Dough repository supplies the
release; the client project's repository holds the resulting installation.

### Skill naming

| Term | Meaning | Skill naming |
| --- | --- | --- |
| Internal skills | Agent skills used only within Open Dough itself | No required prefix |
| Open-Dough skills | Agent skills exposed for installation into other projects | Names must start with `dough-` |

Rule naming remains undecided.

## Consequences

The `dough-` prefix identifies exposed skills without imposing the same naming
constraint on internal skills. It does not make every neighboring source file
part of the client payload. Public accessibility does not imply installation.

Client ownership is distinct from supported customization: updates follow
ADR 0004's managed-content policy and preserve client configuration when present.

## Related

- [ADR 0003 — Tagged release versioning](./0003-tagged-release-versioning-accepted.md)
- [ADR 0004 — Client installation and update (Proposed)](./0004-client-installation-and-update.md)
