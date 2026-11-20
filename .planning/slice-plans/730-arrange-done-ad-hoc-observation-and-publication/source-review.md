# Source review

Reviewer: a fresh general-purpose subagent launched by the coordinator on
2026-11-20, with no conversation inheritance. Its input was only the selected
story section of SEED-413#arrange-done-ad-hoc-observation-and-publication
(correction context, Goal, Scope, Deferred scope, Key examples, Evaluation),
with instructions to read no project files, change nothing, and number
independently observable promises.

Unnumbered context returned: the correction background and the rejected
25-site `markAdHocDone` ritual; the 16 Done-topic cases already in plain
Vitest; `markDone` and `claudeSessionBecomes(…, "done-live")` remaining only
where Done is a precondition; the goal rationale; the deferred scope (early
quiet Done and native binding case, branch-result race and quiet retry,
session-commits review, general Done lifecycle); later families still using
`launchIsolatedReview` and `keptAdHocRecord`; evaluation under ADR 0010.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Replace the nine launch/list/HTTP Done arrangements across ten cases (observation, retry, lifecycle specs; precedence prepared-receipt case; session-comparisons; both agent-launch-session-branch-landing cases) with plain Node Vitest cases using MakeMe records, the production handlers and real Git | slice 8 |  |
| 2 | Arrange the session from kept records and mark it with `setRecordDoneAt`, so each case starts at the observation or publication it proves; replacements call the typed Done seam without a launch, fake finished-session listing or HTTP Done step | slice 8 |  |
| 3 | Preserve each selected case's inputs, result and refusal assertions | slice 8 |  |
| 4 | Give observation's revision memo an explicit owner | slice 1 | observed: dashboard/server/observedSessionLandings.ts sessionLandingObservations owner; dashboard/backend-tests/review/ad-hoc-manual-landing-revision-observation.spec.ts "ordinary revision checks retain one delivery across repeated observations" awaits owner.observe and a fresh owner |
| 5 | Expose the publisher's prepare and record handling as a typed entry | slice 5 |  |
| 6 | Keep the live Board read and revision check paths asynchronous | slice 1 | observed: dashboard/server/observedSessionLandings.ts observeProjectRevision is a void function that fires void liveObservations.observe without awaiting; observation/authenticated-read-revision-check.spec.ts and authenticated-read-revision-stream.spec.ts pass for the adapter callers (s1-backend-e, s4-proof) |
| 7 | Keep the sender's exact retained comparison and retry in the installed publication proof | slice 7 |  |
| 8 | Retire each `adHocReview.ts` helper when its last consumer moves (in this story) | slice 8 |  |
| 9 | Compare focused timing and the test-support calls removed against the prior cases under ADR 0010 | slice 8 |  |
| 10a | A kept branch has a fixed comparison at Done | slice 2 | observed: dashboard/backend-tests/review/ad-hoc-manual-landing-observation.spec.ts "the first observation after restart discovers a delivery while preserving the fixed branch comparison": branchAtDone branch-result equals review after retirement and saved branch-result tree |
| 10b | The first Board read after restart discovers its actual trunk merge even after a later advance | slice 2 | observed: dashboard/backend-tests/review/ad-hoc-manual-landing-observation.spec.ts "the first observation after restart discovers a delivery while preserving the fixed branch comparison": fresh owner observing the later-advance revision yields landed baseline trunkParent, tree merge, keys delivered+branch-result |
| 10c | Both comparisons and their file reads survive branch retirement and an offline remote | slice 2 | observed: dashboard/backend-tests/review/ad-hoc-manual-landing-observation.spec.ts "the first observation after restart discovers a delivery while preserving the fixed branch comparison": with origin offline both reviews unchanged and fileDiff/fileText give exact delivered and branch pairs |
| 10d | ... with the original Done time intact | slice 2 | observed: dashboard/backend-tests/review/ad-hoc-manual-landing-observation.spec.ts "the first observation after restart discovers a delivery while preserving the fixed branch comparison": keptSession doneAt equals the original Done time |
| 11a | A check at an unchanged revision discovers a newly Done session | slice 2 | observed: dashboard/backend-tests/review/ad-hoc-manual-landing-observation.spec.ts "an unchanged revision check discovers delivery for a newly Done session": same owner observes merge before Done, Done with remote offline leaves manualDeliveryChecked and no landing, same revision then lands the exact pair |
| 11b | A failed validation retries at the same revision while another session's delivery settles | slice 3 | observed: dashboard/backend-tests/review/ad-hoc-manual-landing-observation-retry.spec.ts "a failed verification retries at the same revision and lets other deliveries settle": first pass lands the independent pair while the failed draft keeps branch-result and no landing; same owner at same revision then lands the draft merge, base and file |
| 11c | Repeated observations keep one receipt and pin pair | slice 1 | observed: dashboard/backend-tests/review/ad-hoc-manual-landing-revision-observation.spec.ts "ordinary revision checks retain one delivery across repeated observations": review, saved landing and exact two landing pins unchanged after same-revision and advance observations; deleteRecord releases branch and landing pins |
| 12a | While validation is held, deletion wins | slice 4 | observed: dashboard/backend-tests/review/ad-hoc-manual-landing-observation-lifecycle.spec.ts "deleting while the target is being inspected cannot recreate the launch or leave delivery pins": deleteRecord succeeds while inspection of the leaving tip is held |
| 12b | While validation is held, expiry wins | slice 4 | observed: dashboard/backend-tests/review/ad-hoc-manual-landing-observation-lifecycle.spec.ts "expiry while the target is being inspected releases evidence and cannot recreate the launch": the leaving record ages out while inspection is held and the observation's store write applies retention |
| 12c | After release the other session settles | slice 4 | observed: dashboard/backend-tests/review/ad-hoc-manual-landing-observation-lifecycle.spec.ts "deleting while the target is being inspected cannot recreate the launch or leave delivery pins" and dashboard/backend-tests/review/ad-hoc-manual-landing-observation-lifecycle.spec.ts "expiry while the target is being inspected releases evidence and cannot recreate the launch": review(staying) is landed with its file after release |
| 12d | After release the removed record stays absent | slice 4 | observed: dashboard/backend-tests/review/ad-hoc-manual-landing-observation-lifecycle.spec.ts "deleting while the target is being inspected cannot recreate the launch or leave delivery pins" and dashboard/backend-tests/review/ad-hoc-manual-landing-observation-lifecycle.spec.ts "expiry while the target is being inspected releases evidence and cannot recreate the launch": kept records are exactly [staying] after release |
| 12e | Only the surviving session retains pins until it too expires | slice 4 | observed: dashboard/backend-tests/review/ad-hoc-manual-landing-observation-lifecycle.spec.ts "deleting while the target is being inspected cannot recreate the launch or leave delivery pins" and dashboard/backend-tests/review/ad-hoc-manual-landing-observation-lifecycle.spec.ts "expiry while the target is being inspected releases evidence and cannot recreate the launch": landing pins equal only the survivor's base/revision; after aging staying and a production replaceRecords rewrite, kept records, landing and branch pins are empty |
| 13a | A publisher-prepared pair survives an intervening Done and records the exact receipt | slice 5 |  |
| 13b | After delivery and retirement, the same Done session opens the delivered rename | slice 6 |  |
| 13c | After delivery and retirement, the same Done session opens its different working-tree comparison | slice 6 |  |
| 14a | A declared worktree publishes only for its own launch | slice 7 |  |
| 14b | The pair is kept before push | slice 7 |  |
| 14c | The exact retry after Done and retirement reads the same receipt and file | slice 7 |  |
| 14d | A blank Default main launch can also declare a landing | slice 8 |  |
| 14e | The blank Default main launch keeps its pins until record deletion | slice 8 |  |
