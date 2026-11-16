---
id: SEED-388
status: active
planted: 2026-11-16
planted_during: Terry Yin asked why Claude Code execution usage rose three times between 2026-10-25 and 2026-11-15
trigger_when: selected from the product backlog
scope: three stories
---

# SEED-388 — Measure and control what agent launches cost

The [Claude Code usage spike analysis](../../docs/maintainer/claude-code-execution-usage-spikes-2026-11.md)
found that the Usage index hides much of the cost of executions that needed a
developer, and associated an unrequested effort level with roughly three times
the cost across 11 executions. The Codex follow-up below confirms that its
post-reply work is also missing from the launch index. The
[SEED-345](SEED-345-session-token-efficiency.md) efficiency trials are judged
with the comparable-run measure below, on this index at a known effort, so the
two corrections come first.

<a id="count-claude-code-work-after-a-developer-reply"></a>

### Count a launch's work after a developer reply

**Identity:** SEED-388#count-claude-code-work-after-a-developer-reply
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **Scope and beneficiary.** Correction to the delivered Codex and Claude Code
  task usage in System settings → Usage. A developer reading Usage sees the
  whole cost of a launch, including the work after they answered or nudged it.
- **Evaluation.** Given a launch whose session receives developer input after
  its first turn, its Token index includes the root and subagent responses of
  later turns that continue that launch until it ends, and no turn of another
  launch or unrelated task in the same session. Later-turn workers count once,
  excluding copied ancestor responses. A launch with a single input keeps its
  value. Re-measured over the 30 days to 2026-11-16, the 82 affected Claude Code
  executions match their launch-window transcript cost. Codex acceptance covers
  the SEED-324 supplier-watch continuation and Doughnut SEED-073 checkpoint
  replies below, plus a separate-launch exclusion and a single-input control.
  Ambiguous ownership stays an explained gap rather than charging every turn
  within a time window to the launch.
- **Priority.** First. Every story in
  [SEED-345](SEED-345-session-token-efficiency.md) is judged on this index. Today
  it omits continuing human-input turns: affected Claude Code executions show
  a median of 0.53 of their cost, and SEED-192#open-development-intent-frame
  shows 0.14M against 7.0M after a reply of "1" in its second minute. The
  executions that need a developer are often the costliest.
