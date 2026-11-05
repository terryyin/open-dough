# Source review

Launch: Task agent `7de7b747-eb29-4738-a2b0-bd2450af7cd4` (fresh general-purpose,
no conversation inheritance). Input: Goal and Scope only from
`.planning/seeds/SEED-241-intent-loading-and-traffic.md` section
"Keep the shown reading through failed updates"; no plan, return, product, or
proof. Returned numbered commitments below.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A developer reviewing Intent keeps the revision they are reading, with its tree, selection and text, when an update to newer published work is slow, fails or meets unreadable settings | slice 1 | observed: intent-revision-update-outcomes.spec.ts remount+unreadable tests keep A revision/tree/selection/text through fail and unreadable |
| 1.1 | keep the revision they are reading | slice 1 | observed: useIntentLocations.ts shownFromKept + keptShownRevision; remount test keeps pygardon shown after Development→Intent |
| 1.2 | keep its tree | slice 1 | observed: remount test: intentGroupToggle e2e_test/features aria-expanded true after remount+fail |
| 1.3 | keep its selection | slice 1 | observed: remount and unreadable tests: feature aria-pressed true |
| 1.4 | keep its text | slice 1 | observed: remount and unreadable tests: source contains Scenario: Archive a job |
| 1.5 | when update to newer published work is slow | slice 1 | observed: remount test after Development→Intent: during second hold of C, source still Archive a job |
| 1.6 | when that update fails | slice 1 | observed: failed-update test + remount test after fail: notice failure+Retry, A reading stays |
| 1.7 | when that update meets unreadable settings | slice 1 | observed: unreadable settings test: A stays; notice names settings could not be read; no .intent-settings-problem |
| 2 | including after leaving Intent and returning | slice 1 | observed: remount test Development→Intent during held then failing C: A tree/selection/text + failure+Retry |
| 3 | This corrects the delivered SEED-241#load-intent-without-disruption-or-bulk-source-transfer story's recovery behavior | slice 1 | observed: same remount/unreadable proofs correct prior recovery that lost A on remount and replaced on unreadable |
| 4 | it adds no new promise | slice 2 |  |
| 5 | The page-held shown revision and its fallback to the kept answer | slice 1 | observed: useIntentLocations.ts useKeptReading(shown-revision) and shownFromKept fallback |
| 5.1 | page-held shown revision | slice 1 | observed: useIntentLocations.ts setKeptShownRevision(revision) on successful answer; page key shown-revision |
| 5.2 | its fallback to the kept answer | slice 1 | observed: shownFromKept falls back to keptIntentLocationsAt(source, keptShownRevision) when reading revision has none |
| 6 | an unreadable settings answer at the newer revision treated as a failed update | slice 1 | observed: useIntentLocations.ts settings-problem/unreadable → failedUpdate; unreadable test Retry applies C |
| 7 | consolidation of the overlapping read-reuse journeys | slice 2 |  |
