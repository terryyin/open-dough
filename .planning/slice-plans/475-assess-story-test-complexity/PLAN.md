# Review complexity introduced by a story's tests

**Identity:** SEED-192#assess-story-test-complexity
**Source:** [selected story](../../seeds/SEED-192-review-product-intent.md#assess-story-test-complexity)
**Prepared:** 2026-11-05; preparation only. Execution is not authorized by this plan.

## Goal and boundaries

Terry can make a justified retain or simplify decision about the complete test
expression of SEED-192#review-story-intent-impact at its completion revision
`7c71049bac64d7a6520a33628e485704a21ee855`, and evaluate whether this review
method was worth its cost. The story section owns the case, criteria, examples,
and decision basis.

Included: attributed story changes, relevant unchanged support, reasoned
protection tradeoffs, current-trunk rechecks, Terry's evaluation, and lasting
method learning in the memorandum. Excluded: implementation, queue changes,
test or rule changes, new UI or tooling, scores, historical reruns, and new
timing collection. Existing execution records may inform the review only within
their recorded revision, selection, and conditions. A historical pass does not
prove the sufficiency of a proposed simplification.

**Failure policy:** [AGENTS.md — Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests)
applies as written to execution, verification, delegation, and repair handoffs.
Historical records describe their historical result; they neither waive a
current failure nor authorize reruns until green.

**Local gate:** `npm run lint` and `git diff --check` for the seed, plan,
assessment, and memorandum edits. No product or test-support behavior changes,
so no repository or dashboard full suite is prescribed. For any long run that
becomes necessary, follow the maintained
[macOS sleep guard and power condition](../../../tests/local-test-resources.md#machine-sleep-on-macos):
start fully awake; on AC use `caffeinate -s -i`; on battery plug in or keep the
lid open under `caffeinate -i` and inspect the sleep log afterwards.

## Existing solutions and direction

- **Reuse Git and current review surfaces.** Recover the original seed section
  and plan 441 with `git show 7c71049b:<path>`. Read delivered hunks with
  `git show <commit> -- dashboard/tests dashboard/playwright.config.ts`, and
  read complete test/support files at the case revision. Intent's story lens,
  Review changes, and ordinary source reading already expose the case. There
  is no need for a new dashboard action or analysis framework.
- **Reuse the evaluation approach, not another verdict.** The
  [test-value review](../../../docs/maintainer/dashboard-test-value-review.md#decision-basis)
  separates the importance of behavior from the marginal value and cost of
  its test expression. The
  [memorandum](../../../docs/product-intent-review-memorandum.md#observable-proof-cost-and-judged-complexity)
  supplies the complexity criteria. Timing reports and the optimization
  candidate workflow own different responsibilities: neither supplies this
  story's complexity judgment. The protection-review plan 472 is not a
  prerequisite or a substitute for the assessor's cited preservation argument.
- **Existing record homes.** Put the case assessment at `assessment.md`
  beside this plan, recoverable in Git after ordinary wrap-up. Put only lasting
  method learning in the memorandum. Do not add a catalog, score schema, or
  reusable skill. The accepted dashboard state boundaries in
  [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  need no change.
- **Accepted decisions.**
  [ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md) keeps
  Purpose, Proof, and Structure distinct;
  [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
  requires a baseline, review cost, bounded conclusions, and human ownership
  of consequential unresolved tradeoffs. The ADR index and relevant record
  statuses agree. No exception or new architectural direction is proposed.
  The [initial Intent direction](../../../docs/dashboard-ux-ui-north-star.md#initial-intent-workspace)
  already supports source reading; this story adds no interface commitment.

## Decisive premises observed during preparation

These observations are read-only in the established preparation workspace on
2026-11-05. They settle the source-reading route this assessment uses, not the
effectiveness of historical tests or a proposed rewrite.

| Premise | Consuming operation | Observation and result | Remainder |
| --- | --- | --- | --- |
| The case's original intent and execution context can be read at completion | Slice 1 recovers the intended behavior and its proof claims | `git show 7c71049b:.planning/slice-plans/441-review-story-intent-impact/PLAN.md` and the seed's `#review-story-intent-impact` section at that revision yield the story outcome, examples, exclusions, and accepted-proof records. The done record identifies the same completed story | No missing source input; historical proof claims still need qualification in the assessment |
| A broad before/after diff would misattribute work; delivered commits provide a usable boundary | Slice 1 attributes costs to this story | `git show c64319b6e --stat` shows the stopped attempt's selection specs and harness edits. `git show 5b8aeba9d -- .planning/slice-plans/441-review-story-intent-impact/PLAN.md` explicitly records slice 1 delivered through that attempt. `git log --first-parent 30d224ec5^..7c71049b` shows intervening other stories before the continuation; `git diff --name-status 9470bb4b8 7c71049b -- dashboard/tests` omits the earlier selection additions | Use the delivered-commit set below; no aggregate range is treated as wholly owned |
| The case contains actual high-boundary journeys, lower-level checks, and nontrivial supporting expression | Slice 1 applies the criteria across boundaries | `git show 7c71049b:dashboard/tests/intent-story-changes.spec.ts` reaches the UI assertions and imported support. Reading `support/intentStoryPage.ts`, `support/intentStoryWorktree.ts`, `committedOrigin.ts`, and `boundary/story-review-folders.spec.ts` at the same revision shows real Git setup, locator/style helpers, a Git-backed external-response stand-in, and direct tree-model assertions | Their value, coupling, and assumptions are the review's output, not conclusions claimed by preparation |

**Attribution starting set:** `c64319b6e` (stopped attempt), `f0888fb90`,
`d73c75dd9`, `28a663e39`, `2d4903a47`, and `5a1ecb5f2` (continuation).
`5b8aeba9d` and `7c71049ba` supply delivery/evaluation provenance. Inspect
each commit's actual changes; distinguish selection work from harness
mitigations in the stopped attempt. Record attribution uncertainty explicitly
rather than assigning an intervening story's tests to this case.

## Outside-in proof

| Source promise / examples | Owner and observable result |
| --- | --- |
| Complete expression; boundaries, concepts, coupling, and substitutions (1–3) | Slice 1: `assessment.md` maps the attributed test changes to intent and follows assertion/setup chains into relevant support. Source citations include revision, path, and line or named test/function. Unchanged support is marked inherited, rather than charged as newly added code |
| Protection versus simplification and runtime distinctions (2–5) | Slice 1: each concrete proposal names the benefit, cost, preserved observation, potential loss, and uncertainty. Existing run evidence is attributed; absent evidence is unknown. The comparison with current trunk marks resolved findings and leaves only still-applicable proposals actionable |
| Worthwhile developer decision and honest method learning (6) | Slice 2: Terry's retain/simplify/insufficient-evidence decisions and reasons, method keep/adjust/reject judgment, reading effort, and unsupported claims are recorded in `assessment.md`; the memorandum preserves the bounded learning |
| No implementation or silent follow-up | Both slices: the diff contains only planning/assessment and memorandum records, with no test, support, product, or testing-rule changes and no queue mutation |

## Slices

### 1. Explain the complete test expression and its tradeoffs
Type: Behavior
Status: planned
Proof: `assessment.md` contains the attributed scope, baseline, sourced cost
account, concrete proposals with preserved observations, and trunk rechecks.
Open every proposal's cited sources and confirm they support its reasoning;
record unsupported or uncertain parts rather than asserting them as facts.

**Behavior:** the case's original intent, delivered changes, and complete
test/support source → the assessor reviews them using the memorandum's
criteria → Terry can read a concrete retain or simplify recommendation and
follow its costs and protection tradeoffs to source.

Before verdicts, record what ordinary Review changes plus source reading and
the existing test-value review already reveal. Label this case evaluation
exploratory and retrospective. Track assessor effort and distinguish observed
effort from predicted maintenance savings. This is not a blind experiment.

Inventory attributed tests and support changes, then trace each relevant
assertion and setup chain at the completion revision. Explain inherited setup
needed to understand the story without attributing its entire creation to the
story. Include the direct tree checks and externally supplied responses; do
not infer a boundary or mock's adequacy from its filename or comments alone.
Read the assertions and the response construction that actually supply it.

For each proposal, say retain or simplify, which intent it protects, why its
current cost is justified or avoidable, the concrete simpler alternative when
one is proposed, what observations must survive, and what remains unproved.
Do not require an avoidable defect to exist. Recheck each potentially
actionable proposal against a named current `origin/main` revision; cite the
current source and mark resolved, still applicable, or uncertain. No test
execution or rewrite is needed to make these explicitly reasoned proposals.

### 2. Obtain Terry's decision and retain the method's learning
Type: Behavior
Status: planned
Proof: the assessment records Terry's case decisions, reasons, method judgment,
reading effort, and citation objections; the memorandum records the evaluated
case, useful criteria, cost, limitations, and any adjustment or rejection.

**Behavior:** slice 1's sourced assessment → Terry reviews it and gives his
judgment → the retained assessment and memorandum distinguish his decision
from the assessor's recommendation and preserve what the case taught.

**Human checkpoint:** present the assessment and wait for Terry's retain,
simplify, or insufficient-evidence decisions and his keep, adjust, or reject
judgment of the method, with reading effort and any unsupported claim. Ask in
one bounded request. If he delegates evaluation, record that authority and who
evaluated; do not assume delegation from an older story. Submit a required
execution handoff through the supplied dashboard reporting context as
`--outcome unfinished` with the exact attention message. This checkpoint is
part of future execution; it is not a decision needed before Take.

After his response, record the decisions and update the memorandum in this
same slice. Implementation or queuing remains a separate instruction. A
rejected method or insufficient-evidence decision is a completed learning
outcome when its reason and limits are recorded; missing Terry input is not.

## Current decisions

- Story Branch Mode; no step must act from trunk.
- This is a source-based complexity assessment. Do not import the sibling
  protection review's blindness, mutations, or historical reruns as obligations.
- A shorter expression or faster recorded run alone cannot establish a better
  maintenance tradeoff. Preserve the distinction between a proposal, observed
  behavior, and a validated rewrite.
- The two slices share one model: a sourced maintenance tradeoff followed by
  the evaluator's decision and lasting learning. There is no new analysis
  engine, special-case scoring, or speculative extension.
- No numeric slice target or hard limit is established here. Slice 1 is bounded
  by one case and its relevant support, with one assessment proof loop. Slice 2
  has one evaluator checkpoint and incorporates its learning before delivery.

## Concern evidence

- Slice-plan refinement was not needed: the assessment and evaluation have
  separate observable outcomes, complete proof ownership, and no preparatory
  structure or implementation to fragment. Method learning stays with the
  decision that supplies it.
- No remaining slice-specific concern was identified. Unknown findings,
  protection effects, and possible savings are investigation outputs; the
  source-reading approach does not assume favorable answers. Terry's future
  evaluation is explicitly owned by slice 2, not an unresolved preparation
  decision.
