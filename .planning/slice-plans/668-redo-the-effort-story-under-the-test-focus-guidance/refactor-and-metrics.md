# Slice 4 — first refactor and transcript measurements

This records observations only; slice 6 owns guidance judgments and G2.
Product/test ranges remain A `4b75c2888..eda73008b` and B
`c629d0d9..8b9005acc`. Completion learnings below come from A `c741f265f`
and B `57f805ee2`; the later A repair `0724558d6` is excluded.

## Recoverable sources and analysis

A root: `/Users/terryyin/.claude/projects/-Users-terryyin-git-open-dough--worktrees-show-and-keep-the-effort-a-claude-code-launch-ru/fa9d77b7-c44c-4f51-9e03-d7b0073a5c6e.jsonl`.
A children are in its sibling `fa9d77b7-…/subagents/` directory. Inspection
found **10 JSONL transcripts and 10 metadata files**, rather than 20 JSONL
transcripts. Nine children belong before execution completion; the tenth,
“Intent Coverage check”, begins 09:22:18.780 UTC during later wrap-up.

B root: `/Users/terryyin/.codex/sessions/2026/11/16/rollout-2026-11-16T21-26-52-01a1e48a-0078-76a1-929a-c853646f3acc.jsonl`.
Nine child paths/identities are preserved in
[b-codex-child-sessions.json](/Users/terryyin/open-dough-scratch/seed-391/b-codex-child-sessions.json).
All B threads record `gpt-6.1-sol` / `xhigh`, provider `openai`; A assistant
records name `claude-opus-5-5` / `medium`. Native records supply measurements;
the CLI event stream omits collaboration messages.

Raw extraction, per-thread intervals/usage and complete selected messages are
preserved outside the repository:
[parser](/Users/terryyin/open-dough-scratch/seed-391/analyze-refactor-metrics.py),
[results](/Users/terryyin/open-dough-scratch/seed-391/refactor-metrics-results.json),
[selected messages](/Users/terryyin/open-dough-scratch/seed-391/refactor-selected-excerpts.json),
[summary](/Users/terryyin/open-dough-scratch/seed-391/refactor-metrics-summary.txt).
Literal analysis commands (read-only source retrieval, no paid run):

```sh
python3 /Users/terryyin/open-dough-scratch/seed-391/analyze-refactor-metrics.py > /Users/terryyin/open-dough-scratch/seed-391/refactor-metrics-summary.txt
git show c741f265f:.planning/slice-plans/664-show-the-effort-a-launch-runs-with/PLAN.md
git -C /Users/terryyin/open-dough-scratch/seed-391/b-codex show 57f805ee2596619f80e007b9f2eff248cc5da112:.planning/slice-plans/664-show-the-effort-a-launch-runs-with/PLAN.md
```

