# Diagnosis: dashboard-frontend touch-height clipped — run 44311355288

**Failed SHA:** `7f42be69b6d01d3862be48051a4964f1f0b35e8a` (open-helper repair)

**Repair HEAD:** current branch tip (slice 4 on top of that repair)

**Run:** https://github.com/terryyin/open-dough/actions/runs/44311355288

**Job:** dashboard-frontend / shard 1/2

**Clock:** `dashboard-frontend-touch-height-clipped-44311355288`

## Failure signature

```
FAIL: story-review-touch-height.spec.ts › revealed details and status share one height budget above a usable code pane
Error: touch target is not clipped
+   "Review changes is cut by what clips it"
at tapShownControl (controlReachability.ts:35)
from openFrontendStoryReviewAsOpened (frontendStoryReviewOpen.ts)
```

## CI error-context observations

Page still on Development board; Story Review never opened. Banner
`Dashboard connection: disconnected`. Taken Story A shows Open terminal and
Review changes. Column paging control reads **Taken 1 entry** — Taken is the
hidden column under one-column Board paging. Artifact:
`/tmp/ci-44311355288/pw-report/.../error-context.md`.

## Attribution

Prior open-helper repair (settle + tapWhereShown) fixed the hung click; this
failure is the next gate: tapWhereShown requires an unclipped target. Related
to this execution's touch-height + open-helper path.

## Hypotheses

1. At 780×390 with `scrollbar-gutter: stable`, Board `@container` width falls
   under 48rem so only one column shows; leftmost stays Backlog; Taken is
   `height: 0; overflow: clip`. `scrollIntoViewIfNeeded` cannot unclip
   Review changes; `showColumn(page, "Taken")` is required (same pattern as
   `frontendSidePanelWidth.openReview`).
2. Taken is shown but Review changes still sits past a non-scrollable clip
   (board-view / window) after vertical scroll — less likely given the
   **Taken 1 entry** paging control in the snapshot.
3. Layout still moves after scroll before the clip check — ruled down: prior
   settle waits for Open terminal; failure is immediate clip, not hang.

## Round 1

**Clock:** round 1, ~6.3 cumulative active minutes (under limit).

### Evidence gathered

- Trace: Scroll into view completes, then `touch target is not clipped` on
  Review changes — no panel open.
- Snapshot paging control **Taken 1 entry** matches hypothesis 1.
- Sibling open path already calls `showColumn(page, "Taken")` before Review
  changes (`frontendSidePanelWidth.ts`).
- Local at 780×390: `--columns-shown: 2`, `data-hidden: 3`, no clip (passes).
- Forced one-column repro (viewport width 700, same helper path):
  `--columns-shown: 1`, `data-hidden: "2 3"`, Taken `.column` `overflowY: clip`
  `clientHeight: 0` → exact CI signature
  `"Review changes is cut by what clips it"`. Hypothesis 1 confirmed; 2–3
  ruled out.

### Experiment

Before tapping Review changes in `openFrontendStoryReviewAsOpened`, call
`showColumn(page, "Taken")` so a one-column Board pages Taken into view;
keep settle + scrollIntoViewIfNeeded + touch tap.

### Result

- Uncommitted: `dashboard/tests/support/frontendStoryReviewOpen.ts`
- Diagnosis note: this file.
- Forced 700×390 repro after fix: **1 passed** (~3.1s). Log:
  `/tmp/touch-height-fix-700.log`.
- Proof (slice-clock run): `story-review-touch-height.spec.ts` +
  `story-review-details.spec.ts` + `story-review-toolbar-truthful.spec.ts` →
  **9 passed** (~7.8s). Log: `/tmp/touch-height-clip-proof.log`.

**Verdict:** one-column Board left Taken height-clipped; `showColumn("Taken")`
before the touch open unclips Review changes. Leading hypothesis confirmed;
repair ready (do not commit from this agent).
