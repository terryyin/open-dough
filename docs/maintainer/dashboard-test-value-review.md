# Dashboard test value and cost review

Assessment on 2026-11-01 against `ae6479d3558b2e660e99d5b4839f0b6b064e7df5`.
Source inspection and existing measurements only; no new timings or test changes.
SEED-208 (plan 432) then implemented the actions below; each section's
**Outcome** names where the surviving proof now lives.
Sections 4, 7 and 8, which accept integrated journeys' costs, are in the
[accepted-cost review](dashboard-accepted-cost-review.md); each accepted cost
is commented beside its test. The improvement story is recoverable at
`40e1d2f9:.planning/seeds/SEED-208-dashboard-proof-cost.md` (`#reduce-dashboard-proof-cost`).

## Decision basis

For each responsibility, ask separately whether its behavior matters and whether
this test's additional fault detection justifies its runtime, explanation,
fixtures, maintenance, and the cost of optimizing it. A negative answer to
either removes the test or reduces its scope. A slow test is not automatically
valuable, and a fast redundant test is still redundant. Retain real application
boundaries; do not accelerate by mocking production collaborators or answers.

First remove redundant executions; then use simpler real preconditions and
existing infrastructure; consider broader infrastructure only when a bounded
experiment shows enough benefit. Keep an independently justified simplification
even without demonstrated wall savings, but never report it as a speedup.
This explicit developer decision changes the earlier passes' practice of
restoring duplication solely because focused wall time did not improve.

This follows [ADR 0010, Definition of improvement](../adrs/0010-definition-of-improvement-accepted.md):
implementation, review, tool use, and future complexity all count. Numeric ROI
cannot be established: invocation frequency, regression incidence, maintenance
effort, and attributable suite savings are unavailable. Rankings below are
prospective engineering judgments, not measured financial returns. Existing
focused walls are not additive savings. The latest suite pair crossed a reboot
and unlike load; it is not a causal baseline for this work.

## 1. HTTP review admission

**Coverage worth keeping: yes. Current shape worth its cost: no.** Refusing
foreign paths, malformed object IDs, and comparisons outside recorded authority,
without mutating the repository, protects the developer's actual work. Endpoint
contracts differ: file-text content/rename/binary behavior, range integration
evidence, and historical fixed-pair admission cannot all collapse into a parser
test or one happy-path journey.

`story-review-{refusal,commit-admission,file-text-admission,one-shot-admission}.spec.ts`
and the last case of `story-review-mark.spec.ts` requested `page` but only used
`page.request`. `preparationPage.ts` also creates a full installed-start origin;
`storyReviewWorktree.ts` builds renames, binary changes, trunk merges, and several
working-copy states even for requests rejected before reading Git.

**Action:** use `request` and the existing boundary server; separate the mark
admission case from its real browser journey. Give rejection-only cases a
minimal real repository, recorded launch, and explicit mutation sentinels.
Keep the rich worktree where file/range semantics require it, and retain one
real start/capture/retire path for historical provenance. Do not replace
read-only guarantees with a stub saying that no write occurred.

**ROI:** medium, conditional. Five file homes share avoidable fixture cost,
but the earlier boundary-only move changed approximately 12.6s to 12.1–12.5s.
Repeating that move alone has weak runtime ROI; removing irrelevant Git setup
is the new hypothesis. Reuse existing server/record builders, not a new framework.

**Outcome:** the four specs and `story-review-mark-admission.spec.ts` live in
`dashboard/backend-tests/review/` with `request` and `serverMode: "boundary"`;
rejection cases use `admissionWorktree` in `support/storyReviewWorktree.ts`.
No runtime gain was measured.

## 2. Codex discovered-model workflows

**Coverage worth keeping: yes. Current shape worth its cost: no.** Wrong model
or effort in the established workspace can waste an entire agent run. The
story and ad-hoc launch shapes differ, but three repetitions of catalog loading,
selection, explanation, and native request shape add little protection.

`agent-launch-codex-model.spec.ts` imported thirteen cases through
`codexModelCatalogCases.ts`, `codexEffortDialogCases.ts`, and
`codexEffortWorkspaceCases.ts`. All used `codexStart.ts`, which creates an
installed-start origin per case. Catalog cancellation, host/project races,
focus, and effort feedback do not need installed execution preparation.

**Action:** keep one story model-selection journey and one ad-hoc shape; remove
the redundant refinement catalog journey only after preserving its distinct
`refinement-starts.json` model/effort-before-input assertions in the existing
`agent-launch-preparation-codex.spec.ts` journey. Its current default-model
assertions are not replacement proof. Keep default semantics elsewhere intact.
Use `codexLaunch.ts` and the existing read-only `launchJourney` for catalog-only
cases. Keep `codexStart.ts` for actual established-workspace/confirmation cases.
Keep genuine stale-catalog, project isolation, keyboard, and workspace variants.

