# Name every passage a boundary row's own passages require

**Identity:** SEED-010#name-required-passages-in-boundary-rows
**Source:** [Story 16](../../seeds/SEED-010-learn-from-execution-retrospectives.md#name-required-passages-in-boundary-rows)

## Correction input

**Provenance.** This is a retrospective correction of
SEED-010#bound-startup-guidance-retrieval (plan 345, recoverable at
`09eb0767:.planning/slice-plans/345-bound-startup-guidance-retrieval/PLAN.md`). Its commits are
`5039fb70` (Take) and `fc62c171` (slice 1, the boundary-reads table and
`read-budget-guidance.test.mjs`). That story promises that each boundary's
needed reference is named there and read then, within the budget (key
example 3). It also promises that a check keeps every boundary's named read
set within the budget, and that what managed delivery owns needs no read.

**Current findings (at `fc62c171`).** Three rows name passages that send the
coordinator to another passage at that boundary every time, but the row does
not name that passage. The check therefore does not count it.

- **Delivery row.** The `wrap-up.md#deliver-the-change` passage says fresh
  increments and owned repairs "use [guarded fresh preparation and
  delivery](fresh-increment.md) for steps 3–8". The row does not name
  `fresh-increment.md` (9,312 bytes). With it added, the row's current set
  measures 33,829 bytes, over the 30,000 budget. The row also names the whole
  of `trunk-publication.md` (15,269 bytes). Most of that file covers claim
  publication, which the start command owns, and recovery, which applies
  only after an interruption or rejection.
  - Observed in this execution: the coordinator needed `fresh-increment.md`
    at delivery. It read that file in a separate call together with the
    increment section of `trunk-publication.md`.
- **Finish row.** `ci-monitor.md#await-the-applicable-revision-at-completion`
  says "Before any path, follow [completion
  mechanics](ci-completion-wait.md)". The row does not name
  `ci-completion-wait.md` (4,878 bytes).
- **First-delegation, delivery and finish rows.** Each row's passage runs
  `story-obligations.mjs` and says to use its inputs under
  `story-obligations.md#use-the-record-at-execution-boundaries` (1,931
  bytes). No row names that section.

Measured with the check's own section rule, these row sets fit:

| Row | Bytes |
| --- | --- |
| Delivery: wrap-up `#deliver-the-change`, `fresh-increment.md`, trunk-publication `#publish-an-execution-increment-or-repair` and `#publish-the-candidate`, story-obligations `#use-the-record-at-execution-boundaries` | 28,129 |
| Finish: `finish-or-stop.md`, ci-monitor `#await-the-applicable-revision-at-completion`, `ci-completion-wait.md`, story-obligations `#use-the-record-at-execution-boundaries` | 22,950 |
| First delegation: the current row plus story-obligations `#use-the-record-at-execution-boundaries` | 22,642 |

**Preserved promises and constraints.**
- The predecessor story's promises stay as they are: one row per tool result; rows in
  execution order; every row at most 30,000 bytes; every reference the former
  paragraph named stays reachable from some row.
- No digest, retrieval script or rewritten reference prose. Those exclusions
  carry over from the predecessor story.
- Passages needed only under a condition stay with targeted retrieval. These
  are `agent-commits.md`, a missing gap's `story-obligations.md` sections,
  trunk-publication's recovery and precondition sections, and
  oversized-slice handling.
- No reference file is renamed or split.

## Outside-in proof

| Promise | Owner and proof |
| --- | --- |
| Each row names the passages its named passages require there every time. | Slice 1: `read-budget-guidance.test.mjs` asserts that the delivery row links `fresh-increment.md`, the finish row links `ci-completion-wait.md`, and the first-delegation, delivery and finish rows link `story-obligations.md#use-the-record-at-execution-boundaries`. The required links are listed in the test beside the boundary list. |
| Every row still fits, and the delivery row no longer names whole-file trunk publication. | Slice 1: the existing per-row budget test passes with the new rows. Its printed sizes are recorded in Learnings. The test asserts that the delivery row links only the two trunk-publication anchors named above. |
| Nothing else changes meaning. | Slice 1: `bash -c 'source scripts/test-environment.bash && node --test src/skills/dough-execute-plan/scripts/*.test.mjs'`, `/opt/homebrew/bin/bash tests/payload-declaration-links.sh`, `npm run lint`. |

## Ordered slices

### 1. Boundary rows name the passages their passages require
Type: Behavior
Status: done
Proof: as mapped above. The new assertions fail first against `fc62c171`'s table.

Behavior: a coordinator reaches the first delegation, delivery, or finish →
it reads that row → the row already includes `fresh-increment.md`,
`ci-completion-wait.md`, and the story-obligations inputs. The row is within
budget, so the coordinator makes no extra unbudgeted read for them. Edit the
table rows in `src/skills/dough-execute-plan/SKILL.md` and extend
`read-budget-guidance.test.mjs`.

## Execution complete

Product advice: no change. The boundary rows now name every passage their
passages require at that boundary, completing
SEED-010#bound-startup-guidance-retrieval's read-budget promise.

## Current decisions

- The test lists the required nested links explicitly. It does not infer
  them from reference prose, because deciding whether a passage is
  "required every time" is a judgment call.

## Learnings

- Slice 1 row sizes after the edit, from the check's own section rule:
  skill body 19,612; established start 2,922; execution workspace 18,790;
  Codex arming 21,071; first delegation 22,843; accepting a return 9,082;
  delivery 28,129; other-host arming 27,463; CI notification 26,892;
  finish 22,950. All fit the 30,000 budget.
- The delivery row label dropped "a claim": the start command publishes the
  claim, and the row no longer reads trunk publication's claim section.
  Interrupted claim recovery stays with targeted retrieval.
- Proof: the two new assertions failed first against the old table;
  `node --test src/skills/dough-execute-plan/scripts/*.test.mjs` 939/939,
  `tests/payload-declaration-links.sh` and `npm run lint` passed.

## Concern evidence

Refinement was not needed. This is one bounded table edit with one test
extension, and the row sizes above were measured in this checkout. No
remaining slice-specific concern was identified.
