# Plot new models with an estimated Token Index

**Identity:** SEED-406#plot-new-models-with-estimated-token-index
**Source:** [Plot new models with an estimated Token Index](../../seeds/SEED-406-plot-new-models-with-estimated-token-index.md#plot-new-models-with-estimated-token-index)
**Source review:** [source-review.md](source-review.md)

## Goal and current decisions

When a finished task used a model missing from its tool's card, the first
Usage view should tell the developer which rate to update. A provisional
point keeps the task visible until then. A close estimate is secondary to
the warning. The developer selected same-family matching with a tool-local
reference fallback and a rolling median restricted to explicitly rated,
fully measured tasks.

Choose a proxy per named response group. Prefer an exact tariff entry. For
an unlisted model use the uniquely closest numeric version within its named
family on the same card. Treat dotted Codex and hyphenated Claude versions
as numeric components. A tie, an unfamiliar family or an unclear version
uses the tool's reference. Keep all token-category rates together. An absent
model, unsupported speed or unusable cache-write split still has no rate.
Existing coverage gaps stay visible independently. Rate lookup has no
accuracy target, external service or automatic card update.

Use the existing tariff and token weighting in `dashboard/server/tokenIndex.ts`
and `usageTariffs.ts`. The host's launch-model selector describes choices
offered for new work. Only the tariff describes rates for retained responses.
Carry each distinct actual model and substitute with the computed task.
`tokenIndexCohort.ts` owns median eligibility and period projection.
`TokenIndexTrend`, `UsageToolSummary` and `UsageTaskDetail` can consume the
same evidence from the displayed tasks. A later read reweighs the same
counters. Preserve the primary observed model for cohort selection, existing
rates and each tool's denominator. This uses the direct domain mapping in
[ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
and the derived dashboard view in [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md).

## Premises and observations

Observed in this worktree at `9116033882aa` on 2026-11-19, Node 24.21.0.

| Consuming operation | Observation and consequence |
| --- | --- |
| Read the same history under two tariffs | Wrote nine Sol tasks and one GPT-6.2 Astra task using the maintained usage-history builders. Read one derived summary through `tokenIndexCohort`. The November 15 card yielded nine points, one unpriced and no median. Giving the Astra row the prior Astra rates in memory yielded 12,000. The November 19 card yielded 7,800, ten points and a median of 1,950 ending at the tenth task. Both explicit-row reads admitted it immediately. An estimate therefore needs its own evidence for eligibility. |
| Project a previously unpriced task through HTTP and the visible period | Temporarily allowed unknown named models to use the reference rates at the existing lookup. In `npm run test:dashboard:backend -- usage-history/token-index --workers=2`, 33/36 passed. Eligibility, Claude pricing and period projection rejected the newly visible tasks. In `npm run test:e2e -- e2e/configuration/system-settings-usage --workers=2`, 3/4 passed. The period view reported “16 tasks · 5 partial · Last 30 days” where its case expected one unpriced. Reverting the lookup restored 36/36 and 4/4. Preserve the day-boundary and genuine unpriced assertions when adding estimates. |
| Surface a rate-card update | The observed browser path reads the store through the real Usage server. Its existing point selection and period choices reach both task detail and the per-tool summary. Rendering fixtures can exercise a second answer on refresh. They do not prove tariff selection or reweighting. Use the stored-history boundary for those and the browser for the visible warning. |

## Ordered slices

Each slice has 15 active minutes. For every slice, begin fully awake and run
its focused checks. For a full local run on AC use `caffeinate -s -i`. On
battery keep the lid open, use `caffeinate -i` and inspect the sleep log.
Follow [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
and the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Apply this project's MakeMe and browser page-object selections before editing
tests, then independently refactor, verify and deliver each slice through the
execution workflow.

### 1. See which rate card needs an update

Type: Behavior
Status: done

Given otherwise usable counts for a named, unrated model, opening Usage
shows the task at a provisional value and a visible instruction to update
the card. Start with the tool's reference rates for missing entries.
This interim choice preserves the warning and its accuracy about the rate
actually used. Slice 2 replaces the choice when there is a close family match.
Compute contributions per group, keep distinct pairs, mark estimated points
visibly and in their accessible names, and summarize each affected tool/model
once among the displayed tasks. Opening a point identifies all substitutions
and any partial coverage. Keep task filtering on the primary observed model.

Proof starts at the real Usage page with a finished Codex task and an
unfamiliar worker model. Before selecting a point the developer sees the
tool, actual model, substitute and requested update. Keyboard selection
reveals the actual root and worker substitution. Repeated use yields one
warning per model. Narrow the displayed period or cohort and check its warnings.
Exercise the Claude reference fallback through the store, including cache writes.
Check a partial estimated task remains visibly partial, and a wholly estimated
task with complete counts remains outside the ten-task median. Nine exact tasks
plus that task yield ten points and no median. Preserve genuine unpriced
coverage with an unsupported speed and Claude's unsplit writes.

Run the Token Index backend, system-settings-usage frontend and real Usage
E2E groups named below. Adapt the four observed old expectations at their
own boundaries. A period case that still asserts unpriced counts should include
a genuinely unpriceable task alongside the newly visible estimate.

### 2. Use the closest family rate until the explicit update

Type: Behavior
Status: done

Given a missing rate for a version of a known family, open the same chart.
Only the substitute and resulting index change. The warning names the
actual pair. A newer card's explicit entry retires that substitution on the
next read. A mixed task retains other outstanding substitutions, and a task
enters the median only after its last substitution clears and usage is complete.

At the stored-history boundary replay the two real Codex cards over the same
nine Sol tasks and tenth Astra task. Expect the historical estimate of 12,000
from GPT-6 Astra, then the explicit 7,800. The nine exact values stay stable,
the actual Astra filter still finds the task, the final median is 1,950, and
the stored counters remain identical. Include Claude Fable with two available
family versions, and a tie or unknown family that takes the reference. A
mixed root/worker example must sum the separately weighted contributions.
At the browser boundary refresh from an estimated answer to its explicitly
rated answer. Verify the point label, selected detail and warning update,
and a warning for any other affected model remains. Record the delivered
contract in [the Usage guide](../../../dashboard/USAGE-TOKEN-INDEX.md).

## Execution complete

Product advice: no change. The delivered estimate, warning and explicit-rate
retirement match the story; no queued or direction item depends on new
learning. Process review is deferred into wrap-up with the intent coverage
check.

## Verification and review

Run `npm run test:dashboard:backend -- usage-history/token-index` for rate,
detail, coverage, model selection, dated counts and median membership.
Run `npm run test:dashboard:frontend -- system-settings-usage` for rendering,
keyboard selection, comparison, overflow, spacing, filters and refresh.
Run `npm run test:e2e -- e2e/configuration/system-settings-usage` for
browser-to-store wiring and `npm run typecheck:dashboard` for the shared
answer and its fixture builders. Trace any change to shared history-chart
marks into CI and scope chart consumers and run their affected checks.
Use a single optional estimate cue alongside the existing partial/overflow
cues so exact tasks and other chart uses keep their existing presentation.

Slice-plan refinement was unnecessary. The first slice makes a missing rate
actionable for both tools, and the second improves and retires the estimate
through the same rate lookup. No remaining slice-specific concern.

## Learnings

- Slice 1: the usage-history store builder rejects `model: null`, so an
  absent model cannot be written through the store; its unchanged no-rate
  path in `tokenIndex.ts` keeps it unpriced. Slice 1 proof lives in
  `e2e/configuration/system-settings-usage-estimate.spec.ts` and the
  eligibility, Claude and period Token Index backend specs; slice 2 can
  extend those for close-family matching and the card-update refresh.
- Slice 2: the Token Index harness `readCohort` rewrites the store on every
  call, so it cannot observe "no history rewrite"; the chart route's
  unchanged store hashes in `token-index.spec.ts` do. Close-family proof lives in
  `token-index-estimate-family.spec.ts`; the refresh warning proof in the
  frontend `system-settings-usage-estimate.spec.ts`.

## Story obligations
