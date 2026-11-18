# Pilot when a repeat adds useful retrospective evidence

**Source:** [Pilot when a repeat adds useful retrospective evidence](../../seeds/SEED-401-retrospective-finding-pilots.md#pilot-repeat-retrospective-findings)
**Identity:** SEED-401#pilot-repeat-retrospective-findings

## Goal and scope

Terry gets a keep or revise decision on one recording choice in Doughnut and Pygardon: a repeat that teaches something gets a full row, and any other repeat leaves one line naming its execution. The trial lives in one removable paragraph of each project's `AGENTS.md`. The distributed recording rule, the collector and the other clients stay as they are and provide the baseline. The [sibling pilot](../../seeds/SEED-401-retrospective-finding-pilots.md#assess-new-retrospective-findings-pilot) owns first reports. Promotion into the distributed rule is a later story, queued only on keep.

## Trial paragraph

Slice 1 may adjust this wording once before the replay. Later changes follow the replay rule in slice 2.

```markdown
### Trial: record what a repeat teaches

Open Dough pilot SEED-401; remove when the pilot closes. When a retrospective
matches a finding from a new execution, ask what this occurrence teaches that
could change the next action. Write the full occurrence row when it shows a
material new effect, a cost that changes priority, a newly affected workflow, a
corrected attribution, or, where the entry names an adopted response, that
response working or failing in this execution. Otherwise add one line under the
finding: `- Execution: <identity> · <timestamp> · <tool> · release <version>`.
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

## Ordered slices and outside-in proof

### 1. The comparison is fixed before any run

Type: Structure
Status: planned

Add a dated follow-up section to the [evaluation record](../../../docs/maintainer/empirical-process-control-research.md) with the decision basis under [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md): beneficiaries, intended gain, comparison with current practice, and the keep and revise criteria from the story. Name the counts to report: decisions changed, consequential misses, repeat narratives reaching triage, and writer and reviewer effort with active time, elapsed time and tokens kept apart. Settle the trial paragraph. Build the replay set from the story's three case groups at their pinned revisions, at most six occurrences per group. Include the ODF-200 publication, both ODF-325 launches, the Pygardon DD-136 and Doughnut DD-202 recurrences, the Pygardon 0.3.76 recurrence of ODF-264 and the Lizard move. For each occurrence keep the finding entry as it stood before that execution and the evidence the execution had. Keep later corrections and retirements in a separate answer note. The set stays with this plan until wrap-up. This enables slice 2's replay.

**Proof.** The basis section precedes any replay output in history. Each replay input opens at its pinned revision and contains nothing dated after its execution.

### 2. The same history shows what each wording records

Type: Behavior
Status: planned

Two fresh readers each walk [process-finding recording](../../../Distribution/src/skills/dough-execution-retrospective/references/process-finding-recording.md) over the replay set in scratch logs, one with the current rule and one with the trial paragraph added. Neither sees the answer note. Compare the two logs against it: which occurrences received a full row or one line, whether each safeguard occurrence kept its consequence, whether the moved evidence added nothing, and each reader's reported tokens and elapsed time. A third fresh reader applies the collector's step 3 to the candidate log and counts distinct executions. Record the comparison in the evaluation section as exploratory. If the trial wording loses a safeguard, revise the paragraph once and rerun the affected group. A second loss stops for Terry with the comparison.

**Proof.** The evaluation section shows both logs' outcomes per occurrence and the collector count, and a rerun of either reader on its own output leaves that log byte-identical.

### 3. Doughnut and Pygardon reviewers record repeats under the trial rule

Type: Behavior
Status: planned

Add the settled paragraph to each project's `AGENTS.md` through that project's own delivery conventions, on its configured trunk. This is an outward write to two client repositories and needs the execution instruction to cover it. Record each project's trial revision in this plan.

**Proof.** In an isolated copy of each project at its trial revision, a fresh reader records one repeat that matches a collected summary and one that names a higher cost. The log gains one line for the first and a full row for the second. A second pass changes nothing. The copy is discarded and the production `DearDough.md` stays untouched.

### 4. Five ordinary executions in each project are judged against the basis

Type: Behavior
Status: planned

Execution waits here until each project's trunk holds five ordinary executions that started after its trial revision. Select them from story, Git or CI history before opening the findings files, including executions that reported nothing. For each, read what happened, then what was recorded. Report the counts named in slice 1, the project, guidance revision and route for each observation, and missing evidence. Give Terry the keep or revise recommendation with the reasons. The decision is Terry's.

**Proof.** The evaluation section lists the ten executions with their selection source, what each recorded, and the counts with sample sizes. Terry's decision is recorded beside them.

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
