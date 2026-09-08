# 0004 — Client installation and update

**Status:** Proposed

**Date:** 2026-09-07

**Decision makers:** Terry Yin

**Consulted:** Terry Yin; further advice open.

## Context

Client projects need complete, standalone Open Dough guidance that remains
straightforward to update. Their installations should carry only what serves
that purpose.

## Decision

1. **Install and update the whole client payload.** The client payload is the
   guidance, supporting files, and `dough-update` entry point supplied by an
   Open Dough release. A client installation is its instance in a client project.
   Run `dough-update` in the client project to fetch the latest Open Dough release
   and update its installed files, with no partial selection or updates. Leave
   the resulting changes for the client to review and commit.
   Release only when the entire payload is ready for public use; there is no
   draft public-guidance state. Follow
   [ADR 0003](./0003-tagged-release-versioning-accepted.md) for release identity
   and latest-version selection.

2. **Make ordinary use standalone.** Install required instructions, scripts,
   and supporting files locally and update them together. Ordinary use loads
   only relevant material and must not fetch support from Open Dough. A future
   versioned package must also resolve locally during installation or updating.

3. **Keep maintenance material in Open Dough's source repository.** This is
   information for producing, assessing, or updating guidance. It is separate
   from both the client payload and the installation record. A recognition
   record describes a practice's purpose, triggers, distinguishing behavior, and
   suitability for replacing local guidance. `RECOGNITION.md` is such a record;
   keep it descriptive and do not install it. Replacing an existing local practice
   is one-time project adoption work, not permanent updater behavior.
   `dough-update` fetches needed maintenance material from the
   appropriate pinned, inspected source and discards temporary copies. Only the
   small update entry point and installation record remain as local maintenance
   support. This reduces footprint, not public access: it is not a security or
   secrecy boundary. Offline maintenance is not required.

4. **Reserve one configuration file for demonstrated needs.** The proposed
   location is `open-dough.json` at the client project root, shared by all tools.
   No customization is needed yet: introduce no file or settings until needed,
   then provide as few options as possible. Absence uses standard behavior.
   Clients own their installations and configuration; both ordinary and forced
   updates preserve configuration.

5. **Update released content without reconciling edits.** Record the installed
   version and the Open Dough repository URL used during installation. Subsequent
   updates reuse that location automatically. The immutable release tag
   supplies comparison content; permanent commit or checksum records are not
   required. Ordinary updates stop without writes on changed or missing managed
   files or an unverifiable baseline. Edited files are unsupported. Explicit
   forced updates overwrite managed content, including edits, with the complete
   latest payload; no merging or edit recovery is promised. Ordinary updates
   leave equal versions unwritten and do not downgrade. Retire obsolete managed
   files; record the new version only after verifying the installed payload.
   When configuration exists, reject incompatibility before changing content.

6. **Preserve native integration and project boundaries.** Maintain one shared
   behavioral source with minimal adaptation for Codex, Cursor, and Claude Code.
   Use one installation operation to populate every supported native layout;
   the application making the request supplies only the entry context. Each
   installation must coexist with unrelated guidance. Open Dough's own client
   installations follow the same contract as every other client's.

## Consequences

- Ordinary use remains independent of Open Dough's availability; maintenance
  may require network access.
- Configuration remains an unvalidated proposal until a real need arises.
- Once Accepted, this ADR governs installation and update work in
  [SEED-001](../../.planning/seeds/SEED-001-install-and-update-open-dough.md#client-installation-and-update),
  alongside ADR 0003. Delivery details, transition evidence, and future refinement
  remain in the seed.

## Related

- [ADR 0001 — Ubiquitous language (Proposed)](./0001-ubiquitous-language.md)
- [ADR 0000 — Use Architectural Decision Records](./0000-use-adrs-accepted.md)
