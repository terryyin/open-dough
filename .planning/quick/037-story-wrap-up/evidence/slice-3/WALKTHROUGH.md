# Slice 3 behavior walkthrough

Candidate: Proposed `dough-story-wrap-up` after follow-up queueing.
Date: 2026-09-10. Local representative records, not native acceptance.

Builder: [build-fixture.sh](build-fixture.sh). Each variant starts from the
Slice 2 shared fixture plus follow-up plan `002-retry-backoff` and a
completed retrospective that names that plan. Marker `FOLLOW-UP-PLAN-KEEP`
must survive. Original spent marker must not.

## Existing canonical follow-up story

Starting: [existing-story/starting/](existing-story/starting/).
Before-cleanup `319a61a6a58113b669c6180ea73e650e1cca8362`.

Closed: [existing-story/closed/](existing-story/closed/). The retry story is
first in the backlog, its plan field points at `002-retry-backoff`, and that
plan is unchanged. Audit-trail remains second. Spent `001-widget-status`
history is gone. Direction is unchanged.

`git show 319a61a6a58113b669c6180ea73e650e1cca8362:.planning/quick/001-widget-status/PLAN.md`
recovers the closed execution.

Second invocation: [existing-story/rerun/](existing-story/rerun/) matches
closed. No duplicate story or queue entry.

## Create a home from supplied outcome

Starting: [create-home/starting/](create-home/starting/) has no retry story.
Supplied context: beneficiary Operators watching widget health; outcome a
failed check waits and retries with backoff before erroring.

Closed: [create-home/closed/](create-home/closed/) created one canonical
section with that beneficiary/outcome, linked the existing plan, and queued
it first. Before-cleanup `e16412f240ed037a3007e368558915eed3c3dcd0`.

## Missing beneficiary/outcome

Starting: [missing-outcome/starting/](missing-outcome/starting/). Retrospective
names the follow-up plan but no beneficiary/outcome is supplied.

Closed: [missing-outcome/closed/](missing-outcome/closed/) did not invent a
story or queue entry. The follow-up plan remains. Original spent history is
gone. Gap reported: cannot create a canonical follow-up home.
Before-cleanup `0f8c3d9ff96141bab3ef949335dab317dd879bc0`.

## Behavior review

1. **Invocation context.** Wrap-up consumes an existing follow-up plan from
   retrospective output; it does not replan or execute it.
2. **Required context.** Missing beneficiary/outcome blocks only the new-story
   addition; other wrap-up continues.
3. **Useful outcome.** Follow-up work is first and self-contained; spent
   original history is gone; unrelated order and direction stay put.

Product-review advice remains unsupported.
