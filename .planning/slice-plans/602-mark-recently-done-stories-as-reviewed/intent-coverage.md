# Dough Intent Coverage: SEED-328#mark-recently-done-stories-as-reviewed

Checked revision: 2ca89f7721fe7381f27656e297cdd179ec5ee599 (2026-11-12, scratch worktree, removed afterwards).

## Report

- **Promise** (Scope + key example "Marking is per story and survives reload"): Mark as reviewed saves the state for one story; marking A then B leaves both reviewed, on the page and after reload.
- **Fault:** `dashboard/server/storyReviewStates.ts` `changeReviewState` writes only the marked story on a mark (`{ ...others, [identity]: … }` → `{ [identity]: … }`), losing the project's other reviewed entries. Fixtures and assertions unchanged.
- **Maintained checks examined:** the 7 tests in `recently-done-review-state.spec.ts`, `recently-done-review-state-offer.spec.ts`, `recently-done-review-state-failed-save.spec.ts`; the backend admission spec by inspection. None marks a story while another is already reviewed.
- **Scratch witness:** marks A then B, reloads, expects A and B Reviewed, C unreviewed, and both identities kept.
- **Command:** `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -i npm run --silent test:dashboard -- --workers=2 --reporter=list <the three specs> <witness>`
- **Results:** a first baseline at `--workers=4` (load 50, battery 14%) had 6 test timeouts (fixture setup, empty Recently done), no review-state assertion failures; baseline at `--workers=2`: 8/8 passed (1.1m, load ~42); fault: 7 maintained passed, witness failed (A's entry dropped; on the page A showed no Reviewed after reload); restored: 8/8 passed (19.5s).
- **Verdict:** Confirmed missing test path. Limited to the checks examined.
- **Next proof action:** add journey proof for marking B while A is reviewed (e.g. extend T1 in `recently-done-review-state.spec.ts`), asserting both stay Reviewed after reload with `keptReviewStates` holding both identities.
- **Not probed:** a periodic read answered with the document from before a concurrent save.
- **Elapsed:** 447796 ms.

## Wrap-up disposition

Pending: routine test strengthening; to be queued as a separate bounded correction (or applied as decided by the developer) before Done publication. Wrap-up stopped before the before-cleanup commit because the machine was at 12% battery under load ~40.