**ROI:** highest infrastructure opportunity in this set, still unmeasured.
Dropping one of thirteen cases previously gave no wall benefit; removing
installed-start preparation from the cases that do not exercise it addresses
the dominant siblings. Start-origin skill packing already happens once per run
in `startOriginPreparation.ts`; do not propose implementing that cache again.

**Outcome:** catalog and effort-dialog cases and the ad-hoc model shape use
`codexLaunch.ts`; `codexEffortWorkspaceCases.ts` and the execution shape keep
`codexStart.ts`. Refinement model/effort persistence moved to
`agent-launch-preparation-codex.spec.ts`. Reported as simplification.

## 3. Host/start-phase matrix

**Coverage worth keeping: yes. Current four-journey matrix worth its cost: no.**
Preparing versus native launching, cross-page observation/reload, and Backlog
versus Taken placement prevent false launch state and accidental duplicate work.
Host wording matters; it does not require both workflows under both hosts.

**Action:** retain Claude execution progress and Codex refinement progress as
the two representative full phase journeys across `agent-launch-start-phases`
and `agent-launch-preparation-phases`. Remove the opposite two repetitions.
`agent-launch-start-codex.spec.ts` already checks changed readiness through
`expectExecutionInput(..., true)` and observes Codex retry progress; that covers
the Codex execution handoff assertion. Keep the Claude readiness argv assertion.
Keep refinement-only placement/Preparing expectations in its retained journey.
Move the no-running-process store case to the real HTTP boundary without a page.

**ROI:** high for low edit complexity and two fewer complete journeys; elapsed
gain is unknown. Earlier removal of only Codex execution did not improve its
three-case file's wall. Do not infer a saving from test count or introduce a
new host/workflow matrix helper to maintain the smaller selection.

**Outcome:** implemented as stated; the stored-not-running case lives in
`dashboard/backend-tests/launches/agent-launch-start-kept-not-running.spec.ts`.

## 5. Completed review's ambiguous-merge gap

**Coverage worth keeping: yes. This additional case worth its cost: no.** The
gaps loop's `ambiguous-merge` case uses the same story-branch variant and real
HTTP endpoint as `boundary/story-review-completed-driver.spec.ts`, whose
printing-driver case already requires the same unsafe-attribution explanation.
`story-review-completed-conflicts.spec.ts` separately guards unattributable
extra resolution edits. The gaps `missing-agent` case is distinct and survives.

**Action:** add the gaps case's `not.toHaveProperty("files")` assertion to the
retained ambiguous printing-driver case, then remove only the duplicate loop
iteration. This keeps a fail-closed assertion as well as the error explanation.
If plain-versus-printing equivalence proves uncertain, a focused negative control
of the attribution guard must fail the retained proof before deleting its sibling.

**ROI:** high for small implementation/maintenance cost, modest unknown elapsed
benefit. Earlier 9.48–11.51s comparisons were inconclusive; no new caching or
Git-attribution rewrite is justified to remove this single duplicate.

**Outcome:** implemented as stated; a negative control of the fail-closed
branch failed the retained driver case.

## 6. Recently-done deletion

**Coverage worth keeping: yes. Current setup breadth worth its cost: no.**
Deleting a record without stopping its conversation or stealing keyboard focus
matters. A session inside a done card, standalone Recently done entry, active
Taken card, Backlog card, and sidebar are distinct placement/focus outcomes.
Removing the whole journey would lose them. `agent-launch-story-card-delete`
already owns the full question, Keep, Escape, and default Keep-focus contract.

**Action:** remove repeated confirmation/default-focus proof from the recent
sibling; keep its distinguishing placement, remaining-record, sidebar, and
no-stop assertions. Establish its four incidental launches and two done states
through existing real launch/mark HTTP operations, retaining the page's actual
delete interaction. Keep one real UI launch path in the launch family. Avoid
sharing mutable HOME, sessions, servers, or lists across tests.

**ROI:** medium. The 26.8s recorded contribution is summed full-suite file time,
not a wall-saving estimate. Dialog-only trimming is negligible; bypassing four
incidental dialog paths with real APIs is the bounded useful experiment. Do not
build a generic scenario DSL or merge unrelated deletion lifecycles.

**Outcome:** setup uses `agentLaunchBoundary.ts` `launch` and `markDone`;
runtime unchanged, retained as simpler orchestration.

## Delivery and stopping rule

All supported reductions and fixture experiments belong to the one selected
story. SEED-208 completed them as recorded in each Outcome. Establish
surviving proof before narrowing. Use fresh normal-mode full-suite before/after
records, comparable host load, and controlled focused/serial evidence. Do not
sum file durations into claimed wall savings. No retries, skips, exclusions,
extra workers, mocked responses, or relaxed timeouts buy a green result.

Retain measured infrastructure improvements only when their benefit justifies
their support code. Stop an experiment when measurements reject its cost
hypothesis; do not repeat an already rejected trimming-only approach. Once the
valuable remaining path has no credible cheaper design within this bounded
scope, accept its residual cost with evidence and leave ordinary CI intact.
