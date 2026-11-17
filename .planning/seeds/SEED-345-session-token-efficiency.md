---
id: SEED-345
status: active
planted: 2026-11-14
planted_during: Terry Yin requested Codex, Cursor and Claude Code token-efficiency audits and retention of their reconciled findings
trigger_when: Terry selects an efficiency story for refinement
scope: eight stories
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

## Proposed stories in initial priority order

Each trial is judged with the
[retained effort command](../../dashboard/AGENT-EFFORT.md).

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
- **Priority.** Second, after the role-sized tool set. Smaller stories remain
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
  Compact Codex worker handoffs are another variant within this story, judged
  on coordinator plus worker effort, uncached input and cached input as well
  as quality. A fresh worker that processes fewer tokens can still cost more.
  [Context growth](https://github.com/terryyin/open-dough/blob/ffdd3dd800a7325237adcfc9c54920956bb63f7b/docs/maintainer/session-token-efficiency-research.md#5-bound-how-long-one-context-keeps-growing)

<a id="recover-decisive-verification-evidence"></a>

### Recover decisive verification evidence after large or cleaned-up output

**Identity:** SEED-345#recover-decisive-verification-evidence
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **Scope and beneficiary.** Shared local and delegated verification. A
  developer or coordinator can diagnose a run or worker from recoverable
  evidence with fewer rereads and reruns, and less evidence in model context.
  Split from
  [the stopping-rule story](https://github.com/terryyin/open-dough/blob/74e279020ed97da59be4ff3a3956a9c4020cf55d/.planning/seeds/SEED-345-session-token-efficiency.md#reach-a-proof-decision-from-retained-evidence)
  on 2026-11-17.
- **Evaluation.** An owned verification may emit a large result, or its runner
  may clean up temporary output. The consumer can still retrieve the exact
  command and revision, the selected proof, the terminal result, and the
  decisive assertion or diagnostic artifact. While the verification runs, the
  consumer also has a continuation handle. A worker hand-back states each
  material promise, its observation and any proof gap, and points to its full
  report on disk. The same repair or acceptance decision follows with fewer
  rereads or reruns and less evidence in model context. Missing or incomplete
  proof is exposed.
- **Drivers.** SEED-332 lost diagnostic traces, and truncated output recurred
  ([ODF-264](../../docs/maintainer/findings/ODF-264.md)). Claude Code
  coordinators retained 315 hand-backs with a median 7.8k characters
  throughout their sessions.
- **Effort and boundary.** Medium, medium confidence. Keep every required
  proof row ([ODF-314](../../docs/maintainer/findings/ODF-314.md)). The
  [source-review bookkeeping story](https://github.com/terryyin/open-dough/blob/b6b6d04c9162a30619c3fd59c8e220d523455004/.planning/seeds/SEED-010-learn-from-execution-retrospectives.md#review-independently-observable-promises)
  owns promise allocation.
  [Output and diagnostic evidence](https://github.com/terryyin/open-dough/blob/ffdd3dd800a7325237adcfc9c54920956bb63f7b/docs/maintainer/session-token-efficiency-research.md#2-return-decision-sized-evidence-and-retain-the-full-artifacts)

<a id="get-long-verification-results-without-empty-wakes"></a>

### Get long verification results without empty wakes

**Identity:** SEED-345#get-long-verification-results-without-empty-wakes
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **Scope and beneficiary.** Shared, with Codex evidence leading and a Claude
  Code cache-lifetime adaptation. A developer gets the terminal result of a
  genuinely running verification at less cost while it runs.
- **Evaluation.** While a selected proof command or delegated run is still
  running, its owner obtains the exact terminal result and failure evidence
  without model requests that only observe “still running”. A wait expected
  to outlast the host's cache lifetime is owned where waking or the host's
  completion notification costs least. Keep the overdue, cancellation and
  CI completion behavior. Compare idle-wake requests, rebuilds and total
  effort on matched runs, with the same proof decisions.
- **Priority.** Fourth, after the proof decision; measure residual exposure
  under each host's currently installed guidance. Codex recorded 2,303 requests
  (446.5M tokens, 7.6%) after empty subprocess output or agent-wait timeouts.
  Claude Code paid about $96 of list-price worker rebuilds after five-to-sixty-minute waits.
  In Claude Code's later cohort, shell `sleep` calls fell from 18.4 per
  execution (Nov 13–15) to 3.4 after the waiting changes; the tasks also changed.
  This is neither a measured Codex saving nor proof that most removable wait
  cost is gone. Codex's rebaseline counts empty subprocess returns and
  agent-wait timeouts, not only shell sleeps, and records the installed
  guidance version. Measure what remains against those host-specific baselines
  ([waiting](https://github.com/terryyin/open-dough/blob/ffdd3dd800a7325237adcfc9c54920956bb63f7b/docs/maintainer/claude-code-execution-usage-spikes-2026-11.md#waiting)).
- **Effort and boundary.** Medium, medium confidence. Distinct from a paused
  supplier, which the first story owns. Keep the five-minute Claude Code
  subagent cache; a longer lifetime cost more than it saved. Starts from the
  per-host [wait for proof](../../Distribution/src/skills/dough-execute-plan/references/wait-for-proof.md)
  guidance and measures what it leaves.
  [Waiting](https://github.com/terryyin/open-dough/blob/ffdd3dd800a7325237adcfc9c54920956bb63f7b/docs/maintainer/session-token-efficiency-research.md#1-wake-the-coordinator-for-results-changes-and-bounded-deadlines)
  and [cache](https://github.com/terryyin/open-dough/blob/ffdd3dd800a7325237adcfc9c54920956bb63f7b/docs/maintainer/session-token-efficiency-research.md#cc2-cache-lifetime-avoid-the-rebuild-keep-the-five-minute-default) evidence

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
