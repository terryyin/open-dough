# Learn directly from preparation history

**Identity:** SEED-010#learn-from-preparation-history
**Source:** [Selected story](../../seeds/SEED-010-learn-from-execution-retrospectives.md#learn-from-preparation-history)

## Goal and scope

Give the developer one evidence-linked assessment of what reviewing direct
preparation history adds to reading its final artifacts, and whether that
insight warrants the extra effort. A useful practice or reasoned no-change is
as valid as a supported problem. Do not force an improvement finding.

Review the October 20 preparation of
`SEED-010#observe-retrospective-response-effectiveness`, coordinator session
`01a157a5-1cdf-7611-94b3-8c1236961e4f`. Bound the process assessment from the
refinement instruction at `2026-10-20T04:50:03.769Z` through the readiness/landing
handoff at `2026-10-20T04:54:42.797Z`. The landed artifacts at
`ce6355980971225a1b9bf26ee7a935fc432f5636` corroborate the preparation result;
subsequent landing, execution and closure are not additional reviewed journeys.
Relevant sub-agent evidence is included only where a selected conclusion needs
it and it can be recovered. State coverage gaps explicitly.

Write the compact assessment as a preparation-history follow-up in
[the existing research report](../../../docs/maintainer/empirical-process-control-research.md).
Record any supported finding/practice in `DearDough.md` under the existing
recording contract. Retain source identities and decisive locators, not raw
transcript copies or a new report/ledger. Leave the sample's completed story
closed. No runtime guidance, automation, host adapter, product backlog, release,
installation, or other repository changes are in scope. Resulting remedies are
recommendations, not implementation authority.

## Existing solution and architectural direction

PFE: reuse the retrospective's
[process analysis](../../../src/skills/dough-execution-retrospective/SKILL.md#review-process-only-from-a-real-record)
and [finding recorder](../../../src/skills/dough-execution-retrospective/references/process-finding-recording.md),
without invoking its execution-recovery, implementation-review or correction-plan
branches. The present plan explicitly selects this process assessment. It is
not an automatic hook into preparation or a new review mode to distribute.
The existing record-reference fallback supports a preparation without an
implementation commit; use the coordinator session plus story and interval as
its stable reference. Reuse an existing logged identity if one is already tied
to that preparation. Do not count rereviews or its later execution as new
preparation occurrences.

The seed compares the existing final-plan review, this bounded manual experiment,
and automated boundary reviews. Its borrowed SRE mechanism retains the evidence
available at each decision, then compares later results. Treat this as a method
hypothesis: there is no assumption that it must outperform artifact review.

Follow [AGENTS.md](../../../AGENTS.md),
[ADR 0002 — lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
for proportionate learning and one representation,
[ADR 0005 — cross-tool validation](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
for history limits and retained findings, and
[ADR 0006 — write skills for executing agents](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
for reuse of one behavioral owner. This local assessment changes no published
skill and requires no new native host acceptance. The existing
[North Star](../../NORTH-STAR.md) governs dashboard/start responsibilities and
adds no review requirement here. No new North Star topic or ADR exception is
needed.

## Preparation observations and decisive premises

Observations were made in the established preparation checkout
`/Users/terryyin/git/open-dough/.worktrees/learn-directly-from-preparation-history`
on October 21, 2026, at base `ac8a5c01670863194505e53ba1835d6b94c940a3`.
These settle source recovery, not the future assessment's conclusions.

- `git show ce635598:.planning/slice-plans/328-observe-retrospective-response-effectiveness/PLAN.md`
  recovered the actual final plan: one bounded evaluation, the selected response
  version, explicit uncertainty, and its stated learning that the research
  snapshot was stale. This is the artifact-only comparison input, not proof of
  why the planner made those choices.
- The literal read below decoded the coordinator's actual prompt, messages and
  tool outputs, not just a session listing. Session metadata matches the story's
  workspace. Lines 62 and 71 contain the older research description and the
  current finding evidence; line 78 (`04:50:54.222Z`) records the decision to keep
  response versions distinct. Line 218 is the selected interval's final handoff.
  Some tool outputs were already truncated at capture. Do not reconstruct their
  missing contents or assume sub-agent internals from coordinator summaries.

```sh
python3 - <<'PY_HISTORY'
import json
from pathlib import Path
source = Path('/Users/terryyin/.codex/sessions/2026/10/20/rollout-2026-10-20T13-50-01-01a157a5-1cdf-7611-94b3-8c1236961e4f.jsonl')
for number, line in enumerate(source.open(), 1):
    event = json.loads(line)
    payload = event.get('payload', {})
    if event.get('type') == 'response_item' and payload.get('type') in (
        'message', 'function_call_output', 'custom_tool_call_output'
    ):
        if number <= 218:
            print(number, event.get('timestamp'), json.dumps(payload, ensure_ascii=False))
PY_HISTORY
```

The source is machine-local, not a portable product dependency. Execute the
same read in the later execution checkout before relying on access. If it is
then unavailable, retain the supported artifact comparison and report the
missing direct-history claim; do not silently substitute another sample or
claim a complete direct review. Access to history in all hosts and review
benefit are not premises of this bounded plan. No product commands, credentialed
observations or paid sessions are needed.

## Outside-in proof ownership

All final-state promises belong to slice 1. Evaluate the assessment against the
source events and story, not by counting headings, keywords or findings.

| Promise / example | Observable proof in the delivered assessment |
| --- | --- |
| Direct evidence changes, qualifies, or confirms the artifact-only interpretation (example 1) | Separate the final-plan account from the event-supported account; cite the original instruction, decision-relevant observations, decision and resulting artifact. State the actual increment in insight, including none. |
| Fair attribution using contemporaneous knowledge (example 2) | For each judged decision, separate known information, unresolved uncertainty, later discovery and inferred effect. Unsupported claims of avoidable work remain hypotheses; finding no defect is allowed. |
| Missing, omitted, outside-interval and stopped work remain distinct (example 3) | Name actual coverage gaps. Walk a deliberately restricted view of the same source and a clearly labelled illustrative stop/omission boundary: unavailable evidence produces a limited claim, an explicit omission is attributed to its instruction, and a stop does not require execution completion. These are reasoning controls, not additional historical occurrences. |
| Findings use the existing identity and recording rules (example 4) | When a supported finding exists, compare its candidate occurrence with any prior same-record entry; reread the same evidence and show that it produces no second row. With decisive new evidence, enrich the original. With no supported finding, leave the log unchanged. Missing identity/tool facts prevent a countable row, not supported analysis. |
| Useful outcome and added effort (example 5) | State finding/practice/no-change, its evidence and limits, available retrieval/read/reconstruction/recording effort, and a bounded retain/adjust/forego recommendation with a next discriminating observation. Do not infer token savings or general effectiveness. |
| Bounded scope and durable ownership | The existing report owns the assessment, the process log owns any supported occurrences, raw history remains in its source, no sample story is reopened and no remedy is implemented. |

## Ordered slices

### 1. Judge what direct history adds to one preparation review

Type: Behavior
Status: done
Proof: Evidence review of the assessment and any finding edits against every
row above, verification of cited historical sources/links, and `git diff --check`.

Behavior: Given the selected real preparation record and its final artifacts,
when the developer requests the bounded review, they receive a traceable
finding, useful practice or reasoned no-change conclusion that distinguishes
what was known then from later learning and compares added insight with review
burden. Missing evidence limits the dependent conclusion rather than becoming
success or failure by assumption.

Read the final artifacts to establish their supported account, then trace the
consequential decisions through the selected direct-history interval. This is
an explicit comparison, not a claim of a blinded experiment: preparation has
already inspected part of that record. Read relevant original instructions and
tool results before evaluating reported choices. Recover sub-agent evidence
only if needed for a selected claim; otherwise qualify the boundary. Apply the
reasoning controls above without writing synthetic occurrences. Write the
compact report conclusion and record only supported findings/practices through
the existing recorder's matching, bounded-retention and write-location rules.
Do not execute general findings maintenance by reading those rules.

Keep gathering, interpretation, recording and the effort comparison in this
one slice: separating them leaves no independently useful assessment. One
sample and one decision loop bound the work; there is no supplied numeric slice
limit or external wait. If evidence suggests a runtime change or another sample,
report it as advice rather than enlarging this execution. Missing essential
history leaves the direct-review promise incomplete with its precise recovery
need; acknowledging the gap alone does not fulfill that promise.

## Current decisions and execution gates

- This plan authorizes no execution now. A later explicit execution instruction
  uses the normal Take, independent post-change refactor, focused proof,
  delivery and retrospective workflow. This project's process-review setting is
  enabled; that execution's retrospective is distinct from the selected historical
  preparation and must not double-count it.
- No automated test is required merely to edit the assessment. Its proof is
  semantic review against the actual history, followed by changed-file formatting
  and the repository commit hook. No runtime, installer or host integration
  boundary changes; unrelated suites and new native sessions are not local gates.
- The source record's original timestamps, tool and release evidence govern
  finding metadata. The date of this review and today's installed version do
  not substitute for unknown historical facts.
- Slice-plan refinement was not needed: the single outcome has one proof loop,
  all story promises are mapped, and no hidden implementation or independent
  second result remains. No slice-specific concern was identified. The recorder
  owns the separate readiness judgment.

## Learnings

The coordinator record exposes the order in which the older summary, current
finding and version-selection decision were encountered. The final plan also
retains the stale-summary learning. Therefore direct access is feasible, but
added value over artifact inspection remains to be evaluated; a finding is not
presupposed by the plan.

Execution (2026-10-21): direct history qualified/confirmed the artifact-only account; reasoned no-change, DearDough.md unchanged. See the preparation-history follow-up in the research report.
