# See the relevant changelog while updating Open Dough

**Status: NOT FOR DIRECT EXECUTION.** This is reused planning material.
Before execution, refine the linked story, update this plan to match that
refinement and Story 5's delivered updater, and run Donut's
slice-plan-refinement skill on this plan. Do not execute these fragments as-is.

Source: [SEED-001, Story 6](../../seeds/SEED-001-install-and-update-open-dough.md#show-update-changelog).
Prerequisite: [Story 5 version-aware update](../005-update-only-when-needed/PLAN.md).
Release production: [Story 4](../004-versioned-updates/PLAN.md).

## Candidate goal and boundary

A developer sees the actual applicable release notes as part of updating,
without manually finding and interpreting the source changelog. This is an
interaction improvement on a working version-aware updater, not a new updater
or release system.

The release contract remains [ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md).
This story replaces Story 5's explicit manual-changelog-reading interim step.
It does not reopen version identity, selected-tool writes, or release creation.

## Reused work and outside-in proof to retain

These are inherited work groups, not execution-ready leaves. Original numbers
refer to the former aggregate plan; version-transition mechanics belong to
Story 5 and must not be implemented again here.

| Original work | Retained outcome | Proof to carry into the updated plan |
| --- | --- | --- |
| Notes portion of 6 | Explain a one-release update | Native output contains the actual latest release entry before the existing installation step, with old/new versions. A link alone is insufficient. |
| 7 and notes portions of 17, 21 | Explain skipped releases | From `0.1.0` to `0.1.2`, display `0.1.1` and `0.1.2` entries, exclude older/unreleased notes, and retain the one direct latest installation. |
| Notes portions of 8, 19, 23 | Explain changes when the baseline is unknown | Display available released history with an explicit unknown-version explanation; do not invent a baseline or reconstruct installation history. |
| Changelog portion of 9 | Do not apply a release whose required notes cannot be provided consistently | Missing/inconsistent required entry or range content is explained before target mutation; preserve Story 5's truthful failure state. Refine concrete boundaries against its delivered validation. |
| Later-release portion of 24 | Release the actual presentation improvement | Use a subsequent chosen version and describe delivered behavior; do not re-tag a previous release or invent public test releases. |
| Presentation portion of 25–27 | Use the released changelog interaction in Open Dough itself | Native update in each tool displays applicable notes and preserves selected-tool/source identity and coexistence. |

## Constraints and provisional presentation notes

- Read notes from the same resolved released snapshot as the payload. Display
  every released entry after installed through latest; exclude unreleased and
  already-installed entries. Exact formatting and ordering need story refinement.
- Unknown installations receive available released history with that limitation
  stated. The notes must be shown on the supported legacy transition, including
  explicit bootstrap if that still applies on Story 5's implementation.
- Display applicable content before applying the release; do not add a new
  approval prompt as part of presentation. Preserve existing session authorization.
- Equal-version update still does no installation or metadata writes. Do not
  turn displaying a changelog into a reason to reinstall or replay all notes.
- Preserve existing failure reports and source/tool/version context; never let
  displayed notes imply an installation succeeded when it failed.
- Use shared behavior with minimal platform adaptation and observe invocation
  separately in Codex, Cursor, and Claude Code. Version records and other
  integrations must remain unaffected by presentation alone.
- Exclude a standalone changelog command, notifications, automatic release-note
  authorship, rollback, selected-version updates, and broader release tooling.

## Questions for the required refinement

- Which concise output makes the release range and unknown-baseline limitation
  clear while providing the requested content?
- What exact missing/inconsistent-entry cases are not already handled by
  Story 5? Reuse its validation rather than creating competing readers.
- How does the then-current legacy path surface the notes before changes?
  Define one concrete journey per relevant baseline and map proof to each.

## Acceptance evidence to collect after refinement and execution

| Platform | Required native evidence | Status |
| --- | --- | --- |
| Codex | Discovery/invocation of refreshed skill; single/skipped/unknown notes and released self-use | Pending |
| Cursor | Same notes behavior with correct selected entry and coexistence | Pending |
| Claude Code | Same notes behavior through its native entry and coexistence | Pending |

Reuse Story 5's evidence only where this change leaves the proven behavior
intact. New changelog output requires new native observations; file equality
or another platform's output does not establish it.

## Next action and learnings

**Do not execute this plan.** Refine Story 6, update these fragments against the
working updater, run slice-plan-refinement, and reconcile proof ownership before
assessing readiness. No execution evidence exists. Separating presentation
allows Story 5 to provide useful update decisions with manual changelog reading.
