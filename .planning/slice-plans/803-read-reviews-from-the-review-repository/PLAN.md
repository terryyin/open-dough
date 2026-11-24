# Read published reviews from the Review repository

**Source:** [Read published reviews from the Review repository](../../seeds/SEED-428-read-reviews-from-the-review-repository.md#read-reviews-from-the-review-repository)

**Identity:** SEED-428#read-reviews-from-the-review-repository

**Status:** Awaiting story refinement. This is a provisional map from [delivered plan 802](https://github.com/terryyin/open-dough/blob/d0489607774ee6a3dd2c69b3fd5e0409288e68ab/.planning/slice-plans/802-review-published-changes/PLAN.md#ordered-slices).
Refine and validate it against the published-only readers delivered by SEED-427
before making it executable.

## Mapped outcomes and proof

1. **Open a completed story from the Review repository.** Carry the storage
   boundary from plan 802 slice 1. Open a comparison and literal file diff on a
   reader with no execution checkout. Share bounded first fetches and report
   cold sync failures. Reuse the existing Git target fetch and process handling.
2. **Move Taken branch and trunk reviews.** Carry the Git source changes from
   plan 802 slices 2–3. Verify the same attributable comparison, including
   interleaved trunk work, and preserve file selection when Refresh advances it.
3. **Move accepted landings and recorded session ranges.** Carry the Git source
   changes from plan 802 slices 5–6. Verify exact ranges and corresponding diff,
   source, and Proof context after trunk advances or a worktree is retired.
4. **Reuse a resolved comparison for local navigation.** Reopen previously synced
   reviews with origin unavailable. Verify exact file diffs and zero remote
   requests as the reader switches files. Keep the last readable comparison and
   show sync status on refresh failure. Remove superseded review access paths
   and their support after all readers move. Retire the temporary
   [North Star topic](../../NORTH-STAR.md#read-published-comparisons-from-the-review-repository)
   at wrap-up.

Plan 802 delivered the published comparisons and removed local-only review and
capture. This plan changes the Git source for the surviving readers.

## Preparation evidence to carry forward

The [original plan 802 preparation](https://github.com/terryyin/open-dough/blob/78dea441a/.planning/slice-plans/802-review-published-changes/PLAN.md#decisive-premises-and-preparation-observations)
verified that authenticated Git could fetch this project's trunk into a fresh
bare repository and read a diff there. Reuse that observation for the transport
boundary. Establish fixture-based proof for the dashboard path, concurrent
readers, and offline cases after SEED-427 lands.

Follow the [shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
For long local checks on macOS, start awake on AC power under `caffeinate -s -i`.
Follow the [machine sleep guidance](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
for battery runs.
