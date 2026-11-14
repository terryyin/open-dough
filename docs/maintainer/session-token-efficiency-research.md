# Session token efficiency across Open Dough projects

This November 2026 review retains the Codex, Cursor and Claude Code audits.
[SEED-345](../../.planning/seeds/SEED-345-session-token-efficiency.md) points
here for future consideration of the suggested improvements. The observations,
opportunities and evaluation questions are research inputs.

**File-size exception.** On November 14, 2026, Terry Yin explicitly approved
keeping the audit's findings, method, evidence and opportunities together
beyond the 250-line file-size check. The audit moved here at Terry's request.
This is the single document carrying that exception.
See the [file-size check](../../src/skills/dough-post-change-refactor/references/refactor-checks.md#file-size).

## Window, scope and method

All three host audits used the same production roster from
`~/.open-dough/dashboard/projects-production.json`: Open Dough, Doughnut,
Pygardon, Lizard, Terry Talks and hidden Clipboard. A local project or sidebar
entry by itself did not establish roster membership. Open Dough is included
because it installs its own guidance and is part of the production roster.
Terry Talks and Clipboard contributed no in-window sessions on any host.
Lizard contributed no Claude Code sessions.

The audits cover overlapping calendar days on the same machine but are not
identical instruments or units. The Codex and Claude Code audits share one
48-hour window; the Cursor window is wider. Codex supplies native per-request
token usage. Claude Code transcripts also carry per-request API usage,
including cache writes and their cache lifetime. Cursor supplies
agent-transcript JSONL without per-request usage fields. Shared findings below
cite every host whose mechanism matches. Host-distinct findings keep an
explicit Codex, Cursor or Claude Code label.

### Codex audit

- Window from November 12, 2026 at 08:03:56 through November 14, 2026 at
  08:03:56 Singapore time, with the end excluded. In UTC this is
  `[2026-11-12T00:03:56Z, 2026-11-14T00:03:56Z)`.
- The original audit used Codex's native session telemetry on this machine.
  It cross-checked the read-only `~/.codex/state_5.sqlite` thread index
  against the union of indexed rollout paths and recently modified JSONL
  transcript files under `~/.codex/sessions` and
  `~/.codex/archived_sessions`. The original union contained 616 paths
  for 615 indexed candidates plus a file candidate.
- Project attribution used the checkout or worktree path and, where needed,
  recorded Git origin and parent linkage. Six scratch threads from the
  controlled Intent Coverage experiment, including three coordinators and
  three workers, are booked to Open Dough because it ran the research. The
  experiment exercised Doughnut SEED-122 and used 94 requests and 4,082,066
  total tokens. Doughnut's ad hoc recall study is booked to Doughnut through
  the worktree's Git origin.
- The accounting uses each in-window `token_usage_record.usage` once per
  response ID, with the recorded thread ID matching the containing rollout.
  This counts a worker's own model requests and excludes copied ancestor
  events from forked histories. It also avoids adding the cumulative
  `token_count` snapshots, SQLite's lifetime `tokens_used`, or the
  usage record embedded in a compaction summary a second time. All 55
  in-window compaction summaries had a matching response usage record.
- The audit included dashboard launches, desktop sessions, resumed threads,
  subagents, automations, and Guardian reviews. The audit thread itself was
  excluded. Of 598 retained thread records, 594 had model usage. The other
  four were Guardian records with a settings event only. Nine threads were
  created before the window. No archived activity was identified for it.
- All in-scope thread logs were processed for usage, command and outcome
  signals. Qualitative follow-through focused on the largest clusters,
  representative cases and suspected waste. The audit cross-checked recorded
  outcomes against relevant worktree, plan or Git evidence when available.
  It was an exploratory retrospective on locally retained history.

### Cursor audit

- Window of about 72 hours ending November 14, 2026 at approximately 08:12
  Singapore time (from November 11, 2026 at 08:12). This is wider than the
  Codex window by roughly one day at the start and is not claimed as the same
  cohort.
- Sessions are Cursor `agent-transcripts` JSONL under
  `~/.cursor/projects/Users-terryyin-git-<project>(-worktrees-…)*/agent-transcripts/`,
  including nested `subagents/` transcripts. Attribution used the Cursor
  project directory name mapped to the production roster ids.
- Each JSONL record retains user and assistant text plus `tool_use` inputs.
  Most `tool_result` payloads are absent from these files, so absolute token
  totals cannot be reconstructed the way Codex rollouts allow. Counts below
  are session, tool-call and read-pattern metrics. Live context is larger
  than transcript bytes.
- Role heuristic from the first `<user_query>`: coordinator
  (`/dough-execute-plan` / Established start), implementer (Implement slice /
  implementation agent), refactor (post-change refactor), and other
  (refinement, bug fixing, ad hoc). Qualitative follow-through focused on the
  largest coordinator families and their implementers.
- No Cursor-native `doctor`, per-request usage export or account `/usage`
  equivalent was available for this audit. Discovery of Cursor skills and MCP
  tools found Canvas and Visualize for presentation, and SDK `summarize` for
  shrinking one live conversation — none mine cross-project transcripts for
  cost. The Cursor audit therefore used filesystem inventory plus scripted
  pattern analysis, then a Canvas report for the working draft.

### Claude Code audit

- Same window as the Codex audit, `[2026-11-12T00:03:56Z, 2026-11-14T00:03:56Z)`,
  applied to each request's own timestamp. Sessions that started earlier
  contribute only their in-window requests.
- Sessions are Claude Code transcripts under
  `~/.claude/projects/-Users-terryyin-git-<project>(--worktrees-…)*/<session>.jsonl`
  with subagents under `<session>/subagents/agent-*.jsonl` and their
  `.meta.json` descriptions. Attribution used the project directory name
  mapped to the roster ids. The audit session itself was excluded.
- Each assistant record carries the API `usage` of its request. Streaming
  splits one response across records, so usage counts once per message ID.
  `usage.cache_creation` separates five-minute and one-hour cache writes.
  Synthetic harness messages carry no model usage and were excluded from
  accounting but searched for limit notices.
- Claude Code also records each session's own cost estimate. Recomputing that
  estimate from the request usage reproduced it exactly, so the audit weights
  token types with the same list prices: Opus 5.5 at $4 input, $20 output,
  $0.20 cache read, $5 five-minute and $8 one-hour cache write per million
  tokens; Fable 5.2 at twice those, except cache reads at the same $0.20.
  The dollar figures below are list-price equivalents for comparing token
  types and roles. They are not an invoice; this machine's Claude use runs
  on a subscription with usage limits.
- Role heuristic from each subagent's own description: implementation,
  CI repair or diagnosis, post-change refactor, and review or check.
  Qualitative follow-through read the largest coordinators and implementers
  call by call.
- Claude Code offers `/insights` for a cross-session report, `/skill-doctor`
  for unused skills costing context, `/usage` and `/context` for the current
  session, and `/doctor` for installation health. None was run for this
  audit: they are typed by the user, `/insights` had never been run on this
  machine, and the others describe one live session. See CC6.

### How the three hosts compare in this record

| Aspect                      | Codex                                          | Cursor                                                 | Claude Code                                                                             |
| --------------------------- | ---------------------------------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| In-window retained activity | 598 threads, 31,652 requests                   | 197 agent-transcript files                             | 71 sessions and 325 subagents, 19,373 requests                                          |
| Native per-request tokens   | Yes                                            | No                                                     | Yes, with cache writes and their lifetime                                               |
| Dominant cost shape         | Coordinator waits, large context, worker forks | Fresh Task agents, skill re-reads, Shell status bursts | Long-lived coordinator and implementer contexts, cache writes and rebuilds, model price |
| Subagent share              | 479 of 598 threads                             | Subagent JSONL often 2–4× parent transcript bytes      | 325 of 396 transcripts; 60% of list-price cost                                          |
| Recorded cache writes       | None                                           | Not recorded                                           | 77.17M tokens, 35% of list-price cost                                                   |
| In-window compactions       | 55                                             | Not measured                                           | 0                                                                                       |
| Terry Talks / Clipboard     | 0                                              | 0                                                      | 0                                                                                       |

## Codex token accounting

| Project     | Threads | Root threads | Subagents |   Requests |      Total tokens |      Cached input | Uncached input |         Output | Uncached input + output |
| ----------- | ------: | -----------: | --------: | ---------: | ----------------: | ----------------: | -------------: | -------------: | ----------------------: |
| Open Dough  |     213 |           68 |       145 |     13,349 |     2,481,853,736 |     2,438,299,520 |     36,020,261 |      7,533,955 |              43,554,216 |
| Doughnut    |     172 |           15 |       157 |      8,106 |     1,581,138,133 |     1,552,812,672 |     24,305,187 |      4,020,274 |              28,325,461 |
| Pygardon    |     208 |           35 |       173 |      9,980 |     1,740,769,861 |     1,704,376,576 |     30,760,650 |      5,632,635 |              36,393,285 |
| Lizard      |       5 |            1 |         4 |        217 |        33,867,258 |        33,441,792 |        338,714 |         86,752 |                 425,466 |
| Terry Talks |       0 |            0 |         0 |          0 |                 0 |                 0 |              0 |              0 |                       0 |
| Clipboard   |       0 |            0 |         0 |          0 |                 0 |                 0 |              0 |              0 |                       0 |
| **Total**   | **598** |      **119** |   **479** | **31,652** | **5,837,628,988** | **5,728,930,560** | **91,424,812** | **17,273,616** |         **108,698,428** |

Total tokens are input plus output. Uncached input is input less cache reads.
Reasoning output is a subset of output and totaled 9,622,453. The window
contained no recorded cache-write tokens. Cached input accounts for 98.1% of
total tokens. Cache reads, fresh input and output have different treatment.
These quantities establish neither an included-quota change nor an invoice.
The six-project totals describe this machine's retained activity, with no
claim of account-wide coverage.

Dashboard-originated work accounted for about 5,145.9M total tokens across
27,567 requests. Desktop-originated work accounted for about 691.7M across
4,085. Root threads consumed 3,535.0M total and 55.52M uncached input plus
output. Workers consumed 2,302.7M total and 53.18M uncached input plus output.
In 7,586 requests the input was at least 250,000 tokens, including 1,350
at or above 400,000.

### Where Codex work concentrated

The five largest thread families accounted for 45.7% of all recorded tokens.
Families include the coordinator and its descendants. Cost alone gives no
waste estimate.

| Thread family                                                     | Threads | Requests | Total tokens | Uncached input + output | Observed work through cutoff                                                                                                                                                  |
| ----------------------------------------------------------------- | ------: | -------: | -----------: | ----------------------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Doughnut SEED-073, tracker-owned answered questions               |     104 |    4,273 |      885.45M |                  17.57M | Staged data and schema rollout with CI and human decisions. Checkpoint C deployed v1.3.76. Normal-startup restoration had passed branch CI and was awaiting its release gate. |
| Open Dough SEED-332, in-process fake GitHub reads                 |      40 |    2,571 |      545.72M |                  11.40M | Transport proof, fixture and runner diagnosis, full and focused runs. Slice 2 still needed qualifying natural-load evidence and hosted CI.                                    |
| Open Dough SEED-324, landed CI repeat coverage                    |      11 |    2,083 |      436.81M |                   4.46M | Two slices published, partial slice 3 retained. A long supplier wait ended after user intervention.                                                                           |
| Pygardon SEED-20261105, process-driven test families              |      45 |    2,107 |      408.40M |                   9.74M | Test speed work and diagnosis of a real database ownership defect. Trunk integration and full CI passed.                                                                      |
| Pygardon SEED-20261108, verify protection before stopping entries |      42 |    2,341 |      394.02M |                   9.13M | Protection and recovery evidence, CI repairs and independent review. Trunk integration and CI passed.                                                                         |
| Open Dough SEED-300, review and side-panel test intent            |      15 |    1,638 |      351.83M |                   5.90M | Page-object conversion, focused cohorts and completion.                                                                                                                       |
| Doughnut recall-history study                                     |       7 |    1,316 |      324.22M |                   3.71M | Expanded to a 100-day dataset with specialist audits, checked examples and ranked proposals.                                                                                  |

Lizard's one family fixed PHP parsing after quoted closing tags, added focused
coverage and integrated into `master`. It accounted for 33.87M total tokens.
The Open Dough cross-project maintenance cycle accounted for 77.59M total.
It investigated Pygardon DD-501, distinguished a shared observer expiry from
the custom-CI closure manifestation, and queued the existing shared response.
That outcome belongs to the prior session. See [ODF-259](findings/ODF-259.md)
and [Lizard's PHP repair](https://github.com/terryyin/lizard/commit/8d8d457e).

## Cursor session inventory

| Project     | Transcript files | Approx. transcript KB | Tool-use calls | Read calls | Skill-path Read calls |
| ----------- | ---------------: | --------------------: | -------------: | ---------: | --------------------: |
| Open Dough  |              116 |                 6,923 |          9,527 |      3,456 |                 1,462 |
| Pygardon    |               65 |                 2,831 |          3,758 |      1,302 |                   512 |
| Doughnut    |               11 |                   476 |            538 |        188 |                    69 |
| Lizard      |                5 |                   207 |            275 |        108 |                    37 |
| Terry Talks |                0 |                     0 |              0 |          0 |                     0 |
| Clipboard   |                0 |                     0 |              0 |          0 |                     0 |
| **Total**   |          **197** |           **~10,437** |     **14,098** |  **5,054** |             **2,080** |

Role heuristic across those files: about 15 coordinators, 55 implementers,
59 refactor agents and 68 other sessions (refinement, bug fixing, ad hoc).
Most skill Reads land on `dough-execute-plan` and `dough-post-change-refactor`
trees. Coordinators commonly load about 21 distinct execute-plan markdown
files per long story (~30–38 Reads), with `PLAN.md` re-read 7–11 times on the
largest stories. Across Shell commands, file inspection via `cat`/`head`/`wc`,
`git status` and test runs dominate.

### Where Cursor work concentrated

Largest parent coordinators by transcript size, with nested subagent totals
when present:

| Parent session | Project / story                                      | Parent KB | Subagents | Subagent KB | Notable pattern                                                            |
| -------------- | ---------------------------------------------------- | --------: | --------: | ----------: | -------------------------------------------------------------------------- |
| `9a31be6a`     | Open Dough SEED-300 terminal page-objects            |       368 |        14 |         782 | PLAN.md ×10; ci-monitor / finish-or-stop re-reads; 16 Tasks                |
| `7555a384`     | Pygardon SEED-20261111 port Node tests to TypeScript |       360 |        38 |       1,451 | 40 Tasks including repairs; ~70 git-status-ish Shell calls                 |
| `99f819a6`     | Open Dough SEED-343 recover CI completion            |       242 |        21 |         999 | Slice 2 implemented twice; implementers open SKILL.md then product scripts |
| `a6169ce7`     | Open Dough SEED-313 Cursor session checks            |       219 |         — |           — | 15 TodoWrite updates; PLAN.md ×8                                           |
| `f30e6446`     | Open Dough SEED-303 slowest dashboard checks         |       280 |         — |           — | 12 TodoWrites; ~22 execute-plan docs                                       |

Subagent corpus size, not parent narrative length, is where Cursor orientation
cost compounds.

## Claude Code token accounting

| Project     | Sessions | Subagents |   Requests |      Total tokens |        Cache read |    Cache write | Uncached input |         Output | List-price equivalent |
| ----------- | -------: | --------: | ---------: | ----------------: | ----------------: | -------------: | -------------: | -------------: | --------------------: |
| Open Dough  |       42 |       206 |     14,247 |     2,760,498,105 |     2,690,177,796 |     59,941,401 |         29,406 |     10,349,502 |                $1,198 |
| Doughnut    |        5 |        27 |      1,108 |       180,178,537 |       176,691,994 |      2,840,424 |          2,347 |        643,772 |                   $73 |
| Pygardon    |       24 |        92 |      4,018 |       737,344,714 |       719,989,578 |     14,389,326 |          8,302 |      2,957,508 |                  $367 |
| Lizard      |        0 |         0 |          0 |                 0 |                 0 |              0 |              0 |              0 |                    $0 |
| Terry Talks |        0 |         0 |          0 |                 0 |                 0 |              0 |              0 |              0 |                    $0 |
| Clipboard   |        0 |         0 |          0 |                 0 |                 0 |              0 |              0 |              0 |                    $0 |
| **Total**   |   **71** |   **325** | **19,373** | **3,678,021,356** | **3,586,859,368** | **77,171,151** |     **40,055** | **13,950,782** |            **$1,639** |

Total tokens are uncached input, cache reads, cache writes and output. Cache
reads are 97.5% of total tokens but 44% of list-price cost; cache writes are
2.1% of tokens and 35% of cost; output, including thinking, is 22%. Unlike
the Codex record, writes are charged: each new token entering a context costs
25–50 cache reads when it is first written. Main threads wrote with a
one-hour lifetime (22.83M tokens) and subagents with a five-minute lifetime
(54.34M tokens).

Main threads accounted for $652 (40%) and subagents $987 (60%). Fable 5.2
served 4,139 requests (21%) for $536 (33%); Opus 5.5 served the rest. In
4,678 requests the context was at least 250,000 tokens, including 1,400 at or
above 400,000. Those requests carried $351 of main-thread cost (54% of it)
and $263 of subagent cost (27%). No session compacted.

Subagent cost by role: implementation 116 agents, $540, average peak context
183k; CI repair or diagnosis 33 agents, $208, average peak 200k; post-change
refactor 113 agents, $144, average peak 99k; review or check 63 agents, $95,
average peak 87k.

### Where Claude Code work concentrated

The five largest session families, each a coordinator with its subagents,
accounted for 52% of list-price cost and 57% of total tokens.

| Session family                                                         | Requests | Total tokens | List-price equivalent | Coordinator peak context | Observed work                                                                                                       |
| ---------------------------------------------------------------------- | -------: | -----------: | --------------------: | -----------------------: | ------------------------------------------------------------------------------------------------------------------- |
| Open Dough SEED-334, product-wide end-to-end tests                     |    2,989 |       685.4M |                  $265 |                     466k | Runner split across test groups, CI producer switch and several flaky-check repairs; not marked done at the cutoff. |
| Open Dough SEED-324, landed CI repeat checks under load                |    1,911 |       436.3M |                  $217 |                     753k | Marked done; the user then asked for its correction plan to be queued.                                              |
| Open Dough SEED-300, Board and published-read test intent              |    2,039 |       373.4M |                  $156 |                     685k | Nine slices with a refactor pass each, three CI repairs, outcome review and Intent Coverage; marked done.           |
| Open Dough SEED-300, session discovery and report test intent          |    1,892 |       329.4M |                  $129 |                     601k | Eight slices, trunk and Board-landing reconciliations and several CI repairs; marked done.                          |
| Open Dough SEED-331, CI history at a glance                            |    1,292 |       267.1M |                   $91 |                     465k | Slices plus three CI repairs; marked done.                                                                          |
| Pygardon overnight test optimization                                   |      617 |       156.5M |                   $84 |                     787k | Ad hoc overnight session including two implementation slices; marked done.                                          |
| Pygardon SEED-20261111, service and infrastructure tests by capability |      930 |       149.2M |                   $59 |                     466k | Marked done.                                                                                                        |

“Marked done” is the dashboard's session state; this audit did not re-verify
each outcome against Git. SEED-300 appears among the largest families on all
three hosts and SEED-324 on Codex and Claude Code, for different stories.
Pygardon SEED-20261111 appears on both Cursor and Claude Code.

## Findings and opportunities

The [reconciliation below](#reconciliation-with-retrospective-findings) records
which observations revisit a known finding, which share a mechanism or
quality constraint, and which remain distinct measurements or hypotheses.

### 1. Wake the coordinator for results, changes and bounded deadlines

**Hosts.** Strongest on **Codex**, with quantified empty-wait exposure. Cursor
coordinators in this window more often used Task/AwaitShell handoffs than
empty subprocess polls; the same yield-and-wake principle still applies when a
Cursor coordinator would otherwise poll. On **Claude Code** an idle wait
spends nothing, but a wait longer than the cache lifetime makes the next
request write the whole context again; see the Claude Code paragraph at the
end of this finding.

The Codex conservative classifier associates a request with an empty subprocess
continuation or explicit agent-wait timeout when the preceding tool results
provide no other observed progress. The following counts describe whole
model requests, which carry accumulated context.

| Preceding result                                 |  Requests | Total tokens | Uncached input + output |
| ------------------------------------------------ | --------: | -----------: | ----------------------: |
| Subprocess still running with empty output       |     1,464 |      290.66M |                  1.714M |
| Agent wait timed out                             |       839 |      155.86M |                  2.331M |
| **Empty subprocess polls and explicit timeouts** | **2,303** |  **446.53M** |              **4.046M** |
| Clock-only or sleep results, counted separately  |       295 |       51.58M |                  149.6k |

The main two rows account for 7.6% of total tokens and 3.7% of uncached input
plus output. A continuation that eventually yields terminal proof, a real
liveness check, and a timer that protects an agreed deadline can earn their
cost. These counts identify exposure for investigation and set no savings rate.

In SEED-324, the coordinator acknowledged at 00:41:34 SGT on November 14
that SEED-332 had passed its full diagnostic, but was paused with unresolved
earlier failures and a required natural-load test window. The supplier had
nothing running that the consumer could wait out. Before the user's
07:17:52 intervention, 447 coordinator requests consumed 105.39M total tokens.
Of these, 300 immediately followed empty waits, timeouts or clock-only
checks and accounted for 71.72M total and 672k uncached input plus output.
The assistant stopped both watches after the intervention. It preserved two
published slices, partial slice 3, and the missing proof. The early return
with a named dependency was published at 08:06:43 SGT, outside the audit
window. See [the early-return commit](https://github.com/terryyin/open-dough/commit/7fb423492).

Prefer the existing host notification or one supported wait bounded by the
expected proof window. Keep a single owner through terminal result. Use a
bounded liveness check when overdue and preserve the command identity, last
meaningful change, CI observation state and next action. When the next move
requires a paused supplier, a human decision or unavailable test conditions,
save the exact resume condition and yield. A supplier publication, receipt,
scope decision, loss of observation or proof deadline can wake the
coordinator. Preserve CI evidence for the applicable revision and report
lost observation separately from local proof.

The earlier Doughnut SEED-122 same-story replay caught the same fault,
identified the same maintained assertion and passed restored proof in both
arms. One completion wait replaced seven periodic waits. Estimated combined
Standard credits fell from 12.49 to 11.33, a 9.3% decrease. The account
quota meter was too coarse and had overlapping activity. The maintained
wrap-up guidance already incorporates the bounded completion-wait response.
See [waiting comparison](intent-coverage-cost-research.md#same-story-waiting-comparison),
[delegation waits](../../src/skills/dough-execute-plan/references/delegation.md#await-delegated-results-without-empty-calls),
[overdue proof](../../src/skills/dough-execute-plan/references/overdue-delegated-verification.md)
and [CI completion](../../src/skills/dough-execute-plan/references/ci-completion-wait.md).

**Claude Code.** In 91 requests the cache had expired during an idle gap and
the whole context was written again, costing $163 (10% of list-price cost).
Subagents, whose cache lives five minutes, accounted for 64 rebuilds after
gaps of five to sixty minutes ($90) and three after longer gaps ($6). Their
gaps were mostly waits on focused or full test runs, with contexts of 100k to
500k tokens. Coordinators, whose cache lives an hour, accounted for 24
rebuilds after gaps over an hour ($67), usually while a long subagent was
running. Each wake within the cache lifetime costs one cache read of the
context, about $0.06 at 300k tokens, against roughly $1.50 to rewrite the
same context. This sharpens the shared principle rather than reversing it:
choose the wake from the expected proof window and the host's cache lifetime.
Prefer that the context with the longer cache, or the host's completion
notification, owns waits expected to outlast five minutes; otherwise one
bounded wake inside the lifetime is cheaper than a rebuild. CC2 explains why
lengthening the subagent cache lifetime is not the remedy.

### 2. Return decision-sized evidence and retain the full artifacts

**Hosts.** Shared. Codex measured truncated tool outputs; Cursor measured
repeated full or near-full Reads of the same guidance and plan files after
handoffs; Claude Code measured hand-back report size and coordinator guidance
reads.

The Codex report's broad text heuristic flagged 1,483 tool outputs in 396
threads. A stricter recheck counted explicit tool truncation markers. Within
the first 1,500 characters it found 1,462 results in 395 threads. Across full
retained outputs it found 1,566 results in 405 threads. Those markers describe
retained output and some commands were deliberately capped. They do not
measure how often evidence was lost or estimate savings.

- Open Dough SEED-342 started with a tool result that reported 11,733
  original tokens and truncated. Printing complete consumer traces reported
  45,075 original tokens. A process query reported 125,291 original tokens
  after printing full arguments. Both results truncated. Targeted reads
  recovered the required decision, consumer and assertion evidence. The
  later Intent Coverage probe caught the same-seed lookup fault. This
  incident recurs under existing boundary-specific reading guidance.
  See [the occurrence](../../DearDough.md#odf-264) and
  [ODF-264](findings/ODF-264.md).
- Lizard #566 repeatedly launched Nix-wrapped reference reads during startup.
  Its broad tool metadata result alone reported 20,788 original tokens.
  A later combined startup response also truncated. Retrieve exact tool
  names, read each needed guidance boundary once and reuse an established
  compatible project environment where project instructions permit. Keep the
  existing Nix test environment and focused PHP proof.
- The Open Dough maintenance cycle repeatedly bumped into its output ceiling
  on broad reference and findings reads. Use the selected finding, occurrence
  IDs and exact publication receipts to drive retrieval. Retain contradictory
  evidence, uncertain attribution and the source passages used to decide.
- Open Dough SEED-332's full run produced 2,791 passes and two Terminal budget
  failures. Reporter cleanup removed traces from a subsequent passing
  diagnostic, so it could not explain the original overhead. Later diagnostics
  distinguished fresh and aged worker states. One normal-pool run had 2,793
  passes and one expected skip. A receiving run after adopting current main
  passed 75/75. The latter run's load rose from about 7 to 25 and did not
  qualify for the required natural-load range of 30–50. These were useful
  data points and the proof obligation stayed open.
- **Cursor.** Long coordinators still honor offset/limit on many skill
  boundaries, yet re-load unchanged files after Task returns: `ci-monitor.md`
  up to five times, `finish-or-stop.md` up to four, `PLAN.md` seven to eleven
  times (often with offsets). Keep a session scratch of already-loaded
  boundary excerpts; reload only when the file changed or a new boundary needs
  a different section. Prefer slice-scoped PLAN excerpts over mid-story full
  reloads.
- **Claude Code.** Coordinators received 315 subagent hand-back reports,
  2.78M characters in all (median 7.8k, 90th percentile 14.4k), often with
  full tables. Every report stays in the coordinator's context until the
  session ends. Coordinators also made 919 reads of Open Dough skill files,
  about 1.55M tokens; one SEED-324 coordinator read about 20
  `dough-execute-plan` reference files, roughly 250k characters, matching
  Cursor's 21-file pattern. The installed guidance is 19k characters of
  `SKILL.md` plus 287k across 38 references. Subagents inspected files with
  whole or ranged `cat`, `sed` or `head` 3,451 times, about 5.6M tokens, the
  largest single source of subagent tool output. Re-reads of an unchanged
  file were a small share: 3.7M of 51M characters read in the wider sample.
  Return a short verdict with the path of a full report retained in the job's
  temporary directory, and read only the reference for the current execution
  phase.

Use a small preflight to prove that an expensive diagnostic preserves the
decisive artifact and exercises the intended worker, load and runtime
premises. Retain the full artifact on disk with its command, candidate
revision, selected tests, terminal result and provenance. Return changed
paths, relevant consumer rows and assertion locations. For process state,
select PID, elapsed time, status and executable basename. For a running
command, also keep its exact continuation handle. This keeps the independent
proof and the ability to inspect failures while reducing rereads and context
replay. See [ODF-158](findings/ODF-158.md) and
[ODF-322](findings/ODF-322.md).

### 3. Use the existing records-only and already-traced delivery decisions

**Hosts.** Shared mechanism; Codex quantified nested review cost. Cursor shows
nearly every post-change refactor agent reading the refactor skill (~two Reads,
~17KB) — cheap relative to implementer orientation, and often productive when
it finds consumer gaps. On Claude Code, 113 refactor passes cost $144 (9% of
list-price cost) at an average peak context of 99k. Eighty-eight made edits.
The 25 that returned without edits cost $14 together, so the records-only
disposition has little to recover on this host in this window.

Two Doughnut checkpoint C record updates each used a fresh refactor reviewer
and a nested factual reviewer. The first recorded production rollout and
pending fresh login; the second recorded the human confirmation and closed
the schema-retirement slice. Git shows plan, verification and execution
records, plus source-review Markdown in the first update. Both reviewers
returned clean and kept the accepted proof. In aggregate the four threads
made 29 model requests and used 11,754,002 total tokens and 424,594
uncached input plus output.

Source changes are recoverable at Doughnut commits `bc783352b6` and
`5bd5b3b896`. The release evidence and the user's fresh-login confirmation
still matter. The coordinator can check those facts directly against the
receipt and source event, and verify that proof inputs and executable hashes
still match. Apply the current documented records-only disposition when its
conditions hold. A narrow repair that stays within an accepted consumer trace
can also reuse that disposition if it adds no path, helper, representation
or dependency. Where the facts or scope are uncertain, keep an independent
look. The review of the Open Dough custom CI rebuild contract made concrete
corrections. A Pygardon refactor return uncovered an entry-protection consumer
proof gap. Those were productive reviews. Keep independent review and any
invalidated proof for changes with those consequences.

The Codex audit includes 126 worker roles with “refactor” in their own name,
totaling 281.62M tokens with cache reads. A conservative wording scan found
84 explicitly clean returns using 107.10M total and 6.60M uncached input
plus output. These are observed review costs. The wording scan misses some
clean reports, can match a clean subset of a wider review, and does not
identify which reviews qualified for a disposition. The two checkpoint
updates above were inspected independently. See
[the delivery rule](../../src/skills/dough-execute-plan/references/deliver-the-change.md)
and [ODF-141](findings/ODF-141.md),
[ODF-276](findings/ODF-276.md).

### 4. Limit inherited context and cold-start orientation for workers

**Hosts.** Shared theme with different host shapes.

**Codex — inherited fork history.** Across all workers, 290 forks with a
retained inherited-history boundary started at a median 163,431 input tokens.
The 189 workers without that marker started at a median 24,842. Those cohorts
did different work. In the separate matched Intent Coverage comparison, fresh
workers with a small handoff used 61% fewer total tokens, while estimated
Standard credits rose about 10% because additional fresh input and responses
outweighed saved cache reads. Batching already-prepared proof helped the
worker comparison, while fuller replays showed substantial preparation and
coordinator cost. Trial compact handoffs first where bulk data already exists
on disk. Measure the whole coordinator and worker path. See
[the earlier comparisons](intent-coverage-cost-research.md#findings-from-1112-november-2026).

**Codex — recurring checks and data-heavy research.**

- Pygardon's hourly ticket monitor executed 47 heartbeat turns in an older
  project thread. Its 94 model requests processed 29,439,610 total tokens,
  including 28,801,536 cached input and 28,623 output. Median input per
  request was 315,233 tokens. All 47 decisions were `DONT_NOTIFY` after
  checking for a reply. A dedicated small context with a durable last-seen
  message ID can preserve the cadence, query coverage and notification
  behavior. Check known-new and already-seen replies before changing how
  retrieval or notification works. Other Pygardon heartbeat turns produced
  substantive updates, so the result is specific to this monitor.
- Doughnut's recall study fetched 3,028 attempts in its first 30-day export
  and later 11,091 attempts in the 100-day extract. The wider extract matched
  all original rows and added 8,063 older attempts. The final evidence
  collection grouped 254 distinct misses with 137 correct comparisons.
  Three specialists began near 177k context tokens each and used about
  237.86M total over 882 requests. Their domain audits produced distinct
  results. For example, the technical-domain reviewer classified all 195
  older non-Japanese multiple-choice misses and separated 53 item prompts
  testing stored labels or relationships from 13 clearly defective items,
  with six counted in both groups. Preserve the specialists' domain judgment,
  blind review, row-level evidence and reproducible exclusions. Share a
  compact objective and criteria, cached dataset location, row IDs and
  domain subsets. Keep raw pages and broad result lists on disk and retrieve
  examples as needed for reasoning and final verification.

**Cursor — fresh Task agents re-read the coordinator skill after a complete
brief.** Of 55 implementer transcripts, 45 opened
`dough-execute-plan/SKILL.md` as the first tool (~19KB on disk). Typical Task
prompts already carried 5–10KB of checkout identity, slice text, promises,
proof, oversized-file decisions, failure policy and return format — and often
mentioned skills — yet workers still opened the coordinator skill. The file size describes
the source, and individual Reads can request a smaller excerpt. For
example, the SEED-343 slice 2 replacement requested the first 80 lines,
then read the slice sources and ci-mailbox scripts. Subagent transcript
bytes were commonly two to four times the parent coordinator. This makes
the redundant orientation a candidate for a trial. The transcripts
provide no token savings estimate.

**Claude Code — fresh subagents with a fixed floor, then exploration.**
Claude Code subagents start fresh rather than forking history, at a median
40.5k context tokens. About 8.4k of that is the listing of every installed
skill and about 4.7k the project instructions and memory (CC5). Unlike
Cursor, implementers did not re-read the coordinator skill: none of 136
implementation subagents opened `dough-execute-plan/SKILL.md`, and the 22
that read any `SKILL.md` read slice-local skills. Coordinators commonly put
shared identity, rules and return format in one common brief file that each
worker reads once. Orientation cost appears instead as exploration of the
code the slice touches. The SEED-334 slice 4 implementer made 50 inspection
calls, its context growing from 45k to 192k tokens, before its first edit;
finding 5 follows the same worker.

Improvement suggestion for all hosts: prefer decision-sized handoffs that
name what must not be re-fetched. On Cursor, state explicitly that the Task
brief is complete and forbid re-reading the coordinator skill; point only at
slice-local skills (`dough-makeme`, `dough-page-objects`, test-entry rules)
when needed. On Codex, keep compact fork handoffs where cache economics and
quality both hold. On Claude Code, keep the common-brief posture, which
already avoids the Cursor re-read. Measure coordinator plus worker effort
together.

### 5. Bound how long one context keeps growing

**Hosts.** Shared; quantified on Codex and Claude Code. Cursor shows the same
shape through PLAN.md and guidance re-reads on long coordinators.

Every request re-reads the whole context, so a context that keeps growing
makes each later request dearer. In Codex, 7,586 requests carried at least
250,000 input tokens, 1,350 of them at or above 400,000, and the window held 55
compactions. In Claude Code, 4,678 requests carried at least 250,000 tokens,
1,400 of them at or above 400,000, and no session compacted. Those Claude
requests account for 54% of coordinator list-price cost and 27% of subagent
cost.

- A SEED-324 Claude coordinator reached 752,562 tokens. Its visible
  content explains about 480k: hand-back reports (316k characters), the
  Agent briefs it wrote (243k), Bash and Read results (554k), and skill
  references. The rest is retained thinking (CC3).
- The SEED-334 slice 4 Claude implementer ran 305 requests while its context
  grew from 45k to 575k, about $39 alone. The slice combined CI workflow
  producers, per-producer timing lists, test scripts, fixtures, lifecycle
  specs and documentation.
- A Pygardon overnight Claude session peaked at 787k; the largest Codex
  ticket-monitor thread kept a median 315k input for routine heartbeats.

Prefer slice boundaries that let one implementer finish well under a few
hundred thousand tokens; Execute Plan's oversized return already supports
stopping early. Keep the coordinator's context to decisions: phase-scoped
references, short hand-backs and retained artifacts on disk (finding 2).
Open Dough keeps execution state in plans, receipts and job files, which
makes a compaction or a fresh continuation at a slice boundary plausible.
Whether that preserves judgment across a long story is unmeasured; CC4 names
the Claude Code mechanism.

## Cursor-distinct findings

These patterns were observed in Cursor transcripts and are not claimed as
Codex or Claude Code mechanisms. Some may have Codex analogues that this
record does not yet quantify. The Claude Code audit checked C1 directly and
found no coordinator-skill re-read by implementers (finding 4).

### C1. Avoid paying twice for large Task prompts and skill re-reads

Cursor coordinators already assemble substantial implement and refactor Task
prompts (for example 16 Tasks totaling ~52KB of prompt text on `9a31be6a`,
max ~9.6KB; 40 Tasks totaling ~59KB on `7555a384`). Many prompts mention
skills or tell the agent to follow a skill path. Implementers still open
`SKILL.md`. Today both costs are paid. Prefer one path: either the brief
replaces the coordinator-skill Read, or a short brief plus one focused skill
section — not both. Source-only review Tasks already use “Use ONLY the inputs
below. Read no other project files”; that posture should become the default
for well-briefed implementers relative to the coordinator skill.

### C2. Discover dynamic tool schemas once per session

Long Cursor coordinators called `GetDynamicTools` four to seven times for the
same three tools (`Task`, `TodoWrite`, `AwaitShell`), usually with only three
unique queries. Re-inspect after a failed call; do not rediscover the same
schema before every Task. No quality change to Task behavior is required.

### C3. Bound TodoWrite and git-status polling to phase gates

Cursor coordinators issued 10–15 `TodoWrite` updates on several stories, each
re-injecting the full list, and 22–70 `git status`/`diff`/`log` Shell bursts
on the largest coordinators (`7555a384` ~70, `9a31be6a` ~52). Keep structured
status and diff at proof-acceptance and delivery boundaries. Between slices,
trust the implementer return’s owned paths unless acceptance fails. Update
todos on phase changes (slice start, accepted, blocked), not every probe.

### C4. Prefer finish or resume briefs over cold re-delegation

In `99f819a6` (lines 42–47), the first slice 2 Task inspected the checkout
without returning proof. The coordinator found a clean tree and relaunched
the slice. The replacement returned the complete proof. In `7555a384`
(lines 102–114), the coordinator relaunched slice 6 after stale shell
notifications and a clean-tree inspection. The available excerpt does not
establish that the first worker had terminated. Both launches introduced a
second orientation. Verify the existing writer's state and continuation
first. When it is recoverable, prefer a resume or finish brief pointing to
existing work and the missing proof. Use a replacement only after the
existing ownership and recovery evidence allow it.

### C5. No Cursor-native session-cost doctor for this audit

Unlike Codex (`codex doctor`, rollout usage records, `/status`, `/usage`,
app-server `tokenUsage` events), this machine’s Cursor skill and MCP surface
offered no historical per-request token breakdown or cross-project session
doctor. Adjacent tools (Canvas, Visualize, SDK `summarize`) do not replace
transcript forensics. Any future Cursor trial should either export native
usage if Cursor adds it, or keep relative pattern metrics honest about that
gap.

## Claude Code-distinct findings

These patterns depend on Claude Code's pricing, caching, thinking or
configuration. They are not claimed as Codex or Cursor mechanisms.

### CC1. Model choice sets the price of each unit of work

The dashboard chooses the model per launch, and the main thread's choice
passes to its subagents unless a call names another. Fable 5.2 costs twice
Opus 5.5 per output and cache-write token, with equal cache-read price. Its
requests also produced more output: 1,031 tokens per subagent request against
Opus's 682, and 775 against 637 on main threads. Fable served 21% of
requests for 33% of list-price cost. One SEED-324 session switched models
partway through, which starts a fresh cache.

Just before the window, four concurrent Fable sessions showed “You've reached
your Fable limit” between 17:49 and 17:55 UTC on November 11. Each waited
about six hours for “resume” and then wrote 330k–500k tokens of context again.
One more limit notice falls inside the window. On Fable, consumption also
gates throughput.

No transcript evidence compares outcome quality by model. Choose the model
per role — coordinator, implementer, refactor pass, review — rather than per
session, using the Agent call's `model` parameter or
`CLAUDE_CODE_SUBAGENT_MODEL`. Routine refactor and review roles on Fable cost
$65 in the wider sample, against about $25 on Opus. A model change trades
capability for price and stays a human decision; compare outcomes on
comparable stories first.

### CC2. Cache lifetime: avoid the rebuild, keep the five-minute default

Main threads cache for one hour on this subscription and subagents for five
minutes. A five-minute write costs 1.25× input and a one-hour write 2×.
Setting `subagentPromptCacheTtl` (or `CLAUDE_CODE_SUBAGENT_PROMPT_CACHE_TTL`)
to one hour would have added about $200 to the window's 54.3M subagent write
tokens to avoid about $96 of subagent rebuilds. Prefer the wait ownership in
finding 1.

### CC3. Thinking stays in the context

Claude Code keeps prior thinking blocks in the conversation. Thinking is
billed as output when produced and is then written to and read from the cache
like any other content. In the SEED-324 coordinator about 270k of 752k tokens
were retained thinking. Effort controls thinking depth, but this window's
effort comparison is confounded by its model mix, so the record makes no
effort claim. A coordination-heavy main thread is the natural place to test a
lower effort.

### CC4. A one-million-token window never compacts by itself

Both models run with a one-million-token window, and no session reached it.
Claude Code accepts an `autoCompactWindow` between 100,000 and 1,000,000
tokens as a setting, per model, and in a custom subagent definition, where it
only lowers the inherited window. That makes a trial bound on coordinators or
implementers possible without guidance changes. Compaction summarizes earlier
work and can lose detail, so it belongs in the measured trial of finding 5.

### CC5. Every subagent pays a fixed start-up floor

The median 40.5k start includes the system prompt and tools, about 8.4k for
the listing of all installed skills, about 4.7k for project instructions and
memory, and the brief. Across 325 subagents that floor is written once each
and re-read on every request. Open Dough's own skill descriptions total about
11k characters, several near a thousand. Shorter descriptions that still name
their trigger terms would shrink every session and subagent on every host
that lists skills; `/skill-doctor` reports which loaded skills a Claude Code
session never used.

### CC6. Native diagnostics complement transcript accounting

`/insights` generates a cross-session report and has never run on this
machine. `/skill-doctor`, `/usage` and `/context` describe one live session,
and `/doctor` checks the installation. None breaks cost down by role, cache
lifetime, rebuild or coordinator growth, so transcript accounting remains
the instrument for this record. Running `/insights` and `/skill-doctor`
before a trial would add their view.

## Codex-native diagnostic follow-up

The initial Codex audit used native rollout usage and the native thread index.
The Codex app's project and archive inventory supplied a further coverage
check. The initial audit did not run the `doctor` subcommand.

- On this follow-up the installed Codex CLI, version 0.169.0, ran
  `codex doctor --json`. This is a machine, configuration, auth and runtime
  diagnostic. It provides no historical per-request token breakdown. State
  paths and database inspection passed. The machine-wide rollout/index
  parity check warned of 300 missing active rows, 95 duplicate rollout
  thread IDs and a 10,000-file scan cap. The sample included older compressed
  histories. The machine-wide result does not settle the two-day inventory.
- The targeted inventory recheck scanned active and archived rollouts,
  including `.jsonl.zst`. No compressed file had a modification time at or
  after the start of the window. Every original indexed candidate had a
  readable rollout, and no unindexed in-scope transcript or duplicate
  response ID was found in the original scan. The recheck narrows what the
  global warning can imply. Deleted, unretained and remote-only activity
  remains outside the evidence.
- Doctor returned exit 1. The HTTP provider probe could not connect and the
  WebSocket probe had a DNS failure from this restricted execution
  environment. A separate direct daemon version query was denied access to
  the local control socket. Those observations give no evidence of a
  historical inference outage or loss of audit records. No repair, report
  upload, state migration or daemon change was performed.
- Codex's built-in app thread reader retrieved three representative native
  histories. SEED-324 showed two interrupted turns followed by recovery and
  completion. The Doughnut recall study showed four completed turns,
  including the expanded study with a recorded context compaction, tool
  calls and subagent activity. The Pygardon ticket monitor showed the latest
  seven sampled turns using the same simple tool-and-result shape. The
  native thread read supplied turn and item evidence. It exposed no
  per-request usage fields and did not replace the rollout accounting.
- Read-only `codex migrate-rollouts --thread … --json` inspection returned
  `already_paginated` for all three sample threads. Official documentation
  describes `/status` for the active session, `/usage` for account totals,
  and `thread/tokenUsage/updated` as a live app-server notification.
  See [developer commands](https://learn.chatgpt.com/docs/developer-commands#built-in-slash-commands)
  and [app-server turn events](https://learn.chatgpt.com/docs/app-server#turn-events).

The diagnostic follow-up was performed after the window. Its own requests
are outside the accounting.

## Evidence pointers for rechecking local history

### Codex

Search these thread UUIDs in the Codex app or the native rollout filenames
on the machine that ran the audit. Times and line numbers identify evidence
in the retained files. Raw transcripts, private recall rows, mail contents
and the machine's diagnostic JSON are kept out of this research record.

| Case                                  | Native thread or source                                                           | Locate the evidence                                                                                                               |
| ------------------------------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Open Dough SEED-324                   | `01a1d22f-e0cd-7032-930d-5a9ff3011a64`                                            | Lines 10404 and 14112 in the Nov 13 local rollout. Supplier pause and the user-triggered stop.                                    |
| Open Dough SEED-332                   | `01a1d2a6-8e91-7da2-8604-6ed71f8d945b`                                            | Line 8257, reporter cleanup and remaining Terminal diagnosis. Later results record the high-load and hosted proof still required. |
| Open Dough SEED-342                   | `01a1d407-2742-7863-be6c-e1549015f402`                                            | Lines 49, 289 and 350. Initial reference batch, consumer traces and process arguments.                                            |
| Open Dough combined maintenance       | `01a1d421-a633-7593-950e-79f5d3e06137`                                            | Result around 17:23 SGT on Nov 13. DD-501, ODF-259 and both CI provider cases.                                                    |
| Doughnut SEED-073 coordinator         | `01a1d285-5f73-77a1-9c74-724be6436d35`                                            | Stage C result and the v1.3.77 approval checkpoint.                                                                               |
| Doughnut records reviews              | `01a1d593-980a-71a1-93a6-af69328da299` and `01a1d739-99ac-7b13-975d-931f1add30bf` | Lines 1243 and 1307. Nested roles `c_record_fact_check` and `closure_fact_check`.                                                 |
| Doughnut recall study                 | `01a1d3da-e23b-74c0-bc5a-58104346d62f`                                            | Line 2709 and the `learning_research`, `technical_domains` and `language_domains` child threads.                                  |
| Pygardon process-driven test families | `01a1cf9f-95e6-7cf3-9264-37277ff768d9`                                            | Line 9246, confirmed database ownership repair and CI completion.                                                                 |
| Pygardon entry protection             | `01a1d268-1769-7550-aaa2-663dbe246d1f`                                            | Line 9666, completed landing. Refactor worker `01a1d343-3411` returned a consumer proof gap.                                      |
| Pygardon ticket monitor               | `01a19177-b63c-7b80-8449-741aa062070d`                                            | Line 15764 is the first in-window no-notification decision in the Oct 31 local rollout.                                           |
| Lizard #566                           | `01a1d233-ea66-7532-97be-0be9fea8e5e4`                                            | Lines 17 and 1240. Startup output and finished repair.                                                                            |

### Cursor

Search these session ids under the matching
`~/.cursor/projects/Users-terryyin-git-…/agent-transcripts/` tree on the
machine that ran the audit. Parent files and `subagents/` children are both
evidence.

| Case                                    | Session id                             | Locate the evidence                                                                                                              |
| --------------------------------------- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Open Dough SEED-300 coordinator         | `9a31be6a-1729-4497-8b97-49c7a1662ce0` | First tools read execute-plan SKILL and established-start; PLAN.md Reads; Task prompts ~5–10KB; subagents under the same parent. |
| Pygardon SEED-20261111 coordinator      | `7555a384-8727-4b8c-a736-ac3f6bb8d31c` | 40 Tasks; dense git-status Shell sequence; 38 subagent transcripts totaling ~1.4MB; lines 102–114 record the slice 6 relaunch.   |
| Open Dough SEED-343 coordinator         | `99f819a6-21fa-4b7e-a745-3cdead665010` | Lines 42–47, repeated slice 2 Task; TodoWrite churn.                                                                             |
| Open Dough SEED-343 implementer slice 2 | `2344df84-4845-4cdd-9e67-25233e06a8e7` | First tool Read of `dough-execute-plan/SKILL.md` (80-line limit) after a complete brief; later ci-mailbox script Reads.          |
| Open Dough SEED-313 coordinator         | `a6169ce7-5db3-4970-8f00-c8bf8c548fb4` | TodoWrite ×15; PLAN.md ×8; GetDynamicTools rediscovery of Task/TodoWrite/AwaitShell.                                             |
| Implementer first-tool baseline         | 55 implementer transcripts in-window   | 45 opened `dough-execute-plan/SKILL.md` first; 47 of 55 first tool was any `SKILL.md`.                                           |

Working draft Canvas from the Cursor pass:
`~/.cursor/projects/Users-terryyin-git-open-dough/canvases/token-efficiency-72h.canvas.tsx`.

### Claude Code

Search these session ids under the matching
`~/.claude/projects/-Users-terryyin-git-…/` directory on the machine that ran
the audit. Subagent transcripts sit under `<session>/subagents/` with a
`.meta.json` naming each one's task.

| Case                             | Session id                                                                                                                                                        | Locate the evidence                                                                                                |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Open Dough SEED-334 coordinator  | `50829ac2-3fd4-4e88-9f59-b0411b7f8743`                                                                                                                            | Largest family; hand-back reports of 10k–17k characters.                                                           |
| SEED-334 slice 4 implementer     | `agent-aef2d6806e3ccac3e` under the SEED-334 session                                                                                                              | “Slice 4: CI producers switch”: 305 requests, 45k→575k context, first edit at request 50.                          |
| Open Dough SEED-324 coordinator  | `296b888d-08b1-4b06-ac2e-24a4462da7d0`                                                                                                                            | 752,562-token peak; about 20 execute-plan reference reads; Fable and Opus requests in one session.                 |
| Open Dough SEED-300 coordinators | `7c2dd325-999d-4af5-a5b5-9a81ae095de3` and `b14de2fb-5e98-459d-be8d-2f2778afc3b7`                                                                                 | One refactor pass per slice; CI repairs; coordinator peaks 685k and 601k.                                          |
| Open Dough SEED-331 coordinator  | `30208cc9-b306-409b-a2b2-83737d26ae75`                                                                                                                            | Three CI repair agents.                                                                                            |
| Pygardon overnight optimization  | `ff3817a4-bb83-4809-bca2-bdbbdab03de1`                                                                                                                            | 787k coordinator peak; Fable limit notice before the window.                                                       |
| Fable limit cluster              | `cb428881-f681-4c95-b0e8-d9e394c3aa55`, `de0e2361-be5e-42d3-847c-3fa5f8ae1c2a`, `ff3817a4-bb83-4809-bca2-bdbbdab03de1` and `cd5f9f1a-b18b-4fa6-9974-df8c57a84de6` | Synthetic limit notice 17:49–17:55 UTC on November 11, then “resume” about six hours later and a full cache write. |

## Reconciliation with retrospective findings

This cross-reference uses the [Open Dough catalog](finding-names.md) and its
authoritative records at maintainer revision `7fb423492`. The three audits
retain their own observation windows and provenance. A match refers to a
specific recorded issue or mechanism. A comparison or quality constraint
does not establish a second occurrence or change a finding's disposition.

### Waiting, recovery and CI coverage

- **Finding 1, waiting on SEED-324's paused supplier.**
  [ODF-325](findings/ODF-325.md) records workless activity used to keep a
  coordinator awake, specifically empty delegation or placeholder commands.
  SEED-324 adds the cost of repeated waits on a paused dependency. Its
  requests are distinct from the no-op agent launches in ODF-325.
  [ODF-388](findings/ODF-388.md) is a comparison for waiting on an external
  condition. In that case, the owner authorized the wait and the eventual
  market-hours observation produced evidence.
- **Bound the wait by the work that can still advance.**
  [ODF-369](findings/ODF-369.md) covers an overdue delegated test that was
  still running and busy-spinning. Bounded liveness inspection protects that
  case. A known-paused supplier needs a meaningful resume condition.
  [ODF-334](findings/ODF-334.md) concerns exact-SHA CI polling that bypassed
  the applicability-aware completion operation. The completion contract informs how to
  wait for a CI verdict and does not account for supplier-status polls.
- **Retain the separate CI obligation.** The DD-501 maintenance investigation
  already reconciled with [ODF-259](findings/ODF-259.md), the eight-hour
  observer expiry and missing final verdict. [ODF-298](findings/ODF-298.md)
  tracks terminal observer continuation. Both link to the delivered
  [SEED-343 response](../../.planning/done/SEED-343_recover-ci-completion-observation.json).
  These findings explain the CI coverage an execution can lose while it
  waits. The SEED-324 blocker was the supplier's unpublished repair and
  incomplete proof.
- **Host cost limits.** The Claude Code cache rebuilds are a separate cost
  mechanism. Neither the Codex empty-wait counts nor Cursor's Task/AwaitShell
  pattern establishes the same Claude Code behavior. The timing comparison
  and cache-lifetime calculation remain host-specific evidence.

### Evidence size, retained diagnostics and repeated setup

- **Finding 2, known occurrence.** Codex SEED-342 is the occurrence already
  retained under [ODF-264](findings/ODF-264.md) in
  [DearDough](../../DearDough.md#odf-264). Its oversized startup and generated
  outputs lost evidence to truncation and required targeted retrieval. The
  audit adds aggregate exposure while the canonical occurrence remains one
  execution. Lizard's broad metadata and startup reads and the Open Dough
  maintenance reads show comparable oversized retrieval. Cursor's retained
  Read counts and Claude's large hand-backs do not establish comparable
  truncation or recovered evidence.
- **Distinguish required breadth from extra retrieval.**
  [ODF-158](findings/ODF-158.md) records instructions requiring a broad
  reference surface even for a small execution. It is relevant to Cursor
  and Claude Code coordinators opening many boundary files. Its evidence
  does not establish that Cursor's worker re-read or repeated PLAN reads
  were required. [ODF-446](findings/ODF-446.md) records the maintenance cost
  of boundary rows with little headroom. It is a reason to keep any change
  to retrieval proportionate.
- **Keep the evidence that establishes the result.** SEED-332's passing
  traces were deleted by reporter cleanup. [ODF-108](findings/ODF-108.md)
  lost the failure traceback by filtering a run to summary lines.
  [ODF-380](findings/ODF-380.md) lost earlier failed-test identities from a
  bounded CI excerpt. They establish the risk of discarding decisive
  evidence through different mechanisms. [ODF-322](findings/ODF-322.md)
  explains why bounded command output still needs the continuation
  handle. [ODF-318](findings/ODF-318.md) independently supports limiting
  process fields to the owned diagnostic. This audit makes no claim of
  credential exposure.
- **Keep complete proof in worker hand-backs.**
  [ODF-314](findings/ODF-314.md) documents a return missing required proof
  rows, one of which caught a defect when completed.
  [ODF-481](findings/ODF-481.md) covers recording the same evidence for rows
  without independent proof. Compact reports can reduce duplicate text and
  refer to durable artifacts while retaining each material promise, its
  observation and any proof gap.

### Independent review, worker handoffs and context growth

- **Finding 3, same cost mechanism.** The two Doughnut checkpoint reviews
  quantify the fixed cost of fresh reviews on small accepted changes
  described by [ODF-141](findings/ODF-141.md). Both changes were records-only.
  [ODF-276](findings/ODF-276.md) documents the complementary risk of skipping
  a required independent pass without an applicable disposition. Their
  shared response already permits a recorded records-only or already-traced
  disposition under [the delivery rule](../../src/skills/dough-execute-plan/references/deliver-the-change.md).
  The useful refactors and successful proof checks in all three host audits
  limit the case for any broader exemption.
- **Finding 4 and C1, repeated discovery.** [ODF-454](findings/ODF-454.md)
  documents paying for a preliminary caller lookup and then independently
  requiring the implementer to repeat it. Cursor's full coordinator-skill
  read after a complete Task brief and Claude Code's startup floor differ
  from that caller lookup. They remain separate measured patterns.
  [ODF-377](findings/ODF-377.md) cautions against shortening a brief by
  omitting required examples. [ODF-374](findings/ODF-374.md) is a separate
  independence failure in which inherited implementation context changed
  what a source-only reviewer did. It sets a boundary when choosing whether
  to inherit context. The useful Codex recall specialists are a different
  role. [ODF-280](findings/ODF-280.md) shows why compact data handoffs still
  need recoverable inputs for reproduction.
- **Finding 5, context length.** [ODF-206](findings/ODF-206.md) and
  [ODF-260](findings/ODF-260.md) concern over-budget slices and failure to
  resplit a long execution. They support testing an earlier scope decision.
  They did not measure model context or establish a context threshold.
  Compaction, retained thinking and a fresh continuation still need a
  quality comparison with recoverable execution state.
- **C4, a repeated Task is a recovery question.**
  [ODF-229](findings/ODF-229.md) is specific to a Cursor implementation
  interruption that leaves edits without a proof return.
  [ODF-059](findings/ODF-059.md) covers a related interrupted handoff.
  C4 confirmed a repeated launch and a clean tree in both cases. Its
  records show neither edits left behind in the SEED-343 example nor a
  confirmed termination in the Pygardon example. Resume an existing owner
  when the retained checkout, proof and continuation make it safe. Keep the existing recovery and proof-acceptance safeguards.

### Host observations without an established catalog match

Cursor's repeated `GetDynamicTools` discovery, `TodoWrite` and Git-status
cadence, and the limits of its available usage telemetry remain observations
from its audit. A required status or proof check retains its execution
purpose. Claude Code's model and effort choices, cache pricing and rebuilds,
retained thinking, context settings, startup floor and native diagnostic
capabilities also stay with that host's evidence. The Codex ticket monitor,
the host-wide doctor warning and the raw worker-context distributions have
no established retrospective identity here. The cross-host measurements
can inform a later trial without converting these observations into catalog
findings.

## Evaluation candidates

Start where the logs show a clear mechanism and a change can preserve existing
proof. Use comparable workflows and specify the measurable gain and quality
conditions before a trial. Compare request counts, fresh input, cached input,
output, elapsed time, actual interventions and any extra retrieval or recovery
work. Include both coordinator and worker effort. Compare direct billing or
quota only when measurements can attribute the activity at useful resolution.
On Cursor, until native per-request usage exists, use relative metrics:
implementer first-tool distribution, skill Read counts, Task prompt bytes,
subagent transcript KB, TodoWrite and git-status call counts, and GetDynamicTools
rediscovery counts — alongside any host usage UI that can be attributed.
On Claude Code, include cache writes and their lifetime, rebuilds after idle
gaps, peak context per agent, and model and effort per role.
SEED-300 ran on all three hosts in this period, for different stories; a
later SEED-300-sized story is a natural cross-host comparison.

For waiting, verify that normal completion wakes the coordinator promptly,
overdue work gets a bounded check, actionable CI failures reach the existing
repair owner, and the correct revision still achieves terminal proof.
Include a paused supplier case where resumption depends on an explicit event.
For evidence output, verify that a sample retains the decisive assertion,
command handle, selected coverage and failed artifact without extra
retrieval. For records-only changes, check the same facts and unchanged
proof inputs. For changed worker context, verify the same source references,
domain coverage and independence and log both the raw and cache-adjusted
measures. Preserve explicit release and human decisions throughout.

**Cursor-first micro-trial (hypothesis only).** On the next Open Dough
execute-plan story on Cursor, add one sentence to every implement and finish
Task prompt: do not read `dough-execute-plan/SKILL.md`; this brief is complete.
Measure implementer first-tool distribution and subagent transcript KB against
this window’s 45/55 SKILL-first baseline. Change no proof or acceptance rule.
Optionally pair with once-per-session GetDynamicTools discovery and
phase-gated TodoWrite/status checks on the same story.

**Claude Code-first micro-trials (hypotheses only).** On the next comparable
Open Dough execute-plan story on Claude Code, change one thing at a time and
keep every proof and acceptance rule:

- Hand-backs return a verdict of a few hundred words plus the path to a full
  report retained under the job's temporary directory. Measure coordinator
  peak context and rebuild cost against this window's 7.8k-character median
  report.
- When a subagent expects a run longer than five minutes, the coordinator or
  the host's completion notification owns the wait. Measure subagent
  rebuilds against this window's 64 rebuilds after five-to-sixty-minute gaps.
- Refactor and review subagents run on Opus while the coordinator keeps the
  chosen model. Compare refactor edits made and review findings with this
  window's 88-of-113 refactor passes that edited.

Trial `autoCompactWindow` or a different coordinator model or effort only
after these, because they trade possible judgment loss for their gain.

Treat the observed costs as baselines and the improvement opportunities
as hypotheses until comparable work demonstrates lower effort at equivalent
quality. Use [ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md)
as the decision basis.
