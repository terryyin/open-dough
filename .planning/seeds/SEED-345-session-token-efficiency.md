---
id: SEED-345
status: active
planted: 2026-11-14
planted_during: Terry Yin requested Codex, Cursor and Claude Code token-efficiency audits and retention of their reconciled findings
trigger_when: Terry selects an efficiency story for refinement
scope: eleven stories
---

# SEED-345 — Improve session token efficiency across Open Dough projects

## Why this matters

Developers relying on Open Dough agents should get the same verified results
with fewer model requests, less repeated context and fewer manual rescues.
The [cross-host session token efficiency report](https://github.com/terryyin/open-dough/blob/ffdd3dd800a7325237adcfc9c54920956bb63f7b/docs/maintainer/session-token-efficiency-research.md)
retains the measurements, examples and evidence limits. Compare results and
total coordinator and worker effort on comparable work, following
[Open Dough's definition of improvement](../../docs/adrs/0010-definition-of-improvement-accepted.md).

## Alternatives and decision

The order weighs measured share of execution cost first, then confidence in
the saving, then delivery and proof risk; a story that changes carried
context runs as a measured trial, which contains that risk. Execution carried
90% of list-price cost in the
[2026-11-15 re-measurement](https://github.com/terryyin/open-dough/blob/ffdd3dd800a7325237adcfc9c54920956bb63f7b/docs/maintainer/session-token-efficiency-research.md#2026-11-15-re-measurement). Shared stories name the
host whose evidence leads; a host adaptation stays inside the shared story
unless only one host shows the mechanism. Keep the existing proof and approval
boundaries in each story. Stories that change how much context an agent
carries are measured trials: a change that loses judgment or proof is no gain.
Explicit launch effort and comparable-run measurement live in
[SEED-388](SEED-388-measure-and-control-agent-launch-cost.md).

Effort bands are relative. Small means one scoped host workflow. Medium means
a shared workflow with a representative host comparison. They carry no time
commitment.

### November 18–19 Codex execution baseline

Using the November 19 Usage snapshot at 08:42 Singapore time, the audit
compared the last ten eligible Codex Plan Execution tasks at November 18
17:52 with the last ten at November 19 07:54. Four tasks appear in both
windows. The rolling median rose from 2.51M to 13.42M and the mean from 5.60M
to 10.68M index units per task. In the preceding week, 22 of 63 GPT-6.1 Sol
`xhigh` executions had already exceeded 13M. Task mix matters when choosing
a comparison.

GPT-6.1 Sol and GPT-6.2 Sol at standard speed weight a cached input token at
0.05, fresh input at 1 and output at 5. Use the same versioned rate card for
both arms of each comparison. The largest execution in the later window was
Open Dough `SEED-379#keep-own-branch-session-results-for-review`, Codex session
`01a1ef2f-03bc-7f72-b131-aa967975fa9f`. Its retained coordinator and worker
traces supply the examples below. Token figures come from
`dashboard/server/compareAgentEffort.ts`.

## Proposed stories in initial priority order

Each trial is judged with `dashboard/server/compareAgentEffort.ts`.

<a id="finish-slices-within-a-bounded-working-context"></a>

### Finish slices within a bounded working context

**Identity:** SEED-345#finish-slices-within-a-bounded-working-context
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/794-finish-slices-within-a-bounded-working-context/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"e48cd9b27eccdb43de3532c5dfa879ce8e25f702dad3e47810265d52a74eb558","plan":"33306cbccf8cb486652f26381060b756521b23b86241ddd0f8bc1db0bef01c6b"}}
```

**Goal.** Give maintainers evidence that a long Open Dough execution can finish
with equivalent behavior, proof, judgment and human involvement while lowering
peak working context and combined agent effort. The trial starts on Codex,
where the retained own-branch review run shows exposure in both roles. The
[retained-proof prerequisite](../done/SEED-345_reach-a-proof-decision-from-retained-evidence.json)
is complete.

**Scope.** Compare the same selected long-work case in two isolated Codex runs.
The control uses the current small-story and slice rules, one continuing
coordinator and full-history workers. The candidate starts workers with the
slice requirements, decisions, affected areas and required checks, with access
to original evidence on demand. At a preselected accepted slice boundary, a
fresh coordinator continues on the same workspace, execution identity and
published state. The maintainer judges this candidate as one change in how
context crosses execution boundaries. Results give separate peaks by role and
support no attribution of savings to either change alone.

Preserve independent review, required proof, approvals, publication and CI
ownership. Carry unresolved decisions and the source of each accepted proof.
Match model, effort, tier, guidance, task and evaluation boundaries, and count
both roles through acceptance, including fresh reads, retries, review, repair
and recovery. Compare useful outcomes and human interventions first. A keep
recommendation requires an exposed control, a candidate peak below 250,000
input tokens per request in both roles, and lower combined effort at the same
rate card. The threshold is the retained audit's exposure band, used here as a
trial criterion. Missing measurements or a control below that band leave the
trial inconclusive. A lost consequential decision, proof obligation or review
finding rejects the candidate even when effort falls.

The trial yields a recommendation for the tested case. Cross-host
qualification, released defaults, host compaction settings, and any change to
story-sizing policy remain deferred. Claude Code's latest medium-effort cohort
in the retained audit had a 293k median coordinator peak and no slice agent
beyond 150 turns. A later Claude Code evaluation needs its own current
medium-effort baseline. [Claude Code audit](https://github.com/terryyin/open-dough/blob/ffdd3dd800a7325237adcfc9c54920956bb63f7b/docs/maintainer/claude-code-execution-usage-spikes-2026-11.md#state-on-2026-11-16)

**Key examples.**

- Two accepted slices have retained commits, exact proof, current decisions
  and an identified next slice → a fresh coordinator reads those sources → it
  checks the accepted boundary and starts the next slice once under the same
  execution identity, preserving open obligations and approval boundaries.
- A delegated slice changes a behavior with an indirect consumer → a fresh
  worker starts with the brief and retrieves the supporting sources → the
  hand-back and independent review still identify and prove the consumer. A
  missing consequential finding rejects the variant, as in the
  [earlier compact-handoff trial](../../docs/maintainer/findings/ODF-150.md).
- Both arms complete → the maintainer reviews the same behavior, proof and
  intervention criteria and prices all attributable requests → the evidence
  supports keep for this case, reject, or inconclusive. A coordinator still in
  the audit exposure band defeats the candidate even if its workers cost less.

**Architecture.** Borrow the recovery boundary from database checkpoints.
Accepted commits and the plan's resume evidence play the role of durable
state. The replacement coordinator verifies that state and resumes at the
first unfinished slice. This works only after the old writer and work in
flight have settled. Git, the plan, native records, and existing CI receipts
retain their current ownership. Unlike a database restart, the next agent
reconstructs judgment from evidence, and reconstructing it can cost more than
re-reading cached input. The trial tests both risks under
[ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md) and
[ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md).

<a id="load-execution-guidance-for-the-current-phase"></a>

### Load execution guidance for the current phase

**Identity:** SEED-345#load-execution-guidance-for-the-current-phase
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **Scope and beneficiary.** Shared guidance used on every host. A
  coordinator starts each execution phase with the guidance that phase needs.
- **Evaluation.** On a representative execution, the coordinator reaches
  the same decisions, refusals and proof while reading guidance for the phase
  it is in rather than the whole reference tree, and re-reads a boundary only
  when it changed. Skill descriptions listed in every session stay short while
  naming their triggers. Compare guidance read and coordinator context.
- **Priority.** Fifth. Coordinators read about 21 execute-plan files on
  Cursor and about 20 (roughly 250k characters) on Claude Code; Codex's
  first reference batch truncated in SEED-342. Every execution pays this,
  but the 2026-11-15 re-measurement put the carried guidance at about $2
  list-price per Claude Code execution.
- **Effort and boundary.** Medium, medium confidence. Keep required
  breadth ([ODF-158](../../docs/maintainer/findings/ODF-158.md)) and keep
  boundary rows maintainable ([ODF-446](../../docs/maintainer/findings/ODF-446.md)).
  [Guidance reads](https://github.com/terryyin/open-dough/blob/ffdd3dd800a7325237adcfc9c54920956bb63f7b/docs/maintainer/session-token-efficiency-research.md#2-return-decision-sized-evidence-and-retain-the-full-artifacts)

<a id="start-cursor-slices-from-complete-task-briefs"></a>

### Start Cursor slices from complete Task briefs

**Identity:** SEED-345#start-cursor-slices-from-complete-task-briefs
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **Scope and beneficiary.** Cursor-specific. A delegated implementer starts
  the assigned slice from a complete brief, with project and role-specific
  guidance available when needed.
- **Evaluation.** Given a complete Task brief, the implementer starts slice
  work without repeating the coordinator's orientation; given missing or
  changed information, it retrieves it or reports the gap. Compare first-tool
  distribution and transcript size across comparable Cursor slices with the
  same promises, proof and acceptance.
- **Priority.** Sixth. Forty-five of 55 Cursor implementers opened the
  coordinator skill first. Claude Code implementers did not, and Cursor
  retains no per-request usage to size the saving.
- **Effort and boundary.** Small, medium confidence. Independent review and
  role-specific reads keep their purpose.
  [Cursor handoff evidence](https://github.com/terryyin/open-dough/blob/ffdd3dd800a7325237adcfc9c54920956bb63f7b/docs/maintainer/session-token-efficiency-research.md#c1-avoid-paying-twice-for-large-task-prompts-and-skill-re-reads)

## Ordering and scope reduction

Each story stands alone. If capacity is limited, defer the Cursor handoff first,
then phase-scoped guidance loading. Use
the delivered [records-only and already-traced rule](../../Distribution/src/skills/dough-execute-plan/references/deliver-the-change.md)
for eligible reviews; the audit supplies no evidence for a broader review
exemption. The Pygardon ticket monitor's heartbeat context is a project
automation outside this seed.

## Open decisions

Refinement chooses each trial's execution and baseline, starting from the
highest-evidence host and expanding proof for another host's distinct constraint.
