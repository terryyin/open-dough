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

### Start dashboard Claude Code sessions without the Artifact tool

**Identity:** SEED-345#start-implementers-from-a-role-sized-tool-set
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/796-start-dashboard-claude-sessions-without-artifact/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"8ca0712fe093bdbbd241b55860aa83d6164e8e6839e718fc576e8dce6a1b438d","plan":"51c59c4876ec26924d04dce82575c1c887e1bd45a08f3df2329cc51f477fcd76"}}
```

**Goal.** Developers launching Claude Code sessions from the dashboard pay for
no tool definition their sessions never use. Claude Code's Artifact tool,
which publishes pages to claude.ai, adds about 37k characters to every
request of a coordinator and of each worker it starts. Removing it removes no
judgment.

**Baseline (2026-11-23, Claude Code 2.1.330, local traces).** In 30 days, 731
main sessions were offered Artifact and none, nor any worker, called it. Over
10 days it cost about $43 of $2,441 main-session spend and $64 of $1,896
worker spend at the Opus 5.5 rate card, about 2.5% overall. Probes started
with `claude --bg ... --disallowedTools Artifact -- "<prompt>"` showed main
tool definitions falling from 83.8k to 46.4k characters, and a worker it
started from 58.2k to 21.1k, with Artifact absent from both. The tool list
is variadic: a prompt placed after it without `--` is read as a tool name.

**Scope.** Every dashboard Claude Code launch passes `--disallowedTools
Artifact` and keeps its name, model, effort and instruction. Codex and Cursor
launches, sessions developers start themselves, personal settings and other
tools stay as they are. An agent definition or role-sized tool set was
considered and dropped: its copied worker prompt would need maintaining for
about 3% of worker spend.

**Evaluation.** The launch boundary case proves the argument. Keep or stop
from the next real dashboard-launched Claude Code execution's traces: keep
when its coordinator and workers start without Artifact and its results read
as usual.

**Key examples.**

- An execution launched from the dashboard with model and effort starts
  `claude --bg --name <name> --model <m> --effort <e> --disallowedTools
  Artifact -- <instruction>`.
- A launch with no instruction still withholds Artifact.
- The coordinator's workers start without Artifact and keep Agent, Bash,
  Edit, Read, Write and Skill.

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
