# Use a later trunk build's CI proof for cancelled landings

**Identity:** SEED-254#use-later-ci-proof-for-cancelled-landings
**Source:** [Use a later trunk build's CI proof for cancelled landings](../../seeds/SEED-254-use-ancestor-ci-proof-for-skipped-builds.md#use-later-ci-proof-for-cancelled-landings)
**Source review:** [source-review.md](source-review.md)

## Goal and scope

With a done Story Branch Mode story selected in Intent's **CI status**, a
landing whose own push run was cancelled keeps **Cancelled** at the landing
and uses proof from the nearest later trunk build with usable proof, named
with its revision, run, attempt, conclusion and the number of later trunk
revisions it includes. The seed's Scope, Scope limits, Deferred promises and
Examples are the source, and this plan adds no promise.

Included:

- The forward walk on trunk's first-parent history from the landing merge or
  fast-forward tip.
- The Landed label and the explanations when no later proof is in reach.
- Not freezing a Landed answer that may still gain a later build.
- Request documentation and Intent product documentation.

Excluded:

- Timed-out landings, Trunk Mode Landed, Baseline and Branch.
- Unexplained code landings with no run, and which included revisions CI
  ignores (deferred in the seed).
- Adapter projects (SEED-257).

## Existing solution and decisions

- Dependency: this story starts after
  [the nearest-ancestor story](../494-use-ancestor-ci-proof-for-skipped-builds/PLAN.md)
  lands (recorded agreement in the seed). Its slice 1 adds the requested
  revision's status (Cancelled at Landed shown apart from the proof
  source). Its slice 3 adds the proof-usability walk over
  `readCiProofArtifact`. Reuse both as landed; do not add a second status or
  usability rule. Where that plan's landed names differ from the files named
  below, follow the landed code.
- PFE, endpoint selection. `dashboard/server/intentCiComparisonResolve.ts`
  sends Story Branch Landed through `lookupResultBuild` with `exactOnly` and
  a `cancelledExplanation` (`dashboard/server/baseCiRevisionLookup.ts`). The
  cancelled branch there is where the forward walk starts. Per-revision run
  listings come from `githubRevisionLookup().listRunsAt`
  (`baseCiGithubRevisionLookup.ts`), and the newest-attempt rule from
  `newestRunFor` (`baseCiNearest.ts`). The forward walk reuses both.
- Trunk head: `publishedStoryEndpoints` (`storyPublishedEndpoints.ts`)
  already fetches `origin/<source.ref>` and verifies it. The forward chain is
  `git rev-list --first-parent --reverse --ancestry-path <landing>..origin/<ref>`
  through `runGit`, capped at 30 revisions (the existing
  `baselineAncestorLimit`).
- Answer memory: `isImmutableCiComparisonAnswer`
  (`intentCiComparisonAnswers.ts`) freezes every done answer without a
  running slot, so "no later trunk build yet" would stay forever. Slice 2
  marks a Landed slot that stopped at the trunk head or at a running build as
  not final.
- [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md):
  the view names the requested revision and its status beside the observed
  later source build, and never replaces one with the other.
- No North Star topic is needed. The rule stays inside the comparison lookup.

## Premises and baseline

