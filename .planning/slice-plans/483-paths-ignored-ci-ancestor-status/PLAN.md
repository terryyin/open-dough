# Treat paths-ignored CI as the first non-ignored ancestor

**Identity:** SEED-246#paths-ignored-ci-ancestor-status
**Source:** [selected story](../../seeds/SEED-246-paths-ignored-ci-ancestor-status.md#paths-ignored-ci-ancestor-status)
**Source review:** [source-review.md](source-review.md)
**Prepared:** 2026-11-06. This is preparation only; execution needs its own instruction.

## Story obligations

### G1. Adapter protocol change deferred
Reported: slice 1 — "Changing the adapter protocol is a deferred promise."
Story clause: "changing the adapter protocol is a deferred promise"
Disposition: excluded "changing the adapter protocol is a deferred promise"
Commitment: 19

## Goal and boundaries

A coordinator waiting on CI for an ignored-only revision gets the status of
its nearest non-ignored ancestor, even when that ancestor's run is on
another branch such as `main`. The wait then completes as an ordinary CI
build. The source owns scope, examples and deferred promises; this plan
organizes their execution.

Included: GitHub Actions default observation finds ancestor candidates among
the selected workflow's `push` runs on every branch, and also on the
observed branch as today.

Excluded: the custom CI adapter protocol, exact `head_sha` lookups past the
listing window, integrated-state candidate scope, `pull_request` events, a
project's `paths-ignore` policy, and agent guidance. `ci-monitor.md`
already says that coverage follows ignored-only revisions to their basis.

**Failure policy:** [AGENTS.md — Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests)
applies as written to this plan, its execution, delegation, verification and
repair handoffs.

**Local gate:** after slice-local cleanup and refactoring, run:

- the slice's proof;
- `npm run lint`.

Run named checks with `bash scripts/test.sh <paths>`, with Homebrew Bash 5
first on PATH. The system Bash 3.2 refuses to run them. This change touches
the shared CI observation path, so after the slice also run
`bash scripts/test.sh src/skills/dough-execute-plan/scripts/ci-*.test.mjs`.
Its observer, coverage, await and integrated-state tests all consume
`createGitHubAcquisition`'s candidates.

For long runs, follow the maintained
[macOS sleep guard and power condition](../../../tests/local-test-resources.md#machine-sleep-on-macos):

- start fully awake;
- on AC power, use `caffeinate -s -i`;
- on battery, plug in, or keep the lid open under `caffeinate -i` and
  inspect the sleep log afterwards.

Execution owns the published CI result through its applicable final result.

## Existing solutions and architecture

PFE: classification (`ci-path-applicability.mjs`,
`classifyUndiscoveredRevision`), `not_required` basis resolution
(`findAncestorRun`), failure delivery of ancestor runs, and completion's
`effectiveRevisionState` already implement "inherit the nearest applicable
ancestor". Reuse all of them unchanged. The only gap is candidate discovery:
`discoverApplicabilityCandidateRuns` in `ci-runs.mjs` lists, and
`matchingCiRuns` filters, the observed branch only. `ci-reuse-github.mjs`
does exact-SHA lookups for the reuse gate, but adopting that here would cost
a request per ignored-only commit on every poll.

No Accepted ADR governs CI observation. No North Star topic is warranted.

## Decisive premises and retained observations

Observed on 2026-11-06 in this owned preparation workspace at `0fc3d64470850bd7562f200d0cf7229fd87f2676`, with
Node 24.21.0 from `.node-version`, using unpaid reads of the real
`terryyin/open-dough` repository. No product edits were made.

| Premise and consuming operation | Form/profile and observed result | Remainder |
| --- | --- | --- |
| Branch-scoped discovery is the cause; slice 1 | A job-temp script imported the shipped `createGitHubAcquisition` and `classifyUndiscoveredRevision` and ran them for `0fc3d6447` (this branch; only `.planning/**` since `main`). Branch `claude/treat-paths-ignored-ci-as-the-first-non-ignored`: 0 candidates → `indeterminate / no-ancestor-basis`. Branch `main`: 100 candidates → `not_required`, basis `7cde52861`, whose run 42144006924 succeeded. | None |
| Completion and failure delivery already honour an inherited basis; slice 1 | `bash scripts/test.sh` of `ci-mailbox-await.test.mjs` (inherited success and failure verdicts) and `ci-integrated-state-judge.test.mjs` passed with exit 0, run with Homebrew Bash 5. | None |
| The test GitHub fake can answer by branch; slice 1's proof | `github-actions-api-test-fixtures.mjs:27` exposes the listing's `branch` query parameter. `ci-revision-coverage-not-required.test.mjs` passed with exit 0 in this workspace. | None |
| An all-branch listing reaches recent trunk ancestors; slice 1 | `gh api …/workflows/ci.yml/runs?event=push&per_page=100` returned 100 runs covering about 22 hours, 28 of them on `main`. With `branch=main`, the 100 runs covered about 4.5 days. | Older bases stay `undiscovered`, which is the story's scope limit. |

## Outside-in proof

| Source example | Slice 1 observation |
| --- | --- |
| 1. ignored-only story branch inherits trunk success | A new case in the `ci-revision-coverage-not-required` family uses a real temporary Git repository: ancestor A on `main` changes `src/`, and a story branch adds ignored-only B. The GitHub fake answers the story-branch listing with no runs and the all-branch listing with A's successful `main` run. The real mailbox worker records B as `not_required` with basis A and `basis.state: success`, and `awaitRevision` returns `success`. The case fails with today's branch-only discovery. |
| 2. pending, failed or cancelled trunk ancestor | Variants of the same case: pending A keeps B waiting with fresh progress; failed A delivers one `CI_FAILED` and B's wait returns `failure`; cancelled A gives `basis.state: incomplete`, even with an older green `main` run in the listing. |
| 3. non-ignored revision | The same fixture with a `src/` change in B leaves B `undiscovered` until its own exact run appears. |
| 4. nearer own-branch run wins | Both listings answer. The story branch's own run of a nearer non-ignored ancestor is the basis, not `main`'s. |
| Real observation | After the slice, rerun this plan's probe script against `terryyin/open-dough` with the changed `discoverAncestorCandidates` for this branch. It should give `not_required` from the branch's own observer, with no `main` override. |

Existing ignored-only and integrated-state tests stay green, which shows that
integrated-state candidates still filter by branch.

## Slices

### 1. Find ignored-only revisions' ancestor runs on any branch
Type: Behavior
Status: done
Proof: accepted 2026-11-06 —
`PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh`
`ci-revision-coverage-not-required-cross-branch.test.mjs`,
`-inheritance.test.mjs`, `-required.test.mjs` (E1–E4; exit 0);
`ci-github-actions-observed-run.test.mjs` (omit-branch listing); earlier
`ci-*.test.mjs` suite green; real-repo probe on
`cursor/treat-paths-ignored-ci-as-the-first-non-ignored` at claim tip
→ `not_required` basis `7cde52861` on `main`. Local gate remaining:
`npm run lint` at delivery.

**Learnings:** `listRuns` query-parameter order keeps `branch` first when
present (acquisition/journey route assertions). Refactor split the
cross-branch proof under the 250-line file-size gate and composed
`matchingCiRuns` on shared push matching.

**Behavior:** an ignored-only revision whose nearest non-ignored ancestor
ran only on another branch is registered → its coverage records
`not_required` with that run as basis and inherits its state. Completion
and failure delivery follow as they do for a same-branch basis.

Let `listRuns` omit `branch`. In `discoverApplicabilityCandidateRuns`,
add the selected workflow's `push` runs from all branches to the
observed branch's runs, de-duplicated by run and attempt. Do not apply
`matchingCiRuns`' branch filter to those runs. Keep the GitHub request
count bounded: at most one extra listing, made only in the existing lazy
per-poll broadened lookup. Leave `acquireRuns`, the integrated-state
filter and the custom adapter unchanged. Update the comments on
`discoverApplicabilityCandidateRuns` and `createGitHubAcquisition` that
describe branch history.

**Safe stop:** the story's outcome is delivered.

## Current decisions and readiness review

- **Use an all-branch listing, not a trunk-only one.** The observer does not
  know the target branch, and supplying it would need new launch plumbing.
  The all-branch listing also covers stacked story branches. Its narrower
  window (about 22 hours here) is the recorded scope limit.
- **No decision waits on a person.** No paid observation or native host run
  is needed. This preparation does not choose an execution mode, Take the
  story, or start it.

Slice-plan refinement was not needed: one slice owns one observable outcome
and one proof loop. No numeric slice target was supplied. This review found
no remaining slice-specific concern.
