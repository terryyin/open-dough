# 0003 — Tagged release versioning

**Status:** Accepted

**Date:** 2026-09-06

**Decision makers:** Terry Yin

**Consulted:** Codex proposed the contract during Story 4 refinement. No other
consultation is recorded here.

## Context

The initial Open Dough installer and updater use the supplied repository's
default branch. Installed copies have no version record, and every update
reinstalls the fetched content. The original combined story introduced version
comparison, tagged versions, and changelog output while retaining latest-only
updates. The owner subsequently requested three smaller delivery stories.

Terry Yin explicitly accepted the versioning proposal on 2026-09-06:
"Versioning proposal is accepted." This record captures that accepted proposal.

## Decision

1. Use one numeric `MAJOR.MINOR.PATCH` version for Open Dough as a whole,
   starting at `0.1.0`. The maintainer supplies the next higher version;
   automatic bump classification and independent per-skill versions are out
   of scope.
2. Keep one source `VERSION` and one `CHANGELOG.md`, with a dated entry for
   each released version. A matching Git tag, such as `v0.1.0`, identifies the
   committed revision containing that metadata and its payload. Published
   version tags are not reused or moved.
3. Define latest as the highest numeric release version tagged in the supplied
   repository. Tag creation time and untagged default-branch changes do not
   determine latest. Installation and update use the tagged content and
   record the version actually installed.
4. If no matching release exists, fail clearly without falling back to
   unversioned branch content. A GitHub Release object is not required.

## Consequences

- A release's identity, content, and description can be matched. A branch edit
  becomes available to adopters when a new version is tagged and published
  through Git.
- The default-branch behavior delivered in Stories 1–3 remains historical;
  Story 4 establishes release production; Story 5 migrates installation and
  updating to this contract, and Story 6 adds changelog presentation.
- The limited existing unversioned installations are handled manually through
  explicit reinstall; no separate migration feature is planned.
  Version comparison, changelog presentation, and the small internal version
  skill remain delivery work across Stories 4–6, not release infrastructure.
- Installation-record paths, helper layout, and native skill adaptation are
  implementation details. This ADR does not prescribe a release pipeline,
  registry, prerelease policy, rollback, or version-selection interface.

## Related

- [ADR 0000 — Use Architectural Decision Records](./0000-use-adrs-accepted.md)
- [Story 4 — Create an identifiable release](../../.planning/seeds/SEED-001-install-and-update-open-dough.md#release-tagged-version)
- [Story 5 — Update only when needed](../../.planning/seeds/SEED-001-install-and-update-open-dough.md#update-only-when-needed)
- [Story 6 — Show the relevant changelog](../../.planning/seeds/SEED-001-install-and-update-open-dough.md#show-update-changelog)
