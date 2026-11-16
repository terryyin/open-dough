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
developer reply on both tools, and background agents at any depth; one
Claude Code reader gap below still loses some responses. The [SEED-345](SEED-345-session-token-efficiency.md)
efficiency trials use the [retained effort command](../../dashboard/AGENT-EFFORT.md)
on this index at a known effort, so the remaining corrections come first.

<a id="read-claude-rows-with-unicode-line-separators"></a>

### Read Claude Code rows that contain Unicode line separators

**Identity:** SEED-388#read-claude-rows-with-unicode-line-separators
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/667-read-claude-rows-with-unicode-line-separators/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"84ed9ddcae96b9fed4b098676169e5c783ffbda8e138887dc200cadbd2250d5c","plan":"6a9ca7bea76624977a5a6e54f01d7ccf6adf02cf10f914afe1cd48fb4029f83e"}}
```

#### Goal

A maintainer reading the Usage index sees every response a launch's native
transcripts record, including a response whose row text contains a raw U+2028
or U+2029. Today Node's `readline` in `nativeUsageLines`
(`dashboard/server/nativeUsageFiles.ts`) treats those characters as line ends,
so the row is recorded as `malformed-native-row`, its response is lost, and
later rows whose parent link runs through it fail to climb.
SEED-124#save-pronunciations-as-note-properties shows 12.74M against 15.42M
(82 of 434 responses missing). This removes the last known Claude Code reader
gap before the comparable-run measure below relies on the index.

#### Scope

- The native reader frames rows on newline only, as JSON Lines defines them,
  so a row with a raw U+2028 or U+2029 is read whole on Codex and Claude Code,
  in import and Refresh alike. A gap's line number is the file's line.
- A row that is still not valid JSON stays a `malformed-native-row` gap, and
  the reader stays bounded in memory: no whole-file read.
- Existing stores gain the responses on their next `import`, as
  `dashboard/USAGE-HISTORY.md` recovers a store; Refresh rereads only sessions
  that changed. Automatic repair of stored history is excluded, as for the
  nested-agent correction.

#### Key examples

- A Claude Code worker transcript holds a valid assistant row whose text
  contains U+2028, followed by rows whose parent link runs through it → import
  → the row's response is counted, the later rows reach their launch, and no
  `malformed-native-row` gap is recorded for that file.
- A Codex rollout row containing U+2029 → import → read whole, no gap.
- A file with a truncated last row → import → that row is still one
  `malformed-native-row` gap at its own line; earlier responses are counted.
- After one real-store import, SEED-124's launch counts all its responses and
  matches its 15.42M transcript cost.

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
