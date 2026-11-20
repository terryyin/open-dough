# Source review: SEED-413#remove-ad-hoc-done-helper

A fresh general-purpose reviewer, launched without conversation inheritance
on 2026-11-20, received only the seed section's Goal and Scope text for
`SEED-413#remove-ad-hoc-done-helper` and the source-only review instructions.
It read no files and returned the five promises below.

Unnumbered context: the story corrects
`SEED-413#refuse-story-launch-session-file-reads` after its retrospective; the
North Star is the reason for removal; "through the existing boundary calls"
conditions promise 1; "consuming case" means the cases that used
`markAdHocDone`.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Each ad hoc review backend case shows its session finishing before it marks it Done, through the existing boundary calls | slice 1 | observed: the 25 call sites in the 9 consumer specs list the session `claudeSessionBecomes(…, "done-live")` before `markDone(…)` and assert 200 |
| 2 | `markAdHocDone` is gone from `dashboard/test-support/support/adHocReview.ts`; test support holds no Done helper the North Star asks to remove | slice 1 | observed: `grep -rn markAdHocDone dashboard` is empty; the `adHocReview.ts` diff only removes lines |
| 3 | Each Done mark in the consuming cases still avoids the five-second rename wait | slice 1 | observed: slice 1 after-run proof record, 27 cases, largest per-case rise +0.9 s, summed 89.7 s → 88.9 s |
| 4 | Every consuming case keeps its inputs and expectations | slice 1 | observed: 27 of 27 cases expected before and after; spec diffs change only the Done call sites and imports |
| 5 | Every consuming case keeps its current speed | slice 1 | observed: per-case before/after at HEAD vs change (load 3–5 vs 7.6–7.8), wall 50.5 s → 47.1 s |
