# Usage and cost for dashboard tasks

November 14, 2026 · Research for [SEED-357](../../.planning/seeds/SEED-357-dashboard-task-token-usage.md#view-token-usage-for-dashboard-launched-tasks)

The dashboard can record the launch settings and identify the native session on
all three tools. Codex and Claude Code have documented telemetry for the way the
dashboard launches them. The installed Cursor CLI has interactive usage hooks
that merit a runtime check before promising coverage. Each tool reports tokens,
and those counts can use a shared accounting format. Their purchasing power
depends on the model, token category, and billing arrangement. For choosing a
tool, compare the cost of reaching the same verified outcome.

## What each existing launch can measure

The versions checked were Codex CLI `0.169.0`, Claude Code `2.1.325`, and Cursor
CLI `2026.11.13-eacade1`. Evidence comes from vendor documentation, dashboard
and CLI code, installed schemas, and retained audit data. Live coverage on new
dashboard launches remains to be verified.

### Codex

The dashboard starts a thread and its first turn through the shared App Server.
It already records the thread and first-turn IDs. Its launch observer retires
after the first turn completes. `thread/tokenUsage/updated` carries the thread
and turn IDs, a running total, a last-usage breakdown, and the model context
window. The installed schema includes input, cached input, cache-write input,
output, reasoning output, and total tokens. The app uses these counters for
context display and can fill them to the context limit on an error. They can
support provisional usage display. Use completed-response accounting for settled
totals. [Dashboard launch](../../dashboard/server/hosts/codex/launch.ts),
[observer](../../dashboard/server/hosts/codex/conversation.ts),
[App Server events](https://learn.chatgpt.com/docs/app-server#turn-events),
[release protocol](https://github.com/openai/codex/blob/rust-v0.169.0/codex-rs/protocol/src/protocol.rs#L2544-L2630).

The prior audit used local `token_usage_record` events and counted each owning
thread and response ID once. This excluded copied ancestor records in forks and
duplicate compaction accounting. A reaggregation of the retained A/B sample
found 174 distinct responses, including 33 child requests. The App Server
release has parent and ancestor thread filters and turn lineage fields. Use
those relationships where present. An attached thread or a matching worktree
path is insufficient evidence of child ownership. Rollout records are an
implementation surface, so their retention and schema need a versioned reader.
[Audit method](session-token-efficiency-research.md#codex-audit),
[rollout event](https://github.com/openai/codex/pull/41912),
[retained A/B usage](../../Distribution/tests/native-comparison/paused-supplier/comparisons/20261114T102744-1921-tokens.md),
[thread filters](https://github.com/openai/codex/blob/rust-v0.169.0/codex-rs/app-server-protocol/src/protocol/v2/thread.rs#L1524-L1543),
[turn lineage](https://github.com/openai/codex/blob/rust-v0.169.0/codex-rs/app-server-protocol/src/protocol/v2/thread_data.rs#L392-L425).

The release also has an optional thread result from `account/usage/read`. It can
include credit and USD estimates, backend-reported USD, and groups by model,
effort, and speed. The CLI surfaces it for eligible Business and Enterprise
workspaces and refreshes it after a turn for settlement. Check plan access,
timing, and child coverage before using it. A thread aggregate cannot allocate
two tasks on one thread. `codex exec --json` also reports a thread total and can
emit zero defaults if it receives no token event. [Thread usage schema](https://github.com/openai/codex/blob/rust-v0.169.0/codex-rs/app-server-protocol/src/protocol/v2/thread_usage.rs),
[eligibility and refresh](https://github.com/openai/codex/blob/rust-v0.169.0/codex-rs/tui/src/chatwidget/thread_usage.rs),
[exec result](https://github.com/openai/codex/blob/rust-v0.169.0/codex-rs/exec/src/event_processor_with_jsonl_output.rs#L512-L538).

### Claude Code

The dashboard starts `claude --bg` and resolves the short job ID to the full
Claude session UUID. Claude's opt-in OpenTelemetry `api_request` events can
provide the session and request IDs where available, actual model, effort,
uncached input, cache reads, cache writes, output, and estimated cost. From
`2.1.300` the event can report five-minute and one-hour cache writes separately.
A positive aggregate write count with zero in both splits means the split can
be unavailable. Test a local collector with an already-running Claude supervisor
to verify how it receives settings and whether a per-launch attribute survives.
Session IDs can change with `/clear`, and the per-process event sequence can
restart on resume. [Dashboard listing](../../dashboard/server/hosts/claude/listing.ts),
[agent view](https://code.claude.com/docs/en/agent-view#list-sessions-as-json),
[request event](https://code.claude.com/docs/en/monitoring-usage#api-request-event),
[event correlation](https://code.claude.com/docs/en/monitoring-usage#event-correlation-attributes),
[session hooks](https://code.claude.com/docs/en/hooks#sessionstart).

Local transcripts yielded per-message usage and worker files in the prior audit.
Count a message ID once because a response can appear as several transcript
records. The transcript format can change. Confirm visibility of subagents and
auxiliary work, including agent-view summaries, recaps, idle compaction, and
provider-side work. Claude's subagent-completion token count covers its final
request only. Other Claude sessions or processes need an explicit association.
[Local audit](session-token-efficiency-research.md#claude-code-audit),
[agent-view summaries](https://code.claude.com/docs/en/agent-view#cost-of-row-summaries),
[background token use](https://code.claude.com/docs/en/costs#background-token-usage),
[subagent event](https://code.claude.com/docs/en/monitoring-usage#subagent-completed-event).

`claude -p` and the Agent SDK offer a distinct launch surface. `-p` and `--bg`
cannot be combined. In SDK results, top-level `usage` covers the main loop's
current turn. `modelUsage` and `total_cost_usd` include workers and can restore
earlier session totals on resume or fork from `2.1.277`. Summing these snapshots
would count earlier work again. A crash can leave zero defaults, and assistant
messages supply only limited recovery evidence. [Headless usage](https://code.claude.com/docs/en/headless#basic-usage),
[SDK accounting](https://code.claude.com/docs/en/agent-sdk/cost-tracking).

### Cursor

The dashboard saves the conversation UUID from `create-chat` before sending its
first prompt to a held interactive `cursor-agent --resume` client. The retained
transcripts examined in the earlier audit lacked per-request usage. Static
inspection of the installed CLI found optional model, conversation and generation
IDs, and usage on the interactive `afterAgentResponse` and `stop` hooks. The
two hooks can report overlapping counters. Hook input appears inclusive of cache
reads and writes in this build. The public hook schema does not specify these
token fields. Verify both default and selected-model launches, the scope of
their hook delivery, and the child join. Cursor staff describe these hook counts
as parent-only. The installed CLI can relay an optional child conversation ID.
[Dashboard launcher](../../dashboard/server/hosts/cursor/launch.ts),
[Cursor hooks](https://cursor.com/docs/hooks#common-schema),
[Cursor staff on worker usage](https://forum.cursor.com/t/how-to-obtain-token-usage-per-request/168317/11).

The inspected CLI also emits headless model-call usage events and a terminal
result with overlapping totals when the backend supplies usage. Its headless
input field subtracts cache reads and writes. The terminal format docs omit
these usage fields. The Cursor SDK documents four disjoint token categories,
per-turn usage, and a cumulative result. It offers stable run identifiers and
`Agent.getUsage()` for billed usage. Local billed-usage access is account-gated.
Cloud runs have documented worker and side-chat behavior. Neither headless nor
the SDK is the dashboard's current interactive launch path. [CLI output](https://cursor.com/docs/cli/reference/output-format),
[SDK tokens](https://cursor.com/docs/sdk/typescript#token-usage),
[SDK billed usage](https://cursor.com/docs/sdk/typescript#agentgetusage).

Enterprise usage events have an optional conversation ID, model, billing type,
and `chargedCents`. Token-priced rows have a token breakdown. A conversation
join is stronger than matching by time and user, and still needs a task boundary
if the conversation contains multiple tasks. Enterprise OpenTelemetry export
can tie per-request logs to the local CLI UUID and support later corrections.
Aggregate metrics lack session IDs. Individual usage exports can support spot
checks. No documented personal billing API for attributing arbitrary CLI tasks
was found. [API access](https://cursor.com/docs/api),
[usage events](https://cursor.com/docs/account/teams/admin-api#get-usage-events-data),
[telemetry joins](https://cursor.com/docs/enterprise/opentelemetry-export#joining-sessions),
[individual export](https://forum.cursor.com/t/bring-back-optional-on-demand-usage/174831/12).

## Comparable usage and cost

Use disjoint categories for uncached input, cache reads, cache writes, and
output. Keep each raw value and its source. Inclusive input is the first
three categories together. Processed tokens are inclusive input plus output.
Where reported, reasoning is a subset of output. Keep cache-write lifetimes
and other separately metered activities when reported. Normalize each source's
definition before summing, and preserve unknown components. The common format
supports queries across sources. The tokenizer and effective input still depend
on the model and tool. Anthropic documents a tokenizer change that produces
roughly 30% more tokens for the same text, depending on the content. Counting
visible transcript text misses tool output, hidden context, and repeated inputs.
[OpenTelemetry conventions](https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/gen-ai-token-metrics.md),
[Claude's input mapping](https://code.claude.com/docs/en/monitoring-usage#map-input-tokens-to-opentelemetry-genai-semantic-conventions),
[tokenizer change](https://platform.claude.com/docs/en/build-with-claude/token-counting).

| Measure | Question it answers |
| --- | --- |
| Native tokens by category and model | How much traffic did this tool report, and where did it come from? |
| Estimated USD at a named and dated tariff | What would the observed usage cost under the stated pricing assumptions? |
| Vendor credits or quota usage | How much of a specific allowance did this task use, where the provider reports it? |
| Attributable charge in the billing currency | What did the provider actually charge for this task, when there is a billing record that can be joined? |
| Cost per verified outcome | Which workflow produced the same acceptable result for less, across comparable tasks and attempts? |

Calculate estimates at the smallest reliable observation level. Multiply each
bucket by the corresponding rate for the actual model, route, speed, cache
lifetime, and pricing date. Add independently metered charges where known.
Evaluate any long-context surcharge per request before aggregating. Estimate
only the priced portion when data is incomplete, and show what it covers. Keep
historic estimates reproducible when prices change. In the retained Codex pair,
processed tokens increased from 8.39M to 13.43M (+60.2%). Applying the published
GPT-6.1 Sol Standard credit rates to the observed uncached input, cached input,
and output gives 41.27 and 57.67 credit equivalents (+39.7%). These are modeled
values under one tariff. [Retained usage](../../Distribution/tests/native-comparison/paused-supplier/comparisons/20261114T102744-1921-tokens.md),
[Codex credit rates](https://learn.chatgpt.com/docs/pricing#token-rates),
[OpenAI API prices](https://developers.openai.com/api/docs/pricing),
[OpenAI cache pricing](https://developers.openai.com/api/docs/guides/prompt-caching),
[Claude pricing modifiers](https://platform.claude.com/docs/en/about-claude/pricing).

- **Codex.** Its signed-in credit rate card accounts for model, token category,
  and speed. It has no separate cache-write charge. Included consumption,
  enterprise USD terms, and API-key prices use their own rules. Some API models
  price cache writes by lifetime. [Codex rates](https://learn.chatgpt.com/docs/pricing#token-rates).
- **Claude Code.** Local dollars are estimates, including when managed pricing
  supplies the rates. Claude-plan allowance, paid overflow credits, Claude
  Console usage and third-party cloud bills are distinct. Provider cost APIs
  can reconcile account totals but do not document task IDs for ordinary local
  Claude Code jobs. [Costs](https://code.claude.com/docs/en/costs),
  [overflow credits](https://support.claude.com/en/articles/12429409-manage-usage-credits-for-paid-claude-plans),
  [API cost analytics](https://platform.claude.com/docs/en/manage-claude/usage-cost-analytics-api).
- **Cursor.** Routed model, negotiated or included allowance, discounts and fees
  can change spend. With your own API key, the model provider can bill separately.
  Billing items distinguish included and on-demand usage, credits and adjustments.
  Preserve those distinctions when joining a charge. [Cursor pricing](https://cursor.com/docs/models-and-pricing),
  [billing items](https://cursor.com/docs/account/teams/admin-api#get-billing-items),
  [telemetry wire reference](https://cursor.com/docs/enterprise/opentelemetry-export/wire).

Included usage may consume a scarce allowance with no incremental charge. Any
share of the monthly subscription assigned to a task depends on the chosen
allocation rule. A local tool timeout can also leave a server-side charge.
[Claude API billing](https://support.claude.com/en/articles/8977456-how-do-i-pay-for-my-claude-api-usage).

For comparing workflows, give both tools the same goal, starting revision and
proof standard. Decide how to handle warm caches, failures, retries, workers and
human rescue before measuring. Report time, success rate, and total cost across
attempts. A workflow that only looks cheap after dropping its failed attempts or
unknown workers has an incomplete cost comparison. This follows
[ADR 0010, Definition of improvement](../adrs/0010-definition-of-improvement-accepted.md).

## Dashboard ownership and task boundaries

Use the dashboard launch as the unit developers can look up. One story may have
many launches. One native conversation can span several turns, task phases or
assignments. Persist a dashboard launch ID and bind native session, turn, request
and child IDs as evidence arrives. Record both the settings requested at launch
and what the host actually ran, including model changes, routing, and different
worker models. A label such as `high` is a tool- and model-specific setting.
Keep retries of uncertain delivery tied to their launch and keep a deliberately
new attempt distinct. Preserve unattributed usage where a join is ambiguous.
[Launch request](../../dashboard/src/launchRequest.ts),
[session recording](../../dashboard/server/launchRecording.ts).

The dashboard already persists session metadata in a machine-local file and
expires marked-done records after 30 days. Define how long usage remains visible,
including after a session is deleted, a worktree disappears, or a story closes.
Keep metering as dashboard-owned local operational evidence under
[ADR 0008, Project dashboard domain and architecture](../adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state).
Persist identifiers, counters, collection timestamps, source and version, and
coverage. A usage record does not require copying prompts, transcripts, tool
output, credentials, or account email into dashboard storage.
[Current record store](../../dashboard/server/launchRecordDocument.ts).

Show usage by task and model alongside coverage and any supported price or
charge. A blank start with observed absence of calls can show zero. Flag gaps
from missing sources, workers or interrupted requests. Usage can settle after
the session is marked done.

## Checks on a small native sample

Use the same dashboard launch path users already use. Start a short task with one
worker and a second task concurrently in the same project. Capture native IDs and
compare an overlapping usage source where available. Resume or move the first
task across a dashboard restart, change its model if supported, and cancel a
turn after model work begins. Verify which activity is recorded and attributed,
which is visible only as partial, and which cannot be joined. Replay duplicate
events and simulate a late update to verify their effect on the persisted total.
Include a blank launch, a failed turn and an unrelated native session. For
Claude Code, include a warm supervisor and a reset. For Cursor, include default
and selected models, hook overlap and worker IDs. For Codex, compare live counters
with completed-response records and exercise a descendant and a fork. These
checks support the native proof expectations in
[ADR 0005, Native validation and A/B testing](../adrs/0005-cross-tool-validation-accepted.md).

Refinement needs to decide which follow-ups count toward the launch, what worker
coverage merits a complete label, and how long records survive session deletion.
Capture native usage first. Add estimates when model identity and rate inputs
are available, and reported charges when a billing record can be joined.
