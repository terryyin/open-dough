# Select the story completed in an ad hoc session

**Identity:** SEED-291#select-story-completed-in-ad-hoc-session

**Source:** [Refined story](../../seeds/SEED-291-select-story-completed-in-ad-hoc-session.md#select-story-completed-in-ad-hoc-session)

## Goal and scope

A developer returning to a retained completed ad hoc session selects the one
published Done story it demonstrably completed, then uses its historical
Review changes and Intent even after worktree/branch retirement and later
trunk changes. Preserve the current perspective, Side panel, and Ad hoc launch
label. Development reveals the selected Done card; Intent shows the selected
story and available saved coverage. A confirmed missing or ambiguous link
leaves the session standalone and preserves the current story selection.
Unanswered/unavailable evidence remains checking/unknown with existing retry
and supersession behavior.

Recover existing records, including the Pygardon example. A retained session
may outlive the Board's default Done window; reveal its evidenced story without
changing general retention or reading every Done body. No standalone session
review, manual attachment, conversation inference, new launch workflow, or new
review model. No release or native-host launch is part of this story's proof.

## Direction and existing solutions

PFE traced launch creation/publication, lightweight session listings, retained
history, page selection, Board placement, published completion recovery,
Review, and Intent. Reuse these owners:

- `retainedHistory.ts` / `sessionListing.ts` already distinguish overview
  facts from reporting and landing detail. Resolve the selected retained
  session through that history lifecycle; preserve bounded overview reads.
- `workspace-publication-ownership.mjs` owns claim trailers.
  `storyCompletionEndpoints.ts` owns validated published completion/claim
  recovery. The completion-validation portion of `completedCapture` in
  `storyReviewHistorical.ts` already distinguishes a first delivery from a
  completed story: Done absent at base, recovered completion equal to the
  captured result. Expose/reuse that cohesive evidence responsibility as
  needed; do not copy its rules into several ad hoc recognizers.
- `recentlyDoneSelection.ts` owns the row choice and the one page Selected
  story, including checking, unknown, retry and supersession. Extend that
  path; give it an evidenced completed-story association rather than rewriting
  `request.workflow` or `request.identity` through `launchSubject`.
- `recentlyDoneView.ts` owns Done-card placement and reveal with
  `recentlyDoneRange.ts` and `sessionNavigation.ts`. Keep an explicitly
  selected evidenced older Done story available to this path without making
  a general window or bulk-detail-read change. Keep selection and placement
  consistent wherever the derived association is consumed.
- `publishedStoryReview` / `historicalStoryReview` already supply the Done
  comparison independently of a tracked launch. Intent reads the same
  selected identity and saved Done coverage. Reuse them; ad hoc launches are
  intentionally ineligible as explicit execution/refinement review runs.

The common evidence rule is a unique completed story established by the
retained launch and published history. Current sufficient evidence joins the
exact launch reporting reference to a validated claim's publisher and identity,
and the launch-bound accepted capture to that story's recovered completion.
Validate project/target/reference binding, base/result ancestry, and that the
Done record was not already present at base. A matching earlier claim,
intermediate delivery, another session's eventual completion, or a Done file
merely carried through a landing is insufficient. Collect all candidates
before deciding uniqueness. A failed or incomplete candidate read cannot
establish a unique match. This is the available evidence path, not a universal
product restriction requiring a new capture field on every session.

Keep this association derived and rebuildable. Persist neither a competing
story-completion fact nor a retroactive execution request. Admit only configured
projects and server-held retained records; never let a browser supply trusted
repository paths or claim a completion identity unchecked. Use cancellation
and the existing authenticated/pinned published-read boundaries.

Follow [ADR 0008 — Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#dashboard-ui-concepts)
for one Selected story, unchanged Side panel, and local evidence supplementing
published authority; follow [ADR 0001 — Ubiquitous language](../../../docs/adrs/0001-ubiquitous-language-accepted.md#dashboard-product-concepts)
for launch/Session entry/story distinctions. The
[One Intent workspace with landed CI evidence](../../NORTH-STAR.md#one-intent-workspace-with-landed-ci-evidence)
topic already supplies the historical-reading direction. ADR index and
relevant record statuses agree. No conflict, exception, new ADR, or North Star
topic is needed; ADRs 0007 and 0009 are Proposed.

Expected existing edit seams at preparation revision: `recentlyDoneSelection.ts`
226 lines, `recentlyDoneView.ts` 236, `retainedHistory.ts` 108,
`launchRecord.ts` 238, `agentLaunch.ts` 242, server `agentLaunches.ts` 231,
`storyReviewHistorical.ts` 97, and `storyCompletionEndpoints.ts` 217. None
is already above 250. Keep evidence recovery a cohesive responsibility rather
than growing the near-limit orchestration files; recheck sizes at execution.

## Outside-in proof ownership

Every promise belongs to slice 1. Existing tests below locate reusable fixtures
and boundaries; they have not been run or claimed as new-behavior proof during
preparation. New regressions must first discriminate the missing behavior.

| Promise | Observable proof |
| --- | --- |
| Existing storyless ad hoc record links only to the one completed story | Boundary cases use real Git claim/completion history and a retained launch whose request has no identity. Assert the derived association through the public session-selection/read boundary. Include the Pygardon shape: `establishedSession`, captured landing without identity, matching Claim-Publisher, and removed execution workspace/branch. Do not preload the association being proved. |
| No false association from absent/ambiguous or merely participating evidence | Boundary variants: no matching claim; matching earlier claim with later takeover/completion; intermediate capture; Done already present at base; wrong project/target/reference; multiple valid completed-story candidates; incomplete/unreadable history. Missing/ambiguous evidence preserves standalone behavior; unavailable differs from a confirmed miss. Reuse completion/capture validations rather than duplicate all their existing internals. |
| Selecting in Intent preserves perspective, project rules and Side panel; Ad hoc provenance remains | One integrated ad hoc journey patterned on `sessions/recently-done-sessions-select.spec.ts`: select the row, assert selected identity and story title, same open report/panel, Intent still active, no terminal attach, and Ad hoc label unchanged. Include one standalone case preserving the prior story and reading. |
| Development reveals the selected Done card, including older retained sessions | Extend the behavior proved by `sessions/recently-done-sessions-select-development.spec.ts`: chosen card is selected and in view beyond the initial ten; a controlled-clock case has a retained session whose completed story is beyond the Board's default 30-day window. No clock sleep or retention change. |
| Review and Intent remain historical after cleanup and later trunk changes | Complete and publish through the installed workflow, retire the worktree and execution branch, advance trunk, then start from the ad hoc row. Assert the specific recognizable vendor-fixture edit in Review and Intent, historical completion revisions rather than current trunk, and the exact saved Range-resume-style assessment text. Reuse `support/intentCompletedStory.ts` and `support/oneShotExecutionReview.ts` for real completion/publication/retirement, adapting their MakeMe setup rather than fabricating a tracked execution request. |
| Checking/unknown/retry, later choice supersession, and bounded reads survive | Extend selection-check/supersede coverage with an ad hoc lookup; hold then fail/retry the evidence response, and choose another row/project or Open before release. The late result must not move the developer. Preserve the sessions overview/history contract and verify no blanket read of Done bodies. |

Arrange domain data through shared `makeMe.aThing.please()` under
[test data architecture](../../../tests/README.md#test-data-architecture).
Extend canonical launch/landing/repository builders as needed; state the
reference, claim, completion and timing facts driving each case at the call
site. Actions, exact malformed inputs and independent expectations stay outside
builders. Use synthetic external hosts/GitHub; do not alter the real Pygardon
repository or retained session as test setup.

## Slice

### 1. Reach a completed story from its retained ad hoc session

Type: Behavior
Status: planned
Proof: all rows of the outside-in table; the primary journey starts with the
storyless retained session and ends with its historical changes and saved
assessment after actual workspace retirement and trunk advancement.

Behavior: given a retained completed ad hoc session, selecting its row derives
a unique validated completed-story link when evidence establishes one, selects
through the existing page owner, and reaches the same Done review and Intent
as selecting the story directly. Without conclusive unique evidence the current
story is preserved, with absence/ambiguity distinct from unavailable evidence.

Implement the association, its selected-row and necessary Done reveal/placement
consumers, regression proof, and lasting documentation together. Keep the
original request/label and explicit Open behavior intact. Begin with a failing
ad hoc regression before adding recovery, then extend the same rule for the
older retained row and adverse evidence cases. Refactor implicated concepts
independently under the execution workflow before commit. Update maintained
session-selection/navigation and historical-reading documentation where the
current behavior is described.

This is one cohesive result and proof loop. Separate server, frontend, review,
or test-only slices would deliver no independently complete user outcome.
No numeric slice target was supplied; boundedness is the one existing
selection/review journey plus its evidence variations. There is no temporary
behavior or separate prerequisite Structure slice.

## Current decisions and validation

- Preparation authorizes this plan and its landing only, not implementation,
  Take, or planless execution.
- Source promises are all owned by slice 1. No planning source-review or
  execution-complete record is written during preparation.
- Preserve failures under [the project's failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests),
  as written; carry that link into every delegation and repair handoff.
- Follow [executable proof](../../../.agents/skills/dough-story-refinement/references/executable-proof.md)
  for the consumer trace. `launchSubject` also feeds active cards, terminal and
  report labels, Side panel selection, alerts and follow-up context;
  `storySessionsOf` feeds active cards and server follow-up. Avoid a global
  identity reinterpretation. Trace changed effects through enclosing UI,
  history support, callers, fixtures and assertions before choosing checks.
- Local gate: focused integrated selection/retirement/history journeys and new
  boundary cases, followed by affected consumer suites, `npm run lint` and
  `npm run typecheck:dashboard`. Name new specs in the plan as execution adds
  them. Run the full dashboard suite when its surface/concurrency cost fits
  the focused-check budget or a shared-contract change reaches its distributed
  consumers; inspect load, memory and competing runs first under
  [local resource use](../../../tests/local-test-resources.md). From an awake
  macOS machine on AC, guard long runs with `caffeinate -s -i`; on battery use
  `caffeinate -i` and inspect the sleep log afterwards, per
  [machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
- Start the focused check with `npm run test:dashboard -- dashboard/tests/sessions/recently-done-sessions-select.spec.ts dashboard/tests/sessions/recently-done-sessions-select-development.spec.ts dashboard/tests/intent/intent-story-completed.spec.ts dashboard/backend-tests/review/story-review-completed-capture-fallback.spec.ts dashboard/backend-tests/sessions/agent-launch-sessions-history.spec.ts`,
  adding the new regressions and affected check/supersede/history consumers.
  A fixture supplying the identity cannot prove its derivation; first observe
  new regressions fail without the association, then pass with it.
- Execution retains its normal independent refactoring, delivery and applicable
  CI repair duties. No actual host launch, credential change, paid probe, or
  release is required by this plan.

## Decisive premises observed

Observations were read-only in this preparation workspace on 2026-11-10 at
Open Dough `35644897f47d76f35f22ddd6407a8507844900ac`; no product edits were
retained. The real Pygardon reads are evidence for the legacy input shape,
not substitutes for discriminating new automated regressions.

| Premise / consuming operation | Form, observed result and remainder |
| --- | --- |
| The reported session currently has no selectable request identity | Node v24 `launchSubject(record.request)` on retained reference `cf7384a1-f783-4d7c-ba40-ee779c4ecb49` returned identity undefined and name `Ad hoc`. `sessionListing(record)` removed reporting/landing while the full record held both. `recentlyDoneSelection.ts` sends an undefined identity straight to standalone. The future association is explicitly unimplemented and owned by slice 1. |
| Published recovery identifies the real completion despite retirement | Ran `storyCompletionEndpoints(source, identity, 'origin/main', {cwd:'/Users/terryyin/git/pygardon', signal, maxBuffer:64*1024*1024})` with Node v24 `--input-type=module`. For `SEED-20261092#faster-sharadar-test-feedback`, Pygardon origin/main `955b71a546a4dfc4ce01eea2a6c27dfde5ac12af` returned facts: claim `cb4fef787da3e62e4f77ee4b9d84107164ef581b`, completion/landing `5614e88403b00bcd8869724081957c44245fd390`, Story Branch Mode; branch/worktree absent. Claim-Publisher exactly equals that launch reference. |
| Existing historical reader includes the promised vendor change | Ran Node v24 `--experimental-transform-types --input-type=module`: `initializeProjectConfiguration('production'); publishedStoryReview(configuredProject('pygardon'), identity, signal, '5614e88403b00bcd8869724081957c44245fd390')`. Returned kind published with `tests/fixtures/sharadar_vendor.py` modified (+13/−3), baseline `672a8cabc3eeec27813584a5d739ee61594d028e`, result tree `311e1974e741d8b0c0b9b07a582666626a9b2e6c`. This is the actual configured project and captured completion, not a proxy; no remote write or new capture occurred. |
| Saved coverage survives cleanup | Read Pygardon's published `.planning/done/SEED-20261092_faster-sharadar-test-feedback.json` at that completed history: inline `intentCoverage.report` includes the Range-resume baseline/fault/restoration assessment. Referenced temporary paths are report text, not read dependencies. Exact rendered text remains part of the new journey's proof. |
| Available proof routes cover real publication/retirement and selection separately | Inspected setup/assertions in `support/intentCompletedStory.ts`, `support/oneShotExecutionReview.ts`, and the named selection/Intent specs. They publish/retire through real helpers and assert exact historical diffs/coverage, but selection fixtures currently supply an execution identity. Do not claim they already prove the new join. After checkout-owned `npm ci --ignore-scripts`, ran the focused command above with `--list --reporter=list`: 12 tests in 5 files discovered successfully. This settles runner discovery only; new-behavior discrimination is required during slice 1. |

No approach depends on unobserved native-host or storage behavior. The new
association and rendered older-row route are delivery obligations, not claims
that the existing code already implements them.

## Plan concerns and readiness review

Slice-plan refinement was not needed: one cohesive Behavior owns the complete
selection-to-historical-reading result, its evidence cases and proof; no layer
or test-only boundaries need repair. Cumulatively this extends one association
rule and existing selection/review owners, not a chain of special recognizers.
No remaining slice-specific concern was identified in this preparation review.
