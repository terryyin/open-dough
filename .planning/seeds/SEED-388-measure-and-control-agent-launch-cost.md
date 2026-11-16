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
found that the Usage index hid much of the cost of executions that needed a
developer, and associated an unrequested effort level with roughly three times
the cost across 11 executions. The index now counts a launch's work after a
developer reply on both tools, and background agents at any depth; one
Claude Code reader gap below still loses some responses. The [SEED-345](SEED-345-session-token-efficiency.md)
efficiency trials are judged with the comparable-run measure below, on this
index at a known effort, so the corrections come first.

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
