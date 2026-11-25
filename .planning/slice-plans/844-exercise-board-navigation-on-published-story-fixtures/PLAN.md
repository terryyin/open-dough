# Exercise Board navigation on published story fixtures

**Status:** awaiting story refinement — not ready for slice-plan refinement or execution

**Identity:** SEED-442#exercise-board-navigation-on-published-story-fixtures
**Source:** [Exercise Board navigation on published story fixtures](../../seeds/SEED-442-exercise-board-navigation-on-published-story-fixtures.md#exercise-board-navigation-on-published-story-fixtures)

## Split and retained evidence

This story takes the unfinished fixture migration from
[SEED-439 slice 6](../833-complete-story-linked-ad-hoc-sessions/PLAN.md#6-retire-standalone-board-entries-and-review-selection).
SEED-439's slices 1–5 stay published, and its slices 6–10 retain the product
changes and their gates. The fixture story is useful on current trunk:
maintainers can test published story navigation with native controls there.

The consumer's paused patch and its evidence live in its worktree's Git
evidence directory. `SLICE-6-REPORT.md` and
`slice-6-consumer-dispositions.md` identify the accepted selections and
fixture owners. `slice-6-remaining-journey-check.log.run.json` records two
failures at the standalone-fixture boundary against the paused Board change.
`slice-6-paused.patch.sha256` verifies the retained patch based on
`aed91f904`. Reuse the observed linked proof where the fixture and
consuming operation still match.

## Provisional slice mapping

### 1. Page and refresh published Done stories

Move the shared progressive fixtures and the still-applicable reset and
refresh cases onto published Done catalog entries. Verify older-page reads,
held or failed record handling, retention of the visible range, and focus
when the catalog changes. Keep the loading, after-sessions, added-project,
and failed-read checks already retained by SEED-439 where they exercise a
separate observation.

### 2. Navigate to a published story from its session

Move the navigation, state, and cross-project sidebar destinations that
share the progressive fixture. Verify the precise reading limit, focus
after the held answer, supersession by a later choice or page reset, and
terminal or report close with an owning story. Identify movement-only
standalone cases and the retained linked proof for each applicable
observation. Leave changes to product placement to SEED-439.

The supplier proof runs on its integration candidate. Compare its fixture
inputs to the paused Board candidate in an isolated checkout so the
consumer can distinguish remaining product failures from old fixture
assumptions. Follow the shared [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
On macOS, start awake on AC under `caffeinate -s -i`. On battery, plug in or
start awake with the lid open under `caffeinate -i` and check the sleep log.
