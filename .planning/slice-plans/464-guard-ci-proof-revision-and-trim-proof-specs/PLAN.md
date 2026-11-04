# Guard the CI proof revision and trim the proof specs

**Identity:** SEED-230#guard-ci-proof-revision-and-trim-proof-specs

**Source:** [Correction story](../../seeds/SEED-230-summarize-ci-proof-in-intent.md#guard-ci-proof-revision-and-trim-proof-specs)

**Provenance:** execution retrospective (2026-11-04) of
SEED-230#summarize-ci-proof-in-intent, plan 463, commits `99d0f70e7`,
`90764ef71`, `adae3482e`, `10a5cf851` and `bf63ed9c1`.

## Current findings

1. **Unguarded pull-request revision.** `.github/workflows/ci.yml` sets
   `CI_PROOF_REVISION: ${{ github.event.pull_request.head.sha || github.sha }}`
   so a pull-request run's summary names the head SHA the dashboard judges
   (`ci-github-actions.mjs` `head_sha`). `tests/support/ci-proof-declaration.test.mjs`
   only injects the variable; dropping the `pull_request.head.sha ||` part
   would make every pull-request summary read "for another run, attempt or
   revision" with no failing test.
2. **Proof specs overlap and mislabel.** `dashboard/tests/intent-ci-proof.spec.ts`
   "a run without a summary says so…" repeats the baseline of
   `intent-ci-proof-reasons.spec.ts`; the reasons spec's "a ciAdapter project,
   and a result with no completed run, each give one reason…" covers only
   the ciAdapter case (the next test covers no completed run); and the
   browser spec checks seven `intent=ci-proof` query refusals that are rule
   variations of `parseIntentCiProofRead`.
3. **The ciAdapter decision is made twice.** `dashboard/server/intentCiStatusRead.ts`
   calls `readsCiThroughAdapter(folder)`, reading the CI configuration again
   after `judgeBranchCi` (`baseCiJudgment.ts`) already read and branched on
   it; the server proof read's `ci-adapter` branch (`intentCiProofRead.ts`) is
   not reached from the tab and has no test.

## Preserved promises and constraints

Every promise of the original story and its source review stays: the summary
is used only on a full repository, run, attempt and revision match; the
verdict reads the same in every proof state; a `ciAdapter` project shows the
ciAdapter reason without a GitHub proof request. Every file stays at or under
250 lines.

## Proof ownership

| Finding | Slice | Proof |
| --- | --- | --- |
| 1 | 1 | Declaration test asserts the workflow-level `CI_PROOF_REVISION` expression prefers `github.event.pull_request.head.sha` over `github.sha`, and fails when that part is removed |
| 2 | 1 | The duplicated no-summary test is gone with its assertions present in the reasons spec; the ciAdapter test title names only that case; a unit test of `parseIntentCiProofRead` covers the query refusals and one browser refusal remains |
| 3 | 1 | The CI status answer's `ciAdapter` comes from the judgment's own configuration read (one read per judgment); a direct `intent=ci-proof` request for a ciAdapter project answers `ci-adapter` before any GitHub call, or the branch is removed with that reason recorded |

## Slices

### 1. Guard the revision, trim the proof specs and read the CI configuration once
Type: Structure
Status: planned
Proof: `PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh tests/support/ci-proof-declaration.test.mjs tests/support/dashboard-ci-proof-read.test.mjs <new parser unit test>`; `env -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts dashboard/tests/intent-ci-proof.spec.ts dashboard/tests/intent-ci-proof-reasons.spec.ts dashboard/tests/intent-ci-proof-ancestor.spec.ts dashboard/tests/intent-ci-status.spec.ts dashboard/tests/intent-ci-status-reads.spec.ts dashboard/tests/intent-ci-status-story.spec.ts dashboard/tests/intent-ci-status-story-gaps.spec.ts --reporter=list`; `npm run --silent typecheck:dashboard`.

Structure: the tab's behaviour is unchanged; the guard and the moved
refusal checks keep the restrictions proved at a cheaper level.

## Current decisions

- One slice: the three findings are small and share the proof specs.
