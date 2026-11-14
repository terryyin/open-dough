# Usage and cost for dashboard tasks

November 14, 2026 · [Launch history](../../.planning/seeds/SEED-358-dashboard-launch-history.md),
[Codex](../../.planning/seeds/SEED-357-dashboard-task-token-usage.md),
[Claude Code](../../.planning/seeds/SEED-359-claude-code-task-token-usage.md), and
[Cursor](../../.planning/seeds/SEED-360-cursor-task-token-usage.md)

## What each existing launch can measure

### Codex CLI 0.169.0

The dashboard starts a thread and its first turn through the shared App Server.
It already records the thread and first-turn IDs. Its launch observer retires
after the first turn completes. `thread/tokenUsage/updated` carries the thread
and turn IDs, a running total, a last-usage breakdown, and the model context
window. The installed schema includes input, cached input, cache-write input,
output, reasoning output, and total tokens. The app uses these counters for
context display and can fill them to the context limit on an error. They can
support provisional usage display. For settled totals, read completed-response
records. The opt-in `PostModelRequest` hook can cross-check individual attempts,
including failures or cancellations when usage is available. [Dashboard launch](../../dashboard/server/hosts/codex/launch.ts),
[observer](../../dashboard/server/hosts/codex/conversation.ts),
[App Server events](https://learn.chatgpt.com/docs/app-server#turn-events),
[model request hooks](https://learn.chatgpt.com/docs/hooks#premodelrequest-and-postmodelrequest),
[release protocol](https://github.com/openai/codex/blob/rust-v0.169.0/codex-rs/protocol/src/protocol.rs#L2544-L2630).

The prior audit counted each owning thread and response ID once, excluding copied
fork history and duplicate compaction accounting. The retained A/B sample had
174 distinct responses, including 33 child requests. Use explicit thread and
turn lineage to assign workers. Rollout formats and retention vary by version.
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

### Claude Code 2.1.325

The dashboard starts `claude --bg` and resolves the short job ID to the full
Claude session UUID. Claude's opt-in OpenTelemetry `api_request` events can
provide the session and request IDs where available, actual model, effort,
uncached input, cache reads, cache writes, output, and estimated cost. From
`2.1.300` the event can report five-minute and one-hour cache writes separately.
A positive aggregate with zero in both splits can mean the split is unavailable.
API events carry native worker and parent IDs from `2.1.310` where available.
Beta trace spans can help link nested, resumed, or deferred work. Count request
usage once across these sources. Check trusted settings with a warm `--bg`
supervisor. Exporter variables in project settings are ignored. `/clear` changes
session IDs and resume can restart the per-process sequence.
[Dashboard listing](../../dashboard/server/hosts/claude/listing.ts),
[agent view](https://code.claude.com/docs/en/agent-view#list-sessions-as-json),
[request event](https://code.claude.com/docs/en/monitoring-usage#api-request-event),
[trace hierarchy](https://code.claude.com/docs/en/monitoring-usage#span-hierarchy),
[exporter configuration](https://code.claude.com/docs/en/monitoring-usage#administrator-configuration).

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

### Cursor CLI 2026.11.13-eacade1

The dashboard has the parent conversation UUID before the first prompt. The
installed CLI's interactive `afterAgentResponse` and `stop` hooks can report
overlapping parent-turn counters. Their input appears inclusive of cache reads
and writes. The worker path exposes lifecycle and an optional child UUID, with
no supported worker token total. Its live worker display is an estimate.
Headless mode and ACP provide no demonstrated worker coverage.
[Dashboard launcher](../../dashboard/server/hosts/cursor/launch.ts),
[Cursor hooks](https://cursor.com/docs/hooks#common-schema),
[Cursor release notes](https://prod.cursor.com/docs/release-notes),
[Cursor staff on worker usage](https://forum.cursor.com/t/how-to-obtain-token-usage-per-request/168317/11),
[November status](https://forum.cursor.com/t/expose-ide-task-subagent-token-usage-through-local-hooks/177193).

Keep the current launcher and collect one parent count per turn. On eligible
accounts, join Admin API usage rows to each observed child conversation ID.
Cursor staff report that child calls can appear under that separate ID. The ID
and token breakdown can be absent from individual rows. Check a real local run
with two workers, overlapping sessions and a late worker result before claiming
full coverage. Enterprise OpenTelemetry can help reconcile model-request rows,
and individual CSV exports can support manual checks. Neither establishes a
documented automatic local worker join for personal accounts. [API access](https://cursor.com/docs/api),
[usage events](https://cursor.com/docs/account/teams/admin-api#get-usage-events-data),
[Cursor staff on child IDs](https://forum.cursor.com/t/cursor-cli-omits-beforesubmitprompt-afteragentresponse-and-stop-hooks-loses-token-usage-and-emits-inconsistent-generation-id-values/169059/15),
[telemetry joins](https://cursor.com/docs/enterprise/opentelemetry-export#joining-sessions).

For new Cloud Agent launches, the usage API explicitly includes Task workers
and side chats. One cloud agent per dashboard task avoids per-run time-window
allocation of late worker usage. Self-Hosted Machines can keep tool execution on
a managed machine while Cursor runs the agent loop remotely. The local SDK
documents per-turn usage and gated billing lookup, with no documented worker
rollup for existing interactive CLI sessions. [Cloud Agents usage](https://cursor.com/docs/cloud-agent/api/endpoints#get-agent-usage),
[Self-Hosted Machines](https://cursor.com/docs/cloud-agent/self-hosted),
[SDK usage](https://cursor.com/docs/sdk/typescript#agentgetusage).

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

Compare workflows on the same goal, starting revision, and proof standard.
Account for warm caches, retries, workers, and human rescue before comparing
time, success rate, and total cost across attempts. This follows
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

The dashboard currently filters marked-done sessions after 30 days and removes
their launch records on a later write. Explicit removal can also delete a record.
SEED-358 makes launch and usage history permanent. Apply the 30 days to the
Recently done view and count. Retire terminal state, temporary host files, and
landing pins independently of historical data. Keep old history out of routine
native session lookups. [Current record store](../../dashboard/server/launchRecordDocument.ts),
[explicit removal](../../dashboard/server/launchRecordDeletion.ts),
[ADR 0008, Project dashboard domain and architecture](../adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state).

Today, returning a story to the backlog changes its queue entry. The dashboard
stores unfinished reports but keeps the session open. Automatic Done for a
tracked execution requires quiet completion, retained landing evidence, and
the story's absence from the published backlog. As a result, a returned story's
launch can be missing from Recently done while its record remains. Record a
confirmed early wrap-up against the launch ID and retain the distinct outcome.
Keep progress reports and queue moves insufficient on their own. [Reporting contract](../../dashboard/AGENT-LAUNCH-COMPLETION.md),
[closure gate](../../dashboard/server/completionClosure.ts).

Show task usage by model and coverage. Use zero when there is evidence of no
model calls. Usage can settle after the session is marked done.

## Checks on a small native sample

Use two concurrent dashboard launches in the same project, with a worker in one.
Restart, resume, cancel, and replay a duplicate and a late update. Include a blank
launch and unrelated native work. Check Codex descendant and fork attribution,
Claude's warm supervisor and reset, and Cursor's two hooks and child IDs. Follow
[ADR 0005, Native validation and A/B testing](../adrs/0005-cross-tool-validation-accepted.md).

Verify a 31-day-old session across a write, UI removal, and restart. It ages out
of the recent view and count and stays in usage history. An early return counts
as one finished launch, and a restart of the story gets its own usage history.

## Recovering earlier launches

A read-only check on November 14 matched native history for all 385 Codex and
629 Claude Code launches still in this machine's dashboard records. All 385
Codex roots contained an owned usage record for the first turn. Of 3,327 linked
Codex descendants, 3,325 had response usage with a root-turn ID. For Claude,
628 roots and all 2,803 linked worker transcripts had real response usage.
The remaining Claude transcript had only a synthetic assistant record. These
counts measure the presence of evidence. Full-task coverage still needs proof.

Import Codex response records by owning thread and response ID, following known
turns and descendants across active, archived, and compressed rollouts. Import
Claude usage by native session or worker and API message ID from its JSONL history.
Skip copied fork history and deduplicate overlap with live collection. Record
missing segments as gaps. If the dashboard record was pruned, recover it only
with independent evidence of the dashboard launch. [Codex rollout records](https://github.com/openai/codex/pull/41912),
[Claude session files](https://code.claude.com/docs/en/agent-sdk/sessions),
[local Claude audit](session-token-efficiency-research.md#claude-code-audit).