- **Effort and boundary.** Shared correction, with sizing confirmed during
  refinement. Both sampled hosts' launch records keep a single `nativeTurns`
  entry. The evidence establishes the undercount, not a safe association rule
  for every later input; refinement resolves that rule for each host.
  [Usage index undercount](../../docs/maintainer/claude-code-execution-usage-spikes-2026-11.md#usage-index-undercount)

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
  [the original trace](../../docs/maintainer/blocked-execution-experiment-findings.md#what-the-original-trace-establishes).
- Doughnut `SEED-073#keep-answered-questions-with-their-tracker`, thread
  `01a1d285-5f73-77a1-9c74-724be6436d35`: the launch index is 29.84M. Its
  attributed root turn has 635 responses; 1,426 later root responses account
  for another 25.35M during checkpoint and completion continuations.

The additional figures exclude later-turn workers and are not repaired launch
totals. Locate these thread IDs in `~/.codex/sessions` or
`~/.codex/archived_sessions`; match continuation inputs and boundaries before
using them as corrected launch acceptance values.

<a id="show-the-effort-a-launch-runs-with"></a>

### Show and keep the effort a Claude Code launch runs with

**Identity:** SEED-388#show-the-effort-a-launch-runs-with
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/664-show-the-effort-a-launch-runs-with/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"b4cd57368aa87f3d4902ce3785a457051e5e06c2d5fd6a345472df26136666b7","plan":"7abd98619a447dda51854b35c7e977d44c131c46649f5078e46bbb7144666e66"}}
```

**Goal.** A developer starting a Claude Code session from the dashboard knows
the effort it will run with before it starts, and a change to their user-level
Claude Code settings no longer silently changes what an Open Dough launch
costs. This keeps the efficiency comparisons in
[SEED-345](SEED-345-session-token-efficiency.md) on a known effort.

**Scope.**

- Every Claude Code session the dashboard starts passes an explicit effort.
  The launch dialog's Reasoning effort for Claude Code opens on `medium`,
  marked as Open Dough's default, and offers low, medium, high, xhigh and max.
  The "Use your Claude Code setting" choice is removed for Claude Code: it is
  the path whose effort no Open Dough surface can name, and keeping it would
  keep the silent dependency the goal removes.
- Choices above `medium` name their measured relative cost beside the level:
  high and xhigh about 3×, max about 7× the cost of `medium`, as measured on
  Opus slice agents. `low` names no figure; none was measured.
- Feedback maintenance sessions started on Claude Code run at the same
  default, and its status line names that effort.
- The launch record keeps the effort it passed. A Claude Code session's
  details name it as the requested effort, beside the requested model.
  Records from before this change, which kept no effort, show none.
- Codex and Cursor launches keep their current effort behavior.

**Decision.** Open Dough passes its own default rather than predicting the
inherited one. Prediction would replicate Claude Code's private settings
precedence (managed, project, user, per-model `modelSettings`, environment)
and would still let a user-level change alter the cost, only visibly.

**Deferred promises.**

- Predicting or showing the effort a session would inherit from Claude Code
  settings.
- Showing the effort a session actually ran with, read from its transcript.
  Claude Code records it on every response (`effort`), and the Usage records
  already keep it. Explicit passing makes the requested value the effective
  one, except where Claude Code drops an effort a model does not take.
- A Claude Code effort choice in the feedback maintenance setting, and a
  configurable Open Dough default. Role-based model and effort selection was
  dropped by Terry on 2026-11-16.

**Key examples.**

- **Default launch.** A developer opens Start execution on Claude Code with
  Opus and leaves Reasoning effort untouched → the dialog shows `medium
  (Open Dough default)`; the session starts with `--effort medium`, and its
  Session details name `medium` as the requested effort.
- **User-level `high`.** `~/.claude/settings.json` sets `effortLevel` or
  Opus's `modelSettings` effort to `high` → the same untouched launch still
  runs at `medium`, and so do its subagents, since Claude Code passes the
  session's effort to them.
- **Costly choice.** The developer picks `max` → the option reads about 7× the
  cost of `medium` before starting; the session starts with `--effort max`
  and its details name `max`.
- **Feedback maintenance.** Feedback maintenance is On for Claude Code with
  Default model → its session starts with `--effort medium`, and the status
  line reads, for example, "On, Claude Code, Default, medium effort".
- **Older record.** A Claude Code session recorded before this change, with no
  effort → its details show no effort line.

**Evidence.**

- Claude Code transcripts record each response's resolved effort; in a
  2026-11-09 launch that chose `max`, all 11 subagents ran at `max`.
- `claude --effort` sets the session's effort (Claude Code 2.1.325).
- The relative costs come from the
  [effort and model](../../docs/maintainer/claude-code-execution-usage-spikes-2026-11.md#effort-and-model)
  table: median Opus slice agent 0.47 at medium, 1.53 at high, 1.55 at xhigh,
  3.35 at max. These are uncontrolled comparisons across stories.

**Priority.** Second. Opus launches that requested no effort ran at `high`
from 2026-11-12 to 2026-11-15, roughly tripling 11 executions. Today's
protection is one line in `~/.claude/settings.json` that the product does not
read.

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
  [Method and accounting](../../docs/maintainer/session-token-efficiency-research.md#window-scope-and-method)
- **Existing measure.** System settings → Usage already prices each finished
  dashboard launch per tool, for Codex and Claude Code, from the shared usage
  records. On Claude Code and the sampled Codex launches it omits continuing
  work after the first human-input turn until
  [the first story](#count-claude-code-work-after-a-developer-reply) corrects it.
  Effort itself is a large variable: Opus slice agents cost 3.3× at `high` and
  7× at `max` compared with `medium`
  ([effort and model](../../docs/maintainer/claude-code-execution-usage-spikes-2026-11.md#effort-and-model)).
  A comparison therefore needs matched effort.

## Dropped proposals

On 2026-11-16 Terry dropped role-based model and effort selection, a new
cumulative efficiency-experiment budget story, and a new records-only review
compliance follow-up. They are not queued or awaiting a research or watch
decision. The existing explicit-effort correction, diagnosis controls and
records-only delivery rule retain their own scope.
