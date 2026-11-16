---
id: SEED-388
status: active
planted: 2026-11-16
planted_during: Terry Yin asked why Claude Code execution usage rose three times between 2026-10-25 and 2026-11-15
trigger_when: selected from the product backlog
scope: four stories
---

# SEED-388 — Measure and control what agent launches cost

The [Claude Code usage spike analysis](../../docs/maintainer/claude-code-execution-usage-spikes-2026-11.md)
found that the Usage index hid much of the cost of executions that needed a
developer, and associated an unrequested effort level with roughly three times
the cost across 11 executions. The index now counts a launch's work after a
developer reply on both tools; two Claude Code reader gaps below still lose
some responses. The [SEED-345](SEED-345-session-token-efficiency.md)
efficiency trials are judged with the comparable-run measure below, on this
index at a known effort, so the corrections come first.

<a id="count-nested-claude-background-agent-work"></a>

### Count a Claude Code background agent started by a subagent

**Identity:** SEED-388#count-nested-claude-background-agent-work
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **Problem.** A background agent started by a Claude Code subagent
  (`spawnDepth` 2) has its responses climb to no launch input, and no
  coverage gap names them. SEED-334#run-and-observe-product-wide-end-to-end-tests
  shows 56.33M against 74.03M of transcript cost: its 15 second-level agents
  hold the missing 846 responses (17.70M).
- **Observed cause.** When a climb reaches the first row of a worker
  transcript, `dashboard/server/claudeUsageAncestry.ts` looks up the worker
  join by the original response's agent, not by the agent whose file the row
  is in, so a climb from a second-level agent revisits its own join and never
  reaches the root transcript.
- **Evaluation.** SEED-334's launch matches its transcript cost; a nested
  agent without a join keeps an explained gap.

<a id="read-claude-rows-with-unicode-line-separators"></a>

### Read Claude Code rows that contain Unicode line separators

**Identity:** SEED-388#read-claude-rows-with-unicode-line-separators
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **Problem.** A valid transcript row containing a raw U+2028 or U+2029 is
  split by Node's `readline` in `nativeUsageLines`
  (`dashboard/server/nativeUsageFiles.ts`) and recorded as
  `malformed-native-row`; its response is lost, and later rows whose parent
  link runs through it fail to climb.
  SEED-124#save-pronunciations-as-note-properties shows 12.74M against 15.42M
  (82 of 434 responses missing). The store holds 3,312
  `malformed-native-row` gaps; how many share this cause is unmeasured.
- **Evaluation.** Such rows are read whole on Codex and Claude Code, and
  SEED-124's launch matches its transcript cost.

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
  records, including a launch's work after a developer reply, except the
  responses [the two reader-gap stories](#count-nested-claude-background-agent-work)
  recover.
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
