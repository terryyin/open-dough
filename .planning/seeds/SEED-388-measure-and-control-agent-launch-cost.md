---
id: SEED-388
status: active
planted: 2026-11-16
planted_during: Terry Yin asked why Claude Code execution usage rose three times between 2026-10-25 and 2026-11-15
trigger_when: selected from the product backlog
scope: two stories
---

# SEED-388 — Measure and control what agent launches cost

The [Claude Code usage spike analysis](https://github.com/terryyin/open-dough/blob/ffdd3dd800a7325237adcfc9c54920956bb63f7b/docs/maintainer/claude-code-execution-usage-spikes-2026-11.md)
found that the Usage index hid much of the cost of executions that needed a
developer, and associated an unrequested effort level with roughly three times
the cost across 11 executions. The index now counts a launch's work after a
developer reply on both tools, background agents at any depth, and rows whose
text holds Unicode line separators. The [SEED-345](SEED-345-session-token-efficiency.md)
efficiency trials use the [retained effort command](../../dashboard/AGENT-EFFORT.md)
on this index at a known effort, so the remaining corrections come first.

<a id="replace-native-reader-gaps-on-reread"></a>

### Replace native reader gaps when a session is read again

**Identity:** SEED-388#replace-native-reader-gaps-on-reread
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/669-replace-native-reader-gaps-on-reread/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"4b4e221c433b058be50b8245c725d3bfb8b8d1fd9c4388faa8168c1f4ef4da93","plan":"85538b38d39345f48cbdcbfdd747915497fd967df4919fa47f1936be97c1eeff"}}
```

#### Goal

A maintainer reading the Usage store sees only the reader gaps a session's
native files still have. Today `malformed-native-row` and
`native-source-unreadable` gaps carry no host, so a write that reads their
session again keeps them: a live transcript's half-written last row, seen once
by Refresh, stays a gap after the row completes, contrary to
`dashboard/USAGE-HISTORY.md`. Correction of
SEED-388#read-claude-rows-with-unicode-line-separators.

#### Scope

- Reader gaps name their host, so import and Refresh replace them with the
  gaps a reread still reports, on Codex and Claude Code alike.
- Gaps already stored without a host stay as they are: automatic repair of
  stored history stays excluded.

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

## Dropped proposals

On 2026-11-16 Terry dropped role-based model and effort selection, a new
cumulative efficiency-experiment budget story, and a new records-only review
compliance follow-up. They are not queued or awaiting a research or watch
decision. The existing explicit-effort correction, diagnosis controls and
records-only delivery rule retain their own scope.
