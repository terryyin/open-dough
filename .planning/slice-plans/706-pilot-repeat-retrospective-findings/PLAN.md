# Pilot when a repeat adds useful retrospective evidence

**Source:** [Pilot when a repeat adds useful retrospective evidence](../../seeds/SEED-401-retrospective-finding-pilots.md#pilot-repeat-retrospective-findings)
**Source review:** [Source-only commitments](source-review.md)
**Identity:** SEED-401#pilot-repeat-retrospective-findings

## Goal and scope

Terry gets a keep or revise decision on one recording choice in Doughnut and Pygardon: a repeat that teaches something gets a full row, and any other repeat leaves one line naming its execution. The trial lives in one removable paragraph of each project's `AGENTS.md`. The distributed recording rule, the collector and the other clients stay as they are and provide the baseline. The [sibling pilot](../../seeds/SEED-401-retrospective-finding-pilots.md#assess-new-retrospective-findings-pilot) owns first reports. Promotion into the distributed rule is a later story, queued only on keep.

## Trial paragraph

Slice 1 retained the prepared wording. Slice 2 clarified when repeated high cost warrants a full row.

```markdown
### Trial: record what a repeat teaches

Open Dough pilot SEED-401; remove when the pilot closes. When a retrospective
matches a finding from a new execution, ask what this occurrence teaches that
could change the next action. Write the full occurrence row when it shows a
material new effect, a cost that changes priority, a newly affected workflow, a
corrected attribution, or, where the entry names an adopted response, that
response working or failing in this execution. Write a full row when a
previously isolated high cost recurs in another execution, even if each
occurrence costs about the same. Otherwise add one line under the finding:
`- Execution: <identity> · <timestamp> · <tool> · release <version>`.
If you cannot tell, write the full row. The rest of the recording rule applies
unchanged.
```

## Decisive premises

Observed on 18 November 2026 at preparation revision `3d3db9851`, read-only in the production checkouts `~/git/doughnut` (`a23441f741`) and `~/git/pygardon` (`7da34fc73`).

| Decision | Observation and result |
| --- | --- |
| Five ordinary executions per project are likely to include a repeat | `git log --since=2026-10-01 -- DearDough.md`, counting added `- Execution:` lines and added `## DD-`/`## ODF-` headings in commits that delete nothing: Doughnut 215 rows and 111 headings across 104 commits, Pygardon 472 and 186 across 234. About half of the rows went to existing findings. Maintenance and merge commits were excluded by diff shape only, so the share is approximate. A sample without a repeat leaves effectiveness open under the seed's decision. |
| The reviewer judges “new” against a short summary | Counting `- Execution:` lines per `## ` heading in each current `DearDough.md`: 76 of Doughnut's 92 entries and 145 of Pygardon's 162 hold no row. Entries such as Doughnut ODF-267 read “One 0.3.60 execution” with a link to the shared record. Slice 2 observes whether a fresh reader can decide from that summary. |
| A project paragraph reaches the retrospective reviewer on both hosts | Both projects keep always-on guidance in `AGENTS.md`, and each `CLAUDE.md` points Claude Code to it. Each has carried private process rules there, last changed in Pygardon `46e6443d2` and Doughnut `f9c03e11de`. This shows presence. Slice 3's scratch walk in each project is the observation of the paragraph changing what is recorded. |
| The collector still counts a one-line entry as a distinct execution | Its [step 3](../../../.agents/skills/collect-client-feedback/SKILL.md#collect-reconcile-and-adopt) uses project plus execution identity, and its response-observation step uses the execution's release. Slice 2 checks the count on the candidate output. |

## Ordered slices

### 1. The comparison is fixed before any run

Type: Structure
Status: done

Add a dated follow-up section to the [evaluation record](../../../docs/maintainer/empirical-process-control-research.md) with the decision basis under [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md): beneficiaries, intended gain, comparison with current practice, and the keep and revise criteria from the story. Name the counts to report: decisions changed, consequential misses, repeat narratives reaching triage, and writer and reviewer effort with active time, elapsed time and tokens kept apart. Settle the trial paragraph. Build the replay set from the story's three case groups at their pinned revisions, at most six occurrences per group. Include the ODF-200 publication, both ODF-325 launches, the Pygardon DD-136 and Doughnut DD-202 recurrences, the Pygardon 0.3.76 recurrence of ODF-264 and the Lizard move. For each occurrence keep the finding entry as it stood before that execution and the evidence the execution had. Keep later corrections and retirements in a separate answer note. The set stays with this plan until wrap-up. This enables slice 2's replay.

**Proof.** The basis section precedes any replay output in history. Each replay input opens at its pinned revision and contains nothing dated after its execution.

The [comparison basis](../../../docs/maintainer/empirical-process-control-research.md#repeat-finding-recording-pilot-2026-11-18) is fixed against the recording rule at the established take revision. Both readers use [the same historical inputs](replay-inputs.md). The coordinator alone uses the [answer and source note](replay-answer.md) after both readers have recorded their decisions.

**Accepted proof.** The pin and cutoff check opened all 13 starting snapshots, checked the recorded events and held the later judgments out of the reader packet. The comparison and its decision criteria precede the replay. The first ODF-325 launch predates the Clipboard deviations, so it enters as a first report. Group C includes a matched repeat from 0.3.66 with no adopted response in the earlier entry. Whitespace passed. Records-only delivery.

### 2. The same history shows what each wording records

Type: Behavior
Status: done

Two fresh readers each walk [process-finding recording](../../../Distribution/src/skills/dough-execution-retrospective/references/process-finding-recording.md) over the replay set in scratch logs, one with the current rule and one with the trial paragraph added. Neither sees the answer note. Compare the two logs against it: which occurrences received a full row or one line, whether each safeguard occurrence kept its consequence, whether the moved evidence added nothing, and each reader's reported tokens and elapsed time. A third fresh reader applies the collector's step 3 to the candidate log and counts distinct executions. Record the comparison in the evaluation section as exploratory. If the trial wording loses a safeguard, revise the paragraph once and rerun the affected group. A second loss stops for Terry with the comparison.

**Proof.** The evaluation section shows both logs' outcomes per occurrence and the collector count, and a rerun of either reader on its own output leaves that log byte-identical.

Both readers received the same [allocation facts from the pinned snapshots](replay-snapshot-allocation.md) after their initial read and before recording their final results.

**Accepted proof.** The [exploratory replay](../../../docs/maintainer/empirical-process-control-research.md#exploratory-historical-replay) records each case's starting evidence and outcome. The first trial lost the second high-cost incident in A6. One wording revision recovered it in the Group A rerun. Both compact rows counted toward 13 distinct identities, including one previously recorded Lizard execution. Rereviews preserved log bytes. Readers worked from the same earlier projections without the answer note and saw multiple cases in a packet before deciding. The replay leaves ordinary effectiveness and total effort open. Records-only delivery.

### 3. Doughnut and Pygardon reviewers record repeats under the trial rule

Type: Behavior
Status: done

Add the settled paragraph to each project's `AGENTS.md` through that project's own delivery conventions, on its configured trunk. This is an outward write to two client repositories and needs the execution instruction to cover it. Record each project's trial revision in this plan.

**Proof.** In an isolated copy of each project at its trial revision, a fresh reader records one repeat that matches a collected summary and one that names a higher cost. The log gains one line for the first and a full row for the second. A second pass changes nothing. The copy is discarded and the production `DearDough.md` stays untouched.

**Published trial revisions**

| Project | `origin/main` revision | Remote ref confirmed |
| --- | --- | --- |
| Doughnut | [`d252ef8a44cc21e242e20c78d9bd11a6214eb396`](https://github.com/nerds-odd-e/doughnut/commit/d252ef8a44cc21e242e20c78d9bd11a6214eb396) | 2026-11-18T16:09:39Z |
| Pygardon | [`2cae31f864e31a2be61bb15d56f2206885a14836`](https://github.com/terryyin/pygardon/commit/2cae31f864e31a2be61bb15d56f2206885a14836) | 2026-11-18T16:09:38Z |

Each trial commit adds the same removable section to its project's `AGENTS.md`.
The production findings log has the same Git blob as its parent. Both default
checkouts advanced to their accepted revisions. Pygardon carried a separate
Ruff repair (`d796c7ccf`) for a reproduced import-order failure in its
packaged recovery measurement fixture. The checkout lint and the commit hook
passed after the correction.

Both client revisions passed their exact trunk CI. Doughnut
[run 44343939214, attempt 2](https://github.com/nerds-odd-e/doughnut/actions/runs/44343939214/attempts/2)
retried the single failed setup job after Microsoft’s Ubuntu package mirror
returned HTTP 429 in attempt 1. Pygardon’s configured CI reported success
for run `ffba4661-e3dc-4b65-bd03-728922e9b2ad`. Both client observers
confirmed shutdown.

The isolated readers receive the trial through `AGENTS.md` explicitly. The
clients' `CLAUDE.md` files reference local guidance in other contexts. An
ordinary Claude Code run needs evidence that its reviewer loaded the trial
before its recording decision.

**Accepted controlled proof.** Fresh readers used disposable copies of both
published revisions. Each kept the original `0.3.60` execution in the
collected summary and added one four-field line for the unchanged repeat.
Each gave the costly repeat a full row with nine lookups and 18 active
minutes. The newly affected workflow, corrected attribution and uncertain
cost also received full rows. A stale list with no selected receipt was a
different cause and got its own DD-268 entry. Each rereview left the scratch
log byte-identical. Clipboard's isolated control at `1a3ebb443` gave the same
ordinary repeat a full row and was likewise byte-identical on rereview. The
copies were discarded after the observation. This walk used Codex subagents
with explicit guidance, and ordinary exposure remains to be observed.

### 4. Five ordinary executions in each project are judged against the basis

Type: Behavior
Status: planned

Execution waits here until each project's trunk holds five ordinary executions that started after its trial revision. Select them from story, Git or CI history before opening the findings files, including executions that reported nothing. For each, read what happened, then what was recorded. Report the counts named in slice 1, the project, guidance revision and route for each observation, and missing evidence. Give Terry the keep or revise recommendation with the reasons. The decision is Terry's.

**Proof.** The evaluation section lists the ten executions with their selection source, what each recorded, and the counts with sample sizes. Terry's decision is recorded beside them.

Use each published trial revision above as its project's exposure boundary.
Select from first-parent trunk integrations and their execution history,
using the execution's starting revision or known start time to verify it
started after the trial reached trunk. Use story-completion records when
available and ordinary Git or CI history for other eligible executions.
Retain the selected identities before consulting findings and include quiet
executions. The controlled walks and the pilot changes are outside that sample.

On the history check at 2026-11-18T16:23:12Z, both client trunks were still
at their trial revisions. The ordinary sample has zero of five executions
in each project. Resume this slice when both client trunks have five
eligible executions. Terry owns the decision after their assessment.

### 5. The trial ends as decided

Type: Behavior
Status: planned

On keep, add a promotion story to the seed and queue it. It changes the distributed recording rule and removes both trial paragraphs when its release is installed. On revise or an open result, remove both paragraphs through each project's delivery conventions and record the revised question in the seed if Terry wants another try.

**Proof.** On keep, the backlog links the promotion story and both projects still carry the paragraph. Otherwise `grep -n "Trial: record what a repeat teaches" AGENTS.md` finds nothing on either trunk.

## Current decisions and gates

- Terry chose the local trial rule, the one-line trace and the small replay with the next five executions on 18 November 2026.
- Slices 1, 2 and 5 edit maintainer documents and planning records here. Use the [maintainer behavior review](../../../.agents/skills/author-open-dough-skills/SKILL.md#behavior-review) for the trial paragraph. Fresh readers are ordinary subagents; no native host run is part of this plan.
- Client writes in slices 3 and 5 follow each project's instructions, hooks and trunk, as the [collector](../../../.agents/skills/collect-client-feedback/SKILL.md#resolve-the-maintained-set-and-destinations) resolves them.
- Slice 4's wait is expected. Check exposure with each project's history after its trial revision. The story stays in progress meanwhile.
- [SEED-402](../../seeds/SEED-402-stable-client-finding-records.md#keep-client-finding-evidence-and-ids-stable) edits numbering and collection-time shortening in the same references. This plan changes neither file.
- Local gates for each slice are its walk, inspection of the resulting log or record, and `git diff --check`. Apply the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md). If a long full run becomes necessary, start fully awake on AC with `caffeinate -s -i`. On battery, plug in or keep the lid open under `caffeinate -i` and check the sleep log afterwards. [Machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
- Each slice is sized for 15 active minutes. Slice 1 is bounded by the cap of six occurrences per group. Slice-plan refinement was not needed: each slice has one outcome and its own observation. No remaining slice-specific concerns were identified.

## Execution context

- Established Story Branch Mode execution of SEED-401#pilot-repeat-retrospective-findings, publisher `dashboard-territory.local-open-dough`, agent Kaoru-chan. Checkout `.worktrees/pilot-when-a-repeat-adds-useful-retrospective-ev`, branch `codex/pilot-when-a-repeat-adds-useful-retrospective-ev`, integration checkout at the repository root, target `origin/main`.
- Starting revision `e8e01643a4e966416f0fd0b857d8deb342bbc311`. The established Take and first published base `678454f8aa4d90d910c876d36589cbe25331954f` was confirmed on trunk and the execution branch. No separate replan instruction.
- Checkout readiness: pinned Node 24.21.0, checkout-local `npm ci` and passing `npm run typecheck:dashboard`.
- Codex observer for story-branch increments: `terryyin/open-dough`, `ci.yml` (CI), coordinator `kaoru-401`, directory `/tmp/dough-ci-501/watch-UtsGvk`, PID 89550, session 77670, cell `g101:9`. Paths-only `.planning/` and `docs/` changes are excluded by the push workflow.
- On trunk `720c2d5d5`, the first-report pilot integration `211360795` moved ordinary assessment to the linked successor. Its one-review instruction applies to first reports. SEED-402 integration `10074f37e` changes unreleased missing-log recovery and collector step 5. The two clients' installed 0.3.106 recording text still matches the pinned rule, and collector step 3 still uses project plus execution.