| Premise | Consuming observation | Result and remainder |
| --- | --- | --- |
| Trunk push runs cancel earlier trunk runs, so the run that superseded a landing heads a later trunk push containing it | `.github/workflows/ci.yml` at `2669bafb3`: `concurrency.group` is `${{ github.workflow }}-${{ github.ref }}` for pushes with `cancel-in-progress: true` | Settled. |
| Cancelled landings have a later trunk build within a short forward walk, sometimes behind further cancellations | `gh api repos/{owner}/{repo}/actions/runs?head_sha=<sha>&event=push` (the comparison's `head_sha` route) for the 60 latest first-parent merges of `origin/main`, then forward over `git rev-list --first-parent --reverse --ancestry-path <merge>..origin/main`, 2026-11-07 | 8 cancelled. Nearest completed non-cancelled build: `aeb973a39` +1 success (42348289912); `c60d7e720` +1 failure (42347766843); `3e2596917` +2 success after a cancelled +1; `6e39f0273` +1; `1977a75a9` +2; `6bfb0a576` +4 after a cancelled +2; `306277a2b` +5 after cancelled +1 and +3; `3411e11fa` +3 (41755363191). All within the 30 cap. |
| A failed later build can carry usable proof, and old builds have none | `gh api repos/{owner}/{repo}/actions/runs/<id>/artifacts` for 42347766843, 42348289912 and 41755363191, 2026-11-07 | 42347766843 (failure) and 42348289912 each list `ci-proof-summary-attempt-1`, unexpired. 41755363191 lists none, so it exercises the "published no CI proof summary" path. |
| The existing cancelled-landing journey already has a later trunk build | `dashboard/tests/support/storyCiComparisonEarlierLanding.ts` at `2669bafb3`: `publishCodeLandedBeforeCompletion` commits completion after the landing and `serveEarlierLandingWithLandedOutcome` serves run 304 there, with no proof route | `intent-ci-comparison-landing-gaps.spec.ts`'s cancelled test asserts no "run 304". Under the new rule run 304 is the nearest later build. Slice 1 serves proof for it and rewrites that test into the "next push passed" journey; slice 2 covers it without proof. |
| Comparison specs pass at baseline | Hosted CI run 42348289912 attempt 1 at `83518b9e3`, success, running the whole dashboard suite. `git diff 83518b9e3..2669bafb3 -- dashboard src/skills/dough-execute-plan/scripts` is empty. | Settled as a retained observation. The supplier's landing changes this baseline; slice 1 starts from fetched trunk after it. |

## Outside-in proof and ownership

| Promise (seed) | Owner | Proof |
| --- | --- | --- |
| A cancelled landing keeps Cancelled and uses the nearest later trunk build with usable proof, passing over cancelled, unbuilt and proofless revisions, labelled with revision, run, attempt, conclusion and included later revisions; a failed later build is used; proof at the landing stays authoritative | Slice 1 | New `dashboard/tests/intent/intent-ci-comparison-cancelled-landing.spec.ts` (next push passed, cancelled chain, failed later build, fast-forward tip). Module tests of the forward walk. `intent-ci-comparison-landing-gaps.spec.ts` cancelled test rewritten; its failed test stays green. |
| No later usable proof: Cancelled plus why (no later build yet, still running, nearest later build's proof unavailable), no figures; a waiting answer is not frozen | Slice 2 | `intent-ci-comparison-cancelled-landing.spec.ts` (no proof in reach, newest landing, running later build, then a later build appears and a re-read uses it). Module test of `isImmutableCiComparisonAnswer`. |
| Timed-out landings, Trunk Mode Landed, Baseline and Branch unchanged | Slices 1–2 | `intent-ci-comparison.spec.ts`, `-gaps`, `-fast-forward`, `-taken` stay green. |
| GitHub requests and product documentation | Slice 1 | `dashboard/GITHUB-REQUESTS.md` comparison section adds the forward walk's listings and proof reads. `docs/dashboard-development-intent.md` Landed rule names the later-build rule for cancelled landings. |

Local gates, in this order:

1. `npm ci` and `node scripts/setup-native.mjs browser` in this worktree.
2. `npm run lint` and `npm run --silent typecheck:dashboard`.
3. Focused module tests through `bash scripts/test.sh <paths>`.
4. Focused Playwright runs of each slice's named specs with
   `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES`.

Run them under the maintained macOS sleep guard
([machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos)):
`caffeinate -s -i` on observed AC power, or the lid-open `caffeinate -i`
procedure on battery with sleep-log inspection.

Before landing, run every `dashboard/tests/intent/intent-ci-comparison*`
and `intent-summary-story-comparison*` spec once, because the Landed wording
those journeys read changes.

Failure policy: [Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests)
applies as written.

## Ordered slices

### 1. Use the nearest later trunk build's proof for a cancelled landing
Type: Behavior
Status: done
Proof: New `intent-ci-comparison-cancelled-landing.spec.ts` journeys and the
rewritten cancelled test in `intent-ci-comparison-landing-gaps.spec.ts`.
Module tests of the forward chain and selection. The request list asserts
one run listing per walked revision and one artifact listing per build
checked. `GITHUB-REQUESTS.md` and the Intent doc updated. Typecheck and
lint.

Behavior:

- A Story Branch Mode done story whose landing merge's run is cancelled and
  whose next trunk revision has a passing run with served proof → Landed
  reads **Cancelled** at the merge and uses that run, attempt and figures,
  labelled as a later trunk build including 1 later revision.
- The landing's next two trunk builds are cancelled and the third later
  revision passes with proof → Landed uses it and counts 3 later revisions.
- The nearest later build failed with served proof → Landed uses it,
  labelled failed.
- A fast-forward landing whose story tip's run is cancelled follows the same
  rule.
- A landing with its own usable proof (for example a successful rerun
  attempt) keeps it, as exact.

Accepted proof (on trunk `0b4ba8d1b` plus this slice, after refactor):
`dashboard/server/laterTrunkBuild.ts` (`laterTrunkChain`,
`laterTrunkProofBuild`, `laterTrunkCancelledSlot`) is entered from
`lookupResultBuild`'s cancelled branch only. Selection value `later`, worded
"later trunk build: includes N later trunk revision(s)".
`tests/support/dashboard-later-trunk-build.test.mjs` (5 tests, via
`bash scripts/test.sh` with Homebrew Bash first on PATH) and
`intent-ci-comparison-cancelled-landing.spec.ts` (4 journeys). All 47
`intent-ci-comparison*` and `intent-summary-story-comparison*` specs pass.
Fixture: `serveEarlierLandingWithLandedOutcome(setup, "cancelled", laterTrunk)`
in `dashboard/tests/support/storyCiComparisonLandedOutcome.ts`.

Learnings for slice 2:
- On trunk, a Landed build with proof makes the active pair "Baseline
  compared with Landed"; with no later proof, Landed stays unused with its
  "Landed is not used:" reason. Slice 2's explanations land in that reason
  and in the Landed identity.
- `laterTrunkProofBuild` returns `undefined` for running, head and no proof
  alike. Slice 2 needs it to say which, and to mark the answer not final when
  the walk stopped at the head or at a running build.
- `--reverse` with `--max-count` applies after the limit, so the chain slices
  the first 30 itself.

### 2. Explain a cancelled landing with no later proof in reach
Type: Behavior
Status: planned
Proof: `intent-ci-comparison-cancelled-landing.spec.ts` gap journeys,
including a re-read after the fixture adds a later trunk build. Module test
of `isImmutableCiComparisonAnswer` for a waiting Landed slot. Typecheck and
lint.

Behavior:

- The only later trunk build within the walk serves no proof → Landed reads
  **Cancelled**, names that build and that it published no CI proof summary,
  and shows no figures.
- The landing is the read trunk head → Landed reads **Cancelled** and says
  no later trunk build has finished yet. A later build that is still running
  says so instead.
- After the fixture pushes a later trunk revision with a passing proofed
  run, re-selecting the story uses it: the waiting answer was not
  remembered. An answer whose walk ended at the 30-revision cap is final.

## Refinement review

Refinement was not needed. Slice 1 owns the forward selection rule and its
label; slice 2 owns the gaps and the one memory rule that only matters when
selection finds nothing. Neither repeats the other's rule, and both reuse
the supplier's status and usability rule.

No remaining slice-specific concern was identified in this review.

## Current decisions

- Only cancelled landings walk forward; timed-out landings stay exact
  (seed Scope limits).
- The walk reuses the Baseline bound of 30 revisions and stops at a running
  build and at the read trunk head.
- Execute in Story Branch Mode or Trunk Mode as started. There is no
  trunk-only step.
