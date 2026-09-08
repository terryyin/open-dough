# 0003 — Release lifecycle and versioning

**Status:** Accepted

**Date:** 2026-09-06

**Decision makers:** Terry Yin

## Context

Open Dough needs a clear path from drafted or extracted guidance to content
available for client installation, with one identifiable release for the whole
client payload.

## Decision

Use three stages for a revision of Open Dough guidance:

| Stage | Meaning and location |
| --- | --- |
| **Proposed** | Drafted or extracted under `src/skills/<name>/`, outside the declared client payload. Recognition records stay beside the skill as maintenance material. |
| **Promoted** | Reviewed and selected by a maintainer for the next release. Files stay in place; promotion adds the skill and required runtime dependencies to `install.sh`'s `managed_files` and the matching declaration in `src/install/open-dough-release-version.sh`. Keep payload fixtures aligned. |
| **Released** | Included in the client payload at an immutable version tag available from the source repository. Clients can install that tagged content. Source files outside that tag's payload remain Proposed even if present in the snapshot. |

Promotion requires the representative behavior review in `AGENTS.md` and the
applicable delivery checks under ADR 0005. Payload declarations and release tags
establish stage; do not maintain a separate status registry. Recognition records
describe review evidence, not a competing lifecycle status. For an already
declared skill, edits begin as Proposed changes; maintainer selection after
review promotes that revision without re-adding its paths. Its earlier released
revision remains Released.

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
- Extraction creates Proposed guidance. Promotion selects the complete runtime
  dependency set without copying it to a separate staging directory. Release
  makes that selection available to client projects.
- Installation-record paths, helper layout, and native skill adaptation are
  implementation details. This ADR does not prescribe a release pipeline,
  registry, prerelease policy, rollback, or version-selection interface.

## Related

- [ADR 0000 — Use Architectural Decision Records](./0000-use-adrs-accepted.md)
- [Story 4 — Create an identifiable release](../../.planning/seeds/SEED-001-install-and-update-open-dough.md#release-tagged-version)
- [Story 5 — Update only when needed](../../.planning/seeds/SEED-001-install-and-update-open-dough.md#update-only-when-needed)
- [Story 6 — Show the relevant changelog](../../.planning/seeds/SEED-001-install-and-update-open-dough.md#show-update-changelog)
