---
id: SEED-345
status: active
planted: 2026-11-14
planted_during: Terry Yin requested Codex, Cursor and Claude Code token-efficiency audits and retention of their reconciled findings
trigger_when: Terry selects an efficiency story for refinement
scope: seven stories
---

# SEED-345 — Improve session token efficiency across Open Dough projects

## Why this matters

Developers relying on Open Dough agents should get the same verified results
with fewer model requests, less repeated context and fewer manual rescues.
The [cross-host session token efficiency report](../../docs/maintainer/session-token-efficiency-research.md)
retains the measurements, examples and evidence limits. Compare results and
total coordinator and worker effort on comparable work, following
[Open Dough's definition of improvement](../../docs/adrs/0010-definition-of-improvement-accepted.md).

## Alternatives and decision

The order weighs delivery and proof risk first, then measured breadth of
impact across hosts, then confidence in the saving. Shared stories name the
host whose evidence leads; a host adaptation stays inside the shared story
unless only one host shows the mechanism. Keep the existing proof and approval
boundaries in each story. Stories that change how much context an agent
carries are measured trials: a change that loses judgment or proof is no gain.
Model and effort choice stays research until quality can be compared.

Effort bands are relative. Small means one scoped host workflow. Medium means
a shared workflow with a representative host comparison. They carry no time
commitment.

## Proposed stories in priority order

<a id="resume-when-blocked-work-can-advance"></a>

### Resume blocked work when it can advance

**Identity:** SEED-345#resume-when-blocked-work-can-advance
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **Scope and beneficiary.** Shared execution behavior with initial proof in
  Codex. A developer can leave a blocked execution and receive a meaningful
  resume or attention signal while its work and remaining proof stay recoverable.
- **Evaluation.** When a supplier pauses and dependent work cannot advance,
  the execution preserves its checkout, owner, last accepted proof and exact
  resume condition. While the supplier state is unchanged, the execution
  generates no recurring model requests solely to check that state. A
  qualifying supplier change resumes the right work once. A missed deadline,
  an unavailable signal or lost required CI observation surfaces actionable
  status. Observe the same publication and proof decisions in a comparable
  run, with fewer idle requests and no extra developer rescue. A host usage
  limit is another hold: four Claude Code executions waited about six hours
  for a typed “resume” after one; refinement checks whether its reset can be
  observed.
- **Priority.** First. In SEED-324 the developer had to intervene after about
  6½ hours of known supplier pause. Three hundred requests in that interval
  followed empty waits, timeouts or clock checks. The delivery interruption
  and lost observation risk make this the most urgent story.
- **Effort and boundary.** Medium, medium confidence if the existing host
  notification and continuation paths can carry the needed state. Preserve
  the applicable CI receipt and overdue liveness rules. Reuse the delivered
  [SEED-343 observer recovery](../done/SEED-343_recover-ci-completion-observation.json).
  [Waiting evidence](../../docs/maintainer/session-token-efficiency-research.md#1-wake-the-coordinator-for-results-changes-and-bounded-deadlines)

<a id="compare-agent-effort-on-comparable-runs"></a>

### Compare agent effort on comparable runs

**Identity:** SEED-345#compare-agent-effort-on-comparable-runs
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **Scope and beneficiary.** Shared maintainer measurement. A maintainer can
  compare two executions' agent effort per host without writing a new audit.
- **Evaluation.** Given retained local history for one execution, the
  maintainer obtains its requests, input, cached input, cache writes where the
  host records them, output, peak context per agent, idle-wake requests and
  role split for coordinator and workers. Where a host retains no usage, the
  result says so and reports the agreed workflow counts instead. The three
  audits' published figures for a sampled execution are reproduced.
- **Priority.** Second. Every later story is judged on comparable runs, and
  each audit rebuilt its own accounting. The resume story can start from
  Codex's native usage before this exists.
- **Effort and boundary.** Medium, high confidence; the audits' methods are
  recorded. Read-only over local history; no quota or invoice claim.
  [Method and accounting](../../docs/maintainer/session-token-efficiency-research.md#window-scope-and-method)

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
- **Priority.** Third. Codex recorded 2,303 requests (446.5M tokens, 7.6%)
  after empty subprocess output or agent-wait timeouts. Claude Code paid
  about $96 of list-price worker rebuilds after five-to-sixty-minute waits.
- **Effort and boundary.** Medium, medium confidence. Distinct from a paused
  supplier, which the first story owns. Keep the five-minute Claude Code
  subagent cache; a longer lifetime cost more than it saved.
  [Waiting](../../docs/maintainer/session-token-efficiency-research.md#1-wake-the-coordinator-for-results-changes-and-bounded-deadlines)
  and [cache](../../docs/maintainer/session-token-efficiency-research.md#cc2-cache-lifetime-avoid-the-rebuild-keep-the-five-minute-default) evidence

<a id="reach-a-proof-decision-from-retained-evidence"></a>

### Reach a proof decision from retained evidence

**Identity:** SEED-345#reach-a-proof-decision-from-retained-evidence
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **Scope and beneficiary.** Shared local and delegated verification. A
  developer or coordinator can tell what a run or a worker proved and
  diagnose a failure from a concise result with recoverable evidence.
- **Evaluation.** When an owned verification emits a large result or its
  runner cleans up temporary output, the consumer can still retrieve the
  exact command and revision, selected proof, terminal result and decisive
  assertion or diagnostic artifact, plus a continuation handle while it runs.
  A worker hand-back states each material promise, its observation and any
  proof gap, and points to its full report on disk. The same repair or
  acceptance decision follows with fewer rereads or reruns and less evidence
  in model context. Missing or incomplete proof is exposed.
- **Priority.** Fourth. SEED-332 lost the traces needed to diagnose earlier
  failures, and truncated output recurred (ODF-264). Claude Code coordinators
  kept 315 hand-backs, median 7.8k characters, for the whole session.
- **Effort and boundary.** Medium, medium confidence. Keep every required
  proof row ([ODF-314](../../docs/maintainer/findings/ODF-314.md)). The
  [source-review bookkeeping story](SEED-010-learn-from-execution-retrospectives.md#review-independently-observable-promises)
  owns promise allocation.
  [Output and diagnostic evidence](../../docs/maintainer/session-token-efficiency-research.md#2-return-decision-sized-evidence-and-retain-the-full-artifacts)

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
  first reference batch truncated in SEED-342. Every execution pays this.
- **Effort and boundary.** Medium, medium confidence. Keep required
  breadth ([ODF-158](../../docs/maintainer/findings/ODF-158.md)) and keep
  boundary rows maintainable ([ODF-446](../../docs/maintainer/findings/ODF-446.md)).
  [Guidance reads](../../docs/maintainer/session-token-efficiency-research.md#2-return-decision-sized-evidence-and-retain-the-full-artifacts)

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
- **Priority.** Sixth. It is the largest cost driver on both hosts that
  report tokens: 7,586 Codex requests at or above 250k input, and 54% of
  Claude Code coordinator cost in such requests. Quality risk ranks it below
  the stories that preserve context as it is.
- **Effort and boundary.** Medium, low confidence. Builds on oversized-slice
  handling ([ODF-206](../../docs/maintainer/findings/ODF-206.md),
  [ODF-260](../../docs/maintainer/findings/ODF-260.md)). Host mechanisms such
  as compaction settings are trial variants, not defaults.
  [Context growth](../../docs/maintainer/session-token-efficiency-research.md#5-bound-how-long-one-context-keeps-growing)

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
- **Priority.** Seventh. Forty-five of 55 Cursor implementers opened the
  coordinator skill first. Claude Code implementers did not, and Cursor
  retains no per-request usage to size the saving.
- **Effort and boundary.** Small, medium confidence. Independent review and
  role-specific reads keep their purpose.
  [Cursor handoff evidence](../../docs/maintainer/session-token-efficiency-research.md#c1-avoid-paying-twice-for-large-task-prompts-and-skill-re-reads)

## Research kept without a story

Model and effort per role. Dashboard launches choose them per session on all
three hosts. Fable 5.2 carried 33% of Claude Code list-price cost on 21% of
requests, and its usage limit stalled four executions. No retained evidence
compares outcome quality by model or effort, so a story waits for that
comparison. [Model evidence](../../docs/maintainer/session-token-efficiency-research.md#cc1-model-choice-sets-the-price-of-each-unit-of-work)

## Ordering and scope reduction

Each story has its own observable result and can stand alone. If capacity is
limited, defer the Cursor handoff first, then the bounded-context trial. Use
the delivered [records-only and already-traced rule](../../src/skills/dough-execute-plan/references/deliver-the-change.md)
for eligible reviews; the audit supplies no evidence for a broader review
exemption. The Pygardon ticket monitor's heartbeat context is a project
automation outside this seed.

## Open decisions

Later refinement can choose the ordinary execution and baseline for each
trial, starting from the highest-evidence host and expanding proof where
another host exposes a different constraint.
