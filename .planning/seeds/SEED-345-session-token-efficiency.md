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
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **Scope and beneficiary.** Shared measured trial. A developer's long story
  reaches the same results while no coordinator or implementer context keeps
  growing to several hundred thousand tokens.
- **Evaluation.** On comparable long executions, slices finish within a
  bounded working context, either through earlier scope decisions or by
  continuing from recorded execution state at a slice boundary. Outcomes,
  proof, judgment and interventions match the baseline; peak context and
  total effort fall. A loss of needed judgment rejects the variant.
- **Priority, November 19.** Queue this trial after the real-execution
  evaluation of recoverable proof evidence. The potential saving spans many
  worker requests. A shorter handoff can also omit a decision or trigger
  expensive fresh reads, so the trial needs the same review and proof.
- **Codex evidence.** Across the two ten-task windows, mean cached-input
  contribution rose from 3.46M to 8.15M index units per execution, accounting
  for 92% of the increase in the mean total. In the 23.26M execution, 20 of
  22 workers inherited the full conversation. Their first requests had a
  median of 309k input tokens. The trace establishes the size of the handoff.
  A matched trial must establish how much of it workers need.
- **Codex handoff trial.** On comparable well-defined slices, compare full
  history with a brief containing the original requirements, current decisions,
  relevant files and required checks. Give the worker access to supporting
  context on demand. Hold model, effort, independent review and tests
  constant. Count coordinator and worker usage through rereads, repairs and
  acceptance. At Sol rates, 15k fresh tokens cost the same as 300k cached.
  Adopt the brief only if combined index falls and the trial preserves
  required behavior, acceptance evidence and material review findings.
  [Earlier compact-handoff trial](../../docs/maintainer/findings/ODF-150.md).
- **Earlier evidence.** Smaller stories remain
  the preferred policy; use a current baseline under that policy on each host.
  The 8-slice cap and `medium` effort reduced Claude Code's observed exposure;
  that does not establish the remaining Codex exposure. It was the largest
  cost driver on both hosts that report tokens: 7,586 Codex requests at or
  above 250k input, and 54% of Claude Code coordinator cost in such requests.
  In the 2026-11-15
  re-measurement, 20 Claude Code workers above 150 requests carried 35% of
  worker cost. Slice boundaries chosen at planning time are the lower-risk
  variant to try first. That re-measurement ran at effort `high`. At `medium`,
  0–2% of slice agents exceeded 150 turns in every period from 2026-10-17 to
  2026-11-16. Coordinator peaks of 550–890k came from 9–12-slice plans and
  from `max` effort. Since the 8-slice cap, the median coordinator peak is
  293k ([spike analysis](https://github.com/terryyin/open-dough/blob/ffdd3dd800a7325237adcfc9c54920956bb63f7b/docs/maintainer/claude-code-execution-usage-spikes-2026-11.md#state-on-2026-11-16)).
  Re-baseline Claude Code at `medium` before sizing this trial. A recent Codex
  SEED-334#move-intent-reading-and-review-checks launch still used 1,548
  attributed requests and reached about 453k coordinator input tokens; later
  human-turn attribution may add work. Preserve each host's observed settings
  rather than treating Claude Code's effort change as a Codex result.
- **Effort and boundary.** Medium, low confidence. Builds on oversized-slice
  handling ([ODF-206](../../docs/maintainer/findings/ODF-206.md),
  [ODF-260](../../docs/maintainer/findings/ODF-260.md)). Host mechanisms such
  as compaction settings are trial variants, not defaults.
  [Context growth](https://github.com/terryyin/open-dough/blob/ffdd3dd800a7325237adcfc9c54920956bb63f7b/docs/maintainer/session-token-efficiency-research.md#5-bound-how-long-one-context-keeps-growing)

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

<a id="catch-delegated-lint-before-delivery"></a>

### Catch delegated lint failures before guarded delivery

**Identity:** SEED-345#catch-delegated-lint-before-delivery
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/786-catch-delegated-lint-before-delivery/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"8036d31754a7d891ee5309af270d9840ded1424992758497e1414403b6754838","plan":"95dc28216b6e9ea3318ad77f37c617b5b89b8a3b4468e1833cd176eb9e1dcdfa"}}
```

**Goal.** Developers avoid a delivery retry when the project's existing lint can catch an authored-file defect while the worker is still editing. Run the check before affected proof so a mechanical fix can precede the expensive run.

**Scope.** Use a project-supplied, read-only command on the owned paths as part of existing focused proof. Keep the choice of command and paths with the project's proof. Shorten the shipped worker brief by removing its duplicate reference to hook-owned lint. The delivery rule continues to own the staged hook, formatting and guarded publication. This trial adds zero shipped instructions, script branches, configuration or report fields. [ODF-329](../../docs/maintainer/findings/ODF-329.md) supplies the baseline. [ODF-529](../../docs/maintainer/findings/ODF-529.md) owns lint failures in unchanged consumers.

**Key examples.**

- A worker assigns to the injected terminal socket parameter. The project's lint command exits on `no-param-reassign` before the affected proof starts. The corrected edit passes and continues to focused proof and ordinary delivery.
- Clean authored paths pass the configured scoped check and continue directly to existing proof. A refactor that edits a checked path renews that path's check through the existing proof reuse rule.
- A project supplies only staged or whole-repository lint. Its focused proof and normal delivery checks run as usual.

**Evaluation.** Compare the extra scoped lint cost on a clean edit with the guard refusal, coordination and proof rerun observed for the defective edit. Keep the change only if the replay catches the failure earlier, reduces rework and leaves the shipped workflow simpler. Carry the evidence and decision in the [slice plan](../slice-plans/786-catch-delegated-lint-before-delivery/PLAN.md).

<a id="wait-for-codex-workers-with-fewer-model-wakeups"></a>

### Wait for Codex workers with fewer model wakeups

**Identity:** SEED-345#wait-for-codex-workers-with-fewer-model-wakeups
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **Outcome.** A Codex coordinator can wait for a delegated implementation,
  refactor or repair to return without repeatedly restarting model work
  on timeouts that bring no new result. It still acts on the worker's
  handback, an overdue verification, or a deadline in time.
- **Evaluation.** Compare representative long worker waits with the retained
  `wait_agent` baseline at matched model, effort, and worker responsibilities.
  Count timeout wakeups, coordinator and worker usage through acceptance,
  handback latency, missed outcomes, and human interventions. Adopt a
  candidate only if combined usage falls and completion and recovery
  remain reliable. The prior delegation experiment reduced wakes in one
  wait but increased combined effort.
- **Evidence and effort.** The November 21–22 Board and Side panel proof and
  launch proof executions recorded 126 and 111 timed-out `wait_agent`
  calls. An earlier execution on 0.3.106 recorded 166. Medium, low confidence
  until a viable host mechanism is demonstrated. This trial concerns
  delegated worker completion. The released shell and CI wait and the
  queued supplier-watch evaluation have separate scopes.
  [Foreground-wait release](../../CHANGELOG.md#03107---2026-11-19) ·
  [Supplier-watch evaluation](SEED-389-verify-silent-supplier-wait.md)

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
