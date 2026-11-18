# Diagnosis: dashboard-frontend touch-height timeout — run 44308065717

**Failed SHA:** `50235d1220f01538cdb5894998ec3e9d150c064e` (slice 3)

**Run:** https://github.com/terryyin/open-dough/actions/runs/44308065717

**Job:** dashboard-frontend / shard 1/2 `134814704011`

## Failure signature

```
FAIL: story-review-touch-height.spec.ts › revealed details and status share one height budget above a usable code pane (timedOut)
Test timeout of 30000ms exceeded.
```

## CI error-context observations

At timeout the page snapshot shows the Development board with Taken Story A and **Review changes** still available; no Story Review side panel region. Banner shows `Dashboard connection: disconnected`. Artifact: `open-dough/evidence/ci-44308065717/pw-report/.../error-context.md`.

## Attribution

Slice 3 introduced this spec and `.story-review-above` shared budget. Local proof passed; CI Linux timed out. Related to this execution's change.

## Hypotheses

1. Opening or first status wait hangs under `hasTouch` + 780×390 on CI (sync/setup), leaving board without an open review.
2. Later `reachReviewControl` / `toBeInViewport` hangs after a disconnect; snapshot captured after panel loss.
3. Layout budget assertion fails slowly — less likely for a pure timeout with no review in the tree.

## Round 1

Parked: slice 4 stash `/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/dough-ci-repair-stash-buNvTE/record.json`.

### Evidence gathered

- Playwright trace (`dashboard-frontend-playwright-report-1`): `Frame.click` on Taken Story A **Review changes** started and never got an `after` — hung until test timeout (~29s). No later expect ran; panel never opened.
- During that hung click, late fulfills arrived (notes, reviewed, hostOperations, revision) and EventSource aborted (`application/json` MIME) → banner `disconnected`. Card kept reflowing as the kept open session lengthened above Inspection actions.
- Matches `pressReviewChanges` rationale in `reviewRead.ts`: a card still growing moves Review changes so a press can miss or never stabilize.
- Local Mac alone: green in ~5.8s (faster settle; race rare). Hypothesis 1 confirmed; 2–3 ruled out by missing click completion.

### Experiment

Harden `openFrontendStoryReviewAsOpened`: wait until the card reads nothing more and **Open terminal** is visible (session entry settled), scroll Review changes into view, **tapWhereShown** when `maxTouchPoints > 0` (avoid Playwright multi-frame click stability), else click; then `expect(review).toBeVisible()`.

### Result

- Uncommitted: `dashboard/tests/support/frontendStoryReviewOpen.ts`
- Proof (slice-clock run): `story-review-touch-height.spec.ts` + `story-review-details.spec.ts` + `story-review-toolbar-truthful.spec.ts` → **9 passed** (~7.5s). Log: `/tmp/touch-height-proof.log`.

**Verdict:** hung `click` under short touch landscape while Taken session facts arrived; open-helper sync + touch tap fixes it. Leading hypothesis confirmed; repair ready (do not commit from this agent).
