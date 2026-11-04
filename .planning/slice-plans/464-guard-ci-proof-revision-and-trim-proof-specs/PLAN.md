# Guard the CI proof revision and trim the proof specs

**Identity:** SEED-230#guard-ci-proof-revision-and-trim-proof-specs

**Source:** [Correction story](../../seeds/SEED-230-summarize-ci-proof-in-intent.md#guard-ci-proof-revision-and-trim-proof-specs)
**Source review:** [source-review.md](./source-review.md)

**Provenance:** execution retrospective (2026-11-04) of
SEED-230#summarize-ci-proof-in-intent, recoverable at
`0cef955fb613485ecbafc08a9eb6c33949e64bcd:.planning/slice-plans/463-summarize-ci-proof-in-intent/PLAN.md`
and `0cef955fb613485ecbafc08a9eb6c33949e64bcd:.planning/seeds/SEED-230-summarize-ci-proof-in-intent.md`;
commits `99d0f70e7`, `90764ef71`, `adae3482e`, `10a5cf851` and `bf63ed9c1`.

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
Status: done
Proof: `PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh tests/support/ci-proof-declaration.test.mjs tests/support/dashboard-ci-proof-read.test.mjs tests/support/dashboard-ci-proof-parse.test.mjs`; `env -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts dashboard/tests/intent-ci-proof.spec.ts dashboard/tests/intent-ci-proof-reasons.spec.ts dashboard/tests/intent-ci-proof-ancestor.spec.ts dashboard/tests/intent-ci-status.spec.ts dashboard/tests/intent-ci-status-reads.spec.ts dashboard/tests/intent-ci-status-story.spec.ts dashboard/tests/intent-ci-status-story-gaps.spec.ts --reporter=list`; `npm run --silent typecheck:dashboard`; `PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh tests/support/dashboard-story-branch-ci.test.mjs`.

Structure: the tab's behaviour is unchanged; the guard and the moved
refusal checks keep the restrictions proved at a cheaper level.

Accepted: declaration test guards
`github.event.pull_request.head.sha || github.sha`; duplicated no-summary
browser test removed (reasons spec keeps that baseline); ciAdapter reasons
test title names only that case; query refusals live in
`tests/support/dashboard-ci-proof-parse.test.mjs` with one browser refusal;
`judgeBranchCi` sets `ciAdapter` from its one configuration read and the
unreachable proof-path `ci-adapter` short-circuit is removed; refactor
collapsed `BaseCiJudgment.ciAdapter` onto one intersection.

## Current decisions

- One slice: the three findings are small and share the proof specs.
- Finding 3 chose plan option 2: remove the unreachable proof-path
  `ci-adapter` branch; the tab still shows the ciAdapter reason from the
  status judgment without a GitHub proof request.
- Parser refusals are cheaper as `parseIntentCiProofRead` unit tests; one
  browser refusal proves no GitHub call on refuse.

## Execution complete

Product advice: no product follow-up. The correction met its Goal and Scope:
pull-request revision is regression-tested, proof specs each document one
behaviour, and the CI status judgment carries `ciAdapter` from one
configuration read. Visible tab behaviour and the summary contract are
unchanged. Process review found no supported findings to record.
