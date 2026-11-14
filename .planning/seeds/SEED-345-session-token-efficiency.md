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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/617-resume-blocked-work/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"19f399cb73629f5c325be7d21f0ecbe3cc291303080a1e0198c117d7b8ac8dac","plan":"c8a0e89fc0c68c55bcd154ade621b581089e546d2d934dba290608c1b81f09ed"}}
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

#### Goal

A developer can leave an authorized execution that cannot currently advance,
without paying for recurring model checks or having to reconstruct its work.
When the recorded condition changes, the correct execution resumes or gives
actionable attention, preserving its ownership, work and outstanding proof.
This is the first efficiency story because the observed supplier pause cost
both idle requests and a developer rescue.

#### Scope

The existing story commits to:

- Distinguishing a paused supplier or host usage hold from verification that
  is actually running. The sibling long-verification story owns reducing the
  cost of waiting for a running command.
- Retaining the execution identity, checkout and branch, owner, last accepted
  proof and applicable revision, unfinished work, exact resume condition,
  supported continuation handle when available, and next observation or
  attention owner. A saved condition does not create a new execution claim.
- Generating no recurring model requests solely to recheck unchanged blocked
  state. Necessary bounded liveness checks, genuine changes and deadlines
  remain meaningful observations.
- Resuming the right work once on a qualifying change, with actionable status
  for an unavailable signal, missed deadline or lost required CI observation.
  Resume preserves the original execution authority; it supplies no permission
  to change scope, choose another model, purchase capacity or waive proof.
- Keeping the existing CI receipt, overdue-verification and observer-recovery
  rules. Local proof remains accepted evidence when CI coverage is lost;
  neither a wake-up nor local proof manufactures a CI completion receipt.
- Initial comparative proof in Codex, with shared guidance for Codex, Cursor
  and Claude Code and explicit evidence limits for their different adapters.
  Usage-limit reset observability is investigated rather than inferred from
  elapsed time.

**Selected boundary (Terry, 2026-11-14):** automatic continuation of
already-authorized work where the host supports
delivery, with retained state and actionable attention when delivery is
unavailable or uncertain. It must demonstrate a successful automatic Codex
resume. Automatic recovery after host/session exit and quota resets is not a
delivery commitment, and manual resume is the fallback rather than the normal
supported-host path.

Release/rollout, the general effort-accounting tool, reducing waits for running
verification, context compaction, and a general background job scheduler are
not delivery commitments of this story. These are scope limits, not rejection
rules for cases a simple solution naturally supports.

#### Key examples

1. **Known supplier pause.** A consumer has preserved partial work and accepted
   proof; its supplier is paused with no verification running → the consumer
   reaches that blocker → it retains the exact supplier outcome it needs and
   yields through a supported facility or reports the missing facility. An
   unchanged supplier causes no recurring model checks.
2. **Qualifying change.** The retained consumer is waiting for a specific
   supplier outcome → new supplier evidence is delivered → the consumer
   reassesses that exact condition and, when satisfied, continues its own
   authorized work once. A publication or supplier completion alone does not
   establish satisfaction. On the supported path this continuation needs no
   typed developer “resume”.
3. **Repeated or uncertain delivery.** A change has already caused a
   continuation, or its acceptance is uncertain → the same signal is seen
   again → no competing writer or blind duplicate submission is started.
   Uncertainty retains the execution and explains how its owner can reconcile
   acceptance; an attempted wake is not reported as confirmed continuation.
4. **Deadline or observation loss.** Work is blocked with a recorded next
   observation and CI coverage → the meaningful deadline arrives or required
   observation becomes unavailable → actionable status names what is known,
   the remaining proof, exact recovery and owner. It claims neither supplier
   success nor successful CI. A known ended observer follows SEED-343's
   managed recovery at the applicable completion boundary.
5. **Host usage hold.** Claude Code reports a model usage limit → the execution
   is retained → an observed reset may qualify a continuation; absent reliable
   reset evidence, status names that missing signal and the recovery owner.
   Six hours passing, switching models or buying credits is not proof of a
   reset and grants no new authority.

#### Exploration, borrowing and challenge

| Candidate | Fit to the same goal and constraints |
| --- | --- |
| Preserve work and require manual resume | The simplest existing fallback avoids idle loops, but makes the observed developer rescue normal and does not fulfill automatic continuation in example 2. |
| Use an existing native wait/notification alone | Smallest solution where its lifetime and delivery are sufficient. Existing execution guidance already prefers this, but does not establish delivery after a coordinator yields or exits. |
| Retain the condition and use supported event delivery, with explicit attention on delivery loss | Recommended. Borrow the queue-consumer mechanism: the held execution is the consumer, supplier evidence is a message, the saved observation identifies what was already considered, and confirmed continuation acknowledges handling. Reconcile current state when attaching so a change between observing and waiting is not silently lost. |
| Add unconditional restart and quota-reset automation | Could cover closed hosts, but adds a broader service lifetime and recovery responsibility. No observed reset signal or cross-host delivery proof currently establishes that promise. |

