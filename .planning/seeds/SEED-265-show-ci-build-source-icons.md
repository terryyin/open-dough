---
id: SEED-265
status: active
planted: 2026-11-08
scope: story
---

# CI timing build sources

<a id="show-ci-build-source-icons"></a>

### Show CI build sources with compact icons

**Identity:** SEED-265#show-ci-build-source-icons

```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/516-show-ci-build-source-icons/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"89bedec15c1ad92737d9dc29180668538e398fc2f667561685e82c71a8af09a1","plan":"57e4f006d7ef39cf94cfba18c4d11719d0a9e717a15c5764d9b0b666b0d4d0f2"}}
```

**Goal.** A developer reviewing a story's CI timing in Intent can scan the
measurements and tell at a glance whether each endpoint's timing came from a
build at the requested revision or from an ancestor build.

**Scope.**

- *Build presentation.* In Intent's CI timing comparison endpoint table, each
  routine Build cell shows a compact source icon for an exact revision build
  versus timing taken from an ancestor build. Accessible labels convey the same
  distinction without relying on the glyph alone. Timing columns continue to
  show the measurements from the selected builds.
- *Decluttered default rows.* Commit subjects, run and attempt IDs, and routine
  skip explanations stay out of the default Build cells. Exceptional cases such
  as a failed or cancelled run, missing proof, or an unexplained absence keep a
  short visible explanation.
- *Other selections.* Equivalent-build and later-trunk-build selections keep
  concise accessible wording in the Build cell under the same decluttering
  rule; distinct icons for those kinds are deferred.
- *Scope limits.* No change to how endpoints select builds or walk ancestors.
  No redesign of Summary comparison labels, entry timing rows, or wall /
  without-waits columns. Pygardon's missing per-file pytest timing remains
  separate work.
- *Architecture.* Presentation only of the comparison answer's existing
  selection fact. The dashboard still observes published CI evidence without
  owning workflow outcomes
  ([ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#observe-workflow-outcomes-without-owning-them)).
  Product-intent wording for the comparison stays with the Intent CI comparison
  docs under
  [ADR 0000](../../docs/adrs/0000-use-adrs-accepted.md).

**Key examples.**

1. CI skips Baseline and Branch for planning-only changes and Landed has an
   exact build → each routine Build cell shows its compact source icon:
   Baseline and Branch as ancestor-sourced, Landed as exact. Accessible labels
   name the same distinction. Timing columns show those builds' measurements.
   Commit subjects, run and attempt IDs, and the routine Skipped explanation
   are absent from the default Build cells.
2. Every compared endpoint has a build at its requested revision → each routine
   Build cell shows the exact-source icon with an accessible exact label, and
   timing columns show those builds' measurements.
3. An endpoint's selected build failed → the Build cell keeps a short visible
   failure explanation beside the source cue; timings follow the failed build
   when measured, or the existing unavailable wording when not.
4. Landed uses an equivalent build after a confirmed skip → the Build cell
   names the equivalent selection in concise accessible words without run or
   attempt IDs in the default row; no new equivalent icon is required in this
   story.

**Alternatives considered.** Short source words alone ("exact" / "ancestor")
without icons would declutter and meet the distinction with less visual
vocabulary; icon-only tint without labels would fail accessibility. Progressive
disclosure of all identity behind hover would hide provenance from a scan.
Recommended direction stays compact icons with accessible labels, reusing the
accessible icon-plus-heard-words pattern Intent already uses for CI evidence
labels, adapted so the Build cell stays a single provenance cue rather than a
full identity strip. The analogy breaks when selection kinds exceed a
glanceable set: equivalent and later stay wording-only in this increment.
