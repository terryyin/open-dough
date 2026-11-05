# Compare a story's CI and entry timing changes

**Identity:** SEED-244#compare-story-ci-timing-changes
**Source:** [selected story](../../seeds/SEED-244-story-ci-timing-changes.md#compare-story-ci-timing-changes)
**Prepared:** 2026-11-05. This is preparation only; execution needs its own instruction.

## Goal and boundaries

A developer who selects a story sees, on Intent's CI status homepage, how CI
wall time and each entry's cumulative test execution time changed. The
baseline is the story's pre-story build. Against it the page shows the final
branch build and the landed build, each identified, with honest gaps. The
source owns scope, examples and deferred promises; this plan organizes their
execution.

Included:

- resolving the story's comparison endpoints from published history;
- looking up the build for a revision, including the measured-ancestor rule;
- a new authenticated read of those endpoints;
- the homepage comparison, with CI wall time and the entry rows of SEED-243's
  homepage table;
- whole-second comparison formatting;
- a provisional comparison for a Taken story.

Excluded:

- a variance band;
- stored timing copies;
- folder and file differences (SEED-245);
- Review changes and card surfaces;
- ciAdapter contract changes.

Naturally supported inputs need no artificial rejection.

**Failure policy:** [AGENTS.md — Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests)
applies as written to this plan, its execution, delegation, verification and
repair handoffs.

**Local gate:** after slice-local cleanup and refactoring, run:

- the slice's proof;
- `npm run lint`;
- `npm run typecheck:dashboard`.

Use `bash scripts/test.sh <paths>` for named repository checks. For browser
proof, use `npm run test:dashboard -- <specs> --workers=2`, with Homebrew
Bash 5 first on PATH and `env -u NO_COLOR -u FORCE_COLOR` for direct
Playwright runs. A fresh worktree needs `npm ci` and the native setup first.

The homepage is a shared surface with consumers elsewhere. After each slice,
also run all `dashboard/tests/intent-ci-*.spec.ts`, `intent-ci-proof*.spec.ts`
and `story-review-completed*.spec.ts`, including their boundary variants. The
consumer table below explains why. CI runs a full repository suite, but that
alone does not make it a local gate.

For long runs, follow the maintained
[macOS sleep guard and power condition](../../../tests/local-test-resources.md#machine-sleep-on-macos):

- start fully awake;
- on AC power, use `caffeinate -s -i`;
- on battery, plug in, or keep the lid open under `caffeinate -i` and
  inspect the sleep log afterwards.

Execution owns the published CI result through its applicable final result.

## Existing solutions and architecture

- **Endpoints come from published story evidence.**
  `dashboard/server/storyReviewPublished.ts` already finds a done story's
  completion revision from its done record's first-parent history. It
  recovers or validates the execution agent. Through `storyPublishedEvidence.ts`
  it finds the claim commits, the story's commits and the owning merges. The
  newest owning merge's branch side is the final branch revision, which is not
  always the completion. In addition,
  `storyCompletedCommits.ts` takes the claims' octopus base. Extract the
  shared endpoint facts (completion, claims, owning landing merge, recorded
  `mode`) once, so Review changes and this comparison use one walk and one
  set of unavailable explanations. Do not add a second history walk.
- **Builds come from one nearest-result rule.** `dashboard/server/baseCiNearest.ts`
  applies a newest-run-per-revision rule and `laterWithoutResult` along a
  branch's listing. Generalize that rule rather than copying it:
  - walk a revision's first-parent ancestors;
  - look up runs with `actions/workflows/<workflow>/runs?head_sha=` through
    `ci-github-actions.mjs` requests;
  - read each attempt's own times from `runs/{id}/attempts/{n}`;
  - stop at the story-start bound for result endpoints, and at a bounded
    walk for the baseline.

  Keep the live branch judgment's behavior unchanged. An adapter project
  uses only what its existing discovery lists, and explains the rest.
- **Proofs come through the existing proof read.** `intent=ci-proof` with
  `ciProofArtifact.ts` or `ciAdapterProof.ts` already reads a historical
  attempt by run, attempt and full revision. It validates the revision and
  remembers immutable summaries. Entry figures come from those reads. They
  are not copied into the comparison answer.
- **A new read and its homepage presentation.**
  - Add `intent=ci-comparison` for one story identity to the authenticated read
    boundary. Its answer has three endpoint slots: baseline, branch and landed.
    Each slot holds one of: a build identity with its attempt times and how it
    was selected (exact or ancestor, with its later-without-build count); not
    applicable; not yet landed; running; none; or unavailable with the reason.
  - Remember a done story's answer once all three endpoints are completed or
    final gaps. Nothing is polled.
  - In the browser, `intentCiTarget.ts`'s done-story gap becomes a comparison
    target. A Taken story keeps its `JudgedBranch` status and adds the
    provisional comparison.
  - Comparison durations use whole seconds through `ciProofWording.ts`.
    Other homepage formatting is unchanged.
- **SEED-245 reuses the endpoints.** Name the concept around the story's CI
  comparison, not the homepage, so that SEED-245 can reuse the same endpoints
  and proof reads. Build no folder or file machinery now.
- **Applicable decisions.**
  - [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
    requires a rebuildable derived view and keeps the Selected story separate
    from browsing. It treats missing, outdated and conflicting evidence as gaps,
    never as results.
  - [ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md) keeps
    observed CI results distinct from procedures.
  - Neither conflicts with this plan.

## Decisive premises and retained observations

Observed on 2026-11-05 in this owned preparation workspace at
`8d7e3b6529cc74a2bd0ad800610b8a0dd09fce15`, Node `v24.21.0`. The reads were
unpaid and against the real `terryyin/open-dough` repository. No product
edits were made.

| Premise and consuming operation | Form/profile and observed result | Remainder |
| --- | --- | --- |
| Published history recovers a done Story Branch story's claim and its newest owning landing merge; slice 1 | `node <tmp>/claims.mts <workspace>` imported the actual `publishedStoryEvidence` (`dashboard/server/storyPublishedEvidence.ts`). For SEED-242 at completion `9cce0324662a64d642010816fadbf5a1c375e5f3`, with recorded agent `juacompe-chan`, it returned claim `d85b790e04258e25f83f12026dc6ac7298c81478`, 4 commits and owning merge `9cce03246…`, which is the completion; its second parent `1cbd59f6d` has run 42053255522. For SEED-236 at completion `a166534a8`, with agent `steven-chan`, it returned claim `ea1683e03`, 12 commits and owning merge `4a8129838`, an earlier landing; the completion is a single-parent commit. That merge's branch side `cec7c2f43` has no run, and `9e8075f07`, one first-parent revision back, has run 41963671071 `success`. Of the 40 newest done records, 5 completions are single-parent. Each claim profile records `mode` and `branch`. | Trunk Mode endpoints use the same walk. Only one Trunk Mode claim exists in history; slice 1's fixture owns the Trunk Mode proof. |
| Claim commits have no build, so the baseline needs the ancestor rule; slice 1 | `ci.yml` has `paths-ignore` for `.planning/**` and `docs/**`. `readGitHubActions(["api","repos/terryyin/open-dough/actions/workflows/ci.yml/runs?head_sha=<sha>&per_page=10"])` through the actual `ci-github-actions.mjs` answered 0 runs for `ffb9e800d` (the claim's parent) and run 42037678817, attempt 1, `completed/success` on `main`, for `d1e1ddff6`. That revision is 4 first-parent revisions back. The revisions between had no run; others nearby were cancelled or failed. | None |
| Attempt times are readable for a non-latest attempt; slice 1 | The same requests read `runs/42037678817/attempts/1`: `2026-11-05T13:39:19Z` → `13:44:00Z`. Rerun 41976448705 answered attempt 1 `cancelled` and attempt 2 `success`, with separate times, and listed `ci-proof-summary-attempt-1` and `ci-proof-summary-attempt-2`. | None |
| The existing proof read accepts a historical attempt; slice 2 | `node <tmp>/proof.mts` called the actual `readCiProofArtifact` for run 42037678817, attempt 1. With the short revision it answered `unavailable mismatched`. With the full revision `d1e1ddff6c795e4a5c2b0dfac6b7b9b320f890d1` it answered `summary`, with `dashboard/tests:8083462 tests:788000 src/skills:917900` ms. Endpoints must therefore carry full revisions. | None |
| Retention and precision bound what examples 6 and 2 can show; slices 1 and 2 | Summary retention is 30 days (`.github/actions/ci-proof-summary/action.yml`). Listed artifacts expire on 2026-12-05, and the first summary artifact dates from 2026-11-04. Entry `durationMs` is absent in summaries made before about 2026-11-05 13:00Z. A run from 2026-09-06 is still listed with its times. Durations are in milliseconds and run times in whole seconds. | None; these are honest-gap inputs, not blockers. |
| The test GitHub stand-in can answer the new routes; slices 1 to 3 | `dashboard/tests/support/fakeGitHub.ts` passes every `gh api` argv to a per-test `RepositoryAnswerer`. Its existing CI helpers (`intentCiStoryRecords.ts`, `intentCiStatusPage.ts`) answer run listings, artifacts and archives, and `support/completedPublishedStory.ts` publishes a done story in the origin. | The combined done-story-plus-CI fixture is new slice-1 test work, not an existing capability. |

## Outside-in proof and consumers

| Source promise / examples | Owning slice and observation |
| --- | --- |
| Done story wall-time comparison with named builds (1, 3, 4, 7, 8) | Slice 1: a new done-story journey publishes a completed Story Branch story through `completedPublishedStory`. Its baseline revision is preceded only by planning commits, and its CI fake has 3:00 / 3:20 / 4:00 attempts. Select the story and open Intent. The homepage names the three builds, marks the baseline as an ancestor with its count, and shows wall time `+20 s` and `+1 min` with their values. Advance trunk with a newer build and delete the branch: the figures do not change. A variant lands the story's code in an earlier merge whose branch side has no build, then completes through a later direct trunk commit, as SEED-236 did (example 8). Branch uses the ancestor build on the merge's branch side, and Landed uses the completion build. A Trunk Mode variant shows Branch as not applicable and Landed as an ancestor build. |
| Build selection and gaps for wall time (5, part of 6) | Slice 1: a running landed attempt shows Landed as running, beside the branch comparison. A cancelled newest attempt falls back to the newest completed attempt of that run. A failed endpoint is labelled as failed. A missing build within the story bound shows its explanation, never zero or a later trunk build. An unrecoverable history shows the existing published-review explanation. |
| Entry rows, signs, added and removed entries, expiry and missing durations (2, 5, 6) | Slice 2: three summaries through the real artifact read. One entry goes 4:00 → 4:30 → 5:00 (`+30 s`, `+1 min`). A faster entry shows a negative difference. An added entry has no baseline difference. Expired proof shows wall time with an explained entry gap. A summary without durations, and a part with no duration, leave totals explained or partial and never zero. Rows share SEED-243's homepage table and keep its counts and completeness columns. |
| Taken story provisional result (9) | Slice 3: a Taken Story Branch story with a completed branch build shows a comparison labelled provisional, and Landed says the story has not landed yet. A new branch head re-reads through the existing judged-branch triggers. A Taken Trunk Mode story shows its provisional trunk result. |
| Observed, not attributed; whole-second precision | Slices 1 and 2 assert the wording that frames each difference as an observation between single builds. They also assert that two values differing by under a minute are distinct. |

Before accepting each change, run the installed consumer-trace command
against its diff. Give each consumer a disposition: run, reused, or excluded
with the reason the effect cannot reach it. Carry these known effects:

| Consumer/effect | Required treatment |
| --- | --- |
| `intent-ci-status-story-gaps.spec.ts`, `intentCiTarget.ts` gap wording for done stories | A done story no longer shows its no-branch gap. Migrate those assertions to the comparison, and keep the gaps for unknown, conflicting and unsafe branches. |
| `intent-ci-status*.spec.ts`, `intent-ci-proof*.spec.ts`, wall-time and execution-time specs | With no story selected, and for a Taken story's live judgment, the homepage and its whole-minute formatting stay unchanged. |
| `story-review-completed*.spec.ts`, `boundary/story-review-completed-gaps.spec.ts` | Extracting the shared endpoint walk keeps Review changes' files, explanations and fixed completion intact. |
| `baseCiNearest.ts` consumers (launch base CI, Intent judgment) | Generalizing the nearest rule keeps their existing branch-listing behavior and request counts. Rerun their focused specs. |
| Authenticated read boundary refusals | The new `intent=ci-comparison` read refuses malformed identities before any `gh` or Git call, as sibling reads do. |

## Slices

### 1. Compare a selected done story's CI wall time with its pre-story build
Type: Behavior
Status: planned
Proof: the new done-story comparison journey, with its Trunk Mode, running,
cancelled, failed and missing-build variants; the consumer specs above; the
local gate.

**Behavior:** a done story is selected → open Intent → the homepage names
its baseline, branch and landed builds, each with its selection rule, and
shows each CI wall time with signed whole-second differences. Branch is not
applicable for Trunk Mode. Every unavailable endpoint gives its explanation.

Extract the shared published-story endpoint facts from `storyReviewPublished.ts`.
Generalize the nearest-result rule to look up builds by revision with the
story-start bound. Add `intent=ci-comparison` with refusal, the client reader
and immutable remembering. Then turn the done-story target into a comparison
target. Update the maintained Intent and CI-status documentation for the
homepage comparison.

**Safe stop:** done stories have traceable wall-time comparisons, and their
entry rows state that entry comparison is not yet shown. No figure is
invented.

### 2. Compare each entry's test execution time across the same builds
Type: Behavior
Status: planned
Proof: the slice-1 journey extended with entry summaries through the real
artifact read, plus the expiry, missing-duration, partial and
added-or-removed cases; the CI proof consumer specs; the local gate.

**Behavior:** a done story with retained summaries is selected → its
homepage table rows show each entry's baseline, branch and landed execution
time with signed differences. Added and removed entries are marked as such.
Expired, absent and partial timing give explanations instead of numbers.

Read each endpoint's summary through `intent=ci-proof` with its full
revision. Match entries by path. Place the comparison cells in SEED-243's
homepage entry table. Keep counts and completeness readable for the landed
build, or for the branch build when no landed build exists. A late answer for
another story or attempt must never render.

**Safe stop:** the story's done-story outcome is complete.

### 3. Show a Taken story's provisional comparison
Type: Behavior
Status: planned
Proof: the Taken Story Branch and Trunk Mode journeys; the homepage, story
and freshness consumer specs; the local gate.

**Behavior:** a Taken story is selected → the homepage keeps its live CI
status and adds a comparison against the same pre-story baseline. The latest
completed branch build, or trunk build for Trunk Mode, is labelled
provisional, and Landed says the story has not landed yet. A new branch head
re-reads it.

Resolve a Taken story's endpoints from its published claim and live profile
through the same read. Do not remember provisional answers past a head
change.

**Safe stop:** the story is complete.

## Current decisions and readiness review

- **Timing decisions are in the source.** The measured-ancestor rule, build
  selection, the story-start bound for result endpoints, whole-second
  comparison precision and the observed-not-attributed framing are all
  recorded there.
- **No decision waits on a person.** No pre-Take human decision, paid
  observation or native host run is required. This preparation does not
  select an execution mode, Take the story, or start it.
- **Assumed order.** SEED-243 is Taken and executing. Its slice 1 introduces
  the homepage entry table that this plan's slice 2 fills. Shared files alone
  establish no blocking dependency, and slice 1 here does not need that
  table. If SEED-243 has not landed when slice 2 begins, reconcile with
  SEED-243's published or in-flight table under the execution conflict rules.
  Do not build a second table.

The common model is one story's comparison endpoints, each a build identity
with its selection rule. CI wall time, and entry figures read from each
endpoint's proof, are values of those endpoints. The done and Taken states
differ only in how the endpoints are resolved and labelled, not in the
comparison rule. No speculative framework is planned, and there is no
separate per-entry lookup rule or stored copy.

Slice-plan refinement was not needed. Each slice owns one observable outcome
and one proof loop:

- slice 1 needs the endpoint resolution and the read to show anything at all;
- slice 2 adds proof-backed entry figures to those endpoints;
- slice 3 adds a differently sourced selected-story state.

No numeric slice target or hard limit was supplied. Slice 1 is the largest,
because it carries the shared extraction and the generalized rule; both are
needed for its first observable result. This review found no remaining
slice-specific concern.