Exact completion plans are additionally retained as scratch
`a-execution-complete-plan.md` and `b-execution-complete-plan.md`.
The [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
continues to apply; this observation starts no test, lint or formatter.

## First refactor brief

**A:** root line 338, 08:31:56.455 UTC; exact prompt also appears at line 1 of
`subagents/agent-a6c5d5ce3c484042a.jsonl`. Its changed-path paragraph says:

> Tests: exact Claude argv/record/kept-start expectations updated in backend
> `launches/`, `sessions/`, support helpers, and ~13 e2e specs.

This is a count of an e2e subset, **not an outside-subject test count**;
that count is absent. The coordinator supplied these possible remedies:

> Points worth your judgment: the feedback maintenance assertion was appended
> to an existing long test and its title prefixed ("a session started at Open
> Dough's default effort: …") — consider whether a cohesive placement/title is
> better; repeated `"--effort", "medium"` literals across many e2e specs —
> consider whether a shared expectation is warranted or the literals are clearer

**B:** delegation is verified at root line 472, 13:42:26.765 UTC, task
`refactor_1`, `fork_turns: none`, call `call_cb2d48b0a31949e0bd7d297e1a076e49`.
The persisted function argument's entire `message` is ciphertext. Child
`01a1e498-44d3-78a3-891f-9857d7b751dd` line 13 carries the matching
`encrypted_content`, with no plaintext brief. Therefore **the actual B brief,
its outside-subject count and remedy wording are unavailable from these
readable records**. No absence of a count/remedy is inferred from encryption.
The child's initial public commentary is not substituted for the brief.
Supported native `thread/read` also omits the prompt (root/child snapshots
are retained at `/tmp/seed-391-b-native-history.json` and
`/tmp/seed-391-b-refactor1-native-history.json`). G3 keeps the final
brief-guidance judgment with slice 6; no plaintext is inferred.

## Returned candidates and follow-ups

**A:** child line 123, 08:33:38.847 UTC, `SubagentHandback.input.message`:

> Outcome: I made two comment-only edits. Every other candidate I reviewed is
> already clean and needs no change. No accepted proof was invalidated and
> nothing was rerun.

It rewrapped headers in `agent-launch-ad-hoc-boundary.spec.ts` and
`agent-launch-model-boundary.spec.ts`. Its candidate dispositions were:

- Repeated effort literals: “kept as literals; no shared expectation added.”
  “Each exact-argv expectation documents the full `claude --bg` command”;
  “Changing the default should visibly update those documented commands.”
  “The values sit in tests that assert the argv, which the shotgun-surgery
  check accepts as touchpoints.”
- Feedback title/placement: retained; a move to e2e “would move the proof to a
  different, more expensive test file than the plan names”; a separate backend
  test “would repeat the whole server start.”
- `withDefaultEffort`, validation and comments: accepted as consistent; no dead
  code. `argv.slice(5)` in two e2e start-session specs: retained with the
  instruction length check. MakeMe/page objects: no setup/locator change needed.
- All changed files at most 250 lines. No rename, extraction, split or deletion.
  “Gaps and learnings: none.” **No named oversized follow-up returned.**

**B:** child line 258 final answer, duplicated to root line 694 at
13:50:16.862 UTC; exact final return is readable:

> Added `dashboard/tests/claudeLaunchCommand.ts`, a shared reader for recorded
> name, model, effort, and instruction.

It names nine backend launch specs: acceptance, ad-hoc-boundary, boundary,
model-boundary, options-boundary, options-groups, start-taken-refused, start,
and feedback-maintenance-launch. Its reasoning and dispositions:

> The shotgun-surgery and behavioral-documentation checks drove the edits:
> unrelated tests now observe their own promises without copying `medium` or
> depending on argv positions. The chosen-effort case retains exact argv and
> request equality; default story/ad hoc and feedback cases directly prove
> effort emission and storage. Acceptance supplies explicit `high` through
> MakeMe and still checks the exact retained request. Renamed the local
> `argvOf` reader to `instructionOf`; no external callers.

It reports no moved/split/deleted file or production subsystem change;
65 replacement tests and typecheck passed. Usage proof composes stored request,
retained-field copy and importer assertion. Its final disposition:

> No unresolved refactor gaps or follow-ups. UI obligations remain with slices
> 2–4 and Usage presentation with slice 3, as coordinator recorded.

**No named oversized follow-up returned.** B's intermediate child messages at
root lines 505, 588, 606 and 631, and coordinator replies in child lines 64,
175 and 254, are encrypted; their candidate wording cannot be quoted. The
Final returns supply the requested candidate dispositions; intermediate
private analysis is not needed for that promise. The absence of an oversized
candidate in either final return proves neither that
one existed nor that any edit was required. The retrospective's deferred
process review is separate from `refactor_1`'s follow-up disposition.

## Completion-plan learnings

A `c741f265f`, plan lines 122–128:

> Learning: the default is applied after the submitted and retained-attempt
> answers, so continuations keep their recorded request. Beyond the planned
> `launches/` consumers, about 20 specs in `backend-tests/sessions/`, shared
> support and `e2e/` assert exact Claude argv or kept starts; all were updated
> and run (backend `launches/` 374, `sessions/`+related 256, e2e 54 passed).
> Serial-mode files hid a second failure the scratch count missed. Active time
> about 21 minutes, over target on those mechanical consumers.

No named oversized refactor follow-up appears there. Its execution-complete
record says “Product advice: no change.” B `57f805ee2`, lines 183–184:

> Slice 1 refactor: shared `claudeLaunchCommand` reader; unrelated tests now
> observe their own facts. Independent review completed with no open follow-up.

B's later retrospective paragraph says process review remains selected and
deferred to wrap-up because existing assertions were rewritten. That was added
after the fourth code slice and is **not a returned first-refactor follow-up**.
Its execution-complete record also says “Product advice: no change”.

## Common time proxy — obligations 14–16

The [preselected definition](execution-context.md#measurement-decision-retained-before-analysis)
is per-thread elapsed minus the **union** of timestamped blocking tool-call →
result spans. Claude uses assistant `tool_use.id` and user `tool_use_id`;
Codex uses response-item function/custom calls and outputs joined by `call_id`.
Snapshots are not extra calls. All selected calls matched results. Children
use their own first/last timestamp; there are no inherited parent rows in B's
`fork_turns: none` children. Output is minutes rounded to two decimals.

A begins at original instruction line 9, 08:06:11.478 UTC, ends at line 897,
09:12:49.975 UTC: the accepted publication result for **c741's completion
record**. The subsequent CI completion wait, Intent Coverage, wrap-up and
landing are excluded. Automatic A retrospective at line 813 is inside this
record window. B uses the native process launch/terminal receipt,
13:26:51.431–14:41:15.440 UTC; native final task-complete is 0.841s earlier.

| Scope | Elapsed min | Blocking min | Active proxy min |
| --- | ---: | ---: | ---: |
| A coordinator through c741 record | 66.64 | 6.50 | 60.14 |
| A nine children, sum | 55.20 | 38.90 | 16.30 |
| B coordinator through terminal after 57f | 74.40 | 35.84 | 38.56 |
| B nine children, sum | 61.38 | 6.79 | 54.59 |
| B before extra retrospective | 71.44 | 35.81 | 35.64 |
| B extra retrospective 14:38:18.047–14:40:14.840 | 1.95 | 0.01 | 1.94 |
| B after retrospective through terminal | 1.01 | 0.03 | 0.98 |

The fourth-slice commit receipt is B root line 1531 at 14:38:13.622 UTC;
the before-retrospective row includes 4.425s between that receipt and review.
All nine B children ended before this extra window. Only eight plan lines
changed between `8b9005acc` and `57f805ee2`; G2 remains receiving slice 6.

These proxies include model/orchestration gaps and **asynchronous agent wait
between calls**; A's root spends substantial time that way. A tool returning a
running session ends that blocking span even while the process continues.
Thus elapsed minus tool time is not CPU, human work, or the participants'
self-reported active minutes (A first refactor claimed 8; B claimed 18).
Root/child clocks overlap and must not be added as wall time. Unknown idle
or human gaps cannot be reconstructed. Cross-host timing differences support
no guidance-only speed estimate. Actual comparable active-work minutes are
**unavailable** from these clocks; only the preselected orchestration proxy is measured.

## Provider usage and cost

A deduplicates assistant usage by `message.id`; repeated content blocks carry
the same usage (the parser retains the last record per ID). Selected data: 69 coordinator plus 194 child messages. Counts
below are tokens, **not millions**. Cache creation/read are separate input
buckets in Claude. Thinking is already inside output.

| A selected Opus usage | Coordinator | Nine children | Sum |
| --- | ---: | ---: | ---: |
| Uncached input | 149 | 392 | 541 |
| Output (including thinking) | 39,235 | 107,541 | 146,776 |
| Cache read | 9,944,664 | 15,769,493 | 25,714,157 |
| Cache write 5m | 0 | 573,504 | 573,504 |
| Cache write 1h | 183,956 | 0 | 183,956 |
| Thinking subset | 3,516 | 21,927 | 25,443 |
| Computed visible usage USD | $4.245877 | $8.173807 | **$12.419683** |

The supplied `claude-session-cost-analysis-facts.md` memory gives Opus rates
$/million: uncached input 4, output 20, read 0.20, write 5m 5 / 1h 8.
Actual `usage.cache_creation` TTL buckets account for every write; no fallback
TTL or Fable rate is needed. USD = (4×input + 20×output + .20×read +
5×write5m + 8×write1h) / 1,000,000. This is a **visible usage subtotal**.
A's only `cost-state`, final root line 1399, bills the whole later session:
$16.124189, including Opus $16.1108834 and Haiku $0.0133056. Full-file own
assistant usage across all ten children plus root computes $16.0481208 Opus;
it is $0.0627626 below the recorded Opus cost. Those extra/Haiku charges lack
selected-window timestamps in these records. **A's exact selected-window
billed total is unavailable**; the later final cost is not substituted or
added to child costs. All selected visible models have supplied known rates.

B sums own `token_usage_record.usage` once per `response_id`, then checks each
thread against its last cumulative record. All ten equal exactly. Root rows
contain only the root thread ID; none of its 205 response IDs are child usage.
Its cumulative receipt therefore excludes the nine children's own usage.
Cached input is a subset of input; reasoning is a subset of output.

| B recorded tokens | Coordinator | Nine children | Sum |
| --- | ---: | ---: | ---: |
| Input | 34,478,392 | 18,968,573 | 53,446,965 |
| Cached input subset | 34,255,616 | 18,216,960 | 52,472,576 |
| Output | 61,358 | 107,350 | 168,708 |
| Reasoning output subset | 31,764 | 35,549 | 67,313 |
| Total input + output | 34,539,750 | 19,075,923 | 53,615,673 |

B's extra retrospective allocates 746,715 input (739,200 cached), 2,068 output
(1,612 reasoning) to three own response records timestamped inside its window.
Before review: root 32,447,162 input / 56,312 output; after: 1,284,515 / 2,978.
Requests crossing a boundary are assigned by record timestamp, not prorated.
No provider USD charge/rate is recorded in inspected B native usage/terminal
receipts. **B cost: unavailable.** Pro plan/rate-limit credit balances are not
USD billing evidence. No Claude price, subscription allocation or zero-cost
assumption is applied. Token/cache semantics, hosts, model/effort, context,
publication and CI differ; these totals do not establish an effect size.
