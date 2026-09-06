# Publish the version-aware Open Dough updater

**Status: NOT FOR DIRECT EXECUTION.** This plan contains release work moved from
the oversized Story 5 plan. Refine Story 5d first, update this plan after the
preceding updater stories establish their accepted boundary, then run Donut's
slice-plan-refinement skill before refinement execution or product execution.
Do not execute these fragments as-is.

Source: [SEED-001, Story 5d](../../seeds/SEED-001-install-and-update-open-dough.md#publish-version-aware-updater).
Release workflow source: [Story 4](../004-versioned-updates/PLAN.md).

## Candidate story boundary

The Open Dough maintainer can assign the accepted version-aware updater a new,
truthful release identity and make that exact tag/commit available from the
supplied repository. This story publishes already-accepted behavior; it does
not finish missing native acceptance, add changelog presentation, or adopt the
release into Open Dough's own installed copies.

## Moved fragments

| Original leaf | Status | Retained outcome |
| --- | --- | --- |
| 35. Identify the delivered updater as a release | planned | Maintainer-chosen version greater than existing releases; matching committed VERSION, dated notes, payload, and immutable tag; `v0.1.0` unchanged |
| 36. Make the exact release available | planned | Authorized ordinary Git publication followed by an independent fetch of the same tag/commit and payload |

## Questions for story and slice refinement

- Which preceding story evidence is required before the notes can truthfully
  claim the updater, without coupling publication to unrelated future stories?
- What is the smallest independent fresh-fetch observation that closes release
  availability?

## Required acceptance after refinement

Reuse the completed internal `release-version` behavior only while unchanged.
Run the repository's required focused/full release-readiness checks chosen by the
refined story, preserve unrelated work, and never invent or move a public tag.
Publication remains an externally authorized action, not an implication of this
planning artifact.
