---
id: SEED-388
status: active
planted: 2026-11-16
planted_during: Terry Yin asked why Claude Code execution usage rose three times between 2026-10-25 and 2026-11-15
trigger_when: selected from the product backlog
scope: three stories
---

# SEED-388 — Measure and control what agent launches cost

The [usage spike analysis](../../docs/maintainer/claude-code-execution-usage-spikes-2026-11.md) found that the Usage index hides much of the
cost of executions that needed a developer, and that an unrequested effort
level roughly tripled 11 executions. The
[SEED-345](SEED-345-session-token-efficiency.md) efficiency trials are judged
with the comparable-run measure below, on this index at a known effort, so the
two corrections come first.

<a id="count-claude-code-work-after-a-developer-reply"></a>

### Count a Claude Code launch's work after a developer reply

**Identity:** SEED-388#count-claude-code-work-after-a-developer-reply
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **Scope and beneficiary.** Correction to the delivered Claude Code task
  usage in System settings → Usage. A developer reading Usage sees the whole
  cost of a Claude Code launch, including the work after they answered or
  nudged it.
- **Evaluation.** Given a launch whose session receives developer input after
  its first turn, its Token index includes the root and subagent responses of
  every later turn until the launch ends, and no turn of another launch. A
  launch with a single input keeps its value. Re-measured over the 30 days to
  2026-11-16, the 82 affected executions match their launch-window transcript
  cost.
- **Priority.** First. Every story in
  [SEED-345](SEED-345-session-token-efficiency.md) is judged on this index. Today
  it counts only the first human-input turn: the affected executions show a
  median of 0.53 of their cost, and SEED-192#open-development-intent-frame
  shows 0.14M against 7.0M after a reply of "1" in its second minute. The
  executions that need a developer are often the costliest.
- **Effort and boundary.** Small, high confidence. Each Claude Code launch
  record keeps a single `nativeTurns` entry. Codex attribution was not
  examined; refinement checks it.
  [Usage index undercount](../../docs/maintainer/claude-code-execution-usage-spikes-2026-11.md#usage-index-undercount)

<a id="show-the-effort-a-launch-runs-with"></a>

### Show and keep the effort a Claude Code launch runs with

**Identity:** SEED-388#show-the-effort-a-launch-runs-with
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **Scope and beneficiary.** Dashboard launches on Claude Code. A developer
  starting a session knows the model and effort it will run with, including
  when they choose none. A changed user-level Claude Code default no longer
  silently changes what an Open Dough launch costs.
- **Evaluation.** Given no explicit effort, the launch dialog and the started
  session name the effort the launch resolves to before work begins. Given a
  user-level default of `high`, the developer sees `high` before starting.
  Choosing `high`, `xhigh` or `max` names its measured relative cost. Refinement
  decides whether Open Dough also passes its own default effort.
- **Priority.** Second. Opus launches that requested no effort ran at `high`
  from 2026-11-12 to 2026-11-15, roughly tripling 11 executions. Today's
  protection is one line in `~/.claude/settings.json` that the product does not
  read.
- **Effort and boundary.** Small, high confidence. Keeps the delivered effort
  choice at session start. Which effort suits which role stays
  [research](#research-kept-without-a-story).
  [Effort and model](../../docs/maintainer/claude-code-execution-usage-spikes-2026-11.md#effort-and-model)

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
- **Priority.** Third, after the two corrections above, which it relies
  on. Every [SEED-345](SEED-345-session-token-efficiency.md) story is judged on comparable runs, and
  each audit rebuilt its own accounting. The resume story can start from
  Codex's native usage before this exists.
- **Effort and boundary.** Medium, high confidence; the audits' methods are
  recorded. Read-only over local history; no quota or invoice claim.
  [Method and accounting](../../docs/maintainer/session-token-efficiency-research.md#window-scope-and-method)
- **Existing measure.** System settings → Usage already prices each finished
  dashboard launch per tool, for Codex and Claude Code, from the shared usage
  records. For Claude Code it counts only the launch's first human-input turn
  until [the first story](#count-claude-code-work-after-a-developer-reply)
  corrects it.
  Effort itself is a large variable: Opus slice agents cost 3.3× at `high` and
  7× at `max` compared with `medium`
  ([effort and model](../../docs/maintainer/claude-code-execution-usage-spikes-2026-11.md#effort-and-model)).
  A comparison therefore needs matched effort.

## Research kept without a story

Model and effort per role. Dashboard launches choose them per session on all
three hosts. Fable 5.2 carried 33% of Claude Code list-price cost on 21% of
requests, and its usage limit stalled four executions. No retained evidence
compares outcome quality by model or effort, so a story waits for that
comparison. [Model evidence](../../docs/maintainer/session-token-efficiency-research.md#cc1-model-choice-sets-the-price-of-each-unit-of-work)
Effort and model drove two of the three usage rises from 2026-11-09 to
2026-11-15: Opus `high` meant about 2.4× the turns, and Fable about 2.5× the
cost per turn. A launch that requests no effort inherits the user-level
Claude Code setting, which was `high` for 2026-11-12 to 2026-11-15.
[Effort and model](../../docs/maintainer/claude-code-execution-usage-spikes-2026-11.md#effort-and-model)
