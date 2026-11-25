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

<a id="load-execution-guidance-for-the-current-phase"></a>

### Load execution guidance for the current phase

**Identity:** SEED-345#load-execution-guidance-for-the-current-phase
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/835-load-execution-guidance-for-the-current-phase/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"d97c12e2eb91023ff384d61f87185f5d78eaacbb3b6a5f0d89135628f511a226","plan":"6a74ffe33c5ffbac2f3427c7c252f6087a7807c755779f54da4f35e4c57bab83"}}
```

**Goal**

Developers using Execute Plan get the required decisions, refusals, and proof
with less startup retrieval. In the [recorded occurrence](../../docs/maintainer/findings/ODF-264.md#odf-264),
the coordinator searched broadly despite having named CI tools, and full-file
guidance reads overflowed independently of tool discovery.

**Scope**

- Integrate startup and reading into one concise procedure. Use tools the
  workflow names when available. When a tool is missing, search for the specific
  capability and inspect plausible matches. Retrieve the passages and linked
  prerequisites needed for the decision at hand and reuse them while they apply.
  Put required guidance links at the steps that need them. Preserve source and
  authority checks, delegation and proof requirements, and live CI routes.
- Retire the boundary-read table, its separate-response and skill-body rules,
  the 30,000-byte test, and artifacts that exist solely for that limit. Bring
  `ci-completion-recovery.md` into the completion guide, retarget the live
  reference, and remove the old path. Verify removal in both managed skill
  roots through an ordinary update from the preceding payload.
- Evaluate the shared procedure on representative native traces, with Codex as
  the lead host and a Claude Code check for the Bash output limit that motivated
  the old rule. Compare equivalent outcomes and proof before retrieval effort,
  under [ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md) and
  [ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md).
  Release and client rollout, changes to host adapters or CI runtime, and the
  separate Cursor implementer handoff are outside this story.

**Key examples**

1. A coordinator starts an execution with CI observation due and its named
   tools available. It arms the applicable observer and reaches the first
   delegation with the required inputs, without catalog discovery, truncated
   guidance, or reading ahead to delivery and completion.
2. A referenced tool is unavailable. The coordinator looks up the exact
   capability and checks the likely matches. If an authoritative prerequisite
   remains unavailable after targeted retrieval, it names the missing input and
   stops the affected step before the dependent action.
3. An owned CI observer has ended before a completion receipt. The completion
   guide leads the coordinator to managed recovery for that owner, target, and
   accepted revision, preserving the ordinary receipt and shutdown contract.
   A project updated from a payload carrying the old split reaches the same
   guidance with no obsolete companion file or incoming link.

**Priority.** First at Terry's direction. The [original recovery split](https://github.com/terryyin/open-dough/commit/607771fa60ce2902ec07da6abba1fd1d0865e083)
was driven by the byte budget.

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
