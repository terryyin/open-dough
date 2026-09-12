# Match success claims to proof of the promised outcome

Status: planned. Planning authorized on 2026-09-12; execution not requested.

## Source, goal, and scope

[SEED-004 Story 20](../../seeds/SEED-004-extract-and-adopt-project-guidance.md#match-success-claims-to-promised-outcome-proof)
owns the goal, confirmed occurrences, historical comparison, and exclusions.
Help the developer receive a correctly supported completion claim with clear,
correct instructions and less avoidable total token work. Choose the smallest
sufficient proof early; preserve useful evidence and outstanding promises.

Deliver a focused source clarification and representative behavior review.
Exclude release/adoption, native-host certification, installer repair, source-
project execution replay, new skills, schemas, reports, benchmark machinery, and
unrelated audits. Numerical token savings are not promised. The backlog's current
extraction direction is supported by improving the usefulness and cost of its
existing lifecycle skills; the direction and sibling stories remain unchanged.

## Existing solution and decisions

PFE responsibility: choose and accept evidence covering the promised behavior.
The product already has the following coherent ownership:

- `src/skills/dough-story-refinement/references/planning.md#own-executable-proof`
  owns proof selection and its shared contract. Change that existing home.
- `src/skills/dough-execute-plan/references/wrap-up.md#accept-proof` consumes it
  and already inspects setup/assertions, rejects missing proof, and avoids reruns.
  Align only as necessary; do not duplicate the shared procedure.
- Execution delegation supplies the existing `proof:` handoff; decomposition
  owns slice shape, retrospective owns later assessment, and update owns actual
  installation results. These are not new homes for a parallel proof checklist.
  Preserve their contracts; edit a caller only for a demonstrated contradiction.

Historical review found the two sections unchanged in v0.3.6/v0.3.12 and the
recorded project snapshots. They do not explicitly distinguish product-owned
setup from setup already supplied by a test seam. This supports clarifying the
existing rule, not assuming that more warnings or end-to-end tests are needed.
The v0.3.11 installation repair is confirmed and supplies no new repair scope.

Relevant Accepted decisions:

- [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md):
  cohesive reuse, low change cost, and no speculative preparation.
- [ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md):
  edit shared source; installed managed copies change through released updates.
- [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md):
  representative authoring review is distinct from native acceptance/release.
- [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md):
  one actionable behavioral home; maintainer evidence and token rationale stay
  outside runtime guidance. Preserve executing-project context.

No new architectural choice or North Star topic is warranted. No conflicts with
these decisions were identified. Do not add a file-count or word-count ceiling.

## Outside-in proof

The observable boundary is the agent's proof choice and supported completion
report after consuming the relevant guidance. Use the existing AGENTS.md
representative behavior review, comparing current and candidate instructions
with identical case inputs. Inspect invocation context, required context, and
useful outcome. Keep supplied facts separate from expected review judgments.
Do not feed the expected judgment as an instruction to the case being reviewed.

| Case / input | Required observation | Owner |
| --- | --- | --- |
| Inner cleanup test passes; public caller completion unobserved | Identify caller settlement as missing; choose focused proof or leave public completion unproved | Slice 1 |
| Fixture supplies allocation that production promises to establish | Distinguish reaching a mocked provisioning operation from actual allocation/use; reuse the unit proof for its narrower contract | Slice 1 |
| Version is current but a required invocation reference is absent | Identify the unsupported invocation; no usability certification or repeated historical installer repair | Slice 1 |
| Matching evidence already observes promised setup and completion | Accept the corresponding case-specific claim; no rerun or broader failure-mode claim | Slice 1 |
| Missing evidence cannot be obtained within authorized work | State covered behavior and unproved promise; keep the latter incomplete without silently changing scope | Slice 1 |

All rows vary one evidence-to-claim rule, not separate domain policies. The
public-stop and provisioning cases exercise the general rule; installation and
sufficient evidence guard against overclaiming and unnecessary work.

Record one compact current-versus-candidate walkthrough in the active plan's
`evidence/` directory during execution, with the relevant instruction revision,
case inputs, resulting decisions, and limitations. Reuse the historical findings
by reference. Recognition records should link to this active assessment where
needed rather than duplicate it; ordinary wrap-up owns spent evidence cleanup.
Manual walkthroughs are source review, not independent native-agent executions.

Evaluate language clarity and the changed instruction/read footprint, including
linked context. Compare induced reads, tool/output volume, repeated verification,
and repair work qualitatively. If comparable runs expose actual token totals,
use them with their boundaries; otherwise do not invent counts or claim measured
savings. A longer clarification is acceptable only with a concrete explanation
of the ambiguity or avoidable work it removes. Correct decisions take priority
over shorter text. No extra runtime efficiency-reporting procedure is introduced.

## Ordered slices

### 1. Choose and accept proof without bypassing the promised behavior
Type: Behavior
Status: planned
Proof: The single comparative walkthrough above shows case-specific supported
claims and minimal next actions, while preserving correct sufficient-evidence
acceptance; authoring review assesses clarity and total-work implications.

Behavior: Given an intended success claim and available proof, when the agent
selects or accepts that proof, it accounts for promised behavior supplied or
bypassed by test setup and limits the claim to the observed result, obtaining
only the missing evidence within existing authority.

Clarify the existing shared proof rule to distinguish starting preconditions
from behavior the product must establish, and local results from the promised
caller's completion. Make the distinction available at selection and acceptance
through the existing link. Preserve focused tests, existing sufficient proof,
incomplete-promise handling, and the established proof handoff. Prefer replacing
vague or redundant language to stacking new rules. Align directly affected
runtime wording and maintainer recognition without publishing project incidents
or internal optimization analysis as required runtime context.

Compare current and candidate guidance in the same proof loop. If the candidate
has no supported clarity/work advantage, revise or remove it; retain the
comparison and report a no-change recommendation rather than claiming a delivered
improvement. Do not mark an improvement delivered solely because prose changed.

Safe stopping point: the source clarification has reviewed behavior and an
honest efficiency rationale; release and adoption remain separate. A no-change
result retains the evidence and leaves the improvement claim unfulfilled.
Sizing: bounded, moderate confidence; one rule, existing callers, one review
loop, no infrastructure. Exact wording benefit remains an execution uncertainty.
No numeric target, hard limit, or overrun threshold was supplied; none is invented.

## Verification and delivery gates

During separately authorized execution, inspect descriptions, changed sections,
and their direct callers for consistent runtime meaning; run `git diff --check`
and check affected Markdown links/frontmatter. These checks establish document
integrity, not agent behavior. Installer/update suites exercise unchanged delivery
mechanisms and are not behavioral proof for this wording change; run them only
if an actual delivery dependency changes. No new automated prose-matching tests.

Follow dough-execute-plan's existing independent post-change refactoring, proof
review, formatting, coordinator-owned commit/push, and asynchronous CI handling
when execution is requested. The repository provides `npm run format` and
`npm run lint`; resolve the applicable staged-component/hook contract at delivery
rather than assuming a hook is configured. Preserve existing uncommitted work in
the backlog, seeds, and finding records. This planning turn commits/pushes nothing
and keeps the story queued. Retain the completed plan for retrospective/wrap-up.

## Construction assessment

One Behavior slice, one common rule and comparative proof loop, with no preparatory
Structure or scenario-specific implementations. Splitting proof selection from
acceptance would create an interim inconsistent shared contract; splitting by
incident would duplicate the same rule. All seed promises are owned by Slice 1,
including language efficiency, qualitative total-work assessment, shared-source
consistency, and truthful source-only completion. No further slice decomposition
concern was identified in this assessment; candidate wording effectiveness remains
a bounded verification question, not a missing product decision.

## Learnings

No execution yet. Historical and current-text findings are recorded in the seed;
reuse them unless new evidence changes their applicability.
