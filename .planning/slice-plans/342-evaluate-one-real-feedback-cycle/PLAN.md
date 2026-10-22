# Judge one real feedback cycle against the proposed definition of improvement

**Identity:** SEED-010#prioritize-responses-with-delegated-authority
**Source:** [Selected story](../../seeds/SEED-010-learn-from-execution-retrospectives.md#prioritize-responses-with-delegated-authority)

## Goal and scope

Give the maintainer one evidence-linked retain, adjust, simplify, revert or
inconclusive judgment about the delivered combined feedback cycle, from one
observed run in ordinary use, using
[Proposed ADR 0010](../../../docs/adrs/0010-definition-of-improvement.md) as
the trial decision basis, and a separate recommendation on that ADR through
the advice process.

The observed run is fixed by the story: the first combined cycle after the
2026-10-21 review, due on 2026-10-22 under the watch list's due block, whether
the dashboard starts it under Story 9's standing authorization or the
maintainer starts it by hand. This story reads that run's records and runs no
cycle of its own.

Included: the decision basis written before the run's result is read, or
dated and labelled exploratory when the result came first; the trace of each
selected, declined and no-change candidate to its evidence, frequency,
relevance, direction and existing work, answering whether a project-owned
product improvement was considered without a further human request; the
follow-through of ODF-139's 0.3.67 successor, or another relevant earlier
response, through adoption and available eligible use; the cost table with
measured host usage, wall-clock, active human effort and publication work,
unknowns marked; the human-intervention assessment with distinct events, the
two ADR 0010 rates with named numerators and denominators, pending events and
interruption costs; the coverage disposition of Terry Talks and Lizard within
existing authority or the exact owner decision; the judgment with next
observation; and the ADR 0010 recommendation.

Excluded, as the story defers: running, repeating or scheduling a cycle;
implementing, releasing or rolling out any selected response; accepting,
revising or rejecting ADR 0010; any ledger, measurement platform, token
counter, scoring rule or dashboard view; changes to the maintenance skills,
their limits or authority; writes to any client repository; finding changes
beyond dispositions existing authority already allows; and any claim of
sustained target attainment, a general productivity rate or a matched
comparison with the manual cycles.

Assumptions: the production dashboard's feedback-maintenance setting is on
for Claude Code, so the run may start without the maintainer; the host
retains the session record with per-message usage; the cycle publishes its
result to each maintained project's trunk and reports completion through the
installed reporting command; and the research report remains the home of the
maintainer's bounded assessments.

## Existing solutions and architectural direction

PFE: the research report already hosts the maintainer's bounded assessments
in the compact follow-up form that plans 340 and the 21 October follow-ups
set, carries the
[decision-oriented measures](../../../docs/maintainer/empirical-process-control-research.md#a-small-set-of-decision-oriented-measures)
and the
[intervention assessment method](../../../docs/maintainer/empirical-process-control-research.md#assess-human-intervention-quality)
this story applies, and links the ADR. [ODF-139](../../../docs/maintainer/findings/ODF-139.md)
owns the successor's next observation and its recording rules. The shared
phase's [retention and watch](../../../.agents/skills/collect-client-feedback/references/retention-and-watch.md)
defines what a passed watch needs, so coverage gaps are judged by its rule.
The dashboard's launch records, completion receipts and the host's session
record are the cycle's evidence; nothing new records it. Reuse all of them;
no new record, registry or measurement mechanism is needed.

[ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
asks for value and low-cost change over a single cost metric and for
mechanisms to justify their burden. [ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
keeps implementation, release and adoption distinct: the successor's first
release and each project's adoption commit fix exposure. [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
keeps the observed run's native evidence distinct from controlled proof and
retains compact findings rather than raw artifacts. [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
keeps this analysis in maintainer records. [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture.md)
keeps launch and completion records machine-local: they are read on this
machine and summarized, never copied into the repository. Proposed
[ADR 0010](../../../docs/adrs/0010-definition-of-improvement.md) is used as a
trial basis only; this plan accepts nothing. The ADR index agrees with these
statuses. The [North Star](../../NORTH-STAR.md) topics concern the dashboard
and launches; this assessment adds no direction there and needs no exception.

## Preparation observations and decisive premises

Observed read-only on 2026-10-22 in the established preparation checkout
`/Users/terryyin/git/open-dough/.worktrees/evaluate-one-real-feedback-cycle`
at `360f3025c7248602cafcb7649771807659401380`. No production dashboard,
native host, cycle or project write ran.

| Premise / consuming operation | Literal observation | Result and limit |
| --- | --- | --- |
| The observed run is identifiable and has not yet completed. | `git fetch origin main; git show origin/main:docs/maintainer/near-term-watch-list.md \| sed -n '3,5p'`; Python over `~/.open-dough/dashboard/agent-launches.json` counting records whose request carries `maintenance` or the cycle's invocation; `cat ~/.open-dough/dashboard/feedback-maintenance.json` | Due block `{"reviewed":"2026-10-21","reviewAfter":"2026-10-22"}` on trunk; zero maintenance launches recorded in any project; setting `{"host":"claude","model":"opus"}`. The run due today has not started on this machine at this observation. Slice 1 can therefore precede the result if execution starts before the run completes; slice 1 handles the other case by labelling. |
| The manual cycles' records are recoverable as qualified context. | `git log origin/main --since=2026-10-19T12:00 --until=2026-10-21T09:00 --author='Terry Yin' --format='%h %ad %s' --date=iso` | October 20: `327b6fa2` (08:36:50 +0900), `dbe36711`, `a2be7e50` (08:45:09). October 21: `77f9c3f6` (07:59:47), `341293c0`, `b590ebeb`, `c361dbb8` (08:11:07). Commit times bound each cycle's publication span; prompts and usage for those runs are not in the repository. |
| The observed run's cost evidence exists on this host. | `ls ~/.open-dough/dashboard/` (`agent-launches.json`, `launch-attempts.json`, `reporting/<reference>/`); `grep -n writeFile ~/.open-dough/dashboard/reporting/a4ba7536-d974-496b-baab-c095cc891a93/dashboard-completion.mjs`; `grep -o '"usage":{[^}]*}' <latest ~/.claude/projects/-Users-terryyin-git-open-dough/*.jsonl> \| head -2` | Launch records are keyed by project with request, session (`sessionId`) and reporting fields; a completion is retained as `completion-<delivery>.json` beside the reporting executable; the Claude Code session record carries per-message `usage` with `input_tokens`, `cache_creation_input_tokens`, `cache_read_input_tokens` and `output_tokens`. Presence of the shape; the observed run's own records exist only after it runs, which slice 2 requires. Monetary cost and active human time are not recorded by the host. |
| ODF-139's successor is released and adopted, so eligible use is possible. | `git tag --contains 9e6caaae \| sort -V \| head -1`; `git -C ~/git/pygardon log -1 --format='%h %ad %s' --date=short -- .agents/skills`; same for `~/git/doughnut` | `v0.3.67`; Pygardon `47f697ad5` and Doughnut `51789e1054` carry "Update Open Dough guidance to 0.3.68" on 2026-10-22; Open Dough adopted 0.3.67 at `cdcc2633`. Adoption only; whether any ordinary named-gap acceptance occurred by the observed run is what slice 2 reads from the logs. |
| Terry Talks and Lizard are configured but have no findings record. | `cat ~/.open-dough/dashboard/projects-production.json`; `ls ~/git/terry-talks/DearDough.md ~/git/lizard/DearDough.md ~/git/terry-talks/.planning ~/git/lizard/.planning` | Both are listed with `ref: master` and a backlog path; neither has `DearDough.md` or `.planning/open-dough.json`; both have `.planning/PRODUCT-BACKLOG.md`. The gap the story names is current; slice 2 disposes of it within existing authority or names the owner decision. |
| The research report takes a follow-up with the assessment method and ADR links. | `grep -n '^## \|^### ' docs/maintainer/empirical-process-control-research.md`; `grep -n '<a id=' docs/maintainer/empirical-process-control-research.md` | Headings `### Assess human intervention quality` and the follow-up anchors (`preparation-history-follow-up`, `landing-history-follow-up`, `later-product-consequences-follow-up`) exist; the new sections follow that convention. |
| Local proof for an analysis-only change. | `ls scripts/`; plan 340's accepted proof | No dedicated link checker exists; plan 340 proved its follow-up with a relative Markdown link check over the changed section, `git diff --check` and `npm run lint`. The same route applies. |

No premise needs a paid or owner-held observation before `ready`. The observed
run itself is Story 9's slice 5 and the maintainer's; its completion is an
external wait that gates slice 2's start, not a premise of this plan's
approach.

## Outside-in proof ownership

| Story example | Proof and owner |
| --- | --- |
| 1: basis set before the result; 2: result preceded the basis | Slice 1: the research report section names the observed run and the eight basis fields, its date, and whether the run's result existed when it was written; a relative link check and `git diff --check` pass. |
| 3: selections traced; the further-request question answered | Slice 2: each selected, declined and no-change candidate in the follow-up links to a finding record, a distinct-execution count, direction text and any covering story; the follow-up states the answer with its evidence; `git diff --stat` on the landed result shows no new story, finding or backlog entry from this execution. |
| 4: previous response followed through or its exposure limit recorded | Slice 2: ODF-139's record gains either the first ordinary named-gap acceptance with its fields or the exposure limit and next discriminating observation; its watch status is unchanged by silence. |
| 5: cost table with unknowns | Slice 2: one table in the follow-up with the four token columns from the session record, wall-clock from the launch record to the last accepted publication, prompt-derived human effort, publication and correction work, and this evaluation's own burden; absent measurements read unknown. |
| 6: intervention events and the two rates | Slice 2: the event table lists each distinct decision event with its four judgments; both rates appear with named numerators and denominators or as not assessable; repeated prompts appear as cost, not events. |
| 7: coverage disposition | Slice 2: the follow-up and, where authority allows, the watch list record Terry Talks' and Lizard's disposition or the exact owner decision; no watch passes and no finding or backlog item is added for them. |
| 8: judgment, next observation and ADR advice; rerun adds nothing | Slice 2: the follow-up ends with one judgment, counterevidence, a next observation only where supported, and a separate ADR 0010 recommendation naming Terry as the decision owner; a second reading of the same records yields no change. |

## Ordered slices

### 1. The decision basis is fixed before the observed run's result is read
Type: Behavior
Status: done
Proof: The research report gains a dated section for this story that names
the observed run (the cycle due 2026-10-22 under the trunk due block) and
states its beneficiary, intended gain, comparison with the October 20 and 21
cycles as qualified context, result worth keeping, quality and authority
constraints, costs that could outweigh the benefit, and later exposure
needed; it states whether the run's result existed when the section was
written and labels the coming judgment exploratory when it did. A relative
Markdown link check over the section and `git diff --check` pass.

Behavior: Given the trunk due block and the proposed ADR, when this story's
execution begins → the research report records the basis before any result
of the observed run is read, or records that the result came first.

Safe stopping point: the basis stands alone as ADR 0010's first field-by-field
use; if the observed run has not completed when this slice is accepted,
execution stops here and records what it waits for in Learnings. No cycle is
started for this story.

### 2. The observed run is judged from its records
Type: Behavior
Status: done
Proof: A maintainer can trace every claim in the follow-up to a named launch
record, completion receipt, session record locator, commit, finding record,
release tag or prompt, reproduce the read-only observations, and read the
judgment, the two rates with their counts, the cost table, the coverage
disposition and the ADR recommendation without mistaking silence, missing
exposure or unmeasured cost for success. Proof commands: the relative link
check over the changed sections, `git diff --check`, and `npm run lint`.

Behavior: Given the observed run's completion receipt, launch record, session
record and accepted publications in each maintained project, when the
maintainer evaluates the run against the recorded basis → the research
report gains one compact follow-up with the selection traces, the previous
response's follow-through or exposure limit, the cost table, the intervention
assessment, the coverage disposition, the judgment with its next observation,
and the ADR 0010 recommendation; ODF-139's record and, within existing
authority, the watch list carry the dispositions that belong to them.

Pre-condition: the observed run has completed and its report exists. If it
has not when this slice is reached, do not start it; the execution stops at
slice 1's safe stopping point. Read the original evidence before the cycle's
own report; keep observations, causal hypotheses and recommendations
distinct; count each decision event once in each applicable denominator; use
execution-time guidance (0.3.68) when judging the run and current guidance
when recommending. Change no client repository and no finding beyond the
dispositions existing authority allows; a supported adaptation is advice
naming its owner. Perform the execution workflow's post-change refactoring
and delivery gates. If execution finds that a runtime change is necessary to
fulfil this outcome, stop and revisit scope instead of adding implementation.

## Execution complete

Product advice: no backlog change. The evaluation judges the 2026-10-22 cycle
retain (exploratory, low confidence) and recommends revising and further
trialling Proposed ADR 0010; that decision stays with Terry through the advice
process. The bounded next observation (stop recommendations and open
next-observation requests) belongs to the maintainer at the next combined
cycle after 2026-10-29. Story 11 keeps its queue position: one run supplies
no evidence to advance or drop it.

## Current decisions

- Two Behavior slices: ADR 0010 asks for the basis before the evidence is
  judged, and the basis is useful alone, so it is slice 1; the judgment is one
  evidence-to-decision proof loop with no independently useful part and no
  Structure. No supplied numeric slice target or hard limit was found, so none
  is invented.
- The observed run is fixed by the due block, not chosen at execution; a later
  run is not substituted once the basis names it.
- The run's completion is an external wait, not this story's work: Story 9's
  slice 5 and the maintainer own it. Execution reaching slice 2 before the
  run completes stops at the safe stopping point.
- Host and client records are read-only inputs; the follow-up retains compact
  conclusions and locators, never copies of session records.
- Preparation authorizes no execution. The eventual execution instruction
  owns the assessment and its ordinary delivery.

## Learnings

- The observed run already existed when execution began: the dashboard's
  feedback-maintenance launch at 2026-10-21T23:46:55Z, done
  2026-10-22T00:09:14Z, after preparation's 08:37 +0900 observation and before
  the Take `a00e6a77` (17:21:29 +0900). Slice 1 therefore recorded the basis as
  set afterwards and labelled the judgment exploratory (story example 2). Only
  that launch record's timestamps were read before the basis was written; the
  watch list's changed due block was seen during slice 1's link check, after
  the basis text existed.

## Acceptance evidence

Slice 1 — source-only review: a fresh general-purpose agent received only the
selected story's Goal, Scope, deferred promises, key examples and Evaluation
text, read no files, and returned 56 commitments and 18 exclusions (this
session's subagent hand-back, 2026-10-22). Comparison for slice 1's promises:

| Source commitment | Expected | Actual (research report, `#feedback-cycle-evaluation-follow-up`) | Disposition |
| --- | --- | --- | --- |
| Run, project set, guidance revisions, authority, evaluation questions before judging | All five stated | First return lacked project set, guidance revisions and explicit questions; added from `projects-production.json`, each project's last `.agents/skills` commit before launch and trunk `2443059d` | proved after correction |
| Result first → basis set afterwards, judgment exploratory (example 2) | Date set and ordering stated | "Set 22 October 2026, after the observed run had completed; the judgment below is exploratory", with launch/done times and Take time | proved |
| Basis names the run; no later substitution | Named and fixed | Launch named; "No later run replaces it." | proved |
| Eight ADR fields (example 1 values) | Each stated | Beneficiary, intended gain, comparison with `327b6fa2`–`a2be7e50` and `77f9c3f6`–`c361dbb8` as qualified context, result worth keeping, quality and authority constraints, outweighing costs, later exposure | proved |
| Later criteria changes recorded openly; consequential tradeoffs to the maintainer | Stated | Closing paragraph added after review | proved after correction |
| Bounded trial; ADR not accepted | Stated | Section preamble | proved |

Slice 2 — the same source-only return, compared with the follow-up's sections
after `### Decision basis`, ODF-139's new section and the actual records:

| Source commitment | Expected | Actual | Disposition |
| --- | --- | --- | --- |
| Evidence: launch record, completion receipt, session record, commits per project, prompts | All read, original before report | `### Evidence read` lists all five, receipts read last | proved |
| Product and process value; trace selected, declined, missed to evidence, importance, frequency, direction, existing work (example 3) | Table per candidate | Local and shared tables; ODF-323 named as unexplained ranking; no story or finding created | proved |
| Further-request question tested, not forced | Answer with evidence | "Yes, but the question was not exercised", with reason | proved |
| Source-backed risks distinct from incidents | Stated | First return omitted it; DD-318 row now says source-backed risk | proved after correction |
| Justified no-change, defer, evidence requests valid | Counted | DD-320 and watch decisions counted valid | proved |
| Follow at least one earlier response; ODF-139 preferred (example 4) | Acceptance fields or exposure limit | Plan 335 first eligible acceptance with story review, dispositions, correction rounds; intervention and usage unknown; Pygardon and Doughnut not reviewed; watch unchanged | proved |
| Cost table with four token columns, wall-clock, human effort, publication and correction, unknowns, own burden (example 5) | One table plus burden | `### Cost` table; money and active time unknown; preparation and execution usage listed | proved |
| Intervention events: decision, why, authority, value; both rates; stopped and non-stopped; severity; coverage; pending; interruption cost (example 6) | Event table and named counts | H1, H2, A1–A6; 1/1 stops (2/2 events) and 0/2; severity and coverage added after review; no target claim | proved after correction |
| Coverage per project; Terry Talks and Lizard disposition (example 7) | Status and disposition or owner decision | Status table; owner decision `552b2134` and change `9848f274`; no watch passes; nothing added | proved |
| One judgment with decisions, misses, quality, cost, burden; bounded next observation; separate ADR recommendation leaving acceptance to Terry; rerun adds nothing (example 8) | All present | Retain, exploratory; next observation with owner; Revise and trial further; idempotence sentence | proved |
| Exclusions: no cycle run, no implementation, no ADR decision, no ledger, no skill or client change, no finding change beyond allowed dispositions | Respected | Only the research report, ODF-139's observation (story example 4) and this plan changed | proved |

## Plan concern review

Slice-plan refinement was not needed: each slice has one outcome and one
proof loop, slice 1's result is useful on its own, and slice 2's only
dependency is the external completion of the observed run, which the plan
names as its pre-condition and safe stop. This review identified no remaining
slice-specific concern. Every record the plan names was reached read-only in
preparation except the observed run's own records, which exist only after it
runs; their absence at execution is the named wait, not an evidence gap.
