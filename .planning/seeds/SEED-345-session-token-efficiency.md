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

<a id="start-implementers-from-a-role-sized-tool-set"></a>

### Start Claude Code implementers from a role-sized tool set

**Identity:** SEED-345#start-implementers-from-a-role-sized-tool-set
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **Scope and beneficiary.** Claude Code adaptation delivered with the Open
  Dough release. A developer's delegated implementers, CI repairers and
  refactor passes start with the tools their role uses, so every request of
  a long execution carries a smaller fixed start.
- **Evaluation.** On a representative Claude Code execution, delegated
  workers start without tool definitions their role never uses, such as
  Artifact, Agent and worktree entry, while keeping the shell, file, skill,
  monitor and background-task tools they used. The installed release supplies
  any host configuration this needs. Results, proof and hand-backs match a
  comparable baseline while worker start context and total worker effort
  fall. A worker that needs a withheld tool reports the gap.
- **Priority.** First. In the 2026-11-15 re-measurement, the Artifact tool
  definition alone was about 37k characters, roughly a quarter of the 40.5k
  token subagent start, written and re-read on every subagent request:
  about $45 of $1,005 subagent list-price cost across 16 executions. It
  removes no judgment, so confidence is high.
- **Effort and boundary.** Small, high confidence. The release installs only
  skills and hooks today, so a host agent definition or setting is a new
  installed kind whose installation, update and coexistence keep their
  checks. Coordinator tools, project instructions and personal memory stay
  outside this story; skill descriptions belong to the phase-guidance story.
  [Start floor](https://github.com/terryyin/open-dough/blob/ffdd3dd800a7325237adcfc9c54920956bb63f7b/docs/maintainer/session-token-efficiency-research.md#cc5-every-subagent-pays-a-fixed-start-up-floor)

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

## Follow-ups from the November 20–22 execution audit

<a id="wait-for-codex-workers-with-fewer-model-wakeups"></a>

### Wait for Codex workers with fewer model wakeups

**Identity:** SEED-345#wait-for-codex-workers-with-fewer-model-wakeups
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/796-wait-for-codex-workers-with-fewer-model-wakeups/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"05e9b75e7040d36808b281aa6cc678e2e3a34d200f031edaae7b1b238f550fc4","plan":"b78aa733b47f38bf393ce34b50c246c772ff928e581aa9917f488e8d22266281"}}
```

**Goal.** A developer relying on a Codex coordinator gets timely results
from delegated work with fewer model requests spent waiting and lower
combined coordinator and worker effort through acceptance.

**Scope.** Compare the current short `wait_agent` cadence with a native wait
bounded by the earliest existing reason to act. Keep the same workers,
responsibilities, proof, approvals and recovery in both arms. Use an isolated
native probe for completion and overdue recovery, then a matched pair on
representative long delegated work. Measure distinct empty wake requests,
fresh and cached input and output for both roles, handback latency, missed
outcomes and human interventions. Judge proof and timely handling first.
Adopt the candidate for the observed profile only if empty wakes and combined
effort both fall and completion and recovery remain reliable.

The November 21–22 rollout recheck found 126 timeout receipts in one Codex
0.171.0 coordinator and 121 in another. A file with 111 receipts contained
inherited coordinator history, so it supplies no independent baseline.
The earlier [native delegation candidate](https://github.com/terryyin/open-dough/blob/70db7200e/.planning/slice-plans/714-get-long-verification-results-without-empty-wakes/candidate.md)
still woke at 60 seconds and cost 28.6% more combined effort in one matched
success journey. A lower wake count can still lose through worker effort or
fresh context on resume. Historical counts establish exposure. The matched
control supplies the comparison.

Defer cross-host qualification, package release and host changes. The
[released shell and CI wait](../../CHANGELOG.md#03107---2026-11-19) and
[supplier-watch evaluation](SEED-389-verify-silent-supplier-wait.md) cover
different events and retain their own lifecycles.

**Key examples.**

- A native worker is still running beyond the short wait cadence and the
  next check is later → the coordinator waits for that worker → its handback
  arrives before the due check and is accepted once with the same proof.
- Required worker proof is still pending at its expected check or before
  relevant CI coverage lapses → the existing due action wins the wait → the
  coordinator inspects the original owned command and continues it or returns
  the specific unfinished obligation and recovery owner.
- A supported host return arrives early or a deadline expires → the
  coordinator resumes the same pending work against its original due time or
  applies the deadline procedure. The wait itself provides no proof verdict.
- The matched pair completes with fewer timeout wakes but higher combined
  effort, or misses a handback or due action → reject the candidate. Missing
  comparable exposure or reliable accounting makes the trial inconclusive.

**Architecture.** Borrow a condition-variable wait. The native worker's
handback is the state change and the coordinator's existing due time bounds
the wait. An early return rechecks the same worker and deadline. The analogy
ends at the host boundary, where tool schema and a requested duration give
no guarantee about the effective wait or the events it delivers. Qualify the
native path before changing guidance. Keep the rule in the existing
[delegation reference](../../Distribution/src/skills/dough-execute-plan/references/delegation.md#await-delegated-results-without-empty-calls),
with worker results owned by the host and overdue verification judgment owned
by the coordinator. [ADR 0005 — Native validation and A/B testing](../../docs/adrs/0005-cross-tool-validation-accepted.md),
[ADR 0006 — Write skills for executing agents](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md),
[ADR 0010 — Definition of improvement](../../docs/adrs/0010-definition-of-improvement-accepted.md).

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
