# Source review

**Launch:** fresh general-purpose reviewer (no conversation inheritance), 2026-11-21, by the plan 754 coordinator.
**Input:** the story section SEED-413#tie-done-capture-cases-to-production (Goal, Scope, Key examples, Evaluation) and this plan's `## Correction input`, copied verbatim to the execution evidence file `source-review-input.md`; the reviewer was told to read no other files and change nothing. Return retained at `source-review-return.md` in the same evidence location.

Unnumbered context: provenance (retrospective of SEED-413#fold-done-capture-launches-into-makeme, `01b7cc602..2bed7f34c`, plan 737 at `47af39ca6`); findings baseline `640349c9f`; runtime work belongs to SEED-413#optimize-done-capture-family-cases; builder generic casts stay; ADR 0010 evaluation; effort S.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | On a fresh worktree the declaring-launch recipe's composed branch entry agrees in full with a real proposeBranchEntry proposal, compared at the proposal boundary | slice 1 | observed: branch-entry-proposal.spec.ts 'the declaring recipe's entry is the proposal for its fresh worktree' toEqual(proposeBranchEntry entry); s1-proof pass |
| 2 | Removing the recipe's trunk revision makes the agreement case fail | slice 1 | observed: s1-scratch-no-revision run: recipe trunk revision removed, only the agreement case failed (1 failed, 3 passed) |
| 3 | declared-worktree-publication.spec.ts no longer carries the assertions restating the composed entry (read-back right after keep) | slice 1 | observed: declared-worktree-publication.spec.ts diff: entry toMatchObject and kept read-back removed |
| 4 | The backend-test README no longer claims the fixture's entry is proposed by production; describes the agreement check correctly | slice 1 | observed: dashboard/backend-tests/README.md declared-branch paragraph: composed via withDeclaringLaunch, checked by branch-entry-proposal.spec.ts |
| 5 | Publisher still verifies the landing context reference and the original session's retained landing after retirement, with installed publisher delivery and exact retry | slice 1 | observed: declared-worktree-publication.spec.ts context reference, landing, exact retry and retained-landing assertions unchanged; s1-proof pass |
| 6 | ad-hoc-session-comparisons.spec.ts no longer predicts the context filename; uses the path writeLandingContext returns; after publisher delivery and retirement the record still opens the delivered rename and the distinct captured working-tree change | slice 2 | observed: ad-hoc-session-comparisons.spec.ts: writeLandingContext result feeds reportingThrough and publishInstalled; filename toBe removed; post-retirement rename and working-tree reads kept; s2-spec pass |
| 7 | The three completion specs build accepted reporting attempts via makeMe.anAcceptedAttempt.reportingFor(record) / .landingIn(authority) instead of by hand | slice 6 |  |
| 8 | The two declared-landing cases state repository, base and worktree facts once, varying only their landing data | slice 4 | observed: doneCaptureCaseBuilder withDeclaredLandingLaunch states repository, base, worktree, origin once; persistence spec and ad-hoc-prepared-landing-done pass only their landing data; s4-consumers pass |
| 9 | The four case-build sites use the builder's .kept() instead of explicitly keeping every record after please() | slice 3 | observed: four sites use .kept() (shared-checkout, commits x2, kept-commits-release missing repository); pin-release explicit keep retained; .kept() keeps in materialization before please returns; s3-backend-2 12/12 pass |
| 10 | Declaring, isolated and declared-landing setup no longer silently substitute an empty path; a case naming an undeclared worktree fails at please() with that name | slice 4 | observed: doneCaptureCasePlaces worktree(branch) throws Undeclared or unmaterialized worktree: <branch>; declaring, isolated, declared-landing and in-work use it; no ?? empty fallback; s4-scratch undeclared case rejected at please() |
| 11 | Quiet Done cases have a single source for their timeline: no repeated Done time, no pending Done set inside a refinement absent from the timeline; retry uses the case's stated Done time | slice 5 |  |
| 12 | Quiet-completion retry still resumes the pending native mark and retains the earlier capture failure | slice 5 |  |
| 13 | The case's checkout type is no longer re-exported through the effects module that materialization imports (circular type dependency retired) | slice 4 | observed: doneCaptureCase.ts no longer re-exports Checkout (exports WorkCheckout); consumers import Checkout from doneCaptureCaseMaterialization.ts |
| 14 | The builder's unused CaseFacts re-export is removed | slice 4 | observed: doneCaptureCaseBuilder.ts re-exports only Refinement |
| 15 | support/capturedCommandFetch.ts is retired; the command-carried handoff in review/ad-hoc-session-branch-handoff.spec.ts keeps its observation | slice 7 |  |
| 16 | Production behavior is unchanged | slice 7 |  |
| 17 | Machine-store publication proof preserved: declared publisher specs and server/landingRecordPersistence.spec.ts keep observable machine-store writes, races and pin ownership | slice 7 |  |
| 18 | Other independent assertions preserved (real Git, work and launch times, installed publisher delivery and exact retry, native Done rename); only restating and guessed ones removed | slice 7 |  |
| 19 | Support surface shrinks or holds | slice 7 |  |
| 20 | server/landingRecordPersistence.spec.ts stays at or below 225 lines | slice 4 | observed: server/landingRecordPersistence.spec.ts 225 to 214 lines |
| 21 | review/ad-hoc-review-request.spec.ts is not edited | slice 7 |  |
