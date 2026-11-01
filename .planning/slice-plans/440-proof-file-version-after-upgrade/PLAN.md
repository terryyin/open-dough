# Keep Proof's file version true after a dashboard upgrade

**Identity:** SEED-192#proof-file-version-after-upgrade
**Source:** [correction story](../../seeds/SEED-192-review-product-intent.md#proof-file-version-after-upgrade),
a bounded retrospective correction of
[SEED-192#read-observed-test-proof](../../seeds/SEED-192-review-product-intent.md#read-observed-test-proof)
([plan 439](../439-read-observed-test-proof/PLAN.md)). Reviewed commits:
`58350c9d` (slice 1: `TreeEntry` gained `sha`), `e09089e9`, `4487c435`,
`798a946f`, with CI repairs `30231a24`, `23e725f2`, `60bfc813`.

## Goal and scope

After a dashboard upgrade, Intent's Proof reads "This file version" whenever an
observation's recorded blob matches the published feature file. A feature
listing that an older dashboard remembered without blob shas is never used for
that match.

Current finding (verified by the retrospective coordinator and by the
reproduction under Decisive premises): `58350c9d` added `sha` to `TreeEntry`
(`dashboard/server/ghTrees.ts`), but `PinnedTexts.treeLister`
(`dashboard/server/pinnedTexts.ts`) still remembers listings under
`${directory}\0tree`. `recalledAsJson` (`dashboard/server/revisionMemo.ts`)
parses a remembered entry as `T` without checking it. Entries outlive the
process in `~/.open-dough/dashboard/retained-answers/`, and
`PinnedMemo.unchangedSince` (`dashboard/server/pinnedMemo.ts`) carries one
forward to any later revision whose commits did not touch its path. This
machine retains such shaless entries, for example
`nerds-odd-e/doughnut\0d47bdcde…\0e2e_test/features\0tree` and
`terryyin/pygardon\0fbae2942…\0tests\0tree`. The effect is that
`ListedFeature.sha` is undefined (`intentLocationsRead.ts` `filesUnderLocation`),
`featureBlobs` loses those keys (`intentProofRead.ts` `locationProofAt`), and
every row reads "Earlier file version" (`dashboard/src/IntentProof.tsx`). It
lasts until the feature folder changes, for example after Doughnut's adoption
commit ([story 8](../../seeds/SEED-192-review-product-intent.md#read-cypress-cucumber-proof)),
which touches only the proof folder, recorder and settings.

Story 6 clauses it breaks: "It says whether the observation was on this
version of the file or the file has changed since" and "Proof never claims
more than it observed".

Preserved promises and constraints: one tree read per location and revision;
reuse of a remembered listing across revisions that did not touch its folder;
one Intent locations read per revision; every user-visible Proof state and
journey (latest observation, retry-assisted pass, changed source, not
observed, not adopted, unreadable or malformed with Retry).

Material exclusions, out of this correction: boundary coverage of the proof
answer's other variants now proved only by journeys (listing failure,
rate-limit rethrow, filtering to listed features), consolidating duplicate
proof journeys, and an in-process `scenarioRowsOf` test. They rebalance test
tiers for behavior that already works, which is an outcome independent of this
defect. No backlog entry is created for them here.

## Existing solutions and decisions

PFE:

- **Entry shape per memo key.** `PinnedTexts` already keeps each answer kind
  under its own key suffix (`/` for directory listings, `\0tree`,
  `\0committed`, `\0added`), as its header says, "each kept under its own
  entry shape". `PinnedMemo.unchangedSince` derives the compared path from the
  entry before its first NUL. A new suffix therefore keeps the same
  touched-path comparison.
- **Retained store eviction.** `retainedAnswers.ts` bounds the store by bytes
  and evicts the least recently used answers
  (`authenticated-read-retained-answers-bounded.spec.ts`). Unreferenced
  `\0tree` entries age out without migration code.
- **Boundary fixtures.** `dashboard/tests/retainedAnswersJourney.ts` gives
  `onMachine`, `asked`, `published(...).movedTo(...)` and `entryFile(machine,
  revision, entry)` to plant a retained entry. `dashboard/tests/revisionReuseOrigin.ts`
  answers `git/trees` at each revision and comparisons between revisions.

Decision (this plan): change the tree listing's memo key to
`${directory}\0tree\0sha`, not validate recalled entries. Criteria: no shaless
listing can reach the file-version match from memory, from the retained store
or carried forward; no new validation path in the generic JSON memo; the
cost is one extra tree read per location at the first revision read after the
upgrade. The decision covers the proof-directory listing too, which shares
`treeLister`. If execution finds the key change insufficient, treating a
recalled entry that lacks `sha` as a miss is the fallback under the same
criteria.

Applicable Accepted decisions: ADR 0008 (the dashboard reads the published
revision; repository records own durable facts) and ADR 0010 (read cost against
today's workflow). Both are preserved; no new ADR or North Star topic.

## Outside-in proof

| Story example | Slice | Observable proof |
| --- | --- | --- |
| Shaless listing retained at A, B touches only the proof folder | 1 | New boundary test: Intent at B answers `featureBlobs` for every listed feature, and fails before the fix |
| Reuse preserved | 1 | Same test: a third revision C touching only the proof folder asks GitHub for one tree (the proof folder) and answers the same `featureBlobs` |
| Proof states and journeys preserved | 1 | Neighboring Intent and retained-answer boundary specs and the Intent proof journeys stay green |

## Ordered slices

### 1. A feature listing remembered without blob shas never decides the file version
Type: Behavior
Status: planned
Proof: A new boundary test under `dashboard/tests/boundary/` (for example
`authenticated-read-intent-proof-retained.spec.ts`) built on
`retainedAnswersJourney.ts`. One process reads membership and
`intent=locations` at A for a Gherkin location with a declared proof directory
outside the feature folder. The test then plants the feature listing at A
without `sha` under the old `\0tree` key, as an older dashboard left it
(removing any new-key entry at A). The ref moves to B through a commit that
touches only a proof file, and a second process reads `intent=locations` at B.
The answer's `featureBlobs` holds every listed feature's blob. A third process
at C, after another proof-only commit, asks GitHub for exactly one `tree` and
answers the same `featureBlobs`. The test must fail before the fix (B answers
`featureBlobs: {}`). Then run, with the new spec:
`env -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts dashboard/tests/boundary/authenticated-read-intent-locations.spec.ts dashboard/tests/boundary/authenticated-read-intent-selection.spec.ts dashboard/tests/boundary/authenticated-read-retained-answers.spec.ts dashboard/tests/boundary/authenticated-read-retained-answers-moved.spec.ts dashboard/tests/boundary/authenticated-read-retained-answers-bounded.spec.ts dashboard/tests/intent-cucumber-proof.spec.ts dashboard/tests/intent-cucumber-proof-absent.spec.ts dashboard/tests/intent-selection-reads.spec.ts --reporter=list`,
plus `npm run typecheck:dashboard`. Apply the repository's
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests).

Behavior: an upgraded dashboard reading a revision whose feature folder an
older dashboard listed without blob shas, at that revision or an untouched
earlier one, reads the folder's tree once more and remembers it under the new
key. Later untouched revisions reuse that listing. Update the `treeLister`
comment in `pinnedTexts.ts` to say the key names the entry shape that carries
blob shas.

## Decisive premises

- **The symptom reproduces at the boundary.** Consuming operation: slice 1's
  failing-first proof. Observed 2026-11-02 in this checkout with a scratch
  boundary spec (deleted afterwards). Process one read A, and its retained
  `e2e_test/features\0tree` entry was rewritten without `sha`. The ref then
  moved to B by a commit touching only `e2e_test/proof/run-2.json`. Process
  two at B asked `["ref","content .planning/PRODUCT-BACKLOG.md@e2","compare e1...e2","commit e4","tree"]`,
  one tree for the proof folder, and answered `featureBlobs: {}` for two listed
  features. Settled: false before the fix.
- **The key change discriminates.** Consuming operation: slice 1's approach.
  The same scratch spec, with `\0tree` scratch-changed to `\0tree\0sha` in
  `treeLister` and the shaless entry planted under the old key only, asked
  `…,"tree","tree"` at B and answered both features' blobs. Reverted
  afterwards. Settled.
- **Reuse survives the new key.** Consuming operation: the preserved reuse
  promise. With the scratch key change, revisions B and C, each one proof-only
  commit later, each asked one `tree` and answered the feature's blob. The
  touched-path comparison takes the path before the first NUL. Settled.
- **No consumer depends on the old key.** Consuming operation: slice 1's
  neighboring proof. With the scratch key change, the intent-locations,
  intent-selection and three retained-answers boundary specs passed (16 with
  the scratch spec, 17.9 s). No test names `\0tree`. Settled.

## Human checkpoint

None needed. The change is local to the dashboard's read memo and is published
through the ordinary delivery path.

## Concern evidence

Slice-plan refinement was not needed: one slice, one proof loop, one
outcome. No remaining slice-specific concern. Every decisive premise above was
observed in this checkout and its scratch edits reverted. The optional
test-tier work is recorded as excluded above, not deferred into this plan.
