# Turn execution learning into product backlog decisions

## Source and outcome

[SEED-010 Story 6](../../seeds/SEED-010-learn-from-execution-retrospectives.md#turn-execution-learning-into-product-backlog-decisions).
Refined with the human on 2026-09-10. This is the original task resumed after
planning [Quick 033](../033-plan-without-numbering-prompts/PLAN.md); that detour
remains separate. Quick 034 is the next available plan number.

The developer receives implementation, process, and product review of one
execution. Each enabled review questions alignment with the existing near-future
direction. Product learning produces concrete recommendations or authorized
backlog maintenance, with evidence and hypotheses clearly distinguished.

Include conditional context reading, default-on process/product review with
independent skip options, process-efficiency observations, and completion of all
enabled reviews even when implementation review creates a correction plan.
Keep near-future direction exactly unchanged: neither propose nor apply an
adjustment. Do not reinterpret historically approved work as a defect merely
because current direction differs.

Exclude DearDough.md writing/format, token instrumentation, automatic context
reorganization or guidance rewrites, full discovery/decomposition of new ideas,
full-backlog audits, implementation of retrospective findings, release/adoption,
and unrelated planning-skill repairs. Cross-tool verification is explicitly
skipped for this story at the human's direction on 2026-09-10: no per-host runs,
coverage matrix, or integration-evidence audit is required for completion.
Release acceptance and adoption
remain owned by [SEED-010 Story 2](../../seeds/SEED-010-learn-from-execution-retrospectives.md#use-released-retrospective-log).

## Execution context

- Six Behavior slices, no Structure preparation. The human has directed planning
  without another numeric-budget question. Use one cohesive outcome and proof
  loop per slice; preserve explicit project limits if supplied later. Do not
  invent numeric targets or claim a duration guarantee. Split remaining work
  only when evidence reveals independent outcomes or material uncertainty.
- Update this plan in place using `planned`, `in-progress`, `done`. Preserve
  decisive proof and relevant unfinished work. After completion, keep enduring
  behavior in source and recognition evidence, reduce spent refinement detail,
  and update the owning story/backlog through the established workflow.
- Primary source: `src/skills/dough-execution-retrospective/SKILL.md`; maintenance
  evidence: its `RECOGNITION.md`. Prefer a concise self-contained skill; add a
  conditional reference only if it materially improves consumption. Keep shared
  procedures in their existing homes, especially backlog and correction planning.
- Read `dough-product-backlog` only when its maintenance workflow is needed;
  resolve the executing project's conventions, not Open Dough-specific paths.
  Do not invoke full decomposition for an unresolved inspiration: return a
  concrete exploration proposal. Do not change the backlog skill's direction
  policy to implement this narrower retrospective boundary.
- No edits to installed managed copies or release declarations. The retrospective
  is currently Proposed. Quick 033 fixes released planning guidance separately;
  it is not a product prerequisite for authoring this retrospective change.
- This request authorizes planning only. When execution is requested, follow
  dough-execute-plan's independent post-change refactor and owned-file delivery/
  CI-repair workflow. Resolve execution checkout and push destination then.
  Preserve the Quick 033 artifacts and other existing work.
- Current formatter targets code rather than Markdown and scans the repository.
  Use `git diff --check` for these Markdown changes; do not bulk-format unrelated
  source. Resolve any conflicting delivery expectation against actual commands
  before commit rather than inventing a formatter-policy change.

## Constraints and proof approach

Follow [ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
for source versus release state, [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
for behavior review and separate native acceptance, and
[ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
for concise instructions addressed to the executing agent. No exception is needed.

Use AGENTS.md's representative walkthrough: invocation, required context, useful
outcome. Inspect responses and destination diffs rather than exact phrasing.
Use one small reusable disposable story/plan/backlog example for boundary cases;
no new runner, static prose assertion suite, or token-count benchmark. Distinguish
manual content review from actual native behavior evidence. Save concise inputs,
observations, candidate identity, and limitations in the recognition record or
linked evidence. Existing implementation-review provenance and current-truth
behavior must survive edits; do not duplicate that workflow.

Real execution: [Quick 031](../031-register-ci-host-hooks/PLAN.md), CI hook
registration delivered in v0.3.4. Quick 032's provenance table can help locate
related commits, but recheck current truth before treating its historical findings
as unresolved. Do not perform a new implementation audit while merely preparing
this plan. If no adequate execution transcript is available, state the limitation
for process conclusions and use an explicitly representative record for process
cases; never infer developer experience from commit count alone.

## Ordered slices

### 1. Receive a grounded product recommendation from execution learning
Type: Behavior
Status: done
Proof: A bounded execution example yields a traceable product recommendation or
reasoned no-change result, without unauthorized file edits or unrelated reading.

Behavior: Given a recoverable execution and established direction, product review
connects supported learning to a relevant priority or story recommendation. Read
the direction, then queue entries and canonical stories only when relevant.
A bare retrospective authorizes recommendations; it does not grant backlog-write
authority. Label inspirations as hypotheses, and propose bounded exploration
when beneficiary/outcome is unresolved. Do not launch discovery or decomposition.

Extend the skill's purpose, review flow, and report to include product review
alongside the named implementation and process reviews. Keep product suggestions
outside implementation correction plans and process findings. Preserve existing
priority instructions. If direction is missing, say alignment cannot be assessed;
if backlog conventions are missing, return provisional conclusions and identify
that gap without inventing files. Independent supported review still proceeds.

Use Quick 031 for the real product-learning case, with recommendations-only
authority, and a labeled isolated urgent-fix variation. Record actual learning
or a grounded no-change result; do not force a backlog change. Observe a
traceable conclusion in the former, no unrelated queue investigation in the
latter, and no direction proposal/edit in either. Check missing context and
no-supported-change variations without inventing learning or validating unread
backlog entries. An intermediate release is not claimed at this stopping point.

Outcome: done. Skill purpose, flow, and report now include product review.
Recommendations-only authority is explicit; backlog files stay read-only.
Walked Quick 031 to a grounded no-change result (lifecycle registration already
advances the direction; remaining Claude acceptance is already queued). Urgent-fix
fixture: no SEED-A queue read. Missing-context fixture: no invented direction or
backlog. Hypothesis fixture: exploration proposal, no decomposition. Evidence:
`.planning/quick/034-retrospective-product-learning/evidence/slice-1/`.
`git diff --check` pass. No `npm run format` (Markdown-only change).

### 2. Question direction alignment in every review
Type: Behavior
Status: planned
Proof: One review identifies and routes supported digression separately across
implementation, process, and product, while preserving the direction text.

Behavior: Given evidence relevant to all three focuses, each enabled review treats
near-future direction as a high-priority criterion. Implementation findings route
bounded contract defects into existing correction planning; process findings
produce process recommendations; product findings recommend work/priorities.
Question apparent alignment and deviations, explaining justified exceptions such
as urgent fixes. A scope change needs the human's decision, not a rewritten
historical contract. Never suggest replacing or revising direction itself.

Give this shared consideration one authoritative home in the skill. Walk a case
with an unnecessary addition and avoidable process detour; inspect rationale and
destinations, not repeated alignment labels. Include a later-changed-direction
variation proving approved historical work is not retroactively called defective.
Slice 6 owns verifying that alignment survives product-review skipping.

### 3. Receive useful process-efficiency observations
Type: Behavior
Status: planned
Proof: A supplied process record supports an actionable context-consumption
improvement without invented counts, automatic edits, or mandatory optimization.

Behavior: Given a sufficiently complete record, process review considers concise
instructions and context organized for easy consumption, including the
retrospective's own avoidable rereading, duplication, or reconstruction. Separate
observations from inferred cost and cause; use token numbers only if available.
Shorter text or less investigation alone does not establish improvement.

Extend the existing evidence-backed process section, not a separate efficiency
workflow. Use a representative record with repeated context recovery and a
necessary-investigation counterexample. Inspect the actionable recommendation,
qualified claims, and absence of token measurement requirements, DearDough.md
writes, guidance edits, or recursively launched retrospectives. When evidence is
insufficient, report that limit instead of manufacturing a finding.

### 4. Apply product maintenance within established authority
Type: Behavior
Status: planned
Proof: The authorized version of a product-learning case changes only the intended
queue/story data; its unauthorized counterpart remains a concrete proposal.

Behavior: Given existing session/project authority to maintain the backlog and a
justified compatible change, apply it without another permission gate. Use the
project's backlog/story workflow; retain canonical ownership, valid links, and
unrelated order/content. Distinguish applied changes, proposals, and unresolved
choices. A skip option is never authority to write.

Replace the blanket read-only restriction with narrow allowances for existing
correction planning and authorized product maintenance. Cover reorder, queue
removal, understood new-story addition, and canonical detail changes as variations
of the same maintenance journey. A new queued story requires a beneficiary and
evaluable outcome; unresolved ideas remain exploration proposals. Queue removal
neither deletes the canonical story nor cancels active work. Disputed scope or
conflicting explicit priorities remain unresolved rather than silently applied.

Run the case against disposable artifacts with and without authority. Inspect
exact destination diffs, stable links, preserved direction and active contracts,
and absence of automatic implementation. Do not mutate the real product backlog
merely to demonstrate the capability.

### 5. Finish enabled reviews after implementation correction planning
Type: Behavior
Status: planned
Proof: One execution with an implementation correction and separate product/process
learning receives all supported results without executing the correction plan.

Behavior: Given implementation review amends an unfinished plan or creates a
bounded follow-up for completed execution, continue the other enabled focuses.
The existing stop-after-planning rule stops further refinement/execution of the
correction, not the remaining retrospective. Keep existing ownership, boundedness,
provenance, current-truth, and overlooked-attention evidence gates intact.

Reconcile the stop instruction and report as one completion flow. Use completed
and unfinished plan variants; inspect correct plan destination, preserved evidence,
product/process results, and no execution. Reuse a resolved-finding variation to
confirm no duplicate correction plan is created. Preserve the existing completion
marker and optional evidence-gated attention banner in their required order.

### 6. Select reviews independently
Type: Behavior
Status: planned
Proof: The same bounded scenario exercises all four selection combinations
with only the selected review results and destination effects.

Behavior: Ordinary invocation considers all three focuses. `--skip-process`
omits process analysis and recording; `--skip-product` omits product analysis,
suggestions, and edits. Both leave implementation review. Select before loading
focus-specific context or acting; skipped product review must not suppress the
shared direction consideration in implementation or enabled process review.
Implementation correction planning remains available in all combinations.

Use the reusable case to inspect selected results and destination diffs for the
four combinations. An existing DearDough.md fixture stays unchanged (this story
never adds writing); skipped focus receives no covert review or findings. Reuse
previous authority and correction cases rather than recreate their proof suites.

Reuse Slice 1's Quick 031 evidence where this edit leaves its default product
behavior intact; rerun only invalidated proof. Final content review checks the
selection instructions against invocation, conditional context, and usable
results. Update the concise behavior-review evidence without adding cross-tool
verification. Story 2 retains release/adoption ownership; do not claim release
or installed availability.

## Proof ownership

| Story promise | Owner |
| --- | --- |
| Product learning, hypotheses, exploration boundary, no-change result | Slice 1 |
| Relevant-only context, urgent fix, missing context without invention | Slice 1 |
| All enabled focuses question direction; no direction change; historical intent | Slice 2, skip integration in Slice 6 |
| Process efficiency and evidence limits, including review's own process | Slice 3 |
| Authorized edits versus proposals; canonical links and preservation | Slice 4 |
| No silent scope change, queue removal without deletion/cancellation | Slice 4 |
| Correction planning does not terminate other reviews or implement findings | Slice 5 |
| Default-on focuses and four independent selection combinations | Slice 6 |
| Quick 031 representative product outcome | Slice 1; reuse reviewed after Slice 6 |
| Skill behavior review across final changes | Each slice; final reconciliation in Slice 6 |
| Cross-tool verification | Skipped for this story by human direction; not a completion gate |
| Release acceptance/adoption | SEED-010 Story 2; outside this plan |

## Completion and assessment

After the final relevant edit, run `git diff --check`, check changed runtime links
and frontmatter, and review the final skill for contradictory read-only, stop,
skip, and direction instructions. Do not create prose-matching tests or run
unrelated installer suites: no payload or delivery mechanism changes here.
Repeat a behavioral check only if later edits invalidate it.

All six slices must have their own observed outcome before source completion.
Retain the candidate identity and decisive local behavior evidence for later
reuse. No cross-tool proof or reuse assessment is needed to complete this story.
This scope decision does not change Story 2's release/adoption requirements;
source completion is not public release.

Ready for direct execution under the human's no-numeric-budget direction. No
Structure or slice-refinement pass is currently indicated: each slice changes
one decision boundary with a focused proof journey. Quick 031 transcript
availability limits process conclusions, not implementation of the story; the
plan explicitly permits labeled representative evidence for those cases.
