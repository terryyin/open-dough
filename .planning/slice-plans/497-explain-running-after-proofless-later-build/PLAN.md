# Explain a running later build after a proofless one

**Identity:** SEED-254#explain-running-after-proofless-later-build
**Source:** [Explain a running later build after a proofless one](../../seeds/SEED-254-use-ancestor-ci-proof-for-skipped-builds.md#explain-running-after-proofless-later-build)
**Source review:** [Independent source review](source-review.md)

## Source and provenance

Retrospective correction of
[Use a later trunk build's CI proof for cancelled landings](https://github.com/terryyin/open-dough/blob/8296c54b10b76a6cb654fe565da24a5557bc6025/.planning/seeds/SEED-254-use-ancestor-ci-proof-for-skipped-builds.md#use-later-ci-proof-for-cancelled-landings)
(plan 496 at `8296c54b1:.planning/slice-plans/496-use-later-ci-proof-for-cancelled-landings/PLAN.md`). Reviewed commits: `85946790e` (slice 1) and `1359d6fb7` (slice 2)
on trunk base `0b4ba8d1b`. That story's Scope, "No later proof", asks Landed
to add why: no later trunk build yet, a later build still running, or the
nearest later build's proof unavailable and why.

## Current findings

- `dashboard/server/laterTrunkBuild.ts` `laterTrunkProofBuild` returns
  `{kind: "running", build}` as soon as it meets a running build, even after
  it has recorded an earlier `unavailable` build. The `running` variant of
  `LaterTrunkProofWalk` cannot carry `unavailable`.
- `noLaterProofWords` then says "A later trunk build at X is still running,
  so no later trunk build has finished yet." That is false: the proofless
  later build had finished. The nearest later build's proof reason is lost.
- `tests/support/dashboard-later-trunk-build.test.mjs` "says where it
  stopped" builds this case (an expired-proof run, then a running run) and
  asserts only `walk.kind === "running"`. No slot or journey asserts the
  wording.

## Preserved promises and constraints

- The answer for a walk that stopped at a running build stays not final
  (`awaitingLaterBuild`).
- A running build with no proofless build before it keeps today's wording.
- One proof usability rule (`walkingProofAbsence`) and one proof-absence
  wording table (`ciProofAbsenceWording.ts`).
- Found, head and bound outcomes, timed-out landings, Trunk Mode Landed,
  Baseline and Branch are unchanged.

## Outside-in proof and ownership

| Promise | Owner | Proof |
| --- | --- | --- |
| A proofless later build followed by a running one: Landed names that build's proof reason, says a later build is still running, does not say no later trunk build has finished, and shows no figures; the answer is not remembered | Slice 1 | A slot-level test in `tests/support/dashboard-later-trunk-landed.test.mjs` asserting the explanation and `awaitingLaterBuild`. The walk test asserts the carried `unavailable`. A journey in `intent-ci-comparison-cancelled-landing-gaps.spec.ts` (a proofless later build, then a running one). |
| The other walk outcomes keep their wording | Slice 1 | The existing `intent-ci-comparison-cancelled-landing*.spec.ts` journeys and module tests stay green. |

Local gates: `npm run lint`, `npm run --silent typecheck:dashboard`. Module
tests through `bash scripts/test.sh <paths>` with Homebrew Bash first on PATH.
Focused Playwright with
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES`, under
the maintained macOS sleep guard
([machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos)):
`caffeinate -s -i` on observed AC power, or the lid-open `caffeinate -i`
procedure on battery with sleep-log inspection.

Failure policy: [Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests)
applies as written.

## Current decisions

- Carry `unavailable` on the running stop, and reuse `laterBuildUnavailableLine`
  for the reason before the running sentence. No new state.

## Execution context

- Story Branch Mode, execution checkout
  `/Users/terryyin/git/open-dough/.worktrees/explain-a-running-later-build-after-a-proofless`
  on `codex/explain-a-running-later-build-after-a-proofless`. Default checkout
  `/Users/terryyin/git/open-dough`; authorized trunk `origin/main`.
- Publisher `dashboard-territory.local-open-dough`, agent `ivan-chan`.
  Starting revision `ebaee60713325ea4b0852ebc92afda0707d5c9f3`; accepted Take on
  trunk and initial story branch candidate `3d658e9199b15706f03fd885b4857fbd55de0223`.
  The claim's trunk CI is unobserved.
- Codex observer for `terryyin/open-dough`, story branch above, GitHub Actions
  `ci.yml` (CI). Coordinator `codex-2d84a6c9-9aab-4971-9d6c-3a2a7f76e753`,
  cell `g43:11`, session `90429`, directory `/tmp/dough-ci-501/watch-D9sE3d`,
  PID `50391`.
- On AC power, run the two cancelled-landing Playwright files under the sleep
  guard with at most two workers. The local Mac had 16 logical CPUs, load
  average 3.50 and 54% free memory before dispatch. No competing test suite
  was visible. The slice implementer owns the command through its terminal
  result and reassesses on contention or failure.

## Ordered slices

### 1. Name the proofless later build when the walk stops at a running build
Type: Behavior
Status: done
Proof: As the proof table above.

Behavior:

- A cancelled landing whose next later trunk build passed without a CI proof
  summary, and whose following build is still running, gets a Landed
  explanation. It says the nearest later build published no CI proof
  summary and that a later trunk build is still running. It does not say no
  later trunk build has finished yet. There are no figures, and a re-read
  walks again.

Accepted proof:

- `env PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh tests/support/dashboard-later-trunk-build.test.mjs tests/support/dashboard-later-trunk-landed.test.mjs`
  passed 6 tests. The walk retains the earlier revision and `expired` reason
  and stops listing at the running build. The Landed slot names both builds,
  carries `awaitingLaterBuild`, and is ineligible for remembering.
- `caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npm run test:dashboard -- dashboard/tests/intent/intent-ci-comparison-cancelled-landing.spec.ts dashboard/tests/intent/intent-ci-comparison-cancelled-landing-gaps.spec.ts`
  passed 8 Chromium journeys. The new cancelled-merge journey observes the
  combined explanation and two blank timing cells, then reopens the same Done
  story after the running build finishes and reads its usable 7-minute proof.
  The walk, slot, and browser regressions failed on the original production
  at the missing reason or inaccurate explanation before passing with the fix.
- The consumer trace follows `laterTrunkCancelledSlot` through
  `lookupResultBuild`, `performDoneComparison`, `asComparisonSlot`,
  `performIntentCiComparisonRead`, and `isImmutableCiComparisonAnswer` into
  the rendered Landed explanation and the real re-read. The same journeys
  exercise the shared wording, slot model and fixtures. The exact failed
  landing journey shares setup only. The enduring wording summary belongs in
  `docs/dashboard-development-intent.md` at wrap-up.
- Independent refactor review found no edits necessary and confirmed that
  the accepted observations still apply, including the disposable derived
  cache behavior in ADR 0008. `git diff --check` and dashboard typecheck passed.
