# Compare story proof through merge resolutions

**Identity:** SEED-248#compare-story-proof-through-merge-resolutions
**Source:** [selected story](../../seeds/SEED-248-story-proof-through-merge-resolutions.md#compare-story-proof-through-merge-resolutions)
**Source review:** [source-review.md](./source-review.md)
**Prepared:** 2026-11-06; preparation only. Execution is not authorized by this plan.

## Goal and boundaries

Selecting a done Story Branch Mode story in Intent shows Baseline A, Branch B
and Landed C with B versus A and C versus A, at the homepage, entry, folder and
file scopes, even when merge-resolution edits make Review changes refuse code
attribution. C is the story's own integration revision, identified from the
story's history rather than from parent position, trunk's current first-parent
line or the later completion commit. The story section owns the required
behavior, restrictions and key examples.

Included: separating endpoint recovery from completed-story code attribution;
landing identification for trunk-first merges and fast-forward landings; C
without a measured-ancestor fallback across the landing merge; updating the
comparison journeys and fixtures. Excluded: relaxing Review changes'
attribution refusals; new proof generation, stored timing copies, CI-provider
changes or new file-tab design; choosing between a branch-push and a
trunk-push run of the same revision in a fast-forward landing (the existing
newest-run rule applies to both slots); Taken-story comparison and the
no-story-selected CI judgment.

**Assumption (fast-forward landing):** without a trunk-first owning landing
merge, C and B are the story's newest own revision reachable from the
completion, which is the story tip trunk accepted when wrap-up ran on the
branch, as SEED-243 did. Git alone cannot tell a later trunk-only own commit
after a fast-forward from a branch commit; that history is not handled
specially.

**Failure policy:** [AGENTS.md — Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests)
applies as written to execution, verification, delegation and repair handoffs.

**Local gate:** each slice runs its focused specs below with
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/playwright.config.ts <specs> --reporter=list`
from the workspace root after `node scripts/setup-native.mjs npm` and
`node scripts/setup-native.mjs browser`. Because the change moves a shared
server path that Review changes also reads, run `npm run lint` and the whole
dashboard suite once before landing, under the maintained
[macOS sleep guard and power condition](../../../tests/local-test-resources.md#machine-sleep-on-macos):
start fully awake; on AC use `caffeinate -s -i npm run test:dashboard`; on
battery plug in, or keep the lid open under `caffeinate -i` and read the sleep
log afterwards.

## Existing solutions and direction

- **Reuse the shared endpoint walk.** `dashboard/server/storyPublishedEndpoints.ts`
  already derives completion, claims, story start, mode and landing for both
  Review changes (`storyReviewPublished.ts`) and the comparison
  (`intentCiComparisonResolve.ts`). Split it so endpoint facts come from claim
  history (`publishedStoryEvidence`) without `completedStoryCommits`' merge
  resolution checks, and Review keeps calling attribution for commits and
  resolutions with its current refusals. No new module family is needed.
- **Reuse build lookup.** `lookupResultBuild` and `lookupBaselineBuild` in
  `baseCiRevisionLookup.ts` stay; C uses an exact-revision lookup at the
  landing (a walk limited to the landing revision itself), B keeps its
  story-side ancestor walk, Trunk Mode keeps its completion walk.
- **One landing rule.** Classify each owning merge by its story side: the
  parent that contains the story's own single-parent commits the other parent
  lacks. A merge whose second parent is the story side is a trunk-first
  landing; the newest such merge is the landing (C) and its story side is B.
  A merge whose first parent is the story side merges trunk into the branch and
  is never the landing. With no trunk-first landing, B and C are the newest own
  revision (fast-forward). Drop the `merge === completion` shortcut in
  `landingOf`.
- **Consumers.** Every scope reads the same `StoryCiComparisonAnswer`
  (`IntentCiComparison.tsx`, `useIntentCiComparisonEntries.ts`,
  `IntentScopeComparisonTable.tsx`, `IntentFileComparison.tsx`), so fixing the
  answer's slots reaches the homepage, entry, folder and file comparisons
  without client changes.
- **ADR 0008** (Accepted): endpoints stay derived from published Git and CI
  evidence with explicit gaps; the machine-local landing context is not a
  source.

## Outside-in proof

| Promise (seed example) | Owning slice | Observable proof |
| --- | --- | --- |
| 1, 2, 5: merge resolutions keep A, B, C and both comparisons at every scope; Review still refuses | 1 | `dashboard/tests/intent-ci-comparison.spec.ts` new journey on a `completedPublishedStory` resolution variant (owning `own-conflict-extra`, and a non-owning merge resolving a story file for the quoted message): three identities, `+20 s`/`+1 min` style signed walls, entry rows; `intent-summary-story-comparison*.spec.ts` folder and file rows on the same setup; `tests/boundary/story-review-completed-conflicts.spec.ts` and `-driver.spec.ts` still return `unavailable` |
| 3, 8: C is the landing merge, not a later completion; failed or cancelled merge build is C's own gap without trunk-side fallback | 2 | Updated SEED-236 journey in `intent-ci-comparison.spec.ts` (C names the landing merge's run, not run 303 at the completion); `intent-ci-comparison-landing-gaps.spec.ts` failed and cancelled merge builds: C identifies the merge's state, shows no figures from its trunk-side parent, B versus A readable |
| 6: fast-forward landing names the story tip as B and C; trunk side of the branch's merge never B | 3 | New journey: branch merges `main` (story-first), trunk fast-forwards; B and C name the tip; the `main`-side parent's run never appears |
| 7: a later fast-forward of another story keeps this story's A, B, C | 3 | New journey: story lands at trunk-first merge M, a second story merges trunk and fast-forwards; selecting the first story names M and M's story side |
| 4, 9: one unavailable proof or endpoint keeps the others; cleanup and trunk advance keep the builds | 1–3 (preserved) | Existing `intent-ci-comparison-entries.spec.ts`, `intent-ci-comparison-gaps.spec.ts` and persistence journeys in `intent-ci-comparison.spec.ts` stay green after each slice; slice 3 adds no-landing → B and C gaps with A retained |

## Decisive premises

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| The attribution refusal blocks real done stories before build lookup | `completedStoryCommits` + `landingOf` | Scratch esbuild bundle of the workspace modules run against this repository's `origin/main` at `d52183e9d` for SEED-236…SEED-246 done records, 2026-11-06 | 7 of 15 refused (quoted message for SEED-236 show-ci-adapter-proof and SEED-245) |
| Endpoint facts are recoverable without the resolution checks | `publishedStoryEvidence` claims and owning merges, octopus story start | Same bundle calling `publishedStoryEvidence` for SEED-245, SEED-243, SEED-241, SEED-246, SEED-236 show-ci-adapter-proof | All return claims, story start and owning merges; SEED-245 landing `7e01ffd2f` [`60cb82d67`, `5356f225e`] |
| Builds exist at the corrected endpoints | GitHub Actions runs by `head_sha` | `gh run list --commit` at `d52183e9d`, 2026-11-06 | SEED-245 B `5356f225e` success, C `7e01ffd2f` failure; SEED-241 C `c9a142ac3` cancelled; SEED-243 `ab65cea84` has branch and `main` runs |
| Parent position misidentifies B for story-first merges | `landingOf` second-parent rule | Same bundle: SEED-243 owning merge `342754ce7` [`04a149de2` story, `632e107e8` main] | Current rule would name `632e107e8` (main side) as B |
| First-parent completion moves after a later fast-forward | `git log --first-parent -1 -- <done record>` | Same replay for SEED-241 load-intent | Completion now `342754ce7` (SEED-243's merge); true landing `c9a142ac3` is an owning merge reachable from it |
| The fixture route reproduces the refusal | `publishComparedStoryBranch` → Intent homepage | Scratch edit passing `"own-conflict-extra"` to `completedPublishedStory` in `storyCiComparisonDoneFixture.ts`, then `intent-ci-comparison.spec.ts:31` with the local-gate command, reverted | Fails: panel shows "merge resolutions whose story changes cannot be attributed safely"; the unedited spec passes (3 tests, 15.9 s) |

## Slices

### 1. Proof comparison survives merge-resolution attribution refusals
Type: Behavior
Status: done
Proof: slice-1 rows above; existing comparison, summary and completed Review specs green.

Behavior: a done Story Branch story whose integration has merge-resolution
edits (owning or non-owning on story files) → selecting it in Intent → A, B
and C are named with both comparisons at homepage, entry, folder and file
scopes, while Review changes still returns its attribution refusal.
Implementation splits endpoint recovery from code attribution in
`storyPublishedEndpoints.ts`; Review composes attribution on top. Add the
non-owning story-file resolution variant to `completedPublishedStory` if no
existing variant produces the quoted message.

### 2. Landed is the story's integration merge
Type: Behavior
Status: done
Proof: slice-2 rows above.

Behavior: a story landed at trunk-first merge M and completed later at D, or
whose M build failed or was cancelled → selecting it → C names M with M's
figures or M's own gap, never D, a later trunk build or M's trunk-side parent;
B remains M's story side. Update the SEED-236 journey and its fixture so M has
its own run.

### 3. Landing identified from the story's own history
Type: Behavior
Status: planned
Proof: slice-3 rows above.

Behavior: a story landed by fast-forward after merging trunk into its branch,
or an earlier story whose first-parent trunk line a later fast-forward
rewrote → selecting it → B and C come from the landing rule in Existing
solutions (story-side classification, newest trunk-first landing, else newest
own revision); a story-first merge is never the landing and its trunk-side
parent is never B; with no identifiable landing B and C explain their gap
while A stays readable.

## Current decisions

- C uses the exact landing revision only; B keeps its story-side ancestor
  fallback; Trunk Mode landed keeps its completion walk (seed required
  behavior).
- Review changes keeps all current attribution refusals.
- File compact CI comparison follows selected-story comparison evidence, not
  Review's `ComparedStory` success; otherwise example 5 at file scope stays
  gated on attribution.
- `publishedStoryEndpoints` success keeps the claim walk beside `facts` so
  Review attributes without a second claim recovery; comparison reads `facts`
  only.

## Accepted proof (slice 1)

- Focused: `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/playwright.config.ts dashboard/tests/intent-ci-comparison.spec.ts dashboard/tests/intent-summary-story-comparison.spec.ts dashboard/tests/intent-summary-story-comparison-file.spec.ts dashboard/tests/boundary/story-review-completed-conflicts.spec.ts dashboard/tests/boundary/story-review-completed-driver.spec.ts --reporter=list` → pass (20/20); after refactor, Review boundary consumers re-run 9+16 pass.
- Preserved: `intent-ci-comparison-gaps.spec.ts` + `intent-ci-comparison-entries.spec.ts` → pass (6/6), including Trunk Mode.

## Accepted proof (slice 2)

- Focused (after refactor): `… intent-ci-comparison.spec.ts intent-ci-comparison-gaps.spec.ts intent-ci-comparison-landing-gaps.spec.ts` → pass (10/10). SEED-236 C = landing merge run 303; failed/cancelled landing gaps hide trunk-side figures.
- Preserved: entries + summary + file → pass (8/8).

## Plan review

Slice-plan refinement not needed: three Behavior slices with one proof loop
each, sharing one landing rule introduced in slice 2 and generalized in
slice 3; no structure prepared ahead of its Behavior. This review identified no
remaining slice-specific concern.
