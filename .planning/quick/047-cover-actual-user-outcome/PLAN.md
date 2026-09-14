# Cover the actual user outcome before accepting proof

Status: planned — execution not started.
Source: [SEED-004 story 21](../../seeds/SEED-004-extract-and-adopt-project-guidance.md#cover-the-actual-user-outcome).
Authority: The owner's 2026-09-14 instruction authorizes updating refinement and
writing a slice plan for the accepted narrow fix. It does not authorize
implementation, commits, pushes, release, or moving the story to Taken.

## Goal and scope

A developer gets completion evidence for the selected story's actual obligations:
affected callers with different requirements, the intended preserved store and
predecessor, and required observations before dependent changes. Strengthen
these decisions now using existing guidance. Do not wait for a latest-release
recurrence or require a before/after agent benchmark to justify proceeding.

Use three Behavior slices because these decisions have distinct observable
results and can each be corrected and reviewed independently. Start with the
mixed-caller defect, the strongest evidence of escaped product behavior. Keep
one common model: identify the promise's actual boundary and prerequisites,
then carry them through existing proof ownership and acceptance. Identity,
domain purpose, and evidence timing are conditional aspects of that model,
not new registries, mandatory per-story sections, or separate workflows.

Exclude product fixes in the originating projects, automatic migrations,
unrelated consumer audits, universal baseline/full-suite requirements,
duplicate proof, a new verification skill, delegated-handoff changes, and
installation or release redesign. Do not change installed managed copies,
VERSION, CHANGELOG, or tags. Preserve valid evidence, human scope decisions,
and truthful handling of incomplete promises.

## Existing owners and constraints

| Existing solution | Decision for this work |
| --- | --- |
| [Proof ownership](../../../src/skills/dough-story-refinement/references/planning.md#own-executable-proof) | Extend this shared home with conditional boundary discovery and evidence prerequisites. Slice planning and execution already consume it; keep the rules here rather than copying them into each skill. |
| [PFE search](../../../src/skills/dough-pfe/SKILL.md#search-across-the-product) | Reuse its caller/domain analysis when applicable. It assesses existing solutions; do not create another product-wide inventory or rely on a method's dominant purpose. |
| [Slice planning](../../../src/skills/dough-slice-planning/SKILL.md#write-the-plan) | Reuse its source, scope, proof mapping, and links to the shared planning reference. Add a trigger link only if normal use otherwise misses the new conditional guidance. |
| [Execute the next slice](../../../src/skills/dough-execute-plan/SKILL.md#execute-the-next-slice) | Invoke the shared pre-change prerequisite rule before delegating dependent implementation, including resumed work. Preserve the existing claim, checkout, recovery, and delivery order. |
| [Accept proof](../../../src/skills/dough-execute-plan/references/wrap-up.md#accept-proof) | Preserve its inspected-boundary, missing-proof, and reuse rules. Carry the newly identified obligations through its existing input instead of adding another acceptance gate. |

These source reads establish reuse and placement choices, not observed runtime
effectiveness. Anticipated edits are the shared planning reference and execution
entry point; adjust existing links or overlapping prose only where needed for
the promised behavior. No new reference file or Structure slice is justified.

Follow [AGENTS.md](../../../AGENTS.md): edit shared `src/skills/` sources, retain
frontmatter and project-neutral runtime perspective, and review invocation,
required context, and useful behavior. Relevant current Accepted decisions,
confirmed against the [ADR index](../../../docs/adrs/README.md), are:

- [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md):
  respond to observed problems with proportionate changes and low process cost.
- [ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md):
  source edits do not constitute a released or installed correction.
- [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md):
  assess behavior and distinguish representative review, native acceptance,
  and integration evidence; do not infer one host's result from another's.
- [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md):
  keep one authoritative home per rule, actionable runtime language, and
  maintainer incident analysis outside runtime instructions.

No new architectural choice or North Star topic is required. This plan does not
resolve the separately recorded lifecycle/branching debate or change its policy.
Resolve actual execution location and delivery authority when execution starts.

## Proof and review contract

The stable outside-in boundary is the agent's normal planning or execution
decision and resulting plan/action/report, not the presence of prescribed words
in Markdown. Each slice owns the representative behavior review below, including
the relevant ordinary case that must avoid unnecessary work. Follow the normal
skill entry and linked reference path; confirm the necessary rule is reached
before its decision. A missing-input variant must identify the specific unknown
and stop only dependent work, leaving the scope choice with the human.

Use a small supplied story/plan and only the relevant caller, store, or baseline
evidence. Do not invoke actual production migrations or expensive client suites.
For a fresh acting-agent session, supply the ordinary task and evidence without
the finding, expected answer, or this plan's assessment rubric. Inspect resulting
artifacts and action order, not self-report alone. A manual walkthrough remains
labelled manual and does not count as fresh native execution.

Record each promise, candidate revision/diff, setup, normal entry path, observed
decision, and limitations in this plan's execution learnings. For executed
commands or native sessions retain literal invocation, inspected observation
locations, and result. No new permanent harness, registry, or exact-prose test is
needed. Review the final accumulated guidance for duplication and perspective;
reuse already sufficient slice observations unless subsequent edits invalidate
their boundary or invocation path.

| Story promise | Owning slice and observation |
| --- | --- |
| Distinct affected caller purposes, bounded investigation, equivalent-proof reuse | Slice 1: both caller obligations survive planning; equivalent purposes share evidence. |
| Preservation identity, no automatic scope expansion, honest claim | Slice 2: actual stores/predecessor are distinguished and the continuity result is not reported as migration. |
| Timely required evidence, safe missing-input stop, reuse and honest late recovery | Slice 3: baseline observation precedes dependent edits; reuse/reconstruction are assessed explicitly. |
| No extra ceremony; existing proof acceptance remains sufficient | Each slice's ordinary variant and final shared-rule review, with supported/unproved claims distinguished. |
| Finding response and attribution | Each slice updates only its corresponding catalog finding after delivery, preserving occurrence evidence and effectiveness limits. |

Each slice also owns reporting any missing Codex, Cursor, or Claude Code native
behavior acceptance for its changed requirement under ADR 0005. Reuse existing
integration evidence only where its mechanism and assumptions still match;
unchanged installation does not prove changed skill behavior. Conventional
source behavior review does not require routine per-tool discovery rechecks.
Missing native observations remain pending with this story/plan for release
assessment; neither this plan nor prior release exceptions waive them. They are
separate from later user evidence about recurrence. No release is selected here.

## Ordered slices

### 1. Preserve distinct requirements of affected callers
Type: Behavior
Status: planned

Behavior: Given storage/export retains trashed content and learning excludes it,
but both call one shared query, planning a change to that behavior identifies
both obligations before choosing the change and its proof. Equivalent caller
purposes may share evidence; the investigation follows affected production use
without expanding into unrelated consumers.

Change: Strengthen boundary discovery in the existing proof-ownership guidance.
Reuse available PFE analysis and connect each incompatible purpose to observable
proof. Do not prescribe uniform filtering, a per-call-site test, a new consumer
table, or another PFE workflow. Preserve existing mapping and acceptance rules.

Proof: Walk a small two-caller example where the query name and initial plan
describe only storage. The resulting obligations cover retained export content
and excluded learning content; observation of just one cannot close the other.
The equivalent-purpose variant reuses sufficient evidence without duplicate
tests. Unresolved domain purpose produces a precise question rather than a
guessed policy. This is one caller-coverage decision with boundary variants.

Delivery record: Update ODF-045's response with the actual source correction and
review evidence after delivery; retain the original occurrence and unverified
real-use effectiveness. Safe stop: caller coverage is useful independently of
the remaining two corrections.

### 2. Bind preservation claims to the intended store and predecessor
Type: Behavior
Status: planned

Behavior: Given A→B preserves a Docker volume while the owner's native data is
elsewhere, preservation planning identifies installation/store identity and the
predecessor relationship. Its obligations and completion claim distinguish
continuity from migration; a conflict between intended target and deferred
migration is surfaced before dependent work rather than silently resolved.

Change: Extend the same boundary-discovery rule with the conditional preservation
case. Use project-supplied identities and scope. Keep the shared acceptance rule
authoritative; do not add automatic migration or mandatory store fields to every
story template.

Proof: Walk the two-store example through planning and acceptance with supplied
volume-continuity evidence. The result names what was preserved and leaves the
native transfer outside that claim. Missing intended-store identity stops the
dependent claim for clarification. The ordinary one-store case reuses matching
continuity evidence without inventing another predecessor or migration task.

Delivery record: Update ODF-028 after delivery with the bounded correction,
recoverable references, and effectiveness limit. Safe stop: preservation claims
are precise even before the evidence-timing correction is implemented.

### 3. Obtain required observations before dependent implementation
Type: Behavior
Status: planned

Behavior: Given an accepted optimization plan requires a baseline before a
particular change, execution verifies or obtains that evidence before dispatching
the change. Missing or failed prerequisites stop that dependent path. Adequate
existing evidence can be reused; work unrelated to the observation can continue.

Change: State the temporal prerequisite beside shared proof ownership and invoke
it from the existing next-slice boundary before implementation delegation. Apply
it to initial and resumed execution without a new startup audit or repeated
recovery read. Retain revision, relevant environment/selection, observation, and
dependent-change identity in existing plan/conversation evidence.

Proof: Walk a tiny optimization plan with an explicit baseline command and an
observable implementation action. Without accepted baseline evidence, the action
must not occur first, including on resume. Failed/unavailable baseline names the
gap; an adequate retained baseline permits proceeding without another run. A
late-recovery variant permits a labelled reconstructed comparison only when
revision and relevant conditions are demonstrably comparable; otherwise the
speedup remains unproved. An ordinary story with no pre-change observation
requirement proceeds without adding a benchmark or full-suite run.

Delivery record: Update ODF-041 after delivery, distinguishing timely prevention
from late recovery and preserving the original successful recovery evidence.
Safe stop: this completes the third promised decision behavior; completion still
requires the normal proof, refactoring, delivery, and review obligations.

## Execution checks and current assessment

No numeric slice budget was supplied. Each slice has one decision outcome and
focused review, with implementation and cleanup included. There is no hidden
infrastructure preparation, provisional state, or later cleanup slice. The final
design stays in existing shared rules and their entry links; three examples do
not justify three separate rule systems.

During authorized execution, use the existing independent post-change-refactor,
owned-file delivery, and asynchronous CI-repair workflow. Resolve the then-current
hook and selective formatting contract before delivery. At planning time no
local pre-commit hook or custom hooks path was configured, and `scripts/lint.mjs`
formats JS/JSON/shell rather than Markdown; do not run a repository-wide formatter
to manufacture a Markdown check. Use `git diff --check` plus relative-link/anchor
and behavior review for these prose changes. Add focused functional checks only
if execution actually changes a maintained mechanism; no such change is planned.

Current concern: Slice 3 must reach the prerequisite check before dispatch in
both initial and resumed execution. A rule added only at final proof acceptance
would miss its outcome. The normal-entry walkthrough above owns that proof.
Native-session feasibility and real-use effectiveness remain unestablished; no
passing result is claimed. No other slice-specific concern was identified in
this planning assessment.

## Execution learnings

None yet. Retain decisions and accepted evidence here when execution occurs.
