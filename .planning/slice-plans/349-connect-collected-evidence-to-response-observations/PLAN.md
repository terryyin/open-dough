# Plan 349: Connect collected evidence to earlier improvement responses

**Identity:** SEED-010#connect-collected-evidence-to-response-observations

## Source

[Story 18](../../seeds/SEED-010-learn-from-execution-retrospectives.md#connect-collected-evidence-to-response-observations)
in SEED-010, selected second by Terry on 2026-10-22 from
[Story 10's evaluation](../../../docs/maintainer/empirical-process-control-research.md#feedback-cycle-evaluation-follow-up).

## Goal and scope

During ordinary shared feedback maintenance
([collect-client-feedback](../../../.agents/skills/collect-client-feedback/SKILL.md)),
each distinct execution the cycle collects or cites is checked against the
catalog's open response-observation requests, and a supported outcome,
counterevidence or precise gap reaches the existing finding owner and the
cycle's report. The story's Scope and key examples are authoritative.

**Exclusions:** whole-history scans of executions the cycle did not encounter;
project-local maintenance
([dough-triage-project-findings](../../../src/skills/dough-triage-project-findings/SKILL.md))
and other released payload; rewriting existing requests; a new store,
ledger, record format, scheduler or telemetry; release or client rollout.

**Assumptions:** The change is internal maintainer guidance under
`.agents/skills/collect-client-feedback/` (the `.claude/skills/` entry is a
thin pointer), so it needs no release and is used from trunk by the next
cycle. It extends that skill's existing steps and its
[retention and watch](../../../.agents/skills/collect-client-feedback/references/retention-and-watch.md)
rules; [maintain-feedback-cycle](../../../.agents/skills/maintain-feedback-cycle/SKILL.md)
and the [runbook](../../../docs/maintainer/retrospective-findings-runbook.md)
link to it and need change only if their summary of the shared phase becomes
inaccurate.

## Design direction

One connection rule inside the existing "Assess the response still needed"
step, applied after reconciliation has identified this run's executions:
for each execution, select requests whose stated project and
release/adoption conditions it can meet, then verify the request's event
conditions from the collected evidence and targeted reads of that execution's
recoverable records. The outcome is written with the existing occurrence and
observation conventions at the finding owner (or watch entry), using project
plus execution as the deduplication identity already defined in step 3. No
separate recognizer per finding and no per-request special cases; a request
without checkable conditions is reported, not guessed.

## Outside-in proof

The skill has no automated tests; proof is an isolated replay of the cycle's
collection and connection steps with no publication (the skill accepts an
isolated inventory and catalog with narrower instructions), plus the
[AGENTS.md behavior review](../../../AGENTS.md#behavior-review).

| Key example | Proof | Slice |
| --- | --- | --- |
| 1 Encountered eligible execution answers the request | Replay A: catalog `docs/maintainer/findings/`, watch list and backlog at `eeefa158^`; sources Open Dough `DearDough.md` at `eeefa158^`, Pygardon at `ca031afaf^`, Doughnut at `0c25e73cfa^`. Report names plan 335 → ODF-139 with locators matching the 2026-10-22 evaluation's recorded observation, assessed as one positive observation, no watch started or passed | 1 |
| 2 Already recorded | Replay B: same sources, catalog at current trunk (ODF-139 already holds plan 335). Report recognizes the existing observation; scratch catalog diff has no added ODF-139 observation or occurrence | 1 |
| 3 Ineligible release | Replay A: executions on releases before 0.3.67 that the sources cite are not reported as eligible exposure for ODF-139's successor; its Pygardon and Doughnut requests stay pending | 1 |
| 4 Unknown provenance / ambiguous | Replay A report: any candidate lacking a release or recoverable record is listed qualified with the missing fact; if none occurs naturally, the behavior review walks the Pygardon plan 308 entry (release unknown) | 1 |
| 5 Contrary evidence | Behavior review walk: an eligible execution showing a plan-scoped dismissal of a story gap is recorded as counterevidence, the watch does not pass, and triage receives it as actionable | 1 |
| 6 Nothing eligible | Replay A: requests with no eligible execution (e.g. ODF-154, ODF-120) are reported as not met, unchanged | 1 |
| Baseline (comparison) | Replay A with the current, unchanged skill before the edit: whether it connects plan 335 to ODF-139 | 1 |
| ADR 0010 judgment and completion records | Evaluation section and ODF-139 follow-up updated with mechanism, limits and measured review effort | 2 |

Each replay runs in a fresh subagent given only the skill, the scratch
inventory/catalog copies under `$CLAUDE_JOB_DIR`/scratch, and the
instruction to stop before reconciliation writes to real repositories,
adoption, compaction, story selection and publication. Record each
replay's token use and wall-clock from the agent's result.

## Slices

### 1. A feedback cycle connects encountered executions to open observation requests
Type: Behavior
Status: planned
Proof: Baseline replay A on the unchanged skill, then replays A and B on the
changed skill as mapped above; behavior review walks for examples 4–5.

Behavior: the catalog holds an open response-observation request and the
cycle collects an execution meeting or failing its conditions → shared
feedback maintenance runs → the owner receives one evidence-linked
observation, counterevidence or named gap (none for a repeat or ineligible
case) and the report lists connections, unmet requests and added review effort.

### 2. The maintainer receives the ADR 0010 judgment of the delivered connection
Type: Behavior
Status: planned
Proof: Diff of the [feedback-cycle evaluation](../../../docs/maintainer/empirical-process-control-research.md#feedback-cycle-evaluation-follow-up)
and [ODF-139](../../../docs/maintainer/findings/ODF-139.md)'s maintenance
follow-up shows the delivered mechanism, its limits (unencountered executions
stay unconnected; no effectiveness claim for ODF-139's response), the
baseline-versus-changed replay comparison and the measured replay cost.

Behavior: slice 1's replays are complete → the evaluation and ODF-139 record
are updated → the maintainer reads which evidence was connected, which
decisions changed, remaining uncertainty and added review effort, judged
against the basis below.

## Current decisions

- **ADR 0010 basis (set 2026-10-23, before evaluation).** Beneficiary: the
  Open Dough maintainer. Intended gain: eligible evidence the cycle already
  reads reaches its finding owner without a separate evaluation. Comparison:
  the 2026-10-22 cycle missed plan 335 → ODF-139 (session
  `de44a53b-4739-4b3d-a074-00d79eef39d4`), and baseline replay A on the
  unchanged skill. Result worth keeping: replay A connects plan 335 and
  matches the evaluation's recorded observation, replay B adds nothing, no
  ineligible or absent evidence is reported as success, and the added replay
  token use and time are proportionate to one cycle (report the numbers; no
  fixed threshold). *Adjust* if matching works but produces false
  candidates or unbounded reading; *Revert* if it records ineligible evidence
  as an outcome or duplicates observations; *Inconclusive* if the baseline
  replay already connects (then the remaining question is the real cycle's
  variance, recorded as such).
- Replays are read-only against real repositories and use scratch copies; no
  paid native host runs are needed.

## Premises

- Replay inputs recoverable: `git show eeefa158^:DearDough.md` contains the
  plan 335 entries (lines 212, 464, 518); `git show eeefa158^:docs/maintainer/findings/ODF-139.md`
  holds the "next assessment" request and the `v0.3.67` containing release;
  `cdcc2633` records Open Dough's 0.3.67 adoption; plan 335 is recoverable at
  `a346bf26^:.planning/slice-plans/335-shared-host-proof-headroom/PLAN.md`
  with G1–G3 and both source-only reviewers; Pygardon `ca031afaf` and
  Doughnut `0c25e73cfa` resolve locally (observed 2026-10-23).
- The real 2026-10-22 cycle did not connect plan 335 to ODF-139
  ([evaluation](../../../docs/maintainer/empirical-process-control-research.md#previous-response-followed-through)).
  Whether the current unchanged skill also misses it is settled by the
  baseline replay at the start of slice 1, before the edit.

## Plan review

Refinement not needed: two slices, one proof loop each, no fragmented or
combined outcomes. No remaining slice-specific concern identified.
