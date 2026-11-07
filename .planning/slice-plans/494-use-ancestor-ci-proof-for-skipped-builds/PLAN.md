# Use the nearest ancestor's CI proof for skipped builds

**Identity:** SEED-254#use-ancestor-ci-proof-for-skipped-builds
**Source:** [Use the nearest ancestor's CI proof for skipped builds](../../seeds/SEED-254-use-ancestor-ci-proof-for-skipped-builds.md#use-ancestor-ci-proof-for-skipped-builds)

## Goal and scope

With a done or Taken story selected in Intent's **CI status**, each CI
timing comparison endpoint (Baseline, Branch, Landed, or the provisional
tip) shows its requested revision's own status apart from the build whose
proof it uses. A confirmed skip lets the endpoint use an earlier build's
proof. The seed's Scope, Deferred promises and Examples are the source, and
this plan adds no promise.

Included:

- **Skipped**, **Cancelled** and **No build** (with the reason it could not
  be confirmed) at the requested revision.
- Landed's equivalent-build proof for a confirmed skip.
- The Baseline and Branch walk past builds without usable proof.
- Request documentation and Intent product documentation.

Excluded:

- Proof for cancelled landings from a later build
  ([its own story](../../seeds/SEED-254-use-ancestor-ci-proof-for-skipped-builds.md#use-later-ci-proof-for-cancelled-landings)).
- A breakdown of the "revisions passed over" count.
- Adapter projects (SEED-257).
- The live CI status judgment.
- The before-and-after presentation (SEED-255).

## Existing solution and decisions

- PFE, endpoint selection. `dashboard/server/baseCiRevisionLookup.ts` and
  `baseCiRevisionNearest.ts` already walk first-parent revisions through
  local Git and per-revision `head_sha` run listings (via
  `baseCiGithubRevisionLookup.ts`). Baseline and Branch already fall back
  to a measured ancestor past cancelled and unbuilt revisions. Landed is
  exact-only: `intentCiComparisonResolve.ts` passes `exactOnly`, and the
  rule is documented in `docs/dashboard-development-intent.md`. Change
  these files rather than adding a parallel lookup.
- PFE, skip confirmation. `src/skills/dough-execute-plan/scripts/ci-path-applicability.mjs`
  (with `ci-workflow-path-policy.mjs`) already holds the conservative rule:
  - It reads `paths-ignore` from the workflow at the requested revision.
  - It diffs `--name-status -M` from the nearest ancestor build.
  - It returns `not_required`, `required` or `indeterminate` with a reason.

  The dashboard already imports these execution scripts
  (`baseCiJudgment.ts`). The classifier itself runs Git synchronously with
  `execFileSync`. Slice 1 therefore exports its pure diff classification
  and has the dashboard feed it from the async `runGit` with the same
  arguments, so both callers share one rule.
- PFE, proof read. `dashboard/server/ciProofArtifact.ts`
  (`readCiProofArtifact`) answers summary, `none`, `expired`, `unreadable`,
  `invalid` or `mismatched`. It remembers a valid summary per repository,
  run and attempt for the process. Slices 2 and 3 call it during endpoint
  selection, and the page's later read of the chosen build
  (`useIntentCiComparisonEntries.ts`) asks GitHub nothing again.
- Workflow file: `ciWorkflow` names a filename (default `ci.yml`), read at
  `.github/workflows/<name>`. A numeric workflow ID names no file, so a
  skip cannot be confirmed and the endpoint says why.
- [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md):
  the view is derived from observed evidence. It names the requested
  revision and its status beside the observed source build, and never
  replaces one with the other.
- No North Star topic is needed. The rule stays inside the existing
  comparison lookup.

## Premises and baseline

| Premise | Consuming observation | Result and remainder |
| --- | --- | --- |
| A push that `paths-ignore` excludes leaves no run and no check runs, so a skip appears only as an absent run | `gh api repos/{owner}/{repo}/actions/runs?head_sha=<sha>` and `.../commits/<sha>/check-runs` for `cb4ed7eda`, `4d2adeff6` and `07f54554c` (`.planning/`-only) and `83518b9e3` (code), 2026-11-07. This is the same `head_sha` route the comparison uses (`baseCiGithubRevisionLookup.ts`). | The planning-only commits had 0 runs and 0 check runs. `83518b9e3` had a CI push run with conclusion success and 17 check runs. |
| The shared classifier accepts this repository's `ci.yml` and separates ignored-only from code changes | `node` importing `classifyRevisionApplicability` from `src/skills/dough-execute-plan/scripts/ci-path-applicability.mjs` (job temp script) with `event: "push"`, run in this worktree at `bc38bb87f`. `.github/` and these scripts are unchanged up to `200f5104a`. | `cb4ed7eda` and `4d2adeff6` against `83518b9e3` returned `not_required`. Code merges `199a61b8d` and `c60d7e720` against their first parents returned `indeterminate` (`mixed-paths`). Proxy: slice 1 feeds the same pure functions from `runGit` with identical `git show <sha>:<path>` and `git diff --name-status -M` arguments, so only the process boundary differs, which cannot change the result. |
| How often each case occurs on this trunk | The same `head_sha` runs route for the 60 latest first-parent merges on `origin/main`, plus `git diff --name-only <merge>^1 <merge>` filtered by the ignore paths, 2026-11-07 | 1 ignored-only merge with no run, 9 cancelled, 1 code merge with no run (`199a61b8d`), 5 failed, 44 passed. |
| Comparison fixtures commit no workflow file, so a fixture today confirms no skip | `grep -rn "github/workflows"` over `dashboard/tests` at `200f5104a` | No fixture writes one. Each slice's fixture commits `.github/workflows/ci.yml` with `paths-ignore` for `.planning/**` and `docs/**`. Existing fixtures without it get "No build" with an unreadable-workflow reason, so slice 1 updates the wording they assert. |
| The fixture can serve a build with no proof, and the server remembers only valid summaries | `answerComparisonProofRoute` in `tests/support/storyCiComparisonEntryProofs.ts` answers an empty artifact listing for a run with no served proof. `ciProofArtifact.ts` lines 129–191 remember and return a valid summary by repository, run and attempt. Both read at `200f5104a`. | Settled for the fixture shape and the cache key. Execution observes the page's second read asking nothing (slice 3's request assertion). |
| The comparison specs pass at baseline | Hosted CI run 42348289912 attempt 1 at `83518b9e3`, conclusion success; it runs the whole dashboard suite. `git diff 83518b9e3..HEAD -- dashboard src/skills/dough-execute-plan/scripts` is empty at `200f5104a`. | Settled as a retained observation. Plan 493 also recorded a local exit 0 for three comparison specs at `588f8b7c8`. |

## Outside-in proof and ownership

| Promise (seed) | Owner | Proof |
| --- | --- | --- |
| Requested-revision status (Skipped, Cancelled, No build with reason) shown apart from the source build, on every endpoint | Slice 1 | New `dashboard/tests/intent/intent-ci-comparison-skipped.spec.ts` (status cases). The `intent-ci-comparison*` specs whose wording changes. Module tests of status classification. |
| Confirmed skip only through the provider's `skipped` or the path rule. Unreadable or unsupported policy, a numeric workflow, a mixed or non-ignored delete or rename, and no ancestor build leave the reason unknown. | Slice 1 | Module tests through the exported classification and the dashboard's async adapter, one per reason |
| Landed: a confirmed skip uses its equivalent build's proof. An equivalent build without usable proof is explained, with no older build. Cancelled or unexplained landings keep the exact result. | Slice 2 | `intent-ci-comparison-skipped.spec.ts` (docs-only landing, landing whose equivalent build has no proof, code landing with no run). `intent-ci-comparison-landing-gaps.spec.ts` stays green. |
| Baseline, Branch (and Trunk Mode Landed or provisional) walk past builds without usable proof, labelled with source and count. A cancelled revision shows Cancelled and keeps its fallback. Proof at the requested revision stays authoritative. | Slice 3 | `intent-ci-comparison-skipped.spec.ts` (skipped baseline whose parent has no proof, cancelled baseline). `intent-ci-comparison.spec.ts` (exact proof unchanged). The request list asserts the extra artifact listings and no repeated proof read. |
| Request documentation and product documentation | Slices 2 and 3 | `dashboard/GITHUB-REQUESTS.md` names the comparison's per-revision run listings and proof reads. `docs/dashboard-development-intent.md` replaces "no measured-ancestor fallback across that landing" with the equivalent-build rule. |

Local gates, in this order:

1. `npm ci` and `node scripts/setup-native.mjs browser` in this worktree.
2. `npm run lint` and `npm run --silent typecheck:dashboard`.
3. Focused module tests through `bash scripts/test.sh <paths>`, including
   the execution scripts' `ci-path-applicability*.test.mjs` once slice 1
   changes that module.
4. Focused Playwright runs of each slice's named specs with
   `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES`.

Run them under the maintained macOS sleep guard
([machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos)):
`caffeinate -s -i` on observed AC power, or the lid-open `caffeinate -i`
procedure on battery with sleep-log inspection.

Before landing, run every `dashboard/tests/intent/intent-ci-comparison*`
and `intent-summary-story-comparison*` spec once, because the endpoint
wording those journeys read changes.

Failure policy: [Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests)
applies as written.

## Ordered slices

### 1. Name each endpoint's requested-revision status
Type: Behavior
Status: planned
Proof: Module tests of the exported classification (unchanged execution
classifier tests stay green). Module tests of the dashboard status for each
reason. New `intent-ci-comparison-skipped.spec.ts` covers the status cases.
Existing comparison specs are updated where an unbuilt revision's wording
now names its status. Typecheck and lint.

Behavior: The fixture commits `ci.yml` with `paths-ignore`.

- A done story whose start commit is `.planning/`-only with no run → the
  Baseline identity reads **Skipped** at that revision because CI ignores
  every change since its nearest built ancestor `<rev>`. The build it uses
  is still named separately, as today.
- A start commit whose run was cancelled → **Cancelled** at that revision.
- A revision with no run whose diff from the nearest build touches code →
  **No build**, with the reason the absence could not be confirmed (for
  example, "changes CI does not ignore").

Proof selection does not change in this slice. Landed's exact-only
explanations stay. The status comes from the provider's `skipped`
conclusion, or from `classifyPathChanges` (exported from
`ci-path-applicability.mjs` and also used by `classifyRevisionApplicability`)
fed by `runGit`.

### 2. Use the equivalent build's proof for a skipped landing
Type: Behavior
Status: planned
Proof: `intent-ci-comparison-skipped.spec.ts` covers three Landed cases.
`intent-ci-comparison-landing-gaps.spec.ts` and
`intent-ci-comparison-fast-forward.spec.ts` stay green. The
`docs/dashboard-development-intent.md` Landed rule is updated. Typecheck and
lint.

Behavior:

- A Story Branch Mode done story whose landing merge changes only
  `.planning/` relative to its first parent, which has a passing build with
  served proof → Landed reads **Skipped** at the merge and uses the parent's
  run, attempt and proof (entry rows show its figures), labelled as the
  equivalent build.
- The same landing with the parent's build serving no proof → Landed reads
  **Skipped**, says the equivalent build at `<rev>` published no CI proof
  summary, shows no figures and names no older build.
- A code landing merge with no run → **No build** with its reason and no
  figures.
- A cancelled landing keeps today's explanation.

The equivalent build is the nearest first-parent ancestor build of the
landing (a fast-forward tip uses the same rule). Its proof is read through
`readCiProofArtifact`.

### 3. Walk Baseline and Branch past builds without usable proof
Type: Behavior
Status: planned
Proof: `intent-ci-comparison-skipped.spec.ts` covers the skipped baseline
whose parent has no proof and the cancelled baseline. It also asserts the
extra artifact listing for the proofless parent, and that the page's proof
read of the chosen build adds no GitHub request. `intent-ci-comparison.spec.ts`,
`intent-ci-comparison-gaps.spec.ts` and `intent-ci-comparison-taken.spec.ts`
stay green or are updated only for the walk's new count. The
`dashboard/GITHUB-REQUESTS.md` comparison section is added. Typecheck and
lint.

Behavior:

- A done story whose `.planning/`-only start commit's parent has a passing
  build that serves no proof, and whose grandparent serves proof → Baseline
  reads **Skipped** at the start commit and uses the grandparent's run,
  attempt and figures, counting 2 revisions passed over.
- A Baseline revision with a cancelled run reads **Cancelled** and uses its
  nearest ancestor with usable proof.
- A requested revision with its own usable proof keeps it, as exact.

The walk keeps its existing bounds (30 for Baseline, the story-start bound
for Branch, Trunk Mode Landed and the provisional tip) and stops at a
running build as today. When no build in the bound has usable proof, the
endpoint names the nearest build and why its proof is unavailable.

## Refinement review

Refinement was not needed. The three Behavior slices each own one outcome
and proof loop, and they share one rule as it grows:

1. The status at the requested revision.
2. Landed's equivalent build, which consumes the confirmed skip.
3. The proof-usability walk for walking endpoints.

No slice repeats another's domain rule, and the skip rule has one home,
shared with execution.

No remaining slice-specific concern was identified in this review.

## Current decisions

- Landed walks to the equivalent build only, never past a build without
  proof (Terry, 2026-11-07, during refinement).
- Trunk Mode Landed and the provisional tip already walk measured
  ancestors, so they follow slice 3's walking rule rather than slice 2's
  equivalent-build rule.
- SEED-256 (plan 492) and SEED-255 (plan 493) have landed and already
  touch `IntentCiComparison.tsx` and `storyCiComparisonWording.ts`. Rebase
  onto current trunk and keep their wording.
- Execute in Story Branch Mode or Trunk Mode as started. There is no
  trunk-only step.
