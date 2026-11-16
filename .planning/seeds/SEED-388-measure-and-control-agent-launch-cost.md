---
id: SEED-388
status: active
planted: 2026-11-16
planted_during: Terry Yin asked why Claude Code execution usage rose three times between 2026-10-25 and 2026-11-15
trigger_when: selected from the product backlog
scope: three stories
---

# SEED-388 — Measure and control what agent launches cost

The [Claude Code usage spike analysis](https://github.com/terryyin/open-dough/blob/ffdd3dd800a7325237adcfc9c54920956bb63f7b/docs/maintainer/claude-code-execution-usage-spikes-2026-11.md)
found that the Usage index hides much of the cost of executions that needed a
developer, and associated an unrequested effort level with roughly three times
the cost across 11 executions. The Codex follow-up below confirms that its
post-reply work is also missing from the launch index. The
[SEED-345](SEED-345-session-token-efficiency.md) efficiency trials are judged
with the comparable-run measure below, on this index at a known effort, so the
two corrections come first.

<a id="count-claude-code-work-after-a-developer-reply"></a>

### Count a dashboard launch's work after a developer reply

**Identity:** SEED-388#count-claude-code-work-after-a-developer-reply
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/665-count-launch-work-after-a-developer-reply/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"c2a37d487bc531ca6d7a19974b5806e6b43064c2f60fafa59ffb873bc54feb08","plan":"0ddf0a6791ebad8416ee337380771d2d67074586c4a2b10880e7f0d11e211ab4"}}
```

#### Goal

A developer or maintainer reading System settings → Usage sees the whole cost
of a dashboard launch on Claude Code or Codex, including the work after they
answered, chose an option or nudged it. Every
[SEED-345](SEED-345-session-token-efficiency.md) story is judged per tool on
this index, and today the launches that needed a developer, often the
costliest, show only part of their cost.

#### Scope

- **A reply continues its launch.** A later developer input in a launch's
  session belongs to that launch: its root and subagent (Claude Code) or worker
  (Codex) responses count in the launch's Token index. One rule serves both
  tools. A later-turn worker counts once; responses a worker copies from its
  ancestors are not its own.
- **Until another task starts.** The launch keeps later inputs until an input
  in the same session starts another task: a recognised Open Dough workflow
  invocation or another dashboard launch's reporting context. From then on the
  turns belong to that task, and no response counts in two tasks.
- **Ambiguous ownership stays a gap.** A response whose turn no task can be
  shown to own stays an explained coverage gap; no turn is charged to a
  launch by time window alone.
- **After a completion report.** A reported completion does not end the
  launch. Reason: the developer often continues the same work after an early
  report, such as landing or a CI repair.
- **Unchanged.** A launch with a single input keeps its value. Which launches
  Usage shows, the tariff, pricing, coverage gaps, and the chart and task
  detail stay as they are.
- **History.** Retained records are recomputed from the native transcripts
  still on the machine. A launch whose transcripts are gone keeps its recorded
  value.

**Scope limits (deferred promises):**

- Splitting a launch's cost by turn or showing the developer's inputs in task
  detail.
- Changing how sessions started outside the dashboard are recovered as tasks.

#### Key examples

- **Claude Code reply.** SEED-192#open-development-intent-frame's execution
  shows 0.14M today. The developer answered "1" two minutes into a ten-hour
  execution. → Its index includes every root and subagent response after that
  answer, close to its 7.0M transcript cost.
- **Codex reply.** A Codex refinement launch asks a question and the developer
  answers "yes" in a new turn. → The responses of that turn count in the
  launch's index; today about half the launch's usage records belong to no
  task.
- **After completion.** An execution reports completion; the developer then
  types "merge the changes and land", and later "retry". → Both turns count in
  that execution.
- **Another task.** After an execution, the developer types `/dough-land` in
  the same session. → That turn and its successors count in the land task, and
  the execution's index stops before it.
- **Codex supplier watch.** Open Dough SEED-324#close-landed-ci-repeat-check-gaps
  (thread `01a1d22f…`) shows 6.23M. The developer answered "OK", then "you
  watch it", and asked about the wait. → The later root responses, another
  22.36M before workers, count in that launch.
- **Codex checkpoints.** Doughnut SEED-073#keep-answered-questions-with-their-tracker
  (thread `01a1d285…`) shows 29.84M. The developer answered "yes", "LGTM",
  "go ahead" and "approved" at checkpoints. → The later root responses,
  another 25.35M before workers, count in that launch.
- **Single input.** A launch that receives no later input. → Its value is
  unchanged.

#### Evaluation

Re-measured over the 30 days to 2026-11-16 from retained transcripts:

- the 82 Claude Code executions with a later developer input match their
  transcript cost from launch until the next task-starting input; and
- none of the 84 Codex launches with a later developer turn leaves that turn's
  responses without a task, and the two Codex examples gain their later-turn
  root and worker responses.

#### Architecture

- **Owner.** Turn membership becomes one rule in the shared native task fact
  reading, recorded in each task's `nativeTurns`, which both tools'
  association already reads. A Claude Code response already climbs to the
  input that began its turn; a Codex response already names its turn. Neither
  association adds a separate rule.
- **One active task.** The reader's notion of the active task serves turn
  membership and completion-receipt joining alike. Today the Claude Code
  reader drops its active task at a plain reply and the Codex reader keeps it,
  so the two tools differ.
- **Considered.** Walking Claude Code's parent links past a reply to the
  launch's input covers only Claude Code, since Codex turns have no parent
  link. A time window per session would attribute responses without native
  turn evidence.

#### Evidence

- [Usage index undercount](https://github.com/terryyin/open-dough/blob/ffdd3dd800a7325237adcfc9c54920956bb63f7b/docs/maintainer/claude-code-execution-usage-spikes-2026-11.md#usage-index-undercount):
  82 of 265 Claude Code executions, median 0.53 of their cost.
- Codex, observed 2026-11-16 from retained sessions and
  `~/.open-dough/dashboard/launch-history/usage.json`: 84 of 266 Codex launches
  since 2026-10-17 (42 executions, 33 refinements) have a later developer turn
  that no task claims.
- Claude Code, same observation: 19 later inputs came after a reported
  completion and continued the same work; 4 started another task.

**Codex evidence, rechecked 2026-11-16.** Native `token_usage_record` rows were
deduplicated by response ID, restricted to the containing thread and the
original launch-to-report window, and compared with the retained task's
`nativeTurns`. Under the chart's Sol tariff, values below are millions of
input-token equivalents, not raw processed tokens:

- Open Dough `SEED-324#close-landed-ci-repeat-check-gaps`, native thread
  `01a1d22f-e0cd-7032-930d-5a9ff3011a64`: the launch index is 6.23M. Its
  attributed root turn has 235 responses; 1,453 later root responses account
  for another 22.36M. The retained audit describes the developer-requested
  supplier watch and its stop in
  [the original trace](https://github.com/terryyin/open-dough/blob/ffdd3dd800a7325237adcfc9c54920956bb63f7b/docs/maintainer/blocked-execution-experiment-findings.md#what-the-original-trace-establishes).
- Doughnut `SEED-073#keep-answered-questions-with-their-tracker`, thread
  `01a1d285-5f73-77a1-9c74-724be6436d35`: the launch index is 29.84M. Its
  attributed root turn has 635 responses; 1,426 later root responses account
  for another 25.35M during checkpoint and completion continuations.

The additional figures exclude later-turn workers and are not repaired launch
totals. Locate these thread IDs in `~/.codex/sessions` or
`~/.codex/archived_sessions`; match continuation inputs and boundaries before
using them as corrected launch acceptance values.

<a id="name-the-effort-a-session-ran-with"></a>

### Name the effort a Claude Code session actually ran with

**Identity:** SEED-388#name-the-effort-a-session-ran-with
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **Scope and beneficiary.** A developer reading a Claude Code session started
  from the dashboard sees the effort it actually ran with, not only the effort
  Open Dough requested. Every new launch already passes an explicit effort
  (default `medium`) and its Session details name it as requested.
- **Evaluation.** Session details name the observed effort, read from the
  session's transcript, where Claude Code records it on every response and the
  Usage records already keep it. Where Claude Code dropped an effort the model
  does not take, the observed value differs from the requested one and both are
  shown. A session recorded before efforts were passed shows its observed
  effort when the transcript has one.
- **Candidate extensions, unselected.** A Claude Code effort choice in the
  feedback maintenance setting, and a configurable Open Dough default effort.
  Role-based model and effort selection was dropped on 2026-11-16. Predicting
  the effort a session would inherit from Claude Code settings no longer
  applies to new launches.
- **Priority.** Last; requested and effective effort agree except for a model
  that drops an effort.

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
  role split for coordinator and workers, including failed, cancelled and
  later-turn work. It names requested and observed model/effort, the installed
  guidance version, and ownership or counter gaps. Where a host retains no
  usage, the result says so and reports the agreed workflow counts instead.
  The three audits' published figures for a sampled execution are reproduced.
  Linked split-story continuations can also be summed for one delivered
  outcome, retaining each story's own figures. Smaller stories remain an
  improvement; aggregation neither requires recreating an oversized story nor
  blocks the smaller-story policy.
- **Priority.** Third in the backlog, after the two corrections above and
  before context or tool-set trials. Every
  [SEED-345](SEED-345-session-token-efficiency.md) trial uses comparable runs,
  and each audit rebuilt its own accounting. Keep this a small reproducible
  measure. Deterministic timing and defect repairs can proceed from retained
  native evidence without waiting for this tool.
- **Effort and boundary.** Medium, high confidence; the audits' methods are
  recorded. Read-only over local history; no quota or invoice claim.
  [Method and accounting](https://github.com/terryyin/open-dough/blob/ffdd3dd800a7325237adcfc9c54920956bb63f7b/docs/maintainer/session-token-efficiency-research.md#window-scope-and-method)
- **Existing measure.** System settings → Usage already prices each finished
  dashboard launch per tool, for Codex and Claude Code, from the shared usage
  records. On Claude Code and the sampled Codex launches it omits continuing
  work after the first human-input turn until
  [the first story](#count-claude-code-work-after-a-developer-reply) corrects it.
  Effort itself is a large variable: Opus slice agents cost 3.3× at `high` and
  7× at `max` compared with `medium`
  ([effort and model](https://github.com/terryyin/open-dough/blob/ffdd3dd800a7325237adcfc9c54920956bb63f7b/docs/maintainer/claude-code-execution-usage-spikes-2026-11.md#effort-and-model)).
  A comparison therefore needs matched effort.

## Dropped proposals

On 2026-11-16 Terry dropped role-based model and effort selection, a new
cumulative efficiency-experiment budget story, and a new records-only review
compliance follow-up. They are not queued or awaiting a research or watch
decision. The existing explicit-effort correction, diagnosis controls and
records-only delivery rule retain their own scope.
