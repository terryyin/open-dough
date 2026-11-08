# Source review: SEED-265#show-ci-build-source-icons

**Launch.** Fresh general-purpose reviewer (agent `877c885a-4b57-46cb-8890-9c8c925e0d38`), no conversation inheritance; instructed to use only the supplied Goal, Scope, Key examples, and Alternatives considered from the seed section, read no other project files, and change nothing.

**Input.** Seed section Goal, Scope (Build presentation, Decluttered default rows, Other selections, Scope limits, Architecture), Key examples 1–4, and Alternatives considered — verbatim from `.planning/seeds/SEED-265-show-ci-build-source-icons.md#show-ci-build-source-icons`. No plan, return, product, proof, or slice scope was supplied.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A developer reviewing a story's CI timing in Intent can scan the measurements and tell at a glance whether each endpoint's timing came from a build at the requested revision or from an ancestor build. | slice 1 | observed: `BuildSourceCue` in `dashboard/src/IntentCiComparisonEndpoints.tsx` (exact `GitCommitHorizontal` vs ancestor `History`) plus focused Playwright identity cues |
| 2a | In Intent's CI timing comparison endpoint table, each routine Build cell shows a compact source icon for an exact revision build versus timing taken from an ancestor build. | slice 1 | observed: `BuildSourceCue` + `data-selection="exact"\|"ancestor"`; `expectExactSourceCue` / `expectAncestorSourceCue` |
| 2b | Accessible labels convey the same distinction (exact revision build versus ancestor build) without relying on the glyph alone. | slice 1 | observed: visually-hidden `selectionWords` beside `Icon` (`aria-hidden`) in `BuildSourceCue`; specs `toContainText("exact revision"\|"ancestor:")` |
| 2c | Timing columns continue to show the measurements from the selected builds. | slice 1 | observed: wall / without-waits assertions in `intent-ci-comparison-skipped.spec.ts` and `intent-ci-comparison.spec.ts` |
| 3a.1 | Commit subjects stay out of the default Build cells. | slice 1 | observed: `BuildIdentity` no longer renders `slot.subject`; decluttered identity cells in comparison specs |
| 3a.2 | Run IDs stay out of the default Build cells. | slice 1 | observed: `expectNoRunOrAttemptIds`; `BuildIdentity` omits `LinkedRun` |
| 3a.3 | Attempt IDs stay out of the default Build cells. | slice 1 | observed: `expectNoRunOrAttemptIds`; no attempt text in `BuildIdentity` |
| 3a.4 | Routine skip explanations stay out of the default Build cells. | slice 1 | observed: `exceptionalRequestedStatusPrefix` returns "" for skipped; planning-only test `not.toContainText(skippedAt)` on Build cells |
| 3b.1 | Exceptional cases such as a failed run keep a short visible explanation. | slice 1 | observed: `failed build` beside source cue in `intent-ci-comparison-landing-gaps.spec.ts` |
| 3b.2 | Exceptional cases such as a cancelled run keep a short visible explanation. | slice 1 | observed: Cancelled prefix kept in `intent-ci-comparison-skipped.spec.ts` cancelled Baseline journey |
| 3b.3 | Exceptional cases such as missing proof keep a short visible explanation. | slice 1 | observed: Skipped-without-proof Landed keeps explanation in skipped landing-without-proof test |
| 3b.4 | Exceptional cases such as an unexplained absence keep a short visible explanation. | slice 1 | observed: `No build` path-reason wording kept in code-start-without-build and related gap journeys |
| 4a | Equivalent-build selections keep concise accessible wording in the Build cell under the same decluttering rule. | slice 1 | observed: Landed `equivalent build` words, no source icon, no run/attempt IDs in `publishSkippedPlanningLanding` test |
| 4b | Later-trunk-build selections keep concise accessible wording in the Build cell under the same decluttering rule. | slice 1 | observed: cancelled-landing / later trunk identity specs assert later wording without run/attempt IDs |
| 4c | Distinct icons for equivalent-build and later-trunk-build kinds are deferred. | slice 1 | observed: `selectionSourceIcon` returns undefined for equivalent/later; equivalent test `toHaveCount(0)` on source icon |
| 5a | No change to how endpoints select builds or walk ancestors. | slice 1 | observed: no diff to selection/walk modules; fixture-only Branch tip so existing walk yields ancestor |
| 5b | No redesign of Summary comparison labels. | slice 1 | observed: Summary still shows Baseline Skipped full status via `expectLabelInFull` in planning-only test |
| 5c | No redesign of entry timing rows. | slice 1 | observed: entry table visibility / `expectCiComparisonEntryRows` retained; no entry-row presentation rewrite |
| 5d | No redesign of wall / without-waits columns. | slice 1 | observed: column headers and wall/without-waits cell wording unchanged aside from Build identity |
| 5e | Pygardon's missing per-file pytest timing remains separate work. | slice 1 | observed: no Pygardon per-file timing changes in this slice's owned paths |
| 6a | Presentation only of the comparison answer's existing selection fact. | slice 1 | observed: `BuildSourceCue` reads `slot.selection` / `selectionWords` only |
| 6b | The dashboard still observes published CI evidence without owning workflow outcomes (ADR 0008). | slice 1 | observed: presentation-only Build cue; no workflow ownership change |
| 6c | Product-intent wording for the comparison stays with the Intent CI comparison docs under ADR 0000. | slice 1 | observed: `docs/dashboard-development-intent-ci-comparison.md` and Build-identity sentence in `docs/dashboard-development-intent.md` updated |
| 7a.1 | When CI skips Baseline and Branch for planning-only changes and Landed has an exact build → each routine Build cell shows its compact source icon: Baseline as ancestor-sourced. | slice 1 | observed: planning-only skipped test `expectAncestorSourceCue(baselineIdentity, …)` |
| 7a.2 | …Branch as ancestor-sourced. | slice 1 | observed: same test `expectAncestorSourceCue(branchIdentity, "ancestor: 2 later revisions without a build")` after fixture tip over built ancestor |
| 7a.3 | …Landed as exact. | slice 1 | observed: same test `expectExactSourceCue(landedIdentity)` |
| 7a.4 | Accessible labels name the same distinction. | slice 1 | observed: ancestor/exact words asserted via visually-hidden `selectionWords` text in those cells |
| 7a.5 | Timing columns show those builds' measurements. | slice 1 | observed: walls `3 min` / `3 min 20 s` / `4 min` in planning-only test |
| 7a.6 | Commit subjects are absent from the default Build cells. | slice 1 | observed: decluttered `BuildIdentity`; no subject in planning-only Build cells |
| 7a.7 | Run IDs are absent from the default Build cells. | slice 1 | observed: `expectNoRunOrAttemptIds` on Baseline/Branch/Landed in planning-only test |
| 7a.8 | Attempt IDs are absent from the default Build cells. | slice 1 | observed: `expectNoRunOrAttemptIds` on those cells |
| 7a.9 | The routine Skipped explanation is absent from the default Build cells. | slice 1 | observed: Baseline/Branch `not.toContainText(skippedAt)` while Summary still names Skipped |
| 7b.1 | When every compared endpoint has a build at its requested revision → each routine Build cell shows the exact-source icon with an accessible exact label. | slice 1 | observed: fast-forward / clean-landing exact cues on Branch and Landed |
| 7b.2 | Timing columns show those builds' measurements. | slice 1 | observed: wall assertions retained on those exact-endpoint journeys |
| 7c.1 | When an endpoint's selected build failed → the Build cell keeps a short visible failure explanation beside the source cue. | slice 1 | observed: landing-gaps failed merge: exact source cue + `failed build` text |
| 7c.2 | Timings follow the failed build when measured, or the existing unavailable wording when not. | slice 1 | observed: Branch wall still `3 min 20 s` on failed Landed journey; unavailable wording retained where measured jobs absent |
| 7d.1 | When Landed uses an equivalent build after a confirmed skip → the Build cell names the equivalent selection in concise accessible words without run or attempt IDs in the default row. | slice 1 | observed: `publishSkippedPlanningLanding` test: `equivalent build`, no run/attempt IDs |
| 7d.2 | No new equivalent icon is required in this story. | slice 1 | observed: equivalent cell has zero `.intent-ci-comparison-source` icons |
| 8a | Short source words alone ("exact" / "ancestor") without icons would declutter and meet the distinction with less visual vocabulary. | slice 1 | observed: rejected alternative; product uses icons + accessible words per 8d |
| 8b | Icon-only tint without labels would fail accessibility. | slice 1 | observed: rejected; visually-hidden `selectionWords` accompany icons |
| 8c | Progressive disclosure of all identity behind hover would hide provenance from a scan. | slice 1 | observed: rejected; icon visible in cell for scan; hover title is secondary |
| 8d | Recommended direction stays compact icons with accessible labels, reusing the accessible icon-plus-heard-words pattern Intent already uses for CI evidence labels, adapted so the Build cell stays a single provenance cue rather than a full identity strip. | slice 1 | observed: `BuildSourceCue` single cue (Icon + heard words), not `EvidenceLabels` multi-strip |
| 8e | The analogy breaks when selection kinds exceed a glanceable set: equivalent and later stay wording-only in this increment. | slice 1 | observed: equivalent/later wording-only via undefined `selectionSourceIcon` |
