# 0003 — Release lifecycle and versioning

**Status:** Accepted

**Date:** 2026-09-06

**Decision makers:** Terry Yin

## Context

Open Dough Distribution needs a clear path from drafted guidance to content
available for client installation, with one identifiable release for the whole
client payload.

## Decision

Use three stages for a revision of Distribution guidance:

| Stage        | Meaning and location                                                                                                                                                                                                               |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Proposed** | New guidance and supporting files are drafted outside the shipped directory until a maintainer selects them. Edits to existing shipped files are Proposed until a maintainer selects the edited revision.                          |
| **Promoted** | Reviewed and selected by a maintainer for the next release. Promote new files by placing them, with their required runtime dependencies, under `Distribution/src/skills/`. Promote edits there by selecting the reviewed revision. |
| **Released** | Included in the client payload at an immutable version tag available from the source repository. Clients can install that tagged content.                                                                                          |

`Distribution/src/skills/` is the shipped directory and the sole declaration
of the client payload for releases using this layout. The payload consists of
all files in that directory at the tagged revision. Keep Proposed additions,
test fixtures, and maintainer material outside it. Derive the file set from
the directory for installation, updates, and release checks.

Promotion requires the representative [behavior review](../../.agents/skills/author-open-dough-skills/SKILL.md#behavior-review) and the
applicable delivery checks under [ADR 0005](./0005-cross-tool-validation-accepted.md).
Shipped files and release tags establish the payload at each stage. When an
installed version's tag uses a file list, verify against that tag's declaration.

**Installed** describes a copy in a particular client project, at its recorded
release version. It is not a fourth stage. Use Proposed, Promoted, and Released
for lifecycle state; use publish only for making a release tag available, and
public only for accessibility.

1. Use one numeric `MAJOR.MINOR.PATCH` version for Open Dough as a whole,
   starting at `0.1.0`. The maintainer supplies the next higher version;
   automatic bump classification and independent per-skill versions are out
   of scope.
2. Keep one source `VERSION` and one `CHANGELOG.md`, with a dated entry for
   each released version. A matching Git tag, such as `v0.1.0`, identifies the
   committed revision containing that metadata and its payload. Released
   version tags are not reused or moved.
3. Define latest as the highest numeric release version tagged in the supplied
   repository. Tag creation time and untagged default-branch changes do not
   determine latest. Installation and update use the tagged content and
   record the version actually installed.
4. If no matching release exists, fail clearly without falling back to
   unversioned branch content. A GitHub Release object is not required.

## Consequences

- A release's identity, content, and description can be matched. A branch edit
  becomes available to client projects when a new version is tagged and published
  through Git.
- Maintainers promote or remove a payload file by changing the shipped
  directory. The installable file set follows that change at release time
  without a separate file list to synchronize.
- Installation-record paths, helper layout, and native skill adaptation are
  implementation details. This ADR does not prescribe a release pipeline,
  registry, prerelease policy, rollback, or version-selection interface.

## Related

- [ADR 0000 — Use Architectural Decision Records](./0000-use-adrs-accepted.md)
- Story 4 — Create an identifiable release — historical source: `3cace96:.planning/seeds/SEED-001-install-and-update-open-dough.md`, anchor `release-tagged-version`.
- Story 5 — Update only when needed — historical source: `3cace96:.planning/seeds/SEED-001-install-and-update-open-dough.md`, anchor `update-only-when-needed`.
- Story 6 — Show the relevant changelog — historical source: `3cace96:.planning/seeds/SEED-001-install-and-update-open-dough.md`, anchor `show-update-changelog`.
