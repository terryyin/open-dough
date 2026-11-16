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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/666-compare-agent-effort-on-comparable-runs/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"29cda17cb37f21448f3943dd0d56a84227fe031259be5cd834a60356b2002e36","plan":"fec8b797d9a96f2ae8edf72a79b00ca8aa205b84db2fff7ef9dce9dfab397833"}}
```

#### Goal

A maintainer comparing two executions can reproduce their agent effort per
host from retained local evidence without writing another audit. This supplies
the measure for the [SEED-345](SEED-345-session-token-efficiency.md) trials;
equivalent outcomes, proof and human effort remain part of judging improvement.

#### Scope

- A read-only local command reports one selected execution or compares a
  baseline and candidate. Selection identifies the task and its native turn
  boundary, or an explicitly bounded native session family; ambiguous matches
  are explained for correction rather than silently choosing the latest run.
- Each report includes coordinator and worker figures and their combined
  total: requests, total input, cached and uncached input, recorded cache writes
  (including lifetime splits), output, peak input per agent, and observed
  idle-wake requests. Peaks are maxima, never summed across agents. Failed,
  cancelled and later-turn work stays in its owning execution; copied ancestor
  responses and repeated streaming rows count once.
- Requested and observed model/effort are distinct; observed changes remain
  visible. Name host, service tier, selection/window, accounting definition,
  sources and guidance version. Missing guidance evidence is unknown; a
  maintainer-supplied version is labelled as supplied, not observed. Never use
  today's installation as evidence about a historical run.
- Missing ownership, native files, counters or wake evidence remains a named
  gap, with known subtotals distinguished from complete totals. Unavailable is
  not zero. Idle-wake counts use an explicit conservative evidence rule and
  describe exposure, not requests proved wasteful.
- Cursor reports token usage and unobservable wakes as unavailable. Its
  reproducible workflow measures are transcript/worker counts and bytes, tool
  calls, Read calls (including skill and plan reads), Task, AwaitShell and
  TodoWrite calls, resolving recorded dynamic-tool wrappers. Transcript bytes
  are not token or live-context estimates.
- A comparison shows per-host figures and deltas for like, known measures,
  alongside settings/coverage differences and supplied outcome, proof and
  human-intervention notes. It makes no automatic improvement or causal claim.
  Unknown or mismatched evidence does not prevent inspecting the known figures.
- Explicitly linked split-story continuations can be grouped for one delivered
  outcome, retaining each execution's figures. Repeating a selection cannot
  double-charge its responses. Aggregation neither recreates an oversized story
  nor blocks the smaller-story policy.
- Reproduce sampled published audit figures using their original windows and
  family boundaries; show whole-execution figures separately. Reading history
  does not launch agents, call provider APIs, refresh Usage or rewrite history.

**Deferred promises:** dashboard comparison UI, automatic trial execution or
matching, inferred quality/intervention scores, quotas/invoices, new pricing,
and account-wide completeness. Existing Usage pricing and launch controls keep
their scope. Deterministic timing and defect repairs need not wait for this tool.

#### Key examples

- **Reproduce an audit.** Select Codex SEED-324 family `01a1d22f…` and the
  original audit window → 11 threads, 2,083 requests and 436,806,678 tokens;
  selecting the entire execution reports its later work too, with a different
  boundary explicitly named.
- **Mixed settings.** Select Claude Code SEED-324 session `296b888d…` → its
  coordinator peak is 752,562 input tokens, with Fable/medium and Opus/high
  reported separately; the request at launch does not replace those facts.
- **Cursor evidence.** Select SEED-313 session `a6169ce7…` → token fields are
  unavailable, with 15 TodoWrite calls and eight PLAN.md reads reproducible
  from its retained transcript. A missing worker stays a gap, not a zero cost.
- **A misleading saving.** Candidate tokens fall but its effort differs or its
  supplied proof/intervention notes show more rescue → the report shows the
  differences and deltas without declaring an improvement.
- **One outcome in smaller stories.** Select two linked continuation executions
  on one side and a baseline execution on the other → show each execution and
  the deduplicated group total; keep per-agent peaks and per-host measures.
- **No fresh audit possible.** A selected launch retains stored counters but
  has lost native files → show the recoverable counters with their provenance,
  and identify peak/wake/ownership evidence that cannot be reconstructed.

#### Alternatives, challenge and interaction

Working direction: a local command and a readable report, with machine-readable
figures for reruns. Existing Usage is the strongest simpler alternative: it
already owns task accounting but omits peaks, wake evidence and Cursor measures.
A Usage-screen comparison would improve discoverability while adding UI/API
work; an experiment runner would control conditions while adding paid launches
and a different operational responsibility. Both are deferred.

Borrow paired-case measurement: executions are the cases, a stated delivered
outcome and conditions are the matching basis, and one accounting definition is
the instrument. Show those beside the deltas. The limit is consequential:
historical stories are not controlled repetitions, so matching labels cannot
establish equivalent quality or causation. The strongest doubt is that lower
tokens could merely reflect less delivered/proved work or more human rescue;
the maintainer retains that judgment under ADR 0010. These are implementation
defaults within the selected read-only measure, not a new approval gate.

#### Architecture and evidence

Reuse the native readers, response reconciliation and task ownership already
used by Usage; expose their read phase separately from persistence. Extend no
workflow authority or application database ([ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)).
Keep host-specific observation separate from shared accounting. Native snapshots
are sufficient for this read-only integration's proof; new paid sessions are
not part of this preparation ([ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md)).
Compare outcome and proof before interpreting effort ([ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md)).

The [original method](https://github.com/terryyin/open-dough/blob/ffdd3dd800a7325237adcfc9c54920956bb63f7b/docs/maintainer/session-token-efficiency-research.md#window-scope-and-method)
is recoverable in Git. Read-only observations on 2026-11-16 reproduced the three
examples above; the plan retains the replay and limits. Current summary records
already retain root/worker token totals and settings, but discard response-level
peaks and tool-result evidence. Historical guidance versions and equivalence of
outcomes cannot be inferred from those totals. No Accepted ADR conflict found.

## Dropped proposals

On 2026-11-16 Terry dropped role-based model and effort selection, a new
cumulative efficiency-experiment budget story, and a new records-only review
compliance follow-up. They are not queued or awaiting a research or watch
decision. The existing explicit-effort correction, diagnosis controls and
records-only delivery rule retain their own scope.