The borrowing has a consequential limit: a supplier event cannot decide a
prose prerequisite or grant execution authority. Existing consumer judgment
still owns satisfaction, and uncertain native acknowledgment prevents claiming
exactly-once execution merely because an event was deduplicated.

The strongest doubt is that a solution could eliminate idle calls simply by
ending the coordinator and then lose the wake-up or its CI observation. That
would satisfy the cost wording while recreating the developer rescue. The
recommended boundary therefore needs observed automatic continuation on its
supported path and observable attention/recovery on its unsupported path;
saved state or an event receipt alone is insufficient.

#### Investigation evidence

Read-only observations in this preparation at
`99fba7f8485ce3cf27ae6ba66aed863b2c4dc763` on 2026-11-14:

- The retained SEED-324 coordinator message at 2026-11-13 16:41:34 UTC says
  its supplier paused again, with nothing published, while the consumer would
  keep watching. This confirms a paused prerequisite rather than a running
  proof command. The local history locator and measured interval remain in
  the [research evidence pointers](../../docs/maintainer/session-token-efficiency-research.md#codex).
- The four retained Claude notices all identify `error: rate_limit` and offer
  credits or a model switch; none supplies a reset timestamp. Local
  `claude --version` reports 2.1.325. Its `--help` and `agents --help`, and the
  existing [listing adapter](../../dashboard/server/hosts/claude/listing.ts),
  establish session continuation/listing inputs but expose no structured reset
  field. This bounded observation does not prove that no other supported
  reset signal exists. No model request, paid probe or settings change ran.
- The existing [Codex recovery](../../dashboard/server/hosts/codex/recovery.ts)
  reconciles a saved thread's history and refuses blind resend when acceptance
  is uncertain. It is first-input recovery, not a delivered supplier-resume
  mechanism. [Official lifecycle documentation](https://learn.chatgpt.com/docs/app-server#lifecycle-overview),
  fetched on 2026-11-14, describes resuming a thread and starting a turn in it;
  it does not establish this story's end-to-end wake-up or deduplication proof.
- Existing [delegation waits](../../src/skills/dough-execute-plan/references/delegation.md#await-delegated-results-without-empty-calls)
  and [overdue checks](../../src/skills/dough-execute-plan/references/overdue-delegated-verification.md)
  already forbid empty keep-alive calls and retain liveness ownership.
  [SEED-343 recovery](../../src/skills/dough-execute-plan/references/ci-completion-recovery.md)
  owns ended-observer recovery; the
  [Claude CI handoff](../../src/skills/dough-execute-plan/references/ci-background-handoff.md)
  is limited to a still-running interactive CI owner and cannot be assumed to
  resume an exited session or observe supplier changes.

Unsettled technical hypotheses are native delivery through the selected hold
boundary, acknowledgment/reconciliation without duplicate continuation, and
any reliable host usage-reset signal. Cheap source/CLI observations above
settle their available inputs, not those outcomes. Planning must bound the
native journey with an early feasibility probe
before dependent implementation. No automatic-resume or token-saving result
has been observed in this preparation.

#### Architecture

The proposed responsibility is execution continuation, not another story-state
authority. Reuse canonical supplier agreements and their
[evidenced satisfaction procedure](../../src/skills/dough-product-backlog/references/supplier-dependencies.md);
reuse native session identity/acceptance reconciliation and the existing CI
lifecycle rather than adding another dependency ledger or CI supervisor.
Machine-local wait/delivery evidence must remain distinct from authoritative
repository records. A dashboard can expose that evidence without becoming a
required authority for agent cooperation.

Relevant current Accepted decisions agree with the index:
[ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
requires one coherent representation and suitable reuse;
[ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md) requires native
evidence for new host mechanisms and separates it from deterministic tests;
[ADR 0006](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
keeps shared runtime behavior in one executing-agent source;
[ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
separates durable workflow facts from local session evidence; and
[ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md) requires
equivalent useful outcomes and proof, fewer idle requests, no extra developer
rescue, and accounting for implementation/maintenance effort before calling
this an observed improvement. ADRs 0007 and 0009 remain Proposed. No
Accepted-ADR conflict was identified in the recommended direction.

#### Decision and continuation

Terry selected the recommended supported-host automatic resume with actionable
fallback on 2026-11-14 (“as recommended”). No human scope decision remains.
Continue into slice planning in this preparation's workspace. Native feasibility
and comparative improvement remain execution observations, not inferred results;
refinement and the plan grant no execution authority.

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
