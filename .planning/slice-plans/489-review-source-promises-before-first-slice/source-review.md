# Source review

Fresh general-purpose reviewer (no conversation inheritance). Input: only the
selected story Goal, Scope, key examples, exclusions, Evidence, Facts, and
Evaluation text for
`SEED-010#review-source-promises-before-first-slice` (no plan, return, product,
proof, or current-slice scope). Reviewer read no other project files and changed
nothing.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | For a coordinator executing a planned story or planned correction, obtain the independent source-only reviewer's commitments before delegating the first slice. | slice 1 | observed: obtain-source-review.md#before-planned-delegation: obtain before first implementation delegation |
| 2 | Allocate those commitments (recorded as `source-review.md`) before delegating the first slice. | slice 1 | observed: obtain-source-review.md#retain-link-and-allocate + #before-planned-delegation: allocate every id before listing |
| 3 | The first slice's `story-obligations.mjs list --slice N` output carries its allocated source commitments into the first implementation brief. | slice 1 | observed: delegation.md List promises: listing carries allocated commitment ids into the brief |
| 4 | Story qualifications that the plan's proof never named reach the implementer up front. | slice 1 | observed: obtain-source-review.md#before-planned-delegation + delegation.md List: commitments reach first brief |
| 5 | Those qualifications do not reach the implementer as mid-run addenda. | slice 1 | observed: obtain-source-review.md#before-planned-delegation: before list, not mid-run addenda |
| 6 | Those qualifications do not reach the implementer as extra return rounds. | slice 1 | observed: obtain-source-review.md#before-planned-delegation: before list, not extra return rounds |
| 7 | Those qualifications do not reach the implementer as a promise moved to a later slice at first acceptance. | slice 1 | observed: obtain-source-review.md + wrap-up.md: unmet slice-1 commitment returns to that slice |
| 8 | The review continues to run once per execution; only its timing relative to the first Behavior-slice delegation changes (ADR 0002 low-cost delivery). | slice 1 | observed: obtain-source-review.md#before-planned-delegation once; #at-acceptance reuses without second reviewer |
| 9 | In planned execution, obtain the source-only review under the existing isolation and input rules. | slice 1 | observed: obtain-source-review.md isolation and input rules |
| 10 | Retain that review as `source-review.md`. | slice 1 | observed: obtain-source-review.md#retain-link-and-allocate retain as source-review.md |
| 11 | Link the retained review with `**Source review:**`. | slice 1 | observed: obtain-source-review.md#retain-link-and-allocate link with **Source review:** |
| 12.1 | Before the first implementation delegation, allocate every id, whatever the first slice's type: to a slice. | slice 1 | observed: obtain-source-review.md#retain-link-and-allocate allocate to the slice whose output owes it |
| 12.2 | Before the first implementation delegation, allocate every id, whatever the first slice's type: to a disposing obligation. | slice 1 | observed: obtain-source-review.md#retain-link-and-allocate allocate to a disposing obligation |
| 12.3 | Before the first implementation delegation, allocate every id, whatever the first slice's type: to a lifecycle owner. | slice 1 | observed: obtain-source-review.md#retain-link-and-allocate allocate to lifecycle owner |
| 13 | A plan that already links a retained review for the unchanged source reuses that review. | slice 1 | observed: obtain-source-review.md#before-planned-delegation Reuse linked retained review for unchanged source |
| 14 | After a human story amendment, obtain a fresh review before the next delegation. | slice 1 | observed: obtain-source-review.md#before-planned-delegation After amendment, obtain a fresh review |
| 15 | After a human story amendment, reallocate before the next delegation. | slice 1 | observed: obtain-source-review.md#before-planned-delegation After amendment, replace and allocate again |
| 16 | While the source is unchanged, slice acceptance reuses the retained review. | slice 1 | observed: obtain-source-review.md#at-acceptance reuse retained review while source unchanged |
| 17 | While the source is unchanged, slice acceptance launches no second reviewer. | slice 1 | observed: obtain-source-review.md#at-acceptance do not launch another reviewer |
| 18 | Slice acceptance continues comparing against the retained review (as today). | slice 1 | observed: wrap-up.md#accept-proof Compare that independent return |
| 19 | Slice acceptance continues observing each allocated id (as today). | slice 1 | observed: wrap-up.md#accept-proof + story-obligations.md observing each allocated id |
| 20 | Slice acceptance continues correcting a wrong allocation (as today). | slice 1 | observed: story-obligations.md#record-the-source-review Correct a wrong allocation at any later acceptance |
| 21 | An execution that reaches acceptance with no retained review still obtains the review there. | slice 1 | observed: obtain-source-review.md#at-acceptance When none retained, obtain under the rules above |
| 22 | When reviewer isolation or its retained evidence is unavailable before the first delegation, name the missing review. | slice 1 | observed: obtain-source-review.md#before-planned-delegation name the missing review |
| 23 | When reviewer isolation or its retained evidence is unavailable before the first delegation, stop that delegation. | slice 1 | observed: obtain-source-review.md#before-planned-delegation stop this delegation |
| 24.1 | Preserve source-only reviewer isolation: fresh agent. | slice 1 | observed: obtain-source-review.md fresh general-purpose reviewer |
| 24.2 | Preserve source-only reviewer isolation: source text and human amendments only. | slice 1 | observed: obtain-source-review.md source text and human amendments only |
| 24.3 | Preserve source-only reviewer isolation: no plan or slicing. | slice 1 | observed: obtain-source-review.md Give no plan, return, product, proof |
| 25 | Preserve the `source-review.md` record form. | slice 1 | observed: story-obligations.md#record-the-source-review Commitments table form |
| 26 | Preserve `record` / `list` / `check` commands and refusals. | slice 1 | observed: story-obligations-source-review-lifecycle.test.mjs record/list/check lifecycle |
| 27 | Preserve lifecycle owners. | slice 1 | observed: story-obligations.md#record-the-source-review landing\|target CI\|reporting |
| 28 | Preserve acceptance verification against the actual product and proof. | slice 1 | observed: wrap-up.md#accept-proof Compare actual product and proof |
| 29 | Update the delegation step for the moved timing/wording. | slice 1 | observed: delegation.md ## Obtain the source-only review links #before-planned-delegation |
| 30 | Update the acceptance step for the moved timing/wording. | slice 1 | observed: wrap-up.md#accept-proof links obtain-source-review.md#at-acceptance |
| 31 | Update the story-obligations record section for the moved timing/wording. | slice 1 | observed: story-obligations.md#record-the-source-review obtaining it before planned delegation |
| 32 | Update `planning.md`'s plan-element note for the moved timing/wording. | slice 1 | observed: planning.md plan element 7: first planned delegation obtains and allocates |
| 33 | Update the execute-plan step table's first-delegation row for the moved timing/wording. | slice 1 | observed: dough-execute-plan/SKILL.md Before first implementation delegation links source review |
| 34 | Update the guidance tests that pin the moved wording. | slice 1 | observed: story-obligations-source-review-guidance.test.mjs + story-obligations-guidance.test.mjs pins |
| 35 | Write guidance for the executing agent (ADR 0006). | slice 1 | observed: src/skills/ only (ADR 0006); no installed-copy sync in this change |
| 36 | Release that guidance through ADR 0003. | slice 1 | observed: ADR 0003 release path; no premature installed sync |
| 37 | At completion, record at ODF-367 the actual response revision and first containing release (or explicitly unreleased status); the finding remains queued, not resolved. | slice 1 | observed: ODF-367.md Response: First containing release none yet (unreleased); finding remains queued, not resolved |
